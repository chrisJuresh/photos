var Vr = Array.isArray, Es = Array.prototype.indexOf, ur = Array.prototype.includes, wr = Array.from, Ts = Object.defineProperty, An = Object.getOwnPropertyDescriptor, Ms = Object.getOwnPropertyDescriptors, As = Object.prototype, Rs = Array.prototype, Ra = Object.getPrototypeOf, la = Object.isExtensible;
const ir = () => {
};
function Ps(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Pa() {
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
const Ye = 2, Cn = 4, yr = 8, Ca = 1 << 24, At = 16, yt = 32, Gt = 64, Fr = 128, wt = 512, qe = 1024, Be = 2048, Ct = 4096, rt = 8192, ft = 16384, zn = 32768, Lr = 1 << 25, Nn = 65536, cr = 1 << 17, Cs = 1 << 18, Dn = 1 << 19, Ns = 1 << 20, zt = 1 << 25, hn = 65536, dr = 1 << 21, Rn = 1 << 22, tn = 1 << 23, un = Symbol("$state"), Os = Symbol("legacy props"), Is = Symbol(""), Na = Symbol("attributes"), zr = Symbol("class"), Dr = Symbol("style"), jr = Symbol("text"), er = new class extends Error {
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
const Vs = 1, Xs = 2, Oa = 4, Ks = 8, Js = 16, Zs = 1, Qs = 4, ei = 8, ti = 16, ni = 1, ri = 2, He = Symbol("uninitialized"), ai = "http://www.w3.org/1999/xhtml";
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
let Qe = null;
function On(e) {
  Qe = e;
}
function ht(e, t = !1, n) {
  Qe = {
    p: Qe,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      ue
    ),
    l: null
  };
}
function vt(e) {
  var t = (
    /** @type {ComponentContext} */
    Qe
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Qa(r);
  }
  return t.i = !0, Qe = t.p, /** @type {T} */
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
function $t(e) {
  if (En.length === 0) {
    var t = En;
    queueMicrotask(() => {
      t === En && ui();
    });
  }
  En.push(e);
}
function za(e) {
  var t = ue;
  if (t === null)
    return ce.f |= tn, e;
  if ((t.f & zn) === 0 && (t.f & Cn) === 0)
    throw e;
  Qt(e, t);
}
function Qt(e, t) {
  if (!(t !== null && (t.f & ft) !== 0)) {
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
function Pe(e, t) {
  e.f = e.f & ci | t;
}
function Xr(e) {
  (e.f & wt) !== 0 || e.deps === null ? Pe(e, qe) : Pe(e, Ct);
}
function Da(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Ye) === 0 || (t.f & hn) === 0 || (t.f ^= hn, Da(
        /** @type {Derived} */
        t.deps
      ));
}
function ja(e, t, n) {
  (e.f & Be) !== 0 ? t.add(e) : (e.f & Ct) !== 0 && n.add(e), Da(e.deps), Pe(e, qe);
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
function fi(e, t, n, r = !0) {
  r && n();
  for (var s of t)
    e.addEventListener(s, n);
  xr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function jn(e) {
  var t = ce, n = ue;
  xt(null), jt(null);
  try {
    return e();
  } finally {
    xt(t), jt(n);
  }
}
function hi(e) {
  let t = 0, n = vn(0), r;
  return () => {
    Qr() && (a(n), ts(() => (t === 0 && (r = gn(() => e(() => Jn(n)))), t += 1, () => {
      $t(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Jn(n));
      });
    })));
  };
}
var vi = Nn | Dn;
function pi(e, t, n, r) {
  new gi(e, t, n, r);
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
  #b = hi(() => (this.#d = vn(this.#p), () => {
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
        ue
      );
      l.b = this, l.f |= Fr, r(i);
    }, this.parent = /** @type {Effect} */
    ue.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#r = ea(() => {
      this.#h();
    }, vi);
  }
  #_() {
    try {
      this.#s = bt(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: s } = this.#m(t);
    $t(s), n && (this.#l = bt(() => {
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
        li();
        return;
      }
      n = !0, r && Ws(), this.#l !== null && dn(this.#l, () => {
        this.#l = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: s, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, s), r = !1;
      } catch (l) {
        Qt(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = bt(() => t(this.#t)), $t(() => {
      var n = this.#a = document.createDocumentFragment(), r = Ut();
      n.append(r), this.#s = this.#v(() => bt(() => this.#o(r))), this.#u === 0 && (this.#t.before(n), this.#a = null, dn(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#p = 0, this.#s = bt(() => {
        this.#o(this.#t);
      }), this.#u > 0) {
        var t = this.#a = document.createDocumentFragment();
        na(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = bt(() => n(this.#t));
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
    var n = ue, r = ce, s = Qe;
    jt(this.#r), xt(this.#r), On(this.#r.ctx);
    try {
      return nn.ensure(), t();
    } catch (i) {
      return za(i), null;
    } finally {
      jt(n), xt(r), On(s);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && dn(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#c) && (this.#c = !0, $t(() => {
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
    this.#s && (ot(this.#s), this.#s = null), this.#n && (ot(this.#n), this.#n = null), this.#l && (ot(this.#l), this.#l = null);
    let n = this.#e.failed;
    const r = (s) => {
      const { reset: i, invoke_onerror: l } = this.#m(s);
      l(), n && (this.#l = this.#v(() => {
        try {
          return bt(() => {
            var u = (
              /** @type {Effect} */
              ue
            );
            u.b = this, u.f |= Fr, n(
              this.#t,
              () => s,
              () => i
            );
          });
        } catch (u) {
          return Qt(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    $t(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (i) {
        Qt(i, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        r,
        /** @param {unknown} e */
        (i) => Qt(i, this.#r && this.#r.parent)
      ) : r(s);
    });
  }
}
function _i(e, t, n, r) {
  const s = Zn;
  var i = e.filter((h) => !h.settled), l = t.map(s);
  if (n.length === 0 && i.length === 0) {
    r(l);
    return;
  }
  var u = (
    /** @type {Effect} */
    ue
  ), o = bi(), d = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function _(h) {
    if ((u.f & ft) === 0) {
      o();
      try {
        r([...l, ...h]);
      } catch (v) {
        Qt(v, u);
      }
      fr();
    }
  }
  var m = Ha();
  if (n.length === 0) {
    d.then(() => _([])).finally(m);
    return;
  }
  function p() {
    Promise.all(n.map((h) => /* @__PURE__ */ mi(h))).then(_).catch((h) => Qt(h, u)).finally(m);
  }
  d ? d.then(() => {
    o(), p(), fr();
  }) : p();
}
function bi() {
  var e = (
    /** @type {Effect} */
    ue
  ), t = ce, n = Qe, r = (
    /** @type {Batch} */
    be
  );
  return function(i = !0) {
    jt(e), xt(t), On(n), i && (e.f & ft) === 0 && (r?.activate(), r?.apply());
  };
}
function fr(e = !0) {
  jt(null), xt(null), On(null), e && be?.deactivate();
}
function Ha() {
  var e = (
    /** @type {Effect} */
    ue
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
  var t = Ye | Be;
  return ue !== null && (ue.f |= Dn), {
    ctx: Qe,
    deps: null,
    effects: null,
    equals: Ia,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      He
    ),
    wv: 0,
    parent: ue,
    ac: null
  };
}
const Yn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function mi(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    ue
  );
  r === null && zs();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = vn(
    /** @type {V} */
    He
  ), l = !ce, u = /* @__PURE__ */ new Set();
  return Ii(() => {
    var o = (
      /** @type {Effect} */
      ue
    ), d = Pa();
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
        var m = Ha();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        _.async_deriveds.get(o)?.reject(Yn);
      else
        for (const h of u.values())
          h.reject(Yn);
      u.add(d), _.async_deriveds.set(o, d);
    }
    const p = (h, v = void 0) => {
      m?.(), u.delete(d), v !== Yn && (_.activate(), v ? (i.f |= tn, In(i, v)) : ((i.f & tn) !== 0 && (i.f ^= tn), In(i, h)), _.deactivate());
    };
    d.promise.then(p, (h) => p(null, h || "unknown"));
  }), xr(() => {
    for (const o of u)
      o.reject(Yn);
  }), new Promise((o) => {
    function d(_) {
      function m() {
        _ === s ? o(i) : d(s);
      }
      _.then(m, m);
    }
    d(s);
  });
}
// @__NO_SIDE_EFFECTS__
function re(e) {
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
      ot(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Kr(e) {
  var t, n = ue, r = e.parent;
  if (!Yt && r !== null && e.v !== He && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (ft | rt)) !== 0)
    return si(), e.v;
  jt(r);
  try {
    e.f &= ~hn, wi(e), t = cs(e);
  } finally {
    jt(n);
  }
  return t;
}
function Ba(e) {
  var t = Kr(e);
  if (!e.equals(t) && (e.wv = os(), (!be?.is_fork || e.deps === null) && (be !== null ? (be.capture(e, t, !0), Hr?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Pe(e, qe);
    return;
  }
  Yt || (Rt !== null ? (Qr() || be?.is_fork) && Rt.set(e, t) : Xr(e));
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
let Mr = null, kn = null, be = null, Hr = null, Rt = null, qr = null, Ar = !1, Tn = null, lr = null;
var oa = 0;
let xi = 1;
class nn {
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
        Pe(s, Be), n(s);
      for (s of r.m)
        Pe(s, Ct), n(s);
    }
    this.#g.add(t);
  }
  #_() {
    this.#t = !0, oa++ > 1e3 && (this.#v(), ki());
    for (const o of this.#u)
      this.#c.delete(o), Pe(o, Be), this.schedule(o);
    for (const o of this.#c)
      Pe(o, Ct), this.schedule(o);
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
      var i = nn.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (Tn = null, lr = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [o, d] of this.#f)
        Ga(o, d);
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
    this.#o.clear(), Hr = this, ua(r), ua(n), Hr = null, this.#l?.resolve();
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
    t.f ^= qe;
    for (var s = t.first; s !== null; ) {
      var i = s.f, l = (i & (yt | Gt)) !== 0, u = l && (i & qe) !== 0, o = u || (i & rt) !== 0 || this.#f.has(s);
      if (!o && s.fn !== null) {
        l ? s.f ^= qe : (i & Cn) !== 0 ? n.push(s) : nr(s) && ((i & At) !== 0 && this.#c.add(s), Fn(s));
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
      if (s !== null && !((r.f & Ye) !== 0 && (r.f & (Be | Ct)) === 0))
        for (const u of s) {
          var i = u.f;
          if ((i & Ye) !== 0)
            n(
              /** @type {Derived} */
              u
            );
          else {
            var l = (
              /** @type {Effect} */
              u
            );
            i & (Rn | At) && !this.async_deriveds.has(l) && (this.#c.delete(l), Pe(l, Be), this.schedule(l));
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
      ja(t[n], this.#u, this.#c);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== He && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & tn) === 0 && (this.current.set(t, [n, r]), Rt?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    be = this;
  }
  deactivate() {
    be = null, Rt = null;
  }
  flush() {
    try {
      Ar = !0, be = this, this.#_();
    } finally {
      oa = 0, qr = null, Tn = null, lr = null, Ar = !1, be = null, Rt = null, cn.clear();
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
                (h.f & (At | Rn)) !== 0 ? m.schedule(h) : m.#h([h]);
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
              (p.f & (ft | rt | cr)) === 0 && Jr(p, d, u) && ((p.f & (Rn | At)) !== 0 ? (Pe(p, Be), m.schedule(p)) : m.#u.add(p));
          if (m.#a.length > 0 && !m.#d) {
            m.apply();
            for (var _ of m.#a)
              m.#y(_, [], []);
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
    this.#d || (this.#d = !0, $t(() => {
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
    return (this.#l ??= Pa()).promise;
  }
  static ensure() {
    if (be === null) {
      const t = be = new nn();
      Ar || $t(() => {
        t.#t || t.flush();
      });
    }
    return be;
  }
  apply() {
    {
      Rt = null;
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
      var r = n.f;
      if (Tn !== null && n === ue && (ce === null || (ce.f & Ye) === 0))
        return;
      if ((r & (Gt | yt)) !== 0) {
        if ((r & qe) === 0)
          return;
        n.f ^= qe;
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
    Qt(e, qr);
  }
}
let Bt = null;
function ua(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (ft | rt)) === 0 && nr(r) && (Bt = /* @__PURE__ */ new Set(), Fn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && rs(r), Bt?.size > 0)) {
        cn.clear();
        for (const s of Bt) {
          if ((s.f & (ft | rt)) !== 0) continue;
          const i = [s];
          let l = s.parent;
          for (; l !== null; )
            Bt.has(l) && (Bt.delete(l), i.push(l)), l = l.parent;
          for (let u = i.length - 1; u >= 0; u--) {
            const o = i[u];
            (o.f & (ft | rt)) === 0 && Fn(o);
          }
        }
        Bt.clear();
      }
    }
    Bt = null;
  }
}
function Ua(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & Ye) !== 0 ? Ua(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (Rn | At)) !== 0 && (i & Be) === 0 && Jr(s, t, r) && (Pe(s, Be), Zr(
        /** @type {Effect} */
        s
      ));
    }
}
function Jr(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (ur.call(t, s))
        return !0;
      if ((s.f & Ye) !== 0 && Jr(
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
  be.schedule(e);
}
function Ga(e, t) {
  if (!((e.f & yt) !== 0 && (e.f & qe) !== 0)) {
    (e.f & Be) !== 0 ? t.d.push(e) : (e.f & Ct) !== 0 && t.m.push(e), Pe(e, qe);
    for (var n = e.first; n !== null; )
      Ga(n, t), n = n.next;
  }
}
function Ya(e) {
  Pe(e, qe);
  for (var t = e.first; t !== null; )
    Ya(t), t = t.next;
}
let hr = /* @__PURE__ */ new Set();
const cn = /* @__PURE__ */ new Map();
let Wa = !1;
function vn(e, t) {
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
function W(e, t) {
  const n = vn(e);
  return is(n), n;
}
// @__NO_SIDE_EFFECTS__
function Si(e, t = !1, n = !0) {
  const r = vn(e);
  return t || (r.equals = Fa), r;
}
function S(e, t, n = !1) {
  ce !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Pt || (ce.f & cr) !== 0) && La() && (ce.f & (Ye | At | Rn | cr)) !== 0 && (Dt === null || !Dt.has(e)) && Ys();
  let r = n ? ze(t) : t;
  return In(e, r, lr);
}
function In(e, t, n = null) {
  if (!e.equals(t)) {
    cn.set(e, Yt ? t : e.v);
    var r = nn.ensure();
    if (r.capture(e, t), (e.f & Ye) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Be) !== 0 && Kr(s), Rt === null && Xr(s);
    }
    e.wv = os(), Va(e, Be, n), ue !== null && (ue.f & qe) !== 0 && (ue.f & (yt | Gt)) === 0 && (_t === null ? zi([e]) : _t.push(e)), !r.is_fork && hr.size > 0 && !Wa && Ei();
  }
  return t;
}
function Ei() {
  Wa = !1;
  for (const e of hr) {
    (e.f & qe) !== 0 && Pe(e, Ct);
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
  var n = a(e), r = t === 1 ? n++ : n--;
  return S(e, n), r;
}
function Jn(e) {
  S(e, e.v + 1);
}
function Va(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, i = 0; i < s; i++) {
      var l = r[i], u = l.f, o = (u & Be) === 0;
      if (o && Pe(l, t), (u & cr) !== 0)
        hr.add(
          /** @type {Effect} */
          l
        );
      else if ((u & Ye) !== 0) {
        var d = (
          /** @type {Derived} */
          l
        );
        Rt?.delete(d), (u & hn) === 0 && (u & wt && (ue === null || (ue.f & dr) === 0) && (l.f |= hn), Va(d, Ct, n));
      } else if (o) {
        var _ = (
          /** @type {Effect} */
          l
        );
        (u & At) !== 0 && Bt !== null && Bt.add(_), n !== null ? n.push(_) : Zr(_);
      }
    }
}
function ze(e) {
  if (typeof e != "object" || e === null || un in e)
    return e;
  const t = Ra(e);
  if (t !== As && t !== Rs)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Vr(e), s = /* @__PURE__ */ W(0), i = fn, l = (u) => {
    if (fn === i)
      return u();
    var o = ce, d = fn;
    xt(null), fa(i);
    var _ = u();
    return xt(o), fa(d), _;
  };
  return r && n.set("length", /* @__PURE__ */ W(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && Us();
        var _ = n.get(o);
        return _ === void 0 ? l(() => {
          var m = /* @__PURE__ */ W(d.value);
          return n.set(o, m), m;
        }) : S(_, d.value, !0), !0;
      },
      deleteProperty(u, o) {
        var d = n.get(o);
        if (d === void 0) {
          if (o in u) {
            const _ = l(() => /* @__PURE__ */ W(He));
            n.set(o, _), Jn(s);
          }
        } else
          S(d, He), Jn(s);
        return !0;
      },
      get(u, o, d) {
        if (o === un)
          return e;
        var _ = n.get(o), m = o in u;
        if (_ === void 0 && (!m || An(u, o)?.writable) && (_ = l(() => {
          var h = ze(m ? u[o] : He), v = /* @__PURE__ */ W(h);
          return v;
        }), n.set(o, _)), _ !== void 0) {
          var p = a(_);
          return p === He ? void 0 : p;
        }
        return Reflect.get(u, o, d);
      },
      getOwnPropertyDescriptor(u, o) {
        var d = Reflect.getOwnPropertyDescriptor(u, o);
        if (d && "value" in d) {
          var _ = n.get(o);
          _ && (d.value = a(_));
        } else if (d === void 0) {
          var m = n.get(o), p = m?.v;
          if (m !== void 0 && p !== He)
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
        if (o === un)
          return !0;
        var d = n.get(o), _ = d !== void 0 && d.v !== He || Reflect.has(u, o);
        if (d !== void 0 || ue !== null && (!_ || An(u, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var p = _ ? ze(u[o]) : He, h = /* @__PURE__ */ W(p);
            return h;
          }), n.set(o, d));
          var m = a(d);
          if (m === He)
            return !1;
        }
        return _;
      },
      set(u, o, d, _) {
        var m = n.get(o), p = o in u;
        if (r && o === "length")
          for (var h = d; h < /** @type {Source<number>} */
          m.v; h += 1) {
            var v = n.get(h + "");
            v !== void 0 ? S(v, He) : h in u && (v = l(() => /* @__PURE__ */ W(He)), n.set(h + "", v));
          }
        if (m === void 0)
          (!p || An(u, o)?.writable) && (m = l(() => /* @__PURE__ */ W(void 0)), S(m, ze(d)), n.set(o, m));
        else {
          p = m.v !== He;
          var w = l(() => ze(d));
          S(m, w);
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
        var o = Reflect.ownKeys(u).filter((m) => {
          var p = n.get(m);
          return p === void 0 || p.v !== He;
        });
        for (var [d, _] of n)
          _.v !== He && !(d in u) && o.push(d);
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
    if (e !== null && typeof e == "object" && un in e)
      return e[un];
  } catch {
  }
  return e;
}
function Mi(e, t) {
  return Object.is(ca(e), ca(t));
}
var pn, Xa, Ka, Ja;
function Ai() {
  if (pn === void 0) {
    pn = window, Xa = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ka = An(t, "firstChild").get, Ja = An(t, "nextSibling").get, la(e) && (e[zr] = void 0, e[Na] = null, e[Dr] = void 0, e.__e = void 0), la(n) && (n[jr] = void 0);
  }
}
function Ut(e = "") {
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
function Ze(e, t = !1) {
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
  ue === null && (ce === null && qs(), Hs()), Yt && js();
}
function Ni(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Wt(e, t) {
  var n = ue;
  n !== null && (n.f & rt) !== 0 && (e |= rt);
  var r = {
    ctx: Qe,
    deps: null,
    nodes: null,
    f: e | Be | wt,
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
    Tn !== null ? Tn.push(r) : nn.ensure().schedule(r);
  else if (t !== null) {
    try {
      Fn(r);
    } catch (l) {
      throw ot(r), l;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & Dn) === 0 && (s = s.first, (e & At) !== 0 && (e & Nn) !== 0 && s !== null && (s.f |= Nn));
  }
  if (s !== null && (s.parent = n, n !== null && Ni(s, n), ce !== null && (ce.f & Ye) !== 0 && (e & Gt) === 0)) {
    var i = (
      /** @type {Derived} */
      ce
    );
    (i.effects ??= []).push(s);
  }
  return r;
}
function Qr() {
  return ce !== null && !Pt;
}
function xr(e) {
  const t = Wt(yr, null);
  return Pe(t, qe), t.teardown = e, t;
}
function rn(e) {
  Ci();
  var t = (
    /** @type {Effect} */
    ue.f
  ), n = !ce && (t & yt) !== 0 && Qe !== null && !Qe.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Qe
    );
    (r.e ??= []).push(e);
  } else
    return Qa(e);
}
function Qa(e) {
  return Wt(Cn | Ns, e);
}
function Oi(e) {
  nn.ensure();
  const t = Wt(Gt | Dn, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? dn(t, () => {
      ot(t), r(void 0);
    }) : (ot(t), r(void 0));
  });
}
function es(e) {
  return Wt(Cn, e);
}
function Ii(e) {
  return Wt(Rn | Dn, e);
}
function ts(e, t = 0) {
  return Wt(yr | t, e);
}
function H(e, t = [], n = [], r = []) {
  _i(r, t, n, (s) => {
    Wt(yr, () => {
      e(...s.map(a));
    });
  });
}
function ea(e, t = 0) {
  var n = Wt(At | t, e);
  return n;
}
function bt(e) {
  return Wt(yt | Dn, e);
}
function ns(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Yt, r = ce;
    da(!0), xt(null);
    try {
      t.call(null);
    } finally {
      da(n), xt(r);
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
    var r = n.next;
    (n.f & Gt) !== 0 ? n.parent = null : ot(n, t), n = r;
  }
}
function Fi(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & yt) === 0 && ot(t), t = n;
  }
}
function ot(e, t = !0) {
  var n = !1;
  (t || (e.f & Cs) !== 0) && e.nodes !== null && e.nodes.end !== null && (Li(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Lr, ta(e, t && !n), Qn(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  ns(e), e.f ^= Lr, e.f |= ft;
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
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function dn(e, t, n = !0) {
  var r = [];
  as(e, r, !0);
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
function as(e, t, n) {
  if ((e.f & rt) === 0) {
    e.f ^= rt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var s = e.first; s !== null; ) {
      var i = s.next;
      if ((s.f & Gt) === 0) {
        var l = (s.f & Nn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (s.f & yt) !== 0 && (e.f & At) !== 0;
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
  if ((e.f & rt) !== 0) {
    e.f ^= rt, (e.f & qe) === 0 && (Pe(e, Be), nn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & Nn) !== 0 || (n.f & yt) !== 0;
      ss(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function na(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ tr(n);
      t.append(n), n = s;
    }
}
let or = !1, Yt = !1;
function da(e) {
  Yt = e;
}
let ce = null, Pt = !1;
function xt(e) {
  ce = e;
}
let ue = null;
function jt(e) {
  ue = e;
}
let Dt = null;
function is(e) {
  ce !== null && (Dt ??= /* @__PURE__ */ new Set()).add(e);
}
let lt = null, dt = 0, _t = null;
function zi(e) {
  _t = e;
}
let ls = 1, ln = 0, fn = ln;
function fa(e) {
  fn = e;
}
function os() {
  return ++ls;
}
function nr(e) {
  var t = e.f;
  if ((t & Be) !== 0)
    return !0;
  if (t & Ye && (e.f &= ~hn), (t & Ct) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
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
    (t & wt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Rt === null && Pe(e, qe);
  }
  return !1;
}
function us(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Dt !== null && Dt.has(e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & Ye) !== 0 ? us(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Pe(i, Be) : (i.f & qe) !== 0 && Pe(i, Ct), Zr(
        /** @type {Effect} */
        i
      ));
    }
}
function cs(e) {
  var t = lt, n = dt, r = _t, s = ce, i = Dt, l = Qe, u = Pt, o = fn, d = e.f;
  lt = /** @type {null | Value[]} */
  null, dt = 0, _t = null, ce = (d & (yt | Gt)) === 0 ? e : null, Dt = null, On(e.ctx), Pt = !1, fn = ++ln, e.ac !== null && (jn(() => {
    e.ac.abort(er);
  }), e.ac = null);
  try {
    e.f |= dr;
    var _ = (
      /** @type {Function} */
      e.fn
    ), m = _();
    e.f |= zn;
    var p = e.deps, h = be?.is_fork;
    if (lt !== null) {
      var v;
      if (h || Qn(e, dt), p !== null && dt > 0)
        for (p.length = dt + lt.length, v = 0; v < lt.length; v++)
          p[dt + v] = lt[v];
      else
        e.deps = p = lt;
      if (Qr() && (e.f & wt) !== 0)
        for (v = dt; v < p.length; v++)
          (p[v].reactions ??= []).push(e);
    } else !h && p !== null && dt < p.length && (Qn(e, dt), p.length = dt);
    if (La() && _t !== null && !Pt && p !== null && (e.f & (Ye | Ct | Be)) === 0)
      for (v = 0; v < /** @type {Source[]} */
      _t.length; v++)
        us(
          _t[v],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (ln++, s.deps !== null)
        for (let w = 0; w < n; w += 1)
          s.deps[w].rv = ln;
      if (t !== null)
        for (const w of t)
          w.rv = ln;
      _t !== null && (r === null ? r = _t : r.push(.../** @type {Source[]} */
      _t));
    }
    return (e.f & tn) !== 0 && (e.f ^= tn), m;
  } catch (w) {
    return za(w);
  } finally {
    e.f ^= dr, lt = t, dt = n, _t = r, ce = s, Dt = i, On(l), Pt = u, fn = o;
  }
}
function Di(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Es.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & Ye) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (lt === null || !ur.call(lt, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & wt) !== 0 && (i.f ^= wt, i.f &= ~hn), i.v !== He && Xr(i), i.ac !== null && jn(() => {
      i.ac.abort(er), i.ac = null, Pe(i, Be);
    }), yi(i), Qn(i, 0);
  }
}
function Qn(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Di(e, n[r]);
}
function Fn(e) {
  var t = e.f;
  if ((t & ft) === 0) {
    Pe(e, qe);
    var n = ue, r = or;
    ue = e, or = (t & (yt | Gt)) === 0;
    try {
      (t & (At | Ca)) !== 0 ? Fi(e) : ta(e), ns(e);
      var s = cs(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = ls;
      var i;
    } finally {
      or = r, ue = n;
    }
  }
}
function a(e) {
  var t = e.f, n = (t & Ye) !== 0;
  if (ce !== null && !Pt) {
    var r = ue !== null && (ue.f & ft) !== 0;
    if (!r && (Dt === null || !Dt.has(e))) {
      var s = ce.deps;
      if ((ce.f & dr) !== 0)
        e.rv < ln && (e.rv = ln, lt === null && s !== null && s[dt] === e ? dt++ : lt === null ? lt = [e] : lt.push(e));
      else {
        ce.deps ??= [], ur.call(ce.deps, e) || ce.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [ce] : ur.call(i, ce) || i.push(ce);
      }
    }
  }
  if (Yt && cn.has(e))
    return cn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Yt) {
      var u = l.v;
      return ((l.f & qe) === 0 && l.reactions !== null || fs(l)) && (u = Kr(l)), cn.set(l, u), u;
    }
    var o = (l.f & wt) === 0 && !Pt && ce !== null && (or || (ce.f & wt) !== 0), d = (l.f & zn) === 0;
    nr(l) && (o && (l.f |= wt), Ba(l)), o && !d && ($a(l), ds(l));
  }
  if (Rt?.has(e))
    return Rt.get(e);
  if ((e.f & tn) !== 0)
    throw e.v;
  return e.v;
}
function ds(e) {
  if (e.f |= wt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Ye) !== 0 && (t.f & wt) === 0 && ($a(
        /** @type {Derived} */
        t
      ), ds(
        /** @type {Derived} */
        t
      ));
}
function fs(e) {
  if (e.v === He) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (cn.has(t) || (t.f & Ye) !== 0 && fs(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function gn(e) {
  var t = Pt;
  try {
    return Pt = !0, e();
  } finally {
    Pt = t;
  }
}
const ji = ["touchstart", "touchmove"];
function Hi(e) {
  return ji.includes(e);
}
const Wn = Symbol("events"), hs = /* @__PURE__ */ new Set(), Br = /* @__PURE__ */ new Set();
function qi(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || $r.call(t, i), !i.cancelBubble)
      return jn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? $t(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Pn(e, t, n, r, s) {
  var i = { capture: r, passive: s }, l = qi(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && xr(() => {
    t.removeEventListener(e, l, i);
  });
}
function te(e, t, n) {
  (t[Wn] ??= {})[e] = n;
}
function Nt(e) {
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
  ), r = e.type, s = e.composedPath?.() || [], i = (
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
    var _ = ce, m = ue;
    xt(null), jt(null);
    try {
      for (var p, h = []; i !== null && i !== t; ) {
        try {
          var v = i[Wn]?.[r];
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
      e[Wn] = t, delete e.currentTarget, xt(_), jt(m);
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
    ue
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function N(e, t) {
  var n = (t & ni) !== 0, r = (t & ri) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = Ui(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ vr(s)));
    var l = (
      /** @type {TemplateNode} */
      r || Xa ? document.importNode(s, !0) : s.cloneNode(!0)
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
    var t = Ut(e + "");
    return gr(t, t), t;
  }
}
function ra() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Ut();
  return e.append(t, n), gr(t, n), e;
}
function P(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function T(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[jr] ??= e.nodeValue) && (e[jr] = n, e.nodeValue = `${n}`);
}
function Gi(e, t) {
  return Yi(e, t);
}
const ar = /* @__PURE__ */ new Map();
function Yi(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: l = !0, transformError: u }) {
  Ai();
  var o = void 0, d = Oi(() => {
    var _ = n ?? t.appendChild(Ut());
    pi(
      /** @type {TemplateNode} */
      _,
      {
        pending: () => {
        }
      },
      (h) => {
        ht({});
        var v = (
          /** @type {ComponentContext} */
          Qe
        );
        i && (v.c = i), s && (r.$$events = s), o = e(h, r) || {}, vt();
      },
      u
    );
    var m = /* @__PURE__ */ new Set(), p = (h) => {
      for (var v = 0; v < h.length; v++) {
        var w = h[v];
        if (!m.has(w)) {
          m.add(w);
          var c = Hi(w);
          for (const I of [t, document]) {
            var g = ar.get(I);
            g === void 0 && (g = /* @__PURE__ */ new Map(), ar.set(I, g));
            var y = g.get(w);
            y === void 0 ? (I.addEventListener(w, $r, { passive: c }), g.set(w, 1)) : g.set(w, y + 1);
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
          ), w = (
            /** @type {number} */
            v.get(h)
          );
          --w == 0 ? (c.removeEventListener(h, $r), v.delete(h), v.size === 0 && ar.delete(c)) : v.set(h, w);
        }
      Br.delete(p), _ !== n && _.parentNode?.removeChild(_);
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
        u && (ot(u.effect), this.#e.delete(l));
      }
      for (const [i, l] of this.#i) {
        if (i === n || this.#o.has(i)) continue;
        const u = () => {
          if (Array.from(this.#t.values()).includes(i)) {
            var d = document.createDocumentFragment();
            na(l, d), d.append(Ut()), this.#e.set(i, { effect: l, fragment: d });
          } else
            ot(l);
          this.#o.delete(i), this.#i.delete(i);
        };
        this.#r || !r ? (this.#o.add(i), dn(l, u, !1)) : u();
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
      be
    ), s = Za();
    if (n && !this.#i.has(t) && !this.#e.has(t))
      if (s) {
        var i = document.createDocumentFragment(), l = Ut();
        i.append(l), this.#e.set(t, {
          effect: bt(() => n(l)),
          fragment: i
        });
      } else
        this.#i.set(
          t,
          bt(() => n(this.anchor))
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
  var r = new Vi(e), s = n ? Nn : 0;
  function i(l, u) {
    r.ensure(l, u);
  }
  ea(() => {
    var l = !1;
    t((u, o = 0) => {
      l = !0, i(o, u);
    }), l || i(-1, null);
  }, s);
}
function mt(e, t) {
  return t;
}
function Xi(e, t, n) {
  for (var r = [], s = t.length, i, l = t.length, u = 0; u < s; u++) {
    let m = t[u];
    dn(
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
    var o = r.length === 0 && n !== null;
    if (o) {
      var d = (
        /** @type {Element} */
        n
      ), _ = (
        /** @type {Element} */
        d.parentNode
      );
      Ri(_), _.append(d), e.items.clear();
    }
    Ur(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function Ur(e, t, n = !0) {
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
      i.f |= zt;
      const l = document.createDocumentFragment();
      na(i, l);
    } else
      ot(t[s], n);
  }
}
var va;
function Ve(e, t, n, r, s, i = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & Oa) !== 0;
  if (o) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild(Ut());
  }
  var _ = null, m = /* @__PURE__ */ qa(() => {
    var I = n();
    return (
      /** @type {V[]} */
      Vr(I) ? I : I == null ? [] : wr(I)
    );
  }), p, h = /* @__PURE__ */ new Map(), v = !0;
  function w(I) {
    (y.effect.f & ft) === 0 && (y.pending.delete(I), y.fallback = _, Ki(y, p, l, t, r), _ !== null && (p.length === 0 ? (_.f & zt) === 0 ? pr(_) : (_.f ^= zt, Vn(_, null, l)) : dn(_, () => {
      _ = null;
    })));
  }
  function c(I) {
    y.pending.delete(I);
  }
  var g = ea(() => {
    p = /** @type {V[]} */
    a(m);
    for (var I = p.length, F = /* @__PURE__ */ new Set(), R = (
      /** @type {Batch} */
      be
    ), L = Za(), G = 0; G < I; G += 1) {
      var $ = p[G], j = r($, G), E = v ? null : u.get(j);
      E ? (E.v && In(E.v, $), E.i && In(E.i, G), L && R.unskip_effect(E.e)) : (E = Ji(
        u,
        v ? l : va ??= Ut(),
        $,
        j,
        G,
        s,
        t,
        n
      ), v || (E.e.f |= zt), u.set(j, E)), F.add(j);
    }
    if (I === 0 && i && !_ && (v ? _ = bt(() => i(l)) : (_ = bt(() => i(va ??= Ut())), _.f |= zt)), I > F.size && Ds(), !v)
      if (h.set(R, F), L) {
        for (const [A, C] of u)
          F.has(A) || R.skip_effect(C.e);
        R.oncommit(w), R.ondiscard(c);
      } else
        w(R);
    a(m);
  }), y = { effect: g, items: u, pending: h, outrogroups: null, fallback: _ };
  v = !1;
}
function Bn(e) {
  for (; e !== null && (e.f & yt) === 0; )
    e = e.next;
  return e;
}
function Ki(e, t, n, r, s) {
  var i = (r & Ks) !== 0, l = t.length, u = e.items, o = Bn(e.effect.first), d, _ = null, m, p = [], h = [], v, w, c, g;
  if (i)
    for (g = 0; g < l; g += 1)
      v = t[g], w = s(v, g), c = /** @type {EachItem} */
      u.get(w).e, (c.f & zt) === 0 && (c.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(c));
  for (g = 0; g < l; g += 1) {
    if (v = t[g], w = s(v, g), c = /** @type {EachItem} */
    u.get(w).e, e.outrogroups !== null)
      for (const E of e.outrogroups)
        E.pending.delete(c), E.done.delete(c);
    if ((c.f & rt) !== 0 && (pr(c), i && (c.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(c))), (c.f & zt) !== 0)
      if (c.f ^= zt, c === o)
        Vn(c, null, n);
      else {
        var y = _ ? _.next : o;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), Zt(e, _, c), Zt(e, c, y), Vn(c, y, n), _ = c, p = [], h = [], o = Bn(_.next);
        continue;
      }
    if (c !== o) {
      if (d !== void 0 && d.has(c)) {
        if (p.length < h.length) {
          var I = h[0], F;
          _ = I.prev;
          var R = p[0], L = p[p.length - 1];
          for (F = 0; F < p.length; F += 1)
            Vn(p[F], I, n);
          for (F = 0; F < h.length; F += 1)
            d.delete(h[F]);
          Zt(e, R.prev, L.next), Zt(e, _, R), Zt(e, L, I), o = I, _ = L, g -= 1, p = [], h = [];
        } else
          d.delete(c), Vn(c, o, n), Zt(e, c.prev, c.next), Zt(e, c, _ === null ? e.effect.first : _.next), Zt(e, _, c), _ = c;
        continue;
      }
      for (p = [], h = []; o !== null && o !== c; )
        (d ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = Bn(o.next);
      if (o === null)
        continue;
    }
    (c.f & zt) === 0 && p.push(c), _ = c, o = Bn(c.next);
  }
  if (e.outrogroups !== null) {
    for (const E of e.outrogroups)
      E.pending.size === 0 && (Ur(e, wr(E.done)), e.outrogroups?.delete(E));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || d !== void 0) {
    var G = [];
    if (d !== void 0)
      for (c of d)
        (c.f & rt) === 0 && G.push(c);
    for (; o !== null; )
      (o.f & rt) === 0 && o !== e.fallback && G.push(o), o = Bn(o.next);
    var $ = G.length;
    if ($ > 0) {
      var j = (r & Oa) !== 0 && l === 0 ? n : null;
      if (i) {
        for (g = 0; g < $; g += 1)
          G[g].nodes?.a?.measure();
        for (g = 0; g < $; g += 1)
          G[g].nodes?.a?.fix();
      }
      Xi(e, G, j);
    }
  }
  i && $t(() => {
    if (m !== void 0)
      for (c of m)
        c.nodes?.a?.apply();
  });
}
function Ji(e, t, n, r, s, i, l, u) {
  var o = (l & Vs) !== 0 ? (l & Js) === 0 ? /* @__PURE__ */ Si(n, !1, !1) : vn(n) : null, d = (l & Xs) !== 0 ? vn(s) : null;
  return {
    v: o,
    i: d,
    e: bt(() => (i(t, o ?? n, d ?? s, u), () => {
      e.delete(r);
    }))
  };
}
function Vn(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & zt) === 0 ? (
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
function Zt(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function $n(e, t, n) {
  es(() => {
    var r = gn(() => t(e, n?.()) || {});
    if (r?.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
const pa = [...` 	
\r\f \v\uFEFF`];
function Zi(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s of Object.keys(n))
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var i = s.length, l = 0; (l = r.indexOf(s, l)) >= 0; ) {
          var u = l + i;
          (l === 0 || pa.includes(r[l - 1])) && (u === r.length || pa.includes(r[u])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(u + 1) : l = u;
        }
  }
  return r === "" ? null : r;
}
function ga(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var s of Object.keys(e)) {
    var i = e[s];
    i != null && i !== "" && (r += " " + s + ": " + i + n);
  }
  return r;
}
function Qi(e, t) {
  if (t) {
    var n = "", r, s;
    return Array.isArray(t) ? (r = t[0], s = t[1]) : r = t, r && (n += ga(r)), s && (n += ga(s, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Ee(e, t, n, r, s, i) {
  var l = (
    /** @type {any} */
    e[zr]
  );
  if (l !== n || l === void 0) {
    var u = Zi(n, r, i);
    u == null ? e.removeAttribute("class") : e.className = u, e[zr] = n;
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
function on(e, t, n, r) {
  var s = (
    /** @type {any} */
    e[Dr]
  );
  if (s !== t) {
    var i = Qi(t, r);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[Dr] = t;
  } else r && (Array.isArray(r) ? (Rr(e, n?.[0], r[0]), Rr(e, n?.[1], r[1], "important")) : Rr(e, n, r));
  return r;
}
function Xn(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Vr(t))
      return ii();
    for (var r of e.options)
      r.selected = t.includes(_a(r));
    return;
  }
  for (r of e.options) {
    var s = _a(r);
    if (Mi(s, t)) {
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
function _a(e) {
  return "__value" in e ? e.__value : e.value;
}
const el = Symbol("is custom element"), tl = Symbol("is html"), nl = Fs ? "progress" : "PROGRESS";
function an(e, t) {
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
function le(e, t, n, r) {
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
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = Ms(s);
    for (var l in r)
      r[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    s = Ra(s);
  }
  return n;
}
function Pr(e, t) {
  return e === t || e?.[un] === t;
}
function _r(e = {}, t, n, r) {
  var s = (
    /** @type {ComponentContext} */
    Qe.r
  ), i = (
    /** @type {Effect} */
    ue
  );
  return es(() => {
    var l, u;
    return ts(() => {
      l = u, u = [], gn(() => {
        Pr(n(...u), e) || (t(e, ...u), l && Pr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== s && o.parent !== null && o.parent.f & Lr; )
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
function Gr(e, t) {
  fi(window, ["resize"], () => jn(() => t(window[e])));
}
function ae(e, t, n, r) {
  var s = !0, i = (n & ei) !== 0, l = (n & ti) !== 0, u = (
    /** @type {V} */
    r
  ), o = !0, d = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), _ = () => l && s ? (d ??= /* @__PURE__ */ Zn(
    /** @type {() => V} */
    r
  ), a(d)) : (o && (o = !1, u = l ? gn(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), u);
  let m;
  if (i) {
    var p = un in e || Os in e;
    m = An(e, t)?.set ?? (p && t in e ? (F) => e[t] = F : void 0);
  }
  var h, v = !1;
  i ? [h, v] = di(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && r !== void 0 && (h = _(), m && ($s(), m(h)));
  var w;
  if (w = () => {
    var F = (
      /** @type {V} */
      e[t]
    );
    return F === void 0 ? _() : (o = !0, F);
  }, (n & Qs) === 0)
    return w;
  if (m) {
    var c = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(F, R) {
        return arguments.length > 0 ? ((!R || c || v) && m(R ? w() : F), F) : w();
      })
    );
  }
  var g = !1, y = ((n & Zs) !== 0 ? Zn : qa)(() => (g = !1, w()));
  i && a(y);
  var I = (
    /** @type {Effect} */
    ue
  );
  return (
    /** @type {() => V} */
    (function(F, R) {
      if (arguments.length > 0) {
        const L = R ? a(y) : i ? ze(F) : F;
        return S(y, L), g = !0, u !== void 0 && (u = L), F;
      }
      return Yt && g || (I.f & ft) !== 0 ? y.v : a(y);
    })
  );
}
function Hn(e) {
  Qe === null && Ls(), rn(() => {
    const t = gn(e);
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
  for (const [r, s] of Object.entries(e))
    if (s != null)
      if (Array.isArray(s))
        for (const i of s) t.append(r, String(i));
      else
        t.set(r, String(s));
  const n = t.toString();
  return n ? "?" + n : "";
}
async function qt(e, t = {}) {
  const n = await fetch(e + il(t));
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
function ma(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const je = {
  // --- reads
  photos: (e) => qt("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => qt("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => qt("/api/triage/counts", { ...ma(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => qt("/api/triage/files"),
  screen: (e, t = {}) => qt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => qt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => qt("/api/triage/page", { ...ma(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => qt("/api/triage/probe"),
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
  rebuildStatus: () => qt("/api/triage/rebuild")
};
function ll() {
  let e = 0, t = 0;
  return async function(r) {
    const s = ++e, i = await r();
    return s <= t ? { stale: !0, value: void 0 } : (t = s, { stale: !1, value: i });
  };
}
function ol(e, t) {
  let n = 0;
  const r = (...s) => {
    clearTimeout(n), n = setTimeout(() => e(...s), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...s) => {
    clearTimeout(n), e(...s);
  }, r;
}
const wa = ["B", "KB", "MB", "GB", "TB"];
function Tt(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < wa.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${wa[n]}`;
}
function Me(e) {
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
  const n = e.slice(0, t), r = Ln.toLowerCase();
  return n.toLowerCase().startsWith(r + "\\") ? n : "";
}
function sa(e, t) {
  const n = t.toLowerCase();
  return e.some((r) => n === r || n.startsWith(r + "\\"));
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
    (r) => r.term && r.term.column === t.column && r.term.op === t.op && cl(r.term.value, t.value)
  );
  return n ? n.decision : null;
}
var dl = /* @__PURE__ */ N('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), fl = /* @__PURE__ */ N('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), hl = /* @__PURE__ */ N('<div class="line muted svelte-1vgp6n7">…</div>'), vl = /* @__PURE__ */ N('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), pl = /* @__PURE__ */ N('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), gl = /* @__PURE__ */ N('<div class="line muted svelte-1vgp6n7"> </div>'), _l = /* @__PURE__ */ N('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function bl(e, t) {
  ht(t, !0);
  let n = ae(t, "counts", 3, null), r = ae(t, "files", 3, null), s = ae(t, "filesAt", 3, null), i = ae(t, "stale", 3, !1), l = ae(t, "candidate", 3, null), u = ae(t, "busy", 3, !1);
  const o = /* @__PURE__ */ re(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = _l(), _ = f(d);
  let m;
  var p = b(f(_), 2);
  {
    var h = (j) => {
      var E = fl(), A = Ze(E), C = f(A), q = f(C), V = b(C, 2), Y = f(V), U = b(V, 4), ee = f(U), he = b(U, 2), Q = f(he), B = b(A, 2);
      {
        var O = (X) => {
          var x = dl(), k = b(f(x), 2), D = f(k), ne = b(k, 2), xe = f(ne), ie = b(ne, 4), ve = f(ie), Ue = b(ie, 2), pe = f(Ue), Se = b(Ue, 2), We = f(Se);
          H(
            (Ge, ut, de, oe, ke) => {
              T(D, `kept ${Ge ?? ""}`), T(xe, ut), T(ve, `excluded ${de ?? ""}`), T(pe, oe), T(We, `${a(o) >= 0 ? "+" : ""}${ke ?? ""} excluded`);
            },
            [
              () => Me(n().candidate_kept_paths),
              () => Tt(n().candidate_kept_bytes),
              () => Me(n().candidate_excluded_paths),
              () => Tt(n().candidate_excluded_bytes),
              () => Me(a(o))
            ]
          ), P(X, x);
        };
        K(B, (X) => {
          l() && X(O);
        });
      }
      H(
        (X, x, k, D) => {
          T(q, `kept ${X ?? ""}`), T(Y, x), T(ee, `excluded ${k ?? ""}`), T(Q, D);
        },
        [
          () => Me(n().kept_paths),
          () => Tt(n().kept_bytes),
          () => Me(n().excluded_paths),
          () => Tt(n().excluded_bytes)
        ]
      ), P(j, E);
    }, v = (j) => {
      var E = hl();
      P(j, E);
    };
    K(p, (j) => {
      n() ? j(h) : j(v, -1);
    });
  }
  var w = b(_, 2);
  let c;
  var g = f(w), y = b(f(g), 3), I = f(y), F = b(y, 2);
  {
    var R = (j) => {
      var E = vl();
      P(j, E);
    };
    K(F, (j) => {
      i() && r() && r() !== "loading" && j(R);
    });
  }
  var L = b(g, 2);
  {
    var G = (j) => {
      var E = pl(), A = Ze(E);
      let C;
      var q = f(A), V = f(q), Y = b(q, 2), U = f(Y), ee = b(Y, 4), he = f(ee), Q = b(ee, 2), B = f(Q), O = b(A, 2), X = f(O);
      H(
        (x, k, D, ne) => {
          C = Ee(A, 1, "line svelte-1vgp6n7", null, C, { outdated: i() }), T(V, `kept ${x ?? ""}`), T(U, k), T(he, `excluded ${D ?? ""}`), T(B, ne), T(X, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Me(r().kept_files),
          () => Tt(r().kept_bytes),
          () => Me(r().excluded_files),
          () => Tt(r().excluded_bytes)
        ]
      ), P(j, E);
    }, $ = (j) => {
      var E = gl(), A = f(E);
      H(() => T(A, r() === "loading" ? "counting…" : "not counted yet")), P(j, E);
    };
    K(L, (j) => {
      r() && r() !== "loading" ? j(G) : j($, -1);
    });
  }
  H(() => {
    m = Ee(_, 1, "block svelte-1vgp6n7", null, m, { busy: u() }), c = Ee(w, 1, "block svelte-1vgp6n7", null, c, { busy: r() === "loading" }), y.disabled = r() === "loading", T(I, r() === "loading" ? "counting…" : "recount");
  }), te("click", y, function(...j) {
    t.onfiles?.apply(this, j);
  }), P(e, d), vt();
}
Nt(["click"]);
const Yr = "http://www.w3.org/2000/svg", sn = {
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
}, en = {
  ...sn,
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
  { dark: "tint", light: "tintLight", base: sn },
  { dark: "control", light: "controlLight", base: en },
  { dark: "ink", light: "inkLight", base: en },
  { dark: "tally", light: "tallyLight", base: en },
  { dark: "tallyInk", light: "tallyInkLight", base: en }
], Wr = /* @__PURE__ */ new Set();
let Mt = { ...en };
function wl() {
  return Mt;
}
function Cr(e) {
  Mt = kl(e), ia();
  for (const t of Wr) t(Mt);
  return Mt;
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
    r: $e(Kn(e.r, t.r), 0, 255),
    g: $e(Kn(e.g, t.g), 0, 255),
    b: $e(Kn(e.b, t.b), 0, 255),
    a: $e(Kn(e.a, t.a), 0, 1)
  };
}
function kl(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [r, s] of Object.entries(en))
    typeof s == "boolean" ? n[r] = t[r] === void 0 ? s : !!t[r] : typeof s == "object" ? n[r] = xl(t[r], s) : n[r] = Kn(t[r], s);
  return n;
}
function gt({ r: e, g: t, b: n, a: r }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Re(r, 3)})`;
}
function Re(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function xa({ r: e, g: t, b: n, a: r }) {
  return { r: e, g: t, b: n, a: $e(r * 1.7 + 0.22, 0, 1) };
}
function ka(e, t) {
  const n = 0.4 + $e(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - $e(t, 0, 100) / 100) };
}
function Sa(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, s = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? $e(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * s * Math.max(t.glareFactor, 0) / 100;
  return $e(i ** (0.1 + $e(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const Sl = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function El(e, t, n) {
  const r = $e(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), u = s - l, o = i - l, d = 8, _ = [];
  for (let h = 0; h <= d; h++) {
    const v = h / d * (Math.PI / 2);
    _.push([l * Math.cos(v) ** (2 / r), l * Math.sin(v) ** (2 / r)]);
  }
  const m = [], p = (h, v, w, c) => {
    let g = Math.atan2(h, -v);
    g < 0 && (g += Math.PI * 2);
    let y = Math.atan2(c, w);
    y < 0 && (y += Math.PI * 2);
    const I = Re(Sa(y, n), 3);
    m.push(`rgba(255, 255, 255, ${I}) ${Re(g / (Math.PI * 2) * 100, 2)}%`);
  };
  p(0, -i, 0, 1);
  for (const [h, v, w] of Sl)
    for (let c = 0; c <= d; c++) {
      const [g, y] = _[w ? d - c : c];
      p(h * (u + g), v * (o + y), h * g ** (r - 1), -v * y ** (r - 1));
    }
  return m.push(`rgba(255, 255, 255, ${Re(Sa(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function ia() {
  const e = Mt, t = document.documentElement.style, n = ka(e.refFresnelRange, e.refFresnelHardness), r = ka(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Re(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Re(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", gt(e.tint)), t.setProperty("--glass-tint-light", gt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", gt(xa(e.tint))), t.setProperty("--glass-tint-sheet-light", gt(xa(e.tintLight))), t.setProperty("--glass-ctl-dark", gt(e.control)), t.setProperty("--glass-ctl-light", gt(e.controlLight)), t.setProperty("--glass-text-dark", gt(e.ink)), t.setProperty("--glass-text-light", gt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", gt(e.tally)), t.setProperty("--glass-tint-tally-light", gt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", gt(e.tallyInk)), t.setProperty("--glass-text-tally-light", gt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Re(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Re(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Re(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Re(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Re(e.shadowX)}px ${Re(-e.shadowY)}px ${Re(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Re($e(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Re(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Re(Math.log2($e(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Re(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Re(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Re($e(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Re(r.width)}px`), t.setProperty("--glass-glare-blur", `${Re(r.blur)}px`);
}
function $e(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function Tl(e, t, n, r, s, i) {
  const l = Math.abs(e) - n + s, u = Math.abs(t) - r + s, o = Math.max(l, 0), d = Math.max(u, 0), _ = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + _ - s;
}
function Ml(e, t, n) {
  const r = e / 2, s = t / 2, i = $e(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (p, h) => Tl(p - r, h - s, r, s, l, i), _ = 256, m = new Float32Array(_ + 1);
  for (let p = 0; p <= _; p++) {
    const h = 1 - p / _, v = Math.asin($e(h * h, 0, 1)), w = Math.asin($e(Math.sin(v) / o, 0, 1));
    m[p] = Math.tan(v - w) * u;
  }
  return (p, h) => {
    const v = -d(p, h);
    if (v < 0 || v >= u) return null;
    const w = m[Math.round(v / u * _)];
    if (w === 0) return null;
    const c = 0.75, g = d(p + c, h) - d(p - c, h), y = d(p, h + c) - d(p, h - c), I = Math.hypot(g, y);
    if (I === 0) return null;
    const F = -w / I;
    return { dx: g * F, dy: y * F };
  };
}
function Al(e, t, n) {
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
  const m = _ > 0 ? 127 / _ : 0;
  for (let p = 0; p < u; p++) {
    const h = p * 4;
    l[h] = 128 + $e(Math.round(o[p] * m), -127, 127), l[h + 1] = 128 + $e(Math.round(d[p] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: r.toDataURL(), scale: _ * 2 };
}
const Nr = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function Or(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Re(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
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
  let r = 0, s = 0, i = 0, l = 0;
  const u = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, d = "";
  function _() {
    e.style.setProperty("--glass-pre", Mt.blurEdge ? "" : d), e.style.setProperty("--glass-post", Mt.blurEdge ? d : "");
  }
  function m() {
    r < 2 || s < 2 || e.style.setProperty("--glass-glare", El(r, s, Mt));
  }
  function p() {
    if (r < 2 || s < 2) return;
    const c = Mt, g = Al(r, s, Ml(r, s, c)), y = c.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(r)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${r}" height="${s}" preserveAspectRatio="none" href="${g.url}" result="map"/>` + Or(g.scale * (1 + y), Nr[0], "r") + Or(g.scale, Nr[1], "g") + Or(g.scale * (1 - y), Nr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, _(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", _()), o = u.map((I) => Mt[I]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, p();
    }));
  }
  const v = new ResizeObserver(([c]) => {
    const g = c.borderBoxSize?.[0], y = g ? { w: Math.round(g.inlineSize), h: Math.round(g.blockSize) } : { w: Math.round(c.contentRect.width), h: Math.round(c.contentRect.height) };
    y.w === r && y.h === s || (r = y.w, s = y.h, m(), h());
  });
  v.observe(e);
  const w = yl(() => {
    m(), u.map((c) => Mt[c]).join(" ") !== o ? h() : _();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), v.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
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
var Il = /* @__PURE__ */ N('<strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <span class="muted sep svelte-zne36e">·</span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span>', 1), Fl = /* @__PURE__ */ N('<strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span>', 1), Ll = /* @__PURE__ */ N('<span class="spin svelte-zne36e" aria-label="loading"></span>'), Ea = /* @__PURE__ */ N('<span class="badge svelte-zne36e"> </span>'), zl = /* @__PURE__ */ N('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Dl = /* @__PURE__ */ N('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), jl = /* @__PURE__ */ N("<button> </button>"), Hl = /* @__PURE__ */ N('<div class="glass sheet sorts svelte-zne36e"></div>'), ql = /* @__PURE__ */ N(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), Bl = /* @__PURE__ */ N('<p class="muted svelte-zne36e">loading…</p>'), $l = /* @__PURE__ */ N('<span class="help svelte-zne36e">?</span>'), Ul = /* @__PURE__ */ N('<span class="n svelte-zne36e"> </span>'), Gl = /* @__PURE__ */ N("<button> <!></button>"), Yl = /* @__PURE__ */ N('<span class="muted svelte-zne36e">nothing here</span>'), Wl = /* @__PURE__ */ N('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Vl = /* @__PURE__ */ N('<div class="glass sheet filters svelte-zne36e"><!></div>'), Xl = /* @__PURE__ */ N('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><!> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function Kl(e, t) {
  ht(t, !0);
  let n = ae(t, "facets", 3, null), r = ae(t, "selected", 19, () => ({})), s = ae(t, "sort", 3, "newest"), i = ae(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = ae(t, "total", 3, null), u = ae(t, "tiles", 3, null), o = ae(t, "loading", 3, !1), d = ae(t, "onselect", 3, () => {
  }), _ = ae(t, "onsort", 3, () => {
  }), m = ae(t, "onstack", 3, () => {
  }), p = ae(t, "onclear", 3, () => {
  }), h = ae(t, "ontriage", 3, () => {
  }), v = /* @__PURE__ */ W(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), w = /* @__PURE__ */ W(ze(ys())), c = /* @__PURE__ */ W(null);
  const g = /* @__PURE__ */ re(() => n()?.dimensions ?? []), y = /* @__PURE__ */ re(() => n()?.sorts ?? []), I = /* @__PURE__ */ re(() => a(y).find((z) => z.value === s())?.label ?? s()), F = /* @__PURE__ */ re(() => Object.values(r()).reduce((z, Z) => z + Z.length, 0)), R = /* @__PURE__ */ re(() => a(g).flatMap((z) => (r()[z.name] ?? []).map((Z) => ({
    dimension: z.name,
    value: Z,
    title: z.title,
    label: z.options.find((se) => se.value === Z)?.label ?? String(Z)
  }))));
  function L(z, Z) {
    const se = r()[z] ?? [], we = se.includes(Z) ? se.filter((ge) => ge !== Z) : [...se, Z];
    d()(z, we);
  }
  function G(z, Z) {
    return (r()[z] ?? []).includes(Z);
  }
  function $() {
    S(w, xs(a(w) === "dark" ? "light" : "dark"), !0);
  }
  let j = /* @__PURE__ */ W(null);
  const E = /* @__PURE__ */ re(() => a(j) ?? i().window);
  function A(z) {
    S(j, Number(z), !0);
  }
  function C(z) {
    S(j, null), m()({ ...i(), window: Number(z) });
  }
  rn(() => {
    a(v) !== "stacks" && S(j, null);
  });
  function q(z) {
    z.key === "Escape" && S(v, "");
  }
  function V(z) {
    a(v) && !z.target.closest(".topbar") && S(v, "");
  }
  Hn(() => {
    const z = new ResizeObserver(([Z]) => {
      const se = Math.round(Z.borderBoxSize?.[0]?.blockSize ?? Z.contentRect.height);
      document.documentElement.style.setProperty("--header-h", se + "px");
    });
    return z.observe(a(c)), () => {
      z.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var Y = Xl();
  Pn("keydown", pn, q), Pn("pointerdown", pn, V);
  var U = f(Y), ee = f(U);
  {
    var he = (z) => {
      var Z = Il(), se = Ze(Z), we = f(se), ge = b(se, 2), fe = f(ge), ye = b(ge, 4), De = f(ye), Ne = b(ye, 2), me = f(Ne);
      H(
        (tt, Ie) => {
          T(we, tt), T(fe, l() === 1 ? "stack" : "stacks"), T(De, Ie), T(me, u() === 1 ? "photo" : "photos");
        },
        [() => Me(l()), () => Me(u())]
      ), P(z, Z);
    }, Q = (z) => {
      var Z = Fl(), se = Ze(Z), we = f(se), ge = b(se, 2), fe = f(ge);
      H(
        (ye) => {
          T(we, ye), T(fe, l() === 1 ? "photo" : "photos");
        },
        [() => l() === null ? "…" : Me(l())]
      ), P(z, Z);
    };
    K(ee, (z) => {
      u() !== null ? z(he) : z(Q, -1);
    });
  }
  var B = b(ee, 2);
  {
    var O = (z) => {
      var Z = Ll();
      P(z, Z);
    };
    K(B, (z) => {
      o() && z(O);
    });
  }
  $n(U, (z) => Gn?.(z));
  var X = b(U, 2), x = f(X), k = f(x), D = f(k);
  let ne;
  var xe = f(D), ie = b(D, 2);
  let ve;
  var Ue = b(f(ie));
  {
    var pe = (z) => {
      var Z = Ea(), se = f(Z);
      H(() => T(se, a(F))), P(z, Z);
    };
    K(Ue, (z) => {
      a(F) && z(pe);
    });
  }
  var Se = b(ie, 2);
  let We;
  var Ge = b(f(Se));
  {
    var ut = (z) => {
      var Z = Ea(), se = f(Z);
      H((we) => T(se, we), [() => Me(l())]), P(z, Z);
    };
    K(Ge, (z) => {
      i().on && l() !== null && z(ut);
    });
  }
  var de = b(Se, 2);
  {
    var oe = (z) => {
      var Z = Dl(), se = f(Z);
      Ve(se, 17, () => a(R), (ge) => ge.dimension + " " + ge.value, (ge, fe) => {
        var ye = zl(), De = f(ye), Ne = f(De), me = b(De, 1, !0);
        H(() => {
          le(ye, "title", `${a(fe).title ?? ""}: ${a(fe).label ?? ""} — click to remove`), T(Ne, a(fe).title), T(me, a(fe).label);
        }), te("click", ye, () => L(a(fe).dimension, a(fe).value)), P(ge, ye);
      });
      var we = b(se, 2);
      te("click", we, () => p()()), P(z, Z);
    };
    K(de, (z) => {
      a(R).length && z(oe);
    });
  }
  var ke = b(k, 2), Ce = f(ke), et = b(ke, 2);
  $n(x, (z) => Gn?.(z));
  var Xe = b(x, 2);
  {
    var ct = (z) => {
      var Z = Hl();
      Ve(Z, 21, () => a(y), mt, (se, we) => {
        var ge = jl();
        let fe;
        var ye = f(ge);
        H(() => {
          fe = Ee(ge, 1, "option svelte-zne36e", null, fe, { on: a(we).value === s() }), T(ye, a(we).label);
        }), te("click", ge, () => {
          _()(a(we).value), S(v, "");
        }), P(se, ge);
      }), $n(Z, (se) => Gn?.(se)), P(z, Z);
    };
    K(Xe, (z) => {
      a(v) === "sort" && z(ct);
    });
  }
  var kt = b(Xe, 2);
  {
    var Ot = (z) => {
      var Z = ql(), se = f(Z), we = b(f(se), 2), ge = f(we);
      let fe;
      var ye = f(ge), De = b(se, 2), Ne = b(f(De), 2), me = f(Ne), tt = b(me, 2), Ie = f(tt);
      $n(Z, (Ae) => Gn?.(Ae)), H(() => {
        fe = Ee(ge, 1, "option svelte-zne36e", null, fe, { on: i().on }), le(ge, "aria-checked", i().on), T(ye, i().on ? "On" : "Off"), le(me, "min", _s), le(me, "max", bs), an(me, a(E)), le(me, "aria-valuetext", `${a(E) ?? ""} seconds`), T(Ie, `${a(E) ?? ""}s`);
      }), te("click", ge, () => m()({ ...i(), on: !i().on })), te("input", me, (Ae) => A(Ae.currentTarget.value)), te("change", me, (Ae) => C(Ae.currentTarget.value)), P(z, Z);
    };
    K(kt, (z) => {
      a(v) === "stacks" && z(Ot);
    });
  }
  var Vt = b(kt, 2);
  {
    var pt = (z) => {
      var Z = Vl(), se = f(Z);
      {
        var we = (fe) => {
          var ye = Bl();
          P(fe, ye);
        }, ge = (fe) => {
          var ye = ra(), De = Ze(ye);
          Ve(De, 17, () => a(g), mt, (Ne, me) => {
            var tt = Wl(), Ie = f(tt), Ae = f(Ie), Xt = b(Ae);
            {
              var It = (Oe) => {
                var Fe = $l();
                H(() => le(Fe, "title", a(me).hint)), P(Oe, Fe);
              };
              K(Xt, (Oe) => {
                a(me).hint && Oe(It);
              });
            }
            var M = b(Ie, 2), J = f(M);
            Ve(J, 17, () => a(me).options, mt, (Oe, Fe) => {
              var St = Gl();
              let Ht;
              var at = f(St), _n = b(at);
              {
                var bn = (Le) => {
                  var st = Ul(), Ft = f(st);
                  H((Lt) => T(Ft, Lt), [() => Me(a(Fe).count)]), P(Le, st);
                };
                K(_n, (Le) => {
                  a(Fe).count !== null && Le(bn);
                });
              }
              H(
                (Le) => {
                  Ht = Ee(St, 1, "option svelte-zne36e", null, Ht, Le), T(at, `${a(Fe).label ?? ""} `);
                },
                [
                  () => ({ on: G(a(me).name, a(Fe).value) })
                ]
              ), te("click", St, () => L(a(me).name, a(Fe).value)), P(Oe, St);
            });
            var _e = b(J, 2);
            {
              var Ke = (Oe) => {
                var Fe = Yl();
                P(Oe, Fe);
              };
              K(_e, (Oe) => {
                a(me).options.length || Oe(Ke);
              });
            }
            H(() => T(Ae, `${a(me).title ?? ""} `)), P(Ne, tt);
          }), P(fe, ye);
        };
        K(se, (fe) => {
          n() ? fe(ge, -1) : fe(we);
        });
      }
      $n(Z, (fe) => Gn?.(fe)), P(z, Z);
    };
    K(Vt, (z) => {
      a(v) === "filters" && z(pt);
    });
  }
  _r(Y, (z) => S(c, z), () => a(c)), H(() => {
    ne = Ee(D, 1, "menu svelte-zne36e", null, ne, { open: a(v) === "sort" }), le(D, "aria-expanded", a(v) === "sort"), T(xe, a(I)), ve = Ee(ie, 1, "menu svelte-zne36e", null, ve, { open: a(v) === "filters", on: a(F) > 0 }), le(ie, "aria-expanded", a(v) === "filters"), We = Ee(Se, 1, "menu svelte-zne36e", null, We, { open: a(v) === "stacks", on: i().on }), le(Se, "aria-expanded", a(v) === "stacks"), le(ke, "title", a(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), le(ke, "aria-label", a(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), T(Ce, a(w) === "dark" ? "☀" : "☾");
  }), te("click", D, () => S(v, a(v) === "sort" ? "" : "sort", !0)), te("click", ie, () => S(v, a(v) === "filters" ? "" : "filters", !0)), te("click", Se, () => S(v, a(v) === "stacks" ? "" : "stacks", !0)), te("click", ke, $), te("click", et, () => h()()), P(e, Y), vt();
}
Nt(["click", "input", "change"]);
const Et = 4, br = 220, Jl = 340;
function mr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Zl(e, t, n, r, s) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, u = 0, o = 1 / 0;
    for (; l < e.length && (u += mr(e[l]), l++, o = (n - Et * (l - i - 1)) / u, !(o <= br)); )
      ;
    if (o > br && !r) break;
    s(i, l, Math.round(Math.min(o, Jl))), i = l;
  }
  return i;
}
function Ta(e, t, n) {
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
var Ql = /* @__PURE__ */ N('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), eo = /* @__PURE__ */ N('<div class="glass pane svelte-5g1i2z" role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div></div>');
function to(e, t) {
  ht(t, !0);
  let n = ae(t, "frames", 19, () => []), r = ae(t, "origin", 3, null), s = ae(t, "onreveal", 3, () => {
  }), i = ae(t, "onclose", 3, () => {
  });
  const l = 40, u = /* @__PURE__ */ re(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let o = /* @__PURE__ */ W(0), d = /* @__PURE__ */ W(0), _ = /* @__PURE__ */ W(null), m = /* @__PURE__ */ W(ze(/* @__PURE__ */ new Set()));
  const p = 4, h = 25, v = { x: 0, y: 0, w: 0, h: 0 }, w = /* @__PURE__ */ re(() => Math.max(0, a(o) - l * 2)), c = /* @__PURE__ */ re(() => Math.max(0, a(d) - l * 2)), g = /* @__PURE__ */ re(() => a(w) > 0 && a(c) > 0 ? R(n(), a(w), a(c)) : n().map(() => v));
  function y(A, C, q) {
    const V = [];
    let Y = 0, U = 0;
    for (let ee = 0; ee < A.length; ee++)
      U += mr(A[ee]), U * q + Et * (ee - Y) >= C && (V.push({ from: Y, to: ee + 1, sum: U }), Y = ee + 1, U = 0);
    return Y < A.length && V.push({ from: Y, to: A.length, sum: U }), V;
  }
  function I(A, C, q) {
    return A.map((V, Y) => {
      const U = (C - Et * (V.to - V.from - 1)) / V.sum;
      return Y === A.length - 1 && U > q ? q : U;
    });
  }
  function F(A, C, q) {
    return I(A, C, q).reduce((V, Y) => V + Y, 0) + Et * (A.length - 1);
  }
  function R(A, C, q) {
    let V = p, Y = Math.max(p, q);
    for (let B = 0; B < h; B++) {
      const O = (V + Y) / 2;
      F(y(A, C, O), C, O) <= q ? V = O : Y = O;
    }
    const U = y(A, C, V), ee = I(U, C, V), he = [];
    let Q = (q - (ee.reduce((B, O) => B + O, 0) + Et * (U.length - 1))) / 2;
    return U.forEach((B, O) => {
      const X = ee[O], x = [];
      for (let ne = B.from; ne < B.to; ne++) x.push(mr(A[ne]) * X);
      const k = x.reduce((ne, xe) => ne + xe, 0) + Et * (x.length - 1);
      let D = (C - k) / 2;
      for (const ne of x)
        he.push({
          x: Math.round(D),
          y: Math.round(Q),
          w: Math.round(ne),
          h: Math.round(X)
        }), D += ne + Et;
      Q += X + Et;
    }), he;
  }
  function L(A) {
    if (!r() || !A || !A.w || !A.h) return "none";
    const C = r().left - (l + A.x), q = r().top - (l + A.y);
    return `translate(${C}px, ${q}px) scale(${r().width / A.w}, ${r().height / A.h})`;
  }
  function G(A) {
    A.key === "Escape" && i()();
  }
  function $(A) {
    A.target.closest(".frame") || i()();
  }
  Hn(() => {
    const A = document.activeElement;
    return a(_)?.focus(), () => {
      A instanceof HTMLElement && document.contains(A) && A.focus();
    };
  });
  var j = eo();
  Pn("keydown", pn, G), Pn("pointerdown", pn, $);
  var E = f(j);
  on(E, "", {}, { inset: "40px" }), Ve(E, 23, n, (A) => A.id, (A, C, q) => {
    var V = Ql();
    let Y;
    var U = f(V);
    let ee;
    H(
      (he, Q) => {
        Y = on(V, "", Y, he), le(U, "src", `/d/${a(C).s ?? ""}.webp`), ee = Ee(U, 1, "svelte-5g1i2z", null, ee, Q);
      },
      [
        () => ({
          left: `${a(g)[a(q)].x ?? ""}px`,
          top: `${a(g)[a(q)].y ?? ""}px`,
          width: `${a(g)[a(q)].w ?? ""}px`,
          height: `${a(g)[a(q)].h ?? ""}px`,
          "--flight": L(a(g)[a(q)])
        }),
        () => ({ loaded: a(m).has(a(C).id) })
      ]
    ), te("click", V, () => s()(a(C))), Pn("load", U, () => S(m, new Set(a(m)).add(a(C).id), !0)), P(A, V);
  }), _r(j, (A) => S(_, A), () => a(_)), H(() => le(j, "aria-label", a(u))), Gr("innerWidth", (A) => S(o, A, !0)), Gr("innerHeight", (A) => S(d, A, !0)), P(e, j), vt();
}
Nt(["click"]);
var no = /* @__PURE__ */ N('<span class="err svelte-uzy12d"> </span>'), ro = /* @__PURE__ */ N(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), ao = /* @__PURE__ */ N(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), so = /* @__PURE__ */ N('<span class="muted svelte-uzy12d"> </span>'), io = /* @__PURE__ */ N('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function lo(e, t) {
  ht(t, !0);
  let n = /* @__PURE__ */ W(null), r = /* @__PURE__ */ W(!1), s = /* @__PURE__ */ W(null);
  async function i() {
    S(r, !0), S(s, null);
    try {
      S(n, await je.probe(), !0);
    } catch (h) {
      S(s, String(h), !0);
    } finally {
      S(r, !1);
    }
  }
  var l = io(), u = f(l), o = f(u), d = b(u, 2);
  {
    var _ = (h) => {
      var v = no(), w = f(v);
      H(() => T(w, a(s))), P(h, v);
    }, m = (h) => {
      var v = ra(), w = Ze(v);
      {
        var c = (y) => {
          var I = ro(), F = b(f(I), 2);
          H(
            (R) => T(F, ` above are formats the header
        reader cannot measure (${R ?? ""}) or files with no
        extension.`),
            [() => a(n).formats.join(" ")]
          ), P(y, I);
        }, g = (y) => {
          var I = ao(), F = f(I), R = f(F), L = b(F, 2), G = f(L);
          H(
            ($) => {
              T(R, $), T(G, a(n).command);
            },
            [() => Me(a(n).worklist)]
          ), P(y, I);
        };
        K(w, (y) => {
          a(n).worklist === 0 ? y(c) : y(g, -1);
        });
      }
      P(h, v);
    }, p = (h) => {
      var v = so(), w = f(v);
      H(() => T(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), P(h, v);
    };
    K(d, (h) => {
      a(s) ? h(_) : a(n) ? h(m, 1) : h(p, -1);
    });
  }
  H(() => {
    u.disabled = a(r), T(o, a(r) ? "counting…" : "Check the dimension probe's worklist");
  }), te("click", u, i), P(e, l), vt();
}
Nt(["click"]);
var oo = /* @__PURE__ */ N('<p class="bad svelte-1xjbga"> </p>'), uo = /* @__PURE__ */ N('<pre class="svelte-1xjbga"> </pre>'), co = /* @__PURE__ */ N('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), fo = /* @__PURE__ */ N(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), ho = /* @__PURE__ */ N('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), vo = /* @__PURE__ */ N('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), po = /* @__PURE__ */ N(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), go = /* @__PURE__ */ N('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), _o = /* @__PURE__ */ N(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function bo(e, t) {
  ht(t, !0);
  let n = /* @__PURE__ */ W(null), r = /* @__PURE__ */ W(!1), s = /* @__PURE__ */ W(null), i = /* @__PURE__ */ W(null);
  const l = /* @__PURE__ */ re(() => a(n)?.state === "running"), u = /* @__PURE__ */ re(() => a(n)?.snapshot ? a(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const y = await je.rebuildStatus();
      S(n, y, !0), S(s, null), y.state === "done" && y.started_at !== a(i) && (S(i, y.started_at, !0), t.oncomplete?.());
    } catch (y) {
      S(s, String(y), !0);
    }
  }
  Hn(() => {
    o();
  }), rn(() => {
    if (!a(l)) return;
    const y = setInterval(o, 700);
    return () => clearInterval(y);
  });
  async function d() {
    S(r, !0), S(s, null);
    try {
      S(n, await je.rebuild(), !0);
    } catch (y) {
      S(s, String(y), !0);
    }
  }
  function _(y) {
    y.key === "Escape" && S(r, !1);
  }
  var m = _o();
  Pn("keydown", pn, _);
  var p = Ze(m), h = f(p), v = f(h), w = b(h, 2), c = b(p, 2);
  {
    var g = (y) => {
      var I = go(), F = Ze(I), R = b(F, 2), L = f(R), G = b(f(L), 4), $ = f(G), j = b(G, 2), E = b(L, 2);
      {
        var A = (Q) => {
          var B = oo(), O = f(B);
          H(() => T(O, a(s))), P(Q, B);
        };
        K(E, (Q) => {
          a(s) && Q(A);
        });
      }
      var C = b(E, 2);
      Ve(C, 17, () => a(n)?.steps ?? [], mt, (Q, B) => {
        var O = co();
        let X;
        var x = f(O), k = f(x), D = f(k);
        {
          var ne = (de) => {
            var oe = Mn("✓");
            P(de, oe);
          }, xe = (de) => {
            var oe = Mn("✕");
            P(de, oe);
          }, ie = (de) => {
            var oe = Mn("·");
            P(de, oe);
          }, ve = (de) => {
            var oe = Mn(" ");
            P(de, oe);
          };
          K(D, (de) => {
            a(B).state === "done" ? de(ne) : a(B).state === "failed" ? de(xe, 1) : a(B).state === "running" ? de(ie, 2) : de(ve, -1);
          });
        }
        var Ue = b(k, 2), pe = f(Ue), Se = b(Ue, 4), We = f(Se), Ge = b(x, 2);
        {
          var ut = (de) => {
            var oe = uo(), ke = f(oe);
            H((Ce) => T(ke, Ce), [() => a(B).log.join(`
`)]), P(de, oe);
          };
          K(Ge, (de) => {
            a(B).log.length && de(ut);
          });
        }
        H(() => {
          X = Ee(O, 1, "step svelte-1xjbga", null, X, {
            on: a(B).state === "running",
            bad: a(B).state === "failed"
          }), T(pe, a(B).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), T(We, a(B).seconds === null ? "" : a(B).seconds + "s");
        }), P(Q, O);
      });
      var q = b(C, 2);
      {
        var V = (Q) => {
          var B = fo(), O = Ze(B), X = f(O);
          H(() => T(X, a(n).error)), P(Q, B);
        }, Y = (Q) => {
          var B = ho();
          P(Q, B);
        }, U = (Q) => {
          var B = vo();
          P(Q, B);
        };
        K(q, (Q) => {
          a(n)?.state === "failed" ? Q(V) : a(n)?.state === "done" ? Q(Y, 1) : a(l) && Q(U, 2);
        });
      }
      var ee = b(q, 2);
      {
        var he = (Q) => {
          var B = po(), O = b(f(B), 6), X = f(O);
          H(() => T(X, `python -m photolib.restore_state ${a(u) ?? ""}`)), P(Q, B);
        };
        K(ee, (Q) => {
          a(u) && Q(he);
        });
      }
      H(() => T($, `${a(n)?.seconds ?? 0 ?? ""}s`)), te("click", F, () => S(r, !1)), te("click", j, () => S(r, !1)), P(y, I);
    };
    K(c, (y) => {
      a(r) && y(g);
    });
  }
  H(() => {
    h.disabled = a(l), T(v, a(l) ? "applying…" : "Apply to grid"), w.disabled = !a(n) || a(n).state === "idle";
  }), te("click", h, d), te("click", w, () => S(r, !0)), P(e, m), vt();
}
Nt(["click"]);
var mo = /* @__PURE__ */ N('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), Ma = /* @__PURE__ */ N("<option> </option>"), wo = /* @__PURE__ */ N('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), yo = /* @__PURE__ */ N('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), xo = /* @__PURE__ */ N('<div class="none muted svelte-bqi9ky"> </div>'), ko = /* @__PURE__ */ N('<div class="bar svelte-bqi9ky"><!></div>');
function So(e, t) {
  ht(t, !0);
  let n = ae(t, "candidate", 3, null), r = ae(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), u = /* @__PURE__ */ re(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ re(() => !!n() && n().op !== "is null");
  function d(w, c) {
    const g = { ...n(), [w]: c };
    if (w === "column") {
      const y = i[c] ?? ["="];
      y.includes(g.op) || (g.op = y[0]), g.value = l.has(c) ? 0 : "";
    }
    w === "op" && c === "is null" && (g.value = null), w === "value" && l.has(g.column) && (g.value = Number(c) || 0), t.onedit(g);
  }
  var _ = ko(), m = f(_);
  {
    var p = (w) => {
      var c = mo(), g = f(c), y = f(g), I = b(g, 2), F = f(I);
      H(() => {
        T(y, `${t.screen.title ?? ""} does not save a rule.`), T(F, t.screen.blurb);
      }), P(w, c);
    }, h = (w) => {
      var c = yo(), g = Ze(c), y = f(g);
      Ve(y, 21, () => s, mt, (O, X) => {
        var x = Ma(), k = f(x), D = {};
        H(() => {
          T(k, a(X)), D !== (D = a(X)) && (x.value = (x.__value = a(X)) ?? "");
        }), P(O, x);
      });
      var I;
      sr(y);
      var F = b(y, 2);
      Ve(F, 21, () => a(u), mt, (O, X) => {
        var x = Ma(), k = f(x), D = {};
        H(() => {
          T(k, a(X)), D !== (D = a(X)) && (x.value = (x.__value = a(X)) ?? "");
        }), P(O, x);
      });
      var R;
      sr(F);
      var L = b(F, 2);
      {
        var G = (O) => {
          var X = wo();
          H(() => an(X, n().value ?? "")), te("input", X, (x) => d("value", x.currentTarget.value)), P(O, X);
        };
        K(L, (O) => {
          a(o) && O(G);
        });
      }
      var $ = b(L, 2), j = f($);
      j.value = j.__value = "exclude";
      var E = b(j);
      E.value = E.__value = "include";
      var A;
      sr($);
      var C = b($, 2), q = f(C);
      q.value = q.__value = "end";
      var V = b(q);
      V.value = V.__value = "0";
      var Y;
      sr(C);
      var U = b(C, 2), ee = f(U), he = b(U, 2), Q = b(g, 2), B = f(Q);
      H(
        (O, X) => {
          I !== (I = n().column) && (y.value = (y.__value = n().column) ?? "", Xn(y, n().column)), R !== (R = n().op) && (F.value = (F.__value = n().op) ?? "", Xn(F, n().op)), A !== (A = n().decision ?? "exclude") && ($.value = ($.__value = n().decision ?? "exclude") ?? "", Xn($, n().decision ?? "exclude")), Y !== (Y = O) && (C.value = (C.__value = O) ?? "", Xn(C, O)), U.disabled = r(), T(ee, r() ? "saving…" : "Confirm"), T(B, `${X ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => ul(n())
        ]
      ), te("change", y, (O) => d("column", O.currentTarget.value)), te("change", F, (O) => d("op", O.currentTarget.value)), te("change", $, (O) => d("decision", O.currentTarget.value)), te("change", C, (O) => d("at", O.currentTarget.value)), te("click", U, function(...O) {
        t.onconfirm?.apply(this, O);
      }), te("click", he, function(...O) {
        t.onclear?.apply(this, O);
      }), P(w, c);
    }, v = (w) => {
      var c = xo(), g = f(c);
      H(() => T(g, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), P(w, c);
    };
    K(m, (w) => {
      t.screen.rule === !1 ? w(p) : n() ? w(h, 1) : w(v, -1);
    });
  }
  P(e, _), vt();
}
Nt(["change", "input", "click"]);
var Eo = /* @__PURE__ */ N('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), To = /* @__PURE__ */ N('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), Mo = /* @__PURE__ */ N('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Ao = /* @__PURE__ */ N('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Ro(e, t) {
  ht(t, !0);
  let n = ae(t, "rules", 19, () => []), r = ae(t, "unmatched", 3, null), s = ae(t, "busy", 3, !1);
  var i = Ao(), l = f(i), u = b(f(l)), o = f(u), d = b(l, 2);
  {
    var _ = (v) => {
      var w = Eo();
      P(v, w);
    };
    K(d, (v) => {
      n().length === 0 && v(_);
    });
  }
  var m = b(d, 2);
  Ve(m, 19, n, (v) => v.id, (v, w, c) => {
    var g = To();
    let y;
    var I = f(g), F = f(I), R = f(F), L = b(F, 2), G = f(L), $ = b(L, 2), j = f($), E = b(I, 2), A = f(E), C = f(A), q = b(A, 2), V = f(q), Y = b(q, 4), U = b(Y, 2), ee = b(U, 2);
    H(
      (he, Q) => {
        y = Ee(g, 1, "rule svelte-aof9c2", null, y, { exclude: a(w).decision === "exclude" }), T(R, a(c)), T(G, a(w).predicate), T(j, a(w).decision), T(C, `${he ?? ""} paths`), T(V, Q), Y.disabled = s() || a(c) === 0, U.disabled = s() || a(c) === n().length - 1, ee.disabled = s();
      },
      [
        () => Me(a(w).paths),
        () => Tt(a(w).bytes)
      ]
    ), te("click", Y, () => t.onmove(a(w), a(c) - 1)), te("click", U, () => t.onmove(a(w), a(c) + 1)), te("click", ee, () => t.ondelete(a(w))), P(v, g);
  });
  var p = b(m, 2);
  {
    var h = (v) => {
      var w = Mo(), c = b(f(w), 2), g = f(c), y = f(g), I = b(g, 2), F = f(I);
      H(
        (R, L) => {
          T(y, `${R ?? ""} paths`), T(F, L);
        },
        [
          () => Me(r().paths),
          () => Tt(r().bytes)
        ]
      ), P(v, w);
    };
    K(p, (v) => {
      r() && v(h);
    });
  }
  H(() => T(o, `${n().length ?? ""} rules · top-down, first match wins`)), P(e, i), vt();
}
Nt(["click"]);
const Aa = 2500, Po = 1, Co = 2, No = 3e7;
function Oo(e, t, n) {
  const r = [], s = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, d = 0, _ = null, m = null, p = null, h = !1, v = !1, w = 0, c = 0, g = 0, y = n.onState || (() => {
  });
  function I(x) {
    w <= 0 || (o = Zl(r, o, w, x, (k, D, ne) => {
      s.push({ top: d, height: ne, from: k, to: D }), d += ne + Et;
    }), R());
  }
  function F() {
    if (m === null || h || w <= 0 || o >= m) return 0;
    const x = s.length ? o / s.length : Math.max(1, w / br), k = s.length ? d / s.length : br + Et, D = Math.round((m - o) / x * k);
    return Math.max(0, Math.min(D, No - d));
  }
  function R() {
    e.style.height = d + F() + "px", t.style.top = Math.max(0, d - 1) + "px";
  }
  function L() {
    return window.scrollY - e.offsetTop;
  }
  function G() {
    const x = l.pop();
    if (x) return x;
    const k = document.createElement("div");
    k.className = "tile";
    const D = document.createElement("img");
    return D.decoding = "async", D.addEventListener("load", () => k.classList.add("loaded")), D.addEventListener("error", () => k.classList.add("missing")), k.appendChild(D), n.extend && n.extend(k), k;
  }
  function $(x, k) {
    k.firstChild.removeAttribute("src"), k.classList.remove("loaded", "missing", "error"), k.style.backgroundImage = "", k.remove(), i.delete(x), l.push(k);
  }
  function j(x, k, D, ne, xe, ie) {
    let ve = i.get(x);
    const Ue = r[x];
    if (!ve) {
      ve = G(), ve.dataset.index = String(x);
      const pe = ve.firstChild;
      pe.fetchPriority = ie ? "high" : "low", pe.src = "/t/" + Ue.s + ".webp", u.push(x), n.fill && n.fill(ve, Ue), e.appendChild(ve), i.set(x, ve);
    }
    ve.style.width = ne + "px", ve.style.height = xe + "px", ve.style.transform = "translate(" + k + "px," + D + "px)";
  }
  function E(x, k) {
    k.th && (k.url === void 0 && (k.url = n.thumbHash(k.th)), k.url && (x.style.backgroundImage = "url(" + k.url + ")"));
  }
  function A() {
    g = 0;
    for (const x of u) {
      const k = i.get(x);
      k && !k.classList.contains("loaded") && E(k, r[x]);
    }
    u.length = 0;
  }
  function C(x, k) {
    let D = 0;
    for (let ne = x.from; ne < x.to; ne++) {
      const ie = ne === x.to - 1 ? w - D : Math.round(mr(r[ne]) * x.height);
      j(ne, D, x.top, ie, x.height, k), D += ie + Et;
    }
  }
  function q() {
    const x = window.innerHeight, k = L(), D = Ta(s, k - x * Po, k + x * (1 + Co));
    if (!D) return;
    const ne = s[D[0]].from, xe = s[D[1]].to;
    for (const [ie, ve] of Array.from(i))
      (ie < ne || ie >= xe) && $(ie, ve);
    for (let ie = D[0]; ie <= D[1]; ie++) {
      const ve = s[ie];
      C(ve, ve.top < k + x && ve.top + ve.height > k);
    }
    u.length && !g && (g = requestAnimationFrame(A));
  }
  function V() {
    return w <= 0 ? !1 : d - (L() + window.innerHeight) < Aa;
  }
  async function Y() {
    if (v || h) return;
    v = !0;
    const x = c;
    y({ loading: !0, count: r.length, exhausted: h, total: m, tiles: p });
    try {
      do {
        const k = await n.fetchPage(_);
        if (x !== c) return;
        for (const D of k.photos) r.push(D);
        _ = k.next, h = _ === null, typeof k.stacks == "number" ? (m = k.stacks, p = typeof k.total == "number" ? k.total : null) : typeof k.total == "number" && (m = k.total), I(h), q(), y({ loading: !0, count: r.length, exhausted: h, total: m, tiles: p });
      } while (!h && V());
    } catch (k) {
      x === c && y({ error: String(k) });
    } finally {
      x === c && (v = !1, y({ loading: !1, count: r.length, exhausted: h, total: m, tiles: p }));
    }
  }
  let U = 0;
  function ee() {
    U || (U = requestAnimationFrame(() => {
      U = 0, q(), V() && Y();
    }));
  }
  function he() {
    const x = e.clientWidth;
    if (x === w) return;
    const k = Ta(s, L(), L()), D = k ? s[k[0]].from : 0;
    w = x;
    for (const [xe, ie] of Array.from(i)) $(xe, ie);
    s.length = 0, o = 0, d = 0, I(h), q();
    const ne = s.find((xe) => xe.to > D);
    ne && window.scrollTo(0, ne.top + e.offsetTop), V() && Y();
  }
  function Q(x) {
    const k = x.target.closest(".tile");
    if (!k || !e.contains(k)) return;
    const D = r[Number(k.dataset.index)];
    D && n.activate && n.activate(D, x, k);
  }
  e.addEventListener("click", Q), window.addEventListener("scroll", ee, { passive: !0 });
  let B = 0;
  const O = new ResizeObserver(() => {
    clearTimeout(B), B = setTimeout(he, 100);
  });
  O.observe(e);
  const X = new IntersectionObserver(
    (x) => {
      x.some((k) => k.isIntersecting) && Y();
    },
    { rootMargin: "0px 0px " + Aa + "px 0px" }
  );
  return X.observe(t), w = e.clientWidth, Y(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      c++, v = !1;
      for (const [x, k] of Array.from(i)) $(x, k);
      r.length = 0, s.length = 0, u.length = 0, o = 0, d = 0, _ = null, m = null, p = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), Y();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(x) {
      const k = typeof x == "number" ? x : null;
      k !== m && (m = k, R(), y({ total: m }));
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
      for (const [k, D] of i)
        r[k] === x && n.fill && n.fill(D, x);
    },
    destroy() {
      c++, e.removeEventListener("click", Q), window.removeEventListener("scroll", ee), O.disconnect(), X.disconnect(), clearTimeout(B), cancelAnimationFrame(g);
    }
  };
}
function Io(e) {
  try {
    const t = Uint8Array.from(atob(e), (C) => C.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, d = (r >> 3 & 63) / 63, _ = (r >> 9 & 63) / 63, m = r >> 15, p = Math.max(3, m ? o ? 5 : 7 : r & 7), h = Math.max(3, m ? r & 7 : o ? 5 : 7);
    let v = o ? 6 : 5, w = 0;
    const c = (C, q, V) => {
      const Y = [];
      for (let U = 0; U < q; U++)
        for (let ee = U ? 0 : 1; ee * q < C * (q - U); ee++) {
          const he = t[v + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          Y.push((he / 7.5 - 1) * V);
        }
      return Y;
    }, g = c(p, h, u), y = c(3, 3, d * 1.25), I = c(3, 3, _ * 1.25), F = p / h, R = Math.max(1, Math.round(F > 1 ? 32 : 32 * F)), L = Math.max(1, Math.round(F > 1 ? 32 / F : 32)), G = document.createElement("canvas");
    G.width = R, G.height = L;
    const $ = G.getContext("2d"), j = $.createImageData(R, L), E = [], A = [];
    for (let C = 0, q = 0; C < L; C++)
      for (let V = 0; V < R; V++, q += 4) {
        let Y = s, U = i, ee = l;
        for (let O = 0; O < p; O++) E[O] = Math.cos(Math.PI / R * (V + 0.5) * O);
        for (let O = 0; O < h; O++) A[O] = Math.cos(Math.PI / L * (C + 0.5) * O);
        for (let O = 0, X = 0; O < h; O++)
          for (let x = O ? 0 : 1; x * h < p * (h - O); x++, X++)
            Y += g[X] * E[x] * A[O] * 2;
        for (let O = 0, X = 0; O < 3; O++)
          for (let x = O ? 0 : 1; x < 3 - O; x++, X++) {
            const k = E[x] * A[O] * 2;
            U += y[X] * k, ee += I[X] * k;
          }
        const he = Y - 2 / 3 * U, Q = (3 * Y - he + ee) / 2, B = Q - ee;
        j.data[q] = Math.max(0, Math.min(255, Math.round(255 * Q))), j.data[q + 1] = Math.max(0, Math.min(255, Math.round(255 * B))), j.data[q + 2] = Math.max(0, Math.min(255, Math.round(255 * he))), j.data[q + 3] = 255;
      }
    return $.putImageData(j, 0, 0), G.toDataURL();
  } catch {
    return null;
  }
}
var Fo = /* @__PURE__ */ N('<main id="canvas"><div id="sentinel"></div></main>');
function Lo(e, t) {
  ht(t, !0);
  let n = ae(t, "key", 3, ""), r = ae(t, "total", 3, null), s = ae(t, "triage", 3, !1), i = ae(t, "excludedDirs", 19, () => []), l = ae(t, "onActivate", 3, () => {
  }), u = ae(t, "onOverride", 3, async () => null), o = ae(t, "onExcludeFolder", 3, () => {
  }), d = ae(t, "onState", 3, () => {
  }), _ = /* @__PURE__ */ W(null), m = /* @__PURE__ */ W(null), p = null, h = "";
  const v = { null: "exclude", exclude: "include", include: "clear" };
  function w(R) {
    const L = R.toLowerCase().startsWith(Ln.toLowerCase()) ? R.slice(Ln.length + 1) : R;
    return L.length > 64 ? "…" + L.slice(-64) : L;
  }
  function c(R) {
    const L = document.createElement("div");
    L.className = "tile-path", R.appendChild(L);
    const G = document.createElement("button");
    G.className = "chip", G.type = "button", R.appendChild(G);
    const $ = document.createElement("button");
    $.className = "dirchip", $.type = "button", $.textContent = "dir", R.appendChild($);
  }
  function g(R, L) {
    const G = R.querySelector(".tile-path");
    G && (G.textContent = L.p ? w(L.p) : "");
    const $ = R.querySelector(".dirchip");
    if ($) {
      const E = vs(L.p ?? ""), A = E !== "" && sa(i(), E);
      $.hidden = E === "", $.disabled = A, $.dataset.state = A ? "exclude" : "none", $.title = A ? `already excluded: ${E}` : `exclude everything under ${E}, subfolders included — one exclude rule at the end of the order`;
    }
    const j = R.querySelector(".chip");
    j && (j.dataset.state = L.o || "none", j.textContent = L.o === "exclude" ? "drop" : L.o === "include" ? "keep" : "·", j.title = L.o === "exclude" ? "overridden: excluded — click to keep" : L.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Hn(() => (p = Oo(a(_), a(m), {
    fetchPage: (R) => t.fetchPage(R),
    thumbHash: Io,
    extend: s() ? c : void 0,
    fill: s() ? g : void 0,
    onState: (R) => d()(R),
    activate: async (R, L, G) => {
      if (L.target.closest(".dirchip")) {
        o()(R);
        return;
      }
      if (!L.target.closest(".chip")) {
        l()(R, G);
        return;
      }
      const $ = v[R.o ?? "null"];
      R.o = await u()(R, $), g(G, R);
    }
  }), h = n(), () => p?.destroy())), rn(() => {
    const R = n(), L = r();
    p && (R !== h && (h = R, p.reset()), p.setTotal(L));
  });
  let y = "";
  rn(() => {
    const R = i().join(`
`);
    !p || R === y || (y = R, p.refill());
  });
  var I = Fo(), F = f(I);
  _r(F, (R) => S(m, R), () => a(m)), _r(I, (R) => S(_, R), () => a(_)), P(e, I), vt();
}
var zo = /* @__PURE__ */ N('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Do = /* @__PURE__ */ N('<th class="num svelte-1v3p82v"> </th>'), jo = /* @__PURE__ */ N('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Ho = /* @__PURE__ */ N('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), qo = /* @__PURE__ */ N('<td class="num svelte-1v3p82v"> </td>'), Bo = /* @__PURE__ */ N('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), $o = /* @__PURE__ */ N('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Uo(e, t) {
  ht(t, !0);
  let n = ae(t, "rows", 19, () => []), r = ae(t, "rules", 19, () => []), s = ae(t, "root", 3, null), i = ae(t, "selected", 3, null), l = ae(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ re(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const d = /* @__PURE__ */ re(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : ps(r(), t.screen.toRule(w, s()))
  ]))), _ = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var p = ra(), h = Ze(p);
  {
    var v = (w) => {
      var c = $o(), g = f(c), y = f(g), I = f(y);
      {
        var F = (E) => {
          var A = zo();
          P(E, A);
        };
        K(I, (E) => {
          a(u) && E(F);
        });
      }
      var R = b(I), L = f(R), G = b(R, 3);
      {
        var $ = (E) => {
          var A = Do(), C = f(A);
          H(() => T(C, t.screen.heading[1])), P(E, A);
        };
        K(G, (E) => {
          t.screen.heading[1] && E($);
        });
      }
      var j = b(g);
      Ve(j, 23, n, (E) => E.key, (E, A, C) => {
        const q = /* @__PURE__ */ re(() => a(d).get(a(A).key));
        var V = Bo();
        let Y;
        var U = f(V);
        {
          var ee = (pe) => {
            const Se = /* @__PURE__ */ re(() => l().has(a(A).key));
            var We = jo(), Ge = f(We);
            let ut;
            var de = f(Ge);
            H(
              (oe) => {
                ut = Ee(Ge, 1, "tick svelte-1v3p82v", null, ut, { on: a(Se) }), le(Ge, "aria-checked", a(Se)), le(Ge, "aria-label", `select ${oe ?? ""}`), T(de, a(Se) ? "✓" : "");
              },
              [() => o(a(A))]
            ), te("click", Ge, (oe) => {
              oe.stopPropagation(), t.oncheck(a(A), a(C), oe.shiftKey);
            }), P(pe, We);
          };
          K(U, (pe) => {
            a(u) && pe(ee);
          });
        }
        var he = b(U), Q = f(he);
        let B;
        var O = f(Q), X = b(Q), x = b(X);
        {
          var k = (pe) => {
            var Se = Ho();
            P(pe, Se);
          };
          K(x, (pe) => {
            a(A).scope === "whole inventory" && pe(k);
          });
        }
        var D = b(he), ne = f(D), xe = b(D), ie = f(xe), ve = b(xe);
        {
          var Ue = (pe) => {
            var Se = qo(), We = f(Se);
            H(() => T(We, a(A).detail ?? "")), P(pe, Se);
          };
          K(ve, (pe) => {
            t.screen.heading[1] && pe(Ue);
          });
        }
        H(
          (pe, Se, We) => {
            Y = Ee(V, 1, "svelte-1v3p82v", null, Y, {
              picked: i() === a(A).key,
              clickable: t.screen.sheet !== !1
            }), B = Ee(Q, 1, "mark svelte-1v3p82v", null, B, {
              exclude: a(q) === "exclude",
              include: a(q) === "include"
            }), le(Q, "title", m[a(q)] ?? ""), T(O, _[a(q)] ?? ""), T(X, `${pe ?? ""} `), T(ne, Se), T(ie, We);
          },
          [
            () => o(a(A)),
            () => Me(a(A).paths),
            () => Tt(a(A).bytes)
          ]
        ), te("click", V, () => t.onpick(a(A))), P(E, V);
      }), H(() => T(L, t.screen.heading[0] ?? "")), P(w, c);
    };
    K(h, (w) => {
      n().length && w(v);
    });
  }
  P(e, p), vt();
}
Nt(["click"]);
var Go = /* @__PURE__ */ N('<button class="twisty svelte-pucy57"> </button>'), Yo = /* @__PURE__ */ N('<span class="twisty leaf svelte-pucy57">·</span>'), Wo = /* @__PURE__ */ N('<span class="name root svelte-pucy57"> </span>'), Vo = /* @__PURE__ */ N('<button class="name svelte-pucy57"> </button>'), Xo = /* @__PURE__ */ N('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Ko = /* @__PURE__ */ N('<div class="note svelte-pucy57"> </div>'), Jo = /* @__PURE__ */ N('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Zo = /* @__PURE__ */ N('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Qo = /* @__PURE__ */ N('<div class="tree svelte-pucy57"></div>');
function eu(e, t) {
  ht(t, !0);
  let n = ae(t, "version", 3, 0), r = ae(t, "excludedDirs", 19, () => []), s = ae(t, "selected", 3, null), i = ae(t, "busy", 3, !1), l = /* @__PURE__ */ W(ze(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ W(ze(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ W(ze(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ W(ze(/* @__PURE__ */ new Set()));
  async function _(c) {
    S(o, new Set(a(o)).add(c), !0);
    const g = await t.onload(c), y = new Map(a(l)), I = new Set(a(d));
    g ? (y.set(c, g), I.delete(c)) : I.add(c), S(l, y, !0), S(d, I, !0), S(o, new Set([...a(o)].filter((F) => F !== c)), !0);
  }
  function m(c) {
    if (a(u).has(c)) {
      S(u, new Set([...a(u)].filter((g) => g !== c)), !0);
      return;
    }
    S(u, new Set(a(u)).add(c), !0), a(l).has(c) || _(c);
  }
  let p = -1;
  rn(() => {
    const c = n();
    if (c !== p) {
      p = c, a(u).has(t.root) || S(u, new Set(a(u)).add(t.root), !0);
      for (const g of a(u)) _(g);
    }
  });
  const h = /* @__PURE__ */ re(() => {
    const c = [], g = (R, L, G, $, j, E) => {
      const A = a(l).get(R), C = a(u).has(R);
      if (c.push({
        key: R,
        name: L,
        depth: G,
        paths: $,
        bytes: j,
        deeper: E,
        expanded: C,
        here: A?.here ?? null,
        truncated: !!A?.truncated,
        loading: a(o).has(R),
        failed: a(d).has(R),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: sa(r(), R)
      }), !(!C || !A))
        for (const q of A.children)
          g(q.path, q.name, G + 1, q.paths, q.bytes, q.deeper);
    }, y = a(l).get(t.root), I = y ? y.children.reduce((R, L) => R + L.paths, 0) + y.here.paths : 0, F = y ? y.children.reduce((R, L) => R + L.bytes, 0) + y.here.bytes : 0;
    return g(t.root, t.root, 0, I, F, !0), c;
  }), v = 8;
  var w = Qo();
  Ve(w, 21, () => a(h), (c) => c.key, (c, g) => {
    var y = Zo(), I = Ze(y);
    let F;
    var R = f(I);
    let L;
    var G = b(R, 2);
    {
      var $ = (x) => {
        var k = Go(), D = f(k);
        H(() => {
          le(k, "aria-expanded", a(g).expanded), le(k, "aria-label", `${a(g).expanded ? "collapse" : "expand"} ${a(g).name ?? ""}`), le(k, "title", a(g).expanded ? "collapse" : "expand"), T(D, a(g).loading ? "·" : a(g).expanded ? "▾" : "▸");
        }), te("click", k, () => m(a(g).key)), P(x, k);
      }, j = (x) => {
        var k = Yo();
        P(x, k);
      };
      K(G, (x) => {
        a(g).deeper ? x($) : x(j, -1);
      });
    }
    var E = b(G, 2);
    {
      var A = (x) => {
        var k = Wo(), D = f(k);
        H(() => T(D, a(g).key)), P(x, k);
      }, C = (x) => {
        var k = Vo(), D = f(k);
        H(() => {
          le(k, "title", `Show every kept file under ${a(g).key ?? ""}`), T(D, a(g).name);
        }), te("click", k, () => t.onpick(a(g))), P(x, k);
      };
      K(E, (x) => {
        a(g).depth === 0 ? x(A) : x(C, -1);
      });
    }
    var q = b(E, 2), V = f(q), Y = b(q, 2), U = f(Y), ee = b(Y, 2), he = b(I, 2);
    {
      var Q = (x) => {
        var k = Xo();
        let D;
        H((ne) => D = on(k, "", D, ne), [
          () => ({
            "padding-left": `${Math.min(a(g).depth, v) * 11 + 18}px`
          })
        ]), P(x, k);
      }, B = (x) => {
        var k = Ko();
        let D;
        var ne = f(k);
        H(
          (xe, ie, ve) => {
            D = on(k, "", D, xe), T(ne, `${ie ?? ""} directly here · ${ve ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(a(g).depth, v) * 11 + 18}px`
            }),
            () => Me(a(g).here.paths),
            () => Tt(a(g).here.bytes)
          ]
        ), P(x, k);
      };
      K(he, (x) => {
        a(g).expanded && a(g).failed ? x(Q) : a(g).expanded && a(g).here && a(g).here.paths > 0 && x(B, 1);
      });
    }
    var O = b(he, 2);
    {
      var X = (x) => {
        var k = Jo();
        let D;
        H((ne) => D = on(k, "", D, ne), [
          () => ({
            "padding-left": `${Math.min(a(g).depth, v) * 11 + 18}px`
          })
        ]), P(x, k);
      };
      K(O, (x) => {
        a(g).truncated && x(X);
      });
    }
    H(
      (x, k, D) => {
        F = Ee(I, 1, "row svelte-pucy57", null, F, {
          picked: s() === a(g).key,
          gone: a(g).excluded
        }), L = on(R, "", L, x), T(V, k), T(U, D), ee.disabled = i() || a(g).excluded || a(g).depth === 0, le(ee, "title", a(g).depth === 0 ? "The library root is not excludable from here." : a(g).excluded ? "already excluded" : `Exclude everything under ${a(g).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(a(g).depth, v) * 11}px` }),
        () => Me(a(g).paths),
        () => Tt(a(g).bytes)
      ]
    ), te("click", ee, () => t.onexclude(a(g))), P(c, y);
  }), P(e, w), vt();
}
Nt(["click"]);
var tu = /* @__PURE__ */ N('<button title="Back to its default">↺</button>'), nu = /* @__PURE__ */ N('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), ru = /* @__PURE__ */ N('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), au = /* @__PURE__ */ N('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), su = /* @__PURE__ */ N('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), iu = /* @__PURE__ */ N('<li><code class="svelte-1hh0fwb"> </code> </li>'), lu = /* @__PURE__ */ N(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), ou = /* @__PURE__ */ N('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function uu(e, t) {
  ht(t, !0);
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
  let u = /* @__PURE__ */ W(ze(wl())), o = /* @__PURE__ */ W(!0), d = /* @__PURE__ */ W(!1), _ = /* @__PURE__ */ W(ze(ys())), m = /* @__PURE__ */ W(ze(window.innerWidth));
  const p = (C) => a(_) === "light" ? C.light : C.dark, h = (C) => C in sn ? sn : en, v = (C) => `rgba(${C.r}, ${C.g}, ${C.b}, ${C.a})`, w = /* @__PURE__ */ re(() => JSON.stringify(a(u), null, 2));
  Hn(() => {
    const C = localStorage.getItem(n);
    if (C)
      try {
        S(u, Cr(JSON.parse(C)), !0);
        return;
      } catch {
      }
    ia();
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
  function I() {
    S(_, xs(a(_) === "dark" ? "light" : "dark"), !0);
  }
  async function F() {
    await navigator.clipboard.writeText(a(w)), S(d, !0);
  }
  var R = ou();
  let L;
  var G = f(R), $ = b(f(G), 4), j = f($), E = b(G, 2);
  {
    var A = (C) => {
      var q = lu();
      {
        const Ge = (de, oe = ir, ke = ir, Ce = ir) => {
          var et = tu();
          let Xe;
          H(() => {
            Xe = Ee(et, 1, "undo svelte-1hh0fwb", null, Xe, { idle: !ke() }), le(et, "aria-label", `Reset ${oe() ?? ""}`);
          }), te("click", et, function(...ct) {
            Ce()?.apply(this, ct);
          }), P(de, et);
        };
        var V = b(f(q), 2);
        Ve(V, 17, () => r, mt, (de, oe) => {
          var ke = ru(), Ce = f(ke), et = f(Ce), Xe = b(Ce, 2), ct = f(Xe), kt = b(Xe, 2);
          Ve(kt, 17, () => a(oe).rows, mt, (Ot, Vt) => {
            var pt = /* @__PURE__ */ re(() => Tr(a(Vt), 5));
            let z = () => a(pt)[0], Z = () => a(pt)[1], se = () => a(pt)[2], we = () => a(pt)[3], ge = () => a(pt)[4];
            const fe = /* @__PURE__ */ re(() => a(u)[z()] !== h(z())[z()]), ye = /* @__PURE__ */ re(() => typeof we() == "function" ? we()(a(m)) : we());
            var De = nu();
            let Ne;
            var me = f(De), tt = f(me), Ie = b(me, 2), Ae = b(Ie, 2), Xt = b(Ae, 2);
            Ge(Xt, Z, () => a(fe), () => () => y(z())), H(() => {
              Ne = Ee(De, 1, "row svelte-1hh0fwb", null, Ne, { moved: a(fe) }), T(tt, Z()), le(Ie, "min", se()), le(Ie, "max", a(ye)), le(Ie, "step", ge()), le(Ie, "aria-label", Z()), an(Ie, a(u)[z()]), le(Ae, "min", se()), le(Ae, "max", a(ye)), le(Ae, "step", ge()), le(Ae, "aria-label", `${Z() ?? ""} value`), an(Ae, a(u)[z()]);
            }), te("input", Ie, (It) => c({ [z()]: Number(It.currentTarget.value) })), te("input", Ae, (It) => c({ [z()]: Number(It.currentTarget.value) })), P(Ot, De);
          }), H(() => {
            T(et, a(oe).title), T(ct, a(oe).note);
          }), P(de, ke);
        });
        var Y = b(V, 2), U = f(Y), ee = b(Y, 2), he = f(ee), Q = b(ee, 2);
        Ve(Q, 17, () => ml, mt, (de, oe) => {
          const ke = /* @__PURE__ */ re(() => p(a(oe))), Ce = /* @__PURE__ */ re(() => a(u)[a(ke)]), et = /* @__PURE__ */ re(() => a(oe).base[a(ke)]);
          var Xe = su(), ct = f(Xe), kt = f(ct), Ot = b(kt), Vt = f(Ot), pt = b(ct, 2), z = f(pt), Z = b(pt, 2);
          Ve(Z, 17, () => i, mt, (fe, ye) => {
            var De = /* @__PURE__ */ re(() => Tr(a(ye), 3));
            let Ne = () => a(De)[0], me = () => a(De)[1], tt = () => a(De)[2];
            const Ie = /* @__PURE__ */ re(() => a(Ce)[Ne()] !== a(et)[Ne()]);
            var Ae = au();
            let Xt;
            var It = f(Ae), M = f(It), J = b(It, 2), _e = b(J, 2), Ke = b(_e, 2);
            Ge(Ke, me, () => a(Ie), () => () => c({
              [a(ke)]: { ...a(Ce), [Ne()]: a(et)[Ne()] }
            })), H(() => {
              Xt = Ee(Ae, 1, "row svelte-1hh0fwb", null, Xt, { moved: a(Ie) }), T(M, me()), le(J, "max", tt()), le(J, "step", tt() === 1 ? 0.01 : 1), le(J, "aria-label", `${a(_) ?? ""} ${s[a(oe).dark].title ?? ""} ${me() ?? ""}`), an(J, a(Ce)[Ne()]), le(_e, "max", tt()), le(_e, "step", tt() === 1 ? 0.01 : 1), le(_e, "aria-label", `${a(_) ?? ""} ${s[a(oe).dark].title ?? ""} ${me() ?? ""} value`), an(_e, a(Ce)[Ne()]);
            }), te("input", J, (Oe) => c({
              [a(ke)]: {
                ...a(Ce),
                [Ne()]: Number(Oe.currentTarget.value)
              }
            })), te("input", _e, (Oe) => c({
              [a(ke)]: {
                ...a(Ce),
                [Ne()]: Number(Oe.currentTarget.value)
              }
            })), P(fe, Ae);
          });
          var se = b(Z, 2);
          let we;
          var ge = f(se);
          H(
            (fe, ye) => {
              T(kt, `${s[a(oe).dark].title ?? ""} `), T(Vt, a(_)), T(z, s[a(oe).dark].note), we = on(se, "", we, fe), T(ge, ye);
            },
            [
              () => ({ background: v(a(Ce)) }),
              () => v(a(Ce))
            ]
          ), P(de, Xe);
        });
        var B = b(Q, 2), O = b(f(B), 4);
        let ut;
        var X = f(O), x = f(X), k = b(X, 2);
        Ge(k, () => "Blur at the edge", () => a(u).blurEdge !== sn.blurEdge, () => () => y("blurEdge"));
        var D = b(B, 2), ne = b(f(D), 4);
        Ve(ne, 21, () => l, mt, (de, oe) => {
          var ke = /* @__PURE__ */ re(() => Tr(a(oe), 2));
          let Ce = () => a(ke)[0], et = () => a(ke)[1];
          var Xe = iu(), ct = f(Xe), kt = f(ct), Ot = b(ct);
          H(() => {
            T(kt, Ce()), T(Ot, ` — ${et() ?? ""}`);
          }), P(de, Xe);
        });
        var xe = b(D, 2), ie = b(f(xe), 4), ve = f(ie), Ue = b(ve, 2), pe = b(Ue, 2), Se = f(pe), We = b(ie, 2);
        H(() => {
          T(U, `The five colours below are per theme, and you are editing the ${a(_) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), T(he, `Edit the ${a(_) === "dark" ? "light" : "dark"} colours`), ut = Ee(O, 1, "row toggle svelte-1hh0fwb", null, ut, { moved: a(u).blurEdge !== sn.blurEdge }), rl(x, a(u).blurEdge), T(Se, a(d) ? "Copied" : "Copy"), an(We, a(w));
        }), te("click", ee, I), te("change", x, (de) => c({ blurEdge: de.currentTarget.checked })), te("click", ve, () => g(en)), te("click", Ue, () => g(sn)), te("click", pe, F);
      }
      P(C, q);
    };
    K(E, (C) => {
      a(o) && C(A);
    });
  }
  H(() => {
    L = Ee(R, 1, "tuner svelte-1hh0fwb", null, L, { folded: !a(o) }), le($, "title", a(o) ? "Fold away" : "Open"), T(j, a(o) ? "–" : "+");
  }), Gr("innerWidth", (C) => S(m, C, !0)), te("click", $, () => S(o, !a(o))), P(e, R), vt();
}
Nt(["click", "input", "change"]);
var cu = /* @__PURE__ */ N('<button><span class="n svelte-1n46o8q"> </span> </button>'), du = /* @__PURE__ */ N('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), fu = /* @__PURE__ */ N('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), hu = /* @__PURE__ */ N('<div class="muted pad svelte-1n46o8q">loading…</div>'), vu = /* @__PURE__ */ N('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), pu = /* @__PURE__ */ N('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), gu = /* @__PURE__ */ N('<p class="blurb"> </p>'), _u = /* @__PURE__ */ N('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), bu = /* @__PURE__ */ N('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), mu = /* @__PURE__ */ N('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), wu = /* @__PURE__ */ N('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), yu = /* @__PURE__ */ N("<div> </div>"), xu = /* @__PURE__ */ N('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function ku(e, t) {
  ht(t, !0);
  const n = location.pathname === "/tune";
  let r = /* @__PURE__ */ W("grid"), s = /* @__PURE__ */ W(0), i = /* @__PURE__ */ W(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ W(ze([])), u = /* @__PURE__ */ W(null), o = /* @__PURE__ */ W(null), d = /* @__PURE__ */ W(ze(/* @__PURE__ */ new Set())), _ = /* @__PURE__ */ W(null), m = /* @__PURE__ */ W(null), p = /* @__PURE__ */ W(null), h = /* @__PURE__ */ W(null), v = /* @__PURE__ */ W(!1), w = /* @__PURE__ */ W(!1), c = /* @__PURE__ */ W(!1), g = /* @__PURE__ */ W(!1), y = /* @__PURE__ */ W(ze({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), I = /* @__PURE__ */ W(null), F = /* @__PURE__ */ W(0), R = /* @__PURE__ */ W(null), L = /* @__PURE__ */ W(ze({})), G = /* @__PURE__ */ W("newest"), $ = /* @__PURE__ */ W(ze(Cl())), j = /* @__PURE__ */ W(null);
  const E = /* @__PURE__ */ re(() => ya[a(s)]), A = /* @__PURE__ */ re(() => a(E).table !== !1), C = /* @__PURE__ */ re(() => a(A) || a(E).tree === !0), q = /* @__PURE__ */ re(() => a(E).sheet !== !1 && (a(o) !== null || !a(C))), V = /* @__PURE__ */ re(() => ({
    sort: a(G),
    ...a($).on ? { stack: a($).window } : {},
    ...Object.fromEntries(Object.entries(a(L)).filter(([, M]) => M.length > 0))
  })), Y = /* @__PURE__ */ re(() => a(r) === "grid" ? `grid:${JSON.stringify(a(V))}` : `triage:${a(s)}:${JSON.stringify(a(o))}`), U = /* @__PURE__ */ re(() => a(E).rule === !1 || a(d).size === 0 ? [] : a(l).filter((M) => a(d).has(M.key)).map((M) => a(E).toRule(M, a(i))).filter((M) => M && ps(a(m)?.rules ?? [], M) !== "exclude")), ee = /* @__PURE__ */ re(() => (a(m)?.rules ?? []).filter((M) => M.decision === "exclude" && M.term?.column === "dir_under").map((M) => String(M.term.value).replace(/[\\/]+$/, "").toLowerCase())), he = ll();
  function Q(M) {
    S(I, String(M), !0);
  }
  async function B(M) {
    try {
      return S(I, null), await M();
    } catch (J) {
      return Q(J), null;
    }
  }
  const O = ol(
    () => {
      S(w, !0), B(async () => {
        const M = a(o)?.at === "end" || a(o)?.at === void 0 ? void 0 : 0, { stale: J, value: _e } = await he(() => je.counts(a(o), M));
        J || S(m, _e, !0);
      }).finally(() => {
        S(w, !1);
      });
    },
    220
  );
  async function X() {
    S(p, "loading");
    const M = await B(() => je.files());
    S(p, M, !0), S(v, !1), S(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function x(M = !1) {
    if (a(r) !== "triage" || !a(A)) {
      S(l, [], !0);
      return;
    }
    S(g, !0);
    const J = a(E).name === "source_folder" && a(i) ? { root: a(i) } : {};
    M && (J.live = "1");
    const _e = await B(() => je.screen(a(E).name, J));
    S(l, _e?.rows ?? [], !0), S(g, !1);
  }
  let k = !1;
  rn(() => {
    a(s), a(r), gn(() => {
      S(u, null), S(o, null), S(i, null), ie(), a(r) === "triage" && (x(), O.now(), k || (k = !0, X()));
    });
  }), rn(() => {
    a(i), gn(() => {
      a(r) === "triage" && (ie(), x());
    });
  }), Hn(() => {
    B(async () => {
      S(R, await je.facets(), !0);
    });
  });
  function D(M, J) {
    S(L, { ...a(L), [M]: J }, !0);
  }
  function ne(M) {
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
      ), O();
    }
  }
  function xe(M, J, _e) {
    const Ke = new Set(a(d)), Oe = !Ke.has(M.key), Fe = _e && a(_) !== null ? a(l).findIndex((at) => at.key === a(_)) : -1, [St, Ht] = Fe < 0 ? [J, J] : Fe < J ? [Fe, J] : [J, Fe];
    for (let at = St; at <= Ht; at++)
      Oe ? Ke.add(a(l)[at].key) : Ke.delete(a(l)[at].key);
    S(d, Ke, !0), S(_, M.key, !0);
  }
  function ie() {
    S(d, /* @__PURE__ */ new Set(), !0), S(_, null);
  }
  function ve(M) {
    S(o, M, !0), S(
      u,
      null
      // it no longer corresponds to a row
    ), O();
  }
  function Ue(M = !1) {
    S(o, null), S(u, null), M && S(i, null), O.now();
  }
  async function pe() {
    S(
      v,
      !0
      // the distinct-content number now says so on its face
    ), Ti(F), await x(), O.now();
  }
  async function Se() {
    if (!a(o)) return;
    S(c, !0);
    const M = a(o).at === "end" ? void 0 : 0, J = await B(() => je.addRule(
      {
        column: a(o).column,
        op: a(o).op,
        value: a(o).value,
        decision: a(o).decision ?? "exclude",
        note: `screen ${a(E).id} ${a(E).title}`
      },
      M
    ));
    S(c, !1), J && (S(o, null), S(u, null), await pe());
  }
  async function We() {
    const M = a(U);
    if (!M.length) {
      ie();
      return;
    }
    S(c, !0);
    for (const J of M)
      if (!await B(() => je.addRule({
        column: J.column,
        op: J.op,
        value: J.value,
        decision: "exclude",
        note: `screen ${a(E).id} ${a(E).title}`
      }))) break;
    S(c, !1), ie(), S(o, null), S(u, null), await pe();
  }
  async function Ge(M) {
    if (!M || sa(a(ee), M)) return;
    S(c, !0);
    const J = await B(() => je.addRule({
      column: "dir_under",
      op: "=",
      value: M,
      decision: "exclude",
      note: `screen ${a(E).id} ${a(E).title}`
    }));
    S(c, !1), J && await pe();
  }
  const ut = (M) => Ge(vs(M.p ?? "")), de = (M) => Ge(M.key);
  async function oe(M) {
    S(c, !0), await B(() => je.deleteRule(M.id)), S(c, !1), await pe();
  }
  async function ke(M, J) {
    S(c, !0), await B(() => je.moveRule(M.id, J)), S(c, !1), await pe();
  }
  async function Ce() {
    await B(async () => {
      S(R, await je.facets(), !0);
    });
  }
  async function et(M, J) {
    const _e = await B(() => je.override(M.s, J));
    return _e ? (S(v, !0), O(), _e.decision) : M.o ?? null;
  }
  function Xe(M) {
    return a(r) === "grid" ? je.photos({ limit: 500, ...a(V), ...M || {} }) : je.page(a(o), M);
  }
  function ct(M, J) {
    if (a(r) === "grid") {
      const _e = M.m ?? [{ id: M.id, s: M.s, w: M.w, h: M.h }];
      S(j, { frames: _e, origin: J.getBoundingClientRect() }, !0);
      return;
    }
    B(() => je.revealOrigin(M.id));
  }
  function kt(M) {
    S(j, null), B(() => je.revealPhoto(M.id));
  }
  var Ot = xu(), Vt = Ze(Ot);
  {
    var pt = (M) => {
      Kl(M, {
        get facets() {
          return a(R);
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
        onselect: D,
        onsort: (J) => S(G, J, !0),
        onstack: (J) => S($, Nl(J), !0),
        onclear: () => S(L, {}, !0),
        ontriage: () => S(r, "triage")
      });
    };
    K(Vt, (M) => {
      a(r) === "grid" && M(pt);
    });
  }
  var z = b(Vt, 2);
  {
    var Z = (M) => {
      uu(M, {});
    };
    K(z, (M) => {
      n && M(Z);
    });
  }
  var se = b(z, 2);
  let we;
  var ge = f(se);
  {
    var fe = (M) => {
      var J = pu(), _e = f(J), Ke = f(_e), Oe = b(_e, 2);
      Ve(Oe, 21, () => ya, mt, (Le, st, Ft) => {
        var Lt = cu();
        let mn;
        var wn = f(Lt), Te = f(wn), it = b(wn, 1, !0);
        H(() => {
          mn = Ee(Lt, 1, "nav svelte-1n46o8q", null, mn, { on: Ft === a(s) }), T(Te, a(st).id), T(it, a(st).title);
        }), te("click", Lt, () => S(s, Ft, !0)), P(Le, Lt);
      });
      var Fe = b(Oe, 2);
      {
        var St = (Le) => {
          var st = vu(), Ft = Ze(st), Lt = f(Ft);
          {
            var mn = (Je) => {
              var nt = du(), yn = Ze(nt), qn = /* @__PURE__ */ re(() => Ue.bind(null, !0)), kr = b(yn, 2), Sr = f(kr);
              H(() => T(Sr, `inside ${a(i) ?? ""}`)), te("click", yn, function(...Er) {
                a(qn)?.apply(this, Er);
              }), P(Je, nt);
            }, wn = (Je) => {
              var nt = fu(), yn = f(nt);
              H(() => T(yn, a(E).relive)), te("click", nt, () => x(!0)), P(Je, nt);
            };
            K(Lt, (Je) => {
              a(E).drill && a(i) ? Je(mn) : a(E).relive && Je(wn, 1);
            });
          }
          var Te = b(Ft, 2);
          {
            var it = (Je) => {
              var nt = hu();
              P(Je, nt);
            };
            K(Te, (Je) => {
              a(g) && Je(it);
            });
          }
          var Kt = b(Te, 2);
          {
            let Je = /* @__PURE__ */ re(() => a(m)?.rules ?? []);
            Uo(Kt, {
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
              onpick: ne,
              oncheck: xe
            });
          }
          P(Le, st);
        };
        K(Fe, (Le) => {
          a(A) && Le(St);
        });
      }
      var Ht = b(Fe, 2);
      {
        var at = (Le) => {
          eu(Le, {
            get root() {
              return Ln;
            },
            get version() {
              return a(F);
            },
            get excludedDirs() {
              return a(ee);
            },
            get selected() {
              return a(u);
            },
            get busy() {
              return a(c);
            },
            onload: (st) => B(() => je.tree(st)),
            onpick: ne,
            onexclude: de
          });
        };
        K(Ht, (Le) => {
          a(E).tree && Le(at);
        });
      }
      var _n = b(Ht, 2);
      {
        let Le = /* @__PURE__ */ re(() => a(m)?.rules ?? []), st = /* @__PURE__ */ re(() => a(m)?.unmatched ?? null);
        Ro(_n, {
          get rules() {
            return a(Le);
          },
          get unmatched() {
            return a(st);
          },
          get busy() {
            return a(c);
          },
          ondelete: oe,
          onmove: ke
        });
      }
      var bn = b(_n, 2);
      bo(bn, { oncomplete: Ce }), te("click", Ke, () => S(r, "grid")), P(M, J);
    };
    K(ge, (M) => {
      a(r) === "triage" && M(fe);
    });
  }
  var ye = b(ge, 2), De = f(ye);
  {
    var Ne = (M) => {
      var J = wu(), _e = Ze(J), Ke = f(_e), Oe = b(_e, 2), Fe = f(Oe), St = b(Oe, 2);
      {
        var Ht = (Te) => {
          var it = gu(), Kt = f(it);
          H(() => T(Kt, a(E).note)), P(Te, it);
        };
        K(St, (Te) => {
          a(E).note && Te(Ht);
        });
      }
      var at = b(St, 2);
      {
        var _n = (Te) => {
          lo(Te, {
            get screen() {
              return a(E);
            }
          });
        };
        K(at, (Te) => {
          a(E).name === "dimensions" && Te(_n);
        });
      }
      var bn = b(at, 2);
      bl(bn, {
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
          return a(w);
        },
        onfiles: X
      });
      var Le = b(bn, 2);
      {
        var st = (Te) => {
          var it = _u(), Kt = f(it), Je = f(Kt), nt = b(Kt, 2), yn = f(nt), qn = b(nt, 2), kr = b(qn, 2), Sr = f(kr);
          {
            var Er = (Jt) => {
              var xn = Mn("already excluded — nothing left to write");
              P(Jt, xn);
            }, ks = (Jt) => {
              var xn = Mn();
              H((Ss) => T(xn, `one exclude rule each, at the end of the order${Ss ?? ""}`), [
                () => a(U).length < a(d).size ? ` · ${Me(a(d).size - a(U).length)} already excluded, skipped` : ""
              ]), P(Jt, xn);
            };
            K(Sr, (Jt) => {
              a(U).length ? Jt(ks, -1) : Jt(Er);
            });
          }
          H(
            (Jt, xn) => {
              T(Je, `${Jt ?? ""} ticked`), nt.disabled = a(c) || !a(U).length, T(yn, xn), qn.disabled = a(c);
            },
            [
              () => Me(a(d).size),
              () => a(c) ? "saving…" : `Exclude ${Me(a(U).length)}`
            ]
          ), te("click", nt, We), te("click", qn, ie), P(Te, it);
        };
        K(Le, (Te) => {
          a(d).size && Te(st);
        });
      }
      var Ft = b(Le, 2);
      So(Ft, {
        get candidate() {
          return a(o);
        },
        get screen() {
          return a(E);
        },
        get saving() {
          return a(c);
        },
        onedit: ve,
        onconfirm: Se,
        onclear: Ue
      });
      var Lt = b(Ft, 2);
      {
        var mn = (Te) => {
          var it = bu(), Kt = f(it);
          H((Je, nt) => T(Kt, `${Je ?? ""}${nt ?? ""} loaded${a(y).exhausted ? " · all of them" : ""}${a(y).loading ? " · loading…" : ""} `), [
            () => Me(a(y).count),
            () => a(y).total ? " of " + Me(a(y).total) : ""
          ]), P(Te, it);
        }, wn = (Te) => {
          var it = mu();
          P(Te, it);
        };
        K(Lt, (Te) => {
          a(q) ? Te(mn) : a(E).sheet === !1 && Te(wn, 1);
        });
      }
      H(() => {
        T(Ke, `${a(E).id ?? ""} · ${a(E).title ?? ""}`), T(Fe, a(E).blurb);
      }), P(M, J);
    };
    K(De, (M) => {
      a(r) === "triage" && M(Ne);
    });
  }
  var me = b(De, 2);
  {
    var tt = (M) => {
      {
        let J = /* @__PURE__ */ re(() => a(r) === "grid" ? null : a(m)?.page_paths ?? null), _e = /* @__PURE__ */ re(() => a(r) === "triage");
        Lo(M, {
          get key() {
            return a(Y);
          },
          fetchPage: Xe,
          get total() {
            return a(J);
          },
          get triage() {
            return a(_e);
          },
          get excludedDirs() {
            return a(ee);
          },
          onActivate: ct,
          onOverride: et,
          onExcludeFolder: ut,
          onState: (Ke) => S(y, { ...a(y), ...Ke }, !0)
        });
      }
    };
    K(me, (M) => {
      (a(q) || a(r) === "grid") && M(tt);
    });
  }
  var Ie = b(se, 2);
  {
    var Ae = (M) => {
      to(M, {
        get frames() {
          return a(j).frames;
        },
        get origin() {
          return a(j).origin;
        },
        onreveal: kt,
        onclose: () => S(j, null)
      });
    };
    K(Ie, (M) => {
      a(j) && M(Ae);
    });
  }
  var Xt = b(Ie, 2);
  {
    var It = (M) => {
      var J = yu();
      let _e;
      var Ke = f(J);
      H(() => {
        _e = Ee(J, 1, "status", null, _e, { bare: a(r) === "grid" }), T(Ke, a(I));
      }), P(M, J);
    };
    K(Xt, (M) => {
      a(I) && M(It);
    });
  }
  H(() => we = Ee(se, 1, "shell", null, we, { bare: a(r) === "grid" })), P(e, Ot), vt();
}
Nt(["click"]);
Ol();
ia();
Gi(ku, { target: document.getElementById("app") });
