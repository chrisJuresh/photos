var Vr = Array.isArray, Es = Array.prototype.indexOf, ur = Array.prototype.includes, wr = Array.from, Ts = Object.defineProperty, An = Object.getOwnPropertyDescriptor, Ms = Object.getOwnPropertyDescriptors, As = Object.prototype, Rs = Array.prototype, Ra = Object.getPrototypeOf, la = Object.isExtensible;
const ir = () => {
};
function Ps(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Pa() {
  var e, t, n = new Promise((a, s) => {
    e = a, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
function Tr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const a of e)
    if (n.push(a), n.length === t) break;
  return n;
}
const qe = 2, Cn = 4, yr = 8, Ca = 1 << 24, Ot = 16, kt = 32, Wt = 64, Fr = 128, xt = 512, ze = 1024, De = 2048, Lt = 4096, nt = 8192, vt = 16384, zn = 32768, Lr = 1 << 25, Nn = 65536, cr = 1 << 17, Cs = 1 << 18, Dn = 1 << 19, Ns = 1 << 20, jt = 1 << 25, _n = 65536, dr = 1 << 21, Rn = 1 << 22, rn = 1 << 23, hn = Symbol("$state"), Os = Symbol("legacy props"), Is = Symbol(""), Na = Symbol("attributes"), zr = Symbol("class"), Dr = Symbol("style"), jr = Symbol("text"), er = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Fs = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Ls(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function zs() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Ds(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function js(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Hs() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function qs(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Bs() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function $s(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Us() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Gs() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ys() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ws() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Vs = 1, Xs = 2, Oa = 4, Ks = 8, Js = 16, Zs = 1, Qs = 4, ei = 8, ti = 16, ni = 1, ri = 2, Le = Symbol("uninitialized"), ai = "http://www.w3.org/1999/xhtml";
function si() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function ii() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function li() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Ia(e) {
  return e === this.v;
}
function oi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Fa(e) {
  return !oi(e, this.v);
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
      le
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
    for (var a of n)
      Qa(a);
  }
  return t.i = !0, Ze = t.p, /** @type {T} */
  {};
}
function La() {
  return !0;
}
let En = [];
function ui() {
  var e = En;
  En = [], Ps(e);
}
function Gt(e) {
  if (En.length === 0) {
    var t = En;
    queueMicrotask(() => {
      t === En && ui();
    });
  }
  En.push(e);
}
function za(e) {
  var t = le;
  if (t === null)
    return ue.f |= rn, e;
  if ((t.f & zn) === 0 && (t.f & Cn) === 0)
    throw e;
  tn(e, t);
}
function tn(e, t) {
  if (!(t !== null && (t.f & vt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & Fr) !== 0) {
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
const ci = -7169;
function Ae(e, t) {
  e.f = e.f & ci | t;
}
function Xr(e) {
  (e.f & xt) !== 0 || e.deps === null ? Ae(e, ze) : Ae(e, Lt);
}
function Da(e) {
  if (e !== null)
    for (const t of e)
      (t.f & qe) === 0 || (t.f & _n) === 0 || (t.f ^= _n, Da(
        /** @type {Derived} */
        t.deps
      ));
}
function ja(e, t, n) {
  (e.f & De) !== 0 ? t.add(e) : (e.f & Lt) !== 0 && n.add(e), Da(e.deps), Ae(e, ze);
}
let rr = !1;
function di(e) {
  var t = rr;
  try {
    return rr = !1, [e(), rr];
  } finally {
    rr = t;
  }
}
function fi(e, t, n, a = !0) {
  a && n();
  for (var s of t)
    e.addEventListener(s, n);
  xr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function jn(e) {
  var t = ue, n = le;
  St(null), qt(null);
  try {
    return e();
  } finally {
    St(t), qt(n);
  }
}
function hi(e) {
  let t = 0, n = bn(0), a;
  return () => {
    Qr() && (r(n), ts(() => (t === 0 && (a = wn(() => e(() => Jn(n)))), t += 1, () => {
      Gt(() => {
        t -= 1, t === 0 && (a?.(), a = void 0, Jn(n));
      });
    })));
  };
}
var vi = Nn | Dn;
function pi(e, t, n, a) {
  new gi(e, t, n, a);
}
class gi {
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
  #b = hi(() => (this.#d = bn(this.#p), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, a, s) {
    this.#t = t, this.#e = n, this.#o = (i) => {
      var l = (
        /** @type {Effect} */
        le
      );
      l.b = this, l.f |= Fr, a(i);
    }, this.parent = /** @type {Effect} */
    le.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#r = ea(() => {
      this.#h();
    }, vi);
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
    const n = this.#e.failed, { reset: a, invoke_onerror: s } = this.#m(t);
    Gt(s), n && (this.#l = wt(() => {
      n(
        this.#t,
        () => t,
        () => a
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
    var n = !1, a = !1;
    const s = () => {
      if (n) {
        li();
        return;
      }
      n = !0, a && Ws(), this.#l !== null && pn(this.#l, () => {
        this.#l = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: s, invoke_onerror: () => {
      try {
        a = !0, this.#e.onerror?.(t, s), a = !1;
      } catch (l) {
        tn(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = wt(() => t(this.#t)), Gt(() => {
      var n = this.#a = document.createDocumentFragment(), a = Yt();
      n.append(a), this.#s = this.#v(() => wt(() => this.#o(a))), this.#u === 0 && (this.#t.before(n), this.#a = null, pn(
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
        na(this.#s, t);
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
    ja(t, this.#f, this.#g);
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
    var n = le, a = ue, s = Ze;
    qt(this.#r), St(this.#r), On(this.#r.ctx);
    try {
      return an.ensure(), t();
    } catch (i) {
      return za(i), null;
    } finally {
      qt(n), St(a), On(s);
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
    return this.#b(), r(
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
    const a = (s) => {
      const { reset: i, invoke_onerror: l } = this.#m(s);
      l(), n && (this.#l = this.#v(() => {
        try {
          return wt(() => {
            var u = (
              /** @type {Effect} */
              le
            );
            u.b = this, u.f |= Fr, n(
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
        a,
        /** @param {unknown} e */
        (i) => tn(i, this.#r && this.#r.parent)
      ) : a(s);
    });
  }
}
function _i(e, t, n, a) {
  const s = Zn;
  var i = e.filter((h) => !h.settled), l = t.map(s);
  if (n.length === 0 && i.length === 0) {
    a(l);
    return;
  }
  var u = (
    /** @type {Effect} */
    le
  ), o = bi(), d = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function g(h) {
    if ((u.f & vt) === 0) {
      o();
      try {
        a([...l, ...h]);
      } catch (v) {
        tn(v, u);
      }
      fr();
    }
  }
  var m = Ha();
  if (n.length === 0) {
    d.then(() => g([])).finally(m);
    return;
  }
  function p() {
    Promise.all(n.map((h) => /* @__PURE__ */ mi(h))).then(g).catch((h) => tn(h, u)).finally(m);
  }
  d ? d.then(() => {
    o(), p(), fr();
  }) : p();
}
function bi() {
  var e = (
    /** @type {Effect} */
    le
  ), t = ue, n = Ze, a = (
    /** @type {Batch} */
    _e
  );
  return function(i = !0) {
    qt(e), St(t), On(n), i && (e.f & vt) === 0 && (a?.activate(), a?.apply());
  };
}
function fr(e = !0) {
  qt(null), St(null), On(null), e && _e?.deactivate();
}
function Ha() {
  var e = (
    /** @type {Effect} */
    le
  ), t = e.b, n = (
    /** @type {Batch} */
    _e
  ), a = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(a, e), () => {
    t?.update_pending_count(-1, n), n.decrement(a, e);
  };
}
// @__NO_SIDE_EFFECTS__
function Zn(e) {
  var t = qe | De;
  return le !== null && (le.f |= Dn), {
    ctx: Ze,
    deps: null,
    effects: null,
    equals: Ia,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Le
    ),
    wv: 0,
    parent: le,
    ac: null
  };
}
const Yn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function mi(e, t, n) {
  let a = (
    /** @type {Effect | null} */
    le
  );
  a === null && zs();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = bn(
    /** @type {V} */
    Le
  ), l = !ue, u = /* @__PURE__ */ new Set();
  return Ii(() => {
    var o = (
      /** @type {Effect} */
      le
    ), d = Pa();
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
        var m = Ha();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        a.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(Yn);
      else
        for (const h of u.values())
          h.reject(Yn);
      u.add(d), g.async_deriveds.set(o, d);
    }
    const p = (h, v = void 0) => {
      m?.(), u.delete(d), v !== Yn && (g.activate(), v ? (i.f |= rn, In(i, v)) : ((i.f & rn) !== 0 && (i.f ^= rn), In(i, h)), g.deactivate());
    };
    d.promise.then(p, (h) => p(null, h || "unknown"));
  }), xr(() => {
    for (const o of u)
      o.reject(Yn);
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
  return is(t), t;
}
// @__NO_SIDE_EFFECTS__
function qa(e) {
  const t = /* @__PURE__ */ Zn(e);
  return t.equals = Fa, t;
}
function wi(e) {
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
function Kr(e) {
  var t, n = le, a = e.parent;
  if (!Vt && a !== null && e.v !== Le && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (a.f & (vt | nt)) !== 0)
    return si(), e.v;
  qt(a);
  try {
    e.f &= ~_n, wi(e), t = cs(e);
  } finally {
    qt(n);
  }
  return t;
}
function Ba(e) {
  var t = Kr(e);
  if (!e.equals(t) && (e.wv = os(), (!_e?.is_fork || e.deps === null) && (_e !== null ? (_e.capture(e, t, !0), Hr?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Ae(e, ze);
    return;
  }
  Vt || (It !== null ? (Qr() || _e?.is_fork) && It.set(e, t) : Xr(e));
}
function yi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && jn(() => {
        t.ac.abort(er), t.ac = null;
      }), t.fn !== null && (t.teardown = ir), Qn(t, 0), ta(t));
}
function $a(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Fn(t);
}
let Mr = null, kn = null, _e = null, Hr = null, It = null, qr = null, Ar = !1, Tn = null, lr = null;
var oa = 0;
let xi = 1;
class an {
  id = xi++;
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
    for (const a of this.#n.keys()) {
      for (var t = a, n = !1; t.parent !== null; ) {
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
  unskip_effect(t, n = (a) => this.schedule(a)) {
    var a = this.#f.get(t);
    if (a) {
      this.#f.delete(t);
      for (var s of a.d)
        Ae(s, De), n(s);
      for (s of a.m)
        Ae(s, Lt), n(s);
    }
    this.#g.add(t);
  }
  #_() {
    this.#t = !0, oa++ > 1e3 && (this.#v(), ki());
    for (const o of this.#u)
      this.#c.delete(o), Ae(o, De), this.schedule(o);
    for (const o of this.#c)
      Ae(o, Lt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Tn = [], a = [], s = lr = [];
    for (const o of t)
      try {
        this.#y(o, n, a);
      } catch (d) {
        throw Ya(o), this.#b() || this.discard(), d;
      }
    if (_e = null, s.length > 0) {
      var i = an.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (Tn = null, lr = null, this.#b()) {
      this.#h(a), this.#h(n);
      for (const [o, d] of this.#f)
        Ga(o, d);
      s.length > 0 && /** @type {unknown} */
      _e.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(a), this.#h(n), l.#x(this);
      return;
    }
    this.#u.clear(), this.#c.clear();
    for (const o of this.#o) o(this);
    this.#o.clear(), Hr = this, ua(a), ua(n), Hr = null, this.#l?.resolve();
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
  #y(t, n, a) {
    t.f ^= ze;
    for (var s = t.first; s !== null; ) {
      var i = s.f, l = (i & (kt | Wt)) !== 0, u = l && (i & ze) !== 0, o = u || (i & nt) !== 0 || this.#f.has(s);
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
        for (const [n, [, a]] of this.current)
          if (t.current.has(n) && !a)
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
    for (const [a, s] of t.current)
      !this.previous.has(a) && t.previous.has(a) && this.previous.set(a, t.previous.get(a)), this.current.set(a, s);
    for (const [a, s] of t.async_deriveds) {
      const i = this.async_deriveds.get(a);
      i && s.promise.then(i.resolve).catch(i.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#u, t.#c);
    const n = (a) => {
      var s = a.reactions;
      if (s !== null && !((a.f & qe) !== 0 && (a.f & (De | Lt)) === 0))
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
    for (const a of this.current.keys())
      n(a);
    this.oncommit(() => t.discard()), t.#v(), _e = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      ja(t[n], this.#u, this.#c);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, a = !1) {
    t.v !== Le && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & rn) === 0 && (this.current.set(t, [n, a]), It?.set(t, n)), this.is_fork || (t.v = n);
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
      oa = 0, qr = null, Tn = null, lr = null, Ar = !1, _e = null, It = null, vn.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Yn);
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
          var a = (
            /** @type {[any, boolean]} */
            m.current.get(p)[0]
          );
          if (t && h !== a)
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
            Ua(o, i, l, u);
          u = /* @__PURE__ */ new Map();
          var d = [...m.current].filter(([p, h]) => {
            const v = this.current.get(p);
            return v ? v[0] !== h[0] || v[1] !== h[1] : !0;
          }).map(([p]) => p);
          if (d.length > 0)
            for (const p of this.#p)
              (p.f & (vt | nt | cr)) === 0 && Jr(p, d, u) && ((p.f & (Rn | Ot)) !== 0 ? (Ae(p, De), m.schedule(p)) : m.#u.add(p));
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
      let a = this.#n.get(n) ?? 0;
      this.#n.set(n, a + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  decrement(t, n) {
    if (this.#s -= 1, t) {
      let a = this.#n.get(n) ?? 0;
      a === 1 ? this.#n.delete(n) : this.#n.set(n, a - 1);
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
    for (const a of t)
      this.#u.add(a);
    for (const a of n)
      this.#c.add(a);
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
    return (this.#l ??= Pa()).promise;
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
    if (qr = t, t.b?.is_pending && (t.f & (Cn | yr | Ca)) !== 0 && (t.f & zn) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var a = n.f;
      if (Tn !== null && n === le && (ue === null || (ue.f & qe) === 0))
        return;
      if ((a & (Wt | kt)) !== 0) {
        if ((a & ze) === 0)
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
function ki() {
  try {
    Bs();
  } catch (e) {
    tn(e, qr);
  }
}
let Ut = null;
function ua(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var a = e[n++];
      if ((a.f & (vt | nt)) === 0 && nr(a) && (Ut = /* @__PURE__ */ new Set(), Fn(a), a.deps === null && a.first === null && a.nodes === null && a.teardown === null && a.ac === null && rs(a), Ut?.size > 0)) {
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
function Ua(e, t, n, a) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & qe) !== 0 ? Ua(
        /** @type {Derived} */
        s,
        t,
        n,
        a
      ) : (i & (Rn | Ot)) !== 0 && (i & De) === 0 && Jr(s, t, a) && (Ae(s, De), Zr(
        /** @type {Effect} */
        s
      ));
    }
}
function Jr(e, t, n) {
  const a = n.get(e);
  if (a !== void 0) return a;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (ur.call(t, s))
        return !0;
      if ((s.f & qe) !== 0 && Jr(
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
function Zr(e) {
  _e.schedule(e);
}
function Ga(e, t) {
  if (!((e.f & kt) !== 0 && (e.f & ze) !== 0)) {
    (e.f & De) !== 0 ? t.d.push(e) : (e.f & Lt) !== 0 && t.m.push(e), Ae(e, ze);
    for (var n = e.first; n !== null; )
      Ga(n, t), n = n.next;
  }
}
function Ya(e) {
  Ae(e, ze);
  for (var t = e.first; t !== null; )
    Ya(t), t = t.next;
}
let hr = /* @__PURE__ */ new Set();
const vn = /* @__PURE__ */ new Map();
let Wa = !1;
function bn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ia,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  const n = bn(e);
  return is(n), n;
}
// @__NO_SIDE_EFFECTS__
function Si(e, t = !1, n = !0) {
  const a = bn(e);
  return t || (a.equals = Fa), a;
}
function E(e, t, n = !1) {
  ue !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ft || (ue.f & cr) !== 0) && La() && (ue.f & (qe | Ot | Rn | cr)) !== 0 && (Ht === null || !Ht.has(e)) && Ys();
  let a = n ? Ie(t) : t;
  return In(e, a, lr);
}
function In(e, t, n = null) {
  if (!e.equals(t)) {
    vn.set(e, Vt ? t : e.v);
    var a = an.ensure();
    if (a.capture(e, t), (e.f & qe) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & De) !== 0 && Kr(s), It === null && Xr(s);
    }
    e.wv = os(), Va(e, De, n), le !== null && (le.f & ze) !== 0 && (le.f & (kt | Wt)) === 0 && (mt === null ? zi([e]) : mt.push(e)), !a.is_fork && hr.size > 0 && !Wa && Ei();
  }
  return t;
}
function Ei() {
  Wa = !1;
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
function Ti(e, t = 1) {
  var n = r(e), a = t === 1 ? n++ : n--;
  return E(e, n), a;
}
function Jn(e) {
  E(e, e.v + 1);
}
function Va(e, t, n) {
  var a = e.reactions;
  if (a !== null)
    for (var s = a.length, i = 0; i < s; i++) {
      var l = a[i], u = l.f, o = (u & De) === 0;
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
        It?.delete(d), (u & _n) === 0 && (u & xt && (le === null || (le.f & dr) === 0) && (l.f |= _n), Va(d, Lt, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (u & Ot) !== 0 && Ut !== null && Ut.add(g), n !== null ? n.push(g) : Zr(g);
      }
    }
}
function Ie(e) {
  if (typeof e != "object" || e === null || hn in e)
    return e;
  const t = Ra(e);
  if (t !== As && t !== Rs)
    return e;
  var n = /* @__PURE__ */ new Map(), a = Vr(e), s = /* @__PURE__ */ Y(0), i = gn, l = (u) => {
    if (gn === i)
      return u();
    var o = ue, d = gn;
    St(null), fa(i);
    var g = u();
    return St(o), fa(d), g;
  };
  return a && n.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && Us();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var m = /* @__PURE__ */ Y(d.value);
          return n.set(o, m), m;
        }) : E(g, d.value, !0), !0;
      },
      deleteProperty(u, o) {
        var d = n.get(o);
        if (d === void 0) {
          if (o in u) {
            const g = l(() => /* @__PURE__ */ Y(Le));
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
          var h = Ie(m ? u[o] : Le), v = /* @__PURE__ */ Y(h);
          return v;
        }), n.set(o, g)), g !== void 0) {
          var p = r(g);
          return p === Le ? void 0 : p;
        }
        return Reflect.get(u, o, d);
      },
      getOwnPropertyDescriptor(u, o) {
        var d = Reflect.getOwnPropertyDescriptor(u, o);
        if (d && "value" in d) {
          var g = n.get(o);
          g && (d.value = r(g));
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
        if (d !== void 0 || le !== null && (!g || An(u, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var p = g ? Ie(u[o]) : Le, h = /* @__PURE__ */ Y(p);
            return h;
          }), n.set(o, d));
          var m = r(d);
          if (m === Le)
            return !1;
        }
        return g;
      },
      set(u, o, d, g) {
        var m = n.get(o), p = o in u;
        if (a && o === "length")
          for (var h = d; h < /** @type {Source<number>} */
          m.v; h += 1) {
            var v = n.get(h + "");
            v !== void 0 ? E(v, Le) : h in u && (v = l(() => /* @__PURE__ */ Y(Le)), n.set(h + "", v));
          }
        if (m === void 0)
          (!p || An(u, o)?.writable) && (m = l(() => /* @__PURE__ */ Y(void 0)), E(m, Ie(d)), n.set(o, m));
        else {
          p = m.v !== Le;
          var y = l(() => Ie(d));
          E(m, y);
        }
        var c = Reflect.getOwnPropertyDescriptor(u, o);
        if (c?.set && c.set.call(g, d), !p) {
          if (a && typeof o == "string") {
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
        r(s);
        var o = Reflect.ownKeys(u).filter((m) => {
          var p = n.get(m);
          return p === void 0 || p.v !== Le;
        });
        for (var [d, g] of n)
          g.v !== Le && !(d in u) && o.push(d);
        return o;
      },
      setPrototypeOf() {
        Gs();
      }
    }
  );
}
function ca(e) {
  try {
    if (e !== null && typeof e == "object" && hn in e)
      return e[hn];
  } catch {
  }
  return e;
}
function Mi(e, t) {
  return Object.is(ca(e), ca(t));
}
var mn, Xa, Ka, Ja;
function Ai() {
  if (mn === void 0) {
    mn = window, Xa = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ka = An(t, "firstChild").get, Ja = An(t, "nextSibling").get, la(e) && (e[zr] = void 0, e[Na] = null, e[Dr] = void 0, e.__e = void 0), la(n) && (n[jr] = void 0);
  }
}
function Yt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function vr(e) {
  return (
    /** @type {TemplateNode | null} */
    Ka.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function tr(e) {
  return (
    /** @type {TemplateNode | null} */
    Ja.call(e)
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
  let a = e;
  for (; t--; )
    a = /** @type {TemplateNode} */
    /* @__PURE__ */ tr(a);
  return a;
}
function Ri(e) {
  e.textContent = "";
}
function Za() {
  return !1;
}
function Pi(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Ci(e) {
  le === null && (ue === null && qs(), Hs()), Vt && js();
}
function Ni(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Xt(e, t) {
  var n = le;
  n !== null && (n.f & nt) !== 0 && (e |= nt);
  var a = {
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
  _e?.register_created_effect(a);
  var s = a;
  if ((e & Cn) !== 0)
    Tn !== null ? Tn.push(a) : an.ensure().schedule(a);
  else if (t !== null) {
    try {
      Fn(a);
    } catch (l) {
      throw ut(a), l;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & Dn) === 0 && (s = s.first, (e & Ot) !== 0 && (e & Nn) !== 0 && s !== null && (s.f |= Nn));
  }
  if (s !== null && (s.parent = n, n !== null && Ni(s, n), ue !== null && (ue.f & qe) !== 0 && (e & Wt) === 0)) {
    var i = (
      /** @type {Derived} */
      ue
    );
    (i.effects ??= []).push(s);
  }
  return a;
}
function Qr() {
  return ue !== null && !Ft;
}
function xr(e) {
  const t = Xt(yr, null);
  return Ae(t, ze), t.teardown = e, t;
}
function sn(e) {
  Ci();
  var t = (
    /** @type {Effect} */
    le.f
  ), n = !ue && (t & kt) !== 0 && Ze !== null && !Ze.i;
  if (n) {
    var a = (
      /** @type {ComponentContext} */
      Ze
    );
    (a.e ??= []).push(e);
  } else
    return Qa(e);
}
function Qa(e) {
  return Xt(Cn | Ns, e);
}
function Oi(e) {
  an.ensure();
  const t = Xt(Wt | Dn, e);
  return (n = {}) => new Promise((a) => {
    n.outro ? pn(t, () => {
      ut(t), a(void 0);
    }) : (ut(t), a(void 0));
  });
}
function es(e) {
  return Xt(Cn, e);
}
function Ii(e) {
  return Xt(Rn | Dn, e);
}
function ts(e, t = 0) {
  return Xt(yr | t, e);
}
function q(e, t = [], n = [], a = []) {
  _i(a, t, n, (s) => {
    Xt(yr, () => {
      e(...s.map(r));
    });
  });
}
function ea(e, t = 0) {
  var n = Xt(Ot | t, e);
  return n;
}
function wt(e) {
  return Xt(kt | Dn, e);
}
function ns(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Vt, a = ue;
    da(!0), St(null);
    try {
      t.call(null);
    } finally {
      da(n), St(a);
    }
  }
}
function ta(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && jn(() => {
      s.abort(er);
    });
    var a = n.next;
    (n.f & Wt) !== 0 ? n.parent = null : ut(n, t), n = a;
  }
}
function Fi(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & kt) === 0 && ut(t), t = n;
  }
}
function ut(e, t = !0) {
  var n = !1;
  (t || (e.f & Cs) !== 0) && e.nodes !== null && e.nodes.end !== null && (Li(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Lr, ta(e, t && !n), Qn(e, 0);
  var a = e.nodes && e.nodes.t;
  if (a !== null)
    for (const i of a)
      i.stop();
  ns(e), e.f ^= Lr, e.f |= vt;
  var s = e.parent;
  s !== null && s.first !== null && rs(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Li(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ tr(e);
    e.remove(), e = n;
  }
}
function rs(e) {
  var t = e.parent, n = e.prev, a = e.next;
  n !== null && (n.next = a), a !== null && (a.prev = n), t !== null && (t.first === e && (t.first = a), t.last === e && (t.last = n));
}
function pn(e, t, n = !0) {
  var a = [];
  as(e, a, !0);
  var s = () => {
    n && ut(e), t && t();
  }, i = a.length;
  if (i > 0) {
    var l = () => --i || s();
    for (var u of a)
      u.out(l);
  } else
    s();
}
function as(e, t, n) {
  if ((e.f & nt) === 0) {
    e.f ^= nt;
    var a = e.nodes && e.nodes.t;
    if (a !== null)
      for (const u of a)
        (u.is_global || n) && t.push(u);
    for (var s = e.first; s !== null; ) {
      var i = s.next;
      if ((s.f & Wt) === 0) {
        var l = (s.f & Nn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (s.f & kt) !== 0 && (e.f & Ot) !== 0;
        as(s, t, l ? n : !1);
      }
      s = i;
    }
  }
}
function pr(e) {
  ss(e, !0);
}
function ss(e, t) {
  if ((e.f & nt) !== 0) {
    e.f ^= nt, (e.f & ze) === 0 && (Ae(e, De), an.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var a = n.next, s = (n.f & Nn) !== 0 || (n.f & kt) !== 0;
      ss(n, s ? t : !1), n = a;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function na(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, a = e.nodes.end; n !== null; ) {
      var s = n === a ? null : /* @__PURE__ */ tr(n);
      t.append(n), n = s;
    }
}
let or = !1, Vt = !1;
function da(e) {
  Vt = e;
}
let ue = null, Ft = !1;
function St(e) {
  ue = e;
}
let le = null;
function qt(e) {
  le = e;
}
let Ht = null;
function is(e) {
  ue !== null && (Ht ??= /* @__PURE__ */ new Set()).add(e);
}
let lt = null, ht = 0, mt = null;
function zi(e) {
  mt = e;
}
let ls = 1, dn = 0, gn = dn;
function fa(e) {
  gn = e;
}
function os() {
  return ++ls;
}
function nr(e) {
  var t = e.f;
  if ((t & De) !== 0)
    return !0;
  if (t & qe && (e.f &= ~_n), (t & Lt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), a = n.length, s = 0; s < a; s++) {
      var i = n[s];
      if (nr(
        /** @type {Derived} */
        i
      ) && Ba(
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
function us(e, t, n = !0) {
  var a = e.reactions;
  if (a !== null && !(Ht !== null && Ht.has(e)))
    for (var s = 0; s < a.length; s++) {
      var i = a[s];
      (i.f & qe) !== 0 ? us(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Ae(i, De) : (i.f & ze) !== 0 && Ae(i, Lt), Zr(
        /** @type {Effect} */
        i
      ));
    }
}
function cs(e) {
  var t = lt, n = ht, a = mt, s = ue, i = Ht, l = Ze, u = Ft, o = gn, d = e.f;
  lt = /** @type {null | Value[]} */
  null, ht = 0, mt = null, ue = (d & (kt | Wt)) === 0 ? e : null, Ht = null, On(e.ctx), Ft = !1, gn = ++dn, e.ac !== null && (jn(() => {
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
      if (Qr() && (e.f & xt) !== 0)
        for (v = ht; v < p.length; v++)
          (p[v].reactions ??= []).push(e);
    } else !h && p !== null && ht < p.length && (Qn(e, ht), p.length = ht);
    if (La() && mt !== null && !Ft && p !== null && (e.f & (qe | Lt | De)) === 0)
      for (v = 0; v < /** @type {Source[]} */
      mt.length; v++)
        us(
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
      mt !== null && (a === null ? a = mt : a.push(.../** @type {Source[]} */
      mt));
    }
    return (e.f & rn) !== 0 && (e.f ^= rn), m;
  } catch (y) {
    return za(y);
  } finally {
    e.f ^= dr, lt = t, ht = n, mt = a, ue = s, Ht = i, On(l), Ft = u, gn = o;
  }
}
function Di(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var a = Es.call(n, e);
    if (a !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[a] = n[s], n.pop());
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
    (i.f & xt) !== 0 && (i.f ^= xt, i.f &= ~_n), i.v !== Le && Xr(i), i.ac !== null && jn(() => {
      i.ac.abort(er), i.ac = null, Ae(i, De);
    }), yi(i), Qn(i, 0);
  }
}
function Qn(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var a = t; a < n.length; a++)
      Di(e, n[a]);
}
function Fn(e) {
  var t = e.f;
  if ((t & vt) === 0) {
    Ae(e, ze);
    var n = le, a = or;
    le = e, or = (t & (kt | Wt)) === 0;
    try {
      (t & (Ot | Ca)) !== 0 ? Fi(e) : ta(e), ns(e);
      var s = cs(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = ls;
      var i;
    } finally {
      or = a, le = n;
    }
  }
}
function r(e) {
  var t = e.f, n = (t & qe) !== 0;
  if (ue !== null && !Ft) {
    var a = le !== null && (le.f & vt) !== 0;
    if (!a && (Ht === null || !Ht.has(e))) {
      var s = ue.deps;
      if ((ue.f & dr) !== 0)
        e.rv < dn && (e.rv = dn, lt === null && s !== null && s[ht] === e ? ht++ : lt === null ? lt = [e] : lt.push(e));
      else {
        ue.deps ??= [], ur.call(ue.deps, e) || ue.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [ue] : ur.call(i, ue) || i.push(ue);
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
      return ((l.f & ze) === 0 && l.reactions !== null || fs(l)) && (u = Kr(l)), vn.set(l, u), u;
    }
    var o = (l.f & xt) === 0 && !Ft && ue !== null && (or || (ue.f & xt) !== 0), d = (l.f & zn) === 0;
    nr(l) && (o && (l.f |= xt), Ba(l)), o && !d && ($a(l), ds(l));
  }
  if (It?.has(e))
    return It.get(e);
  if ((e.f & rn) !== 0)
    throw e.v;
  return e.v;
}
function ds(e) {
  if (e.f |= xt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & qe) !== 0 && (t.f & xt) === 0 && ($a(
        /** @type {Derived} */
        t
      ), ds(
        /** @type {Derived} */
        t
      ));
}
function fs(e) {
  if (e.v === Le) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (vn.has(t) || (t.f & qe) !== 0 && fs(
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
const ji = ["touchstart", "touchmove"];
function Hi(e) {
  return ji.includes(e);
}
const Wn = Symbol("events"), hs = /* @__PURE__ */ new Set(), Br = /* @__PURE__ */ new Set();
function qi(e, t, n, a = {}) {
  function s(i) {
    if (a.capture || $r.call(t, i), !i.cancelBubble)
      return jn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Gt(() => {
    t.addEventListener(e, s, a);
  }) : t.addEventListener(e, s, a), s;
}
function Pn(e, t, n, a, s) {
  var i = { capture: a, passive: s }, l = qi(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && xr(() => {
    t.removeEventListener(e, l, i);
  });
}
function Q(e, t, n) {
  (t[Wn] ??= {})[e] = n;
}
function zt(e) {
  for (var t = 0; t < e.length; t++)
    hs.add(e[t]);
  for (var n of Br)
    n(e);
}
let ha = null;
function $r(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), a = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  ha = e;
  var l = 0, u = ha === e && e[Wn];
  if (u) {
    var o = s.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Wn] = t;
      return;
    }
    var d = s.indexOf(t);
    if (d === -1)
      return;
    o <= d && (l = o);
  }
  if (i = /** @type {Element} */
  s[l] || e.target, i !== t) {
    Ts(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = ue, m = le;
    St(null), qt(null);
    try {
      for (var p, h = []; i !== null && i !== t; ) {
        try {
          var v = i[Wn]?.[a];
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
      e[Wn] = t, delete e.currentTarget, St(g), qt(m);
    }
  }
}
const Bi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function $i(e) {
  return (
    /** @type {string} */
    Bi?.createHTML(e) ?? e
  );
}
function Ui(e) {
  var t = Pi("template");
  return t.innerHTML = $i(e.replaceAll("<!>", "<!---->")), t.content;
}
function gr(e, t) {
  var n = (
    /** @type {Effect} */
    le
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function C(e, t) {
  var n = (t & ni) !== 0, a = (t & ri) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = Ui(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ vr(s)));
    var l = (
      /** @type {TemplateNode} */
      a || Xa ? document.importNode(s, !0) : s.cloneNode(!0)
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
    var t = Yt(e + "");
    return gr(t, t), t;
  }
}
function ra() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Yt();
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
  (e[jr] ??= e.nodeValue) && (e[jr] = n, e.nodeValue = `${n}`);
}
function Gi(e, t) {
  return Yi(e, t);
}
const ar = /* @__PURE__ */ new Map();
function Yi(e, { target: t, anchor: n, props: a = {}, events: s, context: i, intro: l = !0, transformError: u }) {
  Ai();
  var o = void 0, d = Oi(() => {
    var g = n ?? t.appendChild(Yt());
    pi(
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
        i && (v.c = i), s && (a.$$events = s), o = e(h, a) || {}, gt();
      },
      u
    );
    var m = /* @__PURE__ */ new Set(), p = (h) => {
      for (var v = 0; v < h.length; v++) {
        var y = h[v];
        if (!m.has(y)) {
          m.add(y);
          var c = Hi(y);
          for (const N of [t, document]) {
            var _ = ar.get(N);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), ar.set(N, _));
            var x = _.get(y);
            x === void 0 ? (N.addEventListener(y, $r, { passive: c }), _.set(y, 1)) : _.set(y, x + 1);
          }
        }
      }
    };
    return p(wr(hs)), Br.add(p), () => {
      for (var h of m)
        for (const c of [t, document]) {
          var v = (
            /** @type {Map<string, number>} */
            ar.get(c)
          ), y = (
            /** @type {number} */
            v.get(h)
          );
          --y == 0 ? (c.removeEventListener(h, $r), v.delete(h), v.size === 0 && ar.delete(c)) : v.set(h, y);
        }
      Br.delete(p), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return Wi.set(o, d), o;
}
let Wi = /* @__PURE__ */ new WeakMap();
class Vi {
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
      ), a = this.#i.get(n);
      if (a)
        pr(a), this.#o.delete(n);
      else {
        var s = this.#e.get(n);
        s && (pr(s.effect), this.#i.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), a = s.effect);
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
            na(l, d), d.append(Yt()), this.#e.set(i, { effect: l, fragment: d });
          } else
            ut(l);
          this.#o.delete(i), this.#i.delete(i);
        };
        this.#r || !a ? (this.#o.add(i), pn(l, u, !1)) : u();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [a, s] of this.#e)
      n.includes(a) || (ut(s.effect), this.#e.delete(a));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var a = (
      /** @type {Batch} */
      _e
    ), s = Za();
    if (n && !this.#i.has(t) && !this.#e.has(t))
      if (s) {
        var i = document.createDocumentFragment(), l = Yt();
        i.append(l), this.#e.set(t, {
          effect: wt(() => n(l)),
          fragment: i
        });
      } else
        this.#i.set(
          t,
          wt(() => n(this.anchor))
        );
    if (this.#t.set(a, t), s) {
      for (const [u, o] of this.#i)
        u === t ? a.unskip_effect(o) : a.skip_effect(o);
      for (const [u, o] of this.#e)
        u === t ? a.unskip_effect(o.effect) : a.skip_effect(o.effect);
      a.oncommit(this.#s), a.ondiscard(this.#n);
    } else
      this.#s(a);
  }
}
function K(e, t, n = !1) {
  var a = new Vi(e), s = n ? Nn : 0;
  function i(l, u) {
    a.ensure(l, u);
  }
  ea(() => {
    var l = !1;
    t((u, o = 0) => {
      l = !0, i(o, u);
    }), l || i(-1, null);
  }, s);
}
function yt(e, t) {
  return t;
}
function Xi(e, t, n) {
  for (var a = [], s = t.length, i, l = t.length, u = 0; u < s; u++) {
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
            Ur(e, wr(i.done)), p.delete(i), p.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var o = a.length === 0 && n !== null;
    if (o) {
      var d = (
        /** @type {Element} */
        n
      ), g = (
        /** @type {Element} */
        d.parentNode
      );
      Ri(g), g.append(d), e.items.clear();
    }
    Ur(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function Ur(e, t, n = !0) {
  var a;
  if (e.pending.size > 0) {
    a = /* @__PURE__ */ new Set();
    for (const l of e.pending.values())
      for (const u of l)
        a.add(
          /** @type {EachItem} */
          e.items.get(u).e
        );
  }
  for (var s = 0; s < t.length; s++) {
    var i = t[s];
    if (a?.has(i)) {
      i.f |= jt;
      const l = document.createDocumentFragment();
      na(i, l);
    } else
      ut(t[s], n);
  }
}
var va;
function Ge(e, t, n, a, s, i = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & Oa) !== 0;
  if (o) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild(Yt());
  }
  var g = null, m = /* @__PURE__ */ qa(() => {
    var N = n();
    return (
      /** @type {V[]} */
      Vr(N) ? N : N == null ? [] : wr(N)
    );
  }), p, h = /* @__PURE__ */ new Map(), v = !0;
  function y(N) {
    (x.effect.f & vt) === 0 && (x.pending.delete(N), x.fallback = g, Ki(x, p, l, t, a), g !== null && (p.length === 0 ? (g.f & jt) === 0 ? pr(g) : (g.f ^= jt, Vn(g, null, l)) : pn(g, () => {
      g = null;
    })));
  }
  function c(N) {
    x.pending.delete(N);
  }
  var _ = ea(() => {
    p = /** @type {V[]} */
    r(m);
    for (var N = p.length, L = /* @__PURE__ */ new Set(), T = (
      /** @type {Batch} */
      _e
    ), z = Za(), U = 0; U < N; U += 1) {
      var $ = p[U], B = a($, U), w = v ? null : u.get(B);
      w ? (w.v && In(w.v, $), w.i && In(w.i, U), z && T.unskip_effect(w.e)) : (w = Ji(
        u,
        v ? l : va ??= Yt(),
        $,
        B,
        U,
        s,
        t,
        n
      ), v || (w.e.f |= jt), u.set(B, w)), L.add(B);
    }
    if (N === 0 && i && !g && (v ? g = wt(() => i(l)) : (g = wt(() => i(va ??= Yt())), g.f |= jt)), N > L.size && Ds(), !v)
      if (h.set(T, L), z) {
        for (const [F, P] of u)
          L.has(F) || T.skip_effect(P.e);
        T.oncommit(y), T.ondiscard(c);
      } else
        y(T);
    r(m);
  }), x = { effect: _, items: u, pending: h, outrogroups: null, fallback: g };
  v = !1;
}
function Bn(e) {
  for (; e !== null && (e.f & kt) === 0; )
    e = e.next;
  return e;
}
function Ki(e, t, n, a, s) {
  var i = (a & Ks) !== 0, l = t.length, u = e.items, o = Bn(e.effect.first), d, g = null, m, p = [], h = [], v, y, c, _;
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
      w.pending.size === 0 && (Ur(e, wr(w.done)), e.outrogroups?.delete(w));
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
      var B = (a & Oa) !== 0 && l === 0 ? n : null;
      if (i) {
        for (_ = 0; _ < $; _ += 1)
          U[_].nodes?.a?.measure();
        for (_ = 0; _ < $; _ += 1)
          U[_].nodes?.a?.fix();
      }
      Xi(e, U, B);
    }
  }
  i && Gt(() => {
    if (m !== void 0)
      for (c of m)
        c.nodes?.a?.apply();
  });
}
function Ji(e, t, n, a, s, i, l, u) {
  var o = (l & Vs) !== 0 ? (l & Js) === 0 ? /* @__PURE__ */ Si(n, !1, !1) : bn(n) : null, d = (l & Xs) !== 0 ? bn(s) : null;
  return {
    v: o,
    i: d,
    e: wt(() => (i(t, o ?? n, d ?? s, u), () => {
      e.delete(a);
    }))
  };
}
function Vn(e, t, n) {
  if (e.nodes)
    for (var a = e.nodes.start, s = e.nodes.end, i = t && (t.f & jt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; a !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ tr(a)
      );
      if (i.before(a), a === s)
        return;
      a = l;
    }
}
function en(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function $n(e, t, n) {
  es(() => {
    var a = wn(() => t(e, n?.()) || {});
    if (a?.destroy)
      return () => (
        /** @type {Function} */
        a.destroy()
      );
  });
}
const pa = [...` 	
\r\f \v\uFEFF`];
function Zi(e, t, n) {
  var a = e == null ? "" : "" + e;
  if (n) {
    for (var s of Object.keys(n))
      if (n[s])
        a = a ? a + " " + s : s;
      else if (a.length)
        for (var i = s.length, l = 0; (l = a.indexOf(s, l)) >= 0; ) {
          var u = l + i;
          (l === 0 || pa.includes(a[l - 1])) && (u === a.length || pa.includes(a[u])) ? a = (l === 0 ? "" : a.substring(0, l)) + a.substring(u + 1) : l = u;
        }
  }
  return a === "" ? null : a;
}
function ga(e, t = !1) {
  var n = t ? " !important;" : ";", a = "";
  for (var s of Object.keys(e)) {
    var i = e[s];
    i != null && i !== "" && (a += " " + s + ": " + i + n);
  }
  return a;
}
function Qi(e, t) {
  if (t) {
    var n = "", a, s;
    return Array.isArray(t) ? (a = t[0], s = t[1]) : a = t, a && (n += ga(a)), s && (n += ga(s, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function xe(e, t, n, a, s, i) {
  var l = (
    /** @type {any} */
    e[zr]
  );
  if (l !== n || l === void 0) {
    var u = Zi(n, a, i);
    u == null ? e.removeAttribute("class") : e.className = u, e[zr] = n;
  } else if (i && s !== i)
    for (var o in i) {
      var d = !!i[o];
      (s == null || d !== !!s[o]) && e.classList.toggle(o, d);
    }
  return i;
}
function Rr(e, t = {}, n, a) {
  for (var s in n) {
    var i = n[s];
    t[s] !== i && (n[s] == null ? e.style.removeProperty(s) : e.style.setProperty(s, i, a));
  }
}
function fn(e, t, n, a) {
  var s = (
    /** @type {any} */
    e[Dr]
  );
  if (s !== t) {
    var i = Qi(t, a);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[Dr] = t;
  } else a && (Array.isArray(a) ? (Rr(e, n?.[0], a[0]), Rr(e, n?.[1], a[1], "important")) : Rr(e, n, a));
  return a;
}
function Xn(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Vr(t))
      return ii();
    for (var a of e.options)
      a.selected = t.includes(_a(a));
    return;
  }
  for (a of e.options) {
    var s = _a(a);
    if (Mi(s, t)) {
      a.selected = !0;
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
function _a(e) {
  return "__value" in e ? e.__value : e.value;
}
const el = Symbol("is custom element"), tl = Symbol("is html"), nl = Fs ? "progress" : "PROGRESS";
function un(e, t) {
  var n = aa(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== nl) || (e.value = t ?? "");
}
function rl(e, t) {
  var n = aa(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function se(e, t, n, a) {
  var s = aa(e);
  s[t] !== (s[t] = n) && (t === "loading" && (e[Is] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && al(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function aa(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[Na] ??= {
      [el]: e.nodeName.includes("-"),
      [tl]: e.namespaceURI === ai
    }
  );
}
var ba = /* @__PURE__ */ new Map();
function al(e) {
  var t = e.getAttribute("is") || e.nodeName, n = ba.get(t);
  if (n) return n;
  ba.set(t, n = []);
  for (var a, s = e, i = Element.prototype; i !== s; ) {
    a = Ms(s);
    for (var l in a)
      a[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    s = Ra(s);
  }
  return n;
}
function Pr(e, t) {
  return e === t || e?.[hn] === t;
}
function _r(e = {}, t, n, a) {
  var s = (
    /** @type {ComponentContext} */
    Ze.r
  ), i = (
    /** @type {Effect} */
    le
  );
  return es(() => {
    var l, u;
    return ts(() => {
      l = u, u = [], wn(() => {
        Pr(n(...u), e) || (t(e, ...u), l && Pr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== s && o.parent !== null && o.parent.f & Lr; )
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
function Gr(e, t) {
  fi(window, ["resize"], () => jn(() => t(window[e])));
}
function re(e, t, n, a) {
  var s = !0, i = (n & ei) !== 0, l = (n & ti) !== 0, u = (
    /** @type {V} */
    a
  ), o = !0, d = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && s ? (d ??= /* @__PURE__ */ Zn(
    /** @type {() => V} */
    a
  ), r(d)) : (o && (o = !1, u = l ? wn(
    /** @type {() => V} */
    a
  ) : (
    /** @type {V} */
    a
  )), u);
  let m;
  if (i) {
    var p = hn in e || Os in e;
    m = An(e, t)?.set ?? (p && t in e ? (L) => e[t] = L : void 0);
  }
  var h, v = !1;
  i ? [h, v] = di(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && a !== void 0 && (h = g(), m && ($s(), m(h)));
  var y;
  if (y = () => {
    var L = (
      /** @type {V} */
      e[t]
    );
    return L === void 0 ? g() : (o = !0, L);
  }, (n & Qs) === 0)
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
  var _ = !1, x = ((n & Zs) !== 0 ? Zn : qa)(() => (_ = !1, y()));
  i && r(x);
  var N = (
    /** @type {Effect} */
    le
  );
  return (
    /** @type {() => V} */
    (function(L, T) {
      if (arguments.length > 0) {
        const z = T ? r(x) : i ? Ie(L) : L;
        return E(x, z), _ = !0, u !== void 0 && (u = z), L;
      }
      return Vt && _ || (N.f & vt) !== 0 ? x.v : r(x);
    })
  );
}
function Hn(e) {
  Ze === null && Ls(), sn(() => {
    const t = wn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const sl = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(sl);
function il(e) {
  const t = new URLSearchParams();
  for (const [a, s] of Object.entries(e))
    if (s != null)
      if (Array.isArray(s))
        for (const i of s) t.append(a, String(i));
      else
        t.set(a, String(s));
  const n = t.toString();
  return n ? "?" + n : "";
}
async function $t(e, t = {}) {
  const n = await fetch(e + il(t));
  if (!n.ok) {
    const a = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${a.error ? " (" + a.error + ")" : ""}`);
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
  const a = await n.json().catch(() => ({}));
  if (!n.ok)
    throw new Error(`${e} ${n.status}${a.error ? " (" + a.error + ")" : ""}`);
  return a;
}
function ma(e) {
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
  counts: (e, t) => $t("/api/triage/counts", { ...ma(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => $t("/api/triage/files"),
  screen: (e, t = {}) => $t("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => $t("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => $t("/api/triage/page", { ...ma(e), limit: n, ...t || {} }),
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
function ll() {
  let e = 0, t = 0;
  return async function(a) {
    const s = ++e, i = await a();
    return s <= t ? { stale: !0, value: void 0 } : (t = s, { stale: !1, value: i });
  };
}
function ol(e, t) {
  let n = 0;
  const a = (...s) => {
    clearTimeout(n), n = setTimeout(() => e(...s), t);
  };
  return a.cancel = () => clearTimeout(n), a.now = (...s) => {
    clearTimeout(n), e(...s);
  }, a;
}
const wa = ["B", "KB", "MB", "GB", "TB"];
function Ct(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < wa.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${wa[n]}`;
}
function Ce(e) {
  return (Number(e) || 0).toLocaleString();
}
const Ln = "G:\\photos", ya = [
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
function vs(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), a = Ln.toLowerCase();
  return n.toLowerCase().startsWith(a + "\\") ? n : "";
}
function sa(e, t) {
  const n = t.toLowerCase();
  return e.some((a) => n === a || n.startsWith(a + "\\"));
}
function ul(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function cl(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function ps(e, t) {
  if (!t) return null;
  const n = e.find(
    (a) => a.term && a.term.column === t.column && a.term.op === t.op && cl(a.term.value, t.value)
  );
  return n ? n.decision : null;
}
var dl = /* @__PURE__ */ C('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), fl = /* @__PURE__ */ C('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), hl = /* @__PURE__ */ C('<div class="line muted svelte-1vgp6n7">…</div>'), vl = /* @__PURE__ */ C('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), pl = /* @__PURE__ */ C('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), gl = /* @__PURE__ */ C('<div class="line muted svelte-1vgp6n7"> </div>'), _l = /* @__PURE__ */ C('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function bl(e, t) {
  pt(t, !0);
  let n = re(t, "counts", 3, null), a = re(t, "files", 3, null), s = re(t, "filesAt", 3, null), i = re(t, "stale", 3, !1), l = re(t, "candidate", 3, null), u = re(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ne(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = _l(), g = f(d);
  let m;
  var p = b(f(g), 2);
  {
    var h = (B) => {
      var w = fl(), F = ot(w), P = f(F), D = f(P), Z = b(P, 2), W = f(Z), G = b(Z, 4), te = f(G), ce = b(G, 2), X = f(ce), j = b(F, 2);
      {
        var O = (V) => {
          var S = dl(), k = b(f(S), 2), I = f(k), ae = b(k, 2), me = f(ae), oe = b(ae, 4), fe = f(oe), Se = b(oe, 2), he = f(Se), Ne = b(Se, 2), Ye = f(Ne);
          q(
            (Ee, rt, de, ie, Re) => {
              A(I, `kept ${Ee ?? ""}`), A(me, rt), A(fe, `excluded ${de ?? ""}`), A(he, ie), A(Ye, `${r(o) >= 0 ? "+" : ""}${Re ?? ""} excluded`);
            },
            [
              () => Ce(n().candidate_kept_paths),
              () => Ct(n().candidate_kept_bytes),
              () => Ce(n().candidate_excluded_paths),
              () => Ct(n().candidate_excluded_bytes),
              () => Ce(r(o))
            ]
          ), R(V, S);
        };
        K(j, (V) => {
          l() && V(O);
        });
      }
      q(
        (V, S, k, I) => {
          A(D, `kept ${V ?? ""}`), A(W, S), A(te, `excluded ${k ?? ""}`), A(X, I);
        },
        [
          () => Ce(n().kept_paths),
          () => Ct(n().kept_bytes),
          () => Ce(n().excluded_paths),
          () => Ct(n().excluded_bytes)
        ]
      ), R(B, w);
    }, v = (B) => {
      var w = hl();
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
      var w = vl();
      R(B, w);
    };
    K(L, (B) => {
      i() && a() && a() !== "loading" && B(T);
    });
  }
  var z = b(_, 2);
  {
    var U = (B) => {
      var w = pl(), F = ot(w);
      let P;
      var D = f(F), Z = f(D), W = b(D, 2), G = f(W), te = b(W, 4), ce = f(te), X = b(te, 2), j = f(X), O = b(F, 2), V = f(O);
      q(
        (S, k, I, ae) => {
          P = xe(F, 1, "line svelte-1vgp6n7", null, P, { outdated: i() }), A(Z, `kept ${S ?? ""}`), A(G, k), A(ce, `excluded ${I ?? ""}`), A(j, ae), A(V, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Ce(a().kept_files),
          () => Ct(a().kept_bytes),
          () => Ce(a().excluded_files),
          () => Ct(a().excluded_bytes)
        ]
      ), R(B, w);
    }, $ = (B) => {
      var w = gl(), F = f(w);
      q(() => A(F, a() === "loading" ? "counting…" : "not counted yet")), R(B, w);
    };
    K(z, (B) => {
      a() && a() !== "loading" ? B(U) : B($, -1);
    });
  }
  q(() => {
    m = xe(g, 1, "block svelte-1vgp6n7", null, m, { busy: u() }), c = xe(y, 1, "block svelte-1vgp6n7", null, c, { busy: a() === "loading" }), x.disabled = a() === "loading", A(N, a() === "loading" ? "counting…" : "recount");
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
}, ml = [
  { dark: "tint", light: "tintLight", base: cn },
  { dark: "control", light: "controlLight", base: nn },
  { dark: "ink", light: "inkLight", base: nn },
  { dark: "tally", light: "tallyLight", base: nn },
  { dark: "tallyInk", light: "tallyInkLight", base: nn }
], Wr = /* @__PURE__ */ new Set();
let Nt = { ...nn };
function wl() {
  return Nt;
}
function Cr(e) {
  Nt = kl(e), ia();
  for (const t of Wr) t(Nt);
  return Nt;
}
function yl(e) {
  return Wr.add(e), () => Wr.delete(e);
}
function Kn(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function xl(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: je(Kn(e.r, t.r), 0, 255),
    g: je(Kn(e.g, t.g), 0, 255),
    b: je(Kn(e.b, t.b), 0, 255),
    a: je(Kn(e.a, t.a), 0, 1)
  };
}
function kl(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [a, s] of Object.entries(nn))
    typeof s == "boolean" ? n[a] = t[a] === void 0 ? s : !!t[a] : typeof s == "object" ? n[a] = xl(t[a], s) : n[a] = Kn(t[a], s);
  return n;
}
function bt({ r: e, g: t, b: n, a }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Me(a, 3)})`;
}
function Me(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function xa({ r: e, g: t, b: n, a }) {
  return { r: e, g: t, b: n, a: je(a * 1.7 + 0.22, 0, 1) };
}
function ka(e, t) {
  const n = 0.4 + je(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - je(t, 0, 100) / 100) };
}
function Sa(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, s = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? je(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * s * Math.max(t.glareFactor, 0) / 100;
  return je(i ** (0.1 + je(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const Sl = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function El(e, t, n) {
  const a = je(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), u = s - l, o = i - l, d = 8, g = [];
  for (let h = 0; h <= d; h++) {
    const v = h / d * (Math.PI / 2);
    g.push([l * Math.cos(v) ** (2 / a), l * Math.sin(v) ** (2 / a)]);
  }
  const m = [], p = (h, v, y, c) => {
    let _ = Math.atan2(h, -v);
    _ < 0 && (_ += Math.PI * 2);
    let x = Math.atan2(c, y);
    x < 0 && (x += Math.PI * 2);
    const N = Me(Sa(x, n), 3);
    m.push(`rgba(255, 255, 255, ${N}) ${Me(_ / (Math.PI * 2) * 100, 2)}%`);
  };
  p(0, -i, 0, 1);
  for (const [h, v, y] of Sl)
    for (let c = 0; c <= d; c++) {
      const [_, x] = g[y ? d - c : c];
      p(h * (u + _), v * (o + x), h * _ ** (a - 1), -v * x ** (a - 1));
    }
  return m.push(`rgba(255, 255, 255, ${Me(Sa(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function ia() {
  const e = Nt, t = document.documentElement.style, n = ka(e.refFresnelRange, e.refFresnelHardness), a = ka(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Me(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Me(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", bt(e.tint)), t.setProperty("--glass-tint-light", bt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", bt(xa(e.tint))), t.setProperty("--glass-tint-sheet-light", bt(xa(e.tintLight))), t.setProperty("--glass-ctl-dark", bt(e.control)), t.setProperty("--glass-ctl-light", bt(e.controlLight)), t.setProperty("--glass-text-dark", bt(e.ink)), t.setProperty("--glass-text-light", bt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", bt(e.tally)), t.setProperty("--glass-tint-tally-light", bt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", bt(e.tallyInk)), t.setProperty("--glass-text-tally-light", bt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Me(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Me(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Me(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Me(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Me(e.shadowX)}px ${Me(-e.shadowY)}px ${Me(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Me(je(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Me(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Me(Math.log2(je(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Me(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Me(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Me(je(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Me(a.width)}px`), t.setProperty("--glass-glare-blur", `${Me(a.blur)}px`);
}
function je(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function Tl(e, t, n, a, s, i) {
  const l = Math.abs(e) - n + s, u = Math.abs(t) - a + s, o = Math.max(l, 0), d = Math.max(u, 0), g = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + g - s;
}
function Ml(e, t, n) {
  const a = e / 2, s = t / 2, i = je(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (p, h) => Tl(p - a, h - s, a, s, l, i), g = 256, m = new Float32Array(g + 1);
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
function Al(e, t, n) {
  const a = document.createElement("canvas");
  a.width = e, a.height = t;
  const s = a.getContext("2d"), i = s.createImageData(e, t), l = i.data, u = e * t, o = new Float32Array(u), d = new Float32Array(u);
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
  return s.putImageData(i, 0, 0), { url: a.toDataURL(), scale: g * 2 };
}
const Nr = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function Or(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Me(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let Un = null, Rl = 0;
function Pl() {
  if (Un) return Un;
  const e = document.createElementNS(Yr, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), Un = document.createElementNS(Yr, "defs"), e.appendChild(Un), document.body.appendChild(e), Un;
}
function Gn(e) {
  const t = `glass-refract-${++Rl}`, n = document.createElementNS(Yr, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), Pl().appendChild(n);
  let a = 0, s = 0, i = 0, l = 0;
  const u = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, d = "";
  function g() {
    e.style.setProperty("--glass-pre", Nt.blurEdge ? "" : d), e.style.setProperty("--glass-post", Nt.blurEdge ? d : "");
  }
  function m() {
    a < 2 || s < 2 || e.style.setProperty("--glass-glare", El(a, s, Nt));
  }
  function p() {
    if (a < 2 || s < 2) return;
    const c = Nt, _ = Al(a, s, Ml(a, s, c)), x = c.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(a)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${a}" height="${s}" preserveAspectRatio="none" href="${_.url}" result="map"/>` + Or(_.scale * (1 + x), Nr[0], "r") + Or(_.scale, Nr[1], "g") + Or(_.scale * (1 - x), Nr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", g()), o = u.map((N) => Nt[N]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, p();
    }));
  }
  const v = new ResizeObserver(([c]) => {
    const _ = c.borderBoxSize?.[0], x = _ ? { w: Math.round(_.inlineSize), h: Math.round(_.blockSize) } : { w: Math.round(c.contentRect.width), h: Math.round(c.contentRect.height) };
    x.w === a && x.h === s || (a = x.w, s = x.h, m(), h());
  });
  v.observe(e);
  const y = yl(() => {
    m(), u.map((c) => Nt[c]).join(" ") !== o ? h() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), y(), v.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const gs = "photos.stack", Ir = { on: !1, window: 4 }, _s = 1, bs = 10;
function Cl() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(gs) ?? "");
  } catch {
    return { ...Ir };
  }
  if (e === null || typeof e != "object") return { ...Ir };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= _s && t <= bs ? t : Ir.window
  };
}
function Nl(e) {
  return localStorage.setItem(gs, JSON.stringify({ on: e.on, window: e.window })), e;
}
const ms = "photos.theme", ws = "dark";
function ys() {
  return document.documentElement.dataset.theme === "light" ? "light" : ws;
}
function Ol() {
  const e = localStorage.getItem(ms), t = e === "dark" || e === "light" ? e : ws;
  return document.documentElement.dataset.theme = t, t;
}
function xs(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(ms, e), e;
}
var Il = /* @__PURE__ */ C('<span class="spin svelte-zne36e" aria-label="loading"></span>'), Ea = /* @__PURE__ */ C('<span class="badge svelte-zne36e"> </span>'), Fl = /* @__PURE__ */ C('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Ll = /* @__PURE__ */ C('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), zl = /* @__PURE__ */ C("<button> </button>"), Dl = /* @__PURE__ */ C('<div class="glass sheet sorts svelte-zne36e"></div>'), jl = /* @__PURE__ */ C(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), Hl = /* @__PURE__ */ C('<p class="muted svelte-zne36e">loading…</p>'), ql = /* @__PURE__ */ C('<span class="help svelte-zne36e">?</span>'), Bl = /* @__PURE__ */ C('<span class="n svelte-zne36e"> </span>'), $l = /* @__PURE__ */ C("<button> <!></button>"), Ul = /* @__PURE__ */ C('<span class="muted svelte-zne36e">nothing here</span>'), Gl = /* @__PURE__ */ C('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Yl = /* @__PURE__ */ C('<div class="glass sheet filters svelte-zne36e"><!></div>'), Wl = /* @__PURE__ */ C('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function Vl(e, t) {
  pt(t, !0);
  let n = re(t, "facets", 3, null), a = re(t, "selected", 19, () => ({})), s = re(t, "sort", 3, "newest"), i = re(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = re(t, "total", 3, null), u = re(t, "tiles", 3, null), o = re(t, "loading", 3, !1), d = re(t, "onselect", 3, () => {
  }), g = re(t, "onsort", 3, () => {
  }), m = re(t, "onstack", 3, () => {
  }), p = re(t, "onclear", 3, () => {
  }), h = re(t, "ontriage", 3, () => {
  }), v = /* @__PURE__ */ Y(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), y = /* @__PURE__ */ Y(Ie(ys())), c = /* @__PURE__ */ Y(null);
  const _ = /* @__PURE__ */ ne(() => u() ?? l()), x = /* @__PURE__ */ ne(() => n()?.dimensions ?? []), N = /* @__PURE__ */ ne(() => n()?.sorts ?? []), L = /* @__PURE__ */ ne(() => r(N).find((H) => H.value === s())?.label ?? s()), T = /* @__PURE__ */ ne(() => Object.values(a()).reduce((H, ee) => H + ee.length, 0)), z = /* @__PURE__ */ ne(() => r(x).flatMap((H) => (a()[H.name] ?? []).map((ee) => ({
    dimension: H.name,
    value: ee,
    title: H.title,
    label: H.options.find((pe) => pe.value === ee)?.label ?? String(ee)
  }))));
  function U(H, ee) {
    const pe = a()[H] ?? [], Te = pe.includes(ee) ? pe.filter((we) => we !== ee) : [...pe, ee];
    d()(H, Te);
  }
  function $(H, ee) {
    return (a()[H] ?? []).includes(ee);
  }
  function B() {
    E(y, xs(r(y) === "dark" ? "light" : "dark"), !0);
  }
  let w = /* @__PURE__ */ Y(null);
  const F = /* @__PURE__ */ ne(() => r(w) ?? i().window);
  function P(H) {
    E(w, Number(H), !0);
  }
  function D(H) {
    E(w, null), m()({ ...i(), window: Number(H) });
  }
  sn(() => {
    r(v) !== "stacks" && E(w, null);
  });
  function Z(H) {
    H.key === "Escape" && E(v, "");
  }
  function W(H) {
    r(v) && !H.target.closest(".topbar") && E(v, "");
  }
  Hn(() => {
    const H = new ResizeObserver(([ee]) => {
      const pe = Math.round(ee.borderBoxSize?.[0]?.blockSize ?? ee.contentRect.height);
      document.documentElement.style.setProperty("--header-h", pe + "px");
    });
    return H.observe(r(c)), () => {
      H.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var G = Wl();
  Pn("keydown", mn, Z), Pn("pointerdown", mn, W);
  var te = f(G), ce = f(te), X = f(ce), j = b(ce, 2), O = f(j), V = b(j, 2);
  {
    var S = (H) => {
      var ee = Il();
      R(H, ee);
    };
    K(V, (H) => {
      o() && H(S);
    });
  }
  $n(te, (H) => Gn?.(H));
  var k = b(te, 2), I = f(k), ae = f(I), me = f(ae);
  let oe;
  var fe = f(me), Se = b(me, 2);
  let he;
  var Ne = b(f(Se));
  {
    var Ye = (H) => {
      var ee = Ea(), pe = f(ee);
      q(() => A(pe, r(T))), R(H, ee);
    };
    K(Ne, (H) => {
      r(T) && H(Ye);
    });
  }
  var Ee = b(Se, 2);
  let rt;
  var de = b(f(Ee));
  {
    var ie = (H) => {
      var ee = Ea(), pe = f(ee);
      q((Te) => A(pe, Te), [() => Ce(l())]), R(H, ee);
    };
    K(de, (H) => {
      i().on && l() !== null && H(ie);
    });
  }
  var Re = b(Ee, 2);
  {
    var Pe = (H) => {
      var ee = Ll(), pe = f(ee);
      Ge(pe, 17, () => r(z), (we) => we.dimension + " " + we.value, (we, ve) => {
        var ye = Fl(), We = f(ye), at = f(We), ge = b(We, 1, !0);
        q(() => {
          se(ye, "title", `${r(ve).title ?? ""}: ${r(ve).label ?? ""} — click to remove`), A(at, r(ve).title), A(ge, r(ve).label);
        }), Q("click", ye, () => U(r(ve).dimension, r(ve).value)), R(we, ye);
      });
      var Te = b(pe, 2);
      Q("click", Te, () => p()()), R(H, ee);
    };
    K(Re, (H) => {
      r(z).length && H(Pe);
    });
  }
  var Fe = b(ae, 2), Qe = f(Fe), ct = b(Fe, 2);
  $n(I, (H) => Gn?.(H));
  var Et = b(I, 2);
  {
    var Dt = (H) => {
      var ee = Dl();
      Ge(ee, 21, () => r(N), yt, (pe, Te) => {
        var we = zl();
        let ve;
        var ye = f(we);
        q(() => {
          ve = xe(we, 1, "option svelte-zne36e", null, ve, { on: r(Te).value === s() }), A(ye, r(Te).label);
        }), Q("click", we, () => {
          g()(r(Te).value), E(v, "");
        }), R(pe, we);
      }), $n(ee, (pe) => Gn?.(pe)), R(H, ee);
    };
    K(Et, (H) => {
      r(v) === "sort" && H(Dt);
    });
  }
  var Bt = b(Et, 2);
  {
    var _t = (H) => {
      var ee = jl(), pe = f(ee), Te = b(f(pe), 2), we = f(Te);
      let ve;
      var ye = f(we), We = b(pe, 2), at = b(f(We), 2), ge = f(at), He = b(ge, 2), Mt = f(He);
      $n(ee, (Be) => Gn?.(Be)), q(() => {
        ve = xe(we, 1, "option svelte-zne36e", null, ve, { on: i().on }), se(we, "aria-checked", i().on), A(ye, i().on ? "On" : "Off"), se(ge, "min", _s), se(ge, "max", bs), un(ge, r(F)), se(ge, "aria-valuetext", `${r(F) ?? ""} seconds`), A(Mt, `${r(F) ?? ""}s`);
      }), Q("click", we, () => m()({ ...i(), on: !i().on })), Q("input", ge, (Be) => P(Be.currentTarget.value)), Q("change", ge, (Be) => D(Be.currentTarget.value)), R(H, ee);
    };
    K(Bt, (H) => {
      r(v) === "stacks" && H(_t);
    });
  }
  var et = b(Bt, 2);
  {
    var Tt = (H) => {
      var ee = Yl(), pe = f(ee);
      {
        var Te = (ve) => {
          var ye = Hl();
          R(ve, ye);
        }, we = (ve) => {
          var ye = ra(), We = ot(ye);
          Ge(We, 17, () => r(x), yt, (at, ge) => {
            var He = Gl(), Mt = f(He), Be = f(Mt), M = b(Be);
            {
              var J = (Ve) => {
                var Ue = ql();
                q(() => se(Ue, "title", r(ge).hint)), R(Ve, Ue);
              };
              K(M, (Ve) => {
                r(ge).hint && Ve(J);
              });
            }
            var be = b(Mt, 2), $e = f(be);
            Ge($e, 17, () => r(ge).options, yt, (Ve, Ue) => {
              var Xe = $l();
              let ln;
              var on = f(Xe), Ke = b(on);
              {
                var ft = (st) => {
                  var Rt = Bl(), Kt = f(Rt);
                  q((Jt) => A(Kt, Jt), [() => Ce(r(Ue).count)]), R(st, Rt);
                };
                K(Ke, (st) => {
                  r(Ue).count !== null && st(ft);
                });
              }
              q(
                (st) => {
                  ln = xe(Xe, 1, "option svelte-zne36e", null, ln, st), A(on, `${r(Ue).label ?? ""} `);
                },
                [
                  () => ({ on: $(r(ge).name, r(Ue).value) })
                ]
              ), Q("click", Xe, () => U(r(ge).name, r(Ue).value)), R(Ve, Xe);
            });
            var dt = b($e, 2);
            {
              var At = (Ve) => {
                var Ue = Ul();
                R(Ve, Ue);
              };
              K(dt, (Ve) => {
                r(ge).options.length || Ve(At);
              });
            }
            q(() => A(Be, `${r(ge).title ?? ""} `)), R(at, He);
          }), R(ve, ye);
        };
        K(pe, (ve) => {
          n() ? ve(we, -1) : ve(Te);
        });
      }
      $n(ee, (ve) => Gn?.(ve)), R(H, ee);
    };
    K(et, (H) => {
      r(v) === "filters" && H(Tt);
    });
  }
  _r(G, (H) => E(c, H), () => r(c)), q(
    (H) => {
      A(X, H), A(O, r(_) === 1 ? "photo" : "photos"), oe = xe(me, 1, "menu svelte-zne36e", null, oe, { open: r(v) === "sort" }), se(me, "aria-expanded", r(v) === "sort"), A(fe, r(L)), he = xe(Se, 1, "menu svelte-zne36e", null, he, { open: r(v) === "filters", on: r(T) > 0 }), se(Se, "aria-expanded", r(v) === "filters"), rt = xe(Ee, 1, "menu svelte-zne36e", null, rt, { open: r(v) === "stacks", on: i().on }), se(Ee, "aria-expanded", r(v) === "stacks"), se(Fe, "title", r(y) === "dark" ? "Switch to a white background" : "Switch to a black background"), se(Fe, "aria-label", r(y) === "dark" ? "Switch to a white background" : "Switch to a black background"), A(Qe, r(y) === "dark" ? "☀" : "☾");
    },
    [() => r(_) === null ? "…" : Ce(r(_))]
  ), Q("click", me, () => E(v, r(v) === "sort" ? "" : "sort", !0)), Q("click", Se, () => E(v, r(v) === "filters" ? "" : "filters", !0)), Q("click", Ee, () => E(v, r(v) === "stacks" ? "" : "stacks", !0)), Q("click", Fe, B), Q("click", ct, () => h()()), R(e, G), gt();
}
zt(["click", "input", "change"]);
const Pt = 4, br = 220, Xl = 340;
function mr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Kl(e, t, n, a, s) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, u = 0, o = 1 / 0;
    for (; l < e.length && (u += mr(e[l]), l++, o = (n - Pt * (l - i - 1)) / u, !(o <= br)); )
      ;
    if (o > br && !a) break;
    s(i, l, Math.round(Math.min(o, Xl))), i = l;
  }
  return i;
}
function Ta(e, t, n) {
  if (!e.length) return null;
  let a = 0, s = e.length - 1;
  for (; a < s; ) {
    const l = a + s >> 1;
    e[l].top + e[l].height < t ? a = l + 1 : s = l;
  }
  const i = a;
  for (s = e.length - 1; a < s; ) {
    const l = a + s + 1 >> 1;
    e[l].top <= n ? a = l : s = l - 1;
  }
  return [i, Math.max(i, a)];
}
var Jl = /* @__PURE__ */ C('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), Zl = /* @__PURE__ */ C('<div class="glass pane svelte-5g1i2z" role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div></div>');
function Ql(e, t) {
  pt(t, !0);
  let n = re(t, "frames", 19, () => []), a = re(t, "origin", 3, null), s = re(t, "onreveal", 3, () => {
  }), i = re(t, "onclose", 3, () => {
  });
  const l = 40;
  let u = /* @__PURE__ */ Y(0), o = /* @__PURE__ */ Y(0), d = /* @__PURE__ */ Y(null), g = /* @__PURE__ */ Y(Ie(/* @__PURE__ */ new Set()));
  const m = 4, p = 25, h = { x: 0, y: 0, w: 0, h: 0 }, v = /* @__PURE__ */ ne(() => Math.max(0, r(u) - l * 2)), y = /* @__PURE__ */ ne(() => Math.max(0, r(o) - l * 2)), c = /* @__PURE__ */ ne(() => r(v) > 0 && r(y) > 0 ? L(n(), r(v), r(y)) : n().map(() => h));
  function _(w, F, P) {
    const D = [];
    let Z = 0, W = 0;
    for (let G = 0; G < w.length; G++)
      W += mr(w[G]), W * P + Pt * (G - Z) >= F && (D.push({ from: Z, to: G + 1, sum: W }), Z = G + 1, W = 0);
    return Z < w.length && D.push({ from: Z, to: w.length, sum: W }), D;
  }
  function x(w, F, P) {
    return w.map((D, Z) => {
      const W = (F - Pt * (D.to - D.from - 1)) / D.sum;
      return Z === w.length - 1 && W > P ? P : W;
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
    const W = _(w, F, D), G = x(W, F, D), te = [];
    let ce = (P - (G.reduce((X, j) => X + j, 0) + Pt * (W.length - 1))) / 2;
    return W.forEach((X, j) => {
      const O = G[j], V = [];
      for (let I = X.from; I < X.to; I++) V.push(mr(w[I]) * O);
      const S = V.reduce((I, ae) => I + ae, 0) + Pt * (V.length - 1);
      let k = (F - S) / 2;
      for (const I of V)
        te.push({
          x: Math.round(k),
          y: Math.round(ce),
          w: Math.round(I),
          h: Math.round(O)
        }), k += I + Pt;
      ce += O + Pt;
    }), te;
  }
  function T(w) {
    if (!a() || !w || !w.w || !w.h) return "none";
    const F = a().left - (l + w.x), P = a().top - (l + w.y);
    return `translate(${F}px, ${P}px) scale(${a().width / w.w}, ${a().height / w.h})`;
  }
  function z(w) {
    w.key === "Escape" && i()();
  }
  function U(w) {
    w.target.closest(".frame") || i()();
  }
  Hn(() => {
    const w = document.activeElement;
    return r(d)?.focus(), () => {
      w instanceof HTMLElement && document.contains(w) && w.focus();
    };
  });
  var $ = Zl();
  Pn("keydown", mn, z), Pn("pointerdown", mn, U);
  var B = f($);
  fn(B, "", {}, { inset: "40px" }), Ge(B, 23, n, (w) => w.id, (w, F, P) => {
    var D = Jl();
    let Z;
    var W = f(D);
    let G;
    q(
      (te, ce) => {
        Z = fn(D, "", Z, te), se(W, "src", `/d/${r(F).s ?? ""}.webp`), G = xe(W, 1, "svelte-5g1i2z", null, G, ce);
      },
      [
        () => ({
          left: `${r(c)[r(P)].x ?? ""}px`,
          top: `${r(c)[r(P)].y ?? ""}px`,
          width: `${r(c)[r(P)].w ?? ""}px`,
          height: `${r(c)[r(P)].h ?? ""}px`,
          "--flight": T(r(c)[r(P)])
        }),
        () => ({ loaded: r(g).has(r(F).id) })
      ]
    ), Q("click", D, () => s()(r(F))), Pn("load", W, () => E(g, new Set(r(g)).add(r(F).id), !0)), R(w, D);
  }), _r($, (w) => E(d, w), () => r(d)), q(() => se($, "aria-label", `${n().length ?? ""} frames in this stack`)), Gr("innerWidth", (w) => E(u, w, !0)), Gr("innerHeight", (w) => E(o, w, !0)), R(e, $), gt();
}
zt(["click"]);
var eo = /* @__PURE__ */ C('<span class="err svelte-uzy12d"> </span>'), to = /* @__PURE__ */ C(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), no = /* @__PURE__ */ C(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), ro = /* @__PURE__ */ C('<span class="muted svelte-uzy12d"> </span>'), ao = /* @__PURE__ */ C('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function so(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ Y(null), a = /* @__PURE__ */ Y(!1), s = /* @__PURE__ */ Y(null);
  async function i() {
    E(a, !0), E(s, null);
    try {
      E(n, await Oe.probe(), !0);
    } catch (h) {
      E(s, String(h), !0);
    } finally {
      E(a, !1);
    }
  }
  var l = ao(), u = f(l), o = f(u), d = b(u, 2);
  {
    var g = (h) => {
      var v = eo(), y = f(v);
      q(() => A(y, r(s))), R(h, v);
    }, m = (h) => {
      var v = ra(), y = ot(v);
      {
        var c = (x) => {
          var N = to(), L = b(f(N), 2);
          q(
            (T) => A(L, ` above are formats the header
        reader cannot measure (${T ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), R(x, N);
        }, _ = (x) => {
          var N = no(), L = f(N), T = f(L), z = b(L, 2), U = f(z);
          q(
            ($) => {
              A(T, $), A(U, r(n).command);
            },
            [() => Ce(r(n).worklist)]
          ), R(x, N);
        };
        K(y, (x) => {
          r(n).worklist === 0 ? x(c) : x(_, -1);
        });
      }
      R(h, v);
    }, p = (h) => {
      var v = ro(), y = f(v);
      q(() => A(y, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), R(h, v);
    };
    K(d, (h) => {
      r(s) ? h(g) : r(n) ? h(m, 1) : h(p, -1);
    });
  }
  q(() => {
    u.disabled = r(a), A(o, r(a) ? "counting…" : "Check the dimension probe's worklist");
  }), Q("click", u, i), R(e, l), gt();
}
zt(["click"]);
var io = /* @__PURE__ */ C('<p class="bad svelte-1xjbga"> </p>'), lo = /* @__PURE__ */ C('<pre class="svelte-1xjbga"> </pre>'), oo = /* @__PURE__ */ C('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), uo = /* @__PURE__ */ C(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), co = /* @__PURE__ */ C('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), fo = /* @__PURE__ */ C('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), ho = /* @__PURE__ */ C(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), vo = /* @__PURE__ */ C('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), po = /* @__PURE__ */ C(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function go(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ Y(null), a = /* @__PURE__ */ Y(!1), s = /* @__PURE__ */ Y(null), i = /* @__PURE__ */ Y(null);
  const l = /* @__PURE__ */ ne(() => r(n)?.state === "running"), u = /* @__PURE__ */ ne(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const x = await Oe.rebuildStatus();
      E(n, x, !0), E(s, null), x.state === "done" && x.started_at !== r(i) && (E(i, x.started_at, !0), t.oncomplete?.());
    } catch (x) {
      E(s, String(x), !0);
    }
  }
  Hn(() => {
    o();
  }), sn(() => {
    if (!r(l)) return;
    const x = setInterval(o, 700);
    return () => clearInterval(x);
  });
  async function d() {
    E(a, !0), E(s, null);
    try {
      E(n, await Oe.rebuild(), !0);
    } catch (x) {
      E(s, String(x), !0);
    }
  }
  function g(x) {
    x.key === "Escape" && E(a, !1);
  }
  var m = po();
  Pn("keydown", mn, g);
  var p = ot(m), h = f(p), v = f(h), y = b(h, 2), c = b(p, 2);
  {
    var _ = (x) => {
      var N = vo(), L = ot(N), T = b(L, 2), z = f(T), U = b(f(z), 4), $ = f(U), B = b(U, 2), w = b(z, 2);
      {
        var F = (X) => {
          var j = io(), O = f(j);
          q(() => A(O, r(s))), R(X, j);
        };
        K(w, (X) => {
          r(s) && X(F);
        });
      }
      var P = b(w, 2);
      Ge(P, 17, () => r(n)?.steps ?? [], yt, (X, j) => {
        var O = oo();
        let V;
        var S = f(O), k = f(S), I = f(k);
        {
          var ae = (de) => {
            var ie = Mn("✓");
            R(de, ie);
          }, me = (de) => {
            var ie = Mn("✕");
            R(de, ie);
          }, oe = (de) => {
            var ie = Mn("·");
            R(de, ie);
          }, fe = (de) => {
            var ie = Mn(" ");
            R(de, ie);
          };
          K(I, (de) => {
            r(j).state === "done" ? de(ae) : r(j).state === "failed" ? de(me, 1) : r(j).state === "running" ? de(oe, 2) : de(fe, -1);
          });
        }
        var Se = b(k, 2), he = f(Se), Ne = b(Se, 4), Ye = f(Ne), Ee = b(S, 2);
        {
          var rt = (de) => {
            var ie = lo(), Re = f(ie);
            q((Pe) => A(Re, Pe), [() => r(j).log.join(`
`)]), R(de, ie);
          };
          K(Ee, (de) => {
            r(j).log.length && de(rt);
          });
        }
        q(() => {
          V = xe(O, 1, "step svelte-1xjbga", null, V, {
            on: r(j).state === "running",
            bad: r(j).state === "failed"
          }), A(he, r(j).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), A(Ye, r(j).seconds === null ? "" : r(j).seconds + "s");
        }), R(X, O);
      });
      var D = b(P, 2);
      {
        var Z = (X) => {
          var j = uo(), O = ot(j), V = f(O);
          q(() => A(V, r(n).error)), R(X, j);
        }, W = (X) => {
          var j = co();
          R(X, j);
        }, G = (X) => {
          var j = fo();
          R(X, j);
        };
        K(D, (X) => {
          r(n)?.state === "failed" ? X(Z) : r(n)?.state === "done" ? X(W, 1) : r(l) && X(G, 2);
        });
      }
      var te = b(D, 2);
      {
        var ce = (X) => {
          var j = ho(), O = b(f(j), 6), V = f(O);
          q(() => A(V, `python -m photolib.restore_state ${r(u) ?? ""}`)), R(X, j);
        };
        K(te, (X) => {
          r(u) && X(ce);
        });
      }
      q(() => A($, `${r(n)?.seconds ?? 0 ?? ""}s`)), Q("click", L, () => E(a, !1)), Q("click", B, () => E(a, !1)), R(x, N);
    };
    K(c, (x) => {
      r(a) && x(_);
    });
  }
  q(() => {
    h.disabled = r(l), A(v, r(l) ? "applying…" : "Apply to grid"), y.disabled = !r(n) || r(n).state === "idle";
  }), Q("click", h, d), Q("click", y, () => E(a, !0)), R(e, m), gt();
}
zt(["click"]);
var _o = /* @__PURE__ */ C('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), Ma = /* @__PURE__ */ C("<option> </option>"), bo = /* @__PURE__ */ C('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), mo = /* @__PURE__ */ C('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), wo = /* @__PURE__ */ C('<div class="none muted svelte-bqi9ky"> </div>'), yo = /* @__PURE__ */ C('<div class="bar svelte-bqi9ky"><!></div>');
function xo(e, t) {
  pt(t, !0);
  let n = re(t, "candidate", 3, null), a = re(t, "saving", 3, !1);
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
  var g = yo(), m = f(g);
  {
    var p = (y) => {
      var c = _o(), _ = f(c), x = f(_), N = b(_, 2), L = f(N);
      q(() => {
        A(x, `${t.screen.title ?? ""} does not save a rule.`), A(L, t.screen.blurb);
      }), R(y, c);
    }, h = (y) => {
      var c = mo(), _ = ot(c), x = f(_);
      Ge(x, 21, () => s, yt, (O, V) => {
        var S = Ma(), k = f(S), I = {};
        q(() => {
          A(k, r(V)), I !== (I = r(V)) && (S.value = (S.__value = r(V)) ?? "");
        }), R(O, S);
      });
      var N;
      sr(x);
      var L = b(x, 2);
      Ge(L, 21, () => r(u), yt, (O, V) => {
        var S = Ma(), k = f(S), I = {};
        q(() => {
          A(k, r(V)), I !== (I = r(V)) && (S.value = (S.__value = r(V)) ?? "");
        }), R(O, S);
      });
      var T;
      sr(L);
      var z = b(L, 2);
      {
        var U = (O) => {
          var V = bo();
          q(() => un(V, n().value ?? "")), Q("input", V, (S) => d("value", S.currentTarget.value)), R(O, V);
        };
        K(z, (O) => {
          r(o) && O(U);
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
      var W;
      sr(P);
      var G = b(P, 2), te = f(G), ce = b(G, 2), X = b(_, 2), j = f(X);
      q(
        (O, V) => {
          N !== (N = n().column) && (x.value = (x.__value = n().column) ?? "", Xn(x, n().column)), T !== (T = n().op) && (L.value = (L.__value = n().op) ?? "", Xn(L, n().op)), F !== (F = n().decision ?? "exclude") && ($.value = ($.__value = n().decision ?? "exclude") ?? "", Xn($, n().decision ?? "exclude")), W !== (W = O) && (P.value = (P.__value = O) ?? "", Xn(P, O)), G.disabled = a(), A(te, a() ? "saving…" : "Confirm"), A(j, `${V ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => ul(n())
        ]
      ), Q("change", x, (O) => d("column", O.currentTarget.value)), Q("change", L, (O) => d("op", O.currentTarget.value)), Q("change", $, (O) => d("decision", O.currentTarget.value)), Q("change", P, (O) => d("at", O.currentTarget.value)), Q("click", G, function(...O) {
        t.onconfirm?.apply(this, O);
      }), Q("click", ce, function(...O) {
        t.onclear?.apply(this, O);
      }), R(y, c);
    }, v = (y) => {
      var c = wo(), _ = f(c);
      q(() => A(_, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), R(y, c);
    };
    K(m, (y) => {
      t.screen.rule === !1 ? y(p) : n() ? y(h, 1) : y(v, -1);
    });
  }
  R(e, g), gt();
}
zt(["change", "input", "click"]);
var ko = /* @__PURE__ */ C('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), So = /* @__PURE__ */ C('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), Eo = /* @__PURE__ */ C('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), To = /* @__PURE__ */ C('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Mo(e, t) {
  pt(t, !0);
  let n = re(t, "rules", 19, () => []), a = re(t, "unmatched", 3, null), s = re(t, "busy", 3, !1);
  var i = To(), l = f(i), u = b(f(l)), o = f(u), d = b(l, 2);
  {
    var g = (v) => {
      var y = ko();
      R(v, y);
    };
    K(d, (v) => {
      n().length === 0 && v(g);
    });
  }
  var m = b(d, 2);
  Ge(m, 19, n, (v) => v.id, (v, y, c) => {
    var _ = So();
    let x;
    var N = f(_), L = f(N), T = f(L), z = b(L, 2), U = f(z), $ = b(z, 2), B = f($), w = b(N, 2), F = f(w), P = f(F), D = b(F, 2), Z = f(D), W = b(D, 4), G = b(W, 2), te = b(G, 2);
    q(
      (ce, X) => {
        x = xe(_, 1, "rule svelte-aof9c2", null, x, { exclude: r(y).decision === "exclude" }), A(T, r(c)), A(U, r(y).predicate), A(B, r(y).decision), A(P, `${ce ?? ""} paths`), A(Z, X), W.disabled = s() || r(c) === 0, G.disabled = s() || r(c) === n().length - 1, te.disabled = s();
      },
      [
        () => Ce(r(y).paths),
        () => Ct(r(y).bytes)
      ]
    ), Q("click", W, () => t.onmove(r(y), r(c) - 1)), Q("click", G, () => t.onmove(r(y), r(c) + 1)), Q("click", te, () => t.ondelete(r(y))), R(v, _);
  });
  var p = b(m, 2);
  {
    var h = (v) => {
      var y = Eo(), c = b(f(y), 2), _ = f(c), x = f(_), N = b(_, 2), L = f(N);
      q(
        (T, z) => {
          A(x, `${T ?? ""} paths`), A(L, z);
        },
        [
          () => Ce(a().paths),
          () => Ct(a().bytes)
        ]
      ), R(v, y);
    };
    K(p, (v) => {
      a() && v(h);
    });
  }
  q(() => A(o, `${n().length ?? ""} rules · top-down, first match wins`)), R(e, i), gt();
}
zt(["click"]);
const Aa = 2500, Ao = 1, Ro = 2, Po = 3e7;
function Co(e, t, n) {
  const a = [], s = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, d = 0, g = null, m = null, p = null, h = !1, v = !1, y = 0, c = 0, _ = 0, x = n.onState || (() => {
  });
  function N(S) {
    y <= 0 || (o = Kl(a, o, y, S, (k, I, ae) => {
      s.push({ top: d, height: ae, from: k, to: I }), d += ae + Pt;
    }), T());
  }
  function L() {
    if (m === null || h || y <= 0 || o >= m) return 0;
    const S = s.length ? o / s.length : Math.max(1, y / br), k = s.length ? d / s.length : br + Pt, I = Math.round((m - o) / S * k);
    return Math.max(0, Math.min(I, Po - d));
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
    const I = document.createElement("img");
    return I.decoding = "async", I.addEventListener("load", () => k.classList.add("loaded")), I.addEventListener("error", () => k.classList.add("missing")), k.appendChild(I), n.extend && n.extend(k), k;
  }
  function $(S, k) {
    k.firstChild.removeAttribute("src"), k.classList.remove("loaded", "missing", "error"), k.style.backgroundImage = "", k.remove(), i.delete(S), l.push(k);
  }
  function B(S, k, I, ae, me, oe) {
    let fe = i.get(S);
    const Se = a[S];
    if (!fe) {
      fe = U(), fe.dataset.index = String(S);
      const he = fe.firstChild;
      he.fetchPriority = oe ? "high" : "low", he.src = "/t/" + Se.s + ".webp", u.push(S), n.fill && n.fill(fe, Se), e.appendChild(fe), i.set(S, fe);
    }
    fe.style.width = ae + "px", fe.style.height = me + "px", fe.style.transform = "translate(" + k + "px," + I + "px)";
  }
  function w(S, k) {
    k.th && (k.url === void 0 && (k.url = n.thumbHash(k.th)), k.url && (S.style.backgroundImage = "url(" + k.url + ")"));
  }
  function F() {
    _ = 0;
    for (const S of u) {
      const k = i.get(S);
      k && !k.classList.contains("loaded") && w(k, a[S]);
    }
    u.length = 0;
  }
  function P(S, k) {
    let I = 0;
    for (let ae = S.from; ae < S.to; ae++) {
      const oe = ae === S.to - 1 ? y - I : Math.round(mr(a[ae]) * S.height);
      B(ae, I, S.top, oe, S.height, k), I += oe + Pt;
    }
  }
  function D() {
    const S = window.innerHeight, k = z(), I = Ta(s, k - S * Ao, k + S * (1 + Ro));
    if (!I) return;
    const ae = s[I[0]].from, me = s[I[1]].to;
    for (const [oe, fe] of Array.from(i))
      (oe < ae || oe >= me) && $(oe, fe);
    for (let oe = I[0]; oe <= I[1]; oe++) {
      const fe = s[oe];
      P(fe, fe.top < k + S && fe.top + fe.height > k);
    }
    u.length && !_ && (_ = requestAnimationFrame(F));
  }
  function Z() {
    return y <= 0 ? !1 : d - (z() + window.innerHeight) < Aa;
  }
  async function W() {
    if (v || h) return;
    v = !0;
    const S = c;
    x({ loading: !0, count: a.length, exhausted: h, total: m, tiles: p });
    try {
      do {
        const k = await n.fetchPage(g);
        if (S !== c) return;
        for (const I of k.photos) a.push(I);
        g = k.next, h = g === null, typeof k.stacks == "number" ? (m = k.stacks, p = typeof k.total == "number" ? k.total : null) : typeof k.total == "number" && (m = k.total), N(h), D(), x({ loading: !0, count: a.length, exhausted: h, total: m, tiles: p });
      } while (!h && Z());
    } catch (k) {
      S === c && x({ error: String(k) });
    } finally {
      S === c && (v = !1, x({ loading: !1, count: a.length, exhausted: h, total: m, tiles: p }));
    }
  }
  let G = 0;
  function te() {
    G || (G = requestAnimationFrame(() => {
      G = 0, D(), Z() && W();
    }));
  }
  function ce() {
    const S = e.clientWidth;
    if (S === y) return;
    const k = Ta(s, z(), z()), I = k ? s[k[0]].from : 0;
    y = S;
    for (const [me, oe] of Array.from(i)) $(me, oe);
    s.length = 0, o = 0, d = 0, N(h), D();
    const ae = s.find((me) => me.to > I);
    ae && window.scrollTo(0, ae.top + e.offsetTop), Z() && W();
  }
  function X(S) {
    const k = S.target.closest(".tile");
    if (!k || !e.contains(k)) return;
    const I = a[Number(k.dataset.index)];
    I && n.activate && n.activate(I, S, k);
  }
  e.addEventListener("click", X), window.addEventListener("scroll", te, { passive: !0 });
  let j = 0;
  const O = new ResizeObserver(() => {
    clearTimeout(j), j = setTimeout(ce, 100);
  });
  O.observe(e);
  const V = new IntersectionObserver(
    (S) => {
      S.some((k) => k.isIntersecting) && W();
    },
    { rootMargin: "0px 0px " + Aa + "px 0px" }
  );
  return V.observe(t), y = e.clientWidth, W(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      c++, v = !1;
      for (const [S, k] of Array.from(i)) $(S, k);
      a.length = 0, s.length = 0, u.length = 0, o = 0, d = 0, g = null, m = null, p = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), W();
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
        for (const [S, k] of i) n.fill(k, a[S]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(S) {
      for (const [k, I] of i)
        a[k] === S && n.fill && n.fill(I, S);
    },
    destroy() {
      c++, e.removeEventListener("click", X), window.removeEventListener("scroll", te), O.disconnect(), V.disconnect(), clearTimeout(j), cancelAnimationFrame(_);
    }
  };
}
function No(e) {
  try {
    const t = Uint8Array.from(atob(e), (P) => P.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, a = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, d = (a >> 3 & 63) / 63, g = (a >> 9 & 63) / 63, m = a >> 15, p = Math.max(3, m ? o ? 5 : 7 : a & 7), h = Math.max(3, m ? a & 7 : o ? 5 : 7);
    let v = o ? 6 : 5, y = 0;
    const c = (P, D, Z) => {
      const W = [];
      for (let G = 0; G < D; G++)
        for (let te = G ? 0 : 1; te * D < P * (D - G); te++) {
          const ce = t[v + (y >> 1)] >> ((y++ & 1) << 2) & 15;
          W.push((ce / 7.5 - 1) * Z);
        }
      return W;
    }, _ = c(p, h, u), x = c(3, 3, d * 1.25), N = c(3, 3, g * 1.25), L = p / h, T = Math.max(1, Math.round(L > 1 ? 32 : 32 * L)), z = Math.max(1, Math.round(L > 1 ? 32 / L : 32)), U = document.createElement("canvas");
    U.width = T, U.height = z;
    const $ = U.getContext("2d"), B = $.createImageData(T, z), w = [], F = [];
    for (let P = 0, D = 0; P < z; P++)
      for (let Z = 0; Z < T; Z++, D += 4) {
        let W = s, G = i, te = l;
        for (let O = 0; O < p; O++) w[O] = Math.cos(Math.PI / T * (Z + 0.5) * O);
        for (let O = 0; O < h; O++) F[O] = Math.cos(Math.PI / z * (P + 0.5) * O);
        for (let O = 0, V = 0; O < h; O++)
          for (let S = O ? 0 : 1; S * h < p * (h - O); S++, V++)
            W += _[V] * w[S] * F[O] * 2;
        for (let O = 0, V = 0; O < 3; O++)
          for (let S = O ? 0 : 1; S < 3 - O; S++, V++) {
            const k = w[S] * F[O] * 2;
            G += x[V] * k, te += N[V] * k;
          }
        const ce = W - 2 / 3 * G, X = (3 * W - ce + te) / 2, j = X - te;
        B.data[D] = Math.max(0, Math.min(255, Math.round(255 * X))), B.data[D + 1] = Math.max(0, Math.min(255, Math.round(255 * j))), B.data[D + 2] = Math.max(0, Math.min(255, Math.round(255 * ce))), B.data[D + 3] = 255;
      }
    return $.putImageData(B, 0, 0), U.toDataURL();
  } catch {
    return null;
  }
}
var Oo = /* @__PURE__ */ C('<main id="canvas"><div id="sentinel"></div></main>');
function Io(e, t) {
  pt(t, !0);
  let n = re(t, "key", 3, ""), a = re(t, "total", 3, null), s = re(t, "triage", 3, !1), i = re(t, "excludedDirs", 19, () => []), l = re(t, "onActivate", 3, () => {
  }), u = re(t, "onOverride", 3, async () => null), o = re(t, "onExcludeFolder", 3, () => {
  }), d = re(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ Y(null), m = /* @__PURE__ */ Y(null), p = null, h = "";
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
      const w = vs(z.p ?? ""), F = w !== "" && sa(i(), w);
      $.hidden = w === "", $.disabled = F, $.dataset.state = F ? "exclude" : "none", $.title = F ? `already excluded: ${w}` : `exclude everything under ${w}, subfolders included — one exclude rule at the end of the order`;
    }
    const B = T.querySelector(".chip");
    B && (B.dataset.state = z.o || "none", B.textContent = z.o === "exclude" ? "drop" : z.o === "include" ? "keep" : "·", B.title = z.o === "exclude" ? "overridden: excluded — click to keep" : z.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Hn(() => (p = Co(r(g), r(m), {
    fetchPage: (T) => t.fetchPage(T),
    thumbHash: No,
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
    const T = n(), z = a();
    p && (T !== h && (h = T, p.reset()), p.setTotal(z));
  });
  let x = "";
  sn(() => {
    const T = i().join(`
`);
    !p || T === x || (x = T, p.refill());
  });
  var N = Oo(), L = f(N);
  _r(L, (T) => E(m, T), () => r(m)), _r(N, (T) => E(g, T), () => r(g)), R(e, N), gt();
}
var Fo = /* @__PURE__ */ C('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Lo = /* @__PURE__ */ C('<th class="num svelte-1v3p82v"> </th>'), zo = /* @__PURE__ */ C('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Do = /* @__PURE__ */ C('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), jo = /* @__PURE__ */ C('<td class="num svelte-1v3p82v"> </td>'), Ho = /* @__PURE__ */ C('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), qo = /* @__PURE__ */ C('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Bo(e, t) {
  pt(t, !0);
  let n = re(t, "rows", 19, () => []), a = re(t, "rules", 19, () => []), s = re(t, "root", 3, null), i = re(t, "selected", 3, null), l = re(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ ne(() => t.screen.rule !== !1);
  function o(y) {
    return t.screen.label ? t.screen.label(y) : y.key;
  }
  const d = /* @__PURE__ */ ne(() => new Map(n().map((y) => [
    y.key,
    t.screen.rule === !1 ? null : ps(a(), t.screen.toRule(y, s()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var p = ra(), h = ot(p);
  {
    var v = (y) => {
      var c = qo(), _ = f(c), x = f(_), N = f(x);
      {
        var L = (w) => {
          var F = Fo();
          R(w, F);
        };
        K(N, (w) => {
          r(u) && w(L);
        });
      }
      var T = b(N), z = f(T), U = b(T, 3);
      {
        var $ = (w) => {
          var F = Lo(), P = f(F);
          q(() => A(P, t.screen.heading[1])), R(w, F);
        };
        K(U, (w) => {
          t.screen.heading[1] && w($);
        });
      }
      var B = b(_);
      Ge(B, 23, n, (w) => w.key, (w, F, P) => {
        const D = /* @__PURE__ */ ne(() => r(d).get(r(F).key));
        var Z = Ho();
        let W;
        var G = f(Z);
        {
          var te = (he) => {
            const Ne = /* @__PURE__ */ ne(() => l().has(r(F).key));
            var Ye = zo(), Ee = f(Ye);
            let rt;
            var de = f(Ee);
            q(
              (ie) => {
                rt = xe(Ee, 1, "tick svelte-1v3p82v", null, rt, { on: r(Ne) }), se(Ee, "aria-checked", r(Ne)), se(Ee, "aria-label", `select ${ie ?? ""}`), A(de, r(Ne) ? "✓" : "");
              },
              [() => o(r(F))]
            ), Q("click", Ee, (ie) => {
              ie.stopPropagation(), t.oncheck(r(F), r(P), ie.shiftKey);
            }), R(he, Ye);
          };
          K(G, (he) => {
            r(u) && he(te);
          });
        }
        var ce = b(G), X = f(ce);
        let j;
        var O = f(X), V = b(X), S = b(V);
        {
          var k = (he) => {
            var Ne = Do();
            R(he, Ne);
          };
          K(S, (he) => {
            r(F).scope === "whole inventory" && he(k);
          });
        }
        var I = b(ce), ae = f(I), me = b(I), oe = f(me), fe = b(me);
        {
          var Se = (he) => {
            var Ne = jo(), Ye = f(Ne);
            q(() => A(Ye, r(F).detail ?? "")), R(he, Ne);
          };
          K(fe, (he) => {
            t.screen.heading[1] && he(Se);
          });
        }
        q(
          (he, Ne, Ye) => {
            W = xe(Z, 1, "svelte-1v3p82v", null, W, {
              picked: i() === r(F).key,
              clickable: t.screen.sheet !== !1
            }), j = xe(X, 1, "mark svelte-1v3p82v", null, j, {
              exclude: r(D) === "exclude",
              include: r(D) === "include"
            }), se(X, "title", m[r(D)] ?? ""), A(O, g[r(D)] ?? ""), A(V, `${he ?? ""} `), A(ae, Ne), A(oe, Ye);
          },
          [
            () => o(r(F)),
            () => Ce(r(F).paths),
            () => Ct(r(F).bytes)
          ]
        ), Q("click", Z, () => t.onpick(r(F))), R(w, Z);
      }), q(() => A(z, t.screen.heading[0] ?? "")), R(y, c);
    };
    K(h, (y) => {
      n().length && y(v);
    });
  }
  R(e, p), gt();
}
zt(["click"]);
var $o = /* @__PURE__ */ C('<button class="twisty svelte-pucy57"> </button>'), Uo = /* @__PURE__ */ C('<span class="twisty leaf svelte-pucy57">·</span>'), Go = /* @__PURE__ */ C('<span class="name root svelte-pucy57"> </span>'), Yo = /* @__PURE__ */ C('<button class="name svelte-pucy57"> </button>'), Wo = /* @__PURE__ */ C('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Vo = /* @__PURE__ */ C('<div class="note svelte-pucy57"> </div>'), Xo = /* @__PURE__ */ C('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Ko = /* @__PURE__ */ C('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Jo = /* @__PURE__ */ C('<div class="tree svelte-pucy57"></div>');
function Zo(e, t) {
  pt(t, !0);
  let n = re(t, "version", 3, 0), a = re(t, "excludedDirs", 19, () => []), s = re(t, "selected", 3, null), i = re(t, "busy", 3, !1), l = /* @__PURE__ */ Y(Ie(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ Y(Ie(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ Y(Ie(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ Y(Ie(/* @__PURE__ */ new Set()));
  async function g(c) {
    E(o, new Set(r(o)).add(c), !0);
    const _ = await t.onload(c), x = new Map(r(l)), N = new Set(r(d));
    _ ? (x.set(c, _), N.delete(c)) : N.add(c), E(l, x, !0), E(d, N, !0), E(o, new Set([...r(o)].filter((L) => L !== c)), !0);
  }
  function m(c) {
    if (r(u).has(c)) {
      E(u, new Set([...r(u)].filter((_) => _ !== c)), !0);
      return;
    }
    E(u, new Set(r(u)).add(c), !0), r(l).has(c) || g(c);
  }
  let p = -1;
  sn(() => {
    const c = n();
    if (c !== p) {
      p = c, r(u).has(t.root) || E(u, new Set(r(u)).add(t.root), !0);
      for (const _ of r(u)) g(_);
    }
  });
  const h = /* @__PURE__ */ ne(() => {
    const c = [], _ = (T, z, U, $, B, w) => {
      const F = r(l).get(T), P = r(u).has(T);
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
        loading: r(o).has(T),
        failed: r(d).has(T),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: sa(a(), T)
      }), !(!P || !F))
        for (const D of F.children)
          _(D.path, D.name, U + 1, D.paths, D.bytes, D.deeper);
    }, x = r(l).get(t.root), N = x ? x.children.reduce((T, z) => T + z.paths, 0) + x.here.paths : 0, L = x ? x.children.reduce((T, z) => T + z.bytes, 0) + x.here.bytes : 0;
    return _(t.root, t.root, 0, N, L, !0), c;
  }), v = 8;
  var y = Jo();
  Ge(y, 21, () => r(h), (c) => c.key, (c, _) => {
    var x = Ko(), N = ot(x);
    let L;
    var T = f(N);
    let z;
    var U = b(T, 2);
    {
      var $ = (S) => {
        var k = $o(), I = f(k);
        q(() => {
          se(k, "aria-expanded", r(_).expanded), se(k, "aria-label", `${r(_).expanded ? "collapse" : "expand"} ${r(_).name ?? ""}`), se(k, "title", r(_).expanded ? "collapse" : "expand"), A(I, r(_).loading ? "·" : r(_).expanded ? "▾" : "▸");
        }), Q("click", k, () => m(r(_).key)), R(S, k);
      }, B = (S) => {
        var k = Uo();
        R(S, k);
      };
      K(U, (S) => {
        r(_).deeper ? S($) : S(B, -1);
      });
    }
    var w = b(U, 2);
    {
      var F = (S) => {
        var k = Go(), I = f(k);
        q(() => A(I, r(_).key)), R(S, k);
      }, P = (S) => {
        var k = Yo(), I = f(k);
        q(() => {
          se(k, "title", `Show every kept file under ${r(_).key ?? ""}`), A(I, r(_).name);
        }), Q("click", k, () => t.onpick(r(_))), R(S, k);
      };
      K(w, (S) => {
        r(_).depth === 0 ? S(F) : S(P, -1);
      });
    }
    var D = b(w, 2), Z = f(D), W = b(D, 2), G = f(W), te = b(W, 2), ce = b(N, 2);
    {
      var X = (S) => {
        var k = Wo();
        let I;
        q((ae) => I = fn(k, "", I, ae), [
          () => ({
            "padding-left": `${Math.min(r(_).depth, v) * 11 + 18}px`
          })
        ]), R(S, k);
      }, j = (S) => {
        var k = Vo();
        let I;
        var ae = f(k);
        q(
          (me, oe, fe) => {
            I = fn(k, "", I, me), A(ae, `${oe ?? ""} directly here · ${fe ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(_).depth, v) * 11 + 18}px`
            }),
            () => Ce(r(_).here.paths),
            () => Ct(r(_).here.bytes)
          ]
        ), R(S, k);
      };
      K(ce, (S) => {
        r(_).expanded && r(_).failed ? S(X) : r(_).expanded && r(_).here && r(_).here.paths > 0 && S(j, 1);
      });
    }
    var O = b(ce, 2);
    {
      var V = (S) => {
        var k = Xo();
        let I;
        q((ae) => I = fn(k, "", I, ae), [
          () => ({
            "padding-left": `${Math.min(r(_).depth, v) * 11 + 18}px`
          })
        ]), R(S, k);
      };
      K(O, (S) => {
        r(_).truncated && S(V);
      });
    }
    q(
      (S, k, I) => {
        L = xe(N, 1, "row svelte-pucy57", null, L, {
          picked: s() === r(_).key,
          gone: r(_).excluded
        }), z = fn(T, "", z, S), A(Z, k), A(G, I), te.disabled = i() || r(_).excluded || r(_).depth === 0, se(te, "title", r(_).depth === 0 ? "The library root is not excludable from here." : r(_).excluded ? "already excluded" : `Exclude everything under ${r(_).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(_).depth, v) * 11}px` }),
        () => Ce(r(_).paths),
        () => Ct(r(_).bytes)
      ]
    ), Q("click", te, () => t.onexclude(r(_))), R(c, x);
  }), R(e, y), gt();
}
zt(["click"]);
var Qo = /* @__PURE__ */ C('<button title="Back to its default">↺</button>'), eu = /* @__PURE__ */ C('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), tu = /* @__PURE__ */ C('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), nu = /* @__PURE__ */ C('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), ru = /* @__PURE__ */ C('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), au = /* @__PURE__ */ C('<li><code class="svelte-1hh0fwb"> </code> </li>'), su = /* @__PURE__ */ C(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), iu = /* @__PURE__ */ C('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function lu(e, t) {
  pt(t, !0);
  const n = "photos.glass", a = [
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
  let u = /* @__PURE__ */ Y(Ie(wl())), o = /* @__PURE__ */ Y(!0), d = /* @__PURE__ */ Y(!1), g = /* @__PURE__ */ Y(Ie(ys())), m = /* @__PURE__ */ Y(Ie(window.innerWidth));
  const p = (P) => r(g) === "light" ? P.light : P.dark, h = (P) => P in cn ? cn : nn, v = (P) => `rgba(${P.r}, ${P.g}, ${P.b}, ${P.a})`, y = /* @__PURE__ */ ne(() => JSON.stringify(r(u), null, 2));
  Hn(() => {
    const P = localStorage.getItem(n);
    if (P)
      try {
        E(u, Cr(JSON.parse(P)), !0);
        return;
      } catch {
      }
    ia();
  });
  function c(P) {
    E(u, Cr({ ...r(u), ...P }), !0), localStorage.setItem(n, JSON.stringify(r(u))), E(d, !1);
  }
  function _(P) {
    E(u, Cr(P), !0), localStorage.setItem(n, JSON.stringify(r(u))), E(d, !1);
  }
  function x(P) {
    c({ [P]: h(P)[P] });
  }
  function N() {
    E(g, xs(r(g) === "dark" ? "light" : "dark"), !0);
  }
  async function L() {
    await navigator.clipboard.writeText(r(y)), E(d, !0);
  }
  var T = iu();
  let z;
  var U = f(T), $ = b(f(U), 4), B = f($), w = b(U, 2);
  {
    var F = (P) => {
      var D = su();
      {
        const Ee = (de, ie = ir, Re = ir, Pe = ir) => {
          var Fe = Qo();
          let Qe;
          q(() => {
            Qe = xe(Fe, 1, "undo svelte-1hh0fwb", null, Qe, { idle: !Re() }), se(Fe, "aria-label", `Reset ${ie() ?? ""}`);
          }), Q("click", Fe, function(...ct) {
            Pe()?.apply(this, ct);
          }), R(de, Fe);
        };
        var Z = b(f(D), 2);
        Ge(Z, 17, () => a, yt, (de, ie) => {
          var Re = tu(), Pe = f(Re), Fe = f(Pe), Qe = b(Pe, 2), ct = f(Qe), Et = b(Qe, 2);
          Ge(Et, 17, () => r(ie).rows, yt, (Dt, Bt) => {
            var _t = /* @__PURE__ */ ne(() => Tr(r(Bt), 5));
            let et = () => r(_t)[0], Tt = () => r(_t)[1], H = () => r(_t)[2], ee = () => r(_t)[3], pe = () => r(_t)[4];
            const Te = /* @__PURE__ */ ne(() => r(u)[et()] !== h(et())[et()]), we = /* @__PURE__ */ ne(() => typeof ee() == "function" ? ee()(r(m)) : ee());
            var ve = eu();
            let ye;
            var We = f(ve), at = f(We), ge = b(We, 2), He = b(ge, 2), Mt = b(He, 2);
            Ee(Mt, Tt, () => r(Te), () => () => x(et())), q(() => {
              ye = xe(ve, 1, "row svelte-1hh0fwb", null, ye, { moved: r(Te) }), A(at, Tt()), se(ge, "min", H()), se(ge, "max", r(we)), se(ge, "step", pe()), se(ge, "aria-label", Tt()), un(ge, r(u)[et()]), se(He, "min", H()), se(He, "max", r(we)), se(He, "step", pe()), se(He, "aria-label", `${Tt() ?? ""} value`), un(He, r(u)[et()]);
            }), Q("input", ge, (Be) => c({ [et()]: Number(Be.currentTarget.value) })), Q("input", He, (Be) => c({ [et()]: Number(Be.currentTarget.value) })), R(Dt, ve);
          }), q(() => {
            A(Fe, r(ie).title), A(ct, r(ie).note);
          }), R(de, Re);
        });
        var W = b(Z, 2), G = f(W), te = b(W, 2), ce = f(te), X = b(te, 2);
        Ge(X, 17, () => ml, yt, (de, ie) => {
          const Re = /* @__PURE__ */ ne(() => p(r(ie))), Pe = /* @__PURE__ */ ne(() => r(u)[r(Re)]), Fe = /* @__PURE__ */ ne(() => r(ie).base[r(Re)]);
          var Qe = ru(), ct = f(Qe), Et = f(ct), Dt = b(Et), Bt = f(Dt), _t = b(ct, 2), et = f(_t), Tt = b(_t, 2);
          Ge(Tt, 17, () => i, yt, (Te, we) => {
            var ve = /* @__PURE__ */ ne(() => Tr(r(we), 3));
            let ye = () => r(ve)[0], We = () => r(ve)[1], at = () => r(ve)[2];
            const ge = /* @__PURE__ */ ne(() => r(Pe)[ye()] !== r(Fe)[ye()]);
            var He = nu();
            let Mt;
            var Be = f(He), M = f(Be), J = b(Be, 2), be = b(J, 2), $e = b(be, 2);
            Ee($e, We, () => r(ge), () => () => c({
              [r(Re)]: { ...r(Pe), [ye()]: r(Fe)[ye()] }
            })), q(() => {
              Mt = xe(He, 1, "row svelte-1hh0fwb", null, Mt, { moved: r(ge) }), A(M, We()), se(J, "max", at()), se(J, "step", at() === 1 ? 0.01 : 1), se(J, "aria-label", `${r(g) ?? ""} ${s[r(ie).dark].title ?? ""} ${We() ?? ""}`), un(J, r(Pe)[ye()]), se(be, "max", at()), se(be, "step", at() === 1 ? 0.01 : 1), se(be, "aria-label", `${r(g) ?? ""} ${s[r(ie).dark].title ?? ""} ${We() ?? ""} value`), un(be, r(Pe)[ye()]);
            }), Q("input", J, (dt) => c({
              [r(Re)]: {
                ...r(Pe),
                [ye()]: Number(dt.currentTarget.value)
              }
            })), Q("input", be, (dt) => c({
              [r(Re)]: {
                ...r(Pe),
                [ye()]: Number(dt.currentTarget.value)
              }
            })), R(Te, He);
          });
          var H = b(Tt, 2);
          let ee;
          var pe = f(H);
          q(
            (Te, we) => {
              A(Et, `${s[r(ie).dark].title ?? ""} `), A(Bt, r(g)), A(et, s[r(ie).dark].note), ee = fn(H, "", ee, Te), A(pe, we);
            },
            [
              () => ({ background: v(r(Pe)) }),
              () => v(r(Pe))
            ]
          ), R(de, Qe);
        });
        var j = b(X, 2), O = b(f(j), 4);
        let rt;
        var V = f(O), S = f(V), k = b(V, 2);
        Ee(k, () => "Blur at the edge", () => r(u).blurEdge !== cn.blurEdge, () => () => x("blurEdge"));
        var I = b(j, 2), ae = b(f(I), 4);
        Ge(ae, 21, () => l, yt, (de, ie) => {
          var Re = /* @__PURE__ */ ne(() => Tr(r(ie), 2));
          let Pe = () => r(Re)[0], Fe = () => r(Re)[1];
          var Qe = au(), ct = f(Qe), Et = f(ct), Dt = b(ct);
          q(() => {
            A(Et, Pe()), A(Dt, ` — ${Fe() ?? ""}`);
          }), R(de, Qe);
        });
        var me = b(I, 2), oe = b(f(me), 4), fe = f(oe), Se = b(fe, 2), he = b(Se, 2), Ne = f(he), Ye = b(oe, 2);
        q(() => {
          A(G, `The five colours below are per theme, and you are editing the ${r(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), A(ce, `Edit the ${r(g) === "dark" ? "light" : "dark"} colours`), rt = xe(O, 1, "row toggle svelte-1hh0fwb", null, rt, { moved: r(u).blurEdge !== cn.blurEdge }), rl(S, r(u).blurEdge), A(Ne, r(d) ? "Copied" : "Copy"), un(Ye, r(y));
        }), Q("click", te, N), Q("change", S, (de) => c({ blurEdge: de.currentTarget.checked })), Q("click", fe, () => _(nn)), Q("click", Se, () => _(cn)), Q("click", he, L);
      }
      R(P, D);
    };
    K(w, (P) => {
      r(o) && P(F);
    });
  }
  q(() => {
    z = xe(T, 1, "tuner svelte-1hh0fwb", null, z, { folded: !r(o) }), se($, "title", r(o) ? "Fold away" : "Open"), A(B, r(o) ? "–" : "+");
  }), Gr("innerWidth", (P) => E(m, P, !0)), Q("click", $, () => E(o, !r(o))), R(e, T), gt();
}
zt(["click", "input", "change"]);
var ou = /* @__PURE__ */ C('<button><span class="n svelte-1n46o8q"> </span> </button>'), uu = /* @__PURE__ */ C('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), cu = /* @__PURE__ */ C('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), du = /* @__PURE__ */ C('<div class="muted pad svelte-1n46o8q">loading…</div>'), fu = /* @__PURE__ */ C('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), hu = /* @__PURE__ */ C('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), vu = /* @__PURE__ */ C('<p class="blurb"> </p>'), pu = /* @__PURE__ */ C('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), gu = /* @__PURE__ */ C('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), _u = /* @__PURE__ */ C('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), bu = /* @__PURE__ */ C('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), mu = /* @__PURE__ */ C("<div> </div>"), wu = /* @__PURE__ */ C('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function yu(e, t) {
  pt(t, !0);
  const n = location.pathname === "/tune";
  let a = /* @__PURE__ */ Y("grid"), s = /* @__PURE__ */ Y(0), i = /* @__PURE__ */ Y(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ Y(Ie([])), u = /* @__PURE__ */ Y(null), o = /* @__PURE__ */ Y(null), d = /* @__PURE__ */ Y(Ie(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ Y(null), m = /* @__PURE__ */ Y(null), p = /* @__PURE__ */ Y(null), h = /* @__PURE__ */ Y(null), v = /* @__PURE__ */ Y(!1), y = /* @__PURE__ */ Y(!1), c = /* @__PURE__ */ Y(!1), _ = /* @__PURE__ */ Y(!1), x = /* @__PURE__ */ Y(Ie({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), N = /* @__PURE__ */ Y(null), L = /* @__PURE__ */ Y(0), T = /* @__PURE__ */ Y(null), z = /* @__PURE__ */ Y(Ie({})), U = /* @__PURE__ */ Y("newest"), $ = /* @__PURE__ */ Y(Ie(Cl())), B = /* @__PURE__ */ Y(null);
  const w = /* @__PURE__ */ ne(() => ya[r(s)]), F = /* @__PURE__ */ ne(() => r(w).table !== !1), P = /* @__PURE__ */ ne(() => r(F) || r(w).tree === !0), D = /* @__PURE__ */ ne(() => r(w).sheet !== !1 && (r(o) !== null || !r(P))), Z = /* @__PURE__ */ ne(() => ({
    sort: r(U),
    ...r($).on ? { stack: r($).window } : {},
    ...Object.fromEntries(Object.entries(r(z)).filter(([, M]) => M.length > 0))
  })), W = /* @__PURE__ */ ne(() => r(a) === "grid" ? `grid:${JSON.stringify(r(Z))}` : `triage:${r(s)}:${JSON.stringify(r(o))}`), G = /* @__PURE__ */ ne(() => r(w).rule === !1 || r(d).size === 0 ? [] : r(l).filter((M) => r(d).has(M.key)).map((M) => r(w).toRule(M, r(i))).filter((M) => M && ps(r(m)?.rules ?? [], M) !== "exclude")), te = /* @__PURE__ */ ne(() => (r(m)?.rules ?? []).filter((M) => M.decision === "exclude" && M.term?.column === "dir_under").map((M) => String(M.term.value).replace(/[\\/]+$/, "").toLowerCase())), ce = ll();
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
  const O = ol(
    () => {
      E(y, !0), j(async () => {
        const M = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: J, value: be } = await ce(() => Oe.counts(r(o), M));
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
    if (r(a) !== "triage" || !r(F)) {
      E(l, [], !0);
      return;
    }
    E(_, !0);
    const J = r(w).name === "source_folder" && r(i) ? { root: r(i) } : {};
    M && (J.live = "1");
    const be = await j(() => Oe.screen(r(w).name, J));
    E(l, be?.rows ?? [], !0), E(_, !1);
  }
  let k = !1;
  sn(() => {
    r(s), r(a), wn(() => {
      E(u, null), E(o, null), E(i, null), oe(), r(a) === "triage" && (S(), O.now(), k || (k = !0, V()));
    });
  }), sn(() => {
    r(i), wn(() => {
      r(a) === "triage" && (oe(), S());
    });
  }), Hn(() => {
    j(async () => {
      E(T, await Oe.facets(), !0);
    });
  });
  function I(M, J) {
    E(z, { ...r(z), [M]: J }, !0);
  }
  function ae(M) {
    if (r(w).sheet !== !1) {
      if (r(w).drill && !r(i)) {
        E(u, M.key, !0), E(
          o,
          {
            ...r(w).toRule(M, null),
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
          ...r(w).toRule(M, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), O();
    }
  }
  function me(M, J, be) {
    const $e = new Set(r(d)), dt = !$e.has(M.key), At = be && r(g) !== null ? r(l).findIndex((Xe) => Xe.key === r(g)) : -1, [Ve, Ue] = At < 0 ? [J, J] : At < J ? [At, J] : [J, At];
    for (let Xe = Ve; Xe <= Ue; Xe++)
      dt ? $e.add(r(l)[Xe].key) : $e.delete(r(l)[Xe].key);
    E(d, $e, !0), E(g, M.key, !0);
  }
  function oe() {
    E(d, /* @__PURE__ */ new Set(), !0), E(g, null);
  }
  function fe(M) {
    E(o, M, !0), E(
      u,
      null
      // it no longer corresponds to a row
    ), O();
  }
  function Se(M = !1) {
    E(o, null), E(u, null), M && E(i, null), O.now();
  }
  async function he() {
    E(
      v,
      !0
      // the distinct-content number now says so on its face
    ), Ti(L), await S(), O.now();
  }
  async function Ne() {
    if (!r(o)) return;
    E(c, !0);
    const M = r(o).at === "end" ? void 0 : 0, J = await j(() => Oe.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(w).id} ${r(w).title}`
      },
      M
    ));
    E(c, !1), J && (E(o, null), E(u, null), await he());
  }
  async function Ye() {
    const M = r(G);
    if (!M.length) {
      oe();
      return;
    }
    E(c, !0);
    for (const J of M)
      if (!await j(() => Oe.addRule({
        column: J.column,
        op: J.op,
        value: J.value,
        decision: "exclude",
        note: `screen ${r(w).id} ${r(w).title}`
      }))) break;
    E(c, !1), oe(), E(o, null), E(u, null), await he();
  }
  async function Ee(M) {
    if (!M || sa(r(te), M)) return;
    E(c, !0);
    const J = await j(() => Oe.addRule({
      column: "dir_under",
      op: "=",
      value: M,
      decision: "exclude",
      note: `screen ${r(w).id} ${r(w).title}`
    }));
    E(c, !1), J && await he();
  }
  const rt = (M) => Ee(vs(M.p ?? "")), de = (M) => Ee(M.key);
  async function ie(M) {
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
    return be ? (E(v, !0), O(), be.decision) : M.o ?? null;
  }
  function Qe(M) {
    return r(a) === "grid" ? Oe.photos({ limit: 500, ...r(Z), ...M || {} }) : Oe.page(r(o), M);
  }
  function ct(M, J) {
    if (r(a) === "grid" && M.m) {
      E(B, { frames: M.m, origin: J.getBoundingClientRect() }, !0);
      return;
    }
    j(() => r(a) === "grid" ? Oe.revealPhoto(M.id) : Oe.revealOrigin(M.id));
  }
  function Et(M) {
    E(B, null), j(() => Oe.revealPhoto(M.id));
  }
  var Dt = wu(), Bt = ot(Dt);
  {
    var _t = (M) => {
      Vl(M, {
        get facets() {
          return r(T);
        },
        get selected() {
          return r(z);
        },
        get sort() {
          return r(U);
        },
        get stacking() {
          return r($);
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
        onselect: I,
        onsort: (J) => E(U, J, !0),
        onstack: (J) => E($, Nl(J), !0),
        onclear: () => E(z, {}, !0),
        ontriage: () => E(a, "triage")
      });
    };
    K(Bt, (M) => {
      r(a) === "grid" && M(_t);
    });
  }
  var et = b(Bt, 2);
  {
    var Tt = (M) => {
      lu(M, {});
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
      var J = hu(), be = f(J), $e = f(be), dt = b(be, 2);
      Ge(dt, 21, () => ya, yt, (Ke, ft, st) => {
        var Rt = ou();
        let Kt;
        var Jt = f(Rt), ke = f(Jt), it = b(Jt, 1, !0);
        q(() => {
          Kt = xe(Rt, 1, "nav svelte-1n46o8q", null, Kt, { on: st === r(s) }), A(ke, r(ft).id), A(it, r(ft).title);
        }), Q("click", Rt, () => E(s, st, !0)), R(Ke, Rt);
      });
      var At = b(dt, 2);
      {
        var Ve = (Ke) => {
          var ft = fu(), st = ot(ft), Rt = f(st);
          {
            var Kt = (Je) => {
              var tt = uu(), yn = ot(tt), qn = /* @__PURE__ */ ne(() => Se.bind(null, !0)), kr = b(yn, 2), Sr = f(kr);
              q(() => A(Sr, `inside ${r(i) ?? ""}`)), Q("click", yn, function(...Er) {
                r(qn)?.apply(this, Er);
              }), R(Je, tt);
            }, Jt = (Je) => {
              var tt = cu(), yn = f(tt);
              q(() => A(yn, r(w).relive)), Q("click", tt, () => S(!0)), R(Je, tt);
            };
            K(Rt, (Je) => {
              r(w).drill && r(i) ? Je(Kt) : r(w).relive && Je(Jt, 1);
            });
          }
          var ke = b(st, 2);
          {
            var it = (Je) => {
              var tt = du();
              R(Je, tt);
            };
            K(ke, (Je) => {
              r(_) && Je(it);
            });
          }
          var Zt = b(ke, 2);
          {
            let Je = /* @__PURE__ */ ne(() => r(m)?.rules ?? []);
            Bo(Zt, {
              get rows() {
                return r(l);
              },
              get screen() {
                return r(w);
              },
              get root() {
                return r(i);
              },
              get checked() {
                return r(d);
              },
              get rules() {
                return r(Je);
              },
              get selected() {
                return r(u);
              },
              onpick: ae,
              oncheck: me
            });
          }
          R(Ke, ft);
        };
        K(At, (Ke) => {
          r(F) && Ke(Ve);
        });
      }
      var Ue = b(At, 2);
      {
        var Xe = (Ke) => {
          Zo(Ke, {
            get root() {
              return Ln;
            },
            get version() {
              return r(L);
            },
            get excludedDirs() {
              return r(te);
            },
            get selected() {
              return r(u);
            },
            get busy() {
              return r(c);
            },
            onload: (ft) => j(() => Oe.tree(ft)),
            onpick: ae,
            onexclude: de
          });
        };
        K(Ue, (Ke) => {
          r(w).tree && Ke(Xe);
        });
      }
      var ln = b(Ue, 2);
      {
        let Ke = /* @__PURE__ */ ne(() => r(m)?.rules ?? []), ft = /* @__PURE__ */ ne(() => r(m)?.unmatched ?? null);
        Mo(ln, {
          get rules() {
            return r(Ke);
          },
          get unmatched() {
            return r(ft);
          },
          get busy() {
            return r(c);
          },
          ondelete: ie,
          onmove: Re
        });
      }
      var on = b(ln, 2);
      go(on, { oncomplete: Pe }), Q("click", $e, () => E(a, "grid")), R(M, J);
    };
    K(pe, (M) => {
      r(a) === "triage" && M(Te);
    });
  }
  var we = b(pe, 2), ve = f(we);
  {
    var ye = (M) => {
      var J = bu(), be = ot(J), $e = f(be), dt = b(be, 2), At = f(dt), Ve = b(dt, 2);
      {
        var Ue = (ke) => {
          var it = vu(), Zt = f(it);
          q(() => A(Zt, r(w).note)), R(ke, it);
        };
        K(Ve, (ke) => {
          r(w).note && ke(Ue);
        });
      }
      var Xe = b(Ve, 2);
      {
        var ln = (ke) => {
          so(ke, {
            get screen() {
              return r(w);
            }
          });
        };
        K(Xe, (ke) => {
          r(w).name === "dimensions" && ke(ln);
        });
      }
      var on = b(Xe, 2);
      bl(on, {
        get counts() {
          return r(m);
        },
        get files() {
          return r(p);
        },
        get filesAt() {
          return r(h);
        },
        get stale() {
          return r(v);
        },
        get candidate() {
          return r(o);
        },
        get busy() {
          return r(y);
        },
        onfiles: V
      });
      var Ke = b(on, 2);
      {
        var ft = (ke) => {
          var it = pu(), Zt = f(it), Je = f(Zt), tt = b(Zt, 2), yn = f(tt), qn = b(tt, 2), kr = b(qn, 2), Sr = f(kr);
          {
            var Er = (Qt) => {
              var xn = Mn("already excluded — nothing left to write");
              R(Qt, xn);
            }, ks = (Qt) => {
              var xn = Mn();
              q((Ss) => A(xn, `one exclude rule each, at the end of the order${Ss ?? ""}`), [
                () => r(G).length < r(d).size ? ` · ${Ce(r(d).size - r(G).length)} already excluded, skipped` : ""
              ]), R(Qt, xn);
            };
            K(Sr, (Qt) => {
              r(G).length ? Qt(ks, -1) : Qt(Er);
            });
          }
          q(
            (Qt, xn) => {
              A(Je, `${Qt ?? ""} ticked`), tt.disabled = r(c) || !r(G).length, A(yn, xn), qn.disabled = r(c);
            },
            [
              () => Ce(r(d).size),
              () => r(c) ? "saving…" : `Exclude ${Ce(r(G).length)}`
            ]
          ), Q("click", tt, Ye), Q("click", qn, oe), R(ke, it);
        };
        K(Ke, (ke) => {
          r(d).size && ke(ft);
        });
      }
      var st = b(Ke, 2);
      xo(st, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(w);
        },
        get saving() {
          return r(c);
        },
        onedit: fe,
        onconfirm: Ne,
        onclear: Se
      });
      var Rt = b(st, 2);
      {
        var Kt = (ke) => {
          var it = gu(), Zt = f(it);
          q((Je, tt) => A(Zt, `${Je ?? ""}${tt ?? ""} loaded${r(x).exhausted ? " · all of them" : ""}${r(x).loading ? " · loading…" : ""} `), [
            () => Ce(r(x).count),
            () => r(x).total ? " of " + Ce(r(x).total) : ""
          ]), R(ke, it);
        }, Jt = (ke) => {
          var it = _u();
          R(ke, it);
        };
        K(Rt, (ke) => {
          r(D) ? ke(Kt) : r(w).sheet === !1 && ke(Jt, 1);
        });
      }
      q(() => {
        A($e, `${r(w).id ?? ""} · ${r(w).title ?? ""}`), A(At, r(w).blurb);
      }), R(M, J);
    };
    K(ve, (M) => {
      r(a) === "triage" && M(ye);
    });
  }
  var We = b(ve, 2);
  {
    var at = (M) => {
      {
        let J = /* @__PURE__ */ ne(() => r(a) === "grid" ? null : r(m)?.page_paths ?? null), be = /* @__PURE__ */ ne(() => r(a) === "triage");
        Io(M, {
          get key() {
            return r(W);
          },
          fetchPage: Qe,
          get total() {
            return r(J);
          },
          get triage() {
            return r(be);
          },
          get excludedDirs() {
            return r(te);
          },
          onActivate: ct,
          onOverride: Fe,
          onExcludeFolder: rt,
          onState: ($e) => E(x, { ...r(x), ...$e }, !0)
        });
      }
    };
    K(We, (M) => {
      (r(D) || r(a) === "grid") && M(at);
    });
  }
  var ge = b(H, 2);
  {
    var He = (M) => {
      Ql(M, {
        get frames() {
          return r(B).frames;
        },
        get origin() {
          return r(B).origin;
        },
        onreveal: Et,
        onclose: () => E(B, null)
      });
    };
    K(ge, (M) => {
      r(B) && M(He);
    });
  }
  var Mt = b(ge, 2);
  {
    var Be = (M) => {
      var J = mu();
      let be;
      var $e = f(J);
      q(() => {
        be = xe(J, 1, "status", null, be, { bare: r(a) === "grid" }), A($e, r(N));
      }), R(M, J);
    };
    K(Mt, (M) => {
      r(N) && M(Be);
    });
  }
  q(() => ee = xe(H, 1, "shell", null, ee, { bare: r(a) === "grid" })), R(e, Dt), gt();
}
zt(["click"]);
Ol();
ia();
Gi(yu, { target: document.getElementById("app") });
