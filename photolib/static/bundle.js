var ws = Array.isArray, ii = Array.prototype.indexOf, Cr = Array.prototype.includes, Br = Array.from, li = Object.defineProperty, Yn = Object.getOwnPropertyDescriptor, oi = Object.getOwnPropertyDescriptors, ci = Object.prototype, ui = Array.prototype, oa = Object.getPrototypeOf, zs = Object.isExtensible;
const Ar = () => {
};
function di(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ca() {
  var e, t, n = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
function $r(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const s of e)
    if (n.push(s), n.length === t) break;
  return n;
}
const Xe = 2, Kn = 4, qr = 8, ua = 1 << 24, zt = 16, xt = 32, rn = 64, ls = 128, yt = 512, We = 1024, Ye = 2048, jt = 4096, rt = 8192, vt = 16384, Qn = 32768, os = 1 << 25, Xn = 65536, Nr = 1 << 17, fi = 1 << 18, er = 1 << 19, hi = 1 << 20, Gt = 1 << 25, Nn = 65536, Or = 1 << 21, Gn = 1 << 22, mn = 1 << 23, An = Symbol("$state"), vi = Symbol("legacy props"), pi = Symbol(""), da = Symbol("attributes"), cs = Symbol("class"), us = Symbol("style"), ds = Symbol("text"), br = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), gi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function _i(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function bi() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function mi(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function wi(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function yi() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function xi(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function ki() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Si(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Ei() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ti() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Mi() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ai() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Ri = 1, Pi = 2, fa = 4, Ci = 8, Ni = 16, Oi = 1, Ii = 4, zi = 8, Fi = 16, Li = 1, Di = 2, Ue = Symbol("uninitialized"), ji = "http://www.w3.org/1999/xhtml";
function Hi() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Bi() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function qi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ha(e) {
  return e === this.v;
}
function Ui(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function va(e) {
  return !Ui(e, this.v);
}
let tt = null;
function Vn(e) {
  tt = e;
}
function pt(e, t = !1, n) {
  tt = {
    p: tt,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      _e
    ),
    l: null
  };
}
function gt(e) {
  var t = (
    /** @type {ComponentContext} */
    tt
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var s of n)
      Oa(s);
  }
  return e !== void 0 && (t.x = e), t.i = !0, tt = t.p, e ?? /** @type {T} */
  {};
}
function pa() {
  return !0;
}
let En = [];
function ga() {
  var e = En;
  En = [], di(e);
}
function Qt(e) {
  if (En.length === 0 && !hr) {
    var t = En;
    queueMicrotask(() => {
      t === En && ga();
    });
  }
  En.push(e);
}
function Wi() {
  for (; En.length > 0; )
    ga();
}
function _a(e) {
  var t = _e;
  if (t === null)
    return me.f |= mn, e;
  if ((t.f & Qn) === 0 && (t.f & Kn) === 0)
    throw e;
  _n(e, t);
}
function _n(e, t) {
  if (!(t !== null && (t.f & vt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & ls) !== 0) {
        if ((t.f & Qn) === 0)
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
const Yi = -7169;
function Le(e, t) {
  e.f = e.f & Yi | t;
}
function ys(e) {
  (e.f & yt) !== 0 || e.deps === null ? Le(e, We) : Le(e, jt);
}
function ba(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Xe) === 0 || (t.f & Nn) === 0 || (t.f ^= Nn, ba(
        /** @type {Derived} */
        t.deps
      ));
}
function ma(e, t, n) {
  (e.f & Ye) !== 0 ? t.add(e) : (e.f & jt) !== 0 && n.add(e), ba(e.deps), Le(e, We);
}
let Er = !1;
function Gi(e) {
  var t = Er;
  try {
    return Er = !1, [e(), Er];
  } finally {
    Er = t;
  }
}
function Ki(e, t, n, s = !0) {
  s && n();
  for (var a of t)
    e.addEventListener(a, n);
  Ur(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function tr(e) {
  var t = me, n = _e;
  kt(null), Xt(null);
  try {
    return e();
  } finally {
    kt(t), Xt(n);
  }
}
function Xi(e) {
  let t = 0, n = On(0), s;
  return () => {
    Es() && (r(n), Ia(() => (t === 0 && (s = nn(() => e(() => vr(n)))), t += 1, () => {
      Qt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, vr(n));
      });
    })));
  };
}
var Vi = Xn | er;
function $i(e, t, n, s) {
  new Ji(e, t, n, s);
}
class Ji {
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
  #b = Xi(() => (this.#d = On(this.#p), () => {
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
        _e
      );
      l.b = this, l.f |= ls, s(i);
    }, this.parent = /** @type {Effect} */
    _e.b, this.transform_error = a ?? this.parent?.transform_error ?? ((i) => i), this.#s = Ms(() => {
      this.#h();
    }, Vi);
  }
  #_() {
    try {
      this.#i = mt(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#t.failed, { reset: s, invoke_onerror: a } = this.#m(t);
    Qt(a), n && (this.#o = mt(() => {
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
        qi();
        return;
      }
      n = !0, s && Ai(), this.#o !== null && Pn(this.#o, () => {
        this.#o = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: a, invoke_onerror: () => {
      try {
        s = !0, this.#t.onerror?.(t, a), s = !1;
      } catch (l) {
        _n(l, this.#s && this.#s.parent);
      }
    } };
  }
  #x() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#n = mt(() => t(this.#e)), Qt(() => {
      var n = this.#a = document.createDocumentFragment(), s = tn();
      n.append(s), this.#i = this.#v(() => mt(() => this.#l(s))), this.#c === 0 && (this.#e.before(n), this.#a = null, Pn(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        Ee
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#p = 0, this.#i = mt(() => {
        this.#l(this.#e);
      }), this.#c > 0) {
        var t = this.#a = document.createDocumentFragment();
        Rs(this.#i, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#n = mt(() => n(this.#e));
      } else
        this.#w(
          /** @type {Batch} */
          Ee
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
    var n = _e, s = me, a = tt;
    Xt(this.#s), kt(this.#s), Vn(this.#s.ctx);
    try {
      return yn.ensure(), t();
    } catch (i) {
      return _a(i), null;
    } finally {
      Xt(n), kt(s), Vn(a);
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
    this.#c += t, this.#c === 0 && (this.#w(n), this.#n && Pn(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#u) && (this.#u = !0, Qt(() => {
      this.#u = !1, this.#d && $n(this.#d, this.#p);
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
    Ee?.is_fork ? (this.#i && Ee.skip_effect(this.#i), this.#n && Ee.skip_effect(this.#n), this.#o && Ee.skip_effect(this.#o), Ee.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#i && (ut(this.#i), this.#i = null), this.#n && (ut(this.#n), this.#n = null), this.#o && (ut(this.#o), this.#o = null);
    let n = this.#t.failed;
    const s = (a) => {
      const { reset: i, invoke_onerror: l } = this.#m(a);
      l(), n && (this.#o = this.#v(() => {
        try {
          return mt(() => {
            var c = (
              /** @type {Effect} */
              _e
            );
            c.b = this, c.f |= ls, n(
              this.#e,
              () => a,
              () => i
            );
          });
        } catch (c) {
          return _n(
            c,
            /** @type {Effect} */
            this.#s.parent
          ), null;
        }
      }));
    };
    Qt(() => {
      var a;
      try {
        a = this.transform_error(t);
      } catch (i) {
        _n(i, this.#s && this.#s.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof /** @type {any} */
      a.then == "function" ? a.then(
        s,
        /** @param {unknown} e */
        (i) => _n(i, this.#s && this.#s.parent)
      ) : s(a);
    });
  }
}
function Zi(e, t, n, s) {
  const a = pr;
  var i = e.filter((h) => !h.settled), l = t.map(a);
  if (n.length === 0 && i.length === 0) {
    s(l);
    return;
  }
  var c = (
    /** @type {Effect} */
    _e
  ), o = Qi(), u = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function g(h) {
    if ((c.f & vt) === 0) {
      o();
      try {
        s([...l, ...h]);
      } catch (b) {
        _n(b, c);
      }
      Ir();
    }
  }
  var m = wa();
  if (n.length === 0) {
    u.then(() => g([])).finally(m);
    return;
  }
  function _() {
    Promise.all(n.map((h) => /* @__PURE__ */ el(h))).then(g).catch((h) => _n(h, c)).finally(m);
  }
  u ? u.then(() => {
    o(), _(), Ir();
  }) : _();
}
function Qi() {
  var e = (
    /** @type {Effect} */
    _e
  ), t = me, n = tt, s = (
    /** @type {Batch} */
    Ee
  );
  return function(i = !0) {
    Xt(e), kt(t), Vn(n), i && (e.f & vt) === 0 && (s?.activate(), s?.apply());
  };
}
function Ir(e = !0) {
  Xt(null), kt(null), Vn(null), e && Ee?.deactivate();
}
function wa() {
  var e = (
    /** @type {Effect} */
    _e
  ), t = e.b, n = (
    /** @type {Batch} */
    Ee
  ), s = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(s, e), () => {
    t?.update_pending_count(-1, n), n.decrement(s, e);
  };
}
// @__NO_SIDE_EFFECTS__
function pr(e) {
  var t = Xe | Ye;
  return _e !== null && (_e.f |= er), {
    ctx: tt,
    deps: null,
    effects: null,
    equals: ha,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Ue
    ),
    wv: 0,
    parent: _e,
    ac: null
  };
}
const or = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function el(e, t, n) {
  let s = (
    /** @type {Effect | null} */
    _e
  );
  s === null && bi();
  var a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = On(
    /** @type {V} */
    Ue
  ), l = !me, c = /* @__PURE__ */ new Set();
  return gl(() => {
    var o = (
      /** @type {Effect} */
      _e
    ), u = ca();
    a = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, (h) => {
        h !== br && u.reject(h);
      }).finally(Ir);
    } catch (h) {
      u.reject(h), Ir();
    }
    var g = (
      /** @type {Batch} */
      Ee
    );
    if (l) {
      if ((o.f & Qn) !== 0)
        var m = wa();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        s.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(or);
      else
        for (const h of c.values())
          h.reject(or);
      c.add(u), g.async_deriveds.set(o, u);
    }
    const _ = (h, b = void 0) => {
      m?.(), c.delete(u), b !== or && (g.activate(), b ? (i.f |= mn, $n(i, b)) : ((i.f & mn) !== 0 && (i.f ^= mn), $n(i, h)), g.deactivate());
    };
    u.promise.then(_, (h) => _(null, h || "unknown"));
  }), Ur(() => {
    for (const o of c)
      o.reject(or);
  }), new Promise((o) => {
    function u(g) {
      function m() {
        g === a ? o(i) : u(a);
      }
      g.then(m, m);
    }
    u(a);
  });
}
// @__NO_SIDE_EFFECTS__
function se(e) {
  const t = /* @__PURE__ */ pr(e);
  return ja(t), t;
}
// @__NO_SIDE_EFFECTS__
function ya(e) {
  const t = /* @__PURE__ */ pr(e);
  return t.equals = va, t;
}
function tl(e) {
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
function xs(e) {
  var t, n = _e, s = e.parent;
  if (!sn && s !== null && e.v !== Ue && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (s.f & (vt | rt)) !== 0)
    return Hi(), e.v;
  Xt(s);
  try {
    e.f &= ~Nn, tl(e), t = Ua(e);
  } finally {
    Xt(n);
  }
  return t;
}
function xa(e) {
  var t = xs(e);
  if (!e.equals(t) && (e.wv = Ba(), (!Ee?.is_fork || e.deps === null) && (Ee !== null ? (Ee.capture(e, t, !0), fs?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Le(e, We);
    return;
  }
  sn || (Ft !== null ? (Es() || Ee?.is_fork) && Ft.set(e, t) : ys(e));
}
function nl(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && tr(() => {
        t.ac.abort(br), t.ac = null;
      }), t.fn !== null && (t.teardown = Ar), gr(t, 0), As(t));
}
function ka(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Jn(t);
}
let Jr = null, Bn = null, Ee = null, fs = null, Ft = null, hs = null, hr = !1, Zr = !1, Un = null, Rr = null;
var Fs = 0;
let rl = 1;
class yn {
  id = rl++;
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
    Bn === null ? Jr = Bn = this : (Bn.#t = this, this.#r = Bn), Bn = this;
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
        Le(a, Ye), n(a);
      for (a of s.m)
        Le(a, jt), n(a);
    }
    this.#g.add(t);
  }
  #_() {
    this.#e = !0, Fs++ > 1e3 && (this.#v(), al());
    for (const o of this.#c)
      this.#u.delete(o), Le(o, Ye), this.schedule(o);
    for (const o of this.#u)
      Le(o, jt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Un = [], s = [], a = Rr = [];
    for (const o of t)
      try {
        this.#y(o, n, s);
      } catch (u) {
        throw Ta(o), this.#b() || this.discard(), u;
      }
    if (Ee = null, a.length > 0) {
      var i = yn.ensure();
      for (const o of a)
        i.schedule(o);
    }
    if (Un = null, Rr = null, this.#b()) {
      this.#h(s), this.#h(n);
      for (const [o, u] of this.#f)
        Ea(o, u);
      a.length > 0 && /** @type {unknown} */
      Ee.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(s), this.#h(n), l.#x(this);
      return;
    }
    this.#c.clear(), this.#u.clear();
    for (const o of this.#l) o(this);
    this.#l.clear(), fs = this, Ls(s), Ls(n), fs = null, this.#o?.resolve();
    var c = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      Ee
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
  #y(t, n, s) {
    t.f ^= We;
    for (var a = t.first; a !== null; ) {
      var i = a.f, l = (i & (xt | rn)) !== 0, c = l && (i & We) !== 0, o = c || (i & rt) !== 0 || this.#f.has(a);
      if (!o && a.fn !== null) {
        l ? a.f ^= We : (i & Kn) !== 0 ? n.push(a) : wr(a) && ((i & zt) !== 0 && this.#u.add(a), Jn(a));
        var u = a.first;
        if (u !== null) {
          a = u;
          continue;
        }
      }
      for (; a !== null; ) {
        var g = a.next;
        if (g !== null) {
          a = g;
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
    t.async_deriveds.clear(), this.transfer_effects(t.#c, t.#u);
    const n = (s) => {
      var a = s.reactions;
      if (a !== null && !((s.f & Xe) !== 0 && (s.f & (Ye | jt)) === 0))
        for (const c of a) {
          var i = c.f;
          if ((i & Xe) !== 0)
            n(
              /** @type {Derived} */
              c
            );
          else {
            var l = (
              /** @type {Effect} */
              c
            );
            i & (Gn | zt) && !this.async_deriveds.has(l) && (this.#u.delete(l), Le(l, Ye), this.schedule(l));
          }
        }
    };
    for (const s of this.current.keys())
      n(s);
    this.oncommit(() => t.discard()), t.#v(), Ee = this, this.#_();
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
  capture(t, n, s = !1) {
    t.v !== Ue && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & mn) === 0 && (this.current.set(t, [n, s]), Ft?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    Ee = this;
  }
  deactivate() {
    Ee = null, Ft = null;
  }
  flush() {
    try {
      Zr = !0, Ee = this, this.#_();
    } finally {
      Fs = 0, hs = null, Un = null, Rr = null, Zr = !1, Ee = null, Ft = null, Rn.clear();
    }
  }
  discard() {
    for (const t of this.#s) t(this);
    this.#s.clear();
    for (const t of this.async_deriveds.values())
      t.reject(or);
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
      for (const [_, [h, b]] of this.current) {
        if (m.current.has(_)) {
          var s = (
            /** @type {[any, boolean]} */
            m.current.get(_)[0]
          );
          if (t && h !== s)
            m.current.set(_, [h, b]);
          else
            continue;
        }
        n.push(_);
      }
      if (t)
        for (const [_, h] of this.async_deriveds) {
          const b = m.async_deriveds.get(_);
          b && h.promise.then(b.resolve).catch(b.reject);
        }
      var a = [...m.current.keys()].filter(
        (_) => !/** @type {[any, boolean]} */
        m.current.get(_)[1]
      );
      if (!(!m.#e || a.length === 0)) {
        var i = a.filter((_) => !this.current.has(_));
        if (i.length === 0)
          t && m.discard();
        else if (n.length > 0) {
          if (t)
            for (const _ of this.#g)
              m.unskip_effect(_, (h) => {
                (h.f & (zt | Gn)) !== 0 ? m.schedule(h) : m.#h([h]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
          for (var o of n)
            Sa(o, i, l, c);
          c = /* @__PURE__ */ new Map();
          var u = [...m.current].filter(([_, h]) => {
            const b = this.current.get(_);
            return b ? b[0] !== h[0] || b[1] !== h[1] : !0;
          }).map(([_]) => _);
          if (u.length > 0)
            for (const _ of this.#p)
              (_.f & (vt | rt | Nr)) === 0 && ks(_, u, c) && ((_.f & (Gn | zt)) !== 0 ? (Le(_, Ye), m.schedule(_)) : m.#c.add(_));
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
    this.#d || (this.#d = !0, Qt(() => {
      this.#d = !1, this.linked && this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const s of t)
      this.#c.add(s);
    for (const s of n)
      this.#u.add(s);
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
    if (Ee === null) {
      const t = Ee = new yn();
      !Zr && !hr && Qt(() => {
        t.#e || t.flush();
      });
    }
    return Ee;
  }
  apply() {
    {
      Ft = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (hs = t, t.b?.is_pending && (t.f & (Kn | qr | ua)) !== 0 && (t.f & Qn) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var s = n.f;
      if (Un !== null && n === _e && (me === null || (me.f & Xe) === 0))
        return;
      if ((s & (rn | xt)) !== 0) {
        if ((s & We) === 0)
          return;
        n.f ^= We;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#r, n = this.#t;
      t === null ? Jr = n : t.#t = n, n === null ? Bn = t : n.#r = t, this.linked = !1;
    }
  }
}
function sl(e) {
  var t = hr;
  hr = !0;
  try {
    for (var n; ; ) {
      if (Wi(), Ee === null)
        return (
          /** @type {T} */
          n
        );
      Ee.flush();
    }
  } finally {
    hr = t;
  }
}
function al() {
  try {
    ki();
  } catch (e) {
    _n(e, hs);
  }
}
let Zt = null;
function Ls(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var s = e[n++];
      if ((s.f & (vt | rt)) === 0 && wr(s) && (Zt = /* @__PURE__ */ new Set(), Jn(s), s.deps === null && s.first === null && s.nodes === null && s.teardown === null && s.ac === null && Fa(s), Zt?.size > 0)) {
        Rn.clear();
        for (const a of Zt) {
          if ((a.f & (vt | rt)) !== 0) continue;
          const i = [a];
          let l = a.parent;
          for (; l !== null; )
            Zt.has(l) && (Zt.delete(l), i.push(l)), l = l.parent;
          for (let c = i.length - 1; c >= 0; c--) {
            const o = i[c];
            (o.f & (vt | rt)) === 0 && Jn(o);
          }
        }
        Zt.clear();
      }
    }
    Zt = null;
  }
}
function Sa(e, t, n, s) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const i = a.f;
      (i & Xe) !== 0 ? Sa(
        /** @type {Derived} */
        a,
        t,
        n,
        s
      ) : (i & (Gn | zt)) !== 0 && (i & Ye) === 0 && ks(a, t, s) && (Le(a, Ye), Ss(
        /** @type {Effect} */
        a
      ));
    }
}
function ks(e, t, n) {
  const s = n.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (Cr.call(t, a))
        return !0;
      if ((a.f & Xe) !== 0 && ks(
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
function Ss(e) {
  Ee.schedule(e);
}
function Ea(e, t) {
  if (!((e.f & xt) !== 0 && (e.f & We) !== 0)) {
    (e.f & Ye) !== 0 ? t.d.push(e) : (e.f & jt) !== 0 && t.m.push(e), Le(e, We);
    for (var n = e.first; n !== null; )
      Ea(n, t), n = n.next;
  }
}
function Ta(e) {
  Le(e, We);
  for (var t = e.first; t !== null; )
    Ta(t), t = t.next;
}
let zr = /* @__PURE__ */ new Set();
const Rn = /* @__PURE__ */ new Map();
let Ma = !1;
function On(e, t) {
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
  const n = On(e);
  return ja(n), n;
}
// @__NO_SIDE_EFFECTS__
function il(e, t = !1, n = !0) {
  const s = On(e);
  return t || (s.equals = va), s;
}
function x(e, t, n = !1) {
  me !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Dt || (me.f & Nr) !== 0) && pa() && (me.f & (Xe | zt | Gn | Nr)) !== 0 && (Kt === null || !Kt.has(e)) && Mi();
  let s = n ? Ie(t) : t;
  return $n(e, s, Rr);
}
function $n(e, t, n = null) {
  if (!e.equals(t)) {
    Rn.set(e, sn ? t : e.v);
    var s = yn.ensure();
    if (s.capture(e, t), (e.f & Xe) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & Ye) !== 0 && xs(a), Ft === null && ys(a);
    }
    e.wv = Ba(), Aa(e, Ye, n), _e !== null && (_e.f & We) !== 0 && (_e.f & (xt | rn)) === 0 && (bt === null ? ml([e]) : bt.push(e)), !s.is_fork && zr.size > 0 && !Ma && ll();
  }
  return t;
}
function ll() {
  Ma = !1;
  for (const e of zr) {
    (e.f & We) !== 0 && Le(e, jt);
    let t;
    try {
      t = wr(e);
    } catch {
      t = !0;
    }
    t && Jn(e);
  }
  zr.clear();
}
function ol(e, t = 1) {
  var n = r(e), s = t === 1 ? n++ : n--;
  return x(e, n), s;
}
function vr(e) {
  x(e, e.v + 1);
}
function Aa(e, t, n) {
  var s = e.reactions;
  if (s !== null)
    for (var a = s.length, i = 0; i < a; i++) {
      var l = s[i], c = l.f, o = (c & Ye) === 0;
      if (o && Le(l, t), (c & Nr) !== 0)
        zr.add(
          /** @type {Effect} */
          l
        );
      else if ((c & Xe) !== 0) {
        var u = (
          /** @type {Derived} */
          l
        );
        Ft?.delete(u), (c & Nn) === 0 && (c & yt && (_e === null || (_e.f & Or) === 0) && (l.f |= Nn), Aa(u, jt, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (c & zt) !== 0 && Zt !== null && Zt.add(g), n !== null ? n.push(g) : Ss(g);
      }
    }
}
function Ie(e) {
  if (typeof e != "object" || e === null || An in e)
    return e;
  const t = oa(e);
  if (t !== ci && t !== ui)
    return e;
  var n = /* @__PURE__ */ new Map(), s = ws(e), a = /* @__PURE__ */ X(0), i = Cn, l = (c) => {
    if (Cn === i)
      return c();
    var o = me, u = Cn;
    kt(null), Hs(i);
    var g = c();
    return kt(o), Hs(u), g;
  };
  return s && n.set("length", /* @__PURE__ */ X(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, o, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Ei();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var m = /* @__PURE__ */ X(u.value);
          return n.set(o, m), m;
        }) : x(g, u.value, !0), !0;
      },
      deleteProperty(c, o) {
        var u = n.get(o);
        if (u === void 0) {
          if (o in c) {
            const g = l(() => /* @__PURE__ */ X(Ue));
            n.set(o, g), vr(a);
          }
        } else
          x(u, Ue), vr(a);
        return !0;
      },
      get(c, o, u) {
        if (o === An)
          return e;
        var g = n.get(o), m = o in c;
        if (g === void 0 && (!m || Yn(c, o)?.writable) && (g = l(() => {
          var h = Ie(m ? c[o] : Ue), b = /* @__PURE__ */ X(h);
          return b;
        }), n.set(o, g)), g !== void 0) {
          var _ = r(g);
          return _ === Ue ? void 0 : _;
        }
        return Reflect.get(c, o, u);
      },
      getOwnPropertyDescriptor(c, o) {
        var u = Reflect.getOwnPropertyDescriptor(c, o);
        if (u && "value" in u) {
          var g = n.get(o);
          g && (u.value = r(g));
        } else if (u === void 0) {
          var m = n.get(o), _ = m?.v;
          if (m !== void 0 && _ !== Ue)
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return u;
      },
      has(c, o) {
        if (o === An)
          return !0;
        var u = n.get(o), g = u !== void 0 && u.v !== Ue || Reflect.has(c, o);
        if (u !== void 0 || _e !== null && (!g || Yn(c, o)?.writable)) {
          u === void 0 && (u = l(() => {
            var _ = g ? Ie(c[o]) : Ue, h = /* @__PURE__ */ X(_);
            return h;
          }), n.set(o, u));
          var m = r(u);
          if (m === Ue)
            return !1;
        }
        return g;
      },
      set(c, o, u, g) {
        var m = n.get(o), _ = o in c;
        if (s && o === "length")
          for (var h = u; h < /** @type {Source<number>} */
          m.v; h += 1) {
            var b = n.get(h + "");
            b !== void 0 ? x(b, Ue) : h in c && (b = l(() => /* @__PURE__ */ X(Ue)), n.set(h + "", b));
          }
        if (m === void 0)
          (!_ || Yn(c, o)?.writable) && (m = l(() => /* @__PURE__ */ X(void 0)), x(m, Ie(u)), n.set(o, m));
        else {
          _ = m.v !== Ue;
          var w = l(() => Ie(u));
          x(m, w);
        }
        var d = Reflect.getOwnPropertyDescriptor(c, o);
        if (d?.set && d.set.call(g, u), !_) {
          if (s && typeof o == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= v.v && x(v, y + 1);
          }
          vr(a);
        }
        return !0;
      },
      ownKeys(c) {
        r(a);
        var o = Reflect.ownKeys(c).filter((m) => {
          var _ = n.get(m);
          return _ === void 0 || _.v !== Ue;
        });
        for (var [u, g] of n)
          g.v !== Ue && !(u in c) && o.push(u);
        return o;
      },
      setPrototypeOf() {
        Ti();
      }
    }
  );
}
function Ds(e) {
  try {
    if (e !== null && typeof e == "object" && An in e)
      return e[An];
  } catch {
  }
  return e;
}
function cl(e, t) {
  return Object.is(Ds(e), Ds(t));
}
var wn, Ra, Pa, Ca;
function ul() {
  if (wn === void 0) {
    wn = window, Ra = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Pa = Yn(t, "firstChild").get, Ca = Yn(t, "nextSibling").get, zs(e) && (e[cs] = void 0, e[da] = null, e[us] = void 0, e.__e = void 0), zs(n) && (n[ds] = void 0);
  }
}
function tn(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Fr(e) {
  return (
    /** @type {TemplateNode | null} */
    Pa.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function mr(e) {
  return (
    /** @type {TemplateNode | null} */
    Ca.call(e)
  );
}
function f(e, t) {
  return /* @__PURE__ */ Fr(e);
}
function ct(e, t = !1) {
  {
    var n = /* @__PURE__ */ Fr(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ mr(n) : n;
  }
}
function p(e, t = 1, n = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ mr(s);
  return s;
}
function dl(e) {
  e.textContent = "";
}
function Na() {
  return !1;
}
function fl(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function hl(e) {
  _e === null && (me === null && xi(), yi()), sn && wi();
}
function vl(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function an(e, t) {
  var n = _e;
  n !== null && (n.f & rt) !== 0 && (e |= rt);
  var s = {
    ctx: tt,
    deps: null,
    nodes: null,
    f: e | Ye | yt,
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
  Ee?.register_created_effect(s);
  var a = s;
  if ((e & Kn) !== 0)
    Un !== null ? Un.push(s) : yn.ensure().schedule(s);
  else if (t !== null) {
    try {
      Jn(s);
    } catch (l) {
      throw ut(s), l;
    }
    a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
    (a.f & er) === 0 && (a = a.first, (e & zt) !== 0 && (e & Xn) !== 0 && a !== null && (a.f |= Xn));
  }
  if (a !== null && (a.parent = n, n !== null && vl(a, n), me !== null && (me.f & Xe) !== 0 && (e & rn) === 0)) {
    var i = (
      /** @type {Derived} */
      me
    );
    (i.effects ??= []).push(a);
  }
  return s;
}
function Es() {
  return me !== null && !Dt;
}
function Ur(e) {
  const t = an(qr, null);
  return Le(t, We), t.teardown = e, t;
}
function Lt(e) {
  hl();
  var t = (
    /** @type {Effect} */
    _e.f
  ), n = !me && (t & xt) !== 0 && tt !== null && !tt.i;
  if (n) {
    var s = (
      /** @type {ComponentContext} */
      tt
    );
    (s.e ??= []).push(e);
  } else
    return Oa(e);
}
function Oa(e) {
  return an(Kn | hi, e);
}
function pl(e) {
  yn.ensure();
  const t = an(rn | er, e);
  return (n = {}) => new Promise((s) => {
    n.outro ? Pn(t, () => {
      ut(t), s(void 0);
    }) : (ut(t), s(void 0));
  });
}
function Ts(e) {
  return an(Kn, e);
}
function gl(e) {
  return an(Gn | er, e);
}
function Ia(e, t = 0) {
  return an(qr | t, e);
}
function W(e, t = [], n = [], s = []) {
  Zi(s, t, n, (a) => {
    an(qr, () => {
      e(...a.map(r));
    });
  });
}
function Ms(e, t = 0) {
  var n = an(zt | t, e);
  return n;
}
function mt(e) {
  return an(xt | er, e);
}
function za(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = sn, s = me;
    js(!0), kt(null);
    try {
      t.call(null);
    } finally {
      js(n), kt(s);
    }
  }
}
function As(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && tr(() => {
      a.abort(br);
    });
    var s = n.next;
    (n.f & rn) !== 0 ? n.parent = null : ut(n, t), n = s;
  }
}
function _l(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & xt) === 0 && ut(t), t = n;
  }
}
function ut(e, t = !0) {
  var n = !1;
  (t || (e.f & fi) !== 0) && e.nodes !== null && e.nodes.end !== null && (bl(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= os, As(e, t && !n), gr(e, 0);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const i of s)
      i.stop();
  za(e), e.f ^= os, e.f |= vt;
  var a = e.parent;
  a !== null && a.first !== null && Fa(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function bl(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ mr(e);
    e.remove(), e = n;
  }
}
function Fa(e) {
  var t = e.parent, n = e.prev, s = e.next;
  n !== null && (n.next = s), s !== null && (s.prev = n), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = n));
}
function Pn(e, t, n = !0) {
  var s = [];
  La(e, s, !0);
  var a = () => {
    n && ut(e), t && t();
  }, i = s.length;
  if (i > 0) {
    var l = () => --i || a();
    for (var c of s)
      c.out(l);
  } else
    a();
}
function La(e, t, n) {
  if ((e.f & rt) === 0) {
    e.f ^= rt;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const c of s)
        (c.is_global || n) && t.push(c);
    for (var a = e.first; a !== null; ) {
      var i = a.next;
      if ((a.f & rn) === 0) {
        var l = (a.f & Xn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (a.f & xt) !== 0 && (e.f & zt) !== 0;
        La(a, t, l ? n : !1);
      }
      a = i;
    }
  }
}
function Lr(e) {
  Da(e, !0);
}
function Da(e, t) {
  if ((e.f & rt) !== 0) {
    e.f ^= rt, (e.f & We) === 0 && (Le(e, Ye), yn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var s = n.next, a = (n.f & Xn) !== 0 || (n.f & xt) !== 0;
      Da(n, a ? t : !1), n = s;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function Rs(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, s = e.nodes.end; n !== null; ) {
      var a = n === s ? null : /* @__PURE__ */ mr(n);
      t.append(n), n = a;
    }
}
let Pr = !1, sn = !1;
function js(e) {
  sn = e;
}
let me = null, Dt = !1;
function kt(e) {
  me = e;
}
let _e = null;
function Xt(e) {
  _e = e;
}
let Kt = null;
function ja(e) {
  me !== null && (Kt ??= /* @__PURE__ */ new Set()).add(e);
}
let ot = null, ht = 0, bt = null;
function ml(e) {
  bt = e;
}
let Ha = 1, Tn = 0, Cn = Tn;
function Hs(e) {
  Cn = e;
}
function Ba() {
  return ++Ha;
}
function wr(e) {
  var t = e.f;
  if ((t & Ye) !== 0)
    return !0;
  if (t & Xe && (e.f &= ~Nn), (t & jt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), s = n.length, a = 0; a < s; a++) {
      var i = n[a];
      if (wr(
        /** @type {Derived} */
        i
      ) && xa(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & yt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ft === null && Le(e, We);
  }
  return !1;
}
function qa(e, t, n = !0) {
  var s = e.reactions;
  if (s !== null && !(Kt !== null && Kt.has(e)))
    for (var a = 0; a < s.length; a++) {
      var i = s[a];
      (i.f & Xe) !== 0 ? qa(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Le(i, Ye) : (i.f & We) !== 0 && Le(i, jt), Ss(
        /** @type {Effect} */
        i
      ));
    }
}
function Ua(e) {
  var t = ot, n = ht, s = bt, a = me, i = Kt, l = tt, c = Dt, o = Cn, u = e.f;
  ot = /** @type {null | Value[]} */
  null, ht = 0, bt = null, me = (u & (xt | rn)) === 0 ? e : null, Kt = null, Vn(e.ctx), Dt = !1, Cn = ++Tn, e.ac !== null && (tr(() => {
    e.ac.abort(br);
  }), e.ac = null);
  try {
    e.f |= Or;
    var g = (
      /** @type {Function} */
      e.fn
    ), m = g();
    e.f |= Qn;
    var _ = e.deps, h = Ee?.is_fork;
    if (ot !== null) {
      var b;
      if (h || gr(e, ht), _ !== null && ht > 0)
        for (_.length = ht + ot.length, b = 0; b < ot.length; b++)
          _[ht + b] = ot[b];
      else
        e.deps = _ = ot;
      if (Es() && (e.f & yt) !== 0)
        for (b = ht; b < _.length; b++)
          (_[b].reactions ??= []).push(e);
    } else !h && _ !== null && ht < _.length && (gr(e, ht), _.length = ht);
    if (pa() && bt !== null && !Dt && _ !== null && (e.f & (Xe | jt | Ye)) === 0)
      for (b = 0; b < /** @type {Source[]} */
      bt.length; b++)
        qa(
          bt[b],
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
      bt !== null && (s === null ? s = bt : s.push(.../** @type {Source[]} */
      bt));
    }
    return (e.f & mn) !== 0 && (e.f ^= mn), m;
  } catch (w) {
    return _a(w);
  } finally {
    e.f ^= Or, ot = t, ht = n, bt = s, me = a, Kt = i, Vn(l), Dt = c, Cn = o;
  }
}
function wl(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var s = ii.call(n, e);
    if (s !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[s] = n[a], n.pop());
    }
  }
  if (n === null && (t.f & Xe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ot === null || !Cr.call(ot, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & yt) !== 0 && (i.f ^= yt, i.f &= ~Nn), i.v !== Ue && ys(i), i.ac !== null && tr(() => {
      i.ac.abort(br), i.ac = null, Le(i, Ye);
    }), nl(i), gr(i, 0);
  }
}
function gr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var s = t; s < n.length; s++)
      wl(e, n[s]);
}
function Jn(e) {
  var t = e.f;
  if ((t & vt) === 0) {
    Le(e, We);
    var n = _e, s = Pr;
    _e = e, Pr = (t & (xt | rn)) === 0;
    try {
      (t & (zt | ua)) !== 0 ? _l(e) : As(e), za(e);
      var a = Ua(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Ha;
      var i;
    } finally {
      Pr = s, _e = n;
    }
  }
}
async function yl() {
  await Promise.resolve(), sl();
}
function r(e) {
  var t = e.f, n = (t & Xe) !== 0;
  if (me !== null && !Dt) {
    var s = _e !== null && (_e.f & vt) !== 0;
    if (!s && (Kt === null || !Kt.has(e))) {
      var a = me.deps;
      if ((me.f & Or) !== 0)
        e.rv < Tn && (e.rv = Tn, ot === null && a !== null && a[ht] === e ? ht++ : ot === null ? ot = [e] : ot.push(e));
      else {
        me.deps ??= [], Cr.call(me.deps, e) || me.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [me] : Cr.call(i, me) || i.push(me);
      }
    }
  }
  if (sn && Rn.has(e))
    return Rn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (sn) {
      var c = l.v;
      return ((l.f & We) === 0 && l.reactions !== null || Ya(l)) && (c = xs(l)), Rn.set(l, c), c;
    }
    var o = (l.f & yt) === 0 && !Dt && me !== null && (Pr || (me.f & yt) !== 0), u = (l.f & Qn) === 0;
    wr(l) && (o && (l.f |= yt), xa(l)), o && !u && (ka(l), Wa(l));
  }
  if (Ft?.has(e))
    return Ft.get(e);
  if ((e.f & mn) !== 0)
    throw e.v;
  return e.v;
}
function Wa(e) {
  if (e.f |= yt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Xe) !== 0 && (t.f & yt) === 0 && (ka(
        /** @type {Derived} */
        t
      ), Wa(
        /** @type {Derived} */
        t
      ));
}
function Ya(e) {
  if (e.v === Ue) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Rn.has(t) || (t.f & Xe) !== 0 && Ya(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function nn(e) {
  var t = Dt;
  try {
    return Dt = !0, e();
  } finally {
    Dt = t;
  }
}
const xl = ["touchstart", "touchmove"];
function kl(e) {
  return xl.includes(e);
}
const cr = Symbol("events"), Ga = /* @__PURE__ */ new Set(), vs = /* @__PURE__ */ new Set();
function Sl(e, t, n, s = {}) {
  function a(i) {
    if (s.capture || ps.call(t, i), !i.cancelBubble)
      return tr(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Qt(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function Mn(e, t, n, s, a) {
  var i = { capture: s, passive: a }, l = Sl(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Ur(() => {
    t.removeEventListener(e, l, i);
  });
}
function Z(e, t, n) {
  (t[cr] ??= {})[e] = n;
}
function Ht(e) {
  for (var t = 0; t < e.length; t++)
    Ga.add(e[t]);
  for (var n of vs)
    n(e);
}
let Bs = null;
function ps(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Bs = e;
  var l = 0, c = Bs === e && e[cr];
  if (c) {
    var o = a.indexOf(c);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[cr] = t;
      return;
    }
    var u = a.indexOf(t);
    if (u === -1)
      return;
    o <= u && (l = o);
  }
  if (i = /** @type {Element} */
  a[l] || e.target, i !== t) {
    li(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = me, m = _e;
    kt(null), Xt(null);
    try {
      for (var _, h = []; i !== null && i !== t; ) {
        try {
          var b = i[cr]?.[s];
          b != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && b.call(i, e);
        } catch (w) {
          _ ? h.push(w) : _ = w;
        }
        if (e.cancelBubble) break;
        l++, i = l < a.length ? (
          /** @type {Element} */
          a[l]
        ) : null;
      }
      if (_) {
        for (let w of h)
          queueMicrotask(() => {
            throw w;
          });
        throw _;
      }
    } finally {
      e[cr] = t, delete e.currentTarget, kt(g), Xt(m);
    }
  }
}
const El = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Tl(e) {
  return (
    /** @type {string} */
    El?.createHTML(e) ?? e
  );
}
function Ml(e) {
  var t = fl("template");
  return t.innerHTML = Tl(e.replaceAll("<!>", "<!---->")), t.content;
}
function Dr(e, t) {
  var n = (
    /** @type {Effect} */
    _e
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var n = (t & Li) !== 0, s = (t & Di) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Ml(i ? e : "<!>" + e), n || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Fr(a)));
    var l = (
      /** @type {TemplateNode} */
      s || Ra ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (n) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Fr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      Dr(c, o);
    } else
      Dr(l, l);
    return l;
  };
}
function Wn(e = "") {
  {
    var t = tn(e + "");
    return Dr(t, t), t;
  }
}
function Ps() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = tn();
  return e.append(t, n), Dr(t, n), e;
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
  (e[ds] ??= e.nodeValue) && (e[ds] = n, e.nodeValue = `${n}`);
}
function Al(e, t) {
  return Rl(e, t);
}
const Tr = /* @__PURE__ */ new Map();
function Rl(e, { target: t, anchor: n, props: s = {}, events: a, context: i, intro: l = !0, transformError: c }) {
  ul();
  var o = void 0, u = pl(() => {
    var g = n ?? t.appendChild(tn());
    $i(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (h) => {
        pt({});
        var b = (
          /** @type {ComponentContext} */
          tt
        );
        i && (b.c = i), a && (s.$$events = a), o = e(h, s) || {}, gt();
      },
      c
    );
    var m = /* @__PURE__ */ new Set(), _ = (h) => {
      for (var b = 0; b < h.length; b++) {
        var w = h[b];
        if (!m.has(w)) {
          m.add(w);
          var d = kl(w);
          for (const P of [t, document]) {
            var v = Tr.get(P);
            v === void 0 && (v = /* @__PURE__ */ new Map(), Tr.set(P, v));
            var y = v.get(w);
            y === void 0 ? (P.addEventListener(w, ps, { passive: d }), v.set(w, 1)) : v.set(w, y + 1);
          }
        }
      }
    };
    return _(Br(Ga)), vs.add(_), () => {
      for (var h of m)
        for (const d of [t, document]) {
          var b = (
            /** @type {Map<string, number>} */
            Tr.get(d)
          ), w = (
            /** @type {number} */
            b.get(h)
          );
          --w == 0 ? (d.removeEventListener(h, ps), b.delete(h), b.size === 0 && Tr.delete(d)) : b.set(h, w);
        }
      vs.delete(_), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return Pl.set(o, u), o;
}
let Pl = /* @__PURE__ */ new WeakMap();
class Cl {
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
        Lr(s), this.#l.delete(n);
      else {
        var a = this.#t.get(n);
        a && (Lr(a.effect), this.#r.set(n, a.effect), this.#t.delete(n), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [i, l] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const c = this.#t.get(l);
        c && (ut(c.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#r) {
        if (i === n || this.#l.has(i)) continue;
        const c = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var u = document.createDocumentFragment();
            Rs(l, u), u.append(tn()), this.#t.set(i, { effect: l, fragment: u });
          } else
            ut(l);
          this.#l.delete(i), this.#r.delete(i);
        };
        this.#s || !s ? (this.#l.add(i), Pn(l, c, !1)) : c();
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
      n.includes(s) || (ut(a.effect), this.#t.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var s = (
      /** @type {Batch} */
      Ee
    ), a = Na();
    if (n && !this.#r.has(t) && !this.#t.has(t))
      if (a) {
        var i = document.createDocumentFragment(), l = tn();
        i.append(l), this.#t.set(t, {
          effect: mt(() => n(l)),
          fragment: i
        });
      } else
        this.#r.set(
          t,
          mt(() => n(this.anchor))
        );
    if (this.#e.set(s, t), a) {
      for (const [c, o] of this.#r)
        c === t ? s.unskip_effect(o) : s.skip_effect(o);
      for (const [c, o] of this.#t)
        c === t ? s.unskip_effect(o.effect) : s.skip_effect(o.effect);
      s.oncommit(this.#i), s.ondiscard(this.#n);
    } else
      this.#i(s);
  }
}
function te(e, t, n = !1) {
  var s = new Cl(e), a = n ? Xn : 0;
  function i(l, c) {
    s.ensure(l, c);
  }
  Ms(() => {
    var l = !1;
    t((c, o = 0) => {
      l = !0, i(o, c);
    }), l || i(-1, null);
  }, a);
}
function wt(e, t) {
  return t;
}
function Nl(e, t, n) {
  for (var s = [], a = t.length, i, l = t.length, c = 0; c < a; c++) {
    let m = t[c];
    Pn(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            gs(e, Br(i.done)), _.delete(i), _.size === 0 && (e.outrogroups = null);
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
      var u = (
        /** @type {Element} */
        n
      ), g = (
        /** @type {Element} */
        u.parentNode
      );
      dl(g), g.append(u), e.items.clear();
    }
    gs(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function gs(e, t, n = !0) {
  var s;
  if (e.pending.size > 0) {
    s = /* @__PURE__ */ new Set();
    for (const l of e.pending.values())
      for (const c of l)
        s.add(
          /** @type {EachItem} */
          e.items.get(c).e
        );
  }
  for (var a = 0; a < t.length; a++) {
    var i = t[a];
    if (s?.has(i)) {
      i.f |= Gt;
      const l = document.createDocumentFragment();
      Rs(i, l);
    } else
      ut(t[a], n);
  }
}
var qs;
function Je(e, t, n, s, a, i = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & fa) !== 0;
  if (o) {
    var u = (
      /** @type {Element} */
      e
    );
    l = u.appendChild(tn());
  }
  var g = null, m = /* @__PURE__ */ ya(() => {
    var P = n();
    return (
      /** @type {V[]} */
      ws(P) ? P : P == null ? [] : Br(P)
    );
  }), _, h = /* @__PURE__ */ new Map(), b = !0;
  function w(P) {
    (y.effect.f & vt) === 0 && (y.pending.delete(P), y.fallback = g, Ol(y, _, l, t, s), g !== null && (_.length === 0 ? (g.f & Gt) === 0 ? Lr(g) : (g.f ^= Gt, ur(g, null, l)) : Pn(g, () => {
      g = null;
    })));
  }
  function d(P) {
    y.pending.delete(P);
  }
  var v = Ms(() => {
    _ = /** @type {V[]} */
    r(m);
    for (var P = _.length, z = /* @__PURE__ */ new Set(), B = (
      /** @type {Batch} */
      Ee
    ), G = Na(), J = 0; J < P; J += 1) {
      var ne = _[J], U = s(ne, J), j = b ? null : c.get(U);
      j ? (j.v && $n(j.v, ne), j.i && $n(j.i, J), G && B.unskip_effect(j.e)) : (j = Il(
        c,
        b ? l : qs ??= tn(),
        ne,
        U,
        J,
        a,
        t,
        n
      ), b || (j.e.f |= Gt), c.set(U, j)), z.add(U);
    }
    if (P === 0 && i && !g && (b ? g = mt(() => i(l)) : (g = mt(() => i(qs ??= tn())), g.f |= Gt)), P > z.size && mi(), !b)
      if (h.set(B, z), G) {
        for (const [K, N] of c)
          z.has(K) || B.skip_effect(N.e);
        B.oncommit(w), B.ondiscard(d);
      } else
        w(B);
    r(m);
  }), y = { effect: v, items: c, pending: h, outrogroups: null, fallback: g };
  b = !1;
}
function ir(e) {
  for (; e !== null && (e.f & xt) === 0; )
    e = e.next;
  return e;
}
function Ol(e, t, n, s, a) {
  var i = (s & Ci) !== 0, l = t.length, c = e.items, o = ir(e.effect.first), u, g = null, m, _ = [], h = [], b, w, d, v;
  if (i)
    for (v = 0; v < l; v += 1)
      b = t[v], w = a(b, v), d = /** @type {EachItem} */
      c.get(w).e, (d.f & Gt) === 0 && (d.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(d));
  for (v = 0; v < l; v += 1) {
    if (b = t[v], w = a(b, v), d = /** @type {EachItem} */
    c.get(w).e, e.outrogroups !== null)
      for (const j of e.outrogroups)
        j.pending.delete(d), j.done.delete(d);
    if ((d.f & rt) !== 0 && (Lr(d), i && (d.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(d))), (d.f & Gt) !== 0)
      if (d.f ^= Gt, d === o)
        ur(d, null, n);
      else {
        var y = g ? g.next : o;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), hn(e, g, d), hn(e, d, y), ur(d, y, n), g = d, _ = [], h = [], o = ir(g.next);
        continue;
      }
    if (d !== o) {
      if (u !== void 0 && u.has(d)) {
        if (_.length < h.length) {
          var P = h[0], z;
          g = P.prev;
          var B = _[0], G = _[_.length - 1];
          for (z = 0; z < _.length; z += 1)
            ur(_[z], P, n);
          for (z = 0; z < h.length; z += 1)
            u.delete(h[z]);
          hn(e, B.prev, G.next), hn(e, g, B), hn(e, G, P), o = P, g = G, v -= 1, _ = [], h = [];
        } else
          u.delete(d), ur(d, o, n), hn(e, d.prev, d.next), hn(e, d, g === null ? e.effect.first : g.next), hn(e, g, d), g = d;
        continue;
      }
      for (_ = [], h = []; o !== null && o !== d; )
        (u ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = ir(o.next);
      if (o === null)
        continue;
    }
    (d.f & Gt) === 0 && _.push(d), g = d, o = ir(d.next);
  }
  if (e.outrogroups !== null) {
    for (const j of e.outrogroups)
      j.pending.size === 0 && (gs(e, Br(j.done)), e.outrogroups?.delete(j));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || u !== void 0) {
    var J = [];
    if (u !== void 0)
      for (d of u)
        (d.f & rt) === 0 && J.push(d);
    for (; o !== null; )
      (o.f & rt) === 0 && o !== e.fallback && J.push(o), o = ir(o.next);
    var ne = J.length;
    if (ne > 0) {
      var U = (s & fa) !== 0 && l === 0 ? n : null;
      if (i) {
        for (v = 0; v < ne; v += 1)
          J[v].nodes?.a?.measure();
        for (v = 0; v < ne; v += 1)
          J[v].nodes?.a?.fix();
      }
      Nl(e, J, U);
    }
  }
  i && Qt(() => {
    if (m !== void 0)
      for (d of m)
        d.nodes?.a?.apply();
  });
}
function Il(e, t, n, s, a, i, l, c) {
  var o = (l & Ri) !== 0 ? (l & Ni) === 0 ? /* @__PURE__ */ il(n, !1, !1) : On(n) : null, u = (l & Pi) !== 0 ? On(a) : null;
  return {
    v: o,
    i: u,
    e: mt(() => (i(t, o ?? n, u ?? a, c), () => {
      e.delete(s);
    }))
  };
}
function ur(e, t, n) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, i = t && (t.f & Gt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; s !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ mr(s)
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
  Ts(() => {
    var s = nn(() => t(e, n?.()) || {});
    if (s?.destroy)
      return () => (
        /** @type {Function} */
        s.destroy()
      );
  });
}
const Us = [...` 	
\r\f \v\uFEFF`];
function zl(e, t, n) {
  var s = e == null ? "" : "" + e;
  if (n) {
    for (var a of Object.keys(n))
      if (n[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var i = a.length, l = 0; (l = s.indexOf(a, l)) >= 0; ) {
          var c = l + i;
          (l === 0 || Us.includes(s[l - 1])) && (c === s.length || Us.includes(s[c])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(c + 1) : l = c;
        }
  }
  return s === "" ? null : s;
}
function Ws(e, t = !1) {
  var n = t ? " !important;" : ";", s = "";
  for (var a of Object.keys(e)) {
    var i = e[a];
    i != null && i !== "" && (s += " " + a + ": " + i + n);
  }
  return s;
}
function Fl(e, t) {
  if (t) {
    var n = "", s, a;
    return Array.isArray(t) ? (s = t[0], a = t[1]) : s = t, s && (n += Ws(s)), a && (n += Ws(a, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Ce(e, t, n, s, a, i) {
  var l = (
    /** @type {any} */
    e[cs]
  );
  if (l !== n || l === void 0) {
    var c = zl(n, s, i);
    c == null ? e.removeAttribute("class") : e.className = c, e[cs] = n;
  } else if (i && a !== i)
    for (var o in i) {
      var u = !!i[o];
      (a == null || u !== !!a[o]) && e.classList.toggle(o, u);
    }
  return i;
}
function Qr(e, t = {}, n, s) {
  for (var a in n) {
    var i = n[a];
    t[a] !== i && (n[a] == null ? e.style.removeProperty(a) : e.style.setProperty(a, i, s));
  }
}
function en(e, t, n, s) {
  var a = (
    /** @type {any} */
    e[us]
  );
  if (a !== t) {
    var i = Fl(t, s);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[us] = t;
  } else s && (Array.isArray(s) ? (Qr(e, n?.[0], s[0]), Qr(e, n?.[1], s[1], "important")) : Qr(e, n, s));
  return s;
}
function dr(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ws(t))
      return Bi();
    for (var s of e.options)
      s.selected = t.includes(Ys(s));
    return;
  }
  for (s of e.options) {
    var a = Ys(s);
    if (cl(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Mr(e) {
  var t = new MutationObserver(() => {
    "__value" in e && dr(e, e.__value);
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
  }), Ur(() => {
    t.disconnect();
  });
}
function Ys(e) {
  return "__value" in e ? e.__value : e.value;
}
const Ll = Symbol("is custom element"), Dl = Symbol("is html"), jl = gi ? "progress" : "PROGRESS";
function kn(e, t) {
  var n = Cs(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== jl) || (e.value = t ?? "");
}
function Hl(e, t) {
  var n = Cs(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function pe(e, t, n, s) {
  var a = Cs(e);
  a[t] !== (a[t] = n) && (t === "loading" && (e[pi] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Bl(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Cs(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[da] ??= {
      [Ll]: e.nodeName.includes("-"),
      [Dl]: e.namespaceURI === ji
    }
  );
}
var Gs = /* @__PURE__ */ new Map();
function Bl(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Gs.get(t);
  if (n) return n;
  Gs.set(t, n = []);
  for (var s, a = e, i = Element.prototype; i !== a; ) {
    s = oi(a);
    for (var l in s)
      s[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    a = oa(a);
  }
  return n;
}
class Ns {
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
          Ns.entries.set(n.target, n);
          for (var s of this.#e.get(n.target) || [])
            s(n);
        }
      }
    ));
  }
}
var ql = /* @__PURE__ */ new Ns({
  box: "border-box"
});
function Ks(e, t, n) {
  var s = ql.observe(e, () => n(e[t]));
  Ts(() => (nn(() => n(e[t])), s));
}
function es(e, t) {
  return e === t || e?.[An] === t;
}
function _r(e = {}, t, n, s) {
  var a = (
    /** @type {ComponentContext} */
    tt.r
  ), i = (
    /** @type {Effect} */
    _e
  );
  return Ts(() => {
    var l, c;
    return Ia(() => {
      l = c, c = [], nn(() => {
        es(n(...c), e) || (t(e, ...c), l && es(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== a && o.parent !== null && o.parent.f & os; )
        o = o.parent;
      const u = () => {
        c && es(n(...c), e) && t(null, ...c);
      }, g = o.teardown;
      o.teardown = () => {
        u(), g?.();
      };
    };
  }), e;
}
function Ul(e, t) {
  Ki(window, ["resize"], () => tr(() => t(window[e])));
}
function $(e, t, n, s) {
  var a = !0, i = (n & zi) !== 0, l = (n & Fi) !== 0, c = (
    /** @type {V} */
    s
  ), o = !0, u = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && a ? (u ??= /* @__PURE__ */ pr(
    /** @type {() => V} */
    s
  ), r(u)) : (o && (o = !1, c = l ? nn(
    /** @type {() => V} */
    s
  ) : (
    /** @type {V} */
    s
  )), c);
  let m;
  if (i) {
    var _ = An in e || vi in e;
    m = Yn(e, t)?.set ?? (_ && t in e ? (z) => e[t] = z : void 0);
  }
  var h, b = !1;
  i ? [h, b] = Gi(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && s !== void 0 && (h = g(), m && (Si(), m(h)));
  var w;
  if (w = () => {
    var z = (
      /** @type {V} */
      e[t]
    );
    return z === void 0 ? g() : (o = !0, z);
  }, (n & Ii) === 0)
    return w;
  if (m) {
    var d = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(z, B) {
        return arguments.length > 0 ? ((!B || d || b) && m(B ? w() : z), z) : w();
      })
    );
  }
  var v = !1, y = ((n & Oi) !== 0 ? pr : ya)(() => (v = !1, w()));
  i && r(y);
  var P = (
    /** @type {Effect} */
    _e
  );
  return (
    /** @type {() => V} */
    (function(z, B) {
      if (arguments.length > 0) {
        const G = B ? r(y) : i ? Ie(z) : z;
        return x(y, G), v = !0, c !== void 0 && (c = G), z;
      }
      return sn && v || (P.f & vt) !== 0 ? y.v : r(y);
    })
  );
}
function nr(e) {
  tt === null && _i(), Lt(() => {
    const t = nn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Wl = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Wl);
function Yl(e) {
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
async function Jt(e, t = {}) {
  const n = await fetch(e + Yl(t));
  if (!n.ok) {
    const s = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${s.error ? " (" + s.error + ")" : ""}`);
  }
  return n.json();
}
async function qn(e, t) {
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
function Xs(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const qe = {
  // --- reads
  photos: (e) => Jt("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => Jt("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => Jt("/api/triage/counts", { ...Xs(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Jt("/api/triage/files"),
  screen: (e, t = {}) => Jt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Jt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Jt("/api/triage/page", { ...Xs(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Jt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => qn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => qn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => qn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => qn("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => qn("/api/reveal", { id: e }),
  revealOrigin: (e) => qn("/api/reveal", { origin: e }),
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
  rebuildStatus: () => Jt("/api/triage/rebuild")
};
function Gl() {
  let e = 0, t = 0;
  return async function(s) {
    const a = ++e, i = await s();
    return a <= t ? { stale: !0, value: void 0 } : (t = a, { stale: !1, value: i });
  };
}
function Kl(e, t) {
  let n = 0;
  const s = (...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  };
  return s.cancel = () => clearTimeout(n), s.now = (...a) => {
    clearTimeout(n), e(...a);
  }, s;
}
const Vs = ["B", "KB", "MB", "GB", "TB"];
function Ot(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < Vs.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${Vs[n]}`;
}
function Oe(e) {
  return (Number(e) || 0).toLocaleString();
}
const Zn = "G:\\photos", $s = [
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
      value: t ? `${Zn}\\${t}\\${e.key}` : `${Zn}\\${e.key}`
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
  const n = e.slice(0, t), s = Zn.toLowerCase();
  return n.toLowerCase().startsWith(s + "\\") ? n : "";
}
function Os(e, t) {
  const n = t.toLowerCase();
  return e.some((s) => n === s || n.startsWith(s + "\\"));
}
function Xl(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function Vl(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function Xa(e, t) {
  if (!t) return null;
  const n = e.find(
    (s) => s.term && s.term.column === t.column && s.term.op === t.op && Vl(s.term.value, t.value)
  );
  return n ? n.decision : null;
}
var $l = /* @__PURE__ */ I('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), Jl = /* @__PURE__ */ I('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), Zl = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7">…</div>'), Ql = /* @__PURE__ */ I('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), eo = /* @__PURE__ */ I('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), to = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7"> </div>'), no = /* @__PURE__ */ I('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function ro(e, t) {
  pt(t, !0);
  let n = $(t, "counts", 3, null), s = $(t, "files", 3, null), a = $(t, "filesAt", 3, null), i = $(t, "stale", 3, !1), l = $(t, "candidate", 3, null), c = $(t, "busy", 3, !1);
  const o = /* @__PURE__ */ se(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var u = no(), g = f(u);
  let m;
  var _ = p(f(g), 2);
  {
    var h = (U) => {
      var j = Jl(), K = ct(j), N = f(K), V = f(N), oe = p(N, 2), q = f(oe), ie = p(oe, 4), ae = f(ie), we = p(ie, 2), A = f(we), F = p(K, 2);
      {
        var O = (Y) => {
          var M = $l(), T = p(f(M), 2), H = f(T), ce = p(T, 2), re = f(ce), he = p(ce, 4), ge = f(he), xe = p(he, 2), ye = f(xe), Te = p(xe, 2), Ae = f(Te);
          W(
            (Me, Pe, fe, k, S) => {
              R(H, `kept ${Me ?? ""}`), R(re, Pe), R(ge, `excluded ${fe ?? ""}`), R(ye, k), R(Ae, `${r(o) >= 0 ? "+" : ""}${S ?? ""} excluded`);
            },
            [
              () => Oe(n().candidate_kept_paths),
              () => Ot(n().candidate_kept_bytes),
              () => Oe(n().candidate_excluded_paths),
              () => Ot(n().candidate_excluded_bytes),
              () => Oe(r(o))
            ]
          ), C(Y, M);
        };
        te(F, (Y) => {
          l() && Y(O);
        });
      }
      W(
        (Y, M, T, H) => {
          R(V, `kept ${Y ?? ""}`), R(q, M), R(ae, `excluded ${T ?? ""}`), R(A, H);
        },
        [
          () => Oe(n().kept_paths),
          () => Ot(n().kept_bytes),
          () => Oe(n().excluded_paths),
          () => Ot(n().excluded_bytes)
        ]
      ), C(U, j);
    }, b = (U) => {
      var j = Zl();
      C(U, j);
    };
    te(_, (U) => {
      n() ? U(h) : U(b, -1);
    });
  }
  var w = p(g, 2);
  let d;
  var v = f(w), y = p(f(v), 3), P = f(y), z = p(y, 2);
  {
    var B = (U) => {
      var j = Ql();
      C(U, j);
    };
    te(z, (U) => {
      i() && s() && s() !== "loading" && U(B);
    });
  }
  var G = p(v, 2);
  {
    var J = (U) => {
      var j = eo(), K = ct(j);
      let N;
      var V = f(K), oe = f(V), q = p(V, 2), ie = f(q), ae = p(q, 4), we = f(ae), A = p(ae, 2), F = f(A), O = p(K, 2), Y = f(O);
      W(
        (M, T, H, ce) => {
          N = Ce(K, 1, "line svelte-1vgp6n7", null, N, { outdated: i() }), R(oe, `kept ${M ?? ""}`), R(ie, T), R(we, `excluded ${H ?? ""}`), R(F, ce), R(Y, `as of ${a() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Oe(s().kept_files),
          () => Ot(s().kept_bytes),
          () => Oe(s().excluded_files),
          () => Ot(s().excluded_bytes)
        ]
      ), C(U, j);
    }, ne = (U) => {
      var j = to(), K = f(j);
      W(() => R(K, s() === "loading" ? "counting…" : "not counted yet")), C(U, j);
    };
    te(G, (U) => {
      s() && s() !== "loading" ? U(J) : U(ne, -1);
    });
  }
  W(() => {
    m = Ce(g, 1, "block svelte-1vgp6n7", null, m, { busy: c() }), d = Ce(w, 1, "block svelte-1vgp6n7", null, d, { busy: s() === "loading" }), y.disabled = s() === "loading", R(P, s() === "loading" ? "counting…" : "recount");
  }), Z("click", y, function(...U) {
    t.onfiles?.apply(this, U);
  }), C(e, u), gt();
}
Ht(["click"]);
const _s = "http://www.w3.org/2000/svg", Sn = {
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
}, bn = {
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
}, so = [
  { dark: "tint", light: "tintLight", base: Sn },
  { dark: "control", light: "controlLight", base: bn },
  { dark: "ink", light: "inkLight", base: bn },
  { dark: "tally", light: "tallyLight", base: bn },
  { dark: "tallyInk", light: "tallyInkLight", base: bn }
], bs = /* @__PURE__ */ new Set();
let It = { ...bn };
function ao() {
  return It;
}
function ts(e) {
  It = oo(e), Is();
  for (const t of bs) t(It);
  return It;
}
function io(e) {
  return bs.add(e), () => bs.delete(e);
}
function fr(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function lo(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: Ge(fr(e.r, t.r), 0, 255),
    g: Ge(fr(e.g, t.g), 0, 255),
    b: Ge(fr(e.b, t.b), 0, 255),
    a: Ge(fr(e.a, t.a), 0, 1)
  };
}
function oo(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [s, a] of Object.entries(bn))
    typeof a == "boolean" ? n[s] = t[s] === void 0 ? a : !!t[s] : typeof a == "object" ? n[s] = lo(t[s], a) : n[s] = fr(t[s], a);
  return n;
}
function _t({ r: e, g: t, b: n, a: s }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Fe(s, 3)})`;
}
function Fe(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function Js({ r: e, g: t, b: n, a: s }) {
  return { r: e, g: t, b: n, a: Ge(s * 1.7 + 0.22, 0, 1) };
}
function Zs(e, t) {
  const n = 0.4 + Ge(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - Ge(t, 0, 100) / 100) };
}
function Qs(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, a = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? Ge(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * a * Math.max(t.glareFactor, 0) / 100;
  return Ge(i ** (0.1 + Ge(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const co = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function uo(e, t, n) {
  const s = Ge(n.shapeRoundness, 2, 7), a = e / 2, i = t / 2, l = Math.min(n.shapeRadius, a, i), c = a - l, o = i - l, u = 8, g = [];
  for (let h = 0; h <= u; h++) {
    const b = h / u * (Math.PI / 2);
    g.push([l * Math.cos(b) ** (2 / s), l * Math.sin(b) ** (2 / s)]);
  }
  const m = [], _ = (h, b, w, d) => {
    let v = Math.atan2(h, -b);
    v < 0 && (v += Math.PI * 2);
    let y = Math.atan2(d, w);
    y < 0 && (y += Math.PI * 2);
    const P = Fe(Qs(y, n), 3);
    m.push(`rgba(255, 255, 255, ${P}) ${Fe(v / (Math.PI * 2) * 100, 2)}%`);
  };
  _(0, -i, 0, 1);
  for (const [h, b, w] of co)
    for (let d = 0; d <= u; d++) {
      const [v, y] = g[w ? u - d : d];
      _(h * (c + v), b * (o + y), h * v ** (s - 1), -b * y ** (s - 1));
    }
  return m.push(`rgba(255, 255, 255, ${Fe(Qs(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function Is() {
  const e = It, t = document.documentElement.style, n = Zs(e.refFresnelRange, e.refFresnelHardness), s = Zs(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Fe(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Fe(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", _t(e.tint)), t.setProperty("--glass-tint-light", _t(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", _t(Js(e.tint))), t.setProperty("--glass-tint-sheet-light", _t(Js(e.tintLight))), t.setProperty("--glass-ctl-dark", _t(e.control)), t.setProperty("--glass-ctl-light", _t(e.controlLight)), t.setProperty("--glass-text-dark", _t(e.ink)), t.setProperty("--glass-text-light", _t(e.inkLight)), t.setProperty("--glass-tint-tally-dark", _t(e.tally)), t.setProperty("--glass-tint-tally-light", _t(e.tallyLight)), t.setProperty("--glass-text-tally-dark", _t(e.tallyInk)), t.setProperty("--glass-text-tally-light", _t(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Fe(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Fe(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Fe(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Fe(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Fe(e.shadowX)}px ${Fe(-e.shadowY)}px ${Fe(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Fe(Ge(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Fe(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Fe(Math.log2(Ge(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Fe(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Fe(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Fe(Ge(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Fe(s.width)}px`), t.setProperty("--glass-glare-blur", `${Fe(s.blur)}px`);
}
function Ge(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function fo(e, t, n, s, a, i) {
  const l = Math.abs(e) - n + a, c = Math.abs(t) - s + a, o = Math.max(l, 0), u = Math.max(c, 0), g = i === 2 ? Math.hypot(o, u) : (o ** i + u ** i) ** (1 / i);
  return Math.min(Math.max(l, c), 0) + g - a;
}
function ho(e, t, n) {
  const s = e / 2, a = t / 2, i = Ge(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), c = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), u = (_, h) => fo(_ - s, h - a, s, a, l, i), g = 256, m = new Float32Array(g + 1);
  for (let _ = 0; _ <= g; _++) {
    const h = 1 - _ / g, b = Math.asin(Ge(h * h, 0, 1)), w = Math.asin(Ge(Math.sin(b) / o, 0, 1));
    m[_] = Math.tan(b - w) * c;
  }
  return (_, h) => {
    const b = -u(_, h);
    if (b < 0 || b >= c) return null;
    const w = m[Math.round(b / c * g)];
    if (w === 0) return null;
    const d = 0.75, v = u(_ + d, h) - u(_ - d, h), y = u(_, h + d) - u(_, h - d), P = Math.hypot(v, y);
    if (P === 0) return null;
    const z = -w / P;
    return { dx: v * z, dy: y * z };
  };
}
function vo(e, t, n) {
  const s = document.createElement("canvas");
  s.width = e, s.height = t;
  const a = s.getContext("2d"), i = a.createImageData(e, t), l = i.data, c = e * t, o = new Float32Array(c), u = new Float32Array(c);
  let g = 0;
  for (let _ = 0; _ < t; _++)
    for (let h = 0; h < e; h++) {
      const b = n(h + 0.5, _ + 0.5);
      if (!b) continue;
      const w = _ * e + h;
      o[w] = b.dx, u[w] = b.dy;
      const d = Math.hypot(b.dx, b.dy);
      d > g && (g = d);
    }
  const m = g > 0 ? 127 / g : 0;
  for (let _ = 0; _ < c; _++) {
    const h = _ * 4;
    l[h] = 128 + Ge(Math.round(o[_] * m), -127, 127), l[h + 1] = 128 + Ge(Math.round(u[_] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return a.putImageData(i, 0, 0), { url: s.toDataURL(), scale: g * 2 };
}
const ns = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function rs(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Fe(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let lr = null, po = 0;
function go() {
  if (lr) return lr;
  const e = document.createElementNS(_s, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), lr = document.createElementNS(_s, "defs"), e.appendChild(lr), document.body.appendChild(e), lr;
}
function pn(e) {
  const t = `glass-refract-${++po}`, n = document.createElementNS(_s, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), go().appendChild(n);
  let s = 0, a = 0, i = 0, l = 0;
  const c = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, u = "";
  function g() {
    e.style.setProperty("--glass-pre", It.blurEdge ? "" : u), e.style.setProperty("--glass-post", It.blurEdge ? u : "");
  }
  function m() {
    s < 2 || a < 2 || e.style.setProperty("--glass-glare", uo(s, a, It));
  }
  function _() {
    if (s < 2 || a < 2) return;
    const d = It, v = vo(s, a, ho(s, a, d)), y = d.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(s)), n.setAttribute("height", String(a)), n.innerHTML = `<feImage x="0" y="0" width="${s}" height="${a}" preserveAspectRatio="none" href="${v.url}" result="map"/>` + rs(v.scale * (1 + y), ns[0], "r") + rs(v.scale, ns[1], "g") + rs(v.scale * (1 - y), ns[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, u = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (u = "", g()), o = c.map((P) => It[P]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, _();
    }));
  }
  const b = new ResizeObserver(([d]) => {
    const v = d.borderBoxSize?.[0], y = v ? { w: Math.round(v.inlineSize), h: Math.round(v.blockSize) } : { w: Math.round(d.contentRect.width), h: Math.round(d.contentRect.height) };
    y.w === s && y.h === a || (s = y.w, a = y.h, m(), h());
  });
  b.observe(e);
  const w = io(() => {
    m(), c.map((d) => It[d]).join(" ") !== o ? h() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), b.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const Va = "photos.stack", ss = { on: !1, window: 4 }, $a = 1, Ja = 10;
function _o() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(Va) ?? "");
  } catch {
    return { ...ss };
  }
  if (e === null || typeof e != "object") return { ...ss };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= $a && t <= Ja ? t : ss.window
  };
}
function bo(e) {
  return localStorage.setItem(Va, JSON.stringify({ on: e.on, window: e.window })), e;
}
const Za = "photos.theme", Qa = "dark";
function ei() {
  return document.documentElement.dataset.theme === "light" ? "light" : Qa;
}
function mo() {
  const e = localStorage.getItem(Za), t = e === "dark" || e === "light" ? e : Qa;
  return document.documentElement.dataset.theme = t, t;
}
function ti(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(Za, e), e;
}
var wo = /* @__PURE__ */ I('<div class="glass selected svelte-zne36e"><span class="nums svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span></span> <button class="menu small svelte-zne36e" title="Copy the conditions and the selected ids to the clipboard">Share</button> <button class="menu small svelte-zne36e">Clear</button></div>'), yo = /* @__PURE__ */ I('<span class="spin svelte-zne36e" aria-label="loading"></span>'), ea = /* @__PURE__ */ I('<span class="badge svelte-zne36e"> </span>'), xo = /* @__PURE__ */ I('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), ko = /* @__PURE__ */ I('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), So = /* @__PURE__ */ I("<button> </button>"), Eo = /* @__PURE__ */ I('<div class="glass sheet sorts svelte-zne36e"></div>'), To = /* @__PURE__ */ I(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), Mo = /* @__PURE__ */ I('<p class="muted svelte-zne36e">loading…</p>'), Ao = /* @__PURE__ */ I('<span class="help svelte-zne36e">?</span>'), Ro = /* @__PURE__ */ I('<span class="n svelte-zne36e"> </span>'), Po = /* @__PURE__ */ I("<button> <!></button>"), Co = /* @__PURE__ */ I('<span class="muted svelte-zne36e">nothing here</span>'), No = /* @__PURE__ */ I('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Oo = /* @__PURE__ */ I('<div class="glass sheet filters svelte-zne36e"><!></div>'), Io = /* @__PURE__ */ I('<div class="topbar svelte-zne36e"><div class="panes svelte-zne36e"><!> <div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <button role="switch" title="Select tiles by clicking them, then copy their ids">Select</button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function zo(e, t) {
  pt(t, !0);
  let n = $(t, "facets", 3, null), s = $(t, "filters", 19, () => ({})), a = $(t, "sort", 3, "newest"), i = $(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = $(t, "total", 3, null), c = $(t, "tiles", 3, null), o = $(t, "loading", 3, !1), u = $(t, "selecting", 3, !1), g = $(t, "selectedTally", 19, () => ({ stacks: 0, photos: 0 })), m = $(t, "onfilter", 3, () => {
  }), _ = $(t, "onsort", 3, () => {
  }), h = $(t, "onstack", 3, () => {
  }), b = $(t, "onclear", 3, () => {
  }), w = $(t, "onselecting", 3, () => {
  }), d = $(t, "onshare", 3, () => {
  }), v = $(t, "ondeselect", 3, () => {
  }), y = $(t, "ontriage", 3, () => {
  }), P = /* @__PURE__ */ X(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), z = /* @__PURE__ */ X(Ie(ei())), B = /* @__PURE__ */ X(null);
  const G = /* @__PURE__ */ se(() => c() ?? l()), J = /* @__PURE__ */ se(() => n()?.dimensions ?? []), ne = /* @__PURE__ */ se(() => n()?.sorts ?? []), U = /* @__PURE__ */ se(() => r(ne).find((L) => L.value === a())?.label ?? a()), j = /* @__PURE__ */ se(() => Object.values(s()).reduce((L, le) => L + le.length, 0)), K = /* @__PURE__ */ se(() => r(J).flatMap((L) => (s()[L.name] ?? []).map((le) => ({
    dimension: L.name,
    value: le,
    title: L.title,
    label: L.options.find((be) => be.value === le)?.label ?? String(le)
  }))));
  function N(L, le) {
    const be = s()[L] ?? [], De = be.includes(le) ? be.filter((Re) => Re !== le) : [...be, le];
    m()(L, De);
  }
  function V(L, le) {
    return (s()[L] ?? []).includes(le);
  }
  function oe() {
    x(z, ti(r(z) === "dark" ? "light" : "dark"), !0);
  }
  let q = /* @__PURE__ */ X(null);
  const ie = /* @__PURE__ */ se(() => r(q) ?? i().window);
  function ae(L) {
    x(q, Number(L), !0);
  }
  function we(L) {
    x(q, null), h()({ ...i(), window: Number(L) });
  }
  Lt(() => {
    r(P) !== "stacks" && x(q, null);
  });
  function A(L) {
    L.key === "Escape" && x(P, "");
  }
  function F(L) {
    r(P) && !L.target.closest(".topbar") && x(P, "");
  }
  nr(() => {
    const L = new ResizeObserver(([le]) => {
      const be = Math.round(le.borderBoxSize?.[0]?.blockSize ?? le.contentRect.height);
      document.documentElement.style.setProperty("--header-h", be + "px");
    });
    return L.observe(r(B)), () => {
      L.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var O = Io();
  Mn("keydown", wn, A), Mn("pointerdown", wn, F);
  var Y = f(O), M = f(Y);
  {
    var T = (L) => {
      var le = wo(), be = f(le), De = f(be), Re = f(De), ke = p(De, 2), He = f(ke), Qe = p(ke, 2), $t = f(Qe), ze = p(Qe, 2), ln = f(ze), At = p(be, 2), dt = p(At, 2);
      vn(le, (on) => pn?.(on)), W(
        (on, rr) => {
          R(Re, on), R(He, g().stacks === 1 ? "stack" : "stacks"), R($t, rr), R(ln, g().photos === 1 ? "photo" : "photos");
        },
        [
          () => Oe(g().stacks),
          () => Oe(g().photos)
        ]
      ), Z("click", At, () => d()()), Z("click", dt, () => v()()), C(L, le);
    };
    te(M, (L) => {
      g().stacks && L(T);
    });
  }
  var H = p(M, 2), ce = f(H), re = f(ce), he = p(ce, 2), ge = f(he), xe = p(he, 2);
  {
    var ye = (L) => {
      var le = yo();
      C(L, le);
    };
    te(xe, (L) => {
      o() && L(ye);
    });
  }
  vn(H, (L) => pn?.(L));
  var Te = p(Y, 2), Ae = f(Te), Me = f(Ae), Pe = f(Me);
  let fe;
  var k = f(Pe), S = p(Pe, 2);
  let D;
  var Q = p(f(S));
  {
    var ve = (L) => {
      var le = ea(), be = f(le);
      W(() => R(be, r(j))), C(L, le);
    };
    te(Q, (L) => {
      r(j) && L(ve);
    });
  }
  var ue = p(S, 2);
  let de;
  var Ve = p(f(ue));
  {
    var Bt = (L) => {
      var le = ea(), be = f(le);
      W((De) => R(be, De), [() => Oe(l())]), C(L, le);
    };
    te(Ve, (L) => {
      i().on && l() !== null && L(Bt);
    });
  }
  var $e = p(ue, 2);
  let Ke;
  var St = p($e, 2);
  {
    var qt = (L) => {
      var le = ko(), be = f(le);
      Je(be, 17, () => r(K), (Re) => Re.dimension + " " + Re.value, (Re, ke) => {
        var He = xo(), Qe = f(He), $t = f(Qe), ze = p(Qe, 1, !0);
        W(() => {
          pe(He, "title", `${r(ke).title ?? ""}: ${r(ke).label ?? ""} — click to remove`), R($t, r(ke).title), R(ze, r(ke).label);
        }), Z("click", He, () => N(r(ke).dimension, r(ke).value)), C(Re, He);
      });
      var De = p(be, 2);
      Z("click", De, () => b()()), C(L, le);
    };
    te(St, (L) => {
      r(K).length && L(qt);
    });
  }
  var st = p(Me, 2), Vt = f(st), Ut = p(st, 2);
  vn(Ae, (L) => pn?.(L));
  var Et = p(Ae, 2);
  {
    var Tt = (L) => {
      var le = Eo();
      Je(le, 21, () => r(ne), wt, (be, De) => {
        var Re = So();
        let ke;
        var He = f(Re);
        W(() => {
          ke = Ce(Re, 1, "option svelte-zne36e", null, ke, { on: r(De).value === a() }), R(He, r(De).label);
        }), Z("click", Re, () => {
          _()(r(De).value), x(P, "");
        }), C(be, Re);
      }), vn(le, (be) => pn?.(be)), C(L, le);
    };
    te(Et, (L) => {
      r(P) === "sort" && L(Tt);
    });
  }
  var Ze = p(Et, 2);
  {
    var Mt = (L) => {
      var le = To(), be = f(le), De = p(f(be), 2), Re = f(De);
      let ke;
      var He = f(Re), Qe = p(be, 2), $t = p(f(Qe), 2), ze = f($t), ln = p(ze, 2), At = f(ln);
      vn(le, (dt) => pn?.(dt)), W(() => {
        ke = Ce(Re, 1, "option svelte-zne36e", null, ke, { on: i().on }), pe(Re, "aria-checked", i().on), R(He, i().on ? "On" : "Off"), pe(ze, "min", $a), pe(ze, "max", Ja), kn(ze, r(ie)), pe(ze, "aria-valuetext", `${r(ie) ?? ""} seconds`), R(At, `${r(ie) ?? ""}s`);
      }), Z("click", Re, () => h()({ ...i(), on: !i().on })), Z("input", ze, (dt) => ae(dt.currentTarget.value)), Z("change", ze, (dt) => we(dt.currentTarget.value)), C(L, le);
    };
    te(Ze, (L) => {
      r(P) === "stacks" && L(Mt);
    });
  }
  var Wt = p(Ze, 2);
  {
    var at = (L) => {
      var le = Oo(), be = f(le);
      {
        var De = (ke) => {
          var He = Mo();
          C(ke, He);
        }, Re = (ke) => {
          var He = Ps(), Qe = ct(He);
          Je(Qe, 17, () => r(J), wt, ($t, ze) => {
            var ln = No(), At = f(ln), dt = f(At), on = p(dt);
            {
              var rr = (Rt) => {
                var ft = Ao();
                W(() => pe(ft, "title", r(ze).hint)), C(Rt, ft);
              };
              te(on, (Rt) => {
                r(ze).hint && Rt(rr);
              });
            }
            var Wr = p(At, 2), sr = f(Wr);
            Je(sr, 17, () => r(ze).options, wt, (Rt, ft) => {
              var In = Po();
              let yr;
              var xr = f(In), E = p(xr);
              {
                var ee = (Se) => {
                  var je = Ro(), Be = f(je);
                  W((Pt) => R(Be, Pt), [() => Oe(r(ft).count)]), C(Se, je);
                };
                te(E, (Se) => {
                  r(ft).count !== null && Se(ee);
                });
              }
              W(
                (Se) => {
                  yr = Ce(In, 1, "option svelte-zne36e", null, yr, Se), R(xr, `${r(ft).label ?? ""} `);
                },
                [
                  () => ({ on: V(r(ze).name, r(ft).value) })
                ]
              ), Z("click", In, () => N(r(ze).name, r(ft).value)), C(Rt, In);
            });
            var Yr = p(sr, 2);
            {
              var Gr = (Rt) => {
                var ft = Co();
                C(Rt, ft);
              };
              te(Yr, (Rt) => {
                r(ze).options.length || Rt(Gr);
              });
            }
            W(() => R(dt, `${r(ze).title ?? ""} `)), C($t, ln);
          }), C(ke, He);
        };
        te(be, (ke) => {
          n() ? ke(Re, -1) : ke(De);
        });
      }
      vn(le, (ke) => pn?.(ke)), C(L, le);
    };
    te(Wt, (L) => {
      r(P) === "filters" && L(at);
    });
  }
  _r(O, (L) => x(B, L), () => r(B)), W(
    (L) => {
      R(re, L), R(ge, r(G) === 1 ? "photo" : "photos"), fe = Ce(Pe, 1, "menu svelte-zne36e", null, fe, { open: r(P) === "sort" }), pe(Pe, "aria-expanded", r(P) === "sort"), R(k, r(U)), D = Ce(S, 1, "menu svelte-zne36e", null, D, { open: r(P) === "filters", on: r(j) > 0 }), pe(S, "aria-expanded", r(P) === "filters"), de = Ce(ue, 1, "menu svelte-zne36e", null, de, { open: r(P) === "stacks", on: i().on }), pe(ue, "aria-expanded", r(P) === "stacks"), Ke = Ce($e, 1, "menu svelte-zne36e", null, Ke, { on: u() }), pe($e, "aria-checked", u()), pe(st, "title", r(z) === "dark" ? "Switch to a white background" : "Switch to a black background"), pe(st, "aria-label", r(z) === "dark" ? "Switch to a white background" : "Switch to a black background"), R(Vt, r(z) === "dark" ? "☀" : "☾");
    },
    [() => r(G) === null ? "…" : Oe(r(G))]
  ), Z("click", Pe, () => x(P, r(P) === "sort" ? "" : "sort", !0)), Z("click", S, () => x(P, r(P) === "filters" ? "" : "filters", !0)), Z("click", ue, () => x(P, r(P) === "stacks" ? "" : "stacks", !0)), Z("click", $e, () => w()(!u())), Z("click", st, oe), Z("click", Ut, () => y()()), C(e, O), gt();
}
Ht(["click", "input", "change"]);
const Yt = 4, jr = 220, Fo = 340, gn = 12, ta = Yt + gn, ni = 6, Lo = 5, Do = 0.025, jo = 9;
function Hr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Ho(e, t, n, s, a) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, c = 0, o = 1 / 0;
    for (; l < e.length && (c += Hr(e[l]), l++, o = (n - Yt * (l - i - 1)) / c, !(o <= jr)); )
      ;
    if (o > jr && !s) break;
    a(i, l, Math.round(Math.min(o, Fo))), i = l;
  }
  return i;
}
function ri(e, t, n) {
  const s = [];
  let a = 0;
  for (let i = e.from; i < e.to; i++) {
    const c = i === e.to - 1 ? n - a : Math.round(Hr(t[i]) * e.height);
    s.push({ index: i, x: a, w: c }), a += c + Yt;
  }
  return s;
}
function Bo(e, t) {
  const n = Math.min((e | 0) - 1, ni);
  if (n < 1) return [];
  const s = Math.min(Lo, t * Do), a = [];
  for (let i = 1; i <= n; i++)
    a.push({
      top: Math.round(gn * (n - i) / n),
      inset: Math.round(i * s),
      // Integer percent, so the value lands on the decimal it reads as rather
      // than on whatever a chain of float multiplies leaves behind.
      opacity: (100 - (i - 1) * jo) / 100
    });
  return a;
}
function na(e, t, n, s) {
  const a = ms(e, s.top, s.bottom);
  if (!a) return [];
  const i = [];
  for (let l = a[0]; l <= a[1]; l++) {
    const c = e[l];
    if (!(c.top > s.bottom || c.top + c.height < s.top))
      for (const o of ri(c, t, n))
        o.x <= s.right && o.x + o.w >= s.left && i.push(o.index);
  }
  return i;
}
function ms(e, t, n) {
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
var qo = /* @__PURE__ */ I('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), Uo = /* @__PURE__ */ I('<div role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Previous tile" aria-label="Previous tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M14.5 5 7.5 12l7 7"></path></svg></button></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Next tile" aria-label="Next tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M9.5 5l7 7-7 7"></path></svg></button></div></div>');
function Wo(e, t) {
  pt(t, !0);
  let n = $(t, "frames", 19, () => []), s = $(t, "origin", 3, null), a = $(t, "back", 3, !1), i = $(t, "forward", 3, !1), l = $(t, "onstep", 3, () => {
  }), c = $(t, "onreveal", 3, () => {
  }), o = $(t, "onclose", 3, () => {
  });
  const u = 40, g = 72, m = /* @__PURE__ */ se(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let _ = /* @__PURE__ */ X(Ie(document.documentElement.clientWidth)), h = /* @__PURE__ */ X(Ie(document.documentElement.clientHeight)), b = /* @__PURE__ */ X(null), w = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Set()));
  const d = 4, v = 25, y = { x: 0, y: 0, w: 0, h: 0 }, P = /* @__PURE__ */ se(() => Math.max(0, r(_) - g * 2)), z = /* @__PURE__ */ se(() => Math.max(0, r(h) - u * 2)), B = /* @__PURE__ */ se(() => r(P) > 0 && r(z) > 0 ? U(n(), r(P), r(z)) : n().map(() => y));
  function G(T, H, ce) {
    const re = [];
    let he = 0, ge = 0;
    for (let xe = 0; xe < T.length; xe++)
      ge += Hr(T[xe]), ge * ce + Yt * (xe - he) >= H && (re.push({ from: he, to: xe + 1, sum: ge }), he = xe + 1, ge = 0);
    return he < T.length && re.push({ from: he, to: T.length, sum: ge }), re;
  }
  function J(T, H, ce) {
    return T.map((re, he) => {
      const ge = (H - Yt * (re.to - re.from - 1)) / re.sum;
      return he === T.length - 1 && ge > ce ? ce : ge;
    });
  }
  function ne(T, H, ce) {
    return J(T, H, ce).reduce((re, he) => re + he, 0) + Yt * (T.length - 1);
  }
  function U(T, H, ce) {
    let re = d, he = Math.max(d, ce);
    for (let Ae = 0; Ae < v; Ae++) {
      const Me = (re + he) / 2;
      ne(G(T, H, Me), H, Me) <= ce ? re = Me : he = Me;
    }
    const ge = G(T, H, re), xe = J(ge, H, re), ye = [];
    let Te = (ce - (xe.reduce((Ae, Me) => Ae + Me, 0) + Yt * (ge.length - 1))) / 2;
    return ge.forEach((Ae, Me) => {
      const Pe = xe[Me], fe = [];
      for (let D = Ae.from; D < Ae.to; D++) fe.push(Hr(T[D]) * Pe);
      const k = fe.reduce((D, Q) => D + Q, 0) + Yt * (fe.length - 1);
      let S = (H - k) / 2;
      for (const D of fe)
        ye.push({
          x: Math.round(S),
          y: Math.round(Te),
          w: Math.round(D),
          h: Math.round(Pe)
        }), S += D + Yt;
      Te += Pe + Yt;
    }), ye;
  }
  function j(T) {
    if (!s() || !T || !T.w || !T.h) return "none";
    const H = s().left - (g + T.x), ce = s().top - (u + T.y);
    return `translate(${H}px, ${ce}px) scale(${s().width / T.w}, ${s().height / T.h})`;
  }
  const K = 1600;
  let N = /* @__PURE__ */ X(!1), V = 0;
  function oe() {
    x(N, !1), clearTimeout(V), V = setTimeout(() => x(N, !0), K);
  }
  function q(T) {
    if (T.key === "Escape") {
      o()();
      return;
    }
    T.key !== "ArrowLeft" && T.key !== "ArrowRight" || (T.preventDefault(), l()(T.key === "ArrowLeft" ? -1 : 1, T.repeat));
  }
  function ie(T) {
    T.target.closest(".frame, .lane") || o()();
  }
  nr(() => (r(b)?.focus(), oe(), () => clearTimeout(V)));
  var ae = Uo();
  Mn("keydown", wn, q), Mn("pointerdown", wn, ie), Mn("pointermove", wn, oe);
  let we;
  var A = f(ae);
  en(A, "", {}, { inset: "40px 72px" }), Je(A, 23, n, (T) => T.id, (T, H, ce) => {
    var re = qo();
    let he;
    var ge = f(re);
    let xe;
    W(
      (ye, Te) => {
        he = en(re, "", he, ye), pe(ge, "src", `/d/${r(H).s ?? ""}.webp`), xe = Ce(ge, 1, "svelte-5g1i2z", null, xe, Te);
      },
      [
        () => ({
          left: `${r(B)[r(ce)].x ?? ""}px`,
          top: `${r(B)[r(ce)].y ?? ""}px`,
          width: `${r(B)[r(ce)].w ?? ""}px`,
          height: `${r(B)[r(ce)].h ?? ""}px`,
          "--flight": j(r(B)[r(ce)])
        }),
        () => ({ loaded: r(w).has(r(H).id) })
      ]
    ), Z("click", re, () => c()(r(H))), Mn("load", ge, () => x(w, new Set(r(w)).add(r(H).id), !0)), C(T, re);
  });
  var F = p(A, 2);
  en(F, "", {}, { width: "44px", left: "14px" });
  var O = f(F);
  vn(O, (T) => pn?.(T));
  var Y = p(F, 2);
  en(Y, "", {}, { width: "44px", right: "14px" });
  var M = f(Y);
  vn(M, (T) => pn?.(T)), _r(ae, (T) => x(b, T), () => r(b)), W(() => {
    we = Ce(ae, 1, "glass pane svelte-5g1i2z", null, we, { resting: r(N) }), pe(ae, "aria-label", r(m)), O.disabled = !a(), M.disabled = !i();
  }), Z("click", O, () => l()(-1)), Z("click", M, () => l()(1)), Ks(ae, "clientWidth", (T) => x(_, T)), Ks(ae, "clientHeight", (T) => x(h, T)), C(e, ae), gt();
}
Ht(["click"]);
var Yo = /* @__PURE__ */ I('<span class="err svelte-uzy12d"> </span>'), Go = /* @__PURE__ */ I(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Ko = /* @__PURE__ */ I(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), Xo = /* @__PURE__ */ I('<span class="muted svelte-uzy12d"> </span>'), Vo = /* @__PURE__ */ I('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function $o(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ X(null), s = /* @__PURE__ */ X(!1), a = /* @__PURE__ */ X(null);
  async function i() {
    x(s, !0), x(a, null);
    try {
      x(n, await qe.probe(), !0);
    } catch (h) {
      x(a, String(h), !0);
    } finally {
      x(s, !1);
    }
  }
  var l = Vo(), c = f(l), o = f(c), u = p(c, 2);
  {
    var g = (h) => {
      var b = Yo(), w = f(b);
      W(() => R(w, r(a))), C(h, b);
    }, m = (h) => {
      var b = Ps(), w = ct(b);
      {
        var d = (y) => {
          var P = Go(), z = p(f(P), 2);
          W(
            (B) => R(z, ` above are formats the header
        reader cannot measure (${B ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), C(y, P);
        }, v = (y) => {
          var P = Ko(), z = f(P), B = f(z), G = p(z, 2), J = f(G);
          W(
            (ne) => {
              R(B, ne), R(J, r(n).command);
            },
            [() => Oe(r(n).worklist)]
          ), C(y, P);
        };
        te(w, (y) => {
          r(n).worklist === 0 ? y(d) : y(v, -1);
        });
      }
      C(h, b);
    }, _ = (h) => {
      var b = Xo(), w = f(b);
      W(() => R(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), C(h, b);
    };
    te(u, (h) => {
      r(a) ? h(g) : r(n) ? h(m, 1) : h(_, -1);
    });
  }
  W(() => {
    c.disabled = r(s), R(o, r(s) ? "counting…" : "Check the dimension probe's worklist");
  }), Z("click", c, i), C(e, l), gt();
}
Ht(["click"]);
var Jo = /* @__PURE__ */ I('<p class="bad svelte-1xjbga"> </p>'), Zo = /* @__PURE__ */ I('<pre class="svelte-1xjbga"> </pre>'), Qo = /* @__PURE__ */ I('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), ec = /* @__PURE__ */ I(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), tc = /* @__PURE__ */ I('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), nc = /* @__PURE__ */ I('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), rc = /* @__PURE__ */ I(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), sc = /* @__PURE__ */ I('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), ac = /* @__PURE__ */ I(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function ic(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ X(null), s = /* @__PURE__ */ X(!1), a = /* @__PURE__ */ X(null), i = /* @__PURE__ */ X(null);
  const l = /* @__PURE__ */ se(() => r(n)?.state === "running"), c = /* @__PURE__ */ se(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const y = await qe.rebuildStatus();
      x(n, y, !0), x(a, null), y.state === "done" && y.started_at !== r(i) && (x(i, y.started_at, !0), t.oncomplete?.());
    } catch (y) {
      x(a, String(y), !0);
    }
  }
  nr(() => {
    o();
  }), Lt(() => {
    if (!r(l)) return;
    const y = setInterval(o, 700);
    return () => clearInterval(y);
  });
  async function u() {
    x(s, !0), x(a, null);
    try {
      x(n, await qe.rebuild(), !0);
    } catch (y) {
      x(a, String(y), !0);
    }
  }
  function g(y) {
    y.key === "Escape" && x(s, !1);
  }
  var m = ac();
  Mn("keydown", wn, g);
  var _ = ct(m), h = f(_), b = f(h), w = p(h, 2), d = p(_, 2);
  {
    var v = (y) => {
      var P = sc(), z = ct(P), B = p(z, 2), G = f(B), J = p(f(G), 4), ne = f(J), U = p(J, 2), j = p(G, 2);
      {
        var K = (A) => {
          var F = Jo(), O = f(F);
          W(() => R(O, r(a))), C(A, F);
        };
        te(j, (A) => {
          r(a) && A(K);
        });
      }
      var N = p(j, 2);
      Je(N, 17, () => r(n)?.steps ?? [], wt, (A, F) => {
        var O = Qo();
        let Y;
        var M = f(O), T = f(M), H = f(T);
        {
          var ce = (fe) => {
            var k = Wn("✓");
            C(fe, k);
          }, re = (fe) => {
            var k = Wn("✕");
            C(fe, k);
          }, he = (fe) => {
            var k = Wn("·");
            C(fe, k);
          }, ge = (fe) => {
            var k = Wn(" ");
            C(fe, k);
          };
          te(H, (fe) => {
            r(F).state === "done" ? fe(ce) : r(F).state === "failed" ? fe(re, 1) : r(F).state === "running" ? fe(he, 2) : fe(ge, -1);
          });
        }
        var xe = p(T, 2), ye = f(xe), Te = p(xe, 4), Ae = f(Te), Me = p(M, 2);
        {
          var Pe = (fe) => {
            var k = Zo(), S = f(k);
            W((D) => R(S, D), [() => r(F).log.join(`
`)]), C(fe, k);
          };
          te(Me, (fe) => {
            r(F).log.length && fe(Pe);
          });
        }
        W(() => {
          Y = Ce(O, 1, "step svelte-1xjbga", null, Y, {
            on: r(F).state === "running",
            bad: r(F).state === "failed"
          }), R(ye, r(F).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), R(Ae, r(F).seconds === null ? "" : r(F).seconds + "s");
        }), C(A, O);
      });
      var V = p(N, 2);
      {
        var oe = (A) => {
          var F = ec(), O = ct(F), Y = f(O);
          W(() => R(Y, r(n).error)), C(A, F);
        }, q = (A) => {
          var F = tc();
          C(A, F);
        }, ie = (A) => {
          var F = nc();
          C(A, F);
        };
        te(V, (A) => {
          r(n)?.state === "failed" ? A(oe) : r(n)?.state === "done" ? A(q, 1) : r(l) && A(ie, 2);
        });
      }
      var ae = p(V, 2);
      {
        var we = (A) => {
          var F = rc(), O = p(f(F), 6), Y = f(O);
          W(() => R(Y, `python -m photolib.restore_state ${r(c) ?? ""}`)), C(A, F);
        };
        te(ae, (A) => {
          r(c) && A(we);
        });
      }
      W(() => R(ne, `${r(n)?.seconds ?? 0 ?? ""}s`)), Z("click", z, () => x(s, !1)), Z("click", U, () => x(s, !1)), C(y, P);
    };
    te(d, (y) => {
      r(s) && y(v);
    });
  }
  W(() => {
    h.disabled = r(l), R(b, r(l) ? "applying…" : "Apply to grid"), w.disabled = !r(n) || r(n).state === "idle";
  }), Z("click", h, u), Z("click", w, () => x(s, !0)), C(e, m), gt();
}
Ht(["click"]);
var lc = /* @__PURE__ */ I('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), ra = /* @__PURE__ */ I("<option> </option>"), oc = /* @__PURE__ */ I('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), cc = /* @__PURE__ */ I('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), uc = /* @__PURE__ */ I('<div class="none muted svelte-bqi9ky"> </div>'), dc = /* @__PURE__ */ I('<div class="bar svelte-bqi9ky"><!></div>');
function fc(e, t) {
  pt(t, !0);
  let n = $(t, "candidate", 3, null), s = $(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), c = /* @__PURE__ */ se(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ se(() => !!n() && n().op !== "is null");
  function u(w, d) {
    const v = { ...n(), [w]: d };
    if (w === "column") {
      const y = i[d] ?? ["="];
      y.includes(v.op) || (v.op = y[0]), v.value = l.has(d) ? 0 : "";
    }
    w === "op" && d === "is null" && (v.value = null), w === "value" && l.has(v.column) && (v.value = Number(d) || 0), t.onedit(v);
  }
  var g = dc(), m = f(g);
  {
    var _ = (w) => {
      var d = lc(), v = f(d), y = f(v), P = p(v, 2), z = f(P);
      W(() => {
        R(y, `${t.screen.title ?? ""} does not save a rule.`), R(z, t.screen.blurb);
      }), C(w, d);
    }, h = (w) => {
      var d = cc(), v = ct(d), y = f(v);
      Je(y, 21, () => a, wt, (O, Y) => {
        var M = ra(), T = f(M), H = {};
        W(() => {
          R(T, r(Y)), H !== (H = r(Y)) && (M.value = (M.__value = r(Y)) ?? "");
        }), C(O, M);
      });
      var P;
      Mr(y);
      var z = p(y, 2);
      Je(z, 21, () => r(c), wt, (O, Y) => {
        var M = ra(), T = f(M), H = {};
        W(() => {
          R(T, r(Y)), H !== (H = r(Y)) && (M.value = (M.__value = r(Y)) ?? "");
        }), C(O, M);
      });
      var B;
      Mr(z);
      var G = p(z, 2);
      {
        var J = (O) => {
          var Y = oc();
          W(() => kn(Y, n().value ?? "")), Z("input", Y, (M) => u("value", M.currentTarget.value)), C(O, Y);
        };
        te(G, (O) => {
          r(o) && O(J);
        });
      }
      var ne = p(G, 2), U = f(ne);
      U.value = U.__value = "exclude";
      var j = p(U);
      j.value = j.__value = "include";
      var K;
      Mr(ne);
      var N = p(ne, 2), V = f(N);
      V.value = V.__value = "end";
      var oe = p(V);
      oe.value = oe.__value = "0";
      var q;
      Mr(N);
      var ie = p(N, 2), ae = f(ie), we = p(ie, 2), A = p(v, 2), F = f(A);
      W(
        (O, Y) => {
          P !== (P = n().column) && (y.value = (y.__value = n().column) ?? "", dr(y, n().column)), B !== (B = n().op) && (z.value = (z.__value = n().op) ?? "", dr(z, n().op)), K !== (K = n().decision ?? "exclude") && (ne.value = (ne.__value = n().decision ?? "exclude") ?? "", dr(ne, n().decision ?? "exclude")), q !== (q = O) && (N.value = (N.__value = O) ?? "", dr(N, O)), ie.disabled = s(), R(ae, s() ? "saving…" : "Confirm"), R(F, `${Y ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Xl(n())
        ]
      ), Z("change", y, (O) => u("column", O.currentTarget.value)), Z("change", z, (O) => u("op", O.currentTarget.value)), Z("change", ne, (O) => u("decision", O.currentTarget.value)), Z("change", N, (O) => u("at", O.currentTarget.value)), Z("click", ie, function(...O) {
        t.onconfirm?.apply(this, O);
      }), Z("click", we, function(...O) {
        t.onclear?.apply(this, O);
      }), C(w, d);
    }, b = (w) => {
      var d = uc(), v = f(d);
      W(() => R(v, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), C(w, d);
    };
    te(m, (w) => {
      t.screen.rule === !1 ? w(_) : n() ? w(h, 1) : w(b, -1);
    });
  }
  C(e, g), gt();
}
Ht(["change", "input", "click"]);
var hc = /* @__PURE__ */ I('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), vc = /* @__PURE__ */ I('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), pc = /* @__PURE__ */ I('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), gc = /* @__PURE__ */ I('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function _c(e, t) {
  pt(t, !0);
  let n = $(t, "rules", 19, () => []), s = $(t, "unmatched", 3, null), a = $(t, "busy", 3, !1);
  var i = gc(), l = f(i), c = p(f(l)), o = f(c), u = p(l, 2);
  {
    var g = (b) => {
      var w = hc();
      C(b, w);
    };
    te(u, (b) => {
      n().length === 0 && b(g);
    });
  }
  var m = p(u, 2);
  Je(m, 19, n, (b) => b.id, (b, w, d) => {
    var v = vc();
    let y;
    var P = f(v), z = f(P), B = f(z), G = p(z, 2), J = f(G), ne = p(G, 2), U = f(ne), j = p(P, 2), K = f(j), N = f(K), V = p(K, 2), oe = f(V), q = p(V, 4), ie = p(q, 2), ae = p(ie, 2);
    W(
      (we, A) => {
        y = Ce(v, 1, "rule svelte-aof9c2", null, y, { exclude: r(w).decision === "exclude" }), R(B, r(d)), R(J, r(w).predicate), R(U, r(w).decision), R(N, `${we ?? ""} paths`), R(oe, A), q.disabled = a() || r(d) === 0, ie.disabled = a() || r(d) === n().length - 1, ae.disabled = a();
      },
      [
        () => Oe(r(w).paths),
        () => Ot(r(w).bytes)
      ]
    ), Z("click", q, () => t.onmove(r(w), r(d) - 1)), Z("click", ie, () => t.onmove(r(w), r(d) + 1)), Z("click", ae, () => t.ondelete(r(w))), C(b, v);
  });
  var _ = p(m, 2);
  {
    var h = (b) => {
      var w = pc(), d = p(f(w), 2), v = f(d), y = f(v), P = p(v, 2), z = f(P);
      W(
        (B, G) => {
          R(y, `${B ?? ""} paths`), R(z, G);
        },
        [
          () => Oe(s().paths),
          () => Ot(s().bytes)
        ]
      ), C(b, w);
    };
    te(_, (b) => {
      s() && b(h);
    });
  }
  W(() => R(o, `${n().length ?? ""} rules · top-down, first match wins`)), C(e, i), gt();
}
Ht(["click"]);
function as(e) {
  return { key: e.id, ids: (e.m ?? [e]).map((t) => t.id) };
}
function bc(e, t) {
  const n = e.filter((s) => s.key !== t.key);
  return n.length === e.length ? [...e, t] : n;
}
function sa(e, t, n) {
  if (!n) {
    const a = new Set(t.map((i) => i.key));
    return e.filter((i) => !a.has(i.key));
  }
  const s = new Set(e.map((a) => a.key));
  return [...e, ...t.filter((a) => !s.has(a.key))];
}
function mc(e) {
  return {
    stacks: e.length,
    photos: e.reduce((t, n) => t + n.ids.length, 0)
  };
}
function wc(e) {
  const t = e.stacking.on ? e.stacking.window + "s" : "off", n = Object.entries(e.filters).filter(([, s]) => s.length > 0).sort(([s], [a]) => s < a ? -1 : s > a ? 1 : 0).map(([s, a]) => s + ":" + a.join("|"));
  return `stack=${t} sort=${e.sort} filters=${n.length ? n.join(",") : "none"}`;
}
function yc(e, t) {
  const n = t.map((s) => "[" + s.ids.join(",") + "]").join(",");
  return wc(e) + `
` + n;
}
const aa = 2500, xc = 1, kc = 2, ia = 4, Sc = 3e7, xn = /* @__PURE__ */ new WeakMap();
function la(e) {
  return xn.get(e).photo.getBoundingClientRect();
}
function Ec(e, t, n) {
  const s = [], a = [], i = /* @__PURE__ */ new Map(), l = [], c = [];
  let o = 0, u = gn, g = null, m = null, _ = null, h = !1, b = !1, w = 0, d = 0, v = 0, y = n.onState || (() => {
  });
  function P(k) {
    w <= 0 || (o = Ho(s, o, w, k, (S, D, Q) => {
      a.push({ top: u, height: Q, from: S, to: D }), u += Q + ta;
    }), B());
  }
  function z() {
    if (m === null || h || w <= 0 || o >= m) return 0;
    const k = a.length ? o / a.length : Math.max(1, w / jr), S = a.length ? (u - gn) / a.length : jr + ta, D = Math.round((m - o) / k * S);
    return Math.max(0, Math.min(D, Sc - u));
  }
  function B() {
    e.style.height = u + z() + "px", t.style.top = Math.max(0, u - 1) + "px";
  }
  function G() {
    return window.scrollY - e.offsetTop;
  }
  function J() {
    const k = l.pop();
    if (k) return k;
    const S = document.createElement("div");
    S.className = "tile", S.tabIndex = -1;
    const D = document.createElement("div");
    D.className = "deck", D.style.height = gn + "px";
    const Q = [];
    for (let de = 0; de < ni; de++) {
      const Ve = document.createElement("div");
      Ve.className = "card", Ve.hidden = !0, Q.push(Ve);
    }
    for (let de = Q.length - 1; de >= 0; de--) D.appendChild(Q[de]);
    S.appendChild(D);
    const ve = document.createElement("div");
    ve.className = "tile-photo";
    const ue = document.createElement("img");
    return ue.decoding = "async", ue.draggable = !1, ue.addEventListener("load", () => S.classList.add("loaded")), ue.addEventListener("error", () => S.classList.add("missing")), ve.appendChild(ue), S.appendChild(ve), xn.set(S, { img: ue, photo: ve, strip: D, cards: Q, above: 0 }), n.extend && n.extend(S), S;
  }
  function ne(k, S) {
    const { img: D, photo: Q } = xn.get(S);
    D.removeAttribute("src"), S.classList.remove("loaded", "missing", "error"), Q.style.backgroundImage = "", S.remove(), i.delete(k), l.push(S);
  }
  function U(k, S, D) {
    const Q = xn.get(k), ve = Bo(S.n, D);
    Q.above = ve.length ? gn : 0, Q.strip.hidden = ve.length === 0;
    for (let ue = 0; ue < Q.cards.length; ue++) {
      const de = ve[ue];
      Q.cards[ue].hidden = de === void 0, de !== void 0 && (Q.cards[ue].style.top = de.top + "px", Q.cards[ue].style.left = de.inset + "px", Q.cards[ue].style.right = de.inset + "px", Q.cards[ue].style.opacity = String(de.opacity));
    }
  }
  function j(k, S, D, Q, ve, ue) {
    let de = i.get(k);
    const Ve = s[k];
    if (!de) {
      de = J(), de.dataset.index = String(k);
      const Ke = xn.get(de).img;
      U(de, Ve, Q), Ke.fetchPriority = ue ? "high" : "low", Ke.src = "/t/" + Ve.s + ".webp", c.push(k), n.fill && n.fill(de, Ve), e.appendChild(de), i.set(k, de);
    }
    const { above: Bt, photo: $e } = xn.get(de);
    de.style.width = Q + "px", de.style.height = ve + Bt + "px", de.style.transform = "translate(" + S + "px," + (D - Bt) + "px)", $e.style.height = ve + "px";
  }
  function K(k, S) {
    S.th && (S.url === void 0 && (S.url = n.thumbHash(S.th)), S.url && (xn.get(k).photo.style.backgroundImage = "url(" + S.url + ")"));
  }
  function N() {
    v = 0;
    for (const k of c) {
      const S = i.get(k);
      S && !S.classList.contains("loaded") && K(S, s[k]);
    }
    c.length = 0;
  }
  function V(k, S) {
    for (const D of ri(k, s, w))
      j(D.index, D.x, k.top, D.w, k.height, S);
  }
  function oe() {
    const k = window.innerHeight, S = G(), D = ms(a, S - k * xc, S + k * (1 + kc));
    if (!D) return;
    const Q = a[D[0]].from, ve = a[D[1]].to;
    for (const [ue, de] of Array.from(i))
      (ue < Q || ue >= ve) && ne(ue, de);
    for (let ue = D[0]; ue <= D[1]; ue++) {
      const de = a[ue];
      V(de, de.top < S + k && de.top + de.height > S);
    }
    c.length && !v && (v = requestAnimationFrame(N));
  }
  function q() {
    return w <= 0 ? !1 : u - (G() + window.innerHeight) < aa;
  }
  let ie = Promise.resolve();
  function ae() {
    return b || h || (b = !0, ie = we()), ie;
  }
  async function we() {
    const k = d;
    y({ loading: !0, count: s.length, exhausted: h, total: m, tiles: _ });
    try {
      do {
        const S = await n.fetchPage(g);
        if (k !== d) return;
        for (const D of S.photos) s.push(D);
        g = S.next, h = g === null, typeof S.stacks == "number" ? (m = S.stacks, _ = typeof S.total == "number" ? S.total : null) : typeof S.total == "number" && (m = S.total), P(h), oe(), y({ loading: !0, count: s.length, exhausted: h, total: m, tiles: _ });
      } while (!h && q());
    } catch (S) {
      k === d && y({ error: String(S) });
    } finally {
      k === d && (b = !1, y({ loading: !1, count: s.length, exhausted: h, total: m, tiles: _ }));
    }
  }
  let A = 0;
  function F() {
    A || (A = requestAnimationFrame(() => {
      A = 0, oe(), M && ge(), q() && ae();
    }));
  }
  function O() {
    const k = e.clientWidth;
    if (k === w) return;
    const S = ms(a, G(), G()), D = S ? a[S[0]].from : 0;
    w = k;
    for (const [ve, ue] of Array.from(i)) ne(ve, ue);
    a.length = 0, o = 0, u = gn, P(h), oe();
    const Q = a.find((ve) => ve.to > D);
    Q && window.scrollTo(0, Q.top + e.offsetTop), q() && ae();
  }
  let Y = !1, M = null, T = 0, H = null, ce = !1;
  function re(k, S) {
    const D = e.getBoundingClientRect();
    return { x: k - D.left, y: S - D.top };
  }
  function he(k) {
    H || (H = document.createElement("div"), H.className = "marquee", e.appendChild(H)), H.hidden = !1, H.style.width = k.right - k.left + "px", H.style.height = k.bottom - k.top + "px", H.style.transform = "translate(" + k.left + "px," + k.top + "px)";
  }
  function ge() {
    if (!M) return;
    const { x: k, y: S } = re(M.cx, M.cy);
    if (!M.live) {
      if (Math.abs(k - M.ax) < ia && Math.abs(S - M.ay) < ia) return;
      M.live = !0, n.sweepStart(M.index === null ? null : s[M.index], M.index);
    }
    const D = {
      left: Math.min(M.ax, k),
      right: Math.max(M.ax, k),
      top: Math.min(M.ay, S),
      bottom: Math.max(M.ay, S)
    };
    he(D), n.sweepMove(na(a, s, w, D).map((Q) => s[Q]));
  }
  function xe(k) {
    if (ce = !1, !Y || k.button !== 0 || k.shiftKey) return;
    const { x: S, y: D } = re(k.clientX, k.clientY), Q = na(a, s, w, { left: S, top: D, right: S, bottom: D });
    M = {
      ax: S,
      ay: D,
      cx: k.clientX,
      cy: k.clientY,
      index: Q.length ? Q[0] : null,
      live: !1
    }, window.addEventListener("pointermove", ye), window.addEventListener("pointerup", Te), window.addEventListener("pointercancel", Te);
  }
  function ye(k) {
    M && (M.cx = k.clientX, M.cy = k.clientY, !T && (T = requestAnimationFrame(() => {
      T = 0, ge();
    })));
  }
  function Te(k) {
    if (!M) return;
    window.removeEventListener("pointermove", ye), window.removeEventListener("pointerup", Te), window.removeEventListener("pointercancel", Te), cancelAnimationFrame(T), T = 0, M.cx = k.clientX, M.cy = k.clientY, ge();
    const S = M.live;
    M = null, H && (H.hidden = !0), S && (ce = !0, n.sweepEnd());
  }
  e.addEventListener("pointerdown", xe);
  function Ae(k) {
    if (ce) {
      ce = !1;
      return;
    }
    const S = k.target.closest(".tile");
    if (!S || !e.contains(S)) return;
    const D = Number(S.dataset.index), Q = s[D];
    Q && n.activate && n.activate(Q, k, S, D);
  }
  e.addEventListener("click", Ae), window.addEventListener("scroll", F, { passive: !0 });
  let Me = 0;
  const Pe = new ResizeObserver(() => {
    clearTimeout(Me), Me = setTimeout(O, 100);
  });
  Pe.observe(e);
  const fe = new IntersectionObserver(
    (k) => {
      k.some((S) => S.isIntersecting) && ae();
    },
    { rootMargin: "0px 0px " + aa + "px 0px" }
  );
  return fe.observe(t), w = e.clientWidth, ae(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      d++, b = !1;
      for (const [k, S] of Array.from(i)) ne(k, S);
      s.length = 0, a.length = 0, c.length = 0, o = 0, u = gn, g = null, m = null, _ = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), ae();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(k) {
      const S = typeof k == "number" ? k : null;
      S !== m && (m = S, B(), y({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [k, S] of i) n.fill(S, s[k]);
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
        const ve = o;
        if (await ae(), o === ve) break;
      }
      const S = a.find((ve) => ve.to > k);
      if (!S) return null;
      const D = Math.max(0, (window.innerHeight - S.height) / 2);
      window.scrollTo(0, Math.max(0, e.offsetTop + S.top - D)), oe();
      const Q = i.get(k);
      return Q ? { item: s[k], tile: Q } : null;
    },
    // Put the keyboard back on a tile. The overlay hands focus back on the way
    // out, and after a walk that is a different tile from the one it opened on.
    focus(k) {
      i.get(k)?.focus();
    },
    // Whether a press on the canvas rubber-bands. Select mode turns on and off
    // under a sheet that outlives the toggle, exactly as the tickboxes do.
    setSweeping(k) {
      Y = k;
    },
    // The items between two indices, inclusive, in the order the sheet holds
    // them — which is the order the grid is sorted in. Shift-click's range: the
    // gesture knows two tiles and this is what lies between them.
    itemsBetween(k, S) {
      return s.slice(Math.min(k, S), Math.max(k, S) + 1);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(k) {
      for (const [S, D] of i)
        s[S] === k && n.fill && n.fill(D, k);
    },
    destroy() {
      d++, e.removeEventListener("click", Ae), e.removeEventListener("pointerdown", xe), window.removeEventListener("pointermove", ye), window.removeEventListener("pointerup", Te), window.removeEventListener("pointercancel", Te), window.removeEventListener("scroll", F), Pe.disconnect(), fe.disconnect(), clearTimeout(Me), cancelAnimationFrame(v), cancelAnimationFrame(T), H?.remove();
    }
  };
}
function Tc(e) {
  try {
    const t = Uint8Array.from(atob(e), (N) => N.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, s = t[3] | t[4] << 8, a = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, c = (n >> 18 & 31) / 31, o = n >> 23, u = (s >> 3 & 63) / 63, g = (s >> 9 & 63) / 63, m = s >> 15, _ = Math.max(3, m ? o ? 5 : 7 : s & 7), h = Math.max(3, m ? s & 7 : o ? 5 : 7);
    let b = o ? 6 : 5, w = 0;
    const d = (N, V, oe) => {
      const q = [];
      for (let ie = 0; ie < V; ie++)
        for (let ae = ie ? 0 : 1; ae * V < N * (V - ie); ae++) {
          const we = t[b + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          q.push((we / 7.5 - 1) * oe);
        }
      return q;
    }, v = d(_, h, c), y = d(3, 3, u * 1.25), P = d(3, 3, g * 1.25), z = _ / h, B = Math.max(1, Math.round(z > 1 ? 32 : 32 * z)), G = Math.max(1, Math.round(z > 1 ? 32 / z : 32)), J = document.createElement("canvas");
    J.width = B, J.height = G;
    const ne = J.getContext("2d"), U = ne.createImageData(B, G), j = [], K = [];
    for (let N = 0, V = 0; N < G; N++)
      for (let oe = 0; oe < B; oe++, V += 4) {
        let q = a, ie = i, ae = l;
        for (let O = 0; O < _; O++) j[O] = Math.cos(Math.PI / B * (oe + 0.5) * O);
        for (let O = 0; O < h; O++) K[O] = Math.cos(Math.PI / G * (N + 0.5) * O);
        for (let O = 0, Y = 0; O < h; O++)
          for (let M = O ? 0 : 1; M * h < _ * (h - O); M++, Y++)
            q += v[Y] * j[M] * K[O] * 2;
        for (let O = 0, Y = 0; O < 3; O++)
          for (let M = O ? 0 : 1; M < 3 - O; M++, Y++) {
            const T = j[M] * K[O] * 2;
            ie += y[Y] * T, ae += P[Y] * T;
          }
        const we = q - 2 / 3 * ie, A = (3 * q - we + ae) / 2, F = A - ae;
        U.data[V] = Math.max(0, Math.min(255, Math.round(255 * A))), U.data[V + 1] = Math.max(0, Math.min(255, Math.round(255 * F))), U.data[V + 2] = Math.max(0, Math.min(255, Math.round(255 * we))), U.data[V + 3] = 255;
      }
    return ne.putImageData(U, 0, 0), J.toDataURL();
  } catch {
    return null;
  }
}
var Mc = /* @__PURE__ */ I('<main id="canvas"><div id="sentinel"></div></main>');
function Ac(e, t) {
  pt(t, !0);
  let n = $(t, "key", 3, ""), s = $(t, "total", 3, null), a = $(t, "triage", 3, !1), i = $(t, "excludedDirs", 19, () => []), l = $(t, "selecting", 3, !1), c = $(t, "selectedKeys", 19, () => []), o = $(t, "onActivate", 3, () => {
  }), u = $(t, "onOverride", 3, async () => null), g = $(t, "onExcludeFolder", 3, () => {
  }), m = $(t, "onState", 3, () => {
  }), _ = $(t, "onSweepStart", 3, () => {
  }), h = $(t, "onSweepMove", 3, () => {
  }), b = $(t, "onSweepEnd", 3, () => {
  }), w = /* @__PURE__ */ X(null), d = /* @__PURE__ */ X(null), v = null, y = "";
  const P = /* @__PURE__ */ se(() => new Set(c())), z = { null: "exclude", exclude: "include", include: "clear" };
  function B(A) {
    const F = A.toLowerCase().startsWith(Zn.toLowerCase()) ? A.slice(Zn.length + 1) : A;
    return F.length > 64 ? "…" + F.slice(-64) : F;
  }
  function G(A) {
    const F = document.createElement("div");
    F.className = "tile-path", A.appendChild(F);
    const O = document.createElement("button");
    O.className = "chip", O.type = "button", A.appendChild(O);
    const Y = document.createElement("button");
    Y.className = "dirchip", Y.type = "button", Y.textContent = "dir", A.appendChild(Y);
  }
  function J(A, F) {
    const O = A.querySelector(".tile-path");
    O && (O.textContent = F.p ? B(F.p) : "");
    const Y = A.querySelector(".dirchip");
    if (Y) {
      const T = Ka(F.p ?? ""), H = T !== "" && Os(i(), T);
      Y.hidden = T === "", Y.disabled = H, Y.dataset.state = H ? "exclude" : "none", Y.title = H ? `already excluded: ${T}` : `exclude everything under ${T}, subfolders included — one exclude rule at the end of the order`;
    }
    const M = A.querySelector(".chip");
    M && (M.dataset.state = F.o || "none", M.textContent = F.o === "exclude" ? "drop" : F.o === "include" ? "keep" : "·", M.title = F.o === "exclude" ? "overridden: excluded — click to keep" : F.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  function ne(A) {
    const F = document.createElement("span");
    F.className = "tick", A.appendChild(F);
  }
  function U(A, F) {
    A.dataset.selected = r(P).has(F.id) ? "on" : "off";
  }
  nr(() => (v = Ec(r(w), r(d), {
    fetchPage: (A) => t.fetchPage(A),
    thumbHash: Tc,
    extend: a() ? G : ne,
    fill: a() ? J : U,
    onState: (A) => m()(A),
    sweepStart: (A, F) => _()(A, F),
    sweepMove: (A) => h()(A),
    sweepEnd: () => b()(),
    activate: async (A, F, O, Y) => {
      if (F.target.closest(".dirchip")) {
        g()(A);
        return;
      }
      if (!F.target.closest(".chip")) {
        o()(A, O, Y, F.shiftKey);
        return;
      }
      const M = z[A.o ?? "null"];
      A.o = await u()(A, M), J(O, A);
    }
  }), y = n(), v.setSweeping(l()), () => v?.destroy())), Lt(() => {
    v?.setSweeping(l());
  }), Lt(() => {
    const A = n(), F = s();
    v && (A !== y && (y = A, v.reset()), v.setTotal(F));
  });
  function j(A) {
    return v?.walkTo(A);
  }
  function K(A) {
    v?.focus(A);
  }
  function N(A, F) {
    return v?.itemsBetween(A, F) ?? [];
  }
  let V = "";
  Lt(() => {
    const A = i().join(`
`);
    !v || A === V || (V = A, v.refill());
  });
  let oe = null;
  Lt(() => {
    const A = c();
    !v || A === oe || (oe = A, v.refill());
  });
  var q = { walkTo: j, focusTile: K, itemsBetween: N }, ie = Mc();
  let ae;
  var we = f(ie);
  return _r(we, (A) => x(d, A), () => r(d)), _r(ie, (A) => x(w, A), () => r(w)), W(() => ae = Ce(ie, 1, "", null, ae, { selecting: l() })), C(e, ie), gt(q);
}
var Rc = /* @__PURE__ */ I('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Pc = /* @__PURE__ */ I('<th class="num svelte-1v3p82v"> </th>'), Cc = /* @__PURE__ */ I('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Nc = /* @__PURE__ */ I('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Oc = /* @__PURE__ */ I('<td class="num svelte-1v3p82v"> </td>'), Ic = /* @__PURE__ */ I('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), zc = /* @__PURE__ */ I('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Fc(e, t) {
  pt(t, !0);
  let n = $(t, "rows", 19, () => []), s = $(t, "rules", 19, () => []), a = $(t, "root", 3, null), i = $(t, "picked", 3, null), l = $(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const c = /* @__PURE__ */ se(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const u = /* @__PURE__ */ se(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : Xa(s(), t.screen.toRule(w, a()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var _ = Ps(), h = ct(_);
  {
    var b = (w) => {
      var d = zc(), v = f(d), y = f(v), P = f(y);
      {
        var z = (j) => {
          var K = Rc();
          C(j, K);
        };
        te(P, (j) => {
          r(c) && j(z);
        });
      }
      var B = p(P), G = f(B), J = p(B, 3);
      {
        var ne = (j) => {
          var K = Pc(), N = f(K);
          W(() => R(N, t.screen.heading[1])), C(j, K);
        };
        te(J, (j) => {
          t.screen.heading[1] && j(ne);
        });
      }
      var U = p(v);
      Je(U, 23, n, (j) => j.key, (j, K, N) => {
        const V = /* @__PURE__ */ se(() => r(u).get(r(K).key));
        var oe = Ic();
        let q;
        var ie = f(oe);
        {
          var ae = (ye) => {
            const Te = /* @__PURE__ */ se(() => l().has(r(K).key));
            var Ae = Cc(), Me = f(Ae);
            let Pe;
            var fe = f(Me);
            W(
              (k) => {
                Pe = Ce(Me, 1, "tick svelte-1v3p82v", null, Pe, { on: r(Te) }), pe(Me, "aria-checked", r(Te)), pe(Me, "aria-label", `select ${k ?? ""}`), R(fe, r(Te) ? "✓" : "");
              },
              [() => o(r(K))]
            ), Z("click", Me, (k) => {
              k.stopPropagation(), t.oncheck(r(K), r(N), k.shiftKey);
            }), C(ye, Ae);
          };
          te(ie, (ye) => {
            r(c) && ye(ae);
          });
        }
        var we = p(ie), A = f(we);
        let F;
        var O = f(A), Y = p(A), M = p(Y);
        {
          var T = (ye) => {
            var Te = Nc();
            C(ye, Te);
          };
          te(M, (ye) => {
            r(K).scope === "whole inventory" && ye(T);
          });
        }
        var H = p(we), ce = f(H), re = p(H), he = f(re), ge = p(re);
        {
          var xe = (ye) => {
            var Te = Oc(), Ae = f(Te);
            W(() => R(Ae, r(K).detail ?? "")), C(ye, Te);
          };
          te(ge, (ye) => {
            t.screen.heading[1] && ye(xe);
          });
        }
        W(
          (ye, Te, Ae) => {
            q = Ce(oe, 1, "svelte-1v3p82v", null, q, {
              picked: i() === r(K).key,
              clickable: t.screen.sheet !== !1
            }), F = Ce(A, 1, "mark svelte-1v3p82v", null, F, {
              exclude: r(V) === "exclude",
              include: r(V) === "include"
            }), pe(A, "title", m[r(V)] ?? ""), R(O, g[r(V)] ?? ""), R(Y, `${ye ?? ""} `), R(ce, Te), R(he, Ae);
          },
          [
            () => o(r(K)),
            () => Oe(r(K).paths),
            () => Ot(r(K).bytes)
          ]
        ), Z("click", oe, () => t.onpick(r(K))), C(j, oe);
      }), W(() => R(G, t.screen.heading[0] ?? "")), C(w, d);
    };
    te(h, (w) => {
      n().length && w(b);
    });
  }
  C(e, _), gt();
}
Ht(["click"]);
var Lc = /* @__PURE__ */ I('<button class="twisty svelte-pucy57"> </button>'), Dc = /* @__PURE__ */ I('<span class="twisty leaf svelte-pucy57">·</span>'), jc = /* @__PURE__ */ I('<span class="name root svelte-pucy57"> </span>'), Hc = /* @__PURE__ */ I('<button class="name svelte-pucy57"> </button>'), Bc = /* @__PURE__ */ I('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), qc = /* @__PURE__ */ I('<div class="note svelte-pucy57"> </div>'), Uc = /* @__PURE__ */ I('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Wc = /* @__PURE__ */ I('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Yc = /* @__PURE__ */ I('<div class="tree svelte-pucy57"></div>');
function Gc(e, t) {
  pt(t, !0);
  let n = $(t, "version", 3, 0), s = $(t, "excludedDirs", 19, () => []), a = $(t, "picked", 3, null), i = $(t, "busy", 3, !1), l = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Map())), c = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Set())), u = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Set()));
  async function g(d) {
    x(o, new Set(r(o)).add(d), !0);
    const v = await t.onload(d), y = new Map(r(l)), P = new Set(r(u));
    v ? (y.set(d, v), P.delete(d)) : P.add(d), x(l, y, !0), x(u, P, !0), x(o, new Set([...r(o)].filter((z) => z !== d)), !0);
  }
  function m(d) {
    if (r(c).has(d)) {
      x(c, new Set([...r(c)].filter((v) => v !== d)), !0);
      return;
    }
    x(c, new Set(r(c)).add(d), !0), r(l).has(d) || g(d);
  }
  let _ = -1;
  Lt(() => {
    const d = n();
    if (d !== _) {
      _ = d, r(c).has(t.root) || x(c, new Set(r(c)).add(t.root), !0);
      for (const v of r(c)) g(v);
    }
  });
  const h = /* @__PURE__ */ se(() => {
    const d = [], v = (B, G, J, ne, U, j) => {
      const K = r(l).get(B), N = r(c).has(B);
      if (d.push({
        key: B,
        name: G,
        depth: J,
        paths: ne,
        bytes: U,
        deeper: j,
        expanded: N,
        here: K?.here ?? null,
        truncated: !!K?.truncated,
        loading: r(o).has(B),
        failed: r(u).has(B),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: Os(s(), B)
      }), !(!N || !K))
        for (const V of K.children)
          v(V.path, V.name, J + 1, V.paths, V.bytes, V.deeper);
    }, y = r(l).get(t.root), P = y ? y.children.reduce((B, G) => B + G.paths, 0) + y.here.paths : 0, z = y ? y.children.reduce((B, G) => B + G.bytes, 0) + y.here.bytes : 0;
    return v(t.root, t.root, 0, P, z, !0), d;
  }), b = 8;
  var w = Yc();
  Je(w, 21, () => r(h), (d) => d.key, (d, v) => {
    var y = Wc(), P = ct(y);
    let z;
    var B = f(P);
    let G;
    var J = p(B, 2);
    {
      var ne = (M) => {
        var T = Lc(), H = f(T);
        W(() => {
          pe(T, "aria-expanded", r(v).expanded), pe(T, "aria-label", `${r(v).expanded ? "collapse" : "expand"} ${r(v).name ?? ""}`), pe(T, "title", r(v).expanded ? "collapse" : "expand"), R(H, r(v).loading ? "·" : r(v).expanded ? "▾" : "▸");
        }), Z("click", T, () => m(r(v).key)), C(M, T);
      }, U = (M) => {
        var T = Dc();
        C(M, T);
      };
      te(J, (M) => {
        r(v).deeper ? M(ne) : M(U, -1);
      });
    }
    var j = p(J, 2);
    {
      var K = (M) => {
        var T = jc(), H = f(T);
        W(() => R(H, r(v).key)), C(M, T);
      }, N = (M) => {
        var T = Hc(), H = f(T);
        W(() => {
          pe(T, "title", `Show every kept file under ${r(v).key ?? ""}`), R(H, r(v).name);
        }), Z("click", T, () => t.onpick(r(v))), C(M, T);
      };
      te(j, (M) => {
        r(v).depth === 0 ? M(K) : M(N, -1);
      });
    }
    var V = p(j, 2), oe = f(V), q = p(V, 2), ie = f(q), ae = p(q, 2), we = p(P, 2);
    {
      var A = (M) => {
        var T = Bc();
        let H;
        W((ce) => H = en(T, "", H, ce), [
          () => ({
            "padding-left": `${Math.min(r(v).depth, b) * 11 + 18}px`
          })
        ]), C(M, T);
      }, F = (M) => {
        var T = qc();
        let H;
        var ce = f(T);
        W(
          (re, he, ge) => {
            H = en(T, "", H, re), R(ce, `${he ?? ""} directly here · ${ge ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(v).depth, b) * 11 + 18}px`
            }),
            () => Oe(r(v).here.paths),
            () => Ot(r(v).here.bytes)
          ]
        ), C(M, T);
      };
      te(we, (M) => {
        r(v).expanded && r(v).failed ? M(A) : r(v).expanded && r(v).here && r(v).here.paths > 0 && M(F, 1);
      });
    }
    var O = p(we, 2);
    {
      var Y = (M) => {
        var T = Uc();
        let H;
        W((ce) => H = en(T, "", H, ce), [
          () => ({
            "padding-left": `${Math.min(r(v).depth, b) * 11 + 18}px`
          })
        ]), C(M, T);
      };
      te(O, (M) => {
        r(v).truncated && M(Y);
      });
    }
    W(
      (M, T, H) => {
        z = Ce(P, 1, "row svelte-pucy57", null, z, {
          picked: a() === r(v).key,
          gone: r(v).excluded
        }), G = en(B, "", G, M), R(oe, T), R(ie, H), ae.disabled = i() || r(v).excluded || r(v).depth === 0, pe(ae, "title", r(v).depth === 0 ? "The library root is not excludable from here." : r(v).excluded ? "already excluded" : `Exclude everything under ${r(v).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(v).depth, b) * 11}px` }),
        () => Oe(r(v).paths),
        () => Ot(r(v).bytes)
      ]
    ), Z("click", ae, () => t.onexclude(r(v))), C(d, y);
  }), C(e, w), gt();
}
Ht(["click"]);
var Kc = /* @__PURE__ */ I('<button title="Back to its default">↺</button>'), Xc = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), Vc = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), $c = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), Jc = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), Zc = /* @__PURE__ */ I('<li><code class="svelte-1hh0fwb"> </code> </li>'), Qc = /* @__PURE__ */ I(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), eu = /* @__PURE__ */ I('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function tu(e, t) {
  pt(t, !0);
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
        ["headerSide", "Sides", 0, (N) => Math.floor(N / 2), 1],
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
  let c = /* @__PURE__ */ X(Ie(ao())), o = /* @__PURE__ */ X(!0), u = /* @__PURE__ */ X(!1), g = /* @__PURE__ */ X(Ie(ei())), m = /* @__PURE__ */ X(Ie(window.innerWidth));
  const _ = (N) => r(g) === "light" ? N.light : N.dark, h = (N) => N in Sn ? Sn : bn, b = (N) => `rgba(${N.r}, ${N.g}, ${N.b}, ${N.a})`, w = /* @__PURE__ */ se(() => JSON.stringify(r(c), null, 2));
  nr(() => {
    const N = localStorage.getItem(n);
    if (N)
      try {
        x(c, ts(JSON.parse(N)), !0);
        return;
      } catch {
      }
    Is();
  });
  function d(N) {
    x(c, ts({ ...r(c), ...N }), !0), localStorage.setItem(n, JSON.stringify(r(c))), x(u, !1);
  }
  function v(N) {
    x(c, ts(N), !0), localStorage.setItem(n, JSON.stringify(r(c))), x(u, !1);
  }
  function y(N) {
    d({ [N]: h(N)[N] });
  }
  function P() {
    x(g, ti(r(g) === "dark" ? "light" : "dark"), !0);
  }
  async function z() {
    await navigator.clipboard.writeText(r(w)), x(u, !0);
  }
  var B = eu();
  let G;
  var J = f(B), ne = p(f(J), 4), U = f(ne), j = p(J, 2);
  {
    var K = (N) => {
      var V = Qc();
      {
        const Me = (fe, k = Ar, S = Ar, D = Ar) => {
          var Q = Kc();
          let ve;
          W(() => {
            ve = Ce(Q, 1, "undo svelte-1hh0fwb", null, ve, { idle: !S() }), pe(Q, "aria-label", `Reset ${k() ?? ""}`);
          }), Z("click", Q, function(...ue) {
            D()?.apply(this, ue);
          }), C(fe, Q);
        };
        var oe = p(f(V), 2);
        Je(oe, 17, () => s, wt, (fe, k) => {
          var S = Vc(), D = f(S), Q = f(D), ve = p(D, 2), ue = f(ve), de = p(ve, 2);
          Je(de, 17, () => r(k).rows, wt, (Ve, Bt) => {
            var $e = /* @__PURE__ */ se(() => $r(r(Bt), 5));
            let Ke = () => r($e)[0], St = () => r($e)[1], qt = () => r($e)[2], st = () => r($e)[3], Vt = () => r($e)[4];
            const Ut = /* @__PURE__ */ se(() => r(c)[Ke()] !== h(Ke())[Ke()]), Et = /* @__PURE__ */ se(() => typeof st() == "function" ? st()(r(m)) : st());
            var Tt = Xc();
            let Ze;
            var Mt = f(Tt), Wt = f(Mt), at = p(Mt, 2), L = p(at, 2), le = p(L, 2);
            Me(le, St, () => r(Ut), () => () => y(Ke())), W(() => {
              Ze = Ce(Tt, 1, "row svelte-1hh0fwb", null, Ze, { moved: r(Ut) }), R(Wt, St()), pe(at, "min", qt()), pe(at, "max", r(Et)), pe(at, "step", Vt()), pe(at, "aria-label", St()), kn(at, r(c)[Ke()]), pe(L, "min", qt()), pe(L, "max", r(Et)), pe(L, "step", Vt()), pe(L, "aria-label", `${St() ?? ""} value`), kn(L, r(c)[Ke()]);
            }), Z("input", at, (be) => d({ [Ke()]: Number(be.currentTarget.value) })), Z("input", L, (be) => d({ [Ke()]: Number(be.currentTarget.value) })), C(Ve, Tt);
          }), W(() => {
            R(Q, r(k).title), R(ue, r(k).note);
          }), C(fe, S);
        });
        var q = p(oe, 2), ie = f(q), ae = p(q, 2), we = f(ae), A = p(ae, 2);
        Je(A, 17, () => so, wt, (fe, k) => {
          const S = /* @__PURE__ */ se(() => _(r(k))), D = /* @__PURE__ */ se(() => r(c)[r(S)]), Q = /* @__PURE__ */ se(() => r(k).base[r(S)]);
          var ve = Jc(), ue = f(ve), de = f(ue), Ve = p(de), Bt = f(Ve), $e = p(ue, 2), Ke = f($e), St = p($e, 2);
          Je(St, 17, () => i, wt, (Ut, Et) => {
            var Tt = /* @__PURE__ */ se(() => $r(r(Et), 3));
            let Ze = () => r(Tt)[0], Mt = () => r(Tt)[1], Wt = () => r(Tt)[2];
            const at = /* @__PURE__ */ se(() => r(D)[Ze()] !== r(Q)[Ze()]);
            var L = $c();
            let le;
            var be = f(L), De = f(be), Re = p(be, 2), ke = p(Re, 2), He = p(ke, 2);
            Me(He, Mt, () => r(at), () => () => d({
              [r(S)]: { ...r(D), [Ze()]: r(Q)[Ze()] }
            })), W(() => {
              le = Ce(L, 1, "row svelte-1hh0fwb", null, le, { moved: r(at) }), R(De, Mt()), pe(Re, "max", Wt()), pe(Re, "step", Wt() === 1 ? 0.01 : 1), pe(Re, "aria-label", `${r(g) ?? ""} ${a[r(k).dark].title ?? ""} ${Mt() ?? ""}`), kn(Re, r(D)[Ze()]), pe(ke, "max", Wt()), pe(ke, "step", Wt() === 1 ? 0.01 : 1), pe(ke, "aria-label", `${r(g) ?? ""} ${a[r(k).dark].title ?? ""} ${Mt() ?? ""} value`), kn(ke, r(D)[Ze()]);
            }), Z("input", Re, (Qe) => d({
              [r(S)]: {
                ...r(D),
                [Ze()]: Number(Qe.currentTarget.value)
              }
            })), Z("input", ke, (Qe) => d({
              [r(S)]: {
                ...r(D),
                [Ze()]: Number(Qe.currentTarget.value)
              }
            })), C(Ut, L);
          });
          var qt = p(St, 2);
          let st;
          var Vt = f(qt);
          W(
            (Ut, Et) => {
              R(de, `${a[r(k).dark].title ?? ""} `), R(Bt, r(g)), R(Ke, a[r(k).dark].note), st = en(qt, "", st, Ut), R(Vt, Et);
            },
            [
              () => ({ background: b(r(D)) }),
              () => b(r(D))
            ]
          ), C(fe, ve);
        });
        var F = p(A, 2), O = p(f(F), 4);
        let Pe;
        var Y = f(O), M = f(Y), T = p(Y, 2);
        Me(T, () => "Blur at the edge", () => r(c).blurEdge !== Sn.blurEdge, () => () => y("blurEdge"));
        var H = p(F, 2), ce = p(f(H), 4);
        Je(ce, 21, () => l, wt, (fe, k) => {
          var S = /* @__PURE__ */ se(() => $r(r(k), 2));
          let D = () => r(S)[0], Q = () => r(S)[1];
          var ve = Zc(), ue = f(ve), de = f(ue), Ve = p(ue);
          W(() => {
            R(de, D()), R(Ve, ` — ${Q() ?? ""}`);
          }), C(fe, ve);
        });
        var re = p(H, 2), he = p(f(re), 4), ge = f(he), xe = p(ge, 2), ye = p(xe, 2), Te = f(ye), Ae = p(he, 2);
        W(() => {
          R(ie, `The five colours below are per theme, and you are editing the ${r(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), R(we, `Edit the ${r(g) === "dark" ? "light" : "dark"} colours`), Pe = Ce(O, 1, "row toggle svelte-1hh0fwb", null, Pe, { moved: r(c).blurEdge !== Sn.blurEdge }), Hl(M, r(c).blurEdge), R(Te, r(u) ? "Copied" : "Copy"), kn(Ae, r(w));
        }), Z("click", ae, P), Z("change", M, (fe) => d({ blurEdge: fe.currentTarget.checked })), Z("click", ge, () => v(bn)), Z("click", xe, () => v(Sn)), Z("click", ye, z);
      }
      C(N, V);
    };
    te(j, (N) => {
      r(o) && N(K);
    });
  }
  W(() => {
    G = Ce(B, 1, "tuner svelte-1hh0fwb", null, G, { folded: !r(o) }), pe(ne, "title", r(o) ? "Fold away" : "Open"), R(U, r(o) ? "–" : "+");
  }), Ul("innerWidth", (N) => x(m, N, !0)), Z("click", ne, () => x(o, !r(o))), C(e, B), gt();
}
Ht(["click", "input", "change"]);
function is(e, t, n, s) {
  const a = e + t;
  return a < 0 || a >= n && s ? null : a;
}
var nu = /* @__PURE__ */ I('<button><span class="n svelte-1n46o8q"> </span> </button>'), ru = /* @__PURE__ */ I('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), su = /* @__PURE__ */ I('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), au = /* @__PURE__ */ I('<div class="muted pad svelte-1n46o8q">loading…</div>'), iu = /* @__PURE__ */ I('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), lu = /* @__PURE__ */ I('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), ou = /* @__PURE__ */ I('<p class="blurb"> </p>'), cu = /* @__PURE__ */ I('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear</button> <span class="muted svelte-1n46o8q"><!></span></div>'), uu = /* @__PURE__ */ I('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), du = /* @__PURE__ */ I('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), fu = /* @__PURE__ */ I('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), hu = /* @__PURE__ */ I("<div> </div>"), vu = /* @__PURE__ */ I('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function pu(e, t) {
  pt(t, !0);
  const n = location.pathname === "/tune";
  let s = /* @__PURE__ */ X("grid"), a = /* @__PURE__ */ X(0), i = /* @__PURE__ */ X(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ X(Ie([])), c = /* @__PURE__ */ X(null), o = /* @__PURE__ */ X(null), u = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ X(null), m = /* @__PURE__ */ X(null), _ = /* @__PURE__ */ X(null), h = /* @__PURE__ */ X(null), b = /* @__PURE__ */ X(!1), w = /* @__PURE__ */ X(!1), d = /* @__PURE__ */ X(!1), v = /* @__PURE__ */ X(!1), y = /* @__PURE__ */ X(Ie({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), P = /* @__PURE__ */ X(null), z = /* @__PURE__ */ X(0), B = /* @__PURE__ */ X(null), G = /* @__PURE__ */ X(Ie({})), J = /* @__PURE__ */ X("newest"), ne = /* @__PURE__ */ X(Ie(_o())), U = /* @__PURE__ */ X(null), j = /* @__PURE__ */ X(null), K = /* @__PURE__ */ X(!1), N = /* @__PURE__ */ X(Ie([])), V = /* @__PURE__ */ X(null), oe = null;
  const q = /* @__PURE__ */ se(() => $s[r(a)]), ie = /* @__PURE__ */ se(() => r(q).table !== !1), ae = /* @__PURE__ */ se(() => r(ie) || r(q).tree === !0), we = /* @__PURE__ */ se(() => r(q).sheet !== !1 && (r(o) !== null || !r(ae))), A = /* @__PURE__ */ se(() => ({
    sort: r(J),
    ...r(ne).on ? { stack: r(ne).window } : {},
    ...Object.fromEntries(Object.entries(r(G)).filter(([, E]) => E.length > 0))
  })), F = /* @__PURE__ */ se(() => r(N).map((E) => E.key)), O = /* @__PURE__ */ se(() => mc(r(N)));
  Lt(() => {
    r(A), nn(() => {
      x(N, [], !0), x(
        V,
        null
        // it indexes an order this query no longer has
      );
    });
  });
  const Y = /* @__PURE__ */ se(() => r(s) === "grid" ? `grid:${JSON.stringify(r(A))}` : `triage:${r(a)}:${JSON.stringify(r(o))}`), M = /* @__PURE__ */ se(() => r(q).rule === !1 || r(u).size === 0 ? [] : r(l).filter((E) => r(u).has(E.key)).map((E) => r(q).toRule(E, r(i))).filter((E) => E && Xa(r(m)?.rules ?? [], E) !== "exclude")), T = /* @__PURE__ */ se(() => (r(m)?.rules ?? []).filter((E) => E.decision === "exclude" && E.term?.column === "dir_under").map((E) => String(E.term.value).replace(/[\\/]+$/, "").toLowerCase())), H = Gl();
  function ce(E) {
    x(P, String(E), !0);
  }
  async function re(E) {
    try {
      return x(P, null), await E();
    } catch (ee) {
      return ce(ee), null;
    }
  }
  const he = Kl(
    () => {
      x(w, !0), re(async () => {
        const E = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: ee, value: Se } = await H(() => qe.counts(r(o), E));
        ee || x(m, Se, !0);
      }).finally(() => {
        x(w, !1);
      });
    },
    220
  );
  async function ge() {
    x(_, "loading");
    const E = await re(() => qe.files());
    x(_, E, !0), x(b, !1), x(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function xe(E = !1) {
    if (r(s) !== "triage" || !r(ie)) {
      x(l, [], !0);
      return;
    }
    x(v, !0);
    const ee = r(q).name === "source_folder" && r(i) ? { root: r(i) } : {};
    E && (ee.live = "1");
    const Se = await re(() => qe.screen(r(q).name, ee));
    x(l, Se?.rows ?? [], !0), x(v, !1);
  }
  let ye = !1;
  Lt(() => {
    r(a), r(s), nn(() => {
      x(c, null), x(o, null), x(i, null), Pe(), r(s) === "triage" && (xe(), he.now(), ye || (ye = !0, ge()));
    });
  }), Lt(() => {
    r(i), nn(() => {
      r(s) === "triage" && (Pe(), xe());
    });
  }), nr(() => {
    re(async () => {
      x(B, await qe.facets(), !0);
    });
  });
  function Te(E, ee) {
    x(G, { ...r(G), [E]: ee }, !0);
  }
  function Ae(E) {
    if (r(q).sheet !== !1) {
      if (r(q).drill && !r(i)) {
        x(c, E.key, !0), x(
          o,
          {
            ...r(q).toRule(E, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), x(i, E.key, !0);
        return;
      }
      x(c, E.key, !0), x(
        o,
        {
          ...r(q).toRule(E, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), he();
    }
  }
  function Me(E, ee, Se) {
    const je = new Set(r(u)), Be = !je.has(E.key), Pt = Se && r(g) !== null ? r(l).findIndex((Ct) => Ct.key === r(g)) : -1, [zn, Fn] = Pt < 0 ? [ee, ee] : Pt < ee ? [Pt, ee] : [ee, Pt];
    for (let Ct = zn; Ct <= Fn; Ct++)
      Be ? je.add(r(l)[Ct].key) : je.delete(r(l)[Ct].key);
    x(u, je, !0), x(g, E.key, !0);
  }
  function Pe() {
    x(u, /* @__PURE__ */ new Set(), !0), x(g, null);
  }
  function fe(E) {
    x(o, E, !0), x(
      c,
      null
      // it no longer corresponds to a row
    ), he();
  }
  function k(E = !1) {
    x(o, null), x(c, null), E && x(i, null), he.now();
  }
  async function S() {
    x(
      b,
      !0
      // the distinct-content number now says so on its face
    ), ol(z), await xe(), he.now();
  }
  async function D() {
    if (!r(o)) return;
    x(d, !0);
    const E = r(o).at === "end" ? void 0 : 0, ee = await re(() => qe.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(q).id} ${r(q).title}`
      },
      E
    ));
    x(d, !1), ee && (x(o, null), x(c, null), await S());
  }
  async function Q() {
    const E = r(M);
    if (!E.length) {
      Pe();
      return;
    }
    x(d, !0);
    for (const ee of E)
      if (!await re(() => qe.addRule({
        column: ee.column,
        op: ee.op,
        value: ee.value,
        decision: "exclude",
        note: `screen ${r(q).id} ${r(q).title}`
      }))) break;
    x(d, !1), Pe(), x(o, null), x(c, null), await S();
  }
  async function ve(E) {
    if (!E || Os(r(T), E)) return;
    x(d, !0);
    const ee = await re(() => qe.addRule({
      column: "dir_under",
      op: "=",
      value: E,
      decision: "exclude",
      note: `screen ${r(q).id} ${r(q).title}`
    }));
    x(d, !1), ee && await S();
  }
  const ue = (E) => ve(Ka(E.p ?? "")), de = (E) => ve(E.key);
  async function Ve(E) {
    x(d, !0), await re(() => qe.deleteRule(E.id)), x(d, !1), await S();
  }
  async function Bt(E, ee) {
    x(d, !0), await re(() => qe.moveRule(E.id, ee)), x(d, !1), await S();
  }
  async function $e() {
    await re(async () => {
      x(B, await qe.facets(), !0);
    });
  }
  async function Ke(E, ee) {
    const Se = await re(() => qe.override(E.s, ee));
    return Se ? (x(b, !0), he(), Se.decision) : E.o ?? null;
  }
  function St(E) {
    return r(s) === "grid" ? qe.photos({ limit: 500, ...r(A), ...E || {} }) : qe.page(r(o), E);
  }
  const qt = (E) => E.m ?? [{ id: E.id, s: E.s, w: E.w, h: E.h }];
  function st(E, ee, Se, je = !1) {
    if (r(s) === "grid") {
      if (r(K)) {
        if (je && r(V) !== null) {
          const Be = r(j)?.itemsBetween(r(V), Se) ?? [];
          x(N, sa(r(N), Be.map(as), !Vt(E)), !0);
        } else
          x(N, bc(r(N), as(E)), !0);
        x(V, Se, !0);
        return;
      }
      x(U, { frames: qt(E), origin: la(ee), at: Se }, !0);
      return;
    }
    re(() => qe.revealOrigin(E.id));
  }
  const Vt = (E) => r(N).some((ee) => ee.key === E.id);
  function Ut(E, ee) {
    oe = {
      from: r(N),
      adding: E === null || !Vt(E)
    }, ee !== null && x(V, ee, !0);
  }
  function Et(E) {
    x(N, sa(oe.from, E.map(as), oe.adding), !0);
  }
  function Tt() {
    oe = null;
  }
  function Ze() {
    x(N, [], !0), x(V, null);
  }
  const Mt = /* @__PURE__ */ se(() => r(U) !== null && is(r(U).at, -1, r(y).count, r(y).exhausted) !== null), Wt = /* @__PURE__ */ se(() => r(U) !== null && is(r(U).at, 1, r(y).count, r(y).exhausted) !== null), at = 120;
  let L = !1, le = 0;
  async function be(E, ee = !1) {
    const Se = performance.now();
    if (!r(U) || L || ee && Se - le < at) return;
    const je = is(r(U).at, E, r(y).count, r(y).exhausted);
    if (je !== null) {
      le = Se, L = !0;
      try {
        const Be = await r(j)?.walkTo(je);
        if (!Be || !r(U)) return;
        x(
          U,
          {
            frames: qt(Be.item),
            origin: la(Be.tile),
            at: je
          },
          !0
        );
      } finally {
        L = !1;
      }
    }
  }
  async function De() {
    const E = r(U)?.at ?? null;
    x(U, null), await yl(), E !== null && r(j)?.focusTile(E);
  }
  function Re(E) {
    De(), re(() => qe.revealPhoto(E.id));
  }
  function ke() {
    re(() => navigator.clipboard.writeText(yc(
      {
        stacking: r(ne),
        sort: r(J),
        filters: r(G)
      },
      r(N)
    )));
  }
  var He = vu(), Qe = ct(He);
  {
    var $t = (E) => {
      zo(E, {
        get facets() {
          return r(B);
        },
        get filters() {
          return r(G);
        },
        get sort() {
          return r(J);
        },
        get stacking() {
          return r(ne);
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
          return r(K);
        },
        get selectedTally() {
          return r(O);
        },
        onfilter: Te,
        onsort: (ee) => x(J, ee, !0),
        onstack: (ee) => x(ne, bo(ee), !0),
        onclear: () => x(G, {}, !0),
        onselecting: (ee) => x(K, ee, !0),
        onshare: ke,
        ondeselect: Ze,
        ontriage: () => x(s, "triage")
      });
    };
    te(Qe, (E) => {
      r(s) === "grid" && E($t);
    });
  }
  var ze = p(Qe, 2);
  {
    var ln = (E) => {
      tu(E, {});
    };
    te(ze, (E) => {
      n && E(ln);
    });
  }
  var At = p(ze, 2);
  let dt;
  var on = f(At);
  {
    var rr = (E) => {
      var ee = lu(), Se = f(ee), je = f(Se), Be = p(Se, 2);
      Je(Be, 21, () => $s, wt, (it, Nt, cn) => {
        var un = nu();
        let Ln;
        var Dn = f(un), Ne = f(Dn), lt = p(Dn, 1, !0);
        W(() => {
          Ln = Ce(un, 1, "nav svelte-1n46o8q", null, Ln, { on: cn === r(a) }), R(Ne, r(Nt).id), R(lt, r(Nt).title);
        }), Z("click", un, () => x(a, cn, !0)), C(it, un);
      });
      var Pt = p(Be, 2);
      {
        var zn = (it) => {
          var Nt = iu(), cn = ct(Nt), un = f(cn);
          {
            var Ln = (et) => {
              var nt = ru(), jn = ct(nt), ar = /* @__PURE__ */ se(() => k.bind(null, !0)), Kr = p(jn, 2), Xr = f(Kr);
              W(() => R(Xr, `inside ${r(i) ?? ""}`)), Z("click", jn, function(...Vr) {
                r(ar)?.apply(this, Vr);
              }), C(et, nt);
            }, Dn = (et) => {
              var nt = su(), jn = f(nt);
              W(() => R(jn, r(q).relive)), Z("click", nt, () => xe(!0)), C(et, nt);
            };
            te(un, (et) => {
              r(q).drill && r(i) ? et(Ln) : r(q).relive && et(Dn, 1);
            });
          }
          var Ne = p(cn, 2);
          {
            var lt = (et) => {
              var nt = au();
              C(et, nt);
            };
            te(Ne, (et) => {
              r(v) && et(lt);
            });
          }
          var dn = p(Ne, 2);
          {
            let et = /* @__PURE__ */ se(() => r(m)?.rules ?? []);
            Fc(dn, {
              get rows() {
                return r(l);
              },
              get screen() {
                return r(q);
              },
              get root() {
                return r(i);
              },
              get checked() {
                return r(u);
              },
              get rules() {
                return r(et);
              },
              get picked() {
                return r(c);
              },
              onpick: Ae,
              oncheck: Me
            });
          }
          C(it, Nt);
        };
        te(Pt, (it) => {
          r(ie) && it(zn);
        });
      }
      var Fn = p(Pt, 2);
      {
        var Ct = (it) => {
          Gc(it, {
            get root() {
              return Zn;
            },
            get version() {
              return r(z);
            },
            get excludedDirs() {
              return r(T);
            },
            get picked() {
              return r(c);
            },
            get busy() {
              return r(d);
            },
            onload: (Nt) => re(() => qe.tree(Nt)),
            onpick: Ae,
            onexclude: de
          });
        };
        te(Fn, (it) => {
          r(q).tree && it(Ct);
        });
      }
      var kr = p(Fn, 2);
      {
        let it = /* @__PURE__ */ se(() => r(m)?.rules ?? []), Nt = /* @__PURE__ */ se(() => r(m)?.unmatched ?? null);
        _c(kr, {
          get rules() {
            return r(it);
          },
          get unmatched() {
            return r(Nt);
          },
          get busy() {
            return r(d);
          },
          ondelete: Ve,
          onmove: Bt
        });
      }
      var Sr = p(kr, 2);
      ic(Sr, { oncomplete: $e }), Z("click", je, () => x(s, "grid")), C(E, ee);
    };
    te(on, (E) => {
      r(s) === "triage" && E(rr);
    });
  }
  var Wr = p(on, 2), sr = f(Wr);
  {
    var Yr = (E) => {
      var ee = fu(), Se = ct(ee), je = f(Se), Be = p(Se, 2), Pt = f(Be), zn = p(Be, 2);
      {
        var Fn = (Ne) => {
          var lt = ou(), dn = f(lt);
          W(() => R(dn, r(q).note)), C(Ne, lt);
        };
        te(zn, (Ne) => {
          r(q).note && Ne(Fn);
        });
      }
      var Ct = p(zn, 2);
      {
        var kr = (Ne) => {
          $o(Ne, {
            get screen() {
              return r(q);
            }
          });
        };
        te(Ct, (Ne) => {
          r(q).name === "dimensions" && Ne(kr);
        });
      }
      var Sr = p(Ct, 2);
      ro(Sr, {
        get counts() {
          return r(m);
        },
        get files() {
          return r(_);
        },
        get filesAt() {
          return r(h);
        },
        get stale() {
          return r(b);
        },
        get candidate() {
          return r(o);
        },
        get busy() {
          return r(w);
        },
        onfiles: ge
      });
      var it = p(Sr, 2);
      {
        var Nt = (Ne) => {
          var lt = cu(), dn = f(lt), et = f(dn), nt = p(dn, 2), jn = f(nt), ar = p(nt, 2), Kr = p(ar, 2), Xr = f(Kr);
          {
            var Vr = (fn) => {
              var Hn = Wn("already excluded — nothing left to write");
              C(fn, Hn);
            }, si = (fn) => {
              var Hn = Wn();
              W((ai) => R(Hn, `one exclude rule each, at the end of the order${ai ?? ""}`), [
                () => r(M).length < r(u).size ? ` · ${Oe(r(u).size - r(M).length)} already excluded, skipped` : ""
              ]), C(fn, Hn);
            };
            te(Xr, (fn) => {
              r(M).length ? fn(si, -1) : fn(Vr);
            });
          }
          W(
            (fn, Hn) => {
              R(et, `${fn ?? ""} ticked`), nt.disabled = r(d) || !r(M).length, R(jn, Hn), ar.disabled = r(d);
            },
            [
              () => Oe(r(u).size),
              () => r(d) ? "saving…" : `Exclude ${Oe(r(M).length)}`
            ]
          ), Z("click", nt, Q), Z("click", ar, Pe), C(Ne, lt);
        };
        te(it, (Ne) => {
          r(u).size && Ne(Nt);
        });
      }
      var cn = p(it, 2);
      fc(cn, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(q);
        },
        get saving() {
          return r(d);
        },
        onedit: fe,
        onconfirm: D,
        onclear: k
      });
      var un = p(cn, 2);
      {
        var Ln = (Ne) => {
          var lt = uu(), dn = f(lt);
          W((et, nt) => R(dn, `${et ?? ""}${nt ?? ""} loaded${r(y).exhausted ? " · all of them" : ""}${r(y).loading ? " · loading…" : ""} `), [
            () => Oe(r(y).count),
            () => r(y).total ? " of " + Oe(r(y).total) : ""
          ]), C(Ne, lt);
        }, Dn = (Ne) => {
          var lt = du();
          C(Ne, lt);
        };
        te(un, (Ne) => {
          r(we) ? Ne(Ln) : r(q).sheet === !1 && Ne(Dn, 1);
        });
      }
      W(() => {
        R(je, `${r(q).id ?? ""} · ${r(q).title ?? ""}`), R(Pt, r(q).blurb);
      }), C(E, ee);
    };
    te(sr, (E) => {
      r(s) === "triage" && E(Yr);
    });
  }
  var Gr = p(sr, 2);
  {
    var Rt = (E) => {
      {
        let ee = /* @__PURE__ */ se(() => r(s) === "grid" ? null : r(m)?.page_paths ?? null), Se = /* @__PURE__ */ se(() => r(s) === "triage"), je = /* @__PURE__ */ se(() => r(s) === "grid" && r(K));
        _r(
          Ac(E, {
            get key() {
              return r(Y);
            },
            fetchPage: St,
            get total() {
              return r(ee);
            },
            get triage() {
              return r(Se);
            },
            get excludedDirs() {
              return r(T);
            },
            get selecting() {
              return r(je);
            },
            get selectedKeys() {
              return r(F);
            },
            onActivate: st,
            onOverride: Ke,
            onExcludeFolder: ue,
            onSweepStart: Ut,
            onSweepMove: Et,
            onSweepEnd: Tt,
            onState: (Be) => x(y, { ...r(y), ...Be }, !0)
          }),
          (Be) => x(j, Be, !0),
          () => r(j)
        );
      }
    };
    te(Gr, (E) => {
      (r(we) || r(s) === "grid") && E(Rt);
    });
  }
  var ft = p(At, 2);
  {
    var In = (E) => {
      Wo(E, {
        get frames() {
          return r(U).frames;
        },
        get origin() {
          return r(U).origin;
        },
        get back() {
          return r(Mt);
        },
        get forward() {
          return r(Wt);
        },
        onstep: be,
        onreveal: Re,
        onclose: De
      });
    };
    te(ft, (E) => {
      r(U) && E(In);
    });
  }
  var yr = p(ft, 2);
  {
    var xr = (E) => {
      var ee = hu();
      let Se;
      var je = f(ee);
      W(() => {
        Se = Ce(ee, 1, "status", null, Se, { bare: r(s) === "grid" }), R(je, r(P));
      }), C(E, ee);
    };
    te(yr, (E) => {
      r(P) && E(xr);
    });
  }
  W(() => dt = Ce(At, 1, "shell", null, dt, { bare: r(s) === "grid" })), C(e, He), gt();
}
Ht(["click"]);
mo();
Is();
Al(pu, { target: document.getElementById("app") });
