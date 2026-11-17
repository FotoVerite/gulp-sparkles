"use strict";

import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { EventEmitter } from "node:events";

import sparkles from "../index.js";

describe("sparkles()", function () {
  describe("behavior on global", function () {
    let ee;
    const storeSymbol = Symbol.for("sparkles:store");
    const namespaceSymbol = Symbol.for("sparkles:namespace");

    beforeEach(function () {
      ee = sparkles();
    });

    afterEach(function () {
      ee.remove();
    });

    it("will attach the sparkles store namespace to global", function () {
      assert.ok(global[storeSymbol]);
    });

    it("will attach an event emitter to the sparkles store default namespace", function () {
      assert.ok(global[storeSymbol][namespaceSymbol] instanceof EventEmitter);
    });

    it("removes the event emitter from the store when remove is called", function () {
      ee.on("test", function () {});
      ee.remove();
      assert.strictEqual(global[storeSymbol][namespaceSymbol], undefined);
    });

    it("does not show up when enumerating the global object", function () {
      assert.strictEqual(Object.keys(global).includes(storeSymbol), false);
    });
  });

  it("should get the default emitter if namespace is not specified", function () {
    const ee = sparkles();
    assert.ok(ee instanceof EventEmitter);
    assert.strictEqual(sparkles(), ee);
  });

  it("should get an emitter for a specified namespace", function () {
    const ee = sparkles("ns1");
    assert.ok(ee instanceof EventEmitter);

    assert.notStrictEqual(sparkles(), ee);

    assert.strictEqual(sparkles("ns1"), ee);
    assert.notStrictEqual(sparkles("ns2"), ee);
  });

  it("should remove and re-create emitter in the store", function () {
    const ee0 = sparkles();
    const ee1 = sparkles("ns1");

    ee0.remove();
    assert.notStrictEqual(sparkles(), ee0);
    assert.strictEqual(sparkles("ns1"), ee1);

    ee1.remove();
    assert.notStrictEqual(sparkles("ns1"), ee1);
  });
});

describe("sparkles.exists()", function () {
  it("checks if a namespace has been defined", function () {
    assert.strictEqual(sparkles.exists("test"), false);
    const ee = sparkles("test");
    assert.strictEqual(sparkles.exists("test"), true);
    ee.remove();
    assert.strictEqual(sparkles.exists("test"), false);
  });
});

describe("namespace", function () {
  const storeSymbol = Symbol.for("sparkles:store");
  const namespaceSymbol = Symbol.for("sparkles:namespace");

  beforeEach(function () {
    global[storeSymbol] = {};
  });

  afterEach(function () {
    delete global[storeSymbol];
  });

  it("should use an EE from sparkles namespace if it already exists", function () {
    const ee = (global[storeSymbol][namespaceSymbol] = new EventEmitter());
    ee.custom = "ee";

    const emitter = sparkles();

    assert.strictEqual(emitter.custom, "ee");
  });

  it("should allow custom namespaces", function () {
    const ee = (global[storeSymbol].customNamespace = new EventEmitter());
    ee.custom = true;

    const emitter = sparkles("customNamespace");

    assert.strictEqual(emitter.custom, true);
  });
});
