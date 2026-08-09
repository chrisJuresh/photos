var ys = Array.isArray, li = Array.prototype.indexOf, Nr = Array.prototype.includes, qr = Array.from, oi = Object.defineProperty, Gn = Object.getOwnPropertyDescriptor, ui = Object.getOwnPropertyDescriptors, ci = Object.prototype, di = Array.prototype, ua = Object.getPrototypeOf, zs = Object.isExtensible;
const Rr = () => {
};
function fi(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ca() {
  var e, t, n = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
function Jr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const s of e)
    if (n.push(s), n.length === t) break;
  return n;
}
const Xe = 2, Xn = 4, Ur = 8, da = 1 << 24, It = 16, xt = 32, rn = 64, os = 128, yt = 512, We = 1024, Ye = 2048, Dt = 4096, st = 8192, ht = 16384, er = 32768, us = 1 << 25, Vn = 65536, Or = 1 << 17, hi = 1 << 18, tr = 1 << 19, vi = 1 << 20, Wt = 1 << 25, On = 65536, Ir = 1 << 21, Kn = 1 << 22, mn = 1 << 23, Rn = Symbol("$state"), pi = Symbol("legacy props"), gi = Symbol(""), fa = Symbol("attributes"), cs = Symbol("class"), ds = Symbol("style"), fs = Symbol("text"), _r = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), _i = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function bi(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function mi() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function wi(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function yi(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function xi() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ki(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Si() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ei(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Ti() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Mi() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ai() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ri() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Pi = 1, Ci = 2, ha = 4, Ni = 8, Oi = 16, Ii = 1, Fi = 4, zi = 8, Li = 16, Di = 1, ji = 2, Ue = Symbol("uninitialized"), Hi = "http://www.w3.org/1999/xhtml";
function Bi() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function qi() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ui() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function va(e) {
  return e === this.v;
}
function Wi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function pa(e) {
  return !Wi(e, this.v);
}
let tt = null;
function $n(e) {
  tt = e;
}
function vt(e, t = !1, n) {
  tt = {
    p: tt,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      me
    ),
    l: null
  };
}
function pt(e) {
  var t = (
    /** @type {ComponentContext} */
    tt
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var s of n)
      Ia(s);
  }
  return e !== void 0 && (t.x = e), t.i = !0, tt = t.p, e ?? /** @type {T} */
  {};
}
function ga() {
  return !0;
}
let Tn = [];
function _a() {
  var e = Tn;
  Tn = [], fi(e);
}
function Qt(e) {
  if (Tn.length === 0 && !fr) {
    var t = Tn;
    queueMicrotask(() => {
      t === Tn && _a();
    });
  }
  Tn.push(e);
}
function Yi() {
  for (; Tn.length > 0; )
    _a();
}
function ba(e) {
  var t = me;
  if (t === null)
    return we.f |= mn, e;
  if ((t.f & er) === 0 && (t.f & Xn) === 0)
    throw e;
  _n(e, t);
}
function _n(e, t) {
  if (!(t !== null && (t.f & ht) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & os) !== 0) {
        if ((t.f & er) === 0)
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
const Gi = -7169;
function ze(e, t) {
  e.f = e.f & Gi | t;
}
function xs(e) {
  (e.f & yt) !== 0 || e.deps === null ? ze(e, We) : ze(e, Dt);
}
function ma(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Xe) === 0 || (t.f & On) === 0 || (t.f ^= On, ma(
        /** @type {Derived} */
        t.deps
      ));
}
function wa(e, t, n) {
  (e.f & Ye) !== 0 ? t.add(e) : (e.f & Dt) !== 0 && n.add(e), ma(e.deps), ze(e, We);
}
let Tr = !1;
function Ki(e) {
  var t = Tr;
  try {
    return Tr = !1, [e(), Tr];
  } finally {
    Tr = t;
  }
}
function Xi(e, t, n, s = !0) {
  s && n();
  for (var a of t)
    e.addEventListener(a, n);
  Wr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function nr(e) {
  var t = we, n = me;
  kt(null), Gt(null);
  try {
    return e();
  } finally {
    kt(t), Gt(n);
  }
}
function Vi(e) {
  let t = 0, n = In(0), s;
  return () => {
    Ts() && (r(n), Fa(() => (t === 0 && (s = nn(() => e(() => hr(n)))), t += 1, () => {
      Qt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, hr(n));
      });
    })));
  };
}
var $i = Vn | tr;
function Ji(e, t, n, s) {
  new Zi(e, t, n, s);
}
class Zi {
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
  #b = Vi(() => (this.#d = In(this.#p), () => {
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
        me
      );
      l.b = this, l.f |= os, s(i);
    }, this.parent = /** @type {Effect} */
    me.b, this.transform_error = a ?? this.parent?.transform_error ?? ((i) => i), this.#s = As(() => {
      this.#h();
    }, $i);
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
        Ui();
        return;
      }
      n = !0, s && Ri(), this.#o !== null && Cn(this.#o, () => {
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
      n.append(s), this.#i = this.#v(() => mt(() => this.#l(s))), this.#u === 0 && (this.#e.before(n), this.#a = null, Cn(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        Se
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#p = 0, this.#i = mt(() => {
        this.#l(this.#e);
      }), this.#u > 0) {
        var t = this.#a = document.createDocumentFragment();
        Ps(this.#i, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#n = mt(() => n(this.#e));
      } else
        this.#w(
          /** @type {Batch} */
          Se
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
    wa(t, this.#f, this.#g);
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
    var n = me, s = we, a = tt;
    Gt(this.#s), kt(this.#s), $n(this.#s.ctx);
    try {
      return yn.ensure(), t();
    } catch (i) {
      return ba(i), null;
    } finally {
      Gt(n), kt(s), $n(a);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && Cn(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#c) && (this.#c = !0, Qt(() => {
      this.#c = !1, this.#d && Jn(this.#d, this.#p);
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
    Se?.is_fork ? (this.#i && Se.skip_effect(this.#i), this.#n && Se.skip_effect(this.#n), this.#o && Se.skip_effect(this.#o), Se.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#i && (dt(this.#i), this.#i = null), this.#n && (dt(this.#n), this.#n = null), this.#o && (dt(this.#o), this.#o = null);
    let n = this.#t.failed;
    const s = (a) => {
      const { reset: i, invoke_onerror: l } = this.#m(a);
      l(), n && (this.#o = this.#v(() => {
        try {
          return mt(() => {
            var u = (
              /** @type {Effect} */
              me
            );
            u.b = this, u.f |= os, n(
              this.#e,
              () => a,
              () => i
            );
          });
        } catch (u) {
          return _n(
            u,
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
function Qi(e, t, n, s) {
  const a = vr;
  var i = e.filter((h) => !h.settled), l = t.map(a);
  if (n.length === 0 && i.length === 0) {
    s(l);
    return;
  }
  var u = (
    /** @type {Effect} */
    me
  ), o = el(), c = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function g(h) {
    if ((u.f & ht) === 0) {
      o();
      try {
        s([...l, ...h]);
      } catch (b) {
        _n(b, u);
      }
      Fr();
    }
  }
  var m = ya();
  if (n.length === 0) {
    c.then(() => g([])).finally(m);
    return;
  }
  function _() {
    Promise.all(n.map((h) => /* @__PURE__ */ tl(h))).then(g).catch((h) => _n(h, u)).finally(m);
  }
  c ? c.then(() => {
    o(), _(), Fr();
  }) : _();
}
function el() {
  var e = (
    /** @type {Effect} */
    me
  ), t = we, n = tt, s = (
    /** @type {Batch} */
    Se
  );
  return function(i = !0) {
    Gt(e), kt(t), $n(n), i && (e.f & ht) === 0 && (s?.activate(), s?.apply());
  };
}
function Fr(e = !0) {
  Gt(null), kt(null), $n(null), e && Se?.deactivate();
}
function ya() {
  var e = (
    /** @type {Effect} */
    me
  ), t = e.b, n = (
    /** @type {Batch} */
    Se
  ), s = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(s, e), () => {
    t?.update_pending_count(-1, n), n.decrement(s, e);
  };
}
// @__NO_SIDE_EFFECTS__
function vr(e) {
  var t = Xe | Ye;
  return me !== null && (me.f |= tr), {
    ctx: tt,
    deps: null,
    effects: null,
    equals: va,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Ue
    ),
    wv: 0,
    parent: me,
    ac: null
  };
}
const lr = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function tl(e, t, n) {
  let s = (
    /** @type {Effect | null} */
    me
  );
  s === null && mi();
  var a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = In(
    /** @type {V} */
    Ue
  ), l = !we, u = /* @__PURE__ */ new Set();
  return _l(() => {
    var o = (
      /** @type {Effect} */
      me
    ), c = ca();
    a = c.promise;
    try {
      Promise.resolve(e()).then(c.resolve, (h) => {
        h !== _r && c.reject(h);
      }).finally(Fr);
    } catch (h) {
      c.reject(h), Fr();
    }
    var g = (
      /** @type {Batch} */
      Se
    );
    if (l) {
      if ((o.f & er) !== 0)
        var m = ya();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        s.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(lr);
      else
        for (const h of u.values())
          h.reject(lr);
      u.add(c), g.async_deriveds.set(o, c);
    }
    const _ = (h, b = void 0) => {
      m?.(), u.delete(c), b !== lr && (g.activate(), b ? (i.f |= mn, Jn(i, b)) : ((i.f & mn) !== 0 && (i.f ^= mn), Jn(i, h)), g.deactivate());
    };
    c.promise.then(_, (h) => _(null, h || "unknown"));
  }), Wr(() => {
    for (const o of u)
      o.reject(lr);
  }), new Promise((o) => {
    function c(g) {
      function m() {
        g === a ? o(i) : c(a);
      }
      g.then(m, m);
    }
    c(a);
  });
}
// @__NO_SIDE_EFFECTS__
function se(e) {
  const t = /* @__PURE__ */ vr(e);
  return Ha(t), t;
}
// @__NO_SIDE_EFFECTS__
function xa(e) {
  const t = /* @__PURE__ */ vr(e);
  return t.equals = pa, t;
}
function nl(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      dt(
        /** @type {Effect} */
        t[n]
      );
  }
}
function ks(e) {
  var t, n = me, s = e.parent;
  if (!sn && s !== null && e.v !== Ue && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (s.f & (ht | st)) !== 0)
    return Bi(), e.v;
  Gt(s);
  try {
    e.f &= ~On, nl(e), t = Wa(e);
  } finally {
    Gt(n);
  }
  return t;
}
function ka(e) {
  var t = ks(e);
  if (!e.equals(t) && (e.wv = qa(), (!Se?.is_fork || e.deps === null) && (Se !== null ? (Se.capture(e, t, !0), hs?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    ze(e, We);
    return;
  }
  sn || (Ft !== null ? (Ts() || Se?.is_fork) && Ft.set(e, t) : xs(e));
}
function rl(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && nr(() => {
        t.ac.abort(_r), t.ac = null;
      }), t.fn !== null && (t.teardown = Rr), pr(t, 0), Rs(t));
}
function Sa(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Zn(t);
}
let Zr = null, qn = null, Se = null, hs = null, Ft = null, vs = null, fr = !1, Qr = !1, Wn = null, Pr = null;
var Ls = 0;
let sl = 1;
class yn {
  id = sl++;
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
    qn === null ? Zr = qn = this : (qn.#t = this, this.#r = qn), qn = this;
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
        ze(a, Ye), n(a);
      for (a of s.m)
        ze(a, Dt), n(a);
    }
    this.#g.add(t);
  }
  #_() {
    this.#e = !0, Ls++ > 1e3 && (this.#v(), il());
    for (const o of this.#u)
      this.#c.delete(o), ze(o, Ye), this.schedule(o);
    for (const o of this.#c)
      ze(o, Dt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Wn = [], s = [], a = Pr = [];
    for (const o of t)
      try {
        this.#y(o, n, s);
      } catch (c) {
        throw Ma(o), this.#b() || this.discard(), c;
      }
    if (Se = null, a.length > 0) {
      var i = yn.ensure();
      for (const o of a)
        i.schedule(o);
    }
    if (Wn = null, Pr = null, this.#b()) {
      this.#h(s), this.#h(n);
      for (const [o, c] of this.#f)
        Ta(o, c);
      a.length > 0 && /** @type {unknown} */
      Se.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(s), this.#h(n), l.#x(this);
      return;
    }
    this.#u.clear(), this.#c.clear();
    for (const o of this.#l) o(this);
    this.#l.clear(), hs = this, Ds(s), Ds(n), hs = null, this.#o?.resolve();
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      Se
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
    t.f ^= We;
    for (var a = t.first; a !== null; ) {
      var i = a.f, l = (i & (xt | rn)) !== 0, u = l && (i & We) !== 0, o = u || (i & st) !== 0 || this.#f.has(a);
      if (!o && a.fn !== null) {
        l ? a.f ^= We : (i & Xn) !== 0 ? n.push(a) : mr(a) && ((i & It) !== 0 && this.#c.add(a), Zn(a));
        var c = a.first;
        if (c !== null) {
          a = c;
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
    t.async_deriveds.clear(), this.transfer_effects(t.#u, t.#c);
    const n = (s) => {
      var a = s.reactions;
      if (a !== null && !((s.f & Xe) !== 0 && (s.f & (Ye | Dt)) === 0))
        for (const u of a) {
          var i = u.f;
          if ((i & Xe) !== 0)
            n(
              /** @type {Derived} */
              u
            );
          else {
            var l = (
              /** @type {Effect} */
              u
            );
            i & (Kn | It) && !this.async_deriveds.has(l) && (this.#c.delete(l), ze(l, Ye), this.schedule(l));
          }
        }
    };
    for (const s of this.current.keys())
      n(s);
    this.oncommit(() => t.discard()), t.#v(), Se = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      wa(t[n], this.#u, this.#c);
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
    Se = this;
  }
  deactivate() {
    Se = null, Ft = null;
  }
  flush() {
    try {
      Qr = !0, Se = this, this.#_();
    } finally {
      Ls = 0, vs = null, Wn = null, Pr = null, Qr = !1, Se = null, Ft = null, Pn.clear();
    }
  }
  discard() {
    for (const t of this.#s) t(this);
    this.#s.clear();
    for (const t of this.async_deriveds.values())
      t.reject(lr);
    this.#v(), this.#o?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let m = Zr; m !== null; m = m.#t) {
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
                (h.f & (It | Kn)) !== 0 ? m.schedule(h) : m.#h([h]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (var o of n)
            Ea(o, i, l, u);
          u = /* @__PURE__ */ new Map();
          var c = [...m.current].filter(([_, h]) => {
            const b = this.current.get(_);
            return b ? b[0] !== h[0] || b[1] !== h[1] : !0;
          }).map(([_]) => _);
          if (c.length > 0)
            for (const _ of this.#p)
              (_.f & (ht | st | Or)) === 0 && Ss(_, c, u) && ((_.f & (Kn | It)) !== 0 ? (ze(_, Ye), m.schedule(_)) : m.#u.add(_));
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
    return (this.#o ??= ca()).promise;
  }
  static ensure() {
    if (Se === null) {
      const t = Se = new yn();
      !Qr && !fr && Qt(() => {
        t.#e || t.flush();
      });
    }
    return Se;
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
    if (vs = t, t.b?.is_pending && (t.f & (Xn | Ur | da)) !== 0 && (t.f & er) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var s = n.f;
      if (Wn !== null && n === me && (we === null || (we.f & Xe) === 0))
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
      t === null ? Zr = n : t.#t = n, n === null ? qn = t : n.#r = t, this.linked = !1;
    }
  }
}
function al(e) {
  var t = fr;
  fr = !0;
  try {
    for (var n; ; ) {
      if (Yi(), Se === null)
        return (
          /** @type {T} */
          n
        );
      Se.flush();
    }
  } finally {
    fr = t;
  }
}
function il() {
  try {
    Si();
  } catch (e) {
    _n(e, vs);
  }
}
let Zt = null;
function Ds(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var s = e[n++];
      if ((s.f & (ht | st)) === 0 && mr(s) && (Zt = /* @__PURE__ */ new Set(), Zn(s), s.deps === null && s.first === null && s.nodes === null && s.teardown === null && s.ac === null && La(s), Zt?.size > 0)) {
        Pn.clear();
        for (const a of Zt) {
          if ((a.f & (ht | st)) !== 0) continue;
          const i = [a];
          let l = a.parent;
          for (; l !== null; )
            Zt.has(l) && (Zt.delete(l), i.push(l)), l = l.parent;
          for (let u = i.length - 1; u >= 0; u--) {
            const o = i[u];
            (o.f & (ht | st)) === 0 && Zn(o);
          }
        }
        Zt.clear();
      }
    }
    Zt = null;
  }
}
function Ea(e, t, n, s) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const i = a.f;
      (i & Xe) !== 0 ? Ea(
        /** @type {Derived} */
        a,
        t,
        n,
        s
      ) : (i & (Kn | It)) !== 0 && (i & Ye) === 0 && Ss(a, t, s) && (ze(a, Ye), Es(
        /** @type {Effect} */
        a
      ));
    }
}
function Ss(e, t, n) {
  const s = n.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (Nr.call(t, a))
        return !0;
      if ((a.f & Xe) !== 0 && Ss(
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
function Es(e) {
  Se.schedule(e);
}
function Ta(e, t) {
  if (!((e.f & xt) !== 0 && (e.f & We) !== 0)) {
    (e.f & Ye) !== 0 ? t.d.push(e) : (e.f & Dt) !== 0 && t.m.push(e), ze(e, We);
    for (var n = e.first; n !== null; )
      Ta(n, t), n = n.next;
  }
}
function Ma(e) {
  ze(e, We);
  for (var t = e.first; t !== null; )
    Ma(t), t = t.next;
}
let zr = /* @__PURE__ */ new Set();
const Pn = /* @__PURE__ */ new Map();
let Aa = !1;
function In(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: va,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function X(e, t) {
  const n = In(e);
  return Ha(n), n;
}
// @__NO_SIDE_EFFECTS__
function ll(e, t = !1, n = !0) {
  const s = In(e);
  return t || (s.equals = pa), s;
}
function x(e, t, n = !1) {
  we !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Lt || (we.f & Or) !== 0) && ga() && (we.f & (Xe | It | Kn | Or)) !== 0 && (Yt === null || !Yt.has(e)) && Ai();
  let s = n ? Ie(t) : t;
  return Jn(e, s, Pr);
}
function Jn(e, t, n = null) {
  if (!e.equals(t)) {
    Pn.set(e, sn ? t : e.v);
    var s = yn.ensure();
    if (s.capture(e, t), (e.f & Xe) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & Ye) !== 0 && ks(a), Ft === null && xs(a);
    }
    e.wv = qa(), Ra(e, Ye, n), me !== null && (me.f & We) !== 0 && (me.f & (xt | rn)) === 0 && (bt === null ? wl([e]) : bt.push(e)), !s.is_fork && zr.size > 0 && !Aa && ol();
  }
  return t;
}
function ol() {
  Aa = !1;
  for (const e of zr) {
    (e.f & We) !== 0 && ze(e, Dt);
    let t;
    try {
      t = mr(e);
    } catch {
      t = !0;
    }
    t && Zn(e);
  }
  zr.clear();
}
function ul(e, t = 1) {
  var n = r(e), s = t === 1 ? n++ : n--;
  return x(e, n), s;
}
function hr(e) {
  x(e, e.v + 1);
}
function Ra(e, t, n) {
  var s = e.reactions;
  if (s !== null)
    for (var a = s.length, i = 0; i < a; i++) {
      var l = s[i], u = l.f, o = (u & Ye) === 0;
      if (o && ze(l, t), (u & Or) !== 0)
        zr.add(
          /** @type {Effect} */
          l
        );
      else if ((u & Xe) !== 0) {
        var c = (
          /** @type {Derived} */
          l
        );
        Ft?.delete(c), (u & On) === 0 && (u & yt && (me === null || (me.f & Ir) === 0) && (l.f |= On), Ra(c, Dt, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (u & It) !== 0 && Zt !== null && Zt.add(g), n !== null ? n.push(g) : Es(g);
      }
    }
}
function Ie(e) {
  if (typeof e != "object" || e === null || Rn in e)
    return e;
  const t = ua(e);
  if (t !== ci && t !== di)
    return e;
  var n = /* @__PURE__ */ new Map(), s = ys(e), a = /* @__PURE__ */ X(0), i = Nn, l = (u) => {
    if (Nn === i)
      return u();
    var o = we, c = Nn;
    kt(null), Bs(i);
    var g = u();
    return kt(o), Bs(c), g;
  };
  return s && n.set("length", /* @__PURE__ */ X(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && Ti();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var m = /* @__PURE__ */ X(c.value);
          return n.set(o, m), m;
        }) : x(g, c.value, !0), !0;
      },
      deleteProperty(u, o) {
        var c = n.get(o);
        if (c === void 0) {
          if (o in u) {
            const g = l(() => /* @__PURE__ */ X(Ue));
            n.set(o, g), hr(a);
          }
        } else
          x(c, Ue), hr(a);
        return !0;
      },
      get(u, o, c) {
        if (o === Rn)
          return e;
        var g = n.get(o), m = o in u;
        if (g === void 0 && (!m || Gn(u, o)?.writable) && (g = l(() => {
          var h = Ie(m ? u[o] : Ue), b = /* @__PURE__ */ X(h);
          return b;
        }), n.set(o, g)), g !== void 0) {
          var _ = r(g);
          return _ === Ue ? void 0 : _;
        }
        return Reflect.get(u, o, c);
      },
      getOwnPropertyDescriptor(u, o) {
        var c = Reflect.getOwnPropertyDescriptor(u, o);
        if (c && "value" in c) {
          var g = n.get(o);
          g && (c.value = r(g));
        } else if (c === void 0) {
          var m = n.get(o), _ = m?.v;
          if (m !== void 0 && _ !== Ue)
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return c;
      },
      has(u, o) {
        if (o === Rn)
          return !0;
        var c = n.get(o), g = c !== void 0 && c.v !== Ue || Reflect.has(u, o);
        if (c !== void 0 || me !== null && (!g || Gn(u, o)?.writable)) {
          c === void 0 && (c = l(() => {
            var _ = g ? Ie(u[o]) : Ue, h = /* @__PURE__ */ X(_);
            return h;
          }), n.set(o, c));
          var m = r(c);
          if (m === Ue)
            return !1;
        }
        return g;
      },
      set(u, o, c, g) {
        var m = n.get(o), _ = o in u;
        if (s && o === "length")
          for (var h = c; h < /** @type {Source<number>} */
          m.v; h += 1) {
            var b = n.get(h + "");
            b !== void 0 ? x(b, Ue) : h in u && (b = l(() => /* @__PURE__ */ X(Ue)), n.set(h + "", b));
          }
        if (m === void 0)
          (!_ || Gn(u, o)?.writable) && (m = l(() => /* @__PURE__ */ X(void 0)), x(m, Ie(c)), n.set(o, m));
        else {
          _ = m.v !== Ue;
          var w = l(() => Ie(c));
          x(m, w);
        }
        var d = Reflect.getOwnPropertyDescriptor(u, o);
        if (d?.set && d.set.call(g, c), !_) {
          if (s && typeof o == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= v.v && x(v, y + 1);
          }
          hr(a);
        }
        return !0;
      },
      ownKeys(u) {
        r(a);
        var o = Reflect.ownKeys(u).filter((m) => {
          var _ = n.get(m);
          return _ === void 0 || _.v !== Ue;
        });
        for (var [c, g] of n)
          g.v !== Ue && !(c in u) && o.push(c);
        return o;
      },
      setPrototypeOf() {
        Mi();
      }
    }
  );
}
function js(e) {
  try {
    if (e !== null && typeof e == "object" && Rn in e)
      return e[Rn];
  } catch {
  }
  return e;
}
function cl(e, t) {
  return Object.is(js(e), js(t));
}
var wn, Pa, Ca, Na;
function dl() {
  if (wn === void 0) {
    wn = window, Pa = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ca = Gn(t, "firstChild").get, Na = Gn(t, "nextSibling").get, zs(e) && (e[cs] = void 0, e[fa] = null, e[ds] = void 0, e.__e = void 0), zs(n) && (n[fs] = void 0);
  }
}
function tn(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Lr(e) {
  return (
    /** @type {TemplateNode | null} */
    Ca.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function br(e) {
  return (
    /** @type {TemplateNode | null} */
    Na.call(e)
  );
}
function f(e, t) {
  return /* @__PURE__ */ Lr(e);
}
function ct(e, t = !1) {
  {
    var n = /* @__PURE__ */ Lr(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ br(n) : n;
  }
}
function p(e, t = 1, n = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ br(s);
  return s;
}
function fl(e) {
  e.textContent = "";
}
function Oa() {
  return !1;
}
function hl(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function vl(e) {
  me === null && (we === null && ki(), xi()), sn && yi();
}
function pl(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function an(e, t) {
  var n = me;
  n !== null && (n.f & st) !== 0 && (e |= st);
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
  Se?.register_created_effect(s);
  var a = s;
  if ((e & Xn) !== 0)
    Wn !== null ? Wn.push(s) : yn.ensure().schedule(s);
  else if (t !== null) {
    try {
      Zn(s);
    } catch (l) {
      throw dt(s), l;
    }
    a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
    (a.f & tr) === 0 && (a = a.first, (e & It) !== 0 && (e & Vn) !== 0 && a !== null && (a.f |= Vn));
  }
  if (a !== null && (a.parent = n, n !== null && pl(a, n), we !== null && (we.f & Xe) !== 0 && (e & rn) === 0)) {
    var i = (
      /** @type {Derived} */
      we
    );
    (i.effects ??= []).push(a);
  }
  return s;
}
function Ts() {
  return we !== null && !Lt;
}
function Wr(e) {
  const t = an(Ur, null);
  return ze(t, We), t.teardown = e, t;
}
function zt(e) {
  vl();
  var t = (
    /** @type {Effect} */
    me.f
  ), n = !we && (t & xt) !== 0 && tt !== null && !tt.i;
  if (n) {
    var s = (
      /** @type {ComponentContext} */
      tt
    );
    (s.e ??= []).push(e);
  } else
    return Ia(e);
}
function Ia(e) {
  return an(Xn | vi, e);
}
function gl(e) {
  yn.ensure();
  const t = an(rn | tr, e);
  return (n = {}) => new Promise((s) => {
    n.outro ? Cn(t, () => {
      dt(t), s(void 0);
    }) : (dt(t), s(void 0));
  });
}
function Ms(e) {
  return an(Xn, e);
}
function _l(e) {
  return an(Kn | tr, e);
}
function Fa(e, t = 0) {
  return an(Ur | t, e);
}
function W(e, t = [], n = [], s = []) {
  Qi(s, t, n, (a) => {
    an(Ur, () => {
      e(...a.map(r));
    });
  });
}
function As(e, t = 0) {
  var n = an(It | t, e);
  return n;
}
function mt(e) {
  return an(xt | tr, e);
}
function za(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = sn, s = we;
    Hs(!0), kt(null);
    try {
      t.call(null);
    } finally {
      Hs(n), kt(s);
    }
  }
}
function Rs(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && nr(() => {
      a.abort(_r);
    });
    var s = n.next;
    (n.f & rn) !== 0 ? n.parent = null : dt(n, t), n = s;
  }
}
function bl(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & xt) === 0 && dt(t), t = n;
  }
}
function dt(e, t = !0) {
  var n = !1;
  (t || (e.f & hi) !== 0) && e.nodes !== null && e.nodes.end !== null && (ml(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= us, Rs(e, t && !n), pr(e, 0);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const i of s)
      i.stop();
  za(e), e.f ^= us, e.f |= ht;
  var a = e.parent;
  a !== null && a.first !== null && La(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function ml(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ br(e);
    e.remove(), e = n;
  }
}
function La(e) {
  var t = e.parent, n = e.prev, s = e.next;
  n !== null && (n.next = s), s !== null && (s.prev = n), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = n));
}
function Cn(e, t, n = !0) {
  var s = [];
  Da(e, s, !0);
  var a = () => {
    n && dt(e), t && t();
  }, i = s.length;
  if (i > 0) {
    var l = () => --i || a();
    for (var u of s)
      u.out(l);
  } else
    a();
}
function Da(e, t, n) {
  if ((e.f & st) === 0) {
    e.f ^= st;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || n) && t.push(u);
    for (var a = e.first; a !== null; ) {
      var i = a.next;
      if ((a.f & rn) === 0) {
        var l = (a.f & Vn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (a.f & xt) !== 0 && (e.f & It) !== 0;
        Da(a, t, l ? n : !1);
      }
      a = i;
    }
  }
}
function Dr(e) {
  ja(e, !0);
}
function ja(e, t) {
  if ((e.f & st) !== 0) {
    e.f ^= st, (e.f & We) === 0 && (ze(e, Ye), yn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var s = n.next, a = (n.f & Vn) !== 0 || (n.f & xt) !== 0;
      ja(n, a ? t : !1), n = s;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function Ps(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, s = e.nodes.end; n !== null; ) {
      var a = n === s ? null : /* @__PURE__ */ br(n);
      t.append(n), n = a;
    }
}
let Cr = !1, sn = !1;
function Hs(e) {
  sn = e;
}
let we = null, Lt = !1;
function kt(e) {
  we = e;
}
let me = null;
function Gt(e) {
  me = e;
}
let Yt = null;
function Ha(e) {
  we !== null && (Yt ??= /* @__PURE__ */ new Set()).add(e);
}
let ut = null, ft = 0, bt = null;
function wl(e) {
  bt = e;
}
let Ba = 1, Mn = 0, Nn = Mn;
function Bs(e) {
  Nn = e;
}
function qa() {
  return ++Ba;
}
function mr(e) {
  var t = e.f;
  if ((t & Ye) !== 0)
    return !0;
  if (t & Xe && (e.f &= ~On), (t & Dt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), s = n.length, a = 0; a < s; a++) {
      var i = n[a];
      if (mr(
        /** @type {Derived} */
        i
      ) && ka(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & yt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ft === null && ze(e, We);
  }
  return !1;
}
function Ua(e, t, n = !0) {
  var s = e.reactions;
  if (s !== null && !(Yt !== null && Yt.has(e)))
    for (var a = 0; a < s.length; a++) {
      var i = s[a];
      (i.f & Xe) !== 0 ? Ua(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? ze(i, Ye) : (i.f & We) !== 0 && ze(i, Dt), Es(
        /** @type {Effect} */
        i
      ));
    }
}
function Wa(e) {
  var t = ut, n = ft, s = bt, a = we, i = Yt, l = tt, u = Lt, o = Nn, c = e.f;
  ut = /** @type {null | Value[]} */
  null, ft = 0, bt = null, we = (c & (xt | rn)) === 0 ? e : null, Yt = null, $n(e.ctx), Lt = !1, Nn = ++Mn, e.ac !== null && (nr(() => {
    e.ac.abort(_r);
  }), e.ac = null);
  try {
    e.f |= Ir;
    var g = (
      /** @type {Function} */
      e.fn
    ), m = g();
    e.f |= er;
    var _ = e.deps, h = Se?.is_fork;
    if (ut !== null) {
      var b;
      if (h || pr(e, ft), _ !== null && ft > 0)
        for (_.length = ft + ut.length, b = 0; b < ut.length; b++)
          _[ft + b] = ut[b];
      else
        e.deps = _ = ut;
      if (Ts() && (e.f & yt) !== 0)
        for (b = ft; b < _.length; b++)
          (_[b].reactions ??= []).push(e);
    } else !h && _ !== null && ft < _.length && (pr(e, ft), _.length = ft);
    if (ga() && bt !== null && !Lt && _ !== null && (e.f & (Xe | Dt | Ye)) === 0)
      for (b = 0; b < /** @type {Source[]} */
      bt.length; b++)
        Ua(
          bt[b],
          /** @type {Effect} */
          e
        );
    if (a !== null && a !== e) {
      if (Mn++, a.deps !== null)
        for (let w = 0; w < n; w += 1)
          a.deps[w].rv = Mn;
      if (t !== null)
        for (const w of t)
          w.rv = Mn;
      bt !== null && (s === null ? s = bt : s.push(.../** @type {Source[]} */
      bt));
    }
    return (e.f & mn) !== 0 && (e.f ^= mn), m;
  } catch (w) {
    return ba(w);
  } finally {
    e.f ^= Ir, ut = t, ft = n, bt = s, we = a, Yt = i, $n(l), Lt = u, Nn = o;
  }
}
function yl(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var s = li.call(n, e);
    if (s !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[s] = n[a], n.pop());
    }
  }
  if (n === null && (t.f & Xe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ut === null || !Nr.call(ut, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & yt) !== 0 && (i.f ^= yt, i.f &= ~On), i.v !== Ue && xs(i), i.ac !== null && nr(() => {
      i.ac.abort(_r), i.ac = null, ze(i, Ye);
    }), rl(i), pr(i, 0);
  }
}
function pr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var s = t; s < n.length; s++)
      yl(e, n[s]);
}
function Zn(e) {
  var t = e.f;
  if ((t & ht) === 0) {
    ze(e, We);
    var n = me, s = Cr;
    me = e, Cr = (t & (xt | rn)) === 0;
    try {
      (t & (It | da)) !== 0 ? bl(e) : Rs(e), za(e);
      var a = Wa(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Ba;
      var i;
    } finally {
      Cr = s, me = n;
    }
  }
}
async function xl() {
  await Promise.resolve(), al();
}
function r(e) {
  var t = e.f, n = (t & Xe) !== 0;
  if (we !== null && !Lt) {
    var s = me !== null && (me.f & ht) !== 0;
    if (!s && (Yt === null || !Yt.has(e))) {
      var a = we.deps;
      if ((we.f & Ir) !== 0)
        e.rv < Mn && (e.rv = Mn, ut === null && a !== null && a[ft] === e ? ft++ : ut === null ? ut = [e] : ut.push(e));
      else {
        we.deps ??= [], Nr.call(we.deps, e) || we.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [we] : Nr.call(i, we) || i.push(we);
      }
    }
  }
  if (sn && Pn.has(e))
    return Pn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (sn) {
      var u = l.v;
      return ((l.f & We) === 0 && l.reactions !== null || Ga(l)) && (u = ks(l)), Pn.set(l, u), u;
    }
    var o = (l.f & yt) === 0 && !Lt && we !== null && (Cr || (we.f & yt) !== 0), c = (l.f & er) === 0;
    mr(l) && (o && (l.f |= yt), ka(l)), o && !c && (Sa(l), Ya(l));
  }
  if (Ft?.has(e))
    return Ft.get(e);
  if ((e.f & mn) !== 0)
    throw e.v;
  return e.v;
}
function Ya(e) {
  if (e.f |= yt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Xe) !== 0 && (t.f & yt) === 0 && (Sa(
        /** @type {Derived} */
        t
      ), Ya(
        /** @type {Derived} */
        t
      ));
}
function Ga(e) {
  if (e.v === Ue) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Pn.has(t) || (t.f & Xe) !== 0 && Ga(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function nn(e) {
  var t = Lt;
  try {
    return Lt = !0, e();
  } finally {
    Lt = t;
  }
}
const kl = ["touchstart", "touchmove"];
function Sl(e) {
  return kl.includes(e);
}
const or = Symbol("events"), Ka = /* @__PURE__ */ new Set(), ps = /* @__PURE__ */ new Set();
function El(e, t, n, s = {}) {
  function a(i) {
    if (s.capture || gs.call(t, i), !i.cancelBubble)
      return nr(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Qt(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function An(e, t, n, s, a) {
  var i = { capture: s, passive: a }, l = El(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Wr(() => {
    t.removeEventListener(e, l, i);
  });
}
function Q(e, t, n) {
  (t[or] ??= {})[e] = n;
}
function jt(e) {
  for (var t = 0; t < e.length; t++)
    Ka.add(e[t]);
  for (var n of ps)
    n(e);
}
let qs = null;
function gs(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  qs = e;
  var l = 0, u = qs === e && e[or];
  if (u) {
    var o = a.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[or] = t;
      return;
    }
    var c = a.indexOf(t);
    if (c === -1)
      return;
    o <= c && (l = o);
  }
  if (i = /** @type {Element} */
  a[l] || e.target, i !== t) {
    oi(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = we, m = me;
    kt(null), Gt(null);
    try {
      for (var _, h = []; i !== null && i !== t; ) {
        try {
          var b = i[or]?.[s];
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
      e[or] = t, delete e.currentTarget, kt(g), Gt(m);
    }
  }
}
const Tl = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Ml(e) {
  return (
    /** @type {string} */
    Tl?.createHTML(e) ?? e
  );
}
function Al(e) {
  var t = hl("template");
  return t.innerHTML = Ml(e.replaceAll("<!>", "<!---->")), t.content;
}
function jr(e, t) {
  var n = (
    /** @type {Effect} */
    me
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var n = (t & Di) !== 0, s = (t & ji) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Al(i ? e : "<!>" + e), n || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Lr(a)));
    var l = (
      /** @type {TemplateNode} */
      s || Pa ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (n) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Lr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      jr(u, o);
    } else
      jr(l, l);
    return l;
  };
}
function Yn(e = "") {
  {
    var t = tn(e + "");
    return jr(t, t), t;
  }
}
function Cs() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = tn();
  return e.append(t, n), jr(t, n), e;
}
function C(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function A(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[fs] ??= e.nodeValue) && (e[fs] = n, e.nodeValue = `${n}`);
}
function Rl(e, t) {
  return Pl(e, t);
}
const Mr = /* @__PURE__ */ new Map();
function Pl(e, { target: t, anchor: n, props: s = {}, events: a, context: i, intro: l = !0, transformError: u }) {
  dl();
  var o = void 0, c = gl(() => {
    var g = n ?? t.appendChild(tn());
    Ji(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (h) => {
        vt({});
        var b = (
          /** @type {ComponentContext} */
          tt
        );
        i && (b.c = i), a && (s.$$events = a), o = e(h, s) || {}, pt();
      },
      u
    );
    var m = /* @__PURE__ */ new Set(), _ = (h) => {
      for (var b = 0; b < h.length; b++) {
        var w = h[b];
        if (!m.has(w)) {
          m.add(w);
          var d = Sl(w);
          for (const R of [t, document]) {
            var v = Mr.get(R);
            v === void 0 && (v = /* @__PURE__ */ new Map(), Mr.set(R, v));
            var y = v.get(w);
            y === void 0 ? (R.addEventListener(w, gs, { passive: d }), v.set(w, 1)) : v.set(w, y + 1);
          }
        }
      }
    };
    return _(qr(Ka)), ps.add(_), () => {
      for (var h of m)
        for (const d of [t, document]) {
          var b = (
            /** @type {Map<string, number>} */
            Mr.get(d)
          ), w = (
            /** @type {number} */
            b.get(h)
          );
          --w == 0 ? (d.removeEventListener(h, gs), b.delete(h), b.size === 0 && Mr.delete(d)) : b.set(h, w);
        }
      ps.delete(_), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return Cl.set(o, c), o;
}
let Cl = /* @__PURE__ */ new WeakMap();
class Nl {
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
        Dr(s), this.#l.delete(n);
      else {
        var a = this.#t.get(n);
        a && (Dr(a.effect), this.#r.set(n, a.effect), this.#t.delete(n), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [i, l] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const u = this.#t.get(l);
        u && (dt(u.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#r) {
        if (i === n || this.#l.has(i)) continue;
        const u = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var c = document.createDocumentFragment();
            Ps(l, c), c.append(tn()), this.#t.set(i, { effect: l, fragment: c });
          } else
            dt(l);
          this.#l.delete(i), this.#r.delete(i);
        };
        this.#s || !s ? (this.#l.add(i), Cn(l, u, !1)) : u();
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
      n.includes(s) || (dt(a.effect), this.#t.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var s = (
      /** @type {Batch} */
      Se
    ), a = Oa();
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
      for (const [u, o] of this.#r)
        u === t ? s.unskip_effect(o) : s.skip_effect(o);
      for (const [u, o] of this.#t)
        u === t ? s.unskip_effect(o.effect) : s.skip_effect(o.effect);
      s.oncommit(this.#i), s.ondiscard(this.#n);
    } else
      this.#i(s);
  }
}
function te(e, t, n = !1) {
  var s = new Nl(e), a = n ? Vn : 0;
  function i(l, u) {
    s.ensure(l, u);
  }
  As(() => {
    var l = !1;
    t((u, o = 0) => {
      l = !0, i(o, u);
    }), l || i(-1, null);
  }, a);
}
function wt(e, t) {
  return t;
}
function Ol(e, t, n) {
  for (var s = [], a = t.length, i, l = t.length, u = 0; u < a; u++) {
    let m = t[u];
    Cn(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            _s(e, qr(i.done)), _.delete(i), _.size === 0 && (e.outrogroups = null);
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
      ), g = (
        /** @type {Element} */
        c.parentNode
      );
      fl(g), g.append(c), e.items.clear();
    }
    _s(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function _s(e, t, n = !0) {
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
      i.f |= Wt;
      const l = document.createDocumentFragment();
      Ps(i, l);
    } else
      dt(t[a], n);
  }
}
var Us;
function Je(e, t, n, s, a, i = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & ha) !== 0;
  if (o) {
    var c = (
      /** @type {Element} */
      e
    );
    l = c.appendChild(tn());
  }
  var g = null, m = /* @__PURE__ */ xa(() => {
    var R = n();
    return (
      /** @type {V[]} */
      ys(R) ? R : R == null ? [] : qr(R)
    );
  }), _, h = /* @__PURE__ */ new Map(), b = !0;
  function w(R) {
    (y.effect.f & ht) === 0 && (y.pending.delete(R), y.fallback = g, Il(y, _, l, t, s), g !== null && (_.length === 0 ? (g.f & Wt) === 0 ? Dr(g) : (g.f ^= Wt, ur(g, null, l)) : Cn(g, () => {
      g = null;
    })));
  }
  function d(R) {
    y.pending.delete(R);
  }
  var v = As(() => {
    _ = /** @type {V[]} */
    r(m);
    for (var R = _.length, F = /* @__PURE__ */ new Set(), q = (
      /** @type {Batch} */
      Se
    ), G = Oa(), Z = 0; Z < R; Z += 1) {
      var ne = _[Z], U = s(ne, Z), B = b ? null : u.get(U);
      B ? (B.v && Jn(B.v, ne), B.i && Jn(B.i, Z), G && q.unskip_effect(B.e)) : (B = Fl(
        u,
        b ? l : Us ??= tn(),
        ne,
        U,
        Z,
        a,
        t,
        n
      ), b || (B.e.f |= Wt), u.set(U, B)), F.add(U);
    }
    if (R === 0 && i && !g && (b ? g = mt(() => i(l)) : (g = mt(() => i(Us ??= tn())), g.f |= Wt)), R > F.size && wi(), !b)
      if (h.set(q, F), G) {
        for (const [K, N] of u)
          F.has(K) || q.skip_effect(N.e);
        q.oncommit(w), q.ondiscard(d);
      } else
        w(q);
    r(m);
  }), y = { effect: v, items: u, pending: h, outrogroups: null, fallback: g };
  b = !1;
}
function ar(e) {
  for (; e !== null && (e.f & xt) === 0; )
    e = e.next;
  return e;
}
function Il(e, t, n, s, a) {
  var i = (s & Ni) !== 0, l = t.length, u = e.items, o = ar(e.effect.first), c, g = null, m, _ = [], h = [], b, w, d, v;
  if (i)
    for (v = 0; v < l; v += 1)
      b = t[v], w = a(b, v), d = /** @type {EachItem} */
      u.get(w).e, (d.f & Wt) === 0 && (d.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(d));
  for (v = 0; v < l; v += 1) {
    if (b = t[v], w = a(b, v), d = /** @type {EachItem} */
    u.get(w).e, e.outrogroups !== null)
      for (const B of e.outrogroups)
        B.pending.delete(d), B.done.delete(d);
    if ((d.f & st) !== 0 && (Dr(d), i && (d.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(d))), (d.f & Wt) !== 0)
      if (d.f ^= Wt, d === o)
        ur(d, null, n);
      else {
        var y = g ? g.next : o;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), hn(e, g, d), hn(e, d, y), ur(d, y, n), g = d, _ = [], h = [], o = ar(g.next);
        continue;
      }
    if (d !== o) {
      if (c !== void 0 && c.has(d)) {
        if (_.length < h.length) {
          var R = h[0], F;
          g = R.prev;
          var q = _[0], G = _[_.length - 1];
          for (F = 0; F < _.length; F += 1)
            ur(_[F], R, n);
          for (F = 0; F < h.length; F += 1)
            c.delete(h[F]);
          hn(e, q.prev, G.next), hn(e, g, q), hn(e, G, R), o = R, g = G, v -= 1, _ = [], h = [];
        } else
          c.delete(d), ur(d, o, n), hn(e, d.prev, d.next), hn(e, d, g === null ? e.effect.first : g.next), hn(e, g, d), g = d;
        continue;
      }
      for (_ = [], h = []; o !== null && o !== d; )
        (c ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = ar(o.next);
      if (o === null)
        continue;
    }
    (d.f & Wt) === 0 && _.push(d), g = d, o = ar(d.next);
  }
  if (e.outrogroups !== null) {
    for (const B of e.outrogroups)
      B.pending.size === 0 && (_s(e, qr(B.done)), e.outrogroups?.delete(B));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || c !== void 0) {
    var Z = [];
    if (c !== void 0)
      for (d of c)
        (d.f & st) === 0 && Z.push(d);
    for (; o !== null; )
      (o.f & st) === 0 && o !== e.fallback && Z.push(o), o = ar(o.next);
    var ne = Z.length;
    if (ne > 0) {
      var U = (s & ha) !== 0 && l === 0 ? n : null;
      if (i) {
        for (v = 0; v < ne; v += 1)
          Z[v].nodes?.a?.measure();
        for (v = 0; v < ne; v += 1)
          Z[v].nodes?.a?.fix();
      }
      Ol(e, Z, U);
    }
  }
  i && Qt(() => {
    if (m !== void 0)
      for (d of m)
        d.nodes?.a?.apply();
  });
}
function Fl(e, t, n, s, a, i, l, u) {
  var o = (l & Pi) !== 0 ? (l & Oi) === 0 ? /* @__PURE__ */ ll(n, !1, !1) : In(n) : null, c = (l & Ci) !== 0 ? In(a) : null;
  return {
    v: o,
    i: c,
    e: mt(() => (i(t, o ?? n, c ?? a, u), () => {
      e.delete(s);
    }))
  };
}
function ur(e, t, n) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, i = t && (t.f & Wt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; s !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ br(s)
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
  Ms(() => {
    var s = nn(() => t(e, n?.()) || {});
    if (s?.destroy)
      return () => (
        /** @type {Function} */
        s.destroy()
      );
  });
}
const Ws = [...` 	
\r\f \v\uFEFF`];
function zl(e, t, n) {
  var s = e == null ? "" : "" + e;
  if (n) {
    for (var a of Object.keys(n))
      if (n[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var i = a.length, l = 0; (l = s.indexOf(a, l)) >= 0; ) {
          var u = l + i;
          (l === 0 || Ws.includes(s[l - 1])) && (u === s.length || Ws.includes(s[u])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(u + 1) : l = u;
        }
  }
  return s === "" ? null : s;
}
function Ys(e, t = !1) {
  var n = t ? " !important;" : ";", s = "";
  for (var a of Object.keys(e)) {
    var i = e[a];
    i != null && i !== "" && (s += " " + a + ": " + i + n);
  }
  return s;
}
function Ll(e, t) {
  if (t) {
    var n = "", s, a;
    return Array.isArray(t) ? (s = t[0], a = t[1]) : s = t, s && (n += Ys(s)), a && (n += Ys(a, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Pe(e, t, n, s, a, i) {
  var l = (
    /** @type {any} */
    e[cs]
  );
  if (l !== n || l === void 0) {
    var u = zl(n, s, i);
    u == null ? e.removeAttribute("class") : e.className = u, e[cs] = n;
  } else if (i && a !== i)
    for (var o in i) {
      var c = !!i[o];
      (a == null || c !== !!a[o]) && e.classList.toggle(o, c);
    }
  return i;
}
function es(e, t = {}, n, s) {
  for (var a in n) {
    var i = n[a];
    t[a] !== i && (n[a] == null ? e.style.removeProperty(a) : e.style.setProperty(a, i, s));
  }
}
function en(e, t, n, s) {
  var a = (
    /** @type {any} */
    e[ds]
  );
  if (a !== t) {
    var i = Ll(t, s);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[ds] = t;
  } else s && (Array.isArray(s) ? (es(e, n?.[0], s[0]), es(e, n?.[1], s[1], "important")) : es(e, n, s));
  return s;
}
function cr(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ys(t))
      return qi();
    for (var s of e.options)
      s.selected = t.includes(Gs(s));
    return;
  }
  for (s of e.options) {
    var a = Gs(s);
    if (cl(a, t)) {
      s.selected = !0;
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
function Gs(e) {
  return "__value" in e ? e.__value : e.value;
}
const Dl = Symbol("is custom element"), jl = Symbol("is html"), Hl = _i ? "progress" : "PROGRESS";
function Sn(e, t) {
  var n = Ns(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== Hl) || (e.value = t ?? "");
}
function Bl(e, t) {
  var n = Ns(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function ve(e, t, n, s) {
  var a = Ns(e);
  a[t] !== (a[t] = n) && (t === "loading" && (e[gi] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && ql(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Ns(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[fa] ??= {
      [Dl]: e.nodeName.includes("-"),
      [jl]: e.namespaceURI === Hi
    }
  );
}
var Ks = /* @__PURE__ */ new Map();
function ql(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Ks.get(t);
  if (n) return n;
  Ks.set(t, n = []);
  for (var s, a = e, i = Element.prototype; i !== a; ) {
    s = ui(a);
    for (var l in s)
      s[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    a = ua(a);
  }
  return n;
}
class Os {
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
          Os.entries.set(n.target, n);
          for (var s of this.#e.get(n.target) || [])
            s(n);
        }
      }
    ));
  }
}
var Ul = /* @__PURE__ */ new Os({
  box: "border-box"
});
function Xs(e, t, n) {
  var s = Ul.observe(e, () => n(e[t]));
  Ms(() => (nn(() => n(e[t])), s));
}
function ts(e, t) {
  return e === t || e?.[Rn] === t;
}
function gr(e = {}, t, n, s) {
  var a = (
    /** @type {ComponentContext} */
    tt.r
  ), i = (
    /** @type {Effect} */
    me
  );
  return Ms(() => {
    var l, u;
    return Fa(() => {
      l = u, u = [], nn(() => {
        ts(n(...u), e) || (t(e, ...u), l && ts(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== a && o.parent !== null && o.parent.f & us; )
        o = o.parent;
      const c = () => {
        u && ts(n(...u), e) && t(null, ...u);
      }, g = o.teardown;
      o.teardown = () => {
        c(), g?.();
      };
    };
  }), e;
}
function Wl(e, t) {
  Xi(window, ["resize"], () => nr(() => t(window[e])));
}
function J(e, t, n, s) {
  var a = !0, i = (n & zi) !== 0, l = (n & Li) !== 0, u = (
    /** @type {V} */
    s
  ), o = !0, c = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && a ? (c ??= /* @__PURE__ */ vr(
    /** @type {() => V} */
    s
  ), r(c)) : (o && (o = !1, u = l ? nn(
    /** @type {() => V} */
    s
  ) : (
    /** @type {V} */
    s
  )), u);
  let m;
  if (i) {
    var _ = Rn in e || pi in e;
    m = Gn(e, t)?.set ?? (_ && t in e ? (F) => e[t] = F : void 0);
  }
  var h, b = !1;
  i ? [h, b] = Ki(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && s !== void 0 && (h = g(), m && (Ei(), m(h)));
  var w;
  if (w = () => {
    var F = (
      /** @type {V} */
      e[t]
    );
    return F === void 0 ? g() : (o = !0, F);
  }, (n & Fi) === 0)
    return w;
  if (m) {
    var d = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(F, q) {
        return arguments.length > 0 ? ((!q || d || b) && m(q ? w() : F), F) : w();
      })
    );
  }
  var v = !1, y = ((n & Ii) !== 0 ? vr : xa)(() => (v = !1, w()));
  i && r(y);
  var R = (
    /** @type {Effect} */
    me
  );
  return (
    /** @type {() => V} */
    (function(F, q) {
      if (arguments.length > 0) {
        const G = q ? r(y) : i ? Ie(F) : F;
        return x(y, G), v = !0, u !== void 0 && (u = G), F;
      }
      return sn && v || (R.f & ht) !== 0 ? y.v : r(y);
    })
  );
}
function rr(e) {
  tt === null && bi(), zt(() => {
    const t = nn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Yl = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Yl);
function Gl(e) {
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
  const n = await fetch(e + Gl(t));
  if (!n.ok) {
    const s = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${s.error ? " (" + s.error + ")" : ""}`);
  }
  return n.json();
}
async function Un(e, t) {
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
function Vs(e) {
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
  counts: (e, t) => Jt("/api/triage/counts", { ...Vs(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Jt("/api/triage/files"),
  screen: (e, t = {}) => Jt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Jt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Jt("/api/triage/page", { ...Vs(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Jt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => Un("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => Un("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => Un("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => Un("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => Un("/api/reveal", { id: e }),
  revealOrigin: (e) => Un("/api/reveal", { origin: e }),
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
function Kl() {
  let e = 0, t = 0;
  return async function(s) {
    const a = ++e, i = await s();
    return a <= t ? { stale: !0, value: void 0 } : (t = a, { stale: !1, value: i });
  };
}
function Xl(e, t) {
  let n = 0;
  const s = (...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  };
  return s.cancel = () => clearTimeout(n), s.now = (...a) => {
    clearTimeout(n), e(...a);
  }, s;
}
const $s = ["B", "KB", "MB", "GB", "TB"];
function Nt(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < $s.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${$s[n]}`;
}
function Oe(e) {
  return (Number(e) || 0).toLocaleString();
}
const Qn = "G:\\photos", Js = [
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
      value: t ? `${Qn}\\${t}\\${e.key}` : `${Qn}\\${e.key}`
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
function Xa(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), s = Qn.toLowerCase();
  return n.toLowerCase().startsWith(s + "\\") ? n : "";
}
function Is(e, t) {
  const n = t.toLowerCase();
  return e.some((s) => n === s || n.startsWith(s + "\\"));
}
function Vl(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function $l(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function Va(e, t) {
  if (!t) return null;
  const n = e.find(
    (s) => s.term && s.term.column === t.column && s.term.op === t.op && $l(s.term.value, t.value)
  );
  return n ? n.decision : null;
}
var Jl = /* @__PURE__ */ I('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), Zl = /* @__PURE__ */ I('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), Ql = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7">…</div>'), eo = /* @__PURE__ */ I('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), to = /* @__PURE__ */ I('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), no = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7"> </div>'), ro = /* @__PURE__ */ I('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function so(e, t) {
  vt(t, !0);
  let n = J(t, "counts", 3, null), s = J(t, "files", 3, null), a = J(t, "filesAt", 3, null), i = J(t, "stale", 3, !1), l = J(t, "candidate", 3, null), u = J(t, "busy", 3, !1);
  const o = /* @__PURE__ */ se(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var c = ro(), g = f(c);
  let m;
  var _ = p(f(g), 2);
  {
    var h = (U) => {
      var B = Zl(), K = ct(B), N = f(K), V = f(N), fe = p(N, 2), ue = f(fe), j = p(fe, 4), re = f(j), ye = p(j, 2), M = f(ye), z = p(K, 2);
      {
        var O = (Y) => {
          var P = Jl(), T = p(f(P), 2), H = f(T), ce = p(T, 2), pe = f(ce), ie = p(ce, 4), he = f(ie), Te = p(ie, 2), _e = f(Te), xe = p(Te, 2), Re = f(xe);
          W(
            (Ee, Ce, le, k, S) => {
              A(H, `kept ${Ee ?? ""}`), A(pe, Ce), A(he, `excluded ${le ?? ""}`), A(_e, k), A(Re, `${r(o) >= 0 ? "+" : ""}${S ?? ""} excluded`);
            },
            [
              () => Oe(n().candidate_kept_paths),
              () => Nt(n().candidate_kept_bytes),
              () => Oe(n().candidate_excluded_paths),
              () => Nt(n().candidate_excluded_bytes),
              () => Oe(r(o))
            ]
          ), C(Y, P);
        };
        te(z, (Y) => {
          l() && Y(O);
        });
      }
      W(
        (Y, P, T, H) => {
          A(V, `kept ${Y ?? ""}`), A(ue, P), A(re, `excluded ${T ?? ""}`), A(M, H);
        },
        [
          () => Oe(n().kept_paths),
          () => Nt(n().kept_bytes),
          () => Oe(n().excluded_paths),
          () => Nt(n().excluded_bytes)
        ]
      ), C(U, B);
    }, b = (U) => {
      var B = Ql();
      C(U, B);
    };
    te(_, (U) => {
      n() ? U(h) : U(b, -1);
    });
  }
  var w = p(g, 2);
  let d;
  var v = f(w), y = p(f(v), 3), R = f(y), F = p(y, 2);
  {
    var q = (U) => {
      var B = eo();
      C(U, B);
    };
    te(F, (U) => {
      i() && s() && s() !== "loading" && U(q);
    });
  }
  var G = p(v, 2);
  {
    var Z = (U) => {
      var B = to(), K = ct(B);
      let N;
      var V = f(K), fe = f(V), ue = p(V, 2), j = f(ue), re = p(ue, 4), ye = f(re), M = p(re, 2), z = f(M), O = p(K, 2), Y = f(O);
      W(
        (P, T, H, ce) => {
          N = Pe(K, 1, "line svelte-1vgp6n7", null, N, { outdated: i() }), A(fe, `kept ${P ?? ""}`), A(j, T), A(ye, `excluded ${H ?? ""}`), A(z, ce), A(Y, `as of ${a() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Oe(s().kept_files),
          () => Nt(s().kept_bytes),
          () => Oe(s().excluded_files),
          () => Nt(s().excluded_bytes)
        ]
      ), C(U, B);
    }, ne = (U) => {
      var B = no(), K = f(B);
      W(() => A(K, s() === "loading" ? "counting…" : "not counted yet")), C(U, B);
    };
    te(G, (U) => {
      s() && s() !== "loading" ? U(Z) : U(ne, -1);
    });
  }
  W(() => {
    m = Pe(g, 1, "block svelte-1vgp6n7", null, m, { busy: u() }), d = Pe(w, 1, "block svelte-1vgp6n7", null, d, { busy: s() === "loading" }), y.disabled = s() === "loading", A(R, s() === "loading" ? "counting…" : "recount");
  }), Q("click", y, function(...U) {
    t.onfiles?.apply(this, U);
  }), C(e, c), pt();
}
jt(["click"]);
const bs = "http://www.w3.org/2000/svg", En = {
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
  ...En,
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
}, ao = [
  { dark: "tint", light: "tintLight", base: En },
  { dark: "control", light: "controlLight", base: bn },
  { dark: "ink", light: "inkLight", base: bn },
  { dark: "tally", light: "tallyLight", base: bn },
  { dark: "tallyInk", light: "tallyInkLight", base: bn }
], ms = /* @__PURE__ */ new Set();
let Ot = { ...bn };
function io() {
  return Ot;
}
function ns(e) {
  Ot = uo(e), Fs();
  for (const t of ms) t(Ot);
  return Ot;
}
function lo(e) {
  return ms.add(e), () => ms.delete(e);
}
function dr(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function oo(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: Ge(dr(e.r, t.r), 0, 255),
    g: Ge(dr(e.g, t.g), 0, 255),
    b: Ge(dr(e.b, t.b), 0, 255),
    a: Ge(dr(e.a, t.a), 0, 1)
  };
}
function uo(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [s, a] of Object.entries(bn))
    typeof a == "boolean" ? n[s] = t[s] === void 0 ? a : !!t[s] : typeof a == "object" ? n[s] = oo(t[s], a) : n[s] = dr(t[s], a);
  return n;
}
function _t({ r: e, g: t, b: n, a: s }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Fe(s, 3)})`;
}
function Fe(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function Zs({ r: e, g: t, b: n, a: s }) {
  return { r: e, g: t, b: n, a: Ge(s * 1.7 + 0.22, 0, 1) };
}
function Qs(e, t) {
  const n = 0.4 + Ge(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - Ge(t, 0, 100) / 100) };
}
function ea(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, a = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? Ge(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * a * Math.max(t.glareFactor, 0) / 100;
  return Ge(i ** (0.1 + Ge(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const co = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function fo(e, t, n) {
  const s = Ge(n.shapeRoundness, 2, 7), a = e / 2, i = t / 2, l = Math.min(n.shapeRadius, a, i), u = a - l, o = i - l, c = 8, g = [];
  for (let h = 0; h <= c; h++) {
    const b = h / c * (Math.PI / 2);
    g.push([l * Math.cos(b) ** (2 / s), l * Math.sin(b) ** (2 / s)]);
  }
  const m = [], _ = (h, b, w, d) => {
    let v = Math.atan2(h, -b);
    v < 0 && (v += Math.PI * 2);
    let y = Math.atan2(d, w);
    y < 0 && (y += Math.PI * 2);
    const R = Fe(ea(y, n), 3);
    m.push(`rgba(255, 255, 255, ${R}) ${Fe(v / (Math.PI * 2) * 100, 2)}%`);
  };
  _(0, -i, 0, 1);
  for (const [h, b, w] of co)
    for (let d = 0; d <= c; d++) {
      const [v, y] = g[w ? c - d : d];
      _(h * (u + v), b * (o + y), h * v ** (s - 1), -b * y ** (s - 1));
    }
  return m.push(`rgba(255, 255, 255, ${Fe(ea(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function Fs() {
  const e = Ot, t = document.documentElement.style, n = Qs(e.refFresnelRange, e.refFresnelHardness), s = Qs(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Fe(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Fe(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", _t(e.tint)), t.setProperty("--glass-tint-light", _t(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", _t(Zs(e.tint))), t.setProperty("--glass-tint-sheet-light", _t(Zs(e.tintLight))), t.setProperty("--glass-ctl-dark", _t(e.control)), t.setProperty("--glass-ctl-light", _t(e.controlLight)), t.setProperty("--glass-text-dark", _t(e.ink)), t.setProperty("--glass-text-light", _t(e.inkLight)), t.setProperty("--glass-tint-tally-dark", _t(e.tally)), t.setProperty("--glass-tint-tally-light", _t(e.tallyLight)), t.setProperty("--glass-text-tally-dark", _t(e.tallyInk)), t.setProperty("--glass-text-tally-light", _t(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Fe(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Fe(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Fe(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Fe(Math.max(e.pageTop, 0))}px`), t.setProperty(
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
function ho(e, t, n, s, a, i) {
  const l = Math.abs(e) - n + a, u = Math.abs(t) - s + a, o = Math.max(l, 0), c = Math.max(u, 0), g = i === 2 ? Math.hypot(o, c) : (o ** i + c ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + g - a;
}
function vo(e, t, n) {
  const s = e / 2, a = t / 2, i = Ge(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), c = (_, h) => ho(_ - s, h - a, s, a, l, i), g = 256, m = new Float32Array(g + 1);
  for (let _ = 0; _ <= g; _++) {
    const h = 1 - _ / g, b = Math.asin(Ge(h * h, 0, 1)), w = Math.asin(Ge(Math.sin(b) / o, 0, 1));
    m[_] = Math.tan(b - w) * u;
  }
  return (_, h) => {
    const b = -c(_, h);
    if (b < 0 || b >= u) return null;
    const w = m[Math.round(b / u * g)];
    if (w === 0) return null;
    const d = 0.75, v = c(_ + d, h) - c(_ - d, h), y = c(_, h + d) - c(_, h - d), R = Math.hypot(v, y);
    if (R === 0) return null;
    const F = -w / R;
    return { dx: v * F, dy: y * F };
  };
}
function po(e, t, n) {
  const s = document.createElement("canvas");
  s.width = e, s.height = t;
  const a = s.getContext("2d"), i = a.createImageData(e, t), l = i.data, u = e * t, o = new Float32Array(u), c = new Float32Array(u);
  let g = 0;
  for (let _ = 0; _ < t; _++)
    for (let h = 0; h < e; h++) {
      const b = n(h + 0.5, _ + 0.5);
      if (!b) continue;
      const w = _ * e + h;
      o[w] = b.dx, c[w] = b.dy;
      const d = Math.hypot(b.dx, b.dy);
      d > g && (g = d);
    }
  const m = g > 0 ? 127 / g : 0;
  for (let _ = 0; _ < u; _++) {
    const h = _ * 4;
    l[h] = 128 + Ge(Math.round(o[_] * m), -127, 127), l[h + 1] = 128 + Ge(Math.round(c[_] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return a.putImageData(i, 0, 0), { url: s.toDataURL(), scale: g * 2 };
}
const rs = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function ss(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Fe(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let ir = null, go = 0;
function _o() {
  if (ir) return ir;
  const e = document.createElementNS(bs, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), ir = document.createElementNS(bs, "defs"), e.appendChild(ir), document.body.appendChild(e), ir;
}
function pn(e) {
  const t = `glass-refract-${++go}`, n = document.createElementNS(bs, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), _o().appendChild(n);
  let s = 0, a = 0, i = 0, l = 0;
  const u = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, c = "";
  function g() {
    e.style.setProperty("--glass-pre", Ot.blurEdge ? "" : c), e.style.setProperty("--glass-post", Ot.blurEdge ? c : "");
  }
  function m() {
    s < 2 || a < 2 || e.style.setProperty("--glass-glare", fo(s, a, Ot));
  }
  function _() {
    if (s < 2 || a < 2) return;
    const d = Ot, v = po(s, a, vo(s, a, d)), y = d.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(s)), n.setAttribute("height", String(a)), n.innerHTML = `<feImage x="0" y="0" width="${s}" height="${a}" preserveAspectRatio="none" href="${v.url}" result="map"/>` + ss(v.scale * (1 + y), rs[0], "r") + ss(v.scale, rs[1], "g") + ss(v.scale * (1 - y), rs[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, c = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (c = "", g()), o = u.map((R) => Ot[R]).join(" ");
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
  const w = lo(() => {
    m(), u.map((d) => Ot[d]).join(" ") !== o ? h() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), b.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const $a = "photos.stack", as = { on: !1, window: 4 }, Ja = 1, Za = 10;
function bo() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem($a) ?? "");
  } catch {
    return { ...as };
  }
  if (e === null || typeof e != "object") return { ...as };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= Ja && t <= Za ? t : as.window
  };
}
function mo(e) {
  return localStorage.setItem($a, JSON.stringify({ on: e.on, window: e.window })), e;
}
const Qa = "photos.theme", ei = "dark";
function ti() {
  return document.documentElement.dataset.theme === "light" ? "light" : ei;
}
function wo() {
  const e = localStorage.getItem(Qa), t = e === "dark" || e === "light" ? e : ei;
  return document.documentElement.dataset.theme = t, t;
}
function ni(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(Qa, e), e;
}
var yo = /* @__PURE__ */ I('<div class="glass marks svelte-zne36e"><span class="nums svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span></span> <button class="menu small svelte-zne36e" title="Copy the conditions and the marked ids to the clipboard">Share</button> <button class="menu small svelte-zne36e">Clear</button></div>'), xo = /* @__PURE__ */ I('<span class="spin svelte-zne36e" aria-label="loading"></span>'), ta = /* @__PURE__ */ I('<span class="badge svelte-zne36e"> </span>'), ko = /* @__PURE__ */ I('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), So = /* @__PURE__ */ I('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), Eo = /* @__PURE__ */ I("<button> </button>"), To = /* @__PURE__ */ I('<div class="glass sheet sorts svelte-zne36e"></div>'), Mo = /* @__PURE__ */ I(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), Ao = /* @__PURE__ */ I('<p class="muted svelte-zne36e">loading…</p>'), Ro = /* @__PURE__ */ I('<span class="help svelte-zne36e">?</span>'), Po = /* @__PURE__ */ I('<span class="n svelte-zne36e"> </span>'), Co = /* @__PURE__ */ I("<button> <!></button>"), No = /* @__PURE__ */ I('<span class="muted svelte-zne36e">nothing here</span>'), Oo = /* @__PURE__ */ I('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Io = /* @__PURE__ */ I('<div class="glass sheet filters svelte-zne36e"><!></div>'), Fo = /* @__PURE__ */ I('<div class="topbar svelte-zne36e"><div class="panes svelte-zne36e"><!> <div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <button role="switch" title="Mark tiles by clicking them, then copy their ids">Select</button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function zo(e, t) {
  vt(t, !0);
  let n = J(t, "facets", 3, null), s = J(t, "selected", 19, () => ({})), a = J(t, "sort", 3, "newest"), i = J(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = J(t, "total", 3, null), u = J(t, "tiles", 3, null), o = J(t, "loading", 3, !1), c = J(t, "selecting", 3, !1), g = J(t, "marked", 19, () => ({ stacks: 0, photos: 0 })), m = J(t, "onselect", 3, () => {
  }), _ = J(t, "onsort", 3, () => {
  }), h = J(t, "onstack", 3, () => {
  }), b = J(t, "onclear", 3, () => {
  }), w = J(t, "onselecting", 3, () => {
  }), d = J(t, "onshare", 3, () => {
  }), v = J(t, "onunmark", 3, () => {
  }), y = J(t, "ontriage", 3, () => {
  }), R = /* @__PURE__ */ X(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), F = /* @__PURE__ */ X(Ie(ti())), q = /* @__PURE__ */ X(null);
  const G = /* @__PURE__ */ se(() => u() ?? l()), Z = /* @__PURE__ */ se(() => n()?.dimensions ?? []), ne = /* @__PURE__ */ se(() => n()?.sorts ?? []), U = /* @__PURE__ */ se(() => r(ne).find((D) => D.value === a())?.label ?? a()), B = /* @__PURE__ */ se(() => Object.values(s()).reduce((D, ae) => D + ae.length, 0)), K = /* @__PURE__ */ se(() => r(Z).flatMap((D) => (s()[D.name] ?? []).map((ae) => ({
    dimension: D.name,
    value: ae,
    title: D.title,
    label: D.options.find((be) => be.value === ae)?.label ?? String(ae)
  }))));
  function N(D, ae) {
    const be = s()[D] ?? [], De = be.includes(ae) ? be.filter((Me) => Me !== ae) : [...be, ae];
    m()(D, De);
  }
  function V(D, ae) {
    return (s()[D] ?? []).includes(ae);
  }
  function fe() {
    x(F, ni(r(F) === "dark" ? "light" : "dark"), !0);
  }
  let ue = /* @__PURE__ */ X(null);
  const j = /* @__PURE__ */ se(() => r(ue) ?? i().window);
  function re(D) {
    x(ue, Number(D), !0);
  }
  function ye(D) {
    x(ue, null), h()({ ...i(), window: Number(D) });
  }
  zt(() => {
    r(R) !== "stacks" && x(ue, null);
  });
  function M(D) {
    D.key === "Escape" && x(R, "");
  }
  function z(D) {
    r(R) && !D.target.closest(".topbar") && x(R, "");
  }
  rr(() => {
    const D = new ResizeObserver(([ae]) => {
      const be = Math.round(ae.borderBoxSize?.[0]?.blockSize ?? ae.contentRect.height);
      document.documentElement.style.setProperty("--header-h", be + "px");
    });
    return D.observe(r(q)), () => {
      D.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var O = Fo();
  An("keydown", wn, M), An("pointerdown", wn, z);
  var Y = f(O), P = f(Y);
  {
    var T = (D) => {
      var ae = yo(), be = f(ae), De = f(be), Me = f(De), ke = p(De, 2), He = f(ke), Qe = p(ke, 2), qt = f(Qe), Le = p(Qe, 2), Xt = f(Le), Vt = p(be, 2), it = p(Vt, 2);
      vn(ae, (on) => pn?.(on)), W(
        (on, Fn) => {
          A(Me, on), A(He, g().stacks === 1 ? "stack" : "stacks"), A(qt, Fn), A(Xt, g().photos === 1 ? "photo" : "photos");
        },
        [() => Oe(g().stacks), () => Oe(g().photos)]
      ), Q("click", Vt, () => d()()), Q("click", it, () => v()()), C(D, ae);
    };
    te(P, (D) => {
      g().stacks && D(T);
    });
  }
  var H = p(P, 2), ce = f(H), pe = f(ce), ie = p(ce, 2), he = f(ie), Te = p(ie, 2);
  {
    var _e = (D) => {
      var ae = xo();
      C(D, ae);
    };
    te(Te, (D) => {
      o() && D(_e);
    });
  }
  vn(H, (D) => pn?.(D));
  var xe = p(Y, 2), Re = f(xe), Ee = f(Re), Ce = f(Ee);
  let le;
  var k = f(Ce), S = p(Ce, 2);
  let L;
  var ee = p(f(S));
  {
    var ge = (D) => {
      var ae = ta(), be = f(ae);
      W(() => A(be, r(B))), C(D, ae);
    };
    te(ee, (D) => {
      r(B) && D(ge);
    });
  }
  var oe = p(S, 2);
  let de;
  var Ve = p(f(oe));
  {
    var Ht = (D) => {
      var ae = ta(), be = f(ae);
      W((De) => A(be, De), [() => Oe(l())]), C(D, ae);
    };
    te(Ve, (D) => {
      i().on && l() !== null && D(Ht);
    });
  }
  var $e = p(oe, 2);
  let Ke;
  var St = p($e, 2);
  {
    var Kt = (D) => {
      var ae = So(), be = f(ae);
      Je(be, 17, () => r(K), (Me) => Me.dimension + " " + Me.value, (Me, ke) => {
        var He = ko(), Qe = f(He), qt = f(Qe), Le = p(Qe, 1, !0);
        W(() => {
          ve(He, "title", `${r(ke).title ?? ""}: ${r(ke).label ?? ""} — click to remove`), A(qt, r(ke).title), A(Le, r(ke).label);
        }), Q("click", He, () => N(r(ke).dimension, r(ke).value)), C(Me, He);
      });
      var De = p(be, 2);
      Q("click", De, () => b()()), C(D, ae);
    };
    te(St, (D) => {
      r(K).length && D(Kt);
    });
  }
  var nt = p(Ee, 2), ln = f(nt), Et = p(nt, 2);
  vn(Re, (D) => pn?.(D));
  var Tt = p(Re, 2);
  {
    var Mt = (D) => {
      var ae = To();
      Je(ae, 21, () => r(ne), wt, (be, De) => {
        var Me = Eo();
        let ke;
        var He = f(Me);
        W(() => {
          ke = Pe(Me, 1, "option svelte-zne36e", null, ke, { on: r(De).value === a() }), A(He, r(De).label);
        }), Q("click", Me, () => {
          _()(r(De).value), x(R, "");
        }), C(be, Me);
      }), vn(ae, (be) => pn?.(be)), C(D, ae);
    };
    te(Tt, (D) => {
      r(R) === "sort" && D(Mt);
    });
  }
  var Ze = p(Tt, 2);
  {
    var At = (D) => {
      var ae = Mo(), be = f(ae), De = p(f(be), 2), Me = f(De);
      let ke;
      var He = f(Me), Qe = p(be, 2), qt = p(f(Qe), 2), Le = f(qt), Xt = p(Le, 2), Vt = f(Xt);
      vn(ae, (it) => pn?.(it)), W(() => {
        ke = Pe(Me, 1, "option svelte-zne36e", null, ke, { on: i().on }), ve(Me, "aria-checked", i().on), A(He, i().on ? "On" : "Off"), ve(Le, "min", Ja), ve(Le, "max", Za), Sn(Le, r(j)), ve(Le, "aria-valuetext", `${r(j) ?? ""} seconds`), A(Vt, `${r(j) ?? ""}s`);
      }), Q("click", Me, () => h()({ ...i(), on: !i().on })), Q("input", Le, (it) => re(it.currentTarget.value)), Q("change", Le, (it) => ye(it.currentTarget.value)), C(D, ae);
    };
    te(Ze, (D) => {
      r(R) === "stacks" && D(At);
    });
  }
  var Bt = p(Ze, 2);
  {
    var at = (D) => {
      var ae = Io(), be = f(ae);
      {
        var De = (ke) => {
          var He = Ao();
          C(ke, He);
        }, Me = (ke) => {
          var He = Cs(), Qe = ct(He);
          Je(Qe, 17, () => r(Z), wt, (qt, Le) => {
            var Xt = Oo(), Vt = f(Xt), it = f(Vt), on = p(it);
            {
              var Fn = (Rt) => {
                var gt = Ro();
                W(() => ve(gt, "title", r(Le).hint)), C(Rt, gt);
              };
              te(on, (Rt) => {
                r(Le).hint && Rt(Fn);
              });
            }
            var Yr = p(Vt, 2), wr = f(Yr);
            Je(wr, 17, () => r(Le).options, wt, (Rt, gt) => {
              var xn = Co();
              let xr;
              var kr = f(xn), Kr = p(kr);
              {
                var E = ($) => {
                  var Ae = Po(), je = f(Ae);
                  W((Be) => A(je, Be), [() => Oe(r(gt).count)]), C($, Ae);
                };
                te(Kr, ($) => {
                  r(gt).count !== null && $(E);
                });
              }
              W(
                ($) => {
                  xr = Pe(xn, 1, "option svelte-zne36e", null, xr, $), A(kr, `${r(gt).label ?? ""} `);
                },
                [
                  () => ({ on: V(r(Le).name, r(gt).value) })
                ]
              ), Q("click", xn, () => N(r(Le).name, r(gt).value)), C(Rt, xn);
            });
            var yr = p(wr, 2);
            {
              var Gr = (Rt) => {
                var gt = No();
                C(Rt, gt);
              };
              te(yr, (Rt) => {
                r(Le).options.length || Rt(Gr);
              });
            }
            W(() => A(it, `${r(Le).title ?? ""} `)), C(qt, Xt);
          }), C(ke, He);
        };
        te(be, (ke) => {
          n() ? ke(Me, -1) : ke(De);
        });
      }
      vn(ae, (ke) => pn?.(ke)), C(D, ae);
    };
    te(Bt, (D) => {
      r(R) === "filters" && D(at);
    });
  }
  gr(O, (D) => x(q, D), () => r(q)), W(
    (D) => {
      A(pe, D), A(he, r(G) === 1 ? "photo" : "photos"), le = Pe(Ce, 1, "menu svelte-zne36e", null, le, { open: r(R) === "sort" }), ve(Ce, "aria-expanded", r(R) === "sort"), A(k, r(U)), L = Pe(S, 1, "menu svelte-zne36e", null, L, { open: r(R) === "filters", on: r(B) > 0 }), ve(S, "aria-expanded", r(R) === "filters"), de = Pe(oe, 1, "menu svelte-zne36e", null, de, { open: r(R) === "stacks", on: i().on }), ve(oe, "aria-expanded", r(R) === "stacks"), Ke = Pe($e, 1, "menu svelte-zne36e", null, Ke, { on: c() }), ve($e, "aria-checked", c()), ve(nt, "title", r(F) === "dark" ? "Switch to a white background" : "Switch to a black background"), ve(nt, "aria-label", r(F) === "dark" ? "Switch to a white background" : "Switch to a black background"), A(ln, r(F) === "dark" ? "☀" : "☾");
    },
    [() => r(G) === null ? "…" : Oe(r(G))]
  ), Q("click", Ce, () => x(R, r(R) === "sort" ? "" : "sort", !0)), Q("click", S, () => x(R, r(R) === "filters" ? "" : "filters", !0)), Q("click", oe, () => x(R, r(R) === "stacks" ? "" : "stacks", !0)), Q("click", $e, () => w()(!c())), Q("click", nt, fe), Q("click", Et, () => y()()), C(e, O), pt();
}
jt(["click", "input", "change"]);
const Ut = 4, Hr = 220, Lo = 340, gn = 12, na = Ut + gn, ri = 6, Do = 5, jo = 0.025, Ho = 9;
function Br(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Bo(e, t, n, s, a) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, u = 0, o = 1 / 0;
    for (; l < e.length && (u += Br(e[l]), l++, o = (n - Ut * (l - i - 1)) / u, !(o <= Hr)); )
      ;
    if (o > Hr && !s) break;
    a(i, l, Math.round(Math.min(o, Lo))), i = l;
  }
  return i;
}
function si(e, t, n) {
  const s = [];
  let a = 0;
  for (let i = e.from; i < e.to; i++) {
    const u = i === e.to - 1 ? n - a : Math.round(Br(t[i]) * e.height);
    s.push({ index: i, x: a, w: u }), a += u + Ut;
  }
  return s;
}
function qo(e, t) {
  const n = Math.min((e | 0) - 1, ri);
  if (n < 1) return [];
  const s = Math.min(Do, t * jo), a = [];
  for (let i = 1; i <= n; i++)
    a.push({
      top: Math.round(gn * (n - i) / n),
      inset: Math.round(i * s),
      // Integer percent, so the value lands on the decimal it reads as rather
      // than on whatever a chain of float multiplies leaves behind.
      opacity: (100 - (i - 1) * Ho) / 100
    });
  return a;
}
function ra(e, t, n, s) {
  const a = ws(e, s.top, s.bottom);
  if (!a) return [];
  const i = [];
  for (let l = a[0]; l <= a[1]; l++) {
    const u = e[l];
    if (!(u.top > s.bottom || u.top + u.height < s.top))
      for (const o of si(u, t, n))
        o.x <= s.right && o.x + o.w >= s.left && i.push(o.index);
  }
  return i;
}
function ws(e, t, n) {
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
var Uo = /* @__PURE__ */ I('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), Wo = /* @__PURE__ */ I('<div role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Previous tile" aria-label="Previous tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M14.5 5 7.5 12l7 7"></path></svg></button></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Next tile" aria-label="Next tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M9.5 5l7 7-7 7"></path></svg></button></div></div>');
function Yo(e, t) {
  vt(t, !0);
  let n = J(t, "frames", 19, () => []), s = J(t, "origin", 3, null), a = J(t, "back", 3, !1), i = J(t, "forward", 3, !1), l = J(t, "onstep", 3, () => {
  }), u = J(t, "onreveal", 3, () => {
  }), o = J(t, "onclose", 3, () => {
  });
  const c = 40, g = 72, m = /* @__PURE__ */ se(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let _ = /* @__PURE__ */ X(Ie(document.documentElement.clientWidth)), h = /* @__PURE__ */ X(Ie(document.documentElement.clientHeight)), b = /* @__PURE__ */ X(null), w = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Set()));
  const d = 4, v = 25, y = { x: 0, y: 0, w: 0, h: 0 }, R = /* @__PURE__ */ se(() => Math.max(0, r(_) - g * 2)), F = /* @__PURE__ */ se(() => Math.max(0, r(h) - c * 2)), q = /* @__PURE__ */ se(() => r(R) > 0 && r(F) > 0 ? U(n(), r(R), r(F)) : n().map(() => y));
  function G(T, H, ce) {
    const pe = [];
    let ie = 0, he = 0;
    for (let Te = 0; Te < T.length; Te++)
      he += Br(T[Te]), he * ce + Ut * (Te - ie) >= H && (pe.push({ from: ie, to: Te + 1, sum: he }), ie = Te + 1, he = 0);
    return ie < T.length && pe.push({ from: ie, to: T.length, sum: he }), pe;
  }
  function Z(T, H, ce) {
    return T.map((pe, ie) => {
      const he = (H - Ut * (pe.to - pe.from - 1)) / pe.sum;
      return ie === T.length - 1 && he > ce ? ce : he;
    });
  }
  function ne(T, H, ce) {
    return Z(T, H, ce).reduce((pe, ie) => pe + ie, 0) + Ut * (T.length - 1);
  }
  function U(T, H, ce) {
    let pe = d, ie = Math.max(d, ce);
    for (let Re = 0; Re < v; Re++) {
      const Ee = (pe + ie) / 2;
      ne(G(T, H, Ee), H, Ee) <= ce ? pe = Ee : ie = Ee;
    }
    const he = G(T, H, pe), Te = Z(he, H, pe), _e = [];
    let xe = (ce - (Te.reduce((Re, Ee) => Re + Ee, 0) + Ut * (he.length - 1))) / 2;
    return he.forEach((Re, Ee) => {
      const Ce = Te[Ee], le = [];
      for (let L = Re.from; L < Re.to; L++) le.push(Br(T[L]) * Ce);
      const k = le.reduce((L, ee) => L + ee, 0) + Ut * (le.length - 1);
      let S = (H - k) / 2;
      for (const L of le)
        _e.push({
          x: Math.round(S),
          y: Math.round(xe),
          w: Math.round(L),
          h: Math.round(Ce)
        }), S += L + Ut;
      xe += Ce + Ut;
    }), _e;
  }
  function B(T) {
    if (!s() || !T || !T.w || !T.h) return "none";
    const H = s().left - (g + T.x), ce = s().top - (c + T.y);
    return `translate(${H}px, ${ce}px) scale(${s().width / T.w}, ${s().height / T.h})`;
  }
  const K = 1600;
  let N = /* @__PURE__ */ X(!1), V = 0;
  function fe() {
    x(N, !1), clearTimeout(V), V = setTimeout(() => x(N, !0), K);
  }
  function ue(T) {
    if (T.key === "Escape") {
      o()();
      return;
    }
    T.key !== "ArrowLeft" && T.key !== "ArrowRight" || (T.preventDefault(), l()(T.key === "ArrowLeft" ? -1 : 1, T.repeat));
  }
  function j(T) {
    T.target.closest(".frame, .lane") || o()();
  }
  rr(() => (r(b)?.focus(), fe(), () => clearTimeout(V)));
  var re = Wo();
  An("keydown", wn, ue), An("pointerdown", wn, j), An("pointermove", wn, fe);
  let ye;
  var M = f(re);
  en(M, "", {}, { inset: "40px 72px" }), Je(M, 23, n, (T) => T.id, (T, H, ce) => {
    var pe = Uo();
    let ie;
    var he = f(pe);
    let Te;
    W(
      (_e, xe) => {
        ie = en(pe, "", ie, _e), ve(he, "src", `/d/${r(H).s ?? ""}.webp`), Te = Pe(he, 1, "svelte-5g1i2z", null, Te, xe);
      },
      [
        () => ({
          left: `${r(q)[r(ce)].x ?? ""}px`,
          top: `${r(q)[r(ce)].y ?? ""}px`,
          width: `${r(q)[r(ce)].w ?? ""}px`,
          height: `${r(q)[r(ce)].h ?? ""}px`,
          "--flight": B(r(q)[r(ce)])
        }),
        () => ({ loaded: r(w).has(r(H).id) })
      ]
    ), Q("click", pe, () => u()(r(H))), An("load", he, () => x(w, new Set(r(w)).add(r(H).id), !0)), C(T, pe);
  });
  var z = p(M, 2);
  en(z, "", {}, { width: "44px", left: "14px" });
  var O = f(z);
  vn(O, (T) => pn?.(T));
  var Y = p(z, 2);
  en(Y, "", {}, { width: "44px", right: "14px" });
  var P = f(Y);
  vn(P, (T) => pn?.(T)), gr(re, (T) => x(b, T), () => r(b)), W(() => {
    ye = Pe(re, 1, "glass pane svelte-5g1i2z", null, ye, { resting: r(N) }), ve(re, "aria-label", r(m)), O.disabled = !a(), P.disabled = !i();
  }), Q("click", O, () => l()(-1)), Q("click", P, () => l()(1)), Xs(re, "clientWidth", (T) => x(_, T)), Xs(re, "clientHeight", (T) => x(h, T)), C(e, re), pt();
}
jt(["click"]);
var Go = /* @__PURE__ */ I('<span class="err svelte-uzy12d"> </span>'), Ko = /* @__PURE__ */ I(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Xo = /* @__PURE__ */ I(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), Vo = /* @__PURE__ */ I('<span class="muted svelte-uzy12d"> </span>'), $o = /* @__PURE__ */ I('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function Jo(e, t) {
  vt(t, !0);
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
  var l = $o(), u = f(l), o = f(u), c = p(u, 2);
  {
    var g = (h) => {
      var b = Go(), w = f(b);
      W(() => A(w, r(a))), C(h, b);
    }, m = (h) => {
      var b = Cs(), w = ct(b);
      {
        var d = (y) => {
          var R = Ko(), F = p(f(R), 2);
          W(
            (q) => A(F, ` above are formats the header
        reader cannot measure (${q ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), C(y, R);
        }, v = (y) => {
          var R = Xo(), F = f(R), q = f(F), G = p(F, 2), Z = f(G);
          W(
            (ne) => {
              A(q, ne), A(Z, r(n).command);
            },
            [() => Oe(r(n).worklist)]
          ), C(y, R);
        };
        te(w, (y) => {
          r(n).worklist === 0 ? y(d) : y(v, -1);
        });
      }
      C(h, b);
    }, _ = (h) => {
      var b = Vo(), w = f(b);
      W(() => A(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), C(h, b);
    };
    te(c, (h) => {
      r(a) ? h(g) : r(n) ? h(m, 1) : h(_, -1);
    });
  }
  W(() => {
    u.disabled = r(s), A(o, r(s) ? "counting…" : "Check the dimension probe's worklist");
  }), Q("click", u, i), C(e, l), pt();
}
jt(["click"]);
var Zo = /* @__PURE__ */ I('<p class="bad svelte-1xjbga"> </p>'), Qo = /* @__PURE__ */ I('<pre class="svelte-1xjbga"> </pre>'), eu = /* @__PURE__ */ I('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), tu = /* @__PURE__ */ I(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), nu = /* @__PURE__ */ I('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), ru = /* @__PURE__ */ I('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), su = /* @__PURE__ */ I(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), au = /* @__PURE__ */ I('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), iu = /* @__PURE__ */ I(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function lu(e, t) {
  vt(t, !0);
  let n = /* @__PURE__ */ X(null), s = /* @__PURE__ */ X(!1), a = /* @__PURE__ */ X(null), i = /* @__PURE__ */ X(null);
  const l = /* @__PURE__ */ se(() => r(n)?.state === "running"), u = /* @__PURE__ */ se(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const y = await qe.rebuildStatus();
      x(n, y, !0), x(a, null), y.state === "done" && y.started_at !== r(i) && (x(i, y.started_at, !0), t.oncomplete?.());
    } catch (y) {
      x(a, String(y), !0);
    }
  }
  rr(() => {
    o();
  }), zt(() => {
    if (!r(l)) return;
    const y = setInterval(o, 700);
    return () => clearInterval(y);
  });
  async function c() {
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
  var m = iu();
  An("keydown", wn, g);
  var _ = ct(m), h = f(_), b = f(h), w = p(h, 2), d = p(_, 2);
  {
    var v = (y) => {
      var R = au(), F = ct(R), q = p(F, 2), G = f(q), Z = p(f(G), 4), ne = f(Z), U = p(Z, 2), B = p(G, 2);
      {
        var K = (M) => {
          var z = Zo(), O = f(z);
          W(() => A(O, r(a))), C(M, z);
        };
        te(B, (M) => {
          r(a) && M(K);
        });
      }
      var N = p(B, 2);
      Je(N, 17, () => r(n)?.steps ?? [], wt, (M, z) => {
        var O = eu();
        let Y;
        var P = f(O), T = f(P), H = f(T);
        {
          var ce = (le) => {
            var k = Yn("✓");
            C(le, k);
          }, pe = (le) => {
            var k = Yn("✕");
            C(le, k);
          }, ie = (le) => {
            var k = Yn("·");
            C(le, k);
          }, he = (le) => {
            var k = Yn(" ");
            C(le, k);
          };
          te(H, (le) => {
            r(z).state === "done" ? le(ce) : r(z).state === "failed" ? le(pe, 1) : r(z).state === "running" ? le(ie, 2) : le(he, -1);
          });
        }
        var Te = p(T, 2), _e = f(Te), xe = p(Te, 4), Re = f(xe), Ee = p(P, 2);
        {
          var Ce = (le) => {
            var k = Qo(), S = f(k);
            W((L) => A(S, L), [() => r(z).log.join(`
`)]), C(le, k);
          };
          te(Ee, (le) => {
            r(z).log.length && le(Ce);
          });
        }
        W(() => {
          Y = Pe(O, 1, "step svelte-1xjbga", null, Y, {
            on: r(z).state === "running",
            bad: r(z).state === "failed"
          }), A(_e, r(z).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), A(Re, r(z).seconds === null ? "" : r(z).seconds + "s");
        }), C(M, O);
      });
      var V = p(N, 2);
      {
        var fe = (M) => {
          var z = tu(), O = ct(z), Y = f(O);
          W(() => A(Y, r(n).error)), C(M, z);
        }, ue = (M) => {
          var z = nu();
          C(M, z);
        }, j = (M) => {
          var z = ru();
          C(M, z);
        };
        te(V, (M) => {
          r(n)?.state === "failed" ? M(fe) : r(n)?.state === "done" ? M(ue, 1) : r(l) && M(j, 2);
        });
      }
      var re = p(V, 2);
      {
        var ye = (M) => {
          var z = su(), O = p(f(z), 6), Y = f(O);
          W(() => A(Y, `python -m photolib.restore_state ${r(u) ?? ""}`)), C(M, z);
        };
        te(re, (M) => {
          r(u) && M(ye);
        });
      }
      W(() => A(ne, `${r(n)?.seconds ?? 0 ?? ""}s`)), Q("click", F, () => x(s, !1)), Q("click", U, () => x(s, !1)), C(y, R);
    };
    te(d, (y) => {
      r(s) && y(v);
    });
  }
  W(() => {
    h.disabled = r(l), A(b, r(l) ? "applying…" : "Apply to grid"), w.disabled = !r(n) || r(n).state === "idle";
  }), Q("click", h, c), Q("click", w, () => x(s, !0)), C(e, m), pt();
}
jt(["click"]);
var ou = /* @__PURE__ */ I('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), sa = /* @__PURE__ */ I("<option> </option>"), uu = /* @__PURE__ */ I('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), cu = /* @__PURE__ */ I('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), du = /* @__PURE__ */ I('<div class="none muted svelte-bqi9ky"> </div>'), fu = /* @__PURE__ */ I('<div class="bar svelte-bqi9ky"><!></div>');
function hu(e, t) {
  vt(t, !0);
  let n = J(t, "candidate", 3, null), s = J(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), u = /* @__PURE__ */ se(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ se(() => !!n() && n().op !== "is null");
  function c(w, d) {
    const v = { ...n(), [w]: d };
    if (w === "column") {
      const y = i[d] ?? ["="];
      y.includes(v.op) || (v.op = y[0]), v.value = l.has(d) ? 0 : "";
    }
    w === "op" && d === "is null" && (v.value = null), w === "value" && l.has(v.column) && (v.value = Number(d) || 0), t.onedit(v);
  }
  var g = fu(), m = f(g);
  {
    var _ = (w) => {
      var d = ou(), v = f(d), y = f(v), R = p(v, 2), F = f(R);
      W(() => {
        A(y, `${t.screen.title ?? ""} does not save a rule.`), A(F, t.screen.blurb);
      }), C(w, d);
    }, h = (w) => {
      var d = cu(), v = ct(d), y = f(v);
      Je(y, 21, () => a, wt, (O, Y) => {
        var P = sa(), T = f(P), H = {};
        W(() => {
          A(T, r(Y)), H !== (H = r(Y)) && (P.value = (P.__value = r(Y)) ?? "");
        }), C(O, P);
      });
      var R;
      Ar(y);
      var F = p(y, 2);
      Je(F, 21, () => r(u), wt, (O, Y) => {
        var P = sa(), T = f(P), H = {};
        W(() => {
          A(T, r(Y)), H !== (H = r(Y)) && (P.value = (P.__value = r(Y)) ?? "");
        }), C(O, P);
      });
      var q;
      Ar(F);
      var G = p(F, 2);
      {
        var Z = (O) => {
          var Y = uu();
          W(() => Sn(Y, n().value ?? "")), Q("input", Y, (P) => c("value", P.currentTarget.value)), C(O, Y);
        };
        te(G, (O) => {
          r(o) && O(Z);
        });
      }
      var ne = p(G, 2), U = f(ne);
      U.value = U.__value = "exclude";
      var B = p(U);
      B.value = B.__value = "include";
      var K;
      Ar(ne);
      var N = p(ne, 2), V = f(N);
      V.value = V.__value = "end";
      var fe = p(V);
      fe.value = fe.__value = "0";
      var ue;
      Ar(N);
      var j = p(N, 2), re = f(j), ye = p(j, 2), M = p(v, 2), z = f(M);
      W(
        (O, Y) => {
          R !== (R = n().column) && (y.value = (y.__value = n().column) ?? "", cr(y, n().column)), q !== (q = n().op) && (F.value = (F.__value = n().op) ?? "", cr(F, n().op)), K !== (K = n().decision ?? "exclude") && (ne.value = (ne.__value = n().decision ?? "exclude") ?? "", cr(ne, n().decision ?? "exclude")), ue !== (ue = O) && (N.value = (N.__value = O) ?? "", cr(N, O)), j.disabled = s(), A(re, s() ? "saving…" : "Confirm"), A(z, `${Y ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Vl(n())
        ]
      ), Q("change", y, (O) => c("column", O.currentTarget.value)), Q("change", F, (O) => c("op", O.currentTarget.value)), Q("change", ne, (O) => c("decision", O.currentTarget.value)), Q("change", N, (O) => c("at", O.currentTarget.value)), Q("click", j, function(...O) {
        t.onconfirm?.apply(this, O);
      }), Q("click", ye, function(...O) {
        t.onclear?.apply(this, O);
      }), C(w, d);
    }, b = (w) => {
      var d = du(), v = f(d);
      W(() => A(v, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), C(w, d);
    };
    te(m, (w) => {
      t.screen.rule === !1 ? w(_) : n() ? w(h, 1) : w(b, -1);
    });
  }
  C(e, g), pt();
}
jt(["change", "input", "click"]);
var vu = /* @__PURE__ */ I('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), pu = /* @__PURE__ */ I('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), gu = /* @__PURE__ */ I('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), _u = /* @__PURE__ */ I('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function bu(e, t) {
  vt(t, !0);
  let n = J(t, "rules", 19, () => []), s = J(t, "unmatched", 3, null), a = J(t, "busy", 3, !1);
  var i = _u(), l = f(i), u = p(f(l)), o = f(u), c = p(l, 2);
  {
    var g = (b) => {
      var w = vu();
      C(b, w);
    };
    te(c, (b) => {
      n().length === 0 && b(g);
    });
  }
  var m = p(c, 2);
  Je(m, 19, n, (b) => b.id, (b, w, d) => {
    var v = pu();
    let y;
    var R = f(v), F = f(R), q = f(F), G = p(F, 2), Z = f(G), ne = p(G, 2), U = f(ne), B = p(R, 2), K = f(B), N = f(K), V = p(K, 2), fe = f(V), ue = p(V, 4), j = p(ue, 2), re = p(j, 2);
    W(
      (ye, M) => {
        y = Pe(v, 1, "rule svelte-aof9c2", null, y, { exclude: r(w).decision === "exclude" }), A(q, r(d)), A(Z, r(w).predicate), A(U, r(w).decision), A(N, `${ye ?? ""} paths`), A(fe, M), ue.disabled = a() || r(d) === 0, j.disabled = a() || r(d) === n().length - 1, re.disabled = a();
      },
      [
        () => Oe(r(w).paths),
        () => Nt(r(w).bytes)
      ]
    ), Q("click", ue, () => t.onmove(r(w), r(d) - 1)), Q("click", j, () => t.onmove(r(w), r(d) + 1)), Q("click", re, () => t.ondelete(r(w))), C(b, v);
  });
  var _ = p(m, 2);
  {
    var h = (b) => {
      var w = gu(), d = p(f(w), 2), v = f(d), y = f(v), R = p(v, 2), F = f(R);
      W(
        (q, G) => {
          A(y, `${q ?? ""} paths`), A(F, G);
        },
        [
          () => Oe(s().paths),
          () => Nt(s().bytes)
        ]
      ), C(b, w);
    };
    te(_, (b) => {
      s() && b(h);
    });
  }
  W(() => A(o, `${n().length ?? ""} rules · top-down, first match wins`)), C(e, i), pt();
}
jt(["click"]);
function is(e) {
  return { key: e.id, ids: (e.m ?? [e]).map((t) => t.id) };
}
function mu(e, t) {
  const n = e.filter((s) => s.key !== t.key);
  return n.length === e.length ? [...e, t] : n;
}
function aa(e, t, n) {
  if (!n) {
    const a = new Set(t.map((i) => i.key));
    return e.filter((i) => !a.has(i.key));
  }
  const s = new Set(e.map((a) => a.key));
  return [...e, ...t.filter((a) => !s.has(a.key))];
}
function wu(e) {
  return {
    stacks: e.length,
    photos: e.reduce((t, n) => t + n.ids.length, 0)
  };
}
function yu(e) {
  const t = e.stacking.on ? e.stacking.window + "s" : "off", n = Object.entries(e.filters).filter(([, s]) => s.length > 0).sort(([s], [a]) => s < a ? -1 : s > a ? 1 : 0).map(([s, a]) => s + ":" + a.join("|"));
  return `stack=${t} sort=${e.sort} filters=${n.length ? n.join(",") : "none"}`;
}
function xu(e, t) {
  const n = t.map((s) => "[" + s.ids.join(",") + "]").join(",");
  return yu(e) + `
` + n;
}
const ia = 2500, ku = 1, Su = 2, la = 4, Eu = 3e7, kn = /* @__PURE__ */ new WeakMap();
function oa(e) {
  return kn.get(e).photo.getBoundingClientRect();
}
function Tu(e, t, n) {
  const s = [], a = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, c = gn, g = null, m = null, _ = null, h = !1, b = !1, w = 0, d = 0, v = 0, y = n.onState || (() => {
  });
  function R(k) {
    w <= 0 || (o = Bo(s, o, w, k, (S, L, ee) => {
      a.push({ top: c, height: ee, from: S, to: L }), c += ee + na;
    }), q());
  }
  function F() {
    if (m === null || h || w <= 0 || o >= m) return 0;
    const k = a.length ? o / a.length : Math.max(1, w / Hr), S = a.length ? (c - gn) / a.length : Hr + na, L = Math.round((m - o) / k * S);
    return Math.max(0, Math.min(L, Eu - c));
  }
  function q() {
    e.style.height = c + F() + "px", t.style.top = Math.max(0, c - 1) + "px";
  }
  function G() {
    return window.scrollY - e.offsetTop;
  }
  function Z() {
    const k = l.pop();
    if (k) return k;
    const S = document.createElement("div");
    S.className = "tile", S.tabIndex = -1;
    const L = document.createElement("div");
    L.className = "deck", L.style.height = gn + "px";
    const ee = [];
    for (let de = 0; de < ri; de++) {
      const Ve = document.createElement("div");
      Ve.className = "card", Ve.hidden = !0, ee.push(Ve);
    }
    for (let de = ee.length - 1; de >= 0; de--) L.appendChild(ee[de]);
    S.appendChild(L);
    const ge = document.createElement("div");
    ge.className = "tile-photo";
    const oe = document.createElement("img");
    return oe.decoding = "async", oe.draggable = !1, oe.addEventListener("load", () => S.classList.add("loaded")), oe.addEventListener("error", () => S.classList.add("missing")), ge.appendChild(oe), S.appendChild(ge), kn.set(S, { img: oe, photo: ge, strip: L, cards: ee, above: 0 }), n.extend && n.extend(S), S;
  }
  function ne(k, S) {
    const { img: L, photo: ee } = kn.get(S);
    L.removeAttribute("src"), S.classList.remove("loaded", "missing", "error"), ee.style.backgroundImage = "", S.remove(), i.delete(k), l.push(S);
  }
  function U(k, S, L) {
    const ee = kn.get(k), ge = qo(S.n, L);
    ee.above = ge.length ? gn : 0, ee.strip.hidden = ge.length === 0;
    for (let oe = 0; oe < ee.cards.length; oe++) {
      const de = ge[oe];
      ee.cards[oe].hidden = de === void 0, de !== void 0 && (ee.cards[oe].style.top = de.top + "px", ee.cards[oe].style.left = de.inset + "px", ee.cards[oe].style.right = de.inset + "px", ee.cards[oe].style.opacity = String(de.opacity));
    }
  }
  function B(k, S, L, ee, ge, oe) {
    let de = i.get(k);
    const Ve = s[k];
    if (!de) {
      de = Z(), de.dataset.index = String(k);
      const Ke = kn.get(de).img;
      U(de, Ve, ee), Ke.fetchPriority = oe ? "high" : "low", Ke.src = "/t/" + Ve.s + ".webp", u.push(k), n.fill && n.fill(de, Ve), e.appendChild(de), i.set(k, de);
    }
    const { above: Ht, photo: $e } = kn.get(de);
    de.style.width = ee + "px", de.style.height = ge + Ht + "px", de.style.transform = "translate(" + S + "px," + (L - Ht) + "px)", $e.style.height = ge + "px";
  }
  function K(k, S) {
    S.th && (S.url === void 0 && (S.url = n.thumbHash(S.th)), S.url && (kn.get(k).photo.style.backgroundImage = "url(" + S.url + ")"));
  }
  function N() {
    v = 0;
    for (const k of u) {
      const S = i.get(k);
      S && !S.classList.contains("loaded") && K(S, s[k]);
    }
    u.length = 0;
  }
  function V(k, S) {
    for (const L of si(k, s, w))
      B(L.index, L.x, k.top, L.w, k.height, S);
  }
  function fe() {
    const k = window.innerHeight, S = G(), L = ws(a, S - k * ku, S + k * (1 + Su));
    if (!L) return;
    const ee = a[L[0]].from, ge = a[L[1]].to;
    for (const [oe, de] of Array.from(i))
      (oe < ee || oe >= ge) && ne(oe, de);
    for (let oe = L[0]; oe <= L[1]; oe++) {
      const de = a[oe];
      V(de, de.top < S + k && de.top + de.height > S);
    }
    u.length && !v && (v = requestAnimationFrame(N));
  }
  function ue() {
    return w <= 0 ? !1 : c - (G() + window.innerHeight) < ia;
  }
  let j = Promise.resolve();
  function re() {
    return b || h || (b = !0, j = ye()), j;
  }
  async function ye() {
    const k = d;
    y({ loading: !0, count: s.length, exhausted: h, total: m, tiles: _ });
    try {
      do {
        const S = await n.fetchPage(g);
        if (k !== d) return;
        for (const L of S.photos) s.push(L);
        g = S.next, h = g === null, typeof S.stacks == "number" ? (m = S.stacks, _ = typeof S.total == "number" ? S.total : null) : typeof S.total == "number" && (m = S.total), R(h), fe(), y({ loading: !0, count: s.length, exhausted: h, total: m, tiles: _ });
      } while (!h && ue());
    } catch (S) {
      k === d && y({ error: String(S) });
    } finally {
      k === d && (b = !1, y({ loading: !1, count: s.length, exhausted: h, total: m, tiles: _ }));
    }
  }
  let M = 0;
  function z() {
    M || (M = requestAnimationFrame(() => {
      M = 0, fe(), P && he(), ue() && re();
    }));
  }
  function O() {
    const k = e.clientWidth;
    if (k === w) return;
    const S = ws(a, G(), G()), L = S ? a[S[0]].from : 0;
    w = k;
    for (const [ge, oe] of Array.from(i)) ne(ge, oe);
    a.length = 0, o = 0, c = gn, R(h), fe();
    const ee = a.find((ge) => ge.to > L);
    ee && window.scrollTo(0, ee.top + e.offsetTop), ue() && re();
  }
  let Y = !1, P = null, T = 0, H = null, ce = !1;
  function pe(k, S) {
    const L = e.getBoundingClientRect();
    return { x: k - L.left, y: S - L.top };
  }
  function ie(k) {
    H || (H = document.createElement("div"), H.className = "marquee", e.appendChild(H)), H.hidden = !1, H.style.width = k.right - k.left + "px", H.style.height = k.bottom - k.top + "px", H.style.transform = "translate(" + k.left + "px," + k.top + "px)";
  }
  function he() {
    if (!P) return;
    const { x: k, y: S } = pe(P.cx, P.cy);
    if (!P.live) {
      if (Math.abs(k - P.ax) < la && Math.abs(S - P.ay) < la) return;
      P.live = !0, n.sweepStart(P.index === null ? null : s[P.index], P.index);
    }
    const L = {
      left: Math.min(P.ax, k),
      right: Math.max(P.ax, k),
      top: Math.min(P.ay, S),
      bottom: Math.max(P.ay, S)
    };
    ie(L), n.sweepMove(ra(a, s, w, L).map((ee) => s[ee]));
  }
  function Te(k) {
    if (ce = !1, !Y || k.button !== 0 || k.shiftKey) return;
    const { x: S, y: L } = pe(k.clientX, k.clientY), ee = ra(a, s, w, { left: S, top: L, right: S, bottom: L });
    P = {
      ax: S,
      ay: L,
      cx: k.clientX,
      cy: k.clientY,
      index: ee.length ? ee[0] : null,
      live: !1
    }, window.addEventListener("pointermove", _e), window.addEventListener("pointerup", xe), window.addEventListener("pointercancel", xe);
  }
  function _e(k) {
    P && (P.cx = k.clientX, P.cy = k.clientY, !T && (T = requestAnimationFrame(() => {
      T = 0, he();
    })));
  }
  function xe(k) {
    if (!P) return;
    window.removeEventListener("pointermove", _e), window.removeEventListener("pointerup", xe), window.removeEventListener("pointercancel", xe), cancelAnimationFrame(T), T = 0, P.cx = k.clientX, P.cy = k.clientY, he();
    const S = P.live;
    P = null, H && (H.hidden = !0), S && (ce = !0, n.sweepEnd());
  }
  e.addEventListener("pointerdown", Te);
  function Re(k) {
    if (ce) {
      ce = !1;
      return;
    }
    const S = k.target.closest(".tile");
    if (!S || !e.contains(S)) return;
    const L = Number(S.dataset.index), ee = s[L];
    ee && n.activate && n.activate(ee, k, S, L);
  }
  e.addEventListener("click", Re), window.addEventListener("scroll", z, { passive: !0 });
  let Ee = 0;
  const Ce = new ResizeObserver(() => {
    clearTimeout(Ee), Ee = setTimeout(O, 100);
  });
  Ce.observe(e);
  const le = new IntersectionObserver(
    (k) => {
      k.some((S) => S.isIntersecting) && re();
    },
    { rootMargin: "0px 0px " + ia + "px 0px" }
  );
  return le.observe(t), w = e.clientWidth, re(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      d++, b = !1;
      for (const [k, S] of Array.from(i)) ne(k, S);
      s.length = 0, a.length = 0, u.length = 0, o = 0, c = gn, g = null, m = null, _ = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), re();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(k) {
      const S = typeof k == "number" ? k : null;
      S !== m && (m = S, q(), y({ total: m }));
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
        const ge = o;
        if (await re(), o === ge) break;
      }
      const S = a.find((ge) => ge.to > k);
      if (!S) return null;
      const L = Math.max(0, (window.innerHeight - S.height) / 2);
      window.scrollTo(0, Math.max(0, e.offsetTop + S.top - L)), fe();
      const ee = i.get(k);
      return ee ? { item: s[k], tile: ee } : null;
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
      for (const [S, L] of i)
        s[S] === k && n.fill && n.fill(L, k);
    },
    destroy() {
      d++, e.removeEventListener("click", Re), e.removeEventListener("pointerdown", Te), window.removeEventListener("pointermove", _e), window.removeEventListener("pointerup", xe), window.removeEventListener("pointercancel", xe), window.removeEventListener("scroll", z), Ce.disconnect(), le.disconnect(), clearTimeout(Ee), cancelAnimationFrame(v), cancelAnimationFrame(T);
    }
  };
}
function Mu(e) {
  try {
    const t = Uint8Array.from(atob(e), (N) => N.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, s = t[3] | t[4] << 8, a = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, c = (s >> 3 & 63) / 63, g = (s >> 9 & 63) / 63, m = s >> 15, _ = Math.max(3, m ? o ? 5 : 7 : s & 7), h = Math.max(3, m ? s & 7 : o ? 5 : 7);
    let b = o ? 6 : 5, w = 0;
    const d = (N, V, fe) => {
      const ue = [];
      for (let j = 0; j < V; j++)
        for (let re = j ? 0 : 1; re * V < N * (V - j); re++) {
          const ye = t[b + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          ue.push((ye / 7.5 - 1) * fe);
        }
      return ue;
    }, v = d(_, h, u), y = d(3, 3, c * 1.25), R = d(3, 3, g * 1.25), F = _ / h, q = Math.max(1, Math.round(F > 1 ? 32 : 32 * F)), G = Math.max(1, Math.round(F > 1 ? 32 / F : 32)), Z = document.createElement("canvas");
    Z.width = q, Z.height = G;
    const ne = Z.getContext("2d"), U = ne.createImageData(q, G), B = [], K = [];
    for (let N = 0, V = 0; N < G; N++)
      for (let fe = 0; fe < q; fe++, V += 4) {
        let ue = a, j = i, re = l;
        for (let O = 0; O < _; O++) B[O] = Math.cos(Math.PI / q * (fe + 0.5) * O);
        for (let O = 0; O < h; O++) K[O] = Math.cos(Math.PI / G * (N + 0.5) * O);
        for (let O = 0, Y = 0; O < h; O++)
          for (let P = O ? 0 : 1; P * h < _ * (h - O); P++, Y++)
            ue += v[Y] * B[P] * K[O] * 2;
        for (let O = 0, Y = 0; O < 3; O++)
          for (let P = O ? 0 : 1; P < 3 - O; P++, Y++) {
            const T = B[P] * K[O] * 2;
            j += y[Y] * T, re += R[Y] * T;
          }
        const ye = ue - 2 / 3 * j, M = (3 * ue - ye + re) / 2, z = M - re;
        U.data[V] = Math.max(0, Math.min(255, Math.round(255 * M))), U.data[V + 1] = Math.max(0, Math.min(255, Math.round(255 * z))), U.data[V + 2] = Math.max(0, Math.min(255, Math.round(255 * ye))), U.data[V + 3] = 255;
      }
    return ne.putImageData(U, 0, 0), Z.toDataURL();
  } catch {
    return null;
  }
}
var Au = /* @__PURE__ */ I('<main id="canvas"><div id="sentinel"></div></main>');
function Ru(e, t) {
  vt(t, !0);
  let n = J(t, "key", 3, ""), s = J(t, "total", 3, null), a = J(t, "triage", 3, !1), i = J(t, "excludedDirs", 19, () => []), l = J(t, "selecting", 3, !1), u = J(t, "markedKeys", 19, () => []), o = J(t, "onActivate", 3, () => {
  }), c = J(t, "onOverride", 3, async () => null), g = J(t, "onExcludeFolder", 3, () => {
  }), m = J(t, "onState", 3, () => {
  }), _ = J(t, "onSweepStart", 3, () => {
  }), h = J(t, "onSweepMove", 3, () => {
  }), b = J(t, "onSweepEnd", 3, () => {
  }), w = /* @__PURE__ */ X(null), d = /* @__PURE__ */ X(null), v = null, y = "";
  const R = /* @__PURE__ */ se(() => new Set(u())), F = { null: "exclude", exclude: "include", include: "clear" };
  function q(M) {
    const z = M.toLowerCase().startsWith(Qn.toLowerCase()) ? M.slice(Qn.length + 1) : M;
    return z.length > 64 ? "…" + z.slice(-64) : z;
  }
  function G(M) {
    const z = document.createElement("div");
    z.className = "tile-path", M.appendChild(z);
    const O = document.createElement("button");
    O.className = "chip", O.type = "button", M.appendChild(O);
    const Y = document.createElement("button");
    Y.className = "dirchip", Y.type = "button", Y.textContent = "dir", M.appendChild(Y);
  }
  function Z(M, z) {
    const O = M.querySelector(".tile-path");
    O && (O.textContent = z.p ? q(z.p) : "");
    const Y = M.querySelector(".dirchip");
    if (Y) {
      const T = Xa(z.p ?? ""), H = T !== "" && Is(i(), T);
      Y.hidden = T === "", Y.disabled = H, Y.dataset.state = H ? "exclude" : "none", Y.title = H ? `already excluded: ${T}` : `exclude everything under ${T}, subfolders included — one exclude rule at the end of the order`;
    }
    const P = M.querySelector(".chip");
    P && (P.dataset.state = z.o || "none", P.textContent = z.o === "exclude" ? "drop" : z.o === "include" ? "keep" : "·", P.title = z.o === "exclude" ? "overridden: excluded — click to keep" : z.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  function ne(M) {
    const z = document.createElement("span");
    z.className = "tick", M.appendChild(z);
  }
  function U(M, z) {
    M.dataset.marked = r(R).has(z.id) ? "on" : "off";
  }
  rr(() => (v = Tu(r(w), r(d), {
    fetchPage: (M) => t.fetchPage(M),
    thumbHash: Mu,
    extend: a() ? G : ne,
    fill: a() ? Z : U,
    onState: (M) => m()(M),
    sweepStart: (M, z) => _()(M, z),
    sweepMove: (M) => h()(M),
    sweepEnd: () => b()(),
    activate: async (M, z, O, Y) => {
      if (z.target.closest(".dirchip")) {
        g()(M);
        return;
      }
      if (!z.target.closest(".chip")) {
        o()(M, O, Y, z.shiftKey);
        return;
      }
      const P = F[M.o ?? "null"];
      M.o = await c()(M, P), Z(O, M);
    }
  }), y = n(), v.setSweeping(l()), () => v?.destroy())), zt(() => {
    v?.setSweeping(l());
  }), zt(() => {
    const M = n(), z = s();
    v && (M !== y && (y = M, v.reset()), v.setTotal(z));
  });
  function B(M) {
    return v?.walkTo(M);
  }
  function K(M) {
    v?.focus(M);
  }
  function N(M, z) {
    return v?.itemsBetween(M, z) ?? [];
  }
  let V = "";
  zt(() => {
    const M = i().join(`
`);
    !v || M === V || (V = M, v.refill());
  });
  let fe = "";
  zt(() => {
    const M = u().join(",");
    !v || M === fe || (fe = M, v.refill());
  });
  var ue = { walkTo: B, focusTile: K, itemsBetween: N }, j = Au();
  let re;
  var ye = f(j);
  return gr(ye, (M) => x(d, M), () => r(d)), gr(j, (M) => x(w, M), () => r(w)), W(() => re = Pe(j, 1, "", null, re, { selecting: l() })), C(e, j), pt(ue);
}
var Pu = /* @__PURE__ */ I('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Cu = /* @__PURE__ */ I('<th class="num svelte-1v3p82v"> </th>'), Nu = /* @__PURE__ */ I('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Ou = /* @__PURE__ */ I('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Iu = /* @__PURE__ */ I('<td class="num svelte-1v3p82v"> </td>'), Fu = /* @__PURE__ */ I('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), zu = /* @__PURE__ */ I('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Lu(e, t) {
  vt(t, !0);
  let n = J(t, "rows", 19, () => []), s = J(t, "rules", 19, () => []), a = J(t, "root", 3, null), i = J(t, "selected", 3, null), l = J(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ se(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const c = /* @__PURE__ */ se(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : Va(s(), t.screen.toRule(w, a()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var _ = Cs(), h = ct(_);
  {
    var b = (w) => {
      var d = zu(), v = f(d), y = f(v), R = f(y);
      {
        var F = (B) => {
          var K = Pu();
          C(B, K);
        };
        te(R, (B) => {
          r(u) && B(F);
        });
      }
      var q = p(R), G = f(q), Z = p(q, 3);
      {
        var ne = (B) => {
          var K = Cu(), N = f(K);
          W(() => A(N, t.screen.heading[1])), C(B, K);
        };
        te(Z, (B) => {
          t.screen.heading[1] && B(ne);
        });
      }
      var U = p(v);
      Je(U, 23, n, (B) => B.key, (B, K, N) => {
        const V = /* @__PURE__ */ se(() => r(c).get(r(K).key));
        var fe = Fu();
        let ue;
        var j = f(fe);
        {
          var re = (_e) => {
            const xe = /* @__PURE__ */ se(() => l().has(r(K).key));
            var Re = Nu(), Ee = f(Re);
            let Ce;
            var le = f(Ee);
            W(
              (k) => {
                Ce = Pe(Ee, 1, "tick svelte-1v3p82v", null, Ce, { on: r(xe) }), ve(Ee, "aria-checked", r(xe)), ve(Ee, "aria-label", `select ${k ?? ""}`), A(le, r(xe) ? "✓" : "");
              },
              [() => o(r(K))]
            ), Q("click", Ee, (k) => {
              k.stopPropagation(), t.oncheck(r(K), r(N), k.shiftKey);
            }), C(_e, Re);
          };
          te(j, (_e) => {
            r(u) && _e(re);
          });
        }
        var ye = p(j), M = f(ye);
        let z;
        var O = f(M), Y = p(M), P = p(Y);
        {
          var T = (_e) => {
            var xe = Ou();
            C(_e, xe);
          };
          te(P, (_e) => {
            r(K).scope === "whole inventory" && _e(T);
          });
        }
        var H = p(ye), ce = f(H), pe = p(H), ie = f(pe), he = p(pe);
        {
          var Te = (_e) => {
            var xe = Iu(), Re = f(xe);
            W(() => A(Re, r(K).detail ?? "")), C(_e, xe);
          };
          te(he, (_e) => {
            t.screen.heading[1] && _e(Te);
          });
        }
        W(
          (_e, xe, Re) => {
            ue = Pe(fe, 1, "svelte-1v3p82v", null, ue, {
              picked: i() === r(K).key,
              clickable: t.screen.sheet !== !1
            }), z = Pe(M, 1, "mark svelte-1v3p82v", null, z, {
              exclude: r(V) === "exclude",
              include: r(V) === "include"
            }), ve(M, "title", m[r(V)] ?? ""), A(O, g[r(V)] ?? ""), A(Y, `${_e ?? ""} `), A(ce, xe), A(ie, Re);
          },
          [
            () => o(r(K)),
            () => Oe(r(K).paths),
            () => Nt(r(K).bytes)
          ]
        ), Q("click", fe, () => t.onpick(r(K))), C(B, fe);
      }), W(() => A(G, t.screen.heading[0] ?? "")), C(w, d);
    };
    te(h, (w) => {
      n().length && w(b);
    });
  }
  C(e, _), pt();
}
jt(["click"]);
var Du = /* @__PURE__ */ I('<button class="twisty svelte-pucy57"> </button>'), ju = /* @__PURE__ */ I('<span class="twisty leaf svelte-pucy57">·</span>'), Hu = /* @__PURE__ */ I('<span class="name root svelte-pucy57"> </span>'), Bu = /* @__PURE__ */ I('<button class="name svelte-pucy57"> </button>'), qu = /* @__PURE__ */ I('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Uu = /* @__PURE__ */ I('<div class="note svelte-pucy57"> </div>'), Wu = /* @__PURE__ */ I('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Yu = /* @__PURE__ */ I('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Gu = /* @__PURE__ */ I('<div class="tree svelte-pucy57"></div>');
function Ku(e, t) {
  vt(t, !0);
  let n = J(t, "version", 3, 0), s = J(t, "excludedDirs", 19, () => []), a = J(t, "selected", 3, null), i = J(t, "busy", 3, !1), l = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Set())), c = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Set()));
  async function g(d) {
    x(o, new Set(r(o)).add(d), !0);
    const v = await t.onload(d), y = new Map(r(l)), R = new Set(r(c));
    v ? (y.set(d, v), R.delete(d)) : R.add(d), x(l, y, !0), x(c, R, !0), x(o, new Set([...r(o)].filter((F) => F !== d)), !0);
  }
  function m(d) {
    if (r(u).has(d)) {
      x(u, new Set([...r(u)].filter((v) => v !== d)), !0);
      return;
    }
    x(u, new Set(r(u)).add(d), !0), r(l).has(d) || g(d);
  }
  let _ = -1;
  zt(() => {
    const d = n();
    if (d !== _) {
      _ = d, r(u).has(t.root) || x(u, new Set(r(u)).add(t.root), !0);
      for (const v of r(u)) g(v);
    }
  });
  const h = /* @__PURE__ */ se(() => {
    const d = [], v = (q, G, Z, ne, U, B) => {
      const K = r(l).get(q), N = r(u).has(q);
      if (d.push({
        key: q,
        name: G,
        depth: Z,
        paths: ne,
        bytes: U,
        deeper: B,
        expanded: N,
        here: K?.here ?? null,
        truncated: !!K?.truncated,
        loading: r(o).has(q),
        failed: r(c).has(q),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: Is(s(), q)
      }), !(!N || !K))
        for (const V of K.children)
          v(V.path, V.name, Z + 1, V.paths, V.bytes, V.deeper);
    }, y = r(l).get(t.root), R = y ? y.children.reduce((q, G) => q + G.paths, 0) + y.here.paths : 0, F = y ? y.children.reduce((q, G) => q + G.bytes, 0) + y.here.bytes : 0;
    return v(t.root, t.root, 0, R, F, !0), d;
  }), b = 8;
  var w = Gu();
  Je(w, 21, () => r(h), (d) => d.key, (d, v) => {
    var y = Yu(), R = ct(y);
    let F;
    var q = f(R);
    let G;
    var Z = p(q, 2);
    {
      var ne = (P) => {
        var T = Du(), H = f(T);
        W(() => {
          ve(T, "aria-expanded", r(v).expanded), ve(T, "aria-label", `${r(v).expanded ? "collapse" : "expand"} ${r(v).name ?? ""}`), ve(T, "title", r(v).expanded ? "collapse" : "expand"), A(H, r(v).loading ? "·" : r(v).expanded ? "▾" : "▸");
        }), Q("click", T, () => m(r(v).key)), C(P, T);
      }, U = (P) => {
        var T = ju();
        C(P, T);
      };
      te(Z, (P) => {
        r(v).deeper ? P(ne) : P(U, -1);
      });
    }
    var B = p(Z, 2);
    {
      var K = (P) => {
        var T = Hu(), H = f(T);
        W(() => A(H, r(v).key)), C(P, T);
      }, N = (P) => {
        var T = Bu(), H = f(T);
        W(() => {
          ve(T, "title", `Show every kept file under ${r(v).key ?? ""}`), A(H, r(v).name);
        }), Q("click", T, () => t.onpick(r(v))), C(P, T);
      };
      te(B, (P) => {
        r(v).depth === 0 ? P(K) : P(N, -1);
      });
    }
    var V = p(B, 2), fe = f(V), ue = p(V, 2), j = f(ue), re = p(ue, 2), ye = p(R, 2);
    {
      var M = (P) => {
        var T = qu();
        let H;
        W((ce) => H = en(T, "", H, ce), [
          () => ({
            "padding-left": `${Math.min(r(v).depth, b) * 11 + 18}px`
          })
        ]), C(P, T);
      }, z = (P) => {
        var T = Uu();
        let H;
        var ce = f(T);
        W(
          (pe, ie, he) => {
            H = en(T, "", H, pe), A(ce, `${ie ?? ""} directly here · ${he ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(v).depth, b) * 11 + 18}px`
            }),
            () => Oe(r(v).here.paths),
            () => Nt(r(v).here.bytes)
          ]
        ), C(P, T);
      };
      te(ye, (P) => {
        r(v).expanded && r(v).failed ? P(M) : r(v).expanded && r(v).here && r(v).here.paths > 0 && P(z, 1);
      });
    }
    var O = p(ye, 2);
    {
      var Y = (P) => {
        var T = Wu();
        let H;
        W((ce) => H = en(T, "", H, ce), [
          () => ({
            "padding-left": `${Math.min(r(v).depth, b) * 11 + 18}px`
          })
        ]), C(P, T);
      };
      te(O, (P) => {
        r(v).truncated && P(Y);
      });
    }
    W(
      (P, T, H) => {
        F = Pe(R, 1, "row svelte-pucy57", null, F, {
          picked: a() === r(v).key,
          gone: r(v).excluded
        }), G = en(q, "", G, P), A(fe, T), A(j, H), re.disabled = i() || r(v).excluded || r(v).depth === 0, ve(re, "title", r(v).depth === 0 ? "The library root is not excludable from here." : r(v).excluded ? "already excluded" : `Exclude everything under ${r(v).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(v).depth, b) * 11}px` }),
        () => Oe(r(v).paths),
        () => Nt(r(v).bytes)
      ]
    ), Q("click", re, () => t.onexclude(r(v))), C(d, y);
  }), C(e, w), pt();
}
jt(["click"]);
var Xu = /* @__PURE__ */ I('<button title="Back to its default">↺</button>'), Vu = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), $u = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), Ju = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), Zu = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), Qu = /* @__PURE__ */ I('<li><code class="svelte-1hh0fwb"> </code> </li>'), ec = /* @__PURE__ */ I(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), tc = /* @__PURE__ */ I('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function nc(e, t) {
  vt(t, !0);
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
  let u = /* @__PURE__ */ X(Ie(io())), o = /* @__PURE__ */ X(!0), c = /* @__PURE__ */ X(!1), g = /* @__PURE__ */ X(Ie(ti())), m = /* @__PURE__ */ X(Ie(window.innerWidth));
  const _ = (N) => r(g) === "light" ? N.light : N.dark, h = (N) => N in En ? En : bn, b = (N) => `rgba(${N.r}, ${N.g}, ${N.b}, ${N.a})`, w = /* @__PURE__ */ se(() => JSON.stringify(r(u), null, 2));
  rr(() => {
    const N = localStorage.getItem(n);
    if (N)
      try {
        x(u, ns(JSON.parse(N)), !0);
        return;
      } catch {
      }
    Fs();
  });
  function d(N) {
    x(u, ns({ ...r(u), ...N }), !0), localStorage.setItem(n, JSON.stringify(r(u))), x(c, !1);
  }
  function v(N) {
    x(u, ns(N), !0), localStorage.setItem(n, JSON.stringify(r(u))), x(c, !1);
  }
  function y(N) {
    d({ [N]: h(N)[N] });
  }
  function R() {
    x(g, ni(r(g) === "dark" ? "light" : "dark"), !0);
  }
  async function F() {
    await navigator.clipboard.writeText(r(w)), x(c, !0);
  }
  var q = tc();
  let G;
  var Z = f(q), ne = p(f(Z), 4), U = f(ne), B = p(Z, 2);
  {
    var K = (N) => {
      var V = ec();
      {
        const Ee = (le, k = Rr, S = Rr, L = Rr) => {
          var ee = Xu();
          let ge;
          W(() => {
            ge = Pe(ee, 1, "undo svelte-1hh0fwb", null, ge, { idle: !S() }), ve(ee, "aria-label", `Reset ${k() ?? ""}`);
          }), Q("click", ee, function(...oe) {
            L()?.apply(this, oe);
          }), C(le, ee);
        };
        var fe = p(f(V), 2);
        Je(fe, 17, () => s, wt, (le, k) => {
          var S = $u(), L = f(S), ee = f(L), ge = p(L, 2), oe = f(ge), de = p(ge, 2);
          Je(de, 17, () => r(k).rows, wt, (Ve, Ht) => {
            var $e = /* @__PURE__ */ se(() => Jr(r(Ht), 5));
            let Ke = () => r($e)[0], St = () => r($e)[1], Kt = () => r($e)[2], nt = () => r($e)[3], ln = () => r($e)[4];
            const Et = /* @__PURE__ */ se(() => r(u)[Ke()] !== h(Ke())[Ke()]), Tt = /* @__PURE__ */ se(() => typeof nt() == "function" ? nt()(r(m)) : nt());
            var Mt = Vu();
            let Ze;
            var At = f(Mt), Bt = f(At), at = p(At, 2), D = p(at, 2), ae = p(D, 2);
            Ee(ae, St, () => r(Et), () => () => y(Ke())), W(() => {
              Ze = Pe(Mt, 1, "row svelte-1hh0fwb", null, Ze, { moved: r(Et) }), A(Bt, St()), ve(at, "min", Kt()), ve(at, "max", r(Tt)), ve(at, "step", ln()), ve(at, "aria-label", St()), Sn(at, r(u)[Ke()]), ve(D, "min", Kt()), ve(D, "max", r(Tt)), ve(D, "step", ln()), ve(D, "aria-label", `${St() ?? ""} value`), Sn(D, r(u)[Ke()]);
            }), Q("input", at, (be) => d({ [Ke()]: Number(be.currentTarget.value) })), Q("input", D, (be) => d({ [Ke()]: Number(be.currentTarget.value) })), C(Ve, Mt);
          }), W(() => {
            A(ee, r(k).title), A(oe, r(k).note);
          }), C(le, S);
        });
        var ue = p(fe, 2), j = f(ue), re = p(ue, 2), ye = f(re), M = p(re, 2);
        Je(M, 17, () => ao, wt, (le, k) => {
          const S = /* @__PURE__ */ se(() => _(r(k))), L = /* @__PURE__ */ se(() => r(u)[r(S)]), ee = /* @__PURE__ */ se(() => r(k).base[r(S)]);
          var ge = Zu(), oe = f(ge), de = f(oe), Ve = p(de), Ht = f(Ve), $e = p(oe, 2), Ke = f($e), St = p($e, 2);
          Je(St, 17, () => i, wt, (Et, Tt) => {
            var Mt = /* @__PURE__ */ se(() => Jr(r(Tt), 3));
            let Ze = () => r(Mt)[0], At = () => r(Mt)[1], Bt = () => r(Mt)[2];
            const at = /* @__PURE__ */ se(() => r(L)[Ze()] !== r(ee)[Ze()]);
            var D = Ju();
            let ae;
            var be = f(D), De = f(be), Me = p(be, 2), ke = p(Me, 2), He = p(ke, 2);
            Ee(He, At, () => r(at), () => () => d({
              [r(S)]: { ...r(L), [Ze()]: r(ee)[Ze()] }
            })), W(() => {
              ae = Pe(D, 1, "row svelte-1hh0fwb", null, ae, { moved: r(at) }), A(De, At()), ve(Me, "max", Bt()), ve(Me, "step", Bt() === 1 ? 0.01 : 1), ve(Me, "aria-label", `${r(g) ?? ""} ${a[r(k).dark].title ?? ""} ${At() ?? ""}`), Sn(Me, r(L)[Ze()]), ve(ke, "max", Bt()), ve(ke, "step", Bt() === 1 ? 0.01 : 1), ve(ke, "aria-label", `${r(g) ?? ""} ${a[r(k).dark].title ?? ""} ${At() ?? ""} value`), Sn(ke, r(L)[Ze()]);
            }), Q("input", Me, (Qe) => d({
              [r(S)]: {
                ...r(L),
                [Ze()]: Number(Qe.currentTarget.value)
              }
            })), Q("input", ke, (Qe) => d({
              [r(S)]: {
                ...r(L),
                [Ze()]: Number(Qe.currentTarget.value)
              }
            })), C(Et, D);
          });
          var Kt = p(St, 2);
          let nt;
          var ln = f(Kt);
          W(
            (Et, Tt) => {
              A(de, `${a[r(k).dark].title ?? ""} `), A(Ht, r(g)), A(Ke, a[r(k).dark].note), nt = en(Kt, "", nt, Et), A(ln, Tt);
            },
            [
              () => ({ background: b(r(L)) }),
              () => b(r(L))
            ]
          ), C(le, ge);
        });
        var z = p(M, 2), O = p(f(z), 4);
        let Ce;
        var Y = f(O), P = f(Y), T = p(Y, 2);
        Ee(T, () => "Blur at the edge", () => r(u).blurEdge !== En.blurEdge, () => () => y("blurEdge"));
        var H = p(z, 2), ce = p(f(H), 4);
        Je(ce, 21, () => l, wt, (le, k) => {
          var S = /* @__PURE__ */ se(() => Jr(r(k), 2));
          let L = () => r(S)[0], ee = () => r(S)[1];
          var ge = Qu(), oe = f(ge), de = f(oe), Ve = p(oe);
          W(() => {
            A(de, L()), A(Ve, ` — ${ee() ?? ""}`);
          }), C(le, ge);
        });
        var pe = p(H, 2), ie = p(f(pe), 4), he = f(ie), Te = p(he, 2), _e = p(Te, 2), xe = f(_e), Re = p(ie, 2);
        W(() => {
          A(j, `The five colours below are per theme, and you are editing the ${r(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), A(ye, `Edit the ${r(g) === "dark" ? "light" : "dark"} colours`), Ce = Pe(O, 1, "row toggle svelte-1hh0fwb", null, Ce, { moved: r(u).blurEdge !== En.blurEdge }), Bl(P, r(u).blurEdge), A(xe, r(c) ? "Copied" : "Copy"), Sn(Re, r(w));
        }), Q("click", re, R), Q("change", P, (le) => d({ blurEdge: le.currentTarget.checked })), Q("click", he, () => v(bn)), Q("click", Te, () => v(En)), Q("click", _e, F);
      }
      C(N, V);
    };
    te(B, (N) => {
      r(o) && N(K);
    });
  }
  W(() => {
    G = Pe(q, 1, "tuner svelte-1hh0fwb", null, G, { folded: !r(o) }), ve(ne, "title", r(o) ? "Fold away" : "Open"), A(U, r(o) ? "–" : "+");
  }), Wl("innerWidth", (N) => x(m, N, !0)), Q("click", ne, () => x(o, !r(o))), C(e, q), pt();
}
jt(["click", "input", "change"]);
function ls(e, t, n, s) {
  const a = e + t;
  return a < 0 || a >= n && s ? null : a;
}
var rc = /* @__PURE__ */ I('<button><span class="n svelte-1n46o8q"> </span> </button>'), sc = /* @__PURE__ */ I('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), ac = /* @__PURE__ */ I('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), ic = /* @__PURE__ */ I('<div class="muted pad svelte-1n46o8q">loading…</div>'), lc = /* @__PURE__ */ I('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), oc = /* @__PURE__ */ I('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), uc = /* @__PURE__ */ I('<p class="blurb"> </p>'), cc = /* @__PURE__ */ I('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), dc = /* @__PURE__ */ I('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), fc = /* @__PURE__ */ I('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), hc = /* @__PURE__ */ I('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), vc = /* @__PURE__ */ I("<div> </div>"), pc = /* @__PURE__ */ I('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function gc(e, t) {
  vt(t, !0);
  const n = location.pathname === "/tune";
  let s = /* @__PURE__ */ X("grid"), a = /* @__PURE__ */ X(0), i = /* @__PURE__ */ X(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ X(Ie([])), u = /* @__PURE__ */ X(null), o = /* @__PURE__ */ X(null), c = /* @__PURE__ */ X(Ie(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ X(null), m = /* @__PURE__ */ X(null), _ = /* @__PURE__ */ X(null), h = /* @__PURE__ */ X(null), b = /* @__PURE__ */ X(!1), w = /* @__PURE__ */ X(!1), d = /* @__PURE__ */ X(!1), v = /* @__PURE__ */ X(!1), y = /* @__PURE__ */ X(Ie({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), R = /* @__PURE__ */ X(null), F = /* @__PURE__ */ X(0), q = /* @__PURE__ */ X(null), G = /* @__PURE__ */ X(Ie({})), Z = /* @__PURE__ */ X("newest"), ne = /* @__PURE__ */ X(Ie(bo())), U = /* @__PURE__ */ X(null), B = /* @__PURE__ */ X(null), K = /* @__PURE__ */ X(!1), N = /* @__PURE__ */ X(Ie([])), V = /* @__PURE__ */ X(null), fe = null, ue = !0;
  const j = /* @__PURE__ */ se(() => Js[r(a)]), re = /* @__PURE__ */ se(() => r(j).table !== !1), ye = /* @__PURE__ */ se(() => r(re) || r(j).tree === !0), M = /* @__PURE__ */ se(() => r(j).sheet !== !1 && (r(o) !== null || !r(ye))), z = /* @__PURE__ */ se(() => ({
    sort: r(Z),
    ...r(ne).on ? { stack: r(ne).window } : {},
    ...Object.fromEntries(Object.entries(r(G)).filter(([, E]) => E.length > 0))
  })), O = /* @__PURE__ */ se(() => r(N).map((E) => E.key)), Y = /* @__PURE__ */ se(() => wu(r(N)));
  zt(() => {
    r(z), nn(() => {
      x(N, [], !0), x(
        V,
        null
        // it indexes an order this query no longer has
      );
    });
  });
  const P = /* @__PURE__ */ se(() => r(s) === "grid" ? `grid:${JSON.stringify(r(z))}` : `triage:${r(a)}:${JSON.stringify(r(o))}`), T = /* @__PURE__ */ se(() => r(j).rule === !1 || r(c).size === 0 ? [] : r(l).filter((E) => r(c).has(E.key)).map((E) => r(j).toRule(E, r(i))).filter((E) => E && Va(r(m)?.rules ?? [], E) !== "exclude")), H = /* @__PURE__ */ se(() => (r(m)?.rules ?? []).filter((E) => E.decision === "exclude" && E.term?.column === "dir_under").map((E) => String(E.term.value).replace(/[\\/]+$/, "").toLowerCase())), ce = Kl();
  function pe(E) {
    x(R, String(E), !0);
  }
  async function ie(E) {
    try {
      return x(R, null), await E();
    } catch ($) {
      return pe($), null;
    }
  }
  const he = Xl(
    () => {
      x(w, !0), ie(async () => {
        const E = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: $, value: Ae } = await ce(() => qe.counts(r(o), E));
        $ || x(m, Ae, !0);
      }).finally(() => {
        x(w, !1);
      });
    },
    220
  );
  async function Te() {
    x(_, "loading");
    const E = await ie(() => qe.files());
    x(_, E, !0), x(b, !1), x(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function _e(E = !1) {
    if (r(s) !== "triage" || !r(re)) {
      x(l, [], !0);
      return;
    }
    x(v, !0);
    const $ = r(j).name === "source_folder" && r(i) ? { root: r(i) } : {};
    E && ($.live = "1");
    const Ae = await ie(() => qe.screen(r(j).name, $));
    x(l, Ae?.rows ?? [], !0), x(v, !1);
  }
  let xe = !1;
  zt(() => {
    r(a), r(s), nn(() => {
      x(u, null), x(o, null), x(i, null), le(), r(s) === "triage" && (_e(), he.now(), xe || (xe = !0, Te()));
    });
  }), zt(() => {
    r(i), nn(() => {
      r(s) === "triage" && (le(), _e());
    });
  }), rr(() => {
    ie(async () => {
      x(q, await qe.facets(), !0);
    });
  });
  function Re(E, $) {
    x(G, { ...r(G), [E]: $ }, !0);
  }
  function Ee(E) {
    if (r(j).sheet !== !1) {
      if (r(j).drill && !r(i)) {
        x(u, E.key, !0), x(
          o,
          {
            ...r(j).toRule(E, null),
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
          ...r(j).toRule(E, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), he();
    }
  }
  function Ce(E, $, Ae) {
    const je = new Set(r(c)), Be = !je.has(E.key), $t = Ae && r(g) !== null ? r(l).findIndex((Pt) => Pt.key === r(g)) : -1, [zn, Ln] = $t < 0 ? [$, $] : $t < $ ? [$t, $] : [$, $t];
    for (let Pt = zn; Pt <= Ln; Pt++)
      Be ? je.add(r(l)[Pt].key) : je.delete(r(l)[Pt].key);
    x(c, je, !0), x(g, E.key, !0);
  }
  function le() {
    x(c, /* @__PURE__ */ new Set(), !0), x(g, null);
  }
  function k(E) {
    x(o, E, !0), x(
      u,
      null
      // it no longer corresponds to a row
    ), he();
  }
  function S(E = !1) {
    x(o, null), x(u, null), E && x(i, null), he.now();
  }
  async function L() {
    x(
      b,
      !0
      // the distinct-content number now says so on its face
    ), ul(F), await _e(), he.now();
  }
  async function ee() {
    if (!r(o)) return;
    x(d, !0);
    const E = r(o).at === "end" ? void 0 : 0, $ = await ie(() => qe.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(j).id} ${r(j).title}`
      },
      E
    ));
    x(d, !1), $ && (x(o, null), x(u, null), await L());
  }
  async function ge() {
    const E = r(T);
    if (!E.length) {
      le();
      return;
    }
    x(d, !0);
    for (const $ of E)
      if (!await ie(() => qe.addRule({
        column: $.column,
        op: $.op,
        value: $.value,
        decision: "exclude",
        note: `screen ${r(j).id} ${r(j).title}`
      }))) break;
    x(d, !1), le(), x(o, null), x(u, null), await L();
  }
  async function oe(E) {
    if (!E || Is(r(H), E)) return;
    x(d, !0);
    const $ = await ie(() => qe.addRule({
      column: "dir_under",
      op: "=",
      value: E,
      decision: "exclude",
      note: `screen ${r(j).id} ${r(j).title}`
    }));
    x(d, !1), $ && await L();
  }
  const de = (E) => oe(Xa(E.p ?? "")), Ve = (E) => oe(E.key);
  async function Ht(E) {
    x(d, !0), await ie(() => qe.deleteRule(E.id)), x(d, !1), await L();
  }
  async function $e(E, $) {
    x(d, !0), await ie(() => qe.moveRule(E.id, $)), x(d, !1), await L();
  }
  async function Ke() {
    await ie(async () => {
      x(q, await qe.facets(), !0);
    });
  }
  async function St(E, $) {
    const Ae = await ie(() => qe.override(E.s, $));
    return Ae ? (x(b, !0), he(), Ae.decision) : E.o ?? null;
  }
  function Kt(E) {
    return r(s) === "grid" ? qe.photos({ limit: 500, ...r(z), ...E || {} }) : qe.page(r(o), E);
  }
  const nt = (E) => E.m ?? [{ id: E.id, s: E.s, w: E.w, h: E.h }];
  function ln(E, $, Ae, je = !1) {
    if (r(s) === "grid") {
      if (r(K)) {
        if (je && r(V) !== null) {
          const Be = r(B)?.itemsBetween(r(V), Ae) ?? [];
          x(N, aa(r(N), Be.map(is), !Et(E)), !0);
        } else
          x(N, mu(r(N), is(E)), !0);
        x(V, Ae, !0);
        return;
      }
      x(U, { frames: nt(E), origin: oa($), at: Ae }, !0);
      return;
    }
    ie(() => qe.revealOrigin(E.id));
  }
  const Et = (E) => r(N).some(($) => $.key === E.id);
  function Tt(E, $) {
    fe = r(N), ue = E === null || !Et(E), $ !== null && x(V, $, !0);
  }
  function Mt(E) {
    x(N, aa(fe, E.map(is), ue), !0);
  }
  function Ze() {
    fe = null;
  }
  function At() {
    x(N, [], !0), x(V, null);
  }
  const Bt = /* @__PURE__ */ se(() => r(U) !== null && ls(r(U).at, -1, r(y).count, r(y).exhausted) !== null), at = /* @__PURE__ */ se(() => r(U) !== null && ls(r(U).at, 1, r(y).count, r(y).exhausted) !== null), D = 120;
  let ae = !1, be = 0;
  async function De(E, $ = !1) {
    const Ae = performance.now();
    if (!r(U) || ae || $ && Ae - be < D) return;
    const je = ls(r(U).at, E, r(y).count, r(y).exhausted);
    if (je !== null) {
      be = Ae, ae = !0;
      try {
        const Be = await r(B)?.walkTo(je);
        if (!Be || !r(U)) return;
        x(
          U,
          {
            frames: nt(Be.item),
            origin: oa(Be.tile),
            at: je
          },
          !0
        );
      } finally {
        ae = !1;
      }
    }
  }
  async function Me() {
    const E = r(U)?.at ?? null;
    x(U, null), await xl(), E !== null && r(B)?.focusTile(E);
  }
  function ke(E) {
    Me(), ie(() => qe.revealPhoto(E.id));
  }
  function He() {
    ie(() => navigator.clipboard.writeText(xu(
      {
        stacking: r(ne),
        sort: r(Z),
        filters: r(G)
      },
      r(N)
    )));
  }
  var Qe = pc(), qt = ct(Qe);
  {
    var Le = (E) => {
      zo(E, {
        get facets() {
          return r(q);
        },
        get selected() {
          return r(G);
        },
        get sort() {
          return r(Z);
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
        get marked() {
          return r(Y);
        },
        onselect: Re,
        onsort: ($) => x(Z, $, !0),
        onstack: ($) => x(ne, mo($), !0),
        onclear: () => x(G, {}, !0),
        onselecting: ($) => x(K, $, !0),
        onshare: He,
        onunmark: At,
        ontriage: () => x(s, "triage")
      });
    };
    te(qt, (E) => {
      r(s) === "grid" && E(Le);
    });
  }
  var Xt = p(qt, 2);
  {
    var Vt = (E) => {
      nc(E, {});
    };
    te(Xt, (E) => {
      n && E(Vt);
    });
  }
  var it = p(Xt, 2);
  let on;
  var Fn = f(it);
  {
    var Yr = (E) => {
      var $ = oc(), Ae = f($), je = f(Ae), Be = p(Ae, 2);
      Je(Be, 21, () => Js, wt, (lt, Ct, un) => {
        var cn = rc();
        let Dn;
        var jn = f(cn), Ne = f(jn), ot = p(jn, 1, !0);
        W(() => {
          Dn = Pe(cn, 1, "nav svelte-1n46o8q", null, Dn, { on: un === r(a) }), A(Ne, r(Ct).id), A(ot, r(Ct).title);
        }), Q("click", cn, () => x(a, un, !0)), C(lt, cn);
      });
      var $t = p(Be, 2);
      {
        var zn = (lt) => {
          var Ct = lc(), un = ct(Ct), cn = f(un);
          {
            var Dn = (et) => {
              var rt = sc(), Hn = ct(rt), sr = /* @__PURE__ */ se(() => S.bind(null, !0)), Xr = p(Hn, 2), Vr = f(Xr);
              W(() => A(Vr, `inside ${r(i) ?? ""}`)), Q("click", Hn, function(...$r) {
                r(sr)?.apply(this, $r);
              }), C(et, rt);
            }, jn = (et) => {
              var rt = ac(), Hn = f(rt);
              W(() => A(Hn, r(j).relive)), Q("click", rt, () => _e(!0)), C(et, rt);
            };
            te(cn, (et) => {
              r(j).drill && r(i) ? et(Dn) : r(j).relive && et(jn, 1);
            });
          }
          var Ne = p(un, 2);
          {
            var ot = (et) => {
              var rt = ic();
              C(et, rt);
            };
            te(Ne, (et) => {
              r(v) && et(ot);
            });
          }
          var dn = p(Ne, 2);
          {
            let et = /* @__PURE__ */ se(() => r(m)?.rules ?? []);
            Lu(dn, {
              get rows() {
                return r(l);
              },
              get screen() {
                return r(j);
              },
              get root() {
                return r(i);
              },
              get checked() {
                return r(c);
              },
              get rules() {
                return r(et);
              },
              get selected() {
                return r(u);
              },
              onpick: Ee,
              oncheck: Ce
            });
          }
          C(lt, Ct);
        };
        te($t, (lt) => {
          r(re) && lt(zn);
        });
      }
      var Ln = p($t, 2);
      {
        var Pt = (lt) => {
          Ku(lt, {
            get root() {
              return Qn;
            },
            get version() {
              return r(F);
            },
            get excludedDirs() {
              return r(H);
            },
            get selected() {
              return r(u);
            },
            get busy() {
              return r(d);
            },
            onload: (Ct) => ie(() => qe.tree(Ct)),
            onpick: Ee,
            onexclude: Ve
          });
        };
        te(Ln, (lt) => {
          r(j).tree && lt(Pt);
        });
      }
      var Sr = p(Ln, 2);
      {
        let lt = /* @__PURE__ */ se(() => r(m)?.rules ?? []), Ct = /* @__PURE__ */ se(() => r(m)?.unmatched ?? null);
        bu(Sr, {
          get rules() {
            return r(lt);
          },
          get unmatched() {
            return r(Ct);
          },
          get busy() {
            return r(d);
          },
          ondelete: Ht,
          onmove: $e
        });
      }
      var Er = p(Sr, 2);
      lu(Er, { oncomplete: Ke }), Q("click", je, () => x(s, "grid")), C(E, $);
    };
    te(Fn, (E) => {
      r(s) === "triage" && E(Yr);
    });
  }
  var wr = p(Fn, 2), yr = f(wr);
  {
    var Gr = (E) => {
      var $ = hc(), Ae = ct($), je = f(Ae), Be = p(Ae, 2), $t = f(Be), zn = p(Be, 2);
      {
        var Ln = (Ne) => {
          var ot = uc(), dn = f(ot);
          W(() => A(dn, r(j).note)), C(Ne, ot);
        };
        te(zn, (Ne) => {
          r(j).note && Ne(Ln);
        });
      }
      var Pt = p(zn, 2);
      {
        var Sr = (Ne) => {
          Jo(Ne, {
            get screen() {
              return r(j);
            }
          });
        };
        te(Pt, (Ne) => {
          r(j).name === "dimensions" && Ne(Sr);
        });
      }
      var Er = p(Pt, 2);
      so(Er, {
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
        onfiles: Te
      });
      var lt = p(Er, 2);
      {
        var Ct = (Ne) => {
          var ot = cc(), dn = f(ot), et = f(dn), rt = p(dn, 2), Hn = f(rt), sr = p(rt, 2), Xr = p(sr, 2), Vr = f(Xr);
          {
            var $r = (fn) => {
              var Bn = Yn("already excluded — nothing left to write");
              C(fn, Bn);
            }, ai = (fn) => {
              var Bn = Yn();
              W((ii) => A(Bn, `one exclude rule each, at the end of the order${ii ?? ""}`), [
                () => r(T).length < r(c).size ? ` · ${Oe(r(c).size - r(T).length)} already excluded, skipped` : ""
              ]), C(fn, Bn);
            };
            te(Vr, (fn) => {
              r(T).length ? fn(ai, -1) : fn($r);
            });
          }
          W(
            (fn, Bn) => {
              A(et, `${fn ?? ""} ticked`), rt.disabled = r(d) || !r(T).length, A(Hn, Bn), sr.disabled = r(d);
            },
            [
              () => Oe(r(c).size),
              () => r(d) ? "saving…" : `Exclude ${Oe(r(T).length)}`
            ]
          ), Q("click", rt, ge), Q("click", sr, le), C(Ne, ot);
        };
        te(lt, (Ne) => {
          r(c).size && Ne(Ct);
        });
      }
      var un = p(lt, 2);
      hu(un, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(j);
        },
        get saving() {
          return r(d);
        },
        onedit: k,
        onconfirm: ee,
        onclear: S
      });
      var cn = p(un, 2);
      {
        var Dn = (Ne) => {
          var ot = dc(), dn = f(ot);
          W((et, rt) => A(dn, `${et ?? ""}${rt ?? ""} loaded${r(y).exhausted ? " · all of them" : ""}${r(y).loading ? " · loading…" : ""} `), [
            () => Oe(r(y).count),
            () => r(y).total ? " of " + Oe(r(y).total) : ""
          ]), C(Ne, ot);
        }, jn = (Ne) => {
          var ot = fc();
          C(Ne, ot);
        };
        te(cn, (Ne) => {
          r(M) ? Ne(Dn) : r(j).sheet === !1 && Ne(jn, 1);
        });
      }
      W(() => {
        A(je, `${r(j).id ?? ""} · ${r(j).title ?? ""}`), A($t, r(j).blurb);
      }), C(E, $);
    };
    te(yr, (E) => {
      r(s) === "triage" && E(Gr);
    });
  }
  var Rt = p(yr, 2);
  {
    var gt = (E) => {
      {
        let $ = /* @__PURE__ */ se(() => r(s) === "grid" ? null : r(m)?.page_paths ?? null), Ae = /* @__PURE__ */ se(() => r(s) === "triage"), je = /* @__PURE__ */ se(() => r(s) === "grid" && r(K));
        gr(
          Ru(E, {
            get key() {
              return r(P);
            },
            fetchPage: Kt,
            get total() {
              return r($);
            },
            get triage() {
              return r(Ae);
            },
            get excludedDirs() {
              return r(H);
            },
            get selecting() {
              return r(je);
            },
            get markedKeys() {
              return r(O);
            },
            onActivate: ln,
            onOverride: St,
            onExcludeFolder: de,
            onSweepStart: Tt,
            onSweepMove: Mt,
            onSweepEnd: Ze,
            onState: (Be) => x(y, { ...r(y), ...Be }, !0)
          }),
          (Be) => x(B, Be, !0),
          () => r(B)
        );
      }
    };
    te(Rt, (E) => {
      (r(M) || r(s) === "grid") && E(gt);
    });
  }
  var xn = p(it, 2);
  {
    var xr = (E) => {
      Yo(E, {
        get frames() {
          return r(U).frames;
        },
        get origin() {
          return r(U).origin;
        },
        get back() {
          return r(Bt);
        },
        get forward() {
          return r(at);
        },
        onstep: De,
        onreveal: ke,
        onclose: Me
      });
    };
    te(xn, (E) => {
      r(U) && E(xr);
    });
  }
  var kr = p(xn, 2);
  {
    var Kr = (E) => {
      var $ = vc();
      let Ae;
      var je = f($);
      W(() => {
        Ae = Pe($, 1, "status", null, Ae, { bare: r(s) === "grid" }), A(je, r(R));
      }), C(E, $);
    };
    te(kr, (E) => {
      r(R) && E(Kr);
    });
  }
  W(() => on = Pe(it, 1, "shell", null, on, { bare: r(s) === "grid" })), C(e, Qe), pt();
}
jt(["click"]);
wo();
Fs();
Rl(gc, { target: document.getElementById("app") });
