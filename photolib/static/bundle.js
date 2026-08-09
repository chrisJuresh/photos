var Xr = Array.isArray, Rs = Array.prototype.indexOf, dr = Array.prototype.includes, xr = Array.from, Ps = Object.defineProperty, Pn = Object.getOwnPropertyDescriptor, Cs = Object.getOwnPropertyDescriptors, Ns = Object.prototype, Os = Array.prototype, Na = Object.getPrototypeOf, ca = Object.isExtensible;
const or = () => {
};
function Is(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Oa() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
function Ar(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const r of e)
    if (n.push(r), n.length === t) break;
  return n;
}
const Be = 2, On = 4, kr = 8, Ia = 1 << 24, Nt = 16, kt = 32, Yt = 64, zr = 128, xt = 512, ze = 1024, De = 2048, Ft = 4096, nt = 8192, vt = 16384, jn = 32768, Dr = 1 << 25, In = 65536, fr = 1 << 17, Fs = 1 << 18, Hn = 1 << 19, Ls = 1 << 20, jt = 1 << 25, mn = 65536, hr = 1 << 21, Cn = 1 << 22, an = 1 << 23, pn = Symbol("$state"), zs = Symbol("legacy props"), Ds = Symbol(""), Fa = Symbol("attributes"), jr = Symbol("class"), Hr = Symbol("style"), qr = Symbol("text"), nr = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), js = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Hs(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function qs() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Bs(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function $s(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Us() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Gs(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ws() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ys(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Ks() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Vs() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Xs() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Js() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Zs = 1, Qs = 2, La = 4, ei = 8, ti = 16, ni = 1, ri = 4, ai = 8, si = 16, ii = 1, li = 2, Le = Symbol("uninitialized"), oi = "http://www.w3.org/1999/xhtml";
function ci() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function ui() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function di() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function za(e) {
  return e === this.v;
}
function fi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Da(e) {
  return !fi(e, this.v);
}
let Ze = null;
function Fn(e) {
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
      fe
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
      ns(r);
  }
  return t.i = !0, Ze = t.p, /** @type {T} */
  {};
}
function ja() {
  return !0;
}
let Mn = [];
function hi() {
  var e = Mn;
  Mn = [], Is(e);
}
function Gt(e) {
  if (Mn.length === 0) {
    var t = Mn;
    queueMicrotask(() => {
      t === Mn && hi();
    });
  }
  Mn.push(e);
}
function Ha(e) {
  var t = fe;
  if (t === null)
    return ve.f |= an, e;
  if ((t.f & jn) === 0 && (t.f & On) === 0)
    throw e;
  nn(e, t);
}
function nn(e, t) {
  if (!(t !== null && (t.f & vt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & zr) !== 0) {
        if ((t.f & jn) === 0)
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
const vi = -7169;
function Re(e, t) {
  e.f = e.f & vi | t;
}
function Jr(e) {
  (e.f & xt) !== 0 || e.deps === null ? Re(e, ze) : Re(e, Ft);
}
function qa(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Be) === 0 || (t.f & mn) === 0 || (t.f ^= mn, qa(
        /** @type {Derived} */
        t.deps
      ));
}
function Ba(e, t, n) {
  (e.f & De) !== 0 ? t.add(e) : (e.f & Ft) !== 0 && n.add(e), qa(e.deps), Re(e, ze);
}
let sr = !1;
function pi(e) {
  var t = sr;
  try {
    return sr = !1, [e(), sr];
  } finally {
    sr = t;
  }
}
function gi(e, t, n, r = !0) {
  r && n();
  for (var s of t)
    e.addEventListener(s, n);
  Sr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function qn(e) {
  var t = ve, n = fe;
  St(null), qt(null);
  try {
    return e();
  } finally {
    St(t), qt(n);
  }
}
function _i(e) {
  let t = 0, n = wn(0), r;
  return () => {
    ta() && (a(n), as(() => (t === 0 && (r = xn(() => e(() => Qn(n)))), t += 1, () => {
      Gt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Qn(n));
      });
    })));
  };
}
var bi = In | Hn;
function mi(e, t, n, r) {
  new wi(e, t, n, r);
}
class wi {
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
  #b = _i(() => (this.#d = wn(this.#p), () => {
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
        fe
      );
      l.b = this, l.f |= zr, r(i);
    }, this.parent = /** @type {Effect} */
    fe.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#r = na(() => {
      this.#h();
    }, bi);
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
        di();
        return;
      }
      n = !0, r && Js(), this.#l !== null && _n(this.#l, () => {
        this.#l = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: s, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, s), r = !1;
      } catch (l) {
        nn(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = wt(() => t(this.#t)), Gt(() => {
      var n = this.#a = document.createDocumentFragment(), r = Wt();
      n.append(r), this.#s = this.#v(() => wt(() => this.#o(r))), this.#c === 0 && (this.#t.before(n), this.#a = null, _n(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        we
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#p = 0, this.#s = wt(() => {
        this.#o(this.#t);
      }), this.#c > 0) {
        var t = this.#a = document.createDocumentFragment();
        aa(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = wt(() => n(this.#t));
      } else
        this.#w(
          /** @type {Batch} */
          we
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
    Ba(t, this.#f, this.#g);
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
    var n = fe, r = ve, s = Ze;
    qt(this.#r), St(this.#r), Fn(this.#r.ctx);
    try {
      return sn.ensure(), t();
    } catch (i) {
      return Ha(i), null;
    } finally {
      qt(n), St(r), Fn(s);
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
    this.#c += t, this.#c === 0 && (this.#w(n), this.#n && _n(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#u) && (this.#u = !0, Gt(() => {
      this.#u = !1, this.#d && Ln(this.#d, this.#p);
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
    we?.is_fork ? (this.#s && we.skip_effect(this.#s), this.#n && we.skip_effect(this.#n), this.#l && we.skip_effect(this.#l), we.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#s && (ct(this.#s), this.#s = null), this.#n && (ct(this.#n), this.#n = null), this.#l && (ct(this.#l), this.#l = null);
    let n = this.#e.failed;
    const r = (s) => {
      const { reset: i, invoke_onerror: l } = this.#m(s);
      l(), n && (this.#l = this.#v(() => {
        try {
          return wt(() => {
            var c = (
              /** @type {Effect} */
              fe
            );
            c.b = this, c.f |= zr, n(
              this.#t,
              () => s,
              () => i
            );
          });
        } catch (c) {
          return nn(
            c,
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
        nn(i, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        r,
        /** @param {unknown} e */
        (i) => nn(i, this.#r && this.#r.parent)
      ) : r(s);
    });
  }
}
function yi(e, t, n, r) {
  const s = er;
  var i = e.filter((h) => !h.settled), l = t.map(s);
  if (n.length === 0 && i.length === 0) {
    r(l);
    return;
  }
  var c = (
    /** @type {Effect} */
    fe
  ), o = xi(), d = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function _(h) {
    if ((c.f & vt) === 0) {
      o();
      try {
        r([...l, ...h]);
      } catch (v) {
        nn(v, c);
      }
      vr();
    }
  }
  var b = $a();
  if (n.length === 0) {
    d.then(() => _([])).finally(b);
    return;
  }
  function p() {
    Promise.all(n.map((h) => /* @__PURE__ */ ki(h))).then(_).catch((h) => nn(h, c)).finally(b);
  }
  d ? d.then(() => {
    o(), p(), vr();
  }) : p();
}
function xi() {
  var e = (
    /** @type {Effect} */
    fe
  ), t = ve, n = Ze, r = (
    /** @type {Batch} */
    we
  );
  return function(i = !0) {
    qt(e), St(t), Fn(n), i && (e.f & vt) === 0 && (r?.activate(), r?.apply());
  };
}
function vr(e = !0) {
  qt(null), St(null), Fn(null), e && we?.deactivate();
}
function $a() {
  var e = (
    /** @type {Effect} */
    fe
  ), t = e.b, n = (
    /** @type {Batch} */
    we
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function er(e) {
  var t = Be | De;
  return fe !== null && (fe.f |= Hn), {
    ctx: Ze,
    deps: null,
    effects: null,
    equals: za,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Le
    ),
    wv: 0,
    parent: fe,
    ac: null
  };
}
const Kn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function ki(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    fe
  );
  r === null && qs();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = wn(
    /** @type {V} */
    Le
  ), l = !ve, c = /* @__PURE__ */ new Set();
  return Di(() => {
    var o = (
      /** @type {Effect} */
      fe
    ), d = Oa();
    s = d.promise;
    try {
      Promise.resolve(e()).then(d.resolve, (h) => {
        h !== nr && d.reject(h);
      }).finally(vr);
    } catch (h) {
      d.reject(h), vr();
    }
    var _ = (
      /** @type {Batch} */
      we
    );
    if (l) {
      if ((o.f & jn) !== 0)
        var b = $a();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        _.async_deriveds.get(o)?.reject(Kn);
      else
        for (const h of c.values())
          h.reject(Kn);
      c.add(d), _.async_deriveds.set(o, d);
    }
    const p = (h, v = void 0) => {
      b?.(), c.delete(d), v !== Kn && (_.activate(), v ? (i.f |= an, Ln(i, v)) : ((i.f & an) !== 0 && (i.f ^= an), Ln(i, h)), _.deactivate());
    };
    d.promise.then(p, (h) => p(null, h || "unknown"));
  }), Sr(() => {
    for (const o of c)
      o.reject(Kn);
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
function se(e) {
  const t = /* @__PURE__ */ er(e);
  return cs(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ua(e) {
  const t = /* @__PURE__ */ er(e);
  return t.equals = Da, t;
}
function Si(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      ct(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Zr(e) {
  var t, n = fe, r = e.parent;
  if (!Kt && r !== null && e.v !== Le && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (vt | nt)) !== 0)
    return ci(), e.v;
  qt(r);
  try {
    e.f &= ~mn, Si(e), t = hs(e);
  } finally {
    qt(n);
  }
  return t;
}
function Ga(e) {
  var t = Zr(e);
  if (!e.equals(t) && (e.wv = ds(), (!we?.is_fork || e.deps === null) && (we !== null ? (we.capture(e, t, !0), Br?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Re(e, ze);
    return;
  }
  Kt || (Ot !== null ? (ta() || we?.is_fork) && Ot.set(e, t) : Jr(e));
}
function Ei(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && qn(() => {
        t.ac.abort(nr), t.ac = null;
      }), t.fn !== null && (t.teardown = or), tr(t, 0), ra(t));
}
function Wa(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && zn(t);
}
let Rr = null, En = null, we = null, Br = null, Ot = null, $r = null, Pr = !1, An = null, cr = null;
var ua = 0;
let Ti = 1;
class sn {
  id = Ti++;
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
    En === null ? Rr = En = this : (En.#e = this, this.#i = En), En = this;
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
        Re(s, De), n(s);
      for (s of r.m)
        Re(s, Ft), n(s);
    }
    this.#g.add(t);
  }
  #_() {
    this.#t = !0, ua++ > 1e3 && (this.#v(), Mi());
    for (const o of this.#c)
      this.#u.delete(o), Re(o, De), this.schedule(o);
    for (const o of this.#u)
      Re(o, Ft), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = An = [], r = [], s = cr = [];
    for (const o of t)
      try {
        this.#y(o, n, r);
      } catch (d) {
        throw Va(o), this.#b() || this.discard(), d;
      }
    if (we = null, s.length > 0) {
      var i = sn.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (An = null, cr = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [o, d] of this.#f)
        Ka(o, d);
      s.length > 0 && /** @type {unknown} */
      we.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(r), this.#h(n), l.#x(this);
      return;
    }
    this.#c.clear(), this.#u.clear();
    for (const o of this.#o) o(this);
    this.#o.clear(), Br = this, da(r), da(n), Br = null, this.#l?.resolve();
    var c = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      we
    );
    if (this.#s === 0 && (this.#a.length === 0 || c !== null) && this.#v(), this.#a.length > 0)
      if (c !== null) {
        const o = c;
        o.#a.push(...this.#a.filter((d) => !o.#a.includes(d)));
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
  #y(t, n, r) {
    t.f ^= ze;
    for (var s = t.first; s !== null; ) {
      var i = s.f, l = (i & (kt | Yt)) !== 0, c = l && (i & ze) !== 0, o = c || (i & nt) !== 0 || this.#f.has(s);
      if (!o && s.fn !== null) {
        l ? s.f ^= ze : (i & On) !== 0 ? n.push(s) : ar(s) && ((i & Nt) !== 0 && this.#u.add(s), zn(s));
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
    t.async_deriveds.clear(), this.transfer_effects(t.#c, t.#u);
    const n = (r) => {
      var s = r.reactions;
      if (s !== null && !((r.f & Be) !== 0 && (r.f & (De | Ft)) === 0))
        for (const c of s) {
          var i = c.f;
          if ((i & Be) !== 0)
            n(
              /** @type {Derived} */
              c
            );
          else {
            var l = (
              /** @type {Effect} */
              c
            );
            i & (Cn | Nt) && !this.async_deriveds.has(l) && (this.#u.delete(l), Re(l, De), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), we = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      Ba(t[n], this.#c, this.#u);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== Le && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & an) === 0 && (this.current.set(t, [n, r]), Ot?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    we = this;
  }
  deactivate() {
    we = null, Ot = null;
  }
  flush() {
    try {
      Pr = !0, we = this, this.#_();
    } finally {
      ua = 0, $r = null, An = null, cr = null, Pr = !1, we = null, Ot = null, gn.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Kn);
    this.#v(), this.#l?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let b = Rr; b !== null; b = b.#e) {
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
                (h.f & (Nt | Cn)) !== 0 ? b.schedule(h) : b.#h([h]);
              });
          b.activate();
          var l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
          for (var o of n)
            Ya(o, i, l, c);
          c = /* @__PURE__ */ new Map();
          var d = [...b.current].filter(([p, h]) => {
            const v = this.current.get(p);
            return v ? v[0] !== h[0] || v[1] !== h[1] : !0;
          }).map(([p]) => p);
          if (d.length > 0)
            for (const p of this.#p)
              (p.f & (vt | nt | fr)) === 0 && Qr(p, d, c) && ((p.f & (Cn | Nt)) !== 0 ? (Re(p, De), b.schedule(p)) : b.#c.add(p));
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
      this.#c.add(r);
    for (const r of n)
      this.#u.add(r);
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
    return (this.#l ??= Oa()).promise;
  }
  static ensure() {
    if (we === null) {
      const t = we = new sn();
      Pr || Gt(() => {
        t.#t || t.flush();
      });
    }
    return we;
  }
  apply() {
    {
      Ot = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if ($r = t, t.b?.is_pending && (t.f & (On | kr | Ia)) !== 0 && (t.f & jn) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (An !== null && n === fe && (ve === null || (ve.f & Be) === 0))
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
      t === null ? Rr = n : t.#e = n, n === null ? En = t : n.#i = t, this.linked = !1;
    }
  }
}
function Mi() {
  try {
    Ws();
  } catch (e) {
    nn(e, $r);
  }
}
let Ut = null;
function da(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (vt | nt)) === 0 && ar(r) && (Ut = /* @__PURE__ */ new Set(), zn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && is(r), Ut?.size > 0)) {
        gn.clear();
        for (const s of Ut) {
          if ((s.f & (vt | nt)) !== 0) continue;
          const i = [s];
          let l = s.parent;
          for (; l !== null; )
            Ut.has(l) && (Ut.delete(l), i.push(l)), l = l.parent;
          for (let c = i.length - 1; c >= 0; c--) {
            const o = i[c];
            (o.f & (vt | nt)) === 0 && zn(o);
          }
        }
        Ut.clear();
      }
    }
    Ut = null;
  }
}
function Ya(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & Be) !== 0 ? Ya(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (Cn | Nt)) !== 0 && (i & De) === 0 && Qr(s, t, r) && (Re(s, De), ea(
        /** @type {Effect} */
        s
      ));
    }
}
function Qr(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (dr.call(t, s))
        return !0;
      if ((s.f & Be) !== 0 && Qr(
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
function ea(e) {
  we.schedule(e);
}
function Ka(e, t) {
  if (!((e.f & kt) !== 0 && (e.f & ze) !== 0)) {
    (e.f & De) !== 0 ? t.d.push(e) : (e.f & Ft) !== 0 && t.m.push(e), Re(e, ze);
    for (var n = e.first; n !== null; )
      Ka(n, t), n = n.next;
  }
}
function Va(e) {
  Re(e, ze);
  for (var t = e.first; t !== null; )
    Va(t), t = t.next;
}
let pr = /* @__PURE__ */ new Set();
const gn = /* @__PURE__ */ new Map();
let Xa = !1;
function wn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: za,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  const n = wn(e);
  return cs(n), n;
}
// @__NO_SIDE_EFFECTS__
function Ai(e, t = !1, n = !0) {
  const r = wn(e);
  return t || (r.equals = Da), r;
}
function x(e, t, n = !1) {
  ve !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!It || (ve.f & fr) !== 0) && ja() && (ve.f & (Be | Nt | Cn | fr)) !== 0 && (Ht === null || !Ht.has(e)) && Xs();
  let r = n ? Oe(t) : t;
  return Ln(e, r, cr);
}
function Ln(e, t, n = null) {
  if (!e.equals(t)) {
    gn.set(e, Kt ? t : e.v);
    var r = sn.ensure();
    if (r.capture(e, t), (e.f & Be) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & De) !== 0 && Zr(s), Ot === null && Jr(s);
    }
    e.wv = ds(), Ja(e, De, n), fe !== null && (fe.f & ze) !== 0 && (fe.f & (kt | Yt)) === 0 && (mt === null ? qi([e]) : mt.push(e)), !r.is_fork && pr.size > 0 && !Xa && Ri();
  }
  return t;
}
function Ri() {
  Xa = !1;
  for (const e of pr) {
    (e.f & ze) !== 0 && Re(e, Ft);
    let t;
    try {
      t = ar(e);
    } catch {
      t = !0;
    }
    t && zn(e);
  }
  pr.clear();
}
function Pi(e, t = 1) {
  var n = a(e), r = t === 1 ? n++ : n--;
  return x(e, n), r;
}
function Qn(e) {
  x(e, e.v + 1);
}
function Ja(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, i = 0; i < s; i++) {
      var l = r[i], c = l.f, o = (c & De) === 0;
      if (o && Re(l, t), (c & fr) !== 0)
        pr.add(
          /** @type {Effect} */
          l
        );
      else if ((c & Be) !== 0) {
        var d = (
          /** @type {Derived} */
          l
        );
        Ot?.delete(d), (c & mn) === 0 && (c & xt && (fe === null || (fe.f & hr) === 0) && (l.f |= mn), Ja(d, Ft, n));
      } else if (o) {
        var _ = (
          /** @type {Effect} */
          l
        );
        (c & Nt) !== 0 && Ut !== null && Ut.add(_), n !== null ? n.push(_) : ea(_);
      }
    }
}
function Oe(e) {
  if (typeof e != "object" || e === null || pn in e)
    return e;
  const t = Na(e);
  if (t !== Ns && t !== Os)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Xr(e), s = /* @__PURE__ */ Y(0), i = bn, l = (c) => {
    if (bn === i)
      return c();
    var o = ve, d = bn;
    St(null), va(i);
    var _ = c();
    return St(o), va(d), _;
  };
  return r && n.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, o, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && Ks();
        var _ = n.get(o);
        return _ === void 0 ? l(() => {
          var b = /* @__PURE__ */ Y(d.value);
          return n.set(o, b), b;
        }) : x(_, d.value, !0), !0;
      },
      deleteProperty(c, o) {
        var d = n.get(o);
        if (d === void 0) {
          if (o in c) {
            const _ = l(() => /* @__PURE__ */ Y(Le));
            n.set(o, _), Qn(s);
          }
        } else
          x(d, Le), Qn(s);
        return !0;
      },
      get(c, o, d) {
        if (o === pn)
          return e;
        var _ = n.get(o), b = o in c;
        if (_ === void 0 && (!b || Pn(c, o)?.writable) && (_ = l(() => {
          var h = Oe(b ? c[o] : Le), v = /* @__PURE__ */ Y(h);
          return v;
        }), n.set(o, _)), _ !== void 0) {
          var p = a(_);
          return p === Le ? void 0 : p;
        }
        return Reflect.get(c, o, d);
      },
      getOwnPropertyDescriptor(c, o) {
        var d = Reflect.getOwnPropertyDescriptor(c, o);
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
      has(c, o) {
        if (o === pn)
          return !0;
        var d = n.get(o), _ = d !== void 0 && d.v !== Le || Reflect.has(c, o);
        if (d !== void 0 || fe !== null && (!_ || Pn(c, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var p = _ ? Oe(c[o]) : Le, h = /* @__PURE__ */ Y(p);
            return h;
          }), n.set(o, d));
          var b = a(d);
          if (b === Le)
            return !1;
        }
        return _;
      },
      set(c, o, d, _) {
        var b = n.get(o), p = o in c;
        if (r && o === "length")
          for (var h = d; h < /** @type {Source<number>} */
          b.v; h += 1) {
            var v = n.get(h + "");
            v !== void 0 ? x(v, Le) : h in c && (v = l(() => /* @__PURE__ */ Y(Le)), n.set(h + "", v));
          }
        if (b === void 0)
          (!p || Pn(c, o)?.writable) && (b = l(() => /* @__PURE__ */ Y(void 0)), x(b, Oe(d)), n.set(o, b));
        else {
          p = b.v !== Le;
          var w = l(() => Oe(d));
          x(b, w);
        }
        var u = Reflect.getOwnPropertyDescriptor(c, o);
        if (u?.set && u.set.call(_, d), !p) {
          if (r && typeof o == "string") {
            var g = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= g.v && x(g, y + 1);
          }
          Qn(s);
        }
        return !0;
      },
      ownKeys(c) {
        a(s);
        var o = Reflect.ownKeys(c).filter((b) => {
          var p = n.get(b);
          return p === void 0 || p.v !== Le;
        });
        for (var [d, _] of n)
          _.v !== Le && !(d in c) && o.push(d);
        return o;
      },
      setPrototypeOf() {
        Vs();
      }
    }
  );
}
function fa(e) {
  try {
    if (e !== null && typeof e == "object" && pn in e)
      return e[pn];
  } catch {
  }
  return e;
}
function Ci(e, t) {
  return Object.is(fa(e), fa(t));
}
var yn, Za, Qa, es;
function Ni() {
  if (yn === void 0) {
    yn = window, Za = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Qa = Pn(t, "firstChild").get, es = Pn(t, "nextSibling").get, ca(e) && (e[jr] = void 0, e[Fa] = null, e[Hr] = void 0, e.__e = void 0), ca(n) && (n[qr] = void 0);
  }
}
function Wt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function gr(e) {
  return (
    /** @type {TemplateNode | null} */
    Qa.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function rr(e) {
  return (
    /** @type {TemplateNode | null} */
    es.call(e)
  );
}
function f(e, t) {
  return /* @__PURE__ */ gr(e);
}
function ot(e, t = !1) {
  {
    var n = /* @__PURE__ */ gr(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ rr(n) : n;
  }
}
function m(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ rr(r);
  return r;
}
function Oi(e) {
  e.textContent = "";
}
function ts() {
  return !1;
}
function Ii(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Fi(e) {
  fe === null && (ve === null && Gs(), Us()), Kt && $s();
}
function Li(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Vt(e, t) {
  var n = fe;
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
  we?.register_created_effect(r);
  var s = r;
  if ((e & On) !== 0)
    An !== null ? An.push(r) : sn.ensure().schedule(r);
  else if (t !== null) {
    try {
      zn(r);
    } catch (l) {
      throw ct(r), l;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & Hn) === 0 && (s = s.first, (e & Nt) !== 0 && (e & In) !== 0 && s !== null && (s.f |= In));
  }
  if (s !== null && (s.parent = n, n !== null && Li(s, n), ve !== null && (ve.f & Be) !== 0 && (e & Yt) === 0)) {
    var i = (
      /** @type {Derived} */
      ve
    );
    (i.effects ??= []).push(s);
  }
  return r;
}
function ta() {
  return ve !== null && !It;
}
function Sr(e) {
  const t = Vt(kr, null);
  return Re(t, ze), t.teardown = e, t;
}
function ln(e) {
  Fi();
  var t = (
    /** @type {Effect} */
    fe.f
  ), n = !ve && (t & kt) !== 0 && Ze !== null && !Ze.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Ze
    );
    (r.e ??= []).push(e);
  } else
    return ns(e);
}
function ns(e) {
  return Vt(On | Ls, e);
}
function zi(e) {
  sn.ensure();
  const t = Vt(Yt | Hn, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? _n(t, () => {
      ct(t), r(void 0);
    }) : (ct(t), r(void 0));
  });
}
function rs(e) {
  return Vt(On, e);
}
function Di(e) {
  return Vt(Cn | Hn, e);
}
function as(e, t = 0) {
  return Vt(kr | t, e);
}
function q(e, t = [], n = [], r = []) {
  yi(r, t, n, (s) => {
    Vt(kr, () => {
      e(...s.map(a));
    });
  });
}
function na(e, t = 0) {
  var n = Vt(Nt | t, e);
  return n;
}
function wt(e) {
  return Vt(kt | Hn, e);
}
function ss(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Kt, r = ve;
    ha(!0), St(null);
    try {
      t.call(null);
    } finally {
      ha(n), St(r);
    }
  }
}
function ra(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && qn(() => {
      s.abort(nr);
    });
    var r = n.next;
    (n.f & Yt) !== 0 ? n.parent = null : ct(n, t), n = r;
  }
}
function ji(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & kt) === 0 && ct(t), t = n;
  }
}
function ct(e, t = !0) {
  var n = !1;
  (t || (e.f & Fs) !== 0) && e.nodes !== null && e.nodes.end !== null && (Hi(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Dr, ra(e, t && !n), tr(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  ss(e), e.f ^= Dr, e.f |= vt;
  var s = e.parent;
  s !== null && s.first !== null && is(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Hi(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ rr(e);
    e.remove(), e = n;
  }
}
function is(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function _n(e, t, n = !0) {
  var r = [];
  ls(e, r, !0);
  var s = () => {
    n && ct(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var l = () => --i || s();
    for (var c of r)
      c.out(l);
  } else
    s();
}
function ls(e, t, n) {
  if ((e.f & nt) === 0) {
    e.f ^= nt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const c of r)
        (c.is_global || n) && t.push(c);
    for (var s = e.first; s !== null; ) {
      var i = s.next;
      if ((s.f & Yt) === 0) {
        var l = (s.f & In) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (s.f & kt) !== 0 && (e.f & Nt) !== 0;
        ls(s, t, l ? n : !1);
      }
      s = i;
    }
  }
}
function _r(e) {
  os(e, !0);
}
function os(e, t) {
  if ((e.f & nt) !== 0) {
    e.f ^= nt, (e.f & ze) === 0 && (Re(e, De), sn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & In) !== 0 || (n.f & kt) !== 0;
      os(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function aa(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ rr(n);
      t.append(n), n = s;
    }
}
let ur = !1, Kt = !1;
function ha(e) {
  Kt = e;
}
let ve = null, It = !1;
function St(e) {
  ve = e;
}
let fe = null;
function qt(e) {
  fe = e;
}
let Ht = null;
function cs(e) {
  ve !== null && (Ht ??= /* @__PURE__ */ new Set()).add(e);
}
let lt = null, ht = 0, mt = null;
function qi(e) {
  mt = e;
}
let us = 1, hn = 0, bn = hn;
function va(e) {
  bn = e;
}
function ds() {
  return ++us;
}
function ar(e) {
  var t = e.f;
  if ((t & De) !== 0)
    return !0;
  if (t & Be && (e.f &= ~mn), (t & Ft) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (ar(
        /** @type {Derived} */
        i
      ) && Ga(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & xt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ot === null && Re(e, ze);
  }
  return !1;
}
function fs(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Ht !== null && Ht.has(e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & Be) !== 0 ? fs(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Re(i, De) : (i.f & ze) !== 0 && Re(i, Ft), ea(
        /** @type {Effect} */
        i
      ));
    }
}
function hs(e) {
  var t = lt, n = ht, r = mt, s = ve, i = Ht, l = Ze, c = It, o = bn, d = e.f;
  lt = /** @type {null | Value[]} */
  null, ht = 0, mt = null, ve = (d & (kt | Yt)) === 0 ? e : null, Ht = null, Fn(e.ctx), It = !1, bn = ++hn, e.ac !== null && (qn(() => {
    e.ac.abort(nr);
  }), e.ac = null);
  try {
    e.f |= hr;
    var _ = (
      /** @type {Function} */
      e.fn
    ), b = _();
    e.f |= jn;
    var p = e.deps, h = we?.is_fork;
    if (lt !== null) {
      var v;
      if (h || tr(e, ht), p !== null && ht > 0)
        for (p.length = ht + lt.length, v = 0; v < lt.length; v++)
          p[ht + v] = lt[v];
      else
        e.deps = p = lt;
      if (ta() && (e.f & xt) !== 0)
        for (v = ht; v < p.length; v++)
          (p[v].reactions ??= []).push(e);
    } else !h && p !== null && ht < p.length && (tr(e, ht), p.length = ht);
    if (ja() && mt !== null && !It && p !== null && (e.f & (Be | Ft | De)) === 0)
      for (v = 0; v < /** @type {Source[]} */
      mt.length; v++)
        fs(
          mt[v],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (hn++, s.deps !== null)
        for (let w = 0; w < n; w += 1)
          s.deps[w].rv = hn;
      if (t !== null)
        for (const w of t)
          w.rv = hn;
      mt !== null && (r === null ? r = mt : r.push(.../** @type {Source[]} */
      mt));
    }
    return (e.f & an) !== 0 && (e.f ^= an), b;
  } catch (w) {
    return Ha(w);
  } finally {
    e.f ^= hr, lt = t, ht = n, mt = r, ve = s, Ht = i, Fn(l), It = c, bn = o;
  }
}
function Bi(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Rs.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & Be) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (lt === null || !dr.call(lt, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & xt) !== 0 && (i.f ^= xt, i.f &= ~mn), i.v !== Le && Jr(i), i.ac !== null && qn(() => {
      i.ac.abort(nr), i.ac = null, Re(i, De);
    }), Ei(i), tr(i, 0);
  }
}
function tr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Bi(e, n[r]);
}
function zn(e) {
  var t = e.f;
  if ((t & vt) === 0) {
    Re(e, ze);
    var n = fe, r = ur;
    fe = e, ur = (t & (kt | Yt)) === 0;
    try {
      (t & (Nt | Ia)) !== 0 ? ji(e) : ra(e), ss(e);
      var s = hs(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = us;
      var i;
    } finally {
      ur = r, fe = n;
    }
  }
}
function a(e) {
  var t = e.f, n = (t & Be) !== 0;
  if (ve !== null && !It) {
    var r = fe !== null && (fe.f & vt) !== 0;
    if (!r && (Ht === null || !Ht.has(e))) {
      var s = ve.deps;
      if ((ve.f & hr) !== 0)
        e.rv < hn && (e.rv = hn, lt === null && s !== null && s[ht] === e ? ht++ : lt === null ? lt = [e] : lt.push(e));
      else {
        ve.deps ??= [], dr.call(ve.deps, e) || ve.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [ve] : dr.call(i, ve) || i.push(ve);
      }
    }
  }
  if (Kt && gn.has(e))
    return gn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Kt) {
      var c = l.v;
      return ((l.f & ze) === 0 && l.reactions !== null || ps(l)) && (c = Zr(l)), gn.set(l, c), c;
    }
    var o = (l.f & xt) === 0 && !It && ve !== null && (ur || (ve.f & xt) !== 0), d = (l.f & jn) === 0;
    ar(l) && (o && (l.f |= xt), Ga(l)), o && !d && (Wa(l), vs(l));
  }
  if (Ot?.has(e))
    return Ot.get(e);
  if ((e.f & an) !== 0)
    throw e.v;
  return e.v;
}
function vs(e) {
  if (e.f |= xt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Be) !== 0 && (t.f & xt) === 0 && (Wa(
        /** @type {Derived} */
        t
      ), vs(
        /** @type {Derived} */
        t
      ));
}
function ps(e) {
  if (e.v === Le) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (gn.has(t) || (t.f & Be) !== 0 && ps(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function xn(e) {
  var t = It;
  try {
    return It = !0, e();
  } finally {
    It = t;
  }
}
const $i = ["touchstart", "touchmove"];
function Ui(e) {
  return $i.includes(e);
}
const Vn = Symbol("events"), gs = /* @__PURE__ */ new Set(), Ur = /* @__PURE__ */ new Set();
function Gi(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || Gr.call(t, i), !i.cancelBubble)
      return qn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Gt(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Nn(e, t, n, r, s) {
  var i = { capture: r, passive: s }, l = Gi(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Sr(() => {
    t.removeEventListener(e, l, i);
  });
}
function ne(e, t, n) {
  (t[Vn] ??= {})[e] = n;
}
function Lt(e) {
  for (var t = 0; t < e.length; t++)
    gs.add(e[t]);
  for (var n of Ur)
    n(e);
}
let pa = null;
function Gr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  pa = e;
  var l = 0, c = pa === e && e[Vn];
  if (c) {
    var o = s.indexOf(c);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Vn] = t;
      return;
    }
    var d = s.indexOf(t);
    if (d === -1)
      return;
    o <= d && (l = o);
  }
  if (i = /** @type {Element} */
  s[l] || e.target, i !== t) {
    Ps(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var _ = ve, b = fe;
    St(null), qt(null);
    try {
      for (var p, h = []; i !== null && i !== t; ) {
        try {
          var v = i[Vn]?.[r];
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
      e[Vn] = t, delete e.currentTarget, St(_), qt(b);
    }
  }
}
const Wi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Yi(e) {
  return (
    /** @type {string} */
    Wi?.createHTML(e) ?? e
  );
}
function Ki(e) {
  var t = Ii("template");
  return t.innerHTML = Yi(e.replaceAll("<!>", "<!---->")), t.content;
}
function br(e, t) {
  var n = (
    /** @type {Effect} */
    fe
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var n = (t & ii) !== 0, r = (t & li) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = Ki(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ gr(s)));
    var l = (
      /** @type {TemplateNode} */
      r || Za ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ gr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      br(c, o);
    } else
      br(l, l);
    return l;
  };
}
function Rn(e = "") {
  {
    var t = Wt(e + "");
    return br(t, t), t;
  }
}
function sa() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Wt();
  return e.append(t, n), br(t, n), e;
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
  (e[qr] ??= e.nodeValue) && (e[qr] = n, e.nodeValue = `${n}`);
}
function Vi(e, t) {
  return Xi(e, t);
}
const ir = /* @__PURE__ */ new Map();
function Xi(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: l = !0, transformError: c }) {
  Ni();
  var o = void 0, d = zi(() => {
    var _ = n ?? t.appendChild(Wt());
    mi(
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
      c
    );
    var b = /* @__PURE__ */ new Set(), p = (h) => {
      for (var v = 0; v < h.length; v++) {
        var w = h[v];
        if (!b.has(w)) {
          b.add(w);
          var u = Ui(w);
          for (const O of [t, document]) {
            var g = ir.get(O);
            g === void 0 && (g = /* @__PURE__ */ new Map(), ir.set(O, g));
            var y = g.get(w);
            y === void 0 ? (O.addEventListener(w, Gr, { passive: u }), g.set(w, 1)) : g.set(w, y + 1);
          }
        }
      }
    };
    return p(xr(gs)), Ur.add(p), () => {
      for (var h of b)
        for (const u of [t, document]) {
          var v = (
            /** @type {Map<string, number>} */
            ir.get(u)
          ), w = (
            /** @type {number} */
            v.get(h)
          );
          --w == 0 ? (u.removeEventListener(h, Gr), v.delete(h), v.size === 0 && ir.delete(u)) : v.set(h, w);
        }
      Ur.delete(p), _ !== n && _.parentNode?.removeChild(_);
    };
  });
  return Ji.set(o, d), o;
}
let Ji = /* @__PURE__ */ new WeakMap();
class Zi {
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
        _r(r), this.#o.delete(n);
      else {
        var s = this.#e.get(n);
        s && (_r(s.effect), this.#i.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
      }
      for (const [i, l] of this.#t) {
        if (this.#t.delete(i), i === t)
          break;
        const c = this.#e.get(l);
        c && (ct(c.effect), this.#e.delete(l));
      }
      for (const [i, l] of this.#i) {
        if (i === n || this.#o.has(i)) continue;
        const c = () => {
          if (Array.from(this.#t.values()).includes(i)) {
            var d = document.createDocumentFragment();
            aa(l, d), d.append(Wt()), this.#e.set(i, { effect: l, fragment: d });
          } else
            ct(l);
          this.#o.delete(i), this.#i.delete(i);
        };
        this.#r || !r ? (this.#o.add(i), _n(l, c, !1)) : c();
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
      n.includes(r) || (ct(s.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      we
    ), s = ts();
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
      for (const [c, o] of this.#i)
        c === t ? r.unskip_effect(o) : r.skip_effect(o);
      for (const [c, o] of this.#e)
        c === t ? r.unskip_effect(o.effect) : r.skip_effect(o.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function X(e, t, n = !1) {
  var r = new Zi(e), s = n ? In : 0;
  function i(l, c) {
    r.ensure(l, c);
  }
  na(() => {
    var l = !1;
    t((c, o = 0) => {
      l = !0, i(o, c);
    }), l || i(-1, null);
  }, s);
}
function yt(e, t) {
  return t;
}
function Qi(e, t, n) {
  for (var r = [], s = t.length, i, l = t.length, c = 0; c < s; c++) {
    let b = t[c];
    _n(
      b,
      () => {
        if (i) {
          if (i.pending.delete(b), i.done.add(b), i.pending.size === 0) {
            var p = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Wr(e, xr(i.done)), p.delete(i), p.size === 0 && (e.outrogroups = null);
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
      Oi(_), _.append(d), e.items.clear();
    }
    Wr(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function Wr(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const l of e.pending.values())
      for (const c of l)
        r.add(
          /** @type {EachItem} */
          e.items.get(c).e
        );
  }
  for (var s = 0; s < t.length; s++) {
    var i = t[s];
    if (r?.has(i)) {
      i.f |= jt;
      const l = document.createDocumentFragment();
      aa(i, l);
    } else
      ct(t[s], n);
  }
}
var ga;
function We(e, t, n, r, s, i = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & La) !== 0;
  if (o) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild(Wt());
  }
  var _ = null, b = /* @__PURE__ */ Ua(() => {
    var O = n();
    return (
      /** @type {V[]} */
      Xr(O) ? O : O == null ? [] : xr(O)
    );
  }), p, h = /* @__PURE__ */ new Map(), v = !0;
  function w(O) {
    (y.effect.f & vt) === 0 && (y.pending.delete(O), y.fallback = _, el(y, p, l, t, r), _ !== null && (p.length === 0 ? (_.f & jt) === 0 ? _r(_) : (_.f ^= jt, Xn(_, null, l)) : _n(_, () => {
      _ = null;
    })));
  }
  function u(O) {
    y.pending.delete(O);
  }
  var g = na(() => {
    p = /** @type {V[]} */
    a(b);
    for (var O = p.length, F = /* @__PURE__ */ new Set(), A = (
      /** @type {Batch} */
      we
    ), L = ts(), W = 0; W < O; W += 1) {
      var G = p[W], j = r(G, W), S = v ? null : c.get(j);
      S ? (S.v && Ln(S.v, G), S.i && Ln(S.i, W), L && A.unskip_effect(S.e)) : (S = tl(
        c,
        v ? l : ga ??= Wt(),
        G,
        j,
        W,
        s,
        t,
        n
      ), v || (S.e.f |= jt), c.set(j, S)), F.add(j);
    }
    if (O === 0 && i && !_ && (v ? _ = wt(() => i(l)) : (_ = wt(() => i(ga ??= Wt())), _.f |= jt)), O > F.size && Bs(), !v)
      if (h.set(A, F), L) {
        for (const [T, C] of c)
          F.has(T) || A.skip_effect(C.e);
        A.oncommit(w), A.ondiscard(u);
      } else
        w(A);
    a(b);
  }), y = { effect: g, items: c, pending: h, outrogroups: null, fallback: _ };
  v = !1;
}
function Un(e) {
  for (; e !== null && (e.f & kt) === 0; )
    e = e.next;
  return e;
}
function el(e, t, n, r, s) {
  var i = (r & ei) !== 0, l = t.length, c = e.items, o = Un(e.effect.first), d, _ = null, b, p = [], h = [], v, w, u, g;
  if (i)
    for (g = 0; g < l; g += 1)
      v = t[g], w = s(v, g), u = /** @type {EachItem} */
      c.get(w).e, (u.f & jt) === 0 && (u.nodes?.a?.measure(), (b ??= /* @__PURE__ */ new Set()).add(u));
  for (g = 0; g < l; g += 1) {
    if (v = t[g], w = s(v, g), u = /** @type {EachItem} */
    c.get(w).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(u), S.done.delete(u);
    if ((u.f & nt) !== 0 && (_r(u), i && (u.nodes?.a?.unfix(), (b ??= /* @__PURE__ */ new Set()).delete(u))), (u.f & jt) !== 0)
      if (u.f ^= jt, u === o)
        Xn(u, null, n);
      else {
        var y = _ ? _.next : o;
        u === e.effect.last && (e.effect.last = u.prev), u.prev && (u.prev.next = u.next), u.next && (u.next.prev = u.prev), en(e, _, u), en(e, u, y), Xn(u, y, n), _ = u, p = [], h = [], o = Un(_.next);
        continue;
      }
    if (u !== o) {
      if (d !== void 0 && d.has(u)) {
        if (p.length < h.length) {
          var O = h[0], F;
          _ = O.prev;
          var A = p[0], L = p[p.length - 1];
          for (F = 0; F < p.length; F += 1)
            Xn(p[F], O, n);
          for (F = 0; F < h.length; F += 1)
            d.delete(h[F]);
          en(e, A.prev, L.next), en(e, _, A), en(e, L, O), o = O, _ = L, g -= 1, p = [], h = [];
        } else
          d.delete(u), Xn(u, o, n), en(e, u.prev, u.next), en(e, u, _ === null ? e.effect.first : _.next), en(e, _, u), _ = u;
        continue;
      }
      for (p = [], h = []; o !== null && o !== u; )
        (d ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = Un(o.next);
      if (o === null)
        continue;
    }
    (u.f & jt) === 0 && p.push(u), _ = u, o = Un(u.next);
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Wr(e, xr(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || d !== void 0) {
    var W = [];
    if (d !== void 0)
      for (u of d)
        (u.f & nt) === 0 && W.push(u);
    for (; o !== null; )
      (o.f & nt) === 0 && o !== e.fallback && W.push(o), o = Un(o.next);
    var G = W.length;
    if (G > 0) {
      var j = (r & La) !== 0 && l === 0 ? n : null;
      if (i) {
        for (g = 0; g < G; g += 1)
          W[g].nodes?.a?.measure();
        for (g = 0; g < G; g += 1)
          W[g].nodes?.a?.fix();
      }
      Qi(e, W, j);
    }
  }
  i && Gt(() => {
    if (b !== void 0)
      for (u of b)
        u.nodes?.a?.apply();
  });
}
function tl(e, t, n, r, s, i, l, c) {
  var o = (l & Zs) !== 0 ? (l & ti) === 0 ? /* @__PURE__ */ Ai(n, !1, !1) : wn(n) : null, d = (l & Qs) !== 0 ? wn(s) : null;
  return {
    v: o,
    i: d,
    e: wt(() => (i(t, o ?? n, d ?? s, c), () => {
      e.delete(r);
    }))
  };
}
function Xn(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & jt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ rr(r)
      );
      if (i.before(r), r === s)
        return;
      r = l;
    }
}
function en(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Gn(e, t, n) {
  rs(() => {
    var r = xn(() => t(e, n?.()) || {});
    if (r?.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
const _a = [...` 	
\r\f \v\uFEFF`];
function nl(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s of Object.keys(n))
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var i = s.length, l = 0; (l = r.indexOf(s, l)) >= 0; ) {
          var c = l + i;
          (l === 0 || _a.includes(r[l - 1])) && (c === r.length || _a.includes(r[c])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(c + 1) : l = c;
        }
  }
  return r === "" ? null : r;
}
function ba(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var s of Object.keys(e)) {
    var i = e[s];
    i != null && i !== "" && (r += " " + s + ": " + i + n);
  }
  return r;
}
function rl(e, t) {
  if (t) {
    var n = "", r, s;
    return Array.isArray(t) ? (r = t[0], s = t[1]) : r = t, r && (n += ba(r)), s && (n += ba(s, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Se(e, t, n, r, s, i) {
  var l = (
    /** @type {any} */
    e[jr]
  );
  if (l !== n || l === void 0) {
    var c = nl(n, r, i);
    c == null ? e.removeAttribute("class") : e.className = c, e[jr] = n;
  } else if (i && s !== i)
    for (var o in i) {
      var d = !!i[o];
      (s == null || d !== !!s[o]) && e.classList.toggle(o, d);
    }
  return i;
}
function Cr(e, t = {}, n, r) {
  for (var s in n) {
    var i = n[s];
    t[s] !== i && (n[s] == null ? e.style.removeProperty(s) : e.style.setProperty(s, i, r));
  }
}
function vn(e, t, n, r) {
  var s = (
    /** @type {any} */
    e[Hr]
  );
  if (s !== t) {
    var i = rl(t, r);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[Hr] = t;
  } else r && (Array.isArray(r) ? (Cr(e, n?.[0], r[0]), Cr(e, n?.[1], r[1], "important")) : Cr(e, n, r));
  return r;
}
function Jn(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Xr(t))
      return ui();
    for (var r of e.options)
      r.selected = t.includes(ma(r));
    return;
  }
  for (r of e.options) {
    var s = ma(r);
    if (Ci(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function lr(e) {
  var t = new MutationObserver(() => {
    "__value" in e && Jn(e, e.__value);
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
  }), Sr(() => {
    t.disconnect();
  });
}
function ma(e) {
  return "__value" in e ? e.__value : e.value;
}
const al = Symbol("is custom element"), sl = Symbol("is html"), il = js ? "progress" : "PROGRESS";
function dn(e, t) {
  var n = ia(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== il) || (e.value = t ?? "");
}
function ll(e, t) {
  var n = ia(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function ue(e, t, n, r) {
  var s = ia(e);
  s[t] !== (s[t] = n) && (t === "loading" && (e[Ds] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && ol(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function ia(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[Fa] ??= {
      [al]: e.nodeName.includes("-"),
      [sl]: e.namespaceURI === oi
    }
  );
}
var wa = /* @__PURE__ */ new Map();
function ol(e) {
  var t = e.getAttribute("is") || e.nodeName, n = wa.get(t);
  if (n) return n;
  wa.set(t, n = []);
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = Cs(s);
    for (var l in r)
      r[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    s = Na(s);
  }
  return n;
}
function Nr(e, t) {
  return e === t || e?.[pn] === t;
}
function mr(e = {}, t, n, r) {
  var s = (
    /** @type {ComponentContext} */
    Ze.r
  ), i = (
    /** @type {Effect} */
    fe
  );
  return rs(() => {
    var l, c;
    return as(() => {
      l = c, c = [], xn(() => {
        Nr(n(...c), e) || (t(e, ...c), l && Nr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== s && o.parent !== null && o.parent.f & Dr; )
        o = o.parent;
      const d = () => {
        c && Nr(n(...c), e) && t(null, ...c);
      }, _ = o.teardown;
      o.teardown = () => {
        d(), _?.();
      };
    };
  }), e;
}
function Yr(e, t) {
  gi(window, ["resize"], () => qn(() => t(window[e])));
}
function ie(e, t, n, r) {
  var s = !0, i = (n & ai) !== 0, l = (n & si) !== 0, c = (
    /** @type {V} */
    r
  ), o = !0, d = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), _ = () => l && s ? (d ??= /* @__PURE__ */ er(
    /** @type {() => V} */
    r
  ), a(d)) : (o && (o = !1, c = l ? xn(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), c);
  let b;
  if (i) {
    var p = pn in e || zs in e;
    b = Pn(e, t)?.set ?? (p && t in e ? (F) => e[t] = F : void 0);
  }
  var h, v = !1;
  i ? [h, v] = pi(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && r !== void 0 && (h = _(), b && (Ys(), b(h)));
  var w;
  if (w = () => {
    var F = (
      /** @type {V} */
      e[t]
    );
    return F === void 0 ? _() : (o = !0, F);
  }, (n & ri) === 0)
    return w;
  if (b) {
    var u = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(F, A) {
        return arguments.length > 0 ? ((!A || u || v) && b(A ? w() : F), F) : w();
      })
    );
  }
  var g = !1, y = ((n & ni) !== 0 ? er : Ua)(() => (g = !1, w()));
  i && a(y);
  var O = (
    /** @type {Effect} */
    fe
  );
  return (
    /** @type {() => V} */
    (function(F, A) {
      if (arguments.length > 0) {
        const L = A ? a(y) : i ? Oe(F) : F;
        return x(y, L), g = !0, c !== void 0 && (c = L), F;
      }
      return Kt && g || (O.f & vt) !== 0 ? y.v : a(y);
    })
  );
}
function Bn(e) {
  Ze === null && Hs(), ln(() => {
    const t = xn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const cl = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(cl);
function ul(e) {
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
  const n = await fetch(e + ul(t));
  if (!n.ok) {
    const r = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  }
  return n.json();
}
async function Tn(e, t) {
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
function ya(e) {
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
  counts: (e, t) => $t("/api/triage/counts", { ...ya(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => $t("/api/triage/files"),
  screen: (e, t = {}) => $t("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => $t("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => $t("/api/triage/page", { ...ya(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => $t("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => Tn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => Tn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => Tn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => Tn("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => Tn("/api/reveal", { id: e }),
  revealOrigin: (e) => Tn("/api/reveal", { origin: e }),
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
function dl() {
  let e = 0, t = 0;
  return async function(r) {
    const s = ++e, i = await r();
    return s <= t ? { stale: !0, value: void 0 } : (t = s, { stale: !1, value: i });
  };
}
function fl(e, t) {
  let n = 0;
  const r = (...s) => {
    clearTimeout(n), n = setTimeout(() => e(...s), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...s) => {
    clearTimeout(n), e(...s);
  }, r;
}
const xa = ["B", "KB", "MB", "GB", "TB"];
function Pt(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < xa.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${xa[n]}`;
}
function Ne(e) {
  return (Number(e) || 0).toLocaleString();
}
const Dn = "G:\\photos", ka = [
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
      value: t ? `${Dn}\\${t}\\${e.key}` : `${Dn}\\${e.key}`
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
function _s(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), r = Dn.toLowerCase();
  return n.toLowerCase().startsWith(r + "\\") ? n : "";
}
function la(e, t) {
  const n = t.toLowerCase();
  return e.some((r) => n === r || n.startsWith(r + "\\"));
}
function hl(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function vl(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function bs(e, t) {
  if (!t) return null;
  const n = e.find(
    (r) => r.term && r.term.column === t.column && r.term.op === t.op && vl(r.term.value, t.value)
  );
  return n ? n.decision : null;
}
var pl = /* @__PURE__ */ I('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), gl = /* @__PURE__ */ I('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), _l = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7">…</div>'), bl = /* @__PURE__ */ I('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), ml = /* @__PURE__ */ I('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), wl = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7"> </div>'), yl = /* @__PURE__ */ I('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function xl(e, t) {
  pt(t, !0);
  let n = ie(t, "counts", 3, null), r = ie(t, "files", 3, null), s = ie(t, "filesAt", 3, null), i = ie(t, "stale", 3, !1), l = ie(t, "candidate", 3, null), c = ie(t, "busy", 3, !1);
  const o = /* @__PURE__ */ se(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = yl(), _ = f(d);
  let b;
  var p = m(f(_), 2);
  {
    var h = (j) => {
      var S = gl(), T = ot(S), C = f(T), B = f(C), K = m(C, 2), J = f(K), U = m(K, 4), Z = f(U), he = m(U, 2), te = f(he), H = m(T, 2);
      {
        var N = (V) => {
          var z = pl(), E = m(f(z), 2), k = f(E), $ = m(E, 2), re = f($), oe = m($, 4), le = f(oe), Q = m(oe, 2), ce = f(Q), Ee = m(Q, 2), He = f(Ee);
          q(
            (ke, rt, pe, de, Pe) => {
              R(k, `kept ${ke ?? ""}`), R(re, rt), R(le, `excluded ${pe ?? ""}`), R(ce, de), R(He, `${a(o) >= 0 ? "+" : ""}${Pe ?? ""} excluded`);
            },
            [
              () => Ne(n().candidate_kept_paths),
              () => Pt(n().candidate_kept_bytes),
              () => Ne(n().candidate_excluded_paths),
              () => Pt(n().candidate_excluded_bytes),
              () => Ne(a(o))
            ]
          ), P(V, z);
        };
        X(H, (V) => {
          l() && V(N);
        });
      }
      q(
        (V, z, E, k) => {
          R(B, `kept ${V ?? ""}`), R(J, z), R(Z, `excluded ${E ?? ""}`), R(te, k);
        },
        [
          () => Ne(n().kept_paths),
          () => Pt(n().kept_bytes),
          () => Ne(n().excluded_paths),
          () => Pt(n().excluded_bytes)
        ]
      ), P(j, S);
    }, v = (j) => {
      var S = _l();
      P(j, S);
    };
    X(p, (j) => {
      n() ? j(h) : j(v, -1);
    });
  }
  var w = m(_, 2);
  let u;
  var g = f(w), y = m(f(g), 3), O = f(y), F = m(y, 2);
  {
    var A = (j) => {
      var S = bl();
      P(j, S);
    };
    X(F, (j) => {
      i() && r() && r() !== "loading" && j(A);
    });
  }
  var L = m(g, 2);
  {
    var W = (j) => {
      var S = ml(), T = ot(S);
      let C;
      var B = f(T), K = f(B), J = m(B, 2), U = f(J), Z = m(J, 4), he = f(Z), te = m(Z, 2), H = f(te), N = m(T, 2), V = f(N);
      q(
        (z, E, k, $) => {
          C = Se(T, 1, "line svelte-1vgp6n7", null, C, { outdated: i() }), R(K, `kept ${z ?? ""}`), R(U, E), R(he, `excluded ${k ?? ""}`), R(H, $), R(V, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Ne(r().kept_files),
          () => Pt(r().kept_bytes),
          () => Ne(r().excluded_files),
          () => Pt(r().excluded_bytes)
        ]
      ), P(j, S);
    }, G = (j) => {
      var S = wl(), T = f(S);
      q(() => R(T, r() === "loading" ? "counting…" : "not counted yet")), P(j, S);
    };
    X(L, (j) => {
      r() && r() !== "loading" ? j(W) : j(G, -1);
    });
  }
  q(() => {
    b = Se(_, 1, "block svelte-1vgp6n7", null, b, { busy: c() }), u = Se(w, 1, "block svelte-1vgp6n7", null, u, { busy: r() === "loading" }), y.disabled = r() === "loading", R(O, r() === "loading" ? "counting…" : "recount");
  }), ne("click", y, function(...j) {
    t.onfiles?.apply(this, j);
  }), P(e, d), gt();
}
Lt(["click"]);
const Kr = "http://www.w3.org/2000/svg", fn = {
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
}, rn = {
  ...fn,
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
}, kl = [
  { dark: "tint", light: "tintLight", base: fn },
  { dark: "control", light: "controlLight", base: rn },
  { dark: "ink", light: "inkLight", base: rn },
  { dark: "tally", light: "tallyLight", base: rn },
  { dark: "tallyInk", light: "tallyInkLight", base: rn }
], Vr = /* @__PURE__ */ new Set();
let Ct = { ...rn };
function Sl() {
  return Ct;
}
function Or(e) {
  Ct = Ml(e), oa();
  for (const t of Vr) t(Ct);
  return Ct;
}
function El(e) {
  return Vr.add(e), () => Vr.delete(e);
}
function Zn(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function Tl(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: je(Zn(e.r, t.r), 0, 255),
    g: je(Zn(e.g, t.g), 0, 255),
    b: je(Zn(e.b, t.b), 0, 255),
    a: je(Zn(e.a, t.a), 0, 1)
  };
}
function Ml(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [r, s] of Object.entries(rn))
    typeof s == "boolean" ? n[r] = t[r] === void 0 ? s : !!t[r] : typeof s == "object" ? n[r] = Tl(t[r], s) : n[r] = Zn(t[r], s);
  return n;
}
function bt({ r: e, g: t, b: n, a: r }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Ae(r, 3)})`;
}
function Ae(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function Sa({ r: e, g: t, b: n, a: r }) {
  return { r: e, g: t, b: n, a: je(r * 1.7 + 0.22, 0, 1) };
}
function Ea(e, t) {
  const n = 0.4 + je(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - je(t, 0, 100) / 100) };
}
function Ta(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, s = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? je(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * s * Math.max(t.glareFactor, 0) / 100;
  return je(i ** (0.1 + je(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const Al = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function Rl(e, t, n) {
  const r = je(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), c = s - l, o = i - l, d = 8, _ = [];
  for (let h = 0; h <= d; h++) {
    const v = h / d * (Math.PI / 2);
    _.push([l * Math.cos(v) ** (2 / r), l * Math.sin(v) ** (2 / r)]);
  }
  const b = [], p = (h, v, w, u) => {
    let g = Math.atan2(h, -v);
    g < 0 && (g += Math.PI * 2);
    let y = Math.atan2(u, w);
    y < 0 && (y += Math.PI * 2);
    const O = Ae(Ta(y, n), 3);
    b.push(`rgba(255, 255, 255, ${O}) ${Ae(g / (Math.PI * 2) * 100, 2)}%`);
  };
  p(0, -i, 0, 1);
  for (const [h, v, w] of Al)
    for (let u = 0; u <= d; u++) {
      const [g, y] = _[w ? d - u : u];
      p(h * (c + g), v * (o + y), h * g ** (r - 1), -v * y ** (r - 1));
    }
  return b.push(`rgba(255, 255, 255, ${Ae(Ta(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${b.join(", ")})`;
}
function oa() {
  const e = Ct, t = document.documentElement.style, n = Ea(e.refFresnelRange, e.refFresnelHardness), r = Ea(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Ae(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Ae(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", bt(e.tint)), t.setProperty("--glass-tint-light", bt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", bt(Sa(e.tint))), t.setProperty("--glass-tint-sheet-light", bt(Sa(e.tintLight))), t.setProperty("--glass-ctl-dark", bt(e.control)), t.setProperty("--glass-ctl-light", bt(e.controlLight)), t.setProperty("--glass-text-dark", bt(e.ink)), t.setProperty("--glass-text-light", bt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", bt(e.tally)), t.setProperty("--glass-tint-tally-light", bt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", bt(e.tallyInk)), t.setProperty("--glass-text-tally-light", bt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Ae(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Ae(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Ae(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Ae(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Ae(e.shadowX)}px ${Ae(-e.shadowY)}px ${Ae(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Ae(je(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Ae(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Ae(Math.log2(je(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Ae(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Ae(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Ae(je(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Ae(r.width)}px`), t.setProperty("--glass-glare-blur", `${Ae(r.blur)}px`);
}
function je(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function Pl(e, t, n, r, s, i) {
  const l = Math.abs(e) - n + s, c = Math.abs(t) - r + s, o = Math.max(l, 0), d = Math.max(c, 0), _ = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, c), 0) + _ - s;
}
function Cl(e, t, n) {
  const r = e / 2, s = t / 2, i = je(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), c = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (p, h) => Pl(p - r, h - s, r, s, l, i), _ = 256, b = new Float32Array(_ + 1);
  for (let p = 0; p <= _; p++) {
    const h = 1 - p / _, v = Math.asin(je(h * h, 0, 1)), w = Math.asin(je(Math.sin(v) / o, 0, 1));
    b[p] = Math.tan(v - w) * c;
  }
  return (p, h) => {
    const v = -d(p, h);
    if (v < 0 || v >= c) return null;
    const w = b[Math.round(v / c * _)];
    if (w === 0) return null;
    const u = 0.75, g = d(p + u, h) - d(p - u, h), y = d(p, h + u) - d(p, h - u), O = Math.hypot(g, y);
    if (O === 0) return null;
    const F = -w / O;
    return { dx: g * F, dy: y * F };
  };
}
function Nl(e, t, n) {
  const r = document.createElement("canvas");
  r.width = e, r.height = t;
  const s = r.getContext("2d"), i = s.createImageData(e, t), l = i.data, c = e * t, o = new Float32Array(c), d = new Float32Array(c);
  let _ = 0;
  for (let p = 0; p < t; p++)
    for (let h = 0; h < e; h++) {
      const v = n(h + 0.5, p + 0.5);
      if (!v) continue;
      const w = p * e + h;
      o[w] = v.dx, d[w] = v.dy;
      const u = Math.hypot(v.dx, v.dy);
      u > _ && (_ = u);
    }
  const b = _ > 0 ? 127 / _ : 0;
  for (let p = 0; p < c; p++) {
    const h = p * 4;
    l[h] = 128 + je(Math.round(o[p] * b), -127, 127), l[h + 1] = 128 + je(Math.round(d[p] * b), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: r.toDataURL(), scale: _ * 2 };
}
const Ir = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function Fr(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Ae(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let Wn = null, Ol = 0;
function Il() {
  if (Wn) return Wn;
  const e = document.createElementNS(Kr, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), Wn = document.createElementNS(Kr, "defs"), e.appendChild(Wn), document.body.appendChild(e), Wn;
}
function Yn(e) {
  const t = `glass-refract-${++Ol}`, n = document.createElementNS(Kr, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), Il().appendChild(n);
  let r = 0, s = 0, i = 0, l = 0;
  const c = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, d = "";
  function _() {
    e.style.setProperty("--glass-pre", Ct.blurEdge ? "" : d), e.style.setProperty("--glass-post", Ct.blurEdge ? d : "");
  }
  function b() {
    r < 2 || s < 2 || e.style.setProperty("--glass-glare", Rl(r, s, Ct));
  }
  function p() {
    if (r < 2 || s < 2) return;
    const u = Ct, g = Nl(r, s, Cl(r, s, u)), y = u.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(r)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${r}" height="${s}" preserveAspectRatio="none" href="${g.url}" result="map"/>` + Fr(g.scale * (1 + y), Ir[0], "r") + Fr(g.scale, Ir[1], "g") + Fr(g.scale * (1 - y), Ir[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, _(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", _()), o = c.map((O) => Ct[O]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, p();
    }));
  }
  const v = new ResizeObserver(([u]) => {
    const g = u.borderBoxSize?.[0], y = g ? { w: Math.round(g.inlineSize), h: Math.round(g.blockSize) } : { w: Math.round(u.contentRect.width), h: Math.round(u.contentRect.height) };
    y.w === r && y.h === s || (r = y.w, s = y.h, b(), h());
  });
  v.observe(e);
  const w = El(() => {
    b(), c.map((u) => Ct[u]).join(" ") !== o ? h() : _();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), v.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const ms = "photos.stack", Lr = { on: !1, window: 4 }, ws = 1, ys = 10;
function Fl() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(ms) ?? "");
  } catch {
    return { ...Lr };
  }
  if (e === null || typeof e != "object") return { ...Lr };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= ws && t <= ys ? t : Lr.window
  };
}
function Ll(e) {
  return localStorage.setItem(ms, JSON.stringify({ on: e.on, window: e.window })), e;
}
const xs = "photos.theme", ks = "dark";
function Ss() {
  return document.documentElement.dataset.theme === "light" ? "light" : ks;
}
function zl() {
  const e = localStorage.getItem(xs), t = e === "dark" || e === "light" ? e : ks;
  return document.documentElement.dataset.theme = t, t;
}
function Es(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(xs, e), e;
}
var Dl = /* @__PURE__ */ I('<span class="spin svelte-zne36e" aria-label="loading"></span>'), Ma = /* @__PURE__ */ I('<span class="badge svelte-zne36e"> </span>'), jl = /* @__PURE__ */ I('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Hl = /* @__PURE__ */ I('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), ql = /* @__PURE__ */ I("<button> </button>"), Bl = /* @__PURE__ */ I('<div class="glass sheet sorts svelte-zne36e"></div>'), $l = /* @__PURE__ */ I(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), Ul = /* @__PURE__ */ I('<p class="muted svelte-zne36e">loading…</p>'), Gl = /* @__PURE__ */ I('<span class="help svelte-zne36e">?</span>'), Wl = /* @__PURE__ */ I('<span class="n svelte-zne36e"> </span>'), Yl = /* @__PURE__ */ I("<button> <!></button>"), Kl = /* @__PURE__ */ I('<span class="muted svelte-zne36e">nothing here</span>'), Vl = /* @__PURE__ */ I('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Xl = /* @__PURE__ */ I('<div class="glass sheet filters svelte-zne36e"><!></div>'), Jl = /* @__PURE__ */ I('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function Zl(e, t) {
  pt(t, !0);
  let n = ie(t, "facets", 3, null), r = ie(t, "selected", 19, () => ({})), s = ie(t, "sort", 3, "newest"), i = ie(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = ie(t, "total", 3, null), c = ie(t, "tiles", 3, null), o = ie(t, "loading", 3, !1), d = ie(t, "onselect", 3, () => {
  }), _ = ie(t, "onsort", 3, () => {
  }), b = ie(t, "onstack", 3, () => {
  }), p = ie(t, "onclear", 3, () => {
  }), h = ie(t, "ontriage", 3, () => {
  }), v = /* @__PURE__ */ Y(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), w = /* @__PURE__ */ Y(Oe(Ss())), u = /* @__PURE__ */ Y(null);
  const g = /* @__PURE__ */ se(() => c() ?? l()), y = /* @__PURE__ */ se(() => n()?.dimensions ?? []), O = /* @__PURE__ */ se(() => n()?.sorts ?? []), F = /* @__PURE__ */ se(() => a(O).find((D) => D.value === s())?.label ?? s()), A = /* @__PURE__ */ se(() => Object.values(r()).reduce((D, ae) => D + ae.length, 0)), L = /* @__PURE__ */ se(() => a(y).flatMap((D) => (r()[D.name] ?? []).map((ae) => ({
    dimension: D.name,
    value: ae,
    title: D.title,
    label: D.options.find((_e) => _e.value === ae)?.label ?? String(ae)
  }))));
  function W(D, ae) {
    const _e = r()[D] ?? [], Me = _e.includes(ae) ? _e.filter((ye) => ye !== ae) : [..._e, ae];
    d()(D, Me);
  }
  function G(D, ae) {
    return (r()[D] ?? []).includes(ae);
  }
  function j() {
    x(w, Es(a(w) === "dark" ? "light" : "dark"), !0);
  }
  let S = /* @__PURE__ */ Y(null);
  const T = /* @__PURE__ */ se(() => a(S) ?? i().window);
  function C(D) {
    x(S, Number(D), !0);
  }
  function B(D) {
    x(S, null), b()({ ...i(), window: Number(D) });
  }
  ln(() => {
    a(v) !== "stacks" && x(S, null);
  });
  function K(D) {
    D.key === "Escape" && x(v, "");
  }
  function J(D) {
    a(v) && !D.target.closest(".topbar") && x(v, "");
  }
  Bn(() => {
    const D = new ResizeObserver(([ae]) => {
      const _e = Math.round(ae.borderBoxSize?.[0]?.blockSize ?? ae.contentRect.height);
      document.documentElement.style.setProperty("--header-h", _e + "px");
    });
    return D.observe(a(u)), () => {
      D.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var U = Jl();
  Nn("keydown", yn, K), Nn("pointerdown", yn, J);
  var Z = f(U), he = f(Z), te = f(he), H = m(he, 2), N = f(H), V = m(H, 2);
  {
    var z = (D) => {
      var ae = Dl();
      P(D, ae);
    };
    X(V, (D) => {
      o() && D(z);
    });
  }
  Gn(Z, (D) => Yn?.(D));
  var E = m(Z, 2), k = f(E), $ = f(k), re = f($);
  let oe;
  var le = f(re), Q = m(re, 2);
  let ce;
  var Ee = m(f(Q));
  {
    var He = (D) => {
      var ae = Ma(), _e = f(ae);
      q(() => R(_e, a(A))), P(D, ae);
    };
    X(Ee, (D) => {
      a(A) && D(He);
    });
  }
  var ke = m(Q, 2);
  let rt;
  var pe = m(f(ke));
  {
    var de = (D) => {
      var ae = Ma(), _e = f(ae);
      q((Me) => R(_e, Me), [() => Ne(l())]), P(D, ae);
    };
    X(pe, (D) => {
      i().on && l() !== null && D(de);
    });
  }
  var Pe = m(ke, 2);
  {
    var Ce = (D) => {
      var ae = Hl(), _e = f(ae);
      We(_e, 17, () => a(L), (ye) => ye.dimension + " " + ye.value, (ye, ge) => {
        var xe = jl(), Ye = f(xe), at = f(Ye), be = m(Ye, 1, !0);
        q(() => {
          ue(xe, "title", `${a(ge).title ?? ""}: ${a(ge).label ?? ""} — click to remove`), R(at, a(ge).title), R(be, a(ge).label);
        }), ne("click", xe, () => W(a(ge).dimension, a(ge).value)), P(ye, xe);
      });
      var Me = m(_e, 2);
      ne("click", Me, () => p()()), P(D, ae);
    };
    X(Pe, (D) => {
      a(L).length && D(Ce);
    });
  }
  var Ie = m($, 2), Qe = f(Ie), ut = m(Ie, 2);
  Gn(k, (D) => Yn?.(D));
  var Et = m(k, 2);
  {
    var zt = (D) => {
      var ae = Bl();
      We(ae, 21, () => a(O), yt, (_e, Me) => {
        var ye = ql();
        let ge;
        var xe = f(ye);
        q(() => {
          ge = Se(ye, 1, "option svelte-zne36e", null, ge, { on: a(Me).value === s() }), R(xe, a(Me).label);
        }), ne("click", ye, () => {
          _()(a(Me).value), x(v, "");
        }), P(_e, ye);
      }), Gn(ae, (_e) => Yn?.(_e)), P(D, ae);
    };
    X(Et, (D) => {
      a(v) === "sort" && D(zt);
    });
  }
  var Bt = m(Et, 2);
  {
    var _t = (D) => {
      var ae = $l(), _e = f(ae), Me = m(f(_e), 2), ye = f(Me);
      let ge;
      var xe = f(ye), Ye = m(_e, 2), at = m(f(Ye), 2), be = f(at), qe = m(be, 2), Mt = f(qe);
      Gn(ae, ($e) => Yn?.($e)), q(() => {
        ge = Se(ye, 1, "option svelte-zne36e", null, ge, { on: i().on }), ue(ye, "aria-checked", i().on), R(xe, i().on ? "On" : "Off"), ue(be, "min", ws), ue(be, "max", ys), dn(be, a(T)), ue(be, "aria-valuetext", `${a(T) ?? ""} seconds`), R(Mt, `${a(T) ?? ""}s`);
      }), ne("click", ye, () => b()({ ...i(), on: !i().on })), ne("input", be, ($e) => C($e.currentTarget.value)), ne("change", be, ($e) => B($e.currentTarget.value)), P(D, ae);
    };
    X(Bt, (D) => {
      a(v) === "stacks" && D(_t);
    });
  }
  var et = m(Bt, 2);
  {
    var Tt = (D) => {
      var ae = Xl(), _e = f(ae);
      {
        var Me = (ge) => {
          var xe = Ul();
          P(ge, xe);
        }, ye = (ge) => {
          var xe = sa(), Ye = ot(xe);
          We(Ye, 17, () => a(y), yt, (at, be) => {
            var qe = Vl(), Mt = f(qe), $e = f(Mt), M = m($e);
            {
              var ee = (Ke) => {
                var Ge = Gl();
                q(() => ue(Ge, "title", a(be).hint)), P(Ke, Ge);
              };
              X(M, (Ke) => {
                a(be).hint && Ke(ee);
              });
            }
            var me = m(Mt, 2), Ue = f(me);
            We(Ue, 17, () => a(be).options, yt, (Ke, Ge) => {
              var Ve = Yl();
              let on;
              var cn = f(Ve), Xe = m(cn);
              {
                var ft = (st) => {
                  var Rt = Wl(), Xt = f(Rt);
                  q((Jt) => R(Xt, Jt), [() => Ne(a(Ge).count)]), P(st, Rt);
                };
                X(Xe, (st) => {
                  a(Ge).count !== null && st(ft);
                });
              }
              q(
                (st) => {
                  on = Se(Ve, 1, "option svelte-zne36e", null, on, st), R(cn, `${a(Ge).label ?? ""} `);
                },
                [
                  () => ({ on: G(a(be).name, a(Ge).value) })
                ]
              ), ne("click", Ve, () => W(a(be).name, a(Ge).value)), P(Ke, Ve);
            });
            var dt = m(Ue, 2);
            {
              var At = (Ke) => {
                var Ge = Kl();
                P(Ke, Ge);
              };
              X(dt, (Ke) => {
                a(be).options.length || Ke(At);
              });
            }
            q(() => R($e, `${a(be).title ?? ""} `)), P(at, qe);
          }), P(ge, xe);
        };
        X(_e, (ge) => {
          n() ? ge(ye, -1) : ge(Me);
        });
      }
      Gn(ae, (ge) => Yn?.(ge)), P(D, ae);
    };
    X(et, (D) => {
      a(v) === "filters" && D(Tt);
    });
  }
  mr(U, (D) => x(u, D), () => a(u)), q(
    (D) => {
      R(te, D), R(N, a(g) === 1 ? "photo" : "photos"), oe = Se(re, 1, "menu svelte-zne36e", null, oe, { open: a(v) === "sort" }), ue(re, "aria-expanded", a(v) === "sort"), R(le, a(F)), ce = Se(Q, 1, "menu svelte-zne36e", null, ce, { open: a(v) === "filters", on: a(A) > 0 }), ue(Q, "aria-expanded", a(v) === "filters"), rt = Se(ke, 1, "menu svelte-zne36e", null, rt, { open: a(v) === "stacks", on: i().on }), ue(ke, "aria-expanded", a(v) === "stacks"), ue(Ie, "title", a(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), ue(Ie, "aria-label", a(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), R(Qe, a(w) === "dark" ? "☀" : "☾");
    },
    [() => a(g) === null ? "…" : Ne(a(g))]
  ), ne("click", re, () => x(v, a(v) === "sort" ? "" : "sort", !0)), ne("click", Q, () => x(v, a(v) === "filters" ? "" : "filters", !0)), ne("click", ke, () => x(v, a(v) === "stacks" ? "" : "stacks", !0)), ne("click", Ie, j), ne("click", ut, () => h()()), P(e, U), gt();
}
Lt(["click", "input", "change"]);
const Dt = 4, wr = 220, Ql = 340, tn = 12, Aa = Dt + tn, Ts = 6, eo = 5, to = 0.025, no = 9;
function yr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function ro(e, t, n, r, s) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, c = 0, o = 1 / 0;
    for (; l < e.length && (c += yr(e[l]), l++, o = (n - Dt * (l - i - 1)) / c, !(o <= wr)); )
      ;
    if (o > wr && !r) break;
    s(i, l, Math.round(Math.min(o, Ql))), i = l;
  }
  return i;
}
function ao(e, t, n) {
  const r = [];
  let s = 0;
  for (let i = e.from; i < e.to; i++) {
    const c = i === e.to - 1 ? n - s : Math.round(yr(t[i]) * e.height);
    r.push({ index: i, x: s, w: c }), s += c + Dt;
  }
  return r;
}
function so(e, t) {
  const n = Math.min((e | 0) - 1, Ts);
  if (n < 1) return [];
  const r = Math.min(eo, t * to), s = [];
  for (let i = 1; i <= n; i++)
    s.push({
      top: Math.round(tn * (n - i) / n),
      inset: Math.round(i * r),
      // Integer percent, so the value lands on the decimal it reads as rather
      // than on whatever a chain of float multiplies leaves behind.
      opacity: (100 - (i - 1) * no) / 100
    });
  return s;
}
function Ra(e, t, n) {
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
var io = /* @__PURE__ */ I('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), lo = /* @__PURE__ */ I('<div class="glass pane svelte-5g1i2z" role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div></div>');
function oo(e, t) {
  pt(t, !0);
  let n = ie(t, "frames", 19, () => []), r = ie(t, "origin", 3, null), s = ie(t, "onreveal", 3, () => {
  }), i = ie(t, "onclose", 3, () => {
  });
  const l = 40, c = /* @__PURE__ */ se(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let o = /* @__PURE__ */ Y(0), d = /* @__PURE__ */ Y(0), _ = /* @__PURE__ */ Y(null), b = /* @__PURE__ */ Y(Oe(/* @__PURE__ */ new Set()));
  const p = 4, h = 25, v = { x: 0, y: 0, w: 0, h: 0 }, w = /* @__PURE__ */ se(() => Math.max(0, a(o) - l * 2)), u = /* @__PURE__ */ se(() => Math.max(0, a(d) - l * 2)), g = /* @__PURE__ */ se(() => a(w) > 0 && a(u) > 0 ? A(n(), a(w), a(u)) : n().map(() => v));
  function y(T, C, B) {
    const K = [];
    let J = 0, U = 0;
    for (let Z = 0; Z < T.length; Z++)
      U += yr(T[Z]), U * B + Dt * (Z - J) >= C && (K.push({ from: J, to: Z + 1, sum: U }), J = Z + 1, U = 0);
    return J < T.length && K.push({ from: J, to: T.length, sum: U }), K;
  }
  function O(T, C, B) {
    return T.map((K, J) => {
      const U = (C - Dt * (K.to - K.from - 1)) / K.sum;
      return J === T.length - 1 && U > B ? B : U;
    });
  }
  function F(T, C, B) {
    return O(T, C, B).reduce((K, J) => K + J, 0) + Dt * (T.length - 1);
  }
  function A(T, C, B) {
    let K = p, J = Math.max(p, B);
    for (let H = 0; H < h; H++) {
      const N = (K + J) / 2;
      F(y(T, C, N), C, N) <= B ? K = N : J = N;
    }
    const U = y(T, C, K), Z = O(U, C, K), he = [];
    let te = (B - (Z.reduce((H, N) => H + N, 0) + Dt * (U.length - 1))) / 2;
    return U.forEach((H, N) => {
      const V = Z[N], z = [];
      for (let $ = H.from; $ < H.to; $++) z.push(yr(T[$]) * V);
      const E = z.reduce(($, re) => $ + re, 0) + Dt * (z.length - 1);
      let k = (C - E) / 2;
      for (const $ of z)
        he.push({
          x: Math.round(k),
          y: Math.round(te),
          w: Math.round($),
          h: Math.round(V)
        }), k += $ + Dt;
      te += V + Dt;
    }), he;
  }
  function L(T) {
    if (!r() || !T || !T.w || !T.h) return "none";
    const C = r().left - (l + T.x), B = r().top - (l + T.y);
    return `translate(${C}px, ${B}px) scale(${r().width / T.w}, ${r().height / T.h})`;
  }
  function W(T) {
    T.key === "Escape" && i()();
  }
  function G(T) {
    T.target.closest(".frame") || i()();
  }
  Bn(() => {
    const T = document.activeElement;
    return a(_)?.focus(), () => {
      T instanceof HTMLElement && document.contains(T) && T.focus();
    };
  });
  var j = lo();
  Nn("keydown", yn, W), Nn("pointerdown", yn, G);
  var S = f(j);
  vn(S, "", {}, { inset: "40px" }), We(S, 23, n, (T) => T.id, (T, C, B) => {
    var K = io();
    let J;
    var U = f(K);
    let Z;
    q(
      (he, te) => {
        J = vn(K, "", J, he), ue(U, "src", `/d/${a(C).s ?? ""}.webp`), Z = Se(U, 1, "svelte-5g1i2z", null, Z, te);
      },
      [
        () => ({
          left: `${a(g)[a(B)].x ?? ""}px`,
          top: `${a(g)[a(B)].y ?? ""}px`,
          width: `${a(g)[a(B)].w ?? ""}px`,
          height: `${a(g)[a(B)].h ?? ""}px`,
          "--flight": L(a(g)[a(B)])
        }),
        () => ({ loaded: a(b).has(a(C).id) })
      ]
    ), ne("click", K, () => s()(a(C))), Nn("load", U, () => x(b, new Set(a(b)).add(a(C).id), !0)), P(T, K);
  }), mr(j, (T) => x(_, T), () => a(_)), q(() => ue(j, "aria-label", a(c))), Yr("innerWidth", (T) => x(o, T, !0)), Yr("innerHeight", (T) => x(d, T, !0)), P(e, j), gt();
}
Lt(["click"]);
var co = /* @__PURE__ */ I('<span class="err svelte-uzy12d"> </span>'), uo = /* @__PURE__ */ I(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), fo = /* @__PURE__ */ I(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), ho = /* @__PURE__ */ I('<span class="muted svelte-uzy12d"> </span>'), vo = /* @__PURE__ */ I('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function po(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ Y(null), r = /* @__PURE__ */ Y(!1), s = /* @__PURE__ */ Y(null);
  async function i() {
    x(r, !0), x(s, null);
    try {
      x(n, await Fe.probe(), !0);
    } catch (h) {
      x(s, String(h), !0);
    } finally {
      x(r, !1);
    }
  }
  var l = vo(), c = f(l), o = f(c), d = m(c, 2);
  {
    var _ = (h) => {
      var v = co(), w = f(v);
      q(() => R(w, a(s))), P(h, v);
    }, b = (h) => {
      var v = sa(), w = ot(v);
      {
        var u = (y) => {
          var O = uo(), F = m(f(O), 2);
          q(
            (A) => R(F, ` above are formats the header
        reader cannot measure (${A ?? ""}) or files with no
        extension.`),
            [() => a(n).formats.join(" ")]
          ), P(y, O);
        }, g = (y) => {
          var O = fo(), F = f(O), A = f(F), L = m(F, 2), W = f(L);
          q(
            (G) => {
              R(A, G), R(W, a(n).command);
            },
            [() => Ne(a(n).worklist)]
          ), P(y, O);
        };
        X(w, (y) => {
          a(n).worklist === 0 ? y(u) : y(g, -1);
        });
      }
      P(h, v);
    }, p = (h) => {
      var v = ho(), w = f(v);
      q(() => R(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), P(h, v);
    };
    X(d, (h) => {
      a(s) ? h(_) : a(n) ? h(b, 1) : h(p, -1);
    });
  }
  q(() => {
    c.disabled = a(r), R(o, a(r) ? "counting…" : "Check the dimension probe's worklist");
  }), ne("click", c, i), P(e, l), gt();
}
Lt(["click"]);
var go = /* @__PURE__ */ I('<p class="bad svelte-1xjbga"> </p>'), _o = /* @__PURE__ */ I('<pre class="svelte-1xjbga"> </pre>'), bo = /* @__PURE__ */ I('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), mo = /* @__PURE__ */ I(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), wo = /* @__PURE__ */ I('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), yo = /* @__PURE__ */ I('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), xo = /* @__PURE__ */ I(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), ko = /* @__PURE__ */ I('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), So = /* @__PURE__ */ I(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function Eo(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ Y(null), r = /* @__PURE__ */ Y(!1), s = /* @__PURE__ */ Y(null), i = /* @__PURE__ */ Y(null);
  const l = /* @__PURE__ */ se(() => a(n)?.state === "running"), c = /* @__PURE__ */ se(() => a(n)?.snapshot ? a(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const y = await Fe.rebuildStatus();
      x(n, y, !0), x(s, null), y.state === "done" && y.started_at !== a(i) && (x(i, y.started_at, !0), t.oncomplete?.());
    } catch (y) {
      x(s, String(y), !0);
    }
  }
  Bn(() => {
    o();
  }), ln(() => {
    if (!a(l)) return;
    const y = setInterval(o, 700);
    return () => clearInterval(y);
  });
  async function d() {
    x(r, !0), x(s, null);
    try {
      x(n, await Fe.rebuild(), !0);
    } catch (y) {
      x(s, String(y), !0);
    }
  }
  function _(y) {
    y.key === "Escape" && x(r, !1);
  }
  var b = So();
  Nn("keydown", yn, _);
  var p = ot(b), h = f(p), v = f(h), w = m(h, 2), u = m(p, 2);
  {
    var g = (y) => {
      var O = ko(), F = ot(O), A = m(F, 2), L = f(A), W = m(f(L), 4), G = f(W), j = m(W, 2), S = m(L, 2);
      {
        var T = (te) => {
          var H = go(), N = f(H);
          q(() => R(N, a(s))), P(te, H);
        };
        X(S, (te) => {
          a(s) && te(T);
        });
      }
      var C = m(S, 2);
      We(C, 17, () => a(n)?.steps ?? [], yt, (te, H) => {
        var N = bo();
        let V;
        var z = f(N), E = f(z), k = f(E);
        {
          var $ = (pe) => {
            var de = Rn("✓");
            P(pe, de);
          }, re = (pe) => {
            var de = Rn("✕");
            P(pe, de);
          }, oe = (pe) => {
            var de = Rn("·");
            P(pe, de);
          }, le = (pe) => {
            var de = Rn(" ");
            P(pe, de);
          };
          X(k, (pe) => {
            a(H).state === "done" ? pe($) : a(H).state === "failed" ? pe(re, 1) : a(H).state === "running" ? pe(oe, 2) : pe(le, -1);
          });
        }
        var Q = m(E, 2), ce = f(Q), Ee = m(Q, 4), He = f(Ee), ke = m(z, 2);
        {
          var rt = (pe) => {
            var de = _o(), Pe = f(de);
            q((Ce) => R(Pe, Ce), [() => a(H).log.join(`
`)]), P(pe, de);
          };
          X(ke, (pe) => {
            a(H).log.length && pe(rt);
          });
        }
        q(() => {
          V = Se(N, 1, "step svelte-1xjbga", null, V, {
            on: a(H).state === "running",
            bad: a(H).state === "failed"
          }), R(ce, a(H).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), R(He, a(H).seconds === null ? "" : a(H).seconds + "s");
        }), P(te, N);
      });
      var B = m(C, 2);
      {
        var K = (te) => {
          var H = mo(), N = ot(H), V = f(N);
          q(() => R(V, a(n).error)), P(te, H);
        }, J = (te) => {
          var H = wo();
          P(te, H);
        }, U = (te) => {
          var H = yo();
          P(te, H);
        };
        X(B, (te) => {
          a(n)?.state === "failed" ? te(K) : a(n)?.state === "done" ? te(J, 1) : a(l) && te(U, 2);
        });
      }
      var Z = m(B, 2);
      {
        var he = (te) => {
          var H = xo(), N = m(f(H), 6), V = f(N);
          q(() => R(V, `python -m photolib.restore_state ${a(c) ?? ""}`)), P(te, H);
        };
        X(Z, (te) => {
          a(c) && te(he);
        });
      }
      q(() => R(G, `${a(n)?.seconds ?? 0 ?? ""}s`)), ne("click", F, () => x(r, !1)), ne("click", j, () => x(r, !1)), P(y, O);
    };
    X(u, (y) => {
      a(r) && y(g);
    });
  }
  q(() => {
    h.disabled = a(l), R(v, a(l) ? "applying…" : "Apply to grid"), w.disabled = !a(n) || a(n).state === "idle";
  }), ne("click", h, d), ne("click", w, () => x(r, !0)), P(e, b), gt();
}
Lt(["click"]);
var To = /* @__PURE__ */ I('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), Pa = /* @__PURE__ */ I("<option> </option>"), Mo = /* @__PURE__ */ I('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), Ao = /* @__PURE__ */ I('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), Ro = /* @__PURE__ */ I('<div class="none muted svelte-bqi9ky"> </div>'), Po = /* @__PURE__ */ I('<div class="bar svelte-bqi9ky"><!></div>');
function Co(e, t) {
  pt(t, !0);
  let n = ie(t, "candidate", 3, null), r = ie(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), c = /* @__PURE__ */ se(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ se(() => !!n() && n().op !== "is null");
  function d(w, u) {
    const g = { ...n(), [w]: u };
    if (w === "column") {
      const y = i[u] ?? ["="];
      y.includes(g.op) || (g.op = y[0]), g.value = l.has(u) ? 0 : "";
    }
    w === "op" && u === "is null" && (g.value = null), w === "value" && l.has(g.column) && (g.value = Number(u) || 0), t.onedit(g);
  }
  var _ = Po(), b = f(_);
  {
    var p = (w) => {
      var u = To(), g = f(u), y = f(g), O = m(g, 2), F = f(O);
      q(() => {
        R(y, `${t.screen.title ?? ""} does not save a rule.`), R(F, t.screen.blurb);
      }), P(w, u);
    }, h = (w) => {
      var u = Ao(), g = ot(u), y = f(g);
      We(y, 21, () => s, yt, (N, V) => {
        var z = Pa(), E = f(z), k = {};
        q(() => {
          R(E, a(V)), k !== (k = a(V)) && (z.value = (z.__value = a(V)) ?? "");
        }), P(N, z);
      });
      var O;
      lr(y);
      var F = m(y, 2);
      We(F, 21, () => a(c), yt, (N, V) => {
        var z = Pa(), E = f(z), k = {};
        q(() => {
          R(E, a(V)), k !== (k = a(V)) && (z.value = (z.__value = a(V)) ?? "");
        }), P(N, z);
      });
      var A;
      lr(F);
      var L = m(F, 2);
      {
        var W = (N) => {
          var V = Mo();
          q(() => dn(V, n().value ?? "")), ne("input", V, (z) => d("value", z.currentTarget.value)), P(N, V);
        };
        X(L, (N) => {
          a(o) && N(W);
        });
      }
      var G = m(L, 2), j = f(G);
      j.value = j.__value = "exclude";
      var S = m(j);
      S.value = S.__value = "include";
      var T;
      lr(G);
      var C = m(G, 2), B = f(C);
      B.value = B.__value = "end";
      var K = m(B);
      K.value = K.__value = "0";
      var J;
      lr(C);
      var U = m(C, 2), Z = f(U), he = m(U, 2), te = m(g, 2), H = f(te);
      q(
        (N, V) => {
          O !== (O = n().column) && (y.value = (y.__value = n().column) ?? "", Jn(y, n().column)), A !== (A = n().op) && (F.value = (F.__value = n().op) ?? "", Jn(F, n().op)), T !== (T = n().decision ?? "exclude") && (G.value = (G.__value = n().decision ?? "exclude") ?? "", Jn(G, n().decision ?? "exclude")), J !== (J = N) && (C.value = (C.__value = N) ?? "", Jn(C, N)), U.disabled = r(), R(Z, r() ? "saving…" : "Confirm"), R(H, `${V ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => hl(n())
        ]
      ), ne("change", y, (N) => d("column", N.currentTarget.value)), ne("change", F, (N) => d("op", N.currentTarget.value)), ne("change", G, (N) => d("decision", N.currentTarget.value)), ne("change", C, (N) => d("at", N.currentTarget.value)), ne("click", U, function(...N) {
        t.onconfirm?.apply(this, N);
      }), ne("click", he, function(...N) {
        t.onclear?.apply(this, N);
      }), P(w, u);
    }, v = (w) => {
      var u = Ro(), g = f(u);
      q(() => R(g, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), P(w, u);
    };
    X(b, (w) => {
      t.screen.rule === !1 ? w(p) : n() ? w(h, 1) : w(v, -1);
    });
  }
  P(e, _), gt();
}
Lt(["change", "input", "click"]);
var No = /* @__PURE__ */ I('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), Oo = /* @__PURE__ */ I('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), Io = /* @__PURE__ */ I('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Fo = /* @__PURE__ */ I('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Lo(e, t) {
  pt(t, !0);
  let n = ie(t, "rules", 19, () => []), r = ie(t, "unmatched", 3, null), s = ie(t, "busy", 3, !1);
  var i = Fo(), l = f(i), c = m(f(l)), o = f(c), d = m(l, 2);
  {
    var _ = (v) => {
      var w = No();
      P(v, w);
    };
    X(d, (v) => {
      n().length === 0 && v(_);
    });
  }
  var b = m(d, 2);
  We(b, 19, n, (v) => v.id, (v, w, u) => {
    var g = Oo();
    let y;
    var O = f(g), F = f(O), A = f(F), L = m(F, 2), W = f(L), G = m(L, 2), j = f(G), S = m(O, 2), T = f(S), C = f(T), B = m(T, 2), K = f(B), J = m(B, 4), U = m(J, 2), Z = m(U, 2);
    q(
      (he, te) => {
        y = Se(g, 1, "rule svelte-aof9c2", null, y, { exclude: a(w).decision === "exclude" }), R(A, a(u)), R(W, a(w).predicate), R(j, a(w).decision), R(C, `${he ?? ""} paths`), R(K, te), J.disabled = s() || a(u) === 0, U.disabled = s() || a(u) === n().length - 1, Z.disabled = s();
      },
      [
        () => Ne(a(w).paths),
        () => Pt(a(w).bytes)
      ]
    ), ne("click", J, () => t.onmove(a(w), a(u) - 1)), ne("click", U, () => t.onmove(a(w), a(u) + 1)), ne("click", Z, () => t.ondelete(a(w))), P(v, g);
  });
  var p = m(b, 2);
  {
    var h = (v) => {
      var w = Io(), u = m(f(w), 2), g = f(u), y = f(g), O = m(g, 2), F = f(O);
      q(
        (A, L) => {
          R(y, `${A ?? ""} paths`), R(F, L);
        },
        [
          () => Ne(r().paths),
          () => Pt(r().bytes)
        ]
      ), P(v, w);
    };
    X(p, (v) => {
      r() && v(h);
    });
  }
  q(() => R(o, `${n().length ?? ""} rules · top-down, first match wins`)), P(e, i), gt();
}
Lt(["click"]);
const Ca = 2500, zo = 1, Do = 2, jo = 3e7, un = /* @__PURE__ */ new WeakMap();
function Ho(e) {
  return un.get(e).photo.getBoundingClientRect();
}
function qo(e, t, n) {
  const r = [], s = [], i = /* @__PURE__ */ new Map(), l = [], c = [];
  let o = 0, d = tn, _ = null, b = null, p = null, h = !1, v = !1, w = 0, u = 0, g = 0, y = n.onState || (() => {
  });
  function O(E) {
    w <= 0 || (o = ro(r, o, w, E, (k, $, re) => {
      s.push({ top: d, height: re, from: k, to: $ }), d += re + Aa;
    }), A());
  }
  function F() {
    if (b === null || h || w <= 0 || o >= b) return 0;
    const E = s.length ? o / s.length : Math.max(1, w / wr), k = s.length ? (d - tn) / s.length : wr + Aa, $ = Math.round((b - o) / E * k);
    return Math.max(0, Math.min($, jo - d));
  }
  function A() {
    e.style.height = d + F() + "px", t.style.top = Math.max(0, d - 1) + "px";
  }
  function L() {
    return window.scrollY - e.offsetTop;
  }
  function W() {
    const E = l.pop();
    if (E) return E;
    const k = document.createElement("div");
    k.className = "tile";
    const $ = document.createElement("div");
    $.className = "deck", $.style.height = tn + "px";
    const re = [];
    for (let Q = 0; Q < Ts; Q++) {
      const ce = document.createElement("div");
      ce.className = "card", ce.hidden = !0, re.push(ce);
    }
    for (let Q = re.length - 1; Q >= 0; Q--) $.appendChild(re[Q]);
    k.appendChild($);
    const oe = document.createElement("div");
    oe.className = "tile-photo";
    const le = document.createElement("img");
    return le.decoding = "async", le.addEventListener("load", () => k.classList.add("loaded")), le.addEventListener("error", () => k.classList.add("missing")), oe.appendChild(le), k.appendChild(oe), un.set(k, { img: le, photo: oe, strip: $, cards: re, above: 0 }), n.extend && n.extend(k), k;
  }
  function G(E, k) {
    const { img: $, photo: re } = un.get(k);
    $.removeAttribute("src"), k.classList.remove("loaded", "missing", "error"), re.style.backgroundImage = "", k.remove(), i.delete(E), l.push(k);
  }
  function j(E, k, $) {
    const re = un.get(E), oe = so(k.n, $);
    re.above = oe.length ? tn : 0, re.strip.hidden = oe.length === 0;
    for (let le = 0; le < re.cards.length; le++) {
      const Q = oe[le];
      re.cards[le].hidden = Q === void 0, Q !== void 0 && (re.cards[le].style.top = Q.top + "px", re.cards[le].style.left = Q.inset + "px", re.cards[le].style.right = Q.inset + "px", re.cards[le].style.opacity = String(Q.opacity));
    }
  }
  function S(E, k, $, re, oe, le) {
    let Q = i.get(E);
    const ce = r[E];
    if (!Q) {
      Q = W(), Q.dataset.index = String(E);
      const ke = un.get(Q).img;
      j(Q, ce, re), ke.fetchPriority = le ? "high" : "low", ke.src = "/t/" + ce.s + ".webp", c.push(E), n.fill && n.fill(Q, ce), e.appendChild(Q), i.set(E, Q);
    }
    const { above: Ee, photo: He } = un.get(Q);
    Q.style.width = re + "px", Q.style.height = oe + Ee + "px", Q.style.transform = "translate(" + k + "px," + ($ - Ee) + "px)", He.style.height = oe + "px";
  }
  function T(E, k) {
    k.th && (k.url === void 0 && (k.url = n.thumbHash(k.th)), k.url && (un.get(E).photo.style.backgroundImage = "url(" + k.url + ")"));
  }
  function C() {
    g = 0;
    for (const E of c) {
      const k = i.get(E);
      k && !k.classList.contains("loaded") && T(k, r[E]);
    }
    c.length = 0;
  }
  function B(E, k) {
    for (const $ of ao(E, r, w))
      S($.index, $.x, E.top, $.w, E.height, k);
  }
  function K() {
    const E = window.innerHeight, k = L(), $ = Ra(s, k - E * zo, k + E * (1 + Do));
    if (!$) return;
    const re = s[$[0]].from, oe = s[$[1]].to;
    for (const [le, Q] of Array.from(i))
      (le < re || le >= oe) && G(le, Q);
    for (let le = $[0]; le <= $[1]; le++) {
      const Q = s[le];
      B(Q, Q.top < k + E && Q.top + Q.height > k);
    }
    c.length && !g && (g = requestAnimationFrame(C));
  }
  function J() {
    return w <= 0 ? !1 : d - (L() + window.innerHeight) < Ca;
  }
  async function U() {
    if (v || h) return;
    v = !0;
    const E = u;
    y({ loading: !0, count: r.length, exhausted: h, total: b, tiles: p });
    try {
      do {
        const k = await n.fetchPage(_);
        if (E !== u) return;
        for (const $ of k.photos) r.push($);
        _ = k.next, h = _ === null, typeof k.stacks == "number" ? (b = k.stacks, p = typeof k.total == "number" ? k.total : null) : typeof k.total == "number" && (b = k.total), O(h), K(), y({ loading: !0, count: r.length, exhausted: h, total: b, tiles: p });
      } while (!h && J());
    } catch (k) {
      E === u && y({ error: String(k) });
    } finally {
      E === u && (v = !1, y({ loading: !1, count: r.length, exhausted: h, total: b, tiles: p }));
    }
  }
  let Z = 0;
  function he() {
    Z || (Z = requestAnimationFrame(() => {
      Z = 0, K(), J() && U();
    }));
  }
  function te() {
    const E = e.clientWidth;
    if (E === w) return;
    const k = Ra(s, L(), L()), $ = k ? s[k[0]].from : 0;
    w = E;
    for (const [oe, le] of Array.from(i)) G(oe, le);
    s.length = 0, o = 0, d = tn, O(h), K();
    const re = s.find((oe) => oe.to > $);
    re && window.scrollTo(0, re.top + e.offsetTop), J() && U();
  }
  function H(E) {
    const k = E.target.closest(".tile");
    if (!k || !e.contains(k)) return;
    const $ = r[Number(k.dataset.index)];
    $ && n.activate && n.activate($, E, k);
  }
  e.addEventListener("click", H), window.addEventListener("scroll", he, { passive: !0 });
  let N = 0;
  const V = new ResizeObserver(() => {
    clearTimeout(N), N = setTimeout(te, 100);
  });
  V.observe(e);
  const z = new IntersectionObserver(
    (E) => {
      E.some((k) => k.isIntersecting) && U();
    },
    { rootMargin: "0px 0px " + Ca + "px 0px" }
  );
  return z.observe(t), w = e.clientWidth, U(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      u++, v = !1;
      for (const [E, k] of Array.from(i)) G(E, k);
      r.length = 0, s.length = 0, c.length = 0, o = 0, d = tn, _ = null, b = null, p = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), U();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(E) {
      const k = typeof E == "number" ? E : null;
      k !== b && (b = k, A(), y({ total: b }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [E, k] of i) n.fill(k, r[E]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(E) {
      for (const [k, $] of i)
        r[k] === E && n.fill && n.fill($, E);
    },
    destroy() {
      u++, e.removeEventListener("click", H), window.removeEventListener("scroll", he), V.disconnect(), z.disconnect(), clearTimeout(N), cancelAnimationFrame(g);
    }
  };
}
function Bo(e) {
  try {
    const t = Uint8Array.from(atob(e), (C) => C.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, c = (n >> 18 & 31) / 31, o = n >> 23, d = (r >> 3 & 63) / 63, _ = (r >> 9 & 63) / 63, b = r >> 15, p = Math.max(3, b ? o ? 5 : 7 : r & 7), h = Math.max(3, b ? r & 7 : o ? 5 : 7);
    let v = o ? 6 : 5, w = 0;
    const u = (C, B, K) => {
      const J = [];
      for (let U = 0; U < B; U++)
        for (let Z = U ? 0 : 1; Z * B < C * (B - U); Z++) {
          const he = t[v + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          J.push((he / 7.5 - 1) * K);
        }
      return J;
    }, g = u(p, h, c), y = u(3, 3, d * 1.25), O = u(3, 3, _ * 1.25), F = p / h, A = Math.max(1, Math.round(F > 1 ? 32 : 32 * F)), L = Math.max(1, Math.round(F > 1 ? 32 / F : 32)), W = document.createElement("canvas");
    W.width = A, W.height = L;
    const G = W.getContext("2d"), j = G.createImageData(A, L), S = [], T = [];
    for (let C = 0, B = 0; C < L; C++)
      for (let K = 0; K < A; K++, B += 4) {
        let J = s, U = i, Z = l;
        for (let N = 0; N < p; N++) S[N] = Math.cos(Math.PI / A * (K + 0.5) * N);
        for (let N = 0; N < h; N++) T[N] = Math.cos(Math.PI / L * (C + 0.5) * N);
        for (let N = 0, V = 0; N < h; N++)
          for (let z = N ? 0 : 1; z * h < p * (h - N); z++, V++)
            J += g[V] * S[z] * T[N] * 2;
        for (let N = 0, V = 0; N < 3; N++)
          for (let z = N ? 0 : 1; z < 3 - N; z++, V++) {
            const E = S[z] * T[N] * 2;
            U += y[V] * E, Z += O[V] * E;
          }
        const he = J - 2 / 3 * U, te = (3 * J - he + Z) / 2, H = te - Z;
        j.data[B] = Math.max(0, Math.min(255, Math.round(255 * te))), j.data[B + 1] = Math.max(0, Math.min(255, Math.round(255 * H))), j.data[B + 2] = Math.max(0, Math.min(255, Math.round(255 * he))), j.data[B + 3] = 255;
      }
    return G.putImageData(j, 0, 0), W.toDataURL();
  } catch {
    return null;
  }
}
var $o = /* @__PURE__ */ I('<main id="canvas"><div id="sentinel"></div></main>');
function Uo(e, t) {
  pt(t, !0);
  let n = ie(t, "key", 3, ""), r = ie(t, "total", 3, null), s = ie(t, "triage", 3, !1), i = ie(t, "excludedDirs", 19, () => []), l = ie(t, "onActivate", 3, () => {
  }), c = ie(t, "onOverride", 3, async () => null), o = ie(t, "onExcludeFolder", 3, () => {
  }), d = ie(t, "onState", 3, () => {
  }), _ = /* @__PURE__ */ Y(null), b = /* @__PURE__ */ Y(null), p = null, h = "";
  const v = { null: "exclude", exclude: "include", include: "clear" };
  function w(A) {
    const L = A.toLowerCase().startsWith(Dn.toLowerCase()) ? A.slice(Dn.length + 1) : A;
    return L.length > 64 ? "…" + L.slice(-64) : L;
  }
  function u(A) {
    const L = document.createElement("div");
    L.className = "tile-path", A.appendChild(L);
    const W = document.createElement("button");
    W.className = "chip", W.type = "button", A.appendChild(W);
    const G = document.createElement("button");
    G.className = "dirchip", G.type = "button", G.textContent = "dir", A.appendChild(G);
  }
  function g(A, L) {
    const W = A.querySelector(".tile-path");
    W && (W.textContent = L.p ? w(L.p) : "");
    const G = A.querySelector(".dirchip");
    if (G) {
      const S = _s(L.p ?? ""), T = S !== "" && la(i(), S);
      G.hidden = S === "", G.disabled = T, G.dataset.state = T ? "exclude" : "none", G.title = T ? `already excluded: ${S}` : `exclude everything under ${S}, subfolders included — one exclude rule at the end of the order`;
    }
    const j = A.querySelector(".chip");
    j && (j.dataset.state = L.o || "none", j.textContent = L.o === "exclude" ? "drop" : L.o === "include" ? "keep" : "·", j.title = L.o === "exclude" ? "overridden: excluded — click to keep" : L.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Bn(() => (p = qo(a(_), a(b), {
    fetchPage: (A) => t.fetchPage(A),
    thumbHash: Bo,
    extend: s() ? u : void 0,
    fill: s() ? g : void 0,
    onState: (A) => d()(A),
    activate: async (A, L, W) => {
      if (L.target.closest(".dirchip")) {
        o()(A);
        return;
      }
      if (!L.target.closest(".chip")) {
        l()(A, W);
        return;
      }
      const G = v[A.o ?? "null"];
      A.o = await c()(A, G), g(W, A);
    }
  }), h = n(), () => p?.destroy())), ln(() => {
    const A = n(), L = r();
    p && (A !== h && (h = A, p.reset()), p.setTotal(L));
  });
  let y = "";
  ln(() => {
    const A = i().join(`
`);
    !p || A === y || (y = A, p.refill());
  });
  var O = $o(), F = f(O);
  mr(F, (A) => x(b, A), () => a(b)), mr(O, (A) => x(_, A), () => a(_)), P(e, O), gt();
}
var Go = /* @__PURE__ */ I('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Wo = /* @__PURE__ */ I('<th class="num svelte-1v3p82v"> </th>'), Yo = /* @__PURE__ */ I('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Ko = /* @__PURE__ */ I('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Vo = /* @__PURE__ */ I('<td class="num svelte-1v3p82v"> </td>'), Xo = /* @__PURE__ */ I('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), Jo = /* @__PURE__ */ I('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Zo(e, t) {
  pt(t, !0);
  let n = ie(t, "rows", 19, () => []), r = ie(t, "rules", 19, () => []), s = ie(t, "root", 3, null), i = ie(t, "selected", 3, null), l = ie(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const c = /* @__PURE__ */ se(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const d = /* @__PURE__ */ se(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : bs(r(), t.screen.toRule(w, s()))
  ]))), _ = { exclude: "✕", include: "✓" }, b = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var p = sa(), h = ot(p);
  {
    var v = (w) => {
      var u = Jo(), g = f(u), y = f(g), O = f(y);
      {
        var F = (S) => {
          var T = Go();
          P(S, T);
        };
        X(O, (S) => {
          a(c) && S(F);
        });
      }
      var A = m(O), L = f(A), W = m(A, 3);
      {
        var G = (S) => {
          var T = Wo(), C = f(T);
          q(() => R(C, t.screen.heading[1])), P(S, T);
        };
        X(W, (S) => {
          t.screen.heading[1] && S(G);
        });
      }
      var j = m(g);
      We(j, 23, n, (S) => S.key, (S, T, C) => {
        const B = /* @__PURE__ */ se(() => a(d).get(a(T).key));
        var K = Xo();
        let J;
        var U = f(K);
        {
          var Z = (ce) => {
            const Ee = /* @__PURE__ */ se(() => l().has(a(T).key));
            var He = Yo(), ke = f(He);
            let rt;
            var pe = f(ke);
            q(
              (de) => {
                rt = Se(ke, 1, "tick svelte-1v3p82v", null, rt, { on: a(Ee) }), ue(ke, "aria-checked", a(Ee)), ue(ke, "aria-label", `select ${de ?? ""}`), R(pe, a(Ee) ? "✓" : "");
              },
              [() => o(a(T))]
            ), ne("click", ke, (de) => {
              de.stopPropagation(), t.oncheck(a(T), a(C), de.shiftKey);
            }), P(ce, He);
          };
          X(U, (ce) => {
            a(c) && ce(Z);
          });
        }
        var he = m(U), te = f(he);
        let H;
        var N = f(te), V = m(te), z = m(V);
        {
          var E = (ce) => {
            var Ee = Ko();
            P(ce, Ee);
          };
          X(z, (ce) => {
            a(T).scope === "whole inventory" && ce(E);
          });
        }
        var k = m(he), $ = f(k), re = m(k), oe = f(re), le = m(re);
        {
          var Q = (ce) => {
            var Ee = Vo(), He = f(Ee);
            q(() => R(He, a(T).detail ?? "")), P(ce, Ee);
          };
          X(le, (ce) => {
            t.screen.heading[1] && ce(Q);
          });
        }
        q(
          (ce, Ee, He) => {
            J = Se(K, 1, "svelte-1v3p82v", null, J, {
              picked: i() === a(T).key,
              clickable: t.screen.sheet !== !1
            }), H = Se(te, 1, "mark svelte-1v3p82v", null, H, {
              exclude: a(B) === "exclude",
              include: a(B) === "include"
            }), ue(te, "title", b[a(B)] ?? ""), R(N, _[a(B)] ?? ""), R(V, `${ce ?? ""} `), R($, Ee), R(oe, He);
          },
          [
            () => o(a(T)),
            () => Ne(a(T).paths),
            () => Pt(a(T).bytes)
          ]
        ), ne("click", K, () => t.onpick(a(T))), P(S, K);
      }), q(() => R(L, t.screen.heading[0] ?? "")), P(w, u);
    };
    X(h, (w) => {
      n().length && w(v);
    });
  }
  P(e, p), gt();
}
Lt(["click"]);
var Qo = /* @__PURE__ */ I('<button class="twisty svelte-pucy57"> </button>'), ec = /* @__PURE__ */ I('<span class="twisty leaf svelte-pucy57">·</span>'), tc = /* @__PURE__ */ I('<span class="name root svelte-pucy57"> </span>'), nc = /* @__PURE__ */ I('<button class="name svelte-pucy57"> </button>'), rc = /* @__PURE__ */ I('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), ac = /* @__PURE__ */ I('<div class="note svelte-pucy57"> </div>'), sc = /* @__PURE__ */ I('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), ic = /* @__PURE__ */ I('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), lc = /* @__PURE__ */ I('<div class="tree svelte-pucy57"></div>');
function oc(e, t) {
  pt(t, !0);
  let n = ie(t, "version", 3, 0), r = ie(t, "excludedDirs", 19, () => []), s = ie(t, "selected", 3, null), i = ie(t, "busy", 3, !1), l = /* @__PURE__ */ Y(Oe(/* @__PURE__ */ new Map())), c = /* @__PURE__ */ Y(Oe(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ Y(Oe(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ Y(Oe(/* @__PURE__ */ new Set()));
  async function _(u) {
    x(o, new Set(a(o)).add(u), !0);
    const g = await t.onload(u), y = new Map(a(l)), O = new Set(a(d));
    g ? (y.set(u, g), O.delete(u)) : O.add(u), x(l, y, !0), x(d, O, !0), x(o, new Set([...a(o)].filter((F) => F !== u)), !0);
  }
  function b(u) {
    if (a(c).has(u)) {
      x(c, new Set([...a(c)].filter((g) => g !== u)), !0);
      return;
    }
    x(c, new Set(a(c)).add(u), !0), a(l).has(u) || _(u);
  }
  let p = -1;
  ln(() => {
    const u = n();
    if (u !== p) {
      p = u, a(c).has(t.root) || x(c, new Set(a(c)).add(t.root), !0);
      for (const g of a(c)) _(g);
    }
  });
  const h = /* @__PURE__ */ se(() => {
    const u = [], g = (A, L, W, G, j, S) => {
      const T = a(l).get(A), C = a(c).has(A);
      if (u.push({
        key: A,
        name: L,
        depth: W,
        paths: G,
        bytes: j,
        deeper: S,
        expanded: C,
        here: T?.here ?? null,
        truncated: !!T?.truncated,
        loading: a(o).has(A),
        failed: a(d).has(A),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: la(r(), A)
      }), !(!C || !T))
        for (const B of T.children)
          g(B.path, B.name, W + 1, B.paths, B.bytes, B.deeper);
    }, y = a(l).get(t.root), O = y ? y.children.reduce((A, L) => A + L.paths, 0) + y.here.paths : 0, F = y ? y.children.reduce((A, L) => A + L.bytes, 0) + y.here.bytes : 0;
    return g(t.root, t.root, 0, O, F, !0), u;
  }), v = 8;
  var w = lc();
  We(w, 21, () => a(h), (u) => u.key, (u, g) => {
    var y = ic(), O = ot(y);
    let F;
    var A = f(O);
    let L;
    var W = m(A, 2);
    {
      var G = (z) => {
        var E = Qo(), k = f(E);
        q(() => {
          ue(E, "aria-expanded", a(g).expanded), ue(E, "aria-label", `${a(g).expanded ? "collapse" : "expand"} ${a(g).name ?? ""}`), ue(E, "title", a(g).expanded ? "collapse" : "expand"), R(k, a(g).loading ? "·" : a(g).expanded ? "▾" : "▸");
        }), ne("click", E, () => b(a(g).key)), P(z, E);
      }, j = (z) => {
        var E = ec();
        P(z, E);
      };
      X(W, (z) => {
        a(g).deeper ? z(G) : z(j, -1);
      });
    }
    var S = m(W, 2);
    {
      var T = (z) => {
        var E = tc(), k = f(E);
        q(() => R(k, a(g).key)), P(z, E);
      }, C = (z) => {
        var E = nc(), k = f(E);
        q(() => {
          ue(E, "title", `Show every kept file under ${a(g).key ?? ""}`), R(k, a(g).name);
        }), ne("click", E, () => t.onpick(a(g))), P(z, E);
      };
      X(S, (z) => {
        a(g).depth === 0 ? z(T) : z(C, -1);
      });
    }
    var B = m(S, 2), K = f(B), J = m(B, 2), U = f(J), Z = m(J, 2), he = m(O, 2);
    {
      var te = (z) => {
        var E = rc();
        let k;
        q(($) => k = vn(E, "", k, $), [
          () => ({
            "padding-left": `${Math.min(a(g).depth, v) * 11 + 18}px`
          })
        ]), P(z, E);
      }, H = (z) => {
        var E = ac();
        let k;
        var $ = f(E);
        q(
          (re, oe, le) => {
            k = vn(E, "", k, re), R($, `${oe ?? ""} directly here · ${le ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(a(g).depth, v) * 11 + 18}px`
            }),
            () => Ne(a(g).here.paths),
            () => Pt(a(g).here.bytes)
          ]
        ), P(z, E);
      };
      X(he, (z) => {
        a(g).expanded && a(g).failed ? z(te) : a(g).expanded && a(g).here && a(g).here.paths > 0 && z(H, 1);
      });
    }
    var N = m(he, 2);
    {
      var V = (z) => {
        var E = sc();
        let k;
        q(($) => k = vn(E, "", k, $), [
          () => ({
            "padding-left": `${Math.min(a(g).depth, v) * 11 + 18}px`
          })
        ]), P(z, E);
      };
      X(N, (z) => {
        a(g).truncated && z(V);
      });
    }
    q(
      (z, E, k) => {
        F = Se(O, 1, "row svelte-pucy57", null, F, {
          picked: s() === a(g).key,
          gone: a(g).excluded
        }), L = vn(A, "", L, z), R(K, E), R(U, k), Z.disabled = i() || a(g).excluded || a(g).depth === 0, ue(Z, "title", a(g).depth === 0 ? "The library root is not excludable from here." : a(g).excluded ? "already excluded" : `Exclude everything under ${a(g).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(a(g).depth, v) * 11}px` }),
        () => Ne(a(g).paths),
        () => Pt(a(g).bytes)
      ]
    ), ne("click", Z, () => t.onexclude(a(g))), P(u, y);
  }), P(e, w), gt();
}
Lt(["click"]);
var cc = /* @__PURE__ */ I('<button title="Back to its default">↺</button>'), uc = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), dc = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), fc = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), hc = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), vc = /* @__PURE__ */ I('<li><code class="svelte-1hh0fwb"> </code> </li>'), pc = /* @__PURE__ */ I(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), gc = /* @__PURE__ */ I('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function _c(e, t) {
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
  let c = /* @__PURE__ */ Y(Oe(Sl())), o = /* @__PURE__ */ Y(!0), d = /* @__PURE__ */ Y(!1), _ = /* @__PURE__ */ Y(Oe(Ss())), b = /* @__PURE__ */ Y(Oe(window.innerWidth));
  const p = (C) => a(_) === "light" ? C.light : C.dark, h = (C) => C in fn ? fn : rn, v = (C) => `rgba(${C.r}, ${C.g}, ${C.b}, ${C.a})`, w = /* @__PURE__ */ se(() => JSON.stringify(a(c), null, 2));
  Bn(() => {
    const C = localStorage.getItem(n);
    if (C)
      try {
        x(c, Or(JSON.parse(C)), !0);
        return;
      } catch {
      }
    oa();
  });
  function u(C) {
    x(c, Or({ ...a(c), ...C }), !0), localStorage.setItem(n, JSON.stringify(a(c))), x(d, !1);
  }
  function g(C) {
    x(c, Or(C), !0), localStorage.setItem(n, JSON.stringify(a(c))), x(d, !1);
  }
  function y(C) {
    u({ [C]: h(C)[C] });
  }
  function O() {
    x(_, Es(a(_) === "dark" ? "light" : "dark"), !0);
  }
  async function F() {
    await navigator.clipboard.writeText(a(w)), x(d, !0);
  }
  var A = gc();
  let L;
  var W = f(A), G = m(f(W), 4), j = f(G), S = m(W, 2);
  {
    var T = (C) => {
      var B = pc();
      {
        const ke = (pe, de = or, Pe = or, Ce = or) => {
          var Ie = cc();
          let Qe;
          q(() => {
            Qe = Se(Ie, 1, "undo svelte-1hh0fwb", null, Qe, { idle: !Pe() }), ue(Ie, "aria-label", `Reset ${de() ?? ""}`);
          }), ne("click", Ie, function(...ut) {
            Ce()?.apply(this, ut);
          }), P(pe, Ie);
        };
        var K = m(f(B), 2);
        We(K, 17, () => r, yt, (pe, de) => {
          var Pe = dc(), Ce = f(Pe), Ie = f(Ce), Qe = m(Ce, 2), ut = f(Qe), Et = m(Qe, 2);
          We(Et, 17, () => a(de).rows, yt, (zt, Bt) => {
            var _t = /* @__PURE__ */ se(() => Ar(a(Bt), 5));
            let et = () => a(_t)[0], Tt = () => a(_t)[1], D = () => a(_t)[2], ae = () => a(_t)[3], _e = () => a(_t)[4];
            const Me = /* @__PURE__ */ se(() => a(c)[et()] !== h(et())[et()]), ye = /* @__PURE__ */ se(() => typeof ae() == "function" ? ae()(a(b)) : ae());
            var ge = uc();
            let xe;
            var Ye = f(ge), at = f(Ye), be = m(Ye, 2), qe = m(be, 2), Mt = m(qe, 2);
            ke(Mt, Tt, () => a(Me), () => () => y(et())), q(() => {
              xe = Se(ge, 1, "row svelte-1hh0fwb", null, xe, { moved: a(Me) }), R(at, Tt()), ue(be, "min", D()), ue(be, "max", a(ye)), ue(be, "step", _e()), ue(be, "aria-label", Tt()), dn(be, a(c)[et()]), ue(qe, "min", D()), ue(qe, "max", a(ye)), ue(qe, "step", _e()), ue(qe, "aria-label", `${Tt() ?? ""} value`), dn(qe, a(c)[et()]);
            }), ne("input", be, ($e) => u({ [et()]: Number($e.currentTarget.value) })), ne("input", qe, ($e) => u({ [et()]: Number($e.currentTarget.value) })), P(zt, ge);
          }), q(() => {
            R(Ie, a(de).title), R(ut, a(de).note);
          }), P(pe, Pe);
        });
        var J = m(K, 2), U = f(J), Z = m(J, 2), he = f(Z), te = m(Z, 2);
        We(te, 17, () => kl, yt, (pe, de) => {
          const Pe = /* @__PURE__ */ se(() => p(a(de))), Ce = /* @__PURE__ */ se(() => a(c)[a(Pe)]), Ie = /* @__PURE__ */ se(() => a(de).base[a(Pe)]);
          var Qe = hc(), ut = f(Qe), Et = f(ut), zt = m(Et), Bt = f(zt), _t = m(ut, 2), et = f(_t), Tt = m(_t, 2);
          We(Tt, 17, () => i, yt, (Me, ye) => {
            var ge = /* @__PURE__ */ se(() => Ar(a(ye), 3));
            let xe = () => a(ge)[0], Ye = () => a(ge)[1], at = () => a(ge)[2];
            const be = /* @__PURE__ */ se(() => a(Ce)[xe()] !== a(Ie)[xe()]);
            var qe = fc();
            let Mt;
            var $e = f(qe), M = f($e), ee = m($e, 2), me = m(ee, 2), Ue = m(me, 2);
            ke(Ue, Ye, () => a(be), () => () => u({
              [a(Pe)]: { ...a(Ce), [xe()]: a(Ie)[xe()] }
            })), q(() => {
              Mt = Se(qe, 1, "row svelte-1hh0fwb", null, Mt, { moved: a(be) }), R(M, Ye()), ue(ee, "max", at()), ue(ee, "step", at() === 1 ? 0.01 : 1), ue(ee, "aria-label", `${a(_) ?? ""} ${s[a(de).dark].title ?? ""} ${Ye() ?? ""}`), dn(ee, a(Ce)[xe()]), ue(me, "max", at()), ue(me, "step", at() === 1 ? 0.01 : 1), ue(me, "aria-label", `${a(_) ?? ""} ${s[a(de).dark].title ?? ""} ${Ye() ?? ""} value`), dn(me, a(Ce)[xe()]);
            }), ne("input", ee, (dt) => u({
              [a(Pe)]: {
                ...a(Ce),
                [xe()]: Number(dt.currentTarget.value)
              }
            })), ne("input", me, (dt) => u({
              [a(Pe)]: {
                ...a(Ce),
                [xe()]: Number(dt.currentTarget.value)
              }
            })), P(Me, qe);
          });
          var D = m(Tt, 2);
          let ae;
          var _e = f(D);
          q(
            (Me, ye) => {
              R(Et, `${s[a(de).dark].title ?? ""} `), R(Bt, a(_)), R(et, s[a(de).dark].note), ae = vn(D, "", ae, Me), R(_e, ye);
            },
            [
              () => ({ background: v(a(Ce)) }),
              () => v(a(Ce))
            ]
          ), P(pe, Qe);
        });
        var H = m(te, 2), N = m(f(H), 4);
        let rt;
        var V = f(N), z = f(V), E = m(V, 2);
        ke(E, () => "Blur at the edge", () => a(c).blurEdge !== fn.blurEdge, () => () => y("blurEdge"));
        var k = m(H, 2), $ = m(f(k), 4);
        We($, 21, () => l, yt, (pe, de) => {
          var Pe = /* @__PURE__ */ se(() => Ar(a(de), 2));
          let Ce = () => a(Pe)[0], Ie = () => a(Pe)[1];
          var Qe = vc(), ut = f(Qe), Et = f(ut), zt = m(ut);
          q(() => {
            R(Et, Ce()), R(zt, ` — ${Ie() ?? ""}`);
          }), P(pe, Qe);
        });
        var re = m(k, 2), oe = m(f(re), 4), le = f(oe), Q = m(le, 2), ce = m(Q, 2), Ee = f(ce), He = m(oe, 2);
        q(() => {
          R(U, `The five colours below are per theme, and you are editing the ${a(_) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), R(he, `Edit the ${a(_) === "dark" ? "light" : "dark"} colours`), rt = Se(N, 1, "row toggle svelte-1hh0fwb", null, rt, { moved: a(c).blurEdge !== fn.blurEdge }), ll(z, a(c).blurEdge), R(Ee, a(d) ? "Copied" : "Copy"), dn(He, a(w));
        }), ne("click", Z, O), ne("change", z, (pe) => u({ blurEdge: pe.currentTarget.checked })), ne("click", le, () => g(rn)), ne("click", Q, () => g(fn)), ne("click", ce, F);
      }
      P(C, B);
    };
    X(S, (C) => {
      a(o) && C(T);
    });
  }
  q(() => {
    L = Se(A, 1, "tuner svelte-1hh0fwb", null, L, { folded: !a(o) }), ue(G, "title", a(o) ? "Fold away" : "Open"), R(j, a(o) ? "–" : "+");
  }), Yr("innerWidth", (C) => x(b, C, !0)), ne("click", G, () => x(o, !a(o))), P(e, A), gt();
}
Lt(["click", "input", "change"]);
var bc = /* @__PURE__ */ I('<button><span class="n svelte-1n46o8q"> </span> </button>'), mc = /* @__PURE__ */ I('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), wc = /* @__PURE__ */ I('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), yc = /* @__PURE__ */ I('<div class="muted pad svelte-1n46o8q">loading…</div>'), xc = /* @__PURE__ */ I('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), kc = /* @__PURE__ */ I('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), Sc = /* @__PURE__ */ I('<p class="blurb"> </p>'), Ec = /* @__PURE__ */ I('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), Tc = /* @__PURE__ */ I('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), Mc = /* @__PURE__ */ I('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), Ac = /* @__PURE__ */ I('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), Rc = /* @__PURE__ */ I("<div> </div>"), Pc = /* @__PURE__ */ I('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function Cc(e, t) {
  pt(t, !0);
  const n = location.pathname === "/tune";
  let r = /* @__PURE__ */ Y("grid"), s = /* @__PURE__ */ Y(0), i = /* @__PURE__ */ Y(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ Y(Oe([])), c = /* @__PURE__ */ Y(null), o = /* @__PURE__ */ Y(null), d = /* @__PURE__ */ Y(Oe(/* @__PURE__ */ new Set())), _ = /* @__PURE__ */ Y(null), b = /* @__PURE__ */ Y(null), p = /* @__PURE__ */ Y(null), h = /* @__PURE__ */ Y(null), v = /* @__PURE__ */ Y(!1), w = /* @__PURE__ */ Y(!1), u = /* @__PURE__ */ Y(!1), g = /* @__PURE__ */ Y(!1), y = /* @__PURE__ */ Y(Oe({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), O = /* @__PURE__ */ Y(null), F = /* @__PURE__ */ Y(0), A = /* @__PURE__ */ Y(null), L = /* @__PURE__ */ Y(Oe({})), W = /* @__PURE__ */ Y("newest"), G = /* @__PURE__ */ Y(Oe(Fl())), j = /* @__PURE__ */ Y(null);
  const S = /* @__PURE__ */ se(() => ka[a(s)]), T = /* @__PURE__ */ se(() => a(S).table !== !1), C = /* @__PURE__ */ se(() => a(T) || a(S).tree === !0), B = /* @__PURE__ */ se(() => a(S).sheet !== !1 && (a(o) !== null || !a(C))), K = /* @__PURE__ */ se(() => ({
    sort: a(W),
    ...a(G).on ? { stack: a(G).window } : {},
    ...Object.fromEntries(Object.entries(a(L)).filter(([, M]) => M.length > 0))
  })), J = /* @__PURE__ */ se(() => a(r) === "grid" ? `grid:${JSON.stringify(a(K))}` : `triage:${a(s)}:${JSON.stringify(a(o))}`), U = /* @__PURE__ */ se(() => a(S).rule === !1 || a(d).size === 0 ? [] : a(l).filter((M) => a(d).has(M.key)).map((M) => a(S).toRule(M, a(i))).filter((M) => M && bs(a(b)?.rules ?? [], M) !== "exclude")), Z = /* @__PURE__ */ se(() => (a(b)?.rules ?? []).filter((M) => M.decision === "exclude" && M.term?.column === "dir_under").map((M) => String(M.term.value).replace(/[\\/]+$/, "").toLowerCase())), he = dl();
  function te(M) {
    x(O, String(M), !0);
  }
  async function H(M) {
    try {
      return x(O, null), await M();
    } catch (ee) {
      return te(ee), null;
    }
  }
  const N = fl(
    () => {
      x(w, !0), H(async () => {
        const M = a(o)?.at === "end" || a(o)?.at === void 0 ? void 0 : 0, { stale: ee, value: me } = await he(() => Fe.counts(a(o), M));
        ee || x(b, me, !0);
      }).finally(() => {
        x(w, !1);
      });
    },
    220
  );
  async function V() {
    x(p, "loading");
    const M = await H(() => Fe.files());
    x(p, M, !0), x(v, !1), x(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function z(M = !1) {
    if (a(r) !== "triage" || !a(T)) {
      x(l, [], !0);
      return;
    }
    x(g, !0);
    const ee = a(S).name === "source_folder" && a(i) ? { root: a(i) } : {};
    M && (ee.live = "1");
    const me = await H(() => Fe.screen(a(S).name, ee));
    x(l, me?.rows ?? [], !0), x(g, !1);
  }
  let E = !1;
  ln(() => {
    a(s), a(r), xn(() => {
      x(c, null), x(o, null), x(i, null), oe(), a(r) === "triage" && (z(), N.now(), E || (E = !0, V()));
    });
  }), ln(() => {
    a(i), xn(() => {
      a(r) === "triage" && (oe(), z());
    });
  }), Bn(() => {
    H(async () => {
      x(A, await Fe.facets(), !0);
    });
  });
  function k(M, ee) {
    x(L, { ...a(L), [M]: ee }, !0);
  }
  function $(M) {
    if (a(S).sheet !== !1) {
      if (a(S).drill && !a(i)) {
        x(c, M.key, !0), x(
          o,
          {
            ...a(S).toRule(M, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), x(i, M.key, !0);
        return;
      }
      x(c, M.key, !0), x(
        o,
        {
          ...a(S).toRule(M, a(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), N();
    }
  }
  function re(M, ee, me) {
    const Ue = new Set(a(d)), dt = !Ue.has(M.key), At = me && a(_) !== null ? a(l).findIndex((Ve) => Ve.key === a(_)) : -1, [Ke, Ge] = At < 0 ? [ee, ee] : At < ee ? [At, ee] : [ee, At];
    for (let Ve = Ke; Ve <= Ge; Ve++)
      dt ? Ue.add(a(l)[Ve].key) : Ue.delete(a(l)[Ve].key);
    x(d, Ue, !0), x(_, M.key, !0);
  }
  function oe() {
    x(d, /* @__PURE__ */ new Set(), !0), x(_, null);
  }
  function le(M) {
    x(o, M, !0), x(
      c,
      null
      // it no longer corresponds to a row
    ), N();
  }
  function Q(M = !1) {
    x(o, null), x(c, null), M && x(i, null), N.now();
  }
  async function ce() {
    x(
      v,
      !0
      // the distinct-content number now says so on its face
    ), Pi(F), await z(), N.now();
  }
  async function Ee() {
    if (!a(o)) return;
    x(u, !0);
    const M = a(o).at === "end" ? void 0 : 0, ee = await H(() => Fe.addRule(
      {
        column: a(o).column,
        op: a(o).op,
        value: a(o).value,
        decision: a(o).decision ?? "exclude",
        note: `screen ${a(S).id} ${a(S).title}`
      },
      M
    ));
    x(u, !1), ee && (x(o, null), x(c, null), await ce());
  }
  async function He() {
    const M = a(U);
    if (!M.length) {
      oe();
      return;
    }
    x(u, !0);
    for (const ee of M)
      if (!await H(() => Fe.addRule({
        column: ee.column,
        op: ee.op,
        value: ee.value,
        decision: "exclude",
        note: `screen ${a(S).id} ${a(S).title}`
      }))) break;
    x(u, !1), oe(), x(o, null), x(c, null), await ce();
  }
  async function ke(M) {
    if (!M || la(a(Z), M)) return;
    x(u, !0);
    const ee = await H(() => Fe.addRule({
      column: "dir_under",
      op: "=",
      value: M,
      decision: "exclude",
      note: `screen ${a(S).id} ${a(S).title}`
    }));
    x(u, !1), ee && await ce();
  }
  const rt = (M) => ke(_s(M.p ?? "")), pe = (M) => ke(M.key);
  async function de(M) {
    x(u, !0), await H(() => Fe.deleteRule(M.id)), x(u, !1), await ce();
  }
  async function Pe(M, ee) {
    x(u, !0), await H(() => Fe.moveRule(M.id, ee)), x(u, !1), await ce();
  }
  async function Ce() {
    await H(async () => {
      x(A, await Fe.facets(), !0);
    });
  }
  async function Ie(M, ee) {
    const me = await H(() => Fe.override(M.s, ee));
    return me ? (x(v, !0), N(), me.decision) : M.o ?? null;
  }
  function Qe(M) {
    return a(r) === "grid" ? Fe.photos({ limit: 500, ...a(K), ...M || {} }) : Fe.page(a(o), M);
  }
  function ut(M, ee) {
    if (a(r) === "grid") {
      const me = M.m ?? [{ id: M.id, s: M.s, w: M.w, h: M.h }];
      x(j, { frames: me, origin: Ho(ee) }, !0);
      return;
    }
    H(() => Fe.revealOrigin(M.id));
  }
  function Et(M) {
    x(j, null), H(() => Fe.revealPhoto(M.id));
  }
  var zt = Pc(), Bt = ot(zt);
  {
    var _t = (M) => {
      Zl(M, {
        get facets() {
          return a(A);
        },
        get selected() {
          return a(L);
        },
        get sort() {
          return a(W);
        },
        get stacking() {
          return a(G);
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
        onsort: (ee) => x(W, ee, !0),
        onstack: (ee) => x(G, Ll(ee), !0),
        onclear: () => x(L, {}, !0),
        ontriage: () => x(r, "triage")
      });
    };
    X(Bt, (M) => {
      a(r) === "grid" && M(_t);
    });
  }
  var et = m(Bt, 2);
  {
    var Tt = (M) => {
      _c(M, {});
    };
    X(et, (M) => {
      n && M(Tt);
    });
  }
  var D = m(et, 2);
  let ae;
  var _e = f(D);
  {
    var Me = (M) => {
      var ee = kc(), me = f(ee), Ue = f(me), dt = m(me, 2);
      We(dt, 21, () => ka, yt, (Xe, ft, st) => {
        var Rt = bc();
        let Xt;
        var Jt = f(Rt), Te = f(Jt), it = m(Jt, 1, !0);
        q(() => {
          Xt = Se(Rt, 1, "nav svelte-1n46o8q", null, Xt, { on: st === a(s) }), R(Te, a(ft).id), R(it, a(ft).title);
        }), ne("click", Rt, () => x(s, st, !0)), P(Xe, Rt);
      });
      var At = m(dt, 2);
      {
        var Ke = (Xe) => {
          var ft = xc(), st = ot(ft), Rt = f(st);
          {
            var Xt = (Je) => {
              var tt = mc(), kn = ot(tt), $n = /* @__PURE__ */ se(() => Q.bind(null, !0)), Er = m(kn, 2), Tr = f(Er);
              q(() => R(Tr, `inside ${a(i) ?? ""}`)), ne("click", kn, function(...Mr) {
                a($n)?.apply(this, Mr);
              }), P(Je, tt);
            }, Jt = (Je) => {
              var tt = wc(), kn = f(tt);
              q(() => R(kn, a(S).relive)), ne("click", tt, () => z(!0)), P(Je, tt);
            };
            X(Rt, (Je) => {
              a(S).drill && a(i) ? Je(Xt) : a(S).relive && Je(Jt, 1);
            });
          }
          var Te = m(st, 2);
          {
            var it = (Je) => {
              var tt = yc();
              P(Je, tt);
            };
            X(Te, (Je) => {
              a(g) && Je(it);
            });
          }
          var Zt = m(Te, 2);
          {
            let Je = /* @__PURE__ */ se(() => a(b)?.rules ?? []);
            Zo(Zt, {
              get rows() {
                return a(l);
              },
              get screen() {
                return a(S);
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
                return a(c);
              },
              onpick: $,
              oncheck: re
            });
          }
          P(Xe, ft);
        };
        X(At, (Xe) => {
          a(T) && Xe(Ke);
        });
      }
      var Ge = m(At, 2);
      {
        var Ve = (Xe) => {
          oc(Xe, {
            get root() {
              return Dn;
            },
            get version() {
              return a(F);
            },
            get excludedDirs() {
              return a(Z);
            },
            get selected() {
              return a(c);
            },
            get busy() {
              return a(u);
            },
            onload: (ft) => H(() => Fe.tree(ft)),
            onpick: $,
            onexclude: pe
          });
        };
        X(Ge, (Xe) => {
          a(S).tree && Xe(Ve);
        });
      }
      var on = m(Ge, 2);
      {
        let Xe = /* @__PURE__ */ se(() => a(b)?.rules ?? []), ft = /* @__PURE__ */ se(() => a(b)?.unmatched ?? null);
        Lo(on, {
          get rules() {
            return a(Xe);
          },
          get unmatched() {
            return a(ft);
          },
          get busy() {
            return a(u);
          },
          ondelete: de,
          onmove: Pe
        });
      }
      var cn = m(on, 2);
      Eo(cn, { oncomplete: Ce }), ne("click", Ue, () => x(r, "grid")), P(M, ee);
    };
    X(_e, (M) => {
      a(r) === "triage" && M(Me);
    });
  }
  var ye = m(_e, 2), ge = f(ye);
  {
    var xe = (M) => {
      var ee = Ac(), me = ot(ee), Ue = f(me), dt = m(me, 2), At = f(dt), Ke = m(dt, 2);
      {
        var Ge = (Te) => {
          var it = Sc(), Zt = f(it);
          q(() => R(Zt, a(S).note)), P(Te, it);
        };
        X(Ke, (Te) => {
          a(S).note && Te(Ge);
        });
      }
      var Ve = m(Ke, 2);
      {
        var on = (Te) => {
          po(Te, {
            get screen() {
              return a(S);
            }
          });
        };
        X(Ve, (Te) => {
          a(S).name === "dimensions" && Te(on);
        });
      }
      var cn = m(Ve, 2);
      xl(cn, {
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
        onfiles: V
      });
      var Xe = m(cn, 2);
      {
        var ft = (Te) => {
          var it = Ec(), Zt = f(it), Je = f(Zt), tt = m(Zt, 2), kn = f(tt), $n = m(tt, 2), Er = m($n, 2), Tr = f(Er);
          {
            var Mr = (Qt) => {
              var Sn = Rn("already excluded — nothing left to write");
              P(Qt, Sn);
            }, Ms = (Qt) => {
              var Sn = Rn();
              q((As) => R(Sn, `one exclude rule each, at the end of the order${As ?? ""}`), [
                () => a(U).length < a(d).size ? ` · ${Ne(a(d).size - a(U).length)} already excluded, skipped` : ""
              ]), P(Qt, Sn);
            };
            X(Tr, (Qt) => {
              a(U).length ? Qt(Ms, -1) : Qt(Mr);
            });
          }
          q(
            (Qt, Sn) => {
              R(Je, `${Qt ?? ""} ticked`), tt.disabled = a(u) || !a(U).length, R(kn, Sn), $n.disabled = a(u);
            },
            [
              () => Ne(a(d).size),
              () => a(u) ? "saving…" : `Exclude ${Ne(a(U).length)}`
            ]
          ), ne("click", tt, He), ne("click", $n, oe), P(Te, it);
        };
        X(Xe, (Te) => {
          a(d).size && Te(ft);
        });
      }
      var st = m(Xe, 2);
      Co(st, {
        get candidate() {
          return a(o);
        },
        get screen() {
          return a(S);
        },
        get saving() {
          return a(u);
        },
        onedit: le,
        onconfirm: Ee,
        onclear: Q
      });
      var Rt = m(st, 2);
      {
        var Xt = (Te) => {
          var it = Tc(), Zt = f(it);
          q((Je, tt) => R(Zt, `${Je ?? ""}${tt ?? ""} loaded${a(y).exhausted ? " · all of them" : ""}${a(y).loading ? " · loading…" : ""} `), [
            () => Ne(a(y).count),
            () => a(y).total ? " of " + Ne(a(y).total) : ""
          ]), P(Te, it);
        }, Jt = (Te) => {
          var it = Mc();
          P(Te, it);
        };
        X(Rt, (Te) => {
          a(B) ? Te(Xt) : a(S).sheet === !1 && Te(Jt, 1);
        });
      }
      q(() => {
        R(Ue, `${a(S).id ?? ""} · ${a(S).title ?? ""}`), R(At, a(S).blurb);
      }), P(M, ee);
    };
    X(ge, (M) => {
      a(r) === "triage" && M(xe);
    });
  }
  var Ye = m(ge, 2);
  {
    var at = (M) => {
      {
        let ee = /* @__PURE__ */ se(() => a(r) === "grid" ? null : a(b)?.page_paths ?? null), me = /* @__PURE__ */ se(() => a(r) === "triage");
        Uo(M, {
          get key() {
            return a(J);
          },
          fetchPage: Qe,
          get total() {
            return a(ee);
          },
          get triage() {
            return a(me);
          },
          get excludedDirs() {
            return a(Z);
          },
          onActivate: ut,
          onOverride: Ie,
          onExcludeFolder: rt,
          onState: (Ue) => x(y, { ...a(y), ...Ue }, !0)
        });
      }
    };
    X(Ye, (M) => {
      (a(B) || a(r) === "grid") && M(at);
    });
  }
  var be = m(D, 2);
  {
    var qe = (M) => {
      oo(M, {
        get frames() {
          return a(j).frames;
        },
        get origin() {
          return a(j).origin;
        },
        onreveal: Et,
        onclose: () => x(j, null)
      });
    };
    X(be, (M) => {
      a(j) && M(qe);
    });
  }
  var Mt = m(be, 2);
  {
    var $e = (M) => {
      var ee = Rc();
      let me;
      var Ue = f(ee);
      q(() => {
        me = Se(ee, 1, "status", null, me, { bare: a(r) === "grid" }), R(Ue, a(O));
      }), P(M, ee);
    };
    X(Mt, (M) => {
      a(O) && M($e);
    });
  }
  q(() => ae = Se(D, 1, "shell", null, ae, { bare: a(r) === "grid" })), P(e, zt), gt();
}
Lt(["click"]);
zl();
oa();
Vi(Cc, { target: document.getElementById("app") });
