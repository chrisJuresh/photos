var ws = Array.isArray, oi = Array.prototype.indexOf, Nr = Array.prototype.includes, Yr = Array.from, ci = Object.defineProperty, Zn = Object.getOwnPropertyDescriptor, ui = Object.getOwnPropertyDescriptors, di = Object.prototype, fi = Array.prototype, da = Object.getPrototypeOf, Is = Object.isExtensible;
const Cr = () => {
};
function hi(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function fa() {
  var e, t, n = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
function Vr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const s of e)
    if (n.push(s), n.length === t) break;
  return n;
}
const Qe = 2, er = 4, Wr = 8, ha = 1 << 24, jt = 16, Ct = 32, fn = 64, ls = 128, Pt = 512, $e = 1024, Ve = 2048, qt = 4096, ut = 8192, kt = 16384, ir = 32768, os = 1 << 25, tr = 65536, Ir = 1 << 17, vi = 1 << 18, lr = 1 << 19, pi = 1 << 20, Zt = 1 << 25, Hn = 65536, Lr = 1 << 21, Qn = 1 << 22, Tn = 1 << 23, Ln = Symbol("$state"), gi = Symbol("legacy props"), _i = Symbol(""), va = Symbol("attributes"), cs = Symbol("class"), us = Symbol("style"), ds = Symbol("text"), Sr = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), bi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function mi(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function wi() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function yi(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function xi(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ki() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Si(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ei() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ti(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Mi() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ai() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ri() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Pi() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Ci = 1, zi = 2, pa = 4, Oi = 8, Ni = 16, Ii = 1, Li = 4, Fi = 8, Di = 16, ji = 1, Hi = 2, Ke = Symbol("uninitialized"), Bi = "http://www.w3.org/1999/xhtml";
function qi() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Ui() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Yi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ga(e) {
  return e === this.v;
}
function Wi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function _a(e) {
  return !Wi(e, this.v);
}
let st = null;
function nr(e) {
  st = e;
}
function St(e, t = !1, n) {
  st = {
    p: st,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      _e
    ),
    l: null
  };
}
function Et(e) {
  var t = (
    /** @type {ComponentContext} */
    st
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var s of n)
      La(s);
  }
  return e !== void 0 && (t.x = e), t.i = !0, st = t.p, e ?? /** @type {T} */
  {};
}
function ba() {
  return !0;
}
let On = [];
function ma() {
  var e = On;
  On = [], hi(e);
}
function un(e) {
  if (On.length === 0 && !mr) {
    var t = On;
    queueMicrotask(() => {
      t === On && ma();
    });
  }
  On.push(e);
}
function Gi() {
  for (; On.length > 0; )
    ma();
}
function wa(e) {
  var t = _e;
  if (t === null)
    return be.f |= Tn, e;
  if ((t.f & ir) === 0 && (t.f & er) === 0)
    throw e;
  Sn(e, t);
}
function Sn(e, t) {
  if (!(t !== null && (t.f & kt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & ls) !== 0) {
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
const Ki = -7169;
function He(e, t) {
  e.f = e.f & Ki | t;
}
function ys(e) {
  (e.f & Pt) !== 0 || e.deps === null ? He(e, $e) : He(e, qt);
}
function ya(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Qe) === 0 || (t.f & Hn) === 0 || (t.f ^= Hn, ya(
        /** @type {Derived} */
        t.deps
      ));
}
function xa(e, t, n) {
  (e.f & Ve) !== 0 ? t.add(e) : (e.f & qt) !== 0 && n.add(e), ya(e.deps), He(e, $e);
}
let Ar = !1;
function Xi(e) {
  var t = Ar;
  try {
    return Ar = !1, [e(), Ar];
  } finally {
    Ar = t;
  }
}
function $i(e, t, n, s = !0) {
  s && n();
  for (var a of t)
    e.addEventListener(a, n);
  Gr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function or(e) {
  var t = be, n = _e;
  zt(null), tn(null);
  try {
    return e();
  } finally {
    zt(t), tn(n);
  }
}
function Vi(e) {
  let t = 0, n = Bn(0), s;
  return () => {
    Es() && (r(n), Fa(() => (t === 0 && (s = Qt(() => e(() => wr(n)))), t += 1, () => {
      un(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, wr(n));
      });
    })));
  };
}
var Ji = tr | lr;
function Zi(e, t, n, s) {
  new Qi(e, t, n, s);
}
class Qi {
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
  #b = Vi(() => (this.#d = Bn(this.#p), () => {
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
        _e
      );
      l.b = this, l.f |= ls, s(i);
    }, this.parent = /** @type {Effect} */
    _e.b, this.transform_error = a ?? this.parent?.transform_error ?? ((i) => i), this.#s = Ms(() => {
      this.#h();
    }, Ji);
  }
  #_() {
    try {
      this.#i = Rt(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#t.failed, { reset: s, invoke_onerror: a } = this.#m(t);
    un(a), n && (this.#o = Rt(() => {
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
        Yi();
        return;
      }
      n = !0, s && Pi(), this.#o !== null && Dn(this.#o, () => {
        this.#o = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: a, invoke_onerror: () => {
      try {
        s = !0, this.#t.onerror?.(t, a), s = !1;
      } catch (l) {
        Sn(l, this.#s && this.#s.parent);
      }
    } };
  }
  #x() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#n = Rt(() => t(this.#e)), un(() => {
      var n = this.#a = document.createDocumentFragment(), s = dn();
      n.append(s), this.#i = this.#v(() => Rt(() => this.#l(s))), this.#c === 0 && (this.#e.before(n), this.#a = null, Dn(
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
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#p = 0, this.#i = Rt(() => {
        this.#l(this.#e);
      }), this.#c > 0) {
        var t = this.#a = document.createDocumentFragment();
        Rs(this.#i, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#n = Rt(() => n(this.#e));
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
    xa(t, this.#f, this.#g);
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
    var n = _e, s = be, a = st;
    tn(this.#s), zt(this.#s), nr(this.#s.ctx);
    try {
      return An.ensure(), t();
    } catch (i) {
      return wa(i), null;
    } finally {
      tn(n), zt(s), nr(a);
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
    this.#c += t, this.#c === 0 && (this.#w(n), this.#n && Dn(this.#n, () => {
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
    this.#i && (bt(this.#i), this.#i = null), this.#n && (bt(this.#n), this.#n = null), this.#o && (bt(this.#o), this.#o = null);
    let n = this.#t.failed;
    const s = (a) => {
      const { reset: i, invoke_onerror: l } = this.#m(a);
      l(), n && (this.#o = this.#v(() => {
        try {
          return Rt(() => {
            var c = (
              /** @type {Effect} */
              _e
            );
            c.b = this, c.f |= ls, n(
              this.#e,
              () => a,
              () => i
            );
          });
        } catch (c) {
          return Sn(
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
        Sn(i, this.#s && this.#s.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof /** @type {any} */
      a.then == "function" ? a.then(
        s,
        /** @param {unknown} e */
        (i) => Sn(i, this.#s && this.#s.parent)
      ) : s(a);
    });
  }
}
function el(e, t, n, s) {
  const a = yr;
  var i = e.filter((h) => !h.settled), l = t.map(a);
  if (n.length === 0 && i.length === 0) {
    s(l);
    return;
  }
  var c = (
    /** @type {Effect} */
    _e
  ), o = tl(), f = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function g(h) {
    if ((c.f & kt) === 0) {
      o();
      try {
        s([...l, ...h]);
      } catch (w) {
        Sn(w, c);
      }
      Fr();
    }
  }
  var m = ka();
  if (n.length === 0) {
    f.then(() => g([])).finally(m);
    return;
  }
  function _() {
    Promise.all(n.map((h) => /* @__PURE__ */ nl(h))).then(g).catch((h) => Sn(h, c)).finally(m);
  }
  f ? f.then(() => {
    o(), _(), Fr();
  }) : _();
}
function tl() {
  var e = (
    /** @type {Effect} */
    _e
  ), t = be, n = st, s = (
    /** @type {Batch} */
    ye
  );
  return function(i = !0) {
    tn(e), zt(t), nr(n), i && (e.f & kt) === 0 && (s?.activate(), s?.apply());
  };
}
function Fr(e = !0) {
  tn(null), zt(null), nr(null), e && ye?.deactivate();
}
function ka() {
  var e = (
    /** @type {Effect} */
    _e
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
  var t = Qe | Ve;
  return _e !== null && (_e.f |= lr), {
    ctx: st,
    deps: null,
    effects: null,
    equals: ga,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Ke
    ),
    wv: 0,
    parent: _e,
    ac: null
  };
}
const vr = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function nl(e, t, n) {
  let s = (
    /** @type {Effect | null} */
    _e
  );
  s === null && wi();
  var a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = Bn(
    /** @type {V} */
    Ke
  ), l = !be, c = /* @__PURE__ */ new Set();
  return bl(() => {
    var o = (
      /** @type {Effect} */
      _e
    ), f = fa();
    a = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, (h) => {
        h !== Sr && f.reject(h);
      }).finally(Fr);
    } catch (h) {
      f.reject(h), Fr();
    }
    var g = (
      /** @type {Batch} */
      ye
    );
    if (l) {
      if ((o.f & ir) !== 0)
        var m = ka();
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
      m?.(), c.delete(f), w !== vr && (g.activate(), w ? (i.f |= Tn, rr(i, w)) : ((i.f & Tn) !== 0 && (i.f ^= Tn), rr(i, h)), g.deactivate());
    };
    f.promise.then(_, (h) => _(null, h || "unknown"));
  }), Gr(() => {
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
function le(e) {
  const t = /* @__PURE__ */ yr(e);
  return qa(t), t;
}
// @__NO_SIDE_EFFECTS__
function Sa(e) {
  const t = /* @__PURE__ */ yr(e);
  return t.equals = _a, t;
}
function rl(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      bt(
        /** @type {Effect} */
        t[n]
      );
  }
}
function xs(e) {
  var t, n = _e, s = e.parent;
  if (!hn && s !== null && e.v !== Ke && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (s.f & (kt | ut)) !== 0)
    return qi(), e.v;
  tn(s);
  try {
    e.f &= ~Hn, rl(e), t = Ga(e);
  } finally {
    tn(n);
  }
  return t;
}
function Ea(e) {
  var t = xs(e);
  if (!e.equals(t) && (e.wv = Ya(), (!ye?.is_fork || e.deps === null) && (ye !== null ? (ye.capture(e, t, !0), fs?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    He(e, $e);
    return;
  }
  hn || (Ht !== null ? (Es() || ye?.is_fork) && Ht.set(e, t) : ys(e));
}
function sl(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && or(() => {
        t.ac.abort(Sr), t.ac = null;
      }), t.fn !== null && (t.teardown = Cr), xr(t, 0), As(t));
}
function Ta(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && sr(t);
}
let Jr = null, Kn = null, ye = null, fs = null, Ht = null, hs = null, mr = !1, Zr = !1, Vn = null, zr = null;
var Ls = 0;
let al = 1;
class An {
  id = al++;
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
    Kn === null ? Jr = Kn = this : (Kn.#t = this, this.#r = Kn), Kn = this;
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
        He(a, Ve), n(a);
      for (a of s.m)
        He(a, qt), n(a);
    }
    this.#g.add(t);
  }
  #_() {
    this.#e = !0, Ls++ > 1e3 && (this.#v(), ll());
    for (const o of this.#c)
      this.#u.delete(o), He(o, Ve), this.schedule(o);
    for (const o of this.#u)
      He(o, qt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Vn = [], s = [], a = zr = [];
    for (const o of t)
      try {
        this.#y(o, n, s);
      } catch (f) {
        throw Ra(o), this.#b() || this.discard(), f;
      }
    if (ye = null, a.length > 0) {
      var i = An.ensure();
      for (const o of a)
        i.schedule(o);
    }
    if (Vn = null, zr = null, this.#b()) {
      this.#h(s), this.#h(n);
      for (const [o, f] of this.#f)
        Aa(o, f);
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
    this.#l.clear(), fs = this, Fs(s), Fs(n), fs = null, this.#o?.resolve();
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
      var i = a.f, l = (i & (Ct | fn)) !== 0, c = l && (i & $e) !== 0, o = c || (i & ut) !== 0 || this.#f.has(a);
      if (!o && a.fn !== null) {
        l ? a.f ^= $e : (i & er) !== 0 ? n.push(a) : Tr(a) && ((i & jt) !== 0 && this.#u.add(a), sr(a));
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
      if (a !== null && !((s.f & Qe) !== 0 && (s.f & (Ve | qt)) === 0))
        for (const c of a) {
          var i = c.f;
          if ((i & Qe) !== 0)
            n(
              /** @type {Derived} */
              c
            );
          else {
            var l = (
              /** @type {Effect} */
              c
            );
            i & (Qn | jt) && !this.async_deriveds.has(l) && (this.#u.delete(l), He(l, Ve), this.schedule(l));
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
      xa(t[n], this.#c, this.#u);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, s = !1) {
    t.v !== Ke && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & Tn) === 0 && (this.current.set(t, [n, s]), Ht?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    ye = this;
  }
  deactivate() {
    ye = null, Ht = null;
  }
  flush() {
    try {
      Zr = !0, ye = this, this.#_();
    } finally {
      Ls = 0, hs = null, Vn = null, zr = null, Zr = !1, ye = null, Ht = null, Fn.clear();
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
    for (let m = Jr; m !== null; m = m.#t) {
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
                (h.f & (jt | Qn)) !== 0 ? m.schedule(h) : m.#h([h]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
          for (var o of n)
            Ma(o, i, l, c);
          c = /* @__PURE__ */ new Map();
          var f = [...m.current].filter(([_, h]) => {
            const w = this.current.get(_);
            return w ? w[0] !== h[0] || w[1] !== h[1] : !0;
          }).map(([_]) => _);
          if (f.length > 0)
            for (const _ of this.#p)
              (_.f & (kt | ut | Ir)) === 0 && ks(_, f, c) && ((_.f & (Qn | jt)) !== 0 ? (He(_, Ve), m.schedule(_)) : m.#c.add(_));
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
    return (this.#o ??= fa()).promise;
  }
  static ensure() {
    if (ye === null) {
      const t = ye = new An();
      !Zr && !mr && un(() => {
        t.#e || t.flush();
      });
    }
    return ye;
  }
  apply() {
    {
      Ht = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (hs = t, t.b?.is_pending && (t.f & (er | Wr | ha)) !== 0 && (t.f & ir) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var s = n.f;
      if (Vn !== null && n === _e && (be === null || (be.f & Qe) === 0))
        return;
      if ((s & (fn | Ct)) !== 0) {
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
      t === null ? Jr = n : t.#t = n, n === null ? Kn = t : n.#r = t, this.linked = !1;
    }
  }
}
function il(e) {
  var t = mr;
  mr = !0;
  try {
    for (var n; ; ) {
      if (Gi(), ye === null)
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
function ll() {
  try {
    Ei();
  } catch (e) {
    Sn(e, hs);
  }
}
let cn = null;
function Fs(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var s = e[n++];
      if ((s.f & (kt | ut)) === 0 && Tr(s) && (cn = /* @__PURE__ */ new Set(), sr(s), s.deps === null && s.first === null && s.nodes === null && s.teardown === null && s.ac === null && ja(s), cn?.size > 0)) {
        Fn.clear();
        for (const a of cn) {
          if ((a.f & (kt | ut)) !== 0) continue;
          const i = [a];
          let l = a.parent;
          for (; l !== null; )
            cn.has(l) && (cn.delete(l), i.push(l)), l = l.parent;
          for (let c = i.length - 1; c >= 0; c--) {
            const o = i[c];
            (o.f & (kt | ut)) === 0 && sr(o);
          }
        }
        cn.clear();
      }
    }
    cn = null;
  }
}
function Ma(e, t, n, s) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const i = a.f;
      (i & Qe) !== 0 ? Ma(
        /** @type {Derived} */
        a,
        t,
        n,
        s
      ) : (i & (Qn | jt)) !== 0 && (i & Ve) === 0 && ks(a, t, s) && (He(a, Ve), Ss(
        /** @type {Effect} */
        a
      ));
    }
}
function ks(e, t, n) {
  const s = n.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (Nr.call(t, a))
        return !0;
      if ((a.f & Qe) !== 0 && ks(
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
function Ss(e) {
  ye.schedule(e);
}
function Aa(e, t) {
  if (!((e.f & Ct) !== 0 && (e.f & $e) !== 0)) {
    (e.f & Ve) !== 0 ? t.d.push(e) : (e.f & qt) !== 0 && t.m.push(e), He(e, $e);
    for (var n = e.first; n !== null; )
      Aa(n, t), n = n.next;
  }
}
function Ra(e) {
  He(e, $e);
  for (var t = e.first; t !== null; )
    Ra(t), t = t.next;
}
let Dr = /* @__PURE__ */ new Set();
const Fn = /* @__PURE__ */ new Map();
let Pa = !1;
function Bn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ga,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function $(e, t) {
  const n = Bn(e);
  return qa(n), n;
}
// @__NO_SIDE_EFFECTS__
function ol(e, t = !1, n = !0) {
  const s = Bn(e);
  return t || (s.equals = _a), s;
}
function S(e, t, n = !1) {
  be !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Bt || (be.f & Ir) !== 0) && ba() && (be.f & (Qe | jt | Qn | Ir)) !== 0 && (en === null || !en.has(e)) && Ri();
  let s = n ? Fe(t) : t;
  return rr(e, s, zr);
}
function rr(e, t, n = null) {
  if (!e.equals(t)) {
    Fn.set(e, hn ? t : e.v);
    var s = An.ensure();
    if (s.capture(e, t), (e.f & Qe) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & Ve) !== 0 && xs(a), Ht === null && ys(a);
    }
    e.wv = Ya(), Ca(e, Ve, n), _e !== null && (_e.f & $e) !== 0 && (_e.f & (Ct | fn)) === 0 && (At === null ? yl([e]) : At.push(e)), !s.is_fork && Dr.size > 0 && !Pa && cl();
  }
  return t;
}
function cl() {
  Pa = !1;
  for (const e of Dr) {
    (e.f & $e) !== 0 && He(e, qt);
    let t;
    try {
      t = Tr(e);
    } catch {
      t = !0;
    }
    t && sr(e);
  }
  Dr.clear();
}
function ul(e, t = 1) {
  var n = r(e), s = t === 1 ? n++ : n--;
  return S(e, n), s;
}
function wr(e) {
  S(e, e.v + 1);
}
function Ca(e, t, n) {
  var s = e.reactions;
  if (s !== null)
    for (var a = s.length, i = 0; i < a; i++) {
      var l = s[i], c = l.f, o = (c & Ve) === 0;
      if (o && He(l, t), (c & Ir) !== 0)
        Dr.add(
          /** @type {Effect} */
          l
        );
      else if ((c & Qe) !== 0) {
        var f = (
          /** @type {Derived} */
          l
        );
        Ht?.delete(f), (c & Hn) === 0 && (c & Pt && (_e === null || (_e.f & Lr) === 0) && (l.f |= Hn), Ca(f, qt, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (c & jt) !== 0 && cn !== null && cn.add(g), n !== null ? n.push(g) : Ss(g);
      }
    }
}
function Fe(e) {
  if (typeof e != "object" || e === null || Ln in e)
    return e;
  const t = da(e);
  if (t !== di && t !== fi)
    return e;
  var n = /* @__PURE__ */ new Map(), s = ws(e), a = /* @__PURE__ */ $(0), i = jn, l = (c) => {
    if (jn === i)
      return c();
    var o = be, f = jn;
    zt(null), Hs(i);
    var g = c();
    return zt(o), Hs(f), g;
  };
  return s && n.set("length", /* @__PURE__ */ $(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, o, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Mi();
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
        if (o === Ln)
          return e;
        var g = n.get(o), m = o in c;
        if (g === void 0 && (!m || Zn(c, o)?.writable) && (g = l(() => {
          var h = Fe(m ? c[o] : Ke), w = /* @__PURE__ */ $(h);
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
        if (o === Ln)
          return !0;
        var f = n.get(o), g = f !== void 0 && f.v !== Ke || Reflect.has(c, o);
        if (f !== void 0 || _e !== null && (!g || Zn(c, o)?.writable)) {
          f === void 0 && (f = l(() => {
            var _ = g ? Fe(c[o]) : Ke, h = /* @__PURE__ */ $(_);
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
          (!_ || Zn(c, o)?.writable) && (m = l(() => /* @__PURE__ */ $(void 0)), S(m, Fe(f)), n.set(o, m));
        else {
          _ = m.v !== Ke;
          var x = l(() => Fe(f));
          S(m, x);
        }
        var u = Reflect.getOwnPropertyDescriptor(c, o);
        if (u?.set && u.set.call(g, f), !_) {
          if (s && typeof o == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), k = Number(o);
            Number.isInteger(k) && k >= v.v && S(v, k + 1);
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
        Ai();
      }
    }
  );
}
function Ds(e) {
  try {
    if (e !== null && typeof e == "object" && Ln in e)
      return e[Ln];
  } catch {
  }
  return e;
}
function dl(e, t) {
  return Object.is(Ds(e), Ds(t));
}
var Mn, za, Oa, Na;
function fl() {
  if (Mn === void 0) {
    Mn = window, za = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Oa = Zn(t, "firstChild").get, Na = Zn(t, "nextSibling").get, Is(e) && (e[cs] = void 0, e[va] = null, e[us] = void 0, e.__e = void 0), Is(n) && (n[ds] = void 0);
  }
}
function dn(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function jr(e) {
  return (
    /** @type {TemplateNode | null} */
    Oa.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Er(e) {
  return (
    /** @type {TemplateNode | null} */
    Na.call(e)
  );
}
function d(e, t) {
  return /* @__PURE__ */ jr(e);
}
function ct(e, t = !1) {
  {
    var n = /* @__PURE__ */ jr(e);
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
function hl(e) {
  e.textContent = "";
}
function Ia() {
  return !1;
}
function vl(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function pl(e) {
  _e === null && (be === null && Si(), ki()), hn && xi();
}
function gl(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function vn(e, t) {
  var n = _e;
  n !== null && (n.f & ut) !== 0 && (e |= ut);
  var s = {
    ctx: st,
    deps: null,
    nodes: null,
    f: e | Ve | Pt,
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
    Vn !== null ? Vn.push(s) : An.ensure().schedule(s);
  else if (t !== null) {
    try {
      sr(s);
    } catch (l) {
      throw bt(s), l;
    }
    a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
    (a.f & lr) === 0 && (a = a.first, (e & jt) !== 0 && (e & tr) !== 0 && a !== null && (a.f |= tr));
  }
  if (a !== null && (a.parent = n, n !== null && gl(a, n), be !== null && (be.f & Qe) !== 0 && (e & fn) === 0)) {
    var i = (
      /** @type {Derived} */
      be
    );
    (i.effects ??= []).push(a);
  }
  return s;
}
function Es() {
  return be !== null && !Bt;
}
function Gr(e) {
  const t = vn(Wr, null);
  return He(t, $e), t.teardown = e, t;
}
function xt(e) {
  pl();
  var t = (
    /** @type {Effect} */
    _e.f
  ), n = !be && (t & Ct) !== 0 && st !== null && !st.i;
  if (n) {
    var s = (
      /** @type {ComponentContext} */
      st
    );
    (s.e ??= []).push(e);
  } else
    return La(e);
}
function La(e) {
  return vn(er | pi, e);
}
function _l(e) {
  An.ensure();
  const t = vn(fn | lr, e);
  return (n = {}) => new Promise((s) => {
    n.outro ? Dn(t, () => {
      bt(t), s(void 0);
    }) : (bt(t), s(void 0));
  });
}
function Ts(e) {
  return vn(er, e);
}
function bl(e) {
  return vn(Qn | lr, e);
}
function Fa(e, t = 0) {
  return vn(Wr | t, e);
}
function H(e, t = [], n = [], s = []) {
  el(s, t, n, (a) => {
    vn(Wr, () => {
      e(...a.map(r));
    });
  });
}
function Ms(e, t = 0) {
  var n = vn(jt | t, e);
  return n;
}
function Rt(e) {
  return vn(Ct | lr, e);
}
function Da(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = hn, s = be;
    js(!0), zt(null);
    try {
      t.call(null);
    } finally {
      js(n), zt(s);
    }
  }
}
function As(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && or(() => {
      a.abort(Sr);
    });
    var s = n.next;
    (n.f & fn) !== 0 ? n.parent = null : bt(n, t), n = s;
  }
}
function ml(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Ct) === 0 && bt(t), t = n;
  }
}
function bt(e, t = !0) {
  var n = !1;
  (t || (e.f & vi) !== 0) && e.nodes !== null && e.nodes.end !== null && (wl(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= os, As(e, t && !n), xr(e, 0);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const i of s)
      i.stop();
  Da(e), e.f ^= os, e.f |= kt;
  var a = e.parent;
  a !== null && a.first !== null && ja(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function wl(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Er(e);
    e.remove(), e = n;
  }
}
function ja(e) {
  var t = e.parent, n = e.prev, s = e.next;
  n !== null && (n.next = s), s !== null && (s.prev = n), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = n));
}
function Dn(e, t, n = !0) {
  var s = [];
  Ha(e, s, !0);
  var a = () => {
    n && bt(e), t && t();
  }, i = s.length;
  if (i > 0) {
    var l = () => --i || a();
    for (var c of s)
      c.out(l);
  } else
    a();
}
function Ha(e, t, n) {
  if ((e.f & ut) === 0) {
    e.f ^= ut;
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
        (a.f & Ct) !== 0 && (e.f & jt) !== 0;
        Ha(a, t, l ? n : !1);
      }
      a = i;
    }
  }
}
function Hr(e) {
  Ba(e, !0);
}
function Ba(e, t) {
  if ((e.f & ut) !== 0) {
    e.f ^= ut, (e.f & $e) === 0 && (He(e, Ve), An.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var s = n.next, a = (n.f & tr) !== 0 || (n.f & Ct) !== 0;
      Ba(n, a ? t : !1), n = s;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function Rs(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, s = e.nodes.end; n !== null; ) {
      var a = n === s ? null : /* @__PURE__ */ Er(n);
      t.append(n), n = a;
    }
}
let Or = !1, hn = !1;
function js(e) {
  hn = e;
}
let be = null, Bt = !1;
function zt(e) {
  be = e;
}
let _e = null;
function tn(e) {
  _e = e;
}
let en = null;
function qa(e) {
  be !== null && (en ??= /* @__PURE__ */ new Set()).add(e);
}
let gt = null, yt = 0, At = null;
function yl(e) {
  At = e;
}
let Ua = 1, Nn = 0, jn = Nn;
function Hs(e) {
  jn = e;
}
function Ya() {
  return ++Ua;
}
function Tr(e) {
  var t = e.f;
  if ((t & Ve) !== 0)
    return !0;
  if (t & Qe && (e.f &= ~Hn), (t & qt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), s = n.length, a = 0; a < s; a++) {
      var i = n[a];
      if (Tr(
        /** @type {Derived} */
        i
      ) && Ea(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & Pt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ht === null && He(e, $e);
  }
  return !1;
}
function Wa(e, t, n = !0) {
  var s = e.reactions;
  if (s !== null && !(en !== null && en.has(e)))
    for (var a = 0; a < s.length; a++) {
      var i = s[a];
      (i.f & Qe) !== 0 ? Wa(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? He(i, Ve) : (i.f & $e) !== 0 && He(i, qt), Ss(
        /** @type {Effect} */
        i
      ));
    }
}
function Ga(e) {
  var t = gt, n = yt, s = At, a = be, i = en, l = st, c = Bt, o = jn, f = e.f;
  gt = /** @type {null | Value[]} */
  null, yt = 0, At = null, be = (f & (Ct | fn)) === 0 ? e : null, en = null, nr(e.ctx), Bt = !1, jn = ++Nn, e.ac !== null && (or(() => {
    e.ac.abort(Sr);
  }), e.ac = null);
  try {
    e.f |= Lr;
    var g = (
      /** @type {Function} */
      e.fn
    ), m = g();
    e.f |= ir;
    var _ = e.deps, h = ye?.is_fork;
    if (gt !== null) {
      var w;
      if (h || xr(e, yt), _ !== null && yt > 0)
        for (_.length = yt + gt.length, w = 0; w < gt.length; w++)
          _[yt + w] = gt[w];
      else
        e.deps = _ = gt;
      if (Es() && (e.f & Pt) !== 0)
        for (w = yt; w < _.length; w++)
          (_[w].reactions ??= []).push(e);
    } else !h && _ !== null && yt < _.length && (xr(e, yt), _.length = yt);
    if (ba() && At !== null && !Bt && _ !== null && (e.f & (Qe | qt | Ve)) === 0)
      for (w = 0; w < /** @type {Source[]} */
      At.length; w++)
        Wa(
          At[w],
          /** @type {Effect} */
          e
        );
    if (a !== null && a !== e) {
      if (Nn++, a.deps !== null)
        for (let x = 0; x < n; x += 1)
          a.deps[x].rv = Nn;
      if (t !== null)
        for (const x of t)
          x.rv = Nn;
      At !== null && (s === null ? s = At : s.push(.../** @type {Source[]} */
      At));
    }
    return (e.f & Tn) !== 0 && (e.f ^= Tn), m;
  } catch (x) {
    return wa(x);
  } finally {
    e.f ^= Lr, gt = t, yt = n, At = s, be = a, en = i, nr(l), Bt = c, jn = o;
  }
}
function xl(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var s = oi.call(n, e);
    if (s !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[s] = n[a], n.pop());
    }
  }
  if (n === null && (t.f & Qe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (gt === null || !Nr.call(gt, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & Pt) !== 0 && (i.f ^= Pt, i.f &= ~Hn), i.v !== Ke && ys(i), i.ac !== null && or(() => {
      i.ac.abort(Sr), i.ac = null, He(i, Ve);
    }), sl(i), xr(i, 0);
  }
}
function xr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var s = t; s < n.length; s++)
      xl(e, n[s]);
}
function sr(e) {
  var t = e.f;
  if ((t & kt) === 0) {
    He(e, $e);
    var n = _e, s = Or;
    _e = e, Or = (t & (Ct | fn)) === 0;
    try {
      (t & (jt | ha)) !== 0 ? ml(e) : As(e), Da(e);
      var a = Ga(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Ua;
      var i;
    } finally {
      Or = s, _e = n;
    }
  }
}
async function kl() {
  await Promise.resolve(), il();
}
function r(e) {
  var t = e.f, n = (t & Qe) !== 0;
  if (be !== null && !Bt) {
    var s = _e !== null && (_e.f & kt) !== 0;
    if (!s && (en === null || !en.has(e))) {
      var a = be.deps;
      if ((be.f & Lr) !== 0)
        e.rv < Nn && (e.rv = Nn, gt === null && a !== null && a[yt] === e ? yt++ : gt === null ? gt = [e] : gt.push(e));
      else {
        be.deps ??= [], Nr.call(be.deps, e) || be.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [be] : Nr.call(i, be) || i.push(be);
      }
    }
  }
  if (hn && Fn.has(e))
    return Fn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (hn) {
      var c = l.v;
      return ((l.f & $e) === 0 && l.reactions !== null || Xa(l)) && (c = xs(l)), Fn.set(l, c), c;
    }
    var o = (l.f & Pt) === 0 && !Bt && be !== null && (Or || (be.f & Pt) !== 0), f = (l.f & ir) === 0;
    Tr(l) && (o && (l.f |= Pt), Ea(l)), o && !f && (Ta(l), Ka(l));
  }
  if (Ht?.has(e))
    return Ht.get(e);
  if ((e.f & Tn) !== 0)
    throw e.v;
  return e.v;
}
function Ka(e) {
  if (e.f |= Pt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Qe) !== 0 && (t.f & Pt) === 0 && (Ta(
        /** @type {Derived} */
        t
      ), Ka(
        /** @type {Derived} */
        t
      ));
}
function Xa(e) {
  if (e.v === Ke) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Fn.has(t) || (t.f & Qe) !== 0 && Xa(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Qt(e) {
  var t = Bt;
  try {
    return Bt = !0, e();
  } finally {
    Bt = t;
  }
}
const Sl = ["touchstart", "touchmove"];
function El(e) {
  return Sl.includes(e);
}
const pr = Symbol("events"), $a = /* @__PURE__ */ new Set(), vs = /* @__PURE__ */ new Set();
function Tl(e, t, n, s = {}) {
  function a(i) {
    if (s.capture || ps.call(t, i), !i.cancelBubble)
      return or(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? un(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function In(e, t, n, s, a) {
  var i = { capture: s, passive: a }, l = Tl(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Gr(() => {
    t.removeEventListener(e, l, i);
  });
}
function se(e, t, n) {
  (t[pr] ??= {})[e] = n;
}
function Ut(e) {
  for (var t = 0; t < e.length; t++)
    $a.add(e[t]);
  for (var n of vs)
    n(e);
}
let Bs = null;
function ps(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Bs = e;
  var l = 0, c = Bs === e && e[pr];
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
    ci(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = be, m = _e;
    zt(null), tn(null);
    try {
      for (var _, h = []; i !== null && i !== t; ) {
        try {
          var w = i[pr]?.[s];
          w != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && w.call(i, e);
        } catch (x) {
          _ ? h.push(x) : _ = x;
        }
        if (e.cancelBubble) break;
        l++, i = l < a.length ? (
          /** @type {Element} */
          a[l]
        ) : null;
      }
      if (_) {
        for (let x of h)
          queueMicrotask(() => {
            throw x;
          });
        throw _;
      }
    } finally {
      e[pr] = t, delete e.currentTarget, zt(g), tn(m);
    }
  }
}
const Ml = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Al(e) {
  return (
    /** @type {string} */
    Ml?.createHTML(e) ?? e
  );
}
function Rl(e) {
  var t = vl("template");
  return t.innerHTML = Al(e.replaceAll("<!>", "<!---->")), t.content;
}
function Br(e, t) {
  var n = (
    /** @type {Effect} */
    _e
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function C(e, t) {
  var n = (t & ji) !== 0, s = (t & Hi) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Rl(i ? e : "<!>" + e), n || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ jr(a)));
    var l = (
      /** @type {TemplateNode} */
      s || za ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (n) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ jr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      Br(c, o);
    } else
      Br(l, l);
    return l;
  };
}
function Jn(e = "") {
  {
    var t = dn(e + "");
    return Br(t, t), t;
  }
}
function Ps() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = dn();
  return e.append(t, n), Br(t, n), e;
}
function A(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function M(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[ds] ??= e.nodeValue) && (e[ds] = n, e.nodeValue = `${n}`);
}
function Pl(e, t) {
  return Cl(e, t);
}
const Rr = /* @__PURE__ */ new Map();
function Cl(e, { target: t, anchor: n, props: s = {}, events: a, context: i, intro: l = !0, transformError: c }) {
  fl();
  var o = void 0, f = _l(() => {
    var g = n ?? t.appendChild(dn());
    Zi(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (h) => {
        St({});
        var w = (
          /** @type {ComponentContext} */
          st
        );
        i && (w.c = i), a && (s.$$events = a), o = e(h, s) || {}, Et();
      },
      c
    );
    var m = /* @__PURE__ */ new Set(), _ = (h) => {
      for (var w = 0; w < h.length; w++) {
        var x = h[w];
        if (!m.has(x)) {
          m.add(x);
          var u = El(x);
          for (const P of [t, document]) {
            var v = Rr.get(P);
            v === void 0 && (v = /* @__PURE__ */ new Map(), Rr.set(P, v));
            var k = v.get(x);
            k === void 0 ? (P.addEventListener(x, ps, { passive: u }), v.set(x, 1)) : v.set(x, k + 1);
          }
        }
      }
    };
    return _(Yr($a)), vs.add(_), () => {
      for (var h of m)
        for (const u of [t, document]) {
          var w = (
            /** @type {Map<string, number>} */
            Rr.get(u)
          ), x = (
            /** @type {number} */
            w.get(h)
          );
          --x == 0 ? (u.removeEventListener(h, ps), w.delete(h), w.size === 0 && Rr.delete(u)) : w.set(h, x);
        }
      vs.delete(_), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return zl.set(o, f), o;
}
let zl = /* @__PURE__ */ new WeakMap();
class Ol {
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
        Hr(s), this.#l.delete(n);
      else {
        var a = this.#t.get(n);
        a && (Hr(a.effect), this.#r.set(n, a.effect), this.#t.delete(n), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [i, l] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const c = this.#t.get(l);
        c && (bt(c.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#r) {
        if (i === n || this.#l.has(i)) continue;
        const c = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var f = document.createDocumentFragment();
            Rs(l, f), f.append(dn()), this.#t.set(i, { effect: l, fragment: f });
          } else
            bt(l);
          this.#l.delete(i), this.#r.delete(i);
        };
        this.#s || !s ? (this.#l.add(i), Dn(l, c, !1)) : c();
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
      n.includes(s) || (bt(a.effect), this.#t.delete(s));
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
    ), a = Ia();
    if (n && !this.#r.has(t) && !this.#t.has(t))
      if (a) {
        var i = document.createDocumentFragment(), l = dn();
        i.append(l), this.#t.set(t, {
          effect: Rt(() => n(l)),
          fragment: i
        });
      } else
        this.#r.set(
          t,
          Rt(() => n(this.anchor))
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
  var s = new Ol(e), a = n ? tr : 0;
  function i(l, c) {
    s.ensure(l, c);
  }
  Ms(() => {
    var l = !1;
    t((c, o = 0) => {
      l = !0, i(o, c);
    }), l || i(-1, null);
  }, a);
}
function _t(e, t) {
  return t;
}
function Nl(e, t, n) {
  for (var s = [], a = t.length, i, l = t.length, c = 0; c < a; c++) {
    let m = t[c];
    Dn(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            gs(e, Yr(i.done)), _.delete(i), _.size === 0 && (e.outrogroups = null);
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
      hl(g), g.append(f), e.items.clear();
    }
    gs(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function gs(e, t, n = !0) {
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
      Rs(i, l);
    } else
      bt(t[a], n);
  }
}
var qs;
function Xe(e, t, n, s, a, i = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & pa) !== 0;
  if (o) {
    var f = (
      /** @type {Element} */
      e
    );
    l = f.appendChild(dn());
  }
  var g = null, m = /* @__PURE__ */ Sa(() => {
    var P = n();
    return (
      /** @type {V[]} */
      ws(P) ? P : P == null ? [] : Yr(P)
    );
  }), _, h = /* @__PURE__ */ new Map(), w = !0;
  function x(P) {
    (k.effect.f & kt) === 0 && (k.pending.delete(P), k.fallback = g, Il(k, _, l, t, s), g !== null && (_.length === 0 ? (g.f & Zt) === 0 ? Hr(g) : (g.f ^= Zt, gr(g, null, l)) : Dn(g, () => {
      g = null;
    })));
  }
  function u(P) {
    k.pending.delete(P);
  }
  var v = Ms(() => {
    _ = /** @type {V[]} */
    r(m);
    for (var P = _.length, F = /* @__PURE__ */ new Set(), Y = (
      /** @type {Batch} */
      ye
    ), X = Ia(), Z = 0; Z < P; Z += 1) {
      var Q = _[Z], B = s(Q, Z), D = w ? null : c.get(B);
      D ? (D.v && rr(D.v, Q), D.i && rr(D.i, Z), X && Y.unskip_effect(D.e)) : (D = Ll(
        c,
        w ? l : qs ??= dn(),
        Q,
        B,
        Z,
        a,
        t,
        n
      ), w || (D.e.f |= Zt), c.set(B, D)), F.add(B);
    }
    if (P === 0 && i && !g && (w ? g = Rt(() => i(l)) : (g = Rt(() => i(qs ??= dn())), g.f |= Zt)), P > F.size && yi(), !w)
      if (h.set(Y, F), X) {
        for (const [V, z] of c)
          F.has(V) || Y.skip_effect(z.e);
        Y.oncommit(x), Y.ondiscard(u);
      } else
        x(Y);
    r(m);
  }), k = { effect: v, items: c, pending: h, outrogroups: null, fallback: g };
  w = !1;
}
function fr(e) {
  for (; e !== null && (e.f & Ct) === 0; )
    e = e.next;
  return e;
}
function Il(e, t, n, s, a) {
  var i = (s & Oi) !== 0, l = t.length, c = e.items, o = fr(e.effect.first), f, g = null, m, _ = [], h = [], w, x, u, v;
  if (i)
    for (v = 0; v < l; v += 1)
      w = t[v], x = a(w, v), u = /** @type {EachItem} */
      c.get(x).e, (u.f & Zt) === 0 && (u.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(u));
  for (v = 0; v < l; v += 1) {
    if (w = t[v], x = a(w, v), u = /** @type {EachItem} */
    c.get(x).e, e.outrogroups !== null)
      for (const D of e.outrogroups)
        D.pending.delete(u), D.done.delete(u);
    if ((u.f & ut) !== 0 && (Hr(u), i && (u.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(u))), (u.f & Zt) !== 0)
      if (u.f ^= Zt, u === o)
        gr(u, null, n);
      else {
        var k = g ? g.next : o;
        u === e.effect.last && (e.effect.last = u.prev), u.prev && (u.prev.next = u.next), u.next && (u.next.prev = u.prev), wn(e, g, u), wn(e, u, k), gr(u, k, n), g = u, _ = [], h = [], o = fr(g.next);
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
          wn(e, Y.prev, X.next), wn(e, g, Y), wn(e, X, P), o = P, g = X, v -= 1, _ = [], h = [];
        } else
          f.delete(u), gr(u, o, n), wn(e, u.prev, u.next), wn(e, u, g === null ? e.effect.first : g.next), wn(e, g, u), g = u;
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
      D.pending.size === 0 && (gs(e, Yr(D.done)), e.outrogroups?.delete(D));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || f !== void 0) {
    var Z = [];
    if (f !== void 0)
      for (u of f)
        (u.f & ut) === 0 && Z.push(u);
    for (; o !== null; )
      (o.f & ut) === 0 && o !== e.fallback && Z.push(o), o = fr(o.next);
    var Q = Z.length;
    if (Q > 0) {
      var B = (s & pa) !== 0 && l === 0 ? n : null;
      if (i) {
        for (v = 0; v < Q; v += 1)
          Z[v].nodes?.a?.measure();
        for (v = 0; v < Q; v += 1)
          Z[v].nodes?.a?.fix();
      }
      Nl(e, Z, B);
    }
  }
  i && un(() => {
    if (m !== void 0)
      for (u of m)
        u.nodes?.a?.apply();
  });
}
function Ll(e, t, n, s, a, i, l, c) {
  var o = (l & Ci) !== 0 ? (l & Ni) === 0 ? /* @__PURE__ */ ol(n, !1, !1) : Bn(n) : null, f = (l & zi) !== 0 ? Bn(a) : null;
  return {
    v: o,
    i: f,
    e: Rt(() => (i(t, o ?? n, f ?? a, c), () => {
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
function wn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function yn(e, t, n) {
  Ts(() => {
    var s = Qt(() => t(e, n?.()) || {});
    if (s?.destroy)
      return () => (
        /** @type {Function} */
        s.destroy()
      );
  });
}
const Us = [...` 	
\r\f \v\uFEFF`];
function Fl(e, t, n) {
  var s = e == null ? "" : "" + e;
  if (n) {
    for (var a of Object.keys(n))
      if (n[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var i = a.length, l = 0; (l = s.indexOf(a, l)) >= 0; ) {
          var c = l + i;
          (l === 0 || Us.includes(s[l - 1])) && (c === s.length || Us.includes(s[c])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(c + 1) : l = c;
        }
  }
  return s === "" ? null : s;
}
function Ys(e, t = !1) {
  var n = t ? " !important;" : ";", s = "";
  for (var a of Object.keys(e)) {
    var i = e[a];
    i != null && i !== "" && (s += " " + a + ": " + i + n);
  }
  return s;
}
function Dl(e, t) {
  if (t) {
    var n = "", s, a;
    return Array.isArray(t) ? (s = t[0], a = t[1]) : s = t, s && (n += Ys(s)), a && (n += Ys(a, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Ee(e, t, n, s, a, i) {
  var l = (
    /** @type {any} */
    e[cs]
  );
  if (l !== n || l === void 0) {
    var c = Fl(n, s, i);
    c == null ? e.removeAttribute("class") : e.className = c, e[cs] = n;
  } else if (i && a !== i)
    for (var o in i) {
      var f = !!i[o];
      (a == null || f !== !!a[o]) && e.classList.toggle(o, f);
    }
  return i;
}
function Qr(e, t = {}, n, s) {
  for (var a in n) {
    var i = n[a];
    t[a] !== i && (n[a] == null ? e.style.removeProperty(a) : e.style.setProperty(a, i, s));
  }
}
function Jt(e, t, n, s) {
  var a = (
    /** @type {any} */
    e[us]
  );
  if (a !== t) {
    var i = Dl(t, s);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[us] = t;
  } else s && (Array.isArray(s) ? (Qr(e, n?.[0], s[0]), Qr(e, n?.[1], s[1], "important")) : Qr(e, n, s));
  return s;
}
function _r(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ws(t))
      return Ui();
    for (var s of e.options)
      s.selected = t.includes(Ws(s));
    return;
  }
  for (s of e.options) {
    var a = Ws(s);
    if (dl(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Pr(e) {
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
  }), Gr(() => {
    t.disconnect();
  });
}
function Ws(e) {
  return "__value" in e ? e.__value : e.value;
}
const jl = Symbol("is custom element"), Hl = Symbol("is html"), Bl = bi ? "progress" : "PROGRESS";
function $n(e, t) {
  var n = Cs(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== Bl) || (e.value = t ?? "");
}
function ql(e, t) {
  var n = Cs(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function ge(e, t, n, s) {
  var a = Cs(e);
  a[t] !== (a[t] = n) && (t === "loading" && (e[_i] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Ul(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Cs(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[va] ??= {
      [jl]: e.nodeName.includes("-"),
      [Hl]: e.namespaceURI === Bi
    }
  );
}
var Gs = /* @__PURE__ */ new Map();
function Ul(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Gs.get(t);
  if (n) return n;
  Gs.set(t, n = []);
  for (var s, a = e, i = Element.prototype; i !== a; ) {
    s = ui(a);
    for (var l in s)
      s[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    a = da(a);
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
var Yl = /* @__PURE__ */ new zs({
  box: "border-box"
});
function Ks(e, t, n) {
  var s = Yl.observe(e, () => n(e[t]));
  Ts(() => (Qt(() => n(e[t])), s));
}
function es(e, t) {
  return e === t || e?.[Ln] === t;
}
function kr(e = {}, t, n, s) {
  var a = (
    /** @type {ComponentContext} */
    st.r
  ), i = (
    /** @type {Effect} */
    _e
  );
  return Ts(() => {
    var l, c;
    return Fa(() => {
      l = c, c = [], Qt(() => {
        es(n(...c), e) || (t(e, ...c), l && es(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== a && o.parent !== null && o.parent.f & os; )
        o = o.parent;
      const f = () => {
        c && es(n(...c), e) && t(null, ...c);
      }, g = o.teardown;
      o.teardown = () => {
        f(), g?.();
      };
    };
  }), e;
}
function Wl(e, t) {
  $i(window, ["resize"], () => or(() => t(window[e])));
}
function ae(e, t, n, s) {
  var a = !0, i = (n & Fi) !== 0, l = (n & Di) !== 0, c = (
    /** @type {V} */
    s
  ), o = !0, f = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && a ? (f ??= /* @__PURE__ */ yr(
    /** @type {() => V} */
    s
  ), r(f)) : (o && (o = !1, c = l ? Qt(
    /** @type {() => V} */
    s
  ) : (
    /** @type {V} */
    s
  )), c);
  let m;
  if (i) {
    var _ = Ln in e || gi in e;
    m = Zn(e, t)?.set ?? (_ && t in e ? (F) => e[t] = F : void 0);
  }
  var h, w = !1;
  i ? [h, w] = Xi(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && s !== void 0 && (h = g(), m && (Ti(), m(h)));
  var x;
  if (x = () => {
    var F = (
      /** @type {V} */
      e[t]
    );
    return F === void 0 ? g() : (o = !0, F);
  }, (n & Li) === 0)
    return x;
  if (m) {
    var u = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(F, Y) {
        return arguments.length > 0 ? ((!Y || u || w) && m(Y ? x() : F), F) : x();
      })
    );
  }
  var v = !1, k = ((n & Ii) !== 0 ? yr : Sa)(() => (v = !1, x()));
  i && r(k);
  var P = (
    /** @type {Effect} */
    _e
  );
  return (
    /** @type {() => V} */
    (function(F, Y) {
      if (arguments.length > 0) {
        const X = Y ? r(k) : i ? Fe(F) : F;
        return S(k, X), v = !0, c !== void 0 && (c = X), F;
      }
      return hn && v || (P.f & kt) !== 0 ? k.v : r(k);
    })
  );
}
function cr(e) {
  st === null && mi(), xt(() => {
    const t = Qt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Gl = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Gl);
function Kl(e) {
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
  const n = await fetch(e + Kl(t));
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
function Xs(e) {
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
  counts: (e, t) => on("/api/triage/counts", { ...Xs(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => on("/api/triage/files"),
  screen: (e, t = {}) => on("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => on("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => on("/api/triage/page", { ...Xs(e), limit: n, ...t || {} }),
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
function Xl() {
  let e = 0, t = 0;
  return async function(s) {
    const a = ++e, i = await s();
    return a <= t ? { stale: !0, value: void 0 } : (t = a, { stale: !1, value: i });
  };
}
function $l(e, t) {
  let n = 0;
  const s = (...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  };
  return s.cancel = () => clearTimeout(n), s.now = (...a) => {
    clearTimeout(n), e(...a);
  }, s;
}
const $s = ["B", "KB", "MB", "GB", "TB"];
function Ft(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < $s.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${$s[n]}`;
}
function Ce(e) {
  return (Number(e) || 0).toLocaleString();
}
const ar = "G:\\photos", Vs = [
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
function Va(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), s = ar.toLowerCase();
  return n.toLowerCase().startsWith(s + "\\") ? n : "";
}
function Os(e, t) {
  const n = t.toLowerCase();
  return e.some((s) => n === s || n.startsWith(s + "\\"));
}
function Vl(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function Jl(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function Ja(e, t) {
  if (!t) return null;
  const n = e.find(
    (s) => s.term && s.term.column === t.column && s.term.op === t.op && Jl(s.term.value, t.value)
  );
  return n ? n.decision : null;
}
var Zl = /* @__PURE__ */ C('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), Ql = /* @__PURE__ */ C('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), eo = /* @__PURE__ */ C('<div class="line muted svelte-1vgp6n7">…</div>'), to = /* @__PURE__ */ C('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), no = /* @__PURE__ */ C('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), ro = /* @__PURE__ */ C('<div class="line muted svelte-1vgp6n7"> </div>'), so = /* @__PURE__ */ C('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function ao(e, t) {
  St(t, !0);
  let n = ae(t, "counts", 3, null), s = ae(t, "files", 3, null), a = ae(t, "filesAt", 3, null), i = ae(t, "stale", 3, !1), l = ae(t, "candidate", 3, null), c = ae(t, "busy", 3, !1);
  const o = /* @__PURE__ */ le(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var f = so(), g = d(f);
  let m;
  var _ = p(d(g), 2);
  {
    var h = (B) => {
      var D = Ql(), V = ct(D), z = d(V), re = d(z), de = p(z, 2), j = d(de), ee = p(de, 4), ue = d(ee), me = p(ee, 2), R = d(me), O = p(V, 2);
      {
        var I = (G) => {
          var T = Zl(), W = p(d(T), 2), J = d(W), Te = p(W, 2), ve = d(Te), Re = p(Te, 4), ze = d(Re), Pe = p(Re, 2), we = d(Pe), ke = p(Pe, 2), Oe = d(ke);
          H(
            (q, he, te, b, E) => {
              M(J, `kept ${q ?? ""}`), M(ve, he), M(ze, `excluded ${te ?? ""}`), M(we, b), M(Oe, `${r(o) >= 0 ? "+" : ""}${E ?? ""} excluded`);
            },
            [
              () => Ce(n().candidate_kept_paths),
              () => Ft(n().candidate_kept_bytes),
              () => Ce(n().candidate_excluded_paths),
              () => Ft(n().candidate_excluded_bytes),
              () => Ce(r(o))
            ]
          ), A(G, T);
        };
        ne(O, (G) => {
          l() && G(I);
        });
      }
      H(
        (G, T, W, J) => {
          M(re, `kept ${G ?? ""}`), M(j, T), M(ue, `excluded ${W ?? ""}`), M(R, J);
        },
        [
          () => Ce(n().kept_paths),
          () => Ft(n().kept_bytes),
          () => Ce(n().excluded_paths),
          () => Ft(n().excluded_bytes)
        ]
      ), A(B, D);
    }, w = (B) => {
      var D = eo();
      A(B, D);
    };
    ne(_, (B) => {
      n() ? B(h) : B(w, -1);
    });
  }
  var x = p(g, 2);
  let u;
  var v = d(x), k = p(d(v), 3), P = d(k), F = p(k, 2);
  {
    var Y = (B) => {
      var D = to();
      A(B, D);
    };
    ne(F, (B) => {
      i() && s() && s() !== "loading" && B(Y);
    });
  }
  var X = p(v, 2);
  {
    var Z = (B) => {
      var D = no(), V = ct(D);
      let z;
      var re = d(V), de = d(re), j = p(re, 2), ee = d(j), ue = p(j, 4), me = d(ue), R = p(ue, 2), O = d(R), I = p(V, 2), G = d(I);
      H(
        (T, W, J, Te) => {
          z = Ee(V, 1, "line svelte-1vgp6n7", null, z, { outdated: i() }), M(de, `kept ${T ?? ""}`), M(ee, W), M(me, `excluded ${J ?? ""}`), M(O, Te), M(G, `as of ${a() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Ce(s().kept_files),
          () => Ft(s().kept_bytes),
          () => Ce(s().excluded_files),
          () => Ft(s().excluded_bytes)
        ]
      ), A(B, D);
    }, Q = (B) => {
      var D = ro(), V = d(D);
      H(() => M(V, s() === "loading" ? "counting…" : "not counted yet")), A(B, D);
    };
    ne(X, (B) => {
      s() && s() !== "loading" ? B(Z) : B(Q, -1);
    });
  }
  H(() => {
    m = Ee(g, 1, "block svelte-1vgp6n7", null, m, { busy: c() }), u = Ee(x, 1, "block svelte-1vgp6n7", null, u, { busy: s() === "loading" }), k.disabled = s() === "loading", M(P, s() === "loading" ? "counting…" : "recount");
  }), se("click", k, function(...B) {
    t.onfiles?.apply(this, B);
  }), A(e, f), Et();
}
Ut(["click"]);
const _s = "http://www.w3.org/2000/svg", zn = {
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
}, En = {
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
}, io = [
  { dark: "tint", light: "tintLight", base: zn },
  { dark: "control", light: "controlLight", base: En },
  { dark: "ink", light: "inkLight", base: En },
  { dark: "tally", light: "tallyLight", base: En },
  { dark: "tallyInk", light: "tallyInkLight", base: En }
], bs = /* @__PURE__ */ new Set();
let Dt = { ...En };
function lo() {
  return Dt;
}
function ts(e) {
  Dt = uo(e), Ns();
  for (const t of bs) t(Dt);
  return Dt;
}
function oo(e) {
  return bs.add(e), () => bs.delete(e);
}
function br(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function co(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: Je(br(e.r, t.r), 0, 255),
    g: Je(br(e.g, t.g), 0, 255),
    b: Je(br(e.b, t.b), 0, 255),
    a: Je(br(e.a, t.a), 0, 1)
  };
}
function uo(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [s, a] of Object.entries(En))
    typeof a == "boolean" ? n[s] = t[s] === void 0 ? a : !!t[s] : typeof a == "object" ? n[s] = co(t[s], a) : n[s] = br(t[s], a);
  return n;
}
function Mt({ r: e, g: t, b: n, a: s }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${je(s, 3)})`;
}
function je(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function Js({ r: e, g: t, b: n, a: s }) {
  return { r: e, g: t, b: n, a: Je(s * 1.7 + 0.22, 0, 1) };
}
function Zs(e, t) {
  const n = 0.4 + Je(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - Je(t, 0, 100) / 100) };
}
function Qs(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, a = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? Je(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * a * Math.max(t.glareFactor, 0) / 100;
  return Je(i ** (0.1 + Je(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const fo = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function ho(e, t, n) {
  const s = Je(n.shapeRoundness, 2, 7), a = e / 2, i = t / 2, l = Math.min(n.shapeRadius, a, i), c = a - l, o = i - l, f = 8, g = [];
  for (let h = 0; h <= f; h++) {
    const w = h / f * (Math.PI / 2);
    g.push([l * Math.cos(w) ** (2 / s), l * Math.sin(w) ** (2 / s)]);
  }
  const m = [], _ = (h, w, x, u) => {
    let v = Math.atan2(h, -w);
    v < 0 && (v += Math.PI * 2);
    let k = Math.atan2(u, x);
    k < 0 && (k += Math.PI * 2);
    const P = je(Qs(k, n), 3);
    m.push(`rgba(255, 255, 255, ${P}) ${je(v / (Math.PI * 2) * 100, 2)}%`);
  };
  _(0, -i, 0, 1);
  for (const [h, w, x] of fo)
    for (let u = 0; u <= f; u++) {
      const [v, k] = g[x ? f - u : u];
      _(h * (c + v), w * (o + k), h * v ** (s - 1), -w * k ** (s - 1));
    }
  return m.push(`rgba(255, 255, 255, ${je(Qs(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function Ns() {
  const e = Dt, t = document.documentElement.style, n = Zs(e.refFresnelRange, e.refFresnelHardness), s = Zs(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${je(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${je(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", Mt(e.tint)), t.setProperty("--glass-tint-light", Mt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", Mt(Js(e.tint))), t.setProperty("--glass-tint-sheet-light", Mt(Js(e.tintLight))), t.setProperty("--glass-ctl-dark", Mt(e.control)), t.setProperty("--glass-ctl-light", Mt(e.controlLight)), t.setProperty("--glass-text-dark", Mt(e.ink)), t.setProperty("--glass-text-light", Mt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", Mt(e.tally)), t.setProperty("--glass-tint-tally-light", Mt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", Mt(e.tallyInk)), t.setProperty("--glass-text-tally-light", Mt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${je(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${je(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${je(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${je(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${je(e.shadowX)}px ${je(-e.shadowY)}px ${je(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(je(Je(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${je(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(je(Math.log2(Je(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${je(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${je(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${je(Je(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${je(s.width)}px`), t.setProperty("--glass-glare-blur", `${je(s.blur)}px`);
}
function Je(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function vo(e, t, n, s, a, i) {
  const l = Math.abs(e) - n + a, c = Math.abs(t) - s + a, o = Math.max(l, 0), f = Math.max(c, 0), g = i === 2 ? Math.hypot(o, f) : (o ** i + f ** i) ** (1 / i);
  return Math.min(Math.max(l, c), 0) + g - a;
}
function po(e, t, n) {
  const s = e / 2, a = t / 2, i = Je(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), c = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), f = (_, h) => vo(_ - s, h - a, s, a, l, i), g = 256, m = new Float32Array(g + 1);
  for (let _ = 0; _ <= g; _++) {
    const h = 1 - _ / g, w = Math.asin(Je(h * h, 0, 1)), x = Math.asin(Je(Math.sin(w) / o, 0, 1));
    m[_] = Math.tan(w - x) * c;
  }
  return (_, h) => {
    const w = -f(_, h);
    if (w < 0 || w >= c) return null;
    const x = m[Math.round(w / c * g)];
    if (x === 0) return null;
    const u = 0.75, v = f(_ + u, h) - f(_ - u, h), k = f(_, h + u) - f(_, h - u), P = Math.hypot(v, k);
    if (P === 0) return null;
    const F = -x / P;
    return { dx: v * F, dy: k * F };
  };
}
function go(e, t, n) {
  const s = document.createElement("canvas");
  s.width = e, s.height = t;
  const a = s.getContext("2d"), i = a.createImageData(e, t), l = i.data, c = e * t, o = new Float32Array(c), f = new Float32Array(c);
  let g = 0;
  for (let _ = 0; _ < t; _++)
    for (let h = 0; h < e; h++) {
      const w = n(h + 0.5, _ + 0.5);
      if (!w) continue;
      const x = _ * e + h;
      o[x] = w.dx, f[x] = w.dy;
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
const ns = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function rs(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${je(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let hr = null, _o = 0;
function bo() {
  if (hr) return hr;
  const e = document.createElementNS(_s, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), hr = document.createElementNS(_s, "defs"), e.appendChild(hr), document.body.appendChild(e), hr;
}
function xn(e) {
  const t = `glass-refract-${++_o}`, n = document.createElementNS(_s, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), bo().appendChild(n);
  let s = 0, a = 0, i = 0, l = 0;
  const c = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, f = "";
  function g() {
    e.style.setProperty("--glass-pre", Dt.blurEdge ? "" : f), e.style.setProperty("--glass-post", Dt.blurEdge ? f : "");
  }
  function m() {
    s < 2 || a < 2 || e.style.setProperty("--glass-glare", ho(s, a, Dt));
  }
  function _() {
    if (s < 2 || a < 2) return;
    const u = Dt, v = go(s, a, po(s, a, u)), k = u.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(s)), n.setAttribute("height", String(a)), n.innerHTML = `<feImage x="0" y="0" width="${s}" height="${a}" preserveAspectRatio="none" href="${v.url}" result="map"/>` + rs(v.scale * (1 + k), ns[0], "r") + rs(v.scale, ns[1], "g") + rs(v.scale * (1 - k), ns[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, f = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (f = "", g()), o = c.map((P) => Dt[P]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, _();
    }));
  }
  const w = new ResizeObserver(([u]) => {
    const v = u.borderBoxSize?.[0], k = v ? { w: Math.round(v.inlineSize), h: Math.round(v.blockSize) } : { w: Math.round(u.contentRect.width), h: Math.round(u.contentRect.height) };
    k.w === s && k.h === a || (s = k.w, a = k.h, m(), h());
  });
  w.observe(e);
  const x = oo(() => {
    m(), c.map((u) => Dt[u]).join(" ") !== o ? h() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), x(), w.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const Za = "photos.stack", ea = { on: !1, strictness: null, linkage: null };
function mo() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(Za) ?? "");
  } catch {
    return { ...ea };
  }
  return e === null || typeof e != "object" ? { ...ea } : {
    on: e.on === !0,
    strictness: Number.isInteger(e.strictness) && e.strictness >= 0 ? e.strictness : null,
    linkage: typeof e.linkage == "string" && e.linkage ? e.linkage : null
  };
}
function ta(e) {
  return localStorage.setItem(
    Za,
    JSON.stringify({ on: e.on, strictness: e.strictness, linkage: e.linkage })
  ), e;
}
function Qa(e, t) {
  return e.some(
    (n) => n.strictness === t.strictness && n.linkage === t.linkage
  );
}
function wo(e, t) {
  return e.strictness === null && e.linkage === null || Qa(t, e) ? e : { ...e, strictness: null, linkage: null };
}
function na(e, t, n) {
  const s = { ...t, ...n };
  if (Qa(e, s)) return s;
  const a = "strictness" in n ? "strictness" : "linkage", i = e.find((l) => l[a] === s[a]);
  return { strictness: i.strictness, linkage: i.linkage };
}
const ei = "photos.theme", ti = "dark";
function ni() {
  return document.documentElement.dataset.theme === "light" ? "light" : ti;
}
function yo() {
  const e = localStorage.getItem(ei), t = e === "dark" || e === "light" ? e : ti;
  return document.documentElement.dataset.theme = t, t;
}
function ri(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(ei, e), e;
}
var xo = /* @__PURE__ */ C('<div class="glass selected svelte-zne36e"><span class="nums svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span></span> <button class="menu small svelte-zne36e" title="Copy the conditions and the selected ids to the clipboard">Share</button> <button class="menu small svelte-zne36e">Clear</button></div>'), ko = /* @__PURE__ */ C('<span class="spin svelte-zne36e" aria-label="loading"></span>'), ra = /* @__PURE__ */ C('<span class="badge svelte-zne36e"> </span>'), So = /* @__PURE__ */ C('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Eo = /* @__PURE__ */ C('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), ss = /* @__PURE__ */ C("<button> </button>"), To = /* @__PURE__ */ C('<div class="glass sheet sorts svelte-zne36e"></div>'), Mo = /* @__PURE__ */ C('<section><h2 class="svelte-zne36e">Strictness <span class="help svelte-zne36e" title="How many distinctive points two frames have to agree on before they are one stack.">?</span></h2> <div class="options svelte-zne36e"></div></section> <section><h2 class="svelte-zne36e">Linkage <span class="help svelte-zne36e" title="How many members of a stack a frame has to agree with, rather than only the frame before it.">?</span></h2> <div class="options svelte-zne36e"></div></section>', 1), Ao = /* @__PURE__ */ C(`<p class="note svelte-zne36e">Nothing has been grouped at this setting, so every tile is a stack of its
            own. <code class="svelte-zne36e">python -m photolib.membership</code> is the pass that writes
            one, and the settings it has been run at are what this panel offers.</p>`), Ro = /* @__PURE__ */ C('<section class="warn svelte-zne36e"><p class="note svelte-zne36e">Regrouping empties what you have selected — <strong> </strong> </p> <div class="options svelte-zne36e"><button class="option svelte-zne36e">Regroup anyway</button> <button class="option on svelte-zne36e">Keep the selection</button></div></section>'), Po = /* @__PURE__ */ C(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">The same photograph taken more than once is drawn as one tile — a
            bracket or a burst, checked frame against frame rather than guessed
            from the clock. Narrowing the filters takes frames out of a stack and
            never breaks one in two.</p></section> <!> <!> <!></div>`), Co = /* @__PURE__ */ C('<p class="muted svelte-zne36e">loading…</p>'), zo = /* @__PURE__ */ C('<span class="help svelte-zne36e">?</span>'), Oo = /* @__PURE__ */ C('<span class="n svelte-zne36e"> </span>'), No = /* @__PURE__ */ C("<button> <!></button>"), Io = /* @__PURE__ */ C('<span class="muted svelte-zne36e">nothing here</span>'), Lo = /* @__PURE__ */ C('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Fo = /* @__PURE__ */ C('<div class="glass sheet filters svelte-zne36e"><!></div>'), Do = /* @__PURE__ */ C('<div class="topbar svelte-zne36e"><div class="panes svelte-zne36e"><!> <div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <button role="switch" title="Select tiles by clicking them, then copy their ids">Select</button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function jo(e, t) {
  St(t, !0);
  let n = ae(t, "facets", 3, null), s = ae(t, "filters", 19, () => ({})), a = ae(t, "sort", 3, "newest"), i = ae(t, "stacking", 19, () => ({ on: !1, strictness: null, linkage: null })), l = ae(t, "total", 3, null), c = ae(t, "tiles", 3, null), o = ae(t, "loading", 3, !1), f = ae(t, "selecting", 3, !1), g = ae(t, "selectedTally", 19, () => ({ stacks: 0, photos: 0 })), m = ae(t, "onfilter", 3, () => {
  }), _ = ae(t, "onsort", 3, () => {
  }), h = ae(t, "onstack", 3, () => {
  }), w = ae(t, "onclear", 3, () => {
  }), x = ae(t, "onselecting", 3, () => {
  }), u = ae(t, "onshare", 3, () => {
  }), v = ae(t, "ondeselect", 3, () => {
  }), k = ae(t, "ontriage", 3, () => {
  }), P = /* @__PURE__ */ $(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), F = /* @__PURE__ */ $(Fe(ni())), Y = /* @__PURE__ */ $(null);
  const X = /* @__PURE__ */ le(() => c() ?? l()), Z = /* @__PURE__ */ le(() => n()?.dimensions ?? []), Q = /* @__PURE__ */ le(() => n()?.sorts ?? []), B = /* @__PURE__ */ le(() => r(Q).find((L) => L.value === a())?.label ?? a()), D = /* @__PURE__ */ le(() => Object.values(s()).reduce((L, ce) => L + ce.length, 0)), V = /* @__PURE__ */ le(() => r(Z).flatMap((L) => (s()[L.name] ?? []).map((ce) => ({
    dimension: L.name,
    value: ce,
    title: L.title,
    label: L.options.find((Se) => Se.value === ce)?.label ?? String(ce)
  }))));
  function z(L, ce) {
    const Se = s()[L] ?? [], Ie = Se.includes(ce) ? Se.filter((De) => De !== ce) : [...Se, ce];
    m()(L, Ie);
  }
  function re(L, ce) {
    return (s()[L] ?? []).includes(ce);
  }
  function de() {
    S(F, ri(r(F) === "dark" ? "light" : "dark"), !0);
  }
  const j = /* @__PURE__ */ le(() => n()?.stacking?.settings ?? []), ee = /* @__PURE__ */ le(() => ({
    strictness: i().strictness ?? n()?.stacking?.default?.strictness,
    linkage: i().linkage ?? n()?.stacking?.default?.linkage
  })), ue = /* @__PURE__ */ le(() => [...new Set(r(j).map((L) => L.strictness))].sort((L, ce) => L - ce)), me = /* @__PURE__ */ le(() => r(j).filter((L) => L.strictness === r(ee).strictness)), R = /* @__PURE__ */ le(() => r(j).some((L) => L.strictness === r(ee).strictness && L.linkage === r(ee).linkage));
  let O = /* @__PURE__ */ $(null);
  function I(L) {
    L.on === i().on && (L.strictness ?? r(ee).strictness) === r(ee).strictness && (L.linkage ?? r(ee).linkage) === r(ee).linkage || (g().stacks > 0 ? S(O, L, !0) : h()(L));
  }
  function G() {
    const L = r(O);
    S(O, null), h()(L);
  }
  xt(() => {
    r(P) !== "stacks" && S(O, null);
  });
  function T(L) {
    L.key === "Escape" && S(P, "");
  }
  function W(L) {
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
  var J = Do();
  In("keydown", Mn, T), In("pointerdown", Mn, W);
  var Te = d(J), ve = d(Te);
  {
    var Re = (L) => {
      var ce = xo(), Se = d(ce), Ie = d(Se), De = d(Ie), Me = p(Ie, 2), et = d(Me), ht = p(Me, 2), Xt = d(ht), tt = p(ht, 2), pn = d(tt), rn = p(Se, 2), sn = p(rn, 2);
      yn(ce, (Be) => xn?.(Be)), H(
        (Be, mt) => {
          M(De, Be), M(et, g().stacks === 1 ? "stack" : "stacks"), M(Xt, mt), M(pn, g().photos === 1 ? "photo" : "photos");
        },
        [
          () => Ce(g().stacks),
          () => Ce(g().photos)
        ]
      ), se("click", rn, () => u()()), se("click", sn, () => v()()), A(L, ce);
    };
    ne(ve, (L) => {
      g().stacks && L(Re);
    });
  }
  var ze = p(ve, 2), Pe = d(ze), we = d(Pe), ke = p(Pe, 2), Oe = d(ke), q = p(ke, 2);
  {
    var he = (L) => {
      var ce = ko();
      A(L, ce);
    };
    ne(q, (L) => {
      o() && L(he);
    });
  }
  yn(ze, (L) => xn?.(L));
  var te = p(Te, 2), b = d(te), E = d(b), N = d(E);
  let K;
  var fe = d(N), oe = p(N, 2);
  let ie;
  var xe = p(d(oe));
  {
    var Ye = (L) => {
      var ce = ra(), Se = d(ce);
      H(() => M(Se, r(D))), A(L, ce);
    };
    ne(xe, (L) => {
      r(D) && L(Ye);
    });
  }
  var Ne = p(oe, 2);
  let qe;
  var dt = p(d(Ne));
  {
    var We = (L) => {
      var ce = ra(), Se = d(ce);
      H((Ie) => M(Se, Ie), [() => Ce(l())]), A(L, ce);
    };
    ne(dt, (L) => {
      i().on && l() !== null && L(We);
    });
  }
  var at = p(Ne, 2);
  let Yt;
  var Wt = p(at, 2);
  {
    var Gt = (L) => {
      var ce = Eo(), Se = d(ce);
      Xe(Se, 17, () => r(V), (De) => De.dimension + " " + De.value, (De, Me) => {
        var et = So(), ht = d(et), Xt = d(ht), tt = p(ht, 1, !0);
        H(() => {
          ge(et, "title", `${r(Me).title ?? ""}: ${r(Me).label ?? ""} — click to remove`), M(Xt, r(Me).title), M(tt, r(Me).label);
        }), se("click", et, () => z(r(Me).dimension, r(Me).value)), A(De, et);
      });
      var Ie = p(Se, 2);
      se("click", Ie, () => w()()), A(L, ce);
    };
    ne(Wt, (L) => {
      r(V).length && L(Gt);
    });
  }
  var it = p(E, 2), lt = d(it), Ot = p(it, 2);
  yn(b, (L) => xn?.(L));
  var Nt = p(b, 2);
  {
    var ft = (L) => {
      var ce = To();
      Xe(ce, 21, () => r(Q), _t, (Se, Ie) => {
        var De = ss();
        let Me;
        var et = d(De);
        H(() => {
          Me = Ee(De, 1, "option svelte-zne36e", null, Me, { on: r(Ie).value === a() }), M(et, r(Ie).label);
        }), se("click", De, () => {
          _()(r(Ie).value), S(P, "");
        }), A(Se, De);
      }), yn(ce, (Se) => xn?.(Se)), A(L, ce);
    };
    ne(Nt, (L) => {
      r(P) === "sort" && L(ft);
    });
  }
  var Ze = p(Nt, 2);
  {
    var nn = (L) => {
      var ce = Po(), Se = d(ce), Ie = p(d(Se), 2), De = d(Ie);
      let Me;
      var et = d(De), ht = p(Se, 2);
      {
        var Xt = (Be) => {
          var mt = Mo(), an = ct(mt), $t = p(d(an), 2);
          Xe($t, 21, () => r(ue), _t, (nt, y) => {
            var U = ss();
            let pe;
            var Ae = d(U);
            H(() => {
              pe = Ee(U, 1, "option svelte-zne36e", null, pe, { on: r(y) === r(ee).strictness }), M(Ae, r(y));
            }), se("click", U, () => I({
              ...i(),
              ...na(r(j), r(ee), { strictness: r(y) })
            })), A(nt, U);
          });
          var Rn = p(an, 2), Pn = p(d(Rn), 2);
          Xe(Pn, 21, () => r(me), _t, (nt, y) => {
            var U = ss();
            let pe;
            var Ae = d(U);
            H(() => {
              pe = Ee(U, 1, "option svelte-zne36e", null, pe, { on: r(y).linkage === r(ee).linkage }), M(Ae, r(y).label);
            }), se("click", U, () => I({
              ...i(),
              ...na(r(j), r(ee), { linkage: r(y).linkage })
            })), A(nt, U);
          }), A(Be, mt);
        };
        ne(ht, (Be) => {
          i().on && r(ue).length && Be(Xt);
        });
      }
      var tt = p(ht, 2);
      {
        var pn = (Be) => {
          var mt = Ao();
          A(Be, mt);
        };
        ne(tt, (Be) => {
          n() && !r(R) && Be(pn);
        });
      }
      var rn = p(tt, 2);
      {
        var sn = (Be) => {
          var mt = Ro(), an = d(mt), $t = p(d(an)), Rn = d($t), Pn = p($t), nt = p(an, 2), y = d(nt), U = p(y, 2);
          H(
            (pe, Ae) => {
              M(Rn, pe), M(Pn, ` ${g().stacks === 1 ? "stack" : "stacks"}, ${Ae ?? ""}
              ${g().photos === 1 ? "photograph" : "photographs"}. The stacks
              it names will not exist afterwards.`);
            },
            [
              () => Ce(g().stacks),
              () => Ce(g().photos)
            ]
          ), se("click", y, G), se("click", U, () => S(O, null)), A(Be, mt);
        };
        ne(rn, (Be) => {
          r(O) && Be(sn);
        });
      }
      yn(ce, (Be) => xn?.(Be)), H(() => {
        Me = Ee(De, 1, "option svelte-zne36e", null, Me, { on: i().on }), ge(De, "aria-checked", i().on), M(et, i().on ? "On" : "Off");
      }), se("click", De, () => I({ ...i(), on: !i().on })), A(L, ce);
    };
    ne(Ze, (L) => {
      r(P) === "stacks" && L(nn);
    });
  }
  var Kt = p(Ze, 2);
  {
    var ur = (L) => {
      var ce = Fo(), Se = d(ce);
      {
        var Ie = (Me) => {
          var et = Co();
          A(Me, et);
        }, De = (Me) => {
          var et = Ps(), ht = ct(et);
          Xe(ht, 17, () => r(Z), _t, (Xt, tt) => {
            var pn = Lo(), rn = d(pn), sn = d(rn), Be = p(sn);
            {
              var mt = (nt) => {
                var y = zo();
                H(() => ge(y, "title", r(tt).hint)), A(nt, y);
              };
              ne(Be, (nt) => {
                r(tt).hint && nt(mt);
              });
            }
            var an = p(rn, 2), $t = d(an);
            Xe($t, 17, () => r(tt).options, _t, (nt, y) => {
              var U = No();
              let pe;
              var Ae = d(U), Ue = p(Ae);
              {
                var It = (Tt) => {
                  var ln = Oo(), wt = d(ln);
                  H((qn) => M(wt, qn), [() => Ce(r(y).count)]), A(Tt, ln);
                };
                ne(Ue, (Tt) => {
                  r(y).count !== null && Tt(It);
                });
              }
              H(
                (Tt) => {
                  pe = Ee(U, 1, "option svelte-zne36e", null, pe, Tt), M(Ae, `${r(y).label ?? ""} `);
                },
                [
                  () => ({ on: re(r(tt).name, r(y).value) })
                ]
              ), se("click", U, () => z(r(tt).name, r(y).value)), A(nt, U);
            });
            var Rn = p($t, 2);
            {
              var Pn = (nt) => {
                var y = Io();
                A(nt, y);
              };
              ne(Rn, (nt) => {
                r(tt).options.length || nt(Pn);
              });
            }
            H(() => M(sn, `${r(tt).title ?? ""} `)), A(Xt, pn);
          }), A(Me, et);
        };
        ne(Se, (Me) => {
          n() ? Me(De, -1) : Me(Ie);
        });
      }
      yn(ce, (Me) => xn?.(Me)), A(L, ce);
    };
    ne(Kt, (L) => {
      r(P) === "filters" && L(ur);
    });
  }
  kr(J, (L) => S(Y, L), () => r(Y)), H(
    (L) => {
      M(we, L), M(Oe, r(X) === 1 ? "photo" : "photos"), K = Ee(N, 1, "menu svelte-zne36e", null, K, { open: r(P) === "sort" }), ge(N, "aria-expanded", r(P) === "sort"), M(fe, r(B)), ie = Ee(oe, 1, "menu svelte-zne36e", null, ie, { open: r(P) === "filters", on: r(D) > 0 }), ge(oe, "aria-expanded", r(P) === "filters"), qe = Ee(Ne, 1, "menu svelte-zne36e", null, qe, { open: r(P) === "stacks", on: i().on }), ge(Ne, "aria-expanded", r(P) === "stacks"), Yt = Ee(at, 1, "menu svelte-zne36e", null, Yt, { on: f() }), ge(at, "aria-checked", f()), ge(it, "title", r(F) === "dark" ? "Switch to a white background" : "Switch to a black background"), ge(it, "aria-label", r(F) === "dark" ? "Switch to a white background" : "Switch to a black background"), M(lt, r(F) === "dark" ? "☀" : "☾");
    },
    [() => r(X) === null ? "…" : Ce(r(X))]
  ), se("click", N, () => S(P, r(P) === "sort" ? "" : "sort", !0)), se("click", oe, () => S(P, r(P) === "filters" ? "" : "filters", !0)), se("click", Ne, () => S(P, r(P) === "stacks" ? "" : "stacks", !0)), se("click", at, () => x()(!f())), se("click", it, de), se("click", Ot, () => k()()), A(e, J), Et();
}
Ut(["click"]);
const Vt = 4, qr = 220, Ho = 340, kn = 12, sa = Vt + kn, si = 6, Bo = 5, qo = 0.025, Uo = 9;
function Ur(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Yo(e, t, n, s, a) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, c = 0, o = 1 / 0;
    for (; l < e.length && (c += Ur(e[l]), l++, o = (n - Vt * (l - i - 1)) / c, !(o <= qr)); )
      ;
    if (o > qr && !s) break;
    a(i, l, Math.round(Math.min(o, Ho))), i = l;
  }
  return i;
}
function ai(e, t, n) {
  const s = [];
  let a = 0;
  for (let i = e.from; i < e.to; i++) {
    const c = i === e.to - 1 ? n - a : Math.round(Ur(t[i]) * e.height);
    s.push({ index: i, x: a, w: c }), a += c + Vt;
  }
  return s;
}
function Wo(e, t) {
  const n = Math.min((e | 0) - 1, si);
  if (n < 1) return [];
  const s = Math.min(Bo, t * qo), a = [];
  for (let i = 1; i <= n; i++)
    a.push({
      top: Math.round(kn * (n - i) / n),
      inset: Math.round(i * s),
      // Integer percent, so the value lands on the decimal it reads as rather
      // than on whatever a chain of float multiplies leaves behind.
      opacity: (100 - (i - 1) * Uo) / 100
    });
  return a;
}
function aa(e, t, n, s) {
  const a = ms(e, s.top, s.bottom);
  if (!a) return [];
  const i = [];
  for (let l = a[0]; l <= a[1]; l++) {
    const c = e[l];
    if (!(c.top > s.bottom || c.top + c.height < s.top))
      for (const o of ai(c, t, n))
        o.x <= s.right && o.x + o.w >= s.left && i.push(o.index);
  }
  return i;
}
function ms(e, t, n) {
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
var Go = /* @__PURE__ */ C('<img class="thumb svelte-5g1i2z" alt=""/>'), Ko = /* @__PURE__ */ C('<button type="button" title="Reveal this frame in Explorer"><!> <img alt="" decoding="async"/></button>'), Xo = /* @__PURE__ */ C('<div role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Previous tile" aria-label="Previous tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M14.5 5 7.5 12l7 7"></path></svg></button></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Next tile" aria-label="Next tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M9.5 5l7 7-7 7"></path></svg></button></div></div>');
function $o(e, t) {
  St(t, !0);
  let n = ae(t, "frames", 19, () => []), s = ae(t, "cover", 3, null), a = ae(t, "origin", 3, null), i = ae(t, "back", 3, !1), l = ae(t, "forward", 3, !1), c = ae(t, "onstep", 3, () => {
  }), o = ae(t, "onreveal", 3, () => {
  }), f = ae(t, "onclose", 3, () => {
  });
  const g = 40, m = 72, _ = /* @__PURE__ */ le(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`), h = /* @__PURE__ */ le(() => n().findIndex((q) => q.id === s()));
  let w = /* @__PURE__ */ $(Fe(document.documentElement.clientWidth)), x = /* @__PURE__ */ $(Fe(document.documentElement.clientHeight)), u = /* @__PURE__ */ $(null), v = /* @__PURE__ */ $(Fe(/* @__PURE__ */ new Set()));
  const k = 4, P = 25, F = { x: 0, y: 0, w: 0, h: 0 }, Y = /* @__PURE__ */ le(() => Math.max(0, r(w) - m * 2)), X = /* @__PURE__ */ le(() => Math.max(0, r(x) - g * 2)), Z = /* @__PURE__ */ le(() => r(Y) > 0 && r(X) > 0 ? V(n(), r(Y), r(X)) : n().map(() => F));
  function Q(q, he, te) {
    const b = [];
    let E = 0, N = 0;
    for (let K = 0; K < q.length; K++)
      N += Ur(q[K]), N * te + Vt * (K - E) >= he && (b.push({ from: E, to: K + 1, sum: N }), E = K + 1, N = 0);
    return E < q.length && b.push({ from: E, to: q.length, sum: N }), b;
  }
  function B(q, he, te) {
    return q.map((b, E) => {
      const N = (he - Vt * (b.to - b.from - 1)) / b.sum;
      return E === q.length - 1 && N > te ? te : N;
    });
  }
  function D(q, he, te) {
    return B(q, he, te).reduce((b, E) => b + E, 0) + Vt * (q.length - 1);
  }
  function V(q, he, te) {
    let b = k, E = Math.max(k, te);
    for (let ie = 0; ie < P; ie++) {
      const xe = (b + E) / 2;
      D(Q(q, he, xe), he, xe) <= te ? b = xe : E = xe;
    }
    const N = Q(q, he, b), K = B(N, he, b), fe = [];
    let oe = (te - (K.reduce((ie, xe) => ie + xe, 0) + Vt * (N.length - 1))) / 2;
    return N.forEach((ie, xe) => {
      const Ye = K[xe], Ne = [];
      for (let We = ie.from; We < ie.to; We++) Ne.push(Ur(q[We]) * Ye);
      const qe = Ne.reduce((We, at) => We + at, 0) + Vt * (Ne.length - 1);
      let dt = (he - qe) / 2;
      for (const We of Ne)
        fe.push({
          x: Math.round(dt),
          y: Math.round(oe),
          w: Math.round(We),
          h: Math.round(Ye)
        }), dt += We + Vt;
      oe += Ye + Vt;
    }), fe;
  }
  function z(q) {
    if (!a() || !q || !q.w || !q.h) return "none";
    const he = a().left - (m + q.x), te = a().top - r(de) - (g + q.y);
    return `translate(${he}px, ${te}px) scale(${a().width / q.w}, ${a().height / q.h})`;
  }
  let re = window.scrollY, de = /* @__PURE__ */ $(0);
  xt(() => {
    a(), re = window.scrollY;
  });
  const j = 1600;
  let ee = /* @__PURE__ */ $(!1), ue = 0;
  function me() {
    S(ee, !1), clearTimeout(ue), ue = setTimeout(() => S(ee, !0), j);
  }
  const R = 220;
  let O = /* @__PURE__ */ $(!1), I = 0;
  function G() {
    r(O) || (S(de, window.scrollY - re), S(O, !0), I = setTimeout(f(), R));
  }
  function T(q, he = !1) {
    r(O) || c()(q, he);
  }
  function W(q) {
    if (q.key === "Escape") {
      G();
      return;
    }
    q.key !== "ArrowLeft" && q.key !== "ArrowRight" || (q.preventDefault(), T(q.key === "ArrowLeft" ? -1 : 1, q.repeat));
  }
  function J(q) {
    q.target.closest(".frame, .lane") || G();
  }
  function Te(q) {
    r(O) || (o()(q), G());
  }
  cr(() => (r(u)?.focus(), me(), () => {
    clearTimeout(ue), clearTimeout(I);
  }));
  var ve = Xo();
  In("keydown", Mn, W), In("pointerdown", Mn, J), In("pointermove", Mn, me);
  let Re;
  Jt(ve, "", {}, { "--leave": "220ms" });
  var ze = d(ve);
  Jt(ze, "", {}, { inset: "40px 72px" }), Xe(ze, 23, n, (q) => q.id, (q, he, te) => {
    var b = Ko();
    let E, N;
    var K = d(b);
    {
      var fe = (xe) => {
        var Ye = Go();
        H(() => ge(Ye, "src", `/t/${r(he).s ?? ""}.webp`)), A(xe, Ye);
      };
      ne(K, (xe) => {
        r(te) === r(h) && xe(fe);
      });
    }
    var oe = p(K, 2);
    let ie;
    H(
      (xe, Ye) => {
        E = Ee(b, 1, "frame svelte-5g1i2z", null, E, { cover: r(te) === r(h) }), N = Jt(b, "", N, xe), ge(oe, "src", `/d/${r(he).s ?? ""}.webp`), ie = Ee(oe, 1, "svelte-5g1i2z", null, ie, Ye);
      },
      [
        () => ({
          left: `${r(Z)[r(te)].x ?? ""}px`,
          top: `${r(Z)[r(te)].y ?? ""}px`,
          width: `${r(Z)[r(te)].w ?? ""}px`,
          height: `${r(Z)[r(te)].h ?? ""}px`,
          "--flight": r(te) === r(h) ? z(r(Z)[r(te)]) : null
        }),
        () => ({ loaded: r(v).has(r(he).id) })
      ]
    ), se("click", b, () => Te(r(he))), In("load", oe, () => S(v, new Set(r(v)).add(r(he).id), !0)), A(q, b);
  });
  var Pe = p(ze, 2);
  Jt(Pe, "", {}, { width: "44px", left: "14px" });
  var we = d(Pe);
  yn(we, (q) => xn?.(q));
  var ke = p(Pe, 2);
  Jt(ke, "", {}, { width: "44px", right: "14px" });
  var Oe = d(ke);
  yn(Oe, (q) => xn?.(q)), kr(ve, (q) => S(u, q), () => r(u)), H(() => {
    Re = Ee(ve, 1, "glass pane svelte-5g1i2z", null, Re, { resting: r(ee), leaving: r(O) }), ge(ve, "aria-label", r(_)), we.disabled = !i(), Oe.disabled = !l();
  }), se("click", we, () => T(-1)), se("click", Oe, () => T(1)), Ks(ve, "clientWidth", (q) => S(w, q)), Ks(ve, "clientHeight", (q) => S(x, q)), A(e, ve), Et();
}
Ut(["click"]);
var Vo = /* @__PURE__ */ C('<span class="err svelte-uzy12d"> </span>'), Jo = /* @__PURE__ */ C(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Zo = /* @__PURE__ */ C(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), Qo = /* @__PURE__ */ C('<span class="muted svelte-uzy12d"> </span>'), ec = /* @__PURE__ */ C('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function tc(e, t) {
  St(t, !0);
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
  var l = ec(), c = d(l), o = d(c), f = p(c, 2);
  {
    var g = (h) => {
      var w = Vo(), x = d(w);
      H(() => M(x, r(a))), A(h, w);
    }, m = (h) => {
      var w = Ps(), x = ct(w);
      {
        var u = (k) => {
          var P = Jo(), F = p(d(P), 2);
          H(
            (Y) => M(F, ` above are formats the header
        reader cannot measure (${Y ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), A(k, P);
        }, v = (k) => {
          var P = Zo(), F = d(P), Y = d(F), X = p(F, 2), Z = d(X);
          H(
            (Q) => {
              M(Y, Q), M(Z, r(n).command);
            },
            [() => Ce(r(n).worklist)]
          ), A(k, P);
        };
        ne(x, (k) => {
          r(n).worklist === 0 ? k(u) : k(v, -1);
        });
      }
      A(h, w);
    }, _ = (h) => {
      var w = Qo(), x = d(w);
      H(() => M(x, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), A(h, w);
    };
    ne(f, (h) => {
      r(a) ? h(g) : r(n) ? h(m, 1) : h(_, -1);
    });
  }
  H(() => {
    c.disabled = r(s), M(o, r(s) ? "counting…" : "Check the dimension probe's worklist");
  }), se("click", c, i), A(e, l), Et();
}
Ut(["click"]);
var nc = /* @__PURE__ */ C('<p class="bad svelte-1xjbga"> </p>'), rc = /* @__PURE__ */ C('<pre class="svelte-1xjbga"> </pre>'), sc = /* @__PURE__ */ C('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), ac = /* @__PURE__ */ C(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), ic = /* @__PURE__ */ C('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), lc = /* @__PURE__ */ C('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), oc = /* @__PURE__ */ C(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), cc = /* @__PURE__ */ C('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), uc = /* @__PURE__ */ C(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function dc(e, t) {
  St(t, !0);
  let n = /* @__PURE__ */ $(null), s = /* @__PURE__ */ $(!1), a = /* @__PURE__ */ $(null), i = /* @__PURE__ */ $(null);
  const l = /* @__PURE__ */ le(() => r(n)?.state === "running"), c = /* @__PURE__ */ le(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const k = await Ge.rebuildStatus();
      S(n, k, !0), S(a, null), k.state === "done" && k.started_at !== r(i) && (S(i, k.started_at, !0), t.oncomplete?.());
    } catch (k) {
      S(a, String(k), !0);
    }
  }
  cr(() => {
    o();
  }), xt(() => {
    if (!r(l)) return;
    const k = setInterval(o, 700);
    return () => clearInterval(k);
  });
  async function f() {
    S(s, !0), S(a, null);
    try {
      S(n, await Ge.rebuild(), !0);
    } catch (k) {
      S(a, String(k), !0);
    }
  }
  function g(k) {
    k.key === "Escape" && S(s, !1);
  }
  var m = uc();
  In("keydown", Mn, g);
  var _ = ct(m), h = d(_), w = d(h), x = p(h, 2), u = p(_, 2);
  {
    var v = (k) => {
      var P = cc(), F = ct(P), Y = p(F, 2), X = d(Y), Z = p(d(X), 4), Q = d(Z), B = p(Z, 2), D = p(X, 2);
      {
        var V = (R) => {
          var O = nc(), I = d(O);
          H(() => M(I, r(a))), A(R, O);
        };
        ne(D, (R) => {
          r(a) && R(V);
        });
      }
      var z = p(D, 2);
      Xe(z, 17, () => r(n)?.steps ?? [], _t, (R, O) => {
        var I = sc();
        let G;
        var T = d(I), W = d(T), J = d(W);
        {
          var Te = (te) => {
            var b = Jn("✓");
            A(te, b);
          }, ve = (te) => {
            var b = Jn("✕");
            A(te, b);
          }, Re = (te) => {
            var b = Jn("·");
            A(te, b);
          }, ze = (te) => {
            var b = Jn(" ");
            A(te, b);
          };
          ne(J, (te) => {
            r(O).state === "done" ? te(Te) : r(O).state === "failed" ? te(ve, 1) : r(O).state === "running" ? te(Re, 2) : te(ze, -1);
          });
        }
        var Pe = p(W, 2), we = d(Pe), ke = p(Pe, 4), Oe = d(ke), q = p(T, 2);
        {
          var he = (te) => {
            var b = rc(), E = d(b);
            H((N) => M(E, N), [() => r(O).log.join(`
`)]), A(te, b);
          };
          ne(q, (te) => {
            r(O).log.length && te(he);
          });
        }
        H(() => {
          G = Ee(I, 1, "step svelte-1xjbga", null, G, {
            on: r(O).state === "running",
            bad: r(O).state === "failed"
          }), M(we, r(O).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), M(Oe, r(O).seconds === null ? "" : r(O).seconds + "s");
        }), A(R, I);
      });
      var re = p(z, 2);
      {
        var de = (R) => {
          var O = ac(), I = ct(O), G = d(I);
          H(() => M(G, r(n).error)), A(R, O);
        }, j = (R) => {
          var O = ic();
          A(R, O);
        }, ee = (R) => {
          var O = lc();
          A(R, O);
        };
        ne(re, (R) => {
          r(n)?.state === "failed" ? R(de) : r(n)?.state === "done" ? R(j, 1) : r(l) && R(ee, 2);
        });
      }
      var ue = p(re, 2);
      {
        var me = (R) => {
          var O = oc(), I = p(d(O), 6), G = d(I);
          H(() => M(G, `python -m photolib.restore_state ${r(c) ?? ""}`)), A(R, O);
        };
        ne(ue, (R) => {
          r(c) && R(me);
        });
      }
      H(() => M(Q, `${r(n)?.seconds ?? 0 ?? ""}s`)), se("click", F, () => S(s, !1)), se("click", B, () => S(s, !1)), A(k, P);
    };
    ne(u, (k) => {
      r(s) && k(v);
    });
  }
  H(() => {
    h.disabled = r(l), M(w, r(l) ? "applying…" : "Apply to grid"), x.disabled = !r(n) || r(n).state === "idle";
  }), se("click", h, f), se("click", x, () => S(s, !0)), A(e, m), Et();
}
Ut(["click"]);
var fc = /* @__PURE__ */ C('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), ia = /* @__PURE__ */ C("<option> </option>"), hc = /* @__PURE__ */ C('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), vc = /* @__PURE__ */ C('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), pc = /* @__PURE__ */ C('<div class="none muted svelte-bqi9ky"> </div>'), gc = /* @__PURE__ */ C('<div class="bar svelte-bqi9ky"><!></div>');
function _c(e, t) {
  St(t, !0);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), c = /* @__PURE__ */ le(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ le(() => !!n() && n().op !== "is null");
  function f(x, u) {
    const v = { ...n(), [x]: u };
    if (x === "column") {
      const k = i[u] ?? ["="];
      k.includes(v.op) || (v.op = k[0]), v.value = l.has(u) ? 0 : "";
    }
    x === "op" && u === "is null" && (v.value = null), x === "value" && l.has(v.column) && (v.value = Number(u) || 0), t.onedit(v);
  }
  var g = gc(), m = d(g);
  {
    var _ = (x) => {
      var u = fc(), v = d(u), k = d(v), P = p(v, 2), F = d(P);
      H(() => {
        M(k, `${t.screen.title ?? ""} does not save a rule.`), M(F, t.screen.blurb);
      }), A(x, u);
    }, h = (x) => {
      var u = vc(), v = ct(u), k = d(v);
      Xe(k, 21, () => a, _t, (I, G) => {
        var T = ia(), W = d(T), J = {};
        H(() => {
          M(W, r(G)), J !== (J = r(G)) && (T.value = (T.__value = r(G)) ?? "");
        }), A(I, T);
      });
      var P;
      Pr(k);
      var F = p(k, 2);
      Xe(F, 21, () => r(c), _t, (I, G) => {
        var T = ia(), W = d(T), J = {};
        H(() => {
          M(W, r(G)), J !== (J = r(G)) && (T.value = (T.__value = r(G)) ?? "");
        }), A(I, T);
      });
      var Y;
      Pr(F);
      var X = p(F, 2);
      {
        var Z = (I) => {
          var G = hc();
          H(() => $n(G, n().value ?? "")), se("input", G, (T) => f("value", T.currentTarget.value)), A(I, G);
        };
        ne(X, (I) => {
          r(o) && I(Z);
        });
      }
      var Q = p(X, 2), B = d(Q);
      B.value = B.__value = "exclude";
      var D = p(B);
      D.value = D.__value = "include";
      var V;
      Pr(Q);
      var z = p(Q, 2), re = d(z);
      re.value = re.__value = "end";
      var de = p(re);
      de.value = de.__value = "0";
      var j;
      Pr(z);
      var ee = p(z, 2), ue = d(ee), me = p(ee, 2), R = p(v, 2), O = d(R);
      H(
        (I, G) => {
          P !== (P = n().column) && (k.value = (k.__value = n().column) ?? "", _r(k, n().column)), Y !== (Y = n().op) && (F.value = (F.__value = n().op) ?? "", _r(F, n().op)), V !== (V = n().decision ?? "exclude") && (Q.value = (Q.__value = n().decision ?? "exclude") ?? "", _r(Q, n().decision ?? "exclude")), j !== (j = I) && (z.value = (z.__value = I) ?? "", _r(z, I)), ee.disabled = s(), M(ue, s() ? "saving…" : "Confirm"), M(O, `${G ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Vl(n())
        ]
      ), se("change", k, (I) => f("column", I.currentTarget.value)), se("change", F, (I) => f("op", I.currentTarget.value)), se("change", Q, (I) => f("decision", I.currentTarget.value)), se("change", z, (I) => f("at", I.currentTarget.value)), se("click", ee, function(...I) {
        t.onconfirm?.apply(this, I);
      }), se("click", me, function(...I) {
        t.onclear?.apply(this, I);
      }), A(x, u);
    }, w = (x) => {
      var u = pc(), v = d(u);
      H(() => M(v, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), A(x, u);
    };
    ne(m, (x) => {
      t.screen.rule === !1 ? x(_) : n() ? x(h, 1) : x(w, -1);
    });
  }
  A(e, g), Et();
}
Ut(["change", "input", "click"]);
var bc = /* @__PURE__ */ C('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), mc = /* @__PURE__ */ C('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), wc = /* @__PURE__ */ C('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), yc = /* @__PURE__ */ C('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function xc(e, t) {
  St(t, !0);
  let n = ae(t, "rules", 19, () => []), s = ae(t, "unmatched", 3, null), a = ae(t, "busy", 3, !1);
  var i = yc(), l = d(i), c = p(d(l)), o = d(c), f = p(l, 2);
  {
    var g = (w) => {
      var x = bc();
      A(w, x);
    };
    ne(f, (w) => {
      n().length === 0 && w(g);
    });
  }
  var m = p(f, 2);
  Xe(m, 19, n, (w) => w.id, (w, x, u) => {
    var v = mc();
    let k;
    var P = d(v), F = d(P), Y = d(F), X = p(F, 2), Z = d(X), Q = p(X, 2), B = d(Q), D = p(P, 2), V = d(D), z = d(V), re = p(V, 2), de = d(re), j = p(re, 4), ee = p(j, 2), ue = p(ee, 2);
    H(
      (me, R) => {
        k = Ee(v, 1, "rule svelte-aof9c2", null, k, { exclude: r(x).decision === "exclude" }), M(Y, r(u)), M(Z, r(x).predicate), M(B, r(x).decision), M(z, `${me ?? ""} paths`), M(de, R), j.disabled = a() || r(u) === 0, ee.disabled = a() || r(u) === n().length - 1, ue.disabled = a();
      },
      [
        () => Ce(r(x).paths),
        () => Ft(r(x).bytes)
      ]
    ), se("click", j, () => t.onmove(r(x), r(u) - 1)), se("click", ee, () => t.onmove(r(x), r(u) + 1)), se("click", ue, () => t.ondelete(r(x))), A(w, v);
  });
  var _ = p(m, 2);
  {
    var h = (w) => {
      var x = wc(), u = p(d(x), 2), v = d(u), k = d(v), P = p(v, 2), F = d(P);
      H(
        (Y, X) => {
          M(k, `${Y ?? ""} paths`), M(F, X);
        },
        [
          () => Ce(s().paths),
          () => Ft(s().bytes)
        ]
      ), A(w, x);
    };
    ne(_, (w) => {
      s() && w(h);
    });
  }
  H(() => M(o, `${n().length ?? ""} rules · top-down, first match wins`)), A(e, i), Et();
}
Ut(["click"]);
function as(e) {
  return { key: e.id, ids: (e.m ?? [e]).map((t) => t.id) };
}
function kc(e, t) {
  const n = e.filter((s) => s.key !== t.key);
  return n.length === e.length ? [...e, t] : n;
}
function la(e, t, n) {
  if (!n) {
    const a = new Set(t.map((i) => i.key));
    return e.filter((i) => !a.has(i.key));
  }
  const s = new Set(e.map((a) => a.key));
  return [...e, ...t.filter((a) => !s.has(a.key))];
}
function Sc(e) {
  return {
    stacks: e.length,
    photos: e.reduce((t, n) => t + n.ids.length, 0)
  };
}
function Ec(e) {
  const t = e.stacking.on ? "on" + (e.stacking.strictness === null && e.stacking.linkage === null ? "" : ` strictness=${e.stacking.strictness} linkage=${e.stacking.linkage}`) : "off", n = Object.entries(e.filters).filter(([, s]) => s.length > 0).sort(([s], [a]) => s < a ? -1 : s > a ? 1 : 0).map(([s, a]) => s + ":" + a.join("|"));
  return `stack=${t} sort=${e.sort} filters=${n.length ? n.join(",") : "none"}`;
}
function Tc(e, t) {
  const n = t.map((s) => "[" + s.ids.join(",") + "]").join(",");
  return Ec(e) + `
` + n;
}
const oa = 2500, Mc = 1, Ac = 2, ca = 4, Rc = 3e7, Cn = /* @__PURE__ */ new WeakMap();
function ua(e) {
  return Cn.get(e).photo.getBoundingClientRect();
}
function Pc(e, t, n) {
  const s = [], a = [], i = /* @__PURE__ */ new Map(), l = [], c = [];
  let o = 0, f = kn, g = null, m = null, _ = null, h = !1, w = !1, x = 0, u = 0, v = 0, k = n.onState || (() => {
  });
  function P(b) {
    x <= 0 || (o = Yo(s, o, x, b, (E, N, K) => {
      a.push({ top: f, height: K, from: E, to: N }), f += K + sa;
    }), Y());
  }
  function F() {
    if (m === null || h || x <= 0 || o >= m) return 0;
    const b = a.length ? o / a.length : Math.max(1, x / qr), E = a.length ? (f - kn) / a.length : qr + sa, N = Math.round((m - o) / b * E);
    return Math.max(0, Math.min(N, Rc - f));
  }
  function Y() {
    e.style.height = f + F() + "px", t.style.top = Math.max(0, f - 1) + "px";
  }
  function X() {
    return window.scrollY - e.offsetTop;
  }
  function Z() {
    const b = l.pop();
    if (b) return b;
    const E = document.createElement("div");
    E.className = "tile", E.tabIndex = -1;
    const N = document.createElement("div");
    N.className = "deck", N.style.height = kn + "px";
    const K = [];
    for (let ie = 0; ie < si; ie++) {
      const xe = document.createElement("div");
      xe.className = "card", xe.hidden = !0, K.push(xe);
    }
    for (let ie = K.length - 1; ie >= 0; ie--) N.appendChild(K[ie]);
    E.appendChild(N);
    const fe = document.createElement("div");
    fe.className = "tile-photo";
    const oe = document.createElement("img");
    return oe.decoding = "async", oe.draggable = !1, oe.addEventListener("load", () => E.classList.add("loaded")), oe.addEventListener("error", () => E.classList.add("missing")), fe.appendChild(oe), E.appendChild(fe), Cn.set(E, { img: oe, photo: fe, strip: N, cards: K, above: 0 }), n.extend && n.extend(E), E;
  }
  function Q(b, E) {
    const { img: N, photo: K } = Cn.get(E);
    N.removeAttribute("src"), E.classList.remove("loaded", "missing", "error"), K.style.backgroundImage = "", E.remove(), i.delete(b), l.push(E);
  }
  function B(b, E, N) {
    const K = Cn.get(b), fe = Wo(E.n, N);
    K.above = fe.length ? kn : 0, K.strip.hidden = fe.length === 0;
    for (let oe = 0; oe < K.cards.length; oe++) {
      const ie = fe[oe];
      K.cards[oe].hidden = ie === void 0, ie !== void 0 && (K.cards[oe].style.top = ie.top + "px", K.cards[oe].style.left = ie.inset + "px", K.cards[oe].style.right = ie.inset + "px", K.cards[oe].style.opacity = String(ie.opacity));
    }
  }
  function D(b, E, N, K, fe, oe) {
    let ie = i.get(b);
    const xe = s[b];
    if (!ie) {
      ie = Z(), ie.dataset.index = String(b);
      const qe = Cn.get(ie).img;
      B(ie, xe, K), qe.fetchPriority = oe ? "high" : "low", qe.src = "/t/" + xe.s + ".webp", c.push(b), n.fill && n.fill(ie, xe), e.appendChild(ie), i.set(b, ie);
    }
    const { above: Ye, photo: Ne } = Cn.get(ie);
    ie.style.width = K + "px", ie.style.height = fe + Ye + "px", ie.style.transform = "translate(" + E + "px," + (N - Ye) + "px)", Ne.style.height = fe + "px";
  }
  function V(b, E) {
    E.th && (E.url === void 0 && (E.url = n.thumbHash(E.th)), E.url && (Cn.get(b).photo.style.backgroundImage = "url(" + E.url + ")"));
  }
  function z() {
    v = 0;
    for (const b of c) {
      const E = i.get(b);
      E && !E.classList.contains("loaded") && V(E, s[b]);
    }
    c.length = 0;
  }
  function re(b, E) {
    for (const N of ai(b, s, x))
      D(N.index, N.x, b.top, N.w, b.height, E);
  }
  function de() {
    const b = window.innerHeight, E = X(), N = ms(a, E - b * Mc, E + b * (1 + Ac));
    if (!N) return;
    const K = a[N[0]].from, fe = a[N[1]].to;
    for (const [oe, ie] of Array.from(i))
      (oe < K || oe >= fe) && Q(oe, ie);
    for (let oe = N[0]; oe <= N[1]; oe++) {
      const ie = a[oe];
      re(ie, ie.top < E + b && ie.top + ie.height > E);
    }
    c.length && !v && (v = requestAnimationFrame(z));
  }
  function j() {
    return x <= 0 ? !1 : f - (X() + window.innerHeight) < oa;
  }
  let ee = Promise.resolve();
  function ue() {
    return w || h || (w = !0, ee = me()), ee;
  }
  async function me() {
    const b = u;
    k({ loading: !0, count: s.length, exhausted: h, total: m, tiles: _ });
    try {
      do {
        const E = await n.fetchPage(g);
        if (b !== u) return;
        for (const N of E.photos) s.push(N);
        g = E.next, h = g === null, typeof E.stacks == "number" ? (m = E.stacks, _ = typeof E.total == "number" ? E.total : null) : typeof E.total == "number" && (m = E.total), P(h), de(), k({ loading: !0, count: s.length, exhausted: h, total: m, tiles: _ });
      } while (!h && j());
    } catch (E) {
      b === u && k({ error: String(E) });
    } finally {
      b === u && (w = !1, k({ loading: !1, count: s.length, exhausted: h, total: m, tiles: _ }));
    }
  }
  let R = 0;
  function O() {
    R || (R = requestAnimationFrame(() => {
      R = 0, de(), T && ze(), j() && ue();
    }));
  }
  function I() {
    const b = e.clientWidth;
    if (b === x) return;
    const E = ms(a, X(), X()), N = E ? a[E[0]].from : 0;
    x = b;
    for (const [fe, oe] of Array.from(i)) Q(fe, oe);
    a.length = 0, o = 0, f = kn, P(h), de();
    const K = a.find((fe) => fe.to > N);
    K && window.scrollTo(0, K.top + e.offsetTop), j() && ue();
  }
  let G = !1, T = null, W = 0, J = null, Te = !1;
  function ve(b, E) {
    const N = e.getBoundingClientRect();
    return { x: b - N.left, y: E - N.top };
  }
  function Re(b) {
    J || (J = document.createElement("div"), J.className = "marquee", e.appendChild(J)), J.hidden = !1, J.style.width = b.right - b.left + "px", J.style.height = b.bottom - b.top + "px", J.style.transform = "translate(" + b.left + "px," + b.top + "px)";
  }
  function ze() {
    if (!T) return;
    const { x: b, y: E } = ve(T.cx, T.cy);
    if (!T.live) {
      if (Math.abs(b - T.ax) < ca && Math.abs(E - T.ay) < ca) return;
      T.live = !0, n.sweepStart(T.index === null ? null : s[T.index], T.index);
    }
    const N = {
      left: Math.min(T.ax, b),
      right: Math.max(T.ax, b),
      top: Math.min(T.ay, E),
      bottom: Math.max(T.ay, E)
    };
    Re(N), n.sweepMove(aa(a, s, x, N).map((K) => s[K]));
  }
  function Pe(b) {
    if (Te = !1, !G || b.button !== 0 || b.shiftKey) return;
    const { x: E, y: N } = ve(b.clientX, b.clientY), K = aa(a, s, x, { left: E, top: N, right: E, bottom: N });
    T = {
      ax: E,
      ay: N,
      cx: b.clientX,
      cy: b.clientY,
      index: K.length ? K[0] : null,
      live: !1
    }, window.addEventListener("pointermove", we), window.addEventListener("pointerup", ke), window.addEventListener("pointercancel", ke);
  }
  function we(b) {
    T && (T.cx = b.clientX, T.cy = b.clientY, !W && (W = requestAnimationFrame(() => {
      W = 0, ze();
    })));
  }
  function ke(b) {
    if (!T) return;
    window.removeEventListener("pointermove", we), window.removeEventListener("pointerup", ke), window.removeEventListener("pointercancel", ke), cancelAnimationFrame(W), W = 0, T.cx = b.clientX, T.cy = b.clientY, ze();
    const E = T.live;
    T = null, J && (J.hidden = !0), E && (Te = !0, n.sweepEnd());
  }
  e.addEventListener("pointerdown", Pe);
  function Oe(b) {
    if (Te) {
      Te = !1;
      return;
    }
    const E = b.target.closest(".tile");
    if (!E || !e.contains(E)) return;
    const N = Number(E.dataset.index), K = s[N];
    K && n.activate && n.activate(K, b, E, N);
  }
  e.addEventListener("click", Oe), window.addEventListener("scroll", O, { passive: !0 });
  let q = 0;
  const he = new ResizeObserver(() => {
    clearTimeout(q), q = setTimeout(I, 100);
  });
  he.observe(e);
  const te = new IntersectionObserver(
    (b) => {
      b.some((E) => E.isIntersecting) && ue();
    },
    { rootMargin: "0px 0px " + oa + "px 0px" }
  );
  return te.observe(t), x = e.clientWidth, ue(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      u++, w = !1;
      for (const [b, E] of Array.from(i)) Q(b, E);
      s.length = 0, a.length = 0, c.length = 0, o = 0, f = kn, g = null, m = null, _ = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), ue();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(b) {
      const E = typeof b == "number" ? b : null;
      E !== m && (m = E, Y(), k({ total: m }));
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
      const N = Math.max(0, (window.innerHeight - E.height) / 2);
      window.scrollTo(0, Math.max(0, e.offsetTop + E.top - N)), de();
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
      for (const [E, N] of i)
        s[E] === b && n.fill && n.fill(N, b);
    },
    destroy() {
      u++, e.removeEventListener("click", Oe), e.removeEventListener("pointerdown", Pe), window.removeEventListener("pointermove", we), window.removeEventListener("pointerup", ke), window.removeEventListener("pointercancel", ke), window.removeEventListener("scroll", O), he.disconnect(), te.disconnect(), clearTimeout(q), cancelAnimationFrame(v), cancelAnimationFrame(W), J?.remove();
    }
  };
}
function Cc(e) {
  try {
    const t = Uint8Array.from(atob(e), (z) => z.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, s = t[3] | t[4] << 8, a = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, c = (n >> 18 & 31) / 31, o = n >> 23, f = (s >> 3 & 63) / 63, g = (s >> 9 & 63) / 63, m = s >> 15, _ = Math.max(3, m ? o ? 5 : 7 : s & 7), h = Math.max(3, m ? s & 7 : o ? 5 : 7);
    let w = o ? 6 : 5, x = 0;
    const u = (z, re, de) => {
      const j = [];
      for (let ee = 0; ee < re; ee++)
        for (let ue = ee ? 0 : 1; ue * re < z * (re - ee); ue++) {
          const me = t[w + (x >> 1)] >> ((x++ & 1) << 2) & 15;
          j.push((me / 7.5 - 1) * de);
        }
      return j;
    }, v = u(_, h, c), k = u(3, 3, f * 1.25), P = u(3, 3, g * 1.25), F = _ / h, Y = Math.max(1, Math.round(F > 1 ? 32 : 32 * F)), X = Math.max(1, Math.round(F > 1 ? 32 / F : 32)), Z = document.createElement("canvas");
    Z.width = Y, Z.height = X;
    const Q = Z.getContext("2d"), B = Q.createImageData(Y, X), D = [], V = [];
    for (let z = 0, re = 0; z < X; z++)
      for (let de = 0; de < Y; de++, re += 4) {
        let j = a, ee = i, ue = l;
        for (let I = 0; I < _; I++) D[I] = Math.cos(Math.PI / Y * (de + 0.5) * I);
        for (let I = 0; I < h; I++) V[I] = Math.cos(Math.PI / X * (z + 0.5) * I);
        for (let I = 0, G = 0; I < h; I++)
          for (let T = I ? 0 : 1; T * h < _ * (h - I); T++, G++)
            j += v[G] * D[T] * V[I] * 2;
        for (let I = 0, G = 0; I < 3; I++)
          for (let T = I ? 0 : 1; T < 3 - I; T++, G++) {
            const W = D[T] * V[I] * 2;
            ee += k[G] * W, ue += P[G] * W;
          }
        const me = j - 2 / 3 * ee, R = (3 * j - me + ue) / 2, O = R - ue;
        B.data[re] = Math.max(0, Math.min(255, Math.round(255 * R))), B.data[re + 1] = Math.max(0, Math.min(255, Math.round(255 * O))), B.data[re + 2] = Math.max(0, Math.min(255, Math.round(255 * me))), B.data[re + 3] = 255;
      }
    return Q.putImageData(B, 0, 0), Z.toDataURL();
  } catch {
    return null;
  }
}
var zc = /* @__PURE__ */ C('<main id="canvas"><div id="sentinel"></div></main>');
function Oc(e, t) {
  St(t, !0);
  let n = ae(t, "key", 3, ""), s = ae(t, "total", 3, null), a = ae(t, "triage", 3, !1), i = ae(t, "excludedDirs", 19, () => []), l = ae(t, "selecting", 3, !1), c = ae(t, "selectedKeys", 19, () => []), o = ae(t, "onActivate", 3, () => {
  }), f = ae(t, "onOverride", 3, async () => null), g = ae(t, "onExcludeFolder", 3, () => {
  }), m = ae(t, "onState", 3, () => {
  }), _ = ae(t, "onSweepStart", 3, () => {
  }), h = ae(t, "onSweepMove", 3, () => {
  }), w = ae(t, "onSweepEnd", 3, () => {
  }), x = /* @__PURE__ */ $(null), u = /* @__PURE__ */ $(null), v = null, k = "";
  const P = /* @__PURE__ */ le(() => new Set(c())), F = { null: "exclude", exclude: "include", include: "clear" };
  function Y(R) {
    const O = R.toLowerCase().startsWith(ar.toLowerCase()) ? R.slice(ar.length + 1) : R;
    return O.length > 64 ? "…" + O.slice(-64) : O;
  }
  function X(R) {
    const O = document.createElement("div");
    O.className = "tile-path", R.appendChild(O);
    const I = document.createElement("button");
    I.className = "chip", I.type = "button", R.appendChild(I);
    const G = document.createElement("button");
    G.className = "dirchip", G.type = "button", G.textContent = "dir", R.appendChild(G);
  }
  function Z(R, O) {
    const I = R.querySelector(".tile-path");
    I && (I.textContent = O.p ? Y(O.p) : "");
    const G = R.querySelector(".dirchip");
    if (G) {
      const W = Va(O.p ?? ""), J = W !== "" && Os(i(), W);
      G.hidden = W === "", G.disabled = J, G.dataset.state = J ? "exclude" : "none", G.title = J ? `already excluded: ${W}` : `exclude everything under ${W}, subfolders included — one exclude rule at the end of the order`;
    }
    const T = R.querySelector(".chip");
    T && (T.dataset.state = O.o || "none", T.textContent = O.o === "exclude" ? "drop" : O.o === "include" ? "keep" : "·", T.title = O.o === "exclude" ? "overridden: excluded — click to keep" : O.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  function Q(R) {
    const O = document.createElement("span");
    O.className = "tick", R.appendChild(O);
  }
  function B(R, O) {
    R.dataset.selected = r(P).has(O.id) ? "on" : "off";
  }
  cr(() => (v = Pc(r(x), r(u), {
    fetchPage: (R) => t.fetchPage(R),
    thumbHash: Cc,
    extend: a() ? X : Q,
    fill: a() ? Z : B,
    onState: (R) => m()(R),
    sweepStart: (R, O) => _()(R, O),
    sweepMove: (R) => h()(R),
    sweepEnd: () => w()(),
    activate: async (R, O, I, G) => {
      if (O.target.closest(".dirchip")) {
        g()(R);
        return;
      }
      if (!O.target.closest(".chip")) {
        o()(R, I, G, O.shiftKey);
        return;
      }
      const T = F[R.o ?? "null"];
      R.o = await f()(R, T), Z(I, R);
    }
  }), k = n(), v.setSweeping(l()), () => v?.destroy())), xt(() => {
    v?.setSweeping(l());
  }), xt(() => {
    const R = n(), O = s();
    v && (R !== k && (k = R, v.reset()), v.setTotal(O));
  });
  function D(R) {
    return v?.walkTo(R);
  }
  function V(R) {
    v?.focus(R);
  }
  function z(R, O) {
    return v?.itemsBetween(R, O) ?? [];
  }
  let re = "";
  xt(() => {
    const R = i().join(`
`);
    !v || R === re || (re = R, v.refill());
  });
  let de = null;
  xt(() => {
    const R = c();
    !v || R === de || (de = R, v.refill());
  });
  var j = { walkTo: D, focusTile: V, itemsBetween: z }, ee = zc();
  let ue;
  var me = d(ee);
  return kr(me, (R) => S(u, R), () => r(u)), kr(ee, (R) => S(x, R), () => r(x)), H(() => ue = Ee(ee, 1, "", null, ue, { selecting: l() })), A(e, ee), Et(j);
}
var Nc = /* @__PURE__ */ C('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Ic = /* @__PURE__ */ C('<th class="num svelte-1v3p82v"> </th>'), Lc = /* @__PURE__ */ C('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Fc = /* @__PURE__ */ C('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Dc = /* @__PURE__ */ C('<td class="num svelte-1v3p82v"> </td>'), jc = /* @__PURE__ */ C('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), Hc = /* @__PURE__ */ C('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Bc(e, t) {
  St(t, !0);
  let n = ae(t, "rows", 19, () => []), s = ae(t, "rules", 19, () => []), a = ae(t, "root", 3, null), i = ae(t, "picked", 3, null), l = ae(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const c = /* @__PURE__ */ le(() => t.screen.rule !== !1);
  function o(x) {
    return t.screen.label ? t.screen.label(x) : x.key;
  }
  const f = /* @__PURE__ */ le(() => new Map(n().map((x) => [
    x.key,
    t.screen.rule === !1 ? null : Ja(s(), t.screen.toRule(x, a()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var _ = Ps(), h = ct(_);
  {
    var w = (x) => {
      var u = Hc(), v = d(u), k = d(v), P = d(k);
      {
        var F = (D) => {
          var V = Nc();
          A(D, V);
        };
        ne(P, (D) => {
          r(c) && D(F);
        });
      }
      var Y = p(P), X = d(Y), Z = p(Y, 3);
      {
        var Q = (D) => {
          var V = Ic(), z = d(V);
          H(() => M(z, t.screen.heading[1])), A(D, V);
        };
        ne(Z, (D) => {
          t.screen.heading[1] && D(Q);
        });
      }
      var B = p(v);
      Xe(B, 23, n, (D) => D.key, (D, V, z) => {
        const re = /* @__PURE__ */ le(() => r(f).get(r(V).key));
        var de = jc();
        let j;
        var ee = d(de);
        {
          var ue = (we) => {
            const ke = /* @__PURE__ */ le(() => l().has(r(V).key));
            var Oe = Lc(), q = d(Oe);
            let he;
            var te = d(q);
            H(
              (b) => {
                he = Ee(q, 1, "tick svelte-1v3p82v", null, he, { on: r(ke) }), ge(q, "aria-checked", r(ke)), ge(q, "aria-label", `select ${b ?? ""}`), M(te, r(ke) ? "✓" : "");
              },
              [() => o(r(V))]
            ), se("click", q, (b) => {
              b.stopPropagation(), t.oncheck(r(V), r(z), b.shiftKey);
            }), A(we, Oe);
          };
          ne(ee, (we) => {
            r(c) && we(ue);
          });
        }
        var me = p(ee), R = d(me);
        let O;
        var I = d(R), G = p(R), T = p(G);
        {
          var W = (we) => {
            var ke = Fc();
            A(we, ke);
          };
          ne(T, (we) => {
            r(V).scope === "whole inventory" && we(W);
          });
        }
        var J = p(me), Te = d(J), ve = p(J), Re = d(ve), ze = p(ve);
        {
          var Pe = (we) => {
            var ke = Dc(), Oe = d(ke);
            H(() => M(Oe, r(V).detail ?? "")), A(we, ke);
          };
          ne(ze, (we) => {
            t.screen.heading[1] && we(Pe);
          });
        }
        H(
          (we, ke, Oe) => {
            j = Ee(de, 1, "svelte-1v3p82v", null, j, {
              picked: i() === r(V).key,
              clickable: t.screen.sheet !== !1
            }), O = Ee(R, 1, "mark svelte-1v3p82v", null, O, {
              exclude: r(re) === "exclude",
              include: r(re) === "include"
            }), ge(R, "title", m[r(re)] ?? ""), M(I, g[r(re)] ?? ""), M(G, `${we ?? ""} `), M(Te, ke), M(Re, Oe);
          },
          [
            () => o(r(V)),
            () => Ce(r(V).paths),
            () => Ft(r(V).bytes)
          ]
        ), se("click", de, () => t.onpick(r(V))), A(D, de);
      }), H(() => M(X, t.screen.heading[0] ?? "")), A(x, u);
    };
    ne(h, (x) => {
      n().length && x(w);
    });
  }
  A(e, _), Et();
}
Ut(["click"]);
var qc = /* @__PURE__ */ C('<button class="twisty svelte-pucy57"> </button>'), Uc = /* @__PURE__ */ C('<span class="twisty leaf svelte-pucy57">·</span>'), Yc = /* @__PURE__ */ C('<span class="name root svelte-pucy57"> </span>'), Wc = /* @__PURE__ */ C('<button class="name svelte-pucy57"> </button>'), Gc = /* @__PURE__ */ C('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Kc = /* @__PURE__ */ C('<div class="note svelte-pucy57"> </div>'), Xc = /* @__PURE__ */ C('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), $c = /* @__PURE__ */ C('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Vc = /* @__PURE__ */ C('<div class="tree svelte-pucy57"></div>');
function Jc(e, t) {
  St(t, !0);
  let n = ae(t, "version", 3, 0), s = ae(t, "excludedDirs", 19, () => []), a = ae(t, "picked", 3, null), i = ae(t, "busy", 3, !1), l = /* @__PURE__ */ $(Fe(/* @__PURE__ */ new Map())), c = /* @__PURE__ */ $(Fe(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ $(Fe(/* @__PURE__ */ new Set())), f = /* @__PURE__ */ $(Fe(/* @__PURE__ */ new Set()));
  async function g(u) {
    S(o, new Set(r(o)).add(u), !0);
    const v = await t.onload(u), k = new Map(r(l)), P = new Set(r(f));
    v ? (k.set(u, v), P.delete(u)) : P.add(u), S(l, k, !0), S(f, P, !0), S(o, new Set([...r(o)].filter((F) => F !== u)), !0);
  }
  function m(u) {
    if (r(c).has(u)) {
      S(c, new Set([...r(c)].filter((v) => v !== u)), !0);
      return;
    }
    S(c, new Set(r(c)).add(u), !0), r(l).has(u) || g(u);
  }
  let _ = -1;
  xt(() => {
    const u = n();
    if (u !== _) {
      _ = u, r(c).has(t.root) || S(c, new Set(r(c)).add(t.root), !0);
      for (const v of r(c)) g(v);
    }
  });
  const h = /* @__PURE__ */ le(() => {
    const u = [], v = (Y, X, Z, Q, B, D) => {
      const V = r(l).get(Y), z = r(c).has(Y);
      if (u.push({
        key: Y,
        name: X,
        depth: Z,
        paths: Q,
        bytes: B,
        deeper: D,
        expanded: z,
        here: V?.here ?? null,
        truncated: !!V?.truncated,
        loading: r(o).has(Y),
        failed: r(f).has(Y),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: Os(s(), Y)
      }), !(!z || !V))
        for (const re of V.children)
          v(re.path, re.name, Z + 1, re.paths, re.bytes, re.deeper);
    }, k = r(l).get(t.root), P = k ? k.children.reduce((Y, X) => Y + X.paths, 0) + k.here.paths : 0, F = k ? k.children.reduce((Y, X) => Y + X.bytes, 0) + k.here.bytes : 0;
    return v(t.root, t.root, 0, P, F, !0), u;
  }), w = 8;
  var x = Vc();
  Xe(x, 21, () => r(h), (u) => u.key, (u, v) => {
    var k = $c(), P = ct(k);
    let F;
    var Y = d(P);
    let X;
    var Z = p(Y, 2);
    {
      var Q = (T) => {
        var W = qc(), J = d(W);
        H(() => {
          ge(W, "aria-expanded", r(v).expanded), ge(W, "aria-label", `${r(v).expanded ? "collapse" : "expand"} ${r(v).name ?? ""}`), ge(W, "title", r(v).expanded ? "collapse" : "expand"), M(J, r(v).loading ? "·" : r(v).expanded ? "▾" : "▸");
        }), se("click", W, () => m(r(v).key)), A(T, W);
      }, B = (T) => {
        var W = Uc();
        A(T, W);
      };
      ne(Z, (T) => {
        r(v).deeper ? T(Q) : T(B, -1);
      });
    }
    var D = p(Z, 2);
    {
      var V = (T) => {
        var W = Yc(), J = d(W);
        H(() => M(J, r(v).key)), A(T, W);
      }, z = (T) => {
        var W = Wc(), J = d(W);
        H(() => {
          ge(W, "title", `Show every kept file under ${r(v).key ?? ""}`), M(J, r(v).name);
        }), se("click", W, () => t.onpick(r(v))), A(T, W);
      };
      ne(D, (T) => {
        r(v).depth === 0 ? T(V) : T(z, -1);
      });
    }
    var re = p(D, 2), de = d(re), j = p(re, 2), ee = d(j), ue = p(j, 2), me = p(P, 2);
    {
      var R = (T) => {
        var W = Gc();
        let J;
        H((Te) => J = Jt(W, "", J, Te), [
          () => ({
            "padding-left": `${Math.min(r(v).depth, w) * 11 + 18}px`
          })
        ]), A(T, W);
      }, O = (T) => {
        var W = Kc();
        let J;
        var Te = d(W);
        H(
          (ve, Re, ze) => {
            J = Jt(W, "", J, ve), M(Te, `${Re ?? ""} directly here · ${ze ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(v).depth, w) * 11 + 18}px`
            }),
            () => Ce(r(v).here.paths),
            () => Ft(r(v).here.bytes)
          ]
        ), A(T, W);
      };
      ne(me, (T) => {
        r(v).expanded && r(v).failed ? T(R) : r(v).expanded && r(v).here && r(v).here.paths > 0 && T(O, 1);
      });
    }
    var I = p(me, 2);
    {
      var G = (T) => {
        var W = Xc();
        let J;
        H((Te) => J = Jt(W, "", J, Te), [
          () => ({
            "padding-left": `${Math.min(r(v).depth, w) * 11 + 18}px`
          })
        ]), A(T, W);
      };
      ne(I, (T) => {
        r(v).truncated && T(G);
      });
    }
    H(
      (T, W, J) => {
        F = Ee(P, 1, "row svelte-pucy57", null, F, {
          picked: a() === r(v).key,
          gone: r(v).excluded
        }), X = Jt(Y, "", X, T), M(de, W), M(ee, J), ue.disabled = i() || r(v).excluded || r(v).depth === 0, ge(ue, "title", r(v).depth === 0 ? "The library root is not excludable from here." : r(v).excluded ? "already excluded" : `Exclude everything under ${r(v).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(v).depth, w) * 11}px` }),
        () => Ce(r(v).paths),
        () => Ft(r(v).bytes)
      ]
    ), se("click", ue, () => t.onexclude(r(v))), A(u, k);
  }), A(e, x), Et();
}
Ut(["click"]);
var Zc = /* @__PURE__ */ C('<button title="Back to its default">↺</button>'), Qc = /* @__PURE__ */ C('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), eu = /* @__PURE__ */ C('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), tu = /* @__PURE__ */ C('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), nu = /* @__PURE__ */ C('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), ru = /* @__PURE__ */ C('<li><code class="svelte-1hh0fwb"> </code> </li>'), su = /* @__PURE__ */ C(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), au = /* @__PURE__ */ C('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function iu(e, t) {
  St(t, !0);
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
      note: "Where the bar sits and where the photographs start under it. Top and Sides are the bar's own margins and nothing else's, kept as separate numbers because only the top has a photograph scrolling under it. Sides is one number for both edges because the bar is centred, and at the shipped 650 the margin it opens on the left is where the count pane lives — hung off the bar rather than in the row with it, so what is centred in the window is the bar and not the pair. The grid keeps its own 14px from the left, right and bottom of the window whatever Sides says: pulling the floating bar in from the edge is a judgement about the bar, and dragging every photograph sideways with it is not what that judgement was about. Page top is the gap between the bar's bottom edge and the first row of tiles, and it ships at 14 — the same as the grid's own inset, so the space it keeps under the header is the space it keeps from every other edge. So two of these move the photographs and both move them down: Top, because the tiles follow the bar rather than sliding under it, and Page top, because that is what it is for. Sides moves the bar and the count alone. Its slider ends at half this window's width and re-scales when you drag the window, but the bar stops shrinking at 420px and the margin gives way instead, so the last of that range does nothing here. No studio value — its editor's shape controls size a demo blob, so the default is what ships.",
      rows: [
        ["headerTop", "Top", 0, 300, 1],
        ["headerSide", "Sides", 0, (z) => Math.floor(z / 2), 1],
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
  let c = /* @__PURE__ */ $(Fe(lo())), o = /* @__PURE__ */ $(!0), f = /* @__PURE__ */ $(!1), g = /* @__PURE__ */ $(Fe(ni())), m = /* @__PURE__ */ $(Fe(window.innerWidth));
  const _ = (z) => r(g) === "light" ? z.light : z.dark, h = (z) => z in zn ? zn : En, w = (z) => `rgba(${z.r}, ${z.g}, ${z.b}, ${z.a})`, x = /* @__PURE__ */ le(() => JSON.stringify(r(c), null, 2));
  cr(() => {
    const z = localStorage.getItem(n);
    if (z)
      try {
        S(c, ts(JSON.parse(z)), !0);
        return;
      } catch {
      }
    Ns();
  });
  function u(z) {
    S(c, ts({ ...r(c), ...z }), !0), localStorage.setItem(n, JSON.stringify(r(c))), S(f, !1);
  }
  function v(z) {
    S(c, ts(z), !0), localStorage.setItem(n, JSON.stringify(r(c))), S(f, !1);
  }
  function k(z) {
    u({ [z]: h(z)[z] });
  }
  function P() {
    S(g, ri(r(g) === "dark" ? "light" : "dark"), !0);
  }
  async function F() {
    await navigator.clipboard.writeText(r(x)), S(f, !0);
  }
  var Y = au();
  let X;
  var Z = d(Y), Q = p(d(Z), 4), B = d(Q), D = p(Z, 2);
  {
    var V = (z) => {
      var re = su();
      {
        const q = (te, b = Cr, E = Cr, N = Cr) => {
          var K = Zc();
          let fe;
          H(() => {
            fe = Ee(K, 1, "undo svelte-1hh0fwb", null, fe, { idle: !E() }), ge(K, "aria-label", `Reset ${b() ?? ""}`);
          }), se("click", K, function(...oe) {
            N()?.apply(this, oe);
          }), A(te, K);
        };
        var de = p(d(re), 2);
        Xe(de, 17, () => s, _t, (te, b) => {
          var E = eu(), N = d(E), K = d(N), fe = p(N, 2), oe = d(fe), ie = p(fe, 2);
          Xe(ie, 17, () => r(b).rows, _t, (xe, Ye) => {
            var Ne = /* @__PURE__ */ le(() => Vr(r(Ye), 5));
            let qe = () => r(Ne)[0], dt = () => r(Ne)[1], We = () => r(Ne)[2], at = () => r(Ne)[3], Yt = () => r(Ne)[4];
            const Wt = /* @__PURE__ */ le(() => r(c)[qe()] !== h(qe())[qe()]), Gt = /* @__PURE__ */ le(() => typeof at() == "function" ? at()(r(m)) : at());
            var it = Qc();
            let lt;
            var Ot = d(it), Nt = d(Ot), ft = p(Ot, 2), Ze = p(ft, 2), nn = p(Ze, 2);
            q(nn, dt, () => r(Wt), () => () => k(qe())), H(() => {
              lt = Ee(it, 1, "row svelte-1hh0fwb", null, lt, { moved: r(Wt) }), M(Nt, dt()), ge(ft, "min", We()), ge(ft, "max", r(Gt)), ge(ft, "step", Yt()), ge(ft, "aria-label", dt()), $n(ft, r(c)[qe()]), ge(Ze, "min", We()), ge(Ze, "max", r(Gt)), ge(Ze, "step", Yt()), ge(Ze, "aria-label", `${dt() ?? ""} value`), $n(Ze, r(c)[qe()]);
            }), se("input", ft, (Kt) => u({ [qe()]: Number(Kt.currentTarget.value) })), se("input", Ze, (Kt) => u({ [qe()]: Number(Kt.currentTarget.value) })), A(xe, it);
          }), H(() => {
            M(K, r(b).title), M(oe, r(b).note);
          }), A(te, E);
        });
        var j = p(de, 2), ee = d(j), ue = p(j, 2), me = d(ue), R = p(ue, 2);
        Xe(R, 17, () => io, _t, (te, b) => {
          const E = /* @__PURE__ */ le(() => _(r(b))), N = /* @__PURE__ */ le(() => r(c)[r(E)]), K = /* @__PURE__ */ le(() => r(b).base[r(E)]);
          var fe = nu(), oe = d(fe), ie = d(oe), xe = p(ie), Ye = d(xe), Ne = p(oe, 2), qe = d(Ne), dt = p(Ne, 2);
          Xe(dt, 17, () => i, _t, (Wt, Gt) => {
            var it = /* @__PURE__ */ le(() => Vr(r(Gt), 3));
            let lt = () => r(it)[0], Ot = () => r(it)[1], Nt = () => r(it)[2];
            const ft = /* @__PURE__ */ le(() => r(N)[lt()] !== r(K)[lt()]);
            var Ze = tu();
            let nn;
            var Kt = d(Ze), ur = d(Kt), L = p(Kt, 2), ce = p(L, 2), Se = p(ce, 2);
            q(Se, Ot, () => r(ft), () => () => u({
              [r(E)]: { ...r(N), [lt()]: r(K)[lt()] }
            })), H(() => {
              nn = Ee(Ze, 1, "row svelte-1hh0fwb", null, nn, { moved: r(ft) }), M(ur, Ot()), ge(L, "max", Nt()), ge(L, "step", Nt() === 1 ? 0.01 : 1), ge(L, "aria-label", `${r(g) ?? ""} ${a[r(b).dark].title ?? ""} ${Ot() ?? ""}`), $n(L, r(N)[lt()]), ge(ce, "max", Nt()), ge(ce, "step", Nt() === 1 ? 0.01 : 1), ge(ce, "aria-label", `${r(g) ?? ""} ${a[r(b).dark].title ?? ""} ${Ot() ?? ""} value`), $n(ce, r(N)[lt()]);
            }), se("input", L, (Ie) => u({
              [r(E)]: {
                ...r(N),
                [lt()]: Number(Ie.currentTarget.value)
              }
            })), se("input", ce, (Ie) => u({
              [r(E)]: {
                ...r(N),
                [lt()]: Number(Ie.currentTarget.value)
              }
            })), A(Wt, Ze);
          });
          var We = p(dt, 2);
          let at;
          var Yt = d(We);
          H(
            (Wt, Gt) => {
              M(ie, `${a[r(b).dark].title ?? ""} `), M(Ye, r(g)), M(qe, a[r(b).dark].note), at = Jt(We, "", at, Wt), M(Yt, Gt);
            },
            [
              () => ({ background: w(r(N)) }),
              () => w(r(N))
            ]
          ), A(te, fe);
        });
        var O = p(R, 2), I = p(d(O), 4);
        let he;
        var G = d(I), T = d(G), W = p(G, 2);
        q(W, () => "Blur at the edge", () => r(c).blurEdge !== zn.blurEdge, () => () => k("blurEdge"));
        var J = p(O, 2), Te = p(d(J), 4);
        Xe(Te, 21, () => l, _t, (te, b) => {
          var E = /* @__PURE__ */ le(() => Vr(r(b), 2));
          let N = () => r(E)[0], K = () => r(E)[1];
          var fe = ru(), oe = d(fe), ie = d(oe), xe = p(oe);
          H(() => {
            M(ie, N()), M(xe, ` — ${K() ?? ""}`);
          }), A(te, fe);
        });
        var ve = p(J, 2), Re = p(d(ve), 4), ze = d(Re), Pe = p(ze, 2), we = p(Pe, 2), ke = d(we), Oe = p(Re, 2);
        H(() => {
          M(ee, `The five colours below are per theme, and you are editing the ${r(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), M(me, `Edit the ${r(g) === "dark" ? "light" : "dark"} colours`), he = Ee(I, 1, "row toggle svelte-1hh0fwb", null, he, { moved: r(c).blurEdge !== zn.blurEdge }), ql(T, r(c).blurEdge), M(ke, r(f) ? "Copied" : "Copy"), $n(Oe, r(x));
        }), se("click", ue, P), se("change", T, (te) => u({ blurEdge: te.currentTarget.checked })), se("click", ze, () => v(En)), se("click", Pe, () => v(zn)), se("click", we, F);
      }
      A(z, re);
    };
    ne(D, (z) => {
      r(o) && z(V);
    });
  }
  H(() => {
    X = Ee(Y, 1, "tuner svelte-1hh0fwb", null, X, { folded: !r(o) }), ge(Q, "title", r(o) ? "Fold away" : "Open"), M(B, r(o) ? "–" : "+");
  }), Wl("innerWidth", (z) => S(m, z, !0)), se("click", Q, () => S(o, !r(o))), A(e, Y), Et();
}
Ut(["click", "input", "change"]);
function is(e, t, n, s) {
  const a = e + t;
  return a < 0 || a >= n && s ? null : a;
}
var lu = /* @__PURE__ */ C('<button><span class="n svelte-1n46o8q"> </span> </button>'), ou = /* @__PURE__ */ C('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), cu = /* @__PURE__ */ C('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), uu = /* @__PURE__ */ C('<div class="muted pad svelte-1n46o8q">loading…</div>'), du = /* @__PURE__ */ C('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), fu = /* @__PURE__ */ C('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), hu = /* @__PURE__ */ C('<p class="blurb"> </p>'), vu = /* @__PURE__ */ C('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear</button> <span class="muted svelte-1n46o8q"><!></span></div>'), pu = /* @__PURE__ */ C('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), gu = /* @__PURE__ */ C('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), _u = /* @__PURE__ */ C('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), bu = /* @__PURE__ */ C("<div> </div>"), mu = /* @__PURE__ */ C('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function wu(e, t) {
  St(t, !0);
  const n = location.pathname === "/tune";
  let s = /* @__PURE__ */ $("grid"), a = /* @__PURE__ */ $(0), i = /* @__PURE__ */ $(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ $(Fe([])), c = /* @__PURE__ */ $(null), o = /* @__PURE__ */ $(null), f = /* @__PURE__ */ $(Fe(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ $(null), m = /* @__PURE__ */ $(null), _ = /* @__PURE__ */ $(null), h = /* @__PURE__ */ $(null), w = /* @__PURE__ */ $(!1), x = /* @__PURE__ */ $(!1), u = /* @__PURE__ */ $(!1), v = /* @__PURE__ */ $(!1), k = /* @__PURE__ */ $(Fe({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), P = /* @__PURE__ */ $(null), F = /* @__PURE__ */ $(0), Y = /* @__PURE__ */ $(null), X = /* @__PURE__ */ $(Fe({})), Z = /* @__PURE__ */ $("newest"), Q = /* @__PURE__ */ $(Fe(mo())), B = /* @__PURE__ */ $(null), D = /* @__PURE__ */ $(null), V = /* @__PURE__ */ $(!1), z = /* @__PURE__ */ $(Fe([])), re = /* @__PURE__ */ $(null), de = null;
  const j = /* @__PURE__ */ le(() => Vs[r(a)]), ee = /* @__PURE__ */ le(() => r(j).table !== !1), ue = /* @__PURE__ */ le(() => r(ee) || r(j).tree === !0), me = /* @__PURE__ */ le(() => r(j).sheet !== !1 && (r(o) !== null || !r(ue))), R = /* @__PURE__ */ le(() => ({
    sort: r(Z),
    ...r(Q).on ? {
      stack: "on",
      ...r(Q).strictness === null ? {} : {
        strictness: String(r(Q).strictness),
        linkage: r(Q).linkage
      }
    } : {},
    ...Object.fromEntries(Object.entries(r(X)).filter(([, y]) => y.length > 0))
  })), O = /* @__PURE__ */ le(() => r(z).map((y) => y.key)), I = /* @__PURE__ */ le(() => Sc(r(z)));
  xt(() => {
    r(R), Qt(() => {
      S(z, [], !0), S(
        re,
        null
        // it indexes an order this query no longer has
      );
    });
  });
  const G = /* @__PURE__ */ le(() => r(s) === "grid" ? `grid:${JSON.stringify(r(R))}` : `triage:${r(a)}:${JSON.stringify(r(o))}`), T = /* @__PURE__ */ le(() => r(j).rule === !1 || r(f).size === 0 ? [] : r(l).filter((y) => r(f).has(y.key)).map((y) => r(j).toRule(y, r(i))).filter((y) => y && Ja(r(m)?.rules ?? [], y) !== "exclude")), W = /* @__PURE__ */ le(() => (r(m)?.rules ?? []).filter((y) => y.decision === "exclude" && y.term?.column === "dir_under").map((y) => String(y.term.value).replace(/[\\/]+$/, "").toLowerCase())), J = Xl();
  function Te(y) {
    S(P, String(y), !0);
  }
  async function ve(y) {
    try {
      return S(P, null), await y();
    } catch (U) {
      return Te(U), null;
    }
  }
  const Re = $l(
    () => {
      S(x, !0), ve(async () => {
        const y = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: U, value: pe } = await J(() => Ge.counts(r(o), y));
        U || S(m, pe, !0);
      }).finally(() => {
        S(x, !1);
      });
    },
    220
  );
  async function ze() {
    S(_, "loading");
    const y = await ve(() => Ge.files());
    S(_, y, !0), S(w, !1), S(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function Pe(y = !1) {
    if (r(s) !== "triage" || !r(ee)) {
      S(l, [], !0);
      return;
    }
    S(v, !0);
    const U = r(j).name === "source_folder" && r(i) ? { root: r(i) } : {};
    y && (U.live = "1");
    const pe = await ve(() => Ge.screen(r(j).name, U));
    S(l, pe?.rows ?? [], !0), S(v, !1);
  }
  let we = !1;
  xt(() => {
    r(a), r(s), Qt(() => {
      S(c, null), S(o, null), S(i, null), he(), r(s) === "triage" && (Pe(), Re.now(), we || (we = !0, ze()));
    });
  }), xt(() => {
    r(i), Qt(() => {
      r(s) === "triage" && (he(), Pe());
    });
  }), cr(() => {
    ve(async () => {
      S(Y, await Ge.facets(), !0);
    });
  }), xt(() => {
    const y = r(Y)?.stacking?.settings;
    y && Qt(() => {
      const U = wo(r(Q), y);
      U !== r(Q) && S(Q, ta(U), !0);
    });
  });
  function ke(y, U) {
    S(X, { ...r(X), [y]: U }, !0);
  }
  function Oe(y) {
    if (r(j).sheet !== !1) {
      if (r(j).drill && !r(i)) {
        S(c, y.key, !0), S(
          o,
          {
            ...r(j).toRule(y, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), S(i, y.key, !0);
        return;
      }
      S(c, y.key, !0), S(
        o,
        {
          ...r(j).toRule(y, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), Re();
    }
  }
  function q(y, U, pe) {
    const Ae = new Set(r(f)), Ue = !Ae.has(y.key), It = pe && r(g) !== null ? r(l).findIndex((wt) => wt.key === r(g)) : -1, [Tt, ln] = It < 0 ? [U, U] : It < U ? [It, U] : [U, It];
    for (let wt = Tt; wt <= ln; wt++)
      Ue ? Ae.add(r(l)[wt].key) : Ae.delete(r(l)[wt].key);
    S(f, Ae, !0), S(g, y.key, !0);
  }
  function he() {
    S(f, /* @__PURE__ */ new Set(), !0), S(g, null);
  }
  function te(y) {
    S(o, y, !0), S(
      c,
      null
      // it no longer corresponds to a row
    ), Re();
  }
  function b(y = !1) {
    S(o, null), S(c, null), y && S(i, null), Re.now();
  }
  async function E() {
    S(
      w,
      !0
      // the distinct-content number now says so on its face
    ), ul(F), await Pe(), Re.now();
  }
  async function N() {
    if (!r(o)) return;
    S(u, !0);
    const y = r(o).at === "end" ? void 0 : 0, U = await ve(() => Ge.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(j).id} ${r(j).title}`
      },
      y
    ));
    S(u, !1), U && (S(o, null), S(c, null), await E());
  }
  async function K() {
    const y = r(T);
    if (!y.length) {
      he();
      return;
    }
    S(u, !0);
    for (const U of y)
      if (!await ve(() => Ge.addRule({
        column: U.column,
        op: U.op,
        value: U.value,
        decision: "exclude",
        note: `screen ${r(j).id} ${r(j).title}`
      }))) break;
    S(u, !1), he(), S(o, null), S(c, null), await E();
  }
  async function fe(y) {
    if (!y || Os(r(W), y)) return;
    S(u, !0);
    const U = await ve(() => Ge.addRule({
      column: "dir_under",
      op: "=",
      value: y,
      decision: "exclude",
      note: `screen ${r(j).id} ${r(j).title}`
    }));
    S(u, !1), U && await E();
  }
  const oe = (y) => fe(Va(y.p ?? "")), ie = (y) => fe(y.key);
  async function xe(y) {
    S(u, !0), await ve(() => Ge.deleteRule(y.id)), S(u, !1), await E();
  }
  async function Ye(y, U) {
    S(u, !0), await ve(() => Ge.moveRule(y.id, U)), S(u, !1), await E();
  }
  async function Ne() {
    await ve(async () => {
      S(Y, await Ge.facets(), !0);
    });
  }
  async function qe(y, U) {
    const pe = await ve(() => Ge.override(y.s, U));
    return pe ? (S(w, !0), Re(), pe.decision) : y.o ?? null;
  }
  function dt(y) {
    return r(s) === "grid" ? Ge.photos({ limit: 500, ...r(R), ...y || {} }) : Ge.page(r(o), y);
  }
  const We = (y) => y.m ?? [{ id: y.id, s: y.s, w: y.w, h: y.h }];
  function at(y, U, pe, Ae = !1) {
    if (r(s) === "grid") {
      if (r(V)) {
        if (Ae && r(re) !== null) {
          const Ue = r(D)?.itemsBetween(r(re), pe) ?? [];
          S(z, la(r(z), Ue.map(as), !Yt(y)), !0);
        } else
          S(z, kc(r(z), as(y)), !0);
        S(re, pe, !0);
        return;
      }
      S(
        B,
        {
          frames: We(y),
          cover: y.id,
          origin: ua(U),
          at: pe
        },
        !0
      );
      return;
    }
    ve(() => Ge.revealOrigin(y.id));
  }
  const Yt = (y) => r(z).some((U) => U.key === y.id);
  function Wt(y, U) {
    de = {
      from: r(z),
      adding: y === null || !Yt(y)
    }, U !== null && S(re, U, !0);
  }
  function Gt(y) {
    S(z, la(de.from, y.map(as), de.adding), !0);
  }
  function it() {
    de = null;
  }
  function lt() {
    S(z, [], !0), S(re, null);
  }
  const Ot = /* @__PURE__ */ le(() => r(B) !== null && is(r(B).at, -1, r(k).count, r(k).exhausted) !== null), Nt = /* @__PURE__ */ le(() => r(B) !== null && is(r(B).at, 1, r(k).count, r(k).exhausted) !== null), ft = 120;
  let Ze = !1, nn = 0;
  async function Kt(y, U = !1) {
    const pe = performance.now();
    if (!r(B) || Ze || U && pe - nn < ft) return;
    const Ae = is(r(B).at, y, r(k).count, r(k).exhausted);
    if (Ae !== null) {
      nn = pe, Ze = !0;
      try {
        const Ue = await r(D)?.walkTo(Ae);
        if (!Ue || !r(B)) return;
        S(
          B,
          {
            frames: We(Ue.item),
            cover: Ue.item.id,
            origin: ua(Ue.tile),
            at: Ae
          },
          !0
        );
      } finally {
        Ze = !1;
      }
    }
  }
  async function ur() {
    const y = r(B)?.at ?? null;
    S(B, null), await kl(), y !== null && r(D)?.focusTile(y);
  }
  function L(y) {
    ve(() => Ge.revealPhoto(y.id));
  }
  function ce() {
    ve(() => navigator.clipboard.writeText(Tc(
      {
        stacking: r(Q),
        sort: r(Z),
        filters: r(X)
      },
      r(z)
    )));
  }
  var Se = mu(), Ie = ct(Se);
  {
    var De = (y) => {
      jo(y, {
        get facets() {
          return r(Y);
        },
        get filters() {
          return r(X);
        },
        get sort() {
          return r(Z);
        },
        get stacking() {
          return r(Q);
        },
        get total() {
          return r(k).total;
        },
        get tiles() {
          return r(k).tiles;
        },
        get loading() {
          return r(k).loading;
        },
        get selecting() {
          return r(V);
        },
        get selectedTally() {
          return r(I);
        },
        onfilter: ke,
        onsort: (U) => S(Z, U, !0),
        onstack: (U) => S(Q, ta(U), !0),
        onclear: () => S(X, {}, !0),
        onselecting: (U) => S(V, U, !0),
        onshare: ce,
        ondeselect: lt,
        ontriage: () => S(s, "triage")
      });
    };
    ne(Ie, (y) => {
      r(s) === "grid" && y(De);
    });
  }
  var Me = p(Ie, 2);
  {
    var et = (y) => {
      iu(y, {});
    };
    ne(Me, (y) => {
      n && y(et);
    });
  }
  var ht = p(Me, 2);
  let Xt;
  var tt = d(ht);
  {
    var pn = (y) => {
      var U = fu(), pe = d(U), Ae = d(pe), Ue = p(pe, 2);
      Xe(Ue, 21, () => Vs, _t, (vt, Lt, gn) => {
        var _n = lu();
        let Un;
        var Yn = d(_n), Le = d(Yn), pt = p(Yn, 1, !0);
        H(() => {
          Un = Ee(_n, 1, "nav svelte-1n46o8q", null, Un, { on: gn === r(a) }), M(Le, r(Lt).id), M(pt, r(Lt).title);
        }), se("click", _n, () => S(a, gn, !0)), A(vt, _n);
      });
      var It = p(Ue, 2);
      {
        var Tt = (vt) => {
          var Lt = du(), gn = ct(Lt), _n = d(gn);
          {
            var Un = (rt) => {
              var ot = ou(), Wn = ct(ot), dr = /* @__PURE__ */ le(() => b.bind(null, !0)), Kr = p(Wn, 2), Xr = d(Kr);
              H(() => M(Xr, `inside ${r(i) ?? ""}`)), se("click", Wn, function(...$r) {
                r(dr)?.apply(this, $r);
              }), A(rt, ot);
            }, Yn = (rt) => {
              var ot = cu(), Wn = d(ot);
              H(() => M(Wn, r(j).relive)), se("click", ot, () => Pe(!0)), A(rt, ot);
            };
            ne(_n, (rt) => {
              r(j).drill && r(i) ? rt(Un) : r(j).relive && rt(Yn, 1);
            });
          }
          var Le = p(gn, 2);
          {
            var pt = (rt) => {
              var ot = uu();
              A(rt, ot);
            };
            ne(Le, (rt) => {
              r(v) && rt(pt);
            });
          }
          var bn = p(Le, 2);
          {
            let rt = /* @__PURE__ */ le(() => r(m)?.rules ?? []);
            Bc(bn, {
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
                return r(rt);
              },
              get picked() {
                return r(c);
              },
              onpick: Oe,
              oncheck: q
            });
          }
          A(vt, Lt);
        };
        ne(It, (vt) => {
          r(ee) && vt(Tt);
        });
      }
      var ln = p(It, 2);
      {
        var wt = (vt) => {
          Jc(vt, {
            get root() {
              return ar;
            },
            get version() {
              return r(F);
            },
            get excludedDirs() {
              return r(W);
            },
            get picked() {
              return r(c);
            },
            get busy() {
              return r(u);
            },
            onload: (Lt) => ve(() => Ge.tree(Lt)),
            onpick: Oe,
            onexclude: ie
          });
        };
        ne(ln, (vt) => {
          r(j).tree && vt(wt);
        });
      }
      var qn = p(ln, 2);
      {
        let vt = /* @__PURE__ */ le(() => r(m)?.rules ?? []), Lt = /* @__PURE__ */ le(() => r(m)?.unmatched ?? null);
        xc(qn, {
          get rules() {
            return r(vt);
          },
          get unmatched() {
            return r(Lt);
          },
          get busy() {
            return r(u);
          },
          ondelete: xe,
          onmove: Ye
        });
      }
      var Mr = p(qn, 2);
      dc(Mr, { oncomplete: Ne }), se("click", Ae, () => S(s, "grid")), A(y, U);
    };
    ne(tt, (y) => {
      r(s) === "triage" && y(pn);
    });
  }
  var rn = p(tt, 2), sn = d(rn);
  {
    var Be = (y) => {
      var U = _u(), pe = ct(U), Ae = d(pe), Ue = p(pe, 2), It = d(Ue), Tt = p(Ue, 2);
      {
        var ln = (Le) => {
          var pt = hu(), bn = d(pt);
          H(() => M(bn, r(j).note)), A(Le, pt);
        };
        ne(Tt, (Le) => {
          r(j).note && Le(ln);
        });
      }
      var wt = p(Tt, 2);
      {
        var qn = (Le) => {
          tc(Le, {
            get screen() {
              return r(j);
            }
          });
        };
        ne(wt, (Le) => {
          r(j).name === "dimensions" && Le(qn);
        });
      }
      var Mr = p(wt, 2);
      ao(Mr, {
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
          return r(x);
        },
        onfiles: ze
      });
      var vt = p(Mr, 2);
      {
        var Lt = (Le) => {
          var pt = vu(), bn = d(pt), rt = d(bn), ot = p(bn, 2), Wn = d(ot), dr = p(ot, 2), Kr = p(dr, 2), Xr = d(Kr);
          {
            var $r = (mn) => {
              var Gn = Jn("already excluded — nothing left to write");
              A(mn, Gn);
            }, ii = (mn) => {
              var Gn = Jn();
              H((li) => M(Gn, `one exclude rule each, at the end of the order${li ?? ""}`), [
                () => r(T).length < r(f).size ? ` · ${Ce(r(f).size - r(T).length)} already excluded, skipped` : ""
              ]), A(mn, Gn);
            };
            ne(Xr, (mn) => {
              r(T).length ? mn(ii, -1) : mn($r);
            });
          }
          H(
            (mn, Gn) => {
              M(rt, `${mn ?? ""} ticked`), ot.disabled = r(u) || !r(T).length, M(Wn, Gn), dr.disabled = r(u);
            },
            [
              () => Ce(r(f).size),
              () => r(u) ? "saving…" : `Exclude ${Ce(r(T).length)}`
            ]
          ), se("click", ot, K), se("click", dr, he), A(Le, pt);
        };
        ne(vt, (Le) => {
          r(f).size && Le(Lt);
        });
      }
      var gn = p(vt, 2);
      _c(gn, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(j);
        },
        get saving() {
          return r(u);
        },
        onedit: te,
        onconfirm: N,
        onclear: b
      });
      var _n = p(gn, 2);
      {
        var Un = (Le) => {
          var pt = pu(), bn = d(pt);
          H((rt, ot) => M(bn, `${rt ?? ""}${ot ?? ""} loaded${r(k).exhausted ? " · all of them" : ""}${r(k).loading ? " · loading…" : ""} `), [
            () => Ce(r(k).count),
            () => r(k).total ? " of " + Ce(r(k).total) : ""
          ]), A(Le, pt);
        }, Yn = (Le) => {
          var pt = gu();
          A(Le, pt);
        };
        ne(_n, (Le) => {
          r(me) ? Le(Un) : r(j).sheet === !1 && Le(Yn, 1);
        });
      }
      H(() => {
        M(Ae, `${r(j).id ?? ""} · ${r(j).title ?? ""}`), M(It, r(j).blurb);
      }), A(y, U);
    };
    ne(sn, (y) => {
      r(s) === "triage" && y(Be);
    });
  }
  var mt = p(sn, 2);
  {
    var an = (y) => {
      {
        let U = /* @__PURE__ */ le(() => r(s) === "grid" ? null : r(m)?.page_paths ?? null), pe = /* @__PURE__ */ le(() => r(s) === "triage"), Ae = /* @__PURE__ */ le(() => r(s) === "grid" && r(V));
        kr(
          Oc(y, {
            get key() {
              return r(G);
            },
            fetchPage: dt,
            get total() {
              return r(U);
            },
            get triage() {
              return r(pe);
            },
            get excludedDirs() {
              return r(W);
            },
            get selecting() {
              return r(Ae);
            },
            get selectedKeys() {
              return r(O);
            },
            onActivate: at,
            onOverride: qe,
            onExcludeFolder: oe,
            onSweepStart: Wt,
            onSweepMove: Gt,
            onSweepEnd: it,
            onState: (Ue) => S(k, { ...r(k), ...Ue }, !0)
          }),
          (Ue) => S(D, Ue, !0),
          () => r(D)
        );
      }
    };
    ne(mt, (y) => {
      (r(me) || r(s) === "grid") && y(an);
    });
  }
  var $t = p(ht, 2);
  {
    var Rn = (y) => {
      $o(y, {
        get frames() {
          return r(B).frames;
        },
        get cover() {
          return r(B).cover;
        },
        get origin() {
          return r(B).origin;
        },
        get back() {
          return r(Ot);
        },
        get forward() {
          return r(Nt);
        },
        onstep: Kt,
        onreveal: L,
        onclose: ur
      });
    };
    ne($t, (y) => {
      r(B) && y(Rn);
    });
  }
  var Pn = p($t, 2);
  {
    var nt = (y) => {
      var U = bu();
      let pe;
      var Ae = d(U);
      H(() => {
        pe = Ee(U, 1, "status", null, pe, { bare: r(s) === "grid" }), M(Ae, r(P));
      }), A(y, U);
    };
    ne(Pn, (y) => {
      r(P) && y(nt);
    });
  }
  H(() => Xt = Ee(ht, 1, "shell", null, Xt, { bare: r(s) === "grid" })), A(e, Se), Et();
}
Ut(["click"]);
yo();
Ns();
Pl(wu, { target: document.getElementById("app") });
