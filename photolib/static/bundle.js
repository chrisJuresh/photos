var Lr = Array.isArray, hs = Array.prototype.indexOf, Zn = Array.prototype.includes, or = Array.from, vs = Object.defineProperty, pn = Object.getOwnPropertyDescriptor, ps = Object.getOwnPropertyDescriptors, gs = Object.prototype, _s = Array.prototype, ba = Object.getPrototypeOf, Xr = Object.isExtensible;
const Wn = () => {
};
function bs(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ma() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
function pr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const r of e)
    if (n.push(r), n.length === t) break;
  return n;
}
const ze = 2, _n = 4, ur = 8, wa = 1 << 24, mt = 16, ct = 32, zt = 64, kr = 128, ut = 512, Ie = 1024, Ne = 2048, kt = 4096, Ve = 8192, nt = 16384, Sn = 32768, Sr = 1 << 25, bn = 65536, Qn = 1 << 17, ms = 1 << 18, En = 1 << 19, ws = 1 << 20, At = 1 << 25, nn = 65536, er = 1 << 21, gn = 1 << 22, Vt = 1 << 23, Zt = Symbol("$state"), ys = Symbol("legacy props"), xs = Symbol(""), ya = Symbol("attributes"), Er = Symbol("class"), Tr = Symbol("style"), Mr = Symbol("text"), Hn = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), ks = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Ss(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Es() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Ts(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Ms(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Rs() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function As(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ps() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Cs(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Os() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Is() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ns() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Fs() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Ls = 1, Ds = 2, xa = 4, zs = 8, qs = 16, Hs = 1, js = 4, Bs = 8, $s = 16, Us = 1, Gs = 2, Oe = Symbol("uninitialized"), Ys = "http://www.w3.org/1999/xhtml";
function Vs() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Ws() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Xs() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ka(e) {
  return e === this.v;
}
function Ks(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Sa(e) {
  return !Ks(e, this.v);
}
let $e = null;
function mn(e) {
  $e = e;
}
function St(e, t = !1, n) {
  $e = {
    p: $e,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      ae
    ),
    l: null
  };
}
function Et(e) {
  var t = (
    /** @type {ComponentContext} */
    $e
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Ba(r);
  }
  return t.i = !0, $e = t.p, /** @type {T} */
  {};
}
function Ea() {
  return !0;
}
let hn = [];
function Js() {
  var e = hn;
  hn = [], bs(e);
}
function Lt(e) {
  if (hn.length === 0) {
    var t = hn;
    queueMicrotask(() => {
      t === hn && Js();
    });
  }
  hn.push(e);
}
function Ta(e) {
  var t = ae;
  if (t === null)
    return ie.f |= Vt, e;
  if ((t.f & Sn) === 0 && (t.f & _n) === 0)
    throw e;
  Gt(e, t);
}
function Gt(e, t) {
  if (!(t !== null && (t.f & nt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & kr) !== 0) {
        if ((t.f & Sn) === 0)
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
const Zs = -7169;
function Se(e, t) {
  e.f = e.f & Zs | t;
}
function Dr(e) {
  (e.f & ut) !== 0 || e.deps === null ? Se(e, Ie) : Se(e, kt);
}
function Ma(e) {
  if (e !== null)
    for (const t of e)
      (t.f & ze) === 0 || (t.f & nn) === 0 || (t.f ^= nn, Ma(
        /** @type {Derived} */
        t.deps
      ));
}
function Ra(e, t, n) {
  (e.f & Ne) !== 0 ? t.add(e) : (e.f & kt) !== 0 && n.add(e), Ma(e.deps), Se(e, Ie);
}
let $n = !1;
function Qs(e) {
  var t = $n;
  try {
    return $n = !1, [e(), $n];
  } finally {
    $n = t;
  }
}
function ei(e, t, n, r = !0) {
  r && n();
  for (var s of t)
    e.addEventListener(s, n);
  cr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function Tn(e) {
  var t = ie, n = ae;
  ft(null), Ct(null);
  try {
    return e();
  } finally {
    ft(t), Ct(n);
  }
}
function ti(e) {
  let t = 0, n = rn(0), r;
  return () => {
    jr() && (a(n), Ua(() => (t === 0 && (r = an(() => e(() => Dn(n)))), t += 1, () => {
      Lt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Dn(n));
      });
    })));
  };
}
var ni = bn | En;
function ri(e, t, n, r) {
  new ai(e, t, n, r);
}
class ai {
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
  #d = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #g = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #f = null;
  #b = ti(() => (this.#f = rn(this.#p), () => {
    this.#f = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, s) {
    this.#t = t, this.#e = n, this.#o = (i) => {
      var o = (
        /** @type {Effect} */
        ae
      );
      o.b = this, o.f |= kr, r(i);
    }, this.parent = /** @type {Effect} */
    ae.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#r = Br(() => {
      this.#h();
    }, ni);
  }
  #_() {
    try {
      this.#s = ot(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: s } = this.#m(t);
    Lt(s), n && (this.#l = ot(() => {
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
        Xs();
        return;
      }
      n = !0, r && Fs(), this.#l !== null && en(this.#l, () => {
        this.#l = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: s, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, s), r = !1;
      } catch (o) {
        Gt(o, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = ot(() => t(this.#t)), Lt(() => {
      var n = this.#a = document.createDocumentFragment(), r = Dt();
      n.append(r), this.#s = this.#v(() => ot(() => this.#o(r))), this.#u === 0 && (this.#t.before(n), this.#a = null, en(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        de
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#p = 0, this.#s = ot(() => {
        this.#o(this.#t);
      }), this.#u > 0) {
        var t = this.#a = document.createDocumentFragment();
        Ur(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = ot(() => n(this.#t));
      } else
        this.#w(
          /** @type {Batch} */
          de
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #w(t) {
    this.is_pending = !1, t.transfer_effects(this.#d, this.#g);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Ra(t, this.#d, this.#g);
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
    var n = ae, r = ie, s = $e;
    Ct(this.#r), ft(this.#r), mn(this.#r.ctx);
    try {
      return Wt.ensure(), t();
    } catch (i) {
      return Ta(i), null;
    } finally {
      Ct(n), ft(r), mn(s);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && en(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#f || this.#c) && (this.#c = !0, Lt(() => {
      this.#c = !1, this.#f && wn(this.#f, this.#p);
    }));
  }
  get_effect_pending() {
    return this.#b(), a(
      /** @type {Source<number>} */
      this.#f
    );
  }
  /** @param {unknown} error */
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    de?.is_fork ? (this.#s && de.skip_effect(this.#s), this.#n && de.skip_effect(this.#n), this.#l && de.skip_effect(this.#l), de.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#s && (Qe(this.#s), this.#s = null), this.#n && (Qe(this.#n), this.#n = null), this.#l && (Qe(this.#l), this.#l = null);
    let n = this.#e.failed;
    const r = (s) => {
      const { reset: i, invoke_onerror: o } = this.#m(s);
      o(), n && (this.#l = this.#v(() => {
        try {
          return ot(() => {
            var u = (
              /** @type {Effect} */
              ae
            );
            u.b = this, u.f |= kr, n(
              this.#t,
              () => s,
              () => i
            );
          });
        } catch (u) {
          return Gt(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    Lt(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (i) {
        Gt(i, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        r,
        /** @param {unknown} e */
        (i) => Gt(i, this.#r && this.#r.parent)
      ) : r(s);
    });
  }
}
function si(e, t, n, r) {
  const s = zn;
  var i = e.filter((h) => !h.settled), o = t.map(s);
  if (n.length === 0 && i.length === 0) {
    r(o);
    return;
  }
  var u = (
    /** @type {Effect} */
    ae
  ), l = ii(), c = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function g(h) {
    if ((u.f & nt) === 0) {
      l();
      try {
        r([...o, ...h]);
      } catch (_) {
        Gt(_, u);
      }
      tr();
    }
  }
  var v = Aa();
  if (n.length === 0) {
    c.then(() => g([])).finally(v);
    return;
  }
  function d() {
    Promise.all(n.map((h) => /* @__PURE__ */ li(h))).then(g).catch((h) => Gt(h, u)).finally(v);
  }
  c ? c.then(() => {
    l(), d(), tr();
  }) : d();
}
function ii() {
  var e = (
    /** @type {Effect} */
    ae
  ), t = ie, n = $e, r = (
    /** @type {Batch} */
    de
  );
  return function(i = !0) {
    Ct(e), ft(t), mn(n), i && (e.f & nt) === 0 && (r?.activate(), r?.apply());
  };
}
function tr(e = !0) {
  Ct(null), ft(null), mn(null), e && de?.deactivate();
}
function Aa() {
  var e = (
    /** @type {Effect} */
    ae
  ), t = e.b, n = (
    /** @type {Batch} */
    de
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function zn(e) {
  var t = ze | Ne;
  return ae !== null && (ae.f |= En), {
    ctx: $e,
    deps: null,
    effects: null,
    equals: ka,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Oe
    ),
    wv: 0,
    parent: ae,
    ac: null
  };
}
const Cn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function li(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    ae
  );
  r === null && Es();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = rn(
    /** @type {V} */
    Oe
  ), o = !ie, u = /* @__PURE__ */ new Set();
  return xi(() => {
    var l = (
      /** @type {Effect} */
      ae
    ), c = ma();
    s = c.promise;
    try {
      Promise.resolve(e()).then(c.resolve, (h) => {
        h !== Hn && c.reject(h);
      }).finally(tr);
    } catch (h) {
      c.reject(h), tr();
    }
    var g = (
      /** @type {Batch} */
      de
    );
    if (o) {
      if ((l.f & Sn) !== 0)
        var v = Aa();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        g.async_deriveds.get(l)?.reject(Cn);
      else
        for (const h of u.values())
          h.reject(Cn);
      u.add(c), g.async_deriveds.set(l, c);
    }
    const d = (h, _ = void 0) => {
      v?.(), u.delete(c), _ !== Cn && (g.activate(), _ ? (i.f |= Vt, wn(i, _)) : ((i.f & Vt) !== 0 && (i.f ^= Vt), wn(i, h)), g.deactivate());
    };
    c.promise.then(d, (h) => d(null, h || "unknown"));
  }), cr(() => {
    for (const l of u)
      l.reject(Cn);
  }), new Promise((l) => {
    function c(g) {
      function v() {
        g === s ? l(i) : c(s);
      }
      g.then(v, v);
    }
    c(s);
  });
}
// @__NO_SIDE_EFFECTS__
function te(e) {
  const t = /* @__PURE__ */ zn(e);
  return Xa(t), t;
}
// @__NO_SIDE_EFFECTS__
function Pa(e) {
  const t = /* @__PURE__ */ zn(e);
  return t.equals = Sa, t;
}
function oi(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      Qe(
        /** @type {Effect} */
        t[n]
      );
  }
}
function zr(e) {
  var t, n = ae, r = e.parent;
  if (!qt && r !== null && e.v !== Oe && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (nt | Ve)) !== 0)
    return Vs(), e.v;
  Ct(r);
  try {
    e.f &= ~nn, oi(e), t = Qa(e);
  } finally {
    Ct(n);
  }
  return t;
}
function Ca(e) {
  var t = zr(e);
  if (!e.equals(t) && (e.wv = Ja(), (!de?.is_fork || e.deps === null) && (de !== null ? (de.capture(e, t, !0), Rr?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Se(e, Ie);
    return;
  }
  qt || (wt !== null ? (jr() || de?.is_fork) && wt.set(e, t) : Dr(e));
}
function ui(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Tn(() => {
        t.ac.abort(Hn), t.ac = null;
      }), t.fn !== null && (t.teardown = Wn), qn(t, 0), $r(t));
}
function Oa(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && xn(t);
}
let gr = null, cn = null, de = null, Rr = null, wt = null, Ar = null, _r = !1, vn = null, Xn = null;
var Kr = 0;
let ci = 1;
class Wt {
  id = ci++;
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
  #d = /* @__PURE__ */ new Map();
  /**
   * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
   * @type {Set<Effect>}
   */
  #g = /* @__PURE__ */ new Set();
  is_fork = !1;
  #f = !1;
  constructor() {
    cn === null ? gr = cn = this : (cn.#e = this, this.#i = cn), cn = this;
  }
  #b() {
    if (this.is_fork) return !0;
    for (const r of this.#n.keys()) {
      for (var t = r, n = !1; t.parent !== null; ) {
        if (this.#d.has(t)) {
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
    this.#d.has(t) || this.#d.set(t, { d: [], m: [] }), this.#g.delete(t);
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   * @param {(e: Effect) => void} callback
   */
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#d.get(t);
    if (r) {
      this.#d.delete(t);
      for (var s of r.d)
        Se(s, Ne), n(s);
      for (s of r.m)
        Se(s, kt), n(s);
    }
    this.#g.add(t);
  }
  #_() {
    this.#t = !0, Kr++ > 1e3 && (this.#v(), fi());
    for (const l of this.#u)
      this.#c.delete(l), Se(l, Ne), this.schedule(l);
    for (const l of this.#c)
      Se(l, kt), this.schedule(l);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = vn = [], r = [], s = Xn = [];
    for (const l of t)
      try {
        this.#y(l, n, r);
      } catch (c) {
        throw Fa(l), this.#b() || this.discard(), c;
      }
    if (de = null, s.length > 0) {
      var i = Wt.ensure();
      for (const l of s)
        i.schedule(l);
    }
    if (vn = null, Xn = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [l, c] of this.#d)
        Na(l, c);
      s.length > 0 && /** @type {unknown} */
      de.#_();
      return;
    }
    const o = this.#m();
    if (o) {
      this.#h(r), this.#h(n), o.#x(this);
      return;
    }
    this.#u.clear(), this.#c.clear();
    for (const l of this.#o) l(this);
    this.#o.clear(), Rr = this, Jr(r), Jr(n), Rr = null, this.#l?.resolve();
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      de
    );
    if (this.#s === 0 && (this.#a.length === 0 || u !== null) && this.#v(), this.#a.length > 0)
      if (u !== null) {
        const l = u;
        l.#a.push(...this.#a.filter((c) => !l.#a.includes(c)));
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
    t.f ^= Ie;
    for (var s = t.first; s !== null; ) {
      var i = s.f, o = (i & (ct | zt)) !== 0, u = o && (i & Ie) !== 0, l = u || (i & Ve) !== 0 || this.#d.has(s);
      if (!l && s.fn !== null) {
        o ? s.f ^= Ie : (i & _n) !== 0 ? n.push(s) : Bn(s) && ((i & mt) !== 0 && this.#c.add(s), xn(s));
        var c = s.first;
        if (c !== null) {
          s = c;
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
      if (s !== null && !((r.f & ze) !== 0 && (r.f & (Ne | kt)) === 0))
        for (const u of s) {
          var i = u.f;
          if ((i & ze) !== 0)
            n(
              /** @type {Derived} */
              u
            );
          else {
            var o = (
              /** @type {Effect} */
              u
            );
            i & (gn | mt) && !this.async_deriveds.has(o) && (this.#c.delete(o), Se(o, Ne), this.schedule(o));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), de = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      Ra(t[n], this.#u, this.#c);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== Oe && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & Vt) === 0 && (this.current.set(t, [n, r]), wt?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    de = this;
  }
  deactivate() {
    de = null, wt = null;
  }
  flush() {
    try {
      _r = !0, de = this, this.#_();
    } finally {
      Kr = 0, Ar = null, vn = null, Xn = null, _r = !1, de = null, wt = null, Qt.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Cn);
    this.#v(), this.#l?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let v = gr; v !== null; v = v.#e) {
      var t = v.id < this.id, n = [];
      for (const [d, [h, _]] of this.current) {
        if (v.current.has(d)) {
          var r = (
            /** @type {[any, boolean]} */
            v.current.get(d)[0]
          );
          if (t && h !== r)
            v.current.set(d, [h, _]);
          else
            continue;
        }
        n.push(d);
      }
      if (t)
        for (const [d, h] of this.async_deriveds) {
          const _ = v.async_deriveds.get(d);
          _ && h.promise.then(_.resolve).catch(_.reject);
        }
      var s = [...v.current.keys()].filter(
        (d) => !/** @type {[any, boolean]} */
        v.current.get(d)[1]
      );
      if (!(!v.#t || s.length === 0)) {
        var i = s.filter((d) => !this.current.has(d));
        if (i.length === 0)
          t && v.discard();
        else if (n.length > 0) {
          if (t)
            for (const d of this.#g)
              v.unskip_effect(d, (h) => {
                (h.f & (mt | gn)) !== 0 ? v.schedule(h) : v.#h([h]);
              });
          v.activate();
          var o = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (var l of n)
            Ia(l, i, o, u);
          u = /* @__PURE__ */ new Map();
          var c = [...v.current].filter(([d, h]) => {
            const _ = this.current.get(d);
            return _ ? _[0] !== h[0] || _[1] !== h[1] : !0;
          }).map(([d]) => d);
          if (c.length > 0)
            for (const d of this.#p)
              (d.f & (nt | Ve | Qn)) === 0 && qr(d, c, u) && ((d.f & (gn | mt)) !== 0 ? (Se(d, Ne), v.schedule(d)) : v.#u.add(d));
          if (v.#a.length > 0 && !v.#f) {
            v.apply();
            for (var g of v.#a)
              v.#y(g, [], []);
            v.#a = [];
          }
          v.deactivate();
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
    this.#f || (this.#f = !0, Lt(() => {
      this.#f = !1, this.linked && this.flush();
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
    return (this.#l ??= ma()).promise;
  }
  static ensure() {
    if (de === null) {
      const t = de = new Wt();
      _r || Lt(() => {
        t.#t || t.flush();
      });
    }
    return de;
  }
  apply() {
    {
      wt = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Ar = t, t.b?.is_pending && (t.f & (_n | ur | wa)) !== 0 && (t.f & Sn) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (vn !== null && n === ae && (ie === null || (ie.f & ze) === 0))
        return;
      if ((r & (zt | ct)) !== 0) {
        if ((r & Ie) === 0)
          return;
        n.f ^= Ie;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#i, n = this.#e;
      t === null ? gr = n : t.#e = n, n === null ? cn = t : n.#i = t, this.linked = !1;
    }
  }
}
function fi() {
  try {
    Ps();
  } catch (e) {
    Gt(e, Ar);
  }
}
let Ft = null;
function Jr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (nt | Ve)) === 0 && Bn(r) && (Ft = /* @__PURE__ */ new Set(), xn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ya(r), Ft?.size > 0)) {
        Qt.clear();
        for (const s of Ft) {
          if ((s.f & (nt | Ve)) !== 0) continue;
          const i = [s];
          let o = s.parent;
          for (; o !== null; )
            Ft.has(o) && (Ft.delete(o), i.push(o)), o = o.parent;
          for (let u = i.length - 1; u >= 0; u--) {
            const l = i[u];
            (l.f & (nt | Ve)) === 0 && xn(l);
          }
        }
        Ft.clear();
      }
    }
    Ft = null;
  }
}
function Ia(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & ze) !== 0 ? Ia(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (gn | mt)) !== 0 && (i & Ne) === 0 && qr(s, t, r) && (Se(s, Ne), Hr(
        /** @type {Effect} */
        s
      ));
    }
}
function qr(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (Zn.call(t, s))
        return !0;
      if ((s.f & ze) !== 0 && qr(
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
function Hr(e) {
  de.schedule(e);
}
function Na(e, t) {
  if (!((e.f & ct) !== 0 && (e.f & Ie) !== 0)) {
    (e.f & Ne) !== 0 ? t.d.push(e) : (e.f & kt) !== 0 && t.m.push(e), Se(e, Ie);
    for (var n = e.first; n !== null; )
      Na(n, t), n = n.next;
  }
}
function Fa(e) {
  Se(e, Ie);
  for (var t = e.first; t !== null; )
    Fa(t), t = t.next;
}
let nr = /* @__PURE__ */ new Set();
const Qt = /* @__PURE__ */ new Map();
let La = !1;
function rn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ka,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function V(e, t) {
  const n = rn(e);
  return Xa(n), n;
}
// @__NO_SIDE_EFFECTS__
function di(e, t = !1, n = !0) {
  const r = rn(e);
  return t || (r.equals = Sa), r;
}
function T(e, t, n = !1) {
  ie !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!xt || (ie.f & Qn) !== 0) && Ea() && (ie.f & (ze | mt | gn | Qn)) !== 0 && (Pt === null || !Pt.has(e)) && Ns();
  let r = n ? De(t) : t;
  return wn(e, r, Xn);
}
function wn(e, t, n = null) {
  if (!e.equals(t)) {
    Qt.set(e, qt ? t : e.v);
    var r = Wt.ensure();
    if (r.capture(e, t), (e.f & ze) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Ne) !== 0 && zr(s), wt === null && Dr(s);
    }
    e.wv = Ja(), Da(e, Ne, n), ae !== null && (ae.f & Ie) !== 0 && (ae.f & (ct | zt)) === 0 && (lt === null ? Ei([e]) : lt.push(e)), !r.is_fork && nr.size > 0 && !La && hi();
  }
  return t;
}
function hi() {
  La = !1;
  for (const e of nr) {
    (e.f & Ie) !== 0 && Se(e, kt);
    let t;
    try {
      t = Bn(e);
    } catch {
      t = !0;
    }
    t && xn(e);
  }
  nr.clear();
}
function vi(e, t = 1) {
  var n = a(e), r = t === 1 ? n++ : n--;
  return T(e, n), r;
}
function Dn(e) {
  T(e, e.v + 1);
}
function Da(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, i = 0; i < s; i++) {
      var o = r[i], u = o.f, l = (u & Ne) === 0;
      if (l && Se(o, t), (u & Qn) !== 0)
        nr.add(
          /** @type {Effect} */
          o
        );
      else if ((u & ze) !== 0) {
        var c = (
          /** @type {Derived} */
          o
        );
        wt?.delete(c), (u & nn) === 0 && (u & ut && (ae === null || (ae.f & er) === 0) && (o.f |= nn), Da(c, kt, n));
      } else if (l) {
        var g = (
          /** @type {Effect} */
          o
        );
        (u & mt) !== 0 && Ft !== null && Ft.add(g), n !== null ? n.push(g) : Hr(g);
      }
    }
}
function De(e) {
  if (typeof e != "object" || e === null || Zt in e)
    return e;
  const t = ba(e);
  if (t !== gs && t !== _s)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Lr(e), s = /* @__PURE__ */ V(0), i = tn, o = (u) => {
    if (tn === i)
      return u();
    var l = ie, c = tn;
    ft(null), ea(i);
    var g = u();
    return ft(l), ea(c), g;
  };
  return r && n.set("length", /* @__PURE__ */ V(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, l, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && Os();
        var g = n.get(l);
        return g === void 0 ? o(() => {
          var v = /* @__PURE__ */ V(c.value);
          return n.set(l, v), v;
        }) : T(g, c.value, !0), !0;
      },
      deleteProperty(u, l) {
        var c = n.get(l);
        if (c === void 0) {
          if (l in u) {
            const g = o(() => /* @__PURE__ */ V(Oe));
            n.set(l, g), Dn(s);
          }
        } else
          T(c, Oe), Dn(s);
        return !0;
      },
      get(u, l, c) {
        if (l === Zt)
          return e;
        var g = n.get(l), v = l in u;
        if (g === void 0 && (!v || pn(u, l)?.writable) && (g = o(() => {
          var h = De(v ? u[l] : Oe), _ = /* @__PURE__ */ V(h);
          return _;
        }), n.set(l, g)), g !== void 0) {
          var d = a(g);
          return d === Oe ? void 0 : d;
        }
        return Reflect.get(u, l, c);
      },
      getOwnPropertyDescriptor(u, l) {
        var c = Reflect.getOwnPropertyDescriptor(u, l);
        if (c && "value" in c) {
          var g = n.get(l);
          g && (c.value = a(g));
        } else if (c === void 0) {
          var v = n.get(l), d = v?.v;
          if (v !== void 0 && d !== Oe)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return c;
      },
      has(u, l) {
        if (l === Zt)
          return !0;
        var c = n.get(l), g = c !== void 0 && c.v !== Oe || Reflect.has(u, l);
        if (c !== void 0 || ae !== null && (!g || pn(u, l)?.writable)) {
          c === void 0 && (c = o(() => {
            var d = g ? De(u[l]) : Oe, h = /* @__PURE__ */ V(d);
            return h;
          }), n.set(l, c));
          var v = a(c);
          if (v === Oe)
            return !1;
        }
        return g;
      },
      set(u, l, c, g) {
        var v = n.get(l), d = l in u;
        if (r && l === "length")
          for (var h = c; h < /** @type {Source<number>} */
          v.v; h += 1) {
            var _ = n.get(h + "");
            _ !== void 0 ? T(_, Oe) : h in u && (_ = o(() => /* @__PURE__ */ V(Oe)), n.set(h + "", _));
          }
        if (v === void 0)
          (!d || pn(u, l)?.writable) && (v = o(() => /* @__PURE__ */ V(void 0)), T(v, De(c)), n.set(l, v));
        else {
          d = v.v !== Oe;
          var w = o(() => De(c));
          T(v, w);
        }
        var f = Reflect.getOwnPropertyDescriptor(u, l);
        if (f?.set && f.set.call(g, c), !d) {
          if (r && typeof l == "string") {
            var p = (
              /** @type {Source<number>} */
              n.get("length")
            ), x = Number(l);
            Number.isInteger(x) && x >= p.v && T(p, x + 1);
          }
          Dn(s);
        }
        return !0;
      },
      ownKeys(u) {
        a(s);
        var l = Reflect.ownKeys(u).filter((v) => {
          var d = n.get(v);
          return d === void 0 || d.v !== Oe;
        });
        for (var [c, g] of n)
          g.v !== Oe && !(c in u) && l.push(c);
        return l;
      },
      setPrototypeOf() {
        Is();
      }
    }
  );
}
function Zr(e) {
  try {
    if (e !== null && typeof e == "object" && Zt in e)
      return e[Zt];
  } catch {
  }
  return e;
}
function pi(e, t) {
  return Object.is(Zr(e), Zr(t));
}
var rr, za, qa, Ha;
function gi() {
  if (rr === void 0) {
    rr = window, za = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    qa = pn(t, "firstChild").get, Ha = pn(t, "nextSibling").get, Xr(e) && (e[Er] = void 0, e[ya] = null, e[Tr] = void 0, e.__e = void 0), Xr(n) && (n[Mr] = void 0);
  }
}
function Dt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ar(e) {
  return (
    /** @type {TemplateNode | null} */
    qa.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function jn(e) {
  return (
    /** @type {TemplateNode | null} */
    Ha.call(e)
  );
}
function b(e, t) {
  return /* @__PURE__ */ ar(e);
}
function yt(e, t = !1) {
  {
    var n = /* @__PURE__ */ ar(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ jn(n) : n;
  }
}
function m(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ jn(r);
  return r;
}
function _i(e) {
  e.textContent = "";
}
function ja() {
  return !1;
}
function bi(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function mi(e) {
  ae === null && (ie === null && As(), Rs()), qt && Ms();
}
function wi(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Ht(e, t) {
  var n = ae;
  n !== null && (n.f & Ve) !== 0 && (e |= Ve);
  var r = {
    ctx: $e,
    deps: null,
    nodes: null,
    f: e | Ne | ut,
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
  de?.register_created_effect(r);
  var s = r;
  if ((e & _n) !== 0)
    vn !== null ? vn.push(r) : Wt.ensure().schedule(r);
  else if (t !== null) {
    try {
      xn(r);
    } catch (o) {
      throw Qe(r), o;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & En) === 0 && (s = s.first, (e & mt) !== 0 && (e & bn) !== 0 && s !== null && (s.f |= bn));
  }
  if (s !== null && (s.parent = n, n !== null && wi(s, n), ie !== null && (ie.f & ze) !== 0 && (e & zt) === 0)) {
    var i = (
      /** @type {Derived} */
      ie
    );
    (i.effects ??= []).push(s);
  }
  return r;
}
function jr() {
  return ie !== null && !xt;
}
function cr(e) {
  const t = Ht(ur, null);
  return Se(t, Ie), t.teardown = e, t;
}
function yn(e) {
  mi();
  var t = (
    /** @type {Effect} */
    ae.f
  ), n = !ie && (t & ct) !== 0 && $e !== null && !$e.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      $e
    );
    (r.e ??= []).push(e);
  } else
    return Ba(e);
}
function Ba(e) {
  return Ht(_n | ws, e);
}
function yi(e) {
  Wt.ensure();
  const t = Ht(zt | En, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? en(t, () => {
      Qe(t), r(void 0);
    }) : (Qe(t), r(void 0));
  });
}
function $a(e) {
  return Ht(_n, e);
}
function xi(e) {
  return Ht(gn | En, e);
}
function Ua(e, t = 0) {
  return Ht(ur | t, e);
}
function j(e, t = [], n = [], r = []) {
  si(r, t, n, (s) => {
    Ht(ur, () => {
      e(...s.map(a));
    });
  });
}
function Br(e, t = 0) {
  var n = Ht(mt | t, e);
  return n;
}
function ot(e) {
  return Ht(ct | En, e);
}
function Ga(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = qt, r = ie;
    Qr(!0), ft(null);
    try {
      t.call(null);
    } finally {
      Qr(n), ft(r);
    }
  }
}
function $r(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Tn(() => {
      s.abort(Hn);
    });
    var r = n.next;
    (n.f & zt) !== 0 ? n.parent = null : Qe(n, t), n = r;
  }
}
function ki(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & ct) === 0 && Qe(t), t = n;
  }
}
function Qe(e, t = !0) {
  var n = !1;
  (t || (e.f & ms) !== 0) && e.nodes !== null && e.nodes.end !== null && (Si(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Sr, $r(e, t && !n), qn(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  Ga(e), e.f ^= Sr, e.f |= nt;
  var s = e.parent;
  s !== null && s.first !== null && Ya(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Si(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ jn(e);
    e.remove(), e = n;
  }
}
function Ya(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function en(e, t, n = !0) {
  var r = [];
  Va(e, r, !0);
  var s = () => {
    n && Qe(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var o = () => --i || s();
    for (var u of r)
      u.out(o);
  } else
    s();
}
function Va(e, t, n) {
  if ((e.f & Ve) === 0) {
    e.f ^= Ve;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var s = e.first; s !== null; ) {
      var i = s.next;
      if ((s.f & zt) === 0) {
        var o = (s.f & bn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (s.f & ct) !== 0 && (e.f & mt) !== 0;
        Va(s, t, o ? n : !1);
      }
      s = i;
    }
  }
}
function sr(e) {
  Wa(e, !0);
}
function Wa(e, t) {
  if ((e.f & Ve) !== 0) {
    e.f ^= Ve, (e.f & Ie) === 0 && (Se(e, Ne), Wt.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & bn) !== 0 || (n.f & ct) !== 0;
      Wa(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || t) && o.in();
  }
}
function Ur(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ jn(n);
      t.append(n), n = s;
    }
}
let Kn = !1, qt = !1;
function Qr(e) {
  qt = e;
}
let ie = null, xt = !1;
function ft(e) {
  ie = e;
}
let ae = null;
function Ct(e) {
  ae = e;
}
let Pt = null;
function Xa(e) {
  ie !== null && (Pt ??= /* @__PURE__ */ new Set()).add(e);
}
let Ze = null, tt = 0, lt = null;
function Ei(e) {
  lt = e;
}
let Ka = 1, Jt = 0, tn = Jt;
function ea(e) {
  tn = e;
}
function Ja() {
  return ++Ka;
}
function Bn(e) {
  var t = e.f;
  if ((t & Ne) !== 0)
    return !0;
  if (t & ze && (e.f &= ~nn), (t & kt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (Bn(
        /** @type {Derived} */
        i
      ) && Ca(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & ut) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    wt === null && Se(e, Ie);
  }
  return !1;
}
function Za(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Pt !== null && Pt.has(e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & ze) !== 0 ? Za(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Se(i, Ne) : (i.f & Ie) !== 0 && Se(i, kt), Hr(
        /** @type {Effect} */
        i
      ));
    }
}
function Qa(e) {
  var t = Ze, n = tt, r = lt, s = ie, i = Pt, o = $e, u = xt, l = tn, c = e.f;
  Ze = /** @type {null | Value[]} */
  null, tt = 0, lt = null, ie = (c & (ct | zt)) === 0 ? e : null, Pt = null, mn(e.ctx), xt = !1, tn = ++Jt, e.ac !== null && (Tn(() => {
    e.ac.abort(Hn);
  }), e.ac = null);
  try {
    e.f |= er;
    var g = (
      /** @type {Function} */
      e.fn
    ), v = g();
    e.f |= Sn;
    var d = e.deps, h = de?.is_fork;
    if (Ze !== null) {
      var _;
      if (h || qn(e, tt), d !== null && tt > 0)
        for (d.length = tt + Ze.length, _ = 0; _ < Ze.length; _++)
          d[tt + _] = Ze[_];
      else
        e.deps = d = Ze;
      if (jr() && (e.f & ut) !== 0)
        for (_ = tt; _ < d.length; _++)
          (d[_].reactions ??= []).push(e);
    } else !h && d !== null && tt < d.length && (qn(e, tt), d.length = tt);
    if (Ea() && lt !== null && !xt && d !== null && (e.f & (ze | kt | Ne)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      lt.length; _++)
        Za(
          lt[_],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (Jt++, s.deps !== null)
        for (let w = 0; w < n; w += 1)
          s.deps[w].rv = Jt;
      if (t !== null)
        for (const w of t)
          w.rv = Jt;
      lt !== null && (r === null ? r = lt : r.push(.../** @type {Source[]} */
      lt));
    }
    return (e.f & Vt) !== 0 && (e.f ^= Vt), v;
  } catch (w) {
    return Ta(w);
  } finally {
    e.f ^= er, Ze = t, tt = n, lt = r, ie = s, Pt = i, mn(o), xt = u, tn = l;
  }
}
function Ti(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = hs.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & ze) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Ze === null || !Zn.call(Ze, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & ut) !== 0 && (i.f ^= ut, i.f &= ~nn), i.v !== Oe && Dr(i), i.ac !== null && Tn(() => {
      i.ac.abort(Hn), i.ac = null, Se(i, Ne);
    }), ui(i), qn(i, 0);
  }
}
function qn(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Ti(e, n[r]);
}
function xn(e) {
  var t = e.f;
  if ((t & nt) === 0) {
    Se(e, Ie);
    var n = ae, r = Kn;
    ae = e, Kn = (t & (ct | zt)) === 0;
    try {
      (t & (mt | wa)) !== 0 ? ki(e) : $r(e), Ga(e);
      var s = Qa(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Ka;
      var i;
    } finally {
      Kn = r, ae = n;
    }
  }
}
function a(e) {
  var t = e.f, n = (t & ze) !== 0;
  if (ie !== null && !xt) {
    var r = ae !== null && (ae.f & nt) !== 0;
    if (!r && (Pt === null || !Pt.has(e))) {
      var s = ie.deps;
      if ((ie.f & er) !== 0)
        e.rv < Jt && (e.rv = Jt, Ze === null && s !== null && s[tt] === e ? tt++ : Ze === null ? Ze = [e] : Ze.push(e));
      else {
        ie.deps ??= [], Zn.call(ie.deps, e) || ie.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [ie] : Zn.call(i, ie) || i.push(ie);
      }
    }
  }
  if (qt && Qt.has(e))
    return Qt.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (qt) {
      var u = o.v;
      return ((o.f & Ie) === 0 && o.reactions !== null || ts(o)) && (u = zr(o)), Qt.set(o, u), u;
    }
    var l = (o.f & ut) === 0 && !xt && ie !== null && (Kn || (ie.f & ut) !== 0), c = (o.f & Sn) === 0;
    Bn(o) && (l && (o.f |= ut), Ca(o)), l && !c && (Oa(o), es(o));
  }
  if (wt?.has(e))
    return wt.get(e);
  if ((e.f & Vt) !== 0)
    throw e.v;
  return e.v;
}
function es(e) {
  if (e.f |= ut, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & ze) !== 0 && (t.f & ut) === 0 && (Oa(
        /** @type {Derived} */
        t
      ), es(
        /** @type {Derived} */
        t
      ));
}
function ts(e) {
  if (e.v === Oe) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Qt.has(t) || (t.f & ze) !== 0 && ts(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function an(e) {
  var t = xt;
  try {
    return xt = !0, e();
  } finally {
    xt = t;
  }
}
const Mi = ["touchstart", "touchmove"];
function Ri(e) {
  return Mi.includes(e);
}
const On = Symbol("events"), ns = /* @__PURE__ */ new Set(), Pr = /* @__PURE__ */ new Set();
function Ai(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || Cr.call(t, i), !i.cancelBubble)
      return Tn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Lt(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function ta(e, t, n, r, s) {
  var i = { capture: r, passive: s }, o = Ai(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && cr(() => {
    t.removeEventListener(e, o, i);
  });
}
function K(e, t, n) {
  (t[On] ??= {})[e] = n;
}
function jt(e) {
  for (var t = 0; t < e.length; t++)
    ns.add(e[t]);
  for (var n of Pr)
    n(e);
}
let na = null;
function Cr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  na = e;
  var o = 0, u = na === e && e[On];
  if (u) {
    var l = s.indexOf(u);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[On] = t;
      return;
    }
    var c = s.indexOf(t);
    if (c === -1)
      return;
    l <= c && (o = l);
  }
  if (i = /** @type {Element} */
  s[o] || e.target, i !== t) {
    vs(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = ie, v = ae;
    ft(null), Ct(null);
    try {
      for (var d, h = []; i !== null && i !== t; ) {
        try {
          var _ = i[On]?.[r];
          _ != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && _.call(i, e);
        } catch (w) {
          d ? h.push(w) : d = w;
        }
        if (e.cancelBubble) break;
        o++, i = o < s.length ? (
          /** @type {Element} */
          s[o]
        ) : null;
      }
      if (d) {
        for (let w of h)
          queueMicrotask(() => {
            throw w;
          });
        throw d;
      }
    } finally {
      e[On] = t, delete e.currentTarget, ft(g), Ct(v);
    }
  }
}
const Pi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Ci(e) {
  return (
    /** @type {string} */
    Pi?.createHTML(e) ?? e
  );
}
function Oi(e) {
  var t = bi("template");
  return t.innerHTML = Ci(e.replaceAll("<!>", "<!---->")), t.content;
}
function ir(e, t) {
  var n = (
    /** @type {Effect} */
    ae
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var n = (t & Us) !== 0, r = (t & Gs) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = Oi(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ ar(s)));
    var o = (
      /** @type {TemplateNode} */
      r || za ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ar(o)
      ), l = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      ir(u, l);
    } else
      ir(o, o);
    return o;
  };
}
function ra(e = "") {
  {
    var t = Dt(e + "");
    return ir(t, t), t;
  }
}
function Gr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Dt();
  return e.append(t, n), ir(t, n), e;
}
function P(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function M(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[Mr] ??= e.nodeValue) && (e[Mr] = n, e.nodeValue = `${n}`);
}
function Ii(e, t) {
  return Ni(e, t);
}
const Un = /* @__PURE__ */ new Map();
function Ni(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: o = !0, transformError: u }) {
  gi();
  var l = void 0, c = yi(() => {
    var g = n ?? t.appendChild(Dt());
    ri(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (h) => {
        St({});
        var _ = (
          /** @type {ComponentContext} */
          $e
        );
        i && (_.c = i), s && (r.$$events = s), l = e(h, r) || {}, Et();
      },
      u
    );
    var v = /* @__PURE__ */ new Set(), d = (h) => {
      for (var _ = 0; _ < h.length; _++) {
        var w = h[_];
        if (!v.has(w)) {
          v.add(w);
          var f = Ri(w);
          for (const C of [t, document]) {
            var p = Un.get(C);
            p === void 0 && (p = /* @__PURE__ */ new Map(), Un.set(C, p));
            var x = p.get(w);
            x === void 0 ? (C.addEventListener(w, Cr, { passive: f }), p.set(w, 1)) : p.set(w, x + 1);
          }
        }
      }
    };
    return d(or(ns)), Pr.add(d), () => {
      for (var h of v)
        for (const f of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            Un.get(f)
          ), w = (
            /** @type {number} */
            _.get(h)
          );
          --w == 0 ? (f.removeEventListener(h, Cr), _.delete(h), _.size === 0 && Un.delete(f)) : _.set(h, w);
        }
      Pr.delete(d), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return Fi.set(l, c), l;
}
let Fi = /* @__PURE__ */ new WeakMap();
class Li {
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
        sr(r), this.#o.delete(n);
      else {
        var s = this.#e.get(n);
        s && (sr(s.effect), this.#i.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
      }
      for (const [i, o] of this.#t) {
        if (this.#t.delete(i), i === t)
          break;
        const u = this.#e.get(o);
        u && (Qe(u.effect), this.#e.delete(o));
      }
      for (const [i, o] of this.#i) {
        if (i === n || this.#o.has(i)) continue;
        const u = () => {
          if (Array.from(this.#t.values()).includes(i)) {
            var c = document.createDocumentFragment();
            Ur(o, c), c.append(Dt()), this.#e.set(i, { effect: o, fragment: c });
          } else
            Qe(o);
          this.#o.delete(i), this.#i.delete(i);
        };
        this.#r || !r ? (this.#o.add(i), en(o, u, !1)) : u();
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
      n.includes(r) || (Qe(s.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      de
    ), s = ja();
    if (n && !this.#i.has(t) && !this.#e.has(t))
      if (s) {
        var i = document.createDocumentFragment(), o = Dt();
        i.append(o), this.#e.set(t, {
          effect: ot(() => n(o)),
          fragment: i
        });
      } else
        this.#i.set(
          t,
          ot(() => n(this.anchor))
        );
    if (this.#t.set(r, t), s) {
      for (const [u, l] of this.#i)
        u === t ? r.unskip_effect(l) : r.skip_effect(l);
      for (const [u, l] of this.#e)
        u === t ? r.unskip_effect(l.effect) : r.skip_effect(l.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function W(e, t, n = !1) {
  var r = new Li(e), s = n ? bn : 0;
  function i(o, u) {
    r.ensure(o, u);
  }
  Br(() => {
    var o = !1;
    t((u, l = 0) => {
      o = !0, i(l, u);
    }), o || i(-1, null);
  }, s);
}
function bt(e, t) {
  return t;
}
function Di(e, t, n) {
  for (var r = [], s = t.length, i, o = t.length, u = 0; u < s; u++) {
    let v = t[u];
    en(
      v,
      () => {
        if (i) {
          if (i.pending.delete(v), i.done.add(v), i.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Or(e, or(i.done)), d.delete(i), d.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var l = r.length === 0 && n !== null;
    if (l) {
      var c = (
        /** @type {Element} */
        n
      ), g = (
        /** @type {Element} */
        c.parentNode
      );
      _i(g), g.append(c), e.items.clear();
    }
    Or(e, t, !l);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function Or(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const o of e.pending.values())
      for (const u of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(u).e
        );
  }
  for (var s = 0; s < t.length; s++) {
    var i = t[s];
    if (r?.has(i)) {
      i.f |= At;
      const o = document.createDocumentFragment();
      Ur(i, o);
    } else
      Qe(t[s], n);
  }
}
var aa;
function Ye(e, t, n, r, s, i = null) {
  var o = e, u = /* @__PURE__ */ new Map(), l = (t & xa) !== 0;
  if (l) {
    var c = (
      /** @type {Element} */
      e
    );
    o = c.appendChild(Dt());
  }
  var g = null, v = /* @__PURE__ */ Pa(() => {
    var C = n();
    return (
      /** @type {V[]} */
      Lr(C) ? C : C == null ? [] : or(C)
    );
  }), d, h = /* @__PURE__ */ new Map(), _ = !0;
  function w(C) {
    (x.effect.f & nt) === 0 && (x.pending.delete(C), x.fallback = g, zi(x, d, o, t, r), g !== null && (d.length === 0 ? (g.f & At) === 0 ? sr(g) : (g.f ^= At, In(g, null, o)) : en(g, () => {
      g = null;
    })));
  }
  function f(C) {
    x.pending.delete(C);
  }
  var p = Br(() => {
    d = /** @type {V[]} */
    a(v);
    for (var C = d.length, O = /* @__PURE__ */ new Set(), E = (
      /** @type {Batch} */
      de
    ), F = ja(), B = 0; B < C; B += 1) {
      var R = d[B], z = r(R, B), L = _ ? null : u.get(z);
      L ? (L.v && wn(L.v, R), L.i && wn(L.i, B), F && E.unskip_effect(L.e)) : (L = qi(
        u,
        _ ? o : aa ??= Dt(),
        R,
        z,
        B,
        s,
        t,
        n
      ), _ || (L.e.f |= At), u.set(z, L)), O.add(z);
    }
    if (C === 0 && i && !g && (_ ? g = ot(() => i(o)) : (g = ot(() => i(aa ??= Dt())), g.f |= At)), C > O.size && Ts(), !_)
      if (h.set(E, O), F) {
        for (const [H, N] of u)
          O.has(H) || E.skip_effect(N.e);
        E.oncommit(w), E.ondiscard(f);
      } else
        w(E);
    a(v);
  }), x = { effect: p, items: u, pending: h, outrogroups: null, fallback: g };
  _ = !1;
}
function An(e) {
  for (; e !== null && (e.f & ct) === 0; )
    e = e.next;
  return e;
}
function zi(e, t, n, r, s) {
  var i = (r & zs) !== 0, o = t.length, u = e.items, l = An(e.effect.first), c, g = null, v, d = [], h = [], _, w, f, p;
  if (i)
    for (p = 0; p < o; p += 1)
      _ = t[p], w = s(_, p), f = /** @type {EachItem} */
      u.get(w).e, (f.f & At) === 0 && (f.nodes?.a?.measure(), (v ??= /* @__PURE__ */ new Set()).add(f));
  for (p = 0; p < o; p += 1) {
    if (_ = t[p], w = s(_, p), f = /** @type {EachItem} */
    u.get(w).e, e.outrogroups !== null)
      for (const L of e.outrogroups)
        L.pending.delete(f), L.done.delete(f);
    if ((f.f & Ve) !== 0 && (sr(f), i && (f.nodes?.a?.unfix(), (v ??= /* @__PURE__ */ new Set()).delete(f))), (f.f & At) !== 0)
      if (f.f ^= At, f === l)
        In(f, null, n);
      else {
        var x = g ? g.next : l;
        f === e.effect.last && (e.effect.last = f.prev), f.prev && (f.prev.next = f.next), f.next && (f.next.prev = f.prev), $t(e, g, f), $t(e, f, x), In(f, x, n), g = f, d = [], h = [], l = An(g.next);
        continue;
      }
    if (f !== l) {
      if (c !== void 0 && c.has(f)) {
        if (d.length < h.length) {
          var C = h[0], O;
          g = C.prev;
          var E = d[0], F = d[d.length - 1];
          for (O = 0; O < d.length; O += 1)
            In(d[O], C, n);
          for (O = 0; O < h.length; O += 1)
            c.delete(h[O]);
          $t(e, E.prev, F.next), $t(e, g, E), $t(e, F, C), l = C, g = F, p -= 1, d = [], h = [];
        } else
          c.delete(f), In(f, l, n), $t(e, f.prev, f.next), $t(e, f, g === null ? e.effect.first : g.next), $t(e, g, f), g = f;
        continue;
      }
      for (d = [], h = []; l !== null && l !== f; )
        (c ??= /* @__PURE__ */ new Set()).add(l), h.push(l), l = An(l.next);
      if (l === null)
        continue;
    }
    (f.f & At) === 0 && d.push(f), g = f, l = An(f.next);
  }
  if (e.outrogroups !== null) {
    for (const L of e.outrogroups)
      L.pending.size === 0 && (Or(e, or(L.done)), e.outrogroups?.delete(L));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || c !== void 0) {
    var B = [];
    if (c !== void 0)
      for (f of c)
        (f.f & Ve) === 0 && B.push(f);
    for (; l !== null; )
      (l.f & Ve) === 0 && l !== e.fallback && B.push(l), l = An(l.next);
    var R = B.length;
    if (R > 0) {
      var z = (r & xa) !== 0 && o === 0 ? n : null;
      if (i) {
        for (p = 0; p < R; p += 1)
          B[p].nodes?.a?.measure();
        for (p = 0; p < R; p += 1)
          B[p].nodes?.a?.fix();
      }
      Di(e, B, z);
    }
  }
  i && Lt(() => {
    if (v !== void 0)
      for (f of v)
        f.nodes?.a?.apply();
  });
}
function qi(e, t, n, r, s, i, o, u) {
  var l = (o & Ls) !== 0 ? (o & qs) === 0 ? /* @__PURE__ */ di(n, !1, !1) : rn(n) : null, c = (o & Ds) !== 0 ? rn(s) : null;
  return {
    v: l,
    i: c,
    e: ot(() => (i(t, l ?? n, c ?? s, u), () => {
      e.delete(r);
    }))
  };
}
function In(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & At) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ jn(r)
      );
      if (i.before(r), r === s)
        return;
      r = o;
    }
}
function $t(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Gn(e, t, n) {
  $a(() => {
    var r = an(() => t(e, n?.()) || {});
    if (r?.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
const sa = [...` 	
\r\f \v\uFEFF`];
function Hi(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s of Object.keys(n))
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var i = s.length, o = 0; (o = r.indexOf(s, o)) >= 0; ) {
          var u = o + i;
          (o === 0 || sa.includes(r[o - 1])) && (u === r.length || sa.includes(r[u])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(u + 1) : o = u;
        }
  }
  return r === "" ? null : r;
}
function ia(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var s of Object.keys(e)) {
    var i = e[s];
    i != null && i !== "" && (r += " " + s + ": " + i + n);
  }
  return r;
}
function ji(e, t) {
  if (t) {
    var n = "", r, s;
    return Array.isArray(t) ? (r = t[0], s = t[1]) : r = t, r && (n += ia(r)), s && (n += ia(s, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Me(e, t, n, r, s, i) {
  var o = (
    /** @type {any} */
    e[Er]
  );
  if (o !== n || o === void 0) {
    var u = Hi(n, r, i);
    u == null ? e.removeAttribute("class") : e.className = u, e[Er] = n;
  } else if (i && s !== i)
    for (var l in i) {
      var c = !!i[l];
      (s == null || c !== !!s[l]) && e.classList.toggle(l, c);
    }
  return i;
}
function br(e, t = {}, n, r) {
  for (var s in n) {
    var i = n[s];
    t[s] !== i && (n[s] == null ? e.style.removeProperty(s) : e.style.setProperty(s, i, r));
  }
}
function Nn(e, t, n, r) {
  var s = (
    /** @type {any} */
    e[Tr]
  );
  if (s !== t) {
    var i = ji(t, r);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[Tr] = t;
  } else r && (Array.isArray(r) ? (br(e, n?.[0], r[0]), br(e, n?.[1], r[1], "important")) : br(e, n, r));
  return r;
}
function Fn(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Lr(t))
      return Ws();
    for (var r of e.options)
      r.selected = t.includes(la(r));
    return;
  }
  for (r of e.options) {
    var s = la(r);
    if (pi(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Yn(e) {
  var t = new MutationObserver(() => {
    "__value" in e && Fn(e, e.__value);
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
  }), cr(() => {
    t.disconnect();
  });
}
function la(e) {
  return "__value" in e ? e.__value : e.value;
}
const Bi = Symbol("is custom element"), $i = Symbol("is html"), Ui = ks ? "progress" : "PROGRESS";
function dn(e, t) {
  var n = Yr(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== Ui) || (e.value = t ?? "");
}
function Gi(e, t) {
  var n = Yr(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function he(e, t, n, r) {
  var s = Yr(e);
  s[t] !== (s[t] = n) && (t === "loading" && (e[xs] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Yi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Yr(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[ya] ??= {
      [Bi]: e.nodeName.includes("-"),
      [$i]: e.namespaceURI === Ys
    }
  );
}
var oa = /* @__PURE__ */ new Map();
function Yi(e) {
  var t = e.getAttribute("is") || e.nodeName, n = oa.get(t);
  if (n) return n;
  oa.set(t, n = []);
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = ps(s);
    for (var o in r)
      r[o].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.push(o);
    s = ba(s);
  }
  return n;
}
function mr(e, t) {
  return e === t || e?.[Zt] === t;
}
function Ir(e = {}, t, n, r) {
  var s = (
    /** @type {ComponentContext} */
    $e.r
  ), i = (
    /** @type {Effect} */
    ae
  );
  return $a(() => {
    var o, u;
    return Ua(() => {
      o = u, u = [], an(() => {
        mr(n(...u), e) || (t(e, ...u), o && mr(n(...o), e) && t(null, ...o));
      });
    }), () => {
      let l = i;
      for (; l !== s && l.parent !== null && l.parent.f & Sr; )
        l = l.parent;
      const c = () => {
        u && mr(n(...u), e) && t(null, ...u);
      }, g = l.teardown;
      l.teardown = () => {
        c(), g?.();
      };
    };
  }), e;
}
function Vi(e, t) {
  ei(window, ["resize"], () => Tn(() => t(window[e])));
}
function ne(e, t, n, r) {
  var s = !0, i = (n & Bs) !== 0, o = (n & $s) !== 0, u = (
    /** @type {V} */
    r
  ), l = !0, c = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => o && s ? (c ??= /* @__PURE__ */ zn(
    /** @type {() => V} */
    r
  ), a(c)) : (l && (l = !1, u = o ? an(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), u);
  let v;
  if (i) {
    var d = Zt in e || ys in e;
    v = pn(e, t)?.set ?? (d && t in e ? (O) => e[t] = O : void 0);
  }
  var h, _ = !1;
  i ? [h, _] = Qs(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && r !== void 0 && (h = g(), v && (Cs(), v(h)));
  var w;
  if (w = () => {
    var O = (
      /** @type {V} */
      e[t]
    );
    return O === void 0 ? g() : (l = !0, O);
  }, (n & js) === 0)
    return w;
  if (v) {
    var f = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(O, E) {
        return arguments.length > 0 ? ((!E || f || _) && v(E ? w() : O), O) : w();
      })
    );
  }
  var p = !1, x = ((n & Hs) !== 0 ? zn : Pa)(() => (p = !1, w()));
  i && a(x);
  var C = (
    /** @type {Effect} */
    ae
  );
  return (
    /** @type {() => V} */
    (function(O, E) {
      if (arguments.length > 0) {
        const F = E ? a(x) : i ? De(O) : O;
        return T(x, F), p = !0, u !== void 0 && (u = F), O;
      }
      return qt && p || (C.f & nt) !== 0 ? x.v : a(x);
    })
  );
}
function fr(e) {
  $e === null && Ss(), yn(() => {
    const t = an(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Wi = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Wi);
function Xi(e) {
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
async function Ut(e, t = {}) {
  const n = await fetch(e + Xi(t));
  if (!n.ok) {
    const r = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  }
  return n.json();
}
async function fn(e, t) {
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
function ua(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const Be = {
  // --- reads
  photos: (e) => Ut("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => Ut("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => Ut("/api/triage/counts", { ...ua(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Ut("/api/triage/files"),
  screen: (e, t = {}) => Ut("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Ut("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Ut("/api/triage/page", { ...ua(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Ut("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => fn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => fn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => fn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => fn("/api/triage/override", { sha256: e, decision: t }),
  // --- the one surface that leaves the process
  revealPhoto: (e) => fn("/api/reveal", { id: e }),
  revealOrigin: (e) => fn("/api/reveal", { origin: e })
};
function Ki() {
  let e = 0, t = 0;
  return async function(r) {
    const s = ++e, i = await r();
    return s <= t ? { stale: !0, value: void 0 } : (t = s, { stale: !1, value: i });
  };
}
function Ji(e, t) {
  let n = 0;
  const r = (...s) => {
    clearTimeout(n), n = setTimeout(() => e(...s), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...s) => {
    clearTimeout(n), e(...s);
  }, r;
}
const ca = ["B", "KB", "MB", "GB", "TB"];
function gt(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < ca.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${ca[n]}`;
}
function Te(e) {
  return (Number(e) || 0).toLocaleString();
}
const kn = "G:\\photos", fa = [
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
      value: t ? `${kn}\\${t}\\${e.key}` : `${kn}\\${e.key}`
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
function rs(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), r = kn.toLowerCase();
  return n.toLowerCase().startsWith(r + "\\") ? n : "";
}
function Vr(e, t) {
  const n = t.toLowerCase();
  return e.some((r) => n === r || n.startsWith(r + "\\"));
}
function Zi(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function Qi(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function as(e, t) {
  if (!t) return null;
  const n = e.find(
    (r) => r.term && r.term.column === t.column && r.term.op === t.op && Qi(r.term.value, t.value)
  );
  return n ? n.decision : null;
}
var el = /* @__PURE__ */ I('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), tl = /* @__PURE__ */ I('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), nl = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7">…</div>'), rl = /* @__PURE__ */ I('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), al = /* @__PURE__ */ I('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), sl = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7"> </div>'), il = /* @__PURE__ */ I('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function ll(e, t) {
  St(t, !0);
  let n = ne(t, "counts", 3, null), r = ne(t, "files", 3, null), s = ne(t, "filesAt", 3, null), i = ne(t, "stale", 3, !1), o = ne(t, "candidate", 3, null), u = ne(t, "busy", 3, !1);
  const l = /* @__PURE__ */ te(() => n() && o() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var c = il(), g = b(c);
  let v;
  var d = m(b(g), 2);
  {
    var h = (z) => {
      var L = tl(), H = yt(L), N = b(H), G = b(N), J = m(N, 2), Q = b(J), se = m(J, 4), le = b(se), Z = m(se, 2), ee = b(Z), be = m(H, 2);
      {
        var D = (S) => {
          var y = el(), A = m(b(y), 2), $ = b(A), ce = m(A, 2), ve = b(ce), re = m(ce, 4), Re = b(re), We = m(re, 2), we = b(We), Ae = m(We, 2), Xe = b(Ae);
          j(
            (Ue, q, Y, X, pe) => {
              M($, `kept ${Ue ?? ""}`), M(ve, q), M(Re, `excluded ${Y ?? ""}`), M(we, X), M(Xe, `${a(l) >= 0 ? "+" : ""}${pe ?? ""} excluded`);
            },
            [
              () => Te(n().candidate_kept_paths),
              () => gt(n().candidate_kept_bytes),
              () => Te(n().candidate_excluded_paths),
              () => gt(n().candidate_excluded_bytes),
              () => Te(a(l))
            ]
          ), P(S, y);
        };
        W(be, (S) => {
          o() && S(D);
        });
      }
      j(
        (S, y, A, $) => {
          M(G, `kept ${S ?? ""}`), M(Q, y), M(le, `excluded ${A ?? ""}`), M(ee, $);
        },
        [
          () => Te(n().kept_paths),
          () => gt(n().kept_bytes),
          () => Te(n().excluded_paths),
          () => gt(n().excluded_bytes)
        ]
      ), P(z, L);
    }, _ = (z) => {
      var L = nl();
      P(z, L);
    };
    W(d, (z) => {
      n() ? z(h) : z(_, -1);
    });
  }
  var w = m(g, 2);
  let f;
  var p = b(w), x = m(b(p), 3), C = b(x), O = m(x, 2);
  {
    var E = (z) => {
      var L = rl();
      P(z, L);
    };
    W(O, (z) => {
      i() && r() && r() !== "loading" && z(E);
    });
  }
  var F = m(p, 2);
  {
    var B = (z) => {
      var L = al(), H = yt(L);
      let N;
      var G = b(H), J = b(G), Q = m(G, 2), se = b(Q), le = m(Q, 4), Z = b(le), ee = m(le, 2), be = b(ee), D = m(H, 2), S = b(D);
      j(
        (y, A, $, ce) => {
          N = Me(H, 1, "line svelte-1vgp6n7", null, N, { outdated: i() }), M(J, `kept ${y ?? ""}`), M(se, A), M(Z, `excluded ${$ ?? ""}`), M(be, ce), M(S, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Te(r().kept_files),
          () => gt(r().kept_bytes),
          () => Te(r().excluded_files),
          () => gt(r().excluded_bytes)
        ]
      ), P(z, L);
    }, R = (z) => {
      var L = sl(), H = b(L);
      j(() => M(H, r() === "loading" ? "counting…" : "not counted yet")), P(z, L);
    };
    W(F, (z) => {
      r() && r() !== "loading" ? z(B) : z(R, -1);
    });
  }
  j(() => {
    v = Me(g, 1, "block svelte-1vgp6n7", null, v, { busy: u() }), f = Me(w, 1, "block svelte-1vgp6n7", null, f, { busy: r() === "loading" }), x.disabled = r() === "loading", M(C, r() === "loading" ? "counting…" : "recount");
  }), K("click", x, function(...z) {
    t.onfiles?.apply(this, z);
  }), P(e, c), Et();
}
jt(["click"]);
const Nr = "http://www.w3.org/2000/svg", Kt = {
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
}, Yt = {
  ...Kt,
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
}, ol = [
  { dark: "tint", light: "tintLight", base: Kt },
  { dark: "control", light: "controlLight", base: Yt },
  { dark: "ink", light: "inkLight", base: Yt },
  { dark: "tally", light: "tallyLight", base: Yt },
  { dark: "tallyInk", light: "tallyInkLight", base: Yt }
], Fr = /* @__PURE__ */ new Set();
let _t = { ...Yt };
function ul() {
  return _t;
}
function wr(e) {
  _t = dl(e), Wr();
  for (const t of Fr) t(_t);
  return _t;
}
function cl(e) {
  return Fr.add(e), () => Fr.delete(e);
}
function Ln(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function fl(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: Fe(Ln(e.r, t.r), 0, 255),
    g: Fe(Ln(e.g, t.g), 0, 255),
    b: Fe(Ln(e.b, t.b), 0, 255),
    a: Fe(Ln(e.a, t.a), 0, 1)
  };
}
function dl(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [r, s] of Object.entries(Yt))
    typeof s == "boolean" ? n[r] = t[r] === void 0 ? s : !!t[r] : typeof s == "object" ? n[r] = fl(t[r], s) : n[r] = Ln(t[r], s);
  return n;
}
function it({ r: e, g: t, b: n, a: r }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${ke(r, 3)})`;
}
function ke(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function da({ r: e, g: t, b: n, a: r }) {
  return { r: e, g: t, b: n, a: Fe(r * 1.7 + 0.22, 0, 1) };
}
function ha(e, t) {
  const n = 0.4 + Fe(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - Fe(t, 0, 100) / 100) };
}
function va(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, s = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? Fe(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * s * Math.max(t.glareFactor, 0) / 100;
  return Fe(i ** (0.1 + Fe(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const hl = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function vl(e, t, n) {
  const r = Fe(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, o = Math.min(n.shapeRadius, s, i), u = s - o, l = i - o, c = 8, g = [];
  for (let h = 0; h <= c; h++) {
    const _ = h / c * (Math.PI / 2);
    g.push([o * Math.cos(_) ** (2 / r), o * Math.sin(_) ** (2 / r)]);
  }
  const v = [], d = (h, _, w, f) => {
    let p = Math.atan2(h, -_);
    p < 0 && (p += Math.PI * 2);
    let x = Math.atan2(f, w);
    x < 0 && (x += Math.PI * 2);
    const C = ke(va(x, n), 3);
    v.push(`rgba(255, 255, 255, ${C}) ${ke(p / (Math.PI * 2) * 100, 2)}%`);
  };
  d(0, -i, 0, 1);
  for (const [h, _, w] of hl)
    for (let f = 0; f <= c; f++) {
      const [p, x] = g[w ? c - f : f];
      d(h * (u + p), _ * (l + x), h * p ** (r - 1), -_ * x ** (r - 1));
    }
  return v.push(`rgba(255, 255, 255, ${ke(va(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${v.join(", ")})`;
}
function Wr() {
  const e = _t, t = document.documentElement.style, n = ha(e.refFresnelRange, e.refFresnelHardness), r = ha(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${ke(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${ke(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", it(e.tint)), t.setProperty("--glass-tint-light", it(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", it(da(e.tint))), t.setProperty("--glass-tint-sheet-light", it(da(e.tintLight))), t.setProperty("--glass-ctl-dark", it(e.control)), t.setProperty("--glass-ctl-light", it(e.controlLight)), t.setProperty("--glass-text-dark", it(e.ink)), t.setProperty("--glass-text-light", it(e.inkLight)), t.setProperty("--glass-tint-tally-dark", it(e.tally)), t.setProperty("--glass-tint-tally-light", it(e.tallyLight)), t.setProperty("--glass-text-tally-dark", it(e.tallyInk)), t.setProperty("--glass-text-tally-light", it(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${ke(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${ke(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${ke(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${ke(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${ke(e.shadowX)}px ${ke(-e.shadowY)}px ${ke(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(ke(Fe(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${ke(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(ke(Math.log2(Fe(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${ke(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${ke(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${ke(Fe(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${ke(r.width)}px`), t.setProperty("--glass-glare-blur", `${ke(r.blur)}px`);
}
function Fe(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function pl(e, t, n, r, s, i) {
  const o = Math.abs(e) - n + s, u = Math.abs(t) - r + s, l = Math.max(o, 0), c = Math.max(u, 0), g = i === 2 ? Math.hypot(l, c) : (l ** i + c ** i) ** (1 / i);
  return Math.min(Math.max(o, u), 0) + g - s;
}
function gl(e, t, n) {
  const r = e / 2, s = t / 2, i = Fe(n.shapeRoundness, 2, 7), o = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), l = Math.max(1.0001, n.refFactor), c = (d, h) => pl(d - r, h - s, r, s, o, i), g = 256, v = new Float32Array(g + 1);
  for (let d = 0; d <= g; d++) {
    const h = 1 - d / g, _ = Math.asin(Fe(h * h, 0, 1)), w = Math.asin(Fe(Math.sin(_) / l, 0, 1));
    v[d] = Math.tan(_ - w) * u;
  }
  return (d, h) => {
    const _ = -c(d, h);
    if (_ < 0 || _ >= u) return null;
    const w = v[Math.round(_ / u * g)];
    if (w === 0) return null;
    const f = 0.75, p = c(d + f, h) - c(d - f, h), x = c(d, h + f) - c(d, h - f), C = Math.hypot(p, x);
    if (C === 0) return null;
    const O = -w / C;
    return { dx: p * O, dy: x * O };
  };
}
function _l(e, t, n) {
  const r = document.createElement("canvas");
  r.width = e, r.height = t;
  const s = r.getContext("2d"), i = s.createImageData(e, t), o = i.data, u = e * t, l = new Float32Array(u), c = new Float32Array(u);
  let g = 0;
  for (let d = 0; d < t; d++)
    for (let h = 0; h < e; h++) {
      const _ = n(h + 0.5, d + 0.5);
      if (!_) continue;
      const w = d * e + h;
      l[w] = _.dx, c[w] = _.dy;
      const f = Math.hypot(_.dx, _.dy);
      f > g && (g = f);
    }
  const v = g > 0 ? 127 / g : 0;
  for (let d = 0; d < u; d++) {
    const h = d * 4;
    o[h] = 128 + Fe(Math.round(l[d] * v), -127, 127), o[h + 1] = 128 + Fe(Math.round(c[d] * v), -127, 127), o[h + 2] = 128, o[h + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: r.toDataURL(), scale: g * 2 };
}
const yr = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function xr(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${ke(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let Pn = null, bl = 0;
function ml() {
  if (Pn) return Pn;
  const e = document.createElementNS(Nr, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), Pn = document.createElementNS(Nr, "defs"), e.appendChild(Pn), document.body.appendChild(e), Pn;
}
function Vn(e) {
  const t = `glass-refract-${++bl}`, n = document.createElementNS(Nr, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), ml().appendChild(n);
  let r = 0, s = 0, i = 0, o = 0;
  const u = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let l = null, c = "";
  function g() {
    e.style.setProperty("--glass-pre", _t.blurEdge ? "" : c), e.style.setProperty("--glass-post", _t.blurEdge ? c : "");
  }
  function v() {
    r < 2 || s < 2 || e.style.setProperty("--glass-glare", vl(r, s, _t));
  }
  function d() {
    if (r < 2 || s < 2) return;
    const f = _t, p = _l(r, s, gl(r, s, f)), x = f.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(r)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${r}" height="${s}" preserveAspectRatio="none" href="${p.url}" result="map"/>` + xr(p.scale * (1 + x), yr[0], "r") + xr(p.scale, yr[1], "g") + xr(p.scale * (1 - x), yr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, c = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (c = "", g()), l = u.map((C) => _t[C]).join(" ");
  }
  function h() {
    o || (o = requestAnimationFrame(() => {
      o = 0, d();
    }));
  }
  const _ = new ResizeObserver(([f]) => {
    const p = f.borderBoxSize?.[0], x = p ? { w: Math.round(p.inlineSize), h: Math.round(p.blockSize) } : { w: Math.round(f.contentRect.width), h: Math.round(f.contentRect.height) };
    x.w === r && x.h === s || (r = x.w, s = x.h, v(), h());
  });
  _.observe(e);
  const w = cl(() => {
    v(), u.map((f) => _t[f]).join(" ") !== l ? h() : g();
  });
  return {
    destroy() {
      o && cancelAnimationFrame(o), w(), _.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const ss = "photos.theme", is = "dark";
function ls() {
  return document.documentElement.dataset.theme === "light" ? "light" : is;
}
function wl() {
  const e = localStorage.getItem(ss), t = e === "dark" || e === "light" ? e : is;
  return document.documentElement.dataset.theme = t, t;
}
function os(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(ss, e), e;
}
var yl = /* @__PURE__ */ I('<span class="spin svelte-zne36e" aria-label="loading"></span>'), xl = /* @__PURE__ */ I('<span class="badge svelte-zne36e"> </span>'), kl = /* @__PURE__ */ I('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Sl = /* @__PURE__ */ I('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), El = /* @__PURE__ */ I("<button> </button>"), Tl = /* @__PURE__ */ I('<div class="glass sheet sorts svelte-zne36e"></div>'), Ml = /* @__PURE__ */ I('<p class="muted svelte-zne36e">loading…</p>'), Rl = /* @__PURE__ */ I('<span class="help svelte-zne36e">?</span>'), Al = /* @__PURE__ */ I('<span class="n svelte-zne36e"> </span>'), Pl = /* @__PURE__ */ I("<button> <!></button>"), Cl = /* @__PURE__ */ I('<span class="muted svelte-zne36e">nothing here</span>'), Ol = /* @__PURE__ */ I('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Il = /* @__PURE__ */ I('<div class="glass sheet filters svelte-zne36e"><!></div>'), Nl = /* @__PURE__ */ I('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!></div></div>');
function Fl(e, t) {
  St(t, !0);
  let n = ne(t, "facets", 3, null), r = ne(t, "selected", 19, () => ({})), s = ne(t, "sort", 3, "newest"), i = ne(t, "total", 3, null), o = ne(t, "loading", 3, !1), u = ne(t, "onselect", 3, () => {
  }), l = ne(t, "onsort", 3, () => {
  }), c = ne(t, "onclear", 3, () => {
  }), g = ne(t, "ontriage", 3, () => {
  }), v = /* @__PURE__ */ V(
    ""
    // "" | "sort" | "filters"
  ), d = /* @__PURE__ */ V(De(ls())), h = /* @__PURE__ */ V(null);
  const _ = /* @__PURE__ */ te(() => n()?.dimensions ?? []), w = /* @__PURE__ */ te(() => n()?.sorts ?? []), f = /* @__PURE__ */ te(() => a(w).find((q) => q.value === s())?.label ?? s()), p = /* @__PURE__ */ te(() => Object.values(r()).reduce((q, Y) => q + Y.length, 0)), x = /* @__PURE__ */ te(() => a(_).flatMap((q) => (r()[q.name] ?? []).map((Y) => ({
    dimension: q.name,
    value: Y,
    title: q.title,
    label: q.options.find((X) => X.value === Y)?.label ?? String(Y)
  }))));
  function C(q, Y) {
    const X = r()[q] ?? [], pe = X.includes(Y) ? X.filter((fe) => fe !== Y) : [...X, Y];
    u()(q, pe);
  }
  function O(q, Y) {
    return (r()[q] ?? []).includes(Y);
  }
  function E() {
    T(d, os(a(d) === "dark" ? "light" : "dark"), !0);
  }
  function F(q) {
    q.key === "Escape" && T(v, "");
  }
  function B(q) {
    a(v) && !q.target.closest(".topbar") && T(v, "");
  }
  fr(() => {
    const q = new ResizeObserver(([Y]) => {
      const X = Math.round(Y.borderBoxSize?.[0]?.blockSize ?? Y.contentRect.height);
      document.documentElement.style.setProperty("--header-h", X + "px");
    });
    return q.observe(a(h)), () => {
      q.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var R = Nl();
  ta("keydown", rr, F), ta("pointerdown", rr, B);
  var z = b(R), L = b(z), H = b(L), N = m(L, 2), G = b(N), J = m(N, 2);
  {
    var Q = (q) => {
      var Y = yl();
      P(q, Y);
    };
    W(J, (q) => {
      o() && q(Q);
    });
  }
  Gn(z, (q) => Vn?.(q));
  var se = m(z, 2), le = b(se), Z = b(le), ee = b(Z);
  let be;
  var D = b(ee), S = m(ee, 2);
  let y;
  var A = m(b(S));
  {
    var $ = (q) => {
      var Y = xl(), X = b(Y);
      j(() => M(X, a(p))), P(q, Y);
    };
    W(A, (q) => {
      a(p) && q($);
    });
  }
  var ce = m(S, 2);
  {
    var ve = (q) => {
      var Y = Sl(), X = b(Y);
      Ye(X, 17, () => a(x), (fe) => fe.dimension + " " + fe.value, (fe, ue) => {
        var ge = kl(), He = b(ge), et = b(He), qe = m(He, 1, !0);
        j(() => {
          he(ge, "title", `${a(ue).title ?? ""}: ${a(ue).label ?? ""} — click to remove`), M(et, a(ue).title), M(qe, a(ue).label);
        }), K("click", ge, () => C(a(ue).dimension, a(ue).value)), P(fe, ge);
      });
      var pe = m(X, 2);
      K("click", pe, () => c()()), P(q, Y);
    };
    W(ce, (q) => {
      a(x).length && q(ve);
    });
  }
  var re = m(Z, 2), Re = b(re), We = m(re, 2);
  Gn(le, (q) => Vn?.(q));
  var we = m(le, 2);
  {
    var Ae = (q) => {
      var Y = Tl();
      Ye(Y, 21, () => a(w), bt, (X, pe) => {
        var fe = El();
        let ue;
        var ge = b(fe);
        j(() => {
          ue = Me(fe, 1, "option svelte-zne36e", null, ue, { on: a(pe).value === s() }), M(ge, a(pe).label);
        }), K("click", fe, () => {
          l()(a(pe).value), T(v, "");
        }), P(X, fe);
      }), Gn(Y, (X) => Vn?.(X)), P(q, Y);
    };
    W(we, (q) => {
      a(v) === "sort" && q(Ae);
    });
  }
  var Xe = m(we, 2);
  {
    var Ue = (q) => {
      var Y = Il(), X = b(Y);
      {
        var pe = (ue) => {
          var ge = Ml();
          P(ue, ge);
        }, fe = (ue) => {
          var ge = Gr(), He = yt(ge);
          Ye(He, 17, () => a(_), bt, (et, qe) => {
            var Tt = Ol(), Ke = b(Tt), je = b(Ke), dt = m(je);
            {
              var Ot = (Pe) => {
                var me = Rl();
                j(() => he(me, "title", a(qe).hint)), P(Pe, me);
              };
              W(dt, (Pe) => {
                a(qe).hint && Pe(Ot);
              });
            }
            var ht = m(Ke, 2), It = b(ht);
            Ye(It, 17, () => a(qe).options, bt, (Pe, me) => {
              var k = Pl();
              let U;
              var oe = b(k), _e = m(oe);
              {
                var Je = (ye) => {
                  var vt = Al(), Ge = b(vt);
                  j((Ee) => M(Ge, Ee), [() => Te(a(me).count)]), P(ye, vt);
                };
                W(_e, (ye) => {
                  a(me).count !== null && ye(Je);
                });
              }
              j(
                (ye) => {
                  U = Me(k, 1, "option svelte-zne36e", null, U, ye), M(oe, `${a(me).label ?? ""} `);
                },
                [
                  () => ({ on: O(a(qe).name, a(me).value) })
                ]
              ), K("click", k, () => C(a(qe).name, a(me).value)), P(Pe, k);
            });
            var Mt = m(It, 2);
            {
              var Rt = (Pe) => {
                var me = Cl();
                P(Pe, me);
              };
              W(Mt, (Pe) => {
                a(qe).options.length || Pe(Rt);
              });
            }
            j(() => M(je, `${a(qe).title ?? ""} `)), P(et, Tt);
          }), P(ue, ge);
        };
        W(X, (ue) => {
          n() ? ue(fe, -1) : ue(pe);
        });
      }
      Gn(Y, (ue) => Vn?.(ue)), P(q, Y);
    };
    W(Xe, (q) => {
      a(v) === "filters" && q(Ue);
    });
  }
  Ir(R, (q) => T(h, q), () => a(h)), j(
    (q) => {
      M(H, q), M(G, i() === 1 ? "photo" : "photos"), be = Me(ee, 1, "menu svelte-zne36e", null, be, { open: a(v) === "sort" }), he(ee, "aria-expanded", a(v) === "sort"), M(D, a(f)), y = Me(S, 1, "menu svelte-zne36e", null, y, { open: a(v) === "filters", on: a(p) > 0 }), he(S, "aria-expanded", a(v) === "filters"), he(re, "title", a(d) === "dark" ? "Switch to a white background" : "Switch to a black background"), he(re, "aria-label", a(d) === "dark" ? "Switch to a white background" : "Switch to a black background"), M(Re, a(d) === "dark" ? "☀" : "☾");
    },
    [() => i() === null ? "…" : Te(i())]
  ), K("click", ee, () => T(v, a(v) === "sort" ? "" : "sort", !0)), K("click", S, () => T(v, a(v) === "filters" ? "" : "filters", !0)), K("click", re, E), K("click", We, () => g()()), P(e, R), Et();
}
jt(["click"]);
var Ll = /* @__PURE__ */ I('<span class="err svelte-uzy12d"> </span>'), Dl = /* @__PURE__ */ I(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), zl = /* @__PURE__ */ I(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), ql = /* @__PURE__ */ I('<span class="muted svelte-uzy12d"> </span>'), Hl = /* @__PURE__ */ I('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function jl(e, t) {
  St(t, !0);
  let n = /* @__PURE__ */ V(null), r = /* @__PURE__ */ V(!1), s = /* @__PURE__ */ V(null);
  async function i() {
    T(r, !0), T(s, null);
    try {
      T(n, await Be.probe(), !0);
    } catch (h) {
      T(s, String(h), !0);
    } finally {
      T(r, !1);
    }
  }
  var o = Hl(), u = b(o), l = b(u), c = m(u, 2);
  {
    var g = (h) => {
      var _ = Ll(), w = b(_);
      j(() => M(w, a(s))), P(h, _);
    }, v = (h) => {
      var _ = Gr(), w = yt(_);
      {
        var f = (x) => {
          var C = Dl(), O = m(b(C), 2);
          j(
            (E) => M(O, ` above are formats the header
        reader cannot measure (${E ?? ""}) or files with no
        extension.`),
            [() => a(n).formats.join(" ")]
          ), P(x, C);
        }, p = (x) => {
          var C = zl(), O = b(C), E = b(O), F = m(O, 2), B = b(F);
          j(
            (R) => {
              M(E, R), M(B, a(n).command);
            },
            [() => Te(a(n).worklist)]
          ), P(x, C);
        };
        W(w, (x) => {
          a(n).worklist === 0 ? x(f) : x(p, -1);
        });
      }
      P(h, _);
    }, d = (h) => {
      var _ = ql(), w = b(_);
      j(() => M(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), P(h, _);
    };
    W(c, (h) => {
      a(s) ? h(g) : a(n) ? h(v, 1) : h(d, -1);
    });
  }
  j(() => {
    u.disabled = a(r), M(l, a(r) ? "counting…" : "Check the dimension probe's worklist");
  }), K("click", u, i), P(e, o), Et();
}
jt(["click"]);
var Bl = /* @__PURE__ */ I('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), pa = /* @__PURE__ */ I("<option> </option>"), $l = /* @__PURE__ */ I('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), Ul = /* @__PURE__ */ I('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), Gl = /* @__PURE__ */ I('<div class="none muted svelte-bqi9ky"> </div>'), Yl = /* @__PURE__ */ I('<div class="bar svelte-bqi9ky"><!></div>');
function Vl(e, t) {
  St(t, !0);
  let n = ne(t, "candidate", 3, null), r = ne(t, "saving", 3, !1);
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
  }, o = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), u = /* @__PURE__ */ te(() => n() ? i[n().column] ?? ["="] : ["="]), l = /* @__PURE__ */ te(() => !!n() && n().op !== "is null");
  function c(w, f) {
    const p = { ...n(), [w]: f };
    if (w === "column") {
      const x = i[f] ?? ["="];
      x.includes(p.op) || (p.op = x[0]), p.value = o.has(f) ? 0 : "";
    }
    w === "op" && f === "is null" && (p.value = null), w === "value" && o.has(p.column) && (p.value = Number(f) || 0), t.onedit(p);
  }
  var g = Yl(), v = b(g);
  {
    var d = (w) => {
      var f = Bl(), p = b(f), x = b(p), C = m(p, 2), O = b(C);
      j(() => {
        M(x, `${t.screen.title ?? ""} does not save a rule.`), M(O, t.screen.blurb);
      }), P(w, f);
    }, h = (w) => {
      var f = Ul(), p = yt(f), x = b(p);
      Ye(x, 21, () => s, bt, (D, S) => {
        var y = pa(), A = b(y), $ = {};
        j(() => {
          M(A, a(S)), $ !== ($ = a(S)) && (y.value = (y.__value = a(S)) ?? "");
        }), P(D, y);
      });
      var C;
      Yn(x);
      var O = m(x, 2);
      Ye(O, 21, () => a(u), bt, (D, S) => {
        var y = pa(), A = b(y), $ = {};
        j(() => {
          M(A, a(S)), $ !== ($ = a(S)) && (y.value = (y.__value = a(S)) ?? "");
        }), P(D, y);
      });
      var E;
      Yn(O);
      var F = m(O, 2);
      {
        var B = (D) => {
          var S = $l();
          j(() => dn(S, n().value ?? "")), K("input", S, (y) => c("value", y.currentTarget.value)), P(D, S);
        };
        W(F, (D) => {
          a(l) && D(B);
        });
      }
      var R = m(F, 2), z = b(R);
      z.value = z.__value = "exclude";
      var L = m(z);
      L.value = L.__value = "include";
      var H;
      Yn(R);
      var N = m(R, 2), G = b(N);
      G.value = G.__value = "end";
      var J = m(G);
      J.value = J.__value = "0";
      var Q;
      Yn(N);
      var se = m(N, 2), le = b(se), Z = m(se, 2), ee = m(p, 2), be = b(ee);
      j(
        (D, S) => {
          C !== (C = n().column) && (x.value = (x.__value = n().column) ?? "", Fn(x, n().column)), E !== (E = n().op) && (O.value = (O.__value = n().op) ?? "", Fn(O, n().op)), H !== (H = n().decision ?? "exclude") && (R.value = (R.__value = n().decision ?? "exclude") ?? "", Fn(R, n().decision ?? "exclude")), Q !== (Q = D) && (N.value = (N.__value = D) ?? "", Fn(N, D)), se.disabled = r(), M(le, r() ? "saving…" : "Confirm"), M(be, `${S ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Zi(n())
        ]
      ), K("change", x, (D) => c("column", D.currentTarget.value)), K("change", O, (D) => c("op", D.currentTarget.value)), K("change", R, (D) => c("decision", D.currentTarget.value)), K("change", N, (D) => c("at", D.currentTarget.value)), K("click", se, function(...D) {
        t.onconfirm?.apply(this, D);
      }), K("click", Z, function(...D) {
        t.onclear?.apply(this, D);
      }), P(w, f);
    }, _ = (w) => {
      var f = Gl(), p = b(f);
      j(() => M(p, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), P(w, f);
    };
    W(v, (w) => {
      t.screen.rule === !1 ? w(d) : n() ? w(h, 1) : w(_, -1);
    });
  }
  P(e, g), Et();
}
jt(["change", "input", "click"]);
var Wl = /* @__PURE__ */ I('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), Xl = /* @__PURE__ */ I('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), Kl = /* @__PURE__ */ I('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Jl = /* @__PURE__ */ I('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Zl(e, t) {
  St(t, !0);
  let n = ne(t, "rules", 19, () => []), r = ne(t, "unmatched", 3, null), s = ne(t, "busy", 3, !1);
  var i = Jl(), o = b(i), u = m(b(o)), l = b(u), c = m(o, 2);
  {
    var g = (_) => {
      var w = Wl();
      P(_, w);
    };
    W(c, (_) => {
      n().length === 0 && _(g);
    });
  }
  var v = m(c, 2);
  Ye(v, 19, n, (_) => _.id, (_, w, f) => {
    var p = Xl();
    let x;
    var C = b(p), O = b(C), E = b(O), F = m(O, 2), B = b(F), R = m(F, 2), z = b(R), L = m(C, 2), H = b(L), N = b(H), G = m(H, 2), J = b(G), Q = m(G, 4), se = m(Q, 2), le = m(se, 2);
    j(
      (Z, ee) => {
        x = Me(p, 1, "rule svelte-aof9c2", null, x, { exclude: a(w).decision === "exclude" }), M(E, a(f)), M(B, a(w).predicate), M(z, a(w).decision), M(N, `${Z ?? ""} paths`), M(J, ee), Q.disabled = s() || a(f) === 0, se.disabled = s() || a(f) === n().length - 1, le.disabled = s();
      },
      [
        () => Te(a(w).paths),
        () => gt(a(w).bytes)
      ]
    ), K("click", Q, () => t.onmove(a(w), a(f) - 1)), K("click", se, () => t.onmove(a(w), a(f) + 1)), K("click", le, () => t.ondelete(a(w))), P(_, p);
  });
  var d = m(v, 2);
  {
    var h = (_) => {
      var w = Kl(), f = m(b(w), 2), p = b(f), x = b(p), C = m(p, 2), O = b(C);
      j(
        (E, F) => {
          M(x, `${E ?? ""} paths`), M(O, F);
        },
        [
          () => Te(r().paths),
          () => gt(r().bytes)
        ]
      ), P(_, w);
    };
    W(d, (_) => {
      r() && _(h);
    });
  }
  j(() => M(l, `${n().length ?? ""} rules · top-down, first match wins`)), P(e, i), Et();
}
jt(["click"]);
const Jn = 4, lr = 220, Ql = 340;
function us(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function eo(e, t, n, r, s) {
  let i = t;
  for (; i < e.length; ) {
    let o = i, u = 0, l = 1 / 0;
    for (; o < e.length && (u += us(e[o]), o++, l = (n - Jn * (o - i - 1)) / u, !(l <= lr)); )
      ;
    if (l > lr && !r) break;
    s(i, o, Math.round(Math.min(l, Ql))), i = o;
  }
  return i;
}
function ga(e, t, n) {
  if (!e.length) return null;
  let r = 0, s = e.length - 1;
  for (; r < s; ) {
    const o = r + s >> 1;
    e[o].top + e[o].height < t ? r = o + 1 : s = o;
  }
  const i = r;
  for (s = e.length - 1; r < s; ) {
    const o = r + s + 1 >> 1;
    e[o].top <= n ? r = o : s = o - 1;
  }
  return [i, Math.max(i, r)];
}
const _a = 2500, to = 1, no = 2, ro = 3e7;
function ao(e, t, n) {
  const r = [], s = [], i = /* @__PURE__ */ new Map(), o = [], u = [];
  let l = 0, c = 0, g = null, v = null, d = !1, h = !1, _ = 0, w = 0, f = 0, p = n.onState || (() => {
  });
  function x(S) {
    _ <= 0 || (l = eo(r, l, _, S, (y, A, $) => {
      s.push({ top: c, height: $, from: y, to: A }), c += $ + Jn;
    }), O());
  }
  function C() {
    if (v === null || d || _ <= 0 || l >= v) return 0;
    const S = s.length ? l / s.length : Math.max(1, _ / lr), y = s.length ? c / s.length : lr + Jn, A = Math.round((v - l) / S * y);
    return Math.max(0, Math.min(A, ro - c));
  }
  function O() {
    e.style.height = c + C() + "px", t.style.top = Math.max(0, c - 1) + "px";
  }
  function E() {
    return window.scrollY - e.offsetTop;
  }
  function F() {
    const S = o.pop();
    if (S) return S;
    const y = document.createElement("div");
    y.className = "tile";
    const A = document.createElement("img");
    return A.decoding = "async", A.addEventListener("load", () => y.classList.add("loaded")), A.addEventListener("error", () => y.classList.add("missing")), y.appendChild(A), n.extend && n.extend(y), y;
  }
  function B(S, y) {
    y.firstChild.removeAttribute("src"), y.classList.remove("loaded", "missing", "error"), y.style.backgroundImage = "", y.remove(), i.delete(S), o.push(y);
  }
  function R(S, y, A, $, ce, ve) {
    let re = i.get(S);
    const Re = r[S];
    if (!re) {
      re = F(), re.dataset.index = String(S);
      const We = re.firstChild;
      We.fetchPriority = ve ? "high" : "low", We.src = "/t/" + Re.s + ".webp", u.push(S), n.fill && n.fill(re, Re), e.appendChild(re), i.set(S, re);
    }
    re.style.width = $ + "px", re.style.height = ce + "px", re.style.transform = "translate(" + y + "px," + A + "px)";
  }
  function z(S, y) {
    y.th && (y.url === void 0 && (y.url = n.thumbHash(y.th)), y.url && (S.style.backgroundImage = "url(" + y.url + ")"));
  }
  function L() {
    f = 0;
    for (const S of u) {
      const y = i.get(S);
      y && !y.classList.contains("loaded") && z(y, r[S]);
    }
    u.length = 0;
  }
  function H(S, y) {
    let A = 0;
    for (let $ = S.from; $ < S.to; $++) {
      const ve = $ === S.to - 1 ? _ - A : Math.round(us(r[$]) * S.height);
      R($, A, S.top, ve, S.height, y), A += ve + Jn;
    }
  }
  function N() {
    const S = window.innerHeight, y = E(), A = ga(s, y - S * to, y + S * (1 + no));
    if (!A) return;
    const $ = s[A[0]].from, ce = s[A[1]].to;
    for (const [ve, re] of Array.from(i))
      (ve < $ || ve >= ce) && B(ve, re);
    for (let ve = A[0]; ve <= A[1]; ve++) {
      const re = s[ve];
      H(re, re.top < y + S && re.top + re.height > y);
    }
    u.length && !f && (f = requestAnimationFrame(L));
  }
  function G() {
    return _ <= 0 ? !1 : c - (E() + window.innerHeight) < _a;
  }
  async function J() {
    if (h || d) return;
    h = !0;
    const S = w;
    p({ loading: !0, count: r.length, exhausted: d, total: v });
    try {
      do {
        const y = await n.fetchPage(g);
        if (S !== w) return;
        for (const A of y.photos) r.push(A);
        g = y.next, d = g === null, typeof y.total == "number" && (v = y.total), x(d), N(), p({ loading: !0, count: r.length, exhausted: d, total: v });
      } while (!d && G());
    } catch (y) {
      S === w && p({ error: String(y) });
    } finally {
      S === w && (h = !1, p({ loading: !1, count: r.length, exhausted: d, total: v }));
    }
  }
  let Q = 0;
  function se() {
    Q || (Q = requestAnimationFrame(() => {
      Q = 0, N(), G() && J();
    }));
  }
  function le() {
    const S = e.clientWidth;
    if (S === _) return;
    const y = ga(s, E(), E()), A = y ? s[y[0]].from : 0;
    _ = S;
    for (const [ce, ve] of Array.from(i)) B(ce, ve);
    s.length = 0, l = 0, c = 0, x(d), N();
    const $ = s.find((ce) => ce.to > A);
    $ && window.scrollTo(0, $.top + e.offsetTop), G() && J();
  }
  function Z(S) {
    const y = S.target.closest(".tile");
    if (!y || !e.contains(y)) return;
    const A = r[Number(y.dataset.index)];
    A && n.activate && n.activate(A, S, y);
  }
  e.addEventListener("click", Z), window.addEventListener("scroll", se, { passive: !0 });
  let ee = 0;
  const be = new ResizeObserver(() => {
    clearTimeout(ee), ee = setTimeout(le, 100);
  });
  be.observe(e);
  const D = new IntersectionObserver(
    (S) => {
      S.some((y) => y.isIntersecting) && J();
    },
    { rootMargin: "0px 0px " + _a + "px 0px" }
  );
  return D.observe(t), _ = e.clientWidth, J(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      w++, h = !1;
      for (const [S, y] of Array.from(i)) B(S, y);
      r.length = 0, s.length = 0, u.length = 0, l = 0, c = 0, g = null, v = null, d = !1, e.style.height = "0px", window.scrollTo(0, 0), J();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(S) {
      const y = typeof S == "number" ? S : null;
      y !== v && (v = y, O(), p({ total: v }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [S, y] of i) n.fill(y, r[S]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(S) {
      for (const [y, A] of i)
        r[y] === S && n.fill && n.fill(A, S);
    },
    destroy() {
      w++, e.removeEventListener("click", Z), window.removeEventListener("scroll", se), be.disconnect(), D.disconnect(), clearTimeout(ee), cancelAnimationFrame(f);
    }
  };
}
function so(e) {
  try {
    const t = Uint8Array.from(atob(e), (N) => N.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, o = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, l = n >> 23, c = (r >> 3 & 63) / 63, g = (r >> 9 & 63) / 63, v = r >> 15, d = Math.max(3, v ? l ? 5 : 7 : r & 7), h = Math.max(3, v ? r & 7 : l ? 5 : 7);
    let _ = l ? 6 : 5, w = 0;
    const f = (N, G, J) => {
      const Q = [];
      for (let se = 0; se < G; se++)
        for (let le = se ? 0 : 1; le * G < N * (G - se); le++) {
          const Z = t[_ + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          Q.push((Z / 7.5 - 1) * J);
        }
      return Q;
    }, p = f(d, h, u), x = f(3, 3, c * 1.25), C = f(3, 3, g * 1.25), O = d / h, E = Math.max(1, Math.round(O > 1 ? 32 : 32 * O)), F = Math.max(1, Math.round(O > 1 ? 32 / O : 32)), B = document.createElement("canvas");
    B.width = E, B.height = F;
    const R = B.getContext("2d"), z = R.createImageData(E, F), L = [], H = [];
    for (let N = 0, G = 0; N < F; N++)
      for (let J = 0; J < E; J++, G += 4) {
        let Q = s, se = i, le = o;
        for (let D = 0; D < d; D++) L[D] = Math.cos(Math.PI / E * (J + 0.5) * D);
        for (let D = 0; D < h; D++) H[D] = Math.cos(Math.PI / F * (N + 0.5) * D);
        for (let D = 0, S = 0; D < h; D++)
          for (let y = D ? 0 : 1; y * h < d * (h - D); y++, S++)
            Q += p[S] * L[y] * H[D] * 2;
        for (let D = 0, S = 0; D < 3; D++)
          for (let y = D ? 0 : 1; y < 3 - D; y++, S++) {
            const A = L[y] * H[D] * 2;
            se += x[S] * A, le += C[S] * A;
          }
        const Z = Q - 2 / 3 * se, ee = (3 * Q - Z + le) / 2, be = ee - le;
        z.data[G] = Math.max(0, Math.min(255, Math.round(255 * ee))), z.data[G + 1] = Math.max(0, Math.min(255, Math.round(255 * be))), z.data[G + 2] = Math.max(0, Math.min(255, Math.round(255 * Z))), z.data[G + 3] = 255;
      }
    return R.putImageData(z, 0, 0), B.toDataURL();
  } catch {
    return null;
  }
}
var io = /* @__PURE__ */ I('<main id="canvas"><div id="sentinel"></div></main>');
function lo(e, t) {
  St(t, !0);
  let n = ne(t, "key", 3, ""), r = ne(t, "total", 3, null), s = ne(t, "triage", 3, !1), i = ne(t, "excludedDirs", 19, () => []), o = ne(t, "onActivate", 3, () => {
  }), u = ne(t, "onOverride", 3, async () => null), l = ne(t, "onExcludeFolder", 3, () => {
  }), c = ne(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ V(null), v = /* @__PURE__ */ V(null), d = null, h = "";
  const _ = { null: "exclude", exclude: "include", include: "clear" };
  function w(E) {
    const F = E.toLowerCase().startsWith(kn.toLowerCase()) ? E.slice(kn.length + 1) : E;
    return F.length > 64 ? "…" + F.slice(-64) : F;
  }
  function f(E) {
    const F = document.createElement("div");
    F.className = "tile-path", E.appendChild(F);
    const B = document.createElement("button");
    B.className = "chip", B.type = "button", E.appendChild(B);
    const R = document.createElement("button");
    R.className = "dirchip", R.type = "button", R.textContent = "dir", E.appendChild(R);
  }
  function p(E, F) {
    const B = E.querySelector(".tile-path");
    B && (B.textContent = F.p ? w(F.p) : "");
    const R = E.querySelector(".dirchip");
    if (R) {
      const L = rs(F.p ?? ""), H = L !== "" && Vr(i(), L);
      R.hidden = L === "", R.disabled = H, R.dataset.state = H ? "exclude" : "none", R.title = H ? `already excluded: ${L}` : `exclude everything under ${L}, subfolders included — one exclude rule at the end of the order`;
    }
    const z = E.querySelector(".chip");
    z && (z.dataset.state = F.o || "none", z.textContent = F.o === "exclude" ? "drop" : F.o === "include" ? "keep" : "·", z.title = F.o === "exclude" ? "overridden: excluded — click to keep" : F.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  fr(() => (d = ao(a(g), a(v), {
    fetchPage: (E) => t.fetchPage(E),
    thumbHash: so,
    extend: s() ? f : void 0,
    fill: s() ? p : void 0,
    onState: (E) => c()(E),
    activate: async (E, F, B) => {
      if (F.target.closest(".dirchip")) {
        l()(E);
        return;
      }
      if (!F.target.closest(".chip")) {
        o()(E);
        return;
      }
      const R = _[E.o ?? "null"];
      E.o = await u()(E, R), p(B, E);
    }
  }), h = n(), () => d?.destroy())), yn(() => {
    const E = n(), F = r();
    d && (E !== h && (h = E, d.reset()), d.setTotal(F));
  });
  let x = "";
  yn(() => {
    const E = i().join(`
`);
    !d || E === x || (x = E, d.refill());
  });
  var C = io(), O = b(C);
  Ir(O, (E) => T(v, E), () => a(v)), Ir(C, (E) => T(g, E), () => a(g)), P(e, C), Et();
}
var oo = /* @__PURE__ */ I('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), uo = /* @__PURE__ */ I('<th class="num svelte-1v3p82v"> </th>'), co = /* @__PURE__ */ I('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), fo = /* @__PURE__ */ I('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), ho = /* @__PURE__ */ I('<td class="num svelte-1v3p82v"> </td>'), vo = /* @__PURE__ */ I('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), po = /* @__PURE__ */ I('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function go(e, t) {
  St(t, !0);
  let n = ne(t, "rows", 19, () => []), r = ne(t, "rules", 19, () => []), s = ne(t, "root", 3, null), i = ne(t, "selected", 3, null), o = ne(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ te(() => t.screen.rule !== !1);
  function l(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const c = /* @__PURE__ */ te(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : as(r(), t.screen.toRule(w, s()))
  ]))), g = { exclude: "✕", include: "✓" }, v = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var d = Gr(), h = yt(d);
  {
    var _ = (w) => {
      var f = po(), p = b(f), x = b(p), C = b(x);
      {
        var O = (L) => {
          var H = oo();
          P(L, H);
        };
        W(C, (L) => {
          a(u) && L(O);
        });
      }
      var E = m(C), F = b(E), B = m(E, 3);
      {
        var R = (L) => {
          var H = uo(), N = b(H);
          j(() => M(N, t.screen.heading[1])), P(L, H);
        };
        W(B, (L) => {
          t.screen.heading[1] && L(R);
        });
      }
      var z = m(p);
      Ye(z, 23, n, (L) => L.key, (L, H, N) => {
        const G = /* @__PURE__ */ te(() => a(c).get(a(H).key));
        var J = vo();
        let Q;
        var se = b(J);
        {
          var le = (we) => {
            const Ae = /* @__PURE__ */ te(() => o().has(a(H).key));
            var Xe = co(), Ue = b(Xe);
            let q;
            var Y = b(Ue);
            j(
              (X) => {
                q = Me(Ue, 1, "tick svelte-1v3p82v", null, q, { on: a(Ae) }), he(Ue, "aria-checked", a(Ae)), he(Ue, "aria-label", `select ${X ?? ""}`), M(Y, a(Ae) ? "✓" : "");
              },
              [() => l(a(H))]
            ), K("click", Ue, (X) => {
              X.stopPropagation(), t.oncheck(a(H), a(N), X.shiftKey);
            }), P(we, Xe);
          };
          W(se, (we) => {
            a(u) && we(le);
          });
        }
        var Z = m(se), ee = b(Z);
        let be;
        var D = b(ee), S = m(ee), y = m(S);
        {
          var A = (we) => {
            var Ae = fo();
            P(we, Ae);
          };
          W(y, (we) => {
            a(H).scope === "whole inventory" && we(A);
          });
        }
        var $ = m(Z), ce = b($), ve = m($), re = b(ve), Re = m(ve);
        {
          var We = (we) => {
            var Ae = ho(), Xe = b(Ae);
            j(() => M(Xe, a(H).detail ?? "")), P(we, Ae);
          };
          W(Re, (we) => {
            t.screen.heading[1] && we(We);
          });
        }
        j(
          (we, Ae, Xe) => {
            Q = Me(J, 1, "svelte-1v3p82v", null, Q, {
              picked: i() === a(H).key,
              clickable: t.screen.sheet !== !1
            }), be = Me(ee, 1, "mark svelte-1v3p82v", null, be, {
              exclude: a(G) === "exclude",
              include: a(G) === "include"
            }), he(ee, "title", v[a(G)] ?? ""), M(D, g[a(G)] ?? ""), M(S, `${we ?? ""} `), M(ce, Ae), M(re, Xe);
          },
          [
            () => l(a(H)),
            () => Te(a(H).paths),
            () => gt(a(H).bytes)
          ]
        ), K("click", J, () => t.onpick(a(H))), P(L, J);
      }), j(() => M(F, t.screen.heading[0] ?? "")), P(w, f);
    };
    W(h, (w) => {
      n().length && w(_);
    });
  }
  P(e, d), Et();
}
jt(["click"]);
var _o = /* @__PURE__ */ I('<button class="twisty svelte-pucy57"> </button>'), bo = /* @__PURE__ */ I('<span class="twisty leaf svelte-pucy57">·</span>'), mo = /* @__PURE__ */ I('<span class="name root svelte-pucy57"> </span>'), wo = /* @__PURE__ */ I('<button class="name svelte-pucy57"> </button>'), yo = /* @__PURE__ */ I('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), xo = /* @__PURE__ */ I('<div class="note svelte-pucy57"> </div>'), ko = /* @__PURE__ */ I('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), So = /* @__PURE__ */ I('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Eo = /* @__PURE__ */ I('<div class="tree svelte-pucy57"></div>');
function To(e, t) {
  St(t, !0);
  let n = ne(t, "version", 3, 0), r = ne(t, "excludedDirs", 19, () => []), s = ne(t, "selected", 3, null), i = ne(t, "busy", 3, !1), o = /* @__PURE__ */ V(De(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ V(De(/* @__PURE__ */ new Set())), l = /* @__PURE__ */ V(De(/* @__PURE__ */ new Set())), c = /* @__PURE__ */ V(De(/* @__PURE__ */ new Set()));
  async function g(f) {
    T(l, new Set(a(l)).add(f), !0);
    const p = await t.onload(f), x = new Map(a(o)), C = new Set(a(c));
    p ? (x.set(f, p), C.delete(f)) : C.add(f), T(o, x, !0), T(c, C, !0), T(l, new Set([...a(l)].filter((O) => O !== f)), !0);
  }
  function v(f) {
    if (a(u).has(f)) {
      T(u, new Set([...a(u)].filter((p) => p !== f)), !0);
      return;
    }
    T(u, new Set(a(u)).add(f), !0), a(o).has(f) || g(f);
  }
  let d = -1;
  yn(() => {
    const f = n();
    if (f !== d) {
      d = f, a(u).has(t.root) || T(u, new Set(a(u)).add(t.root), !0);
      for (const p of a(u)) g(p);
    }
  });
  const h = /* @__PURE__ */ te(() => {
    const f = [], p = (E, F, B, R, z, L) => {
      const H = a(o).get(E), N = a(u).has(E);
      if (f.push({
        key: E,
        name: F,
        depth: B,
        paths: R,
        bytes: z,
        deeper: L,
        expanded: N,
        here: H?.here ?? null,
        truncated: !!H?.truncated,
        loading: a(l).has(E),
        failed: a(c).has(E),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: Vr(r(), E)
      }), !(!N || !H))
        for (const G of H.children)
          p(G.path, G.name, B + 1, G.paths, G.bytes, G.deeper);
    }, x = a(o).get(t.root), C = x ? x.children.reduce((E, F) => E + F.paths, 0) + x.here.paths : 0, O = x ? x.children.reduce((E, F) => E + F.bytes, 0) + x.here.bytes : 0;
    return p(t.root, t.root, 0, C, O, !0), f;
  }), _ = 8;
  var w = Eo();
  Ye(w, 21, () => a(h), (f) => f.key, (f, p) => {
    var x = So(), C = yt(x);
    let O;
    var E = b(C);
    let F;
    var B = m(E, 2);
    {
      var R = (y) => {
        var A = _o(), $ = b(A);
        j(() => {
          he(A, "aria-expanded", a(p).expanded), he(A, "aria-label", `${a(p).expanded ? "collapse" : "expand"} ${a(p).name ?? ""}`), he(A, "title", a(p).expanded ? "collapse" : "expand"), M($, a(p).loading ? "·" : a(p).expanded ? "▾" : "▸");
        }), K("click", A, () => v(a(p).key)), P(y, A);
      }, z = (y) => {
        var A = bo();
        P(y, A);
      };
      W(B, (y) => {
        a(p).deeper ? y(R) : y(z, -1);
      });
    }
    var L = m(B, 2);
    {
      var H = (y) => {
        var A = mo(), $ = b(A);
        j(() => M($, a(p).key)), P(y, A);
      }, N = (y) => {
        var A = wo(), $ = b(A);
        j(() => {
          he(A, "title", `Show every kept file under ${a(p).key ?? ""}`), M($, a(p).name);
        }), K("click", A, () => t.onpick(a(p))), P(y, A);
      };
      W(L, (y) => {
        a(p).depth === 0 ? y(H) : y(N, -1);
      });
    }
    var G = m(L, 2), J = b(G), Q = m(G, 2), se = b(Q), le = m(Q, 2), Z = m(C, 2);
    {
      var ee = (y) => {
        var A = yo();
        let $;
        j((ce) => $ = Nn(A, "", $, ce), [
          () => ({
            "padding-left": `${Math.min(a(p).depth, _) * 11 + 18}px`
          })
        ]), P(y, A);
      }, be = (y) => {
        var A = xo();
        let $;
        var ce = b(A);
        j(
          (ve, re, Re) => {
            $ = Nn(A, "", $, ve), M(ce, `${re ?? ""} directly here · ${Re ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(a(p).depth, _) * 11 + 18}px`
            }),
            () => Te(a(p).here.paths),
            () => gt(a(p).here.bytes)
          ]
        ), P(y, A);
      };
      W(Z, (y) => {
        a(p).expanded && a(p).failed ? y(ee) : a(p).expanded && a(p).here && a(p).here.paths > 0 && y(be, 1);
      });
    }
    var D = m(Z, 2);
    {
      var S = (y) => {
        var A = ko();
        let $;
        j((ce) => $ = Nn(A, "", $, ce), [
          () => ({
            "padding-left": `${Math.min(a(p).depth, _) * 11 + 18}px`
          })
        ]), P(y, A);
      };
      W(D, (y) => {
        a(p).truncated && y(S);
      });
    }
    j(
      (y, A, $) => {
        O = Me(C, 1, "row svelte-pucy57", null, O, {
          picked: s() === a(p).key,
          gone: a(p).excluded
        }), F = Nn(E, "", F, y), M(J, A), M(se, $), le.disabled = i() || a(p).excluded || a(p).depth === 0, he(le, "title", a(p).depth === 0 ? "The library root is not excludable from here." : a(p).excluded ? "already excluded" : `Exclude everything under ${a(p).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(a(p).depth, _) * 11}px` }),
        () => Te(a(p).paths),
        () => gt(a(p).bytes)
      ]
    ), K("click", le, () => t.onexclude(a(p))), P(f, x);
  }), P(e, w), Et();
}
jt(["click"]);
var Mo = /* @__PURE__ */ I('<button title="Back to its default">↺</button>'), Ro = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), Ao = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), Po = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), Co = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), Oo = /* @__PURE__ */ I('<li><code class="svelte-1hh0fwb"> </code> </li>'), Io = /* @__PURE__ */ I(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), No = /* @__PURE__ */ I('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function Fo(e, t) {
  St(t, !0);
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
        ["headerSide", "Sides", 0, (N) => Math.floor(N / 2), 1],
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
  ], o = [
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
  let u = /* @__PURE__ */ V(De(ul())), l = /* @__PURE__ */ V(!0), c = /* @__PURE__ */ V(!1), g = /* @__PURE__ */ V(De(ls())), v = /* @__PURE__ */ V(De(window.innerWidth));
  const d = (N) => a(g) === "light" ? N.light : N.dark, h = (N) => N in Kt ? Kt : Yt, _ = (N) => `rgba(${N.r}, ${N.g}, ${N.b}, ${N.a})`, w = /* @__PURE__ */ te(() => JSON.stringify(a(u), null, 2));
  fr(() => {
    const N = localStorage.getItem(n);
    if (N)
      try {
        T(u, wr(JSON.parse(N)), !0);
        return;
      } catch {
      }
    Wr();
  });
  function f(N) {
    T(u, wr({ ...a(u), ...N }), !0), localStorage.setItem(n, JSON.stringify(a(u))), T(c, !1);
  }
  function p(N) {
    T(u, wr(N), !0), localStorage.setItem(n, JSON.stringify(a(u))), T(c, !1);
  }
  function x(N) {
    f({ [N]: h(N)[N] });
  }
  function C() {
    T(g, os(a(g) === "dark" ? "light" : "dark"), !0);
  }
  async function O() {
    await navigator.clipboard.writeText(a(w)), T(c, !0);
  }
  var E = No();
  let F;
  var B = b(E), R = m(b(B), 4), z = b(R), L = m(B, 2);
  {
    var H = (N) => {
      var G = Io();
      {
        const Ue = (Y, X = Wn, pe = Wn, fe = Wn) => {
          var ue = Mo();
          let ge;
          j(() => {
            ge = Me(ue, 1, "undo svelte-1hh0fwb", null, ge, { idle: !pe() }), he(ue, "aria-label", `Reset ${X() ?? ""}`);
          }), K("click", ue, function(...He) {
            fe()?.apply(this, He);
          }), P(Y, ue);
        };
        var J = m(b(G), 2);
        Ye(J, 17, () => r, bt, (Y, X) => {
          var pe = Ao(), fe = b(pe), ue = b(fe), ge = m(fe, 2), He = b(ge), et = m(ge, 2);
          Ye(et, 17, () => a(X).rows, bt, (qe, Tt) => {
            var Ke = /* @__PURE__ */ te(() => pr(a(Tt), 5));
            let je = () => a(Ke)[0], dt = () => a(Ke)[1], Ot = () => a(Ke)[2], ht = () => a(Ke)[3], It = () => a(Ke)[4];
            const Mt = /* @__PURE__ */ te(() => a(u)[je()] !== h(je())[je()]), Rt = /* @__PURE__ */ te(() => typeof ht() == "function" ? ht()(a(v)) : ht());
            var Pe = Ro();
            let me;
            var k = b(Pe), U = b(k), oe = m(k, 2), _e = m(oe, 2), Je = m(_e, 2);
            Ue(Je, dt, () => a(Mt), () => () => x(je())), j(() => {
              me = Me(Pe, 1, "row svelte-1hh0fwb", null, me, { moved: a(Mt) }), M(U, dt()), he(oe, "min", Ot()), he(oe, "max", a(Rt)), he(oe, "step", It()), he(oe, "aria-label", dt()), dn(oe, a(u)[je()]), he(_e, "min", Ot()), he(_e, "max", a(Rt)), he(_e, "step", It()), he(_e, "aria-label", `${dt() ?? ""} value`), dn(_e, a(u)[je()]);
            }), K("input", oe, (ye) => f({ [je()]: Number(ye.currentTarget.value) })), K("input", _e, (ye) => f({ [je()]: Number(ye.currentTarget.value) })), P(qe, Pe);
          }), j(() => {
            M(ue, a(X).title), M(He, a(X).note);
          }), P(Y, pe);
        });
        var Q = m(J, 2), se = b(Q), le = m(Q, 2), Z = b(le), ee = m(le, 2);
        Ye(ee, 17, () => ol, bt, (Y, X) => {
          const pe = /* @__PURE__ */ te(() => d(a(X))), fe = /* @__PURE__ */ te(() => a(u)[a(pe)]), ue = /* @__PURE__ */ te(() => a(X).base[a(pe)]);
          var ge = Co(), He = b(ge), et = b(He), qe = m(et), Tt = b(qe), Ke = m(He, 2), je = b(Ke), dt = m(Ke, 2);
          Ye(dt, 17, () => i, bt, (Mt, Rt) => {
            var Pe = /* @__PURE__ */ te(() => pr(a(Rt), 3));
            let me = () => a(Pe)[0], k = () => a(Pe)[1], U = () => a(Pe)[2];
            const oe = /* @__PURE__ */ te(() => a(fe)[me()] !== a(ue)[me()]);
            var _e = Po();
            let Je;
            var ye = b(_e), vt = b(ye), Ge = m(ye, 2), Ee = m(Ge, 2), Mn = m(Ee, 2);
            Ue(Mn, k, () => a(oe), () => () => f({
              [a(pe)]: { ...a(fe), [me()]: a(ue)[me()] }
            })), j(() => {
              Je = Me(_e, 1, "row svelte-1hh0fwb", null, Je, { moved: a(oe) }), M(vt, k()), he(Ge, "max", U()), he(Ge, "step", U() === 1 ? 0.01 : 1), he(Ge, "aria-label", `${a(g) ?? ""} ${s[a(X).dark].title ?? ""} ${k() ?? ""}`), dn(Ge, a(fe)[me()]), he(Ee, "max", U()), he(Ee, "step", U() === 1 ? 0.01 : 1), he(Ee, "aria-label", `${a(g) ?? ""} ${s[a(X).dark].title ?? ""} ${k() ?? ""} value`), dn(Ee, a(fe)[me()]);
            }), K("input", Ge, (Le) => f({
              [a(pe)]: {
                ...a(fe),
                [me()]: Number(Le.currentTarget.value)
              }
            })), K("input", Ee, (Le) => f({
              [a(pe)]: {
                ...a(fe),
                [me()]: Number(Le.currentTarget.value)
              }
            })), P(Mt, _e);
          });
          var Ot = m(dt, 2);
          let ht;
          var It = b(Ot);
          j(
            (Mt, Rt) => {
              M(et, `${s[a(X).dark].title ?? ""} `), M(Tt, a(g)), M(je, s[a(X).dark].note), ht = Nn(Ot, "", ht, Mt), M(It, Rt);
            },
            [
              () => ({ background: _(a(fe)) }),
              () => _(a(fe))
            ]
          ), P(Y, ge);
        });
        var be = m(ee, 2), D = m(b(be), 4);
        let q;
        var S = b(D), y = b(S), A = m(S, 2);
        Ue(A, () => "Blur at the edge", () => a(u).blurEdge !== Kt.blurEdge, () => () => x("blurEdge"));
        var $ = m(be, 2), ce = m(b($), 4);
        Ye(ce, 21, () => o, bt, (Y, X) => {
          var pe = /* @__PURE__ */ te(() => pr(a(X), 2));
          let fe = () => a(pe)[0], ue = () => a(pe)[1];
          var ge = Oo(), He = b(ge), et = b(He), qe = m(He);
          j(() => {
            M(et, fe()), M(qe, ` — ${ue() ?? ""}`);
          }), P(Y, ge);
        });
        var ve = m($, 2), re = m(b(ve), 4), Re = b(re), We = m(Re, 2), we = m(We, 2), Ae = b(we), Xe = m(re, 2);
        j(() => {
          M(se, `The five colours below are per theme, and you are editing the ${a(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), M(Z, `Edit the ${a(g) === "dark" ? "light" : "dark"} colours`), q = Me(D, 1, "row toggle svelte-1hh0fwb", null, q, { moved: a(u).blurEdge !== Kt.blurEdge }), Gi(y, a(u).blurEdge), M(Ae, a(c) ? "Copied" : "Copy"), dn(Xe, a(w));
        }), K("click", le, C), K("change", y, (Y) => f({ blurEdge: Y.currentTarget.checked })), K("click", Re, () => p(Yt)), K("click", We, () => p(Kt)), K("click", we, O);
      }
      P(N, G);
    };
    W(L, (N) => {
      a(l) && N(H);
    });
  }
  j(() => {
    F = Me(E, 1, "tuner svelte-1hh0fwb", null, F, { folded: !a(l) }), he(R, "title", a(l) ? "Fold away" : "Open"), M(z, a(l) ? "–" : "+");
  }), Vi("innerWidth", (N) => T(v, N, !0)), K("click", R, () => T(l, !a(l))), P(e, E), Et();
}
jt(["click", "input", "change"]);
var Lo = /* @__PURE__ */ I('<button><span class="n svelte-1n46o8q"> </span> </button>'), Do = /* @__PURE__ */ I('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), zo = /* @__PURE__ */ I('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), qo = /* @__PURE__ */ I('<div class="muted pad svelte-1n46o8q">loading…</div>'), Ho = /* @__PURE__ */ I('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), jo = /* @__PURE__ */ I('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!></aside>'), Bo = /* @__PURE__ */ I('<p class="blurb"> </p>'), $o = /* @__PURE__ */ I('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), Uo = /* @__PURE__ */ I('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), Go = /* @__PURE__ */ I('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), Yo = /* @__PURE__ */ I('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), Vo = /* @__PURE__ */ I("<div> </div>"), Wo = /* @__PURE__ */ I('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!>', 1);
function Xo(e, t) {
  St(t, !0);
  const n = location.pathname === "/tune";
  let r = /* @__PURE__ */ V("grid"), s = /* @__PURE__ */ V(0), i = /* @__PURE__ */ V(
    null
    // screen 6's drill-down
  ), o = /* @__PURE__ */ V(De([])), u = /* @__PURE__ */ V(null), l = /* @__PURE__ */ V(null), c = /* @__PURE__ */ V(De(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ V(null), v = /* @__PURE__ */ V(null), d = /* @__PURE__ */ V(null), h = /* @__PURE__ */ V(null), _ = /* @__PURE__ */ V(!1), w = /* @__PURE__ */ V(!1), f = /* @__PURE__ */ V(!1), p = /* @__PURE__ */ V(!1), x = /* @__PURE__ */ V(De({ loading: !1, count: 0, exhausted: !1, total: null })), C = /* @__PURE__ */ V(null), O = /* @__PURE__ */ V(0), E = /* @__PURE__ */ V(null), F = /* @__PURE__ */ V(De({})), B = /* @__PURE__ */ V("newest");
  const R = /* @__PURE__ */ te(() => fa[a(s)]), z = /* @__PURE__ */ te(() => a(R).table !== !1), L = /* @__PURE__ */ te(() => a(z) || a(R).tree === !0), H = /* @__PURE__ */ te(() => a(R).sheet !== !1 && (a(l) !== null || !a(L))), N = /* @__PURE__ */ te(() => ({
    sort: a(B),
    ...Object.fromEntries(Object.entries(a(F)).filter(([, k]) => k.length > 0))
  })), G = /* @__PURE__ */ te(() => a(r) === "grid" ? `grid:${JSON.stringify(a(N))}` : `triage:${a(s)}:${JSON.stringify(a(l))}`), J = /* @__PURE__ */ te(() => a(R).rule === !1 || a(c).size === 0 ? [] : a(o).filter((k) => a(c).has(k.key)).map((k) => a(R).toRule(k, a(i))).filter((k) => k && as(a(v)?.rules ?? [], k) !== "exclude")), Q = /* @__PURE__ */ te(() => (a(v)?.rules ?? []).filter((k) => k.decision === "exclude" && k.term?.column === "dir_under").map((k) => String(k.term.value).replace(/[\\/]+$/, "").toLowerCase())), se = Ki();
  function le(k) {
    T(C, String(k), !0);
  }
  async function Z(k) {
    try {
      return T(C, null), await k();
    } catch (U) {
      return le(U), null;
    }
  }
  const ee = Ji(
    () => {
      T(w, !0), Z(async () => {
        const k = a(l)?.at === "end" || a(l)?.at === void 0 ? void 0 : 0, { stale: U, value: oe } = await se(() => Be.counts(a(l), k));
        U || T(v, oe, !0);
      }).finally(() => {
        T(w, !1);
      });
    },
    220
  );
  async function be() {
    T(d, "loading");
    const k = await Z(() => Be.files());
    T(d, k, !0), T(_, !1), T(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function D(k = !1) {
    if (a(r) !== "triage" || !a(z)) {
      T(o, [], !0);
      return;
    }
    T(p, !0);
    const U = a(R).name === "source_folder" && a(i) ? { root: a(i) } : {};
    k && (U.live = "1");
    const oe = await Z(() => Be.screen(a(R).name, U));
    T(o, oe?.rows ?? [], !0), T(p, !1);
  }
  let S = !1;
  yn(() => {
    a(s), a(r), an(() => {
      T(u, null), T(l, null), T(i, null), ce(), a(r) === "triage" && (D(), ee.now(), S || (S = !0, be()));
    });
  }), yn(() => {
    a(i), an(() => {
      a(r) === "triage" && (ce(), D());
    });
  }), fr(() => {
    Z(async () => {
      T(E, await Be.facets(), !0);
    });
  });
  function y(k, U) {
    T(F, { ...a(F), [k]: U }, !0);
  }
  function A(k) {
    if (a(R).sheet !== !1) {
      if (a(R).drill && !a(i)) {
        T(u, k.key, !0), T(
          l,
          {
            ...a(R).toRule(k, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), T(i, k.key, !0);
        return;
      }
      T(u, k.key, !0), T(
        l,
        {
          ...a(R).toRule(k, a(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), ee();
    }
  }
  function $(k, U, oe) {
    const _e = new Set(a(c)), Je = !_e.has(k.key), ye = oe && a(g) !== null ? a(o).findIndex((Ee) => Ee.key === a(g)) : -1, [vt, Ge] = ye < 0 ? [U, U] : ye < U ? [ye, U] : [U, ye];
    for (let Ee = vt; Ee <= Ge; Ee++)
      Je ? _e.add(a(o)[Ee].key) : _e.delete(a(o)[Ee].key);
    T(c, _e, !0), T(g, k.key, !0);
  }
  function ce() {
    T(c, /* @__PURE__ */ new Set(), !0), T(g, null);
  }
  function ve(k) {
    T(l, k, !0), T(
      u,
      null
      // it no longer corresponds to a row
    ), ee();
  }
  function re(k = !1) {
    T(l, null), T(u, null), k && T(i, null), ee.now();
  }
  async function Re() {
    T(
      _,
      !0
      // the distinct-content number now says so on its face
    ), vi(O), await D(), ee.now();
  }
  async function We() {
    if (!a(l)) return;
    T(f, !0);
    const k = a(l).at === "end" ? void 0 : 0, U = await Z(() => Be.addRule(
      {
        column: a(l).column,
        op: a(l).op,
        value: a(l).value,
        decision: a(l).decision ?? "exclude",
        note: `screen ${a(R).id} ${a(R).title}`
      },
      k
    ));
    T(f, !1), U && (T(l, null), T(u, null), await Re());
  }
  async function we() {
    const k = a(J);
    if (!k.length) {
      ce();
      return;
    }
    T(f, !0);
    for (const U of k)
      if (!await Z(() => Be.addRule({
        column: U.column,
        op: U.op,
        value: U.value,
        decision: "exclude",
        note: `screen ${a(R).id} ${a(R).title}`
      }))) break;
    T(f, !1), ce(), T(l, null), T(u, null), await Re();
  }
  async function Ae(k) {
    if (!k || Vr(a(Q), k)) return;
    T(f, !0);
    const U = await Z(() => Be.addRule({
      column: "dir_under",
      op: "=",
      value: k,
      decision: "exclude",
      note: `screen ${a(R).id} ${a(R).title}`
    }));
    T(f, !1), U && await Re();
  }
  const Xe = (k) => Ae(rs(k.p ?? "")), Ue = (k) => Ae(k.key);
  async function q(k) {
    T(f, !0), await Z(() => Be.deleteRule(k.id)), T(f, !1), await Re();
  }
  async function Y(k, U) {
    T(f, !0), await Z(() => Be.moveRule(k.id, U)), T(f, !1), await Re();
  }
  async function X(k, U) {
    const oe = await Z(() => Be.override(k.s, U));
    return oe ? (T(_, !0), ee(), oe.decision) : k.o ?? null;
  }
  function pe(k) {
    return a(r) === "grid" ? Be.photos({ limit: 500, ...a(N), ...k || {} }) : Be.page(a(l), k);
  }
  function fe(k) {
    Z(() => a(r) === "grid" ? Be.revealPhoto(k.id) : Be.revealOrigin(k.id));
  }
  var ue = Wo(), ge = yt(ue);
  {
    var He = (k) => {
      Fl(k, {
        get facets() {
          return a(E);
        },
        get selected() {
          return a(F);
        },
        get sort() {
          return a(B);
        },
        get total() {
          return a(x).total;
        },
        get loading() {
          return a(x).loading;
        },
        onselect: y,
        onsort: (U) => T(B, U, !0),
        onclear: () => T(F, {}, !0),
        ontriage: () => T(r, "triage")
      });
    };
    W(ge, (k) => {
      a(r) === "grid" && k(He);
    });
  }
  var et = m(ge, 2);
  {
    var qe = (k) => {
      Fo(k, {});
    };
    W(et, (k) => {
      n && k(qe);
    });
  }
  var Tt = m(et, 2);
  let Ke;
  var je = b(Tt);
  {
    var dt = (k) => {
      var U = jo(), oe = b(U), _e = b(oe), Je = m(oe, 2);
      Ye(Je, 21, () => fa, bt, (Le, rt, Xt) => {
        var Nt = Lo();
        let sn;
        var ln = b(Nt), on = b(ln), xe = m(ln, 1, !0);
        j(() => {
          sn = Me(Nt, 1, "nav svelte-1n46o8q", null, sn, { on: Xt === a(s) }), M(on, a(rt).id), M(xe, a(rt).title);
        }), K("click", Nt, () => T(s, Xt, !0)), P(Le, Nt);
      });
      var ye = m(Je, 2);
      {
        var vt = (Le) => {
          var rt = Ho(), Xt = yt(rt), Nt = b(Xt);
          {
            var sn = (Ce) => {
              var st = Do(), pt = yt(st), dr = /* @__PURE__ */ te(() => re.bind(null, !0)), Rn = m(pt, 2), hr = b(Rn);
              j(() => M(hr, `inside ${a(i) ?? ""}`)), K("click", pt, function(...vr) {
                a(dr)?.apply(this, vr);
              }), P(Ce, st);
            }, ln = (Ce) => {
              var st = zo(), pt = b(st);
              j(() => M(pt, a(R).relive)), K("click", st, () => D(!0)), P(Ce, st);
            };
            W(Nt, (Ce) => {
              a(R).drill && a(i) ? Ce(sn) : a(R).relive && Ce(ln, 1);
            });
          }
          var on = m(Xt, 2);
          {
            var xe = (Ce) => {
              var st = qo();
              P(Ce, st);
            };
            W(on, (Ce) => {
              a(p) && Ce(xe);
            });
          }
          var at = m(on, 2);
          {
            let Ce = /* @__PURE__ */ te(() => a(v)?.rules ?? []);
            go(at, {
              get rows() {
                return a(o);
              },
              get screen() {
                return a(R);
              },
              get root() {
                return a(i);
              },
              get checked() {
                return a(c);
              },
              get rules() {
                return a(Ce);
              },
              get selected() {
                return a(u);
              },
              onpick: A,
              oncheck: $
            });
          }
          P(Le, rt);
        };
        W(ye, (Le) => {
          a(z) && Le(vt);
        });
      }
      var Ge = m(ye, 2);
      {
        var Ee = (Le) => {
          To(Le, {
            get root() {
              return kn;
            },
            get version() {
              return a(O);
            },
            get excludedDirs() {
              return a(Q);
            },
            get selected() {
              return a(u);
            },
            get busy() {
              return a(f);
            },
            onload: (rt) => Z(() => Be.tree(rt)),
            onpick: A,
            onexclude: Ue
          });
        };
        W(Ge, (Le) => {
          a(R).tree && Le(Ee);
        });
      }
      var Mn = m(Ge, 2);
      {
        let Le = /* @__PURE__ */ te(() => a(v)?.rules ?? []), rt = /* @__PURE__ */ te(() => a(v)?.unmatched ?? null);
        Zl(Mn, {
          get rules() {
            return a(Le);
          },
          get unmatched() {
            return a(rt);
          },
          get busy() {
            return a(f);
          },
          ondelete: q,
          onmove: Y
        });
      }
      K("click", _e, () => T(r, "grid")), P(k, U);
    };
    W(je, (k) => {
      a(r) === "triage" && k(dt);
    });
  }
  var Ot = m(je, 2), ht = b(Ot);
  {
    var It = (k) => {
      var U = Yo(), oe = yt(U), _e = b(oe), Je = m(oe, 2), ye = b(Je), vt = m(Je, 2);
      {
        var Ge = (xe) => {
          var at = Bo(), Ce = b(at);
          j(() => M(Ce, a(R).note)), P(xe, at);
        };
        W(vt, (xe) => {
          a(R).note && xe(Ge);
        });
      }
      var Ee = m(vt, 2);
      {
        var Mn = (xe) => {
          jl(xe, {
            get screen() {
              return a(R);
            }
          });
        };
        W(Ee, (xe) => {
          a(R).name === "dimensions" && xe(Mn);
        });
      }
      var Le = m(Ee, 2);
      ll(Le, {
        get counts() {
          return a(v);
        },
        get files() {
          return a(d);
        },
        get filesAt() {
          return a(h);
        },
        get stale() {
          return a(_);
        },
        get candidate() {
          return a(l);
        },
        get busy() {
          return a(w);
        },
        onfiles: be
      });
      var rt = m(Le, 2);
      {
        var Xt = (xe) => {
          var at = $o(), Ce = b(at), st = b(Ce), pt = m(Ce, 2), dr = b(pt), Rn = m(pt, 2), hr = m(Rn, 2), vr = b(hr);
          {
            var cs = (Bt) => {
              var un = ra("already excluded — nothing left to write");
              P(Bt, un);
            }, fs = (Bt) => {
              var un = ra();
              j((ds) => M(un, `one exclude rule each, at the end of the order${ds ?? ""}`), [
                () => a(J).length < a(c).size ? ` · ${Te(a(c).size - a(J).length)} already excluded, skipped` : ""
              ]), P(Bt, un);
            };
            W(vr, (Bt) => {
              a(J).length ? Bt(fs, -1) : Bt(cs);
            });
          }
          j(
            (Bt, un) => {
              M(st, `${Bt ?? ""} ticked`), pt.disabled = a(f) || !a(J).length, M(dr, un), Rn.disabled = a(f);
            },
            [
              () => Te(a(c).size),
              () => a(f) ? "saving…" : `Exclude ${Te(a(J).length)}`
            ]
          ), K("click", pt, we), K("click", Rn, ce), P(xe, at);
        };
        W(rt, (xe) => {
          a(c).size && xe(Xt);
        });
      }
      var Nt = m(rt, 2);
      Vl(Nt, {
        get candidate() {
          return a(l);
        },
        get screen() {
          return a(R);
        },
        get saving() {
          return a(f);
        },
        onedit: ve,
        onconfirm: We,
        onclear: re
      });
      var sn = m(Nt, 2);
      {
        var ln = (xe) => {
          var at = Uo(), Ce = b(at);
          j((st, pt) => M(Ce, `${st ?? ""}${pt ?? ""} loaded${a(x).exhausted ? " · all of them" : ""}${a(x).loading ? " · loading…" : ""} `), [
            () => Te(a(x).count),
            () => a(x).total ? " of " + Te(a(x).total) : ""
          ]), P(xe, at);
        }, on = (xe) => {
          var at = Go();
          P(xe, at);
        };
        W(sn, (xe) => {
          a(H) ? xe(ln) : a(R).sheet === !1 && xe(on, 1);
        });
      }
      j(() => {
        M(_e, `${a(R).id ?? ""} · ${a(R).title ?? ""}`), M(ye, a(R).blurb);
      }), P(k, U);
    };
    W(ht, (k) => {
      a(r) === "triage" && k(It);
    });
  }
  var Mt = m(ht, 2);
  {
    var Rt = (k) => {
      {
        let U = /* @__PURE__ */ te(() => a(r) === "grid" ? null : a(v)?.page_paths ?? null), oe = /* @__PURE__ */ te(() => a(r) === "triage");
        lo(k, {
          get key() {
            return a(G);
          },
          fetchPage: pe,
          get total() {
            return a(U);
          },
          get triage() {
            return a(oe);
          },
          get excludedDirs() {
            return a(Q);
          },
          onActivate: fe,
          onOverride: X,
          onExcludeFolder: Xe,
          onState: (_e) => T(x, { ...a(x), ..._e }, !0)
        });
      }
    };
    W(Mt, (k) => {
      (a(H) || a(r) === "grid") && k(Rt);
    });
  }
  var Pe = m(Tt, 2);
  {
    var me = (k) => {
      var U = Vo();
      let oe;
      var _e = b(U);
      j(() => {
        oe = Me(U, 1, "status", null, oe, { bare: a(r) === "grid" }), M(_e, a(C));
      }), P(k, U);
    };
    W(Pe, (k) => {
      a(C) && k(me);
    });
  }
  j(() => Ke = Me(Tt, 1, "shell", null, Ke, { bare: a(r) === "grid" })), P(e, ue), Et();
}
jt(["click"]);
wl();
Wr();
Ii(Xo, { target: document.getElementById("app") });
