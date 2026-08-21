var ys = Array.isArray, di = Array.prototype.indexOf, Lr = Array.prototype.includes, Gr = Array.from, fi = Object.defineProperty, Zn = Object.getOwnPropertyDescriptor, hi = Object.getOwnPropertyDescriptors, vi = Object.prototype, pi = Array.prototype, ha = Object.getPrototypeOf, Fs = Object.isExtensible;
const zr = () => {
};
function gi(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function va() {
  var e, t, n = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
function Zr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const s of e)
    if (n.push(s), n.length === t) break;
  return n;
}
const et = 2, er = 4, Kr = 8, pa = 1 << 24, Ut = 16, Ot = 32, fn = 64, os = 128, Ct = 512, $e = 1024, Ve = 2048, Gt = 4096, ft = 8192, St = 16384, ir = 32768, cs = 1 << 25, tr = 65536, Fr = 1 << 17, _i = 1 << 18, lr = 1 << 19, bi = 1 << 20, Zt = 1 << 25, Bn = 65536, Dr = 1 << 21, Qn = 1 << 22, An = 1 << 23, Fn = Symbol("$state"), mi = Symbol("legacy props"), wi = Symbol(""), ga = Symbol("attributes"), us = Symbol("class"), ds = Symbol("style"), fs = Symbol("text"), Sr = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), yi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function xi(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function ki() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Si(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Ei(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Ti() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Mi(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ai() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ri(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Pi() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ci() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Oi() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function zi() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Ni = 1, Ii = 2, _a = 4, Li = 8, Fi = 16, Di = 1, ji = 4, Hi = 8, Bi = 16, qi = 1, Ui = 2, Ke = Symbol("uninitialized"), Yi = "http://www.w3.org/1999/xhtml";
function Wi() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Gi() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ki() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ba(e) {
  return e === this.v;
}
function Xi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ma(e) {
  return !Xi(e, this.v);
}
let it = null;
function nr(e) {
  it = e;
}
function Et(e, t = !1, n) {
  it = {
    p: it,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      ge
    ),
    l: null
  };
}
function Tt(e) {
  var t = (
    /** @type {ComponentContext} */
    it
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var s of n)
      Da(s);
  }
  return e !== void 0 && (t.x = e), t.i = !0, it = t.p, e ?? /** @type {T} */
  {};
}
function wa() {
  return !0;
}
let Nn = [];
function ya() {
  var e = Nn;
  Nn = [], gi(e);
}
function un(e) {
  if (Nn.length === 0 && !mr) {
    var t = Nn;
    queueMicrotask(() => {
      t === Nn && ya();
    });
  }
  Nn.push(e);
}
function $i() {
  for (; Nn.length > 0; )
    ya();
}
function xa(e) {
  var t = ge;
  if (t === null)
    return be.f |= An, e;
  if ((t.f & ir) === 0 && (t.f & er) === 0)
    throw e;
  Tn(e, t);
}
function Tn(e, t) {
  if (!(t !== null && (t.f & St) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & os) !== 0) {
        if ((t.f & ir) === 0)
          throw e;
        try {
          t.b.error(e);
          return;
        } catch (n) {
          e = n;
        }
      }
      t = t.parent;
    }
    throw e;
  }
}
const Vi = -7169;
function Be(e, t) {
  e.f = e.f & Vi | t;
}
function xs(e) {
  (e.f & Ct) !== 0 || e.deps === null ? Be(e, $e) : Be(e, Gt);
}
function ka(e) {
  if (e !== null)
    for (const t of e)
      (t.f & et) === 0 || (t.f & Bn) === 0 || (t.f ^= Bn, ka(
        /** @type {Derived} */
        t.deps
      ));
}
function Sa(e, t, n) {
  (e.f & Ve) !== 0 ? t.add(e) : (e.f & Gt) !== 0 && n.add(e), ka(e.deps), Be(e, $e);
}
let Rr = !1;
function Ji(e) {
  var t = Rr;
  try {
    return Rr = !1, [e(), Rr];
  } finally {
    Rr = t;
  }
}
function Zi(e, t, n, s = !0) {
  s && n();
  for (var a of t)
    e.addEventListener(a, n);
  Xr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function or(e) {
  var t = be, n = ge;
  zt(null), en(null);
  try {
    return e();
  } finally {
    zt(t), en(n);
  }
}
function Qi(e) {
  let t = 0, n = qn(0), s;
  return () => {
    Ts() && (r(n), ja(() => (t === 0 && (s = qt(() => e(() => wr(n)))), t += 1, () => {
      un(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, wr(n));
      });
    })));
  };
}
var el = tr | lr;
function tl(e, t, n, s) {
  new nl(e, t, n, s);
}
class nl {
  /** @type {Boundary | null} */
  parent;
  is_pending = !1;
  /**
   * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
   * Inherited from parent boundary, or defaults to identity.
   * @type {(error: unknown) => unknown}
   */
  transform_error;
  /** @type {TemplateNode} */
  #e;
  /** @type {TemplateNode | null} */
  #r = null;
  /** @type {BoundaryProps} */
  #t;
  /** @type {((anchor: Node) => void)} */
  #l;
  /** @type {Effect} */
  #s;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #o = null;
  /** @type {DocumentFragment | null} */
  #a = null;
  #p = 0;
  #c = 0;
  #u = !1;
  /** @type {Set<Effect>} */
  #f = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #g = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #d = null;
  #b = Qi(() => (this.#d = qn(this.#p), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, s, a) {
    this.#e = t, this.#t = n, this.#l = (i) => {
      var l = (
        /** @type {Effect} */
        ge
      );
      l.b = this, l.f |= os, s(i);
    }, this.parent = /** @type {Effect} */
    ge.b, this.transform_error = a ?? this.parent?.transform_error ?? ((i) => i), this.#s = As(() => {
      this.#h();
    }, el);
  }
  #_() {
    try {
      this.#i = Pt(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#t.failed, { reset: s, invoke_onerror: a } = this.#m(t);
    un(a), n && (this.#o = Pt(() => {
      n(
        this.#e,
        () => t,
        () => s
      );
    }));
  }
  /**
   * Creates the `reset` function for a failed boundary, along with a function
   * that invokes `onerror` with it (if provided)
   * @param {unknown} error
   * @returns {{ reset: () => void, invoke_onerror: () => void }}
   */
  #m(t) {
    var n = !1, s = !1;
    const a = () => {
      if (n) {
        Ki();
        return;
      }
      n = !0, s && zi(), this.#o !== null && jn(this.#o, () => {
        this.#o = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: a, invoke_onerror: () => {
      try {
        s = !0, this.#t.onerror?.(t, a), s = !1;
      } catch (l) {
        Tn(l, this.#s && this.#s.parent);
      }
    } };
  }
  #x() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#n = Pt(() => t(this.#e)), un(() => {
      var n = this.#a = document.createDocumentFragment(), s = dn();
      n.append(s), this.#i = this.#v(() => Pt(() => this.#l(s))), this.#c === 0 && (this.#e.before(n), this.#a = null, jn(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        ye
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#p = 0, this.#i = Pt(() => {
        this.#l(this.#e);
      }), this.#c > 0) {
        var t = this.#a = document.createDocumentFragment();
        Ps(this.#i, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#n = Pt(() => n(this.#e));
      } else
        this.#w(
          /** @type {Batch} */
          ye
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #w(t) {
    this.is_pending = !1, t.transfer_effects(this.#f, this.#g);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Sa(t, this.#f, this.#g);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#t.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #v(t) {
    var n = ge, s = be, a = it;
    en(this.#s), zt(this.#s), nr(this.#s.ctx);
    try {
      return Pn.ensure(), t();
    } catch (i) {
      return xa(i), null;
    } finally {
      en(n), zt(s), nr(a);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #k(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#k(t, n);
      return;
    }
    this.#c += t, this.#c === 0 && (this.#w(n), this.#n && jn(this.#n, () => {
      this.#n = null;
    }), this.#a && (this.#e.before(this.#a), this.#a = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#k(t, n), this.#p += t, !(!this.#d || this.#u) && (this.#u = !0, un(() => {
      this.#u = !1, this.#d && rr(this.#d, this.#p);
    }));
  }
  get_effect_pending() {
    return this.#b(), r(
      /** @type {Source<number>} */
      this.#d
    );
  }
  /** @param {unknown} error */
  error(t) {
    if (!this.#t.onerror && !this.#t.failed)
      throw t;
    ye?.is_fork ? (this.#i && ye.skip_effect(this.#i), this.#n && ye.skip_effect(this.#n), this.#o && ye.skip_effect(this.#o), ye.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#i && (wt(this.#i), this.#i = null), this.#n && (wt(this.#n), this.#n = null), this.#o && (wt(this.#o), this.#o = null);
    let n = this.#t.failed;
    const s = (a) => {
      const { reset: i, invoke_onerror: l } = this.#m(a);
      l(), n && (this.#o = this.#v(() => {
        try {
          return Pt(() => {
            var c = (
              /** @type {Effect} */
              ge
            );
            c.b = this, c.f |= os, n(
              this.#e,
              () => a,
              () => i
            );
          });
        } catch (c) {
          return Tn(
            c,
            /** @type {Effect} */
            this.#s.parent
          ), null;
        }
      }));
    };
    un(() => {
      var a;
      try {
        a = this.transform_error(t);
      } catch (i) {
        Tn(i, this.#s && this.#s.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof /** @type {any} */
      a.then == "function" ? a.then(
        s,
        /** @param {unknown} e */
        (i) => Tn(i, this.#s && this.#s.parent)
      ) : s(a);
    });
  }
}
function rl(e, t, n, s) {
  const a = yr;
  var i = e.filter((h) => !h.settled), l = t.map(a);
  if (n.length === 0 && i.length === 0) {
    s(l);
    return;
  }
  var c = (
    /** @type {Effect} */
    ge
  ), o = sl(), f = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function g(h) {
    if ((c.f & St) === 0) {
      o();
      try {
        s([...l, ...h]);
      } catch (w) {
        Tn(w, c);
      }
      jr();
    }
  }
  var m = Ea();
  if (n.length === 0) {
    f.then(() => g([])).finally(m);
    return;
  }
  function _() {
    Promise.all(n.map((h) => /* @__PURE__ */ al(h))).then(g).catch((h) => Tn(h, c)).finally(m);
  }
  f ? f.then(() => {
    o(), _(), jr();
  }) : _();
}
function sl() {
  var e = (
    /** @type {Effect} */
    ge
  ), t = be, n = it, s = (
    /** @type {Batch} */
    ye
  );
  return function(i = !0) {
    en(e), zt(t), nr(n), i && (e.f & St) === 0 && (s?.activate(), s?.apply());
  };
}
function jr(e = !0) {
  en(null), zt(null), nr(null), e && ye?.deactivate();
}
function Ea() {
  var e = (
    /** @type {Effect} */
    ge
  ), t = e.b, n = (
    /** @type {Batch} */
    ye
  ), s = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(s, e), () => {
    t?.update_pending_count(-1, n), n.decrement(s, e);
  };
}
// @__NO_SIDE_EFFECTS__
function yr(e) {
  var t = et | Ve;
  return ge !== null && (ge.f |= lr), {
    ctx: it,
    deps: null,
    effects: null,
    equals: ba,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Ke
    ),
    wv: 0,
    parent: ge,
    ac: null
  };
}
const vr = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function al(e, t, n) {
  let s = (
    /** @type {Effect | null} */
    ge
  );
  s === null && ki();
  var a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = qn(
    /** @type {V} */
    Ke
  ), l = !be, c = /* @__PURE__ */ new Set();
  return yl(() => {
    var o = (
      /** @type {Effect} */
      ge
    ), f = va();
    a = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, (h) => {
        h !== Sr && f.reject(h);
      }).finally(jr);
    } catch (h) {
      f.reject(h), jr();
    }
    var g = (
      /** @type {Batch} */
      ye
    );
    if (l) {
      if ((o.f & ir) !== 0)
        var m = Ea();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        s.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(vr);
      else
        for (const h of c.values())
          h.reject(vr);
      c.add(f), g.async_deriveds.set(o, f);
    }
    const _ = (h, w = void 0) => {
      m?.(), c.delete(f), w !== vr && (g.activate(), w ? (i.f |= An, rr(i, w)) : ((i.f & An) !== 0 && (i.f ^= An), rr(i, h)), g.deactivate());
    };
    f.promise.then(_, (h) => _(null, h || "unknown"));
  }), Xr(() => {
    for (const o of c)
      o.reject(vr);
  }), new Promise((o) => {
    function f(g) {
      function m() {
        g === a ? o(i) : f(a);
      }
      g.then(m, m);
    }
    f(a);
  });
}
// @__NO_SIDE_EFFECTS__
function ie(e) {
  const t = /* @__PURE__ */ yr(e);
  return Ya(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ta(e) {
  const t = /* @__PURE__ */ yr(e);
  return t.equals = ma, t;
}
function il(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      wt(
        /** @type {Effect} */
        t[n]
      );
  }
}
function ks(e) {
  var t, n = ge, s = e.parent;
  if (!hn && s !== null && e.v !== Ke && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (s.f & (St | ft)) !== 0)
    return Wi(), e.v;
  en(s);
  try {
    e.f &= ~Bn, il(e), t = Xa(e);
  } finally {
    en(n);
  }
  return t;
}
function Ma(e) {
  var t = ks(e);
  if (!e.equals(t) && (e.wv = Ga(), (!ye?.is_fork || e.deps === null) && (ye !== null ? (ye.capture(e, t, !0), hs?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Be(e, $e);
    return;
  }
  hn || (Yt !== null ? (Ts() || ye?.is_fork) && Yt.set(e, t) : xs(e));
}
function ll(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && or(() => {
        t.ac.abort(Sr), t.ac = null;
      }), t.fn !== null && (t.teardown = zr), xr(t, 0), Rs(t));
}
function Aa(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && sr(t);
}
let Qr = null, Kn = null, ye = null, hs = null, Yt = null, vs = null, mr = !1, es = !1, Vn = null, Nr = null;
var Ds = 0;
let ol = 1;
class Pn {
  id = ol++;
  /** True as soon as `#process` was called */
  #e = !1;
  linked = !0;
  /** @type {Batch | null} */
  #r = null;
  /** @type {Batch | null} */
  #t = null;
  /** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
  async_deriveds = /* @__PURE__ */ new Map();
  /**
   * The current values of any signals that are updated in this batch.
   * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Value, [any, boolean]>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Value, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<(batch: Batch) => void>}
   */
  #l = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #s = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #i = 0;
  /**
   * Async effects that are currently in flight, _not_ inside a pending boundary
   * @type {Map<Effect, number>}
   */
  #n = /* @__PURE__ */ new Map();
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #o = null;
  /**
   * The root effects that need to be flushed
   * @type {Effect[]}
   */
  #a = [];
  /**
   * Effects created while this batch was active.
   * @type {Effect[]}
   */
  #p = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #c = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #u = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #f = /* @__PURE__ */ new Map();
  /**
   * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
   * @type {Set<Effect>}
   */
  #g = /* @__PURE__ */ new Set();
  is_fork = !1;
  #d = !1;
  constructor() {
    Kn === null ? Qr = Kn = this : (Kn.#t = this, this.#r = Kn), Kn = this;
  }
  #b() {
    if (this.is_fork) return !0;
    for (const s of this.#n.keys()) {
      for (var t = s, n = !1; t.parent !== null; ) {
        if (this.#f.has(t)) {
          n = !0;
          break;
        }
        t = t.parent;
      }
      if (!n)
        return !0;
    }
    return !1;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    this.#f.has(t) || this.#f.set(t, { d: [], m: [] }), this.#g.delete(t);
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   * @param {(e: Effect) => void} callback
   */
  unskip_effect(t, n = (s) => this.schedule(s)) {
    var s = this.#f.get(t);
    if (s) {
      this.#f.delete(t);
      for (var a of s.d)
        Be(a, Ve), n(a);
      for (a of s.m)
        Be(a, Gt), n(a);
    }
    this.#g.add(t);
  }
  #_() {
    this.#e = !0, Ds++ > 1e3 && (this.#v(), ul());
    for (const o of this.#c)
      this.#u.delete(o), Be(o, Ve), this.schedule(o);
    for (const o of this.#u)
      Be(o, Gt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Vn = [], s = [], a = Nr = [];
    for (const o of t)
      try {
        this.#y(o, n, s);
      } catch (f) {
        throw Ca(o), this.#b() || this.discard(), f;
      }
    if (ye = null, a.length > 0) {
      var i = Pn.ensure();
      for (const o of a)
        i.schedule(o);
    }
    if (Vn = null, Nr = null, this.#b()) {
      this.#h(s), this.#h(n);
      for (const [o, f] of this.#f)
        Pa(o, f);
      a.length > 0 && /** @type {unknown} */
      ye.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(s), this.#h(n), l.#x(this);
      return;
    }
    this.#c.clear(), this.#u.clear();
    for (const o of this.#l) o(this);
    this.#l.clear(), hs = this, js(s), js(n), hs = null, this.#o?.resolve();
    var c = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      ye
    );
    if (this.#i === 0 && (this.#a.length === 0 || c !== null) && this.#v(), this.#a.length > 0)
      if (c !== null) {
        const o = c;
        o.#a.push(...this.#a.filter((f) => !o.#a.includes(f)));
      } else
        c = this;
    c !== null && c.#_();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #y(t, n, s) {
    t.f ^= $e;
    for (var a = t.first; a !== null; ) {
      var i = a.f, l = (i & (Ot | fn)) !== 0, c = l && (i & $e) !== 0, o = c || (i & ft) !== 0 || this.#f.has(a);
      if (!o && a.fn !== null) {
        l ? a.f ^= $e : (i & er) !== 0 ? n.push(a) : Tr(a) && ((i & Ut) !== 0 && this.#u.add(a), sr(a));
        var f = a.first;
        if (f !== null) {
          a = f;
          continue;
        }
      }
      for (; a !== null; ) {
        var g = a.next;
        if (g !== null) {
          a = g;
          break;
        }
        a = a.parent;
      }
    }
  }
  #m() {
    for (var t = this.#r; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, s]] of this.current)
          if (t.current.has(n) && !s)
            return t;
      }
      t = t.#r;
    }
    return null;
  }
  /**
   * @param {Batch} batch
   */
  #x(t) {
    for (const [s, a] of t.current)
      !this.previous.has(s) && t.previous.has(s) && this.previous.set(s, t.previous.get(s)), this.current.set(s, a);
    for (const [s, a] of t.async_deriveds) {
      const i = this.async_deriveds.get(s);
      i && a.promise.then(i.resolve).catch(i.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#c, t.#u);
    const n = (s) => {
      var a = s.reactions;
      if (a !== null && !((s.f & et) !== 0 && (s.f & (Ve | Gt)) === 0))
        for (const c of a) {
          var i = c.f;
          if ((i & et) !== 0)
            n(
              /** @type {Derived} */
              c
            );
          else {
            var l = (
              /** @type {Effect} */
              c
            );
            i & (Qn | Ut) && !this.async_deriveds.has(l) && (this.#u.delete(l), Be(l, Ve), this.schedule(l));
          }
        }
    };
    for (const s of this.current.keys())
      n(s);
    this.oncommit(() => t.discard()), t.#v(), ye = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      Sa(t[n], this.#c, this.#u);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, s = !1) {
    t.v !== Ke && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & An) === 0 && (this.current.set(t, [n, s]), Yt?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    ye = this;
  }
  deactivate() {
    ye = null, Yt = null;
  }
  flush() {
    try {
      es = !0, ye = this, this.#_();
    } finally {
      Ds = 0, vs = null, Vn = null, Nr = null, es = !1, ye = null, Yt = null, Dn.clear();
    }
  }
  discard() {
    for (const t of this.#s) t(this);
    this.#s.clear();
    for (const t of this.async_deriveds.values())
      t.reject(vr);
    this.#v(), this.#o?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let m = Qr; m !== null; m = m.#t) {
      var t = m.id < this.id, n = [];
      for (const [_, [h, w]] of this.current) {
        if (m.current.has(_)) {
          var s = (
            /** @type {[any, boolean]} */
            m.current.get(_)[0]
          );
          if (t && h !== s)
            m.current.set(_, [h, w]);
          else
            continue;
        }
        n.push(_);
      }
      if (t)
        for (const [_, h] of this.async_deriveds) {
          const w = m.async_deriveds.get(_);
          w && h.promise.then(w.resolve).catch(w.reject);
        }
      var a = [...m.current.keys()].filter(
        (_) => !/** @type {[any, boolean]} */
        m.current.get(_)[1]
      );
      if (!(!m.#e || a.length === 0)) {
        var i = a.filter((_) => !this.current.has(_));
        if (i.length === 0)
          t && m.discard();
        else if (n.length > 0) {
          if (t)
            for (const _ of this.#g)
              m.unskip_effect(_, (h) => {
                (h.f & (Ut | Qn)) !== 0 ? m.schedule(h) : m.#h([h]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
          for (var o of n)
            Ra(o, i, l, c);
          c = /* @__PURE__ */ new Map();
          var f = [...m.current].filter(([_, h]) => {
            const w = this.current.get(_);
            return w ? w[0] !== h[0] || w[1] !== h[1] : !0;
          }).map(([_]) => _);
          if (f.length > 0)
            for (const _ of this.#p)
              (_.f & (St | ft | Fr)) === 0 && Ss(_, f, c) && ((_.f & (Qn | Ut)) !== 0 ? (Be(_, Ve), m.schedule(_)) : m.#c.add(_));
          if (m.#a.length > 0 && !m.#d) {
            m.apply();
            for (var g of m.#a)
              m.#y(g, [], []);
            m.#a = [];
          }
          m.deactivate();
        }
      }
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    if (this.#i += 1, t) {
      let s = this.#n.get(n) ?? 0;
      this.#n.set(n, s + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  decrement(t, n) {
    if (this.#i -= 1, t) {
      let s = this.#n.get(n) ?? 0;
      s === 1 ? this.#n.delete(n) : this.#n.set(n, s - 1);
    }
    this.#d || (this.#d = !0, un(() => {
      this.#d = !1, this.linked && this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const s of t)
      this.#c.add(s);
    for (const s of n)
      this.#u.add(s);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#l.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#s.add(t);
  }
  settled() {
    return (this.#o ??= va()).promise;
  }
  static ensure() {
    if (ye === null) {
      const t = ye = new Pn();
      !es && !mr && un(() => {
        t.#e || t.flush();
      });
    }
    return ye;
  }
  apply() {
    {
      Yt = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (vs = t, t.b?.is_pending && (t.f & (er | Kr | pa)) !== 0 && (t.f & ir) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var s = n.f;
      if (Vn !== null && n === ge && (be === null || (be.f & et) === 0))
        return;
      if ((s & (fn | Ot)) !== 0) {
        if ((s & $e) === 0)
          return;
        n.f ^= $e;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#r, n = this.#t;
      t === null ? Qr = n : t.#t = n, n === null ? Kn = t : n.#r = t, this.linked = !1;
    }
  }
}
function cl(e) {
  var t = mr;
  mr = !0;
  try {
    for (var n; ; ) {
      if ($i(), ye === null)
        return (
          /** @type {T} */
          n
        );
      ye.flush();
    }
  } finally {
    mr = t;
  }
}
function ul() {
  try {
    Ai();
  } catch (e) {
    Tn(e, vs);
  }
}
let cn = null;
function js(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var s = e[n++];
      if ((s.f & (St | ft)) === 0 && Tr(s) && (cn = /* @__PURE__ */ new Set(), sr(s), s.deps === null && s.first === null && s.nodes === null && s.teardown === null && s.ac === null && Ba(s), cn?.size > 0)) {
        Dn.clear();
        for (const a of cn) {
          if ((a.f & (St | ft)) !== 0) continue;
          const i = [a];
          let l = a.parent;
          for (; l !== null; )
            cn.has(l) && (cn.delete(l), i.push(l)), l = l.parent;
          for (let c = i.length - 1; c >= 0; c--) {
            const o = i[c];
            (o.f & (St | ft)) === 0 && sr(o);
          }
        }
        cn.clear();
      }
    }
    cn = null;
  }
}
function Ra(e, t, n, s) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const i = a.f;
      (i & et) !== 0 ? Ra(
        /** @type {Derived} */
        a,
        t,
        n,
        s
      ) : (i & (Qn | Ut)) !== 0 && (i & Ve) === 0 && Ss(a, t, s) && (Be(a, Ve), Es(
        /** @type {Effect} */
        a
      ));
    }
}
function Ss(e, t, n) {
  const s = n.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (Lr.call(t, a))
        return !0;
      if ((a.f & et) !== 0 && Ss(
        /** @type {Derived} */
        a,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          a,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function Es(e) {
  ye.schedule(e);
}
function Pa(e, t) {
  if (!((e.f & Ot) !== 0 && (e.f & $e) !== 0)) {
    (e.f & Ve) !== 0 ? t.d.push(e) : (e.f & Gt) !== 0 && t.m.push(e), Be(e, $e);
    for (var n = e.first; n !== null; )
      Pa(n, t), n = n.next;
  }
}
function Ca(e) {
  Be(e, $e);
  for (var t = e.first; t !== null; )
    Ca(t), t = t.next;
}
let Hr = /* @__PURE__ */ new Set();
const Dn = /* @__PURE__ */ new Map();
let Oa = !1;
function qn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ba,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function $(e, t) {
  const n = qn(e);
  return Ya(n), n;
}
// @__NO_SIDE_EFFECTS__
function dl(e, t = !1, n = !0) {
  const s = qn(e);
  return t || (s.equals = ma), s;
}
function S(e, t, n = !1) {
  be !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Wt || (be.f & Fr) !== 0) && wa() && (be.f & (et | Ut | Qn | Fr)) !== 0 && (Qt === null || !Qt.has(e)) && Oi();
  let s = n ? De(t) : t;
  return rr(e, s, Nr);
}
function rr(e, t, n = null) {
  if (!e.equals(t)) {
    Dn.set(e, hn ? t : e.v);
    var s = Pn.ensure();
    if (s.capture(e, t), (e.f & et) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & Ve) !== 0 && ks(a), Yt === null && xs(a);
    }
    e.wv = Ga(), za(e, Ve, n), ge !== null && (ge.f & $e) !== 0 && (ge.f & (Ot | fn)) === 0 && (Rt === null ? Sl([e]) : Rt.push(e)), !s.is_fork && Hr.size > 0 && !Oa && fl();
  }
  return t;
}
function fl() {
  Oa = !1;
  for (const e of Hr) {
    (e.f & $e) !== 0 && Be(e, Gt);
    let t;
    try {
      t = Tr(e);
    } catch {
      t = !0;
    }
    t && sr(e);
  }
  Hr.clear();
}
function hl(e, t = 1) {
  var n = r(e), s = t === 1 ? n++ : n--;
  return S(e, n), s;
}
function wr(e) {
  S(e, e.v + 1);
}
function za(e, t, n) {
  var s = e.reactions;
  if (s !== null)
    for (var a = s.length, i = 0; i < a; i++) {
      var l = s[i], c = l.f, o = (c & Ve) === 0;
      if (o && Be(l, t), (c & Fr) !== 0)
        Hr.add(
          /** @type {Effect} */
          l
        );
      else if ((c & et) !== 0) {
        var f = (
          /** @type {Derived} */
          l
        );
        Yt?.delete(f), (c & Bn) === 0 && (c & Ct && (ge === null || (ge.f & Dr) === 0) && (l.f |= Bn), za(f, Gt, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (c & Ut) !== 0 && cn !== null && cn.add(g), n !== null ? n.push(g) : Es(g);
      }
    }
}
function De(e) {
  if (typeof e != "object" || e === null || Fn in e)
    return e;
  const t = ha(e);
  if (t !== vi && t !== pi)
    return e;
  var n = /* @__PURE__ */ new Map(), s = ys(e), a = /* @__PURE__ */ $(0), i = Hn, l = (c) => {
    if (Hn === i)
      return c();
    var o = be, f = Hn;
    zt(null), qs(i);
    var g = c();
    return zt(o), qs(f), g;
  };
  return s && n.set("length", /* @__PURE__ */ $(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, o, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Pi();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var m = /* @__PURE__ */ $(f.value);
          return n.set(o, m), m;
        }) : S(g, f.value, !0), !0;
      },
      deleteProperty(c, o) {
        var f = n.get(o);
        if (f === void 0) {
          if (o in c) {
            const g = l(() => /* @__PURE__ */ $(Ke));
            n.set(o, g), wr(a);
          }
        } else
          S(f, Ke), wr(a);
        return !0;
      },
      get(c, o, f) {
        if (o === Fn)
          return e;
        var g = n.get(o), m = o in c;
        if (g === void 0 && (!m || Zn(c, o)?.writable) && (g = l(() => {
          var h = De(m ? c[o] : Ke), w = /* @__PURE__ */ $(h);
          return w;
        }), n.set(o, g)), g !== void 0) {
          var _ = r(g);
          return _ === Ke ? void 0 : _;
        }
        return Reflect.get(c, o, f);
      },
      getOwnPropertyDescriptor(c, o) {
        var f = Reflect.getOwnPropertyDescriptor(c, o);
        if (f && "value" in f) {
          var g = n.get(o);
          g && (f.value = r(g));
        } else if (f === void 0) {
          var m = n.get(o), _ = m?.v;
          if (m !== void 0 && _ !== Ke)
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return f;
      },
      has(c, o) {
        if (o === Fn)
          return !0;
        var f = n.get(o), g = f !== void 0 && f.v !== Ke || Reflect.has(c, o);
        if (f !== void 0 || ge !== null && (!g || Zn(c, o)?.writable)) {
          f === void 0 && (f = l(() => {
            var _ = g ? De(c[o]) : Ke, h = /* @__PURE__ */ $(_);
            return h;
          }), n.set(o, f));
          var m = r(f);
          if (m === Ke)
            return !1;
        }
        return g;
      },
      set(c, o, f, g) {
        var m = n.get(o), _ = o in c;
        if (s && o === "length")
          for (var h = f; h < /** @type {Source<number>} */
          m.v; h += 1) {
            var w = n.get(h + "");
            w !== void 0 ? S(w, Ke) : h in c && (w = l(() => /* @__PURE__ */ $(Ke)), n.set(h + "", w));
          }
        if (m === void 0)
          (!_ || Zn(c, o)?.writable) && (m = l(() => /* @__PURE__ */ $(void 0)), S(m, De(f)), n.set(o, m));
        else {
          _ = m.v !== Ke;
          var y = l(() => De(f));
          S(m, y);
        }
        var u = Reflect.getOwnPropertyDescriptor(c, o);
        if (u?.set && u.set.call(g, f), !_) {
          if (s && typeof o == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), x = Number(o);
            Number.isInteger(x) && x >= v.v && S(v, x + 1);
          }
          wr(a);
        }
        return !0;
      },
      ownKeys(c) {
        r(a);
        var o = Reflect.ownKeys(c).filter((m) => {
          var _ = n.get(m);
          return _ === void 0 || _.v !== Ke;
        });
        for (var [f, g] of n)
          g.v !== Ke && !(f in c) && o.push(f);
        return o;
      },
      setPrototypeOf() {
        Ci();
      }
    }
  );
}
function Hs(e) {
  try {
    if (e !== null && typeof e == "object" && Fn in e)
      return e[Fn];
  } catch {
  }
  return e;
}
function vl(e, t) {
  return Object.is(Hs(e), Hs(t));
}
var Rn, Na, Ia, La;
function pl() {
  if (Rn === void 0) {
    Rn = window, Na = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ia = Zn(t, "firstChild").get, La = Zn(t, "nextSibling").get, Fs(e) && (e[us] = void 0, e[ga] = null, e[ds] = void 0, e.__e = void 0), Fs(n) && (n[fs] = void 0);
  }
}
function dn(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Br(e) {
  return (
    /** @type {TemplateNode | null} */
    Ia.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Er(e) {
  return (
    /** @type {TemplateNode | null} */
    La.call(e)
  );
}
function d(e, t) {
  return /* @__PURE__ */ Br(e);
}
function dt(e, t = !1) {
  {
    var n = /* @__PURE__ */ Br(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Er(n) : n;
  }
}
function p(e, t = 1, n = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ Er(s);
  return s;
}
function gl(e) {
  e.textContent = "";
}
function Fa() {
  return !1;
}
function _l(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function bl(e) {
  ge === null && (be === null && Mi(), Ti()), hn && Ei();
}
function ml(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function vn(e, t) {
  var n = ge;
  n !== null && (n.f & ft) !== 0 && (e |= ft);
  var s = {
    ctx: it,
    deps: null,
    nodes: null,
    f: e | Ve | Ct,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: n,
    b: n && n.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  ye?.register_created_effect(s);
  var a = s;
  if ((e & er) !== 0)
    Vn !== null ? Vn.push(s) : Pn.ensure().schedule(s);
  else if (t !== null) {
    try {
      sr(s);
    } catch (l) {
      throw wt(s), l;
    }
    a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
    (a.f & lr) === 0 && (a = a.first, (e & Ut) !== 0 && (e & tr) !== 0 && a !== null && (a.f |= tr));
  }
  if (a !== null && (a.parent = n, n !== null && ml(a, n), be !== null && (be.f & et) !== 0 && (e & fn) === 0)) {
    var i = (
      /** @type {Derived} */
      be
    );
    (i.effects ??= []).push(a);
  }
  return s;
}
function Ts() {
  return be !== null && !Wt;
}
function Xr(e) {
  const t = vn(Kr, null);
  return Be(t, $e), t.teardown = e, t;
}
function bt(e) {
  bl();
  var t = (
    /** @type {Effect} */
    ge.f
  ), n = !be && (t & Ot) !== 0 && it !== null && !it.i;
  if (n) {
    var s = (
      /** @type {ComponentContext} */
      it
    );
    (s.e ??= []).push(e);
  } else
    return Da(e);
}
function Da(e) {
  return vn(er | bi, e);
}
function wl(e) {
  Pn.ensure();
  const t = vn(fn | lr, e);
  return (n = {}) => new Promise((s) => {
    n.outro ? jn(t, () => {
      wt(t), s(void 0);
    }) : (wt(t), s(void 0));
  });
}
function Ms(e) {
  return vn(er, e);
}
function yl(e) {
  return vn(Qn | lr, e);
}
function ja(e, t = 0) {
  return vn(Kr | t, e);
}
function B(e, t = [], n = [], s = []) {
  rl(s, t, n, (a) => {
    vn(Kr, () => {
      e(...a.map(r));
    });
  });
}
function As(e, t = 0) {
  var n = vn(Ut | t, e);
  return n;
}
function Pt(e) {
  return vn(Ot | lr, e);
}
function Ha(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = hn, s = be;
    Bs(!0), zt(null);
    try {
      t.call(null);
    } finally {
      Bs(n), zt(s);
    }
  }
}
function Rs(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && or(() => {
      a.abort(Sr);
    });
    var s = n.next;
    (n.f & fn) !== 0 ? n.parent = null : wt(n, t), n = s;
  }
}
function xl(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Ot) === 0 && wt(t), t = n;
  }
}
function wt(e, t = !0) {
  var n = !1;
  (t || (e.f & _i) !== 0) && e.nodes !== null && e.nodes.end !== null && (kl(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= cs, Rs(e, t && !n), xr(e, 0);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const i of s)
      i.stop();
  Ha(e), e.f ^= cs, e.f |= St;
  var a = e.parent;
  a !== null && a.first !== null && Ba(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function kl(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Er(e);
    e.remove(), e = n;
  }
}
function Ba(e) {
  var t = e.parent, n = e.prev, s = e.next;
  n !== null && (n.next = s), s !== null && (s.prev = n), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = n));
}
function jn(e, t, n = !0) {
  var s = [];
  qa(e, s, !0);
  var a = () => {
    n && wt(e), t && t();
  }, i = s.length;
  if (i > 0) {
    var l = () => --i || a();
    for (var c of s)
      c.out(l);
  } else
    a();
}
function qa(e, t, n) {
  if ((e.f & ft) === 0) {
    e.f ^= ft;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const c of s)
        (c.is_global || n) && t.push(c);
    for (var a = e.first; a !== null; ) {
      var i = a.next;
      if ((a.f & fn) === 0) {
        var l = (a.f & tr) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (a.f & Ot) !== 0 && (e.f & Ut) !== 0;
        qa(a, t, l ? n : !1);
      }
      a = i;
    }
  }
}
function qr(e) {
  Ua(e, !0);
}
function Ua(e, t) {
  if ((e.f & ft) !== 0) {
    e.f ^= ft, (e.f & $e) === 0 && (Be(e, Ve), Pn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var s = n.next, a = (n.f & tr) !== 0 || (n.f & Ot) !== 0;
      Ua(n, a ? t : !1), n = s;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function Ps(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, s = e.nodes.end; n !== null; ) {
      var a = n === s ? null : /* @__PURE__ */ Er(n);
      t.append(n), n = a;
    }
}
let Ir = !1, hn = !1;
function Bs(e) {
  hn = e;
}
let be = null, Wt = !1;
function zt(e) {
  be = e;
}
let ge = null;
function en(e) {
  ge = e;
}
let Qt = null;
function Ya(e) {
  be !== null && (Qt ??= /* @__PURE__ */ new Set()).add(e);
}
let _t = null, kt = 0, Rt = null;
function Sl(e) {
  Rt = e;
}
let Wa = 1, In = 0, Hn = In;
function qs(e) {
  Hn = e;
}
function Ga() {
  return ++Wa;
}
function Tr(e) {
  var t = e.f;
  if ((t & Ve) !== 0)
    return !0;
  if (t & et && (e.f &= ~Bn), (t & Gt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), s = n.length, a = 0; a < s; a++) {
      var i = n[a];
      if (Tr(
        /** @type {Derived} */
        i
      ) && Ma(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & Ct) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Yt === null && Be(e, $e);
  }
  return !1;
}
function Ka(e, t, n = !0) {
  var s = e.reactions;
  if (s !== null && !(Qt !== null && Qt.has(e)))
    for (var a = 0; a < s.length; a++) {
      var i = s[a];
      (i.f & et) !== 0 ? Ka(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Be(i, Ve) : (i.f & $e) !== 0 && Be(i, Gt), Es(
        /** @type {Effect} */
        i
      ));
    }
}
function Xa(e) {
  var t = _t, n = kt, s = Rt, a = be, i = Qt, l = it, c = Wt, o = Hn, f = e.f;
  _t = /** @type {null | Value[]} */
  null, kt = 0, Rt = null, be = (f & (Ot | fn)) === 0 ? e : null, Qt = null, nr(e.ctx), Wt = !1, Hn = ++In, e.ac !== null && (or(() => {
    e.ac.abort(Sr);
  }), e.ac = null);
  try {
    e.f |= Dr;
    var g = (
      /** @type {Function} */
      e.fn
    ), m = g();
    e.f |= ir;
    var _ = e.deps, h = ye?.is_fork;
    if (_t !== null) {
      var w;
      if (h || xr(e, kt), _ !== null && kt > 0)
        for (_.length = kt + _t.length, w = 0; w < _t.length; w++)
          _[kt + w] = _t[w];
      else
        e.deps = _ = _t;
      if (Ts() && (e.f & Ct) !== 0)
        for (w = kt; w < _.length; w++)
          (_[w].reactions ??= []).push(e);
    } else !h && _ !== null && kt < _.length && (xr(e, kt), _.length = kt);
    if (wa() && Rt !== null && !Wt && _ !== null && (e.f & (et | Gt | Ve)) === 0)
      for (w = 0; w < /** @type {Source[]} */
      Rt.length; w++)
        Ka(
          Rt[w],
          /** @type {Effect} */
          e
        );
    if (a !== null && a !== e) {
      if (In++, a.deps !== null)
        for (let y = 0; y < n; y += 1)
          a.deps[y].rv = In;
      if (t !== null)
        for (const y of t)
          y.rv = In;
      Rt !== null && (s === null ? s = Rt : s.push(.../** @type {Source[]} */
      Rt));
    }
    return (e.f & An) !== 0 && (e.f ^= An), m;
  } catch (y) {
    return xa(y);
  } finally {
    e.f ^= Dr, _t = t, kt = n, Rt = s, be = a, Qt = i, nr(l), Wt = c, Hn = o;
  }
}
function El(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var s = di.call(n, e);
    if (s !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[s] = n[a], n.pop());
    }
  }
  if (n === null && (t.f & et) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (_t === null || !Lr.call(_t, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & Ct) !== 0 && (i.f ^= Ct, i.f &= ~Bn), i.v !== Ke && xs(i), i.ac !== null && or(() => {
      i.ac.abort(Sr), i.ac = null, Be(i, Ve);
    }), ll(i), xr(i, 0);
  }
}
function xr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var s = t; s < n.length; s++)
      El(e, n[s]);
}
function sr(e) {
  var t = e.f;
  if ((t & St) === 0) {
    Be(e, $e);
    var n = ge, s = Ir;
    ge = e, Ir = (t & (Ot | fn)) === 0;
    try {
      (t & (Ut | pa)) !== 0 ? xl(e) : Rs(e), Ha(e);
      var a = Xa(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Wa;
      var i;
    } finally {
      Ir = s, ge = n;
    }
  }
}
async function Tl() {
  await Promise.resolve(), cl();
}
function r(e) {
  var t = e.f, n = (t & et) !== 0;
  if (be !== null && !Wt) {
    var s = ge !== null && (ge.f & St) !== 0;
    if (!s && (Qt === null || !Qt.has(e))) {
      var a = be.deps;
      if ((be.f & Dr) !== 0)
        e.rv < In && (e.rv = In, _t === null && a !== null && a[kt] === e ? kt++ : _t === null ? _t = [e] : _t.push(e));
      else {
        be.deps ??= [], Lr.call(be.deps, e) || be.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [be] : Lr.call(i, be) || i.push(be);
      }
    }
  }
  if (hn && Dn.has(e))
    return Dn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (hn) {
      var c = l.v;
      return ((l.f & $e) === 0 && l.reactions !== null || Va(l)) && (c = ks(l)), Dn.set(l, c), c;
    }
    var o = (l.f & Ct) === 0 && !Wt && be !== null && (Ir || (be.f & Ct) !== 0), f = (l.f & ir) === 0;
    Tr(l) && (o && (l.f |= Ct), Ma(l)), o && !f && (Aa(l), $a(l));
  }
  if (Yt?.has(e))
    return Yt.get(e);
  if ((e.f & An) !== 0)
    throw e.v;
  return e.v;
}
function $a(e) {
  if (e.f |= Ct, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & et) !== 0 && (t.f & Ct) === 0 && (Aa(
        /** @type {Derived} */
        t
      ), $a(
        /** @type {Derived} */
        t
      ));
}
function Va(e) {
  if (e.v === Ke) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Dn.has(t) || (t.f & et) !== 0 && Va(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function qt(e) {
  var t = Wt;
  try {
    return Wt = !0, e();
  } finally {
    Wt = t;
  }
}
const Ml = ["touchstart", "touchmove"];
function Al(e) {
  return Ml.includes(e);
}
const pr = Symbol("events"), Ja = /* @__PURE__ */ new Set(), ps = /* @__PURE__ */ new Set();
function Rl(e, t, n, s = {}) {
  function a(i) {
    if (s.capture || gs.call(t, i), !i.cancelBubble)
      return or(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? un(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function Ln(e, t, n, s, a) {
  var i = { capture: s, passive: a }, l = Rl(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Xr(() => {
    t.removeEventListener(e, l, i);
  });
}
function se(e, t, n) {
  (t[pr] ??= {})[e] = n;
}
function Kt(e) {
  for (var t = 0; t < e.length; t++)
    Ja.add(e[t]);
  for (var n of ps)
    n(e);
}
let Us = null;
function gs(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Us = e;
  var l = 0, c = Us === e && e[pr];
  if (c) {
    var o = a.indexOf(c);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pr] = t;
      return;
    }
    var f = a.indexOf(t);
    if (f === -1)
      return;
    o <= f && (l = o);
  }
  if (i = /** @type {Element} */
  a[l] || e.target, i !== t) {
    fi(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = be, m = ge;
    zt(null), en(null);
    try {
      for (var _, h = []; i !== null && i !== t; ) {
        try {
          var w = i[pr]?.[s];
          w != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && w.call(i, e);
        } catch (y) {
          _ ? h.push(y) : _ = y;
        }
        if (e.cancelBubble) break;
        l++, i = l < a.length ? (
          /** @type {Element} */
          a[l]
        ) : null;
      }
      if (_) {
        for (let y of h)
          queueMicrotask(() => {
            throw y;
          });
        throw _;
      }
    } finally {
      e[pr] = t, delete e.currentTarget, zt(g), en(m);
    }
  }
}
const Pl = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Cl(e) {
  return (
    /** @type {string} */
    Pl?.createHTML(e) ?? e
  );
}
function Ol(e) {
  var t = _l("template");
  return t.innerHTML = Cl(e.replaceAll("<!>", "<!---->")), t.content;
}
function Ur(e, t) {
  var n = (
    /** @type {Effect} */
    ge
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function z(e, t) {
  var n = (t & qi) !== 0, s = (t & Ui) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Ol(i ? e : "<!>" + e), n || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Br(a)));
    var l = (
      /** @type {TemplateNode} */
      s || Na ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (n) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Br(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      Ur(c, o);
    } else
      Ur(l, l);
    return l;
  };
}
function Jn(e = "") {
  {
    var t = dn(e + "");
    return Ur(t, t), t;
  }
}
function Cs() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = dn();
  return e.append(t, n), Ur(t, n), e;
}
function M(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function T(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[fs] ??= e.nodeValue) && (e[fs] = n, e.nodeValue = `${n}`);
}
function zl(e, t) {
  return Nl(e, t);
}
const Pr = /* @__PURE__ */ new Map();
function Nl(e, { target: t, anchor: n, props: s = {}, events: a, context: i, intro: l = !0, transformError: c }) {
  pl();
  var o = void 0, f = wl(() => {
    var g = n ?? t.appendChild(dn());
    tl(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (h) => {
        Et({});
        var w = (
          /** @type {ComponentContext} */
          it
        );
        i && (w.c = i), a && (s.$$events = a), o = e(h, s) || {}, Tt();
      },
      c
    );
    var m = /* @__PURE__ */ new Set(), _ = (h) => {
      for (var w = 0; w < h.length; w++) {
        var y = h[w];
        if (!m.has(y)) {
          m.add(y);
          var u = Al(y);
          for (const P of [t, document]) {
            var v = Pr.get(P);
            v === void 0 && (v = /* @__PURE__ */ new Map(), Pr.set(P, v));
            var x = v.get(y);
            x === void 0 ? (P.addEventListener(y, gs, { passive: u }), v.set(y, 1)) : v.set(y, x + 1);
          }
        }
      }
    };
    return _(Gr(Ja)), ps.add(_), () => {
      for (var h of m)
        for (const u of [t, document]) {
          var w = (
            /** @type {Map<string, number>} */
            Pr.get(u)
          ), y = (
            /** @type {number} */
            w.get(h)
          );
          --y == 0 ? (u.removeEventListener(h, gs), w.delete(h), w.size === 0 && Pr.delete(u)) : w.set(h, y);
        }
      ps.delete(_), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return Il.set(o, f), o;
}
let Il = /* @__PURE__ */ new WeakMap();
class Ll {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #e = /* @__PURE__ */ new Map();
  /**
   * Map of keys to effects that are currently rendered in the DOM.
   * These effects are visible and actively part of the document tree.
   * Example:
   * ```
   * {#if condition}
   * 	foo
   * {:else}
   * 	bar
   * {/if}
   * ```
   * Can result in the entries `true->Effect` and `false->Effect`
   * @type {Map<Key, Effect>}
   */
  #r = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #t = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #l = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #s = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#s = n;
  }
  /**
   * @param {Batch} batch
   */
  #i = (t) => {
    if (this.#e.has(t)) {
      var n = (
        /** @type {Key} */
        this.#e.get(t)
      ), s = this.#r.get(n);
      if (s)
        qr(s), this.#l.delete(n);
      else {
        var a = this.#t.get(n);
        a && (qr(a.effect), this.#r.set(n, a.effect), this.#t.delete(n), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [i, l] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const c = this.#t.get(l);
        c && (wt(c.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#r) {
        if (i === n || this.#l.has(i)) continue;
        const c = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var f = document.createDocumentFragment();
            Ps(l, f), f.append(dn()), this.#t.set(i, { effect: l, fragment: f });
          } else
            wt(l);
          this.#l.delete(i), this.#r.delete(i);
        };
        this.#s || !s ? (this.#l.add(i), jn(l, c, !1)) : c();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    this.#e.delete(t);
    const n = Array.from(this.#e.values());
    for (const [s, a] of this.#t)
      n.includes(s) || (wt(a.effect), this.#t.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var s = (
      /** @type {Batch} */
      ye
    ), a = Fa();
    if (n && !this.#r.has(t) && !this.#t.has(t))
      if (a) {
        var i = document.createDocumentFragment(), l = dn();
        i.append(l), this.#t.set(t, {
          effect: Pt(() => n(l)),
          fragment: i
        });
      } else
        this.#r.set(
          t,
          Pt(() => n(this.anchor))
        );
    if (this.#e.set(s, t), a) {
      for (const [c, o] of this.#r)
        c === t ? s.unskip_effect(o) : s.skip_effect(o);
      for (const [c, o] of this.#t)
        c === t ? s.unskip_effect(o.effect) : s.skip_effect(o.effect);
      s.oncommit(this.#i), s.ondiscard(this.#n);
    } else
      this.#i(s);
  }
}
function ne(e, t, n = !1) {
  var s = new Ll(e), a = n ? tr : 0;
  function i(l, c) {
    s.ensure(l, c);
  }
  As(() => {
    var l = !1;
    t((c, o = 0) => {
      l = !0, i(o, c);
    }), l || i(-1, null);
  }, a);
}
function mt(e, t) {
  return t;
}
function Fl(e, t, n) {
  for (var s = [], a = t.length, i, l = t.length, c = 0; c < a; c++) {
    let m = t[c];
    jn(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            _s(e, Gr(i.done)), _.delete(i), _.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var o = s.length === 0 && n !== null;
    if (o) {
      var f = (
        /** @type {Element} */
        n
      ), g = (
        /** @type {Element} */
        f.parentNode
      );
      gl(g), g.append(f), e.items.clear();
    }
    _s(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function _s(e, t, n = !0) {
  var s;
  if (e.pending.size > 0) {
    s = /* @__PURE__ */ new Set();
    for (const l of e.pending.values())
      for (const c of l)
        s.add(
          /** @type {EachItem} */
          e.items.get(c).e
        );
  }
  for (var a = 0; a < t.length; a++) {
    var i = t[a];
    if (s?.has(i)) {
      i.f |= Zt;
      const l = document.createDocumentFragment();
      Ps(i, l);
    } else
      wt(t[a], n);
  }
}
var Ys;
function Xe(e, t, n, s, a, i = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & _a) !== 0;
  if (o) {
    var f = (
      /** @type {Element} */
      e
    );
    l = f.appendChild(dn());
  }
  var g = null, m = /* @__PURE__ */ Ta(() => {
    var P = n();
    return (
      /** @type {V[]} */
      ys(P) ? P : P == null ? [] : Gr(P)
    );
  }), _, h = /* @__PURE__ */ new Map(), w = !0;
  function y(P) {
    (x.effect.f & St) === 0 && (x.pending.delete(P), x.fallback = g, Dl(x, _, l, t, s), g !== null && (_.length === 0 ? (g.f & Zt) === 0 ? qr(g) : (g.f ^= Zt, gr(g, null, l)) : jn(g, () => {
      g = null;
    })));
  }
  function u(P) {
    x.pending.delete(P);
  }
  var v = As(() => {
    _ = /** @type {V[]} */
    r(m);
    for (var P = _.length, F = /* @__PURE__ */ new Set(), Y = (
      /** @type {Batch} */
      ye
    ), X = Fa(), ee = 0; ee < P; ee += 1) {
      var Q = _[ee], q = s(Q, ee), D = w ? null : c.get(q);
      D ? (D.v && rr(D.v, Q), D.i && rr(D.i, ee), X && Y.unskip_effect(D.e)) : (D = jl(
        c,
        w ? l : Ys ??= dn(),
        Q,
        q,
        ee,
        a,
        t,
        n
      ), w || (D.e.f |= Zt), c.set(q, D)), F.add(q);
    }
    if (P === 0 && i && !g && (w ? g = Pt(() => i(l)) : (g = Pt(() => i(Ys ??= dn())), g.f |= Zt)), P > F.size && Si(), !w)
      if (h.set(Y, F), X) {
        for (const [J, O] of c)
          F.has(J) || Y.skip_effect(O.e);
        Y.oncommit(y), Y.ondiscard(u);
      } else
        y(Y);
    r(m);
  }), x = { effect: v, items: c, pending: h, outrogroups: null, fallback: g };
  w = !1;
}
function fr(e) {
  for (; e !== null && (e.f & Ot) === 0; )
    e = e.next;
  return e;
}
function Dl(e, t, n, s, a) {
  var i = (s & Li) !== 0, l = t.length, c = e.items, o = fr(e.effect.first), f, g = null, m, _ = [], h = [], w, y, u, v;
  if (i)
    for (v = 0; v < l; v += 1)
      w = t[v], y = a(w, v), u = /** @type {EachItem} */
      c.get(y).e, (u.f & Zt) === 0 && (u.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(u));
  for (v = 0; v < l; v += 1) {
    if (w = t[v], y = a(w, v), u = /** @type {EachItem} */
    c.get(y).e, e.outrogroups !== null)
      for (const D of e.outrogroups)
        D.pending.delete(u), D.done.delete(u);
    if ((u.f & ft) !== 0 && (qr(u), i && (u.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(u))), (u.f & Zt) !== 0)
      if (u.f ^= Zt, u === o)
        gr(u, null, n);
      else {
        var x = g ? g.next : o;
        u === e.effect.last && (e.effect.last = u.prev), u.prev && (u.prev.next = u.next), u.next && (u.next.prev = u.prev), xn(e, g, u), xn(e, u, x), gr(u, x, n), g = u, _ = [], h = [], o = fr(g.next);
        continue;
      }
    if (u !== o) {
      if (f !== void 0 && f.has(u)) {
        if (_.length < h.length) {
          var P = h[0], F;
          g = P.prev;
          var Y = _[0], X = _[_.length - 1];
          for (F = 0; F < _.length; F += 1)
            gr(_[F], P, n);
          for (F = 0; F < h.length; F += 1)
            f.delete(h[F]);
          xn(e, Y.prev, X.next), xn(e, g, Y), xn(e, X, P), o = P, g = X, v -= 1, _ = [], h = [];
        } else
          f.delete(u), gr(u, o, n), xn(e, u.prev, u.next), xn(e, u, g === null ? e.effect.first : g.next), xn(e, g, u), g = u;
        continue;
      }
      for (_ = [], h = []; o !== null && o !== u; )
        (f ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = fr(o.next);
      if (o === null)
        continue;
    }
    (u.f & Zt) === 0 && _.push(u), g = u, o = fr(u.next);
  }
  if (e.outrogroups !== null) {
    for (const D of e.outrogroups)
      D.pending.size === 0 && (_s(e, Gr(D.done)), e.outrogroups?.delete(D));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || f !== void 0) {
    var ee = [];
    if (f !== void 0)
      for (u of f)
        (u.f & ft) === 0 && ee.push(u);
    for (; o !== null; )
      (o.f & ft) === 0 && o !== e.fallback && ee.push(o), o = fr(o.next);
    var Q = ee.length;
    if (Q > 0) {
      var q = (s & _a) !== 0 && l === 0 ? n : null;
      if (i) {
        for (v = 0; v < Q; v += 1)
          ee[v].nodes?.a?.measure();
        for (v = 0; v < Q; v += 1)
          ee[v].nodes?.a?.fix();
      }
      Fl(e, ee, q);
    }
  }
  i && un(() => {
    if (m !== void 0)
      for (u of m)
        u.nodes?.a?.apply();
  });
}
function jl(e, t, n, s, a, i, l, c) {
  var o = (l & Ni) !== 0 ? (l & Fi) === 0 ? /* @__PURE__ */ dl(n, !1, !1) : qn(n) : null, f = (l & Ii) !== 0 ? qn(a) : null;
  return {
    v: o,
    i: f,
    e: Pt(() => (i(t, o ?? n, f ?? a, c), () => {
      e.delete(s);
    }))
  };
}
function gr(e, t, n) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, i = t && (t.f & Zt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; s !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Er(s)
      );
      if (i.before(s), s === a)
        return;
      s = l;
    }
}
function xn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function kn(e, t, n) {
  Ms(() => {
    var s = qt(() => t(e, n?.()) || {});
    if (s?.destroy)
      return () => (
        /** @type {Function} */
        s.destroy()
      );
  });
}
const Ws = [...` 	
\r\f \v\uFEFF`];
function Hl(e, t, n) {
  var s = e == null ? "" : "" + e;
  if (n) {
    for (var a of Object.keys(n))
      if (n[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var i = a.length, l = 0; (l = s.indexOf(a, l)) >= 0; ) {
          var c = l + i;
          (l === 0 || Ws.includes(s[l - 1])) && (c === s.length || Ws.includes(s[c])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(c + 1) : l = c;
        }
  }
  return s === "" ? null : s;
}
function Gs(e, t = !1) {
  var n = t ? " !important;" : ";", s = "";
  for (var a of Object.keys(e)) {
    var i = e[a];
    i != null && i !== "" && (s += " " + a + ": " + i + n);
  }
  return s;
}
function Bl(e, t) {
  if (t) {
    var n = "", s, a;
    return Array.isArray(t) ? (s = t[0], a = t[1]) : s = t, s && (n += Gs(s)), a && (n += Gs(a, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Ee(e, t, n, s, a, i) {
  var l = (
    /** @type {any} */
    e[us]
  );
  if (l !== n || l === void 0) {
    var c = Hl(n, s, i);
    c == null ? e.removeAttribute("class") : e.className = c, e[us] = n;
  } else if (i && a !== i)
    for (var o in i) {
      var f = !!i[o];
      (a == null || f !== !!a[o]) && e.classList.toggle(o, f);
    }
  return i;
}
function ts(e, t = {}, n, s) {
  for (var a in n) {
    var i = n[a];
    t[a] !== i && (n[a] == null ? e.style.removeProperty(a) : e.style.setProperty(a, i, s));
  }
}
function Jt(e, t, n, s) {
  var a = (
    /** @type {any} */
    e[ds]
  );
  if (a !== t) {
    var i = Bl(t, s);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[ds] = t;
  } else s && (Array.isArray(s) ? (ts(e, n?.[0], s[0]), ts(e, n?.[1], s[1], "important")) : ts(e, n, s));
  return s;
}
function _r(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ys(t))
      return Gi();
    for (var s of e.options)
      s.selected = t.includes(Ks(s));
    return;
  }
  for (s of e.options) {
    var a = Ks(s);
    if (vl(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Cr(e) {
  var t = new MutationObserver(() => {
    "__value" in e && _r(e, e.__value);
  });
  t.observe(e, {
    // Listen to option element changes
    childList: !0,
    subtree: !0,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: !0,
    attributeFilter: ["value"]
  }), Xr(() => {
    t.disconnect();
  });
}
function Ks(e) {
  return "__value" in e ? e.__value : e.value;
}
const ql = Symbol("is custom element"), Ul = Symbol("is html"), Yl = yi ? "progress" : "PROGRESS";
function $n(e, t) {
  var n = Os(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== Yl) || (e.value = t ?? "");
}
function Wl(e, t) {
  var n = Os(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function pe(e, t, n, s) {
  var a = Os(e);
  a[t] !== (a[t] = n) && (t === "loading" && (e[wi] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Gl(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Os(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[ga] ??= {
      [ql]: e.nodeName.includes("-"),
      [Ul]: e.namespaceURI === Yi
    }
  );
}
var Xs = /* @__PURE__ */ new Map();
function Gl(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Xs.get(t);
  if (n) return n;
  Xs.set(t, n = []);
  for (var s, a = e, i = Element.prototype; i !== a; ) {
    s = hi(a);
    for (var l in s)
      s[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    a = ha(a);
  }
  return n;
}
class zs {
  /** */
  #e = /* @__PURE__ */ new WeakMap();
  /** @type {ResizeObserver | undefined} */
  #r;
  /** @type {ResizeObserverOptions} */
  #t;
  /** @static */
  static entries = /* @__PURE__ */ new WeakMap();
  /** @param {ResizeObserverOptions} options */
  constructor(t) {
    this.#t = t;
  }
  /**
   * @param {Element} element
   * @param {(entry: ResizeObserverEntry) => any} listener
   */
  observe(t, n) {
    var s = this.#e.get(t) || /* @__PURE__ */ new Set();
    return s.add(n), this.#e.set(t, s), this.#l().observe(t, this.#t), () => {
      var a = this.#e.get(t);
      a.delete(n), a.size === 0 && (this.#e.delete(t), this.#r.unobserve(t));
    };
  }
  #l() {
    return this.#r ?? (this.#r = new ResizeObserver(
      /** @param {any} entries */
      (t) => {
        for (var n of t) {
          zs.entries.set(n.target, n);
          for (var s of this.#e.get(n.target) || [])
            s(n);
        }
      }
    ));
  }
}
var Kl = /* @__PURE__ */ new zs({
  box: "border-box"
});
function $s(e, t, n) {
  var s = Kl.observe(e, () => n(e[t]));
  Ms(() => (qt(() => n(e[t])), s));
}
function ns(e, t) {
  return e === t || e?.[Fn] === t;
}
function kr(e = {}, t, n, s) {
  var a = (
    /** @type {ComponentContext} */
    it.r
  ), i = (
    /** @type {Effect} */
    ge
  );
  return Ms(() => {
    var l, c;
    return ja(() => {
      l = c, c = [], qt(() => {
        ns(n(...c), e) || (t(e, ...c), l && ns(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== a && o.parent !== null && o.parent.f & cs; )
        o = o.parent;
      const f = () => {
        c && ns(n(...c), e) && t(null, ...c);
      }, g = o.teardown;
      o.teardown = () => {
        f(), g?.();
      };
    };
  }), e;
}
function Xl(e, t) {
  Zi(window, ["resize"], () => or(() => t(window[e])));
}
function ae(e, t, n, s) {
  var a = !0, i = (n & Hi) !== 0, l = (n & Bi) !== 0, c = (
    /** @type {V} */
    s
  ), o = !0, f = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && a ? (f ??= /* @__PURE__ */ yr(
    /** @type {() => V} */
    s
  ), r(f)) : (o && (o = !1, c = l ? qt(
    /** @type {() => V} */
    s
  ) : (
    /** @type {V} */
    s
  )), c);
  let m;
  if (i) {
    var _ = Fn in e || mi in e;
    m = Zn(e, t)?.set ?? (_ && t in e ? (F) => e[t] = F : void 0);
  }
  var h, w = !1;
  i ? [h, w] = Ji(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && s !== void 0 && (h = g(), m && (Ri(), m(h)));
  var y;
  if (y = () => {
    var F = (
      /** @type {V} */
      e[t]
    );
    return F === void 0 ? g() : (o = !0, F);
  }, (n & ji) === 0)
    return y;
  if (m) {
    var u = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(F, Y) {
        return arguments.length > 0 ? ((!Y || u || w) && m(Y ? y() : F), F) : y();
      })
    );
  }
  var v = !1, x = ((n & Di) !== 0 ? yr : Ta)(() => (v = !1, y()));
  i && r(x);
  var P = (
    /** @type {Effect} */
    ge
  );
  return (
    /** @type {() => V} */
    (function(F, Y) {
      if (arguments.length > 0) {
        const X = Y ? r(x) : i ? De(F) : F;
        return S(x, X), v = !0, c !== void 0 && (c = X), F;
      }
      return hn && v || (P.f & St) !== 0 ? x.v : r(x);
    })
  );
}
function cr(e) {
  it === null && xi(), bt(() => {
    const t = qt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const $l = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add($l);
function Vl(e) {
  const t = new URLSearchParams();
  for (const [s, a] of Object.entries(e))
    if (a != null)
      if (Array.isArray(a))
        for (const i of a) t.append(s, String(i));
      else
        t.set(s, String(a));
  const n = t.toString();
  return n ? "?" + n : "";
}
async function on(e, t = {}) {
  const n = await fetch(e + Vl(t));
  if (!n.ok) {
    const s = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${s.error ? " (" + s.error + ")" : ""}`);
  }
  return n.json();
}
async function Xn(e, t) {
  const n = await fetch(e, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
  if (n.status === 204) return null;
  const s = await n.json().catch(() => ({}));
  if (!n.ok)
    throw new Error(`${e} ${n.status}${s.error ? " (" + s.error + ")" : ""}`);
  return s;
}
function Vs(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const Ge = {
  // --- reads
  photos: (e) => on("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => on("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => on("/api/triage/counts", { ...Vs(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => on("/api/triage/files"),
  screen: (e, t = {}) => on("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => on("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => on("/api/triage/page", { ...Vs(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => on("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => Xn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => Xn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => Xn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => Xn("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => Xn("/api/reveal", { id: e }),
  revealOrigin: (e) => Xn("/api/reveal", { origin: e }),
  // Enqueue the snapshot-and-rebuild job. 202 is "started" and 409 is "already
  // running" or "this server may not"; all three carry the same status
  // document, so this returns the body rather than throwing and the popup reads
  // `state` and `error` off it. Anything else is a real failure and throws.
  rebuild: async () => {
    const e = await fetch("/api/triage/rebuild", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}"
    }), t = await e.json().catch(() => ({}));
    if (e.status !== 202 && e.status !== 409)
      throw new Error(`/api/triage/rebuild ${e.status}`);
    return t;
  },
  rebuildStatus: () => on("/api/triage/rebuild")
};
function Jl() {
  let e = 0, t = 0;
  return async function(s) {
    const a = ++e, i = await s();
    return a <= t ? { stale: !0, value: void 0 } : (t = a, { stale: !1, value: i });
  };
}
function Zl(e, t) {
  let n = 0;
  const s = (...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  };
  return s.cancel = () => clearTimeout(n), s.now = (...a) => {
    clearTimeout(n), e(...a);
  }, s;
}
const Js = ["B", "KB", "MB", "GB", "TB"];
function Ht(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < Js.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${Js[n]}`;
}
function Pe(e) {
  return (Number(e) || 0).toLocaleString();
}
const ar = "G:\\photos", Zs = [
  {
    id: 0,
    name: "no_image_content",
    title: "No image content",
    blurb: "Every exclude rule in the set, and what each one takes. Shown so that nothing is invisible — it starts as the nine categorical prefilter rules and grows as you work.",
    sheet: !1,
    rule: !1,
    heading: ["rule", "decision"],
    toRule: () => null
  },
  {
    id: 1,
    name: "containers",
    title: "Container directories",
    blurb: "The biggest single win. node_modules, .git, site-packages, .venv, .cache, AppData, vendor, browser profiles — `home-chris arch backup` is 1,077,495 files and is the target.",
    heading: ["directory name", "directories"],
    // The leaderboard is the survey-time rollup over the WHOLE inventory and
    // does not move as you type. Re-costing it live is 1.9-3.2 s because the
    // top 50 segments span 1,953,553 of the 2,894,845 rows in the segment
    // index, so it is offered as a button and never as a default.
    relive: "Re-cost against current rules (~2-3 s)",
    toRule: (e) => ({ column: "dir_segment", op: "=", value: e.key })
  },
  {
    id: 2,
    name: "file_type",
    title: "File type",
    blurb: "Every extension still kept, with count and bytes. .gif, .webp and .bmp resolve in one click each.",
    heading: ["extension", ""],
    label: (e) => e.key === "" ? "(no extension)" : e.key,
    toRule: (e) => ({ column: "ext", op: "=", value: e.key })
  },
  {
    id: 3,
    name: "dimensions",
    title: "Dimensions",
    blurb: "The filter that actually kills the 54,899 .png. Nearly all UI and web assets die at a long edge of 512 or less.",
    heading: ["long edge", ""],
    // Bands are cumulative because that is what one `long_edge <= N` rule
    // means: picking <=512 takes <=256 and <=64 with it. Saying so on the row
    // is cheaper than a range predicate nobody asked for.
    note: "Bands are cumulative: <=512 includes <=256 and <=64.",
    toRule: (e) => e.key === "unknown" ? { column: "long_edge", op: "is null", value: null } : e.key === ">1024" ? { column: "long_edge", op: ">", value: 1024 } : { column: "long_edge", op: "<=", value: Number(e.key.replace("<=", "")) }
  },
  {
    id: 4,
    name: "exact_dimensions",
    title: "Exact-dimension clusters",
    blurb: "Screenshots pile up hard at your screen and phone resolutions. This is what separates 'these 4,000 are all 1920x1080' in one action.",
    heading: ["width x height", ""],
    toRule: (e) => ({ column: "dims", op: "=", value: e.key })
  },
  {
    id: 5,
    name: "camera",
    title: "EXIF camera presence",
    blurb: "A sort, not a filter. Messaging apps strip EXIF, so the absence of a camera tag is not evidence of anything — use it to order the remainder for review, folder by folder.",
    rule: !1,
    heading: ["camera tag", ""],
    // No saved rule, but the rows still route into the sheet: that is the
    // ordering this screen exists to provide.
    toRule: (e) => ({
      column: "camera",
      op: "=",
      value: e.key === "exif camera" ? 1 : 0
    })
  },
  {
    id: 6,
    name: "source_folder",
    title: "Source folder",
    blurb: "The eight trees, then the second level. Accept lumix\\DCIM and usb f\\DCIM (189 GB, pure camera) wholesale; scrutinise the backup trees.",
    heading: ["folder", ""],
    drill: !0,
    toRule: (e, t) => ({
      column: "dir_under",
      op: "=",
      value: t ? `${ar}\\${t}\\${e.key}` : `${ar}\\${e.key}`
    })
  },
  {
    id: 7,
    name: "undecided",
    title: "Everything still undecided",
    blurb: "The remainder, as a plain contact sheet. Nothing reaches the vault without having been seen at thumbnail scale at least once.",
    table: !1,
    heading: [],
    toRule: () => null
  },
  {
    id: 8,
    name: "directory_tree",
    title: "Directory tree",
    blurb: "What is left of the folder structure, expanded one level at a time. A folder only appears while it still holds something, so excluding one removes it from the tree — which is what makes this readable as a shrinking list of places still to decide. Biggest first, not alphabetical.",
    // The tree is this screen's picker, so there is no aggregate table and the
    // contact sheet waits for a folder to be clicked rather than paging the
    // whole remainder the way screen 7 does.
    table: !1,
    tree: !0,
    heading: [],
    // Whatever the tree hands back is already the lowercased form a `dir_under`
    // rule stores, so the row's own path is the value unchanged.
    toRule: (e) => ({ column: "dir_under", op: "=", value: e.key })
  }
];
function Za(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), s = ar.toLowerCase();
  return n.toLowerCase().startsWith(s + "\\") ? n : "";
}
function Ns(e, t) {
  const n = t.toLowerCase();
  return e.some((s) => n === s || n.startsWith(s + "\\"));
}
function Ql(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function eo(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function Qa(e, t) {
  if (!t) return null;
  const n = e.find(
    (s) => s.term && s.term.column === t.column && s.term.op === t.op && eo(s.term.value, t.value)
  );
  return n ? n.decision : null;
}
var to = /* @__PURE__ */ z('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), no = /* @__PURE__ */ z('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), ro = /* @__PURE__ */ z('<div class="line muted svelte-1vgp6n7">…</div>'), so = /* @__PURE__ */ z('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), ao = /* @__PURE__ */ z('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), io = /* @__PURE__ */ z('<div class="line muted svelte-1vgp6n7"> </div>'), lo = /* @__PURE__ */ z('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function oo(e, t) {
  Et(t, !0);
  let n = ae(t, "counts", 3, null), s = ae(t, "files", 3, null), a = ae(t, "filesAt", 3, null), i = ae(t, "stale", 3, !1), l = ae(t, "candidate", 3, null), c = ae(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ie(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var f = lo(), g = d(f);
  let m;
  var _ = p(d(g), 2);
  {
    var h = (q) => {
      var D = no(), J = dt(D), O = d(J), re = d(O), de = p(O, 2), j = d(de), te = p(de, 4), ue = d(te), me = p(te, 2), R = d(me), N = p(J, 2);
      {
        var I = (G) => {
          var A = to(), U = p(d(A), 2), Z = d(U), Te = p(U, 2), Ae = d(Te), we = p(Te, 4), Me = d(we), Ce = p(we, 2), _e = d(Ce), xe = p(Ce, 2), Oe = d(xe);
          B(
            (H, ve, V, b, E) => {
              T(Z, `kept ${H ?? ""}`), T(Ae, ve), T(Me, `excluded ${V ?? ""}`), T(_e, b), T(Oe, `${r(o) >= 0 ? "+" : ""}${E ?? ""} excluded`);
            },
            [
              () => Pe(n().candidate_kept_paths),
              () => Ht(n().candidate_kept_bytes),
              () => Pe(n().candidate_excluded_paths),
              () => Ht(n().candidate_excluded_bytes),
              () => Pe(r(o))
            ]
          ), M(G, A);
        };
        ne(N, (G) => {
          l() && G(I);
        });
      }
      B(
        (G, A, U, Z) => {
          T(re, `kept ${G ?? ""}`), T(j, A), T(ue, `excluded ${U ?? ""}`), T(R, Z);
        },
        [
          () => Pe(n().kept_paths),
          () => Ht(n().kept_bytes),
          () => Pe(n().excluded_paths),
          () => Ht(n().excluded_bytes)
        ]
      ), M(q, D);
    }, w = (q) => {
      var D = ro();
      M(q, D);
    };
    ne(_, (q) => {
      n() ? q(h) : q(w, -1);
    });
  }
  var y = p(g, 2);
  let u;
  var v = d(y), x = p(d(v), 3), P = d(x), F = p(x, 2);
  {
    var Y = (q) => {
      var D = so();
      M(q, D);
    };
    ne(F, (q) => {
      i() && s() && s() !== "loading" && q(Y);
    });
  }
  var X = p(v, 2);
  {
    var ee = (q) => {
      var D = ao(), J = dt(D);
      let O;
      var re = d(J), de = d(re), j = p(re, 2), te = d(j), ue = p(j, 4), me = d(ue), R = p(ue, 2), N = d(R), I = p(J, 2), G = d(I);
      B(
        (A, U, Z, Te) => {
          O = Ee(J, 1, "line svelte-1vgp6n7", null, O, { outdated: i() }), T(de, `kept ${A ?? ""}`), T(te, U), T(me, `excluded ${Z ?? ""}`), T(N, Te), T(G, `as of ${a() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Pe(s().kept_files),
          () => Ht(s().kept_bytes),
          () => Pe(s().excluded_files),
          () => Ht(s().excluded_bytes)
        ]
      ), M(q, D);
    }, Q = (q) => {
      var D = io(), J = d(D);
      B(() => T(J, s() === "loading" ? "counting…" : "not counted yet")), M(q, D);
    };
    ne(X, (q) => {
      s() && s() !== "loading" ? q(ee) : q(Q, -1);
    });
  }
  B(() => {
    m = Ee(g, 1, "block svelte-1vgp6n7", null, m, { busy: c() }), u = Ee(y, 1, "block svelte-1vgp6n7", null, u, { busy: s() === "loading" }), x.disabled = s() === "loading", T(P, s() === "loading" ? "counting…" : "recount");
  }), se("click", x, function(...q) {
    t.onfiles?.apply(this, q);
  }), M(e, f), Tt();
}
Kt(["click"]);
const bs = "http://www.w3.org/2000/svg", zn = {
  refThickness: 20,
  refFactor: 1.4,
  refDispersion: 7,
  refFresnelRange: 30,
  refFresnelHardness: 20,
  refFresnelFactor: 20,
  glareRange: 30,
  glareHardness: 20,
  glareFactor: 90,
  glareConvergence: 50,
  glareOppositeFactor: 80,
  glareAngle: -45,
  blurRadius: 1,
  blurEdge: !0,
  tint: { r: 255, g: 255, b: 255, a: 0 },
  tintLight: { r: 255, g: 255, b: 255, a: 0 },
  shadowExpand: 25,
  shadowFactor: 15,
  shadowX: 0,
  shadowY: -10,
  shapeRadius: 80,
  shapeRoundness: 5
}, Mn = {
  ...zn,
  refFactor: 2,
  refFresnelRange: 0,
  glareRange: 14,
  glareHardness: 0,
  glareFactor: 120,
  glareConvergence: 100,
  blurRadius: 2,
  tintLight: { r: 255, g: 255, b: 255, a: 0.13 },
  shadowFactor: 50,
  shapeRoundness: 2,
  saturation: 130,
  control: { r: 255, g: 255, b: 255, a: 0.08 },
  controlLight: { r: 255, g: 255, b: 255, a: 0.81 },
  ink: { r: 237, g: 238, b: 242, a: 1 },
  inkLight: { r: 28, g: 28, b: 28, a: 1 },
  tally: { r: 16, g: 16, b: 21, a: 0.32 },
  tallyLight: { r: 255, g: 255, b: 255, a: 0.82 },
  tallyInk: { r: 237, g: 238, b: 242, a: 1 },
  tallyInkLight: { r: 28, g: 28, b: 28, a: 1 },
  tallyHeight: 42,
  headerTop: 14,
  headerSide: 650,
  pageTop: 14
}, co = [
  { dark: "tint", light: "tintLight", base: zn },
  { dark: "control", light: "controlLight", base: Mn },
  { dark: "ink", light: "inkLight", base: Mn },
  { dark: "tally", light: "tallyLight", base: Mn },
  { dark: "tallyInk", light: "tallyInkLight", base: Mn }
], ms = /* @__PURE__ */ new Set();
let Bt = { ...Mn };
function uo() {
  return Bt;
}
function rs(e) {
  Bt = vo(e), Is();
  for (const t of ms) t(Bt);
  return Bt;
}
function fo(e) {
  return ms.add(e), () => ms.delete(e);
}
function br(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function ho(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: Je(br(e.r, t.r), 0, 255),
    g: Je(br(e.g, t.g), 0, 255),
    b: Je(br(e.b, t.b), 0, 255),
    a: Je(br(e.a, t.a), 0, 1)
  };
}
function vo(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [s, a] of Object.entries(Mn))
    typeof a == "boolean" ? n[s] = t[s] === void 0 ? a : !!t[s] : typeof a == "object" ? n[s] = ho(t[s], a) : n[s] = br(t[s], a);
  return n;
}
function At({ r: e, g: t, b: n, a: s }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${He(s, 3)})`;
}
function He(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function Qs({ r: e, g: t, b: n, a: s }) {
  return { r: e, g: t, b: n, a: Je(s * 1.7 + 0.22, 0, 1) };
}
function ea(e, t) {
  const n = 0.4 + Je(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - Je(t, 0, 100) / 100) };
}
function ta(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, a = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? Je(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * a * Math.max(t.glareFactor, 0) / 100;
  return Je(i ** (0.1 + Je(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const po = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function go(e, t, n) {
  const s = Je(n.shapeRoundness, 2, 7), a = e / 2, i = t / 2, l = Math.min(n.shapeRadius, a, i), c = a - l, o = i - l, f = 8, g = [];
  for (let h = 0; h <= f; h++) {
    const w = h / f * (Math.PI / 2);
    g.push([l * Math.cos(w) ** (2 / s), l * Math.sin(w) ** (2 / s)]);
  }
  const m = [], _ = (h, w, y, u) => {
    let v = Math.atan2(h, -w);
    v < 0 && (v += Math.PI * 2);
    let x = Math.atan2(u, y);
    x < 0 && (x += Math.PI * 2);
    const P = He(ta(x, n), 3);
    m.push(`rgba(255, 255, 255, ${P}) ${He(v / (Math.PI * 2) * 100, 2)}%`);
  };
  _(0, -i, 0, 1);
  for (const [h, w, y] of po)
    for (let u = 0; u <= f; u++) {
      const [v, x] = g[y ? f - u : u];
      _(h * (c + v), w * (o + x), h * v ** (s - 1), -w * x ** (s - 1));
    }
  return m.push(`rgba(255, 255, 255, ${He(ta(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function Is() {
  const e = Bt, t = document.documentElement.style, n = ea(e.refFresnelRange, e.refFresnelHardness), s = ea(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${He(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${He(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", At(e.tint)), t.setProperty("--glass-tint-light", At(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", At(Qs(e.tint))), t.setProperty("--glass-tint-sheet-light", At(Qs(e.tintLight))), t.setProperty("--glass-ctl-dark", At(e.control)), t.setProperty("--glass-ctl-light", At(e.controlLight)), t.setProperty("--glass-text-dark", At(e.ink)), t.setProperty("--glass-text-light", At(e.inkLight)), t.setProperty("--glass-tint-tally-dark", At(e.tally)), t.setProperty("--glass-tint-tally-light", At(e.tallyLight)), t.setProperty("--glass-text-tally-dark", At(e.tallyInk)), t.setProperty("--glass-text-tally-light", At(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${He(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${He(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${He(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${He(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${He(e.shadowX)}px ${He(-e.shadowY)}px ${He(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(He(Je(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${He(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(He(Math.log2(Je(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${He(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${He(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${He(Je(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${He(s.width)}px`), t.setProperty("--glass-glare-blur", `${He(s.blur)}px`);
}
function Je(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function _o(e, t, n, s, a, i) {
  const l = Math.abs(e) - n + a, c = Math.abs(t) - s + a, o = Math.max(l, 0), f = Math.max(c, 0), g = i === 2 ? Math.hypot(o, f) : (o ** i + f ** i) ** (1 / i);
  return Math.min(Math.max(l, c), 0) + g - a;
}
function bo(e, t, n) {
  const s = e / 2, a = t / 2, i = Je(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), c = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), f = (_, h) => _o(_ - s, h - a, s, a, l, i), g = 256, m = new Float32Array(g + 1);
  for (let _ = 0; _ <= g; _++) {
    const h = 1 - _ / g, w = Math.asin(Je(h * h, 0, 1)), y = Math.asin(Je(Math.sin(w) / o, 0, 1));
    m[_] = Math.tan(w - y) * c;
  }
  return (_, h) => {
    const w = -f(_, h);
    if (w < 0 || w >= c) return null;
    const y = m[Math.round(w / c * g)];
    if (y === 0) return null;
    const u = 0.75, v = f(_ + u, h) - f(_ - u, h), x = f(_, h + u) - f(_, h - u), P = Math.hypot(v, x);
    if (P === 0) return null;
    const F = -y / P;
    return { dx: v * F, dy: x * F };
  };
}
function mo(e, t, n) {
  const s = document.createElement("canvas");
  s.width = e, s.height = t;
  const a = s.getContext("2d"), i = a.createImageData(e, t), l = i.data, c = e * t, o = new Float32Array(c), f = new Float32Array(c);
  let g = 0;
  for (let _ = 0; _ < t; _++)
    for (let h = 0; h < e; h++) {
      const w = n(h + 0.5, _ + 0.5);
      if (!w) continue;
      const y = _ * e + h;
      o[y] = w.dx, f[y] = w.dy;
      const u = Math.hypot(w.dx, w.dy);
      u > g && (g = u);
    }
  const m = g > 0 ? 127 / g : 0;
  for (let _ = 0; _ < c; _++) {
    const h = _ * 4;
    l[h] = 128 + Je(Math.round(o[_] * m), -127, 127), l[h + 1] = 128 + Je(Math.round(f[_] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return a.putImageData(i, 0, 0), { url: s.toDataURL(), scale: g * 2 };
}
const ss = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function as(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${He(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let hr = null, wo = 0;
function yo() {
  if (hr) return hr;
  const e = document.createElementNS(bs, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), hr = document.createElementNS(bs, "defs"), e.appendChild(hr), document.body.appendChild(e), hr;
}
function Sn(e) {
  const t = `glass-refract-${++wo}`, n = document.createElementNS(bs, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), yo().appendChild(n);
  let s = 0, a = 0, i = 0, l = 0;
  const c = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, f = "";
  function g() {
    e.style.setProperty("--glass-pre", Bt.blurEdge ? "" : f), e.style.setProperty("--glass-post", Bt.blurEdge ? f : "");
  }
  function m() {
    s < 2 || a < 2 || e.style.setProperty("--glass-glare", go(s, a, Bt));
  }
  function _() {
    if (s < 2 || a < 2) return;
    const u = Bt, v = mo(s, a, bo(s, a, u)), x = u.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(s)), n.setAttribute("height", String(a)), n.innerHTML = `<feImage x="0" y="0" width="${s}" height="${a}" preserveAspectRatio="none" href="${v.url}" result="map"/>` + as(v.scale * (1 + x), ss[0], "r") + as(v.scale, ss[1], "g") + as(v.scale * (1 - x), ss[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, f = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (f = "", g()), o = c.map((P) => Bt[P]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, _();
    }));
  }
  const w = new ResizeObserver(([u]) => {
    const v = u.borderBoxSize?.[0], x = v ? { w: Math.round(v.inlineSize), h: Math.round(v.blockSize) } : { w: Math.round(u.contentRect.width), h: Math.round(u.contentRect.height) };
    x.w === s && x.h === a || (s = x.w, a = x.h, m(), h());
  });
  w.observe(e);
  const y = fo(() => {
    m(), c.map((u) => Bt[u]).join(" ") !== o ? h() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), y(), w.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const ei = "photos.stack", na = { on: !1, strictness: null, linkage: null };
function xo() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(ei) ?? "");
  } catch {
    return { ...na };
  }
  return e === null || typeof e != "object" ? { ...na } : {
    on: e.on === !0,
    strictness: Number.isInteger(e.strictness) && e.strictness >= 0 ? e.strictness : null,
    linkage: typeof e.linkage == "string" && e.linkage ? e.linkage : null
  };
}
function ra(e) {
  return localStorage.setItem(
    ei,
    JSON.stringify({ on: e.on, strictness: e.strictness, linkage: e.linkage })
  ), e;
}
function ti(e, t) {
  return e.some(
    (n) => n.strictness === t.strictness && n.linkage === t.linkage
  );
}
function ko(e, t) {
  return e.strictness === null && e.linkage === null || ti(t, e) ? e : { ...e, strictness: null, linkage: null };
}
function sa(e, t, n) {
  const s = { ...t, ...n };
  if (ti(e, s)) return s;
  const a = "strictness" in n ? "strictness" : "linkage", i = e.find((l) => l[a] === s[a]);
  return { strictness: i.strictness, linkage: i.linkage };
}
const ni = "photos.theme", ri = "dark";
function si() {
  return document.documentElement.dataset.theme === "light" ? "light" : ri;
}
function So() {
  const e = localStorage.getItem(ni), t = e === "dark" || e === "light" ? e : ri;
  return document.documentElement.dataset.theme = t, t;
}
function ai(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(ni, e), e;
}
var Eo = /* @__PURE__ */ z('<div class="glass selected svelte-zne36e"><span class="nums svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span></span> <button class="menu small svelte-zne36e" title="Copy the conditions and the selected ids to the clipboard">Share</button> <button class="menu small svelte-zne36e">Clear</button></div>'), To = /* @__PURE__ */ z('<span class="spin svelte-zne36e" aria-label="loading"></span>'), aa = /* @__PURE__ */ z('<span class="badge svelte-zne36e"> </span>'), Mo = /* @__PURE__ */ z('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Ao = /* @__PURE__ */ z('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), is = /* @__PURE__ */ z("<button> </button>"), Ro = /* @__PURE__ */ z('<div class="glass sheet sorts svelte-zne36e"></div>'), Po = /* @__PURE__ */ z('<section><h2 class="svelte-zne36e">Strictness <span class="help svelte-zne36e" title="How many distinctive points two frames have to agree on before they are one stack.">?</span></h2> <div class="options svelte-zne36e"></div></section> <section><h2 class="svelte-zne36e">Linkage <span class="help svelte-zne36e" title="How many members of a stack a frame has to agree with, rather than only the frame before it.">?</span></h2> <div class="options svelte-zne36e"></div></section>', 1), Co = /* @__PURE__ */ z(`<p class="note svelte-zne36e">Nothing has been grouped at this setting, so every tile is a stack of its
            own. <code class="svelte-zne36e">python -m photolib.membership</code> is the pass that writes
            one, and the settings it has been run at are what this panel offers.</p>`), Oo = /* @__PURE__ */ z('<section class="warn svelte-zne36e"><p class="note svelte-zne36e">Regrouping empties what you have selected — <strong> </strong> </p> <div class="options svelte-zne36e"><button class="option svelte-zne36e">Regroup anyway</button> <button class="option on svelte-zne36e">Keep the selection</button></div></section>'), zo = /* @__PURE__ */ z(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">The same photograph taken more than once is drawn as one tile — a
            bracket or a burst, checked frame against frame rather than guessed
            from the clock. Narrowing the filters takes frames out of a stack and
            never breaks one in two.</p></section> <!> <!> <!></div>`), No = /* @__PURE__ */ z('<p class="muted svelte-zne36e">loading…</p>'), Io = /* @__PURE__ */ z('<span class="help svelte-zne36e">?</span>'), Lo = /* @__PURE__ */ z('<span class="n svelte-zne36e"> </span>'), Fo = /* @__PURE__ */ z("<button> <!></button>"), Do = /* @__PURE__ */ z('<span class="muted svelte-zne36e">nothing here</span>'), jo = /* @__PURE__ */ z('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Ho = /* @__PURE__ */ z('<div class="glass sheet filters svelte-zne36e"><!></div>'), Bo = /* @__PURE__ */ z('<div class="topbar svelte-zne36e"><div class="panes svelte-zne36e"><!> <div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <button role="switch" title="Select tiles by clicking them, then copy their ids">Select</button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function qo(e, t) {
  Et(t, !0);
  let n = ae(t, "facets", 3, null), s = ae(t, "filters", 19, () => ({})), a = ae(t, "sort", 3, "newest"), i = ae(t, "stacking", 19, () => ({ on: !1, strictness: null, linkage: null })), l = ae(t, "total", 3, null), c = ae(t, "tiles", 3, null), o = ae(t, "loading", 3, !1), f = ae(t, "selecting", 3, !1), g = ae(t, "selectedTally", 19, () => ({ stacks: 0, photos: 0 })), m = ae(t, "onfilter", 3, () => {
  }), _ = ae(t, "onsort", 3, () => {
  }), h = ae(t, "onstack", 3, () => {
  }), w = ae(t, "onclear", 3, () => {
  }), y = ae(t, "onselecting", 3, () => {
  }), u = ae(t, "onshare", 3, () => {
  }), v = ae(t, "ondeselect", 3, () => {
  }), x = ae(t, "ontriage", 3, () => {
  }), P = /* @__PURE__ */ $(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), F = /* @__PURE__ */ $(De(si())), Y = /* @__PURE__ */ $(null);
  const X = /* @__PURE__ */ ie(() => c() ?? l()), ee = /* @__PURE__ */ ie(() => n()?.dimensions ?? []), Q = /* @__PURE__ */ ie(() => n()?.sorts ?? []), q = /* @__PURE__ */ ie(() => r(Q).find((L) => L.value === a())?.label ?? a()), D = /* @__PURE__ */ ie(() => Object.values(s()).reduce((L, ce) => L + ce.length, 0)), J = /* @__PURE__ */ ie(() => r(ee).flatMap((L) => (s()[L.name] ?? []).map((ce) => ({
    dimension: L.name,
    value: ce,
    title: L.title,
    label: L.options.find((Se) => Se.value === ce)?.label ?? String(ce)
  }))));
  function O(L, ce) {
    const Se = s()[L] ?? [], Ne = Se.includes(ce) ? Se.filter((Ie) => Ie !== ce) : [...Se, ce];
    m()(L, Ne);
  }
  function re(L, ce) {
    return (s()[L] ?? []).includes(ce);
  }
  function de() {
    S(F, ai(r(F) === "dark" ? "light" : "dark"), !0);
  }
  const j = /* @__PURE__ */ ie(() => n()?.stacking?.settings ?? []), te = /* @__PURE__ */ ie(() => ({
    strictness: i().strictness ?? n()?.stacking?.default?.strictness,
    linkage: i().linkage ?? n()?.stacking?.default?.linkage
  })), ue = /* @__PURE__ */ ie(() => [...new Set(r(j).map((L) => L.strictness))].sort((L, ce) => L - ce)), me = /* @__PURE__ */ ie(() => r(j).filter((L) => L.strictness === r(te).strictness)), R = /* @__PURE__ */ ie(() => r(j).some((L) => L.strictness === r(te).strictness && L.linkage === r(te).linkage));
  let N = /* @__PURE__ */ $(null);
  function I(L) {
    L.on === i().on && (L.strictness ?? r(te).strictness) === r(te).strictness && (L.linkage ?? r(te).linkage) === r(te).linkage || (g().stacks > 0 ? S(N, L, !0) : h()(L));
  }
  function G() {
    const L = r(N);
    S(N, null), h()(L);
  }
  bt(() => {
    r(P) !== "stacks" && S(N, null);
  });
  function A(L) {
    L.key === "Escape" && S(P, "");
  }
  function U(L) {
    r(P) && !L.target.closest(".topbar") && S(P, "");
  }
  cr(() => {
    const L = new ResizeObserver(([ce]) => {
      const Se = Math.round(ce.borderBoxSize?.[0]?.blockSize ?? ce.contentRect.height);
      document.documentElement.style.setProperty("--header-h", Se + "px");
    });
    return L.observe(r(Y)), () => {
      L.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var Z = Bo();
  Ln("keydown", Rn, A), Ln("pointerdown", Rn, U);
  var Te = d(Z), Ae = d(Te);
  {
    var we = (L) => {
      var ce = Eo(), Se = d(ce), Ne = d(Se), Ie = d(Ne), Re = p(Ne, 2), Qe = d(Re), Mt = p(Re, 2), Dt = d(Mt), tt = p(Mt, 2), nn = d(tt), rn = p(Se, 2), pn = p(rn, 2);
      kn(ce, (je) => Sn?.(je)), B(
        (je, yt) => {
          T(Ie, je), T(Qe, g().stacks === 1 ? "stack" : "stacks"), T(Dt, yt), T(nn, g().photos === 1 ? "photo" : "photos");
        },
        [
          () => Pe(g().stacks),
          () => Pe(g().photos)
        ]
      ), se("click", rn, () => u()()), se("click", pn, () => v()()), M(L, ce);
    };
    ne(Ae, (L) => {
      g().stacks && L(we);
    });
  }
  var Me = p(Ae, 2), Ce = d(Me), _e = d(Ce), xe = p(Ce, 2), Oe = d(xe), H = p(xe, 2);
  {
    var ve = (L) => {
      var ce = To();
      M(L, ce);
    };
    ne(H, (L) => {
      o() && L(ve);
    });
  }
  kn(Me, (L) => Sn?.(L));
  var V = p(Te, 2), b = d(V), E = d(b), C = d(E);
  let K;
  var fe = d(C), oe = p(C, 2);
  let le;
  var ke = p(d(oe));
  {
    var We = (L) => {
      var ce = aa(), Se = d(ce);
      B(() => T(Se, r(D))), M(L, ce);
    };
    ne(ke, (L) => {
      r(D) && L(We);
    });
  }
  var ze = p(oe, 2);
  let qe;
  var ht = p(d(ze));
  {
    var Ze = (L) => {
      var ce = aa(), Se = d(ce);
      B((Ne) => T(Se, Ne), [() => Pe(l())]), M(L, ce);
    };
    ne(ht, (L) => {
      i().on && l() !== null && L(Ze);
    });
  }
  var rt = p(ze, 2);
  let tn;
  var Nt = p(rt, 2);
  {
    var Xt = (L) => {
      var ce = Ao(), Se = d(ce);
      Xe(Se, 17, () => r(J), (Ie) => Ie.dimension + " " + Ie.value, (Ie, Re) => {
        var Qe = Mo(), Mt = d(Qe), Dt = d(Mt), tt = p(Mt, 1, !0);
        B(() => {
          pe(Qe, "title", `${r(Re).title ?? ""}: ${r(Re).label ?? ""} — click to remove`), T(Dt, r(Re).title), T(tt, r(Re).label);
        }), se("click", Qe, () => O(r(Re).dimension, r(Re).value)), M(Ie, Qe);
      });
      var Ne = p(Se, 2);
      se("click", Ne, () => w()()), M(L, ce);
    };
    ne(Nt, (L) => {
      r(J).length && L(Xt);
    });
  }
  var lt = p(E, 2), ot = d(lt), It = p(lt, 2);
  kn(b, (L) => Sn?.(L));
  var Lt = p(b, 2);
  {
    var vt = (L) => {
      var ce = Ro();
      Xe(ce, 21, () => r(Q), mt, (Se, Ne) => {
        var Ie = is();
        let Re;
        var Qe = d(Ie);
        B(() => {
          Re = Ee(Ie, 1, "option svelte-zne36e", null, Re, { on: r(Ne).value === a() }), T(Qe, r(Ne).label);
        }), se("click", Ie, () => {
          _()(r(Ne).value), S(P, "");
        }), M(Se, Ie);
      }), kn(ce, (Se) => Sn?.(Se)), M(L, ce);
    };
    ne(Lt, (L) => {
      r(P) === "sort" && L(vt);
    });
  }
  var st = p(Lt, 2);
  {
    var $t = (L) => {
      var ce = zo(), Se = d(ce), Ne = p(d(Se), 2), Ie = d(Ne);
      let Re;
      var Qe = d(Ie), Mt = p(Se, 2);
      {
        var Dt = (je) => {
          var yt = Po(), sn = dt(yt), an = p(d(sn), 2);
          Xe(an, 21, () => r(ue), mt, (nt, Le) => {
            var k = is();
            let W;
            var he = d(k);
            B(() => {
              W = Ee(k, 1, "option svelte-zne36e", null, W, { on: r(Le) === r(te).strictness }), T(he, r(Le));
            }), se("click", k, () => I({
              ...i(),
              ...sa(r(j), r(te), { strictness: r(Le) })
            })), M(nt, k);
          });
          var gn = p(sn, 2), Cn = p(d(gn), 2);
          Xe(Cn, 21, () => r(me), mt, (nt, Le) => {
            var k = is();
            let W;
            var he = d(k);
            B(() => {
              W = Ee(k, 1, "option svelte-zne36e", null, W, { on: r(Le).linkage === r(te).linkage }), T(he, r(Le).label);
            }), se("click", k, () => I({
              ...i(),
              ...sa(r(j), r(te), { linkage: r(Le).linkage })
            })), M(nt, k);
          }), M(je, yt);
        };
        ne(Mt, (je) => {
          i().on && r(ue).length && je(Dt);
        });
      }
      var tt = p(Mt, 2);
      {
        var nn = (je) => {
          var yt = Co();
          M(je, yt);
        };
        ne(tt, (je) => {
          n() && !r(R) && je(nn);
        });
      }
      var rn = p(tt, 2);
      {
        var pn = (je) => {
          var yt = Oo(), sn = d(yt), an = p(d(sn)), gn = d(an), Cn = p(an), nt = p(sn, 2), Le = d(nt), k = p(Le, 2);
          B(
            (W, he) => {
              T(gn, W), T(Cn, ` ${g().stacks === 1 ? "stack" : "stacks"}, ${he ?? ""}
              ${g().photos === 1 ? "photograph" : "photographs"}. The stacks
              it names will not exist afterwards.`);
            },
            [
              () => Pe(g().stacks),
              () => Pe(g().photos)
            ]
          ), se("click", Le, G), se("click", k, () => S(N, null)), M(je, yt);
        };
        ne(rn, (je) => {
          r(N) && je(pn);
        });
      }
      kn(ce, (je) => Sn?.(je)), B(() => {
        Re = Ee(Ie, 1, "option svelte-zne36e", null, Re, { on: i().on }), pe(Ie, "aria-checked", i().on), T(Qe, i().on ? "On" : "Off");
      }), se("click", Ie, () => I({ ...i(), on: !i().on })), M(L, ce);
    };
    ne(st, (L) => {
      r(P) === "stacks" && L($t);
    });
  }
  var Ft = p(st, 2);
  {
    var ur = (L) => {
      var ce = Ho(), Se = d(ce);
      {
        var Ne = (Re) => {
          var Qe = No();
          M(Re, Qe);
        }, Ie = (Re) => {
          var Qe = Cs(), Mt = dt(Qe);
          Xe(Mt, 17, () => r(ee), mt, (Dt, tt) => {
            var nn = jo(), rn = d(nn), pn = d(rn), je = p(pn);
            {
              var yt = (nt) => {
                var Le = Io();
                B(() => pe(Le, "title", r(tt).hint)), M(nt, Le);
              };
              ne(je, (nt) => {
                r(tt).hint && nt(yt);
              });
            }
            var sn = p(rn, 2), an = d(sn);
            Xe(an, 17, () => r(tt).options, mt, (nt, Le) => {
              var k = Fo();
              let W;
              var he = d(k), Ue = p(he);
              {
                var Ye = (ct) => {
                  var ln = Lo(), _n = d(ln);
                  B((xt) => T(_n, xt), [() => Pe(r(Le).count)]), M(ct, ln);
                };
                ne(Ue, (ct) => {
                  r(Le).count !== null && ct(Ye);
                });
              }
              B(
                (ct) => {
                  W = Ee(k, 1, "option svelte-zne36e", null, W, ct), T(he, `${r(Le).label ?? ""} `);
                },
                [
                  () => ({ on: re(r(tt).name, r(Le).value) })
                ]
              ), se("click", k, () => O(r(tt).name, r(Le).value)), M(nt, k);
            });
            var gn = p(an, 2);
            {
              var Cn = (nt) => {
                var Le = Do();
                M(nt, Le);
              };
              ne(gn, (nt) => {
                r(tt).options.length || nt(Cn);
              });
            }
            B(() => T(pn, `${r(tt).title ?? ""} `)), M(Dt, nn);
          }), M(Re, Qe);
        };
        ne(Se, (Re) => {
          n() ? Re(Ie, -1) : Re(Ne);
        });
      }
      kn(ce, (Re) => Sn?.(Re)), M(L, ce);
    };
    ne(Ft, (L) => {
      r(P) === "filters" && L(ur);
    });
  }
  kr(Z, (L) => S(Y, L), () => r(Y)), B(
    (L) => {
      T(_e, L), T(Oe, r(X) === 1 ? "photo" : "photos"), K = Ee(C, 1, "menu svelte-zne36e", null, K, { open: r(P) === "sort" }), pe(C, "aria-expanded", r(P) === "sort"), T(fe, r(q)), le = Ee(oe, 1, "menu svelte-zne36e", null, le, { open: r(P) === "filters", on: r(D) > 0 }), pe(oe, "aria-expanded", r(P) === "filters"), qe = Ee(ze, 1, "menu svelte-zne36e", null, qe, { open: r(P) === "stacks", on: i().on }), pe(ze, "aria-expanded", r(P) === "stacks"), tn = Ee(rt, 1, "menu svelte-zne36e", null, tn, { on: f() }), pe(rt, "aria-checked", f()), pe(lt, "title", r(F) === "dark" ? "Switch to a white background" : "Switch to a black background"), pe(lt, "aria-label", r(F) === "dark" ? "Switch to a white background" : "Switch to a black background"), T(ot, r(F) === "dark" ? "☀" : "☾");
    },
    [() => r(X) === null ? "…" : Pe(r(X))]
  ), se("click", C, () => S(P, r(P) === "sort" ? "" : "sort", !0)), se("click", oe, () => S(P, r(P) === "filters" ? "" : "filters", !0)), se("click", ze, () => S(P, r(P) === "stacks" ? "" : "stacks", !0)), se("click", rt, () => y()(!f())), se("click", lt, de), se("click", It, () => x()()), M(e, Z), Tt();
}
Kt(["click"]);
const Vt = 4, Yr = 220, Uo = 340, En = 12, ia = Vt + En, ii = 6, Yo = 5, Wo = 0.025, Go = 9;
function Wr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Ko(e, t, n, s, a) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, c = 0, o = 1 / 0;
    for (; l < e.length && (c += Wr(e[l]), l++, o = (n - Vt * (l - i - 1)) / c, !(o <= Yr)); )
      ;
    if (o > Yr && !s) break;
    a(i, l, Math.round(Math.min(o, Uo))), i = l;
  }
  return i;
}
function li(e, t, n) {
  const s = [];
  let a = 0;
  for (let i = e.from; i < e.to; i++) {
    const c = i === e.to - 1 ? n - a : Math.round(Wr(t[i]) * e.height);
    s.push({ index: i, x: a, w: c }), a += c + Vt;
  }
  return s;
}
function Xo(e, t) {
  const n = Math.min((e | 0) - 1, ii);
  if (n < 1) return [];
  const s = Math.min(Yo, t * Wo), a = [];
  for (let i = 1; i <= n; i++)
    a.push({
      top: Math.round(En * (n - i) / n),
      inset: Math.round(i * s),
      // Integer percent, so the value lands on the decimal it reads as rather
      // than on whatever a chain of float multiplies leaves behind.
      opacity: (100 - (i - 1) * Go) / 100
    });
  return a;
}
function la(e, t, n, s) {
  const a = ws(e, s.top, s.bottom);
  if (!a) return [];
  const i = [];
  for (let l = a[0]; l <= a[1]; l++) {
    const c = e[l];
    if (!(c.top > s.bottom || c.top + c.height < s.top))
      for (const o of li(c, t, n))
        o.x <= s.right && o.x + o.w >= s.left && i.push(o.index);
  }
  return i;
}
function ws(e, t, n) {
  if (!e.length) return null;
  let s = 0, a = e.length - 1;
  for (; s < a; ) {
    const l = s + a >> 1;
    e[l].top + e[l].height < t ? s = l + 1 : a = l;
  }
  const i = s;
  for (a = e.length - 1; s < a; ) {
    const l = s + a + 1 >> 1;
    e[l].top <= n ? s = l : a = l - 1;
  }
  return [i, Math.max(i, s)];
}
var $o = /* @__PURE__ */ z('<img class="thumb svelte-5g1i2z" alt=""/>'), Vo = /* @__PURE__ */ z('<button type="button" title="Reveal this frame in Explorer"><!> <img alt="" decoding="async"/></button>'), Jo = /* @__PURE__ */ z('<div role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Previous tile" aria-label="Previous tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M14.5 5 7.5 12l7 7"></path></svg></button></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Next tile" aria-label="Next tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M9.5 5l7 7-7 7"></path></svg></button></div></div>');
function Zo(e, t) {
  Et(t, !0);
  let n = ae(t, "frames", 19, () => []), s = ae(t, "cover", 3, null), a = ae(t, "origin", 3, null), i = ae(t, "back", 3, !1), l = ae(t, "forward", 3, !1), c = ae(t, "onstep", 3, () => {
  }), o = ae(t, "onreveal", 3, () => {
  }), f = ae(t, "onclose", 3, () => {
  });
  const g = 40, m = 72, _ = /* @__PURE__ */ ie(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`), h = /* @__PURE__ */ ie(() => n().findIndex((H) => H.id === s()));
  let w = /* @__PURE__ */ $(De(document.documentElement.clientWidth)), y = /* @__PURE__ */ $(De(document.documentElement.clientHeight)), u = /* @__PURE__ */ $(null), v = /* @__PURE__ */ $(De(/* @__PURE__ */ new Set()));
  const x = 4, P = 25, F = { x: 0, y: 0, w: 0, h: 0 }, Y = /* @__PURE__ */ ie(() => Math.max(0, r(w) - m * 2)), X = /* @__PURE__ */ ie(() => Math.max(0, r(y) - g * 2)), ee = /* @__PURE__ */ ie(() => r(Y) > 0 && r(X) > 0 ? J(n(), r(Y), r(X)) : n().map(() => F));
  function Q(H, ve, V) {
    const b = [];
    let E = 0, C = 0;
    for (let K = 0; K < H.length; K++)
      C += Wr(H[K]), C * V + Vt * (K - E) >= ve && (b.push({ from: E, to: K + 1, sum: C }), E = K + 1, C = 0);
    return E < H.length && b.push({ from: E, to: H.length, sum: C }), b;
  }
  function q(H, ve, V) {
    return H.map((b, E) => {
      const C = (ve - Vt * (b.to - b.from - 1)) / b.sum;
      return E === H.length - 1 && C > V ? V : C;
    });
  }
  function D(H, ve, V) {
    return q(H, ve, V).reduce((b, E) => b + E, 0) + Vt * (H.length - 1);
  }
  function J(H, ve, V) {
    let b = x, E = Math.max(x, V);
    for (let le = 0; le < P; le++) {
      const ke = (b + E) / 2;
      D(Q(H, ve, ke), ve, ke) <= V ? b = ke : E = ke;
    }
    const C = Q(H, ve, b), K = q(C, ve, b), fe = [];
    let oe = (V - (K.reduce((le, ke) => le + ke, 0) + Vt * (C.length - 1))) / 2;
    return C.forEach((le, ke) => {
      const We = K[ke], ze = [];
      for (let Ze = le.from; Ze < le.to; Ze++) ze.push(Wr(H[Ze]) * We);
      const qe = ze.reduce((Ze, rt) => Ze + rt, 0) + Vt * (ze.length - 1);
      let ht = (ve - qe) / 2;
      for (const Ze of ze)
        fe.push({
          x: Math.round(ht),
          y: Math.round(oe),
          w: Math.round(Ze),
          h: Math.round(We)
        }), ht += Ze + Vt;
      oe += We + Vt;
    }), fe;
  }
  function O(H) {
    if (!a() || !H || !H.w || !H.h) return "none";
    const ve = a().left - (m + H.x), V = a().top - r(de) - (g + H.y);
    return `translate(${ve}px, ${V}px) scale(${a().width / H.w}, ${a().height / H.h})`;
  }
  let re = window.scrollY, de = /* @__PURE__ */ $(0);
  bt(() => {
    a(), re = window.scrollY;
  });
  const j = 1600;
  let te = /* @__PURE__ */ $(!1), ue = 0;
  function me() {
    S(te, !1), clearTimeout(ue), ue = setTimeout(() => S(te, !0), j);
  }
  const R = 220;
  let N = /* @__PURE__ */ $(!1), I = 0;
  function G() {
    r(N) || (S(de, window.scrollY - re), S(N, !0), I = setTimeout(f(), R));
  }
  function A(H, ve = !1) {
    r(N) || c()(H, ve);
  }
  function U(H) {
    if (H.key === "Escape") {
      G();
      return;
    }
    H.key !== "ArrowLeft" && H.key !== "ArrowRight" || (H.preventDefault(), A(H.key === "ArrowLeft" ? -1 : 1, H.repeat));
  }
  function Z(H) {
    H.target.closest(".frame, .lane") || G();
  }
  function Te(H) {
    r(N) || (o()(H), G());
  }
  cr(() => (r(u)?.focus(), me(), () => {
    clearTimeout(ue), clearTimeout(I);
  }));
  var Ae = Jo();
  Ln("keydown", Rn, U), Ln("pointerdown", Rn, Z), Ln("pointermove", Rn, me);
  let we;
  Jt(Ae, "", {}, { "--leave": "220ms" });
  var Me = d(Ae);
  Jt(Me, "", {}, { inset: "40px 72px" }), Xe(Me, 23, n, (H) => H.id, (H, ve, V) => {
    var b = Vo();
    let E, C;
    var K = d(b);
    {
      var fe = (ke) => {
        var We = $o();
        B(() => pe(We, "src", `/t/${r(ve).s ?? ""}.webp`)), M(ke, We);
      };
      ne(K, (ke) => {
        r(V) === r(h) && ke(fe);
      });
    }
    var oe = p(K, 2);
    let le;
    B(
      (ke, We) => {
        E = Ee(b, 1, "frame svelte-5g1i2z", null, E, { cover: r(V) === r(h) }), C = Jt(b, "", C, ke), pe(oe, "src", `/d/${r(ve).s ?? ""}.webp`), le = Ee(oe, 1, "svelte-5g1i2z", null, le, We);
      },
      [
        () => ({
          left: `${r(ee)[r(V)].x ?? ""}px`,
          top: `${r(ee)[r(V)].y ?? ""}px`,
          width: `${r(ee)[r(V)].w ?? ""}px`,
          height: `${r(ee)[r(V)].h ?? ""}px`,
          "--flight": r(V) === r(h) ? O(r(ee)[r(V)]) : null
        }),
        () => ({ loaded: r(v).has(r(ve).id) })
      ]
    ), se("click", b, () => Te(r(ve))), Ln("load", oe, () => S(v, new Set(r(v)).add(r(ve).id), !0)), M(H, b);
  });
  var Ce = p(Me, 2);
  Jt(Ce, "", {}, { width: "44px", left: "14px" });
  var _e = d(Ce);
  kn(_e, (H) => Sn?.(H));
  var xe = p(Ce, 2);
  Jt(xe, "", {}, { width: "44px", right: "14px" });
  var Oe = d(xe);
  kn(Oe, (H) => Sn?.(H)), kr(Ae, (H) => S(u, H), () => r(u)), B(() => {
    we = Ee(Ae, 1, "glass pane svelte-5g1i2z", null, we, { resting: r(te), leaving: r(N) }), pe(Ae, "aria-label", r(_)), _e.disabled = !i(), Oe.disabled = !l();
  }), se("click", _e, () => A(-1)), se("click", Oe, () => A(1)), $s(Ae, "clientWidth", (H) => S(w, H)), $s(Ae, "clientHeight", (H) => S(y, H)), M(e, Ae), Tt();
}
Kt(["click"]);
var Qo = /* @__PURE__ */ z('<span class="err svelte-uzy12d"> </span>'), ec = /* @__PURE__ */ z(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), tc = /* @__PURE__ */ z(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), nc = /* @__PURE__ */ z('<span class="muted svelte-uzy12d"> </span>'), rc = /* @__PURE__ */ z('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function sc(e, t) {
  Et(t, !0);
  let n = /* @__PURE__ */ $(null), s = /* @__PURE__ */ $(!1), a = /* @__PURE__ */ $(null);
  async function i() {
    S(s, !0), S(a, null);
    try {
      S(n, await Ge.probe(), !0);
    } catch (h) {
      S(a, String(h), !0);
    } finally {
      S(s, !1);
    }
  }
  var l = rc(), c = d(l), o = d(c), f = p(c, 2);
  {
    var g = (h) => {
      var w = Qo(), y = d(w);
      B(() => T(y, r(a))), M(h, w);
    }, m = (h) => {
      var w = Cs(), y = dt(w);
      {
        var u = (x) => {
          var P = ec(), F = p(d(P), 2);
          B(
            (Y) => T(F, ` above are formats the header
        reader cannot measure (${Y ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), M(x, P);
        }, v = (x) => {
          var P = tc(), F = d(P), Y = d(F), X = p(F, 2), ee = d(X);
          B(
            (Q) => {
              T(Y, Q), T(ee, r(n).command);
            },
            [() => Pe(r(n).worklist)]
          ), M(x, P);
        };
        ne(y, (x) => {
          r(n).worklist === 0 ? x(u) : x(v, -1);
        });
      }
      M(h, w);
    }, _ = (h) => {
      var w = nc(), y = d(w);
      B(() => T(y, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), M(h, w);
    };
    ne(f, (h) => {
      r(a) ? h(g) : r(n) ? h(m, 1) : h(_, -1);
    });
  }
  B(() => {
    c.disabled = r(s), T(o, r(s) ? "counting…" : "Check the dimension probe's worklist");
  }), se("click", c, i), M(e, l), Tt();
}
Kt(["click"]);
var ac = /* @__PURE__ */ z('<p class="bad svelte-1xjbga"> </p>'), ic = /* @__PURE__ */ z('<pre class="svelte-1xjbga"> </pre>'), lc = /* @__PURE__ */ z('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), oc = /* @__PURE__ */ z(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), cc = /* @__PURE__ */ z('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), uc = /* @__PURE__ */ z('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), dc = /* @__PURE__ */ z(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), fc = /* @__PURE__ */ z('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), hc = /* @__PURE__ */ z(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function vc(e, t) {
  Et(t, !0);
  let n = /* @__PURE__ */ $(null), s = /* @__PURE__ */ $(!1), a = /* @__PURE__ */ $(null), i = /* @__PURE__ */ $(null);
  const l = /* @__PURE__ */ ie(() => r(n)?.state === "running"), c = /* @__PURE__ */ ie(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const x = await Ge.rebuildStatus();
      S(n, x, !0), S(a, null), x.state === "done" && x.started_at !== r(i) && (S(i, x.started_at, !0), t.oncomplete?.());
    } catch (x) {
      S(a, String(x), !0);
    }
  }
  cr(() => {
    o();
  }), bt(() => {
    if (!r(l)) return;
    const x = setInterval(o, 700);
    return () => clearInterval(x);
  });
  async function f() {
    S(s, !0), S(a, null);
    try {
      S(n, await Ge.rebuild(), !0);
    } catch (x) {
      S(a, String(x), !0);
    }
  }
  function g(x) {
    x.key === "Escape" && S(s, !1);
  }
  var m = hc();
  Ln("keydown", Rn, g);
  var _ = dt(m), h = d(_), w = d(h), y = p(h, 2), u = p(_, 2);
  {
    var v = (x) => {
      var P = fc(), F = dt(P), Y = p(F, 2), X = d(Y), ee = p(d(X), 4), Q = d(ee), q = p(ee, 2), D = p(X, 2);
      {
        var J = (R) => {
          var N = ac(), I = d(N);
          B(() => T(I, r(a))), M(R, N);
        };
        ne(D, (R) => {
          r(a) && R(J);
        });
      }
      var O = p(D, 2);
      Xe(O, 17, () => r(n)?.steps ?? [], mt, (R, N) => {
        var I = lc();
        let G;
        var A = d(I), U = d(A), Z = d(U);
        {
          var Te = (V) => {
            var b = Jn("✓");
            M(V, b);
          }, Ae = (V) => {
            var b = Jn("✕");
            M(V, b);
          }, we = (V) => {
            var b = Jn("·");
            M(V, b);
          }, Me = (V) => {
            var b = Jn(" ");
            M(V, b);
          };
          ne(Z, (V) => {
            r(N).state === "done" ? V(Te) : r(N).state === "failed" ? V(Ae, 1) : r(N).state === "running" ? V(we, 2) : V(Me, -1);
          });
        }
        var Ce = p(U, 2), _e = d(Ce), xe = p(Ce, 4), Oe = d(xe), H = p(A, 2);
        {
          var ve = (V) => {
            var b = ic(), E = d(b);
            B((C) => T(E, C), [() => r(N).log.join(`
`)]), M(V, b);
          };
          ne(H, (V) => {
            r(N).log.length && V(ve);
          });
        }
        B(() => {
          G = Ee(I, 1, "step svelte-1xjbga", null, G, {
            on: r(N).state === "running",
            bad: r(N).state === "failed"
          }), T(_e, r(N).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), T(Oe, r(N).seconds === null ? "" : r(N).seconds + "s");
        }), M(R, I);
      });
      var re = p(O, 2);
      {
        var de = (R) => {
          var N = oc(), I = dt(N), G = d(I);
          B(() => T(G, r(n).error)), M(R, N);
        }, j = (R) => {
          var N = cc();
          M(R, N);
        }, te = (R) => {
          var N = uc();
          M(R, N);
        };
        ne(re, (R) => {
          r(n)?.state === "failed" ? R(de) : r(n)?.state === "done" ? R(j, 1) : r(l) && R(te, 2);
        });
      }
      var ue = p(re, 2);
      {
        var me = (R) => {
          var N = dc(), I = p(d(N), 6), G = d(I);
          B(() => T(G, `python -m photolib.restore_state ${r(c) ?? ""}`)), M(R, N);
        };
        ne(ue, (R) => {
          r(c) && R(me);
        });
      }
      B(() => T(Q, `${r(n)?.seconds ?? 0 ?? ""}s`)), se("click", F, () => S(s, !1)), se("click", q, () => S(s, !1)), M(x, P);
    };
    ne(u, (x) => {
      r(s) && x(v);
    });
  }
  B(() => {
    h.disabled = r(l), T(w, r(l) ? "applying…" : "Apply to grid"), y.disabled = !r(n) || r(n).state === "idle";
  }), se("click", h, f), se("click", y, () => S(s, !0)), M(e, m), Tt();
}
Kt(["click"]);
var pc = /* @__PURE__ */ z('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), oa = /* @__PURE__ */ z("<option> </option>"), gc = /* @__PURE__ */ z('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), _c = /* @__PURE__ */ z('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), bc = /* @__PURE__ */ z('<div class="none muted svelte-bqi9ky"> </div>'), mc = /* @__PURE__ */ z('<div class="bar svelte-bqi9ky"><!></div>');
function wc(e, t) {
  Et(t, !0);
  let n = ae(t, "candidate", 3, null), s = ae(t, "saving", 3, !1);
  const a = [
    "dir_segment",
    "dir_under",
    "ext",
    "root",
    "kind",
    "width",
    "height",
    "long_edge",
    "camera",
    "dims"
  ], i = {
    dir_segment: ["="],
    dir_under: ["="],
    ext: ["=", "in"],
    root: ["=", "in"],
    kind: ["=", "in", "is null"],
    width: ["=", "<=", ">", "is null"],
    height: ["=", "<=", ">", "is null"],
    long_edge: ["=", "<=", ">", "is null"],
    camera: ["="],
    dims: ["="]
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), c = /* @__PURE__ */ ie(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ ie(() => !!n() && n().op !== "is null");
  function f(y, u) {
    const v = { ...n(), [y]: u };
    if (y === "column") {
      const x = i[u] ?? ["="];
      x.includes(v.op) || (v.op = x[0]), v.value = l.has(u) ? 0 : "";
    }
    y === "op" && u === "is null" && (v.value = null), y === "value" && l.has(v.column) && (v.value = Number(u) || 0), t.onedit(v);
  }
  var g = mc(), m = d(g);
  {
    var _ = (y) => {
      var u = pc(), v = d(u), x = d(v), P = p(v, 2), F = d(P);
      B(() => {
        T(x, `${t.screen.title ?? ""} does not save a rule.`), T(F, t.screen.blurb);
      }), M(y, u);
    }, h = (y) => {
      var u = _c(), v = dt(u), x = d(v);
      Xe(x, 21, () => a, mt, (I, G) => {
        var A = oa(), U = d(A), Z = {};
        B(() => {
          T(U, r(G)), Z !== (Z = r(G)) && (A.value = (A.__value = r(G)) ?? "");
        }), M(I, A);
      });
      var P;
      Cr(x);
      var F = p(x, 2);
      Xe(F, 21, () => r(c), mt, (I, G) => {
        var A = oa(), U = d(A), Z = {};
        B(() => {
          T(U, r(G)), Z !== (Z = r(G)) && (A.value = (A.__value = r(G)) ?? "");
        }), M(I, A);
      });
      var Y;
      Cr(F);
      var X = p(F, 2);
      {
        var ee = (I) => {
          var G = gc();
          B(() => $n(G, n().value ?? "")), se("input", G, (A) => f("value", A.currentTarget.value)), M(I, G);
        };
        ne(X, (I) => {
          r(o) && I(ee);
        });
      }
      var Q = p(X, 2), q = d(Q);
      q.value = q.__value = "exclude";
      var D = p(q);
      D.value = D.__value = "include";
      var J;
      Cr(Q);
      var O = p(Q, 2), re = d(O);
      re.value = re.__value = "end";
      var de = p(re);
      de.value = de.__value = "0";
      var j;
      Cr(O);
      var te = p(O, 2), ue = d(te), me = p(te, 2), R = p(v, 2), N = d(R);
      B(
        (I, G) => {
          P !== (P = n().column) && (x.value = (x.__value = n().column) ?? "", _r(x, n().column)), Y !== (Y = n().op) && (F.value = (F.__value = n().op) ?? "", _r(F, n().op)), J !== (J = n().decision ?? "exclude") && (Q.value = (Q.__value = n().decision ?? "exclude") ?? "", _r(Q, n().decision ?? "exclude")), j !== (j = I) && (O.value = (O.__value = I) ?? "", _r(O, I)), te.disabled = s(), T(ue, s() ? "saving…" : "Confirm"), T(N, `${G ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Ql(n())
        ]
      ), se("change", x, (I) => f("column", I.currentTarget.value)), se("change", F, (I) => f("op", I.currentTarget.value)), se("change", Q, (I) => f("decision", I.currentTarget.value)), se("change", O, (I) => f("at", I.currentTarget.value)), se("click", te, function(...I) {
        t.onconfirm?.apply(this, I);
      }), se("click", me, function(...I) {
        t.onclear?.apply(this, I);
      }), M(y, u);
    }, w = (y) => {
      var u = bc(), v = d(u);
      B(() => T(v, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), M(y, u);
    };
    ne(m, (y) => {
      t.screen.rule === !1 ? y(_) : n() ? y(h, 1) : y(w, -1);
    });
  }
  M(e, g), Tt();
}
Kt(["change", "input", "click"]);
var yc = /* @__PURE__ */ z('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), xc = /* @__PURE__ */ z('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), kc = /* @__PURE__ */ z('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Sc = /* @__PURE__ */ z('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Ec(e, t) {
  Et(t, !0);
  let n = ae(t, "rules", 19, () => []), s = ae(t, "unmatched", 3, null), a = ae(t, "busy", 3, !1);
  var i = Sc(), l = d(i), c = p(d(l)), o = d(c), f = p(l, 2);
  {
    var g = (w) => {
      var y = yc();
      M(w, y);
    };
    ne(f, (w) => {
      n().length === 0 && w(g);
    });
  }
  var m = p(f, 2);
  Xe(m, 19, n, (w) => w.id, (w, y, u) => {
    var v = xc();
    let x;
    var P = d(v), F = d(P), Y = d(F), X = p(F, 2), ee = d(X), Q = p(X, 2), q = d(Q), D = p(P, 2), J = d(D), O = d(J), re = p(J, 2), de = d(re), j = p(re, 4), te = p(j, 2), ue = p(te, 2);
    B(
      (me, R) => {
        x = Ee(v, 1, "rule svelte-aof9c2", null, x, { exclude: r(y).decision === "exclude" }), T(Y, r(u)), T(ee, r(y).predicate), T(q, r(y).decision), T(O, `${me ?? ""} paths`), T(de, R), j.disabled = a() || r(u) === 0, te.disabled = a() || r(u) === n().length - 1, ue.disabled = a();
      },
      [
        () => Pe(r(y).paths),
        () => Ht(r(y).bytes)
      ]
    ), se("click", j, () => t.onmove(r(y), r(u) - 1)), se("click", te, () => t.onmove(r(y), r(u) + 1)), se("click", ue, () => t.ondelete(r(y))), M(w, v);
  });
  var _ = p(m, 2);
  {
    var h = (w) => {
      var y = kc(), u = p(d(y), 2), v = d(u), x = d(v), P = p(v, 2), F = d(P);
      B(
        (Y, X) => {
          T(x, `${Y ?? ""} paths`), T(F, X);
        },
        [
          () => Pe(s().paths),
          () => Ht(s().bytes)
        ]
      ), M(w, y);
    };
    ne(_, (w) => {
      s() && w(h);
    });
  }
  B(() => T(o, `${n().length ?? ""} rules · top-down, first match wins`)), M(e, i), Tt();
}
Kt(["click"]);
function Ls(e) {
  return e.k ?? e.s;
}
function Or(e) {
  return { key: Ls(e), ids: (e.m ?? [e]).map((t) => t.id) };
}
function Tc(e, t) {
  const n = new Map(t.map((i) => [i.key, i.ids]));
  let s = !1;
  const a = e.map((i) => {
    const l = n.get(i.key);
    return l === void 0 || Mc(i.ids, l) ? i : (s = !0, { key: i.key, ids: l });
  });
  return s ? a : e;
}
function Mc(e, t) {
  return e.length === t.length && e.every((n, s) => n === t[s]);
}
function Ac(e, t) {
  const n = e.filter((s) => s.key !== t.key);
  return n.length === e.length ? [...e, t] : n;
}
function ca(e, t, n) {
  if (!n) {
    const a = new Set(t.map((i) => i.key));
    return e.filter((i) => !a.has(i.key));
  }
  const s = new Set(e.map((a) => a.key));
  return [...e, ...t.filter((a) => !s.has(a.key))];
}
function Rc(e) {
  return {
    stacks: e.length,
    photos: e.reduce((t, n) => t + n.ids.length, 0)
  };
}
function Pc(e) {
  const t = Object.entries(e.filters).filter(([, n]) => n.length > 0).sort(([n], [s]) => n < s ? -1 : n > s ? 1 : 0).map(([n, s]) => n + ":" + s.join("|"));
  return `stack=${oi(e.stacking)} sort=${e.sort} filters=${t.length ? t.join(",") : "none"}`;
}
function oi(e) {
  return e.on ? "on" + (e.strictness === null && e.linkage === null ? "" : ` strictness=${e.strictness} linkage=${e.linkage}`) : "off";
}
function Cc(e, t) {
  const n = t.map((s) => "[" + s.ids.join(",") + "]").join(",");
  return Pc(e) + `
` + n;
}
const ua = 2500, Oc = 1, zc = 2, da = 4, Nc = 3e7, On = /* @__PURE__ */ new WeakMap();
function fa(e) {
  return On.get(e).photo.getBoundingClientRect();
}
function Ic(e, t, n) {
  const s = [], a = [], i = /* @__PURE__ */ new Map(), l = [], c = [];
  let o = 0, f = En, g = null, m = null, _ = null, h = !1, w = !1, y = 0, u = 0, v = 0, x = n.onState || (() => {
  });
  function P(b) {
    y <= 0 || (o = Ko(s, o, y, b, (E, C, K) => {
      a.push({ top: f, height: K, from: E, to: C }), f += K + ia;
    }), Y());
  }
  function F() {
    if (m === null || h || y <= 0 || o >= m) return 0;
    const b = a.length ? o / a.length : Math.max(1, y / Yr), E = a.length ? (f - En) / a.length : Yr + ia, C = Math.round((m - o) / b * E);
    return Math.max(0, Math.min(C, Nc - f));
  }
  function Y() {
    e.style.height = f + F() + "px", t.style.top = Math.max(0, f - 1) + "px";
  }
  function X() {
    return window.scrollY - e.offsetTop;
  }
  function ee() {
    const b = l.pop();
    if (b) return b;
    const E = document.createElement("div");
    E.className = "tile", E.tabIndex = -1;
    const C = document.createElement("div");
    C.className = "deck", C.style.height = En + "px";
    const K = [];
    for (let le = 0; le < ii; le++) {
      const ke = document.createElement("div");
      ke.className = "card", ke.hidden = !0, K.push(ke);
    }
    for (let le = K.length - 1; le >= 0; le--) C.appendChild(K[le]);
    E.appendChild(C);
    const fe = document.createElement("div");
    fe.className = "tile-photo";
    const oe = document.createElement("img");
    return oe.decoding = "async", oe.draggable = !1, oe.addEventListener("load", () => E.classList.add("loaded")), oe.addEventListener("error", () => E.classList.add("missing")), fe.appendChild(oe), E.appendChild(fe), On.set(E, { img: oe, photo: fe, strip: C, cards: K, above: 0 }), n.extend && n.extend(E), E;
  }
  function Q(b, E) {
    const { img: C, photo: K } = On.get(E);
    C.removeAttribute("src"), E.classList.remove("loaded", "missing", "error"), K.style.backgroundImage = "", E.remove(), i.delete(b), l.push(E);
  }
  function q(b, E, C) {
    const K = On.get(b), fe = Xo(E.n, C);
    K.above = fe.length ? En : 0, K.strip.hidden = fe.length === 0;
    for (let oe = 0; oe < K.cards.length; oe++) {
      const le = fe[oe];
      K.cards[oe].hidden = le === void 0, le !== void 0 && (K.cards[oe].style.top = le.top + "px", K.cards[oe].style.left = le.inset + "px", K.cards[oe].style.right = le.inset + "px", K.cards[oe].style.opacity = String(le.opacity));
    }
  }
  function D(b, E, C, K, fe, oe) {
    let le = i.get(b);
    const ke = s[b];
    if (!le) {
      le = ee(), le.dataset.index = String(b);
      const qe = On.get(le).img;
      q(le, ke, K), qe.fetchPriority = oe ? "high" : "low", qe.src = "/t/" + ke.s + ".webp", c.push(b), n.fill && n.fill(le, ke), e.appendChild(le), i.set(b, le);
    }
    const { above: We, photo: ze } = On.get(le);
    le.style.width = K + "px", le.style.height = fe + We + "px", le.style.transform = "translate(" + E + "px," + (C - We) + "px)", ze.style.height = fe + "px";
  }
  function J(b, E) {
    E.th && (E.url === void 0 && (E.url = n.thumbHash(E.th)), E.url && (On.get(b).photo.style.backgroundImage = "url(" + E.url + ")"));
  }
  function O() {
    v = 0;
    for (const b of c) {
      const E = i.get(b);
      E && !E.classList.contains("loaded") && J(E, s[b]);
    }
    c.length = 0;
  }
  function re(b, E) {
    for (const C of li(b, s, y))
      D(C.index, C.x, b.top, C.w, b.height, E);
  }
  function de() {
    const b = window.innerHeight, E = X(), C = ws(a, E - b * Oc, E + b * (1 + zc));
    if (!C) return;
    const K = a[C[0]].from, fe = a[C[1]].to;
    for (const [oe, le] of Array.from(i))
      (oe < K || oe >= fe) && Q(oe, le);
    for (let oe = C[0]; oe <= C[1]; oe++) {
      const le = a[oe];
      re(le, le.top < E + b && le.top + le.height > E);
    }
    c.length && !v && (v = requestAnimationFrame(O));
  }
  function j() {
    return y <= 0 ? !1 : f - (X() + window.innerHeight) < ua;
  }
  let te = Promise.resolve();
  function ue() {
    return w || h || (w = !0, te = me()), te;
  }
  async function me() {
    const b = u;
    x({ loading: !0, count: s.length, exhausted: h, total: m, tiles: _ });
    try {
      do {
        const E = await n.fetchPage(g);
        if (b !== u) return;
        for (const C of E.photos) s.push(C);
        g = E.next, h = g === null, typeof E.stacks == "number" ? (m = E.stacks, _ = typeof E.total == "number" ? E.total : null) : typeof E.total == "number" && (m = E.total), P(h), de(), x({ loading: !0, count: s.length, exhausted: h, total: m, tiles: _ });
      } while (!h && j());
    } catch (E) {
      b === u && x({ error: String(E) });
    } finally {
      b === u && (w = !1, x({ loading: !1, count: s.length, exhausted: h, total: m, tiles: _ }));
    }
  }
  let R = 0;
  function N() {
    R || (R = requestAnimationFrame(() => {
      R = 0, de(), A && Me(), j() && ue();
    }));
  }
  function I() {
    const b = e.clientWidth;
    if (b === y) return;
    const E = ws(a, X(), X()), C = E ? a[E[0]].from : 0;
    y = b;
    for (const [fe, oe] of Array.from(i)) Q(fe, oe);
    a.length = 0, o = 0, f = En, P(h), de();
    const K = a.find((fe) => fe.to > C);
    K && window.scrollTo(0, K.top + e.offsetTop), j() && ue();
  }
  let G = !1, A = null, U = 0, Z = null, Te = !1;
  function Ae(b, E) {
    const C = e.getBoundingClientRect();
    return { x: b - C.left, y: E - C.top };
  }
  function we(b) {
    Z || (Z = document.createElement("div"), Z.className = "marquee", e.appendChild(Z)), Z.hidden = !1, Z.style.width = b.right - b.left + "px", Z.style.height = b.bottom - b.top + "px", Z.style.transform = "translate(" + b.left + "px," + b.top + "px)";
  }
  function Me() {
    if (!A) return;
    const { x: b, y: E } = Ae(A.cx, A.cy);
    if (!A.live) {
      if (Math.abs(b - A.ax) < da && Math.abs(E - A.ay) < da) return;
      A.live = !0, n.sweepStart(A.index === null ? null : s[A.index], A.index);
    }
    const C = {
      left: Math.min(A.ax, b),
      right: Math.max(A.ax, b),
      top: Math.min(A.ay, E),
      bottom: Math.max(A.ay, E)
    };
    we(C), n.sweepMove(la(a, s, y, C).map((K) => s[K]));
  }
  function Ce(b) {
    if (Te = !1, !G || b.button !== 0 || b.shiftKey) return;
    const { x: E, y: C } = Ae(b.clientX, b.clientY), K = la(a, s, y, { left: E, top: C, right: E, bottom: C });
    A = {
      ax: E,
      ay: C,
      cx: b.clientX,
      cy: b.clientY,
      index: K.length ? K[0] : null,
      live: !1
    }, window.addEventListener("pointermove", _e), window.addEventListener("pointerup", xe), window.addEventListener("pointercancel", xe);
  }
  function _e(b) {
    A && (A.cx = b.clientX, A.cy = b.clientY, !U && (U = requestAnimationFrame(() => {
      U = 0, Me();
    })));
  }
  function xe(b) {
    if (!A) return;
    window.removeEventListener("pointermove", _e), window.removeEventListener("pointerup", xe), window.removeEventListener("pointercancel", xe), cancelAnimationFrame(U), U = 0, A.cx = b.clientX, A.cy = b.clientY, Me();
    const E = A.live;
    A = null, Z && (Z.hidden = !0), E && (Te = !0, n.sweepEnd());
  }
  e.addEventListener("pointerdown", Ce);
  function Oe(b) {
    if (Te) {
      Te = !1;
      return;
    }
    const E = b.target.closest(".tile");
    if (!E || !e.contains(E)) return;
    const C = Number(E.dataset.index), K = s[C];
    K && n.activate && n.activate(K, b, E, C);
  }
  e.addEventListener("click", Oe), window.addEventListener("scroll", N, { passive: !0 });
  let H = 0;
  const ve = new ResizeObserver(() => {
    clearTimeout(H), H = setTimeout(I, 100);
  });
  ve.observe(e);
  const V = new IntersectionObserver(
    (b) => {
      b.some((E) => E.isIntersecting) && ue();
    },
    { rootMargin: "0px 0px " + ua + "px 0px" }
  );
  return V.observe(t), y = e.clientWidth, ue(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      u++, w = !1;
      for (const [b, E] of Array.from(i)) Q(b, E);
      s.length = 0, a.length = 0, c.length = 0, o = 0, f = En, g = null, m = null, _ = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), ue();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(b) {
      const E = typeof b == "number" ? b : null;
      E !== m && (m = E, Y(), x({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [b, E] of i) n.fill(E, s[b]);
    },
    // Walk to one tile: read pages until it has a box, scroll the sheet so it
    // sits in the middle of the window, mount it, and hand back the item with
    // the element it was mounted into.
    //
    // Not `reveal`: that word is taken, and it means Explorer everywhere else in
    // this codebase. The overlay steps with this, and stepping *is* this scroll:
    // the tile the pane is drawing is the tile behind the pane, so the flight
    // has a real rect to leave from on every step rather than only on the first,
    // running off the loaded end pages the same way scrolling always has, and
    // closing the overlay leaves the reader where the walk ended.
    //
    // `packed` and not `items.length`, because a trailing partial row is held
    // back until the page after it — an item can be read and still have no box.
    async walkTo(b) {
      for (; b >= o && !h; ) {
        const fe = o;
        if (await ue(), o === fe) break;
      }
      const E = a.find((fe) => fe.to > b);
      if (!E) return null;
      const C = Math.max(0, (window.innerHeight - E.height) / 2);
      window.scrollTo(0, Math.max(0, e.offsetTop + E.top - C)), de();
      const K = i.get(b);
      return K ? { item: s[b], tile: K } : null;
    },
    // Put the keyboard back on a tile. The overlay hands focus back on the way
    // out, and after a walk that is a different tile from the one it opened on.
    focus(b) {
      i.get(b)?.focus();
    },
    // Whether a press on the canvas rubber-bands. Select mode turns on and off
    // under a sheet that outlives the toggle, exactly as the tickboxes do.
    setSweeping(b) {
      G = b;
    },
    // The items between two indices, inclusive, in the order the sheet holds
    // them — which is the order the grid is sorted in. Shift-click's range: the
    // gesture knows two tiles and this is what lies between them.
    itemsBetween(b, E) {
      return s.slice(Math.min(b, E), Math.max(b, E) + 1);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(b) {
      for (const [E, C] of i)
        s[E] === b && n.fill && n.fill(C, b);
    },
    destroy() {
      u++, e.removeEventListener("click", Oe), e.removeEventListener("pointerdown", Ce), window.removeEventListener("pointermove", _e), window.removeEventListener("pointerup", xe), window.removeEventListener("pointercancel", xe), window.removeEventListener("scroll", N), ve.disconnect(), V.disconnect(), clearTimeout(H), cancelAnimationFrame(v), cancelAnimationFrame(U), Z?.remove();
    }
  };
}
function Lc(e) {
  try {
    const t = Uint8Array.from(atob(e), (O) => O.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, s = t[3] | t[4] << 8, a = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, c = (n >> 18 & 31) / 31, o = n >> 23, f = (s >> 3 & 63) / 63, g = (s >> 9 & 63) / 63, m = s >> 15, _ = Math.max(3, m ? o ? 5 : 7 : s & 7), h = Math.max(3, m ? s & 7 : o ? 5 : 7);
    let w = o ? 6 : 5, y = 0;
    const u = (O, re, de) => {
      const j = [];
      for (let te = 0; te < re; te++)
        for (let ue = te ? 0 : 1; ue * re < O * (re - te); ue++) {
          const me = t[w + (y >> 1)] >> ((y++ & 1) << 2) & 15;
          j.push((me / 7.5 - 1) * de);
        }
      return j;
    }, v = u(_, h, c), x = u(3, 3, f * 1.25), P = u(3, 3, g * 1.25), F = _ / h, Y = Math.max(1, Math.round(F > 1 ? 32 : 32 * F)), X = Math.max(1, Math.round(F > 1 ? 32 / F : 32)), ee = document.createElement("canvas");
    ee.width = Y, ee.height = X;
    const Q = ee.getContext("2d"), q = Q.createImageData(Y, X), D = [], J = [];
    for (let O = 0, re = 0; O < X; O++)
      for (let de = 0; de < Y; de++, re += 4) {
        let j = a, te = i, ue = l;
        for (let I = 0; I < _; I++) D[I] = Math.cos(Math.PI / Y * (de + 0.5) * I);
        for (let I = 0; I < h; I++) J[I] = Math.cos(Math.PI / X * (O + 0.5) * I);
        for (let I = 0, G = 0; I < h; I++)
          for (let A = I ? 0 : 1; A * h < _ * (h - I); A++, G++)
            j += v[G] * D[A] * J[I] * 2;
        for (let I = 0, G = 0; I < 3; I++)
          for (let A = I ? 0 : 1; A < 3 - I; A++, G++) {
            const U = D[A] * J[I] * 2;
            te += x[G] * U, ue += P[G] * U;
          }
        const me = j - 2 / 3 * te, R = (3 * j - me + ue) / 2, N = R - ue;
        q.data[re] = Math.max(0, Math.min(255, Math.round(255 * R))), q.data[re + 1] = Math.max(0, Math.min(255, Math.round(255 * N))), q.data[re + 2] = Math.max(0, Math.min(255, Math.round(255 * me))), q.data[re + 3] = 255;
      }
    return Q.putImageData(q, 0, 0), ee.toDataURL();
  } catch {
    return null;
  }
}
var Fc = /* @__PURE__ */ z('<main id="canvas"><div id="sentinel"></div></main>');
function Dc(e, t) {
  Et(t, !0);
  let n = ae(t, "key", 3, ""), s = ae(t, "total", 3, null), a = ae(t, "triage", 3, !1), i = ae(t, "excludedDirs", 19, () => []), l = ae(t, "selecting", 3, !1), c = ae(t, "selectedKeys", 19, () => []), o = ae(t, "onActivate", 3, () => {
  }), f = ae(t, "onOverride", 3, async () => null), g = ae(t, "onExcludeFolder", 3, () => {
  }), m = ae(t, "onState", 3, () => {
  }), _ = ae(t, "onSweepStart", 3, () => {
  }), h = ae(t, "onSweepMove", 3, () => {
  }), w = ae(t, "onSweepEnd", 3, () => {
  }), y = /* @__PURE__ */ $(null), u = /* @__PURE__ */ $(null), v = null, x = "";
  const P = /* @__PURE__ */ ie(() => new Set(c())), F = { null: "exclude", exclude: "include", include: "clear" };
  function Y(R) {
    const N = R.toLowerCase().startsWith(ar.toLowerCase()) ? R.slice(ar.length + 1) : R;
    return N.length > 64 ? "…" + N.slice(-64) : N;
  }
  function X(R) {
    const N = document.createElement("div");
    N.className = "tile-path", R.appendChild(N);
    const I = document.createElement("button");
    I.className = "chip", I.type = "button", R.appendChild(I);
    const G = document.createElement("button");
    G.className = "dirchip", G.type = "button", G.textContent = "dir", R.appendChild(G);
  }
  function ee(R, N) {
    const I = R.querySelector(".tile-path");
    I && (I.textContent = N.p ? Y(N.p) : "");
    const G = R.querySelector(".dirchip");
    if (G) {
      const U = Za(N.p ?? ""), Z = U !== "" && Ns(i(), U);
      G.hidden = U === "", G.disabled = Z, G.dataset.state = Z ? "exclude" : "none", G.title = Z ? `already excluded: ${U}` : `exclude everything under ${U}, subfolders included — one exclude rule at the end of the order`;
    }
    const A = R.querySelector(".chip");
    A && (A.dataset.state = N.o || "none", A.textContent = N.o === "exclude" ? "drop" : N.o === "include" ? "keep" : "·", A.title = N.o === "exclude" ? "overridden: excluded — click to keep" : N.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  function Q(R) {
    const N = document.createElement("span");
    N.className = "tick", R.appendChild(N);
  }
  function q(R, N) {
    R.dataset.selected = r(P).has(Ls(N)) ? "on" : "off";
  }
  cr(() => (v = Ic(r(y), r(u), {
    fetchPage: (R) => t.fetchPage(R),
    thumbHash: Lc,
    extend: a() ? X : Q,
    fill: a() ? ee : q,
    onState: (R) => m()(R),
    sweepStart: (R, N) => _()(R, N),
    sweepMove: (R) => h()(R),
    sweepEnd: () => w()(),
    activate: async (R, N, I, G) => {
      if (N.target.closest(".dirchip")) {
        g()(R);
        return;
      }
      if (!N.target.closest(".chip")) {
        o()(R, I, G, N.shiftKey);
        return;
      }
      const A = F[R.o ?? "null"];
      R.o = await f()(R, A), ee(I, R);
    }
  }), x = n(), v.setSweeping(l()), () => v?.destroy())), bt(() => {
    v?.setSweeping(l());
  }), bt(() => {
    const R = n(), N = s();
    v && (R !== x && (x = R, v.reset()), v.setTotal(N));
  });
  function D(R) {
    return v?.walkTo(R);
  }
  function J(R) {
    v?.focus(R);
  }
  function O(R, N) {
    return v?.itemsBetween(R, N) ?? [];
  }
  let re = "";
  bt(() => {
    const R = i().join(`
`);
    !v || R === re || (re = R, v.refill());
  });
  let de = null;
  bt(() => {
    const R = c();
    !v || R === de || (de = R, v.refill());
  });
  var j = { walkTo: D, focusTile: J, itemsBetween: O }, te = Fc();
  let ue;
  var me = d(te);
  return kr(me, (R) => S(u, R), () => r(u)), kr(te, (R) => S(y, R), () => r(y)), B(() => ue = Ee(te, 1, "", null, ue, { selecting: l() })), M(e, te), Tt(j);
}
var jc = /* @__PURE__ */ z('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Hc = /* @__PURE__ */ z('<th class="num svelte-1v3p82v"> </th>'), Bc = /* @__PURE__ */ z('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), qc = /* @__PURE__ */ z('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Uc = /* @__PURE__ */ z('<td class="num svelte-1v3p82v"> </td>'), Yc = /* @__PURE__ */ z('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), Wc = /* @__PURE__ */ z('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Gc(e, t) {
  Et(t, !0);
  let n = ae(t, "rows", 19, () => []), s = ae(t, "rules", 19, () => []), a = ae(t, "root", 3, null), i = ae(t, "picked", 3, null), l = ae(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const c = /* @__PURE__ */ ie(() => t.screen.rule !== !1);
  function o(y) {
    return t.screen.label ? t.screen.label(y) : y.key;
  }
  const f = /* @__PURE__ */ ie(() => new Map(n().map((y) => [
    y.key,
    t.screen.rule === !1 ? null : Qa(s(), t.screen.toRule(y, a()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var _ = Cs(), h = dt(_);
  {
    var w = (y) => {
      var u = Wc(), v = d(u), x = d(v), P = d(x);
      {
        var F = (D) => {
          var J = jc();
          M(D, J);
        };
        ne(P, (D) => {
          r(c) && D(F);
        });
      }
      var Y = p(P), X = d(Y), ee = p(Y, 3);
      {
        var Q = (D) => {
          var J = Hc(), O = d(J);
          B(() => T(O, t.screen.heading[1])), M(D, J);
        };
        ne(ee, (D) => {
          t.screen.heading[1] && D(Q);
        });
      }
      var q = p(v);
      Xe(q, 23, n, (D) => D.key, (D, J, O) => {
        const re = /* @__PURE__ */ ie(() => r(f).get(r(J).key));
        var de = Yc();
        let j;
        var te = d(de);
        {
          var ue = (_e) => {
            const xe = /* @__PURE__ */ ie(() => l().has(r(J).key));
            var Oe = Bc(), H = d(Oe);
            let ve;
            var V = d(H);
            B(
              (b) => {
                ve = Ee(H, 1, "tick svelte-1v3p82v", null, ve, { on: r(xe) }), pe(H, "aria-checked", r(xe)), pe(H, "aria-label", `select ${b ?? ""}`), T(V, r(xe) ? "✓" : "");
              },
              [() => o(r(J))]
            ), se("click", H, (b) => {
              b.stopPropagation(), t.oncheck(r(J), r(O), b.shiftKey);
            }), M(_e, Oe);
          };
          ne(te, (_e) => {
            r(c) && _e(ue);
          });
        }
        var me = p(te), R = d(me);
        let N;
        var I = d(R), G = p(R), A = p(G);
        {
          var U = (_e) => {
            var xe = qc();
            M(_e, xe);
          };
          ne(A, (_e) => {
            r(J).scope === "whole inventory" && _e(U);
          });
        }
        var Z = p(me), Te = d(Z), Ae = p(Z), we = d(Ae), Me = p(Ae);
        {
          var Ce = (_e) => {
            var xe = Uc(), Oe = d(xe);
            B(() => T(Oe, r(J).detail ?? "")), M(_e, xe);
          };
          ne(Me, (_e) => {
            t.screen.heading[1] && _e(Ce);
          });
        }
        B(
          (_e, xe, Oe) => {
            j = Ee(de, 1, "svelte-1v3p82v", null, j, {
              picked: i() === r(J).key,
              clickable: t.screen.sheet !== !1
            }), N = Ee(R, 1, "mark svelte-1v3p82v", null, N, {
              exclude: r(re) === "exclude",
              include: r(re) === "include"
            }), pe(R, "title", m[r(re)] ?? ""), T(I, g[r(re)] ?? ""), T(G, `${_e ?? ""} `), T(Te, xe), T(we, Oe);
          },
          [
            () => o(r(J)),
            () => Pe(r(J).paths),
            () => Ht(r(J).bytes)
          ]
        ), se("click", de, () => t.onpick(r(J))), M(D, de);
      }), B(() => T(X, t.screen.heading[0] ?? "")), M(y, u);
    };
    ne(h, (y) => {
      n().length && y(w);
    });
  }
  M(e, _), Tt();
}
Kt(["click"]);
var Kc = /* @__PURE__ */ z('<button class="twisty svelte-pucy57"> </button>'), Xc = /* @__PURE__ */ z('<span class="twisty leaf svelte-pucy57">·</span>'), $c = /* @__PURE__ */ z('<span class="name root svelte-pucy57"> </span>'), Vc = /* @__PURE__ */ z('<button class="name svelte-pucy57"> </button>'), Jc = /* @__PURE__ */ z('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Zc = /* @__PURE__ */ z('<div class="note svelte-pucy57"> </div>'), Qc = /* @__PURE__ */ z('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), eu = /* @__PURE__ */ z('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), tu = /* @__PURE__ */ z('<div class="tree svelte-pucy57"></div>');
function nu(e, t) {
  Et(t, !0);
  let n = ae(t, "version", 3, 0), s = ae(t, "excludedDirs", 19, () => []), a = ae(t, "picked", 3, null), i = ae(t, "busy", 3, !1), l = /* @__PURE__ */ $(De(/* @__PURE__ */ new Map())), c = /* @__PURE__ */ $(De(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ $(De(/* @__PURE__ */ new Set())), f = /* @__PURE__ */ $(De(/* @__PURE__ */ new Set()));
  async function g(u) {
    S(o, new Set(r(o)).add(u), !0);
    const v = await t.onload(u), x = new Map(r(l)), P = new Set(r(f));
    v ? (x.set(u, v), P.delete(u)) : P.add(u), S(l, x, !0), S(f, P, !0), S(o, new Set([...r(o)].filter((F) => F !== u)), !0);
  }
  function m(u) {
    if (r(c).has(u)) {
      S(c, new Set([...r(c)].filter((v) => v !== u)), !0);
      return;
    }
    S(c, new Set(r(c)).add(u), !0), r(l).has(u) || g(u);
  }
  let _ = -1;
  bt(() => {
    const u = n();
    if (u !== _) {
      _ = u, r(c).has(t.root) || S(c, new Set(r(c)).add(t.root), !0);
      for (const v of r(c)) g(v);
    }
  });
  const h = /* @__PURE__ */ ie(() => {
    const u = [], v = (Y, X, ee, Q, q, D) => {
      const J = r(l).get(Y), O = r(c).has(Y);
      if (u.push({
        key: Y,
        name: X,
        depth: ee,
        paths: Q,
        bytes: q,
        deeper: D,
        expanded: O,
        here: J?.here ?? null,
        truncated: !!J?.truncated,
        loading: r(o).has(Y),
        failed: r(f).has(Y),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: Ns(s(), Y)
      }), !(!O || !J))
        for (const re of J.children)
          v(re.path, re.name, ee + 1, re.paths, re.bytes, re.deeper);
    }, x = r(l).get(t.root), P = x ? x.children.reduce((Y, X) => Y + X.paths, 0) + x.here.paths : 0, F = x ? x.children.reduce((Y, X) => Y + X.bytes, 0) + x.here.bytes : 0;
    return v(t.root, t.root, 0, P, F, !0), u;
  }), w = 8;
  var y = tu();
  Xe(y, 21, () => r(h), (u) => u.key, (u, v) => {
    var x = eu(), P = dt(x);
    let F;
    var Y = d(P);
    let X;
    var ee = p(Y, 2);
    {
      var Q = (A) => {
        var U = Kc(), Z = d(U);
        B(() => {
          pe(U, "aria-expanded", r(v).expanded), pe(U, "aria-label", `${r(v).expanded ? "collapse" : "expand"} ${r(v).name ?? ""}`), pe(U, "title", r(v).expanded ? "collapse" : "expand"), T(Z, r(v).loading ? "·" : r(v).expanded ? "▾" : "▸");
        }), se("click", U, () => m(r(v).key)), M(A, U);
      }, q = (A) => {
        var U = Xc();
        M(A, U);
      };
      ne(ee, (A) => {
        r(v).deeper ? A(Q) : A(q, -1);
      });
    }
    var D = p(ee, 2);
    {
      var J = (A) => {
        var U = $c(), Z = d(U);
        B(() => T(Z, r(v).key)), M(A, U);
      }, O = (A) => {
        var U = Vc(), Z = d(U);
        B(() => {
          pe(U, "title", `Show every kept file under ${r(v).key ?? ""}`), T(Z, r(v).name);
        }), se("click", U, () => t.onpick(r(v))), M(A, U);
      };
      ne(D, (A) => {
        r(v).depth === 0 ? A(J) : A(O, -1);
      });
    }
    var re = p(D, 2), de = d(re), j = p(re, 2), te = d(j), ue = p(j, 2), me = p(P, 2);
    {
      var R = (A) => {
        var U = Jc();
        let Z;
        B((Te) => Z = Jt(U, "", Z, Te), [
          () => ({
            "padding-left": `${Math.min(r(v).depth, w) * 11 + 18}px`
          })
        ]), M(A, U);
      }, N = (A) => {
        var U = Zc();
        let Z;
        var Te = d(U);
        B(
          (Ae, we, Me) => {
            Z = Jt(U, "", Z, Ae), T(Te, `${we ?? ""} directly here · ${Me ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(v).depth, w) * 11 + 18}px`
            }),
            () => Pe(r(v).here.paths),
            () => Ht(r(v).here.bytes)
          ]
        ), M(A, U);
      };
      ne(me, (A) => {
        r(v).expanded && r(v).failed ? A(R) : r(v).expanded && r(v).here && r(v).here.paths > 0 && A(N, 1);
      });
    }
    var I = p(me, 2);
    {
      var G = (A) => {
        var U = Qc();
        let Z;
        B((Te) => Z = Jt(U, "", Z, Te), [
          () => ({
            "padding-left": `${Math.min(r(v).depth, w) * 11 + 18}px`
          })
        ]), M(A, U);
      };
      ne(I, (A) => {
        r(v).truncated && A(G);
      });
    }
    B(
      (A, U, Z) => {
        F = Ee(P, 1, "row svelte-pucy57", null, F, {
          picked: a() === r(v).key,
          gone: r(v).excluded
        }), X = Jt(Y, "", X, A), T(de, U), T(te, Z), ue.disabled = i() || r(v).excluded || r(v).depth === 0, pe(ue, "title", r(v).depth === 0 ? "The library root is not excludable from here." : r(v).excluded ? "already excluded" : `Exclude everything under ${r(v).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(v).depth, w) * 11}px` }),
        () => Pe(r(v).paths),
        () => Ht(r(v).bytes)
      ]
    ), se("click", ue, () => t.onexclude(r(v))), M(u, x);
  }), M(e, y), Tt();
}
Kt(["click"]);
var ru = /* @__PURE__ */ z('<button title="Back to its default">↺</button>'), su = /* @__PURE__ */ z('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), au = /* @__PURE__ */ z('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), iu = /* @__PURE__ */ z('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), lu = /* @__PURE__ */ z('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), ou = /* @__PURE__ */ z('<li><code class="svelte-1hh0fwb"> </code> </li>'), cu = /* @__PURE__ */ z(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
        setting back. The default is the studio's own for everything upstream has a control for,
        and this build's for the nine it has not — the saturation, the count pane's height, the
        three placement numbers, and then the control fill, the control text and that pane's own
        ground and ink. The two buttons at the bottom move the whole material at once.</p> <!> <p class="note svelte-1hh0fwb"> </p> <button class="ghost flip svelte-1hh0fwb"> </button> <!> <section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb">Blur edge</h2> <p class="note svelte-1hh0fwb">Upstream chooses per pixel between a sharp and a pre-blurred copy of the backdrop.
          One backdrop filter cannot vary across a pane, so what this switches is the same
          question about the same two images: on, the rim lenses the blurred backdrop; off, it
          lenses the sharp one and the blur that follows softens the result.</p> <div><label class="check svelte-1hh0fwb"><input type="checkbox"/> <span class="name svelte-1hh0fwb">Blur at the edge</span></label> <!></div></section> <section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb">Not here</h2> <p class="note svelte-1hh0fwb">Controls its editor has that a header has nowhere to put.</p> <ul class="absent svelte-1hh0fwb"></ul></section> <section class="export svelte-1hh0fwb"><h2 class="svelte-1hh0fwb">Export</h2> <p class="note svelte-1hh0fwb">Paste this back into the conversation to have it become the shipped material. Studio
          defaults puts the nine settings upstream has no control for — the saturation, the count
          pane's height, the three placement numbers, the control fill, the control text and the
          count's own two colours — back to what ships, there being nothing else for them to go
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), uu = /* @__PURE__ */ z('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function du(e, t) {
  Et(t, !0);
  const n = "photos.glass", s = [
    {
      title: "Refraction",
      note: "The displacement map: how wide the bevel is, how hard it bends, and how far red goes past blue. Thickness is capped at a bar-height's worth of band — about 22px on a 56px bar — because a rim as deep as the pane is not a rim, it is a lens, and it smears the text. Past that the slider moves and the pane does not.",
      rows: [
        ["refThickness", "Thickness", 1, 80, 0.01],
        ["refFactor", "IOR", 1, 4, 0.01],
        ["refDispersion", "Dispersion", 0, 50, 0.01]
      ]
    },
    {
      title: "Fresnel",
      note: "The flat rim. Range is the band's width, hardness is how much of it is a soft edge, factor is how bright.",
      rows: [
        ["refFresnelRange", "Range", 0, 100, 0.01],
        ["refFresnelHardness", "Hardness", 0, 100, 0.01],
        ["refFresnelFactor", "Factor", 0, 100, 0.01]
      ]
    },
    {
      title: "Glare",
      note: "The angular rim, read off the surface normal: two opposite lobes, the far one dimmed by Opposite, and a dark notch at each of the two corners between them. Angle turns the pair; at the shipped -45 the notches sit top-right and bottom-left. Convergence is the exponent the lobe is taken to, so low is a rim lit the whole way round and high is two hot corners.",
      rows: [
        ["glareRange", "Range", 0, 100, 0.01],
        ["glareHardness", "Hardness", 0, 100, 0.01],
        ["glareFactor", "Factor", 0, 120, 0.01],
        ["glareConvergence", "Convergence", 0, 100, 0.01],
        ["glareOppositeFactor", "Opposite", 0, 100, 0.01],
        ["glareAngle", "Angle", -180, 180, 0.01]
      ]
    },
    {
      title: "Blur",
      note: "Studio opens on 1, which is a clear pane. Everything under this header is a photograph, so what ships is 18.",
      rows: [["blurRadius", "Radius", 1, 200, 1]]
    },
    {
      title: "Saturation",
      note: "Not upstream's — its shader has no saturation term at all, and this was a literal 200% in the stylesheet with a second 170% on the panels until it was asked what it was for. It multiplies the chroma of whatever photograph is behind the pane, so past a point the header stops being glass over a photograph and becomes a more colourful copy of one. 100 leaves the backdrop its own colour. The panels take this same number — saturation is not a depth. No studio value, so the default is what ships.",
      rows: [["saturation", "Amount", 0, 300, 1]]
    },
    {
      title: "Shadow",
      note: "Y is upstream's sign — negative puts the shadow below the pane. Scroll before judging any of these: the bar and the count carry none of their shadow until a photograph is under them, all of it once one has passed under the whole pane, and the four numbers here only say what the whole of it is.",
      rows: [
        ["shadowExpand", "Expand", 2, 100, 0.01],
        ["shadowFactor", "Factor", 0, 100, 0.01],
        ["shadowX", "Offset X", -20, 20, 0.01],
        ["shadowY", "Offset Y", -20, 20, 0.01]
      ]
    },
    {
      title: "Shape",
      note: "Radius in pixels, clamped by the browser to half the shorter side — on a 56px bar anything past 28 is the same capsule. Roundness is the superellipse exponent: 2 is the ordinary circular corner, 4 is a squircle, 7 is nearly square. CSS takes the logarithm of it rather than the exponent, so the painted corner and the one the map refracts are the same corner.",
      rows: [
        ["shapeRadius", "Radius", 1, 100, 0.1],
        ["shapeRoundness", "Roundness", 2, 7, 0.01]
      ]
    },
    {
      title: "Count height",
      note: "The only size in this material, and it belongs to the count pane alone: the bar is as tall as the pills in it and grows when the chips wrap, but the count holds one number and nothing that has to fit beside it. It ships at the bar's own 56, so the two start level; below that it centres against the bar, above it the whole header grows. The floor is 30 — the height of the sort, Filters and Triage pills themselves, which is as short as a pane holding a line of text can honestly be. No studio value — its shapeHeight sizes a demo blob, so the default is what ships.",
      rows: [["tallyHeight", "Height", 30, 160, 1]]
    },
    {
      title: "Placement",
      note: "Where the bar sits and where the photographs start under it. Top and Sides are the bar's own margins and nothing else's, kept as separate numbers because only the top has a photograph scrolling under it. Sides is one number for both edges because the bar is centred, and at the shipped 650 the margin it opens on the left is where the count pane lives — hung off the bar rather than in the row with it, so what is centred in the window is the bar and not the pair. The grid keeps its own 14px from the left, right and bottom of the window whatever Sides says: pulling the floating bar in from the edge is a judgement about the bar, and dragging every photograph sideways with it is not what that judgement was about. Page top is the gap between the bar's bottom edge and the first row of tiles, and it ships at 14 — the same as the grid's own inset, so the space it keeps under the header is the space it keeps from every other edge. So two of these move the photographs and both move them down: Top, because the tiles follow the bar rather than sliding under it, and Page top, because that is what it is for. Sides moves the bar and the count alone. Its slider ends at half this window's width and re-scales when you drag the window, but the bar stops shrinking at 560px and the margin gives way instead, so the last of that range does nothing here. No studio value — its editor's shape controls size a demo blob, so the default is what ships.",
      rows: [
        ["headerTop", "Top", 0, 300, 1],
        ["headerSide", "Sides", 0, (O) => Math.floor(O / 2), 1],
        ["pageTop", "Page top", 0, 300, 1]
      ]
    }
  ], a = {
    tint: {
      title: "Tint",
      note: "Studio's own control, and it opens at alpha 0 — a clear pane, with nothing under the text. This one is per theme, because which way the ground has to move is what the palette decides about this material. It is the bar and the panels that drop out of it; the count has its own, below."
    },
    control: {
      title: "Control fill",
      note: "The pill behind each button in the bar. This is the way out of a transparent pane: put the ground under the words rather than under the whole bar, and the photograph stays visible between them. Hover and open are washes laid over this, so a fill you make solid stays solid. No studio value — the default is what ships."
    },
    ink: {
      title: "Control text",
      note: "Everything written on the bar and its panels: the label colours are fractions of it, so this one number moves them all. The count is written in its own, below. No studio value — the default is what ships."
    },
    tally: {
      title: "Count tint",
      note: "The ground behind the number, which the bar's tint no longer decides. It is the one pane up there that is an answer rather than a control, and the tint that reads under five pills is not necessarily the one a five-digit number wants behind it. Ships equal to the bar's, so the header does not change until you move this."
    },
    tallyInk: {
      title: "Count text",
      note: "The number, the word beside it and the spinner's label, all of them fractions of this one. Separate from the control text because a ground you can move on its own is a ground whose ink has to move with it. No studio value — the default is what ships."
    }
  }, i = [
    ["r", "Red", 255],
    ["g", "Green", 255],
    ["b", "Blue", 255],
    ["a", "Alpha", 1]
  ], l = [
    [
      "renderer, language, Show Step",
      "editor plumbing — this has one renderer and no step view"
    ],
    [
      "bgType",
      "its demo owns its backdrop; here the backdrop is the grid"
    ],
    [
      "shapeWidth, shapeHeight",
      "the bar is sized by its contents and the window; the count pane's own height, and where the row sits in that window, are above"
    ],
    [
      "mergeRate, showShape1, springSizeFactor",
      "the two-blob demo, which is one pane here"
    ]
  ];
  let c = /* @__PURE__ */ $(De(uo())), o = /* @__PURE__ */ $(!0), f = /* @__PURE__ */ $(!1), g = /* @__PURE__ */ $(De(si())), m = /* @__PURE__ */ $(De(window.innerWidth));
  const _ = (O) => r(g) === "light" ? O.light : O.dark, h = (O) => O in zn ? zn : Mn, w = (O) => `rgba(${O.r}, ${O.g}, ${O.b}, ${O.a})`, y = /* @__PURE__ */ ie(() => JSON.stringify(r(c), null, 2));
  cr(() => {
    const O = localStorage.getItem(n);
    if (O)
      try {
        S(c, rs(JSON.parse(O)), !0);
        return;
      } catch {
      }
    Is();
  });
  function u(O) {
    S(c, rs({ ...r(c), ...O }), !0), localStorage.setItem(n, JSON.stringify(r(c))), S(f, !1);
  }
  function v(O) {
    S(c, rs(O), !0), localStorage.setItem(n, JSON.stringify(r(c))), S(f, !1);
  }
  function x(O) {
    u({ [O]: h(O)[O] });
  }
  function P() {
    S(g, ai(r(g) === "dark" ? "light" : "dark"), !0);
  }
  async function F() {
    await navigator.clipboard.writeText(r(y)), S(f, !0);
  }
  var Y = uu();
  let X;
  var ee = d(Y), Q = p(d(ee), 4), q = d(Q), D = p(ee, 2);
  {
    var J = (O) => {
      var re = cu();
      {
        const H = (V, b = zr, E = zr, C = zr) => {
          var K = ru();
          let fe;
          B(() => {
            fe = Ee(K, 1, "undo svelte-1hh0fwb", null, fe, { idle: !E() }), pe(K, "aria-label", `Reset ${b() ?? ""}`);
          }), se("click", K, function(...oe) {
            C()?.apply(this, oe);
          }), M(V, K);
        };
        var de = p(d(re), 2);
        Xe(de, 17, () => s, mt, (V, b) => {
          var E = au(), C = d(E), K = d(C), fe = p(C, 2), oe = d(fe), le = p(fe, 2);
          Xe(le, 17, () => r(b).rows, mt, (ke, We) => {
            var ze = /* @__PURE__ */ ie(() => Zr(r(We), 5));
            let qe = () => r(ze)[0], ht = () => r(ze)[1], Ze = () => r(ze)[2], rt = () => r(ze)[3], tn = () => r(ze)[4];
            const Nt = /* @__PURE__ */ ie(() => r(c)[qe()] !== h(qe())[qe()]), Xt = /* @__PURE__ */ ie(() => typeof rt() == "function" ? rt()(r(m)) : rt());
            var lt = su();
            let ot;
            var It = d(lt), Lt = d(It), vt = p(It, 2), st = p(vt, 2), $t = p(st, 2);
            H($t, ht, () => r(Nt), () => () => x(qe())), B(() => {
              ot = Ee(lt, 1, "row svelte-1hh0fwb", null, ot, { moved: r(Nt) }), T(Lt, ht()), pe(vt, "min", Ze()), pe(vt, "max", r(Xt)), pe(vt, "step", tn()), pe(vt, "aria-label", ht()), $n(vt, r(c)[qe()]), pe(st, "min", Ze()), pe(st, "max", r(Xt)), pe(st, "step", tn()), pe(st, "aria-label", `${ht() ?? ""} value`), $n(st, r(c)[qe()]);
            }), se("input", vt, (Ft) => u({ [qe()]: Number(Ft.currentTarget.value) })), se("input", st, (Ft) => u({ [qe()]: Number(Ft.currentTarget.value) })), M(ke, lt);
          }), B(() => {
            T(K, r(b).title), T(oe, r(b).note);
          }), M(V, E);
        });
        var j = p(de, 2), te = d(j), ue = p(j, 2), me = d(ue), R = p(ue, 2);
        Xe(R, 17, () => co, mt, (V, b) => {
          const E = /* @__PURE__ */ ie(() => _(r(b))), C = /* @__PURE__ */ ie(() => r(c)[r(E)]), K = /* @__PURE__ */ ie(() => r(b).base[r(E)]);
          var fe = lu(), oe = d(fe), le = d(oe), ke = p(le), We = d(ke), ze = p(oe, 2), qe = d(ze), ht = p(ze, 2);
          Xe(ht, 17, () => i, mt, (Nt, Xt) => {
            var lt = /* @__PURE__ */ ie(() => Zr(r(Xt), 3));
            let ot = () => r(lt)[0], It = () => r(lt)[1], Lt = () => r(lt)[2];
            const vt = /* @__PURE__ */ ie(() => r(C)[ot()] !== r(K)[ot()]);
            var st = iu();
            let $t;
            var Ft = d(st), ur = d(Ft), L = p(Ft, 2), ce = p(L, 2), Se = p(ce, 2);
            H(Se, It, () => r(vt), () => () => u({
              [r(E)]: { ...r(C), [ot()]: r(K)[ot()] }
            })), B(() => {
              $t = Ee(st, 1, "row svelte-1hh0fwb", null, $t, { moved: r(vt) }), T(ur, It()), pe(L, "max", Lt()), pe(L, "step", Lt() === 1 ? 0.01 : 1), pe(L, "aria-label", `${r(g) ?? ""} ${a[r(b).dark].title ?? ""} ${It() ?? ""}`), $n(L, r(C)[ot()]), pe(ce, "max", Lt()), pe(ce, "step", Lt() === 1 ? 0.01 : 1), pe(ce, "aria-label", `${r(g) ?? ""} ${a[r(b).dark].title ?? ""} ${It() ?? ""} value`), $n(ce, r(C)[ot()]);
            }), se("input", L, (Ne) => u({
              [r(E)]: {
                ...r(C),
                [ot()]: Number(Ne.currentTarget.value)
              }
            })), se("input", ce, (Ne) => u({
              [r(E)]: {
                ...r(C),
                [ot()]: Number(Ne.currentTarget.value)
              }
            })), M(Nt, st);
          });
          var Ze = p(ht, 2);
          let rt;
          var tn = d(Ze);
          B(
            (Nt, Xt) => {
              T(le, `${a[r(b).dark].title ?? ""} `), T(We, r(g)), T(qe, a[r(b).dark].note), rt = Jt(Ze, "", rt, Nt), T(tn, Xt);
            },
            [
              () => ({ background: w(r(C)) }),
              () => w(r(C))
            ]
          ), M(V, fe);
        });
        var N = p(R, 2), I = p(d(N), 4);
        let ve;
        var G = d(I), A = d(G), U = p(G, 2);
        H(U, () => "Blur at the edge", () => r(c).blurEdge !== zn.blurEdge, () => () => x("blurEdge"));
        var Z = p(N, 2), Te = p(d(Z), 4);
        Xe(Te, 21, () => l, mt, (V, b) => {
          var E = /* @__PURE__ */ ie(() => Zr(r(b), 2));
          let C = () => r(E)[0], K = () => r(E)[1];
          var fe = ou(), oe = d(fe), le = d(oe), ke = p(oe);
          B(() => {
            T(le, C()), T(ke, ` — ${K() ?? ""}`);
          }), M(V, fe);
        });
        var Ae = p(Z, 2), we = p(d(Ae), 4), Me = d(we), Ce = p(Me, 2), _e = p(Ce, 2), xe = d(_e), Oe = p(we, 2);
        B(() => {
          T(te, `The five colours below are per theme, and you are editing the ${r(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), T(me, `Edit the ${r(g) === "dark" ? "light" : "dark"} colours`), ve = Ee(I, 1, "row toggle svelte-1hh0fwb", null, ve, { moved: r(c).blurEdge !== zn.blurEdge }), Wl(A, r(c).blurEdge), T(xe, r(f) ? "Copied" : "Copy"), $n(Oe, r(y));
        }), se("click", ue, P), se("change", A, (V) => u({ blurEdge: V.currentTarget.checked })), se("click", Me, () => v(Mn)), se("click", Ce, () => v(zn)), se("click", _e, F);
      }
      M(O, re);
    };
    ne(D, (O) => {
      r(o) && O(J);
    });
  }
  B(() => {
    X = Ee(Y, 1, "tuner svelte-1hh0fwb", null, X, { folded: !r(o) }), pe(Q, "title", r(o) ? "Fold away" : "Open"), T(q, r(o) ? "–" : "+");
  }), Xl("innerWidth", (O) => S(m, O, !0)), se("click", Q, () => S(o, !r(o))), M(e, Y), Tt();
}
Kt(["click", "input", "change"]);
function ls(e, t, n, s) {
  const a = e + t;
  return a < 0 || a >= n && s ? null : a;
}
var fu = /* @__PURE__ */ z('<button><span class="n svelte-1n46o8q"> </span> </button>'), hu = /* @__PURE__ */ z('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), vu = /* @__PURE__ */ z('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), pu = /* @__PURE__ */ z('<div class="muted pad svelte-1n46o8q">loading…</div>'), gu = /* @__PURE__ */ z('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), _u = /* @__PURE__ */ z('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), bu = /* @__PURE__ */ z('<p class="blurb"> </p>'), mu = /* @__PURE__ */ z('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear</button> <span class="muted svelte-1n46o8q"><!></span></div>'), wu = /* @__PURE__ */ z('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), yu = /* @__PURE__ */ z('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), xu = /* @__PURE__ */ z('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), ku = /* @__PURE__ */ z("<div> </div>"), Su = /* @__PURE__ */ z('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function Eu(e, t) {
  Et(t, !0);
  const n = location.pathname === "/tune";
  let s = /* @__PURE__ */ $("grid"), a = /* @__PURE__ */ $(0), i = /* @__PURE__ */ $(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ $(De([])), c = /* @__PURE__ */ $(null), o = /* @__PURE__ */ $(null), f = /* @__PURE__ */ $(De(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ $(null), m = /* @__PURE__ */ $(null), _ = /* @__PURE__ */ $(null), h = /* @__PURE__ */ $(null), w = /* @__PURE__ */ $(!1), y = /* @__PURE__ */ $(!1), u = /* @__PURE__ */ $(!1), v = /* @__PURE__ */ $(!1), x = /* @__PURE__ */ $(De({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), P = /* @__PURE__ */ $(null), F = /* @__PURE__ */ $(0), Y = /* @__PURE__ */ $(null), X = /* @__PURE__ */ $(De({})), ee = /* @__PURE__ */ $("newest"), Q = /* @__PURE__ */ $(De(xo())), q = /* @__PURE__ */ $(null), D = /* @__PURE__ */ $(null), J = /* @__PURE__ */ $(!1), O = /* @__PURE__ */ $(De([])), re = /* @__PURE__ */ $(null), de = null;
  const j = /* @__PURE__ */ ie(() => Zs[r(a)]), te = /* @__PURE__ */ ie(() => r(j).table !== !1), ue = /* @__PURE__ */ ie(() => r(te) || r(j).tree === !0), me = /* @__PURE__ */ ie(() => r(j).sheet !== !1 && (r(o) !== null || !r(ue))), R = /* @__PURE__ */ ie(() => ({
    sort: r(ee),
    ...r(Q).on ? {
      stack: "on",
      ...r(Q).strictness === null ? {} : {
        strictness: String(r(Q).strictness),
        linkage: r(Q).linkage
      }
    } : {},
    ...Object.fromEntries(Object.entries(r(X)).filter(([, k]) => k.length > 0))
  })), N = /* @__PURE__ */ ie(() => r(O).map((k) => k.key)), I = /* @__PURE__ */ ie(() => Rc(r(O))), G = /* @__PURE__ */ ie(() => oi(r(Q)));
  bt(() => {
    r(G), qt(() => {
      S(O, [], !0);
    });
  }), bt(() => {
    r(R), qt(() => {
      S(re, null);
    });
  });
  const A = /* @__PURE__ */ ie(() => r(s) === "grid" ? `grid:${JSON.stringify(r(R))}` : `triage:${r(a)}:${JSON.stringify(r(o))}`), U = /* @__PURE__ */ ie(() => r(j).rule === !1 || r(f).size === 0 ? [] : r(l).filter((k) => r(f).has(k.key)).map((k) => r(j).toRule(k, r(i))).filter((k) => k && Qa(r(m)?.rules ?? [], k) !== "exclude")), Z = /* @__PURE__ */ ie(() => (r(m)?.rules ?? []).filter((k) => k.decision === "exclude" && k.term?.column === "dir_under").map((k) => String(k.term.value).replace(/[\\/]+$/, "").toLowerCase())), Te = Jl();
  function Ae(k) {
    S(P, String(k), !0);
  }
  async function we(k) {
    try {
      return S(P, null), await k();
    } catch (W) {
      return Ae(W), null;
    }
  }
  const Me = Zl(
    () => {
      S(y, !0), we(async () => {
        const k = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: W, value: he } = await Te(() => Ge.counts(r(o), k));
        W || S(m, he, !0);
      }).finally(() => {
        S(y, !1);
      });
    },
    220
  );
  async function Ce() {
    S(_, "loading");
    const k = await we(() => Ge.files());
    S(_, k, !0), S(w, !1), S(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function _e(k = !1) {
    if (r(s) !== "triage" || !r(te)) {
      S(l, [], !0);
      return;
    }
    S(v, !0);
    const W = r(j).name === "source_folder" && r(i) ? { root: r(i) } : {};
    k && (W.live = "1");
    const he = await we(() => Ge.screen(r(j).name, W));
    S(l, he?.rows ?? [], !0), S(v, !1);
  }
  let xe = !1;
  bt(() => {
    r(a), r(s), qt(() => {
      S(c, null), S(o, null), S(i, null), V(), r(s) === "triage" && (_e(), Me.now(), xe || (xe = !0, Ce()));
    });
  }), bt(() => {
    r(i), qt(() => {
      r(s) === "triage" && (V(), _e());
    });
  }), cr(() => {
    we(async () => {
      S(Y, await Ge.facets(), !0);
    });
  }), bt(() => {
    const k = r(Y)?.stacking?.settings;
    k && qt(() => {
      const W = ko(r(Q), k);
      W !== r(Q) && S(Q, ra(W), !0);
    });
  });
  function Oe(k, W) {
    S(X, { ...r(X), [k]: W }, !0);
  }
  function H(k) {
    if (r(j).sheet !== !1) {
      if (r(j).drill && !r(i)) {
        S(c, k.key, !0), S(
          o,
          {
            ...r(j).toRule(k, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), S(i, k.key, !0);
        return;
      }
      S(c, k.key, !0), S(
        o,
        {
          ...r(j).toRule(k, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), Me();
    }
  }
  function ve(k, W, he) {
    const Ue = new Set(r(f)), Ye = !Ue.has(k.key), ct = he && r(g) !== null ? r(l).findIndex((xt) => xt.key === r(g)) : -1, [ln, _n] = ct < 0 ? [W, W] : ct < W ? [ct, W] : [W, ct];
    for (let xt = ln; xt <= _n; xt++)
      Ye ? Ue.add(r(l)[xt].key) : Ue.delete(r(l)[xt].key);
    S(f, Ue, !0), S(g, k.key, !0);
  }
  function V() {
    S(f, /* @__PURE__ */ new Set(), !0), S(g, null);
  }
  function b(k) {
    S(o, k, !0), S(
      c,
      null
      // it no longer corresponds to a row
    ), Me();
  }
  function E(k = !1) {
    S(o, null), S(c, null), k && S(i, null), Me.now();
  }
  async function C() {
    S(
      w,
      !0
      // the distinct-content number now says so on its face
    ), hl(F), await _e(), Me.now();
  }
  async function K() {
    if (!r(o)) return;
    S(u, !0);
    const k = r(o).at === "end" ? void 0 : 0, W = await we(() => Ge.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(j).id} ${r(j).title}`
      },
      k
    ));
    S(u, !1), W && (S(o, null), S(c, null), await C());
  }
  async function fe() {
    const k = r(U);
    if (!k.length) {
      V();
      return;
    }
    S(u, !0);
    for (const W of k)
      if (!await we(() => Ge.addRule({
        column: W.column,
        op: W.op,
        value: W.value,
        decision: "exclude",
        note: `screen ${r(j).id} ${r(j).title}`
      }))) break;
    S(u, !1), V(), S(o, null), S(c, null), await C();
  }
  async function oe(k) {
    if (!k || Ns(r(Z), k)) return;
    S(u, !0);
    const W = await we(() => Ge.addRule({
      column: "dir_under",
      op: "=",
      value: k,
      decision: "exclude",
      note: `screen ${r(j).id} ${r(j).title}`
    }));
    S(u, !1), W && await C();
  }
  const le = (k) => oe(Za(k.p ?? "")), ke = (k) => oe(k.key);
  async function We(k) {
    S(u, !0), await we(() => Ge.deleteRule(k.id)), S(u, !1), await C();
  }
  async function ze(k, W) {
    S(u, !0), await we(() => Ge.moveRule(k.id, W)), S(u, !1), await C();
  }
  async function qe() {
    await we(async () => {
      S(Y, await Ge.facets(), !0);
    });
  }
  async function ht(k, W) {
    const he = await we(() => Ge.override(k.s, W));
    return he ? (S(w, !0), Me(), he.decision) : k.o ?? null;
  }
  async function Ze(k) {
    if (r(s) !== "grid") return Ge.page(r(o), k);
    const W = r(A), he = await Ge.photos({ limit: 500, ...r(R), ...k || {} });
    return r(O).length && W === r(A) && S(O, Tc(r(O), he.photos.map(Or)), !0), he;
  }
  const rt = (k) => k.m ?? [{ id: k.id, s: k.s, w: k.w, h: k.h }];
  function tn(k, W, he, Ue = !1) {
    if (r(s) === "grid") {
      if (r(J)) {
        if (Ue && r(re) !== null) {
          const Ye = r(D)?.itemsBetween(r(re), he) ?? [];
          S(O, ca(r(O), Ye.map(Or), !Nt(k)), !0);
        } else
          S(O, Ac(r(O), Or(k)), !0);
        S(re, he, !0);
        return;
      }
      S(
        q,
        {
          frames: rt(k),
          cover: k.id,
          origin: fa(W),
          at: he
        },
        !0
      );
      return;
    }
    we(() => Ge.revealOrigin(k.id));
  }
  const Nt = (k) => r(O).some((W) => W.key === Ls(k));
  function Xt(k, W) {
    de = {
      from: r(O),
      adding: k === null || !Nt(k)
    }, W !== null && S(re, W, !0);
  }
  function lt(k) {
    S(O, ca(de.from, k.map(Or), de.adding), !0);
  }
  function ot() {
    de = null;
  }
  function It() {
    S(O, [], !0), S(re, null);
  }
  const Lt = /* @__PURE__ */ ie(() => r(q) !== null && ls(r(q).at, -1, r(x).count, r(x).exhausted) !== null), vt = /* @__PURE__ */ ie(() => r(q) !== null && ls(r(q).at, 1, r(x).count, r(x).exhausted) !== null), st = 120;
  let $t = !1, Ft = 0;
  async function ur(k, W = !1) {
    const he = performance.now();
    if (!r(q) || $t || W && he - Ft < st) return;
    const Ue = ls(r(q).at, k, r(x).count, r(x).exhausted);
    if (Ue !== null) {
      Ft = he, $t = !0;
      try {
        const Ye = await r(D)?.walkTo(Ue);
        if (!Ye || !r(q)) return;
        S(
          q,
          {
            frames: rt(Ye.item),
            cover: Ye.item.id,
            origin: fa(Ye.tile),
            at: Ue
          },
          !0
        );
      } finally {
        $t = !1;
      }
    }
  }
  async function L() {
    const k = r(q)?.at ?? null;
    S(q, null), await Tl(), k !== null && r(D)?.focusTile(k);
  }
  function ce(k) {
    we(() => Ge.revealPhoto(k.id));
  }
  function Se() {
    we(() => navigator.clipboard.writeText(Cc(
      {
        stacking: r(Q),
        sort: r(ee),
        filters: r(X)
      },
      r(O)
    )));
  }
  var Ne = Su(), Ie = dt(Ne);
  {
    var Re = (k) => {
      qo(k, {
        get facets() {
          return r(Y);
        },
        get filters() {
          return r(X);
        },
        get sort() {
          return r(ee);
        },
        get stacking() {
          return r(Q);
        },
        get total() {
          return r(x).total;
        },
        get tiles() {
          return r(x).tiles;
        },
        get loading() {
          return r(x).loading;
        },
        get selecting() {
          return r(J);
        },
        get selectedTally() {
          return r(I);
        },
        onfilter: Oe,
        onsort: (W) => S(ee, W, !0),
        onstack: (W) => S(Q, ra(W), !0),
        onclear: () => S(X, {}, !0),
        onselecting: (W) => S(J, W, !0),
        onshare: Se,
        ondeselect: It,
        ontriage: () => S(s, "triage")
      });
    };
    ne(Ie, (k) => {
      r(s) === "grid" && k(Re);
    });
  }
  var Qe = p(Ie, 2);
  {
    var Mt = (k) => {
      du(k, {});
    };
    ne(Qe, (k) => {
      n && k(Mt);
    });
  }
  var Dt = p(Qe, 2);
  let tt;
  var nn = d(Dt);
  {
    var rn = (k) => {
      var W = _u(), he = d(W), Ue = d(he), Ye = p(he, 2);
      Xe(Ye, 21, () => Zs, mt, (pt, jt, bn) => {
        var mn = fu();
        let Un;
        var Yn = d(mn), Fe = d(Yn), gt = p(Yn, 1, !0);
        B(() => {
          Un = Ee(mn, 1, "nav svelte-1n46o8q", null, Un, { on: bn === r(a) }), T(Fe, r(jt).id), T(gt, r(jt).title);
        }), se("click", mn, () => S(a, bn, !0)), M(pt, mn);
      });
      var ct = p(Ye, 2);
      {
        var ln = (pt) => {
          var jt = gu(), bn = dt(jt), mn = d(bn);
          {
            var Un = (at) => {
              var ut = hu(), Wn = dt(ut), dr = /* @__PURE__ */ ie(() => E.bind(null, !0)), $r = p(Wn, 2), Vr = d($r);
              B(() => T(Vr, `inside ${r(i) ?? ""}`)), se("click", Wn, function(...Jr) {
                r(dr)?.apply(this, Jr);
              }), M(at, ut);
            }, Yn = (at) => {
              var ut = vu(), Wn = d(ut);
              B(() => T(Wn, r(j).relive)), se("click", ut, () => _e(!0)), M(at, ut);
            };
            ne(mn, (at) => {
              r(j).drill && r(i) ? at(Un) : r(j).relive && at(Yn, 1);
            });
          }
          var Fe = p(bn, 2);
          {
            var gt = (at) => {
              var ut = pu();
              M(at, ut);
            };
            ne(Fe, (at) => {
              r(v) && at(gt);
            });
          }
          var wn = p(Fe, 2);
          {
            let at = /* @__PURE__ */ ie(() => r(m)?.rules ?? []);
            Gc(wn, {
              get rows() {
                return r(l);
              },
              get screen() {
                return r(j);
              },
              get root() {
                return r(i);
              },
              get checked() {
                return r(f);
              },
              get rules() {
                return r(at);
              },
              get picked() {
                return r(c);
              },
              onpick: H,
              oncheck: ve
            });
          }
          M(pt, jt);
        };
        ne(ct, (pt) => {
          r(te) && pt(ln);
        });
      }
      var _n = p(ct, 2);
      {
        var xt = (pt) => {
          nu(pt, {
            get root() {
              return ar;
            },
            get version() {
              return r(F);
            },
            get excludedDirs() {
              return r(Z);
            },
            get picked() {
              return r(c);
            },
            get busy() {
              return r(u);
            },
            onload: (jt) => we(() => Ge.tree(jt)),
            onpick: H,
            onexclude: ke
          });
        };
        ne(_n, (pt) => {
          r(j).tree && pt(xt);
        });
      }
      var Mr = p(_n, 2);
      {
        let pt = /* @__PURE__ */ ie(() => r(m)?.rules ?? []), jt = /* @__PURE__ */ ie(() => r(m)?.unmatched ?? null);
        Ec(Mr, {
          get rules() {
            return r(pt);
          },
          get unmatched() {
            return r(jt);
          },
          get busy() {
            return r(u);
          },
          ondelete: We,
          onmove: ze
        });
      }
      var Ar = p(Mr, 2);
      vc(Ar, { oncomplete: qe }), se("click", Ue, () => S(s, "grid")), M(k, W);
    };
    ne(nn, (k) => {
      r(s) === "triage" && k(rn);
    });
  }
  var pn = p(nn, 2), je = d(pn);
  {
    var yt = (k) => {
      var W = xu(), he = dt(W), Ue = d(he), Ye = p(he, 2), ct = d(Ye), ln = p(Ye, 2);
      {
        var _n = (Fe) => {
          var gt = bu(), wn = d(gt);
          B(() => T(wn, r(j).note)), M(Fe, gt);
        };
        ne(ln, (Fe) => {
          r(j).note && Fe(_n);
        });
      }
      var xt = p(ln, 2);
      {
        var Mr = (Fe) => {
          sc(Fe, {
            get screen() {
              return r(j);
            }
          });
        };
        ne(xt, (Fe) => {
          r(j).name === "dimensions" && Fe(Mr);
        });
      }
      var Ar = p(xt, 2);
      oo(Ar, {
        get counts() {
          return r(m);
        },
        get files() {
          return r(_);
        },
        get filesAt() {
          return r(h);
        },
        get stale() {
          return r(w);
        },
        get candidate() {
          return r(o);
        },
        get busy() {
          return r(y);
        },
        onfiles: Ce
      });
      var pt = p(Ar, 2);
      {
        var jt = (Fe) => {
          var gt = mu(), wn = d(gt), at = d(wn), ut = p(wn, 2), Wn = d(ut), dr = p(ut, 2), $r = p(dr, 2), Vr = d($r);
          {
            var Jr = (yn) => {
              var Gn = Jn("already excluded — nothing left to write");
              M(yn, Gn);
            }, ci = (yn) => {
              var Gn = Jn();
              B((ui) => T(Gn, `one exclude rule each, at the end of the order${ui ?? ""}`), [
                () => r(U).length < r(f).size ? ` · ${Pe(r(f).size - r(U).length)} already excluded, skipped` : ""
              ]), M(yn, Gn);
            };
            ne(Vr, (yn) => {
              r(U).length ? yn(ci, -1) : yn(Jr);
            });
          }
          B(
            (yn, Gn) => {
              T(at, `${yn ?? ""} ticked`), ut.disabled = r(u) || !r(U).length, T(Wn, Gn), dr.disabled = r(u);
            },
            [
              () => Pe(r(f).size),
              () => r(u) ? "saving…" : `Exclude ${Pe(r(U).length)}`
            ]
          ), se("click", ut, fe), se("click", dr, V), M(Fe, gt);
        };
        ne(pt, (Fe) => {
          r(f).size && Fe(jt);
        });
      }
      var bn = p(pt, 2);
      wc(bn, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(j);
        },
        get saving() {
          return r(u);
        },
        onedit: b,
        onconfirm: K,
        onclear: E
      });
      var mn = p(bn, 2);
      {
        var Un = (Fe) => {
          var gt = wu(), wn = d(gt);
          B((at, ut) => T(wn, `${at ?? ""}${ut ?? ""} loaded${r(x).exhausted ? " · all of them" : ""}${r(x).loading ? " · loading…" : ""} `), [
            () => Pe(r(x).count),
            () => r(x).total ? " of " + Pe(r(x).total) : ""
          ]), M(Fe, gt);
        }, Yn = (Fe) => {
          var gt = yu();
          M(Fe, gt);
        };
        ne(mn, (Fe) => {
          r(me) ? Fe(Un) : r(j).sheet === !1 && Fe(Yn, 1);
        });
      }
      B(() => {
        T(Ue, `${r(j).id ?? ""} · ${r(j).title ?? ""}`), T(ct, r(j).blurb);
      }), M(k, W);
    };
    ne(je, (k) => {
      r(s) === "triage" && k(yt);
    });
  }
  var sn = p(je, 2);
  {
    var an = (k) => {
      {
        let W = /* @__PURE__ */ ie(() => r(s) === "grid" ? null : r(m)?.page_paths ?? null), he = /* @__PURE__ */ ie(() => r(s) === "triage"), Ue = /* @__PURE__ */ ie(() => r(s) === "grid" && r(J));
        kr(
          Dc(k, {
            get key() {
              return r(A);
            },
            fetchPage: Ze,
            get total() {
              return r(W);
            },
            get triage() {
              return r(he);
            },
            get excludedDirs() {
              return r(Z);
            },
            get selecting() {
              return r(Ue);
            },
            get selectedKeys() {
              return r(N);
            },
            onActivate: tn,
            onOverride: ht,
            onExcludeFolder: le,
            onSweepStart: Xt,
            onSweepMove: lt,
            onSweepEnd: ot,
            onState: (Ye) => S(x, { ...r(x), ...Ye }, !0)
          }),
          (Ye) => S(D, Ye, !0),
          () => r(D)
        );
      }
    };
    ne(sn, (k) => {
      (r(me) || r(s) === "grid") && k(an);
    });
  }
  var gn = p(Dt, 2);
  {
    var Cn = (k) => {
      Zo(k, {
        get frames() {
          return r(q).frames;
        },
        get cover() {
          return r(q).cover;
        },
        get origin() {
          return r(q).origin;
        },
        get back() {
          return r(Lt);
        },
        get forward() {
          return r(vt);
        },
        onstep: ur,
        onreveal: ce,
        onclose: L
      });
    };
    ne(gn, (k) => {
      r(q) && k(Cn);
    });
  }
  var nt = p(gn, 2);
  {
    var Le = (k) => {
      var W = ku();
      let he;
      var Ue = d(W);
      B(() => {
        he = Ee(W, 1, "status", null, he, { bare: r(s) === "grid" }), T(Ue, r(P));
      }), M(k, W);
    };
    ne(nt, (k) => {
      r(P) && k(Le);
    });
  }
  B(() => tt = Ee(Dt, 1, "shell", null, tt, { bare: r(s) === "grid" })), M(e, Ne), Tt();
}
Kt(["click"]);
So();
Is();
zl(Eu, { target: document.getElementById("app") });
