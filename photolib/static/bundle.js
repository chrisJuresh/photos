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
        _e
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
    _e?.is_fork ? (this.#s && _e.skip_effect(this.#s), this.#n && _e.skip_effect(this.#n), this.#l && _e.skip_effect(this.#l), _e.oncommit(() => {
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
  function g(h) {
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
    d.then(() => g([])).finally(m);
    return;
  }
  function p() {
    Promise.all(n.map((h) => /* @__PURE__ */ mi(h))).then(g).catch((h) => Qt(h, u)).finally(m);
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
    _e
  );
  return function(i = !0) {
    jt(e), xt(t), On(n), i && (e.f & ft) === 0 && (r?.activate(), r?.apply());
  };
}
function fr(e = !0) {
  jt(null), xt(null), On(null), e && _e?.deactivate();
}
function Ha() {
  var e = (
    /** @type {Effect} */
    ue
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
    var g = (
      /** @type {Batch} */
      _e
    );
    if (l) {
      if ((o.f & zn) !== 0)
        var m = Ha();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(Yn);
      else
        for (const h of u.values())
          h.reject(Yn);
      u.add(d), g.async_deriveds.set(o, d);
    }
    const p = (h, v = void 0) => {
      m?.(), u.delete(d), v !== Yn && (g.activate(), v ? (i.f |= tn, In(i, v)) : ((i.f & tn) !== 0 && (i.f ^= tn), In(i, h)), g.deactivate());
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
  if (!e.equals(t) && (e.wv = os(), (!_e?.is_fork || e.deps === null) && (_e !== null ? (_e.capture(e, t, !0), Hr?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Pe(e, qe);
    return;
  }
  Yt || (Rt !== null ? (Qr() || _e?.is_fork) && Rt.set(e, t) : Xr(e));
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
let Mr = null, kn = null, _e = null, Hr = null, Rt = null, qr = null, Ar = !1, Tn = null, lr = null;
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
    if (_e = null, s.length > 0) {
      var i = nn.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (Tn = null, lr = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [o, d] of this.#f)
        Ga(o, d);
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
    this.#o.clear(), Hr = this, ua(r), ua(n), Hr = null, this.#l?.resolve();
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
  capture(t, n, r = !1) {
    t.v !== He && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & tn) === 0 && (this.current.set(t, [n, r]), Rt?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    _e = this;
  }
  deactivate() {
    _e = null, Rt = null;
  }
  flush() {
    try {
      Ar = !0, _e = this, this.#_();
    } finally {
      oa = 0, qr = null, Tn = null, lr = null, Ar = !1, _e = null, Rt = null, cn.clear();
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
    if (_e === null) {
      const t = _e = new nn();
      Ar || $t(() => {
        t.#t || t.flush();
      });
    }
    return _e;
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
  _e.schedule(e);
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
function E(e, t, n = !1) {
  ce !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Pt || (ce.f & cr) !== 0) && La() && (ce.f & (Ye | At | Rn | cr)) !== 0 && (Dt === null || !Dt.has(e)) && Ys();
  let r = n ? De(t) : t;
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
  return E(e, n), r;
}
function Jn(e) {
  E(e, e.v + 1);
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
        var g = (
          /** @type {Effect} */
          l
        );
        (u & At) !== 0 && Bt !== null && Bt.add(g), n !== null ? n.push(g) : Zr(g);
      }
    }
}
function De(e) {
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
    var g = u();
    return xt(o), fa(d), g;
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
            const g = l(() => /* @__PURE__ */ W(He));
            n.set(o, g), Jn(s);
          }
        } else
          E(d, He), Jn(s);
        return !0;
      },
      get(u, o, d) {
        if (o === un)
          return e;
        var g = n.get(o), m = o in u;
        if (g === void 0 && (!m || An(u, o)?.writable) && (g = l(() => {
          var h = De(m ? u[o] : He), v = /* @__PURE__ */ W(h);
          return v;
        }), n.set(o, g)), g !== void 0) {
          var p = a(g);
          return p === He ? void 0 : p;
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
        var d = n.get(o), g = d !== void 0 && d.v !== He || Reflect.has(u, o);
        if (d !== void 0 || ue !== null && (!g || An(u, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var p = g ? De(u[o]) : He, h = /* @__PURE__ */ W(p);
            return h;
          }), n.set(o, d));
          var m = a(d);
          if (m === He)
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
            v !== void 0 ? E(v, He) : h in u && (v = l(() => /* @__PURE__ */ W(He)), n.set(h + "", v));
          }
        if (m === void 0)
          (!p || An(u, o)?.writable) && (m = l(() => /* @__PURE__ */ W(void 0)), E(m, De(d)), n.set(o, m));
        else {
          p = m.v !== He;
          var y = l(() => De(d));
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
          return p === void 0 || p.v !== He;
        });
        for (var [d, g] of n)
          g.v !== He && !(d in u) && o.push(d);
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
  _e?.register_created_effect(r);
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
function q(e, t = [], n = [], r = []) {
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
    var g = (
      /** @type {Function} */
      e.fn
    ), m = g();
    e.f |= zn;
    var p = e.deps, h = _e?.is_fork;
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
        for (let y = 0; y < n; y += 1)
          s.deps[y].rv = ln;
      if (t !== null)
        for (const y of t)
          y.rv = ln;
      _t !== null && (r === null ? r = _t : r.push(.../** @type {Source[]} */
      _t));
    }
    return (e.f & tn) !== 0 && (e.f ^= tn), m;
  } catch (y) {
    return za(y);
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
function ee(e, t, n) {
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
    var g = ce, m = ue;
    xt(null), jt(null);
    try {
      for (var p, h = []; i !== null && i !== t; ) {
        try {
          var v = i[Wn]?.[r];
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
      e[Wn] = t, delete e.currentTarget, xt(g), jt(m);
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
function C(e, t) {
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
function R(e, t) {
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
    var g = n ?? t.appendChild(Ut());
    pi(
      /** @type {TemplateNode} */
      g,
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
      _e
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
  var g = null, m = /* @__PURE__ */ qa(() => {
    var N = n();
    return (
      /** @type {V[]} */
      Vr(N) ? N : N == null ? [] : wr(N)
    );
  }), p, h = /* @__PURE__ */ new Map(), v = !0;
  function y(N) {
    (x.effect.f & ft) === 0 && (x.pending.delete(N), x.fallback = g, Ki(x, p, l, t, r), g !== null && (p.length === 0 ? (g.f & zt) === 0 ? pr(g) : (g.f ^= zt, Vn(g, null, l)) : dn(g, () => {
      g = null;
    })));
  }
  function c(N) {
    x.pending.delete(N);
  }
  var _ = ea(() => {
    p = /** @type {V[]} */
    a(m);
    for (var N = p.length, I = /* @__PURE__ */ new Set(), M = (
      /** @type {Batch} */
      _e
    ), L = Za(), U = 0; U < N; U += 1) {
      var $ = p[U], j = r($, U), w = v ? null : u.get(j);
      w ? (w.v && In(w.v, $), w.i && In(w.i, U), L && M.unskip_effect(w.e)) : (w = Ji(
        u,
        v ? l : va ??= Ut(),
        $,
        j,
        U,
        s,
        t,
        n
      ), v || (w.e.f |= zt), u.set(j, w)), I.add(j);
    }
    if (N === 0 && i && !g && (v ? g = bt(() => i(l)) : (g = bt(() => i(va ??= Ut())), g.f |= zt)), N > I.size && Ds(), !v)
      if (h.set(M, I), L) {
        for (const [z, P] of u)
          I.has(z) || M.skip_effect(P.e);
        M.oncommit(y), M.ondiscard(c);
      } else
        y(M);
    a(m);
  }), x = { effect: _, items: u, pending: h, outrogroups: null, fallback: g };
  v = !1;
}
function Bn(e) {
  for (; e !== null && (e.f & yt) === 0; )
    e = e.next;
  return e;
}
function Ki(e, t, n, r, s) {
  var i = (r & Ks) !== 0, l = t.length, u = e.items, o = Bn(e.effect.first), d, g = null, m, p = [], h = [], v, y, c, _;
  if (i)
    for (_ = 0; _ < l; _ += 1)
      v = t[_], y = s(v, _), c = /** @type {EachItem} */
      u.get(y).e, (c.f & zt) === 0 && (c.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(c));
  for (_ = 0; _ < l; _ += 1) {
    if (v = t[_], y = s(v, _), c = /** @type {EachItem} */
    u.get(y).e, e.outrogroups !== null)
      for (const w of e.outrogroups)
        w.pending.delete(c), w.done.delete(c);
    if ((c.f & rt) !== 0 && (pr(c), i && (c.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(c))), (c.f & zt) !== 0)
      if (c.f ^= zt, c === o)
        Vn(c, null, n);
      else {
        var x = g ? g.next : o;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), Zt(e, g, c), Zt(e, c, x), Vn(c, x, n), g = c, p = [], h = [], o = Bn(g.next);
        continue;
      }
    if (c !== o) {
      if (d !== void 0 && d.has(c)) {
        if (p.length < h.length) {
          var N = h[0], I;
          g = N.prev;
          var M = p[0], L = p[p.length - 1];
          for (I = 0; I < p.length; I += 1)
            Vn(p[I], N, n);
          for (I = 0; I < h.length; I += 1)
            d.delete(h[I]);
          Zt(e, M.prev, L.next), Zt(e, g, M), Zt(e, L, N), o = N, g = L, _ -= 1, p = [], h = [];
        } else
          d.delete(c), Vn(c, o, n), Zt(e, c.prev, c.next), Zt(e, c, g === null ? e.effect.first : g.next), Zt(e, g, c), g = c;
        continue;
      }
      for (p = [], h = []; o !== null && o !== c; )
        (d ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = Bn(o.next);
      if (o === null)
        continue;
    }
    (c.f & zt) === 0 && p.push(c), g = c, o = Bn(c.next);
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
        (c.f & rt) === 0 && U.push(c);
    for (; o !== null; )
      (o.f & rt) === 0 && o !== e.fallback && U.push(o), o = Bn(o.next);
    var $ = U.length;
    if ($ > 0) {
      var j = (r & Oa) !== 0 && l === 0 ? n : null;
      if (i) {
        for (_ = 0; _ < $; _ += 1)
          U[_].nodes?.a?.measure();
        for (_ = 0; _ < $; _ += 1)
          U[_].nodes?.a?.fix();
      }
      Xi(e, U, j);
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
function Se(e, t, n, r, s, i) {
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
function te(e, t, n, r) {
  var s = !0, i = (n & ei) !== 0, l = (n & ti) !== 0, u = (
    /** @type {V} */
    r
  ), o = !0, d = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && s ? (d ??= /* @__PURE__ */ Zn(
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
    m = An(e, t)?.set ?? (p && t in e ? (I) => e[t] = I : void 0);
  }
  var h, v = !1;
  i ? [h, v] = di(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && r !== void 0 && (h = g(), m && ($s(), m(h)));
  var y;
  if (y = () => {
    var I = (
      /** @type {V} */
      e[t]
    );
    return I === void 0 ? g() : (o = !0, I);
  }, (n & Qs) === 0)
    return y;
  if (m) {
    var c = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(I, M) {
        return arguments.length > 0 ? ((!M || c || v) && m(M ? y() : I), I) : y();
      })
    );
  }
  var _ = !1, x = ((n & Zs) !== 0 ? Zn : qa)(() => (_ = !1, y()));
  i && a(x);
  var N = (
    /** @type {Effect} */
    ue
  );
  return (
    /** @type {() => V} */
    (function(I, M) {
      if (arguments.length > 0) {
        const L = M ? a(x) : i ? De(I) : I;
        return E(x, L), _ = !0, u !== void 0 && (u = L), I;
      }
      return Yt && _ || (N.f & ft) !== 0 ? x.v : a(x);
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
const ze = {
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
var dl = /* @__PURE__ */ C('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), fl = /* @__PURE__ */ C('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), hl = /* @__PURE__ */ C('<div class="line muted svelte-1vgp6n7">…</div>'), vl = /* @__PURE__ */ C('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), pl = /* @__PURE__ */ C('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), gl = /* @__PURE__ */ C('<div class="line muted svelte-1vgp6n7"> </div>'), _l = /* @__PURE__ */ C('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function bl(e, t) {
  ht(t, !0);
  let n = te(t, "counts", 3, null), r = te(t, "files", 3, null), s = te(t, "filesAt", 3, null), i = te(t, "stale", 3, !1), l = te(t, "candidate", 3, null), u = te(t, "busy", 3, !1);
  const o = /* @__PURE__ */ re(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = _l(), g = f(d);
  let m;
  var p = b(f(g), 2);
  {
    var h = (j) => {
      var w = fl(), z = Ze(w), P = f(z), H = f(P), Q = b(P, 2), G = f(Q), Y = b(Q, 4), ne = f(Y), he = b(Y, 2), X = f(he), B = b(z, 2);
      {
        var F = (V) => {
          var k = dl(), S = b(f(k), 2), O = f(S), ae = b(S, 2), Ee = f(ae), ie = b(ae, 4), ve = f(ie), Ue = b(ie, 2), pe = f(Ue), ke = b(Ue, 2), We = f(ke);
          q(
            (Ge, ut, de, oe, xe) => {
              T(O, `kept ${Ge ?? ""}`), T(Ee, ut), T(ve, `excluded ${de ?? ""}`), T(pe, oe), T(We, `${a(o) >= 0 ? "+" : ""}${xe ?? ""} excluded`);
            },
            [
              () => Me(n().candidate_kept_paths),
              () => Tt(n().candidate_kept_bytes),
              () => Me(n().candidate_excluded_paths),
              () => Tt(n().candidate_excluded_bytes),
              () => Me(a(o))
            ]
          ), R(V, k);
        };
        K(B, (V) => {
          l() && V(F);
        });
      }
      q(
        (V, k, S, O) => {
          T(H, `kept ${V ?? ""}`), T(G, k), T(ne, `excluded ${S ?? ""}`), T(X, O);
        },
        [
          () => Me(n().kept_paths),
          () => Tt(n().kept_bytes),
          () => Me(n().excluded_paths),
          () => Tt(n().excluded_bytes)
        ]
      ), R(j, w);
    }, v = (j) => {
      var w = hl();
      R(j, w);
    };
    K(p, (j) => {
      n() ? j(h) : j(v, -1);
    });
  }
  var y = b(g, 2);
  let c;
  var _ = f(y), x = b(f(_), 3), N = f(x), I = b(x, 2);
  {
    var M = (j) => {
      var w = vl();
      R(j, w);
    };
    K(I, (j) => {
      i() && r() && r() !== "loading" && j(M);
    });
  }
  var L = b(_, 2);
  {
    var U = (j) => {
      var w = pl(), z = Ze(w);
      let P;
      var H = f(z), Q = f(H), G = b(H, 2), Y = f(G), ne = b(G, 4), he = f(ne), X = b(ne, 2), B = f(X), F = b(z, 2), V = f(F);
      q(
        (k, S, O, ae) => {
          P = Se(z, 1, "line svelte-1vgp6n7", null, P, { outdated: i() }), T(Q, `kept ${k ?? ""}`), T(Y, S), T(he, `excluded ${O ?? ""}`), T(B, ae), T(V, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Me(r().kept_files),
          () => Tt(r().kept_bytes),
          () => Me(r().excluded_files),
          () => Tt(r().excluded_bytes)
        ]
      ), R(j, w);
    }, $ = (j) => {
      var w = gl(), z = f(w);
      q(() => T(z, r() === "loading" ? "counting…" : "not counted yet")), R(j, w);
    };
    K(L, (j) => {
      r() && r() !== "loading" ? j(U) : j($, -1);
    });
  }
  q(() => {
    m = Se(g, 1, "block svelte-1vgp6n7", null, m, { busy: u() }), c = Se(y, 1, "block svelte-1vgp6n7", null, c, { busy: r() === "loading" }), x.disabled = r() === "loading", T(N, r() === "loading" ? "counting…" : "recount");
  }), ee("click", x, function(...j) {
    t.onfiles?.apply(this, j);
  }), R(e, d), vt();
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
  const r = $e(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), u = s - l, o = i - l, d = 8, g = [];
  for (let h = 0; h <= d; h++) {
    const v = h / d * (Math.PI / 2);
    g.push([l * Math.cos(v) ** (2 / r), l * Math.sin(v) ** (2 / r)]);
  }
  const m = [], p = (h, v, y, c) => {
    let _ = Math.atan2(h, -v);
    _ < 0 && (_ += Math.PI * 2);
    let x = Math.atan2(c, y);
    x < 0 && (x += Math.PI * 2);
    const N = Re(Sa(x, n), 3);
    m.push(`rgba(255, 255, 255, ${N}) ${Re(_ / (Math.PI * 2) * 100, 2)}%`);
  };
  p(0, -i, 0, 1);
  for (const [h, v, y] of Sl)
    for (let c = 0; c <= d; c++) {
      const [_, x] = g[y ? d - c : c];
      p(h * (u + _), v * (o + x), h * _ ** (r - 1), -v * x ** (r - 1));
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
  const l = Math.abs(e) - n + s, u = Math.abs(t) - r + s, o = Math.max(l, 0), d = Math.max(u, 0), g = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + g - s;
}
function Ml(e, t, n) {
  const r = e / 2, s = t / 2, i = $e(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (p, h) => Tl(p - r, h - s, r, s, l, i), g = 256, m = new Float32Array(g + 1);
  for (let p = 0; p <= g; p++) {
    const h = 1 - p / g, v = Math.asin($e(h * h, 0, 1)), y = Math.asin($e(Math.sin(v) / o, 0, 1));
    m[p] = Math.tan(v - y) * u;
  }
  return (p, h) => {
    const v = -d(p, h);
    if (v < 0 || v >= u) return null;
    const y = m[Math.round(v / u * g)];
    if (y === 0) return null;
    const c = 0.75, _ = d(p + c, h) - d(p - c, h), x = d(p, h + c) - d(p, h - c), N = Math.hypot(_, x);
    if (N === 0) return null;
    const I = -y / N;
    return { dx: _ * I, dy: x * I };
  };
}
function Al(e, t, n) {
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
    l[h] = 128 + $e(Math.round(o[p] * m), -127, 127), l[h + 1] = 128 + $e(Math.round(d[p] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: r.toDataURL(), scale: g * 2 };
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
  function g() {
    e.style.setProperty("--glass-pre", Mt.blurEdge ? "" : d), e.style.setProperty("--glass-post", Mt.blurEdge ? d : "");
  }
  function m() {
    r < 2 || s < 2 || e.style.setProperty("--glass-glare", El(r, s, Mt));
  }
  function p() {
    if (r < 2 || s < 2) return;
    const c = Mt, _ = Al(r, s, Ml(r, s, c)), x = c.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(r)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${r}" height="${s}" preserveAspectRatio="none" href="${_.url}" result="map"/>` + Or(_.scale * (1 + x), Nr[0], "r") + Or(_.scale, Nr[1], "g") + Or(_.scale * (1 - x), Nr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", g()), o = u.map((N) => Mt[N]).join(" ");
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
  const y = yl(() => {
    m(), u.map((c) => Mt[c]).join(" ") !== o ? h() : g();
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
var Il = /* @__PURE__ */ C('<strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <span class="muted sep svelte-zne36e">·</span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span>', 1), Fl = /* @__PURE__ */ C('<strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span>', 1), Ll = /* @__PURE__ */ C('<span class="spin svelte-zne36e" aria-label="loading"></span>'), Ea = /* @__PURE__ */ C('<span class="badge svelte-zne36e"> </span>'), zl = /* @__PURE__ */ C('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Dl = /* @__PURE__ */ C('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), jl = /* @__PURE__ */ C("<button> </button>"), Hl = /* @__PURE__ */ C('<div class="glass sheet sorts svelte-zne36e"></div>'), ql = /* @__PURE__ */ C(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), Bl = /* @__PURE__ */ C('<p class="muted svelte-zne36e">loading…</p>'), $l = /* @__PURE__ */ C('<span class="help svelte-zne36e">?</span>'), Ul = /* @__PURE__ */ C('<span class="n svelte-zne36e"> </span>'), Gl = /* @__PURE__ */ C("<button> <!></button>"), Yl = /* @__PURE__ */ C('<span class="muted svelte-zne36e">nothing here</span>'), Wl = /* @__PURE__ */ C('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Vl = /* @__PURE__ */ C('<div class="glass sheet filters svelte-zne36e"><!></div>'), Xl = /* @__PURE__ */ C('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><!> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function Kl(e, t) {
  ht(t, !0);
  let n = te(t, "facets", 3, null), r = te(t, "selected", 19, () => ({})), s = te(t, "sort", 3, "newest"), i = te(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = te(t, "total", 3, null), u = te(t, "tiles", 3, null), o = te(t, "loading", 3, !1), d = te(t, "onselect", 3, () => {
  }), g = te(t, "onsort", 3, () => {
  }), m = te(t, "onstack", 3, () => {
  }), p = te(t, "onclear", 3, () => {
  }), h = te(t, "ontriage", 3, () => {
  }), v = /* @__PURE__ */ W(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), y = /* @__PURE__ */ W(De(ys())), c = /* @__PURE__ */ W(null);
  const _ = /* @__PURE__ */ re(() => n()?.dimensions ?? []), x = /* @__PURE__ */ re(() => n()?.sorts ?? []), N = /* @__PURE__ */ re(() => a(x).find((D) => D.value === s())?.label ?? s()), I = /* @__PURE__ */ re(() => Object.values(r()).reduce((D, Z) => D + Z.length, 0)), M = /* @__PURE__ */ re(() => a(_).flatMap((D) => (r()[D.name] ?? []).map((Z) => ({
    dimension: D.name,
    value: Z,
    title: D.title,
    label: D.options.find((se) => se.value === Z)?.label ?? String(Z)
  }))));
  function L(D, Z) {
    const se = r()[D] ?? [], we = se.includes(Z) ? se.filter((ge) => ge !== Z) : [...se, Z];
    d()(D, we);
  }
  function U(D, Z) {
    return (r()[D] ?? []).includes(Z);
  }
  function $() {
    E(y, xs(a(y) === "dark" ? "light" : "dark"), !0);
  }
  let j = /* @__PURE__ */ W(null);
  const w = /* @__PURE__ */ re(() => a(j) ?? i().window);
  function z(D) {
    E(j, Number(D), !0);
  }
  function P(D) {
    E(j, null), m()({ ...i(), window: Number(D) });
  }
  rn(() => {
    a(v) !== "stacks" && E(j, null);
  });
  function H(D) {
    D.key === "Escape" && E(v, "");
  }
  function Q(D) {
    a(v) && !D.target.closest(".topbar") && E(v, "");
  }
  Hn(() => {
    const D = new ResizeObserver(([Z]) => {
      const se = Math.round(Z.borderBoxSize?.[0]?.blockSize ?? Z.contentRect.height);
      document.documentElement.style.setProperty("--header-h", se + "px");
    });
    return D.observe(a(c)), () => {
      D.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var G = Xl();
  Pn("keydown", pn, H), Pn("pointerdown", pn, Q);
  var Y = f(G), ne = f(Y);
  {
    var he = (D) => {
      var Z = Il(), se = Ze(Z), we = f(se), ge = b(se, 2), fe = f(ge), ye = b(ge, 4), je = f(ye), Ne = b(ye, 2), be = f(Ne);
      q(
        (tt, Ie) => {
          T(we, tt), T(fe, l() === 1 ? "stack" : "stacks"), T(je, Ie), T(be, u() === 1 ? "photo" : "photos");
        },
        [() => Me(l()), () => Me(u())]
      ), R(D, Z);
    }, X = (D) => {
      var Z = Fl(), se = Ze(Z), we = f(se), ge = b(se, 2), fe = f(ge);
      q(
        (ye) => {
          T(we, ye), T(fe, l() === 1 ? "photo" : "photos");
        },
        [() => l() === null ? "…" : Me(l())]
      ), R(D, Z);
    };
    K(ne, (D) => {
      u() !== null ? D(he) : D(X, -1);
    });
  }
  var B = b(ne, 2);
  {
    var F = (D) => {
      var Z = Ll();
      R(D, Z);
    };
    K(B, (D) => {
      o() && D(F);
    });
  }
  $n(Y, (D) => Gn?.(D));
  var V = b(Y, 2), k = f(V), S = f(k), O = f(S);
  let ae;
  var Ee = f(O), ie = b(O, 2);
  let ve;
  var Ue = b(f(ie));
  {
    var pe = (D) => {
      var Z = Ea(), se = f(Z);
      q(() => T(se, a(I))), R(D, Z);
    };
    K(Ue, (D) => {
      a(I) && D(pe);
    });
  }
  var ke = b(ie, 2);
  let We;
  var Ge = b(f(ke));
  {
    var ut = (D) => {
      var Z = Ea(), se = f(Z);
      q((we) => T(se, we), [() => Me(l())]), R(D, Z);
    };
    K(Ge, (D) => {
      i().on && l() !== null && D(ut);
    });
  }
  var de = b(ke, 2);
  {
    var oe = (D) => {
      var Z = Dl(), se = f(Z);
      Ve(se, 17, () => a(M), (ge) => ge.dimension + " " + ge.value, (ge, fe) => {
        var ye = zl(), je = f(ye), Ne = f(je), be = b(je, 1, !0);
        q(() => {
          le(ye, "title", `${a(fe).title ?? ""}: ${a(fe).label ?? ""} — click to remove`), T(Ne, a(fe).title), T(be, a(fe).label);
        }), ee("click", ye, () => L(a(fe).dimension, a(fe).value)), R(ge, ye);
      });
      var we = b(se, 2);
      ee("click", we, () => p()()), R(D, Z);
    };
    K(de, (D) => {
      a(M).length && D(oe);
    });
  }
  var xe = b(S, 2), Ce = f(xe), et = b(xe, 2);
  $n(k, (D) => Gn?.(D));
  var Xe = b(k, 2);
  {
    var ct = (D) => {
      var Z = Hl();
      Ve(Z, 21, () => a(x), mt, (se, we) => {
        var ge = jl();
        let fe;
        var ye = f(ge);
        q(() => {
          fe = Se(ge, 1, "option svelte-zne36e", null, fe, { on: a(we).value === s() }), T(ye, a(we).label);
        }), ee("click", ge, () => {
          g()(a(we).value), E(v, "");
        }), R(se, ge);
      }), $n(Z, (se) => Gn?.(se)), R(D, Z);
    };
    K(Xe, (D) => {
      a(v) === "sort" && D(ct);
    });
  }
  var kt = b(Xe, 2);
  {
    var Ot = (D) => {
      var Z = ql(), se = f(Z), we = b(f(se), 2), ge = f(we);
      let fe;
      var ye = f(ge), je = b(se, 2), Ne = b(f(je), 2), be = f(Ne), tt = b(be, 2), Ie = f(tt);
      $n(Z, (Ae) => Gn?.(Ae)), q(() => {
        fe = Se(ge, 1, "option svelte-zne36e", null, fe, { on: i().on }), le(ge, "aria-checked", i().on), T(ye, i().on ? "On" : "Off"), le(be, "min", _s), le(be, "max", bs), an(be, a(w)), le(be, "aria-valuetext", `${a(w) ?? ""} seconds`), T(Ie, `${a(w) ?? ""}s`);
      }), ee("click", ge, () => m()({ ...i(), on: !i().on })), ee("input", be, (Ae) => z(Ae.currentTarget.value)), ee("change", be, (Ae) => P(Ae.currentTarget.value)), R(D, Z);
    };
    K(kt, (D) => {
      a(v) === "stacks" && D(Ot);
    });
  }
  var Vt = b(kt, 2);
  {
    var pt = (D) => {
      var Z = Vl(), se = f(Z);
      {
        var we = (fe) => {
          var ye = Bl();
          R(fe, ye);
        }, ge = (fe) => {
          var ye = ra(), je = Ze(ye);
          Ve(je, 17, () => a(_), mt, (Ne, be) => {
            var tt = Wl(), Ie = f(tt), Ae = f(Ie), Xt = b(Ae);
            {
              var It = (Oe) => {
                var Fe = $l();
                q(() => le(Fe, "title", a(be).hint)), R(Oe, Fe);
              };
              K(Xt, (Oe) => {
                a(be).hint && Oe(It);
              });
            }
            var A = b(Ie, 2), J = f(A);
            Ve(J, 17, () => a(be).options, mt, (Oe, Fe) => {
              var St = Gl();
              let Ht;
              var at = f(St), _n = b(at);
              {
                var bn = (Le) => {
                  var st = Ul(), Ft = f(st);
                  q((Lt) => T(Ft, Lt), [() => Me(a(Fe).count)]), R(Le, st);
                };
                K(_n, (Le) => {
                  a(Fe).count !== null && Le(bn);
                });
              }
              q(
                (Le) => {
                  Ht = Se(St, 1, "option svelte-zne36e", null, Ht, Le), T(at, `${a(Fe).label ?? ""} `);
                },
                [
                  () => ({ on: U(a(be).name, a(Fe).value) })
                ]
              ), ee("click", St, () => L(a(be).name, a(Fe).value)), R(Oe, St);
            });
            var me = b(J, 2);
            {
              var Ke = (Oe) => {
                var Fe = Yl();
                R(Oe, Fe);
              };
              K(me, (Oe) => {
                a(be).options.length || Oe(Ke);
              });
            }
            q(() => T(Ae, `${a(be).title ?? ""} `)), R(Ne, tt);
          }), R(fe, ye);
        };
        K(se, (fe) => {
          n() ? fe(ge, -1) : fe(we);
        });
      }
      $n(Z, (fe) => Gn?.(fe)), R(D, Z);
    };
    K(Vt, (D) => {
      a(v) === "filters" && D(pt);
    });
  }
  _r(G, (D) => E(c, D), () => a(c)), q(() => {
    ae = Se(O, 1, "menu svelte-zne36e", null, ae, { open: a(v) === "sort" }), le(O, "aria-expanded", a(v) === "sort"), T(Ee, a(N)), ve = Se(ie, 1, "menu svelte-zne36e", null, ve, { open: a(v) === "filters", on: a(I) > 0 }), le(ie, "aria-expanded", a(v) === "filters"), We = Se(ke, 1, "menu svelte-zne36e", null, We, { open: a(v) === "stacks", on: i().on }), le(ke, "aria-expanded", a(v) === "stacks"), le(xe, "title", a(y) === "dark" ? "Switch to a white background" : "Switch to a black background"), le(xe, "aria-label", a(y) === "dark" ? "Switch to a white background" : "Switch to a black background"), T(Ce, a(y) === "dark" ? "☀" : "☾");
  }), ee("click", O, () => E(v, a(v) === "sort" ? "" : "sort", !0)), ee("click", ie, () => E(v, a(v) === "filters" ? "" : "filters", !0)), ee("click", ke, () => E(v, a(v) === "stacks" ? "" : "stacks", !0)), ee("click", xe, $), ee("click", et, () => h()()), R(e, G), vt();
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
var Ql = /* @__PURE__ */ C('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), eo = /* @__PURE__ */ C('<div class="glass pane svelte-5g1i2z" role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div></div>');
function to(e, t) {
  ht(t, !0);
  let n = te(t, "frames", 19, () => []), r = te(t, "origin", 3, null), s = te(t, "onreveal", 3, () => {
  }), i = te(t, "onclose", 3, () => {
  });
  const l = 40;
  let u = /* @__PURE__ */ W(0), o = /* @__PURE__ */ W(0), d = /* @__PURE__ */ W(null), g = /* @__PURE__ */ W(De(/* @__PURE__ */ new Set()));
  const m = 4, p = 25, h = { x: 0, y: 0, w: 0, h: 0 }, v = /* @__PURE__ */ re(() => Math.max(0, a(u) - l * 2)), y = /* @__PURE__ */ re(() => Math.max(0, a(o) - l * 2)), c = /* @__PURE__ */ re(() => a(v) > 0 && a(y) > 0 ? I(n(), a(v), a(y)) : n().map(() => h));
  function _(w, z, P) {
    const H = [];
    let Q = 0, G = 0;
    for (let Y = 0; Y < w.length; Y++)
      G += mr(w[Y]), G * P + Et * (Y - Q) >= z && (H.push({ from: Q, to: Y + 1, sum: G }), Q = Y + 1, G = 0);
    return Q < w.length && H.push({ from: Q, to: w.length, sum: G }), H;
  }
  function x(w, z, P) {
    return w.map((H, Q) => {
      const G = (z - Et * (H.to - H.from - 1)) / H.sum;
      return Q === w.length - 1 && G > P ? P : G;
    });
  }
  function N(w, z, P) {
    return x(w, z, P).reduce((H, Q) => H + Q, 0) + Et * (w.length - 1);
  }
  function I(w, z, P) {
    let H = m, Q = Math.max(m, P);
    for (let X = 0; X < p; X++) {
      const B = (H + Q) / 2;
      N(_(w, z, B), z, B) <= P ? H = B : Q = B;
    }
    const G = _(w, z, H), Y = x(G, z, H), ne = [];
    let he = (P - (Y.reduce((X, B) => X + B, 0) + Et * (G.length - 1))) / 2;
    return G.forEach((X, B) => {
      const F = Y[B], V = [];
      for (let O = X.from; O < X.to; O++) V.push(mr(w[O]) * F);
      const k = V.reduce((O, ae) => O + ae, 0) + Et * (V.length - 1);
      let S = (z - k) / 2;
      for (const O of V)
        ne.push({
          x: Math.round(S),
          y: Math.round(he),
          w: Math.round(O),
          h: Math.round(F)
        }), S += O + Et;
      he += F + Et;
    }), ne;
  }
  function M(w) {
    if (!r() || !w || !w.w || !w.h) return "none";
    const z = r().left - (l + w.x), P = r().top - (l + w.y);
    return `translate(${z}px, ${P}px) scale(${r().width / w.w}, ${r().height / w.h})`;
  }
  function L(w) {
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
  Pn("keydown", pn, L), Pn("pointerdown", pn, U);
  var j = f($);
  on(j, "", {}, { inset: "40px" }), Ve(j, 23, n, (w) => w.id, (w, z, P) => {
    var H = Ql();
    let Q;
    var G = f(H);
    let Y;
    q(
      (ne, he) => {
        Q = on(H, "", Q, ne), le(G, "src", `/d/${a(z).s ?? ""}.webp`), Y = Se(G, 1, "svelte-5g1i2z", null, Y, he);
      },
      [
        () => ({
          left: `${a(c)[a(P)].x ?? ""}px`,
          top: `${a(c)[a(P)].y ?? ""}px`,
          width: `${a(c)[a(P)].w ?? ""}px`,
          height: `${a(c)[a(P)].h ?? ""}px`,
          "--flight": M(a(c)[a(P)])
        }),
        () => ({ loaded: a(g).has(a(z).id) })
      ]
    ), ee("click", H, () => s()(a(z))), Pn("load", G, () => E(g, new Set(a(g)).add(a(z).id), !0)), R(w, H);
  }), _r($, (w) => E(d, w), () => a(d)), q(() => le($, "aria-label", `${n().length ?? ""} frames in this stack`)), Gr("innerWidth", (w) => E(u, w, !0)), Gr("innerHeight", (w) => E(o, w, !0)), R(e, $), vt();
}
Nt(["click"]);
var no = /* @__PURE__ */ C('<span class="err svelte-uzy12d"> </span>'), ro = /* @__PURE__ */ C(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), ao = /* @__PURE__ */ C(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), so = /* @__PURE__ */ C('<span class="muted svelte-uzy12d"> </span>'), io = /* @__PURE__ */ C('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function lo(e, t) {
  ht(t, !0);
  let n = /* @__PURE__ */ W(null), r = /* @__PURE__ */ W(!1), s = /* @__PURE__ */ W(null);
  async function i() {
    E(r, !0), E(s, null);
    try {
      E(n, await ze.probe(), !0);
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
      q(() => T(y, a(s))), R(h, v);
    }, m = (h) => {
      var v = ra(), y = Ze(v);
      {
        var c = (x) => {
          var N = ro(), I = b(f(N), 2);
          q(
            (M) => T(I, ` above are formats the header
        reader cannot measure (${M ?? ""}) or files with no
        extension.`),
            [() => a(n).formats.join(" ")]
          ), R(x, N);
        }, _ = (x) => {
          var N = ao(), I = f(N), M = f(I), L = b(I, 2), U = f(L);
          q(
            ($) => {
              T(M, $), T(U, a(n).command);
            },
            [() => Me(a(n).worklist)]
          ), R(x, N);
        };
        K(y, (x) => {
          a(n).worklist === 0 ? x(c) : x(_, -1);
        });
      }
      R(h, v);
    }, p = (h) => {
      var v = so(), y = f(v);
      q(() => T(y, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), R(h, v);
    };
    K(d, (h) => {
      a(s) ? h(g) : a(n) ? h(m, 1) : h(p, -1);
    });
  }
  q(() => {
    u.disabled = a(r), T(o, a(r) ? "counting…" : "Check the dimension probe's worklist");
  }), ee("click", u, i), R(e, l), vt();
}
Nt(["click"]);
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
  ht(t, !0);
  let n = /* @__PURE__ */ W(null), r = /* @__PURE__ */ W(!1), s = /* @__PURE__ */ W(null), i = /* @__PURE__ */ W(null);
  const l = /* @__PURE__ */ re(() => a(n)?.state === "running"), u = /* @__PURE__ */ re(() => a(n)?.snapshot ? a(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const x = await ze.rebuildStatus();
      E(n, x, !0), E(s, null), x.state === "done" && x.started_at !== a(i) && (E(i, x.started_at, !0), t.oncomplete?.());
    } catch (x) {
      E(s, String(x), !0);
    }
  }
  Hn(() => {
    o();
  }), rn(() => {
    if (!a(l)) return;
    const x = setInterval(o, 700);
    return () => clearInterval(x);
  });
  async function d() {
    E(r, !0), E(s, null);
    try {
      E(n, await ze.rebuild(), !0);
    } catch (x) {
      E(s, String(x), !0);
    }
  }
  function g(x) {
    x.key === "Escape" && E(r, !1);
  }
  var m = _o();
  Pn("keydown", pn, g);
  var p = Ze(m), h = f(p), v = f(h), y = b(h, 2), c = b(p, 2);
  {
    var _ = (x) => {
      var N = go(), I = Ze(N), M = b(I, 2), L = f(M), U = b(f(L), 4), $ = f(U), j = b(U, 2), w = b(L, 2);
      {
        var z = (X) => {
          var B = oo(), F = f(B);
          q(() => T(F, a(s))), R(X, B);
        };
        K(w, (X) => {
          a(s) && X(z);
        });
      }
      var P = b(w, 2);
      Ve(P, 17, () => a(n)?.steps ?? [], mt, (X, B) => {
        var F = co();
        let V;
        var k = f(F), S = f(k), O = f(S);
        {
          var ae = (de) => {
            var oe = Mn("✓");
            R(de, oe);
          }, Ee = (de) => {
            var oe = Mn("✕");
            R(de, oe);
          }, ie = (de) => {
            var oe = Mn("·");
            R(de, oe);
          }, ve = (de) => {
            var oe = Mn(" ");
            R(de, oe);
          };
          K(O, (de) => {
            a(B).state === "done" ? de(ae) : a(B).state === "failed" ? de(Ee, 1) : a(B).state === "running" ? de(ie, 2) : de(ve, -1);
          });
        }
        var Ue = b(S, 2), pe = f(Ue), ke = b(Ue, 4), We = f(ke), Ge = b(k, 2);
        {
          var ut = (de) => {
            var oe = uo(), xe = f(oe);
            q((Ce) => T(xe, Ce), [() => a(B).log.join(`
`)]), R(de, oe);
          };
          K(Ge, (de) => {
            a(B).log.length && de(ut);
          });
        }
        q(() => {
          V = Se(F, 1, "step svelte-1xjbga", null, V, {
            on: a(B).state === "running",
            bad: a(B).state === "failed"
          }), T(pe, a(B).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), T(We, a(B).seconds === null ? "" : a(B).seconds + "s");
        }), R(X, F);
      });
      var H = b(P, 2);
      {
        var Q = (X) => {
          var B = fo(), F = Ze(B), V = f(F);
          q(() => T(V, a(n).error)), R(X, B);
        }, G = (X) => {
          var B = ho();
          R(X, B);
        }, Y = (X) => {
          var B = vo();
          R(X, B);
        };
        K(H, (X) => {
          a(n)?.state === "failed" ? X(Q) : a(n)?.state === "done" ? X(G, 1) : a(l) && X(Y, 2);
        });
      }
      var ne = b(H, 2);
      {
        var he = (X) => {
          var B = po(), F = b(f(B), 6), V = f(F);
          q(() => T(V, `python -m photolib.restore_state ${a(u) ?? ""}`)), R(X, B);
        };
        K(ne, (X) => {
          a(u) && X(he);
        });
      }
      q(() => T($, `${a(n)?.seconds ?? 0 ?? ""}s`)), ee("click", I, () => E(r, !1)), ee("click", j, () => E(r, !1)), R(x, N);
    };
    K(c, (x) => {
      a(r) && x(_);
    });
  }
  q(() => {
    h.disabled = a(l), T(v, a(l) ? "applying…" : "Apply to grid"), y.disabled = !a(n) || a(n).state === "idle";
  }), ee("click", h, d), ee("click", y, () => E(r, !0)), R(e, m), vt();
}
Nt(["click"]);
var mo = /* @__PURE__ */ C('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), Ma = /* @__PURE__ */ C("<option> </option>"), wo = /* @__PURE__ */ C('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), yo = /* @__PURE__ */ C('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), xo = /* @__PURE__ */ C('<div class="none muted svelte-bqi9ky"> </div>'), ko = /* @__PURE__ */ C('<div class="bar svelte-bqi9ky"><!></div>');
function So(e, t) {
  ht(t, !0);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), u = /* @__PURE__ */ re(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ re(() => !!n() && n().op !== "is null");
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
      var c = mo(), _ = f(c), x = f(_), N = b(_, 2), I = f(N);
      q(() => {
        T(x, `${t.screen.title ?? ""} does not save a rule.`), T(I, t.screen.blurb);
      }), R(y, c);
    }, h = (y) => {
      var c = yo(), _ = Ze(c), x = f(_);
      Ve(x, 21, () => s, mt, (F, V) => {
        var k = Ma(), S = f(k), O = {};
        q(() => {
          T(S, a(V)), O !== (O = a(V)) && (k.value = (k.__value = a(V)) ?? "");
        }), R(F, k);
      });
      var N;
      sr(x);
      var I = b(x, 2);
      Ve(I, 21, () => a(u), mt, (F, V) => {
        var k = Ma(), S = f(k), O = {};
        q(() => {
          T(S, a(V)), O !== (O = a(V)) && (k.value = (k.__value = a(V)) ?? "");
        }), R(F, k);
      });
      var M;
      sr(I);
      var L = b(I, 2);
      {
        var U = (F) => {
          var V = wo();
          q(() => an(V, n().value ?? "")), ee("input", V, (k) => d("value", k.currentTarget.value)), R(F, V);
        };
        K(L, (F) => {
          a(o) && F(U);
        });
      }
      var $ = b(L, 2), j = f($);
      j.value = j.__value = "exclude";
      var w = b(j);
      w.value = w.__value = "include";
      var z;
      sr($);
      var P = b($, 2), H = f(P);
      H.value = H.__value = "end";
      var Q = b(H);
      Q.value = Q.__value = "0";
      var G;
      sr(P);
      var Y = b(P, 2), ne = f(Y), he = b(Y, 2), X = b(_, 2), B = f(X);
      q(
        (F, V) => {
          N !== (N = n().column) && (x.value = (x.__value = n().column) ?? "", Xn(x, n().column)), M !== (M = n().op) && (I.value = (I.__value = n().op) ?? "", Xn(I, n().op)), z !== (z = n().decision ?? "exclude") && ($.value = ($.__value = n().decision ?? "exclude") ?? "", Xn($, n().decision ?? "exclude")), G !== (G = F) && (P.value = (P.__value = F) ?? "", Xn(P, F)), Y.disabled = r(), T(ne, r() ? "saving…" : "Confirm"), T(B, `${V ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => ul(n())
        ]
      ), ee("change", x, (F) => d("column", F.currentTarget.value)), ee("change", I, (F) => d("op", F.currentTarget.value)), ee("change", $, (F) => d("decision", F.currentTarget.value)), ee("change", P, (F) => d("at", F.currentTarget.value)), ee("click", Y, function(...F) {
        t.onconfirm?.apply(this, F);
      }), ee("click", he, function(...F) {
        t.onclear?.apply(this, F);
      }), R(y, c);
    }, v = (y) => {
      var c = xo(), _ = f(c);
      q(() => T(_, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), R(y, c);
    };
    K(m, (y) => {
      t.screen.rule === !1 ? y(p) : n() ? y(h, 1) : y(v, -1);
    });
  }
  R(e, g), vt();
}
Nt(["change", "input", "click"]);
var Eo = /* @__PURE__ */ C('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), To = /* @__PURE__ */ C('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), Mo = /* @__PURE__ */ C('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Ao = /* @__PURE__ */ C('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Ro(e, t) {
  ht(t, !0);
  let n = te(t, "rules", 19, () => []), r = te(t, "unmatched", 3, null), s = te(t, "busy", 3, !1);
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
  Ve(m, 19, n, (v) => v.id, (v, y, c) => {
    var _ = To();
    let x;
    var N = f(_), I = f(N), M = f(I), L = b(I, 2), U = f(L), $ = b(L, 2), j = f($), w = b(N, 2), z = f(w), P = f(z), H = b(z, 2), Q = f(H), G = b(H, 4), Y = b(G, 2), ne = b(Y, 2);
    q(
      (he, X) => {
        x = Se(_, 1, "rule svelte-aof9c2", null, x, { exclude: a(y).decision === "exclude" }), T(M, a(c)), T(U, a(y).predicate), T(j, a(y).decision), T(P, `${he ?? ""} paths`), T(Q, X), G.disabled = s() || a(c) === 0, Y.disabled = s() || a(c) === n().length - 1, ne.disabled = s();
      },
      [
        () => Me(a(y).paths),
        () => Tt(a(y).bytes)
      ]
    ), ee("click", G, () => t.onmove(a(y), a(c) - 1)), ee("click", Y, () => t.onmove(a(y), a(c) + 1)), ee("click", ne, () => t.ondelete(a(y))), R(v, _);
  });
  var p = b(m, 2);
  {
    var h = (v) => {
      var y = Mo(), c = b(f(y), 2), _ = f(c), x = f(_), N = b(_, 2), I = f(N);
      q(
        (M, L) => {
          T(x, `${M ?? ""} paths`), T(I, L);
        },
        [
          () => Me(r().paths),
          () => Tt(r().bytes)
        ]
      ), R(v, y);
    };
    K(p, (v) => {
      r() && v(h);
    });
  }
  q(() => T(o, `${n().length ?? ""} rules · top-down, first match wins`)), R(e, i), vt();
}
Nt(["click"]);
const Aa = 2500, Po = 1, Co = 2, No = 3e7;
function Oo(e, t, n) {
  const r = [], s = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, d = 0, g = null, m = null, p = null, h = !1, v = !1, y = 0, c = 0, _ = 0, x = n.onState || (() => {
  });
  function N(k) {
    y <= 0 || (o = Zl(r, o, y, k, (S, O, ae) => {
      s.push({ top: d, height: ae, from: S, to: O }), d += ae + Et;
    }), M());
  }
  function I() {
    if (m === null || h || y <= 0 || o >= m) return 0;
    const k = s.length ? o / s.length : Math.max(1, y / br), S = s.length ? d / s.length : br + Et, O = Math.round((m - o) / k * S);
    return Math.max(0, Math.min(O, No - d));
  }
  function M() {
    e.style.height = d + I() + "px", t.style.top = Math.max(0, d - 1) + "px";
  }
  function L() {
    return window.scrollY - e.offsetTop;
  }
  function U() {
    const k = l.pop();
    if (k) return k;
    const S = document.createElement("div");
    S.className = "tile";
    const O = document.createElement("img");
    return O.decoding = "async", O.addEventListener("load", () => S.classList.add("loaded")), O.addEventListener("error", () => S.classList.add("missing")), S.appendChild(O), n.extend && n.extend(S), S;
  }
  function $(k, S) {
    S.firstChild.removeAttribute("src"), S.classList.remove("loaded", "missing", "error"), S.style.backgroundImage = "", S.remove(), i.delete(k), l.push(S);
  }
  function j(k, S, O, ae, Ee, ie) {
    let ve = i.get(k);
    const Ue = r[k];
    if (!ve) {
      ve = U(), ve.dataset.index = String(k);
      const pe = ve.firstChild;
      pe.fetchPriority = ie ? "high" : "low", pe.src = "/t/" + Ue.s + ".webp", u.push(k), n.fill && n.fill(ve, Ue), e.appendChild(ve), i.set(k, ve);
    }
    ve.style.width = ae + "px", ve.style.height = Ee + "px", ve.style.transform = "translate(" + S + "px," + O + "px)";
  }
  function w(k, S) {
    S.th && (S.url === void 0 && (S.url = n.thumbHash(S.th)), S.url && (k.style.backgroundImage = "url(" + S.url + ")"));
  }
  function z() {
    _ = 0;
    for (const k of u) {
      const S = i.get(k);
      S && !S.classList.contains("loaded") && w(S, r[k]);
    }
    u.length = 0;
  }
  function P(k, S) {
    let O = 0;
    for (let ae = k.from; ae < k.to; ae++) {
      const ie = ae === k.to - 1 ? y - O : Math.round(mr(r[ae]) * k.height);
      j(ae, O, k.top, ie, k.height, S), O += ie + Et;
    }
  }
  function H() {
    const k = window.innerHeight, S = L(), O = Ta(s, S - k * Po, S + k * (1 + Co));
    if (!O) return;
    const ae = s[O[0]].from, Ee = s[O[1]].to;
    for (const [ie, ve] of Array.from(i))
      (ie < ae || ie >= Ee) && $(ie, ve);
    for (let ie = O[0]; ie <= O[1]; ie++) {
      const ve = s[ie];
      P(ve, ve.top < S + k && ve.top + ve.height > S);
    }
    u.length && !_ && (_ = requestAnimationFrame(z));
  }
  function Q() {
    return y <= 0 ? !1 : d - (L() + window.innerHeight) < Aa;
  }
  async function G() {
    if (v || h) return;
    v = !0;
    const k = c;
    x({ loading: !0, count: r.length, exhausted: h, total: m, tiles: p });
    try {
      do {
        const S = await n.fetchPage(g);
        if (k !== c) return;
        for (const O of S.photos) r.push(O);
        g = S.next, h = g === null, typeof S.stacks == "number" ? (m = S.stacks, p = typeof S.total == "number" ? S.total : null) : typeof S.total == "number" && (m = S.total), N(h), H(), x({ loading: !0, count: r.length, exhausted: h, total: m, tiles: p });
      } while (!h && Q());
    } catch (S) {
      k === c && x({ error: String(S) });
    } finally {
      k === c && (v = !1, x({ loading: !1, count: r.length, exhausted: h, total: m, tiles: p }));
    }
  }
  let Y = 0;
  function ne() {
    Y || (Y = requestAnimationFrame(() => {
      Y = 0, H(), Q() && G();
    }));
  }
  function he() {
    const k = e.clientWidth;
    if (k === y) return;
    const S = Ta(s, L(), L()), O = S ? s[S[0]].from : 0;
    y = k;
    for (const [Ee, ie] of Array.from(i)) $(Ee, ie);
    s.length = 0, o = 0, d = 0, N(h), H();
    const ae = s.find((Ee) => Ee.to > O);
    ae && window.scrollTo(0, ae.top + e.offsetTop), Q() && G();
  }
  function X(k) {
    const S = k.target.closest(".tile");
    if (!S || !e.contains(S)) return;
    const O = r[Number(S.dataset.index)];
    O && n.activate && n.activate(O, k, S);
  }
  e.addEventListener("click", X), window.addEventListener("scroll", ne, { passive: !0 });
  let B = 0;
  const F = new ResizeObserver(() => {
    clearTimeout(B), B = setTimeout(he, 100);
  });
  F.observe(e);
  const V = new IntersectionObserver(
    (k) => {
      k.some((S) => S.isIntersecting) && G();
    },
    { rootMargin: "0px 0px " + Aa + "px 0px" }
  );
  return V.observe(t), y = e.clientWidth, G(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      c++, v = !1;
      for (const [k, S] of Array.from(i)) $(k, S);
      r.length = 0, s.length = 0, u.length = 0, o = 0, d = 0, g = null, m = null, p = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), G();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(k) {
      const S = typeof k == "number" ? k : null;
      S !== m && (m = S, M(), x({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [k, S] of i) n.fill(S, r[k]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(k) {
      for (const [S, O] of i)
        r[S] === k && n.fill && n.fill(O, k);
    },
    destroy() {
      c++, e.removeEventListener("click", X), window.removeEventListener("scroll", ne), F.disconnect(), V.disconnect(), clearTimeout(B), cancelAnimationFrame(_);
    }
  };
}
function Io(e) {
  try {
    const t = Uint8Array.from(atob(e), (P) => P.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, d = (r >> 3 & 63) / 63, g = (r >> 9 & 63) / 63, m = r >> 15, p = Math.max(3, m ? o ? 5 : 7 : r & 7), h = Math.max(3, m ? r & 7 : o ? 5 : 7);
    let v = o ? 6 : 5, y = 0;
    const c = (P, H, Q) => {
      const G = [];
      for (let Y = 0; Y < H; Y++)
        for (let ne = Y ? 0 : 1; ne * H < P * (H - Y); ne++) {
          const he = t[v + (y >> 1)] >> ((y++ & 1) << 2) & 15;
          G.push((he / 7.5 - 1) * Q);
        }
      return G;
    }, _ = c(p, h, u), x = c(3, 3, d * 1.25), N = c(3, 3, g * 1.25), I = p / h, M = Math.max(1, Math.round(I > 1 ? 32 : 32 * I)), L = Math.max(1, Math.round(I > 1 ? 32 / I : 32)), U = document.createElement("canvas");
    U.width = M, U.height = L;
    const $ = U.getContext("2d"), j = $.createImageData(M, L), w = [], z = [];
    for (let P = 0, H = 0; P < L; P++)
      for (let Q = 0; Q < M; Q++, H += 4) {
        let G = s, Y = i, ne = l;
        for (let F = 0; F < p; F++) w[F] = Math.cos(Math.PI / M * (Q + 0.5) * F);
        for (let F = 0; F < h; F++) z[F] = Math.cos(Math.PI / L * (P + 0.5) * F);
        for (let F = 0, V = 0; F < h; F++)
          for (let k = F ? 0 : 1; k * h < p * (h - F); k++, V++)
            G += _[V] * w[k] * z[F] * 2;
        for (let F = 0, V = 0; F < 3; F++)
          for (let k = F ? 0 : 1; k < 3 - F; k++, V++) {
            const S = w[k] * z[F] * 2;
            Y += x[V] * S, ne += N[V] * S;
          }
        const he = G - 2 / 3 * Y, X = (3 * G - he + ne) / 2, B = X - ne;
        j.data[H] = Math.max(0, Math.min(255, Math.round(255 * X))), j.data[H + 1] = Math.max(0, Math.min(255, Math.round(255 * B))), j.data[H + 2] = Math.max(0, Math.min(255, Math.round(255 * he))), j.data[H + 3] = 255;
      }
    return $.putImageData(j, 0, 0), U.toDataURL();
  } catch {
    return null;
  }
}
var Fo = /* @__PURE__ */ C('<main id="canvas"><div id="sentinel"></div></main>');
function Lo(e, t) {
  ht(t, !0);
  let n = te(t, "key", 3, ""), r = te(t, "total", 3, null), s = te(t, "triage", 3, !1), i = te(t, "excludedDirs", 19, () => []), l = te(t, "onActivate", 3, () => {
  }), u = te(t, "onOverride", 3, async () => null), o = te(t, "onExcludeFolder", 3, () => {
  }), d = te(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ W(null), m = /* @__PURE__ */ W(null), p = null, h = "";
  const v = { null: "exclude", exclude: "include", include: "clear" };
  function y(M) {
    const L = M.toLowerCase().startsWith(Ln.toLowerCase()) ? M.slice(Ln.length + 1) : M;
    return L.length > 64 ? "…" + L.slice(-64) : L;
  }
  function c(M) {
    const L = document.createElement("div");
    L.className = "tile-path", M.appendChild(L);
    const U = document.createElement("button");
    U.className = "chip", U.type = "button", M.appendChild(U);
    const $ = document.createElement("button");
    $.className = "dirchip", $.type = "button", $.textContent = "dir", M.appendChild($);
  }
  function _(M, L) {
    const U = M.querySelector(".tile-path");
    U && (U.textContent = L.p ? y(L.p) : "");
    const $ = M.querySelector(".dirchip");
    if ($) {
      const w = vs(L.p ?? ""), z = w !== "" && sa(i(), w);
      $.hidden = w === "", $.disabled = z, $.dataset.state = z ? "exclude" : "none", $.title = z ? `already excluded: ${w}` : `exclude everything under ${w}, subfolders included — one exclude rule at the end of the order`;
    }
    const j = M.querySelector(".chip");
    j && (j.dataset.state = L.o || "none", j.textContent = L.o === "exclude" ? "drop" : L.o === "include" ? "keep" : "·", j.title = L.o === "exclude" ? "overridden: excluded — click to keep" : L.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Hn(() => (p = Oo(a(g), a(m), {
    fetchPage: (M) => t.fetchPage(M),
    thumbHash: Io,
    extend: s() ? c : void 0,
    fill: s() ? _ : void 0,
    onState: (M) => d()(M),
    activate: async (M, L, U) => {
      if (L.target.closest(".dirchip")) {
        o()(M);
        return;
      }
      if (!L.target.closest(".chip")) {
        l()(M, U);
        return;
      }
      const $ = v[M.o ?? "null"];
      M.o = await u()(M, $), _(U, M);
    }
  }), h = n(), () => p?.destroy())), rn(() => {
    const M = n(), L = r();
    p && (M !== h && (h = M, p.reset()), p.setTotal(L));
  });
  let x = "";
  rn(() => {
    const M = i().join(`
`);
    !p || M === x || (x = M, p.refill());
  });
  var N = Fo(), I = f(N);
  _r(I, (M) => E(m, M), () => a(m)), _r(N, (M) => E(g, M), () => a(g)), R(e, N), vt();
}
var zo = /* @__PURE__ */ C('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Do = /* @__PURE__ */ C('<th class="num svelte-1v3p82v"> </th>'), jo = /* @__PURE__ */ C('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Ho = /* @__PURE__ */ C('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), qo = /* @__PURE__ */ C('<td class="num svelte-1v3p82v"> </td>'), Bo = /* @__PURE__ */ C('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), $o = /* @__PURE__ */ C('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Uo(e, t) {
  ht(t, !0);
  let n = te(t, "rows", 19, () => []), r = te(t, "rules", 19, () => []), s = te(t, "root", 3, null), i = te(t, "selected", 3, null), l = te(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ re(() => t.screen.rule !== !1);
  function o(y) {
    return t.screen.label ? t.screen.label(y) : y.key;
  }
  const d = /* @__PURE__ */ re(() => new Map(n().map((y) => [
    y.key,
    t.screen.rule === !1 ? null : ps(r(), t.screen.toRule(y, s()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var p = ra(), h = Ze(p);
  {
    var v = (y) => {
      var c = $o(), _ = f(c), x = f(_), N = f(x);
      {
        var I = (w) => {
          var z = zo();
          R(w, z);
        };
        K(N, (w) => {
          a(u) && w(I);
        });
      }
      var M = b(N), L = f(M), U = b(M, 3);
      {
        var $ = (w) => {
          var z = Do(), P = f(z);
          q(() => T(P, t.screen.heading[1])), R(w, z);
        };
        K(U, (w) => {
          t.screen.heading[1] && w($);
        });
      }
      var j = b(_);
      Ve(j, 23, n, (w) => w.key, (w, z, P) => {
        const H = /* @__PURE__ */ re(() => a(d).get(a(z).key));
        var Q = Bo();
        let G;
        var Y = f(Q);
        {
          var ne = (pe) => {
            const ke = /* @__PURE__ */ re(() => l().has(a(z).key));
            var We = jo(), Ge = f(We);
            let ut;
            var de = f(Ge);
            q(
              (oe) => {
                ut = Se(Ge, 1, "tick svelte-1v3p82v", null, ut, { on: a(ke) }), le(Ge, "aria-checked", a(ke)), le(Ge, "aria-label", `select ${oe ?? ""}`), T(de, a(ke) ? "✓" : "");
              },
              [() => o(a(z))]
            ), ee("click", Ge, (oe) => {
              oe.stopPropagation(), t.oncheck(a(z), a(P), oe.shiftKey);
            }), R(pe, We);
          };
          K(Y, (pe) => {
            a(u) && pe(ne);
          });
        }
        var he = b(Y), X = f(he);
        let B;
        var F = f(X), V = b(X), k = b(V);
        {
          var S = (pe) => {
            var ke = Ho();
            R(pe, ke);
          };
          K(k, (pe) => {
            a(z).scope === "whole inventory" && pe(S);
          });
        }
        var O = b(he), ae = f(O), Ee = b(O), ie = f(Ee), ve = b(Ee);
        {
          var Ue = (pe) => {
            var ke = qo(), We = f(ke);
            q(() => T(We, a(z).detail ?? "")), R(pe, ke);
          };
          K(ve, (pe) => {
            t.screen.heading[1] && pe(Ue);
          });
        }
        q(
          (pe, ke, We) => {
            G = Se(Q, 1, "svelte-1v3p82v", null, G, {
              picked: i() === a(z).key,
              clickable: t.screen.sheet !== !1
            }), B = Se(X, 1, "mark svelte-1v3p82v", null, B, {
              exclude: a(H) === "exclude",
              include: a(H) === "include"
            }), le(X, "title", m[a(H)] ?? ""), T(F, g[a(H)] ?? ""), T(V, `${pe ?? ""} `), T(ae, ke), T(ie, We);
          },
          [
            () => o(a(z)),
            () => Me(a(z).paths),
            () => Tt(a(z).bytes)
          ]
        ), ee("click", Q, () => t.onpick(a(z))), R(w, Q);
      }), q(() => T(L, t.screen.heading[0] ?? "")), R(y, c);
    };
    K(h, (y) => {
      n().length && y(v);
    });
  }
  R(e, p), vt();
}
Nt(["click"]);
var Go = /* @__PURE__ */ C('<button class="twisty svelte-pucy57"> </button>'), Yo = /* @__PURE__ */ C('<span class="twisty leaf svelte-pucy57">·</span>'), Wo = /* @__PURE__ */ C('<span class="name root svelte-pucy57"> </span>'), Vo = /* @__PURE__ */ C('<button class="name svelte-pucy57"> </button>'), Xo = /* @__PURE__ */ C('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Ko = /* @__PURE__ */ C('<div class="note svelte-pucy57"> </div>'), Jo = /* @__PURE__ */ C('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Zo = /* @__PURE__ */ C('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Qo = /* @__PURE__ */ C('<div class="tree svelte-pucy57"></div>');
function eu(e, t) {
  ht(t, !0);
  let n = te(t, "version", 3, 0), r = te(t, "excludedDirs", 19, () => []), s = te(t, "selected", 3, null), i = te(t, "busy", 3, !1), l = /* @__PURE__ */ W(De(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ W(De(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ W(De(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ W(De(/* @__PURE__ */ new Set()));
  async function g(c) {
    E(o, new Set(a(o)).add(c), !0);
    const _ = await t.onload(c), x = new Map(a(l)), N = new Set(a(d));
    _ ? (x.set(c, _), N.delete(c)) : N.add(c), E(l, x, !0), E(d, N, !0), E(o, new Set([...a(o)].filter((I) => I !== c)), !0);
  }
  function m(c) {
    if (a(u).has(c)) {
      E(u, new Set([...a(u)].filter((_) => _ !== c)), !0);
      return;
    }
    E(u, new Set(a(u)).add(c), !0), a(l).has(c) || g(c);
  }
  let p = -1;
  rn(() => {
    const c = n();
    if (c !== p) {
      p = c, a(u).has(t.root) || E(u, new Set(a(u)).add(t.root), !0);
      for (const _ of a(u)) g(_);
    }
  });
  const h = /* @__PURE__ */ re(() => {
    const c = [], _ = (M, L, U, $, j, w) => {
      const z = a(l).get(M), P = a(u).has(M);
      if (c.push({
        key: M,
        name: L,
        depth: U,
        paths: $,
        bytes: j,
        deeper: w,
        expanded: P,
        here: z?.here ?? null,
        truncated: !!z?.truncated,
        loading: a(o).has(M),
        failed: a(d).has(M),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: sa(r(), M)
      }), !(!P || !z))
        for (const H of z.children)
          _(H.path, H.name, U + 1, H.paths, H.bytes, H.deeper);
    }, x = a(l).get(t.root), N = x ? x.children.reduce((M, L) => M + L.paths, 0) + x.here.paths : 0, I = x ? x.children.reduce((M, L) => M + L.bytes, 0) + x.here.bytes : 0;
    return _(t.root, t.root, 0, N, I, !0), c;
  }), v = 8;
  var y = Qo();
  Ve(y, 21, () => a(h), (c) => c.key, (c, _) => {
    var x = Zo(), N = Ze(x);
    let I;
    var M = f(N);
    let L;
    var U = b(M, 2);
    {
      var $ = (k) => {
        var S = Go(), O = f(S);
        q(() => {
          le(S, "aria-expanded", a(_).expanded), le(S, "aria-label", `${a(_).expanded ? "collapse" : "expand"} ${a(_).name ?? ""}`), le(S, "title", a(_).expanded ? "collapse" : "expand"), T(O, a(_).loading ? "·" : a(_).expanded ? "▾" : "▸");
        }), ee("click", S, () => m(a(_).key)), R(k, S);
      }, j = (k) => {
        var S = Yo();
        R(k, S);
      };
      K(U, (k) => {
        a(_).deeper ? k($) : k(j, -1);
      });
    }
    var w = b(U, 2);
    {
      var z = (k) => {
        var S = Wo(), O = f(S);
        q(() => T(O, a(_).key)), R(k, S);
      }, P = (k) => {
        var S = Vo(), O = f(S);
        q(() => {
          le(S, "title", `Show every kept file under ${a(_).key ?? ""}`), T(O, a(_).name);
        }), ee("click", S, () => t.onpick(a(_))), R(k, S);
      };
      K(w, (k) => {
        a(_).depth === 0 ? k(z) : k(P, -1);
      });
    }
    var H = b(w, 2), Q = f(H), G = b(H, 2), Y = f(G), ne = b(G, 2), he = b(N, 2);
    {
      var X = (k) => {
        var S = Xo();
        let O;
        q((ae) => O = on(S, "", O, ae), [
          () => ({
            "padding-left": `${Math.min(a(_).depth, v) * 11 + 18}px`
          })
        ]), R(k, S);
      }, B = (k) => {
        var S = Ko();
        let O;
        var ae = f(S);
        q(
          (Ee, ie, ve) => {
            O = on(S, "", O, Ee), T(ae, `${ie ?? ""} directly here · ${ve ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(a(_).depth, v) * 11 + 18}px`
            }),
            () => Me(a(_).here.paths),
            () => Tt(a(_).here.bytes)
          ]
        ), R(k, S);
      };
      K(he, (k) => {
        a(_).expanded && a(_).failed ? k(X) : a(_).expanded && a(_).here && a(_).here.paths > 0 && k(B, 1);
      });
    }
    var F = b(he, 2);
    {
      var V = (k) => {
        var S = Jo();
        let O;
        q((ae) => O = on(S, "", O, ae), [
          () => ({
            "padding-left": `${Math.min(a(_).depth, v) * 11 + 18}px`
          })
        ]), R(k, S);
      };
      K(F, (k) => {
        a(_).truncated && k(V);
      });
    }
    q(
      (k, S, O) => {
        I = Se(N, 1, "row svelte-pucy57", null, I, {
          picked: s() === a(_).key,
          gone: a(_).excluded
        }), L = on(M, "", L, k), T(Q, S), T(Y, O), ne.disabled = i() || a(_).excluded || a(_).depth === 0, le(ne, "title", a(_).depth === 0 ? "The library root is not excludable from here." : a(_).excluded ? "already excluded" : `Exclude everything under ${a(_).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(a(_).depth, v) * 11}px` }),
        () => Me(a(_).paths),
        () => Tt(a(_).bytes)
      ]
    ), ee("click", ne, () => t.onexclude(a(_))), R(c, x);
  }), R(e, y), vt();
}
Nt(["click"]);
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
  let u = /* @__PURE__ */ W(De(wl())), o = /* @__PURE__ */ W(!0), d = /* @__PURE__ */ W(!1), g = /* @__PURE__ */ W(De(ys())), m = /* @__PURE__ */ W(De(window.innerWidth));
  const p = (P) => a(g) === "light" ? P.light : P.dark, h = (P) => P in sn ? sn : en, v = (P) => `rgba(${P.r}, ${P.g}, ${P.b}, ${P.a})`, y = /* @__PURE__ */ re(() => JSON.stringify(a(u), null, 2));
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
    E(u, Cr({ ...a(u), ...P }), !0), localStorage.setItem(n, JSON.stringify(a(u))), E(d, !1);
  }
  function _(P) {
    E(u, Cr(P), !0), localStorage.setItem(n, JSON.stringify(a(u))), E(d, !1);
  }
  function x(P) {
    c({ [P]: h(P)[P] });
  }
  function N() {
    E(g, xs(a(g) === "dark" ? "light" : "dark"), !0);
  }
  async function I() {
    await navigator.clipboard.writeText(a(y)), E(d, !0);
  }
  var M = ou();
  let L;
  var U = f(M), $ = b(f(U), 4), j = f($), w = b(U, 2);
  {
    var z = (P) => {
      var H = lu();
      {
        const Ge = (de, oe = ir, xe = ir, Ce = ir) => {
          var et = tu();
          let Xe;
          q(() => {
            Xe = Se(et, 1, "undo svelte-1hh0fwb", null, Xe, { idle: !xe() }), le(et, "aria-label", `Reset ${oe() ?? ""}`);
          }), ee("click", et, function(...ct) {
            Ce()?.apply(this, ct);
          }), R(de, et);
        };
        var Q = b(f(H), 2);
        Ve(Q, 17, () => r, mt, (de, oe) => {
          var xe = ru(), Ce = f(xe), et = f(Ce), Xe = b(Ce, 2), ct = f(Xe), kt = b(Xe, 2);
          Ve(kt, 17, () => a(oe).rows, mt, (Ot, Vt) => {
            var pt = /* @__PURE__ */ re(() => Tr(a(Vt), 5));
            let D = () => a(pt)[0], Z = () => a(pt)[1], se = () => a(pt)[2], we = () => a(pt)[3], ge = () => a(pt)[4];
            const fe = /* @__PURE__ */ re(() => a(u)[D()] !== h(D())[D()]), ye = /* @__PURE__ */ re(() => typeof we() == "function" ? we()(a(m)) : we());
            var je = nu();
            let Ne;
            var be = f(je), tt = f(be), Ie = b(be, 2), Ae = b(Ie, 2), Xt = b(Ae, 2);
            Ge(Xt, Z, () => a(fe), () => () => x(D())), q(() => {
              Ne = Se(je, 1, "row svelte-1hh0fwb", null, Ne, { moved: a(fe) }), T(tt, Z()), le(Ie, "min", se()), le(Ie, "max", a(ye)), le(Ie, "step", ge()), le(Ie, "aria-label", Z()), an(Ie, a(u)[D()]), le(Ae, "min", se()), le(Ae, "max", a(ye)), le(Ae, "step", ge()), le(Ae, "aria-label", `${Z() ?? ""} value`), an(Ae, a(u)[D()]);
            }), ee("input", Ie, (It) => c({ [D()]: Number(It.currentTarget.value) })), ee("input", Ae, (It) => c({ [D()]: Number(It.currentTarget.value) })), R(Ot, je);
          }), q(() => {
            T(et, a(oe).title), T(ct, a(oe).note);
          }), R(de, xe);
        });
        var G = b(Q, 2), Y = f(G), ne = b(G, 2), he = f(ne), X = b(ne, 2);
        Ve(X, 17, () => ml, mt, (de, oe) => {
          const xe = /* @__PURE__ */ re(() => p(a(oe))), Ce = /* @__PURE__ */ re(() => a(u)[a(xe)]), et = /* @__PURE__ */ re(() => a(oe).base[a(xe)]);
          var Xe = su(), ct = f(Xe), kt = f(ct), Ot = b(kt), Vt = f(Ot), pt = b(ct, 2), D = f(pt), Z = b(pt, 2);
          Ve(Z, 17, () => i, mt, (fe, ye) => {
            var je = /* @__PURE__ */ re(() => Tr(a(ye), 3));
            let Ne = () => a(je)[0], be = () => a(je)[1], tt = () => a(je)[2];
            const Ie = /* @__PURE__ */ re(() => a(Ce)[Ne()] !== a(et)[Ne()]);
            var Ae = au();
            let Xt;
            var It = f(Ae), A = f(It), J = b(It, 2), me = b(J, 2), Ke = b(me, 2);
            Ge(Ke, be, () => a(Ie), () => () => c({
              [a(xe)]: { ...a(Ce), [Ne()]: a(et)[Ne()] }
            })), q(() => {
              Xt = Se(Ae, 1, "row svelte-1hh0fwb", null, Xt, { moved: a(Ie) }), T(A, be()), le(J, "max", tt()), le(J, "step", tt() === 1 ? 0.01 : 1), le(J, "aria-label", `${a(g) ?? ""} ${s[a(oe).dark].title ?? ""} ${be() ?? ""}`), an(J, a(Ce)[Ne()]), le(me, "max", tt()), le(me, "step", tt() === 1 ? 0.01 : 1), le(me, "aria-label", `${a(g) ?? ""} ${s[a(oe).dark].title ?? ""} ${be() ?? ""} value`), an(me, a(Ce)[Ne()]);
            }), ee("input", J, (Oe) => c({
              [a(xe)]: {
                ...a(Ce),
                [Ne()]: Number(Oe.currentTarget.value)
              }
            })), ee("input", me, (Oe) => c({
              [a(xe)]: {
                ...a(Ce),
                [Ne()]: Number(Oe.currentTarget.value)
              }
            })), R(fe, Ae);
          });
          var se = b(Z, 2);
          let we;
          var ge = f(se);
          q(
            (fe, ye) => {
              T(kt, `${s[a(oe).dark].title ?? ""} `), T(Vt, a(g)), T(D, s[a(oe).dark].note), we = on(se, "", we, fe), T(ge, ye);
            },
            [
              () => ({ background: v(a(Ce)) }),
              () => v(a(Ce))
            ]
          ), R(de, Xe);
        });
        var B = b(X, 2), F = b(f(B), 4);
        let ut;
        var V = f(F), k = f(V), S = b(V, 2);
        Ge(S, () => "Blur at the edge", () => a(u).blurEdge !== sn.blurEdge, () => () => x("blurEdge"));
        var O = b(B, 2), ae = b(f(O), 4);
        Ve(ae, 21, () => l, mt, (de, oe) => {
          var xe = /* @__PURE__ */ re(() => Tr(a(oe), 2));
          let Ce = () => a(xe)[0], et = () => a(xe)[1];
          var Xe = iu(), ct = f(Xe), kt = f(ct), Ot = b(ct);
          q(() => {
            T(kt, Ce()), T(Ot, ` — ${et() ?? ""}`);
          }), R(de, Xe);
        });
        var Ee = b(O, 2), ie = b(f(Ee), 4), ve = f(ie), Ue = b(ve, 2), pe = b(Ue, 2), ke = f(pe), We = b(ie, 2);
        q(() => {
          T(Y, `The five colours below are per theme, and you are editing the ${a(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), T(he, `Edit the ${a(g) === "dark" ? "light" : "dark"} colours`), ut = Se(F, 1, "row toggle svelte-1hh0fwb", null, ut, { moved: a(u).blurEdge !== sn.blurEdge }), rl(k, a(u).blurEdge), T(ke, a(d) ? "Copied" : "Copy"), an(We, a(y));
        }), ee("click", ne, N), ee("change", k, (de) => c({ blurEdge: de.currentTarget.checked })), ee("click", ve, () => _(en)), ee("click", Ue, () => _(sn)), ee("click", pe, I);
      }
      R(P, H);
    };
    K(w, (P) => {
      a(o) && P(z);
    });
  }
  q(() => {
    L = Se(M, 1, "tuner svelte-1hh0fwb", null, L, { folded: !a(o) }), le($, "title", a(o) ? "Fold away" : "Open"), T(j, a(o) ? "–" : "+");
  }), Gr("innerWidth", (P) => E(m, P, !0)), ee("click", $, () => E(o, !a(o))), R(e, M), vt();
}
Nt(["click", "input", "change"]);
var cu = /* @__PURE__ */ C('<button><span class="n svelte-1n46o8q"> </span> </button>'), du = /* @__PURE__ */ C('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), fu = /* @__PURE__ */ C('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), hu = /* @__PURE__ */ C('<div class="muted pad svelte-1n46o8q">loading…</div>'), vu = /* @__PURE__ */ C('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), pu = /* @__PURE__ */ C('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), gu = /* @__PURE__ */ C('<p class="blurb"> </p>'), _u = /* @__PURE__ */ C('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), bu = /* @__PURE__ */ C('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), mu = /* @__PURE__ */ C('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), wu = /* @__PURE__ */ C('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), yu = /* @__PURE__ */ C("<div> </div>"), xu = /* @__PURE__ */ C('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function ku(e, t) {
  ht(t, !0);
  const n = location.pathname === "/tune";
  let r = /* @__PURE__ */ W("grid"), s = /* @__PURE__ */ W(0), i = /* @__PURE__ */ W(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ W(De([])), u = /* @__PURE__ */ W(null), o = /* @__PURE__ */ W(null), d = /* @__PURE__ */ W(De(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ W(null), m = /* @__PURE__ */ W(null), p = /* @__PURE__ */ W(null), h = /* @__PURE__ */ W(null), v = /* @__PURE__ */ W(!1), y = /* @__PURE__ */ W(!1), c = /* @__PURE__ */ W(!1), _ = /* @__PURE__ */ W(!1), x = /* @__PURE__ */ W(De({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), N = /* @__PURE__ */ W(null), I = /* @__PURE__ */ W(0), M = /* @__PURE__ */ W(null), L = /* @__PURE__ */ W(De({})), U = /* @__PURE__ */ W("newest"), $ = /* @__PURE__ */ W(De(Cl())), j = /* @__PURE__ */ W(null);
  const w = /* @__PURE__ */ re(() => ya[a(s)]), z = /* @__PURE__ */ re(() => a(w).table !== !1), P = /* @__PURE__ */ re(() => a(z) || a(w).tree === !0), H = /* @__PURE__ */ re(() => a(w).sheet !== !1 && (a(o) !== null || !a(P))), Q = /* @__PURE__ */ re(() => ({
    sort: a(U),
    ...a($).on ? { stack: a($).window } : {},
    ...Object.fromEntries(Object.entries(a(L)).filter(([, A]) => A.length > 0))
  })), G = /* @__PURE__ */ re(() => a(r) === "grid" ? `grid:${JSON.stringify(a(Q))}` : `triage:${a(s)}:${JSON.stringify(a(o))}`), Y = /* @__PURE__ */ re(() => a(w).rule === !1 || a(d).size === 0 ? [] : a(l).filter((A) => a(d).has(A.key)).map((A) => a(w).toRule(A, a(i))).filter((A) => A && ps(a(m)?.rules ?? [], A) !== "exclude")), ne = /* @__PURE__ */ re(() => (a(m)?.rules ?? []).filter((A) => A.decision === "exclude" && A.term?.column === "dir_under").map((A) => String(A.term.value).replace(/[\\/]+$/, "").toLowerCase())), he = ll();
  function X(A) {
    E(N, String(A), !0);
  }
  async function B(A) {
    try {
      return E(N, null), await A();
    } catch (J) {
      return X(J), null;
    }
  }
  const F = ol(
    () => {
      E(y, !0), B(async () => {
        const A = a(o)?.at === "end" || a(o)?.at === void 0 ? void 0 : 0, { stale: J, value: me } = await he(() => ze.counts(a(o), A));
        J || E(m, me, !0);
      }).finally(() => {
        E(y, !1);
      });
    },
    220
  );
  async function V() {
    E(p, "loading");
    const A = await B(() => ze.files());
    E(p, A, !0), E(v, !1), E(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function k(A = !1) {
    if (a(r) !== "triage" || !a(z)) {
      E(l, [], !0);
      return;
    }
    E(_, !0);
    const J = a(w).name === "source_folder" && a(i) ? { root: a(i) } : {};
    A && (J.live = "1");
    const me = await B(() => ze.screen(a(w).name, J));
    E(l, me?.rows ?? [], !0), E(_, !1);
  }
  let S = !1;
  rn(() => {
    a(s), a(r), gn(() => {
      E(u, null), E(o, null), E(i, null), ie(), a(r) === "triage" && (k(), F.now(), S || (S = !0, V()));
    });
  }), rn(() => {
    a(i), gn(() => {
      a(r) === "triage" && (ie(), k());
    });
  }), Hn(() => {
    B(async () => {
      E(M, await ze.facets(), !0);
    });
  });
  function O(A, J) {
    E(L, { ...a(L), [A]: J }, !0);
  }
  function ae(A) {
    if (a(w).sheet !== !1) {
      if (a(w).drill && !a(i)) {
        E(u, A.key, !0), E(
          o,
          {
            ...a(w).toRule(A, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), E(i, A.key, !0);
        return;
      }
      E(u, A.key, !0), E(
        o,
        {
          ...a(w).toRule(A, a(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), F();
    }
  }
  function Ee(A, J, me) {
    const Ke = new Set(a(d)), Oe = !Ke.has(A.key), Fe = me && a(g) !== null ? a(l).findIndex((at) => at.key === a(g)) : -1, [St, Ht] = Fe < 0 ? [J, J] : Fe < J ? [Fe, J] : [J, Fe];
    for (let at = St; at <= Ht; at++)
      Oe ? Ke.add(a(l)[at].key) : Ke.delete(a(l)[at].key);
    E(d, Ke, !0), E(g, A.key, !0);
  }
  function ie() {
    E(d, /* @__PURE__ */ new Set(), !0), E(g, null);
  }
  function ve(A) {
    E(o, A, !0), E(
      u,
      null
      // it no longer corresponds to a row
    ), F();
  }
  function Ue(A = !1) {
    E(o, null), E(u, null), A && E(i, null), F.now();
  }
  async function pe() {
    E(
      v,
      !0
      // the distinct-content number now says so on its face
    ), Ti(I), await k(), F.now();
  }
  async function ke() {
    if (!a(o)) return;
    E(c, !0);
    const A = a(o).at === "end" ? void 0 : 0, J = await B(() => ze.addRule(
      {
        column: a(o).column,
        op: a(o).op,
        value: a(o).value,
        decision: a(o).decision ?? "exclude",
        note: `screen ${a(w).id} ${a(w).title}`
      },
      A
    ));
    E(c, !1), J && (E(o, null), E(u, null), await pe());
  }
  async function We() {
    const A = a(Y);
    if (!A.length) {
      ie();
      return;
    }
    E(c, !0);
    for (const J of A)
      if (!await B(() => ze.addRule({
        column: J.column,
        op: J.op,
        value: J.value,
        decision: "exclude",
        note: `screen ${a(w).id} ${a(w).title}`
      }))) break;
    E(c, !1), ie(), E(o, null), E(u, null), await pe();
  }
  async function Ge(A) {
    if (!A || sa(a(ne), A)) return;
    E(c, !0);
    const J = await B(() => ze.addRule({
      column: "dir_under",
      op: "=",
      value: A,
      decision: "exclude",
      note: `screen ${a(w).id} ${a(w).title}`
    }));
    E(c, !1), J && await pe();
  }
  const ut = (A) => Ge(vs(A.p ?? "")), de = (A) => Ge(A.key);
  async function oe(A) {
    E(c, !0), await B(() => ze.deleteRule(A.id)), E(c, !1), await pe();
  }
  async function xe(A, J) {
    E(c, !0), await B(() => ze.moveRule(A.id, J)), E(c, !1), await pe();
  }
  async function Ce() {
    await B(async () => {
      E(M, await ze.facets(), !0);
    });
  }
  async function et(A, J) {
    const me = await B(() => ze.override(A.s, J));
    return me ? (E(v, !0), F(), me.decision) : A.o ?? null;
  }
  function Xe(A) {
    return a(r) === "grid" ? ze.photos({ limit: 500, ...a(Q), ...A || {} }) : ze.page(a(o), A);
  }
  function ct(A, J) {
    if (a(r) === "grid" && A.m) {
      E(j, { frames: A.m, origin: J.getBoundingClientRect() }, !0);
      return;
    }
    B(() => a(r) === "grid" ? ze.revealPhoto(A.id) : ze.revealOrigin(A.id));
  }
  function kt(A) {
    E(j, null), B(() => ze.revealPhoto(A.id));
  }
  var Ot = xu(), Vt = Ze(Ot);
  {
    var pt = (A) => {
      Kl(A, {
        get facets() {
          return a(M);
        },
        get selected() {
          return a(L);
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
        onstack: (J) => E($, Nl(J), !0),
        onclear: () => E(L, {}, !0),
        ontriage: () => E(r, "triage")
      });
    };
    K(Vt, (A) => {
      a(r) === "grid" && A(pt);
    });
  }
  var D = b(Vt, 2);
  {
    var Z = (A) => {
      uu(A, {});
    };
    K(D, (A) => {
      n && A(Z);
    });
  }
  var se = b(D, 2);
  let we;
  var ge = f(se);
  {
    var fe = (A) => {
      var J = pu(), me = f(J), Ke = f(me), Oe = b(me, 2);
      Ve(Oe, 21, () => ya, mt, (Le, st, Ft) => {
        var Lt = cu();
        let mn;
        var wn = f(Lt), Te = f(wn), it = b(wn, 1, !0);
        q(() => {
          mn = Se(Lt, 1, "nav svelte-1n46o8q", null, mn, { on: Ft === a(s) }), T(Te, a(st).id), T(it, a(st).title);
        }), ee("click", Lt, () => E(s, Ft, !0)), R(Le, Lt);
      });
      var Fe = b(Oe, 2);
      {
        var St = (Le) => {
          var st = vu(), Ft = Ze(st), Lt = f(Ft);
          {
            var mn = (Je) => {
              var nt = du(), yn = Ze(nt), qn = /* @__PURE__ */ re(() => Ue.bind(null, !0)), kr = b(yn, 2), Sr = f(kr);
              q(() => T(Sr, `inside ${a(i) ?? ""}`)), ee("click", yn, function(...Er) {
                a(qn)?.apply(this, Er);
              }), R(Je, nt);
            }, wn = (Je) => {
              var nt = fu(), yn = f(nt);
              q(() => T(yn, a(w).relive)), ee("click", nt, () => k(!0)), R(Je, nt);
            };
            K(Lt, (Je) => {
              a(w).drill && a(i) ? Je(mn) : a(w).relive && Je(wn, 1);
            });
          }
          var Te = b(Ft, 2);
          {
            var it = (Je) => {
              var nt = hu();
              R(Je, nt);
            };
            K(Te, (Je) => {
              a(_) && Je(it);
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
              onpick: ae,
              oncheck: Ee
            });
          }
          R(Le, st);
        };
        K(Fe, (Le) => {
          a(z) && Le(St);
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
              return a(I);
            },
            get excludedDirs() {
              return a(ne);
            },
            get selected() {
              return a(u);
            },
            get busy() {
              return a(c);
            },
            onload: (st) => B(() => ze.tree(st)),
            onpick: ae,
            onexclude: de
          });
        };
        K(Ht, (Le) => {
          a(w).tree && Le(at);
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
          onmove: xe
        });
      }
      var bn = b(_n, 2);
      bo(bn, { oncomplete: Ce }), ee("click", Ke, () => E(r, "grid")), R(A, J);
    };
    K(ge, (A) => {
      a(r) === "triage" && A(fe);
    });
  }
  var ye = b(ge, 2), je = f(ye);
  {
    var Ne = (A) => {
      var J = wu(), me = Ze(J), Ke = f(me), Oe = b(me, 2), Fe = f(Oe), St = b(Oe, 2);
      {
        var Ht = (Te) => {
          var it = gu(), Kt = f(it);
          q(() => T(Kt, a(w).note)), R(Te, it);
        };
        K(St, (Te) => {
          a(w).note && Te(Ht);
        });
      }
      var at = b(St, 2);
      {
        var _n = (Te) => {
          lo(Te, {
            get screen() {
              return a(w);
            }
          });
        };
        K(at, (Te) => {
          a(w).name === "dimensions" && Te(_n);
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
          return a(y);
        },
        onfiles: V
      });
      var Le = b(bn, 2);
      {
        var st = (Te) => {
          var it = _u(), Kt = f(it), Je = f(Kt), nt = b(Kt, 2), yn = f(nt), qn = b(nt, 2), kr = b(qn, 2), Sr = f(kr);
          {
            var Er = (Jt) => {
              var xn = Mn("already excluded — nothing left to write");
              R(Jt, xn);
            }, ks = (Jt) => {
              var xn = Mn();
              q((Ss) => T(xn, `one exclude rule each, at the end of the order${Ss ?? ""}`), [
                () => a(Y).length < a(d).size ? ` · ${Me(a(d).size - a(Y).length)} already excluded, skipped` : ""
              ]), R(Jt, xn);
            };
            K(Sr, (Jt) => {
              a(Y).length ? Jt(ks, -1) : Jt(Er);
            });
          }
          q(
            (Jt, xn) => {
              T(Je, `${Jt ?? ""} ticked`), nt.disabled = a(c) || !a(Y).length, T(yn, xn), qn.disabled = a(c);
            },
            [
              () => Me(a(d).size),
              () => a(c) ? "saving…" : `Exclude ${Me(a(Y).length)}`
            ]
          ), ee("click", nt, We), ee("click", qn, ie), R(Te, it);
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
          return a(w);
        },
        get saving() {
          return a(c);
        },
        onedit: ve,
        onconfirm: ke,
        onclear: Ue
      });
      var Lt = b(Ft, 2);
      {
        var mn = (Te) => {
          var it = bu(), Kt = f(it);
          q((Je, nt) => T(Kt, `${Je ?? ""}${nt ?? ""} loaded${a(x).exhausted ? " · all of them" : ""}${a(x).loading ? " · loading…" : ""} `), [
            () => Me(a(x).count),
            () => a(x).total ? " of " + Me(a(x).total) : ""
          ]), R(Te, it);
        }, wn = (Te) => {
          var it = mu();
          R(Te, it);
        };
        K(Lt, (Te) => {
          a(H) ? Te(mn) : a(w).sheet === !1 && Te(wn, 1);
        });
      }
      q(() => {
        T(Ke, `${a(w).id ?? ""} · ${a(w).title ?? ""}`), T(Fe, a(w).blurb);
      }), R(A, J);
    };
    K(je, (A) => {
      a(r) === "triage" && A(Ne);
    });
  }
  var be = b(je, 2);
  {
    var tt = (A) => {
      {
        let J = /* @__PURE__ */ re(() => a(r) === "grid" ? null : a(m)?.page_paths ?? null), me = /* @__PURE__ */ re(() => a(r) === "triage");
        Lo(A, {
          get key() {
            return a(G);
          },
          fetchPage: Xe,
          get total() {
            return a(J);
          },
          get triage() {
            return a(me);
          },
          get excludedDirs() {
            return a(ne);
          },
          onActivate: ct,
          onOverride: et,
          onExcludeFolder: ut,
          onState: (Ke) => E(x, { ...a(x), ...Ke }, !0)
        });
      }
    };
    K(be, (A) => {
      (a(H) || a(r) === "grid") && A(tt);
    });
  }
  var Ie = b(se, 2);
  {
    var Ae = (A) => {
      to(A, {
        get frames() {
          return a(j).frames;
        },
        get origin() {
          return a(j).origin;
        },
        onreveal: kt,
        onclose: () => E(j, null)
      });
    };
    K(Ie, (A) => {
      a(j) && A(Ae);
    });
  }
  var Xt = b(Ie, 2);
  {
    var It = (A) => {
      var J = yu();
      let me;
      var Ke = f(J);
      q(() => {
        me = Se(J, 1, "status", null, me, { bare: a(r) === "grid" }), T(Ke, a(N));
      }), R(A, J);
    };
    K(Xt, (A) => {
      a(N) && A(It);
    });
  }
  q(() => we = Se(se, 1, "shell", null, we, { bare: a(r) === "grid" })), R(e, Ot), vt();
}
Nt(["click"]);
Ol();
ia();
Gi(ku, { target: document.getElementById("app") });
