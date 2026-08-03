var Fn = Array.isArray, ei = Array.prototype.indexOf, en = Array.prototype.includes, cn = Array.from, ti = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, ni = Object.prototype, ri = Array.prototype, ii = Object.getPrototypeOf, Yn = Object.isExtensible;
const si = () => {
};
function ai(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function cr() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const ue = 2, Et = 4, dn = 8, dr = 1 << 24, Ce = 16, Re = 32, ze = 64, An = 128, Ae = 512, ae = 1024, le = 2048, Oe = 4096, pe = 8192, xe = 16384, Ct = 32768, Rn = 1 << 25, St = 65536, tn = 1 << 17, li = 1 << 18, Nt = 1 << 19, oi = 1 << 20, Le = 1 << 25, dt = 65536, nn = 1 << 21, kt = 1 << 22, Qe = 1 << 23, ot = Symbol("$state"), ui = Symbol("legacy props"), vr = Symbol("attributes"), Mn = Symbol("class"), fi = Symbol("style"), Cn = Symbol("text"), Ut = new class extends Error {
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
const Ei = 1, Si = 2, hr = 4, Ti = 8, Ai = 16, Ri = 1, Mi = 4, Ci = 8, Ni = 16, Ii = 1, Oi = 2, ie = Symbol("uninitialized"), Pi = "http://www.w3.org/1999/xhtml";
function Di() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Li() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Fi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function _r(e) {
  return e === this.v;
}
function qi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function pr(e) {
  return !qi(e, this.v);
}
let _e = null;
function Tt(e) {
  _e = e;
}
function nt(e, t = !1, n) {
  _e = {
    p: _e,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      q
    ),
    l: null
  };
}
function rt(e) {
  var t = (
    /** @type {ComponentContext} */
    _e
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Dr(r);
  }
  return t.i = !0, _e = t.p, /** @type {T} */
  {};
}
function gr() {
  return !0;
}
let wt = [];
function Hi() {
  var e = wt;
  wt = [], ai(e);
}
function We(e) {
  if (wt.length === 0) {
    var t = wt;
    queueMicrotask(() => {
      t === wt && Hi();
    });
  }
  wt.push(e);
}
function mr(e) {
  var t = q;
  if (t === null)
    return H.f |= Qe, e;
  if ((t.f & Ct) === 0 && (t.f & Et) === 0)
    throw e;
  Je(e, t);
}
function Je(e, t) {
  if (!(t !== null && (t.f & xe) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & An) !== 0) {
        if ((t.f & Ct) === 0)
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
function ne(e, t) {
  e.f = e.f & ji | t;
}
function qn(e) {
  (e.f & Ae) !== 0 || e.deps === null ? ne(e, ae) : ne(e, Oe);
}
function br(e) {
  if (e !== null)
    for (const t of e)
      (t.f & ue) === 0 || (t.f & dt) === 0 || (t.f ^= dt, br(
        /** @type {Derived} */
        t.deps
      ));
}
function wr(e, t, n) {
  (e.f & le) !== 0 ? t.add(e) : (e.f & Oe) !== 0 && n.add(e), br(e.deps), ne(e, ae);
}
let Kt = !1;
function Bi(e) {
  var t = Kt;
  try {
    return Kt = !1, [e(), Kt];
  } finally {
    Kt = t;
  }
}
function vn(e) {
  var t = H, n = q;
  Me(null), qe(null);
  try {
    return e();
  } finally {
    Me(t), qe(n);
  }
}
function zi(e) {
  let t = 0, n = vt(0), r;
  return () => {
    zn() && (u(n), Lr(() => (t === 0 && (r = Mt(() => e(() => Ht(n)))), t += 1, () => {
      We(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ht(n));
      });
    })));
  };
}
var Ui = St | Nt;
function Vi(e, t, n, r) {
  new Gi(e, t, n, r);
}
class Gi {
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
  #m = zi(() => (this.#c = vt(this.#_), () => {
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
        q
      );
      l.b = this, l.f |= An, r(s);
    }, this.parent = /** @type {Effect} */
    q.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = Un(() => {
      this.#v();
    }, Ui);
  }
  #g() {
    try {
      this.#s = Te(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: i } = this.#b(t);
    We(i), n && (this.#l = Te(() => {
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
      n = !0, r && ki(), this.#l !== null && ft(this.#l, () => {
        this.#l = null;
      }), this.#h(() => {
        this.#v();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, i), r = !1;
      } catch (l) {
        Je(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = Te(() => t(this.#t)), We(() => {
      var n = this.#i = document.createDocumentFragment(), r = $e();
      n.append(r), this.#s = this.#h(() => Te(() => this.#o(r))), this.#u === 0 && (this.#t.before(n), this.#i = null, ft(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        V
      ));
    }));
  }
  #v() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#_ = 0, this.#s = Te(() => {
        this.#o(this.#t);
      }), this.#u > 0) {
        var t = this.#i = document.createDocumentFragment();
        Gn(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = Te(() => n(this.#t));
      } else
        this.#w(
          /** @type {Batch} */
          V
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
    wr(t, this.#d, this.#p);
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
    var n = q, r = H, i = _e;
    qe(this.#r), Me(this.#r), Tt(this.#r.ctx);
    try {
      return tt.ensure(), t();
    } catch (s) {
      return mr(s), null;
    } finally {
      qe(n), Me(r), Tt(i);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && ft(this.#n, () => {
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
    this.#k(t, n), this.#_ += t, !(!this.#c || this.#f) && (this.#f = !0, We(() => {
      this.#f = !1, this.#c && At(this.#c, this.#_);
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
    V?.is_fork ? (this.#s && V.skip_effect(this.#s), this.#n && V.skip_effect(this.#n), this.#l && V.skip_effect(this.#l), V.oncommit(() => {
      this.#E(t);
    })) : this.#E(t);
  }
  /**
   * @param {unknown} error
   */
  #E(t) {
    this.#s && (me(this.#s), this.#s = null), this.#n && (me(this.#n), this.#n = null), this.#l && (me(this.#l), this.#l = null);
    let n = this.#e.failed;
    const r = (i) => {
      const { reset: s, invoke_onerror: l } = this.#b(i);
      l(), n && (this.#l = this.#h(() => {
        try {
          return Te(() => {
            var o = (
              /** @type {Effect} */
              q
            );
            o.b = this, o.f |= An, n(
              this.#t,
              () => i,
              () => s
            );
          });
        } catch (o) {
          return Je(
            o,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    We(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (s) {
        Je(s, this.#r && this.#r.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof /** @type {any} */
      i.then == "function" ? i.then(
        r,
        /** @param {unknown} e */
        (s) => Je(s, this.#r && this.#r.parent)
      ) : r(i);
    });
  }
}
function Yi(e, t, n, r) {
  const i = jt;
  var s = e.filter((v) => !v.settled), l = t.map(i);
  if (n.length === 0 && s.length === 0) {
    r(l);
    return;
  }
  var o = (
    /** @type {Effect} */
    q
  ), a = Xi(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((v) => v.promise)) : null;
  function h(v) {
    if ((o.f & xe) === 0) {
      a();
      try {
        r([...l, ...v]);
      } catch (_) {
        Je(_, o);
      }
      rn();
    }
  }
  var c = yr();
  if (n.length === 0) {
    f.then(() => h([])).finally(c);
    return;
  }
  function d() {
    Promise.all(n.map((v) => /* @__PURE__ */ Ki(v))).then(h).catch((v) => Je(v, o)).finally(c);
  }
  f ? f.then(() => {
    a(), d(), rn();
  }) : d();
}
function Xi() {
  var e = (
    /** @type {Effect} */
    q
  ), t = H, n = _e, r = (
    /** @type {Batch} */
    V
  );
  return function(s = !0) {
    qe(e), Me(t), Tt(n), s && (e.f & xe) === 0 && (r?.activate(), r?.apply());
  };
}
function rn(e = !0) {
  qe(null), Me(null), Tt(null), e && V?.deactivate();
}
function yr() {
  var e = (
    /** @type {Effect} */
    q
  ), t = e.b, n = (
    /** @type {Batch} */
    V
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function jt(e) {
  var t = ue | le;
  return q !== null && (q.f |= Nt), {
    ctx: _e,
    deps: null,
    effects: null,
    equals: _r,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ie
    ),
    wv: 0,
    parent: q,
    ac: null
  };
}
const Dt = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function Ki(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    q
  );
  r === null && vi();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = vt(
    /** @type {V} */
    ie
  ), l = !H, o = /* @__PURE__ */ new Set();
  return us(() => {
    var a = (
      /** @type {Effect} */
      q
    ), f = cr();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, (v) => {
        v !== Ut && f.reject(v);
      }).finally(rn);
    } catch (v) {
      f.reject(v), rn();
    }
    var h = (
      /** @type {Batch} */
      V
    );
    if (l) {
      if ((a.f & Ct) !== 0)
        var c = yr();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        h.async_deriveds.get(a)?.reject(Dt);
      else
        for (const v of o.values())
          v.reject(Dt);
      o.add(f), h.async_deriveds.set(a, f);
    }
    const d = (v, _ = void 0) => {
      c?.(), o.delete(f), _ !== Dt && (h.activate(), _ ? (s.f |= Qe, At(s, _)) : ((s.f & Qe) !== 0 && (s.f ^= Qe), At(s, v)), h.deactivate());
    };
    f.promise.then(d, (v) => d(null, v || "unknown"));
  }), Pr(() => {
    for (const a of o)
      a.reject(Dt);
  }), new Promise((a) => {
    function f(h) {
      function c() {
        h === i ? a(s) : f(i);
      }
      h.then(c, c);
    }
    f(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Ee(e) {
  const t = /* @__PURE__ */ jt(e);
  return Br(t), t;
}
// @__NO_SIDE_EFFECTS__
function xr(e) {
  const t = /* @__PURE__ */ jt(e);
  return t.equals = pr, t;
}
function Wi(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      me(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Hn(e) {
  var t, n = q, r = e.parent;
  if (!Ue && r !== null && e.v !== ie && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (xe | pe)) !== 0)
    return Di(), e.v;
  qe(r);
  try {
    e.f &= ~dt, Wi(e), t = Gr(e);
  } finally {
    qe(n);
  }
  return t;
}
function kr(e) {
  var t = Hn(e);
  if (!e.equals(t) && (e.wv = Ur(), (!V?.is_fork || e.deps === null) && (V !== null ? (V.capture(e, t, !0), Nn?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    ne(e, ae);
    return;
  }
  Ue || (Ne !== null ? (zn() || V?.is_fork) && Ne.set(e, t) : qn(e));
}
function Ji(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && vn(() => {
        t.ac.abort(Ut), t.ac = null;
      }), t.fn !== null && (t.teardown = si), Bt(t, 0), Vn(t));
}
function Er(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Rt(t);
}
let En = null, gt = null, V = null, Nn = null, Ne = null, In = null, Sn = !1, yt = null, Zt = null;
var Xn = 0;
let Zi = 1;
class tt {
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
    gt === null ? En = gt = this : (gt.#e = this, this.#a = gt), gt = this;
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
        ne(i, le), n(i);
      for (i of r.m)
        ne(i, Oe), n(i);
    }
    this.#p.add(t);
  }
  #g() {
    this.#t = !0, Xn++ > 1e3 && (this.#h(), Qi());
    for (const a of this.#u)
      this.#f.delete(a), ne(a, le), this.schedule(a);
    for (const a of this.#f)
      ne(a, Oe), this.schedule(a);
    const t = this.#i;
    this.#i = [], this.apply();
    var n = yt = [], r = [], i = Zt = [];
    for (const a of t)
      try {
        this.#y(a, n, r);
      } catch (f) {
        throw Ar(a), this.#m() || this.discard(), f;
      }
    if (V = null, i.length > 0) {
      var s = tt.ensure();
      for (const a of i)
        s.schedule(a);
    }
    if (yt = null, Zt = null, this.#m()) {
      this.#v(r), this.#v(n);
      for (const [a, f] of this.#d)
        Tr(a, f);
      i.length > 0 && /** @type {unknown} */
      V.#g();
      return;
    }
    const l = this.#b();
    if (l) {
      this.#v(r), this.#v(n), l.#x(this);
      return;
    }
    this.#u.clear(), this.#f.clear();
    for (const a of this.#o) a(this);
    this.#o.clear(), Nn = this, Kn(r), Kn(n), Nn = null, this.#l?.resolve();
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      V
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
    t.f ^= ae;
    for (var i = t.first; i !== null; ) {
      var s = i.f, l = (s & (Re | ze)) !== 0, o = l && (s & ae) !== 0, a = o || (s & pe) !== 0 || this.#d.has(i);
      if (!a && i.fn !== null) {
        l ? i.f ^= ae : (s & Et) !== 0 ? n.push(i) : Gt(i) && ((s & Ce) !== 0 && this.#f.add(i), Rt(i));
        var f = i.first;
        if (f !== null) {
          i = f;
          continue;
        }
      }
      for (; i !== null; ) {
        var h = i.next;
        if (h !== null) {
          i = h;
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
      if (i !== null && !((r.f & ue) !== 0 && (r.f & (le | Oe)) === 0))
        for (const o of i) {
          var s = o.f;
          if ((s & ue) !== 0)
            n(
              /** @type {Derived} */
              o
            );
          else {
            var l = (
              /** @type {Effect} */
              o
            );
            s & (kt | Ce) && !this.async_deriveds.has(l) && (this.#f.delete(l), ne(l, le), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#h(), V = this, this.#g();
  }
  /**
   * @param {Effect[]} effects
   */
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      wr(t[n], this.#u, this.#f);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== ie && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & Qe) === 0 && (this.current.set(t, [n, r]), Ne?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    V = this;
  }
  deactivate() {
    V = null, Ne = null;
  }
  flush() {
    try {
      Sn = !0, V = this, this.#g();
    } finally {
      Xn = 0, In = null, yt = null, Zt = null, Sn = !1, V = null, Ne = null, ut.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Dt);
    this.#h(), this.#l?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#_.push(t);
  }
  #w() {
    for (let c = En; c !== null; c = c.#e) {
      var t = c.id < this.id, n = [];
      for (const [d, [v, _]] of this.current) {
        if (c.current.has(d)) {
          var r = (
            /** @type {[any, boolean]} */
            c.current.get(d)[0]
          );
          if (t && v !== r)
            c.current.set(d, [v, _]);
          else
            continue;
        }
        n.push(d);
      }
      if (t)
        for (const [d, v] of this.async_deriveds) {
          const _ = c.async_deriveds.get(d);
          _ && v.promise.then(_.resolve).catch(_.reject);
        }
      var i = [...c.current.keys()].filter(
        (d) => !/** @type {[any, boolean]} */
        c.current.get(d)[1]
      );
      if (!(!c.#t || i.length === 0)) {
        var s = i.filter((d) => !this.current.has(d));
        if (s.length === 0)
          t && c.discard();
        else if (n.length > 0) {
          if (t)
            for (const d of this.#p)
              c.unskip_effect(d, (v) => {
                (v.f & (Ce | kt)) !== 0 ? c.schedule(v) : c.#v([v]);
              });
          c.activate();
          var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
          for (var a of n)
            Sr(a, s, l, o);
          o = /* @__PURE__ */ new Map();
          var f = [...c.current].filter(([d, v]) => {
            const _ = this.current.get(d);
            return _ ? _[0] !== v[0] || _[1] !== v[1] : !0;
          }).map(([d]) => d);
          if (f.length > 0)
            for (const d of this.#_)
              (d.f & (xe | pe | tn)) === 0 && jn(d, f, o) && ((d.f & (kt | Ce)) !== 0 ? (ne(d, le), c.schedule(d)) : c.#u.add(d));
          if (c.#i.length > 0 && !c.#c) {
            c.apply();
            for (var h of c.#i)
              c.#y(h, [], []);
            c.#i = [];
          }
          c.deactivate();
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
    this.#c || (this.#c = !0, We(() => {
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
    return (this.#l ??= cr()).promise;
  }
  static ensure() {
    if (V === null) {
      const t = V = new tt();
      Sn || We(() => {
        t.#t || t.flush();
      });
    }
    return V;
  }
  apply() {
    {
      Ne = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (In = t, t.b?.is_pending && (t.f & (Et | dn | dr)) !== 0 && (t.f & Ct) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (yt !== null && n === q && (H === null || (H.f & ue) === 0))
        return;
      if ((r & (ze | Re)) !== 0) {
        if ((r & ae) === 0)
          return;
        n.f ^= ae;
      }
    }
    this.#i.push(n);
  }
  #h() {
    if (this.linked) {
      var t = this.#a, n = this.#e;
      t === null ? En = n : t.#e = n, n === null ? gt = t : n.#a = t, this.linked = !1;
    }
  }
}
function Qi() {
  try {
    mi();
  } catch (e) {
    Je(e, In);
  }
}
let je = null;
function Kn(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (xe | pe)) === 0 && Gt(r) && (je = /* @__PURE__ */ new Set(), Rt(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && qr(r), je?.size > 0)) {
        ut.clear();
        for (const i of je) {
          if ((i.f & (xe | pe)) !== 0) continue;
          const s = [i];
          let l = i.parent;
          for (; l !== null; )
            je.has(l) && (je.delete(l), s.push(l)), l = l.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const a = s[o];
            (a.f & (xe | pe)) === 0 && Rt(a);
          }
        }
        je.clear();
      }
    }
    je = null;
  }
}
function Sr(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & ue) !== 0 ? Sr(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (kt | Ce)) !== 0 && (s & le) === 0 && jn(i, t, r) && (ne(i, le), Bn(
        /** @type {Effect} */
        i
      ));
    }
}
function jn(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (en.call(t, i))
        return !0;
      if ((i.f & ue) !== 0 && jn(
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
function Bn(e) {
  V.schedule(e);
}
function Tr(e, t) {
  if (!((e.f & Re) !== 0 && (e.f & ae) !== 0)) {
    (e.f & le) !== 0 ? t.d.push(e) : (e.f & Oe) !== 0 && t.m.push(e), ne(e, ae);
    for (var n = e.first; n !== null; )
      Tr(n, t), n = n.next;
  }
}
function Ar(e) {
  ne(e, ae);
  for (var t = e.first; t !== null; )
    Ar(t), t = t.next;
}
let sn = /* @__PURE__ */ new Set();
const ut = /* @__PURE__ */ new Map();
let Rr = !1;
function vt(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: _r,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function K(e, t) {
  const n = vt(e);
  return Br(n), n;
}
// @__NO_SIDE_EFFECTS__
function $i(e, t = !1, n = !0) {
  const r = vt(e);
  return t || (r.equals = pr), r;
}
function T(e, t, n = !1) {
  H !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ie || (H.f & tn) !== 0) && gr() && (H.f & (ue | Ce | kt | tn)) !== 0 && (Fe === null || !Fe.has(e)) && xi();
  let r = n ? Ze(t) : t;
  return At(e, r, Zt);
}
function At(e, t, n = null) {
  if (!e.equals(t)) {
    ut.set(e, Ue ? t : e.v);
    var r = tt.ensure();
    if (r.capture(e, t), (e.f & ue) !== 0) {
      const i = (
        /** @type {Derived} */
        e
      );
      (e.f & le) !== 0 && Hn(i), Ne === null && qn(i);
    }
    e.wv = Ur(), Mr(e, le, n), q !== null && (q.f & ae) !== 0 && (q.f & (Re | ze)) === 0 && (Se === null ? ds([e]) : Se.push(e)), !r.is_fork && sn.size > 0 && !Rr && es();
  }
  return t;
}
function es() {
  Rr = !1;
  for (const e of sn) {
    (e.f & ae) !== 0 && ne(e, Oe);
    let t;
    try {
      t = Gt(e);
    } catch {
      t = !0;
    }
    t && Rt(e);
  }
  sn.clear();
}
function Ht(e) {
  T(e, e.v + 1);
}
function Mr(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var l = r[s], o = l.f, a = (o & le) === 0;
      if (a && ne(l, t), (o & tn) !== 0)
        sn.add(
          /** @type {Effect} */
          l
        );
      else if ((o & ue) !== 0) {
        var f = (
          /** @type {Derived} */
          l
        );
        Ne?.delete(f), (o & dt) === 0 && (o & Ae && (q === null || (q.f & nn) === 0) && (l.f |= dt), Mr(f, Oe, n));
      } else if (a) {
        var h = (
          /** @type {Effect} */
          l
        );
        (o & Ce) !== 0 && je !== null && je.add(h), n !== null ? n.push(h) : Bn(h);
      }
    }
}
function Ze(e) {
  if (typeof e != "object" || e === null || ot in e)
    return e;
  const t = ii(e);
  if (t !== ni && t !== ri)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Fn(e), i = /* @__PURE__ */ K(0), s = ct, l = (o) => {
    if (ct === s)
      return o();
    var a = H, f = ct;
    Me(null), Qn(s);
    var h = o();
    return Me(a), Qn(f), h;
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
        var h = n.get(a);
        return h === void 0 ? l(() => {
          var c = /* @__PURE__ */ K(f.value);
          return n.set(a, c), c;
        }) : T(h, f.value, !0), !0;
      },
      deleteProperty(o, a) {
        var f = n.get(a);
        if (f === void 0) {
          if (a in o) {
            const h = l(() => /* @__PURE__ */ K(ie));
            n.set(a, h), Ht(i);
          }
        } else
          T(f, ie), Ht(i);
        return !0;
      },
      get(o, a, f) {
        if (a === ot)
          return e;
        var h = n.get(a), c = a in o;
        if (h === void 0 && (!c || xt(o, a)?.writable) && (h = l(() => {
          var v = Ze(c ? o[a] : ie), _ = /* @__PURE__ */ K(v);
          return _;
        }), n.set(a, h)), h !== void 0) {
          var d = u(h);
          return d === ie ? void 0 : d;
        }
        return Reflect.get(o, a, f);
      },
      getOwnPropertyDescriptor(o, a) {
        var f = Reflect.getOwnPropertyDescriptor(o, a);
        if (f && "value" in f) {
          var h = n.get(a);
          h && (f.value = u(h));
        } else if (f === void 0) {
          var c = n.get(a), d = c?.v;
          if (c !== void 0 && d !== ie)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return f;
      },
      has(o, a) {
        if (a === ot)
          return !0;
        var f = n.get(a), h = f !== void 0 && f.v !== ie || Reflect.has(o, a);
        if (f !== void 0 || q !== null && (!h || xt(o, a)?.writable)) {
          f === void 0 && (f = l(() => {
            var d = h ? Ze(o[a]) : ie, v = /* @__PURE__ */ K(d);
            return v;
          }), n.set(a, f));
          var c = u(f);
          if (c === ie)
            return !1;
        }
        return h;
      },
      set(o, a, f, h) {
        var c = n.get(a), d = a in o;
        if (r && a === "length")
          for (var v = f; v < /** @type {Source<number>} */
          c.v; v += 1) {
            var _ = n.get(v + "");
            _ !== void 0 ? T(_, ie) : v in o && (_ = l(() => /* @__PURE__ */ K(ie)), n.set(v + "", _));
          }
        if (c === void 0)
          (!d || xt(o, a)?.writable) && (c = l(() => /* @__PURE__ */ K(void 0)), T(c, Ze(f)), n.set(a, c));
        else {
          d = c.v !== ie;
          var m = l(() => Ze(f));
          T(c, m);
        }
        var p = Reflect.getOwnPropertyDescriptor(o, a);
        if (p?.set && p.set.call(h, f), !d) {
          if (r && typeof a == "string") {
            var g = (
              /** @type {Source<number>} */
              n.get("length")
            ), b = Number(a);
            Number.isInteger(b) && b >= g.v && T(g, b + 1);
          }
          Ht(i);
        }
        return !0;
      },
      ownKeys(o) {
        u(i);
        var a = Reflect.ownKeys(o).filter((c) => {
          var d = n.get(c);
          return d === void 0 || d.v !== ie;
        });
        for (var [f, h] of n)
          h.v !== ie && !(f in o) && a.push(f);
        return a;
      },
      setPrototypeOf() {
        yi();
      }
    }
  );
}
function Wn(e) {
  try {
    if (e !== null && typeof e == "object" && ot in e)
      return e[ot];
  } catch {
  }
  return e;
}
function ts(e, t) {
  return Object.is(Wn(e), Wn(t));
}
var Jn, Cr, Nr, Ir;
function ns() {
  if (Jn === void 0) {
    Jn = window, Cr = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Nr = xt(t, "firstChild").get, Ir = xt(t, "nextSibling").get, Yn(e) && (e[Mn] = void 0, e[vr] = null, e[fi] = void 0, e.__e = void 0), Yn(n) && (n[Cn] = void 0);
  }
}
function $e(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function an(e) {
  return (
    /** @type {TemplateNode | null} */
    Nr.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Vt(e) {
  return (
    /** @type {TemplateNode | null} */
    Ir.call(e)
  );
}
function y(e, t) {
  return /* @__PURE__ */ an(e);
}
function De(e, t = !1) {
  {
    var n = /* @__PURE__ */ an(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Vt(n) : n;
  }
}
function S(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Vt(r);
  return r;
}
function rs(e) {
  e.textContent = "";
}
function Or() {
  return !1;
}
function is(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function ss(e) {
  q === null && (H === null && gi(), pi()), Ue && _i();
}
function as(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Ve(e, t) {
  var n = q;
  n !== null && (n.f & pe) !== 0 && (e |= pe);
  var r = {
    ctx: _e,
    deps: null,
    nodes: null,
    f: e | le | Ae,
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
  V?.register_created_effect(r);
  var i = r;
  if ((e & Et) !== 0)
    yt !== null ? yt.push(r) : tt.ensure().schedule(r);
  else if (t !== null) {
    try {
      Rt(r);
    } catch (l) {
      throw me(r), l;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Nt) === 0 && (i = i.first, (e & Ce) !== 0 && (e & St) !== 0 && i !== null && (i.f |= St));
  }
  if (i !== null && (i.parent = n, n !== null && as(i, n), H !== null && (H.f & ue) !== 0 && (e & ze) === 0)) {
    var s = (
      /** @type {Derived} */
      H
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function zn() {
  return H !== null && !Ie;
}
function Pr(e) {
  const t = Ve(dn, null);
  return ne(t, ae), t.teardown = e, t;
}
function ln(e) {
  ss();
  var t = (
    /** @type {Effect} */
    q.f
  ), n = !H && (t & Re) !== 0 && _e !== null && !_e.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      _e
    );
    (r.e ??= []).push(e);
  } else
    return Dr(e);
}
function Dr(e) {
  return Ve(Et | oi, e);
}
function ls(e) {
  tt.ensure();
  const t = Ve(ze | Nt, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ft(t, () => {
      me(t), r(void 0);
    }) : (me(t), r(void 0));
  });
}
function os(e) {
  return Ve(Et, e);
}
function us(e) {
  return Ve(kt | Nt, e);
}
function Lr(e, t = 0) {
  return Ve(dn | t, e);
}
function G(e, t = [], n = [], r = []) {
  Yi(r, t, n, (i) => {
    Ve(dn, () => {
      e(...i.map(u));
    });
  });
}
function Un(e, t = 0) {
  var n = Ve(Ce | t, e);
  return n;
}
function Te(e) {
  return Ve(Re | Nt, e);
}
function Fr(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Ue, r = H;
    Zn(!0), Me(null);
    try {
      t.call(null);
    } finally {
      Zn(n), Me(r);
    }
  }
}
function Vn(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && vn(() => {
      i.abort(Ut);
    });
    var r = n.next;
    (n.f & ze) !== 0 ? n.parent = null : me(n, t), n = r;
  }
}
function fs(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Re) === 0 && me(t), t = n;
  }
}
function me(e, t = !0) {
  var n = !1;
  (t || (e.f & li) !== 0) && e.nodes !== null && e.nodes.end !== null && (cs(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Rn, Vn(e, t && !n), Bt(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Fr(e), e.f ^= Rn, e.f |= xe;
  var i = e.parent;
  i !== null && i.first !== null && qr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function cs(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Vt(e);
    e.remove(), e = n;
  }
}
function qr(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ft(e, t, n = !0) {
  var r = [];
  Hr(e, r, !0);
  var i = () => {
    n && me(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var l = () => --s || i();
    for (var o of r)
      o.out(l);
  } else
    i();
}
function Hr(e, t, n) {
  if ((e.f & pe) === 0) {
    e.f ^= pe;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const o of r)
        (o.is_global || n) && t.push(o);
    for (var i = e.first; i !== null; ) {
      var s = i.next;
      if ((i.f & ze) === 0) {
        var l = (i.f & St) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (i.f & Re) !== 0 && (e.f & Ce) !== 0;
        Hr(i, t, l ? n : !1);
      }
      i = s;
    }
  }
}
function on(e) {
  jr(e, !0);
}
function jr(e, t) {
  if ((e.f & pe) !== 0) {
    e.f ^= pe, (e.f & ae) === 0 && (ne(e, le), tt.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & St) !== 0 || (n.f & Re) !== 0;
      jr(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const l of s)
        (l.is_global || t) && l.in();
  }
}
function Gn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Vt(n);
      t.append(n), n = i;
    }
}
let Qt = !1, Ue = !1;
function Zn(e) {
  Ue = e;
}
let H = null, Ie = !1;
function Me(e) {
  H = e;
}
let q = null;
function qe(e) {
  q = e;
}
let Fe = null;
function Br(e) {
  H !== null && (Fe ??= /* @__PURE__ */ new Set()).add(e);
}
let ge = null, we = 0, Se = null;
function ds(e) {
  Se = e;
}
let zr = 1, lt = 0, ct = lt;
function Qn(e) {
  ct = e;
}
function Ur() {
  return ++zr;
}
function Gt(e) {
  var t = e.f;
  if ((t & le) !== 0)
    return !0;
  if (t & ue && (e.f &= ~dt), (t & Oe) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Gt(
        /** @type {Derived} */
        s
      ) && kr(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & Ae) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ne === null && ne(e, ae);
  }
  return !1;
}
function Vr(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Fe !== null && Fe.has(e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & ue) !== 0 ? Vr(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? ne(s, le) : (s.f & ae) !== 0 && ne(s, Oe), Bn(
        /** @type {Effect} */
        s
      ));
    }
}
function Gr(e) {
  var t = ge, n = we, r = Se, i = H, s = Fe, l = _e, o = Ie, a = ct, f = e.f;
  ge = /** @type {null | Value[]} */
  null, we = 0, Se = null, H = (f & (Re | ze)) === 0 ? e : null, Fe = null, Tt(e.ctx), Ie = !1, ct = ++lt, e.ac !== null && (vn(() => {
    e.ac.abort(Ut);
  }), e.ac = null);
  try {
    e.f |= nn;
    var h = (
      /** @type {Function} */
      e.fn
    ), c = h();
    e.f |= Ct;
    var d = e.deps, v = V?.is_fork;
    if (ge !== null) {
      var _;
      if (v || Bt(e, we), d !== null && we > 0)
        for (d.length = we + ge.length, _ = 0; _ < ge.length; _++)
          d[we + _] = ge[_];
      else
        e.deps = d = ge;
      if (zn() && (e.f & Ae) !== 0)
        for (_ = we; _ < d.length; _++)
          (d[_].reactions ??= []).push(e);
    } else !v && d !== null && we < d.length && (Bt(e, we), d.length = we);
    if (gr() && Se !== null && !Ie && d !== null && (e.f & (ue | Oe | le)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      Se.length; _++)
        Vr(
          Se[_],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (lt++, i.deps !== null)
        for (let m = 0; m < n; m += 1)
          i.deps[m].rv = lt;
      if (t !== null)
        for (const m of t)
          m.rv = lt;
      Se !== null && (r === null ? r = Se : r.push(.../** @type {Source[]} */
      Se));
    }
    return (e.f & Qe) !== 0 && (e.f ^= Qe), c;
  } catch (m) {
    return mr(m);
  } finally {
    e.f ^= nn, ge = t, we = n, Se = r, H = i, Fe = s, Tt(l), Ie = o, ct = a;
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
  if (n === null && (t.f & ue) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ge === null || !en.call(ge, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & Ae) !== 0 && (s.f ^= Ae, s.f &= ~dt), s.v !== ie && qn(s), s.ac !== null && vn(() => {
      s.ac.abort(Ut), s.ac = null, ne(s, le);
    }), Ji(s), Bt(s, 0);
  }
}
function Bt(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      vs(e, n[r]);
}
function Rt(e) {
  var t = e.f;
  if ((t & xe) === 0) {
    ne(e, ae);
    var n = q, r = Qt;
    q = e, Qt = (t & (Re | ze)) === 0;
    try {
      (t & (Ce | dr)) !== 0 ? fs(e) : Vn(e), Fr(e);
      var i = Gr(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = zr;
      var s;
    } finally {
      Qt = r, q = n;
    }
  }
}
function u(e) {
  var t = e.f, n = (t & ue) !== 0;
  if (H !== null && !Ie) {
    var r = q !== null && (q.f & xe) !== 0;
    if (!r && (Fe === null || !Fe.has(e))) {
      var i = H.deps;
      if ((H.f & nn) !== 0)
        e.rv < lt && (e.rv = lt, ge === null && i !== null && i[we] === e ? we++ : ge === null ? ge = [e] : ge.push(e));
      else {
        H.deps ??= [], en.call(H.deps, e) || H.deps.push(e);
        var s = e.reactions;
        s === null ? e.reactions = [H] : en.call(s, H) || s.push(H);
      }
    }
  }
  if (Ue && ut.has(e))
    return ut.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Ue) {
      var o = l.v;
      return ((l.f & ae) === 0 && l.reactions !== null || Xr(l)) && (o = Hn(l)), ut.set(l, o), o;
    }
    var a = (l.f & Ae) === 0 && !Ie && H !== null && (Qt || (H.f & Ae) !== 0), f = (l.f & Ct) === 0;
    Gt(l) && (a && (l.f |= Ae), kr(l)), a && !f && (Er(l), Yr(l));
  }
  if (Ne?.has(e))
    return Ne.get(e);
  if ((e.f & Qe) !== 0)
    throw e.v;
  return e.v;
}
function Yr(e) {
  if (e.f |= Ae, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & ue) !== 0 && (t.f & Ae) === 0 && (Er(
        /** @type {Derived} */
        t
      ), Yr(
        /** @type {Derived} */
        t
      ));
}
function Xr(e) {
  if (e.v === ie) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ut.has(t) || (t.f & ue) !== 0 && Xr(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Mt(e) {
  var t = Ie;
  try {
    return Ie = !0, e();
  } finally {
    Ie = t;
  }
}
const hs = ["touchstart", "touchmove"];
function _s(e) {
  return hs.includes(e);
}
const Lt = Symbol("events"), Kr = /* @__PURE__ */ new Set(), On = /* @__PURE__ */ new Set();
function oe(e, t, n) {
  (t[Lt] ??= {})[e] = n;
}
function It(e) {
  for (var t = 0; t < e.length; t++)
    Kr.add(e[t]);
  for (var n of On)
    n(e);
}
let $n = null;
function er(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  $n = e;
  var l = 0, o = $n === e && e[Lt];
  if (o) {
    var a = i.indexOf(o);
    if (a !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Lt] = t;
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
    var h = H, c = q;
    Me(null), qe(null);
    try {
      for (var d, v = []; s !== null && s !== t; ) {
        try {
          var _ = s[Lt]?.[r];
          _ != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && _.call(s, e);
        } catch (m) {
          d ? v.push(m) : d = m;
        }
        if (e.cancelBubble) break;
        l++, s = l < i.length ? (
          /** @type {Element} */
          i[l]
        ) : null;
      }
      if (d) {
        for (let m of v)
          queueMicrotask(() => {
            throw m;
          });
        throw d;
      }
    } finally {
      e[Lt] = t, delete e.currentTarget, Me(h), qe(c);
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
function Pn(e, t) {
  var n = (
    /** @type {Effect} */
    q
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function L(e, t) {
  var n = (t & Ii) !== 0, r = (t & Oi) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = ms(s ? e : "<!>" + e), n || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ an(i)));
    var l = (
      /** @type {TemplateNode} */
      r || Cr ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ an(l)
      ), a = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      Pn(o, a);
    } else
      Pn(l, l);
    return l;
  };
}
function Wr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = $e();
  return e.append(t, n), Pn(t, n), e;
}
function P(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function M(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[Cn] ??= e.nodeValue) && (e[Cn] = n, e.nodeValue = `${n}`);
}
function bs(e, t) {
  return ws(e, t);
}
const Wt = /* @__PURE__ */ new Map();
function ws(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: l = !0, transformError: o }) {
  ns();
  var a = void 0, f = ls(() => {
    var h = n ?? t.appendChild($e());
    Vi(
      /** @type {TemplateNode} */
      h,
      {
        pending: () => {
        }
      },
      (v) => {
        nt({});
        var _ = (
          /** @type {ComponentContext} */
          _e
        );
        s && (_.c = s), i && (r.$$events = i), a = e(v, r) || {}, rt();
      },
      o
    );
    var c = /* @__PURE__ */ new Set(), d = (v) => {
      for (var _ = 0; _ < v.length; _++) {
        var m = v[_];
        if (!c.has(m)) {
          c.add(m);
          var p = _s(m);
          for (const k of [t, document]) {
            var g = Wt.get(k);
            g === void 0 && (g = /* @__PURE__ */ new Map(), Wt.set(k, g));
            var b = g.get(m);
            b === void 0 ? (k.addEventListener(m, er, { passive: p }), g.set(m, 1)) : g.set(m, b + 1);
          }
        }
      }
    };
    return d(cn(Kr)), On.add(d), () => {
      for (var v of c)
        for (const p of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            Wt.get(p)
          ), m = (
            /** @type {number} */
            _.get(v)
          );
          --m == 0 ? (p.removeEventListener(v, er), _.delete(v), _.size === 0 && Wt.delete(p)) : _.set(v, m);
        }
      On.delete(d), h !== n && h.parentNode?.removeChild(h);
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
        on(r), this.#o.delete(n);
      else {
        var i = this.#e.get(n);
        i && (on(i.effect), this.#a.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, l] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const o = this.#e.get(l);
        o && (me(o.effect), this.#e.delete(l));
      }
      for (const [s, l] of this.#a) {
        if (s === n || this.#o.has(s)) continue;
        const o = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var f = document.createDocumentFragment();
            Gn(l, f), f.append($e()), this.#e.set(s, { effect: l, fragment: f });
          } else
            me(l);
          this.#o.delete(s), this.#a.delete(s);
        };
        this.#r || !r ? (this.#o.add(s), ft(l, o, !1)) : o();
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
      n.includes(r) || (me(i.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      V
    ), i = Or();
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), l = $e();
        s.append(l), this.#e.set(t, {
          effect: Te(() => n(l)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          Te(() => n(this.anchor))
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
function ee(e, t, n = !1) {
  var r = new xs(e), i = n ? St : 0;
  function s(l, o) {
    r.ensure(l, o);
  }
  Un(() => {
    var l = !1;
    t((o, a = 0) => {
      l = !0, s(a, o);
    }), l || s(-1, null);
  }, i);
}
function Dn(e, t) {
  return t;
}
function ks(e, t, n) {
  for (var r = [], i = t.length, s, l = t.length, o = 0; o < i; o++) {
    let c = t[o];
    ft(
      c,
      () => {
        if (s) {
          if (s.pending.delete(c), s.done.add(c), s.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Ln(e, cn(s.done)), d.delete(s), d.size === 0 && (e.outrogroups = null);
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
      ), h = (
        /** @type {Element} */
        f.parentNode
      );
      rs(h), h.append(f), e.items.clear();
    }
    Ln(e, t, !a);
  } else
    s = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(s);
}
function Ln(e, t, n = !0) {
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
      s.f |= Le;
      const l = document.createDocumentFragment();
      Gn(s, l);
    } else
      me(t[i], n);
  }
}
var tr;
function zt(e, t, n, r, i, s = null) {
  var l = e, o = /* @__PURE__ */ new Map(), a = (t & hr) !== 0;
  if (a) {
    var f = (
      /** @type {Element} */
      e
    );
    l = f.appendChild($e());
  }
  var h = null, c = /* @__PURE__ */ xr(() => {
    var k = n();
    return (
      /** @type {V[]} */
      Fn(k) ? k : k == null ? [] : cn(k)
    );
  }), d, v = /* @__PURE__ */ new Map(), _ = !0;
  function m(k) {
    (b.effect.f & xe) === 0 && (b.pending.delete(k), b.fallback = h, Es(b, d, l, t, r), h !== null && (d.length === 0 ? (h.f & Le) === 0 ? on(h) : (h.f ^= Le, Ft(h, null, l)) : ft(h, () => {
      h = null;
    })));
  }
  function p(k) {
    b.pending.delete(k);
  }
  var g = Un(() => {
    d = /** @type {V[]} */
    u(c);
    for (var k = d.length, E = /* @__PURE__ */ new Set(), C = (
      /** @type {Batch} */
      V
    ), B = Or(), D = 0; D < k; D += 1) {
      var F = d[D], O = r(F, D), N = _ ? null : o.get(O);
      N ? (N.v && At(N.v, F), N.i && At(N.i, D), B && C.unskip_effect(N.e)) : (N = Ss(
        o,
        _ ? l : tr ??= $e(),
        F,
        O,
        D,
        i,
        t,
        n
      ), _ || (N.e.f |= Le), o.set(O, N)), E.add(O);
    }
    if (k === 0 && s && !h && (_ ? h = Te(() => s(l)) : (h = Te(() => s(tr ??= $e())), h.f |= Le)), k > E.size && hi(), !_)
      if (v.set(C, E), B) {
        for (const [W, z] of o)
          E.has(W) || C.skip_effect(z.e);
        C.oncommit(m), C.ondiscard(p);
      } else
        m(C);
    u(c);
  }), b = { effect: g, items: o, pending: v, outrogroups: null, fallback: h };
  _ = !1;
}
function Pt(e) {
  for (; e !== null && (e.f & Re) === 0; )
    e = e.next;
  return e;
}
function Es(e, t, n, r, i) {
  var s = (r & Ti) !== 0, l = t.length, o = e.items, a = Pt(e.effect.first), f, h = null, c, d = [], v = [], _, m, p, g;
  if (s)
    for (g = 0; g < l; g += 1)
      _ = t[g], m = i(_, g), p = /** @type {EachItem} */
      o.get(m).e, (p.f & Le) === 0 && (p.nodes?.a?.measure(), (c ??= /* @__PURE__ */ new Set()).add(p));
  for (g = 0; g < l; g += 1) {
    if (_ = t[g], m = i(_, g), p = /** @type {EachItem} */
    o.get(m).e, e.outrogroups !== null)
      for (const N of e.outrogroups)
        N.pending.delete(p), N.done.delete(p);
    if ((p.f & pe) !== 0 && (on(p), s && (p.nodes?.a?.unfix(), (c ??= /* @__PURE__ */ new Set()).delete(p))), (p.f & Le) !== 0)
      if (p.f ^= Le, p === a)
        Ft(p, null, n);
      else {
        var b = h ? h.next : a;
        p === e.effect.last && (e.effect.last = p.prev), p.prev && (p.prev.next = p.next), p.next && (p.next.prev = p.prev), Ke(e, h, p), Ke(e, p, b), Ft(p, b, n), h = p, d = [], v = [], a = Pt(h.next);
        continue;
      }
    if (p !== a) {
      if (f !== void 0 && f.has(p)) {
        if (d.length < v.length) {
          var k = v[0], E;
          h = k.prev;
          var C = d[0], B = d[d.length - 1];
          for (E = 0; E < d.length; E += 1)
            Ft(d[E], k, n);
          for (E = 0; E < v.length; E += 1)
            f.delete(v[E]);
          Ke(e, C.prev, B.next), Ke(e, h, C), Ke(e, B, k), a = k, h = B, g -= 1, d = [], v = [];
        } else
          f.delete(p), Ft(p, a, n), Ke(e, p.prev, p.next), Ke(e, p, h === null ? e.effect.first : h.next), Ke(e, h, p), h = p;
        continue;
      }
      for (d = [], v = []; a !== null && a !== p; )
        (f ??= /* @__PURE__ */ new Set()).add(a), v.push(a), a = Pt(a.next);
      if (a === null)
        continue;
    }
    (p.f & Le) === 0 && d.push(p), h = p, a = Pt(p.next);
  }
  if (e.outrogroups !== null) {
    for (const N of e.outrogroups)
      N.pending.size === 0 && (Ln(e, cn(N.done)), e.outrogroups?.delete(N));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (a !== null || f !== void 0) {
    var D = [];
    if (f !== void 0)
      for (p of f)
        (p.f & pe) === 0 && D.push(p);
    for (; a !== null; )
      (a.f & pe) === 0 && a !== e.fallback && D.push(a), a = Pt(a.next);
    var F = D.length;
    if (F > 0) {
      var O = (r & hr) !== 0 && l === 0 ? n : null;
      if (s) {
        for (g = 0; g < F; g += 1)
          D[g].nodes?.a?.measure();
        for (g = 0; g < F; g += 1)
          D[g].nodes?.a?.fix();
      }
      ks(e, D, O);
    }
  }
  s && We(() => {
    if (c !== void 0)
      for (p of c)
        p.nodes?.a?.apply();
  });
}
function Ss(e, t, n, r, i, s, l, o) {
  var a = (l & Ei) !== 0 ? (l & Ai) === 0 ? /* @__PURE__ */ $i(n, !1, !1) : vt(n) : null, f = (l & Si) !== 0 ? vt(i) : null;
  return {
    v: a,
    i: f,
    e: Te(() => (s(t, a ?? n, f ?? i, o), () => {
      e.delete(r);
    }))
  };
}
function Ft(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, s = t && (t.f & Le) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Vt(r)
      );
      if (s.before(r), r === i)
        return;
      r = l;
    }
}
function Ke(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const nr = [...` 	
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
          (l === 0 || nr.includes(r[l - 1])) && (o === r.length || nr.includes(r[o])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(o + 1) : l = o;
        }
  }
  return r === "" ? null : r;
}
function et(e, t, n, r, i, s) {
  var l = (
    /** @type {any} */
    e[Mn]
  );
  if (l !== n || l === void 0) {
    var o = Ts(n, r, s);
    o == null ? e.removeAttribute("class") : e.className = o, e[Mn] = n;
  } else if (s && i !== s)
    for (var a in s) {
      var f = !!s[a];
      (i == null || f !== !!i[a]) && e.classList.toggle(a, f);
    }
  return s;
}
function qt(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Fn(t))
      return Li();
    for (var r of e.options)
      r.selected = t.includes(rr(r));
    return;
  }
  for (r of e.options) {
    var i = rr(r);
    if (ts(i, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Jt(e) {
  var t = new MutationObserver(() => {
    "__value" in e && qt(e, e.__value);
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
  }), Pr(() => {
    t.disconnect();
  });
}
function rr(e) {
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
    e[vr] ??= {
      [As]: e.nodeName.includes("-"),
      [Rs]: e.namespaceURI === Pi
    }
  );
}
function Tn(e, t) {
  return e === t || e?.[ot] === t;
}
function ir(e = {}, t, n, r) {
  var i = (
    /** @type {ComponentContext} */
    _e.r
  ), s = (
    /** @type {Effect} */
    q
  );
  return os(() => {
    var l, o;
    return Lr(() => {
      l = o, o = [], Mt(() => {
        Tn(n(...o), e) || (t(e, ...o), l && Tn(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let a = s;
      for (; a !== i && a.parent !== null && a.parent.f & Rn; )
        a = a.parent;
      const f = () => {
        o && Tn(n(...o), e) && t(null, ...o);
      }, h = a.teardown;
      a.teardown = () => {
        f(), h?.();
      };
    };
  }), e;
}
function se(e, t, n, r) {
  var i = !0, s = (n & Ci) !== 0, l = (n & Ni) !== 0, o = (
    /** @type {V} */
    r
  ), a = !0, f = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), h = () => l && i ? (f ??= /* @__PURE__ */ jt(
    /** @type {() => V} */
    r
  ), u(f)) : (a && (a = !1, o = l ? Mt(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), o);
  let c;
  if (s) {
    var d = ot in e || ui in e;
    c = xt(e, t)?.set ?? (d && t in e ? (E) => e[t] = E : void 0);
  }
  var v, _ = !1;
  s ? [v, _] = Bi(() => (
    /** @type {V} */
    e[t]
  )) : v = /** @type {V} */
  e[t], v === void 0 && r !== void 0 && (v = h(), c && (bi(), c(v)));
  var m;
  if (m = () => {
    var E = (
      /** @type {V} */
      e[t]
    );
    return E === void 0 ? h() : (a = !0, E);
  }, (n & Mi) === 0)
    return m;
  if (c) {
    var p = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(E, C) {
        return arguments.length > 0 ? ((!C || p || _) && c(C ? m() : E), E) : m();
      })
    );
  }
  var g = !1, b = ((n & Ri) !== 0 ? jt : xr)(() => (g = !1, m()));
  s && u(b);
  var k = (
    /** @type {Effect} */
    q
  );
  return (
    /** @type {() => V} */
    (function(E, C) {
      if (arguments.length > 0) {
        const B = C ? u(b) : s ? Ze(E) : E;
        return T(b, B), g = !0, o !== void 0 && (o = B), E;
      }
      return Ue && g || (k.f & xe) !== 0 ? b.v : u(b);
    })
  );
}
function Jr(e) {
  _e === null && di(), ln(() => {
    const t = Mt(e);
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
async function mt(e, t = {}) {
  const n = await fetch(e + Os(t));
  if (!n.ok) {
    const r = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  }
  return n.json();
}
async function bt(e, t) {
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
function sr(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const ke = {
  // --- reads
  photos: (e) => mt("/api/photos", e),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => mt("/api/triage/counts", { ...sr(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => mt("/api/triage/files"),
  screen: (e, t = {}) => mt("/api/triage/screen", { name: e, ...t }),
  page: (e, t, n = 500) => mt("/api/triage/page", { ...sr(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => mt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => bt("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => bt("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => bt("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => bt("/api/triage/override", { sha256: e, decision: t }),
  // --- the one surface that leaves the process
  revealPhoto: (e) => bt("/api/reveal", { id: e }),
  revealOrigin: (e) => bt("/api/reveal", { origin: e })
};
function Ps() {
  let e = 0, t = 0;
  return async function(r) {
    const i = ++e, s = await r();
    return i <= t ? { stale: !0, value: void 0 } : (t = i, { stale: !1, value: s });
  };
}
function Ds(e, t) {
  let n = 0;
  const r = (...i) => {
    clearTimeout(n), n = setTimeout(() => e(...i), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...i) => {
    clearTimeout(n), e(...i);
  }, r;
}
const ar = ["B", "KB", "MB", "GB", "TB"];
function Be(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < ar.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${ar[n]}`;
}
function ye(e) {
  return (Number(e) || 0).toLocaleString();
}
const un = "G:\\photos", lr = [
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
      value: t ? `${un}\\${t}\\${e.key}` : `${un}\\${e.key}`
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
function Ls(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
var Fs = /* @__PURE__ */ L('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), qs = /* @__PURE__ */ L('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), Hs = /* @__PURE__ */ L('<div class="line muted svelte-1vgp6n7">…</div>'), js = /* @__PURE__ */ L('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), Bs = /* @__PURE__ */ L('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), zs = /* @__PURE__ */ L('<div class="line muted svelte-1vgp6n7"> </div>'), Us = /* @__PURE__ */ L('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function Vs(e, t) {
  nt(t, !0);
  let n = se(t, "counts", 3, null), r = se(t, "files", 3, null), i = se(t, "filesAt", 3, null), s = se(t, "stale", 3, !1), l = se(t, "candidate", 3, null), o = se(t, "busy", 3, !1);
  const a = /* @__PURE__ */ Ee(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var f = Us(), h = y(f);
  let c;
  var d = S(y(h), 2);
  {
    var v = (O) => {
      var N = qs(), W = De(N), z = y(W), Y = y(z), J = S(z, 2), j = y(J), U = S(J, 4), $ = y(U), fe = S(U, 2), ce = y(fe), be = S(W, 2);
      {
        var A = (x) => {
          var w = Fs(), I = S(y(w), 2), X = y(I), de = S(I, 2), re = y(de), te = S(de, 4), ht = y(te), it = S(te, 2), hn = y(it), Yt = S(it, 2), _n = y(Yt);
          G(
            (pn, gn, mn, bn, R) => {
              M(X, `kept ${pn ?? ""}`), M(re, gn), M(ht, `excluded ${mn ?? ""}`), M(hn, bn), M(_n, `${u(a) >= 0 ? "+" : ""}${R ?? ""} excluded`);
            },
            [
              () => ye(n().candidate_kept_paths),
              () => Be(n().candidate_kept_bytes),
              () => ye(n().candidate_excluded_paths),
              () => Be(n().candidate_excluded_bytes),
              () => ye(u(a))
            ]
          ), P(x, w);
        };
        ee(be, (x) => {
          l() && x(A);
        });
      }
      G(
        (x, w, I, X) => {
          M(Y, `kept ${x ?? ""}`), M(j, w), M($, `excluded ${I ?? ""}`), M(ce, X);
        },
        [
          () => ye(n().kept_paths),
          () => Be(n().kept_bytes),
          () => ye(n().excluded_paths),
          () => Be(n().excluded_bytes)
        ]
      ), P(O, N);
    }, _ = (O) => {
      var N = Hs();
      P(O, N);
    };
    ee(d, (O) => {
      n() ? O(v) : O(_, -1);
    });
  }
  var m = S(h, 2);
  let p;
  var g = y(m), b = S(y(g), 3), k = y(b), E = S(b, 2);
  {
    var C = (O) => {
      var N = js();
      P(O, N);
    };
    ee(E, (O) => {
      s() && r() && r() !== "loading" && O(C);
    });
  }
  var B = S(g, 2);
  {
    var D = (O) => {
      var N = Bs(), W = De(N);
      let z;
      var Y = y(W), J = y(Y), j = S(Y, 2), U = y(j), $ = S(j, 4), fe = y($), ce = S($, 2), be = y(ce), A = S(W, 2), x = y(A);
      G(
        (w, I, X, de) => {
          z = et(W, 1, "line svelte-1vgp6n7", null, z, { outdated: s() }), M(J, `kept ${w ?? ""}`), M(U, I), M(fe, `excluded ${X ?? ""}`), M(be, de), M(x, `as of ${i() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => ye(r().kept_files),
          () => Be(r().kept_bytes),
          () => ye(r().excluded_files),
          () => Be(r().excluded_bytes)
        ]
      ), P(O, N);
    }, F = (O) => {
      var N = zs(), W = y(N);
      G(() => M(W, r() === "loading" ? "counting…" : "not counted yet")), P(O, N);
    };
    ee(B, (O) => {
      r() && r() !== "loading" ? O(D) : O(F, -1);
    });
  }
  G(() => {
    c = et(h, 1, "block svelte-1vgp6n7", null, c, { busy: o() }), p = et(m, 1, "block svelte-1vgp6n7", null, p, { busy: r() === "loading" }), b.disabled = r() === "loading", M(k, r() === "loading" ? "counting…" : "recount");
  }), oe("click", b, function(...O) {
    t.onfiles?.apply(this, O);
  }), P(e, f), rt();
}
It(["click"]);
var Gs = /* @__PURE__ */ L('<span class="err svelte-uzy12d"> </span>'), Ys = /* @__PURE__ */ L(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Xs = /* @__PURE__ */ L(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m photolib.triage_survey</code>, then reload.</span>`), Ks = /* @__PURE__ */ L('<span class="muted svelte-uzy12d"> </span>'), Ws = /* @__PURE__ */ L('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function Js(e, t) {
  nt(t, !0);
  let n = /* @__PURE__ */ K(null), r = /* @__PURE__ */ K(!1), i = /* @__PURE__ */ K(null);
  async function s() {
    T(r, !0), T(i, null);
    try {
      T(n, await ke.probe(), !0);
    } catch (v) {
      T(i, String(v), !0);
    } finally {
      T(r, !1);
    }
  }
  var l = Ws(), o = y(l), a = y(o), f = S(o, 2);
  {
    var h = (v) => {
      var _ = Gs(), m = y(_);
      G(() => M(m, u(i))), P(v, _);
    }, c = (v) => {
      var _ = Wr(), m = De(_);
      {
        var p = (b) => {
          var k = Ys(), E = S(y(k), 2);
          G(
            (C) => M(E, ` above are formats the header
        reader cannot measure (${C ?? ""}) or files with no
        extension.`),
            [() => u(n).formats.join(" ")]
          ), P(b, k);
        }, g = (b) => {
          var k = Xs(), E = y(k), C = y(E), B = S(E, 2), D = y(B);
          G(
            (F) => {
              M(C, F), M(D, u(n).command);
            },
            [() => ye(u(n).worklist)]
          ), P(b, k);
        };
        ee(m, (b) => {
          u(n).worklist === 0 ? b(p) : b(g, -1);
        });
      }
      P(v, _);
    }, d = (v) => {
      var _ = Ks(), m = y(_);
      G(() => M(m, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), P(v, _);
    };
    ee(f, (v) => {
      u(i) ? v(h) : u(n) ? v(c, 1) : v(d, -1);
    });
  }
  G(() => {
    o.disabled = u(r), M(a, u(r) ? "counting…" : "Check the dimension probe's worklist");
  }), oe("click", o, s), P(e, l), rt();
}
It(["click"]);
var Zs = /* @__PURE__ */ L('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), or = /* @__PURE__ */ L("<option> </option>"), Qs = /* @__PURE__ */ L('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), $s = /* @__PURE__ */ L('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), ea = /* @__PURE__ */ L('<div class="none muted svelte-bqi9ky"> </div>'), ta = /* @__PURE__ */ L('<div class="bar svelte-bqi9ky"><!></div>');
function na(e, t) {
  nt(t, !0);
  let n = se(t, "candidate", 3, null), r = se(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), o = /* @__PURE__ */ Ee(() => n() ? s[n().column] ?? ["="] : ["="]), a = /* @__PURE__ */ Ee(() => !!n() && n().op !== "is null");
  function f(m, p) {
    const g = { ...n(), [m]: p };
    if (m === "column") {
      const b = s[p] ?? ["="];
      b.includes(g.op) || (g.op = b[0]), g.value = l.has(p) ? 0 : "";
    }
    m === "op" && p === "is null" && (g.value = null), m === "value" && l.has(g.column) && (g.value = Number(p) || 0), t.onedit(g);
  }
  var h = ta(), c = y(h);
  {
    var d = (m) => {
      var p = Zs(), g = y(p), b = y(g), k = S(g, 2), E = y(k);
      G(() => {
        M(b, `${t.screen.title ?? ""} does not save a rule.`), M(E, t.screen.blurb);
      }), P(m, p);
    }, v = (m) => {
      var p = $s(), g = De(p), b = y(g);
      zt(b, 21, () => i, Dn, (A, x) => {
        var w = or(), I = y(w), X = {};
        G(() => {
          M(I, u(x)), X !== (X = u(x)) && (w.value = (w.__value = u(x)) ?? "");
        }), P(A, w);
      });
      var k;
      Jt(b);
      var E = S(b, 2);
      zt(E, 21, () => u(o), Dn, (A, x) => {
        var w = or(), I = y(w), X = {};
        G(() => {
          M(I, u(x)), X !== (X = u(x)) && (w.value = (w.__value = u(x)) ?? "");
        }), P(A, w);
      });
      var C;
      Jt(E);
      var B = S(E, 2);
      {
        var D = (A) => {
          var x = Qs();
          G(() => Cs(x, n().value ?? "")), oe("input", x, (w) => f("value", w.currentTarget.value)), P(A, x);
        };
        ee(B, (A) => {
          u(a) && A(D);
        });
      }
      var F = S(B, 2), O = y(F);
      O.value = O.__value = "exclude";
      var N = S(O);
      N.value = N.__value = "include";
      var W;
      Jt(F);
      var z = S(F, 2), Y = y(z);
      Y.value = Y.__value = "end";
      var J = S(Y);
      J.value = J.__value = "0";
      var j;
      Jt(z);
      var U = S(z, 2), $ = y(U), fe = S(U, 2), ce = S(g, 2), be = y(ce);
      G(
        (A, x) => {
          k !== (k = n().column) && (b.value = (b.__value = n().column) ?? "", qt(b, n().column)), C !== (C = n().op) && (E.value = (E.__value = n().op) ?? "", qt(E, n().op)), W !== (W = n().decision ?? "exclude") && (F.value = (F.__value = n().decision ?? "exclude") ?? "", qt(F, n().decision ?? "exclude")), j !== (j = A) && (z.value = (z.__value = A) ?? "", qt(z, A)), U.disabled = r(), M($, r() ? "saving…" : "Confirm"), M(be, `${x ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Ls(n())
        ]
      ), oe("change", b, (A) => f("column", A.currentTarget.value)), oe("change", E, (A) => f("op", A.currentTarget.value)), oe("change", F, (A) => f("decision", A.currentTarget.value)), oe("change", z, (A) => f("at", A.currentTarget.value)), oe("click", U, function(...A) {
        t.onconfirm?.apply(this, A);
      }), oe("click", fe, function(...A) {
        t.onclear?.apply(this, A);
      }), P(m, p);
    }, _ = (m) => {
      var p = ea(), g = y(p);
      G(() => M(g, `Pick a row to build a rule${t.screen.table === !1 ? ", or scroll — this is the remainder" : ""}.`)), P(m, p);
    };
    ee(c, (m) => {
      t.screen.rule === !1 ? m(d) : n() ? m(v, 1) : m(_, -1);
    });
  }
  P(e, h), rt();
}
It(["change", "input", "click"]);
var ra = /* @__PURE__ */ L('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), ia = /* @__PURE__ */ L('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), sa = /* @__PURE__ */ L('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), aa = /* @__PURE__ */ L('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function la(e, t) {
  nt(t, !0);
  let n = se(t, "rules", 19, () => []), r = se(t, "unmatched", 3, null), i = se(t, "busy", 3, !1);
  var s = aa(), l = y(s), o = S(y(l)), a = y(o), f = S(l, 2);
  {
    var h = (_) => {
      var m = ra();
      P(_, m);
    };
    ee(f, (_) => {
      n().length === 0 && _(h);
    });
  }
  var c = S(f, 2);
  zt(c, 19, n, (_) => _.id, (_, m, p) => {
    var g = ia();
    let b;
    var k = y(g), E = y(k), C = y(E), B = S(E, 2), D = y(B), F = S(B, 2), O = y(F), N = S(k, 2), W = y(N), z = y(W), Y = S(W, 2), J = y(Y), j = S(Y, 4), U = S(j, 2), $ = S(U, 2);
    G(
      (fe, ce) => {
        b = et(g, 1, "rule svelte-aof9c2", null, b, { exclude: u(m).decision === "exclude" }), M(C, u(p)), M(D, u(m).predicate), M(O, u(m).decision), M(z, `${fe ?? ""} paths`), M(J, ce), j.disabled = i() || u(p) === 0, U.disabled = i() || u(p) === n().length - 1, $.disabled = i();
      },
      [
        () => ye(u(m).paths),
        () => Be(u(m).bytes)
      ]
    ), oe("click", j, () => t.onmove(u(m), u(p) - 1)), oe("click", U, () => t.onmove(u(m), u(p) + 1)), oe("click", $, () => t.ondelete(u(m))), P(_, g);
  });
  var d = S(c, 2);
  {
    var v = (_) => {
      var m = sa(), p = S(y(m), 2), g = y(p), b = y(g), k = S(g, 2), E = y(k);
      G(
        (C, B) => {
          M(b, `${C ?? ""} paths`), M(E, B);
        },
        [
          () => ye(r().paths),
          () => Be(r().bytes)
        ]
      ), P(_, m);
    };
    ee(d, (_) => {
      r() && _(v);
    });
  }
  G(() => M(a, `${n().length ?? ""} rules · top-down, first match wins`)), P(e, s), rt();
}
It(["click"]);
const $t = 4, fn = 220, oa = 340;
function Zr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function ua(e, t, n, r, i) {
  let s = t;
  for (; s < e.length; ) {
    let l = s, o = 0, a = 1 / 0;
    for (; l < e.length && (o += Zr(e[l]), l++, a = (n - $t * (l - s - 1)) / o, !(a <= fn)); )
      ;
    if (a > fn && !r) break;
    i(s, l, Math.round(Math.min(a, oa))), s = l;
  }
  return s;
}
function ur(e, t, n) {
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
const fr = 2500, fa = 1, ca = 2, da = 3e7;
function va(e, t, n) {
  const r = [], i = [], s = /* @__PURE__ */ new Map(), l = [], o = [];
  let a = 0, f = 0, h = null, c = null, d = !1, v = !1, _ = 0, m = 0, p = 0, g = n.onState || (() => {
  });
  function b(x) {
    _ <= 0 || (a = ua(r, a, _, x, (w, I, X) => {
      i.push({ top: f, height: X, from: w, to: I }), f += X + $t;
    }), E());
  }
  function k() {
    if (c === null || d || _ <= 0 || a >= c) return 0;
    const x = i.length ? a / i.length : Math.max(1, _ / fn), w = i.length ? f / i.length : fn + $t, I = Math.round((c - a) / x * w);
    return Math.max(0, Math.min(I, da - f));
  }
  function E() {
    e.style.height = f + k() + "px", t.style.top = Math.max(0, f - 1) + "px";
  }
  function C() {
    return window.scrollY - e.offsetTop;
  }
  function B() {
    const x = l.pop();
    if (x) return x;
    const w = document.createElement("div");
    w.className = "tile";
    const I = document.createElement("img");
    return I.decoding = "async", I.addEventListener("load", () => w.classList.add("loaded")), I.addEventListener("error", () => w.classList.add("missing")), w.appendChild(I), n.extend && n.extend(w), w;
  }
  function D(x, w) {
    w.firstChild.removeAttribute("src"), w.classList.remove("loaded", "missing", "error"), w.style.backgroundImage = "", w.remove(), s.delete(x), l.push(w);
  }
  function F(x, w, I, X, de, re) {
    let te = s.get(x);
    const ht = r[x];
    if (!te) {
      te = B(), te.dataset.index = String(x);
      const it = te.firstChild;
      it.fetchPriority = re ? "high" : "low", it.src = "/t/" + ht.s + ".webp", o.push(x), n.fill && n.fill(te, ht), e.appendChild(te), s.set(x, te);
    }
    te.style.width = X + "px", te.style.height = de + "px", te.style.transform = "translate(" + w + "px," + I + "px)";
  }
  function O(x, w) {
    w.th && (w.url === void 0 && (w.url = n.thumbHash(w.th)), w.url && (x.style.backgroundImage = "url(" + w.url + ")"));
  }
  function N() {
    p = 0;
    for (const x of o) {
      const w = s.get(x);
      w && !w.classList.contains("loaded") && O(w, r[x]);
    }
    o.length = 0;
  }
  function W(x, w) {
    let I = 0;
    for (let X = x.from; X < x.to; X++) {
      const re = X === x.to - 1 ? _ - I : Math.round(Zr(r[X]) * x.height);
      F(X, I, x.top, re, x.height, w), I += re + $t;
    }
  }
  function z() {
    const x = window.innerHeight, w = C(), I = ur(i, w - x * fa, w + x * (1 + ca));
    if (!I) return;
    const X = i[I[0]].from, de = i[I[1]].to;
    for (const [re, te] of Array.from(s))
      (re < X || re >= de) && D(re, te);
    for (let re = I[0]; re <= I[1]; re++) {
      const te = i[re];
      W(te, te.top < w + x && te.top + te.height > w);
    }
    o.length && !p && (p = requestAnimationFrame(N));
  }
  function Y() {
    return _ <= 0 ? !1 : f - (C() + window.innerHeight) < fr;
  }
  async function J() {
    if (v || d) return;
    v = !0;
    const x = m;
    g({ loading: !0, count: r.length, exhausted: d, total: c });
    try {
      do {
        const w = await n.fetchPage(h);
        if (x !== m) return;
        for (const I of w.photos) r.push(I);
        h = w.next, d = h === null, typeof w.total == "number" && (c = w.total), b(d), z(), g({ loading: !0, count: r.length, exhausted: d, total: c });
      } while (!d && Y());
    } catch (w) {
      x === m && g({ error: String(w) });
    } finally {
      x === m && (v = !1, g({ loading: !1, count: r.length, exhausted: d, total: c }));
    }
  }
  let j = 0;
  function U() {
    j || (j = requestAnimationFrame(() => {
      j = 0, z(), Y() && J();
    }));
  }
  function $() {
    const x = e.clientWidth;
    if (x === _) return;
    const w = ur(i, C(), C()), I = w ? i[w[0]].from : 0;
    _ = x;
    for (const [de, re] of Array.from(s)) D(de, re);
    i.length = 0, a = 0, f = 0, b(d), z();
    const X = i.find((de) => de.to > I);
    X && window.scrollTo(0, X.top + e.offsetTop), Y() && J();
  }
  function fe(x) {
    const w = x.target.closest(".tile");
    if (!w || !e.contains(w)) return;
    const I = r[Number(w.dataset.index)];
    I && n.activate && n.activate(I, x, w);
  }
  e.addEventListener("click", fe), window.addEventListener("scroll", U, { passive: !0 });
  let ce = 0;
  const be = new ResizeObserver(() => {
    clearTimeout(ce), ce = setTimeout($, 100);
  });
  be.observe(e);
  const A = new IntersectionObserver(
    (x) => {
      x.some((w) => w.isIntersecting) && J();
    },
    { rootMargin: "0px 0px " + fr + "px 0px" }
  );
  return A.observe(t), _ = e.clientWidth, J(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      m++, v = !1;
      for (const [x, w] of Array.from(s)) D(x, w);
      r.length = 0, i.length = 0, o.length = 0, a = 0, f = 0, h = null, c = null, d = !1, e.style.height = "0px", window.scrollTo(0, 0), J();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(x) {
      const w = typeof x == "number" ? x : null;
      w !== c && (c = w, E(), g({ total: c }));
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(x) {
      for (const [w, I] of s)
        r[w] === x && n.fill && n.fill(I, x);
    },
    destroy() {
      m++, e.removeEventListener("click", fe), window.removeEventListener("scroll", U), be.disconnect(), A.disconnect(), clearTimeout(ce), cancelAnimationFrame(p);
    }
  };
}
function ha(e) {
  try {
    const t = Uint8Array.from(atob(e), (z) => z.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, i = (n & 63) / 63, s = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, o = (n >> 18 & 31) / 31, a = n >> 23, f = (r >> 3 & 63) / 63, h = (r >> 9 & 63) / 63, c = r >> 15, d = Math.max(3, c ? a ? 5 : 7 : r & 7), v = Math.max(3, c ? r & 7 : a ? 5 : 7);
    let _ = a ? 6 : 5, m = 0;
    const p = (z, Y, J) => {
      const j = [];
      for (let U = 0; U < Y; U++)
        for (let $ = U ? 0 : 1; $ * Y < z * (Y - U); $++) {
          const fe = t[_ + (m >> 1)] >> ((m++ & 1) << 2) & 15;
          j.push((fe / 7.5 - 1) * J);
        }
      return j;
    }, g = p(d, v, o), b = p(3, 3, f * 1.25), k = p(3, 3, h * 1.25), E = d / v, C = Math.max(1, Math.round(E > 1 ? 32 : 32 * E)), B = Math.max(1, Math.round(E > 1 ? 32 / E : 32)), D = document.createElement("canvas");
    D.width = C, D.height = B;
    const F = D.getContext("2d"), O = F.createImageData(C, B), N = [], W = [];
    for (let z = 0, Y = 0; z < B; z++)
      for (let J = 0; J < C; J++, Y += 4) {
        let j = i, U = s, $ = l;
        for (let A = 0; A < d; A++) N[A] = Math.cos(Math.PI / C * (J + 0.5) * A);
        for (let A = 0; A < v; A++) W[A] = Math.cos(Math.PI / B * (z + 0.5) * A);
        for (let A = 0, x = 0; A < v; A++)
          for (let w = A ? 0 : 1; w * v < d * (v - A); w++, x++)
            j += g[x] * N[w] * W[A] * 2;
        for (let A = 0, x = 0; A < 3; A++)
          for (let w = A ? 0 : 1; w < 3 - A; w++, x++) {
            const I = N[w] * W[A] * 2;
            U += b[x] * I, $ += k[x] * I;
          }
        const fe = j - 2 / 3 * U, ce = (3 * j - fe + $) / 2, be = ce - $;
        O.data[Y] = Math.max(0, Math.min(255, Math.round(255 * ce))), O.data[Y + 1] = Math.max(0, Math.min(255, Math.round(255 * be))), O.data[Y + 2] = Math.max(0, Math.min(255, Math.round(255 * fe))), O.data[Y + 3] = 255;
      }
    return F.putImageData(O, 0, 0), D.toDataURL();
  } catch {
    return null;
  }
}
var _a = /* @__PURE__ */ L('<main id="canvas"><div id="sentinel"></div></main>');
function pa(e, t) {
  nt(t, !0);
  let n = se(t, "key", 3, ""), r = se(t, "total", 3, null), i = se(t, "triage", 3, !1), s = se(t, "onActivate", 3, () => {
  }), l = se(t, "onOverride", 3, async () => null), o = se(t, "onState", 3, () => {
  }), a = /* @__PURE__ */ K(null), f = /* @__PURE__ */ K(null), h = null, c = "";
  const d = { null: "exclude", exclude: "include", include: "clear" };
  function v(b) {
    const k = b.toLowerCase().startsWith(un.toLowerCase()) ? b.slice(un.length + 1) : b;
    return k.length > 64 ? "…" + k.slice(-64) : k;
  }
  function _(b) {
    const k = document.createElement("div");
    k.className = "tile-path", b.appendChild(k);
    const E = document.createElement("button");
    E.className = "chip", E.type = "button", b.appendChild(E);
  }
  function m(b, k) {
    const E = b.querySelector(".tile-path");
    E && (E.textContent = k.p ? v(k.p) : "");
    const C = b.querySelector(".chip");
    C && (C.dataset.state = k.o || "none", C.textContent = k.o === "exclude" ? "drop" : k.o === "include" ? "keep" : "·", C.title = k.o === "exclude" ? "overridden: excluded — click to keep" : k.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Jr(() => (h = va(u(a), u(f), {
    fetchPage: (b) => t.fetchPage(b),
    thumbHash: ha,
    extend: i() ? _ : void 0,
    fill: i() ? m : void 0,
    onState: (b) => o()(b),
    activate: async (b, k, E) => {
      if (!k.target.closest(".chip")) {
        s()(b);
        return;
      }
      const C = d[b.o ?? "null"];
      b.o = await l()(b, C), m(E, b);
    }
  }), c = n(), () => h?.destroy())), ln(() => {
    const b = n(), k = r();
    h && (b !== c && (c = b, h.reset()), h.setTotal(k));
  });
  var p = _a(), g = y(p);
  ir(g, (b) => T(f, b), () => u(f)), ir(p, (b) => T(a, b), () => u(a)), P(e, p), rt();
}
var ga = /* @__PURE__ */ L('<th class="num svelte-1v3p82v"> </th>'), ma = /* @__PURE__ */ L('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), ba = /* @__PURE__ */ L('<td class="num svelte-1v3p82v"> </td>'), wa = /* @__PURE__ */ L('<tr><td class="key svelte-1v3p82v"> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), ya = /* @__PURE__ */ L('<table class="agg svelte-1v3p82v"><thead><tr><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function xa(e, t) {
  nt(t, !0);
  let n = se(t, "rows", 19, () => []), r = se(t, "selected", 3, null);
  function i(a) {
    return t.screen.label ? t.screen.label(a) : a.key;
  }
  var s = Wr(), l = De(s);
  {
    var o = (a) => {
      var f = ya(), h = y(f), c = y(h), d = y(c), v = y(d), _ = S(d, 3);
      {
        var m = (g) => {
          var b = ga(), k = y(b);
          G(() => M(k, t.screen.heading[1])), P(g, b);
        };
        ee(_, (g) => {
          t.screen.heading[1] && g(m);
        });
      }
      var p = S(h);
      zt(p, 21, n, (g) => g.key, (g, b) => {
        var k = wa();
        let E;
        var C = y(k), B = y(C), D = S(B);
        {
          var F = (j) => {
            var U = ma();
            P(j, U);
          };
          ee(D, (j) => {
            u(b).scope === "whole inventory" && j(F);
          });
        }
        var O = S(C), N = y(O), W = S(O), z = y(W), Y = S(W);
        {
          var J = (j) => {
            var U = ba(), $ = y(U);
            G(() => M($, u(b).detail ?? "")), P(j, U);
          };
          ee(Y, (j) => {
            t.screen.heading[1] && j(J);
          });
        }
        G(
          (j, U, $) => {
            E = et(k, 1, "svelte-1v3p82v", null, E, {
              picked: r() === u(b).key,
              clickable: t.screen.sheet !== !1
            }), M(B, `${j ?? ""} `), M(N, U), M(z, $);
          },
          [
            () => i(u(b)),
            () => ye(u(b).paths),
            () => Be(u(b).bytes)
          ]
        ), oe("click", k, () => t.onpick(u(b))), P(g, k);
      }), G(() => M(v, t.screen.heading[0] ?? "")), P(a, f);
    };
    ee(l, (a) => {
      n().length && a(o);
    });
  }
  P(e, s), rt();
}
It(["click"]);
var ka = /* @__PURE__ */ L('<button><span class="n svelte-1n46o8q"> </span> </button>'), Ea = /* @__PURE__ */ L('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), Sa = /* @__PURE__ */ L('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), Ta = /* @__PURE__ */ L('<div class="muted pad svelte-1n46o8q">loading…</div>'), Aa = /* @__PURE__ */ L('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), Ra = /* @__PURE__ */ L('<nav class="svelte-1n46o8q"></nav> <!> <!>', 1), Ma = /* @__PURE__ */ L('<p class="muted pad svelte-1n46o8q">The read-only grid: every photo, newest first, click to reveal in Explorer.</p>'), Ca = /* @__PURE__ */ L('<p class="blurb"> </p>'), Na = /* @__PURE__ */ L('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), Ia = /* @__PURE__ */ L('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), Oa = /* @__PURE__ */ L('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!>', 1), Pa = /* @__PURE__ */ L('<div class="status"> </div>'), Da = /* @__PURE__ */ L('<div class="shell"><aside class="side"><div class="modes svelte-1n46o8q"><button>triage</button> <button>grid</button></div> <!></aside> <div class="main"><!> <!></div></div> <!>', 1);
function La(e, t) {
  nt(t, !0);
  let n = /* @__PURE__ */ K("triage"), r = /* @__PURE__ */ K(0), i = /* @__PURE__ */ K(
    null
    // screen 6's drill-down
  ), s = /* @__PURE__ */ K(Ze([])), l = /* @__PURE__ */ K(null), o = /* @__PURE__ */ K(null), a = /* @__PURE__ */ K(null), f = /* @__PURE__ */ K(null), h = /* @__PURE__ */ K(null), c = /* @__PURE__ */ K(!1), d = /* @__PURE__ */ K(!1), v = /* @__PURE__ */ K(!1), _ = /* @__PURE__ */ K(!1), m = /* @__PURE__ */ K(Ze({ loading: !1, count: 0, exhausted: !1, total: null })), p = /* @__PURE__ */ K(null);
  const g = /* @__PURE__ */ Ee(() => lr[u(r)]), b = /* @__PURE__ */ Ee(() => u(g).table !== !1), k = /* @__PURE__ */ Ee(() => u(g).sheet !== !1 && (u(o) !== null || !u(b))), E = /* @__PURE__ */ Ee(() => `${u(n)}:${u(r)}:${JSON.stringify(u(o))}`), C = Ps();
  function B(R) {
    T(p, String(R), !0);
  }
  async function D(R) {
    try {
      return T(p, null), await R();
    } catch (Z) {
      return B(Z), null;
    }
  }
  const F = Ds(
    () => {
      T(d, !0), D(async () => {
        const R = u(o)?.at === "end" || u(o)?.at === void 0 ? void 0 : 0, { stale: Z, value: ve } = await C(() => ke.counts(u(o), R));
        Z || T(a, ve, !0);
      }).finally(() => {
        T(d, !1);
      });
    },
    220
  );
  async function O() {
    T(f, "loading");
    const R = await D(() => ke.files());
    T(f, R, !0), T(c, !1), T(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function N(R = !1) {
    if (!u(b)) {
      T(s, [], !0);
      return;
    }
    T(_, !0);
    const Z = u(g).name === "source_folder" && u(i) ? { root: u(i) } : {};
    R && (Z.live = "1");
    const ve = await D(() => ke.screen(u(g).name, Z));
    T(s, ve?.rows ?? [], !0), T(_, !1);
  }
  ln(() => {
    u(r), Mt(() => {
      T(l, null), T(o, null), T(i, null), N(), F.now();
    });
  }), ln(() => {
    u(i), Mt(N);
  }), Jr(O);
  function W(R) {
    if (u(g).sheet !== !1) {
      if (u(g).drill && !u(i)) {
        T(l, R.key, !0), T(
          o,
          {
            ...u(g).toRule(R, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), T(i, R.key, !0);
        return;
      }
      T(l, R.key, !0), T(
        o,
        {
          ...u(g).toRule(R, u(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), F();
    }
  }
  function z(R) {
    T(o, R, !0), T(
      l,
      null
      // it no longer corresponds to a row
    ), F();
  }
  function Y(R = !1) {
    T(o, null), T(l, null), R && T(i, null), F.now();
  }
  async function J() {
    if (!u(o)) return;
    T(v, !0);
    const R = u(o).at === "end" ? void 0 : 0, Z = await D(() => ke.addRule(
      {
        column: u(o).column,
        op: u(o).op,
        value: u(o).value,
        decision: u(o).decision ?? "exclude",
        note: `screen ${u(g).id} ${u(g).title}`
      },
      R
    ));
    T(v, !1), Z && (T(o, null), T(l, null), T(
      c,
      !0
      // the distinct-content number now says so on its face
    ), await N(), F.now());
  }
  async function j(R) {
    T(v, !0), await D(() => ke.deleteRule(R.id)), T(v, !1), T(c, !0), await N(), F.now();
  }
  async function U(R, Z) {
    T(v, !0), await D(() => ke.moveRule(R.id, Z)), T(v, !1), T(c, !0), await N(), F.now();
  }
  async function $(R, Z) {
    const ve = await D(() => ke.override(R.s, Z));
    return ve ? (T(c, !0), F(), ve.decision) : R.o ?? null;
  }
  function fe(R) {
    return u(n) === "grid" ? ke.photos({ kind: "image", limit: 500, ...R || {} }) : ke.page(u(o), R);
  }
  function ce(R) {
    D(() => u(n) === "grid" ? ke.revealPhoto(R.id) : ke.revealOrigin(R.id));
  }
  var be = Da(), A = De(be), x = y(A), w = y(x), I = y(w);
  let X;
  var de = S(I, 2);
  let re;
  var te = S(w, 2);
  {
    var ht = (R) => {
      var Z = Ra(), ve = De(Z);
      zt(ve, 21, () => lr, Dn, (Pe, He, Ge) => {
        var Ye = ka();
        let st;
        var at = y(Ye), pt = y(at), Ot = S(at, 1, !0);
        G(() => {
          st = et(Ye, 1, "nav svelte-1n46o8q", null, st, { on: Ge === u(r) }), M(pt, u(He).id), M(Ot, u(He).title);
        }), oe("click", Ye, () => T(r, Ge, !0)), P(Pe, Ye);
      });
      var _t = S(ve, 2);
      {
        var Xt = (Pe) => {
          var He = Aa(), Ge = De(He), Ye = y(Ge);
          {
            var st = (Q) => {
              var he = Ea(), Xe = De(he), xn = /* @__PURE__ */ Ee(() => Y.bind(null, !0)), kn = S(Xe, 2), Qr = y(kn);
              G(() => M(Qr, `inside ${u(i) ?? ""}`)), oe("click", Xe, function(...$r) {
                u(xn)?.apply(this, $r);
              }), P(Q, he);
            }, at = (Q) => {
              var he = Sa(), Xe = y(he);
              G(() => M(Xe, u(g).relive)), oe("click", he, () => N(!0)), P(Q, he);
            };
            ee(Ye, (Q) => {
              u(g).drill && u(i) ? Q(st) : u(g).relive && Q(at, 1);
            });
          }
          var pt = S(Ge, 2);
          {
            var Ot = (Q) => {
              var he = Ta();
              P(Q, he);
            };
            ee(pt, (Q) => {
              u(_) && Q(Ot);
            });
          }
          var yn = S(pt, 2);
          xa(yn, {
            get rows() {
              return u(s);
            },
            get screen() {
              return u(g);
            },
            get selected() {
              return u(l);
            },
            onpick: W
          }), P(Pe, He);
        };
        ee(_t, (Pe) => {
          u(b) && Pe(Xt);
        });
      }
      var wn = S(_t, 2);
      {
        let Pe = /* @__PURE__ */ Ee(() => u(a)?.rules ?? []), He = /* @__PURE__ */ Ee(() => u(a)?.unmatched ?? null);
        la(wn, {
          get rules() {
            return u(Pe);
          },
          get unmatched() {
            return u(He);
          },
          get busy() {
            return u(v);
          },
          ondelete: j,
          onmove: U
        });
      }
      P(R, Z);
    }, it = (R) => {
      var Z = Ma();
      P(R, Z);
    };
    ee(te, (R) => {
      u(n) === "triage" ? R(ht) : R(it, -1);
    });
  }
  var hn = S(x, 2), Yt = y(hn);
  {
    var _n = (R) => {
      var Z = Oa(), ve = De(Z), _t = y(ve), Xt = S(ve, 2), wn = y(Xt), Pe = S(Xt, 2);
      {
        var He = (Q) => {
          var he = Ca(), Xe = y(he);
          G(() => M(Xe, u(g).note)), P(Q, he);
        };
        ee(Pe, (Q) => {
          u(g).note && Q(He);
        });
      }
      var Ge = S(Pe, 2);
      {
        var Ye = (Q) => {
          Js(Q, {
            get screen() {
              return u(g);
            }
          });
        };
        ee(Ge, (Q) => {
          u(g).name === "dimensions" && Q(Ye);
        });
      }
      var st = S(Ge, 2);
      Vs(st, {
        get counts() {
          return u(a);
        },
        get files() {
          return u(f);
        },
        get filesAt() {
          return u(h);
        },
        get stale() {
          return u(c);
        },
        get candidate() {
          return u(o);
        },
        get busy() {
          return u(d);
        },
        onfiles: O
      });
      var at = S(st, 2);
      na(at, {
        get candidate() {
          return u(o);
        },
        get screen() {
          return u(g);
        },
        get saving() {
          return u(v);
        },
        onedit: z,
        onconfirm: J,
        onclear: Y
      });
      var pt = S(at, 2);
      {
        var Ot = (Q) => {
          var he = Na(), Xe = y(he);
          G((xn, kn) => M(Xe, `${xn ?? ""}${kn ?? ""} loaded${u(m).exhausted ? " · all of them" : ""}${u(m).loading ? " · loading…" : ""} `), [
            () => ye(u(m).count),
            () => u(m).total ? " of " + ye(u(m).total) : ""
          ]), P(Q, he);
        }, yn = (Q) => {
          var he = Ia();
          P(Q, he);
        };
        ee(pt, (Q) => {
          u(k) ? Q(Ot) : u(g).sheet === !1 && Q(yn, 1);
        });
      }
      G(() => {
        M(_t, `${u(g).id ?? ""} · ${u(g).title ?? ""}`), M(wn, u(g).blurb);
      }), P(R, Z);
    };
    ee(Yt, (R) => {
      u(n) === "triage" && R(_n);
    });
  }
  var pn = S(Yt, 2);
  {
    var gn = (R) => {
      {
        let Z = /* @__PURE__ */ Ee(() => u(n) === "grid" ? null : u(a)?.page_paths ?? null), ve = /* @__PURE__ */ Ee(() => u(n) === "triage");
        pa(R, {
          get key() {
            return u(E);
          },
          fetchPage: fe,
          get total() {
            return u(Z);
          },
          get triage() {
            return u(ve);
          },
          onActivate: ce,
          onOverride: $,
          onState: (_t) => T(m, { ...u(m), ..._t }, !0)
        });
      }
    };
    ee(pn, (R) => {
      (u(k) || u(n) === "grid") && R(gn);
    });
  }
  var mn = S(A, 2);
  {
    var bn = (R) => {
      var Z = Pa(), ve = y(Z);
      G(() => M(ve, u(p))), P(R, Z);
    };
    ee(mn, (R) => {
      u(p) && R(bn);
    });
  }
  G(() => {
    X = et(I, 1, "svelte-1n46o8q", null, X, { on: u(n) === "triage" }), re = et(de, 1, "svelte-1n46o8q", null, re, { on: u(n) === "grid" });
  }), oe("click", I, () => T(n, "triage")), oe("click", de, () => T(n, "grid")), P(e, be), rt();
}
It(["click"]);
bs(La, { target: document.getElementById("app") });
