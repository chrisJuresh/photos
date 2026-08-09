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
  var t = le;
  if (t === null)
    return oe.f |= rn, e;
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
  var t = oe, n = le;
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
        le
      );
      l.b = this, l.f |= Lr, r(i);
    }, this.parent = /** @type {Effect} */
    le.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#r = ta(() => {
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
        be
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
          be
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
    var n = le, r = oe, s = Ze;
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
    be?.is_fork ? (this.#s && be.skip_effect(this.#s), this.#n && be.skip_effect(this.#n), this.#l && be.skip_effect(this.#l), be.oncommit(() => {
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
              le
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
    le
  ), o = mi(), d = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function _(h) {
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
  var b = qa();
  if (n.length === 0) {
    d.then(() => _([])).finally(b);
    return;
  }
  function p() {
    Promise.all(n.map((h) => /* @__PURE__ */ wi(h))).then(_).catch((h) => tn(h, u)).finally(b);
  }
  d ? d.then(() => {
    o(), p(), fr();
  }) : p();
}
function mi() {
  var e = (
    /** @type {Effect} */
    le
  ), t = oe, n = Ze, r = (
    /** @type {Batch} */
    be
  );
  return function(i = !0) {
    qt(e), St(t), On(n), i && (e.f & vt) === 0 && (r?.activate(), r?.apply());
  };
}
function fr(e = !0) {
  qt(null), St(null), On(null), e && be?.deactivate();
}
function qa() {
  var e = (
    /** @type {Effect} */
    le
  ), t = e.b, n = (
    /** @type {Batch} */
    be
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function Zn(e) {
  var t = qe | De;
  return le !== null && (le.f |= Dn), {
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
    parent: le,
    ac: null
  };
}
const Wn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function wi(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    le
  );
  r === null && Ds();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = bn(
    /** @type {V} */
    Le
  ), l = !oe, u = /* @__PURE__ */ new Set();
  return Fi(() => {
    var o = (
      /** @type {Effect} */
      le
    ), d = Ca();
    s = d.promise;
    try {
      Promise.resolve(e()).then(d.resolve, (h) => {
        h !== er && d.reject(h);
      }).finally(fr);
    } catch (h) {
      d.reject(h), fr();
    }
    var _ = (
      /** @type {Batch} */
      be
    );
    if (l) {
      if ((o.f & zn) !== 0)
        var b = qa();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        _.async_deriveds.get(o)?.reject(Wn);
      else
        for (const h of u.values())
          h.reject(Wn);
      u.add(d), _.async_deriveds.set(o, d);
    }
    const p = (h, v = void 0) => {
      b?.(), u.delete(d), v !== Wn && (_.activate(), v ? (i.f |= rn, In(i, v)) : ((i.f & rn) !== 0 && (i.f ^= rn), In(i, h)), _.deactivate());
    };
    d.promise.then(p, (h) => p(null, h || "unknown"));
  }), xr(() => {
    for (const o of u)
      o.reject(Wn);
  }), new Promise((o) => {
    function d(_) {
      function b() {
        _ === s ? o(i) : d(s);
      }
      _.then(b, b);
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
  var t, n = le, r = e.parent;
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
  if (!e.equals(t) && (e.wv = us(), (!be?.is_fork || e.deps === null) && (be !== null ? (be.capture(e, t, !0), qr?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Ae(e, ze);
    return;
  }
  Vt || (It !== null ? (ea() || be?.is_fork) && It.set(e, t) : Kr(e));
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
let Mr = null, kn = null, be = null, qr = null, It = null, Br = null, Ar = !1, Tn = null, lr = null;
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
    if (be = null, s.length > 0) {
      var i = an.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (Tn = null, lr = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [o, d] of this.#f)
        Wa(o, d);
      s.length > 0 && /** @type {unknown} */
      be.#_();
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
      be
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
        var _ = s.next;
        if (_ !== null) {
          s = _;
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
    this.oncommit(() => t.discard()), t.#v(), be = this, this.#_();
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
    be = this;
  }
  deactivate() {
    be = null, It = null;
  }
  flush() {
    try {
      Ar = !0, be = this, this.#_();
    } finally {
      ua = 0, Br = null, Tn = null, lr = null, Ar = !1, be = null, It = null, vn.clear();
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
    for (let b = Mr; b !== null; b = b.#e) {
      var t = b.id < this.id, n = [];
      for (const [p, [h, v]] of this.current) {
        if (b.current.has(p)) {
          var r = (
            /** @type {[any, boolean]} */
            b.current.get(p)[0]
          );
          if (t && h !== r)
            b.current.set(p, [h, v]);
          else
            continue;
        }
        n.push(p);
      }
      if (t)
        for (const [p, h] of this.async_deriveds) {
          const v = b.async_deriveds.get(p);
          v && h.promise.then(v.resolve).catch(v.reject);
        }
      var s = [...b.current.keys()].filter(
        (p) => !/** @type {[any, boolean]} */
        b.current.get(p)[1]
      );
      if (!(!b.#t || s.length === 0)) {
        var i = s.filter((p) => !this.current.has(p));
        if (i.length === 0)
          t && b.discard();
        else if (n.length > 0) {
          if (t)
            for (const p of this.#g)
              b.unskip_effect(p, (h) => {
                (h.f & (Ot | Rn)) !== 0 ? b.schedule(h) : b.#h([h]);
              });
          b.activate();
          var l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (var o of n)
            Ga(o, i, l, u);
          u = /* @__PURE__ */ new Map();
          var d = [...b.current].filter(([p, h]) => {
            const v = this.current.get(p);
            return v ? v[0] !== h[0] || v[1] !== h[1] : !0;
          }).map(([p]) => p);
          if (d.length > 0)
            for (const p of this.#p)
              (p.f & (vt | nt | cr)) === 0 && Zr(p, d, u) && ((p.f & (Rn | Ot)) !== 0 ? (Ae(p, De), b.schedule(p)) : b.#u.add(p));
          if (b.#a.length > 0 && !b.#d) {
            b.apply();
            for (var _ of b.#a)
              b.#y(_, [], []);
            b.#a = [];
          }
          b.deactivate();
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
    if (be === null) {
      const t = be = new an();
      Ar || Gt(() => {
        t.#t || t.flush();
      });
    }
    return be;
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
      if (Tn !== null && n === le && (oe === null || (oe.f & qe) === 0))
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
  be.schedule(e);
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
function S(e, t, n = !1) {
  oe !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ft || (oe.f & cr) !== 0) && za() && (oe.f & (qe | Ot | Rn | cr)) !== 0 && (Ht === null || !Ht.has(e)) && Ys();
  let r = n ? Oe(t) : t;
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
    e.wv = us(), Xa(e, De, n), le !== null && (le.f & ze) !== 0 && (le.f & (kt | Yt)) === 0 && (mt === null ? Di([e]) : mt.push(e)), !r.is_fork && hr.size > 0 && !Va && Ti();
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
  return S(e, n), r;
}
function Jn(e) {
  S(e, e.v + 1);
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
        It?.delete(d), (u & _n) === 0 && (u & xt && (le === null || (le.f & dr) === 0) && (l.f |= _n), Xa(d, Lt, n));
      } else if (o) {
        var _ = (
          /** @type {Effect} */
          l
        );
        (u & Ot) !== 0 && Ut !== null && Ut.add(_), n !== null ? n.push(_) : Qr(_);
      }
    }
}
function Oe(e) {
  if (typeof e != "object" || e === null || hn in e)
    return e;
  const t = Pa(e);
  if (t !== Rs && t !== Ps)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Xr(e), s = /* @__PURE__ */ W(0), i = gn, l = (u) => {
    if (gn === i)
      return u();
    var o = oe, d = gn;
    St(null), ha(i);
    var _ = u();
    return St(o), ha(d), _;
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
        var _ = n.get(o);
        return _ === void 0 ? l(() => {
          var b = /* @__PURE__ */ W(d.value);
          return n.set(o, b), b;
        }) : S(_, d.value, !0), !0;
      },
      deleteProperty(u, o) {
        var d = n.get(o);
        if (d === void 0) {
          if (o in u) {
            const _ = l(() => /* @__PURE__ */ W(Le));
            n.set(o, _), Jn(s);
          }
        } else
          S(d, Le), Jn(s);
        return !0;
      },
      get(u, o, d) {
        if (o === hn)
          return e;
        var _ = n.get(o), b = o in u;
        if (_ === void 0 && (!b || An(u, o)?.writable) && (_ = l(() => {
          var h = Oe(b ? u[o] : Le), v = /* @__PURE__ */ W(h);
          return v;
        }), n.set(o, _)), _ !== void 0) {
          var p = a(_);
          return p === Le ? void 0 : p;
        }
        return Reflect.get(u, o, d);
      },
      getOwnPropertyDescriptor(u, o) {
        var d = Reflect.getOwnPropertyDescriptor(u, o);
        if (d && "value" in d) {
          var _ = n.get(o);
          _ && (d.value = a(_));
        } else if (d === void 0) {
          var b = n.get(o), p = b?.v;
          if (b !== void 0 && p !== Le)
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
        var d = n.get(o), _ = d !== void 0 && d.v !== Le || Reflect.has(u, o);
        if (d !== void 0 || le !== null && (!_ || An(u, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var p = _ ? Oe(u[o]) : Le, h = /* @__PURE__ */ W(p);
            return h;
          }), n.set(o, d));
          var b = a(d);
          if (b === Le)
            return !1;
        }
        return _;
      },
      set(u, o, d, _) {
        var b = n.get(o), p = o in u;
        if (r && o === "length")
          for (var h = d; h < /** @type {Source<number>} */
          b.v; h += 1) {
            var v = n.get(h + "");
            v !== void 0 ? S(v, Le) : h in u && (v = l(() => /* @__PURE__ */ W(Le)), n.set(h + "", v));
          }
        if (b === void 0)
          (!p || An(u, o)?.writable) && (b = l(() => /* @__PURE__ */ W(void 0)), S(b, Oe(d)), n.set(o, b));
        else {
          p = b.v !== Le;
          var w = l(() => Oe(d));
          S(b, w);
        }
        var c = Reflect.getOwnPropertyDescriptor(u, o);
        if (c?.set && c.set.call(_, d), !p) {
          if (r && typeof o == "string") {
            var g = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= g.v && S(g, y + 1);
          }
          Jn(s);
        }
        return !0;
      },
      ownKeys(u) {
        a(s);
        var o = Reflect.ownKeys(u).filter((b) => {
          var p = n.get(b);
          return p === void 0 || p.v !== Le;
        });
        for (var [d, _] of n)
          _.v !== Le && !(d in u) && o.push(d);
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
function m(e, t = 1, n = !1) {
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
  le === null && (oe === null && Bs(), qs()), Vt && Hs();
}
function Oi(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Xt(e, t) {
  var n = le;
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
  be?.register_created_effect(r);
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
  if (s !== null && (s.parent = n, n !== null && Oi(s, n), oe !== null && (oe.f & qe) !== 0 && (e & Yt) === 0)) {
    var i = (
      /** @type {Derived} */
      oe
    );
    (i.effects ??= []).push(s);
  }
  return r;
}
function ea() {
  return oe !== null && !Ft;
}
function xr(e) {
  const t = Xt(yr, null);
  return Ae(t, ze), t.teardown = e, t;
}
function sn(e) {
  Ni();
  var t = (
    /** @type {Effect} */
    le.f
  ), n = !oe && (t & kt) !== 0 && Ze !== null && !Ze.i;
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
function B(e, t = [], n = [], r = []) {
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
    const n = Vt, r = oe;
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
let oe = null, Ft = !1;
function St(e) {
  oe = e;
}
let le = null;
function qt(e) {
  le = e;
}
let Ht = null;
function ls(e) {
  oe !== null && (Ht ??= /* @__PURE__ */ new Set()).add(e);
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
  var t = lt, n = ht, r = mt, s = oe, i = Ht, l = Ze, u = Ft, o = gn, d = e.f;
  lt = /** @type {null | Value[]} */
  null, ht = 0, mt = null, oe = (d & (kt | Yt)) === 0 ? e : null, Ht = null, On(e.ctx), Ft = !1, gn = ++dn, e.ac !== null && (jn(() => {
    e.ac.abort(er);
  }), e.ac = null);
  try {
    e.f |= dr;
    var _ = (
      /** @type {Function} */
      e.fn
    ), b = _();
    e.f |= zn;
    var p = e.deps, h = be?.is_fork;
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
        for (let w = 0; w < n; w += 1)
          s.deps[w].rv = dn;
      if (t !== null)
        for (const w of t)
          w.rv = dn;
      mt !== null && (r === null ? r = mt : r.push(.../** @type {Source[]} */
      mt));
    }
    return (e.f & rn) !== 0 && (e.f ^= rn), b;
  } catch (w) {
    return Da(w);
  } finally {
    e.f ^= dr, lt = t, ht = n, mt = r, oe = s, Ht = i, On(l), Ft = u, gn = o;
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
    var n = le, r = or;
    le = e, or = (t & (kt | Yt)) === 0;
    try {
      (t & (Ot | Na)) !== 0 ? Li(e) : na(e), rs(e);
      var s = ds(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = os;
      var i;
    } finally {
      or = r, le = n;
    }
  }
}
function a(e) {
  var t = e.f, n = (t & qe) !== 0;
  if (oe !== null && !Ft) {
    var r = le !== null && (le.f & vt) !== 0;
    if (!r && (Ht === null || !Ht.has(e))) {
      var s = oe.deps;
      if ((oe.f & dr) !== 0)
        e.rv < dn && (e.rv = dn, lt === null && s !== null && s[ht] === e ? ht++ : lt === null ? lt = [e] : lt.push(e));
      else {
        oe.deps ??= [], ur.call(oe.deps, e) || oe.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [oe] : ur.call(i, oe) || i.push(oe);
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
    var o = (l.f & xt) === 0 && !Ft && oe !== null && (or || (oe.f & xt) !== 0), d = (l.f & zn) === 0;
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
function ee(e, t, n) {
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
    var _ = oe, b = le;
    St(null), qt(null);
    try {
      for (var p, h = []; i !== null && i !== t; ) {
        try {
          var v = i[Yn]?.[r];
          v != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && v.call(i, e);
        } catch (w) {
          p ? h.push(w) : p = w;
        }
        if (e.cancelBubble) break;
        l++, i = l < s.length ? (
          /** @type {Element} */
          s[l]
        ) : null;
      }
      if (p) {
        for (let w of h)
          queueMicrotask(() => {
            throw w;
          });
        throw p;
      }
    } finally {
      e[Yn] = t, delete e.currentTarget, St(_), qt(b);
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
    le
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
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
function P(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function R(e, t) {
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
    var _ = n ?? t.appendChild(Wt());
    gi(
      /** @type {TemplateNode} */
      _,
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
    var b = /* @__PURE__ */ new Set(), p = (h) => {
      for (var v = 0; v < h.length; v++) {
        var w = h[v];
        if (!b.has(w)) {
          b.add(w);
          var c = qi(w);
          for (const O of [t, document]) {
            var g = ar.get(O);
            g === void 0 && (g = /* @__PURE__ */ new Map(), ar.set(O, g));
            var y = g.get(w);
            y === void 0 ? (O.addEventListener(w, Ur, { passive: c }), g.set(w, 1)) : g.set(w, y + 1);
          }
        }
      }
    };
    return p(wr(vs)), $r.add(p), () => {
      for (var h of b)
        for (const c of [t, document]) {
          var v = (
            /** @type {Map<string, number>} */
            ar.get(c)
          ), w = (
            /** @type {number} */
            v.get(h)
          );
          --w == 0 ? (c.removeEventListener(h, Ur), v.delete(h), v.size === 0 && ar.delete(c)) : v.set(h, w);
        }
      $r.delete(p), _ !== n && _.parentNode?.removeChild(_);
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
      be
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
    let b = t[u];
    pn(
      b,
      () => {
        if (i) {
          if (i.pending.delete(b), i.done.add(b), i.pending.size === 0) {
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
      ), _ = (
        /** @type {Element} */
        d.parentNode
      );
      Pi(_), _.append(d), e.items.clear();
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
  var _ = null, b = /* @__PURE__ */ Ba(() => {
    var O = n();
    return (
      /** @type {V[]} */
      Xr(O) ? O : O == null ? [] : wr(O)
    );
  }), p, h = /* @__PURE__ */ new Map(), v = !0;
  function w(O) {
    (y.effect.f & vt) === 0 && (y.pending.delete(O), y.fallback = _, Ji(y, p, l, t, r), _ !== null && (p.length === 0 ? (_.f & jt) === 0 ? pr(_) : (_.f ^= jt, Vn(_, null, l)) : pn(_, () => {
      _ = null;
    })));
  }
  function c(O) {
    y.pending.delete(O);
  }
  var g = ta(() => {
    p = /** @type {V[]} */
    a(b);
    for (var O = p.length, F = /* @__PURE__ */ new Set(), A = (
      /** @type {Batch} */
      be
    ), L = Qa(), G = 0; G < O; G += 1) {
      var $ = p[G], j = r($, G), E = v ? null : u.get(j);
      E ? (E.v && In(E.v, $), E.i && In(E.i, G), L && A.unskip_effect(E.e)) : (E = Zi(
        u,
        v ? l : pa ??= Wt(),
        $,
        j,
        G,
        s,
        t,
        n
      ), v || (E.e.f |= jt), u.set(j, E)), F.add(j);
    }
    if (O === 0 && i && !_ && (v ? _ = wt(() => i(l)) : (_ = wt(() => i(pa ??= Wt())), _.f |= jt)), O > F.size && js(), !v)
      if (h.set(A, F), L) {
        for (const [T, C] of u)
          F.has(T) || A.skip_effect(C.e);
        A.oncommit(w), A.ondiscard(c);
      } else
        w(A);
    a(b);
  }), y = { effect: g, items: u, pending: h, outrogroups: null, fallback: _ };
  v = !1;
}
function Bn(e) {
  for (; e !== null && (e.f & kt) === 0; )
    e = e.next;
  return e;
}
function Ji(e, t, n, r, s) {
  var i = (r & Js) !== 0, l = t.length, u = e.items, o = Bn(e.effect.first), d, _ = null, b, p = [], h = [], v, w, c, g;
  if (i)
    for (g = 0; g < l; g += 1)
      v = t[g], w = s(v, g), c = /** @type {EachItem} */
      u.get(w).e, (c.f & jt) === 0 && (c.nodes?.a?.measure(), (b ??= /* @__PURE__ */ new Set()).add(c));
  for (g = 0; g < l; g += 1) {
    if (v = t[g], w = s(v, g), c = /** @type {EachItem} */
    u.get(w).e, e.outrogroups !== null)
      for (const E of e.outrogroups)
        E.pending.delete(c), E.done.delete(c);
    if ((c.f & nt) !== 0 && (pr(c), i && (c.nodes?.a?.unfix(), (b ??= /* @__PURE__ */ new Set()).delete(c))), (c.f & jt) !== 0)
      if (c.f ^= jt, c === o)
        Vn(c, null, n);
      else {
        var y = _ ? _.next : o;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), en(e, _, c), en(e, c, y), Vn(c, y, n), _ = c, p = [], h = [], o = Bn(_.next);
        continue;
      }
    if (c !== o) {
      if (d !== void 0 && d.has(c)) {
        if (p.length < h.length) {
          var O = h[0], F;
          _ = O.prev;
          var A = p[0], L = p[p.length - 1];
          for (F = 0; F < p.length; F += 1)
            Vn(p[F], O, n);
          for (F = 0; F < h.length; F += 1)
            d.delete(h[F]);
          en(e, A.prev, L.next), en(e, _, A), en(e, L, O), o = O, _ = L, g -= 1, p = [], h = [];
        } else
          d.delete(c), Vn(c, o, n), en(e, c.prev, c.next), en(e, c, _ === null ? e.effect.first : _.next), en(e, _, c), _ = c;
        continue;
      }
      for (p = [], h = []; o !== null && o !== c; )
        (d ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = Bn(o.next);
      if (o === null)
        continue;
    }
    (c.f & jt) === 0 && p.push(c), _ = c, o = Bn(c.next);
  }
  if (e.outrogroups !== null) {
    for (const E of e.outrogroups)
      E.pending.size === 0 && (Gr(e, wr(E.done)), e.outrogroups?.delete(E));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || d !== void 0) {
    var G = [];
    if (d !== void 0)
      for (c of d)
        (c.f & nt) === 0 && G.push(c);
    for (; o !== null; )
      (o.f & nt) === 0 && o !== e.fallback && G.push(o), o = Bn(o.next);
    var $ = G.length;
    if ($ > 0) {
      var j = (r & Ia) !== 0 && l === 0 ? n : null;
      if (i) {
        for (g = 0; g < $; g += 1)
          G[g].nodes?.a?.measure();
        for (g = 0; g < $; g += 1)
          G[g].nodes?.a?.fix();
      }
      Ki(e, G, j);
    }
  }
  i && Gt(() => {
    if (b !== void 0)
      for (c of b)
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
function se(e, t, n, r) {
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
    le
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
      }, _ = o.teardown;
      o.teardown = () => {
        d(), _?.();
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
  ), _ = () => l && s ? (d ??= /* @__PURE__ */ Zn(
    /** @type {() => V} */
    r
  ), a(d)) : (o && (o = !1, u = l ? wn(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), u);
  let b;
  if (i) {
    var p = hn in e || Is in e;
    b = An(e, t)?.set ?? (p && t in e ? (F) => e[t] = F : void 0);
  }
  var h, v = !1;
  i ? [h, v] = fi(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && r !== void 0 && (h = _(), b && (Us(), b(h)));
  var w;
  if (w = () => {
    var F = (
      /** @type {V} */
      e[t]
    );
    return F === void 0 ? _() : (o = !0, F);
  }, (n & ei) === 0)
    return w;
  if (b) {
    var c = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(F, A) {
        return arguments.length > 0 ? ((!A || c || v) && b(A ? w() : F), F) : w();
      })
    );
  }
  var g = !1, y = ((n & Qs) !== 0 ? Zn : Ba)(() => (g = !1, w()));
  i && a(y);
  var O = (
    /** @type {Effect} */
    le
  );
  return (
    /** @type {() => V} */
    (function(F, A) {
      if (arguments.length > 0) {
        const L = A ? a(y) : i ? Oe(F) : F;
        return S(y, L), g = !0, u !== void 0 && (u = L), F;
      }
      return Vt && g || (O.f & vt) !== 0 ? y.v : a(y);
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
const Fe = {
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
var fl = /* @__PURE__ */ I('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), hl = /* @__PURE__ */ I('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), vl = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7">…</div>'), pl = /* @__PURE__ */ I('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), gl = /* @__PURE__ */ I('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), _l = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7"> </div>'), bl = /* @__PURE__ */ I('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function ml(e, t) {
  pt(t, !0);
  let n = re(t, "counts", 3, null), r = re(t, "files", 3, null), s = re(t, "filesAt", 3, null), i = re(t, "stale", 3, !1), l = re(t, "candidate", 3, null), u = re(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ne(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = bl(), _ = f(d);
  let b;
  var p = m(f(_), 2);
  {
    var h = (j) => {
      var E = hl(), T = ot(E), C = f(T), H = f(C), Y = m(C, 2), V = f(Y), U = m(Y, 4), Z = f(U), ue = m(U, 2), Q = f(ue), q = m(T, 2);
      {
        var N = (X) => {
          var k = fl(), x = m(f(k), 2), z = f(x), ae = m(x, 2), me = f(ae), de = m(ae, 4), fe = f(de), Se = m(de, 2), he = f(Se), Ne = m(Se, 2), We = f(Ne);
          B(
            (Ee, rt, ce, ie, Re) => {
              R(z, `kept ${Ee ?? ""}`), R(me, rt), R(fe, `excluded ${ce ?? ""}`), R(he, ie), R(We, `${a(o) >= 0 ? "+" : ""}${Re ?? ""} excluded`);
            },
            [
              () => Ce(n().candidate_kept_paths),
              () => Ct(n().candidate_kept_bytes),
              () => Ce(n().candidate_excluded_paths),
              () => Ct(n().candidate_excluded_bytes),
              () => Ce(a(o))
            ]
          ), P(X, k);
        };
        K(q, (X) => {
          l() && X(N);
        });
      }
      B(
        (X, k, x, z) => {
          R(H, `kept ${X ?? ""}`), R(V, k), R(Z, `excluded ${x ?? ""}`), R(Q, z);
        },
        [
          () => Ce(n().kept_paths),
          () => Ct(n().kept_bytes),
          () => Ce(n().excluded_paths),
          () => Ct(n().excluded_bytes)
        ]
      ), P(j, E);
    }, v = (j) => {
      var E = vl();
      P(j, E);
    };
    K(p, (j) => {
      n() ? j(h) : j(v, -1);
    });
  }
  var w = m(_, 2);
  let c;
  var g = f(w), y = m(f(g), 3), O = f(y), F = m(y, 2);
  {
    var A = (j) => {
      var E = pl();
      P(j, E);
    };
    K(F, (j) => {
      i() && r() && r() !== "loading" && j(A);
    });
  }
  var L = m(g, 2);
  {
    var G = (j) => {
      var E = gl(), T = ot(E);
      let C;
      var H = f(T), Y = f(H), V = m(H, 2), U = f(V), Z = m(V, 4), ue = f(Z), Q = m(Z, 2), q = f(Q), N = m(T, 2), X = f(N);
      B(
        (k, x, z, ae) => {
          C = xe(T, 1, "line svelte-1vgp6n7", null, C, { outdated: i() }), R(Y, `kept ${k ?? ""}`), R(U, x), R(ue, `excluded ${z ?? ""}`), R(q, ae), R(X, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Ce(r().kept_files),
          () => Ct(r().kept_bytes),
          () => Ce(r().excluded_files),
          () => Ct(r().excluded_bytes)
        ]
      ), P(j, E);
    }, $ = (j) => {
      var E = _l(), T = f(E);
      B(() => R(T, r() === "loading" ? "counting…" : "not counted yet")), P(j, E);
    };
    K(L, (j) => {
      r() && r() !== "loading" ? j(G) : j($, -1);
    });
  }
  B(() => {
    b = xe(_, 1, "block svelte-1vgp6n7", null, b, { busy: u() }), c = xe(w, 1, "block svelte-1vgp6n7", null, c, { busy: r() === "loading" }), y.disabled = r() === "loading", R(O, r() === "loading" ? "counting…" : "recount");
  }), ee("click", y, function(...j) {
    t.onfiles?.apply(this, j);
  }), P(e, d), gt();
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
  const r = je(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), u = s - l, o = i - l, d = 8, _ = [];
  for (let h = 0; h <= d; h++) {
    const v = h / d * (Math.PI / 2);
    _.push([l * Math.cos(v) ** (2 / r), l * Math.sin(v) ** (2 / r)]);
  }
  const b = [], p = (h, v, w, c) => {
    let g = Math.atan2(h, -v);
    g < 0 && (g += Math.PI * 2);
    let y = Math.atan2(c, w);
    y < 0 && (y += Math.PI * 2);
    const O = Me(Ea(y, n), 3);
    b.push(`rgba(255, 255, 255, ${O}) ${Me(g / (Math.PI * 2) * 100, 2)}%`);
  };
  p(0, -i, 0, 1);
  for (const [h, v, w] of El)
    for (let c = 0; c <= d; c++) {
      const [g, y] = _[w ? d - c : c];
      p(h * (u + g), v * (o + y), h * g ** (r - 1), -v * y ** (r - 1));
    }
  return b.push(`rgba(255, 255, 255, ${Me(Ea(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${b.join(", ")})`;
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
  const l = Math.abs(e) - n + s, u = Math.abs(t) - r + s, o = Math.max(l, 0), d = Math.max(u, 0), _ = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + _ - s;
}
function Al(e, t, n) {
  const r = e / 2, s = t / 2, i = je(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (p, h) => Ml(p - r, h - s, r, s, l, i), _ = 256, b = new Float32Array(_ + 1);
  for (let p = 0; p <= _; p++) {
    const h = 1 - p / _, v = Math.asin(je(h * h, 0, 1)), w = Math.asin(je(Math.sin(v) / o, 0, 1));
    b[p] = Math.tan(v - w) * u;
  }
  return (p, h) => {
    const v = -d(p, h);
    if (v < 0 || v >= u) return null;
    const w = b[Math.round(v / u * _)];
    if (w === 0) return null;
    const c = 0.75, g = d(p + c, h) - d(p - c, h), y = d(p, h + c) - d(p, h - c), O = Math.hypot(g, y);
    if (O === 0) return null;
    const F = -w / O;
    return { dx: g * F, dy: y * F };
  };
}
function Rl(e, t, n) {
  const r = document.createElement("canvas");
  r.width = e, r.height = t;
  const s = r.getContext("2d"), i = s.createImageData(e, t), l = i.data, u = e * t, o = new Float32Array(u), d = new Float32Array(u);
  let _ = 0;
  for (let p = 0; p < t; p++)
    for (let h = 0; h < e; h++) {
      const v = n(h + 0.5, p + 0.5);
      if (!v) continue;
      const w = p * e + h;
      o[w] = v.dx, d[w] = v.dy;
      const c = Math.hypot(v.dx, v.dy);
      c > _ && (_ = c);
    }
  const b = _ > 0 ? 127 / _ : 0;
  for (let p = 0; p < u; p++) {
    const h = p * 4;
    l[h] = 128 + je(Math.round(o[p] * b), -127, 127), l[h + 1] = 128 + je(Math.round(d[p] * b), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: r.toDataURL(), scale: _ * 2 };
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
  function _() {
    e.style.setProperty("--glass-pre", Nt.blurEdge ? "" : d), e.style.setProperty("--glass-post", Nt.blurEdge ? d : "");
  }
  function b() {
    r < 2 || s < 2 || e.style.setProperty("--glass-glare", Tl(r, s, Nt));
  }
  function p() {
    if (r < 2 || s < 2) return;
    const c = Nt, g = Rl(r, s, Al(r, s, c)), y = c.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(r)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${r}" height="${s}" preserveAspectRatio="none" href="${g.url}" result="map"/>` + Or(g.scale * (1 + y), Nr[0], "r") + Or(g.scale, Nr[1], "g") + Or(g.scale * (1 - y), Nr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, _(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", _()), o = u.map((O) => Nt[O]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, p();
    }));
  }
  const v = new ResizeObserver(([c]) => {
    const g = c.borderBoxSize?.[0], y = g ? { w: Math.round(g.inlineSize), h: Math.round(g.blockSize) } : { w: Math.round(c.contentRect.width), h: Math.round(c.contentRect.height) };
    y.w === r && y.h === s || (r = y.w, s = y.h, b(), h());
  });
  v.observe(e);
  const w = xl(() => {
    b(), u.map((c) => Nt[c]).join(" ") !== o ? h() : _();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), v.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
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
var Fl = /* @__PURE__ */ I('<span class="spin svelte-zne36e" aria-label="loading"></span>'), Ta = /* @__PURE__ */ I('<span class="badge svelte-zne36e"> </span>'), Ll = /* @__PURE__ */ I('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), zl = /* @__PURE__ */ I('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), Dl = /* @__PURE__ */ I("<button> </button>"), jl = /* @__PURE__ */ I('<div class="glass sheet sorts svelte-zne36e"></div>'), Hl = /* @__PURE__ */ I(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), ql = /* @__PURE__ */ I('<p class="muted svelte-zne36e">loading…</p>'), Bl = /* @__PURE__ */ I('<span class="help svelte-zne36e">?</span>'), $l = /* @__PURE__ */ I('<span class="n svelte-zne36e"> </span>'), Ul = /* @__PURE__ */ I("<button> <!></button>"), Gl = /* @__PURE__ */ I('<span class="muted svelte-zne36e">nothing here</span>'), Wl = /* @__PURE__ */ I('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Yl = /* @__PURE__ */ I('<div class="glass sheet filters svelte-zne36e"><!></div>'), Vl = /* @__PURE__ */ I('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function Xl(e, t) {
  pt(t, !0);
  let n = re(t, "facets", 3, null), r = re(t, "selected", 19, () => ({})), s = re(t, "sort", 3, "newest"), i = re(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = re(t, "total", 3, null), u = re(t, "tiles", 3, null), o = re(t, "loading", 3, !1), d = re(t, "onselect", 3, () => {
  }), _ = re(t, "onsort", 3, () => {
  }), b = re(t, "onstack", 3, () => {
  }), p = re(t, "onclear", 3, () => {
  }), h = re(t, "ontriage", 3, () => {
  }), v = /* @__PURE__ */ W(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), w = /* @__PURE__ */ W(Oe(xs())), c = /* @__PURE__ */ W(null);
  const g = /* @__PURE__ */ ne(() => u() ?? l()), y = /* @__PURE__ */ ne(() => n()?.dimensions ?? []), O = /* @__PURE__ */ ne(() => n()?.sorts ?? []), F = /* @__PURE__ */ ne(() => a(O).find((D) => D.value === s())?.label ?? s()), A = /* @__PURE__ */ ne(() => Object.values(r()).reduce((D, te) => D + te.length, 0)), L = /* @__PURE__ */ ne(() => a(y).flatMap((D) => (r()[D.name] ?? []).map((te) => ({
    dimension: D.name,
    value: te,
    title: D.title,
    label: D.options.find((pe) => pe.value === te)?.label ?? String(te)
  }))));
  function G(D, te) {
    const pe = r()[D] ?? [], Te = pe.includes(te) ? pe.filter((we) => we !== te) : [...pe, te];
    d()(D, Te);
  }
  function $(D, te) {
    return (r()[D] ?? []).includes(te);
  }
  function j() {
    S(w, ks(a(w) === "dark" ? "light" : "dark"), !0);
  }
  let E = /* @__PURE__ */ W(null);
  const T = /* @__PURE__ */ ne(() => a(E) ?? i().window);
  function C(D) {
    S(E, Number(D), !0);
  }
  function H(D) {
    S(E, null), b()({ ...i(), window: Number(D) });
  }
  sn(() => {
    a(v) !== "stacks" && S(E, null);
  });
  function Y(D) {
    D.key === "Escape" && S(v, "");
  }
  function V(D) {
    a(v) && !D.target.closest(".topbar") && S(v, "");
  }
  Hn(() => {
    const D = new ResizeObserver(([te]) => {
      const pe = Math.round(te.borderBoxSize?.[0]?.blockSize ?? te.contentRect.height);
      document.documentElement.style.setProperty("--header-h", pe + "px");
    });
    return D.observe(a(c)), () => {
      D.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var U = Vl();
  Pn("keydown", mn, Y), Pn("pointerdown", mn, V);
  var Z = f(U), ue = f(Z), Q = f(ue), q = m(ue, 2), N = f(q), X = m(q, 2);
  {
    var k = (D) => {
      var te = Fl();
      P(D, te);
    };
    K(X, (D) => {
      o() && D(k);
    });
  }
  $n(Z, (D) => Gn?.(D));
  var x = m(Z, 2), z = f(x), ae = f(z), me = f(ae);
  let de;
  var fe = f(me), Se = m(me, 2);
  let he;
  var Ne = m(f(Se));
  {
    var We = (D) => {
      var te = Ta(), pe = f(te);
      B(() => R(pe, a(A))), P(D, te);
    };
    K(Ne, (D) => {
      a(A) && D(We);
    });
  }
  var Ee = m(Se, 2);
  let rt;
  var ce = m(f(Ee));
  {
    var ie = (D) => {
      var te = Ta(), pe = f(te);
      B((Te) => R(pe, Te), [() => Ce(l())]), P(D, te);
    };
    K(ce, (D) => {
      i().on && l() !== null && D(ie);
    });
  }
  var Re = m(Ee, 2);
  {
    var Pe = (D) => {
      var te = zl(), pe = f(te);
      Ge(pe, 17, () => a(L), (we) => we.dimension + " " + we.value, (we, ve) => {
        var ye = Ll(), Ye = f(ye), at = f(Ye), ge = m(Ye, 1, !0);
        B(() => {
          se(ye, "title", `${a(ve).title ?? ""}: ${a(ve).label ?? ""} — click to remove`), R(at, a(ve).title), R(ge, a(ve).label);
        }), ee("click", ye, () => G(a(ve).dimension, a(ve).value)), P(we, ye);
      });
      var Te = m(pe, 2);
      ee("click", Te, () => p()()), P(D, te);
    };
    K(Re, (D) => {
      a(L).length && D(Pe);
    });
  }
  var Ie = m(ae, 2), Qe = f(Ie), ct = m(Ie, 2);
  $n(z, (D) => Gn?.(D));
  var Et = m(z, 2);
  {
    var Dt = (D) => {
      var te = jl();
      Ge(te, 21, () => a(O), yt, (pe, Te) => {
        var we = Dl();
        let ve;
        var ye = f(we);
        B(() => {
          ve = xe(we, 1, "option svelte-zne36e", null, ve, { on: a(Te).value === s() }), R(ye, a(Te).label);
        }), ee("click", we, () => {
          _()(a(Te).value), S(v, "");
        }), P(pe, we);
      }), $n(te, (pe) => Gn?.(pe)), P(D, te);
    };
    K(Et, (D) => {
      a(v) === "sort" && D(Dt);
    });
  }
  var Bt = m(Et, 2);
  {
    var _t = (D) => {
      var te = Hl(), pe = f(te), Te = m(f(pe), 2), we = f(Te);
      let ve;
      var ye = f(we), Ye = m(pe, 2), at = m(f(Ye), 2), ge = f(at), He = m(ge, 2), Mt = f(He);
      $n(te, (Be) => Gn?.(Be)), B(() => {
        ve = xe(we, 1, "option svelte-zne36e", null, ve, { on: i().on }), se(we, "aria-checked", i().on), R(ye, i().on ? "On" : "Off"), se(ge, "min", bs), se(ge, "max", ms), un(ge, a(T)), se(ge, "aria-valuetext", `${a(T) ?? ""} seconds`), R(Mt, `${a(T) ?? ""}s`);
      }), ee("click", we, () => b()({ ...i(), on: !i().on })), ee("input", ge, (Be) => C(Be.currentTarget.value)), ee("change", ge, (Be) => H(Be.currentTarget.value)), P(D, te);
    };
    K(Bt, (D) => {
      a(v) === "stacks" && D(_t);
    });
  }
  var et = m(Bt, 2);
  {
    var Tt = (D) => {
      var te = Yl(), pe = f(te);
      {
        var Te = (ve) => {
          var ye = ql();
          P(ve, ye);
        }, we = (ve) => {
          var ye = aa(), Ye = ot(ye);
          Ge(Ye, 17, () => a(y), yt, (at, ge) => {
            var He = Wl(), Mt = f(He), Be = f(Mt), M = m(Be);
            {
              var J = (Ve) => {
                var Ue = Bl();
                B(() => se(Ue, "title", a(ge).hint)), P(Ve, Ue);
              };
              K(M, (Ve) => {
                a(ge).hint && Ve(J);
              });
            }
            var _e = m(Mt, 2), $e = f(_e);
            Ge($e, 17, () => a(ge).options, yt, (Ve, Ue) => {
              var Xe = Ul();
              let ln;
              var on = f(Xe), Ke = m(on);
              {
                var ft = (st) => {
                  var Rt = $l(), Kt = f(Rt);
                  B((Jt) => R(Kt, Jt), [() => Ce(a(Ue).count)]), P(st, Rt);
                };
                K(Ke, (st) => {
                  a(Ue).count !== null && st(ft);
                });
              }
              B(
                (st) => {
                  ln = xe(Xe, 1, "option svelte-zne36e", null, ln, st), R(on, `${a(Ue).label ?? ""} `);
                },
                [
                  () => ({ on: $(a(ge).name, a(Ue).value) })
                ]
              ), ee("click", Xe, () => G(a(ge).name, a(Ue).value)), P(Ve, Xe);
            });
            var dt = m($e, 2);
            {
              var At = (Ve) => {
                var Ue = Gl();
                P(Ve, Ue);
              };
              K(dt, (Ve) => {
                a(ge).options.length || Ve(At);
              });
            }
            B(() => R(Be, `${a(ge).title ?? ""} `)), P(at, He);
          }), P(ve, ye);
        };
        K(pe, (ve) => {
          n() ? ve(we, -1) : ve(Te);
        });
      }
      $n(te, (ve) => Gn?.(ve)), P(D, te);
    };
    K(et, (D) => {
      a(v) === "filters" && D(Tt);
    });
  }
  _r(U, (D) => S(c, D), () => a(c)), B(
    (D) => {
      R(Q, D), R(N, a(g) === 1 ? "photo" : "photos"), de = xe(me, 1, "menu svelte-zne36e", null, de, { open: a(v) === "sort" }), se(me, "aria-expanded", a(v) === "sort"), R(fe, a(F)), he = xe(Se, 1, "menu svelte-zne36e", null, he, { open: a(v) === "filters", on: a(A) > 0 }), se(Se, "aria-expanded", a(v) === "filters"), rt = xe(Ee, 1, "menu svelte-zne36e", null, rt, { open: a(v) === "stacks", on: i().on }), se(Ee, "aria-expanded", a(v) === "stacks"), se(Ie, "title", a(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), se(Ie, "aria-label", a(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), R(Qe, a(w) === "dark" ? "☀" : "☾");
    },
    [() => a(g) === null ? "…" : Ce(a(g))]
  ), ee("click", me, () => S(v, a(v) === "sort" ? "" : "sort", !0)), ee("click", Se, () => S(v, a(v) === "filters" ? "" : "filters", !0)), ee("click", Ee, () => S(v, a(v) === "stacks" ? "" : "stacks", !0)), ee("click", Ie, j), ee("click", ct, () => h()()), P(e, U), gt();
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
var Ql = /* @__PURE__ */ I('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), eo = /* @__PURE__ */ I('<div class="glass pane svelte-5g1i2z" role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div></div>');
function to(e, t) {
  pt(t, !0);
  let n = re(t, "frames", 19, () => []), r = re(t, "origin", 3, null), s = re(t, "onreveal", 3, () => {
  }), i = re(t, "onclose", 3, () => {
  });
  const l = 40, u = /* @__PURE__ */ ne(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let o = /* @__PURE__ */ W(0), d = /* @__PURE__ */ W(0), _ = /* @__PURE__ */ W(null), b = /* @__PURE__ */ W(Oe(/* @__PURE__ */ new Set()));
  const p = 4, h = 25, v = { x: 0, y: 0, w: 0, h: 0 }, w = /* @__PURE__ */ ne(() => Math.max(0, a(o) - l * 2)), c = /* @__PURE__ */ ne(() => Math.max(0, a(d) - l * 2)), g = /* @__PURE__ */ ne(() => a(w) > 0 && a(c) > 0 ? A(n(), a(w), a(c)) : n().map(() => v));
  function y(T, C, H) {
    const Y = [];
    let V = 0, U = 0;
    for (let Z = 0; Z < T.length; Z++)
      U += mr(T[Z]), U * H + Pt * (Z - V) >= C && (Y.push({ from: V, to: Z + 1, sum: U }), V = Z + 1, U = 0);
    return V < T.length && Y.push({ from: V, to: T.length, sum: U }), Y;
  }
  function O(T, C, H) {
    return T.map((Y, V) => {
      const U = (C - Pt * (Y.to - Y.from - 1)) / Y.sum;
      return V === T.length - 1 && U > H ? H : U;
    });
  }
  function F(T, C, H) {
    return O(T, C, H).reduce((Y, V) => Y + V, 0) + Pt * (T.length - 1);
  }
  function A(T, C, H) {
    let Y = p, V = Math.max(p, H);
    for (let q = 0; q < h; q++) {
      const N = (Y + V) / 2;
      F(y(T, C, N), C, N) <= H ? Y = N : V = N;
    }
    const U = y(T, C, Y), Z = O(U, C, Y), ue = [];
    let Q = (H - (Z.reduce((q, N) => q + N, 0) + Pt * (U.length - 1))) / 2;
    return U.forEach((q, N) => {
      const X = Z[N], k = [];
      for (let ae = q.from; ae < q.to; ae++) k.push(mr(T[ae]) * X);
      const x = k.reduce((ae, me) => ae + me, 0) + Pt * (k.length - 1);
      let z = (C - x) / 2;
      for (const ae of k)
        ue.push({
          x: Math.round(z),
          y: Math.round(Q),
          w: Math.round(ae),
          h: Math.round(X)
        }), z += ae + Pt;
      Q += X + Pt;
    }), ue;
  }
  function L(T) {
    if (!r() || !T || !T.w || !T.h) return "none";
    const C = r().left - (l + T.x), H = r().top - (l + T.y);
    return `translate(${C}px, ${H}px) scale(${r().width / T.w}, ${r().height / T.h})`;
  }
  function G(T) {
    T.key === "Escape" && i()();
  }
  function $(T) {
    T.target.closest(".frame") || i()();
  }
  Hn(() => {
    const T = document.activeElement;
    return a(_)?.focus(), () => {
      T instanceof HTMLElement && document.contains(T) && T.focus();
    };
  });
  var j = eo();
  Pn("keydown", mn, G), Pn("pointerdown", mn, $);
  var E = f(j);
  fn(E, "", {}, { inset: "40px" }), Ge(E, 23, n, (T) => T.id, (T, C, H) => {
    var Y = Ql();
    let V;
    var U = f(Y);
    let Z;
    B(
      (ue, Q) => {
        V = fn(Y, "", V, ue), se(U, "src", `/d/${a(C).s ?? ""}.webp`), Z = xe(U, 1, "svelte-5g1i2z", null, Z, Q);
      },
      [
        () => ({
          left: `${a(g)[a(H)].x ?? ""}px`,
          top: `${a(g)[a(H)].y ?? ""}px`,
          width: `${a(g)[a(H)].w ?? ""}px`,
          height: `${a(g)[a(H)].h ?? ""}px`,
          "--flight": L(a(g)[a(H)])
        }),
        () => ({ loaded: a(b).has(a(C).id) })
      ]
    ), ee("click", Y, () => s()(a(C))), Pn("load", U, () => S(b, new Set(a(b)).add(a(C).id), !0)), P(T, Y);
  }), _r(j, (T) => S(_, T), () => a(_)), B(() => se(j, "aria-label", a(u))), Wr("innerWidth", (T) => S(o, T, !0)), Wr("innerHeight", (T) => S(d, T, !0)), P(e, j), gt();
}
zt(["click"]);
var no = /* @__PURE__ */ I('<span class="err svelte-uzy12d"> </span>'), ro = /* @__PURE__ */ I(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), ao = /* @__PURE__ */ I(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), so = /* @__PURE__ */ I('<span class="muted svelte-uzy12d"> </span>'), io = /* @__PURE__ */ I('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function lo(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ W(null), r = /* @__PURE__ */ W(!1), s = /* @__PURE__ */ W(null);
  async function i() {
    S(r, !0), S(s, null);
    try {
      S(n, await Fe.probe(), !0);
    } catch (h) {
      S(s, String(h), !0);
    } finally {
      S(r, !1);
    }
  }
  var l = io(), u = f(l), o = f(u), d = m(u, 2);
  {
    var _ = (h) => {
      var v = no(), w = f(v);
      B(() => R(w, a(s))), P(h, v);
    }, b = (h) => {
      var v = aa(), w = ot(v);
      {
        var c = (y) => {
          var O = ro(), F = m(f(O), 2);
          B(
            (A) => R(F, ` above are formats the header
        reader cannot measure (${A ?? ""}) or files with no
        extension.`),
            [() => a(n).formats.join(" ")]
          ), P(y, O);
        }, g = (y) => {
          var O = ao(), F = f(O), A = f(F), L = m(F, 2), G = f(L);
          B(
            ($) => {
              R(A, $), R(G, a(n).command);
            },
            [() => Ce(a(n).worklist)]
          ), P(y, O);
        };
        K(w, (y) => {
          a(n).worklist === 0 ? y(c) : y(g, -1);
        });
      }
      P(h, v);
    }, p = (h) => {
      var v = so(), w = f(v);
      B(() => R(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), P(h, v);
    };
    K(d, (h) => {
      a(s) ? h(_) : a(n) ? h(b, 1) : h(p, -1);
    });
  }
  B(() => {
    u.disabled = a(r), R(o, a(r) ? "counting…" : "Check the dimension probe's worklist");
  }), ee("click", u, i), P(e, l), gt();
}
zt(["click"]);
var oo = /* @__PURE__ */ I('<p class="bad svelte-1xjbga"> </p>'), uo = /* @__PURE__ */ I('<pre class="svelte-1xjbga"> </pre>'), co = /* @__PURE__ */ I('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), fo = /* @__PURE__ */ I(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), ho = /* @__PURE__ */ I('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), vo = /* @__PURE__ */ I('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), po = /* @__PURE__ */ I(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), go = /* @__PURE__ */ I('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), _o = /* @__PURE__ */ I(
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
      const y = await Fe.rebuildStatus();
      S(n, y, !0), S(s, null), y.state === "done" && y.started_at !== a(i) && (S(i, y.started_at, !0), t.oncomplete?.());
    } catch (y) {
      S(s, String(y), !0);
    }
  }
  Hn(() => {
    o();
  }), sn(() => {
    if (!a(l)) return;
    const y = setInterval(o, 700);
    return () => clearInterval(y);
  });
  async function d() {
    S(r, !0), S(s, null);
    try {
      S(n, await Fe.rebuild(), !0);
    } catch (y) {
      S(s, String(y), !0);
    }
  }
  function _(y) {
    y.key === "Escape" && S(r, !1);
  }
  var b = _o();
  Pn("keydown", mn, _);
  var p = ot(b), h = f(p), v = f(h), w = m(h, 2), c = m(p, 2);
  {
    var g = (y) => {
      var O = go(), F = ot(O), A = m(F, 2), L = f(A), G = m(f(L), 4), $ = f(G), j = m(G, 2), E = m(L, 2);
      {
        var T = (Q) => {
          var q = oo(), N = f(q);
          B(() => R(N, a(s))), P(Q, q);
        };
        K(E, (Q) => {
          a(s) && Q(T);
        });
      }
      var C = m(E, 2);
      Ge(C, 17, () => a(n)?.steps ?? [], yt, (Q, q) => {
        var N = co();
        let X;
        var k = f(N), x = f(k), z = f(x);
        {
          var ae = (ce) => {
            var ie = Mn("✓");
            P(ce, ie);
          }, me = (ce) => {
            var ie = Mn("✕");
            P(ce, ie);
          }, de = (ce) => {
            var ie = Mn("·");
            P(ce, ie);
          }, fe = (ce) => {
            var ie = Mn(" ");
            P(ce, ie);
          };
          K(z, (ce) => {
            a(q).state === "done" ? ce(ae) : a(q).state === "failed" ? ce(me, 1) : a(q).state === "running" ? ce(de, 2) : ce(fe, -1);
          });
        }
        var Se = m(x, 2), he = f(Se), Ne = m(Se, 4), We = f(Ne), Ee = m(k, 2);
        {
          var rt = (ce) => {
            var ie = uo(), Re = f(ie);
            B((Pe) => R(Re, Pe), [() => a(q).log.join(`
`)]), P(ce, ie);
          };
          K(Ee, (ce) => {
            a(q).log.length && ce(rt);
          });
        }
        B(() => {
          X = xe(N, 1, "step svelte-1xjbga", null, X, {
            on: a(q).state === "running",
            bad: a(q).state === "failed"
          }), R(he, a(q).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), R(We, a(q).seconds === null ? "" : a(q).seconds + "s");
        }), P(Q, N);
      });
      var H = m(C, 2);
      {
        var Y = (Q) => {
          var q = fo(), N = ot(q), X = f(N);
          B(() => R(X, a(n).error)), P(Q, q);
        }, V = (Q) => {
          var q = ho();
          P(Q, q);
        }, U = (Q) => {
          var q = vo();
          P(Q, q);
        };
        K(H, (Q) => {
          a(n)?.state === "failed" ? Q(Y) : a(n)?.state === "done" ? Q(V, 1) : a(l) && Q(U, 2);
        });
      }
      var Z = m(H, 2);
      {
        var ue = (Q) => {
          var q = po(), N = m(f(q), 6), X = f(N);
          B(() => R(X, `python -m photolib.restore_state ${a(u) ?? ""}`)), P(Q, q);
        };
        K(Z, (Q) => {
          a(u) && Q(ue);
        });
      }
      B(() => R($, `${a(n)?.seconds ?? 0 ?? ""}s`)), ee("click", F, () => S(r, !1)), ee("click", j, () => S(r, !1)), P(y, O);
    };
    K(c, (y) => {
      a(r) && y(g);
    });
  }
  B(() => {
    h.disabled = a(l), R(v, a(l) ? "applying…" : "Apply to grid"), w.disabled = !a(n) || a(n).state === "idle";
  }), ee("click", h, d), ee("click", w, () => S(r, !0)), P(e, b), gt();
}
zt(["click"]);
var mo = /* @__PURE__ */ I('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), Aa = /* @__PURE__ */ I("<option> </option>"), wo = /* @__PURE__ */ I('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), yo = /* @__PURE__ */ I('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), xo = /* @__PURE__ */ I('<div class="none muted svelte-bqi9ky"> </div>'), ko = /* @__PURE__ */ I('<div class="bar svelte-bqi9ky"><!></div>');
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
  function d(w, c) {
    const g = { ...n(), [w]: c };
    if (w === "column") {
      const y = i[c] ?? ["="];
      y.includes(g.op) || (g.op = y[0]), g.value = l.has(c) ? 0 : "";
    }
    w === "op" && c === "is null" && (g.value = null), w === "value" && l.has(g.column) && (g.value = Number(c) || 0), t.onedit(g);
  }
  var _ = ko(), b = f(_);
  {
    var p = (w) => {
      var c = mo(), g = f(c), y = f(g), O = m(g, 2), F = f(O);
      B(() => {
        R(y, `${t.screen.title ?? ""} does not save a rule.`), R(F, t.screen.blurb);
      }), P(w, c);
    }, h = (w) => {
      var c = yo(), g = ot(c), y = f(g);
      Ge(y, 21, () => s, yt, (N, X) => {
        var k = Aa(), x = f(k), z = {};
        B(() => {
          R(x, a(X)), z !== (z = a(X)) && (k.value = (k.__value = a(X)) ?? "");
        }), P(N, k);
      });
      var O;
      sr(y);
      var F = m(y, 2);
      Ge(F, 21, () => a(u), yt, (N, X) => {
        var k = Aa(), x = f(k), z = {};
        B(() => {
          R(x, a(X)), z !== (z = a(X)) && (k.value = (k.__value = a(X)) ?? "");
        }), P(N, k);
      });
      var A;
      sr(F);
      var L = m(F, 2);
      {
        var G = (N) => {
          var X = wo();
          B(() => un(X, n().value ?? "")), ee("input", X, (k) => d("value", k.currentTarget.value)), P(N, X);
        };
        K(L, (N) => {
          a(o) && N(G);
        });
      }
      var $ = m(L, 2), j = f($);
      j.value = j.__value = "exclude";
      var E = m(j);
      E.value = E.__value = "include";
      var T;
      sr($);
      var C = m($, 2), H = f(C);
      H.value = H.__value = "end";
      var Y = m(H);
      Y.value = Y.__value = "0";
      var V;
      sr(C);
      var U = m(C, 2), Z = f(U), ue = m(U, 2), Q = m(g, 2), q = f(Q);
      B(
        (N, X) => {
          O !== (O = n().column) && (y.value = (y.__value = n().column) ?? "", Xn(y, n().column)), A !== (A = n().op) && (F.value = (F.__value = n().op) ?? "", Xn(F, n().op)), T !== (T = n().decision ?? "exclude") && ($.value = ($.__value = n().decision ?? "exclude") ?? "", Xn($, n().decision ?? "exclude")), V !== (V = N) && (C.value = (C.__value = N) ?? "", Xn(C, N)), U.disabled = r(), R(Z, r() ? "saving…" : "Confirm"), R(q, `${X ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => cl(n())
        ]
      ), ee("change", y, (N) => d("column", N.currentTarget.value)), ee("change", F, (N) => d("op", N.currentTarget.value)), ee("change", $, (N) => d("decision", N.currentTarget.value)), ee("change", C, (N) => d("at", N.currentTarget.value)), ee("click", U, function(...N) {
        t.onconfirm?.apply(this, N);
      }), ee("click", ue, function(...N) {
        t.onclear?.apply(this, N);
      }), P(w, c);
    }, v = (w) => {
      var c = xo(), g = f(c);
      B(() => R(g, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), P(w, c);
    };
    K(b, (w) => {
      t.screen.rule === !1 ? w(p) : n() ? w(h, 1) : w(v, -1);
    });
  }
  P(e, _), gt();
}
zt(["change", "input", "click"]);
var Eo = /* @__PURE__ */ I('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), To = /* @__PURE__ */ I('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), Mo = /* @__PURE__ */ I('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Ao = /* @__PURE__ */ I('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Ro(e, t) {
  pt(t, !0);
  let n = re(t, "rules", 19, () => []), r = re(t, "unmatched", 3, null), s = re(t, "busy", 3, !1);
  var i = Ao(), l = f(i), u = m(f(l)), o = f(u), d = m(l, 2);
  {
    var _ = (v) => {
      var w = Eo();
      P(v, w);
    };
    K(d, (v) => {
      n().length === 0 && v(_);
    });
  }
  var b = m(d, 2);
  Ge(b, 19, n, (v) => v.id, (v, w, c) => {
    var g = To();
    let y;
    var O = f(g), F = f(O), A = f(F), L = m(F, 2), G = f(L), $ = m(L, 2), j = f($), E = m(O, 2), T = f(E), C = f(T), H = m(T, 2), Y = f(H), V = m(H, 4), U = m(V, 2), Z = m(U, 2);
    B(
      (ue, Q) => {
        y = xe(g, 1, "rule svelte-aof9c2", null, y, { exclude: a(w).decision === "exclude" }), R(A, a(c)), R(G, a(w).predicate), R(j, a(w).decision), R(C, `${ue ?? ""} paths`), R(Y, Q), V.disabled = s() || a(c) === 0, U.disabled = s() || a(c) === n().length - 1, Z.disabled = s();
      },
      [
        () => Ce(a(w).paths),
        () => Ct(a(w).bytes)
      ]
    ), ee("click", V, () => t.onmove(a(w), a(c) - 1)), ee("click", U, () => t.onmove(a(w), a(c) + 1)), ee("click", Z, () => t.ondelete(a(w))), P(v, g);
  });
  var p = m(b, 2);
  {
    var h = (v) => {
      var w = Mo(), c = m(f(w), 2), g = f(c), y = f(g), O = m(g, 2), F = f(O);
      B(
        (A, L) => {
          R(y, `${A ?? ""} paths`), R(F, L);
        },
        [
          () => Ce(r().paths),
          () => Ct(r().bytes)
        ]
      ), P(v, w);
    };
    K(p, (v) => {
      r() && v(h);
    });
  }
  B(() => R(o, `${n().length ?? ""} rules · top-down, first match wins`)), P(e, i), gt();
}
zt(["click"]);
const Ra = 2500, Po = 1, Co = 2, No = 3e7, Fr = /* @__PURE__ */ new WeakMap();
function Oo(e, t, n) {
  const r = [], s = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, d = 0, _ = null, b = null, p = null, h = !1, v = !1, w = 0, c = 0, g = 0, y = n.onState || (() => {
  });
  function O(k) {
    w <= 0 || (o = Jl(r, o, w, k, (x, z, ae) => {
      s.push({ top: d, height: ae, from: x, to: z }), d += ae + Pt;
    }), A());
  }
  function F() {
    if (b === null || h || w <= 0 || o >= b) return 0;
    const k = s.length ? o / s.length : Math.max(1, w / br), x = s.length ? d / s.length : br + Pt, z = Math.round((b - o) / k * x);
    return Math.max(0, Math.min(z, No - d));
  }
  function A() {
    e.style.height = d + F() + "px", t.style.top = Math.max(0, d - 1) + "px";
  }
  function L() {
    return window.scrollY - e.offsetTop;
  }
  function G() {
    const k = l.pop();
    if (k) return k;
    const x = document.createElement("div");
    x.className = "tile";
    const z = document.createElement("img");
    return z.decoding = "async", z.addEventListener("load", () => x.classList.add("loaded")), z.addEventListener("error", () => x.classList.add("missing")), x.appendChild(z), Fr.set(x, z), n.extend && n.extend(x), x;
  }
  function $(k, x) {
    Fr.get(x).removeAttribute("src"), x.classList.remove("loaded", "missing", "error"), x.style.backgroundImage = "", x.remove(), i.delete(k), l.push(x);
  }
  function j(k, x, z, ae, me, de) {
    let fe = i.get(k);
    const Se = r[k];
    if (!fe) {
      fe = G(), fe.dataset.index = String(k);
      const he = Fr.get(fe);
      he.fetchPriority = de ? "high" : "low", he.src = "/t/" + Se.s + ".webp", u.push(k), n.fill && n.fill(fe, Se), e.appendChild(fe), i.set(k, fe);
    }
    fe.style.width = ae + "px", fe.style.height = me + "px", fe.style.transform = "translate(" + x + "px," + z + "px)";
  }
  function E(k, x) {
    x.th && (x.url === void 0 && (x.url = n.thumbHash(x.th)), x.url && (k.style.backgroundImage = "url(" + x.url + ")"));
  }
  function T() {
    g = 0;
    for (const k of u) {
      const x = i.get(k);
      x && !x.classList.contains("loaded") && E(x, r[k]);
    }
    u.length = 0;
  }
  function C(k, x) {
    for (const z of Zl(k, r, w))
      j(z.index, z.x, k.top, z.w, k.height, x);
  }
  function H() {
    const k = window.innerHeight, x = L(), z = Ma(s, x - k * Po, x + k * (1 + Co));
    if (!z) return;
    const ae = s[z[0]].from, me = s[z[1]].to;
    for (const [de, fe] of Array.from(i))
      (de < ae || de >= me) && $(de, fe);
    for (let de = z[0]; de <= z[1]; de++) {
      const fe = s[de];
      C(fe, fe.top < x + k && fe.top + fe.height > x);
    }
    u.length && !g && (g = requestAnimationFrame(T));
  }
  function Y() {
    return w <= 0 ? !1 : d - (L() + window.innerHeight) < Ra;
  }
  async function V() {
    if (v || h) return;
    v = !0;
    const k = c;
    y({ loading: !0, count: r.length, exhausted: h, total: b, tiles: p });
    try {
      do {
        const x = await n.fetchPage(_);
        if (k !== c) return;
        for (const z of x.photos) r.push(z);
        _ = x.next, h = _ === null, typeof x.stacks == "number" ? (b = x.stacks, p = typeof x.total == "number" ? x.total : null) : typeof x.total == "number" && (b = x.total), O(h), H(), y({ loading: !0, count: r.length, exhausted: h, total: b, tiles: p });
      } while (!h && Y());
    } catch (x) {
      k === c && y({ error: String(x) });
    } finally {
      k === c && (v = !1, y({ loading: !1, count: r.length, exhausted: h, total: b, tiles: p }));
    }
  }
  let U = 0;
  function Z() {
    U || (U = requestAnimationFrame(() => {
      U = 0, H(), Y() && V();
    }));
  }
  function ue() {
    const k = e.clientWidth;
    if (k === w) return;
    const x = Ma(s, L(), L()), z = x ? s[x[0]].from : 0;
    w = k;
    for (const [me, de] of Array.from(i)) $(me, de);
    s.length = 0, o = 0, d = 0, O(h), H();
    const ae = s.find((me) => me.to > z);
    ae && window.scrollTo(0, ae.top + e.offsetTop), Y() && V();
  }
  function Q(k) {
    const x = k.target.closest(".tile");
    if (!x || !e.contains(x)) return;
    const z = r[Number(x.dataset.index)];
    z && n.activate && n.activate(z, k, x);
  }
  e.addEventListener("click", Q), window.addEventListener("scroll", Z, { passive: !0 });
  let q = 0;
  const N = new ResizeObserver(() => {
    clearTimeout(q), q = setTimeout(ue, 100);
  });
  N.observe(e);
  const X = new IntersectionObserver(
    (k) => {
      k.some((x) => x.isIntersecting) && V();
    },
    { rootMargin: "0px 0px " + Ra + "px 0px" }
  );
  return X.observe(t), w = e.clientWidth, V(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      c++, v = !1;
      for (const [k, x] of Array.from(i)) $(k, x);
      r.length = 0, s.length = 0, u.length = 0, o = 0, d = 0, _ = null, b = null, p = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), V();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(k) {
      const x = typeof k == "number" ? k : null;
      x !== b && (b = x, A(), y({ total: b }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [k, x] of i) n.fill(x, r[k]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(k) {
      for (const [x, z] of i)
        r[x] === k && n.fill && n.fill(z, k);
    },
    destroy() {
      c++, e.removeEventListener("click", Q), window.removeEventListener("scroll", Z), N.disconnect(), X.disconnect(), clearTimeout(q), cancelAnimationFrame(g);
    }
  };
}
function Io(e) {
  try {
    const t = Uint8Array.from(atob(e), (C) => C.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, d = (r >> 3 & 63) / 63, _ = (r >> 9 & 63) / 63, b = r >> 15, p = Math.max(3, b ? o ? 5 : 7 : r & 7), h = Math.max(3, b ? r & 7 : o ? 5 : 7);
    let v = o ? 6 : 5, w = 0;
    const c = (C, H, Y) => {
      const V = [];
      for (let U = 0; U < H; U++)
        for (let Z = U ? 0 : 1; Z * H < C * (H - U); Z++) {
          const ue = t[v + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          V.push((ue / 7.5 - 1) * Y);
        }
      return V;
    }, g = c(p, h, u), y = c(3, 3, d * 1.25), O = c(3, 3, _ * 1.25), F = p / h, A = Math.max(1, Math.round(F > 1 ? 32 : 32 * F)), L = Math.max(1, Math.round(F > 1 ? 32 / F : 32)), G = document.createElement("canvas");
    G.width = A, G.height = L;
    const $ = G.getContext("2d"), j = $.createImageData(A, L), E = [], T = [];
    for (let C = 0, H = 0; C < L; C++)
      for (let Y = 0; Y < A; Y++, H += 4) {
        let V = s, U = i, Z = l;
        for (let N = 0; N < p; N++) E[N] = Math.cos(Math.PI / A * (Y + 0.5) * N);
        for (let N = 0; N < h; N++) T[N] = Math.cos(Math.PI / L * (C + 0.5) * N);
        for (let N = 0, X = 0; N < h; N++)
          for (let k = N ? 0 : 1; k * h < p * (h - N); k++, X++)
            V += g[X] * E[k] * T[N] * 2;
        for (let N = 0, X = 0; N < 3; N++)
          for (let k = N ? 0 : 1; k < 3 - N; k++, X++) {
            const x = E[k] * T[N] * 2;
            U += y[X] * x, Z += O[X] * x;
          }
        const ue = V - 2 / 3 * U, Q = (3 * V - ue + Z) / 2, q = Q - Z;
        j.data[H] = Math.max(0, Math.min(255, Math.round(255 * Q))), j.data[H + 1] = Math.max(0, Math.min(255, Math.round(255 * q))), j.data[H + 2] = Math.max(0, Math.min(255, Math.round(255 * ue))), j.data[H + 3] = 255;
      }
    return $.putImageData(j, 0, 0), G.toDataURL();
  } catch {
    return null;
  }
}
var Fo = /* @__PURE__ */ I('<main id="canvas"><div id="sentinel"></div></main>');
function Lo(e, t) {
  pt(t, !0);
  let n = re(t, "key", 3, ""), r = re(t, "total", 3, null), s = re(t, "triage", 3, !1), i = re(t, "excludedDirs", 19, () => []), l = re(t, "onActivate", 3, () => {
  }), u = re(t, "onOverride", 3, async () => null), o = re(t, "onExcludeFolder", 3, () => {
  }), d = re(t, "onState", 3, () => {
  }), _ = /* @__PURE__ */ W(null), b = /* @__PURE__ */ W(null), p = null, h = "";
  const v = { null: "exclude", exclude: "include", include: "clear" };
  function w(A) {
    const L = A.toLowerCase().startsWith(Ln.toLowerCase()) ? A.slice(Ln.length + 1) : A;
    return L.length > 64 ? "…" + L.slice(-64) : L;
  }
  function c(A) {
    const L = document.createElement("div");
    L.className = "tile-path", A.appendChild(L);
    const G = document.createElement("button");
    G.className = "chip", G.type = "button", A.appendChild(G);
    const $ = document.createElement("button");
    $.className = "dirchip", $.type = "button", $.textContent = "dir", A.appendChild($);
  }
  function g(A, L) {
    const G = A.querySelector(".tile-path");
    G && (G.textContent = L.p ? w(L.p) : "");
    const $ = A.querySelector(".dirchip");
    if ($) {
      const E = ps(L.p ?? ""), T = E !== "" && ia(i(), E);
      $.hidden = E === "", $.disabled = T, $.dataset.state = T ? "exclude" : "none", $.title = T ? `already excluded: ${E}` : `exclude everything under ${E}, subfolders included — one exclude rule at the end of the order`;
    }
    const j = A.querySelector(".chip");
    j && (j.dataset.state = L.o || "none", j.textContent = L.o === "exclude" ? "drop" : L.o === "include" ? "keep" : "·", j.title = L.o === "exclude" ? "overridden: excluded — click to keep" : L.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Hn(() => (p = Oo(a(_), a(b), {
    fetchPage: (A) => t.fetchPage(A),
    thumbHash: Io,
    extend: s() ? c : void 0,
    fill: s() ? g : void 0,
    onState: (A) => d()(A),
    activate: async (A, L, G) => {
      if (L.target.closest(".dirchip")) {
        o()(A);
        return;
      }
      if (!L.target.closest(".chip")) {
        l()(A, G);
        return;
      }
      const $ = v[A.o ?? "null"];
      A.o = await u()(A, $), g(G, A);
    }
  }), h = n(), () => p?.destroy())), sn(() => {
    const A = n(), L = r();
    p && (A !== h && (h = A, p.reset()), p.setTotal(L));
  });
  let y = "";
  sn(() => {
    const A = i().join(`
`);
    !p || A === y || (y = A, p.refill());
  });
  var O = Fo(), F = f(O);
  _r(F, (A) => S(b, A), () => a(b)), _r(O, (A) => S(_, A), () => a(_)), P(e, O), gt();
}
var zo = /* @__PURE__ */ I('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Do = /* @__PURE__ */ I('<th class="num svelte-1v3p82v"> </th>'), jo = /* @__PURE__ */ I('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Ho = /* @__PURE__ */ I('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), qo = /* @__PURE__ */ I('<td class="num svelte-1v3p82v"> </td>'), Bo = /* @__PURE__ */ I('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), $o = /* @__PURE__ */ I('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Uo(e, t) {
  pt(t, !0);
  let n = re(t, "rows", 19, () => []), r = re(t, "rules", 19, () => []), s = re(t, "root", 3, null), i = re(t, "selected", 3, null), l = re(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ ne(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const d = /* @__PURE__ */ ne(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : gs(r(), t.screen.toRule(w, s()))
  ]))), _ = { exclude: "✕", include: "✓" }, b = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var p = aa(), h = ot(p);
  {
    var v = (w) => {
      var c = $o(), g = f(c), y = f(g), O = f(y);
      {
        var F = (E) => {
          var T = zo();
          P(E, T);
        };
        K(O, (E) => {
          a(u) && E(F);
        });
      }
      var A = m(O), L = f(A), G = m(A, 3);
      {
        var $ = (E) => {
          var T = Do(), C = f(T);
          B(() => R(C, t.screen.heading[1])), P(E, T);
        };
        K(G, (E) => {
          t.screen.heading[1] && E($);
        });
      }
      var j = m(g);
      Ge(j, 23, n, (E) => E.key, (E, T, C) => {
        const H = /* @__PURE__ */ ne(() => a(d).get(a(T).key));
        var Y = Bo();
        let V;
        var U = f(Y);
        {
          var Z = (he) => {
            const Ne = /* @__PURE__ */ ne(() => l().has(a(T).key));
            var We = jo(), Ee = f(We);
            let rt;
            var ce = f(Ee);
            B(
              (ie) => {
                rt = xe(Ee, 1, "tick svelte-1v3p82v", null, rt, { on: a(Ne) }), se(Ee, "aria-checked", a(Ne)), se(Ee, "aria-label", `select ${ie ?? ""}`), R(ce, a(Ne) ? "✓" : "");
              },
              [() => o(a(T))]
            ), ee("click", Ee, (ie) => {
              ie.stopPropagation(), t.oncheck(a(T), a(C), ie.shiftKey);
            }), P(he, We);
          };
          K(U, (he) => {
            a(u) && he(Z);
          });
        }
        var ue = m(U), Q = f(ue);
        let q;
        var N = f(Q), X = m(Q), k = m(X);
        {
          var x = (he) => {
            var Ne = Ho();
            P(he, Ne);
          };
          K(k, (he) => {
            a(T).scope === "whole inventory" && he(x);
          });
        }
        var z = m(ue), ae = f(z), me = m(z), de = f(me), fe = m(me);
        {
          var Se = (he) => {
            var Ne = qo(), We = f(Ne);
            B(() => R(We, a(T).detail ?? "")), P(he, Ne);
          };
          K(fe, (he) => {
            t.screen.heading[1] && he(Se);
          });
        }
        B(
          (he, Ne, We) => {
            V = xe(Y, 1, "svelte-1v3p82v", null, V, {
              picked: i() === a(T).key,
              clickable: t.screen.sheet !== !1
            }), q = xe(Q, 1, "mark svelte-1v3p82v", null, q, {
              exclude: a(H) === "exclude",
              include: a(H) === "include"
            }), se(Q, "title", b[a(H)] ?? ""), R(N, _[a(H)] ?? ""), R(X, `${he ?? ""} `), R(ae, Ne), R(de, We);
          },
          [
            () => o(a(T)),
            () => Ce(a(T).paths),
            () => Ct(a(T).bytes)
          ]
        ), ee("click", Y, () => t.onpick(a(T))), P(E, Y);
      }), B(() => R(L, t.screen.heading[0] ?? "")), P(w, c);
    };
    K(h, (w) => {
      n().length && w(v);
    });
  }
  P(e, p), gt();
}
zt(["click"]);
var Go = /* @__PURE__ */ I('<button class="twisty svelte-pucy57"> </button>'), Wo = /* @__PURE__ */ I('<span class="twisty leaf svelte-pucy57">·</span>'), Yo = /* @__PURE__ */ I('<span class="name root svelte-pucy57"> </span>'), Vo = /* @__PURE__ */ I('<button class="name svelte-pucy57"> </button>'), Xo = /* @__PURE__ */ I('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Ko = /* @__PURE__ */ I('<div class="note svelte-pucy57"> </div>'), Jo = /* @__PURE__ */ I('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Zo = /* @__PURE__ */ I('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Qo = /* @__PURE__ */ I('<div class="tree svelte-pucy57"></div>');
function eu(e, t) {
  pt(t, !0);
  let n = re(t, "version", 3, 0), r = re(t, "excludedDirs", 19, () => []), s = re(t, "selected", 3, null), i = re(t, "busy", 3, !1), l = /* @__PURE__ */ W(Oe(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ W(Oe(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ W(Oe(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ W(Oe(/* @__PURE__ */ new Set()));
  async function _(c) {
    S(o, new Set(a(o)).add(c), !0);
    const g = await t.onload(c), y = new Map(a(l)), O = new Set(a(d));
    g ? (y.set(c, g), O.delete(c)) : O.add(c), S(l, y, !0), S(d, O, !0), S(o, new Set([...a(o)].filter((F) => F !== c)), !0);
  }
  function b(c) {
    if (a(u).has(c)) {
      S(u, new Set([...a(u)].filter((g) => g !== c)), !0);
      return;
    }
    S(u, new Set(a(u)).add(c), !0), a(l).has(c) || _(c);
  }
  let p = -1;
  sn(() => {
    const c = n();
    if (c !== p) {
      p = c, a(u).has(t.root) || S(u, new Set(a(u)).add(t.root), !0);
      for (const g of a(u)) _(g);
    }
  });
  const h = /* @__PURE__ */ ne(() => {
    const c = [], g = (A, L, G, $, j, E) => {
      const T = a(l).get(A), C = a(u).has(A);
      if (c.push({
        key: A,
        name: L,
        depth: G,
        paths: $,
        bytes: j,
        deeper: E,
        expanded: C,
        here: T?.here ?? null,
        truncated: !!T?.truncated,
        loading: a(o).has(A),
        failed: a(d).has(A),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: ia(r(), A)
      }), !(!C || !T))
        for (const H of T.children)
          g(H.path, H.name, G + 1, H.paths, H.bytes, H.deeper);
    }, y = a(l).get(t.root), O = y ? y.children.reduce((A, L) => A + L.paths, 0) + y.here.paths : 0, F = y ? y.children.reduce((A, L) => A + L.bytes, 0) + y.here.bytes : 0;
    return g(t.root, t.root, 0, O, F, !0), c;
  }), v = 8;
  var w = Qo();
  Ge(w, 21, () => a(h), (c) => c.key, (c, g) => {
    var y = Zo(), O = ot(y);
    let F;
    var A = f(O);
    let L;
    var G = m(A, 2);
    {
      var $ = (k) => {
        var x = Go(), z = f(x);
        B(() => {
          se(x, "aria-expanded", a(g).expanded), se(x, "aria-label", `${a(g).expanded ? "collapse" : "expand"} ${a(g).name ?? ""}`), se(x, "title", a(g).expanded ? "collapse" : "expand"), R(z, a(g).loading ? "·" : a(g).expanded ? "▾" : "▸");
        }), ee("click", x, () => b(a(g).key)), P(k, x);
      }, j = (k) => {
        var x = Wo();
        P(k, x);
      };
      K(G, (k) => {
        a(g).deeper ? k($) : k(j, -1);
      });
    }
    var E = m(G, 2);
    {
      var T = (k) => {
        var x = Yo(), z = f(x);
        B(() => R(z, a(g).key)), P(k, x);
      }, C = (k) => {
        var x = Vo(), z = f(x);
        B(() => {
          se(x, "title", `Show every kept file under ${a(g).key ?? ""}`), R(z, a(g).name);
        }), ee("click", x, () => t.onpick(a(g))), P(k, x);
      };
      K(E, (k) => {
        a(g).depth === 0 ? k(T) : k(C, -1);
      });
    }
    var H = m(E, 2), Y = f(H), V = m(H, 2), U = f(V), Z = m(V, 2), ue = m(O, 2);
    {
      var Q = (k) => {
        var x = Xo();
        let z;
        B((ae) => z = fn(x, "", z, ae), [
          () => ({
            "padding-left": `${Math.min(a(g).depth, v) * 11 + 18}px`
          })
        ]), P(k, x);
      }, q = (k) => {
        var x = Ko();
        let z;
        var ae = f(x);
        B(
          (me, de, fe) => {
            z = fn(x, "", z, me), R(ae, `${de ?? ""} directly here · ${fe ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(a(g).depth, v) * 11 + 18}px`
            }),
            () => Ce(a(g).here.paths),
            () => Ct(a(g).here.bytes)
          ]
        ), P(k, x);
      };
      K(ue, (k) => {
        a(g).expanded && a(g).failed ? k(Q) : a(g).expanded && a(g).here && a(g).here.paths > 0 && k(q, 1);
      });
    }
    var N = m(ue, 2);
    {
      var X = (k) => {
        var x = Jo();
        let z;
        B((ae) => z = fn(x, "", z, ae), [
          () => ({
            "padding-left": `${Math.min(a(g).depth, v) * 11 + 18}px`
          })
        ]), P(k, x);
      };
      K(N, (k) => {
        a(g).truncated && k(X);
      });
    }
    B(
      (k, x, z) => {
        F = xe(O, 1, "row svelte-pucy57", null, F, {
          picked: s() === a(g).key,
          gone: a(g).excluded
        }), L = fn(A, "", L, k), R(Y, x), R(U, z), Z.disabled = i() || a(g).excluded || a(g).depth === 0, se(Z, "title", a(g).depth === 0 ? "The library root is not excludable from here." : a(g).excluded ? "already excluded" : `Exclude everything under ${a(g).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(a(g).depth, v) * 11}px` }),
        () => Ce(a(g).paths),
        () => Ct(a(g).bytes)
      ]
    ), ee("click", Z, () => t.onexclude(a(g))), P(c, y);
  }), P(e, w), gt();
}
zt(["click"]);
var tu = /* @__PURE__ */ I('<button title="Back to its default">↺</button>'), nu = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), ru = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), au = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), su = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), iu = /* @__PURE__ */ I('<li><code class="svelte-1hh0fwb"> </code> </li>'), lu = /* @__PURE__ */ I(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), ou = /* @__PURE__ */ I('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
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
        ["headerSide", "Sides", 0, (C) => Math.floor(C / 2), 1],
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
  let u = /* @__PURE__ */ W(Oe(yl())), o = /* @__PURE__ */ W(!0), d = /* @__PURE__ */ W(!1), _ = /* @__PURE__ */ W(Oe(xs())), b = /* @__PURE__ */ W(Oe(window.innerWidth));
  const p = (C) => a(_) === "light" ? C.light : C.dark, h = (C) => C in cn ? cn : nn, v = (C) => `rgba(${C.r}, ${C.g}, ${C.b}, ${C.a})`, w = /* @__PURE__ */ ne(() => JSON.stringify(a(u), null, 2));
  Hn(() => {
    const C = localStorage.getItem(n);
    if (C)
      try {
        S(u, Cr(JSON.parse(C)), !0);
        return;
      } catch {
      }
    la();
  });
  function c(C) {
    S(u, Cr({ ...a(u), ...C }), !0), localStorage.setItem(n, JSON.stringify(a(u))), S(d, !1);
  }
  function g(C) {
    S(u, Cr(C), !0), localStorage.setItem(n, JSON.stringify(a(u))), S(d, !1);
  }
  function y(C) {
    c({ [C]: h(C)[C] });
  }
  function O() {
    S(_, ks(a(_) === "dark" ? "light" : "dark"), !0);
  }
  async function F() {
    await navigator.clipboard.writeText(a(w)), S(d, !0);
  }
  var A = ou();
  let L;
  var G = f(A), $ = m(f(G), 4), j = f($), E = m(G, 2);
  {
    var T = (C) => {
      var H = lu();
      {
        const Ee = (ce, ie = ir, Re = ir, Pe = ir) => {
          var Ie = tu();
          let Qe;
          B(() => {
            Qe = xe(Ie, 1, "undo svelte-1hh0fwb", null, Qe, { idle: !Re() }), se(Ie, "aria-label", `Reset ${ie() ?? ""}`);
          }), ee("click", Ie, function(...ct) {
            Pe()?.apply(this, ct);
          }), P(ce, Ie);
        };
        var Y = m(f(H), 2);
        Ge(Y, 17, () => r, yt, (ce, ie) => {
          var Re = ru(), Pe = f(Re), Ie = f(Pe), Qe = m(Pe, 2), ct = f(Qe), Et = m(Qe, 2);
          Ge(Et, 17, () => a(ie).rows, yt, (Dt, Bt) => {
            var _t = /* @__PURE__ */ ne(() => Tr(a(Bt), 5));
            let et = () => a(_t)[0], Tt = () => a(_t)[1], D = () => a(_t)[2], te = () => a(_t)[3], pe = () => a(_t)[4];
            const Te = /* @__PURE__ */ ne(() => a(u)[et()] !== h(et())[et()]), we = /* @__PURE__ */ ne(() => typeof te() == "function" ? te()(a(b)) : te());
            var ve = nu();
            let ye;
            var Ye = f(ve), at = f(Ye), ge = m(Ye, 2), He = m(ge, 2), Mt = m(He, 2);
            Ee(Mt, Tt, () => a(Te), () => () => y(et())), B(() => {
              ye = xe(ve, 1, "row svelte-1hh0fwb", null, ye, { moved: a(Te) }), R(at, Tt()), se(ge, "min", D()), se(ge, "max", a(we)), se(ge, "step", pe()), se(ge, "aria-label", Tt()), un(ge, a(u)[et()]), se(He, "min", D()), se(He, "max", a(we)), se(He, "step", pe()), se(He, "aria-label", `${Tt() ?? ""} value`), un(He, a(u)[et()]);
            }), ee("input", ge, (Be) => c({ [et()]: Number(Be.currentTarget.value) })), ee("input", He, (Be) => c({ [et()]: Number(Be.currentTarget.value) })), P(Dt, ve);
          }), B(() => {
            R(Ie, a(ie).title), R(ct, a(ie).note);
          }), P(ce, Re);
        });
        var V = m(Y, 2), U = f(V), Z = m(V, 2), ue = f(Z), Q = m(Z, 2);
        Ge(Q, 17, () => wl, yt, (ce, ie) => {
          const Re = /* @__PURE__ */ ne(() => p(a(ie))), Pe = /* @__PURE__ */ ne(() => a(u)[a(Re)]), Ie = /* @__PURE__ */ ne(() => a(ie).base[a(Re)]);
          var Qe = su(), ct = f(Qe), Et = f(ct), Dt = m(Et), Bt = f(Dt), _t = m(ct, 2), et = f(_t), Tt = m(_t, 2);
          Ge(Tt, 17, () => i, yt, (Te, we) => {
            var ve = /* @__PURE__ */ ne(() => Tr(a(we), 3));
            let ye = () => a(ve)[0], Ye = () => a(ve)[1], at = () => a(ve)[2];
            const ge = /* @__PURE__ */ ne(() => a(Pe)[ye()] !== a(Ie)[ye()]);
            var He = au();
            let Mt;
            var Be = f(He), M = f(Be), J = m(Be, 2), _e = m(J, 2), $e = m(_e, 2);
            Ee($e, Ye, () => a(ge), () => () => c({
              [a(Re)]: { ...a(Pe), [ye()]: a(Ie)[ye()] }
            })), B(() => {
              Mt = xe(He, 1, "row svelte-1hh0fwb", null, Mt, { moved: a(ge) }), R(M, Ye()), se(J, "max", at()), se(J, "step", at() === 1 ? 0.01 : 1), se(J, "aria-label", `${a(_) ?? ""} ${s[a(ie).dark].title ?? ""} ${Ye() ?? ""}`), un(J, a(Pe)[ye()]), se(_e, "max", at()), se(_e, "step", at() === 1 ? 0.01 : 1), se(_e, "aria-label", `${a(_) ?? ""} ${s[a(ie).dark].title ?? ""} ${Ye() ?? ""} value`), un(_e, a(Pe)[ye()]);
            }), ee("input", J, (dt) => c({
              [a(Re)]: {
                ...a(Pe),
                [ye()]: Number(dt.currentTarget.value)
              }
            })), ee("input", _e, (dt) => c({
              [a(Re)]: {
                ...a(Pe),
                [ye()]: Number(dt.currentTarget.value)
              }
            })), P(Te, He);
          });
          var D = m(Tt, 2);
          let te;
          var pe = f(D);
          B(
            (Te, we) => {
              R(Et, `${s[a(ie).dark].title ?? ""} `), R(Bt, a(_)), R(et, s[a(ie).dark].note), te = fn(D, "", te, Te), R(pe, we);
            },
            [
              () => ({ background: v(a(Pe)) }),
              () => v(a(Pe))
            ]
          ), P(ce, Qe);
        });
        var q = m(Q, 2), N = m(f(q), 4);
        let rt;
        var X = f(N), k = f(X), x = m(X, 2);
        Ee(x, () => "Blur at the edge", () => a(u).blurEdge !== cn.blurEdge, () => () => y("blurEdge"));
        var z = m(q, 2), ae = m(f(z), 4);
        Ge(ae, 21, () => l, yt, (ce, ie) => {
          var Re = /* @__PURE__ */ ne(() => Tr(a(ie), 2));
          let Pe = () => a(Re)[0], Ie = () => a(Re)[1];
          var Qe = iu(), ct = f(Qe), Et = f(ct), Dt = m(ct);
          B(() => {
            R(Et, Pe()), R(Dt, ` — ${Ie() ?? ""}`);
          }), P(ce, Qe);
        });
        var me = m(z, 2), de = m(f(me), 4), fe = f(de), Se = m(fe, 2), he = m(Se, 2), Ne = f(he), We = m(de, 2);
        B(() => {
          R(U, `The five colours below are per theme, and you are editing the ${a(_) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), R(ue, `Edit the ${a(_) === "dark" ? "light" : "dark"} colours`), rt = xe(N, 1, "row toggle svelte-1hh0fwb", null, rt, { moved: a(u).blurEdge !== cn.blurEdge }), al(k, a(u).blurEdge), R(Ne, a(d) ? "Copied" : "Copy"), un(We, a(w));
        }), ee("click", Z, O), ee("change", k, (ce) => c({ blurEdge: ce.currentTarget.checked })), ee("click", fe, () => g(nn)), ee("click", Se, () => g(cn)), ee("click", he, F);
      }
      P(C, H);
    };
    K(E, (C) => {
      a(o) && C(T);
    });
  }
  B(() => {
    L = xe(A, 1, "tuner svelte-1hh0fwb", null, L, { folded: !a(o) }), se($, "title", a(o) ? "Fold away" : "Open"), R(j, a(o) ? "–" : "+");
  }), Wr("innerWidth", (C) => S(b, C, !0)), ee("click", $, () => S(o, !a(o))), P(e, A), gt();
}
zt(["click", "input", "change"]);
var cu = /* @__PURE__ */ I('<button><span class="n svelte-1n46o8q"> </span> </button>'), du = /* @__PURE__ */ I('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), fu = /* @__PURE__ */ I('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), hu = /* @__PURE__ */ I('<div class="muted pad svelte-1n46o8q">loading…</div>'), vu = /* @__PURE__ */ I('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), pu = /* @__PURE__ */ I('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), gu = /* @__PURE__ */ I('<p class="blurb"> </p>'), _u = /* @__PURE__ */ I('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), bu = /* @__PURE__ */ I('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), mu = /* @__PURE__ */ I('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), wu = /* @__PURE__ */ I('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), yu = /* @__PURE__ */ I("<div> </div>"), xu = /* @__PURE__ */ I('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function ku(e, t) {
  pt(t, !0);
  const n = location.pathname === "/tune";
  let r = /* @__PURE__ */ W("grid"), s = /* @__PURE__ */ W(0), i = /* @__PURE__ */ W(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ W(Oe([])), u = /* @__PURE__ */ W(null), o = /* @__PURE__ */ W(null), d = /* @__PURE__ */ W(Oe(/* @__PURE__ */ new Set())), _ = /* @__PURE__ */ W(null), b = /* @__PURE__ */ W(null), p = /* @__PURE__ */ W(null), h = /* @__PURE__ */ W(null), v = /* @__PURE__ */ W(!1), w = /* @__PURE__ */ W(!1), c = /* @__PURE__ */ W(!1), g = /* @__PURE__ */ W(!1), y = /* @__PURE__ */ W(Oe({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), O = /* @__PURE__ */ W(null), F = /* @__PURE__ */ W(0), A = /* @__PURE__ */ W(null), L = /* @__PURE__ */ W(Oe({})), G = /* @__PURE__ */ W("newest"), $ = /* @__PURE__ */ W(Oe(Nl())), j = /* @__PURE__ */ W(null);
  const E = /* @__PURE__ */ ne(() => xa[a(s)]), T = /* @__PURE__ */ ne(() => a(E).table !== !1), C = /* @__PURE__ */ ne(() => a(T) || a(E).tree === !0), H = /* @__PURE__ */ ne(() => a(E).sheet !== !1 && (a(o) !== null || !a(C))), Y = /* @__PURE__ */ ne(() => ({
    sort: a(G),
    ...a($).on ? { stack: a($).window } : {},
    ...Object.fromEntries(Object.entries(a(L)).filter(([, M]) => M.length > 0))
  })), V = /* @__PURE__ */ ne(() => a(r) === "grid" ? `grid:${JSON.stringify(a(Y))}` : `triage:${a(s)}:${JSON.stringify(a(o))}`), U = /* @__PURE__ */ ne(() => a(E).rule === !1 || a(d).size === 0 ? [] : a(l).filter((M) => a(d).has(M.key)).map((M) => a(E).toRule(M, a(i))).filter((M) => M && gs(a(b)?.rules ?? [], M) !== "exclude")), Z = /* @__PURE__ */ ne(() => (a(b)?.rules ?? []).filter((M) => M.decision === "exclude" && M.term?.column === "dir_under").map((M) => String(M.term.value).replace(/[\\/]+$/, "").toLowerCase())), ue = ol();
  function Q(M) {
    S(O, String(M), !0);
  }
  async function q(M) {
    try {
      return S(O, null), await M();
    } catch (J) {
      return Q(J), null;
    }
  }
  const N = ul(
    () => {
      S(w, !0), q(async () => {
        const M = a(o)?.at === "end" || a(o)?.at === void 0 ? void 0 : 0, { stale: J, value: _e } = await ue(() => Fe.counts(a(o), M));
        J || S(b, _e, !0);
      }).finally(() => {
        S(w, !1);
      });
    },
    220
  );
  async function X() {
    S(p, "loading");
    const M = await q(() => Fe.files());
    S(p, M, !0), S(v, !1), S(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function k(M = !1) {
    if (a(r) !== "triage" || !a(T)) {
      S(l, [], !0);
      return;
    }
    S(g, !0);
    const J = a(E).name === "source_folder" && a(i) ? { root: a(i) } : {};
    M && (J.live = "1");
    const _e = await q(() => Fe.screen(a(E).name, J));
    S(l, _e?.rows ?? [], !0), S(g, !1);
  }
  let x = !1;
  sn(() => {
    a(s), a(r), wn(() => {
      S(u, null), S(o, null), S(i, null), de(), a(r) === "triage" && (k(), N.now(), x || (x = !0, X()));
    });
  }), sn(() => {
    a(i), wn(() => {
      a(r) === "triage" && (de(), k());
    });
  }), Hn(() => {
    q(async () => {
      S(A, await Fe.facets(), !0);
    });
  });
  function z(M, J) {
    S(L, { ...a(L), [M]: J }, !0);
  }
  function ae(M) {
    if (a(E).sheet !== !1) {
      if (a(E).drill && !a(i)) {
        S(u, M.key, !0), S(
          o,
          {
            ...a(E).toRule(M, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), S(i, M.key, !0);
        return;
      }
      S(u, M.key, !0), S(
        o,
        {
          ...a(E).toRule(M, a(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), N();
    }
  }
  function me(M, J, _e) {
    const $e = new Set(a(d)), dt = !$e.has(M.key), At = _e && a(_) !== null ? a(l).findIndex((Xe) => Xe.key === a(_)) : -1, [Ve, Ue] = At < 0 ? [J, J] : At < J ? [At, J] : [J, At];
    for (let Xe = Ve; Xe <= Ue; Xe++)
      dt ? $e.add(a(l)[Xe].key) : $e.delete(a(l)[Xe].key);
    S(d, $e, !0), S(_, M.key, !0);
  }
  function de() {
    S(d, /* @__PURE__ */ new Set(), !0), S(_, null);
  }
  function fe(M) {
    S(o, M, !0), S(
      u,
      null
      // it no longer corresponds to a row
    ), N();
  }
  function Se(M = !1) {
    S(o, null), S(u, null), M && S(i, null), N.now();
  }
  async function he() {
    S(
      v,
      !0
      // the distinct-content number now says so on its face
    ), Mi(F), await k(), N.now();
  }
  async function Ne() {
    if (!a(o)) return;
    S(c, !0);
    const M = a(o).at === "end" ? void 0 : 0, J = await q(() => Fe.addRule(
      {
        column: a(o).column,
        op: a(o).op,
        value: a(o).value,
        decision: a(o).decision ?? "exclude",
        note: `screen ${a(E).id} ${a(E).title}`
      },
      M
    ));
    S(c, !1), J && (S(o, null), S(u, null), await he());
  }
  async function We() {
    const M = a(U);
    if (!M.length) {
      de();
      return;
    }
    S(c, !0);
    for (const J of M)
      if (!await q(() => Fe.addRule({
        column: J.column,
        op: J.op,
        value: J.value,
        decision: "exclude",
        note: `screen ${a(E).id} ${a(E).title}`
      }))) break;
    S(c, !1), de(), S(o, null), S(u, null), await he();
  }
  async function Ee(M) {
    if (!M || ia(a(Z), M)) return;
    S(c, !0);
    const J = await q(() => Fe.addRule({
      column: "dir_under",
      op: "=",
      value: M,
      decision: "exclude",
      note: `screen ${a(E).id} ${a(E).title}`
    }));
    S(c, !1), J && await he();
  }
  const rt = (M) => Ee(ps(M.p ?? "")), ce = (M) => Ee(M.key);
  async function ie(M) {
    S(c, !0), await q(() => Fe.deleteRule(M.id)), S(c, !1), await he();
  }
  async function Re(M, J) {
    S(c, !0), await q(() => Fe.moveRule(M.id, J)), S(c, !1), await he();
  }
  async function Pe() {
    await q(async () => {
      S(A, await Fe.facets(), !0);
    });
  }
  async function Ie(M, J) {
    const _e = await q(() => Fe.override(M.s, J));
    return _e ? (S(v, !0), N(), _e.decision) : M.o ?? null;
  }
  function Qe(M) {
    return a(r) === "grid" ? Fe.photos({ limit: 500, ...a(Y), ...M || {} }) : Fe.page(a(o), M);
  }
  function ct(M, J) {
    if (a(r) === "grid") {
      const _e = M.m ?? [{ id: M.id, s: M.s, w: M.w, h: M.h }];
      S(j, { frames: _e, origin: J.getBoundingClientRect() }, !0);
      return;
    }
    q(() => Fe.revealOrigin(M.id));
  }
  function Et(M) {
    S(j, null), q(() => Fe.revealPhoto(M.id));
  }
  var Dt = xu(), Bt = ot(Dt);
  {
    var _t = (M) => {
      Xl(M, {
        get facets() {
          return a(A);
        },
        get selected() {
          return a(L);
        },
        get sort() {
          return a(G);
        },
        get stacking() {
          return a($);
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
        onselect: z,
        onsort: (J) => S(G, J, !0),
        onstack: (J) => S($, Ol(J), !0),
        onclear: () => S(L, {}, !0),
        ontriage: () => S(r, "triage")
      });
    };
    K(Bt, (M) => {
      a(r) === "grid" && M(_t);
    });
  }
  var et = m(Bt, 2);
  {
    var Tt = (M) => {
      uu(M, {});
    };
    K(et, (M) => {
      n && M(Tt);
    });
  }
  var D = m(et, 2);
  let te;
  var pe = f(D);
  {
    var Te = (M) => {
      var J = pu(), _e = f(J), $e = f(_e), dt = m(_e, 2);
      Ge(dt, 21, () => xa, yt, (Ke, ft, st) => {
        var Rt = cu();
        let Kt;
        var Jt = f(Rt), ke = f(Jt), it = m(Jt, 1, !0);
        B(() => {
          Kt = xe(Rt, 1, "nav svelte-1n46o8q", null, Kt, { on: st === a(s) }), R(ke, a(ft).id), R(it, a(ft).title);
        }), ee("click", Rt, () => S(s, st, !0)), P(Ke, Rt);
      });
      var At = m(dt, 2);
      {
        var Ve = (Ke) => {
          var ft = vu(), st = ot(ft), Rt = f(st);
          {
            var Kt = (Je) => {
              var tt = du(), yn = ot(tt), qn = /* @__PURE__ */ ne(() => Se.bind(null, !0)), kr = m(yn, 2), Sr = f(kr);
              B(() => R(Sr, `inside ${a(i) ?? ""}`)), ee("click", yn, function(...Er) {
                a(qn)?.apply(this, Er);
              }), P(Je, tt);
            }, Jt = (Je) => {
              var tt = fu(), yn = f(tt);
              B(() => R(yn, a(E).relive)), ee("click", tt, () => k(!0)), P(Je, tt);
            };
            K(Rt, (Je) => {
              a(E).drill && a(i) ? Je(Kt) : a(E).relive && Je(Jt, 1);
            });
          }
          var ke = m(st, 2);
          {
            var it = (Je) => {
              var tt = hu();
              P(Je, tt);
            };
            K(ke, (Je) => {
              a(g) && Je(it);
            });
          }
          var Zt = m(ke, 2);
          {
            let Je = /* @__PURE__ */ ne(() => a(b)?.rules ?? []);
            Uo(Zt, {
              get rows() {
                return a(l);
              },
              get screen() {
                return a(E);
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
              onpick: ae,
              oncheck: me
            });
          }
          P(Ke, ft);
        };
        K(At, (Ke) => {
          a(T) && Ke(Ve);
        });
      }
      var Ue = m(At, 2);
      {
        var Xe = (Ke) => {
          eu(Ke, {
            get root() {
              return Ln;
            },
            get version() {
              return a(F);
            },
            get excludedDirs() {
              return a(Z);
            },
            get selected() {
              return a(u);
            },
            get busy() {
              return a(c);
            },
            onload: (ft) => q(() => Fe.tree(ft)),
            onpick: ae,
            onexclude: ce
          });
        };
        K(Ue, (Ke) => {
          a(E).tree && Ke(Xe);
        });
      }
      var ln = m(Ue, 2);
      {
        let Ke = /* @__PURE__ */ ne(() => a(b)?.rules ?? []), ft = /* @__PURE__ */ ne(() => a(b)?.unmatched ?? null);
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
          ondelete: ie,
          onmove: Re
        });
      }
      var on = m(ln, 2);
      bo(on, { oncomplete: Pe }), ee("click", $e, () => S(r, "grid")), P(M, J);
    };
    K(pe, (M) => {
      a(r) === "triage" && M(Te);
    });
  }
  var we = m(pe, 2), ve = f(we);
  {
    var ye = (M) => {
      var J = wu(), _e = ot(J), $e = f(_e), dt = m(_e, 2), At = f(dt), Ve = m(dt, 2);
      {
        var Ue = (ke) => {
          var it = gu(), Zt = f(it);
          B(() => R(Zt, a(E).note)), P(ke, it);
        };
        K(Ve, (ke) => {
          a(E).note && ke(Ue);
        });
      }
      var Xe = m(Ve, 2);
      {
        var ln = (ke) => {
          lo(ke, {
            get screen() {
              return a(E);
            }
          });
        };
        K(Xe, (ke) => {
          a(E).name === "dimensions" && ke(ln);
        });
      }
      var on = m(Xe, 2);
      ml(on, {
        get counts() {
          return a(b);
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
          return a(w);
        },
        onfiles: X
      });
      var Ke = m(on, 2);
      {
        var ft = (ke) => {
          var it = _u(), Zt = f(it), Je = f(Zt), tt = m(Zt, 2), yn = f(tt), qn = m(tt, 2), kr = m(qn, 2), Sr = f(kr);
          {
            var Er = (Qt) => {
              var xn = Mn("already excluded — nothing left to write");
              P(Qt, xn);
            }, Ss = (Qt) => {
              var xn = Mn();
              B((Es) => R(xn, `one exclude rule each, at the end of the order${Es ?? ""}`), [
                () => a(U).length < a(d).size ? ` · ${Ce(a(d).size - a(U).length)} already excluded, skipped` : ""
              ]), P(Qt, xn);
            };
            K(Sr, (Qt) => {
              a(U).length ? Qt(Ss, -1) : Qt(Er);
            });
          }
          B(
            (Qt, xn) => {
              R(Je, `${Qt ?? ""} ticked`), tt.disabled = a(c) || !a(U).length, R(yn, xn), qn.disabled = a(c);
            },
            [
              () => Ce(a(d).size),
              () => a(c) ? "saving…" : `Exclude ${Ce(a(U).length)}`
            ]
          ), ee("click", tt, We), ee("click", qn, de), P(ke, it);
        };
        K(Ke, (ke) => {
          a(d).size && ke(ft);
        });
      }
      var st = m(Ke, 2);
      So(st, {
        get candidate() {
          return a(o);
        },
        get screen() {
          return a(E);
        },
        get saving() {
          return a(c);
        },
        onedit: fe,
        onconfirm: Ne,
        onclear: Se
      });
      var Rt = m(st, 2);
      {
        var Kt = (ke) => {
          var it = bu(), Zt = f(it);
          B((Je, tt) => R(Zt, `${Je ?? ""}${tt ?? ""} loaded${a(y).exhausted ? " · all of them" : ""}${a(y).loading ? " · loading…" : ""} `), [
            () => Ce(a(y).count),
            () => a(y).total ? " of " + Ce(a(y).total) : ""
          ]), P(ke, it);
        }, Jt = (ke) => {
          var it = mu();
          P(ke, it);
        };
        K(Rt, (ke) => {
          a(H) ? ke(Kt) : a(E).sheet === !1 && ke(Jt, 1);
        });
      }
      B(() => {
        R($e, `${a(E).id ?? ""} · ${a(E).title ?? ""}`), R(At, a(E).blurb);
      }), P(M, J);
    };
    K(ve, (M) => {
      a(r) === "triage" && M(ye);
    });
  }
  var Ye = m(ve, 2);
  {
    var at = (M) => {
      {
        let J = /* @__PURE__ */ ne(() => a(r) === "grid" ? null : a(b)?.page_paths ?? null), _e = /* @__PURE__ */ ne(() => a(r) === "triage");
        Lo(M, {
          get key() {
            return a(V);
          },
          fetchPage: Qe,
          get total() {
            return a(J);
          },
          get triage() {
            return a(_e);
          },
          get excludedDirs() {
            return a(Z);
          },
          onActivate: ct,
          onOverride: Ie,
          onExcludeFolder: rt,
          onState: ($e) => S(y, { ...a(y), ...$e }, !0)
        });
      }
    };
    K(Ye, (M) => {
      (a(H) || a(r) === "grid") && M(at);
    });
  }
  var ge = m(D, 2);
  {
    var He = (M) => {
      to(M, {
        get frames() {
          return a(j).frames;
        },
        get origin() {
          return a(j).origin;
        },
        onreveal: Et,
        onclose: () => S(j, null)
      });
    };
    K(ge, (M) => {
      a(j) && M(He);
    });
  }
  var Mt = m(ge, 2);
  {
    var Be = (M) => {
      var J = yu();
      let _e;
      var $e = f(J);
      B(() => {
        _e = xe(J, 1, "status", null, _e, { bare: a(r) === "grid" }), R($e, a(O));
      }), P(M, J);
    };
    K(Mt, (M) => {
      a(O) && M(Be);
    });
  }
  B(() => te = xe(D, 1, "shell", null, te, { bare: a(r) === "grid" })), P(e, Dt), gt();
}
zt(["click"]);
Il();
la();
Wi(ku, { target: document.getElementById("app") });
