var Xr = Array.isArray, Ts = Array.prototype.indexOf, ur = Array.prototype.includes, wr = Array.from, Ms = Object.defineProperty, An = Object.getOwnPropertyDescriptor, As = Object.getOwnPropertyDescriptors, Rs = Object.prototype, Ps = Array.prototype, Pa = Object.getPrototypeOf, oa = Object.isExtensible;
const ir = () => {
};
function Cs(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Ca() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
function Tr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const r of e)
    if (n.push(r), n.length === t) break;
  return n;
}
const qe = 2, Cn = 4, yr = 8, Na = 1 << 24, Ot = 16, kt = 32, Yt = 64, Lr = 128, xt = 512, ze = 1024, De = 2048, Lt = 4096, nt = 8192, vt = 16384, zn = 32768, zr = 1 << 25, Nn = 65536, cr = 1 << 17, Ns = 1 << 18, Dn = 1 << 19, Os = 1 << 20, jt = 1 << 25, _n = 65536, dr = 1 << 21, Rn = 1 << 22, rn = 1 << 23, hn = Symbol("$state"), Is = Symbol("legacy props"), Fs = Symbol(""), Oa = Symbol("attributes"), Dr = Symbol("class"), jr = Symbol("style"), Hr = Symbol("text"), er = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Ls = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function zs(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Ds() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function js(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Hs(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function qs() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Bs(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function $s() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Us(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Gs() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ws() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ys() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Vs() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Xs = 1, Ks = 2, Ia = 4, Js = 8, Zs = 16, Qs = 1, ei = 4, ti = 8, ni = 16, ri = 1, ai = 2, Le = Symbol("uninitialized"), si = "http://www.w3.org/1999/xhtml";
function ii() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function li() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function oi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Fa(e) {
  return e === this.v;
}
function ui(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function La(e) {
  return !ui(e, this.v);
}
let Ze = null;
function On(e) {
  Ze = e;
}
function pt(e, t = !1, n) {
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
function gt(e) {
  var t = (
    /** @type {ComponentContext} */
    Ze
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      es(r);
  }
  return t.i = !0, Ze = t.p, /** @type {T} */
  {};
}
function za() {
  return !0;
}
let En = [];
function ci() {
  var e = En;
  En = [], Cs(e);
}
function Gt(e) {
  if (En.length === 0) {
    var t = En;
    queueMicrotask(() => {
      t === En && ci();
    });
  }
  En.push(e);
}
function Da(e) {
  var t = ie;
  if (t === null)
    return le.f |= rn, e;
  if ((t.f & zn) === 0 && (t.f & Cn) === 0)
    throw e;
  tn(e, t);
}
function tn(e, t) {
  if (!(t !== null && (t.f & vt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & Lr) !== 0) {
        if ((t.f & zn) === 0)
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
const di = -7169;
function Ae(e, t) {
  e.f = e.f & di | t;
}
function Kr(e) {
  (e.f & xt) !== 0 || e.deps === null ? Ae(e, ze) : Ae(e, Lt);
}
function ja(e) {
  if (e !== null)
    for (const t of e)
      (t.f & qe) === 0 || (t.f & _n) === 0 || (t.f ^= _n, ja(
        /** @type {Derived} */
        t.deps
      ));
}
function Ha(e, t, n) {
  (e.f & De) !== 0 ? t.add(e) : (e.f & Lt) !== 0 && n.add(e), ja(e.deps), Ae(e, ze);
}
let rr = !1;
function fi(e) {
  var t = rr;
  try {
    return rr = !1, [e(), rr];
  } finally {
    rr = t;
  }
}
function hi(e, t, n, r = !0) {
  r && n();
  for (var s of t)
    e.addEventListener(s, n);
  xr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function jn(e) {
  var t = le, n = ie;
  St(null), qt(null);
  try {
    return e();
  } finally {
    St(t), qt(n);
  }
}
function vi(e) {
  let t = 0, n = bn(0), r;
  return () => {
    ea() && (a(n), ns(() => (t === 0 && (r = wn(() => e(() => Jn(n)))), t += 1, () => {
      Gt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Jn(n));
      });
    })));
  };
}
var pi = Nn | Dn;
function gi(e, t, n, r) {
  new _i(e, t, n, r);
}
class _i {
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
  #b = vi(() => (this.#d = bn(this.#p), () => {
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
      l.b = this, l.f |= Lr, r(i);
    }, this.parent = /** @type {Effect} */
    ie.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#r = ta(() => {
      this.#h();
    }, pi);
  }
  #_() {
    try {
      this.#s = wt(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: s } = this.#m(t);
    Gt(s), n && (this.#l = wt(() => {
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
        oi();
        return;
      }
      n = !0, r && Vs(), this.#l !== null && pn(this.#l, () => {
        this.#l = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: s, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, s), r = !1;
      } catch (l) {
        tn(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = wt(() => t(this.#t)), Gt(() => {
      var n = this.#a = document.createDocumentFragment(), r = Wt();
      n.append(r), this.#s = this.#v(() => wt(() => this.#o(r))), this.#u === 0 && (this.#t.before(n), this.#a = null, pn(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        _e
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#p = 0, this.#s = wt(() => {
        this.#o(this.#t);
      }), this.#u > 0) {
        var t = this.#a = document.createDocumentFragment();
        ra(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = wt(() => n(this.#t));
      } else
        this.#w(
          /** @type {Batch} */
          _e
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
    Ha(t, this.#f, this.#g);
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
  #v(t) {
    var n = ie, r = le, s = Ze;
    qt(this.#r), St(this.#r), On(this.#r.ctx);
    try {
      return an.ensure(), t();
    } catch (i) {
      return Da(i), null;
    } finally {
      qt(n), St(r), On(s);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && pn(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#c) && (this.#c = !0, Gt(() => {
      this.#c = !1, this.#d && In(this.#d, this.#p);
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
    _e?.is_fork ? (this.#s && _e.skip_effect(this.#s), this.#n && _e.skip_effect(this.#n), this.#l && _e.skip_effect(this.#l), _e.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#s && (ut(this.#s), this.#s = null), this.#n && (ut(this.#n), this.#n = null), this.#l && (ut(this.#l), this.#l = null);
    let n = this.#e.failed;
    const r = (s) => {
      const { reset: i, invoke_onerror: l } = this.#m(s);
      l(), n && (this.#l = this.#v(() => {
        try {
          return wt(() => {
            var u = (
              /** @type {Effect} */
              ie
            );
            u.b = this, u.f |= Lr, n(
              this.#t,
              () => s,
              () => i
            );
          });
        } catch (u) {
          return tn(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    Gt(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (i) {
        tn(i, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        r,
        /** @param {unknown} e */
        (i) => tn(i, this.#r && this.#r.parent)
      ) : r(s);
    });
  }
}
function bi(e, t, n, r) {
  const s = Zn;
  var i = e.filter((h) => !h.settled), l = t.map(s);
  if (n.length === 0 && i.length === 0) {
    r(l);
    return;
  }
  var u = (
    /** @type {Effect} */
    ie
  ), o = mi(), d = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function g(h) {
    if ((u.f & vt) === 0) {
      o();
      try {
        r([...l, ...h]);
      } catch (v) {
        tn(v, u);
      }
      fr();
    }
  }
  var m = qa();
  if (n.length === 0) {
    d.then(() => g([])).finally(m);
    return;
  }
  function p() {
    Promise.all(n.map((h) => /* @__PURE__ */ wi(h))).then(g).catch((h) => tn(h, u)).finally(m);
  }
  d ? d.then(() => {
    o(), p(), fr();
  }) : p();
}
function mi() {
  var e = (
    /** @type {Effect} */
    ie
  ), t = le, n = Ze, r = (
    /** @type {Batch} */
    _e
  );
  return function(i = !0) {
    qt(e), St(t), On(n), i && (e.f & vt) === 0 && (r?.activate(), r?.apply());
  };
}
function fr(e = !0) {
  qt(null), St(null), On(null), e && _e?.deactivate();
}
function qa() {
  var e = (
    /** @type {Effect} */
    ie
  ), t = e.b, n = (
    /** @type {Batch} */
    _e
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function Zn(e) {
  var t = qe | De;
  return ie !== null && (ie.f |= Dn), {
    ctx: Ze,
    deps: null,
    effects: null,
    equals: Fa,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Le
    ),
    wv: 0,
    parent: ie,
    ac: null
  };
}
const Wn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function wi(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    ie
  );
  r === null && Ds();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = bn(
    /** @type {V} */
    Le
  ), l = !le, u = /* @__PURE__ */ new Set();
  return Fi(() => {
    var o = (
      /** @type {Effect} */
      ie
    ), d = Ca();
    s = d.promise;
    try {
      Promise.resolve(e()).then(d.resolve, (h) => {
        h !== er && d.reject(h);
      }).finally(fr);
    } catch (h) {
      d.reject(h), fr();
    }
    var g = (
      /** @type {Batch} */
      _e
    );
    if (l) {
      if ((o.f & zn) !== 0)
        var m = qa();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(Wn);
      else
        for (const h of u.values())
          h.reject(Wn);
      u.add(d), g.async_deriveds.set(o, d);
    }
    const p = (h, v = void 0) => {
      m?.(), u.delete(d), v !== Wn && (g.activate(), v ? (i.f |= rn, In(i, v)) : ((i.f & rn) !== 0 && (i.f ^= rn), In(i, h)), g.deactivate());
    };
    d.promise.then(p, (h) => p(null, h || "unknown"));
  }), xr(() => {
    for (const o of u)
      o.reject(Wn);
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
function ne(e) {
  const t = /* @__PURE__ */ Zn(e);
  return ls(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ba(e) {
  const t = /* @__PURE__ */ Zn(e);
  return t.equals = La, t;
}
function yi(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      ut(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Jr(e) {
  var t, n = ie, r = e.parent;
  if (!Vt && r !== null && e.v !== Le && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (vt | nt)) !== 0)
    return ii(), e.v;
  qt(r);
  try {
    e.f &= ~_n, yi(e), t = ds(e);
  } finally {
    qt(n);
  }
  return t;
}
function $a(e) {
  var t = Jr(e);
  if (!e.equals(t) && (e.wv = us(), (!_e?.is_fork || e.deps === null) && (_e !== null ? (_e.capture(e, t, !0), qr?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Ae(e, ze);
    return;
  }
  Vt || (It !== null ? (ea() || _e?.is_fork) && It.set(e, t) : Kr(e));
}
function xi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && jn(() => {
        t.ac.abort(er), t.ac = null;
      }), t.fn !== null && (t.teardown = ir), Qn(t, 0), na(t));
}
function Ua(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Fn(t);
}
let Mr = null, kn = null, _e = null, qr = null, It = null, Br = null, Ar = !1, Tn = null, lr = null;
var ua = 0;
let ki = 1;
class an {
  id = ki++;
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
    kn === null ? Mr = kn = this : (kn.#e = this, this.#i = kn), kn = this;
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
        Ae(s, De), n(s);
      for (s of r.m)
        Ae(s, Lt), n(s);
    }
    this.#g.add(t);
  }
  #_() {
    this.#t = !0, ua++ > 1e3 && (this.#v(), Si());
    for (const o of this.#u)
      this.#c.delete(o), Ae(o, De), this.schedule(o);
    for (const o of this.#c)
      Ae(o, Lt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Tn = [], r = [], s = lr = [];
    for (const o of t)
      try {
        this.#y(o, n, r);
      } catch (d) {
        throw Ya(o), this.#b() || this.discard(), d;
      }
    if (_e = null, s.length > 0) {
      var i = an.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (Tn = null, lr = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [o, d] of this.#f)
        Wa(o, d);
      s.length > 0 && /** @type {unknown} */
      _e.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(r), this.#h(n), l.#x(this);
      return;
    }
    this.#u.clear(), this.#c.clear();
    for (const o of this.#o) o(this);
    this.#o.clear(), qr = this, ca(r), ca(n), qr = null, this.#l?.resolve();
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      _e
    );
    if (this.#s === 0 && (this.#a.length === 0 || u !== null) && this.#v(), this.#a.length > 0)
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
    t.f ^= ze;
    for (var s = t.first; s !== null; ) {
      var i = s.f, l = (i & (kt | Yt)) !== 0, u = l && (i & ze) !== 0, o = u || (i & nt) !== 0 || this.#f.has(s);
      if (!o && s.fn !== null) {
        l ? s.f ^= ze : (i & Cn) !== 0 ? n.push(s) : nr(s) && ((i & Ot) !== 0 && this.#c.add(s), Fn(s));
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
      if (s !== null && !((r.f & qe) !== 0 && (r.f & (De | Lt)) === 0))
        for (const u of s) {
          var i = u.f;
          if ((i & qe) !== 0)
            n(
              /** @type {Derived} */
              u
            );
          else {
            var l = (
              /** @type {Effect} */
              u
            );
            i & (Rn | Ot) && !this.async_deriveds.has(l) && (this.#c.delete(l), Ae(l, De), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), _e = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      Ha(t[n], this.#u, this.#c);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== Le && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & rn) === 0 && (this.current.set(t, [n, r]), It?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    _e = this;
  }
  deactivate() {
    _e = null, It = null;
  }
  flush() {
    try {
      Ar = !0, _e = this, this.#_();
    } finally {
      ua = 0, Br = null, Tn = null, lr = null, Ar = !1, _e = null, It = null, vn.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Wn);
    this.#v(), this.#l?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let m = Mr; m !== null; m = m.#e) {
      var t = m.id < this.id, n = [];
      for (const [p, [h, v]] of this.current) {
        if (m.current.has(p)) {
          var r = (
            /** @type {[any, boolean]} */
            m.current.get(p)[0]
          );
          if (t && h !== r)
            m.current.set(p, [h, v]);
          else
            continue;
        }
        n.push(p);
      }
      if (t)
        for (const [p, h] of this.async_deriveds) {
          const v = m.async_deriveds.get(p);
          v && h.promise.then(v.resolve).catch(v.reject);
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
              m.unskip_effect(p, (h) => {
                (h.f & (Ot | Rn)) !== 0 ? m.schedule(h) : m.#h([h]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (var o of n)
            Ga(o, i, l, u);
          u = /* @__PURE__ */ new Map();
          var d = [...m.current].filter(([p, h]) => {
            const v = this.current.get(p);
            return v ? v[0] !== h[0] || v[1] !== h[1] : !0;
          }).map(([p]) => p);
          if (d.length > 0)
            for (const p of this.#p)
              (p.f & (vt | nt | cr)) === 0 && Zr(p, d, u) && ((p.f & (Rn | Ot)) !== 0 ? (Ae(p, De), m.schedule(p)) : m.#u.add(p));
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
    this.#d || (this.#d = !0, Gt(() => {
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
    return (this.#l ??= Ca()).promise;
  }
  static ensure() {
    if (_e === null) {
      const t = _e = new an();
      Ar || Gt(() => {
        t.#t || t.flush();
      });
    }
    return _e;
  }
  apply() {
    {
      It = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Br = t, t.b?.is_pending && (t.f & (Cn | yr | Na)) !== 0 && (t.f & zn) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (Tn !== null && n === ie && (le === null || (le.f & qe) === 0))
        return;
      if ((r & (Yt | kt)) !== 0) {
        if ((r & ze) === 0)
          return;
        n.f ^= ze;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#i, n = this.#e;
      t === null ? Mr = n : t.#e = n, n === null ? kn = t : n.#i = t, this.linked = !1;
    }
  }
}
function Si() {
  try {
    $s();
  } catch (e) {
    tn(e, Br);
  }
}
let Ut = null;
function ca(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (vt | nt)) === 0 && nr(r) && (Ut = /* @__PURE__ */ new Set(), Fn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && as(r), Ut?.size > 0)) {
        vn.clear();
        for (const s of Ut) {
          if ((s.f & (vt | nt)) !== 0) continue;
          const i = [s];
          let l = s.parent;
          for (; l !== null; )
            Ut.has(l) && (Ut.delete(l), i.push(l)), l = l.parent;
          for (let u = i.length - 1; u >= 0; u--) {
            const o = i[u];
            (o.f & (vt | nt)) === 0 && Fn(o);
          }
        }
        Ut.clear();
      }
    }
    Ut = null;
  }
}
function Ga(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & qe) !== 0 ? Ga(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (Rn | Ot)) !== 0 && (i & De) === 0 && Zr(s, t, r) && (Ae(s, De), Qr(
        /** @type {Effect} */
        s
      ));
    }
}
function Zr(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (ur.call(t, s))
        return !0;
      if ((s.f & qe) !== 0 && Zr(
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
function Qr(e) {
  _e.schedule(e);
}
function Wa(e, t) {
  if (!((e.f & kt) !== 0 && (e.f & ze) !== 0)) {
    (e.f & De) !== 0 ? t.d.push(e) : (e.f & Lt) !== 0 && t.m.push(e), Ae(e, ze);
    for (var n = e.first; n !== null; )
      Wa(n, t), n = n.next;
  }
}
function Ya(e) {
  Ae(e, ze);
  for (var t = e.first; t !== null; )
    Ya(t), t = t.next;
}
let hr = /* @__PURE__ */ new Set();
const vn = /* @__PURE__ */ new Map();
let Va = !1;
function bn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Fa,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function W(e, t) {
  const n = bn(e);
  return ls(n), n;
}
// @__NO_SIDE_EFFECTS__
function Ei(e, t = !1, n = !0) {
  const r = bn(e);
  return t || (r.equals = La), r;
}
function E(e, t, n = !1) {
  le !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ft || (le.f & cr) !== 0) && za() && (le.f & (qe | Ot | Rn | cr)) !== 0 && (Ht === null || !Ht.has(e)) && Ys();
  let r = n ? Ie(t) : t;
  return In(e, r, lr);
}
function In(e, t, n = null) {
  if (!e.equals(t)) {
    vn.set(e, Vt ? t : e.v);
    var r = an.ensure();
    if (r.capture(e, t), (e.f & qe) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & De) !== 0 && Jr(s), It === null && Kr(s);
    }
    e.wv = us(), Xa(e, De, n), ie !== null && (ie.f & ze) !== 0 && (ie.f & (kt | Yt)) === 0 && (mt === null ? Di([e]) : mt.push(e)), !r.is_fork && hr.size > 0 && !Va && Ti();
  }
  return t;
}
function Ti() {
  Va = !1;
  for (const e of hr) {
    (e.f & ze) !== 0 && Ae(e, Lt);
    let t;
    try {
      t = nr(e);
    } catch {
      t = !0;
    }
    t && Fn(e);
  }
  hr.clear();
}
function Mi(e, t = 1) {
  var n = a(e), r = t === 1 ? n++ : n--;
  return E(e, n), r;
}
function Jn(e) {
  E(e, e.v + 1);
}
function Xa(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, i = 0; i < s; i++) {
      var l = r[i], u = l.f, o = (u & De) === 0;
      if (o && Ae(l, t), (u & cr) !== 0)
        hr.add(
          /** @type {Effect} */
          l
        );
      else if ((u & qe) !== 0) {
        var d = (
          /** @type {Derived} */
          l
        );
        It?.delete(d), (u & _n) === 0 && (u & xt && (ie === null || (ie.f & dr) === 0) && (l.f |= _n), Xa(d, Lt, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (u & Ot) !== 0 && Ut !== null && Ut.add(g), n !== null ? n.push(g) : Qr(g);
      }
    }
}
function Ie(e) {
  if (typeof e != "object" || e === null || hn in e)
    return e;
  const t = Pa(e);
  if (t !== Rs && t !== Ps)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Xr(e), s = /* @__PURE__ */ W(0), i = gn, l = (u) => {
    if (gn === i)
      return u();
    var o = le, d = gn;
    St(null), ha(i);
    var g = u();
    return St(o), ha(d), g;
  };
  return r && n.set("length", /* @__PURE__ */ W(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && Gs();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var m = /* @__PURE__ */ W(d.value);
          return n.set(o, m), m;
        }) : E(g, d.value, !0), !0;
      },
      deleteProperty(u, o) {
        var d = n.get(o);
        if (d === void 0) {
          if (o in u) {
            const g = l(() => /* @__PURE__ */ W(Le));
            n.set(o, g), Jn(s);
          }
        } else
          E(d, Le), Jn(s);
        return !0;
      },
      get(u, o, d) {
        if (o === hn)
          return e;
        var g = n.get(o), m = o in u;
        if (g === void 0 && (!m || An(u, o)?.writable) && (g = l(() => {
          var h = Ie(m ? u[o] : Le), v = /* @__PURE__ */ W(h);
          return v;
        }), n.set(o, g)), g !== void 0) {
          var p = a(g);
          return p === Le ? void 0 : p;
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
          if (m !== void 0 && p !== Le)
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
        if (o === hn)
          return !0;
        var d = n.get(o), g = d !== void 0 && d.v !== Le || Reflect.has(u, o);
        if (d !== void 0 || ie !== null && (!g || An(u, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var p = g ? Ie(u[o]) : Le, h = /* @__PURE__ */ W(p);
            return h;
          }), n.set(o, d));
          var m = a(d);
          if (m === Le)
            return !1;
        }
        return g;
      },
      set(u, o, d, g) {
        var m = n.get(o), p = o in u;
        if (r && o === "length")
          for (var h = d; h < /** @type {Source<number>} */
          m.v; h += 1) {
            var v = n.get(h + "");
            v !== void 0 ? E(v, Le) : h in u && (v = l(() => /* @__PURE__ */ W(Le)), n.set(h + "", v));
          }
        if (m === void 0)
          (!p || An(u, o)?.writable) && (m = l(() => /* @__PURE__ */ W(void 0)), E(m, Ie(d)), n.set(o, m));
        else {
          p = m.v !== Le;
          var y = l(() => Ie(d));
          E(m, y);
        }
        var c = Reflect.getOwnPropertyDescriptor(u, o);
        if (c?.set && c.set.call(g, d), !p) {
          if (r && typeof o == "string") {
            var _ = (
              /** @type {Source<number>} */
              n.get("length")
            ), x = Number(o);
            Number.isInteger(x) && x >= _.v && E(_, x + 1);
          }
          Jn(s);
        }
        return !0;
      },
      ownKeys(u) {
        a(s);
        var o = Reflect.ownKeys(u).filter((m) => {
          var p = n.get(m);
          return p === void 0 || p.v !== Le;
        });
        for (var [d, g] of n)
          g.v !== Le && !(d in u) && o.push(d);
        return o;
      },
      setPrototypeOf() {
        Ws();
      }
    }
  );
}
function da(e) {
  try {
    if (e !== null && typeof e == "object" && hn in e)
      return e[hn];
  } catch {
  }
  return e;
}
function Ai(e, t) {
  return Object.is(da(e), da(t));
}
var mn, Ka, Ja, Za;
function Ri() {
  if (mn === void 0) {
    mn = window, Ka = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ja = An(t, "firstChild").get, Za = An(t, "nextSibling").get, oa(e) && (e[Dr] = void 0, e[Oa] = null, e[jr] = void 0, e.__e = void 0), oa(n) && (n[Hr] = void 0);
  }
}
function Wt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function vr(e) {
  return (
    /** @type {TemplateNode | null} */
    Ja.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function tr(e) {
  return (
    /** @type {TemplateNode | null} */
    Za.call(e)
  );
}
function f(e, t) {
  return /* @__PURE__ */ vr(e);
}
function ot(e, t = !1) {
  {
    var n = /* @__PURE__ */ vr(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ tr(n) : n;
  }
}
function b(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ tr(r);
  return r;
}
function Pi(e) {
  e.textContent = "";
}
function Qa() {
  return !1;
}
function Ci(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Ni(e) {
  ie === null && (le === null && Bs(), qs()), Vt && Hs();
}
function Oi(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Xt(e, t) {
  var n = ie;
  n !== null && (n.f & nt) !== 0 && (e |= nt);
  var r = {
    ctx: Ze,
    deps: null,
    nodes: null,
    f: e | De | xt,
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
  _e?.register_created_effect(r);
  var s = r;
  if ((e & Cn) !== 0)
    Tn !== null ? Tn.push(r) : an.ensure().schedule(r);
  else if (t !== null) {
    try {
      Fn(r);
    } catch (l) {
      throw ut(r), l;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & Dn) === 0 && (s = s.first, (e & Ot) !== 0 && (e & Nn) !== 0 && s !== null && (s.f |= Nn));
  }
  if (s !== null && (s.parent = n, n !== null && Oi(s, n), le !== null && (le.f & qe) !== 0 && (e & Yt) === 0)) {
    var i = (
      /** @type {Derived} */
      le
    );
    (i.effects ??= []).push(s);
  }
  return r;
}
function ea() {
  return le !== null && !Ft;
}
function xr(e) {
  const t = Xt(yr, null);
  return Ae(t, ze), t.teardown = e, t;
}
function sn(e) {
  Ni();
  var t = (
    /** @type {Effect} */
    ie.f
  ), n = !le && (t & kt) !== 0 && Ze !== null && !Ze.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Ze
    );
    (r.e ??= []).push(e);
  } else
    return es(e);
}
function es(e) {
  return Xt(Cn | Os, e);
}
function Ii(e) {
  an.ensure();
  const t = Xt(Yt | Dn, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? pn(t, () => {
      ut(t), r(void 0);
    }) : (ut(t), r(void 0));
  });
}
function ts(e) {
  return Xt(Cn, e);
}
function Fi(e) {
  return Xt(Rn | Dn, e);
}
function ns(e, t = 0) {
  return Xt(yr | t, e);
}
function q(e, t = [], n = [], r = []) {
  bi(r, t, n, (s) => {
    Xt(yr, () => {
      e(...s.map(a));
    });
  });
}
function ta(e, t = 0) {
  var n = Xt(Ot | t, e);
  return n;
}
function wt(e) {
  return Xt(kt | Dn, e);
}
function rs(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Vt, r = le;
    fa(!0), St(null);
    try {
      t.call(null);
    } finally {
      fa(n), St(r);
    }
  }
}
function na(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && jn(() => {
      s.abort(er);
    });
    var r = n.next;
    (n.f & Yt) !== 0 ? n.parent = null : ut(n, t), n = r;
  }
}
function Li(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & kt) === 0 && ut(t), t = n;
  }
}
function ut(e, t = !0) {
  var n = !1;
  (t || (e.f & Ns) !== 0) && e.nodes !== null && e.nodes.end !== null && (zi(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= zr, na(e, t && !n), Qn(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  rs(e), e.f ^= zr, e.f |= vt;
  var s = e.parent;
  s !== null && s.first !== null && as(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function zi(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ tr(e);
    e.remove(), e = n;
  }
}
function as(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function pn(e, t, n = !0) {
  var r = [];
  ss(e, r, !0);
  var s = () => {
    n && ut(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var l = () => --i || s();
    for (var u of r)
      u.out(l);
  } else
    s();
}
function ss(e, t, n) {
  if ((e.f & nt) === 0) {
    e.f ^= nt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var s = e.first; s !== null; ) {
      var i = s.next;
      if ((s.f & Yt) === 0) {
        var l = (s.f & Nn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (s.f & kt) !== 0 && (e.f & Ot) !== 0;
        ss(s, t, l ? n : !1);
      }
      s = i;
    }
  }
}
function pr(e) {
  is(e, !0);
}
function is(e, t) {
  if ((e.f & nt) !== 0) {
    e.f ^= nt, (e.f & ze) === 0 && (Ae(e, De), an.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & Nn) !== 0 || (n.f & kt) !== 0;
      is(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function ra(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ tr(n);
      t.append(n), n = s;
    }
}
let or = !1, Vt = !1;
function fa(e) {
  Vt = e;
}
let le = null, Ft = !1;
function St(e) {
  le = e;
}
let ie = null;
function qt(e) {
  ie = e;
}
let Ht = null;
function ls(e) {
  le !== null && (Ht ??= /* @__PURE__ */ new Set()).add(e);
}
let lt = null, ht = 0, mt = null;
function Di(e) {
  mt = e;
}
let os = 1, dn = 0, gn = dn;
function ha(e) {
  gn = e;
}
function us() {
  return ++os;
}
function nr(e) {
  var t = e.f;
  if ((t & De) !== 0)
    return !0;
  if (t & qe && (e.f &= ~_n), (t & Lt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (nr(
        /** @type {Derived} */
        i
      ) && $a(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & xt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    It === null && Ae(e, ze);
  }
  return !1;
}
function cs(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Ht !== null && Ht.has(e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & qe) !== 0 ? cs(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Ae(i, De) : (i.f & ze) !== 0 && Ae(i, Lt), Qr(
        /** @type {Effect} */
        i
      ));
    }
}
function ds(e) {
  var t = lt, n = ht, r = mt, s = le, i = Ht, l = Ze, u = Ft, o = gn, d = e.f;
  lt = /** @type {null | Value[]} */
  null, ht = 0, mt = null, le = (d & (kt | Yt)) === 0 ? e : null, Ht = null, On(e.ctx), Ft = !1, gn = ++dn, e.ac !== null && (jn(() => {
    e.ac.abort(er);
  }), e.ac = null);
  try {
    e.f |= dr;
    var g = (
      /** @type {Function} */
      e.fn
    ), m = g();
    e.f |= zn;
    var p = e.deps, h = _e?.is_fork;
    if (lt !== null) {
      var v;
      if (h || Qn(e, ht), p !== null && ht > 0)
        for (p.length = ht + lt.length, v = 0; v < lt.length; v++)
          p[ht + v] = lt[v];
      else
        e.deps = p = lt;
      if (ea() && (e.f & xt) !== 0)
        for (v = ht; v < p.length; v++)
          (p[v].reactions ??= []).push(e);
    } else !h && p !== null && ht < p.length && (Qn(e, ht), p.length = ht);
    if (za() && mt !== null && !Ft && p !== null && (e.f & (qe | Lt | De)) === 0)
      for (v = 0; v < /** @type {Source[]} */
      mt.length; v++)
        cs(
          mt[v],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (dn++, s.deps !== null)
        for (let y = 0; y < n; y += 1)
          s.deps[y].rv = dn;
      if (t !== null)
        for (const y of t)
          y.rv = dn;
      mt !== null && (r === null ? r = mt : r.push(.../** @type {Source[]} */
      mt));
    }
    return (e.f & rn) !== 0 && (e.f ^= rn), m;
  } catch (y) {
    return Da(y);
  } finally {
    e.f ^= dr, lt = t, ht = n, mt = r, le = s, Ht = i, On(l), Ft = u, gn = o;
  }
}
function ji(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Ts.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & qe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (lt === null || !ur.call(lt, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & xt) !== 0 && (i.f ^= xt, i.f &= ~_n), i.v !== Le && Kr(i), i.ac !== null && jn(() => {
      i.ac.abort(er), i.ac = null, Ae(i, De);
    }), xi(i), Qn(i, 0);
  }
}
function Qn(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      ji(e, n[r]);
}
function Fn(e) {
  var t = e.f;
  if ((t & vt) === 0) {
    Ae(e, ze);
    var n = ie, r = or;
    ie = e, or = (t & (kt | Yt)) === 0;
    try {
      (t & (Ot | Na)) !== 0 ? Li(e) : na(e), rs(e);
      var s = ds(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = os;
      var i;
    } finally {
      or = r, ie = n;
    }
  }
}
function a(e) {
  var t = e.f, n = (t & qe) !== 0;
  if (le !== null && !Ft) {
    var r = ie !== null && (ie.f & vt) !== 0;
    if (!r && (Ht === null || !Ht.has(e))) {
      var s = le.deps;
      if ((le.f & dr) !== 0)
        e.rv < dn && (e.rv = dn, lt === null && s !== null && s[ht] === e ? ht++ : lt === null ? lt = [e] : lt.push(e));
      else {
        le.deps ??= [], ur.call(le.deps, e) || le.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [le] : ur.call(i, le) || i.push(le);
      }
    }
  }
  if (Vt && vn.has(e))
    return vn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Vt) {
      var u = l.v;
      return ((l.f & ze) === 0 && l.reactions !== null || hs(l)) && (u = Jr(l)), vn.set(l, u), u;
    }
    var o = (l.f & xt) === 0 && !Ft && le !== null && (or || (le.f & xt) !== 0), d = (l.f & zn) === 0;
    nr(l) && (o && (l.f |= xt), $a(l)), o && !d && (Ua(l), fs(l));
  }
  if (It?.has(e))
    return It.get(e);
  if ((e.f & rn) !== 0)
    throw e.v;
  return e.v;
}
function fs(e) {
  if (e.f |= xt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & qe) !== 0 && (t.f & xt) === 0 && (Ua(
        /** @type {Derived} */
        t
      ), fs(
        /** @type {Derived} */
        t
      ));
}
function hs(e) {
  if (e.v === Le) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (vn.has(t) || (t.f & qe) !== 0 && hs(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function wn(e) {
  var t = Ft;
  try {
    return Ft = !0, e();
  } finally {
    Ft = t;
  }
}
const Hi = ["touchstart", "touchmove"];
function qi(e) {
  return Hi.includes(e);
}
const Yn = Symbol("events"), vs = /* @__PURE__ */ new Set(), $r = /* @__PURE__ */ new Set();
function Bi(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || Ur.call(t, i), !i.cancelBubble)
      return jn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Gt(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Pn(e, t, n, r, s) {
  var i = { capture: r, passive: s }, l = Bi(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && xr(() => {
    t.removeEventListener(e, l, i);
  });
}
function Q(e, t, n) {
  (t[Yn] ??= {})[e] = n;
}
function zt(e) {
  for (var t = 0; t < e.length; t++)
    vs.add(e[t]);
  for (var n of $r)
    n(e);
}
let va = null;
function Ur(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  va = e;
  var l = 0, u = va === e && e[Yn];
  if (u) {
    var o = s.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Yn] = t;
      return;
    }
    var d = s.indexOf(t);
    if (d === -1)
      return;
    o <= d && (l = o);
  }
  if (i = /** @type {Element} */
  s[l] || e.target, i !== t) {
    Ms(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = le, m = ie;
    St(null), qt(null);
    try {
      for (var p, h = []; i !== null && i !== t; ) {
        try {
          var v = i[Yn]?.[r];
          v != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && v.call(i, e);
        } catch (y) {
          p ? h.push(y) : p = y;
        }
        if (e.cancelBubble) break;
        l++, i = l < s.length ? (
          /** @type {Element} */
          s[l]
        ) : null;
      }
      if (p) {
        for (let y of h)
          queueMicrotask(() => {
            throw y;
          });
        throw p;
      }
    } finally {
      e[Yn] = t, delete e.currentTarget, St(g), qt(m);
    }
  }
}
const $i = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Ui(e) {
  return (
    /** @type {string} */
    $i?.createHTML(e) ?? e
  );
}
function Gi(e) {
  var t = Ci("template");
  return t.innerHTML = Ui(e.replaceAll("<!>", "<!---->")), t.content;
}
function gr(e, t) {
  var n = (
    /** @type {Effect} */
    ie
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function C(e, t) {
  var n = (t & ri) !== 0, r = (t & ai) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = Gi(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ vr(s)));
    var l = (
      /** @type {TemplateNode} */
      r || Ka ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ vr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      gr(u, o);
    } else
      gr(l, l);
    return l;
  };
}
function Mn(e = "") {
  {
    var t = Wt(e + "");
    return gr(t, t), t;
  }
}
function aa() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Wt();
  return e.append(t, n), gr(t, n), e;
}
function R(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function A(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[Hr] ??= e.nodeValue) && (e[Hr] = n, e.nodeValue = `${n}`);
}
function Wi(e, t) {
  return Yi(e, t);
}
const ar = /* @__PURE__ */ new Map();
function Yi(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: l = !0, transformError: u }) {
  Ri();
  var o = void 0, d = Ii(() => {
    var g = n ?? t.appendChild(Wt());
    gi(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (h) => {
        pt({});
        var v = (
          /** @type {ComponentContext} */
          Ze
        );
        i && (v.c = i), s && (r.$$events = s), o = e(h, r) || {}, gt();
      },
      u
    );
    var m = /* @__PURE__ */ new Set(), p = (h) => {
      for (var v = 0; v < h.length; v++) {
        var y = h[v];
        if (!m.has(y)) {
          m.add(y);
          var c = qi(y);
          for (const N of [t, document]) {
            var _ = ar.get(N);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), ar.set(N, _));
            var x = _.get(y);
            x === void 0 ? (N.addEventListener(y, Ur, { passive: c }), _.set(y, 1)) : _.set(y, x + 1);
          }
        }
      }
    };
    return p(wr(vs)), $r.add(p), () => {
      for (var h of m)
        for (const c of [t, document]) {
          var v = (
            /** @type {Map<string, number>} */
            ar.get(c)
          ), y = (
            /** @type {number} */
            v.get(h)
          );
          --y == 0 ? (c.removeEventListener(h, Ur), v.delete(h), v.size === 0 && ar.delete(c)) : v.set(h, y);
        }
      $r.delete(p), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return Vi.set(o, d), o;
}
let Vi = /* @__PURE__ */ new WeakMap();
class Xi {
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
        pr(r), this.#o.delete(n);
      else {
        var s = this.#e.get(n);
        s && (pr(s.effect), this.#i.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
      }
      for (const [i, l] of this.#t) {
        if (this.#t.delete(i), i === t)
          break;
        const u = this.#e.get(l);
        u && (ut(u.effect), this.#e.delete(l));
      }
      for (const [i, l] of this.#i) {
        if (i === n || this.#o.has(i)) continue;
        const u = () => {
          if (Array.from(this.#t.values()).includes(i)) {
            var d = document.createDocumentFragment();
            ra(l, d), d.append(Wt()), this.#e.set(i, { effect: l, fragment: d });
          } else
            ut(l);
          this.#o.delete(i), this.#i.delete(i);
        };
        this.#r || !r ? (this.#o.add(i), pn(l, u, !1)) : u();
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
      n.includes(r) || (ut(s.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      _e
    ), s = Qa();
    if (n && !this.#i.has(t) && !this.#e.has(t))
      if (s) {
        var i = document.createDocumentFragment(), l = Wt();
        i.append(l), this.#e.set(t, {
          effect: wt(() => n(l)),
          fragment: i
        });
      } else
        this.#i.set(
          t,
          wt(() => n(this.anchor))
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
function K(e, t, n = !1) {
  var r = new Xi(e), s = n ? Nn : 0;
  function i(l, u) {
    r.ensure(l, u);
  }
  ta(() => {
    var l = !1;
    t((u, o = 0) => {
      l = !0, i(o, u);
    }), l || i(-1, null);
  }, s);
}
function yt(e, t) {
  return t;
}
function Ki(e, t, n) {
  for (var r = [], s = t.length, i, l = t.length, u = 0; u < s; u++) {
    let m = t[u];
    pn(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var p = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Gr(e, wr(i.done)), p.delete(i), p.size === 0 && (e.outrogroups = null);
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
      Pi(g), g.append(d), e.items.clear();
    }
    Gr(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function Gr(e, t, n = !0) {
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
      i.f |= jt;
      const l = document.createDocumentFragment();
      ra(i, l);
    } else
      ut(t[s], n);
  }
}
var pa;
function Ge(e, t, n, r, s, i = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & Ia) !== 0;
  if (o) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild(Wt());
  }
  var g = null, m = /* @__PURE__ */ Ba(() => {
    var N = n();
    return (
      /** @type {V[]} */
      Xr(N) ? N : N == null ? [] : wr(N)
    );
  }), p, h = /* @__PURE__ */ new Map(), v = !0;
  function y(N) {
    (x.effect.f & vt) === 0 && (x.pending.delete(N), x.fallback = g, Ji(x, p, l, t, r), g !== null && (p.length === 0 ? (g.f & jt) === 0 ? pr(g) : (g.f ^= jt, Vn(g, null, l)) : pn(g, () => {
      g = null;
    })));
  }
  function c(N) {
    x.pending.delete(N);
  }
  var _ = ta(() => {
    p = /** @type {V[]} */
    a(m);
    for (var N = p.length, L = /* @__PURE__ */ new Set(), T = (
      /** @type {Batch} */
      _e
    ), z = Qa(), U = 0; U < N; U += 1) {
      var $ = p[U], B = r($, U), w = v ? null : u.get(B);
      w ? (w.v && In(w.v, $), w.i && In(w.i, U), z && T.unskip_effect(w.e)) : (w = Zi(
        u,
        v ? l : pa ??= Wt(),
        $,
        B,
        U,
        s,
        t,
        n
      ), v || (w.e.f |= jt), u.set(B, w)), L.add(B);
    }
    if (N === 0 && i && !g && (v ? g = wt(() => i(l)) : (g = wt(() => i(pa ??= Wt())), g.f |= jt)), N > L.size && js(), !v)
      if (h.set(T, L), z) {
        for (const [F, P] of u)
          L.has(F) || T.skip_effect(P.e);
        T.oncommit(y), T.ondiscard(c);
      } else
        y(T);
    a(m);
  }), x = { effect: _, items: u, pending: h, outrogroups: null, fallback: g };
  v = !1;
}
function Bn(e) {
  for (; e !== null && (e.f & kt) === 0; )
    e = e.next;
  return e;
}
function Ji(e, t, n, r, s) {
  var i = (r & Js) !== 0, l = t.length, u = e.items, o = Bn(e.effect.first), d, g = null, m, p = [], h = [], v, y, c, _;
  if (i)
    for (_ = 0; _ < l; _ += 1)
      v = t[_], y = s(v, _), c = /** @type {EachItem} */
      u.get(y).e, (c.f & jt) === 0 && (c.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(c));
  for (_ = 0; _ < l; _ += 1) {
    if (v = t[_], y = s(v, _), c = /** @type {EachItem} */
    u.get(y).e, e.outrogroups !== null)
      for (const w of e.outrogroups)
        w.pending.delete(c), w.done.delete(c);
    if ((c.f & nt) !== 0 && (pr(c), i && (c.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(c))), (c.f & jt) !== 0)
      if (c.f ^= jt, c === o)
        Vn(c, null, n);
      else {
        var x = g ? g.next : o;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), en(e, g, c), en(e, c, x), Vn(c, x, n), g = c, p = [], h = [], o = Bn(g.next);
        continue;
      }
    if (c !== o) {
      if (d !== void 0 && d.has(c)) {
        if (p.length < h.length) {
          var N = h[0], L;
          g = N.prev;
          var T = p[0], z = p[p.length - 1];
          for (L = 0; L < p.length; L += 1)
            Vn(p[L], N, n);
          for (L = 0; L < h.length; L += 1)
            d.delete(h[L]);
          en(e, T.prev, z.next), en(e, g, T), en(e, z, N), o = N, g = z, _ -= 1, p = [], h = [];
        } else
          d.delete(c), Vn(c, o, n), en(e, c.prev, c.next), en(e, c, g === null ? e.effect.first : g.next), en(e, g, c), g = c;
        continue;
      }
      for (p = [], h = []; o !== null && o !== c; )
        (d ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = Bn(o.next);
      if (o === null)
        continue;
    }
    (c.f & jt) === 0 && p.push(c), g = c, o = Bn(c.next);
  }
  if (e.outrogroups !== null) {
    for (const w of e.outrogroups)
      w.pending.size === 0 && (Gr(e, wr(w.done)), e.outrogroups?.delete(w));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || d !== void 0) {
    var U = [];
    if (d !== void 0)
      for (c of d)
        (c.f & nt) === 0 && U.push(c);
    for (; o !== null; )
      (o.f & nt) === 0 && o !== e.fallback && U.push(o), o = Bn(o.next);
    var $ = U.length;
    if ($ > 0) {
      var B = (r & Ia) !== 0 && l === 0 ? n : null;
      if (i) {
        for (_ = 0; _ < $; _ += 1)
          U[_].nodes?.a?.measure();
        for (_ = 0; _ < $; _ += 1)
          U[_].nodes?.a?.fix();
      }
      Ki(e, U, B);
    }
  }
  i && Gt(() => {
    if (m !== void 0)
      for (c of m)
        c.nodes?.a?.apply();
  });
}
function Zi(e, t, n, r, s, i, l, u) {
  var o = (l & Xs) !== 0 ? (l & Zs) === 0 ? /* @__PURE__ */ Ei(n, !1, !1) : bn(n) : null, d = (l & Ks) !== 0 ? bn(s) : null;
  return {
    v: o,
    i: d,
    e: wt(() => (i(t, o ?? n, d ?? s, u), () => {
      e.delete(r);
    }))
  };
}
function Vn(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & jt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ tr(r)
      );
      if (i.before(r), r === s)
        return;
      r = l;
    }
}
function en(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function $n(e, t, n) {
  ts(() => {
    var r = wn(() => t(e, n?.()) || {});
    if (r?.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
const ga = [...` 	
\r\f \v\uFEFF`];
function Qi(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s of Object.keys(n))
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var i = s.length, l = 0; (l = r.indexOf(s, l)) >= 0; ) {
          var u = l + i;
          (l === 0 || ga.includes(r[l - 1])) && (u === r.length || ga.includes(r[u])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(u + 1) : l = u;
        }
  }
  return r === "" ? null : r;
}
function _a(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var s of Object.keys(e)) {
    var i = e[s];
    i != null && i !== "" && (r += " " + s + ": " + i + n);
  }
  return r;
}
function el(e, t) {
  if (t) {
    var n = "", r, s;
    return Array.isArray(t) ? (r = t[0], s = t[1]) : r = t, r && (n += _a(r)), s && (n += _a(s, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function xe(e, t, n, r, s, i) {
  var l = (
    /** @type {any} */
    e[Dr]
  );
  if (l !== n || l === void 0) {
    var u = Qi(n, r, i);
    u == null ? e.removeAttribute("class") : e.className = u, e[Dr] = n;
  } else if (i && s !== i)
    for (var o in i) {
      var d = !!i[o];
      (s == null || d !== !!s[o]) && e.classList.toggle(o, d);
    }
  return i;
}
function Rr(e, t = {}, n, r) {
  for (var s in n) {
    var i = n[s];
    t[s] !== i && (n[s] == null ? e.style.removeProperty(s) : e.style.setProperty(s, i, r));
  }
}
function fn(e, t, n, r) {
  var s = (
    /** @type {any} */
    e[jr]
  );
  if (s !== t) {
    var i = el(t, r);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[jr] = t;
  } else r && (Array.isArray(r) ? (Rr(e, n?.[0], r[0]), Rr(e, n?.[1], r[1], "important")) : Rr(e, n, r));
  return r;
}
function Xn(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Xr(t))
      return li();
    for (var r of e.options)
      r.selected = t.includes(ba(r));
    return;
  }
  for (r of e.options) {
    var s = ba(r);
    if (Ai(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function sr(e) {
  var t = new MutationObserver(() => {
    "__value" in e && Xn(e, e.__value);
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
  }), xr(() => {
    t.disconnect();
  });
}
function ba(e) {
  return "__value" in e ? e.__value : e.value;
}
const tl = Symbol("is custom element"), nl = Symbol("is html"), rl = Ls ? "progress" : "PROGRESS";
function un(e, t) {
  var n = sa(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== rl) || (e.value = t ?? "");
}
function al(e, t) {
  var n = sa(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function ae(e, t, n, r) {
  var s = sa(e);
  s[t] !== (s[t] = n) && (t === "loading" && (e[Fs] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && sl(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function sa(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[Oa] ??= {
      [tl]: e.nodeName.includes("-"),
      [nl]: e.namespaceURI === si
    }
  );
}
var ma = /* @__PURE__ */ new Map();
function sl(e) {
  var t = e.getAttribute("is") || e.nodeName, n = ma.get(t);
  if (n) return n;
  ma.set(t, n = []);
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = As(s);
    for (var l in r)
      r[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    s = Pa(s);
  }
  return n;
}
function Pr(e, t) {
  return e === t || e?.[hn] === t;
}
function _r(e = {}, t, n, r) {
  var s = (
    /** @type {ComponentContext} */
    Ze.r
  ), i = (
    /** @type {Effect} */
    ie
  );
  return ts(() => {
    var l, u;
    return ns(() => {
      l = u, u = [], wn(() => {
        Pr(n(...u), e) || (t(e, ...u), l && Pr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== s && o.parent !== null && o.parent.f & zr; )
        o = o.parent;
      const d = () => {
        u && Pr(n(...u), e) && t(null, ...u);
      }, g = o.teardown;
      o.teardown = () => {
        d(), g?.();
      };
    };
  }), e;
}
function Wr(e, t) {
  hi(window, ["resize"], () => jn(() => t(window[e])));
}
function re(e, t, n, r) {
  var s = !0, i = (n & ti) !== 0, l = (n & ni) !== 0, u = (
    /** @type {V} */
    r
  ), o = !0, d = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && s ? (d ??= /* @__PURE__ */ Zn(
    /** @type {() => V} */
    r
  ), a(d)) : (o && (o = !1, u = l ? wn(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), u);
  let m;
  if (i) {
    var p = hn in e || Is in e;
    m = An(e, t)?.set ?? (p && t in e ? (L) => e[t] = L : void 0);
  }
  var h, v = !1;
  i ? [h, v] = fi(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && r !== void 0 && (h = g(), m && (Us(), m(h)));
  var y;
  if (y = () => {
    var L = (
      /** @type {V} */
      e[t]
    );
    return L === void 0 ? g() : (o = !0, L);
  }, (n & ei) === 0)
    return y;
  if (m) {
    var c = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(L, T) {
        return arguments.length > 0 ? ((!T || c || v) && m(T ? y() : L), L) : y();
      })
    );
  }
  var _ = !1, x = ((n & Qs) !== 0 ? Zn : Ba)(() => (_ = !1, y()));
  i && a(x);
  var N = (
    /** @type {Effect} */
    ie
  );
  return (
    /** @type {() => V} */
    (function(L, T) {
      if (arguments.length > 0) {
        const z = T ? a(x) : i ? Ie(L) : L;
        return E(x, z), _ = !0, u !== void 0 && (u = z), L;
      }
      return Vt && _ || (N.f & vt) !== 0 ? x.v : a(x);
    })
  );
}
function Hn(e) {
  Ze === null && zs(), sn(() => {
    const t = wn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const il = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(il);
function ll(e) {
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
async function $t(e, t = {}) {
  const n = await fetch(e + ll(t));
  if (!n.ok) {
    const r = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  }
  return n.json();
}
async function Sn(e, t) {
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
function wa(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const Oe = {
  // --- reads
  photos: (e) => $t("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => $t("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => $t("/api/triage/counts", { ...wa(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => $t("/api/triage/files"),
  screen: (e, t = {}) => $t("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => $t("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => $t("/api/triage/page", { ...wa(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => $t("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => Sn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => Sn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => Sn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => Sn("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => Sn("/api/reveal", { id: e }),
  revealOrigin: (e) => Sn("/api/reveal", { origin: e }),
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
  rebuildStatus: () => $t("/api/triage/rebuild")
};
function ol() {
  let e = 0, t = 0;
  return async function(r) {
    const s = ++e, i = await r();
    return s <= t ? { stale: !0, value: void 0 } : (t = s, { stale: !1, value: i });
  };
}
function ul(e, t) {
  let n = 0;
  const r = (...s) => {
    clearTimeout(n), n = setTimeout(() => e(...s), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...s) => {
    clearTimeout(n), e(...s);
  }, r;
}
const ya = ["B", "KB", "MB", "GB", "TB"];
function Ct(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < ya.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${ya[n]}`;
}
function Ce(e) {
  return (Number(e) || 0).toLocaleString();
}
const Ln = "G:\\photos", xa = [
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
      value: t ? `${Ln}\\${t}\\${e.key}` : `${Ln}\\${e.key}`
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
function ps(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), r = Ln.toLowerCase();
  return n.toLowerCase().startsWith(r + "\\") ? n : "";
}
function ia(e, t) {
  const n = t.toLowerCase();
  return e.some((r) => n === r || n.startsWith(r + "\\"));
}
function cl(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function dl(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function gs(e, t) {
  if (!t) return null;
  const n = e.find(
    (r) => r.term && r.term.column === t.column && r.term.op === t.op && dl(r.term.value, t.value)
  );
  return n ? n.decision : null;
}
var fl = /* @__PURE__ */ C('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), hl = /* @__PURE__ */ C('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), vl = /* @__PURE__ */ C('<div class="line muted svelte-1vgp6n7">…</div>'), pl = /* @__PURE__ */ C('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), gl = /* @__PURE__ */ C('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), _l = /* @__PURE__ */ C('<div class="line muted svelte-1vgp6n7"> </div>'), bl = /* @__PURE__ */ C('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function ml(e, t) {
  pt(t, !0);
  let n = re(t, "counts", 3, null), r = re(t, "files", 3, null), s = re(t, "filesAt", 3, null), i = re(t, "stale", 3, !1), l = re(t, "candidate", 3, null), u = re(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ne(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = bl(), g = f(d);
  let m;
  var p = b(f(g), 2);
  {
    var h = (B) => {
      var w = hl(), F = ot(w), P = f(F), D = f(P), Z = b(P, 2), Y = f(Z), G = b(Z, 4), te = f(G), oe = b(G, 2), X = f(oe), j = b(F, 2);
      {
        var I = (V) => {
          var S = fl(), k = b(f(S), 2), O = f(k), ue = b(k, 2), ye = f(ue), de = b(ue, 4), fe = f(de), Se = b(de, 2), he = f(Se), Ne = b(Se, 2), We = f(Ne);
          q(
            (Ee, rt, ce, se, Re) => {
              A(O, `kept ${Ee ?? ""}`), A(ye, rt), A(fe, `excluded ${ce ?? ""}`), A(he, se), A(We, `${a(o) >= 0 ? "+" : ""}${Re ?? ""} excluded`);
            },
            [
              () => Ce(n().candidate_kept_paths),
              () => Ct(n().candidate_kept_bytes),
              () => Ce(n().candidate_excluded_paths),
              () => Ct(n().candidate_excluded_bytes),
              () => Ce(a(o))
            ]
          ), R(V, S);
        };
        K(j, (V) => {
          l() && V(I);
        });
      }
      q(
        (V, S, k, O) => {
          A(D, `kept ${V ?? ""}`), A(Y, S), A(te, `excluded ${k ?? ""}`), A(X, O);
        },
        [
          () => Ce(n().kept_paths),
          () => Ct(n().kept_bytes),
          () => Ce(n().excluded_paths),
          () => Ct(n().excluded_bytes)
        ]
      ), R(B, w);
    }, v = (B) => {
      var w = vl();
      R(B, w);
    };
    K(p, (B) => {
      n() ? B(h) : B(v, -1);
    });
  }
  var y = b(g, 2);
  let c;
  var _ = f(y), x = b(f(_), 3), N = f(x), L = b(x, 2);
  {
    var T = (B) => {
      var w = pl();
      R(B, w);
    };
    K(L, (B) => {
      i() && r() && r() !== "loading" && B(T);
    });
  }
  var z = b(_, 2);
  {
    var U = (B) => {
      var w = gl(), F = ot(w);
      let P;
      var D = f(F), Z = f(D), Y = b(D, 2), G = f(Y), te = b(Y, 4), oe = f(te), X = b(te, 2), j = f(X), I = b(F, 2), V = f(I);
      q(
        (S, k, O, ue) => {
          P = xe(F, 1, "line svelte-1vgp6n7", null, P, { outdated: i() }), A(Z, `kept ${S ?? ""}`), A(G, k), A(oe, `excluded ${O ?? ""}`), A(j, ue), A(V, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Ce(r().kept_files),
          () => Ct(r().kept_bytes),
          () => Ce(r().excluded_files),
          () => Ct(r().excluded_bytes)
        ]
      ), R(B, w);
    }, $ = (B) => {
      var w = _l(), F = f(w);
      q(() => A(F, r() === "loading" ? "counting…" : "not counted yet")), R(B, w);
    };
    K(z, (B) => {
      r() && r() !== "loading" ? B(U) : B($, -1);
    });
  }
  q(() => {
    m = xe(g, 1, "block svelte-1vgp6n7", null, m, { busy: u() }), c = xe(y, 1, "block svelte-1vgp6n7", null, c, { busy: r() === "loading" }), x.disabled = r() === "loading", A(N, r() === "loading" ? "counting…" : "recount");
  }), Q("click", x, function(...B) {
    t.onfiles?.apply(this, B);
  }), R(e, d), gt();
}
zt(["click"]);
const Yr = "http://www.w3.org/2000/svg", cn = {
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
}, nn = {
  ...cn,
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
}, wl = [
  { dark: "tint", light: "tintLight", base: cn },
  { dark: "control", light: "controlLight", base: nn },
  { dark: "ink", light: "inkLight", base: nn },
  { dark: "tally", light: "tallyLight", base: nn },
  { dark: "tallyInk", light: "tallyInkLight", base: nn }
], Vr = /* @__PURE__ */ new Set();
let Nt = { ...nn };
function yl() {
  return Nt;
}
function Cr(e) {
  Nt = Sl(e), la();
  for (const t of Vr) t(Nt);
  return Nt;
}
function xl(e) {
  return Vr.add(e), () => Vr.delete(e);
}
function Kn(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function kl(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: je(Kn(e.r, t.r), 0, 255),
    g: je(Kn(e.g, t.g), 0, 255),
    b: je(Kn(e.b, t.b), 0, 255),
    a: je(Kn(e.a, t.a), 0, 1)
  };
}
function Sl(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [r, s] of Object.entries(nn))
    typeof s == "boolean" ? n[r] = t[r] === void 0 ? s : !!t[r] : typeof s == "object" ? n[r] = kl(t[r], s) : n[r] = Kn(t[r], s);
  return n;
}
function bt({ r: e, g: t, b: n, a: r }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Me(r, 3)})`;
}
function Me(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function ka({ r: e, g: t, b: n, a: r }) {
  return { r: e, g: t, b: n, a: je(r * 1.7 + 0.22, 0, 1) };
}
function Sa(e, t) {
  const n = 0.4 + je(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - je(t, 0, 100) / 100) };
}
function Ea(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, s = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? je(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * s * Math.max(t.glareFactor, 0) / 100;
  return je(i ** (0.1 + je(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const El = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function Tl(e, t, n) {
  const r = je(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), u = s - l, o = i - l, d = 8, g = [];
  for (let h = 0; h <= d; h++) {
    const v = h / d * (Math.PI / 2);
    g.push([l * Math.cos(v) ** (2 / r), l * Math.sin(v) ** (2 / r)]);
  }
  const m = [], p = (h, v, y, c) => {
    let _ = Math.atan2(h, -v);
    _ < 0 && (_ += Math.PI * 2);
    let x = Math.atan2(c, y);
    x < 0 && (x += Math.PI * 2);
    const N = Me(Ea(x, n), 3);
    m.push(`rgba(255, 255, 255, ${N}) ${Me(_ / (Math.PI * 2) * 100, 2)}%`);
  };
  p(0, -i, 0, 1);
  for (const [h, v, y] of El)
    for (let c = 0; c <= d; c++) {
      const [_, x] = g[y ? d - c : c];
      p(h * (u + _), v * (o + x), h * _ ** (r - 1), -v * x ** (r - 1));
    }
  return m.push(`rgba(255, 255, 255, ${Me(Ea(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function la() {
  const e = Nt, t = document.documentElement.style, n = Sa(e.refFresnelRange, e.refFresnelHardness), r = Sa(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Me(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Me(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", bt(e.tint)), t.setProperty("--glass-tint-light", bt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", bt(ka(e.tint))), t.setProperty("--glass-tint-sheet-light", bt(ka(e.tintLight))), t.setProperty("--glass-ctl-dark", bt(e.control)), t.setProperty("--glass-ctl-light", bt(e.controlLight)), t.setProperty("--glass-text-dark", bt(e.ink)), t.setProperty("--glass-text-light", bt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", bt(e.tally)), t.setProperty("--glass-tint-tally-light", bt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", bt(e.tallyInk)), t.setProperty("--glass-text-tally-light", bt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Me(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Me(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Me(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Me(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Me(e.shadowX)}px ${Me(-e.shadowY)}px ${Me(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Me(je(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Me(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Me(Math.log2(je(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Me(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Me(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Me(je(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Me(r.width)}px`), t.setProperty("--glass-glare-blur", `${Me(r.blur)}px`);
}
function je(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function Ml(e, t, n, r, s, i) {
  const l = Math.abs(e) - n + s, u = Math.abs(t) - r + s, o = Math.max(l, 0), d = Math.max(u, 0), g = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + g - s;
}
function Al(e, t, n) {
  const r = e / 2, s = t / 2, i = je(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (p, h) => Ml(p - r, h - s, r, s, l, i), g = 256, m = new Float32Array(g + 1);
  for (let p = 0; p <= g; p++) {
    const h = 1 - p / g, v = Math.asin(je(h * h, 0, 1)), y = Math.asin(je(Math.sin(v) / o, 0, 1));
    m[p] = Math.tan(v - y) * u;
  }
  return (p, h) => {
    const v = -d(p, h);
    if (v < 0 || v >= u) return null;
    const y = m[Math.round(v / u * g)];
    if (y === 0) return null;
    const c = 0.75, _ = d(p + c, h) - d(p - c, h), x = d(p, h + c) - d(p, h - c), N = Math.hypot(_, x);
    if (N === 0) return null;
    const L = -y / N;
    return { dx: _ * L, dy: x * L };
  };
}
function Rl(e, t, n) {
  const r = document.createElement("canvas");
  r.width = e, r.height = t;
  const s = r.getContext("2d"), i = s.createImageData(e, t), l = i.data, u = e * t, o = new Float32Array(u), d = new Float32Array(u);
  let g = 0;
  for (let p = 0; p < t; p++)
    for (let h = 0; h < e; h++) {
      const v = n(h + 0.5, p + 0.5);
      if (!v) continue;
      const y = p * e + h;
      o[y] = v.dx, d[y] = v.dy;
      const c = Math.hypot(v.dx, v.dy);
      c > g && (g = c);
    }
  const m = g > 0 ? 127 / g : 0;
  for (let p = 0; p < u; p++) {
    const h = p * 4;
    l[h] = 128 + je(Math.round(o[p] * m), -127, 127), l[h + 1] = 128 + je(Math.round(d[p] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: r.toDataURL(), scale: g * 2 };
}
const Nr = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function Or(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Me(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let Un = null, Pl = 0;
function Cl() {
  if (Un) return Un;
  const e = document.createElementNS(Yr, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), Un = document.createElementNS(Yr, "defs"), e.appendChild(Un), document.body.appendChild(e), Un;
}
function Gn(e) {
  const t = `glass-refract-${++Pl}`, n = document.createElementNS(Yr, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), Cl().appendChild(n);
  let r = 0, s = 0, i = 0, l = 0;
  const u = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, d = "";
  function g() {
    e.style.setProperty("--glass-pre", Nt.blurEdge ? "" : d), e.style.setProperty("--glass-post", Nt.blurEdge ? d : "");
  }
  function m() {
    r < 2 || s < 2 || e.style.setProperty("--glass-glare", Tl(r, s, Nt));
  }
  function p() {
    if (r < 2 || s < 2) return;
    const c = Nt, _ = Rl(r, s, Al(r, s, c)), x = c.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(r)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${r}" height="${s}" preserveAspectRatio="none" href="${_.url}" result="map"/>` + Or(_.scale * (1 + x), Nr[0], "r") + Or(_.scale, Nr[1], "g") + Or(_.scale * (1 - x), Nr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", g()), o = u.map((N) => Nt[N]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, p();
    }));
  }
  const v = new ResizeObserver(([c]) => {
    const _ = c.borderBoxSize?.[0], x = _ ? { w: Math.round(_.inlineSize), h: Math.round(_.blockSize) } : { w: Math.round(c.contentRect.width), h: Math.round(c.contentRect.height) };
    x.w === r && x.h === s || (r = x.w, s = x.h, m(), h());
  });
  v.observe(e);
  const y = xl(() => {
    m(), u.map((c) => Nt[c]).join(" ") !== o ? h() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), y(), v.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const _s = "photos.stack", Ir = { on: !1, window: 4 }, bs = 1, ms = 10;
function Nl() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(_s) ?? "");
  } catch {
    return { ...Ir };
  }
  if (e === null || typeof e != "object") return { ...Ir };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= bs && t <= ms ? t : Ir.window
  };
}
function Ol(e) {
  return localStorage.setItem(_s, JSON.stringify({ on: e.on, window: e.window })), e;
}
const ws = "photos.theme", ys = "dark";
function xs() {
  return document.documentElement.dataset.theme === "light" ? "light" : ys;
}
function Il() {
  const e = localStorage.getItem(ws), t = e === "dark" || e === "light" ? e : ys;
  return document.documentElement.dataset.theme = t, t;
}
function ks(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(ws, e), e;
}
var Fl = /* @__PURE__ */ C('<span class="spin svelte-zne36e" aria-label="loading"></span>'), Ta = /* @__PURE__ */ C('<span class="badge svelte-zne36e"> </span>'), Ll = /* @__PURE__ */ C('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), zl = /* @__PURE__ */ C('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), Dl = /* @__PURE__ */ C("<button> </button>"), jl = /* @__PURE__ */ C('<div class="glass sheet sorts svelte-zne36e"></div>'), Hl = /* @__PURE__ */ C(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), ql = /* @__PURE__ */ C('<p class="muted svelte-zne36e">loading…</p>'), Bl = /* @__PURE__ */ C('<span class="help svelte-zne36e">?</span>'), $l = /* @__PURE__ */ C('<span class="n svelte-zne36e"> </span>'), Ul = /* @__PURE__ */ C("<button> <!></button>"), Gl = /* @__PURE__ */ C('<span class="muted svelte-zne36e">nothing here</span>'), Wl = /* @__PURE__ */ C('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Yl = /* @__PURE__ */ C('<div class="glass sheet filters svelte-zne36e"><!></div>'), Vl = /* @__PURE__ */ C('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function Xl(e, t) {
  pt(t, !0);
  let n = re(t, "facets", 3, null), r = re(t, "selected", 19, () => ({})), s = re(t, "sort", 3, "newest"), i = re(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = re(t, "total", 3, null), u = re(t, "tiles", 3, null), o = re(t, "loading", 3, !1), d = re(t, "onselect", 3, () => {
  }), g = re(t, "onsort", 3, () => {
  }), m = re(t, "onstack", 3, () => {
  }), p = re(t, "onclear", 3, () => {
  }), h = re(t, "ontriage", 3, () => {
  }), v = /* @__PURE__ */ W(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), y = /* @__PURE__ */ W(Ie(xs())), c = /* @__PURE__ */ W(null);
  const _ = /* @__PURE__ */ ne(() => u() ?? l()), x = /* @__PURE__ */ ne(() => n()?.dimensions ?? []), N = /* @__PURE__ */ ne(() => n()?.sorts ?? []), L = /* @__PURE__ */ ne(() => a(N).find((H) => H.value === s())?.label ?? s()), T = /* @__PURE__ */ ne(() => Object.values(r()).reduce((H, ee) => H + ee.length, 0)), z = /* @__PURE__ */ ne(() => a(x).flatMap((H) => (r()[H.name] ?? []).map((ee) => ({
    dimension: H.name,
    value: ee,
    title: H.title,
    label: H.options.find((pe) => pe.value === ee)?.label ?? String(ee)
  }))));
  function U(H, ee) {
    const pe = r()[H] ?? [], Te = pe.includes(ee) ? pe.filter((me) => me !== ee) : [...pe, ee];
    d()(H, Te);
  }
  function $(H, ee) {
    return (r()[H] ?? []).includes(ee);
  }
  function B() {
    E(y, ks(a(y) === "dark" ? "light" : "dark"), !0);
  }
  let w = /* @__PURE__ */ W(null);
  const F = /* @__PURE__ */ ne(() => a(w) ?? i().window);
  function P(H) {
    E(w, Number(H), !0);
  }
  function D(H) {
    E(w, null), m()({ ...i(), window: Number(H) });
  }
  sn(() => {
    a(v) !== "stacks" && E(w, null);
  });
  function Z(H) {
    H.key === "Escape" && E(v, "");
  }
  function Y(H) {
    a(v) && !H.target.closest(".topbar") && E(v, "");
  }
  Hn(() => {
    const H = new ResizeObserver(([ee]) => {
      const pe = Math.round(ee.borderBoxSize?.[0]?.blockSize ?? ee.contentRect.height);
      document.documentElement.style.setProperty("--header-h", pe + "px");
    });
    return H.observe(a(c)), () => {
      H.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var G = Vl();
  Pn("keydown", mn, Z), Pn("pointerdown", mn, Y);
  var te = f(G), oe = f(te), X = f(oe), j = b(oe, 2), I = f(j), V = b(j, 2);
  {
    var S = (H) => {
      var ee = Fl();
      R(H, ee);
    };
    K(V, (H) => {
      o() && H(S);
    });
  }
  $n(te, (H) => Gn?.(H));
  var k = b(te, 2), O = f(k), ue = f(O), ye = f(ue);
  let de;
  var fe = f(ye), Se = b(ye, 2);
  let he;
  var Ne = b(f(Se));
  {
    var We = (H) => {
      var ee = Ta(), pe = f(ee);
      q(() => A(pe, a(T))), R(H, ee);
    };
    K(Ne, (H) => {
      a(T) && H(We);
    });
  }
  var Ee = b(Se, 2);
  let rt;
  var ce = b(f(Ee));
  {
    var se = (H) => {
      var ee = Ta(), pe = f(ee);
      q((Te) => A(pe, Te), [() => Ce(l())]), R(H, ee);
    };
    K(ce, (H) => {
      i().on && l() !== null && H(se);
    });
  }
  var Re = b(Ee, 2);
  {
    var Pe = (H) => {
      var ee = zl(), pe = f(ee);
      Ge(pe, 17, () => a(z), (me) => me.dimension + " " + me.value, (me, ve) => {
        var we = Ll(), Ye = f(we), at = f(Ye), ge = b(Ye, 1, !0);
        q(() => {
          ae(we, "title", `${a(ve).title ?? ""}: ${a(ve).label ?? ""} — click to remove`), A(at, a(ve).title), A(ge, a(ve).label);
        }), Q("click", we, () => U(a(ve).dimension, a(ve).value)), R(me, we);
      });
      var Te = b(pe, 2);
      Q("click", Te, () => p()()), R(H, ee);
    };
    K(Re, (H) => {
      a(z).length && H(Pe);
    });
  }
  var Fe = b(ue, 2), Qe = f(Fe), ct = b(Fe, 2);
  $n(O, (H) => Gn?.(H));
  var Et = b(O, 2);
  {
    var Dt = (H) => {
      var ee = jl();
      Ge(ee, 21, () => a(N), yt, (pe, Te) => {
        var me = Dl();
        let ve;
        var we = f(me);
        q(() => {
          ve = xe(me, 1, "option svelte-zne36e", null, ve, { on: a(Te).value === s() }), A(we, a(Te).label);
        }), Q("click", me, () => {
          g()(a(Te).value), E(v, "");
        }), R(pe, me);
      }), $n(ee, (pe) => Gn?.(pe)), R(H, ee);
    };
    K(Et, (H) => {
      a(v) === "sort" && H(Dt);
    });
  }
  var Bt = b(Et, 2);
  {
    var _t = (H) => {
      var ee = Hl(), pe = f(ee), Te = b(f(pe), 2), me = f(Te);
      let ve;
      var we = f(me), Ye = b(pe, 2), at = b(f(Ye), 2), ge = f(at), He = b(ge, 2), Mt = f(He);
      $n(ee, (Be) => Gn?.(Be)), q(() => {
        ve = xe(me, 1, "option svelte-zne36e", null, ve, { on: i().on }), ae(me, "aria-checked", i().on), A(we, i().on ? "On" : "Off"), ae(ge, "min", bs), ae(ge, "max", ms), un(ge, a(F)), ae(ge, "aria-valuetext", `${a(F) ?? ""} seconds`), A(Mt, `${a(F) ?? ""}s`);
      }), Q("click", me, () => m()({ ...i(), on: !i().on })), Q("input", ge, (Be) => P(Be.currentTarget.value)), Q("change", ge, (Be) => D(Be.currentTarget.value)), R(H, ee);
    };
    K(Bt, (H) => {
      a(v) === "stacks" && H(_t);
    });
  }
  var et = b(Bt, 2);
  {
    var Tt = (H) => {
      var ee = Yl(), pe = f(ee);
      {
        var Te = (ve) => {
          var we = ql();
          R(ve, we);
        }, me = (ve) => {
          var we = aa(), Ye = ot(we);
          Ge(Ye, 17, () => a(x), yt, (at, ge) => {
            var He = Wl(), Mt = f(He), Be = f(Mt), M = b(Be);
            {
              var J = (Ve) => {
                var Ue = Bl();
                q(() => ae(Ue, "title", a(ge).hint)), R(Ve, Ue);
              };
              K(M, (Ve) => {
                a(ge).hint && Ve(J);
              });
            }
            var be = b(Mt, 2), $e = f(be);
            Ge($e, 17, () => a(ge).options, yt, (Ve, Ue) => {
              var Xe = Ul();
              let ln;
              var on = f(Xe), Ke = b(on);
              {
                var ft = (st) => {
                  var Rt = $l(), Kt = f(Rt);
                  q((Jt) => A(Kt, Jt), [() => Ce(a(Ue).count)]), R(st, Rt);
                };
                K(Ke, (st) => {
                  a(Ue).count !== null && st(ft);
                });
              }
              q(
                (st) => {
                  ln = xe(Xe, 1, "option svelte-zne36e", null, ln, st), A(on, `${a(Ue).label ?? ""} `);
                },
                [
                  () => ({ on: $(a(ge).name, a(Ue).value) })
                ]
              ), Q("click", Xe, () => U(a(ge).name, a(Ue).value)), R(Ve, Xe);
            });
            var dt = b($e, 2);
            {
              var At = (Ve) => {
                var Ue = Gl();
                R(Ve, Ue);
              };
              K(dt, (Ve) => {
                a(ge).options.length || Ve(At);
              });
            }
            q(() => A(Be, `${a(ge).title ?? ""} `)), R(at, He);
          }), R(ve, we);
        };
        K(pe, (ve) => {
          n() ? ve(me, -1) : ve(Te);
        });
      }
      $n(ee, (ve) => Gn?.(ve)), R(H, ee);
    };
    K(et, (H) => {
      a(v) === "filters" && H(Tt);
    });
  }
  _r(G, (H) => E(c, H), () => a(c)), q(
    (H) => {
      A(X, H), A(I, a(_) === 1 ? "photo" : "photos"), de = xe(ye, 1, "menu svelte-zne36e", null, de, { open: a(v) === "sort" }), ae(ye, "aria-expanded", a(v) === "sort"), A(fe, a(L)), he = xe(Se, 1, "menu svelte-zne36e", null, he, { open: a(v) === "filters", on: a(T) > 0 }), ae(Se, "aria-expanded", a(v) === "filters"), rt = xe(Ee, 1, "menu svelte-zne36e", null, rt, { open: a(v) === "stacks", on: i().on }), ae(Ee, "aria-expanded", a(v) === "stacks"), ae(Fe, "title", a(y) === "dark" ? "Switch to a white background" : "Switch to a black background"), ae(Fe, "aria-label", a(y) === "dark" ? "Switch to a white background" : "Switch to a black background"), A(Qe, a(y) === "dark" ? "☀" : "☾");
    },
    [() => a(_) === null ? "…" : Ce(a(_))]
  ), Q("click", ye, () => E(v, a(v) === "sort" ? "" : "sort", !0)), Q("click", Se, () => E(v, a(v) === "filters" ? "" : "filters", !0)), Q("click", Ee, () => E(v, a(v) === "stacks" ? "" : "stacks", !0)), Q("click", Fe, B), Q("click", ct, () => h()()), R(e, G), gt();
}
zt(["click", "input", "change"]);
const Pt = 4, br = 220, Kl = 340;
function mr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Jl(e, t, n, r, s) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, u = 0, o = 1 / 0;
    for (; l < e.length && (u += mr(e[l]), l++, o = (n - Pt * (l - i - 1)) / u, !(o <= br)); )
      ;
    if (o > br && !r) break;
    s(i, l, Math.round(Math.min(o, Kl))), i = l;
  }
  return i;
}
function Zl(e, t, n) {
  const r = [];
  let s = 0;
  for (let i = e.from; i < e.to; i++) {
    const u = i === e.to - 1 ? n - s : Math.round(mr(t[i]) * e.height);
    r.push({ index: i, x: s, w: u }), s += u + Pt;
  }
  return r;
}
function Ma(e, t, n) {
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
var Ql = /* @__PURE__ */ C('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), eo = /* @__PURE__ */ C('<div class="glass pane svelte-5g1i2z" role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div></div>');
function to(e, t) {
  pt(t, !0);
  let n = re(t, "frames", 19, () => []), r = re(t, "origin", 3, null), s = re(t, "onreveal", 3, () => {
  }), i = re(t, "onclose", 3, () => {
  });
  const l = 40;
  let u = /* @__PURE__ */ W(0), o = /* @__PURE__ */ W(0), d = /* @__PURE__ */ W(null), g = /* @__PURE__ */ W(Ie(/* @__PURE__ */ new Set()));
  const m = 4, p = 25, h = { x: 0, y: 0, w: 0, h: 0 }, v = /* @__PURE__ */ ne(() => Math.max(0, a(u) - l * 2)), y = /* @__PURE__ */ ne(() => Math.max(0, a(o) - l * 2)), c = /* @__PURE__ */ ne(() => a(v) > 0 && a(y) > 0 ? L(n(), a(v), a(y)) : n().map(() => h));
  function _(w, F, P) {
    const D = [];
    let Z = 0, Y = 0;
    for (let G = 0; G < w.length; G++)
      Y += mr(w[G]), Y * P + Pt * (G - Z) >= F && (D.push({ from: Z, to: G + 1, sum: Y }), Z = G + 1, Y = 0);
    return Z < w.length && D.push({ from: Z, to: w.length, sum: Y }), D;
  }
  function x(w, F, P) {
    return w.map((D, Z) => {
      const Y = (F - Pt * (D.to - D.from - 1)) / D.sum;
      return Z === w.length - 1 && Y > P ? P : Y;
    });
  }
  function N(w, F, P) {
    return x(w, F, P).reduce((D, Z) => D + Z, 0) + Pt * (w.length - 1);
  }
  function L(w, F, P) {
    let D = m, Z = Math.max(m, P);
    for (let X = 0; X < p; X++) {
      const j = (D + Z) / 2;
      N(_(w, F, j), F, j) <= P ? D = j : Z = j;
    }
    const Y = _(w, F, D), G = x(Y, F, D), te = [];
    let oe = (P - (G.reduce((X, j) => X + j, 0) + Pt * (Y.length - 1))) / 2;
    return Y.forEach((X, j) => {
      const I = G[j], V = [];
      for (let O = X.from; O < X.to; O++) V.push(mr(w[O]) * I);
      const S = V.reduce((O, ue) => O + ue, 0) + Pt * (V.length - 1);
      let k = (F - S) / 2;
      for (const O of V)
        te.push({
          x: Math.round(k),
          y: Math.round(oe),
          w: Math.round(O),
          h: Math.round(I)
        }), k += O + Pt;
      oe += I + Pt;
    }), te;
  }
  function T(w) {
    if (!r() || !w || !w.w || !w.h) return "none";
    const F = r().left - (l + w.x), P = r().top - (l + w.y);
    return `translate(${F}px, ${P}px) scale(${r().width / w.w}, ${r().height / w.h})`;
  }
  function z(w) {
    w.key === "Escape" && i()();
  }
  function U(w) {
    w.target.closest(".frame") || i()();
  }
  Hn(() => {
    const w = document.activeElement;
    return a(d)?.focus(), () => {
      w instanceof HTMLElement && document.contains(w) && w.focus();
    };
  });
  var $ = eo();
  Pn("keydown", mn, z), Pn("pointerdown", mn, U);
  var B = f($);
  fn(B, "", {}, { inset: "40px" }), Ge(B, 23, n, (w) => w.id, (w, F, P) => {
    var D = Ql();
    let Z;
    var Y = f(D);
    let G;
    q(
      (te, oe) => {
        Z = fn(D, "", Z, te), ae(Y, "src", `/d/${a(F).s ?? ""}.webp`), G = xe(Y, 1, "svelte-5g1i2z", null, G, oe);
      },
      [
        () => ({
          left: `${a(c)[a(P)].x ?? ""}px`,
          top: `${a(c)[a(P)].y ?? ""}px`,
          width: `${a(c)[a(P)].w ?? ""}px`,
          height: `${a(c)[a(P)].h ?? ""}px`,
          "--flight": T(a(c)[a(P)])
        }),
        () => ({ loaded: a(g).has(a(F).id) })
      ]
    ), Q("click", D, () => s()(a(F))), Pn("load", Y, () => E(g, new Set(a(g)).add(a(F).id), !0)), R(w, D);
  }), _r($, (w) => E(d, w), () => a(d)), q(() => ae($, "aria-label", `${n().length ?? ""} frames in this stack`)), Wr("innerWidth", (w) => E(u, w, !0)), Wr("innerHeight", (w) => E(o, w, !0)), R(e, $), gt();
}
zt(["click"]);
var no = /* @__PURE__ */ C('<span class="err svelte-uzy12d"> </span>'), ro = /* @__PURE__ */ C(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), ao = /* @__PURE__ */ C(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), so = /* @__PURE__ */ C('<span class="muted svelte-uzy12d"> </span>'), io = /* @__PURE__ */ C('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function lo(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ W(null), r = /* @__PURE__ */ W(!1), s = /* @__PURE__ */ W(null);
  async function i() {
    E(r, !0), E(s, null);
    try {
      E(n, await Oe.probe(), !0);
    } catch (h) {
      E(s, String(h), !0);
    } finally {
      E(r, !1);
    }
  }
  var l = io(), u = f(l), o = f(u), d = b(u, 2);
  {
    var g = (h) => {
      var v = no(), y = f(v);
      q(() => A(y, a(s))), R(h, v);
    }, m = (h) => {
      var v = aa(), y = ot(v);
      {
        var c = (x) => {
          var N = ro(), L = b(f(N), 2);
          q(
            (T) => A(L, ` above are formats the header
        reader cannot measure (${T ?? ""}) or files with no
        extension.`),
            [() => a(n).formats.join(" ")]
          ), R(x, N);
        }, _ = (x) => {
          var N = ao(), L = f(N), T = f(L), z = b(L, 2), U = f(z);
          q(
            ($) => {
              A(T, $), A(U, a(n).command);
            },
            [() => Ce(a(n).worklist)]
          ), R(x, N);
        };
        K(y, (x) => {
          a(n).worklist === 0 ? x(c) : x(_, -1);
        });
      }
      R(h, v);
    }, p = (h) => {
      var v = so(), y = f(v);
      q(() => A(y, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), R(h, v);
    };
    K(d, (h) => {
      a(s) ? h(g) : a(n) ? h(m, 1) : h(p, -1);
    });
  }
  q(() => {
    u.disabled = a(r), A(o, a(r) ? "counting…" : "Check the dimension probe's worklist");
  }), Q("click", u, i), R(e, l), gt();
}
zt(["click"]);
var oo = /* @__PURE__ */ C('<p class="bad svelte-1xjbga"> </p>'), uo = /* @__PURE__ */ C('<pre class="svelte-1xjbga"> </pre>'), co = /* @__PURE__ */ C('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), fo = /* @__PURE__ */ C(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), ho = /* @__PURE__ */ C('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), vo = /* @__PURE__ */ C('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), po = /* @__PURE__ */ C(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), go = /* @__PURE__ */ C('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), _o = /* @__PURE__ */ C(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function bo(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ W(null), r = /* @__PURE__ */ W(!1), s = /* @__PURE__ */ W(null), i = /* @__PURE__ */ W(null);
  const l = /* @__PURE__ */ ne(() => a(n)?.state === "running"), u = /* @__PURE__ */ ne(() => a(n)?.snapshot ? a(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const x = await Oe.rebuildStatus();
      E(n, x, !0), E(s, null), x.state === "done" && x.started_at !== a(i) && (E(i, x.started_at, !0), t.oncomplete?.());
    } catch (x) {
      E(s, String(x), !0);
    }
  }
  Hn(() => {
    o();
  }), sn(() => {
    if (!a(l)) return;
    const x = setInterval(o, 700);
    return () => clearInterval(x);
  });
  async function d() {
    E(r, !0), E(s, null);
    try {
      E(n, await Oe.rebuild(), !0);
    } catch (x) {
      E(s, String(x), !0);
    }
  }
  function g(x) {
    x.key === "Escape" && E(r, !1);
  }
  var m = _o();
  Pn("keydown", mn, g);
  var p = ot(m), h = f(p), v = f(h), y = b(h, 2), c = b(p, 2);
  {
    var _ = (x) => {
      var N = go(), L = ot(N), T = b(L, 2), z = f(T), U = b(f(z), 4), $ = f(U), B = b(U, 2), w = b(z, 2);
      {
        var F = (X) => {
          var j = oo(), I = f(j);
          q(() => A(I, a(s))), R(X, j);
        };
        K(w, (X) => {
          a(s) && X(F);
        });
      }
      var P = b(w, 2);
      Ge(P, 17, () => a(n)?.steps ?? [], yt, (X, j) => {
        var I = co();
        let V;
        var S = f(I), k = f(S), O = f(k);
        {
          var ue = (ce) => {
            var se = Mn("✓");
            R(ce, se);
          }, ye = (ce) => {
            var se = Mn("✕");
            R(ce, se);
          }, de = (ce) => {
            var se = Mn("·");
            R(ce, se);
          }, fe = (ce) => {
            var se = Mn(" ");
            R(ce, se);
          };
          K(O, (ce) => {
            a(j).state === "done" ? ce(ue) : a(j).state === "failed" ? ce(ye, 1) : a(j).state === "running" ? ce(de, 2) : ce(fe, -1);
          });
        }
        var Se = b(k, 2), he = f(Se), Ne = b(Se, 4), We = f(Ne), Ee = b(S, 2);
        {
          var rt = (ce) => {
            var se = uo(), Re = f(se);
            q((Pe) => A(Re, Pe), [() => a(j).log.join(`
`)]), R(ce, se);
          };
          K(Ee, (ce) => {
            a(j).log.length && ce(rt);
          });
        }
        q(() => {
          V = xe(I, 1, "step svelte-1xjbga", null, V, {
            on: a(j).state === "running",
            bad: a(j).state === "failed"
          }), A(he, a(j).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), A(We, a(j).seconds === null ? "" : a(j).seconds + "s");
        }), R(X, I);
      });
      var D = b(P, 2);
      {
        var Z = (X) => {
          var j = fo(), I = ot(j), V = f(I);
          q(() => A(V, a(n).error)), R(X, j);
        }, Y = (X) => {
          var j = ho();
          R(X, j);
        }, G = (X) => {
          var j = vo();
          R(X, j);
        };
        K(D, (X) => {
          a(n)?.state === "failed" ? X(Z) : a(n)?.state === "done" ? X(Y, 1) : a(l) && X(G, 2);
        });
      }
      var te = b(D, 2);
      {
        var oe = (X) => {
          var j = po(), I = b(f(j), 6), V = f(I);
          q(() => A(V, `python -m photolib.restore_state ${a(u) ?? ""}`)), R(X, j);
        };
        K(te, (X) => {
          a(u) && X(oe);
        });
      }
      q(() => A($, `${a(n)?.seconds ?? 0 ?? ""}s`)), Q("click", L, () => E(r, !1)), Q("click", B, () => E(r, !1)), R(x, N);
    };
    K(c, (x) => {
      a(r) && x(_);
    });
  }
  q(() => {
    h.disabled = a(l), A(v, a(l) ? "applying…" : "Apply to grid"), y.disabled = !a(n) || a(n).state === "idle";
  }), Q("click", h, d), Q("click", y, () => E(r, !0)), R(e, m), gt();
}
zt(["click"]);
var mo = /* @__PURE__ */ C('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), Aa = /* @__PURE__ */ C("<option> </option>"), wo = /* @__PURE__ */ C('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), yo = /* @__PURE__ */ C('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), xo = /* @__PURE__ */ C('<div class="none muted svelte-bqi9ky"> </div>'), ko = /* @__PURE__ */ C('<div class="bar svelte-bqi9ky"><!></div>');
function So(e, t) {
  pt(t, !0);
  let n = re(t, "candidate", 3, null), r = re(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), u = /* @__PURE__ */ ne(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ ne(() => !!n() && n().op !== "is null");
  function d(y, c) {
    const _ = { ...n(), [y]: c };
    if (y === "column") {
      const x = i[c] ?? ["="];
      x.includes(_.op) || (_.op = x[0]), _.value = l.has(c) ? 0 : "";
    }
    y === "op" && c === "is null" && (_.value = null), y === "value" && l.has(_.column) && (_.value = Number(c) || 0), t.onedit(_);
  }
  var g = ko(), m = f(g);
  {
    var p = (y) => {
      var c = mo(), _ = f(c), x = f(_), N = b(_, 2), L = f(N);
      q(() => {
        A(x, `${t.screen.title ?? ""} does not save a rule.`), A(L, t.screen.blurb);
      }), R(y, c);
    }, h = (y) => {
      var c = yo(), _ = ot(c), x = f(_);
      Ge(x, 21, () => s, yt, (I, V) => {
        var S = Aa(), k = f(S), O = {};
        q(() => {
          A(k, a(V)), O !== (O = a(V)) && (S.value = (S.__value = a(V)) ?? "");
        }), R(I, S);
      });
      var N;
      sr(x);
      var L = b(x, 2);
      Ge(L, 21, () => a(u), yt, (I, V) => {
        var S = Aa(), k = f(S), O = {};
        q(() => {
          A(k, a(V)), O !== (O = a(V)) && (S.value = (S.__value = a(V)) ?? "");
        }), R(I, S);
      });
      var T;
      sr(L);
      var z = b(L, 2);
      {
        var U = (I) => {
          var V = wo();
          q(() => un(V, n().value ?? "")), Q("input", V, (S) => d("value", S.currentTarget.value)), R(I, V);
        };
        K(z, (I) => {
          a(o) && I(U);
        });
      }
      var $ = b(z, 2), B = f($);
      B.value = B.__value = "exclude";
      var w = b(B);
      w.value = w.__value = "include";
      var F;
      sr($);
      var P = b($, 2), D = f(P);
      D.value = D.__value = "end";
      var Z = b(D);
      Z.value = Z.__value = "0";
      var Y;
      sr(P);
      var G = b(P, 2), te = f(G), oe = b(G, 2), X = b(_, 2), j = f(X);
      q(
        (I, V) => {
          N !== (N = n().column) && (x.value = (x.__value = n().column) ?? "", Xn(x, n().column)), T !== (T = n().op) && (L.value = (L.__value = n().op) ?? "", Xn(L, n().op)), F !== (F = n().decision ?? "exclude") && ($.value = ($.__value = n().decision ?? "exclude") ?? "", Xn($, n().decision ?? "exclude")), Y !== (Y = I) && (P.value = (P.__value = I) ?? "", Xn(P, I)), G.disabled = r(), A(te, r() ? "saving…" : "Confirm"), A(j, `${V ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => cl(n())
        ]
      ), Q("change", x, (I) => d("column", I.currentTarget.value)), Q("change", L, (I) => d("op", I.currentTarget.value)), Q("change", $, (I) => d("decision", I.currentTarget.value)), Q("change", P, (I) => d("at", I.currentTarget.value)), Q("click", G, function(...I) {
        t.onconfirm?.apply(this, I);
      }), Q("click", oe, function(...I) {
        t.onclear?.apply(this, I);
      }), R(y, c);
    }, v = (y) => {
      var c = xo(), _ = f(c);
      q(() => A(_, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), R(y, c);
    };
    K(m, (y) => {
      t.screen.rule === !1 ? y(p) : n() ? y(h, 1) : y(v, -1);
    });
  }
  R(e, g), gt();
}
zt(["change", "input", "click"]);
var Eo = /* @__PURE__ */ C('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), To = /* @__PURE__ */ C('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), Mo = /* @__PURE__ */ C('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Ao = /* @__PURE__ */ C('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Ro(e, t) {
  pt(t, !0);
  let n = re(t, "rules", 19, () => []), r = re(t, "unmatched", 3, null), s = re(t, "busy", 3, !1);
  var i = Ao(), l = f(i), u = b(f(l)), o = f(u), d = b(l, 2);
  {
    var g = (v) => {
      var y = Eo();
      R(v, y);
    };
    K(d, (v) => {
      n().length === 0 && v(g);
    });
  }
  var m = b(d, 2);
  Ge(m, 19, n, (v) => v.id, (v, y, c) => {
    var _ = To();
    let x;
    var N = f(_), L = f(N), T = f(L), z = b(L, 2), U = f(z), $ = b(z, 2), B = f($), w = b(N, 2), F = f(w), P = f(F), D = b(F, 2), Z = f(D), Y = b(D, 4), G = b(Y, 2), te = b(G, 2);
    q(
      (oe, X) => {
        x = xe(_, 1, "rule svelte-aof9c2", null, x, { exclude: a(y).decision === "exclude" }), A(T, a(c)), A(U, a(y).predicate), A(B, a(y).decision), A(P, `${oe ?? ""} paths`), A(Z, X), Y.disabled = s() || a(c) === 0, G.disabled = s() || a(c) === n().length - 1, te.disabled = s();
      },
      [
        () => Ce(a(y).paths),
        () => Ct(a(y).bytes)
      ]
    ), Q("click", Y, () => t.onmove(a(y), a(c) - 1)), Q("click", G, () => t.onmove(a(y), a(c) + 1)), Q("click", te, () => t.ondelete(a(y))), R(v, _);
  });
  var p = b(m, 2);
  {
    var h = (v) => {
      var y = Mo(), c = b(f(y), 2), _ = f(c), x = f(_), N = b(_, 2), L = f(N);
      q(
        (T, z) => {
          A(x, `${T ?? ""} paths`), A(L, z);
        },
        [
          () => Ce(r().paths),
          () => Ct(r().bytes)
        ]
      ), R(v, y);
    };
    K(p, (v) => {
      r() && v(h);
    });
  }
  q(() => A(o, `${n().length ?? ""} rules · top-down, first match wins`)), R(e, i), gt();
}
zt(["click"]);
const Ra = 2500, Po = 1, Co = 2, No = 3e7, Fr = /* @__PURE__ */ new WeakMap();
function Oo(e, t, n) {
  const r = [], s = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, d = 0, g = null, m = null, p = null, h = !1, v = !1, y = 0, c = 0, _ = 0, x = n.onState || (() => {
  });
  function N(S) {
    y <= 0 || (o = Jl(r, o, y, S, (k, O, ue) => {
      s.push({ top: d, height: ue, from: k, to: O }), d += ue + Pt;
    }), T());
  }
  function L() {
    if (m === null || h || y <= 0 || o >= m) return 0;
    const S = s.length ? o / s.length : Math.max(1, y / br), k = s.length ? d / s.length : br + Pt, O = Math.round((m - o) / S * k);
    return Math.max(0, Math.min(O, No - d));
  }
  function T() {
    e.style.height = d + L() + "px", t.style.top = Math.max(0, d - 1) + "px";
  }
  function z() {
    return window.scrollY - e.offsetTop;
  }
  function U() {
    const S = l.pop();
    if (S) return S;
    const k = document.createElement("div");
    k.className = "tile";
    const O = document.createElement("img");
    return O.decoding = "async", O.addEventListener("load", () => k.classList.add("loaded")), O.addEventListener("error", () => k.classList.add("missing")), k.appendChild(O), Fr.set(k, O), n.extend && n.extend(k), k;
  }
  function $(S, k) {
    Fr.get(k).removeAttribute("src"), k.classList.remove("loaded", "missing", "error"), k.style.backgroundImage = "", k.remove(), i.delete(S), l.push(k);
  }
  function B(S, k, O, ue, ye, de) {
    let fe = i.get(S);
    const Se = r[S];
    if (!fe) {
      fe = U(), fe.dataset.index = String(S);
      const he = Fr.get(fe);
      he.fetchPriority = de ? "high" : "low", he.src = "/t/" + Se.s + ".webp", u.push(S), n.fill && n.fill(fe, Se), e.appendChild(fe), i.set(S, fe);
    }
    fe.style.width = ue + "px", fe.style.height = ye + "px", fe.style.transform = "translate(" + k + "px," + O + "px)";
  }
  function w(S, k) {
    k.th && (k.url === void 0 && (k.url = n.thumbHash(k.th)), k.url && (S.style.backgroundImage = "url(" + k.url + ")"));
  }
  function F() {
    _ = 0;
    for (const S of u) {
      const k = i.get(S);
      k && !k.classList.contains("loaded") && w(k, r[S]);
    }
    u.length = 0;
  }
  function P(S, k) {
    for (const O of Zl(S, r, y))
      B(O.index, O.x, S.top, O.w, S.height, k);
  }
  function D() {
    const S = window.innerHeight, k = z(), O = Ma(s, k - S * Po, k + S * (1 + Co));
    if (!O) return;
    const ue = s[O[0]].from, ye = s[O[1]].to;
    for (const [de, fe] of Array.from(i))
      (de < ue || de >= ye) && $(de, fe);
    for (let de = O[0]; de <= O[1]; de++) {
      const fe = s[de];
      P(fe, fe.top < k + S && fe.top + fe.height > k);
    }
    u.length && !_ && (_ = requestAnimationFrame(F));
  }
  function Z() {
    return y <= 0 ? !1 : d - (z() + window.innerHeight) < Ra;
  }
  async function Y() {
    if (v || h) return;
    v = !0;
    const S = c;
    x({ loading: !0, count: r.length, exhausted: h, total: m, tiles: p });
    try {
      do {
        const k = await n.fetchPage(g);
        if (S !== c) return;
        for (const O of k.photos) r.push(O);
        g = k.next, h = g === null, typeof k.stacks == "number" ? (m = k.stacks, p = typeof k.total == "number" ? k.total : null) : typeof k.total == "number" && (m = k.total), N(h), D(), x({ loading: !0, count: r.length, exhausted: h, total: m, tiles: p });
      } while (!h && Z());
    } catch (k) {
      S === c && x({ error: String(k) });
    } finally {
      S === c && (v = !1, x({ loading: !1, count: r.length, exhausted: h, total: m, tiles: p }));
    }
  }
  let G = 0;
  function te() {
    G || (G = requestAnimationFrame(() => {
      G = 0, D(), Z() && Y();
    }));
  }
  function oe() {
    const S = e.clientWidth;
    if (S === y) return;
    const k = Ma(s, z(), z()), O = k ? s[k[0]].from : 0;
    y = S;
    for (const [ye, de] of Array.from(i)) $(ye, de);
    s.length = 0, o = 0, d = 0, N(h), D();
    const ue = s.find((ye) => ye.to > O);
    ue && window.scrollTo(0, ue.top + e.offsetTop), Z() && Y();
  }
  function X(S) {
    const k = S.target.closest(".tile");
    if (!k || !e.contains(k)) return;
    const O = r[Number(k.dataset.index)];
    O && n.activate && n.activate(O, S, k);
  }
  e.addEventListener("click", X), window.addEventListener("scroll", te, { passive: !0 });
  let j = 0;
  const I = new ResizeObserver(() => {
    clearTimeout(j), j = setTimeout(oe, 100);
  });
  I.observe(e);
  const V = new IntersectionObserver(
    (S) => {
      S.some((k) => k.isIntersecting) && Y();
    },
    { rootMargin: "0px 0px " + Ra + "px 0px" }
  );
  return V.observe(t), y = e.clientWidth, Y(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      c++, v = !1;
      for (const [S, k] of Array.from(i)) $(S, k);
      r.length = 0, s.length = 0, u.length = 0, o = 0, d = 0, g = null, m = null, p = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), Y();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(S) {
      const k = typeof S == "number" ? S : null;
      k !== m && (m = k, T(), x({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [S, k] of i) n.fill(k, r[S]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(S) {
      for (const [k, O] of i)
        r[k] === S && n.fill && n.fill(O, S);
    },
    destroy() {
      c++, e.removeEventListener("click", X), window.removeEventListener("scroll", te), I.disconnect(), V.disconnect(), clearTimeout(j), cancelAnimationFrame(_);
    }
  };
}
function Io(e) {
  try {
    const t = Uint8Array.from(atob(e), (P) => P.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, d = (r >> 3 & 63) / 63, g = (r >> 9 & 63) / 63, m = r >> 15, p = Math.max(3, m ? o ? 5 : 7 : r & 7), h = Math.max(3, m ? r & 7 : o ? 5 : 7);
    let v = o ? 6 : 5, y = 0;
    const c = (P, D, Z) => {
      const Y = [];
      for (let G = 0; G < D; G++)
        for (let te = G ? 0 : 1; te * D < P * (D - G); te++) {
          const oe = t[v + (y >> 1)] >> ((y++ & 1) << 2) & 15;
          Y.push((oe / 7.5 - 1) * Z);
        }
      return Y;
    }, _ = c(p, h, u), x = c(3, 3, d * 1.25), N = c(3, 3, g * 1.25), L = p / h, T = Math.max(1, Math.round(L > 1 ? 32 : 32 * L)), z = Math.max(1, Math.round(L > 1 ? 32 / L : 32)), U = document.createElement("canvas");
    U.width = T, U.height = z;
    const $ = U.getContext("2d"), B = $.createImageData(T, z), w = [], F = [];
    for (let P = 0, D = 0; P < z; P++)
      for (let Z = 0; Z < T; Z++, D += 4) {
        let Y = s, G = i, te = l;
        for (let I = 0; I < p; I++) w[I] = Math.cos(Math.PI / T * (Z + 0.5) * I);
        for (let I = 0; I < h; I++) F[I] = Math.cos(Math.PI / z * (P + 0.5) * I);
        for (let I = 0, V = 0; I < h; I++)
          for (let S = I ? 0 : 1; S * h < p * (h - I); S++, V++)
            Y += _[V] * w[S] * F[I] * 2;
        for (let I = 0, V = 0; I < 3; I++)
          for (let S = I ? 0 : 1; S < 3 - I; S++, V++) {
            const k = w[S] * F[I] * 2;
            G += x[V] * k, te += N[V] * k;
          }
        const oe = Y - 2 / 3 * G, X = (3 * Y - oe + te) / 2, j = X - te;
        B.data[D] = Math.max(0, Math.min(255, Math.round(255 * X))), B.data[D + 1] = Math.max(0, Math.min(255, Math.round(255 * j))), B.data[D + 2] = Math.max(0, Math.min(255, Math.round(255 * oe))), B.data[D + 3] = 255;
      }
    return $.putImageData(B, 0, 0), U.toDataURL();
  } catch {
    return null;
  }
}
var Fo = /* @__PURE__ */ C('<main id="canvas"><div id="sentinel"></div></main>');
function Lo(e, t) {
  pt(t, !0);
  let n = re(t, "key", 3, ""), r = re(t, "total", 3, null), s = re(t, "triage", 3, !1), i = re(t, "excludedDirs", 19, () => []), l = re(t, "onActivate", 3, () => {
  }), u = re(t, "onOverride", 3, async () => null), o = re(t, "onExcludeFolder", 3, () => {
  }), d = re(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ W(null), m = /* @__PURE__ */ W(null), p = null, h = "";
  const v = { null: "exclude", exclude: "include", include: "clear" };
  function y(T) {
    const z = T.toLowerCase().startsWith(Ln.toLowerCase()) ? T.slice(Ln.length + 1) : T;
    return z.length > 64 ? "…" + z.slice(-64) : z;
  }
  function c(T) {
    const z = document.createElement("div");
    z.className = "tile-path", T.appendChild(z);
    const U = document.createElement("button");
    U.className = "chip", U.type = "button", T.appendChild(U);
    const $ = document.createElement("button");
    $.className = "dirchip", $.type = "button", $.textContent = "dir", T.appendChild($);
  }
  function _(T, z) {
    const U = T.querySelector(".tile-path");
    U && (U.textContent = z.p ? y(z.p) : "");
    const $ = T.querySelector(".dirchip");
    if ($) {
      const w = ps(z.p ?? ""), F = w !== "" && ia(i(), w);
      $.hidden = w === "", $.disabled = F, $.dataset.state = F ? "exclude" : "none", $.title = F ? `already excluded: ${w}` : `exclude everything under ${w}, subfolders included — one exclude rule at the end of the order`;
    }
    const B = T.querySelector(".chip");
    B && (B.dataset.state = z.o || "none", B.textContent = z.o === "exclude" ? "drop" : z.o === "include" ? "keep" : "·", B.title = z.o === "exclude" ? "overridden: excluded — click to keep" : z.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Hn(() => (p = Oo(a(g), a(m), {
    fetchPage: (T) => t.fetchPage(T),
    thumbHash: Io,
    extend: s() ? c : void 0,
    fill: s() ? _ : void 0,
    onState: (T) => d()(T),
    activate: async (T, z, U) => {
      if (z.target.closest(".dirchip")) {
        o()(T);
        return;
      }
      if (!z.target.closest(".chip")) {
        l()(T, U);
        return;
      }
      const $ = v[T.o ?? "null"];
      T.o = await u()(T, $), _(U, T);
    }
  }), h = n(), () => p?.destroy())), sn(() => {
    const T = n(), z = r();
    p && (T !== h && (h = T, p.reset()), p.setTotal(z));
  });
  let x = "";
  sn(() => {
    const T = i().join(`
`);
    !p || T === x || (x = T, p.refill());
  });
  var N = Fo(), L = f(N);
  _r(L, (T) => E(m, T), () => a(m)), _r(N, (T) => E(g, T), () => a(g)), R(e, N), gt();
}
var zo = /* @__PURE__ */ C('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Do = /* @__PURE__ */ C('<th class="num svelte-1v3p82v"> </th>'), jo = /* @__PURE__ */ C('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Ho = /* @__PURE__ */ C('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), qo = /* @__PURE__ */ C('<td class="num svelte-1v3p82v"> </td>'), Bo = /* @__PURE__ */ C('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), $o = /* @__PURE__ */ C('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Uo(e, t) {
  pt(t, !0);
  let n = re(t, "rows", 19, () => []), r = re(t, "rules", 19, () => []), s = re(t, "root", 3, null), i = re(t, "selected", 3, null), l = re(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ ne(() => t.screen.rule !== !1);
  function o(y) {
    return t.screen.label ? t.screen.label(y) : y.key;
  }
  const d = /* @__PURE__ */ ne(() => new Map(n().map((y) => [
    y.key,
    t.screen.rule === !1 ? null : gs(r(), t.screen.toRule(y, s()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var p = aa(), h = ot(p);
  {
    var v = (y) => {
      var c = $o(), _ = f(c), x = f(_), N = f(x);
      {
        var L = (w) => {
          var F = zo();
          R(w, F);
        };
        K(N, (w) => {
          a(u) && w(L);
        });
      }
      var T = b(N), z = f(T), U = b(T, 3);
      {
        var $ = (w) => {
          var F = Do(), P = f(F);
          q(() => A(P, t.screen.heading[1])), R(w, F);
        };
        K(U, (w) => {
          t.screen.heading[1] && w($);
        });
      }
      var B = b(_);
      Ge(B, 23, n, (w) => w.key, (w, F, P) => {
        const D = /* @__PURE__ */ ne(() => a(d).get(a(F).key));
        var Z = Bo();
        let Y;
        var G = f(Z);
        {
          var te = (he) => {
            const Ne = /* @__PURE__ */ ne(() => l().has(a(F).key));
            var We = jo(), Ee = f(We);
            let rt;
            var ce = f(Ee);
            q(
              (se) => {
                rt = xe(Ee, 1, "tick svelte-1v3p82v", null, rt, { on: a(Ne) }), ae(Ee, "aria-checked", a(Ne)), ae(Ee, "aria-label", `select ${se ?? ""}`), A(ce, a(Ne) ? "✓" : "");
              },
              [() => o(a(F))]
            ), Q("click", Ee, (se) => {
              se.stopPropagation(), t.oncheck(a(F), a(P), se.shiftKey);
            }), R(he, We);
          };
          K(G, (he) => {
            a(u) && he(te);
          });
        }
        var oe = b(G), X = f(oe);
        let j;
        var I = f(X), V = b(X), S = b(V);
        {
          var k = (he) => {
            var Ne = Ho();
            R(he, Ne);
          };
          K(S, (he) => {
            a(F).scope === "whole inventory" && he(k);
          });
        }
        var O = b(oe), ue = f(O), ye = b(O), de = f(ye), fe = b(ye);
        {
          var Se = (he) => {
            var Ne = qo(), We = f(Ne);
            q(() => A(We, a(F).detail ?? "")), R(he, Ne);
          };
          K(fe, (he) => {
            t.screen.heading[1] && he(Se);
          });
        }
        q(
          (he, Ne, We) => {
            Y = xe(Z, 1, "svelte-1v3p82v", null, Y, {
              picked: i() === a(F).key,
              clickable: t.screen.sheet !== !1
            }), j = xe(X, 1, "mark svelte-1v3p82v", null, j, {
              exclude: a(D) === "exclude",
              include: a(D) === "include"
            }), ae(X, "title", m[a(D)] ?? ""), A(I, g[a(D)] ?? ""), A(V, `${he ?? ""} `), A(ue, Ne), A(de, We);
          },
          [
            () => o(a(F)),
            () => Ce(a(F).paths),
            () => Ct(a(F).bytes)
          ]
        ), Q("click", Z, () => t.onpick(a(F))), R(w, Z);
      }), q(() => A(z, t.screen.heading[0] ?? "")), R(y, c);
    };
    K(h, (y) => {
      n().length && y(v);
    });
  }
  R(e, p), gt();
}
zt(["click"]);
var Go = /* @__PURE__ */ C('<button class="twisty svelte-pucy57"> </button>'), Wo = /* @__PURE__ */ C('<span class="twisty leaf svelte-pucy57">·</span>'), Yo = /* @__PURE__ */ C('<span class="name root svelte-pucy57"> </span>'), Vo = /* @__PURE__ */ C('<button class="name svelte-pucy57"> </button>'), Xo = /* @__PURE__ */ C('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Ko = /* @__PURE__ */ C('<div class="note svelte-pucy57"> </div>'), Jo = /* @__PURE__ */ C('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Zo = /* @__PURE__ */ C('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Qo = /* @__PURE__ */ C('<div class="tree svelte-pucy57"></div>');
function eu(e, t) {
  pt(t, !0);
  let n = re(t, "version", 3, 0), r = re(t, "excludedDirs", 19, () => []), s = re(t, "selected", 3, null), i = re(t, "busy", 3, !1), l = /* @__PURE__ */ W(Ie(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ W(Ie(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ W(Ie(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ W(Ie(/* @__PURE__ */ new Set()));
  async function g(c) {
    E(o, new Set(a(o)).add(c), !0);
    const _ = await t.onload(c), x = new Map(a(l)), N = new Set(a(d));
    _ ? (x.set(c, _), N.delete(c)) : N.add(c), E(l, x, !0), E(d, N, !0), E(o, new Set([...a(o)].filter((L) => L !== c)), !0);
  }
  function m(c) {
    if (a(u).has(c)) {
      E(u, new Set([...a(u)].filter((_) => _ !== c)), !0);
      return;
    }
    E(u, new Set(a(u)).add(c), !0), a(l).has(c) || g(c);
  }
  let p = -1;
  sn(() => {
    const c = n();
    if (c !== p) {
      p = c, a(u).has(t.root) || E(u, new Set(a(u)).add(t.root), !0);
      for (const _ of a(u)) g(_);
    }
  });
  const h = /* @__PURE__ */ ne(() => {
    const c = [], _ = (T, z, U, $, B, w) => {
      const F = a(l).get(T), P = a(u).has(T);
      if (c.push({
        key: T,
        name: z,
        depth: U,
        paths: $,
        bytes: B,
        deeper: w,
        expanded: P,
        here: F?.here ?? null,
        truncated: !!F?.truncated,
        loading: a(o).has(T),
        failed: a(d).has(T),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: ia(r(), T)
      }), !(!P || !F))
        for (const D of F.children)
          _(D.path, D.name, U + 1, D.paths, D.bytes, D.deeper);
    }, x = a(l).get(t.root), N = x ? x.children.reduce((T, z) => T + z.paths, 0) + x.here.paths : 0, L = x ? x.children.reduce((T, z) => T + z.bytes, 0) + x.here.bytes : 0;
    return _(t.root, t.root, 0, N, L, !0), c;
  }), v = 8;
  var y = Qo();
  Ge(y, 21, () => a(h), (c) => c.key, (c, _) => {
    var x = Zo(), N = ot(x);
    let L;
    var T = f(N);
    let z;
    var U = b(T, 2);
    {
      var $ = (S) => {
        var k = Go(), O = f(k);
        q(() => {
          ae(k, "aria-expanded", a(_).expanded), ae(k, "aria-label", `${a(_).expanded ? "collapse" : "expand"} ${a(_).name ?? ""}`), ae(k, "title", a(_).expanded ? "collapse" : "expand"), A(O, a(_).loading ? "·" : a(_).expanded ? "▾" : "▸");
        }), Q("click", k, () => m(a(_).key)), R(S, k);
      }, B = (S) => {
        var k = Wo();
        R(S, k);
      };
      K(U, (S) => {
        a(_).deeper ? S($) : S(B, -1);
      });
    }
    var w = b(U, 2);
    {
      var F = (S) => {
        var k = Yo(), O = f(k);
        q(() => A(O, a(_).key)), R(S, k);
      }, P = (S) => {
        var k = Vo(), O = f(k);
        q(() => {
          ae(k, "title", `Show every kept file under ${a(_).key ?? ""}`), A(O, a(_).name);
        }), Q("click", k, () => t.onpick(a(_))), R(S, k);
      };
      K(w, (S) => {
        a(_).depth === 0 ? S(F) : S(P, -1);
      });
    }
    var D = b(w, 2), Z = f(D), Y = b(D, 2), G = f(Y), te = b(Y, 2), oe = b(N, 2);
    {
      var X = (S) => {
        var k = Xo();
        let O;
        q((ue) => O = fn(k, "", O, ue), [
          () => ({
            "padding-left": `${Math.min(a(_).depth, v) * 11 + 18}px`
          })
        ]), R(S, k);
      }, j = (S) => {
        var k = Ko();
        let O;
        var ue = f(k);
        q(
          (ye, de, fe) => {
            O = fn(k, "", O, ye), A(ue, `${de ?? ""} directly here · ${fe ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(a(_).depth, v) * 11 + 18}px`
            }),
            () => Ce(a(_).here.paths),
            () => Ct(a(_).here.bytes)
          ]
        ), R(S, k);
      };
      K(oe, (S) => {
        a(_).expanded && a(_).failed ? S(X) : a(_).expanded && a(_).here && a(_).here.paths > 0 && S(j, 1);
      });
    }
    var I = b(oe, 2);
    {
      var V = (S) => {
        var k = Jo();
        let O;
        q((ue) => O = fn(k, "", O, ue), [
          () => ({
            "padding-left": `${Math.min(a(_).depth, v) * 11 + 18}px`
          })
        ]), R(S, k);
      };
      K(I, (S) => {
        a(_).truncated && S(V);
      });
    }
    q(
      (S, k, O) => {
        L = xe(N, 1, "row svelte-pucy57", null, L, {
          picked: s() === a(_).key,
          gone: a(_).excluded
        }), z = fn(T, "", z, S), A(Z, k), A(G, O), te.disabled = i() || a(_).excluded || a(_).depth === 0, ae(te, "title", a(_).depth === 0 ? "The library root is not excludable from here." : a(_).excluded ? "already excluded" : `Exclude everything under ${a(_).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(a(_).depth, v) * 11}px` }),
        () => Ce(a(_).paths),
        () => Ct(a(_).bytes)
      ]
    ), Q("click", te, () => t.onexclude(a(_))), R(c, x);
  }), R(e, y), gt();
}
zt(["click"]);
var tu = /* @__PURE__ */ C('<button title="Back to its default">↺</button>'), nu = /* @__PURE__ */ C('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), ru = /* @__PURE__ */ C('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), au = /* @__PURE__ */ C('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), su = /* @__PURE__ */ C('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), iu = /* @__PURE__ */ C('<li><code class="svelte-1hh0fwb"> </code> </li>'), lu = /* @__PURE__ */ C(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), ou = /* @__PURE__ */ C('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function uu(e, t) {
  pt(t, !0);
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
        ["headerSide", "Sides", 0, (P) => Math.floor(P / 2), 1],
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
  let u = /* @__PURE__ */ W(Ie(yl())), o = /* @__PURE__ */ W(!0), d = /* @__PURE__ */ W(!1), g = /* @__PURE__ */ W(Ie(xs())), m = /* @__PURE__ */ W(Ie(window.innerWidth));
  const p = (P) => a(g) === "light" ? P.light : P.dark, h = (P) => P in cn ? cn : nn, v = (P) => `rgba(${P.r}, ${P.g}, ${P.b}, ${P.a})`, y = /* @__PURE__ */ ne(() => JSON.stringify(a(u), null, 2));
  Hn(() => {
    const P = localStorage.getItem(n);
    if (P)
      try {
        E(u, Cr(JSON.parse(P)), !0);
        return;
      } catch {
      }
    la();
  });
  function c(P) {
    E(u, Cr({ ...a(u), ...P }), !0), localStorage.setItem(n, JSON.stringify(a(u))), E(d, !1);
  }
  function _(P) {
    E(u, Cr(P), !0), localStorage.setItem(n, JSON.stringify(a(u))), E(d, !1);
  }
  function x(P) {
    c({ [P]: h(P)[P] });
  }
  function N() {
    E(g, ks(a(g) === "dark" ? "light" : "dark"), !0);
  }
  async function L() {
    await navigator.clipboard.writeText(a(y)), E(d, !0);
  }
  var T = ou();
  let z;
  var U = f(T), $ = b(f(U), 4), B = f($), w = b(U, 2);
  {
    var F = (P) => {
      var D = lu();
      {
        const Ee = (ce, se = ir, Re = ir, Pe = ir) => {
          var Fe = tu();
          let Qe;
          q(() => {
            Qe = xe(Fe, 1, "undo svelte-1hh0fwb", null, Qe, { idle: !Re() }), ae(Fe, "aria-label", `Reset ${se() ?? ""}`);
          }), Q("click", Fe, function(...ct) {
            Pe()?.apply(this, ct);
          }), R(ce, Fe);
        };
        var Z = b(f(D), 2);
        Ge(Z, 17, () => r, yt, (ce, se) => {
          var Re = ru(), Pe = f(Re), Fe = f(Pe), Qe = b(Pe, 2), ct = f(Qe), Et = b(Qe, 2);
          Ge(Et, 17, () => a(se).rows, yt, (Dt, Bt) => {
            var _t = /* @__PURE__ */ ne(() => Tr(a(Bt), 5));
            let et = () => a(_t)[0], Tt = () => a(_t)[1], H = () => a(_t)[2], ee = () => a(_t)[3], pe = () => a(_t)[4];
            const Te = /* @__PURE__ */ ne(() => a(u)[et()] !== h(et())[et()]), me = /* @__PURE__ */ ne(() => typeof ee() == "function" ? ee()(a(m)) : ee());
            var ve = nu();
            let we;
            var Ye = f(ve), at = f(Ye), ge = b(Ye, 2), He = b(ge, 2), Mt = b(He, 2);
            Ee(Mt, Tt, () => a(Te), () => () => x(et())), q(() => {
              we = xe(ve, 1, "row svelte-1hh0fwb", null, we, { moved: a(Te) }), A(at, Tt()), ae(ge, "min", H()), ae(ge, "max", a(me)), ae(ge, "step", pe()), ae(ge, "aria-label", Tt()), un(ge, a(u)[et()]), ae(He, "min", H()), ae(He, "max", a(me)), ae(He, "step", pe()), ae(He, "aria-label", `${Tt() ?? ""} value`), un(He, a(u)[et()]);
            }), Q("input", ge, (Be) => c({ [et()]: Number(Be.currentTarget.value) })), Q("input", He, (Be) => c({ [et()]: Number(Be.currentTarget.value) })), R(Dt, ve);
          }), q(() => {
            A(Fe, a(se).title), A(ct, a(se).note);
          }), R(ce, Re);
        });
        var Y = b(Z, 2), G = f(Y), te = b(Y, 2), oe = f(te), X = b(te, 2);
        Ge(X, 17, () => wl, yt, (ce, se) => {
          const Re = /* @__PURE__ */ ne(() => p(a(se))), Pe = /* @__PURE__ */ ne(() => a(u)[a(Re)]), Fe = /* @__PURE__ */ ne(() => a(se).base[a(Re)]);
          var Qe = su(), ct = f(Qe), Et = f(ct), Dt = b(Et), Bt = f(Dt), _t = b(ct, 2), et = f(_t), Tt = b(_t, 2);
          Ge(Tt, 17, () => i, yt, (Te, me) => {
            var ve = /* @__PURE__ */ ne(() => Tr(a(me), 3));
            let we = () => a(ve)[0], Ye = () => a(ve)[1], at = () => a(ve)[2];
            const ge = /* @__PURE__ */ ne(() => a(Pe)[we()] !== a(Fe)[we()]);
            var He = au();
            let Mt;
            var Be = f(He), M = f(Be), J = b(Be, 2), be = b(J, 2), $e = b(be, 2);
            Ee($e, Ye, () => a(ge), () => () => c({
              [a(Re)]: { ...a(Pe), [we()]: a(Fe)[we()] }
            })), q(() => {
              Mt = xe(He, 1, "row svelte-1hh0fwb", null, Mt, { moved: a(ge) }), A(M, Ye()), ae(J, "max", at()), ae(J, "step", at() === 1 ? 0.01 : 1), ae(J, "aria-label", `${a(g) ?? ""} ${s[a(se).dark].title ?? ""} ${Ye() ?? ""}`), un(J, a(Pe)[we()]), ae(be, "max", at()), ae(be, "step", at() === 1 ? 0.01 : 1), ae(be, "aria-label", `${a(g) ?? ""} ${s[a(se).dark].title ?? ""} ${Ye() ?? ""} value`), un(be, a(Pe)[we()]);
            }), Q("input", J, (dt) => c({
              [a(Re)]: {
                ...a(Pe),
                [we()]: Number(dt.currentTarget.value)
              }
            })), Q("input", be, (dt) => c({
              [a(Re)]: {
                ...a(Pe),
                [we()]: Number(dt.currentTarget.value)
              }
            })), R(Te, He);
          });
          var H = b(Tt, 2);
          let ee;
          var pe = f(H);
          q(
            (Te, me) => {
              A(Et, `${s[a(se).dark].title ?? ""} `), A(Bt, a(g)), A(et, s[a(se).dark].note), ee = fn(H, "", ee, Te), A(pe, me);
            },
            [
              () => ({ background: v(a(Pe)) }),
              () => v(a(Pe))
            ]
          ), R(ce, Qe);
        });
        var j = b(X, 2), I = b(f(j), 4);
        let rt;
        var V = f(I), S = f(V), k = b(V, 2);
        Ee(k, () => "Blur at the edge", () => a(u).blurEdge !== cn.blurEdge, () => () => x("blurEdge"));
        var O = b(j, 2), ue = b(f(O), 4);
        Ge(ue, 21, () => l, yt, (ce, se) => {
          var Re = /* @__PURE__ */ ne(() => Tr(a(se), 2));
          let Pe = () => a(Re)[0], Fe = () => a(Re)[1];
          var Qe = iu(), ct = f(Qe), Et = f(ct), Dt = b(ct);
          q(() => {
            A(Et, Pe()), A(Dt, ` — ${Fe() ?? ""}`);
          }), R(ce, Qe);
        });
        var ye = b(O, 2), de = b(f(ye), 4), fe = f(de), Se = b(fe, 2), he = b(Se, 2), Ne = f(he), We = b(de, 2);
        q(() => {
          A(G, `The five colours below are per theme, and you are editing the ${a(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), A(oe, `Edit the ${a(g) === "dark" ? "light" : "dark"} colours`), rt = xe(I, 1, "row toggle svelte-1hh0fwb", null, rt, { moved: a(u).blurEdge !== cn.blurEdge }), al(S, a(u).blurEdge), A(Ne, a(d) ? "Copied" : "Copy"), un(We, a(y));
        }), Q("click", te, N), Q("change", S, (ce) => c({ blurEdge: ce.currentTarget.checked })), Q("click", fe, () => _(nn)), Q("click", Se, () => _(cn)), Q("click", he, L);
      }
      R(P, D);
    };
    K(w, (P) => {
      a(o) && P(F);
    });
  }
  q(() => {
    z = xe(T, 1, "tuner svelte-1hh0fwb", null, z, { folded: !a(o) }), ae($, "title", a(o) ? "Fold away" : "Open"), A(B, a(o) ? "–" : "+");
  }), Wr("innerWidth", (P) => E(m, P, !0)), Q("click", $, () => E(o, !a(o))), R(e, T), gt();
}
zt(["click", "input", "change"]);
var cu = /* @__PURE__ */ C('<button><span class="n svelte-1n46o8q"> </span> </button>'), du = /* @__PURE__ */ C('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), fu = /* @__PURE__ */ C('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), hu = /* @__PURE__ */ C('<div class="muted pad svelte-1n46o8q">loading…</div>'), vu = /* @__PURE__ */ C('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), pu = /* @__PURE__ */ C('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), gu = /* @__PURE__ */ C('<p class="blurb"> </p>'), _u = /* @__PURE__ */ C('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), bu = /* @__PURE__ */ C('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), mu = /* @__PURE__ */ C('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), wu = /* @__PURE__ */ C('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), yu = /* @__PURE__ */ C("<div> </div>"), xu = /* @__PURE__ */ C('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function ku(e, t) {
  pt(t, !0);
  const n = location.pathname === "/tune";
  let r = /* @__PURE__ */ W("grid"), s = /* @__PURE__ */ W(0), i = /* @__PURE__ */ W(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ W(Ie([])), u = /* @__PURE__ */ W(null), o = /* @__PURE__ */ W(null), d = /* @__PURE__ */ W(Ie(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ W(null), m = /* @__PURE__ */ W(null), p = /* @__PURE__ */ W(null), h = /* @__PURE__ */ W(null), v = /* @__PURE__ */ W(!1), y = /* @__PURE__ */ W(!1), c = /* @__PURE__ */ W(!1), _ = /* @__PURE__ */ W(!1), x = /* @__PURE__ */ W(Ie({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), N = /* @__PURE__ */ W(null), L = /* @__PURE__ */ W(0), T = /* @__PURE__ */ W(null), z = /* @__PURE__ */ W(Ie({})), U = /* @__PURE__ */ W("newest"), $ = /* @__PURE__ */ W(Ie(Nl())), B = /* @__PURE__ */ W(null);
  const w = /* @__PURE__ */ ne(() => xa[a(s)]), F = /* @__PURE__ */ ne(() => a(w).table !== !1), P = /* @__PURE__ */ ne(() => a(F) || a(w).tree === !0), D = /* @__PURE__ */ ne(() => a(w).sheet !== !1 && (a(o) !== null || !a(P))), Z = /* @__PURE__ */ ne(() => ({
    sort: a(U),
    ...a($).on ? { stack: a($).window } : {},
    ...Object.fromEntries(Object.entries(a(z)).filter(([, M]) => M.length > 0))
  })), Y = /* @__PURE__ */ ne(() => a(r) === "grid" ? `grid:${JSON.stringify(a(Z))}` : `triage:${a(s)}:${JSON.stringify(a(o))}`), G = /* @__PURE__ */ ne(() => a(w).rule === !1 || a(d).size === 0 ? [] : a(l).filter((M) => a(d).has(M.key)).map((M) => a(w).toRule(M, a(i))).filter((M) => M && gs(a(m)?.rules ?? [], M) !== "exclude")), te = /* @__PURE__ */ ne(() => (a(m)?.rules ?? []).filter((M) => M.decision === "exclude" && M.term?.column === "dir_under").map((M) => String(M.term.value).replace(/[\\/]+$/, "").toLowerCase())), oe = ol();
  function X(M) {
    E(N, String(M), !0);
  }
  async function j(M) {
    try {
      return E(N, null), await M();
    } catch (J) {
      return X(J), null;
    }
  }
  const I = ul(
    () => {
      E(y, !0), j(async () => {
        const M = a(o)?.at === "end" || a(o)?.at === void 0 ? void 0 : 0, { stale: J, value: be } = await oe(() => Oe.counts(a(o), M));
        J || E(m, be, !0);
      }).finally(() => {
        E(y, !1);
      });
    },
    220
  );
  async function V() {
    E(p, "loading");
    const M = await j(() => Oe.files());
    E(p, M, !0), E(v, !1), E(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function S(M = !1) {
    if (a(r) !== "triage" || !a(F)) {
      E(l, [], !0);
      return;
    }
    E(_, !0);
    const J = a(w).name === "source_folder" && a(i) ? { root: a(i) } : {};
    M && (J.live = "1");
    const be = await j(() => Oe.screen(a(w).name, J));
    E(l, be?.rows ?? [], !0), E(_, !1);
  }
  let k = !1;
  sn(() => {
    a(s), a(r), wn(() => {
      E(u, null), E(o, null), E(i, null), de(), a(r) === "triage" && (S(), I.now(), k || (k = !0, V()));
    });
  }), sn(() => {
    a(i), wn(() => {
      a(r) === "triage" && (de(), S());
    });
  }), Hn(() => {
    j(async () => {
      E(T, await Oe.facets(), !0);
    });
  });
  function O(M, J) {
    E(z, { ...a(z), [M]: J }, !0);
  }
  function ue(M) {
    if (a(w).sheet !== !1) {
      if (a(w).drill && !a(i)) {
        E(u, M.key, !0), E(
          o,
          {
            ...a(w).toRule(M, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), E(i, M.key, !0);
        return;
      }
      E(u, M.key, !0), E(
        o,
        {
          ...a(w).toRule(M, a(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), I();
    }
  }
  function ye(M, J, be) {
    const $e = new Set(a(d)), dt = !$e.has(M.key), At = be && a(g) !== null ? a(l).findIndex((Xe) => Xe.key === a(g)) : -1, [Ve, Ue] = At < 0 ? [J, J] : At < J ? [At, J] : [J, At];
    for (let Xe = Ve; Xe <= Ue; Xe++)
      dt ? $e.add(a(l)[Xe].key) : $e.delete(a(l)[Xe].key);
    E(d, $e, !0), E(g, M.key, !0);
  }
  function de() {
    E(d, /* @__PURE__ */ new Set(), !0), E(g, null);
  }
  function fe(M) {
    E(o, M, !0), E(
      u,
      null
      // it no longer corresponds to a row
    ), I();
  }
  function Se(M = !1) {
    E(o, null), E(u, null), M && E(i, null), I.now();
  }
  async function he() {
    E(
      v,
      !0
      // the distinct-content number now says so on its face
    ), Mi(L), await S(), I.now();
  }
  async function Ne() {
    if (!a(o)) return;
    E(c, !0);
    const M = a(o).at === "end" ? void 0 : 0, J = await j(() => Oe.addRule(
      {
        column: a(o).column,
        op: a(o).op,
        value: a(o).value,
        decision: a(o).decision ?? "exclude",
        note: `screen ${a(w).id} ${a(w).title}`
      },
      M
    ));
    E(c, !1), J && (E(o, null), E(u, null), await he());
  }
  async function We() {
    const M = a(G);
    if (!M.length) {
      de();
      return;
    }
    E(c, !0);
    for (const J of M)
      if (!await j(() => Oe.addRule({
        column: J.column,
        op: J.op,
        value: J.value,
        decision: "exclude",
        note: `screen ${a(w).id} ${a(w).title}`
      }))) break;
    E(c, !1), de(), E(o, null), E(u, null), await he();
  }
  async function Ee(M) {
    if (!M || ia(a(te), M)) return;
    E(c, !0);
    const J = await j(() => Oe.addRule({
      column: "dir_under",
      op: "=",
      value: M,
      decision: "exclude",
      note: `screen ${a(w).id} ${a(w).title}`
    }));
    E(c, !1), J && await he();
  }
  const rt = (M) => Ee(ps(M.p ?? "")), ce = (M) => Ee(M.key);
  async function se(M) {
    E(c, !0), await j(() => Oe.deleteRule(M.id)), E(c, !1), await he();
  }
  async function Re(M, J) {
    E(c, !0), await j(() => Oe.moveRule(M.id, J)), E(c, !1), await he();
  }
  async function Pe() {
    await j(async () => {
      E(T, await Oe.facets(), !0);
    });
  }
  async function Fe(M, J) {
    const be = await j(() => Oe.override(M.s, J));
    return be ? (E(v, !0), I(), be.decision) : M.o ?? null;
  }
  function Qe(M) {
    return a(r) === "grid" ? Oe.photos({ limit: 500, ...a(Z), ...M || {} }) : Oe.page(a(o), M);
  }
  function ct(M, J) {
    if (a(r) === "grid" && M.m) {
      E(B, { frames: M.m, origin: J.getBoundingClientRect() }, !0);
      return;
    }
    j(() => a(r) === "grid" ? Oe.revealPhoto(M.id) : Oe.revealOrigin(M.id));
  }
  function Et(M) {
    E(B, null), j(() => Oe.revealPhoto(M.id));
  }
  var Dt = xu(), Bt = ot(Dt);
  {
    var _t = (M) => {
      Xl(M, {
        get facets() {
          return a(T);
        },
        get selected() {
          return a(z);
        },
        get sort() {
          return a(U);
        },
        get stacking() {
          return a($);
        },
        get total() {
          return a(x).total;
        },
        get tiles() {
          return a(x).tiles;
        },
        get loading() {
          return a(x).loading;
        },
        onselect: O,
        onsort: (J) => E(U, J, !0),
        onstack: (J) => E($, Ol(J), !0),
        onclear: () => E(z, {}, !0),
        ontriage: () => E(r, "triage")
      });
    };
    K(Bt, (M) => {
      a(r) === "grid" && M(_t);
    });
  }
  var et = b(Bt, 2);
  {
    var Tt = (M) => {
      uu(M, {});
    };
    K(et, (M) => {
      n && M(Tt);
    });
  }
  var H = b(et, 2);
  let ee;
  var pe = f(H);
  {
    var Te = (M) => {
      var J = pu(), be = f(J), $e = f(be), dt = b(be, 2);
      Ge(dt, 21, () => xa, yt, (Ke, ft, st) => {
        var Rt = cu();
        let Kt;
        var Jt = f(Rt), ke = f(Jt), it = b(Jt, 1, !0);
        q(() => {
          Kt = xe(Rt, 1, "nav svelte-1n46o8q", null, Kt, { on: st === a(s) }), A(ke, a(ft).id), A(it, a(ft).title);
        }), Q("click", Rt, () => E(s, st, !0)), R(Ke, Rt);
      });
      var At = b(dt, 2);
      {
        var Ve = (Ke) => {
          var ft = vu(), st = ot(ft), Rt = f(st);
          {
            var Kt = (Je) => {
              var tt = du(), yn = ot(tt), qn = /* @__PURE__ */ ne(() => Se.bind(null, !0)), kr = b(yn, 2), Sr = f(kr);
              q(() => A(Sr, `inside ${a(i) ?? ""}`)), Q("click", yn, function(...Er) {
                a(qn)?.apply(this, Er);
              }), R(Je, tt);
            }, Jt = (Je) => {
              var tt = fu(), yn = f(tt);
              q(() => A(yn, a(w).relive)), Q("click", tt, () => S(!0)), R(Je, tt);
            };
            K(Rt, (Je) => {
              a(w).drill && a(i) ? Je(Kt) : a(w).relive && Je(Jt, 1);
            });
          }
          var ke = b(st, 2);
          {
            var it = (Je) => {
              var tt = hu();
              R(Je, tt);
            };
            K(ke, (Je) => {
              a(_) && Je(it);
            });
          }
          var Zt = b(ke, 2);
          {
            let Je = /* @__PURE__ */ ne(() => a(m)?.rules ?? []);
            Uo(Zt, {
              get rows() {
                return a(l);
              },
              get screen() {
                return a(w);
              },
              get root() {
                return a(i);
              },
              get checked() {
                return a(d);
              },
              get rules() {
                return a(Je);
              },
              get selected() {
                return a(u);
              },
              onpick: ue,
              oncheck: ye
            });
          }
          R(Ke, ft);
        };
        K(At, (Ke) => {
          a(F) && Ke(Ve);
        });
      }
      var Ue = b(At, 2);
      {
        var Xe = (Ke) => {
          eu(Ke, {
            get root() {
              return Ln;
            },
            get version() {
              return a(L);
            },
            get excludedDirs() {
              return a(te);
            },
            get selected() {
              return a(u);
            },
            get busy() {
              return a(c);
            },
            onload: (ft) => j(() => Oe.tree(ft)),
            onpick: ue,
            onexclude: ce
          });
        };
        K(Ue, (Ke) => {
          a(w).tree && Ke(Xe);
        });
      }
      var ln = b(Ue, 2);
      {
        let Ke = /* @__PURE__ */ ne(() => a(m)?.rules ?? []), ft = /* @__PURE__ */ ne(() => a(m)?.unmatched ?? null);
        Ro(ln, {
          get rules() {
            return a(Ke);
          },
          get unmatched() {
            return a(ft);
          },
          get busy() {
            return a(c);
          },
          ondelete: se,
          onmove: Re
        });
      }
      var on = b(ln, 2);
      bo(on, { oncomplete: Pe }), Q("click", $e, () => E(r, "grid")), R(M, J);
    };
    K(pe, (M) => {
      a(r) === "triage" && M(Te);
    });
  }
  var me = b(pe, 2), ve = f(me);
  {
    var we = (M) => {
      var J = wu(), be = ot(J), $e = f(be), dt = b(be, 2), At = f(dt), Ve = b(dt, 2);
      {
        var Ue = (ke) => {
          var it = gu(), Zt = f(it);
          q(() => A(Zt, a(w).note)), R(ke, it);
        };
        K(Ve, (ke) => {
          a(w).note && ke(Ue);
        });
      }
      var Xe = b(Ve, 2);
      {
        var ln = (ke) => {
          lo(ke, {
            get screen() {
              return a(w);
            }
          });
        };
        K(Xe, (ke) => {
          a(w).name === "dimensions" && ke(ln);
        });
      }
      var on = b(Xe, 2);
      ml(on, {
        get counts() {
          return a(m);
        },
        get files() {
          return a(p);
        },
        get filesAt() {
          return a(h);
        },
        get stale() {
          return a(v);
        },
        get candidate() {
          return a(o);
        },
        get busy() {
          return a(y);
        },
        onfiles: V
      });
      var Ke = b(on, 2);
      {
        var ft = (ke) => {
          var it = _u(), Zt = f(it), Je = f(Zt), tt = b(Zt, 2), yn = f(tt), qn = b(tt, 2), kr = b(qn, 2), Sr = f(kr);
          {
            var Er = (Qt) => {
              var xn = Mn("already excluded — nothing left to write");
              R(Qt, xn);
            }, Ss = (Qt) => {
              var xn = Mn();
              q((Es) => A(xn, `one exclude rule each, at the end of the order${Es ?? ""}`), [
                () => a(G).length < a(d).size ? ` · ${Ce(a(d).size - a(G).length)} already excluded, skipped` : ""
              ]), R(Qt, xn);
            };
            K(Sr, (Qt) => {
              a(G).length ? Qt(Ss, -1) : Qt(Er);
            });
          }
          q(
            (Qt, xn) => {
              A(Je, `${Qt ?? ""} ticked`), tt.disabled = a(c) || !a(G).length, A(yn, xn), qn.disabled = a(c);
            },
            [
              () => Ce(a(d).size),
              () => a(c) ? "saving…" : `Exclude ${Ce(a(G).length)}`
            ]
          ), Q("click", tt, We), Q("click", qn, de), R(ke, it);
        };
        K(Ke, (ke) => {
          a(d).size && ke(ft);
        });
      }
      var st = b(Ke, 2);
      So(st, {
        get candidate() {
          return a(o);
        },
        get screen() {
          return a(w);
        },
        get saving() {
          return a(c);
        },
        onedit: fe,
        onconfirm: Ne,
        onclear: Se
      });
      var Rt = b(st, 2);
      {
        var Kt = (ke) => {
          var it = bu(), Zt = f(it);
          q((Je, tt) => A(Zt, `${Je ?? ""}${tt ?? ""} loaded${a(x).exhausted ? " · all of them" : ""}${a(x).loading ? " · loading…" : ""} `), [
            () => Ce(a(x).count),
            () => a(x).total ? " of " + Ce(a(x).total) : ""
          ]), R(ke, it);
        }, Jt = (ke) => {
          var it = mu();
          R(ke, it);
        };
        K(Rt, (ke) => {
          a(D) ? ke(Kt) : a(w).sheet === !1 && ke(Jt, 1);
        });
      }
      q(() => {
        A($e, `${a(w).id ?? ""} · ${a(w).title ?? ""}`), A(At, a(w).blurb);
      }), R(M, J);
    };
    K(ve, (M) => {
      a(r) === "triage" && M(we);
    });
  }
  var Ye = b(ve, 2);
  {
    var at = (M) => {
      {
        let J = /* @__PURE__ */ ne(() => a(r) === "grid" ? null : a(m)?.page_paths ?? null), be = /* @__PURE__ */ ne(() => a(r) === "triage");
        Lo(M, {
          get key() {
            return a(Y);
          },
          fetchPage: Qe,
          get total() {
            return a(J);
          },
          get triage() {
            return a(be);
          },
          get excludedDirs() {
            return a(te);
          },
          onActivate: ct,
          onOverride: Fe,
          onExcludeFolder: rt,
          onState: ($e) => E(x, { ...a(x), ...$e }, !0)
        });
      }
    };
    K(Ye, (M) => {
      (a(D) || a(r) === "grid") && M(at);
    });
  }
  var ge = b(H, 2);
  {
    var He = (M) => {
      to(M, {
        get frames() {
          return a(B).frames;
        },
        get origin() {
          return a(B).origin;
        },
        onreveal: Et,
        onclose: () => E(B, null)
      });
    };
    K(ge, (M) => {
      a(B) && M(He);
    });
  }
  var Mt = b(ge, 2);
  {
    var Be = (M) => {
      var J = yu();
      let be;
      var $e = f(J);
      q(() => {
        be = xe(J, 1, "status", null, be, { bare: a(r) === "grid" }), A($e, a(N));
      }), R(M, J);
    };
    K(Mt, (M) => {
      a(N) && M(Be);
    });
  }
  q(() => ee = xe(H, 1, "shell", null, ee, { bare: a(r) === "grid" })), R(e, Dt), gt();
}
zt(["click"]);
Il();
la();
Wi(ku, { target: document.getElementById("app") });
