"use strict";

import { EventEmitter } from "events";

const sparklesNamespace = "store@sparkles";
const defaultNamespace = "default";

class SparklesEmitter extends EventEmitter {
  #store;
  #namespace;

  constructor(store, namespace) {
    super();
    this.setMaxListeners(0);

    this.#store = store;
    this.#namespace = namespace;
  }

  remove() {
    this.removeAllListeners();
    delete this.#store[this.#namespace];
  }
}

function getStore() {
  let store = global[sparklesNamespace];

  if (!store) {
    Object.defineProperty(global, sparklesNamespace, {
      value: {},
      enumerable: false,
    });
    store = global[sparklesNamespace];
  }

  return store;
}

function getEmitter(namespace) {
  const store = getStore();

  namespace = namespace || defaultNamespace;

  let ee = store[namespace];

  if (!ee) {
    ee = store[namespace] = new SparklesEmitter(store, namespace);
  }

  return ee;
}

function exists(namespace) {
  const store = getStore();

  return !!store[namespace];
}

getEmitter.exists = exists;

export default getEmitter;
