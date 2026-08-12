var ms = Array.isArray, si = Array.prototype.indexOf, Or = Array.prototype.includes, Br = Array.from, ai = Object.defineProperty, Bn = Object.getOwnPropertyDescriptor, ii = Object.getOwnPropertyDescriptors, li = Object.prototype, oi = Array.prototype, oa = Object.getPrototypeOf, Is = Object.isExtensible;
const Rr = () => {
};
function ci(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ca() {
  var e, t, n = new Promise((r, a) => {
    e = r, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
function $r(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const r of e)
    if (n.push(r), n.length === t) break;
  return n;
}
const Ke = 2, Wn = 4, Ur = 8, ua = 1 << 24, Pt = 16, wt = 32, Qt = 64, is = 128, mt = 512, Be = 1024, Ue = 2048, Nt = 4096, tt = 8192, dt = 16384, $n = 32768, ls = 1 << 25, Yn = 65536, Nr = 1 << 17, ui = 1 << 18, Jn = 1 << 19, di = 1 << 20, qt = 1 << 25, Mn = 65536, Ir = 1 << 21, Un = 1 << 22, vn = 1 << 23, kn = Symbol("$state"), fi = Symbol("legacy props"), hi = Symbol(""), da = Symbol("attributes"), os = Symbol("class"), cs = Symbol("style"), us = Symbol("text"), gr = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), vi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function pi(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function gi() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function _i(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function bi(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function mi() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function wi(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function yi() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function xi(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function ki() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Si() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ei() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ti() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Mi = 1, Ai = 2, fa = 4, Ri = 8, Pi = 16, Ci = 1, Oi = 4, Ni = 8, Ii = 16, Li = 1, Fi = 2, qe = Symbol("uninitialized"), zi = "http://www.w3.org/1999/xhtml";
function Di() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function ji() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Hi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ha(e) {
  return e === this.v;
}
function qi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function va(e) {
  return !qi(e, this.v);
}
let Qe = null;
function Gn(e) {
  Qe = e;
}
function ft(e, t = !1, n) {
  Qe = {
    p: Qe,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      be
    ),
    l: null
  };
}
function ht(e) {
  var t = (
    /** @type {ComponentContext} */
    Qe
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Na(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Qe = t.p, e ?? /** @type {T} */
  {};
}
function pa() {
  return !0;
}
let wn = [];
function ga() {
  var e = wn;
  wn = [], ci(e);
}
function Vt(e) {
  if (wn.length === 0 && !dr) {
    var t = wn;
    queueMicrotask(() => {
      t === wn && ga();
    });
  }
  wn.push(e);
}
function Bi() {
  for (; wn.length > 0; )
    ga();
}
function _a(e) {
  var t = be;
  if (t === null)
    return ye.f |= vn, e;
  if ((t.f & $n) === 0 && (t.f & Wn) === 0)
    throw e;
  fn(e, t);
}
function fn(e, t) {
  if (!(t !== null && (t.f & dt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & is) !== 0) {
        if ((t.f & $n) === 0)
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
const Ui = -7169;
function De(e, t) {
  e.f = e.f & Ui | t;
}
function ws(e) {
  (e.f & mt) !== 0 || e.deps === null ? De(e, Be) : De(e, Nt);
}
function ba(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Ke) === 0 || (t.f & Mn) === 0 || (t.f ^= Mn, ba(
        /** @type {Derived} */
        t.deps
      ));
}
function ma(e, t, n) {
  (e.f & Ue) !== 0 ? t.add(e) : (e.f & Nt) !== 0 && n.add(e), ba(e.deps), De(e, Be);
}
let Tr = !1;
function Wi(e) {
  var t = Tr;
  try {
    return Tr = !1, [e(), Tr];
  } finally {
    Tr = t;
  }
}
function Yi(e, t, n, r = !0) {
  r && n();
  for (var a of t)
    e.addEventListener(a, n);
  Wr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function Zn(e) {
  var t = ye, n = be;
  yt(null), Wt(null);
  try {
    return e();
  } finally {
    yt(t), Wt(n);
  }
}
function Gi(e) {
  let t = 0, n = An(0), r;
  return () => {
    Ss() && (s(n), Ia(() => (t === 0 && (r = Zt(() => e(() => fr(n)))), t += 1, () => {
      Vt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, fr(n));
      });
    })));
  };
}
var Ki = Yn | Jn;
function Xi(e, t, n, r) {
  new Vi(e, t, n, r);
}
class Vi {
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
  #b = Gi(() => (this.#d = An(this.#p), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, a) {
    this.#e = t, this.#t = n, this.#l = (i) => {
      var l = (
        /** @type {Effect} */
        be
      );
      l.b = this, l.f |= is, r(i);
    }, this.parent = /** @type {Effect} */
    be.b, this.transform_error = a ?? this.parent?.transform_error ?? ((i) => i), this.#s = Ts(() => {
      this.#h();
    }, Ki);
  }
  #_() {
    try {
      this.#i = _t(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#t.failed, { reset: r, invoke_onerror: a } = this.#m(t);
    Vt(a), n && (this.#o = _t(() => {
      n(
        this.#e,
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
    const a = () => {
      if (n) {
        Hi();
        return;
      }
      n = !0, r && Ti(), this.#o !== null && En(this.#o, () => {
        this.#o = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: a, invoke_onerror: () => {
      try {
        r = !0, this.#t.onerror?.(t, a), r = !1;
      } catch (l) {
        fn(l, this.#s && this.#s.parent);
      }
    } };
  }
  #x() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#n = _t(() => t(this.#e)), Vt(() => {
      var n = this.#a = document.createDocumentFragment(), r = Jt();
      n.append(r), this.#i = this.#v(() => _t(() => this.#l(r))), this.#c === 0 && (this.#e.before(n), this.#a = null, En(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        Te
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#p = 0, this.#i = _t(() => {
        this.#l(this.#e);
      }), this.#c > 0) {
        var t = this.#a = document.createDocumentFragment();
        As(this.#i, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#n = _t(() => n(this.#e));
      } else
        this.#w(
          /** @type {Batch} */
          Te
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
    ma(t, this.#f, this.#g);
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
    var n = be, r = ye, a = Qe;
    Wt(this.#s), yt(this.#s), Gn(this.#s.ctx);
    try {
      return gn.ensure(), t();
    } catch (i) {
      return _a(i), null;
    } finally {
      Wt(n), yt(r), Gn(a);
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
    this.#c += t, this.#c === 0 && (this.#w(n), this.#n && En(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#u) && (this.#u = !0, Vt(() => {
      this.#u = !1, this.#d && Kn(this.#d, this.#p);
    }));
  }
  get_effect_pending() {
    return this.#b(), s(
      /** @type {Source<number>} */
      this.#d
    );
  }
  /** @param {unknown} error */
  error(t) {
    if (!this.#t.onerror && !this.#t.failed)
      throw t;
    Te?.is_fork ? (this.#i && Te.skip_effect(this.#i), this.#n && Te.skip_effect(this.#n), this.#o && Te.skip_effect(this.#o), Te.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#i && (ot(this.#i), this.#i = null), this.#n && (ot(this.#n), this.#n = null), this.#o && (ot(this.#o), this.#o = null);
    let n = this.#t.failed;
    const r = (a) => {
      const { reset: i, invoke_onerror: l } = this.#m(a);
      l(), n && (this.#o = this.#v(() => {
        try {
          return _t(() => {
            var c = (
              /** @type {Effect} */
              be
            );
            c.b = this, c.f |= is, n(
              this.#e,
              () => a,
              () => i
            );
          });
        } catch (c) {
          return fn(
            c,
            /** @type {Effect} */
            this.#s.parent
          ), null;
        }
      }));
    };
    Vt(() => {
      var a;
      try {
        a = this.transform_error(t);
      } catch (i) {
        fn(i, this.#s && this.#s.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof /** @type {any} */
      a.then == "function" ? a.then(
        r,
        /** @param {unknown} e */
        (i) => fn(i, this.#s && this.#s.parent)
      ) : r(a);
    });
  }
}
function $i(e, t, n, r) {
  const a = hr;
  var i = e.filter((h) => !h.settled), l = t.map(a);
  if (n.length === 0 && i.length === 0) {
    r(l);
    return;
  }
  var c = (
    /** @type {Effect} */
    be
  ), o = Ji(), u = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function p(h) {
    if ((c.f & dt) === 0) {
      o();
      try {
        r([...l, ...h]);
      } catch (b) {
        fn(b, c);
      }
      Lr();
    }
  }
  var m = wa();
  if (n.length === 0) {
    u.then(() => p([])).finally(m);
    return;
  }
  function g() {
    Promise.all(n.map((h) => /* @__PURE__ */ Zi(h))).then(p).catch((h) => fn(h, c)).finally(m);
  }
  u ? u.then(() => {
    o(), g(), Lr();
  }) : g();
}
function Ji() {
  var e = (
    /** @type {Effect} */
    be
  ), t = ye, n = Qe, r = (
    /** @type {Batch} */
    Te
  );
  return function(i = !0) {
    Wt(e), yt(t), Gn(n), i && (e.f & dt) === 0 && (r?.activate(), r?.apply());
  };
}
function Lr(e = !0) {
  Wt(null), yt(null), Gn(null), e && Te?.deactivate();
}
function wa() {
  var e = (
    /** @type {Effect} */
    be
  ), t = e.b, n = (
    /** @type {Batch} */
    Te
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function hr(e) {
  var t = Ke | Ue;
  return be !== null && (be.f |= Jn), {
    ctx: Qe,
    deps: null,
    effects: null,
    equals: ha,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      qe
    ),
    wv: 0,
    parent: be,
    ac: null
  };
}
const ir = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function Zi(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    be
  );
  r === null && gi();
  var a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = An(
    /** @type {V} */
    qe
  ), l = !ye, c = /* @__PURE__ */ new Set();
  return vl(() => {
    var o = (
      /** @type {Effect} */
      be
    ), u = ca();
    a = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, (h) => {
        h !== gr && u.reject(h);
      }).finally(Lr);
    } catch (h) {
      u.reject(h), Lr();
    }
    var p = (
      /** @type {Batch} */
      Te
    );
    if (l) {
      if ((o.f & $n) !== 0)
        var m = wa();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        p.async_deriveds.get(o)?.reject(ir);
      else
        for (const h of c.values())
          h.reject(ir);
      c.add(u), p.async_deriveds.set(o, u);
    }
    const g = (h, b = void 0) => {
      m?.(), c.delete(u), b !== ir && (p.activate(), b ? (i.f |= vn, Kn(i, b)) : ((i.f & vn) !== 0 && (i.f ^= vn), Kn(i, h)), p.deactivate());
    };
    u.promise.then(g, (h) => g(null, h || "unknown"));
  }), Wr(() => {
    for (const o of c)
      o.reject(ir);
  }), new Promise((o) => {
    function u(p) {
      function m() {
        p === a ? o(i) : u(a);
      }
      p.then(m, m);
    }
    u(a);
  });
}
// @__NO_SIDE_EFFECTS__
function ie(e) {
  const t = /* @__PURE__ */ hr(e);
  return ja(t), t;
}
// @__NO_SIDE_EFFECTS__
function ya(e) {
  const t = /* @__PURE__ */ hr(e);
  return t.equals = va, t;
}
function Qi(e) {
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
function ys(e) {
  var t, n = be, r = e.parent;
  if (!en && r !== null && e.v !== qe && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (dt | tt)) !== 0)
    return Di(), e.v;
  Wt(r);
  try {
    e.f &= ~Mn, Qi(e), t = Ua(e);
  } finally {
    Wt(n);
  }
  return t;
}
function xa(e) {
  var t = ys(e);
  if (!e.equals(t) && (e.wv = qa(), (!Te?.is_fork || e.deps === null) && (Te !== null ? (Te.capture(e, t, !0), ds?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    De(e, Be);
    return;
  }
  en || (Ct !== null ? (Ss() || Te?.is_fork) && Ct.set(e, t) : ws(e));
}
function el(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Zn(() => {
        t.ac.abort(gr), t.ac = null;
      }), t.fn !== null && (t.teardown = Rr), vr(t, 0), Ms(t));
}
function ka(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Xn(t);
}
let Jr = null, zn = null, Te = null, ds = null, Ct = null, fs = null, dr = !1, Zr = !1, Hn = null, Pr = null;
var Ls = 0;
let tl = 1;
class gn {
  id = tl++;
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
    zn === null ? Jr = zn = this : (zn.#t = this, this.#r = zn), zn = this;
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
      for (var a of r.d)
        De(a, Ue), n(a);
      for (a of r.m)
        De(a, Nt), n(a);
    }
    this.#g.add(t);
  }
  #_() {
    this.#e = !0, Ls++ > 1e3 && (this.#v(), rl());
    for (const o of this.#c)
      this.#u.delete(o), De(o, Ue), this.schedule(o);
    for (const o of this.#u)
      De(o, Nt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Hn = [], r = [], a = Pr = [];
    for (const o of t)
      try {
        this.#y(o, n, r);
      } catch (u) {
        throw Ta(o), this.#b() || this.discard(), u;
      }
    if (Te = null, a.length > 0) {
      var i = gn.ensure();
      for (const o of a)
        i.schedule(o);
    }
    if (Hn = null, Pr = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [o, u] of this.#f)
        Ea(o, u);
      a.length > 0 && /** @type {unknown} */
      Te.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(r), this.#h(n), l.#x(this);
      return;
    }
    this.#c.clear(), this.#u.clear();
    for (const o of this.#l) o(this);
    this.#l.clear(), ds = this, Fs(r), Fs(n), ds = null, this.#o?.resolve();
    var c = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      Te
    );
    if (this.#i === 0 && (this.#a.length === 0 || c !== null) && this.#v(), this.#a.length > 0)
      if (c !== null) {
        const o = c;
        o.#a.push(...this.#a.filter((u) => !o.#a.includes(u)));
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
    t.f ^= Be;
    for (var a = t.first; a !== null; ) {
      var i = a.f, l = (i & (wt | Qt)) !== 0, c = l && (i & Be) !== 0, o = c || (i & tt) !== 0 || this.#f.has(a);
      if (!o && a.fn !== null) {
        l ? a.f ^= Be : (i & Wn) !== 0 ? n.push(a) : br(a) && ((i & Pt) !== 0 && this.#u.add(a), Xn(a));
        var u = a.first;
        if (u !== null) {
          a = u;
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
        for (const [n, [, r]] of this.current)
          if (t.current.has(n) && !r)
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
    for (const [r, a] of t.current)
      !this.previous.has(r) && t.previous.has(r) && this.previous.set(r, t.previous.get(r)), this.current.set(r, a);
    for (const [r, a] of t.async_deriveds) {
      const i = this.async_deriveds.get(r);
      i && a.promise.then(i.resolve).catch(i.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#c, t.#u);
    const n = (r) => {
      var a = r.reactions;
      if (a !== null && !((r.f & Ke) !== 0 && (r.f & (Ue | Nt)) === 0))
        for (const c of a) {
          var i = c.f;
          if ((i & Ke) !== 0)
            n(
              /** @type {Derived} */
              c
            );
          else {
            var l = (
              /** @type {Effect} */
              c
            );
            i & (Un | Pt) && !this.async_deriveds.has(l) && (this.#u.delete(l), De(l, Ue), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), Te = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      ma(t[n], this.#c, this.#u);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== qe && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & vn) === 0 && (this.current.set(t, [n, r]), Ct?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    Te = this;
  }
  deactivate() {
    Te = null, Ct = null;
  }
  flush() {
    try {
      Zr = !0, Te = this, this.#_();
    } finally {
      Ls = 0, fs = null, Hn = null, Pr = null, Zr = !1, Te = null, Ct = null, Sn.clear();
    }
  }
  discard() {
    for (const t of this.#s) t(this);
    this.#s.clear();
    for (const t of this.async_deriveds.values())
      t.reject(ir);
    this.#v(), this.#o?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let m = Jr; m !== null; m = m.#t) {
      var t = m.id < this.id, n = [];
      for (const [g, [h, b]] of this.current) {
        if (m.current.has(g)) {
          var r = (
            /** @type {[any, boolean]} */
            m.current.get(g)[0]
          );
          if (t && h !== r)
            m.current.set(g, [h, b]);
          else
            continue;
        }
        n.push(g);
      }
      if (t)
        for (const [g, h] of this.async_deriveds) {
          const b = m.async_deriveds.get(g);
          b && h.promise.then(b.resolve).catch(b.reject);
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
                (h.f & (Pt | Un)) !== 0 ? m.schedule(h) : m.#h([h]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
          for (var o of n)
            Sa(o, i, l, c);
          c = /* @__PURE__ */ new Map();
          var u = [...m.current].filter(([g, h]) => {
            const b = this.current.get(g);
            return b ? b[0] !== h[0] || b[1] !== h[1] : !0;
          }).map(([g]) => g);
          if (u.length > 0)
            for (const g of this.#p)
              (g.f & (dt | tt | Nr)) === 0 && xs(g, u, c) && ((g.f & (Un | Pt)) !== 0 ? (De(g, Ue), m.schedule(g)) : m.#c.add(g));
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
      let r = this.#n.get(n) ?? 0;
      this.#n.set(n, r + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  decrement(t, n) {
    if (this.#i -= 1, t) {
      let r = this.#n.get(n) ?? 0;
      r === 1 ? this.#n.delete(n) : this.#n.set(n, r - 1);
    }
    this.#d || (this.#d = !0, Vt(() => {
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
    this.#l.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#s.add(t);
  }
  settled() {
    return (this.#o ??= ca()).promise;
  }
  static ensure() {
    if (Te === null) {
      const t = Te = new gn();
      !Zr && !dr && Vt(() => {
        t.#e || t.flush();
      });
    }
    return Te;
  }
  apply() {
    {
      Ct = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (fs = t, t.b?.is_pending && (t.f & (Wn | Ur | ua)) !== 0 && (t.f & $n) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (Hn !== null && n === be && (ye === null || (ye.f & Ke) === 0))
        return;
      if ((r & (Qt | wt)) !== 0) {
        if ((r & Be) === 0)
          return;
        n.f ^= Be;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#r, n = this.#t;
      t === null ? Jr = n : t.#t = n, n === null ? zn = t : n.#r = t, this.linked = !1;
    }
  }
}
function nl(e) {
  var t = dr;
  dr = !0;
  try {
    for (var n; ; ) {
      if (Bi(), Te === null)
        return (
          /** @type {T} */
          n
        );
      Te.flush();
    }
  } finally {
    dr = t;
  }
}
function rl() {
  try {
    yi();
  } catch (e) {
    fn(e, fs);
  }
}
let Xt = null;
function Fs(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (dt | tt)) === 0 && br(r) && (Xt = /* @__PURE__ */ new Set(), Xn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Fa(r), Xt?.size > 0)) {
        Sn.clear();
        for (const a of Xt) {
          if ((a.f & (dt | tt)) !== 0) continue;
          const i = [a];
          let l = a.parent;
          for (; l !== null; )
            Xt.has(l) && (Xt.delete(l), i.push(l)), l = l.parent;
          for (let c = i.length - 1; c >= 0; c--) {
            const o = i[c];
            (o.f & (dt | tt)) === 0 && Xn(o);
          }
        }
        Xt.clear();
      }
    }
    Xt = null;
  }
}
function Sa(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const i = a.f;
      (i & Ke) !== 0 ? Sa(
        /** @type {Derived} */
        a,
        t,
        n,
        r
      ) : (i & (Un | Pt)) !== 0 && (i & Ue) === 0 && xs(a, t, r) && (De(a, Ue), ks(
        /** @type {Effect} */
        a
      ));
    }
}
function xs(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (Or.call(t, a))
        return !0;
      if ((a.f & Ke) !== 0 && xs(
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
function ks(e) {
  Te.schedule(e);
}
function Ea(e, t) {
  if (!((e.f & wt) !== 0 && (e.f & Be) !== 0)) {
    (e.f & Ue) !== 0 ? t.d.push(e) : (e.f & Nt) !== 0 && t.m.push(e), De(e, Be);
    for (var n = e.first; n !== null; )
      Ea(n, t), n = n.next;
  }
}
function Ta(e) {
  De(e, Be);
  for (var t = e.first; t !== null; )
    Ta(t), t = t.next;
}
let Fr = /* @__PURE__ */ new Set();
const Sn = /* @__PURE__ */ new Map();
let Ma = !1;
function An(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ha,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function X(e, t) {
  const n = An(e);
  return ja(n), n;
}
// @__NO_SIDE_EFFECTS__
function sl(e, t = !1, n = !0) {
  const r = An(e);
  return t || (r.equals = va), r;
}
function k(e, t, n = !1) {
  ye !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ot || (ye.f & Nr) !== 0) && pa() && (ye.f & (Ke | Pt | Un | Nr)) !== 0 && (Ut === null || !Ut.has(e)) && Ei();
  let r = n ? Fe(t) : t;
  return Kn(e, r, Pr);
}
function Kn(e, t, n = null) {
  if (!e.equals(t)) {
    Sn.set(e, en ? t : e.v);
    var r = gn.ensure();
    if (r.capture(e, t), (e.f & Ke) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & Ue) !== 0 && ys(a), Ct === null && ws(a);
    }
    e.wv = qa(), Aa(e, Ue, n), be !== null && (be.f & Be) !== 0 && (be.f & (wt | Qt)) === 0 && (gt === null ? _l([e]) : gt.push(e)), !r.is_fork && Fr.size > 0 && !Ma && al();
  }
  return t;
}
function al() {
  Ma = !1;
  for (const e of Fr) {
    (e.f & Be) !== 0 && De(e, Nt);
    let t;
    try {
      t = br(e);
    } catch {
      t = !0;
    }
    t && Xn(e);
  }
  Fr.clear();
}
function il(e, t = 1) {
  var n = s(e), r = t === 1 ? n++ : n--;
  return k(e, n), r;
}
function fr(e) {
  k(e, e.v + 1);
}
function Aa(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var a = r.length, i = 0; i < a; i++) {
      var l = r[i], c = l.f, o = (c & Ue) === 0;
      if (o && De(l, t), (c & Nr) !== 0)
        Fr.add(
          /** @type {Effect} */
          l
        );
      else if ((c & Ke) !== 0) {
        var u = (
          /** @type {Derived} */
          l
        );
        Ct?.delete(u), (c & Mn) === 0 && (c & mt && (be === null || (be.f & Ir) === 0) && (l.f |= Mn), Aa(u, Nt, n));
      } else if (o) {
        var p = (
          /** @type {Effect} */
          l
        );
        (c & Pt) !== 0 && Xt !== null && Xt.add(p), n !== null ? n.push(p) : ks(p);
      }
    }
}
function Fe(e) {
  if (typeof e != "object" || e === null || kn in e)
    return e;
  const t = oa(e);
  if (t !== li && t !== oi)
    return e;
  var n = /* @__PURE__ */ new Map(), r = ms(e), a = /* @__PURE__ */ X(0), i = Tn, l = (c) => {
    if (Tn === i)
      return c();
    var o = ye, u = Tn;
    yt(null), js(i);
    var p = c();
    return yt(o), js(u), p;
  };
  return r && n.set("length", /* @__PURE__ */ X(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, o, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && ki();
        var p = n.get(o);
        return p === void 0 ? l(() => {
          var m = /* @__PURE__ */ X(u.value);
          return n.set(o, m), m;
        }) : k(p, u.value, !0), !0;
      },
      deleteProperty(c, o) {
        var u = n.get(o);
        if (u === void 0) {
          if (o in c) {
            const p = l(() => /* @__PURE__ */ X(qe));
            n.set(o, p), fr(a);
          }
        } else
          k(u, qe), fr(a);
        return !0;
      },
      get(c, o, u) {
        if (o === kn)
          return e;
        var p = n.get(o), m = o in c;
        if (p === void 0 && (!m || Bn(c, o)?.writable) && (p = l(() => {
          var h = Fe(m ? c[o] : qe), b = /* @__PURE__ */ X(h);
          return b;
        }), n.set(o, p)), p !== void 0) {
          var g = s(p);
          return g === qe ? void 0 : g;
        }
        return Reflect.get(c, o, u);
      },
      getOwnPropertyDescriptor(c, o) {
        var u = Reflect.getOwnPropertyDescriptor(c, o);
        if (u && "value" in u) {
          var p = n.get(o);
          p && (u.value = s(p));
        } else if (u === void 0) {
          var m = n.get(o), g = m?.v;
          if (m !== void 0 && g !== qe)
            return {
              enumerable: !0,
              configurable: !0,
              value: g,
              writable: !0
            };
        }
        return u;
      },
      has(c, o) {
        if (o === kn)
          return !0;
        var u = n.get(o), p = u !== void 0 && u.v !== qe || Reflect.has(c, o);
        if (u !== void 0 || be !== null && (!p || Bn(c, o)?.writable)) {
          u === void 0 && (u = l(() => {
            var g = p ? Fe(c[o]) : qe, h = /* @__PURE__ */ X(g);
            return h;
          }), n.set(o, u));
          var m = s(u);
          if (m === qe)
            return !1;
        }
        return p;
      },
      set(c, o, u, p) {
        var m = n.get(o), g = o in c;
        if (r && o === "length")
          for (var h = u; h < /** @type {Source<number>} */
          m.v; h += 1) {
            var b = n.get(h + "");
            b !== void 0 ? k(b, qe) : h in c && (b = l(() => /* @__PURE__ */ X(qe)), n.set(h + "", b));
          }
        if (m === void 0)
          (!g || Bn(c, o)?.writable) && (m = l(() => /* @__PURE__ */ X(void 0)), k(m, Fe(u)), n.set(o, m));
        else {
          g = m.v !== qe;
          var w = l(() => Fe(u));
          k(m, w);
        }
        var d = Reflect.getOwnPropertyDescriptor(c, o);
        if (d?.set && d.set.call(p, u), !g) {
          if (r && typeof o == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= v.v && k(v, y + 1);
          }
          fr(a);
        }
        return !0;
      },
      ownKeys(c) {
        s(a);
        var o = Reflect.ownKeys(c).filter((m) => {
          var g = n.get(m);
          return g === void 0 || g.v !== qe;
        });
        for (var [u, p] of n)
          p.v !== qe && !(u in c) && o.push(u);
        return o;
      },
      setPrototypeOf() {
        Si();
      }
    }
  );
}
function zs(e) {
  try {
    if (e !== null && typeof e == "object" && kn in e)
      return e[kn];
  } catch {
  }
  return e;
}
function ll(e, t) {
  return Object.is(zs(e), zs(t));
}
var pn, Ra, Pa, Ca;
function ol() {
  if (pn === void 0) {
    pn = window, Ra = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Pa = Bn(t, "firstChild").get, Ca = Bn(t, "nextSibling").get, Is(e) && (e[os] = void 0, e[da] = null, e[cs] = void 0, e.__e = void 0), Is(n) && (n[us] = void 0);
  }
}
function Jt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function zr(e) {
  return (
    /** @type {TemplateNode | null} */
    Pa.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function _r(e) {
  return (
    /** @type {TemplateNode | null} */
    Ca.call(e)
  );
}
function f(e, t) {
  return /* @__PURE__ */ zr(e);
}
function lt(e, t = !1) {
  {
    var n = /* @__PURE__ */ zr(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ _r(n) : n;
  }
}
function _(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ _r(r);
  return r;
}
function cl(e) {
  e.textContent = "";
}
function Oa() {
  return !1;
}
function ul(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function dl(e) {
  be === null && (ye === null && wi(), mi()), en && bi();
}
function fl(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function tn(e, t) {
  var n = be;
  n !== null && (n.f & tt) !== 0 && (e |= tt);
  var r = {
    ctx: Qe,
    deps: null,
    nodes: null,
    f: e | Ue | mt,
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
  Te?.register_created_effect(r);
  var a = r;
  if ((e & Wn) !== 0)
    Hn !== null ? Hn.push(r) : gn.ensure().schedule(r);
  else if (t !== null) {
    try {
      Xn(r);
    } catch (l) {
      throw ot(r), l;
    }
    a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
    (a.f & Jn) === 0 && (a = a.first, (e & Pt) !== 0 && (e & Yn) !== 0 && a !== null && (a.f |= Yn));
  }
  if (a !== null && (a.parent = n, n !== null && fl(a, n), ye !== null && (ye.f & Ke) !== 0 && (e & Qt) === 0)) {
    var i = (
      /** @type {Derived} */
      ye
    );
    (i.effects ??= []).push(a);
  }
  return r;
}
function Ss() {
  return ye !== null && !Ot;
}
function Wr(e) {
  const t = tn(Ur, null);
  return De(t, Be), t.teardown = e, t;
}
function Bt(e) {
  dl();
  var t = (
    /** @type {Effect} */
    be.f
  ), n = !ye && (t & wt) !== 0 && Qe !== null && !Qe.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Qe
    );
    (r.e ??= []).push(e);
  } else
    return Na(e);
}
function Na(e) {
  return tn(Wn | di, e);
}
function hl(e) {
  gn.ensure();
  const t = tn(Qt | Jn, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? En(t, () => {
      ot(t), r(void 0);
    }) : (ot(t), r(void 0));
  });
}
function Es(e) {
  return tn(Wn, e);
}
function vl(e) {
  return tn(Un | Jn, e);
}
function Ia(e, t = 0) {
  return tn(Ur | t, e);
}
function W(e, t = [], n = [], r = []) {
  $i(r, t, n, (a) => {
    tn(Ur, () => {
      e(...a.map(s));
    });
  });
}
function Ts(e, t = 0) {
  var n = tn(Pt | t, e);
  return n;
}
function _t(e) {
  return tn(wt | Jn, e);
}
function La(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = en, r = ye;
    Ds(!0), yt(null);
    try {
      t.call(null);
    } finally {
      Ds(n), yt(r);
    }
  }
}
function Ms(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && Zn(() => {
      a.abort(gr);
    });
    var r = n.next;
    (n.f & Qt) !== 0 ? n.parent = null : ot(n, t), n = r;
  }
}
function pl(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & wt) === 0 && ot(t), t = n;
  }
}
function ot(e, t = !0) {
  var n = !1;
  (t || (e.f & ui) !== 0) && e.nodes !== null && e.nodes.end !== null && (gl(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= ls, Ms(e, t && !n), vr(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  La(e), e.f ^= ls, e.f |= dt;
  var a = e.parent;
  a !== null && a.first !== null && Fa(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function gl(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ _r(e);
    e.remove(), e = n;
  }
}
function Fa(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function En(e, t, n = !0) {
  var r = [];
  za(e, r, !0);
  var a = () => {
    n && ot(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var l = () => --i || a();
    for (var c of r)
      c.out(l);
  } else
    a();
}
function za(e, t, n) {
  if ((e.f & tt) === 0) {
    e.f ^= tt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const c of r)
        (c.is_global || n) && t.push(c);
    for (var a = e.first; a !== null; ) {
      var i = a.next;
      if ((a.f & Qt) === 0) {
        var l = (a.f & Yn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (a.f & wt) !== 0 && (e.f & Pt) !== 0;
        za(a, t, l ? n : !1);
      }
      a = i;
    }
  }
}
function Dr(e) {
  Da(e, !0);
}
function Da(e, t) {
  if ((e.f & tt) !== 0) {
    e.f ^= tt, (e.f & Be) === 0 && (De(e, Ue), gn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, a = (n.f & Yn) !== 0 || (n.f & wt) !== 0;
      Da(n, a ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function As(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var a = n === r ? null : /* @__PURE__ */ _r(n);
      t.append(n), n = a;
    }
}
let Cr = !1, en = !1;
function Ds(e) {
  en = e;
}
let ye = null, Ot = !1;
function yt(e) {
  ye = e;
}
let be = null;
function Wt(e) {
  be = e;
}
let Ut = null;
function ja(e) {
  ye !== null && (Ut ??= /* @__PURE__ */ new Set()).add(e);
}
let it = null, ut = 0, gt = null;
function _l(e) {
  gt = e;
}
let Ha = 1, yn = 0, Tn = yn;
function js(e) {
  Tn = e;
}
function qa() {
  return ++Ha;
}
function br(e) {
  var t = e.f;
  if ((t & Ue) !== 0)
    return !0;
  if (t & Ke && (e.f &= ~Mn), (t & Nt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, a = 0; a < r; a++) {
      var i = n[a];
      if (br(
        /** @type {Derived} */
        i
      ) && xa(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & mt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ct === null && De(e, Be);
  }
  return !1;
}
function Ba(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Ut !== null && Ut.has(e)))
    for (var a = 0; a < r.length; a++) {
      var i = r[a];
      (i.f & Ke) !== 0 ? Ba(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? De(i, Ue) : (i.f & Be) !== 0 && De(i, Nt), ks(
        /** @type {Effect} */
        i
      ));
    }
}
function Ua(e) {
  var t = it, n = ut, r = gt, a = ye, i = Ut, l = Qe, c = Ot, o = Tn, u = e.f;
  it = /** @type {null | Value[]} */
  null, ut = 0, gt = null, ye = (u & (wt | Qt)) === 0 ? e : null, Ut = null, Gn(e.ctx), Ot = !1, Tn = ++yn, e.ac !== null && (Zn(() => {
    e.ac.abort(gr);
  }), e.ac = null);
  try {
    e.f |= Ir;
    var p = (
      /** @type {Function} */
      e.fn
    ), m = p();
    e.f |= $n;
    var g = e.deps, h = Te?.is_fork;
    if (it !== null) {
      var b;
      if (h || vr(e, ut), g !== null && ut > 0)
        for (g.length = ut + it.length, b = 0; b < it.length; b++)
          g[ut + b] = it[b];
      else
        e.deps = g = it;
      if (Ss() && (e.f & mt) !== 0)
        for (b = ut; b < g.length; b++)
          (g[b].reactions ??= []).push(e);
    } else !h && g !== null && ut < g.length && (vr(e, ut), g.length = ut);
    if (pa() && gt !== null && !Ot && g !== null && (e.f & (Ke | Nt | Ue)) === 0)
      for (b = 0; b < /** @type {Source[]} */
      gt.length; b++)
        Ba(
          gt[b],
          /** @type {Effect} */
          e
        );
    if (a !== null && a !== e) {
      if (yn++, a.deps !== null)
        for (let w = 0; w < n; w += 1)
          a.deps[w].rv = yn;
      if (t !== null)
        for (const w of t)
          w.rv = yn;
      gt !== null && (r === null ? r = gt : r.push(.../** @type {Source[]} */
      gt));
    }
    return (e.f & vn) !== 0 && (e.f ^= vn), m;
  } catch (w) {
    return _a(w);
  } finally {
    e.f ^= Ir, it = t, ut = n, gt = r, ye = a, Ut = i, Gn(l), Ot = c, Tn = o;
  }
}
function bl(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = si.call(n, e);
    if (r !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[r] = n[a], n.pop());
    }
  }
  if (n === null && (t.f & Ke) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (it === null || !Or.call(it, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & mt) !== 0 && (i.f ^= mt, i.f &= ~Mn), i.v !== qe && ws(i), i.ac !== null && Zn(() => {
      i.ac.abort(gr), i.ac = null, De(i, Ue);
    }), el(i), vr(i, 0);
  }
}
function vr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      bl(e, n[r]);
}
function Xn(e) {
  var t = e.f;
  if ((t & dt) === 0) {
    De(e, Be);
    var n = be, r = Cr;
    be = e, Cr = (t & (wt | Qt)) === 0;
    try {
      (t & (Pt | ua)) !== 0 ? pl(e) : Ms(e), La(e);
      var a = Ua(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Ha;
      var i;
    } finally {
      Cr = r, be = n;
    }
  }
}
async function ml() {
  await Promise.resolve(), nl();
}
function s(e) {
  var t = e.f, n = (t & Ke) !== 0;
  if (ye !== null && !Ot) {
    var r = be !== null && (be.f & dt) !== 0;
    if (!r && (Ut === null || !Ut.has(e))) {
      var a = ye.deps;
      if ((ye.f & Ir) !== 0)
        e.rv < yn && (e.rv = yn, it === null && a !== null && a[ut] === e ? ut++ : it === null ? it = [e] : it.push(e));
      else {
        ye.deps ??= [], Or.call(ye.deps, e) || ye.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [ye] : Or.call(i, ye) || i.push(ye);
      }
    }
  }
  if (en && Sn.has(e))
    return Sn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (en) {
      var c = l.v;
      return ((l.f & Be) === 0 && l.reactions !== null || Ya(l)) && (c = ys(l)), Sn.set(l, c), c;
    }
    var o = (l.f & mt) === 0 && !Ot && ye !== null && (Cr || (ye.f & mt) !== 0), u = (l.f & $n) === 0;
    br(l) && (o && (l.f |= mt), xa(l)), o && !u && (ka(l), Wa(l));
  }
  if (Ct?.has(e))
    return Ct.get(e);
  if ((e.f & vn) !== 0)
    throw e.v;
  return e.v;
}
function Wa(e) {
  if (e.f |= mt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Ke) !== 0 && (t.f & mt) === 0 && (ka(
        /** @type {Derived} */
        t
      ), Wa(
        /** @type {Derived} */
        t
      ));
}
function Ya(e) {
  if (e.v === qe) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Sn.has(t) || (t.f & Ke) !== 0 && Ya(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Zt(e) {
  var t = Ot;
  try {
    return Ot = !0, e();
  } finally {
    Ot = t;
  }
}
const wl = ["touchstart", "touchmove"];
function yl(e) {
  return wl.includes(e);
}
const lr = Symbol("events"), Ga = /* @__PURE__ */ new Set(), hs = /* @__PURE__ */ new Set();
function xl(e, t, n, r = {}) {
  function a(i) {
    if (r.capture || vs.call(t, i), !i.cancelBubble)
      return Zn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Vt(() => {
    t.addEventListener(e, a, r);
  }) : t.addEventListener(e, a, r), a;
}
function xn(e, t, n, r, a) {
  var i = { capture: r, passive: a }, l = xl(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Wr(() => {
    t.removeEventListener(e, l, i);
  });
}
function te(e, t, n) {
  (t[lr] ??= {})[e] = n;
}
function It(e) {
  for (var t = 0; t < e.length; t++)
    Ga.add(e[t]);
  for (var n of hs)
    n(e);
}
let Hs = null;
function vs(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, a = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Hs = e;
  var l = 0, c = Hs === e && e[lr];
  if (c) {
    var o = a.indexOf(c);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[lr] = t;
      return;
    }
    var u = a.indexOf(t);
    if (u === -1)
      return;
    o <= u && (l = o);
  }
  if (i = /** @type {Element} */
  a[l] || e.target, i !== t) {
    ai(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var p = ye, m = be;
    yt(null), Wt(null);
    try {
      for (var g, h = []; i !== null && i !== t; ) {
        try {
          var b = i[lr]?.[r];
          b != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && b.call(i, e);
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
      e[lr] = t, delete e.currentTarget, yt(p), Wt(m);
    }
  }
}
const kl = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Sl(e) {
  return (
    /** @type {string} */
    kl?.createHTML(e) ?? e
  );
}
function El(e) {
  var t = ul("template");
  return t.innerHTML = Sl(e.replaceAll("<!>", "<!---->")), t.content;
}
function jr(e, t) {
  var n = (
    /** @type {Effect} */
    be
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var n = (t & Li) !== 0, r = (t & Fi) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = El(i ? e : "<!>" + e), n || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ zr(a)));
    var l = (
      /** @type {TemplateNode} */
      r || Ra ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (n) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ zr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      jr(c, o);
    } else
      jr(l, l);
    return l;
  };
}
function qn(e = "") {
  {
    var t = Jt(e + "");
    return jr(t, t), t;
  }
}
function Rs() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Jt();
  return e.append(t, n), jr(t, n), e;
}
function C(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function R(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[us] ??= e.nodeValue) && (e[us] = n, e.nodeValue = `${n}`);
}
function Tl(e, t) {
  return Ml(e, t);
}
const Mr = /* @__PURE__ */ new Map();
function Ml(e, { target: t, anchor: n, props: r = {}, events: a, context: i, intro: l = !0, transformError: c }) {
  ol();
  var o = void 0, u = hl(() => {
    var p = n ?? t.appendChild(Jt());
    Xi(
      /** @type {TemplateNode} */
      p,
      {
        pending: () => {
        }
      },
      (h) => {
        ft({});
        var b = (
          /** @type {ComponentContext} */
          Qe
        );
        i && (b.c = i), a && (r.$$events = a), o = e(h, r) || {}, ht();
      },
      c
    );
    var m = /* @__PURE__ */ new Set(), g = (h) => {
      for (var b = 0; b < h.length; b++) {
        var w = h[b];
        if (!m.has(w)) {
          m.add(w);
          var d = yl(w);
          for (const P of [t, document]) {
            var v = Mr.get(P);
            v === void 0 && (v = /* @__PURE__ */ new Map(), Mr.set(P, v));
            var y = v.get(w);
            y === void 0 ? (P.addEventListener(w, vs, { passive: d }), v.set(w, 1)) : v.set(w, y + 1);
          }
        }
      }
    };
    return g(Br(Ga)), hs.add(g), () => {
      for (var h of m)
        for (const d of [t, document]) {
          var b = (
            /** @type {Map<string, number>} */
            Mr.get(d)
          ), w = (
            /** @type {number} */
            b.get(h)
          );
          --w == 0 ? (d.removeEventListener(h, vs), b.delete(h), b.size === 0 && Mr.delete(d)) : b.set(h, w);
        }
      hs.delete(g), p !== n && p.parentNode?.removeChild(p);
    };
  });
  return Al.set(o, u), o;
}
let Al = /* @__PURE__ */ new WeakMap();
class Rl {
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
      ), r = this.#r.get(n);
      if (r)
        Dr(r), this.#l.delete(n);
      else {
        var a = this.#t.get(n);
        a && (Dr(a.effect), this.#r.set(n, a.effect), this.#t.delete(n), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), r = a.effect);
      }
      for (const [i, l] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const c = this.#t.get(l);
        c && (ot(c.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#r) {
        if (i === n || this.#l.has(i)) continue;
        const c = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var u = document.createDocumentFragment();
            As(l, u), u.append(Jt()), this.#t.set(i, { effect: l, fragment: u });
          } else
            ot(l);
          this.#l.delete(i), this.#r.delete(i);
        };
        this.#s || !r ? (this.#l.add(i), En(l, c, !1)) : c();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    this.#e.delete(t);
    const n = Array.from(this.#e.values());
    for (const [r, a] of this.#t)
      n.includes(r) || (ot(a.effect), this.#t.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      Te
    ), a = Oa();
    if (n && !this.#r.has(t) && !this.#t.has(t))
      if (a) {
        var i = document.createDocumentFragment(), l = Jt();
        i.append(l), this.#t.set(t, {
          effect: _t(() => n(l)),
          fragment: i
        });
      } else
        this.#r.set(
          t,
          _t(() => n(this.anchor))
        );
    if (this.#e.set(r, t), a) {
      for (const [c, o] of this.#r)
        c === t ? r.unskip_effect(o) : r.skip_effect(o);
      for (const [c, o] of this.#t)
        c === t ? r.unskip_effect(o.effect) : r.skip_effect(o.effect);
      r.oncommit(this.#i), r.ondiscard(this.#n);
    } else
      this.#i(r);
  }
}
function ee(e, t, n = !1) {
  var r = new Rl(e), a = n ? Yn : 0;
  function i(l, c) {
    r.ensure(l, c);
  }
  Ts(() => {
    var l = !1;
    t((c, o = 0) => {
      l = !0, i(o, c);
    }), l || i(-1, null);
  }, a);
}
function bt(e, t) {
  return t;
}
function Pl(e, t, n) {
  for (var r = [], a = t.length, i, l = t.length, c = 0; c < a; c++) {
    let m = t[c];
    En(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var g = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            ps(e, Br(i.done)), g.delete(i), g.size === 0 && (e.outrogroups = null);
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
      var u = (
        /** @type {Element} */
        n
      ), p = (
        /** @type {Element} */
        u.parentNode
      );
      cl(p), p.append(u), e.items.clear();
    }
    ps(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function ps(e, t, n = !0) {
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
  for (var a = 0; a < t.length; a++) {
    var i = t[a];
    if (r?.has(i)) {
      i.f |= qt;
      const l = document.createDocumentFragment();
      As(i, l);
    } else
      ot(t[a], n);
  }
}
var qs;
function Je(e, t, n, r, a, i = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & fa) !== 0;
  if (o) {
    var u = (
      /** @type {Element} */
      e
    );
    l = u.appendChild(Jt());
  }
  var p = null, m = /* @__PURE__ */ ya(() => {
    var P = n();
    return (
      /** @type {V[]} */
      ms(P) ? P : P == null ? [] : Br(P)
    );
  }), g, h = /* @__PURE__ */ new Map(), b = !0;
  function w(P) {
    (y.effect.f & dt) === 0 && (y.pending.delete(P), y.fallback = p, Cl(y, g, l, t, r), p !== null && (g.length === 0 ? (p.f & qt) === 0 ? Dr(p) : (p.f ^= qt, or(p, null, l)) : En(p, () => {
      p = null;
    })));
  }
  function d(P) {
    y.pending.delete(P);
  }
  var v = Ts(() => {
    g = /** @type {V[]} */
    s(m);
    for (var P = g.length, L = /* @__PURE__ */ new Set(), H = (
      /** @type {Batch} */
      Te
    ), G = Oa(), J = 0; J < P; J += 1) {
      var ne = g[J], B = r(ne, J), D = b ? null : c.get(B);
      D ? (D.v && Kn(D.v, ne), D.i && Kn(D.i, J), G && H.unskip_effect(D.e)) : (D = Ol(
        c,
        b ? l : qs ??= Jt(),
        ne,
        B,
        J,
        a,
        t,
        n
      ), b || (D.e.f |= qt), c.set(B, D)), L.add(B);
    }
    if (P === 0 && i && !p && (b ? p = _t(() => i(l)) : (p = _t(() => i(qs ??= Jt())), p.f |= qt)), P > L.size && _i(), !b)
      if (h.set(H, L), G) {
        for (const [K, O] of c)
          L.has(K) || H.skip_effect(O.e);
        H.oncommit(w), H.ondiscard(d);
      } else
        w(H);
    s(m);
  }), y = { effect: v, items: c, pending: h, outrogroups: null, fallback: p };
  b = !1;
}
function sr(e) {
  for (; e !== null && (e.f & wt) === 0; )
    e = e.next;
  return e;
}
function Cl(e, t, n, r, a) {
  var i = (r & Ri) !== 0, l = t.length, c = e.items, o = sr(e.effect.first), u, p = null, m, g = [], h = [], b, w, d, v;
  if (i)
    for (v = 0; v < l; v += 1)
      b = t[v], w = a(b, v), d = /** @type {EachItem} */
      c.get(w).e, (d.f & qt) === 0 && (d.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(d));
  for (v = 0; v < l; v += 1) {
    if (b = t[v], w = a(b, v), d = /** @type {EachItem} */
    c.get(w).e, e.outrogroups !== null)
      for (const D of e.outrogroups)
        D.pending.delete(d), D.done.delete(d);
    if ((d.f & tt) !== 0 && (Dr(d), i && (d.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(d))), (d.f & qt) !== 0)
      if (d.f ^= qt, d === o)
        or(d, null, n);
      else {
        var y = p ? p.next : o;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), on(e, p, d), on(e, d, y), or(d, y, n), p = d, g = [], h = [], o = sr(p.next);
        continue;
      }
    if (d !== o) {
      if (u !== void 0 && u.has(d)) {
        if (g.length < h.length) {
          var P = h[0], L;
          p = P.prev;
          var H = g[0], G = g[g.length - 1];
          for (L = 0; L < g.length; L += 1)
            or(g[L], P, n);
          for (L = 0; L < h.length; L += 1)
            u.delete(h[L]);
          on(e, H.prev, G.next), on(e, p, H), on(e, G, P), o = P, p = G, v -= 1, g = [], h = [];
        } else
          u.delete(d), or(d, o, n), on(e, d.prev, d.next), on(e, d, p === null ? e.effect.first : p.next), on(e, p, d), p = d;
        continue;
      }
      for (g = [], h = []; o !== null && o !== d; )
        (u ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = sr(o.next);
      if (o === null)
        continue;
    }
    (d.f & qt) === 0 && g.push(d), p = d, o = sr(d.next);
  }
  if (e.outrogroups !== null) {
    for (const D of e.outrogroups)
      D.pending.size === 0 && (ps(e, Br(D.done)), e.outrogroups?.delete(D));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || u !== void 0) {
    var J = [];
    if (u !== void 0)
      for (d of u)
        (d.f & tt) === 0 && J.push(d);
    for (; o !== null; )
      (o.f & tt) === 0 && o !== e.fallback && J.push(o), o = sr(o.next);
    var ne = J.length;
    if (ne > 0) {
      var B = (r & fa) !== 0 && l === 0 ? n : null;
      if (i) {
        for (v = 0; v < ne; v += 1)
          J[v].nodes?.a?.measure();
        for (v = 0; v < ne; v += 1)
          J[v].nodes?.a?.fix();
      }
      Pl(e, J, B);
    }
  }
  i && Vt(() => {
    if (m !== void 0)
      for (d of m)
        d.nodes?.a?.apply();
  });
}
function Ol(e, t, n, r, a, i, l, c) {
  var o = (l & Mi) !== 0 ? (l & Pi) === 0 ? /* @__PURE__ */ sl(n, !1, !1) : An(n) : null, u = (l & Ai) !== 0 ? An(a) : null;
  return {
    v: o,
    i: u,
    e: _t(() => (i(t, o ?? n, u ?? a, c), () => {
      e.delete(r);
    }))
  };
}
function or(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, a = e.nodes.end, i = t && (t.f & qt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ _r(r)
      );
      if (i.before(r), r === a)
        return;
      r = l;
    }
}
function on(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function cn(e, t, n) {
  Es(() => {
    var r = Zt(() => t(e, n?.()) || {});
    if (r?.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
const Bs = [...` 	
\r\f \v\uFEFF`];
function Nl(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var a of Object.keys(n))
      if (n[a])
        r = r ? r + " " + a : a;
      else if (r.length)
        for (var i = a.length, l = 0; (l = r.indexOf(a, l)) >= 0; ) {
          var c = l + i;
          (l === 0 || Bs.includes(r[l - 1])) && (c === r.length || Bs.includes(r[c])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(c + 1) : l = c;
        }
  }
  return r === "" ? null : r;
}
function Us(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var a of Object.keys(e)) {
    var i = e[a];
    i != null && i !== "" && (r += " " + a + ": " + i + n);
  }
  return r;
}
function Il(e, t) {
  if (t) {
    var n = "", r, a;
    return Array.isArray(t) ? (r = t[0], a = t[1]) : r = t, r && (n += Us(r)), a && (n += Us(a, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Ce(e, t, n, r, a, i) {
  var l = (
    /** @type {any} */
    e[os]
  );
  if (l !== n || l === void 0) {
    var c = Nl(n, r, i);
    c == null ? e.removeAttribute("class") : e.className = c, e[os] = n;
  } else if (i && a !== i)
    for (var o in i) {
      var u = !!i[o];
      (a == null || u !== !!a[o]) && e.classList.toggle(o, u);
    }
  return i;
}
function Qr(e, t = {}, n, r) {
  for (var a in n) {
    var i = n[a];
    t[a] !== i && (n[a] == null ? e.style.removeProperty(a) : e.style.setProperty(a, i, r));
  }
}
function $t(e, t, n, r) {
  var a = (
    /** @type {any} */
    e[cs]
  );
  if (a !== t) {
    var i = Il(t, r);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[cs] = t;
  } else r && (Array.isArray(r) ? (Qr(e, n?.[0], r[0]), Qr(e, n?.[1], r[1], "important")) : Qr(e, n, r));
  return r;
}
function cr(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ms(t))
      return ji();
    for (var r of e.options)
      r.selected = t.includes(Ws(r));
    return;
  }
  for (r of e.options) {
    var a = Ws(r);
    if (ll(a, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Ar(e) {
  var t = new MutationObserver(() => {
    "__value" in e && cr(e, e.__value);
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
  }), Wr(() => {
    t.disconnect();
  });
}
function Ws(e) {
  return "__value" in e ? e.__value : e.value;
}
const Ll = Symbol("is custom element"), Fl = Symbol("is html"), zl = vi ? "progress" : "PROGRESS";
function jn(e, t) {
  var n = Ps(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== zl) || (e.value = t ?? "");
}
function Dl(e, t) {
  var n = Ps(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function we(e, t, n, r) {
  var a = Ps(e);
  a[t] !== (a[t] = n) && (t === "loading" && (e[hi] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && jl(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Ps(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[da] ??= {
      [Ll]: e.nodeName.includes("-"),
      [Fl]: e.namespaceURI === zi
    }
  );
}
var Ys = /* @__PURE__ */ new Map();
function jl(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Ys.get(t);
  if (n) return n;
  Ys.set(t, n = []);
  for (var r, a = e, i = Element.prototype; i !== a; ) {
    r = ii(a);
    for (var l in r)
      r[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    a = oa(a);
  }
  return n;
}
class Cs {
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
    var r = this.#e.get(t) || /* @__PURE__ */ new Set();
    return r.add(n), this.#e.set(t, r), this.#l().observe(t, this.#t), () => {
      var a = this.#e.get(t);
      a.delete(n), a.size === 0 && (this.#e.delete(t), this.#r.unobserve(t));
    };
  }
  #l() {
    return this.#r ?? (this.#r = new ResizeObserver(
      /** @param {any} entries */
      (t) => {
        for (var n of t) {
          Cs.entries.set(n.target, n);
          for (var r of this.#e.get(n.target) || [])
            r(n);
        }
      }
    ));
  }
}
var Hl = /* @__PURE__ */ new Cs({
  box: "border-box"
});
function Gs(e, t, n) {
  var r = Hl.observe(e, () => n(e[t]));
  Es(() => (Zt(() => n(e[t])), r));
}
function es(e, t) {
  return e === t || e?.[kn] === t;
}
function pr(e = {}, t, n, r) {
  var a = (
    /** @type {ComponentContext} */
    Qe.r
  ), i = (
    /** @type {Effect} */
    be
  );
  return Es(() => {
    var l, c;
    return Ia(() => {
      l = c, c = [], Zt(() => {
        es(n(...c), e) || (t(e, ...c), l && es(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== a && o.parent !== null && o.parent.f & ls; )
        o = o.parent;
      const u = () => {
        c && es(n(...c), e) && t(null, ...c);
      }, p = o.teardown;
      o.teardown = () => {
        u(), p?.();
      };
    };
  }), e;
}
function ql(e, t) {
  Yi(window, ["resize"], () => Zn(() => t(window[e])));
}
function $(e, t, n, r) {
  var a = !0, i = (n & Ni) !== 0, l = (n & Ii) !== 0, c = (
    /** @type {V} */
    r
  ), o = !0, u = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), p = () => l && a ? (u ??= /* @__PURE__ */ hr(
    /** @type {() => V} */
    r
  ), s(u)) : (o && (o = !1, c = l ? Zt(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), c);
  let m;
  if (i) {
    var g = kn in e || fi in e;
    m = Bn(e, t)?.set ?? (g && t in e ? (L) => e[t] = L : void 0);
  }
  var h, b = !1;
  i ? [h, b] = Wi(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && r !== void 0 && (h = p(), m && (xi(), m(h)));
  var w;
  if (w = () => {
    var L = (
      /** @type {V} */
      e[t]
    );
    return L === void 0 ? p() : (o = !0, L);
  }, (n & Oi) === 0)
    return w;
  if (m) {
    var d = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(L, H) {
        return arguments.length > 0 ? ((!H || d || b) && m(H ? w() : L), L) : w();
      })
    );
  }
  var v = !1, y = ((n & Ci) !== 0 ? hr : ya)(() => (v = !1, w()));
  i && s(y);
  var P = (
    /** @type {Effect} */
    be
  );
  return (
    /** @type {() => V} */
    (function(L, H) {
      if (arguments.length > 0) {
        const G = H ? s(y) : i ? Fe(L) : L;
        return k(y, G), v = !0, c !== void 0 && (c = G), L;
      }
      return en && v || (P.f & dt) !== 0 ? y.v : s(y);
    })
  );
}
function Qn(e) {
  Qe === null && pi(), Bt(() => {
    const t = Zt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Bl = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Bl);
function Ul(e) {
  const t = new URLSearchParams();
  for (const [r, a] of Object.entries(e))
    if (a != null)
      if (Array.isArray(a))
        for (const i of a) t.append(r, String(i));
      else
        t.set(r, String(a));
  const n = t.toString();
  return n ? "?" + n : "";
}
async function Kt(e, t = {}) {
  const n = await fetch(e + Ul(t));
  if (!n.ok) {
    const r = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  }
  return n.json();
}
async function Dn(e, t) {
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
function Ks(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const He = {
  // --- reads
  photos: (e) => Kt("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => Kt("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => Kt("/api/triage/counts", { ...Ks(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Kt("/api/triage/files"),
  screen: (e, t = {}) => Kt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Kt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Kt("/api/triage/page", { ...Ks(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Kt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => Dn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => Dn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => Dn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => Dn("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => Dn("/api/reveal", { id: e }),
  revealOrigin: (e) => Dn("/api/reveal", { origin: e }),
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
function Wl() {
  let e = 0, t = 0;
  return async function(r) {
    const a = ++e, i = await r();
    return a <= t ? { stale: !0, value: void 0 } : (t = a, { stale: !1, value: i });
  };
}
function Yl(e, t) {
  let n = 0;
  const r = (...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...a) => {
    clearTimeout(n), e(...a);
  }, r;
}
const Xs = ["B", "KB", "MB", "GB", "TB"];
function At(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < Xs.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${Xs[n]}`;
}
function Le(e) {
  return (Number(e) || 0).toLocaleString();
}
const Vn = "G:\\photos", Vs = [
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
      value: t ? `${Vn}\\${t}\\${e.key}` : `${Vn}\\${e.key}`
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
function Ka(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), r = Vn.toLowerCase();
  return n.toLowerCase().startsWith(r + "\\") ? n : "";
}
function Os(e, t) {
  const n = t.toLowerCase();
  return e.some((r) => n === r || n.startsWith(r + "\\"));
}
function Gl(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function Kl(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function Xa(e, t) {
  if (!t) return null;
  const n = e.find(
    (r) => r.term && r.term.column === t.column && r.term.op === t.op && Kl(r.term.value, t.value)
  );
  return n ? n.decision : null;
}
var Xl = /* @__PURE__ */ I('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), Vl = /* @__PURE__ */ I('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), $l = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7">…</div>'), Jl = /* @__PURE__ */ I('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), Zl = /* @__PURE__ */ I('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), Ql = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7"> </div>'), eo = /* @__PURE__ */ I('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function to(e, t) {
  ft(t, !0);
  let n = $(t, "counts", 3, null), r = $(t, "files", 3, null), a = $(t, "filesAt", 3, null), i = $(t, "stale", 3, !1), l = $(t, "candidate", 3, null), c = $(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ie(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var u = eo(), p = f(u);
  let m;
  var g = _(f(p), 2);
  {
    var h = (B) => {
      var D = Vl(), K = lt(D), O = f(K), V = f(O), oe = _(O, 2), U = f(oe), le = _(oe, 4), re = f(le), me = _(le, 2), A = f(me), F = _(K, 2);
      {
        var N = (Y) => {
          var M = Xl(), T = _(f(M), 2), j = f(T), ue = _(T, 2), se = f(ue), he = _(ue, 4), ve = f(he), xe = _(he, 2), pe = f(xe), Ee = _(xe, 2), Re = f(Ee);
          W(
            (ke, Oe, fe, x, S) => {
              R(j, `kept ${ke ?? ""}`), R(se, Oe), R(ve, `excluded ${fe ?? ""}`), R(pe, x), R(Re, `${s(o) >= 0 ? "+" : ""}${S ?? ""} excluded`);
            },
            [
              () => Le(n().candidate_kept_paths),
              () => At(n().candidate_kept_bytes),
              () => Le(n().candidate_excluded_paths),
              () => At(n().candidate_excluded_bytes),
              () => Le(s(o))
            ]
          ), C(Y, M);
        };
        ee(F, (Y) => {
          l() && Y(N);
        });
      }
      W(
        (Y, M, T, j) => {
          R(V, `kept ${Y ?? ""}`), R(U, M), R(re, `excluded ${T ?? ""}`), R(A, j);
        },
        [
          () => Le(n().kept_paths),
          () => At(n().kept_bytes),
          () => Le(n().excluded_paths),
          () => At(n().excluded_bytes)
        ]
      ), C(B, D);
    }, b = (B) => {
      var D = $l();
      C(B, D);
    };
    ee(g, (B) => {
      n() ? B(h) : B(b, -1);
    });
  }
  var w = _(p, 2);
  let d;
  var v = f(w), y = _(f(v), 3), P = f(y), L = _(y, 2);
  {
    var H = (B) => {
      var D = Jl();
      C(B, D);
    };
    ee(L, (B) => {
      i() && r() && r() !== "loading" && B(H);
    });
  }
  var G = _(v, 2);
  {
    var J = (B) => {
      var D = Zl(), K = lt(D);
      let O;
      var V = f(K), oe = f(V), U = _(V, 2), le = f(U), re = _(U, 4), me = f(re), A = _(re, 2), F = f(A), N = _(K, 2), Y = f(N);
      W(
        (M, T, j, ue) => {
          O = Ce(K, 1, "line svelte-1vgp6n7", null, O, { outdated: i() }), R(oe, `kept ${M ?? ""}`), R(le, T), R(me, `excluded ${j ?? ""}`), R(F, ue), R(Y, `as of ${a() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Le(r().kept_files),
          () => At(r().kept_bytes),
          () => Le(r().excluded_files),
          () => At(r().excluded_bytes)
        ]
      ), C(B, D);
    }, ne = (B) => {
      var D = Ql(), K = f(D);
      W(() => R(K, r() === "loading" ? "counting…" : "not counted yet")), C(B, D);
    };
    ee(G, (B) => {
      r() && r() !== "loading" ? B(J) : B(ne, -1);
    });
  }
  W(() => {
    m = Ce(p, 1, "block svelte-1vgp6n7", null, m, { busy: c() }), d = Ce(w, 1, "block svelte-1vgp6n7", null, d, { busy: r() === "loading" }), y.disabled = r() === "loading", R(P, r() === "loading" ? "counting…" : "recount");
  }), te("click", y, function(...B) {
    t.onfiles?.apply(this, B);
  }), C(e, u), ht();
}
It(["click"]);
const gs = "http://www.w3.org/2000/svg", mn = {
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
}, hn = {
  ...mn,
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
}, no = [
  { dark: "tint", light: "tintLight", base: mn },
  { dark: "control", light: "controlLight", base: hn },
  { dark: "ink", light: "inkLight", base: hn },
  { dark: "tally", light: "tallyLight", base: hn },
  { dark: "tallyInk", light: "tallyInkLight", base: hn }
], _s = /* @__PURE__ */ new Set();
let Rt = { ...hn };
function ro() {
  return Rt;
}
function ts(e) {
  Rt = io(e), Ns();
  for (const t of _s) t(Rt);
  return Rt;
}
function so(e) {
  return _s.add(e), () => _s.delete(e);
}
function ur(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function ao(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: We(ur(e.r, t.r), 0, 255),
    g: We(ur(e.g, t.g), 0, 255),
    b: We(ur(e.b, t.b), 0, 255),
    a: We(ur(e.a, t.a), 0, 1)
  };
}
function io(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [r, a] of Object.entries(hn))
    typeof a == "boolean" ? n[r] = t[r] === void 0 ? a : !!t[r] : typeof a == "object" ? n[r] = ao(t[r], a) : n[r] = ur(t[r], a);
  return n;
}
function pt({ r: e, g: t, b: n, a: r }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${ze(r, 3)})`;
}
function ze(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function $s({ r: e, g: t, b: n, a: r }) {
  return { r: e, g: t, b: n, a: We(r * 1.7 + 0.22, 0, 1) };
}
function Js(e, t) {
  const n = 0.4 + We(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - We(t, 0, 100) / 100) };
}
function Zs(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, a = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? We(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * a * Math.max(t.glareFactor, 0) / 100;
  return We(i ** (0.1 + We(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const lo = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function oo(e, t, n) {
  const r = We(n.shapeRoundness, 2, 7), a = e / 2, i = t / 2, l = Math.min(n.shapeRadius, a, i), c = a - l, o = i - l, u = 8, p = [];
  for (let h = 0; h <= u; h++) {
    const b = h / u * (Math.PI / 2);
    p.push([l * Math.cos(b) ** (2 / r), l * Math.sin(b) ** (2 / r)]);
  }
  const m = [], g = (h, b, w, d) => {
    let v = Math.atan2(h, -b);
    v < 0 && (v += Math.PI * 2);
    let y = Math.atan2(d, w);
    y < 0 && (y += Math.PI * 2);
    const P = ze(Zs(y, n), 3);
    m.push(`rgba(255, 255, 255, ${P}) ${ze(v / (Math.PI * 2) * 100, 2)}%`);
  };
  g(0, -i, 0, 1);
  for (const [h, b, w] of lo)
    for (let d = 0; d <= u; d++) {
      const [v, y] = p[w ? u - d : d];
      g(h * (c + v), b * (o + y), h * v ** (r - 1), -b * y ** (r - 1));
    }
  return m.push(`rgba(255, 255, 255, ${ze(Zs(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function Ns() {
  const e = Rt, t = document.documentElement.style, n = Js(e.refFresnelRange, e.refFresnelHardness), r = Js(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${ze(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${ze(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", pt(e.tint)), t.setProperty("--glass-tint-light", pt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", pt($s(e.tint))), t.setProperty("--glass-tint-sheet-light", pt($s(e.tintLight))), t.setProperty("--glass-ctl-dark", pt(e.control)), t.setProperty("--glass-ctl-light", pt(e.controlLight)), t.setProperty("--glass-text-dark", pt(e.ink)), t.setProperty("--glass-text-light", pt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", pt(e.tally)), t.setProperty("--glass-tint-tally-light", pt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", pt(e.tallyInk)), t.setProperty("--glass-text-tally-light", pt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${ze(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${ze(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${ze(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${ze(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${ze(e.shadowX)}px ${ze(-e.shadowY)}px ${ze(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(ze(We(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${ze(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(ze(Math.log2(We(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${ze(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${ze(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${ze(We(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${ze(r.width)}px`), t.setProperty("--glass-glare-blur", `${ze(r.blur)}px`);
}
function We(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function co(e, t, n, r, a, i) {
  const l = Math.abs(e) - n + a, c = Math.abs(t) - r + a, o = Math.max(l, 0), u = Math.max(c, 0), p = i === 2 ? Math.hypot(o, u) : (o ** i + u ** i) ** (1 / i);
  return Math.min(Math.max(l, c), 0) + p - a;
}
function uo(e, t, n) {
  const r = e / 2, a = t / 2, i = We(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), c = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), u = (g, h) => co(g - r, h - a, r, a, l, i), p = 256, m = new Float32Array(p + 1);
  for (let g = 0; g <= p; g++) {
    const h = 1 - g / p, b = Math.asin(We(h * h, 0, 1)), w = Math.asin(We(Math.sin(b) / o, 0, 1));
    m[g] = Math.tan(b - w) * c;
  }
  return (g, h) => {
    const b = -u(g, h);
    if (b < 0 || b >= c) return null;
    const w = m[Math.round(b / c * p)];
    if (w === 0) return null;
    const d = 0.75, v = u(g + d, h) - u(g - d, h), y = u(g, h + d) - u(g, h - d), P = Math.hypot(v, y);
    if (P === 0) return null;
    const L = -w / P;
    return { dx: v * L, dy: y * L };
  };
}
function fo(e, t, n) {
  const r = document.createElement("canvas");
  r.width = e, r.height = t;
  const a = r.getContext("2d"), i = a.createImageData(e, t), l = i.data, c = e * t, o = new Float32Array(c), u = new Float32Array(c);
  let p = 0;
  for (let g = 0; g < t; g++)
    for (let h = 0; h < e; h++) {
      const b = n(h + 0.5, g + 0.5);
      if (!b) continue;
      const w = g * e + h;
      o[w] = b.dx, u[w] = b.dy;
      const d = Math.hypot(b.dx, b.dy);
      d > p && (p = d);
    }
  const m = p > 0 ? 127 / p : 0;
  for (let g = 0; g < c; g++) {
    const h = g * 4;
    l[h] = 128 + We(Math.round(o[g] * m), -127, 127), l[h + 1] = 128 + We(Math.round(u[g] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return a.putImageData(i, 0, 0), { url: r.toDataURL(), scale: p * 2 };
}
const ns = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function rs(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${ze(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let ar = null, ho = 0;
function vo() {
  if (ar) return ar;
  const e = document.createElementNS(gs, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), ar = document.createElementNS(gs, "defs"), e.appendChild(ar), document.body.appendChild(e), ar;
}
function un(e) {
  const t = `glass-refract-${++ho}`, n = document.createElementNS(gs, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), vo().appendChild(n);
  let r = 0, a = 0, i = 0, l = 0;
  const c = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, u = "";
  function p() {
    e.style.setProperty("--glass-pre", Rt.blurEdge ? "" : u), e.style.setProperty("--glass-post", Rt.blurEdge ? u : "");
  }
  function m() {
    r < 2 || a < 2 || e.style.setProperty("--glass-glare", oo(r, a, Rt));
  }
  function g() {
    if (r < 2 || a < 2) return;
    const d = Rt, v = fo(r, a, uo(r, a, d)), y = d.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(r)), n.setAttribute("height", String(a)), n.innerHTML = `<feImage x="0" y="0" width="${r}" height="${a}" preserveAspectRatio="none" href="${v.url}" result="map"/>` + rs(v.scale * (1 + y), ns[0], "r") + rs(v.scale, ns[1], "g") + rs(v.scale * (1 - y), ns[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, u = `url(#${n.id})`, p(), getComputedStyle(e).backdropFilter.includes("url(") || (u = "", p()), o = c.map((P) => Rt[P]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, g();
    }));
  }
  const b = new ResizeObserver(([d]) => {
    const v = d.borderBoxSize?.[0], y = v ? { w: Math.round(v.inlineSize), h: Math.round(v.blockSize) } : { w: Math.round(d.contentRect.width), h: Math.round(d.contentRect.height) };
    y.w === r && y.h === a || (r = y.w, a = y.h, m(), h());
  });
  b.observe(e);
  const w = so(() => {
    m(), c.map((d) => Rt[d]).join(" ") !== o ? h() : p();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), b.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const Va = "photos.theme", $a = "dark";
function Ja() {
  return document.documentElement.dataset.theme === "light" ? "light" : $a;
}
function po() {
  const e = localStorage.getItem(Va), t = e === "dark" || e === "light" ? e : $a;
  return document.documentElement.dataset.theme = t, t;
}
function Za(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(Va, e), e;
}
var go = /* @__PURE__ */ I('<div class="glass selected svelte-zne36e"><span class="nums svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span></span> <button class="menu small svelte-zne36e" title="Copy the conditions and the selected ids to the clipboard">Share</button> <button class="menu small svelte-zne36e">Clear</button></div>'), _o = /* @__PURE__ */ I('<span class="spin svelte-zne36e" aria-label="loading"></span>'), Qs = /* @__PURE__ */ I('<span class="badge svelte-zne36e"> </span>'), bo = /* @__PURE__ */ I('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), mo = /* @__PURE__ */ I('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), wo = /* @__PURE__ */ I("<button> </button>"), yo = /* @__PURE__ */ I('<div class="glass sheet sorts svelte-zne36e"></div>'), xo = /* @__PURE__ */ I(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">The same photograph taken more than once is drawn as one tile — a
            bracket or a burst, checked frame against frame rather than guessed
            from the clock. Narrowing the filters takes frames out of a stack and
            never breaks one in two.</p></section></div>`), ko = /* @__PURE__ */ I('<p class="muted svelte-zne36e">loading…</p>'), So = /* @__PURE__ */ I('<span class="help svelte-zne36e">?</span>'), Eo = /* @__PURE__ */ I('<span class="n svelte-zne36e"> </span>'), To = /* @__PURE__ */ I("<button> <!></button>"), Mo = /* @__PURE__ */ I('<span class="muted svelte-zne36e">nothing here</span>'), Ao = /* @__PURE__ */ I('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Ro = /* @__PURE__ */ I('<div class="glass sheet filters svelte-zne36e"><!></div>'), Po = /* @__PURE__ */ I('<div class="topbar svelte-zne36e"><div class="panes svelte-zne36e"><!> <div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <button role="switch" title="Select tiles by clicking them, then copy their ids">Select</button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function Co(e, t) {
  ft(t, !0);
  let n = $(t, "facets", 3, null), r = $(t, "filters", 19, () => ({})), a = $(t, "sort", 3, "newest"), i = $(t, "stacking", 19, () => ({ on: !1 })), l = $(t, "total", 3, null), c = $(t, "tiles", 3, null), o = $(t, "loading", 3, !1), u = $(t, "selecting", 3, !1), p = $(t, "selectedTally", 19, () => ({ stacks: 0, photos: 0 })), m = $(t, "onfilter", 3, () => {
  }), g = $(t, "onsort", 3, () => {
  }), h = $(t, "onstack", 3, () => {
  }), b = $(t, "onclear", 3, () => {
  }), w = $(t, "onselecting", 3, () => {
  }), d = $(t, "onshare", 3, () => {
  }), v = $(t, "ondeselect", 3, () => {
  }), y = $(t, "ontriage", 3, () => {
  }), P = /* @__PURE__ */ X(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), L = /* @__PURE__ */ X(Fe(Ja())), H = /* @__PURE__ */ X(null);
  const G = /* @__PURE__ */ ie(() => c() ?? l()), J = /* @__PURE__ */ ie(() => n()?.dimensions ?? []), ne = /* @__PURE__ */ ie(() => n()?.sorts ?? []), B = /* @__PURE__ */ ie(() => s(ne).find((q) => q.value === a())?.label ?? a()), D = /* @__PURE__ */ ie(() => Object.values(r()).reduce((q, ae) => q + ae.length, 0)), K = /* @__PURE__ */ ie(() => s(J).flatMap((q) => (r()[q.name] ?? []).map((ae) => ({
    dimension: q.name,
    value: ae,
    title: q.title,
    label: q.options.find((Se) => Se.value === ae)?.label ?? String(ae)
  }))));
  function O(q, ae) {
    const Se = r()[q] ?? [], Ae = Se.includes(ae) ? Se.filter((_e) => _e !== ae) : [...Se, ae];
    m()(q, Ae);
  }
  function V(q, ae) {
    return (r()[q] ?? []).includes(ae);
  }
  function oe() {
    k(L, Za(s(L) === "dark" ? "light" : "dark"), !0);
  }
  function U(q) {
    q.key === "Escape" && k(P, "");
  }
  function le(q) {
    s(P) && !q.target.closest(".topbar") && k(P, "");
  }
  Qn(() => {
    const q = new ResizeObserver(([ae]) => {
      const Se = Math.round(ae.borderBoxSize?.[0]?.blockSize ?? ae.contentRect.height);
      document.documentElement.style.setProperty("--header-h", Se + "px");
    });
    return q.observe(s(H)), () => {
      q.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var re = Po();
  xn("keydown", pn, U), xn("pointerdown", pn, le);
  var me = f(re), A = f(me);
  {
    var F = (q) => {
      var ae = go(), Se = f(ae), Ae = f(Se), _e = f(Ae), Me = _(Ae, 2), Ne = f(Me), nt = _(Me, 2), rt = f(nt), je = _(nt, 2), Yt = f(je), vt = _(Se, 2), Rn = _(vt, 2);
      cn(ae, (nn) => un?.(nn)), W(
        (nn, er) => {
          R(_e, nn), R(Ne, p().stacks === 1 ? "stack" : "stacks"), R(rt, er), R(Yt, p().photos === 1 ? "photo" : "photos");
        },
        [
          () => Le(p().stacks),
          () => Le(p().photos)
        ]
      ), te("click", vt, () => d()()), te("click", Rn, () => v()()), C(q, ae);
    };
    ee(A, (q) => {
      p().stacks && q(F);
    });
  }
  var N = _(A, 2), Y = f(N), M = f(Y), T = _(Y, 2), j = f(T), ue = _(T, 2);
  {
    var se = (q) => {
      var ae = _o();
      C(q, ae);
    };
    ee(ue, (q) => {
      o() && q(se);
    });
  }
  cn(N, (q) => un?.(q));
  var he = _(me, 2), ve = f(he), xe = f(ve), pe = f(xe);
  let Ee;
  var Re = f(pe), ke = _(pe, 2);
  let Oe;
  var fe = _(f(ke));
  {
    var x = (q) => {
      var ae = Qs(), Se = f(ae);
      W(() => R(Se, s(D))), C(q, ae);
    };
    ee(fe, (q) => {
      s(D) && q(x);
    });
  }
  var S = _(ke, 2);
  let z;
  var Z = _(f(S));
  {
    var ge = (q) => {
      var ae = Qs(), Se = f(ae);
      W((Ae) => R(Se, Ae), [() => Le(l())]), C(q, ae);
    };
    ee(Z, (q) => {
      i().on && l() !== null && q(ge);
    });
  }
  var de = _(S, 2);
  let ce;
  var Xe = _(de, 2);
  {
    var Lt = (q) => {
      var ae = mo(), Se = f(ae);
      Je(Se, 17, () => s(K), (_e) => _e.dimension + " " + _e.value, (_e, Me) => {
        var Ne = bo(), nt = f(Ne), rt = f(nt), je = _(nt, 1, !0);
        W(() => {
          we(Ne, "title", `${s(Me).title ?? ""}: ${s(Me).label ?? ""} — click to remove`), R(rt, s(Me).title), R(je, s(Me).label);
        }), te("click", Ne, () => O(s(Me).dimension, s(Me).value)), C(_e, Ne);
      });
      var Ae = _(Se, 2);
      te("click", Ae, () => b()()), C(q, ae);
    };
    ee(Xe, (q) => {
      s(K).length && q(Lt);
    });
  }
  var Ye = _(xe, 2), Ve = f(Ye), xt = _(Ye, 2);
  cn(ve, (q) => un?.(q));
  var kt = _(ve, 2);
  {
    var Ft = (q) => {
      var ae = yo();
      Je(ae, 21, () => s(ne), bt, (Se, Ae) => {
        var _e = wo();
        let Me;
        var Ne = f(_e);
        W(() => {
          Me = Ce(_e, 1, "option svelte-zne36e", null, Me, { on: s(Ae).value === a() }), R(Ne, s(Ae).label);
        }), te("click", _e, () => {
          g()(s(Ae).value), k(P, "");
        }), C(Se, _e);
      }), cn(ae, (Se) => un?.(Se)), C(q, ae);
    };
    ee(kt, (q) => {
      s(P) === "sort" && q(Ft);
    });
  }
  var zt = _(kt, 2);
  {
    var Dt = (q) => {
      var ae = xo(), Se = f(ae), Ae = _(f(Se), 2), _e = f(Ae);
      let Me;
      var Ne = f(_e);
      cn(ae, (nt) => un?.(nt)), W(() => {
        Me = Ce(_e, 1, "option svelte-zne36e", null, Me, { on: i().on }), we(_e, "aria-checked", i().on), R(Ne, i().on ? "On" : "Off");
      }), te("click", _e, () => h()({ ...i(), on: !i().on })), C(q, ae);
    };
    ee(zt, (q) => {
      s(P) === "stacks" && q(Dt);
    });
  }
  var jt = _(zt, 2);
  {
    var St = (q) => {
      var ae = Ro(), Se = f(ae);
      {
        var Ae = (Me) => {
          var Ne = ko();
          C(Me, Ne);
        }, _e = (Me) => {
          var Ne = Rs(), nt = lt(Ne);
          Je(nt, 17, () => s(J), bt, (rt, je) => {
            var Yt = Ao(), vt = f(Yt), Rn = f(vt), nn = _(Rn);
            {
              var er = (Et) => {
                var ct = So();
                W(() => we(ct, "title", s(je).hint)), C(Et, ct);
              };
              ee(nn, (Et) => {
                s(je).hint && Et(er);
              });
            }
            var tr = _(vt, 2), nr = f(tr);
            Je(nr, 17, () => s(je).options, bt, (Et, ct) => {
              var Pn = To();
              let wr;
              var yr = f(Pn), xr = _(yr);
              {
                var Gr = (_n) => {
                  var kr = Eo(), E = f(kr);
                  W((Q) => R(E, Q), [() => Le(s(ct).count)]), C(_n, kr);
                };
                ee(xr, (_n) => {
                  s(ct).count !== null && _n(Gr);
                });
              }
              W(
                (_n) => {
                  wr = Ce(Pn, 1, "option svelte-zne36e", null, wr, _n), R(yr, `${s(ct).label ?? ""} `);
                },
                [
                  () => ({ on: V(s(je).name, s(ct).value) })
                ]
              ), te("click", Pn, () => O(s(je).name, s(ct).value)), C(Et, Pn);
            });
            var mr = _(nr, 2);
            {
              var Yr = (Et) => {
                var ct = Mo();
                C(Et, ct);
              };
              ee(mr, (Et) => {
                s(je).options.length || Et(Yr);
              });
            }
            W(() => R(Rn, `${s(je).title ?? ""} `)), C(rt, Yt);
          }), C(Me, Ne);
        };
        ee(Se, (Me) => {
          n() ? Me(_e, -1) : Me(Ae);
        });
      }
      cn(ae, (Me) => un?.(Me)), C(q, ae);
    };
    ee(jt, (q) => {
      s(P) === "filters" && q(St);
    });
  }
  pr(re, (q) => k(H, q), () => s(H)), W(
    (q) => {
      R(M, q), R(j, s(G) === 1 ? "photo" : "photos"), Ee = Ce(pe, 1, "menu svelte-zne36e", null, Ee, { open: s(P) === "sort" }), we(pe, "aria-expanded", s(P) === "sort"), R(Re, s(B)), Oe = Ce(ke, 1, "menu svelte-zne36e", null, Oe, { open: s(P) === "filters", on: s(D) > 0 }), we(ke, "aria-expanded", s(P) === "filters"), z = Ce(S, 1, "menu svelte-zne36e", null, z, { open: s(P) === "stacks", on: i().on }), we(S, "aria-expanded", s(P) === "stacks"), ce = Ce(de, 1, "menu svelte-zne36e", null, ce, { on: u() }), we(de, "aria-checked", u()), we(Ye, "title", s(L) === "dark" ? "Switch to a white background" : "Switch to a black background"), we(Ye, "aria-label", s(L) === "dark" ? "Switch to a white background" : "Switch to a black background"), R(Ve, s(L) === "dark" ? "☀" : "☾");
    },
    [() => s(G) === null ? "…" : Le(s(G))]
  ), te("click", pe, () => k(P, s(P) === "sort" ? "" : "sort", !0)), te("click", ke, () => k(P, s(P) === "filters" ? "" : "filters", !0)), te("click", S, () => k(P, s(P) === "stacks" ? "" : "stacks", !0)), te("click", de, () => w()(!u())), te("click", Ye, oe), te("click", xt, () => y()()), C(e, re), ht();
}
It(["click"]);
const Ht = 4, Hr = 220, Oo = 340, dn = 12, ea = Ht + dn, Qa = 6, No = 5, Io = 0.025, Lo = 9;
function qr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Fo(e, t, n, r, a) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, c = 0, o = 1 / 0;
    for (; l < e.length && (c += qr(e[l]), l++, o = (n - Ht * (l - i - 1)) / c, !(o <= Hr)); )
      ;
    if (o > Hr && !r) break;
    a(i, l, Math.round(Math.min(o, Oo))), i = l;
  }
  return i;
}
function ei(e, t, n) {
  const r = [];
  let a = 0;
  for (let i = e.from; i < e.to; i++) {
    const c = i === e.to - 1 ? n - a : Math.round(qr(t[i]) * e.height);
    r.push({ index: i, x: a, w: c }), a += c + Ht;
  }
  return r;
}
function zo(e, t) {
  const n = Math.min((e | 0) - 1, Qa);
  if (n < 1) return [];
  const r = Math.min(No, t * Io), a = [];
  for (let i = 1; i <= n; i++)
    a.push({
      top: Math.round(dn * (n - i) / n),
      inset: Math.round(i * r),
      // Integer percent, so the value lands on the decimal it reads as rather
      // than on whatever a chain of float multiplies leaves behind.
      opacity: (100 - (i - 1) * Lo) / 100
    });
  return a;
}
function ta(e, t, n, r) {
  const a = bs(e, r.top, r.bottom);
  if (!a) return [];
  const i = [];
  for (let l = a[0]; l <= a[1]; l++) {
    const c = e[l];
    if (!(c.top > r.bottom || c.top + c.height < r.top))
      for (const o of ei(c, t, n))
        o.x <= r.right && o.x + o.w >= r.left && i.push(o.index);
  }
  return i;
}
function bs(e, t, n) {
  if (!e.length) return null;
  let r = 0, a = e.length - 1;
  for (; r < a; ) {
    const l = r + a >> 1;
    e[l].top + e[l].height < t ? r = l + 1 : a = l;
  }
  const i = r;
  for (a = e.length - 1; r < a; ) {
    const l = r + a + 1 >> 1;
    e[l].top <= n ? r = l : a = l - 1;
  }
  return [i, Math.max(i, r)];
}
var Do = /* @__PURE__ */ I('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), jo = /* @__PURE__ */ I('<div role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Previous tile" aria-label="Previous tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M14.5 5 7.5 12l7 7"></path></svg></button></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Next tile" aria-label="Next tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M9.5 5l7 7-7 7"></path></svg></button></div></div>');
function Ho(e, t) {
  ft(t, !0);
  let n = $(t, "frames", 19, () => []), r = $(t, "origin", 3, null), a = $(t, "back", 3, !1), i = $(t, "forward", 3, !1), l = $(t, "onstep", 3, () => {
  }), c = $(t, "onreveal", 3, () => {
  }), o = $(t, "onclose", 3, () => {
  });
  const u = 40, p = 72, m = /* @__PURE__ */ ie(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let g = /* @__PURE__ */ X(Fe(document.documentElement.clientWidth)), h = /* @__PURE__ */ X(Fe(document.documentElement.clientHeight)), b = /* @__PURE__ */ X(null), w = /* @__PURE__ */ X(Fe(/* @__PURE__ */ new Set()));
  const d = 4, v = 25, y = { x: 0, y: 0, w: 0, h: 0 }, P = /* @__PURE__ */ ie(() => Math.max(0, s(g) - p * 2)), L = /* @__PURE__ */ ie(() => Math.max(0, s(h) - u * 2)), H = /* @__PURE__ */ ie(() => s(P) > 0 && s(L) > 0 ? B(n(), s(P), s(L)) : n().map(() => y));
  function G(T, j, ue) {
    const se = [];
    let he = 0, ve = 0;
    for (let xe = 0; xe < T.length; xe++)
      ve += qr(T[xe]), ve * ue + Ht * (xe - he) >= j && (se.push({ from: he, to: xe + 1, sum: ve }), he = xe + 1, ve = 0);
    return he < T.length && se.push({ from: he, to: T.length, sum: ve }), se;
  }
  function J(T, j, ue) {
    return T.map((se, he) => {
      const ve = (j - Ht * (se.to - se.from - 1)) / se.sum;
      return he === T.length - 1 && ve > ue ? ue : ve;
    });
  }
  function ne(T, j, ue) {
    return J(T, j, ue).reduce((se, he) => se + he, 0) + Ht * (T.length - 1);
  }
  function B(T, j, ue) {
    let se = d, he = Math.max(d, ue);
    for (let Re = 0; Re < v; Re++) {
      const ke = (se + he) / 2;
      ne(G(T, j, ke), j, ke) <= ue ? se = ke : he = ke;
    }
    const ve = G(T, j, se), xe = J(ve, j, se), pe = [];
    let Ee = (ue - (xe.reduce((Re, ke) => Re + ke, 0) + Ht * (ve.length - 1))) / 2;
    return ve.forEach((Re, ke) => {
      const Oe = xe[ke], fe = [];
      for (let z = Re.from; z < Re.to; z++) fe.push(qr(T[z]) * Oe);
      const x = fe.reduce((z, Z) => z + Z, 0) + Ht * (fe.length - 1);
      let S = (j - x) / 2;
      for (const z of fe)
        pe.push({
          x: Math.round(S),
          y: Math.round(Ee),
          w: Math.round(z),
          h: Math.round(Oe)
        }), S += z + Ht;
      Ee += Oe + Ht;
    }), pe;
  }
  function D(T) {
    if (!r() || !T || !T.w || !T.h) return "none";
    const j = r().left - (p + T.x), ue = r().top - (u + T.y);
    return `translate(${j}px, ${ue}px) scale(${r().width / T.w}, ${r().height / T.h})`;
  }
  const K = 1600;
  let O = /* @__PURE__ */ X(!1), V = 0;
  function oe() {
    k(O, !1), clearTimeout(V), V = setTimeout(() => k(O, !0), K);
  }
  function U(T) {
    if (T.key === "Escape") {
      o()();
      return;
    }
    T.key !== "ArrowLeft" && T.key !== "ArrowRight" || (T.preventDefault(), l()(T.key === "ArrowLeft" ? -1 : 1, T.repeat));
  }
  function le(T) {
    T.target.closest(".frame, .lane") || o()();
  }
  Qn(() => (s(b)?.focus(), oe(), () => clearTimeout(V)));
  var re = jo();
  xn("keydown", pn, U), xn("pointerdown", pn, le), xn("pointermove", pn, oe);
  let me;
  var A = f(re);
  $t(A, "", {}, { inset: "40px 72px" }), Je(A, 23, n, (T) => T.id, (T, j, ue) => {
    var se = Do();
    let he;
    var ve = f(se);
    let xe;
    W(
      (pe, Ee) => {
        he = $t(se, "", he, pe), we(ve, "src", `/d/${s(j).s ?? ""}.webp`), xe = Ce(ve, 1, "svelte-5g1i2z", null, xe, Ee);
      },
      [
        () => ({
          left: `${s(H)[s(ue)].x ?? ""}px`,
          top: `${s(H)[s(ue)].y ?? ""}px`,
          width: `${s(H)[s(ue)].w ?? ""}px`,
          height: `${s(H)[s(ue)].h ?? ""}px`,
          "--flight": D(s(H)[s(ue)])
        }),
        () => ({ loaded: s(w).has(s(j).id) })
      ]
    ), te("click", se, () => c()(s(j))), xn("load", ve, () => k(w, new Set(s(w)).add(s(j).id), !0)), C(T, se);
  });
  var F = _(A, 2);
  $t(F, "", {}, { width: "44px", left: "14px" });
  var N = f(F);
  cn(N, (T) => un?.(T));
  var Y = _(F, 2);
  $t(Y, "", {}, { width: "44px", right: "14px" });
  var M = f(Y);
  cn(M, (T) => un?.(T)), pr(re, (T) => k(b, T), () => s(b)), W(() => {
    me = Ce(re, 1, "glass pane svelte-5g1i2z", null, me, { resting: s(O) }), we(re, "aria-label", s(m)), N.disabled = !a(), M.disabled = !i();
  }), te("click", N, () => l()(-1)), te("click", M, () => l()(1)), Gs(re, "clientWidth", (T) => k(g, T)), Gs(re, "clientHeight", (T) => k(h, T)), C(e, re), ht();
}
It(["click"]);
var qo = /* @__PURE__ */ I('<span class="err svelte-uzy12d"> </span>'), Bo = /* @__PURE__ */ I(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Uo = /* @__PURE__ */ I(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), Wo = /* @__PURE__ */ I('<span class="muted svelte-uzy12d"> </span>'), Yo = /* @__PURE__ */ I('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function Go(e, t) {
  ft(t, !0);
  let n = /* @__PURE__ */ X(null), r = /* @__PURE__ */ X(!1), a = /* @__PURE__ */ X(null);
  async function i() {
    k(r, !0), k(a, null);
    try {
      k(n, await He.probe(), !0);
    } catch (h) {
      k(a, String(h), !0);
    } finally {
      k(r, !1);
    }
  }
  var l = Yo(), c = f(l), o = f(c), u = _(c, 2);
  {
    var p = (h) => {
      var b = qo(), w = f(b);
      W(() => R(w, s(a))), C(h, b);
    }, m = (h) => {
      var b = Rs(), w = lt(b);
      {
        var d = (y) => {
          var P = Bo(), L = _(f(P), 2);
          W(
            (H) => R(L, ` above are formats the header
        reader cannot measure (${H ?? ""}) or files with no
        extension.`),
            [() => s(n).formats.join(" ")]
          ), C(y, P);
        }, v = (y) => {
          var P = Uo(), L = f(P), H = f(L), G = _(L, 2), J = f(G);
          W(
            (ne) => {
              R(H, ne), R(J, s(n).command);
            },
            [() => Le(s(n).worklist)]
          ), C(y, P);
        };
        ee(w, (y) => {
          s(n).worklist === 0 ? y(d) : y(v, -1);
        });
      }
      C(h, b);
    }, g = (h) => {
      var b = Wo(), w = f(b);
      W(() => R(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), C(h, b);
    };
    ee(u, (h) => {
      s(a) ? h(p) : s(n) ? h(m, 1) : h(g, -1);
    });
  }
  W(() => {
    c.disabled = s(r), R(o, s(r) ? "counting…" : "Check the dimension probe's worklist");
  }), te("click", c, i), C(e, l), ht();
}
It(["click"]);
var Ko = /* @__PURE__ */ I('<p class="bad svelte-1xjbga"> </p>'), Xo = /* @__PURE__ */ I('<pre class="svelte-1xjbga"> </pre>'), Vo = /* @__PURE__ */ I('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), $o = /* @__PURE__ */ I(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), Jo = /* @__PURE__ */ I('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), Zo = /* @__PURE__ */ I('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), Qo = /* @__PURE__ */ I(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), ec = /* @__PURE__ */ I('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), tc = /* @__PURE__ */ I(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function nc(e, t) {
  ft(t, !0);
  let n = /* @__PURE__ */ X(null), r = /* @__PURE__ */ X(!1), a = /* @__PURE__ */ X(null), i = /* @__PURE__ */ X(null);
  const l = /* @__PURE__ */ ie(() => s(n)?.state === "running"), c = /* @__PURE__ */ ie(() => s(n)?.snapshot ? s(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const y = await He.rebuildStatus();
      k(n, y, !0), k(a, null), y.state === "done" && y.started_at !== s(i) && (k(i, y.started_at, !0), t.oncomplete?.());
    } catch (y) {
      k(a, String(y), !0);
    }
  }
  Qn(() => {
    o();
  }), Bt(() => {
    if (!s(l)) return;
    const y = setInterval(o, 700);
    return () => clearInterval(y);
  });
  async function u() {
    k(r, !0), k(a, null);
    try {
      k(n, await He.rebuild(), !0);
    } catch (y) {
      k(a, String(y), !0);
    }
  }
  function p(y) {
    y.key === "Escape" && k(r, !1);
  }
  var m = tc();
  xn("keydown", pn, p);
  var g = lt(m), h = f(g), b = f(h), w = _(h, 2), d = _(g, 2);
  {
    var v = (y) => {
      var P = ec(), L = lt(P), H = _(L, 2), G = f(H), J = _(f(G), 4), ne = f(J), B = _(J, 2), D = _(G, 2);
      {
        var K = (A) => {
          var F = Ko(), N = f(F);
          W(() => R(N, s(a))), C(A, F);
        };
        ee(D, (A) => {
          s(a) && A(K);
        });
      }
      var O = _(D, 2);
      Je(O, 17, () => s(n)?.steps ?? [], bt, (A, F) => {
        var N = Vo();
        let Y;
        var M = f(N), T = f(M), j = f(T);
        {
          var ue = (fe) => {
            var x = qn("✓");
            C(fe, x);
          }, se = (fe) => {
            var x = qn("✕");
            C(fe, x);
          }, he = (fe) => {
            var x = qn("·");
            C(fe, x);
          }, ve = (fe) => {
            var x = qn(" ");
            C(fe, x);
          };
          ee(j, (fe) => {
            s(F).state === "done" ? fe(ue) : s(F).state === "failed" ? fe(se, 1) : s(F).state === "running" ? fe(he, 2) : fe(ve, -1);
          });
        }
        var xe = _(T, 2), pe = f(xe), Ee = _(xe, 4), Re = f(Ee), ke = _(M, 2);
        {
          var Oe = (fe) => {
            var x = Xo(), S = f(x);
            W((z) => R(S, z), [() => s(F).log.join(`
`)]), C(fe, x);
          };
          ee(ke, (fe) => {
            s(F).log.length && fe(Oe);
          });
        }
        W(() => {
          Y = Ce(N, 1, "step svelte-1xjbga", null, Y, {
            on: s(F).state === "running",
            bad: s(F).state === "failed"
          }), R(pe, s(F).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), R(Re, s(F).seconds === null ? "" : s(F).seconds + "s");
        }), C(A, N);
      });
      var V = _(O, 2);
      {
        var oe = (A) => {
          var F = $o(), N = lt(F), Y = f(N);
          W(() => R(Y, s(n).error)), C(A, F);
        }, U = (A) => {
          var F = Jo();
          C(A, F);
        }, le = (A) => {
          var F = Zo();
          C(A, F);
        };
        ee(V, (A) => {
          s(n)?.state === "failed" ? A(oe) : s(n)?.state === "done" ? A(U, 1) : s(l) && A(le, 2);
        });
      }
      var re = _(V, 2);
      {
        var me = (A) => {
          var F = Qo(), N = _(f(F), 6), Y = f(N);
          W(() => R(Y, `python -m photolib.restore_state ${s(c) ?? ""}`)), C(A, F);
        };
        ee(re, (A) => {
          s(c) && A(me);
        });
      }
      W(() => R(ne, `${s(n)?.seconds ?? 0 ?? ""}s`)), te("click", L, () => k(r, !1)), te("click", B, () => k(r, !1)), C(y, P);
    };
    ee(d, (y) => {
      s(r) && y(v);
    });
  }
  W(() => {
    h.disabled = s(l), R(b, s(l) ? "applying…" : "Apply to grid"), w.disabled = !s(n) || s(n).state === "idle";
  }), te("click", h, u), te("click", w, () => k(r, !0)), C(e, m), ht();
}
It(["click"]);
var rc = /* @__PURE__ */ I('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), na = /* @__PURE__ */ I("<option> </option>"), sc = /* @__PURE__ */ I('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), ac = /* @__PURE__ */ I('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), ic = /* @__PURE__ */ I('<div class="none muted svelte-bqi9ky"> </div>'), lc = /* @__PURE__ */ I('<div class="bar svelte-bqi9ky"><!></div>');
function oc(e, t) {
  ft(t, !0);
  let n = $(t, "candidate", 3, null), r = $(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), c = /* @__PURE__ */ ie(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ ie(() => !!n() && n().op !== "is null");
  function u(w, d) {
    const v = { ...n(), [w]: d };
    if (w === "column") {
      const y = i[d] ?? ["="];
      y.includes(v.op) || (v.op = y[0]), v.value = l.has(d) ? 0 : "";
    }
    w === "op" && d === "is null" && (v.value = null), w === "value" && l.has(v.column) && (v.value = Number(d) || 0), t.onedit(v);
  }
  var p = lc(), m = f(p);
  {
    var g = (w) => {
      var d = rc(), v = f(d), y = f(v), P = _(v, 2), L = f(P);
      W(() => {
        R(y, `${t.screen.title ?? ""} does not save a rule.`), R(L, t.screen.blurb);
      }), C(w, d);
    }, h = (w) => {
      var d = ac(), v = lt(d), y = f(v);
      Je(y, 21, () => a, bt, (N, Y) => {
        var M = na(), T = f(M), j = {};
        W(() => {
          R(T, s(Y)), j !== (j = s(Y)) && (M.value = (M.__value = s(Y)) ?? "");
        }), C(N, M);
      });
      var P;
      Ar(y);
      var L = _(y, 2);
      Je(L, 21, () => s(c), bt, (N, Y) => {
        var M = na(), T = f(M), j = {};
        W(() => {
          R(T, s(Y)), j !== (j = s(Y)) && (M.value = (M.__value = s(Y)) ?? "");
        }), C(N, M);
      });
      var H;
      Ar(L);
      var G = _(L, 2);
      {
        var J = (N) => {
          var Y = sc();
          W(() => jn(Y, n().value ?? "")), te("input", Y, (M) => u("value", M.currentTarget.value)), C(N, Y);
        };
        ee(G, (N) => {
          s(o) && N(J);
        });
      }
      var ne = _(G, 2), B = f(ne);
      B.value = B.__value = "exclude";
      var D = _(B);
      D.value = D.__value = "include";
      var K;
      Ar(ne);
      var O = _(ne, 2), V = f(O);
      V.value = V.__value = "end";
      var oe = _(V);
      oe.value = oe.__value = "0";
      var U;
      Ar(O);
      var le = _(O, 2), re = f(le), me = _(le, 2), A = _(v, 2), F = f(A);
      W(
        (N, Y) => {
          P !== (P = n().column) && (y.value = (y.__value = n().column) ?? "", cr(y, n().column)), H !== (H = n().op) && (L.value = (L.__value = n().op) ?? "", cr(L, n().op)), K !== (K = n().decision ?? "exclude") && (ne.value = (ne.__value = n().decision ?? "exclude") ?? "", cr(ne, n().decision ?? "exclude")), U !== (U = N) && (O.value = (O.__value = N) ?? "", cr(O, N)), le.disabled = r(), R(re, r() ? "saving…" : "Confirm"), R(F, `${Y ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Gl(n())
        ]
      ), te("change", y, (N) => u("column", N.currentTarget.value)), te("change", L, (N) => u("op", N.currentTarget.value)), te("change", ne, (N) => u("decision", N.currentTarget.value)), te("change", O, (N) => u("at", N.currentTarget.value)), te("click", le, function(...N) {
        t.onconfirm?.apply(this, N);
      }), te("click", me, function(...N) {
        t.onclear?.apply(this, N);
      }), C(w, d);
    }, b = (w) => {
      var d = ic(), v = f(d);
      W(() => R(v, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), C(w, d);
    };
    ee(m, (w) => {
      t.screen.rule === !1 ? w(g) : n() ? w(h, 1) : w(b, -1);
    });
  }
  C(e, p), ht();
}
It(["change", "input", "click"]);
var cc = /* @__PURE__ */ I('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), uc = /* @__PURE__ */ I('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), dc = /* @__PURE__ */ I('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), fc = /* @__PURE__ */ I('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function hc(e, t) {
  ft(t, !0);
  let n = $(t, "rules", 19, () => []), r = $(t, "unmatched", 3, null), a = $(t, "busy", 3, !1);
  var i = fc(), l = f(i), c = _(f(l)), o = f(c), u = _(l, 2);
  {
    var p = (b) => {
      var w = cc();
      C(b, w);
    };
    ee(u, (b) => {
      n().length === 0 && b(p);
    });
  }
  var m = _(u, 2);
  Je(m, 19, n, (b) => b.id, (b, w, d) => {
    var v = uc();
    let y;
    var P = f(v), L = f(P), H = f(L), G = _(L, 2), J = f(G), ne = _(G, 2), B = f(ne), D = _(P, 2), K = f(D), O = f(K), V = _(K, 2), oe = f(V), U = _(V, 4), le = _(U, 2), re = _(le, 2);
    W(
      (me, A) => {
        y = Ce(v, 1, "rule svelte-aof9c2", null, y, { exclude: s(w).decision === "exclude" }), R(H, s(d)), R(J, s(w).predicate), R(B, s(w).decision), R(O, `${me ?? ""} paths`), R(oe, A), U.disabled = a() || s(d) === 0, le.disabled = a() || s(d) === n().length - 1, re.disabled = a();
      },
      [
        () => Le(s(w).paths),
        () => At(s(w).bytes)
      ]
    ), te("click", U, () => t.onmove(s(w), s(d) - 1)), te("click", le, () => t.onmove(s(w), s(d) + 1)), te("click", re, () => t.ondelete(s(w))), C(b, v);
  });
  var g = _(m, 2);
  {
    var h = (b) => {
      var w = dc(), d = _(f(w), 2), v = f(d), y = f(v), P = _(v, 2), L = f(P);
      W(
        (H, G) => {
          R(y, `${H ?? ""} paths`), R(L, G);
        },
        [
          () => Le(r().paths),
          () => At(r().bytes)
        ]
      ), C(b, w);
    };
    ee(g, (b) => {
      r() && b(h);
    });
  }
  W(() => R(o, `${n().length ?? ""} rules · top-down, first match wins`)), C(e, i), ht();
}
It(["click"]);
function ss(e) {
  return { key: e.id, ids: (e.m ?? [e]).map((t) => t.id) };
}
function vc(e, t) {
  const n = e.filter((r) => r.key !== t.key);
  return n.length === e.length ? [...e, t] : n;
}
function ra(e, t, n) {
  if (!n) {
    const a = new Set(t.map((i) => i.key));
    return e.filter((i) => !a.has(i.key));
  }
  const r = new Set(e.map((a) => a.key));
  return [...e, ...t.filter((a) => !r.has(a.key))];
}
function pc(e) {
  return {
    stacks: e.length,
    photos: e.reduce((t, n) => t + n.ids.length, 0)
  };
}
function gc(e) {
  const t = e.stacking.on ? "on" : "off", n = Object.entries(e.filters).filter(([, r]) => r.length > 0).sort(([r], [a]) => r < a ? -1 : r > a ? 1 : 0).map(([r, a]) => r + ":" + a.join("|"));
  return `stack=${t} sort=${e.sort} filters=${n.length ? n.join(",") : "none"}`;
}
function _c(e, t) {
  const n = t.map((r) => "[" + r.ids.join(",") + "]").join(",");
  return gc(e) + `
` + n;
}
const sa = 2500, bc = 1, mc = 2, aa = 4, wc = 3e7, bn = /* @__PURE__ */ new WeakMap();
function ia(e) {
  return bn.get(e).photo.getBoundingClientRect();
}
function yc(e, t, n) {
  const r = [], a = [], i = /* @__PURE__ */ new Map(), l = [], c = [];
  let o = 0, u = dn, p = null, m = null, g = null, h = !1, b = !1, w = 0, d = 0, v = 0, y = n.onState || (() => {
  });
  function P(x) {
    w <= 0 || (o = Fo(r, o, w, x, (S, z, Z) => {
      a.push({ top: u, height: Z, from: S, to: z }), u += Z + ea;
    }), H());
  }
  function L() {
    if (m === null || h || w <= 0 || o >= m) return 0;
    const x = a.length ? o / a.length : Math.max(1, w / Hr), S = a.length ? (u - dn) / a.length : Hr + ea, z = Math.round((m - o) / x * S);
    return Math.max(0, Math.min(z, wc - u));
  }
  function H() {
    e.style.height = u + L() + "px", t.style.top = Math.max(0, u - 1) + "px";
  }
  function G() {
    return window.scrollY - e.offsetTop;
  }
  function J() {
    const x = l.pop();
    if (x) return x;
    const S = document.createElement("div");
    S.className = "tile", S.tabIndex = -1;
    const z = document.createElement("div");
    z.className = "deck", z.style.height = dn + "px";
    const Z = [];
    for (let ce = 0; ce < Qa; ce++) {
      const Xe = document.createElement("div");
      Xe.className = "card", Xe.hidden = !0, Z.push(Xe);
    }
    for (let ce = Z.length - 1; ce >= 0; ce--) z.appendChild(Z[ce]);
    S.appendChild(z);
    const ge = document.createElement("div");
    ge.className = "tile-photo";
    const de = document.createElement("img");
    return de.decoding = "async", de.draggable = !1, de.addEventListener("load", () => S.classList.add("loaded")), de.addEventListener("error", () => S.classList.add("missing")), ge.appendChild(de), S.appendChild(ge), bn.set(S, { img: de, photo: ge, strip: z, cards: Z, above: 0 }), n.extend && n.extend(S), S;
  }
  function ne(x, S) {
    const { img: z, photo: Z } = bn.get(S);
    z.removeAttribute("src"), S.classList.remove("loaded", "missing", "error"), Z.style.backgroundImage = "", S.remove(), i.delete(x), l.push(S);
  }
  function B(x, S, z) {
    const Z = bn.get(x), ge = zo(S.n, z);
    Z.above = ge.length ? dn : 0, Z.strip.hidden = ge.length === 0;
    for (let de = 0; de < Z.cards.length; de++) {
      const ce = ge[de];
      Z.cards[de].hidden = ce === void 0, ce !== void 0 && (Z.cards[de].style.top = ce.top + "px", Z.cards[de].style.left = ce.inset + "px", Z.cards[de].style.right = ce.inset + "px", Z.cards[de].style.opacity = String(ce.opacity));
    }
  }
  function D(x, S, z, Z, ge, de) {
    let ce = i.get(x);
    const Xe = r[x];
    if (!ce) {
      ce = J(), ce.dataset.index = String(x);
      const Ve = bn.get(ce).img;
      B(ce, Xe, Z), Ve.fetchPriority = de ? "high" : "low", Ve.src = "/t/" + Xe.s + ".webp", c.push(x), n.fill && n.fill(ce, Xe), e.appendChild(ce), i.set(x, ce);
    }
    const { above: Lt, photo: Ye } = bn.get(ce);
    ce.style.width = Z + "px", ce.style.height = ge + Lt + "px", ce.style.transform = "translate(" + S + "px," + (z - Lt) + "px)", Ye.style.height = ge + "px";
  }
  function K(x, S) {
    S.th && (S.url === void 0 && (S.url = n.thumbHash(S.th)), S.url && (bn.get(x).photo.style.backgroundImage = "url(" + S.url + ")"));
  }
  function O() {
    v = 0;
    for (const x of c) {
      const S = i.get(x);
      S && !S.classList.contains("loaded") && K(S, r[x]);
    }
    c.length = 0;
  }
  function V(x, S) {
    for (const z of ei(x, r, w))
      D(z.index, z.x, x.top, z.w, x.height, S);
  }
  function oe() {
    const x = window.innerHeight, S = G(), z = bs(a, S - x * bc, S + x * (1 + mc));
    if (!z) return;
    const Z = a[z[0]].from, ge = a[z[1]].to;
    for (const [de, ce] of Array.from(i))
      (de < Z || de >= ge) && ne(de, ce);
    for (let de = z[0]; de <= z[1]; de++) {
      const ce = a[de];
      V(ce, ce.top < S + x && ce.top + ce.height > S);
    }
    c.length && !v && (v = requestAnimationFrame(O));
  }
  function U() {
    return w <= 0 ? !1 : u - (G() + window.innerHeight) < sa;
  }
  let le = Promise.resolve();
  function re() {
    return b || h || (b = !0, le = me()), le;
  }
  async function me() {
    const x = d;
    y({ loading: !0, count: r.length, exhausted: h, total: m, tiles: g });
    try {
      do {
        const S = await n.fetchPage(p);
        if (x !== d) return;
        for (const z of S.photos) r.push(z);
        p = S.next, h = p === null, typeof S.stacks == "number" ? (m = S.stacks, g = typeof S.total == "number" ? S.total : null) : typeof S.total == "number" && (m = S.total), P(h), oe(), y({ loading: !0, count: r.length, exhausted: h, total: m, tiles: g });
      } while (!h && U());
    } catch (S) {
      x === d && y({ error: String(S) });
    } finally {
      x === d && (b = !1, y({ loading: !1, count: r.length, exhausted: h, total: m, tiles: g }));
    }
  }
  let A = 0;
  function F() {
    A || (A = requestAnimationFrame(() => {
      A = 0, oe(), M && ve(), U() && re();
    }));
  }
  function N() {
    const x = e.clientWidth;
    if (x === w) return;
    const S = bs(a, G(), G()), z = S ? a[S[0]].from : 0;
    w = x;
    for (const [ge, de] of Array.from(i)) ne(ge, de);
    a.length = 0, o = 0, u = dn, P(h), oe();
    const Z = a.find((ge) => ge.to > z);
    Z && window.scrollTo(0, Z.top + e.offsetTop), U() && re();
  }
  let Y = !1, M = null, T = 0, j = null, ue = !1;
  function se(x, S) {
    const z = e.getBoundingClientRect();
    return { x: x - z.left, y: S - z.top };
  }
  function he(x) {
    j || (j = document.createElement("div"), j.className = "marquee", e.appendChild(j)), j.hidden = !1, j.style.width = x.right - x.left + "px", j.style.height = x.bottom - x.top + "px", j.style.transform = "translate(" + x.left + "px," + x.top + "px)";
  }
  function ve() {
    if (!M) return;
    const { x, y: S } = se(M.cx, M.cy);
    if (!M.live) {
      if (Math.abs(x - M.ax) < aa && Math.abs(S - M.ay) < aa) return;
      M.live = !0, n.sweepStart(M.index === null ? null : r[M.index], M.index);
    }
    const z = {
      left: Math.min(M.ax, x),
      right: Math.max(M.ax, x),
      top: Math.min(M.ay, S),
      bottom: Math.max(M.ay, S)
    };
    he(z), n.sweepMove(ta(a, r, w, z).map((Z) => r[Z]));
  }
  function xe(x) {
    if (ue = !1, !Y || x.button !== 0 || x.shiftKey) return;
    const { x: S, y: z } = se(x.clientX, x.clientY), Z = ta(a, r, w, { left: S, top: z, right: S, bottom: z });
    M = {
      ax: S,
      ay: z,
      cx: x.clientX,
      cy: x.clientY,
      index: Z.length ? Z[0] : null,
      live: !1
    }, window.addEventListener("pointermove", pe), window.addEventListener("pointerup", Ee), window.addEventListener("pointercancel", Ee);
  }
  function pe(x) {
    M && (M.cx = x.clientX, M.cy = x.clientY, !T && (T = requestAnimationFrame(() => {
      T = 0, ve();
    })));
  }
  function Ee(x) {
    if (!M) return;
    window.removeEventListener("pointermove", pe), window.removeEventListener("pointerup", Ee), window.removeEventListener("pointercancel", Ee), cancelAnimationFrame(T), T = 0, M.cx = x.clientX, M.cy = x.clientY, ve();
    const S = M.live;
    M = null, j && (j.hidden = !0), S && (ue = !0, n.sweepEnd());
  }
  e.addEventListener("pointerdown", xe);
  function Re(x) {
    if (ue) {
      ue = !1;
      return;
    }
    const S = x.target.closest(".tile");
    if (!S || !e.contains(S)) return;
    const z = Number(S.dataset.index), Z = r[z];
    Z && n.activate && n.activate(Z, x, S, z);
  }
  e.addEventListener("click", Re), window.addEventListener("scroll", F, { passive: !0 });
  let ke = 0;
  const Oe = new ResizeObserver(() => {
    clearTimeout(ke), ke = setTimeout(N, 100);
  });
  Oe.observe(e);
  const fe = new IntersectionObserver(
    (x) => {
      x.some((S) => S.isIntersecting) && re();
    },
    { rootMargin: "0px 0px " + sa + "px 0px" }
  );
  return fe.observe(t), w = e.clientWidth, re(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      d++, b = !1;
      for (const [x, S] of Array.from(i)) ne(x, S);
      r.length = 0, a.length = 0, c.length = 0, o = 0, u = dn, p = null, m = null, g = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), re();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(x) {
      const S = typeof x == "number" ? x : null;
      S !== m && (m = S, H(), y({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [x, S] of i) n.fill(S, r[x]);
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
        const ge = o;
        if (await re(), o === ge) break;
      }
      const S = a.find((ge) => ge.to > x);
      if (!S) return null;
      const z = Math.max(0, (window.innerHeight - S.height) / 2);
      window.scrollTo(0, Math.max(0, e.offsetTop + S.top - z)), oe();
      const Z = i.get(x);
      return Z ? { item: r[x], tile: Z } : null;
    },
    // Put the keyboard back on a tile. The overlay hands focus back on the way
    // out, and after a walk that is a different tile from the one it opened on.
    focus(x) {
      i.get(x)?.focus();
    },
    // Whether a press on the canvas rubber-bands. Select mode turns on and off
    // under a sheet that outlives the toggle, exactly as the tickboxes do.
    setSweeping(x) {
      Y = x;
    },
    // The items between two indices, inclusive, in the order the sheet holds
    // them — which is the order the grid is sorted in. Shift-click's range: the
    // gesture knows two tiles and this is what lies between them.
    itemsBetween(x, S) {
      return r.slice(Math.min(x, S), Math.max(x, S) + 1);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(x) {
      for (const [S, z] of i)
        r[S] === x && n.fill && n.fill(z, x);
    },
    destroy() {
      d++, e.removeEventListener("click", Re), e.removeEventListener("pointerdown", xe), window.removeEventListener("pointermove", pe), window.removeEventListener("pointerup", Ee), window.removeEventListener("pointercancel", Ee), window.removeEventListener("scroll", F), Oe.disconnect(), fe.disconnect(), clearTimeout(ke), cancelAnimationFrame(v), cancelAnimationFrame(T), j?.remove();
    }
  };
}
function xc(e) {
  try {
    const t = Uint8Array.from(atob(e), (O) => O.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, a = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, c = (n >> 18 & 31) / 31, o = n >> 23, u = (r >> 3 & 63) / 63, p = (r >> 9 & 63) / 63, m = r >> 15, g = Math.max(3, m ? o ? 5 : 7 : r & 7), h = Math.max(3, m ? r & 7 : o ? 5 : 7);
    let b = o ? 6 : 5, w = 0;
    const d = (O, V, oe) => {
      const U = [];
      for (let le = 0; le < V; le++)
        for (let re = le ? 0 : 1; re * V < O * (V - le); re++) {
          const me = t[b + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          U.push((me / 7.5 - 1) * oe);
        }
      return U;
    }, v = d(g, h, c), y = d(3, 3, u * 1.25), P = d(3, 3, p * 1.25), L = g / h, H = Math.max(1, Math.round(L > 1 ? 32 : 32 * L)), G = Math.max(1, Math.round(L > 1 ? 32 / L : 32)), J = document.createElement("canvas");
    J.width = H, J.height = G;
    const ne = J.getContext("2d"), B = ne.createImageData(H, G), D = [], K = [];
    for (let O = 0, V = 0; O < G; O++)
      for (let oe = 0; oe < H; oe++, V += 4) {
        let U = a, le = i, re = l;
        for (let N = 0; N < g; N++) D[N] = Math.cos(Math.PI / H * (oe + 0.5) * N);
        for (let N = 0; N < h; N++) K[N] = Math.cos(Math.PI / G * (O + 0.5) * N);
        for (let N = 0, Y = 0; N < h; N++)
          for (let M = N ? 0 : 1; M * h < g * (h - N); M++, Y++)
            U += v[Y] * D[M] * K[N] * 2;
        for (let N = 0, Y = 0; N < 3; N++)
          for (let M = N ? 0 : 1; M < 3 - N; M++, Y++) {
            const T = D[M] * K[N] * 2;
            le += y[Y] * T, re += P[Y] * T;
          }
        const me = U - 2 / 3 * le, A = (3 * U - me + re) / 2, F = A - re;
        B.data[V] = Math.max(0, Math.min(255, Math.round(255 * A))), B.data[V + 1] = Math.max(0, Math.min(255, Math.round(255 * F))), B.data[V + 2] = Math.max(0, Math.min(255, Math.round(255 * me))), B.data[V + 3] = 255;
      }
    return ne.putImageData(B, 0, 0), J.toDataURL();
  } catch {
    return null;
  }
}
var kc = /* @__PURE__ */ I('<main id="canvas"><div id="sentinel"></div></main>');
function Sc(e, t) {
  ft(t, !0);
  let n = $(t, "key", 3, ""), r = $(t, "total", 3, null), a = $(t, "triage", 3, !1), i = $(t, "excludedDirs", 19, () => []), l = $(t, "selecting", 3, !1), c = $(t, "selectedKeys", 19, () => []), o = $(t, "onActivate", 3, () => {
  }), u = $(t, "onOverride", 3, async () => null), p = $(t, "onExcludeFolder", 3, () => {
  }), m = $(t, "onState", 3, () => {
  }), g = $(t, "onSweepStart", 3, () => {
  }), h = $(t, "onSweepMove", 3, () => {
  }), b = $(t, "onSweepEnd", 3, () => {
  }), w = /* @__PURE__ */ X(null), d = /* @__PURE__ */ X(null), v = null, y = "";
  const P = /* @__PURE__ */ ie(() => new Set(c())), L = { null: "exclude", exclude: "include", include: "clear" };
  function H(A) {
    const F = A.toLowerCase().startsWith(Vn.toLowerCase()) ? A.slice(Vn.length + 1) : A;
    return F.length > 64 ? "…" + F.slice(-64) : F;
  }
  function G(A) {
    const F = document.createElement("div");
    F.className = "tile-path", A.appendChild(F);
    const N = document.createElement("button");
    N.className = "chip", N.type = "button", A.appendChild(N);
    const Y = document.createElement("button");
    Y.className = "dirchip", Y.type = "button", Y.textContent = "dir", A.appendChild(Y);
  }
  function J(A, F) {
    const N = A.querySelector(".tile-path");
    N && (N.textContent = F.p ? H(F.p) : "");
    const Y = A.querySelector(".dirchip");
    if (Y) {
      const T = Ka(F.p ?? ""), j = T !== "" && Os(i(), T);
      Y.hidden = T === "", Y.disabled = j, Y.dataset.state = j ? "exclude" : "none", Y.title = j ? `already excluded: ${T}` : `exclude everything under ${T}, subfolders included — one exclude rule at the end of the order`;
    }
    const M = A.querySelector(".chip");
    M && (M.dataset.state = F.o || "none", M.textContent = F.o === "exclude" ? "drop" : F.o === "include" ? "keep" : "·", M.title = F.o === "exclude" ? "overridden: excluded — click to keep" : F.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  function ne(A) {
    const F = document.createElement("span");
    F.className = "tick", A.appendChild(F);
  }
  function B(A, F) {
    A.dataset.selected = s(P).has(F.id) ? "on" : "off";
  }
  Qn(() => (v = yc(s(w), s(d), {
    fetchPage: (A) => t.fetchPage(A),
    thumbHash: xc,
    extend: a() ? G : ne,
    fill: a() ? J : B,
    onState: (A) => m()(A),
    sweepStart: (A, F) => g()(A, F),
    sweepMove: (A) => h()(A),
    sweepEnd: () => b()(),
    activate: async (A, F, N, Y) => {
      if (F.target.closest(".dirchip")) {
        p()(A);
        return;
      }
      if (!F.target.closest(".chip")) {
        o()(A, N, Y, F.shiftKey);
        return;
      }
      const M = L[A.o ?? "null"];
      A.o = await u()(A, M), J(N, A);
    }
  }), y = n(), v.setSweeping(l()), () => v?.destroy())), Bt(() => {
    v?.setSweeping(l());
  }), Bt(() => {
    const A = n(), F = r();
    v && (A !== y && (y = A, v.reset()), v.setTotal(F));
  });
  function D(A) {
    return v?.walkTo(A);
  }
  function K(A) {
    v?.focus(A);
  }
  function O(A, F) {
    return v?.itemsBetween(A, F) ?? [];
  }
  let V = "";
  Bt(() => {
    const A = i().join(`
`);
    !v || A === V || (V = A, v.refill());
  });
  let oe = null;
  Bt(() => {
    const A = c();
    !v || A === oe || (oe = A, v.refill());
  });
  var U = { walkTo: D, focusTile: K, itemsBetween: O }, le = kc();
  let re;
  var me = f(le);
  return pr(me, (A) => k(d, A), () => s(d)), pr(le, (A) => k(w, A), () => s(w)), W(() => re = Ce(le, 1, "", null, re, { selecting: l() })), C(e, le), ht(U);
}
const ti = "photos.stack", la = { on: !1 };
function Ec() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(ti) ?? "");
  } catch {
    return { ...la };
  }
  return e === null || typeof e != "object" ? { ...la } : { on: e.on === !0 };
}
function Tc(e) {
  return localStorage.setItem(ti, JSON.stringify({ on: e.on })), e;
}
var Mc = /* @__PURE__ */ I('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Ac = /* @__PURE__ */ I('<th class="num svelte-1v3p82v"> </th>'), Rc = /* @__PURE__ */ I('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Pc = /* @__PURE__ */ I('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Cc = /* @__PURE__ */ I('<td class="num svelte-1v3p82v"> </td>'), Oc = /* @__PURE__ */ I('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), Nc = /* @__PURE__ */ I('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Ic(e, t) {
  ft(t, !0);
  let n = $(t, "rows", 19, () => []), r = $(t, "rules", 19, () => []), a = $(t, "root", 3, null), i = $(t, "picked", 3, null), l = $(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const c = /* @__PURE__ */ ie(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const u = /* @__PURE__ */ ie(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : Xa(r(), t.screen.toRule(w, a()))
  ]))), p = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var g = Rs(), h = lt(g);
  {
    var b = (w) => {
      var d = Nc(), v = f(d), y = f(v), P = f(y);
      {
        var L = (D) => {
          var K = Mc();
          C(D, K);
        };
        ee(P, (D) => {
          s(c) && D(L);
        });
      }
      var H = _(P), G = f(H), J = _(H, 3);
      {
        var ne = (D) => {
          var K = Ac(), O = f(K);
          W(() => R(O, t.screen.heading[1])), C(D, K);
        };
        ee(J, (D) => {
          t.screen.heading[1] && D(ne);
        });
      }
      var B = _(v);
      Je(B, 23, n, (D) => D.key, (D, K, O) => {
        const V = /* @__PURE__ */ ie(() => s(u).get(s(K).key));
        var oe = Oc();
        let U;
        var le = f(oe);
        {
          var re = (pe) => {
            const Ee = /* @__PURE__ */ ie(() => l().has(s(K).key));
            var Re = Rc(), ke = f(Re);
            let Oe;
            var fe = f(ke);
            W(
              (x) => {
                Oe = Ce(ke, 1, "tick svelte-1v3p82v", null, Oe, { on: s(Ee) }), we(ke, "aria-checked", s(Ee)), we(ke, "aria-label", `select ${x ?? ""}`), R(fe, s(Ee) ? "✓" : "");
              },
              [() => o(s(K))]
            ), te("click", ke, (x) => {
              x.stopPropagation(), t.oncheck(s(K), s(O), x.shiftKey);
            }), C(pe, Re);
          };
          ee(le, (pe) => {
            s(c) && pe(re);
          });
        }
        var me = _(le), A = f(me);
        let F;
        var N = f(A), Y = _(A), M = _(Y);
        {
          var T = (pe) => {
            var Ee = Pc();
            C(pe, Ee);
          };
          ee(M, (pe) => {
            s(K).scope === "whole inventory" && pe(T);
          });
        }
        var j = _(me), ue = f(j), se = _(j), he = f(se), ve = _(se);
        {
          var xe = (pe) => {
            var Ee = Cc(), Re = f(Ee);
            W(() => R(Re, s(K).detail ?? "")), C(pe, Ee);
          };
          ee(ve, (pe) => {
            t.screen.heading[1] && pe(xe);
          });
        }
        W(
          (pe, Ee, Re) => {
            U = Ce(oe, 1, "svelte-1v3p82v", null, U, {
              picked: i() === s(K).key,
              clickable: t.screen.sheet !== !1
            }), F = Ce(A, 1, "mark svelte-1v3p82v", null, F, {
              exclude: s(V) === "exclude",
              include: s(V) === "include"
            }), we(A, "title", m[s(V)] ?? ""), R(N, p[s(V)] ?? ""), R(Y, `${pe ?? ""} `), R(ue, Ee), R(he, Re);
          },
          [
            () => o(s(K)),
            () => Le(s(K).paths),
            () => At(s(K).bytes)
          ]
        ), te("click", oe, () => t.onpick(s(K))), C(D, oe);
      }), W(() => R(G, t.screen.heading[0] ?? "")), C(w, d);
    };
    ee(h, (w) => {
      n().length && w(b);
    });
  }
  C(e, g), ht();
}
It(["click"]);
var Lc = /* @__PURE__ */ I('<button class="twisty svelte-pucy57"> </button>'), Fc = /* @__PURE__ */ I('<span class="twisty leaf svelte-pucy57">·</span>'), zc = /* @__PURE__ */ I('<span class="name root svelte-pucy57"> </span>'), Dc = /* @__PURE__ */ I('<button class="name svelte-pucy57"> </button>'), jc = /* @__PURE__ */ I('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Hc = /* @__PURE__ */ I('<div class="note svelte-pucy57"> </div>'), qc = /* @__PURE__ */ I('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Bc = /* @__PURE__ */ I('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Uc = /* @__PURE__ */ I('<div class="tree svelte-pucy57"></div>');
function Wc(e, t) {
  ft(t, !0);
  let n = $(t, "version", 3, 0), r = $(t, "excludedDirs", 19, () => []), a = $(t, "picked", 3, null), i = $(t, "busy", 3, !1), l = /* @__PURE__ */ X(Fe(/* @__PURE__ */ new Map())), c = /* @__PURE__ */ X(Fe(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ X(Fe(/* @__PURE__ */ new Set())), u = /* @__PURE__ */ X(Fe(/* @__PURE__ */ new Set()));
  async function p(d) {
    k(o, new Set(s(o)).add(d), !0);
    const v = await t.onload(d), y = new Map(s(l)), P = new Set(s(u));
    v ? (y.set(d, v), P.delete(d)) : P.add(d), k(l, y, !0), k(u, P, !0), k(o, new Set([...s(o)].filter((L) => L !== d)), !0);
  }
  function m(d) {
    if (s(c).has(d)) {
      k(c, new Set([...s(c)].filter((v) => v !== d)), !0);
      return;
    }
    k(c, new Set(s(c)).add(d), !0), s(l).has(d) || p(d);
  }
  let g = -1;
  Bt(() => {
    const d = n();
    if (d !== g) {
      g = d, s(c).has(t.root) || k(c, new Set(s(c)).add(t.root), !0);
      for (const v of s(c)) p(v);
    }
  });
  const h = /* @__PURE__ */ ie(() => {
    const d = [], v = (H, G, J, ne, B, D) => {
      const K = s(l).get(H), O = s(c).has(H);
      if (d.push({
        key: H,
        name: G,
        depth: J,
        paths: ne,
        bytes: B,
        deeper: D,
        expanded: O,
        here: K?.here ?? null,
        truncated: !!K?.truncated,
        loading: s(o).has(H),
        failed: s(u).has(H),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: Os(r(), H)
      }), !(!O || !K))
        for (const V of K.children)
          v(V.path, V.name, J + 1, V.paths, V.bytes, V.deeper);
    }, y = s(l).get(t.root), P = y ? y.children.reduce((H, G) => H + G.paths, 0) + y.here.paths : 0, L = y ? y.children.reduce((H, G) => H + G.bytes, 0) + y.here.bytes : 0;
    return v(t.root, t.root, 0, P, L, !0), d;
  }), b = 8;
  var w = Uc();
  Je(w, 21, () => s(h), (d) => d.key, (d, v) => {
    var y = Bc(), P = lt(y);
    let L;
    var H = f(P);
    let G;
    var J = _(H, 2);
    {
      var ne = (M) => {
        var T = Lc(), j = f(T);
        W(() => {
          we(T, "aria-expanded", s(v).expanded), we(T, "aria-label", `${s(v).expanded ? "collapse" : "expand"} ${s(v).name ?? ""}`), we(T, "title", s(v).expanded ? "collapse" : "expand"), R(j, s(v).loading ? "·" : s(v).expanded ? "▾" : "▸");
        }), te("click", T, () => m(s(v).key)), C(M, T);
      }, B = (M) => {
        var T = Fc();
        C(M, T);
      };
      ee(J, (M) => {
        s(v).deeper ? M(ne) : M(B, -1);
      });
    }
    var D = _(J, 2);
    {
      var K = (M) => {
        var T = zc(), j = f(T);
        W(() => R(j, s(v).key)), C(M, T);
      }, O = (M) => {
        var T = Dc(), j = f(T);
        W(() => {
          we(T, "title", `Show every kept file under ${s(v).key ?? ""}`), R(j, s(v).name);
        }), te("click", T, () => t.onpick(s(v))), C(M, T);
      };
      ee(D, (M) => {
        s(v).depth === 0 ? M(K) : M(O, -1);
      });
    }
    var V = _(D, 2), oe = f(V), U = _(V, 2), le = f(U), re = _(U, 2), me = _(P, 2);
    {
      var A = (M) => {
        var T = jc();
        let j;
        W((ue) => j = $t(T, "", j, ue), [
          () => ({
            "padding-left": `${Math.min(s(v).depth, b) * 11 + 18}px`
          })
        ]), C(M, T);
      }, F = (M) => {
        var T = Hc();
        let j;
        var ue = f(T);
        W(
          (se, he, ve) => {
            j = $t(T, "", j, se), R(ue, `${he ?? ""} directly here · ${ve ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(s(v).depth, b) * 11 + 18}px`
            }),
            () => Le(s(v).here.paths),
            () => At(s(v).here.bytes)
          ]
        ), C(M, T);
      };
      ee(me, (M) => {
        s(v).expanded && s(v).failed ? M(A) : s(v).expanded && s(v).here && s(v).here.paths > 0 && M(F, 1);
      });
    }
    var N = _(me, 2);
    {
      var Y = (M) => {
        var T = qc();
        let j;
        W((ue) => j = $t(T, "", j, ue), [
          () => ({
            "padding-left": `${Math.min(s(v).depth, b) * 11 + 18}px`
          })
        ]), C(M, T);
      };
      ee(N, (M) => {
        s(v).truncated && M(Y);
      });
    }
    W(
      (M, T, j) => {
        L = Ce(P, 1, "row svelte-pucy57", null, L, {
          picked: a() === s(v).key,
          gone: s(v).excluded
        }), G = $t(H, "", G, M), R(oe, T), R(le, j), re.disabled = i() || s(v).excluded || s(v).depth === 0, we(re, "title", s(v).depth === 0 ? "The library root is not excludable from here." : s(v).excluded ? "already excluded" : `Exclude everything under ${s(v).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(s(v).depth, b) * 11}px` }),
        () => Le(s(v).paths),
        () => At(s(v).bytes)
      ]
    ), te("click", re, () => t.onexclude(s(v))), C(d, y);
  }), C(e, w), ht();
}
It(["click"]);
var Yc = /* @__PURE__ */ I('<button title="Back to its default">↺</button>'), Gc = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), Kc = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), Xc = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), Vc = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), $c = /* @__PURE__ */ I('<li><code class="svelte-1hh0fwb"> </code> </li>'), Jc = /* @__PURE__ */ I(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), Zc = /* @__PURE__ */ I('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function Qc(e, t) {
  ft(t, !0);
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
        ["headerSide", "Sides", 0, (O) => Math.floor(O / 2), 1],
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
  let c = /* @__PURE__ */ X(Fe(ro())), o = /* @__PURE__ */ X(!0), u = /* @__PURE__ */ X(!1), p = /* @__PURE__ */ X(Fe(Ja())), m = /* @__PURE__ */ X(Fe(window.innerWidth));
  const g = (O) => s(p) === "light" ? O.light : O.dark, h = (O) => O in mn ? mn : hn, b = (O) => `rgba(${O.r}, ${O.g}, ${O.b}, ${O.a})`, w = /* @__PURE__ */ ie(() => JSON.stringify(s(c), null, 2));
  Qn(() => {
    const O = localStorage.getItem(n);
    if (O)
      try {
        k(c, ts(JSON.parse(O)), !0);
        return;
      } catch {
      }
    Ns();
  });
  function d(O) {
    k(c, ts({ ...s(c), ...O }), !0), localStorage.setItem(n, JSON.stringify(s(c))), k(u, !1);
  }
  function v(O) {
    k(c, ts(O), !0), localStorage.setItem(n, JSON.stringify(s(c))), k(u, !1);
  }
  function y(O) {
    d({ [O]: h(O)[O] });
  }
  function P() {
    k(p, Za(s(p) === "dark" ? "light" : "dark"), !0);
  }
  async function L() {
    await navigator.clipboard.writeText(s(w)), k(u, !0);
  }
  var H = Zc();
  let G;
  var J = f(H), ne = _(f(J), 4), B = f(ne), D = _(J, 2);
  {
    var K = (O) => {
      var V = Jc();
      {
        const ke = (fe, x = Rr, S = Rr, z = Rr) => {
          var Z = Yc();
          let ge;
          W(() => {
            ge = Ce(Z, 1, "undo svelte-1hh0fwb", null, ge, { idle: !S() }), we(Z, "aria-label", `Reset ${x() ?? ""}`);
          }), te("click", Z, function(...de) {
            z()?.apply(this, de);
          }), C(fe, Z);
        };
        var oe = _(f(V), 2);
        Je(oe, 17, () => r, bt, (fe, x) => {
          var S = Kc(), z = f(S), Z = f(z), ge = _(z, 2), de = f(ge), ce = _(ge, 2);
          Je(ce, 17, () => s(x).rows, bt, (Xe, Lt) => {
            var Ye = /* @__PURE__ */ ie(() => $r(s(Lt), 5));
            let Ve = () => s(Ye)[0], xt = () => s(Ye)[1], kt = () => s(Ye)[2], Ft = () => s(Ye)[3], zt = () => s(Ye)[4];
            const Dt = /* @__PURE__ */ ie(() => s(c)[Ve()] !== h(Ve())[Ve()]), jt = /* @__PURE__ */ ie(() => typeof Ft() == "function" ? Ft()(s(m)) : Ft());
            var St = Gc();
            let q;
            var ae = f(St), Se = f(ae), Ae = _(ae, 2), _e = _(Ae, 2), Me = _(_e, 2);
            ke(Me, xt, () => s(Dt), () => () => y(Ve())), W(() => {
              q = Ce(St, 1, "row svelte-1hh0fwb", null, q, { moved: s(Dt) }), R(Se, xt()), we(Ae, "min", kt()), we(Ae, "max", s(jt)), we(Ae, "step", zt()), we(Ae, "aria-label", xt()), jn(Ae, s(c)[Ve()]), we(_e, "min", kt()), we(_e, "max", s(jt)), we(_e, "step", zt()), we(_e, "aria-label", `${xt() ?? ""} value`), jn(_e, s(c)[Ve()]);
            }), te("input", Ae, (Ne) => d({ [Ve()]: Number(Ne.currentTarget.value) })), te("input", _e, (Ne) => d({ [Ve()]: Number(Ne.currentTarget.value) })), C(Xe, St);
          }), W(() => {
            R(Z, s(x).title), R(de, s(x).note);
          }), C(fe, S);
        });
        var U = _(oe, 2), le = f(U), re = _(U, 2), me = f(re), A = _(re, 2);
        Je(A, 17, () => no, bt, (fe, x) => {
          const S = /* @__PURE__ */ ie(() => g(s(x))), z = /* @__PURE__ */ ie(() => s(c)[s(S)]), Z = /* @__PURE__ */ ie(() => s(x).base[s(S)]);
          var ge = Vc(), de = f(ge), ce = f(de), Xe = _(ce), Lt = f(Xe), Ye = _(de, 2), Ve = f(Ye), xt = _(Ye, 2);
          Je(xt, 17, () => i, bt, (Dt, jt) => {
            var St = /* @__PURE__ */ ie(() => $r(s(jt), 3));
            let q = () => s(St)[0], ae = () => s(St)[1], Se = () => s(St)[2];
            const Ae = /* @__PURE__ */ ie(() => s(z)[q()] !== s(Z)[q()]);
            var _e = Xc();
            let Me;
            var Ne = f(_e), nt = f(Ne), rt = _(Ne, 2), je = _(rt, 2), Yt = _(je, 2);
            ke(Yt, ae, () => s(Ae), () => () => d({
              [s(S)]: { ...s(z), [q()]: s(Z)[q()] }
            })), W(() => {
              Me = Ce(_e, 1, "row svelte-1hh0fwb", null, Me, { moved: s(Ae) }), R(nt, ae()), we(rt, "max", Se()), we(rt, "step", Se() === 1 ? 0.01 : 1), we(rt, "aria-label", `${s(p) ?? ""} ${a[s(x).dark].title ?? ""} ${ae() ?? ""}`), jn(rt, s(z)[q()]), we(je, "max", Se()), we(je, "step", Se() === 1 ? 0.01 : 1), we(je, "aria-label", `${s(p) ?? ""} ${a[s(x).dark].title ?? ""} ${ae() ?? ""} value`), jn(je, s(z)[q()]);
            }), te("input", rt, (vt) => d({
              [s(S)]: {
                ...s(z),
                [q()]: Number(vt.currentTarget.value)
              }
            })), te("input", je, (vt) => d({
              [s(S)]: {
                ...s(z),
                [q()]: Number(vt.currentTarget.value)
              }
            })), C(Dt, _e);
          });
          var kt = _(xt, 2);
          let Ft;
          var zt = f(kt);
          W(
            (Dt, jt) => {
              R(ce, `${a[s(x).dark].title ?? ""} `), R(Lt, s(p)), R(Ve, a[s(x).dark].note), Ft = $t(kt, "", Ft, Dt), R(zt, jt);
            },
            [
              () => ({ background: b(s(z)) }),
              () => b(s(z))
            ]
          ), C(fe, ge);
        });
        var F = _(A, 2), N = _(f(F), 4);
        let Oe;
        var Y = f(N), M = f(Y), T = _(Y, 2);
        ke(T, () => "Blur at the edge", () => s(c).blurEdge !== mn.blurEdge, () => () => y("blurEdge"));
        var j = _(F, 2), ue = _(f(j), 4);
        Je(ue, 21, () => l, bt, (fe, x) => {
          var S = /* @__PURE__ */ ie(() => $r(s(x), 2));
          let z = () => s(S)[0], Z = () => s(S)[1];
          var ge = $c(), de = f(ge), ce = f(de), Xe = _(de);
          W(() => {
            R(ce, z()), R(Xe, ` — ${Z() ?? ""}`);
          }), C(fe, ge);
        });
        var se = _(j, 2), he = _(f(se), 4), ve = f(he), xe = _(ve, 2), pe = _(xe, 2), Ee = f(pe), Re = _(he, 2);
        W(() => {
          R(le, `The five colours below are per theme, and you are editing the ${s(p) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), R(me, `Edit the ${s(p) === "dark" ? "light" : "dark"} colours`), Oe = Ce(N, 1, "row toggle svelte-1hh0fwb", null, Oe, { moved: s(c).blurEdge !== mn.blurEdge }), Dl(M, s(c).blurEdge), R(Ee, s(u) ? "Copied" : "Copy"), jn(Re, s(w));
        }), te("click", re, P), te("change", M, (fe) => d({ blurEdge: fe.currentTarget.checked })), te("click", ve, () => v(hn)), te("click", xe, () => v(mn)), te("click", pe, L);
      }
      C(O, V);
    };
    ee(D, (O) => {
      s(o) && O(K);
    });
  }
  W(() => {
    G = Ce(H, 1, "tuner svelte-1hh0fwb", null, G, { folded: !s(o) }), we(ne, "title", s(o) ? "Fold away" : "Open"), R(B, s(o) ? "–" : "+");
  }), ql("innerWidth", (O) => k(m, O, !0)), te("click", ne, () => k(o, !s(o))), C(e, H), ht();
}
It(["click", "input", "change"]);
function as(e, t, n, r) {
  const a = e + t;
  return a < 0 || a >= n && r ? null : a;
}
var eu = /* @__PURE__ */ I('<button><span class="n svelte-1n46o8q"> </span> </button>'), tu = /* @__PURE__ */ I('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), nu = /* @__PURE__ */ I('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), ru = /* @__PURE__ */ I('<div class="muted pad svelte-1n46o8q">loading…</div>'), su = /* @__PURE__ */ I('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), au = /* @__PURE__ */ I('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), iu = /* @__PURE__ */ I('<p class="blurb"> </p>'), lu = /* @__PURE__ */ I('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear</button> <span class="muted svelte-1n46o8q"><!></span></div>'), ou = /* @__PURE__ */ I('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), cu = /* @__PURE__ */ I('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), uu = /* @__PURE__ */ I('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), du = /* @__PURE__ */ I("<div> </div>"), fu = /* @__PURE__ */ I('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function hu(e, t) {
  ft(t, !0);
  const n = location.pathname === "/tune";
  let r = /* @__PURE__ */ X("grid"), a = /* @__PURE__ */ X(0), i = /* @__PURE__ */ X(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ X(Fe([])), c = /* @__PURE__ */ X(null), o = /* @__PURE__ */ X(null), u = /* @__PURE__ */ X(Fe(/* @__PURE__ */ new Set())), p = /* @__PURE__ */ X(null), m = /* @__PURE__ */ X(null), g = /* @__PURE__ */ X(null), h = /* @__PURE__ */ X(null), b = /* @__PURE__ */ X(!1), w = /* @__PURE__ */ X(!1), d = /* @__PURE__ */ X(!1), v = /* @__PURE__ */ X(!1), y = /* @__PURE__ */ X(Fe({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), P = /* @__PURE__ */ X(null), L = /* @__PURE__ */ X(0), H = /* @__PURE__ */ X(null), G = /* @__PURE__ */ X(Fe({})), J = /* @__PURE__ */ X("newest"), ne = /* @__PURE__ */ X(Fe(Ec())), B = /* @__PURE__ */ X(null), D = /* @__PURE__ */ X(null), K = /* @__PURE__ */ X(!1), O = /* @__PURE__ */ X(Fe([])), V = /* @__PURE__ */ X(null), oe = null;
  const U = /* @__PURE__ */ ie(() => Vs[s(a)]), le = /* @__PURE__ */ ie(() => s(U).table !== !1), re = /* @__PURE__ */ ie(() => s(le) || s(U).tree === !0), me = /* @__PURE__ */ ie(() => s(U).sheet !== !1 && (s(o) !== null || !s(re))), A = /* @__PURE__ */ ie(() => ({
    sort: s(J),
    ...s(ne).on ? { stack: "on" } : {},
    ...Object.fromEntries(Object.entries(s(G)).filter(([, E]) => E.length > 0))
  })), F = /* @__PURE__ */ ie(() => s(O).map((E) => E.key)), N = /* @__PURE__ */ ie(() => pc(s(O)));
  Bt(() => {
    s(A), Zt(() => {
      k(O, [], !0), k(
        V,
        null
        // it indexes an order this query no longer has
      );
    });
  });
  const Y = /* @__PURE__ */ ie(() => s(r) === "grid" ? `grid:${JSON.stringify(s(A))}` : `triage:${s(a)}:${JSON.stringify(s(o))}`), M = /* @__PURE__ */ ie(() => s(U).rule === !1 || s(u).size === 0 ? [] : s(l).filter((E) => s(u).has(E.key)).map((E) => s(U).toRule(E, s(i))).filter((E) => E && Xa(s(m)?.rules ?? [], E) !== "exclude")), T = /* @__PURE__ */ ie(() => (s(m)?.rules ?? []).filter((E) => E.decision === "exclude" && E.term?.column === "dir_under").map((E) => String(E.term.value).replace(/[\\/]+$/, "").toLowerCase())), j = Wl();
  function ue(E) {
    k(P, String(E), !0);
  }
  async function se(E) {
    try {
      return k(P, null), await E();
    } catch (Q) {
      return ue(Q), null;
    }
  }
  const he = Yl(
    () => {
      k(w, !0), se(async () => {
        const E = s(o)?.at === "end" || s(o)?.at === void 0 ? void 0 : 0, { stale: Q, value: Pe } = await j(() => He.counts(s(o), E));
        Q || k(m, Pe, !0);
      }).finally(() => {
        k(w, !1);
      });
    },
    220
  );
  async function ve() {
    k(g, "loading");
    const E = await se(() => He.files());
    k(g, E, !0), k(b, !1), k(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function xe(E = !1) {
    if (s(r) !== "triage" || !s(le)) {
      k(l, [], !0);
      return;
    }
    k(v, !0);
    const Q = s(U).name === "source_folder" && s(i) ? { root: s(i) } : {};
    E && (Q.live = "1");
    const Pe = await se(() => He.screen(s(U).name, Q));
    k(l, Pe?.rows ?? [], !0), k(v, !1);
  }
  let pe = !1;
  Bt(() => {
    s(a), s(r), Zt(() => {
      k(c, null), k(o, null), k(i, null), Oe(), s(r) === "triage" && (xe(), he.now(), pe || (pe = !0, ve()));
    });
  }), Bt(() => {
    s(i), Zt(() => {
      s(r) === "triage" && (Oe(), xe());
    });
  }), Qn(() => {
    se(async () => {
      k(H, await He.facets(), !0);
    });
  });
  function Ee(E, Q) {
    k(G, { ...s(G), [E]: Q }, !0);
  }
  function Re(E) {
    if (s(U).sheet !== !1) {
      if (s(U).drill && !s(i)) {
        k(c, E.key, !0), k(
          o,
          {
            ...s(U).toRule(E, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), k(i, E.key, !0);
        return;
      }
      k(c, E.key, !0), k(
        o,
        {
          ...s(U).toRule(E, s(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), he();
    }
  }
  function ke(E, Q, Pe) {
    const Ge = new Set(s(u)), $e = !Ge.has(E.key), Gt = Pe && s(p) !== null ? s(l).findIndex((Tt) => Tt.key === s(p)) : -1, [Cn, On] = Gt < 0 ? [Q, Q] : Gt < Q ? [Gt, Q] : [Q, Gt];
    for (let Tt = Cn; Tt <= On; Tt++)
      $e ? Ge.add(s(l)[Tt].key) : Ge.delete(s(l)[Tt].key);
    k(u, Ge, !0), k(p, E.key, !0);
  }
  function Oe() {
    k(u, /* @__PURE__ */ new Set(), !0), k(p, null);
  }
  function fe(E) {
    k(o, E, !0), k(
      c,
      null
      // it no longer corresponds to a row
    ), he();
  }
  function x(E = !1) {
    k(o, null), k(c, null), E && k(i, null), he.now();
  }
  async function S() {
    k(
      b,
      !0
      // the distinct-content number now says so on its face
    ), il(L), await xe(), he.now();
  }
  async function z() {
    if (!s(o)) return;
    k(d, !0);
    const E = s(o).at === "end" ? void 0 : 0, Q = await se(() => He.addRule(
      {
        column: s(o).column,
        op: s(o).op,
        value: s(o).value,
        decision: s(o).decision ?? "exclude",
        note: `screen ${s(U).id} ${s(U).title}`
      },
      E
    ));
    k(d, !1), Q && (k(o, null), k(c, null), await S());
  }
  async function Z() {
    const E = s(M);
    if (!E.length) {
      Oe();
      return;
    }
    k(d, !0);
    for (const Q of E)
      if (!await se(() => He.addRule({
        column: Q.column,
        op: Q.op,
        value: Q.value,
        decision: "exclude",
        note: `screen ${s(U).id} ${s(U).title}`
      }))) break;
    k(d, !1), Oe(), k(o, null), k(c, null), await S();
  }
  async function ge(E) {
    if (!E || Os(s(T), E)) return;
    k(d, !0);
    const Q = await se(() => He.addRule({
      column: "dir_under",
      op: "=",
      value: E,
      decision: "exclude",
      note: `screen ${s(U).id} ${s(U).title}`
    }));
    k(d, !1), Q && await S();
  }
  const de = (E) => ge(Ka(E.p ?? "")), ce = (E) => ge(E.key);
  async function Xe(E) {
    k(d, !0), await se(() => He.deleteRule(E.id)), k(d, !1), await S();
  }
  async function Lt(E, Q) {
    k(d, !0), await se(() => He.moveRule(E.id, Q)), k(d, !1), await S();
  }
  async function Ye() {
    await se(async () => {
      k(H, await He.facets(), !0);
    });
  }
  async function Ve(E, Q) {
    const Pe = await se(() => He.override(E.s, Q));
    return Pe ? (k(b, !0), he(), Pe.decision) : E.o ?? null;
  }
  function xt(E) {
    return s(r) === "grid" ? He.photos({ limit: 500, ...s(A), ...E || {} }) : He.page(s(o), E);
  }
  const kt = (E) => E.m ?? [{ id: E.id, s: E.s, w: E.w, h: E.h }];
  function Ft(E, Q, Pe, Ge = !1) {
    if (s(r) === "grid") {
      if (s(K)) {
        if (Ge && s(V) !== null) {
          const $e = s(D)?.itemsBetween(s(V), Pe) ?? [];
          k(O, ra(s(O), $e.map(ss), !zt(E)), !0);
        } else
          k(O, vc(s(O), ss(E)), !0);
        k(V, Pe, !0);
        return;
      }
      k(B, { frames: kt(E), origin: ia(Q), at: Pe }, !0);
      return;
    }
    se(() => He.revealOrigin(E.id));
  }
  const zt = (E) => s(O).some((Q) => Q.key === E.id);
  function Dt(E, Q) {
    oe = {
      from: s(O),
      adding: E === null || !zt(E)
    }, Q !== null && k(V, Q, !0);
  }
  function jt(E) {
    k(O, ra(oe.from, E.map(ss), oe.adding), !0);
  }
  function St() {
    oe = null;
  }
  function q() {
    k(O, [], !0), k(V, null);
  }
  const ae = /* @__PURE__ */ ie(() => s(B) !== null && as(s(B).at, -1, s(y).count, s(y).exhausted) !== null), Se = /* @__PURE__ */ ie(() => s(B) !== null && as(s(B).at, 1, s(y).count, s(y).exhausted) !== null), Ae = 120;
  let _e = !1, Me = 0;
  async function Ne(E, Q = !1) {
    const Pe = performance.now();
    if (!s(B) || _e || Q && Pe - Me < Ae) return;
    const Ge = as(s(B).at, E, s(y).count, s(y).exhausted);
    if (Ge !== null) {
      Me = Pe, _e = !0;
      try {
        const $e = await s(D)?.walkTo(Ge);
        if (!$e || !s(B)) return;
        k(
          B,
          {
            frames: kt($e.item),
            origin: ia($e.tile),
            at: Ge
          },
          !0
        );
      } finally {
        _e = !1;
      }
    }
  }
  async function nt() {
    const E = s(B)?.at ?? null;
    k(B, null), await ml(), E !== null && s(D)?.focusTile(E);
  }
  function rt(E) {
    nt(), se(() => He.revealPhoto(E.id));
  }
  function je() {
    se(() => navigator.clipboard.writeText(_c(
      {
        stacking: s(ne),
        sort: s(J),
        filters: s(G)
      },
      s(O)
    )));
  }
  var Yt = fu(), vt = lt(Yt);
  {
    var Rn = (E) => {
      Co(E, {
        get facets() {
          return s(H);
        },
        get filters() {
          return s(G);
        },
        get sort() {
          return s(J);
        },
        get stacking() {
          return s(ne);
        },
        get total() {
          return s(y).total;
        },
        get tiles() {
          return s(y).tiles;
        },
        get loading() {
          return s(y).loading;
        },
        get selecting() {
          return s(K);
        },
        get selectedTally() {
          return s(N);
        },
        onfilter: Ee,
        onsort: (Q) => k(J, Q, !0),
        onstack: (Q) => k(ne, Tc(Q), !0),
        onclear: () => k(G, {}, !0),
        onselecting: (Q) => k(K, Q, !0),
        onshare: je,
        ondeselect: q,
        ontriage: () => k(r, "triage")
      });
    };
    ee(vt, (E) => {
      s(r) === "grid" && E(Rn);
    });
  }
  var nn = _(vt, 2);
  {
    var er = (E) => {
      Qc(E, {});
    };
    ee(nn, (E) => {
      n && E(er);
    });
  }
  var tr = _(nn, 2);
  let nr;
  var mr = f(tr);
  {
    var Yr = (E) => {
      var Q = au(), Pe = f(Q), Ge = f(Pe), $e = _(Pe, 2);
      Je($e, 21, () => Vs, bt, (st, Mt, rn) => {
        var sn = eu();
        let Nn;
        var In = f(sn), Ie = f(In), at = _(In, 1, !0);
        W(() => {
          Nn = Ce(sn, 1, "nav svelte-1n46o8q", null, Nn, { on: rn === s(a) }), R(Ie, s(Mt).id), R(at, s(Mt).title);
        }), te("click", sn, () => k(a, rn, !0)), C(st, sn);
      });
      var Gt = _($e, 2);
      {
        var Cn = (st) => {
          var Mt = su(), rn = lt(Mt), sn = f(rn);
          {
            var Nn = (Ze) => {
              var et = tu(), Ln = lt(et), rr = /* @__PURE__ */ ie(() => x.bind(null, !0)), Kr = _(Ln, 2), Xr = f(Kr);
              W(() => R(Xr, `inside ${s(i) ?? ""}`)), te("click", Ln, function(...Vr) {
                s(rr)?.apply(this, Vr);
              }), C(Ze, et);
            }, In = (Ze) => {
              var et = nu(), Ln = f(et);
              W(() => R(Ln, s(U).relive)), te("click", et, () => xe(!0)), C(Ze, et);
            };
            ee(sn, (Ze) => {
              s(U).drill && s(i) ? Ze(Nn) : s(U).relive && Ze(In, 1);
            });
          }
          var Ie = _(rn, 2);
          {
            var at = (Ze) => {
              var et = ru();
              C(Ze, et);
            };
            ee(Ie, (Ze) => {
              s(v) && Ze(at);
            });
          }
          var an = _(Ie, 2);
          {
            let Ze = /* @__PURE__ */ ie(() => s(m)?.rules ?? []);
            Ic(an, {
              get rows() {
                return s(l);
              },
              get screen() {
                return s(U);
              },
              get root() {
                return s(i);
              },
              get checked() {
                return s(u);
              },
              get rules() {
                return s(Ze);
              },
              get picked() {
                return s(c);
              },
              onpick: Re,
              oncheck: ke
            });
          }
          C(st, Mt);
        };
        ee(Gt, (st) => {
          s(le) && st(Cn);
        });
      }
      var On = _(Gt, 2);
      {
        var Tt = (st) => {
          Wc(st, {
            get root() {
              return Vn;
            },
            get version() {
              return s(L);
            },
            get excludedDirs() {
              return s(T);
            },
            get picked() {
              return s(c);
            },
            get busy() {
              return s(d);
            },
            onload: (Mt) => se(() => He.tree(Mt)),
            onpick: Re,
            onexclude: ce
          });
        };
        ee(On, (st) => {
          s(U).tree && st(Tt);
        });
      }
      var Sr = _(On, 2);
      {
        let st = /* @__PURE__ */ ie(() => s(m)?.rules ?? []), Mt = /* @__PURE__ */ ie(() => s(m)?.unmatched ?? null);
        hc(Sr, {
          get rules() {
            return s(st);
          },
          get unmatched() {
            return s(Mt);
          },
          get busy() {
            return s(d);
          },
          ondelete: Xe,
          onmove: Lt
        });
      }
      var Er = _(Sr, 2);
      nc(Er, { oncomplete: Ye }), te("click", Ge, () => k(r, "grid")), C(E, Q);
    };
    ee(mr, (E) => {
      s(r) === "triage" && E(Yr);
    });
  }
  var Et = _(mr, 2), ct = f(Et);
  {
    var Pn = (E) => {
      var Q = uu(), Pe = lt(Q), Ge = f(Pe), $e = _(Pe, 2), Gt = f($e), Cn = _($e, 2);
      {
        var On = (Ie) => {
          var at = iu(), an = f(at);
          W(() => R(an, s(U).note)), C(Ie, at);
        };
        ee(Cn, (Ie) => {
          s(U).note && Ie(On);
        });
      }
      var Tt = _(Cn, 2);
      {
        var Sr = (Ie) => {
          Go(Ie, {
            get screen() {
              return s(U);
            }
          });
        };
        ee(Tt, (Ie) => {
          s(U).name === "dimensions" && Ie(Sr);
        });
      }
      var Er = _(Tt, 2);
      to(Er, {
        get counts() {
          return s(m);
        },
        get files() {
          return s(g);
        },
        get filesAt() {
          return s(h);
        },
        get stale() {
          return s(b);
        },
        get candidate() {
          return s(o);
        },
        get busy() {
          return s(w);
        },
        onfiles: ve
      });
      var st = _(Er, 2);
      {
        var Mt = (Ie) => {
          var at = lu(), an = f(at), Ze = f(an), et = _(an, 2), Ln = f(et), rr = _(et, 2), Kr = _(rr, 2), Xr = f(Kr);
          {
            var Vr = (ln) => {
              var Fn = qn("already excluded — nothing left to write");
              C(ln, Fn);
            }, ni = (ln) => {
              var Fn = qn();
              W((ri) => R(Fn, `one exclude rule each, at the end of the order${ri ?? ""}`), [
                () => s(M).length < s(u).size ? ` · ${Le(s(u).size - s(M).length)} already excluded, skipped` : ""
              ]), C(ln, Fn);
            };
            ee(Xr, (ln) => {
              s(M).length ? ln(ni, -1) : ln(Vr);
            });
          }
          W(
            (ln, Fn) => {
              R(Ze, `${ln ?? ""} ticked`), et.disabled = s(d) || !s(M).length, R(Ln, Fn), rr.disabled = s(d);
            },
            [
              () => Le(s(u).size),
              () => s(d) ? "saving…" : `Exclude ${Le(s(M).length)}`
            ]
          ), te("click", et, Z), te("click", rr, Oe), C(Ie, at);
        };
        ee(st, (Ie) => {
          s(u).size && Ie(Mt);
        });
      }
      var rn = _(st, 2);
      oc(rn, {
        get candidate() {
          return s(o);
        },
        get screen() {
          return s(U);
        },
        get saving() {
          return s(d);
        },
        onedit: fe,
        onconfirm: z,
        onclear: x
      });
      var sn = _(rn, 2);
      {
        var Nn = (Ie) => {
          var at = ou(), an = f(at);
          W((Ze, et) => R(an, `${Ze ?? ""}${et ?? ""} loaded${s(y).exhausted ? " · all of them" : ""}${s(y).loading ? " · loading…" : ""} `), [
            () => Le(s(y).count),
            () => s(y).total ? " of " + Le(s(y).total) : ""
          ]), C(Ie, at);
        }, In = (Ie) => {
          var at = cu();
          C(Ie, at);
        };
        ee(sn, (Ie) => {
          s(me) ? Ie(Nn) : s(U).sheet === !1 && Ie(In, 1);
        });
      }
      W(() => {
        R(Ge, `${s(U).id ?? ""} · ${s(U).title ?? ""}`), R(Gt, s(U).blurb);
      }), C(E, Q);
    };
    ee(ct, (E) => {
      s(r) === "triage" && E(Pn);
    });
  }
  var wr = _(ct, 2);
  {
    var yr = (E) => {
      {
        let Q = /* @__PURE__ */ ie(() => s(r) === "grid" ? null : s(m)?.page_paths ?? null), Pe = /* @__PURE__ */ ie(() => s(r) === "triage"), Ge = /* @__PURE__ */ ie(() => s(r) === "grid" && s(K));
        pr(
          Sc(E, {
            get key() {
              return s(Y);
            },
            fetchPage: xt,
            get total() {
              return s(Q);
            },
            get triage() {
              return s(Pe);
            },
            get excludedDirs() {
              return s(T);
            },
            get selecting() {
              return s(Ge);
            },
            get selectedKeys() {
              return s(F);
            },
            onActivate: Ft,
            onOverride: Ve,
            onExcludeFolder: de,
            onSweepStart: Dt,
            onSweepMove: jt,
            onSweepEnd: St,
            onState: ($e) => k(y, { ...s(y), ...$e }, !0)
          }),
          ($e) => k(D, $e, !0),
          () => s(D)
        );
      }
    };
    ee(wr, (E) => {
      (s(me) || s(r) === "grid") && E(yr);
    });
  }
  var xr = _(tr, 2);
  {
    var Gr = (E) => {
      Ho(E, {
        get frames() {
          return s(B).frames;
        },
        get origin() {
          return s(B).origin;
        },
        get back() {
          return s(ae);
        },
        get forward() {
          return s(Se);
        },
        onstep: Ne,
        onreveal: rt,
        onclose: nt
      });
    };
    ee(xr, (E) => {
      s(B) && E(Gr);
    });
  }
  var _n = _(xr, 2);
  {
    var kr = (E) => {
      var Q = du();
      let Pe;
      var Ge = f(Q);
      W(() => {
        Pe = Ce(Q, 1, "status", null, Pe, { bare: s(r) === "grid" }), R(Ge, s(P));
      }), C(E, Q);
    };
    ee(_n, (E) => {
      s(P) && E(kr);
    });
  }
  W(() => nr = Ce(tr, 1, "shell", null, nr, { bare: s(r) === "grid" })), C(e, Yt), ht();
}
It(["click"]);
po();
Ns();
Tl(hu, { target: document.getElementById("app") });
