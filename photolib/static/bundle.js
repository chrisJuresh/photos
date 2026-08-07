var Wn = Array.isArray, Pi = Array.prototype.indexOf, yn = Array.prototype.includes, Rn = Array.from, Di = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, Li = Object.getOwnPropertyDescriptors, Fi = Object.prototype, qi = Array.prototype, Rr = Object.getPrototypeOf, lr = Object.isExtensible;
const Hi = () => {
};
function zi(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Cr() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const ge = 2, Ht = 4, Cn = 8, Nr = 1 << 24, ze = 16, Oe = 32, nt = 64, qn = 128, Ne = 512, he = 1024, pe = 2048, Ue = 4096, xe = 8192, Me = 16384, Wt = 32768, Hn = 1 << 25, zt = 65536, wn = 1 << 17, Bi = 1 << 18, Kt = 1 << 19, ji = 1 << 20, We = 1 << 25, Et = 65536, xn = 1 << 21, qt = 1 << 22, ht = 1 << 23, yt = Symbol("$state"), Ui = Symbol("legacy props"), Vi = Symbol(""), Or = Symbol("attributes"), zn = Symbol("class"), Bn = Symbol("style"), jn = Symbol("text"), un = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Gi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Yi(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Xi() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Wi(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Ki(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Ji() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Zi(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Qi() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function $i(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function es() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ts() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function ns() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function rs() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const is = 1, ss = 2, Ir = 4, as = 8, ls = 16, os = 1, us = 4, cs = 8, fs = 16, ds = 1, vs = 2, ve = Symbol("uninitialized"), hs = "http://www.w3.org/1999/xhtml";
function ps() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function _s() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function gs() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Pr(e) {
  return e === this.v;
}
function ms(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Dr(e) {
  return !ms(e, this.v);
}
let ye = null;
function Bt(e) {
  ye = e;
}
function it(e, t = !1, n) {
  ye = {
    p: ye,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      G
    ),
    l: null
  };
}
function st(e) {
  var t = (
    /** @type {ComponentContext} */
    ye
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      ei(r);
  }
  return t.i = !0, ye = t.p, /** @type {T} */
  {};
}
function Lr() {
  return !0;
}
let Dt = [];
function bs() {
  var e = Dt;
  Dt = [], zi(e);
}
function dt(e) {
  if (Dt.length === 0) {
    var t = Dt;
    queueMicrotask(() => {
      t === Dt && bs();
    });
  }
  Dt.push(e);
}
function Fr(e) {
  var t = G;
  if (t === null)
    return W.f |= ht, e;
  if ((t.f & Wt) === 0 && (t.f & Ht) === 0)
    throw e;
  vt(e, t);
}
function vt(e, t) {
  if (!(t !== null && (t.f & Me) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & qn) !== 0) {
        if ((t.f & Wt) === 0)
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
const ys = -7169;
function oe(e, t) {
  e.f = e.f & ys | t;
}
function Kn(e) {
  (e.f & Ne) !== 0 || e.deps === null ? oe(e, he) : oe(e, Ue);
}
function qr(e) {
  if (e !== null)
    for (const t of e)
      (t.f & ge) === 0 || (t.f & Et) === 0 || (t.f ^= Et, qr(
        /** @type {Derived} */
        t.deps
      ));
}
function Hr(e, t, n) {
  (e.f & pe) !== 0 ? t.add(e) : (e.f & Ue) !== 0 && n.add(e), qr(e.deps), oe(e, he);
}
let vn = !1;
function ws(e) {
  var t = vn;
  try {
    return vn = !1, [e(), vn];
  } finally {
    vn = t;
  }
}
function Nn(e) {
  var t = W, n = G;
  Ie(null), Je(null);
  try {
    return e();
  } finally {
    Ie(t), Je(n);
  }
}
function xs(e) {
  let t = 0, n = St(0), r;
  return () => {
    $n() && (s(n), ti(() => (t === 0 && (r = Gt(() => e(() => an(n)))), t += 1, () => {
      dt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, an(n));
      });
    })));
  };
}
var ks = zt | Kt;
function Es(e, t, n, r) {
  new Ss(e, t, n, r);
}
class Ss {
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
  #a = null;
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
  #i = null;
  #p = 0;
  #u = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #_ = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #f = null;
  #m = xs(() => (this.#f = St(this.#p), () => {
    this.#f = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#o = (a) => {
      var l = (
        /** @type {Effect} */
        G
      );
      l.b = this, l.f |= qn, r(a);
    }, this.parent = /** @type {Effect} */
    G.b, this.transform_error = i ?? this.parent?.transform_error ?? ((a) => a), this.#r = er(() => {
      this.#v();
    }, ks);
  }
  #g() {
    try {
      this.#s = Ce(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #w(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: i } = this.#b(t);
    dt(i), n && (this.#l = Ce(() => {
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
  #b(t) {
    var n = !1, r = !1;
    const i = () => {
      if (n) {
        gs();
        return;
      }
      n = !0, r && rs(), this.#l !== null && xt(this.#l, () => {
        this.#l = null;
      }), this.#h(() => {
        this.#v();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, i), r = !1;
      } catch (l) {
        vt(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = Ce(() => t(this.#t)), dt(() => {
      var n = this.#i = document.createDocumentFragment(), r = tt();
      n.append(r), this.#s = this.#h(() => Ce(() => this.#o(r))), this.#u === 0 && (this.#t.before(n), this.#i = null, xt(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#y(
        /** @type {Batch} */
        $
      ));
    }));
  }
  #v() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#p = 0, this.#s = Ce(() => {
        this.#o(this.#t);
      }), this.#u > 0) {
        var t = this.#i = document.createDocumentFragment();
        nr(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = Ce(() => n(this.#t));
      } else
        this.#y(
          /** @type {Batch} */
          $
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #y(t) {
    this.is_pending = !1, t.transfer_effects(this.#d, this.#_);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Hr(t, this.#d, this.#_);
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
  #h(t) {
    var n = G, r = W, i = ye;
    Je(this.#r), Ie(this.#r), Bt(this.#r.ctx);
    try {
      return pt.ensure(), t();
    } catch (a) {
      return Fr(a), null;
    } finally {
      Je(n), Ie(r), Bt(i);
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
    this.#u += t, this.#u === 0 && (this.#y(n), this.#n && xt(this.#n, () => {
      this.#n = null;
    }), this.#i && (this.#t.before(this.#i), this.#i = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#k(t, n), this.#p += t, !(!this.#f || this.#c) && (this.#c = !0, dt(() => {
      this.#c = !1, this.#f && jt(this.#f, this.#p);
    }));
  }
  get_effect_pending() {
    return this.#m(), s(
      /** @type {Source<number>} */
      this.#f
    );
  }
  /** @param {unknown} error */
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    $?.is_fork ? (this.#s && $.skip_effect(this.#s), this.#n && $.skip_effect(this.#n), this.#l && $.skip_effect(this.#l), $.oncommit(() => {
      this.#E(t);
    })) : this.#E(t);
  }
  /**
   * @param {unknown} error
   */
  #E(t) {
    this.#s && (Se(this.#s), this.#s = null), this.#n && (Se(this.#n), this.#n = null), this.#l && (Se(this.#l), this.#l = null);
    let n = this.#e.failed;
    const r = (i) => {
      const { reset: a, invoke_onerror: l } = this.#b(i);
      l(), n && (this.#l = this.#h(() => {
        try {
          return Ce(() => {
            var u = (
              /** @type {Effect} */
              G
            );
            u.b = this, u.f |= qn, n(
              this.#t,
              () => i,
              () => a
            );
          });
        } catch (u) {
          return vt(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    dt(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (a) {
        vt(a, this.#r && this.#r.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof /** @type {any} */
      i.then == "function" ? i.then(
        r,
        /** @param {unknown} e */
        (a) => vt(a, this.#r && this.#r.parent)
      ) : r(i);
    });
  }
}
function Ts(e, t, n, r) {
  const i = ln;
  var a = e.filter((_) => !_.settled), l = t.map(i);
  if (n.length === 0 && a.length === 0) {
    r(l);
    return;
  }
  var u = (
    /** @type {Effect} */
    G
  ), o = As(), c = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((_) => _.promise)) : null;
  function h(_) {
    if ((u.f & Me) === 0) {
      o();
      try {
        r([...l, ..._]);
      } catch (b) {
        vt(b, u);
      }
      kn();
    }
  }
  var m = zr();
  if (n.length === 0) {
    c.then(() => h([])).finally(m);
    return;
  }
  function v() {
    Promise.all(n.map((_) => /* @__PURE__ */ Ms(_))).then(h).catch((_) => vt(_, u)).finally(m);
  }
  c ? c.then(() => {
    o(), v(), kn();
  }) : v();
}
function As() {
  var e = (
    /** @type {Effect} */
    G
  ), t = W, n = ye, r = (
    /** @type {Batch} */
    $
  );
  return function(a = !0) {
    Je(e), Ie(t), Bt(n), a && (e.f & Me) === 0 && (r?.activate(), r?.apply());
  };
}
function kn(e = !0) {
  Je(null), Ie(null), Bt(null), e && $?.deactivate();
}
function zr() {
  var e = (
    /** @type {Effect} */
    G
  ), t = e.b, n = (
    /** @type {Batch} */
    $
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function ln(e) {
  var t = ge | pe;
  return G !== null && (G.f |= Kt), {
    ctx: ye,
    deps: null,
    effects: null,
    equals: Pr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ve
    ),
    wv: 0,
    parent: G,
    ac: null
  };
}
const tn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function Ms(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    G
  );
  r === null && Xi();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = St(
    /** @type {V} */
    ve
  ), l = !W, u = /* @__PURE__ */ new Set();
  return Vs(() => {
    var o = (
      /** @type {Effect} */
      G
    ), c = Cr();
    i = c.promise;
    try {
      Promise.resolve(e()).then(c.resolve, (_) => {
        _ !== un && c.reject(_);
      }).finally(kn);
    } catch (_) {
      c.reject(_), kn();
    }
    var h = (
      /** @type {Batch} */
      $
    );
    if (l) {
      if ((o.f & Wt) !== 0)
        var m = zr();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        h.async_deriveds.get(o)?.reject(tn);
      else
        for (const _ of u.values())
          _.reject(tn);
      u.add(c), h.async_deriveds.set(o, c);
    }
    const v = (_, b = void 0) => {
      m?.(), u.delete(c), b !== tn && (h.activate(), b ? (a.f |= ht, jt(a, b)) : ((a.f & ht) !== 0 && (a.f ^= ht), jt(a, _)), h.deactivate());
    };
    c.promise.then(v, (_) => v(null, _ || "unknown"));
  }), $r(() => {
    for (const o of u)
      o.reject(tn);
  }), new Promise((o) => {
    function c(h) {
      function m() {
        h === i ? o(a) : c(i);
      }
      h.then(m, m);
    }
    c(i);
  });
}
// @__NO_SIDE_EFFECTS__
function ce(e) {
  const t = /* @__PURE__ */ ln(e);
  return ai(t), t;
}
// @__NO_SIDE_EFFECTS__
function Br(e) {
  const t = /* @__PURE__ */ ln(e);
  return t.equals = Dr, t;
}
function Rs(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      Se(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Jn(e) {
  var t, n = G, r = e.parent;
  if (!rt && r !== null && e.v !== ve && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (Me | xe)) !== 0)
    return ps(), e.v;
  Je(r);
  try {
    e.f &= ~Et, Rs(e), t = ci(e);
  } finally {
    Je(n);
  }
  return t;
}
function jr(e) {
  var t = Jn(e);
  if (!e.equals(t) && (e.wv = oi(), (!$?.is_fork || e.deps === null) && ($ !== null ? ($.capture(e, t, !0), Un?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    oe(e, he);
    return;
  }
  rt || (Be !== null ? ($n() || $?.is_fork) && Be.set(e, t) : Kn(e));
}
function Cs(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Nn(() => {
        t.ac.abort(un), t.ac = null;
      }), t.fn !== null && (t.teardown = Hi), on(t, 0), tr(t));
}
function Ur(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Vt(t);
}
let Pn = null, It = null, $ = null, Un = null, Be = null, Vn = null, Dn = !1, Lt = null, gn = null;
var or = 0;
let Ns = 1;
class pt {
  id = Ns++;
  /** True as soon as `#process` was called */
  #t = !1;
  linked = !0;
  /** @type {Batch | null} */
  #a = null;
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
  #i = [];
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
  #_ = /* @__PURE__ */ new Set();
  is_fork = !1;
  #f = !1;
  constructor() {
    It === null ? Pn = It = this : (It.#e = this, this.#a = It), It = this;
  }
  #m() {
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
    this.#d.has(t) || this.#d.set(t, { d: [], m: [] }), this.#_.delete(t);
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
      for (var i of r.d)
        oe(i, pe), n(i);
      for (i of r.m)
        oe(i, Ue), n(i);
    }
    this.#_.add(t);
  }
  #g() {
    this.#t = !0, or++ > 1e3 && (this.#h(), Os());
    for (const o of this.#u)
      this.#c.delete(o), oe(o, pe), this.schedule(o);
    for (const o of this.#c)
      oe(o, Ue), this.schedule(o);
    const t = this.#i;
    this.#i = [], this.apply();
    var n = Lt = [], r = [], i = gn = [];
    for (const o of t)
      try {
        this.#w(o, n, r);
      } catch (c) {
        throw Yr(o), this.#m() || this.discard(), c;
      }
    if ($ = null, i.length > 0) {
      var a = pt.ensure();
      for (const o of i)
        a.schedule(o);
    }
    if (Lt = null, gn = null, this.#m()) {
      this.#v(r), this.#v(n);
      for (const [o, c] of this.#d)
        Gr(o, c);
      i.length > 0 && /** @type {unknown} */
      $.#g();
      return;
    }
    const l = this.#b();
    if (l) {
      this.#v(r), this.#v(n), l.#x(this);
      return;
    }
    this.#u.clear(), this.#c.clear();
    for (const o of this.#o) o(this);
    this.#o.clear(), Un = this, ur(r), ur(n), Un = null, this.#l?.resolve();
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      $
    );
    if (this.#s === 0 && (this.#i.length === 0 || u !== null) && this.#h(), this.#i.length > 0)
      if (u !== null) {
        const o = u;
        o.#i.push(...this.#i.filter((c) => !o.#i.includes(c)));
      } else
        u = this;
    u !== null && u.#g();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #w(t, n, r) {
    t.f ^= he;
    for (var i = t.first; i !== null; ) {
      var a = i.f, l = (a & (Oe | nt)) !== 0, u = l && (a & he) !== 0, o = u || (a & xe) !== 0 || this.#d.has(i);
      if (!o && i.fn !== null) {
        l ? i.f ^= he : (a & Ht) !== 0 ? n.push(i) : fn(i) && ((a & ze) !== 0 && this.#c.add(i), Vt(i));
        var c = i.first;
        if (c !== null) {
          i = c;
          continue;
        }
      }
      for (; i !== null; ) {
        var h = i.next;
        if (h !== null) {
          i = h;
          break;
        }
        i = i.parent;
      }
    }
  }
  #b() {
    for (var t = this.#a; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, r]] of this.current)
          if (t.current.has(n) && !r)
            return t;
      }
      t = t.#a;
    }
    return null;
  }
  /**
   * @param {Batch} batch
   */
  #x(t) {
    for (const [r, i] of t.current)
      !this.previous.has(r) && t.previous.has(r) && this.previous.set(r, t.previous.get(r)), this.current.set(r, i);
    for (const [r, i] of t.async_deriveds) {
      const a = this.async_deriveds.get(r);
      a && i.promise.then(a.resolve).catch(a.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#u, t.#c);
    const n = (r) => {
      var i = r.reactions;
      if (i !== null && !((r.f & ge) !== 0 && (r.f & (pe | Ue)) === 0))
        for (const u of i) {
          var a = u.f;
          if ((a & ge) !== 0)
            n(
              /** @type {Derived} */
              u
            );
          else {
            var l = (
              /** @type {Effect} */
              u
            );
            a & (qt | ze) && !this.async_deriveds.has(l) && (this.#c.delete(l), oe(l, pe), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#h(), $ = this, this.#g();
  }
  /**
   * @param {Effect[]} effects
   */
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      Hr(t[n], this.#u, this.#c);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== ve && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & ht) === 0 && (this.current.set(t, [n, r]), Be?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    $ = this;
  }
  deactivate() {
    $ = null, Be = null;
  }
  flush() {
    try {
      Dn = !0, $ = this, this.#g();
    } finally {
      or = 0, Vn = null, Lt = null, gn = null, Dn = !1, $ = null, Be = null, wt.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(tn);
    this.#h(), this.#l?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #y() {
    for (let m = Pn; m !== null; m = m.#e) {
      var t = m.id < this.id, n = [];
      for (const [v, [_, b]] of this.current) {
        if (m.current.has(v)) {
          var r = (
            /** @type {[any, boolean]} */
            m.current.get(v)[0]
          );
          if (t && _ !== r)
            m.current.set(v, [_, b]);
          else
            continue;
        }
        n.push(v);
      }
      if (t)
        for (const [v, _] of this.async_deriveds) {
          const b = m.async_deriveds.get(v);
          b && _.promise.then(b.resolve).catch(b.reject);
        }
      var i = [...m.current.keys()].filter(
        (v) => !/** @type {[any, boolean]} */
        m.current.get(v)[1]
      );
      if (!(!m.#t || i.length === 0)) {
        var a = i.filter((v) => !this.current.has(v));
        if (a.length === 0)
          t && m.discard();
        else if (n.length > 0) {
          if (t)
            for (const v of this.#_)
              m.unskip_effect(v, (_) => {
                (_.f & (ze | qt)) !== 0 ? m.schedule(_) : m.#v([_]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (var o of n)
            Vr(o, a, l, u);
          u = /* @__PURE__ */ new Map();
          var c = [...m.current].filter(([v, _]) => {
            const b = this.current.get(v);
            return b ? b[0] !== _[0] || b[1] !== _[1] : !0;
          }).map(([v]) => v);
          if (c.length > 0)
            for (const v of this.#p)
              (v.f & (Me | xe | wn)) === 0 && Zn(v, c, u) && ((v.f & (qt | ze)) !== 0 ? (oe(v, pe), m.schedule(v)) : m.#u.add(v));
          if (m.#i.length > 0 && !m.#f) {
            m.apply();
            for (var h of m.#i)
              m.#w(h, [], []);
            m.#i = [];
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
    this.#f || (this.#f = !0, dt(() => {
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
    return (this.#l ??= Cr()).promise;
  }
  static ensure() {
    if ($ === null) {
      const t = $ = new pt();
      Dn || dt(() => {
        t.#t || t.flush();
      });
    }
    return $;
  }
  apply() {
    {
      Be = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Vn = t, t.b?.is_pending && (t.f & (Ht | Cn | Nr)) !== 0 && (t.f & Wt) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (Lt !== null && n === G && (W === null || (W.f & ge) === 0))
        return;
      if ((r & (nt | Oe)) !== 0) {
        if ((r & he) === 0)
          return;
        n.f ^= he;
      }
    }
    this.#i.push(n);
  }
  #h() {
    if (this.linked) {
      var t = this.#a, n = this.#e;
      t === null ? Pn = n : t.#e = n, n === null ? It = t : n.#a = t, this.linked = !1;
    }
  }
}
function Os() {
  try {
    Qi();
  } catch (e) {
    vt(e, Vn);
  }
}
let et = null;
function ur(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (Me | xe)) === 0 && fn(r) && (et = /* @__PURE__ */ new Set(), Vt(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && ri(r), et?.size > 0)) {
        wt.clear();
        for (const i of et) {
          if ((i.f & (Me | xe)) !== 0) continue;
          const a = [i];
          let l = i.parent;
          for (; l !== null; )
            et.has(l) && (et.delete(l), a.push(l)), l = l.parent;
          for (let u = a.length - 1; u >= 0; u--) {
            const o = a[u];
            (o.f & (Me | xe)) === 0 && Vt(o);
          }
        }
        et.clear();
      }
    }
    et = null;
  }
}
function Vr(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const a = i.f;
      (a & ge) !== 0 ? Vr(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (a & (qt | ze)) !== 0 && (a & pe) === 0 && Zn(i, t, r) && (oe(i, pe), Qn(
        /** @type {Effect} */
        i
      ));
    }
}
function Zn(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (yn.call(t, i))
        return !0;
      if ((i.f & ge) !== 0 && Zn(
        /** @type {Derived} */
        i,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          i,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function Qn(e) {
  $.schedule(e);
}
function Gr(e, t) {
  if (!((e.f & Oe) !== 0 && (e.f & he) !== 0)) {
    (e.f & pe) !== 0 ? t.d.push(e) : (e.f & Ue) !== 0 && t.m.push(e), oe(e, he);
    for (var n = e.first; n !== null; )
      Gr(n, t), n = n.next;
  }
}
function Yr(e) {
  oe(e, he);
  for (var t = e.first; t !== null; )
    Yr(t), t = t.next;
}
let En = /* @__PURE__ */ new Set();
const wt = /* @__PURE__ */ new Map();
let Xr = !1;
function St(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Pr,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function X(e, t) {
  const n = St(e);
  return ai(n), n;
}
// @__NO_SIDE_EFFECTS__
function Is(e, t = !1, n = !0) {
  const r = St(e);
  return t || (r.equals = Dr), r;
}
function M(e, t, n = !1) {
  W !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!je || (W.f & wn) !== 0) && Lr() && (W.f & (ge | ze | qt | wn)) !== 0 && (Ke === null || !Ke.has(e)) && ns();
  let r = n ? Ae(t) : t;
  return jt(e, r, gn);
}
function jt(e, t, n = null) {
  if (!e.equals(t)) {
    wt.set(e, rt ? t : e.v);
    var r = pt.ensure();
    if (r.capture(e, t), (e.f & ge) !== 0) {
      const i = (
        /** @type {Derived} */
        e
      );
      (e.f & pe) !== 0 && Jn(i), Be === null && Kn(i);
    }
    e.wv = oi(), Wr(e, pe, n), G !== null && (G.f & he) !== 0 && (G.f & (Oe | nt)) === 0 && (Re === null ? Xs([e]) : Re.push(e)), !r.is_fork && En.size > 0 && !Xr && Ps();
  }
  return t;
}
function Ps() {
  Xr = !1;
  for (const e of En) {
    (e.f & he) !== 0 && oe(e, Ue);
    let t;
    try {
      t = fn(e);
    } catch {
      t = !0;
    }
    t && Vt(e);
  }
  En.clear();
}
function Ds(e, t = 1) {
  var n = s(e), r = t === 1 ? n++ : n--;
  return M(e, n), r;
}
function an(e) {
  M(e, e.v + 1);
}
function Wr(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, a = 0; a < i; a++) {
      var l = r[a], u = l.f, o = (u & pe) === 0;
      if (o && oe(l, t), (u & wn) !== 0)
        En.add(
          /** @type {Effect} */
          l
        );
      else if ((u & ge) !== 0) {
        var c = (
          /** @type {Derived} */
          l
        );
        Be?.delete(c), (u & Et) === 0 && (u & Ne && (G === null || (G.f & xn) === 0) && (l.f |= Et), Wr(c, Ue, n));
      } else if (o) {
        var h = (
          /** @type {Effect} */
          l
        );
        (u & ze) !== 0 && et !== null && et.add(h), n !== null ? n.push(h) : Qn(h);
      }
    }
}
function Ae(e) {
  if (typeof e != "object" || e === null || yt in e)
    return e;
  const t = Rr(e);
  if (t !== Fi && t !== qi)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Wn(e), i = /* @__PURE__ */ X(0), a = kt, l = (u) => {
    if (kt === a)
      return u();
    var o = W, c = kt;
    Ie(null), vr(a);
    var h = u();
    return Ie(o), vr(c), h;
  };
  return r && n.set("length", /* @__PURE__ */ X(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && es();
        var h = n.get(o);
        return h === void 0 ? l(() => {
          var m = /* @__PURE__ */ X(c.value);
          return n.set(o, m), m;
        }) : M(h, c.value, !0), !0;
      },
      deleteProperty(u, o) {
        var c = n.get(o);
        if (c === void 0) {
          if (o in u) {
            const h = l(() => /* @__PURE__ */ X(ve));
            n.set(o, h), an(i);
          }
        } else
          M(c, ve), an(i);
        return !0;
      },
      get(u, o, c) {
        if (o === yt)
          return e;
        var h = n.get(o), m = o in u;
        if (h === void 0 && (!m || Ft(u, o)?.writable) && (h = l(() => {
          var _ = Ae(m ? u[o] : ve), b = /* @__PURE__ */ X(_);
          return b;
        }), n.set(o, h)), h !== void 0) {
          var v = s(h);
          return v === ve ? void 0 : v;
        }
        return Reflect.get(u, o, c);
      },
      getOwnPropertyDescriptor(u, o) {
        var c = Reflect.getOwnPropertyDescriptor(u, o);
        if (c && "value" in c) {
          var h = n.get(o);
          h && (c.value = s(h));
        } else if (c === void 0) {
          var m = n.get(o), v = m?.v;
          if (m !== void 0 && v !== ve)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return c;
      },
      has(u, o) {
        if (o === yt)
          return !0;
        var c = n.get(o), h = c !== void 0 && c.v !== ve || Reflect.has(u, o);
        if (c !== void 0 || G !== null && (!h || Ft(u, o)?.writable)) {
          c === void 0 && (c = l(() => {
            var v = h ? Ae(u[o]) : ve, _ = /* @__PURE__ */ X(v);
            return _;
          }), n.set(o, c));
          var m = s(c);
          if (m === ve)
            return !1;
        }
        return h;
      },
      set(u, o, c, h) {
        var m = n.get(o), v = o in u;
        if (r && o === "length")
          for (var _ = c; _ < /** @type {Source<number>} */
          m.v; _ += 1) {
            var b = n.get(_ + "");
            b !== void 0 ? M(b, ve) : _ in u && (b = l(() => /* @__PURE__ */ X(ve)), n.set(_ + "", b));
          }
        if (m === void 0)
          (!v || Ft(u, o)?.writable) && (m = l(() => /* @__PURE__ */ X(void 0)), M(m, Ae(c)), n.set(o, m));
        else {
          v = m.v !== ve;
          var g = l(() => Ae(c));
          M(m, g);
        }
        var d = Reflect.getOwnPropertyDescriptor(u, o);
        if (d?.set && d.set.call(h, c), !v) {
          if (r && typeof o == "string") {
            var f = (
              /** @type {Source<number>} */
              n.get("length")
            ), S = Number(o);
            Number.isInteger(S) && S >= f.v && M(f, S + 1);
          }
          an(i);
        }
        return !0;
      },
      ownKeys(u) {
        s(i);
        var o = Reflect.ownKeys(u).filter((m) => {
          var v = n.get(m);
          return v === void 0 || v.v !== ve;
        });
        for (var [c, h] of n)
          h.v !== ve && !(c in u) && o.push(c);
        return o;
      },
      setPrototypeOf() {
        ts();
      }
    }
  );
}
function cr(e) {
  try {
    if (e !== null && typeof e == "object" && yt in e)
      return e[yt];
  } catch {
  }
  return e;
}
function Ls(e, t) {
  return Object.is(cr(e), cr(t));
}
var fr, Kr, Jr, Zr;
function Fs() {
  if (fr === void 0) {
    fr = window, Kr = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Jr = Ft(t, "firstChild").get, Zr = Ft(t, "nextSibling").get, lr(e) && (e[zn] = void 0, e[Or] = null, e[Bn] = void 0, e.__e = void 0), lr(n) && (n[jn] = void 0);
  }
}
function tt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Sn(e) {
  return (
    /** @type {TemplateNode | null} */
    Jr.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function cn(e) {
  return (
    /** @type {TemplateNode | null} */
    Zr.call(e)
  );
}
function w(e, t) {
  return /* @__PURE__ */ Sn(e);
}
function He(e, t = !1) {
  {
    var n = /* @__PURE__ */ Sn(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ cn(n) : n;
  }
}
function E(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ cn(r);
  return r;
}
function qs(e) {
  e.textContent = "";
}
function Qr() {
  return !1;
}
function Hs(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function zs(e) {
  G === null && (W === null && Zi(), Ji()), rt && Ki();
}
function Bs(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function at(e, t) {
  var n = G;
  n !== null && (n.f & xe) !== 0 && (e |= xe);
  var r = {
    ctx: ye,
    deps: null,
    nodes: null,
    f: e | pe | Ne,
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
  $?.register_created_effect(r);
  var i = r;
  if ((e & Ht) !== 0)
    Lt !== null ? Lt.push(r) : pt.ensure().schedule(r);
  else if (t !== null) {
    try {
      Vt(r);
    } catch (l) {
      throw Se(r), l;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Kt) === 0 && (i = i.first, (e & ze) !== 0 && (e & zt) !== 0 && i !== null && (i.f |= zt));
  }
  if (i !== null && (i.parent = n, n !== null && Bs(i, n), W !== null && (W.f & ge) !== 0 && (e & nt) === 0)) {
    var a = (
      /** @type {Derived} */
      W
    );
    (a.effects ??= []).push(i);
  }
  return r;
}
function $n() {
  return W !== null && !je;
}
function $r(e) {
  const t = at(Cn, null);
  return oe(t, he), t.teardown = e, t;
}
function Ut(e) {
  zs();
  var t = (
    /** @type {Effect} */
    G.f
  ), n = !W && (t & Oe) !== 0 && ye !== null && !ye.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      ye
    );
    (r.e ??= []).push(e);
  } else
    return ei(e);
}
function ei(e) {
  return at(Ht | ji, e);
}
function js(e) {
  pt.ensure();
  const t = at(nt | Kt, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xt(t, () => {
      Se(t), r(void 0);
    }) : (Se(t), r(void 0));
  });
}
function Us(e) {
  return at(Ht, e);
}
function Vs(e) {
  return at(qt | Kt, e);
}
function ti(e, t = 0) {
  return at(Cn | t, e);
}
function j(e, t = [], n = [], r = []) {
  Ts(r, t, n, (i) => {
    at(Cn, () => {
      e(...i.map(s));
    });
  });
}
function er(e, t = 0) {
  var n = at(ze | t, e);
  return n;
}
function Ce(e) {
  return at(Oe | Kt, e);
}
function ni(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = rt, r = W;
    dr(!0), Ie(null);
    try {
      t.call(null);
    } finally {
      dr(n), Ie(r);
    }
  }
}
function tr(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Nn(() => {
      i.abort(un);
    });
    var r = n.next;
    (n.f & nt) !== 0 ? n.parent = null : Se(n, t), n = r;
  }
}
function Gs(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Oe) === 0 && Se(t), t = n;
  }
}
function Se(e, t = !0) {
  var n = !1;
  (t || (e.f & Bi) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ys(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Hn, tr(e, t && !n), on(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const a of r)
      a.stop();
  ni(e), e.f ^= Hn, e.f |= Me;
  var i = e.parent;
  i !== null && i.first !== null && ri(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Ys(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ cn(e);
    e.remove(), e = n;
  }
}
function ri(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xt(e, t, n = !0) {
  var r = [];
  ii(e, r, !0);
  var i = () => {
    n && Se(e), t && t();
  }, a = r.length;
  if (a > 0) {
    var l = () => --a || i();
    for (var u of r)
      u.out(l);
  } else
    i();
}
function ii(e, t, n) {
  if ((e.f & xe) === 0) {
    e.f ^= xe;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var a = i.next;
      if ((i.f & nt) === 0) {
        var l = (i.f & zt) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (i.f & Oe) !== 0 && (e.f & ze) !== 0;
        ii(i, t, l ? n : !1);
      }
      i = a;
    }
  }
}
function Tn(e) {
  si(e, !0);
}
function si(e, t) {
  if ((e.f & xe) !== 0) {
    e.f ^= xe, (e.f & he) === 0 && (oe(e, pe), pt.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & zt) !== 0 || (n.f & Oe) !== 0;
      si(n, i ? t : !1), n = r;
    }
    var a = e.nodes && e.nodes.t;
    if (a !== null)
      for (const l of a)
        (l.is_global || t) && l.in();
  }
}
function nr(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ cn(n);
      t.append(n), n = i;
    }
}
let mn = !1, rt = !1;
function dr(e) {
  rt = e;
}
let W = null, je = !1;
function Ie(e) {
  W = e;
}
let G = null;
function Je(e) {
  G = e;
}
let Ke = null;
function ai(e) {
  W !== null && (Ke ??= /* @__PURE__ */ new Set()).add(e);
}
let Ee = null, Te = 0, Re = null;
function Xs(e) {
  Re = e;
}
let li = 1, bt = 0, kt = bt;
function vr(e) {
  kt = e;
}
function oi() {
  return ++li;
}
function fn(e) {
  var t = e.f;
  if ((t & pe) !== 0)
    return !0;
  if (t & ge && (e.f &= ~Et), (t & Ue) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var a = n[i];
      if (fn(
        /** @type {Derived} */
        a
      ) && jr(
        /** @type {Derived} */
        a
      ), a.wv > e.wv)
        return !0;
    }
    (t & Ne) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Be === null && oe(e, he);
  }
  return !1;
}
function ui(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Ke !== null && Ke.has(e)))
    for (var i = 0; i < r.length; i++) {
      var a = r[i];
      (a.f & ge) !== 0 ? ui(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (n ? oe(a, pe) : (a.f & he) !== 0 && oe(a, Ue), Qn(
        /** @type {Effect} */
        a
      ));
    }
}
function ci(e) {
  var t = Ee, n = Te, r = Re, i = W, a = Ke, l = ye, u = je, o = kt, c = e.f;
  Ee = /** @type {null | Value[]} */
  null, Te = 0, Re = null, W = (c & (Oe | nt)) === 0 ? e : null, Ke = null, Bt(e.ctx), je = !1, kt = ++bt, e.ac !== null && (Nn(() => {
    e.ac.abort(un);
  }), e.ac = null);
  try {
    e.f |= xn;
    var h = (
      /** @type {Function} */
      e.fn
    ), m = h();
    e.f |= Wt;
    var v = e.deps, _ = $?.is_fork;
    if (Ee !== null) {
      var b;
      if (_ || on(e, Te), v !== null && Te > 0)
        for (v.length = Te + Ee.length, b = 0; b < Ee.length; b++)
          v[Te + b] = Ee[b];
      else
        e.deps = v = Ee;
      if ($n() && (e.f & Ne) !== 0)
        for (b = Te; b < v.length; b++)
          (v[b].reactions ??= []).push(e);
    } else !_ && v !== null && Te < v.length && (on(e, Te), v.length = Te);
    if (Lr() && Re !== null && !je && v !== null && (e.f & (ge | Ue | pe)) === 0)
      for (b = 0; b < /** @type {Source[]} */
      Re.length; b++)
        ui(
          Re[b],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (bt++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = bt;
      if (t !== null)
        for (const g of t)
          g.rv = bt;
      Re !== null && (r === null ? r = Re : r.push(.../** @type {Source[]} */
      Re));
    }
    return (e.f & ht) !== 0 && (e.f ^= ht), m;
  } catch (g) {
    return Fr(g);
  } finally {
    e.f ^= xn, Ee = t, Te = n, Re = r, W = i, Ke = a, Bt(l), je = u, kt = o;
  }
}
function Ws(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Pi.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & ge) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Ee === null || !yn.call(Ee, t))) {
    var a = (
      /** @type {Derived} */
      t
    );
    (a.f & Ne) !== 0 && (a.f ^= Ne, a.f &= ~Et), a.v !== ve && Kn(a), a.ac !== null && Nn(() => {
      a.ac.abort(un), a.ac = null, oe(a, pe);
    }), Cs(a), on(a, 0);
  }
}
function on(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Ws(e, n[r]);
}
function Vt(e) {
  var t = e.f;
  if ((t & Me) === 0) {
    oe(e, he);
    var n = G, r = mn;
    G = e, mn = (t & (Oe | nt)) === 0;
    try {
      (t & (ze | Nr)) !== 0 ? Gs(e) : tr(e), ni(e);
      var i = ci(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = li;
      var a;
    } finally {
      mn = r, G = n;
    }
  }
}
function s(e) {
  var t = e.f, n = (t & ge) !== 0;
  if (W !== null && !je) {
    var r = G !== null && (G.f & Me) !== 0;
    if (!r && (Ke === null || !Ke.has(e))) {
      var i = W.deps;
      if ((W.f & xn) !== 0)
        e.rv < bt && (e.rv = bt, Ee === null && i !== null && i[Te] === e ? Te++ : Ee === null ? Ee = [e] : Ee.push(e));
      else {
        W.deps ??= [], yn.call(W.deps, e) || W.deps.push(e);
        var a = e.reactions;
        a === null ? e.reactions = [W] : yn.call(a, W) || a.push(W);
      }
    }
  }
  if (rt && wt.has(e))
    return wt.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (rt) {
      var u = l.v;
      return ((l.f & he) === 0 && l.reactions !== null || di(l)) && (u = Jn(l)), wt.set(l, u), u;
    }
    var o = (l.f & Ne) === 0 && !je && W !== null && (mn || (W.f & Ne) !== 0), c = (l.f & Wt) === 0;
    fn(l) && (o && (l.f |= Ne), jr(l)), o && !c && (Ur(l), fi(l));
  }
  if (Be?.has(e))
    return Be.get(e);
  if ((e.f & ht) !== 0)
    throw e.v;
  return e.v;
}
function fi(e) {
  if (e.f |= Ne, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & ge) !== 0 && (t.f & Ne) === 0 && (Ur(
        /** @type {Derived} */
        t
      ), fi(
        /** @type {Derived} */
        t
      ));
}
function di(e) {
  if (e.v === ve) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (wt.has(t) || (t.f & ge) !== 0 && di(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Gt(e) {
  var t = je;
  try {
    return je = !0, e();
  } finally {
    je = t;
  }
}
const Ks = ["touchstart", "touchmove"];
function Js(e) {
  return Ks.includes(e);
}
const nn = Symbol("events"), vi = /* @__PURE__ */ new Set(), Gn = /* @__PURE__ */ new Set();
function ie(e, t, n) {
  (t[nn] ??= {})[e] = n;
}
function Tt(e) {
  for (var t = 0; t < e.length; t++)
    vi.add(e[t]);
  for (var n of Gn)
    n(e);
}
let hr = null;
function pr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], a = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  hr = e;
  var l = 0, u = hr === e && e[nn];
  if (u) {
    var o = i.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[nn] = t;
      return;
    }
    var c = i.indexOf(t);
    if (c === -1)
      return;
    o <= c && (l = o);
  }
  if (a = /** @type {Element} */
  i[l] || e.target, a !== t) {
    Di(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || n;
      }
    });
    var h = W, m = G;
    Ie(null), Je(null);
    try {
      for (var v, _ = []; a !== null && a !== t; ) {
        try {
          var b = a[nn]?.[r];
          b != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === a) && b.call(a, e);
        } catch (g) {
          v ? _.push(g) : v = g;
        }
        if (e.cancelBubble) break;
        l++, a = l < i.length ? (
          /** @type {Element} */
          i[l]
        ) : null;
      }
      if (v) {
        for (let g of _)
          queueMicrotask(() => {
            throw g;
          });
        throw v;
      }
    } finally {
      e[nn] = t, delete e.currentTarget, Ie(h), Je(m);
    }
  }
}
const Zs = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Qs(e) {
  return (
    /** @type {string} */
    Zs?.createHTML(e) ?? e
  );
}
function $s(e) {
  var t = Hs("template");
  return t.innerHTML = Qs(e.replaceAll("<!>", "<!---->")), t.content;
}
function An(e, t) {
  var n = (
    /** @type {Effect} */
    G
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function L(e, t) {
  var n = (t & ds) !== 0, r = (t & vs) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = $s(a ? e : "<!>" + e), n || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ Sn(i)));
    var l = (
      /** @type {TemplateNode} */
      r || Kr ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Sn(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      An(u, o);
    } else
      An(l, l);
    return l;
  };
}
function _r(e = "") {
  {
    var t = tt(e + "");
    return An(t, t), t;
  }
}
function hi() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = tt();
  return e.append(t, n), An(t, n), e;
}
function D(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function N(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[jn] ??= e.nodeValue) && (e[jn] = n, e.nodeValue = `${n}`);
}
function ea(e, t) {
  return ta(e, t);
}
const hn = /* @__PURE__ */ new Map();
function ta(e, { target: t, anchor: n, props: r = {}, events: i, context: a, intro: l = !0, transformError: u }) {
  Fs();
  var o = void 0, c = js(() => {
    var h = n ?? t.appendChild(tt());
    Es(
      /** @type {TemplateNode} */
      h,
      {
        pending: () => {
        }
      },
      (_) => {
        it({});
        var b = (
          /** @type {ComponentContext} */
          ye
        );
        a && (b.c = a), i && (r.$$events = i), o = e(_, r) || {}, st();
      },
      u
    );
    var m = /* @__PURE__ */ new Set(), v = (_) => {
      for (var b = 0; b < _.length; b++) {
        var g = _[b];
        if (!m.has(g)) {
          m.add(g);
          var d = Js(g);
          for (const C of [t, document]) {
            var f = hn.get(C);
            f === void 0 && (f = /* @__PURE__ */ new Map(), hn.set(C, f));
            var S = f.get(g);
            S === void 0 ? (C.addEventListener(g, pr, { passive: d }), f.set(g, 1)) : f.set(g, S + 1);
          }
        }
      }
    };
    return v(Rn(vi)), Gn.add(v), () => {
      for (var _ of m)
        for (const d of [t, document]) {
          var b = (
            /** @type {Map<string, number>} */
            hn.get(d)
          ), g = (
            /** @type {number} */
            b.get(_)
          );
          --g == 0 ? (d.removeEventListener(_, pr), b.delete(_), b.size === 0 && hn.delete(d)) : b.set(_, g);
        }
      Gn.delete(v), h !== n && h.parentNode?.removeChild(h);
    };
  });
  return na.set(o, c), o;
}
let na = /* @__PURE__ */ new WeakMap();
class ra {
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
  #a = /* @__PURE__ */ new Map();
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
      ), r = this.#a.get(n);
      if (r)
        Tn(r), this.#o.delete(n);
      else {
        var i = this.#e.get(n);
        i && (Tn(i.effect), this.#a.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [a, l] of this.#t) {
        if (this.#t.delete(a), a === t)
          break;
        const u = this.#e.get(l);
        u && (Se(u.effect), this.#e.delete(l));
      }
      for (const [a, l] of this.#a) {
        if (a === n || this.#o.has(a)) continue;
        const u = () => {
          if (Array.from(this.#t.values()).includes(a)) {
            var c = document.createDocumentFragment();
            nr(l, c), c.append(tt()), this.#e.set(a, { effect: l, fragment: c });
          } else
            Se(l);
          this.#o.delete(a), this.#a.delete(a);
        };
        this.#r || !r ? (this.#o.add(a), xt(l, u, !1)) : u();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (Se(i.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      $
    ), i = Qr();
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var a = document.createDocumentFragment(), l = tt();
        a.append(l), this.#e.set(t, {
          effect: Ce(() => n(l)),
          fragment: a
        });
      } else
        this.#a.set(
          t,
          Ce(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [u, o] of this.#a)
        u === t ? r.unskip_effect(o) : r.skip_effect(o);
      for (const [u, o] of this.#e)
        u === t ? r.unskip_effect(o.effect) : r.skip_effect(o.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function J(e, t, n = !1) {
  var r = new ra(e), i = n ? zt : 0;
  function a(l, u) {
    r.ensure(l, u);
  }
  er(() => {
    var l = !1;
    t((u, o = 0) => {
      l = !0, a(o, u);
    }), l || a(-1, null);
  }, i);
}
function Yn(e, t) {
  return t;
}
function ia(e, t, n) {
  for (var r = [], i = t.length, a, l = t.length, u = 0; u < i; u++) {
    let m = t[u];
    xt(
      m,
      () => {
        if (a) {
          if (a.pending.delete(m), a.done.add(m), a.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Xn(e, Rn(a.done)), v.delete(a), v.size === 0 && (e.outrogroups = null);
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
      var c = (
        /** @type {Element} */
        n
      ), h = (
        /** @type {Element} */
        c.parentNode
      );
      qs(h), h.append(c), e.items.clear();
    }
    Xn(e, t, !o);
  } else
    a = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function Xn(e, t, n = !0) {
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
  for (var i = 0; i < t.length; i++) {
    var a = t[i];
    if (r?.has(a)) {
      a.f |= We;
      const l = document.createDocumentFragment();
      nr(a, l);
    } else
      Se(t[i], n);
  }
}
var gr;
function Yt(e, t, n, r, i, a = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & Ir) !== 0;
  if (o) {
    var c = (
      /** @type {Element} */
      e
    );
    l = c.appendChild(tt());
  }
  var h = null, m = /* @__PURE__ */ Br(() => {
    var C = n();
    return (
      /** @type {V[]} */
      Wn(C) ? C : C == null ? [] : Rn(C)
    );
  }), v, _ = /* @__PURE__ */ new Map(), b = !0;
  function g(C) {
    (S.effect.f & Me) === 0 && (S.pending.delete(C), S.fallback = h, sa(S, v, l, t, r), h !== null && (v.length === 0 ? (h.f & We) === 0 ? Tn(h) : (h.f ^= We, rn(h, null, l)) : xt(h, () => {
      h = null;
    })));
  }
  function d(C) {
    S.pending.delete(C);
  }
  var f = er(() => {
    v = /** @type {V[]} */
    s(m);
    for (var C = v.length, y = /* @__PURE__ */ new Set(), k = (
      /** @type {Batch} */
      $
    ), O = Qr(), H = 0; H < C; H += 1) {
      var B = v[H], P = r(B, H), R = b ? null : u.get(P);
      R ? (R.v && jt(R.v, B), R.i && jt(R.i, H), O && k.unskip_effect(R.e)) : (R = aa(
        u,
        b ? l : gr ??= tt(),
        B,
        P,
        H,
        i,
        t,
        n
      ), b || (R.e.f |= We), u.set(P, R)), y.add(P);
    }
    if (C === 0 && a && !h && (b ? h = Ce(() => a(l)) : (h = Ce(() => a(gr ??= tt())), h.f |= We)), C > y.size && Wi(), !b)
      if (_.set(k, y), O) {
        for (const [F, U] of u)
          y.has(F) || k.skip_effect(U.e);
        k.oncommit(g), k.ondiscard(d);
      } else
        g(k);
    s(m);
  }), S = { effect: f, items: u, pending: _, outrogroups: null, fallback: h };
  b = !1;
}
function en(e) {
  for (; e !== null && (e.f & Oe) === 0; )
    e = e.next;
  return e;
}
function sa(e, t, n, r, i) {
  var a = (r & as) !== 0, l = t.length, u = e.items, o = en(e.effect.first), c, h = null, m, v = [], _ = [], b, g, d, f;
  if (a)
    for (f = 0; f < l; f += 1)
      b = t[f], g = i(b, f), d = /** @type {EachItem} */
      u.get(g).e, (d.f & We) === 0 && (d.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(d));
  for (f = 0; f < l; f += 1) {
    if (b = t[f], g = i(b, f), d = /** @type {EachItem} */
    u.get(g).e, e.outrogroups !== null)
      for (const R of e.outrogroups)
        R.pending.delete(d), R.done.delete(d);
    if ((d.f & xe) !== 0 && (Tn(d), a && (d.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(d))), (d.f & We) !== 0)
      if (d.f ^= We, d === o)
        rn(d, null, n);
      else {
        var S = h ? h.next : o;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), ct(e, h, d), ct(e, d, S), rn(d, S, n), h = d, v = [], _ = [], o = en(h.next);
        continue;
      }
    if (d !== o) {
      if (c !== void 0 && c.has(d)) {
        if (v.length < _.length) {
          var C = _[0], y;
          h = C.prev;
          var k = v[0], O = v[v.length - 1];
          for (y = 0; y < v.length; y += 1)
            rn(v[y], C, n);
          for (y = 0; y < _.length; y += 1)
            c.delete(_[y]);
          ct(e, k.prev, O.next), ct(e, h, k), ct(e, O, C), o = C, h = O, f -= 1, v = [], _ = [];
        } else
          c.delete(d), rn(d, o, n), ct(e, d.prev, d.next), ct(e, d, h === null ? e.effect.first : h.next), ct(e, h, d), h = d;
        continue;
      }
      for (v = [], _ = []; o !== null && o !== d; )
        (c ??= /* @__PURE__ */ new Set()).add(o), _.push(o), o = en(o.next);
      if (o === null)
        continue;
    }
    (d.f & We) === 0 && v.push(d), h = d, o = en(d.next);
  }
  if (e.outrogroups !== null) {
    for (const R of e.outrogroups)
      R.pending.size === 0 && (Xn(e, Rn(R.done)), e.outrogroups?.delete(R));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || c !== void 0) {
    var H = [];
    if (c !== void 0)
      for (d of c)
        (d.f & xe) === 0 && H.push(d);
    for (; o !== null; )
      (o.f & xe) === 0 && o !== e.fallback && H.push(o), o = en(o.next);
    var B = H.length;
    if (B > 0) {
      var P = (r & Ir) !== 0 && l === 0 ? n : null;
      if (a) {
        for (f = 0; f < B; f += 1)
          H[f].nodes?.a?.measure();
        for (f = 0; f < B; f += 1)
          H[f].nodes?.a?.fix();
      }
      ia(e, H, P);
    }
  }
  a && dt(() => {
    if (m !== void 0)
      for (d of m)
        d.nodes?.a?.apply();
  });
}
function aa(e, t, n, r, i, a, l, u) {
  var o = (l & is) !== 0 ? (l & ls) === 0 ? /* @__PURE__ */ Is(n, !1, !1) : St(n) : null, c = (l & ss) !== 0 ? St(i) : null;
  return {
    v: o,
    i: c,
    e: Ce(() => (a(t, o ?? n, c ?? i, u), () => {
      e.delete(r);
    }))
  };
}
function rn(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, a = t && (t.f & We) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ cn(r)
      );
      if (a.before(r), r === i)
        return;
      r = l;
    }
}
function ct(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const mr = [...` 	
\r\f \v\uFEFF`];
function la(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var i of Object.keys(n))
      if (n[i])
        r = r ? r + " " + i : i;
      else if (r.length)
        for (var a = i.length, l = 0; (l = r.indexOf(i, l)) >= 0; ) {
          var u = l + a;
          (l === 0 || mr.includes(r[l - 1])) && (u === r.length || mr.includes(r[u])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(u + 1) : l = u;
        }
  }
  return r === "" ? null : r;
}
function br(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var i of Object.keys(e)) {
    var a = e[i];
    a != null && a !== "" && (r += " " + i + ": " + a + n);
  }
  return r;
}
function oa(e, t) {
  if (t) {
    var n = "", r, i;
    return Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, r && (n += br(r)), i && (n += br(i, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Ve(e, t, n, r, i, a) {
  var l = (
    /** @type {any} */
    e[zn]
  );
  if (l !== n || l === void 0) {
    var u = la(n, r, a);
    u == null ? e.removeAttribute("class") : e.className = u, e[zn] = n;
  } else if (a && i !== a)
    for (var o in a) {
      var c = !!a[o];
      (i == null || c !== !!i[o]) && e.classList.toggle(o, c);
    }
  return a;
}
function Ln(e, t = {}, n, r) {
  for (var i in n) {
    var a = n[i];
    t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
  }
}
function pn(e, t, n, r) {
  var i = (
    /** @type {any} */
    e[Bn]
  );
  if (i !== t) {
    var a = oa(t, r);
    a == null ? e.removeAttribute("style") : e.style.cssText = a, e[Bn] = t;
  } else r && (Array.isArray(r) ? (Ln(e, n?.[0], r[0]), Ln(e, n?.[1], r[1], "important")) : Ln(e, n, r));
  return r;
}
function sn(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Wn(t))
      return _s();
    for (var r of e.options)
      r.selected = t.includes(yr(r));
    return;
  }
  for (r of e.options) {
    var i = yr(r);
    if (Ls(i, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function _n(e) {
  var t = new MutationObserver(() => {
    "__value" in e && sn(e, e.__value);
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
function yr(e) {
  return "__value" in e ? e.__value : e.value;
}
const ua = Symbol("is custom element"), ca = Symbol("is html"), fa = Gi ? "progress" : "PROGRESS";
function da(e, t) {
  var n = pi(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== fa) || (e.value = t ?? "");
}
function ft(e, t, n, r) {
  var i = pi(e);
  i[t] !== (i[t] = n) && (t === "loading" && (e[Vi] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && va(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function pi(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[Or] ??= {
      [ua]: e.nodeName.includes("-"),
      [ca]: e.namespaceURI === hs
    }
  );
}
var wr = /* @__PURE__ */ new Map();
function va(e) {
  var t = e.getAttribute("is") || e.nodeName, n = wr.get(t);
  if (n) return n;
  wr.set(t, n = []);
  for (var r, i = e, a = Element.prototype; a !== i; ) {
    r = Li(i);
    for (var l in r)
      r[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    i = Rr(i);
  }
  return n;
}
function Fn(e, t) {
  return e === t || e?.[yt] === t;
}
function xr(e = {}, t, n, r) {
  var i = (
    /** @type {ComponentContext} */
    ye.r
  ), a = (
    /** @type {Effect} */
    G
  );
  return Us(() => {
    var l, u;
    return ti(() => {
      l = u, u = [], Gt(() => {
        Fn(n(...u), e) || (t(e, ...u), l && Fn(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = a;
      for (; o !== i && o.parent !== null && o.parent.f & Hn; )
        o = o.parent;
      const c = () => {
        u && Fn(n(...u), e) && t(null, ...u);
      }, h = o.teardown;
      o.teardown = () => {
        c(), h?.();
      };
    };
  }), e;
}
function ee(e, t, n, r) {
  var i = !0, a = (n & cs) !== 0, l = (n & fs) !== 0, u = (
    /** @type {V} */
    r
  ), o = !0, c = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), h = () => l && i ? (c ??= /* @__PURE__ */ ln(
    /** @type {() => V} */
    r
  ), s(c)) : (o && (o = !1, u = l ? Gt(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), u);
  let m;
  if (a) {
    var v = yt in e || Ui in e;
    m = Ft(e, t)?.set ?? (v && t in e ? (y) => e[t] = y : void 0);
  }
  var _, b = !1;
  a ? [_, b] = ws(() => (
    /** @type {V} */
    e[t]
  )) : _ = /** @type {V} */
  e[t], _ === void 0 && r !== void 0 && (_ = h(), m && ($i(), m(_)));
  var g;
  if (g = () => {
    var y = (
      /** @type {V} */
      e[t]
    );
    return y === void 0 ? h() : (o = !0, y);
  }, (n & us) === 0)
    return g;
  if (m) {
    var d = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(y, k) {
        return arguments.length > 0 ? ((!k || d || b) && m(k ? g() : y), y) : g();
      })
    );
  }
  var f = !1, S = ((n & os) !== 0 ? ln : Br)(() => (f = !1, g()));
  a && s(S);
  var C = (
    /** @type {Effect} */
    G
  );
  return (
    /** @type {() => V} */
    (function(y, k) {
      if (arguments.length > 0) {
        const O = k ? s(S) : a ? Ae(y) : y;
        return M(S, O), f = !0, u !== void 0 && (u = O), y;
      }
      return rt && f || (C.f & Me) !== 0 ? S.v : s(S);
    })
  );
}
function _i(e) {
  ye === null && Yi(), Ut(() => {
    const t = Gt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const ha = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(ha);
function pa(e) {
  const t = new URLSearchParams();
  for (const [r, i] of Object.entries(e))
    i != null && t.set(r, String(i));
  const n = t.toString();
  return n ? "?" + n : "";
}
async function mt(e, t = {}) {
  const n = await fetch(e + pa(t));
  if (!n.ok) {
    const r = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  }
  return n.json();
}
async function Pt(e, t) {
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
function kr(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const we = {
  // --- reads
  photos: (e) => mt("/api/photos", e),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => mt("/api/triage/counts", { ...kr(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => mt("/api/triage/files"),
  screen: (e, t = {}) => mt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => mt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => mt("/api/triage/page", { ...kr(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => mt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => Pt("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => Pt("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => Pt("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => Pt("/api/triage/override", { sha256: e, decision: t }),
  // --- the one surface that leaves the process
  revealPhoto: (e) => Pt("/api/reveal", { id: e }),
  revealOrigin: (e) => Pt("/api/reveal", { origin: e })
};
function _a() {
  let e = 0, t = 0;
  return async function(r) {
    const i = ++e, a = await r();
    return i <= t ? { stale: !0, value: void 0 } : (t = i, { stale: !1, value: a });
  };
}
function ga(e, t) {
  let n = 0;
  const r = (...i) => {
    clearTimeout(n), n = setTimeout(() => e(...i), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...i) => {
    clearTimeout(n), e(...i);
  }, r;
}
const Er = ["B", "KB", "MB", "GB", "TB"];
function qe(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < Er.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${Er[n]}`;
}
function _e(e) {
  return (Number(e) || 0).toLocaleString();
}
const Xt = "G:\\photos", Sr = [
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
      value: t ? `${Xt}\\${t}\\${e.key}` : `${Xt}\\${e.key}`
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
function gi(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), r = Xt.toLowerCase();
  return n.toLowerCase().startsWith(r + "\\") ? n : "";
}
function rr(e, t) {
  const n = t.toLowerCase();
  return e.some((r) => n === r || n.startsWith(r + "\\"));
}
function ma(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function ba(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function mi(e, t) {
  if (!t) return null;
  const n = e.find(
    (r) => r.term && r.term.column === t.column && r.term.op === t.op && ba(r.term.value, t.value)
  );
  return n ? n.decision : null;
}
var ya = /* @__PURE__ */ L('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), wa = /* @__PURE__ */ L('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), xa = /* @__PURE__ */ L('<div class="line muted svelte-1vgp6n7">…</div>'), ka = /* @__PURE__ */ L('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), Ea = /* @__PURE__ */ L('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), Sa = /* @__PURE__ */ L('<div class="line muted svelte-1vgp6n7"> </div>'), Ta = /* @__PURE__ */ L('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function Aa(e, t) {
  it(t, !0);
  let n = ee(t, "counts", 3, null), r = ee(t, "files", 3, null), i = ee(t, "filesAt", 3, null), a = ee(t, "stale", 3, !1), l = ee(t, "candidate", 3, null), u = ee(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ce(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var c = Ta(), h = w(c);
  let m;
  var v = E(w(h), 2);
  {
    var _ = (P) => {
      var R = wa(), F = He(R), U = w(F), q = w(U), Y = E(U, 2), Z = w(Y), K = E(Y, 4), te = w(K), se = E(K, 2), ne = w(se), me = E(F, 2);
      {
        var I = (x) => {
          var p = ya(), A = E(w(p), 2), z = w(A), ae = E(A, 2), le = w(ae), re = E(ae, 4), Ge = w(re), Ze = E(re, 2), be = w(Ze), ke = E(Ze, 2), Pe = w(ke);
          j(
            (Ye, _t, At, Xe, dn) => {
              N(z, `kept ${Ye ?? ""}`), N(le, _t), N(Ge, `excluded ${At ?? ""}`), N(be, Xe), N(Pe, `${s(o) >= 0 ? "+" : ""}${dn ?? ""} excluded`);
            },
            [
              () => _e(n().candidate_kept_paths),
              () => qe(n().candidate_kept_bytes),
              () => _e(n().candidate_excluded_paths),
              () => qe(n().candidate_excluded_bytes),
              () => _e(s(o))
            ]
          ), D(x, p);
        };
        J(me, (x) => {
          l() && x(I);
        });
      }
      j(
        (x, p, A, z) => {
          N(q, `kept ${x ?? ""}`), N(Z, p), N(te, `excluded ${A ?? ""}`), N(ne, z);
        },
        [
          () => _e(n().kept_paths),
          () => qe(n().kept_bytes),
          () => _e(n().excluded_paths),
          () => qe(n().excluded_bytes)
        ]
      ), D(P, R);
    }, b = (P) => {
      var R = xa();
      D(P, R);
    };
    J(v, (P) => {
      n() ? P(_) : P(b, -1);
    });
  }
  var g = E(h, 2);
  let d;
  var f = w(g), S = E(w(f), 3), C = w(S), y = E(S, 2);
  {
    var k = (P) => {
      var R = ka();
      D(P, R);
    };
    J(y, (P) => {
      a() && r() && r() !== "loading" && P(k);
    });
  }
  var O = E(f, 2);
  {
    var H = (P) => {
      var R = Ea(), F = He(R);
      let U;
      var q = w(F), Y = w(q), Z = E(q, 2), K = w(Z), te = E(Z, 4), se = w(te), ne = E(te, 2), me = w(ne), I = E(F, 2), x = w(I);
      j(
        (p, A, z, ae) => {
          U = Ve(F, 1, "line svelte-1vgp6n7", null, U, { outdated: a() }), N(Y, `kept ${p ?? ""}`), N(K, A), N(se, `excluded ${z ?? ""}`), N(me, ae), N(x, `as of ${i() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => _e(r().kept_files),
          () => qe(r().kept_bytes),
          () => _e(r().excluded_files),
          () => qe(r().excluded_bytes)
        ]
      ), D(P, R);
    }, B = (P) => {
      var R = Sa(), F = w(R);
      j(() => N(F, r() === "loading" ? "counting…" : "not counted yet")), D(P, R);
    };
    J(O, (P) => {
      r() && r() !== "loading" ? P(H) : P(B, -1);
    });
  }
  j(() => {
    m = Ve(h, 1, "block svelte-1vgp6n7", null, m, { busy: u() }), d = Ve(g, 1, "block svelte-1vgp6n7", null, d, { busy: r() === "loading" }), S.disabled = r() === "loading", N(C, r() === "loading" ? "counting…" : "recount");
  }), ie("click", S, function(...P) {
    t.onfiles?.apply(this, P);
  }), D(e, c), st();
}
Tt(["click"]);
var Ma = /* @__PURE__ */ L('<span class="err svelte-uzy12d"> </span>'), Ra = /* @__PURE__ */ L(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Ca = /* @__PURE__ */ L(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), Na = /* @__PURE__ */ L('<span class="muted svelte-uzy12d"> </span>'), Oa = /* @__PURE__ */ L('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function Ia(e, t) {
  it(t, !0);
  let n = /* @__PURE__ */ X(null), r = /* @__PURE__ */ X(!1), i = /* @__PURE__ */ X(null);
  async function a() {
    M(r, !0), M(i, null);
    try {
      M(n, await we.probe(), !0);
    } catch (_) {
      M(i, String(_), !0);
    } finally {
      M(r, !1);
    }
  }
  var l = Oa(), u = w(l), o = w(u), c = E(u, 2);
  {
    var h = (_) => {
      var b = Ma(), g = w(b);
      j(() => N(g, s(i))), D(_, b);
    }, m = (_) => {
      var b = hi(), g = He(b);
      {
        var d = (S) => {
          var C = Ra(), y = E(w(C), 2);
          j(
            (k) => N(y, ` above are formats the header
        reader cannot measure (${k ?? ""}) or files with no
        extension.`),
            [() => s(n).formats.join(" ")]
          ), D(S, C);
        }, f = (S) => {
          var C = Ca(), y = w(C), k = w(y), O = E(y, 2), H = w(O);
          j(
            (B) => {
              N(k, B), N(H, s(n).command);
            },
            [() => _e(s(n).worklist)]
          ), D(S, C);
        };
        J(g, (S) => {
          s(n).worklist === 0 ? S(d) : S(f, -1);
        });
      }
      D(_, b);
    }, v = (_) => {
      var b = Na(), g = w(b);
      j(() => N(g, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), D(_, b);
    };
    J(c, (_) => {
      s(i) ? _(h) : s(n) ? _(m, 1) : _(v, -1);
    });
  }
  j(() => {
    u.disabled = s(r), N(o, s(r) ? "counting…" : "Check the dimension probe's worklist");
  }), ie("click", u, a), D(e, l), st();
}
Tt(["click"]);
var Pa = /* @__PURE__ */ L('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), Tr = /* @__PURE__ */ L("<option> </option>"), Da = /* @__PURE__ */ L('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), La = /* @__PURE__ */ L('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), Fa = /* @__PURE__ */ L('<div class="none muted svelte-bqi9ky"> </div>'), qa = /* @__PURE__ */ L('<div class="bar svelte-bqi9ky"><!></div>');
function Ha(e, t) {
  it(t, !0);
  let n = ee(t, "candidate", 3, null), r = ee(t, "saving", 3, !1);
  const i = [
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
  ], a = {
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), u = /* @__PURE__ */ ce(() => n() ? a[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ ce(() => !!n() && n().op !== "is null");
  function c(g, d) {
    const f = { ...n(), [g]: d };
    if (g === "column") {
      const S = a[d] ?? ["="];
      S.includes(f.op) || (f.op = S[0]), f.value = l.has(d) ? 0 : "";
    }
    g === "op" && d === "is null" && (f.value = null), g === "value" && l.has(f.column) && (f.value = Number(d) || 0), t.onedit(f);
  }
  var h = qa(), m = w(h);
  {
    var v = (g) => {
      var d = Pa(), f = w(d), S = w(f), C = E(f, 2), y = w(C);
      j(() => {
        N(S, `${t.screen.title ?? ""} does not save a rule.`), N(y, t.screen.blurb);
      }), D(g, d);
    }, _ = (g) => {
      var d = La(), f = He(d), S = w(f);
      Yt(S, 21, () => i, Yn, (I, x) => {
        var p = Tr(), A = w(p), z = {};
        j(() => {
          N(A, s(x)), z !== (z = s(x)) && (p.value = (p.__value = s(x)) ?? "");
        }), D(I, p);
      });
      var C;
      _n(S);
      var y = E(S, 2);
      Yt(y, 21, () => s(u), Yn, (I, x) => {
        var p = Tr(), A = w(p), z = {};
        j(() => {
          N(A, s(x)), z !== (z = s(x)) && (p.value = (p.__value = s(x)) ?? "");
        }), D(I, p);
      });
      var k;
      _n(y);
      var O = E(y, 2);
      {
        var H = (I) => {
          var x = Da();
          j(() => da(x, n().value ?? "")), ie("input", x, (p) => c("value", p.currentTarget.value)), D(I, x);
        };
        J(O, (I) => {
          s(o) && I(H);
        });
      }
      var B = E(O, 2), P = w(B);
      P.value = P.__value = "exclude";
      var R = E(P);
      R.value = R.__value = "include";
      var F;
      _n(B);
      var U = E(B, 2), q = w(U);
      q.value = q.__value = "end";
      var Y = E(q);
      Y.value = Y.__value = "0";
      var Z;
      _n(U);
      var K = E(U, 2), te = w(K), se = E(K, 2), ne = E(f, 2), me = w(ne);
      j(
        (I, x) => {
          C !== (C = n().column) && (S.value = (S.__value = n().column) ?? "", sn(S, n().column)), k !== (k = n().op) && (y.value = (y.__value = n().op) ?? "", sn(y, n().op)), F !== (F = n().decision ?? "exclude") && (B.value = (B.__value = n().decision ?? "exclude") ?? "", sn(B, n().decision ?? "exclude")), Z !== (Z = I) && (U.value = (U.__value = I) ?? "", sn(U, I)), K.disabled = r(), N(te, r() ? "saving…" : "Confirm"), N(me, `${x ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => ma(n())
        ]
      ), ie("change", S, (I) => c("column", I.currentTarget.value)), ie("change", y, (I) => c("op", I.currentTarget.value)), ie("change", B, (I) => c("decision", I.currentTarget.value)), ie("change", U, (I) => c("at", I.currentTarget.value)), ie("click", K, function(...I) {
        t.onconfirm?.apply(this, I);
      }), ie("click", se, function(...I) {
        t.onclear?.apply(this, I);
      }), D(g, d);
    }, b = (g) => {
      var d = Fa(), f = w(d);
      j(() => N(f, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), D(g, d);
    };
    J(m, (g) => {
      t.screen.rule === !1 ? g(v) : n() ? g(_, 1) : g(b, -1);
    });
  }
  D(e, h), st();
}
Tt(["change", "input", "click"]);
var za = /* @__PURE__ */ L('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), Ba = /* @__PURE__ */ L('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), ja = /* @__PURE__ */ L('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Ua = /* @__PURE__ */ L('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Va(e, t) {
  it(t, !0);
  let n = ee(t, "rules", 19, () => []), r = ee(t, "unmatched", 3, null), i = ee(t, "busy", 3, !1);
  var a = Ua(), l = w(a), u = E(w(l)), o = w(u), c = E(l, 2);
  {
    var h = (b) => {
      var g = za();
      D(b, g);
    };
    J(c, (b) => {
      n().length === 0 && b(h);
    });
  }
  var m = E(c, 2);
  Yt(m, 19, n, (b) => b.id, (b, g, d) => {
    var f = Ba();
    let S;
    var C = w(f), y = w(C), k = w(y), O = E(y, 2), H = w(O), B = E(O, 2), P = w(B), R = E(C, 2), F = w(R), U = w(F), q = E(F, 2), Y = w(q), Z = E(q, 4), K = E(Z, 2), te = E(K, 2);
    j(
      (se, ne) => {
        S = Ve(f, 1, "rule svelte-aof9c2", null, S, { exclude: s(g).decision === "exclude" }), N(k, s(d)), N(H, s(g).predicate), N(P, s(g).decision), N(U, `${se ?? ""} paths`), N(Y, ne), Z.disabled = i() || s(d) === 0, K.disabled = i() || s(d) === n().length - 1, te.disabled = i();
      },
      [
        () => _e(s(g).paths),
        () => qe(s(g).bytes)
      ]
    ), ie("click", Z, () => t.onmove(s(g), s(d) - 1)), ie("click", K, () => t.onmove(s(g), s(d) + 1)), ie("click", te, () => t.ondelete(s(g))), D(b, f);
  });
  var v = E(m, 2);
  {
    var _ = (b) => {
      var g = ja(), d = E(w(g), 2), f = w(d), S = w(f), C = E(f, 2), y = w(C);
      j(
        (k, O) => {
          N(S, `${k ?? ""} paths`), N(y, O);
        },
        [
          () => _e(r().paths),
          () => qe(r().bytes)
        ]
      ), D(b, g);
    };
    J(v, (b) => {
      r() && b(_);
    });
  }
  j(() => N(o, `${n().length ?? ""} rules · top-down, first match wins`)), D(e, a), st();
}
Tt(["click"]);
const bn = 4, Mn = 220, Ga = 340;
function bi(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Ya(e, t, n, r, i) {
  let a = t;
  for (; a < e.length; ) {
    let l = a, u = 0, o = 1 / 0;
    for (; l < e.length && (u += bi(e[l]), l++, o = (n - bn * (l - a - 1)) / u, !(o <= Mn)); )
      ;
    if (o > Mn && !r) break;
    i(a, l, Math.round(Math.min(o, Ga))), a = l;
  }
  return a;
}
function Ar(e, t, n) {
  if (!e.length) return null;
  let r = 0, i = e.length - 1;
  for (; r < i; ) {
    const l = r + i >> 1;
    e[l].top + e[l].height < t ? r = l + 1 : i = l;
  }
  const a = r;
  for (i = e.length - 1; r < i; ) {
    const l = r + i + 1 >> 1;
    e[l].top <= n ? r = l : i = l - 1;
  }
  return [a, Math.max(a, r)];
}
const Mr = 2500, Xa = 1, Wa = 2, Ka = 3e7;
function Ja(e, t, n) {
  const r = [], i = [], a = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, c = 0, h = null, m = null, v = !1, _ = !1, b = 0, g = 0, d = 0, f = n.onState || (() => {
  });
  function S(x) {
    b <= 0 || (o = Ya(r, o, b, x, (p, A, z) => {
      i.push({ top: c, height: z, from: p, to: A }), c += z + bn;
    }), y());
  }
  function C() {
    if (m === null || v || b <= 0 || o >= m) return 0;
    const x = i.length ? o / i.length : Math.max(1, b / Mn), p = i.length ? c / i.length : Mn + bn, A = Math.round((m - o) / x * p);
    return Math.max(0, Math.min(A, Ka - c));
  }
  function y() {
    e.style.height = c + C() + "px", t.style.top = Math.max(0, c - 1) + "px";
  }
  function k() {
    return window.scrollY - e.offsetTop;
  }
  function O() {
    const x = l.pop();
    if (x) return x;
    const p = document.createElement("div");
    p.className = "tile";
    const A = document.createElement("img");
    return A.decoding = "async", A.addEventListener("load", () => p.classList.add("loaded")), A.addEventListener("error", () => p.classList.add("missing")), p.appendChild(A), n.extend && n.extend(p), p;
  }
  function H(x, p) {
    p.firstChild.removeAttribute("src"), p.classList.remove("loaded", "missing", "error"), p.style.backgroundImage = "", p.remove(), a.delete(x), l.push(p);
  }
  function B(x, p, A, z, ae, le) {
    let re = a.get(x);
    const Ge = r[x];
    if (!re) {
      re = O(), re.dataset.index = String(x);
      const Ze = re.firstChild;
      Ze.fetchPriority = le ? "high" : "low", Ze.src = "/t/" + Ge.s + ".webp", u.push(x), n.fill && n.fill(re, Ge), e.appendChild(re), a.set(x, re);
    }
    re.style.width = z + "px", re.style.height = ae + "px", re.style.transform = "translate(" + p + "px," + A + "px)";
  }
  function P(x, p) {
    p.th && (p.url === void 0 && (p.url = n.thumbHash(p.th)), p.url && (x.style.backgroundImage = "url(" + p.url + ")"));
  }
  function R() {
    d = 0;
    for (const x of u) {
      const p = a.get(x);
      p && !p.classList.contains("loaded") && P(p, r[x]);
    }
    u.length = 0;
  }
  function F(x, p) {
    let A = 0;
    for (let z = x.from; z < x.to; z++) {
      const le = z === x.to - 1 ? b - A : Math.round(bi(r[z]) * x.height);
      B(z, A, x.top, le, x.height, p), A += le + bn;
    }
  }
  function U() {
    const x = window.innerHeight, p = k(), A = Ar(i, p - x * Xa, p + x * (1 + Wa));
    if (!A) return;
    const z = i[A[0]].from, ae = i[A[1]].to;
    for (const [le, re] of Array.from(a))
      (le < z || le >= ae) && H(le, re);
    for (let le = A[0]; le <= A[1]; le++) {
      const re = i[le];
      F(re, re.top < p + x && re.top + re.height > p);
    }
    u.length && !d && (d = requestAnimationFrame(R));
  }
  function q() {
    return b <= 0 ? !1 : c - (k() + window.innerHeight) < Mr;
  }
  async function Y() {
    if (_ || v) return;
    _ = !0;
    const x = g;
    f({ loading: !0, count: r.length, exhausted: v, total: m });
    try {
      do {
        const p = await n.fetchPage(h);
        if (x !== g) return;
        for (const A of p.photos) r.push(A);
        h = p.next, v = h === null, typeof p.total == "number" && (m = p.total), S(v), U(), f({ loading: !0, count: r.length, exhausted: v, total: m });
      } while (!v && q());
    } catch (p) {
      x === g && f({ error: String(p) });
    } finally {
      x === g && (_ = !1, f({ loading: !1, count: r.length, exhausted: v, total: m }));
    }
  }
  let Z = 0;
  function K() {
    Z || (Z = requestAnimationFrame(() => {
      Z = 0, U(), q() && Y();
    }));
  }
  function te() {
    const x = e.clientWidth;
    if (x === b) return;
    const p = Ar(i, k(), k()), A = p ? i[p[0]].from : 0;
    b = x;
    for (const [ae, le] of Array.from(a)) H(ae, le);
    i.length = 0, o = 0, c = 0, S(v), U();
    const z = i.find((ae) => ae.to > A);
    z && window.scrollTo(0, z.top + e.offsetTop), q() && Y();
  }
  function se(x) {
    const p = x.target.closest(".tile");
    if (!p || !e.contains(p)) return;
    const A = r[Number(p.dataset.index)];
    A && n.activate && n.activate(A, x, p);
  }
  e.addEventListener("click", se), window.addEventListener("scroll", K, { passive: !0 });
  let ne = 0;
  const me = new ResizeObserver(() => {
    clearTimeout(ne), ne = setTimeout(te, 100);
  });
  me.observe(e);
  const I = new IntersectionObserver(
    (x) => {
      x.some((p) => p.isIntersecting) && Y();
    },
    { rootMargin: "0px 0px " + Mr + "px 0px" }
  );
  return I.observe(t), b = e.clientWidth, Y(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      g++, _ = !1;
      for (const [x, p] of Array.from(a)) H(x, p);
      r.length = 0, i.length = 0, u.length = 0, o = 0, c = 0, h = null, m = null, v = !1, e.style.height = "0px", window.scrollTo(0, 0), Y();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(x) {
      const p = typeof x == "number" ? x : null;
      p !== m && (m = p, y(), f({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [x, p] of a) n.fill(p, r[x]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(x) {
      for (const [p, A] of a)
        r[p] === x && n.fill && n.fill(A, x);
    },
    destroy() {
      g++, e.removeEventListener("click", se), window.removeEventListener("scroll", K), me.disconnect(), I.disconnect(), clearTimeout(ne), cancelAnimationFrame(d);
    }
  };
}
function Za(e) {
  try {
    const t = Uint8Array.from(atob(e), (U) => U.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, i = (n & 63) / 63, a = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, c = (r >> 3 & 63) / 63, h = (r >> 9 & 63) / 63, m = r >> 15, v = Math.max(3, m ? o ? 5 : 7 : r & 7), _ = Math.max(3, m ? r & 7 : o ? 5 : 7);
    let b = o ? 6 : 5, g = 0;
    const d = (U, q, Y) => {
      const Z = [];
      for (let K = 0; K < q; K++)
        for (let te = K ? 0 : 1; te * q < U * (q - K); te++) {
          const se = t[b + (g >> 1)] >> ((g++ & 1) << 2) & 15;
          Z.push((se / 7.5 - 1) * Y);
        }
      return Z;
    }, f = d(v, _, u), S = d(3, 3, c * 1.25), C = d(3, 3, h * 1.25), y = v / _, k = Math.max(1, Math.round(y > 1 ? 32 : 32 * y)), O = Math.max(1, Math.round(y > 1 ? 32 / y : 32)), H = document.createElement("canvas");
    H.width = k, H.height = O;
    const B = H.getContext("2d"), P = B.createImageData(k, O), R = [], F = [];
    for (let U = 0, q = 0; U < O; U++)
      for (let Y = 0; Y < k; Y++, q += 4) {
        let Z = i, K = a, te = l;
        for (let I = 0; I < v; I++) R[I] = Math.cos(Math.PI / k * (Y + 0.5) * I);
        for (let I = 0; I < _; I++) F[I] = Math.cos(Math.PI / O * (U + 0.5) * I);
        for (let I = 0, x = 0; I < _; I++)
          for (let p = I ? 0 : 1; p * _ < v * (_ - I); p++, x++)
            Z += f[x] * R[p] * F[I] * 2;
        for (let I = 0, x = 0; I < 3; I++)
          for (let p = I ? 0 : 1; p < 3 - I; p++, x++) {
            const A = R[p] * F[I] * 2;
            K += S[x] * A, te += C[x] * A;
          }
        const se = Z - 2 / 3 * K, ne = (3 * Z - se + te) / 2, me = ne - te;
        P.data[q] = Math.max(0, Math.min(255, Math.round(255 * ne))), P.data[q + 1] = Math.max(0, Math.min(255, Math.round(255 * me))), P.data[q + 2] = Math.max(0, Math.min(255, Math.round(255 * se))), P.data[q + 3] = 255;
      }
    return B.putImageData(P, 0, 0), H.toDataURL();
  } catch {
    return null;
  }
}
var Qa = /* @__PURE__ */ L('<main id="canvas"><div id="sentinel"></div></main>');
function $a(e, t) {
  it(t, !0);
  let n = ee(t, "key", 3, ""), r = ee(t, "total", 3, null), i = ee(t, "triage", 3, !1), a = ee(t, "excludedDirs", 19, () => []), l = ee(t, "onActivate", 3, () => {
  }), u = ee(t, "onOverride", 3, async () => null), o = ee(t, "onExcludeFolder", 3, () => {
  }), c = ee(t, "onState", 3, () => {
  }), h = /* @__PURE__ */ X(null), m = /* @__PURE__ */ X(null), v = null, _ = "";
  const b = { null: "exclude", exclude: "include", include: "clear" };
  function g(k) {
    const O = k.toLowerCase().startsWith(Xt.toLowerCase()) ? k.slice(Xt.length + 1) : k;
    return O.length > 64 ? "…" + O.slice(-64) : O;
  }
  function d(k) {
    const O = document.createElement("div");
    O.className = "tile-path", k.appendChild(O);
    const H = document.createElement("button");
    H.className = "chip", H.type = "button", k.appendChild(H);
    const B = document.createElement("button");
    B.className = "dirchip", B.type = "button", B.textContent = "dir", k.appendChild(B);
  }
  function f(k, O) {
    const H = k.querySelector(".tile-path");
    H && (H.textContent = O.p ? g(O.p) : "");
    const B = k.querySelector(".dirchip");
    if (B) {
      const R = gi(O.p ?? ""), F = R !== "" && rr(a(), R);
      B.hidden = R === "", B.disabled = F, B.dataset.state = F ? "exclude" : "none", B.title = F ? `already excluded: ${R}` : `exclude everything under ${R}, subfolders included — one exclude rule at the end of the order`;
    }
    const P = k.querySelector(".chip");
    P && (P.dataset.state = O.o || "none", P.textContent = O.o === "exclude" ? "drop" : O.o === "include" ? "keep" : "·", P.title = O.o === "exclude" ? "overridden: excluded — click to keep" : O.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  _i(() => (v = Ja(s(h), s(m), {
    fetchPage: (k) => t.fetchPage(k),
    thumbHash: Za,
    extend: i() ? d : void 0,
    fill: i() ? f : void 0,
    onState: (k) => c()(k),
    activate: async (k, O, H) => {
      if (O.target.closest(".dirchip")) {
        o()(k);
        return;
      }
      if (!O.target.closest(".chip")) {
        l()(k);
        return;
      }
      const B = b[k.o ?? "null"];
      k.o = await u()(k, B), f(H, k);
    }
  }), _ = n(), () => v?.destroy())), Ut(() => {
    const k = n(), O = r();
    v && (k !== _ && (_ = k, v.reset()), v.setTotal(O));
  });
  let S = "";
  Ut(() => {
    const k = a().join(`
`);
    !v || k === S || (S = k, v.refill());
  });
  var C = Qa(), y = w(C);
  xr(y, (k) => M(m, k), () => s(m)), xr(C, (k) => M(h, k), () => s(h)), D(e, C), st();
}
var el = /* @__PURE__ */ L('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), tl = /* @__PURE__ */ L('<th class="num svelte-1v3p82v"> </th>'), nl = /* @__PURE__ */ L('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), rl = /* @__PURE__ */ L('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), il = /* @__PURE__ */ L('<td class="num svelte-1v3p82v"> </td>'), sl = /* @__PURE__ */ L('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), al = /* @__PURE__ */ L('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function ll(e, t) {
  it(t, !0);
  let n = ee(t, "rows", 19, () => []), r = ee(t, "rules", 19, () => []), i = ee(t, "root", 3, null), a = ee(t, "selected", 3, null), l = ee(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ ce(() => t.screen.rule !== !1);
  function o(g) {
    return t.screen.label ? t.screen.label(g) : g.key;
  }
  const c = /* @__PURE__ */ ce(() => new Map(n().map((g) => [
    g.key,
    t.screen.rule === !1 ? null : mi(r(), t.screen.toRule(g, i()))
  ]))), h = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var v = hi(), _ = He(v);
  {
    var b = (g) => {
      var d = al(), f = w(d), S = w(f), C = w(S);
      {
        var y = (R) => {
          var F = el();
          D(R, F);
        };
        J(C, (R) => {
          s(u) && R(y);
        });
      }
      var k = E(C), O = w(k), H = E(k, 3);
      {
        var B = (R) => {
          var F = tl(), U = w(F);
          j(() => N(U, t.screen.heading[1])), D(R, F);
        };
        J(H, (R) => {
          t.screen.heading[1] && R(B);
        });
      }
      var P = E(f);
      Yt(P, 23, n, (R) => R.key, (R, F, U) => {
        const q = /* @__PURE__ */ ce(() => s(c).get(s(F).key));
        var Y = sl();
        let Z;
        var K = w(Y);
        {
          var te = (be) => {
            const ke = /* @__PURE__ */ ce(() => l().has(s(F).key));
            var Pe = nl(), Ye = w(Pe);
            let _t;
            var At = w(Ye);
            j(
              (Xe) => {
                _t = Ve(Ye, 1, "tick svelte-1v3p82v", null, _t, { on: s(ke) }), ft(Ye, "aria-checked", s(ke)), ft(Ye, "aria-label", `select ${Xe ?? ""}`), N(At, s(ke) ? "✓" : "");
              },
              [() => o(s(F))]
            ), ie("click", Ye, (Xe) => {
              Xe.stopPropagation(), t.oncheck(s(F), s(U), Xe.shiftKey);
            }), D(be, Pe);
          };
          J(K, (be) => {
            s(u) && be(te);
          });
        }
        var se = E(K), ne = w(se);
        let me;
        var I = w(ne), x = E(ne), p = E(x);
        {
          var A = (be) => {
            var ke = rl();
            D(be, ke);
          };
          J(p, (be) => {
            s(F).scope === "whole inventory" && be(A);
          });
        }
        var z = E(se), ae = w(z), le = E(z), re = w(le), Ge = E(le);
        {
          var Ze = (be) => {
            var ke = il(), Pe = w(ke);
            j(() => N(Pe, s(F).detail ?? "")), D(be, ke);
          };
          J(Ge, (be) => {
            t.screen.heading[1] && be(Ze);
          });
        }
        j(
          (be, ke, Pe) => {
            Z = Ve(Y, 1, "svelte-1v3p82v", null, Z, {
              picked: a() === s(F).key,
              clickable: t.screen.sheet !== !1
            }), me = Ve(ne, 1, "mark svelte-1v3p82v", null, me, {
              exclude: s(q) === "exclude",
              include: s(q) === "include"
            }), ft(ne, "title", m[s(q)] ?? ""), N(I, h[s(q)] ?? ""), N(x, `${be ?? ""} `), N(ae, ke), N(re, Pe);
          },
          [
            () => o(s(F)),
            () => _e(s(F).paths),
            () => qe(s(F).bytes)
          ]
        ), ie("click", Y, () => t.onpick(s(F))), D(R, Y);
      }), j(() => N(O, t.screen.heading[0] ?? "")), D(g, d);
    };
    J(_, (g) => {
      n().length && g(b);
    });
  }
  D(e, v), st();
}
Tt(["click"]);
var ol = /* @__PURE__ */ L('<button class="twisty svelte-pucy57"> </button>'), ul = /* @__PURE__ */ L('<span class="twisty leaf svelte-pucy57">·</span>'), cl = /* @__PURE__ */ L('<span class="name root svelte-pucy57"> </span>'), fl = /* @__PURE__ */ L('<button class="name svelte-pucy57"> </button>'), dl = /* @__PURE__ */ L('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), vl = /* @__PURE__ */ L('<div class="note svelte-pucy57"> </div>'), hl = /* @__PURE__ */ L('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), pl = /* @__PURE__ */ L('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), _l = /* @__PURE__ */ L('<div class="tree svelte-pucy57"></div>');
function gl(e, t) {
  it(t, !0);
  let n = ee(t, "version", 3, 0), r = ee(t, "excludedDirs", 19, () => []), i = ee(t, "selected", 3, null), a = ee(t, "busy", 3, !1), l = /* @__PURE__ */ X(Ae(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ X(Ae(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ X(Ae(/* @__PURE__ */ new Set())), c = /* @__PURE__ */ X(Ae(/* @__PURE__ */ new Set()));
  async function h(d) {
    M(o, new Set(s(o)).add(d), !0);
    const f = await t.onload(d), S = new Map(s(l)), C = new Set(s(c));
    f ? (S.set(d, f), C.delete(d)) : C.add(d), M(l, S, !0), M(c, C, !0), M(o, new Set([...s(o)].filter((y) => y !== d)), !0);
  }
  function m(d) {
    if (s(u).has(d)) {
      M(u, new Set([...s(u)].filter((f) => f !== d)), !0);
      return;
    }
    M(u, new Set(s(u)).add(d), !0), s(l).has(d) || h(d);
  }
  let v = -1;
  Ut(() => {
    const d = n();
    if (d !== v) {
      v = d, s(u).has(t.root) || M(u, new Set(s(u)).add(t.root), !0);
      for (const f of s(u)) h(f);
    }
  });
  const _ = /* @__PURE__ */ ce(() => {
    const d = [], f = (k, O, H, B, P, R) => {
      const F = s(l).get(k), U = s(u).has(k);
      if (d.push({
        key: k,
        name: O,
        depth: H,
        paths: B,
        bytes: P,
        deeper: R,
        expanded: U,
        here: F?.here ?? null,
        truncated: !!F?.truncated,
        loading: s(o).has(k),
        failed: s(c).has(k),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: rr(r(), k)
      }), !(!U || !F))
        for (const q of F.children)
          f(q.path, q.name, H + 1, q.paths, q.bytes, q.deeper);
    }, S = s(l).get(t.root), C = S ? S.children.reduce((k, O) => k + O.paths, 0) + S.here.paths : 0, y = S ? S.children.reduce((k, O) => k + O.bytes, 0) + S.here.bytes : 0;
    return f(t.root, t.root, 0, C, y, !0), d;
  }), b = 8;
  var g = _l();
  Yt(g, 21, () => s(_), (d) => d.key, (d, f) => {
    var S = pl(), C = He(S);
    let y;
    var k = w(C);
    let O;
    var H = E(k, 2);
    {
      var B = (p) => {
        var A = ol(), z = w(A);
        j(() => {
          ft(A, "aria-expanded", s(f).expanded), ft(A, "aria-label", `${s(f).expanded ? "collapse" : "expand"} ${s(f).name ?? ""}`), ft(A, "title", s(f).expanded ? "collapse" : "expand"), N(z, s(f).loading ? "·" : s(f).expanded ? "▾" : "▸");
        }), ie("click", A, () => m(s(f).key)), D(p, A);
      }, P = (p) => {
        var A = ul();
        D(p, A);
      };
      J(H, (p) => {
        s(f).deeper ? p(B) : p(P, -1);
      });
    }
    var R = E(H, 2);
    {
      var F = (p) => {
        var A = cl(), z = w(A);
        j(() => N(z, s(f).key)), D(p, A);
      }, U = (p) => {
        var A = fl(), z = w(A);
        j(() => {
          ft(A, "title", `Show every kept file under ${s(f).key ?? ""}`), N(z, s(f).name);
        }), ie("click", A, () => t.onpick(s(f))), D(p, A);
      };
      J(R, (p) => {
        s(f).depth === 0 ? p(F) : p(U, -1);
      });
    }
    var q = E(R, 2), Y = w(q), Z = E(q, 2), K = w(Z), te = E(Z, 2), se = E(C, 2);
    {
      var ne = (p) => {
        var A = dl();
        let z;
        j((ae) => z = pn(A, "", z, ae), [
          () => ({
            "padding-left": `${Math.min(s(f).depth, b) * 11 + 18}px`
          })
        ]), D(p, A);
      }, me = (p) => {
        var A = vl();
        let z;
        var ae = w(A);
        j(
          (le, re, Ge) => {
            z = pn(A, "", z, le), N(ae, `${re ?? ""} directly here · ${Ge ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(s(f).depth, b) * 11 + 18}px`
            }),
            () => _e(s(f).here.paths),
            () => qe(s(f).here.bytes)
          ]
        ), D(p, A);
      };
      J(se, (p) => {
        s(f).expanded && s(f).failed ? p(ne) : s(f).expanded && s(f).here && s(f).here.paths > 0 && p(me, 1);
      });
    }
    var I = E(se, 2);
    {
      var x = (p) => {
        var A = hl();
        let z;
        j((ae) => z = pn(A, "", z, ae), [
          () => ({
            "padding-left": `${Math.min(s(f).depth, b) * 11 + 18}px`
          })
        ]), D(p, A);
      };
      J(I, (p) => {
        s(f).truncated && p(x);
      });
    }
    j(
      (p, A, z) => {
        y = Ve(C, 1, "row svelte-pucy57", null, y, {
          picked: i() === s(f).key,
          gone: s(f).excluded
        }), O = pn(k, "", O, p), N(Y, A), N(K, z), te.disabled = a() || s(f).excluded || s(f).depth === 0, ft(te, "title", s(f).depth === 0 ? "The library root is not excludable from here." : s(f).excluded ? "already excluded" : `Exclude everything under ${s(f).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(s(f).depth, b) * 11}px` }),
        () => _e(s(f).paths),
        () => qe(s(f).bytes)
      ]
    ), ie("click", te, () => t.onexclude(s(f))), D(d, S);
  }), D(e, g), st();
}
Tt(["click"]);
var ml = /* @__PURE__ */ L('<button><span class="n svelte-1n46o8q"> </span> </button>'), bl = /* @__PURE__ */ L('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), yl = /* @__PURE__ */ L('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), wl = /* @__PURE__ */ L('<div class="muted pad svelte-1n46o8q">loading…</div>'), xl = /* @__PURE__ */ L('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), kl = /* @__PURE__ */ L('<nav class="svelte-1n46o8q"></nav> <!> <!> <!>', 1), El = /* @__PURE__ */ L('<p class="muted pad svelte-1n46o8q">The read-only grid: every photo, newest first, click to reveal in Explorer.</p>'), Sl = /* @__PURE__ */ L('<p class="blurb"> </p>'), Tl = /* @__PURE__ */ L('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), Al = /* @__PURE__ */ L('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), Ml = /* @__PURE__ */ L('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), Rl = /* @__PURE__ */ L('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), Cl = /* @__PURE__ */ L('<div class="status"> </div>'), Nl = /* @__PURE__ */ L('<div class="shell"><aside class="side"><div class="modes svelte-1n46o8q"><button>triage</button> <button>grid</button></div> <!></aside> <div class="main"><!> <!></div></div> <!>', 1);
function Ol(e, t) {
  it(t, !0);
  let n = /* @__PURE__ */ X("triage"), r = /* @__PURE__ */ X(0), i = /* @__PURE__ */ X(
    null
    // screen 6's drill-down
  ), a = /* @__PURE__ */ X(Ae([])), l = /* @__PURE__ */ X(null), u = /* @__PURE__ */ X(null), o = /* @__PURE__ */ X(Ae(/* @__PURE__ */ new Set())), c = /* @__PURE__ */ X(null), h = /* @__PURE__ */ X(null), m = /* @__PURE__ */ X(null), v = /* @__PURE__ */ X(null), _ = /* @__PURE__ */ X(!1), b = /* @__PURE__ */ X(!1), g = /* @__PURE__ */ X(!1), d = /* @__PURE__ */ X(!1), f = /* @__PURE__ */ X(Ae({ loading: !1, count: 0, exhausted: !1, total: null })), S = /* @__PURE__ */ X(null), C = /* @__PURE__ */ X(0);
  const y = /* @__PURE__ */ ce(() => Sr[s(r)]), k = /* @__PURE__ */ ce(() => s(y).table !== !1), O = /* @__PURE__ */ ce(() => s(k) || s(y).tree === !0), H = /* @__PURE__ */ ce(() => s(y).sheet !== !1 && (s(u) !== null || !s(O))), B = /* @__PURE__ */ ce(() => `${s(n)}:${s(r)}:${JSON.stringify(s(u))}`), P = /* @__PURE__ */ ce(() => s(y).rule === !1 || s(o).size === 0 ? [] : s(a).filter((T) => s(o).has(T.key)).map((T) => s(y).toRule(T, s(i))).filter((T) => T && mi(s(h)?.rules ?? [], T) !== "exclude")), R = /* @__PURE__ */ ce(() => (s(h)?.rules ?? []).filter((T) => T.decision === "exclude" && T.term?.column === "dir_under").map((T) => String(T.term.value).replace(/[\\/]+$/, "").toLowerCase())), F = _a();
  function U(T) {
    M(S, String(T), !0);
  }
  async function q(T) {
    try {
      return M(S, null), await T();
    } catch (V) {
      return U(V), null;
    }
  }
  const Y = ga(
    () => {
      M(b, !0), q(async () => {
        const T = s(u)?.at === "end" || s(u)?.at === void 0 ? void 0 : 0, { stale: V, value: fe } = await F(() => we.counts(s(u), T));
        V || M(h, fe, !0);
      }).finally(() => {
        M(b, !1);
      });
    },
    220
  );
  async function Z() {
    M(m, "loading");
    const T = await q(() => we.files());
    M(m, T, !0), M(_, !1), M(v, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function K(T = !1) {
    if (!s(k)) {
      M(a, [], !0);
      return;
    }
    M(d, !0);
    const V = s(y).name === "source_folder" && s(i) ? { root: s(i) } : {};
    T && (V.live = "1");
    const fe = await q(() => we.screen(s(y).name, V));
    M(a, fe?.rows ?? [], !0), M(d, !1);
  }
  Ut(() => {
    s(r), Gt(() => {
      M(l, null), M(u, null), M(i, null), ne(), K(), Y.now();
    });
  }), Ut(() => {
    s(i), Gt(() => {
      ne(), K();
    });
  }), _i(Z);
  function te(T) {
    if (s(y).sheet !== !1) {
      if (s(y).drill && !s(i)) {
        M(l, T.key, !0), M(
          u,
          {
            ...s(y).toRule(T, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), M(i, T.key, !0);
        return;
      }
      M(l, T.key, !0), M(
        u,
        {
          ...s(y).toRule(T, s(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), Y();
    }
  }
  function se(T, V, fe) {
    const De = new Set(s(o)), Mt = !De.has(T.key), Qe = fe && s(c) !== null ? s(a).findIndex((ue) => ue.key === s(c)) : -1, [Rt, Jt] = Qe < 0 ? [V, V] : Qe < V ? [Qe, V] : [V, Qe];
    for (let ue = Rt; ue <= Jt; ue++)
      Mt ? De.add(s(a)[ue].key) : De.delete(s(a)[ue].key);
    M(o, De, !0), M(c, T.key, !0);
  }
  function ne() {
    M(o, /* @__PURE__ */ new Set(), !0), M(c, null);
  }
  function me(T) {
    M(u, T, !0), M(
      l,
      null
      // it no longer corresponds to a row
    ), Y();
  }
  function I(T = !1) {
    M(u, null), M(l, null), T && M(i, null), Y.now();
  }
  async function x() {
    M(
      _,
      !0
      // the distinct-content number now says so on its face
    ), Ds(C), await K(), Y.now();
  }
  async function p() {
    if (!s(u)) return;
    M(g, !0);
    const T = s(u).at === "end" ? void 0 : 0, V = await q(() => we.addRule(
      {
        column: s(u).column,
        op: s(u).op,
        value: s(u).value,
        decision: s(u).decision ?? "exclude",
        note: `screen ${s(y).id} ${s(y).title}`
      },
      T
    ));
    M(g, !1), V && (M(u, null), M(l, null), await x());
  }
  async function A() {
    const T = s(P);
    if (!T.length) {
      ne();
      return;
    }
    M(g, !0);
    for (const V of T)
      if (!await q(() => we.addRule({
        column: V.column,
        op: V.op,
        value: V.value,
        decision: "exclude",
        note: `screen ${s(y).id} ${s(y).title}`
      }))) break;
    M(g, !1), ne(), M(u, null), M(l, null), await x();
  }
  async function z(T) {
    if (!T || rr(s(R), T)) return;
    M(g, !0);
    const V = await q(() => we.addRule({
      column: "dir_under",
      op: "=",
      value: T,
      decision: "exclude",
      note: `screen ${s(y).id} ${s(y).title}`
    }));
    M(g, !1), V && await x();
  }
  const ae = (T) => z(gi(T.p ?? "")), le = (T) => z(T.key);
  async function re(T) {
    M(g, !0), await q(() => we.deleteRule(T.id)), M(g, !1), await x();
  }
  async function Ge(T, V) {
    M(g, !0), await q(() => we.moveRule(T.id, V)), M(g, !1), await x();
  }
  async function Ze(T, V) {
    const fe = await q(() => we.override(T.s, V));
    return fe ? (M(_, !0), Y(), fe.decision) : T.o ?? null;
  }
  function be(T) {
    return s(n) === "grid" ? we.photos({ kind: "image", limit: 500, ...T || {} }) : we.page(s(u), T);
  }
  function ke(T) {
    q(() => s(n) === "grid" ? we.revealPhoto(T.id) : we.revealOrigin(T.id));
  }
  var Pe = Nl(), Ye = He(Pe), _t = w(Ye), At = w(_t), Xe = w(At);
  let dn;
  var ir = E(Xe, 2);
  let sr;
  var yi = E(At, 2);
  {
    var wi = (T) => {
      var V = kl(), fe = He(V);
      Yt(fe, 21, () => Sr, Yn, (ue, Le, lt) => {
        var $e = ml();
        let Ct;
        var gt = w($e), Nt = w(gt), Zt = E(gt, 1, !0);
        j(() => {
          Ct = Ve($e, 1, "nav svelte-1n46o8q", null, Ct, { on: lt === s(r) }), N(Nt, s(Le).id), N(Zt, s(Le).title);
        }), ie("click", $e, () => M(r, lt, !0)), D(ue, $e);
      });
      var De = E(fe, 2);
      {
        var Mt = (ue) => {
          var Le = xl(), lt = He(Le), $e = w(lt);
          {
            var Ct = (Q) => {
              var de = bl(), Fe = He(de), Qt = /* @__PURE__ */ ce(() => I.bind(null, !0)), ot = E(Fe, 2), In = w(ot);
              j(() => N(In, `inside ${s(i) ?? ""}`)), ie("click", Fe, function(...$t) {
                s(Qt)?.apply(this, $t);
              }), D(Q, de);
            }, gt = (Q) => {
              var de = yl(), Fe = w(de);
              j(() => N(Fe, s(y).relive)), ie("click", de, () => K(!0)), D(Q, de);
            };
            J($e, (Q) => {
              s(y).drill && s(i) ? Q(Ct) : s(y).relive && Q(gt, 1);
            });
          }
          var Nt = E(lt, 2);
          {
            var Zt = (Q) => {
              var de = wl();
              D(Q, de);
            };
            J(Nt, (Q) => {
              s(d) && Q(Zt);
            });
          }
          var On = E(Nt, 2);
          {
            let Q = /* @__PURE__ */ ce(() => s(h)?.rules ?? []);
            ll(On, {
              get rows() {
                return s(a);
              },
              get screen() {
                return s(y);
              },
              get root() {
                return s(i);
              },
              get checked() {
                return s(o);
              },
              get rules() {
                return s(Q);
              },
              get selected() {
                return s(l);
              },
              onpick: te,
              oncheck: se
            });
          }
          D(ue, Le);
        };
        J(De, (ue) => {
          s(k) && ue(Mt);
        });
      }
      var Qe = E(De, 2);
      {
        var Rt = (ue) => {
          gl(ue, {
            get root() {
              return Xt;
            },
            get version() {
              return s(C);
            },
            get excludedDirs() {
              return s(R);
            },
            get selected() {
              return s(l);
            },
            get busy() {
              return s(g);
            },
            onload: (Le) => q(() => we.tree(Le)),
            onpick: te,
            onexclude: le
          });
        };
        J(Qe, (ue) => {
          s(y).tree && ue(Rt);
        });
      }
      var Jt = E(Qe, 2);
      {
        let ue = /* @__PURE__ */ ce(() => s(h)?.rules ?? []), Le = /* @__PURE__ */ ce(() => s(h)?.unmatched ?? null);
        Va(Jt, {
          get rules() {
            return s(ue);
          },
          get unmatched() {
            return s(Le);
          },
          get busy() {
            return s(g);
          },
          ondelete: re,
          onmove: Ge
        });
      }
      D(T, V);
    }, xi = (T) => {
      var V = El();
      D(T, V);
    };
    J(yi, (T) => {
      s(n) === "triage" ? T(wi) : T(xi, -1);
    });
  }
  var ki = E(_t, 2), ar = w(ki);
  {
    var Ei = (T) => {
      var V = Rl(), fe = He(V), De = w(fe), Mt = E(fe, 2), Qe = w(Mt), Rt = E(Mt, 2);
      {
        var Jt = (Q) => {
          var de = Sl(), Fe = w(de);
          j(() => N(Fe, s(y).note)), D(Q, de);
        };
        J(Rt, (Q) => {
          s(y).note && Q(Jt);
        });
      }
      var ue = E(Rt, 2);
      {
        var Le = (Q) => {
          Ia(Q, {
            get screen() {
              return s(y);
            }
          });
        };
        J(ue, (Q) => {
          s(y).name === "dimensions" && Q(Le);
        });
      }
      var lt = E(ue, 2);
      Aa(lt, {
        get counts() {
          return s(h);
        },
        get files() {
          return s(m);
        },
        get filesAt() {
          return s(v);
        },
        get stale() {
          return s(_);
        },
        get candidate() {
          return s(u);
        },
        get busy() {
          return s(b);
        },
        onfiles: Z
      });
      var $e = E(lt, 2);
      {
        var Ct = (Q) => {
          var de = Tl(), Fe = w(de), Qt = w(Fe), ot = E(Fe, 2), In = w(ot), $t = E(ot, 2), Ri = E($t, 2), Ci = w(Ri);
          {
            var Ni = (ut) => {
              var Ot = _r("already excluded — nothing left to write");
              D(ut, Ot);
            }, Oi = (ut) => {
              var Ot = _r();
              j((Ii) => N(Ot, `one exclude rule each, at the end of the order${Ii ?? ""}`), [
                () => s(P).length < s(o).size ? ` · ${_e(s(o).size - s(P).length)} already excluded, skipped` : ""
              ]), D(ut, Ot);
            };
            J(Ci, (ut) => {
              s(P).length ? ut(Oi, -1) : ut(Ni);
            });
          }
          j(
            (ut, Ot) => {
              N(Qt, `${ut ?? ""} ticked`), ot.disabled = s(g) || !s(P).length, N(In, Ot), $t.disabled = s(g);
            },
            [
              () => _e(s(o).size),
              () => s(g) ? "saving…" : `Exclude ${_e(s(P).length)}`
            ]
          ), ie("click", ot, A), ie("click", $t, ne), D(Q, de);
        };
        J($e, (Q) => {
          s(o).size && Q(Ct);
        });
      }
      var gt = E($e, 2);
      Ha(gt, {
        get candidate() {
          return s(u);
        },
        get screen() {
          return s(y);
        },
        get saving() {
          return s(g);
        },
        onedit: me,
        onconfirm: p,
        onclear: I
      });
      var Nt = E(gt, 2);
      {
        var Zt = (Q) => {
          var de = Al(), Fe = w(de);
          j((Qt, ot) => N(Fe, `${Qt ?? ""}${ot ?? ""} loaded${s(f).exhausted ? " · all of them" : ""}${s(f).loading ? " · loading…" : ""} `), [
            () => _e(s(f).count),
            () => s(f).total ? " of " + _e(s(f).total) : ""
          ]), D(Q, de);
        }, On = (Q) => {
          var de = Ml();
          D(Q, de);
        };
        J(Nt, (Q) => {
          s(H) ? Q(Zt) : s(y).sheet === !1 && Q(On, 1);
        });
      }
      j(() => {
        N(De, `${s(y).id ?? ""} · ${s(y).title ?? ""}`), N(Qe, s(y).blurb);
      }), D(T, V);
    };
    J(ar, (T) => {
      s(n) === "triage" && T(Ei);
    });
  }
  var Si = E(ar, 2);
  {
    var Ti = (T) => {
      {
        let V = /* @__PURE__ */ ce(() => s(n) === "grid" ? null : s(h)?.page_paths ?? null), fe = /* @__PURE__ */ ce(() => s(n) === "triage");
        $a(T, {
          get key() {
            return s(B);
          },
          fetchPage: be,
          get total() {
            return s(V);
          },
          get triage() {
            return s(fe);
          },
          get excludedDirs() {
            return s(R);
          },
          onActivate: ke,
          onOverride: Ze,
          onExcludeFolder: ae,
          onState: (De) => M(f, { ...s(f), ...De }, !0)
        });
      }
    };
    J(Si, (T) => {
      (s(H) || s(n) === "grid") && T(Ti);
    });
  }
  var Ai = E(Ye, 2);
  {
    var Mi = (T) => {
      var V = Cl(), fe = w(V);
      j(() => N(fe, s(S))), D(T, V);
    };
    J(Ai, (T) => {
      s(S) && T(Mi);
    });
  }
  j(() => {
    dn = Ve(Xe, 1, "svelte-1n46o8q", null, dn, { on: s(n) === "triage" }), sr = Ve(ir, 1, "svelte-1n46o8q", null, sr, { on: s(n) === "grid" });
  }), ie("click", Xe, () => M(n, "triage")), ie("click", ir, () => M(n, "grid")), D(e, Pe), st();
}
Tt(["click"]);
ea(Ol, { target: document.getElementById("app") });
