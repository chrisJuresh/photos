var Dr = Array.isArray, ms = Array.prototype.indexOf, Qn = Array.prototype.includes, ur = Array.from, ws = Object.defineProperty, bn = Object.getOwnPropertyDescriptor, ys = Object.getOwnPropertyDescriptors, xs = Object.prototype, ks = Array.prototype, ya = Object.getPrototypeOf, Jr = Object.isExtensible;
const Xn = () => {
};
function Ss(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function xa() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
function gr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const r of e)
    if (n.push(r), n.length === t) break;
  return n;
}
const je = 2, wn = 4, cr = 8, ka = 1 << 24, Mt = 16, mt = 32, jt = 64, Er = 128, bt = 512, Fe = 1024, Le = 2048, Pt = 4096, nt = 8192, dt = 16384, Tn = 32768, Tr = 1 << 25, yn = 65536, er = 1 << 17, Es = 1 << 18, Mn = 1 << 19, Ts = 1 << 20, Ft = 1 << 25, un = 65536, tr = 1 << 21, mn = 1 << 22, Zt = 1 << 23, an = Symbol("$state"), Ms = Symbol("legacy props"), Rs = Symbol(""), Sa = Symbol("attributes"), Mr = Symbol("class"), Rr = Symbol("style"), Ar = Symbol("text"), Un = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), As = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Ps(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Cs() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Os(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Is(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Ns() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Fs(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ls() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function zs(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Ds() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function qs() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Hs() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function js() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Bs = 1, Us = 2, Ea = 4, $s = 8, Gs = 16, Ys = 1, Ws = 4, Vs = 8, Xs = 16, Ks = 1, Js = 2, Ne = Symbol("uninitialized"), Zs = "http://www.w3.org/1999/xhtml";
function Qs() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function ei() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function ti() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Ta(e) {
  return e === this.v;
}
function ni(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Ma(e) {
  return !ni(e, this.v);
}
let Ke = null;
function xn(e) {
  Ke = e;
}
function Ct(e, t = !1, n) {
  Ke = {
    p: Ke,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      re
    ),
    l: null
  };
}
function Ot(e) {
  var t = (
    /** @type {ComponentContext} */
    Ke
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Ga(r);
  }
  return t.i = !0, Ke = t.p, /** @type {T} */
  {};
}
function Ra() {
  return !0;
}
let gn = [];
function ri() {
  var e = gn;
  gn = [], Ss(e);
}
function qt(e) {
  if (gn.length === 0) {
    var t = gn;
    queueMicrotask(() => {
      t === gn && ri();
    });
  }
  gn.push(e);
}
function Aa(e) {
  var t = re;
  if (t === null)
    return ie.f |= Zt, e;
  if ((t.f & Tn) === 0 && (t.f & wn) === 0)
    throw e;
  Kt(e, t);
}
function Kt(e, t) {
  if (!(t !== null && (t.f & dt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & Er) !== 0) {
        if ((t.f & Tn) === 0)
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
const ai = -7169;
function Re(e, t) {
  e.f = e.f & ai | t;
}
function qr(e) {
  (e.f & bt) !== 0 || e.deps === null ? Re(e, Fe) : Re(e, Pt);
}
function Pa(e) {
  if (e !== null)
    for (const t of e)
      (t.f & je) === 0 || (t.f & un) === 0 || (t.f ^= un, Pa(
        /** @type {Derived} */
        t.deps
      ));
}
function Ca(e, t, n) {
  (e.f & Le) !== 0 ? t.add(e) : (e.f & Pt) !== 0 && n.add(e), Pa(e.deps), Re(e, Fe);
}
let Yn = !1;
function si(e) {
  var t = Yn;
  try {
    return Yn = !1, [e(), Yn];
  } finally {
    Yn = t;
  }
}
function ii(e, t, n, r = !0) {
  r && n();
  for (var s of t)
    e.addEventListener(s, n);
  dr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function Rn(e) {
  var t = ie, n = re;
  wt(null), zt(null);
  try {
    return e();
  } finally {
    wt(t), zt(n);
  }
}
function li(e) {
  let t = 0, n = cn(0), r;
  return () => {
    Ur() && (a(n), Wa(() => (t === 0 && (r = fn(() => e(() => Hn(n)))), t += 1, () => {
      qt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Hn(n));
      });
    })));
  };
}
var oi = yn | Mn;
function ui(e, t, n, r) {
  new ci(e, t, n, r);
}
class ci {
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
  #b = li(() => (this.#d = cn(this.#p), () => {
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
        re
      );
      l.b = this, l.f |= Er, r(i);
    }, this.parent = /** @type {Effect} */
    re.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#r = $r(() => {
      this.#h();
    }, oi);
  }
  #_() {
    try {
      this.#s = _t(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: s } = this.#m(t);
    qt(s), n && (this.#l = _t(() => {
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
        ti();
        return;
      }
      n = !0, r && js(), this.#l !== null && ln(this.#l, () => {
        this.#l = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: s, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, s), r = !1;
      } catch (l) {
        Kt(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = _t(() => t(this.#t)), qt(() => {
      var n = this.#a = document.createDocumentFragment(), r = Ht();
      n.append(r), this.#s = this.#v(() => _t(() => this.#o(r))), this.#u === 0 && (this.#t.before(n), this.#a = null, ln(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        he
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#p = 0, this.#s = _t(() => {
        this.#o(this.#t);
      }), this.#u > 0) {
        var t = this.#a = document.createDocumentFragment();
        Yr(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = _t(() => n(this.#t));
      } else
        this.#w(
          /** @type {Batch} */
          he
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
    Ca(t, this.#f, this.#g);
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
    var n = re, r = ie, s = Ke;
    zt(this.#r), wt(this.#r), xn(this.#r.ctx);
    try {
      return Qt.ensure(), t();
    } catch (i) {
      return Aa(i), null;
    } finally {
      zt(n), wt(r), xn(s);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && ln(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#c) && (this.#c = !0, qt(() => {
      this.#c = !1, this.#d && kn(this.#d, this.#p);
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
    he?.is_fork ? (this.#s && he.skip_effect(this.#s), this.#n && he.skip_effect(this.#n), this.#l && he.skip_effect(this.#l), he.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#s && (lt(this.#s), this.#s = null), this.#n && (lt(this.#n), this.#n = null), this.#l && (lt(this.#l), this.#l = null);
    let n = this.#e.failed;
    const r = (s) => {
      const { reset: i, invoke_onerror: l } = this.#m(s);
      l(), n && (this.#l = this.#v(() => {
        try {
          return _t(() => {
            var u = (
              /** @type {Effect} */
              re
            );
            u.b = this, u.f |= Er, n(
              this.#t,
              () => s,
              () => i
            );
          });
        } catch (u) {
          return Kt(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    qt(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (i) {
        Kt(i, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        r,
        /** @param {unknown} e */
        (i) => Kt(i, this.#r && this.#r.parent)
      ) : r(s);
    });
  }
}
function di(e, t, n, r) {
  const s = jn;
  var i = e.filter((f) => !f.settled), l = t.map(s);
  if (n.length === 0 && i.length === 0) {
    r(l);
    return;
  }
  var u = (
    /** @type {Effect} */
    re
  ), o = fi(), d = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((f) => f.promise)) : null;
  function g(f) {
    if ((u.f & dt) === 0) {
      o();
      try {
        r([...l, ...f]);
      } catch (h) {
        Kt(h, u);
      }
      nr();
    }
  }
  var b = Oa();
  if (n.length === 0) {
    d.then(() => g([])).finally(b);
    return;
  }
  function p() {
    Promise.all(n.map((f) => /* @__PURE__ */ hi(f))).then(g).catch((f) => Kt(f, u)).finally(b);
  }
  d ? d.then(() => {
    o(), p(), nr();
  }) : p();
}
function fi() {
  var e = (
    /** @type {Effect} */
    re
  ), t = ie, n = Ke, r = (
    /** @type {Batch} */
    he
  );
  return function(i = !0) {
    zt(e), wt(t), xn(n), i && (e.f & dt) === 0 && (r?.activate(), r?.apply());
  };
}
function nr(e = !0) {
  zt(null), wt(null), xn(null), e && he?.deactivate();
}
function Oa() {
  var e = (
    /** @type {Effect} */
    re
  ), t = e.b, n = (
    /** @type {Batch} */
    he
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function jn(e) {
  var t = je | Le;
  return re !== null && (re.f |= Mn), {
    ctx: Ke,
    deps: null,
    effects: null,
    equals: Ta,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Ne
    ),
    wv: 0,
    parent: re,
    ac: null
  };
}
const Nn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function hi(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    re
  );
  r === null && Cs();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = cn(
    /** @type {V} */
    Ne
  ), l = !ie, u = /* @__PURE__ */ new Set();
  return Ri(() => {
    var o = (
      /** @type {Effect} */
      re
    ), d = xa();
    s = d.promise;
    try {
      Promise.resolve(e()).then(d.resolve, (f) => {
        f !== Un && d.reject(f);
      }).finally(nr);
    } catch (f) {
      d.reject(f), nr();
    }
    var g = (
      /** @type {Batch} */
      he
    );
    if (l) {
      if ((o.f & Tn) !== 0)
        var b = Oa();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(Nn);
      else
        for (const f of u.values())
          f.reject(Nn);
      u.add(d), g.async_deriveds.set(o, d);
    }
    const p = (f, h = void 0) => {
      b?.(), u.delete(d), h !== Nn && (g.activate(), h ? (i.f |= Zt, kn(i, h)) : ((i.f & Zt) !== 0 && (i.f ^= Zt), kn(i, f)), g.deactivate());
    };
    d.promise.then(p, (f) => p(null, f || "unknown"));
  }), dr(() => {
    for (const o of u)
      o.reject(Nn);
  }), new Promise((o) => {
    function d(g) {
      function b() {
        g === s ? o(i) : d(s);
      }
      g.then(b, b);
    }
    d(s);
  });
}
// @__NO_SIDE_EFFECTS__
function te(e) {
  const t = /* @__PURE__ */ jn(e);
  return Za(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ia(e) {
  const t = /* @__PURE__ */ jn(e);
  return t.equals = Ma, t;
}
function vi(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      lt(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Hr(e) {
  var t, n = re, r = e.parent;
  if (!Bt && r !== null && e.v !== Ne && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (dt | nt)) !== 0)
    return Qs(), e.v;
  zt(r);
  try {
    e.f &= ~un, vi(e), t = ns(e);
  } finally {
    zt(n);
  }
  return t;
}
function Na(e) {
  var t = Hr(e);
  if (!e.equals(t) && (e.wv = es(), (!he?.is_fork || e.deps === null) && (he !== null ? (he.capture(e, t, !0), Pr?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Re(e, Fe);
    return;
  }
  Bt || (Rt !== null ? (Ur() || he?.is_fork) && Rt.set(e, t) : qr(e));
}
function pi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Rn(() => {
        t.ac.abort(Un), t.ac = null;
      }), t.fn !== null && (t.teardown = Xn), Bn(t, 0), Gr(t));
}
function Fa(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Sn(t);
}
let _r = null, vn = null, he = null, Pr = null, Rt = null, Cr = null, br = !1, _n = null, Kn = null;
var Zr = 0;
let gi = 1;
class Qt {
  id = gi++;
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
    vn === null ? _r = vn = this : (vn.#e = this, this.#i = vn), vn = this;
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
        Re(s, Le), n(s);
      for (s of r.m)
        Re(s, Pt), n(s);
    }
    this.#g.add(t);
  }
  #_() {
    this.#t = !0, Zr++ > 1e3 && (this.#v(), _i());
    for (const o of this.#u)
      this.#c.delete(o), Re(o, Le), this.schedule(o);
    for (const o of this.#c)
      Re(o, Pt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = _n = [], r = [], s = Kn = [];
    for (const o of t)
      try {
        this.#y(o, n, r);
      } catch (d) {
        throw Da(o), this.#b() || this.discard(), d;
      }
    if (he = null, s.length > 0) {
      var i = Qt.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (_n = null, Kn = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [o, d] of this.#f)
        za(o, d);
      s.length > 0 && /** @type {unknown} */
      he.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(r), this.#h(n), l.#x(this);
      return;
    }
    this.#u.clear(), this.#c.clear();
    for (const o of this.#o) o(this);
    this.#o.clear(), Pr = this, Qr(r), Qr(n), Pr = null, this.#l?.resolve();
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      he
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
    t.f ^= Fe;
    for (var s = t.first; s !== null; ) {
      var i = s.f, l = (i & (mt | jt)) !== 0, u = l && (i & Fe) !== 0, o = u || (i & nt) !== 0 || this.#f.has(s);
      if (!o && s.fn !== null) {
        l ? s.f ^= Fe : (i & wn) !== 0 ? n.push(s) : Gn(s) && ((i & Mt) !== 0 && this.#c.add(s), Sn(s));
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
      if (s !== null && !((r.f & je) !== 0 && (r.f & (Le | Pt)) === 0))
        for (const u of s) {
          var i = u.f;
          if ((i & je) !== 0)
            n(
              /** @type {Derived} */
              u
            );
          else {
            var l = (
              /** @type {Effect} */
              u
            );
            i & (mn | Mt) && !this.async_deriveds.has(l) && (this.#c.delete(l), Re(l, Le), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), he = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      Ca(t[n], this.#u, this.#c);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== Ne && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & Zt) === 0 && (this.current.set(t, [n, r]), Rt?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    he = this;
  }
  deactivate() {
    he = null, Rt = null;
  }
  flush() {
    try {
      br = !0, he = this, this.#_();
    } finally {
      Zr = 0, Cr = null, _n = null, Kn = null, br = !1, he = null, Rt = null, sn.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Nn);
    this.#v(), this.#l?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let b = _r; b !== null; b = b.#e) {
      var t = b.id < this.id, n = [];
      for (const [p, [f, h]] of this.current) {
        if (b.current.has(p)) {
          var r = (
            /** @type {[any, boolean]} */
            b.current.get(p)[0]
          );
          if (t && f !== r)
            b.current.set(p, [f, h]);
          else
            continue;
        }
        n.push(p);
      }
      if (t)
        for (const [p, f] of this.async_deriveds) {
          const h = b.async_deriveds.get(p);
          h && f.promise.then(h.resolve).catch(h.reject);
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
              b.unskip_effect(p, (f) => {
                (f.f & (Mt | mn)) !== 0 ? b.schedule(f) : b.#h([f]);
              });
          b.activate();
          var l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (var o of n)
            La(o, i, l, u);
          u = /* @__PURE__ */ new Map();
          var d = [...b.current].filter(([p, f]) => {
            const h = this.current.get(p);
            return h ? h[0] !== f[0] || h[1] !== f[1] : !0;
          }).map(([p]) => p);
          if (d.length > 0)
            for (const p of this.#p)
              (p.f & (dt | nt | er)) === 0 && jr(p, d, u) && ((p.f & (mn | Mt)) !== 0 ? (Re(p, Le), b.schedule(p)) : b.#u.add(p));
          if (b.#a.length > 0 && !b.#d) {
            b.apply();
            for (var g of b.#a)
              b.#y(g, [], []);
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
    this.#d || (this.#d = !0, qt(() => {
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
    return (this.#l ??= xa()).promise;
  }
  static ensure() {
    if (he === null) {
      const t = he = new Qt();
      br || qt(() => {
        t.#t || t.flush();
      });
    }
    return he;
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
    if (Cr = t, t.b?.is_pending && (t.f & (wn | cr | ka)) !== 0 && (t.f & Tn) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (_n !== null && n === re && (ie === null || (ie.f & je) === 0))
        return;
      if ((r & (jt | mt)) !== 0) {
        if ((r & Fe) === 0)
          return;
        n.f ^= Fe;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#i, n = this.#e;
      t === null ? _r = n : t.#e = n, n === null ? vn = t : n.#i = t, this.linked = !1;
    }
  }
}
function _i() {
  try {
    Ls();
  } catch (e) {
    Kt(e, Cr);
  }
}
let Dt = null;
function Qr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (dt | nt)) === 0 && Gn(r) && (Dt = /* @__PURE__ */ new Set(), Sn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Xa(r), Dt?.size > 0)) {
        sn.clear();
        for (const s of Dt) {
          if ((s.f & (dt | nt)) !== 0) continue;
          const i = [s];
          let l = s.parent;
          for (; l !== null; )
            Dt.has(l) && (Dt.delete(l), i.push(l)), l = l.parent;
          for (let u = i.length - 1; u >= 0; u--) {
            const o = i[u];
            (o.f & (dt | nt)) === 0 && Sn(o);
          }
        }
        Dt.clear();
      }
    }
    Dt = null;
  }
}
function La(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & je) !== 0 ? La(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (mn | Mt)) !== 0 && (i & Le) === 0 && jr(s, t, r) && (Re(s, Le), Br(
        /** @type {Effect} */
        s
      ));
    }
}
function jr(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (Qn.call(t, s))
        return !0;
      if ((s.f & je) !== 0 && jr(
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
function Br(e) {
  he.schedule(e);
}
function za(e, t) {
  if (!((e.f & mt) !== 0 && (e.f & Fe) !== 0)) {
    (e.f & Le) !== 0 ? t.d.push(e) : (e.f & Pt) !== 0 && t.m.push(e), Re(e, Fe);
    for (var n = e.first; n !== null; )
      za(n, t), n = n.next;
  }
}
function Da(e) {
  Re(e, Fe);
  for (var t = e.first; t !== null; )
    Da(t), t = t.next;
}
let rr = /* @__PURE__ */ new Set();
const sn = /* @__PURE__ */ new Map();
let qa = !1;
function cn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ta,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function G(e, t) {
  const n = cn(e);
  return Za(n), n;
}
// @__NO_SIDE_EFFECTS__
function bi(e, t = !1, n = !0) {
  const r = cn(e);
  return t || (r.equals = Ma), r;
}
function E(e, t, n = !1) {
  ie !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!At || (ie.f & er) !== 0) && Ra() && (ie.f & (je | Mt | mn | er)) !== 0 && (Lt === null || !Lt.has(e)) && Hs();
  let r = n ? ze(t) : t;
  return kn(e, r, Kn);
}
function kn(e, t, n = null) {
  if (!e.equals(t)) {
    sn.set(e, Bt ? t : e.v);
    var r = Qt.ensure();
    if (r.capture(e, t), (e.f & je) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Le) !== 0 && Hr(s), Rt === null && qr(s);
    }
    e.wv = es(), Ha(e, Le, n), re !== null && (re.f & Fe) !== 0 && (re.f & (mt | jt)) === 0 && (gt === null ? Ci([e]) : gt.push(e)), !r.is_fork && rr.size > 0 && !qa && mi();
  }
  return t;
}
function mi() {
  qa = !1;
  for (const e of rr) {
    (e.f & Fe) !== 0 && Re(e, Pt);
    let t;
    try {
      t = Gn(e);
    } catch {
      t = !0;
    }
    t && Sn(e);
  }
  rr.clear();
}
function wi(e, t = 1) {
  var n = a(e), r = t === 1 ? n++ : n--;
  return E(e, n), r;
}
function Hn(e) {
  E(e, e.v + 1);
}
function Ha(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, i = 0; i < s; i++) {
      var l = r[i], u = l.f, o = (u & Le) === 0;
      if (o && Re(l, t), (u & er) !== 0)
        rr.add(
          /** @type {Effect} */
          l
        );
      else if ((u & je) !== 0) {
        var d = (
          /** @type {Derived} */
          l
        );
        Rt?.delete(d), (u & un) === 0 && (u & bt && (re === null || (re.f & tr) === 0) && (l.f |= un), Ha(d, Pt, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (u & Mt) !== 0 && Dt !== null && Dt.add(g), n !== null ? n.push(g) : Br(g);
      }
    }
}
function ze(e) {
  if (typeof e != "object" || e === null || an in e)
    return e;
  const t = ya(e);
  if (t !== xs && t !== ks)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Dr(e), s = /* @__PURE__ */ G(0), i = on, l = (u) => {
    if (on === i)
      return u();
    var o = ie, d = on;
    wt(null), na(i);
    var g = u();
    return wt(o), na(d), g;
  };
  return r && n.set("length", /* @__PURE__ */ G(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && Ds();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var b = /* @__PURE__ */ G(d.value);
          return n.set(o, b), b;
        }) : E(g, d.value, !0), !0;
      },
      deleteProperty(u, o) {
        var d = n.get(o);
        if (d === void 0) {
          if (o in u) {
            const g = l(() => /* @__PURE__ */ G(Ne));
            n.set(o, g), Hn(s);
          }
        } else
          E(d, Ne), Hn(s);
        return !0;
      },
      get(u, o, d) {
        if (o === an)
          return e;
        var g = n.get(o), b = o in u;
        if (g === void 0 && (!b || bn(u, o)?.writable) && (g = l(() => {
          var f = ze(b ? u[o] : Ne), h = /* @__PURE__ */ G(f);
          return h;
        }), n.set(o, g)), g !== void 0) {
          var p = a(g);
          return p === Ne ? void 0 : p;
        }
        return Reflect.get(u, o, d);
      },
      getOwnPropertyDescriptor(u, o) {
        var d = Reflect.getOwnPropertyDescriptor(u, o);
        if (d && "value" in d) {
          var g = n.get(o);
          g && (d.value = a(g));
        } else if (d === void 0) {
          var b = n.get(o), p = b?.v;
          if (b !== void 0 && p !== Ne)
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
        if (o === an)
          return !0;
        var d = n.get(o), g = d !== void 0 && d.v !== Ne || Reflect.has(u, o);
        if (d !== void 0 || re !== null && (!g || bn(u, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var p = g ? ze(u[o]) : Ne, f = /* @__PURE__ */ G(p);
            return f;
          }), n.set(o, d));
          var b = a(d);
          if (b === Ne)
            return !1;
        }
        return g;
      },
      set(u, o, d, g) {
        var b = n.get(o), p = o in u;
        if (r && o === "length")
          for (var f = d; f < /** @type {Source<number>} */
          b.v; f += 1) {
            var h = n.get(f + "");
            h !== void 0 ? E(h, Ne) : f in u && (h = l(() => /* @__PURE__ */ G(Ne)), n.set(f + "", h));
          }
        if (b === void 0)
          (!p || bn(u, o)?.writable) && (b = l(() => /* @__PURE__ */ G(void 0)), E(b, ze(d)), n.set(o, b));
        else {
          p = b.v !== Ne;
          var w = l(() => ze(d));
          E(b, w);
        }
        var c = Reflect.getOwnPropertyDescriptor(u, o);
        if (c?.set && c.set.call(g, d), !p) {
          if (r && typeof o == "string") {
            var _ = (
              /** @type {Source<number>} */
              n.get("length")
            ), k = Number(o);
            Number.isInteger(k) && k >= _.v && E(_, k + 1);
          }
          Hn(s);
        }
        return !0;
      },
      ownKeys(u) {
        a(s);
        var o = Reflect.ownKeys(u).filter((b) => {
          var p = n.get(b);
          return p === void 0 || p.v !== Ne;
        });
        for (var [d, g] of n)
          g.v !== Ne && !(d in u) && o.push(d);
        return o;
      },
      setPrototypeOf() {
        qs();
      }
    }
  );
}
function ea(e) {
  try {
    if (e !== null && typeof e == "object" && an in e)
      return e[an];
  } catch {
  }
  return e;
}
function yi(e, t) {
  return Object.is(ea(e), ea(t));
}
var ar, ja, Ba, Ua;
function xi() {
  if (ar === void 0) {
    ar = window, ja = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ba = bn(t, "firstChild").get, Ua = bn(t, "nextSibling").get, Jr(e) && (e[Mr] = void 0, e[Sa] = null, e[Rr] = void 0, e.__e = void 0), Jr(n) && (n[Ar] = void 0);
  }
}
function Ht(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function sr(e) {
  return (
    /** @type {TemplateNode | null} */
    Ba.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function $n(e) {
  return (
    /** @type {TemplateNode | null} */
    Ua.call(e)
  );
}
function v(e, t) {
  return /* @__PURE__ */ sr(e);
}
function ct(e, t = !1) {
  {
    var n = /* @__PURE__ */ sr(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ $n(n) : n;
  }
}
function m(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ $n(r);
  return r;
}
function ki(e) {
  e.textContent = "";
}
function $a() {
  return !1;
}
function Si(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Ei(e) {
  re === null && (ie === null && Fs(), Ns()), Bt && Is();
}
function Ti(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Ut(e, t) {
  var n = re;
  n !== null && (n.f & nt) !== 0 && (e |= nt);
  var r = {
    ctx: Ke,
    deps: null,
    nodes: null,
    f: e | Le | bt,
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
  he?.register_created_effect(r);
  var s = r;
  if ((e & wn) !== 0)
    _n !== null ? _n.push(r) : Qt.ensure().schedule(r);
  else if (t !== null) {
    try {
      Sn(r);
    } catch (l) {
      throw lt(r), l;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & Mn) === 0 && (s = s.first, (e & Mt) !== 0 && (e & yn) !== 0 && s !== null && (s.f |= yn));
  }
  if (s !== null && (s.parent = n, n !== null && Ti(s, n), ie !== null && (ie.f & je) !== 0 && (e & jt) === 0)) {
    var i = (
      /** @type {Derived} */
      ie
    );
    (i.effects ??= []).push(s);
  }
  return r;
}
function Ur() {
  return ie !== null && !At;
}
function dr(e) {
  const t = Ut(cr, null);
  return Re(t, Fe), t.teardown = e, t;
}
function dn(e) {
  Ei();
  var t = (
    /** @type {Effect} */
    re.f
  ), n = !ie && (t & mt) !== 0 && Ke !== null && !Ke.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Ke
    );
    (r.e ??= []).push(e);
  } else
    return Ga(e);
}
function Ga(e) {
  return Ut(wn | Ts, e);
}
function Mi(e) {
  Qt.ensure();
  const t = Ut(jt | Mn, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ln(t, () => {
      lt(t), r(void 0);
    }) : (lt(t), r(void 0));
  });
}
function Ya(e) {
  return Ut(wn, e);
}
function Ri(e) {
  return Ut(mn | Mn, e);
}
function Wa(e, t = 0) {
  return Ut(cr | t, e);
}
function q(e, t = [], n = [], r = []) {
  di(r, t, n, (s) => {
    Ut(cr, () => {
      e(...s.map(a));
    });
  });
}
function $r(e, t = 0) {
  var n = Ut(Mt | t, e);
  return n;
}
function _t(e) {
  return Ut(mt | Mn, e);
}
function Va(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Bt, r = ie;
    ta(!0), wt(null);
    try {
      t.call(null);
    } finally {
      ta(n), wt(r);
    }
  }
}
function Gr(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Rn(() => {
      s.abort(Un);
    });
    var r = n.next;
    (n.f & jt) !== 0 ? n.parent = null : lt(n, t), n = r;
  }
}
function Ai(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & mt) === 0 && lt(t), t = n;
  }
}
function lt(e, t = !0) {
  var n = !1;
  (t || (e.f & Es) !== 0) && e.nodes !== null && e.nodes.end !== null && (Pi(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Tr, Gr(e, t && !n), Bn(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  Va(e), e.f ^= Tr, e.f |= dt;
  var s = e.parent;
  s !== null && s.first !== null && Xa(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Pi(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ $n(e);
    e.remove(), e = n;
  }
}
function Xa(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ln(e, t, n = !0) {
  var r = [];
  Ka(e, r, !0);
  var s = () => {
    n && lt(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var l = () => --i || s();
    for (var u of r)
      u.out(l);
  } else
    s();
}
function Ka(e, t, n) {
  if ((e.f & nt) === 0) {
    e.f ^= nt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var s = e.first; s !== null; ) {
      var i = s.next;
      if ((s.f & jt) === 0) {
        var l = (s.f & yn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (s.f & mt) !== 0 && (e.f & Mt) !== 0;
        Ka(s, t, l ? n : !1);
      }
      s = i;
    }
  }
}
function ir(e) {
  Ja(e, !0);
}
function Ja(e, t) {
  if ((e.f & nt) !== 0) {
    e.f ^= nt, (e.f & Fe) === 0 && (Re(e, Le), Qt.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & yn) !== 0 || (n.f & mt) !== 0;
      Ja(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function Yr(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ $n(n);
      t.append(n), n = s;
    }
}
let Jn = !1, Bt = !1;
function ta(e) {
  Bt = e;
}
let ie = null, At = !1;
function wt(e) {
  ie = e;
}
let re = null;
function zt(e) {
  re = e;
}
let Lt = null;
function Za(e) {
  ie !== null && (Lt ??= /* @__PURE__ */ new Set()).add(e);
}
let it = null, ut = 0, gt = null;
function Ci(e) {
  gt = e;
}
let Qa = 1, rn = 0, on = rn;
function na(e) {
  on = e;
}
function es() {
  return ++Qa;
}
function Gn(e) {
  var t = e.f;
  if ((t & Le) !== 0)
    return !0;
  if (t & je && (e.f &= ~un), (t & Pt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (Gn(
        /** @type {Derived} */
        i
      ) && Na(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & bt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Rt === null && Re(e, Fe);
  }
  return !1;
}
function ts(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Lt !== null && Lt.has(e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & je) !== 0 ? ts(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Re(i, Le) : (i.f & Fe) !== 0 && Re(i, Pt), Br(
        /** @type {Effect} */
        i
      ));
    }
}
function ns(e) {
  var t = it, n = ut, r = gt, s = ie, i = Lt, l = Ke, u = At, o = on, d = e.f;
  it = /** @type {null | Value[]} */
  null, ut = 0, gt = null, ie = (d & (mt | jt)) === 0 ? e : null, Lt = null, xn(e.ctx), At = !1, on = ++rn, e.ac !== null && (Rn(() => {
    e.ac.abort(Un);
  }), e.ac = null);
  try {
    e.f |= tr;
    var g = (
      /** @type {Function} */
      e.fn
    ), b = g();
    e.f |= Tn;
    var p = e.deps, f = he?.is_fork;
    if (it !== null) {
      var h;
      if (f || Bn(e, ut), p !== null && ut > 0)
        for (p.length = ut + it.length, h = 0; h < it.length; h++)
          p[ut + h] = it[h];
      else
        e.deps = p = it;
      if (Ur() && (e.f & bt) !== 0)
        for (h = ut; h < p.length; h++)
          (p[h].reactions ??= []).push(e);
    } else !f && p !== null && ut < p.length && (Bn(e, ut), p.length = ut);
    if (Ra() && gt !== null && !At && p !== null && (e.f & (je | Pt | Le)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      gt.length; h++)
        ts(
          gt[h],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (rn++, s.deps !== null)
        for (let w = 0; w < n; w += 1)
          s.deps[w].rv = rn;
      if (t !== null)
        for (const w of t)
          w.rv = rn;
      gt !== null && (r === null ? r = gt : r.push(.../** @type {Source[]} */
      gt));
    }
    return (e.f & Zt) !== 0 && (e.f ^= Zt), b;
  } catch (w) {
    return Aa(w);
  } finally {
    e.f ^= tr, it = t, ut = n, gt = r, ie = s, Lt = i, xn(l), At = u, on = o;
  }
}
function Oi(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = ms.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & je) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (it === null || !Qn.call(it, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & bt) !== 0 && (i.f ^= bt, i.f &= ~un), i.v !== Ne && qr(i), i.ac !== null && Rn(() => {
      i.ac.abort(Un), i.ac = null, Re(i, Le);
    }), pi(i), Bn(i, 0);
  }
}
function Bn(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Oi(e, n[r]);
}
function Sn(e) {
  var t = e.f;
  if ((t & dt) === 0) {
    Re(e, Fe);
    var n = re, r = Jn;
    re = e, Jn = (t & (mt | jt)) === 0;
    try {
      (t & (Mt | ka)) !== 0 ? Ai(e) : Gr(e), Va(e);
      var s = ns(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Qa;
      var i;
    } finally {
      Jn = r, re = n;
    }
  }
}
function a(e) {
  var t = e.f, n = (t & je) !== 0;
  if (ie !== null && !At) {
    var r = re !== null && (re.f & dt) !== 0;
    if (!r && (Lt === null || !Lt.has(e))) {
      var s = ie.deps;
      if ((ie.f & tr) !== 0)
        e.rv < rn && (e.rv = rn, it === null && s !== null && s[ut] === e ? ut++ : it === null ? it = [e] : it.push(e));
      else {
        ie.deps ??= [], Qn.call(ie.deps, e) || ie.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [ie] : Qn.call(i, ie) || i.push(ie);
      }
    }
  }
  if (Bt && sn.has(e))
    return sn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Bt) {
      var u = l.v;
      return ((l.f & Fe) === 0 && l.reactions !== null || as(l)) && (u = Hr(l)), sn.set(l, u), u;
    }
    var o = (l.f & bt) === 0 && !At && ie !== null && (Jn || (ie.f & bt) !== 0), d = (l.f & Tn) === 0;
    Gn(l) && (o && (l.f |= bt), Na(l)), o && !d && (Fa(l), rs(l));
  }
  if (Rt?.has(e))
    return Rt.get(e);
  if ((e.f & Zt) !== 0)
    throw e.v;
  return e.v;
}
function rs(e) {
  if (e.f |= bt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & je) !== 0 && (t.f & bt) === 0 && (Fa(
        /** @type {Derived} */
        t
      ), rs(
        /** @type {Derived} */
        t
      ));
}
function as(e) {
  if (e.v === Ne) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (sn.has(t) || (t.f & je) !== 0 && as(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function fn(e) {
  var t = At;
  try {
    return At = !0, e();
  } finally {
    At = t;
  }
}
const Ii = ["touchstart", "touchmove"];
function Ni(e) {
  return Ii.includes(e);
}
const Fn = Symbol("events"), ss = /* @__PURE__ */ new Set(), Or = /* @__PURE__ */ new Set();
function Fi(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || Ir.call(t, i), !i.cancelBubble)
      return Rn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? qt(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function ra(e, t, n, r, s) {
  var i = { capture: r, passive: s }, l = Fi(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && dr(() => {
    t.removeEventListener(e, l, i);
  });
}
function X(e, t, n) {
  (t[Fn] ??= {})[e] = n;
}
function $t(e) {
  for (var t = 0; t < e.length; t++)
    ss.add(e[t]);
  for (var n of Or)
    n(e);
}
let aa = null;
function Ir(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  aa = e;
  var l = 0, u = aa === e && e[Fn];
  if (u) {
    var o = s.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Fn] = t;
      return;
    }
    var d = s.indexOf(t);
    if (d === -1)
      return;
    o <= d && (l = o);
  }
  if (i = /** @type {Element} */
  s[l] || e.target, i !== t) {
    ws(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = ie, b = re;
    wt(null), zt(null);
    try {
      for (var p, f = []; i !== null && i !== t; ) {
        try {
          var h = i[Fn]?.[r];
          h != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && h.call(i, e);
        } catch (w) {
          p ? f.push(w) : p = w;
        }
        if (e.cancelBubble) break;
        l++, i = l < s.length ? (
          /** @type {Element} */
          s[l]
        ) : null;
      }
      if (p) {
        for (let w of f)
          queueMicrotask(() => {
            throw w;
          });
        throw p;
      }
    } finally {
      e[Fn] = t, delete e.currentTarget, wt(g), zt(b);
    }
  }
}
const Li = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function zi(e) {
  return (
    /** @type {string} */
    Li?.createHTML(e) ?? e
  );
}
function Di(e) {
  var t = Si("template");
  return t.innerHTML = zi(e.replaceAll("<!>", "<!---->")), t.content;
}
function lr(e, t) {
  var n = (
    /** @type {Effect} */
    re
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var n = (t & Ks) !== 0, r = (t & Js) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = Di(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ sr(s)));
    var l = (
      /** @type {TemplateNode} */
      r || ja ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ sr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      lr(u, o);
    } else
      lr(l, l);
    return l;
  };
}
function sa(e = "") {
  {
    var t = Ht(e + "");
    return lr(t, t), t;
  }
}
function Wr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Ht();
  return e.append(t, n), lr(t, n), e;
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
  (e[Ar] ??= e.nodeValue) && (e[Ar] = n, e.nodeValue = `${n}`);
}
function qi(e, t) {
  return Hi(e, t);
}
const Wn = /* @__PURE__ */ new Map();
function Hi(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: l = !0, transformError: u }) {
  xi();
  var o = void 0, d = Mi(() => {
    var g = n ?? t.appendChild(Ht());
    ui(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (f) => {
        Ct({});
        var h = (
          /** @type {ComponentContext} */
          Ke
        );
        i && (h.c = i), s && (r.$$events = s), o = e(f, r) || {}, Ot();
      },
      u
    );
    var b = /* @__PURE__ */ new Set(), p = (f) => {
      for (var h = 0; h < f.length; h++) {
        var w = f[h];
        if (!b.has(w)) {
          b.add(w);
          var c = Ni(w);
          for (const P of [t, document]) {
            var _ = Wn.get(P);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), Wn.set(P, _));
            var k = _.get(w);
            k === void 0 ? (P.addEventListener(w, Ir, { passive: c }), _.set(w, 1)) : _.set(w, k + 1);
          }
        }
      }
    };
    return p(ur(ss)), Or.add(p), () => {
      for (var f of b)
        for (const c of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Wn.get(c)
          ), w = (
            /** @type {number} */
            h.get(f)
          );
          --w == 0 ? (c.removeEventListener(f, Ir), h.delete(f), h.size === 0 && Wn.delete(c)) : h.set(f, w);
        }
      Or.delete(p), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return ji.set(o, d), o;
}
let ji = /* @__PURE__ */ new WeakMap();
class Bi {
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
        ir(r), this.#o.delete(n);
      else {
        var s = this.#e.get(n);
        s && (ir(s.effect), this.#i.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
      }
      for (const [i, l] of this.#t) {
        if (this.#t.delete(i), i === t)
          break;
        const u = this.#e.get(l);
        u && (lt(u.effect), this.#e.delete(l));
      }
      for (const [i, l] of this.#i) {
        if (i === n || this.#o.has(i)) continue;
        const u = () => {
          if (Array.from(this.#t.values()).includes(i)) {
            var d = document.createDocumentFragment();
            Yr(l, d), d.append(Ht()), this.#e.set(i, { effect: l, fragment: d });
          } else
            lt(l);
          this.#o.delete(i), this.#i.delete(i);
        };
        this.#r || !r ? (this.#o.add(i), ln(l, u, !1)) : u();
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
      n.includes(r) || (lt(s.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      he
    ), s = $a();
    if (n && !this.#i.has(t) && !this.#e.has(t))
      if (s) {
        var i = document.createDocumentFragment(), l = Ht();
        i.append(l), this.#e.set(t, {
          effect: _t(() => n(l)),
          fragment: i
        });
      } else
        this.#i.set(
          t,
          _t(() => n(this.anchor))
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
function Y(e, t, n = !1) {
  var r = new Bi(e), s = n ? yn : 0;
  function i(l, u) {
    r.ensure(l, u);
  }
  $r(() => {
    var l = !1;
    t((u, o = 0) => {
      l = !0, i(o, u);
    }), l || i(-1, null);
  }, s);
}
function Tt(e, t) {
  return t;
}
function Ui(e, t, n) {
  for (var r = [], s = t.length, i, l = t.length, u = 0; u < s; u++) {
    let b = t[u];
    ln(
      b,
      () => {
        if (i) {
          if (i.pending.delete(b), i.done.add(b), i.pending.size === 0) {
            var p = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Nr(e, ur(i.done)), p.delete(i), p.size === 0 && (e.outrogroups = null);
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
      ki(g), g.append(d), e.items.clear();
    }
    Nr(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function Nr(e, t, n = !0) {
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
      i.f |= Ft;
      const l = document.createDocumentFragment();
      Yr(i, l);
    } else
      lt(t[s], n);
  }
}
var ia;
function tt(e, t, n, r, s, i = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & Ea) !== 0;
  if (o) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild(Ht());
  }
  var g = null, b = /* @__PURE__ */ Ia(() => {
    var P = n();
    return (
      /** @type {V[]} */
      Dr(P) ? P : P == null ? [] : ur(P)
    );
  }), p, f = /* @__PURE__ */ new Map(), h = !0;
  function w(P) {
    (k.effect.f & dt) === 0 && (k.pending.delete(P), k.fallback = g, $i(k, p, l, t, r), g !== null && (p.length === 0 ? (g.f & Ft) === 0 ? ir(g) : (g.f ^= Ft, Ln(g, null, l)) : ln(g, () => {
      g = null;
    })));
  }
  function c(P) {
    k.pending.delete(P);
  }
  var _ = $r(() => {
    p = /** @type {V[]} */
    a(b);
    for (var P = p.length, O = /* @__PURE__ */ new Set(), T = (
      /** @type {Batch} */
      he
    ), N = $a(), U = 0; U < P; U += 1) {
      var j = p[U], R = r(j, U), L = h ? null : u.get(R);
      L ? (L.v && kn(L.v, j), L.i && kn(L.i, U), N && T.unskip_effect(L.e)) : (L = Gi(
        u,
        h ? l : ia ??= Ht(),
        j,
        R,
        U,
        s,
        t,
        n
      ), h || (L.e.f |= Ft), u.set(R, L)), O.add(R);
    }
    if (P === 0 && i && !g && (h ? g = _t(() => i(l)) : (g = _t(() => i(ia ??= Ht())), g.f |= Ft)), P > O.size && Os(), !h)
      if (f.set(T, O), N) {
        for (const [B, z] of u)
          O.has(B) || T.skip_effect(z.e);
        T.oncommit(w), T.ondiscard(c);
      } else
        w(T);
    a(b);
  }), k = { effect: _, items: u, pending: f, outrogroups: null, fallback: g };
  h = !1;
}
function Pn(e) {
  for (; e !== null && (e.f & mt) === 0; )
    e = e.next;
  return e;
}
function $i(e, t, n, r, s) {
  var i = (r & $s) !== 0, l = t.length, u = e.items, o = Pn(e.effect.first), d, g = null, b, p = [], f = [], h, w, c, _;
  if (i)
    for (_ = 0; _ < l; _ += 1)
      h = t[_], w = s(h, _), c = /** @type {EachItem} */
      u.get(w).e, (c.f & Ft) === 0 && (c.nodes?.a?.measure(), (b ??= /* @__PURE__ */ new Set()).add(c));
  for (_ = 0; _ < l; _ += 1) {
    if (h = t[_], w = s(h, _), c = /** @type {EachItem} */
    u.get(w).e, e.outrogroups !== null)
      for (const L of e.outrogroups)
        L.pending.delete(c), L.done.delete(c);
    if ((c.f & nt) !== 0 && (ir(c), i && (c.nodes?.a?.unfix(), (b ??= /* @__PURE__ */ new Set()).delete(c))), (c.f & Ft) !== 0)
      if (c.f ^= Ft, c === o)
        Ln(c, null, n);
      else {
        var k = g ? g.next : o;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), Vt(e, g, c), Vt(e, c, k), Ln(c, k, n), g = c, p = [], f = [], o = Pn(g.next);
        continue;
      }
    if (c !== o) {
      if (d !== void 0 && d.has(c)) {
        if (p.length < f.length) {
          var P = f[0], O;
          g = P.prev;
          var T = p[0], N = p[p.length - 1];
          for (O = 0; O < p.length; O += 1)
            Ln(p[O], P, n);
          for (O = 0; O < f.length; O += 1)
            d.delete(f[O]);
          Vt(e, T.prev, N.next), Vt(e, g, T), Vt(e, N, P), o = P, g = N, _ -= 1, p = [], f = [];
        } else
          d.delete(c), Ln(c, o, n), Vt(e, c.prev, c.next), Vt(e, c, g === null ? e.effect.first : g.next), Vt(e, g, c), g = c;
        continue;
      }
      for (p = [], f = []; o !== null && o !== c; )
        (d ??= /* @__PURE__ */ new Set()).add(o), f.push(o), o = Pn(o.next);
      if (o === null)
        continue;
    }
    (c.f & Ft) === 0 && p.push(c), g = c, o = Pn(c.next);
  }
  if (e.outrogroups !== null) {
    for (const L of e.outrogroups)
      L.pending.size === 0 && (Nr(e, ur(L.done)), e.outrogroups?.delete(L));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || d !== void 0) {
    var U = [];
    if (d !== void 0)
      for (c of d)
        (c.f & nt) === 0 && U.push(c);
    for (; o !== null; )
      (o.f & nt) === 0 && o !== e.fallback && U.push(o), o = Pn(o.next);
    var j = U.length;
    if (j > 0) {
      var R = (r & Ea) !== 0 && l === 0 ? n : null;
      if (i) {
        for (_ = 0; _ < j; _ += 1)
          U[_].nodes?.a?.measure();
        for (_ = 0; _ < j; _ += 1)
          U[_].nodes?.a?.fix();
      }
      Ui(e, U, R);
    }
  }
  i && qt(() => {
    if (b !== void 0)
      for (c of b)
        c.nodes?.a?.apply();
  });
}
function Gi(e, t, n, r, s, i, l, u) {
  var o = (l & Bs) !== 0 ? (l & Gs) === 0 ? /* @__PURE__ */ bi(n, !1, !1) : cn(n) : null, d = (l & Us) !== 0 ? cn(s) : null;
  return {
    v: o,
    i: d,
    e: _t(() => (i(t, o ?? n, d ?? s, u), () => {
      e.delete(r);
    }))
  };
}
function Ln(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & Ft) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ $n(r)
      );
      if (i.before(r), r === s)
        return;
      r = l;
    }
}
function Vt(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Cn(e, t, n) {
  Ya(() => {
    var r = fn(() => t(e, n?.()) || {});
    if (r?.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
const la = [...` 	
\r\f \v\uFEFF`];
function Yi(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s of Object.keys(n))
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var i = s.length, l = 0; (l = r.indexOf(s, l)) >= 0; ) {
          var u = l + i;
          (l === 0 || la.includes(r[l - 1])) && (u === r.length || la.includes(r[u])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(u + 1) : l = u;
        }
  }
  return r === "" ? null : r;
}
function oa(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var s of Object.keys(e)) {
    var i = e[s];
    i != null && i !== "" && (r += " " + s + ": " + i + n);
  }
  return r;
}
function Wi(e, t) {
  if (t) {
    var n = "", r, s;
    return Array.isArray(t) ? (r = t[0], s = t[1]) : r = t, r && (n += oa(r)), s && (n += oa(s, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Ae(e, t, n, r, s, i) {
  var l = (
    /** @type {any} */
    e[Mr]
  );
  if (l !== n || l === void 0) {
    var u = Yi(n, r, i);
    u == null ? e.removeAttribute("class") : e.className = u, e[Mr] = n;
  } else if (i && s !== i)
    for (var o in i) {
      var d = !!i[o];
      (s == null || d !== !!s[o]) && e.classList.toggle(o, d);
    }
  return i;
}
function mr(e, t = {}, n, r) {
  for (var s in n) {
    var i = n[s];
    t[s] !== i && (n[s] == null ? e.style.removeProperty(s) : e.style.setProperty(s, i, r));
  }
}
function zn(e, t, n, r) {
  var s = (
    /** @type {any} */
    e[Rr]
  );
  if (s !== t) {
    var i = Wi(t, r);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[Rr] = t;
  } else r && (Array.isArray(r) ? (mr(e, n?.[0], r[0]), mr(e, n?.[1], r[1], "important")) : mr(e, n, r));
  return r;
}
function Dn(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Dr(t))
      return ei();
    for (var r of e.options)
      r.selected = t.includes(ua(r));
    return;
  }
  for (r of e.options) {
    var s = ua(r);
    if (yi(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Vn(e) {
  var t = new MutationObserver(() => {
    "__value" in e && Dn(e, e.__value);
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
  }), dr(() => {
    t.disconnect();
  });
}
function ua(e) {
  return "__value" in e ? e.__value : e.value;
}
const Vi = Symbol("is custom element"), Xi = Symbol("is html"), Ki = As ? "progress" : "PROGRESS";
function tn(e, t) {
  var n = Vr(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== Ki) || (e.value = t ?? "");
}
function Ji(e, t) {
  var n = Vr(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function se(e, t, n, r) {
  var s = Vr(e);
  s[t] !== (s[t] = n) && (t === "loading" && (e[Rs] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Zi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Vr(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[Sa] ??= {
      [Vi]: e.nodeName.includes("-"),
      [Xi]: e.namespaceURI === Zs
    }
  );
}
var ca = /* @__PURE__ */ new Map();
function Zi(e) {
  var t = e.getAttribute("is") || e.nodeName, n = ca.get(t);
  if (n) return n;
  ca.set(t, n = []);
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = ys(s);
    for (var l in r)
      r[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    s = ya(s);
  }
  return n;
}
function wr(e, t) {
  return e === t || e?.[an] === t;
}
function Fr(e = {}, t, n, r) {
  var s = (
    /** @type {ComponentContext} */
    Ke.r
  ), i = (
    /** @type {Effect} */
    re
  );
  return Ya(() => {
    var l, u;
    return Wa(() => {
      l = u, u = [], fn(() => {
        wr(n(...u), e) || (t(e, ...u), l && wr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== s && o.parent !== null && o.parent.f & Tr; )
        o = o.parent;
      const d = () => {
        u && wr(n(...u), e) && t(null, ...u);
      }, g = o.teardown;
      o.teardown = () => {
        d(), g?.();
      };
    };
  }), e;
}
function Qi(e, t) {
  ii(window, ["resize"], () => Rn(() => t(window[e])));
}
function Q(e, t, n, r) {
  var s = !0, i = (n & Vs) !== 0, l = (n & Xs) !== 0, u = (
    /** @type {V} */
    r
  ), o = !0, d = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && s ? (d ??= /* @__PURE__ */ jn(
    /** @type {() => V} */
    r
  ), a(d)) : (o && (o = !1, u = l ? fn(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), u);
  let b;
  if (i) {
    var p = an in e || Ms in e;
    b = bn(e, t)?.set ?? (p && t in e ? (O) => e[t] = O : void 0);
  }
  var f, h = !1;
  i ? [f, h] = si(() => (
    /** @type {V} */
    e[t]
  )) : f = /** @type {V} */
  e[t], f === void 0 && r !== void 0 && (f = g(), b && (zs(), b(f)));
  var w;
  if (w = () => {
    var O = (
      /** @type {V} */
      e[t]
    );
    return O === void 0 ? g() : (o = !0, O);
  }, (n & Ws) === 0)
    return w;
  if (b) {
    var c = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(O, T) {
        return arguments.length > 0 ? ((!T || c || h) && b(T ? w() : O), O) : w();
      })
    );
  }
  var _ = !1, k = ((n & Ys) !== 0 ? jn : Ia)(() => (_ = !1, w()));
  i && a(k);
  var P = (
    /** @type {Effect} */
    re
  );
  return (
    /** @type {() => V} */
    (function(O, T) {
      if (arguments.length > 0) {
        const N = T ? a(k) : i ? ze(O) : O;
        return E(k, N), _ = !0, u !== void 0 && (u = N), O;
      }
      return Bt && _ || (P.f & dt) !== 0 ? k.v : a(k);
    })
  );
}
function fr(e) {
  Ke === null && Ps(), dn(() => {
    const t = fn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const el = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(el);
function tl(e) {
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
async function Xt(e, t = {}) {
  const n = await fetch(e + tl(t));
  if (!n.ok) {
    const r = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  }
  return n.json();
}
async function pn(e, t) {
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
function da(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const Xe = {
  // --- reads
  photos: (e) => Xt("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => Xt("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => Xt("/api/triage/counts", { ...da(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Xt("/api/triage/files"),
  screen: (e, t = {}) => Xt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Xt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Xt("/api/triage/page", { ...da(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Xt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => pn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => pn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => pn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => pn("/api/triage/override", { sha256: e, decision: t }),
  // --- the one surface that leaves the process
  revealPhoto: (e) => pn("/api/reveal", { id: e }),
  revealOrigin: (e) => pn("/api/reveal", { origin: e })
};
function nl() {
  let e = 0, t = 0;
  return async function(r) {
    const s = ++e, i = await r();
    return s <= t ? { stale: !0, value: void 0 } : (t = s, { stale: !1, value: i });
  };
}
function rl(e, t) {
  let n = 0;
  const r = (...s) => {
    clearTimeout(n), n = setTimeout(() => e(...s), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...s) => {
    clearTimeout(n), e(...s);
  }, r;
}
const fa = ["B", "KB", "MB", "GB", "TB"];
function St(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < fa.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${fa[n]}`;
}
function Ee(e) {
  return (Number(e) || 0).toLocaleString();
}
const En = "G:\\photos", ha = [
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
      value: t ? `${En}\\${t}\\${e.key}` : `${En}\\${e.key}`
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
function is(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), r = En.toLowerCase();
  return n.toLowerCase().startsWith(r + "\\") ? n : "";
}
function Xr(e, t) {
  const n = t.toLowerCase();
  return e.some((r) => n === r || n.startsWith(r + "\\"));
}
function al(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function sl(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function ls(e, t) {
  if (!t) return null;
  const n = e.find(
    (r) => r.term && r.term.column === t.column && r.term.op === t.op && sl(r.term.value, t.value)
  );
  return n ? n.decision : null;
}
var il = /* @__PURE__ */ I('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), ll = /* @__PURE__ */ I('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), ol = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7">…</div>'), ul = /* @__PURE__ */ I('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), cl = /* @__PURE__ */ I('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), dl = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7"> </div>'), fl = /* @__PURE__ */ I('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function hl(e, t) {
  Ct(t, !0);
  let n = Q(t, "counts", 3, null), r = Q(t, "files", 3, null), s = Q(t, "filesAt", 3, null), i = Q(t, "stale", 3, !1), l = Q(t, "candidate", 3, null), u = Q(t, "busy", 3, !1);
  const o = /* @__PURE__ */ te(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = fl(), g = v(d);
  let b;
  var p = m(v(g), 2);
  {
    var f = (R) => {
      var L = ll(), B = ct(L), z = v(B), W = v(z), ue = m(z, 2), K = v(ue), Z = m(ue, 4), le = v(Z), _e = m(Z, 2), ee = v(_e), pe = m(B, 2);
      {
        var D = (V) => {
          var y = il(), x = m(v(y), 2), F = v(x), ae = m(x, 2), me = v(ae), ce = m(ae, 4), de = v(ce), qe = m(ce, 2), we = v(qe), Te = m(qe, 2), Ye = v(Te);
          q(
            (Je, yt, Be, ye, Se) => {
              M(F, `kept ${Je ?? ""}`), M(me, yt), M(de, `excluded ${Be ?? ""}`), M(we, ye), M(Ye, `${a(o) >= 0 ? "+" : ""}${Se ?? ""} excluded`);
            },
            [
              () => Ee(n().candidate_kept_paths),
              () => St(n().candidate_kept_bytes),
              () => Ee(n().candidate_excluded_paths),
              () => St(n().candidate_excluded_bytes),
              () => Ee(a(o))
            ]
          ), A(V, y);
        };
        Y(pe, (V) => {
          l() && V(D);
        });
      }
      q(
        (V, y, x, F) => {
          M(W, `kept ${V ?? ""}`), M(K, y), M(le, `excluded ${x ?? ""}`), M(ee, F);
        },
        [
          () => Ee(n().kept_paths),
          () => St(n().kept_bytes),
          () => Ee(n().excluded_paths),
          () => St(n().excluded_bytes)
        ]
      ), A(R, L);
    }, h = (R) => {
      var L = ol();
      A(R, L);
    };
    Y(p, (R) => {
      n() ? R(f) : R(h, -1);
    });
  }
  var w = m(g, 2);
  let c;
  var _ = v(w), k = m(v(_), 3), P = v(k), O = m(k, 2);
  {
    var T = (R) => {
      var L = ul();
      A(R, L);
    };
    Y(O, (R) => {
      i() && r() && r() !== "loading" && R(T);
    });
  }
  var N = m(_, 2);
  {
    var U = (R) => {
      var L = cl(), B = ct(L);
      let z;
      var W = v(B), ue = v(W), K = m(W, 2), Z = v(K), le = m(K, 4), _e = v(le), ee = m(le, 2), pe = v(ee), D = m(B, 2), V = v(D);
      q(
        (y, x, F, ae) => {
          z = Ae(B, 1, "line svelte-1vgp6n7", null, z, { outdated: i() }), M(ue, `kept ${y ?? ""}`), M(Z, x), M(_e, `excluded ${F ?? ""}`), M(pe, ae), M(V, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Ee(r().kept_files),
          () => St(r().kept_bytes),
          () => Ee(r().excluded_files),
          () => St(r().excluded_bytes)
        ]
      ), A(R, L);
    }, j = (R) => {
      var L = dl(), B = v(L);
      q(() => M(B, r() === "loading" ? "counting…" : "not counted yet")), A(R, L);
    };
    Y(N, (R) => {
      r() && r() !== "loading" ? R(U) : R(j, -1);
    });
  }
  q(() => {
    b = Ae(g, 1, "block svelte-1vgp6n7", null, b, { busy: u() }), c = Ae(w, 1, "block svelte-1vgp6n7", null, c, { busy: r() === "loading" }), k.disabled = r() === "loading", M(P, r() === "loading" ? "counting…" : "recount");
  }), X("click", k, function(...R) {
    t.onfiles?.apply(this, R);
  }), A(e, d), Ot();
}
$t(["click"]);
const Lr = "http://www.w3.org/2000/svg", nn = {
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
}, Jt = {
  ...nn,
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
}, vl = [
  { dark: "tint", light: "tintLight", base: nn },
  { dark: "control", light: "controlLight", base: Jt },
  { dark: "ink", light: "inkLight", base: Jt },
  { dark: "tally", light: "tallyLight", base: Jt },
  { dark: "tallyInk", light: "tallyInkLight", base: Jt }
], zr = /* @__PURE__ */ new Set();
let Et = { ...Jt };
function pl() {
  return Et;
}
function yr(e) {
  Et = bl(e), Kr();
  for (const t of zr) t(Et);
  return Et;
}
function gl(e) {
  return zr.add(e), () => zr.delete(e);
}
function qn(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function _l(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: De(qn(e.r, t.r), 0, 255),
    g: De(qn(e.g, t.g), 0, 255),
    b: De(qn(e.b, t.b), 0, 255),
    a: De(qn(e.a, t.a), 0, 1)
  };
}
function bl(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [r, s] of Object.entries(Jt))
    typeof s == "boolean" ? n[r] = t[r] === void 0 ? s : !!t[r] : typeof s == "object" ? n[r] = _l(t[r], s) : n[r] = qn(t[r], s);
  return n;
}
function pt({ r: e, g: t, b: n, a: r }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Me(r, 3)})`;
}
function Me(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function va({ r: e, g: t, b: n, a: r }) {
  return { r: e, g: t, b: n, a: De(r * 1.7 + 0.22, 0, 1) };
}
function pa(e, t) {
  const n = 0.4 + De(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - De(t, 0, 100) / 100) };
}
function ga(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, s = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? De(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * s * Math.max(t.glareFactor, 0) / 100;
  return De(i ** (0.1 + De(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const ml = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function wl(e, t, n) {
  const r = De(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), u = s - l, o = i - l, d = 8, g = [];
  for (let f = 0; f <= d; f++) {
    const h = f / d * (Math.PI / 2);
    g.push([l * Math.cos(h) ** (2 / r), l * Math.sin(h) ** (2 / r)]);
  }
  const b = [], p = (f, h, w, c) => {
    let _ = Math.atan2(f, -h);
    _ < 0 && (_ += Math.PI * 2);
    let k = Math.atan2(c, w);
    k < 0 && (k += Math.PI * 2);
    const P = Me(ga(k, n), 3);
    b.push(`rgba(255, 255, 255, ${P}) ${Me(_ / (Math.PI * 2) * 100, 2)}%`);
  };
  p(0, -i, 0, 1);
  for (const [f, h, w] of ml)
    for (let c = 0; c <= d; c++) {
      const [_, k] = g[w ? d - c : c];
      p(f * (u + _), h * (o + k), f * _ ** (r - 1), -h * k ** (r - 1));
    }
  return b.push(`rgba(255, 255, 255, ${Me(ga(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${b.join(", ")})`;
}
function Kr() {
  const e = Et, t = document.documentElement.style, n = pa(e.refFresnelRange, e.refFresnelHardness), r = pa(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Me(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Me(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", pt(e.tint)), t.setProperty("--glass-tint-light", pt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", pt(va(e.tint))), t.setProperty("--glass-tint-sheet-light", pt(va(e.tintLight))), t.setProperty("--glass-ctl-dark", pt(e.control)), t.setProperty("--glass-ctl-light", pt(e.controlLight)), t.setProperty("--glass-text-dark", pt(e.ink)), t.setProperty("--glass-text-light", pt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", pt(e.tally)), t.setProperty("--glass-tint-tally-light", pt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", pt(e.tallyInk)), t.setProperty("--glass-text-tally-light", pt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Me(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Me(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Me(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Me(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Me(e.shadowX)}px ${Me(-e.shadowY)}px ${Me(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Me(De(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Me(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Me(Math.log2(De(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Me(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Me(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Me(De(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Me(r.width)}px`), t.setProperty("--glass-glare-blur", `${Me(r.blur)}px`);
}
function De(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function yl(e, t, n, r, s, i) {
  const l = Math.abs(e) - n + s, u = Math.abs(t) - r + s, o = Math.max(l, 0), d = Math.max(u, 0), g = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + g - s;
}
function xl(e, t, n) {
  const r = e / 2, s = t / 2, i = De(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (p, f) => yl(p - r, f - s, r, s, l, i), g = 256, b = new Float32Array(g + 1);
  for (let p = 0; p <= g; p++) {
    const f = 1 - p / g, h = Math.asin(De(f * f, 0, 1)), w = Math.asin(De(Math.sin(h) / o, 0, 1));
    b[p] = Math.tan(h - w) * u;
  }
  return (p, f) => {
    const h = -d(p, f);
    if (h < 0 || h >= u) return null;
    const w = b[Math.round(h / u * g)];
    if (w === 0) return null;
    const c = 0.75, _ = d(p + c, f) - d(p - c, f), k = d(p, f + c) - d(p, f - c), P = Math.hypot(_, k);
    if (P === 0) return null;
    const O = -w / P;
    return { dx: _ * O, dy: k * O };
  };
}
function kl(e, t, n) {
  const r = document.createElement("canvas");
  r.width = e, r.height = t;
  const s = r.getContext("2d"), i = s.createImageData(e, t), l = i.data, u = e * t, o = new Float32Array(u), d = new Float32Array(u);
  let g = 0;
  for (let p = 0; p < t; p++)
    for (let f = 0; f < e; f++) {
      const h = n(f + 0.5, p + 0.5);
      if (!h) continue;
      const w = p * e + f;
      o[w] = h.dx, d[w] = h.dy;
      const c = Math.hypot(h.dx, h.dy);
      c > g && (g = c);
    }
  const b = g > 0 ? 127 / g : 0;
  for (let p = 0; p < u; p++) {
    const f = p * 4;
    l[f] = 128 + De(Math.round(o[p] * b), -127, 127), l[f + 1] = 128 + De(Math.round(d[p] * b), -127, 127), l[f + 2] = 128, l[f + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: r.toDataURL(), scale: g * 2 };
}
const xr = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function kr(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Me(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let On = null, Sl = 0;
function El() {
  if (On) return On;
  const e = document.createElementNS(Lr, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), On = document.createElementNS(Lr, "defs"), e.appendChild(On), document.body.appendChild(e), On;
}
function In(e) {
  const t = `glass-refract-${++Sl}`, n = document.createElementNS(Lr, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), El().appendChild(n);
  let r = 0, s = 0, i = 0, l = 0;
  const u = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, d = "";
  function g() {
    e.style.setProperty("--glass-pre", Et.blurEdge ? "" : d), e.style.setProperty("--glass-post", Et.blurEdge ? d : "");
  }
  function b() {
    r < 2 || s < 2 || e.style.setProperty("--glass-glare", wl(r, s, Et));
  }
  function p() {
    if (r < 2 || s < 2) return;
    const c = Et, _ = kl(r, s, xl(r, s, c)), k = c.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(r)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${r}" height="${s}" preserveAspectRatio="none" href="${_.url}" result="map"/>` + kr(_.scale * (1 + k), xr[0], "r") + kr(_.scale, xr[1], "g") + kr(_.scale * (1 - k), xr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", g()), o = u.map((P) => Et[P]).join(" ");
  }
  function f() {
    l || (l = requestAnimationFrame(() => {
      l = 0, p();
    }));
  }
  const h = new ResizeObserver(([c]) => {
    const _ = c.borderBoxSize?.[0], k = _ ? { w: Math.round(_.inlineSize), h: Math.round(_.blockSize) } : { w: Math.round(c.contentRect.width), h: Math.round(c.contentRect.height) };
    k.w === r && k.h === s || (r = k.w, s = k.h, b(), f());
  });
  h.observe(e);
  const w = gl(() => {
    b(), u.map((c) => Et[c]).join(" ") !== o ? f() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), h.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const os = "photos.stack", Sr = { on: !1, window: 4 }, us = 1, cs = 10;
function Tl() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(os) ?? "");
  } catch {
    return { ...Sr };
  }
  if (e === null || typeof e != "object") return { ...Sr };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= us && t <= cs ? t : Sr.window
  };
}
function Ml(e) {
  return localStorage.setItem(os, JSON.stringify({ on: e.on, window: e.window })), e;
}
const ds = "photos.theme", fs = "dark";
function hs() {
  return document.documentElement.dataset.theme === "light" ? "light" : fs;
}
function Rl() {
  const e = localStorage.getItem(ds), t = e === "dark" || e === "light" ? e : fs;
  return document.documentElement.dataset.theme = t, t;
}
function vs(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(ds, e), e;
}
var Al = /* @__PURE__ */ I('<strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <span class="muted sep svelte-zne36e">·</span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span>', 1), Pl = /* @__PURE__ */ I('<strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span>', 1), Cl = /* @__PURE__ */ I('<span class="spin svelte-zne36e" aria-label="loading"></span>'), _a = /* @__PURE__ */ I('<span class="badge svelte-zne36e"> </span>'), Ol = /* @__PURE__ */ I('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Il = /* @__PURE__ */ I('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), Nl = /* @__PURE__ */ I("<button> </button>"), Fl = /* @__PURE__ */ I('<div class="glass sheet sorts svelte-zne36e"></div>'), Ll = /* @__PURE__ */ I(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), zl = /* @__PURE__ */ I('<p class="muted svelte-zne36e">loading…</p>'), Dl = /* @__PURE__ */ I('<span class="help svelte-zne36e">?</span>'), ql = /* @__PURE__ */ I('<span class="n svelte-zne36e"> </span>'), Hl = /* @__PURE__ */ I("<button> <!></button>"), jl = /* @__PURE__ */ I('<span class="muted svelte-zne36e">nothing here</span>'), Bl = /* @__PURE__ */ I('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Ul = /* @__PURE__ */ I('<div class="glass sheet filters svelte-zne36e"><!></div>'), $l = /* @__PURE__ */ I('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><!> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function Gl(e, t) {
  Ct(t, !0);
  let n = Q(t, "facets", 3, null), r = Q(t, "selected", 19, () => ({})), s = Q(t, "sort", 3, "newest"), i = Q(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = Q(t, "total", 3, null), u = Q(t, "tiles", 3, null), o = Q(t, "loading", 3, !1), d = Q(t, "onselect", 3, () => {
  }), g = Q(t, "onsort", 3, () => {
  }), b = Q(t, "onstack", 3, () => {
  }), p = Q(t, "onclear", 3, () => {
  }), f = Q(t, "ontriage", 3, () => {
  }), h = /* @__PURE__ */ G(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), w = /* @__PURE__ */ G(ze(hs())), c = /* @__PURE__ */ G(null);
  const _ = /* @__PURE__ */ te(() => n()?.dimensions ?? []), k = /* @__PURE__ */ te(() => n()?.sorts ?? []), P = /* @__PURE__ */ te(() => a(k).find((C) => C.value === s())?.label ?? s()), O = /* @__PURE__ */ te(() => Object.values(r()).reduce((C, $) => C + $.length, 0)), T = /* @__PURE__ */ te(() => a(_).flatMap((C) => (r()[C.name] ?? []).map(($) => ({
    dimension: C.name,
    value: $,
    title: C.title,
    label: C.options.find((ne) => ne.value === $)?.label ?? String($)
  }))));
  function N(C, $) {
    const ne = r()[C] ?? [], be = ne.includes($) ? ne.filter((fe) => fe !== $) : [...ne, $];
    d()(C, be);
  }
  function U(C, $) {
    return (r()[C] ?? []).includes($);
  }
  function j() {
    E(w, vs(a(w) === "dark" ? "light" : "dark"), !0);
  }
  let R = /* @__PURE__ */ G(null);
  const L = /* @__PURE__ */ te(() => a(R) ?? i().window);
  function B(C) {
    E(R, Number(C), !0);
  }
  function z(C) {
    E(R, null), b()({ ...i(), window: Number(C) });
  }
  dn(() => {
    a(h) !== "stacks" && E(R, null);
  });
  function W(C) {
    C.key === "Escape" && E(h, "");
  }
  function ue(C) {
    a(h) && !C.target.closest(".topbar") && E(h, "");
  }
  fr(() => {
    const C = new ResizeObserver(([$]) => {
      const ne = Math.round($.borderBoxSize?.[0]?.blockSize ?? $.contentRect.height);
      document.documentElement.style.setProperty("--header-h", ne + "px");
    });
    return C.observe(a(c)), () => {
      C.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var K = $l();
  ra("keydown", ar, W), ra("pointerdown", ar, ue);
  var Z = v(K), le = v(Z);
  {
    var _e = (C) => {
      var $ = Al(), ne = ct($), be = v(ne), fe = m(ne, 2), oe = v(fe), ge = m(fe, 4), He = v(ge), Pe = m(ge, 2), ve = v(Pe);
      q(
        (S, H) => {
          M(be, S), M(oe, l() === 1 ? "stack" : "stacks"), M(He, H), M(ve, u() === 1 ? "photo" : "photos");
        },
        [() => Ee(l()), () => Ee(u())]
      ), A(C, $);
    }, ee = (C) => {
      var $ = Pl(), ne = ct($), be = v(ne), fe = m(ne, 2), oe = v(fe);
      q(
        (ge) => {
          M(be, ge), M(oe, l() === 1 ? "photo" : "photos");
        },
        [() => l() === null ? "…" : Ee(l())]
      ), A(C, $);
    };
    Y(le, (C) => {
      u() !== null ? C(_e) : C(ee, -1);
    });
  }
  var pe = m(le, 2);
  {
    var D = (C) => {
      var $ = Cl();
      A(C, $);
    };
    Y(pe, (C) => {
      o() && C(D);
    });
  }
  Cn(Z, (C) => In?.(C));
  var V = m(Z, 2), y = v(V), x = v(y), F = v(x);
  let ae;
  var me = v(F), ce = m(F, 2);
  let de;
  var qe = m(v(ce));
  {
    var we = (C) => {
      var $ = _a(), ne = v($);
      q(() => M(ne, a(O))), A(C, $);
    };
    Y(qe, (C) => {
      a(O) && C(we);
    });
  }
  var Te = m(ce, 2);
  let Ye;
  var Je = m(v(Te));
  {
    var yt = (C) => {
      var $ = _a(), ne = v($);
      q((be) => M(ne, be), [() => Ee(l())]), A(C, $);
    };
    Y(Je, (C) => {
      i().on && l() !== null && C(yt);
    });
  }
  var Be = m(Te, 2);
  {
    var ye = (C) => {
      var $ = Il(), ne = v($);
      tt(ne, 17, () => a(T), (fe) => fe.dimension + " " + fe.value, (fe, oe) => {
        var ge = Ol(), He = v(ge), Pe = v(He), ve = m(He, 1, !0);
        q(() => {
          se(ge, "title", `${a(oe).title ?? ""}: ${a(oe).label ?? ""} — click to remove`), M(Pe, a(oe).title), M(ve, a(oe).label);
        }), X("click", ge, () => N(a(oe).dimension, a(oe).value)), A(fe, ge);
      });
      var be = m(ne, 2);
      X("click", be, () => p()()), A(C, $);
    };
    Y(Be, (C) => {
      a(T).length && C(ye);
    });
  }
  var Se = m(x, 2), Oe = v(Se), Ze = m(Se, 2);
  Cn(y, (C) => In?.(C));
  var Ue = m(y, 2);
  {
    var rt = (C) => {
      var $ = Fl();
      tt($, 21, () => a(k), Tt, (ne, be) => {
        var fe = Nl();
        let oe;
        var ge = v(fe);
        q(() => {
          oe = Ae(fe, 1, "option svelte-zne36e", null, oe, { on: a(be).value === s() }), M(ge, a(be).label);
        }), X("click", fe, () => {
          g()(a(be).value), E(h, "");
        }), A(ne, fe);
      }), Cn($, (ne) => In?.(ne)), A(C, $);
    };
    Y(Ue, (C) => {
      a(h) === "sort" && C(rt);
    });
  }
  var xt = m(Ue, 2);
  {
    var It = (C) => {
      var $ = Ll(), ne = v($), be = m(v(ne), 2), fe = v(be);
      let oe;
      var ge = v(fe), He = m(ne, 2), Pe = m(v(He), 2), ve = v(Pe), S = m(ve, 2), H = v(S);
      Cn($, (J) => In?.(J)), q(() => {
        oe = Ae(fe, 1, "option svelte-zne36e", null, oe, { on: i().on }), se(fe, "aria-checked", i().on), M(ge, i().on ? "On" : "Off"), se(ve, "min", us), se(ve, "max", cs), tn(ve, a(L)), se(ve, "aria-valuetext", `${a(L) ?? ""} seconds`), M(H, `${a(L) ?? ""}s`);
      }), X("click", fe, () => b()({ ...i(), on: !i().on })), X("input", ve, (J) => B(J.currentTarget.value)), X("change", ve, (J) => z(J.currentTarget.value)), A(C, $);
    };
    Y(xt, (C) => {
      a(h) === "stacks" && C(It);
    });
  }
  var en = m(xt, 2);
  {
    var at = (C) => {
      var $ = Ul(), ne = v($);
      {
        var be = (oe) => {
          var ge = zl();
          A(oe, ge);
        }, fe = (oe) => {
          var ge = Wr(), He = ct(ge);
          tt(He, 17, () => a(_), Tt, (Pe, ve) => {
            var S = Bl(), H = v(S), J = v(H), Ie = m(J);
            {
              var We = ($e) => {
                var xe = Dl();
                q(() => se(xe, "title", a(ve).hint)), A($e, xe);
              };
              Y(Ie, ($e) => {
                a(ve).hint && $e(We);
              });
            }
            var ot = m(H, 2), Ve = v(ot);
            tt(Ve, 17, () => a(ve).options, Tt, ($e, xe) => {
              var Ge = Hl();
              let Nt;
              var ft = v(Ge), Gt = m(ft);
              {
                var Yt = (ht) => {
                  var ke = ql(), st = v(ke);
                  q((Ce) => M(st, Ce), [() => Ee(a(xe).count)]), A(ht, ke);
                };
                Y(Gt, (ht) => {
                  a(xe).count !== null && ht(Yt);
                });
              }
              q(
                (ht) => {
                  Nt = Ae(Ge, 1, "option svelte-zne36e", null, Nt, ht), M(ft, `${a(xe).label ?? ""} `);
                },
                [
                  () => ({ on: U(a(ve).name, a(xe).value) })
                ]
              ), X("click", Ge, () => N(a(ve).name, a(xe).value)), A($e, Ge);
            });
            var Qe = m(Ve, 2);
            {
              var et = ($e) => {
                var xe = jl();
                A($e, xe);
              };
              Y(Qe, ($e) => {
                a(ve).options.length || $e(et);
              });
            }
            q(() => M(J, `${a(ve).title ?? ""} `)), A(Pe, S);
          }), A(oe, ge);
        };
        Y(ne, (oe) => {
          n() ? oe(fe, -1) : oe(be);
        });
      }
      Cn($, (oe) => In?.(oe)), A(C, $);
    };
    Y(en, (C) => {
      a(h) === "filters" && C(at);
    });
  }
  Fr(K, (C) => E(c, C), () => a(c)), q(() => {
    ae = Ae(F, 1, "menu svelte-zne36e", null, ae, { open: a(h) === "sort" }), se(F, "aria-expanded", a(h) === "sort"), M(me, a(P)), de = Ae(ce, 1, "menu svelte-zne36e", null, de, { open: a(h) === "filters", on: a(O) > 0 }), se(ce, "aria-expanded", a(h) === "filters"), Ye = Ae(Te, 1, "menu svelte-zne36e", null, Ye, { open: a(h) === "stacks", on: i().on }), se(Te, "aria-expanded", a(h) === "stacks"), se(Se, "title", a(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), se(Se, "aria-label", a(w) === "dark" ? "Switch to a white background" : "Switch to a black background"), M(Oe, a(w) === "dark" ? "☀" : "☾");
  }), X("click", F, () => E(h, a(h) === "sort" ? "" : "sort", !0)), X("click", ce, () => E(h, a(h) === "filters" ? "" : "filters", !0)), X("click", Te, () => E(h, a(h) === "stacks" ? "" : "stacks", !0)), X("click", Se, j), X("click", Ze, () => f()()), A(e, K), Ot();
}
$t(["click", "input", "change"]);
var Yl = /* @__PURE__ */ I('<span class="err svelte-uzy12d"> </span>'), Wl = /* @__PURE__ */ I(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Vl = /* @__PURE__ */ I(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), Xl = /* @__PURE__ */ I('<span class="muted svelte-uzy12d"> </span>'), Kl = /* @__PURE__ */ I('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function Jl(e, t) {
  Ct(t, !0);
  let n = /* @__PURE__ */ G(null), r = /* @__PURE__ */ G(!1), s = /* @__PURE__ */ G(null);
  async function i() {
    E(r, !0), E(s, null);
    try {
      E(n, await Xe.probe(), !0);
    } catch (f) {
      E(s, String(f), !0);
    } finally {
      E(r, !1);
    }
  }
  var l = Kl(), u = v(l), o = v(u), d = m(u, 2);
  {
    var g = (f) => {
      var h = Yl(), w = v(h);
      q(() => M(w, a(s))), A(f, h);
    }, b = (f) => {
      var h = Wr(), w = ct(h);
      {
        var c = (k) => {
          var P = Wl(), O = m(v(P), 2);
          q(
            (T) => M(O, ` above are formats the header
        reader cannot measure (${T ?? ""}) or files with no
        extension.`),
            [() => a(n).formats.join(" ")]
          ), A(k, P);
        }, _ = (k) => {
          var P = Vl(), O = v(P), T = v(O), N = m(O, 2), U = v(N);
          q(
            (j) => {
              M(T, j), M(U, a(n).command);
            },
            [() => Ee(a(n).worklist)]
          ), A(k, P);
        };
        Y(w, (k) => {
          a(n).worklist === 0 ? k(c) : k(_, -1);
        });
      }
      A(f, h);
    }, p = (f) => {
      var h = Xl(), w = v(h);
      q(() => M(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), A(f, h);
    };
    Y(d, (f) => {
      a(s) ? f(g) : a(n) ? f(b, 1) : f(p, -1);
    });
  }
  q(() => {
    u.disabled = a(r), M(o, a(r) ? "counting…" : "Check the dimension probe's worklist");
  }), X("click", u, i), A(e, l), Ot();
}
$t(["click"]);
var Zl = /* @__PURE__ */ I('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), ba = /* @__PURE__ */ I("<option> </option>"), Ql = /* @__PURE__ */ I('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), eo = /* @__PURE__ */ I('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), to = /* @__PURE__ */ I('<div class="none muted svelte-bqi9ky"> </div>'), no = /* @__PURE__ */ I('<div class="bar svelte-bqi9ky"><!></div>');
function ro(e, t) {
  Ct(t, !0);
  let n = Q(t, "candidate", 3, null), r = Q(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), u = /* @__PURE__ */ te(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ te(() => !!n() && n().op !== "is null");
  function d(w, c) {
    const _ = { ...n(), [w]: c };
    if (w === "column") {
      const k = i[c] ?? ["="];
      k.includes(_.op) || (_.op = k[0]), _.value = l.has(c) ? 0 : "";
    }
    w === "op" && c === "is null" && (_.value = null), w === "value" && l.has(_.column) && (_.value = Number(c) || 0), t.onedit(_);
  }
  var g = no(), b = v(g);
  {
    var p = (w) => {
      var c = Zl(), _ = v(c), k = v(_), P = m(_, 2), O = v(P);
      q(() => {
        M(k, `${t.screen.title ?? ""} does not save a rule.`), M(O, t.screen.blurb);
      }), A(w, c);
    }, f = (w) => {
      var c = eo(), _ = ct(c), k = v(_);
      tt(k, 21, () => s, Tt, (D, V) => {
        var y = ba(), x = v(y), F = {};
        q(() => {
          M(x, a(V)), F !== (F = a(V)) && (y.value = (y.__value = a(V)) ?? "");
        }), A(D, y);
      });
      var P;
      Vn(k);
      var O = m(k, 2);
      tt(O, 21, () => a(u), Tt, (D, V) => {
        var y = ba(), x = v(y), F = {};
        q(() => {
          M(x, a(V)), F !== (F = a(V)) && (y.value = (y.__value = a(V)) ?? "");
        }), A(D, y);
      });
      var T;
      Vn(O);
      var N = m(O, 2);
      {
        var U = (D) => {
          var V = Ql();
          q(() => tn(V, n().value ?? "")), X("input", V, (y) => d("value", y.currentTarget.value)), A(D, V);
        };
        Y(N, (D) => {
          a(o) && D(U);
        });
      }
      var j = m(N, 2), R = v(j);
      R.value = R.__value = "exclude";
      var L = m(R);
      L.value = L.__value = "include";
      var B;
      Vn(j);
      var z = m(j, 2), W = v(z);
      W.value = W.__value = "end";
      var ue = m(W);
      ue.value = ue.__value = "0";
      var K;
      Vn(z);
      var Z = m(z, 2), le = v(Z), _e = m(Z, 2), ee = m(_, 2), pe = v(ee);
      q(
        (D, V) => {
          P !== (P = n().column) && (k.value = (k.__value = n().column) ?? "", Dn(k, n().column)), T !== (T = n().op) && (O.value = (O.__value = n().op) ?? "", Dn(O, n().op)), B !== (B = n().decision ?? "exclude") && (j.value = (j.__value = n().decision ?? "exclude") ?? "", Dn(j, n().decision ?? "exclude")), K !== (K = D) && (z.value = (z.__value = D) ?? "", Dn(z, D)), Z.disabled = r(), M(le, r() ? "saving…" : "Confirm"), M(pe, `${V ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => al(n())
        ]
      ), X("change", k, (D) => d("column", D.currentTarget.value)), X("change", O, (D) => d("op", D.currentTarget.value)), X("change", j, (D) => d("decision", D.currentTarget.value)), X("change", z, (D) => d("at", D.currentTarget.value)), X("click", Z, function(...D) {
        t.onconfirm?.apply(this, D);
      }), X("click", _e, function(...D) {
        t.onclear?.apply(this, D);
      }), A(w, c);
    }, h = (w) => {
      var c = to(), _ = v(c);
      q(() => M(_, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), A(w, c);
    };
    Y(b, (w) => {
      t.screen.rule === !1 ? w(p) : n() ? w(f, 1) : w(h, -1);
    });
  }
  A(e, g), Ot();
}
$t(["change", "input", "click"]);
var ao = /* @__PURE__ */ I('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), so = /* @__PURE__ */ I('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), io = /* @__PURE__ */ I('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), lo = /* @__PURE__ */ I('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function oo(e, t) {
  Ct(t, !0);
  let n = Q(t, "rules", 19, () => []), r = Q(t, "unmatched", 3, null), s = Q(t, "busy", 3, !1);
  var i = lo(), l = v(i), u = m(v(l)), o = v(u), d = m(l, 2);
  {
    var g = (h) => {
      var w = ao();
      A(h, w);
    };
    Y(d, (h) => {
      n().length === 0 && h(g);
    });
  }
  var b = m(d, 2);
  tt(b, 19, n, (h) => h.id, (h, w, c) => {
    var _ = so();
    let k;
    var P = v(_), O = v(P), T = v(O), N = m(O, 2), U = v(N), j = m(N, 2), R = v(j), L = m(P, 2), B = v(L), z = v(B), W = m(B, 2), ue = v(W), K = m(W, 4), Z = m(K, 2), le = m(Z, 2);
    q(
      (_e, ee) => {
        k = Ae(_, 1, "rule svelte-aof9c2", null, k, { exclude: a(w).decision === "exclude" }), M(T, a(c)), M(U, a(w).predicate), M(R, a(w).decision), M(z, `${_e ?? ""} paths`), M(ue, ee), K.disabled = s() || a(c) === 0, Z.disabled = s() || a(c) === n().length - 1, le.disabled = s();
      },
      [
        () => Ee(a(w).paths),
        () => St(a(w).bytes)
      ]
    ), X("click", K, () => t.onmove(a(w), a(c) - 1)), X("click", Z, () => t.onmove(a(w), a(c) + 1)), X("click", le, () => t.ondelete(a(w))), A(h, _);
  });
  var p = m(b, 2);
  {
    var f = (h) => {
      var w = io(), c = m(v(w), 2), _ = v(c), k = v(_), P = m(_, 2), O = v(P);
      q(
        (T, N) => {
          M(k, `${T ?? ""} paths`), M(O, N);
        },
        [
          () => Ee(r().paths),
          () => St(r().bytes)
        ]
      ), A(h, w);
    };
    Y(p, (h) => {
      r() && h(f);
    });
  }
  q(() => M(o, `${n().length ?? ""} rules · top-down, first match wins`)), A(e, i), Ot();
}
$t(["click"]);
const Zn = 4, or = 220, uo = 340;
function ps(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function co(e, t, n, r, s) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, u = 0, o = 1 / 0;
    for (; l < e.length && (u += ps(e[l]), l++, o = (n - Zn * (l - i - 1)) / u, !(o <= or)); )
      ;
    if (o > or && !r) break;
    s(i, l, Math.round(Math.min(o, uo))), i = l;
  }
  return i;
}
function ma(e, t, n) {
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
const wa = 2500, fo = 1, ho = 2, vo = 3e7;
function po(e, t, n) {
  const r = [], s = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, d = 0, g = null, b = null, p = null, f = !1, h = !1, w = 0, c = 0, _ = 0, k = n.onState || (() => {
  });
  function P(y) {
    w <= 0 || (o = co(r, o, w, y, (x, F, ae) => {
      s.push({ top: d, height: ae, from: x, to: F }), d += ae + Zn;
    }), T());
  }
  function O() {
    if (b === null || f || w <= 0 || o >= b) return 0;
    const y = s.length ? o / s.length : Math.max(1, w / or), x = s.length ? d / s.length : or + Zn, F = Math.round((b - o) / y * x);
    return Math.max(0, Math.min(F, vo - d));
  }
  function T() {
    e.style.height = d + O() + "px", t.style.top = Math.max(0, d - 1) + "px";
  }
  function N() {
    return window.scrollY - e.offsetTop;
  }
  function U() {
    const y = l.pop();
    if (y) return y;
    const x = document.createElement("div");
    x.className = "tile";
    const F = document.createElement("img");
    return F.decoding = "async", F.addEventListener("load", () => x.classList.add("loaded")), F.addEventListener("error", () => x.classList.add("missing")), x.appendChild(F), n.extend && n.extend(x), x;
  }
  function j(y, x) {
    x.firstChild.removeAttribute("src"), x.classList.remove("loaded", "missing", "error"), x.style.backgroundImage = "", x.remove(), i.delete(y), l.push(x);
  }
  function R(y, x, F, ae, me, ce) {
    let de = i.get(y);
    const qe = r[y];
    if (!de) {
      de = U(), de.dataset.index = String(y);
      const we = de.firstChild;
      we.fetchPriority = ce ? "high" : "low", we.src = "/t/" + qe.s + ".webp", u.push(y), n.fill && n.fill(de, qe), e.appendChild(de), i.set(y, de);
    }
    de.style.width = ae + "px", de.style.height = me + "px", de.style.transform = "translate(" + x + "px," + F + "px)";
  }
  function L(y, x) {
    x.th && (x.url === void 0 && (x.url = n.thumbHash(x.th)), x.url && (y.style.backgroundImage = "url(" + x.url + ")"));
  }
  function B() {
    _ = 0;
    for (const y of u) {
      const x = i.get(y);
      x && !x.classList.contains("loaded") && L(x, r[y]);
    }
    u.length = 0;
  }
  function z(y, x) {
    let F = 0;
    for (let ae = y.from; ae < y.to; ae++) {
      const ce = ae === y.to - 1 ? w - F : Math.round(ps(r[ae]) * y.height);
      R(ae, F, y.top, ce, y.height, x), F += ce + Zn;
    }
  }
  function W() {
    const y = window.innerHeight, x = N(), F = ma(s, x - y * fo, x + y * (1 + ho));
    if (!F) return;
    const ae = s[F[0]].from, me = s[F[1]].to;
    for (const [ce, de] of Array.from(i))
      (ce < ae || ce >= me) && j(ce, de);
    for (let ce = F[0]; ce <= F[1]; ce++) {
      const de = s[ce];
      z(de, de.top < x + y && de.top + de.height > x);
    }
    u.length && !_ && (_ = requestAnimationFrame(B));
  }
  function ue() {
    return w <= 0 ? !1 : d - (N() + window.innerHeight) < wa;
  }
  async function K() {
    if (h || f) return;
    h = !0;
    const y = c;
    k({ loading: !0, count: r.length, exhausted: f, total: b, tiles: p });
    try {
      do {
        const x = await n.fetchPage(g);
        if (y !== c) return;
        for (const F of x.photos) r.push(F);
        g = x.next, f = g === null, typeof x.stacks == "number" ? (b = x.stacks, p = typeof x.total == "number" ? x.total : null) : typeof x.total == "number" && (b = x.total), P(f), W(), k({ loading: !0, count: r.length, exhausted: f, total: b, tiles: p });
      } while (!f && ue());
    } catch (x) {
      y === c && k({ error: String(x) });
    } finally {
      y === c && (h = !1, k({ loading: !1, count: r.length, exhausted: f, total: b, tiles: p }));
    }
  }
  let Z = 0;
  function le() {
    Z || (Z = requestAnimationFrame(() => {
      Z = 0, W(), ue() && K();
    }));
  }
  function _e() {
    const y = e.clientWidth;
    if (y === w) return;
    const x = ma(s, N(), N()), F = x ? s[x[0]].from : 0;
    w = y;
    for (const [me, ce] of Array.from(i)) j(me, ce);
    s.length = 0, o = 0, d = 0, P(f), W();
    const ae = s.find((me) => me.to > F);
    ae && window.scrollTo(0, ae.top + e.offsetTop), ue() && K();
  }
  function ee(y) {
    const x = y.target.closest(".tile");
    if (!x || !e.contains(x)) return;
    const F = r[Number(x.dataset.index)];
    F && n.activate && n.activate(F, y, x);
  }
  e.addEventListener("click", ee), window.addEventListener("scroll", le, { passive: !0 });
  let pe = 0;
  const D = new ResizeObserver(() => {
    clearTimeout(pe), pe = setTimeout(_e, 100);
  });
  D.observe(e);
  const V = new IntersectionObserver(
    (y) => {
      y.some((x) => x.isIntersecting) && K();
    },
    { rootMargin: "0px 0px " + wa + "px 0px" }
  );
  return V.observe(t), w = e.clientWidth, K(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      c++, h = !1;
      for (const [y, x] of Array.from(i)) j(y, x);
      r.length = 0, s.length = 0, u.length = 0, o = 0, d = 0, g = null, b = null, p = null, f = !1, e.style.height = "0px", window.scrollTo(0, 0), K();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(y) {
      const x = typeof y == "number" ? y : null;
      x !== b && (b = x, T(), k({ total: b }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [y, x] of i) n.fill(x, r[y]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(y) {
      for (const [x, F] of i)
        r[x] === y && n.fill && n.fill(F, y);
    },
    destroy() {
      c++, e.removeEventListener("click", ee), window.removeEventListener("scroll", le), D.disconnect(), V.disconnect(), clearTimeout(pe), cancelAnimationFrame(_);
    }
  };
}
function go(e) {
  try {
    const t = Uint8Array.from(atob(e), (z) => z.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, d = (r >> 3 & 63) / 63, g = (r >> 9 & 63) / 63, b = r >> 15, p = Math.max(3, b ? o ? 5 : 7 : r & 7), f = Math.max(3, b ? r & 7 : o ? 5 : 7);
    let h = o ? 6 : 5, w = 0;
    const c = (z, W, ue) => {
      const K = [];
      for (let Z = 0; Z < W; Z++)
        for (let le = Z ? 0 : 1; le * W < z * (W - Z); le++) {
          const _e = t[h + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          K.push((_e / 7.5 - 1) * ue);
        }
      return K;
    }, _ = c(p, f, u), k = c(3, 3, d * 1.25), P = c(3, 3, g * 1.25), O = p / f, T = Math.max(1, Math.round(O > 1 ? 32 : 32 * O)), N = Math.max(1, Math.round(O > 1 ? 32 / O : 32)), U = document.createElement("canvas");
    U.width = T, U.height = N;
    const j = U.getContext("2d"), R = j.createImageData(T, N), L = [], B = [];
    for (let z = 0, W = 0; z < N; z++)
      for (let ue = 0; ue < T; ue++, W += 4) {
        let K = s, Z = i, le = l;
        for (let D = 0; D < p; D++) L[D] = Math.cos(Math.PI / T * (ue + 0.5) * D);
        for (let D = 0; D < f; D++) B[D] = Math.cos(Math.PI / N * (z + 0.5) * D);
        for (let D = 0, V = 0; D < f; D++)
          for (let y = D ? 0 : 1; y * f < p * (f - D); y++, V++)
            K += _[V] * L[y] * B[D] * 2;
        for (let D = 0, V = 0; D < 3; D++)
          for (let y = D ? 0 : 1; y < 3 - D; y++, V++) {
            const x = L[y] * B[D] * 2;
            Z += k[V] * x, le += P[V] * x;
          }
        const _e = K - 2 / 3 * Z, ee = (3 * K - _e + le) / 2, pe = ee - le;
        R.data[W] = Math.max(0, Math.min(255, Math.round(255 * ee))), R.data[W + 1] = Math.max(0, Math.min(255, Math.round(255 * pe))), R.data[W + 2] = Math.max(0, Math.min(255, Math.round(255 * _e))), R.data[W + 3] = 255;
      }
    return j.putImageData(R, 0, 0), U.toDataURL();
  } catch {
    return null;
  }
}
var _o = /* @__PURE__ */ I('<main id="canvas"><div id="sentinel"></div></main>');
function bo(e, t) {
  Ct(t, !0);
  let n = Q(t, "key", 3, ""), r = Q(t, "total", 3, null), s = Q(t, "triage", 3, !1), i = Q(t, "excludedDirs", 19, () => []), l = Q(t, "onActivate", 3, () => {
  }), u = Q(t, "onOverride", 3, async () => null), o = Q(t, "onExcludeFolder", 3, () => {
  }), d = Q(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ G(null), b = /* @__PURE__ */ G(null), p = null, f = "";
  const h = { null: "exclude", exclude: "include", include: "clear" };
  function w(T) {
    const N = T.toLowerCase().startsWith(En.toLowerCase()) ? T.slice(En.length + 1) : T;
    return N.length > 64 ? "…" + N.slice(-64) : N;
  }
  function c(T) {
    const N = document.createElement("div");
    N.className = "tile-path", T.appendChild(N);
    const U = document.createElement("button");
    U.className = "chip", U.type = "button", T.appendChild(U);
    const j = document.createElement("button");
    j.className = "dirchip", j.type = "button", j.textContent = "dir", T.appendChild(j);
  }
  function _(T, N) {
    const U = T.querySelector(".tile-path");
    U && (U.textContent = N.p ? w(N.p) : "");
    const j = T.querySelector(".dirchip");
    if (j) {
      const L = is(N.p ?? ""), B = L !== "" && Xr(i(), L);
      j.hidden = L === "", j.disabled = B, j.dataset.state = B ? "exclude" : "none", j.title = B ? `already excluded: ${L}` : `exclude everything under ${L}, subfolders included — one exclude rule at the end of the order`;
    }
    const R = T.querySelector(".chip");
    R && (R.dataset.state = N.o || "none", R.textContent = N.o === "exclude" ? "drop" : N.o === "include" ? "keep" : "·", R.title = N.o === "exclude" ? "overridden: excluded — click to keep" : N.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  fr(() => (p = po(a(g), a(b), {
    fetchPage: (T) => t.fetchPage(T),
    thumbHash: go,
    extend: s() ? c : void 0,
    fill: s() ? _ : void 0,
    onState: (T) => d()(T),
    activate: async (T, N, U) => {
      if (N.target.closest(".dirchip")) {
        o()(T);
        return;
      }
      if (!N.target.closest(".chip")) {
        l()(T);
        return;
      }
      const j = h[T.o ?? "null"];
      T.o = await u()(T, j), _(U, T);
    }
  }), f = n(), () => p?.destroy())), dn(() => {
    const T = n(), N = r();
    p && (T !== f && (f = T, p.reset()), p.setTotal(N));
  });
  let k = "";
  dn(() => {
    const T = i().join(`
`);
    !p || T === k || (k = T, p.refill());
  });
  var P = _o(), O = v(P);
  Fr(O, (T) => E(b, T), () => a(b)), Fr(P, (T) => E(g, T), () => a(g)), A(e, P), Ot();
}
var mo = /* @__PURE__ */ I('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), wo = /* @__PURE__ */ I('<th class="num svelte-1v3p82v"> </th>'), yo = /* @__PURE__ */ I('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), xo = /* @__PURE__ */ I('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), ko = /* @__PURE__ */ I('<td class="num svelte-1v3p82v"> </td>'), So = /* @__PURE__ */ I('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), Eo = /* @__PURE__ */ I('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function To(e, t) {
  Ct(t, !0);
  let n = Q(t, "rows", 19, () => []), r = Q(t, "rules", 19, () => []), s = Q(t, "root", 3, null), i = Q(t, "selected", 3, null), l = Q(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ te(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const d = /* @__PURE__ */ te(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : ls(r(), t.screen.toRule(w, s()))
  ]))), g = { exclude: "✕", include: "✓" }, b = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var p = Wr(), f = ct(p);
  {
    var h = (w) => {
      var c = Eo(), _ = v(c), k = v(_), P = v(k);
      {
        var O = (L) => {
          var B = mo();
          A(L, B);
        };
        Y(P, (L) => {
          a(u) && L(O);
        });
      }
      var T = m(P), N = v(T), U = m(T, 3);
      {
        var j = (L) => {
          var B = wo(), z = v(B);
          q(() => M(z, t.screen.heading[1])), A(L, B);
        };
        Y(U, (L) => {
          t.screen.heading[1] && L(j);
        });
      }
      var R = m(_);
      tt(R, 23, n, (L) => L.key, (L, B, z) => {
        const W = /* @__PURE__ */ te(() => a(d).get(a(B).key));
        var ue = So();
        let K;
        var Z = v(ue);
        {
          var le = (we) => {
            const Te = /* @__PURE__ */ te(() => l().has(a(B).key));
            var Ye = yo(), Je = v(Ye);
            let yt;
            var Be = v(Je);
            q(
              (ye) => {
                yt = Ae(Je, 1, "tick svelte-1v3p82v", null, yt, { on: a(Te) }), se(Je, "aria-checked", a(Te)), se(Je, "aria-label", `select ${ye ?? ""}`), M(Be, a(Te) ? "✓" : "");
              },
              [() => o(a(B))]
            ), X("click", Je, (ye) => {
              ye.stopPropagation(), t.oncheck(a(B), a(z), ye.shiftKey);
            }), A(we, Ye);
          };
          Y(Z, (we) => {
            a(u) && we(le);
          });
        }
        var _e = m(Z), ee = v(_e);
        let pe;
        var D = v(ee), V = m(ee), y = m(V);
        {
          var x = (we) => {
            var Te = xo();
            A(we, Te);
          };
          Y(y, (we) => {
            a(B).scope === "whole inventory" && we(x);
          });
        }
        var F = m(_e), ae = v(F), me = m(F), ce = v(me), de = m(me);
        {
          var qe = (we) => {
            var Te = ko(), Ye = v(Te);
            q(() => M(Ye, a(B).detail ?? "")), A(we, Te);
          };
          Y(de, (we) => {
            t.screen.heading[1] && we(qe);
          });
        }
        q(
          (we, Te, Ye) => {
            K = Ae(ue, 1, "svelte-1v3p82v", null, K, {
              picked: i() === a(B).key,
              clickable: t.screen.sheet !== !1
            }), pe = Ae(ee, 1, "mark svelte-1v3p82v", null, pe, {
              exclude: a(W) === "exclude",
              include: a(W) === "include"
            }), se(ee, "title", b[a(W)] ?? ""), M(D, g[a(W)] ?? ""), M(V, `${we ?? ""} `), M(ae, Te), M(ce, Ye);
          },
          [
            () => o(a(B)),
            () => Ee(a(B).paths),
            () => St(a(B).bytes)
          ]
        ), X("click", ue, () => t.onpick(a(B))), A(L, ue);
      }), q(() => M(N, t.screen.heading[0] ?? "")), A(w, c);
    };
    Y(f, (w) => {
      n().length && w(h);
    });
  }
  A(e, p), Ot();
}
$t(["click"]);
var Mo = /* @__PURE__ */ I('<button class="twisty svelte-pucy57"> </button>'), Ro = /* @__PURE__ */ I('<span class="twisty leaf svelte-pucy57">·</span>'), Ao = /* @__PURE__ */ I('<span class="name root svelte-pucy57"> </span>'), Po = /* @__PURE__ */ I('<button class="name svelte-pucy57"> </button>'), Co = /* @__PURE__ */ I('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Oo = /* @__PURE__ */ I('<div class="note svelte-pucy57"> </div>'), Io = /* @__PURE__ */ I('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), No = /* @__PURE__ */ I('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Fo = /* @__PURE__ */ I('<div class="tree svelte-pucy57"></div>');
function Lo(e, t) {
  Ct(t, !0);
  let n = Q(t, "version", 3, 0), r = Q(t, "excludedDirs", 19, () => []), s = Q(t, "selected", 3, null), i = Q(t, "busy", 3, !1), l = /* @__PURE__ */ G(ze(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ G(ze(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ G(ze(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ G(ze(/* @__PURE__ */ new Set()));
  async function g(c) {
    E(o, new Set(a(o)).add(c), !0);
    const _ = await t.onload(c), k = new Map(a(l)), P = new Set(a(d));
    _ ? (k.set(c, _), P.delete(c)) : P.add(c), E(l, k, !0), E(d, P, !0), E(o, new Set([...a(o)].filter((O) => O !== c)), !0);
  }
  function b(c) {
    if (a(u).has(c)) {
      E(u, new Set([...a(u)].filter((_) => _ !== c)), !0);
      return;
    }
    E(u, new Set(a(u)).add(c), !0), a(l).has(c) || g(c);
  }
  let p = -1;
  dn(() => {
    const c = n();
    if (c !== p) {
      p = c, a(u).has(t.root) || E(u, new Set(a(u)).add(t.root), !0);
      for (const _ of a(u)) g(_);
    }
  });
  const f = /* @__PURE__ */ te(() => {
    const c = [], _ = (T, N, U, j, R, L) => {
      const B = a(l).get(T), z = a(u).has(T);
      if (c.push({
        key: T,
        name: N,
        depth: U,
        paths: j,
        bytes: R,
        deeper: L,
        expanded: z,
        here: B?.here ?? null,
        truncated: !!B?.truncated,
        loading: a(o).has(T),
        failed: a(d).has(T),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: Xr(r(), T)
      }), !(!z || !B))
        for (const W of B.children)
          _(W.path, W.name, U + 1, W.paths, W.bytes, W.deeper);
    }, k = a(l).get(t.root), P = k ? k.children.reduce((T, N) => T + N.paths, 0) + k.here.paths : 0, O = k ? k.children.reduce((T, N) => T + N.bytes, 0) + k.here.bytes : 0;
    return _(t.root, t.root, 0, P, O, !0), c;
  }), h = 8;
  var w = Fo();
  tt(w, 21, () => a(f), (c) => c.key, (c, _) => {
    var k = No(), P = ct(k);
    let O;
    var T = v(P);
    let N;
    var U = m(T, 2);
    {
      var j = (y) => {
        var x = Mo(), F = v(x);
        q(() => {
          se(x, "aria-expanded", a(_).expanded), se(x, "aria-label", `${a(_).expanded ? "collapse" : "expand"} ${a(_).name ?? ""}`), se(x, "title", a(_).expanded ? "collapse" : "expand"), M(F, a(_).loading ? "·" : a(_).expanded ? "▾" : "▸");
        }), X("click", x, () => b(a(_).key)), A(y, x);
      }, R = (y) => {
        var x = Ro();
        A(y, x);
      };
      Y(U, (y) => {
        a(_).deeper ? y(j) : y(R, -1);
      });
    }
    var L = m(U, 2);
    {
      var B = (y) => {
        var x = Ao(), F = v(x);
        q(() => M(F, a(_).key)), A(y, x);
      }, z = (y) => {
        var x = Po(), F = v(x);
        q(() => {
          se(x, "title", `Show every kept file under ${a(_).key ?? ""}`), M(F, a(_).name);
        }), X("click", x, () => t.onpick(a(_))), A(y, x);
      };
      Y(L, (y) => {
        a(_).depth === 0 ? y(B) : y(z, -1);
      });
    }
    var W = m(L, 2), ue = v(W), K = m(W, 2), Z = v(K), le = m(K, 2), _e = m(P, 2);
    {
      var ee = (y) => {
        var x = Co();
        let F;
        q((ae) => F = zn(x, "", F, ae), [
          () => ({
            "padding-left": `${Math.min(a(_).depth, h) * 11 + 18}px`
          })
        ]), A(y, x);
      }, pe = (y) => {
        var x = Oo();
        let F;
        var ae = v(x);
        q(
          (me, ce, de) => {
            F = zn(x, "", F, me), M(ae, `${ce ?? ""} directly here · ${de ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(a(_).depth, h) * 11 + 18}px`
            }),
            () => Ee(a(_).here.paths),
            () => St(a(_).here.bytes)
          ]
        ), A(y, x);
      };
      Y(_e, (y) => {
        a(_).expanded && a(_).failed ? y(ee) : a(_).expanded && a(_).here && a(_).here.paths > 0 && y(pe, 1);
      });
    }
    var D = m(_e, 2);
    {
      var V = (y) => {
        var x = Io();
        let F;
        q((ae) => F = zn(x, "", F, ae), [
          () => ({
            "padding-left": `${Math.min(a(_).depth, h) * 11 + 18}px`
          })
        ]), A(y, x);
      };
      Y(D, (y) => {
        a(_).truncated && y(V);
      });
    }
    q(
      (y, x, F) => {
        O = Ae(P, 1, "row svelte-pucy57", null, O, {
          picked: s() === a(_).key,
          gone: a(_).excluded
        }), N = zn(T, "", N, y), M(ue, x), M(Z, F), le.disabled = i() || a(_).excluded || a(_).depth === 0, se(le, "title", a(_).depth === 0 ? "The library root is not excludable from here." : a(_).excluded ? "already excluded" : `Exclude everything under ${a(_).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(a(_).depth, h) * 11}px` }),
        () => Ee(a(_).paths),
        () => St(a(_).bytes)
      ]
    ), X("click", le, () => t.onexclude(a(_))), A(c, k);
  }), A(e, w), Ot();
}
$t(["click"]);
var zo = /* @__PURE__ */ I('<button title="Back to its default">↺</button>'), Do = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), qo = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), Ho = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), jo = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), Bo = /* @__PURE__ */ I('<li><code class="svelte-1hh0fwb"> </code> </li>'), Uo = /* @__PURE__ */ I(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), $o = /* @__PURE__ */ I('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function Go(e, t) {
  Ct(t, !0);
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
        ["headerSide", "Sides", 0, (z) => Math.floor(z / 2), 1],
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
  let u = /* @__PURE__ */ G(ze(pl())), o = /* @__PURE__ */ G(!0), d = /* @__PURE__ */ G(!1), g = /* @__PURE__ */ G(ze(hs())), b = /* @__PURE__ */ G(ze(window.innerWidth));
  const p = (z) => a(g) === "light" ? z.light : z.dark, f = (z) => z in nn ? nn : Jt, h = (z) => `rgba(${z.r}, ${z.g}, ${z.b}, ${z.a})`, w = /* @__PURE__ */ te(() => JSON.stringify(a(u), null, 2));
  fr(() => {
    const z = localStorage.getItem(n);
    if (z)
      try {
        E(u, yr(JSON.parse(z)), !0);
        return;
      } catch {
      }
    Kr();
  });
  function c(z) {
    E(u, yr({ ...a(u), ...z }), !0), localStorage.setItem(n, JSON.stringify(a(u))), E(d, !1);
  }
  function _(z) {
    E(u, yr(z), !0), localStorage.setItem(n, JSON.stringify(a(u))), E(d, !1);
  }
  function k(z) {
    c({ [z]: f(z)[z] });
  }
  function P() {
    E(g, vs(a(g) === "dark" ? "light" : "dark"), !0);
  }
  async function O() {
    await navigator.clipboard.writeText(a(w)), E(d, !0);
  }
  var T = $o();
  let N;
  var U = v(T), j = m(v(U), 4), R = v(j), L = m(U, 2);
  {
    var B = (z) => {
      var W = Uo();
      {
        const Je = (Be, ye = Xn, Se = Xn, Oe = Xn) => {
          var Ze = zo();
          let Ue;
          q(() => {
            Ue = Ae(Ze, 1, "undo svelte-1hh0fwb", null, Ue, { idle: !Se() }), se(Ze, "aria-label", `Reset ${ye() ?? ""}`);
          }), X("click", Ze, function(...rt) {
            Oe()?.apply(this, rt);
          }), A(Be, Ze);
        };
        var ue = m(v(W), 2);
        tt(ue, 17, () => r, Tt, (Be, ye) => {
          var Se = qo(), Oe = v(Se), Ze = v(Oe), Ue = m(Oe, 2), rt = v(Ue), xt = m(Ue, 2);
          tt(xt, 17, () => a(ye).rows, Tt, (It, en) => {
            var at = /* @__PURE__ */ te(() => gr(a(en), 5));
            let C = () => a(at)[0], $ = () => a(at)[1], ne = () => a(at)[2], be = () => a(at)[3], fe = () => a(at)[4];
            const oe = /* @__PURE__ */ te(() => a(u)[C()] !== f(C())[C()]), ge = /* @__PURE__ */ te(() => typeof be() == "function" ? be()(a(b)) : be());
            var He = Do();
            let Pe;
            var ve = v(He), S = v(ve), H = m(ve, 2), J = m(H, 2), Ie = m(J, 2);
            Je(Ie, $, () => a(oe), () => () => k(C())), q(() => {
              Pe = Ae(He, 1, "row svelte-1hh0fwb", null, Pe, { moved: a(oe) }), M(S, $()), se(H, "min", ne()), se(H, "max", a(ge)), se(H, "step", fe()), se(H, "aria-label", $()), tn(H, a(u)[C()]), se(J, "min", ne()), se(J, "max", a(ge)), se(J, "step", fe()), se(J, "aria-label", `${$() ?? ""} value`), tn(J, a(u)[C()]);
            }), X("input", H, (We) => c({ [C()]: Number(We.currentTarget.value) })), X("input", J, (We) => c({ [C()]: Number(We.currentTarget.value) })), A(It, He);
          }), q(() => {
            M(Ze, a(ye).title), M(rt, a(ye).note);
          }), A(Be, Se);
        });
        var K = m(ue, 2), Z = v(K), le = m(K, 2), _e = v(le), ee = m(le, 2);
        tt(ee, 17, () => vl, Tt, (Be, ye) => {
          const Se = /* @__PURE__ */ te(() => p(a(ye))), Oe = /* @__PURE__ */ te(() => a(u)[a(Se)]), Ze = /* @__PURE__ */ te(() => a(ye).base[a(Se)]);
          var Ue = jo(), rt = v(Ue), xt = v(rt), It = m(xt), en = v(It), at = m(rt, 2), C = v(at), $ = m(at, 2);
          tt($, 17, () => i, Tt, (oe, ge) => {
            var He = /* @__PURE__ */ te(() => gr(a(ge), 3));
            let Pe = () => a(He)[0], ve = () => a(He)[1], S = () => a(He)[2];
            const H = /* @__PURE__ */ te(() => a(Oe)[Pe()] !== a(Ze)[Pe()]);
            var J = Ho();
            let Ie;
            var We = v(J), ot = v(We), Ve = m(We, 2), Qe = m(Ve, 2), et = m(Qe, 2);
            Je(et, ve, () => a(H), () => () => c({
              [a(Se)]: { ...a(Oe), [Pe()]: a(Ze)[Pe()] }
            })), q(() => {
              Ie = Ae(J, 1, "row svelte-1hh0fwb", null, Ie, { moved: a(H) }), M(ot, ve()), se(Ve, "max", S()), se(Ve, "step", S() === 1 ? 0.01 : 1), se(Ve, "aria-label", `${a(g) ?? ""} ${s[a(ye).dark].title ?? ""} ${ve() ?? ""}`), tn(Ve, a(Oe)[Pe()]), se(Qe, "max", S()), se(Qe, "step", S() === 1 ? 0.01 : 1), se(Qe, "aria-label", `${a(g) ?? ""} ${s[a(ye).dark].title ?? ""} ${ve() ?? ""} value`), tn(Qe, a(Oe)[Pe()]);
            }), X("input", Ve, ($e) => c({
              [a(Se)]: {
                ...a(Oe),
                [Pe()]: Number($e.currentTarget.value)
              }
            })), X("input", Qe, ($e) => c({
              [a(Se)]: {
                ...a(Oe),
                [Pe()]: Number($e.currentTarget.value)
              }
            })), A(oe, J);
          });
          var ne = m($, 2);
          let be;
          var fe = v(ne);
          q(
            (oe, ge) => {
              M(xt, `${s[a(ye).dark].title ?? ""} `), M(en, a(g)), M(C, s[a(ye).dark].note), be = zn(ne, "", be, oe), M(fe, ge);
            },
            [
              () => ({ background: h(a(Oe)) }),
              () => h(a(Oe))
            ]
          ), A(Be, Ue);
        });
        var pe = m(ee, 2), D = m(v(pe), 4);
        let yt;
        var V = v(D), y = v(V), x = m(V, 2);
        Je(x, () => "Blur at the edge", () => a(u).blurEdge !== nn.blurEdge, () => () => k("blurEdge"));
        var F = m(pe, 2), ae = m(v(F), 4);
        tt(ae, 21, () => l, Tt, (Be, ye) => {
          var Se = /* @__PURE__ */ te(() => gr(a(ye), 2));
          let Oe = () => a(Se)[0], Ze = () => a(Se)[1];
          var Ue = Bo(), rt = v(Ue), xt = v(rt), It = m(rt);
          q(() => {
            M(xt, Oe()), M(It, ` — ${Ze() ?? ""}`);
          }), A(Be, Ue);
        });
        var me = m(F, 2), ce = m(v(me), 4), de = v(ce), qe = m(de, 2), we = m(qe, 2), Te = v(we), Ye = m(ce, 2);
        q(() => {
          M(Z, `The five colours below are per theme, and you are editing the ${a(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), M(_e, `Edit the ${a(g) === "dark" ? "light" : "dark"} colours`), yt = Ae(D, 1, "row toggle svelte-1hh0fwb", null, yt, { moved: a(u).blurEdge !== nn.blurEdge }), Ji(y, a(u).blurEdge), M(Te, a(d) ? "Copied" : "Copy"), tn(Ye, a(w));
        }), X("click", le, P), X("change", y, (Be) => c({ blurEdge: Be.currentTarget.checked })), X("click", de, () => _(Jt)), X("click", qe, () => _(nn)), X("click", we, O);
      }
      A(z, W);
    };
    Y(L, (z) => {
      a(o) && z(B);
    });
  }
  q(() => {
    N = Ae(T, 1, "tuner svelte-1hh0fwb", null, N, { folded: !a(o) }), se(j, "title", a(o) ? "Fold away" : "Open"), M(R, a(o) ? "–" : "+");
  }), Qi("innerWidth", (z) => E(b, z, !0)), X("click", j, () => E(o, !a(o))), A(e, T), Ot();
}
$t(["click", "input", "change"]);
var Yo = /* @__PURE__ */ I('<button><span class="n svelte-1n46o8q"> </span> </button>'), Wo = /* @__PURE__ */ I('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), Vo = /* @__PURE__ */ I('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), Xo = /* @__PURE__ */ I('<div class="muted pad svelte-1n46o8q">loading…</div>'), Ko = /* @__PURE__ */ I('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), Jo = /* @__PURE__ */ I('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!></aside>'), Zo = /* @__PURE__ */ I('<p class="blurb"> </p>'), Qo = /* @__PURE__ */ I('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), eu = /* @__PURE__ */ I('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), tu = /* @__PURE__ */ I('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), nu = /* @__PURE__ */ I('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), ru = /* @__PURE__ */ I("<div> </div>"), au = /* @__PURE__ */ I('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!>', 1);
function su(e, t) {
  Ct(t, !0);
  const n = location.pathname === "/tune";
  let r = /* @__PURE__ */ G("grid"), s = /* @__PURE__ */ G(0), i = /* @__PURE__ */ G(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ G(ze([])), u = /* @__PURE__ */ G(null), o = /* @__PURE__ */ G(null), d = /* @__PURE__ */ G(ze(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ G(null), b = /* @__PURE__ */ G(null), p = /* @__PURE__ */ G(null), f = /* @__PURE__ */ G(null), h = /* @__PURE__ */ G(!1), w = /* @__PURE__ */ G(!1), c = /* @__PURE__ */ G(!1), _ = /* @__PURE__ */ G(!1), k = /* @__PURE__ */ G(ze({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), P = /* @__PURE__ */ G(null), O = /* @__PURE__ */ G(0), T = /* @__PURE__ */ G(null), N = /* @__PURE__ */ G(ze({})), U = /* @__PURE__ */ G("newest"), j = /* @__PURE__ */ G(ze(Tl()));
  const R = /* @__PURE__ */ te(() => ha[a(s)]), L = /* @__PURE__ */ te(() => a(R).table !== !1), B = /* @__PURE__ */ te(() => a(L) || a(R).tree === !0), z = /* @__PURE__ */ te(() => a(R).sheet !== !1 && (a(o) !== null || !a(B))), W = /* @__PURE__ */ te(() => ({
    sort: a(U),
    ...a(j).on ? { stack: a(j).window } : {},
    ...Object.fromEntries(Object.entries(a(N)).filter(([, S]) => S.length > 0))
  })), ue = /* @__PURE__ */ te(() => a(r) === "grid" ? `grid:${JSON.stringify(a(W))}` : `triage:${a(s)}:${JSON.stringify(a(o))}`), K = /* @__PURE__ */ te(() => a(R).rule === !1 || a(d).size === 0 ? [] : a(l).filter((S) => a(d).has(S.key)).map((S) => a(R).toRule(S, a(i))).filter((S) => S && ls(a(b)?.rules ?? [], S) !== "exclude")), Z = /* @__PURE__ */ te(() => (a(b)?.rules ?? []).filter((S) => S.decision === "exclude" && S.term?.column === "dir_under").map((S) => String(S.term.value).replace(/[\\/]+$/, "").toLowerCase())), le = nl();
  function _e(S) {
    E(P, String(S), !0);
  }
  async function ee(S) {
    try {
      return E(P, null), await S();
    } catch (H) {
      return _e(H), null;
    }
  }
  const pe = rl(
    () => {
      E(w, !0), ee(async () => {
        const S = a(o)?.at === "end" || a(o)?.at === void 0 ? void 0 : 0, { stale: H, value: J } = await le(() => Xe.counts(a(o), S));
        H || E(b, J, !0);
      }).finally(() => {
        E(w, !1);
      });
    },
    220
  );
  async function D() {
    E(p, "loading");
    const S = await ee(() => Xe.files());
    E(p, S, !0), E(h, !1), E(f, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function V(S = !1) {
    if (a(r) !== "triage" || !a(L)) {
      E(l, [], !0);
      return;
    }
    E(_, !0);
    const H = a(R).name === "source_folder" && a(i) ? { root: a(i) } : {};
    S && (H.live = "1");
    const J = await ee(() => Xe.screen(a(R).name, H));
    E(l, J?.rows ?? [], !0), E(_, !1);
  }
  let y = !1;
  dn(() => {
    a(s), a(r), fn(() => {
      E(u, null), E(o, null), E(i, null), me(), a(r) === "triage" && (V(), pe.now(), y || (y = !0, D()));
    });
  }), dn(() => {
    a(i), fn(() => {
      a(r) === "triage" && (me(), V());
    });
  }), fr(() => {
    ee(async () => {
      E(T, await Xe.facets(), !0);
    });
  });
  function x(S, H) {
    E(N, { ...a(N), [S]: H }, !0);
  }
  function F(S) {
    if (a(R).sheet !== !1) {
      if (a(R).drill && !a(i)) {
        E(u, S.key, !0), E(
          o,
          {
            ...a(R).toRule(S, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), E(i, S.key, !0);
        return;
      }
      E(u, S.key, !0), E(
        o,
        {
          ...a(R).toRule(S, a(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), pe();
    }
  }
  function ae(S, H, J) {
    const Ie = new Set(a(d)), We = !Ie.has(S.key), ot = J && a(g) !== null ? a(l).findIndex((et) => et.key === a(g)) : -1, [Ve, Qe] = ot < 0 ? [H, H] : ot < H ? [ot, H] : [H, ot];
    for (let et = Ve; et <= Qe; et++)
      We ? Ie.add(a(l)[et].key) : Ie.delete(a(l)[et].key);
    E(d, Ie, !0), E(g, S.key, !0);
  }
  function me() {
    E(d, /* @__PURE__ */ new Set(), !0), E(g, null);
  }
  function ce(S) {
    E(o, S, !0), E(
      u,
      null
      // it no longer corresponds to a row
    ), pe();
  }
  function de(S = !1) {
    E(o, null), E(u, null), S && E(i, null), pe.now();
  }
  async function qe() {
    E(
      h,
      !0
      // the distinct-content number now says so on its face
    ), wi(O), await V(), pe.now();
  }
  async function we() {
    if (!a(o)) return;
    E(c, !0);
    const S = a(o).at === "end" ? void 0 : 0, H = await ee(() => Xe.addRule(
      {
        column: a(o).column,
        op: a(o).op,
        value: a(o).value,
        decision: a(o).decision ?? "exclude",
        note: `screen ${a(R).id} ${a(R).title}`
      },
      S
    ));
    E(c, !1), H && (E(o, null), E(u, null), await qe());
  }
  async function Te() {
    const S = a(K);
    if (!S.length) {
      me();
      return;
    }
    E(c, !0);
    for (const H of S)
      if (!await ee(() => Xe.addRule({
        column: H.column,
        op: H.op,
        value: H.value,
        decision: "exclude",
        note: `screen ${a(R).id} ${a(R).title}`
      }))) break;
    E(c, !1), me(), E(o, null), E(u, null), await qe();
  }
  async function Ye(S) {
    if (!S || Xr(a(Z), S)) return;
    E(c, !0);
    const H = await ee(() => Xe.addRule({
      column: "dir_under",
      op: "=",
      value: S,
      decision: "exclude",
      note: `screen ${a(R).id} ${a(R).title}`
    }));
    E(c, !1), H && await qe();
  }
  const Je = (S) => Ye(is(S.p ?? "")), yt = (S) => Ye(S.key);
  async function Be(S) {
    E(c, !0), await ee(() => Xe.deleteRule(S.id)), E(c, !1), await qe();
  }
  async function ye(S, H) {
    E(c, !0), await ee(() => Xe.moveRule(S.id, H)), E(c, !1), await qe();
  }
  async function Se(S, H) {
    const J = await ee(() => Xe.override(S.s, H));
    return J ? (E(h, !0), pe(), J.decision) : S.o ?? null;
  }
  function Oe(S) {
    return a(r) === "grid" ? Xe.photos({ limit: 500, ...a(W), ...S || {} }) : Xe.page(a(o), S);
  }
  function Ze(S) {
    ee(() => a(r) === "grid" ? Xe.revealPhoto(S.id) : Xe.revealOrigin(S.id));
  }
  var Ue = au(), rt = ct(Ue);
  {
    var xt = (S) => {
      Gl(S, {
        get facets() {
          return a(T);
        },
        get selected() {
          return a(N);
        },
        get sort() {
          return a(U);
        },
        get stacking() {
          return a(j);
        },
        get total() {
          return a(k).total;
        },
        get tiles() {
          return a(k).tiles;
        },
        get loading() {
          return a(k).loading;
        },
        onselect: x,
        onsort: (H) => E(U, H, !0),
        onstack: (H) => E(j, Ml(H), !0),
        onclear: () => E(N, {}, !0),
        ontriage: () => E(r, "triage")
      });
    };
    Y(rt, (S) => {
      a(r) === "grid" && S(xt);
    });
  }
  var It = m(rt, 2);
  {
    var en = (S) => {
      Go(S, {});
    };
    Y(It, (S) => {
      n && S(en);
    });
  }
  var at = m(It, 2);
  let C;
  var $ = v(at);
  {
    var ne = (S) => {
      var H = Jo(), J = v(H), Ie = v(J), We = m(J, 2);
      tt(We, 21, () => ha, Tt, (xe, Ge, Nt) => {
        var ft = Yo();
        let Gt;
        var Yt = v(ft), ht = v(Yt), ke = m(Yt, 1, !0);
        q(() => {
          Gt = Ae(ft, 1, "nav svelte-1n46o8q", null, Gt, { on: Nt === a(s) }), M(ht, a(Ge).id), M(ke, a(Ge).title);
        }), X("click", ft, () => E(s, Nt, !0)), A(xe, ft);
      });
      var ot = m(We, 2);
      {
        var Ve = (xe) => {
          var Ge = Ko(), Nt = ct(Ge), ft = v(Nt);
          {
            var Gt = (Ce) => {
              var vt = Wo(), kt = ct(vt), hr = /* @__PURE__ */ te(() => de.bind(null, !0)), An = m(kt, 2), vr = v(An);
              q(() => M(vr, `inside ${a(i) ?? ""}`)), X("click", kt, function(...pr) {
                a(hr)?.apply(this, pr);
              }), A(Ce, vt);
            }, Yt = (Ce) => {
              var vt = Vo(), kt = v(vt);
              q(() => M(kt, a(R).relive)), X("click", vt, () => V(!0)), A(Ce, vt);
            };
            Y(ft, (Ce) => {
              a(R).drill && a(i) ? Ce(Gt) : a(R).relive && Ce(Yt, 1);
            });
          }
          var ht = m(Nt, 2);
          {
            var ke = (Ce) => {
              var vt = Xo();
              A(Ce, vt);
            };
            Y(ht, (Ce) => {
              a(_) && Ce(ke);
            });
          }
          var st = m(ht, 2);
          {
            let Ce = /* @__PURE__ */ te(() => a(b)?.rules ?? []);
            To(st, {
              get rows() {
                return a(l);
              },
              get screen() {
                return a(R);
              },
              get root() {
                return a(i);
              },
              get checked() {
                return a(d);
              },
              get rules() {
                return a(Ce);
              },
              get selected() {
                return a(u);
              },
              onpick: F,
              oncheck: ae
            });
          }
          A(xe, Ge);
        };
        Y(ot, (xe) => {
          a(L) && xe(Ve);
        });
      }
      var Qe = m(ot, 2);
      {
        var et = (xe) => {
          Lo(xe, {
            get root() {
              return En;
            },
            get version() {
              return a(O);
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
            onload: (Ge) => ee(() => Xe.tree(Ge)),
            onpick: F,
            onexclude: yt
          });
        };
        Y(Qe, (xe) => {
          a(R).tree && xe(et);
        });
      }
      var $e = m(Qe, 2);
      {
        let xe = /* @__PURE__ */ te(() => a(b)?.rules ?? []), Ge = /* @__PURE__ */ te(() => a(b)?.unmatched ?? null);
        oo($e, {
          get rules() {
            return a(xe);
          },
          get unmatched() {
            return a(Ge);
          },
          get busy() {
            return a(c);
          },
          ondelete: Be,
          onmove: ye
        });
      }
      X("click", Ie, () => E(r, "grid")), A(S, H);
    };
    Y($, (S) => {
      a(r) === "triage" && S(ne);
    });
  }
  var be = m($, 2), fe = v(be);
  {
    var oe = (S) => {
      var H = nu(), J = ct(H), Ie = v(J), We = m(J, 2), ot = v(We), Ve = m(We, 2);
      {
        var Qe = (ke) => {
          var st = Zo(), Ce = v(st);
          q(() => M(Ce, a(R).note)), A(ke, st);
        };
        Y(Ve, (ke) => {
          a(R).note && ke(Qe);
        });
      }
      var et = m(Ve, 2);
      {
        var $e = (ke) => {
          Jl(ke, {
            get screen() {
              return a(R);
            }
          });
        };
        Y(et, (ke) => {
          a(R).name === "dimensions" && ke($e);
        });
      }
      var xe = m(et, 2);
      hl(xe, {
        get counts() {
          return a(b);
        },
        get files() {
          return a(p);
        },
        get filesAt() {
          return a(f);
        },
        get stale() {
          return a(h);
        },
        get candidate() {
          return a(o);
        },
        get busy() {
          return a(w);
        },
        onfiles: D
      });
      var Ge = m(xe, 2);
      {
        var Nt = (ke) => {
          var st = Qo(), Ce = v(st), vt = v(Ce), kt = m(Ce, 2), hr = v(kt), An = m(kt, 2), vr = m(An, 2), pr = v(vr);
          {
            var gs = (Wt) => {
              var hn = sa("already excluded — nothing left to write");
              A(Wt, hn);
            }, _s = (Wt) => {
              var hn = sa();
              q((bs) => M(hn, `one exclude rule each, at the end of the order${bs ?? ""}`), [
                () => a(K).length < a(d).size ? ` · ${Ee(a(d).size - a(K).length)} already excluded, skipped` : ""
              ]), A(Wt, hn);
            };
            Y(pr, (Wt) => {
              a(K).length ? Wt(_s, -1) : Wt(gs);
            });
          }
          q(
            (Wt, hn) => {
              M(vt, `${Wt ?? ""} ticked`), kt.disabled = a(c) || !a(K).length, M(hr, hn), An.disabled = a(c);
            },
            [
              () => Ee(a(d).size),
              () => a(c) ? "saving…" : `Exclude ${Ee(a(K).length)}`
            ]
          ), X("click", kt, Te), X("click", An, me), A(ke, st);
        };
        Y(Ge, (ke) => {
          a(d).size && ke(Nt);
        });
      }
      var ft = m(Ge, 2);
      ro(ft, {
        get candidate() {
          return a(o);
        },
        get screen() {
          return a(R);
        },
        get saving() {
          return a(c);
        },
        onedit: ce,
        onconfirm: we,
        onclear: de
      });
      var Gt = m(ft, 2);
      {
        var Yt = (ke) => {
          var st = eu(), Ce = v(st);
          q((vt, kt) => M(Ce, `${vt ?? ""}${kt ?? ""} loaded${a(k).exhausted ? " · all of them" : ""}${a(k).loading ? " · loading…" : ""} `), [
            () => Ee(a(k).count),
            () => a(k).total ? " of " + Ee(a(k).total) : ""
          ]), A(ke, st);
        }, ht = (ke) => {
          var st = tu();
          A(ke, st);
        };
        Y(Gt, (ke) => {
          a(z) ? ke(Yt) : a(R).sheet === !1 && ke(ht, 1);
        });
      }
      q(() => {
        M(Ie, `${a(R).id ?? ""} · ${a(R).title ?? ""}`), M(ot, a(R).blurb);
      }), A(S, H);
    };
    Y(fe, (S) => {
      a(r) === "triage" && S(oe);
    });
  }
  var ge = m(fe, 2);
  {
    var He = (S) => {
      {
        let H = /* @__PURE__ */ te(() => a(r) === "grid" ? null : a(b)?.page_paths ?? null), J = /* @__PURE__ */ te(() => a(r) === "triage");
        bo(S, {
          get key() {
            return a(ue);
          },
          fetchPage: Oe,
          get total() {
            return a(H);
          },
          get triage() {
            return a(J);
          },
          get excludedDirs() {
            return a(Z);
          },
          onActivate: Ze,
          onOverride: Se,
          onExcludeFolder: Je,
          onState: (Ie) => E(k, { ...a(k), ...Ie }, !0)
        });
      }
    };
    Y(ge, (S) => {
      (a(z) || a(r) === "grid") && S(He);
    });
  }
  var Pe = m(at, 2);
  {
    var ve = (S) => {
      var H = ru();
      let J;
      var Ie = v(H);
      q(() => {
        J = Ae(H, 1, "status", null, J, { bare: a(r) === "grid" }), M(Ie, a(P));
      }), A(S, H);
    };
    Y(Pe, (S) => {
      a(P) && S(ve);
    });
  }
  q(() => C = Ae(at, 1, "shell", null, C, { bare: a(r) === "grid" })), A(e, Ue), Ot();
}
$t(["click"]);
Rl();
Kr();
qi(su, { target: document.getElementById("app") });
