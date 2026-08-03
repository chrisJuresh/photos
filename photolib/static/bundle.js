var Ln = Array.isArray, ei = Array.prototype.indexOf, Qt = Array.prototype.includes, on = Array.from, ti = Object.defineProperty, gt = Object.getOwnPropertyDescriptor, ni = Object.prototype, ri = Array.prototype, ii = Object.getPrototypeOf, Gn = Object.isExtensible;
const si = () => {
};
function ai(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function fr() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const oe = 2, bt = 4, un = 8, cr = 1 << 24, Ae = 16, Ee = 32, He = 64, En = 128, ke = 512, ie = 1024, se = 2048, Ce = 4096, ve = 8192, me = 16384, St = 32768, Sn = 1 << 25, wt = 65536, $t = 1 << 17, li = 1 << 18, Tt = 1 << 19, oi = 1 << 20, Oe = 1 << 25, ut = 65536, en = 1 << 21, mt = 1 << 22, We = 1 << 23, st = Symbol("$state"), ui = Symbol("legacy props"), dr = Symbol("attributes"), Tn = Symbol("class"), fi = Symbol("style"), An = Symbol("text"), qt = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), ci = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function di(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function vi() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function hi(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function _i(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function pi() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function gi(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function mi() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function bi(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function wi() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function yi() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function xi() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ki() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Ei = 1, Si = 2, vr = 4, Ti = 8, Ai = 16, Ri = 1, Mi = 4, Ci = 8, Ni = 16, Ii = 1, Oi = 2, re = Symbol("uninitialized"), Pi = "http://www.w3.org/1999/xhtml";
function Li() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Di() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Fi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function hr(e) {
  return e === this.v;
}
function qi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function _r(e) {
  return !qi(e, this.v);
}
let de = null;
function yt(e) {
  de = e;
}
function $e(e, t = !1, n) {
  de = {
    p: de,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      H
    ),
    l: null
  };
}
function et(e) {
  var t = (
    /** @type {ComponentContext} */
    de
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Pr(r);
  }
  return t.i = !0, de = t.p, /** @type {T} */
  {};
}
function pr() {
  return !0;
}
let _t = [];
function Hi() {
  var e = _t;
  _t = [], ai(e);
}
function Ye(e) {
  if (_t.length === 0) {
    var t = _t;
    queueMicrotask(() => {
      t === _t && Hi();
    });
  }
  _t.push(e);
}
function gr(e) {
  var t = H;
  if (t === null)
    return B.f |= We, e;
  if ((t.f & St) === 0 && (t.f & bt) === 0)
    throw e;
  Xe(e, t);
}
function Xe(e, t) {
  if (!(t !== null && (t.f & me) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & En) !== 0) {
        if ((t.f & St) === 0)
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
const ji = -7169;
function te(e, t) {
  e.f = e.f & ji | t;
}
function Dn(e) {
  (e.f & ke) !== 0 || e.deps === null ? te(e, ie) : te(e, Ce);
}
function mr(e) {
  if (e !== null)
    for (const t of e)
      (t.f & oe) === 0 || (t.f & ut) === 0 || (t.f ^= ut, mr(
        /** @type {Derived} */
        t.deps
      ));
}
function br(e, t, n) {
  (e.f & se) !== 0 ? t.add(e) : (e.f & Ce) !== 0 && n.add(e), mr(e.deps), te(e, ie);
}
let Xt = !1;
function Bi(e) {
  var t = Xt;
  try {
    return Xt = !1, [e(), Xt];
  } finally {
    Xt = t;
  }
}
function fn(e) {
  var t = B, n = H;
  Se(null), Le(null);
  try {
    return e();
  } finally {
    Se(t), Le(n);
  }
}
function zi(e) {
  let t = 0, n = ft(0), r;
  return () => {
    jn() && (u(n), Lr(() => (t === 0 && (r = Et(() => e(() => Pt(n)))), t += 1, () => {
      Ye(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Pt(n));
      });
    })));
  };
}
var Ui = wt | Tt;
function Gi(e, t, n, r) {
  new Vi(e, t, n, r);
}
class Vi {
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
  #t;
  /** @type {TemplateNode | null} */
  #a = null;
  /** @type {BoundaryProps} */
  #e;
  /** @type {((anchor: Node) => void)} */
  #o;
  /** @type {Effect} */
  #r;
  /** @type {Effect | null} */
  #s = null;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #i = null;
  #_ = 0;
  #u = 0;
  #f = !1;
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #p = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #c = null;
  #m = zi(() => (this.#c = ft(this.#_), () => {
    this.#c = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#o = (s) => {
      var l = (
        /** @type {Effect} */
        H
      );
      l.b = this, l.f |= En, r(s);
    }, this.parent = /** @type {Effect} */
    H.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = Bn(() => {
      this.#v();
    }, Ui);
  }
  #g() {
    try {
      this.#s = ye(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: i } = this.#b(t);
    Ye(i), n && (this.#l = ye(() => {
      n(
        this.#t,
        () => t,
        () => r
      );
    }));
  }
  /**
   * Creates the `reset` function for a failed boundary, along with a function
   * that invokes `onerror` with it (if provided)
   * @param {unknown} error
   * @returns {{ reset: () => void, invoke_onerror: () => void }}
   */
  #b(t) {
    var n = !1, r = !1;
    const i = () => {
      if (n) {
        Fi();
        return;
      }
      n = !0, r && ki(), this.#l !== null && lt(this.#l, () => {
        this.#l = null;
      }), this.#h(() => {
        this.#v();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, i), r = !1;
      } catch (l) {
        Xe(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = ye(() => t(this.#t)), Ye(() => {
      var n = this.#i = document.createDocumentFragment(), r = Je();
      n.append(r), this.#s = this.#h(() => ye(() => this.#o(r))), this.#u === 0 && (this.#t.before(n), this.#i = null, lt(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        G
      ));
    }));
  }
  #v() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#_ = 0, this.#s = ye(() => {
        this.#o(this.#t);
      }), this.#u > 0) {
        var t = this.#i = document.createDocumentFragment();
        Un(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = ye(() => n(this.#t));
      } else
        this.#w(
          /** @type {Batch} */
          G
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #w(t) {
    this.is_pending = !1, t.transfer_effects(this.#d, this.#p);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    br(t, this.#d, this.#p);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #h(t) {
    var n = H, r = B, i = de;
    Le(this.#r), Se(this.#r), yt(this.#r.ctx);
    try {
      return Qe.ensure(), t();
    } catch (s) {
      return gr(s), null;
    } finally {
      Le(n), Se(r), yt(i);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && lt(this.#n, () => {
      this.#n = null;
    }), this.#i && (this.#t.before(this.#i), this.#i = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#k(t, n), this.#_ += t, !(!this.#c || this.#f) && (this.#f = !0, Ye(() => {
      this.#f = !1, this.#c && xt(this.#c, this.#_);
    }));
  }
  get_effect_pending() {
    return this.#m(), u(
      /** @type {Source<number>} */
      this.#c
    );
  }
  /** @param {unknown} error */
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    G?.is_fork ? (this.#s && G.skip_effect(this.#s), this.#n && G.skip_effect(this.#n), this.#l && G.skip_effect(this.#l), G.oncommit(() => {
      this.#E(t);
    })) : this.#E(t);
  }
  /**
   * @param {unknown} error
   */
  #E(t) {
    this.#s && (pe(this.#s), this.#s = null), this.#n && (pe(this.#n), this.#n = null), this.#l && (pe(this.#l), this.#l = null);
    let n = this.#e.failed;
    const r = (i) => {
      const { reset: s, invoke_onerror: l } = this.#b(i);
      l(), n && (this.#l = this.#h(() => {
        try {
          return ye(() => {
            var o = (
              /** @type {Effect} */
              H
            );
            o.b = this, o.f |= En, n(
              this.#t,
              () => i,
              () => s
            );
          });
        } catch (o) {
          return Xe(
            o,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    Ye(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (s) {
        Xe(s, this.#r && this.#r.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof /** @type {any} */
      i.then == "function" ? i.then(
        r,
        /** @param {unknown} e */
        (s) => Xe(s, this.#r && this.#r.parent)
      ) : r(i);
    });
  }
}
function Yi(e, t, n, r) {
  const i = Lt;
  var s = e.filter((v) => !v.settled), l = t.map(i);
  if (n.length === 0 && s.length === 0) {
    r(l);
    return;
  }
  var o = (
    /** @type {Effect} */
    H
  ), a = Xi(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((v) => v.promise)) : null;
  function d(v) {
    if ((o.f & me) === 0) {
      a();
      try {
        r([...l, ...v]);
      } catch (p) {
        Xe(p, o);
      }
      tn();
    }
  }
  var _ = wr();
  if (n.length === 0) {
    f.then(() => d([])).finally(_);
    return;
  }
  function h() {
    Promise.all(n.map((v) => /* @__PURE__ */ Ki(v))).then(d).catch((v) => Xe(v, o)).finally(_);
  }
  f ? f.then(() => {
    a(), h(), tn();
  }) : h();
}
function Xi() {
  var e = (
    /** @type {Effect} */
    H
  ), t = B, n = de, r = (
    /** @type {Batch} */
    G
  );
  return function(s = !0) {
    Le(e), Se(t), yt(n), s && (e.f & me) === 0 && (r?.activate(), r?.apply());
  };
}
function tn(e = !0) {
  Le(null), Se(null), yt(null), e && G?.deactivate();
}
function wr() {
  var e = (
    /** @type {Effect} */
    H
  ), t = e.b, n = (
    /** @type {Batch} */
    G
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function Lt(e) {
  var t = oe | se;
  return H !== null && (H.f |= Tt), {
    ctx: de,
    deps: null,
    effects: null,
    equals: hr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      re
    ),
    wv: 0,
    parent: H,
    ac: null
  };
}
const Ct = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function Ki(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    H
  );
  r === null && vi();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = ft(
    /** @type {V} */
    re
  ), l = !B, o = /* @__PURE__ */ new Set();
  return us(() => {
    var a = (
      /** @type {Effect} */
      H
    ), f = fr();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, (v) => {
        v !== qt && f.reject(v);
      }).finally(tn);
    } catch (v) {
      f.reject(v), tn();
    }
    var d = (
      /** @type {Batch} */
      G
    );
    if (l) {
      if ((a.f & St) !== 0)
        var _ = wr();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        d.async_deriveds.get(a)?.reject(Ct);
      else
        for (const v of o.values())
          v.reject(Ct);
      o.add(f), d.async_deriveds.set(a, f);
    }
    const h = (v, p = void 0) => {
      _?.(), o.delete(f), p !== Ct && (d.activate(), p ? (s.f |= We, xt(s, p)) : ((s.f & We) !== 0 && (s.f ^= We), xt(s, v)), d.deactivate());
    };
    f.promise.then(h, (v) => h(null, v || "unknown"));
  }), Or(() => {
    for (const a of o)
      a.reject(Ct);
  }), new Promise((a) => {
    function f(d) {
      function _() {
        d === i ? a(s) : f(i);
      }
      d.then(_, _);
    }
    f(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Te(e) {
  const t = /* @__PURE__ */ Lt(e);
  return jr(t), t;
}
// @__NO_SIDE_EFFECTS__
function yr(e) {
  const t = /* @__PURE__ */ Lt(e);
  return t.equals = _r, t;
}
function Wi(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      pe(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Fn(e) {
  var t, n = H, r = e.parent;
  if (!je && r !== null && e.v !== re && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (me | ve)) !== 0)
    return Li(), e.v;
  Le(r);
  try {
    e.f &= ~ut, Wi(e), t = Gr(e);
  } finally {
    Le(n);
  }
  return t;
}
function xr(e) {
  var t = Fn(e);
  if (!e.equals(t) && (e.wv = zr(), (!G?.is_fork || e.deps === null) && (G !== null ? (G.capture(e, t, !0), Rn?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    te(e, ie);
    return;
  }
  je || (Re !== null ? (jn() || G?.is_fork) && Re.set(e, t) : Dn(e));
}
function Ji(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && fn(() => {
        t.ac.abort(qt), t.ac = null;
      }), t.fn !== null && (t.teardown = si), Dt(t, 0), zn(t));
}
function kr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && kt(t);
}
let yn = null, dt = null, G = null, Rn = null, Re = null, Mn = null, xn = !1, pt = null, Jt = null;
var Vn = 0;
let Zi = 1;
class Qe {
  id = Zi++;
  /** True as soon as `#process` was called */
  #t = !1;
  linked = !0;
  /** @type {Batch | null} */
  #a = null;
  /** @type {Batch | null} */
  #e = null;
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
  #o = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #r = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #s = 0;
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
  #l = null;
  /**
   * The root effects that need to be flushed
   * @type {Effect[]}
   */
  #i = [];
  /**
   * Effects created while this batch was active.
   * @type {Effect[]}
   */
  #_ = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #u = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #f = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #d = /* @__PURE__ */ new Map();
  /**
   * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
   * @type {Set<Effect>}
   */
  #p = /* @__PURE__ */ new Set();
  is_fork = !1;
  #c = !1;
  constructor() {
    dt === null ? yn = dt = this : (dt.#e = this, this.#a = dt), dt = this;
  }
  #m() {
    if (this.is_fork) return !0;
    for (const r of this.#n.keys()) {
      for (var t = r, n = !1; t.parent !== null; ) {
        if (this.#d.has(t)) {
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
    this.#d.has(t) || this.#d.set(t, { d: [], m: [] }), this.#p.delete(t);
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   * @param {(e: Effect) => void} callback
   */
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#d.get(t);
    if (r) {
      this.#d.delete(t);
      for (var i of r.d)
        te(i, se), n(i);
      for (i of r.m)
        te(i, Ce), n(i);
    }
    this.#p.add(t);
  }
  #g() {
    this.#t = !0, Vn++ > 1e3 && (this.#h(), Qi());
    for (const a of this.#u)
      this.#f.delete(a), te(a, se), this.schedule(a);
    for (const a of this.#f)
      te(a, Ce), this.schedule(a);
    const t = this.#i;
    this.#i = [], this.apply();
    var n = pt = [], r = [], i = Jt = [];
    for (const a of t)
      try {
        this.#y(a, n, r);
      } catch (f) {
        throw Tr(a), this.#m() || this.discard(), f;
      }
    if (G = null, i.length > 0) {
      var s = Qe.ensure();
      for (const a of i)
        s.schedule(a);
    }
    if (pt = null, Jt = null, this.#m()) {
      this.#v(r), this.#v(n);
      for (const [a, f] of this.#d)
        Sr(a, f);
      i.length > 0 && /** @type {unknown} */
      G.#g();
      return;
    }
    const l = this.#b();
    if (l) {
      this.#v(r), this.#v(n), l.#x(this);
      return;
    }
    this.#u.clear(), this.#f.clear();
    for (const a of this.#o) a(this);
    this.#o.clear(), Rn = this, Yn(r), Yn(n), Rn = null, this.#l?.resolve();
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      G
    );
    if (this.#s === 0 && (this.#i.length === 0 || o !== null) && this.#h(), this.#i.length > 0)
      if (o !== null) {
        const a = o;
        a.#i.push(...this.#i.filter((f) => !a.#i.includes(f)));
      } else
        o = this;
    o !== null && o.#g();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #y(t, n, r) {
    t.f ^= ie;
    for (var i = t.first; i !== null; ) {
      var s = i.f, l = (s & (Ee | He)) !== 0, o = l && (s & ie) !== 0, a = o || (s & ve) !== 0 || this.#d.has(i);
      if (!a && i.fn !== null) {
        l ? i.f ^= ie : (s & bt) !== 0 ? n.push(i) : jt(i) && ((s & Ae) !== 0 && this.#f.add(i), kt(i));
        var f = i.first;
        if (f !== null) {
          i = f;
          continue;
        }
      }
      for (; i !== null; ) {
        var d = i.next;
        if (d !== null) {
          i = d;
          break;
        }
        i = i.parent;
      }
    }
  }
  #b() {
    for (var t = this.#a; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, r]] of this.current)
          if (t.current.has(n) && !r)
            return t;
      }
      t = t.#a;
    }
    return null;
  }
  /**
   * @param {Batch} batch
   */
  #x(t) {
    for (const [r, i] of t.current)
      !this.previous.has(r) && t.previous.has(r) && this.previous.set(r, t.previous.get(r)), this.current.set(r, i);
    for (const [r, i] of t.async_deriveds) {
      const s = this.async_deriveds.get(r);
      s && i.promise.then(s.resolve).catch(s.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#u, t.#f);
    const n = (r) => {
      var i = r.reactions;
      if (i !== null && !((r.f & oe) !== 0 && (r.f & (se | Ce)) === 0))
        for (const o of i) {
          var s = o.f;
          if ((s & oe) !== 0)
            n(
              /** @type {Derived} */
              o
            );
          else {
            var l = (
              /** @type {Effect} */
              o
            );
            s & (mt | Ae) && !this.async_deriveds.has(l) && (this.#f.delete(l), te(l, se), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#h(), G = this, this.#g();
  }
  /**
   * @param {Effect[]} effects
   */
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      br(t[n], this.#u, this.#f);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== re && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & We) === 0 && (this.current.set(t, [n, r]), Re?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    G = this;
  }
  deactivate() {
    G = null, Re = null;
  }
  flush() {
    try {
      xn = !0, G = this, this.#g();
    } finally {
      Vn = 0, Mn = null, pt = null, Jt = null, xn = !1, G = null, Re = null, at.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Ct);
    this.#h(), this.#l?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#_.push(t);
  }
  #w() {
    for (let _ = yn; _ !== null; _ = _.#e) {
      var t = _.id < this.id, n = [];
      for (const [h, [v, p]] of this.current) {
        if (_.current.has(h)) {
          var r = (
            /** @type {[any, boolean]} */
            _.current.get(h)[0]
          );
          if (t && v !== r)
            _.current.set(h, [v, p]);
          else
            continue;
        }
        n.push(h);
      }
      if (t)
        for (const [h, v] of this.async_deriveds) {
          const p = _.async_deriveds.get(h);
          p && v.promise.then(p.resolve).catch(p.reject);
        }
      var i = [..._.current.keys()].filter(
        (h) => !/** @type {[any, boolean]} */
        _.current.get(h)[1]
      );
      if (!(!_.#t || i.length === 0)) {
        var s = i.filter((h) => !this.current.has(h));
        if (s.length === 0)
          t && _.discard();
        else if (n.length > 0) {
          if (t)
            for (const h of this.#p)
              _.unskip_effect(h, (v) => {
                (v.f & (Ae | mt)) !== 0 ? _.schedule(v) : _.#v([v]);
              });
          _.activate();
          var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
          for (var a of n)
            Er(a, s, l, o);
          o = /* @__PURE__ */ new Map();
          var f = [..._.current].filter(([h, v]) => {
            const p = this.current.get(h);
            return p ? p[0] !== v[0] || p[1] !== v[1] : !0;
          }).map(([h]) => h);
          if (f.length > 0)
            for (const h of this.#_)
              (h.f & (me | ve | $t)) === 0 && qn(h, f, o) && ((h.f & (mt | Ae)) !== 0 ? (te(h, se), _.schedule(h)) : _.#u.add(h));
          if (_.#i.length > 0 && !_.#c) {
            _.apply();
            for (var d of _.#i)
              _.#y(d, [], []);
            _.#i = [];
          }
          _.deactivate();
        }
      }
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    if (this.#s += 1, t) {
      let r = this.#n.get(n) ?? 0;
      this.#n.set(n, r + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  decrement(t, n) {
    if (this.#s -= 1, t) {
      let r = this.#n.get(n) ?? 0;
      r === 1 ? this.#n.delete(n) : this.#n.set(n, r - 1);
    }
    this.#c || (this.#c = !0, Ye(() => {
      this.#c = !1, this.linked && this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const r of t)
      this.#u.add(r);
    for (const r of n)
      this.#f.add(r);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#o.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#r.add(t);
  }
  settled() {
    return (this.#l ??= fr()).promise;
  }
  static ensure() {
    if (G === null) {
      const t = G = new Qe();
      xn || Ye(() => {
        t.#t || t.flush();
      });
    }
    return G;
  }
  apply() {
    {
      Re = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Mn = t, t.b?.is_pending && (t.f & (bt | un | cr)) !== 0 && (t.f & St) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (pt !== null && n === H && (B === null || (B.f & oe) === 0))
        return;
      if ((r & (He | Ee)) !== 0) {
        if ((r & ie) === 0)
          return;
        n.f ^= ie;
      }
    }
    this.#i.push(n);
  }
  #h() {
    if (this.linked) {
      var t = this.#a, n = this.#e;
      t === null ? yn = n : t.#e = n, n === null ? dt = t : n.#a = t, this.linked = !1;
    }
  }
}
function Qi() {
  try {
    mi();
  } catch (e) {
    Xe(e, Mn);
  }
}
let Fe = null;
function Yn(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (me | ve)) === 0 && jt(r) && (Fe = /* @__PURE__ */ new Set(), kt(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Fr(r), Fe?.size > 0)) {
        at.clear();
        for (const i of Fe) {
          if ((i.f & (me | ve)) !== 0) continue;
          const s = [i];
          let l = i.parent;
          for (; l !== null; )
            Fe.has(l) && (Fe.delete(l), s.push(l)), l = l.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const a = s[o];
            (a.f & (me | ve)) === 0 && kt(a);
          }
        }
        Fe.clear();
      }
    }
    Fe = null;
  }
}
function Er(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & oe) !== 0 ? Er(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (mt | Ae)) !== 0 && (s & se) === 0 && qn(i, t, r) && (te(i, se), Hn(
        /** @type {Effect} */
        i
      ));
    }
}
function qn(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (Qt.call(t, i))
        return !0;
      if ((i.f & oe) !== 0 && qn(
        /** @type {Derived} */
        i,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          i,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function Hn(e) {
  G.schedule(e);
}
function Sr(e, t) {
  if (!((e.f & Ee) !== 0 && (e.f & ie) !== 0)) {
    (e.f & se) !== 0 ? t.d.push(e) : (e.f & Ce) !== 0 && t.m.push(e), te(e, ie);
    for (var n = e.first; n !== null; )
      Sr(n, t), n = n.next;
  }
}
function Tr(e) {
  te(e, ie);
  for (var t = e.first; t !== null; )
    Tr(t), t = t.next;
}
let nn = /* @__PURE__ */ new Set();
const at = /* @__PURE__ */ new Map();
let Ar = !1;
function ft(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: hr,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function K(e, t) {
  const n = ft(e);
  return jr(n), n;
}
// @__NO_SIDE_EFFECTS__
function $i(e, t = !1, n = !0) {
  const r = ft(e);
  return t || (r.equals = _r), r;
}
function A(e, t, n = !1) {
  B !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Me || (B.f & $t) !== 0) && pr() && (B.f & (oe | Ae | mt | $t)) !== 0 && (Pe === null || !Pe.has(e)) && xi();
  let r = n ? Ke(t) : t;
  return xt(e, r, Jt);
}
function xt(e, t, n = null) {
  if (!e.equals(t)) {
    at.set(e, je ? t : e.v);
    var r = Qe.ensure();
    if (r.capture(e, t), (e.f & oe) !== 0) {
      const i = (
        /** @type {Derived} */
        e
      );
      (e.f & se) !== 0 && Fn(i), Re === null && Dn(i);
    }
    e.wv = zr(), Rr(e, se, n), H !== null && (H.f & ie) !== 0 && (H.f & (Ee | He)) === 0 && (we === null ? ds([e]) : we.push(e)), !r.is_fork && nn.size > 0 && !Ar && es();
  }
  return t;
}
function es() {
  Ar = !1;
  for (const e of nn) {
    (e.f & ie) !== 0 && te(e, Ce);
    let t;
    try {
      t = jt(e);
    } catch {
      t = !0;
    }
    t && kt(e);
  }
  nn.clear();
}
function Pt(e) {
  A(e, e.v + 1);
}
function Rr(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var l = r[s], o = l.f, a = (o & se) === 0;
      if (a && te(l, t), (o & $t) !== 0)
        nn.add(
          /** @type {Effect} */
          l
        );
      else if ((o & oe) !== 0) {
        var f = (
          /** @type {Derived} */
          l
        );
        Re?.delete(f), (o & ut) === 0 && (o & ke && (H === null || (H.f & en) === 0) && (l.f |= ut), Rr(f, Ce, n));
      } else if (a) {
        var d = (
          /** @type {Effect} */
          l
        );
        (o & Ae) !== 0 && Fe !== null && Fe.add(d), n !== null ? n.push(d) : Hn(d);
      }
    }
}
function Ke(e) {
  if (typeof e != "object" || e === null || st in e)
    return e;
  const t = ii(e);
  if (t !== ni && t !== ri)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ln(e), i = /* @__PURE__ */ K(0), s = ot, l = (o) => {
    if (ot === s)
      return o();
    var a = B, f = ot;
    Se(null), Jn(s);
    var d = o();
    return Se(a), Jn(f), d;
  };
  return r && n.set("length", /* @__PURE__ */ K(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, a, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && wi();
        var d = n.get(a);
        return d === void 0 ? l(() => {
          var _ = /* @__PURE__ */ K(f.value);
          return n.set(a, _), _;
        }) : A(d, f.value, !0), !0;
      },
      deleteProperty(o, a) {
        var f = n.get(a);
        if (f === void 0) {
          if (a in o) {
            const d = l(() => /* @__PURE__ */ K(re));
            n.set(a, d), Pt(i);
          }
        } else
          A(f, re), Pt(i);
        return !0;
      },
      get(o, a, f) {
        if (a === st)
          return e;
        var d = n.get(a), _ = a in o;
        if (d === void 0 && (!_ || gt(o, a)?.writable) && (d = l(() => {
          var v = Ke(_ ? o[a] : re), p = /* @__PURE__ */ K(v);
          return p;
        }), n.set(a, d)), d !== void 0) {
          var h = u(d);
          return h === re ? void 0 : h;
        }
        return Reflect.get(o, a, f);
      },
      getOwnPropertyDescriptor(o, a) {
        var f = Reflect.getOwnPropertyDescriptor(o, a);
        if (f && "value" in f) {
          var d = n.get(a);
          d && (f.value = u(d));
        } else if (f === void 0) {
          var _ = n.get(a), h = _?.v;
          if (_ !== void 0 && h !== re)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return f;
      },
      has(o, a) {
        if (a === st)
          return !0;
        var f = n.get(a), d = f !== void 0 && f.v !== re || Reflect.has(o, a);
        if (f !== void 0 || H !== null && (!d || gt(o, a)?.writable)) {
          f === void 0 && (f = l(() => {
            var h = d ? Ke(o[a]) : re, v = /* @__PURE__ */ K(h);
            return v;
          }), n.set(a, f));
          var _ = u(f);
          if (_ === re)
            return !1;
        }
        return d;
      },
      set(o, a, f, d) {
        var _ = n.get(a), h = a in o;
        if (r && a === "length")
          for (var v = f; v < /** @type {Source<number>} */
          _.v; v += 1) {
            var p = n.get(v + "");
            p !== void 0 ? A(p, re) : v in o && (p = l(() => /* @__PURE__ */ K(re)), n.set(v + "", p));
          }
        if (_ === void 0)
          (!h || gt(o, a)?.writable) && (_ = l(() => /* @__PURE__ */ K(void 0)), A(_, Ke(f)), n.set(a, _));
        else {
          h = _.v !== re;
          var m = l(() => Ke(f));
          A(_, m);
        }
        var g = Reflect.getOwnPropertyDescriptor(o, a);
        if (g?.set && g.set.call(d, f), !h) {
          if (r && typeof a == "string") {
            var c = (
              /** @type {Source<number>} */
              n.get("length")
            ), b = Number(a);
            Number.isInteger(b) && b >= c.v && A(c, b + 1);
          }
          Pt(i);
        }
        return !0;
      },
      ownKeys(o) {
        u(i);
        var a = Reflect.ownKeys(o).filter((_) => {
          var h = n.get(_);
          return h === void 0 || h.v !== re;
        });
        for (var [f, d] of n)
          d.v !== re && !(f in o) && a.push(f);
        return a;
      },
      setPrototypeOf() {
        yi();
      }
    }
  );
}
function Xn(e) {
  try {
    if (e !== null && typeof e == "object" && st in e)
      return e[st];
  } catch {
  }
  return e;
}
function ts(e, t) {
  return Object.is(Xn(e), Xn(t));
}
var Kn, Mr, Cr, Nr;
function ns() {
  if (Kn === void 0) {
    Kn = window, Mr = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Cr = gt(t, "firstChild").get, Nr = gt(t, "nextSibling").get, Gn(e) && (e[Tn] = void 0, e[dr] = null, e[fi] = void 0, e.__e = void 0), Gn(n) && (n[An] = void 0);
  }
}
function Je(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function rn(e) {
  return (
    /** @type {TemplateNode | null} */
    Cr.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ht(e) {
  return (
    /** @type {TemplateNode | null} */
    Nr.call(e)
  );
}
function w(e, t) {
  return /* @__PURE__ */ rn(e);
}
function Ie(e, t = !1) {
  {
    var n = /* @__PURE__ */ rn(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Ht(n) : n;
  }
}
function E(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ht(r);
  return r;
}
function rs(e) {
  e.textContent = "";
}
function Ir() {
  return !1;
}
function is(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function ss(e) {
  H === null && (B === null && gi(), pi()), je && _i();
}
function as(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Be(e, t) {
  var n = H;
  n !== null && (n.f & ve) !== 0 && (e |= ve);
  var r = {
    ctx: de,
    deps: null,
    nodes: null,
    f: e | se | ke,
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
  G?.register_created_effect(r);
  var i = r;
  if ((e & bt) !== 0)
    pt !== null ? pt.push(r) : Qe.ensure().schedule(r);
  else if (t !== null) {
    try {
      kt(r);
    } catch (l) {
      throw pe(r), l;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Tt) === 0 && (i = i.first, (e & Ae) !== 0 && (e & wt) !== 0 && i !== null && (i.f |= wt));
  }
  if (i !== null && (i.parent = n, n !== null && as(i, n), B !== null && (B.f & oe) !== 0 && (e & He) === 0)) {
    var s = (
      /** @type {Derived} */
      B
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function jn() {
  return B !== null && !Me;
}
function Or(e) {
  const t = Be(un, null);
  return te(t, ie), t.teardown = e, t;
}
function sn(e) {
  ss();
  var t = (
    /** @type {Effect} */
    H.f
  ), n = !B && (t & Ee) !== 0 && de !== null && !de.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      de
    );
    (r.e ??= []).push(e);
  } else
    return Pr(e);
}
function Pr(e) {
  return Be(bt | oi, e);
}
function ls(e) {
  Qe.ensure();
  const t = Be(He | Tt, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? lt(t, () => {
      pe(t), r(void 0);
    }) : (pe(t), r(void 0));
  });
}
function os(e) {
  return Be(bt, e);
}
function us(e) {
  return Be(mt | Tt, e);
}
function Lr(e, t = 0) {
  return Be(un | t, e);
}
function V(e, t = [], n = [], r = []) {
  Yi(r, t, n, (i) => {
    Be(un, () => {
      e(...i.map(u));
    });
  });
}
function Bn(e, t = 0) {
  var n = Be(Ae | t, e);
  return n;
}
function ye(e) {
  return Be(Ee | Tt, e);
}
function Dr(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = je, r = B;
    Wn(!0), Se(null);
    try {
      t.call(null);
    } finally {
      Wn(n), Se(r);
    }
  }
}
function zn(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && fn(() => {
      i.abort(qt);
    });
    var r = n.next;
    (n.f & He) !== 0 ? n.parent = null : pe(n, t), n = r;
  }
}
function fs(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Ee) === 0 && pe(t), t = n;
  }
}
function pe(e, t = !0) {
  var n = !1;
  (t || (e.f & li) !== 0) && e.nodes !== null && e.nodes.end !== null && (cs(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Sn, zn(e, t && !n), Dt(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dr(e), e.f ^= Sn, e.f |= me;
  var i = e.parent;
  i !== null && i.first !== null && Fr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function cs(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ht(e);
    e.remove(), e = n;
  }
}
function Fr(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function lt(e, t, n = !0) {
  var r = [];
  qr(e, r, !0);
  var i = () => {
    n && pe(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var l = () => --s || i();
    for (var o of r)
      o.out(l);
  } else
    i();
}
function qr(e, t, n) {
  if ((e.f & ve) === 0) {
    e.f ^= ve;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const o of r)
        (o.is_global || n) && t.push(o);
    for (var i = e.first; i !== null; ) {
      var s = i.next;
      if ((i.f & He) === 0) {
        var l = (i.f & wt) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (i.f & Ee) !== 0 && (e.f & Ae) !== 0;
        qr(i, t, l ? n : !1);
      }
      i = s;
    }
  }
}
function an(e) {
  Hr(e, !0);
}
function Hr(e, t) {
  if ((e.f & ve) !== 0) {
    e.f ^= ve, (e.f & ie) === 0 && (te(e, se), Qe.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & wt) !== 0 || (n.f & Ee) !== 0;
      Hr(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const l of s)
        (l.is_global || t) && l.in();
  }
}
function Un(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ht(n);
      t.append(n), n = i;
    }
}
let Zt = !1, je = !1;
function Wn(e) {
  je = e;
}
let B = null, Me = !1;
function Se(e) {
  B = e;
}
let H = null;
function Le(e) {
  H = e;
}
let Pe = null;
function jr(e) {
  B !== null && (Pe ??= /* @__PURE__ */ new Set()).add(e);
}
let _e = null, ge = 0, we = null;
function ds(e) {
  we = e;
}
let Br = 1, it = 0, ot = it;
function Jn(e) {
  ot = e;
}
function zr() {
  return ++Br;
}
function jt(e) {
  var t = e.f;
  if ((t & se) !== 0)
    return !0;
  if (t & oe && (e.f &= ~ut), (t & Ce) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (jt(
        /** @type {Derived} */
        s
      ) && xr(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & ke) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Re === null && te(e, ie);
  }
  return !1;
}
function Ur(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Pe !== null && Pe.has(e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & oe) !== 0 ? Ur(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? te(s, se) : (s.f & ie) !== 0 && te(s, Ce), Hn(
        /** @type {Effect} */
        s
      ));
    }
}
function Gr(e) {
  var t = _e, n = ge, r = we, i = B, s = Pe, l = de, o = Me, a = ot, f = e.f;
  _e = /** @type {null | Value[]} */
  null, ge = 0, we = null, B = (f & (Ee | He)) === 0 ? e : null, Pe = null, yt(e.ctx), Me = !1, ot = ++it, e.ac !== null && (fn(() => {
    e.ac.abort(qt);
  }), e.ac = null);
  try {
    e.f |= en;
    var d = (
      /** @type {Function} */
      e.fn
    ), _ = d();
    e.f |= St;
    var h = e.deps, v = G?.is_fork;
    if (_e !== null) {
      var p;
      if (v || Dt(e, ge), h !== null && ge > 0)
        for (h.length = ge + _e.length, p = 0; p < _e.length; p++)
          h[ge + p] = _e[p];
      else
        e.deps = h = _e;
      if (jn() && (e.f & ke) !== 0)
        for (p = ge; p < h.length; p++)
          (h[p].reactions ??= []).push(e);
    } else !v && h !== null && ge < h.length && (Dt(e, ge), h.length = ge);
    if (pr() && we !== null && !Me && h !== null && (e.f & (oe | Ce | se)) === 0)
      for (p = 0; p < /** @type {Source[]} */
      we.length; p++)
        Ur(
          we[p],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (it++, i.deps !== null)
        for (let m = 0; m < n; m += 1)
          i.deps[m].rv = it;
      if (t !== null)
        for (const m of t)
          m.rv = it;
      we !== null && (r === null ? r = we : r.push(.../** @type {Source[]} */
      we));
    }
    return (e.f & We) !== 0 && (e.f ^= We), _;
  } catch (m) {
    return gr(m);
  } finally {
    e.f ^= en, _e = t, ge = n, we = r, B = i, Pe = s, yt(l), Me = o, ot = a;
  }
}
function vs(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = ei.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & oe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (_e === null || !Qt.call(_e, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & ke) !== 0 && (s.f ^= ke, s.f &= ~ut), s.v !== re && Dn(s), s.ac !== null && fn(() => {
      s.ac.abort(qt), s.ac = null, te(s, se);
    }), Ji(s), Dt(s, 0);
  }
}
function Dt(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      vs(e, n[r]);
}
function kt(e) {
  var t = e.f;
  if ((t & me) === 0) {
    te(e, ie);
    var n = H, r = Zt;
    H = e, Zt = (t & (Ee | He)) === 0;
    try {
      (t & (Ae | cr)) !== 0 ? fs(e) : zn(e), Dr(e);
      var i = Gr(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Br;
      var s;
    } finally {
      Zt = r, H = n;
    }
  }
}
function u(e) {
  var t = e.f, n = (t & oe) !== 0;
  if (B !== null && !Me) {
    var r = H !== null && (H.f & me) !== 0;
    if (!r && (Pe === null || !Pe.has(e))) {
      var i = B.deps;
      if ((B.f & en) !== 0)
        e.rv < it && (e.rv = it, _e === null && i !== null && i[ge] === e ? ge++ : _e === null ? _e = [e] : _e.push(e));
      else {
        B.deps ??= [], Qt.call(B.deps, e) || B.deps.push(e);
        var s = e.reactions;
        s === null ? e.reactions = [B] : Qt.call(s, B) || s.push(B);
      }
    }
  }
  if (je && at.has(e))
    return at.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (je) {
      var o = l.v;
      return ((l.f & ie) === 0 && l.reactions !== null || Yr(l)) && (o = Fn(l)), at.set(l, o), o;
    }
    var a = (l.f & ke) === 0 && !Me && B !== null && (Zt || (B.f & ke) !== 0), f = (l.f & St) === 0;
    jt(l) && (a && (l.f |= ke), xr(l)), a && !f && (kr(l), Vr(l));
  }
  if (Re?.has(e))
    return Re.get(e);
  if ((e.f & We) !== 0)
    throw e.v;
  return e.v;
}
function Vr(e) {
  if (e.f |= ke, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & oe) !== 0 && (t.f & ke) === 0 && (kr(
        /** @type {Derived} */
        t
      ), Vr(
        /** @type {Derived} */
        t
      ));
}
function Yr(e) {
  if (e.v === re) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (at.has(t) || (t.f & oe) !== 0 && Yr(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Et(e) {
  var t = Me;
  try {
    return Me = !0, e();
  } finally {
    Me = t;
  }
}
const hs = ["touchstart", "touchmove"];
function _s(e) {
  return hs.includes(e);
}
const Nt = Symbol("events"), Xr = /* @__PURE__ */ new Set(), Cn = /* @__PURE__ */ new Set();
function ae(e, t, n) {
  (t[Nt] ??= {})[e] = n;
}
function At(e) {
  for (var t = 0; t < e.length; t++)
    Xr.add(e[t]);
  for (var n of Cn)
    n(e);
}
let Zn = null;
function Qn(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Zn = e;
  var l = 0, o = Zn === e && e[Nt];
  if (o) {
    var a = i.indexOf(o);
    if (a !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Nt] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    a <= f && (l = a);
  }
  if (s = /** @type {Element} */
  i[l] || e.target, s !== t) {
    ti(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var d = B, _ = H;
    Se(null), Le(null);
    try {
      for (var h, v = []; s !== null && s !== t; ) {
        try {
          var p = s[Nt]?.[r];
          p != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && p.call(s, e);
        } catch (m) {
          h ? v.push(m) : h = m;
        }
        if (e.cancelBubble) break;
        l++, s = l < i.length ? (
          /** @type {Element} */
          i[l]
        ) : null;
      }
      if (h) {
        for (let m of v)
          queueMicrotask(() => {
            throw m;
          });
        throw h;
      }
    } finally {
      e[Nt] = t, delete e.currentTarget, Se(d), Le(_);
    }
  }
}
const ps = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function gs(e) {
  return (
    /** @type {string} */
    ps?.createHTML(e) ?? e
  );
}
function ms(e) {
  var t = is("template");
  return t.innerHTML = gs(e.replaceAll("<!>", "<!---->")), t.content;
}
function Nn(e, t) {
  var n = (
    /** @type {Effect} */
    H
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function D(e, t) {
  var n = (t & Ii) !== 0, r = (t & Oi) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = ms(s ? e : "<!>" + e), n || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ rn(i)));
    var l = (
      /** @type {TemplateNode} */
      r || Mr ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ rn(l)
      ), a = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      Nn(o, a);
    } else
      Nn(l, l);
    return l;
  };
}
function Kr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Je();
  return e.append(t, n), Nn(t, n), e;
}
function O(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function M(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[An] ??= e.nodeValue) && (e[An] = n, e.nodeValue = `${n}`);
}
function bs(e, t) {
  return ws(e, t);
}
const Kt = /* @__PURE__ */ new Map();
function ws(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: l = !0, transformError: o }) {
  ns();
  var a = void 0, f = ls(() => {
    var d = n ?? t.appendChild(Je());
    Gi(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (v) => {
        $e({});
        var p = (
          /** @type {ComponentContext} */
          de
        );
        s && (p.c = s), i && (r.$$events = i), a = e(v, r) || {}, et();
      },
      o
    );
    var _ = /* @__PURE__ */ new Set(), h = (v) => {
      for (var p = 0; p < v.length; p++) {
        var m = v[p];
        if (!_.has(m)) {
          _.add(m);
          var g = _s(m);
          for (const T of [t, document]) {
            var c = Kt.get(T);
            c === void 0 && (c = /* @__PURE__ */ new Map(), Kt.set(T, c));
            var b = c.get(m);
            b === void 0 ? (T.addEventListener(m, Qn, { passive: g }), c.set(m, 1)) : c.set(m, b + 1);
          }
        }
      }
    };
    return h(on(Xr)), Cn.add(h), () => {
      for (var v of _)
        for (const g of [t, document]) {
          var p = (
            /** @type {Map<string, number>} */
            Kt.get(g)
          ), m = (
            /** @type {number} */
            p.get(v)
          );
          --m == 0 ? (g.removeEventListener(v, Qn), p.delete(v), p.size === 0 && Kt.delete(g)) : p.set(v, m);
        }
      Cn.delete(h), d !== n && d.parentNode?.removeChild(d);
    };
  });
  return ys.set(a, f), a;
}
let ys = /* @__PURE__ */ new WeakMap();
class xs {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #t = /* @__PURE__ */ new Map();
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
  #a = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #e = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #o = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #r = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#r = n;
  }
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    if (this.#t.has(t)) {
      var n = (
        /** @type {Key} */
        this.#t.get(t)
      ), r = this.#a.get(n);
      if (r)
        an(r), this.#o.delete(n);
      else {
        var i = this.#e.get(n);
        i && (an(i.effect), this.#a.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, l] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const o = this.#e.get(l);
        o && (pe(o.effect), this.#e.delete(l));
      }
      for (const [s, l] of this.#a) {
        if (s === n || this.#o.has(s)) continue;
        const o = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var f = document.createDocumentFragment();
            Un(l, f), f.append(Je()), this.#e.set(s, { effect: l, fragment: f });
          } else
            pe(l);
          this.#o.delete(s), this.#a.delete(s);
        };
        this.#r || !r ? (this.#o.add(s), lt(l, o, !1)) : o();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (pe(i.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      G
    ), i = Ir();
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), l = Je();
        s.append(l), this.#e.set(t, {
          effect: ye(() => n(l)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          ye(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [o, a] of this.#a)
        o === t ? r.unskip_effect(a) : r.skip_effect(a);
      for (const [o, a] of this.#e)
        o === t ? r.unskip_effect(a.effect) : r.skip_effect(a.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function Q(e, t, n = !1) {
  var r = new xs(e), i = n ? wt : 0;
  function s(l, o) {
    r.ensure(l, o);
  }
  Bn(() => {
    var l = !1;
    t((o, a = 0) => {
      l = !0, s(a, o);
    }), l || s(-1, null);
  }, i);
}
function In(e, t) {
  return t;
}
function ks(e, t, n) {
  for (var r = [], i = t.length, s, l = t.length, o = 0; o < i; o++) {
    let _ = t[o];
    lt(
      _,
      () => {
        if (s) {
          if (s.pending.delete(_), s.done.add(_), s.pending.size === 0) {
            var h = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            On(e, on(s.done)), h.delete(s), h.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var a = r.length === 0 && n !== null;
    if (a) {
      var f = (
        /** @type {Element} */
        n
      ), d = (
        /** @type {Element} */
        f.parentNode
      );
      rs(d), d.append(f), e.items.clear();
    }
    On(e, t, !a);
  } else
    s = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(s);
}
function On(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const l of e.pending.values())
      for (const o of l)
        r.add(
          /** @type {EachItem} */
          e.items.get(o).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var s = t[i];
    if (r?.has(s)) {
      s.f |= Oe;
      const l = document.createDocumentFragment();
      Un(s, l);
    } else
      pe(t[i], n);
  }
}
var $n;
function Ft(e, t, n, r, i, s = null) {
  var l = e, o = /* @__PURE__ */ new Map(), a = (t & vr) !== 0;
  if (a) {
    var f = (
      /** @type {Element} */
      e
    );
    l = f.appendChild(Je());
  }
  var d = null, _ = /* @__PURE__ */ yr(() => {
    var T = n();
    return (
      /** @type {V[]} */
      Ln(T) ? T : T == null ? [] : on(T)
    );
  }), h, v = /* @__PURE__ */ new Map(), p = !0;
  function m(T) {
    (b.effect.f & me) === 0 && (b.pending.delete(T), b.fallback = d, Es(b, h, l, t, r), d !== null && (h.length === 0 ? (d.f & Oe) === 0 ? an(d) : (d.f ^= Oe, It(d, null, l)) : lt(d, () => {
      d = null;
    })));
  }
  function g(T) {
    b.pending.delete(T);
  }
  var c = Bn(() => {
    h = /** @type {V[]} */
    u(_);
    for (var T = h.length, S = /* @__PURE__ */ new Set(), F = (
      /** @type {Batch} */
      G
    ), j = Ir(), P = 0; P < T; P += 1) {
      var L = h[P], N = r(L, P), C = p ? null : o.get(N);
      C ? (C.v && xt(C.v, L), C.i && xt(C.i, P), j && F.unskip_effect(C.e)) : (C = Ss(
        o,
        p ? l : $n ??= Je(),
        L,
        N,
        P,
        i,
        t,
        n
      ), p || (C.e.f |= Oe), o.set(N, C)), S.add(N);
    }
    if (T === 0 && s && !d && (p ? d = ye(() => s(l)) : (d = ye(() => s($n ??= Je())), d.f |= Oe)), T > S.size && hi(), !p)
      if (v.set(F, S), j) {
        for (const [W, U] of o)
          S.has(W) || F.skip_effect(U.e);
        F.oncommit(m), F.ondiscard(g);
      } else
        m(F);
    u(_);
  }), b = { effect: c, items: o, pending: v, outrogroups: null, fallback: d };
  p = !1;
}
function Mt(e) {
  for (; e !== null && (e.f & Ee) === 0; )
    e = e.next;
  return e;
}
function Es(e, t, n, r, i) {
  var s = (r & Ti) !== 0, l = t.length, o = e.items, a = Mt(e.effect.first), f, d = null, _, h = [], v = [], p, m, g, c;
  if (s)
    for (c = 0; c < l; c += 1)
      p = t[c], m = i(p, c), g = /** @type {EachItem} */
      o.get(m).e, (g.f & Oe) === 0 && (g.nodes?.a?.measure(), (_ ??= /* @__PURE__ */ new Set()).add(g));
  for (c = 0; c < l; c += 1) {
    if (p = t[c], m = i(p, c), g = /** @type {EachItem} */
    o.get(m).e, e.outrogroups !== null)
      for (const C of e.outrogroups)
        C.pending.delete(g), C.done.delete(g);
    if ((g.f & ve) !== 0 && (an(g), s && (g.nodes?.a?.unfix(), (_ ??= /* @__PURE__ */ new Set()).delete(g))), (g.f & Oe) !== 0)
      if (g.f ^= Oe, g === a)
        It(g, null, n);
      else {
        var b = d ? d.next : a;
        g === e.effect.last && (e.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), Ve(e, d, g), Ve(e, g, b), It(g, b, n), d = g, h = [], v = [], a = Mt(d.next);
        continue;
      }
    if (g !== a) {
      if (f !== void 0 && f.has(g)) {
        if (h.length < v.length) {
          var T = v[0], S;
          d = T.prev;
          var F = h[0], j = h[h.length - 1];
          for (S = 0; S < h.length; S += 1)
            It(h[S], T, n);
          for (S = 0; S < v.length; S += 1)
            f.delete(v[S]);
          Ve(e, F.prev, j.next), Ve(e, d, F), Ve(e, j, T), a = T, d = j, c -= 1, h = [], v = [];
        } else
          f.delete(g), It(g, a, n), Ve(e, g.prev, g.next), Ve(e, g, d === null ? e.effect.first : d.next), Ve(e, d, g), d = g;
        continue;
      }
      for (h = [], v = []; a !== null && a !== g; )
        (f ??= /* @__PURE__ */ new Set()).add(a), v.push(a), a = Mt(a.next);
      if (a === null)
        continue;
    }
    (g.f & Oe) === 0 && h.push(g), d = g, a = Mt(g.next);
  }
  if (e.outrogroups !== null) {
    for (const C of e.outrogroups)
      C.pending.size === 0 && (On(e, on(C.done)), e.outrogroups?.delete(C));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (a !== null || f !== void 0) {
    var P = [];
    if (f !== void 0)
      for (g of f)
        (g.f & ve) === 0 && P.push(g);
    for (; a !== null; )
      (a.f & ve) === 0 && a !== e.fallback && P.push(a), a = Mt(a.next);
    var L = P.length;
    if (L > 0) {
      var N = (r & vr) !== 0 && l === 0 ? n : null;
      if (s) {
        for (c = 0; c < L; c += 1)
          P[c].nodes?.a?.measure();
        for (c = 0; c < L; c += 1)
          P[c].nodes?.a?.fix();
      }
      ks(e, P, N);
    }
  }
  s && Ye(() => {
    if (_ !== void 0)
      for (g of _)
        g.nodes?.a?.apply();
  });
}
function Ss(e, t, n, r, i, s, l, o) {
  var a = (l & Ei) !== 0 ? (l & Ai) === 0 ? /* @__PURE__ */ $i(n, !1, !1) : ft(n) : null, f = (l & Si) !== 0 ? ft(i) : null;
  return {
    v: a,
    i: f,
    e: ye(() => (s(t, a ?? n, f ?? i, o), () => {
      e.delete(r);
    }))
  };
}
function It(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, s = t && (t.f & Oe) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ht(r)
      );
      if (s.before(r), r === i)
        return;
      r = l;
    }
}
function Ve(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const er = [...` 	
\r\f \v\uFEFF`];
function Ts(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var i of Object.keys(n))
      if (n[i])
        r = r ? r + " " + i : i;
      else if (r.length)
        for (var s = i.length, l = 0; (l = r.indexOf(i, l)) >= 0; ) {
          var o = l + s;
          (l === 0 || er.includes(r[l - 1])) && (o === r.length || er.includes(r[o])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(o + 1) : l = o;
        }
  }
  return r === "" ? null : r;
}
function Ze(e, t, n, r, i, s) {
  var l = (
    /** @type {any} */
    e[Tn]
  );
  if (l !== n || l === void 0) {
    var o = Ts(n, r, s);
    o == null ? e.removeAttribute("class") : e.className = o, e[Tn] = n;
  } else if (s && i !== s)
    for (var a in s) {
      var f = !!s[a];
      (i == null || f !== !!i[a]) && e.classList.toggle(a, f);
    }
  return s;
}
function Ot(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Ln(t))
      return Di();
    for (var r of e.options)
      r.selected = t.includes(tr(r));
    return;
  }
  for (r of e.options) {
    var i = tr(r);
    if (ts(i, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Wt(e) {
  var t = new MutationObserver(() => {
    "__value" in e && Ot(e, e.__value);
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
  }), Or(() => {
    t.disconnect();
  });
}
function tr(e) {
  return "__value" in e ? e.__value : e.value;
}
const As = Symbol("is custom element"), Rs = Symbol("is html"), Ms = ci ? "progress" : "PROGRESS";
function Cs(e, t) {
  var n = Ns(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== Ms) || (e.value = t ?? "");
}
function Ns(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[dr] ??= {
      [As]: e.nodeName.includes("-"),
      [Rs]: e.namespaceURI === Pi
    }
  );
}
function kn(e, t) {
  return e === t || e?.[st] === t;
}
function nr(e = {}, t, n, r) {
  var i = (
    /** @type {ComponentContext} */
    de.r
  ), s = (
    /** @type {Effect} */
    H
  );
  return os(() => {
    var l, o;
    return Lr(() => {
      l = o, o = [], Et(() => {
        kn(n(...o), e) || (t(e, ...o), l && kn(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let a = s;
      for (; a !== i && a.parent !== null && a.parent.f & Sn; )
        a = a.parent;
      const f = () => {
        o && kn(n(...o), e) && t(null, ...o);
      }, d = a.teardown;
      a.teardown = () => {
        f(), d?.();
      };
    };
  }), e;
}
function le(e, t, n, r) {
  var i = !0, s = (n & Ci) !== 0, l = (n & Ni) !== 0, o = (
    /** @type {V} */
    r
  ), a = !0, f = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), d = () => l && i ? (f ??= /* @__PURE__ */ Lt(
    /** @type {() => V} */
    r
  ), u(f)) : (a && (a = !1, o = l ? Et(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), o);
  let _;
  if (s) {
    var h = st in e || ui in e;
    _ = gt(e, t)?.set ?? (h && t in e ? (S) => e[t] = S : void 0);
  }
  var v, p = !1;
  s ? [v, p] = Bi(() => (
    /** @type {V} */
    e[t]
  )) : v = /** @type {V} */
  e[t], v === void 0 && r !== void 0 && (v = d(), _ && (bi(), _(v)));
  var m;
  if (m = () => {
    var S = (
      /** @type {V} */
      e[t]
    );
    return S === void 0 ? d() : (a = !0, S);
  }, (n & Mi) === 0)
    return m;
  if (_) {
    var g = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(S, F) {
        return arguments.length > 0 ? ((!F || g || p) && _(F ? m() : S), S) : m();
      })
    );
  }
  var c = !1, b = ((n & Ri) !== 0 ? Lt : yr)(() => (c = !1, m()));
  s && u(b);
  var T = (
    /** @type {Effect} */
    H
  );
  return (
    /** @type {() => V} */
    (function(S, F) {
      if (arguments.length > 0) {
        const j = F ? u(b) : s ? Ke(S) : S;
        return A(b, j), c = !0, o !== void 0 && (o = j), S;
      }
      return je && c || (T.f & me) !== 0 ? b.v : u(b);
    })
  );
}
function Wr(e) {
  de === null && di(), sn(() => {
    const t = Et(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Is = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Is);
function Os(e) {
  const t = new URLSearchParams();
  for (const [r, i] of Object.entries(e))
    i != null && t.set(r, String(i));
  const n = t.toString();
  return n ? "?" + n : "";
}
async function vt(e, t = {}) {
  const n = await fetch(e + Os(t));
  if (!n.ok) {
    const r = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  }
  return n.json();
}
async function ht(e, t) {
  const n = await fetch(e, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
  if (n.status === 204) return null;
  const r = await n.json().catch(() => ({}));
  if (!n.ok)
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  return r;
}
function rr(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const be = {
  // --- reads
  photos: (e) => vt("/api/photos", e),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => vt("/api/triage/counts", { ...rr(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => vt("/api/triage/files"),
  screen: (e, t = {}) => vt("/api/triage/screen", { name: e, ...t }),
  page: (e, t, n = 500) => vt("/api/triage/page", { ...rr(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => vt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => ht("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => ht("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => ht("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => ht("/api/triage/override", { sha256: e, decision: t }),
  // --- the one surface that leaves the process
  revealPhoto: (e) => ht("/api/reveal", { id: e }),
  revealOrigin: (e) => ht("/api/reveal", { origin: e })
};
function Ps() {
  let e = 0, t = 0;
  return async function(r) {
    const i = ++e, s = await r();
    return i <= t ? { stale: !0, value: void 0 } : (t = i, { stale: !1, value: s });
  };
}
function Ls(e, t) {
  let n = 0;
  const r = (...i) => {
    clearTimeout(n), n = setTimeout(() => e(...i), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...i) => {
    clearTimeout(n), e(...i);
  }, r;
}
const ir = ["B", "KB", "MB", "GB", "TB"];
function qe(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < ir.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${ir[n]}`;
}
function xe(e) {
  return (Number(e) || 0).toLocaleString();
}
const ln = "G:\\photos", sr = [
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
      value: t ? `${ln}\\${t}\\${e.key}` : `${ln}\\${e.key}`
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
  }
];
function Ds(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
var Fs = /* @__PURE__ */ D('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), qs = /* @__PURE__ */ D('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), Hs = /* @__PURE__ */ D('<div class="line muted svelte-1vgp6n7">…</div>'), js = /* @__PURE__ */ D('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), Bs = /* @__PURE__ */ D('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), zs = /* @__PURE__ */ D('<div class="line muted svelte-1vgp6n7"> </div>'), Us = /* @__PURE__ */ D('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function Gs(e, t) {
  $e(t, !0);
  let n = le(t, "counts", 3, null), r = le(t, "files", 3, null), i = le(t, "filesAt", 3, null), s = le(t, "stale", 3, !1), l = le(t, "candidate", 3, null), o = le(t, "busy", 3, !1);
  const a = /* @__PURE__ */ Te(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var f = Us(), d = w(f);
  let _;
  var h = E(w(d), 2);
  {
    var v = (N) => {
      var C = qs(), W = Ie(C), U = w(W), Y = w(U), ee = E(U, 2), z = w(ee), k = E(ee, 4), x = w(k), I = E(k, 2), $ = w(I), ne = E(W, 2);
      {
        var y = (q) => {
          var X = Fs(), ue = E(w(X), 2), he = w(ue), tt = E(ue, 2), Bt = w(tt), zt = E(tt, 4), cn = w(zt), Ut = E(zt, 2), dn = w(Ut), Gt = E(Ut, 2), vn = w(Gt);
          V(
            (hn, _n, pn, gn, R) => {
              M(he, `kept ${hn ?? ""}`), M(Bt, _n), M(cn, `excluded ${pn ?? ""}`), M(dn, gn), M(vn, `${u(a) >= 0 ? "+" : ""}${R ?? ""} excluded`);
            },
            [
              () => xe(n().candidate_kept_paths),
              () => qe(n().candidate_kept_bytes),
              () => xe(n().candidate_excluded_paths),
              () => qe(n().candidate_excluded_bytes),
              () => xe(u(a))
            ]
          ), O(q, X);
        };
        Q(ne, (q) => {
          l() && q(y);
        });
      }
      V(
        (q, X, ue, he) => {
          M(Y, `kept ${q ?? ""}`), M(z, X), M(x, `excluded ${ue ?? ""}`), M($, he);
        },
        [
          () => xe(n().kept_paths),
          () => qe(n().kept_bytes),
          () => xe(n().excluded_paths),
          () => qe(n().excluded_bytes)
        ]
      ), O(N, C);
    }, p = (N) => {
      var C = Hs();
      O(N, C);
    };
    Q(h, (N) => {
      n() ? N(v) : N(p, -1);
    });
  }
  var m = E(d, 2);
  let g;
  var c = w(m), b = E(w(c), 3), T = w(b), S = E(b, 2);
  {
    var F = (N) => {
      var C = js();
      O(N, C);
    };
    Q(S, (N) => {
      s() && r() && r() !== "loading" && N(F);
    });
  }
  var j = E(c, 2);
  {
    var P = (N) => {
      var C = Bs(), W = Ie(C);
      let U;
      var Y = w(W), ee = w(Y), z = E(Y, 2), k = w(z), x = E(z, 4), I = w(x), $ = E(x, 2), ne = w($), y = E(W, 2), q = w(y);
      V(
        (X, ue, he, tt) => {
          U = Ze(W, 1, "line svelte-1vgp6n7", null, U, { outdated: s() }), M(ee, `kept ${X ?? ""}`), M(k, ue), M(I, `excluded ${he ?? ""}`), M(ne, tt), M(q, `as of ${i() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => xe(r().kept_files),
          () => qe(r().kept_bytes),
          () => xe(r().excluded_files),
          () => qe(r().excluded_bytes)
        ]
      ), O(N, C);
    }, L = (N) => {
      var C = zs(), W = w(C);
      V(() => M(W, r() === "loading" ? "counting…" : "not counted yet")), O(N, C);
    };
    Q(j, (N) => {
      r() && r() !== "loading" ? N(P) : N(L, -1);
    });
  }
  V(() => {
    _ = Ze(d, 1, "block svelte-1vgp6n7", null, _, { busy: o() }), g = Ze(m, 1, "block svelte-1vgp6n7", null, g, { busy: r() === "loading" }), b.disabled = r() === "loading", M(T, r() === "loading" ? "counting…" : "recount");
  }), ae("click", b, function(...N) {
    t.onfiles?.apply(this, N);
  }), O(e, f), et();
}
At(["click"]);
var Vs = /* @__PURE__ */ D('<span class="err svelte-uzy12d"> </span>'), Ys = /* @__PURE__ */ D(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Xs = /* @__PURE__ */ D(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m photolib.triage_survey</code>, then reload.</span>`), Ks = /* @__PURE__ */ D('<span class="muted svelte-uzy12d"> </span>'), Ws = /* @__PURE__ */ D('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function Js(e, t) {
  $e(t, !0);
  let n = /* @__PURE__ */ K(null), r = /* @__PURE__ */ K(!1), i = /* @__PURE__ */ K(null);
  async function s() {
    A(r, !0), A(i, null);
    try {
      A(n, await be.probe(), !0);
    } catch (v) {
      A(i, String(v), !0);
    } finally {
      A(r, !1);
    }
  }
  var l = Ws(), o = w(l), a = w(o), f = E(o, 2);
  {
    var d = (v) => {
      var p = Vs(), m = w(p);
      V(() => M(m, u(i))), O(v, p);
    }, _ = (v) => {
      var p = Kr(), m = Ie(p);
      {
        var g = (b) => {
          var T = Ys(), S = E(w(T), 2);
          V(
            (F) => M(S, ` above are formats the header
        reader cannot measure (${F ?? ""}) or files with no
        extension.`),
            [() => u(n).formats.join(" ")]
          ), O(b, T);
        }, c = (b) => {
          var T = Xs(), S = w(T), F = w(S), j = E(S, 2), P = w(j);
          V(
            (L) => {
              M(F, L), M(P, u(n).command);
            },
            [() => xe(u(n).worklist)]
          ), O(b, T);
        };
        Q(m, (b) => {
          u(n).worklist === 0 ? b(g) : b(c, -1);
        });
      }
      O(v, p);
    }, h = (v) => {
      var p = Ks(), m = w(p);
      V(() => M(m, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), O(v, p);
    };
    Q(f, (v) => {
      u(i) ? v(d) : u(n) ? v(_, 1) : v(h, -1);
    });
  }
  V(() => {
    o.disabled = u(r), M(a, u(r) ? "counting…" : "Check the dimension probe's worklist");
  }), ae("click", o, s), O(e, l), et();
}
At(["click"]);
var Zs = /* @__PURE__ */ D('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), ar = /* @__PURE__ */ D("<option> </option>"), Qs = /* @__PURE__ */ D('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), $s = /* @__PURE__ */ D('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), ea = /* @__PURE__ */ D('<div class="none muted svelte-bqi9ky"> </div>'), ta = /* @__PURE__ */ D('<div class="bar svelte-bqi9ky"><!></div>');
function na(e, t) {
  $e(t, !0);
  let n = le(t, "candidate", 3, null), r = le(t, "saving", 3, !1);
  const i = [
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
  ], s = {
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), o = /* @__PURE__ */ Te(() => n() ? s[n().column] ?? ["="] : ["="]), a = /* @__PURE__ */ Te(() => !!n() && n().op !== "is null");
  function f(m, g) {
    const c = { ...n(), [m]: g };
    if (m === "column") {
      const b = s[g] ?? ["="];
      b.includes(c.op) || (c.op = b[0]), c.value = l.has(g) ? 0 : "";
    }
    m === "op" && g === "is null" && (c.value = null), m === "value" && l.has(c.column) && (c.value = Number(g) || 0), t.onedit(c);
  }
  var d = ta(), _ = w(d);
  {
    var h = (m) => {
      var g = Zs(), c = w(g), b = w(c), T = E(c, 2), S = w(T);
      V(() => {
        M(b, `${t.screen.title ?? ""} does not save a rule.`), M(S, t.screen.blurb);
      }), O(m, g);
    }, v = (m) => {
      var g = $s(), c = Ie(g), b = w(c);
      Ft(b, 21, () => i, In, (y, q) => {
        var X = ar(), ue = w(X), he = {};
        V(() => {
          M(ue, u(q)), he !== (he = u(q)) && (X.value = (X.__value = u(q)) ?? "");
        }), O(y, X);
      });
      var T;
      Wt(b);
      var S = E(b, 2);
      Ft(S, 21, () => u(o), In, (y, q) => {
        var X = ar(), ue = w(X), he = {};
        V(() => {
          M(ue, u(q)), he !== (he = u(q)) && (X.value = (X.__value = u(q)) ?? "");
        }), O(y, X);
      });
      var F;
      Wt(S);
      var j = E(S, 2);
      {
        var P = (y) => {
          var q = Qs();
          V(() => Cs(q, n().value ?? "")), ae("input", q, (X) => f("value", X.currentTarget.value)), O(y, q);
        };
        Q(j, (y) => {
          u(a) && y(P);
        });
      }
      var L = E(j, 2), N = w(L);
      N.value = N.__value = "exclude";
      var C = E(N);
      C.value = C.__value = "include";
      var W;
      Wt(L);
      var U = E(L, 2), Y = w(U);
      Y.value = Y.__value = "end";
      var ee = E(Y);
      ee.value = ee.__value = "0";
      var z;
      Wt(U);
      var k = E(U, 2), x = w(k), I = E(k, 2), $ = E(c, 2), ne = w($);
      V(
        (y, q) => {
          T !== (T = n().column) && (b.value = (b.__value = n().column) ?? "", Ot(b, n().column)), F !== (F = n().op) && (S.value = (S.__value = n().op) ?? "", Ot(S, n().op)), W !== (W = n().decision ?? "exclude") && (L.value = (L.__value = n().decision ?? "exclude") ?? "", Ot(L, n().decision ?? "exclude")), z !== (z = y) && (U.value = (U.__value = y) ?? "", Ot(U, y)), k.disabled = r(), M(x, r() ? "saving…" : "Confirm"), M(ne, `${q ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Ds(n())
        ]
      ), ae("change", b, (y) => f("column", y.currentTarget.value)), ae("change", S, (y) => f("op", y.currentTarget.value)), ae("change", L, (y) => f("decision", y.currentTarget.value)), ae("change", U, (y) => f("at", y.currentTarget.value)), ae("click", k, function(...y) {
        t.onconfirm?.apply(this, y);
      }), ae("click", I, function(...y) {
        t.onclear?.apply(this, y);
      }), O(m, g);
    }, p = (m) => {
      var g = ea(), c = w(g);
      V(() => M(c, `Pick a row to build a rule${t.screen.table === !1 ? ", or scroll — this is the remainder" : ""}.`)), O(m, g);
    };
    Q(_, (m) => {
      t.screen.rule === !1 ? m(h) : n() ? m(v, 1) : m(p, -1);
    });
  }
  O(e, d), et();
}
At(["change", "input", "click"]);
var ra = /* @__PURE__ */ D('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), ia = /* @__PURE__ */ D('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), sa = /* @__PURE__ */ D('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), aa = /* @__PURE__ */ D('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function la(e, t) {
  $e(t, !0);
  let n = le(t, "rules", 19, () => []), r = le(t, "unmatched", 3, null), i = le(t, "busy", 3, !1);
  var s = aa(), l = w(s), o = E(w(l)), a = w(o), f = E(l, 2);
  {
    var d = (p) => {
      var m = ra();
      O(p, m);
    };
    Q(f, (p) => {
      n().length === 0 && p(d);
    });
  }
  var _ = E(f, 2);
  Ft(_, 19, n, (p) => p.id, (p, m, g) => {
    var c = ia();
    let b;
    var T = w(c), S = w(T), F = w(S), j = E(S, 2), P = w(j), L = E(j, 2), N = w(L), C = E(T, 2), W = w(C), U = w(W), Y = E(W, 2), ee = w(Y), z = E(Y, 4), k = E(z, 2), x = E(k, 2);
    V(
      (I, $) => {
        b = Ze(c, 1, "rule svelte-aof9c2", null, b, { exclude: u(m).decision === "exclude" }), M(F, u(g)), M(P, u(m).predicate), M(N, u(m).decision), M(U, `${I ?? ""} paths`), M(ee, $), z.disabled = i() || u(g) === 0, k.disabled = i() || u(g) === n().length - 1, x.disabled = i();
      },
      [
        () => xe(u(m).paths),
        () => qe(u(m).bytes)
      ]
    ), ae("click", z, () => t.onmove(u(m), u(g) - 1)), ae("click", k, () => t.onmove(u(m), u(g) + 1)), ae("click", x, () => t.ondelete(u(m))), O(p, c);
  });
  var h = E(_, 2);
  {
    var v = (p) => {
      var m = sa(), g = E(w(m), 2), c = w(g), b = w(c), T = E(c, 2), S = w(T);
      V(
        (F, j) => {
          M(b, `${F ?? ""} paths`), M(S, j);
        },
        [
          () => xe(r().paths),
          () => qe(r().bytes)
        ]
      ), O(p, m);
    };
    Q(h, (p) => {
      r() && p(v);
    });
  }
  V(() => M(a, `${n().length ?? ""} rules · top-down, first match wins`)), O(e, s), et();
}
At(["click"]);
const Pn = 4, lr = 220, oa = 340;
function Jr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function ua(e, t, n, r, i) {
  let s = t;
  for (; s < e.length; ) {
    let l = s, o = 0, a = 1 / 0;
    for (; l < e.length && (o += Jr(e[l]), l++, a = (n - Pn * (l - s - 1)) / o, !(a <= lr)); )
      ;
    if (a > lr && !r) break;
    i(s, l, Math.round(Math.min(a, oa))), s = l;
  }
  return s;
}
function or(e, t, n) {
  if (!e.length) return null;
  let r = 0, i = e.length - 1;
  for (; r < i; ) {
    const l = r + i >> 1;
    e[l].top + e[l].height < t ? r = l + 1 : i = l;
  }
  const s = r;
  for (i = e.length - 1; r < i; ) {
    const l = r + i + 1 >> 1;
    e[l].top <= n ? r = l : i = l - 1;
  }
  return [s, Math.max(s, r)];
}
const ur = 1e3;
function fa(e, t, n) {
  const r = [], i = [], s = /* @__PURE__ */ new Map(), l = [];
  let o = 0, a = 0, f = null, d = !1, _ = !1, h = 0, v = 0, p = n.onState || (() => {
  });
  function m(k) {
    h <= 0 || (o = ua(r, o, h, k, (x, I, $) => {
      i.push({ top: a, height: $, from: x, to: I }), a += $ + Pn;
    }), e.style.height = a + "px", t.style.top = Math.max(0, a - 1) + "px");
  }
  function g() {
    return window.scrollY - e.offsetTop;
  }
  function c() {
    const k = l.pop();
    if (k) return k;
    const x = document.createElement("div");
    x.className = "tile";
    const I = document.createElement("img");
    return I.decoding = "async", I.addEventListener("load", () => x.classList.add("loaded")), I.addEventListener("error", () => x.classList.add("missing")), x.appendChild(I), n.extend && n.extend(x), x;
  }
  function b(k, x) {
    x.firstChild.removeAttribute("src"), x.classList.remove("loaded", "missing", "error"), x.style.backgroundImage = "", x.remove(), s.delete(k), l.push(x);
  }
  function T(k, x, I, $, ne) {
    let y = s.get(k);
    const q = r[k];
    y || (y = c(), y.dataset.index = String(k), S(y, q), y.firstChild.src = "/t/" + q.s + ".webp", n.fill && n.fill(y, q), e.appendChild(y), s.set(k, y)), y.style.width = $ + "px", y.style.height = ne + "px", y.style.transform = "translate(" + x + "px," + I + "px)";
  }
  function S(k, x) {
    x.th && (x.url === void 0 && (x.url = n.thumbHash(x.th)), x.url && (k.style.backgroundImage = "url(" + x.url + ")"));
  }
  function F(k) {
    let x = 0;
    for (let I = k.from; I < k.to; I++) {
      const ne = I === k.to - 1 ? h - x : Math.round(Jr(r[I]) * k.height);
      T(I, x, k.top, ne, k.height), x += ne + Pn;
    }
  }
  function j() {
    const k = window.innerHeight, x = g(), I = or(i, x - k, x + k * 2);
    if (!I) return;
    const $ = i[I[0]].from, ne = i[I[1]].to;
    for (const [y, q] of Array.from(s))
      (y < $ || y >= ne) && b(y, q);
    for (let y = I[0]; y <= I[1]; y++) F(i[y]);
  }
  function P() {
    return h <= 0 ? !1 : a - (g() + window.innerHeight) < ur;
  }
  async function L() {
    if (_ || d) return;
    _ = !0;
    const k = v;
    p({ loading: !0, count: r.length, exhausted: d });
    try {
      do {
        const x = await n.fetchPage(f);
        if (k !== v) return;
        for (const I of x.photos) r.push(I);
        f = x.next, d = f === null, m(d), j(), p({ loading: !0, count: r.length, exhausted: d });
      } while (!d && P());
    } catch (x) {
      k === v && p({ error: String(x) });
    } finally {
      k === v && (_ = !1, p({ loading: !1, count: r.length, exhausted: d }));
    }
  }
  let N = 0;
  function C() {
    N || (N = requestAnimationFrame(() => {
      N = 0, j(), P() && L();
    }));
  }
  function W() {
    const k = e.clientWidth;
    if (k === h) return;
    const x = or(i, g(), g()), I = x ? i[x[0]].from : 0;
    h = k;
    for (const [ne, y] of Array.from(s)) b(ne, y);
    i.length = 0, o = 0, a = 0, m(d), j();
    const $ = i.find((ne) => ne.to > I);
    $ && window.scrollTo(0, $.top + e.offsetTop), P() && L();
  }
  function U(k) {
    const x = k.target.closest(".tile");
    if (!x || !e.contains(x)) return;
    const I = r[Number(x.dataset.index)];
    I && n.activate && n.activate(I, k, x);
  }
  e.addEventListener("click", U), window.addEventListener("scroll", C, { passive: !0 });
  let Y = 0;
  const ee = new ResizeObserver(() => {
    clearTimeout(Y), Y = setTimeout(W, 100);
  });
  ee.observe(e);
  const z = new IntersectionObserver(
    (k) => {
      k.some((x) => x.isIntersecting) && L();
    },
    { rootMargin: "0px 0px " + ur + "px 0px" }
  );
  return z.observe(t), h = e.clientWidth, L(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      v++, _ = !1;
      for (const [k, x] of Array.from(s)) b(k, x);
      r.length = 0, i.length = 0, o = 0, a = 0, f = null, d = !1, e.style.height = "0px", window.scrollTo(0, 0), L();
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(k) {
      for (const [x, I] of s)
        r[x] === k && n.fill && n.fill(I, k);
    },
    destroy() {
      v++, e.removeEventListener("click", U), window.removeEventListener("scroll", C), ee.disconnect(), z.disconnect(), clearTimeout(Y);
    }
  };
}
function ca(e) {
  try {
    const t = Uint8Array.from(atob(e), (U) => U.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, i = (n & 63) / 63, s = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, o = (n >> 18 & 31) / 31, a = n >> 23, f = (r >> 3 & 63) / 63, d = (r >> 9 & 63) / 63, _ = r >> 15, h = Math.max(3, _ ? a ? 5 : 7 : r & 7), v = Math.max(3, _ ? r & 7 : a ? 5 : 7);
    let p = a ? 6 : 5, m = 0;
    const g = (U, Y, ee) => {
      const z = [];
      for (let k = 0; k < Y; k++)
        for (let x = k ? 0 : 1; x * Y < U * (Y - k); x++) {
          const I = t[p + (m >> 1)] >> ((m++ & 1) << 2) & 15;
          z.push((I / 7.5 - 1) * ee);
        }
      return z;
    }, c = g(h, v, o), b = g(3, 3, f * 1.25), T = g(3, 3, d * 1.25), S = h / v, F = Math.max(1, Math.round(S > 1 ? 32 : 32 * S)), j = Math.max(1, Math.round(S > 1 ? 32 / S : 32)), P = document.createElement("canvas");
    P.width = F, P.height = j;
    const L = P.getContext("2d"), N = L.createImageData(F, j), C = [], W = [];
    for (let U = 0, Y = 0; U < j; U++)
      for (let ee = 0; ee < F; ee++, Y += 4) {
        let z = i, k = s, x = l;
        for (let y = 0; y < h; y++) C[y] = Math.cos(Math.PI / F * (ee + 0.5) * y);
        for (let y = 0; y < v; y++) W[y] = Math.cos(Math.PI / j * (U + 0.5) * y);
        for (let y = 0, q = 0; y < v; y++)
          for (let X = y ? 0 : 1; X * v < h * (v - y); X++, q++)
            z += c[q] * C[X] * W[y] * 2;
        for (let y = 0, q = 0; y < 3; y++)
          for (let X = y ? 0 : 1; X < 3 - y; X++, q++) {
            const ue = C[X] * W[y] * 2;
            k += b[q] * ue, x += T[q] * ue;
          }
        const I = z - 2 / 3 * k, $ = (3 * z - I + x) / 2, ne = $ - x;
        N.data[Y] = Math.max(0, Math.min(255, Math.round(255 * $))), N.data[Y + 1] = Math.max(0, Math.min(255, Math.round(255 * ne))), N.data[Y + 2] = Math.max(0, Math.min(255, Math.round(255 * I))), N.data[Y + 3] = 255;
      }
    return L.putImageData(N, 0, 0), P.toDataURL();
  } catch {
    return null;
  }
}
var da = /* @__PURE__ */ D('<main id="canvas"><div id="sentinel"></div></main>');
function va(e, t) {
  $e(t, !0);
  let n = le(t, "key", 3, ""), r = le(t, "triage", 3, !1), i = le(t, "onActivate", 3, () => {
  }), s = le(t, "onOverride", 3, async () => null), l = le(t, "onState", 3, () => {
  }), o = /* @__PURE__ */ K(null), a = /* @__PURE__ */ K(null), f = null, d = "";
  const _ = { null: "exclude", exclude: "include", include: "clear" };
  function h(c) {
    const b = c.toLowerCase().startsWith(ln.toLowerCase()) ? c.slice(ln.length + 1) : c;
    return b.length > 64 ? "…" + b.slice(-64) : b;
  }
  function v(c) {
    const b = document.createElement("div");
    b.className = "tile-path", c.appendChild(b);
    const T = document.createElement("button");
    T.className = "chip", T.type = "button", c.appendChild(T);
  }
  function p(c, b) {
    const T = c.querySelector(".tile-path");
    T && (T.textContent = b.p ? h(b.p) : "");
    const S = c.querySelector(".chip");
    S && (S.dataset.state = b.o || "none", S.textContent = b.o === "exclude" ? "drop" : b.o === "include" ? "keep" : "·", S.title = b.o === "exclude" ? "overridden: excluded — click to keep" : b.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Wr(() => (f = fa(u(o), u(a), {
    fetchPage: (c) => t.fetchPage(c),
    thumbHash: ca,
    extend: r() ? v : void 0,
    fill: r() ? p : void 0,
    onState: (c) => l()(c),
    activate: async (c, b, T) => {
      if (!b.target.closest(".chip")) {
        i()(c);
        return;
      }
      const S = _[c.o ?? "null"];
      c.o = await s()(c, S), p(T, c);
    }
  }), d = n(), () => f?.destroy())), sn(() => {
    const c = n();
    !f || c === d || (d = c, f.reset());
  });
  var m = da(), g = w(m);
  nr(g, (c) => A(a, c), () => u(a)), nr(m, (c) => A(o, c), () => u(o)), O(e, m), et();
}
var ha = /* @__PURE__ */ D('<th class="num svelte-1v3p82v"> </th>'), _a = /* @__PURE__ */ D('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), pa = /* @__PURE__ */ D('<td class="num svelte-1v3p82v"> </td>'), ga = /* @__PURE__ */ D('<tr><td class="key svelte-1v3p82v"> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), ma = /* @__PURE__ */ D('<table class="agg svelte-1v3p82v"><thead><tr><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function ba(e, t) {
  $e(t, !0);
  let n = le(t, "rows", 19, () => []), r = le(t, "selected", 3, null);
  function i(a) {
    return t.screen.label ? t.screen.label(a) : a.key;
  }
  var s = Kr(), l = Ie(s);
  {
    var o = (a) => {
      var f = ma(), d = w(f), _ = w(d), h = w(_), v = w(h), p = E(h, 3);
      {
        var m = (c) => {
          var b = ha(), T = w(b);
          V(() => M(T, t.screen.heading[1])), O(c, b);
        };
        Q(p, (c) => {
          t.screen.heading[1] && c(m);
        });
      }
      var g = E(d);
      Ft(g, 21, n, (c) => c.key, (c, b) => {
        var T = ga();
        let S;
        var F = w(T), j = w(F), P = E(j);
        {
          var L = (z) => {
            var k = _a();
            O(z, k);
          };
          Q(P, (z) => {
            u(b).scope === "whole inventory" && z(L);
          });
        }
        var N = E(F), C = w(N), W = E(N), U = w(W), Y = E(W);
        {
          var ee = (z) => {
            var k = pa(), x = w(k);
            V(() => M(x, u(b).detail ?? "")), O(z, k);
          };
          Q(Y, (z) => {
            t.screen.heading[1] && z(ee);
          });
        }
        V(
          (z, k, x) => {
            S = Ze(T, 1, "svelte-1v3p82v", null, S, {
              picked: r() === u(b).key,
              clickable: t.screen.sheet !== !1
            }), M(j, `${z ?? ""} `), M(C, k), M(U, x);
          },
          [
            () => i(u(b)),
            () => xe(u(b).paths),
            () => qe(u(b).bytes)
          ]
        ), ae("click", T, () => t.onpick(u(b))), O(c, T);
      }), V(() => M(v, t.screen.heading[0] ?? "")), O(a, f);
    };
    Q(l, (a) => {
      n().length && a(o);
    });
  }
  O(e, s), et();
}
At(["click"]);
var wa = /* @__PURE__ */ D('<button><span class="n svelte-1n46o8q"> </span> </button>'), ya = /* @__PURE__ */ D('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), xa = /* @__PURE__ */ D('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), ka = /* @__PURE__ */ D('<div class="muted pad svelte-1n46o8q">loading…</div>'), Ea = /* @__PURE__ */ D('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), Sa = /* @__PURE__ */ D('<nav class="svelte-1n46o8q"></nav> <!> <!>', 1), Ta = /* @__PURE__ */ D('<p class="muted pad svelte-1n46o8q">The read-only grid: every photo, newest first, click to reveal in Explorer.</p>'), Aa = /* @__PURE__ */ D('<p class="blurb"> </p>'), Ra = /* @__PURE__ */ D('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), Ma = /* @__PURE__ */ D('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), Ca = /* @__PURE__ */ D('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!>', 1), Na = /* @__PURE__ */ D('<div class="status"> </div>'), Ia = /* @__PURE__ */ D('<div class="shell"><aside class="side"><div class="modes svelte-1n46o8q"><button>triage</button> <button>grid</button></div> <!></aside> <div class="main"><!> <!></div></div> <!>', 1);
function Oa(e, t) {
  $e(t, !0);
  let n = /* @__PURE__ */ K("triage"), r = /* @__PURE__ */ K(0), i = /* @__PURE__ */ K(
    null
    // screen 6's drill-down
  ), s = /* @__PURE__ */ K(Ke([])), l = /* @__PURE__ */ K(null), o = /* @__PURE__ */ K(null), a = /* @__PURE__ */ K(null), f = /* @__PURE__ */ K(null), d = /* @__PURE__ */ K(null), _ = /* @__PURE__ */ K(!1), h = /* @__PURE__ */ K(!1), v = /* @__PURE__ */ K(!1), p = /* @__PURE__ */ K(!1), m = /* @__PURE__ */ K(Ke({ loading: !1, count: 0, exhausted: !1 })), g = /* @__PURE__ */ K(null);
  const c = /* @__PURE__ */ Te(() => sr[u(r)]), b = /* @__PURE__ */ Te(() => u(c).table !== !1), T = /* @__PURE__ */ Te(() => u(c).sheet !== !1 && (u(o) !== null || !u(b))), S = /* @__PURE__ */ Te(() => `${u(n)}:${u(r)}:${JSON.stringify(u(o))}`), F = Ps();
  function j(R) {
    A(g, String(R), !0);
  }
  async function P(R) {
    try {
      return A(g, null), await R();
    } catch (J) {
      return j(J), null;
    }
  }
  const L = Ls(
    () => {
      A(h, !0), P(async () => {
        const R = u(o)?.at === "end" || u(o)?.at === void 0 ? void 0 : 0, { stale: J, value: fe } = await F(() => be.counts(u(o), R));
        J || A(a, fe, !0);
      }).finally(() => {
        A(h, !1);
      });
    },
    220
  );
  async function N() {
    A(f, "loading");
    const R = await P(() => be.files());
    A(f, R, !0), A(_, !1), A(d, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function C(R = !1) {
    if (!u(b)) {
      A(s, [], !0);
      return;
    }
    A(p, !0);
    const J = u(c).name === "source_folder" && u(i) ? { root: u(i) } : {};
    R && (J.live = "1");
    const fe = await P(() => be.screen(u(c).name, J));
    A(s, fe?.rows ?? [], !0), A(p, !1);
  }
  sn(() => {
    u(r), Et(() => {
      A(l, null), A(o, null), A(i, null), C(), L.now();
    });
  }), sn(() => {
    u(i), Et(C);
  }), Wr(N);
  function W(R) {
    if (u(c).sheet !== !1) {
      if (u(c).drill && !u(i)) {
        A(l, R.key, !0), A(
          o,
          {
            ...u(c).toRule(R, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), A(i, R.key, !0);
        return;
      }
      A(l, R.key, !0), A(
        o,
        {
          ...u(c).toRule(R, u(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), L();
    }
  }
  function U(R) {
    A(o, R, !0), A(
      l,
      null
      // it no longer corresponds to a row
    ), L();
  }
  function Y(R = !1) {
    A(o, null), A(l, null), R && A(i, null), L.now();
  }
  async function ee() {
    if (!u(o)) return;
    A(v, !0);
    const R = u(o).at === "end" ? void 0 : 0, J = await P(() => be.addRule(
      {
        column: u(o).column,
        op: u(o).op,
        value: u(o).value,
        decision: u(o).decision ?? "exclude",
        note: `screen ${u(c).id} ${u(c).title}`
      },
      R
    ));
    A(v, !1), J && (A(o, null), A(l, null), A(
      _,
      !0
      // the distinct-content number now says so on its face
    ), await C(), L.now());
  }
  async function z(R) {
    A(v, !0), await P(() => be.deleteRule(R.id)), A(v, !1), A(_, !0), await C(), L.now();
  }
  async function k(R, J) {
    A(v, !0), await P(() => be.moveRule(R.id, J)), A(v, !1), A(_, !0), await C(), L.now();
  }
  async function x(R, J) {
    const fe = await P(() => be.override(R.s, J));
    return fe ? (A(_, !0), L(), fe.decision) : R.o ?? null;
  }
  function I(R) {
    return u(n) === "grid" ? be.photos({ kind: "image", limit: 500, ...R || {} }) : be.page(u(o), R);
  }
  function $(R) {
    P(() => u(n) === "grid" ? be.revealPhoto(R.id) : be.revealOrigin(R.id));
  }
  var ne = Ia(), y = Ie(ne), q = w(y), X = w(q), ue = w(X);
  let he;
  var tt = E(ue, 2);
  let Bt;
  var zt = E(X, 2);
  {
    var cn = (R) => {
      var J = Sa(), fe = Ie(J);
      Ft(fe, 21, () => sr, In, (Ne, De, ze) => {
        var Ue = wa();
        let nt;
        var rt = w(Ue), ct = w(rt), Rt = E(rt, 1, !0);
        V(() => {
          nt = Ze(Ue, 1, "nav svelte-1n46o8q", null, nt, { on: ze === u(r) }), M(ct, u(De).id), M(Rt, u(De).title);
        }), ae("click", Ue, () => A(r, ze, !0)), O(Ne, Ue);
      });
      var Vt = E(fe, 2);
      {
        var Yt = (Ne) => {
          var De = Ea(), ze = Ie(De), Ue = w(ze);
          {
            var nt = (Z) => {
              var ce = ya(), Ge = Ie(ce), wn = /* @__PURE__ */ Te(() => Y.bind(null, !0)), Zr = E(Ge, 2), Qr = w(Zr);
              V(() => M(Qr, `inside ${u(i) ?? ""}`)), ae("click", Ge, function(...$r) {
                u(wn)?.apply(this, $r);
              }), O(Z, ce);
            }, rt = (Z) => {
              var ce = xa(), Ge = w(ce);
              V(() => M(Ge, u(c).relive)), ae("click", ce, () => C(!0)), O(Z, ce);
            };
            Q(Ue, (Z) => {
              u(c).drill && u(i) ? Z(nt) : u(c).relive && Z(rt, 1);
            });
          }
          var ct = E(ze, 2);
          {
            var Rt = (Z) => {
              var ce = ka();
              O(Z, ce);
            };
            Q(ct, (Z) => {
              u(p) && Z(Rt);
            });
          }
          var bn = E(ct, 2);
          ba(bn, {
            get rows() {
              return u(s);
            },
            get screen() {
              return u(c);
            },
            get selected() {
              return u(l);
            },
            onpick: W
          }), O(Ne, De);
        };
        Q(Vt, (Ne) => {
          u(b) && Ne(Yt);
        });
      }
      var mn = E(Vt, 2);
      {
        let Ne = /* @__PURE__ */ Te(() => u(a)?.rules ?? []), De = /* @__PURE__ */ Te(() => u(a)?.unmatched ?? null);
        la(mn, {
          get rules() {
            return u(Ne);
          },
          get unmatched() {
            return u(De);
          },
          get busy() {
            return u(v);
          },
          ondelete: z,
          onmove: k
        });
      }
      O(R, J);
    }, Ut = (R) => {
      var J = Ta();
      O(R, J);
    };
    Q(zt, (R) => {
      u(n) === "triage" ? R(cn) : R(Ut, -1);
    });
  }
  var dn = E(q, 2), Gt = w(dn);
  {
    var vn = (R) => {
      var J = Ca(), fe = Ie(J), Vt = w(fe), Yt = E(fe, 2), mn = w(Yt), Ne = E(Yt, 2);
      {
        var De = (Z) => {
          var ce = Aa(), Ge = w(ce);
          V(() => M(Ge, u(c).note)), O(Z, ce);
        };
        Q(Ne, (Z) => {
          u(c).note && Z(De);
        });
      }
      var ze = E(Ne, 2);
      {
        var Ue = (Z) => {
          Js(Z, {
            get screen() {
              return u(c);
            }
          });
        };
        Q(ze, (Z) => {
          u(c).name === "dimensions" && Z(Ue);
        });
      }
      var nt = E(ze, 2);
      Gs(nt, {
        get counts() {
          return u(a);
        },
        get files() {
          return u(f);
        },
        get filesAt() {
          return u(d);
        },
        get stale() {
          return u(_);
        },
        get candidate() {
          return u(o);
        },
        get busy() {
          return u(h);
        },
        onfiles: N
      });
      var rt = E(nt, 2);
      na(rt, {
        get candidate() {
          return u(o);
        },
        get screen() {
          return u(c);
        },
        get saving() {
          return u(v);
        },
        onedit: U,
        onconfirm: ee,
        onclear: Y
      });
      var ct = E(rt, 2);
      {
        var Rt = (Z) => {
          var ce = Ra(), Ge = w(ce);
          V((wn) => M(Ge, `${wn ?? ""} loaded${u(m).exhausted ? " · all of them" : ""}${u(m).loading ? " · loading…" : ""} `), [() => xe(u(m).count)]), O(Z, ce);
        }, bn = (Z) => {
          var ce = Ma();
          O(Z, ce);
        };
        Q(ct, (Z) => {
          u(T) ? Z(Rt) : u(c).sheet === !1 && Z(bn, 1);
        });
      }
      V(() => {
        M(Vt, `${u(c).id ?? ""} · ${u(c).title ?? ""}`), M(mn, u(c).blurb);
      }), O(R, J);
    };
    Q(Gt, (R) => {
      u(n) === "triage" && R(vn);
    });
  }
  var hn = E(Gt, 2);
  {
    var _n = (R) => {
      {
        let J = /* @__PURE__ */ Te(() => u(n) === "triage");
        va(R, {
          get key() {
            return u(S);
          },
          fetchPage: I,
          get triage() {
            return u(J);
          },
          onActivate: $,
          onOverride: x,
          onState: (fe) => A(m, { ...u(m), ...fe }, !0)
        });
      }
    };
    Q(hn, (R) => {
      (u(T) || u(n) === "grid") && R(_n);
    });
  }
  var pn = E(y, 2);
  {
    var gn = (R) => {
      var J = Na(), fe = w(J);
      V(() => M(fe, u(g))), O(R, J);
    };
    Q(pn, (R) => {
      u(g) && R(gn);
    });
  }
  V(() => {
    he = Ze(ue, 1, "svelte-1n46o8q", null, he, { on: u(n) === "triage" }), Bt = Ze(tt, 1, "svelte-1n46o8q", null, Bt, { on: u(n) === "grid" });
  }), ae("click", ue, () => A(n, "triage")), ae("click", tt, () => A(n, "grid")), O(e, ne), et();
}
At(["click"]);
bs(Oa, { target: document.getElementById("app") });
