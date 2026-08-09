var cs = Array.isArray, Wa = Array.prototype.indexOf, Sr = Array.prototype.includes, Ir = Array.from, Ga = Object.defineProperty, Bn = Object.getOwnPropertyDescriptor, $a = Object.getOwnPropertyDescriptors, Ya = Object.prototype, Va = Array.prototype, Vs = Object.getPrototypeOf, Es = Object.isExtensible;
const yr = () => {
};
function Ka(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Ks() {
  var e, t, n = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
function qr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const s of e)
    if (n.push(s), n.length === t) break;
  return n;
}
const Ue = 2, Wn = 4, zr = 8, Xs = 1 << 24, Nt = 16, St = 32, tn = 64, Zr = 128, kt = 512, He = 1024, qe = 2048, Ft = 4096, rt = 8192, ft = 16384, Xn = 32768, Qr = 1 << 25, Gn = 65536, Er = 1 << 17, Xa = 1 << 18, Jn = 1 << 19, Ja = 1 << 20, Ht = 1 << 25, On = 65536, Tr = 1 << 21, Un = 1 << 22, bn = 1 << 23, An = Symbol("$state"), Za = Symbol("legacy props"), Qa = Symbol(""), Js = Symbol("attributes"), es = Symbol("class"), ts = Symbol("style"), ns = Symbol("text"), vr = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), ei = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function ti(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function ni() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function ri(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function si(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ai() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ii(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function li() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function oi(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function ui() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ci() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function di() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function fi() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const hi = 1, vi = 2, Zs = 4, pi = 8, gi = 16, _i = 1, bi = 4, mi = 8, wi = 16, yi = 1, xi = 2, je = Symbol("uninitialized"), ki = "http://www.w3.org/1999/xhtml";
function Si() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Ei() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ti() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Qs(e) {
  return e === this.v;
}
function Mi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ea(e) {
  return !Mi(e, this.v);
}
let Je = null;
function $n(e) {
  Je = e;
}
function ht(e, t = !1, n) {
  Je = {
    p: Je,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      pe
    ),
    l: null
  };
}
function vt(e) {
  var t = (
    /** @type {ComponentContext} */
    Je
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var s of n)
      ma(s);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Je = t.p, e ?? /** @type {T} */
  {};
}
function ta() {
  return !0;
}
let En = [];
function na() {
  var e = En;
  En = [], Ka(e);
}
function Jt(e) {
  if (En.length === 0 && !ur) {
    var t = En;
    queueMicrotask(() => {
      t === En && na();
    });
  }
  En.push(e);
}
function Ai() {
  for (; En.length > 0; )
    na();
}
function ra(e) {
  var t = pe;
  if (t === null)
    return _e.f |= bn, e;
  if ((t.f & Xn) === 0 && (t.f & Wn) === 0)
    throw e;
  gn(e, t);
}
function gn(e, t) {
  if (!(t !== null && (t.f & ft) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & Zr) !== 0) {
        if ((t.f & Xn) === 0)
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
const Ri = -7169;
function Ie(e, t) {
  e.f = e.f & Ri | t;
}
function ds(e) {
  (e.f & kt) !== 0 || e.deps === null ? Ie(e, He) : Ie(e, Ft);
}
function sa(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Ue) === 0 || (t.f & On) === 0 || (t.f ^= On, sa(
        /** @type {Derived} */
        t.deps
      ));
}
function aa(e, t, n) {
  (e.f & qe) !== 0 ? t.add(e) : (e.f & Ft) !== 0 && n.add(e), sa(e.deps), Ie(e, He);
}
let br = !1;
function Pi(e) {
  var t = br;
  try {
    return br = !1, [e(), br];
  } finally {
    br = t;
  }
}
function Ci(e, t, n, s = !0) {
  s && n();
  for (var a of t)
    e.addEventListener(a, n);
  Fr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function Zn(e) {
  var t = _e, n = pe;
  Et(null), Ut(null);
  try {
    return e();
  } finally {
    Et(t), Ut(n);
  }
}
function Oi(e) {
  let t = 0, n = Nn(0), s;
  return () => {
    ps() && (r(n), wa(() => (t === 0 && (s = en(() => e(() => cr(n)))), t += 1, () => {
      Jt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, cr(n));
      });
    })));
  };
}
var Ni = Gn | Jn;
function Ii(e, t, n, s) {
  new zi(e, t, n, s);
}
class zi {
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
  #s;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #o = null;
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
  #b = Oi(() => (this.#d = Nn(this.#p), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, s, a) {
    this.#e = t, this.#t = n, this.#l = (i) => {
      var l = (
        /** @type {Effect} */
        pe
      );
      l.b = this, l.f |= Zr, s(i);
    }, this.parent = /** @type {Effect} */
    pe.b, this.transform_error = a ?? this.parent?.transform_error ?? ((i) => i), this.#s = _s(() => {
      this.#h();
    }, Ni);
  }
  #_() {
    try {
      this.#i = yt(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#t.failed, { reset: s, invoke_onerror: a } = this.#m(t);
    Jt(a), n && (this.#o = yt(() => {
      n(
        this.#e,
        () => t,
        () => s
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
    var n = !1, s = !1;
    const a = () => {
      if (n) {
        Ti();
        return;
      }
      n = !0, s && fi(), this.#o !== null && Pn(this.#o, () => {
        this.#o = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: a, invoke_onerror: () => {
      try {
        s = !0, this.#t.onerror?.(t, a), s = !1;
      } catch (l) {
        gn(l, this.#s && this.#s.parent);
      }
    } };
  }
  #x() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#n = yt(() => t(this.#e)), Jt(() => {
      var n = this.#a = document.createDocumentFragment(), s = Qt();
      n.append(s), this.#i = this.#v(() => yt(() => this.#l(s))), this.#u === 0 && (this.#e.before(n), this.#a = null, Pn(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#p = 0, this.#i = yt(() => {
        this.#l(this.#e);
      }), this.#u > 0) {
        var t = this.#a = document.createDocumentFragment();
        ms(this.#i, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#n = yt(() => n(this.#e));
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
    aa(t, this.#f, this.#g);
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
    var n = pe, s = _e, a = Je;
    Ut(this.#s), Et(this.#s), $n(this.#s.ctx);
    try {
      return wn.ensure(), t();
    } catch (i) {
      return ra(i), null;
    } finally {
      Ut(n), Et(s), $n(a);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && Pn(this.#n, () => {
      this.#n = null;
    }), this.#a && (this.#e.before(this.#a), this.#a = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#k(t, n), this.#p += t, !(!this.#d || this.#c) && (this.#c = !0, Jt(() => {
      this.#c = !1, this.#d && Yn(this.#d, this.#p);
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
    we?.is_fork ? (this.#i && we.skip_effect(this.#i), this.#n && we.skip_effect(this.#n), this.#o && we.skip_effect(this.#o), we.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#i && (ot(this.#i), this.#i = null), this.#n && (ot(this.#n), this.#n = null), this.#o && (ot(this.#o), this.#o = null);
    let n = this.#t.failed;
    const s = (a) => {
      const { reset: i, invoke_onerror: l } = this.#m(a);
      l(), n && (this.#o = this.#v(() => {
        try {
          return yt(() => {
            var u = (
              /** @type {Effect} */
              pe
            );
            u.b = this, u.f |= Zr, n(
              this.#e,
              () => a,
              () => i
            );
          });
        } catch (u) {
          return gn(
            u,
            /** @type {Effect} */
            this.#s.parent
          ), null;
        }
      }));
    };
    Jt(() => {
      var a;
      try {
        a = this.transform_error(t);
      } catch (i) {
        gn(i, this.#s && this.#s.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof /** @type {any} */
      a.then == "function" ? a.then(
        s,
        /** @param {unknown} e */
        (i) => gn(i, this.#s && this.#s.parent)
      ) : s(a);
    });
  }
}
function Fi(e, t, n, s) {
  const a = dr;
  var i = e.filter((h) => !h.settled), l = t.map(a);
  if (n.length === 0 && i.length === 0) {
    s(l);
    return;
  }
  var u = (
    /** @type {Effect} */
    pe
  ), o = Li(), c = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function p(h) {
    if ((u.f & ft) === 0) {
      o();
      try {
        s([...l, ...h]);
      } catch (_) {
        gn(_, u);
      }
      Mr();
    }
  }
  var m = ia();
  if (n.length === 0) {
    c.then(() => p([])).finally(m);
    return;
  }
  function g() {
    Promise.all(n.map((h) => /* @__PURE__ */ Di(h))).then(p).catch((h) => gn(h, u)).finally(m);
  }
  c ? c.then(() => {
    o(), g(), Mr();
  }) : g();
}
function Li() {
  var e = (
    /** @type {Effect} */
    pe
  ), t = _e, n = Je, s = (
    /** @type {Batch} */
    we
  );
  return function(i = !0) {
    Ut(e), Et(t), $n(n), i && (e.f & ft) === 0 && (s?.activate(), s?.apply());
  };
}
function Mr(e = !0) {
  Ut(null), Et(null), $n(null), e && we?.deactivate();
}
function ia() {
  var e = (
    /** @type {Effect} */
    pe
  ), t = e.b, n = (
    /** @type {Batch} */
    we
  ), s = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(s, e), () => {
    t?.update_pending_count(-1, n), n.decrement(s, e);
  };
}
// @__NO_SIDE_EFFECTS__
function dr(e) {
  var t = Ue | qe;
  return pe !== null && (pe.f |= Jn), {
    ctx: Je,
    deps: null,
    effects: null,
    equals: Qs,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      je
    ),
    wv: 0,
    parent: pe,
    ac: null
  };
}
const sr = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function Di(e, t, n) {
  let s = (
    /** @type {Effect | null} */
    pe
  );
  s === null && ni();
  var a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = Nn(
    /** @type {V} */
    je
  ), l = !_e, u = /* @__PURE__ */ new Set();
  return el(() => {
    var o = (
      /** @type {Effect} */
      pe
    ), c = Ks();
    a = c.promise;
    try {
      Promise.resolve(e()).then(c.resolve, (h) => {
        h !== vr && c.reject(h);
      }).finally(Mr);
    } catch (h) {
      c.reject(h), Mr();
    }
    var p = (
      /** @type {Batch} */
      we
    );
    if (l) {
      if ((o.f & Xn) !== 0)
        var m = ia();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        s.b?.is_rendered()
      )
        p.async_deriveds.get(o)?.reject(sr);
      else
        for (const h of u.values())
          h.reject(sr);
      u.add(c), p.async_deriveds.set(o, c);
    }
    const g = (h, _ = void 0) => {
      m?.(), u.delete(c), _ !== sr && (p.activate(), _ ? (i.f |= bn, Yn(i, _)) : ((i.f & bn) !== 0 && (i.f ^= bn), Yn(i, h)), p.deactivate());
    };
    c.promise.then(g, (h) => g(null, h || "unknown"));
  }), Fr(() => {
    for (const o of u)
      o.reject(sr);
  }), new Promise((o) => {
    function c(p) {
      function m() {
        p === a ? o(i) : c(a);
      }
      p.then(m, m);
    }
    c(a);
  });
}
// @__NO_SIDE_EFFECTS__
function re(e) {
  const t = /* @__PURE__ */ dr(e);
  return Ea(t), t;
}
// @__NO_SIDE_EFFECTS__
function la(e) {
  const t = /* @__PURE__ */ dr(e);
  return t.equals = ea, t;
}
function ji(e) {
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
function fs(e) {
  var t, n = pe, s = e.parent;
  if (!nn && s !== null && e.v !== je && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (s.f & (ft | rt)) !== 0)
    return Si(), e.v;
  Ut(s);
  try {
    e.f &= ~On, ji(e), t = Ra(e);
  } finally {
    Ut(n);
  }
  return t;
}
function oa(e) {
  var t = fs(e);
  if (!e.equals(t) && (e.wv = Ma(), (!we?.is_fork || e.deps === null) && (we !== null ? (we.capture(e, t, !0), rs?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Ie(e, He);
    return;
  }
  nn || (It !== null ? (ps() || we?.is_fork) && It.set(e, t) : ds(e));
}
function Hi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Zn(() => {
        t.ac.abort(vr), t.ac = null;
      }), t.fn !== null && (t.teardown = yr), fr(t, 0), bs(t));
}
function ua(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Vn(t);
}
let Br = null, Dn = null, we = null, rs = null, It = null, ss = null, ur = !1, Ur = !1, Hn = null, xr = null;
var Ts = 0;
let qi = 1;
class wn {
  id = qi++;
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
  #s = /* @__PURE__ */ new Set();
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
    Dn === null ? Br = Dn = this : (Dn.#t = this, this.#r = Dn), Dn = this;
  }
  #b() {
    if (this.is_fork) return !0;
    for (const s of this.#n.keys()) {
      for (var t = s, n = !1; t.parent !== null; ) {
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
  unskip_effect(t, n = (s) => this.schedule(s)) {
    var s = this.#f.get(t);
    if (s) {
      this.#f.delete(t);
      for (var a of s.d)
        Ie(a, qe), n(a);
      for (a of s.m)
        Ie(a, Ft), n(a);
    }
    this.#g.add(t);
  }
  #_() {
    this.#e = !0, Ts++ > 1e3 && (this.#v(), Ui());
    for (const o of this.#u)
      this.#c.delete(o), Ie(o, qe), this.schedule(o);
    for (const o of this.#c)
      Ie(o, Ft), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Hn = [], s = [], a = xr = [];
    for (const o of t)
      try {
        this.#y(o, n, s);
      } catch (c) {
        throw fa(o), this.#b() || this.discard(), c;
      }
    if (we = null, a.length > 0) {
      var i = wn.ensure();
      for (const o of a)
        i.schedule(o);
    }
    if (Hn = null, xr = null, this.#b()) {
      this.#h(s), this.#h(n);
      for (const [o, c] of this.#f)
        da(o, c);
      a.length > 0 && /** @type {unknown} */
      we.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(s), this.#h(n), l.#x(this);
      return;
    }
    this.#u.clear(), this.#c.clear();
    for (const o of this.#l) o(this);
    this.#l.clear(), rs = this, Ms(s), Ms(n), rs = null, this.#o?.resolve();
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      we
    );
    if (this.#i === 0 && (this.#a.length === 0 || u !== null) && this.#v(), this.#a.length > 0)
      if (u !== null) {
        const o = u;
        o.#a.push(...this.#a.filter((c) => !o.#a.includes(c)));
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
  #y(t, n, s) {
    t.f ^= He;
    for (var a = t.first; a !== null; ) {
      var i = a.f, l = (i & (St | tn)) !== 0, u = l && (i & He) !== 0, o = u || (i & rt) !== 0 || this.#f.has(a);
      if (!o && a.fn !== null) {
        l ? a.f ^= He : (i & Wn) !== 0 ? n.push(a) : gr(a) && ((i & Nt) !== 0 && this.#c.add(a), Vn(a));
        var c = a.first;
        if (c !== null) {
          a = c;
          continue;
        }
      }
      for (; a !== null; ) {
        var p = a.next;
        if (p !== null) {
          a = p;
          break;
        }
        a = a.parent;
      }
    }
  }
  #m() {
    for (var t = this.#r; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, s]] of this.current)
          if (t.current.has(n) && !s)
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
    for (const [s, a] of t.current)
      !this.previous.has(s) && t.previous.has(s) && this.previous.set(s, t.previous.get(s)), this.current.set(s, a);
    for (const [s, a] of t.async_deriveds) {
      const i = this.async_deriveds.get(s);
      i && a.promise.then(i.resolve).catch(i.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#u, t.#c);
    const n = (s) => {
      var a = s.reactions;
      if (a !== null && !((s.f & Ue) !== 0 && (s.f & (qe | Ft)) === 0))
        for (const u of a) {
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
            i & (Un | Nt) && !this.async_deriveds.has(l) && (this.#c.delete(l), Ie(l, qe), this.schedule(l));
          }
        }
    };
    for (const s of this.current.keys())
      n(s);
    this.oncommit(() => t.discard()), t.#v(), we = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      aa(t[n], this.#u, this.#c);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, s = !1) {
    t.v !== je && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & bn) === 0 && (this.current.set(t, [n, s]), It?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    we = this;
  }
  deactivate() {
    we = null, It = null;
  }
  flush() {
    try {
      Ur = !0, we = this, this.#_();
    } finally {
      Ts = 0, ss = null, Hn = null, xr = null, Ur = !1, we = null, It = null, Rn.clear();
    }
  }
  discard() {
    for (const t of this.#s) t(this);
    this.#s.clear();
    for (const t of this.async_deriveds.values())
      t.reject(sr);
    this.#v(), this.#o?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let m = Br; m !== null; m = m.#t) {
      var t = m.id < this.id, n = [];
      for (const [g, [h, _]] of this.current) {
        if (m.current.has(g)) {
          var s = (
            /** @type {[any, boolean]} */
            m.current.get(g)[0]
          );
          if (t && h !== s)
            m.current.set(g, [h, _]);
          else
            continue;
        }
        n.push(g);
      }
      if (t)
        for (const [g, h] of this.async_deriveds) {
          const _ = m.async_deriveds.get(g);
          _ && h.promise.then(_.resolve).catch(_.reject);
        }
      var a = [...m.current.keys()].filter(
        (g) => !/** @type {[any, boolean]} */
        m.current.get(g)[1]
      );
      if (!(!m.#e || a.length === 0)) {
        var i = a.filter((g) => !this.current.has(g));
        if (i.length === 0)
          t && m.discard();
        else if (n.length > 0) {
          if (t)
            for (const g of this.#g)
              m.unskip_effect(g, (h) => {
                (h.f & (Nt | Un)) !== 0 ? m.schedule(h) : m.#h([h]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (var o of n)
            ca(o, i, l, u);
          u = /* @__PURE__ */ new Map();
          var c = [...m.current].filter(([g, h]) => {
            const _ = this.current.get(g);
            return _ ? _[0] !== h[0] || _[1] !== h[1] : !0;
          }).map(([g]) => g);
          if (c.length > 0)
            for (const g of this.#p)
              (g.f & (ft | rt | Er)) === 0 && hs(g, c, u) && ((g.f & (Un | Nt)) !== 0 ? (Ie(g, qe), m.schedule(g)) : m.#u.add(g));
          if (m.#a.length > 0 && !m.#d) {
            m.apply();
            for (var p of m.#a)
              m.#y(p, [], []);
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
    if (this.#i += 1, t) {
      let s = this.#n.get(n) ?? 0;
      this.#n.set(n, s + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  decrement(t, n) {
    if (this.#i -= 1, t) {
      let s = this.#n.get(n) ?? 0;
      s === 1 ? this.#n.delete(n) : this.#n.set(n, s - 1);
    }
    this.#d || (this.#d = !0, Jt(() => {
      this.#d = !1, this.linked && this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const s of t)
      this.#u.add(s);
    for (const s of n)
      this.#c.add(s);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#l.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#s.add(t);
  }
  settled() {
    return (this.#o ??= Ks()).promise;
  }
  static ensure() {
    if (we === null) {
      const t = we = new wn();
      !Ur && !ur && Jt(() => {
        t.#e || t.flush();
      });
    }
    return we;
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
    if (ss = t, t.b?.is_pending && (t.f & (Wn | zr | Xs)) !== 0 && (t.f & Xn) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var s = n.f;
      if (Hn !== null && n === pe && (_e === null || (_e.f & Ue) === 0))
        return;
      if ((s & (tn | St)) !== 0) {
        if ((s & He) === 0)
          return;
        n.f ^= He;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#r, n = this.#t;
      t === null ? Br = n : t.#t = n, n === null ? Dn = t : n.#r = t, this.linked = !1;
    }
  }
}
function Bi(e) {
  var t = ur;
  ur = !0;
  try {
    for (var n; ; ) {
      if (Ai(), we === null)
        return (
          /** @type {T} */
          n
        );
      we.flush();
    }
  } finally {
    ur = t;
  }
}
function Ui() {
  try {
    li();
  } catch (e) {
    gn(e, ss);
  }
}
let Xt = null;
function Ms(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var s = e[n++];
      if ((s.f & (ft | rt)) === 0 && gr(s) && (Xt = /* @__PURE__ */ new Set(), Vn(s), s.deps === null && s.first === null && s.nodes === null && s.teardown === null && s.ac === null && xa(s), Xt?.size > 0)) {
        Rn.clear();
        for (const a of Xt) {
          if ((a.f & (ft | rt)) !== 0) continue;
          const i = [a];
          let l = a.parent;
          for (; l !== null; )
            Xt.has(l) && (Xt.delete(l), i.push(l)), l = l.parent;
          for (let u = i.length - 1; u >= 0; u--) {
            const o = i[u];
            (o.f & (ft | rt)) === 0 && Vn(o);
          }
        }
        Xt.clear();
      }
    }
    Xt = null;
  }
}
function ca(e, t, n, s) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const i = a.f;
      (i & Ue) !== 0 ? ca(
        /** @type {Derived} */
        a,
        t,
        n,
        s
      ) : (i & (Un | Nt)) !== 0 && (i & qe) === 0 && hs(a, t, s) && (Ie(a, qe), vs(
        /** @type {Effect} */
        a
      ));
    }
}
function hs(e, t, n) {
  const s = n.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (Sr.call(t, a))
        return !0;
      if ((a.f & Ue) !== 0 && hs(
        /** @type {Derived} */
        a,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          a,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function vs(e) {
  we.schedule(e);
}
function da(e, t) {
  if (!((e.f & St) !== 0 && (e.f & He) !== 0)) {
    (e.f & qe) !== 0 ? t.d.push(e) : (e.f & Ft) !== 0 && t.m.push(e), Ie(e, He);
    for (var n = e.first; n !== null; )
      da(n, t), n = n.next;
  }
}
function fa(e) {
  Ie(e, He);
  for (var t = e.first; t !== null; )
    fa(t), t = t.next;
}
let Ar = /* @__PURE__ */ new Set();
const Rn = /* @__PURE__ */ new Map();
let ha = !1;
function Nn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Qs,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function $(e, t) {
  const n = Nn(e);
  return Ea(n), n;
}
// @__NO_SIDE_EFFECTS__
function Wi(e, t = !1, n = !0) {
  const s = Nn(e);
  return t || (s.equals = ea), s;
}
function k(e, t, n = !1) {
  _e !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!zt || (_e.f & Er) !== 0) && ta() && (_e.f & (Ue | Nt | Un | Er)) !== 0 && (Bt === null || !Bt.has(e)) && di();
  let s = n ? Pe(t) : t;
  return Yn(e, s, xr);
}
function Yn(e, t, n = null) {
  if (!e.equals(t)) {
    Rn.set(e, nn ? t : e.v);
    var s = wn.ensure();
    if (s.capture(e, t), (e.f & Ue) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & qe) !== 0 && fs(a), It === null && ds(a);
    }
    e.wv = Ma(), va(e, qe, n), pe !== null && (pe.f & He) !== 0 && (pe.f & (St | tn)) === 0 && (wt === null ? rl([e]) : wt.push(e)), !s.is_fork && Ar.size > 0 && !ha && Gi();
  }
  return t;
}
function Gi() {
  ha = !1;
  for (const e of Ar) {
    (e.f & He) !== 0 && Ie(e, Ft);
    let t;
    try {
      t = gr(e);
    } catch {
      t = !0;
    }
    t && Vn(e);
  }
  Ar.clear();
}
function $i(e, t = 1) {
  var n = r(e), s = t === 1 ? n++ : n--;
  return k(e, n), s;
}
function cr(e) {
  k(e, e.v + 1);
}
function va(e, t, n) {
  var s = e.reactions;
  if (s !== null)
    for (var a = s.length, i = 0; i < a; i++) {
      var l = s[i], u = l.f, o = (u & qe) === 0;
      if (o && Ie(l, t), (u & Er) !== 0)
        Ar.add(
          /** @type {Effect} */
          l
        );
      else if ((u & Ue) !== 0) {
        var c = (
          /** @type {Derived} */
          l
        );
        It?.delete(c), (u & On) === 0 && (u & kt && (pe === null || (pe.f & Tr) === 0) && (l.f |= On), va(c, Ft, n));
      } else if (o) {
        var p = (
          /** @type {Effect} */
          l
        );
        (u & Nt) !== 0 && Xt !== null && Xt.add(p), n !== null ? n.push(p) : vs(p);
      }
    }
}
function Pe(e) {
  if (typeof e != "object" || e === null || An in e)
    return e;
  const t = Vs(e);
  if (t !== Ya && t !== Va)
    return e;
  var n = /* @__PURE__ */ new Map(), s = cs(e), a = /* @__PURE__ */ $(0), i = Cn, l = (u) => {
    if (Cn === i)
      return u();
    var o = _e, c = Cn;
    Et(null), Ps(i);
    var p = u();
    return Et(o), Ps(c), p;
  };
  return s && n.set("length", /* @__PURE__ */ $(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && ui();
        var p = n.get(o);
        return p === void 0 ? l(() => {
          var m = /* @__PURE__ */ $(c.value);
          return n.set(o, m), m;
        }) : k(p, c.value, !0), !0;
      },
      deleteProperty(u, o) {
        var c = n.get(o);
        if (c === void 0) {
          if (o in u) {
            const p = l(() => /* @__PURE__ */ $(je));
            n.set(o, p), cr(a);
          }
        } else
          k(c, je), cr(a);
        return !0;
      },
      get(u, o, c) {
        if (o === An)
          return e;
        var p = n.get(o), m = o in u;
        if (p === void 0 && (!m || Bn(u, o)?.writable) && (p = l(() => {
          var h = Pe(m ? u[o] : je), _ = /* @__PURE__ */ $(h);
          return _;
        }), n.set(o, p)), p !== void 0) {
          var g = r(p);
          return g === je ? void 0 : g;
        }
        return Reflect.get(u, o, c);
      },
      getOwnPropertyDescriptor(u, o) {
        var c = Reflect.getOwnPropertyDescriptor(u, o);
        if (c && "value" in c) {
          var p = n.get(o);
          p && (c.value = r(p));
        } else if (c === void 0) {
          var m = n.get(o), g = m?.v;
          if (m !== void 0 && g !== je)
            return {
              enumerable: !0,
              configurable: !0,
              value: g,
              writable: !0
            };
        }
        return c;
      },
      has(u, o) {
        if (o === An)
          return !0;
        var c = n.get(o), p = c !== void 0 && c.v !== je || Reflect.has(u, o);
        if (c !== void 0 || pe !== null && (!p || Bn(u, o)?.writable)) {
          c === void 0 && (c = l(() => {
            var g = p ? Pe(u[o]) : je, h = /* @__PURE__ */ $(g);
            return h;
          }), n.set(o, c));
          var m = r(c);
          if (m === je)
            return !1;
        }
        return p;
      },
      set(u, o, c, p) {
        var m = n.get(o), g = o in u;
        if (s && o === "length")
          for (var h = c; h < /** @type {Source<number>} */
          m.v; h += 1) {
            var _ = n.get(h + "");
            _ !== void 0 ? k(_, je) : h in u && (_ = l(() => /* @__PURE__ */ $(je)), n.set(h + "", _));
          }
        if (m === void 0)
          (!g || Bn(u, o)?.writable) && (m = l(() => /* @__PURE__ */ $(void 0)), k(m, Pe(c)), n.set(o, m));
        else {
          g = m.v !== je;
          var w = l(() => Pe(c));
          k(m, w);
        }
        var d = Reflect.getOwnPropertyDescriptor(u, o);
        if (d?.set && d.set.call(p, c), !g) {
          if (s && typeof o == "string") {
            var b = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= b.v && k(b, y + 1);
          }
          cr(a);
        }
        return !0;
      },
      ownKeys(u) {
        r(a);
        var o = Reflect.ownKeys(u).filter((m) => {
          var g = n.get(m);
          return g === void 0 || g.v !== je;
        });
        for (var [c, p] of n)
          p.v !== je && !(c in u) && o.push(c);
        return o;
      },
      setPrototypeOf() {
        ci();
      }
    }
  );
}
function As(e) {
  try {
    if (e !== null && typeof e == "object" && An in e)
      return e[An];
  } catch {
  }
  return e;
}
function Yi(e, t) {
  return Object.is(As(e), As(t));
}
var mn, pa, ga, _a;
function Vi() {
  if (mn === void 0) {
    mn = window, pa = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    ga = Bn(t, "firstChild").get, _a = Bn(t, "nextSibling").get, Es(e) && (e[es] = void 0, e[Js] = null, e[ts] = void 0, e.__e = void 0), Es(n) && (n[ns] = void 0);
  }
}
function Qt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Rr(e) {
  return (
    /** @type {TemplateNode | null} */
    ga.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function pr(e) {
  return (
    /** @type {TemplateNode | null} */
    _a.call(e)
  );
}
function f(e, t) {
  return /* @__PURE__ */ Rr(e);
}
function lt(e, t = !1) {
  {
    var n = /* @__PURE__ */ Rr(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ pr(n) : n;
  }
}
function v(e, t = 1, n = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ pr(s);
  return s;
}
function Ki(e) {
  e.textContent = "";
}
function ba() {
  return !1;
}
function Xi(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Ji(e) {
  pe === null && (_e === null && ii(), ai()), nn && si();
}
function Zi(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function rn(e, t) {
  var n = pe;
  n !== null && (n.f & rt) !== 0 && (e |= rt);
  var s = {
    ctx: Je,
    deps: null,
    nodes: null,
    f: e | qe | kt,
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
  we?.register_created_effect(s);
  var a = s;
  if ((e & Wn) !== 0)
    Hn !== null ? Hn.push(s) : wn.ensure().schedule(s);
  else if (t !== null) {
    try {
      Vn(s);
    } catch (l) {
      throw ot(s), l;
    }
    a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
    (a.f & Jn) === 0 && (a = a.first, (e & Nt) !== 0 && (e & Gn) !== 0 && a !== null && (a.f |= Gn));
  }
  if (a !== null && (a.parent = n, n !== null && Zi(a, n), _e !== null && (_e.f & Ue) !== 0 && (e & tn) === 0)) {
    var i = (
      /** @type {Derived} */
      _e
    );
    (i.effects ??= []).push(a);
  }
  return s;
}
function ps() {
  return _e !== null && !zt;
}
function Fr(e) {
  const t = rn(zr, null);
  return Ie(t, He), t.teardown = e, t;
}
function qt(e) {
  Ji();
  var t = (
    /** @type {Effect} */
    pe.f
  ), n = !_e && (t & St) !== 0 && Je !== null && !Je.i;
  if (n) {
    var s = (
      /** @type {ComponentContext} */
      Je
    );
    (s.e ??= []).push(e);
  } else
    return ma(e);
}
function ma(e) {
  return rn(Wn | Ja, e);
}
function Qi(e) {
  wn.ensure();
  const t = rn(tn | Jn, e);
  return (n = {}) => new Promise((s) => {
    n.outro ? Pn(t, () => {
      ot(t), s(void 0);
    }) : (ot(t), s(void 0));
  });
}
function gs(e) {
  return rn(Wn, e);
}
function el(e) {
  return rn(Un | Jn, e);
}
function wa(e, t = 0) {
  return rn(zr | t, e);
}
function B(e, t = [], n = [], s = []) {
  Fi(s, t, n, (a) => {
    rn(zr, () => {
      e(...a.map(r));
    });
  });
}
function _s(e, t = 0) {
  var n = rn(Nt | t, e);
  return n;
}
function yt(e) {
  return rn(St | Jn, e);
}
function ya(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = nn, s = _e;
    Rs(!0), Et(null);
    try {
      t.call(null);
    } finally {
      Rs(n), Et(s);
    }
  }
}
function bs(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && Zn(() => {
      a.abort(vr);
    });
    var s = n.next;
    (n.f & tn) !== 0 ? n.parent = null : ot(n, t), n = s;
  }
}
function tl(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & St) === 0 && ot(t), t = n;
  }
}
function ot(e, t = !0) {
  var n = !1;
  (t || (e.f & Xa) !== 0) && e.nodes !== null && e.nodes.end !== null && (nl(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Qr, bs(e, t && !n), fr(e, 0);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const i of s)
      i.stop();
  ya(e), e.f ^= Qr, e.f |= ft;
  var a = e.parent;
  a !== null && a.first !== null && xa(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function nl(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ pr(e);
    e.remove(), e = n;
  }
}
function xa(e) {
  var t = e.parent, n = e.prev, s = e.next;
  n !== null && (n.next = s), s !== null && (s.prev = n), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = n));
}
function Pn(e, t, n = !0) {
  var s = [];
  ka(e, s, !0);
  var a = () => {
    n && ot(e), t && t();
  }, i = s.length;
  if (i > 0) {
    var l = () => --i || a();
    for (var u of s)
      u.out(l);
  } else
    a();
}
function ka(e, t, n) {
  if ((e.f & rt) === 0) {
    e.f ^= rt;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || n) && t.push(u);
    for (var a = e.first; a !== null; ) {
      var i = a.next;
      if ((a.f & tn) === 0) {
        var l = (a.f & Gn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (a.f & St) !== 0 && (e.f & Nt) !== 0;
        ka(a, t, l ? n : !1);
      }
      a = i;
    }
  }
}
function Pr(e) {
  Sa(e, !0);
}
function Sa(e, t) {
  if ((e.f & rt) !== 0) {
    e.f ^= rt, (e.f & He) === 0 && (Ie(e, qe), wn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var s = n.next, a = (n.f & Gn) !== 0 || (n.f & St) !== 0;
      Sa(n, a ? t : !1), n = s;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function ms(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, s = e.nodes.end; n !== null; ) {
      var a = n === s ? null : /* @__PURE__ */ pr(n);
      t.append(n), n = a;
    }
}
let kr = !1, nn = !1;
function Rs(e) {
  nn = e;
}
let _e = null, zt = !1;
function Et(e) {
  _e = e;
}
let pe = null;
function Ut(e) {
  pe = e;
}
let Bt = null;
function Ea(e) {
  _e !== null && (Bt ??= /* @__PURE__ */ new Set()).add(e);
}
let it = null, dt = 0, wt = null;
function rl(e) {
  wt = e;
}
let Ta = 1, Tn = 0, Cn = Tn;
function Ps(e) {
  Cn = e;
}
function Ma() {
  return ++Ta;
}
function gr(e) {
  var t = e.f;
  if ((t & qe) !== 0)
    return !0;
  if (t & Ue && (e.f &= ~On), (t & Ft) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), s = n.length, a = 0; a < s; a++) {
      var i = n[a];
      if (gr(
        /** @type {Derived} */
        i
      ) && oa(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & kt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    It === null && Ie(e, He);
  }
  return !1;
}
function Aa(e, t, n = !0) {
  var s = e.reactions;
  if (s !== null && !(Bt !== null && Bt.has(e)))
    for (var a = 0; a < s.length; a++) {
      var i = s[a];
      (i.f & Ue) !== 0 ? Aa(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Ie(i, qe) : (i.f & He) !== 0 && Ie(i, Ft), vs(
        /** @type {Effect} */
        i
      ));
    }
}
function Ra(e) {
  var t = it, n = dt, s = wt, a = _e, i = Bt, l = Je, u = zt, o = Cn, c = e.f;
  it = /** @type {null | Value[]} */
  null, dt = 0, wt = null, _e = (c & (St | tn)) === 0 ? e : null, Bt = null, $n(e.ctx), zt = !1, Cn = ++Tn, e.ac !== null && (Zn(() => {
    e.ac.abort(vr);
  }), e.ac = null);
  try {
    e.f |= Tr;
    var p = (
      /** @type {Function} */
      e.fn
    ), m = p();
    e.f |= Xn;
    var g = e.deps, h = we?.is_fork;
    if (it !== null) {
      var _;
      if (h || fr(e, dt), g !== null && dt > 0)
        for (g.length = dt + it.length, _ = 0; _ < it.length; _++)
          g[dt + _] = it[_];
      else
        e.deps = g = it;
      if (ps() && (e.f & kt) !== 0)
        for (_ = dt; _ < g.length; _++)
          (g[_].reactions ??= []).push(e);
    } else !h && g !== null && dt < g.length && (fr(e, dt), g.length = dt);
    if (ta() && wt !== null && !zt && g !== null && (e.f & (Ue | Ft | qe)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      wt.length; _++)
        Aa(
          wt[_],
          /** @type {Effect} */
          e
        );
    if (a !== null && a !== e) {
      if (Tn++, a.deps !== null)
        for (let w = 0; w < n; w += 1)
          a.deps[w].rv = Tn;
      if (t !== null)
        for (const w of t)
          w.rv = Tn;
      wt !== null && (s === null ? s = wt : s.push(.../** @type {Source[]} */
      wt));
    }
    return (e.f & bn) !== 0 && (e.f ^= bn), m;
  } catch (w) {
    return ra(w);
  } finally {
    e.f ^= Tr, it = t, dt = n, wt = s, _e = a, Bt = i, $n(l), zt = u, Cn = o;
  }
}
function sl(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var s = Wa.call(n, e);
    if (s !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[s] = n[a], n.pop());
    }
  }
  if (n === null && (t.f & Ue) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (it === null || !Sr.call(it, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & kt) !== 0 && (i.f ^= kt, i.f &= ~On), i.v !== je && ds(i), i.ac !== null && Zn(() => {
      i.ac.abort(vr), i.ac = null, Ie(i, qe);
    }), Hi(i), fr(i, 0);
  }
}
function fr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var s = t; s < n.length; s++)
      sl(e, n[s]);
}
function Vn(e) {
  var t = e.f;
  if ((t & ft) === 0) {
    Ie(e, He);
    var n = pe, s = kr;
    pe = e, kr = (t & (St | tn)) === 0;
    try {
      (t & (Nt | Xs)) !== 0 ? tl(e) : bs(e), ya(e);
      var a = Ra(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Ta;
      var i;
    } finally {
      kr = s, pe = n;
    }
  }
}
async function al() {
  await Promise.resolve(), Bi();
}
function r(e) {
  var t = e.f, n = (t & Ue) !== 0;
  if (_e !== null && !zt) {
    var s = pe !== null && (pe.f & ft) !== 0;
    if (!s && (Bt === null || !Bt.has(e))) {
      var a = _e.deps;
      if ((_e.f & Tr) !== 0)
        e.rv < Tn && (e.rv = Tn, it === null && a !== null && a[dt] === e ? dt++ : it === null ? it = [e] : it.push(e));
      else {
        _e.deps ??= [], Sr.call(_e.deps, e) || _e.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [_e] : Sr.call(i, _e) || i.push(_e);
      }
    }
  }
  if (nn && Rn.has(e))
    return Rn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (nn) {
      var u = l.v;
      return ((l.f & He) === 0 && l.reactions !== null || Ca(l)) && (u = fs(l)), Rn.set(l, u), u;
    }
    var o = (l.f & kt) === 0 && !zt && _e !== null && (kr || (_e.f & kt) !== 0), c = (l.f & Xn) === 0;
    gr(l) && (o && (l.f |= kt), oa(l)), o && !c && (ua(l), Pa(l));
  }
  if (It?.has(e))
    return It.get(e);
  if ((e.f & bn) !== 0)
    throw e.v;
  return e.v;
}
function Pa(e) {
  if (e.f |= kt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Ue) !== 0 && (t.f & kt) === 0 && (ua(
        /** @type {Derived} */
        t
      ), Pa(
        /** @type {Derived} */
        t
      ));
}
function Ca(e) {
  if (e.v === je) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Rn.has(t) || (t.f & Ue) !== 0 && Ca(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function en(e) {
  var t = zt;
  try {
    return zt = !0, e();
  } finally {
    zt = t;
  }
}
const il = ["touchstart", "touchmove"];
function ll(e) {
  return il.includes(e);
}
const ar = Symbol("events"), Oa = /* @__PURE__ */ new Set(), as = /* @__PURE__ */ new Set();
function ol(e, t, n, s = {}) {
  function a(i) {
    if (s.capture || is.call(t, i), !i.cancelBubble)
      return Zn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Jt(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function Mn(e, t, n, s, a) {
  var i = { capture: s, passive: a }, l = ol(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Fr(() => {
    t.removeEventListener(e, l, i);
  });
}
function K(e, t, n) {
  (t[ar] ??= {})[e] = n;
}
function Lt(e) {
  for (var t = 0; t < e.length; t++)
    Oa.add(e[t]);
  for (var n of as)
    n(e);
}
let Cs = null;
function is(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Cs = e;
  var l = 0, u = Cs === e && e[ar];
  if (u) {
    var o = a.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ar] = t;
      return;
    }
    var c = a.indexOf(t);
    if (c === -1)
      return;
    o <= c && (l = o);
  }
  if (i = /** @type {Element} */
  a[l] || e.target, i !== t) {
    Ga(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var p = _e, m = pe;
    Et(null), Ut(null);
    try {
      for (var g, h = []; i !== null && i !== t; ) {
        try {
          var _ = i[ar]?.[s];
          _ != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && _.call(i, e);
        } catch (w) {
          g ? h.push(w) : g = w;
        }
        if (e.cancelBubble) break;
        l++, i = l < a.length ? (
          /** @type {Element} */
          a[l]
        ) : null;
      }
      if (g) {
        for (let w of h)
          queueMicrotask(() => {
            throw w;
          });
        throw g;
      }
    } finally {
      e[ar] = t, delete e.currentTarget, Et(p), Ut(m);
    }
  }
}
const ul = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function cl(e) {
  return (
    /** @type {string} */
    ul?.createHTML(e) ?? e
  );
}
function dl(e) {
  var t = Xi("template");
  return t.innerHTML = cl(e.replaceAll("<!>", "<!---->")), t.content;
}
function Cr(e, t) {
  var n = (
    /** @type {Effect} */
    pe
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function N(e, t) {
  var n = (t & yi) !== 0, s = (t & xi) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = dl(i ? e : "<!>" + e), n || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Rr(a)));
    var l = (
      /** @type {TemplateNode} */
      s || pa ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (n) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Rr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      Cr(u, o);
    } else
      Cr(l, l);
    return l;
  };
}
function qn(e = "") {
  {
    var t = Qt(e + "");
    return Cr(t, t), t;
  }
}
function ws() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Qt();
  return e.append(t, n), Cr(t, n), e;
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
  (e[ns] ??= e.nodeValue) && (e[ns] = n, e.nodeValue = `${n}`);
}
function fl(e, t) {
  return hl(e, t);
}
const mr = /* @__PURE__ */ new Map();
function hl(e, { target: t, anchor: n, props: s = {}, events: a, context: i, intro: l = !0, transformError: u }) {
  Vi();
  var o = void 0, c = Qi(() => {
    var p = n ?? t.appendChild(Qt());
    Ii(
      /** @type {TemplateNode} */
      p,
      {
        pending: () => {
        }
      },
      (h) => {
        ht({});
        var _ = (
          /** @type {ComponentContext} */
          Je
        );
        i && (_.c = i), a && (s.$$events = a), o = e(h, s) || {}, vt();
      },
      u
    );
    var m = /* @__PURE__ */ new Set(), g = (h) => {
      for (var _ = 0; _ < h.length; _++) {
        var w = h[_];
        if (!m.has(w)) {
          m.add(w);
          var d = ll(w);
          for (const M of [t, document]) {
            var b = mr.get(M);
            b === void 0 && (b = /* @__PURE__ */ new Map(), mr.set(M, b));
            var y = b.get(w);
            y === void 0 ? (M.addEventListener(w, is, { passive: d }), b.set(w, 1)) : b.set(w, y + 1);
          }
        }
      }
    };
    return g(Ir(Oa)), as.add(g), () => {
      for (var h of m)
        for (const d of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            mr.get(d)
          ), w = (
            /** @type {number} */
            _.get(h)
          );
          --w == 0 ? (d.removeEventListener(h, is), _.delete(h), _.size === 0 && mr.delete(d)) : _.set(h, w);
        }
      as.delete(g), p !== n && p.parentNode?.removeChild(p);
    };
  });
  return vl.set(o, c), o;
}
let vl = /* @__PURE__ */ new WeakMap();
class pl {
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
  #s = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#s = n;
  }
  /**
   * @param {Batch} batch
   */
  #i = (t) => {
    if (this.#e.has(t)) {
      var n = (
        /** @type {Key} */
        this.#e.get(t)
      ), s = this.#r.get(n);
      if (s)
        Pr(s), this.#l.delete(n);
      else {
        var a = this.#t.get(n);
        a && (Pr(a.effect), this.#r.set(n, a.effect), this.#t.delete(n), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [i, l] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const u = this.#t.get(l);
        u && (ot(u.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#r) {
        if (i === n || this.#l.has(i)) continue;
        const u = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var c = document.createDocumentFragment();
            ms(l, c), c.append(Qt()), this.#t.set(i, { effect: l, fragment: c });
          } else
            ot(l);
          this.#l.delete(i), this.#r.delete(i);
        };
        this.#s || !s ? (this.#l.add(i), Pn(l, u, !1)) : u();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    this.#e.delete(t);
    const n = Array.from(this.#e.values());
    for (const [s, a] of this.#t)
      n.includes(s) || (ot(a.effect), this.#t.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var s = (
      /** @type {Batch} */
      we
    ), a = ba();
    if (n && !this.#r.has(t) && !this.#t.has(t))
      if (a) {
        var i = document.createDocumentFragment(), l = Qt();
        i.append(l), this.#t.set(t, {
          effect: yt(() => n(l)),
          fragment: i
        });
      } else
        this.#r.set(
          t,
          yt(() => n(this.anchor))
        );
    if (this.#e.set(s, t), a) {
      for (const [u, o] of this.#r)
        u === t ? s.unskip_effect(o) : s.skip_effect(o);
      for (const [u, o] of this.#t)
        u === t ? s.unskip_effect(o.effect) : s.skip_effect(o.effect);
      s.oncommit(this.#i), s.ondiscard(this.#n);
    } else
      this.#i(s);
  }
}
function Z(e, t, n = !1) {
  var s = new pl(e), a = n ? Gn : 0;
  function i(l, u) {
    s.ensure(l, u);
  }
  _s(() => {
    var l = !1;
    t((u, o = 0) => {
      l = !0, i(o, u);
    }), l || i(-1, null);
  }, a);
}
function xt(e, t) {
  return t;
}
function gl(e, t, n) {
  for (var s = [], a = t.length, i, l = t.length, u = 0; u < a; u++) {
    let m = t[u];
    Pn(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var g = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            ls(e, Ir(i.done)), g.delete(i), g.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var o = s.length === 0 && n !== null;
    if (o) {
      var c = (
        /** @type {Element} */
        n
      ), p = (
        /** @type {Element} */
        c.parentNode
      );
      Ki(p), p.append(c), e.items.clear();
    }
    ls(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function ls(e, t, n = !0) {
  var s;
  if (e.pending.size > 0) {
    s = /* @__PURE__ */ new Set();
    for (const l of e.pending.values())
      for (const u of l)
        s.add(
          /** @type {EachItem} */
          e.items.get(u).e
        );
  }
  for (var a = 0; a < t.length; a++) {
    var i = t[a];
    if (s?.has(i)) {
      i.f |= Ht;
      const l = document.createDocumentFragment();
      ms(i, l);
    } else
      ot(t[a], n);
  }
}
var Os;
function Ye(e, t, n, s, a, i = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & Zs) !== 0;
  if (o) {
    var c = (
      /** @type {Element} */
      e
    );
    l = c.appendChild(Qt());
  }
  var p = null, m = /* @__PURE__ */ la(() => {
    var M = n();
    return (
      /** @type {V[]} */
      cs(M) ? M : M == null ? [] : Ir(M)
    );
  }), g, h = /* @__PURE__ */ new Map(), _ = !0;
  function w(M) {
    (y.effect.f & ft) === 0 && (y.pending.delete(M), y.fallback = p, _l(y, g, l, t, s), p !== null && (g.length === 0 ? (p.f & Ht) === 0 ? Pr(p) : (p.f ^= Ht, ir(p, null, l)) : Pn(p, () => {
      p = null;
    })));
  }
  function d(M) {
    y.pending.delete(M);
  }
  var b = _s(() => {
    g = /** @type {V[]} */
    r(m);
    for (var M = g.length, I = /* @__PURE__ */ new Set(), D = (
      /** @type {Batch} */
      we
    ), W = ba(), X = 0; X < M; X += 1) {
      var te = g[X], H = s(te, X), L = _ ? null : u.get(H);
      L ? (L.v && Yn(L.v, te), L.i && Yn(L.i, X), W && D.unskip_effect(L.e)) : (L = bl(
        u,
        _ ? l : Os ??= Qt(),
        te,
        H,
        X,
        a,
        t,
        n
      ), _ || (L.e.f |= Ht), u.set(H, L)), I.add(H);
    }
    if (M === 0 && i && !p && (_ ? p = yt(() => i(l)) : (p = yt(() => i(Os ??= Qt())), p.f |= Ht)), M > I.size && ri(), !_)
      if (h.set(D, I), W) {
        for (const [G, P] of u)
          I.has(G) || D.skip_effect(P.e);
        D.oncommit(w), D.ondiscard(d);
      } else
        w(D);
    r(m);
  }), y = { effect: b, items: u, pending: h, outrogroups: null, fallback: p };
  _ = !1;
}
function nr(e) {
  for (; e !== null && (e.f & St) === 0; )
    e = e.next;
  return e;
}
function _l(e, t, n, s, a) {
  var i = (s & pi) !== 0, l = t.length, u = e.items, o = nr(e.effect.first), c, p = null, m, g = [], h = [], _, w, d, b;
  if (i)
    for (b = 0; b < l; b += 1)
      _ = t[b], w = a(_, b), d = /** @type {EachItem} */
      u.get(w).e, (d.f & Ht) === 0 && (d.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(d));
  for (b = 0; b < l; b += 1) {
    if (_ = t[b], w = a(_, b), d = /** @type {EachItem} */
    u.get(w).e, e.outrogroups !== null)
      for (const L of e.outrogroups)
        L.pending.delete(d), L.done.delete(d);
    if ((d.f & rt) !== 0 && (Pr(d), i && (d.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(d))), (d.f & Ht) !== 0)
      if (d.f ^= Ht, d === o)
        ir(d, null, n);
      else {
        var y = p ? p.next : o;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), hn(e, p, d), hn(e, d, y), ir(d, y, n), p = d, g = [], h = [], o = nr(p.next);
        continue;
      }
    if (d !== o) {
      if (c !== void 0 && c.has(d)) {
        if (g.length < h.length) {
          var M = h[0], I;
          p = M.prev;
          var D = g[0], W = g[g.length - 1];
          for (I = 0; I < g.length; I += 1)
            ir(g[I], M, n);
          for (I = 0; I < h.length; I += 1)
            c.delete(h[I]);
          hn(e, D.prev, W.next), hn(e, p, D), hn(e, W, M), o = M, p = W, b -= 1, g = [], h = [];
        } else
          c.delete(d), ir(d, o, n), hn(e, d.prev, d.next), hn(e, d, p === null ? e.effect.first : p.next), hn(e, p, d), p = d;
        continue;
      }
      for (g = [], h = []; o !== null && o !== d; )
        (c ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = nr(o.next);
      if (o === null)
        continue;
    }
    (d.f & Ht) === 0 && g.push(d), p = d, o = nr(d.next);
  }
  if (e.outrogroups !== null) {
    for (const L of e.outrogroups)
      L.pending.size === 0 && (ls(e, Ir(L.done)), e.outrogroups?.delete(L));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || c !== void 0) {
    var X = [];
    if (c !== void 0)
      for (d of c)
        (d.f & rt) === 0 && X.push(d);
    for (; o !== null; )
      (o.f & rt) === 0 && o !== e.fallback && X.push(o), o = nr(o.next);
    var te = X.length;
    if (te > 0) {
      var H = (s & Zs) !== 0 && l === 0 ? n : null;
      if (i) {
        for (b = 0; b < te; b += 1)
          X[b].nodes?.a?.measure();
        for (b = 0; b < te; b += 1)
          X[b].nodes?.a?.fix();
      }
      gl(e, X, H);
    }
  }
  i && Jt(() => {
    if (m !== void 0)
      for (d of m)
        d.nodes?.a?.apply();
  });
}
function bl(e, t, n, s, a, i, l, u) {
  var o = (l & hi) !== 0 ? (l & gi) === 0 ? /* @__PURE__ */ Wi(n, !1, !1) : Nn(n) : null, c = (l & vi) !== 0 ? Nn(a) : null;
  return {
    v: o,
    i: c,
    e: yt(() => (i(t, o ?? n, c ?? a, u), () => {
      e.delete(s);
    }))
  };
}
function ir(e, t, n) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, i = t && (t.f & Ht) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; s !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ pr(s)
      );
      if (i.before(s), s === a)
        return;
      s = l;
    }
}
function hn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function vn(e, t, n) {
  gs(() => {
    var s = en(() => t(e, n?.()) || {});
    if (s?.destroy)
      return () => (
        /** @type {Function} */
        s.destroy()
      );
  });
}
const Ns = [...` 	
\r\f \v\uFEFF`];
function ml(e, t, n) {
  var s = e == null ? "" : "" + e;
  if (n) {
    for (var a of Object.keys(n))
      if (n[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var i = a.length, l = 0; (l = s.indexOf(a, l)) >= 0; ) {
          var u = l + i;
          (l === 0 || Ns.includes(s[l - 1])) && (u === s.length || Ns.includes(s[u])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(u + 1) : l = u;
        }
  }
  return s === "" ? null : s;
}
function Is(e, t = !1) {
  var n = t ? " !important;" : ";", s = "";
  for (var a of Object.keys(e)) {
    var i = e[a];
    i != null && i !== "" && (s += " " + a + ": " + i + n);
  }
  return s;
}
function wl(e, t) {
  if (t) {
    var n = "", s, a;
    return Array.isArray(t) ? (s = t[0], a = t[1]) : s = t, s && (n += Is(s)), a && (n += Is(a, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Me(e, t, n, s, a, i) {
  var l = (
    /** @type {any} */
    e[es]
  );
  if (l !== n || l === void 0) {
    var u = ml(n, s, i);
    u == null ? e.removeAttribute("class") : e.className = u, e[es] = n;
  } else if (i && a !== i)
    for (var o in i) {
      var c = !!i[o];
      (a == null || c !== !!a[o]) && e.classList.toggle(o, c);
    }
  return i;
}
function Wr(e, t = {}, n, s) {
  for (var a in n) {
    var i = n[a];
    t[a] !== i && (n[a] == null ? e.style.removeProperty(a) : e.style.setProperty(a, i, s));
  }
}
function Zt(e, t, n, s) {
  var a = (
    /** @type {any} */
    e[ts]
  );
  if (a !== t) {
    var i = wl(t, s);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[ts] = t;
  } else s && (Array.isArray(s) ? (Wr(e, n?.[0], s[0]), Wr(e, n?.[1], s[1], "important")) : Wr(e, n, s));
  return s;
}
function lr(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!cs(t))
      return Ei();
    for (var s of e.options)
      s.selected = t.includes(zs(s));
    return;
  }
  for (s of e.options) {
    var a = zs(s);
    if (Yi(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function wr(e) {
  var t = new MutationObserver(() => {
    "__value" in e && lr(e, e.__value);
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
  }), Fr(() => {
    t.disconnect();
  });
}
function zs(e) {
  return "__value" in e ? e.__value : e.value;
}
const yl = Symbol("is custom element"), xl = Symbol("is html"), kl = ei ? "progress" : "PROGRESS";
function kn(e, t) {
  var n = ys(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== kl) || (e.value = t ?? "");
}
function Sl(e, t) {
  var n = ys(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function he(e, t, n, s) {
  var a = ys(e);
  a[t] !== (a[t] = n) && (t === "loading" && (e[Qa] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && El(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function ys(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[Js] ??= {
      [yl]: e.nodeName.includes("-"),
      [xl]: e.namespaceURI === ki
    }
  );
}
var Fs = /* @__PURE__ */ new Map();
function El(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Fs.get(t);
  if (n) return n;
  Fs.set(t, n = []);
  for (var s, a = e, i = Element.prototype; i !== a; ) {
    s = $a(a);
    for (var l in s)
      s[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    a = Vs(a);
  }
  return n;
}
class xs {
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
    var s = this.#e.get(t) || /* @__PURE__ */ new Set();
    return s.add(n), this.#e.set(t, s), this.#l().observe(t, this.#t), () => {
      var a = this.#e.get(t);
      a.delete(n), a.size === 0 && (this.#e.delete(t), this.#r.unobserve(t));
    };
  }
  #l() {
    return this.#r ?? (this.#r = new ResizeObserver(
      /** @param {any} entries */
      (t) => {
        for (var n of t) {
          xs.entries.set(n.target, n);
          for (var s of this.#e.get(n.target) || [])
            s(n);
        }
      }
    ));
  }
}
var Tl = /* @__PURE__ */ new xs({
  box: "border-box"
});
function Ls(e, t, n) {
  var s = Tl.observe(e, () => n(e[t]));
  gs(() => (en(() => n(e[t])), s));
}
function Gr(e, t) {
  return e === t || e?.[An] === t;
}
function hr(e = {}, t, n, s) {
  var a = (
    /** @type {ComponentContext} */
    Je.r
  ), i = (
    /** @type {Effect} */
    pe
  );
  return gs(() => {
    var l, u;
    return wa(() => {
      l = u, u = [], en(() => {
        Gr(n(...u), e) || (t(e, ...u), l && Gr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== a && o.parent !== null && o.parent.f & Qr; )
        o = o.parent;
      const c = () => {
        u && Gr(n(...u), e) && t(null, ...u);
      }, p = o.teardown;
      o.teardown = () => {
        c(), p?.();
      };
    };
  }), e;
}
function Ml(e, t) {
  Ci(window, ["resize"], () => Zn(() => t(window[e])));
}
function ee(e, t, n, s) {
  var a = !0, i = (n & mi) !== 0, l = (n & wi) !== 0, u = (
    /** @type {V} */
    s
  ), o = !0, c = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), p = () => l && a ? (c ??= /* @__PURE__ */ dr(
    /** @type {() => V} */
    s
  ), r(c)) : (o && (o = !1, u = l ? en(
    /** @type {() => V} */
    s
  ) : (
    /** @type {V} */
    s
  )), u);
  let m;
  if (i) {
    var g = An in e || Za in e;
    m = Bn(e, t)?.set ?? (g && t in e ? (I) => e[t] = I : void 0);
  }
  var h, _ = !1;
  i ? [h, _] = Pi(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && s !== void 0 && (h = p(), m && (oi(), m(h)));
  var w;
  if (w = () => {
    var I = (
      /** @type {V} */
      e[t]
    );
    return I === void 0 ? p() : (o = !0, I);
  }, (n & bi) === 0)
    return w;
  if (m) {
    var d = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(I, D) {
        return arguments.length > 0 ? ((!D || d || _) && m(D ? w() : I), I) : w();
      })
    );
  }
  var b = !1, y = ((n & _i) !== 0 ? dr : la)(() => (b = !1, w()));
  i && r(y);
  var M = (
    /** @type {Effect} */
    pe
  );
  return (
    /** @type {() => V} */
    (function(I, D) {
      if (arguments.length > 0) {
        const W = D ? r(y) : i ? Pe(I) : I;
        return k(y, W), b = !0, u !== void 0 && (u = W), I;
      }
      return nn && b || (M.f & ft) !== 0 ? y.v : r(y);
    })
  );
}
function Qn(e) {
  Je === null && ti(), qt(() => {
    const t = en(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Al = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Al);
function Rl(e) {
  const t = new URLSearchParams();
  for (const [s, a] of Object.entries(e))
    if (a != null)
      if (Array.isArray(a))
        for (const i of a) t.append(s, String(i));
      else
        t.set(s, String(a));
  const n = t.toString();
  return n ? "?" + n : "";
}
async function Kt(e, t = {}) {
  const n = await fetch(e + Rl(t));
  if (!n.ok) {
    const s = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${s.error ? " (" + s.error + ")" : ""}`);
  }
  return n.json();
}
async function jn(e, t) {
  const n = await fetch(e, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
  if (n.status === 204) return null;
  const s = await n.json().catch(() => ({}));
  if (!n.ok)
    throw new Error(`${e} ${n.status}${s.error ? " (" + s.error + ")" : ""}`);
  return s;
}
function Ds(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const De = {
  // --- reads
  photos: (e) => Kt("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => Kt("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => Kt("/api/triage/counts", { ...Ds(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Kt("/api/triage/files"),
  screen: (e, t = {}) => Kt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Kt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Kt("/api/triage/page", { ...Ds(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Kt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => jn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => jn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => jn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => jn("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => jn("/api/reveal", { id: e }),
  revealOrigin: (e) => jn("/api/reveal", { origin: e }),
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
  rebuildStatus: () => Kt("/api/triage/rebuild")
};
function Pl() {
  let e = 0, t = 0;
  return async function(s) {
    const a = ++e, i = await s();
    return a <= t ? { stale: !0, value: void 0 } : (t = a, { stale: !1, value: i });
  };
}
function Cl(e, t) {
  let n = 0;
  const s = (...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  };
  return s.cancel = () => clearTimeout(n), s.now = (...a) => {
    clearTimeout(n), e(...a);
  }, s;
}
const js = ["B", "KB", "MB", "GB", "TB"];
function Ct(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < js.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${js[n]}`;
}
function Re(e) {
  return (Number(e) || 0).toLocaleString();
}
const Kn = "G:\\photos", Hs = [
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
      value: t ? `${Kn}\\${t}\\${e.key}` : `${Kn}\\${e.key}`
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
function Na(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), s = Kn.toLowerCase();
  return n.toLowerCase().startsWith(s + "\\") ? n : "";
}
function ks(e, t) {
  const n = t.toLowerCase();
  return e.some((s) => n === s || n.startsWith(s + "\\"));
}
function Ol(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function Nl(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function Ia(e, t) {
  if (!t) return null;
  const n = e.find(
    (s) => s.term && s.term.column === t.column && s.term.op === t.op && Nl(s.term.value, t.value)
  );
  return n ? n.decision : null;
}
var Il = /* @__PURE__ */ N('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), zl = /* @__PURE__ */ N('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), Fl = /* @__PURE__ */ N('<div class="line muted svelte-1vgp6n7">…</div>'), Ll = /* @__PURE__ */ N('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), Dl = /* @__PURE__ */ N('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), jl = /* @__PURE__ */ N('<div class="line muted svelte-1vgp6n7"> </div>'), Hl = /* @__PURE__ */ N('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function ql(e, t) {
  ht(t, !0);
  let n = ee(t, "counts", 3, null), s = ee(t, "files", 3, null), a = ee(t, "filesAt", 3, null), i = ee(t, "stale", 3, !1), l = ee(t, "candidate", 3, null), u = ee(t, "busy", 3, !1);
  const o = /* @__PURE__ */ re(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var c = Hl(), p = f(c);
  let m;
  var g = v(f(p), 2);
  {
    var h = (H) => {
      var L = zl(), G = lt(L), P = f(G), O = f(P), ce = v(P, 2), z = f(ce), q = v(ce, 4), Q = f(q), le = v(q, 2), Y = f(le), J = v(G, 2);
      {
        var C = (V) => {
          var j = Il(), A = v(f(j), 2), x = f(A), S = v(A, 2), U = f(S), ne = v(S, 4), oe = f(ne), de = v(ne, 2), ae = f(de), ke = v(de, 2), me = f(ke);
          B(
            (Ee, Ce, ue, fe, Se) => {
              T(x, `kept ${Ee ?? ""}`), T(U, Ce), T(oe, `excluded ${ue ?? ""}`), T(ae, fe), T(me, `${r(o) >= 0 ? "+" : ""}${Se ?? ""} excluded`);
            },
            [
              () => Re(n().candidate_kept_paths),
              () => Ct(n().candidate_kept_bytes),
              () => Re(n().candidate_excluded_paths),
              () => Ct(n().candidate_excluded_bytes),
              () => Re(r(o))
            ]
          ), R(V, j);
        };
        Z(J, (V) => {
          l() && V(C);
        });
      }
      B(
        (V, j, A, x) => {
          T(O, `kept ${V ?? ""}`), T(z, j), T(Q, `excluded ${A ?? ""}`), T(Y, x);
        },
        [
          () => Re(n().kept_paths),
          () => Ct(n().kept_bytes),
          () => Re(n().excluded_paths),
          () => Ct(n().excluded_bytes)
        ]
      ), R(H, L);
    }, _ = (H) => {
      var L = Fl();
      R(H, L);
    };
    Z(g, (H) => {
      n() ? H(h) : H(_, -1);
    });
  }
  var w = v(p, 2);
  let d;
  var b = f(w), y = v(f(b), 3), M = f(y), I = v(y, 2);
  {
    var D = (H) => {
      var L = Ll();
      R(H, L);
    };
    Z(I, (H) => {
      i() && s() && s() !== "loading" && H(D);
    });
  }
  var W = v(b, 2);
  {
    var X = (H) => {
      var L = Dl(), G = lt(L);
      let P;
      var O = f(G), ce = f(O), z = v(O, 2), q = f(z), Q = v(z, 4), le = f(Q), Y = v(Q, 2), J = f(Y), C = v(G, 2), V = f(C);
      B(
        (j, A, x, S) => {
          P = Me(G, 1, "line svelte-1vgp6n7", null, P, { outdated: i() }), T(ce, `kept ${j ?? ""}`), T(q, A), T(le, `excluded ${x ?? ""}`), T(J, S), T(V, `as of ${a() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Re(s().kept_files),
          () => Ct(s().kept_bytes),
          () => Re(s().excluded_files),
          () => Ct(s().excluded_bytes)
        ]
      ), R(H, L);
    }, te = (H) => {
      var L = jl(), G = f(L);
      B(() => T(G, s() === "loading" ? "counting…" : "not counted yet")), R(H, L);
    };
    Z(W, (H) => {
      s() && s() !== "loading" ? H(X) : H(te, -1);
    });
  }
  B(() => {
    m = Me(p, 1, "block svelte-1vgp6n7", null, m, { busy: u() }), d = Me(w, 1, "block svelte-1vgp6n7", null, d, { busy: s() === "loading" }), y.disabled = s() === "loading", T(M, s() === "loading" ? "counting…" : "recount");
  }), K("click", y, function(...H) {
    t.onfiles?.apply(this, H);
  }), R(e, c), vt();
}
Lt(["click"]);
const os = "http://www.w3.org/2000/svg", Sn = {
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
}, _n = {
  ...Sn,
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
}, Bl = [
  { dark: "tint", light: "tintLight", base: Sn },
  { dark: "control", light: "controlLight", base: _n },
  { dark: "ink", light: "inkLight", base: _n },
  { dark: "tally", light: "tallyLight", base: _n },
  { dark: "tallyInk", light: "tallyInkLight", base: _n }
], us = /* @__PURE__ */ new Set();
let Ot = { ..._n };
function Ul() {
  return Ot;
}
function $r(e) {
  Ot = $l(e), Ss();
  for (const t of us) t(Ot);
  return Ot;
}
function Wl(e) {
  return us.add(e), () => us.delete(e);
}
function or(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function Gl(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: Be(or(e.r, t.r), 0, 255),
    g: Be(or(e.g, t.g), 0, 255),
    b: Be(or(e.b, t.b), 0, 255),
    a: Be(or(e.a, t.a), 0, 1)
  };
}
function $l(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [s, a] of Object.entries(_n))
    typeof a == "boolean" ? n[s] = t[s] === void 0 ? a : !!t[s] : typeof a == "object" ? n[s] = Gl(t[s], a) : n[s] = or(t[s], a);
  return n;
}
function mt({ r: e, g: t, b: n, a: s }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Ne(s, 3)})`;
}
function Ne(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function qs({ r: e, g: t, b: n, a: s }) {
  return { r: e, g: t, b: n, a: Be(s * 1.7 + 0.22, 0, 1) };
}
function Bs(e, t) {
  const n = 0.4 + Be(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - Be(t, 0, 100) / 100) };
}
function Us(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, a = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? Be(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * a * Math.max(t.glareFactor, 0) / 100;
  return Be(i ** (0.1 + Be(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const Yl = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function Vl(e, t, n) {
  const s = Be(n.shapeRoundness, 2, 7), a = e / 2, i = t / 2, l = Math.min(n.shapeRadius, a, i), u = a - l, o = i - l, c = 8, p = [];
  for (let h = 0; h <= c; h++) {
    const _ = h / c * (Math.PI / 2);
    p.push([l * Math.cos(_) ** (2 / s), l * Math.sin(_) ** (2 / s)]);
  }
  const m = [], g = (h, _, w, d) => {
    let b = Math.atan2(h, -_);
    b < 0 && (b += Math.PI * 2);
    let y = Math.atan2(d, w);
    y < 0 && (y += Math.PI * 2);
    const M = Ne(Us(y, n), 3);
    m.push(`rgba(255, 255, 255, ${M}) ${Ne(b / (Math.PI * 2) * 100, 2)}%`);
  };
  g(0, -i, 0, 1);
  for (const [h, _, w] of Yl)
    for (let d = 0; d <= c; d++) {
      const [b, y] = p[w ? c - d : d];
      g(h * (u + b), _ * (o + y), h * b ** (s - 1), -_ * y ** (s - 1));
    }
  return m.push(`rgba(255, 255, 255, ${Ne(Us(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function Ss() {
  const e = Ot, t = document.documentElement.style, n = Bs(e.refFresnelRange, e.refFresnelHardness), s = Bs(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Ne(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Ne(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", mt(e.tint)), t.setProperty("--glass-tint-light", mt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", mt(qs(e.tint))), t.setProperty("--glass-tint-sheet-light", mt(qs(e.tintLight))), t.setProperty("--glass-ctl-dark", mt(e.control)), t.setProperty("--glass-ctl-light", mt(e.controlLight)), t.setProperty("--glass-text-dark", mt(e.ink)), t.setProperty("--glass-text-light", mt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", mt(e.tally)), t.setProperty("--glass-tint-tally-light", mt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", mt(e.tallyInk)), t.setProperty("--glass-text-tally-light", mt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Ne(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Ne(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Ne(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Ne(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Ne(e.shadowX)}px ${Ne(-e.shadowY)}px ${Ne(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Ne(Be(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Ne(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Ne(Math.log2(Be(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Ne(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Ne(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Ne(Be(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Ne(s.width)}px`), t.setProperty("--glass-glare-blur", `${Ne(s.blur)}px`);
}
function Be(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function Kl(e, t, n, s, a, i) {
  const l = Math.abs(e) - n + a, u = Math.abs(t) - s + a, o = Math.max(l, 0), c = Math.max(u, 0), p = i === 2 ? Math.hypot(o, c) : (o ** i + c ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + p - a;
}
function Xl(e, t, n) {
  const s = e / 2, a = t / 2, i = Be(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), c = (g, h) => Kl(g - s, h - a, s, a, l, i), p = 256, m = new Float32Array(p + 1);
  for (let g = 0; g <= p; g++) {
    const h = 1 - g / p, _ = Math.asin(Be(h * h, 0, 1)), w = Math.asin(Be(Math.sin(_) / o, 0, 1));
    m[g] = Math.tan(_ - w) * u;
  }
  return (g, h) => {
    const _ = -c(g, h);
    if (_ < 0 || _ >= u) return null;
    const w = m[Math.round(_ / u * p)];
    if (w === 0) return null;
    const d = 0.75, b = c(g + d, h) - c(g - d, h), y = c(g, h + d) - c(g, h - d), M = Math.hypot(b, y);
    if (M === 0) return null;
    const I = -w / M;
    return { dx: b * I, dy: y * I };
  };
}
function Jl(e, t, n) {
  const s = document.createElement("canvas");
  s.width = e, s.height = t;
  const a = s.getContext("2d"), i = a.createImageData(e, t), l = i.data, u = e * t, o = new Float32Array(u), c = new Float32Array(u);
  let p = 0;
  for (let g = 0; g < t; g++)
    for (let h = 0; h < e; h++) {
      const _ = n(h + 0.5, g + 0.5);
      if (!_) continue;
      const w = g * e + h;
      o[w] = _.dx, c[w] = _.dy;
      const d = Math.hypot(_.dx, _.dy);
      d > p && (p = d);
    }
  const m = p > 0 ? 127 / p : 0;
  for (let g = 0; g < u; g++) {
    const h = g * 4;
    l[h] = 128 + Be(Math.round(o[g] * m), -127, 127), l[h + 1] = 128 + Be(Math.round(c[g] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return a.putImageData(i, 0, 0), { url: s.toDataURL(), scale: p * 2 };
}
const Yr = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function Vr(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Ne(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let rr = null, Zl = 0;
function Ql() {
  if (rr) return rr;
  const e = document.createElementNS(os, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), rr = document.createElementNS(os, "defs"), e.appendChild(rr), document.body.appendChild(e), rr;
}
function pn(e) {
  const t = `glass-refract-${++Zl}`, n = document.createElementNS(os, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), Ql().appendChild(n);
  let s = 0, a = 0, i = 0, l = 0;
  const u = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, c = "";
  function p() {
    e.style.setProperty("--glass-pre", Ot.blurEdge ? "" : c), e.style.setProperty("--glass-post", Ot.blurEdge ? c : "");
  }
  function m() {
    s < 2 || a < 2 || e.style.setProperty("--glass-glare", Vl(s, a, Ot));
  }
  function g() {
    if (s < 2 || a < 2) return;
    const d = Ot, b = Jl(s, a, Xl(s, a, d)), y = d.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(s)), n.setAttribute("height", String(a)), n.innerHTML = `<feImage x="0" y="0" width="${s}" height="${a}" preserveAspectRatio="none" href="${b.url}" result="map"/>` + Vr(b.scale * (1 + y), Yr[0], "r") + Vr(b.scale, Yr[1], "g") + Vr(b.scale * (1 - y), Yr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, c = `url(#${n.id})`, p(), getComputedStyle(e).backdropFilter.includes("url(") || (c = "", p()), o = u.map((M) => Ot[M]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, g();
    }));
  }
  const _ = new ResizeObserver(([d]) => {
    const b = d.borderBoxSize?.[0], y = b ? { w: Math.round(b.inlineSize), h: Math.round(b.blockSize) } : { w: Math.round(d.contentRect.width), h: Math.round(d.contentRect.height) };
    y.w === s && y.h === a || (s = y.w, a = y.h, m(), h());
  });
  _.observe(e);
  const w = Wl(() => {
    m(), u.map((d) => Ot[d]).join(" ") !== o ? h() : p();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), _.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const za = "photos.stack", Kr = { on: !1, window: 4 }, Fa = 1, La = 10;
function eo() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(za) ?? "");
  } catch {
    return { ...Kr };
  }
  if (e === null || typeof e != "object") return { ...Kr };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= Fa && t <= La ? t : Kr.window
  };
}
function to(e) {
  return localStorage.setItem(za, JSON.stringify({ on: e.on, window: e.window })), e;
}
const Da = "photos.theme", ja = "dark";
function Ha() {
  return document.documentElement.dataset.theme === "light" ? "light" : ja;
}
function no() {
  const e = localStorage.getItem(Da), t = e === "dark" || e === "light" ? e : ja;
  return document.documentElement.dataset.theme = t, t;
}
function qa(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(Da, e), e;
}
var ro = /* @__PURE__ */ N('<div class="glass marks svelte-zne36e"><span class="nums svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span></span> <button class="menu small svelte-zne36e" title="Copy the conditions and the marked ids to the clipboard">Share</button> <button class="menu small svelte-zne36e">Clear</button></div>'), so = /* @__PURE__ */ N('<span class="spin svelte-zne36e" aria-label="loading"></span>'), Ws = /* @__PURE__ */ N('<span class="badge svelte-zne36e"> </span>'), ao = /* @__PURE__ */ N('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), io = /* @__PURE__ */ N('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), lo = /* @__PURE__ */ N("<button> </button>"), oo = /* @__PURE__ */ N('<div class="glass sheet sorts svelte-zne36e"></div>'), uo = /* @__PURE__ */ N(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), co = /* @__PURE__ */ N('<p class="muted svelte-zne36e">loading…</p>'), fo = /* @__PURE__ */ N('<span class="help svelte-zne36e">?</span>'), ho = /* @__PURE__ */ N('<span class="n svelte-zne36e"> </span>'), vo = /* @__PURE__ */ N("<button> <!></button>"), po = /* @__PURE__ */ N('<span class="muted svelte-zne36e">nothing here</span>'), go = /* @__PURE__ */ N('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), _o = /* @__PURE__ */ N('<div class="glass sheet filters svelte-zne36e"><!></div>'), bo = /* @__PURE__ */ N('<div class="topbar svelte-zne36e"><div class="panes svelte-zne36e"><!> <div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <button role="switch" title="Mark tiles by clicking them, then copy their ids">Select</button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function mo(e, t) {
  ht(t, !0);
  let n = ee(t, "facets", 3, null), s = ee(t, "selected", 19, () => ({})), a = ee(t, "sort", 3, "newest"), i = ee(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = ee(t, "total", 3, null), u = ee(t, "tiles", 3, null), o = ee(t, "loading", 3, !1), c = ee(t, "selecting", 3, !1), p = ee(t, "marked", 19, () => ({ stacks: 0, photos: 0 })), m = ee(t, "onselect", 3, () => {
  }), g = ee(t, "onsort", 3, () => {
  }), h = ee(t, "onstack", 3, () => {
  }), _ = ee(t, "onclear", 3, () => {
  }), w = ee(t, "onselecting", 3, () => {
  }), d = ee(t, "onshare", 3, () => {
  }), b = ee(t, "onunmark", 3, () => {
  }), y = ee(t, "ontriage", 3, () => {
  }), M = /* @__PURE__ */ $(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), I = /* @__PURE__ */ $(Pe(Ha())), D = /* @__PURE__ */ $(null);
  const W = /* @__PURE__ */ re(() => u() ?? l()), X = /* @__PURE__ */ re(() => n()?.dimensions ?? []), te = /* @__PURE__ */ re(() => n()?.sorts ?? []), H = /* @__PURE__ */ re(() => r(te).find((F) => F.value === a())?.label ?? a()), L = /* @__PURE__ */ re(() => Object.values(s()).reduce((F, ie) => F + ie.length, 0)), G = /* @__PURE__ */ re(() => r(X).flatMap((F) => (s()[F.name] ?? []).map((ie) => ({
    dimension: F.name,
    value: ie,
    title: F.title,
    label: F.options.find((ve) => ve.value === ie)?.label ?? String(ie)
  }))));
  function P(F, ie) {
    const ve = s()[F] ?? [], ze = ve.includes(ie) ? ve.filter((xe) => xe !== ie) : [...ve, ie];
    m()(F, ze);
  }
  function O(F, ie) {
    return (s()[F] ?? []).includes(ie);
  }
  function ce() {
    k(I, qa(r(I) === "dark" ? "light" : "dark"), !0);
  }
  let z = /* @__PURE__ */ $(null);
  const q = /* @__PURE__ */ re(() => r(z) ?? i().window);
  function Q(F) {
    k(z, Number(F), !0);
  }
  function le(F) {
    k(z, null), h()({ ...i(), window: Number(F) });
  }
  qt(() => {
    r(M) !== "stacks" && k(z, null);
  });
  function Y(F) {
    F.key === "Escape" && k(M, "");
  }
  function J(F) {
    r(M) && !F.target.closest(".topbar") && k(M, "");
  }
  Qn(() => {
    const F = new ResizeObserver(([ie]) => {
      const ve = Math.round(ie.borderBoxSize?.[0]?.blockSize ?? ie.contentRect.height);
      document.documentElement.style.setProperty("--header-h", ve + "px");
    });
    return F.observe(r(D)), () => {
      F.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var C = bo();
  Mn("keydown", mn, Y), Mn("pointerdown", mn, J);
  var V = f(C), j = f(V);
  {
    var A = (F) => {
      var ie = ro(), ve = f(ie), ze = f(ve), xe = f(ze), be = v(ze, 2), Fe = f(be), tt = v(be, 2), $t = f(tt), Oe = v(tt, 2), an = f(Oe), Yt = v(ve, 2), _t = v(Yt, 2);
      vn(ie, (ln) => pn?.(ln)), B(
        (ln, er) => {
          T(xe, ln), T(Fe, p().stacks === 1 ? "stack" : "stacks"), T($t, er), T(an, p().photos === 1 ? "photo" : "photos");
        },
        [() => Re(p().stacks), () => Re(p().photos)]
      ), K("click", Yt, () => d()()), K("click", _t, () => b()()), R(F, ie);
    };
    Z(j, (F) => {
      p().stacks && F(A);
    });
  }
  var x = v(j, 2), S = f(x), U = f(S), ne = v(S, 2), oe = f(ne), de = v(ne, 2);
  {
    var ae = (F) => {
      var ie = so();
      R(F, ie);
    };
    Z(de, (F) => {
      o() && F(ae);
    });
  }
  vn(x, (F) => pn?.(F));
  var ke = v(V, 2), me = f(ke), Ee = f(me), Ce = f(Ee);
  let ue;
  var fe = f(Ce), Se = v(Ce, 2);
  let ye;
  var We = v(f(Se));
  {
    var Ze = (F) => {
      var ie = Ws(), ve = f(ie);
      B(() => T(ve, r(L))), R(F, ie);
    };
    Z(We, (F) => {
      r(L) && F(Ze);
    });
  }
  var Ge = v(Se, 2);
  let Tt;
  var Wt = v(f(Ge));
  {
    var yn = (F) => {
      var ie = Ws(), ve = f(ie);
      B((ze) => T(ve, ze), [() => Re(l())]), R(F, ie);
    };
    Z(Wt, (F) => {
      i().on && l() !== null && F(yn);
    });
  }
  var Qe = v(Ge, 2);
  let Ve;
  var Mt = v(Qe, 2);
  {
    var Gt = (F) => {
      var ie = io(), ve = f(ie);
      Ye(ve, 17, () => r(G), (xe) => xe.dimension + " " + xe.value, (xe, be) => {
        var Fe = ao(), tt = f(Fe), $t = f(tt), Oe = v(tt, 1, !0);
        B(() => {
          he(Fe, "title", `${r(be).title ?? ""}: ${r(be).label ?? ""} — click to remove`), T($t, r(be).title), T(Oe, r(be).label);
        }), K("click", Fe, () => P(r(be).dimension, r(be).value)), R(xe, Fe);
      });
      var ze = v(ve, 2);
      K("click", ze, () => _()()), R(F, ie);
    };
    Z(Mt, (F) => {
      r(G).length && F(Gt);
    });
  }
  var st = v(Ee, 2), sn = f(st), pt = v(st, 2);
  vn(me, (F) => pn?.(F));
  var gt = v(me, 2);
  {
    var At = (F) => {
      var ie = oo();
      Ye(ie, 21, () => r(te), xt, (ve, ze) => {
        var xe = lo();
        let be;
        var Fe = f(xe);
        B(() => {
          be = Me(xe, 1, "option svelte-zne36e", null, be, { on: r(ze).value === a() }), T(Fe, r(ze).label);
        }), K("click", xe, () => {
          g()(r(ze).value), k(M, "");
        }), R(ve, xe);
      }), vn(ie, (ve) => pn?.(ve)), R(F, ie);
    };
    Z(gt, (F) => {
      r(M) === "sort" && F(At);
    });
  }
  var $e = v(gt, 2);
  {
    var Rt = (F) => {
      var ie = uo(), ve = f(ie), ze = v(f(ve), 2), xe = f(ze);
      let be;
      var Fe = f(xe), tt = v(ve, 2), $t = v(f(tt), 2), Oe = f($t), an = v(Oe, 2), Yt = f(an);
      vn(ie, (_t) => pn?.(_t)), B(() => {
        be = Me(xe, 1, "option svelte-zne36e", null, be, { on: i().on }), he(xe, "aria-checked", i().on), T(Fe, i().on ? "On" : "Off"), he(Oe, "min", Fa), he(Oe, "max", La), kn(Oe, r(q)), he(Oe, "aria-valuetext", `${r(q) ?? ""} seconds`), T(Yt, `${r(q) ?? ""}s`);
      }), K("click", xe, () => h()({ ...i(), on: !i().on })), K("input", Oe, (_t) => Q(_t.currentTarget.value)), K("change", Oe, (_t) => le(_t.currentTarget.value)), R(F, ie);
    };
    Z($e, (F) => {
      r(M) === "stacks" && F(Rt);
    });
  }
  var Dt = v($e, 2);
  {
    var et = (F) => {
      var ie = _o(), ve = f(ie);
      {
        var ze = (be) => {
          var Fe = co();
          R(be, Fe);
        }, xe = (be) => {
          var Fe = ws(), tt = lt(Fe);
          Ye(tt, 17, () => r(X), xt, ($t, Oe) => {
            var an = go(), Yt = f(an), _t = f(Yt), ln = v(_t);
            {
              var er = (ge) => {
                var Te = fo();
                B(() => he(Te, "title", r(Oe).hint)), R(ge, Te);
              };
              Z(ln, (ge) => {
                r(Oe).hint && ge(er);
              });
            }
            var Lr = v(Yt, 2), _r = f(Lr);
            Ye(_r, 17, () => r(Oe).options, xt, (ge, Te) => {
              var Le = vo();
              let bt;
              var Vt = f(Le), on = v(Vt);
              {
                var ut = (jt) => {
                  var xn = ho(), Ke = f(xn);
                  B((ct) => T(Ke, ct), [() => Re(r(Te).count)]), R(jt, xn);
                };
                Z(on, (jt) => {
                  r(Te).count !== null && jt(ut);
                });
              }
              B(
                (jt) => {
                  bt = Me(Le, 1, "option svelte-zne36e", null, bt, jt), T(Vt, `${r(Te).label ?? ""} `);
                },
                [
                  () => ({ on: O(r(Oe).name, r(Te).value) })
                ]
              ), K("click", Le, () => P(r(Oe).name, r(Te).value)), R(ge, Le);
            });
            var E = v(_r, 2);
            {
              var se = (ge) => {
                var Te = po();
                R(ge, Te);
              };
              Z(E, (ge) => {
                r(Oe).options.length || ge(se);
              });
            }
            B(() => T(_t, `${r(Oe).title ?? ""} `)), R($t, an);
          }), R(be, Fe);
        };
        Z(ve, (be) => {
          n() ? be(xe, -1) : be(ze);
        });
      }
      vn(ie, (be) => pn?.(be)), R(F, ie);
    };
    Z(Dt, (F) => {
      r(M) === "filters" && F(et);
    });
  }
  hr(C, (F) => k(D, F), () => r(D)), B(
    (F) => {
      T(U, F), T(oe, r(W) === 1 ? "photo" : "photos"), ue = Me(Ce, 1, "menu svelte-zne36e", null, ue, { open: r(M) === "sort" }), he(Ce, "aria-expanded", r(M) === "sort"), T(fe, r(H)), ye = Me(Se, 1, "menu svelte-zne36e", null, ye, { open: r(M) === "filters", on: r(L) > 0 }), he(Se, "aria-expanded", r(M) === "filters"), Tt = Me(Ge, 1, "menu svelte-zne36e", null, Tt, { open: r(M) === "stacks", on: i().on }), he(Ge, "aria-expanded", r(M) === "stacks"), Ve = Me(Qe, 1, "menu svelte-zne36e", null, Ve, { on: c() }), he(Qe, "aria-checked", c()), he(st, "title", r(I) === "dark" ? "Switch to a white background" : "Switch to a black background"), he(st, "aria-label", r(I) === "dark" ? "Switch to a white background" : "Switch to a black background"), T(sn, r(I) === "dark" ? "☀" : "☾");
    },
    [() => r(W) === null ? "…" : Re(r(W))]
  ), K("click", Ce, () => k(M, r(M) === "sort" ? "" : "sort", !0)), K("click", Se, () => k(M, r(M) === "filters" ? "" : "filters", !0)), K("click", Ge, () => k(M, r(M) === "stacks" ? "" : "stacks", !0)), K("click", Qe, () => w()(!c())), K("click", st, ce), K("click", pt, () => y()()), R(e, C), vt();
}
Lt(["click", "input", "change"]);
const Pt = 4, Or = 220, wo = 340;
function Nr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function yo(e, t, n, s, a) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, u = 0, o = 1 / 0;
    for (; l < e.length && (u += Nr(e[l]), l++, o = (n - Pt * (l - i - 1)) / u, !(o <= Or)); )
      ;
    if (o > Or && !s) break;
    a(i, l, Math.round(Math.min(o, wo))), i = l;
  }
  return i;
}
function xo(e, t, n) {
  const s = [];
  let a = 0;
  for (let i = e.from; i < e.to; i++) {
    const u = i === e.to - 1 ? n - a : Math.round(Nr(t[i]) * e.height);
    s.push({ index: i, x: a, w: u }), a += u + Pt;
  }
  return s;
}
function Gs(e, t, n) {
  if (!e.length) return null;
  let s = 0, a = e.length - 1;
  for (; s < a; ) {
    const l = s + a >> 1;
    e[l].top + e[l].height < t ? s = l + 1 : a = l;
  }
  const i = s;
  for (a = e.length - 1; s < a; ) {
    const l = s + a + 1 >> 1;
    e[l].top <= n ? s = l : a = l - 1;
  }
  return [i, Math.max(i, s)];
}
var ko = /* @__PURE__ */ N('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), So = /* @__PURE__ */ N('<div role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Previous tile" aria-label="Previous tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M14.5 5 7.5 12l7 7"></path></svg></button></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Next tile" aria-label="Next tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M9.5 5l7 7-7 7"></path></svg></button></div></div>');
function Eo(e, t) {
  ht(t, !0);
  let n = ee(t, "frames", 19, () => []), s = ee(t, "origin", 3, null), a = ee(t, "back", 3, !1), i = ee(t, "forward", 3, !1), l = ee(t, "onstep", 3, () => {
  }), u = ee(t, "onreveal", 3, () => {
  }), o = ee(t, "onclose", 3, () => {
  });
  const c = 40, p = 72, m = /* @__PURE__ */ re(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let g = /* @__PURE__ */ $(Pe(document.documentElement.clientWidth)), h = /* @__PURE__ */ $(Pe(document.documentElement.clientHeight)), _ = /* @__PURE__ */ $(null), w = /* @__PURE__ */ $(Pe(/* @__PURE__ */ new Set()));
  const d = 4, b = 25, y = { x: 0, y: 0, w: 0, h: 0 }, M = /* @__PURE__ */ re(() => Math.max(0, r(g) - p * 2)), I = /* @__PURE__ */ re(() => Math.max(0, r(h) - c * 2)), D = /* @__PURE__ */ re(() => r(M) > 0 && r(I) > 0 ? H(n(), r(M), r(I)) : n().map(() => y));
  function W(A, x, S) {
    const U = [];
    let ne = 0, oe = 0;
    for (let de = 0; de < A.length; de++)
      oe += Nr(A[de]), oe * S + Pt * (de - ne) >= x && (U.push({ from: ne, to: de + 1, sum: oe }), ne = de + 1, oe = 0);
    return ne < A.length && U.push({ from: ne, to: A.length, sum: oe }), U;
  }
  function X(A, x, S) {
    return A.map((U, ne) => {
      const oe = (x - Pt * (U.to - U.from - 1)) / U.sum;
      return ne === A.length - 1 && oe > S ? S : oe;
    });
  }
  function te(A, x, S) {
    return X(A, x, S).reduce((U, ne) => U + ne, 0) + Pt * (A.length - 1);
  }
  function H(A, x, S) {
    let U = d, ne = Math.max(d, S);
    for (let me = 0; me < b; me++) {
      const Ee = (U + ne) / 2;
      te(W(A, x, Ee), x, Ee) <= S ? U = Ee : ne = Ee;
    }
    const oe = W(A, x, U), de = X(oe, x, U), ae = [];
    let ke = (S - (de.reduce((me, Ee) => me + Ee, 0) + Pt * (oe.length - 1))) / 2;
    return oe.forEach((me, Ee) => {
      const Ce = de[Ee], ue = [];
      for (let ye = me.from; ye < me.to; ye++) ue.push(Nr(A[ye]) * Ce);
      const fe = ue.reduce((ye, We) => ye + We, 0) + Pt * (ue.length - 1);
      let Se = (x - fe) / 2;
      for (const ye of ue)
        ae.push({
          x: Math.round(Se),
          y: Math.round(ke),
          w: Math.round(ye),
          h: Math.round(Ce)
        }), Se += ye + Pt;
      ke += Ce + Pt;
    }), ae;
  }
  function L(A) {
    if (!s() || !A || !A.w || !A.h) return "none";
    const x = s().left - (p + A.x), S = s().top - (c + A.y);
    return `translate(${x}px, ${S}px) scale(${s().width / A.w}, ${s().height / A.h})`;
  }
  const G = 1600;
  let P = /* @__PURE__ */ $(!1), O = 0;
  function ce() {
    k(P, !1), clearTimeout(O), O = setTimeout(() => k(P, !0), G);
  }
  function z(A) {
    if (A.key === "Escape") {
      o()();
      return;
    }
    A.key !== "ArrowLeft" && A.key !== "ArrowRight" || (A.preventDefault(), l()(A.key === "ArrowLeft" ? -1 : 1, A.repeat));
  }
  function q(A) {
    A.target.closest(".frame, .lane") || o()();
  }
  Qn(() => (r(_)?.focus(), ce(), () => clearTimeout(O)));
  var Q = So();
  Mn("keydown", mn, z), Mn("pointerdown", mn, q), Mn("pointermove", mn, ce);
  let le;
  var Y = f(Q);
  Zt(Y, "", {}, { inset: "40px 72px" }), Ye(Y, 23, n, (A) => A.id, (A, x, S) => {
    var U = ko();
    let ne;
    var oe = f(U);
    let de;
    B(
      (ae, ke) => {
        ne = Zt(U, "", ne, ae), he(oe, "src", `/d/${r(x).s ?? ""}.webp`), de = Me(oe, 1, "svelte-5g1i2z", null, de, ke);
      },
      [
        () => ({
          left: `${r(D)[r(S)].x ?? ""}px`,
          top: `${r(D)[r(S)].y ?? ""}px`,
          width: `${r(D)[r(S)].w ?? ""}px`,
          height: `${r(D)[r(S)].h ?? ""}px`,
          "--flight": L(r(D)[r(S)])
        }),
        () => ({ loaded: r(w).has(r(x).id) })
      ]
    ), K("click", U, () => u()(r(x))), Mn("load", oe, () => k(w, new Set(r(w)).add(r(x).id), !0)), R(A, U);
  });
  var J = v(Y, 2);
  Zt(J, "", {}, { width: "44px", left: "14px" });
  var C = f(J);
  vn(C, (A) => pn?.(A));
  var V = v(J, 2);
  Zt(V, "", {}, { width: "44px", right: "14px" });
  var j = f(V);
  vn(j, (A) => pn?.(A)), hr(Q, (A) => k(_, A), () => r(_)), B(() => {
    le = Me(Q, 1, "glass pane svelte-5g1i2z", null, le, { resting: r(P) }), he(Q, "aria-label", r(m)), C.disabled = !a(), j.disabled = !i();
  }), K("click", C, () => l()(-1)), K("click", j, () => l()(1)), Ls(Q, "clientWidth", (A) => k(g, A)), Ls(Q, "clientHeight", (A) => k(h, A)), R(e, Q), vt();
}
Lt(["click"]);
var To = /* @__PURE__ */ N('<span class="err svelte-uzy12d"> </span>'), Mo = /* @__PURE__ */ N(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Ao = /* @__PURE__ */ N(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), Ro = /* @__PURE__ */ N('<span class="muted svelte-uzy12d"> </span>'), Po = /* @__PURE__ */ N('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function Co(e, t) {
  ht(t, !0);
  let n = /* @__PURE__ */ $(null), s = /* @__PURE__ */ $(!1), a = /* @__PURE__ */ $(null);
  async function i() {
    k(s, !0), k(a, null);
    try {
      k(n, await De.probe(), !0);
    } catch (h) {
      k(a, String(h), !0);
    } finally {
      k(s, !1);
    }
  }
  var l = Po(), u = f(l), o = f(u), c = v(u, 2);
  {
    var p = (h) => {
      var _ = To(), w = f(_);
      B(() => T(w, r(a))), R(h, _);
    }, m = (h) => {
      var _ = ws(), w = lt(_);
      {
        var d = (y) => {
          var M = Mo(), I = v(f(M), 2);
          B(
            (D) => T(I, ` above are formats the header
        reader cannot measure (${D ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), R(y, M);
        }, b = (y) => {
          var M = Ao(), I = f(M), D = f(I), W = v(I, 2), X = f(W);
          B(
            (te) => {
              T(D, te), T(X, r(n).command);
            },
            [() => Re(r(n).worklist)]
          ), R(y, M);
        };
        Z(w, (y) => {
          r(n).worklist === 0 ? y(d) : y(b, -1);
        });
      }
      R(h, _);
    }, g = (h) => {
      var _ = Ro(), w = f(_);
      B(() => T(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), R(h, _);
    };
    Z(c, (h) => {
      r(a) ? h(p) : r(n) ? h(m, 1) : h(g, -1);
    });
  }
  B(() => {
    u.disabled = r(s), T(o, r(s) ? "counting…" : "Check the dimension probe's worklist");
  }), K("click", u, i), R(e, l), vt();
}
Lt(["click"]);
var Oo = /* @__PURE__ */ N('<p class="bad svelte-1xjbga"> </p>'), No = /* @__PURE__ */ N('<pre class="svelte-1xjbga"> </pre>'), Io = /* @__PURE__ */ N('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), zo = /* @__PURE__ */ N(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), Fo = /* @__PURE__ */ N('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), Lo = /* @__PURE__ */ N('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), Do = /* @__PURE__ */ N(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), jo = /* @__PURE__ */ N('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), Ho = /* @__PURE__ */ N(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function qo(e, t) {
  ht(t, !0);
  let n = /* @__PURE__ */ $(null), s = /* @__PURE__ */ $(!1), a = /* @__PURE__ */ $(null), i = /* @__PURE__ */ $(null);
  const l = /* @__PURE__ */ re(() => r(n)?.state === "running"), u = /* @__PURE__ */ re(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const y = await De.rebuildStatus();
      k(n, y, !0), k(a, null), y.state === "done" && y.started_at !== r(i) && (k(i, y.started_at, !0), t.oncomplete?.());
    } catch (y) {
      k(a, String(y), !0);
    }
  }
  Qn(() => {
    o();
  }), qt(() => {
    if (!r(l)) return;
    const y = setInterval(o, 700);
    return () => clearInterval(y);
  });
  async function c() {
    k(s, !0), k(a, null);
    try {
      k(n, await De.rebuild(), !0);
    } catch (y) {
      k(a, String(y), !0);
    }
  }
  function p(y) {
    y.key === "Escape" && k(s, !1);
  }
  var m = Ho();
  Mn("keydown", mn, p);
  var g = lt(m), h = f(g), _ = f(h), w = v(h, 2), d = v(g, 2);
  {
    var b = (y) => {
      var M = jo(), I = lt(M), D = v(I, 2), W = f(D), X = v(f(W), 4), te = f(X), H = v(X, 2), L = v(W, 2);
      {
        var G = (Y) => {
          var J = Oo(), C = f(J);
          B(() => T(C, r(a))), R(Y, J);
        };
        Z(L, (Y) => {
          r(a) && Y(G);
        });
      }
      var P = v(L, 2);
      Ye(P, 17, () => r(n)?.steps ?? [], xt, (Y, J) => {
        var C = Io();
        let V;
        var j = f(C), A = f(j), x = f(A);
        {
          var S = (ue) => {
            var fe = qn("✓");
            R(ue, fe);
          }, U = (ue) => {
            var fe = qn("✕");
            R(ue, fe);
          }, ne = (ue) => {
            var fe = qn("·");
            R(ue, fe);
          }, oe = (ue) => {
            var fe = qn(" ");
            R(ue, fe);
          };
          Z(x, (ue) => {
            r(J).state === "done" ? ue(S) : r(J).state === "failed" ? ue(U, 1) : r(J).state === "running" ? ue(ne, 2) : ue(oe, -1);
          });
        }
        var de = v(A, 2), ae = f(de), ke = v(de, 4), me = f(ke), Ee = v(j, 2);
        {
          var Ce = (ue) => {
            var fe = No(), Se = f(fe);
            B((ye) => T(Se, ye), [() => r(J).log.join(`
`)]), R(ue, fe);
          };
          Z(Ee, (ue) => {
            r(J).log.length && ue(Ce);
          });
        }
        B(() => {
          V = Me(C, 1, "step svelte-1xjbga", null, V, {
            on: r(J).state === "running",
            bad: r(J).state === "failed"
          }), T(ae, r(J).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), T(me, r(J).seconds === null ? "" : r(J).seconds + "s");
        }), R(Y, C);
      });
      var O = v(P, 2);
      {
        var ce = (Y) => {
          var J = zo(), C = lt(J), V = f(C);
          B(() => T(V, r(n).error)), R(Y, J);
        }, z = (Y) => {
          var J = Fo();
          R(Y, J);
        }, q = (Y) => {
          var J = Lo();
          R(Y, J);
        };
        Z(O, (Y) => {
          r(n)?.state === "failed" ? Y(ce) : r(n)?.state === "done" ? Y(z, 1) : r(l) && Y(q, 2);
        });
      }
      var Q = v(O, 2);
      {
        var le = (Y) => {
          var J = Do(), C = v(f(J), 6), V = f(C);
          B(() => T(V, `python -m photolib.restore_state ${r(u) ?? ""}`)), R(Y, J);
        };
        Z(Q, (Y) => {
          r(u) && Y(le);
        });
      }
      B(() => T(te, `${r(n)?.seconds ?? 0 ?? ""}s`)), K("click", I, () => k(s, !1)), K("click", H, () => k(s, !1)), R(y, M);
    };
    Z(d, (y) => {
      r(s) && y(b);
    });
  }
  B(() => {
    h.disabled = r(l), T(_, r(l) ? "applying…" : "Apply to grid"), w.disabled = !r(n) || r(n).state === "idle";
  }), K("click", h, c), K("click", w, () => k(s, !0)), R(e, m), vt();
}
Lt(["click"]);
var Bo = /* @__PURE__ */ N('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), $s = /* @__PURE__ */ N("<option> </option>"), Uo = /* @__PURE__ */ N('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), Wo = /* @__PURE__ */ N('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), Go = /* @__PURE__ */ N('<div class="none muted svelte-bqi9ky"> </div>'), $o = /* @__PURE__ */ N('<div class="bar svelte-bqi9ky"><!></div>');
function Yo(e, t) {
  ht(t, !0);
  let n = ee(t, "candidate", 3, null), s = ee(t, "saving", 3, !1);
  const a = [
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
  function c(w, d) {
    const b = { ...n(), [w]: d };
    if (w === "column") {
      const y = i[d] ?? ["="];
      y.includes(b.op) || (b.op = y[0]), b.value = l.has(d) ? 0 : "";
    }
    w === "op" && d === "is null" && (b.value = null), w === "value" && l.has(b.column) && (b.value = Number(d) || 0), t.onedit(b);
  }
  var p = $o(), m = f(p);
  {
    var g = (w) => {
      var d = Bo(), b = f(d), y = f(b), M = v(b, 2), I = f(M);
      B(() => {
        T(y, `${t.screen.title ?? ""} does not save a rule.`), T(I, t.screen.blurb);
      }), R(w, d);
    }, h = (w) => {
      var d = Wo(), b = lt(d), y = f(b);
      Ye(y, 21, () => a, xt, (C, V) => {
        var j = $s(), A = f(j), x = {};
        B(() => {
          T(A, r(V)), x !== (x = r(V)) && (j.value = (j.__value = r(V)) ?? "");
        }), R(C, j);
      });
      var M;
      wr(y);
      var I = v(y, 2);
      Ye(I, 21, () => r(u), xt, (C, V) => {
        var j = $s(), A = f(j), x = {};
        B(() => {
          T(A, r(V)), x !== (x = r(V)) && (j.value = (j.__value = r(V)) ?? "");
        }), R(C, j);
      });
      var D;
      wr(I);
      var W = v(I, 2);
      {
        var X = (C) => {
          var V = Uo();
          B(() => kn(V, n().value ?? "")), K("input", V, (j) => c("value", j.currentTarget.value)), R(C, V);
        };
        Z(W, (C) => {
          r(o) && C(X);
        });
      }
      var te = v(W, 2), H = f(te);
      H.value = H.__value = "exclude";
      var L = v(H);
      L.value = L.__value = "include";
      var G;
      wr(te);
      var P = v(te, 2), O = f(P);
      O.value = O.__value = "end";
      var ce = v(O);
      ce.value = ce.__value = "0";
      var z;
      wr(P);
      var q = v(P, 2), Q = f(q), le = v(q, 2), Y = v(b, 2), J = f(Y);
      B(
        (C, V) => {
          M !== (M = n().column) && (y.value = (y.__value = n().column) ?? "", lr(y, n().column)), D !== (D = n().op) && (I.value = (I.__value = n().op) ?? "", lr(I, n().op)), G !== (G = n().decision ?? "exclude") && (te.value = (te.__value = n().decision ?? "exclude") ?? "", lr(te, n().decision ?? "exclude")), z !== (z = C) && (P.value = (P.__value = C) ?? "", lr(P, C)), q.disabled = s(), T(Q, s() ? "saving…" : "Confirm"), T(J, `${V ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Ol(n())
        ]
      ), K("change", y, (C) => c("column", C.currentTarget.value)), K("change", I, (C) => c("op", C.currentTarget.value)), K("change", te, (C) => c("decision", C.currentTarget.value)), K("change", P, (C) => c("at", C.currentTarget.value)), K("click", q, function(...C) {
        t.onconfirm?.apply(this, C);
      }), K("click", le, function(...C) {
        t.onclear?.apply(this, C);
      }), R(w, d);
    }, _ = (w) => {
      var d = Go(), b = f(d);
      B(() => T(b, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), R(w, d);
    };
    Z(m, (w) => {
      t.screen.rule === !1 ? w(g) : n() ? w(h, 1) : w(_, -1);
    });
  }
  R(e, p), vt();
}
Lt(["change", "input", "click"]);
var Vo = /* @__PURE__ */ N('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), Ko = /* @__PURE__ */ N('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), Xo = /* @__PURE__ */ N('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Jo = /* @__PURE__ */ N('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Zo(e, t) {
  ht(t, !0);
  let n = ee(t, "rules", 19, () => []), s = ee(t, "unmatched", 3, null), a = ee(t, "busy", 3, !1);
  var i = Jo(), l = f(i), u = v(f(l)), o = f(u), c = v(l, 2);
  {
    var p = (_) => {
      var w = Vo();
      R(_, w);
    };
    Z(c, (_) => {
      n().length === 0 && _(p);
    });
  }
  var m = v(c, 2);
  Ye(m, 19, n, (_) => _.id, (_, w, d) => {
    var b = Ko();
    let y;
    var M = f(b), I = f(M), D = f(I), W = v(I, 2), X = f(W), te = v(W, 2), H = f(te), L = v(M, 2), G = f(L), P = f(G), O = v(G, 2), ce = f(O), z = v(O, 4), q = v(z, 2), Q = v(q, 2);
    B(
      (le, Y) => {
        y = Me(b, 1, "rule svelte-aof9c2", null, y, { exclude: r(w).decision === "exclude" }), T(D, r(d)), T(X, r(w).predicate), T(H, r(w).decision), T(P, `${le ?? ""} paths`), T(ce, Y), z.disabled = a() || r(d) === 0, q.disabled = a() || r(d) === n().length - 1, Q.disabled = a();
      },
      [
        () => Re(r(w).paths),
        () => Ct(r(w).bytes)
      ]
    ), K("click", z, () => t.onmove(r(w), r(d) - 1)), K("click", q, () => t.onmove(r(w), r(d) + 1)), K("click", Q, () => t.ondelete(r(w))), R(_, b);
  });
  var g = v(m, 2);
  {
    var h = (_) => {
      var w = Xo(), d = v(f(w), 2), b = f(d), y = f(b), M = v(b, 2), I = f(M);
      B(
        (D, W) => {
          T(y, `${D ?? ""} paths`), T(I, W);
        },
        [
          () => Re(s().paths),
          () => Ct(s().bytes)
        ]
      ), R(_, w);
    };
    Z(g, (_) => {
      s() && _(h);
    });
  }
  B(() => T(o, `${n().length ?? ""} rules · top-down, first match wins`)), R(e, i), vt();
}
Lt(["click"]);
function Qo(e) {
  return { key: e.id, ids: (e.m ?? [e]).map((t) => t.id) };
}
function eu(e, t) {
  const n = e.filter((s) => s.key !== t.key);
  return n.length === e.length ? [...e, t] : n;
}
function tu(e) {
  return {
    stacks: e.length,
    photos: e.reduce((t, n) => t + n.ids.length, 0)
  };
}
function nu(e) {
  const t = e.stacking.on ? e.stacking.window + "s" : "off", n = Object.entries(e.filters).filter(([, s]) => s.length > 0).sort(([s], [a]) => s < a ? -1 : s > a ? 1 : 0).map(([s, a]) => s + ":" + a.join("|"));
  return `stack=${t} sort=${e.sort} filters=${n.length ? n.join(",") : "none"}`;
}
function ru(e, t) {
  const n = t.map((s) => "[" + s.ids.join(",") + "]").join(",");
  return nu(e) + `
` + n;
}
const Ys = 2500, su = 1, au = 2, iu = 3e7, Xr = /* @__PURE__ */ new WeakMap();
function lu(e, t, n) {
  const s = [], a = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, c = 0, p = null, m = null, g = null, h = !1, _ = !1, w = 0, d = 0, b = 0, y = n.onState || (() => {
  });
  function M(x) {
    w <= 0 || (o = yo(s, o, w, x, (S, U, ne) => {
      a.push({ top: c, height: ne, from: S, to: U }), c += ne + Pt;
    }), D());
  }
  function I() {
    if (m === null || h || w <= 0 || o >= m) return 0;
    const x = a.length ? o / a.length : Math.max(1, w / Or), S = a.length ? c / a.length : Or + Pt, U = Math.round((m - o) / x * S);
    return Math.max(0, Math.min(U, iu - c));
  }
  function D() {
    e.style.height = c + I() + "px", t.style.top = Math.max(0, c - 1) + "px";
  }
  function W() {
    return window.scrollY - e.offsetTop;
  }
  function X() {
    const x = l.pop();
    if (x) return x;
    const S = document.createElement("div");
    S.className = "tile", S.tabIndex = -1;
    const U = document.createElement("img");
    return U.decoding = "async", U.addEventListener("load", () => S.classList.add("loaded")), U.addEventListener("error", () => S.classList.add("missing")), S.appendChild(U), Xr.set(S, U), n.extend && n.extend(S), S;
  }
  function te(x, S) {
    Xr.get(S).removeAttribute("src"), S.classList.remove("loaded", "missing", "error"), S.style.backgroundImage = "", S.remove(), i.delete(x), l.push(S);
  }
  function H(x, S, U, ne, oe, de) {
    let ae = i.get(x);
    const ke = s[x];
    if (!ae) {
      ae = X(), ae.dataset.index = String(x);
      const me = Xr.get(ae);
      me.fetchPriority = de ? "high" : "low", me.src = "/t/" + ke.s + ".webp", u.push(x), n.fill && n.fill(ae, ke), e.appendChild(ae), i.set(x, ae);
    }
    ae.style.width = ne + "px", ae.style.height = oe + "px", ae.style.transform = "translate(" + S + "px," + U + "px)";
  }
  function L(x, S) {
    S.th && (S.url === void 0 && (S.url = n.thumbHash(S.th)), S.url && (x.style.backgroundImage = "url(" + S.url + ")"));
  }
  function G() {
    b = 0;
    for (const x of u) {
      const S = i.get(x);
      S && !S.classList.contains("loaded") && L(S, s[x]);
    }
    u.length = 0;
  }
  function P(x, S) {
    for (const U of xo(x, s, w))
      H(U.index, U.x, x.top, U.w, x.height, S);
  }
  function O() {
    const x = window.innerHeight, S = W(), U = Gs(a, S - x * su, S + x * (1 + au));
    if (!U) return;
    const ne = a[U[0]].from, oe = a[U[1]].to;
    for (const [de, ae] of Array.from(i))
      (de < ne || de >= oe) && te(de, ae);
    for (let de = U[0]; de <= U[1]; de++) {
      const ae = a[de];
      P(ae, ae.top < S + x && ae.top + ae.height > S);
    }
    u.length && !b && (b = requestAnimationFrame(G));
  }
  function ce() {
    return w <= 0 ? !1 : c - (W() + window.innerHeight) < Ys;
  }
  let z = Promise.resolve();
  function q() {
    return _ || h || (_ = !0, z = Q()), z;
  }
  async function Q() {
    const x = d;
    y({ loading: !0, count: s.length, exhausted: h, total: m, tiles: g });
    try {
      do {
        const S = await n.fetchPage(p);
        if (x !== d) return;
        for (const U of S.photos) s.push(U);
        p = S.next, h = p === null, typeof S.stacks == "number" ? (m = S.stacks, g = typeof S.total == "number" ? S.total : null) : typeof S.total == "number" && (m = S.total), M(h), O(), y({ loading: !0, count: s.length, exhausted: h, total: m, tiles: g });
      } while (!h && ce());
    } catch (S) {
      x === d && y({ error: String(S) });
    } finally {
      x === d && (_ = !1, y({ loading: !1, count: s.length, exhausted: h, total: m, tiles: g }));
    }
  }
  let le = 0;
  function Y() {
    le || (le = requestAnimationFrame(() => {
      le = 0, O(), ce() && q();
    }));
  }
  function J() {
    const x = e.clientWidth;
    if (x === w) return;
    const S = Gs(a, W(), W()), U = S ? a[S[0]].from : 0;
    w = x;
    for (const [oe, de] of Array.from(i)) te(oe, de);
    a.length = 0, o = 0, c = 0, M(h), O();
    const ne = a.find((oe) => oe.to > U);
    ne && window.scrollTo(0, ne.top + e.offsetTop), ce() && q();
  }
  function C(x) {
    const S = x.target.closest(".tile");
    if (!S || !e.contains(S)) return;
    const U = Number(S.dataset.index), ne = s[U];
    ne && n.activate && n.activate(ne, x, S, U);
  }
  e.addEventListener("click", C), window.addEventListener("scroll", Y, { passive: !0 });
  let V = 0;
  const j = new ResizeObserver(() => {
    clearTimeout(V), V = setTimeout(J, 100);
  });
  j.observe(e);
  const A = new IntersectionObserver(
    (x) => {
      x.some((S) => S.isIntersecting) && q();
    },
    { rootMargin: "0px 0px " + Ys + "px 0px" }
  );
  return A.observe(t), w = e.clientWidth, q(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      d++, _ = !1;
      for (const [x, S] of Array.from(i)) te(x, S);
      s.length = 0, a.length = 0, u.length = 0, o = 0, c = 0, p = null, m = null, g = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), q();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(x) {
      const S = typeof x == "number" ? x : null;
      S !== m && (m = S, D(), y({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [x, S] of i) n.fill(S, s[x]);
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
    async walkTo(x) {
      for (; x >= o && !h; ) {
        const oe = o;
        if (await q(), o === oe) break;
      }
      const S = a.find((oe) => oe.to > x);
      if (!S) return null;
      const U = Math.max(0, (window.innerHeight - S.height) / 2);
      window.scrollTo(0, Math.max(0, e.offsetTop + S.top - U)), O();
      const ne = i.get(x);
      return ne ? { item: s[x], tile: ne } : null;
    },
    // Put the keyboard back on a tile. The overlay hands focus back on the way
    // out, and after a walk that is a different tile from the one it opened on.
    focus(x) {
      i.get(x)?.focus();
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(x) {
      for (const [S, U] of i)
        s[S] === x && n.fill && n.fill(U, x);
    },
    destroy() {
      d++, e.removeEventListener("click", C), window.removeEventListener("scroll", Y), j.disconnect(), A.disconnect(), clearTimeout(V), cancelAnimationFrame(b);
    }
  };
}
function ou(e) {
  try {
    const t = Uint8Array.from(atob(e), (P) => P.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, s = t[3] | t[4] << 8, a = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, c = (s >> 3 & 63) / 63, p = (s >> 9 & 63) / 63, m = s >> 15, g = Math.max(3, m ? o ? 5 : 7 : s & 7), h = Math.max(3, m ? s & 7 : o ? 5 : 7);
    let _ = o ? 6 : 5, w = 0;
    const d = (P, O, ce) => {
      const z = [];
      for (let q = 0; q < O; q++)
        for (let Q = q ? 0 : 1; Q * O < P * (O - q); Q++) {
          const le = t[_ + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          z.push((le / 7.5 - 1) * ce);
        }
      return z;
    }, b = d(g, h, u), y = d(3, 3, c * 1.25), M = d(3, 3, p * 1.25), I = g / h, D = Math.max(1, Math.round(I > 1 ? 32 : 32 * I)), W = Math.max(1, Math.round(I > 1 ? 32 / I : 32)), X = document.createElement("canvas");
    X.width = D, X.height = W;
    const te = X.getContext("2d"), H = te.createImageData(D, W), L = [], G = [];
    for (let P = 0, O = 0; P < W; P++)
      for (let ce = 0; ce < D; ce++, O += 4) {
        let z = a, q = i, Q = l;
        for (let C = 0; C < g; C++) L[C] = Math.cos(Math.PI / D * (ce + 0.5) * C);
        for (let C = 0; C < h; C++) G[C] = Math.cos(Math.PI / W * (P + 0.5) * C);
        for (let C = 0, V = 0; C < h; C++)
          for (let j = C ? 0 : 1; j * h < g * (h - C); j++, V++)
            z += b[V] * L[j] * G[C] * 2;
        for (let C = 0, V = 0; C < 3; C++)
          for (let j = C ? 0 : 1; j < 3 - C; j++, V++) {
            const A = L[j] * G[C] * 2;
            q += y[V] * A, Q += M[V] * A;
          }
        const le = z - 2 / 3 * q, Y = (3 * z - le + Q) / 2, J = Y - Q;
        H.data[O] = Math.max(0, Math.min(255, Math.round(255 * Y))), H.data[O + 1] = Math.max(0, Math.min(255, Math.round(255 * J))), H.data[O + 2] = Math.max(0, Math.min(255, Math.round(255 * le))), H.data[O + 3] = 255;
      }
    return te.putImageData(H, 0, 0), X.toDataURL();
  } catch {
    return null;
  }
}
var uu = /* @__PURE__ */ N('<main id="canvas"><div id="sentinel"></div></main>');
function cu(e, t) {
  ht(t, !0);
  let n = ee(t, "key", 3, ""), s = ee(t, "total", 3, null), a = ee(t, "triage", 3, !1), i = ee(t, "excludedDirs", 19, () => []), l = ee(t, "selecting", 3, !1), u = ee(t, "markedKeys", 19, () => []), o = ee(t, "onActivate", 3, () => {
  }), c = ee(t, "onOverride", 3, async () => null), p = ee(t, "onExcludeFolder", 3, () => {
  }), m = ee(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ $(null), h = /* @__PURE__ */ $(null), _ = null, w = "";
  const d = /* @__PURE__ */ re(() => new Set(u())), b = { null: "exclude", exclude: "include", include: "clear" };
  function y(z) {
    const q = z.toLowerCase().startsWith(Kn.toLowerCase()) ? z.slice(Kn.length + 1) : z;
    return q.length > 64 ? "…" + q.slice(-64) : q;
  }
  function M(z) {
    const q = document.createElement("div");
    q.className = "tile-path", z.appendChild(q);
    const Q = document.createElement("button");
    Q.className = "chip", Q.type = "button", z.appendChild(Q);
    const le = document.createElement("button");
    le.className = "dirchip", le.type = "button", le.textContent = "dir", z.appendChild(le);
  }
  function I(z, q) {
    const Q = z.querySelector(".tile-path");
    Q && (Q.textContent = q.p ? y(q.p) : "");
    const le = z.querySelector(".dirchip");
    if (le) {
      const J = Na(q.p ?? ""), C = J !== "" && ks(i(), J);
      le.hidden = J === "", le.disabled = C, le.dataset.state = C ? "exclude" : "none", le.title = C ? `already excluded: ${J}` : `exclude everything under ${J}, subfolders included — one exclude rule at the end of the order`;
    }
    const Y = z.querySelector(".chip");
    Y && (Y.dataset.state = q.o || "none", Y.textContent = q.o === "exclude" ? "drop" : q.o === "include" ? "keep" : "·", Y.title = q.o === "exclude" ? "overridden: excluded — click to keep" : q.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  function D(z) {
    const q = document.createElement("span");
    q.className = "tick", z.appendChild(q);
  }
  function W(z, q) {
    z.dataset.marked = r(d).has(q.id) ? "on" : "off";
  }
  Qn(() => (_ = lu(r(g), r(h), {
    fetchPage: (z) => t.fetchPage(z),
    thumbHash: ou,
    extend: a() ? M : D,
    fill: a() ? I : W,
    onState: (z) => m()(z),
    activate: async (z, q, Q, le) => {
      if (q.target.closest(".dirchip")) {
        p()(z);
        return;
      }
      if (!q.target.closest(".chip")) {
        o()(z, Q, le);
        return;
      }
      const Y = b[z.o ?? "null"];
      z.o = await c()(z, Y), I(Q, z);
    }
  }), w = n(), () => _?.destroy())), qt(() => {
    const z = n(), q = s();
    _ && (z !== w && (w = z, _.reset()), _.setTotal(q));
  });
  function X(z) {
    return _?.walkTo(z);
  }
  function te(z) {
    _?.focus(z);
  }
  let H = "";
  qt(() => {
    const z = i().join(`
`);
    !_ || z === H || (H = z, _.refill());
  });
  let L = "";
  qt(() => {
    const z = u().join(",");
    !_ || z === L || (L = z, _.refill());
  });
  var G = { walkTo: X, focusTile: te }, P = uu();
  let O;
  var ce = f(P);
  return hr(ce, (z) => k(h, z), () => r(h)), hr(P, (z) => k(g, z), () => r(g)), B(() => O = Me(P, 1, "", null, O, { selecting: l() })), R(e, P), vt(G);
}
var du = /* @__PURE__ */ N('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), fu = /* @__PURE__ */ N('<th class="num svelte-1v3p82v"> </th>'), hu = /* @__PURE__ */ N('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), vu = /* @__PURE__ */ N('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), pu = /* @__PURE__ */ N('<td class="num svelte-1v3p82v"> </td>'), gu = /* @__PURE__ */ N('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), _u = /* @__PURE__ */ N('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function bu(e, t) {
  ht(t, !0);
  let n = ee(t, "rows", 19, () => []), s = ee(t, "rules", 19, () => []), a = ee(t, "root", 3, null), i = ee(t, "selected", 3, null), l = ee(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ re(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const c = /* @__PURE__ */ re(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : Ia(s(), t.screen.toRule(w, a()))
  ]))), p = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var g = ws(), h = lt(g);
  {
    var _ = (w) => {
      var d = _u(), b = f(d), y = f(b), M = f(y);
      {
        var I = (L) => {
          var G = du();
          R(L, G);
        };
        Z(M, (L) => {
          r(u) && L(I);
        });
      }
      var D = v(M), W = f(D), X = v(D, 3);
      {
        var te = (L) => {
          var G = fu(), P = f(G);
          B(() => T(P, t.screen.heading[1])), R(L, G);
        };
        Z(X, (L) => {
          t.screen.heading[1] && L(te);
        });
      }
      var H = v(b);
      Ye(H, 23, n, (L) => L.key, (L, G, P) => {
        const O = /* @__PURE__ */ re(() => r(c).get(r(G).key));
        var ce = gu();
        let z;
        var q = f(ce);
        {
          var Q = (ae) => {
            const ke = /* @__PURE__ */ re(() => l().has(r(G).key));
            var me = hu(), Ee = f(me);
            let Ce;
            var ue = f(Ee);
            B(
              (fe) => {
                Ce = Me(Ee, 1, "tick svelte-1v3p82v", null, Ce, { on: r(ke) }), he(Ee, "aria-checked", r(ke)), he(Ee, "aria-label", `select ${fe ?? ""}`), T(ue, r(ke) ? "✓" : "");
              },
              [() => o(r(G))]
            ), K("click", Ee, (fe) => {
              fe.stopPropagation(), t.oncheck(r(G), r(P), fe.shiftKey);
            }), R(ae, me);
          };
          Z(q, (ae) => {
            r(u) && ae(Q);
          });
        }
        var le = v(q), Y = f(le);
        let J;
        var C = f(Y), V = v(Y), j = v(V);
        {
          var A = (ae) => {
            var ke = vu();
            R(ae, ke);
          };
          Z(j, (ae) => {
            r(G).scope === "whole inventory" && ae(A);
          });
        }
        var x = v(le), S = f(x), U = v(x), ne = f(U), oe = v(U);
        {
          var de = (ae) => {
            var ke = pu(), me = f(ke);
            B(() => T(me, r(G).detail ?? "")), R(ae, ke);
          };
          Z(oe, (ae) => {
            t.screen.heading[1] && ae(de);
          });
        }
        B(
          (ae, ke, me) => {
            z = Me(ce, 1, "svelte-1v3p82v", null, z, {
              picked: i() === r(G).key,
              clickable: t.screen.sheet !== !1
            }), J = Me(Y, 1, "mark svelte-1v3p82v", null, J, {
              exclude: r(O) === "exclude",
              include: r(O) === "include"
            }), he(Y, "title", m[r(O)] ?? ""), T(C, p[r(O)] ?? ""), T(V, `${ae ?? ""} `), T(S, ke), T(ne, me);
          },
          [
            () => o(r(G)),
            () => Re(r(G).paths),
            () => Ct(r(G).bytes)
          ]
        ), K("click", ce, () => t.onpick(r(G))), R(L, ce);
      }), B(() => T(W, t.screen.heading[0] ?? "")), R(w, d);
    };
    Z(h, (w) => {
      n().length && w(_);
    });
  }
  R(e, g), vt();
}
Lt(["click"]);
var mu = /* @__PURE__ */ N('<button class="twisty svelte-pucy57"> </button>'), wu = /* @__PURE__ */ N('<span class="twisty leaf svelte-pucy57">·</span>'), yu = /* @__PURE__ */ N('<span class="name root svelte-pucy57"> </span>'), xu = /* @__PURE__ */ N('<button class="name svelte-pucy57"> </button>'), ku = /* @__PURE__ */ N('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Su = /* @__PURE__ */ N('<div class="note svelte-pucy57"> </div>'), Eu = /* @__PURE__ */ N('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Tu = /* @__PURE__ */ N('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Mu = /* @__PURE__ */ N('<div class="tree svelte-pucy57"></div>');
function Au(e, t) {
  ht(t, !0);
  let n = ee(t, "version", 3, 0), s = ee(t, "excludedDirs", 19, () => []), a = ee(t, "selected", 3, null), i = ee(t, "busy", 3, !1), l = /* @__PURE__ */ $(Pe(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ $(Pe(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ $(Pe(/* @__PURE__ */ new Set())), c = /* @__PURE__ */ $(Pe(/* @__PURE__ */ new Set()));
  async function p(d) {
    k(o, new Set(r(o)).add(d), !0);
    const b = await t.onload(d), y = new Map(r(l)), M = new Set(r(c));
    b ? (y.set(d, b), M.delete(d)) : M.add(d), k(l, y, !0), k(c, M, !0), k(o, new Set([...r(o)].filter((I) => I !== d)), !0);
  }
  function m(d) {
    if (r(u).has(d)) {
      k(u, new Set([...r(u)].filter((b) => b !== d)), !0);
      return;
    }
    k(u, new Set(r(u)).add(d), !0), r(l).has(d) || p(d);
  }
  let g = -1;
  qt(() => {
    const d = n();
    if (d !== g) {
      g = d, r(u).has(t.root) || k(u, new Set(r(u)).add(t.root), !0);
      for (const b of r(u)) p(b);
    }
  });
  const h = /* @__PURE__ */ re(() => {
    const d = [], b = (D, W, X, te, H, L) => {
      const G = r(l).get(D), P = r(u).has(D);
      if (d.push({
        key: D,
        name: W,
        depth: X,
        paths: te,
        bytes: H,
        deeper: L,
        expanded: P,
        here: G?.here ?? null,
        truncated: !!G?.truncated,
        loading: r(o).has(D),
        failed: r(c).has(D),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: ks(s(), D)
      }), !(!P || !G))
        for (const O of G.children)
          b(O.path, O.name, X + 1, O.paths, O.bytes, O.deeper);
    }, y = r(l).get(t.root), M = y ? y.children.reduce((D, W) => D + W.paths, 0) + y.here.paths : 0, I = y ? y.children.reduce((D, W) => D + W.bytes, 0) + y.here.bytes : 0;
    return b(t.root, t.root, 0, M, I, !0), d;
  }), _ = 8;
  var w = Mu();
  Ye(w, 21, () => r(h), (d) => d.key, (d, b) => {
    var y = Tu(), M = lt(y);
    let I;
    var D = f(M);
    let W;
    var X = v(D, 2);
    {
      var te = (j) => {
        var A = mu(), x = f(A);
        B(() => {
          he(A, "aria-expanded", r(b).expanded), he(A, "aria-label", `${r(b).expanded ? "collapse" : "expand"} ${r(b).name ?? ""}`), he(A, "title", r(b).expanded ? "collapse" : "expand"), T(x, r(b).loading ? "·" : r(b).expanded ? "▾" : "▸");
        }), K("click", A, () => m(r(b).key)), R(j, A);
      }, H = (j) => {
        var A = wu();
        R(j, A);
      };
      Z(X, (j) => {
        r(b).deeper ? j(te) : j(H, -1);
      });
    }
    var L = v(X, 2);
    {
      var G = (j) => {
        var A = yu(), x = f(A);
        B(() => T(x, r(b).key)), R(j, A);
      }, P = (j) => {
        var A = xu(), x = f(A);
        B(() => {
          he(A, "title", `Show every kept file under ${r(b).key ?? ""}`), T(x, r(b).name);
        }), K("click", A, () => t.onpick(r(b))), R(j, A);
      };
      Z(L, (j) => {
        r(b).depth === 0 ? j(G) : j(P, -1);
      });
    }
    var O = v(L, 2), ce = f(O), z = v(O, 2), q = f(z), Q = v(z, 2), le = v(M, 2);
    {
      var Y = (j) => {
        var A = ku();
        let x;
        B((S) => x = Zt(A, "", x, S), [
          () => ({
            "padding-left": `${Math.min(r(b).depth, _) * 11 + 18}px`
          })
        ]), R(j, A);
      }, J = (j) => {
        var A = Su();
        let x;
        var S = f(A);
        B(
          (U, ne, oe) => {
            x = Zt(A, "", x, U), T(S, `${ne ?? ""} directly here · ${oe ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(b).depth, _) * 11 + 18}px`
            }),
            () => Re(r(b).here.paths),
            () => Ct(r(b).here.bytes)
          ]
        ), R(j, A);
      };
      Z(le, (j) => {
        r(b).expanded && r(b).failed ? j(Y) : r(b).expanded && r(b).here && r(b).here.paths > 0 && j(J, 1);
      });
    }
    var C = v(le, 2);
    {
      var V = (j) => {
        var A = Eu();
        let x;
        B((S) => x = Zt(A, "", x, S), [
          () => ({
            "padding-left": `${Math.min(r(b).depth, _) * 11 + 18}px`
          })
        ]), R(j, A);
      };
      Z(C, (j) => {
        r(b).truncated && j(V);
      });
    }
    B(
      (j, A, x) => {
        I = Me(M, 1, "row svelte-pucy57", null, I, {
          picked: a() === r(b).key,
          gone: r(b).excluded
        }), W = Zt(D, "", W, j), T(ce, A), T(q, x), Q.disabled = i() || r(b).excluded || r(b).depth === 0, he(Q, "title", r(b).depth === 0 ? "The library root is not excludable from here." : r(b).excluded ? "already excluded" : `Exclude everything under ${r(b).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(b).depth, _) * 11}px` }),
        () => Re(r(b).paths),
        () => Ct(r(b).bytes)
      ]
    ), K("click", Q, () => t.onexclude(r(b))), R(d, y);
  }), R(e, w), vt();
}
Lt(["click"]);
var Ru = /* @__PURE__ */ N('<button title="Back to its default">↺</button>'), Pu = /* @__PURE__ */ N('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), Cu = /* @__PURE__ */ N('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), Ou = /* @__PURE__ */ N('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), Nu = /* @__PURE__ */ N('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), Iu = /* @__PURE__ */ N('<li><code class="svelte-1hh0fwb"> </code> </li>'), zu = /* @__PURE__ */ N(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), Fu = /* @__PURE__ */ N('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function Lu(e, t) {
  ht(t, !0);
  const n = "photos.glass", s = [
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
  ], a = {
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
  let u = /* @__PURE__ */ $(Pe(Ul())), o = /* @__PURE__ */ $(!0), c = /* @__PURE__ */ $(!1), p = /* @__PURE__ */ $(Pe(Ha())), m = /* @__PURE__ */ $(Pe(window.innerWidth));
  const g = (P) => r(p) === "light" ? P.light : P.dark, h = (P) => P in Sn ? Sn : _n, _ = (P) => `rgba(${P.r}, ${P.g}, ${P.b}, ${P.a})`, w = /* @__PURE__ */ re(() => JSON.stringify(r(u), null, 2));
  Qn(() => {
    const P = localStorage.getItem(n);
    if (P)
      try {
        k(u, $r(JSON.parse(P)), !0);
        return;
      } catch {
      }
    Ss();
  });
  function d(P) {
    k(u, $r({ ...r(u), ...P }), !0), localStorage.setItem(n, JSON.stringify(r(u))), k(c, !1);
  }
  function b(P) {
    k(u, $r(P), !0), localStorage.setItem(n, JSON.stringify(r(u))), k(c, !1);
  }
  function y(P) {
    d({ [P]: h(P)[P] });
  }
  function M() {
    k(p, qa(r(p) === "dark" ? "light" : "dark"), !0);
  }
  async function I() {
    await navigator.clipboard.writeText(r(w)), k(c, !0);
  }
  var D = Fu();
  let W;
  var X = f(D), te = v(f(X), 4), H = f(te), L = v(X, 2);
  {
    var G = (P) => {
      var O = zu();
      {
        const Ee = (ue, fe = yr, Se = yr, ye = yr) => {
          var We = Ru();
          let Ze;
          B(() => {
            Ze = Me(We, 1, "undo svelte-1hh0fwb", null, Ze, { idle: !Se() }), he(We, "aria-label", `Reset ${fe() ?? ""}`);
          }), K("click", We, function(...Ge) {
            ye()?.apply(this, Ge);
          }), R(ue, We);
        };
        var ce = v(f(O), 2);
        Ye(ce, 17, () => s, xt, (ue, fe) => {
          var Se = Cu(), ye = f(Se), We = f(ye), Ze = v(ye, 2), Ge = f(Ze), Tt = v(Ze, 2);
          Ye(Tt, 17, () => r(fe).rows, xt, (Wt, yn) => {
            var Qe = /* @__PURE__ */ re(() => qr(r(yn), 5));
            let Ve = () => r(Qe)[0], Mt = () => r(Qe)[1], Gt = () => r(Qe)[2], st = () => r(Qe)[3], sn = () => r(Qe)[4];
            const pt = /* @__PURE__ */ re(() => r(u)[Ve()] !== h(Ve())[Ve()]), gt = /* @__PURE__ */ re(() => typeof st() == "function" ? st()(r(m)) : st());
            var At = Pu();
            let $e;
            var Rt = f(At), Dt = f(Rt), et = v(Rt, 2), F = v(et, 2), ie = v(F, 2);
            Ee(ie, Mt, () => r(pt), () => () => y(Ve())), B(() => {
              $e = Me(At, 1, "row svelte-1hh0fwb", null, $e, { moved: r(pt) }), T(Dt, Mt()), he(et, "min", Gt()), he(et, "max", r(gt)), he(et, "step", sn()), he(et, "aria-label", Mt()), kn(et, r(u)[Ve()]), he(F, "min", Gt()), he(F, "max", r(gt)), he(F, "step", sn()), he(F, "aria-label", `${Mt() ?? ""} value`), kn(F, r(u)[Ve()]);
            }), K("input", et, (ve) => d({ [Ve()]: Number(ve.currentTarget.value) })), K("input", F, (ve) => d({ [Ve()]: Number(ve.currentTarget.value) })), R(Wt, At);
          }), B(() => {
            T(We, r(fe).title), T(Ge, r(fe).note);
          }), R(ue, Se);
        });
        var z = v(ce, 2), q = f(z), Q = v(z, 2), le = f(Q), Y = v(Q, 2);
        Ye(Y, 17, () => Bl, xt, (ue, fe) => {
          const Se = /* @__PURE__ */ re(() => g(r(fe))), ye = /* @__PURE__ */ re(() => r(u)[r(Se)]), We = /* @__PURE__ */ re(() => r(fe).base[r(Se)]);
          var Ze = Nu(), Ge = f(Ze), Tt = f(Ge), Wt = v(Tt), yn = f(Wt), Qe = v(Ge, 2), Ve = f(Qe), Mt = v(Qe, 2);
          Ye(Mt, 17, () => i, xt, (pt, gt) => {
            var At = /* @__PURE__ */ re(() => qr(r(gt), 3));
            let $e = () => r(At)[0], Rt = () => r(At)[1], Dt = () => r(At)[2];
            const et = /* @__PURE__ */ re(() => r(ye)[$e()] !== r(We)[$e()]);
            var F = Ou();
            let ie;
            var ve = f(F), ze = f(ve), xe = v(ve, 2), be = v(xe, 2), Fe = v(be, 2);
            Ee(Fe, Rt, () => r(et), () => () => d({
              [r(Se)]: { ...r(ye), [$e()]: r(We)[$e()] }
            })), B(() => {
              ie = Me(F, 1, "row svelte-1hh0fwb", null, ie, { moved: r(et) }), T(ze, Rt()), he(xe, "max", Dt()), he(xe, "step", Dt() === 1 ? 0.01 : 1), he(xe, "aria-label", `${r(p) ?? ""} ${a[r(fe).dark].title ?? ""} ${Rt() ?? ""}`), kn(xe, r(ye)[$e()]), he(be, "max", Dt()), he(be, "step", Dt() === 1 ? 0.01 : 1), he(be, "aria-label", `${r(p) ?? ""} ${a[r(fe).dark].title ?? ""} ${Rt() ?? ""} value`), kn(be, r(ye)[$e()]);
            }), K("input", xe, (tt) => d({
              [r(Se)]: {
                ...r(ye),
                [$e()]: Number(tt.currentTarget.value)
              }
            })), K("input", be, (tt) => d({
              [r(Se)]: {
                ...r(ye),
                [$e()]: Number(tt.currentTarget.value)
              }
            })), R(pt, F);
          });
          var Gt = v(Mt, 2);
          let st;
          var sn = f(Gt);
          B(
            (pt, gt) => {
              T(Tt, `${a[r(fe).dark].title ?? ""} `), T(yn, r(p)), T(Ve, a[r(fe).dark].note), st = Zt(Gt, "", st, pt), T(sn, gt);
            },
            [
              () => ({ background: _(r(ye)) }),
              () => _(r(ye))
            ]
          ), R(ue, Ze);
        });
        var J = v(Y, 2), C = v(f(J), 4);
        let Ce;
        var V = f(C), j = f(V), A = v(V, 2);
        Ee(A, () => "Blur at the edge", () => r(u).blurEdge !== Sn.blurEdge, () => () => y("blurEdge"));
        var x = v(J, 2), S = v(f(x), 4);
        Ye(S, 21, () => l, xt, (ue, fe) => {
          var Se = /* @__PURE__ */ re(() => qr(r(fe), 2));
          let ye = () => r(Se)[0], We = () => r(Se)[1];
          var Ze = Iu(), Ge = f(Ze), Tt = f(Ge), Wt = v(Ge);
          B(() => {
            T(Tt, ye()), T(Wt, ` — ${We() ?? ""}`);
          }), R(ue, Ze);
        });
        var U = v(x, 2), ne = v(f(U), 4), oe = f(ne), de = v(oe, 2), ae = v(de, 2), ke = f(ae), me = v(ne, 2);
        B(() => {
          T(q, `The five colours below are per theme, and you are editing the ${r(p) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), T(le, `Edit the ${r(p) === "dark" ? "light" : "dark"} colours`), Ce = Me(C, 1, "row toggle svelte-1hh0fwb", null, Ce, { moved: r(u).blurEdge !== Sn.blurEdge }), Sl(j, r(u).blurEdge), T(ke, r(c) ? "Copied" : "Copy"), kn(me, r(w));
        }), K("click", Q, M), K("change", j, (ue) => d({ blurEdge: ue.currentTarget.checked })), K("click", oe, () => b(_n)), K("click", de, () => b(Sn)), K("click", ae, I);
      }
      R(P, O);
    };
    Z(L, (P) => {
      r(o) && P(G);
    });
  }
  B(() => {
    W = Me(D, 1, "tuner svelte-1hh0fwb", null, W, { folded: !r(o) }), he(te, "title", r(o) ? "Fold away" : "Open"), T(H, r(o) ? "–" : "+");
  }), Ml("innerWidth", (P) => k(m, P, !0)), K("click", te, () => k(o, !r(o))), R(e, D), vt();
}
Lt(["click", "input", "change"]);
function Jr(e, t, n, s) {
  const a = e + t;
  return a < 0 || a >= n && s ? null : a;
}
var Du = /* @__PURE__ */ N('<button><span class="n svelte-1n46o8q"> </span> </button>'), ju = /* @__PURE__ */ N('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), Hu = /* @__PURE__ */ N('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), qu = /* @__PURE__ */ N('<div class="muted pad svelte-1n46o8q">loading…</div>'), Bu = /* @__PURE__ */ N('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), Uu = /* @__PURE__ */ N('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), Wu = /* @__PURE__ */ N('<p class="blurb"> </p>'), Gu = /* @__PURE__ */ N('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), $u = /* @__PURE__ */ N('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), Yu = /* @__PURE__ */ N('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), Vu = /* @__PURE__ */ N('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), Ku = /* @__PURE__ */ N("<div> </div>"), Xu = /* @__PURE__ */ N('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function Ju(e, t) {
  ht(t, !0);
  const n = location.pathname === "/tune";
  let s = /* @__PURE__ */ $("grid"), a = /* @__PURE__ */ $(0), i = /* @__PURE__ */ $(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ $(Pe([])), u = /* @__PURE__ */ $(null), o = /* @__PURE__ */ $(null), c = /* @__PURE__ */ $(Pe(/* @__PURE__ */ new Set())), p = /* @__PURE__ */ $(null), m = /* @__PURE__ */ $(null), g = /* @__PURE__ */ $(null), h = /* @__PURE__ */ $(null), _ = /* @__PURE__ */ $(!1), w = /* @__PURE__ */ $(!1), d = /* @__PURE__ */ $(!1), b = /* @__PURE__ */ $(!1), y = /* @__PURE__ */ $(Pe({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), M = /* @__PURE__ */ $(null), I = /* @__PURE__ */ $(0), D = /* @__PURE__ */ $(null), W = /* @__PURE__ */ $(Pe({})), X = /* @__PURE__ */ $("newest"), te = /* @__PURE__ */ $(Pe(eo())), H = /* @__PURE__ */ $(null), L = /* @__PURE__ */ $(null), G = /* @__PURE__ */ $(!1), P = /* @__PURE__ */ $(Pe([]));
  const O = /* @__PURE__ */ re(() => Hs[r(a)]), ce = /* @__PURE__ */ re(() => r(O).table !== !1), z = /* @__PURE__ */ re(() => r(ce) || r(O).tree === !0), q = /* @__PURE__ */ re(() => r(O).sheet !== !1 && (r(o) !== null || !r(z))), Q = /* @__PURE__ */ re(() => ({
    sort: r(X),
    ...r(te).on ? { stack: r(te).window } : {},
    ...Object.fromEntries(Object.entries(r(W)).filter(([, E]) => E.length > 0))
  })), le = /* @__PURE__ */ re(() => r(P).map((E) => E.key)), Y = /* @__PURE__ */ re(() => tu(r(P)));
  qt(() => {
    r(Q), en(() => {
      k(P, [], !0);
    });
  });
  const J = /* @__PURE__ */ re(() => r(s) === "grid" ? `grid:${JSON.stringify(r(Q))}` : `triage:${r(a)}:${JSON.stringify(r(o))}`), C = /* @__PURE__ */ re(() => r(O).rule === !1 || r(c).size === 0 ? [] : r(l).filter((E) => r(c).has(E.key)).map((E) => r(O).toRule(E, r(i))).filter((E) => E && Ia(r(m)?.rules ?? [], E) !== "exclude")), V = /* @__PURE__ */ re(() => (r(m)?.rules ?? []).filter((E) => E.decision === "exclude" && E.term?.column === "dir_under").map((E) => String(E.term.value).replace(/[\\/]+$/, "").toLowerCase())), j = Pl();
  function A(E) {
    k(M, String(E), !0);
  }
  async function x(E) {
    try {
      return k(M, null), await E();
    } catch (se) {
      return A(se), null;
    }
  }
  const S = Cl(
    () => {
      k(w, !0), x(async () => {
        const E = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: se, value: ge } = await j(() => De.counts(r(o), E));
        se || k(m, ge, !0);
      }).finally(() => {
        k(w, !1);
      });
    },
    220
  );
  async function U() {
    k(g, "loading");
    const E = await x(() => De.files());
    k(g, E, !0), k(_, !1), k(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function ne(E = !1) {
    if (r(s) !== "triage" || !r(ce)) {
      k(l, [], !0);
      return;
    }
    k(b, !0);
    const se = r(O).name === "source_folder" && r(i) ? { root: r(i) } : {};
    E && (se.live = "1");
    const ge = await x(() => De.screen(r(O).name, se));
    k(l, ge?.rows ?? [], !0), k(b, !1);
  }
  let oe = !1;
  qt(() => {
    r(a), r(s), en(() => {
      k(u, null), k(o, null), k(i, null), me(), r(s) === "triage" && (ne(), S.now(), oe || (oe = !0, U()));
    });
  }), qt(() => {
    r(i), en(() => {
      r(s) === "triage" && (me(), ne());
    });
  }), Qn(() => {
    x(async () => {
      k(D, await De.facets(), !0);
    });
  });
  function de(E, se) {
    k(W, { ...r(W), [E]: se }, !0);
  }
  function ae(E) {
    if (r(O).sheet !== !1) {
      if (r(O).drill && !r(i)) {
        k(u, E.key, !0), k(
          o,
          {
            ...r(O).toRule(E, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), k(i, E.key, !0);
        return;
      }
      k(u, E.key, !0), k(
        o,
        {
          ...r(O).toRule(E, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), S();
    }
  }
  function ke(E, se, ge) {
    const Te = new Set(r(c)), Le = !Te.has(E.key), bt = ge && r(p) !== null ? r(l).findIndex((ut) => ut.key === r(p)) : -1, [Vt, on] = bt < 0 ? [se, se] : bt < se ? [bt, se] : [se, bt];
    for (let ut = Vt; ut <= on; ut++)
      Le ? Te.add(r(l)[ut].key) : Te.delete(r(l)[ut].key);
    k(c, Te, !0), k(p, E.key, !0);
  }
  function me() {
    k(c, /* @__PURE__ */ new Set(), !0), k(p, null);
  }
  function Ee(E) {
    k(o, E, !0), k(
      u,
      null
      // it no longer corresponds to a row
    ), S();
  }
  function Ce(E = !1) {
    k(o, null), k(u, null), E && k(i, null), S.now();
  }
  async function ue() {
    k(
      _,
      !0
      // the distinct-content number now says so on its face
    ), $i(I), await ne(), S.now();
  }
  async function fe() {
    if (!r(o)) return;
    k(d, !0);
    const E = r(o).at === "end" ? void 0 : 0, se = await x(() => De.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(O).id} ${r(O).title}`
      },
      E
    ));
    k(d, !1), se && (k(o, null), k(u, null), await ue());
  }
  async function Se() {
    const E = r(C);
    if (!E.length) {
      me();
      return;
    }
    k(d, !0);
    for (const se of E)
      if (!await x(() => De.addRule({
        column: se.column,
        op: se.op,
        value: se.value,
        decision: "exclude",
        note: `screen ${r(O).id} ${r(O).title}`
      }))) break;
    k(d, !1), me(), k(o, null), k(u, null), await ue();
  }
  async function ye(E) {
    if (!E || ks(r(V), E)) return;
    k(d, !0);
    const se = await x(() => De.addRule({
      column: "dir_under",
      op: "=",
      value: E,
      decision: "exclude",
      note: `screen ${r(O).id} ${r(O).title}`
    }));
    k(d, !1), se && await ue();
  }
  const We = (E) => ye(Na(E.p ?? "")), Ze = (E) => ye(E.key);
  async function Ge(E) {
    k(d, !0), await x(() => De.deleteRule(E.id)), k(d, !1), await ue();
  }
  async function Tt(E, se) {
    k(d, !0), await x(() => De.moveRule(E.id, se)), k(d, !1), await ue();
  }
  async function Wt() {
    await x(async () => {
      k(D, await De.facets(), !0);
    });
  }
  async function yn(E, se) {
    const ge = await x(() => De.override(E.s, se));
    return ge ? (k(_, !0), S(), ge.decision) : E.o ?? null;
  }
  function Qe(E) {
    return r(s) === "grid" ? De.photos({ limit: 500, ...r(Q), ...E || {} }) : De.page(r(o), E);
  }
  const Ve = (E) => E.m ?? [{ id: E.id, s: E.s, w: E.w, h: E.h }];
  function Mt(E, se, ge) {
    if (r(s) === "grid") {
      if (r(G)) {
        k(P, eu(r(P), Qo(E)), !0);
        return;
      }
      k(
        H,
        {
          frames: Ve(E),
          origin: se.getBoundingClientRect(),
          at: ge
        },
        !0
      );
      return;
    }
    x(() => De.revealOrigin(E.id));
  }
  const Gt = /* @__PURE__ */ re(() => r(H) !== null && Jr(r(H).at, -1, r(y).count, r(y).exhausted) !== null), st = /* @__PURE__ */ re(() => r(H) !== null && Jr(r(H).at, 1, r(y).count, r(y).exhausted) !== null), sn = 120;
  let pt = !1, gt = 0;
  async function At(E, se = !1) {
    const ge = performance.now();
    if (!r(H) || pt || se && ge - gt < sn) return;
    const Te = Jr(r(H).at, E, r(y).count, r(y).exhausted);
    if (Te !== null) {
      gt = ge, pt = !0;
      try {
        const Le = await r(L)?.walkTo(Te);
        if (!Le || !r(H)) return;
        k(
          H,
          {
            frames: Ve(Le.item),
            origin: Le.tile.getBoundingClientRect(),
            at: Te
          },
          !0
        );
      } finally {
        pt = !1;
      }
    }
  }
  async function $e() {
    const E = r(H)?.at ?? null;
    k(H, null), await al(), E !== null && r(L)?.focusTile(E);
  }
  function Rt(E) {
    $e(), x(() => De.revealPhoto(E.id));
  }
  function Dt() {
    x(() => navigator.clipboard.writeText(ru(
      {
        stacking: r(te),
        sort: r(X),
        filters: r(W)
      },
      r(P)
    )));
  }
  var et = Xu(), F = lt(et);
  {
    var ie = (E) => {
      mo(E, {
        get facets() {
          return r(D);
        },
        get selected() {
          return r(W);
        },
        get sort() {
          return r(X);
        },
        get stacking() {
          return r(te);
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
        get selecting() {
          return r(G);
        },
        get marked() {
          return r(Y);
        },
        onselect: de,
        onsort: (se) => k(X, se, !0),
        onstack: (se) => k(te, to(se), !0),
        onclear: () => k(W, {}, !0),
        onselecting: (se) => k(G, se, !0),
        onshare: Dt,
        onunmark: () => k(P, [], !0),
        ontriage: () => k(s, "triage")
      });
    };
    Z(F, (E) => {
      r(s) === "grid" && E(ie);
    });
  }
  var ve = v(F, 2);
  {
    var ze = (E) => {
      Lu(E, {});
    };
    Z(ve, (E) => {
      n && E(ze);
    });
  }
  var xe = v(ve, 2);
  let be;
  var Fe = f(xe);
  {
    var tt = (E) => {
      var se = Uu(), ge = f(se), Te = f(ge), Le = v(ge, 2);
      Ye(Le, 21, () => Hs, xt, (Ke, ct, un) => {
        var cn = Du();
        let In;
        var zn = f(cn), Ae = f(zn), at = v(zn, 1, !0);
        B(() => {
          In = Me(cn, 1, "nav svelte-1n46o8q", null, In, { on: un === r(a) }), T(Ae, r(ct).id), T(at, r(ct).title);
        }), K("click", cn, () => k(a, un, !0)), R(Ke, cn);
      });
      var bt = v(Le, 2);
      {
        var Vt = (Ke) => {
          var ct = Bu(), un = lt(ct), cn = f(un);
          {
            var In = (Xe) => {
              var nt = ju(), Fn = lt(nt), tr = /* @__PURE__ */ re(() => Ce.bind(null, !0)), Dr = v(Fn, 2), jr = f(Dr);
              B(() => T(jr, `inside ${r(i) ?? ""}`)), K("click", Fn, function(...Hr) {
                r(tr)?.apply(this, Hr);
              }), R(Xe, nt);
            }, zn = (Xe) => {
              var nt = Hu(), Fn = f(nt);
              B(() => T(Fn, r(O).relive)), K("click", nt, () => ne(!0)), R(Xe, nt);
            };
            Z(cn, (Xe) => {
              r(O).drill && r(i) ? Xe(In) : r(O).relive && Xe(zn, 1);
            });
          }
          var Ae = v(un, 2);
          {
            var at = (Xe) => {
              var nt = qu();
              R(Xe, nt);
            };
            Z(Ae, (Xe) => {
              r(b) && Xe(at);
            });
          }
          var dn = v(Ae, 2);
          {
            let Xe = /* @__PURE__ */ re(() => r(m)?.rules ?? []);
            bu(dn, {
              get rows() {
                return r(l);
              },
              get screen() {
                return r(O);
              },
              get root() {
                return r(i);
              },
              get checked() {
                return r(c);
              },
              get rules() {
                return r(Xe);
              },
              get selected() {
                return r(u);
              },
              onpick: ae,
              oncheck: ke
            });
          }
          R(Ke, ct);
        };
        Z(bt, (Ke) => {
          r(ce) && Ke(Vt);
        });
      }
      var on = v(bt, 2);
      {
        var ut = (Ke) => {
          Au(Ke, {
            get root() {
              return Kn;
            },
            get version() {
              return r(I);
            },
            get excludedDirs() {
              return r(V);
            },
            get selected() {
              return r(u);
            },
            get busy() {
              return r(d);
            },
            onload: (ct) => x(() => De.tree(ct)),
            onpick: ae,
            onexclude: Ze
          });
        };
        Z(on, (Ke) => {
          r(O).tree && Ke(ut);
        });
      }
      var jt = v(on, 2);
      {
        let Ke = /* @__PURE__ */ re(() => r(m)?.rules ?? []), ct = /* @__PURE__ */ re(() => r(m)?.unmatched ?? null);
        Zo(jt, {
          get rules() {
            return r(Ke);
          },
          get unmatched() {
            return r(ct);
          },
          get busy() {
            return r(d);
          },
          ondelete: Ge,
          onmove: Tt
        });
      }
      var xn = v(jt, 2);
      qo(xn, { oncomplete: Wt }), K("click", Te, () => k(s, "grid")), R(E, se);
    };
    Z(Fe, (E) => {
      r(s) === "triage" && E(tt);
    });
  }
  var $t = v(Fe, 2), Oe = f($t);
  {
    var an = (E) => {
      var se = Vu(), ge = lt(se), Te = f(ge), Le = v(ge, 2), bt = f(Le), Vt = v(Le, 2);
      {
        var on = (Ae) => {
          var at = Wu(), dn = f(at);
          B(() => T(dn, r(O).note)), R(Ae, at);
        };
        Z(Vt, (Ae) => {
          r(O).note && Ae(on);
        });
      }
      var ut = v(Vt, 2);
      {
        var jt = (Ae) => {
          Co(Ae, {
            get screen() {
              return r(O);
            }
          });
        };
        Z(ut, (Ae) => {
          r(O).name === "dimensions" && Ae(jt);
        });
      }
      var xn = v(ut, 2);
      ql(xn, {
        get counts() {
          return r(m);
        },
        get files() {
          return r(g);
        },
        get filesAt() {
          return r(h);
        },
        get stale() {
          return r(_);
        },
        get candidate() {
          return r(o);
        },
        get busy() {
          return r(w);
        },
        onfiles: U
      });
      var Ke = v(xn, 2);
      {
        var ct = (Ae) => {
          var at = Gu(), dn = f(at), Xe = f(dn), nt = v(dn, 2), Fn = f(nt), tr = v(nt, 2), Dr = v(tr, 2), jr = f(Dr);
          {
            var Hr = (fn) => {
              var Ln = qn("already excluded — nothing left to write");
              R(fn, Ln);
            }, Ba = (fn) => {
              var Ln = qn();
              B((Ua) => T(Ln, `one exclude rule each, at the end of the order${Ua ?? ""}`), [
                () => r(C).length < r(c).size ? ` · ${Re(r(c).size - r(C).length)} already excluded, skipped` : ""
              ]), R(fn, Ln);
            };
            Z(jr, (fn) => {
              r(C).length ? fn(Ba, -1) : fn(Hr);
            });
          }
          B(
            (fn, Ln) => {
              T(Xe, `${fn ?? ""} ticked`), nt.disabled = r(d) || !r(C).length, T(Fn, Ln), tr.disabled = r(d);
            },
            [
              () => Re(r(c).size),
              () => r(d) ? "saving…" : `Exclude ${Re(r(C).length)}`
            ]
          ), K("click", nt, Se), K("click", tr, me), R(Ae, at);
        };
        Z(Ke, (Ae) => {
          r(c).size && Ae(ct);
        });
      }
      var un = v(Ke, 2);
      Yo(un, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(O);
        },
        get saving() {
          return r(d);
        },
        onedit: Ee,
        onconfirm: fe,
        onclear: Ce
      });
      var cn = v(un, 2);
      {
        var In = (Ae) => {
          var at = $u(), dn = f(at);
          B((Xe, nt) => T(dn, `${Xe ?? ""}${nt ?? ""} loaded${r(y).exhausted ? " · all of them" : ""}${r(y).loading ? " · loading…" : ""} `), [
            () => Re(r(y).count),
            () => r(y).total ? " of " + Re(r(y).total) : ""
          ]), R(Ae, at);
        }, zn = (Ae) => {
          var at = Yu();
          R(Ae, at);
        };
        Z(cn, (Ae) => {
          r(q) ? Ae(In) : r(O).sheet === !1 && Ae(zn, 1);
        });
      }
      B(() => {
        T(Te, `${r(O).id ?? ""} · ${r(O).title ?? ""}`), T(bt, r(O).blurb);
      }), R(E, se);
    };
    Z(Oe, (E) => {
      r(s) === "triage" && E(an);
    });
  }
  var Yt = v(Oe, 2);
  {
    var _t = (E) => {
      {
        let se = /* @__PURE__ */ re(() => r(s) === "grid" ? null : r(m)?.page_paths ?? null), ge = /* @__PURE__ */ re(() => r(s) === "triage"), Te = /* @__PURE__ */ re(() => r(s) === "grid" && r(G));
        hr(
          cu(E, {
            get key() {
              return r(J);
            },
            fetchPage: Qe,
            get total() {
              return r(se);
            },
            get triage() {
              return r(ge);
            },
            get excludedDirs() {
              return r(V);
            },
            get selecting() {
              return r(Te);
            },
            get markedKeys() {
              return r(le);
            },
            onActivate: Mt,
            onOverride: yn,
            onExcludeFolder: We,
            onState: (Le) => k(y, { ...r(y), ...Le }, !0)
          }),
          (Le) => k(L, Le, !0),
          () => r(L)
        );
      }
    };
    Z(Yt, (E) => {
      (r(q) || r(s) === "grid") && E(_t);
    });
  }
  var ln = v(xe, 2);
  {
    var er = (E) => {
      Eo(E, {
        get frames() {
          return r(H).frames;
        },
        get origin() {
          return r(H).origin;
        },
        get back() {
          return r(Gt);
        },
        get forward() {
          return r(st);
        },
        onstep: At,
        onreveal: Rt,
        onclose: $e
      });
    };
    Z(ln, (E) => {
      r(H) && E(er);
    });
  }
  var Lr = v(ln, 2);
  {
    var _r = (E) => {
      var se = Ku();
      let ge;
      var Te = f(se);
      B(() => {
        ge = Me(se, 1, "status", null, ge, { bare: r(s) === "grid" }), T(Te, r(M));
      }), R(E, se);
    };
    Z(Lr, (E) => {
      r(M) && E(_r);
    });
  }
  B(() => be = Me(xe, 1, "shell", null, be, { bare: r(s) === "grid" })), R(e, et), vt();
}
Lt(["click"]);
no();
Ss();
fl(Ju, { target: document.getElementById("app") });
