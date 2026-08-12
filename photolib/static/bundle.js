var ws = Array.isArray, oi = Array.prototype.indexOf, Nr = Array.prototype.includes, Wr = Array.from, ci = Object.defineProperty, Qn = Object.getOwnPropertyDescriptor, ui = Object.getOwnPropertyDescriptors, di = Object.prototype, fi = Array.prototype, da = Object.getPrototypeOf, Is = Object.isExtensible;
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
const Ve = 2, tr = 4, Yr = 8, ha = 1 << 24, Ft = 16, At = 32, fn = 64, ls = 128, Mt = 512, We = 1024, Ye = 2048, Ht = 4096, lt = 8192, mt = 16384, lr = 32768, os = 1 << 25, nr = 65536, Ir = 1 << 17, vi = 1 << 18, or = 1 << 19, pi = 1 << 20, Jt = 1 << 25, Hn = 65536, Lr = 1 << 21, er = 1 << 22, Tn = 1 << 23, Ln = Symbol("$state"), gi = Symbol("legacy props"), _i = Symbol(""), va = Symbol("attributes"), cs = Symbol("class"), us = Symbol("style"), ds = Symbol("text"), Sr = new class extends Error {
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
const Ci = 1, Oi = 2, pa = 4, zi = 8, Ni = 16, Ii = 1, Li = 4, Fi = 8, Di = 16, ji = 1, Hi = 2, qe = Symbol("uninitialized"), Bi = "http://www.w3.org/1999/xhtml";
function qi() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Ui() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Wi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ga(e) {
  return e === this.v;
}
function Yi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function _a(e) {
  return !Yi(e, this.v);
}
let nt = null;
function rr(e) {
  nt = e;
}
function wt(e, t = !1, n) {
  nt = {
    p: nt,
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
function yt(e) {
  var t = (
    /** @type {ComponentContext} */
    nt
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var s of n)
      La(s);
  }
  return e !== void 0 && (t.x = e), t.i = !0, nt = t.p, e ?? /** @type {T} */
  {};
}
function ba() {
  return !0;
}
let zn = [];
function ma() {
  var e = zn;
  zn = [], hi(e);
}
function cn(e) {
  if (zn.length === 0 && !mr) {
    var t = zn;
    queueMicrotask(() => {
      t === zn && ma();
    });
  }
  zn.push(e);
}
function Gi() {
  for (; zn.length > 0; )
    ma();
}
function wa(e) {
  var t = _e;
  if (t === null)
    return me.f |= Tn, e;
  if ((t.f & lr) === 0 && (t.f & tr) === 0)
    throw e;
  Sn(e, t);
}
function Sn(e, t) {
  if (!(t !== null && (t.f & mt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & ls) !== 0) {
        if ((t.f & lr) === 0)
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
function De(e, t) {
  e.f = e.f & Ki | t;
}
function ys(e) {
  (e.f & Mt) !== 0 || e.deps === null ? De(e, We) : De(e, Ht);
}
function ya(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Ve) === 0 || (t.f & Hn) === 0 || (t.f ^= Hn, ya(
        /** @type {Derived} */
        t.deps
      ));
}
function xa(e, t, n) {
  (e.f & Ye) !== 0 ? t.add(e) : (e.f & Ht) !== 0 && n.add(e), ya(e.deps), De(e, We);
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
function cr(e) {
  var t = me, n = _e;
  Rt(null), en(null);
  try {
    return e();
  } finally {
    Rt(t), en(n);
  }
}
function Vi(e) {
  let t = 0, n = Bn(0), s;
  return () => {
    Es() && (r(n), Fa(() => (t === 0 && (s = Zt(() => e(() => wr(n)))), t += 1, () => {
      cn(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, wr(n));
      });
    })));
  };
}
var Ji = nr | or;
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
      this.#i = Et(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#t.failed, { reset: s, invoke_onerror: a } = this.#m(t);
    cn(a), n && (this.#o = Et(() => {
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
        Wi();
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
    t && (this.is_pending = !0, this.#n = Et(() => t(this.#e)), cn(() => {
      var n = this.#a = document.createDocumentFragment(), s = dn();
      n.append(s), this.#i = this.#v(() => Et(() => this.#l(s))), this.#c === 0 && (this.#e.before(n), this.#a = null, Dn(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        Se
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#p = 0, this.#i = Et(() => {
        this.#l(this.#e);
      }), this.#c > 0) {
        var t = this.#a = document.createDocumentFragment();
        Rs(this.#i, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#n = Et(() => n(this.#e));
      } else
        this.#w(
          /** @type {Batch} */
          Se
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
    var n = _e, s = me, a = nt;
    en(this.#s), Rt(this.#s), rr(this.#s.ctx);
    try {
      return An.ensure(), t();
    } catch (i) {
      return wa(i), null;
    } finally {
      en(n), Rt(s), rr(a);
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#u) && (this.#u = !0, cn(() => {
      this.#u = !1, this.#d && sr(this.#d, this.#p);
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
    Se?.is_fork ? (this.#i && Se.skip_effect(this.#i), this.#n && Se.skip_effect(this.#n), this.#o && Se.skip_effect(this.#o), Se.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#i && (vt(this.#i), this.#i = null), this.#n && (vt(this.#n), this.#n = null), this.#o && (vt(this.#o), this.#o = null);
    let n = this.#t.failed;
    const s = (a) => {
      const { reset: i, invoke_onerror: l } = this.#m(a);
      l(), n && (this.#o = this.#v(() => {
        try {
          return Et(() => {
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
    cn(() => {
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
  ), o = tl(), u = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function g(h) {
    if ((c.f & mt) === 0) {
      o();
      try {
        s([...l, ...h]);
      } catch (b) {
        Sn(b, c);
      }
      Fr();
    }
  }
  var m = ka();
  if (n.length === 0) {
    u.then(() => g([])).finally(m);
    return;
  }
  function _() {
    Promise.all(n.map((h) => /* @__PURE__ */ nl(h))).then(g).catch((h) => Sn(h, c)).finally(m);
  }
  u ? u.then(() => {
    o(), _(), Fr();
  }) : _();
}
function tl() {
  var e = (
    /** @type {Effect} */
    _e
  ), t = me, n = nt, s = (
    /** @type {Batch} */
    Se
  );
  return function(i = !0) {
    en(e), Rt(t), rr(n), i && (e.f & mt) === 0 && (s?.activate(), s?.apply());
  };
}
function Fr(e = !0) {
  en(null), Rt(null), rr(null), e && Se?.deactivate();
}
function ka() {
  var e = (
    /** @type {Effect} */
    _e
  ), t = e.b, n = (
    /** @type {Batch} */
    Se
  ), s = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(s, e), () => {
    t?.update_pending_count(-1, n), n.decrement(s, e);
  };
}
// @__NO_SIDE_EFFECTS__
function yr(e) {
  var t = Ve | Ye;
  return _e !== null && (_e.f |= or), {
    ctx: nt,
    deps: null,
    effects: null,
    equals: ga,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      qe
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
    qe
  ), l = !me, c = /* @__PURE__ */ new Set();
  return bl(() => {
    var o = (
      /** @type {Effect} */
      _e
    ), u = fa();
    a = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, (h) => {
        h !== Sr && u.reject(h);
      }).finally(Fr);
    } catch (h) {
      u.reject(h), Fr();
    }
    var g = (
      /** @type {Batch} */
      Se
    );
    if (l) {
      if ((o.f & lr) !== 0)
        var m = ka();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        s.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(vr);
      else
        for (const h of c.values())
          h.reject(vr);
      c.add(u), g.async_deriveds.set(o, u);
    }
    const _ = (h, b = void 0) => {
      m?.(), c.delete(u), b !== vr && (g.activate(), b ? (i.f |= Tn, sr(i, b)) : ((i.f & Tn) !== 0 && (i.f ^= Tn), sr(i, h)), g.deactivate());
    };
    u.promise.then(_, (h) => _(null, h || "unknown"));
  }), Gr(() => {
    for (const o of c)
      o.reject(vr);
  }), new Promise((o) => {
    function u(g) {
      function m() {
        g === a ? o(i) : u(a);
      }
      g.then(m, m);
    }
    u(a);
  });
}
// @__NO_SIDE_EFFECTS__
function se(e) {
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
      vt(
        /** @type {Effect} */
        t[n]
      );
  }
}
function xs(e) {
  var t, n = _e, s = e.parent;
  if (!hn && s !== null && e.v !== qe && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (s.f & (mt | lt)) !== 0)
    return qi(), e.v;
  en(s);
  try {
    e.f &= ~Hn, rl(e), t = Ga(e);
  } finally {
    en(n);
  }
  return t;
}
function Ea(e) {
  var t = xs(e);
  if (!e.equals(t) && (e.wv = Wa(), (!Se?.is_fork || e.deps === null) && (Se !== null ? (Se.capture(e, t, !0), fs?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    De(e, We);
    return;
  }
  hn || (Dt !== null ? (Es() || Se?.is_fork) && Dt.set(e, t) : ys(e));
}
function sl(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && cr(() => {
        t.ac.abort(Sr), t.ac = null;
      }), t.fn !== null && (t.teardown = Cr), xr(t, 0), As(t));
}
function Ta(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && ar(t);
}
let Jr = null, Xn = null, Se = null, fs = null, Dt = null, hs = null, mr = !1, Zr = !1, Jn = null, Or = null;
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
    Xn === null ? Jr = Xn = this : (Xn.#t = this, this.#r = Xn), Xn = this;
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
        De(a, Ye), n(a);
      for (a of s.m)
        De(a, Ht), n(a);
    }
    this.#g.add(t);
  }
  #_() {
    this.#e = !0, Ls++ > 1e3 && (this.#v(), ll());
    for (const o of this.#c)
      this.#u.delete(o), De(o, Ye), this.schedule(o);
    for (const o of this.#u)
      De(o, Ht), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Jn = [], s = [], a = Or = [];
    for (const o of t)
      try {
        this.#y(o, n, s);
      } catch (u) {
        throw Ra(o), this.#b() || this.discard(), u;
      }
    if (Se = null, a.length > 0) {
      var i = An.ensure();
      for (const o of a)
        i.schedule(o);
    }
    if (Jn = null, Or = null, this.#b()) {
      this.#h(s), this.#h(n);
      for (const [o, u] of this.#f)
        Aa(o, u);
      a.length > 0 && /** @type {unknown} */
      Se.#_();
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
      Se
    );
    if (this.#i === 0 && (this.#a.length === 0 || c !== null) && this.#v(), this.#a.length > 0)
      if (c !== null) {
        const o = c;
        o.#a.push(...this.#a.filter((u) => !o.#a.includes(u)));
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
    t.f ^= We;
    for (var a = t.first; a !== null; ) {
      var i = a.f, l = (i & (At | fn)) !== 0, c = l && (i & We) !== 0, o = c || (i & lt) !== 0 || this.#f.has(a);
      if (!o && a.fn !== null) {
        l ? a.f ^= We : (i & tr) !== 0 ? n.push(a) : Tr(a) && ((i & Ft) !== 0 && this.#u.add(a), ar(a));
        var u = a.first;
        if (u !== null) {
          a = u;
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
      if (a !== null && !((s.f & Ve) !== 0 && (s.f & (Ye | Ht)) === 0))
        for (const c of a) {
          var i = c.f;
          if ((i & Ve) !== 0)
            n(
              /** @type {Derived} */
              c
            );
          else {
            var l = (
              /** @type {Effect} */
              c
            );
            i & (er | Ft) && !this.async_deriveds.has(l) && (this.#u.delete(l), De(l, Ye), this.schedule(l));
          }
        }
    };
    for (const s of this.current.keys())
      n(s);
    this.oncommit(() => t.discard()), t.#v(), Se = this, this.#_();
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
    t.v !== qe && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & Tn) === 0 && (this.current.set(t, [n, s]), Dt?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    Se = this;
  }
  deactivate() {
    Se = null, Dt = null;
  }
  flush() {
    try {
      Zr = !0, Se = this, this.#_();
    } finally {
      Ls = 0, hs = null, Jn = null, Or = null, Zr = !1, Se = null, Dt = null, Fn.clear();
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
      for (const [_, [h, b]] of this.current) {
        if (m.current.has(_)) {
          var s = (
            /** @type {[any, boolean]} */
            m.current.get(_)[0]
          );
          if (t && h !== s)
            m.current.set(_, [h, b]);
          else
            continue;
        }
        n.push(_);
      }
      if (t)
        for (const [_, h] of this.async_deriveds) {
          const b = m.async_deriveds.get(_);
          b && h.promise.then(b.resolve).catch(b.reject);
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
                (h.f & (Ft | er)) !== 0 ? m.schedule(h) : m.#h([h]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
          for (var o of n)
            Ma(o, i, l, c);
          c = /* @__PURE__ */ new Map();
          var u = [...m.current].filter(([_, h]) => {
            const b = this.current.get(_);
            return b ? b[0] !== h[0] || b[1] !== h[1] : !0;
          }).map(([_]) => _);
          if (u.length > 0)
            for (const _ of this.#p)
              (_.f & (mt | lt | Ir)) === 0 && ks(_, u, c) && ((_.f & (er | Ft)) !== 0 ? (De(_, Ye), m.schedule(_)) : m.#c.add(_));
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
    this.#d || (this.#d = !0, cn(() => {
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
    if (Se === null) {
      const t = Se = new An();
      !Zr && !mr && cn(() => {
        t.#e || t.flush();
      });
    }
    return Se;
  }
  apply() {
    {
      Dt = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (hs = t, t.b?.is_pending && (t.f & (tr | Yr | ha)) !== 0 && (t.f & lr) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var s = n.f;
      if (Jn !== null && n === _e && (me === null || (me.f & Ve) === 0))
        return;
      if ((s & (fn | At)) !== 0) {
        if ((s & We) === 0)
          return;
        n.f ^= We;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#r, n = this.#t;
      t === null ? Jr = n : t.#t = n, n === null ? Xn = t : n.#r = t, this.linked = !1;
    }
  }
}
function il(e) {
  var t = mr;
  mr = !0;
  try {
    for (var n; ; ) {
      if (Gi(), Se === null)
        return (
          /** @type {T} */
          n
        );
      Se.flush();
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
let on = null;
function Fs(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var s = e[n++];
      if ((s.f & (mt | lt)) === 0 && Tr(s) && (on = /* @__PURE__ */ new Set(), ar(s), s.deps === null && s.first === null && s.nodes === null && s.teardown === null && s.ac === null && ja(s), on?.size > 0)) {
        Fn.clear();
        for (const a of on) {
          if ((a.f & (mt | lt)) !== 0) continue;
          const i = [a];
          let l = a.parent;
          for (; l !== null; )
            on.has(l) && (on.delete(l), i.push(l)), l = l.parent;
          for (let c = i.length - 1; c >= 0; c--) {
            const o = i[c];
            (o.f & (mt | lt)) === 0 && ar(o);
          }
        }
        on.clear();
      }
    }
    on = null;
  }
}
function Ma(e, t, n, s) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const i = a.f;
      (i & Ve) !== 0 ? Ma(
        /** @type {Derived} */
        a,
        t,
        n,
        s
      ) : (i & (er | Ft)) !== 0 && (i & Ye) === 0 && ks(a, t, s) && (De(a, Ye), Ss(
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
      if ((a.f & Ve) !== 0 && ks(
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
  Se.schedule(e);
}
function Aa(e, t) {
  if (!((e.f & At) !== 0 && (e.f & We) !== 0)) {
    (e.f & Ye) !== 0 ? t.d.push(e) : (e.f & Ht) !== 0 && t.m.push(e), De(e, We);
    for (var n = e.first; n !== null; )
      Aa(n, t), n = n.next;
  }
}
function Ra(e) {
  De(e, We);
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
function k(e, t, n = !1) {
  me !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!jt || (me.f & Ir) !== 0) && ba() && (me.f & (Ve | Ft | er | Ir)) !== 0 && (Qt === null || !Qt.has(e)) && Ri();
  let s = n ? Ie(t) : t;
  return sr(e, s, Or);
}
function sr(e, t, n = null) {
  if (!e.equals(t)) {
    Fn.set(e, hn ? t : e.v);
    var s = An.ensure();
    if (s.capture(e, t), (e.f & Ve) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & Ye) !== 0 && xs(a), Dt === null && ys(a);
    }
    e.wv = Wa(), Ca(e, Ye, n), _e !== null && (_e.f & We) !== 0 && (_e.f & (At | fn)) === 0 && (St === null ? yl([e]) : St.push(e)), !s.is_fork && Dr.size > 0 && !Pa && cl();
  }
  return t;
}
function cl() {
  Pa = !1;
  for (const e of Dr) {
    (e.f & We) !== 0 && De(e, Ht);
    let t;
    try {
      t = Tr(e);
    } catch {
      t = !0;
    }
    t && ar(e);
  }
  Dr.clear();
}
function ul(e, t = 1) {
  var n = r(e), s = t === 1 ? n++ : n--;
  return k(e, n), s;
}
function wr(e) {
  k(e, e.v + 1);
}
function Ca(e, t, n) {
  var s = e.reactions;
  if (s !== null)
    for (var a = s.length, i = 0; i < a; i++) {
      var l = s[i], c = l.f, o = (c & Ye) === 0;
      if (o && De(l, t), (c & Ir) !== 0)
        Dr.add(
          /** @type {Effect} */
          l
        );
      else if ((c & Ve) !== 0) {
        var u = (
          /** @type {Derived} */
          l
        );
        Dt?.delete(u), (c & Hn) === 0 && (c & Mt && (_e === null || (_e.f & Lr) === 0) && (l.f |= Hn), Ca(u, Ht, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (c & Ft) !== 0 && on !== null && on.add(g), n !== null ? n.push(g) : Ss(g);
      }
    }
}
function Ie(e) {
  if (typeof e != "object" || e === null || Ln in e)
    return e;
  const t = da(e);
  if (t !== di && t !== fi)
    return e;
  var n = /* @__PURE__ */ new Map(), s = ws(e), a = /* @__PURE__ */ $(0), i = jn, l = (c) => {
    if (jn === i)
      return c();
    var o = me, u = jn;
    Rt(null), Hs(i);
    var g = c();
    return Rt(o), Hs(u), g;
  };
  return s && n.set("length", /* @__PURE__ */ $(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, o, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Mi();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var m = /* @__PURE__ */ $(u.value);
          return n.set(o, m), m;
        }) : k(g, u.value, !0), !0;
      },
      deleteProperty(c, o) {
        var u = n.get(o);
        if (u === void 0) {
          if (o in c) {
            const g = l(() => /* @__PURE__ */ $(qe));
            n.set(o, g), wr(a);
          }
        } else
          k(u, qe), wr(a);
        return !0;
      },
      get(c, o, u) {
        if (o === Ln)
          return e;
        var g = n.get(o), m = o in c;
        if (g === void 0 && (!m || Qn(c, o)?.writable) && (g = l(() => {
          var h = Ie(m ? c[o] : qe), b = /* @__PURE__ */ $(h);
          return b;
        }), n.set(o, g)), g !== void 0) {
          var _ = r(g);
          return _ === qe ? void 0 : _;
        }
        return Reflect.get(c, o, u);
      },
      getOwnPropertyDescriptor(c, o) {
        var u = Reflect.getOwnPropertyDescriptor(c, o);
        if (u && "value" in u) {
          var g = n.get(o);
          g && (u.value = r(g));
        } else if (u === void 0) {
          var m = n.get(o), _ = m?.v;
          if (m !== void 0 && _ !== qe)
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return u;
      },
      has(c, o) {
        if (o === Ln)
          return !0;
        var u = n.get(o), g = u !== void 0 && u.v !== qe || Reflect.has(c, o);
        if (u !== void 0 || _e !== null && (!g || Qn(c, o)?.writable)) {
          u === void 0 && (u = l(() => {
            var _ = g ? Ie(c[o]) : qe, h = /* @__PURE__ */ $(_);
            return h;
          }), n.set(o, u));
          var m = r(u);
          if (m === qe)
            return !1;
        }
        return g;
      },
      set(c, o, u, g) {
        var m = n.get(o), _ = o in c;
        if (s && o === "length")
          for (var h = u; h < /** @type {Source<number>} */
          m.v; h += 1) {
            var b = n.get(h + "");
            b !== void 0 ? k(b, qe) : h in c && (b = l(() => /* @__PURE__ */ $(qe)), n.set(h + "", b));
          }
        if (m === void 0)
          (!_ || Qn(c, o)?.writable) && (m = l(() => /* @__PURE__ */ $(void 0)), k(m, Ie(u)), n.set(o, m));
        else {
          _ = m.v !== qe;
          var y = l(() => Ie(u));
          k(m, y);
        }
        var f = Reflect.getOwnPropertyDescriptor(c, o);
        if (f?.set && f.set.call(g, u), !_) {
          if (s && typeof o == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), x = Number(o);
            Number.isInteger(x) && x >= v.v && k(v, x + 1);
          }
          wr(a);
        }
        return !0;
      },
      ownKeys(c) {
        r(a);
        var o = Reflect.ownKeys(c).filter((m) => {
          var _ = n.get(m);
          return _ === void 0 || _.v !== qe;
        });
        for (var [u, g] of n)
          g.v !== qe && !(u in c) && o.push(u);
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
var Mn, Oa, za, Na;
function fl() {
  if (Mn === void 0) {
    Mn = window, Oa = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    za = Qn(t, "firstChild").get, Na = Qn(t, "nextSibling").get, Is(e) && (e[cs] = void 0, e[va] = null, e[us] = void 0, e.__e = void 0), Is(n) && (n[ds] = void 0);
  }
}
function dn(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function jr(e) {
  return (
    /** @type {TemplateNode | null} */
    za.call(e)
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
function it(e, t = !1) {
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
  _e === null && (me === null && Si(), ki()), hn && xi();
}
function gl(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function vn(e, t) {
  var n = _e;
  n !== null && (n.f & lt) !== 0 && (e |= lt);
  var s = {
    ctx: nt,
    deps: null,
    nodes: null,
    f: e | Ye | Mt,
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
  Se?.register_created_effect(s);
  var a = s;
  if ((e & tr) !== 0)
    Jn !== null ? Jn.push(s) : An.ensure().schedule(s);
  else if (t !== null) {
    try {
      ar(s);
    } catch (l) {
      throw vt(s), l;
    }
    a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
    (a.f & or) === 0 && (a = a.first, (e & Ft) !== 0 && (e & nr) !== 0 && a !== null && (a.f |= nr));
  }
  if (a !== null && (a.parent = n, n !== null && gl(a, n), me !== null && (me.f & Ve) !== 0 && (e & fn) === 0)) {
    var i = (
      /** @type {Derived} */
      me
    );
    (i.effects ??= []).push(a);
  }
  return s;
}
function Es() {
  return me !== null && !jt;
}
function Gr(e) {
  const t = vn(Yr, null);
  return De(t, We), t.teardown = e, t;
}
function Tt(e) {
  pl();
  var t = (
    /** @type {Effect} */
    _e.f
  ), n = !me && (t & At) !== 0 && nt !== null && !nt.i;
  if (n) {
    var s = (
      /** @type {ComponentContext} */
      nt
    );
    (s.e ??= []).push(e);
  } else
    return La(e);
}
function La(e) {
  return vn(tr | pi, e);
}
function _l(e) {
  An.ensure();
  const t = vn(fn | or, e);
  return (n = {}) => new Promise((s) => {
    n.outro ? Dn(t, () => {
      vt(t), s(void 0);
    }) : (vt(t), s(void 0));
  });
}
function Ts(e) {
  return vn(tr, e);
}
function bl(e) {
  return vn(er | or, e);
}
function Fa(e, t = 0) {
  return vn(Yr | t, e);
}
function W(e, t = [], n = [], s = []) {
  el(s, t, n, (a) => {
    vn(Yr, () => {
      e(...a.map(r));
    });
  });
}
function Ms(e, t = 0) {
  var n = vn(Ft | t, e);
  return n;
}
function Et(e) {
  return vn(At | or, e);
}
function Da(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = hn, s = me;
    js(!0), Rt(null);
    try {
      t.call(null);
    } finally {
      js(n), Rt(s);
    }
  }
}
function As(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && cr(() => {
      a.abort(Sr);
    });
    var s = n.next;
    (n.f & fn) !== 0 ? n.parent = null : vt(n, t), n = s;
  }
}
function ml(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & At) === 0 && vt(t), t = n;
  }
}
function vt(e, t = !0) {
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
  Da(e), e.f ^= os, e.f |= mt;
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
    n && vt(e), t && t();
  }, i = s.length;
  if (i > 0) {
    var l = () => --i || a();
    for (var c of s)
      c.out(l);
  } else
    a();
}
function Ha(e, t, n) {
  if ((e.f & lt) === 0) {
    e.f ^= lt;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const c of s)
        (c.is_global || n) && t.push(c);
    for (var a = e.first; a !== null; ) {
      var i = a.next;
      if ((a.f & fn) === 0) {
        var l = (a.f & nr) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (a.f & At) !== 0 && (e.f & Ft) !== 0;
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
  if ((e.f & lt) !== 0) {
    e.f ^= lt, (e.f & We) === 0 && (De(e, Ye), An.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var s = n.next, a = (n.f & nr) !== 0 || (n.f & At) !== 0;
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
let zr = !1, hn = !1;
function js(e) {
  hn = e;
}
let me = null, jt = !1;
function Rt(e) {
  me = e;
}
let _e = null;
function en(e) {
  _e = e;
}
let Qt = null;
function qa(e) {
  me !== null && (Qt ??= /* @__PURE__ */ new Set()).add(e);
}
let ft = null, bt = 0, St = null;
function yl(e) {
  St = e;
}
let Ua = 1, Nn = 0, jn = Nn;
function Hs(e) {
  jn = e;
}
function Wa() {
  return ++Ua;
}
function Tr(e) {
  var t = e.f;
  if ((t & Ye) !== 0)
    return !0;
  if (t & Ve && (e.f &= ~Hn), (t & Ht) !== 0) {
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
    (t & Mt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Dt === null && De(e, We);
  }
  return !1;
}
function Ya(e, t, n = !0) {
  var s = e.reactions;
  if (s !== null && !(Qt !== null && Qt.has(e)))
    for (var a = 0; a < s.length; a++) {
      var i = s[a];
      (i.f & Ve) !== 0 ? Ya(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? De(i, Ye) : (i.f & We) !== 0 && De(i, Ht), Ss(
        /** @type {Effect} */
        i
      ));
    }
}
function Ga(e) {
  var t = ft, n = bt, s = St, a = me, i = Qt, l = nt, c = jt, o = jn, u = e.f;
  ft = /** @type {null | Value[]} */
  null, bt = 0, St = null, me = (u & (At | fn)) === 0 ? e : null, Qt = null, rr(e.ctx), jt = !1, jn = ++Nn, e.ac !== null && (cr(() => {
    e.ac.abort(Sr);
  }), e.ac = null);
  try {
    e.f |= Lr;
    var g = (
      /** @type {Function} */
      e.fn
    ), m = g();
    e.f |= lr;
    var _ = e.deps, h = Se?.is_fork;
    if (ft !== null) {
      var b;
      if (h || xr(e, bt), _ !== null && bt > 0)
        for (_.length = bt + ft.length, b = 0; b < ft.length; b++)
          _[bt + b] = ft[b];
      else
        e.deps = _ = ft;
      if (Es() && (e.f & Mt) !== 0)
        for (b = bt; b < _.length; b++)
          (_[b].reactions ??= []).push(e);
    } else !h && _ !== null && bt < _.length && (xr(e, bt), _.length = bt);
    if (ba() && St !== null && !jt && _ !== null && (e.f & (Ve | Ht | Ye)) === 0)
      for (b = 0; b < /** @type {Source[]} */
      St.length; b++)
        Ya(
          St[b],
          /** @type {Effect} */
          e
        );
    if (a !== null && a !== e) {
      if (Nn++, a.deps !== null)
        for (let y = 0; y < n; y += 1)
          a.deps[y].rv = Nn;
      if (t !== null)
        for (const y of t)
          y.rv = Nn;
      St !== null && (s === null ? s = St : s.push(.../** @type {Source[]} */
      St));
    }
    return (e.f & Tn) !== 0 && (e.f ^= Tn), m;
  } catch (y) {
    return wa(y);
  } finally {
    e.f ^= Lr, ft = t, bt = n, St = s, me = a, Qt = i, rr(l), jt = c, jn = o;
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
  if (n === null && (t.f & Ve) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ft === null || !Nr.call(ft, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & Mt) !== 0 && (i.f ^= Mt, i.f &= ~Hn), i.v !== qe && ys(i), i.ac !== null && cr(() => {
      i.ac.abort(Sr), i.ac = null, De(i, Ye);
    }), sl(i), xr(i, 0);
  }
}
function xr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var s = t; s < n.length; s++)
      xl(e, n[s]);
}
function ar(e) {
  var t = e.f;
  if ((t & mt) === 0) {
    De(e, We);
    var n = _e, s = zr;
    _e = e, zr = (t & (At | fn)) === 0;
    try {
      (t & (Ft | ha)) !== 0 ? ml(e) : As(e), Da(e);
      var a = Ga(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Ua;
      var i;
    } finally {
      zr = s, _e = n;
    }
  }
}
async function kl() {
  await Promise.resolve(), il();
}
function r(e) {
  var t = e.f, n = (t & Ve) !== 0;
  if (me !== null && !jt) {
    var s = _e !== null && (_e.f & mt) !== 0;
    if (!s && (Qt === null || !Qt.has(e))) {
      var a = me.deps;
      if ((me.f & Lr) !== 0)
        e.rv < Nn && (e.rv = Nn, ft === null && a !== null && a[bt] === e ? bt++ : ft === null ? ft = [e] : ft.push(e));
      else {
        me.deps ??= [], Nr.call(me.deps, e) || me.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [me] : Nr.call(i, me) || i.push(me);
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
      return ((l.f & We) === 0 && l.reactions !== null || Xa(l)) && (c = xs(l)), Fn.set(l, c), c;
    }
    var o = (l.f & Mt) === 0 && !jt && me !== null && (zr || (me.f & Mt) !== 0), u = (l.f & lr) === 0;
    Tr(l) && (o && (l.f |= Mt), Ea(l)), o && !u && (Ta(l), Ka(l));
  }
  if (Dt?.has(e))
    return Dt.get(e);
  if ((e.f & Tn) !== 0)
    throw e.v;
  return e.v;
}
function Ka(e) {
  if (e.f |= Mt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Ve) !== 0 && (t.f & Mt) === 0 && (Ta(
        /** @type {Derived} */
        t
      ), Ka(
        /** @type {Derived} */
        t
      ));
}
function Xa(e) {
  if (e.v === qe) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Fn.has(t) || (t.f & Ve) !== 0 && Xa(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Zt(e) {
  var t = jt;
  try {
    return jt = !0, e();
  } finally {
    jt = t;
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
      return cr(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? cn(() => {
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
function Z(e, t, n) {
  (t[pr] ??= {})[e] = n;
}
function Bt(e) {
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
    var u = a.indexOf(t);
    if (u === -1)
      return;
    o <= u && (l = o);
  }
  if (i = /** @type {Element} */
  a[l] || e.target, i !== t) {
    ci(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = me, m = _e;
    Rt(null), en(null);
    try {
      for (var _, h = []; i !== null && i !== t; ) {
        try {
          var b = i[pr]?.[s];
          b != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && b.call(i, e);
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
      e[pr] = t, delete e.currentTarget, Rt(g), en(m);
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
function z(e, t) {
  var n = (t & ji) !== 0, s = (t & Hi) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Rl(i ? e : "<!>" + e), n || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ jr(a)));
    var l = (
      /** @type {TemplateNode} */
      s || Oa ? document.importNode(a, !0) : a.cloneNode(!0)
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
function Zn(e = "") {
  {
    var t = dn(e + "");
    return Br(t, t), t;
  }
}
function Ps() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = dn();
  return e.append(t, n), Br(t, n), e;
}
function P(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function A(e, t) {
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
  var o = void 0, u = _l(() => {
    var g = n ?? t.appendChild(dn());
    Zi(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (h) => {
        wt({});
        var b = (
          /** @type {ComponentContext} */
          nt
        );
        i && (b.c = i), a && (s.$$events = a), o = e(h, s) || {}, yt();
      },
      c
    );
    var m = /* @__PURE__ */ new Set(), _ = (h) => {
      for (var b = 0; b < h.length; b++) {
        var y = h[b];
        if (!m.has(y)) {
          m.add(y);
          var f = El(y);
          for (const C of [t, document]) {
            var v = Rr.get(C);
            v === void 0 && (v = /* @__PURE__ */ new Map(), Rr.set(C, v));
            var x = v.get(y);
            x === void 0 ? (C.addEventListener(y, ps, { passive: f }), v.set(y, 1)) : v.set(y, x + 1);
          }
        }
      }
    };
    return _(Wr($a)), vs.add(_), () => {
      for (var h of m)
        for (const f of [t, document]) {
          var b = (
            /** @type {Map<string, number>} */
            Rr.get(f)
          ), y = (
            /** @type {number} */
            b.get(h)
          );
          --y == 0 ? (f.removeEventListener(h, ps), b.delete(h), b.size === 0 && Rr.delete(f)) : b.set(h, y);
        }
      vs.delete(_), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return Ol.set(o, u), o;
}
let Ol = /* @__PURE__ */ new WeakMap();
class zl {
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
        c && (vt(c.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#r) {
        if (i === n || this.#l.has(i)) continue;
        const c = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var u = document.createDocumentFragment();
            Rs(l, u), u.append(dn()), this.#t.set(i, { effect: l, fragment: u });
          } else
            vt(l);
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
      n.includes(s) || (vt(a.effect), this.#t.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var s = (
      /** @type {Batch} */
      Se
    ), a = Ia();
    if (n && !this.#r.has(t) && !this.#t.has(t))
      if (a) {
        var i = document.createDocumentFragment(), l = dn();
        i.append(l), this.#t.set(t, {
          effect: Et(() => n(l)),
          fragment: i
        });
      } else
        this.#r.set(
          t,
          Et(() => n(this.anchor))
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
function Q(e, t, n = !1) {
  var s = new zl(e), a = n ? nr : 0;
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
function ht(e, t) {
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
            gs(e, Wr(i.done)), _.delete(i), _.size === 0 && (e.outrogroups = null);
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
      var u = (
        /** @type {Element} */
        n
      ), g = (
        /** @type {Element} */
        u.parentNode
      );
      hl(g), g.append(u), e.items.clear();
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
      i.f |= Jt;
      const l = document.createDocumentFragment();
      Rs(i, l);
    } else
      vt(t[a], n);
  }
}
var qs;
function Ue(e, t, n, s, a, i = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & pa) !== 0;
  if (o) {
    var u = (
      /** @type {Element} */
      e
    );
    l = u.appendChild(dn());
  }
  var g = null, m = /* @__PURE__ */ Sa(() => {
    var C = n();
    return (
      /** @type {V[]} */
      ws(C) ? C : C == null ? [] : Wr(C)
    );
  }), _, h = /* @__PURE__ */ new Map(), b = !0;
  function y(C) {
    (x.effect.f & mt) === 0 && (x.pending.delete(C), x.fallback = g, Il(x, _, l, t, s), g !== null && (_.length === 0 ? (g.f & Jt) === 0 ? Hr(g) : (g.f ^= Jt, gr(g, null, l)) : Dn(g, () => {
      g = null;
    })));
  }
  function f(C) {
    x.pending.delete(C);
  }
  var v = Ms(() => {
    _ = /** @type {V[]} */
    r(m);
    for (var C = _.length, F = /* @__PURE__ */ new Set(), B = (
      /** @type {Batch} */
      Se
    ), K = Ia(), ne = 0; ne < C; ne += 1) {
      var J = _[ne], Y = s(J, ne), H = b ? null : c.get(Y);
      H ? (H.v && sr(H.v, J), H.i && sr(H.i, ne), K && B.unskip_effect(H.e)) : (H = Ll(
        c,
        b ? l : qs ??= dn(),
        J,
        Y,
        ne,
        a,
        t,
        n
      ), b || (H.e.f |= Jt), c.set(Y, H)), F.add(Y);
    }
    if (C === 0 && i && !g && (b ? g = Et(() => i(l)) : (g = Et(() => i(qs ??= dn())), g.f |= Jt)), C > F.size && yi(), !b)
      if (h.set(B, F), K) {
        for (const [X, O] of c)
          F.has(X) || B.skip_effect(O.e);
        B.oncommit(y), B.ondiscard(f);
      } else
        y(B);
    r(m);
  }), x = { effect: v, items: c, pending: h, outrogroups: null, fallback: g };
  b = !1;
}
function fr(e) {
  for (; e !== null && (e.f & At) === 0; )
    e = e.next;
  return e;
}
function Il(e, t, n, s, a) {
  var i = (s & zi) !== 0, l = t.length, c = e.items, o = fr(e.effect.first), u, g = null, m, _ = [], h = [], b, y, f, v;
  if (i)
    for (v = 0; v < l; v += 1)
      b = t[v], y = a(b, v), f = /** @type {EachItem} */
      c.get(y).e, (f.f & Jt) === 0 && (f.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(f));
  for (v = 0; v < l; v += 1) {
    if (b = t[v], y = a(b, v), f = /** @type {EachItem} */
    c.get(y).e, e.outrogroups !== null)
      for (const H of e.outrogroups)
        H.pending.delete(f), H.done.delete(f);
    if ((f.f & lt) !== 0 && (Hr(f), i && (f.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(f))), (f.f & Jt) !== 0)
      if (f.f ^= Jt, f === o)
        gr(f, null, n);
      else {
        var x = g ? g.next : o;
        f === e.effect.last && (e.effect.last = f.prev), f.prev && (f.prev.next = f.next), f.next && (f.next.prev = f.prev), wn(e, g, f), wn(e, f, x), gr(f, x, n), g = f, _ = [], h = [], o = fr(g.next);
        continue;
      }
    if (f !== o) {
      if (u !== void 0 && u.has(f)) {
        if (_.length < h.length) {
          var C = h[0], F;
          g = C.prev;
          var B = _[0], K = _[_.length - 1];
          for (F = 0; F < _.length; F += 1)
            gr(_[F], C, n);
          for (F = 0; F < h.length; F += 1)
            u.delete(h[F]);
          wn(e, B.prev, K.next), wn(e, g, B), wn(e, K, C), o = C, g = K, v -= 1, _ = [], h = [];
        } else
          u.delete(f), gr(f, o, n), wn(e, f.prev, f.next), wn(e, f, g === null ? e.effect.first : g.next), wn(e, g, f), g = f;
        continue;
      }
      for (_ = [], h = []; o !== null && o !== f; )
        (u ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = fr(o.next);
      if (o === null)
        continue;
    }
    (f.f & Jt) === 0 && _.push(f), g = f, o = fr(f.next);
  }
  if (e.outrogroups !== null) {
    for (const H of e.outrogroups)
      H.pending.size === 0 && (gs(e, Wr(H.done)), e.outrogroups?.delete(H));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || u !== void 0) {
    var ne = [];
    if (u !== void 0)
      for (f of u)
        (f.f & lt) === 0 && ne.push(f);
    for (; o !== null; )
      (o.f & lt) === 0 && o !== e.fallback && ne.push(o), o = fr(o.next);
    var J = ne.length;
    if (J > 0) {
      var Y = (s & pa) !== 0 && l === 0 ? n : null;
      if (i) {
        for (v = 0; v < J; v += 1)
          ne[v].nodes?.a?.measure();
        for (v = 0; v < J; v += 1)
          ne[v].nodes?.a?.fix();
      }
      Nl(e, ne, Y);
    }
  }
  i && cn(() => {
    if (m !== void 0)
      for (f of m)
        f.nodes?.a?.apply();
  });
}
function Ll(e, t, n, s, a, i, l, c) {
  var o = (l & Ci) !== 0 ? (l & Ni) === 0 ? /* @__PURE__ */ ol(n, !1, !1) : Bn(n) : null, u = (l & Oi) !== 0 ? Bn(a) : null;
  return {
    v: o,
    i: u,
    e: Et(() => (i(t, o ?? n, u ?? a, c), () => {
      e.delete(s);
    }))
  };
}
function gr(e, t, n) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, i = t && (t.f & Jt) === 0 ? (
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
    var s = Zt(() => t(e, n?.()) || {});
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
function Ws(e, t = !1) {
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
    return Array.isArray(t) ? (s = t[0], a = t[1]) : s = t, s && (n += Ws(s)), a && (n += Ws(a, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Me(e, t, n, s, a, i) {
  var l = (
    /** @type {any} */
    e[cs]
  );
  if (l !== n || l === void 0) {
    var c = Fl(n, s, i);
    c == null ? e.removeAttribute("class") : e.className = c, e[cs] = n;
  } else if (i && a !== i)
    for (var o in i) {
      var u = !!i[o];
      (a == null || u !== !!a[o]) && e.classList.toggle(o, u);
    }
  return i;
}
function Qr(e, t = {}, n, s) {
  for (var a in n) {
    var i = n[a];
    t[a] !== i && (n[a] == null ? e.style.removeProperty(a) : e.style.setProperty(a, i, s));
  }
}
function un(e, t, n, s) {
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
      s.selected = t.includes(Ys(s));
    return;
  }
  for (s of e.options) {
    var a = Ys(s);
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
function Ys(e) {
  return "__value" in e ? e.__value : e.value;
}
const jl = Symbol("is custom element"), Hl = Symbol("is html"), Bl = bi ? "progress" : "PROGRESS";
function Vn(e, t) {
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
function be(e, t, n, s) {
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
class Os {
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
          Os.entries.set(n.target, n);
          for (var s of this.#e.get(n.target) || [])
            s(n);
        }
      }
    ));
  }
}
var Wl = /* @__PURE__ */ new Os({
  box: "border-box"
});
function Ks(e, t, n) {
  var s = Wl.observe(e, () => n(e[t]));
  Ts(() => (Zt(() => n(e[t])), s));
}
function es(e, t) {
  return e === t || e?.[Ln] === t;
}
function kr(e = {}, t, n, s) {
  var a = (
    /** @type {ComponentContext} */
    nt.r
  ), i = (
    /** @type {Effect} */
    _e
  );
  return Ts(() => {
    var l, c;
    return Fa(() => {
      l = c, c = [], Zt(() => {
        es(n(...c), e) || (t(e, ...c), l && es(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== a && o.parent !== null && o.parent.f & os; )
        o = o.parent;
      const u = () => {
        c && es(n(...c), e) && t(null, ...c);
      }, g = o.teardown;
      o.teardown = () => {
        u(), g?.();
      };
    };
  }), e;
}
function Yl(e, t) {
  $i(window, ["resize"], () => cr(() => t(window[e])));
}
function te(e, t, n, s) {
  var a = !0, i = (n & Fi) !== 0, l = (n & Di) !== 0, c = (
    /** @type {V} */
    s
  ), o = !0, u = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && a ? (u ??= /* @__PURE__ */ yr(
    /** @type {() => V} */
    s
  ), r(u)) : (o && (o = !1, c = l ? Zt(
    /** @type {() => V} */
    s
  ) : (
    /** @type {V} */
    s
  )), c);
  let m;
  if (i) {
    var _ = Ln in e || gi in e;
    m = Qn(e, t)?.set ?? (_ && t in e ? (F) => e[t] = F : void 0);
  }
  var h, b = !1;
  i ? [h, b] = Xi(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && s !== void 0 && (h = g(), m && (Ti(), m(h)));
  var y;
  if (y = () => {
    var F = (
      /** @type {V} */
      e[t]
    );
    return F === void 0 ? g() : (o = !0, F);
  }, (n & Li) === 0)
    return y;
  if (m) {
    var f = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(F, B) {
        return arguments.length > 0 ? ((!B || f || b) && m(B ? y() : F), F) : y();
      })
    );
  }
  var v = !1, x = ((n & Ii) !== 0 ? yr : Sa)(() => (v = !1, y()));
  i && r(x);
  var C = (
    /** @type {Effect} */
    _e
  );
  return (
    /** @type {() => V} */
    (function(F, B) {
      if (arguments.length > 0) {
        const K = B ? r(x) : i ? Ie(F) : F;
        return k(x, K), v = !0, c !== void 0 && (c = K), F;
      }
      return hn && v || (C.f & mt) !== 0 ? x.v : r(x);
    })
  );
}
function ur(e) {
  nt === null && mi(), Tt(() => {
    const t = Zt(e);
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
async function ln(e, t = {}) {
  const n = await fetch(e + Kl(t));
  if (!n.ok) {
    const s = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${s.error ? " (" + s.error + ")" : ""}`);
  }
  return n.json();
}
async function $n(e, t) {
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
const Be = {
  // --- reads
  photos: (e) => ln("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => ln("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => ln("/api/triage/counts", { ...Xs(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => ln("/api/triage/files"),
  screen: (e, t = {}) => ln("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => ln("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => ln("/api/triage/page", { ...Xs(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => ln("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => $n("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => $n("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => $n("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => $n("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => $n("/api/reveal", { id: e }),
  revealOrigin: (e) => $n("/api/reveal", { origin: e }),
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
  rebuildStatus: () => ln("/api/triage/rebuild")
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
function It(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < $s.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${$s[n]}`;
}
function Ce(e) {
  return (Number(e) || 0).toLocaleString();
}
const ir = "G:\\photos", Vs = [
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
      value: t ? `${ir}\\${t}\\${e.key}` : `${ir}\\${e.key}`
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
  const n = e.slice(0, t), s = ir.toLowerCase();
  return n.toLowerCase().startsWith(s + "\\") ? n : "";
}
function zs(e, t) {
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
var Zl = /* @__PURE__ */ z('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), Ql = /* @__PURE__ */ z('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), eo = /* @__PURE__ */ z('<div class="line muted svelte-1vgp6n7">…</div>'), to = /* @__PURE__ */ z('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), no = /* @__PURE__ */ z('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), ro = /* @__PURE__ */ z('<div class="line muted svelte-1vgp6n7"> </div>'), so = /* @__PURE__ */ z('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function ao(e, t) {
  wt(t, !0);
  let n = te(t, "counts", 3, null), s = te(t, "files", 3, null), a = te(t, "filesAt", 3, null), i = te(t, "stale", 3, !1), l = te(t, "candidate", 3, null), c = te(t, "busy", 3, !1);
  const o = /* @__PURE__ */ se(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var u = so(), g = d(u);
  let m;
  var _ = p(d(g), 2);
  {
    var h = (Y) => {
      var H = Ql(), X = it(H), O = d(X), V = d(O), oe = p(O, 2), q = d(oe), ee = p(oe, 4), le = d(ee), we = p(ee, 2), R = d(we), I = p(X, 2);
      {
        var N = (G) => {
          var M = Zl(), T = p(d(M), 2), j = d(T), ce = p(T, 2), ae = d(ce), he = p(ce, 4), ge = d(he), ye = p(he, 2), xe = d(ye), ke = p(ye, 2), Ae = d(ke);
          W(
            (Te, Oe, fe, S, E) => {
              A(j, `kept ${Te ?? ""}`), A(ae, Oe), A(ge, `excluded ${fe ?? ""}`), A(xe, S), A(Ae, `${r(o) >= 0 ? "+" : ""}${E ?? ""} excluded`);
            },
            [
              () => Ce(n().candidate_kept_paths),
              () => It(n().candidate_kept_bytes),
              () => Ce(n().candidate_excluded_paths),
              () => It(n().candidate_excluded_bytes),
              () => Ce(r(o))
            ]
          ), P(G, M);
        };
        Q(I, (G) => {
          l() && G(N);
        });
      }
      W(
        (G, M, T, j) => {
          A(V, `kept ${G ?? ""}`), A(q, M), A(le, `excluded ${T ?? ""}`), A(R, j);
        },
        [
          () => Ce(n().kept_paths),
          () => It(n().kept_bytes),
          () => Ce(n().excluded_paths),
          () => It(n().excluded_bytes)
        ]
      ), P(Y, H);
    }, b = (Y) => {
      var H = eo();
      P(Y, H);
    };
    Q(_, (Y) => {
      n() ? Y(h) : Y(b, -1);
    });
  }
  var y = p(g, 2);
  let f;
  var v = d(y), x = p(d(v), 3), C = d(x), F = p(x, 2);
  {
    var B = (Y) => {
      var H = to();
      P(Y, H);
    };
    Q(F, (Y) => {
      i() && s() && s() !== "loading" && Y(B);
    });
  }
  var K = p(v, 2);
  {
    var ne = (Y) => {
      var H = no(), X = it(H);
      let O;
      var V = d(X), oe = d(V), q = p(V, 2), ee = d(q), le = p(q, 4), we = d(le), R = p(le, 2), I = d(R), N = p(X, 2), G = d(N);
      W(
        (M, T, j, ce) => {
          O = Me(X, 1, "line svelte-1vgp6n7", null, O, { outdated: i() }), A(oe, `kept ${M ?? ""}`), A(ee, T), A(we, `excluded ${j ?? ""}`), A(I, ce), A(G, `as of ${a() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Ce(s().kept_files),
          () => It(s().kept_bytes),
          () => Ce(s().excluded_files),
          () => It(s().excluded_bytes)
        ]
      ), P(Y, H);
    }, J = (Y) => {
      var H = ro(), X = d(H);
      W(() => A(X, s() === "loading" ? "counting…" : "not counted yet")), P(Y, H);
    };
    Q(K, (Y) => {
      s() && s() !== "loading" ? Y(ne) : Y(J, -1);
    });
  }
  W(() => {
    m = Me(g, 1, "block svelte-1vgp6n7", null, m, { busy: c() }), f = Me(y, 1, "block svelte-1vgp6n7", null, f, { busy: s() === "loading" }), x.disabled = s() === "loading", A(C, s() === "loading" ? "counting…" : "recount");
  }), Z("click", x, function(...Y) {
    t.onfiles?.apply(this, Y);
  }), P(e, u), yt();
}
Bt(["click"]);
const _s = "http://www.w3.org/2000/svg", On = {
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
  ...On,
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
  { dark: "tint", light: "tintLight", base: On },
  { dark: "control", light: "controlLight", base: En },
  { dark: "ink", light: "inkLight", base: En },
  { dark: "tally", light: "tallyLight", base: En },
  { dark: "tallyInk", light: "tallyInkLight", base: En }
], bs = /* @__PURE__ */ new Set();
let Lt = { ...En };
function lo() {
  return Lt;
}
function ts(e) {
  Lt = uo(e), Ns();
  for (const t of bs) t(Lt);
  return Lt;
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
    r: Ge(br(e.r, t.r), 0, 255),
    g: Ge(br(e.g, t.g), 0, 255),
    b: Ge(br(e.b, t.b), 0, 255),
    a: Ge(br(e.a, t.a), 0, 1)
  };
}
function uo(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [s, a] of Object.entries(En))
    typeof a == "boolean" ? n[s] = t[s] === void 0 ? a : !!t[s] : typeof a == "object" ? n[s] = co(t[s], a) : n[s] = br(t[s], a);
  return n;
}
function kt({ r: e, g: t, b: n, a: s }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Fe(s, 3)})`;
}
function Fe(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function Js({ r: e, g: t, b: n, a: s }) {
  return { r: e, g: t, b: n, a: Ge(s * 1.7 + 0.22, 0, 1) };
}
function Zs(e, t) {
  const n = 0.4 + Ge(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - Ge(t, 0, 100) / 100) };
}
function Qs(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, a = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? Ge(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * a * Math.max(t.glareFactor, 0) / 100;
  return Ge(i ** (0.1 + Ge(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const fo = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function ho(e, t, n) {
  const s = Ge(n.shapeRoundness, 2, 7), a = e / 2, i = t / 2, l = Math.min(n.shapeRadius, a, i), c = a - l, o = i - l, u = 8, g = [];
  for (let h = 0; h <= u; h++) {
    const b = h / u * (Math.PI / 2);
    g.push([l * Math.cos(b) ** (2 / s), l * Math.sin(b) ** (2 / s)]);
  }
  const m = [], _ = (h, b, y, f) => {
    let v = Math.atan2(h, -b);
    v < 0 && (v += Math.PI * 2);
    let x = Math.atan2(f, y);
    x < 0 && (x += Math.PI * 2);
    const C = Fe(Qs(x, n), 3);
    m.push(`rgba(255, 255, 255, ${C}) ${Fe(v / (Math.PI * 2) * 100, 2)}%`);
  };
  _(0, -i, 0, 1);
  for (const [h, b, y] of fo)
    for (let f = 0; f <= u; f++) {
      const [v, x] = g[y ? u - f : f];
      _(h * (c + v), b * (o + x), h * v ** (s - 1), -b * x ** (s - 1));
    }
  return m.push(`rgba(255, 255, 255, ${Fe(Qs(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function Ns() {
  const e = Lt, t = document.documentElement.style, n = Zs(e.refFresnelRange, e.refFresnelHardness), s = Zs(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Fe(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Fe(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", kt(e.tint)), t.setProperty("--glass-tint-light", kt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", kt(Js(e.tint))), t.setProperty("--glass-tint-sheet-light", kt(Js(e.tintLight))), t.setProperty("--glass-ctl-dark", kt(e.control)), t.setProperty("--glass-ctl-light", kt(e.controlLight)), t.setProperty("--glass-text-dark", kt(e.ink)), t.setProperty("--glass-text-light", kt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", kt(e.tally)), t.setProperty("--glass-tint-tally-light", kt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", kt(e.tallyInk)), t.setProperty("--glass-text-tally-light", kt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Fe(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Fe(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Fe(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Fe(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Fe(e.shadowX)}px ${Fe(-e.shadowY)}px ${Fe(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Fe(Ge(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Fe(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Fe(Math.log2(Ge(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Fe(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Fe(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Fe(Ge(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Fe(s.width)}px`), t.setProperty("--glass-glare-blur", `${Fe(s.blur)}px`);
}
function Ge(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function vo(e, t, n, s, a, i) {
  const l = Math.abs(e) - n + a, c = Math.abs(t) - s + a, o = Math.max(l, 0), u = Math.max(c, 0), g = i === 2 ? Math.hypot(o, u) : (o ** i + u ** i) ** (1 / i);
  return Math.min(Math.max(l, c), 0) + g - a;
}
function po(e, t, n) {
  const s = e / 2, a = t / 2, i = Ge(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), c = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), u = (_, h) => vo(_ - s, h - a, s, a, l, i), g = 256, m = new Float32Array(g + 1);
  for (let _ = 0; _ <= g; _++) {
    const h = 1 - _ / g, b = Math.asin(Ge(h * h, 0, 1)), y = Math.asin(Ge(Math.sin(b) / o, 0, 1));
    m[_] = Math.tan(b - y) * c;
  }
  return (_, h) => {
    const b = -u(_, h);
    if (b < 0 || b >= c) return null;
    const y = m[Math.round(b / c * g)];
    if (y === 0) return null;
    const f = 0.75, v = u(_ + f, h) - u(_ - f, h), x = u(_, h + f) - u(_, h - f), C = Math.hypot(v, x);
    if (C === 0) return null;
    const F = -y / C;
    return { dx: v * F, dy: x * F };
  };
}
function go(e, t, n) {
  const s = document.createElement("canvas");
  s.width = e, s.height = t;
  const a = s.getContext("2d"), i = a.createImageData(e, t), l = i.data, c = e * t, o = new Float32Array(c), u = new Float32Array(c);
  let g = 0;
  for (let _ = 0; _ < t; _++)
    for (let h = 0; h < e; h++) {
      const b = n(h + 0.5, _ + 0.5);
      if (!b) continue;
      const y = _ * e + h;
      o[y] = b.dx, u[y] = b.dy;
      const f = Math.hypot(b.dx, b.dy);
      f > g && (g = f);
    }
  const m = g > 0 ? 127 / g : 0;
  for (let _ = 0; _ < c; _++) {
    const h = _ * 4;
    l[h] = 128 + Ge(Math.round(o[_] * m), -127, 127), l[h + 1] = 128 + Ge(Math.round(u[_] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return a.putImageData(i, 0, 0), { url: s.toDataURL(), scale: g * 2 };
}
const ns = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function rs(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Fe(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
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
  let o = null, u = "";
  function g() {
    e.style.setProperty("--glass-pre", Lt.blurEdge ? "" : u), e.style.setProperty("--glass-post", Lt.blurEdge ? u : "");
  }
  function m() {
    s < 2 || a < 2 || e.style.setProperty("--glass-glare", ho(s, a, Lt));
  }
  function _() {
    if (s < 2 || a < 2) return;
    const f = Lt, v = go(s, a, po(s, a, f)), x = f.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(s)), n.setAttribute("height", String(a)), n.innerHTML = `<feImage x="0" y="0" width="${s}" height="${a}" preserveAspectRatio="none" href="${v.url}" result="map"/>` + rs(v.scale * (1 + x), ns[0], "r") + rs(v.scale, ns[1], "g") + rs(v.scale * (1 - x), ns[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, u = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (u = "", g()), o = c.map((C) => Lt[C]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, _();
    }));
  }
  const b = new ResizeObserver(([f]) => {
    const v = f.borderBoxSize?.[0], x = v ? { w: Math.round(v.inlineSize), h: Math.round(v.blockSize) } : { w: Math.round(f.contentRect.width), h: Math.round(f.contentRect.height) };
    x.w === s && x.h === a || (s = x.w, a = x.h, m(), h());
  });
  b.observe(e);
  const y = oo(() => {
    m(), c.map((f) => Lt[f]).join(" ") !== o ? h() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), y(), b.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
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
var xo = /* @__PURE__ */ z('<div class="glass selected svelte-zne36e"><span class="nums svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span></span> <button class="menu small svelte-zne36e" title="Copy the conditions and the selected ids to the clipboard">Share</button> <button class="menu small svelte-zne36e">Clear</button></div>'), ko = /* @__PURE__ */ z('<span class="spin svelte-zne36e" aria-label="loading"></span>'), ra = /* @__PURE__ */ z('<span class="badge svelte-zne36e"> </span>'), So = /* @__PURE__ */ z('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Eo = /* @__PURE__ */ z('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), ss = /* @__PURE__ */ z("<button> </button>"), To = /* @__PURE__ */ z('<div class="glass sheet sorts svelte-zne36e"></div>'), Mo = /* @__PURE__ */ z('<section><h2 class="svelte-zne36e">Strictness <span class="help svelte-zne36e" title="How many distinctive points two frames have to agree on before they are one stack.">?</span></h2> <div class="options svelte-zne36e"></div></section> <section><h2 class="svelte-zne36e">Linkage <span class="help svelte-zne36e" title="How many members of a stack a frame has to agree with, rather than only the frame before it.">?</span></h2> <div class="options svelte-zne36e"></div></section>', 1), Ao = /* @__PURE__ */ z(`<p class="note svelte-zne36e">Nothing has been grouped at this setting, so every tile is a stack of its
            own. <code class="svelte-zne36e">python -m photolib.membership</code> is the pass that writes
            one, and the settings it has been run at are what this panel offers.</p>`), Ro = /* @__PURE__ */ z('<section class="warn svelte-zne36e"><p class="note svelte-zne36e">Regrouping empties what you have selected — <strong> </strong> </p> <div class="options svelte-zne36e"><button class="option svelte-zne36e">Regroup anyway</button> <button class="option on svelte-zne36e">Keep the selection</button></div></section>'), Po = /* @__PURE__ */ z(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">The same photograph taken more than once is drawn as one tile — a
            bracket or a burst, checked frame against frame rather than guessed
            from the clock. Narrowing the filters takes frames out of a stack and
            never breaks one in two.</p></section> <!> <!> <!></div>`), Co = /* @__PURE__ */ z('<p class="muted svelte-zne36e">loading…</p>'), Oo = /* @__PURE__ */ z('<span class="help svelte-zne36e">?</span>'), zo = /* @__PURE__ */ z('<span class="n svelte-zne36e"> </span>'), No = /* @__PURE__ */ z("<button> <!></button>"), Io = /* @__PURE__ */ z('<span class="muted svelte-zne36e">nothing here</span>'), Lo = /* @__PURE__ */ z('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Fo = /* @__PURE__ */ z('<div class="glass sheet filters svelte-zne36e"><!></div>'), Do = /* @__PURE__ */ z('<div class="topbar svelte-zne36e"><div class="panes svelte-zne36e"><!> <div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <button role="switch" title="Select tiles by clicking them, then copy their ids">Select</button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function jo(e, t) {
  wt(t, !0);
  let n = te(t, "facets", 3, null), s = te(t, "filters", 19, () => ({})), a = te(t, "sort", 3, "newest"), i = te(t, "stacking", 19, () => ({ on: !1, strictness: null, linkage: null })), l = te(t, "total", 3, null), c = te(t, "tiles", 3, null), o = te(t, "loading", 3, !1), u = te(t, "selecting", 3, !1), g = te(t, "selectedTally", 19, () => ({ stacks: 0, photos: 0 })), m = te(t, "onfilter", 3, () => {
  }), _ = te(t, "onsort", 3, () => {
  }), h = te(t, "onstack", 3, () => {
  }), b = te(t, "onclear", 3, () => {
  }), y = te(t, "onselecting", 3, () => {
  }), f = te(t, "onshare", 3, () => {
  }), v = te(t, "ondeselect", 3, () => {
  }), x = te(t, "ontriage", 3, () => {
  }), C = /* @__PURE__ */ $(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), F = /* @__PURE__ */ $(Ie(ni())), B = /* @__PURE__ */ $(null);
  const K = /* @__PURE__ */ se(() => c() ?? l()), ne = /* @__PURE__ */ se(() => n()?.dimensions ?? []), J = /* @__PURE__ */ se(() => n()?.sorts ?? []), Y = /* @__PURE__ */ se(() => r(J).find((L) => L.value === a())?.label ?? a()), H = /* @__PURE__ */ se(() => Object.values(s()).reduce((L, ie) => L + ie.length, 0)), X = /* @__PURE__ */ se(() => r(ne).flatMap((L) => (s()[L.name] ?? []).map((ie) => ({
    dimension: L.name,
    value: ie,
    title: L.title,
    label: L.options.find((Ee) => Ee.value === ie)?.label ?? String(ie)
  }))));
  function O(L, ie) {
    const Ee = s()[L] ?? [], ze = Ee.includes(ie) ? Ee.filter((Le) => Le !== ie) : [...Ee, ie];
    m()(L, ze);
  }
  function V(L, ie) {
    return (s()[L] ?? []).includes(ie);
  }
  function oe() {
    k(F, ri(r(F) === "dark" ? "light" : "dark"), !0);
  }
  const q = /* @__PURE__ */ se(() => n()?.stacking?.settings ?? []), ee = /* @__PURE__ */ se(() => ({
    strictness: i().strictness ?? n()?.stacking?.default?.strictness,
    linkage: i().linkage ?? n()?.stacking?.default?.linkage
  })), le = /* @__PURE__ */ se(() => [...new Set(r(q).map((L) => L.strictness))].sort((L, ie) => L - ie)), we = /* @__PURE__ */ se(() => r(q).filter((L) => L.strictness === r(ee).strictness)), R = /* @__PURE__ */ se(() => r(q).some((L) => L.strictness === r(ee).strictness && L.linkage === r(ee).linkage));
  let I = /* @__PURE__ */ $(null);
  function N(L) {
    L.on === i().on && (L.strictness ?? r(ee).strictness) === r(ee).strictness && (L.linkage ?? r(ee).linkage) === r(ee).linkage || (g().stacks > 0 ? k(I, L, !0) : h()(L));
  }
  function G() {
    const L = r(I);
    k(I, null), h()(L);
  }
  Tt(() => {
    r(C) !== "stacks" && k(I, null);
  });
  function M(L) {
    L.key === "Escape" && k(C, "");
  }
  function T(L) {
    r(C) && !L.target.closest(".topbar") && k(C, "");
  }
  ur(() => {
    const L = new ResizeObserver(([ie]) => {
      const Ee = Math.round(ie.borderBoxSize?.[0]?.blockSize ?? ie.contentRect.height);
      document.documentElement.style.setProperty("--header-h", Ee + "px");
    });
    return L.observe(r(B)), () => {
      L.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var j = Do();
  In("keydown", Mn, M), In("pointerdown", Mn, T);
  var ce = d(j), ae = d(ce);
  {
    var he = (L) => {
      var ie = xo(), Ee = d(ie), ze = d(Ee), Le = d(ze), Re = p(ze, 2), Ze = d(Re), ct = p(Re, 2), Xt = d(ct), Qe = p(ct, 2), pn = d(Qe), nn = p(Ee, 2), rn = p(nn, 2);
      yn(ie, (je) => xn?.(je)), W(
        (je, gt) => {
          A(Le, je), A(Ze, g().stacks === 1 ? "stack" : "stacks"), A(Xt, gt), A(pn, g().photos === 1 ? "photo" : "photos");
        },
        [
          () => Ce(g().stacks),
          () => Ce(g().photos)
        ]
      ), Z("click", nn, () => f()()), Z("click", rn, () => v()()), P(L, ie);
    };
    Q(ae, (L) => {
      g().stacks && L(he);
    });
  }
  var ge = p(ae, 2), ye = d(ge), xe = d(ye), ke = p(ye, 2), Ae = d(ke), Te = p(ke, 2);
  {
    var Oe = (L) => {
      var ie = ko();
      P(L, ie);
    };
    Q(Te, (L) => {
      o() && L(Oe);
    });
  }
  yn(ge, (L) => xn?.(L));
  var fe = p(ce, 2), S = d(fe), E = d(S), D = d(E);
  let re;
  var ve = d(D), ue = p(D, 2);
  let de;
  var Je = p(d(ue));
  {
    var qt = (L) => {
      var ie = ra(), Ee = d(ie);
      W(() => A(Ee, r(H))), P(L, ie);
    };
    Q(Je, (L) => {
      r(H) && L(qt);
    });
  }
  var Ke = p(ue, 2);
  let Xe;
  var Pt = p(d(Ke));
  {
    var Ut = (L) => {
      var ie = ra(), Ee = d(ie);
      W((ze) => A(Ee, ze), [() => Ce(l())]), P(L, ie);
    };
    Q(Pt, (L) => {
      i().on && l() !== null && L(Ut);
    });
  }
  var pt = p(Ke, 2);
  let Wt;
  var Yt = p(pt, 2);
  {
    var Gt = (L) => {
      var ie = Eo(), Ee = d(ie);
      Ue(Ee, 17, () => r(X), (Le) => Le.dimension + " " + Le.value, (Le, Re) => {
        var Ze = So(), ct = d(Ze), Xt = d(ct), Qe = p(ct, 1, !0);
        W(() => {
          be(Ze, "title", `${r(Re).title ?? ""}: ${r(Re).label ?? ""} — click to remove`), A(Xt, r(Re).title), A(Qe, r(Re).label);
        }), Z("click", Ze, () => O(r(Re).dimension, r(Re).value)), P(Le, Ze);
      });
      var ze = p(Ee, 2);
      Z("click", ze, () => b()()), P(L, ie);
    };
    Q(Yt, (L) => {
      r(X).length && L(Gt);
    });
  }
  var rt = p(E, 2), st = d(rt), Ct = p(rt, 2);
  yn(S, (L) => xn?.(L));
  var Ot = p(S, 2);
  {
    var ot = (L) => {
      var ie = To();
      Ue(ie, 21, () => r(J), ht, (Ee, ze) => {
        var Le = ss();
        let Re;
        var Ze = d(Le);
        W(() => {
          Re = Me(Le, 1, "option svelte-zne36e", null, Re, { on: r(ze).value === a() }), A(Ze, r(ze).label);
        }), Z("click", Le, () => {
          _()(r(ze).value), k(C, "");
        }), P(Ee, Le);
      }), yn(ie, (Ee) => xn?.(Ee)), P(L, ie);
    };
    Q(Ot, (L) => {
      r(C) === "sort" && L(ot);
    });
  }
  var $e = p(Ot, 2);
  {
    var tn = (L) => {
      var ie = Po(), Ee = d(ie), ze = p(d(Ee), 2), Le = d(ze);
      let Re;
      var Ze = d(Le), ct = p(Ee, 2);
      {
        var Xt = (je) => {
          var gt = Mo(), sn = it(gt), $t = p(d(sn), 2);
          Ue($t, 21, () => r(le), ht, (et, w) => {
            var U = ss();
            let pe;
            var Pe = d(U);
            W(() => {
              pe = Me(U, 1, "option svelte-zne36e", null, pe, { on: r(w) === r(ee).strictness }), A(Pe, r(w));
            }), Z("click", U, () => N({
              ...i(),
              ...na(r(q), r(ee), { strictness: r(w) })
            })), P(et, U);
          });
          var Rn = p(sn, 2), Pn = p(d(Rn), 2);
          Ue(Pn, 21, () => r(we), ht, (et, w) => {
            var U = ss();
            let pe;
            var Pe = d(U);
            W(() => {
              pe = Me(U, 1, "option svelte-zne36e", null, pe, { on: r(w).linkage === r(ee).linkage }), A(Pe, r(w).label);
            }), Z("click", U, () => N({
              ...i(),
              ...na(r(q), r(ee), { linkage: r(w).linkage })
            })), P(et, U);
          }), P(je, gt);
        };
        Q(ct, (je) => {
          i().on && r(le).length && je(Xt);
        });
      }
      var Qe = p(ct, 2);
      {
        var pn = (je) => {
          var gt = Ao();
          P(je, gt);
        };
        Q(Qe, (je) => {
          n() && !r(R) && je(pn);
        });
      }
      var nn = p(Qe, 2);
      {
        var rn = (je) => {
          var gt = Ro(), sn = d(gt), $t = p(d(sn)), Rn = d($t), Pn = p($t), et = p(sn, 2), w = d(et), U = p(w, 2);
          W(
            (pe, Pe) => {
              A(Rn, pe), A(Pn, ` ${g().stacks === 1 ? "stack" : "stacks"}, ${Pe ?? ""}
              ${g().photos === 1 ? "photograph" : "photographs"}. The stacks
              it names will not exist afterwards.`);
            },
            [
              () => Ce(g().stacks),
              () => Ce(g().photos)
            ]
          ), Z("click", w, G), Z("click", U, () => k(I, null)), P(je, gt);
        };
        Q(nn, (je) => {
          r(I) && je(rn);
        });
      }
      yn(ie, (je) => xn?.(je)), W(() => {
        Re = Me(Le, 1, "option svelte-zne36e", null, Re, { on: i().on }), be(Le, "aria-checked", i().on), A(Ze, i().on ? "On" : "Off");
      }), Z("click", Le, () => N({ ...i(), on: !i().on })), P(L, ie);
    };
    Q($e, (L) => {
      r(C) === "stacks" && L(tn);
    });
  }
  var Kt = p($e, 2);
  {
    var qn = (L) => {
      var ie = Fo(), Ee = d(ie);
      {
        var ze = (Re) => {
          var Ze = Co();
          P(Re, Ze);
        }, Le = (Re) => {
          var Ze = Ps(), ct = it(Ze);
          Ue(ct, 17, () => r(ne), ht, (Xt, Qe) => {
            var pn = Lo(), nn = d(pn), rn = d(nn), je = p(rn);
            {
              var gt = (et) => {
                var w = Oo();
                W(() => be(w, "title", r(Qe).hint)), P(et, w);
              };
              Q(je, (et) => {
                r(Qe).hint && et(gt);
              });
            }
            var sn = p(nn, 2), $t = d(sn);
            Ue($t, 17, () => r(Qe).options, ht, (et, w) => {
              var U = No();
              let pe;
              var Pe = d(U), He = p(Pe);
              {
                var zt = (xt) => {
                  var an = zo(), _t = d(an);
                  W((Un) => A(_t, Un), [() => Ce(r(w).count)]), P(xt, an);
                };
                Q(He, (xt) => {
                  r(w).count !== null && xt(zt);
                });
              }
              W(
                (xt) => {
                  pe = Me(U, 1, "option svelte-zne36e", null, pe, xt), A(Pe, `${r(w).label ?? ""} `);
                },
                [
                  () => ({ on: V(r(Qe).name, r(w).value) })
                ]
              ), Z("click", U, () => O(r(Qe).name, r(w).value)), P(et, U);
            });
            var Rn = p($t, 2);
            {
              var Pn = (et) => {
                var w = Io();
                P(et, w);
              };
              Q(Rn, (et) => {
                r(Qe).options.length || et(Pn);
              });
            }
            W(() => A(rn, `${r(Qe).title ?? ""} `)), P(Xt, pn);
          }), P(Re, Ze);
        };
        Q(Ee, (Re) => {
          n() ? Re(Le, -1) : Re(ze);
        });
      }
      yn(ie, (Re) => xn?.(Re)), P(L, ie);
    };
    Q(Kt, (L) => {
      r(C) === "filters" && L(qn);
    });
  }
  kr(j, (L) => k(B, L), () => r(B)), W(
    (L) => {
      A(xe, L), A(Ae, r(K) === 1 ? "photo" : "photos"), re = Me(D, 1, "menu svelte-zne36e", null, re, { open: r(C) === "sort" }), be(D, "aria-expanded", r(C) === "sort"), A(ve, r(Y)), de = Me(ue, 1, "menu svelte-zne36e", null, de, { open: r(C) === "filters", on: r(H) > 0 }), be(ue, "aria-expanded", r(C) === "filters"), Xe = Me(Ke, 1, "menu svelte-zne36e", null, Xe, { open: r(C) === "stacks", on: i().on }), be(Ke, "aria-expanded", r(C) === "stacks"), Wt = Me(pt, 1, "menu svelte-zne36e", null, Wt, { on: u() }), be(pt, "aria-checked", u()), be(rt, "title", r(F) === "dark" ? "Switch to a white background" : "Switch to a black background"), be(rt, "aria-label", r(F) === "dark" ? "Switch to a white background" : "Switch to a black background"), A(st, r(F) === "dark" ? "☀" : "☾");
    },
    [() => r(K) === null ? "…" : Ce(r(K))]
  ), Z("click", D, () => k(C, r(C) === "sort" ? "" : "sort", !0)), Z("click", ue, () => k(C, r(C) === "filters" ? "" : "filters", !0)), Z("click", Ke, () => k(C, r(C) === "stacks" ? "" : "stacks", !0)), Z("click", pt, () => y()(!u())), Z("click", rt, oe), Z("click", Ct, () => x()()), P(e, j), yt();
}
Bt(["click"]);
const Vt = 4, qr = 220, Ho = 340, kn = 12, sa = Vt + kn, si = 6, Bo = 5, qo = 0.025, Uo = 9;
function Ur(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Wo(e, t, n, s, a) {
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
function Yo(e, t) {
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
var Go = /* @__PURE__ */ z('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), Ko = /* @__PURE__ */ z('<div role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Previous tile" aria-label="Previous tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M14.5 5 7.5 12l7 7"></path></svg></button></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Next tile" aria-label="Next tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M9.5 5l7 7-7 7"></path></svg></button></div></div>');
function Xo(e, t) {
  wt(t, !0);
  let n = te(t, "frames", 19, () => []), s = te(t, "origin", 3, null), a = te(t, "back", 3, !1), i = te(t, "forward", 3, !1), l = te(t, "onstep", 3, () => {
  }), c = te(t, "onreveal", 3, () => {
  }), o = te(t, "onclose", 3, () => {
  });
  const u = 40, g = 72, m = /* @__PURE__ */ se(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let _ = /* @__PURE__ */ $(Ie(document.documentElement.clientWidth)), h = /* @__PURE__ */ $(Ie(document.documentElement.clientHeight)), b = /* @__PURE__ */ $(null), y = /* @__PURE__ */ $(Ie(/* @__PURE__ */ new Set()));
  const f = 4, v = 25, x = { x: 0, y: 0, w: 0, h: 0 }, C = /* @__PURE__ */ se(() => Math.max(0, r(_) - g * 2)), F = /* @__PURE__ */ se(() => Math.max(0, r(h) - u * 2)), B = /* @__PURE__ */ se(() => r(C) > 0 && r(F) > 0 ? Y(n(), r(C), r(F)) : n().map(() => x));
  function K(T, j, ce) {
    const ae = [];
    let he = 0, ge = 0;
    for (let ye = 0; ye < T.length; ye++)
      ge += Ur(T[ye]), ge * ce + Vt * (ye - he) >= j && (ae.push({ from: he, to: ye + 1, sum: ge }), he = ye + 1, ge = 0);
    return he < T.length && ae.push({ from: he, to: T.length, sum: ge }), ae;
  }
  function ne(T, j, ce) {
    return T.map((ae, he) => {
      const ge = (j - Vt * (ae.to - ae.from - 1)) / ae.sum;
      return he === T.length - 1 && ge > ce ? ce : ge;
    });
  }
  function J(T, j, ce) {
    return ne(T, j, ce).reduce((ae, he) => ae + he, 0) + Vt * (T.length - 1);
  }
  function Y(T, j, ce) {
    let ae = f, he = Math.max(f, ce);
    for (let Ae = 0; Ae < v; Ae++) {
      const Te = (ae + he) / 2;
      J(K(T, j, Te), j, Te) <= ce ? ae = Te : he = Te;
    }
    const ge = K(T, j, ae), ye = ne(ge, j, ae), xe = [];
    let ke = (ce - (ye.reduce((Ae, Te) => Ae + Te, 0) + Vt * (ge.length - 1))) / 2;
    return ge.forEach((Ae, Te) => {
      const Oe = ye[Te], fe = [];
      for (let D = Ae.from; D < Ae.to; D++) fe.push(Ur(T[D]) * Oe);
      const S = fe.reduce((D, re) => D + re, 0) + Vt * (fe.length - 1);
      let E = (j - S) / 2;
      for (const D of fe)
        xe.push({
          x: Math.round(E),
          y: Math.round(ke),
          w: Math.round(D),
          h: Math.round(Oe)
        }), E += D + Vt;
      ke += Oe + Vt;
    }), xe;
  }
  function H(T) {
    if (!s() || !T || !T.w || !T.h) return "none";
    const j = s().left - (g + T.x), ce = s().top - (u + T.y);
    return `translate(${j}px, ${ce}px) scale(${s().width / T.w}, ${s().height / T.h})`;
  }
  const X = 1600;
  let O = /* @__PURE__ */ $(!1), V = 0;
  function oe() {
    k(O, !1), clearTimeout(V), V = setTimeout(() => k(O, !0), X);
  }
  function q(T) {
    if (T.key === "Escape") {
      o()();
      return;
    }
    T.key !== "ArrowLeft" && T.key !== "ArrowRight" || (T.preventDefault(), l()(T.key === "ArrowLeft" ? -1 : 1, T.repeat));
  }
  function ee(T) {
    T.target.closest(".frame, .lane") || o()();
  }
  ur(() => (r(b)?.focus(), oe(), () => clearTimeout(V)));
  var le = Ko();
  In("keydown", Mn, q), In("pointerdown", Mn, ee), In("pointermove", Mn, oe);
  let we;
  var R = d(le);
  un(R, "", {}, { inset: "40px 72px" }), Ue(R, 23, n, (T) => T.id, (T, j, ce) => {
    var ae = Go();
    let he;
    var ge = d(ae);
    let ye;
    W(
      (xe, ke) => {
        he = un(ae, "", he, xe), be(ge, "src", `/d/${r(j).s ?? ""}.webp`), ye = Me(ge, 1, "svelte-5g1i2z", null, ye, ke);
      },
      [
        () => ({
          left: `${r(B)[r(ce)].x ?? ""}px`,
          top: `${r(B)[r(ce)].y ?? ""}px`,
          width: `${r(B)[r(ce)].w ?? ""}px`,
          height: `${r(B)[r(ce)].h ?? ""}px`,
          "--flight": H(r(B)[r(ce)])
        }),
        () => ({ loaded: r(y).has(r(j).id) })
      ]
    ), Z("click", ae, () => c()(r(j))), In("load", ge, () => k(y, new Set(r(y)).add(r(j).id), !0)), P(T, ae);
  });
  var I = p(R, 2);
  un(I, "", {}, { width: "44px", left: "14px" });
  var N = d(I);
  yn(N, (T) => xn?.(T));
  var G = p(I, 2);
  un(G, "", {}, { width: "44px", right: "14px" });
  var M = d(G);
  yn(M, (T) => xn?.(T)), kr(le, (T) => k(b, T), () => r(b)), W(() => {
    we = Me(le, 1, "glass pane svelte-5g1i2z", null, we, { resting: r(O) }), be(le, "aria-label", r(m)), N.disabled = !a(), M.disabled = !i();
  }), Z("click", N, () => l()(-1)), Z("click", M, () => l()(1)), Ks(le, "clientWidth", (T) => k(_, T)), Ks(le, "clientHeight", (T) => k(h, T)), P(e, le), yt();
}
Bt(["click"]);
var $o = /* @__PURE__ */ z('<span class="err svelte-uzy12d"> </span>'), Vo = /* @__PURE__ */ z(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Jo = /* @__PURE__ */ z(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), Zo = /* @__PURE__ */ z('<span class="muted svelte-uzy12d"> </span>'), Qo = /* @__PURE__ */ z('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function ec(e, t) {
  wt(t, !0);
  let n = /* @__PURE__ */ $(null), s = /* @__PURE__ */ $(!1), a = /* @__PURE__ */ $(null);
  async function i() {
    k(s, !0), k(a, null);
    try {
      k(n, await Be.probe(), !0);
    } catch (h) {
      k(a, String(h), !0);
    } finally {
      k(s, !1);
    }
  }
  var l = Qo(), c = d(l), o = d(c), u = p(c, 2);
  {
    var g = (h) => {
      var b = $o(), y = d(b);
      W(() => A(y, r(a))), P(h, b);
    }, m = (h) => {
      var b = Ps(), y = it(b);
      {
        var f = (x) => {
          var C = Vo(), F = p(d(C), 2);
          W(
            (B) => A(F, ` above are formats the header
        reader cannot measure (${B ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), P(x, C);
        }, v = (x) => {
          var C = Jo(), F = d(C), B = d(F), K = p(F, 2), ne = d(K);
          W(
            (J) => {
              A(B, J), A(ne, r(n).command);
            },
            [() => Ce(r(n).worklist)]
          ), P(x, C);
        };
        Q(y, (x) => {
          r(n).worklist === 0 ? x(f) : x(v, -1);
        });
      }
      P(h, b);
    }, _ = (h) => {
      var b = Zo(), y = d(b);
      W(() => A(y, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), P(h, b);
    };
    Q(u, (h) => {
      r(a) ? h(g) : r(n) ? h(m, 1) : h(_, -1);
    });
  }
  W(() => {
    c.disabled = r(s), A(o, r(s) ? "counting…" : "Check the dimension probe's worklist");
  }), Z("click", c, i), P(e, l), yt();
}
Bt(["click"]);
var tc = /* @__PURE__ */ z('<p class="bad svelte-1xjbga"> </p>'), nc = /* @__PURE__ */ z('<pre class="svelte-1xjbga"> </pre>'), rc = /* @__PURE__ */ z('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), sc = /* @__PURE__ */ z(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), ac = /* @__PURE__ */ z('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), ic = /* @__PURE__ */ z('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), lc = /* @__PURE__ */ z(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), oc = /* @__PURE__ */ z('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), cc = /* @__PURE__ */ z(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function uc(e, t) {
  wt(t, !0);
  let n = /* @__PURE__ */ $(null), s = /* @__PURE__ */ $(!1), a = /* @__PURE__ */ $(null), i = /* @__PURE__ */ $(null);
  const l = /* @__PURE__ */ se(() => r(n)?.state === "running"), c = /* @__PURE__ */ se(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const x = await Be.rebuildStatus();
      k(n, x, !0), k(a, null), x.state === "done" && x.started_at !== r(i) && (k(i, x.started_at, !0), t.oncomplete?.());
    } catch (x) {
      k(a, String(x), !0);
    }
  }
  ur(() => {
    o();
  }), Tt(() => {
    if (!r(l)) return;
    const x = setInterval(o, 700);
    return () => clearInterval(x);
  });
  async function u() {
    k(s, !0), k(a, null);
    try {
      k(n, await Be.rebuild(), !0);
    } catch (x) {
      k(a, String(x), !0);
    }
  }
  function g(x) {
    x.key === "Escape" && k(s, !1);
  }
  var m = cc();
  In("keydown", Mn, g);
  var _ = it(m), h = d(_), b = d(h), y = p(h, 2), f = p(_, 2);
  {
    var v = (x) => {
      var C = oc(), F = it(C), B = p(F, 2), K = d(B), ne = p(d(K), 4), J = d(ne), Y = p(ne, 2), H = p(K, 2);
      {
        var X = (R) => {
          var I = tc(), N = d(I);
          W(() => A(N, r(a))), P(R, I);
        };
        Q(H, (R) => {
          r(a) && R(X);
        });
      }
      var O = p(H, 2);
      Ue(O, 17, () => r(n)?.steps ?? [], ht, (R, I) => {
        var N = rc();
        let G;
        var M = d(N), T = d(M), j = d(T);
        {
          var ce = (fe) => {
            var S = Zn("✓");
            P(fe, S);
          }, ae = (fe) => {
            var S = Zn("✕");
            P(fe, S);
          }, he = (fe) => {
            var S = Zn("·");
            P(fe, S);
          }, ge = (fe) => {
            var S = Zn(" ");
            P(fe, S);
          };
          Q(j, (fe) => {
            r(I).state === "done" ? fe(ce) : r(I).state === "failed" ? fe(ae, 1) : r(I).state === "running" ? fe(he, 2) : fe(ge, -1);
          });
        }
        var ye = p(T, 2), xe = d(ye), ke = p(ye, 4), Ae = d(ke), Te = p(M, 2);
        {
          var Oe = (fe) => {
            var S = nc(), E = d(S);
            W((D) => A(E, D), [() => r(I).log.join(`
`)]), P(fe, S);
          };
          Q(Te, (fe) => {
            r(I).log.length && fe(Oe);
          });
        }
        W(() => {
          G = Me(N, 1, "step svelte-1xjbga", null, G, {
            on: r(I).state === "running",
            bad: r(I).state === "failed"
          }), A(xe, r(I).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), A(Ae, r(I).seconds === null ? "" : r(I).seconds + "s");
        }), P(R, N);
      });
      var V = p(O, 2);
      {
        var oe = (R) => {
          var I = sc(), N = it(I), G = d(N);
          W(() => A(G, r(n).error)), P(R, I);
        }, q = (R) => {
          var I = ac();
          P(R, I);
        }, ee = (R) => {
          var I = ic();
          P(R, I);
        };
        Q(V, (R) => {
          r(n)?.state === "failed" ? R(oe) : r(n)?.state === "done" ? R(q, 1) : r(l) && R(ee, 2);
        });
      }
      var le = p(V, 2);
      {
        var we = (R) => {
          var I = lc(), N = p(d(I), 6), G = d(N);
          W(() => A(G, `python -m photolib.restore_state ${r(c) ?? ""}`)), P(R, I);
        };
        Q(le, (R) => {
          r(c) && R(we);
        });
      }
      W(() => A(J, `${r(n)?.seconds ?? 0 ?? ""}s`)), Z("click", F, () => k(s, !1)), Z("click", Y, () => k(s, !1)), P(x, C);
    };
    Q(f, (x) => {
      r(s) && x(v);
    });
  }
  W(() => {
    h.disabled = r(l), A(b, r(l) ? "applying…" : "Apply to grid"), y.disabled = !r(n) || r(n).state === "idle";
  }), Z("click", h, u), Z("click", y, () => k(s, !0)), P(e, m), yt();
}
Bt(["click"]);
var dc = /* @__PURE__ */ z('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), ia = /* @__PURE__ */ z("<option> </option>"), fc = /* @__PURE__ */ z('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), hc = /* @__PURE__ */ z('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), vc = /* @__PURE__ */ z('<div class="none muted svelte-bqi9ky"> </div>'), pc = /* @__PURE__ */ z('<div class="bar svelte-bqi9ky"><!></div>');
function gc(e, t) {
  wt(t, !0);
  let n = te(t, "candidate", 3, null), s = te(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), c = /* @__PURE__ */ se(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ se(() => !!n() && n().op !== "is null");
  function u(y, f) {
    const v = { ...n(), [y]: f };
    if (y === "column") {
      const x = i[f] ?? ["="];
      x.includes(v.op) || (v.op = x[0]), v.value = l.has(f) ? 0 : "";
    }
    y === "op" && f === "is null" && (v.value = null), y === "value" && l.has(v.column) && (v.value = Number(f) || 0), t.onedit(v);
  }
  var g = pc(), m = d(g);
  {
    var _ = (y) => {
      var f = dc(), v = d(f), x = d(v), C = p(v, 2), F = d(C);
      W(() => {
        A(x, `${t.screen.title ?? ""} does not save a rule.`), A(F, t.screen.blurb);
      }), P(y, f);
    }, h = (y) => {
      var f = hc(), v = it(f), x = d(v);
      Ue(x, 21, () => a, ht, (N, G) => {
        var M = ia(), T = d(M), j = {};
        W(() => {
          A(T, r(G)), j !== (j = r(G)) && (M.value = (M.__value = r(G)) ?? "");
        }), P(N, M);
      });
      var C;
      Pr(x);
      var F = p(x, 2);
      Ue(F, 21, () => r(c), ht, (N, G) => {
        var M = ia(), T = d(M), j = {};
        W(() => {
          A(T, r(G)), j !== (j = r(G)) && (M.value = (M.__value = r(G)) ?? "");
        }), P(N, M);
      });
      var B;
      Pr(F);
      var K = p(F, 2);
      {
        var ne = (N) => {
          var G = fc();
          W(() => Vn(G, n().value ?? "")), Z("input", G, (M) => u("value", M.currentTarget.value)), P(N, G);
        };
        Q(K, (N) => {
          r(o) && N(ne);
        });
      }
      var J = p(K, 2), Y = d(J);
      Y.value = Y.__value = "exclude";
      var H = p(Y);
      H.value = H.__value = "include";
      var X;
      Pr(J);
      var O = p(J, 2), V = d(O);
      V.value = V.__value = "end";
      var oe = p(V);
      oe.value = oe.__value = "0";
      var q;
      Pr(O);
      var ee = p(O, 2), le = d(ee), we = p(ee, 2), R = p(v, 2), I = d(R);
      W(
        (N, G) => {
          C !== (C = n().column) && (x.value = (x.__value = n().column) ?? "", _r(x, n().column)), B !== (B = n().op) && (F.value = (F.__value = n().op) ?? "", _r(F, n().op)), X !== (X = n().decision ?? "exclude") && (J.value = (J.__value = n().decision ?? "exclude") ?? "", _r(J, n().decision ?? "exclude")), q !== (q = N) && (O.value = (O.__value = N) ?? "", _r(O, N)), ee.disabled = s(), A(le, s() ? "saving…" : "Confirm"), A(I, `${G ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Vl(n())
        ]
      ), Z("change", x, (N) => u("column", N.currentTarget.value)), Z("change", F, (N) => u("op", N.currentTarget.value)), Z("change", J, (N) => u("decision", N.currentTarget.value)), Z("change", O, (N) => u("at", N.currentTarget.value)), Z("click", ee, function(...N) {
        t.onconfirm?.apply(this, N);
      }), Z("click", we, function(...N) {
        t.onclear?.apply(this, N);
      }), P(y, f);
    }, b = (y) => {
      var f = vc(), v = d(f);
      W(() => A(v, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), P(y, f);
    };
    Q(m, (y) => {
      t.screen.rule === !1 ? y(_) : n() ? y(h, 1) : y(b, -1);
    });
  }
  P(e, g), yt();
}
Bt(["change", "input", "click"]);
var _c = /* @__PURE__ */ z('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), bc = /* @__PURE__ */ z('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), mc = /* @__PURE__ */ z('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), wc = /* @__PURE__ */ z('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function yc(e, t) {
  wt(t, !0);
  let n = te(t, "rules", 19, () => []), s = te(t, "unmatched", 3, null), a = te(t, "busy", 3, !1);
  var i = wc(), l = d(i), c = p(d(l)), o = d(c), u = p(l, 2);
  {
    var g = (b) => {
      var y = _c();
      P(b, y);
    };
    Q(u, (b) => {
      n().length === 0 && b(g);
    });
  }
  var m = p(u, 2);
  Ue(m, 19, n, (b) => b.id, (b, y, f) => {
    var v = bc();
    let x;
    var C = d(v), F = d(C), B = d(F), K = p(F, 2), ne = d(K), J = p(K, 2), Y = d(J), H = p(C, 2), X = d(H), O = d(X), V = p(X, 2), oe = d(V), q = p(V, 4), ee = p(q, 2), le = p(ee, 2);
    W(
      (we, R) => {
        x = Me(v, 1, "rule svelte-aof9c2", null, x, { exclude: r(y).decision === "exclude" }), A(B, r(f)), A(ne, r(y).predicate), A(Y, r(y).decision), A(O, `${we ?? ""} paths`), A(oe, R), q.disabled = a() || r(f) === 0, ee.disabled = a() || r(f) === n().length - 1, le.disabled = a();
      },
      [
        () => Ce(r(y).paths),
        () => It(r(y).bytes)
      ]
    ), Z("click", q, () => t.onmove(r(y), r(f) - 1)), Z("click", ee, () => t.onmove(r(y), r(f) + 1)), Z("click", le, () => t.ondelete(r(y))), P(b, v);
  });
  var _ = p(m, 2);
  {
    var h = (b) => {
      var y = mc(), f = p(d(y), 2), v = d(f), x = d(v), C = p(v, 2), F = d(C);
      W(
        (B, K) => {
          A(x, `${B ?? ""} paths`), A(F, K);
        },
        [
          () => Ce(s().paths),
          () => It(s().bytes)
        ]
      ), P(b, y);
    };
    Q(_, (b) => {
      s() && b(h);
    });
  }
  W(() => A(o, `${n().length ?? ""} rules · top-down, first match wins`)), P(e, i), yt();
}
Bt(["click"]);
function as(e) {
  return { key: e.id, ids: (e.m ?? [e]).map((t) => t.id) };
}
function xc(e, t) {
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
function kc(e) {
  return {
    stacks: e.length,
    photos: e.reduce((t, n) => t + n.ids.length, 0)
  };
}
function Sc(e) {
  const t = e.stacking.on ? "on" + (e.stacking.strictness === null && e.stacking.linkage === null ? "" : ` strictness=${e.stacking.strictness} linkage=${e.stacking.linkage}`) : "off", n = Object.entries(e.filters).filter(([, s]) => s.length > 0).sort(([s], [a]) => s < a ? -1 : s > a ? 1 : 0).map(([s, a]) => s + ":" + a.join("|"));
  return `stack=${t} sort=${e.sort} filters=${n.length ? n.join(",") : "none"}`;
}
function Ec(e, t) {
  const n = t.map((s) => "[" + s.ids.join(",") + "]").join(",");
  return Sc(e) + `
` + n;
}
const oa = 2500, Tc = 1, Mc = 2, ca = 4, Ac = 3e7, Cn = /* @__PURE__ */ new WeakMap();
function ua(e) {
  return Cn.get(e).photo.getBoundingClientRect();
}
function Rc(e, t, n) {
  const s = [], a = [], i = /* @__PURE__ */ new Map(), l = [], c = [];
  let o = 0, u = kn, g = null, m = null, _ = null, h = !1, b = !1, y = 0, f = 0, v = 0, x = n.onState || (() => {
  });
  function C(S) {
    y <= 0 || (o = Wo(s, o, y, S, (E, D, re) => {
      a.push({ top: u, height: re, from: E, to: D }), u += re + sa;
    }), B());
  }
  function F() {
    if (m === null || h || y <= 0 || o >= m) return 0;
    const S = a.length ? o / a.length : Math.max(1, y / qr), E = a.length ? (u - kn) / a.length : qr + sa, D = Math.round((m - o) / S * E);
    return Math.max(0, Math.min(D, Ac - u));
  }
  function B() {
    e.style.height = u + F() + "px", t.style.top = Math.max(0, u - 1) + "px";
  }
  function K() {
    return window.scrollY - e.offsetTop;
  }
  function ne() {
    const S = l.pop();
    if (S) return S;
    const E = document.createElement("div");
    E.className = "tile", E.tabIndex = -1;
    const D = document.createElement("div");
    D.className = "deck", D.style.height = kn + "px";
    const re = [];
    for (let de = 0; de < si; de++) {
      const Je = document.createElement("div");
      Je.className = "card", Je.hidden = !0, re.push(Je);
    }
    for (let de = re.length - 1; de >= 0; de--) D.appendChild(re[de]);
    E.appendChild(D);
    const ve = document.createElement("div");
    ve.className = "tile-photo";
    const ue = document.createElement("img");
    return ue.decoding = "async", ue.draggable = !1, ue.addEventListener("load", () => E.classList.add("loaded")), ue.addEventListener("error", () => E.classList.add("missing")), ve.appendChild(ue), E.appendChild(ve), Cn.set(E, { img: ue, photo: ve, strip: D, cards: re, above: 0 }), n.extend && n.extend(E), E;
  }
  function J(S, E) {
    const { img: D, photo: re } = Cn.get(E);
    D.removeAttribute("src"), E.classList.remove("loaded", "missing", "error"), re.style.backgroundImage = "", E.remove(), i.delete(S), l.push(E);
  }
  function Y(S, E, D) {
    const re = Cn.get(S), ve = Yo(E.n, D);
    re.above = ve.length ? kn : 0, re.strip.hidden = ve.length === 0;
    for (let ue = 0; ue < re.cards.length; ue++) {
      const de = ve[ue];
      re.cards[ue].hidden = de === void 0, de !== void 0 && (re.cards[ue].style.top = de.top + "px", re.cards[ue].style.left = de.inset + "px", re.cards[ue].style.right = de.inset + "px", re.cards[ue].style.opacity = String(de.opacity));
    }
  }
  function H(S, E, D, re, ve, ue) {
    let de = i.get(S);
    const Je = s[S];
    if (!de) {
      de = ne(), de.dataset.index = String(S);
      const Xe = Cn.get(de).img;
      Y(de, Je, re), Xe.fetchPriority = ue ? "high" : "low", Xe.src = "/t/" + Je.s + ".webp", c.push(S), n.fill && n.fill(de, Je), e.appendChild(de), i.set(S, de);
    }
    const { above: qt, photo: Ke } = Cn.get(de);
    de.style.width = re + "px", de.style.height = ve + qt + "px", de.style.transform = "translate(" + E + "px," + (D - qt) + "px)", Ke.style.height = ve + "px";
  }
  function X(S, E) {
    E.th && (E.url === void 0 && (E.url = n.thumbHash(E.th)), E.url && (Cn.get(S).photo.style.backgroundImage = "url(" + E.url + ")"));
  }
  function O() {
    v = 0;
    for (const S of c) {
      const E = i.get(S);
      E && !E.classList.contains("loaded") && X(E, s[S]);
    }
    c.length = 0;
  }
  function V(S, E) {
    for (const D of ai(S, s, y))
      H(D.index, D.x, S.top, D.w, S.height, E);
  }
  function oe() {
    const S = window.innerHeight, E = K(), D = ms(a, E - S * Tc, E + S * (1 + Mc));
    if (!D) return;
    const re = a[D[0]].from, ve = a[D[1]].to;
    for (const [ue, de] of Array.from(i))
      (ue < re || ue >= ve) && J(ue, de);
    for (let ue = D[0]; ue <= D[1]; ue++) {
      const de = a[ue];
      V(de, de.top < E + S && de.top + de.height > E);
    }
    c.length && !v && (v = requestAnimationFrame(O));
  }
  function q() {
    return y <= 0 ? !1 : u - (K() + window.innerHeight) < oa;
  }
  let ee = Promise.resolve();
  function le() {
    return b || h || (b = !0, ee = we()), ee;
  }
  async function we() {
    const S = f;
    x({ loading: !0, count: s.length, exhausted: h, total: m, tiles: _ });
    try {
      do {
        const E = await n.fetchPage(g);
        if (S !== f) return;
        for (const D of E.photos) s.push(D);
        g = E.next, h = g === null, typeof E.stacks == "number" ? (m = E.stacks, _ = typeof E.total == "number" ? E.total : null) : typeof E.total == "number" && (m = E.total), C(h), oe(), x({ loading: !0, count: s.length, exhausted: h, total: m, tiles: _ });
      } while (!h && q());
    } catch (E) {
      S === f && x({ error: String(E) });
    } finally {
      S === f && (b = !1, x({ loading: !1, count: s.length, exhausted: h, total: m, tiles: _ }));
    }
  }
  let R = 0;
  function I() {
    R || (R = requestAnimationFrame(() => {
      R = 0, oe(), M && ge(), q() && le();
    }));
  }
  function N() {
    const S = e.clientWidth;
    if (S === y) return;
    const E = ms(a, K(), K()), D = E ? a[E[0]].from : 0;
    y = S;
    for (const [ve, ue] of Array.from(i)) J(ve, ue);
    a.length = 0, o = 0, u = kn, C(h), oe();
    const re = a.find((ve) => ve.to > D);
    re && window.scrollTo(0, re.top + e.offsetTop), q() && le();
  }
  let G = !1, M = null, T = 0, j = null, ce = !1;
  function ae(S, E) {
    const D = e.getBoundingClientRect();
    return { x: S - D.left, y: E - D.top };
  }
  function he(S) {
    j || (j = document.createElement("div"), j.className = "marquee", e.appendChild(j)), j.hidden = !1, j.style.width = S.right - S.left + "px", j.style.height = S.bottom - S.top + "px", j.style.transform = "translate(" + S.left + "px," + S.top + "px)";
  }
  function ge() {
    if (!M) return;
    const { x: S, y: E } = ae(M.cx, M.cy);
    if (!M.live) {
      if (Math.abs(S - M.ax) < ca && Math.abs(E - M.ay) < ca) return;
      M.live = !0, n.sweepStart(M.index === null ? null : s[M.index], M.index);
    }
    const D = {
      left: Math.min(M.ax, S),
      right: Math.max(M.ax, S),
      top: Math.min(M.ay, E),
      bottom: Math.max(M.ay, E)
    };
    he(D), n.sweepMove(aa(a, s, y, D).map((re) => s[re]));
  }
  function ye(S) {
    if (ce = !1, !G || S.button !== 0 || S.shiftKey) return;
    const { x: E, y: D } = ae(S.clientX, S.clientY), re = aa(a, s, y, { left: E, top: D, right: E, bottom: D });
    M = {
      ax: E,
      ay: D,
      cx: S.clientX,
      cy: S.clientY,
      index: re.length ? re[0] : null,
      live: !1
    }, window.addEventListener("pointermove", xe), window.addEventListener("pointerup", ke), window.addEventListener("pointercancel", ke);
  }
  function xe(S) {
    M && (M.cx = S.clientX, M.cy = S.clientY, !T && (T = requestAnimationFrame(() => {
      T = 0, ge();
    })));
  }
  function ke(S) {
    if (!M) return;
    window.removeEventListener("pointermove", xe), window.removeEventListener("pointerup", ke), window.removeEventListener("pointercancel", ke), cancelAnimationFrame(T), T = 0, M.cx = S.clientX, M.cy = S.clientY, ge();
    const E = M.live;
    M = null, j && (j.hidden = !0), E && (ce = !0, n.sweepEnd());
  }
  e.addEventListener("pointerdown", ye);
  function Ae(S) {
    if (ce) {
      ce = !1;
      return;
    }
    const E = S.target.closest(".tile");
    if (!E || !e.contains(E)) return;
    const D = Number(E.dataset.index), re = s[D];
    re && n.activate && n.activate(re, S, E, D);
  }
  e.addEventListener("click", Ae), window.addEventListener("scroll", I, { passive: !0 });
  let Te = 0;
  const Oe = new ResizeObserver(() => {
    clearTimeout(Te), Te = setTimeout(N, 100);
  });
  Oe.observe(e);
  const fe = new IntersectionObserver(
    (S) => {
      S.some((E) => E.isIntersecting) && le();
    },
    { rootMargin: "0px 0px " + oa + "px 0px" }
  );
  return fe.observe(t), y = e.clientWidth, le(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      f++, b = !1;
      for (const [S, E] of Array.from(i)) J(S, E);
      s.length = 0, a.length = 0, c.length = 0, o = 0, u = kn, g = null, m = null, _ = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), le();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(S) {
      const E = typeof S == "number" ? S : null;
      E !== m && (m = E, B(), x({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [S, E] of i) n.fill(E, s[S]);
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
    async walkTo(S) {
      for (; S >= o && !h; ) {
        const ve = o;
        if (await le(), o === ve) break;
      }
      const E = a.find((ve) => ve.to > S);
      if (!E) return null;
      const D = Math.max(0, (window.innerHeight - E.height) / 2);
      window.scrollTo(0, Math.max(0, e.offsetTop + E.top - D)), oe();
      const re = i.get(S);
      return re ? { item: s[S], tile: re } : null;
    },
    // Put the keyboard back on a tile. The overlay hands focus back on the way
    // out, and after a walk that is a different tile from the one it opened on.
    focus(S) {
      i.get(S)?.focus();
    },
    // Whether a press on the canvas rubber-bands. Select mode turns on and off
    // under a sheet that outlives the toggle, exactly as the tickboxes do.
    setSweeping(S) {
      G = S;
    },
    // The items between two indices, inclusive, in the order the sheet holds
    // them — which is the order the grid is sorted in. Shift-click's range: the
    // gesture knows two tiles and this is what lies between them.
    itemsBetween(S, E) {
      return s.slice(Math.min(S, E), Math.max(S, E) + 1);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(S) {
      for (const [E, D] of i)
        s[E] === S && n.fill && n.fill(D, S);
    },
    destroy() {
      f++, e.removeEventListener("click", Ae), e.removeEventListener("pointerdown", ye), window.removeEventListener("pointermove", xe), window.removeEventListener("pointerup", ke), window.removeEventListener("pointercancel", ke), window.removeEventListener("scroll", I), Oe.disconnect(), fe.disconnect(), clearTimeout(Te), cancelAnimationFrame(v), cancelAnimationFrame(T), j?.remove();
    }
  };
}
function Pc(e) {
  try {
    const t = Uint8Array.from(atob(e), (O) => O.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, s = t[3] | t[4] << 8, a = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, c = (n >> 18 & 31) / 31, o = n >> 23, u = (s >> 3 & 63) / 63, g = (s >> 9 & 63) / 63, m = s >> 15, _ = Math.max(3, m ? o ? 5 : 7 : s & 7), h = Math.max(3, m ? s & 7 : o ? 5 : 7);
    let b = o ? 6 : 5, y = 0;
    const f = (O, V, oe) => {
      const q = [];
      for (let ee = 0; ee < V; ee++)
        for (let le = ee ? 0 : 1; le * V < O * (V - ee); le++) {
          const we = t[b + (y >> 1)] >> ((y++ & 1) << 2) & 15;
          q.push((we / 7.5 - 1) * oe);
        }
      return q;
    }, v = f(_, h, c), x = f(3, 3, u * 1.25), C = f(3, 3, g * 1.25), F = _ / h, B = Math.max(1, Math.round(F > 1 ? 32 : 32 * F)), K = Math.max(1, Math.round(F > 1 ? 32 / F : 32)), ne = document.createElement("canvas");
    ne.width = B, ne.height = K;
    const J = ne.getContext("2d"), Y = J.createImageData(B, K), H = [], X = [];
    for (let O = 0, V = 0; O < K; O++)
      for (let oe = 0; oe < B; oe++, V += 4) {
        let q = a, ee = i, le = l;
        for (let N = 0; N < _; N++) H[N] = Math.cos(Math.PI / B * (oe + 0.5) * N);
        for (let N = 0; N < h; N++) X[N] = Math.cos(Math.PI / K * (O + 0.5) * N);
        for (let N = 0, G = 0; N < h; N++)
          for (let M = N ? 0 : 1; M * h < _ * (h - N); M++, G++)
            q += v[G] * H[M] * X[N] * 2;
        for (let N = 0, G = 0; N < 3; N++)
          for (let M = N ? 0 : 1; M < 3 - N; M++, G++) {
            const T = H[M] * X[N] * 2;
            ee += x[G] * T, le += C[G] * T;
          }
        const we = q - 2 / 3 * ee, R = (3 * q - we + le) / 2, I = R - le;
        Y.data[V] = Math.max(0, Math.min(255, Math.round(255 * R))), Y.data[V + 1] = Math.max(0, Math.min(255, Math.round(255 * I))), Y.data[V + 2] = Math.max(0, Math.min(255, Math.round(255 * we))), Y.data[V + 3] = 255;
      }
    return J.putImageData(Y, 0, 0), ne.toDataURL();
  } catch {
    return null;
  }
}
var Cc = /* @__PURE__ */ z('<main id="canvas"><div id="sentinel"></div></main>');
function Oc(e, t) {
  wt(t, !0);
  let n = te(t, "key", 3, ""), s = te(t, "total", 3, null), a = te(t, "triage", 3, !1), i = te(t, "excludedDirs", 19, () => []), l = te(t, "selecting", 3, !1), c = te(t, "selectedKeys", 19, () => []), o = te(t, "onActivate", 3, () => {
  }), u = te(t, "onOverride", 3, async () => null), g = te(t, "onExcludeFolder", 3, () => {
  }), m = te(t, "onState", 3, () => {
  }), _ = te(t, "onSweepStart", 3, () => {
  }), h = te(t, "onSweepMove", 3, () => {
  }), b = te(t, "onSweepEnd", 3, () => {
  }), y = /* @__PURE__ */ $(null), f = /* @__PURE__ */ $(null), v = null, x = "";
  const C = /* @__PURE__ */ se(() => new Set(c())), F = { null: "exclude", exclude: "include", include: "clear" };
  function B(R) {
    const I = R.toLowerCase().startsWith(ir.toLowerCase()) ? R.slice(ir.length + 1) : R;
    return I.length > 64 ? "…" + I.slice(-64) : I;
  }
  function K(R) {
    const I = document.createElement("div");
    I.className = "tile-path", R.appendChild(I);
    const N = document.createElement("button");
    N.className = "chip", N.type = "button", R.appendChild(N);
    const G = document.createElement("button");
    G.className = "dirchip", G.type = "button", G.textContent = "dir", R.appendChild(G);
  }
  function ne(R, I) {
    const N = R.querySelector(".tile-path");
    N && (N.textContent = I.p ? B(I.p) : "");
    const G = R.querySelector(".dirchip");
    if (G) {
      const T = Va(I.p ?? ""), j = T !== "" && zs(i(), T);
      G.hidden = T === "", G.disabled = j, G.dataset.state = j ? "exclude" : "none", G.title = j ? `already excluded: ${T}` : `exclude everything under ${T}, subfolders included — one exclude rule at the end of the order`;
    }
    const M = R.querySelector(".chip");
    M && (M.dataset.state = I.o || "none", M.textContent = I.o === "exclude" ? "drop" : I.o === "include" ? "keep" : "·", M.title = I.o === "exclude" ? "overridden: excluded — click to keep" : I.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  function J(R) {
    const I = document.createElement("span");
    I.className = "tick", R.appendChild(I);
  }
  function Y(R, I) {
    R.dataset.selected = r(C).has(I.id) ? "on" : "off";
  }
  ur(() => (v = Rc(r(y), r(f), {
    fetchPage: (R) => t.fetchPage(R),
    thumbHash: Pc,
    extend: a() ? K : J,
    fill: a() ? ne : Y,
    onState: (R) => m()(R),
    sweepStart: (R, I) => _()(R, I),
    sweepMove: (R) => h()(R),
    sweepEnd: () => b()(),
    activate: async (R, I, N, G) => {
      if (I.target.closest(".dirchip")) {
        g()(R);
        return;
      }
      if (!I.target.closest(".chip")) {
        o()(R, N, G, I.shiftKey);
        return;
      }
      const M = F[R.o ?? "null"];
      R.o = await u()(R, M), ne(N, R);
    }
  }), x = n(), v.setSweeping(l()), () => v?.destroy())), Tt(() => {
    v?.setSweeping(l());
  }), Tt(() => {
    const R = n(), I = s();
    v && (R !== x && (x = R, v.reset()), v.setTotal(I));
  });
  function H(R) {
    return v?.walkTo(R);
  }
  function X(R) {
    v?.focus(R);
  }
  function O(R, I) {
    return v?.itemsBetween(R, I) ?? [];
  }
  let V = "";
  Tt(() => {
    const R = i().join(`
`);
    !v || R === V || (V = R, v.refill());
  });
  let oe = null;
  Tt(() => {
    const R = c();
    !v || R === oe || (oe = R, v.refill());
  });
  var q = { walkTo: H, focusTile: X, itemsBetween: O }, ee = Cc();
  let le;
  var we = d(ee);
  return kr(we, (R) => k(f, R), () => r(f)), kr(ee, (R) => k(y, R), () => r(y)), W(() => le = Me(ee, 1, "", null, le, { selecting: l() })), P(e, ee), yt(q);
}
var zc = /* @__PURE__ */ z('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Nc = /* @__PURE__ */ z('<th class="num svelte-1v3p82v"> </th>'), Ic = /* @__PURE__ */ z('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Lc = /* @__PURE__ */ z('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Fc = /* @__PURE__ */ z('<td class="num svelte-1v3p82v"> </td>'), Dc = /* @__PURE__ */ z('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), jc = /* @__PURE__ */ z('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Hc(e, t) {
  wt(t, !0);
  let n = te(t, "rows", 19, () => []), s = te(t, "rules", 19, () => []), a = te(t, "root", 3, null), i = te(t, "picked", 3, null), l = te(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const c = /* @__PURE__ */ se(() => t.screen.rule !== !1);
  function o(y) {
    return t.screen.label ? t.screen.label(y) : y.key;
  }
  const u = /* @__PURE__ */ se(() => new Map(n().map((y) => [
    y.key,
    t.screen.rule === !1 ? null : Ja(s(), t.screen.toRule(y, a()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var _ = Ps(), h = it(_);
  {
    var b = (y) => {
      var f = jc(), v = d(f), x = d(v), C = d(x);
      {
        var F = (H) => {
          var X = zc();
          P(H, X);
        };
        Q(C, (H) => {
          r(c) && H(F);
        });
      }
      var B = p(C), K = d(B), ne = p(B, 3);
      {
        var J = (H) => {
          var X = Nc(), O = d(X);
          W(() => A(O, t.screen.heading[1])), P(H, X);
        };
        Q(ne, (H) => {
          t.screen.heading[1] && H(J);
        });
      }
      var Y = p(v);
      Ue(Y, 23, n, (H) => H.key, (H, X, O) => {
        const V = /* @__PURE__ */ se(() => r(u).get(r(X).key));
        var oe = Dc();
        let q;
        var ee = d(oe);
        {
          var le = (xe) => {
            const ke = /* @__PURE__ */ se(() => l().has(r(X).key));
            var Ae = Ic(), Te = d(Ae);
            let Oe;
            var fe = d(Te);
            W(
              (S) => {
                Oe = Me(Te, 1, "tick svelte-1v3p82v", null, Oe, { on: r(ke) }), be(Te, "aria-checked", r(ke)), be(Te, "aria-label", `select ${S ?? ""}`), A(fe, r(ke) ? "✓" : "");
              },
              [() => o(r(X))]
            ), Z("click", Te, (S) => {
              S.stopPropagation(), t.oncheck(r(X), r(O), S.shiftKey);
            }), P(xe, Ae);
          };
          Q(ee, (xe) => {
            r(c) && xe(le);
          });
        }
        var we = p(ee), R = d(we);
        let I;
        var N = d(R), G = p(R), M = p(G);
        {
          var T = (xe) => {
            var ke = Lc();
            P(xe, ke);
          };
          Q(M, (xe) => {
            r(X).scope === "whole inventory" && xe(T);
          });
        }
        var j = p(we), ce = d(j), ae = p(j), he = d(ae), ge = p(ae);
        {
          var ye = (xe) => {
            var ke = Fc(), Ae = d(ke);
            W(() => A(Ae, r(X).detail ?? "")), P(xe, ke);
          };
          Q(ge, (xe) => {
            t.screen.heading[1] && xe(ye);
          });
        }
        W(
          (xe, ke, Ae) => {
            q = Me(oe, 1, "svelte-1v3p82v", null, q, {
              picked: i() === r(X).key,
              clickable: t.screen.sheet !== !1
            }), I = Me(R, 1, "mark svelte-1v3p82v", null, I, {
              exclude: r(V) === "exclude",
              include: r(V) === "include"
            }), be(R, "title", m[r(V)] ?? ""), A(N, g[r(V)] ?? ""), A(G, `${xe ?? ""} `), A(ce, ke), A(he, Ae);
          },
          [
            () => o(r(X)),
            () => Ce(r(X).paths),
            () => It(r(X).bytes)
          ]
        ), Z("click", oe, () => t.onpick(r(X))), P(H, oe);
      }), W(() => A(K, t.screen.heading[0] ?? "")), P(y, f);
    };
    Q(h, (y) => {
      n().length && y(b);
    });
  }
  P(e, _), yt();
}
Bt(["click"]);
var Bc = /* @__PURE__ */ z('<button class="twisty svelte-pucy57"> </button>'), qc = /* @__PURE__ */ z('<span class="twisty leaf svelte-pucy57">·</span>'), Uc = /* @__PURE__ */ z('<span class="name root svelte-pucy57"> </span>'), Wc = /* @__PURE__ */ z('<button class="name svelte-pucy57"> </button>'), Yc = /* @__PURE__ */ z('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Gc = /* @__PURE__ */ z('<div class="note svelte-pucy57"> </div>'), Kc = /* @__PURE__ */ z('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Xc = /* @__PURE__ */ z('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), $c = /* @__PURE__ */ z('<div class="tree svelte-pucy57"></div>');
function Vc(e, t) {
  wt(t, !0);
  let n = te(t, "version", 3, 0), s = te(t, "excludedDirs", 19, () => []), a = te(t, "picked", 3, null), i = te(t, "busy", 3, !1), l = /* @__PURE__ */ $(Ie(/* @__PURE__ */ new Map())), c = /* @__PURE__ */ $(Ie(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ $(Ie(/* @__PURE__ */ new Set())), u = /* @__PURE__ */ $(Ie(/* @__PURE__ */ new Set()));
  async function g(f) {
    k(o, new Set(r(o)).add(f), !0);
    const v = await t.onload(f), x = new Map(r(l)), C = new Set(r(u));
    v ? (x.set(f, v), C.delete(f)) : C.add(f), k(l, x, !0), k(u, C, !0), k(o, new Set([...r(o)].filter((F) => F !== f)), !0);
  }
  function m(f) {
    if (r(c).has(f)) {
      k(c, new Set([...r(c)].filter((v) => v !== f)), !0);
      return;
    }
    k(c, new Set(r(c)).add(f), !0), r(l).has(f) || g(f);
  }
  let _ = -1;
  Tt(() => {
    const f = n();
    if (f !== _) {
      _ = f, r(c).has(t.root) || k(c, new Set(r(c)).add(t.root), !0);
      for (const v of r(c)) g(v);
    }
  });
  const h = /* @__PURE__ */ se(() => {
    const f = [], v = (B, K, ne, J, Y, H) => {
      const X = r(l).get(B), O = r(c).has(B);
      if (f.push({
        key: B,
        name: K,
        depth: ne,
        paths: J,
        bytes: Y,
        deeper: H,
        expanded: O,
        here: X?.here ?? null,
        truncated: !!X?.truncated,
        loading: r(o).has(B),
        failed: r(u).has(B),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: zs(s(), B)
      }), !(!O || !X))
        for (const V of X.children)
          v(V.path, V.name, ne + 1, V.paths, V.bytes, V.deeper);
    }, x = r(l).get(t.root), C = x ? x.children.reduce((B, K) => B + K.paths, 0) + x.here.paths : 0, F = x ? x.children.reduce((B, K) => B + K.bytes, 0) + x.here.bytes : 0;
    return v(t.root, t.root, 0, C, F, !0), f;
  }), b = 8;
  var y = $c();
  Ue(y, 21, () => r(h), (f) => f.key, (f, v) => {
    var x = Xc(), C = it(x);
    let F;
    var B = d(C);
    let K;
    var ne = p(B, 2);
    {
      var J = (M) => {
        var T = Bc(), j = d(T);
        W(() => {
          be(T, "aria-expanded", r(v).expanded), be(T, "aria-label", `${r(v).expanded ? "collapse" : "expand"} ${r(v).name ?? ""}`), be(T, "title", r(v).expanded ? "collapse" : "expand"), A(j, r(v).loading ? "·" : r(v).expanded ? "▾" : "▸");
        }), Z("click", T, () => m(r(v).key)), P(M, T);
      }, Y = (M) => {
        var T = qc();
        P(M, T);
      };
      Q(ne, (M) => {
        r(v).deeper ? M(J) : M(Y, -1);
      });
    }
    var H = p(ne, 2);
    {
      var X = (M) => {
        var T = Uc(), j = d(T);
        W(() => A(j, r(v).key)), P(M, T);
      }, O = (M) => {
        var T = Wc(), j = d(T);
        W(() => {
          be(T, "title", `Show every kept file under ${r(v).key ?? ""}`), A(j, r(v).name);
        }), Z("click", T, () => t.onpick(r(v))), P(M, T);
      };
      Q(H, (M) => {
        r(v).depth === 0 ? M(X) : M(O, -1);
      });
    }
    var V = p(H, 2), oe = d(V), q = p(V, 2), ee = d(q), le = p(q, 2), we = p(C, 2);
    {
      var R = (M) => {
        var T = Yc();
        let j;
        W((ce) => j = un(T, "", j, ce), [
          () => ({
            "padding-left": `${Math.min(r(v).depth, b) * 11 + 18}px`
          })
        ]), P(M, T);
      }, I = (M) => {
        var T = Gc();
        let j;
        var ce = d(T);
        W(
          (ae, he, ge) => {
            j = un(T, "", j, ae), A(ce, `${he ?? ""} directly here · ${ge ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(v).depth, b) * 11 + 18}px`
            }),
            () => Ce(r(v).here.paths),
            () => It(r(v).here.bytes)
          ]
        ), P(M, T);
      };
      Q(we, (M) => {
        r(v).expanded && r(v).failed ? M(R) : r(v).expanded && r(v).here && r(v).here.paths > 0 && M(I, 1);
      });
    }
    var N = p(we, 2);
    {
      var G = (M) => {
        var T = Kc();
        let j;
        W((ce) => j = un(T, "", j, ce), [
          () => ({
            "padding-left": `${Math.min(r(v).depth, b) * 11 + 18}px`
          })
        ]), P(M, T);
      };
      Q(N, (M) => {
        r(v).truncated && M(G);
      });
    }
    W(
      (M, T, j) => {
        F = Me(C, 1, "row svelte-pucy57", null, F, {
          picked: a() === r(v).key,
          gone: r(v).excluded
        }), K = un(B, "", K, M), A(oe, T), A(ee, j), le.disabled = i() || r(v).excluded || r(v).depth === 0, be(le, "title", r(v).depth === 0 ? "The library root is not excludable from here." : r(v).excluded ? "already excluded" : `Exclude everything under ${r(v).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(v).depth, b) * 11}px` }),
        () => Ce(r(v).paths),
        () => It(r(v).bytes)
      ]
    ), Z("click", le, () => t.onexclude(r(v))), P(f, x);
  }), P(e, y), yt();
}
Bt(["click"]);
var Jc = /* @__PURE__ */ z('<button title="Back to its default">↺</button>'), Zc = /* @__PURE__ */ z('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), Qc = /* @__PURE__ */ z('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), eu = /* @__PURE__ */ z('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), tu = /* @__PURE__ */ z('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), nu = /* @__PURE__ */ z('<li><code class="svelte-1hh0fwb"> </code> </li>'), ru = /* @__PURE__ */ z(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), su = /* @__PURE__ */ z('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function au(e, t) {
  wt(t, !0);
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
  let c = /* @__PURE__ */ $(Ie(lo())), o = /* @__PURE__ */ $(!0), u = /* @__PURE__ */ $(!1), g = /* @__PURE__ */ $(Ie(ni())), m = /* @__PURE__ */ $(Ie(window.innerWidth));
  const _ = (O) => r(g) === "light" ? O.light : O.dark, h = (O) => O in On ? On : En, b = (O) => `rgba(${O.r}, ${O.g}, ${O.b}, ${O.a})`, y = /* @__PURE__ */ se(() => JSON.stringify(r(c), null, 2));
  ur(() => {
    const O = localStorage.getItem(n);
    if (O)
      try {
        k(c, ts(JSON.parse(O)), !0);
        return;
      } catch {
      }
    Ns();
  });
  function f(O) {
    k(c, ts({ ...r(c), ...O }), !0), localStorage.setItem(n, JSON.stringify(r(c))), k(u, !1);
  }
  function v(O) {
    k(c, ts(O), !0), localStorage.setItem(n, JSON.stringify(r(c))), k(u, !1);
  }
  function x(O) {
    f({ [O]: h(O)[O] });
  }
  function C() {
    k(g, ri(r(g) === "dark" ? "light" : "dark"), !0);
  }
  async function F() {
    await navigator.clipboard.writeText(r(y)), k(u, !0);
  }
  var B = su();
  let K;
  var ne = d(B), J = p(d(ne), 4), Y = d(J), H = p(ne, 2);
  {
    var X = (O) => {
      var V = ru();
      {
        const Te = (fe, S = Cr, E = Cr, D = Cr) => {
          var re = Jc();
          let ve;
          W(() => {
            ve = Me(re, 1, "undo svelte-1hh0fwb", null, ve, { idle: !E() }), be(re, "aria-label", `Reset ${S() ?? ""}`);
          }), Z("click", re, function(...ue) {
            D()?.apply(this, ue);
          }), P(fe, re);
        };
        var oe = p(d(V), 2);
        Ue(oe, 17, () => s, ht, (fe, S) => {
          var E = Qc(), D = d(E), re = d(D), ve = p(D, 2), ue = d(ve), de = p(ve, 2);
          Ue(de, 17, () => r(S).rows, ht, (Je, qt) => {
            var Ke = /* @__PURE__ */ se(() => Vr(r(qt), 5));
            let Xe = () => r(Ke)[0], Pt = () => r(Ke)[1], Ut = () => r(Ke)[2], pt = () => r(Ke)[3], Wt = () => r(Ke)[4];
            const Yt = /* @__PURE__ */ se(() => r(c)[Xe()] !== h(Xe())[Xe()]), Gt = /* @__PURE__ */ se(() => typeof pt() == "function" ? pt()(r(m)) : pt());
            var rt = Zc();
            let st;
            var Ct = d(rt), Ot = d(Ct), ot = p(Ct, 2), $e = p(ot, 2), tn = p($e, 2);
            Te(tn, Pt, () => r(Yt), () => () => x(Xe())), W(() => {
              st = Me(rt, 1, "row svelte-1hh0fwb", null, st, { moved: r(Yt) }), A(Ot, Pt()), be(ot, "min", Ut()), be(ot, "max", r(Gt)), be(ot, "step", Wt()), be(ot, "aria-label", Pt()), Vn(ot, r(c)[Xe()]), be($e, "min", Ut()), be($e, "max", r(Gt)), be($e, "step", Wt()), be($e, "aria-label", `${Pt() ?? ""} value`), Vn($e, r(c)[Xe()]);
            }), Z("input", ot, (Kt) => f({ [Xe()]: Number(Kt.currentTarget.value) })), Z("input", $e, (Kt) => f({ [Xe()]: Number(Kt.currentTarget.value) })), P(Je, rt);
          }), W(() => {
            A(re, r(S).title), A(ue, r(S).note);
          }), P(fe, E);
        });
        var q = p(oe, 2), ee = d(q), le = p(q, 2), we = d(le), R = p(le, 2);
        Ue(R, 17, () => io, ht, (fe, S) => {
          const E = /* @__PURE__ */ se(() => _(r(S))), D = /* @__PURE__ */ se(() => r(c)[r(E)]), re = /* @__PURE__ */ se(() => r(S).base[r(E)]);
          var ve = tu(), ue = d(ve), de = d(ue), Je = p(de), qt = d(Je), Ke = p(ue, 2), Xe = d(Ke), Pt = p(Ke, 2);
          Ue(Pt, 17, () => i, ht, (Yt, Gt) => {
            var rt = /* @__PURE__ */ se(() => Vr(r(Gt), 3));
            let st = () => r(rt)[0], Ct = () => r(rt)[1], Ot = () => r(rt)[2];
            const ot = /* @__PURE__ */ se(() => r(D)[st()] !== r(re)[st()]);
            var $e = eu();
            let tn;
            var Kt = d($e), qn = d(Kt), L = p(Kt, 2), ie = p(L, 2), Ee = p(ie, 2);
            Te(Ee, Ct, () => r(ot), () => () => f({
              [r(E)]: { ...r(D), [st()]: r(re)[st()] }
            })), W(() => {
              tn = Me($e, 1, "row svelte-1hh0fwb", null, tn, { moved: r(ot) }), A(qn, Ct()), be(L, "max", Ot()), be(L, "step", Ot() === 1 ? 0.01 : 1), be(L, "aria-label", `${r(g) ?? ""} ${a[r(S).dark].title ?? ""} ${Ct() ?? ""}`), Vn(L, r(D)[st()]), be(ie, "max", Ot()), be(ie, "step", Ot() === 1 ? 0.01 : 1), be(ie, "aria-label", `${r(g) ?? ""} ${a[r(S).dark].title ?? ""} ${Ct() ?? ""} value`), Vn(ie, r(D)[st()]);
            }), Z("input", L, (ze) => f({
              [r(E)]: {
                ...r(D),
                [st()]: Number(ze.currentTarget.value)
              }
            })), Z("input", ie, (ze) => f({
              [r(E)]: {
                ...r(D),
                [st()]: Number(ze.currentTarget.value)
              }
            })), P(Yt, $e);
          });
          var Ut = p(Pt, 2);
          let pt;
          var Wt = d(Ut);
          W(
            (Yt, Gt) => {
              A(de, `${a[r(S).dark].title ?? ""} `), A(qt, r(g)), A(Xe, a[r(S).dark].note), pt = un(Ut, "", pt, Yt), A(Wt, Gt);
            },
            [
              () => ({ background: b(r(D)) }),
              () => b(r(D))
            ]
          ), P(fe, ve);
        });
        var I = p(R, 2), N = p(d(I), 4);
        let Oe;
        var G = d(N), M = d(G), T = p(G, 2);
        Te(T, () => "Blur at the edge", () => r(c).blurEdge !== On.blurEdge, () => () => x("blurEdge"));
        var j = p(I, 2), ce = p(d(j), 4);
        Ue(ce, 21, () => l, ht, (fe, S) => {
          var E = /* @__PURE__ */ se(() => Vr(r(S), 2));
          let D = () => r(E)[0], re = () => r(E)[1];
          var ve = nu(), ue = d(ve), de = d(ue), Je = p(ue);
          W(() => {
            A(de, D()), A(Je, ` — ${re() ?? ""}`);
          }), P(fe, ve);
        });
        var ae = p(j, 2), he = p(d(ae), 4), ge = d(he), ye = p(ge, 2), xe = p(ye, 2), ke = d(xe), Ae = p(he, 2);
        W(() => {
          A(ee, `The five colours below are per theme, and you are editing the ${r(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), A(we, `Edit the ${r(g) === "dark" ? "light" : "dark"} colours`), Oe = Me(N, 1, "row toggle svelte-1hh0fwb", null, Oe, { moved: r(c).blurEdge !== On.blurEdge }), ql(M, r(c).blurEdge), A(ke, r(u) ? "Copied" : "Copy"), Vn(Ae, r(y));
        }), Z("click", le, C), Z("change", M, (fe) => f({ blurEdge: fe.currentTarget.checked })), Z("click", ge, () => v(En)), Z("click", ye, () => v(On)), Z("click", xe, F);
      }
      P(O, V);
    };
    Q(H, (O) => {
      r(o) && O(X);
    });
  }
  W(() => {
    K = Me(B, 1, "tuner svelte-1hh0fwb", null, K, { folded: !r(o) }), be(J, "title", r(o) ? "Fold away" : "Open"), A(Y, r(o) ? "–" : "+");
  }), Yl("innerWidth", (O) => k(m, O, !0)), Z("click", J, () => k(o, !r(o))), P(e, B), yt();
}
Bt(["click", "input", "change"]);
function is(e, t, n, s) {
  const a = e + t;
  return a < 0 || a >= n && s ? null : a;
}
var iu = /* @__PURE__ */ z('<button><span class="n svelte-1n46o8q"> </span> </button>'), lu = /* @__PURE__ */ z('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), ou = /* @__PURE__ */ z('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), cu = /* @__PURE__ */ z('<div class="muted pad svelte-1n46o8q">loading…</div>'), uu = /* @__PURE__ */ z('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), du = /* @__PURE__ */ z('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), fu = /* @__PURE__ */ z('<p class="blurb"> </p>'), hu = /* @__PURE__ */ z('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear</button> <span class="muted svelte-1n46o8q"><!></span></div>'), vu = /* @__PURE__ */ z('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), pu = /* @__PURE__ */ z('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), gu = /* @__PURE__ */ z('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), _u = /* @__PURE__ */ z("<div> </div>"), bu = /* @__PURE__ */ z('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function mu(e, t) {
  wt(t, !0);
  const n = location.pathname === "/tune";
  let s = /* @__PURE__ */ $("grid"), a = /* @__PURE__ */ $(0), i = /* @__PURE__ */ $(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ $(Ie([])), c = /* @__PURE__ */ $(null), o = /* @__PURE__ */ $(null), u = /* @__PURE__ */ $(Ie(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ $(null), m = /* @__PURE__ */ $(null), _ = /* @__PURE__ */ $(null), h = /* @__PURE__ */ $(null), b = /* @__PURE__ */ $(!1), y = /* @__PURE__ */ $(!1), f = /* @__PURE__ */ $(!1), v = /* @__PURE__ */ $(!1), x = /* @__PURE__ */ $(Ie({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), C = /* @__PURE__ */ $(null), F = /* @__PURE__ */ $(0), B = /* @__PURE__ */ $(null), K = /* @__PURE__ */ $(Ie({})), ne = /* @__PURE__ */ $("newest"), J = /* @__PURE__ */ $(Ie(mo())), Y = /* @__PURE__ */ $(null), H = /* @__PURE__ */ $(null), X = /* @__PURE__ */ $(!1), O = /* @__PURE__ */ $(Ie([])), V = /* @__PURE__ */ $(null), oe = null;
  const q = /* @__PURE__ */ se(() => Vs[r(a)]), ee = /* @__PURE__ */ se(() => r(q).table !== !1), le = /* @__PURE__ */ se(() => r(ee) || r(q).tree === !0), we = /* @__PURE__ */ se(() => r(q).sheet !== !1 && (r(o) !== null || !r(le))), R = /* @__PURE__ */ se(() => ({
    sort: r(ne),
    ...r(J).on ? {
      stack: "on",
      ...r(J).strictness === null ? {} : {
        strictness: String(r(J).strictness),
        linkage: r(J).linkage
      }
    } : {},
    ...Object.fromEntries(Object.entries(r(K)).filter(([, w]) => w.length > 0))
  })), I = /* @__PURE__ */ se(() => r(O).map((w) => w.key)), N = /* @__PURE__ */ se(() => kc(r(O)));
  Tt(() => {
    r(R), Zt(() => {
      k(O, [], !0), k(
        V,
        null
        // it indexes an order this query no longer has
      );
    });
  });
  const G = /* @__PURE__ */ se(() => r(s) === "grid" ? `grid:${JSON.stringify(r(R))}` : `triage:${r(a)}:${JSON.stringify(r(o))}`), M = /* @__PURE__ */ se(() => r(q).rule === !1 || r(u).size === 0 ? [] : r(l).filter((w) => r(u).has(w.key)).map((w) => r(q).toRule(w, r(i))).filter((w) => w && Ja(r(m)?.rules ?? [], w) !== "exclude")), T = /* @__PURE__ */ se(() => (r(m)?.rules ?? []).filter((w) => w.decision === "exclude" && w.term?.column === "dir_under").map((w) => String(w.term.value).replace(/[\\/]+$/, "").toLowerCase())), j = Xl();
  function ce(w) {
    k(C, String(w), !0);
  }
  async function ae(w) {
    try {
      return k(C, null), await w();
    } catch (U) {
      return ce(U), null;
    }
  }
  const he = $l(
    () => {
      k(y, !0), ae(async () => {
        const w = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: U, value: pe } = await j(() => Be.counts(r(o), w));
        U || k(m, pe, !0);
      }).finally(() => {
        k(y, !1);
      });
    },
    220
  );
  async function ge() {
    k(_, "loading");
    const w = await ae(() => Be.files());
    k(_, w, !0), k(b, !1), k(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function ye(w = !1) {
    if (r(s) !== "triage" || !r(ee)) {
      k(l, [], !0);
      return;
    }
    k(v, !0);
    const U = r(q).name === "source_folder" && r(i) ? { root: r(i) } : {};
    w && (U.live = "1");
    const pe = await ae(() => Be.screen(r(q).name, U));
    k(l, pe?.rows ?? [], !0), k(v, !1);
  }
  let xe = !1;
  Tt(() => {
    r(a), r(s), Zt(() => {
      k(c, null), k(o, null), k(i, null), Oe(), r(s) === "triage" && (ye(), he.now(), xe || (xe = !0, ge()));
    });
  }), Tt(() => {
    r(i), Zt(() => {
      r(s) === "triage" && (Oe(), ye());
    });
  }), ur(() => {
    ae(async () => {
      k(B, await Be.facets(), !0);
    });
  }), Tt(() => {
    const w = r(B)?.stacking?.settings;
    w && Zt(() => {
      const U = wo(r(J), w);
      U !== r(J) && k(J, ta(U), !0);
    });
  });
  function ke(w, U) {
    k(K, { ...r(K), [w]: U }, !0);
  }
  function Ae(w) {
    if (r(q).sheet !== !1) {
      if (r(q).drill && !r(i)) {
        k(c, w.key, !0), k(
          o,
          {
            ...r(q).toRule(w, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), k(i, w.key, !0);
        return;
      }
      k(c, w.key, !0), k(
        o,
        {
          ...r(q).toRule(w, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), he();
    }
  }
  function Te(w, U, pe) {
    const Pe = new Set(r(u)), He = !Pe.has(w.key), zt = pe && r(g) !== null ? r(l).findIndex((_t) => _t.key === r(g)) : -1, [xt, an] = zt < 0 ? [U, U] : zt < U ? [zt, U] : [U, zt];
    for (let _t = xt; _t <= an; _t++)
      He ? Pe.add(r(l)[_t].key) : Pe.delete(r(l)[_t].key);
    k(u, Pe, !0), k(g, w.key, !0);
  }
  function Oe() {
    k(u, /* @__PURE__ */ new Set(), !0), k(g, null);
  }
  function fe(w) {
    k(o, w, !0), k(
      c,
      null
      // it no longer corresponds to a row
    ), he();
  }
  function S(w = !1) {
    k(o, null), k(c, null), w && k(i, null), he.now();
  }
  async function E() {
    k(
      b,
      !0
      // the distinct-content number now says so on its face
    ), ul(F), await ye(), he.now();
  }
  async function D() {
    if (!r(o)) return;
    k(f, !0);
    const w = r(o).at === "end" ? void 0 : 0, U = await ae(() => Be.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(q).id} ${r(q).title}`
      },
      w
    ));
    k(f, !1), U && (k(o, null), k(c, null), await E());
  }
  async function re() {
    const w = r(M);
    if (!w.length) {
      Oe();
      return;
    }
    k(f, !0);
    for (const U of w)
      if (!await ae(() => Be.addRule({
        column: U.column,
        op: U.op,
        value: U.value,
        decision: "exclude",
        note: `screen ${r(q).id} ${r(q).title}`
      }))) break;
    k(f, !1), Oe(), k(o, null), k(c, null), await E();
  }
  async function ve(w) {
    if (!w || zs(r(T), w)) return;
    k(f, !0);
    const U = await ae(() => Be.addRule({
      column: "dir_under",
      op: "=",
      value: w,
      decision: "exclude",
      note: `screen ${r(q).id} ${r(q).title}`
    }));
    k(f, !1), U && await E();
  }
  const ue = (w) => ve(Va(w.p ?? "")), de = (w) => ve(w.key);
  async function Je(w) {
    k(f, !0), await ae(() => Be.deleteRule(w.id)), k(f, !1), await E();
  }
  async function qt(w, U) {
    k(f, !0), await ae(() => Be.moveRule(w.id, U)), k(f, !1), await E();
  }
  async function Ke() {
    await ae(async () => {
      k(B, await Be.facets(), !0);
    });
  }
  async function Xe(w, U) {
    const pe = await ae(() => Be.override(w.s, U));
    return pe ? (k(b, !0), he(), pe.decision) : w.o ?? null;
  }
  function Pt(w) {
    return r(s) === "grid" ? Be.photos({ limit: 500, ...r(R), ...w || {} }) : Be.page(r(o), w);
  }
  const Ut = (w) => w.m ?? [{ id: w.id, s: w.s, w: w.w, h: w.h }];
  function pt(w, U, pe, Pe = !1) {
    if (r(s) === "grid") {
      if (r(X)) {
        if (Pe && r(V) !== null) {
          const He = r(H)?.itemsBetween(r(V), pe) ?? [];
          k(O, la(r(O), He.map(as), !Wt(w)), !0);
        } else
          k(O, xc(r(O), as(w)), !0);
        k(V, pe, !0);
        return;
      }
      k(Y, { frames: Ut(w), origin: ua(U), at: pe }, !0);
      return;
    }
    ae(() => Be.revealOrigin(w.id));
  }
  const Wt = (w) => r(O).some((U) => U.key === w.id);
  function Yt(w, U) {
    oe = {
      from: r(O),
      adding: w === null || !Wt(w)
    }, U !== null && k(V, U, !0);
  }
  function Gt(w) {
    k(O, la(oe.from, w.map(as), oe.adding), !0);
  }
  function rt() {
    oe = null;
  }
  function st() {
    k(O, [], !0), k(V, null);
  }
  const Ct = /* @__PURE__ */ se(() => r(Y) !== null && is(r(Y).at, -1, r(x).count, r(x).exhausted) !== null), Ot = /* @__PURE__ */ se(() => r(Y) !== null && is(r(Y).at, 1, r(x).count, r(x).exhausted) !== null), ot = 120;
  let $e = !1, tn = 0;
  async function Kt(w, U = !1) {
    const pe = performance.now();
    if (!r(Y) || $e || U && pe - tn < ot) return;
    const Pe = is(r(Y).at, w, r(x).count, r(x).exhausted);
    if (Pe !== null) {
      tn = pe, $e = !0;
      try {
        const He = await r(H)?.walkTo(Pe);
        if (!He || !r(Y)) return;
        k(
          Y,
          {
            frames: Ut(He.item),
            origin: ua(He.tile),
            at: Pe
          },
          !0
        );
      } finally {
        $e = !1;
      }
    }
  }
  async function qn() {
    const w = r(Y)?.at ?? null;
    k(Y, null), await kl(), w !== null && r(H)?.focusTile(w);
  }
  function L(w) {
    qn(), ae(() => Be.revealPhoto(w.id));
  }
  function ie() {
    ae(() => navigator.clipboard.writeText(Ec(
      {
        stacking: r(J),
        sort: r(ne),
        filters: r(K)
      },
      r(O)
    )));
  }
  var Ee = bu(), ze = it(Ee);
  {
    var Le = (w) => {
      jo(w, {
        get facets() {
          return r(B);
        },
        get filters() {
          return r(K);
        },
        get sort() {
          return r(ne);
        },
        get stacking() {
          return r(J);
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
          return r(X);
        },
        get selectedTally() {
          return r(N);
        },
        onfilter: ke,
        onsort: (U) => k(ne, U, !0),
        onstack: (U) => k(J, ta(U), !0),
        onclear: () => k(K, {}, !0),
        onselecting: (U) => k(X, U, !0),
        onshare: ie,
        ondeselect: st,
        ontriage: () => k(s, "triage")
      });
    };
    Q(ze, (w) => {
      r(s) === "grid" && w(Le);
    });
  }
  var Re = p(ze, 2);
  {
    var Ze = (w) => {
      au(w, {});
    };
    Q(Re, (w) => {
      n && w(Ze);
    });
  }
  var ct = p(Re, 2);
  let Xt;
  var Qe = d(ct);
  {
    var pn = (w) => {
      var U = du(), pe = d(U), Pe = d(pe), He = p(pe, 2);
      Ue(He, 21, () => Vs, ht, (ut, Nt, gn) => {
        var _n = iu();
        let Wn;
        var Yn = d(_n), Ne = d(Yn), dt = p(Yn, 1, !0);
        W(() => {
          Wn = Me(_n, 1, "nav svelte-1n46o8q", null, Wn, { on: gn === r(a) }), A(Ne, r(Nt).id), A(dt, r(Nt).title);
        }), Z("click", _n, () => k(a, gn, !0)), P(ut, _n);
      });
      var zt = p(He, 2);
      {
        var xt = (ut) => {
          var Nt = uu(), gn = it(Nt), _n = d(gn);
          {
            var Wn = (tt) => {
              var at = lu(), Gn = it(at), dr = /* @__PURE__ */ se(() => S.bind(null, !0)), Kr = p(Gn, 2), Xr = d(Kr);
              W(() => A(Xr, `inside ${r(i) ?? ""}`)), Z("click", Gn, function(...$r) {
                r(dr)?.apply(this, $r);
              }), P(tt, at);
            }, Yn = (tt) => {
              var at = ou(), Gn = d(at);
              W(() => A(Gn, r(q).relive)), Z("click", at, () => ye(!0)), P(tt, at);
            };
            Q(_n, (tt) => {
              r(q).drill && r(i) ? tt(Wn) : r(q).relive && tt(Yn, 1);
            });
          }
          var Ne = p(gn, 2);
          {
            var dt = (tt) => {
              var at = cu();
              P(tt, at);
            };
            Q(Ne, (tt) => {
              r(v) && tt(dt);
            });
          }
          var bn = p(Ne, 2);
          {
            let tt = /* @__PURE__ */ se(() => r(m)?.rules ?? []);
            Hc(bn, {
              get rows() {
                return r(l);
              },
              get screen() {
                return r(q);
              },
              get root() {
                return r(i);
              },
              get checked() {
                return r(u);
              },
              get rules() {
                return r(tt);
              },
              get picked() {
                return r(c);
              },
              onpick: Ae,
              oncheck: Te
            });
          }
          P(ut, Nt);
        };
        Q(zt, (ut) => {
          r(ee) && ut(xt);
        });
      }
      var an = p(zt, 2);
      {
        var _t = (ut) => {
          Vc(ut, {
            get root() {
              return ir;
            },
            get version() {
              return r(F);
            },
            get excludedDirs() {
              return r(T);
            },
            get picked() {
              return r(c);
            },
            get busy() {
              return r(f);
            },
            onload: (Nt) => ae(() => Be.tree(Nt)),
            onpick: Ae,
            onexclude: de
          });
        };
        Q(an, (ut) => {
          r(q).tree && ut(_t);
        });
      }
      var Un = p(an, 2);
      {
        let ut = /* @__PURE__ */ se(() => r(m)?.rules ?? []), Nt = /* @__PURE__ */ se(() => r(m)?.unmatched ?? null);
        yc(Un, {
          get rules() {
            return r(ut);
          },
          get unmatched() {
            return r(Nt);
          },
          get busy() {
            return r(f);
          },
          ondelete: Je,
          onmove: qt
        });
      }
      var Mr = p(Un, 2);
      uc(Mr, { oncomplete: Ke }), Z("click", Pe, () => k(s, "grid")), P(w, U);
    };
    Q(Qe, (w) => {
      r(s) === "triage" && w(pn);
    });
  }
  var nn = p(Qe, 2), rn = d(nn);
  {
    var je = (w) => {
      var U = gu(), pe = it(U), Pe = d(pe), He = p(pe, 2), zt = d(He), xt = p(He, 2);
      {
        var an = (Ne) => {
          var dt = fu(), bn = d(dt);
          W(() => A(bn, r(q).note)), P(Ne, dt);
        };
        Q(xt, (Ne) => {
          r(q).note && Ne(an);
        });
      }
      var _t = p(xt, 2);
      {
        var Un = (Ne) => {
          ec(Ne, {
            get screen() {
              return r(q);
            }
          });
        };
        Q(_t, (Ne) => {
          r(q).name === "dimensions" && Ne(Un);
        });
      }
      var Mr = p(_t, 2);
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
          return r(b);
        },
        get candidate() {
          return r(o);
        },
        get busy() {
          return r(y);
        },
        onfiles: ge
      });
      var ut = p(Mr, 2);
      {
        var Nt = (Ne) => {
          var dt = hu(), bn = d(dt), tt = d(bn), at = p(bn, 2), Gn = d(at), dr = p(at, 2), Kr = p(dr, 2), Xr = d(Kr);
          {
            var $r = (mn) => {
              var Kn = Zn("already excluded — nothing left to write");
              P(mn, Kn);
            }, ii = (mn) => {
              var Kn = Zn();
              W((li) => A(Kn, `one exclude rule each, at the end of the order${li ?? ""}`), [
                () => r(M).length < r(u).size ? ` · ${Ce(r(u).size - r(M).length)} already excluded, skipped` : ""
              ]), P(mn, Kn);
            };
            Q(Xr, (mn) => {
              r(M).length ? mn(ii, -1) : mn($r);
            });
          }
          W(
            (mn, Kn) => {
              A(tt, `${mn ?? ""} ticked`), at.disabled = r(f) || !r(M).length, A(Gn, Kn), dr.disabled = r(f);
            },
            [
              () => Ce(r(u).size),
              () => r(f) ? "saving…" : `Exclude ${Ce(r(M).length)}`
            ]
          ), Z("click", at, re), Z("click", dr, Oe), P(Ne, dt);
        };
        Q(ut, (Ne) => {
          r(u).size && Ne(Nt);
        });
      }
      var gn = p(ut, 2);
      gc(gn, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(q);
        },
        get saving() {
          return r(f);
        },
        onedit: fe,
        onconfirm: D,
        onclear: S
      });
      var _n = p(gn, 2);
      {
        var Wn = (Ne) => {
          var dt = vu(), bn = d(dt);
          W((tt, at) => A(bn, `${tt ?? ""}${at ?? ""} loaded${r(x).exhausted ? " · all of them" : ""}${r(x).loading ? " · loading…" : ""} `), [
            () => Ce(r(x).count),
            () => r(x).total ? " of " + Ce(r(x).total) : ""
          ]), P(Ne, dt);
        }, Yn = (Ne) => {
          var dt = pu();
          P(Ne, dt);
        };
        Q(_n, (Ne) => {
          r(we) ? Ne(Wn) : r(q).sheet === !1 && Ne(Yn, 1);
        });
      }
      W(() => {
        A(Pe, `${r(q).id ?? ""} · ${r(q).title ?? ""}`), A(zt, r(q).blurb);
      }), P(w, U);
    };
    Q(rn, (w) => {
      r(s) === "triage" && w(je);
    });
  }
  var gt = p(rn, 2);
  {
    var sn = (w) => {
      {
        let U = /* @__PURE__ */ se(() => r(s) === "grid" ? null : r(m)?.page_paths ?? null), pe = /* @__PURE__ */ se(() => r(s) === "triage"), Pe = /* @__PURE__ */ se(() => r(s) === "grid" && r(X));
        kr(
          Oc(w, {
            get key() {
              return r(G);
            },
            fetchPage: Pt,
            get total() {
              return r(U);
            },
            get triage() {
              return r(pe);
            },
            get excludedDirs() {
              return r(T);
            },
            get selecting() {
              return r(Pe);
            },
            get selectedKeys() {
              return r(I);
            },
            onActivate: pt,
            onOverride: Xe,
            onExcludeFolder: ue,
            onSweepStart: Yt,
            onSweepMove: Gt,
            onSweepEnd: rt,
            onState: (He) => k(x, { ...r(x), ...He }, !0)
          }),
          (He) => k(H, He, !0),
          () => r(H)
        );
      }
    };
    Q(gt, (w) => {
      (r(we) || r(s) === "grid") && w(sn);
    });
  }
  var $t = p(ct, 2);
  {
    var Rn = (w) => {
      Xo(w, {
        get frames() {
          return r(Y).frames;
        },
        get origin() {
          return r(Y).origin;
        },
        get back() {
          return r(Ct);
        },
        get forward() {
          return r(Ot);
        },
        onstep: Kt,
        onreveal: L,
        onclose: qn
      });
    };
    Q($t, (w) => {
      r(Y) && w(Rn);
    });
  }
  var Pn = p($t, 2);
  {
    var et = (w) => {
      var U = _u();
      let pe;
      var Pe = d(U);
      W(() => {
        pe = Me(U, 1, "status", null, pe, { bare: r(s) === "grid" }), A(Pe, r(C));
      }), P(w, U);
    };
    Q(Pn, (w) => {
      r(C) && w(et);
    });
  }
  W(() => Xt = Me(ct, 1, "shell", null, Xt, { bare: r(s) === "grid" })), P(e, Ee), yt();
}
Bt(["click"]);
yo();
Ns();
Pl(mu, { target: document.getElementById("app") });
