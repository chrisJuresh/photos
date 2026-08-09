var sa = Array.isArray, js = Array.prototype.indexOf, wr = Array.prototype.includes, Pr = Array.from, Hs = Object.defineProperty, zn = Object.getOwnPropertyDescriptor, qs = Object.getOwnPropertyDescriptors, Bs = Object.prototype, $s = Array.prototype, $a = Object.getPrototypeOf, wa = Object.isExtensible;
const _r = () => {
};
function Us(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Ua() {
  var e, t, n = new Promise((a, s) => {
    e = a, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
function zr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const a of e)
    if (n.push(a), n.length === t) break;
  return n;
}
const Ue = 2, Dn = 4, Cr = 8, Wa = 1 << 24, Ot = 16, kt = 32, Yt = 64, Yr = 128, xt = 512, qe = 1024, Be = 2048, Ft = 4096, Qe = 8192, ct = 16384, Un = 32768, Vr = 1 << 25, jn = 65536, yr = 1 << 17, Ws = 1 << 18, Wn = 1 << 19, Gs = 1 << 20, Dt = 1 << 25, Sn = 65536, xr = 1 << 21, Ln = 1 << 22, ln = 1 << 23, wn = Symbol("$state"), Ys = Symbol("legacy props"), Vs = Symbol(""), Ga = Symbol("attributes"), Xr = Symbol("class"), Kr = Symbol("style"), Jr = Symbol("text"), or = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Xs = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Ks(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Js() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Zs(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Qs(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ei() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ti(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function ni() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ri(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function ai() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function si() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function ii() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function li() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const oi = 1, ui = 2, Ya = 4, ci = 8, di = 16, fi = 1, hi = 4, vi = 8, pi = 16, gi = 1, _i = 2, He = Symbol("uninitialized"), bi = "http://www.w3.org/1999/xhtml";
function mi() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function wi() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function yi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Va(e) {
  return e === this.v;
}
function xi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Xa(e) {
  return !xi(e, this.v);
}
let Ke = null;
function Hn(e) {
  Ke = e;
}
function dt(e, t = !1, n) {
  Ke = {
    p: Ke,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      ve
    ),
    l: null
  };
}
function ft(e) {
  var t = (
    /** @type {ComponentContext} */
    Ke
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var a of n)
      vs(a);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Ke = t.p, e ?? /** @type {T} */
  {};
}
function Ka() {
  return !0;
}
let _n = [];
function Ja() {
  var e = _n;
  _n = [], Us(e);
}
function Ut(e) {
  if (_n.length === 0 && !rr) {
    var t = _n;
    queueMicrotask(() => {
      t === _n && Ja();
    });
  }
  _n.push(e);
}
function ki() {
  for (; _n.length > 0; )
    Ja();
}
function Za(e) {
  var t = ve;
  if (t === null)
    return pe.f |= ln, e;
  if ((t.f & Un) === 0 && (t.f & Dn) === 0)
    throw e;
  an(e, t);
}
function an(e, t) {
  if (!(t !== null && (t.f & ct) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & Yr) !== 0) {
        if ((t.f & Un) === 0)
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
const Si = -7169;
function Oe(e, t) {
  e.f = e.f & Si | t;
}
function ia(e) {
  (e.f & xt) !== 0 || e.deps === null ? Oe(e, qe) : Oe(e, Ft);
}
function Qa(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Ue) === 0 || (t.f & Sn) === 0 || (t.f ^= Sn, Qa(
        /** @type {Derived} */
        t.deps
      ));
}
function es(e, t, n) {
  (e.f & Be) !== 0 ? t.add(e) : (e.f & Ft) !== 0 && n.add(e), Qa(e.deps), Oe(e, qe);
}
let vr = !1;
function Ei(e) {
  var t = vr;
  try {
    return vr = !1, [e(), vr];
  } finally {
    vr = t;
  }
}
function Ti(e, t, n, a = !0) {
  a && n();
  for (var s of t)
    e.addEventListener(s, n);
  Or(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function Gn(e) {
  var t = pe, n = ve;
  St(null), Ht(null);
  try {
    return e();
  } finally {
    St(t), Ht(n);
  }
}
function Mi(e) {
  let t = 0, n = En(0), a;
  return () => {
    ca() && (r(n), ps(() => (t === 0 && (a = dn(() => e(() => ar(n)))), t += 1, () => {
      Ut(() => {
        t -= 1, t === 0 && (a?.(), a = void 0, ar(n));
      });
    })));
  };
}
var Ai = jn | Wn;
function Ri(e, t, n, a) {
  new Pi(e, t, n, a);
}
class Pi {
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
  #a;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #o = null;
  /** @type {DocumentFragment | null} */
  #s = null;
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
  #b = Mi(() => (this.#d = En(this.#p), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, a, s) {
    this.#e = t, this.#t = n, this.#l = (i) => {
      var l = (
        /** @type {Effect} */
        ve
      );
      l.b = this, l.f |= Yr, a(i);
    }, this.parent = /** @type {Effect} */
    ve.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#a = fa(() => {
      this.#h();
    }, Ai);
  }
  #_() {
    try {
      this.#i = wt(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#t.failed, { reset: a, invoke_onerror: s } = this.#m(t);
    Ut(s), n && (this.#o = wt(() => {
      n(
        this.#e,
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
        yi();
        return;
      }
      n = !0, a && li(), this.#o !== null && xn(this.#o, () => {
        this.#o = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: s, invoke_onerror: () => {
      try {
        a = !0, this.#t.onerror?.(t, s), a = !1;
      } catch (l) {
        an(l, this.#a && this.#a.parent);
      }
    } };
  }
  #x() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#n = wt(() => t(this.#e)), Ut(() => {
      var n = this.#s = document.createDocumentFragment(), a = Gt();
      n.append(a), this.#i = this.#v(() => wt(() => this.#l(a))), this.#u === 0 && (this.#e.before(n), this.#s = null, xn(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        ge
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#p = 0, this.#i = wt(() => {
        this.#l(this.#e);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        va(this.#i, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#n = wt(() => n(this.#e));
      } else
        this.#w(
          /** @type {Batch} */
          ge
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
    es(t, this.#f, this.#g);
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
    var n = ve, a = pe, s = Ke;
    Ht(this.#a), St(this.#a), Hn(this.#a.ctx);
    try {
      return un.ensure(), t();
    } catch (i) {
      return Za(i), null;
    } finally {
      Ht(n), St(a), Hn(s);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && xn(this.#n, () => {
      this.#n = null;
    }), this.#s && (this.#e.before(this.#s), this.#s = null));
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
      this.#c = !1, this.#d && qn(this.#d, this.#p);
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
    ge?.is_fork ? (this.#i && ge.skip_effect(this.#i), this.#n && ge.skip_effect(this.#n), this.#o && ge.skip_effect(this.#o), ge.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#i && (it(this.#i), this.#i = null), this.#n && (it(this.#n), this.#n = null), this.#o && (it(this.#o), this.#o = null);
    let n = this.#t.failed;
    const a = (s) => {
      const { reset: i, invoke_onerror: l } = this.#m(s);
      l(), n && (this.#o = this.#v(() => {
        try {
          return wt(() => {
            var u = (
              /** @type {Effect} */
              ve
            );
            u.b = this, u.f |= Yr, n(
              this.#e,
              () => s,
              () => i
            );
          });
        } catch (u) {
          return an(
            u,
            /** @type {Effect} */
            this.#a.parent
          ), null;
        }
      }));
    };
    Ut(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (i) {
        an(i, this.#a && this.#a.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        a,
        /** @param {unknown} e */
        (i) => an(i, this.#a && this.#a.parent)
      ) : a(s);
    });
  }
}
function Ci(e, t, n, a) {
  const s = sr;
  var i = e.filter((h) => !h.settled), l = t.map(s);
  if (n.length === 0 && i.length === 0) {
    a(l);
    return;
  }
  var u = (
    /** @type {Effect} */
    ve
  ), o = Oi(), d = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function g(h) {
    if ((u.f & ct) === 0) {
      o();
      try {
        a([...l, ...h]);
      } catch (v) {
        an(v, u);
      }
      kr();
    }
  }
  var m = ts();
  if (n.length === 0) {
    d.then(() => g([])).finally(m);
    return;
  }
  function p() {
    Promise.all(n.map((h) => /* @__PURE__ */ Ni(h))).then(g).catch((h) => an(h, u)).finally(m);
  }
  d ? d.then(() => {
    o(), p(), kr();
  }) : p();
}
function Oi() {
  var e = (
    /** @type {Effect} */
    ve
  ), t = pe, n = Ke, a = (
    /** @type {Batch} */
    ge
  );
  return function(i = !0) {
    Ht(e), St(t), Hn(n), i && (e.f & ct) === 0 && (a?.activate(), a?.apply());
  };
}
function kr(e = !0) {
  Ht(null), St(null), Hn(null), e && ge?.deactivate();
}
function ts() {
  var e = (
    /** @type {Effect} */
    ve
  ), t = e.b, n = (
    /** @type {Batch} */
    ge
  ), a = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(a, e), () => {
    t?.update_pending_count(-1, n), n.decrement(a, e);
  };
}
// @__NO_SIDE_EFFECTS__
function sr(e) {
  var t = Ue | Be;
  return ve !== null && (ve.f |= Wn), {
    ctx: Ke,
    deps: null,
    effects: null,
    equals: Va,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      He
    ),
    wv: 0,
    parent: ve,
    ac: null
  };
}
const Zn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function Ni(e, t, n) {
  let a = (
    /** @type {Effect | null} */
    ve
  );
  a === null && Js();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = En(
    /** @type {V} */
    He
  ), l = !pe, u = /* @__PURE__ */ new Set();
  return Xi(() => {
    var o = (
      /** @type {Effect} */
      ve
    ), d = Ua();
    s = d.promise;
    try {
      Promise.resolve(e()).then(d.resolve, (h) => {
        h !== or && d.reject(h);
      }).finally(kr);
    } catch (h) {
      d.reject(h), kr();
    }
    var g = (
      /** @type {Batch} */
      ge
    );
    if (l) {
      if ((o.f & Un) !== 0)
        var m = ts();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        a.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(Zn);
      else
        for (const h of u.values())
          h.reject(Zn);
      u.add(d), g.async_deriveds.set(o, d);
    }
    const p = (h, v = void 0) => {
      m?.(), u.delete(d), v !== Zn && (g.activate(), v ? (i.f |= ln, qn(i, v)) : ((i.f & ln) !== 0 && (i.f ^= ln), qn(i, h)), g.deactivate());
    };
    d.promise.then(p, (h) => p(null, h || "unknown"));
  }), Or(() => {
    for (const o of u)
      o.reject(Zn);
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
  const t = /* @__PURE__ */ sr(e);
  return ws(t), t;
}
// @__NO_SIDE_EFFECTS__
function ns(e) {
  const t = /* @__PURE__ */ sr(e);
  return t.equals = Xa, t;
}
function Ii(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      it(
        /** @type {Effect} */
        t[n]
      );
  }
}
function la(e) {
  var t, n = ve, a = e.parent;
  if (!Vt && a !== null && e.v !== He && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (a.f & (ct | Qe)) !== 0)
    return mi(), e.v;
  Ht(a);
  try {
    e.f &= ~Sn, Ii(e), t = Ss(e);
  } finally {
    Ht(n);
  }
  return t;
}
function rs(e) {
  var t = la(e);
  if (!e.equals(t) && (e.wv = xs(), (!ge?.is_fork || e.deps === null) && (ge !== null ? (ge.capture(e, t, !0), Zr?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Oe(e, qe);
    return;
  }
  Vt || (Nt !== null ? (ca() || ge?.is_fork) && Nt.set(e, t) : ia(e));
}
function Fi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Gn(() => {
        t.ac.abort(or), t.ac = null;
      }), t.fn !== null && (t.teardown = _r), ir(t, 0), ha(t));
}
function as(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Bn(t);
}
let Lr = null, On = null, ge = null, Zr = null, Nt = null, Qr = null, rr = !1, Dr = !1, In = null, br = null;
var ya = 0;
let zi = 1;
class un {
  id = zi++;
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
  #a = /* @__PURE__ */ new Set();
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
  #s = [];
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
    On === null ? Lr = On = this : (On.#t = this, this.#r = On), On = this;
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
        Oe(s, Be), n(s);
      for (s of a.m)
        Oe(s, Ft), n(s);
    }
    this.#g.add(t);
  }
  #_() {
    this.#e = !0, ya++ > 1e3 && (this.#v(), Di());
    for (const o of this.#u)
      this.#c.delete(o), Oe(o, Be), this.schedule(o);
    for (const o of this.#c)
      Oe(o, Ft), this.schedule(o);
    const t = this.#s;
    this.#s = [], this.apply();
    var n = In = [], a = [], s = br = [];
    for (const o of t)
      try {
        this.#y(o, n, a);
      } catch (d) {
        throw ls(o), this.#b() || this.discard(), d;
      }
    if (ge = null, s.length > 0) {
      var i = un.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (In = null, br = null, this.#b()) {
      this.#h(a), this.#h(n);
      for (const [o, d] of this.#f)
        is(o, d);
      s.length > 0 && /** @type {unknown} */
      ge.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(a), this.#h(n), l.#x(this);
      return;
    }
    this.#u.clear(), this.#c.clear();
    for (const o of this.#l) o(this);
    this.#l.clear(), Zr = this, xa(a), xa(n), Zr = null, this.#o?.resolve();
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      ge
    );
    if (this.#i === 0 && (this.#s.length === 0 || u !== null) && this.#v(), this.#s.length > 0)
      if (u !== null) {
        const o = u;
        o.#s.push(...this.#s.filter((d) => !o.#s.includes(d)));
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
    t.f ^= qe;
    for (var s = t.first; s !== null; ) {
      var i = s.f, l = (i & (kt | Yt)) !== 0, u = l && (i & qe) !== 0, o = u || (i & Qe) !== 0 || this.#f.has(s);
      if (!o && s.fn !== null) {
        l ? s.f ^= qe : (i & Dn) !== 0 ? n.push(s) : cr(s) && ((i & Ot) !== 0 && this.#c.add(s), Bn(s));
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
    for (var t = this.#r; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, a]] of this.current)
          if (t.current.has(n) && !a)
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
    for (const [a, s] of t.current)
      !this.previous.has(a) && t.previous.has(a) && this.previous.set(a, t.previous.get(a)), this.current.set(a, s);
    for (const [a, s] of t.async_deriveds) {
      const i = this.async_deriveds.get(a);
      i && s.promise.then(i.resolve).catch(i.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#u, t.#c);
    const n = (a) => {
      var s = a.reactions;
      if (s !== null && !((a.f & Ue) !== 0 && (a.f & (Be | Ft)) === 0))
        for (const u of s) {
          var i = u.f;
          if ((i & Ue) !== 0)
            n(
              /** @type {Derived} */
              u
            );
          else {
            var l = (
              /** @type {Effect} */
              u
            );
            i & (Ln | Ot) && !this.async_deriveds.has(l) && (this.#c.delete(l), Oe(l, Be), this.schedule(l));
          }
        }
    };
    for (const a of this.current.keys())
      n(a);
    this.oncommit(() => t.discard()), t.#v(), ge = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      es(t[n], this.#u, this.#c);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, a = !1) {
    t.v !== He && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & ln) === 0 && (this.current.set(t, [n, a]), Nt?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    ge = this;
  }
  deactivate() {
    ge = null, Nt = null;
  }
  flush() {
    try {
      Dr = !0, ge = this, this.#_();
    } finally {
      ya = 0, Qr = null, In = null, br = null, Dr = !1, ge = null, Nt = null, yn.clear();
    }
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Zn);
    this.#v(), this.#o?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let m = Lr; m !== null; m = m.#t) {
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
      if (!(!m.#e || s.length === 0)) {
        var i = s.filter((p) => !this.current.has(p));
        if (i.length === 0)
          t && m.discard();
        else if (n.length > 0) {
          if (t)
            for (const p of this.#g)
              m.unskip_effect(p, (h) => {
                (h.f & (Ot | Ln)) !== 0 ? m.schedule(h) : m.#h([h]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (var o of n)
            ss(o, i, l, u);
          u = /* @__PURE__ */ new Map();
          var d = [...m.current].filter(([p, h]) => {
            const v = this.current.get(p);
            return v ? v[0] !== h[0] || v[1] !== h[1] : !0;
          }).map(([p]) => p);
          if (d.length > 0)
            for (const p of this.#p)
              (p.f & (ct | Qe | yr)) === 0 && oa(p, d, u) && ((p.f & (Ln | Ot)) !== 0 ? (Oe(p, Be), m.schedule(p)) : m.#u.add(p));
          if (m.#s.length > 0 && !m.#d) {
            m.apply();
            for (var g of m.#s)
              m.#y(g, [], []);
            m.#s = [];
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
      let a = this.#n.get(n) ?? 0;
      this.#n.set(n, a + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  decrement(t, n) {
    if (this.#i -= 1, t) {
      let a = this.#n.get(n) ?? 0;
      a === 1 ? this.#n.delete(n) : this.#n.set(n, a - 1);
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
    for (const a of t)
      this.#u.add(a);
    for (const a of n)
      this.#c.add(a);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#l.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#a.add(t);
  }
  settled() {
    return (this.#o ??= Ua()).promise;
  }
  static ensure() {
    if (ge === null) {
      const t = ge = new un();
      !Dr && !rr && Ut(() => {
        t.#e || t.flush();
      });
    }
    return ge;
  }
  apply() {
    {
      Nt = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Qr = t, t.b?.is_pending && (t.f & (Dn | Cr | Wa)) !== 0 && (t.f & Un) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var a = n.f;
      if (In !== null && n === ve && (pe === null || (pe.f & Ue) === 0))
        return;
      if ((a & (Yt | kt)) !== 0) {
        if ((a & qe) === 0)
          return;
        n.f ^= qe;
      }
    }
    this.#s.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#r, n = this.#t;
      t === null ? Lr = n : t.#t = n, n === null ? On = t : n.#r = t, this.linked = !1;
    }
  }
}
function Li(e) {
  var t = rr;
  rr = !0;
  try {
    for (var n; ; ) {
      if (ki(), ge === null)
        return (
          /** @type {T} */
          n
        );
      ge.flush();
    }
  } finally {
    rr = t;
  }
}
function Di() {
  try {
    ni();
  } catch (e) {
    an(e, Qr);
  }
}
let $t = null;
function xa(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var a = e[n++];
      if ((a.f & (ct | Qe)) === 0 && cr(a) && ($t = /* @__PURE__ */ new Set(), Bn(a), a.deps === null && a.first === null && a.nodes === null && a.teardown === null && a.ac === null && _s(a), $t?.size > 0)) {
        yn.clear();
        for (const s of $t) {
          if ((s.f & (ct | Qe)) !== 0) continue;
          const i = [s];
          let l = s.parent;
          for (; l !== null; )
            $t.has(l) && ($t.delete(l), i.push(l)), l = l.parent;
          for (let u = i.length - 1; u >= 0; u--) {
            const o = i[u];
            (o.f & (ct | Qe)) === 0 && Bn(o);
          }
        }
        $t.clear();
      }
    }
    $t = null;
  }
}
function ss(e, t, n, a) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & Ue) !== 0 ? ss(
        /** @type {Derived} */
        s,
        t,
        n,
        a
      ) : (i & (Ln | Ot)) !== 0 && (i & Be) === 0 && oa(s, t, a) && (Oe(s, Be), ua(
        /** @type {Effect} */
        s
      ));
    }
}
function oa(e, t, n) {
  const a = n.get(e);
  if (a !== void 0) return a;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (wr.call(t, s))
        return !0;
      if ((s.f & Ue) !== 0 && oa(
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
function ua(e) {
  ge.schedule(e);
}
function is(e, t) {
  if (!((e.f & kt) !== 0 && (e.f & qe) !== 0)) {
    (e.f & Be) !== 0 ? t.d.push(e) : (e.f & Ft) !== 0 && t.m.push(e), Oe(e, qe);
    for (var n = e.first; n !== null; )
      is(n, t), n = n.next;
  }
}
function ls(e) {
  Oe(e, qe);
  for (var t = e.first; t !== null; )
    ls(t), t = t.next;
}
let Sr = /* @__PURE__ */ new Set();
const yn = /* @__PURE__ */ new Map();
let os = !1;
function En(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Va,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function G(e, t) {
  const n = En(e);
  return ws(n), n;
}
// @__NO_SIDE_EFFECTS__
function ji(e, t = !1, n = !0) {
  const a = En(e);
  return t || (a.equals = Xa), a;
}
function x(e, t, n = !1) {
  pe !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!It || (pe.f & yr) !== 0) && Ka() && (pe.f & (Ue | Ot | Ln | yr)) !== 0 && (jt === null || !jt.has(e)) && ii();
  let a = n ? Ne(t) : t;
  return qn(e, a, br);
}
function qn(e, t, n = null) {
  if (!e.equals(t)) {
    yn.set(e, Vt ? t : e.v);
    var a = un.ensure();
    if (a.capture(e, t), (e.f & Ue) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Be) !== 0 && la(s), Nt === null && ia(s);
    }
    e.wv = xs(), us(e, Be, n), ve !== null && (ve.f & qe) !== 0 && (ve.f & (kt | Yt)) === 0 && (mt === null ? Zi([e]) : mt.push(e)), !a.is_fork && Sr.size > 0 && !os && Hi();
  }
  return t;
}
function Hi() {
  os = !1;
  for (const e of Sr) {
    (e.f & qe) !== 0 && Oe(e, Ft);
    let t;
    try {
      t = cr(e);
    } catch {
      t = !0;
    }
    t && Bn(e);
  }
  Sr.clear();
}
function qi(e, t = 1) {
  var n = r(e), a = t === 1 ? n++ : n--;
  return x(e, n), a;
}
function ar(e) {
  x(e, e.v + 1);
}
function us(e, t, n) {
  var a = e.reactions;
  if (a !== null)
    for (var s = a.length, i = 0; i < s; i++) {
      var l = a[i], u = l.f, o = (u & Be) === 0;
      if (o && Oe(l, t), (u & yr) !== 0)
        Sr.add(
          /** @type {Effect} */
          l
        );
      else if ((u & Ue) !== 0) {
        var d = (
          /** @type {Derived} */
          l
        );
        Nt?.delete(d), (u & Sn) === 0 && (u & xt && (ve === null || (ve.f & xr) === 0) && (l.f |= Sn), us(d, Ft, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (u & Ot) !== 0 && $t !== null && $t.add(g), n !== null ? n.push(g) : ua(g);
      }
    }
}
function Ne(e) {
  if (typeof e != "object" || e === null || wn in e)
    return e;
  const t = $a(e);
  if (t !== Bs && t !== $s)
    return e;
  var n = /* @__PURE__ */ new Map(), a = sa(e), s = /* @__PURE__ */ G(0), i = kn, l = (u) => {
    if (kn === i)
      return u();
    var o = pe, d = kn;
    St(null), Ea(i);
    var g = u();
    return St(o), Ea(d), g;
  };
  return a && n.set("length", /* @__PURE__ */ G(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && ai();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var m = /* @__PURE__ */ G(d.value);
          return n.set(o, m), m;
        }) : x(g, d.value, !0), !0;
      },
      deleteProperty(u, o) {
        var d = n.get(o);
        if (d === void 0) {
          if (o in u) {
            const g = l(() => /* @__PURE__ */ G(He));
            n.set(o, g), ar(s);
          }
        } else
          x(d, He), ar(s);
        return !0;
      },
      get(u, o, d) {
        if (o === wn)
          return e;
        var g = n.get(o), m = o in u;
        if (g === void 0 && (!m || zn(u, o)?.writable) && (g = l(() => {
          var h = Ne(m ? u[o] : He), v = /* @__PURE__ */ G(h);
          return v;
        }), n.set(o, g)), g !== void 0) {
          var p = r(g);
          return p === He ? void 0 : p;
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
        if (o === wn)
          return !0;
        var d = n.get(o), g = d !== void 0 && d.v !== He || Reflect.has(u, o);
        if (d !== void 0 || ve !== null && (!g || zn(u, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var p = g ? Ne(u[o]) : He, h = /* @__PURE__ */ G(p);
            return h;
          }), n.set(o, d));
          var m = r(d);
          if (m === He)
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
            v !== void 0 ? x(v, He) : h in u && (v = l(() => /* @__PURE__ */ G(He)), n.set(h + "", v));
          }
        if (m === void 0)
          (!p || zn(u, o)?.writable) && (m = l(() => /* @__PURE__ */ G(void 0)), x(m, Ne(d)), n.set(o, m));
        else {
          p = m.v !== He;
          var w = l(() => Ne(d));
          x(m, w);
        }
        var c = Reflect.getOwnPropertyDescriptor(u, o);
        if (c?.set && c.set.call(g, d), !p) {
          if (a && typeof o == "string") {
            var _ = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= _.v && x(_, y + 1);
          }
          ar(s);
        }
        return !0;
      },
      ownKeys(u) {
        r(s);
        var o = Reflect.ownKeys(u).filter((m) => {
          var p = n.get(m);
          return p === void 0 || p.v !== He;
        });
        for (var [d, g] of n)
          g.v !== He && !(d in u) && o.push(d);
        return o;
      },
      setPrototypeOf() {
        si();
      }
    }
  );
}
function ka(e) {
  try {
    if (e !== null && typeof e == "object" && wn in e)
      return e[wn];
  } catch {
  }
  return e;
}
function Bi(e, t) {
  return Object.is(ka(e), ka(t));
}
var on, cs, ds, fs;
function $i() {
  if (on === void 0) {
    on = window, cs = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    ds = zn(t, "firstChild").get, fs = zn(t, "nextSibling").get, wa(e) && (e[Xr] = void 0, e[Ga] = null, e[Kr] = void 0, e.__e = void 0), wa(n) && (n[Jr] = void 0);
  }
}
function Gt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Er(e) {
  return (
    /** @type {TemplateNode | null} */
    ds.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ur(e) {
  return (
    /** @type {TemplateNode | null} */
    fs.call(e)
  );
}
function f(e, t) {
  return /* @__PURE__ */ Er(e);
}
function st(e, t = !1) {
  {
    var n = /* @__PURE__ */ Er(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ur(n) : n;
  }
}
function b(e, t = 1, n = !1) {
  let a = e;
  for (; t--; )
    a = /** @type {TemplateNode} */
    /* @__PURE__ */ ur(a);
  return a;
}
function Ui(e) {
  e.textContent = "";
}
function hs() {
  return !1;
}
function Wi(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Gi(e) {
  ve === null && (pe === null && ti(), ei()), Vt && Qs();
}
function Yi(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Xt(e, t) {
  var n = ve;
  n !== null && (n.f & Qe) !== 0 && (e |= Qe);
  var a = {
    ctx: Ke,
    deps: null,
    nodes: null,
    f: e | Be | xt,
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
  ge?.register_created_effect(a);
  var s = a;
  if ((e & Dn) !== 0)
    In !== null ? In.push(a) : un.ensure().schedule(a);
  else if (t !== null) {
    try {
      Bn(a);
    } catch (l) {
      throw it(a), l;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & Wn) === 0 && (s = s.first, (e & Ot) !== 0 && (e & jn) !== 0 && s !== null && (s.f |= jn));
  }
  if (s !== null && (s.parent = n, n !== null && Yi(s, n), pe !== null && (pe.f & Ue) !== 0 && (e & Yt) === 0)) {
    var i = (
      /** @type {Derived} */
      pe
    );
    (i.effects ??= []).push(s);
  }
  return a;
}
function ca() {
  return pe !== null && !It;
}
function Or(e) {
  const t = Xt(Cr, null);
  return Oe(t, qe), t.teardown = e, t;
}
function cn(e) {
  Gi();
  var t = (
    /** @type {Effect} */
    ve.f
  ), n = !pe && (t & kt) !== 0 && Ke !== null && !Ke.i;
  if (n) {
    var a = (
      /** @type {ComponentContext} */
      Ke
    );
    (a.e ??= []).push(e);
  } else
    return vs(e);
}
function vs(e) {
  return Xt(Dn | Gs, e);
}
function Vi(e) {
  un.ensure();
  const t = Xt(Yt | Wn, e);
  return (n = {}) => new Promise((a) => {
    n.outro ? xn(t, () => {
      it(t), a(void 0);
    }) : (it(t), a(void 0));
  });
}
function da(e) {
  return Xt(Dn, e);
}
function Xi(e) {
  return Xt(Ln | Wn, e);
}
function ps(e, t = 0) {
  return Xt(Cr | t, e);
}
function B(e, t = [], n = [], a = []) {
  Ci(a, t, n, (s) => {
    Xt(Cr, () => {
      e(...s.map(r));
    });
  });
}
function fa(e, t = 0) {
  var n = Xt(Ot | t, e);
  return n;
}
function wt(e) {
  return Xt(kt | Wn, e);
}
function gs(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Vt, a = pe;
    Sa(!0), St(null);
    try {
      t.call(null);
    } finally {
      Sa(n), St(a);
    }
  }
}
function ha(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Gn(() => {
      s.abort(or);
    });
    var a = n.next;
    (n.f & Yt) !== 0 ? n.parent = null : it(n, t), n = a;
  }
}
function Ki(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & kt) === 0 && it(t), t = n;
  }
}
function it(e, t = !0) {
  var n = !1;
  (t || (e.f & Ws) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ji(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Vr, ha(e, t && !n), ir(e, 0);
  var a = e.nodes && e.nodes.t;
  if (a !== null)
    for (const i of a)
      i.stop();
  gs(e), e.f ^= Vr, e.f |= ct;
  var s = e.parent;
  s !== null && s.first !== null && _s(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Ji(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ ur(e);
    e.remove(), e = n;
  }
}
function _s(e) {
  var t = e.parent, n = e.prev, a = e.next;
  n !== null && (n.next = a), a !== null && (a.prev = n), t !== null && (t.first === e && (t.first = a), t.last === e && (t.last = n));
}
function xn(e, t, n = !0) {
  var a = [];
  bs(e, a, !0);
  var s = () => {
    n && it(e), t && t();
  }, i = a.length;
  if (i > 0) {
    var l = () => --i || s();
    for (var u of a)
      u.out(l);
  } else
    s();
}
function bs(e, t, n) {
  if ((e.f & Qe) === 0) {
    e.f ^= Qe;
    var a = e.nodes && e.nodes.t;
    if (a !== null)
      for (const u of a)
        (u.is_global || n) && t.push(u);
    for (var s = e.first; s !== null; ) {
      var i = s.next;
      if ((s.f & Yt) === 0) {
        var l = (s.f & jn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (s.f & kt) !== 0 && (e.f & Ot) !== 0;
        bs(s, t, l ? n : !1);
      }
      s = i;
    }
  }
}
function Tr(e) {
  ms(e, !0);
}
function ms(e, t) {
  if ((e.f & Qe) !== 0) {
    e.f ^= Qe, (e.f & qe) === 0 && (Oe(e, Be), un.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var a = n.next, s = (n.f & jn) !== 0 || (n.f & kt) !== 0;
      ms(n, s ? t : !1), n = a;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function va(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, a = e.nodes.end; n !== null; ) {
      var s = n === a ? null : /* @__PURE__ */ ur(n);
      t.append(n), n = s;
    }
}
let mr = !1, Vt = !1;
function Sa(e) {
  Vt = e;
}
let pe = null, It = !1;
function St(e) {
  pe = e;
}
let ve = null;
function Ht(e) {
  ve = e;
}
let jt = null;
function ws(e) {
  pe !== null && (jt ??= /* @__PURE__ */ new Set()).add(e);
}
let at = null, ut = 0, mt = null;
function Zi(e) {
  mt = e;
}
let ys = 1, bn = 0, kn = bn;
function Ea(e) {
  kn = e;
}
function xs() {
  return ++ys;
}
function cr(e) {
  var t = e.f;
  if ((t & Be) !== 0)
    return !0;
  if (t & Ue && (e.f &= ~Sn), (t & Ft) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), a = n.length, s = 0; s < a; s++) {
      var i = n[s];
      if (cr(
        /** @type {Derived} */
        i
      ) && rs(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & xt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Nt === null && Oe(e, qe);
  }
  return !1;
}
function ks(e, t, n = !0) {
  var a = e.reactions;
  if (a !== null && !(jt !== null && jt.has(e)))
    for (var s = 0; s < a.length; s++) {
      var i = a[s];
      (i.f & Ue) !== 0 ? ks(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Oe(i, Be) : (i.f & qe) !== 0 && Oe(i, Ft), ua(
        /** @type {Effect} */
        i
      ));
    }
}
function Ss(e) {
  var t = at, n = ut, a = mt, s = pe, i = jt, l = Ke, u = It, o = kn, d = e.f;
  at = /** @type {null | Value[]} */
  null, ut = 0, mt = null, pe = (d & (kt | Yt)) === 0 ? e : null, jt = null, Hn(e.ctx), It = !1, kn = ++bn, e.ac !== null && (Gn(() => {
    e.ac.abort(or);
  }), e.ac = null);
  try {
    e.f |= xr;
    var g = (
      /** @type {Function} */
      e.fn
    ), m = g();
    e.f |= Un;
    var p = e.deps, h = ge?.is_fork;
    if (at !== null) {
      var v;
      if (h || ir(e, ut), p !== null && ut > 0)
        for (p.length = ut + at.length, v = 0; v < at.length; v++)
          p[ut + v] = at[v];
      else
        e.deps = p = at;
      if (ca() && (e.f & xt) !== 0)
        for (v = ut; v < p.length; v++)
          (p[v].reactions ??= []).push(e);
    } else !h && p !== null && ut < p.length && (ir(e, ut), p.length = ut);
    if (Ka() && mt !== null && !It && p !== null && (e.f & (Ue | Ft | Be)) === 0)
      for (v = 0; v < /** @type {Source[]} */
      mt.length; v++)
        ks(
          mt[v],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (bn++, s.deps !== null)
        for (let w = 0; w < n; w += 1)
          s.deps[w].rv = bn;
      if (t !== null)
        for (const w of t)
          w.rv = bn;
      mt !== null && (a === null ? a = mt : a.push(.../** @type {Source[]} */
      mt));
    }
    return (e.f & ln) !== 0 && (e.f ^= ln), m;
  } catch (w) {
    return Za(w);
  } finally {
    e.f ^= xr, at = t, ut = n, mt = a, pe = s, jt = i, Hn(l), It = u, kn = o;
  }
}
function Qi(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var a = js.call(n, e);
    if (a !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[a] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & Ue) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (at === null || !wr.call(at, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & xt) !== 0 && (i.f ^= xt, i.f &= ~Sn), i.v !== He && ia(i), i.ac !== null && Gn(() => {
      i.ac.abort(or), i.ac = null, Oe(i, Be);
    }), Fi(i), ir(i, 0);
  }
}
function ir(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var a = t; a < n.length; a++)
      Qi(e, n[a]);
}
function Bn(e) {
  var t = e.f;
  if ((t & ct) === 0) {
    Oe(e, qe);
    var n = ve, a = mr;
    ve = e, mr = (t & (kt | Yt)) === 0;
    try {
      (t & (Ot | Wa)) !== 0 ? Ki(e) : ha(e), gs(e);
      var s = Ss(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = ys;
      var i;
    } finally {
      mr = a, ve = n;
    }
  }
}
async function el() {
  await Promise.resolve(), Li();
}
function r(e) {
  var t = e.f, n = (t & Ue) !== 0;
  if (pe !== null && !It) {
    var a = ve !== null && (ve.f & ct) !== 0;
    if (!a && (jt === null || !jt.has(e))) {
      var s = pe.deps;
      if ((pe.f & xr) !== 0)
        e.rv < bn && (e.rv = bn, at === null && s !== null && s[ut] === e ? ut++ : at === null ? at = [e] : at.push(e));
      else {
        pe.deps ??= [], wr.call(pe.deps, e) || pe.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [pe] : wr.call(i, pe) || i.push(pe);
      }
    }
  }
  if (Vt && yn.has(e))
    return yn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Vt) {
      var u = l.v;
      return ((l.f & qe) === 0 && l.reactions !== null || Ts(l)) && (u = la(l)), yn.set(l, u), u;
    }
    var o = (l.f & xt) === 0 && !It && pe !== null && (mr || (pe.f & xt) !== 0), d = (l.f & Un) === 0;
    cr(l) && (o && (l.f |= xt), rs(l)), o && !d && (as(l), Es(l));
  }
  if (Nt?.has(e))
    return Nt.get(e);
  if ((e.f & ln) !== 0)
    throw e.v;
  return e.v;
}
function Es(e) {
  if (e.f |= xt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Ue) !== 0 && (t.f & xt) === 0 && (as(
        /** @type {Derived} */
        t
      ), Es(
        /** @type {Derived} */
        t
      ));
}
function Ts(e) {
  if (e.v === He) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (yn.has(t) || (t.f & Ue) !== 0 && Ts(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function dn(e) {
  var t = It;
  try {
    return It = !0, e();
  } finally {
    It = t;
  }
}
const tl = ["touchstart", "touchmove"];
function nl(e) {
  return tl.includes(e);
}
const Qn = Symbol("events"), Ms = /* @__PURE__ */ new Set(), ea = /* @__PURE__ */ new Set();
function rl(e, t, n, a = {}) {
  function s(i) {
    if (a.capture || ta.call(t, i), !i.cancelBubble)
      return Gn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ut(() => {
    t.addEventListener(e, s, a);
  }) : t.addEventListener(e, s, a), s;
}
function mn(e, t, n, a, s) {
  var i = { capture: a, passive: s }, l = rl(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Or(() => {
    t.removeEventListener(e, l, i);
  });
}
function X(e, t, n) {
  (t[Qn] ??= {})[e] = n;
}
function zt(e) {
  for (var t = 0; t < e.length; t++)
    Ms.add(e[t]);
  for (var n of ea)
    n(e);
}
let Ta = null;
function ta(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), a = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  Ta = e;
  var l = 0, u = Ta === e && e[Qn];
  if (u) {
    var o = s.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Qn] = t;
      return;
    }
    var d = s.indexOf(t);
    if (d === -1)
      return;
    o <= d && (l = o);
  }
  if (i = /** @type {Element} */
  s[l] || e.target, i !== t) {
    Hs(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = pe, m = ve;
    St(null), Ht(null);
    try {
      for (var p, h = []; i !== null && i !== t; ) {
        try {
          var v = i[Qn]?.[a];
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
      e[Qn] = t, delete e.currentTarget, St(g), Ht(m);
    }
  }
}
const al = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function sl(e) {
  return (
    /** @type {string} */
    al?.createHTML(e) ?? e
  );
}
function il(e) {
  var t = Wi("template");
  return t.innerHTML = sl(e.replaceAll("<!>", "<!---->")), t.content;
}
function Mr(e, t) {
  var n = (
    /** @type {Effect} */
    ve
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function N(e, t) {
  var n = (t & gi) !== 0, a = (t & _i) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = il(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ Er(s)));
    var l = (
      /** @type {TemplateNode} */
      a || cs ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Er(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      Mr(u, o);
    } else
      Mr(l, l);
    return l;
  };
}
function Fn(e = "") {
  {
    var t = Gt(e + "");
    return Mr(t, t), t;
  }
}
function pa() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Gt();
  return e.append(t, n), Mr(t, n), e;
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
  (e[Jr] ??= e.nodeValue) && (e[Jr] = n, e.nodeValue = `${n}`);
}
function ll(e, t) {
  return ol(e, t);
}
const pr = /* @__PURE__ */ new Map();
function ol(e, { target: t, anchor: n, props: a = {}, events: s, context: i, intro: l = !0, transformError: u }) {
  $i();
  var o = void 0, d = Vi(() => {
    var g = n ?? t.appendChild(Gt());
    Ri(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (h) => {
        dt({});
        var v = (
          /** @type {ComponentContext} */
          Ke
        );
        i && (v.c = i), s && (a.$$events = s), o = e(h, a) || {}, ft();
      },
      u
    );
    var m = /* @__PURE__ */ new Set(), p = (h) => {
      for (var v = 0; v < h.length; v++) {
        var w = h[v];
        if (!m.has(w)) {
          m.add(w);
          var c = nl(w);
          for (const F of [t, document]) {
            var _ = pr.get(F);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), pr.set(F, _));
            var y = _.get(w);
            y === void 0 ? (F.addEventListener(w, ta, { passive: c }), _.set(w, 1)) : _.set(w, y + 1);
          }
        }
      }
    };
    return p(Pr(Ms)), ea.add(p), () => {
      for (var h of m)
        for (const c of [t, document]) {
          var v = (
            /** @type {Map<string, number>} */
            pr.get(c)
          ), w = (
            /** @type {number} */
            v.get(h)
          );
          --w == 0 ? (c.removeEventListener(h, ta), v.delete(h), v.size === 0 && pr.delete(c)) : v.set(h, w);
        }
      ea.delete(p), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return ul.set(o, d), o;
}
let ul = /* @__PURE__ */ new WeakMap();
class cl {
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
  #a = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#a = n;
  }
  /**
   * @param {Batch} batch
   */
  #i = (t) => {
    if (this.#e.has(t)) {
      var n = (
        /** @type {Key} */
        this.#e.get(t)
      ), a = this.#r.get(n);
      if (a)
        Tr(a), this.#l.delete(n);
      else {
        var s = this.#t.get(n);
        s && (Tr(s.effect), this.#r.set(n, s.effect), this.#t.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), a = s.effect);
      }
      for (const [i, l] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const u = this.#t.get(l);
        u && (it(u.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#r) {
        if (i === n || this.#l.has(i)) continue;
        const u = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var d = document.createDocumentFragment();
            va(l, d), d.append(Gt()), this.#t.set(i, { effect: l, fragment: d });
          } else
            it(l);
          this.#l.delete(i), this.#r.delete(i);
        };
        this.#a || !a ? (this.#l.add(i), xn(l, u, !1)) : u();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    this.#e.delete(t);
    const n = Array.from(this.#e.values());
    for (const [a, s] of this.#t)
      n.includes(a) || (it(s.effect), this.#t.delete(a));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var a = (
      /** @type {Batch} */
      ge
    ), s = hs();
    if (n && !this.#r.has(t) && !this.#t.has(t))
      if (s) {
        var i = document.createDocumentFragment(), l = Gt();
        i.append(l), this.#t.set(t, {
          effect: wt(() => n(l)),
          fragment: i
        });
      } else
        this.#r.set(
          t,
          wt(() => n(this.anchor))
        );
    if (this.#e.set(a, t), s) {
      for (const [u, o] of this.#r)
        u === t ? a.unskip_effect(o) : a.skip_effect(o);
      for (const [u, o] of this.#t)
        u === t ? a.unskip_effect(o.effect) : a.skip_effect(o.effect);
      a.oncommit(this.#i), a.ondiscard(this.#n);
    } else
      this.#i(a);
  }
}
function V(e, t, n = !1) {
  var a = new cl(e), s = n ? jn : 0;
  function i(l, u) {
    a.ensure(l, u);
  }
  fa(() => {
    var l = !1;
    t((u, o = 0) => {
      l = !0, i(o, u);
    }), l || i(-1, null);
  }, s);
}
function yt(e, t) {
  return t;
}
function dl(e, t, n) {
  for (var a = [], s = t.length, i, l = t.length, u = 0; u < s; u++) {
    let m = t[u];
    xn(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var p = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            na(e, Pr(i.done)), p.delete(i), p.size === 0 && (e.outrogroups = null);
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
      Ui(g), g.append(d), e.items.clear();
    }
    na(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function na(e, t, n = !0) {
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
      i.f |= Dt;
      const l = document.createDocumentFragment();
      va(i, l);
    } else
      it(t[s], n);
  }
}
var Ma;
function Ve(e, t, n, a, s, i = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & Ya) !== 0;
  if (o) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild(Gt());
  }
  var g = null, m = /* @__PURE__ */ ns(() => {
    var F = n();
    return (
      /** @type {V[]} */
      sa(F) ? F : F == null ? [] : Pr(F)
    );
  }), p, h = /* @__PURE__ */ new Map(), v = !0;
  function w(F) {
    (y.effect.f & ct) === 0 && (y.pending.delete(F), y.fallback = g, fl(y, p, l, t, a), g !== null && (p.length === 0 ? (g.f & Dt) === 0 ? Tr(g) : (g.f ^= Dt, er(g, null, l)) : xn(g, () => {
      g = null;
    })));
  }
  function c(F) {
    y.pending.delete(F);
  }
  var _ = fa(() => {
    p = /** @type {V[]} */
    r(m);
    for (var F = p.length, L = /* @__PURE__ */ new Set(), D = (
      /** @type {Batch} */
      ge
    ), $ = hs(), Y = 0; Y < F; Y += 1) {
      var O = p[Y], P = a(O, Y), z = v ? null : u.get(P);
      z ? (z.v && qn(z.v, O), z.i && qn(z.i, Y), $ && D.unskip_effect(z.e)) : (z = hl(
        u,
        v ? l : Ma ??= Gt(),
        O,
        P,
        Y,
        s,
        t,
        n
      ), v || (z.e.f |= Dt), u.set(P, z)), L.add(P);
    }
    if (F === 0 && i && !g && (v ? g = wt(() => i(l)) : (g = wt(() => i(Ma ??= Gt())), g.f |= Dt)), F > L.size && Zs(), !v)
      if (h.set(D, L), $) {
        for (const [M, I] of u)
          L.has(M) || D.skip_effect(I.e);
        D.oncommit(w), D.ondiscard(c);
      } else
        w(D);
    r(m);
  }), y = { effect: _, items: u, pending: h, outrogroups: null, fallback: g };
  v = !1;
}
function Kn(e) {
  for (; e !== null && (e.f & kt) === 0; )
    e = e.next;
  return e;
}
function fl(e, t, n, a, s) {
  var i = (a & ci) !== 0, l = t.length, u = e.items, o = Kn(e.effect.first), d, g = null, m, p = [], h = [], v, w, c, _;
  if (i)
    for (_ = 0; _ < l; _ += 1)
      v = t[_], w = s(v, _), c = /** @type {EachItem} */
      u.get(w).e, (c.f & Dt) === 0 && (c.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(c));
  for (_ = 0; _ < l; _ += 1) {
    if (v = t[_], w = s(v, _), c = /** @type {EachItem} */
    u.get(w).e, e.outrogroups !== null)
      for (const z of e.outrogroups)
        z.pending.delete(c), z.done.delete(c);
    if ((c.f & Qe) !== 0 && (Tr(c), i && (c.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(c))), (c.f & Dt) !== 0)
      if (c.f ^= Dt, c === o)
        er(c, null, n);
      else {
        var y = g ? g.next : o;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), rn(e, g, c), rn(e, c, y), er(c, y, n), g = c, p = [], h = [], o = Kn(g.next);
        continue;
      }
    if (c !== o) {
      if (d !== void 0 && d.has(c)) {
        if (p.length < h.length) {
          var F = h[0], L;
          g = F.prev;
          var D = p[0], $ = p[p.length - 1];
          for (L = 0; L < p.length; L += 1)
            er(p[L], F, n);
          for (L = 0; L < h.length; L += 1)
            d.delete(h[L]);
          rn(e, D.prev, $.next), rn(e, g, D), rn(e, $, F), o = F, g = $, _ -= 1, p = [], h = [];
        } else
          d.delete(c), er(c, o, n), rn(e, c.prev, c.next), rn(e, c, g === null ? e.effect.first : g.next), rn(e, g, c), g = c;
        continue;
      }
      for (p = [], h = []; o !== null && o !== c; )
        (d ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = Kn(o.next);
      if (o === null)
        continue;
    }
    (c.f & Dt) === 0 && p.push(c), g = c, o = Kn(c.next);
  }
  if (e.outrogroups !== null) {
    for (const z of e.outrogroups)
      z.pending.size === 0 && (na(e, Pr(z.done)), e.outrogroups?.delete(z));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || d !== void 0) {
    var Y = [];
    if (d !== void 0)
      for (c of d)
        (c.f & Qe) === 0 && Y.push(c);
    for (; o !== null; )
      (o.f & Qe) === 0 && o !== e.fallback && Y.push(o), o = Kn(o.next);
    var O = Y.length;
    if (O > 0) {
      var P = (a & Ya) !== 0 && l === 0 ? n : null;
      if (i) {
        for (_ = 0; _ < O; _ += 1)
          Y[_].nodes?.a?.measure();
        for (_ = 0; _ < O; _ += 1)
          Y[_].nodes?.a?.fix();
      }
      dl(e, Y, P);
    }
  }
  i && Ut(() => {
    if (m !== void 0)
      for (c of m)
        c.nodes?.a?.apply();
  });
}
function hl(e, t, n, a, s, i, l, u) {
  var o = (l & oi) !== 0 ? (l & di) === 0 ? /* @__PURE__ */ ji(n, !1, !1) : En(n) : null, d = (l & ui) !== 0 ? En(s) : null;
  return {
    v: o,
    i: d,
    e: wt(() => (i(t, o ?? n, d ?? s, u), () => {
      e.delete(a);
    }))
  };
}
function er(e, t, n) {
  if (e.nodes)
    for (var a = e.nodes.start, s = e.nodes.end, i = t && (t.f & Dt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; a !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ur(a)
      );
      if (i.before(a), a === s)
        return;
      a = l;
    }
}
function rn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function hn(e, t, n) {
  da(() => {
    var a = dn(() => t(e, n?.()) || {});
    if (a?.destroy)
      return () => (
        /** @type {Function} */
        a.destroy()
      );
  });
}
const Aa = [...` 	
\r\f \v\uFEFF`];
function vl(e, t, n) {
  var a = e == null ? "" : "" + e;
  if (n) {
    for (var s of Object.keys(n))
      if (n[s])
        a = a ? a + " " + s : s;
      else if (a.length)
        for (var i = s.length, l = 0; (l = a.indexOf(s, l)) >= 0; ) {
          var u = l + i;
          (l === 0 || Aa.includes(a[l - 1])) && (u === a.length || Aa.includes(a[u])) ? a = (l === 0 ? "" : a.substring(0, l)) + a.substring(u + 1) : l = u;
        }
  }
  return a === "" ? null : a;
}
function Ra(e, t = !1) {
  var n = t ? " !important;" : ";", a = "";
  for (var s of Object.keys(e)) {
    var i = e[s];
    i != null && i !== "" && (a += " " + s + ": " + i + n);
  }
  return a;
}
function pl(e, t) {
  if (t) {
    var n = "", a, s;
    return Array.isArray(t) ? (a = t[0], s = t[1]) : a = t, a && (n += Ra(a)), s && (n += Ra(s, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Me(e, t, n, a, s, i) {
  var l = (
    /** @type {any} */
    e[Xr]
  );
  if (l !== n || l === void 0) {
    var u = vl(n, a, i);
    u == null ? e.removeAttribute("class") : e.className = u, e[Xr] = n;
  } else if (i && s !== i)
    for (var o in i) {
      var d = !!i[o];
      (s == null || d !== !!s[o]) && e.classList.toggle(o, d);
    }
  return i;
}
function jr(e, t = {}, n, a) {
  for (var s in n) {
    var i = n[s];
    t[s] !== i && (n[s] == null ? e.style.removeProperty(s) : e.style.setProperty(s, i, a));
  }
}
function Wt(e, t, n, a) {
  var s = (
    /** @type {any} */
    e[Kr]
  );
  if (s !== t) {
    var i = pl(t, a);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[Kr] = t;
  } else a && (Array.isArray(a) ? (jr(e, n?.[0], a[0]), jr(e, n?.[1], a[1], "important")) : jr(e, n, a));
  return a;
}
function tr(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!sa(t))
      return wi();
    for (var a of e.options)
      a.selected = t.includes(Pa(a));
    return;
  }
  for (a of e.options) {
    var s = Pa(a);
    if (Bi(s, t)) {
      a.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function gr(e) {
  var t = new MutationObserver(() => {
    "__value" in e && tr(e, e.__value);
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
function Pa(e) {
  return "__value" in e ? e.__value : e.value;
}
const gl = Symbol("is custom element"), _l = Symbol("is html"), bl = Xs ? "progress" : "PROGRESS";
function vn(e, t) {
  var n = ga(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== bl) || (e.value = t ?? "");
}
function ml(e, t) {
  var n = ga(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function fe(e, t, n, a) {
  var s = ga(e);
  s[t] !== (s[t] = n) && (t === "loading" && (e[Vs] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && wl(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function ga(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[Ga] ??= {
      [gl]: e.nodeName.includes("-"),
      [_l]: e.namespaceURI === bi
    }
  );
}
var Ca = /* @__PURE__ */ new Map();
function wl(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Ca.get(t);
  if (n) return n;
  Ca.set(t, n = []);
  for (var a, s = e, i = Element.prototype; i !== s; ) {
    a = qs(s);
    for (var l in a)
      a[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    s = $a(s);
  }
  return n;
}
class _a {
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
    var a = this.#e.get(t) || /* @__PURE__ */ new Set();
    return a.add(n), this.#e.set(t, a), this.#l().observe(t, this.#t), () => {
      var s = this.#e.get(t);
      s.delete(n), s.size === 0 && (this.#e.delete(t), this.#r.unobserve(t));
    };
  }
  #l() {
    return this.#r ?? (this.#r = new ResizeObserver(
      /** @param {any} entries */
      (t) => {
        for (var n of t) {
          _a.entries.set(n.target, n);
          for (var a of this.#e.get(n.target) || [])
            a(n);
        }
      }
    ));
  }
}
var yl = /* @__PURE__ */ new _a({
  box: "border-box"
});
function Oa(e, t, n) {
  var a = yl.observe(e, () => n(e[t]));
  da(() => (dn(() => n(e[t])), a));
}
function Hr(e, t) {
  return e === t || e?.[wn] === t;
}
function lr(e = {}, t, n, a) {
  var s = (
    /** @type {ComponentContext} */
    Ke.r
  ), i = (
    /** @type {Effect} */
    ve
  );
  return da(() => {
    var l, u;
    return ps(() => {
      l = u, u = [], dn(() => {
        Hr(n(...u), e) || (t(e, ...u), l && Hr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== s && o.parent !== null && o.parent.f & Vr; )
        o = o.parent;
      const d = () => {
        u && Hr(n(...u), e) && t(null, ...u);
      }, g = o.teardown;
      o.teardown = () => {
        d(), g?.();
      };
    };
  }), e;
}
function xl(e, t) {
  Ti(window, ["resize"], () => Gn(() => t(window[e])));
}
function ae(e, t, n, a) {
  var s = !0, i = (n & vi) !== 0, l = (n & pi) !== 0, u = (
    /** @type {V} */
    a
  ), o = !0, d = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && s ? (d ??= /* @__PURE__ */ sr(
    /** @type {() => V} */
    a
  ), r(d)) : (o && (o = !1, u = l ? dn(
    /** @type {() => V} */
    a
  ) : (
    /** @type {V} */
    a
  )), u);
  let m;
  if (i) {
    var p = wn in e || Ys in e;
    m = zn(e, t)?.set ?? (p && t in e ? (L) => e[t] = L : void 0);
  }
  var h, v = !1;
  i ? [h, v] = Ei(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && a !== void 0 && (h = g(), m && (ri(), m(h)));
  var w;
  if (w = () => {
    var L = (
      /** @type {V} */
      e[t]
    );
    return L === void 0 ? g() : (o = !0, L);
  }, (n & hi) === 0)
    return w;
  if (m) {
    var c = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(L, D) {
        return arguments.length > 0 ? ((!D || c || v) && m(D ? w() : L), L) : w();
      })
    );
  }
  var _ = !1, y = ((n & fi) !== 0 ? sr : ns)(() => (_ = !1, w()));
  i && r(y);
  var F = (
    /** @type {Effect} */
    ve
  );
  return (
    /** @type {() => V} */
    (function(L, D) {
      if (arguments.length > 0) {
        const $ = D ? r(y) : i ? Ne(L) : L;
        return x(y, $), _ = !0, u !== void 0 && (u = $), L;
      }
      return Vt && _ || (F.f & ct) !== 0 ? y.v : r(y);
    })
  );
}
function Yn(e) {
  Ke === null && Ks(), cn(() => {
    const t = dn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const kl = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(kl);
function Sl(e) {
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
async function Bt(e, t = {}) {
  const n = await fetch(e + Sl(t));
  if (!n.ok) {
    const a = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${a.error ? " (" + a.error + ")" : ""}`);
  }
  return n.json();
}
async function Nn(e, t) {
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
function Na(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const je = {
  // --- reads
  photos: (e) => Bt("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => Bt("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => Bt("/api/triage/counts", { ...Na(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Bt("/api/triage/files"),
  screen: (e, t = {}) => Bt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Bt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Bt("/api/triage/page", { ...Na(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Bt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => Nn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => Nn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => Nn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => Nn("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => Nn("/api/reveal", { id: e }),
  revealOrigin: (e) => Nn("/api/reveal", { origin: e }),
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
  rebuildStatus: () => Bt("/api/triage/rebuild")
};
function El() {
  let e = 0, t = 0;
  return async function(a) {
    const s = ++e, i = await a();
    return s <= t ? { stale: !0, value: void 0 } : (t = s, { stale: !1, value: i });
  };
}
function Tl(e, t) {
  let n = 0;
  const a = (...s) => {
    clearTimeout(n), n = setTimeout(() => e(...s), t);
  };
  return a.cancel = () => clearTimeout(n), a.now = (...s) => {
    clearTimeout(n), e(...s);
  }, a;
}
const Ia = ["B", "KB", "MB", "GB", "TB"];
function Pt(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < Ia.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${Ia[n]}`;
}
function Fe(e) {
  return (Number(e) || 0).toLocaleString();
}
const $n = "G:\\photos", Fa = [
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
      value: t ? `${$n}\\${t}\\${e.key}` : `${$n}\\${e.key}`
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
function As(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), a = $n.toLowerCase();
  return n.toLowerCase().startsWith(a + "\\") ? n : "";
}
function ba(e, t) {
  const n = t.toLowerCase();
  return e.some((a) => n === a || n.startsWith(a + "\\"));
}
function Ml(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function Al(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function Rs(e, t) {
  if (!t) return null;
  const n = e.find(
    (a) => a.term && a.term.column === t.column && a.term.op === t.op && Al(a.term.value, t.value)
  );
  return n ? n.decision : null;
}
var Rl = /* @__PURE__ */ N('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), Pl = /* @__PURE__ */ N('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), Cl = /* @__PURE__ */ N('<div class="line muted svelte-1vgp6n7">…</div>'), Ol = /* @__PURE__ */ N('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), Nl = /* @__PURE__ */ N('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), Il = /* @__PURE__ */ N('<div class="line muted svelte-1vgp6n7"> </div>'), Fl = /* @__PURE__ */ N('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function zl(e, t) {
  dt(t, !0);
  let n = ae(t, "counts", 3, null), a = ae(t, "files", 3, null), s = ae(t, "filesAt", 3, null), i = ae(t, "stale", 3, !1), l = ae(t, "candidate", 3, null), u = ae(t, "busy", 3, !1);
  const o = /* @__PURE__ */ re(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = Fl(), g = f(d);
  let m;
  var p = b(f(g), 2);
  {
    var h = (P) => {
      var z = Pl(), M = st(z), I = f(M), U = f(I), le = b(I, 2), ue = f(le), ie = b(le, 4), Z = f(ie), he = b(ie, 2), K = f(he), J = b(M, 2);
      {
        var C = (W) => {
          var j = Rl(), T = b(f(j), 2), k = f(T), S = b(T, 2), H = f(S), te = b(S, 4), ne = f(te), oe = b(te, 2), Q = f(oe), _e = b(oe, 2), Se = f(_e);
          B(
            (ye, Le, ce, de, Ae) => {
              A(k, `kept ${ye ?? ""}`), A(H, Le), A(ne, `excluded ${ce ?? ""}`), A(Q, de), A(Se, `${r(o) >= 0 ? "+" : ""}${Ae ?? ""} excluded`);
            },
            [
              () => Fe(n().candidate_kept_paths),
              () => Pt(n().candidate_kept_bytes),
              () => Fe(n().candidate_excluded_paths),
              () => Pt(n().candidate_excluded_bytes),
              () => Fe(r(o))
            ]
          ), R(W, j);
        };
        V(J, (W) => {
          l() && W(C);
        });
      }
      B(
        (W, j, T, k) => {
          A(U, `kept ${W ?? ""}`), A(ue, j), A(Z, `excluded ${T ?? ""}`), A(K, k);
        },
        [
          () => Fe(n().kept_paths),
          () => Pt(n().kept_bytes),
          () => Fe(n().excluded_paths),
          () => Pt(n().excluded_bytes)
        ]
      ), R(P, z);
    }, v = (P) => {
      var z = Cl();
      R(P, z);
    };
    V(p, (P) => {
      n() ? P(h) : P(v, -1);
    });
  }
  var w = b(g, 2);
  let c;
  var _ = f(w), y = b(f(_), 3), F = f(y), L = b(y, 2);
  {
    var D = (P) => {
      var z = Ol();
      R(P, z);
    };
    V(L, (P) => {
      i() && a() && a() !== "loading" && P(D);
    });
  }
  var $ = b(_, 2);
  {
    var Y = (P) => {
      var z = Nl(), M = st(z);
      let I;
      var U = f(M), le = f(U), ue = b(U, 2), ie = f(ue), Z = b(ue, 4), he = f(Z), K = b(Z, 2), J = f(K), C = b(M, 2), W = f(C);
      B(
        (j, T, k, S) => {
          I = Me(M, 1, "line svelte-1vgp6n7", null, I, { outdated: i() }), A(le, `kept ${j ?? ""}`), A(ie, T), A(he, `excluded ${k ?? ""}`), A(J, S), A(W, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Fe(a().kept_files),
          () => Pt(a().kept_bytes),
          () => Fe(a().excluded_files),
          () => Pt(a().excluded_bytes)
        ]
      ), R(P, z);
    }, O = (P) => {
      var z = Il(), M = f(z);
      B(() => A(M, a() === "loading" ? "counting…" : "not counted yet")), R(P, z);
    };
    V($, (P) => {
      a() && a() !== "loading" ? P(Y) : P(O, -1);
    });
  }
  B(() => {
    m = Me(g, 1, "block svelte-1vgp6n7", null, m, { busy: u() }), c = Me(w, 1, "block svelte-1vgp6n7", null, c, { busy: a() === "loading" }), y.disabled = a() === "loading", A(F, a() === "loading" ? "counting…" : "recount");
  }), X("click", y, function(...P) {
    t.onfiles?.apply(this, P);
  }), R(e, d), ft();
}
zt(["click"]);
const ra = "http://www.w3.org/2000/svg", pn = {
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
}, sn = {
  ...pn,
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
}, Ll = [
  { dark: "tint", light: "tintLight", base: pn },
  { dark: "control", light: "controlLight", base: sn },
  { dark: "ink", light: "inkLight", base: sn },
  { dark: "tally", light: "tallyLight", base: sn },
  { dark: "tallyInk", light: "tallyInkLight", base: sn }
], aa = /* @__PURE__ */ new Set();
let Ct = { ...sn };
function Dl() {
  return Ct;
}
function qr(e) {
  Ct = ql(e), ma();
  for (const t of aa) t(Ct);
  return Ct;
}
function jl(e) {
  return aa.add(e), () => aa.delete(e);
}
function nr(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function Hl(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: $e(nr(e.r, t.r), 0, 255),
    g: $e(nr(e.g, t.g), 0, 255),
    b: $e(nr(e.b, t.b), 0, 255),
    a: $e(nr(e.a, t.a), 0, 1)
  };
}
function ql(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [a, s] of Object.entries(sn))
    typeof s == "boolean" ? n[a] = t[a] === void 0 ? s : !!t[a] : typeof s == "object" ? n[a] = Hl(t[a], s) : n[a] = nr(t[a], s);
  return n;
}
function bt({ r: e, g: t, b: n, a }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Ce(a, 3)})`;
}
function Ce(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function za({ r: e, g: t, b: n, a }) {
  return { r: e, g: t, b: n, a: $e(a * 1.7 + 0.22, 0, 1) };
}
function La(e, t) {
  const n = 0.4 + $e(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - $e(t, 0, 100) / 100) };
}
function Da(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, s = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? $e(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * s * Math.max(t.glareFactor, 0) / 100;
  return $e(i ** (0.1 + $e(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const Bl = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function $l(e, t, n) {
  const a = $e(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), u = s - l, o = i - l, d = 8, g = [];
  for (let h = 0; h <= d; h++) {
    const v = h / d * (Math.PI / 2);
    g.push([l * Math.cos(v) ** (2 / a), l * Math.sin(v) ** (2 / a)]);
  }
  const m = [], p = (h, v, w, c) => {
    let _ = Math.atan2(h, -v);
    _ < 0 && (_ += Math.PI * 2);
    let y = Math.atan2(c, w);
    y < 0 && (y += Math.PI * 2);
    const F = Ce(Da(y, n), 3);
    m.push(`rgba(255, 255, 255, ${F}) ${Ce(_ / (Math.PI * 2) * 100, 2)}%`);
  };
  p(0, -i, 0, 1);
  for (const [h, v, w] of Bl)
    for (let c = 0; c <= d; c++) {
      const [_, y] = g[w ? d - c : c];
      p(h * (u + _), v * (o + y), h * _ ** (a - 1), -v * y ** (a - 1));
    }
  return m.push(`rgba(255, 255, 255, ${Ce(Da(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function ma() {
  const e = Ct, t = document.documentElement.style, n = La(e.refFresnelRange, e.refFresnelHardness), a = La(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Ce(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Ce(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", bt(e.tint)), t.setProperty("--glass-tint-light", bt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", bt(za(e.tint))), t.setProperty("--glass-tint-sheet-light", bt(za(e.tintLight))), t.setProperty("--glass-ctl-dark", bt(e.control)), t.setProperty("--glass-ctl-light", bt(e.controlLight)), t.setProperty("--glass-text-dark", bt(e.ink)), t.setProperty("--glass-text-light", bt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", bt(e.tally)), t.setProperty("--glass-tint-tally-light", bt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", bt(e.tallyInk)), t.setProperty("--glass-text-tally-light", bt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Ce(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Ce(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Ce(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Ce(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Ce(e.shadowX)}px ${Ce(-e.shadowY)}px ${Ce(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Ce($e(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Ce(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Ce(Math.log2($e(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Ce(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Ce(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Ce($e(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Ce(a.width)}px`), t.setProperty("--glass-glare-blur", `${Ce(a.blur)}px`);
}
function $e(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function Ul(e, t, n, a, s, i) {
  const l = Math.abs(e) - n + s, u = Math.abs(t) - a + s, o = Math.max(l, 0), d = Math.max(u, 0), g = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + g - s;
}
function Wl(e, t, n) {
  const a = e / 2, s = t / 2, i = $e(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (p, h) => Ul(p - a, h - s, a, s, l, i), g = 256, m = new Float32Array(g + 1);
  for (let p = 0; p <= g; p++) {
    const h = 1 - p / g, v = Math.asin($e(h * h, 0, 1)), w = Math.asin($e(Math.sin(v) / o, 0, 1));
    m[p] = Math.tan(v - w) * u;
  }
  return (p, h) => {
    const v = -d(p, h);
    if (v < 0 || v >= u) return null;
    const w = m[Math.round(v / u * g)];
    if (w === 0) return null;
    const c = 0.75, _ = d(p + c, h) - d(p - c, h), y = d(p, h + c) - d(p, h - c), F = Math.hypot(_, y);
    if (F === 0) return null;
    const L = -w / F;
    return { dx: _ * L, dy: y * L };
  };
}
function Gl(e, t, n) {
  const a = document.createElement("canvas");
  a.width = e, a.height = t;
  const s = a.getContext("2d"), i = s.createImageData(e, t), l = i.data, u = e * t, o = new Float32Array(u), d = new Float32Array(u);
  let g = 0;
  for (let p = 0; p < t; p++)
    for (let h = 0; h < e; h++) {
      const v = n(h + 0.5, p + 0.5);
      if (!v) continue;
      const w = p * e + h;
      o[w] = v.dx, d[w] = v.dy;
      const c = Math.hypot(v.dx, v.dy);
      c > g && (g = c);
    }
  const m = g > 0 ? 127 / g : 0;
  for (let p = 0; p < u; p++) {
    const h = p * 4;
    l[h] = 128 + $e(Math.round(o[p] * m), -127, 127), l[h + 1] = 128 + $e(Math.round(d[p] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: a.toDataURL(), scale: g * 2 };
}
const Br = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function $r(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Ce(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let Jn = null, Yl = 0;
function Vl() {
  if (Jn) return Jn;
  const e = document.createElementNS(ra, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), Jn = document.createElementNS(ra, "defs"), e.appendChild(Jn), document.body.appendChild(e), Jn;
}
function gn(e) {
  const t = `glass-refract-${++Yl}`, n = document.createElementNS(ra, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), Vl().appendChild(n);
  let a = 0, s = 0, i = 0, l = 0;
  const u = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, d = "";
  function g() {
    e.style.setProperty("--glass-pre", Ct.blurEdge ? "" : d), e.style.setProperty("--glass-post", Ct.blurEdge ? d : "");
  }
  function m() {
    a < 2 || s < 2 || e.style.setProperty("--glass-glare", $l(a, s, Ct));
  }
  function p() {
    if (a < 2 || s < 2) return;
    const c = Ct, _ = Gl(a, s, Wl(a, s, c)), y = c.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(a)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${a}" height="${s}" preserveAspectRatio="none" href="${_.url}" result="map"/>` + $r(_.scale * (1 + y), Br[0], "r") + $r(_.scale, Br[1], "g") + $r(_.scale * (1 - y), Br[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", g()), o = u.map((F) => Ct[F]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, p();
    }));
  }
  const v = new ResizeObserver(([c]) => {
    const _ = c.borderBoxSize?.[0], y = _ ? { w: Math.round(_.inlineSize), h: Math.round(_.blockSize) } : { w: Math.round(c.contentRect.width), h: Math.round(c.contentRect.height) };
    y.w === a && y.h === s || (a = y.w, s = y.h, m(), h());
  });
  v.observe(e);
  const w = jl(() => {
    m(), u.map((c) => Ct[c]).join(" ") !== o ? h() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), v.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const Ps = "photos.stack", Ur = { on: !1, window: 4 }, Cs = 1, Os = 10;
function Xl() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(Ps) ?? "");
  } catch {
    return { ...Ur };
  }
  if (e === null || typeof e != "object") return { ...Ur };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= Cs && t <= Os ? t : Ur.window
  };
}
function Kl(e) {
  return localStorage.setItem(Ps, JSON.stringify({ on: e.on, window: e.window })), e;
}
const Ns = "photos.theme", Is = "dark";
function Fs() {
  return document.documentElement.dataset.theme === "light" ? "light" : Is;
}
function Jl() {
  const e = localStorage.getItem(Ns), t = e === "dark" || e === "light" ? e : Is;
  return document.documentElement.dataset.theme = t, t;
}
function zs(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(Ns, e), e;
}
var Zl = /* @__PURE__ */ N('<span class="spin svelte-zne36e" aria-label="loading"></span>'), ja = /* @__PURE__ */ N('<span class="badge svelte-zne36e"> </span>'), Ql = /* @__PURE__ */ N('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), eo = /* @__PURE__ */ N('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), to = /* @__PURE__ */ N("<button> </button>"), no = /* @__PURE__ */ N('<div class="glass sheet sorts svelte-zne36e"></div>'), ro = /* @__PURE__ */ N(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), ao = /* @__PURE__ */ N('<p class="muted svelte-zne36e">loading…</p>'), so = /* @__PURE__ */ N('<span class="help svelte-zne36e">?</span>'), io = /* @__PURE__ */ N('<span class="n svelte-zne36e"> </span>'), lo = /* @__PURE__ */ N("<button> <!></button>"), oo = /* @__PURE__ */ N('<span class="muted svelte-zne36e">nothing here</span>'), uo = /* @__PURE__ */ N('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), co = /* @__PURE__ */ N('<div class="glass sheet filters svelte-zne36e"><!></div>'), fo = /* @__PURE__ */ N('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function ho(e, t) {
  dt(t, !0);
  let n = ae(t, "facets", 3, null), a = ae(t, "selected", 19, () => ({})), s = ae(t, "sort", 3, "newest"), i = ae(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = ae(t, "total", 3, null), u = ae(t, "tiles", 3, null), o = ae(t, "loading", 3, !1), d = ae(t, "onselect", 3, () => {
  }), g = ae(t, "onsort", 3, () => {
  }), m = ae(t, "onstack", 3, () => {
  }), p = ae(t, "onclear", 3, () => {
  }), h = ae(t, "ontriage", 3, () => {
  }), v = /* @__PURE__ */ G(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), w = /* @__PURE__ */ G(Ne(Fs())), c = /* @__PURE__ */ G(null);
  const _ = /* @__PURE__ */ re(() => u() ?? l()), y = /* @__PURE__ */ re(() => n()?.dimensions ?? []), F = /* @__PURE__ */ re(() => n()?.sorts ?? []), L = /* @__PURE__ */ re(() => r(F).find((q) => q.value === s())?.label ?? s()), D = /* @__PURE__ */ re(() => Object.values(a()).reduce((q, se) => q + se.length, 0)), $ = /* @__PURE__ */ re(() => r(y).flatMap((q) => (a()[q.name] ?? []).map((se) => ({
    dimension: q.name,
    value: se,
    title: q.title,
    label: q.options.find((we) => we.value === se)?.label ?? String(se)
  }))));
  function Y(q, se) {
    const we = a()[q] ?? [], Pe = we.includes(se) ? we.filter((ke) => ke !== se) : [...we, se];
    d()(q, Pe);
  }
  function O(q, se) {
    return (a()[q] ?? []).includes(se);
  }
  function P() {
    x(w, zs(r(w) === "dark" ? "light" : "dark"), !0);
  }
  let z = /* @__PURE__ */ G(null);
  const M = /* @__PURE__ */ re(() => r(z) ?? i().window);
  function I(q) {
    x(z, Number(q), !0);
  }
  function U(q) {
    x(z, null), m()({ ...i(), window: Number(q) });
  }
  cn(() => {
    r(v) !== "stacks" && x(z, null);
  });
  function le(q) {
    q.key === "Escape" && x(v, "");
  }
  function ue(q) {
    r(v) && !q.target.closest(".topbar") && x(v, "");
  }
  Yn(() => {
    const q = new ResizeObserver(([se]) => {
      const we = Math.round(se.borderBoxSize?.[0]?.blockSize ?? se.contentRect.height);
      document.documentElement.style.setProperty("--header-h", we + "px");
    });
    return q.observe(r(c)), () => {
      q.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var ie = fo();
  mn("keydown", on, le), mn("pointerdown", on, ue);
  var Z = f(ie), he = f(Z), K = f(he), J = b(he, 2), C = f(J), W = b(J, 2);
  {
    var j = (q) => {
      var se = Zl();
      R(q, se);
    };
    V(W, (q) => {
      o() && q(j);
    });
  }
  hn(Z, (q) => gn?.(q));
  var T = b(Z, 2), k = f(T), S = f(k), H = f(S);
  let te;
  var ne = f(H), oe = b(H, 2);
  let Q;
  var _e = b(f(oe));
  {
    var Se = (q) => {
      var se = ja(), we = f(se);
      B(() => A(we, r(D))), R(q, se);
    };
    V(_e, (q) => {
      r(D) && q(Se);
    });
  }
  var ye = b(oe, 2);
  let Le;
  var ce = b(f(ye));
  {
    var de = (q) => {
      var se = ja(), we = f(se);
      B((Pe) => A(we, Pe), [() => Fe(l())]), R(q, se);
    };
    V(ce, (q) => {
      i().on && l() !== null && q(de);
    });
  }
  var Ae = b(ye, 2);
  {
    var xe = (q) => {
      var se = eo(), we = f(se);
      Ve(we, 17, () => r($), (ke) => ke.dimension + " " + ke.value, (ke, be) => {
        var Ee = Ql(), We = f(Ee), tt = f(We), me = b(We, 1, !0);
        B(() => {
          fe(Ee, "title", `${r(be).title ?? ""}: ${r(be).label ?? ""} — click to remove`), A(tt, r(be).title), A(me, r(be).label);
        }), X("click", Ee, () => Y(r(be).dimension, r(be).value)), R(ke, Ee);
      });
      var Pe = b(we, 2);
      X("click", Pe, () => p()()), R(q, se);
    };
    V(Ae, (q) => {
      r($).length && q(xe);
    });
  }
  var Ie = b(S, 2), Je = f(Ie), lt = b(Ie, 2);
  hn(k, (q) => gn?.(q));
  var ht = b(k, 2);
  {
    var qt = (q) => {
      var se = no();
      Ve(se, 21, () => r(F), yt, (we, Pe) => {
        var ke = to();
        let be;
        var Ee = f(ke);
        B(() => {
          be = Me(ke, 1, "option svelte-zne36e", null, be, { on: r(Pe).value === s() }), A(Ee, r(Pe).label);
        }), X("click", ke, () => {
          g()(r(Pe).value), x(v, "");
        }), R(we, ke);
      }), hn(se, (we) => gn?.(we)), R(q, se);
    };
    V(ht, (q) => {
      r(v) === "sort" && q(qt);
    });
  }
  var Kt = b(ht, 2);
  {
    var vt = (q) => {
      var se = ro(), we = f(se), Pe = b(f(we), 2), ke = f(Pe);
      let be;
      var Ee = f(ke), We = b(we, 2), tt = b(f(We), 2), me = f(tt), De = b(me, 2), pt = f(De);
      hn(se, (Ge) => gn?.(Ge)), B(() => {
        be = Me(ke, 1, "option svelte-zne36e", null, be, { on: i().on }), fe(ke, "aria-checked", i().on), A(Ee, i().on ? "On" : "Off"), fe(me, "min", Cs), fe(me, "max", Os), vn(me, r(M)), fe(me, "aria-valuetext", `${r(M) ?? ""} seconds`), A(pt, `${r(M) ?? ""}s`);
      }), X("click", ke, () => m()({ ...i(), on: !i().on })), X("input", me, (Ge) => I(Ge.currentTarget.value)), X("change", me, (Ge) => U(Ge.currentTarget.value)), R(q, se);
    };
    V(Kt, (q) => {
      r(v) === "stacks" && q(vt);
    });
  }
  var et = b(Kt, 2);
  {
    var ot = (q) => {
      var se = co(), we = f(se);
      {
        var Pe = (be) => {
          var Ee = ao();
          R(be, Ee);
        }, ke = (be) => {
          var Ee = pa(), We = st(Ee);
          Ve(We, 17, () => r(y), yt, (tt, me) => {
            var De = uo(), pt = f(De), Ge = f(pt), Vn = b(Ge);
            {
              var Et = (Tt) => {
                var gt = so();
                B(() => fe(gt, "title", r(me).hint)), R(Tt, gt);
              };
              V(Vn, (Tt) => {
                r(me).hint && Tt(Et);
              });
            }
            var Lt = b(pt, 2), Tn = f(Lt);
            Ve(Tn, 17, () => r(me).options, yt, (Tt, gt) => {
              var Mn = lo();
              let E;
              var ee = f(Mn), Te = b(ee);
              {
                var ze = (Ye) => {
                  var _t = io(), Jt = f(_t);
                  B((Zt) => A(Jt, Zt), [() => Fe(r(gt).count)]), R(Ye, _t);
                };
                V(Te, (Ye) => {
                  r(gt).count !== null && Ye(ze);
                });
              }
              B(
                (Ye) => {
                  E = Me(Mn, 1, "option svelte-zne36e", null, E, Ye), A(ee, `${r(gt).label ?? ""} `);
                },
                [
                  () => ({ on: O(r(me).name, r(gt).value) })
                ]
              ), X("click", Mn, () => Y(r(me).name, r(gt).value)), R(Tt, Mn);
            });
            var fn = b(Tn, 2);
            {
              var dr = (Tt) => {
                var gt = oo();
                R(Tt, gt);
              };
              V(fn, (Tt) => {
                r(me).options.length || Tt(dr);
              });
            }
            B(() => A(Ge, `${r(me).title ?? ""} `)), R(tt, De);
          }), R(be, Ee);
        };
        V(we, (be) => {
          n() ? be(ke, -1) : be(Pe);
        });
      }
      hn(se, (be) => gn?.(be)), R(q, se);
    };
    V(et, (q) => {
      r(v) === "filters" && q(ot);
    });
  }
  lr(ie, (q) => x(c, q), () => r(c)), B(
    (q) => {
      A(K, q), A(C, r(_) === 1 ? "photo" : "photos"), te = Me(H, 1, "menu svelte-zne36e", null, te, { open: r(v) === "sort" }), fe(H, "aria-expanded", r(v) === "sort"), A(ne, r(L)), Q = Me(oe, 1, "menu svelte-zne36e", null, Q, { open: r(v) === "filters", on: r(D) > 0 }), fe(oe, "aria-expanded", r(v) === "filters"), Le = Me(ye, 1, "menu svelte-zne36e", null, Le, { open: r(v) === "stacks", on: i().on }), fe(ye, "aria-expanded", r(v) === "stacks"), fe(Ie, "title", r(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), fe(Ie, "aria-label", r(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), A(Je, r(w) === "dark" ? "☀" : "☾");
    },
    [() => r(_) === null ? "…" : Fe(r(_))]
  ), X("click", H, () => x(v, r(v) === "sort" ? "" : "sort", !0)), X("click", oe, () => x(v, r(v) === "filters" ? "" : "filters", !0)), X("click", ye, () => x(v, r(v) === "stacks" ? "" : "stacks", !0)), X("click", Ie, P), X("click", lt, () => h()()), R(e, ie), ft();
}
zt(["click", "input", "change"]);
const Rt = 4, Ar = 220, vo = 340;
function Rr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function po(e, t, n, a, s) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, u = 0, o = 1 / 0;
    for (; l < e.length && (u += Rr(e[l]), l++, o = (n - Rt * (l - i - 1)) / u, !(o <= Ar)); )
      ;
    if (o > Ar && !a) break;
    s(i, l, Math.round(Math.min(o, vo))), i = l;
  }
  return i;
}
function go(e, t, n) {
  const a = [];
  let s = 0;
  for (let i = e.from; i < e.to; i++) {
    const u = i === e.to - 1 ? n - s : Math.round(Rr(t[i]) * e.height);
    a.push({ index: i, x: s, w: u }), s += u + Rt;
  }
  return a;
}
function Ha(e, t, n) {
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
var _o = /* @__PURE__ */ N('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), bo = /* @__PURE__ */ N('<div role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Previous tile" aria-label="Previous tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M14.5 5 7.5 12l7 7"></path></svg></button></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Next tile" aria-label="Next tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M9.5 5l7 7-7 7"></path></svg></button></div></div>');
function mo(e, t) {
  dt(t, !0);
  let n = ae(t, "frames", 19, () => []), a = ae(t, "origin", 3, null), s = ae(t, "back", 3, !1), i = ae(t, "forward", 3, !1), l = ae(t, "onstep", 3, () => {
  }), u = ae(t, "onreveal", 3, () => {
  }), o = ae(t, "onclose", 3, () => {
  });
  const d = 40, g = 72, m = /* @__PURE__ */ re(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let p = /* @__PURE__ */ G(Ne(document.documentElement.clientWidth)), h = /* @__PURE__ */ G(Ne(document.documentElement.clientHeight)), v = /* @__PURE__ */ G(null), w = /* @__PURE__ */ G(Ne(/* @__PURE__ */ new Set()));
  const c = 4, _ = 25, y = { x: 0, y: 0, w: 0, h: 0 }, F = /* @__PURE__ */ re(() => Math.max(0, r(p) - g * 2)), L = /* @__PURE__ */ re(() => Math.max(0, r(h) - d * 2)), D = /* @__PURE__ */ re(() => r(F) > 0 && r(L) > 0 ? P(n(), r(F), r(L)) : n().map(() => y));
  function $(T, k, S) {
    const H = [];
    let te = 0, ne = 0;
    for (let oe = 0; oe < T.length; oe++)
      ne += Rr(T[oe]), ne * S + Rt * (oe - te) >= k && (H.push({ from: te, to: oe + 1, sum: ne }), te = oe + 1, ne = 0);
    return te < T.length && H.push({ from: te, to: T.length, sum: ne }), H;
  }
  function Y(T, k, S) {
    return T.map((H, te) => {
      const ne = (k - Rt * (H.to - H.from - 1)) / H.sum;
      return te === T.length - 1 && ne > S ? S : ne;
    });
  }
  function O(T, k, S) {
    return Y(T, k, S).reduce((H, te) => H + te, 0) + Rt * (T.length - 1);
  }
  function P(T, k, S) {
    let H = c, te = Math.max(c, S);
    for (let Se = 0; Se < _; Se++) {
      const ye = (H + te) / 2;
      O($(T, k, ye), k, ye) <= S ? H = ye : te = ye;
    }
    const ne = $(T, k, H), oe = Y(ne, k, H), Q = [];
    let _e = (S - (oe.reduce((Se, ye) => Se + ye, 0) + Rt * (ne.length - 1))) / 2;
    return ne.forEach((Se, ye) => {
      const Le = oe[ye], ce = [];
      for (let xe = Se.from; xe < Se.to; xe++) ce.push(Rr(T[xe]) * Le);
      const de = ce.reduce((xe, Ie) => xe + Ie, 0) + Rt * (ce.length - 1);
      let Ae = (k - de) / 2;
      for (const xe of ce)
        Q.push({
          x: Math.round(Ae),
          y: Math.round(_e),
          w: Math.round(xe),
          h: Math.round(Le)
        }), Ae += xe + Rt;
      _e += Le + Rt;
    }), Q;
  }
  function z(T) {
    if (!a() || !T || !T.w || !T.h) return "none";
    const k = a().left - (g + T.x), S = a().top - (d + T.y);
    return `translate(${k}px, ${S}px) scale(${a().width / T.w}, ${a().height / T.h})`;
  }
  const M = 1600;
  let I = /* @__PURE__ */ G(!1), U = 0;
  function le() {
    x(I, !1), clearTimeout(U), U = setTimeout(() => x(I, !0), M);
  }
  function ue(T) {
    if (T.key === "Escape") {
      o()();
      return;
    }
    T.key !== "ArrowLeft" && T.key !== "ArrowRight" || (T.preventDefault(), l()(T.key === "ArrowLeft" ? -1 : 1, T.repeat));
  }
  function ie(T) {
    T.target.closest(".frame, .lane") || o()();
  }
  Yn(() => (r(v)?.focus(), le(), () => clearTimeout(U)));
  var Z = bo();
  mn("keydown", on, ue), mn("pointerdown", on, ie), mn("pointermove", on, le);
  let he;
  var K = f(Z);
  Wt(K, "", {}, { inset: "40px 72px" }), Ve(K, 23, n, (T) => T.id, (T, k, S) => {
    var H = _o();
    let te;
    var ne = f(H);
    let oe;
    B(
      (Q, _e) => {
        te = Wt(H, "", te, Q), fe(ne, "src", `/d/${r(k).s ?? ""}.webp`), oe = Me(ne, 1, "svelte-5g1i2z", null, oe, _e);
      },
      [
        () => ({
          left: `${r(D)[r(S)].x ?? ""}px`,
          top: `${r(D)[r(S)].y ?? ""}px`,
          width: `${r(D)[r(S)].w ?? ""}px`,
          height: `${r(D)[r(S)].h ?? ""}px`,
          "--flight": z(r(D)[r(S)])
        }),
        () => ({ loaded: r(w).has(r(k).id) })
      ]
    ), X("click", H, () => u()(r(k))), mn("load", ne, () => x(w, new Set(r(w)).add(r(k).id), !0)), R(T, H);
  });
  var J = b(K, 2);
  Wt(J, "", {}, { width: "44px", left: "14px" });
  var C = f(J);
  hn(C, (T) => gn?.(T));
  var W = b(J, 2);
  Wt(W, "", {}, { width: "44px", right: "14px" });
  var j = f(W);
  hn(j, (T) => gn?.(T)), lr(Z, (T) => x(v, T), () => r(v)), B(() => {
    he = Me(Z, 1, "glass pane svelte-5g1i2z", null, he, { resting: r(I) }), fe(Z, "aria-label", r(m)), C.disabled = !s(), j.disabled = !i();
  }), X("click", C, () => l()(-1)), X("click", j, () => l()(1)), Oa(Z, "clientWidth", (T) => x(p, T)), Oa(Z, "clientHeight", (T) => x(h, T)), R(e, Z), ft();
}
zt(["click"]);
var wo = /* @__PURE__ */ N('<span class="err svelte-uzy12d"> </span>'), yo = /* @__PURE__ */ N(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), xo = /* @__PURE__ */ N(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), ko = /* @__PURE__ */ N('<span class="muted svelte-uzy12d"> </span>'), So = /* @__PURE__ */ N('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function Eo(e, t) {
  dt(t, !0);
  let n = /* @__PURE__ */ G(null), a = /* @__PURE__ */ G(!1), s = /* @__PURE__ */ G(null);
  async function i() {
    x(a, !0), x(s, null);
    try {
      x(n, await je.probe(), !0);
    } catch (h) {
      x(s, String(h), !0);
    } finally {
      x(a, !1);
    }
  }
  var l = So(), u = f(l), o = f(u), d = b(u, 2);
  {
    var g = (h) => {
      var v = wo(), w = f(v);
      B(() => A(w, r(s))), R(h, v);
    }, m = (h) => {
      var v = pa(), w = st(v);
      {
        var c = (y) => {
          var F = yo(), L = b(f(F), 2);
          B(
            (D) => A(L, ` above are formats the header
        reader cannot measure (${D ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), R(y, F);
        }, _ = (y) => {
          var F = xo(), L = f(F), D = f(L), $ = b(L, 2), Y = f($);
          B(
            (O) => {
              A(D, O), A(Y, r(n).command);
            },
            [() => Fe(r(n).worklist)]
          ), R(y, F);
        };
        V(w, (y) => {
          r(n).worklist === 0 ? y(c) : y(_, -1);
        });
      }
      R(h, v);
    }, p = (h) => {
      var v = ko(), w = f(v);
      B(() => A(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), R(h, v);
    };
    V(d, (h) => {
      r(s) ? h(g) : r(n) ? h(m, 1) : h(p, -1);
    });
  }
  B(() => {
    u.disabled = r(a), A(o, r(a) ? "counting…" : "Check the dimension probe's worklist");
  }), X("click", u, i), R(e, l), ft();
}
zt(["click"]);
var To = /* @__PURE__ */ N('<p class="bad svelte-1xjbga"> </p>'), Mo = /* @__PURE__ */ N('<pre class="svelte-1xjbga"> </pre>'), Ao = /* @__PURE__ */ N('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), Ro = /* @__PURE__ */ N(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), Po = /* @__PURE__ */ N('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), Co = /* @__PURE__ */ N('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), Oo = /* @__PURE__ */ N(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), No = /* @__PURE__ */ N('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), Io = /* @__PURE__ */ N(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function Fo(e, t) {
  dt(t, !0);
  let n = /* @__PURE__ */ G(null), a = /* @__PURE__ */ G(!1), s = /* @__PURE__ */ G(null), i = /* @__PURE__ */ G(null);
  const l = /* @__PURE__ */ re(() => r(n)?.state === "running"), u = /* @__PURE__ */ re(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const y = await je.rebuildStatus();
      x(n, y, !0), x(s, null), y.state === "done" && y.started_at !== r(i) && (x(i, y.started_at, !0), t.oncomplete?.());
    } catch (y) {
      x(s, String(y), !0);
    }
  }
  Yn(() => {
    o();
  }), cn(() => {
    if (!r(l)) return;
    const y = setInterval(o, 700);
    return () => clearInterval(y);
  });
  async function d() {
    x(a, !0), x(s, null);
    try {
      x(n, await je.rebuild(), !0);
    } catch (y) {
      x(s, String(y), !0);
    }
  }
  function g(y) {
    y.key === "Escape" && x(a, !1);
  }
  var m = Io();
  mn("keydown", on, g);
  var p = st(m), h = f(p), v = f(h), w = b(h, 2), c = b(p, 2);
  {
    var _ = (y) => {
      var F = No(), L = st(F), D = b(L, 2), $ = f(D), Y = b(f($), 4), O = f(Y), P = b(Y, 2), z = b($, 2);
      {
        var M = (K) => {
          var J = To(), C = f(J);
          B(() => A(C, r(s))), R(K, J);
        };
        V(z, (K) => {
          r(s) && K(M);
        });
      }
      var I = b(z, 2);
      Ve(I, 17, () => r(n)?.steps ?? [], yt, (K, J) => {
        var C = Ao();
        let W;
        var j = f(C), T = f(j), k = f(T);
        {
          var S = (ce) => {
            var de = Fn("✓");
            R(ce, de);
          }, H = (ce) => {
            var de = Fn("✕");
            R(ce, de);
          }, te = (ce) => {
            var de = Fn("·");
            R(ce, de);
          }, ne = (ce) => {
            var de = Fn(" ");
            R(ce, de);
          };
          V(k, (ce) => {
            r(J).state === "done" ? ce(S) : r(J).state === "failed" ? ce(H, 1) : r(J).state === "running" ? ce(te, 2) : ce(ne, -1);
          });
        }
        var oe = b(T, 2), Q = f(oe), _e = b(oe, 4), Se = f(_e), ye = b(j, 2);
        {
          var Le = (ce) => {
            var de = Mo(), Ae = f(de);
            B((xe) => A(Ae, xe), [() => r(J).log.join(`
`)]), R(ce, de);
          };
          V(ye, (ce) => {
            r(J).log.length && ce(Le);
          });
        }
        B(() => {
          W = Me(C, 1, "step svelte-1xjbga", null, W, {
            on: r(J).state === "running",
            bad: r(J).state === "failed"
          }), A(Q, r(J).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), A(Se, r(J).seconds === null ? "" : r(J).seconds + "s");
        }), R(K, C);
      });
      var U = b(I, 2);
      {
        var le = (K) => {
          var J = Ro(), C = st(J), W = f(C);
          B(() => A(W, r(n).error)), R(K, J);
        }, ue = (K) => {
          var J = Po();
          R(K, J);
        }, ie = (K) => {
          var J = Co();
          R(K, J);
        };
        V(U, (K) => {
          r(n)?.state === "failed" ? K(le) : r(n)?.state === "done" ? K(ue, 1) : r(l) && K(ie, 2);
        });
      }
      var Z = b(U, 2);
      {
        var he = (K) => {
          var J = Oo(), C = b(f(J), 6), W = f(C);
          B(() => A(W, `python -m photolib.restore_state ${r(u) ?? ""}`)), R(K, J);
        };
        V(Z, (K) => {
          r(u) && K(he);
        });
      }
      B(() => A(O, `${r(n)?.seconds ?? 0 ?? ""}s`)), X("click", L, () => x(a, !1)), X("click", P, () => x(a, !1)), R(y, F);
    };
    V(c, (y) => {
      r(a) && y(_);
    });
  }
  B(() => {
    h.disabled = r(l), A(v, r(l) ? "applying…" : "Apply to grid"), w.disabled = !r(n) || r(n).state === "idle";
  }), X("click", h, d), X("click", w, () => x(a, !0)), R(e, m), ft();
}
zt(["click"]);
var zo = /* @__PURE__ */ N('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), qa = /* @__PURE__ */ N("<option> </option>"), Lo = /* @__PURE__ */ N('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), Do = /* @__PURE__ */ N('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), jo = /* @__PURE__ */ N('<div class="none muted svelte-bqi9ky"> </div>'), Ho = /* @__PURE__ */ N('<div class="bar svelte-bqi9ky"><!></div>');
function qo(e, t) {
  dt(t, !0);
  let n = ae(t, "candidate", 3, null), a = ae(t, "saving", 3, !1);
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
    const _ = { ...n(), [w]: c };
    if (w === "column") {
      const y = i[c] ?? ["="];
      y.includes(_.op) || (_.op = y[0]), _.value = l.has(c) ? 0 : "";
    }
    w === "op" && c === "is null" && (_.value = null), w === "value" && l.has(_.column) && (_.value = Number(c) || 0), t.onedit(_);
  }
  var g = Ho(), m = f(g);
  {
    var p = (w) => {
      var c = zo(), _ = f(c), y = f(_), F = b(_, 2), L = f(F);
      B(() => {
        A(y, `${t.screen.title ?? ""} does not save a rule.`), A(L, t.screen.blurb);
      }), R(w, c);
    }, h = (w) => {
      var c = Do(), _ = st(c), y = f(_);
      Ve(y, 21, () => s, yt, (C, W) => {
        var j = qa(), T = f(j), k = {};
        B(() => {
          A(T, r(W)), k !== (k = r(W)) && (j.value = (j.__value = r(W)) ?? "");
        }), R(C, j);
      });
      var F;
      gr(y);
      var L = b(y, 2);
      Ve(L, 21, () => r(u), yt, (C, W) => {
        var j = qa(), T = f(j), k = {};
        B(() => {
          A(T, r(W)), k !== (k = r(W)) && (j.value = (j.__value = r(W)) ?? "");
        }), R(C, j);
      });
      var D;
      gr(L);
      var $ = b(L, 2);
      {
        var Y = (C) => {
          var W = Lo();
          B(() => vn(W, n().value ?? "")), X("input", W, (j) => d("value", j.currentTarget.value)), R(C, W);
        };
        V($, (C) => {
          r(o) && C(Y);
        });
      }
      var O = b($, 2), P = f(O);
      P.value = P.__value = "exclude";
      var z = b(P);
      z.value = z.__value = "include";
      var M;
      gr(O);
      var I = b(O, 2), U = f(I);
      U.value = U.__value = "end";
      var le = b(U);
      le.value = le.__value = "0";
      var ue;
      gr(I);
      var ie = b(I, 2), Z = f(ie), he = b(ie, 2), K = b(_, 2), J = f(K);
      B(
        (C, W) => {
          F !== (F = n().column) && (y.value = (y.__value = n().column) ?? "", tr(y, n().column)), D !== (D = n().op) && (L.value = (L.__value = n().op) ?? "", tr(L, n().op)), M !== (M = n().decision ?? "exclude") && (O.value = (O.__value = n().decision ?? "exclude") ?? "", tr(O, n().decision ?? "exclude")), ue !== (ue = C) && (I.value = (I.__value = C) ?? "", tr(I, C)), ie.disabled = a(), A(Z, a() ? "saving…" : "Confirm"), A(J, `${W ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Ml(n())
        ]
      ), X("change", y, (C) => d("column", C.currentTarget.value)), X("change", L, (C) => d("op", C.currentTarget.value)), X("change", O, (C) => d("decision", C.currentTarget.value)), X("change", I, (C) => d("at", C.currentTarget.value)), X("click", ie, function(...C) {
        t.onconfirm?.apply(this, C);
      }), X("click", he, function(...C) {
        t.onclear?.apply(this, C);
      }), R(w, c);
    }, v = (w) => {
      var c = jo(), _ = f(c);
      B(() => A(_, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), R(w, c);
    };
    V(m, (w) => {
      t.screen.rule === !1 ? w(p) : n() ? w(h, 1) : w(v, -1);
    });
  }
  R(e, g), ft();
}
zt(["change", "input", "click"]);
var Bo = /* @__PURE__ */ N('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), $o = /* @__PURE__ */ N('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), Uo = /* @__PURE__ */ N('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Wo = /* @__PURE__ */ N('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Go(e, t) {
  dt(t, !0);
  let n = ae(t, "rules", 19, () => []), a = ae(t, "unmatched", 3, null), s = ae(t, "busy", 3, !1);
  var i = Wo(), l = f(i), u = b(f(l)), o = f(u), d = b(l, 2);
  {
    var g = (v) => {
      var w = Bo();
      R(v, w);
    };
    V(d, (v) => {
      n().length === 0 && v(g);
    });
  }
  var m = b(d, 2);
  Ve(m, 19, n, (v) => v.id, (v, w, c) => {
    var _ = $o();
    let y;
    var F = f(_), L = f(F), D = f(L), $ = b(L, 2), Y = f($), O = b($, 2), P = f(O), z = b(F, 2), M = f(z), I = f(M), U = b(M, 2), le = f(U), ue = b(U, 4), ie = b(ue, 2), Z = b(ie, 2);
    B(
      (he, K) => {
        y = Me(_, 1, "rule svelte-aof9c2", null, y, { exclude: r(w).decision === "exclude" }), A(D, r(c)), A(Y, r(w).predicate), A(P, r(w).decision), A(I, `${he ?? ""} paths`), A(le, K), ue.disabled = s() || r(c) === 0, ie.disabled = s() || r(c) === n().length - 1, Z.disabled = s();
      },
      [
        () => Fe(r(w).paths),
        () => Pt(r(w).bytes)
      ]
    ), X("click", ue, () => t.onmove(r(w), r(c) - 1)), X("click", ie, () => t.onmove(r(w), r(c) + 1)), X("click", Z, () => t.ondelete(r(w))), R(v, _);
  });
  var p = b(m, 2);
  {
    var h = (v) => {
      var w = Uo(), c = b(f(w), 2), _ = f(c), y = f(_), F = b(_, 2), L = f(F);
      B(
        (D, $) => {
          A(y, `${D ?? ""} paths`), A(L, $);
        },
        [
          () => Fe(a().paths),
          () => Pt(a().bytes)
        ]
      ), R(v, w);
    };
    V(p, (v) => {
      a() && v(h);
    });
  }
  B(() => A(o, `${n().length ?? ""} rules · top-down, first match wins`)), R(e, i), ft();
}
zt(["click"]);
const Ba = 2500, Yo = 1, Vo = 2, Xo = 3e7, Wr = /* @__PURE__ */ new WeakMap();
function Ko(e, t, n) {
  const a = [], s = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, d = 0, g = null, m = null, p = null, h = !1, v = !1, w = 0, c = 0, _ = 0, y = n.onState || (() => {
  });
  function F(k) {
    w <= 0 || (o = po(a, o, w, k, (S, H, te) => {
      s.push({ top: d, height: te, from: S, to: H }), d += te + Rt;
    }), D());
  }
  function L() {
    if (m === null || h || w <= 0 || o >= m) return 0;
    const k = s.length ? o / s.length : Math.max(1, w / Ar), S = s.length ? d / s.length : Ar + Rt, H = Math.round((m - o) / k * S);
    return Math.max(0, Math.min(H, Xo - d));
  }
  function D() {
    e.style.height = d + L() + "px", t.style.top = Math.max(0, d - 1) + "px";
  }
  function $() {
    return window.scrollY - e.offsetTop;
  }
  function Y() {
    const k = l.pop();
    if (k) return k;
    const S = document.createElement("div");
    S.className = "tile", S.tabIndex = -1;
    const H = document.createElement("img");
    return H.decoding = "async", H.addEventListener("load", () => S.classList.add("loaded")), H.addEventListener("error", () => S.classList.add("missing")), S.appendChild(H), Wr.set(S, H), n.extend && n.extend(S), S;
  }
  function O(k, S) {
    Wr.get(S).removeAttribute("src"), S.classList.remove("loaded", "missing", "error"), S.style.backgroundImage = "", S.remove(), i.delete(k), l.push(S);
  }
  function P(k, S, H, te, ne, oe) {
    let Q = i.get(k);
    const _e = a[k];
    if (!Q) {
      Q = Y(), Q.dataset.index = String(k);
      const Se = Wr.get(Q);
      Se.fetchPriority = oe ? "high" : "low", Se.src = "/t/" + _e.s + ".webp", u.push(k), n.fill && n.fill(Q, _e), e.appendChild(Q), i.set(k, Q);
    }
    Q.style.width = te + "px", Q.style.height = ne + "px", Q.style.transform = "translate(" + S + "px," + H + "px)";
  }
  function z(k, S) {
    S.th && (S.url === void 0 && (S.url = n.thumbHash(S.th)), S.url && (k.style.backgroundImage = "url(" + S.url + ")"));
  }
  function M() {
    _ = 0;
    for (const k of u) {
      const S = i.get(k);
      S && !S.classList.contains("loaded") && z(S, a[k]);
    }
    u.length = 0;
  }
  function I(k, S) {
    for (const H of go(k, a, w))
      P(H.index, H.x, k.top, H.w, k.height, S);
  }
  function U() {
    const k = window.innerHeight, S = $(), H = Ha(s, S - k * Yo, S + k * (1 + Vo));
    if (!H) return;
    const te = s[H[0]].from, ne = s[H[1]].to;
    for (const [oe, Q] of Array.from(i))
      (oe < te || oe >= ne) && O(oe, Q);
    for (let oe = H[0]; oe <= H[1]; oe++) {
      const Q = s[oe];
      I(Q, Q.top < S + k && Q.top + Q.height > S);
    }
    u.length && !_ && (_ = requestAnimationFrame(M));
  }
  function le() {
    return w <= 0 ? !1 : d - ($() + window.innerHeight) < Ba;
  }
  let ue = Promise.resolve();
  function ie() {
    return v || h || (v = !0, ue = Z()), ue;
  }
  async function Z() {
    const k = c;
    y({ loading: !0, count: a.length, exhausted: h, total: m, tiles: p });
    try {
      do {
        const S = await n.fetchPage(g);
        if (k !== c) return;
        for (const H of S.photos) a.push(H);
        g = S.next, h = g === null, typeof S.stacks == "number" ? (m = S.stacks, p = typeof S.total == "number" ? S.total : null) : typeof S.total == "number" && (m = S.total), F(h), U(), y({ loading: !0, count: a.length, exhausted: h, total: m, tiles: p });
      } while (!h && le());
    } catch (S) {
      k === c && y({ error: String(S) });
    } finally {
      k === c && (v = !1, y({ loading: !1, count: a.length, exhausted: h, total: m, tiles: p }));
    }
  }
  let he = 0;
  function K() {
    he || (he = requestAnimationFrame(() => {
      he = 0, U(), le() && ie();
    }));
  }
  function J() {
    const k = e.clientWidth;
    if (k === w) return;
    const S = Ha(s, $(), $()), H = S ? s[S[0]].from : 0;
    w = k;
    for (const [ne, oe] of Array.from(i)) O(ne, oe);
    s.length = 0, o = 0, d = 0, F(h), U();
    const te = s.find((ne) => ne.to > H);
    te && window.scrollTo(0, te.top + e.offsetTop), le() && ie();
  }
  function C(k) {
    const S = k.target.closest(".tile");
    if (!S || !e.contains(S)) return;
    const H = Number(S.dataset.index), te = a[H];
    te && n.activate && n.activate(te, k, S, H);
  }
  e.addEventListener("click", C), window.addEventListener("scroll", K, { passive: !0 });
  let W = 0;
  const j = new ResizeObserver(() => {
    clearTimeout(W), W = setTimeout(J, 100);
  });
  j.observe(e);
  const T = new IntersectionObserver(
    (k) => {
      k.some((S) => S.isIntersecting) && ie();
    },
    { rootMargin: "0px 0px " + Ba + "px 0px" }
  );
  return T.observe(t), w = e.clientWidth, ie(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      c++, v = !1;
      for (const [k, S] of Array.from(i)) O(k, S);
      a.length = 0, s.length = 0, u.length = 0, o = 0, d = 0, g = null, m = null, p = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), ie();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(k) {
      const S = typeof k == "number" ? k : null;
      S !== m && (m = S, D(), y({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [k, S] of i) n.fill(S, a[k]);
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
    async walkTo(k) {
      for (; k >= o && !h; ) {
        const ne = o;
        if (await ie(), o === ne) break;
      }
      const S = s.find((ne) => ne.to > k);
      if (!S) return null;
      const H = Math.max(0, (window.innerHeight - S.height) / 2);
      window.scrollTo(0, Math.max(0, e.offsetTop + S.top - H)), U();
      const te = i.get(k);
      return te ? { item: a[k], tile: te } : null;
    },
    // Put the keyboard back on a tile. The overlay hands focus back on the way
    // out, and after a walk that is a different tile from the one it opened on.
    focus(k) {
      i.get(k)?.focus();
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(k) {
      for (const [S, H] of i)
        a[S] === k && n.fill && n.fill(H, k);
    },
    destroy() {
      c++, e.removeEventListener("click", C), window.removeEventListener("scroll", K), j.disconnect(), T.disconnect(), clearTimeout(W), cancelAnimationFrame(_);
    }
  };
}
function Jo(e) {
  try {
    const t = Uint8Array.from(atob(e), (I) => I.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, a = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, d = (a >> 3 & 63) / 63, g = (a >> 9 & 63) / 63, m = a >> 15, p = Math.max(3, m ? o ? 5 : 7 : a & 7), h = Math.max(3, m ? a & 7 : o ? 5 : 7);
    let v = o ? 6 : 5, w = 0;
    const c = (I, U, le) => {
      const ue = [];
      for (let ie = 0; ie < U; ie++)
        for (let Z = ie ? 0 : 1; Z * U < I * (U - ie); Z++) {
          const he = t[v + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          ue.push((he / 7.5 - 1) * le);
        }
      return ue;
    }, _ = c(p, h, u), y = c(3, 3, d * 1.25), F = c(3, 3, g * 1.25), L = p / h, D = Math.max(1, Math.round(L > 1 ? 32 : 32 * L)), $ = Math.max(1, Math.round(L > 1 ? 32 / L : 32)), Y = document.createElement("canvas");
    Y.width = D, Y.height = $;
    const O = Y.getContext("2d"), P = O.createImageData(D, $), z = [], M = [];
    for (let I = 0, U = 0; I < $; I++)
      for (let le = 0; le < D; le++, U += 4) {
        let ue = s, ie = i, Z = l;
        for (let C = 0; C < p; C++) z[C] = Math.cos(Math.PI / D * (le + 0.5) * C);
        for (let C = 0; C < h; C++) M[C] = Math.cos(Math.PI / $ * (I + 0.5) * C);
        for (let C = 0, W = 0; C < h; C++)
          for (let j = C ? 0 : 1; j * h < p * (h - C); j++, W++)
            ue += _[W] * z[j] * M[C] * 2;
        for (let C = 0, W = 0; C < 3; C++)
          for (let j = C ? 0 : 1; j < 3 - C; j++, W++) {
            const T = z[j] * M[C] * 2;
            ie += y[W] * T, Z += F[W] * T;
          }
        const he = ue - 2 / 3 * ie, K = (3 * ue - he + Z) / 2, J = K - Z;
        P.data[U] = Math.max(0, Math.min(255, Math.round(255 * K))), P.data[U + 1] = Math.max(0, Math.min(255, Math.round(255 * J))), P.data[U + 2] = Math.max(0, Math.min(255, Math.round(255 * he))), P.data[U + 3] = 255;
      }
    return O.putImageData(P, 0, 0), Y.toDataURL();
  } catch {
    return null;
  }
}
var Zo = /* @__PURE__ */ N('<main id="canvas"><div id="sentinel"></div></main>');
function Qo(e, t) {
  dt(t, !0);
  let n = ae(t, "key", 3, ""), a = ae(t, "total", 3, null), s = ae(t, "triage", 3, !1), i = ae(t, "excludedDirs", 19, () => []), l = ae(t, "onActivate", 3, () => {
  }), u = ae(t, "onOverride", 3, async () => null), o = ae(t, "onExcludeFolder", 3, () => {
  }), d = ae(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ G(null), m = /* @__PURE__ */ G(null), p = null, h = "";
  const v = { null: "exclude", exclude: "include", include: "clear" };
  function w(O) {
    const P = O.toLowerCase().startsWith($n.toLowerCase()) ? O.slice($n.length + 1) : O;
    return P.length > 64 ? "…" + P.slice(-64) : P;
  }
  function c(O) {
    const P = document.createElement("div");
    P.className = "tile-path", O.appendChild(P);
    const z = document.createElement("button");
    z.className = "chip", z.type = "button", O.appendChild(z);
    const M = document.createElement("button");
    M.className = "dirchip", M.type = "button", M.textContent = "dir", O.appendChild(M);
  }
  function _(O, P) {
    const z = O.querySelector(".tile-path");
    z && (z.textContent = P.p ? w(P.p) : "");
    const M = O.querySelector(".dirchip");
    if (M) {
      const U = As(P.p ?? ""), le = U !== "" && ba(i(), U);
      M.hidden = U === "", M.disabled = le, M.dataset.state = le ? "exclude" : "none", M.title = le ? `already excluded: ${U}` : `exclude everything under ${U}, subfolders included — one exclude rule at the end of the order`;
    }
    const I = O.querySelector(".chip");
    I && (I.dataset.state = P.o || "none", I.textContent = P.o === "exclude" ? "drop" : P.o === "include" ? "keep" : "·", I.title = P.o === "exclude" ? "overridden: excluded — click to keep" : P.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Yn(() => (p = Ko(r(g), r(m), {
    fetchPage: (O) => t.fetchPage(O),
    thumbHash: Jo,
    extend: s() ? c : void 0,
    fill: s() ? _ : void 0,
    onState: (O) => d()(O),
    activate: async (O, P, z, M) => {
      if (P.target.closest(".dirchip")) {
        o()(O);
        return;
      }
      if (!P.target.closest(".chip")) {
        l()(O, z, M);
        return;
      }
      const I = v[O.o ?? "null"];
      O.o = await u()(O, I), _(z, O);
    }
  }), h = n(), () => p?.destroy())), cn(() => {
    const O = n(), P = a();
    p && (O !== h && (h = O, p.reset()), p.setTotal(P));
  });
  function y(O) {
    return p?.walkTo(O);
  }
  function F(O) {
    p?.focus(O);
  }
  let L = "";
  cn(() => {
    const O = i().join(`
`);
    !p || O === L || (L = O, p.refill());
  });
  var D = { walkTo: y, focusTile: F }, $ = Zo(), Y = f($);
  return lr(Y, (O) => x(m, O), () => r(m)), lr($, (O) => x(g, O), () => r(g)), R(e, $), ft(D);
}
var eu = /* @__PURE__ */ N('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), tu = /* @__PURE__ */ N('<th class="num svelte-1v3p82v"> </th>'), nu = /* @__PURE__ */ N('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), ru = /* @__PURE__ */ N('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), au = /* @__PURE__ */ N('<td class="num svelte-1v3p82v"> </td>'), su = /* @__PURE__ */ N('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), iu = /* @__PURE__ */ N('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function lu(e, t) {
  dt(t, !0);
  let n = ae(t, "rows", 19, () => []), a = ae(t, "rules", 19, () => []), s = ae(t, "root", 3, null), i = ae(t, "selected", 3, null), l = ae(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ re(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const d = /* @__PURE__ */ re(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : Rs(a(), t.screen.toRule(w, s()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var p = pa(), h = st(p);
  {
    var v = (w) => {
      var c = iu(), _ = f(c), y = f(_), F = f(y);
      {
        var L = (z) => {
          var M = eu();
          R(z, M);
        };
        V(F, (z) => {
          r(u) && z(L);
        });
      }
      var D = b(F), $ = f(D), Y = b(D, 3);
      {
        var O = (z) => {
          var M = tu(), I = f(M);
          B(() => A(I, t.screen.heading[1])), R(z, M);
        };
        V(Y, (z) => {
          t.screen.heading[1] && z(O);
        });
      }
      var P = b(_);
      Ve(P, 23, n, (z) => z.key, (z, M, I) => {
        const U = /* @__PURE__ */ re(() => r(d).get(r(M).key));
        var le = su();
        let ue;
        var ie = f(le);
        {
          var Z = (Q) => {
            const _e = /* @__PURE__ */ re(() => l().has(r(M).key));
            var Se = nu(), ye = f(Se);
            let Le;
            var ce = f(ye);
            B(
              (de) => {
                Le = Me(ye, 1, "tick svelte-1v3p82v", null, Le, { on: r(_e) }), fe(ye, "aria-checked", r(_e)), fe(ye, "aria-label", `select ${de ?? ""}`), A(ce, r(_e) ? "✓" : "");
              },
              [() => o(r(M))]
            ), X("click", ye, (de) => {
              de.stopPropagation(), t.oncheck(r(M), r(I), de.shiftKey);
            }), R(Q, Se);
          };
          V(ie, (Q) => {
            r(u) && Q(Z);
          });
        }
        var he = b(ie), K = f(he);
        let J;
        var C = f(K), W = b(K), j = b(W);
        {
          var T = (Q) => {
            var _e = ru();
            R(Q, _e);
          };
          V(j, (Q) => {
            r(M).scope === "whole inventory" && Q(T);
          });
        }
        var k = b(he), S = f(k), H = b(k), te = f(H), ne = b(H);
        {
          var oe = (Q) => {
            var _e = au(), Se = f(_e);
            B(() => A(Se, r(M).detail ?? "")), R(Q, _e);
          };
          V(ne, (Q) => {
            t.screen.heading[1] && Q(oe);
          });
        }
        B(
          (Q, _e, Se) => {
            ue = Me(le, 1, "svelte-1v3p82v", null, ue, {
              picked: i() === r(M).key,
              clickable: t.screen.sheet !== !1
            }), J = Me(K, 1, "mark svelte-1v3p82v", null, J, {
              exclude: r(U) === "exclude",
              include: r(U) === "include"
            }), fe(K, "title", m[r(U)] ?? ""), A(C, g[r(U)] ?? ""), A(W, `${Q ?? ""} `), A(S, _e), A(te, Se);
          },
          [
            () => o(r(M)),
            () => Fe(r(M).paths),
            () => Pt(r(M).bytes)
          ]
        ), X("click", le, () => t.onpick(r(M))), R(z, le);
      }), B(() => A($, t.screen.heading[0] ?? "")), R(w, c);
    };
    V(h, (w) => {
      n().length && w(v);
    });
  }
  R(e, p), ft();
}
zt(["click"]);
var ou = /* @__PURE__ */ N('<button class="twisty svelte-pucy57"> </button>'), uu = /* @__PURE__ */ N('<span class="twisty leaf svelte-pucy57">·</span>'), cu = /* @__PURE__ */ N('<span class="name root svelte-pucy57"> </span>'), du = /* @__PURE__ */ N('<button class="name svelte-pucy57"> </button>'), fu = /* @__PURE__ */ N('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), hu = /* @__PURE__ */ N('<div class="note svelte-pucy57"> </div>'), vu = /* @__PURE__ */ N('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), pu = /* @__PURE__ */ N('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), gu = /* @__PURE__ */ N('<div class="tree svelte-pucy57"></div>');
function _u(e, t) {
  dt(t, !0);
  let n = ae(t, "version", 3, 0), a = ae(t, "excludedDirs", 19, () => []), s = ae(t, "selected", 3, null), i = ae(t, "busy", 3, !1), l = /* @__PURE__ */ G(Ne(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ G(Ne(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ G(Ne(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ G(Ne(/* @__PURE__ */ new Set()));
  async function g(c) {
    x(o, new Set(r(o)).add(c), !0);
    const _ = await t.onload(c), y = new Map(r(l)), F = new Set(r(d));
    _ ? (y.set(c, _), F.delete(c)) : F.add(c), x(l, y, !0), x(d, F, !0), x(o, new Set([...r(o)].filter((L) => L !== c)), !0);
  }
  function m(c) {
    if (r(u).has(c)) {
      x(u, new Set([...r(u)].filter((_) => _ !== c)), !0);
      return;
    }
    x(u, new Set(r(u)).add(c), !0), r(l).has(c) || g(c);
  }
  let p = -1;
  cn(() => {
    const c = n();
    if (c !== p) {
      p = c, r(u).has(t.root) || x(u, new Set(r(u)).add(t.root), !0);
      for (const _ of r(u)) g(_);
    }
  });
  const h = /* @__PURE__ */ re(() => {
    const c = [], _ = (D, $, Y, O, P, z) => {
      const M = r(l).get(D), I = r(u).has(D);
      if (c.push({
        key: D,
        name: $,
        depth: Y,
        paths: O,
        bytes: P,
        deeper: z,
        expanded: I,
        here: M?.here ?? null,
        truncated: !!M?.truncated,
        loading: r(o).has(D),
        failed: r(d).has(D),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: ba(a(), D)
      }), !(!I || !M))
        for (const U of M.children)
          _(U.path, U.name, Y + 1, U.paths, U.bytes, U.deeper);
    }, y = r(l).get(t.root), F = y ? y.children.reduce((D, $) => D + $.paths, 0) + y.here.paths : 0, L = y ? y.children.reduce((D, $) => D + $.bytes, 0) + y.here.bytes : 0;
    return _(t.root, t.root, 0, F, L, !0), c;
  }), v = 8;
  var w = gu();
  Ve(w, 21, () => r(h), (c) => c.key, (c, _) => {
    var y = pu(), F = st(y);
    let L;
    var D = f(F);
    let $;
    var Y = b(D, 2);
    {
      var O = (j) => {
        var T = ou(), k = f(T);
        B(() => {
          fe(T, "aria-expanded", r(_).expanded), fe(T, "aria-label", `${r(_).expanded ? "collapse" : "expand"} ${r(_).name ?? ""}`), fe(T, "title", r(_).expanded ? "collapse" : "expand"), A(k, r(_).loading ? "·" : r(_).expanded ? "▾" : "▸");
        }), X("click", T, () => m(r(_).key)), R(j, T);
      }, P = (j) => {
        var T = uu();
        R(j, T);
      };
      V(Y, (j) => {
        r(_).deeper ? j(O) : j(P, -1);
      });
    }
    var z = b(Y, 2);
    {
      var M = (j) => {
        var T = cu(), k = f(T);
        B(() => A(k, r(_).key)), R(j, T);
      }, I = (j) => {
        var T = du(), k = f(T);
        B(() => {
          fe(T, "title", `Show every kept file under ${r(_).key ?? ""}`), A(k, r(_).name);
        }), X("click", T, () => t.onpick(r(_))), R(j, T);
      };
      V(z, (j) => {
        r(_).depth === 0 ? j(M) : j(I, -1);
      });
    }
    var U = b(z, 2), le = f(U), ue = b(U, 2), ie = f(ue), Z = b(ue, 2), he = b(F, 2);
    {
      var K = (j) => {
        var T = fu();
        let k;
        B((S) => k = Wt(T, "", k, S), [
          () => ({
            "padding-left": `${Math.min(r(_).depth, v) * 11 + 18}px`
          })
        ]), R(j, T);
      }, J = (j) => {
        var T = hu();
        let k;
        var S = f(T);
        B(
          (H, te, ne) => {
            k = Wt(T, "", k, H), A(S, `${te ?? ""} directly here · ${ne ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(_).depth, v) * 11 + 18}px`
            }),
            () => Fe(r(_).here.paths),
            () => Pt(r(_).here.bytes)
          ]
        ), R(j, T);
      };
      V(he, (j) => {
        r(_).expanded && r(_).failed ? j(K) : r(_).expanded && r(_).here && r(_).here.paths > 0 && j(J, 1);
      });
    }
    var C = b(he, 2);
    {
      var W = (j) => {
        var T = vu();
        let k;
        B((S) => k = Wt(T, "", k, S), [
          () => ({
            "padding-left": `${Math.min(r(_).depth, v) * 11 + 18}px`
          })
        ]), R(j, T);
      };
      V(C, (j) => {
        r(_).truncated && j(W);
      });
    }
    B(
      (j, T, k) => {
        L = Me(F, 1, "row svelte-pucy57", null, L, {
          picked: s() === r(_).key,
          gone: r(_).excluded
        }), $ = Wt(D, "", $, j), A(le, T), A(ie, k), Z.disabled = i() || r(_).excluded || r(_).depth === 0, fe(Z, "title", r(_).depth === 0 ? "The library root is not excludable from here." : r(_).excluded ? "already excluded" : `Exclude everything under ${r(_).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(_).depth, v) * 11}px` }),
        () => Fe(r(_).paths),
        () => Pt(r(_).bytes)
      ]
    ), X("click", Z, () => t.onexclude(r(_))), R(c, y);
  }), R(e, w), ft();
}
zt(["click"]);
var bu = /* @__PURE__ */ N('<button title="Back to its default">↺</button>'), mu = /* @__PURE__ */ N('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), wu = /* @__PURE__ */ N('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), yu = /* @__PURE__ */ N('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), xu = /* @__PURE__ */ N('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), ku = /* @__PURE__ */ N('<li><code class="svelte-1hh0fwb"> </code> </li>'), Su = /* @__PURE__ */ N(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), Eu = /* @__PURE__ */ N('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function Tu(e, t) {
  dt(t, !0);
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
        ["headerSide", "Sides", 0, (I) => Math.floor(I / 2), 1],
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
  let u = /* @__PURE__ */ G(Ne(Dl())), o = /* @__PURE__ */ G(!0), d = /* @__PURE__ */ G(!1), g = /* @__PURE__ */ G(Ne(Fs())), m = /* @__PURE__ */ G(Ne(window.innerWidth));
  const p = (I) => r(g) === "light" ? I.light : I.dark, h = (I) => I in pn ? pn : sn, v = (I) => `rgba(${I.r}, ${I.g}, ${I.b}, ${I.a})`, w = /* @__PURE__ */ re(() => JSON.stringify(r(u), null, 2));
  Yn(() => {
    const I = localStorage.getItem(n);
    if (I)
      try {
        x(u, qr(JSON.parse(I)), !0);
        return;
      } catch {
      }
    ma();
  });
  function c(I) {
    x(u, qr({ ...r(u), ...I }), !0), localStorage.setItem(n, JSON.stringify(r(u))), x(d, !1);
  }
  function _(I) {
    x(u, qr(I), !0), localStorage.setItem(n, JSON.stringify(r(u))), x(d, !1);
  }
  function y(I) {
    c({ [I]: h(I)[I] });
  }
  function F() {
    x(g, zs(r(g) === "dark" ? "light" : "dark"), !0);
  }
  async function L() {
    await navigator.clipboard.writeText(r(w)), x(d, !0);
  }
  var D = Eu();
  let $;
  var Y = f(D), O = b(f(Y), 4), P = f(O), z = b(Y, 2);
  {
    var M = (I) => {
      var U = Su();
      {
        const ye = (ce, de = _r, Ae = _r, xe = _r) => {
          var Ie = bu();
          let Je;
          B(() => {
            Je = Me(Ie, 1, "undo svelte-1hh0fwb", null, Je, { idle: !Ae() }), fe(Ie, "aria-label", `Reset ${de() ?? ""}`);
          }), X("click", Ie, function(...lt) {
            xe()?.apply(this, lt);
          }), R(ce, Ie);
        };
        var le = b(f(U), 2);
        Ve(le, 17, () => a, yt, (ce, de) => {
          var Ae = wu(), xe = f(Ae), Ie = f(xe), Je = b(xe, 2), lt = f(Je), ht = b(Je, 2);
          Ve(ht, 17, () => r(de).rows, yt, (qt, Kt) => {
            var vt = /* @__PURE__ */ re(() => zr(r(Kt), 5));
            let et = () => r(vt)[0], ot = () => r(vt)[1], q = () => r(vt)[2], se = () => r(vt)[3], we = () => r(vt)[4];
            const Pe = /* @__PURE__ */ re(() => r(u)[et()] !== h(et())[et()]), ke = /* @__PURE__ */ re(() => typeof se() == "function" ? se()(r(m)) : se());
            var be = mu();
            let Ee;
            var We = f(be), tt = f(We), me = b(We, 2), De = b(me, 2), pt = b(De, 2);
            ye(pt, ot, () => r(Pe), () => () => y(et())), B(() => {
              Ee = Me(be, 1, "row svelte-1hh0fwb", null, Ee, { moved: r(Pe) }), A(tt, ot()), fe(me, "min", q()), fe(me, "max", r(ke)), fe(me, "step", we()), fe(me, "aria-label", ot()), vn(me, r(u)[et()]), fe(De, "min", q()), fe(De, "max", r(ke)), fe(De, "step", we()), fe(De, "aria-label", `${ot() ?? ""} value`), vn(De, r(u)[et()]);
            }), X("input", me, (Ge) => c({ [et()]: Number(Ge.currentTarget.value) })), X("input", De, (Ge) => c({ [et()]: Number(Ge.currentTarget.value) })), R(qt, be);
          }), B(() => {
            A(Ie, r(de).title), A(lt, r(de).note);
          }), R(ce, Ae);
        });
        var ue = b(le, 2), ie = f(ue), Z = b(ue, 2), he = f(Z), K = b(Z, 2);
        Ve(K, 17, () => Ll, yt, (ce, de) => {
          const Ae = /* @__PURE__ */ re(() => p(r(de))), xe = /* @__PURE__ */ re(() => r(u)[r(Ae)]), Ie = /* @__PURE__ */ re(() => r(de).base[r(Ae)]);
          var Je = xu(), lt = f(Je), ht = f(lt), qt = b(ht), Kt = f(qt), vt = b(lt, 2), et = f(vt), ot = b(vt, 2);
          Ve(ot, 17, () => i, yt, (Pe, ke) => {
            var be = /* @__PURE__ */ re(() => zr(r(ke), 3));
            let Ee = () => r(be)[0], We = () => r(be)[1], tt = () => r(be)[2];
            const me = /* @__PURE__ */ re(() => r(xe)[Ee()] !== r(Ie)[Ee()]);
            var De = yu();
            let pt;
            var Ge = f(De), Vn = f(Ge), Et = b(Ge, 2), Lt = b(Et, 2), Tn = b(Lt, 2);
            ye(Tn, We, () => r(me), () => () => c({
              [r(Ae)]: { ...r(xe), [Ee()]: r(Ie)[Ee()] }
            })), B(() => {
              pt = Me(De, 1, "row svelte-1hh0fwb", null, pt, { moved: r(me) }), A(Vn, We()), fe(Et, "max", tt()), fe(Et, "step", tt() === 1 ? 0.01 : 1), fe(Et, "aria-label", `${r(g) ?? ""} ${s[r(de).dark].title ?? ""} ${We() ?? ""}`), vn(Et, r(xe)[Ee()]), fe(Lt, "max", tt()), fe(Lt, "step", tt() === 1 ? 0.01 : 1), fe(Lt, "aria-label", `${r(g) ?? ""} ${s[r(de).dark].title ?? ""} ${We() ?? ""} value`), vn(Lt, r(xe)[Ee()]);
            }), X("input", Et, (fn) => c({
              [r(Ae)]: {
                ...r(xe),
                [Ee()]: Number(fn.currentTarget.value)
              }
            })), X("input", Lt, (fn) => c({
              [r(Ae)]: {
                ...r(xe),
                [Ee()]: Number(fn.currentTarget.value)
              }
            })), R(Pe, De);
          });
          var q = b(ot, 2);
          let se;
          var we = f(q);
          B(
            (Pe, ke) => {
              A(ht, `${s[r(de).dark].title ?? ""} `), A(Kt, r(g)), A(et, s[r(de).dark].note), se = Wt(q, "", se, Pe), A(we, ke);
            },
            [
              () => ({ background: v(r(xe)) }),
              () => v(r(xe))
            ]
          ), R(ce, Je);
        });
        var J = b(K, 2), C = b(f(J), 4);
        let Le;
        var W = f(C), j = f(W), T = b(W, 2);
        ye(T, () => "Blur at the edge", () => r(u).blurEdge !== pn.blurEdge, () => () => y("blurEdge"));
        var k = b(J, 2), S = b(f(k), 4);
        Ve(S, 21, () => l, yt, (ce, de) => {
          var Ae = /* @__PURE__ */ re(() => zr(r(de), 2));
          let xe = () => r(Ae)[0], Ie = () => r(Ae)[1];
          var Je = ku(), lt = f(Je), ht = f(lt), qt = b(lt);
          B(() => {
            A(ht, xe()), A(qt, ` — ${Ie() ?? ""}`);
          }), R(ce, Je);
        });
        var H = b(k, 2), te = b(f(H), 4), ne = f(te), oe = b(ne, 2), Q = b(oe, 2), _e = f(Q), Se = b(te, 2);
        B(() => {
          A(ie, `The five colours below are per theme, and you are editing the ${r(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), A(he, `Edit the ${r(g) === "dark" ? "light" : "dark"} colours`), Le = Me(C, 1, "row toggle svelte-1hh0fwb", null, Le, { moved: r(u).blurEdge !== pn.blurEdge }), ml(j, r(u).blurEdge), A(_e, r(d) ? "Copied" : "Copy"), vn(Se, r(w));
        }), X("click", Z, F), X("change", j, (ce) => c({ blurEdge: ce.currentTarget.checked })), X("click", ne, () => _(sn)), X("click", oe, () => _(pn)), X("click", Q, L);
      }
      R(I, U);
    };
    V(z, (I) => {
      r(o) && I(M);
    });
  }
  B(() => {
    $ = Me(D, 1, "tuner svelte-1hh0fwb", null, $, { folded: !r(o) }), fe(O, "title", r(o) ? "Fold away" : "Open"), A(P, r(o) ? "–" : "+");
  }), xl("innerWidth", (I) => x(m, I, !0)), X("click", O, () => x(o, !r(o))), R(e, D), ft();
}
zt(["click", "input", "change"]);
function Gr(e, t, n, a) {
  const s = e + t;
  return s < 0 || s >= n && a ? null : s;
}
var Mu = /* @__PURE__ */ N('<button><span class="n svelte-1n46o8q"> </span> </button>'), Au = /* @__PURE__ */ N('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), Ru = /* @__PURE__ */ N('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), Pu = /* @__PURE__ */ N('<div class="muted pad svelte-1n46o8q">loading…</div>'), Cu = /* @__PURE__ */ N('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), Ou = /* @__PURE__ */ N('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), Nu = /* @__PURE__ */ N('<p class="blurb"> </p>'), Iu = /* @__PURE__ */ N('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), Fu = /* @__PURE__ */ N('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), zu = /* @__PURE__ */ N('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), Lu = /* @__PURE__ */ N('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), Du = /* @__PURE__ */ N("<div> </div>"), ju = /* @__PURE__ */ N('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function Hu(e, t) {
  dt(t, !0);
  const n = location.pathname === "/tune";
  let a = /* @__PURE__ */ G("grid"), s = /* @__PURE__ */ G(0), i = /* @__PURE__ */ G(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ G(Ne([])), u = /* @__PURE__ */ G(null), o = /* @__PURE__ */ G(null), d = /* @__PURE__ */ G(Ne(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ G(null), m = /* @__PURE__ */ G(null), p = /* @__PURE__ */ G(null), h = /* @__PURE__ */ G(null), v = /* @__PURE__ */ G(!1), w = /* @__PURE__ */ G(!1), c = /* @__PURE__ */ G(!1), _ = /* @__PURE__ */ G(!1), y = /* @__PURE__ */ G(Ne({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), F = /* @__PURE__ */ G(null), L = /* @__PURE__ */ G(0), D = /* @__PURE__ */ G(null), $ = /* @__PURE__ */ G(Ne({})), Y = /* @__PURE__ */ G("newest"), O = /* @__PURE__ */ G(Ne(Xl())), P = /* @__PURE__ */ G(null), z = /* @__PURE__ */ G(null);
  const M = /* @__PURE__ */ re(() => Fa[r(s)]), I = /* @__PURE__ */ re(() => r(M).table !== !1), U = /* @__PURE__ */ re(() => r(I) || r(M).tree === !0), le = /* @__PURE__ */ re(() => r(M).sheet !== !1 && (r(o) !== null || !r(U))), ue = /* @__PURE__ */ re(() => ({
    sort: r(Y),
    ...r(O).on ? { stack: r(O).window } : {},
    ...Object.fromEntries(Object.entries(r($)).filter(([, E]) => E.length > 0))
  })), ie = /* @__PURE__ */ re(() => r(a) === "grid" ? `grid:${JSON.stringify(r(ue))}` : `triage:${r(s)}:${JSON.stringify(r(o))}`), Z = /* @__PURE__ */ re(() => r(M).rule === !1 || r(d).size === 0 ? [] : r(l).filter((E) => r(d).has(E.key)).map((E) => r(M).toRule(E, r(i))).filter((E) => E && Rs(r(m)?.rules ?? [], E) !== "exclude")), he = /* @__PURE__ */ re(() => (r(m)?.rules ?? []).filter((E) => E.decision === "exclude" && E.term?.column === "dir_under").map((E) => String(E.term.value).replace(/[\\/]+$/, "").toLowerCase())), K = El();
  function J(E) {
    x(F, String(E), !0);
  }
  async function C(E) {
    try {
      return x(F, null), await E();
    } catch (ee) {
      return J(ee), null;
    }
  }
  const W = Tl(
    () => {
      x(w, !0), C(async () => {
        const E = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: ee, value: Te } = await K(() => je.counts(r(o), E));
        ee || x(m, Te, !0);
      }).finally(() => {
        x(w, !1);
      });
    },
    220
  );
  async function j() {
    x(p, "loading");
    const E = await C(() => je.files());
    x(p, E, !0), x(v, !1), x(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function T(E = !1) {
    if (r(a) !== "triage" || !r(I)) {
      x(l, [], !0);
      return;
    }
    x(_, !0);
    const ee = r(M).name === "source_folder" && r(i) ? { root: r(i) } : {};
    E && (ee.live = "1");
    const Te = await C(() => je.screen(r(M).name, ee));
    x(l, Te?.rows ?? [], !0), x(_, !1);
  }
  let k = !1;
  cn(() => {
    r(s), r(a), dn(() => {
      x(u, null), x(o, null), x(i, null), ne(), r(a) === "triage" && (T(), W.now(), k || (k = !0, j()));
    });
  }), cn(() => {
    r(i), dn(() => {
      r(a) === "triage" && (ne(), T());
    });
  }), Yn(() => {
    C(async () => {
      x(D, await je.facets(), !0);
    });
  });
  function S(E, ee) {
    x($, { ...r($), [E]: ee }, !0);
  }
  function H(E) {
    if (r(M).sheet !== !1) {
      if (r(M).drill && !r(i)) {
        x(u, E.key, !0), x(
          o,
          {
            ...r(M).toRule(E, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), x(i, E.key, !0);
        return;
      }
      x(u, E.key, !0), x(
        o,
        {
          ...r(M).toRule(E, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), W();
    }
  }
  function te(E, ee, Te) {
    const ze = new Set(r(d)), Ye = !ze.has(E.key), _t = Te && r(g) !== null ? r(l).findIndex((Mt) => Mt.key === r(g)) : -1, [Jt, Zt] = _t < 0 ? [ee, ee] : _t < ee ? [_t, ee] : [ee, _t];
    for (let Mt = Jt; Mt <= Zt; Mt++)
      Ye ? ze.add(r(l)[Mt].key) : ze.delete(r(l)[Mt].key);
    x(d, ze, !0), x(g, E.key, !0);
  }
  function ne() {
    x(d, /* @__PURE__ */ new Set(), !0), x(g, null);
  }
  function oe(E) {
    x(o, E, !0), x(
      u,
      null
      // it no longer corresponds to a row
    ), W();
  }
  function Q(E = !1) {
    x(o, null), x(u, null), E && x(i, null), W.now();
  }
  async function _e() {
    x(
      v,
      !0
      // the distinct-content number now says so on its face
    ), qi(L), await T(), W.now();
  }
  async function Se() {
    if (!r(o)) return;
    x(c, !0);
    const E = r(o).at === "end" ? void 0 : 0, ee = await C(() => je.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(M).id} ${r(M).title}`
      },
      E
    ));
    x(c, !1), ee && (x(o, null), x(u, null), await _e());
  }
  async function ye() {
    const E = r(Z);
    if (!E.length) {
      ne();
      return;
    }
    x(c, !0);
    for (const ee of E)
      if (!await C(() => je.addRule({
        column: ee.column,
        op: ee.op,
        value: ee.value,
        decision: "exclude",
        note: `screen ${r(M).id} ${r(M).title}`
      }))) break;
    x(c, !1), ne(), x(o, null), x(u, null), await _e();
  }
  async function Le(E) {
    if (!E || ba(r(he), E)) return;
    x(c, !0);
    const ee = await C(() => je.addRule({
      column: "dir_under",
      op: "=",
      value: E,
      decision: "exclude",
      note: `screen ${r(M).id} ${r(M).title}`
    }));
    x(c, !1), ee && await _e();
  }
  const ce = (E) => Le(As(E.p ?? "")), de = (E) => Le(E.key);
  async function Ae(E) {
    x(c, !0), await C(() => je.deleteRule(E.id)), x(c, !1), await _e();
  }
  async function xe(E, ee) {
    x(c, !0), await C(() => je.moveRule(E.id, ee)), x(c, !1), await _e();
  }
  async function Ie() {
    await C(async () => {
      x(D, await je.facets(), !0);
    });
  }
  async function Je(E, ee) {
    const Te = await C(() => je.override(E.s, ee));
    return Te ? (x(v, !0), W(), Te.decision) : E.o ?? null;
  }
  function lt(E) {
    return r(a) === "grid" ? je.photos({ limit: 500, ...r(ue), ...E || {} }) : je.page(r(o), E);
  }
  const ht = (E) => E.m ?? [{ id: E.id, s: E.s, w: E.w, h: E.h }];
  function qt(E, ee, Te) {
    if (r(a) === "grid") {
      x(
        P,
        {
          frames: ht(E),
          origin: ee.getBoundingClientRect(),
          at: Te
        },
        !0
      );
      return;
    }
    C(() => je.revealOrigin(E.id));
  }
  const Kt = /* @__PURE__ */ re(() => r(P) !== null && Gr(r(P).at, -1, r(y).count, r(y).exhausted) !== null), vt = /* @__PURE__ */ re(() => r(P) !== null && Gr(r(P).at, 1, r(y).count, r(y).exhausted) !== null), et = 120;
  let ot = !1, q = 0;
  async function se(E, ee = !1) {
    const Te = performance.now();
    if (!r(P) || ot || ee && Te - q < et) return;
    const ze = Gr(r(P).at, E, r(y).count, r(y).exhausted);
    if (ze !== null) {
      q = Te, ot = !0;
      try {
        const Ye = await r(z)?.walkTo(ze);
        if (!Ye || !r(P)) return;
        x(
          P,
          {
            frames: ht(Ye.item),
            origin: Ye.tile.getBoundingClientRect(),
            at: ze
          },
          !0
        );
      } finally {
        ot = !1;
      }
    }
  }
  async function we() {
    const E = r(P)?.at ?? null;
    x(P, null), await el(), E !== null && r(z)?.focusTile(E);
  }
  function Pe(E) {
    we(), C(() => je.revealPhoto(E.id));
  }
  var ke = ju(), be = st(ke);
  {
    var Ee = (E) => {
      ho(E, {
        get facets() {
          return r(D);
        },
        get selected() {
          return r($);
        },
        get sort() {
          return r(Y);
        },
        get stacking() {
          return r(O);
        },
        get total() {
          return r(y).total;
        },
        get tiles() {
          return r(y).tiles;
        },
        get loading() {
          return r(y).loading;
        },
        onselect: S,
        onsort: (ee) => x(Y, ee, !0),
        onstack: (ee) => x(O, Kl(ee), !0),
        onclear: () => x($, {}, !0),
        ontriage: () => x(a, "triage")
      });
    };
    V(be, (E) => {
      r(a) === "grid" && E(Ee);
    });
  }
  var We = b(be, 2);
  {
    var tt = (E) => {
      Tu(E, {});
    };
    V(We, (E) => {
      n && E(tt);
    });
  }
  var me = b(We, 2);
  let De;
  var pt = f(me);
  {
    var Ge = (E) => {
      var ee = Ou(), Te = f(ee), ze = f(Te), Ye = b(Te, 2);
      Ve(Ye, 21, () => Fa, yt, (nt, At, Qt) => {
        var en = Mu();
        let An;
        var Rn = f(en), Re = f(Rn), rt = b(Rn, 1, !0);
        B(() => {
          An = Me(en, 1, "nav svelte-1n46o8q", null, An, { on: Qt === r(s) }), A(Re, r(At).id), A(rt, r(At).title);
        }), X("click", en, () => x(s, Qt, !0)), R(nt, en);
      });
      var _t = b(Ye, 2);
      {
        var Jt = (nt) => {
          var At = Cu(), Qt = st(At), en = f(Qt);
          {
            var An = (Xe) => {
              var Ze = Au(), Pn = st(Ze), Xn = /* @__PURE__ */ re(() => Q.bind(null, !0)), Nr = b(Pn, 2), Ir = f(Nr);
              B(() => A(Ir, `inside ${r(i) ?? ""}`)), X("click", Pn, function(...Fr) {
                r(Xn)?.apply(this, Fr);
              }), R(Xe, Ze);
            }, Rn = (Xe) => {
              var Ze = Ru(), Pn = f(Ze);
              B(() => A(Pn, r(M).relive)), X("click", Ze, () => T(!0)), R(Xe, Ze);
            };
            V(en, (Xe) => {
              r(M).drill && r(i) ? Xe(An) : r(M).relive && Xe(Rn, 1);
            });
          }
          var Re = b(Qt, 2);
          {
            var rt = (Xe) => {
              var Ze = Pu();
              R(Xe, Ze);
            };
            V(Re, (Xe) => {
              r(_) && Xe(rt);
            });
          }
          var tn = b(Re, 2);
          {
            let Xe = /* @__PURE__ */ re(() => r(m)?.rules ?? []);
            lu(tn, {
              get rows() {
                return r(l);
              },
              get screen() {
                return r(M);
              },
              get root() {
                return r(i);
              },
              get checked() {
                return r(d);
              },
              get rules() {
                return r(Xe);
              },
              get selected() {
                return r(u);
              },
              onpick: H,
              oncheck: te
            });
          }
          R(nt, At);
        };
        V(_t, (nt) => {
          r(I) && nt(Jt);
        });
      }
      var Zt = b(_t, 2);
      {
        var Mt = (nt) => {
          _u(nt, {
            get root() {
              return $n;
            },
            get version() {
              return r(L);
            },
            get excludedDirs() {
              return r(he);
            },
            get selected() {
              return r(u);
            },
            get busy() {
              return r(c);
            },
            onload: (At) => C(() => je.tree(At)),
            onpick: H,
            onexclude: de
          });
        };
        V(Zt, (nt) => {
          r(M).tree && nt(Mt);
        });
      }
      var fr = b(Zt, 2);
      {
        let nt = /* @__PURE__ */ re(() => r(m)?.rules ?? []), At = /* @__PURE__ */ re(() => r(m)?.unmatched ?? null);
        Go(fr, {
          get rules() {
            return r(nt);
          },
          get unmatched() {
            return r(At);
          },
          get busy() {
            return r(c);
          },
          ondelete: Ae,
          onmove: xe
        });
      }
      var hr = b(fr, 2);
      Fo(hr, { oncomplete: Ie }), X("click", ze, () => x(a, "grid")), R(E, ee);
    };
    V(pt, (E) => {
      r(a) === "triage" && E(Ge);
    });
  }
  var Vn = b(pt, 2), Et = f(Vn);
  {
    var Lt = (E) => {
      var ee = Lu(), Te = st(ee), ze = f(Te), Ye = b(Te, 2), _t = f(Ye), Jt = b(Ye, 2);
      {
        var Zt = (Re) => {
          var rt = Nu(), tn = f(rt);
          B(() => A(tn, r(M).note)), R(Re, rt);
        };
        V(Jt, (Re) => {
          r(M).note && Re(Zt);
        });
      }
      var Mt = b(Jt, 2);
      {
        var fr = (Re) => {
          Eo(Re, {
            get screen() {
              return r(M);
            }
          });
        };
        V(Mt, (Re) => {
          r(M).name === "dimensions" && Re(fr);
        });
      }
      var hr = b(Mt, 2);
      zl(hr, {
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
          return r(w);
        },
        onfiles: j
      });
      var nt = b(hr, 2);
      {
        var At = (Re) => {
          var rt = Iu(), tn = f(rt), Xe = f(tn), Ze = b(tn, 2), Pn = f(Ze), Xn = b(Ze, 2), Nr = b(Xn, 2), Ir = f(Nr);
          {
            var Fr = (nn) => {
              var Cn = Fn("already excluded — nothing left to write");
              R(nn, Cn);
            }, Ls = (nn) => {
              var Cn = Fn();
              B((Ds) => A(Cn, `one exclude rule each, at the end of the order${Ds ?? ""}`), [
                () => r(Z).length < r(d).size ? ` · ${Fe(r(d).size - r(Z).length)} already excluded, skipped` : ""
              ]), R(nn, Cn);
            };
            V(Ir, (nn) => {
              r(Z).length ? nn(Ls, -1) : nn(Fr);
            });
          }
          B(
            (nn, Cn) => {
              A(Xe, `${nn ?? ""} ticked`), Ze.disabled = r(c) || !r(Z).length, A(Pn, Cn), Xn.disabled = r(c);
            },
            [
              () => Fe(r(d).size),
              () => r(c) ? "saving…" : `Exclude ${Fe(r(Z).length)}`
            ]
          ), X("click", Ze, ye), X("click", Xn, ne), R(Re, rt);
        };
        V(nt, (Re) => {
          r(d).size && Re(At);
        });
      }
      var Qt = b(nt, 2);
      qo(Qt, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(M);
        },
        get saving() {
          return r(c);
        },
        onedit: oe,
        onconfirm: Se,
        onclear: Q
      });
      var en = b(Qt, 2);
      {
        var An = (Re) => {
          var rt = Fu(), tn = f(rt);
          B((Xe, Ze) => A(tn, `${Xe ?? ""}${Ze ?? ""} loaded${r(y).exhausted ? " · all of them" : ""}${r(y).loading ? " · loading…" : ""} `), [
            () => Fe(r(y).count),
            () => r(y).total ? " of " + Fe(r(y).total) : ""
          ]), R(Re, rt);
        }, Rn = (Re) => {
          var rt = zu();
          R(Re, rt);
        };
        V(en, (Re) => {
          r(le) ? Re(An) : r(M).sheet === !1 && Re(Rn, 1);
        });
      }
      B(() => {
        A(ze, `${r(M).id ?? ""} · ${r(M).title ?? ""}`), A(_t, r(M).blurb);
      }), R(E, ee);
    };
    V(Et, (E) => {
      r(a) === "triage" && E(Lt);
    });
  }
  var Tn = b(Et, 2);
  {
    var fn = (E) => {
      {
        let ee = /* @__PURE__ */ re(() => r(a) === "grid" ? null : r(m)?.page_paths ?? null), Te = /* @__PURE__ */ re(() => r(a) === "triage");
        lr(
          Qo(E, {
            get key() {
              return r(ie);
            },
            fetchPage: lt,
            get total() {
              return r(ee);
            },
            get triage() {
              return r(Te);
            },
            get excludedDirs() {
              return r(he);
            },
            onActivate: qt,
            onOverride: Je,
            onExcludeFolder: ce,
            onState: (ze) => x(y, { ...r(y), ...ze }, !0)
          }),
          (ze) => x(z, ze, !0),
          () => r(z)
        );
      }
    };
    V(Tn, (E) => {
      (r(le) || r(a) === "grid") && E(fn);
    });
  }
  var dr = b(me, 2);
  {
    var Tt = (E) => {
      mo(E, {
        get frames() {
          return r(P).frames;
        },
        get origin() {
          return r(P).origin;
        },
        get back() {
          return r(Kt);
        },
        get forward() {
          return r(vt);
        },
        onstep: se,
        onreveal: Pe,
        onclose: we
      });
    };
    V(dr, (E) => {
      r(P) && E(Tt);
    });
  }
  var gt = b(dr, 2);
  {
    var Mn = (E) => {
      var ee = Du();
      let Te;
      var ze = f(ee);
      B(() => {
        Te = Me(ee, 1, "status", null, Te, { bare: r(a) === "grid" }), A(ze, r(F));
      }), R(E, ee);
    };
    V(gt, (E) => {
      r(F) && E(Mn);
    });
  }
  B(() => De = Me(me, 1, "shell", null, De, { bare: r(a) === "grid" })), R(e, ke), ft();
}
zt(["click"]);
Jl();
ma();
ll(Hu, { target: document.getElementById("app") });
