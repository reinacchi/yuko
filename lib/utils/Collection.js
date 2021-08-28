"use strict";

const Base = require("../structures/Base");

/**
 * Represents a collection of a base object
 */
class Collection extends Map {
    constructor(...args) {
        super(...args);
    }

    /**
     * Adds objects to the set.
     * @param  {...any} objects The object(s) to add.
     */
    add(...objects) {
        for (const object of objects) {
            this.set(object.id, object);
        }
    }

    /**
     * Filters the set based on a function.
     * @see Array#filter
     * @param {function} predicate The filtering function to use. 
     * @returns {Array<Base>} An array of the filtered objects.
     */
    filter(predicate) {
        let passed = [];
        for (const value of this.values()) {
            if (predicate(value))
                passed.push(value);
        }
        return passed;
    }

    /**
     * Finds the first object in the set that meets the predicate, and returns it.
     * @see Array#find
     * @param {function} predicate The check function to use.
     * @returns {?Base} The object found, if any.
     */
    find(predicate) {
        for (const value of this.values()) {
            if (predicate(value))
                return value;
        }
    }

    map(predicate) {
        const arr = [];
        for (const value of this.values()) {
            arr.push(predicate(value));
        }
        return arr;
    }
}

module.exports = Collection;