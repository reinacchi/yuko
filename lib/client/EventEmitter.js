"use strict";

const { maybePromise, timeoutPromise } = require("../utils/Util");
const { TimeoutError } = require("../errors/DiscordErrors");

class EventEmitter {
    constructor() {
        this.waiting = [];
        this.listeners = [];
        this.strictListeners = {};
    }

    on(event, callback) {
        this.strictListeners[event] = callback
    }

    once(event, callback) {
        this.listeners.push({
            _id: this.listeners.length,
            event: event,
            callback: callback,
            _count: 1
        });
    }

    listen(event, callback) {
        this.listeners.push({
            _id: this.listeners.length,
            event: event,
            callback: callback
        })
    }

    getListenerByID(id) {
        return this.listeners.find(listener => listener._id == id);
    }

    removeListener(event, callback) {
        let found = this.listeners.find(l => l.event == event && l.callback == callback);
        if (!found) return;

        this.listeners.splice(this.listeners.indexOf(found), 1);
    }

    removeStrictListener(event) {
        delete this.strictListeners[event];
    }

    async emit(event, ...parameters) {
        let listeners = this.listeners.filter(listener => listener.event === event);
        if (!listeners) return;

        let strictListener = this.strictListeners[event];
        if (strictListener) await maybePromise(strictListener, ...parameters);

        for (let listener of listeners) {
            await maybePromise(listener.callback, ...parameters);
            if (listener._count) listener._count--;
        }

        this.listeners = this.listeners
            .filter(listener => (!listener._count) || (typeof listener._count === 'number' && listener._count > 0));
    }

    async *collect(event, { timeout, check, limit, suppress = true } = {}) {
        const stopAt = timeout ? (Date.now() + timeout) : null;
        let collected = 0;

        const stopCollecting = () => {
            if (stopAt && (Date.now() >= stopAt))
                return true;
            if (limit && (collected >= limit))
                return true; 
            return false;
        }

        while (true) {
            try {
                yield await timeoutPromise((
                    stopAt ? (
                        Math.max(0, stopAt - Date.now())
                    ) : -1 
                ), (resolve, reject) => {
                    if (stopCollecting()) {
                        reject(collected);
                        return;
                    }
            
                    const collect = (...args) => {
                        this.removeListener(event, collect);
                        if (check && !check(...args)) 
                            return;

                        if (stopCollecting())
                            reject(collected);

                        collected++;
                        resolve((args.length !== 1) ? args : args[0]);
                    }; 
        
                    this.listen(event, collect);
                }, () => new TimeoutError(`Collector timed out after ${timeout/1000} seconds.`));
            } catch (exc) {
                if (exc instanceof TimeoutError && suppress)
                    throw exc;
                break;
            }
        }
    }

    async waitFor(event, { check, timeout } = {}) {
        for await (let item of this.collect(event, { limit: 1, suppress: false, check, timeout })) {
            return item;
        }
    }
}

module.exports = EventEmitter;