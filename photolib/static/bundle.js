var Br = Array.isArray, ws = Array.prototype.indexOf, ar = Array.prototype.includes, vr = Array.from, ys = Object.defineProperty, yn = Object.getOwnPropertyDescriptor, xs = Object.getOwnPropertyDescriptors, ks = Object.prototype, Ss = Array.prototype, ka = Object.getPrototypeOf, ta = Object.isExtensible;
const er = () => {
};
function Es(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Sa() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
function mr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const r of e)
    if (n.push(r), n.length === t) break;
  return n;
}
const $e = 2, kn = 4, hr = 8, Ea = 1 << 24, Mt = 16, wt = 32, Gt = 64, Ar = 128, mt = 512, De = 1024, je = 2048, Pt = 4096, at = 8192, dt = 16384, Rn = 32768, Rr = 1 << 25, Sn = 65536, sr = 1 << 17, Ts = 1 << 18, Pn = 1 << 19, Ms = 1 << 20, Ot = 1 << 25, dn = 65536, ir = 1 << 21, xn = 1 << 22, en = 1 << 23, ln = Symbol("$state"), As = Symbol("legacy props"), Rs = Symbol(""), Ta = Symbol("attributes"), Pr = Symbol("class"), Cr = Symbol("style"), Nr = Symbol("text"), Wn = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Ps = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Cs(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Ns() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Is(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Os(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Fs() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ls(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function zs() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ds(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function js() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function qs() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Hs() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Bs() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Us = 1, $s = 2, Ma = 4, Gs = 8, Ys = 16, Ws = 1, Vs = 4, Xs = 8, Ks = 16, Js = 1, Zs = 2, ze = Symbol("uninitialized"), Qs = "http://www.w3.org/1999/xhtml";
function ei() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function ti() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function ni() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Aa(e) {
  return e === this.v;
}
function ri(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Ra(e) {
  return !ri(e, this.v);
}
let Ze = null;
function En(e) {
  Ze = e;
}
function xt(e, t = !1, n) {
  Ze = {
    p: Ze,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      ie
    ),
    l: null
  };
}
function kt(e) {
  var t = (
    /** @type {ComponentContext} */
    Ze
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Wa(r);
  }
  return t.i = !0, Ze = t.p, /** @type {T} */
  {};
}
function Pa() {
  return !0;
}
let bn = [];
function ai() {
  var e = bn;
  bn = [], Es(e);
}
function Ut(e) {
  if (bn.length === 0) {
    var t = bn;
    queueMicrotask(() => {
      t === bn && ai();
    });
  }
  bn.push(e);
}
function Ca(e) {
  var t = ie;
  if (t === null)
    return ce.f |= en, e;
  if ((t.f & Rn) === 0 && (t.f & kn) === 0)
    throw e;
  Zt(e, t);
}
function Zt(e, t) {
  if (!(t !== null && (t.f & dt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & Ar) !== 0) {
        if ((t.f & Rn) === 0)
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
const si = -7169;
function Pe(e, t) {
  e.f = e.f & si | t;
}
function Ur(e) {
  (e.f & mt) !== 0 || e.deps === null ? Pe(e, De) : Pe(e, Pt);
}
function Na(e) {
  if (e !== null)
    for (const t of e)
      (t.f & $e) === 0 || (t.f & dn) === 0 || (t.f ^= dn, Na(
        /** @type {Derived} */
        t.deps
      ));
}
function Ia(e, t, n) {
  (e.f & je) !== 0 ? t.add(e) : (e.f & Pt) !== 0 && n.add(e), Na(e.deps), Pe(e, De);
}
let Jn = !1;
function ii(e) {
  var t = Jn;
  try {
    return Jn = !1, [e(), Jn];
  } finally {
    Jn = t;
  }
}
function li(e, t, n, r = !0) {
  r && n();
  for (var s of t)
    e.addEventListener(s, n);
  pr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function Cn(e) {
  var t = ce, n = ie;
  yt(null), Lt(null);
  try {
    return e();
  } finally {
    yt(t), Lt(n);
  }
}
function oi(e) {
  let t = 0, n = fn(0), r;
  return () => {
    Wr() && (a(n), Xa(() => (t === 0 && (r = vn(() => e(() => Un(n)))), t += 1, () => {
      Ut(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Un(n));
      });
    })));
  };
}
var ui = Sn | Pn;
function ci(e, t, n, r) {
  new di(e, t, n, r);
}
class di {
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
  #i = null;
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
  #a = null;
  #p = 0;
  #u = 0;
  #c = !1;
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
  #b = oi(() => (this.#d = fn(this.#p), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, s) {
    this.#t = t, this.#e = n, this.#o = (i) => {
      var l = (
        /** @type {Effect} */
        ie
      );
      l.b = this, l.f |= Ar, r(i);
    }, this.parent = /** @type {Effect} */
    ie.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#r = Vr(() => {
      this.#v();
    }, ui);
  }
  #_() {
    try {
      this.#s = _t(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: s } = this.#m(t);
    Ut(s), n && (this.#l = _t(() => {
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
  #m(t) {
    var n = !1, r = !1;
    const s = () => {
      if (n) {
        ni();
        return;
      }
      n = !0, r && Bs(), this.#l !== null && un(this.#l, () => {
        this.#l = null;
      }), this.#h(() => {
        this.#v();
      });
    };
    return { reset: s, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, s), r = !1;
      } catch (l) {
        Zt(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = _t(() => t(this.#t)), Ut(() => {
      var n = this.#a = document.createDocumentFragment(), r = $t();
      n.append(r), this.#s = this.#h(() => _t(() => this.#o(r))), this.#u === 0 && (this.#t.before(n), this.#a = null, un(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        he
      ));
    }));
  }
  #v() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#p = 0, this.#s = _t(() => {
        this.#o(this.#t);
      }), this.#u > 0) {
        var t = this.#a = document.createDocumentFragment();
        Kr(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = _t(() => n(this.#t));
      } else
        this.#w(
          /** @type {Batch} */
          he
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
    Ia(t, this.#f, this.#g);
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
    var n = ie, r = ce, s = Ze;
    Lt(this.#r), yt(this.#r), En(this.#r.ctx);
    try {
      return tn.ensure(), t();
    } catch (i) {
      return Ca(i), null;
    } finally {
      Lt(n), yt(r), En(s);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && un(this.#n, () => {
      this.#n = null;
    }), this.#a && (this.#t.before(this.#a), this.#a = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#k(t, n), this.#p += t, !(!this.#d || this.#c) && (this.#c = !0, Ut(() => {
      this.#c = !1, this.#d && Tn(this.#d, this.#p);
    }));
  }
  get_effect_pending() {
    return this.#b(), a(
      /** @type {Source<number>} */
      this.#d
    );
  }
  /** @param {unknown} error */
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    he?.is_fork ? (this.#s && he.skip_effect(this.#s), this.#n && he.skip_effect(this.#n), this.#l && he.skip_effect(this.#l), he.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#s && (ot(this.#s), this.#s = null), this.#n && (ot(this.#n), this.#n = null), this.#l && (ot(this.#l), this.#l = null);
    let n = this.#e.failed;
    const r = (s) => {
      const { reset: i, invoke_onerror: l } = this.#m(s);
      l(), n && (this.#l = this.#h(() => {
        try {
          return _t(() => {
            var u = (
              /** @type {Effect} */
              ie
            );
            u.b = this, u.f |= Ar, n(
              this.#t,
              () => s,
              () => i
            );
          });
        } catch (u) {
          return Zt(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    Ut(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (i) {
        Zt(i, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        r,
        /** @param {unknown} e */
        (i) => Zt(i, this.#r && this.#r.parent)
      ) : r(s);
    });
  }
}
function fi(e, t, n, r) {
  const s = $n;
  var i = e.filter((v) => !v.settled), l = t.map(s);
  if (n.length === 0 && i.length === 0) {
    r(l);
    return;
  }
  var u = (
    /** @type {Effect} */
    ie
  ), o = vi(), d = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((v) => v.promise)) : null;
  function g(v) {
    if ((u.f & dt) === 0) {
      o();
      try {
        r([...l, ...v]);
      } catch (h) {
        Zt(h, u);
      }
      lr();
    }
  }
  var m = Oa();
  if (n.length === 0) {
    d.then(() => g([])).finally(m);
    return;
  }
  function p() {
    Promise.all(n.map((v) => /* @__PURE__ */ hi(v))).then(g).catch((v) => Zt(v, u)).finally(m);
  }
  d ? d.then(() => {
    o(), p(), lr();
  }) : p();
}
function vi() {
  var e = (
    /** @type {Effect} */
    ie
  ), t = ce, n = Ze, r = (
    /** @type {Batch} */
    he
  );
  return function(i = !0) {
    Lt(e), yt(t), En(n), i && (e.f & dt) === 0 && (r?.activate(), r?.apply());
  };
}
function lr(e = !0) {
  Lt(null), yt(null), En(null), e && he?.deactivate();
}
function Oa() {
  var e = (
    /** @type {Effect} */
    ie
  ), t = e.b, n = (
    /** @type {Batch} */
    he
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function $n(e) {
  var t = $e | je;
  return ie !== null && (ie.f |= Pn), {
    ctx: Ze,
    deps: null,
    effects: null,
    equals: Aa,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ze
    ),
    wv: 0,
    parent: ie,
    ac: null
  };
}
const zn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function hi(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    ie
  );
  r === null && Ns();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = fn(
    /** @type {V} */
    ze
  ), l = !ce, u = /* @__PURE__ */ new Set();
  return Ri(() => {
    var o = (
      /** @type {Effect} */
      ie
    ), d = Sa();
    s = d.promise;
    try {
      Promise.resolve(e()).then(d.resolve, (v) => {
        v !== Wn && d.reject(v);
      }).finally(lr);
    } catch (v) {
      d.reject(v), lr();
    }
    var g = (
      /** @type {Batch} */
      he
    );
    if (l) {
      if ((o.f & Rn) !== 0)
        var m = Oa();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(zn);
      else
        for (const v of u.values())
          v.reject(zn);
      u.add(d), g.async_deriveds.set(o, d);
    }
    const p = (v, h = void 0) => {
      m?.(), u.delete(d), h !== zn && (g.activate(), h ? (i.f |= en, Tn(i, h)) : ((i.f & en) !== 0 && (i.f ^= en), Tn(i, v)), g.deactivate());
    };
    d.promise.then(p, (v) => p(null, v || "unknown"));
  }), pr(() => {
    for (const o of u)
      o.reject(zn);
  }), new Promise((o) => {
    function d(g) {
      function m() {
        g === s ? o(i) : d(s);
      }
      g.then(m, m);
    }
    d(s);
  });
}
// @__NO_SIDE_EFFECTS__
function ee(e) {
  const t = /* @__PURE__ */ $n(e);
  return es(t), t;
}
// @__NO_SIDE_EFFECTS__
function Fa(e) {
  const t = /* @__PURE__ */ $n(e);
  return t.equals = Ra, t;
}
function pi(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      ot(
        /** @type {Effect} */
        t[n]
      );
  }
}
function $r(e) {
  var t, n = ie, r = e.parent;
  if (!Yt && r !== null && e.v !== ze && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (dt | at)) !== 0)
    return ei(), e.v;
  Lt(r);
  try {
    e.f &= ~dn, pi(e), t = as(e);
  } finally {
    Lt(n);
  }
  return t;
}
function La(e) {
  var t = $r(e);
  if (!e.equals(t) && (e.wv = ns(), (!he?.is_fork || e.deps === null) && (he !== null ? (he.capture(e, t, !0), Ir?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Pe(e, De);
    return;
  }
  Yt || (At !== null ? (Wr() || he?.is_fork) && At.set(e, t) : Ur(e));
}
function gi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Cn(() => {
        t.ac.abort(Wn), t.ac = null;
      }), t.fn !== null && (t.teardown = er), Yn(t, 0), Xr(t));
}
function za(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Mn(t);
}
let wr = null, gn = null, he = null, Ir = null, At = null, Or = null, yr = !1, mn = null, tr = null;
var na = 0;
let _i = 1;
class tn {
  id = _i++;
  /** True as soon as `#process` was called */
  #t = !1;
  linked = !0;
  /** @type {Batch | null} */
  #i = null;
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
  #u = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #c = /* @__PURE__ */ new Set();
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
    gn === null ? wr = gn = this : (gn.#e = this, this.#i = gn), gn = this;
  }
  #b() {
    if (this.is_fork) return !0;
    for (const r of this.#n.keys()) {
      for (var t = r, n = !1; t.parent !== null; ) {
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
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#f.get(t);
    if (r) {
      this.#f.delete(t);
      for (var s of r.d)
        Pe(s, je), n(s);
      for (s of r.m)
        Pe(s, Pt), n(s);
    }
    this.#g.add(t);
  }
  #_() {
    this.#t = !0, na++ > 1e3 && (this.#h(), bi());
    for (const o of this.#u)
      this.#c.delete(o), Pe(o, je), this.schedule(o);
    for (const o of this.#c)
      Pe(o, Pt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = mn = [], r = [], s = tr = [];
    for (const o of t)
      try {
        this.#y(o, n, r);
      } catch (d) {
        throw qa(o), this.#b() || this.discard(), d;
      }
    if (he = null, s.length > 0) {
      var i = tn.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (mn = null, tr = null, this.#b()) {
      this.#v(r), this.#v(n);
      for (const [o, d] of this.#f)
        ja(o, d);
      s.length > 0 && /** @type {unknown} */
      he.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#v(r), this.#v(n), l.#x(this);
      return;
    }
    this.#u.clear(), this.#c.clear();
    for (const o of this.#o) o(this);
    this.#o.clear(), Ir = this, ra(r), ra(n), Ir = null, this.#l?.resolve();
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      he
    );
    if (this.#s === 0 && (this.#a.length === 0 || u !== null) && this.#h(), this.#a.length > 0)
      if (u !== null) {
        const o = u;
        o.#a.push(...this.#a.filter((d) => !o.#a.includes(d)));
      } else
        u = this;
    u !== null && u.#_();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #y(t, n, r) {
    t.f ^= De;
    for (var s = t.first; s !== null; ) {
      var i = s.f, l = (i & (wt | Gt)) !== 0, u = l && (i & De) !== 0, o = u || (i & at) !== 0 || this.#f.has(s);
      if (!o && s.fn !== null) {
        l ? s.f ^= De : (i & kn) !== 0 ? n.push(s) : Xn(s) && ((i & Mt) !== 0 && this.#c.add(s), Mn(s));
        var d = s.first;
        if (d !== null) {
          s = d;
          continue;
        }
      }
      for (; s !== null; ) {
        var g = s.next;
        if (g !== null) {
          s = g;
          break;
        }
        s = s.parent;
      }
    }
  }
  #m() {
    for (var t = this.#i; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, r]] of this.current)
          if (t.current.has(n) && !r)
            return t;
      }
      t = t.#i;
    }
    return null;
  }
  /**
   * @param {Batch} batch
   */
  #x(t) {
    for (const [r, s] of t.current)
      !this.previous.has(r) && t.previous.has(r) && this.previous.set(r, t.previous.get(r)), this.current.set(r, s);
    for (const [r, s] of t.async_deriveds) {
      const i = this.async_deriveds.get(r);
      i && s.promise.then(i.resolve).catch(i.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#u, t.#c);
    const n = (r) => {
      var s = r.reactions;
      if (s !== null && !((r.f & $e) !== 0 && (r.f & (je | Pt)) === 0))
        for (const u of s) {
          var i = u.f;
          if ((i & $e) !== 0)
            n(
              /** @type {Derived} */
              u
            );
          else {
            var l = (
              /** @type {Effect} */
              u
            );
            i & (xn | Mt) && !this.async_deriveds.has(l) && (this.#c.delete(l), Pe(l, je), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#h(), he = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      Ia(t[n], this.#u, this.#c);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== ze && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & en) === 0 && (this.current.set(t, [n, r]), At?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    he = this;
  }
  deactivate() {
    he = null, At = null;
  }
  flush() {
    try {
      yr = !0, he = this, this.#_();
    } finally {
      na = 0, Or = null, mn = null, tr = null, yr = !1, he = null, At = null, on.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(zn);
    this.#h(), this.#l?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let m = wr; m !== null; m = m.#e) {
      var t = m.id < this.id, n = [];
      for (const [p, [v, h]] of this.current) {
        if (m.current.has(p)) {
          var r = (
            /** @type {[any, boolean]} */
            m.current.get(p)[0]
          );
          if (t && v !== r)
            m.current.set(p, [v, h]);
          else
            continue;
        }
        n.push(p);
      }
      if (t)
        for (const [p, v] of this.async_deriveds) {
          const h = m.async_deriveds.get(p);
          h && v.promise.then(h.resolve).catch(h.reject);
        }
      var s = [...m.current.keys()].filter(
        (p) => !/** @type {[any, boolean]} */
        m.current.get(p)[1]
      );
      if (!(!m.#t || s.length === 0)) {
        var i = s.filter((p) => !this.current.has(p));
        if (i.length === 0)
          t && m.discard();
        else if (n.length > 0) {
          if (t)
            for (const p of this.#g)
              m.unskip_effect(p, (v) => {
                (v.f & (Mt | xn)) !== 0 ? m.schedule(v) : m.#v([v]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (var o of n)
            Da(o, i, l, u);
          u = /* @__PURE__ */ new Map();
          var d = [...m.current].filter(([p, v]) => {
            const h = this.current.get(p);
            return h ? h[0] !== v[0] || h[1] !== v[1] : !0;
          }).map(([p]) => p);
          if (d.length > 0)
            for (const p of this.#p)
              (p.f & (dt | at | sr)) === 0 && Gr(p, d, u) && ((p.f & (xn | Mt)) !== 0 ? (Pe(p, je), m.schedule(p)) : m.#u.add(p));
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
    this.#d || (this.#d = !0, Ut(() => {
      this.#d = !1, this.linked && this.flush();
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
      this.#c.add(r);
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
    return (this.#l ??= Sa()).promise;
  }
  static ensure() {
    if (he === null) {
      const t = he = new tn();
      yr || Ut(() => {
        t.#t || t.flush();
      });
    }
    return he;
  }
  apply() {
    {
      At = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Or = t, t.b?.is_pending && (t.f & (kn | hr | Ea)) !== 0 && (t.f & Rn) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (mn !== null && n === ie && (ce === null || (ce.f & $e) === 0))
        return;
      if ((r & (Gt | wt)) !== 0) {
        if ((r & De) === 0)
          return;
        n.f ^= De;
      }
    }
    this.#a.push(n);
  }
  #h() {
    if (this.linked) {
      var t = this.#i, n = this.#e;
      t === null ? wr = n : t.#e = n, n === null ? gn = t : n.#i = t, this.linked = !1;
    }
  }
}
function bi() {
  try {
    zs();
  } catch (e) {
    Zt(e, Or);
  }
}
let Bt = null;
function ra(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (dt | at)) === 0 && Xn(r) && (Bt = /* @__PURE__ */ new Set(), Mn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ja(r), Bt?.size > 0)) {
        on.clear();
        for (const s of Bt) {
          if ((s.f & (dt | at)) !== 0) continue;
          const i = [s];
          let l = s.parent;
          for (; l !== null; )
            Bt.has(l) && (Bt.delete(l), i.push(l)), l = l.parent;
          for (let u = i.length - 1; u >= 0; u--) {
            const o = i[u];
            (o.f & (dt | at)) === 0 && Mn(o);
          }
        }
        Bt.clear();
      }
    }
    Bt = null;
  }
}
function Da(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & $e) !== 0 ? Da(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (xn | Mt)) !== 0 && (i & je) === 0 && Gr(s, t, r) && (Pe(s, je), Yr(
        /** @type {Effect} */
        s
      ));
    }
}
function Gr(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (ar.call(t, s))
        return !0;
      if ((s.f & $e) !== 0 && Gr(
        /** @type {Derived} */
        s,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          s,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function Yr(e) {
  he.schedule(e);
}
function ja(e, t) {
  if (!((e.f & wt) !== 0 && (e.f & De) !== 0)) {
    (e.f & je) !== 0 ? t.d.push(e) : (e.f & Pt) !== 0 && t.m.push(e), Pe(e, De);
    for (var n = e.first; n !== null; )
      ja(n, t), n = n.next;
  }
}
function qa(e) {
  Pe(e, De);
  for (var t = e.first; t !== null; )
    qa(t), t = t.next;
}
let or = /* @__PURE__ */ new Set();
const on = /* @__PURE__ */ new Map();
let Ha = !1;
function fn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Aa,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function X(e, t) {
  const n = fn(e);
  return es(n), n;
}
// @__NO_SIDE_EFFECTS__
function mi(e, t = !1, n = !0) {
  const r = fn(e);
  return t || (r.equals = Ra), r;
}
function S(e, t, n = !1) {
  ce !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Rt || (ce.f & sr) !== 0) && Pa() && (ce.f & ($e | Mt | xn | sr)) !== 0 && (Ft === null || !Ft.has(e)) && Hs();
  let r = n ? qe(t) : t;
  return Tn(e, r, tr);
}
function Tn(e, t, n = null) {
  if (!e.equals(t)) {
    on.set(e, Yt ? t : e.v);
    var r = tn.ensure();
    if (r.capture(e, t), (e.f & $e) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & je) !== 0 && $r(s), At === null && Ur(s);
    }
    e.wv = ns(), Ba(e, je, n), ie !== null && (ie.f & De) !== 0 && (ie.f & (wt | Gt)) === 0 && (gt === null ? Ni([e]) : gt.push(e)), !r.is_fork && or.size > 0 && !Ha && wi();
  }
  return t;
}
function wi() {
  Ha = !1;
  for (const e of or) {
    (e.f & De) !== 0 && Pe(e, Pt);
    let t;
    try {
      t = Xn(e);
    } catch {
      t = !0;
    }
    t && Mn(e);
  }
  or.clear();
}
function yi(e, t = 1) {
  var n = a(e), r = t === 1 ? n++ : n--;
  return S(e, n), r;
}
function Un(e) {
  S(e, e.v + 1);
}
function Ba(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, i = 0; i < s; i++) {
      var l = r[i], u = l.f, o = (u & je) === 0;
      if (o && Pe(l, t), (u & sr) !== 0)
        or.add(
          /** @type {Effect} */
          l
        );
      else if ((u & $e) !== 0) {
        var d = (
          /** @type {Derived} */
          l
        );
        At?.delete(d), (u & dn) === 0 && (u & mt && (ie === null || (ie.f & ir) === 0) && (l.f |= dn), Ba(d, Pt, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (u & Mt) !== 0 && Bt !== null && Bt.add(g), n !== null ? n.push(g) : Yr(g);
      }
    }
}
function qe(e) {
  if (typeof e != "object" || e === null || ln in e)
    return e;
  const t = ka(e);
  if (t !== ks && t !== Ss)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Br(e), s = /* @__PURE__ */ X(0), i = cn, l = (u) => {
    if (cn === i)
      return u();
    var o = ce, d = cn;
    yt(null), ia(i);
    var g = u();
    return yt(o), ia(d), g;
  };
  return r && n.set("length", /* @__PURE__ */ X(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && js();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var m = /* @__PURE__ */ X(d.value);
          return n.set(o, m), m;
        }) : S(g, d.value, !0), !0;
      },
      deleteProperty(u, o) {
        var d = n.get(o);
        if (d === void 0) {
          if (o in u) {
            const g = l(() => /* @__PURE__ */ X(ze));
            n.set(o, g), Un(s);
          }
        } else
          S(d, ze), Un(s);
        return !0;
      },
      get(u, o, d) {
        if (o === ln)
          return e;
        var g = n.get(o), m = o in u;
        if (g === void 0 && (!m || yn(u, o)?.writable) && (g = l(() => {
          var v = qe(m ? u[o] : ze), h = /* @__PURE__ */ X(v);
          return h;
        }), n.set(o, g)), g !== void 0) {
          var p = a(g);
          return p === ze ? void 0 : p;
        }
        return Reflect.get(u, o, d);
      },
      getOwnPropertyDescriptor(u, o) {
        var d = Reflect.getOwnPropertyDescriptor(u, o);
        if (d && "value" in d) {
          var g = n.get(o);
          g && (d.value = a(g));
        } else if (d === void 0) {
          var m = n.get(o), p = m?.v;
          if (m !== void 0 && p !== ze)
            return {
              enumerable: !0,
              configurable: !0,
              value: p,
              writable: !0
            };
        }
        return d;
      },
      has(u, o) {
        if (o === ln)
          return !0;
        var d = n.get(o), g = d !== void 0 && d.v !== ze || Reflect.has(u, o);
        if (d !== void 0 || ie !== null && (!g || yn(u, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var p = g ? qe(u[o]) : ze, v = /* @__PURE__ */ X(p);
            return v;
          }), n.set(o, d));
          var m = a(d);
          if (m === ze)
            return !1;
        }
        return g;
      },
      set(u, o, d, g) {
        var m = n.get(o), p = o in u;
        if (r && o === "length")
          for (var v = d; v < /** @type {Source<number>} */
          m.v; v += 1) {
            var h = n.get(v + "");
            h !== void 0 ? S(h, ze) : v in u && (h = l(() => /* @__PURE__ */ X(ze)), n.set(v + "", h));
          }
        if (m === void 0)
          (!p || yn(u, o)?.writable) && (m = l(() => /* @__PURE__ */ X(void 0)), S(m, qe(d)), n.set(o, m));
        else {
          p = m.v !== ze;
          var w = l(() => qe(d));
          S(m, w);
        }
        var c = Reflect.getOwnPropertyDescriptor(u, o);
        if (c?.set && c.set.call(g, d), !p) {
          if (r && typeof o == "string") {
            var _ = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= _.v && S(_, y + 1);
          }
          Un(s);
        }
        return !0;
      },
      ownKeys(u) {
        a(s);
        var o = Reflect.ownKeys(u).filter((m) => {
          var p = n.get(m);
          return p === void 0 || p.v !== ze;
        });
        for (var [d, g] of n)
          g.v !== ze && !(d in u) && o.push(d);
        return o;
      },
      setPrototypeOf() {
        qs();
      }
    }
  );
}
function aa(e) {
  try {
    if (e !== null && typeof e == "object" && ln in e)
      return e[ln];
  } catch {
  }
  return e;
}
function xi(e, t) {
  return Object.is(aa(e), aa(t));
}
var Gn, Ua, $a, Ga;
function ki() {
  if (Gn === void 0) {
    Gn = window, Ua = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    $a = yn(t, "firstChild").get, Ga = yn(t, "nextSibling").get, ta(e) && (e[Pr] = void 0, e[Ta] = null, e[Cr] = void 0, e.__e = void 0), ta(n) && (n[Nr] = void 0);
  }
}
function $t(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ur(e) {
  return (
    /** @type {TemplateNode | null} */
    $a.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Vn(e) {
  return (
    /** @type {TemplateNode | null} */
    Ga.call(e)
  );
}
function f(e, t) {
  return /* @__PURE__ */ ur(e);
}
function Je(e, t = !1) {
  {
    var n = /* @__PURE__ */ ur(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Vn(n) : n;
  }
}
function b(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Vn(r);
  return r;
}
function Si(e) {
  e.textContent = "";
}
function Ya() {
  return !1;
}
function Ei(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Ti(e) {
  ie === null && (ce === null && Ls(), Fs()), Yt && Os();
}
function Mi(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Wt(e, t) {
  var n = ie;
  n !== null && (n.f & at) !== 0 && (e |= at);
  var r = {
    ctx: Ze,
    deps: null,
    nodes: null,
    f: e | je | mt,
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
  he?.register_created_effect(r);
  var s = r;
  if ((e & kn) !== 0)
    mn !== null ? mn.push(r) : tn.ensure().schedule(r);
  else if (t !== null) {
    try {
      Mn(r);
    } catch (l) {
      throw ot(r), l;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & Pn) === 0 && (s = s.first, (e & Mt) !== 0 && (e & Sn) !== 0 && s !== null && (s.f |= Sn));
  }
  if (s !== null && (s.parent = n, n !== null && Mi(s, n), ce !== null && (ce.f & $e) !== 0 && (e & Gt) === 0)) {
    var i = (
      /** @type {Derived} */
      ce
    );
    (i.effects ??= []).push(s);
  }
  return r;
}
function Wr() {
  return ce !== null && !Rt;
}
function pr(e) {
  const t = Wt(hr, null);
  return Pe(t, De), t.teardown = e, t;
}
function nn(e) {
  Ti();
  var t = (
    /** @type {Effect} */
    ie.f
  ), n = !ce && (t & wt) !== 0 && Ze !== null && !Ze.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Ze
    );
    (r.e ??= []).push(e);
  } else
    return Wa(e);
}
function Wa(e) {
  return Wt(kn | Ms, e);
}
function Ai(e) {
  tn.ensure();
  const t = Wt(Gt | Pn, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? un(t, () => {
      ot(t), r(void 0);
    }) : (ot(t), r(void 0));
  });
}
function Va(e) {
  return Wt(kn, e);
}
function Ri(e) {
  return Wt(xn | Pn, e);
}
function Xa(e, t = 0) {
  return Wt(hr | t, e);
}
function j(e, t = [], n = [], r = []) {
  fi(r, t, n, (s) => {
    Wt(hr, () => {
      e(...s.map(a));
    });
  });
}
function Vr(e, t = 0) {
  var n = Wt(Mt | t, e);
  return n;
}
function _t(e) {
  return Wt(wt | Pn, e);
}
function Ka(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Yt, r = ce;
    sa(!0), yt(null);
    try {
      t.call(null);
    } finally {
      sa(n), yt(r);
    }
  }
}
function Xr(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Cn(() => {
      s.abort(Wn);
    });
    var r = n.next;
    (n.f & Gt) !== 0 ? n.parent = null : ot(n, t), n = r;
  }
}
function Pi(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & wt) === 0 && ot(t), t = n;
  }
}
function ot(e, t = !0) {
  var n = !1;
  (t || (e.f & Ts) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ci(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Rr, Xr(e, t && !n), Yn(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  Ka(e), e.f ^= Rr, e.f |= dt;
  var s = e.parent;
  s !== null && s.first !== null && Ja(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Ci(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Vn(e);
    e.remove(), e = n;
  }
}
function Ja(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function un(e, t, n = !0) {
  var r = [];
  Za(e, r, !0);
  var s = () => {
    n && ot(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var l = () => --i || s();
    for (var u of r)
      u.out(l);
  } else
    s();
}
function Za(e, t, n) {
  if ((e.f & at) === 0) {
    e.f ^= at;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var s = e.first; s !== null; ) {
      var i = s.next;
      if ((s.f & Gt) === 0) {
        var l = (s.f & Sn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (s.f & wt) !== 0 && (e.f & Mt) !== 0;
        Za(s, t, l ? n : !1);
      }
      s = i;
    }
  }
}
function cr(e) {
  Qa(e, !0);
}
function Qa(e, t) {
  if ((e.f & at) !== 0) {
    e.f ^= at, (e.f & De) === 0 && (Pe(e, je), tn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & Sn) !== 0 || (n.f & wt) !== 0;
      Qa(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function Kr(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ Vn(n);
      t.append(n), n = s;
    }
}
let nr = !1, Yt = !1;
function sa(e) {
  Yt = e;
}
let ce = null, Rt = !1;
function yt(e) {
  ce = e;
}
let ie = null;
function Lt(e) {
  ie = e;
}
let Ft = null;
function es(e) {
  ce !== null && (Ft ??= /* @__PURE__ */ new Set()).add(e);
}
let lt = null, ct = 0, gt = null;
function Ni(e) {
  gt = e;
}
let ts = 1, sn = 0, cn = sn;
function ia(e) {
  cn = e;
}
function ns() {
  return ++ts;
}
function Xn(e) {
  var t = e.f;
  if ((t & je) !== 0)
    return !0;
  if (t & $e && (e.f &= ~dn), (t & Pt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (Xn(
        /** @type {Derived} */
        i
      ) && La(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & mt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    At === null && Pe(e, De);
  }
  return !1;
}
function rs(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Ft !== null && Ft.has(e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & $e) !== 0 ? rs(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Pe(i, je) : (i.f & De) !== 0 && Pe(i, Pt), Yr(
        /** @type {Effect} */
        i
      ));
    }
}
function as(e) {
  var t = lt, n = ct, r = gt, s = ce, i = Ft, l = Ze, u = Rt, o = cn, d = e.f;
  lt = /** @type {null | Value[]} */
  null, ct = 0, gt = null, ce = (d & (wt | Gt)) === 0 ? e : null, Ft = null, En(e.ctx), Rt = !1, cn = ++sn, e.ac !== null && (Cn(() => {
    e.ac.abort(Wn);
  }), e.ac = null);
  try {
    e.f |= ir;
    var g = (
      /** @type {Function} */
      e.fn
    ), m = g();
    e.f |= Rn;
    var p = e.deps, v = he?.is_fork;
    if (lt !== null) {
      var h;
      if (v || Yn(e, ct), p !== null && ct > 0)
        for (p.length = ct + lt.length, h = 0; h < lt.length; h++)
          p[ct + h] = lt[h];
      else
        e.deps = p = lt;
      if (Wr() && (e.f & mt) !== 0)
        for (h = ct; h < p.length; h++)
          (p[h].reactions ??= []).push(e);
    } else !v && p !== null && ct < p.length && (Yn(e, ct), p.length = ct);
    if (Pa() && gt !== null && !Rt && p !== null && (e.f & ($e | Pt | je)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      gt.length; h++)
        rs(
          gt[h],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (sn++, s.deps !== null)
        for (let w = 0; w < n; w += 1)
          s.deps[w].rv = sn;
      if (t !== null)
        for (const w of t)
          w.rv = sn;
      gt !== null && (r === null ? r = gt : r.push(.../** @type {Source[]} */
      gt));
    }
    return (e.f & en) !== 0 && (e.f ^= en), m;
  } catch (w) {
    return Ca(w);
  } finally {
    e.f ^= ir, lt = t, ct = n, gt = r, ce = s, Ft = i, En(l), Rt = u, cn = o;
  }
}
function Ii(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = ws.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & $e) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (lt === null || !ar.call(lt, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & mt) !== 0 && (i.f ^= mt, i.f &= ~dn), i.v !== ze && Ur(i), i.ac !== null && Cn(() => {
      i.ac.abort(Wn), i.ac = null, Pe(i, je);
    }), gi(i), Yn(i, 0);
  }
}
function Yn(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Ii(e, n[r]);
}
function Mn(e) {
  var t = e.f;
  if ((t & dt) === 0) {
    Pe(e, De);
    var n = ie, r = nr;
    ie = e, nr = (t & (wt | Gt)) === 0;
    try {
      (t & (Mt | Ea)) !== 0 ? Pi(e) : Xr(e), Ka(e);
      var s = as(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = ts;
      var i;
    } finally {
      nr = r, ie = n;
    }
  }
}
function a(e) {
  var t = e.f, n = (t & $e) !== 0;
  if (ce !== null && !Rt) {
    var r = ie !== null && (ie.f & dt) !== 0;
    if (!r && (Ft === null || !Ft.has(e))) {
      var s = ce.deps;
      if ((ce.f & ir) !== 0)
        e.rv < sn && (e.rv = sn, lt === null && s !== null && s[ct] === e ? ct++ : lt === null ? lt = [e] : lt.push(e));
      else {
        ce.deps ??= [], ar.call(ce.deps, e) || ce.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [ce] : ar.call(i, ce) || i.push(ce);
      }
    }
  }
  if (Yt && on.has(e))
    return on.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Yt) {
      var u = l.v;
      return ((l.f & De) === 0 && l.reactions !== null || is(l)) && (u = $r(l)), on.set(l, u), u;
    }
    var o = (l.f & mt) === 0 && !Rt && ce !== null && (nr || (ce.f & mt) !== 0), d = (l.f & Rn) === 0;
    Xn(l) && (o && (l.f |= mt), La(l)), o && !d && (za(l), ss(l));
  }
  if (At?.has(e))
    return At.get(e);
  if ((e.f & en) !== 0)
    throw e.v;
  return e.v;
}
function ss(e) {
  if (e.f |= mt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & $e) !== 0 && (t.f & mt) === 0 && (za(
        /** @type {Derived} */
        t
      ), ss(
        /** @type {Derived} */
        t
      ));
}
function is(e) {
  if (e.v === ze) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (on.has(t) || (t.f & $e) !== 0 && is(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function vn(e) {
  var t = Rt;
  try {
    return Rt = !0, e();
  } finally {
    Rt = t;
  }
}
const Oi = ["touchstart", "touchmove"];
function Fi(e) {
  return Oi.includes(e);
}
const Dn = Symbol("events"), ls = /* @__PURE__ */ new Set(), Fr = /* @__PURE__ */ new Set();
function Li(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || zr.call(t, i), !i.cancelBubble)
      return Cn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ut(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Lr(e, t, n, r, s) {
  var i = { capture: r, passive: s }, l = Li(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && pr(() => {
    t.removeEventListener(e, l, i);
  });
}
function J(e, t, n) {
  (t[Dn] ??= {})[e] = n;
}
function zt(e) {
  for (var t = 0; t < e.length; t++)
    ls.add(e[t]);
  for (var n of Fr)
    n(e);
}
let la = null;
function zr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  la = e;
  var l = 0, u = la === e && e[Dn];
  if (u) {
    var o = s.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Dn] = t;
      return;
    }
    var d = s.indexOf(t);
    if (d === -1)
      return;
    o <= d && (l = o);
  }
  if (i = /** @type {Element} */
  s[l] || e.target, i !== t) {
    ys(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = ce, m = ie;
    yt(null), Lt(null);
    try {
      for (var p, v = []; i !== null && i !== t; ) {
        try {
          var h = i[Dn]?.[r];
          h != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && h.call(i, e);
        } catch (w) {
          p ? v.push(w) : p = w;
        }
        if (e.cancelBubble) break;
        l++, i = l < s.length ? (
          /** @type {Element} */
          s[l]
        ) : null;
      }
      if (p) {
        for (let w of v)
          queueMicrotask(() => {
            throw w;
          });
        throw p;
      }
    } finally {
      e[Dn] = t, delete e.currentTarget, yt(g), Lt(m);
    }
  }
}
const zi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Di(e) {
  return (
    /** @type {string} */
    zi?.createHTML(e) ?? e
  );
}
function ji(e) {
  var t = Ei("template");
  return t.innerHTML = Di(e.replaceAll("<!>", "<!---->")), t.content;
}
function dr(e, t) {
  var n = (
    /** @type {Effect} */
    ie
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  var n = (t & Js) !== 0, r = (t & Zs) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = ji(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ ur(s)));
    var l = (
      /** @type {TemplateNode} */
      r || Ua ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ur(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      dr(u, o);
    } else
      dr(l, l);
    return l;
  };
}
function wn(e = "") {
  {
    var t = $t(e + "");
    return dr(t, t), t;
  }
}
function Jr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = $t();
  return e.append(t, n), dr(t, n), e;
}
function A(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function T(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[Nr] ??= e.nodeValue) && (e[Nr] = n, e.nodeValue = `${n}`);
}
function qi(e, t) {
  return Hi(e, t);
}
const Zn = /* @__PURE__ */ new Map();
function Hi(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: l = !0, transformError: u }) {
  ki();
  var o = void 0, d = Ai(() => {
    var g = n ?? t.appendChild($t());
    ci(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (v) => {
        xt({});
        var h = (
          /** @type {ComponentContext} */
          Ze
        );
        i && (h.c = i), s && (r.$$events = s), o = e(v, r) || {}, kt();
      },
      u
    );
    var m = /* @__PURE__ */ new Set(), p = (v) => {
      for (var h = 0; h < v.length; h++) {
        var w = v[h];
        if (!m.has(w)) {
          m.add(w);
          var c = Fi(w);
          for (const C of [t, document]) {
            var _ = Zn.get(C);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), Zn.set(C, _));
            var y = _.get(w);
            y === void 0 ? (C.addEventListener(w, zr, { passive: c }), _.set(w, 1)) : _.set(w, y + 1);
          }
        }
      }
    };
    return p(vr(ls)), Fr.add(p), () => {
      for (var v of m)
        for (const c of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Zn.get(c)
          ), w = (
            /** @type {number} */
            h.get(v)
          );
          --w == 0 ? (c.removeEventListener(v, zr), h.delete(v), h.size === 0 && Zn.delete(c)) : h.set(v, w);
        }
      Fr.delete(p), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return Bi.set(o, d), o;
}
let Bi = /* @__PURE__ */ new WeakMap();
class Ui {
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
  #i = /* @__PURE__ */ new Map();
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
      ), r = this.#i.get(n);
      if (r)
        cr(r), this.#o.delete(n);
      else {
        var s = this.#e.get(n);
        s && (cr(s.effect), this.#i.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
      }
      for (const [i, l] of this.#t) {
        if (this.#t.delete(i), i === t)
          break;
        const u = this.#e.get(l);
        u && (ot(u.effect), this.#e.delete(l));
      }
      for (const [i, l] of this.#i) {
        if (i === n || this.#o.has(i)) continue;
        const u = () => {
          if (Array.from(this.#t.values()).includes(i)) {
            var d = document.createDocumentFragment();
            Kr(l, d), d.append($t()), this.#e.set(i, { effect: l, fragment: d });
          } else
            ot(l);
          this.#o.delete(i), this.#i.delete(i);
        };
        this.#r || !r ? (this.#o.add(i), un(l, u, !1)) : u();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, s] of this.#e)
      n.includes(r) || (ot(s.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      he
    ), s = Ya();
    if (n && !this.#i.has(t) && !this.#e.has(t))
      if (s) {
        var i = document.createDocumentFragment(), l = $t();
        i.append(l), this.#e.set(t, {
          effect: _t(() => n(l)),
          fragment: i
        });
      } else
        this.#i.set(
          t,
          _t(() => n(this.anchor))
        );
    if (this.#t.set(r, t), s) {
      for (const [u, o] of this.#i)
        u === t ? r.unskip_effect(o) : r.skip_effect(o);
      for (const [u, o] of this.#e)
        u === t ? r.unskip_effect(o.effect) : r.skip_effect(o.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function Y(e, t, n = !1) {
  var r = new Ui(e), s = n ? Sn : 0;
  function i(l, u) {
    r.ensure(l, u);
  }
  Vr(() => {
    var l = !1;
    t((u, o = 0) => {
      l = !0, i(o, u);
    }), l || i(-1, null);
  }, s);
}
function bt(e, t) {
  return t;
}
function $i(e, t, n) {
  for (var r = [], s = t.length, i, l = t.length, u = 0; u < s; u++) {
    let m = t[u];
    un(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var p = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Dr(e, vr(i.done)), p.delete(i), p.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var o = r.length === 0 && n !== null;
    if (o) {
      var d = (
        /** @type {Element} */
        n
      ), g = (
        /** @type {Element} */
        d.parentNode
      );
      Si(g), g.append(d), e.items.clear();
    }
    Dr(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function Dr(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const l of e.pending.values())
      for (const u of l)
        r.add(
          /** @type {EachItem} */
          e.items.get(u).e
        );
  }
  for (var s = 0; s < t.length; s++) {
    var i = t[s];
    if (r?.has(i)) {
      i.f |= Ot;
      const l = document.createDocumentFragment();
      Kr(i, l);
    } else
      ot(t[s], n);
  }
}
var oa;
function Ke(e, t, n, r, s, i = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & Ma) !== 0;
  if (o) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild($t());
  }
  var g = null, m = /* @__PURE__ */ Fa(() => {
    var C = n();
    return (
      /** @type {V[]} */
      Br(C) ? C : C == null ? [] : vr(C)
    );
  }), p, v = /* @__PURE__ */ new Map(), h = !0;
  function w(C) {
    (y.effect.f & dt) === 0 && (y.pending.delete(C), y.fallback = g, Gi(y, p, l, t, r), g !== null && (p.length === 0 ? (g.f & Ot) === 0 ? cr(g) : (g.f ^= Ot, jn(g, null, l)) : un(g, () => {
      g = null;
    })));
  }
  function c(C) {
    y.pending.delete(C);
  }
  var _ = Vr(() => {
    p = /** @type {V[]} */
    a(m);
    for (var C = p.length, N = /* @__PURE__ */ new Set(), M = (
      /** @type {Batch} */
      he
    ), O = Ya(), $ = 0; $ < C; $ += 1) {
      var H = p[$], R = r(H, $), F = h ? null : u.get(R);
      F ? (F.v && Tn(F.v, H), F.i && Tn(F.i, $), O && M.unskip_effect(F.e)) : (F = Yi(
        u,
        h ? l : oa ??= $t(),
        H,
        R,
        $,
        s,
        t,
        n
      ), h || (F.e.f |= Ot), u.set(R, F)), N.add(R);
    }
    if (C === 0 && i && !g && (h ? g = _t(() => i(l)) : (g = _t(() => i(oa ??= $t())), g.f |= Ot)), C > N.size && Is(), !h)
      if (v.set(M, N), O) {
        for (const [U, D] of u)
          N.has(U) || M.skip_effect(D.e);
        M.oncommit(w), M.ondiscard(c);
      } else
        w(M);
    a(m);
  }), y = { effect: _, items: u, pending: v, outrogroups: null, fallback: g };
  h = !1;
}
function In(e) {
  for (; e !== null && (e.f & wt) === 0; )
    e = e.next;
  return e;
}
function Gi(e, t, n, r, s) {
  var i = (r & Gs) !== 0, l = t.length, u = e.items, o = In(e.effect.first), d, g = null, m, p = [], v = [], h, w, c, _;
  if (i)
    for (_ = 0; _ < l; _ += 1)
      h = t[_], w = s(h, _), c = /** @type {EachItem} */
      u.get(w).e, (c.f & Ot) === 0 && (c.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(c));
  for (_ = 0; _ < l; _ += 1) {
    if (h = t[_], w = s(h, _), c = /** @type {EachItem} */
    u.get(w).e, e.outrogroups !== null)
      for (const F of e.outrogroups)
        F.pending.delete(c), F.done.delete(c);
    if ((c.f & at) !== 0 && (cr(c), i && (c.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(c))), (c.f & Ot) !== 0)
      if (c.f ^= Ot, c === o)
        jn(c, null, n);
      else {
        var y = g ? g.next : o;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), Jt(e, g, c), Jt(e, c, y), jn(c, y, n), g = c, p = [], v = [], o = In(g.next);
        continue;
      }
    if (c !== o) {
      if (d !== void 0 && d.has(c)) {
        if (p.length < v.length) {
          var C = v[0], N;
          g = C.prev;
          var M = p[0], O = p[p.length - 1];
          for (N = 0; N < p.length; N += 1)
            jn(p[N], C, n);
          for (N = 0; N < v.length; N += 1)
            d.delete(v[N]);
          Jt(e, M.prev, O.next), Jt(e, g, M), Jt(e, O, C), o = C, g = O, _ -= 1, p = [], v = [];
        } else
          d.delete(c), jn(c, o, n), Jt(e, c.prev, c.next), Jt(e, c, g === null ? e.effect.first : g.next), Jt(e, g, c), g = c;
        continue;
      }
      for (p = [], v = []; o !== null && o !== c; )
        (d ??= /* @__PURE__ */ new Set()).add(o), v.push(o), o = In(o.next);
      if (o === null)
        continue;
    }
    (c.f & Ot) === 0 && p.push(c), g = c, o = In(c.next);
  }
  if (e.outrogroups !== null) {
    for (const F of e.outrogroups)
      F.pending.size === 0 && (Dr(e, vr(F.done)), e.outrogroups?.delete(F));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || d !== void 0) {
    var $ = [];
    if (d !== void 0)
      for (c of d)
        (c.f & at) === 0 && $.push(c);
    for (; o !== null; )
      (o.f & at) === 0 && o !== e.fallback && $.push(o), o = In(o.next);
    var H = $.length;
    if (H > 0) {
      var R = (r & Ma) !== 0 && l === 0 ? n : null;
      if (i) {
        for (_ = 0; _ < H; _ += 1)
          $[_].nodes?.a?.measure();
        for (_ = 0; _ < H; _ += 1)
          $[_].nodes?.a?.fix();
      }
      $i(e, $, R);
    }
  }
  i && Ut(() => {
    if (m !== void 0)
      for (c of m)
        c.nodes?.a?.apply();
  });
}
function Yi(e, t, n, r, s, i, l, u) {
  var o = (l & Us) !== 0 ? (l & Ys) === 0 ? /* @__PURE__ */ mi(n, !1, !1) : fn(n) : null, d = (l & $s) !== 0 ? fn(s) : null;
  return {
    v: o,
    i: d,
    e: _t(() => (i(t, o ?? n, d ?? s, u), () => {
      e.delete(r);
    }))
  };
}
function jn(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & Ot) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Vn(r)
      );
      if (i.before(r), r === s)
        return;
      r = l;
    }
}
function Jt(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function On(e, t, n) {
  Va(() => {
    var r = vn(() => t(e, n?.()) || {});
    if (r?.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
const ua = [...` 	
\r\f \v\uFEFF`];
function Wi(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s of Object.keys(n))
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var i = s.length, l = 0; (l = r.indexOf(s, l)) >= 0; ) {
          var u = l + i;
          (l === 0 || ua.includes(r[l - 1])) && (u === r.length || ua.includes(r[u])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(u + 1) : l = u;
        }
  }
  return r === "" ? null : r;
}
function ca(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var s of Object.keys(e)) {
    var i = e[s];
    i != null && i !== "" && (r += " " + s + ": " + i + n);
  }
  return r;
}
function Vi(e, t) {
  if (t) {
    var n = "", r, s;
    return Array.isArray(t) ? (r = t[0], s = t[1]) : r = t, r && (n += ca(r)), s && (n += ca(s, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Ae(e, t, n, r, s, i) {
  var l = (
    /** @type {any} */
    e[Pr]
  );
  if (l !== n || l === void 0) {
    var u = Wi(n, r, i);
    u == null ? e.removeAttribute("class") : e.className = u, e[Pr] = n;
  } else if (i && s !== i)
    for (var o in i) {
      var d = !!i[o];
      (s == null || d !== !!s[o]) && e.classList.toggle(o, d);
    }
  return i;
}
function xr(e, t = {}, n, r) {
  for (var s in n) {
    var i = n[s];
    t[s] !== i && (n[s] == null ? e.style.removeProperty(s) : e.style.setProperty(s, i, r));
  }
}
function qn(e, t, n, r) {
  var s = (
    /** @type {any} */
    e[Cr]
  );
  if (s !== t) {
    var i = Vi(t, r);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[Cr] = t;
  } else r && (Array.isArray(r) ? (xr(e, n?.[0], r[0]), xr(e, n?.[1], r[1], "important")) : xr(e, n, r));
  return r;
}
function Hn(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Br(t))
      return ti();
    for (var r of e.options)
      r.selected = t.includes(da(r));
    return;
  }
  for (r of e.options) {
    var s = da(r);
    if (xi(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Qn(e) {
  var t = new MutationObserver(() => {
    "__value" in e && Hn(e, e.__value);
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
  }), pr(() => {
    t.disconnect();
  });
}
function da(e) {
  return "__value" in e ? e.__value : e.value;
}
const Xi = Symbol("is custom element"), Ki = Symbol("is html"), Ji = Ps ? "progress" : "PROGRESS";
function rn(e, t) {
  var n = Zr(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== Ji) || (e.value = t ?? "");
}
function Zi(e, t) {
  var n = Zr(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function ue(e, t, n, r) {
  var s = Zr(e);
  s[t] !== (s[t] = n) && (t === "loading" && (e[Rs] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Qi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Zr(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[Ta] ??= {
      [Xi]: e.nodeName.includes("-"),
      [Ki]: e.namespaceURI === Qs
    }
  );
}
var fa = /* @__PURE__ */ new Map();
function Qi(e) {
  var t = e.getAttribute("is") || e.nodeName, n = fa.get(t);
  if (n) return n;
  fa.set(t, n = []);
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = xs(s);
    for (var l in r)
      r[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    s = ka(s);
  }
  return n;
}
function kr(e, t) {
  return e === t || e?.[ln] === t;
}
function jr(e = {}, t, n, r) {
  var s = (
    /** @type {ComponentContext} */
    Ze.r
  ), i = (
    /** @type {Effect} */
    ie
  );
  return Va(() => {
    var l, u;
    return Xa(() => {
      l = u, u = [], vn(() => {
        kr(n(...u), e) || (t(e, ...u), l && kr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== s && o.parent !== null && o.parent.f & Rr; )
        o = o.parent;
      const d = () => {
        u && kr(n(...u), e) && t(null, ...u);
      }, g = o.teardown;
      o.teardown = () => {
        d(), g?.();
      };
    };
  }), e;
}
function el(e, t) {
  li(window, ["resize"], () => Cn(() => t(window[e])));
}
function te(e, t, n, r) {
  var s = !0, i = (n & Xs) !== 0, l = (n & Ks) !== 0, u = (
    /** @type {V} */
    r
  ), o = !0, d = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && s ? (d ??= /* @__PURE__ */ $n(
    /** @type {() => V} */
    r
  ), a(d)) : (o && (o = !1, u = l ? vn(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), u);
  let m;
  if (i) {
    var p = ln in e || As in e;
    m = yn(e, t)?.set ?? (p && t in e ? (N) => e[t] = N : void 0);
  }
  var v, h = !1;
  i ? [v, h] = ii(() => (
    /** @type {V} */
    e[t]
  )) : v = /** @type {V} */
  e[t], v === void 0 && r !== void 0 && (v = g(), m && (Ds(), m(v)));
  var w;
  if (w = () => {
    var N = (
      /** @type {V} */
      e[t]
    );
    return N === void 0 ? g() : (o = !0, N);
  }, (n & Vs) === 0)
    return w;
  if (m) {
    var c = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(N, M) {
        return arguments.length > 0 ? ((!M || c || h) && m(M ? w() : N), N) : w();
      })
    );
  }
  var _ = !1, y = ((n & Ws) !== 0 ? $n : Fa)(() => (_ = !1, w()));
  i && a(y);
  var C = (
    /** @type {Effect} */
    ie
  );
  return (
    /** @type {() => V} */
    (function(N, M) {
      if (arguments.length > 0) {
        const O = M ? a(y) : i ? qe(N) : N;
        return S(y, O), _ = !0, u !== void 0 && (u = O), N;
      }
      return Yt && _ || (C.f & dt) !== 0 ? y.v : a(y);
    })
  );
}
function Kn(e) {
  Ze === null && Cs(), nn(() => {
    const t = vn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const tl = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(tl);
function nl(e) {
  const t = new URLSearchParams();
  for (const [r, s] of Object.entries(e))
    if (s != null)
      if (Array.isArray(s))
        for (const i of s) t.append(r, String(i));
      else
        t.set(r, String(s));
  const n = t.toString();
  return n ? "?" + n : "";
}
async function Ht(e, t = {}) {
  const n = await fetch(e + nl(t));
  if (!n.ok) {
    const r = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  }
  return n.json();
}
async function _n(e, t) {
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
function va(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const Le = {
  // --- reads
  photos: (e) => Ht("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => Ht("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => Ht("/api/triage/counts", { ...va(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Ht("/api/triage/files"),
  screen: (e, t = {}) => Ht("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Ht("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Ht("/api/triage/page", { ...va(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Ht("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => _n("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => _n("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => _n("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => _n("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => _n("/api/reveal", { id: e }),
  revealOrigin: (e) => _n("/api/reveal", { origin: e }),
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
  rebuildStatus: () => Ht("/api/triage/rebuild")
};
function rl() {
  let e = 0, t = 0;
  return async function(r) {
    const s = ++e, i = await r();
    return s <= t ? { stale: !0, value: void 0 } : (t = s, { stale: !1, value: i });
  };
}
function al(e, t) {
  let n = 0;
  const r = (...s) => {
    clearTimeout(n), n = setTimeout(() => e(...s), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...s) => {
    clearTimeout(n), e(...s);
  }, r;
}
const ha = ["B", "KB", "MB", "GB", "TB"];
function Et(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < ha.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${ha[n]}`;
}
function Me(e) {
  return (Number(e) || 0).toLocaleString();
}
const An = "G:\\photos", pa = [
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
      value: t ? `${An}\\${t}\\${e.key}` : `${An}\\${e.key}`
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
function os(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), r = An.toLowerCase();
  return n.toLowerCase().startsWith(r + "\\") ? n : "";
}
function Qr(e, t) {
  const n = t.toLowerCase();
  return e.some((r) => n === r || n.startsWith(r + "\\"));
}
function sl(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function il(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function us(e, t) {
  if (!t) return null;
  const n = e.find(
    (r) => r.term && r.term.column === t.column && r.term.op === t.op && il(r.term.value, t.value)
  );
  return n ? n.decision : null;
}
var ll = /* @__PURE__ */ P('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), ol = /* @__PURE__ */ P('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), ul = /* @__PURE__ */ P('<div class="line muted svelte-1vgp6n7">…</div>'), cl = /* @__PURE__ */ P('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), dl = /* @__PURE__ */ P('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), fl = /* @__PURE__ */ P('<div class="line muted svelte-1vgp6n7"> </div>'), vl = /* @__PURE__ */ P('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function hl(e, t) {
  xt(t, !0);
  let n = te(t, "counts", 3, null), r = te(t, "files", 3, null), s = te(t, "filesAt", 3, null), i = te(t, "stale", 3, !1), l = te(t, "candidate", 3, null), u = te(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ee(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = vl(), g = f(d);
  let m;
  var p = b(f(g), 2);
  {
    var v = (R) => {
      var F = ol(), U = Je(F), D = f(U), K = f(D), le = b(D, 2), Z = f(le), Q = b(le, 4), ae = f(Q), _e = b(Q, 2), B = f(_e), V = b(U, 2);
      {
        var z = (W) => {
          var x = ll(), k = b(f(x), 2), L = f(k), re = b(k, 2), be = f(re), de = b(re, 4), fe = f(de), Ce = b(de, 2), me = f(Ce), Te = b(Ce, 2), Be = f(Te);
          j(
            (Ge, ut, ve, se, ke) => {
              T(L, `kept ${Ge ?? ""}`), T(be, ut), T(fe, `excluded ${ve ?? ""}`), T(me, se), T(Be, `${a(o) >= 0 ? "+" : ""}${ke ?? ""} excluded`);
            },
            [
              () => Me(n().candidate_kept_paths),
              () => Et(n().candidate_kept_bytes),
              () => Me(n().candidate_excluded_paths),
              () => Et(n().candidate_excluded_bytes),
              () => Me(a(o))
            ]
          ), A(W, x);
        };
        Y(V, (W) => {
          l() && W(z);
        });
      }
      j(
        (W, x, k, L) => {
          T(K, `kept ${W ?? ""}`), T(Z, x), T(ae, `excluded ${k ?? ""}`), T(B, L);
        },
        [
          () => Me(n().kept_paths),
          () => Et(n().kept_bytes),
          () => Me(n().excluded_paths),
          () => Et(n().excluded_bytes)
        ]
      ), A(R, F);
    }, h = (R) => {
      var F = ul();
      A(R, F);
    };
    Y(p, (R) => {
      n() ? R(v) : R(h, -1);
    });
  }
  var w = b(g, 2);
  let c;
  var _ = f(w), y = b(f(_), 3), C = f(y), N = b(y, 2);
  {
    var M = (R) => {
      var F = cl();
      A(R, F);
    };
    Y(N, (R) => {
      i() && r() && r() !== "loading" && R(M);
    });
  }
  var O = b(_, 2);
  {
    var $ = (R) => {
      var F = dl(), U = Je(F);
      let D;
      var K = f(U), le = f(K), Z = b(K, 2), Q = f(Z), ae = b(Z, 4), _e = f(ae), B = b(ae, 2), V = f(B), z = b(U, 2), W = f(z);
      j(
        (x, k, L, re) => {
          D = Ae(U, 1, "line svelte-1vgp6n7", null, D, { outdated: i() }), T(le, `kept ${x ?? ""}`), T(Q, k), T(_e, `excluded ${L ?? ""}`), T(V, re), T(W, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Me(r().kept_files),
          () => Et(r().kept_bytes),
          () => Me(r().excluded_files),
          () => Et(r().excluded_bytes)
        ]
      ), A(R, F);
    }, H = (R) => {
      var F = fl(), U = f(F);
      j(() => T(U, r() === "loading" ? "counting…" : "not counted yet")), A(R, F);
    };
    Y(O, (R) => {
      r() && r() !== "loading" ? R($) : R(H, -1);
    });
  }
  j(() => {
    m = Ae(g, 1, "block svelte-1vgp6n7", null, m, { busy: u() }), c = Ae(w, 1, "block svelte-1vgp6n7", null, c, { busy: r() === "loading" }), y.disabled = r() === "loading", T(C, r() === "loading" ? "counting…" : "recount");
  }), J("click", y, function(...R) {
    t.onfiles?.apply(this, R);
  }), A(e, d), kt();
}
zt(["click"]);
const qr = "http://www.w3.org/2000/svg", an = {
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
}, Qt = {
  ...an,
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
}, pl = [
  { dark: "tint", light: "tintLight", base: an },
  { dark: "control", light: "controlLight", base: Qt },
  { dark: "ink", light: "inkLight", base: Qt },
  { dark: "tally", light: "tallyLight", base: Qt },
  { dark: "tallyInk", light: "tallyInkLight", base: Qt }
], Hr = /* @__PURE__ */ new Set();
let Tt = { ...Qt };
function gl() {
  return Tt;
}
function Sr(e) {
  Tt = ml(e), ea();
  for (const t of Hr) t(Tt);
  return Tt;
}
function _l(e) {
  return Hr.add(e), () => Hr.delete(e);
}
function Bn(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function bl(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: He(Bn(e.r, t.r), 0, 255),
    g: He(Bn(e.g, t.g), 0, 255),
    b: He(Bn(e.b, t.b), 0, 255),
    a: He(Bn(e.a, t.a), 0, 1)
  };
}
function ml(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [r, s] of Object.entries(Qt))
    typeof s == "boolean" ? n[r] = t[r] === void 0 ? s : !!t[r] : typeof s == "object" ? n[r] = bl(t[r], s) : n[r] = Bn(t[r], s);
  return n;
}
function pt({ r: e, g: t, b: n, a: r }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Re(r, 3)})`;
}
function Re(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function ga({ r: e, g: t, b: n, a: r }) {
  return { r: e, g: t, b: n, a: He(r * 1.7 + 0.22, 0, 1) };
}
function _a(e, t) {
  const n = 0.4 + He(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - He(t, 0, 100) / 100) };
}
function ba(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, s = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? He(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * s * Math.max(t.glareFactor, 0) / 100;
  return He(i ** (0.1 + He(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const wl = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function yl(e, t, n) {
  const r = He(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), u = s - l, o = i - l, d = 8, g = [];
  for (let v = 0; v <= d; v++) {
    const h = v / d * (Math.PI / 2);
    g.push([l * Math.cos(h) ** (2 / r), l * Math.sin(h) ** (2 / r)]);
  }
  const m = [], p = (v, h, w, c) => {
    let _ = Math.atan2(v, -h);
    _ < 0 && (_ += Math.PI * 2);
    let y = Math.atan2(c, w);
    y < 0 && (y += Math.PI * 2);
    const C = Re(ba(y, n), 3);
    m.push(`rgba(255, 255, 255, ${C}) ${Re(_ / (Math.PI * 2) * 100, 2)}%`);
  };
  p(0, -i, 0, 1);
  for (const [v, h, w] of wl)
    for (let c = 0; c <= d; c++) {
      const [_, y] = g[w ? d - c : c];
      p(v * (u + _), h * (o + y), v * _ ** (r - 1), -h * y ** (r - 1));
    }
  return m.push(`rgba(255, 255, 255, ${Re(ba(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function ea() {
  const e = Tt, t = document.documentElement.style, n = _a(e.refFresnelRange, e.refFresnelHardness), r = _a(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Re(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Re(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", pt(e.tint)), t.setProperty("--glass-tint-light", pt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", pt(ga(e.tint))), t.setProperty("--glass-tint-sheet-light", pt(ga(e.tintLight))), t.setProperty("--glass-ctl-dark", pt(e.control)), t.setProperty("--glass-ctl-light", pt(e.controlLight)), t.setProperty("--glass-text-dark", pt(e.ink)), t.setProperty("--glass-text-light", pt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", pt(e.tally)), t.setProperty("--glass-tint-tally-light", pt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", pt(e.tallyInk)), t.setProperty("--glass-text-tally-light", pt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Re(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Re(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Re(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Re(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Re(e.shadowX)}px ${Re(-e.shadowY)}px ${Re(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Re(He(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Re(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Re(Math.log2(He(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Re(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Re(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Re(He(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Re(r.width)}px`), t.setProperty("--glass-glare-blur", `${Re(r.blur)}px`);
}
function He(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function xl(e, t, n, r, s, i) {
  const l = Math.abs(e) - n + s, u = Math.abs(t) - r + s, o = Math.max(l, 0), d = Math.max(u, 0), g = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + g - s;
}
function kl(e, t, n) {
  const r = e / 2, s = t / 2, i = He(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (p, v) => xl(p - r, v - s, r, s, l, i), g = 256, m = new Float32Array(g + 1);
  for (let p = 0; p <= g; p++) {
    const v = 1 - p / g, h = Math.asin(He(v * v, 0, 1)), w = Math.asin(He(Math.sin(h) / o, 0, 1));
    m[p] = Math.tan(h - w) * u;
  }
  return (p, v) => {
    const h = -d(p, v);
    if (h < 0 || h >= u) return null;
    const w = m[Math.round(h / u * g)];
    if (w === 0) return null;
    const c = 0.75, _ = d(p + c, v) - d(p - c, v), y = d(p, v + c) - d(p, v - c), C = Math.hypot(_, y);
    if (C === 0) return null;
    const N = -w / C;
    return { dx: _ * N, dy: y * N };
  };
}
function Sl(e, t, n) {
  const r = document.createElement("canvas");
  r.width = e, r.height = t;
  const s = r.getContext("2d"), i = s.createImageData(e, t), l = i.data, u = e * t, o = new Float32Array(u), d = new Float32Array(u);
  let g = 0;
  for (let p = 0; p < t; p++)
    for (let v = 0; v < e; v++) {
      const h = n(v + 0.5, p + 0.5);
      if (!h) continue;
      const w = p * e + v;
      o[w] = h.dx, d[w] = h.dy;
      const c = Math.hypot(h.dx, h.dy);
      c > g && (g = c);
    }
  const m = g > 0 ? 127 / g : 0;
  for (let p = 0; p < u; p++) {
    const v = p * 4;
    l[v] = 128 + He(Math.round(o[p] * m), -127, 127), l[v + 1] = 128 + He(Math.round(d[p] * m), -127, 127), l[v + 2] = 128, l[v + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: r.toDataURL(), scale: g * 2 };
}
const Er = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function Tr(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Re(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let Fn = null, El = 0;
function Tl() {
  if (Fn) return Fn;
  const e = document.createElementNS(qr, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), Fn = document.createElementNS(qr, "defs"), e.appendChild(Fn), document.body.appendChild(e), Fn;
}
function Ln(e) {
  const t = `glass-refract-${++El}`, n = document.createElementNS(qr, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), Tl().appendChild(n);
  let r = 0, s = 0, i = 0, l = 0;
  const u = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, d = "";
  function g() {
    e.style.setProperty("--glass-pre", Tt.blurEdge ? "" : d), e.style.setProperty("--glass-post", Tt.blurEdge ? d : "");
  }
  function m() {
    r < 2 || s < 2 || e.style.setProperty("--glass-glare", yl(r, s, Tt));
  }
  function p() {
    if (r < 2 || s < 2) return;
    const c = Tt, _ = Sl(r, s, kl(r, s, c)), y = c.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(r)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${r}" height="${s}" preserveAspectRatio="none" href="${_.url}" result="map"/>` + Tr(_.scale * (1 + y), Er[0], "r") + Tr(_.scale, Er[1], "g") + Tr(_.scale * (1 - y), Er[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", g()), o = u.map((C) => Tt[C]).join(" ");
  }
  function v() {
    l || (l = requestAnimationFrame(() => {
      l = 0, p();
    }));
  }
  const h = new ResizeObserver(([c]) => {
    const _ = c.borderBoxSize?.[0], y = _ ? { w: Math.round(_.inlineSize), h: Math.round(_.blockSize) } : { w: Math.round(c.contentRect.width), h: Math.round(c.contentRect.height) };
    y.w === r && y.h === s || (r = y.w, s = y.h, m(), v());
  });
  h.observe(e);
  const w = _l(() => {
    m(), u.map((c) => Tt[c]).join(" ") !== o ? v() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), h.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const cs = "photos.stack", Mr = { on: !1, window: 4 }, ds = 1, fs = 10;
function Ml() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(cs) ?? "");
  } catch {
    return { ...Mr };
  }
  if (e === null || typeof e != "object") return { ...Mr };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= ds && t <= fs ? t : Mr.window
  };
}
function Al(e) {
  return localStorage.setItem(cs, JSON.stringify({ on: e.on, window: e.window })), e;
}
const vs = "photos.theme", hs = "dark";
function ps() {
  return document.documentElement.dataset.theme === "light" ? "light" : hs;
}
function Rl() {
  const e = localStorage.getItem(vs), t = e === "dark" || e === "light" ? e : hs;
  return document.documentElement.dataset.theme = t, t;
}
function gs(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(vs, e), e;
}
var Pl = /* @__PURE__ */ P('<strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <span class="muted sep svelte-zne36e">·</span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span>', 1), Cl = /* @__PURE__ */ P('<strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span>', 1), Nl = /* @__PURE__ */ P('<span class="spin svelte-zne36e" aria-label="loading"></span>'), ma = /* @__PURE__ */ P('<span class="badge svelte-zne36e"> </span>'), Il = /* @__PURE__ */ P('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Ol = /* @__PURE__ */ P('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), Fl = /* @__PURE__ */ P("<button> </button>"), Ll = /* @__PURE__ */ P('<div class="glass sheet sorts svelte-zne36e"></div>'), zl = /* @__PURE__ */ P(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), Dl = /* @__PURE__ */ P('<p class="muted svelte-zne36e">loading…</p>'), jl = /* @__PURE__ */ P('<span class="help svelte-zne36e">?</span>'), ql = /* @__PURE__ */ P('<span class="n svelte-zne36e"> </span>'), Hl = /* @__PURE__ */ P("<button> <!></button>"), Bl = /* @__PURE__ */ P('<span class="muted svelte-zne36e">nothing here</span>'), Ul = /* @__PURE__ */ P('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), $l = /* @__PURE__ */ P('<div class="glass sheet filters svelte-zne36e"><!></div>'), Gl = /* @__PURE__ */ P('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><!> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function Yl(e, t) {
  xt(t, !0);
  let n = te(t, "facets", 3, null), r = te(t, "selected", 19, () => ({})), s = te(t, "sort", 3, "newest"), i = te(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = te(t, "total", 3, null), u = te(t, "tiles", 3, null), o = te(t, "loading", 3, !1), d = te(t, "onselect", 3, () => {
  }), g = te(t, "onsort", 3, () => {
  }), m = te(t, "onstack", 3, () => {
  }), p = te(t, "onclear", 3, () => {
  }), v = te(t, "ontriage", 3, () => {
  }), h = /* @__PURE__ */ X(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), w = /* @__PURE__ */ X(qe(ps())), c = /* @__PURE__ */ X(null);
  const _ = /* @__PURE__ */ ee(() => n()?.dimensions ?? []), y = /* @__PURE__ */ ee(() => n()?.sorts ?? []), C = /* @__PURE__ */ ee(() => a(y).find((I) => I.value === s())?.label ?? s()), N = /* @__PURE__ */ ee(() => Object.values(r()).reduce((I, G) => I + G.length, 0)), M = /* @__PURE__ */ ee(() => a(_).flatMap((I) => (r()[I.name] ?? []).map((G) => ({
    dimension: I.name,
    value: G,
    title: I.title,
    label: I.options.find((ne) => ne.value === G)?.label ?? String(G)
  }))));
  function O(I, G) {
    const ne = r()[I] ?? [], xe = ne.includes(G) ? ne.filter((pe) => pe !== G) : [...ne, G];
    d()(I, xe);
  }
  function $(I, G) {
    return (r()[I] ?? []).includes(G);
  }
  function H() {
    S(w, gs(a(w) === "dark" ? "light" : "dark"), !0);
  }
  let R = /* @__PURE__ */ X(null);
  const F = /* @__PURE__ */ ee(() => a(R) ?? i().window);
  function U(I) {
    S(R, Number(I), !0);
  }
  function D(I) {
    S(R, null), m()({ ...i(), window: Number(I) });
  }
  nn(() => {
    a(h) !== "stacks" && S(R, null);
  });
  function K(I) {
    I.key === "Escape" && S(h, "");
  }
  function le(I) {
    a(h) && !I.target.closest(".topbar") && S(h, "");
  }
  Kn(() => {
    const I = new ResizeObserver(([G]) => {
      const ne = Math.round(G.borderBoxSize?.[0]?.blockSize ?? G.contentRect.height);
      document.documentElement.style.setProperty("--header-h", ne + "px");
    });
    return I.observe(a(c)), () => {
      I.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var Z = Gl();
  Lr("keydown", Gn, K), Lr("pointerdown", Gn, le);
  var Q = f(Z), ae = f(Q);
  {
    var _e = (I) => {
      var G = Pl(), ne = Je(G), xe = f(ne), pe = b(ne, 2), oe = f(pe), we = b(pe, 4), Ue = f(we), Ie = b(we, 2), ge = f(Ie);
      j(
        (et, E) => {
          T(xe, et), T(oe, l() === 1 ? "stack" : "stacks"), T(Ue, E), T(ge, u() === 1 ? "photo" : "photos");
        },
        [() => Me(l()), () => Me(u())]
      ), A(I, G);
    }, B = (I) => {
      var G = Cl(), ne = Je(G), xe = f(ne), pe = b(ne, 2), oe = f(pe);
      j(
        (we) => {
          T(xe, we), T(oe, l() === 1 ? "photo" : "photos");
        },
        [() => l() === null ? "…" : Me(l())]
      ), A(I, G);
    };
    Y(ae, (I) => {
      u() !== null ? I(_e) : I(B, -1);
    });
  }
  var V = b(ae, 2);
  {
    var z = (I) => {
      var G = Nl();
      A(I, G);
    };
    Y(V, (I) => {
      o() && I(z);
    });
  }
  On(Q, (I) => Ln?.(I));
  var W = b(Q, 2), x = f(W), k = f(x), L = f(k);
  let re;
  var be = f(L), de = b(L, 2);
  let fe;
  var Ce = b(f(de));
  {
    var me = (I) => {
      var G = ma(), ne = f(G);
      j(() => T(ne, a(N))), A(I, G);
    };
    Y(Ce, (I) => {
      a(N) && I(me);
    });
  }
  var Te = b(de, 2);
  let Be;
  var Ge = b(f(Te));
  {
    var ut = (I) => {
      var G = ma(), ne = f(G);
      j((xe) => T(ne, xe), [() => Me(l())]), A(I, G);
    };
    Y(Ge, (I) => {
      i().on && l() !== null && I(ut);
    });
  }
  var ve = b(Te, 2);
  {
    var se = (I) => {
      var G = Ol(), ne = f(G);
      Ke(ne, 17, () => a(M), (pe) => pe.dimension + " " + pe.value, (pe, oe) => {
        var we = Il(), Ue = f(we), Ie = f(Ue), ge = b(Ue, 1, !0);
        j(() => {
          ue(we, "title", `${a(oe).title ?? ""}: ${a(oe).label ?? ""} — click to remove`), T(Ie, a(oe).title), T(ge, a(oe).label);
        }), J("click", we, () => O(a(oe).dimension, a(oe).value)), A(pe, we);
      });
      var xe = b(ne, 2);
      J("click", xe, () => p()()), A(I, G);
    };
    Y(ve, (I) => {
      a(M).length && I(se);
    });
  }
  var ke = b(k, 2), Ne = f(ke), Qe = b(ke, 2);
  On(x, (I) => Ln?.(I));
  var We = b(x, 2);
  {
    var st = (I) => {
      var G = Ll();
      Ke(G, 21, () => a(y), bt, (ne, xe) => {
        var pe = Fl();
        let oe;
        var we = f(pe);
        j(() => {
          oe = Ae(pe, 1, "option svelte-zne36e", null, oe, { on: a(xe).value === s() }), T(we, a(xe).label);
        }), J("click", pe, () => {
          g()(a(xe).value), S(h, "");
        }), A(ne, pe);
      }), On(G, (ne) => Ln?.(ne)), A(I, G);
    };
    Y(We, (I) => {
      a(h) === "sort" && I(st);
    });
  }
  var ft = b(We, 2);
  {
    var Dt = (I) => {
      var G = zl(), ne = f(G), xe = b(f(ne), 2), pe = f(xe);
      let oe;
      var we = f(pe), Ue = b(ne, 2), Ie = b(f(Ue), 2), ge = f(Ie), et = b(ge, 2), E = f(et);
      On(G, (q) => Ln?.(q)), j(() => {
        oe = Ae(pe, 1, "option svelte-zne36e", null, oe, { on: i().on }), ue(pe, "aria-checked", i().on), T(we, i().on ? "On" : "Off"), ue(ge, "min", ds), ue(ge, "max", fs), rn(ge, a(F)), ue(ge, "aria-valuetext", `${a(F) ?? ""} seconds`), T(E, `${a(F) ?? ""}s`);
      }), J("click", pe, () => m()({ ...i(), on: !i().on })), J("input", ge, (q) => U(q.currentTarget.value)), J("change", ge, (q) => D(q.currentTarget.value)), A(I, G);
    };
    Y(ft, (I) => {
      a(h) === "stacks" && I(Dt);
    });
  }
  var Vt = b(ft, 2);
  {
    var vt = (I) => {
      var G = $l(), ne = f(G);
      {
        var xe = (oe) => {
          var we = Dl();
          A(oe, we);
        }, pe = (oe) => {
          var we = Jr(), Ue = Je(we);
          Ke(Ue, 17, () => a(_), bt, (Ie, ge) => {
            var et = Ul(), E = f(et), q = f(E), ye = b(q);
            {
              var Oe = (Se) => {
                var nt = jl();
                j(() => ue(nt, "title", a(ge).hint)), A(Se, nt);
              };
              Y(ye, (Se) => {
                a(ge).hint && Se(Oe);
              });
            }
            var St = b(E, 2), Fe = f(St);
            Ke(Fe, 17, () => a(ge).options, bt, (Se, nt) => {
              var jt = Hl();
              let Ye;
              var it = f(jt), Nt = b(it);
              {
                var It = (ht) => {
                  var qt = ql(), Ee = f(qt);
                  j((Ve) => T(Ee, Ve), [() => Me(a(nt).count)]), A(ht, qt);
                };
                Y(Nt, (ht) => {
                  a(nt).count !== null && ht(It);
                });
              }
              j(
                (ht) => {
                  Ye = Ae(jt, 1, "option svelte-zne36e", null, Ye, ht), T(it, `${a(nt).label ?? ""} `);
                },
                [
                  () => ({ on: $(a(ge).name, a(nt).value) })
                ]
              ), J("click", jt, () => O(a(ge).name, a(nt).value)), A(Se, jt);
            });
            var tt = b(Fe, 2);
            {
              var Ct = (Se) => {
                var nt = Bl();
                A(Se, nt);
              };
              Y(tt, (Se) => {
                a(ge).options.length || Se(Ct);
              });
            }
            j(() => T(q, `${a(ge).title ?? ""} `)), A(Ie, et);
          }), A(oe, we);
        };
        Y(ne, (oe) => {
          n() ? oe(pe, -1) : oe(xe);
        });
      }
      On(G, (oe) => Ln?.(oe)), A(I, G);
    };
    Y(Vt, (I) => {
      a(h) === "filters" && I(vt);
    });
  }
  jr(Z, (I) => S(c, I), () => a(c)), j(() => {
    re = Ae(L, 1, "menu svelte-zne36e", null, re, { open: a(h) === "sort" }), ue(L, "aria-expanded", a(h) === "sort"), T(be, a(C)), fe = Ae(de, 1, "menu svelte-zne36e", null, fe, { open: a(h) === "filters", on: a(N) > 0 }), ue(de, "aria-expanded", a(h) === "filters"), Be = Ae(Te, 1, "menu svelte-zne36e", null, Be, { open: a(h) === "stacks", on: i().on }), ue(Te, "aria-expanded", a(h) === "stacks"), ue(ke, "title", a(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), ue(ke, "aria-label", a(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), T(Ne, a(w) === "dark" ? "☀" : "☾");
  }), J("click", L, () => S(h, a(h) === "sort" ? "" : "sort", !0)), J("click", de, () => S(h, a(h) === "filters" ? "" : "filters", !0)), J("click", Te, () => S(h, a(h) === "stacks" ? "" : "stacks", !0)), J("click", ke, H), J("click", Qe, () => v()()), A(e, Z), kt();
}
zt(["click", "input", "change"]);
var Wl = /* @__PURE__ */ P('<span class="err svelte-uzy12d"> </span>'), Vl = /* @__PURE__ */ P(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Xl = /* @__PURE__ */ P(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), Kl = /* @__PURE__ */ P('<span class="muted svelte-uzy12d"> </span>'), Jl = /* @__PURE__ */ P('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function Zl(e, t) {
  xt(t, !0);
  let n = /* @__PURE__ */ X(null), r = /* @__PURE__ */ X(!1), s = /* @__PURE__ */ X(null);
  async function i() {
    S(r, !0), S(s, null);
    try {
      S(n, await Le.probe(), !0);
    } catch (v) {
      S(s, String(v), !0);
    } finally {
      S(r, !1);
    }
  }
  var l = Jl(), u = f(l), o = f(u), d = b(u, 2);
  {
    var g = (v) => {
      var h = Wl(), w = f(h);
      j(() => T(w, a(s))), A(v, h);
    }, m = (v) => {
      var h = Jr(), w = Je(h);
      {
        var c = (y) => {
          var C = Vl(), N = b(f(C), 2);
          j(
            (M) => T(N, ` above are formats the header
        reader cannot measure (${M ?? ""}) or files with no
        extension.`),
            [() => a(n).formats.join(" ")]
          ), A(y, C);
        }, _ = (y) => {
          var C = Xl(), N = f(C), M = f(N), O = b(N, 2), $ = f(O);
          j(
            (H) => {
              T(M, H), T($, a(n).command);
            },
            [() => Me(a(n).worklist)]
          ), A(y, C);
        };
        Y(w, (y) => {
          a(n).worklist === 0 ? y(c) : y(_, -1);
        });
      }
      A(v, h);
    }, p = (v) => {
      var h = Kl(), w = f(h);
      j(() => T(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), A(v, h);
    };
    Y(d, (v) => {
      a(s) ? v(g) : a(n) ? v(m, 1) : v(p, -1);
    });
  }
  j(() => {
    u.disabled = a(r), T(o, a(r) ? "counting…" : "Check the dimension probe's worklist");
  }), J("click", u, i), A(e, l), kt();
}
zt(["click"]);
var Ql = /* @__PURE__ */ P('<p class="bad svelte-1xjbga"> </p>'), eo = /* @__PURE__ */ P('<pre class="svelte-1xjbga"> </pre>'), to = /* @__PURE__ */ P('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), no = /* @__PURE__ */ P(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), ro = /* @__PURE__ */ P('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), ao = /* @__PURE__ */ P('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), so = /* @__PURE__ */ P(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), io = /* @__PURE__ */ P('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), lo = /* @__PURE__ */ P(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function oo(e, t) {
  xt(t, !0);
  let n = /* @__PURE__ */ X(null), r = /* @__PURE__ */ X(!1), s = /* @__PURE__ */ X(null), i = /* @__PURE__ */ X(null);
  const l = /* @__PURE__ */ ee(() => a(n)?.state === "running"), u = /* @__PURE__ */ ee(() => a(n)?.snapshot ? a(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const y = await Le.rebuildStatus();
      S(n, y, !0), S(s, null), y.state === "done" && y.started_at !== a(i) && (S(i, y.started_at, !0), t.oncomplete?.());
    } catch (y) {
      S(s, String(y), !0);
    }
  }
  Kn(() => {
    o();
  }), nn(() => {
    if (!a(l)) return;
    const y = setInterval(o, 700);
    return () => clearInterval(y);
  });
  async function d() {
    S(r, !0), S(s, null);
    try {
      S(n, await Le.rebuild(), !0);
    } catch (y) {
      S(s, String(y), !0);
    }
  }
  function g(y) {
    y.key === "Escape" && S(r, !1);
  }
  var m = lo();
  Lr("keydown", Gn, g);
  var p = Je(m), v = f(p), h = f(v), w = b(v, 2), c = b(p, 2);
  {
    var _ = (y) => {
      var C = io(), N = Je(C), M = b(N, 2), O = f(M), $ = b(f(O), 4), H = f($), R = b($, 2), F = b(O, 2);
      {
        var U = (B) => {
          var V = Ql(), z = f(V);
          j(() => T(z, a(s))), A(B, V);
        };
        Y(F, (B) => {
          a(s) && B(U);
        });
      }
      var D = b(F, 2);
      Ke(D, 17, () => a(n)?.steps ?? [], bt, (B, V) => {
        var z = to();
        let W;
        var x = f(z), k = f(x), L = f(k);
        {
          var re = (ve) => {
            var se = wn("✓");
            A(ve, se);
          }, be = (ve) => {
            var se = wn("✕");
            A(ve, se);
          }, de = (ve) => {
            var se = wn("·");
            A(ve, se);
          }, fe = (ve) => {
            var se = wn(" ");
            A(ve, se);
          };
          Y(L, (ve) => {
            a(V).state === "done" ? ve(re) : a(V).state === "failed" ? ve(be, 1) : a(V).state === "running" ? ve(de, 2) : ve(fe, -1);
          });
        }
        var Ce = b(k, 2), me = f(Ce), Te = b(Ce, 4), Be = f(Te), Ge = b(x, 2);
        {
          var ut = (ve) => {
            var se = eo(), ke = f(se);
            j((Ne) => T(ke, Ne), [() => a(V).log.join(`
`)]), A(ve, se);
          };
          Y(Ge, (ve) => {
            a(V).log.length && ve(ut);
          });
        }
        j(() => {
          W = Ae(z, 1, "step svelte-1xjbga", null, W, {
            on: a(V).state === "running",
            bad: a(V).state === "failed"
          }), T(me, a(V).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), T(Be, a(V).seconds === null ? "" : a(V).seconds + "s");
        }), A(B, z);
      });
      var K = b(D, 2);
      {
        var le = (B) => {
          var V = no(), z = Je(V), W = f(z);
          j(() => T(W, a(n).error)), A(B, V);
        }, Z = (B) => {
          var V = ro();
          A(B, V);
        }, Q = (B) => {
          var V = ao();
          A(B, V);
        };
        Y(K, (B) => {
          a(n)?.state === "failed" ? B(le) : a(n)?.state === "done" ? B(Z, 1) : a(l) && B(Q, 2);
        });
      }
      var ae = b(K, 2);
      {
        var _e = (B) => {
          var V = so(), z = b(f(V), 6), W = f(z);
          j(() => T(W, `python -m photolib.restore_state ${a(u) ?? ""}`)), A(B, V);
        };
        Y(ae, (B) => {
          a(u) && B(_e);
        });
      }
      j(() => T(H, `${a(n)?.seconds ?? 0 ?? ""}s`)), J("click", N, () => S(r, !1)), J("click", R, () => S(r, !1)), A(y, C);
    };
    Y(c, (y) => {
      a(r) && y(_);
    });
  }
  j(() => {
    v.disabled = a(l), T(h, a(l) ? "applying…" : "Apply to grid"), w.disabled = !a(n) || a(n).state === "idle";
  }), J("click", v, d), J("click", w, () => S(r, !0)), A(e, m), kt();
}
zt(["click"]);
var uo = /* @__PURE__ */ P('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), wa = /* @__PURE__ */ P("<option> </option>"), co = /* @__PURE__ */ P('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), fo = /* @__PURE__ */ P('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), vo = /* @__PURE__ */ P('<div class="none muted svelte-bqi9ky"> </div>'), ho = /* @__PURE__ */ P('<div class="bar svelte-bqi9ky"><!></div>');
function po(e, t) {
  xt(t, !0);
  let n = te(t, "candidate", 3, null), r = te(t, "saving", 3, !1);
  const s = [
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), u = /* @__PURE__ */ ee(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ ee(() => !!n() && n().op !== "is null");
  function d(w, c) {
    const _ = { ...n(), [w]: c };
    if (w === "column") {
      const y = i[c] ?? ["="];
      y.includes(_.op) || (_.op = y[0]), _.value = l.has(c) ? 0 : "";
    }
    w === "op" && c === "is null" && (_.value = null), w === "value" && l.has(_.column) && (_.value = Number(c) || 0), t.onedit(_);
  }
  var g = ho(), m = f(g);
  {
    var p = (w) => {
      var c = uo(), _ = f(c), y = f(_), C = b(_, 2), N = f(C);
      j(() => {
        T(y, `${t.screen.title ?? ""} does not save a rule.`), T(N, t.screen.blurb);
      }), A(w, c);
    }, v = (w) => {
      var c = fo(), _ = Je(c), y = f(_);
      Ke(y, 21, () => s, bt, (z, W) => {
        var x = wa(), k = f(x), L = {};
        j(() => {
          T(k, a(W)), L !== (L = a(W)) && (x.value = (x.__value = a(W)) ?? "");
        }), A(z, x);
      });
      var C;
      Qn(y);
      var N = b(y, 2);
      Ke(N, 21, () => a(u), bt, (z, W) => {
        var x = wa(), k = f(x), L = {};
        j(() => {
          T(k, a(W)), L !== (L = a(W)) && (x.value = (x.__value = a(W)) ?? "");
        }), A(z, x);
      });
      var M;
      Qn(N);
      var O = b(N, 2);
      {
        var $ = (z) => {
          var W = co();
          j(() => rn(W, n().value ?? "")), J("input", W, (x) => d("value", x.currentTarget.value)), A(z, W);
        };
        Y(O, (z) => {
          a(o) && z($);
        });
      }
      var H = b(O, 2), R = f(H);
      R.value = R.__value = "exclude";
      var F = b(R);
      F.value = F.__value = "include";
      var U;
      Qn(H);
      var D = b(H, 2), K = f(D);
      K.value = K.__value = "end";
      var le = b(K);
      le.value = le.__value = "0";
      var Z;
      Qn(D);
      var Q = b(D, 2), ae = f(Q), _e = b(Q, 2), B = b(_, 2), V = f(B);
      j(
        (z, W) => {
          C !== (C = n().column) && (y.value = (y.__value = n().column) ?? "", Hn(y, n().column)), M !== (M = n().op) && (N.value = (N.__value = n().op) ?? "", Hn(N, n().op)), U !== (U = n().decision ?? "exclude") && (H.value = (H.__value = n().decision ?? "exclude") ?? "", Hn(H, n().decision ?? "exclude")), Z !== (Z = z) && (D.value = (D.__value = z) ?? "", Hn(D, z)), Q.disabled = r(), T(ae, r() ? "saving…" : "Confirm"), T(V, `${W ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => sl(n())
        ]
      ), J("change", y, (z) => d("column", z.currentTarget.value)), J("change", N, (z) => d("op", z.currentTarget.value)), J("change", H, (z) => d("decision", z.currentTarget.value)), J("change", D, (z) => d("at", z.currentTarget.value)), J("click", Q, function(...z) {
        t.onconfirm?.apply(this, z);
      }), J("click", _e, function(...z) {
        t.onclear?.apply(this, z);
      }), A(w, c);
    }, h = (w) => {
      var c = vo(), _ = f(c);
      j(() => T(_, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), A(w, c);
    };
    Y(m, (w) => {
      t.screen.rule === !1 ? w(p) : n() ? w(v, 1) : w(h, -1);
    });
  }
  A(e, g), kt();
}
zt(["change", "input", "click"]);
var go = /* @__PURE__ */ P('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), _o = /* @__PURE__ */ P('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), bo = /* @__PURE__ */ P('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), mo = /* @__PURE__ */ P('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function wo(e, t) {
  xt(t, !0);
  let n = te(t, "rules", 19, () => []), r = te(t, "unmatched", 3, null), s = te(t, "busy", 3, !1);
  var i = mo(), l = f(i), u = b(f(l)), o = f(u), d = b(l, 2);
  {
    var g = (h) => {
      var w = go();
      A(h, w);
    };
    Y(d, (h) => {
      n().length === 0 && h(g);
    });
  }
  var m = b(d, 2);
  Ke(m, 19, n, (h) => h.id, (h, w, c) => {
    var _ = _o();
    let y;
    var C = f(_), N = f(C), M = f(N), O = b(N, 2), $ = f(O), H = b(O, 2), R = f(H), F = b(C, 2), U = f(F), D = f(U), K = b(U, 2), le = f(K), Z = b(K, 4), Q = b(Z, 2), ae = b(Q, 2);
    j(
      (_e, B) => {
        y = Ae(_, 1, "rule svelte-aof9c2", null, y, { exclude: a(w).decision === "exclude" }), T(M, a(c)), T($, a(w).predicate), T(R, a(w).decision), T(D, `${_e ?? ""} paths`), T(le, B), Z.disabled = s() || a(c) === 0, Q.disabled = s() || a(c) === n().length - 1, ae.disabled = s();
      },
      [
        () => Me(a(w).paths),
        () => Et(a(w).bytes)
      ]
    ), J("click", Z, () => t.onmove(a(w), a(c) - 1)), J("click", Q, () => t.onmove(a(w), a(c) + 1)), J("click", ae, () => t.ondelete(a(w))), A(h, _);
  });
  var p = b(m, 2);
  {
    var v = (h) => {
      var w = bo(), c = b(f(w), 2), _ = f(c), y = f(_), C = b(_, 2), N = f(C);
      j(
        (M, O) => {
          T(y, `${M ?? ""} paths`), T(N, O);
        },
        [
          () => Me(r().paths),
          () => Et(r().bytes)
        ]
      ), A(h, w);
    };
    Y(p, (h) => {
      r() && h(v);
    });
  }
  j(() => T(o, `${n().length ?? ""} rules · top-down, first match wins`)), A(e, i), kt();
}
zt(["click"]);
const rr = 4, fr = 220, yo = 340;
function _s(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function xo(e, t, n, r, s) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, u = 0, o = 1 / 0;
    for (; l < e.length && (u += _s(e[l]), l++, o = (n - rr * (l - i - 1)) / u, !(o <= fr)); )
      ;
    if (o > fr && !r) break;
    s(i, l, Math.round(Math.min(o, yo))), i = l;
  }
  return i;
}
function ya(e, t, n) {
  if (!e.length) return null;
  let r = 0, s = e.length - 1;
  for (; r < s; ) {
    const l = r + s >> 1;
    e[l].top + e[l].height < t ? r = l + 1 : s = l;
  }
  const i = r;
  for (s = e.length - 1; r < s; ) {
    const l = r + s + 1 >> 1;
    e[l].top <= n ? r = l : s = l - 1;
  }
  return [i, Math.max(i, r)];
}
const xa = 2500, ko = 1, So = 2, Eo = 3e7;
function To(e, t, n) {
  const r = [], s = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, d = 0, g = null, m = null, p = null, v = !1, h = !1, w = 0, c = 0, _ = 0, y = n.onState || (() => {
  });
  function C(x) {
    w <= 0 || (o = xo(r, o, w, x, (k, L, re) => {
      s.push({ top: d, height: re, from: k, to: L }), d += re + rr;
    }), M());
  }
  function N() {
    if (m === null || v || w <= 0 || o >= m) return 0;
    const x = s.length ? o / s.length : Math.max(1, w / fr), k = s.length ? d / s.length : fr + rr, L = Math.round((m - o) / x * k);
    return Math.max(0, Math.min(L, Eo - d));
  }
  function M() {
    e.style.height = d + N() + "px", t.style.top = Math.max(0, d - 1) + "px";
  }
  function O() {
    return window.scrollY - e.offsetTop;
  }
  function $() {
    const x = l.pop();
    if (x) return x;
    const k = document.createElement("div");
    k.className = "tile";
    const L = document.createElement("img");
    return L.decoding = "async", L.addEventListener("load", () => k.classList.add("loaded")), L.addEventListener("error", () => k.classList.add("missing")), k.appendChild(L), n.extend && n.extend(k), k;
  }
  function H(x, k) {
    k.firstChild.removeAttribute("src"), k.classList.remove("loaded", "missing", "error"), k.style.backgroundImage = "", k.remove(), i.delete(x), l.push(k);
  }
  function R(x, k, L, re, be, de) {
    let fe = i.get(x);
    const Ce = r[x];
    if (!fe) {
      fe = $(), fe.dataset.index = String(x);
      const me = fe.firstChild;
      me.fetchPriority = de ? "high" : "low", me.src = "/t/" + Ce.s + ".webp", u.push(x), n.fill && n.fill(fe, Ce), e.appendChild(fe), i.set(x, fe);
    }
    fe.style.width = re + "px", fe.style.height = be + "px", fe.style.transform = "translate(" + k + "px," + L + "px)";
  }
  function F(x, k) {
    k.th && (k.url === void 0 && (k.url = n.thumbHash(k.th)), k.url && (x.style.backgroundImage = "url(" + k.url + ")"));
  }
  function U() {
    _ = 0;
    for (const x of u) {
      const k = i.get(x);
      k && !k.classList.contains("loaded") && F(k, r[x]);
    }
    u.length = 0;
  }
  function D(x, k) {
    let L = 0;
    for (let re = x.from; re < x.to; re++) {
      const de = re === x.to - 1 ? w - L : Math.round(_s(r[re]) * x.height);
      R(re, L, x.top, de, x.height, k), L += de + rr;
    }
  }
  function K() {
    const x = window.innerHeight, k = O(), L = ya(s, k - x * ko, k + x * (1 + So));
    if (!L) return;
    const re = s[L[0]].from, be = s[L[1]].to;
    for (const [de, fe] of Array.from(i))
      (de < re || de >= be) && H(de, fe);
    for (let de = L[0]; de <= L[1]; de++) {
      const fe = s[de];
      D(fe, fe.top < k + x && fe.top + fe.height > k);
    }
    u.length && !_ && (_ = requestAnimationFrame(U));
  }
  function le() {
    return w <= 0 ? !1 : d - (O() + window.innerHeight) < xa;
  }
  async function Z() {
    if (h || v) return;
    h = !0;
    const x = c;
    y({ loading: !0, count: r.length, exhausted: v, total: m, tiles: p });
    try {
      do {
        const k = await n.fetchPage(g);
        if (x !== c) return;
        for (const L of k.photos) r.push(L);
        g = k.next, v = g === null, typeof k.stacks == "number" ? (m = k.stacks, p = typeof k.total == "number" ? k.total : null) : typeof k.total == "number" && (m = k.total), C(v), K(), y({ loading: !0, count: r.length, exhausted: v, total: m, tiles: p });
      } while (!v && le());
    } catch (k) {
      x === c && y({ error: String(k) });
    } finally {
      x === c && (h = !1, y({ loading: !1, count: r.length, exhausted: v, total: m, tiles: p }));
    }
  }
  let Q = 0;
  function ae() {
    Q || (Q = requestAnimationFrame(() => {
      Q = 0, K(), le() && Z();
    }));
  }
  function _e() {
    const x = e.clientWidth;
    if (x === w) return;
    const k = ya(s, O(), O()), L = k ? s[k[0]].from : 0;
    w = x;
    for (const [be, de] of Array.from(i)) H(be, de);
    s.length = 0, o = 0, d = 0, C(v), K();
    const re = s.find((be) => be.to > L);
    re && window.scrollTo(0, re.top + e.offsetTop), le() && Z();
  }
  function B(x) {
    const k = x.target.closest(".tile");
    if (!k || !e.contains(k)) return;
    const L = r[Number(k.dataset.index)];
    L && n.activate && n.activate(L, x, k);
  }
  e.addEventListener("click", B), window.addEventListener("scroll", ae, { passive: !0 });
  let V = 0;
  const z = new ResizeObserver(() => {
    clearTimeout(V), V = setTimeout(_e, 100);
  });
  z.observe(e);
  const W = new IntersectionObserver(
    (x) => {
      x.some((k) => k.isIntersecting) && Z();
    },
    { rootMargin: "0px 0px " + xa + "px 0px" }
  );
  return W.observe(t), w = e.clientWidth, Z(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      c++, h = !1;
      for (const [x, k] of Array.from(i)) H(x, k);
      r.length = 0, s.length = 0, u.length = 0, o = 0, d = 0, g = null, m = null, p = null, v = !1, e.style.height = "0px", window.scrollTo(0, 0), Z();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(x) {
      const k = typeof x == "number" ? x : null;
      k !== m && (m = k, M(), y({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [x, k] of i) n.fill(k, r[x]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(x) {
      for (const [k, L] of i)
        r[k] === x && n.fill && n.fill(L, x);
    },
    destroy() {
      c++, e.removeEventListener("click", B), window.removeEventListener("scroll", ae), z.disconnect(), W.disconnect(), clearTimeout(V), cancelAnimationFrame(_);
    }
  };
}
function Mo(e) {
  try {
    const t = Uint8Array.from(atob(e), (D) => D.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, d = (r >> 3 & 63) / 63, g = (r >> 9 & 63) / 63, m = r >> 15, p = Math.max(3, m ? o ? 5 : 7 : r & 7), v = Math.max(3, m ? r & 7 : o ? 5 : 7);
    let h = o ? 6 : 5, w = 0;
    const c = (D, K, le) => {
      const Z = [];
      for (let Q = 0; Q < K; Q++)
        for (let ae = Q ? 0 : 1; ae * K < D * (K - Q); ae++) {
          const _e = t[h + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          Z.push((_e / 7.5 - 1) * le);
        }
      return Z;
    }, _ = c(p, v, u), y = c(3, 3, d * 1.25), C = c(3, 3, g * 1.25), N = p / v, M = Math.max(1, Math.round(N > 1 ? 32 : 32 * N)), O = Math.max(1, Math.round(N > 1 ? 32 / N : 32)), $ = document.createElement("canvas");
    $.width = M, $.height = O;
    const H = $.getContext("2d"), R = H.createImageData(M, O), F = [], U = [];
    for (let D = 0, K = 0; D < O; D++)
      for (let le = 0; le < M; le++, K += 4) {
        let Z = s, Q = i, ae = l;
        for (let z = 0; z < p; z++) F[z] = Math.cos(Math.PI / M * (le + 0.5) * z);
        for (let z = 0; z < v; z++) U[z] = Math.cos(Math.PI / O * (D + 0.5) * z);
        for (let z = 0, W = 0; z < v; z++)
          for (let x = z ? 0 : 1; x * v < p * (v - z); x++, W++)
            Z += _[W] * F[x] * U[z] * 2;
        for (let z = 0, W = 0; z < 3; z++)
          for (let x = z ? 0 : 1; x < 3 - z; x++, W++) {
            const k = F[x] * U[z] * 2;
            Q += y[W] * k, ae += C[W] * k;
          }
        const _e = Z - 2 / 3 * Q, B = (3 * Z - _e + ae) / 2, V = B - ae;
        R.data[K] = Math.max(0, Math.min(255, Math.round(255 * B))), R.data[K + 1] = Math.max(0, Math.min(255, Math.round(255 * V))), R.data[K + 2] = Math.max(0, Math.min(255, Math.round(255 * _e))), R.data[K + 3] = 255;
      }
    return H.putImageData(R, 0, 0), $.toDataURL();
  } catch {
    return null;
  }
}
var Ao = /* @__PURE__ */ P('<main id="canvas"><div id="sentinel"></div></main>');
function Ro(e, t) {
  xt(t, !0);
  let n = te(t, "key", 3, ""), r = te(t, "total", 3, null), s = te(t, "triage", 3, !1), i = te(t, "excludedDirs", 19, () => []), l = te(t, "onActivate", 3, () => {
  }), u = te(t, "onOverride", 3, async () => null), o = te(t, "onExcludeFolder", 3, () => {
  }), d = te(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ X(null), m = /* @__PURE__ */ X(null), p = null, v = "";
  const h = { null: "exclude", exclude: "include", include: "clear" };
  function w(M) {
    const O = M.toLowerCase().startsWith(An.toLowerCase()) ? M.slice(An.length + 1) : M;
    return O.length > 64 ? "…" + O.slice(-64) : O;
  }
  function c(M) {
    const O = document.createElement("div");
    O.className = "tile-path", M.appendChild(O);
    const $ = document.createElement("button");
    $.className = "chip", $.type = "button", M.appendChild($);
    const H = document.createElement("button");
    H.className = "dirchip", H.type = "button", H.textContent = "dir", M.appendChild(H);
  }
  function _(M, O) {
    const $ = M.querySelector(".tile-path");
    $ && ($.textContent = O.p ? w(O.p) : "");
    const H = M.querySelector(".dirchip");
    if (H) {
      const F = os(O.p ?? ""), U = F !== "" && Qr(i(), F);
      H.hidden = F === "", H.disabled = U, H.dataset.state = U ? "exclude" : "none", H.title = U ? `already excluded: ${F}` : `exclude everything under ${F}, subfolders included — one exclude rule at the end of the order`;
    }
    const R = M.querySelector(".chip");
    R && (R.dataset.state = O.o || "none", R.textContent = O.o === "exclude" ? "drop" : O.o === "include" ? "keep" : "·", R.title = O.o === "exclude" ? "overridden: excluded — click to keep" : O.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Kn(() => (p = To(a(g), a(m), {
    fetchPage: (M) => t.fetchPage(M),
    thumbHash: Mo,
    extend: s() ? c : void 0,
    fill: s() ? _ : void 0,
    onState: (M) => d()(M),
    activate: async (M, O, $) => {
      if (O.target.closest(".dirchip")) {
        o()(M);
        return;
      }
      if (!O.target.closest(".chip")) {
        l()(M);
        return;
      }
      const H = h[M.o ?? "null"];
      M.o = await u()(M, H), _($, M);
    }
  }), v = n(), () => p?.destroy())), nn(() => {
    const M = n(), O = r();
    p && (M !== v && (v = M, p.reset()), p.setTotal(O));
  });
  let y = "";
  nn(() => {
    const M = i().join(`
`);
    !p || M === y || (y = M, p.refill());
  });
  var C = Ao(), N = f(C);
  jr(N, (M) => S(m, M), () => a(m)), jr(C, (M) => S(g, M), () => a(g)), A(e, C), kt();
}
var Po = /* @__PURE__ */ P('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Co = /* @__PURE__ */ P('<th class="num svelte-1v3p82v"> </th>'), No = /* @__PURE__ */ P('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Io = /* @__PURE__ */ P('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Oo = /* @__PURE__ */ P('<td class="num svelte-1v3p82v"> </td>'), Fo = /* @__PURE__ */ P('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), Lo = /* @__PURE__ */ P('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function zo(e, t) {
  xt(t, !0);
  let n = te(t, "rows", 19, () => []), r = te(t, "rules", 19, () => []), s = te(t, "root", 3, null), i = te(t, "selected", 3, null), l = te(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ ee(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const d = /* @__PURE__ */ ee(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : us(r(), t.screen.toRule(w, s()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var p = Jr(), v = Je(p);
  {
    var h = (w) => {
      var c = Lo(), _ = f(c), y = f(_), C = f(y);
      {
        var N = (F) => {
          var U = Po();
          A(F, U);
        };
        Y(C, (F) => {
          a(u) && F(N);
        });
      }
      var M = b(C), O = f(M), $ = b(M, 3);
      {
        var H = (F) => {
          var U = Co(), D = f(U);
          j(() => T(D, t.screen.heading[1])), A(F, U);
        };
        Y($, (F) => {
          t.screen.heading[1] && F(H);
        });
      }
      var R = b(_);
      Ke(R, 23, n, (F) => F.key, (F, U, D) => {
        const K = /* @__PURE__ */ ee(() => a(d).get(a(U).key));
        var le = Fo();
        let Z;
        var Q = f(le);
        {
          var ae = (me) => {
            const Te = /* @__PURE__ */ ee(() => l().has(a(U).key));
            var Be = No(), Ge = f(Be);
            let ut;
            var ve = f(Ge);
            j(
              (se) => {
                ut = Ae(Ge, 1, "tick svelte-1v3p82v", null, ut, { on: a(Te) }), ue(Ge, "aria-checked", a(Te)), ue(Ge, "aria-label", `select ${se ?? ""}`), T(ve, a(Te) ? "✓" : "");
              },
              [() => o(a(U))]
            ), J("click", Ge, (se) => {
              se.stopPropagation(), t.oncheck(a(U), a(D), se.shiftKey);
            }), A(me, Be);
          };
          Y(Q, (me) => {
            a(u) && me(ae);
          });
        }
        var _e = b(Q), B = f(_e);
        let V;
        var z = f(B), W = b(B), x = b(W);
        {
          var k = (me) => {
            var Te = Io();
            A(me, Te);
          };
          Y(x, (me) => {
            a(U).scope === "whole inventory" && me(k);
          });
        }
        var L = b(_e), re = f(L), be = b(L), de = f(be), fe = b(be);
        {
          var Ce = (me) => {
            var Te = Oo(), Be = f(Te);
            j(() => T(Be, a(U).detail ?? "")), A(me, Te);
          };
          Y(fe, (me) => {
            t.screen.heading[1] && me(Ce);
          });
        }
        j(
          (me, Te, Be) => {
            Z = Ae(le, 1, "svelte-1v3p82v", null, Z, {
              picked: i() === a(U).key,
              clickable: t.screen.sheet !== !1
            }), V = Ae(B, 1, "mark svelte-1v3p82v", null, V, {
              exclude: a(K) === "exclude",
              include: a(K) === "include"
            }), ue(B, "title", m[a(K)] ?? ""), T(z, g[a(K)] ?? ""), T(W, `${me ?? ""} `), T(re, Te), T(de, Be);
          },
          [
            () => o(a(U)),
            () => Me(a(U).paths),
            () => Et(a(U).bytes)
          ]
        ), J("click", le, () => t.onpick(a(U))), A(F, le);
      }), j(() => T(O, t.screen.heading[0] ?? "")), A(w, c);
    };
    Y(v, (w) => {
      n().length && w(h);
    });
  }
  A(e, p), kt();
}
zt(["click"]);
var Do = /* @__PURE__ */ P('<button class="twisty svelte-pucy57"> </button>'), jo = /* @__PURE__ */ P('<span class="twisty leaf svelte-pucy57">·</span>'), qo = /* @__PURE__ */ P('<span class="name root svelte-pucy57"> </span>'), Ho = /* @__PURE__ */ P('<button class="name svelte-pucy57"> </button>'), Bo = /* @__PURE__ */ P('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Uo = /* @__PURE__ */ P('<div class="note svelte-pucy57"> </div>'), $o = /* @__PURE__ */ P('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Go = /* @__PURE__ */ P('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Yo = /* @__PURE__ */ P('<div class="tree svelte-pucy57"></div>');
function Wo(e, t) {
  xt(t, !0);
  let n = te(t, "version", 3, 0), r = te(t, "excludedDirs", 19, () => []), s = te(t, "selected", 3, null), i = te(t, "busy", 3, !1), l = /* @__PURE__ */ X(qe(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ X(qe(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ X(qe(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ X(qe(/* @__PURE__ */ new Set()));
  async function g(c) {
    S(o, new Set(a(o)).add(c), !0);
    const _ = await t.onload(c), y = new Map(a(l)), C = new Set(a(d));
    _ ? (y.set(c, _), C.delete(c)) : C.add(c), S(l, y, !0), S(d, C, !0), S(o, new Set([...a(o)].filter((N) => N !== c)), !0);
  }
  function m(c) {
    if (a(u).has(c)) {
      S(u, new Set([...a(u)].filter((_) => _ !== c)), !0);
      return;
    }
    S(u, new Set(a(u)).add(c), !0), a(l).has(c) || g(c);
  }
  let p = -1;
  nn(() => {
    const c = n();
    if (c !== p) {
      p = c, a(u).has(t.root) || S(u, new Set(a(u)).add(t.root), !0);
      for (const _ of a(u)) g(_);
    }
  });
  const v = /* @__PURE__ */ ee(() => {
    const c = [], _ = (M, O, $, H, R, F) => {
      const U = a(l).get(M), D = a(u).has(M);
      if (c.push({
        key: M,
        name: O,
        depth: $,
        paths: H,
        bytes: R,
        deeper: F,
        expanded: D,
        here: U?.here ?? null,
        truncated: !!U?.truncated,
        loading: a(o).has(M),
        failed: a(d).has(M),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: Qr(r(), M)
      }), !(!D || !U))
        for (const K of U.children)
          _(K.path, K.name, $ + 1, K.paths, K.bytes, K.deeper);
    }, y = a(l).get(t.root), C = y ? y.children.reduce((M, O) => M + O.paths, 0) + y.here.paths : 0, N = y ? y.children.reduce((M, O) => M + O.bytes, 0) + y.here.bytes : 0;
    return _(t.root, t.root, 0, C, N, !0), c;
  }), h = 8;
  var w = Yo();
  Ke(w, 21, () => a(v), (c) => c.key, (c, _) => {
    var y = Go(), C = Je(y);
    let N;
    var M = f(C);
    let O;
    var $ = b(M, 2);
    {
      var H = (x) => {
        var k = Do(), L = f(k);
        j(() => {
          ue(k, "aria-expanded", a(_).expanded), ue(k, "aria-label", `${a(_).expanded ? "collapse" : "expand"} ${a(_).name ?? ""}`), ue(k, "title", a(_).expanded ? "collapse" : "expand"), T(L, a(_).loading ? "·" : a(_).expanded ? "▾" : "▸");
        }), J("click", k, () => m(a(_).key)), A(x, k);
      }, R = (x) => {
        var k = jo();
        A(x, k);
      };
      Y($, (x) => {
        a(_).deeper ? x(H) : x(R, -1);
      });
    }
    var F = b($, 2);
    {
      var U = (x) => {
        var k = qo(), L = f(k);
        j(() => T(L, a(_).key)), A(x, k);
      }, D = (x) => {
        var k = Ho(), L = f(k);
        j(() => {
          ue(k, "title", `Show every kept file under ${a(_).key ?? ""}`), T(L, a(_).name);
        }), J("click", k, () => t.onpick(a(_))), A(x, k);
      };
      Y(F, (x) => {
        a(_).depth === 0 ? x(U) : x(D, -1);
      });
    }
    var K = b(F, 2), le = f(K), Z = b(K, 2), Q = f(Z), ae = b(Z, 2), _e = b(C, 2);
    {
      var B = (x) => {
        var k = Bo();
        let L;
        j((re) => L = qn(k, "", L, re), [
          () => ({
            "padding-left": `${Math.min(a(_).depth, h) * 11 + 18}px`
          })
        ]), A(x, k);
      }, V = (x) => {
        var k = Uo();
        let L;
        var re = f(k);
        j(
          (be, de, fe) => {
            L = qn(k, "", L, be), T(re, `${de ?? ""} directly here · ${fe ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(a(_).depth, h) * 11 + 18}px`
            }),
            () => Me(a(_).here.paths),
            () => Et(a(_).here.bytes)
          ]
        ), A(x, k);
      };
      Y(_e, (x) => {
        a(_).expanded && a(_).failed ? x(B) : a(_).expanded && a(_).here && a(_).here.paths > 0 && x(V, 1);
      });
    }
    var z = b(_e, 2);
    {
      var W = (x) => {
        var k = $o();
        let L;
        j((re) => L = qn(k, "", L, re), [
          () => ({
            "padding-left": `${Math.min(a(_).depth, h) * 11 + 18}px`
          })
        ]), A(x, k);
      };
      Y(z, (x) => {
        a(_).truncated && x(W);
      });
    }
    j(
      (x, k, L) => {
        N = Ae(C, 1, "row svelte-pucy57", null, N, {
          picked: s() === a(_).key,
          gone: a(_).excluded
        }), O = qn(M, "", O, x), T(le, k), T(Q, L), ae.disabled = i() || a(_).excluded || a(_).depth === 0, ue(ae, "title", a(_).depth === 0 ? "The library root is not excludable from here." : a(_).excluded ? "already excluded" : `Exclude everything under ${a(_).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(a(_).depth, h) * 11}px` }),
        () => Me(a(_).paths),
        () => Et(a(_).bytes)
      ]
    ), J("click", ae, () => t.onexclude(a(_))), A(c, y);
  }), A(e, w), kt();
}
zt(["click"]);
var Vo = /* @__PURE__ */ P('<button title="Back to its default">↺</button>'), Xo = /* @__PURE__ */ P('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), Ko = /* @__PURE__ */ P('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), Jo = /* @__PURE__ */ P('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), Zo = /* @__PURE__ */ P('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), Qo = /* @__PURE__ */ P('<li><code class="svelte-1hh0fwb"> </code> </li>'), eu = /* @__PURE__ */ P(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), tu = /* @__PURE__ */ P('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function nu(e, t) {
  xt(t, !0);
  const n = "photos.glass", r = [
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
        ["headerSide", "Sides", 0, (D) => Math.floor(D / 2), 1],
        ["pageTop", "Page top", 0, 300, 1]
      ]
    }
  ], s = {
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
  let u = /* @__PURE__ */ X(qe(gl())), o = /* @__PURE__ */ X(!0), d = /* @__PURE__ */ X(!1), g = /* @__PURE__ */ X(qe(ps())), m = /* @__PURE__ */ X(qe(window.innerWidth));
  const p = (D) => a(g) === "light" ? D.light : D.dark, v = (D) => D in an ? an : Qt, h = (D) => `rgba(${D.r}, ${D.g}, ${D.b}, ${D.a})`, w = /* @__PURE__ */ ee(() => JSON.stringify(a(u), null, 2));
  Kn(() => {
    const D = localStorage.getItem(n);
    if (D)
      try {
        S(u, Sr(JSON.parse(D)), !0);
        return;
      } catch {
      }
    ea();
  });
  function c(D) {
    S(u, Sr({ ...a(u), ...D }), !0), localStorage.setItem(n, JSON.stringify(a(u))), S(d, !1);
  }
  function _(D) {
    S(u, Sr(D), !0), localStorage.setItem(n, JSON.stringify(a(u))), S(d, !1);
  }
  function y(D) {
    c({ [D]: v(D)[D] });
  }
  function C() {
    S(g, gs(a(g) === "dark" ? "light" : "dark"), !0);
  }
  async function N() {
    await navigator.clipboard.writeText(a(w)), S(d, !0);
  }
  var M = tu();
  let O;
  var $ = f(M), H = b(f($), 4), R = f(H), F = b($, 2);
  {
    var U = (D) => {
      var K = eu();
      {
        const Ge = (ve, se = er, ke = er, Ne = er) => {
          var Qe = Vo();
          let We;
          j(() => {
            We = Ae(Qe, 1, "undo svelte-1hh0fwb", null, We, { idle: !ke() }), ue(Qe, "aria-label", `Reset ${se() ?? ""}`);
          }), J("click", Qe, function(...st) {
            Ne()?.apply(this, st);
          }), A(ve, Qe);
        };
        var le = b(f(K), 2);
        Ke(le, 17, () => r, bt, (ve, se) => {
          var ke = Ko(), Ne = f(ke), Qe = f(Ne), We = b(Ne, 2), st = f(We), ft = b(We, 2);
          Ke(ft, 17, () => a(se).rows, bt, (Dt, Vt) => {
            var vt = /* @__PURE__ */ ee(() => mr(a(Vt), 5));
            let I = () => a(vt)[0], G = () => a(vt)[1], ne = () => a(vt)[2], xe = () => a(vt)[3], pe = () => a(vt)[4];
            const oe = /* @__PURE__ */ ee(() => a(u)[I()] !== v(I())[I()]), we = /* @__PURE__ */ ee(() => typeof xe() == "function" ? xe()(a(m)) : xe());
            var Ue = Xo();
            let Ie;
            var ge = f(Ue), et = f(ge), E = b(ge, 2), q = b(E, 2), ye = b(q, 2);
            Ge(ye, G, () => a(oe), () => () => y(I())), j(() => {
              Ie = Ae(Ue, 1, "row svelte-1hh0fwb", null, Ie, { moved: a(oe) }), T(et, G()), ue(E, "min", ne()), ue(E, "max", a(we)), ue(E, "step", pe()), ue(E, "aria-label", G()), rn(E, a(u)[I()]), ue(q, "min", ne()), ue(q, "max", a(we)), ue(q, "step", pe()), ue(q, "aria-label", `${G() ?? ""} value`), rn(q, a(u)[I()]);
            }), J("input", E, (Oe) => c({ [I()]: Number(Oe.currentTarget.value) })), J("input", q, (Oe) => c({ [I()]: Number(Oe.currentTarget.value) })), A(Dt, Ue);
          }), j(() => {
            T(Qe, a(se).title), T(st, a(se).note);
          }), A(ve, ke);
        });
        var Z = b(le, 2), Q = f(Z), ae = b(Z, 2), _e = f(ae), B = b(ae, 2);
        Ke(B, 17, () => pl, bt, (ve, se) => {
          const ke = /* @__PURE__ */ ee(() => p(a(se))), Ne = /* @__PURE__ */ ee(() => a(u)[a(ke)]), Qe = /* @__PURE__ */ ee(() => a(se).base[a(ke)]);
          var We = Zo(), st = f(We), ft = f(st), Dt = b(ft), Vt = f(Dt), vt = b(st, 2), I = f(vt), G = b(vt, 2);
          Ke(G, 17, () => i, bt, (oe, we) => {
            var Ue = /* @__PURE__ */ ee(() => mr(a(we), 3));
            let Ie = () => a(Ue)[0], ge = () => a(Ue)[1], et = () => a(Ue)[2];
            const E = /* @__PURE__ */ ee(() => a(Ne)[Ie()] !== a(Qe)[Ie()]);
            var q = Jo();
            let ye;
            var Oe = f(q), St = f(Oe), Fe = b(Oe, 2), tt = b(Fe, 2), Ct = b(tt, 2);
            Ge(Ct, ge, () => a(E), () => () => c({
              [a(ke)]: { ...a(Ne), [Ie()]: a(Qe)[Ie()] }
            })), j(() => {
              ye = Ae(q, 1, "row svelte-1hh0fwb", null, ye, { moved: a(E) }), T(St, ge()), ue(Fe, "max", et()), ue(Fe, "step", et() === 1 ? 0.01 : 1), ue(Fe, "aria-label", `${a(g) ?? ""} ${s[a(se).dark].title ?? ""} ${ge() ?? ""}`), rn(Fe, a(Ne)[Ie()]), ue(tt, "max", et()), ue(tt, "step", et() === 1 ? 0.01 : 1), ue(tt, "aria-label", `${a(g) ?? ""} ${s[a(se).dark].title ?? ""} ${ge() ?? ""} value`), rn(tt, a(Ne)[Ie()]);
            }), J("input", Fe, (Se) => c({
              [a(ke)]: {
                ...a(Ne),
                [Ie()]: Number(Se.currentTarget.value)
              }
            })), J("input", tt, (Se) => c({
              [a(ke)]: {
                ...a(Ne),
                [Ie()]: Number(Se.currentTarget.value)
              }
            })), A(oe, q);
          });
          var ne = b(G, 2);
          let xe;
          var pe = f(ne);
          j(
            (oe, we) => {
              T(ft, `${s[a(se).dark].title ?? ""} `), T(Vt, a(g)), T(I, s[a(se).dark].note), xe = qn(ne, "", xe, oe), T(pe, we);
            },
            [
              () => ({ background: h(a(Ne)) }),
              () => h(a(Ne))
            ]
          ), A(ve, We);
        });
        var V = b(B, 2), z = b(f(V), 4);
        let ut;
        var W = f(z), x = f(W), k = b(W, 2);
        Ge(k, () => "Blur at the edge", () => a(u).blurEdge !== an.blurEdge, () => () => y("blurEdge"));
        var L = b(V, 2), re = b(f(L), 4);
        Ke(re, 21, () => l, bt, (ve, se) => {
          var ke = /* @__PURE__ */ ee(() => mr(a(se), 2));
          let Ne = () => a(ke)[0], Qe = () => a(ke)[1];
          var We = Qo(), st = f(We), ft = f(st), Dt = b(st);
          j(() => {
            T(ft, Ne()), T(Dt, ` — ${Qe() ?? ""}`);
          }), A(ve, We);
        });
        var be = b(L, 2), de = b(f(be), 4), fe = f(de), Ce = b(fe, 2), me = b(Ce, 2), Te = f(me), Be = b(de, 2);
        j(() => {
          T(Q, `The five colours below are per theme, and you are editing the ${a(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), T(_e, `Edit the ${a(g) === "dark" ? "light" : "dark"} colours`), ut = Ae(z, 1, "row toggle svelte-1hh0fwb", null, ut, { moved: a(u).blurEdge !== an.blurEdge }), Zi(x, a(u).blurEdge), T(Te, a(d) ? "Copied" : "Copy"), rn(Be, a(w));
        }), J("click", ae, C), J("change", x, (ve) => c({ blurEdge: ve.currentTarget.checked })), J("click", fe, () => _(Qt)), J("click", Ce, () => _(an)), J("click", me, N);
      }
      A(D, K);
    };
    Y(F, (D) => {
      a(o) && D(U);
    });
  }
  j(() => {
    O = Ae(M, 1, "tuner svelte-1hh0fwb", null, O, { folded: !a(o) }), ue(H, "title", a(o) ? "Fold away" : "Open"), T(R, a(o) ? "–" : "+");
  }), el("innerWidth", (D) => S(m, D, !0)), J("click", H, () => S(o, !a(o))), A(e, M), kt();
}
zt(["click", "input", "change"]);
var ru = /* @__PURE__ */ P('<button><span class="n svelte-1n46o8q"> </span> </button>'), au = /* @__PURE__ */ P('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), su = /* @__PURE__ */ P('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), iu = /* @__PURE__ */ P('<div class="muted pad svelte-1n46o8q">loading…</div>'), lu = /* @__PURE__ */ P('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), ou = /* @__PURE__ */ P('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), uu = /* @__PURE__ */ P('<p class="blurb"> </p>'), cu = /* @__PURE__ */ P('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), du = /* @__PURE__ */ P('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), fu = /* @__PURE__ */ P('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), vu = /* @__PURE__ */ P('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), hu = /* @__PURE__ */ P("<div> </div>"), pu = /* @__PURE__ */ P('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!>', 1);
function gu(e, t) {
  xt(t, !0);
  const n = location.pathname === "/tune";
  let r = /* @__PURE__ */ X("grid"), s = /* @__PURE__ */ X(0), i = /* @__PURE__ */ X(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ X(qe([])), u = /* @__PURE__ */ X(null), o = /* @__PURE__ */ X(null), d = /* @__PURE__ */ X(qe(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ X(null), m = /* @__PURE__ */ X(null), p = /* @__PURE__ */ X(null), v = /* @__PURE__ */ X(null), h = /* @__PURE__ */ X(!1), w = /* @__PURE__ */ X(!1), c = /* @__PURE__ */ X(!1), _ = /* @__PURE__ */ X(!1), y = /* @__PURE__ */ X(qe({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), C = /* @__PURE__ */ X(null), N = /* @__PURE__ */ X(0), M = /* @__PURE__ */ X(null), O = /* @__PURE__ */ X(qe({})), $ = /* @__PURE__ */ X("newest"), H = /* @__PURE__ */ X(qe(Ml()));
  const R = /* @__PURE__ */ ee(() => pa[a(s)]), F = /* @__PURE__ */ ee(() => a(R).table !== !1), U = /* @__PURE__ */ ee(() => a(F) || a(R).tree === !0), D = /* @__PURE__ */ ee(() => a(R).sheet !== !1 && (a(o) !== null || !a(U))), K = /* @__PURE__ */ ee(() => ({
    sort: a($),
    ...a(H).on ? { stack: a(H).window } : {},
    ...Object.fromEntries(Object.entries(a(O)).filter(([, E]) => E.length > 0))
  })), le = /* @__PURE__ */ ee(() => a(r) === "grid" ? `grid:${JSON.stringify(a(K))}` : `triage:${a(s)}:${JSON.stringify(a(o))}`), Z = /* @__PURE__ */ ee(() => a(R).rule === !1 || a(d).size === 0 ? [] : a(l).filter((E) => a(d).has(E.key)).map((E) => a(R).toRule(E, a(i))).filter((E) => E && us(a(m)?.rules ?? [], E) !== "exclude")), Q = /* @__PURE__ */ ee(() => (a(m)?.rules ?? []).filter((E) => E.decision === "exclude" && E.term?.column === "dir_under").map((E) => String(E.term.value).replace(/[\\/]+$/, "").toLowerCase())), ae = rl();
  function _e(E) {
    S(C, String(E), !0);
  }
  async function B(E) {
    try {
      return S(C, null), await E();
    } catch (q) {
      return _e(q), null;
    }
  }
  const V = al(
    () => {
      S(w, !0), B(async () => {
        const E = a(o)?.at === "end" || a(o)?.at === void 0 ? void 0 : 0, { stale: q, value: ye } = await ae(() => Le.counts(a(o), E));
        q || S(m, ye, !0);
      }).finally(() => {
        S(w, !1);
      });
    },
    220
  );
  async function z() {
    S(p, "loading");
    const E = await B(() => Le.files());
    S(p, E, !0), S(h, !1), S(v, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function W(E = !1) {
    if (a(r) !== "triage" || !a(F)) {
      S(l, [], !0);
      return;
    }
    S(_, !0);
    const q = a(R).name === "source_folder" && a(i) ? { root: a(i) } : {};
    E && (q.live = "1");
    const ye = await B(() => Le.screen(a(R).name, q));
    S(l, ye?.rows ?? [], !0), S(_, !1);
  }
  let x = !1;
  nn(() => {
    a(s), a(r), vn(() => {
      S(u, null), S(o, null), S(i, null), be(), a(r) === "triage" && (W(), V.now(), x || (x = !0, z()));
    });
  }), nn(() => {
    a(i), vn(() => {
      a(r) === "triage" && (be(), W());
    });
  }), Kn(() => {
    B(async () => {
      S(M, await Le.facets(), !0);
    });
  });
  function k(E, q) {
    S(O, { ...a(O), [E]: q }, !0);
  }
  function L(E) {
    if (a(R).sheet !== !1) {
      if (a(R).drill && !a(i)) {
        S(u, E.key, !0), S(
          o,
          {
            ...a(R).toRule(E, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), S(i, E.key, !0);
        return;
      }
      S(u, E.key, !0), S(
        o,
        {
          ...a(R).toRule(E, a(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), V();
    }
  }
  function re(E, q, ye) {
    const Oe = new Set(a(d)), St = !Oe.has(E.key), Fe = ye && a(g) !== null ? a(l).findIndex((Se) => Se.key === a(g)) : -1, [tt, Ct] = Fe < 0 ? [q, q] : Fe < q ? [Fe, q] : [q, Fe];
    for (let Se = tt; Se <= Ct; Se++)
      St ? Oe.add(a(l)[Se].key) : Oe.delete(a(l)[Se].key);
    S(d, Oe, !0), S(g, E.key, !0);
  }
  function be() {
    S(d, /* @__PURE__ */ new Set(), !0), S(g, null);
  }
  function de(E) {
    S(o, E, !0), S(
      u,
      null
      // it no longer corresponds to a row
    ), V();
  }
  function fe(E = !1) {
    S(o, null), S(u, null), E && S(i, null), V.now();
  }
  async function Ce() {
    S(
      h,
      !0
      // the distinct-content number now says so on its face
    ), yi(N), await W(), V.now();
  }
  async function me() {
    if (!a(o)) return;
    S(c, !0);
    const E = a(o).at === "end" ? void 0 : 0, q = await B(() => Le.addRule(
      {
        column: a(o).column,
        op: a(o).op,
        value: a(o).value,
        decision: a(o).decision ?? "exclude",
        note: `screen ${a(R).id} ${a(R).title}`
      },
      E
    ));
    S(c, !1), q && (S(o, null), S(u, null), await Ce());
  }
  async function Te() {
    const E = a(Z);
    if (!E.length) {
      be();
      return;
    }
    S(c, !0);
    for (const q of E)
      if (!await B(() => Le.addRule({
        column: q.column,
        op: q.op,
        value: q.value,
        decision: "exclude",
        note: `screen ${a(R).id} ${a(R).title}`
      }))) break;
    S(c, !1), be(), S(o, null), S(u, null), await Ce();
  }
  async function Be(E) {
    if (!E || Qr(a(Q), E)) return;
    S(c, !0);
    const q = await B(() => Le.addRule({
      column: "dir_under",
      op: "=",
      value: E,
      decision: "exclude",
      note: `screen ${a(R).id} ${a(R).title}`
    }));
    S(c, !1), q && await Ce();
  }
  const Ge = (E) => Be(os(E.p ?? "")), ut = (E) => Be(E.key);
  async function ve(E) {
    S(c, !0), await B(() => Le.deleteRule(E.id)), S(c, !1), await Ce();
  }
  async function se(E, q) {
    S(c, !0), await B(() => Le.moveRule(E.id, q)), S(c, !1), await Ce();
  }
  async function ke() {
    await B(async () => {
      S(M, await Le.facets(), !0);
    });
  }
  async function Ne(E, q) {
    const ye = await B(() => Le.override(E.s, q));
    return ye ? (S(h, !0), V(), ye.decision) : E.o ?? null;
  }
  function Qe(E) {
    return a(r) === "grid" ? Le.photos({ limit: 500, ...a(K), ...E || {} }) : Le.page(a(o), E);
  }
  function We(E) {
    B(() => a(r) === "grid" ? Le.revealPhoto(E.id) : Le.revealOrigin(E.id));
  }
  var st = pu(), ft = Je(st);
  {
    var Dt = (E) => {
      Yl(E, {
        get facets() {
          return a(M);
        },
        get selected() {
          return a(O);
        },
        get sort() {
          return a($);
        },
        get stacking() {
          return a(H);
        },
        get total() {
          return a(y).total;
        },
        get tiles() {
          return a(y).tiles;
        },
        get loading() {
          return a(y).loading;
        },
        onselect: k,
        onsort: (q) => S($, q, !0),
        onstack: (q) => S(H, Al(q), !0),
        onclear: () => S(O, {}, !0),
        ontriage: () => S(r, "triage")
      });
    };
    Y(ft, (E) => {
      a(r) === "grid" && E(Dt);
    });
  }
  var Vt = b(ft, 2);
  {
    var vt = (E) => {
      nu(E, {});
    };
    Y(Vt, (E) => {
      n && E(vt);
    });
  }
  var I = b(Vt, 2);
  let G;
  var ne = f(I);
  {
    var xe = (E) => {
      var q = ou(), ye = f(q), Oe = f(ye), St = b(ye, 2);
      Ke(St, 21, () => pa, bt, (Ye, it, Nt) => {
        var It = ru();
        let ht;
        var qt = f(It), Ee = f(qt), Ve = b(qt, 1, !0);
        j(() => {
          ht = Ae(It, 1, "nav svelte-1n46o8q", null, ht, { on: Nt === a(s) }), T(Ee, a(it).id), T(Ve, a(it).title);
        }), J("click", It, () => S(s, Nt, !0)), A(Ye, It);
      });
      var Fe = b(St, 2);
      {
        var tt = (Ye) => {
          var it = lu(), Nt = Je(it), It = f(Nt);
          {
            var ht = (Xe) => {
              var rt = au(), hn = Je(rt), Nn = /* @__PURE__ */ ee(() => fe.bind(null, !0)), gr = b(hn, 2), _r = f(gr);
              j(() => T(_r, `inside ${a(i) ?? ""}`)), J("click", hn, function(...br) {
                a(Nn)?.apply(this, br);
              }), A(Xe, rt);
            }, qt = (Xe) => {
              var rt = su(), hn = f(rt);
              j(() => T(hn, a(R).relive)), J("click", rt, () => W(!0)), A(Xe, rt);
            };
            Y(It, (Xe) => {
              a(R).drill && a(i) ? Xe(ht) : a(R).relive && Xe(qt, 1);
            });
          }
          var Ee = b(Nt, 2);
          {
            var Ve = (Xe) => {
              var rt = iu();
              A(Xe, rt);
            };
            Y(Ee, (Xe) => {
              a(_) && Xe(Ve);
            });
          }
          var Xt = b(Ee, 2);
          {
            let Xe = /* @__PURE__ */ ee(() => a(m)?.rules ?? []);
            zo(Xt, {
              get rows() {
                return a(l);
              },
              get screen() {
                return a(R);
              },
              get root() {
                return a(i);
              },
              get checked() {
                return a(d);
              },
              get rules() {
                return a(Xe);
              },
              get selected() {
                return a(u);
              },
              onpick: L,
              oncheck: re
            });
          }
          A(Ye, it);
        };
        Y(Fe, (Ye) => {
          a(F) && Ye(tt);
        });
      }
      var Ct = b(Fe, 2);
      {
        var Se = (Ye) => {
          Wo(Ye, {
            get root() {
              return An;
            },
            get version() {
              return a(N);
            },
            get excludedDirs() {
              return a(Q);
            },
            get selected() {
              return a(u);
            },
            get busy() {
              return a(c);
            },
            onload: (it) => B(() => Le.tree(it)),
            onpick: L,
            onexclude: ut
          });
        };
        Y(Ct, (Ye) => {
          a(R).tree && Ye(Se);
        });
      }
      var nt = b(Ct, 2);
      {
        let Ye = /* @__PURE__ */ ee(() => a(m)?.rules ?? []), it = /* @__PURE__ */ ee(() => a(m)?.unmatched ?? null);
        wo(nt, {
          get rules() {
            return a(Ye);
          },
          get unmatched() {
            return a(it);
          },
          get busy() {
            return a(c);
          },
          ondelete: ve,
          onmove: se
        });
      }
      var jt = b(nt, 2);
      oo(jt, { oncomplete: ke }), J("click", Oe, () => S(r, "grid")), A(E, q);
    };
    Y(ne, (E) => {
      a(r) === "triage" && E(xe);
    });
  }
  var pe = b(ne, 2), oe = f(pe);
  {
    var we = (E) => {
      var q = vu(), ye = Je(q), Oe = f(ye), St = b(ye, 2), Fe = f(St), tt = b(St, 2);
      {
        var Ct = (Ee) => {
          var Ve = uu(), Xt = f(Ve);
          j(() => T(Xt, a(R).note)), A(Ee, Ve);
        };
        Y(tt, (Ee) => {
          a(R).note && Ee(Ct);
        });
      }
      var Se = b(tt, 2);
      {
        var nt = (Ee) => {
          Zl(Ee, {
            get screen() {
              return a(R);
            }
          });
        };
        Y(Se, (Ee) => {
          a(R).name === "dimensions" && Ee(nt);
        });
      }
      var jt = b(Se, 2);
      hl(jt, {
        get counts() {
          return a(m);
        },
        get files() {
          return a(p);
        },
        get filesAt() {
          return a(v);
        },
        get stale() {
          return a(h);
        },
        get candidate() {
          return a(o);
        },
        get busy() {
          return a(w);
        },
        onfiles: z
      });
      var Ye = b(jt, 2);
      {
        var it = (Ee) => {
          var Ve = cu(), Xt = f(Ve), Xe = f(Xt), rt = b(Xt, 2), hn = f(rt), Nn = b(rt, 2), gr = b(Nn, 2), _r = f(gr);
          {
            var br = (Kt) => {
              var pn = wn("already excluded — nothing left to write");
              A(Kt, pn);
            }, bs = (Kt) => {
              var pn = wn();
              j((ms) => T(pn, `one exclude rule each, at the end of the order${ms ?? ""}`), [
                () => a(Z).length < a(d).size ? ` · ${Me(a(d).size - a(Z).length)} already excluded, skipped` : ""
              ]), A(Kt, pn);
            };
            Y(_r, (Kt) => {
              a(Z).length ? Kt(bs, -1) : Kt(br);
            });
          }
          j(
            (Kt, pn) => {
              T(Xe, `${Kt ?? ""} ticked`), rt.disabled = a(c) || !a(Z).length, T(hn, pn), Nn.disabled = a(c);
            },
            [
              () => Me(a(d).size),
              () => a(c) ? "saving…" : `Exclude ${Me(a(Z).length)}`
            ]
          ), J("click", rt, Te), J("click", Nn, be), A(Ee, Ve);
        };
        Y(Ye, (Ee) => {
          a(d).size && Ee(it);
        });
      }
      var Nt = b(Ye, 2);
      po(Nt, {
        get candidate() {
          return a(o);
        },
        get screen() {
          return a(R);
        },
        get saving() {
          return a(c);
        },
        onedit: de,
        onconfirm: me,
        onclear: fe
      });
      var It = b(Nt, 2);
      {
        var ht = (Ee) => {
          var Ve = du(), Xt = f(Ve);
          j((Xe, rt) => T(Xt, `${Xe ?? ""}${rt ?? ""} loaded${a(y).exhausted ? " · all of them" : ""}${a(y).loading ? " · loading…" : ""} `), [
            () => Me(a(y).count),
            () => a(y).total ? " of " + Me(a(y).total) : ""
          ]), A(Ee, Ve);
        }, qt = (Ee) => {
          var Ve = fu();
          A(Ee, Ve);
        };
        Y(It, (Ee) => {
          a(D) ? Ee(ht) : a(R).sheet === !1 && Ee(qt, 1);
        });
      }
      j(() => {
        T(Oe, `${a(R).id ?? ""} · ${a(R).title ?? ""}`), T(Fe, a(R).blurb);
      }), A(E, q);
    };
    Y(oe, (E) => {
      a(r) === "triage" && E(we);
    });
  }
  var Ue = b(oe, 2);
  {
    var Ie = (E) => {
      {
        let q = /* @__PURE__ */ ee(() => a(r) === "grid" ? null : a(m)?.page_paths ?? null), ye = /* @__PURE__ */ ee(() => a(r) === "triage");
        Ro(E, {
          get key() {
            return a(le);
          },
          fetchPage: Qe,
          get total() {
            return a(q);
          },
          get triage() {
            return a(ye);
          },
          get excludedDirs() {
            return a(Q);
          },
          onActivate: We,
          onOverride: Ne,
          onExcludeFolder: Ge,
          onState: (Oe) => S(y, { ...a(y), ...Oe }, !0)
        });
      }
    };
    Y(Ue, (E) => {
      (a(D) || a(r) === "grid") && E(Ie);
    });
  }
  var ge = b(I, 2);
  {
    var et = (E) => {
      var q = hu();
      let ye;
      var Oe = f(q);
      j(() => {
        ye = Ae(q, 1, "status", null, ye, { bare: a(r) === "grid" }), T(Oe, a(C));
      }), A(E, q);
    };
    Y(ge, (E) => {
      a(C) && E(et);
    });
  }
  j(() => G = Ae(I, 1, "shell", null, G, { bare: a(r) === "grid" })), A(e, st), kt();
}
zt(["click"]);
Rl();
ea();
qi(gu, { target: document.getElementById("app") });
