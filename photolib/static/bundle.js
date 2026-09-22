var ws = Array.isArray, ui = Array.prototype.indexOf, Lr = Array.prototype.includes, Gr = Array.from, di = Object.defineProperty, Zn = Object.getOwnPropertyDescriptor, fi = Object.getOwnPropertyDescriptors, hi = Object.prototype, vi = Array.prototype, fa = Object.getPrototypeOf, Ls = Object.isExtensible;
const Nr = () => {
};
function pi(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ha() {
  var e, t, n = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
function Zr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const s of e)
    if (n.push(s), n.length === t) break;
  return n;
}
const et = 2, er = 4, Kr = 8, va = 1 << 24, Ut = 16, Nt = 32, hn = 64, ls = 128, zt = 512, Xe = 1024, Je = 2048, Gt = 4096, ft = 8192, Tt = 16384, ir = 32768, os = 1 << 25, tr = 65536, Fr = 1 << 17, gi = 1 << 18, lr = 1 << 19, _i = 1 << 20, Zt = 1 << 25, Bn = 65536, Dr = 1 << 21, Qn = 1 << 22, An = 1 << 23, Fn = Symbol("$state"), bi = Symbol("legacy props"), mi = Symbol(""), pa = Symbol("attributes"), cs = Symbol("class"), us = Symbol("style"), ds = Symbol("text"), Sr = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), wi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function yi(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function xi() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function ki(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Si(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Ei() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ti(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Mi() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ai(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Ri() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Pi() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ci() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function zi() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Ni = 1, Oi = 2, ga = 4, Ii = 8, Li = 16, Fi = 1, Di = 4, ji = 8, Hi = 16, Bi = 1, qi = 2, $e = Symbol("uninitialized"), Ui = "http://www.w3.org/1999/xhtml";
function Yi() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Wi() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Gi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function _a(e) {
  return e === this.v;
}
function Ki(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ba(e) {
  return !Ki(e, this.v);
}
let it = null;
function nr(e) {
  it = e;
}
function Mt(e, t = !1, n) {
  it = {
    p: it,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      ge
    ),
    l: null
  };
}
function At(e) {
  var t = (
    /** @type {ComponentContext} */
    it
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var s of n)
      Fa(s);
  }
  return e !== void 0 && (t.x = e), t.i = !0, it = t.p, e ?? /** @type {T} */
  {};
}
function ma() {
  return !0;
}
let On = [];
function wa() {
  var e = On;
  On = [], pi(e);
}
function dn(e) {
  if (On.length === 0 && !mr) {
    var t = On;
    queueMicrotask(() => {
      t === On && wa();
    });
  }
  On.push(e);
}
function $i() {
  for (; On.length > 0; )
    wa();
}
function ya(e) {
  var t = ge;
  if (t === null)
    return be.f |= An, e;
  if ((t.f & ir) === 0 && (t.f & er) === 0)
    throw e;
  Mn(e, t);
}
function Mn(e, t) {
  if (!(t !== null && (t.f & Tt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & ls) !== 0) {
        if ((t.f & ir) === 0)
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
const Vi = -7169;
function Be(e, t) {
  e.f = e.f & Vi | t;
}
function ys(e) {
  (e.f & zt) !== 0 || e.deps === null ? Be(e, Xe) : Be(e, Gt);
}
function xa(e) {
  if (e !== null)
    for (const t of e)
      (t.f & et) === 0 || (t.f & Bn) === 0 || (t.f ^= Bn, xa(
        /** @type {Derived} */
        t.deps
      ));
}
function ka(e, t, n) {
  (e.f & Je) !== 0 ? t.add(e) : (e.f & Gt) !== 0 && n.add(e), xa(e.deps), Be(e, Xe);
}
let Rr = !1;
function Xi(e) {
  var t = Rr;
  try {
    return Rr = !1, [e(), Rr];
  } finally {
    Rr = t;
  }
}
function Ji(e, t, n, s = !0) {
  s && n();
  for (var a of t)
    e.addEventListener(a, n);
  $r(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function or(e) {
  var t = be, n = ge;
  Ot(null), en(null);
  try {
    return e();
  } finally {
    Ot(t), en(n);
  }
}
function Zi(e) {
  let t = 0, n = qn(0), s;
  return () => {
    Es() && (r(n), Da(() => (t === 0 && (s = qt(() => e(() => wr(n)))), t += 1, () => {
      dn(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, wr(n));
      });
    })));
  };
}
var Qi = tr | lr;
function el(e, t, n, s) {
  new tl(e, t, n, s);
}
class tl {
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
  #b = Zi(() => (this.#d = qn(this.#p), () => {
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
        ge
      );
      l.b = this, l.f |= ls, s(i);
    }, this.parent = /** @type {Effect} */
    ge.b, this.transform_error = a ?? this.parent?.transform_error ?? ((i) => i), this.#s = Ms(() => {
      this.#h();
    }, Qi);
  }
  #_() {
    try {
      this.#i = Ct(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#t.failed, { reset: s, invoke_onerror: a } = this.#m(t);
    dn(a), n && (this.#o = Ct(() => {
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
        Gi();
        return;
      }
      n = !0, s && zi(), this.#o !== null && jn(this.#o, () => {
        this.#o = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: a, invoke_onerror: () => {
      try {
        s = !0, this.#t.onerror?.(t, a), s = !1;
      } catch (l) {
        Mn(l, this.#s && this.#s.parent);
      }
    } };
  }
  #x() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#n = Ct(() => t(this.#e)), dn(() => {
      var n = this.#a = document.createDocumentFragment(), s = fn();
      n.append(s), this.#i = this.#v(() => Ct(() => this.#l(s))), this.#c === 0 && (this.#e.before(n), this.#a = null, jn(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        ye
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#p = 0, this.#i = Ct(() => {
        this.#l(this.#e);
      }), this.#c > 0) {
        var t = this.#a = document.createDocumentFragment();
        Rs(this.#i, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#n = Ct(() => n(this.#e));
      } else
        this.#w(
          /** @type {Batch} */
          ye
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
    ka(t, this.#f, this.#g);
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
    var n = ge, s = be, a = it;
    en(this.#s), Ot(this.#s), nr(this.#s.ctx);
    try {
      return Pn.ensure(), t();
    } catch (i) {
      return ya(i), null;
    } finally {
      en(n), Ot(s), nr(a);
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
    this.#c += t, this.#c === 0 && (this.#w(n), this.#n && jn(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#u) && (this.#u = !0, dn(() => {
      this.#u = !1, this.#d && rr(this.#d, this.#p);
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
    ye?.is_fork ? (this.#i && ye.skip_effect(this.#i), this.#n && ye.skip_effect(this.#n), this.#o && ye.skip_effect(this.#o), ye.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#i && (yt(this.#i), this.#i = null), this.#n && (yt(this.#n), this.#n = null), this.#o && (yt(this.#o), this.#o = null);
    let n = this.#t.failed;
    const s = (a) => {
      const { reset: i, invoke_onerror: l } = this.#m(a);
      l(), n && (this.#o = this.#v(() => {
        try {
          return Ct(() => {
            var c = (
              /** @type {Effect} */
              ge
            );
            c.b = this, c.f |= ls, n(
              this.#e,
              () => a,
              () => i
            );
          });
        } catch (c) {
          return Mn(
            c,
            /** @type {Effect} */
            this.#s.parent
          ), null;
        }
      }));
    };
    dn(() => {
      var a;
      try {
        a = this.transform_error(t);
      } catch (i) {
        Mn(i, this.#s && this.#s.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof /** @type {any} */
      a.then == "function" ? a.then(
        s,
        /** @param {unknown} e */
        (i) => Mn(i, this.#s && this.#s.parent)
      ) : s(a);
    });
  }
}
function nl(e, t, n, s) {
  const a = yr;
  var i = e.filter((v) => !v.settled), l = t.map(a);
  if (n.length === 0 && i.length === 0) {
    s(l);
    return;
  }
  var c = (
    /** @type {Effect} */
    ge
  ), o = rl(), d = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((v) => v.promise)) : null;
  function g(v) {
    if ((c.f & Tt) === 0) {
      o();
      try {
        s([...l, ...v]);
      } catch (w) {
        Mn(w, c);
      }
      jr();
    }
  }
  var m = Sa();
  if (n.length === 0) {
    d.then(() => g([])).finally(m);
    return;
  }
  function _() {
    Promise.all(n.map((v) => /* @__PURE__ */ sl(v))).then(g).catch((v) => Mn(v, c)).finally(m);
  }
  d ? d.then(() => {
    o(), _(), jr();
  }) : _();
}
function rl() {
  var e = (
    /** @type {Effect} */
    ge
  ), t = be, n = it, s = (
    /** @type {Batch} */
    ye
  );
  return function(i = !0) {
    en(e), Ot(t), nr(n), i && (e.f & Tt) === 0 && (s?.activate(), s?.apply());
  };
}
function jr(e = !0) {
  en(null), Ot(null), nr(null), e && ye?.deactivate();
}
function Sa() {
  var e = (
    /** @type {Effect} */
    ge
  ), t = e.b, n = (
    /** @type {Batch} */
    ye
  ), s = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(s, e), () => {
    t?.update_pending_count(-1, n), n.decrement(s, e);
  };
}
// @__NO_SIDE_EFFECTS__
function yr(e) {
  var t = et | Je;
  return ge !== null && (ge.f |= lr), {
    ctx: it,
    deps: null,
    effects: null,
    equals: _a,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      $e
    ),
    wv: 0,
    parent: ge,
    ac: null
  };
}
const vr = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function sl(e, t, n) {
  let s = (
    /** @type {Effect | null} */
    ge
  );
  s === null && xi();
  var a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = qn(
    /** @type {V} */
    $e
  ), l = !be, c = /* @__PURE__ */ new Set();
  return wl(() => {
    var o = (
      /** @type {Effect} */
      ge
    ), d = ha();
    a = d.promise;
    try {
      Promise.resolve(e()).then(d.resolve, (v) => {
        v !== Sr && d.reject(v);
      }).finally(jr);
    } catch (v) {
      d.reject(v), jr();
    }
    var g = (
      /** @type {Batch} */
      ye
    );
    if (l) {
      if ((o.f & ir) !== 0)
        var m = Sa();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        s.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(vr);
      else
        for (const v of c.values())
          v.reject(vr);
      c.add(d), g.async_deriveds.set(o, d);
    }
    const _ = (v, w = void 0) => {
      m?.(), c.delete(d), w !== vr && (g.activate(), w ? (i.f |= An, rr(i, w)) : ((i.f & An) !== 0 && (i.f ^= An), rr(i, v)), g.deactivate());
    };
    d.promise.then(_, (v) => _(null, v || "unknown"));
  }), $r(() => {
    for (const o of c)
      o.reject(vr);
  }), new Promise((o) => {
    function d(g) {
      function m() {
        g === a ? o(i) : d(a);
      }
      g.then(m, m);
    }
    d(a);
  });
}
// @__NO_SIDE_EFFECTS__
function ie(e) {
  const t = /* @__PURE__ */ yr(e);
  return Ua(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ea(e) {
  const t = /* @__PURE__ */ yr(e);
  return t.equals = ba, t;
}
function al(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      yt(
        /** @type {Effect} */
        t[n]
      );
  }
}
function xs(e) {
  var t, n = ge, s = e.parent;
  if (!vn && s !== null && e.v !== $e && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (s.f & (Tt | ft)) !== 0)
    return Yi(), e.v;
  en(s);
  try {
    e.f &= ~Bn, al(e), t = Ka(e);
  } finally {
    en(n);
  }
  return t;
}
function Ta(e) {
  var t = xs(e);
  if (!e.equals(t) && (e.wv = Wa(), (!ye?.is_fork || e.deps === null) && (ye !== null ? (ye.capture(e, t, !0), fs?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Be(e, Xe);
    return;
  }
  vn || (Yt !== null ? (Es() || ye?.is_fork) && Yt.set(e, t) : ys(e));
}
function il(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && or(() => {
        t.ac.abort(Sr), t.ac = null;
      }), t.fn !== null && (t.teardown = Nr), xr(t, 0), As(t));
}
function Ma(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && sr(t);
}
let Qr = null, Kn = null, ye = null, fs = null, Yt = null, hs = null, mr = !1, es = !1, Xn = null, Or = null;
var Fs = 0;
let ll = 1;
class Pn {
  id = ll++;
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
    Kn === null ? Qr = Kn = this : (Kn.#t = this, this.#r = Kn), Kn = this;
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
        Be(a, Je), n(a);
      for (a of s.m)
        Be(a, Gt), n(a);
    }
    this.#g.add(t);
  }
  #_() {
    this.#e = !0, Fs++ > 1e3 && (this.#v(), cl());
    for (const o of this.#c)
      this.#u.delete(o), Be(o, Je), this.schedule(o);
    for (const o of this.#u)
      Be(o, Gt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Xn = [], s = [], a = Or = [];
    for (const o of t)
      try {
        this.#y(o, n, s);
      } catch (d) {
        throw Pa(o), this.#b() || this.discard(), d;
      }
    if (ye = null, a.length > 0) {
      var i = Pn.ensure();
      for (const o of a)
        i.schedule(o);
    }
    if (Xn = null, Or = null, this.#b()) {
      this.#h(s), this.#h(n);
      for (const [o, d] of this.#f)
        Ra(o, d);
      a.length > 0 && /** @type {unknown} */
      ye.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(s), this.#h(n), l.#x(this);
      return;
    }
    this.#c.clear(), this.#u.clear();
    for (const o of this.#l) o(this);
    this.#l.clear(), fs = this, Ds(s), Ds(n), fs = null, this.#o?.resolve();
    var c = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      ye
    );
    if (this.#i === 0 && (this.#a.length === 0 || c !== null) && this.#v(), this.#a.length > 0)
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
  #y(t, n, s) {
    t.f ^= Xe;
    for (var a = t.first; a !== null; ) {
      var i = a.f, l = (i & (Nt | hn)) !== 0, c = l && (i & Xe) !== 0, o = c || (i & ft) !== 0 || this.#f.has(a);
      if (!o && a.fn !== null) {
        l ? a.f ^= Xe : (i & er) !== 0 ? n.push(a) : Tr(a) && ((i & Ut) !== 0 && this.#u.add(a), sr(a));
        var d = a.first;
        if (d !== null) {
          a = d;
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
      if (a !== null && !((s.f & et) !== 0 && (s.f & (Je | Gt)) === 0))
        for (const c of a) {
          var i = c.f;
          if ((i & et) !== 0)
            n(
              /** @type {Derived} */
              c
            );
          else {
            var l = (
              /** @type {Effect} */
              c
            );
            i & (Qn | Ut) && !this.async_deriveds.has(l) && (this.#u.delete(l), Be(l, Je), this.schedule(l));
          }
        }
    };
    for (const s of this.current.keys())
      n(s);
    this.oncommit(() => t.discard()), t.#v(), ye = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      ka(t[n], this.#c, this.#u);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, s = !1) {
    t.v !== $e && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & An) === 0 && (this.current.set(t, [n, s]), Yt?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    ye = this;
  }
  deactivate() {
    ye = null, Yt = null;
  }
  flush() {
    try {
      es = !0, ye = this, this.#_();
    } finally {
      Fs = 0, hs = null, Xn = null, Or = null, es = !1, ye = null, Yt = null, Dn.clear();
    }
  }
  discard() {
    for (const t of this.#s) t(this);
    this.#s.clear();
    for (const t of this.async_deriveds.values())
      t.reject(vr);
    this.#v(), this.#o?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let m = Qr; m !== null; m = m.#t) {
      var t = m.id < this.id, n = [];
      for (const [_, [v, w]] of this.current) {
        if (m.current.has(_)) {
          var s = (
            /** @type {[any, boolean]} */
            m.current.get(_)[0]
          );
          if (t && v !== s)
            m.current.set(_, [v, w]);
          else
            continue;
        }
        n.push(_);
      }
      if (t)
        for (const [_, v] of this.async_deriveds) {
          const w = m.async_deriveds.get(_);
          w && v.promise.then(w.resolve).catch(w.reject);
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
              m.unskip_effect(_, (v) => {
                (v.f & (Ut | Qn)) !== 0 ? m.schedule(v) : m.#h([v]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
          for (var o of n)
            Aa(o, i, l, c);
          c = /* @__PURE__ */ new Map();
          var d = [...m.current].filter(([_, v]) => {
            const w = this.current.get(_);
            return w ? w[0] !== v[0] || w[1] !== v[1] : !0;
          }).map(([_]) => _);
          if (d.length > 0)
            for (const _ of this.#p)
              (_.f & (Tt | ft | Fr)) === 0 && ks(_, d, c) && ((_.f & (Qn | Ut)) !== 0 ? (Be(_, Je), m.schedule(_)) : m.#c.add(_));
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
    this.#d || (this.#d = !0, dn(() => {
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
    return (this.#o ??= ha()).promise;
  }
  static ensure() {
    if (ye === null) {
      const t = ye = new Pn();
      !es && !mr && dn(() => {
        t.#e || t.flush();
      });
    }
    return ye;
  }
  apply() {
    {
      Yt = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (hs = t, t.b?.is_pending && (t.f & (er | Kr | va)) !== 0 && (t.f & ir) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var s = n.f;
      if (Xn !== null && n === ge && (be === null || (be.f & et) === 0))
        return;
      if ((s & (hn | Nt)) !== 0) {
        if ((s & Xe) === 0)
          return;
        n.f ^= Xe;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#r, n = this.#t;
      t === null ? Qr = n : t.#t = n, n === null ? Kn = t : n.#r = t, this.linked = !1;
    }
  }
}
function ol(e) {
  var t = mr;
  mr = !0;
  try {
    for (var n; ; ) {
      if ($i(), ye === null)
        return (
          /** @type {T} */
          n
        );
      ye.flush();
    }
  } finally {
    mr = t;
  }
}
function cl() {
  try {
    Mi();
  } catch (e) {
    Mn(e, hs);
  }
}
let cn = null;
function Ds(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var s = e[n++];
      if ((s.f & (Tt | ft)) === 0 && Tr(s) && (cn = /* @__PURE__ */ new Set(), sr(s), s.deps === null && s.first === null && s.nodes === null && s.teardown === null && s.ac === null && Ha(s), cn?.size > 0)) {
        Dn.clear();
        for (const a of cn) {
          if ((a.f & (Tt | ft)) !== 0) continue;
          const i = [a];
          let l = a.parent;
          for (; l !== null; )
            cn.has(l) && (cn.delete(l), i.push(l)), l = l.parent;
          for (let c = i.length - 1; c >= 0; c--) {
            const o = i[c];
            (o.f & (Tt | ft)) === 0 && sr(o);
          }
        }
        cn.clear();
      }
    }
    cn = null;
  }
}
function Aa(e, t, n, s) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const i = a.f;
      (i & et) !== 0 ? Aa(
        /** @type {Derived} */
        a,
        t,
        n,
        s
      ) : (i & (Qn | Ut)) !== 0 && (i & Je) === 0 && ks(a, t, s) && (Be(a, Je), Ss(
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
      if (Lr.call(t, a))
        return !0;
      if ((a.f & et) !== 0 && ks(
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
  ye.schedule(e);
}
function Ra(e, t) {
  if (!((e.f & Nt) !== 0 && (e.f & Xe) !== 0)) {
    (e.f & Je) !== 0 ? t.d.push(e) : (e.f & Gt) !== 0 && t.m.push(e), Be(e, Xe);
    for (var n = e.first; n !== null; )
      Ra(n, t), n = n.next;
  }
}
function Pa(e) {
  Be(e, Xe);
  for (var t = e.first; t !== null; )
    Pa(t), t = t.next;
}
let Hr = /* @__PURE__ */ new Set();
const Dn = /* @__PURE__ */ new Map();
let Ca = !1;
function qn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: _a,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function V(e, t) {
  const n = qn(e);
  return Ua(n), n;
}
// @__NO_SIDE_EFFECTS__
function ul(e, t = !1, n = !0) {
  const s = qn(e);
  return t || (s.equals = ba), s;
}
function S(e, t, n = !1) {
  be !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Wt || (be.f & Fr) !== 0) && ma() && (be.f & (et | Ut | Qn | Fr)) !== 0 && (Qt === null || !Qt.has(e)) && Ci();
  let s = n ? De(t) : t;
  return rr(e, s, Or);
}
function rr(e, t, n = null) {
  if (!e.equals(t)) {
    Dn.set(e, vn ? t : e.v);
    var s = Pn.ensure();
    if (s.capture(e, t), (e.f & et) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & Je) !== 0 && xs(a), Yt === null && ys(a);
    }
    e.wv = Wa(), za(e, Je, n), ge !== null && (ge.f & Xe) !== 0 && (ge.f & (Nt | hn)) === 0 && (Pt === null ? kl([e]) : Pt.push(e)), !s.is_fork && Hr.size > 0 && !Ca && dl();
  }
  return t;
}
function dl() {
  Ca = !1;
  for (const e of Hr) {
    (e.f & Xe) !== 0 && Be(e, Gt);
    let t;
    try {
      t = Tr(e);
    } catch {
      t = !0;
    }
    t && sr(e);
  }
  Hr.clear();
}
function fl(e, t = 1) {
  var n = r(e), s = t === 1 ? n++ : n--;
  return S(e, n), s;
}
function wr(e) {
  S(e, e.v + 1);
}
function za(e, t, n) {
  var s = e.reactions;
  if (s !== null)
    for (var a = s.length, i = 0; i < a; i++) {
      var l = s[i], c = l.f, o = (c & Je) === 0;
      if (o && Be(l, t), (c & Fr) !== 0)
        Hr.add(
          /** @type {Effect} */
          l
        );
      else if ((c & et) !== 0) {
        var d = (
          /** @type {Derived} */
          l
        );
        Yt?.delete(d), (c & Bn) === 0 && (c & zt && (ge === null || (ge.f & Dr) === 0) && (l.f |= Bn), za(d, Gt, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (c & Ut) !== 0 && cn !== null && cn.add(g), n !== null ? n.push(g) : Ss(g);
      }
    }
}
function De(e) {
  if (typeof e != "object" || e === null || Fn in e)
    return e;
  const t = fa(e);
  if (t !== hi && t !== vi)
    return e;
  var n = /* @__PURE__ */ new Map(), s = ws(e), a = /* @__PURE__ */ V(0), i = Hn, l = (c) => {
    if (Hn === i)
      return c();
    var o = be, d = Hn;
    Ot(null), Bs(i);
    var g = c();
    return Ot(o), Bs(d), g;
  };
  return s && n.set("length", /* @__PURE__ */ V(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, o, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && Ri();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var m = /* @__PURE__ */ V(d.value);
          return n.set(o, m), m;
        }) : S(g, d.value, !0), !0;
      },
      deleteProperty(c, o) {
        var d = n.get(o);
        if (d === void 0) {
          if (o in c) {
            const g = l(() => /* @__PURE__ */ V($e));
            n.set(o, g), wr(a);
          }
        } else
          S(d, $e), wr(a);
        return !0;
      },
      get(c, o, d) {
        if (o === Fn)
          return e;
        var g = n.get(o), m = o in c;
        if (g === void 0 && (!m || Zn(c, o)?.writable) && (g = l(() => {
          var v = De(m ? c[o] : $e), w = /* @__PURE__ */ V(v);
          return w;
        }), n.set(o, g)), g !== void 0) {
          var _ = r(g);
          return _ === $e ? void 0 : _;
        }
        return Reflect.get(c, o, d);
      },
      getOwnPropertyDescriptor(c, o) {
        var d = Reflect.getOwnPropertyDescriptor(c, o);
        if (d && "value" in d) {
          var g = n.get(o);
          g && (d.value = r(g));
        } else if (d === void 0) {
          var m = n.get(o), _ = m?.v;
          if (m !== void 0 && _ !== $e)
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return d;
      },
      has(c, o) {
        if (o === Fn)
          return !0;
        var d = n.get(o), g = d !== void 0 && d.v !== $e || Reflect.has(c, o);
        if (d !== void 0 || ge !== null && (!g || Zn(c, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var _ = g ? De(c[o]) : $e, v = /* @__PURE__ */ V(_);
            return v;
          }), n.set(o, d));
          var m = r(d);
          if (m === $e)
            return !1;
        }
        return g;
      },
      set(c, o, d, g) {
        var m = n.get(o), _ = o in c;
        if (s && o === "length")
          for (var v = d; v < /** @type {Source<number>} */
          m.v; v += 1) {
            var w = n.get(v + "");
            w !== void 0 ? S(w, $e) : v in c && (w = l(() => /* @__PURE__ */ V($e)), n.set(v + "", w));
          }
        if (m === void 0)
          (!_ || Zn(c, o)?.writable) && (m = l(() => /* @__PURE__ */ V(void 0)), S(m, De(d)), n.set(o, m));
        else {
          _ = m.v !== $e;
          var y = l(() => De(d));
          S(m, y);
        }
        var f = Reflect.getOwnPropertyDescriptor(c, o);
        if (f?.set && f.set.call(g, d), !_) {
          if (s && typeof o == "string") {
            var h = (
              /** @type {Source<number>} */
              n.get("length")
            ), x = Number(o);
            Number.isInteger(x) && x >= h.v && S(h, x + 1);
          }
          wr(a);
        }
        return !0;
      },
      ownKeys(c) {
        r(a);
        var o = Reflect.ownKeys(c).filter((m) => {
          var _ = n.get(m);
          return _ === void 0 || _.v !== $e;
        });
        for (var [d, g] of n)
          g.v !== $e && !(d in c) && o.push(d);
        return o;
      },
      setPrototypeOf() {
        Pi();
      }
    }
  );
}
function js(e) {
  try {
    if (e !== null && typeof e == "object" && Fn in e)
      return e[Fn];
  } catch {
  }
  return e;
}
function hl(e, t) {
  return Object.is(js(e), js(t));
}
var Rn, Na, Oa, Ia;
function vl() {
  if (Rn === void 0) {
    Rn = window, Na = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Oa = Zn(t, "firstChild").get, Ia = Zn(t, "nextSibling").get, Ls(e) && (e[cs] = void 0, e[pa] = null, e[us] = void 0, e.__e = void 0), Ls(n) && (n[ds] = void 0);
  }
}
function fn(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Br(e) {
  return (
    /** @type {TemplateNode | null} */
    Oa.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Er(e) {
  return (
    /** @type {TemplateNode | null} */
    Ia.call(e)
  );
}
function u(e, t) {
  return /* @__PURE__ */ Br(e);
}
function dt(e, t = !1) {
  {
    var n = /* @__PURE__ */ Br(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Er(n) : n;
  }
}
function p(e, t = 1, n = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ Er(s);
  return s;
}
function pl(e) {
  e.textContent = "";
}
function La() {
  return !1;
}
function gl(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function _l(e) {
  ge === null && (be === null && Ti(), Ei()), vn && Si();
}
function bl(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function pn(e, t) {
  var n = ge;
  n !== null && (n.f & ft) !== 0 && (e |= ft);
  var s = {
    ctx: it,
    deps: null,
    nodes: null,
    f: e | Je | zt,
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
  ye?.register_created_effect(s);
  var a = s;
  if ((e & er) !== 0)
    Xn !== null ? Xn.push(s) : Pn.ensure().schedule(s);
  else if (t !== null) {
    try {
      sr(s);
    } catch (l) {
      throw yt(s), l;
    }
    a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
    (a.f & lr) === 0 && (a = a.first, (e & Ut) !== 0 && (e & tr) !== 0 && a !== null && (a.f |= tr));
  }
  if (a !== null && (a.parent = n, n !== null && bl(a, n), be !== null && (be.f & et) !== 0 && (e & hn) === 0)) {
    var i = (
      /** @type {Derived} */
      be
    );
    (i.effects ??= []).push(a);
  }
  return s;
}
function Es() {
  return be !== null && !Wt;
}
function $r(e) {
  const t = pn(Kr, null);
  return Be(t, Xe), t.teardown = e, t;
}
function mt(e) {
  _l();
  var t = (
    /** @type {Effect} */
    ge.f
  ), n = !be && (t & Nt) !== 0 && it !== null && !it.i;
  if (n) {
    var s = (
      /** @type {ComponentContext} */
      it
    );
    (s.e ??= []).push(e);
  } else
    return Fa(e);
}
function Fa(e) {
  return pn(er | _i, e);
}
function ml(e) {
  Pn.ensure();
  const t = pn(hn | lr, e);
  return (n = {}) => new Promise((s) => {
    n.outro ? jn(t, () => {
      yt(t), s(void 0);
    }) : (yt(t), s(void 0));
  });
}
function Ts(e) {
  return pn(er, e);
}
function wl(e) {
  return pn(Qn | lr, e);
}
function Da(e, t = 0) {
  return pn(Kr | t, e);
}
function B(e, t = [], n = [], s = []) {
  nl(s, t, n, (a) => {
    pn(Kr, () => {
      e(...a.map(r));
    });
  });
}
function Ms(e, t = 0) {
  var n = pn(Ut | t, e);
  return n;
}
function Ct(e) {
  return pn(Nt | lr, e);
}
function ja(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = vn, s = be;
    Hs(!0), Ot(null);
    try {
      t.call(null);
    } finally {
      Hs(n), Ot(s);
    }
  }
}
function As(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && or(() => {
      a.abort(Sr);
    });
    var s = n.next;
    (n.f & hn) !== 0 ? n.parent = null : yt(n, t), n = s;
  }
}
function yl(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Nt) === 0 && yt(t), t = n;
  }
}
function yt(e, t = !0) {
  var n = !1;
  (t || (e.f & gi) !== 0) && e.nodes !== null && e.nodes.end !== null && (xl(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= os, As(e, t && !n), xr(e, 0);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const i of s)
      i.stop();
  ja(e), e.f ^= os, e.f |= Tt;
  var a = e.parent;
  a !== null && a.first !== null && Ha(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function xl(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Er(e);
    e.remove(), e = n;
  }
}
function Ha(e) {
  var t = e.parent, n = e.prev, s = e.next;
  n !== null && (n.next = s), s !== null && (s.prev = n), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = n));
}
function jn(e, t, n = !0) {
  var s = [];
  Ba(e, s, !0);
  var a = () => {
    n && yt(e), t && t();
  }, i = s.length;
  if (i > 0) {
    var l = () => --i || a();
    for (var c of s)
      c.out(l);
  } else
    a();
}
function Ba(e, t, n) {
  if ((e.f & ft) === 0) {
    e.f ^= ft;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const c of s)
        (c.is_global || n) && t.push(c);
    for (var a = e.first; a !== null; ) {
      var i = a.next;
      if ((a.f & hn) === 0) {
        var l = (a.f & tr) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (a.f & Nt) !== 0 && (e.f & Ut) !== 0;
        Ba(a, t, l ? n : !1);
      }
      a = i;
    }
  }
}
function qr(e) {
  qa(e, !0);
}
function qa(e, t) {
  if ((e.f & ft) !== 0) {
    e.f ^= ft, (e.f & Xe) === 0 && (Be(e, Je), Pn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var s = n.next, a = (n.f & tr) !== 0 || (n.f & Nt) !== 0;
      qa(n, a ? t : !1), n = s;
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
      var a = n === s ? null : /* @__PURE__ */ Er(n);
      t.append(n), n = a;
    }
}
let Ir = !1, vn = !1;
function Hs(e) {
  vn = e;
}
let be = null, Wt = !1;
function Ot(e) {
  be = e;
}
let ge = null;
function en(e) {
  ge = e;
}
let Qt = null;
function Ua(e) {
  be !== null && (Qt ??= /* @__PURE__ */ new Set()).add(e);
}
let bt = null, Et = 0, Pt = null;
function kl(e) {
  Pt = e;
}
let Ya = 1, In = 0, Hn = In;
function Bs(e) {
  Hn = e;
}
function Wa() {
  return ++Ya;
}
function Tr(e) {
  var t = e.f;
  if ((t & Je) !== 0)
    return !0;
  if (t & et && (e.f &= ~Bn), (t & Gt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), s = n.length, a = 0; a < s; a++) {
      var i = n[a];
      if (Tr(
        /** @type {Derived} */
        i
      ) && Ta(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & zt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Yt === null && Be(e, Xe);
  }
  return !1;
}
function Ga(e, t, n = !0) {
  var s = e.reactions;
  if (s !== null && !(Qt !== null && Qt.has(e)))
    for (var a = 0; a < s.length; a++) {
      var i = s[a];
      (i.f & et) !== 0 ? Ga(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Be(i, Je) : (i.f & Xe) !== 0 && Be(i, Gt), Ss(
        /** @type {Effect} */
        i
      ));
    }
}
function Ka(e) {
  var t = bt, n = Et, s = Pt, a = be, i = Qt, l = it, c = Wt, o = Hn, d = e.f;
  bt = /** @type {null | Value[]} */
  null, Et = 0, Pt = null, be = (d & (Nt | hn)) === 0 ? e : null, Qt = null, nr(e.ctx), Wt = !1, Hn = ++In, e.ac !== null && (or(() => {
    e.ac.abort(Sr);
  }), e.ac = null);
  try {
    e.f |= Dr;
    var g = (
      /** @type {Function} */
      e.fn
    ), m = g();
    e.f |= ir;
    var _ = e.deps, v = ye?.is_fork;
    if (bt !== null) {
      var w;
      if (v || xr(e, Et), _ !== null && Et > 0)
        for (_.length = Et + bt.length, w = 0; w < bt.length; w++)
          _[Et + w] = bt[w];
      else
        e.deps = _ = bt;
      if (Es() && (e.f & zt) !== 0)
        for (w = Et; w < _.length; w++)
          (_[w].reactions ??= []).push(e);
    } else !v && _ !== null && Et < _.length && (xr(e, Et), _.length = Et);
    if (ma() && Pt !== null && !Wt && _ !== null && (e.f & (et | Gt | Je)) === 0)
      for (w = 0; w < /** @type {Source[]} */
      Pt.length; w++)
        Ga(
          Pt[w],
          /** @type {Effect} */
          e
        );
    if (a !== null && a !== e) {
      if (In++, a.deps !== null)
        for (let y = 0; y < n; y += 1)
          a.deps[y].rv = In;
      if (t !== null)
        for (const y of t)
          y.rv = In;
      Pt !== null && (s === null ? s = Pt : s.push(.../** @type {Source[]} */
      Pt));
    }
    return (e.f & An) !== 0 && (e.f ^= An), m;
  } catch (y) {
    return ya(y);
  } finally {
    e.f ^= Dr, bt = t, Et = n, Pt = s, be = a, Qt = i, nr(l), Wt = c, Hn = o;
  }
}
function Sl(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var s = ui.call(n, e);
    if (s !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[s] = n[a], n.pop());
    }
  }
  if (n === null && (t.f & et) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (bt === null || !Lr.call(bt, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & zt) !== 0 && (i.f ^= zt, i.f &= ~Bn), i.v !== $e && ys(i), i.ac !== null && or(() => {
      i.ac.abort(Sr), i.ac = null, Be(i, Je);
    }), il(i), xr(i, 0);
  }
}
function xr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var s = t; s < n.length; s++)
      Sl(e, n[s]);
}
function sr(e) {
  var t = e.f;
  if ((t & Tt) === 0) {
    Be(e, Xe);
    var n = ge, s = Ir;
    ge = e, Ir = (t & (Nt | hn)) === 0;
    try {
      (t & (Ut | va)) !== 0 ? yl(e) : As(e), ja(e);
      var a = Ka(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Ya;
      var i;
    } finally {
      Ir = s, ge = n;
    }
  }
}
async function El() {
  await Promise.resolve(), ol();
}
function r(e) {
  var t = e.f, n = (t & et) !== 0;
  if (be !== null && !Wt) {
    var s = ge !== null && (ge.f & Tt) !== 0;
    if (!s && (Qt === null || !Qt.has(e))) {
      var a = be.deps;
      if ((be.f & Dr) !== 0)
        e.rv < In && (e.rv = In, bt === null && a !== null && a[Et] === e ? Et++ : bt === null ? bt = [e] : bt.push(e));
      else {
        be.deps ??= [], Lr.call(be.deps, e) || be.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [be] : Lr.call(i, be) || i.push(be);
      }
    }
  }
  if (vn && Dn.has(e))
    return Dn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (vn) {
      var c = l.v;
      return ((l.f & Xe) === 0 && l.reactions !== null || Va(l)) && (c = xs(l)), Dn.set(l, c), c;
    }
    var o = (l.f & zt) === 0 && !Wt && be !== null && (Ir || (be.f & zt) !== 0), d = (l.f & ir) === 0;
    Tr(l) && (o && (l.f |= zt), Ta(l)), o && !d && (Ma(l), $a(l));
  }
  if (Yt?.has(e))
    return Yt.get(e);
  if ((e.f & An) !== 0)
    throw e.v;
  return e.v;
}
function $a(e) {
  if (e.f |= zt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & et) !== 0 && (t.f & zt) === 0 && (Ma(
        /** @type {Derived} */
        t
      ), $a(
        /** @type {Derived} */
        t
      ));
}
function Va(e) {
  if (e.v === $e) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Dn.has(t) || (t.f & et) !== 0 && Va(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function qt(e) {
  var t = Wt;
  try {
    return Wt = !0, e();
  } finally {
    Wt = t;
  }
}
const Tl = ["touchstart", "touchmove"];
function Ml(e) {
  return Tl.includes(e);
}
const pr = Symbol("events"), Xa = /* @__PURE__ */ new Set(), vs = /* @__PURE__ */ new Set();
function Al(e, t, n, s = {}) {
  function a(i) {
    if (s.capture || ps.call(t, i), !i.cancelBubble)
      return or(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? dn(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function Ln(e, t, n, s, a) {
  var i = { capture: s, passive: a }, l = Al(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && $r(() => {
    t.removeEventListener(e, l, i);
  });
}
function se(e, t, n) {
  (t[pr] ??= {})[e] = n;
}
function Kt(e) {
  for (var t = 0; t < e.length; t++)
    Xa.add(e[t]);
  for (var n of vs)
    n(e);
}
let qs = null;
function ps(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  qs = e;
  var l = 0, c = qs === e && e[pr];
  if (c) {
    var o = a.indexOf(c);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pr] = t;
      return;
    }
    var d = a.indexOf(t);
    if (d === -1)
      return;
    o <= d && (l = o);
  }
  if (i = /** @type {Element} */
  a[l] || e.target, i !== t) {
    di(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = be, m = ge;
    Ot(null), en(null);
    try {
      for (var _, v = []; i !== null && i !== t; ) {
        try {
          var w = i[pr]?.[s];
          w != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && w.call(i, e);
        } catch (y) {
          _ ? v.push(y) : _ = y;
        }
        if (e.cancelBubble) break;
        l++, i = l < a.length ? (
          /** @type {Element} */
          a[l]
        ) : null;
      }
      if (_) {
        for (let y of v)
          queueMicrotask(() => {
            throw y;
          });
        throw _;
      }
    } finally {
      e[pr] = t, delete e.currentTarget, Ot(g), en(m);
    }
  }
}
const Rl = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Pl(e) {
  return (
    /** @type {string} */
    Rl?.createHTML(e) ?? e
  );
}
function Cl(e) {
  var t = gl("template");
  return t.innerHTML = Pl(e.replaceAll("<!>", "<!---->")), t.content;
}
function Ur(e, t) {
  var n = (
    /** @type {Effect} */
    ge
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function z(e, t) {
  var n = (t & Bi) !== 0, s = (t & qi) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Cl(i ? e : "<!>" + e), n || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Br(a)));
    var l = (
      /** @type {TemplateNode} */
      s || Na ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (n) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Br(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      Ur(c, o);
    } else
      Ur(l, l);
    return l;
  };
}
function Jn(e = "") {
  {
    var t = fn(e + "");
    return Ur(t, t), t;
  }
}
function Ps() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = fn();
  return e.append(t, n), Ur(t, n), e;
}
function A(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function M(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[ds] ??= e.nodeValue) && (e[ds] = n, e.nodeValue = `${n}`);
}
function zl(e, t) {
  return Nl(e, t);
}
const Pr = /* @__PURE__ */ new Map();
function Nl(e, { target: t, anchor: n, props: s = {}, events: a, context: i, intro: l = !0, transformError: c }) {
  vl();
  var o = void 0, d = ml(() => {
    var g = n ?? t.appendChild(fn());
    el(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (v) => {
        Mt({});
        var w = (
          /** @type {ComponentContext} */
          it
        );
        i && (w.c = i), a && (s.$$events = a), o = e(v, s) || {}, At();
      },
      c
    );
    var m = /* @__PURE__ */ new Set(), _ = (v) => {
      for (var w = 0; w < v.length; w++) {
        var y = v[w];
        if (!m.has(y)) {
          m.add(y);
          var f = Ml(y);
          for (const T of [t, document]) {
            var h = Pr.get(T);
            h === void 0 && (h = /* @__PURE__ */ new Map(), Pr.set(T, h));
            var x = h.get(y);
            x === void 0 ? (T.addEventListener(y, ps, { passive: f }), h.set(y, 1)) : h.set(y, x + 1);
          }
        }
      }
    };
    return _(Gr(Xa)), vs.add(_), () => {
      for (var v of m)
        for (const f of [t, document]) {
          var w = (
            /** @type {Map<string, number>} */
            Pr.get(f)
          ), y = (
            /** @type {number} */
            w.get(v)
          );
          --y == 0 ? (f.removeEventListener(v, ps), w.delete(v), w.size === 0 && Pr.delete(f)) : w.set(v, y);
        }
      vs.delete(_), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return Ol.set(o, d), o;
}
let Ol = /* @__PURE__ */ new WeakMap();
class Il {
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
        qr(s), this.#l.delete(n);
      else {
        var a = this.#t.get(n);
        a && (qr(a.effect), this.#r.set(n, a.effect), this.#t.delete(n), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [i, l] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const c = this.#t.get(l);
        c && (yt(c.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#r) {
        if (i === n || this.#l.has(i)) continue;
        const c = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var d = document.createDocumentFragment();
            Rs(l, d), d.append(fn()), this.#t.set(i, { effect: l, fragment: d });
          } else
            yt(l);
          this.#l.delete(i), this.#r.delete(i);
        };
        this.#s || !s ? (this.#l.add(i), jn(l, c, !1)) : c();
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
      n.includes(s) || (yt(a.effect), this.#t.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var s = (
      /** @type {Batch} */
      ye
    ), a = La();
    if (n && !this.#r.has(t) && !this.#t.has(t))
      if (a) {
        var i = document.createDocumentFragment(), l = fn();
        i.append(l), this.#t.set(t, {
          effect: Ct(() => n(l)),
          fragment: i
        });
      } else
        this.#r.set(
          t,
          Ct(() => n(this.anchor))
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
function ne(e, t, n = !1) {
  var s = new Il(e), a = n ? tr : 0;
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
function Ll(e, t, n) {
  for (var s = [], a = t.length, i, l = t.length, c = 0; c < a; c++) {
    let m = t[c];
    jn(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            gs(e, Gr(i.done)), _.delete(i), _.size === 0 && (e.outrogroups = null);
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
      var d = (
        /** @type {Element} */
        n
      ), g = (
        /** @type {Element} */
        d.parentNode
      );
      pl(g), g.append(d), e.items.clear();
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
      i.f |= Zt;
      const l = document.createDocumentFragment();
      Rs(i, l);
    } else
      yt(t[a], n);
  }
}
var Us;
function Ve(e, t, n, s, a, i = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & ga) !== 0;
  if (o) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild(fn());
  }
  var g = null, m = /* @__PURE__ */ Ea(() => {
    var T = n();
    return (
      /** @type {V[]} */
      ws(T) ? T : T == null ? [] : Gr(T)
    );
  }), _, v = /* @__PURE__ */ new Map(), w = !0;
  function y(T) {
    (x.effect.f & Tt) === 0 && (x.pending.delete(T), x.fallback = g, Fl(x, _, l, t, s), g !== null && (_.length === 0 ? (g.f & Zt) === 0 ? qr(g) : (g.f ^= Zt, gr(g, null, l)) : jn(g, () => {
      g = null;
    })));
  }
  function f(T) {
    x.pending.delete(T);
  }
  var h = Ms(() => {
    _ = /** @type {V[]} */
    r(m);
    for (var T = _.length, L = /* @__PURE__ */ new Set(), Y = (
      /** @type {Batch} */
      ye
    ), $ = La(), ee = 0; ee < T; ee += 1) {
      var Q = _[ee], q = s(Q, ee), D = w ? null : c.get(q);
      D ? (D.v && rr(D.v, Q), D.i && rr(D.i, ee), $ && Y.unskip_effect(D.e)) : (D = Dl(
        c,
        w ? l : Us ??= fn(),
        Q,
        q,
        ee,
        a,
        t,
        n
      ), w || (D.e.f |= Zt), c.set(q, D)), L.add(q);
    }
    if (T === 0 && i && !g && (w ? g = Ct(() => i(l)) : (g = Ct(() => i(Us ??= fn())), g.f |= Zt)), T > L.size && ki(), !w)
      if (v.set(Y, L), $) {
        for (const [J, N] of c)
          L.has(J) || Y.skip_effect(N.e);
        Y.oncommit(y), Y.ondiscard(f);
      } else
        y(Y);
    r(m);
  }), x = { effect: h, items: c, pending: v, outrogroups: null, fallback: g };
  w = !1;
}
function fr(e) {
  for (; e !== null && (e.f & Nt) === 0; )
    e = e.next;
  return e;
}
function Fl(e, t, n, s, a) {
  var i = (s & Ii) !== 0, l = t.length, c = e.items, o = fr(e.effect.first), d, g = null, m, _ = [], v = [], w, y, f, h;
  if (i)
    for (h = 0; h < l; h += 1)
      w = t[h], y = a(w, h), f = /** @type {EachItem} */
      c.get(y).e, (f.f & Zt) === 0 && (f.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(f));
  for (h = 0; h < l; h += 1) {
    if (w = t[h], y = a(w, h), f = /** @type {EachItem} */
    c.get(y).e, e.outrogroups !== null)
      for (const D of e.outrogroups)
        D.pending.delete(f), D.done.delete(f);
    if ((f.f & ft) !== 0 && (qr(f), i && (f.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(f))), (f.f & Zt) !== 0)
      if (f.f ^= Zt, f === o)
        gr(f, null, n);
      else {
        var x = g ? g.next : o;
        f === e.effect.last && (e.effect.last = f.prev), f.prev && (f.prev.next = f.next), f.next && (f.next.prev = f.prev), kn(e, g, f), kn(e, f, x), gr(f, x, n), g = f, _ = [], v = [], o = fr(g.next);
        continue;
      }
    if (f !== o) {
      if (d !== void 0 && d.has(f)) {
        if (_.length < v.length) {
          var T = v[0], L;
          g = T.prev;
          var Y = _[0], $ = _[_.length - 1];
          for (L = 0; L < _.length; L += 1)
            gr(_[L], T, n);
          for (L = 0; L < v.length; L += 1)
            d.delete(v[L]);
          kn(e, Y.prev, $.next), kn(e, g, Y), kn(e, $, T), o = T, g = $, h -= 1, _ = [], v = [];
        } else
          d.delete(f), gr(f, o, n), kn(e, f.prev, f.next), kn(e, f, g === null ? e.effect.first : g.next), kn(e, g, f), g = f;
        continue;
      }
      for (_ = [], v = []; o !== null && o !== f; )
        (d ??= /* @__PURE__ */ new Set()).add(o), v.push(o), o = fr(o.next);
      if (o === null)
        continue;
    }
    (f.f & Zt) === 0 && _.push(f), g = f, o = fr(f.next);
  }
  if (e.outrogroups !== null) {
    for (const D of e.outrogroups)
      D.pending.size === 0 && (gs(e, Gr(D.done)), e.outrogroups?.delete(D));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || d !== void 0) {
    var ee = [];
    if (d !== void 0)
      for (f of d)
        (f.f & ft) === 0 && ee.push(f);
    for (; o !== null; )
      (o.f & ft) === 0 && o !== e.fallback && ee.push(o), o = fr(o.next);
    var Q = ee.length;
    if (Q > 0) {
      var q = (s & ga) !== 0 && l === 0 ? n : null;
      if (i) {
        for (h = 0; h < Q; h += 1)
          ee[h].nodes?.a?.measure();
        for (h = 0; h < Q; h += 1)
          ee[h].nodes?.a?.fix();
      }
      Ll(e, ee, q);
    }
  }
  i && dn(() => {
    if (m !== void 0)
      for (f of m)
        f.nodes?.a?.apply();
  });
}
function Dl(e, t, n, s, a, i, l, c) {
  var o = (l & Ni) !== 0 ? (l & Li) === 0 ? /* @__PURE__ */ ul(n, !1, !1) : qn(n) : null, d = (l & Oi) !== 0 ? qn(a) : null;
  return {
    v: o,
    i: d,
    e: Ct(() => (i(t, o ?? n, d ?? a, c), () => {
      e.delete(s);
    }))
  };
}
function gr(e, t, n) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, i = t && (t.f & Zt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; s !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Er(s)
      );
      if (i.before(s), s === a)
        return;
      s = l;
    }
}
function kn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Sn(e, t, n) {
  Ts(() => {
    var s = qt(() => t(e, n?.()) || {});
    if (s?.destroy)
      return () => (
        /** @type {Function} */
        s.destroy()
      );
  });
}
const Ys = [...` 	
\r\f \v\uFEFF`];
function jl(e, t, n) {
  var s = e == null ? "" : "" + e;
  if (n) {
    for (var a of Object.keys(n))
      if (n[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var i = a.length, l = 0; (l = s.indexOf(a, l)) >= 0; ) {
          var c = l + i;
          (l === 0 || Ys.includes(s[l - 1])) && (c === s.length || Ys.includes(s[c])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(c + 1) : l = c;
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
function Hl(e, t) {
  if (t) {
    var n = "", s, a;
    return Array.isArray(t) ? (s = t[0], a = t[1]) : s = t, s && (n += Ws(s)), a && (n += Ws(a, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Ee(e, t, n, s, a, i) {
  var l = (
    /** @type {any} */
    e[cs]
  );
  if (l !== n || l === void 0) {
    var c = jl(n, s, i);
    c == null ? e.removeAttribute("class") : e.className = c, e[cs] = n;
  } else if (i && a !== i)
    for (var o in i) {
      var d = !!i[o];
      (a == null || d !== !!a[o]) && e.classList.toggle(o, d);
    }
  return i;
}
function ts(e, t = {}, n, s) {
  for (var a in n) {
    var i = n[a];
    t[a] !== i && (n[a] == null ? e.style.removeProperty(a) : e.style.setProperty(a, i, s));
  }
}
function Jt(e, t, n, s) {
  var a = (
    /** @type {any} */
    e[us]
  );
  if (a !== t) {
    var i = Hl(t, s);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[us] = t;
  } else s && (Array.isArray(s) ? (ts(e, n?.[0], s[0]), ts(e, n?.[1], s[1], "important")) : ts(e, n, s));
  return s;
}
function _r(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ws(t))
      return Wi();
    for (var s of e.options)
      s.selected = t.includes(Gs(s));
    return;
  }
  for (s of e.options) {
    var a = Gs(s);
    if (hl(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Cr(e) {
  var t = new MutationObserver(() => {
    "__value" in e && _r(e, e.__value);
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
  }), $r(() => {
    t.disconnect();
  });
}
function Gs(e) {
  return "__value" in e ? e.__value : e.value;
}
const Bl = Symbol("is custom element"), ql = Symbol("is html"), Ul = wi ? "progress" : "PROGRESS";
function Vn(e, t) {
  var n = Cs(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== Ul) || (e.value = t ?? "");
}
function Yl(e, t) {
  var n = Cs(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function pe(e, t, n, s) {
  var a = Cs(e);
  a[t] !== (a[t] = n) && (t === "loading" && (e[mi] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Wl(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Cs(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[pa] ??= {
      [Bl]: e.nodeName.includes("-"),
      [ql]: e.namespaceURI === Ui
    }
  );
}
var Ks = /* @__PURE__ */ new Map();
function Wl(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Ks.get(t);
  if (n) return n;
  Ks.set(t, n = []);
  for (var s, a = e, i = Element.prototype; i !== a; ) {
    s = fi(a);
    for (var l in s)
      s[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    a = fa(a);
  }
  return n;
}
class zs {
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
          zs.entries.set(n.target, n);
          for (var s of this.#e.get(n.target) || [])
            s(n);
        }
      }
    ));
  }
}
var Gl = /* @__PURE__ */ new zs({
  box: "border-box"
});
function $s(e, t, n) {
  var s = Gl.observe(e, () => n(e[t]));
  Ts(() => (qt(() => n(e[t])), s));
}
function ns(e, t) {
  return e === t || e?.[Fn] === t;
}
function kr(e = {}, t, n, s) {
  var a = (
    /** @type {ComponentContext} */
    it.r
  ), i = (
    /** @type {Effect} */
    ge
  );
  return Ts(() => {
    var l, c;
    return Da(() => {
      l = c, c = [], qt(() => {
        ns(n(...c), e) || (t(e, ...c), l && ns(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== a && o.parent !== null && o.parent.f & os; )
        o = o.parent;
      const d = () => {
        c && ns(n(...c), e) && t(null, ...c);
      }, g = o.teardown;
      o.teardown = () => {
        d(), g?.();
      };
    };
  }), e;
}
function Kl(e, t) {
  Ji(window, ["resize"], () => or(() => t(window[e])));
}
function ae(e, t, n, s) {
  var a = !0, i = (n & ji) !== 0, l = (n & Hi) !== 0, c = (
    /** @type {V} */
    s
  ), o = !0, d = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && a ? (d ??= /* @__PURE__ */ yr(
    /** @type {() => V} */
    s
  ), r(d)) : (o && (o = !1, c = l ? qt(
    /** @type {() => V} */
    s
  ) : (
    /** @type {V} */
    s
  )), c);
  let m;
  if (i) {
    var _ = Fn in e || bi in e;
    m = Zn(e, t)?.set ?? (_ && t in e ? (L) => e[t] = L : void 0);
  }
  var v, w = !1;
  i ? [v, w] = Xi(() => (
    /** @type {V} */
    e[t]
  )) : v = /** @type {V} */
  e[t], v === void 0 && s !== void 0 && (v = g(), m && (Ai(), m(v)));
  var y;
  if (y = () => {
    var L = (
      /** @type {V} */
      e[t]
    );
    return L === void 0 ? g() : (o = !0, L);
  }, (n & Di) === 0)
    return y;
  if (m) {
    var f = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(L, Y) {
        return arguments.length > 0 ? ((!Y || f || w) && m(Y ? y() : L), L) : y();
      })
    );
  }
  var h = !1, x = ((n & Fi) !== 0 ? yr : Ea)(() => (h = !1, y()));
  i && r(x);
  var T = (
    /** @type {Effect} */
    ge
  );
  return (
    /** @type {() => V} */
    (function(L, Y) {
      if (arguments.length > 0) {
        const $ = Y ? r(x) : i ? De(L) : L;
        return S(x, $), h = !0, c !== void 0 && (c = $), L;
      }
      return vn && h || (T.f & Tt) !== 0 ? x.v : r(x);
    })
  );
}
function cr(e) {
  it === null && yi(), mt(() => {
    const t = qt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const $l = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add($l);
function Vl(e) {
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
async function on(e, t = {}) {
  const n = await fetch(e + Vl(t));
  if (!n.ok) {
    const s = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${s.error ? " (" + s.error + ")" : ""}`);
  }
  return n.json();
}
async function $n(e, t) {
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
const Ke = {
  // --- reads
  photos: (e) => on("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => on("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => on("/api/triage/counts", { ...Vs(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => on("/api/triage/files"),
  screen: (e, t = {}) => on("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => on("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => on("/api/triage/page", { ...Vs(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => on("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => $n("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => $n("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => $n("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => $n("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => $n("/api/reveal", { id: e }),
  revealOrigin: (e) => $n("/api/reveal", { origin: e }),
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
  rebuildStatus: () => on("/api/triage/rebuild")
};
function Xl() {
  let e = 0, t = 0;
  return async function(s) {
    const a = ++e, i = await s();
    return a <= t ? { stale: !0, value: void 0 } : (t = a, { stale: !1, value: i });
  };
}
function Jl(e, t) {
  let n = 0;
  const s = (...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  };
  return s.cancel = () => clearTimeout(n), s.now = (...a) => {
    clearTimeout(n), e(...a);
  }, s;
}
const Xs = ["B", "KB", "MB", "GB", "TB"];
function Ht(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < Xs.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${Xs[n]}`;
}
function Pe(e) {
  return (Number(e) || 0).toLocaleString();
}
const ar = "G:\\photos", Js = [
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
      value: t ? `${ar}\\${t}\\${e.key}` : `${ar}\\${e.key}`
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
function Ja(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), s = ar.toLowerCase();
  return n.toLowerCase().startsWith(s + "\\") ? n : "";
}
function Ns(e, t) {
  const n = t.toLowerCase();
  return e.some((s) => n === s || n.startsWith(s + "\\"));
}
function Zl(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function Ql(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function Za(e, t) {
  if (!t) return null;
  const n = e.find(
    (s) => s.term && s.term.column === t.column && s.term.op === t.op && Ql(s.term.value, t.value)
  );
  return n ? n.decision : null;
}
var eo = /* @__PURE__ */ z('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), to = /* @__PURE__ */ z('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), no = /* @__PURE__ */ z('<div class="line muted svelte-1vgp6n7">…</div>'), ro = /* @__PURE__ */ z('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), so = /* @__PURE__ */ z('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), ao = /* @__PURE__ */ z('<div class="line muted svelte-1vgp6n7"> </div>'), io = /* @__PURE__ */ z('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function lo(e, t) {
  Mt(t, !0);
  let n = ae(t, "counts", 3, null), s = ae(t, "files", 3, null), a = ae(t, "filesAt", 3, null), i = ae(t, "stale", 3, !1), l = ae(t, "candidate", 3, null), c = ae(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ie(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = io(), g = u(d);
  let m;
  var _ = p(u(g), 2);
  {
    var v = (q) => {
      var D = to(), J = dt(D), N = u(J), re = u(N), de = p(N, 2), j = u(de), te = p(de, 4), ue = u(te), me = p(te, 2), P = u(me), O = p(J, 2);
      {
        var I = (G) => {
          var R = eo(), U = p(u(R), 2), Z = u(U), Te = p(U, 2), Ae = u(Te), we = p(Te, 4), Me = u(we), ze = p(we, 2), _e = u(ze), xe = p(ze, 2), Ne = u(xe);
          B(
            (H, ve, X, b, E) => {
              M(Z, `kept ${H ?? ""}`), M(Ae, ve), M(Me, `excluded ${X ?? ""}`), M(_e, b), M(Ne, `${r(o) >= 0 ? "+" : ""}${E ?? ""} excluded`);
            },
            [
              () => Pe(n().candidate_kept_paths),
              () => Ht(n().candidate_kept_bytes),
              () => Pe(n().candidate_excluded_paths),
              () => Ht(n().candidate_excluded_bytes),
              () => Pe(r(o))
            ]
          ), A(G, R);
        };
        ne(O, (G) => {
          l() && G(I);
        });
      }
      B(
        (G, R, U, Z) => {
          M(re, `kept ${G ?? ""}`), M(j, R), M(ue, `excluded ${U ?? ""}`), M(P, Z);
        },
        [
          () => Pe(n().kept_paths),
          () => Ht(n().kept_bytes),
          () => Pe(n().excluded_paths),
          () => Ht(n().excluded_bytes)
        ]
      ), A(q, D);
    }, w = (q) => {
      var D = no();
      A(q, D);
    };
    ne(_, (q) => {
      n() ? q(v) : q(w, -1);
    });
  }
  var y = p(g, 2);
  let f;
  var h = u(y), x = p(u(h), 3), T = u(x), L = p(x, 2);
  {
    var Y = (q) => {
      var D = ro();
      A(q, D);
    };
    ne(L, (q) => {
      i() && s() && s() !== "loading" && q(Y);
    });
  }
  var $ = p(h, 2);
  {
    var ee = (q) => {
      var D = so(), J = dt(D);
      let N;
      var re = u(J), de = u(re), j = p(re, 2), te = u(j), ue = p(j, 4), me = u(ue), P = p(ue, 2), O = u(P), I = p(J, 2), G = u(I);
      B(
        (R, U, Z, Te) => {
          N = Ee(J, 1, "line svelte-1vgp6n7", null, N, { outdated: i() }), M(de, `kept ${R ?? ""}`), M(te, U), M(me, `excluded ${Z ?? ""}`), M(O, Te), M(G, `as of ${a() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Pe(s().kept_files),
          () => Ht(s().kept_bytes),
          () => Pe(s().excluded_files),
          () => Ht(s().excluded_bytes)
        ]
      ), A(q, D);
    }, Q = (q) => {
      var D = ao(), J = u(D);
      B(() => M(J, s() === "loading" ? "counting…" : "not counted yet")), A(q, D);
    };
    ne($, (q) => {
      s() && s() !== "loading" ? q(ee) : q(Q, -1);
    });
  }
  B(() => {
    m = Ee(g, 1, "block svelte-1vgp6n7", null, m, { busy: c() }), f = Ee(y, 1, "block svelte-1vgp6n7", null, f, { busy: s() === "loading" }), x.disabled = s() === "loading", M(T, s() === "loading" ? "counting…" : "recount");
  }), se("click", x, function(...q) {
    t.onfiles?.apply(this, q);
  }), A(e, d), At();
}
Kt(["click"]);
const _s = "http://www.w3.org/2000/svg", Nn = {
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
}, un = {
  ...Nn,
  refFactor: 2,
  refFresnelRange: 0,
  glareRange: 14,
  glareHardness: 0,
  glareFactor: 120,
  glareConvergence: 100,
  blurRadius: 2,
  tintLight: { r: 255, g: 255, b: 255, a: 0.13 },
  sheet: { r: 22, g: 22, b: 26, a: 0.42 },
  sheetLight: { r: 255, g: 255, b: 255, a: 0.6 },
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
}, oo = [
  { dark: "tint", light: "tintLight", base: Nn },
  { dark: "sheet", light: "sheetLight", base: un },
  { dark: "control", light: "controlLight", base: un },
  { dark: "ink", light: "inkLight", base: un },
  { dark: "tally", light: "tallyLight", base: un },
  { dark: "tallyInk", light: "tallyInkLight", base: un }
], bs = /* @__PURE__ */ new Set();
let Bt = { ...un };
function co() {
  return Bt;
}
function rs(e) {
  Bt = ho(e), Os();
  for (const t of bs) t(Bt);
  return Bt;
}
function uo(e) {
  return bs.add(e), () => bs.delete(e);
}
function br(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function fo(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: Qe(br(e.r, t.r), 0, 255),
    g: Qe(br(e.g, t.g), 0, 255),
    b: Qe(br(e.b, t.b), 0, 255),
    a: Qe(br(e.a, t.a), 0, 1)
  };
}
function ho(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [s, a] of Object.entries(un))
    typeof a == "boolean" ? n[s] = t[s] === void 0 ? a : !!t[s] : typeof a == "object" ? n[s] = fo(t[s], a) : n[s] = br(t[s], a);
  return n;
}
function Rt({ r: e, g: t, b: n, a: s }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${He(s, 3)})`;
}
function He(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function Zs(e, t) {
  const n = 0.4 + Qe(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - Qe(t, 0, 100) / 100) };
}
function Qs(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, a = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? Qe(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * a * Math.max(t.glareFactor, 0) / 100;
  return Qe(i ** (0.1 + Qe(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const vo = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function po(e, t, n) {
  const s = Qe(n.shapeRoundness, 2, 7), a = e / 2, i = t / 2, l = Math.min(n.shapeRadius, a, i), c = a - l, o = i - l, d = 8, g = [];
  for (let v = 0; v <= d; v++) {
    const w = v / d * (Math.PI / 2);
    g.push([l * Math.cos(w) ** (2 / s), l * Math.sin(w) ** (2 / s)]);
  }
  const m = [], _ = (v, w, y, f) => {
    let h = Math.atan2(v, -w);
    h < 0 && (h += Math.PI * 2);
    let x = Math.atan2(f, y);
    x < 0 && (x += Math.PI * 2);
    const T = He(Qs(x, n), 3);
    m.push(`rgba(255, 255, 255, ${T}) ${He(h / (Math.PI * 2) * 100, 2)}%`);
  };
  _(0, -i, 0, 1);
  for (const [v, w, y] of vo)
    for (let f = 0; f <= d; f++) {
      const [h, x] = g[y ? d - f : f];
      _(v * (c + h), w * (o + x), v * h ** (s - 1), -w * x ** (s - 1));
    }
  return m.push(`rgba(255, 255, 255, ${He(Qs(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function Os() {
  const e = Bt, t = document.documentElement.style, n = Zs(e.refFresnelRange, e.refFresnelHardness), s = Zs(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${He(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${He(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", Rt(e.tint)), t.setProperty("--glass-tint-light", Rt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", Rt(e.sheet)), t.setProperty("--glass-tint-sheet-light", Rt(e.sheetLight)), t.setProperty("--glass-ctl-dark", Rt(e.control)), t.setProperty("--glass-ctl-light", Rt(e.controlLight)), t.setProperty("--glass-text-dark", Rt(e.ink)), t.setProperty("--glass-text-light", Rt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", Rt(e.tally)), t.setProperty("--glass-tint-tally-light", Rt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", Rt(e.tallyInk)), t.setProperty("--glass-text-tally-light", Rt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${He(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${He(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${He(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${He(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${He(e.shadowX)}px ${He(-e.shadowY)}px ${He(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(He(Qe(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${He(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(He(Math.log2(Qe(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${He(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${He(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${He(Qe(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${He(s.width)}px`), t.setProperty("--glass-glare-blur", `${He(s.blur)}px`);
}
function Qe(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function go(e, t, n, s, a, i) {
  const l = Math.abs(e) - n + a, c = Math.abs(t) - s + a, o = Math.max(l, 0), d = Math.max(c, 0), g = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, c), 0) + g - a;
}
function _o(e, t, n) {
  const s = e / 2, a = t / 2, i = Qe(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), c = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (_, v) => go(_ - s, v - a, s, a, l, i), g = 256, m = new Float32Array(g + 1);
  for (let _ = 0; _ <= g; _++) {
    const v = 1 - _ / g, w = Math.asin(Qe(v * v, 0, 1)), y = Math.asin(Qe(Math.sin(w) / o, 0, 1));
    m[_] = Math.tan(w - y) * c;
  }
  return (_, v) => {
    const w = -d(_, v);
    if (w < 0 || w >= c) return null;
    const y = m[Math.round(w / c * g)];
    if (y === 0) return null;
    const f = 0.75, h = d(_ + f, v) - d(_ - f, v), x = d(_, v + f) - d(_, v - f), T = Math.hypot(h, x);
    if (T === 0) return null;
    const L = -y / T;
    return { dx: h * L, dy: x * L };
  };
}
function bo(e, t, n) {
  const s = document.createElement("canvas");
  s.width = e, s.height = t;
  const a = s.getContext("2d"), i = a.createImageData(e, t), l = i.data, c = e * t, o = new Float32Array(c), d = new Float32Array(c);
  let g = 0;
  for (let _ = 0; _ < t; _++)
    for (let v = 0; v < e; v++) {
      const w = n(v + 0.5, _ + 0.5);
      if (!w) continue;
      const y = _ * e + v;
      o[y] = w.dx, d[y] = w.dy;
      const f = Math.hypot(w.dx, w.dy);
      f > g && (g = f);
    }
  const m = g > 0 ? 127 / g : 0;
  for (let _ = 0; _ < c; _++) {
    const v = _ * 4;
    l[v] = 128 + Qe(Math.round(o[_] * m), -127, 127), l[v + 1] = 128 + Qe(Math.round(d[_] * m), -127, 127), l[v + 2] = 128, l[v + 3] = 255;
  }
  return a.putImageData(i, 0, 0), { url: s.toDataURL(), scale: g * 2 };
}
const ss = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function as(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${He(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let hr = null, mo = 0;
function wo() {
  if (hr) return hr;
  const e = document.createElementNS(_s, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), hr = document.createElementNS(_s, "defs"), e.appendChild(hr), document.body.appendChild(e), hr;
}
function En(e) {
  const t = `glass-refract-${++mo}`, n = document.createElementNS(_s, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), wo().appendChild(n);
  let s = 0, a = 0, i = 0, l = 0;
  const c = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, d = "";
  function g() {
    e.style.setProperty("--glass-pre", Bt.blurEdge ? "" : d), e.style.setProperty("--glass-post", Bt.blurEdge ? d : "");
  }
  function m() {
    const h = getComputedStyle(e).getPropertyValue("--glass-radius").trim();
    return h.endsWith("px") ? { ...Bt, shapeRadius: Number.parseFloat(h) } : Bt;
  }
  function _() {
    s < 2 || a < 2 || e.style.setProperty("--glass-glare", po(s, a, m()));
  }
  function v() {
    if (s < 2 || a < 2) return;
    const h = m(), x = bo(s, a, _o(s, a, h)), T = h.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(s)), n.setAttribute("height", String(a)), n.innerHTML = `<feImage x="0" y="0" width="${s}" height="${a}" preserveAspectRatio="none" href="${x.url}" result="map"/>` + as(x.scale * (1 + T), ss[0], "r") + as(x.scale, ss[1], "g") + as(x.scale * (1 - T), ss[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", g()), o = c.map((L) => Bt[L]).join(" ");
  }
  function w() {
    l || (l = requestAnimationFrame(() => {
      l = 0, v();
    }));
  }
  const y = new ResizeObserver(([h]) => {
    const x = h.borderBoxSize?.[0], T = x ? { w: Math.round(x.inlineSize), h: Math.round(x.blockSize) } : { w: Math.round(h.contentRect.width), h: Math.round(h.contentRect.height) };
    T.w === s && T.h === a || (s = T.w, a = T.h, _(), w());
  });
  y.observe(e);
  const f = uo(() => {
    _(), c.map((h) => Bt[h]).join(" ") !== o ? w() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), f(), y.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const Qa = "photos.stack", ea = { on: !1, strictness: null, linkage: null };
function yo() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(Qa) ?? "");
  } catch {
    return { ...ea };
  }
  return e === null || typeof e != "object" ? { ...ea } : {
    on: e.on === !0,
    strictness: Number.isInteger(e.strictness) && e.strictness >= 0 ? e.strictness : null,
    linkage: typeof e.linkage == "string" && e.linkage ? e.linkage : null
  };
}
function ta(e) {
  return localStorage.setItem(
    Qa,
    JSON.stringify({ on: e.on, strictness: e.strictness, linkage: e.linkage })
  ), e;
}
function ei(e, t) {
  return e.some(
    (n) => n.strictness === t.strictness && n.linkage === t.linkage
  );
}
function xo(e, t) {
  return e.strictness === null && e.linkage === null || ei(t, e) ? e : { ...e, strictness: null, linkage: null };
}
function na(e, t, n) {
  const s = { ...t, ...n };
  if (ei(e, s)) return s;
  const a = "strictness" in n ? "strictness" : "linkage", i = e.find((l) => l[a] === s[a]);
  return { strictness: i.strictness, linkage: i.linkage };
}
const ti = "photos.theme", ni = "dark";
function ri() {
  return document.documentElement.dataset.theme === "light" ? "light" : ni;
}
function ko() {
  const e = localStorage.getItem(ti), t = e === "dark" || e === "light" ? e : ni;
  return document.documentElement.dataset.theme = t, t;
}
function si(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(ti, e), e;
}
var So = /* @__PURE__ */ z('<div class="glass selected svelte-zne36e"><span class="nums svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span></span> <button class="menu small svelte-zne36e" title="Copy the conditions and the selected ids to the clipboard">Share</button> <button class="menu small svelte-zne36e">Clear</button></div>'), Eo = /* @__PURE__ */ z('<span class="spin svelte-zne36e" aria-label="loading"></span>'), ra = /* @__PURE__ */ z('<span class="badge svelte-zne36e"> </span>'), To = /* @__PURE__ */ z('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Mo = /* @__PURE__ */ z('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), Ao = /* @__PURE__ */ z('<button><span class="mark svelte-zne36e" aria-hidden="true"> </span> </button>'), Ro = /* @__PURE__ */ z('<div class="glass sheet sorts svelte-zne36e"></div>'), sa = /* @__PURE__ */ z("<button> </button>"), Po = /* @__PURE__ */ z('<section><h2 class="svelte-zne36e">Strictness <span class="help svelte-zne36e" title="How many distinctive points two frames have to agree on before they are one stack.">?</span></h2> <div class="options svelte-zne36e"></div></section> <section><h2 class="svelte-zne36e">Linkage <span class="help svelte-zne36e" title="How many members of a stack a frame has to agree with, rather than only the frame before it.">?</span></h2> <div class="options svelte-zne36e"></div></section>', 1), Co = /* @__PURE__ */ z(`<p class="note svelte-zne36e">Nothing has been grouped at this setting, so every tile is a stack of its
            own. <code class="svelte-zne36e">python -m photolib.membership</code> is the pass that writes
            one, and the settings it has been run at are what this panel offers.</p>`), zo = /* @__PURE__ */ z('<section class="warn svelte-zne36e"><p class="note svelte-zne36e">Regrouping empties what you have selected — <strong> </strong> </p> <div class="options svelte-zne36e"><button class="option svelte-zne36e">Regroup anyway</button> <button class="option on svelte-zne36e">Keep the selection</button></div></section>'), No = /* @__PURE__ */ z(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">The same photograph taken more than once is drawn as one tile — a
            bracket or a burst, checked frame against frame rather than guessed
            from the clock. Narrowing the filters takes frames out of a stack and
            never breaks one in two.</p></section> <!> <!> <!></div>`), Oo = /* @__PURE__ */ z('<p class="muted svelte-zne36e">loading…</p>'), Io = /* @__PURE__ */ z('<span class="help svelte-zne36e">?</span>'), Lo = /* @__PURE__ */ z('<span class="n svelte-zne36e"> </span>'), Fo = /* @__PURE__ */ z("<button> <!></button>"), Do = /* @__PURE__ */ z('<span class="muted svelte-zne36e">nothing here</span>'), jo = /* @__PURE__ */ z('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Ho = /* @__PURE__ */ z('<div class="glass sheet filters svelte-zne36e"><!></div>'), Bo = /* @__PURE__ */ z('<div class="topbar svelte-zne36e"><div class="panes svelte-zne36e"><!> <div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <button role="switch" title="Select tiles by clicking them, then copy their ids">Select</button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function qo(e, t) {
  Mt(t, !0);
  let n = ae(t, "facets", 3, null), s = ae(t, "filters", 19, () => ({})), a = ae(t, "sort", 3, "newest"), i = ae(t, "stacking", 19, () => ({ on: !1, strictness: null, linkage: null })), l = ae(t, "total", 3, null), c = ae(t, "tiles", 3, null), o = ae(t, "loading", 3, !1), d = ae(t, "selecting", 3, !1), g = ae(t, "selectedTally", 19, () => ({ stacks: 0, photos: 0 })), m = ae(t, "onfilter", 3, () => {
  }), _ = ae(t, "onsort", 3, () => {
  }), v = ae(t, "onstack", 3, () => {
  }), w = ae(t, "onclear", 3, () => {
  }), y = ae(t, "onselecting", 3, () => {
  }), f = ae(t, "onshare", 3, () => {
  }), h = ae(t, "ondeselect", 3, () => {
  }), x = ae(t, "ontriage", 3, () => {
  }), T = /* @__PURE__ */ V(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), L = /* @__PURE__ */ V(De(ri())), Y = /* @__PURE__ */ V(null);
  const $ = /* @__PURE__ */ ie(() => c() ?? l()), ee = /* @__PURE__ */ ie(() => n()?.dimensions ?? []), Q = /* @__PURE__ */ ie(() => n()?.sorts ?? []), q = /* @__PURE__ */ ie(() => r(Q).find((F) => F.value === a())?.label ?? a()), D = /* @__PURE__ */ ie(() => Object.values(s()).reduce((F, ce) => F + ce.length, 0)), J = /* @__PURE__ */ ie(() => r(ee).flatMap((F) => (s()[F.name] ?? []).map((ce) => ({
    dimension: F.name,
    value: ce,
    title: F.title,
    label: F.options.find((Se) => Se.value === ce)?.label ?? String(ce)
  }))));
  function N(F, ce) {
    const Se = s()[F] ?? [], Ce = Se.includes(ce) ? Se.filter((Ie) => Ie !== ce) : [...Se, ce];
    m()(F, Ce);
  }
  function re(F, ce) {
    return (s()[F] ?? []).includes(ce);
  }
  function de() {
    S(L, si(r(L) === "dark" ? "light" : "dark"), !0);
  }
  const j = /* @__PURE__ */ ie(() => n()?.stacking?.settings ?? []), te = /* @__PURE__ */ ie(() => ({
    strictness: i().strictness ?? n()?.stacking?.default?.strictness,
    linkage: i().linkage ?? n()?.stacking?.default?.linkage
  })), ue = /* @__PURE__ */ ie(() => [...new Set(r(j).map((F) => F.strictness))].sort((F, ce) => F - ce)), me = /* @__PURE__ */ ie(() => r(j).filter((F) => F.strictness === r(te).strictness)), P = /* @__PURE__ */ ie(() => r(j).some((F) => F.strictness === r(te).strictness && F.linkage === r(te).linkage));
  let O = /* @__PURE__ */ V(null);
  function I(F) {
    F.on === i().on && (F.strictness ?? r(te).strictness) === r(te).strictness && (F.linkage ?? r(te).linkage) === r(te).linkage || (g().stacks > 0 ? S(O, F, !0) : v()(F));
  }
  function G() {
    const F = r(O);
    S(O, null), v()(F);
  }
  mt(() => {
    r(T) !== "stacks" && S(O, null);
  });
  function R(F) {
    F.key === "Escape" && S(T, "");
  }
  function U(F) {
    r(T) && !F.target.closest(".topbar") && S(T, "");
  }
  cr(() => {
    const F = new ResizeObserver(([ce]) => {
      const Se = Math.round(ce.borderBoxSize?.[0]?.blockSize ?? ce.contentRect.height);
      document.documentElement.style.setProperty("--header-h", Se + "px");
    });
    return F.observe(r(Y)), () => {
      F.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var Z = Bo();
  Ln("keydown", Rn, R), Ln("pointerdown", Rn, U);
  var Te = u(Z), Ae = u(Te);
  {
    var we = (F) => {
      var ce = So(), Se = u(ce), Ce = u(Se), Ie = u(Ce), Re = p(Ce, 2), Ge = u(Re), pt = p(Re, 2), xt = u(pt), tt = p(pt, 2), nn = u(tt), rn = p(Se, 2), gn = p(rn, 2);
      Sn(ce, (je) => En?.(je)), B(
        (je, kt) => {
          M(Ie, je), M(Ge, g().stacks === 1 ? "stack" : "stacks"), M(xt, kt), M(nn, g().photos === 1 ? "photo" : "photos");
        },
        [
          () => Pe(g().stacks),
          () => Pe(g().photos)
        ]
      ), se("click", rn, () => f()()), se("click", gn, () => h()()), A(F, ce);
    };
    ne(Ae, (F) => {
      g().stacks && F(we);
    });
  }
  var Me = p(Ae, 2), ze = u(Me), _e = u(ze), xe = p(ze, 2), Ne = u(xe), H = p(xe, 2);
  {
    var ve = (F) => {
      var ce = Eo();
      A(F, ce);
    };
    ne(H, (F) => {
      o() && F(ve);
    });
  }
  Sn(Me, (F) => En?.(F));
  var X = p(Te, 2), b = u(X), E = u(b), C = u(E);
  let K;
  var fe = u(C), oe = p(C, 2);
  let le;
  var ke = p(u(oe));
  {
    var We = (F) => {
      var ce = ra(), Se = u(ce);
      B(() => M(Se, r(D))), A(F, ce);
    };
    ne(ke, (F) => {
      r(D) && F(We);
    });
  }
  var Oe = p(oe, 2);
  let qe;
  var ht = p(u(Oe));
  {
    var Ze = (F) => {
      var ce = ra(), Se = u(ce);
      B((Ce) => M(Se, Ce), [() => Pe(l())]), A(F, ce);
    };
    ne(ht, (F) => {
      i().on && l() !== null && F(Ze);
    });
  }
  var rt = p(Oe, 2);
  let tn;
  var It = p(rt, 2);
  {
    var $t = (F) => {
      var ce = Mo(), Se = u(ce);
      Ve(Se, 17, () => r(J), (Ie) => Ie.dimension + " " + Ie.value, (Ie, Re) => {
        var Ge = To(), pt = u(Ge), xt = u(pt), tt = p(pt, 1, !0);
        B(() => {
          pe(Ge, "title", `${r(Re).title ?? ""}: ${r(Re).label ?? ""} — click to remove`), M(xt, r(Re).title), M(tt, r(Re).label);
        }), se("click", Ge, () => N(r(Re).dimension, r(Re).value)), A(Ie, Ge);
      });
      var Ce = p(Se, 2);
      se("click", Ce, () => w()()), A(F, ce);
    };
    ne(It, (F) => {
      r(J).length && F($t);
    });
  }
  var lt = p(E, 2), ot = u(lt), Lt = p(lt, 2);
  Sn(b, (F) => En?.(F));
  var Ft = p(b, 2);
  {
    var vt = (F) => {
      var ce = Ro();
      Ve(ce, 21, () => r(Q), wt, (Se, Ce) => {
        var Ie = Ao();
        let Re;
        var Ge = u(Ie), pt = u(Ge), xt = p(Ge);
        B(() => {
          Re = Ee(Ie, 1, "option svelte-zne36e", null, Re, { on: r(Ce).value === a() }), M(pt, r(Ce).value === a() ? "✓" : ""), M(xt, ` ${r(Ce).label ?? ""}`);
        }), se("click", Ie, () => {
          _()(r(Ce).value), S(T, "");
        }), A(Se, Ie);
      }), Sn(ce, (Se) => En?.(Se)), A(F, ce);
    };
    ne(Ft, (F) => {
      r(T) === "sort" && F(vt);
    });
  }
  var st = p(Ft, 2);
  {
    var Vt = (F) => {
      var ce = No(), Se = u(ce), Ce = p(u(Se), 2), Ie = u(Ce);
      let Re;
      var Ge = u(Ie), pt = p(Se, 2);
      {
        var xt = (je) => {
          var kt = Po(), sn = dt(kt), an = p(u(sn), 2);
          Ve(an, 21, () => r(ue), wt, (nt, Le) => {
            var k = sa();
            let W;
            var he = u(k);
            B(() => {
              W = Ee(k, 1, "option svelte-zne36e", null, W, { on: r(Le) === r(te).strictness }), M(he, r(Le));
            }), se("click", k, () => I({
              ...i(),
              ...na(r(j), r(te), { strictness: r(Le) })
            })), A(nt, k);
          });
          var _n = p(sn, 2), Cn = p(u(_n), 2);
          Ve(Cn, 21, () => r(me), wt, (nt, Le) => {
            var k = sa();
            let W;
            var he = u(k);
            B(() => {
              W = Ee(k, 1, "option svelte-zne36e", null, W, { on: r(Le).linkage === r(te).linkage }), M(he, r(Le).label);
            }), se("click", k, () => I({
              ...i(),
              ...na(r(j), r(te), { linkage: r(Le).linkage })
            })), A(nt, k);
          }), A(je, kt);
        };
        ne(pt, (je) => {
          i().on && r(ue).length && je(xt);
        });
      }
      var tt = p(pt, 2);
      {
        var nn = (je) => {
          var kt = Co();
          A(je, kt);
        };
        ne(tt, (je) => {
          n() && !r(P) && je(nn);
        });
      }
      var rn = p(tt, 2);
      {
        var gn = (je) => {
          var kt = zo(), sn = u(kt), an = p(u(sn)), _n = u(an), Cn = p(an), nt = p(sn, 2), Le = u(nt), k = p(Le, 2);
          B(
            (W, he) => {
              M(_n, W), M(Cn, ` ${g().stacks === 1 ? "stack" : "stacks"}, ${he ?? ""}
              ${g().photos === 1 ? "photograph" : "photographs"}. The stacks
              it names will not exist afterwards.`);
            },
            [
              () => Pe(g().stacks),
              () => Pe(g().photos)
            ]
          ), se("click", Le, G), se("click", k, () => S(O, null)), A(je, kt);
        };
        ne(rn, (je) => {
          r(O) && je(gn);
        });
      }
      Sn(ce, (je) => En?.(je)), B(() => {
        Re = Ee(Ie, 1, "option svelte-zne36e", null, Re, { on: i().on }), pe(Ie, "aria-checked", i().on), M(Ge, i().on ? "On" : "Off");
      }), se("click", Ie, () => I({ ...i(), on: !i().on })), A(F, ce);
    };
    ne(st, (F) => {
      r(T) === "stacks" && F(Vt);
    });
  }
  var Dt = p(st, 2);
  {
    var ur = (F) => {
      var ce = Ho(), Se = u(ce);
      {
        var Ce = (Re) => {
          var Ge = Oo();
          A(Re, Ge);
        }, Ie = (Re) => {
          var Ge = Ps(), pt = dt(Ge);
          Ve(pt, 17, () => r(ee), wt, (xt, tt) => {
            var nn = jo(), rn = u(nn), gn = u(rn), je = p(gn);
            {
              var kt = (nt) => {
                var Le = Io();
                B(() => pe(Le, "title", r(tt).hint)), A(nt, Le);
              };
              ne(je, (nt) => {
                r(tt).hint && nt(kt);
              });
            }
            var sn = p(rn, 2), an = u(sn);
            Ve(an, 17, () => r(tt).options, wt, (nt, Le) => {
              var k = Fo();
              let W;
              var he = u(k), Ue = p(he);
              {
                var Ye = (ct) => {
                  var ln = Lo(), bn = u(ln);
                  B((St) => M(bn, St), [() => Pe(r(Le).count)]), A(ct, ln);
                };
                ne(Ue, (ct) => {
                  r(Le).count !== null && ct(Ye);
                });
              }
              B(
                (ct) => {
                  W = Ee(k, 1, "option svelte-zne36e", null, W, ct), M(he, `${r(Le).label ?? ""} `);
                },
                [
                  () => ({ on: re(r(tt).name, r(Le).value) })
                ]
              ), se("click", k, () => N(r(tt).name, r(Le).value)), A(nt, k);
            });
            var _n = p(an, 2);
            {
              var Cn = (nt) => {
                var Le = Do();
                A(nt, Le);
              };
              ne(_n, (nt) => {
                r(tt).options.length || nt(Cn);
              });
            }
            B(() => M(gn, `${r(tt).title ?? ""} `)), A(xt, nn);
          }), A(Re, Ge);
        };
        ne(Se, (Re) => {
          n() ? Re(Ie, -1) : Re(Ce);
        });
      }
      Sn(ce, (Re) => En?.(Re)), A(F, ce);
    };
    ne(Dt, (F) => {
      r(T) === "filters" && F(ur);
    });
  }
  kr(Z, (F) => S(Y, F), () => r(Y)), B(
    (F) => {
      M(_e, F), M(Ne, r($) === 1 ? "photo" : "photos"), K = Ee(C, 1, "menu svelte-zne36e", null, K, { open: r(T) === "sort" }), pe(C, "aria-expanded", r(T) === "sort"), M(fe, r(q)), le = Ee(oe, 1, "menu svelte-zne36e", null, le, { open: r(T) === "filters", on: r(D) > 0 }), pe(oe, "aria-expanded", r(T) === "filters"), qe = Ee(Oe, 1, "menu svelte-zne36e", null, qe, { open: r(T) === "stacks", on: i().on }), pe(Oe, "aria-expanded", r(T) === "stacks"), tn = Ee(rt, 1, "menu svelte-zne36e", null, tn, { on: d() }), pe(rt, "aria-checked", d()), pe(lt, "title", r(L) === "dark" ? "Switch to a white background" : "Switch to a black background"), pe(lt, "aria-label", r(L) === "dark" ? "Switch to a white background" : "Switch to a black background"), M(ot, r(L) === "dark" ? "☀" : "☾");
    },
    [() => r($) === null ? "…" : Pe(r($))]
  ), se("click", C, () => S(T, r(T) === "sort" ? "" : "sort", !0)), se("click", oe, () => S(T, r(T) === "filters" ? "" : "filters", !0)), se("click", Oe, () => S(T, r(T) === "stacks" ? "" : "stacks", !0)), se("click", rt, () => y()(!d())), se("click", lt, de), se("click", Lt, () => x()()), A(e, Z), At();
}
Kt(["click"]);
const Xt = 4, Yr = 220, Uo = 340, Tn = 12, aa = Xt + Tn, ai = 6, Yo = 5, Wo = 0.025, Go = 9;
function Wr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Ko(e, t, n, s, a) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, c = 0, o = 1 / 0;
    for (; l < e.length && (c += Wr(e[l]), l++, o = (n - Xt * (l - i - 1)) / c, !(o <= Yr)); )
      ;
    if (o > Yr && !s) break;
    a(i, l, Math.round(Math.min(o, Uo))), i = l;
  }
  return i;
}
function ii(e, t, n) {
  const s = [];
  let a = 0;
  for (let i = e.from; i < e.to; i++) {
    const c = i === e.to - 1 ? n - a : Math.round(Wr(t[i]) * e.height);
    s.push({ index: i, x: a, w: c }), a += c + Xt;
  }
  return s;
}
function $o(e, t) {
  const n = Math.min((e | 0) - 1, ai);
  if (n < 1) return [];
  const s = Math.min(Yo, t * Wo), a = [];
  for (let i = 1; i <= n; i++)
    a.push({
      top: Math.round(Tn * (n - i) / n),
      inset: Math.round(i * s),
      // Integer percent, so the value lands on the decimal it reads as rather
      // than on whatever a chain of float multiplies leaves behind.
      opacity: (100 - (i - 1) * Go) / 100
    });
  return a;
}
function ia(e, t, n, s) {
  const a = ms(e, s.top, s.bottom);
  if (!a) return [];
  const i = [];
  for (let l = a[0]; l <= a[1]; l++) {
    const c = e[l];
    if (!(c.top > s.bottom || c.top + c.height < s.top))
      for (const o of ii(c, t, n))
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
var Vo = /* @__PURE__ */ z('<img class="thumb svelte-5g1i2z" alt=""/>'), Xo = /* @__PURE__ */ z('<button type="button" title="Reveal this frame in Explorer"><!> <img alt="" decoding="async"/></button>'), Jo = /* @__PURE__ */ z('<div role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Previous tile" aria-label="Previous tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M14.5 5 7.5 12l7 7"></path></svg></button></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Next tile" aria-label="Next tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M9.5 5l7 7-7 7"></path></svg></button></div></div>');
function Zo(e, t) {
  Mt(t, !0);
  let n = ae(t, "frames", 19, () => []), s = ae(t, "cover", 3, null), a = ae(t, "origin", 3, null), i = ae(t, "back", 3, !1), l = ae(t, "forward", 3, !1), c = ae(t, "onstep", 3, () => {
  }), o = ae(t, "onreveal", 3, () => {
  }), d = ae(t, "onclose", 3, () => {
  });
  const g = 40, m = 72, _ = /* @__PURE__ */ ie(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`), v = /* @__PURE__ */ ie(() => n().findIndex((H) => H.id === s()));
  let w = /* @__PURE__ */ V(De(document.documentElement.clientWidth)), y = /* @__PURE__ */ V(De(document.documentElement.clientHeight)), f = /* @__PURE__ */ V(null), h = /* @__PURE__ */ V(De(/* @__PURE__ */ new Set()));
  const x = 4, T = 25, L = { x: 0, y: 0, w: 0, h: 0 }, Y = /* @__PURE__ */ ie(() => Math.max(0, r(w) - m * 2)), $ = /* @__PURE__ */ ie(() => Math.max(0, r(y) - g * 2)), ee = /* @__PURE__ */ ie(() => r(Y) > 0 && r($) > 0 ? J(n(), r(Y), r($)) : n().map(() => L));
  function Q(H, ve, X) {
    const b = [];
    let E = 0, C = 0;
    for (let K = 0; K < H.length; K++)
      C += Wr(H[K]), C * X + Xt * (K - E) >= ve && (b.push({ from: E, to: K + 1, sum: C }), E = K + 1, C = 0);
    return E < H.length && b.push({ from: E, to: H.length, sum: C }), b;
  }
  function q(H, ve, X) {
    return H.map((b, E) => {
      const C = (ve - Xt * (b.to - b.from - 1)) / b.sum;
      return E === H.length - 1 && C > X ? X : C;
    });
  }
  function D(H, ve, X) {
    return q(H, ve, X).reduce((b, E) => b + E, 0) + Xt * (H.length - 1);
  }
  function J(H, ve, X) {
    let b = x, E = Math.max(x, X);
    for (let le = 0; le < T; le++) {
      const ke = (b + E) / 2;
      D(Q(H, ve, ke), ve, ke) <= X ? b = ke : E = ke;
    }
    const C = Q(H, ve, b), K = q(C, ve, b), fe = [];
    let oe = (X - (K.reduce((le, ke) => le + ke, 0) + Xt * (C.length - 1))) / 2;
    return C.forEach((le, ke) => {
      const We = K[ke], Oe = [];
      for (let Ze = le.from; Ze < le.to; Ze++) Oe.push(Wr(H[Ze]) * We);
      const qe = Oe.reduce((Ze, rt) => Ze + rt, 0) + Xt * (Oe.length - 1);
      let ht = (ve - qe) / 2;
      for (const Ze of Oe)
        fe.push({
          x: Math.round(ht),
          y: Math.round(oe),
          w: Math.round(Ze),
          h: Math.round(We)
        }), ht += Ze + Xt;
      oe += We + Xt;
    }), fe;
  }
  function N(H) {
    if (!a() || !H || !H.w || !H.h) return "none";
    const ve = a().left - (m + H.x), X = a().top - r(de) - (g + H.y);
    return `translate(${ve}px, ${X}px) scale(${a().width / H.w}, ${a().height / H.h})`;
  }
  let re = window.scrollY, de = /* @__PURE__ */ V(0);
  mt(() => {
    a(), re = window.scrollY;
  });
  const j = 1600;
  let te = /* @__PURE__ */ V(!1), ue = 0;
  function me() {
    S(te, !1), clearTimeout(ue), ue = setTimeout(() => S(te, !0), j);
  }
  const P = 220;
  let O = /* @__PURE__ */ V(!1), I = 0;
  function G() {
    r(O) || (S(de, window.scrollY - re), S(O, !0), I = setTimeout(d(), P));
  }
  function R(H, ve = !1) {
    r(O) || c()(H, ve);
  }
  function U(H) {
    if (H.key === "Escape") {
      G();
      return;
    }
    H.key !== "ArrowLeft" && H.key !== "ArrowRight" || (H.preventDefault(), R(H.key === "ArrowLeft" ? -1 : 1, H.repeat));
  }
  function Z(H) {
    H.target.closest(".frame, .lane") || G();
  }
  function Te(H) {
    r(O) || (o()(H), G());
  }
  cr(() => (r(f)?.focus(), me(), () => {
    clearTimeout(ue), clearTimeout(I);
  }));
  var Ae = Jo();
  Ln("keydown", Rn, U), Ln("pointerdown", Rn, Z), Ln("pointermove", Rn, me);
  let we;
  Jt(Ae, "", {}, { "--leave": "220ms" });
  var Me = u(Ae);
  Jt(Me, "", {}, { inset: "40px 72px" }), Ve(Me, 23, n, (H) => H.id, (H, ve, X) => {
    var b = Xo();
    let E, C;
    var K = u(b);
    {
      var fe = (ke) => {
        var We = Vo();
        B(() => pe(We, "src", `/t/${r(ve).s ?? ""}.webp`)), A(ke, We);
      };
      ne(K, (ke) => {
        r(X) === r(v) && ke(fe);
      });
    }
    var oe = p(K, 2);
    let le;
    B(
      (ke, We) => {
        E = Ee(b, 1, "frame svelte-5g1i2z", null, E, { cover: r(X) === r(v) }), C = Jt(b, "", C, ke), pe(oe, "src", `/d/${r(ve).s ?? ""}.webp`), le = Ee(oe, 1, "svelte-5g1i2z", null, le, We);
      },
      [
        () => ({
          left: `${r(ee)[r(X)].x ?? ""}px`,
          top: `${r(ee)[r(X)].y ?? ""}px`,
          width: `${r(ee)[r(X)].w ?? ""}px`,
          height: `${r(ee)[r(X)].h ?? ""}px`,
          "--flight": r(X) === r(v) ? N(r(ee)[r(X)]) : null
        }),
        () => ({ loaded: r(h).has(r(ve).id) })
      ]
    ), se("click", b, () => Te(r(ve))), Ln("load", oe, () => S(h, new Set(r(h)).add(r(ve).id), !0)), A(H, b);
  });
  var ze = p(Me, 2);
  Jt(ze, "", {}, { width: "44px", left: "14px" });
  var _e = u(ze);
  Sn(_e, (H) => En?.(H));
  var xe = p(ze, 2);
  Jt(xe, "", {}, { width: "44px", right: "14px" });
  var Ne = u(xe);
  Sn(Ne, (H) => En?.(H)), kr(Ae, (H) => S(f, H), () => r(f)), B(() => {
    we = Ee(Ae, 1, "glass pane svelte-5g1i2z", null, we, { resting: r(te), leaving: r(O) }), pe(Ae, "aria-label", r(_)), _e.disabled = !i(), Ne.disabled = !l();
  }), se("click", _e, () => R(-1)), se("click", Ne, () => R(1)), $s(Ae, "clientWidth", (H) => S(w, H)), $s(Ae, "clientHeight", (H) => S(y, H)), A(e, Ae), At();
}
Kt(["click"]);
var Qo = /* @__PURE__ */ z('<span class="err svelte-uzy12d"> </span>'), ec = /* @__PURE__ */ z(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), tc = /* @__PURE__ */ z(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), nc = /* @__PURE__ */ z('<span class="muted svelte-uzy12d"> </span>'), rc = /* @__PURE__ */ z('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function sc(e, t) {
  Mt(t, !0);
  let n = /* @__PURE__ */ V(null), s = /* @__PURE__ */ V(!1), a = /* @__PURE__ */ V(null);
  async function i() {
    S(s, !0), S(a, null);
    try {
      S(n, await Ke.probe(), !0);
    } catch (v) {
      S(a, String(v), !0);
    } finally {
      S(s, !1);
    }
  }
  var l = rc(), c = u(l), o = u(c), d = p(c, 2);
  {
    var g = (v) => {
      var w = Qo(), y = u(w);
      B(() => M(y, r(a))), A(v, w);
    }, m = (v) => {
      var w = Ps(), y = dt(w);
      {
        var f = (x) => {
          var T = ec(), L = p(u(T), 2);
          B(
            (Y) => M(L, ` above are formats the header
        reader cannot measure (${Y ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), A(x, T);
        }, h = (x) => {
          var T = tc(), L = u(T), Y = u(L), $ = p(L, 2), ee = u($);
          B(
            (Q) => {
              M(Y, Q), M(ee, r(n).command);
            },
            [() => Pe(r(n).worklist)]
          ), A(x, T);
        };
        ne(y, (x) => {
          r(n).worklist === 0 ? x(f) : x(h, -1);
        });
      }
      A(v, w);
    }, _ = (v) => {
      var w = nc(), y = u(w);
      B(() => M(y, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), A(v, w);
    };
    ne(d, (v) => {
      r(a) ? v(g) : r(n) ? v(m, 1) : v(_, -1);
    });
  }
  B(() => {
    c.disabled = r(s), M(o, r(s) ? "counting…" : "Check the dimension probe's worklist");
  }), se("click", c, i), A(e, l), At();
}
Kt(["click"]);
var ac = /* @__PURE__ */ z('<p class="bad svelte-1xjbga"> </p>'), ic = /* @__PURE__ */ z('<pre class="svelte-1xjbga"> </pre>'), lc = /* @__PURE__ */ z('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), oc = /* @__PURE__ */ z(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), cc = /* @__PURE__ */ z('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), uc = /* @__PURE__ */ z('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), dc = /* @__PURE__ */ z(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), fc = /* @__PURE__ */ z('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), hc = /* @__PURE__ */ z(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function vc(e, t) {
  Mt(t, !0);
  let n = /* @__PURE__ */ V(null), s = /* @__PURE__ */ V(!1), a = /* @__PURE__ */ V(null), i = /* @__PURE__ */ V(null);
  const l = /* @__PURE__ */ ie(() => r(n)?.state === "running"), c = /* @__PURE__ */ ie(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const x = await Ke.rebuildStatus();
      S(n, x, !0), S(a, null), x.state === "done" && x.started_at !== r(i) && (S(i, x.started_at, !0), t.oncomplete?.());
    } catch (x) {
      S(a, String(x), !0);
    }
  }
  cr(() => {
    o();
  }), mt(() => {
    if (!r(l)) return;
    const x = setInterval(o, 700);
    return () => clearInterval(x);
  });
  async function d() {
    S(s, !0), S(a, null);
    try {
      S(n, await Ke.rebuild(), !0);
    } catch (x) {
      S(a, String(x), !0);
    }
  }
  function g(x) {
    x.key === "Escape" && S(s, !1);
  }
  var m = hc();
  Ln("keydown", Rn, g);
  var _ = dt(m), v = u(_), w = u(v), y = p(v, 2), f = p(_, 2);
  {
    var h = (x) => {
      var T = fc(), L = dt(T), Y = p(L, 2), $ = u(Y), ee = p(u($), 4), Q = u(ee), q = p(ee, 2), D = p($, 2);
      {
        var J = (P) => {
          var O = ac(), I = u(O);
          B(() => M(I, r(a))), A(P, O);
        };
        ne(D, (P) => {
          r(a) && P(J);
        });
      }
      var N = p(D, 2);
      Ve(N, 17, () => r(n)?.steps ?? [], wt, (P, O) => {
        var I = lc();
        let G;
        var R = u(I), U = u(R), Z = u(U);
        {
          var Te = (X) => {
            var b = Jn("✓");
            A(X, b);
          }, Ae = (X) => {
            var b = Jn("✕");
            A(X, b);
          }, we = (X) => {
            var b = Jn("·");
            A(X, b);
          }, Me = (X) => {
            var b = Jn(" ");
            A(X, b);
          };
          ne(Z, (X) => {
            r(O).state === "done" ? X(Te) : r(O).state === "failed" ? X(Ae, 1) : r(O).state === "running" ? X(we, 2) : X(Me, -1);
          });
        }
        var ze = p(U, 2), _e = u(ze), xe = p(ze, 4), Ne = u(xe), H = p(R, 2);
        {
          var ve = (X) => {
            var b = ic(), E = u(b);
            B((C) => M(E, C), [() => r(O).log.join(`
`)]), A(X, b);
          };
          ne(H, (X) => {
            r(O).log.length && X(ve);
          });
        }
        B(() => {
          G = Ee(I, 1, "step svelte-1xjbga", null, G, {
            on: r(O).state === "running",
            bad: r(O).state === "failed"
          }), M(_e, r(O).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), M(Ne, r(O).seconds === null ? "" : r(O).seconds + "s");
        }), A(P, I);
      });
      var re = p(N, 2);
      {
        var de = (P) => {
          var O = oc(), I = dt(O), G = u(I);
          B(() => M(G, r(n).error)), A(P, O);
        }, j = (P) => {
          var O = cc();
          A(P, O);
        }, te = (P) => {
          var O = uc();
          A(P, O);
        };
        ne(re, (P) => {
          r(n)?.state === "failed" ? P(de) : r(n)?.state === "done" ? P(j, 1) : r(l) && P(te, 2);
        });
      }
      var ue = p(re, 2);
      {
        var me = (P) => {
          var O = dc(), I = p(u(O), 6), G = u(I);
          B(() => M(G, `python -m photolib.restore_state ${r(c) ?? ""}`)), A(P, O);
        };
        ne(ue, (P) => {
          r(c) && P(me);
        });
      }
      B(() => M(Q, `${r(n)?.seconds ?? 0 ?? ""}s`)), se("click", L, () => S(s, !1)), se("click", q, () => S(s, !1)), A(x, T);
    };
    ne(f, (x) => {
      r(s) && x(h);
    });
  }
  B(() => {
    v.disabled = r(l), M(w, r(l) ? "applying…" : "Apply to grid"), y.disabled = !r(n) || r(n).state === "idle";
  }), se("click", v, d), se("click", y, () => S(s, !0)), A(e, m), At();
}
Kt(["click"]);
var pc = /* @__PURE__ */ z('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), la = /* @__PURE__ */ z("<option> </option>"), gc = /* @__PURE__ */ z('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), _c = /* @__PURE__ */ z('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), bc = /* @__PURE__ */ z('<div class="none muted svelte-bqi9ky"> </div>'), mc = /* @__PURE__ */ z('<div class="bar svelte-bqi9ky"><!></div>');
function wc(e, t) {
  Mt(t, !0);
  let n = ae(t, "candidate", 3, null), s = ae(t, "saving", 3, !1);
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
  function d(y, f) {
    const h = { ...n(), [y]: f };
    if (y === "column") {
      const x = i[f] ?? ["="];
      x.includes(h.op) || (h.op = x[0]), h.value = l.has(f) ? 0 : "";
    }
    y === "op" && f === "is null" && (h.value = null), y === "value" && l.has(h.column) && (h.value = Number(f) || 0), t.onedit(h);
  }
  var g = mc(), m = u(g);
  {
    var _ = (y) => {
      var f = pc(), h = u(f), x = u(h), T = p(h, 2), L = u(T);
      B(() => {
        M(x, `${t.screen.title ?? ""} does not save a rule.`), M(L, t.screen.blurb);
      }), A(y, f);
    }, v = (y) => {
      var f = _c(), h = dt(f), x = u(h);
      Ve(x, 21, () => a, wt, (I, G) => {
        var R = la(), U = u(R), Z = {};
        B(() => {
          M(U, r(G)), Z !== (Z = r(G)) && (R.value = (R.__value = r(G)) ?? "");
        }), A(I, R);
      });
      var T;
      Cr(x);
      var L = p(x, 2);
      Ve(L, 21, () => r(c), wt, (I, G) => {
        var R = la(), U = u(R), Z = {};
        B(() => {
          M(U, r(G)), Z !== (Z = r(G)) && (R.value = (R.__value = r(G)) ?? "");
        }), A(I, R);
      });
      var Y;
      Cr(L);
      var $ = p(L, 2);
      {
        var ee = (I) => {
          var G = gc();
          B(() => Vn(G, n().value ?? "")), se("input", G, (R) => d("value", R.currentTarget.value)), A(I, G);
        };
        ne($, (I) => {
          r(o) && I(ee);
        });
      }
      var Q = p($, 2), q = u(Q);
      q.value = q.__value = "exclude";
      var D = p(q);
      D.value = D.__value = "include";
      var J;
      Cr(Q);
      var N = p(Q, 2), re = u(N);
      re.value = re.__value = "end";
      var de = p(re);
      de.value = de.__value = "0";
      var j;
      Cr(N);
      var te = p(N, 2), ue = u(te), me = p(te, 2), P = p(h, 2), O = u(P);
      B(
        (I, G) => {
          T !== (T = n().column) && (x.value = (x.__value = n().column) ?? "", _r(x, n().column)), Y !== (Y = n().op) && (L.value = (L.__value = n().op) ?? "", _r(L, n().op)), J !== (J = n().decision ?? "exclude") && (Q.value = (Q.__value = n().decision ?? "exclude") ?? "", _r(Q, n().decision ?? "exclude")), j !== (j = I) && (N.value = (N.__value = I) ?? "", _r(N, I)), te.disabled = s(), M(ue, s() ? "saving…" : "Confirm"), M(O, `${G ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Zl(n())
        ]
      ), se("change", x, (I) => d("column", I.currentTarget.value)), se("change", L, (I) => d("op", I.currentTarget.value)), se("change", Q, (I) => d("decision", I.currentTarget.value)), se("change", N, (I) => d("at", I.currentTarget.value)), se("click", te, function(...I) {
        t.onconfirm?.apply(this, I);
      }), se("click", me, function(...I) {
        t.onclear?.apply(this, I);
      }), A(y, f);
    }, w = (y) => {
      var f = bc(), h = u(f);
      B(() => M(h, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), A(y, f);
    };
    ne(m, (y) => {
      t.screen.rule === !1 ? y(_) : n() ? y(v, 1) : y(w, -1);
    });
  }
  A(e, g), At();
}
Kt(["change", "input", "click"]);
var yc = /* @__PURE__ */ z('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), xc = /* @__PURE__ */ z('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), kc = /* @__PURE__ */ z('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Sc = /* @__PURE__ */ z('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Ec(e, t) {
  Mt(t, !0);
  let n = ae(t, "rules", 19, () => []), s = ae(t, "unmatched", 3, null), a = ae(t, "busy", 3, !1);
  var i = Sc(), l = u(i), c = p(u(l)), o = u(c), d = p(l, 2);
  {
    var g = (w) => {
      var y = yc();
      A(w, y);
    };
    ne(d, (w) => {
      n().length === 0 && w(g);
    });
  }
  var m = p(d, 2);
  Ve(m, 19, n, (w) => w.id, (w, y, f) => {
    var h = xc();
    let x;
    var T = u(h), L = u(T), Y = u(L), $ = p(L, 2), ee = u($), Q = p($, 2), q = u(Q), D = p(T, 2), J = u(D), N = u(J), re = p(J, 2), de = u(re), j = p(re, 4), te = p(j, 2), ue = p(te, 2);
    B(
      (me, P) => {
        x = Ee(h, 1, "rule svelte-aof9c2", null, x, { exclude: r(y).decision === "exclude" }), M(Y, r(f)), M(ee, r(y).predicate), M(q, r(y).decision), M(N, `${me ?? ""} paths`), M(de, P), j.disabled = a() || r(f) === 0, te.disabled = a() || r(f) === n().length - 1, ue.disabled = a();
      },
      [
        () => Pe(r(y).paths),
        () => Ht(r(y).bytes)
      ]
    ), se("click", j, () => t.onmove(r(y), r(f) - 1)), se("click", te, () => t.onmove(r(y), r(f) + 1)), se("click", ue, () => t.ondelete(r(y))), A(w, h);
  });
  var _ = p(m, 2);
  {
    var v = (w) => {
      var y = kc(), f = p(u(y), 2), h = u(f), x = u(h), T = p(h, 2), L = u(T);
      B(
        (Y, $) => {
          M(x, `${Y ?? ""} paths`), M(L, $);
        },
        [
          () => Pe(s().paths),
          () => Ht(s().bytes)
        ]
      ), A(w, y);
    };
    ne(_, (w) => {
      s() && w(v);
    });
  }
  B(() => M(o, `${n().length ?? ""} rules · top-down, first match wins`)), A(e, i), At();
}
Kt(["click"]);
function Is(e) {
  return e.k ?? e.s;
}
function zr(e) {
  return { key: Is(e), ids: (e.m ?? [e]).map((t) => t.id) };
}
function Tc(e, t) {
  const n = new Map(t.map((i) => [i.key, i.ids]));
  let s = !1;
  const a = e.map((i) => {
    const l = n.get(i.key);
    return l === void 0 || Mc(i.ids, l) ? i : (s = !0, { key: i.key, ids: l });
  });
  return s ? a : e;
}
function Mc(e, t) {
  return e.length === t.length && e.every((n, s) => n === t[s]);
}
function Ac(e, t) {
  const n = e.filter((s) => s.key !== t.key);
  return n.length === e.length ? [...e, t] : n;
}
function oa(e, t, n) {
  if (!n) {
    const a = new Set(t.map((i) => i.key));
    return e.filter((i) => !a.has(i.key));
  }
  const s = new Set(e.map((a) => a.key));
  return [...e, ...t.filter((a) => !s.has(a.key))];
}
function Rc(e) {
  return {
    stacks: e.length,
    photos: e.reduce((t, n) => t + n.ids.length, 0)
  };
}
function Pc(e) {
  const t = Object.entries(e.filters).filter(([, n]) => n.length > 0).sort(([n], [s]) => n < s ? -1 : n > s ? 1 : 0).map(([n, s]) => n + ":" + s.join("|"));
  return `stack=${li(e.stacking)} sort=${e.sort} filters=${t.length ? t.join(",") : "none"}`;
}
function li(e) {
  return e.on ? "on" + (e.strictness === null && e.linkage === null ? "" : ` strictness=${e.strictness} linkage=${e.linkage}`) : "off";
}
function Cc(e, t) {
  const n = t.map((s) => "[" + s.ids.join(",") + "]").join(",");
  return Pc(e) + `
` + n;
}
const ca = 2500, zc = 1, Nc = 2, ua = 4, Oc = 3e7, zn = /* @__PURE__ */ new WeakMap();
function da(e) {
  return zn.get(e).photo.getBoundingClientRect();
}
function Ic(e, t, n) {
  const s = [], a = [], i = /* @__PURE__ */ new Map(), l = [], c = [];
  let o = 0, d = Tn, g = null, m = null, _ = null, v = !1, w = !1, y = 0, f = 0, h = 0, x = n.onState || (() => {
  });
  function T(b) {
    y <= 0 || (o = Ko(s, o, y, b, (E, C, K) => {
      a.push({ top: d, height: K, from: E, to: C }), d += K + aa;
    }), Y());
  }
  function L() {
    if (m === null || v || y <= 0 || o >= m) return 0;
    const b = a.length ? o / a.length : Math.max(1, y / Yr), E = a.length ? (d - Tn) / a.length : Yr + aa, C = Math.round((m - o) / b * E);
    return Math.max(0, Math.min(C, Oc - d));
  }
  function Y() {
    e.style.height = d + L() + "px", t.style.top = Math.max(0, d - 1) + "px";
  }
  function $() {
    return window.scrollY - e.offsetTop;
  }
  function ee() {
    const b = l.pop();
    if (b) return b;
    const E = document.createElement("div");
    E.className = "tile", E.tabIndex = -1;
    const C = document.createElement("div");
    C.className = "deck", C.style.height = Tn + "px";
    const K = [];
    for (let le = 0; le < ai; le++) {
      const ke = document.createElement("div");
      ke.className = "card", ke.hidden = !0, K.push(ke);
    }
    for (let le = K.length - 1; le >= 0; le--) C.appendChild(K[le]);
    E.appendChild(C);
    const fe = document.createElement("div");
    fe.className = "tile-photo";
    const oe = document.createElement("img");
    return oe.decoding = "async", oe.draggable = !1, oe.addEventListener("load", () => E.classList.add("loaded")), oe.addEventListener("error", () => E.classList.add("missing")), fe.appendChild(oe), E.appendChild(fe), zn.set(E, { img: oe, photo: fe, strip: C, cards: K, above: 0 }), n.extend && n.extend(E), E;
  }
  function Q(b, E) {
    const { img: C, photo: K } = zn.get(E);
    C.removeAttribute("src"), E.classList.remove("loaded", "missing", "error"), K.style.backgroundImage = "", E.remove(), i.delete(b), l.push(E);
  }
  function q(b, E, C) {
    const K = zn.get(b), fe = $o(E.n, C);
    K.above = fe.length ? Tn : 0, K.strip.hidden = fe.length === 0;
    for (let oe = 0; oe < K.cards.length; oe++) {
      const le = fe[oe];
      K.cards[oe].hidden = le === void 0, le !== void 0 && (K.cards[oe].style.top = le.top + "px", K.cards[oe].style.left = le.inset + "px", K.cards[oe].style.right = le.inset + "px", K.cards[oe].style.opacity = String(le.opacity));
    }
  }
  function D(b, E, C, K, fe, oe) {
    let le = i.get(b);
    const ke = s[b];
    if (!le) {
      le = ee(), le.dataset.index = String(b);
      const qe = zn.get(le).img;
      q(le, ke, K), qe.fetchPriority = oe ? "high" : "low", qe.src = "/t/" + ke.s + ".webp", c.push(b), n.fill && n.fill(le, ke), e.appendChild(le), i.set(b, le);
    }
    const { above: We, photo: Oe } = zn.get(le);
    le.style.width = K + "px", le.style.height = fe + We + "px", le.style.transform = "translate(" + E + "px," + (C - We) + "px)", Oe.style.height = fe + "px";
  }
  function J(b, E) {
    E.th && (E.url === void 0 && (E.url = n.thumbHash(E.th)), E.url && (zn.get(b).photo.style.backgroundImage = "url(" + E.url + ")"));
  }
  function N() {
    h = 0;
    for (const b of c) {
      const E = i.get(b);
      E && !E.classList.contains("loaded") && J(E, s[b]);
    }
    c.length = 0;
  }
  function re(b, E) {
    for (const C of ii(b, s, y))
      D(C.index, C.x, b.top, C.w, b.height, E);
  }
  function de() {
    const b = window.innerHeight, E = $(), C = ms(a, E - b * zc, E + b * (1 + Nc));
    if (!C) return;
    const K = a[C[0]].from, fe = a[C[1]].to;
    for (const [oe, le] of Array.from(i))
      (oe < K || oe >= fe) && Q(oe, le);
    for (let oe = C[0]; oe <= C[1]; oe++) {
      const le = a[oe];
      re(le, le.top < E + b && le.top + le.height > E);
    }
    c.length && !h && (h = requestAnimationFrame(N));
  }
  function j() {
    return y <= 0 ? !1 : d - ($() + window.innerHeight) < ca;
  }
  let te = Promise.resolve();
  function ue() {
    return w || v || (w = !0, te = me()), te;
  }
  async function me() {
    const b = f;
    x({ loading: !0, count: s.length, exhausted: v, total: m, tiles: _ });
    try {
      do {
        const E = await n.fetchPage(g);
        if (b !== f) return;
        for (const C of E.photos) s.push(C);
        g = E.next, v = g === null, typeof E.stacks == "number" ? (m = E.stacks, _ = typeof E.total == "number" ? E.total : null) : typeof E.total == "number" && (m = E.total), T(v), de(), x({ loading: !0, count: s.length, exhausted: v, total: m, tiles: _ });
      } while (!v && j());
    } catch (E) {
      b === f && x({ error: String(E) });
    } finally {
      b === f && (w = !1, x({ loading: !1, count: s.length, exhausted: v, total: m, tiles: _ }));
    }
  }
  let P = 0;
  function O() {
    P || (P = requestAnimationFrame(() => {
      P = 0, de(), R && Me(), j() && ue();
    }));
  }
  function I() {
    const b = e.clientWidth;
    if (b === y) return;
    const E = ms(a, $(), $()), C = E ? a[E[0]].from : 0;
    y = b;
    for (const [fe, oe] of Array.from(i)) Q(fe, oe);
    a.length = 0, o = 0, d = Tn, T(v), de();
    const K = a.find((fe) => fe.to > C);
    K && window.scrollTo(0, K.top + e.offsetTop), j() && ue();
  }
  let G = !1, R = null, U = 0, Z = null, Te = !1;
  function Ae(b, E) {
    const C = e.getBoundingClientRect();
    return { x: b - C.left, y: E - C.top };
  }
  function we(b) {
    Z || (Z = document.createElement("div"), Z.className = "marquee", e.appendChild(Z)), Z.hidden = !1, Z.style.width = b.right - b.left + "px", Z.style.height = b.bottom - b.top + "px", Z.style.transform = "translate(" + b.left + "px," + b.top + "px)";
  }
  function Me() {
    if (!R) return;
    const { x: b, y: E } = Ae(R.cx, R.cy);
    if (!R.live) {
      if (Math.abs(b - R.ax) < ua && Math.abs(E - R.ay) < ua) return;
      R.live = !0, n.sweepStart(R.index === null ? null : s[R.index], R.index);
    }
    const C = {
      left: Math.min(R.ax, b),
      right: Math.max(R.ax, b),
      top: Math.min(R.ay, E),
      bottom: Math.max(R.ay, E)
    };
    we(C), n.sweepMove(ia(a, s, y, C).map((K) => s[K]));
  }
  function ze(b) {
    if (Te = !1, !G || b.button !== 0 || b.shiftKey) return;
    const { x: E, y: C } = Ae(b.clientX, b.clientY), K = ia(a, s, y, { left: E, top: C, right: E, bottom: C });
    R = {
      ax: E,
      ay: C,
      cx: b.clientX,
      cy: b.clientY,
      index: K.length ? K[0] : null,
      live: !1
    }, window.addEventListener("pointermove", _e), window.addEventListener("pointerup", xe), window.addEventListener("pointercancel", xe);
  }
  function _e(b) {
    R && (R.cx = b.clientX, R.cy = b.clientY, !U && (U = requestAnimationFrame(() => {
      U = 0, Me();
    })));
  }
  function xe(b) {
    if (!R) return;
    window.removeEventListener("pointermove", _e), window.removeEventListener("pointerup", xe), window.removeEventListener("pointercancel", xe), cancelAnimationFrame(U), U = 0, R.cx = b.clientX, R.cy = b.clientY, Me();
    const E = R.live;
    R = null, Z && (Z.hidden = !0), E && (Te = !0, n.sweepEnd());
  }
  e.addEventListener("pointerdown", ze);
  function Ne(b) {
    if (Te) {
      Te = !1;
      return;
    }
    const E = b.target.closest(".tile");
    if (!E || !e.contains(E)) return;
    const C = Number(E.dataset.index), K = s[C];
    K && n.activate && n.activate(K, b, E, C);
  }
  e.addEventListener("click", Ne), window.addEventListener("scroll", O, { passive: !0 });
  let H = 0;
  const ve = new ResizeObserver(() => {
    clearTimeout(H), H = setTimeout(I, 100);
  });
  ve.observe(e);
  const X = new IntersectionObserver(
    (b) => {
      b.some((E) => E.isIntersecting) && ue();
    },
    { rootMargin: "0px 0px " + ca + "px 0px" }
  );
  return X.observe(t), y = e.clientWidth, ue(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      f++, w = !1;
      for (const [b, E] of Array.from(i)) Q(b, E);
      s.length = 0, a.length = 0, c.length = 0, o = 0, d = Tn, g = null, m = null, _ = null, v = !1, e.style.height = "0px", window.scrollTo(0, 0), ue();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(b) {
      const E = typeof b == "number" ? b : null;
      E !== m && (m = E, Y(), x({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [b, E] of i) n.fill(E, s[b]);
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
    async walkTo(b) {
      for (; b >= o && !v; ) {
        const fe = o;
        if (await ue(), o === fe) break;
      }
      const E = a.find((fe) => fe.to > b);
      if (!E) return null;
      const C = Math.max(0, (window.innerHeight - E.height) / 2);
      window.scrollTo(0, Math.max(0, e.offsetTop + E.top - C)), de();
      const K = i.get(b);
      return K ? { item: s[b], tile: K } : null;
    },
    // Put the keyboard back on a tile. The overlay hands focus back on the way
    // out, and after a walk that is a different tile from the one it opened on.
    focus(b) {
      i.get(b)?.focus();
    },
    // Whether a press on the canvas rubber-bands. Select mode turns on and off
    // under a sheet that outlives the toggle, exactly as the tickboxes do.
    setSweeping(b) {
      G = b;
    },
    // The items between two indices, inclusive, in the order the sheet holds
    // them — which is the order the grid is sorted in. Shift-click's range: the
    // gesture knows two tiles and this is what lies between them.
    itemsBetween(b, E) {
      return s.slice(Math.min(b, E), Math.max(b, E) + 1);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(b) {
      for (const [E, C] of i)
        s[E] === b && n.fill && n.fill(C, b);
    },
    destroy() {
      f++, e.removeEventListener("click", Ne), e.removeEventListener("pointerdown", ze), window.removeEventListener("pointermove", _e), window.removeEventListener("pointerup", xe), window.removeEventListener("pointercancel", xe), window.removeEventListener("scroll", O), ve.disconnect(), X.disconnect(), clearTimeout(H), cancelAnimationFrame(h), cancelAnimationFrame(U), Z?.remove();
    }
  };
}
function Lc(e) {
  try {
    const t = Uint8Array.from(atob(e), (N) => N.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, s = t[3] | t[4] << 8, a = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, c = (n >> 18 & 31) / 31, o = n >> 23, d = (s >> 3 & 63) / 63, g = (s >> 9 & 63) / 63, m = s >> 15, _ = Math.max(3, m ? o ? 5 : 7 : s & 7), v = Math.max(3, m ? s & 7 : o ? 5 : 7);
    let w = o ? 6 : 5, y = 0;
    const f = (N, re, de) => {
      const j = [];
      for (let te = 0; te < re; te++)
        for (let ue = te ? 0 : 1; ue * re < N * (re - te); ue++) {
          const me = t[w + (y >> 1)] >> ((y++ & 1) << 2) & 15;
          j.push((me / 7.5 - 1) * de);
        }
      return j;
    }, h = f(_, v, c), x = f(3, 3, d * 1.25), T = f(3, 3, g * 1.25), L = _ / v, Y = Math.max(1, Math.round(L > 1 ? 32 : 32 * L)), $ = Math.max(1, Math.round(L > 1 ? 32 / L : 32)), ee = document.createElement("canvas");
    ee.width = Y, ee.height = $;
    const Q = ee.getContext("2d"), q = Q.createImageData(Y, $), D = [], J = [];
    for (let N = 0, re = 0; N < $; N++)
      for (let de = 0; de < Y; de++, re += 4) {
        let j = a, te = i, ue = l;
        for (let I = 0; I < _; I++) D[I] = Math.cos(Math.PI / Y * (de + 0.5) * I);
        for (let I = 0; I < v; I++) J[I] = Math.cos(Math.PI / $ * (N + 0.5) * I);
        for (let I = 0, G = 0; I < v; I++)
          for (let R = I ? 0 : 1; R * v < _ * (v - I); R++, G++)
            j += h[G] * D[R] * J[I] * 2;
        for (let I = 0, G = 0; I < 3; I++)
          for (let R = I ? 0 : 1; R < 3 - I; R++, G++) {
            const U = D[R] * J[I] * 2;
            te += x[G] * U, ue += T[G] * U;
          }
        const me = j - 2 / 3 * te, P = (3 * j - me + ue) / 2, O = P - ue;
        q.data[re] = Math.max(0, Math.min(255, Math.round(255 * P))), q.data[re + 1] = Math.max(0, Math.min(255, Math.round(255 * O))), q.data[re + 2] = Math.max(0, Math.min(255, Math.round(255 * me))), q.data[re + 3] = 255;
      }
    return Q.putImageData(q, 0, 0), ee.toDataURL();
  } catch {
    return null;
  }
}
var Fc = /* @__PURE__ */ z('<main id="canvas"><div id="sentinel"></div></main>');
function Dc(e, t) {
  Mt(t, !0);
  let n = ae(t, "key", 3, ""), s = ae(t, "total", 3, null), a = ae(t, "triage", 3, !1), i = ae(t, "excludedDirs", 19, () => []), l = ae(t, "selecting", 3, !1), c = ae(t, "selectedKeys", 19, () => []), o = ae(t, "onActivate", 3, () => {
  }), d = ae(t, "onOverride", 3, async () => null), g = ae(t, "onExcludeFolder", 3, () => {
  }), m = ae(t, "onState", 3, () => {
  }), _ = ae(t, "onSweepStart", 3, () => {
  }), v = ae(t, "onSweepMove", 3, () => {
  }), w = ae(t, "onSweepEnd", 3, () => {
  }), y = /* @__PURE__ */ V(null), f = /* @__PURE__ */ V(null), h = null, x = "";
  const T = /* @__PURE__ */ ie(() => new Set(c())), L = { null: "exclude", exclude: "include", include: "clear" };
  function Y(P) {
    const O = P.toLowerCase().startsWith(ar.toLowerCase()) ? P.slice(ar.length + 1) : P;
    return O.length > 64 ? "…" + O.slice(-64) : O;
  }
  function $(P) {
    const O = document.createElement("div");
    O.className = "tile-path", P.appendChild(O);
    const I = document.createElement("button");
    I.className = "chip", I.type = "button", P.appendChild(I);
    const G = document.createElement("button");
    G.className = "dirchip", G.type = "button", G.textContent = "dir", P.appendChild(G);
  }
  function ee(P, O) {
    const I = P.querySelector(".tile-path");
    I && (I.textContent = O.p ? Y(O.p) : "");
    const G = P.querySelector(".dirchip");
    if (G) {
      const U = Ja(O.p ?? ""), Z = U !== "" && Ns(i(), U);
      G.hidden = U === "", G.disabled = Z, G.dataset.state = Z ? "exclude" : "none", G.title = Z ? `already excluded: ${U}` : `exclude everything under ${U}, subfolders included — one exclude rule at the end of the order`;
    }
    const R = P.querySelector(".chip");
    R && (R.dataset.state = O.o || "none", R.textContent = O.o === "exclude" ? "drop" : O.o === "include" ? "keep" : "·", R.title = O.o === "exclude" ? "overridden: excluded — click to keep" : O.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  function Q(P) {
    const O = document.createElement("span");
    O.className = "tick", P.appendChild(O);
  }
  function q(P, O) {
    P.dataset.selected = r(T).has(Is(O)) ? "on" : "off";
  }
  cr(() => (h = Ic(r(y), r(f), {
    fetchPage: (P) => t.fetchPage(P),
    thumbHash: Lc,
    extend: a() ? $ : Q,
    fill: a() ? ee : q,
    onState: (P) => m()(P),
    sweepStart: (P, O) => _()(P, O),
    sweepMove: (P) => v()(P),
    sweepEnd: () => w()(),
    activate: async (P, O, I, G) => {
      if (O.target.closest(".dirchip")) {
        g()(P);
        return;
      }
      if (!O.target.closest(".chip")) {
        o()(P, I, G, O.shiftKey);
        return;
      }
      const R = L[P.o ?? "null"];
      P.o = await d()(P, R), ee(I, P);
    }
  }), x = n(), h.setSweeping(l()), () => h?.destroy())), mt(() => {
    h?.setSweeping(l());
  }), mt(() => {
    const P = n(), O = s();
    h && (P !== x && (x = P, h.reset()), h.setTotal(O));
  });
  function D(P) {
    return h?.walkTo(P);
  }
  function J(P) {
    h?.focus(P);
  }
  function N(P, O) {
    return h?.itemsBetween(P, O) ?? [];
  }
  let re = "";
  mt(() => {
    const P = i().join(`
`);
    !h || P === re || (re = P, h.refill());
  });
  let de = null;
  mt(() => {
    const P = c();
    !h || P === de || (de = P, h.refill());
  });
  var j = { walkTo: D, focusTile: J, itemsBetween: N }, te = Fc();
  let ue;
  var me = u(te);
  return kr(me, (P) => S(f, P), () => r(f)), kr(te, (P) => S(y, P), () => r(y)), B(() => ue = Ee(te, 1, "", null, ue, { selecting: l() })), A(e, te), At(j);
}
var jc = /* @__PURE__ */ z('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Hc = /* @__PURE__ */ z('<th class="num svelte-1v3p82v"> </th>'), Bc = /* @__PURE__ */ z('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), qc = /* @__PURE__ */ z('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Uc = /* @__PURE__ */ z('<td class="num svelte-1v3p82v"> </td>'), Yc = /* @__PURE__ */ z('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), Wc = /* @__PURE__ */ z('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Gc(e, t) {
  Mt(t, !0);
  let n = ae(t, "rows", 19, () => []), s = ae(t, "rules", 19, () => []), a = ae(t, "root", 3, null), i = ae(t, "picked", 3, null), l = ae(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const c = /* @__PURE__ */ ie(() => t.screen.rule !== !1);
  function o(y) {
    return t.screen.label ? t.screen.label(y) : y.key;
  }
  const d = /* @__PURE__ */ ie(() => new Map(n().map((y) => [
    y.key,
    t.screen.rule === !1 ? null : Za(s(), t.screen.toRule(y, a()))
  ]))), g = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var _ = Ps(), v = dt(_);
  {
    var w = (y) => {
      var f = Wc(), h = u(f), x = u(h), T = u(x);
      {
        var L = (D) => {
          var J = jc();
          A(D, J);
        };
        ne(T, (D) => {
          r(c) && D(L);
        });
      }
      var Y = p(T), $ = u(Y), ee = p(Y, 3);
      {
        var Q = (D) => {
          var J = Hc(), N = u(J);
          B(() => M(N, t.screen.heading[1])), A(D, J);
        };
        ne(ee, (D) => {
          t.screen.heading[1] && D(Q);
        });
      }
      var q = p(h);
      Ve(q, 23, n, (D) => D.key, (D, J, N) => {
        const re = /* @__PURE__ */ ie(() => r(d).get(r(J).key));
        var de = Yc();
        let j;
        var te = u(de);
        {
          var ue = (_e) => {
            const xe = /* @__PURE__ */ ie(() => l().has(r(J).key));
            var Ne = Bc(), H = u(Ne);
            let ve;
            var X = u(H);
            B(
              (b) => {
                ve = Ee(H, 1, "tick svelte-1v3p82v", null, ve, { on: r(xe) }), pe(H, "aria-checked", r(xe)), pe(H, "aria-label", `select ${b ?? ""}`), M(X, r(xe) ? "✓" : "");
              },
              [() => o(r(J))]
            ), se("click", H, (b) => {
              b.stopPropagation(), t.oncheck(r(J), r(N), b.shiftKey);
            }), A(_e, Ne);
          };
          ne(te, (_e) => {
            r(c) && _e(ue);
          });
        }
        var me = p(te), P = u(me);
        let O;
        var I = u(P), G = p(P), R = p(G);
        {
          var U = (_e) => {
            var xe = qc();
            A(_e, xe);
          };
          ne(R, (_e) => {
            r(J).scope === "whole inventory" && _e(U);
          });
        }
        var Z = p(me), Te = u(Z), Ae = p(Z), we = u(Ae), Me = p(Ae);
        {
          var ze = (_e) => {
            var xe = Uc(), Ne = u(xe);
            B(() => M(Ne, r(J).detail ?? "")), A(_e, xe);
          };
          ne(Me, (_e) => {
            t.screen.heading[1] && _e(ze);
          });
        }
        B(
          (_e, xe, Ne) => {
            j = Ee(de, 1, "svelte-1v3p82v", null, j, {
              picked: i() === r(J).key,
              clickable: t.screen.sheet !== !1
            }), O = Ee(P, 1, "mark svelte-1v3p82v", null, O, {
              exclude: r(re) === "exclude",
              include: r(re) === "include"
            }), pe(P, "title", m[r(re)] ?? ""), M(I, g[r(re)] ?? ""), M(G, `${_e ?? ""} `), M(Te, xe), M(we, Ne);
          },
          [
            () => o(r(J)),
            () => Pe(r(J).paths),
            () => Ht(r(J).bytes)
          ]
        ), se("click", de, () => t.onpick(r(J))), A(D, de);
      }), B(() => M($, t.screen.heading[0] ?? "")), A(y, f);
    };
    ne(v, (y) => {
      n().length && y(w);
    });
  }
  A(e, _), At();
}
Kt(["click"]);
var Kc = /* @__PURE__ */ z('<button class="twisty svelte-pucy57"> </button>'), $c = /* @__PURE__ */ z('<span class="twisty leaf svelte-pucy57">·</span>'), Vc = /* @__PURE__ */ z('<span class="name root svelte-pucy57"> </span>'), Xc = /* @__PURE__ */ z('<button class="name svelte-pucy57"> </button>'), Jc = /* @__PURE__ */ z('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Zc = /* @__PURE__ */ z('<div class="note svelte-pucy57"> </div>'), Qc = /* @__PURE__ */ z('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), eu = /* @__PURE__ */ z('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), tu = /* @__PURE__ */ z('<div class="tree svelte-pucy57"></div>');
function nu(e, t) {
  Mt(t, !0);
  let n = ae(t, "version", 3, 0), s = ae(t, "excludedDirs", 19, () => []), a = ae(t, "picked", 3, null), i = ae(t, "busy", 3, !1), l = /* @__PURE__ */ V(De(/* @__PURE__ */ new Map())), c = /* @__PURE__ */ V(De(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ V(De(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ V(De(/* @__PURE__ */ new Set()));
  async function g(f) {
    S(o, new Set(r(o)).add(f), !0);
    const h = await t.onload(f), x = new Map(r(l)), T = new Set(r(d));
    h ? (x.set(f, h), T.delete(f)) : T.add(f), S(l, x, !0), S(d, T, !0), S(o, new Set([...r(o)].filter((L) => L !== f)), !0);
  }
  function m(f) {
    if (r(c).has(f)) {
      S(c, new Set([...r(c)].filter((h) => h !== f)), !0);
      return;
    }
    S(c, new Set(r(c)).add(f), !0), r(l).has(f) || g(f);
  }
  let _ = -1;
  mt(() => {
    const f = n();
    if (f !== _) {
      _ = f, r(c).has(t.root) || S(c, new Set(r(c)).add(t.root), !0);
      for (const h of r(c)) g(h);
    }
  });
  const v = /* @__PURE__ */ ie(() => {
    const f = [], h = (Y, $, ee, Q, q, D) => {
      const J = r(l).get(Y), N = r(c).has(Y);
      if (f.push({
        key: Y,
        name: $,
        depth: ee,
        paths: Q,
        bytes: q,
        deeper: D,
        expanded: N,
        here: J?.here ?? null,
        truncated: !!J?.truncated,
        loading: r(o).has(Y),
        failed: r(d).has(Y),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: Ns(s(), Y)
      }), !(!N || !J))
        for (const re of J.children)
          h(re.path, re.name, ee + 1, re.paths, re.bytes, re.deeper);
    }, x = r(l).get(t.root), T = x ? x.children.reduce((Y, $) => Y + $.paths, 0) + x.here.paths : 0, L = x ? x.children.reduce((Y, $) => Y + $.bytes, 0) + x.here.bytes : 0;
    return h(t.root, t.root, 0, T, L, !0), f;
  }), w = 8;
  var y = tu();
  Ve(y, 21, () => r(v), (f) => f.key, (f, h) => {
    var x = eu(), T = dt(x);
    let L;
    var Y = u(T);
    let $;
    var ee = p(Y, 2);
    {
      var Q = (R) => {
        var U = Kc(), Z = u(U);
        B(() => {
          pe(U, "aria-expanded", r(h).expanded), pe(U, "aria-label", `${r(h).expanded ? "collapse" : "expand"} ${r(h).name ?? ""}`), pe(U, "title", r(h).expanded ? "collapse" : "expand"), M(Z, r(h).loading ? "·" : r(h).expanded ? "▾" : "▸");
        }), se("click", U, () => m(r(h).key)), A(R, U);
      }, q = (R) => {
        var U = $c();
        A(R, U);
      };
      ne(ee, (R) => {
        r(h).deeper ? R(Q) : R(q, -1);
      });
    }
    var D = p(ee, 2);
    {
      var J = (R) => {
        var U = Vc(), Z = u(U);
        B(() => M(Z, r(h).key)), A(R, U);
      }, N = (R) => {
        var U = Xc(), Z = u(U);
        B(() => {
          pe(U, "title", `Show every kept file under ${r(h).key ?? ""}`), M(Z, r(h).name);
        }), se("click", U, () => t.onpick(r(h))), A(R, U);
      };
      ne(D, (R) => {
        r(h).depth === 0 ? R(J) : R(N, -1);
      });
    }
    var re = p(D, 2), de = u(re), j = p(re, 2), te = u(j), ue = p(j, 2), me = p(T, 2);
    {
      var P = (R) => {
        var U = Jc();
        let Z;
        B((Te) => Z = Jt(U, "", Z, Te), [
          () => ({
            "padding-left": `${Math.min(r(h).depth, w) * 11 + 18}px`
          })
        ]), A(R, U);
      }, O = (R) => {
        var U = Zc();
        let Z;
        var Te = u(U);
        B(
          (Ae, we, Me) => {
            Z = Jt(U, "", Z, Ae), M(Te, `${we ?? ""} directly here · ${Me ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(h).depth, w) * 11 + 18}px`
            }),
            () => Pe(r(h).here.paths),
            () => Ht(r(h).here.bytes)
          ]
        ), A(R, U);
      };
      ne(me, (R) => {
        r(h).expanded && r(h).failed ? R(P) : r(h).expanded && r(h).here && r(h).here.paths > 0 && R(O, 1);
      });
    }
    var I = p(me, 2);
    {
      var G = (R) => {
        var U = Qc();
        let Z;
        B((Te) => Z = Jt(U, "", Z, Te), [
          () => ({
            "padding-left": `${Math.min(r(h).depth, w) * 11 + 18}px`
          })
        ]), A(R, U);
      };
      ne(I, (R) => {
        r(h).truncated && R(G);
      });
    }
    B(
      (R, U, Z) => {
        L = Ee(T, 1, "row svelte-pucy57", null, L, {
          picked: a() === r(h).key,
          gone: r(h).excluded
        }), $ = Jt(Y, "", $, R), M(de, U), M(te, Z), ue.disabled = i() || r(h).excluded || r(h).depth === 0, pe(ue, "title", r(h).depth === 0 ? "The library root is not excludable from here." : r(h).excluded ? "already excluded" : `Exclude everything under ${r(h).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(h).depth, w) * 11}px` }),
        () => Pe(r(h).paths),
        () => Ht(r(h).bytes)
      ]
    ), se("click", ue, () => t.onexclude(r(h))), A(f, x);
  }), A(e, y), At();
}
Kt(["click"]);
var ru = /* @__PURE__ */ z('<button title="Back to its default">↺</button>'), su = /* @__PURE__ */ z('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), au = /* @__PURE__ */ z('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), iu = /* @__PURE__ */ z('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), lu = /* @__PURE__ */ z('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), ou = /* @__PURE__ */ z('<li><code class="svelte-1hh0fwb"> </code> </li>'), cu = /* @__PURE__ */ z(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), uu = /* @__PURE__ */ z('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function du(e, t) {
  Mt(t, !0);
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
      note: "Where the bar sits and where the photographs start under it. Top and Sides are the bar's own margins and nothing else's, kept as separate numbers because only the top has a photograph scrolling under it. Sides is one number for both edges because the bar is centred, and at the shipped 650 the margin it opens on the left is where the count pane lives — hung off the bar rather than in the row with it, so what is centred in the window is the bar and not the pair. The grid keeps its own 14px from the left, right and bottom of the window whatever Sides says: pulling the floating bar in from the edge is a judgement about the bar, and dragging every photograph sideways with it is not what that judgement was about. Page top is the gap between the bar's bottom edge and the first row of tiles, and it ships at 14 — the same as the grid's own inset, so the space it keeps under the header is the space it keeps from every other edge. So two of these move the photographs and both move them down: Top, because the tiles follow the bar rather than sliding under it, and Page top, because that is what it is for. Sides moves the bar and the count alone. Its slider ends at half this window's width and re-scales when you drag the window, but the bar stops shrinking at 560px and the margin gives way instead, so the last of that range does nothing here. No studio value — its editor's shape controls size a demo blob, so the default is what ships.",
      rows: [
        ["headerTop", "Top", 0, 300, 1],
        ["headerSide", "Sides", 0, (N) => Math.floor(N / 2), 1],
        ["pageTop", "Page top", 0, 300, 1]
      ]
    }
  ], a = {
    tint: {
      title: "Tint",
      note: "Studio's own control, and it opens at alpha 0 — a clear pane, with nothing under the text. This one is per theme, because which way the ground has to move is what the palette decides about this material. It is the bar alone; the panels that drop out of it and the count each have their own, below."
    },
    sheet: {
      title: "Panel tint",
      note: "The ground under the Sort, Filters and Stacks panels and behind the stack overlay. Frosted rather than clear: a panel of small text needs the photograph gone from under it, so this is dark in the dark theme where the bar's tint is clear. No studio value — the default is what ships."
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
  let c = /* @__PURE__ */ V(De(co())), o = /* @__PURE__ */ V(!0), d = /* @__PURE__ */ V(!1), g = /* @__PURE__ */ V(De(ri())), m = /* @__PURE__ */ V(De(window.innerWidth));
  const _ = (N) => r(g) === "light" ? N.light : N.dark, v = (N) => N in Nn ? Nn : un, w = (N) => `rgba(${N.r}, ${N.g}, ${N.b}, ${N.a})`, y = /* @__PURE__ */ ie(() => JSON.stringify(r(c), null, 2));
  cr(() => {
    const N = localStorage.getItem(n);
    if (N)
      try {
        S(c, rs(JSON.parse(N)), !0);
        return;
      } catch {
      }
    Os();
  });
  function f(N) {
    S(c, rs({ ...r(c), ...N }), !0), localStorage.setItem(n, JSON.stringify(r(c))), S(d, !1);
  }
  function h(N) {
    S(c, rs(N), !0), localStorage.setItem(n, JSON.stringify(r(c))), S(d, !1);
  }
  function x(N) {
    f({ [N]: v(N)[N] });
  }
  function T() {
    S(g, si(r(g) === "dark" ? "light" : "dark"), !0);
  }
  async function L() {
    await navigator.clipboard.writeText(r(y)), S(d, !0);
  }
  var Y = uu();
  let $;
  var ee = u(Y), Q = p(u(ee), 4), q = u(Q), D = p(ee, 2);
  {
    var J = (N) => {
      var re = cu();
      {
        const H = (X, b = Nr, E = Nr, C = Nr) => {
          var K = ru();
          let fe;
          B(() => {
            fe = Ee(K, 1, "undo svelte-1hh0fwb", null, fe, { idle: !E() }), pe(K, "aria-label", `Reset ${b() ?? ""}`);
          }), se("click", K, function(...oe) {
            C()?.apply(this, oe);
          }), A(X, K);
        };
        var de = p(u(re), 2);
        Ve(de, 17, () => s, wt, (X, b) => {
          var E = au(), C = u(E), K = u(C), fe = p(C, 2), oe = u(fe), le = p(fe, 2);
          Ve(le, 17, () => r(b).rows, wt, (ke, We) => {
            var Oe = /* @__PURE__ */ ie(() => Zr(r(We), 5));
            let qe = () => r(Oe)[0], ht = () => r(Oe)[1], Ze = () => r(Oe)[2], rt = () => r(Oe)[3], tn = () => r(Oe)[4];
            const It = /* @__PURE__ */ ie(() => r(c)[qe()] !== v(qe())[qe()]), $t = /* @__PURE__ */ ie(() => typeof rt() == "function" ? rt()(r(m)) : rt());
            var lt = su();
            let ot;
            var Lt = u(lt), Ft = u(Lt), vt = p(Lt, 2), st = p(vt, 2), Vt = p(st, 2);
            H(Vt, ht, () => r(It), () => () => x(qe())), B(() => {
              ot = Ee(lt, 1, "row svelte-1hh0fwb", null, ot, { moved: r(It) }), M(Ft, ht()), pe(vt, "min", Ze()), pe(vt, "max", r($t)), pe(vt, "step", tn()), pe(vt, "aria-label", ht()), Vn(vt, r(c)[qe()]), pe(st, "min", Ze()), pe(st, "max", r($t)), pe(st, "step", tn()), pe(st, "aria-label", `${ht() ?? ""} value`), Vn(st, r(c)[qe()]);
            }), se("input", vt, (Dt) => f({ [qe()]: Number(Dt.currentTarget.value) })), se("input", st, (Dt) => f({ [qe()]: Number(Dt.currentTarget.value) })), A(ke, lt);
          }), B(() => {
            M(K, r(b).title), M(oe, r(b).note);
          }), A(X, E);
        });
        var j = p(de, 2), te = u(j), ue = p(j, 2), me = u(ue), P = p(ue, 2);
        Ve(P, 17, () => oo, wt, (X, b) => {
          const E = /* @__PURE__ */ ie(() => _(r(b))), C = /* @__PURE__ */ ie(() => r(c)[r(E)]), K = /* @__PURE__ */ ie(() => r(b).base[r(E)]);
          var fe = lu(), oe = u(fe), le = u(oe), ke = p(le), We = u(ke), Oe = p(oe, 2), qe = u(Oe), ht = p(Oe, 2);
          Ve(ht, 17, () => i, wt, (It, $t) => {
            var lt = /* @__PURE__ */ ie(() => Zr(r($t), 3));
            let ot = () => r(lt)[0], Lt = () => r(lt)[1], Ft = () => r(lt)[2];
            const vt = /* @__PURE__ */ ie(() => r(C)[ot()] !== r(K)[ot()]);
            var st = iu();
            let Vt;
            var Dt = u(st), ur = u(Dt), F = p(Dt, 2), ce = p(F, 2), Se = p(ce, 2);
            H(Se, Lt, () => r(vt), () => () => f({
              [r(E)]: { ...r(C), [ot()]: r(K)[ot()] }
            })), B(() => {
              Vt = Ee(st, 1, "row svelte-1hh0fwb", null, Vt, { moved: r(vt) }), M(ur, Lt()), pe(F, "max", Ft()), pe(F, "step", Ft() === 1 ? 0.01 : 1), pe(F, "aria-label", `${r(g) ?? ""} ${a[r(b).dark].title ?? ""} ${Lt() ?? ""}`), Vn(F, r(C)[ot()]), pe(ce, "max", Ft()), pe(ce, "step", Ft() === 1 ? 0.01 : 1), pe(ce, "aria-label", `${r(g) ?? ""} ${a[r(b).dark].title ?? ""} ${Lt() ?? ""} value`), Vn(ce, r(C)[ot()]);
            }), se("input", F, (Ce) => f({
              [r(E)]: {
                ...r(C),
                [ot()]: Number(Ce.currentTarget.value)
              }
            })), se("input", ce, (Ce) => f({
              [r(E)]: {
                ...r(C),
                [ot()]: Number(Ce.currentTarget.value)
              }
            })), A(It, st);
          });
          var Ze = p(ht, 2);
          let rt;
          var tn = u(Ze);
          B(
            (It, $t) => {
              M(le, `${a[r(b).dark].title ?? ""} `), M(We, r(g)), M(qe, a[r(b).dark].note), rt = Jt(Ze, "", rt, It), M(tn, $t);
            },
            [
              () => ({ background: w(r(C)) }),
              () => w(r(C))
            ]
          ), A(X, fe);
        });
        var O = p(P, 2), I = p(u(O), 4);
        let ve;
        var G = u(I), R = u(G), U = p(G, 2);
        H(U, () => "Blur at the edge", () => r(c).blurEdge !== Nn.blurEdge, () => () => x("blurEdge"));
        var Z = p(O, 2), Te = p(u(Z), 4);
        Ve(Te, 21, () => l, wt, (X, b) => {
          var E = /* @__PURE__ */ ie(() => Zr(r(b), 2));
          let C = () => r(E)[0], K = () => r(E)[1];
          var fe = ou(), oe = u(fe), le = u(oe), ke = p(oe);
          B(() => {
            M(le, C()), M(ke, ` — ${K() ?? ""}`);
          }), A(X, fe);
        });
        var Ae = p(Z, 2), we = p(u(Ae), 4), Me = u(we), ze = p(Me, 2), _e = p(ze, 2), xe = u(_e), Ne = p(we, 2);
        B(() => {
          M(te, `The five colours below are per theme, and you are editing the ${r(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), M(me, `Edit the ${r(g) === "dark" ? "light" : "dark"} colours`), ve = Ee(I, 1, "row toggle svelte-1hh0fwb", null, ve, { moved: r(c).blurEdge !== Nn.blurEdge }), Yl(R, r(c).blurEdge), M(xe, r(d) ? "Copied" : "Copy"), Vn(Ne, r(y));
        }), se("click", ue, T), se("change", R, (X) => f({ blurEdge: X.currentTarget.checked })), se("click", Me, () => h(un)), se("click", ze, () => h(Nn)), se("click", _e, L);
      }
      A(N, re);
    };
    ne(D, (N) => {
      r(o) && N(J);
    });
  }
  B(() => {
    $ = Ee(Y, 1, "tuner svelte-1hh0fwb", null, $, { folded: !r(o) }), pe(Q, "title", r(o) ? "Fold away" : "Open"), M(q, r(o) ? "–" : "+");
  }), Kl("innerWidth", (N) => S(m, N, !0)), se("click", Q, () => S(o, !r(o))), A(e, Y), At();
}
Kt(["click", "input", "change"]);
function is(e, t, n, s) {
  const a = e + t;
  return a < 0 || a >= n && s ? null : a;
}
var fu = /* @__PURE__ */ z('<button><span class="n svelte-1n46o8q"> </span> </button>'), hu = /* @__PURE__ */ z('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), vu = /* @__PURE__ */ z('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), pu = /* @__PURE__ */ z('<div class="muted pad svelte-1n46o8q">loading…</div>'), gu = /* @__PURE__ */ z('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), _u = /* @__PURE__ */ z('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), bu = /* @__PURE__ */ z('<p class="blurb"> </p>'), mu = /* @__PURE__ */ z('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear</button> <span class="muted svelte-1n46o8q"><!></span></div>'), wu = /* @__PURE__ */ z('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), yu = /* @__PURE__ */ z('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), xu = /* @__PURE__ */ z('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), ku = /* @__PURE__ */ z("<div> </div>"), Su = /* @__PURE__ */ z('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function Eu(e, t) {
  Mt(t, !0);
  const n = location.pathname === "/tune";
  let s = /* @__PURE__ */ V("grid"), a = /* @__PURE__ */ V(0), i = /* @__PURE__ */ V(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ V(De([])), c = /* @__PURE__ */ V(null), o = /* @__PURE__ */ V(null), d = /* @__PURE__ */ V(De(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ V(null), m = /* @__PURE__ */ V(null), _ = /* @__PURE__ */ V(null), v = /* @__PURE__ */ V(null), w = /* @__PURE__ */ V(!1), y = /* @__PURE__ */ V(!1), f = /* @__PURE__ */ V(!1), h = /* @__PURE__ */ V(!1), x = /* @__PURE__ */ V(De({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), T = /* @__PURE__ */ V(null), L = /* @__PURE__ */ V(0), Y = /* @__PURE__ */ V(null), $ = /* @__PURE__ */ V(De({})), ee = /* @__PURE__ */ V("newest"), Q = /* @__PURE__ */ V(De(yo())), q = /* @__PURE__ */ V(null), D = /* @__PURE__ */ V(null), J = /* @__PURE__ */ V(!1), N = /* @__PURE__ */ V(De([])), re = /* @__PURE__ */ V(null), de = null;
  const j = /* @__PURE__ */ ie(() => Js[r(a)]), te = /* @__PURE__ */ ie(() => r(j).table !== !1), ue = /* @__PURE__ */ ie(() => r(te) || r(j).tree === !0), me = /* @__PURE__ */ ie(() => r(j).sheet !== !1 && (r(o) !== null || !r(ue))), P = /* @__PURE__ */ ie(() => ({
    sort: r(ee),
    ...r(Q).on ? {
      stack: "on",
      ...r(Q).strictness === null ? {} : {
        strictness: String(r(Q).strictness),
        linkage: r(Q).linkage
      }
    } : {},
    ...Object.fromEntries(Object.entries(r($)).filter(([, k]) => k.length > 0))
  })), O = /* @__PURE__ */ ie(() => r(N).map((k) => k.key)), I = /* @__PURE__ */ ie(() => Rc(r(N))), G = /* @__PURE__ */ ie(() => li(r(Q)));
  mt(() => {
    r(G), qt(() => {
      S(N, [], !0);
    });
  }), mt(() => {
    r(P), qt(() => {
      S(re, null);
    });
  });
  const R = /* @__PURE__ */ ie(() => r(s) === "grid" ? `grid:${JSON.stringify(r(P))}` : `triage:${r(a)}:${JSON.stringify(r(o))}`), U = /* @__PURE__ */ ie(() => r(j).rule === !1 || r(d).size === 0 ? [] : r(l).filter((k) => r(d).has(k.key)).map((k) => r(j).toRule(k, r(i))).filter((k) => k && Za(r(m)?.rules ?? [], k) !== "exclude")), Z = /* @__PURE__ */ ie(() => (r(m)?.rules ?? []).filter((k) => k.decision === "exclude" && k.term?.column === "dir_under").map((k) => String(k.term.value).replace(/[\\/]+$/, "").toLowerCase())), Te = Xl();
  function Ae(k) {
    S(T, String(k), !0);
  }
  async function we(k) {
    try {
      return S(T, null), await k();
    } catch (W) {
      return Ae(W), null;
    }
  }
  const Me = Jl(
    () => {
      S(y, !0), we(async () => {
        const k = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: W, value: he } = await Te(() => Ke.counts(r(o), k));
        W || S(m, he, !0);
      }).finally(() => {
        S(y, !1);
      });
    },
    220
  );
  async function ze() {
    S(_, "loading");
    const k = await we(() => Ke.files());
    S(_, k, !0), S(w, !1), S(v, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function _e(k = !1) {
    if (r(s) !== "triage" || !r(te)) {
      S(l, [], !0);
      return;
    }
    S(h, !0);
    const W = r(j).name === "source_folder" && r(i) ? { root: r(i) } : {};
    k && (W.live = "1");
    const he = await we(() => Ke.screen(r(j).name, W));
    S(l, he?.rows ?? [], !0), S(h, !1);
  }
  let xe = !1;
  mt(() => {
    r(a), r(s), qt(() => {
      S(c, null), S(o, null), S(i, null), X(), r(s) === "triage" && (_e(), Me.now(), xe || (xe = !0, ze()));
    });
  }), mt(() => {
    r(i), qt(() => {
      r(s) === "triage" && (X(), _e());
    });
  }), cr(() => {
    we(async () => {
      S(Y, await Ke.facets(), !0);
    });
  }), mt(() => {
    const k = r(Y)?.stacking?.settings;
    k && qt(() => {
      const W = xo(r(Q), k);
      W !== r(Q) && S(Q, ta(W), !0);
    });
  });
  function Ne(k, W) {
    S($, { ...r($), [k]: W }, !0);
  }
  function H(k) {
    if (r(j).sheet !== !1) {
      if (r(j).drill && !r(i)) {
        S(c, k.key, !0), S(
          o,
          {
            ...r(j).toRule(k, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), S(i, k.key, !0);
        return;
      }
      S(c, k.key, !0), S(
        o,
        {
          ...r(j).toRule(k, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), Me();
    }
  }
  function ve(k, W, he) {
    const Ue = new Set(r(d)), Ye = !Ue.has(k.key), ct = he && r(g) !== null ? r(l).findIndex((St) => St.key === r(g)) : -1, [ln, bn] = ct < 0 ? [W, W] : ct < W ? [ct, W] : [W, ct];
    for (let St = ln; St <= bn; St++)
      Ye ? Ue.add(r(l)[St].key) : Ue.delete(r(l)[St].key);
    S(d, Ue, !0), S(g, k.key, !0);
  }
  function X() {
    S(d, /* @__PURE__ */ new Set(), !0), S(g, null);
  }
  function b(k) {
    S(o, k, !0), S(
      c,
      null
      // it no longer corresponds to a row
    ), Me();
  }
  function E(k = !1) {
    S(o, null), S(c, null), k && S(i, null), Me.now();
  }
  async function C() {
    S(
      w,
      !0
      // the distinct-content number now says so on its face
    ), fl(L), await _e(), Me.now();
  }
  async function K() {
    if (!r(o)) return;
    S(f, !0);
    const k = r(o).at === "end" ? void 0 : 0, W = await we(() => Ke.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(j).id} ${r(j).title}`
      },
      k
    ));
    S(f, !1), W && (S(o, null), S(c, null), await C());
  }
  async function fe() {
    const k = r(U);
    if (!k.length) {
      X();
      return;
    }
    S(f, !0);
    for (const W of k)
      if (!await we(() => Ke.addRule({
        column: W.column,
        op: W.op,
        value: W.value,
        decision: "exclude",
        note: `screen ${r(j).id} ${r(j).title}`
      }))) break;
    S(f, !1), X(), S(o, null), S(c, null), await C();
  }
  async function oe(k) {
    if (!k || Ns(r(Z), k)) return;
    S(f, !0);
    const W = await we(() => Ke.addRule({
      column: "dir_under",
      op: "=",
      value: k,
      decision: "exclude",
      note: `screen ${r(j).id} ${r(j).title}`
    }));
    S(f, !1), W && await C();
  }
  const le = (k) => oe(Ja(k.p ?? "")), ke = (k) => oe(k.key);
  async function We(k) {
    S(f, !0), await we(() => Ke.deleteRule(k.id)), S(f, !1), await C();
  }
  async function Oe(k, W) {
    S(f, !0), await we(() => Ke.moveRule(k.id, W)), S(f, !1), await C();
  }
  async function qe() {
    await we(async () => {
      S(Y, await Ke.facets(), !0);
    });
  }
  async function ht(k, W) {
    const he = await we(() => Ke.override(k.s, W));
    return he ? (S(w, !0), Me(), he.decision) : k.o ?? null;
  }
  async function Ze(k) {
    if (r(s) !== "grid") return Ke.page(r(o), k);
    const W = r(R), he = await Ke.photos({ limit: 500, ...r(P), ...k || {} });
    return r(N).length && W === r(R) && S(N, Tc(r(N), he.photos.map(zr)), !0), he;
  }
  const rt = (k) => k.m ?? [{ id: k.id, s: k.s, w: k.w, h: k.h }];
  function tn(k, W, he, Ue = !1) {
    if (r(s) === "grid") {
      if (r(J)) {
        if (Ue && r(re) !== null) {
          const Ye = r(D)?.itemsBetween(r(re), he) ?? [];
          S(N, oa(r(N), Ye.map(zr), !It(k)), !0);
        } else
          S(N, Ac(r(N), zr(k)), !0);
        S(re, he, !0);
        return;
      }
      S(
        q,
        {
          frames: rt(k),
          cover: k.id,
          origin: da(W),
          at: he
        },
        !0
      );
      return;
    }
    we(() => Ke.revealOrigin(k.id));
  }
  const It = (k) => r(N).some((W) => W.key === Is(k));
  function $t(k, W) {
    de = {
      from: r(N),
      adding: k === null || !It(k)
    }, W !== null && S(re, W, !0);
  }
  function lt(k) {
    S(N, oa(de.from, k.map(zr), de.adding), !0);
  }
  function ot() {
    de = null;
  }
  function Lt() {
    S(N, [], !0), S(re, null);
  }
  const Ft = /* @__PURE__ */ ie(() => r(q) !== null && is(r(q).at, -1, r(x).count, r(x).exhausted) !== null), vt = /* @__PURE__ */ ie(() => r(q) !== null && is(r(q).at, 1, r(x).count, r(x).exhausted) !== null), st = 120;
  let Vt = !1, Dt = 0;
  async function ur(k, W = !1) {
    const he = performance.now();
    if (!r(q) || Vt || W && he - Dt < st) return;
    const Ue = is(r(q).at, k, r(x).count, r(x).exhausted);
    if (Ue !== null) {
      Dt = he, Vt = !0;
      try {
        const Ye = await r(D)?.walkTo(Ue);
        if (!Ye || !r(q)) return;
        S(
          q,
          {
            frames: rt(Ye.item),
            cover: Ye.item.id,
            origin: da(Ye.tile),
            at: Ue
          },
          !0
        );
      } finally {
        Vt = !1;
      }
    }
  }
  async function F() {
    const k = r(q)?.at ?? null;
    S(q, null), await El(), k !== null && r(D)?.focusTile(k);
  }
  function ce(k) {
    we(() => Ke.revealPhoto(k.id));
  }
  function Se() {
    we(() => navigator.clipboard.writeText(Cc(
      {
        stacking: r(Q),
        sort: r(ee),
        filters: r($)
      },
      r(N)
    )));
  }
  var Ce = Su(), Ie = dt(Ce);
  {
    var Re = (k) => {
      qo(k, {
        get facets() {
          return r(Y);
        },
        get filters() {
          return r($);
        },
        get sort() {
          return r(ee);
        },
        get stacking() {
          return r(Q);
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
        get selecting() {
          return r(J);
        },
        get selectedTally() {
          return r(I);
        },
        onfilter: Ne,
        onsort: (W) => S(ee, W, !0),
        onstack: (W) => S(Q, ta(W), !0),
        onclear: () => S($, {}, !0),
        onselecting: (W) => S(J, W, !0),
        onshare: Se,
        ondeselect: Lt,
        ontriage: () => S(s, "triage")
      });
    };
    ne(Ie, (k) => {
      r(s) === "grid" && k(Re);
    });
  }
  var Ge = p(Ie, 2);
  {
    var pt = (k) => {
      du(k, {});
    };
    ne(Ge, (k) => {
      n && k(pt);
    });
  }
  var xt = p(Ge, 2);
  let tt;
  var nn = u(xt);
  {
    var rn = (k) => {
      var W = _u(), he = u(W), Ue = u(he), Ye = p(he, 2);
      Ve(Ye, 21, () => Js, wt, (gt, jt, mn) => {
        var wn = fu();
        let Un;
        var Yn = u(wn), Fe = u(Yn), _t = p(Yn, 1, !0);
        B(() => {
          Un = Ee(wn, 1, "nav svelte-1n46o8q", null, Un, { on: mn === r(a) }), M(Fe, r(jt).id), M(_t, r(jt).title);
        }), se("click", wn, () => S(a, mn, !0)), A(gt, wn);
      });
      var ct = p(Ye, 2);
      {
        var ln = (gt) => {
          var jt = gu(), mn = dt(jt), wn = u(mn);
          {
            var Un = (at) => {
              var ut = hu(), Wn = dt(ut), dr = /* @__PURE__ */ ie(() => E.bind(null, !0)), Vr = p(Wn, 2), Xr = u(Vr);
              B(() => M(Xr, `inside ${r(i) ?? ""}`)), se("click", Wn, function(...Jr) {
                r(dr)?.apply(this, Jr);
              }), A(at, ut);
            }, Yn = (at) => {
              var ut = vu(), Wn = u(ut);
              B(() => M(Wn, r(j).relive)), se("click", ut, () => _e(!0)), A(at, ut);
            };
            ne(wn, (at) => {
              r(j).drill && r(i) ? at(Un) : r(j).relive && at(Yn, 1);
            });
          }
          var Fe = p(mn, 2);
          {
            var _t = (at) => {
              var ut = pu();
              A(at, ut);
            };
            ne(Fe, (at) => {
              r(h) && at(_t);
            });
          }
          var yn = p(Fe, 2);
          {
            let at = /* @__PURE__ */ ie(() => r(m)?.rules ?? []);
            Gc(yn, {
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
                return r(d);
              },
              get rules() {
                return r(at);
              },
              get picked() {
                return r(c);
              },
              onpick: H,
              oncheck: ve
            });
          }
          A(gt, jt);
        };
        ne(ct, (gt) => {
          r(te) && gt(ln);
        });
      }
      var bn = p(ct, 2);
      {
        var St = (gt) => {
          nu(gt, {
            get root() {
              return ar;
            },
            get version() {
              return r(L);
            },
            get excludedDirs() {
              return r(Z);
            },
            get picked() {
              return r(c);
            },
            get busy() {
              return r(f);
            },
            onload: (jt) => we(() => Ke.tree(jt)),
            onpick: H,
            onexclude: ke
          });
        };
        ne(bn, (gt) => {
          r(j).tree && gt(St);
        });
      }
      var Mr = p(bn, 2);
      {
        let gt = /* @__PURE__ */ ie(() => r(m)?.rules ?? []), jt = /* @__PURE__ */ ie(() => r(m)?.unmatched ?? null);
        Ec(Mr, {
          get rules() {
            return r(gt);
          },
          get unmatched() {
            return r(jt);
          },
          get busy() {
            return r(f);
          },
          ondelete: We,
          onmove: Oe
        });
      }
      var Ar = p(Mr, 2);
      vc(Ar, { oncomplete: qe }), se("click", Ue, () => S(s, "grid")), A(k, W);
    };
    ne(nn, (k) => {
      r(s) === "triage" && k(rn);
    });
  }
  var gn = p(nn, 2), je = u(gn);
  {
    var kt = (k) => {
      var W = xu(), he = dt(W), Ue = u(he), Ye = p(he, 2), ct = u(Ye), ln = p(Ye, 2);
      {
        var bn = (Fe) => {
          var _t = bu(), yn = u(_t);
          B(() => M(yn, r(j).note)), A(Fe, _t);
        };
        ne(ln, (Fe) => {
          r(j).note && Fe(bn);
        });
      }
      var St = p(ln, 2);
      {
        var Mr = (Fe) => {
          sc(Fe, {
            get screen() {
              return r(j);
            }
          });
        };
        ne(St, (Fe) => {
          r(j).name === "dimensions" && Fe(Mr);
        });
      }
      var Ar = p(St, 2);
      lo(Ar, {
        get counts() {
          return r(m);
        },
        get files() {
          return r(_);
        },
        get filesAt() {
          return r(v);
        },
        get stale() {
          return r(w);
        },
        get candidate() {
          return r(o);
        },
        get busy() {
          return r(y);
        },
        onfiles: ze
      });
      var gt = p(Ar, 2);
      {
        var jt = (Fe) => {
          var _t = mu(), yn = u(_t), at = u(yn), ut = p(yn, 2), Wn = u(ut), dr = p(ut, 2), Vr = p(dr, 2), Xr = u(Vr);
          {
            var Jr = (xn) => {
              var Gn = Jn("already excluded — nothing left to write");
              A(xn, Gn);
            }, oi = (xn) => {
              var Gn = Jn();
              B((ci) => M(Gn, `one exclude rule each, at the end of the order${ci ?? ""}`), [
                () => r(U).length < r(d).size ? ` · ${Pe(r(d).size - r(U).length)} already excluded, skipped` : ""
              ]), A(xn, Gn);
            };
            ne(Xr, (xn) => {
              r(U).length ? xn(oi, -1) : xn(Jr);
            });
          }
          B(
            (xn, Gn) => {
              M(at, `${xn ?? ""} ticked`), ut.disabled = r(f) || !r(U).length, M(Wn, Gn), dr.disabled = r(f);
            },
            [
              () => Pe(r(d).size),
              () => r(f) ? "saving…" : `Exclude ${Pe(r(U).length)}`
            ]
          ), se("click", ut, fe), se("click", dr, X), A(Fe, _t);
        };
        ne(gt, (Fe) => {
          r(d).size && Fe(jt);
        });
      }
      var mn = p(gt, 2);
      wc(mn, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(j);
        },
        get saving() {
          return r(f);
        },
        onedit: b,
        onconfirm: K,
        onclear: E
      });
      var wn = p(mn, 2);
      {
        var Un = (Fe) => {
          var _t = wu(), yn = u(_t);
          B((at, ut) => M(yn, `${at ?? ""}${ut ?? ""} loaded${r(x).exhausted ? " · all of them" : ""}${r(x).loading ? " · loading…" : ""} `), [
            () => Pe(r(x).count),
            () => r(x).total ? " of " + Pe(r(x).total) : ""
          ]), A(Fe, _t);
        }, Yn = (Fe) => {
          var _t = yu();
          A(Fe, _t);
        };
        ne(wn, (Fe) => {
          r(me) ? Fe(Un) : r(j).sheet === !1 && Fe(Yn, 1);
        });
      }
      B(() => {
        M(Ue, `${r(j).id ?? ""} · ${r(j).title ?? ""}`), M(ct, r(j).blurb);
      }), A(k, W);
    };
    ne(je, (k) => {
      r(s) === "triage" && k(kt);
    });
  }
  var sn = p(je, 2);
  {
    var an = (k) => {
      {
        let W = /* @__PURE__ */ ie(() => r(s) === "grid" ? null : r(m)?.page_paths ?? null), he = /* @__PURE__ */ ie(() => r(s) === "triage"), Ue = /* @__PURE__ */ ie(() => r(s) === "grid" && r(J));
        kr(
          Dc(k, {
            get key() {
              return r(R);
            },
            fetchPage: Ze,
            get total() {
              return r(W);
            },
            get triage() {
              return r(he);
            },
            get excludedDirs() {
              return r(Z);
            },
            get selecting() {
              return r(Ue);
            },
            get selectedKeys() {
              return r(O);
            },
            onActivate: tn,
            onOverride: ht,
            onExcludeFolder: le,
            onSweepStart: $t,
            onSweepMove: lt,
            onSweepEnd: ot,
            onState: (Ye) => S(x, { ...r(x), ...Ye }, !0)
          }),
          (Ye) => S(D, Ye, !0),
          () => r(D)
        );
      }
    };
    ne(sn, (k) => {
      (r(me) || r(s) === "grid") && k(an);
    });
  }
  var _n = p(xt, 2);
  {
    var Cn = (k) => {
      Zo(k, {
        get frames() {
          return r(q).frames;
        },
        get cover() {
          return r(q).cover;
        },
        get origin() {
          return r(q).origin;
        },
        get back() {
          return r(Ft);
        },
        get forward() {
          return r(vt);
        },
        onstep: ur,
        onreveal: ce,
        onclose: F
      });
    };
    ne(_n, (k) => {
      r(q) && k(Cn);
    });
  }
  var nt = p(_n, 2);
  {
    var Le = (k) => {
      var W = ku();
      let he;
      var Ue = u(W);
      B(() => {
        he = Ee(W, 1, "status", null, he, { bare: r(s) === "grid" }), M(Ue, r(T));
      }), A(k, W);
    };
    ne(nt, (k) => {
      r(T) && k(Le);
    });
  }
  B(() => tt = Ee(xt, 1, "shell", null, tt, { bare: r(s) === "grid" })), A(e, Ce), At();
}
Kt(["click"]);
ko();
Os();
zl(Eu, { target: document.getElementById("app") });
