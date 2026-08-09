var ea = Array.isArray, Cs = Array.prototype.indexOf, vr = Array.prototype.includes, Er = Array.from, Ns = Object.defineProperty, Fn = Object.getOwnPropertyDescriptor, Os = Object.getOwnPropertyDescriptors, Is = Object.prototype, Fs = Array.prototype, Fa = Object.getPrototypeOf, ha = Object.isExtensible;
const dr = () => {
};
function zs(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function za() {
  var e, t, n = new Promise((a, s) => {
    e = a, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
function Cr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const a of e)
    if (n.push(a), n.length === t) break;
  return n;
}
const We = 2, Dn = 4, Tr = 8, La = 1 << 24, It = 16, kt = 32, Zt = 64, qr = 128, xt = 512, He = 1024, qe = 2048, Lt = 4096, st = 8192, vt = 16384, $n = 32768, Br = 1 << 25, jn = 65536, pr = 1 << 17, Ls = 1 << 18, Gn = 1 << 19, Ds = 1 << 20, Bt = 1 << 25, yn = 65536, gr = 1 << 21, zn = 1 << 22, cn = 1 << 23, _n = Symbol("$state"), js = Symbol("legacy props"), Hs = Symbol(""), Da = Symbol("attributes"), Ur = Symbol("class"), $r = Symbol("style"), Gr = Symbol("text"), sr = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), qs = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Bs(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Us() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function $s(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Gs(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Ws() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ys(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Vs() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Xs(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Ks() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Js() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Zs() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Qs() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const ei = 1, ti = 2, ja = 4, ni = 8, ri = 16, ai = 1, si = 4, ii = 8, li = 16, oi = 1, ci = 2, je = Symbol("uninitialized"), ui = "http://www.w3.org/1999/xhtml";
function di() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function fi() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function hi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Ha(e) {
  return e === this.v;
}
function vi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function qa(e) {
  return !vi(e, this.v);
}
let Je = null;
function Hn(e) {
  Je = e;
}
function pt(e, t = !1, n) {
  Je = {
    p: Je,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      oe
    ),
    l: null
  };
}
function gt(e) {
  var t = (
    /** @type {ComponentContext} */
    Je
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var a of n)
      ss(a);
  }
  return t.i = !0, Je = t.p, /** @type {T} */
  {};
}
function Ba() {
  return !0;
}
let Nn = [];
function pi() {
  var e = Nn;
  Nn = [], zs(e);
}
function Kt(e) {
  if (Nn.length === 0) {
    var t = Nn;
    queueMicrotask(() => {
      t === Nn && pi();
    });
  }
  Nn.push(e);
}
function Ua(e) {
  var t = oe;
  if (t === null)
    return de.f |= cn, e;
  if ((t.f & $n) === 0 && (t.f & Dn) === 0)
    throw e;
  ln(e, t);
}
function ln(e, t) {
  if (!(t !== null && (t.f & vt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & qr) !== 0) {
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
const gi = -7169;
function Re(e, t) {
  e.f = e.f & gi | t;
}
function ta(e) {
  (e.f & xt) !== 0 || e.deps === null ? Re(e, He) : Re(e, Lt);
}
function $a(e) {
  if (e !== null)
    for (const t of e)
      (t.f & We) === 0 || (t.f & yn) === 0 || (t.f ^= yn, $a(
        /** @type {Derived} */
        t.deps
      ));
}
function Ga(e, t, n) {
  (e.f & qe) !== 0 ? t.add(e) : (e.f & Lt) !== 0 && n.add(e), $a(e.deps), Re(e, He);
}
let or = !1;
function _i(e) {
  var t = or;
  try {
    return or = !1, [e(), or];
  } finally {
    or = t;
  }
}
function bi(e, t, n, a = !0) {
  a && n();
  for (var s of t)
    e.addEventListener(s, n);
  Mr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function Wn(e) {
  var t = de, n = oe;
  St(null), Gt(null);
  try {
    return e();
  } finally {
    St(t), Gt(n);
  }
}
function mi(e) {
  let t = 0, n = xn(0), a;
  return () => {
    sa() && (r(n), ls(() => (t === 0 && (a = un(() => e(() => nr(n)))), t += 1, () => {
      Kt(() => {
        t -= 1, t === 0 && (a?.(), a = void 0, nr(n));
      });
    })));
  };
}
var wi = jn | Gn;
function yi(e, t, n, a) {
  new xi(e, t, n, a);
}
class xi {
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
  #b = mi(() => (this.#d = xn(this.#p), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, a, s) {
    this.#t = t, this.#e = n, this.#o = (i) => {
      var l = (
        /** @type {Effect} */
        oe
      );
      l.b = this, l.f |= qr, a(i);
    }, this.parent = /** @type {Effect} */
    oe.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#r = ia(() => {
      this.#h();
    }, wi);
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
    const n = this.#e.failed, { reset: a, invoke_onerror: s } = this.#m(t);
    Kt(s), n && (this.#l = wt(() => {
      n(
        this.#t,
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
        hi();
        return;
      }
      n = !0, a && Qs(), this.#l !== null && mn(this.#l, () => {
        this.#l = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: s, invoke_onerror: () => {
      try {
        a = !0, this.#e.onerror?.(t, s), a = !1;
      } catch (l) {
        ln(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = wt(() => t(this.#t)), Kt(() => {
      var n = this.#a = document.createDocumentFragment(), a = Jt();
      n.append(a), this.#s = this.#v(() => wt(() => this.#o(a))), this.#c === 0 && (this.#t.before(n), this.#a = null, mn(
        /** @type {Effect} */
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#w(
        /** @type {Batch} */
        ve
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#p = 0, this.#s = wt(() => {
        this.#o(this.#t);
      }), this.#c > 0) {
        var t = this.#a = document.createDocumentFragment();
        oa(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = wt(() => n(this.#t));
      } else
        this.#w(
          /** @type {Batch} */
          ve
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
    Ga(t, this.#f, this.#g);
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
    var n = oe, a = de, s = Je;
    Gt(this.#r), St(this.#r), Hn(this.#r.ctx);
    try {
      return dn.ensure(), t();
    } catch (i) {
      return Ua(i), null;
    } finally {
      Gt(n), St(a), Hn(s);
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
    this.#c += t, this.#c === 0 && (this.#w(n), this.#n && mn(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#u) && (this.#u = !0, Kt(() => {
      this.#u = !1, this.#d && qn(this.#d, this.#p);
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
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    ve?.is_fork ? (this.#s && ve.skip_effect(this.#s), this.#n && ve.skip_effect(this.#n), this.#l && ve.skip_effect(this.#l), ve.oncommit(() => {
      this.#S(t);
    })) : this.#S(t);
  }
  /**
   * @param {unknown} error
   */
  #S(t) {
    this.#s && (ut(this.#s), this.#s = null), this.#n && (ut(this.#n), this.#n = null), this.#l && (ut(this.#l), this.#l = null);
    let n = this.#e.failed;
    const a = (s) => {
      const { reset: i, invoke_onerror: l } = this.#m(s);
      l(), n && (this.#l = this.#v(() => {
        try {
          return wt(() => {
            var c = (
              /** @type {Effect} */
              oe
            );
            c.b = this, c.f |= qr, n(
              this.#t,
              () => s,
              () => i
            );
          });
        } catch (c) {
          return ln(
            c,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    Kt(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (i) {
        ln(i, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        a,
        /** @param {unknown} e */
        (i) => ln(i, this.#r && this.#r.parent)
      ) : a(s);
    });
  }
}
function ki(e, t, n, a) {
  const s = rr;
  var i = e.filter((h) => !h.settled), l = t.map(s);
  if (n.length === 0 && i.length === 0) {
    a(l);
    return;
  }
  var c = (
    /** @type {Effect} */
    oe
  ), o = Si(), u = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function p(h) {
    if ((c.f & vt) === 0) {
      o();
      try {
        a([...l, ...h]);
      } catch (m) {
        ln(m, c);
      }
      _r();
    }
  }
  var w = Wa();
  if (n.length === 0) {
    u.then(() => p([])).finally(w);
    return;
  }
  function g() {
    Promise.all(n.map((h) => /* @__PURE__ */ Ei(h))).then(p).catch((h) => ln(h, c)).finally(w);
  }
  u ? u.then(() => {
    o(), g(), _r();
  }) : g();
}
function Si() {
  var e = (
    /** @type {Effect} */
    oe
  ), t = de, n = Je, a = (
    /** @type {Batch} */
    ve
  );
  return function(i = !0) {
    Gt(e), St(t), Hn(n), i && (e.f & vt) === 0 && (a?.activate(), a?.apply());
  };
}
function _r(e = !0) {
  Gt(null), St(null), Hn(null), e && ve?.deactivate();
}
function Wa() {
  var e = (
    /** @type {Effect} */
    oe
  ), t = e.b, n = (
    /** @type {Batch} */
    ve
  ), a = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(a, e), () => {
    t?.update_pending_count(-1, n), n.decrement(a, e);
  };
}
// @__NO_SIDE_EFFECTS__
function rr(e) {
  var t = We | qe;
  return oe !== null && (oe.f |= Gn), {
    ctx: Je,
    deps: null,
    effects: null,
    equals: Ha,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      je
    ),
    wv: 0,
    parent: oe,
    ac: null
  };
}
const Jn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function Ei(e, t, n) {
  let a = (
    /** @type {Effect | null} */
    oe
  );
  a === null && Us();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = xn(
    /** @type {V} */
    je
  ), l = !de, c = /* @__PURE__ */ new Set();
  return Hi(() => {
    var o = (
      /** @type {Effect} */
      oe
    ), u = za();
    s = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, (h) => {
        h !== sr && u.reject(h);
      }).finally(_r);
    } catch (h) {
      u.reject(h), _r();
    }
    var p = (
      /** @type {Batch} */
      ve
    );
    if (l) {
      if ((o.f & $n) !== 0)
        var w = Wa();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        a.b?.is_rendered()
      )
        p.async_deriveds.get(o)?.reject(Jn);
      else
        for (const h of c.values())
          h.reject(Jn);
      c.add(u), p.async_deriveds.set(o, u);
    }
    const g = (h, m = void 0) => {
      w?.(), c.delete(u), m !== Jn && (p.activate(), m ? (i.f |= cn, qn(i, m)) : ((i.f & cn) !== 0 && (i.f ^= cn), qn(i, h)), p.deactivate());
    };
    u.promise.then(g, (h) => g(null, h || "unknown"));
  }), Mr(() => {
    for (const o of c)
      o.reject(Jn);
  }), new Promise((o) => {
    function u(p) {
      function w() {
        p === s ? o(i) : u(s);
      }
      p.then(w, w);
    }
    u(s);
  });
}
// @__NO_SIDE_EFFECTS__
function ne(e) {
  const t = /* @__PURE__ */ rr(e);
  return fs(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ya(e) {
  const t = /* @__PURE__ */ rr(e);
  return t.equals = qa, t;
}
function Ti(e) {
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
function na(e) {
  var t, n = oe, a = e.parent;
  if (!Qt && a !== null && e.v !== je && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (a.f & (vt | st)) !== 0)
    return di(), e.v;
  Gt(a);
  try {
    e.f &= ~yn, Ti(e), t = gs(e);
  } finally {
    Gt(n);
  }
  return t;
}
function Va(e) {
  var t = na(e);
  if (!e.equals(t) && (e.wv = vs(), (!ve?.is_fork || e.deps === null) && (ve !== null ? (ve.capture(e, t, !0), Wr?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Re(e, He);
    return;
  }
  Qt || (Ft !== null ? (sa() || ve?.is_fork) && Ft.set(e, t) : ta(e));
}
function Mi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Wn(() => {
        t.ac.abort(sr), t.ac = null;
      }), t.fn !== null && (t.teardown = dr), ar(t, 0), la(t));
}
function Xa(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Bn(t);
}
let Nr = null, An = null, ve = null, Wr = null, Ft = null, Yr = null, Or = !1, On = null, fr = null;
var va = 0;
let Ai = 1;
class dn {
  id = Ai++;
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
    An === null ? Nr = An = this : (An.#e = this, this.#i = An), An = this;
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
        Re(s, qe), n(s);
      for (s of a.m)
        Re(s, Lt), n(s);
    }
    this.#g.add(t);
  }
  #_() {
    this.#t = !0, va++ > 1e3 && (this.#v(), Ri());
    for (const o of this.#c)
      this.#u.delete(o), Re(o, qe), this.schedule(o);
    for (const o of this.#u)
      Re(o, Lt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = On = [], a = [], s = fr = [];
    for (const o of t)
      try {
        this.#y(o, n, a);
      } catch (u) {
        throw Za(o), this.#b() || this.discard(), u;
      }
    if (ve = null, s.length > 0) {
      var i = dn.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (On = null, fr = null, this.#b()) {
      this.#h(a), this.#h(n);
      for (const [o, u] of this.#f)
        Ja(o, u);
      s.length > 0 && /** @type {unknown} */
      ve.#_();
      return;
    }
    const l = this.#m();
    if (l) {
      this.#h(a), this.#h(n), l.#x(this);
      return;
    }
    this.#c.clear(), this.#u.clear();
    for (const o of this.#o) o(this);
    this.#o.clear(), Wr = this, pa(a), pa(n), Wr = null, this.#l?.resolve();
    var c = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      ve
    );
    if (this.#s === 0 && (this.#a.length === 0 || c !== null) && this.#v(), this.#a.length > 0)
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
  #y(t, n, a) {
    t.f ^= He;
    for (var s = t.first; s !== null; ) {
      var i = s.f, l = (i & (kt | Zt)) !== 0, c = l && (i & He) !== 0, o = c || (i & st) !== 0 || this.#f.has(s);
      if (!o && s.fn !== null) {
        l ? s.f ^= He : (i & Dn) !== 0 ? n.push(s) : lr(s) && ((i & It) !== 0 && this.#u.add(s), Bn(s));
        var u = s.first;
        if (u !== null) {
          s = u;
          continue;
        }
      }
      for (; s !== null; ) {
        var p = s.next;
        if (p !== null) {
          s = p;
          break;
        }
        s = s.parent;
      }
    }
  }
  #m() {
    for (var t = this.#i; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, a]] of this.current)
          if (t.current.has(n) && !a)
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
    for (const [a, s] of t.current)
      !this.previous.has(a) && t.previous.has(a) && this.previous.set(a, t.previous.get(a)), this.current.set(a, s);
    for (const [a, s] of t.async_deriveds) {
      const i = this.async_deriveds.get(a);
      i && s.promise.then(i.resolve).catch(i.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#c, t.#u);
    const n = (a) => {
      var s = a.reactions;
      if (s !== null && !((a.f & We) !== 0 && (a.f & (qe | Lt)) === 0))
        for (const c of s) {
          var i = c.f;
          if ((i & We) !== 0)
            n(
              /** @type {Derived} */
              c
            );
          else {
            var l = (
              /** @type {Effect} */
              c
            );
            i & (zn | It) && !this.async_deriveds.has(l) && (this.#u.delete(l), Re(l, qe), this.schedule(l));
          }
        }
    };
    for (const a of this.current.keys())
      n(a);
    this.oncommit(() => t.discard()), t.#v(), ve = this, this.#_();
  }
  /**
   * @param {Effect[]} effects
   */
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      Ga(t[n], this.#c, this.#u);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, a = !1) {
    t.v !== je && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & cn) === 0 && (this.current.set(t, [n, a]), Ft?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    ve = this;
  }
  deactivate() {
    ve = null, Ft = null;
  }
  flush() {
    try {
      Or = !0, ve = this, this.#_();
    } finally {
      va = 0, Yr = null, On = null, fr = null, Or = !1, ve = null, Ft = null, bn.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Jn);
    this.#v(), this.#l?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let w = Nr; w !== null; w = w.#e) {
      var t = w.id < this.id, n = [];
      for (const [g, [h, m]] of this.current) {
        if (w.current.has(g)) {
          var a = (
            /** @type {[any, boolean]} */
            w.current.get(g)[0]
          );
          if (t && h !== a)
            w.current.set(g, [h, m]);
          else
            continue;
        }
        n.push(g);
      }
      if (t)
        for (const [g, h] of this.async_deriveds) {
          const m = w.async_deriveds.get(g);
          m && h.promise.then(m.resolve).catch(m.reject);
        }
      var s = [...w.current.keys()].filter(
        (g) => !/** @type {[any, boolean]} */
        w.current.get(g)[1]
      );
      if (!(!w.#t || s.length === 0)) {
        var i = s.filter((g) => !this.current.has(g));
        if (i.length === 0)
          t && w.discard();
        else if (n.length > 0) {
          if (t)
            for (const g of this.#g)
              w.unskip_effect(g, (h) => {
                (h.f & (It | zn)) !== 0 ? w.schedule(h) : w.#h([h]);
              });
          w.activate();
          var l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
          for (var o of n)
            Ka(o, i, l, c);
          c = /* @__PURE__ */ new Map();
          var u = [...w.current].filter(([g, h]) => {
            const m = this.current.get(g);
            return m ? m[0] !== h[0] || m[1] !== h[1] : !0;
          }).map(([g]) => g);
          if (u.length > 0)
            for (const g of this.#p)
              (g.f & (vt | st | pr)) === 0 && ra(g, u, c) && ((g.f & (zn | It)) !== 0 ? (Re(g, qe), w.schedule(g)) : w.#c.add(g));
          if (w.#a.length > 0 && !w.#d) {
            w.apply();
            for (var p of w.#a)
              w.#y(p, [], []);
            w.#a = [];
          }
          w.deactivate();
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
      let a = this.#n.get(n) ?? 0;
      this.#n.set(n, a + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  decrement(t, n) {
    if (this.#s -= 1, t) {
      let a = this.#n.get(n) ?? 0;
      a === 1 ? this.#n.delete(n) : this.#n.set(n, a - 1);
    }
    this.#d || (this.#d = !0, Kt(() => {
      this.#d = !1, this.linked && this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const a of t)
      this.#c.add(a);
    for (const a of n)
      this.#u.add(a);
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
    return (this.#l ??= za()).promise;
  }
  static ensure() {
    if (ve === null) {
      const t = ve = new dn();
      Or || Kt(() => {
        t.#t || t.flush();
      });
    }
    return ve;
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
    if (Yr = t, t.b?.is_pending && (t.f & (Dn | Tr | La)) !== 0 && (t.f & $n) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var a = n.f;
      if (On !== null && n === oe && (de === null || (de.f & We) === 0))
        return;
      if ((a & (Zt | kt)) !== 0) {
        if ((a & He) === 0)
          return;
        n.f ^= He;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#i, n = this.#e;
      t === null ? Nr = n : t.#e = n, n === null ? An = t : n.#i = t, this.linked = !1;
    }
  }
}
function Ri() {
  try {
    Vs();
  } catch (e) {
    ln(e, Yr);
  }
}
let Xt = null;
function pa(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var a = e[n++];
      if ((a.f & (vt | st)) === 0 && lr(a) && (Xt = /* @__PURE__ */ new Set(), Bn(a), a.deps === null && a.first === null && a.nodes === null && a.teardown === null && a.ac === null && cs(a), Xt?.size > 0)) {
        bn.clear();
        for (const s of Xt) {
          if ((s.f & (vt | st)) !== 0) continue;
          const i = [s];
          let l = s.parent;
          for (; l !== null; )
            Xt.has(l) && (Xt.delete(l), i.push(l)), l = l.parent;
          for (let c = i.length - 1; c >= 0; c--) {
            const o = i[c];
            (o.f & (vt | st)) === 0 && Bn(o);
          }
        }
        Xt.clear();
      }
    }
    Xt = null;
  }
}
function Ka(e, t, n, a) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & We) !== 0 ? Ka(
        /** @type {Derived} */
        s,
        t,
        n,
        a
      ) : (i & (zn | It)) !== 0 && (i & qe) === 0 && ra(s, t, a) && (Re(s, qe), aa(
        /** @type {Effect} */
        s
      ));
    }
}
function ra(e, t, n) {
  const a = n.get(e);
  if (a !== void 0) return a;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (vr.call(t, s))
        return !0;
      if ((s.f & We) !== 0 && ra(
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
function aa(e) {
  ve.schedule(e);
}
function Ja(e, t) {
  if (!((e.f & kt) !== 0 && (e.f & He) !== 0)) {
    (e.f & qe) !== 0 ? t.d.push(e) : (e.f & Lt) !== 0 && t.m.push(e), Re(e, He);
    for (var n = e.first; n !== null; )
      Ja(n, t), n = n.next;
  }
}
function Za(e) {
  Re(e, He);
  for (var t = e.first; t !== null; )
    Za(t), t = t.next;
}
let br = /* @__PURE__ */ new Set();
const bn = /* @__PURE__ */ new Map();
let Qa = !1;
function xn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ha,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  const n = xn(e);
  return fs(n), n;
}
// @__NO_SIDE_EFFECTS__
function Pi(e, t = !1, n = !0) {
  const a = xn(e);
  return t || (a.equals = qa), a;
}
function S(e, t, n = !1) {
  de !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!zt || (de.f & pr) !== 0) && Ba() && (de.f & (We | It | zn | pr)) !== 0 && ($t === null || !$t.has(e)) && Zs();
  let a = n ? Ce(t) : t;
  return qn(e, a, fr);
}
function qn(e, t, n = null) {
  if (!e.equals(t)) {
    bn.set(e, Qt ? t : e.v);
    var a = dn.ensure();
    if (a.capture(e, t), (e.f & We) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & qe) !== 0 && na(s), Ft === null && ta(s);
    }
    e.wv = vs(), es(e, qe, n), oe !== null && (oe.f & He) !== 0 && (oe.f & (kt | Zt)) === 0 && (mt === null ? Ui([e]) : mt.push(e)), !a.is_fork && br.size > 0 && !Qa && Ci();
  }
  return t;
}
function Ci() {
  Qa = !1;
  for (const e of br) {
    (e.f & He) !== 0 && Re(e, Lt);
    let t;
    try {
      t = lr(e);
    } catch {
      t = !0;
    }
    t && Bn(e);
  }
  br.clear();
}
function Ni(e, t = 1) {
  var n = r(e), a = t === 1 ? n++ : n--;
  return S(e, n), a;
}
function nr(e) {
  S(e, e.v + 1);
}
function es(e, t, n) {
  var a = e.reactions;
  if (a !== null)
    for (var s = a.length, i = 0; i < s; i++) {
      var l = a[i], c = l.f, o = (c & qe) === 0;
      if (o && Re(l, t), (c & pr) !== 0)
        br.add(
          /** @type {Effect} */
          l
        );
      else if ((c & We) !== 0) {
        var u = (
          /** @type {Derived} */
          l
        );
        Ft?.delete(u), (c & yn) === 0 && (c & xt && (oe === null || (oe.f & gr) === 0) && (l.f |= yn), es(u, Lt, n));
      } else if (o) {
        var p = (
          /** @type {Effect} */
          l
        );
        (c & It) !== 0 && Xt !== null && Xt.add(p), n !== null ? n.push(p) : aa(p);
      }
    }
}
function Ce(e) {
  if (typeof e != "object" || e === null || _n in e)
    return e;
  const t = Fa(e);
  if (t !== Is && t !== Fs)
    return e;
  var n = /* @__PURE__ */ new Map(), a = ea(e), s = /* @__PURE__ */ Y(0), i = wn, l = (c) => {
    if (wn === i)
      return c();
    var o = de, u = wn;
    St(null), ba(i);
    var p = c();
    return St(o), ba(u), p;
  };
  return a && n.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, o, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Ks();
        var p = n.get(o);
        return p === void 0 ? l(() => {
          var w = /* @__PURE__ */ Y(u.value);
          return n.set(o, w), w;
        }) : S(p, u.value, !0), !0;
      },
      deleteProperty(c, o) {
        var u = n.get(o);
        if (u === void 0) {
          if (o in c) {
            const p = l(() => /* @__PURE__ */ Y(je));
            n.set(o, p), nr(s);
          }
        } else
          S(u, je), nr(s);
        return !0;
      },
      get(c, o, u) {
        if (o === _n)
          return e;
        var p = n.get(o), w = o in c;
        if (p === void 0 && (!w || Fn(c, o)?.writable) && (p = l(() => {
          var h = Ce(w ? c[o] : je), m = /* @__PURE__ */ Y(h);
          return m;
        }), n.set(o, p)), p !== void 0) {
          var g = r(p);
          return g === je ? void 0 : g;
        }
        return Reflect.get(c, o, u);
      },
      getOwnPropertyDescriptor(c, o) {
        var u = Reflect.getOwnPropertyDescriptor(c, o);
        if (u && "value" in u) {
          var p = n.get(o);
          p && (u.value = r(p));
        } else if (u === void 0) {
          var w = n.get(o), g = w?.v;
          if (w !== void 0 && g !== je)
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
        if (o === _n)
          return !0;
        var u = n.get(o), p = u !== void 0 && u.v !== je || Reflect.has(c, o);
        if (u !== void 0 || oe !== null && (!p || Fn(c, o)?.writable)) {
          u === void 0 && (u = l(() => {
            var g = p ? Ce(c[o]) : je, h = /* @__PURE__ */ Y(g);
            return h;
          }), n.set(o, u));
          var w = r(u);
          if (w === je)
            return !1;
        }
        return p;
      },
      set(c, o, u, p) {
        var w = n.get(o), g = o in c;
        if (a && o === "length")
          for (var h = u; h < /** @type {Source<number>} */
          w.v; h += 1) {
            var m = n.get(h + "");
            m !== void 0 ? S(m, je) : h in c && (m = l(() => /* @__PURE__ */ Y(je)), n.set(h + "", m));
          }
        if (w === void 0)
          (!g || Fn(c, o)?.writable) && (w = l(() => /* @__PURE__ */ Y(void 0)), S(w, Ce(u)), n.set(o, w));
        else {
          g = w.v !== je;
          var x = l(() => Ce(u));
          S(w, x);
        }
        var d = Reflect.getOwnPropertyDescriptor(c, o);
        if (d?.set && d.set.call(p, u), !g) {
          if (a && typeof o == "string") {
            var _ = (
              /** @type {Source<number>} */
              n.get("length")
            ), k = Number(o);
            Number.isInteger(k) && k >= _.v && S(_, k + 1);
          }
          nr(s);
        }
        return !0;
      },
      ownKeys(c) {
        r(s);
        var o = Reflect.ownKeys(c).filter((w) => {
          var g = n.get(w);
          return g === void 0 || g.v !== je;
        });
        for (var [u, p] of n)
          p.v !== je && !(u in c) && o.push(u);
        return o;
      },
      setPrototypeOf() {
        Js();
      }
    }
  );
}
function ga(e) {
  try {
    if (e !== null && typeof e == "object" && _n in e)
      return e[_n];
  } catch {
  }
  return e;
}
function Oi(e, t) {
  return Object.is(ga(e), ga(t));
}
var kn, ts, ns, rs;
function Ii() {
  if (kn === void 0) {
    kn = window, ts = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    ns = Fn(t, "firstChild").get, rs = Fn(t, "nextSibling").get, ha(e) && (e[Ur] = void 0, e[Da] = null, e[$r] = void 0, e.__e = void 0), ha(n) && (n[Gr] = void 0);
  }
}
function Jt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function mr(e) {
  return (
    /** @type {TemplateNode | null} */
    ns.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ir(e) {
  return (
    /** @type {TemplateNode | null} */
    rs.call(e)
  );
}
function f(e, t) {
  return /* @__PURE__ */ mr(e);
}
function ct(e, t = !1) {
  {
    var n = /* @__PURE__ */ mr(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ir(n) : n;
  }
}
function b(e, t = 1, n = !1) {
  let a = e;
  for (; t--; )
    a = /** @type {TemplateNode} */
    /* @__PURE__ */ ir(a);
  return a;
}
function Fi(e) {
  e.textContent = "";
}
function as() {
  return !1;
}
function zi(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Li(e) {
  oe === null && (de === null && Ys(), Ws()), Qt && Gs();
}
function Di(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function en(e, t) {
  var n = oe;
  n !== null && (n.f & st) !== 0 && (e |= st);
  var a = {
    ctx: Je,
    deps: null,
    nodes: null,
    f: e | qe | xt,
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
  ve?.register_created_effect(a);
  var s = a;
  if ((e & Dn) !== 0)
    On !== null ? On.push(a) : dn.ensure().schedule(a);
  else if (t !== null) {
    try {
      Bn(a);
    } catch (l) {
      throw ut(a), l;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & Gn) === 0 && (s = s.first, (e & It) !== 0 && (e & jn) !== 0 && s !== null && (s.f |= jn));
  }
  if (s !== null && (s.parent = n, n !== null && Di(s, n), de !== null && (de.f & We) !== 0 && (e & Zt) === 0)) {
    var i = (
      /** @type {Derived} */
      de
    );
    (i.effects ??= []).push(s);
  }
  return a;
}
function sa() {
  return de !== null && !zt;
}
function Mr(e) {
  const t = en(Tr, null);
  return Re(t, He), t.teardown = e, t;
}
function Ut(e) {
  Li();
  var t = (
    /** @type {Effect} */
    oe.f
  ), n = !de && (t & kt) !== 0 && Je !== null && !Je.i;
  if (n) {
    var a = (
      /** @type {ComponentContext} */
      Je
    );
    (a.e ??= []).push(e);
  } else
    return ss(e);
}
function ss(e) {
  return en(Dn | Ds, e);
}
function ji(e) {
  dn.ensure();
  const t = en(Zt | Gn, e);
  return (n = {}) => new Promise((a) => {
    n.outro ? mn(t, () => {
      ut(t), a(void 0);
    }) : (ut(t), a(void 0));
  });
}
function is(e) {
  return en(Dn, e);
}
function Hi(e) {
  return en(zn | Gn, e);
}
function ls(e, t = 0) {
  return en(Tr | t, e);
}
function H(e, t = [], n = [], a = []) {
  ki(a, t, n, (s) => {
    en(Tr, () => {
      e(...s.map(r));
    });
  });
}
function ia(e, t = 0) {
  var n = en(It | t, e);
  return n;
}
function wt(e) {
  return en(kt | Gn, e);
}
function os(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Qt, a = de;
    _a(!0), St(null);
    try {
      t.call(null);
    } finally {
      _a(n), St(a);
    }
  }
}
function la(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Wn(() => {
      s.abort(sr);
    });
    var a = n.next;
    (n.f & Zt) !== 0 ? n.parent = null : ut(n, t), n = a;
  }
}
function qi(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & kt) === 0 && ut(t), t = n;
  }
}
function ut(e, t = !0) {
  var n = !1;
  (t || (e.f & Ls) !== 0) && e.nodes !== null && e.nodes.end !== null && (Bi(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Br, la(e, t && !n), ar(e, 0);
  var a = e.nodes && e.nodes.t;
  if (a !== null)
    for (const i of a)
      i.stop();
  os(e), e.f ^= Br, e.f |= vt;
  var s = e.parent;
  s !== null && s.first !== null && cs(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Bi(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ ir(e);
    e.remove(), e = n;
  }
}
function cs(e) {
  var t = e.parent, n = e.prev, a = e.next;
  n !== null && (n.next = a), a !== null && (a.prev = n), t !== null && (t.first === e && (t.first = a), t.last === e && (t.last = n));
}
function mn(e, t, n = !0) {
  var a = [];
  us(e, a, !0);
  var s = () => {
    n && ut(e), t && t();
  }, i = a.length;
  if (i > 0) {
    var l = () => --i || s();
    for (var c of a)
      c.out(l);
  } else
    s();
}
function us(e, t, n) {
  if ((e.f & st) === 0) {
    e.f ^= st;
    var a = e.nodes && e.nodes.t;
    if (a !== null)
      for (const c of a)
        (c.is_global || n) && t.push(c);
    for (var s = e.first; s !== null; ) {
      var i = s.next;
      if ((s.f & Zt) === 0) {
        var l = (s.f & jn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (s.f & kt) !== 0 && (e.f & It) !== 0;
        us(s, t, l ? n : !1);
      }
      s = i;
    }
  }
}
function wr(e) {
  ds(e, !0);
}
function ds(e, t) {
  if ((e.f & st) !== 0) {
    e.f ^= st, (e.f & He) === 0 && (Re(e, qe), dn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var a = n.next, s = (n.f & jn) !== 0 || (n.f & kt) !== 0;
      ds(n, s ? t : !1), n = a;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function oa(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, a = e.nodes.end; n !== null; ) {
      var s = n === a ? null : /* @__PURE__ */ ir(n);
      t.append(n), n = s;
    }
}
let hr = !1, Qt = !1;
function _a(e) {
  Qt = e;
}
let de = null, zt = !1;
function St(e) {
  de = e;
}
let oe = null;
function Gt(e) {
  oe = e;
}
let $t = null;
function fs(e) {
  de !== null && ($t ??= /* @__PURE__ */ new Set()).add(e);
}
let ot = null, ht = 0, mt = null;
function Ui(e) {
  mt = e;
}
let hs = 1, pn = 0, wn = pn;
function ba(e) {
  wn = e;
}
function vs() {
  return ++hs;
}
function lr(e) {
  var t = e.f;
  if ((t & qe) !== 0)
    return !0;
  if (t & We && (e.f &= ~yn), (t & Lt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), a = n.length, s = 0; s < a; s++) {
      var i = n[s];
      if (lr(
        /** @type {Derived} */
        i
      ) && Va(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & xt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ft === null && Re(e, He);
  }
  return !1;
}
function ps(e, t, n = !0) {
  var a = e.reactions;
  if (a !== null && !($t !== null && $t.has(e)))
    for (var s = 0; s < a.length; s++) {
      var i = a[s];
      (i.f & We) !== 0 ? ps(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Re(i, qe) : (i.f & He) !== 0 && Re(i, Lt), aa(
        /** @type {Effect} */
        i
      ));
    }
}
function gs(e) {
  var t = ot, n = ht, a = mt, s = de, i = $t, l = Je, c = zt, o = wn, u = e.f;
  ot = /** @type {null | Value[]} */
  null, ht = 0, mt = null, de = (u & (kt | Zt)) === 0 ? e : null, $t = null, Hn(e.ctx), zt = !1, wn = ++pn, e.ac !== null && (Wn(() => {
    e.ac.abort(sr);
  }), e.ac = null);
  try {
    e.f |= gr;
    var p = (
      /** @type {Function} */
      e.fn
    ), w = p();
    e.f |= $n;
    var g = e.deps, h = ve?.is_fork;
    if (ot !== null) {
      var m;
      if (h || ar(e, ht), g !== null && ht > 0)
        for (g.length = ht + ot.length, m = 0; m < ot.length; m++)
          g[ht + m] = ot[m];
      else
        e.deps = g = ot;
      if (sa() && (e.f & xt) !== 0)
        for (m = ht; m < g.length; m++)
          (g[m].reactions ??= []).push(e);
    } else !h && g !== null && ht < g.length && (ar(e, ht), g.length = ht);
    if (Ba() && mt !== null && !zt && g !== null && (e.f & (We | Lt | qe)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      mt.length; m++)
        ps(
          mt[m],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (pn++, s.deps !== null)
        for (let x = 0; x < n; x += 1)
          s.deps[x].rv = pn;
      if (t !== null)
        for (const x of t)
          x.rv = pn;
      mt !== null && (a === null ? a = mt : a.push(.../** @type {Source[]} */
      mt));
    }
    return (e.f & cn) !== 0 && (e.f ^= cn), w;
  } catch (x) {
    return Ua(x);
  } finally {
    e.f ^= gr, ot = t, ht = n, mt = a, de = s, $t = i, Hn(l), zt = c, wn = o;
  }
}
function $i(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var a = Cs.call(n, e);
    if (a !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[a] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & We) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ot === null || !vr.call(ot, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & xt) !== 0 && (i.f ^= xt, i.f &= ~yn), i.v !== je && ta(i), i.ac !== null && Wn(() => {
      i.ac.abort(sr), i.ac = null, Re(i, qe);
    }), Mi(i), ar(i, 0);
  }
}
function ar(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var a = t; a < n.length; a++)
      $i(e, n[a]);
}
function Bn(e) {
  var t = e.f;
  if ((t & vt) === 0) {
    Re(e, He);
    var n = oe, a = hr;
    oe = e, hr = (t & (kt | Zt)) === 0;
    try {
      (t & (It | La)) !== 0 ? qi(e) : la(e), os(e);
      var s = gs(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = hs;
      var i;
    } finally {
      hr = a, oe = n;
    }
  }
}
function r(e) {
  var t = e.f, n = (t & We) !== 0;
  if (de !== null && !zt) {
    var a = oe !== null && (oe.f & vt) !== 0;
    if (!a && ($t === null || !$t.has(e))) {
      var s = de.deps;
      if ((de.f & gr) !== 0)
        e.rv < pn && (e.rv = pn, ot === null && s !== null && s[ht] === e ? ht++ : ot === null ? ot = [e] : ot.push(e));
      else {
        de.deps ??= [], vr.call(de.deps, e) || de.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [de] : vr.call(i, de) || i.push(de);
      }
    }
  }
  if (Qt && bn.has(e))
    return bn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Qt) {
      var c = l.v;
      return ((l.f & He) === 0 && l.reactions !== null || bs(l)) && (c = na(l)), bn.set(l, c), c;
    }
    var o = (l.f & xt) === 0 && !zt && de !== null && (hr || (de.f & xt) !== 0), u = (l.f & $n) === 0;
    lr(l) && (o && (l.f |= xt), Va(l)), o && !u && (Xa(l), _s(l));
  }
  if (Ft?.has(e))
    return Ft.get(e);
  if ((e.f & cn) !== 0)
    throw e.v;
  return e.v;
}
function _s(e) {
  if (e.f |= xt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & We) !== 0 && (t.f & xt) === 0 && (Xa(
        /** @type {Derived} */
        t
      ), _s(
        /** @type {Derived} */
        t
      ));
}
function bs(e) {
  if (e.v === je) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (bn.has(t) || (t.f & We) !== 0 && bs(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function un(e) {
  var t = zt;
  try {
    return zt = !0, e();
  } finally {
    zt = t;
  }
}
const Gi = ["touchstart", "touchmove"];
function Wi(e) {
  return Gi.includes(e);
}
const Zn = Symbol("events"), ms = /* @__PURE__ */ new Set(), Vr = /* @__PURE__ */ new Set();
function Yi(e, t, n, a = {}) {
  function s(i) {
    if (a.capture || Xr.call(t, i), !i.cancelBubble)
      return Wn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Kt(() => {
    t.addEventListener(e, s, a);
  }) : t.addEventListener(e, s, a), s;
}
function Ln(e, t, n, a, s) {
  var i = { capture: a, passive: s }, l = Yi(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Mr(() => {
    t.removeEventListener(e, l, i);
  });
}
function Q(e, t, n) {
  (t[Zn] ??= {})[e] = n;
}
function Dt(e) {
  for (var t = 0; t < e.length; t++)
    ms.add(e[t]);
  for (var n of Vr)
    n(e);
}
let ma = null;
function Xr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), a = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  ma = e;
  var l = 0, c = ma === e && e[Zn];
  if (c) {
    var o = s.indexOf(c);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Zn] = t;
      return;
    }
    var u = s.indexOf(t);
    if (u === -1)
      return;
    o <= u && (l = o);
  }
  if (i = /** @type {Element} */
  s[l] || e.target, i !== t) {
    Ns(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var p = de, w = oe;
    St(null), Gt(null);
    try {
      for (var g, h = []; i !== null && i !== t; ) {
        try {
          var m = i[Zn]?.[a];
          m != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && m.call(i, e);
        } catch (x) {
          g ? h.push(x) : g = x;
        }
        if (e.cancelBubble) break;
        l++, i = l < s.length ? (
          /** @type {Element} */
          s[l]
        ) : null;
      }
      if (g) {
        for (let x of h)
          queueMicrotask(() => {
            throw x;
          });
        throw g;
      }
    } finally {
      e[Zn] = t, delete e.currentTarget, St(p), Gt(w);
    }
  }
}
const Vi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Xi(e) {
  return (
    /** @type {string} */
    Vi?.createHTML(e) ?? e
  );
}
function Ki(e) {
  var t = zi("template");
  return t.innerHTML = Xi(e.replaceAll("<!>", "<!---->")), t.content;
}
function yr(e, t) {
  var n = (
    /** @type {Effect} */
    oe
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function N(e, t) {
  var n = (t & oi) !== 0, a = (t & ci) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = Ki(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ mr(s)));
    var l = (
      /** @type {TemplateNode} */
      a || ts ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ mr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      yr(c, o);
    } else
      yr(l, l);
    return l;
  };
}
function In(e = "") {
  {
    var t = Jt(e + "");
    return yr(t, t), t;
  }
}
function ca() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Jt();
  return e.append(t, n), yr(t, n), e;
}
function P(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function A(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !== /** @type {any} */
  (e[Gr] ??= e.nodeValue) && (e[Gr] = n, e.nodeValue = `${n}`);
}
function Ji(e, t) {
  return Zi(e, t);
}
const cr = /* @__PURE__ */ new Map();
function Zi(e, { target: t, anchor: n, props: a = {}, events: s, context: i, intro: l = !0, transformError: c }) {
  Ii();
  var o = void 0, u = ji(() => {
    var p = n ?? t.appendChild(Jt());
    yi(
      /** @type {TemplateNode} */
      p,
      {
        pending: () => {
        }
      },
      (h) => {
        pt({});
        var m = (
          /** @type {ComponentContext} */
          Je
        );
        i && (m.c = i), s && (a.$$events = s), o = e(h, a) || {}, gt();
      },
      c
    );
    var w = /* @__PURE__ */ new Set(), g = (h) => {
      for (var m = 0; m < h.length; m++) {
        var x = h[m];
        if (!w.has(x)) {
          w.add(x);
          var d = Wi(x);
          for (const R of [t, document]) {
            var _ = cr.get(R);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), cr.set(R, _));
            var k = _.get(x);
            k === void 0 ? (R.addEventListener(x, Xr, { passive: d }), _.set(x, 1)) : _.set(x, k + 1);
          }
        }
      }
    };
    return g(Er(ms)), Vr.add(g), () => {
      for (var h of w)
        for (const d of [t, document]) {
          var m = (
            /** @type {Map<string, number>} */
            cr.get(d)
          ), x = (
            /** @type {number} */
            m.get(h)
          );
          --x == 0 ? (d.removeEventListener(h, Xr), m.delete(h), m.size === 0 && cr.delete(d)) : m.set(h, x);
        }
      Vr.delete(g), p !== n && p.parentNode?.removeChild(p);
    };
  });
  return Qi.set(o, u), o;
}
let Qi = /* @__PURE__ */ new WeakMap();
class el {
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
      ), a = this.#i.get(n);
      if (a)
        wr(a), this.#o.delete(n);
      else {
        var s = this.#e.get(n);
        s && (wr(s.effect), this.#i.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), a = s.effect);
      }
      for (const [i, l] of this.#t) {
        if (this.#t.delete(i), i === t)
          break;
        const c = this.#e.get(l);
        c && (ut(c.effect), this.#e.delete(l));
      }
      for (const [i, l] of this.#i) {
        if (i === n || this.#o.has(i)) continue;
        const c = () => {
          if (Array.from(this.#t.values()).includes(i)) {
            var u = document.createDocumentFragment();
            oa(l, u), u.append(Jt()), this.#e.set(i, { effect: l, fragment: u });
          } else
            ut(l);
          this.#o.delete(i), this.#i.delete(i);
        };
        this.#r || !a ? (this.#o.add(i), mn(l, c, !1)) : c();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [a, s] of this.#e)
      n.includes(a) || (ut(s.effect), this.#e.delete(a));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var a = (
      /** @type {Batch} */
      ve
    ), s = as();
    if (n && !this.#i.has(t) && !this.#e.has(t))
      if (s) {
        var i = document.createDocumentFragment(), l = Jt();
        i.append(l), this.#e.set(t, {
          effect: wt(() => n(l)),
          fragment: i
        });
      } else
        this.#i.set(
          t,
          wt(() => n(this.anchor))
        );
    if (this.#t.set(a, t), s) {
      for (const [c, o] of this.#i)
        c === t ? a.unskip_effect(o) : a.skip_effect(o);
      for (const [c, o] of this.#e)
        c === t ? a.unskip_effect(o.effect) : a.skip_effect(o.effect);
      a.oncommit(this.#s), a.ondiscard(this.#n);
    } else
      this.#s(a);
  }
}
function K(e, t, n = !1) {
  var a = new el(e), s = n ? jn : 0;
  function i(l, c) {
    a.ensure(l, c);
  }
  ia(() => {
    var l = !1;
    t((c, o = 0) => {
      l = !0, i(o, c);
    }), l || i(-1, null);
  }, s);
}
function yt(e, t) {
  return t;
}
function tl(e, t, n) {
  for (var a = [], s = t.length, i, l = t.length, c = 0; c < s; c++) {
    let w = t[c];
    mn(
      w,
      () => {
        if (i) {
          if (i.pending.delete(w), i.done.add(w), i.pending.size === 0) {
            var g = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Kr(e, Er(i.done)), g.delete(i), g.size === 0 && (e.outrogroups = null);
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
      var u = (
        /** @type {Element} */
        n
      ), p = (
        /** @type {Element} */
        u.parentNode
      );
      Fi(p), p.append(u), e.items.clear();
    }
    Kr(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function Kr(e, t, n = !0) {
  var a;
  if (e.pending.size > 0) {
    a = /* @__PURE__ */ new Set();
    for (const l of e.pending.values())
      for (const c of l)
        a.add(
          /** @type {EachItem} */
          e.items.get(c).e
        );
  }
  for (var s = 0; s < t.length; s++) {
    var i = t[s];
    if (a?.has(i)) {
      i.f |= Bt;
      const l = document.createDocumentFragment();
      oa(i, l);
    } else
      ut(t[s], n);
  }
}
var wa;
function Ke(e, t, n, a, s, i = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & ja) !== 0;
  if (o) {
    var u = (
      /** @type {Element} */
      e
    );
    l = u.appendChild(Jt());
  }
  var p = null, w = /* @__PURE__ */ Ya(() => {
    var R = n();
    return (
      /** @type {V[]} */
      ea(R) ? R : R == null ? [] : Er(R)
    );
  }), g, h = /* @__PURE__ */ new Map(), m = !0;
  function x(R) {
    (k.effect.f & vt) === 0 && (k.pending.delete(R), k.fallback = p, nl(k, g, l, t, a), p !== null && (g.length === 0 ? (p.f & Bt) === 0 ? wr(p) : (p.f ^= Bt, Qn(p, null, l)) : mn(p, () => {
      p = null;
    })));
  }
  function d(R) {
    k.pending.delete(R);
  }
  var _ = ia(() => {
    g = /** @type {V[]} */
    r(w);
    for (var R = g.length, I = /* @__PURE__ */ new Set(), j = (
      /** @type {Batch} */
      ve
    ), G = as(), V = 0; V < R; V += 1) {
      var J = g[V], q = a(J, V), L = m ? null : c.get(q);
      L ? (L.v && qn(L.v, J), L.i && qn(L.i, V), G && j.unskip_effect(L.e)) : (L = rl(
        c,
        m ? l : wa ??= Jt(),
        J,
        q,
        V,
        s,
        t,
        n
      ), m || (L.e.f |= Bt), c.set(q, L)), I.add(q);
    }
    if (R === 0 && i && !p && (m ? p = wt(() => i(l)) : (p = wt(() => i(wa ??= Jt())), p.f |= Bt)), R > I.size && $s(), !m)
      if (h.set(j, I), G) {
        for (const [M, v] of c)
          I.has(M) || j.skip_effect(v.e);
        j.oncommit(x), j.ondiscard(d);
      } else
        x(j);
    r(w);
  }), k = { effect: _, items: c, pending: h, outrogroups: null, fallback: p };
  m = !1;
}
function Xn(e) {
  for (; e !== null && (e.f & kt) === 0; )
    e = e.next;
  return e;
}
function nl(e, t, n, a, s) {
  var i = (a & ni) !== 0, l = t.length, c = e.items, o = Xn(e.effect.first), u, p = null, w, g = [], h = [], m, x, d, _;
  if (i)
    for (_ = 0; _ < l; _ += 1)
      m = t[_], x = s(m, _), d = /** @type {EachItem} */
      c.get(x).e, (d.f & Bt) === 0 && (d.nodes?.a?.measure(), (w ??= /* @__PURE__ */ new Set()).add(d));
  for (_ = 0; _ < l; _ += 1) {
    if (m = t[_], x = s(m, _), d = /** @type {EachItem} */
    c.get(x).e, e.outrogroups !== null)
      for (const L of e.outrogroups)
        L.pending.delete(d), L.done.delete(d);
    if ((d.f & st) !== 0 && (wr(d), i && (d.nodes?.a?.unfix(), (w ??= /* @__PURE__ */ new Set()).delete(d))), (d.f & Bt) !== 0)
      if (d.f ^= Bt, d === o)
        Qn(d, null, n);
      else {
        var k = p ? p.next : o;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), sn(e, p, d), sn(e, d, k), Qn(d, k, n), p = d, g = [], h = [], o = Xn(p.next);
        continue;
      }
    if (d !== o) {
      if (u !== void 0 && u.has(d)) {
        if (g.length < h.length) {
          var R = h[0], I;
          p = R.prev;
          var j = g[0], G = g[g.length - 1];
          for (I = 0; I < g.length; I += 1)
            Qn(g[I], R, n);
          for (I = 0; I < h.length; I += 1)
            u.delete(h[I]);
          sn(e, j.prev, G.next), sn(e, p, j), sn(e, G, R), o = R, p = G, _ -= 1, g = [], h = [];
        } else
          u.delete(d), Qn(d, o, n), sn(e, d.prev, d.next), sn(e, d, p === null ? e.effect.first : p.next), sn(e, p, d), p = d;
        continue;
      }
      for (g = [], h = []; o !== null && o !== d; )
        (u ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = Xn(o.next);
      if (o === null)
        continue;
    }
    (d.f & Bt) === 0 && g.push(d), p = d, o = Xn(d.next);
  }
  if (e.outrogroups !== null) {
    for (const L of e.outrogroups)
      L.pending.size === 0 && (Kr(e, Er(L.done)), e.outrogroups?.delete(L));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || u !== void 0) {
    var V = [];
    if (u !== void 0)
      for (d of u)
        (d.f & st) === 0 && V.push(d);
    for (; o !== null; )
      (o.f & st) === 0 && o !== e.fallback && V.push(o), o = Xn(o.next);
    var J = V.length;
    if (J > 0) {
      var q = (a & ja) !== 0 && l === 0 ? n : null;
      if (i) {
        for (_ = 0; _ < J; _ += 1)
          V[_].nodes?.a?.measure();
        for (_ = 0; _ < J; _ += 1)
          V[_].nodes?.a?.fix();
      }
      tl(e, V, q);
    }
  }
  i && Kt(() => {
    if (w !== void 0)
      for (d of w)
        d.nodes?.a?.apply();
  });
}
function rl(e, t, n, a, s, i, l, c) {
  var o = (l & ei) !== 0 ? (l & ri) === 0 ? /* @__PURE__ */ Pi(n, !1, !1) : xn(n) : null, u = (l & ti) !== 0 ? xn(s) : null;
  return {
    v: o,
    i: u,
    e: wt(() => (i(t, o ?? n, u ?? s, c), () => {
      e.delete(a);
    }))
  };
}
function Qn(e, t, n) {
  if (e.nodes)
    for (var a = e.nodes.start, s = e.nodes.end, i = t && (t.f & Bt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; a !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ir(a)
      );
      if (i.before(a), a === s)
        return;
      a = l;
    }
}
function sn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Rn(e, t, n) {
  is(() => {
    var a = un(() => t(e, n?.()) || {});
    if (a?.destroy)
      return () => (
        /** @type {Function} */
        a.destroy()
      );
  });
}
const ya = [...` 	
\r\f \v\uFEFF`];
function al(e, t, n) {
  var a = e == null ? "" : "" + e;
  if (n) {
    for (var s of Object.keys(n))
      if (n[s])
        a = a ? a + " " + s : s;
      else if (a.length)
        for (var i = s.length, l = 0; (l = a.indexOf(s, l)) >= 0; ) {
          var c = l + i;
          (l === 0 || ya.includes(a[l - 1])) && (c === a.length || ya.includes(a[c])) ? a = (l === 0 ? "" : a.substring(0, l)) + a.substring(c + 1) : l = c;
        }
  }
  return a === "" ? null : a;
}
function xa(e, t = !1) {
  var n = t ? " !important;" : ";", a = "";
  for (var s of Object.keys(e)) {
    var i = e[s];
    i != null && i !== "" && (a += " " + s + ": " + i + n);
  }
  return a;
}
function sl(e, t) {
  if (t) {
    var n = "", a, s;
    return Array.isArray(t) ? (a = t[0], s = t[1]) : a = t, a && (n += xa(a)), s && (n += xa(s, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function ye(e, t, n, a, s, i) {
  var l = (
    /** @type {any} */
    e[Ur]
  );
  if (l !== n || l === void 0) {
    var c = al(n, a, i);
    c == null ? e.removeAttribute("class") : e.className = c, e[Ur] = n;
  } else if (i && s !== i)
    for (var o in i) {
      var u = !!i[o];
      (s == null || u !== !!s[o]) && e.classList.toggle(o, u);
    }
  return i;
}
function Ir(e, t = {}, n, a) {
  for (var s in n) {
    var i = n[s];
    t[s] !== i && (n[s] == null ? e.style.removeProperty(s) : e.style.setProperty(s, i, a));
  }
}
function gn(e, t, n, a) {
  var s = (
    /** @type {any} */
    e[$r]
  );
  if (s !== t) {
    var i = sl(t, a);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[$r] = t;
  } else a && (Array.isArray(a) ? (Ir(e, n?.[0], a[0]), Ir(e, n?.[1], a[1], "important")) : Ir(e, n, a));
  return a;
}
function er(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ea(t))
      return fi();
    for (var a of e.options)
      a.selected = t.includes(ka(a));
    return;
  }
  for (a of e.options) {
    var s = ka(a);
    if (Oi(s, t)) {
      a.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function ur(e) {
  var t = new MutationObserver(() => {
    "__value" in e && er(e, e.__value);
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
  }), Mr(() => {
    t.disconnect();
  });
}
function ka(e) {
  return "__value" in e ? e.__value : e.value;
}
const il = Symbol("is custom element"), ll = Symbol("is html"), ol = qs ? "progress" : "PROGRESS";
function hn(e, t) {
  var n = ua(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== ol) || (e.value = t ?? "");
}
function cl(e, t) {
  var n = ua(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function se(e, t, n, a) {
  var s = ua(e);
  s[t] !== (s[t] = n) && (t === "loading" && (e[Hs] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && ul(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function ua(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[Da] ??= {
      [il]: e.nodeName.includes("-"),
      [ll]: e.namespaceURI === ui
    }
  );
}
var Sa = /* @__PURE__ */ new Map();
function ul(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Sa.get(t);
  if (n) return n;
  Sa.set(t, n = []);
  for (var a, s = e, i = Element.prototype; i !== s; ) {
    a = Os(s);
    for (var l in a)
      a[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    s = Fa(s);
  }
  return n;
}
function Fr(e, t) {
  return e === t || e?.[_n] === t;
}
function xr(e = {}, t, n, a) {
  var s = (
    /** @type {ComponentContext} */
    Je.r
  ), i = (
    /** @type {Effect} */
    oe
  );
  return is(() => {
    var l, c;
    return ls(() => {
      l = c, c = [], un(() => {
        Fr(n(...c), e) || (t(e, ...c), l && Fr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== s && o.parent !== null && o.parent.f & Br; )
        o = o.parent;
      const u = () => {
        c && Fr(n(...c), e) && t(null, ...c);
      }, p = o.teardown;
      o.teardown = () => {
        u(), p?.();
      };
    };
  }), e;
}
function Jr(e, t) {
  bi(window, ["resize"], () => Wn(() => t(window[e])));
}
function te(e, t, n, a) {
  var s = !0, i = (n & ii) !== 0, l = (n & li) !== 0, c = (
    /** @type {V} */
    a
  ), o = !0, u = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), p = () => l && s ? (u ??= /* @__PURE__ */ rr(
    /** @type {() => V} */
    a
  ), r(u)) : (o && (o = !1, c = l ? un(
    /** @type {() => V} */
    a
  ) : (
    /** @type {V} */
    a
  )), c);
  let w;
  if (i) {
    var g = _n in e || js in e;
    w = Fn(e, t)?.set ?? (g && t in e ? (I) => e[t] = I : void 0);
  }
  var h, m = !1;
  i ? [h, m] = _i(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && a !== void 0 && (h = p(), w && (Xs(), w(h)));
  var x;
  if (x = () => {
    var I = (
      /** @type {V} */
      e[t]
    );
    return I === void 0 ? p() : (o = !0, I);
  }, (n & si) === 0)
    return x;
  if (w) {
    var d = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(I, j) {
        return arguments.length > 0 ? ((!j || d || m) && w(j ? x() : I), I) : x();
      })
    );
  }
  var _ = !1, k = ((n & ai) !== 0 ? rr : Ya)(() => (_ = !1, x()));
  i && r(k);
  var R = (
    /** @type {Effect} */
    oe
  );
  return (
    /** @type {() => V} */
    (function(I, j) {
      if (arguments.length > 0) {
        const G = j ? r(k) : i ? Ce(I) : I;
        return S(k, G), _ = !0, c !== void 0 && (c = G), I;
      }
      return Qt && _ || (R.f & vt) !== 0 ? k.v : r(k);
    })
  );
}
function Yn(e) {
  Je === null && Bs(), Ut(() => {
    const t = un(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const dl = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(dl);
function fl(e) {
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
async function Vt(e, t = {}) {
  const n = await fetch(e + fl(t));
  if (!n.ok) {
    const a = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${a.error ? " (" + a.error + ")" : ""}`);
  }
  return n.json();
}
async function Pn(e, t) {
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
function Ea(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const De = {
  // --- reads
  photos: (e) => Vt("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => Vt("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => Vt("/api/triage/counts", { ...Ea(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Vt("/api/triage/files"),
  screen: (e, t = {}) => Vt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Vt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Vt("/api/triage/page", { ...Ea(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Vt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => Pn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => Pn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => Pn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => Pn("/api/triage/override", { sha256: e, decision: t }),
  // --- the two surfaces that leave the process
  revealPhoto: (e) => Pn("/api/reveal", { id: e }),
  revealOrigin: (e) => Pn("/api/reveal", { origin: e }),
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
  rebuildStatus: () => Vt("/api/triage/rebuild")
};
function hl() {
  let e = 0, t = 0;
  return async function(a) {
    const s = ++e, i = await a();
    return s <= t ? { stale: !0, value: void 0 } : (t = s, { stale: !1, value: i });
  };
}
function vl(e, t) {
  let n = 0;
  const a = (...s) => {
    clearTimeout(n), n = setTimeout(() => e(...s), t);
  };
  return a.cancel = () => clearTimeout(n), a.now = (...s) => {
    clearTimeout(n), e(...s);
  }, a;
}
const Ta = ["B", "KB", "MB", "GB", "TB"];
function Nt(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < Ta.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${Ta[n]}`;
}
function Ee(e) {
  return (Number(e) || 0).toLocaleString();
}
const Un = "G:\\photos", Ma = [
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
      value: t ? `${Un}\\${t}\\${e.key}` : `${Un}\\${e.key}`
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
function ws(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), a = Un.toLowerCase();
  return n.toLowerCase().startsWith(a + "\\") ? n : "";
}
function da(e, t) {
  const n = t.toLowerCase();
  return e.some((a) => n === a || n.startsWith(a + "\\"));
}
function pl(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function gl(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function ys(e, t) {
  if (!t) return null;
  const n = e.find(
    (a) => a.term && a.term.column === t.column && a.term.op === t.op && gl(a.term.value, t.value)
  );
  return n ? n.decision : null;
}
var _l = /* @__PURE__ */ N('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), bl = /* @__PURE__ */ N('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), ml = /* @__PURE__ */ N('<div class="line muted svelte-1vgp6n7">…</div>'), wl = /* @__PURE__ */ N('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), yl = /* @__PURE__ */ N('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), xl = /* @__PURE__ */ N('<div class="line muted svelte-1vgp6n7"> </div>'), kl = /* @__PURE__ */ N('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function Sl(e, t) {
  pt(t, !0);
  let n = te(t, "counts", 3, null), a = te(t, "files", 3, null), s = te(t, "filesAt", 3, null), i = te(t, "stale", 3, !1), l = te(t, "candidate", 3, null), c = te(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ne(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var u = kl(), p = f(u);
  let w;
  var g = b(f(p), 2);
  {
    var h = (q) => {
      var L = bl(), M = ct(L), v = f(M), C = f(v), U = b(v, 2), D = f(U), $ = b(U, 4), Z = f($), ie = b($, 2), ee = f(ie), W = b(M, 2);
      {
        var O = (X) => {
          var E = _l(), y = b(f(E), 2), F = f(y), ae = b(y, 2), be = f(ae), ge = b(ae, 4), he = f(ge), Ue = b(ge, 2), me = f(Ue), ke = b(Ue, 2), $e = f(ke);
          H(
            (ze, Pe, ce, le, we) => {
              A(F, `kept ${ze ?? ""}`), A(be, Pe), A(he, `excluded ${ce ?? ""}`), A(me, le), A($e, `${r(o) >= 0 ? "+" : ""}${we ?? ""} excluded`);
            },
            [
              () => Ee(n().candidate_kept_paths),
              () => Nt(n().candidate_kept_bytes),
              () => Ee(n().candidate_excluded_paths),
              () => Nt(n().candidate_excluded_bytes),
              () => Ee(r(o))
            ]
          ), P(X, E);
        };
        K(W, (X) => {
          l() && X(O);
        });
      }
      H(
        (X, E, y, F) => {
          A(C, `kept ${X ?? ""}`), A(D, E), A(Z, `excluded ${y ?? ""}`), A(ee, F);
        },
        [
          () => Ee(n().kept_paths),
          () => Nt(n().kept_bytes),
          () => Ee(n().excluded_paths),
          () => Nt(n().excluded_bytes)
        ]
      ), P(q, L);
    }, m = (q) => {
      var L = ml();
      P(q, L);
    };
    K(g, (q) => {
      n() ? q(h) : q(m, -1);
    });
  }
  var x = b(p, 2);
  let d;
  var _ = f(x), k = b(f(_), 3), R = f(k), I = b(k, 2);
  {
    var j = (q) => {
      var L = wl();
      P(q, L);
    };
    K(I, (q) => {
      i() && a() && a() !== "loading" && q(j);
    });
  }
  var G = b(_, 2);
  {
    var V = (q) => {
      var L = yl(), M = ct(L);
      let v;
      var C = f(M), U = f(C), D = b(C, 2), $ = f(D), Z = b(D, 4), ie = f(Z), ee = b(Z, 2), W = f(ee), O = b(M, 2), X = f(O);
      H(
        (E, y, F, ae) => {
          v = ye(M, 1, "line svelte-1vgp6n7", null, v, { outdated: i() }), A(U, `kept ${E ?? ""}`), A($, y), A(ie, `excluded ${F ?? ""}`), A(W, ae), A(X, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Ee(a().kept_files),
          () => Nt(a().kept_bytes),
          () => Ee(a().excluded_files),
          () => Nt(a().excluded_bytes)
        ]
      ), P(q, L);
    }, J = (q) => {
      var L = xl(), M = f(L);
      H(() => A(M, a() === "loading" ? "counting…" : "not counted yet")), P(q, L);
    };
    K(G, (q) => {
      a() && a() !== "loading" ? q(V) : q(J, -1);
    });
  }
  H(() => {
    w = ye(p, 1, "block svelte-1vgp6n7", null, w, { busy: c() }), d = ye(x, 1, "block svelte-1vgp6n7", null, d, { busy: a() === "loading" }), k.disabled = a() === "loading", A(R, a() === "loading" ? "counting…" : "recount");
  }), Q("click", k, function(...q) {
    t.onfiles?.apply(this, q);
  }), P(e, u), gt();
}
Dt(["click"]);
const Zr = "http://www.w3.org/2000/svg", vn = {
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
}, on = {
  ...vn,
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
}, El = [
  { dark: "tint", light: "tintLight", base: vn },
  { dark: "control", light: "controlLight", base: on },
  { dark: "ink", light: "inkLight", base: on },
  { dark: "tally", light: "tallyLight", base: on },
  { dark: "tallyInk", light: "tallyInkLight", base: on }
], Qr = /* @__PURE__ */ new Set();
let Ot = { ...on };
function Tl() {
  return Ot;
}
function zr(e) {
  Ot = Rl(e), fa();
  for (const t of Qr) t(Ot);
  return Ot;
}
function Ml(e) {
  return Qr.add(e), () => Qr.delete(e);
}
function tr(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function Al(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: Be(tr(e.r, t.r), 0, 255),
    g: Be(tr(e.g, t.g), 0, 255),
    b: Be(tr(e.b, t.b), 0, 255),
    a: Be(tr(e.a, t.a), 0, 1)
  };
}
function Rl(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [a, s] of Object.entries(on))
    typeof s == "boolean" ? n[a] = t[a] === void 0 ? s : !!t[a] : typeof s == "object" ? n[a] = Al(t[a], s) : n[a] = tr(t[a], s);
  return n;
}
function bt({ r: e, g: t, b: n, a }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Ae(a, 3)})`;
}
function Ae(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function Aa({ r: e, g: t, b: n, a }) {
  return { r: e, g: t, b: n, a: Be(a * 1.7 + 0.22, 0, 1) };
}
function Ra(e, t) {
  const n = 0.4 + Be(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - Be(t, 0, 100) / 100) };
}
function Pa(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, s = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? Be(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * s * Math.max(t.glareFactor, 0) / 100;
  return Be(i ** (0.1 + Be(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const Pl = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function Cl(e, t, n) {
  const a = Be(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), c = s - l, o = i - l, u = 8, p = [];
  for (let h = 0; h <= u; h++) {
    const m = h / u * (Math.PI / 2);
    p.push([l * Math.cos(m) ** (2 / a), l * Math.sin(m) ** (2 / a)]);
  }
  const w = [], g = (h, m, x, d) => {
    let _ = Math.atan2(h, -m);
    _ < 0 && (_ += Math.PI * 2);
    let k = Math.atan2(d, x);
    k < 0 && (k += Math.PI * 2);
    const R = Ae(Pa(k, n), 3);
    w.push(`rgba(255, 255, 255, ${R}) ${Ae(_ / (Math.PI * 2) * 100, 2)}%`);
  };
  g(0, -i, 0, 1);
  for (const [h, m, x] of Pl)
    for (let d = 0; d <= u; d++) {
      const [_, k] = p[x ? u - d : d];
      g(h * (c + _), m * (o + k), h * _ ** (a - 1), -m * k ** (a - 1));
    }
  return w.push(`rgba(255, 255, 255, ${Ae(Pa(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${w.join(", ")})`;
}
function fa() {
  const e = Ot, t = document.documentElement.style, n = Ra(e.refFresnelRange, e.refFresnelHardness), a = Ra(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Ae(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Ae(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", bt(e.tint)), t.setProperty("--glass-tint-light", bt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", bt(Aa(e.tint))), t.setProperty("--glass-tint-sheet-light", bt(Aa(e.tintLight))), t.setProperty("--glass-ctl-dark", bt(e.control)), t.setProperty("--glass-ctl-light", bt(e.controlLight)), t.setProperty("--glass-text-dark", bt(e.ink)), t.setProperty("--glass-text-light", bt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", bt(e.tally)), t.setProperty("--glass-tint-tally-light", bt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", bt(e.tallyInk)), t.setProperty("--glass-text-tally-light", bt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Ae(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Ae(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Ae(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Ae(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Ae(e.shadowX)}px ${Ae(-e.shadowY)}px ${Ae(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Ae(Be(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Ae(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Ae(Math.log2(Be(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Ae(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Ae(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Ae(Be(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Ae(a.width)}px`), t.setProperty("--glass-glare-blur", `${Ae(a.blur)}px`);
}
function Be(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function Nl(e, t, n, a, s, i) {
  const l = Math.abs(e) - n + s, c = Math.abs(t) - a + s, o = Math.max(l, 0), u = Math.max(c, 0), p = i === 2 ? Math.hypot(o, u) : (o ** i + u ** i) ** (1 / i);
  return Math.min(Math.max(l, c), 0) + p - s;
}
function Ol(e, t, n) {
  const a = e / 2, s = t / 2, i = Be(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), c = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), u = (g, h) => Nl(g - a, h - s, a, s, l, i), p = 256, w = new Float32Array(p + 1);
  for (let g = 0; g <= p; g++) {
    const h = 1 - g / p, m = Math.asin(Be(h * h, 0, 1)), x = Math.asin(Be(Math.sin(m) / o, 0, 1));
    w[g] = Math.tan(m - x) * c;
  }
  return (g, h) => {
    const m = -u(g, h);
    if (m < 0 || m >= c) return null;
    const x = w[Math.round(m / c * p)];
    if (x === 0) return null;
    const d = 0.75, _ = u(g + d, h) - u(g - d, h), k = u(g, h + d) - u(g, h - d), R = Math.hypot(_, k);
    if (R === 0) return null;
    const I = -x / R;
    return { dx: _ * I, dy: k * I };
  };
}
function Il(e, t, n) {
  const a = document.createElement("canvas");
  a.width = e, a.height = t;
  const s = a.getContext("2d"), i = s.createImageData(e, t), l = i.data, c = e * t, o = new Float32Array(c), u = new Float32Array(c);
  let p = 0;
  for (let g = 0; g < t; g++)
    for (let h = 0; h < e; h++) {
      const m = n(h + 0.5, g + 0.5);
      if (!m) continue;
      const x = g * e + h;
      o[x] = m.dx, u[x] = m.dy;
      const d = Math.hypot(m.dx, m.dy);
      d > p && (p = d);
    }
  const w = p > 0 ? 127 / p : 0;
  for (let g = 0; g < c; g++) {
    const h = g * 4;
    l[h] = 128 + Be(Math.round(o[g] * w), -127, 127), l[h + 1] = 128 + Be(Math.round(u[g] * w), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: a.toDataURL(), scale: p * 2 };
}
const Lr = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function Dr(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Ae(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let Kn = null, Fl = 0;
function zl() {
  if (Kn) return Kn;
  const e = document.createElementNS(Zr, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), Kn = document.createElementNS(Zr, "defs"), e.appendChild(Kn), document.body.appendChild(e), Kn;
}
function Cn(e) {
  const t = `glass-refract-${++Fl}`, n = document.createElementNS(Zr, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), zl().appendChild(n);
  let a = 0, s = 0, i = 0, l = 0;
  const c = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, u = "";
  function p() {
    e.style.setProperty("--glass-pre", Ot.blurEdge ? "" : u), e.style.setProperty("--glass-post", Ot.blurEdge ? u : "");
  }
  function w() {
    a < 2 || s < 2 || e.style.setProperty("--glass-glare", Cl(a, s, Ot));
  }
  function g() {
    if (a < 2 || s < 2) return;
    const d = Ot, _ = Il(a, s, Ol(a, s, d)), k = d.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(a)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${a}" height="${s}" preserveAspectRatio="none" href="${_.url}" result="map"/>` + Dr(_.scale * (1 + k), Lr[0], "r") + Dr(_.scale, Lr[1], "g") + Dr(_.scale * (1 - k), Lr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, u = `url(#${n.id})`, p(), getComputedStyle(e).backdropFilter.includes("url(") || (u = "", p()), o = c.map((R) => Ot[R]).join(" ");
  }
  function h() {
    l || (l = requestAnimationFrame(() => {
      l = 0, g();
    }));
  }
  const m = new ResizeObserver(([d]) => {
    const _ = d.borderBoxSize?.[0], k = _ ? { w: Math.round(_.inlineSize), h: Math.round(_.blockSize) } : { w: Math.round(d.contentRect.width), h: Math.round(d.contentRect.height) };
    k.w === a && k.h === s || (a = k.w, s = k.h, w(), h());
  });
  m.observe(e);
  const x = Ml(() => {
    w(), c.map((d) => Ot[d]).join(" ") !== o ? h() : p();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), x(), m.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const xs = "photos.stack", jr = { on: !1, window: 4 }, ks = 1, Ss = 10;
function Ll() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(xs) ?? "");
  } catch {
    return { ...jr };
  }
  if (e === null || typeof e != "object") return { ...jr };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= ks && t <= Ss ? t : jr.window
  };
}
function Dl(e) {
  return localStorage.setItem(xs, JSON.stringify({ on: e.on, window: e.window })), e;
}
const Es = "photos.theme", Ts = "dark";
function Ms() {
  return document.documentElement.dataset.theme === "light" ? "light" : Ts;
}
function jl() {
  const e = localStorage.getItem(Es), t = e === "dark" || e === "light" ? e : Ts;
  return document.documentElement.dataset.theme = t, t;
}
function As(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(Es, e), e;
}
var Hl = /* @__PURE__ */ N('<div class="glass marks svelte-zne36e"><span class="pair svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span></span> <button class="menu small svelte-zne36e" title="Copy the conditions and the marked ids to the clipboard">Share</button> <button class="menu small svelte-zne36e">Clear</button></div>'), ql = /* @__PURE__ */ N('<span class="spin svelte-zne36e" aria-label="loading"></span>'), Ca = /* @__PURE__ */ N('<span class="badge svelte-zne36e"> </span>'), Bl = /* @__PURE__ */ N('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), Ul = /* @__PURE__ */ N('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), $l = /* @__PURE__ */ N("<button> </button>"), Gl = /* @__PURE__ */ N('<div class="glass sheet sorts svelte-zne36e"></div>'), Wl = /* @__PURE__ */ N(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), Yl = /* @__PURE__ */ N('<p class="muted svelte-zne36e">loading…</p>'), Vl = /* @__PURE__ */ N('<span class="help svelte-zne36e">?</span>'), Xl = /* @__PURE__ */ N('<span class="n svelte-zne36e"> </span>'), Kl = /* @__PURE__ */ N("<button> <!></button>"), Jl = /* @__PURE__ */ N('<span class="muted svelte-zne36e">nothing here</span>'), Zl = /* @__PURE__ */ N('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Ql = /* @__PURE__ */ N('<div class="glass sheet filters svelte-zne36e"><!></div>'), eo = /* @__PURE__ */ N('<div class="topbar svelte-zne36e"><div class="panes svelte-zne36e"><!> <div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <button role="switch" title="Mark tiles by clicking them, then copy their ids">Select</button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function to(e, t) {
  pt(t, !0);
  let n = te(t, "facets", 3, null), a = te(t, "selected", 19, () => ({})), s = te(t, "sort", 3, "newest"), i = te(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = te(t, "total", 3, null), c = te(t, "tiles", 3, null), o = te(t, "loading", 3, !1), u = te(t, "selecting", 3, !1), p = te(t, "marked", 19, () => ({ stacks: 0, photos: 0 })), w = te(t, "onselect", 3, () => {
  }), g = te(t, "onsort", 3, () => {
  }), h = te(t, "onstack", 3, () => {
  }), m = te(t, "onclear", 3, () => {
  }), x = te(t, "onselecting", 3, () => {
  }), d = te(t, "onshare", 3, () => {
  }), _ = te(t, "onunmark", 3, () => {
  }), k = te(t, "ontriage", 3, () => {
  }), R = /* @__PURE__ */ Y(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), I = /* @__PURE__ */ Y(Ce(Ms())), j = /* @__PURE__ */ Y(null);
  const G = /* @__PURE__ */ ne(() => c() ?? l()), V = /* @__PURE__ */ ne(() => n()?.dimensions ?? []), J = /* @__PURE__ */ ne(() => n()?.sorts ?? []), q = /* @__PURE__ */ ne(() => r(J).find((z) => z.value === s())?.label ?? s()), L = /* @__PURE__ */ ne(() => Object.values(a()).reduce((z, re) => z + re.length, 0)), M = /* @__PURE__ */ ne(() => r(V).flatMap((z) => (a()[z.name] ?? []).map((re) => ({
    dimension: z.name,
    value: re,
    title: z.title,
    label: z.options.find((ue) => ue.value === re)?.label ?? String(re)
  }))));
  function v(z, re) {
    const ue = a()[z] ?? [], Ne = ue.includes(re) ? ue.filter((pe) => pe !== re) : [...ue, re];
    w()(z, Ne);
  }
  function C(z, re) {
    return (a()[z] ?? []).includes(re);
  }
  function U() {
    S(I, As(r(I) === "dark" ? "light" : "dark"), !0);
  }
  let D = /* @__PURE__ */ Y(null);
  const $ = /* @__PURE__ */ ne(() => r(D) ?? i().window);
  function Z(z) {
    S(D, Number(z), !0);
  }
  function ie(z) {
    S(D, null), h()({ ...i(), window: Number(z) });
  }
  Ut(() => {
    r(R) !== "stacks" && S(D, null);
  });
  function ee(z) {
    z.key === "Escape" && S(R, "");
  }
  function W(z) {
    r(R) && !z.target.closest(".topbar") && S(R, "");
  }
  Yn(() => {
    const z = new ResizeObserver(([re]) => {
      const ue = Math.round(re.borderBoxSize?.[0]?.blockSize ?? re.contentRect.height);
      document.documentElement.style.setProperty("--header-h", ue + "px");
    });
    return z.observe(r(j)), () => {
      z.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var O = eo();
  Ln("keydown", kn, ee), Ln("pointerdown", kn, W);
  var X = f(O), E = f(X);
  {
    var y = (z) => {
      var re = Hl(), ue = f(re), Ne = f(ue), pe = f(Ne), fe = b(Ne, 2), Le = f(fe), rt = b(fe, 2), T = f(rt), B = b(rt, 2), _e = f(B), Oe = b(ue, 2), Ie = b(Oe, 2);
      Rn(re, (at) => Cn?.(at)), H(
        (at, qt) => {
          A(pe, at), A(Le, p().stacks === 1 ? "stack" : "stacks"), A(T, qt), A(_e, p().photos === 1 ? "photo" : "photos");
        },
        [() => Ee(p().stacks), () => Ee(p().photos)]
      ), Q("click", Oe, () => d()()), Q("click", Ie, () => _()()), P(z, re);
    };
    K(E, (z) => {
      p().stacks && z(y);
    });
  }
  var F = b(E, 2), ae = f(F), be = f(ae), ge = b(ae, 2), he = f(ge), Ue = b(ge, 2);
  {
    var me = (z) => {
      var re = ql();
      P(z, re);
    };
    K(Ue, (z) => {
      o() && z(me);
    });
  }
  Rn(F, (z) => Cn?.(z));
  var ke = b(X, 2), $e = f(ke), ze = f($e), Pe = f(ze);
  let ce;
  var le = f(Pe), we = b(Pe, 2);
  let Te;
  var Ze = b(f(we));
  {
    var Qe = (z) => {
      var re = Ca(), ue = f(re);
      H(() => A(ue, r(L))), P(z, re);
    };
    K(Ze, (z) => {
      r(L) && z(Qe);
    });
  }
  var Ye = b(we, 2);
  let Et;
  var Wt = b(f(Ye));
  {
    var fn = (z) => {
      var re = Ca(), ue = f(re);
      H((Ne) => A(ue, Ne), [() => Ee(l())]), P(z, re);
    };
    K(Wt, (z) => {
      i().on && l() !== null && z(fn);
    });
  }
  var et = b(Ye, 2);
  let tt;
  var Tt = b(et, 2);
  {
    var jt = (z) => {
      var re = Ul(), ue = f(re);
      Ke(ue, 17, () => r(M), (pe) => pe.dimension + " " + pe.value, (pe, fe) => {
        var Le = Bl(), rt = f(Le), T = f(rt), B = b(rt, 1, !0);
        H(() => {
          se(Le, "title", `${r(fe).title ?? ""}: ${r(fe).label ?? ""} — click to remove`), A(T, r(fe).title), A(B, r(fe).label);
        }), Q("click", Le, () => v(r(fe).dimension, r(fe).value)), P(pe, Le);
      });
      var Ne = b(ue, 2);
      Q("click", Ne, () => m()()), P(z, re);
    };
    K(Tt, (z) => {
      r(M).length && z(jt);
    });
  }
  var nt = b(ze, 2), tn = f(nt), Mt = b(nt, 2);
  Rn($e, (z) => Cn?.(z));
  var At = b($e, 2);
  {
    var dt = (z) => {
      var re = Gl();
      Ke(re, 21, () => r(J), yt, (ue, Ne) => {
        var pe = $l();
        let fe;
        var Le = f(pe);
        H(() => {
          fe = ye(pe, 1, "option svelte-zne36e", null, fe, { on: r(Ne).value === s() }), A(Le, r(Ne).label);
        }), Q("click", pe, () => {
          g()(r(Ne).value), S(R, "");
        }), P(ue, pe);
      }), Rn(re, (ue) => Cn?.(ue)), P(z, re);
    };
    K(At, (z) => {
      r(R) === "sort" && z(dt);
    });
  }
  var Ve = b(At, 2);
  {
    var _t = (z) => {
      var re = Wl(), ue = f(re), Ne = b(f(ue), 2), pe = f(Ne);
      let fe;
      var Le = f(pe), rt = b(ue, 2), T = b(f(rt), 2), B = f(T), _e = b(B, 2), Oe = f(_e);
      Rn(re, (Ie) => Cn?.(Ie)), H(() => {
        fe = ye(pe, 1, "option svelte-zne36e", null, fe, { on: i().on }), se(pe, "aria-checked", i().on), A(Le, i().on ? "On" : "Off"), se(B, "min", ks), se(B, "max", Ss), hn(B, r($)), se(B, "aria-valuetext", `${r($) ?? ""} seconds`), A(Oe, `${r($) ?? ""}s`);
      }), Q("click", pe, () => h()({ ...i(), on: !i().on })), Q("input", B, (Ie) => Z(Ie.currentTarget.value)), Q("change", B, (Ie) => ie(Ie.currentTarget.value)), P(z, re);
    };
    K(Ve, (z) => {
      r(R) === "stacks" && z(_t);
    });
  }
  var Ht = b(Ve, 2);
  {
    var it = (z) => {
      var re = Ql(), ue = f(re);
      {
        var Ne = (fe) => {
          var Le = Yl();
          P(fe, Le);
        }, pe = (fe) => {
          var Le = ca(), rt = ct(Le);
          Ke(rt, 17, () => r(V), yt, (T, B) => {
            var _e = Zl(), Oe = f(_e), Ie = f(Oe), at = b(Ie);
            {
              var qt = (Se) => {
                var Me = Vl();
                H(() => se(Me, "title", r(B).hint)), P(Se, Me);
              };
              K(at, (Se) => {
                r(B).hint && Se(qt);
              });
            }
            var nn = b(Oe, 2), lt = f(nn);
            Ke(lt, 17, () => r(B).options, yt, (Se, Me) => {
              var ft = Kl();
              let Rt;
              var Yt = f(ft), rn = b(Yt);
              {
                var xe = (Fe) => {
                  var Pt = Xl(), Ge = f(Pt);
                  H((Xe) => A(Ge, Xe), [() => Ee(r(Me).count)]), P(Fe, Pt);
                };
                K(rn, (Fe) => {
                  r(Me).count !== null && Fe(xe);
                });
              }
              H(
                (Fe) => {
                  Rt = ye(ft, 1, "option svelte-zne36e", null, Rt, Fe), A(Yt, `${r(Me).label ?? ""} `);
                },
                [
                  () => ({ on: C(r(B).name, r(Me).value) })
                ]
              ), Q("click", ft, () => v(r(B).name, r(Me).value)), P(Se, ft);
            });
            var Sn = b(lt, 2);
            {
              var En = (Se) => {
                var Me = Jl();
                P(Se, Me);
              };
              K(Sn, (Se) => {
                r(B).options.length || Se(En);
              });
            }
            H(() => A(Ie, `${r(B).title ?? ""} `)), P(T, _e);
          }), P(fe, Le);
        };
        K(ue, (fe) => {
          n() ? fe(pe, -1) : fe(Ne);
        });
      }
      Rn(re, (fe) => Cn?.(fe)), P(z, re);
    };
    K(Ht, (z) => {
      r(R) === "filters" && z(it);
    });
  }
  xr(O, (z) => S(j, z), () => r(j)), H(
    (z) => {
      A(be, z), A(he, r(G) === 1 ? "photo" : "photos"), ce = ye(Pe, 1, "menu svelte-zne36e", null, ce, { open: r(R) === "sort" }), se(Pe, "aria-expanded", r(R) === "sort"), A(le, r(q)), Te = ye(we, 1, "menu svelte-zne36e", null, Te, { open: r(R) === "filters", on: r(L) > 0 }), se(we, "aria-expanded", r(R) === "filters"), Et = ye(Ye, 1, "menu svelte-zne36e", null, Et, { open: r(R) === "stacks", on: i().on }), se(Ye, "aria-expanded", r(R) === "stacks"), tt = ye(et, 1, "menu svelte-zne36e", null, tt, { on: u() }), se(et, "aria-checked", u()), se(nt, "title", r(I) === "dark" ? "Switch to a white background" : "Switch to a black background"), se(nt, "aria-label", r(I) === "dark" ? "Switch to a white background" : "Switch to a black background"), A(tn, r(I) === "dark" ? "☀" : "☾");
    },
    [() => r(G) === null ? "…" : Ee(r(G))]
  ), Q("click", Pe, () => S(R, r(R) === "sort" ? "" : "sort", !0)), Q("click", we, () => S(R, r(R) === "filters" ? "" : "filters", !0)), Q("click", Ye, () => S(R, r(R) === "stacks" ? "" : "stacks", !0)), Q("click", et, () => x()(!u())), Q("click", nt, U), Q("click", Mt, () => k()()), P(e, O), gt();
}
Dt(["click", "input", "change"]);
const Ct = 4, kr = 220, no = 340;
function Sr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function ro(e, t, n, a, s) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, c = 0, o = 1 / 0;
    for (; l < e.length && (c += Sr(e[l]), l++, o = (n - Ct * (l - i - 1)) / c, !(o <= kr)); )
      ;
    if (o > kr && !a) break;
    s(i, l, Math.round(Math.min(o, no))), i = l;
  }
  return i;
}
function ao(e, t, n) {
  const a = [];
  let s = 0;
  for (let i = e.from; i < e.to; i++) {
    const c = i === e.to - 1 ? n - s : Math.round(Sr(t[i]) * e.height);
    a.push({ index: i, x: s, w: c }), s += c + Ct;
  }
  return a;
}
function Na(e, t, n) {
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
var so = /* @__PURE__ */ N('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), io = /* @__PURE__ */ N('<div class="glass pane svelte-5g1i2z" role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div></div>');
function lo(e, t) {
  pt(t, !0);
  let n = te(t, "frames", 19, () => []), a = te(t, "origin", 3, null), s = te(t, "onreveal", 3, () => {
  }), i = te(t, "onclose", 3, () => {
  });
  const l = 40, c = /* @__PURE__ */ ne(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let o = /* @__PURE__ */ Y(0), u = /* @__PURE__ */ Y(0), p = /* @__PURE__ */ Y(null), w = /* @__PURE__ */ Y(Ce(/* @__PURE__ */ new Set()));
  const g = 4, h = 25, m = { x: 0, y: 0, w: 0, h: 0 }, x = /* @__PURE__ */ ne(() => Math.max(0, r(o) - l * 2)), d = /* @__PURE__ */ ne(() => Math.max(0, r(u) - l * 2)), _ = /* @__PURE__ */ ne(() => r(x) > 0 && r(d) > 0 ? j(n(), r(x), r(d)) : n().map(() => m));
  function k(M, v, C) {
    const U = [];
    let D = 0, $ = 0;
    for (let Z = 0; Z < M.length; Z++)
      $ += Sr(M[Z]), $ * C + Ct * (Z - D) >= v && (U.push({ from: D, to: Z + 1, sum: $ }), D = Z + 1, $ = 0);
    return D < M.length && U.push({ from: D, to: M.length, sum: $ }), U;
  }
  function R(M, v, C) {
    return M.map((U, D) => {
      const $ = (v - Ct * (U.to - U.from - 1)) / U.sum;
      return D === M.length - 1 && $ > C ? C : $;
    });
  }
  function I(M, v, C) {
    return R(M, v, C).reduce((U, D) => U + D, 0) + Ct * (M.length - 1);
  }
  function j(M, v, C) {
    let U = g, D = Math.max(g, C);
    for (let W = 0; W < h; W++) {
      const O = (U + D) / 2;
      I(k(M, v, O), v, O) <= C ? U = O : D = O;
    }
    const $ = k(M, v, U), Z = R($, v, U), ie = [];
    let ee = (C - (Z.reduce((W, O) => W + O, 0) + Ct * ($.length - 1))) / 2;
    return $.forEach((W, O) => {
      const X = Z[O], E = [];
      for (let ae = W.from; ae < W.to; ae++) E.push(Sr(M[ae]) * X);
      const y = E.reduce((ae, be) => ae + be, 0) + Ct * (E.length - 1);
      let F = (v - y) / 2;
      for (const ae of E)
        ie.push({
          x: Math.round(F),
          y: Math.round(ee),
          w: Math.round(ae),
          h: Math.round(X)
        }), F += ae + Ct;
      ee += X + Ct;
    }), ie;
  }
  function G(M) {
    if (!a() || !M || !M.w || !M.h) return "none";
    const v = a().left - (l + M.x), C = a().top - (l + M.y);
    return `translate(${v}px, ${C}px) scale(${a().width / M.w}, ${a().height / M.h})`;
  }
  function V(M) {
    M.key === "Escape" && i()();
  }
  function J(M) {
    M.target.closest(".frame") || i()();
  }
  Yn(() => {
    const M = document.activeElement;
    return r(p)?.focus(), () => {
      M instanceof HTMLElement && document.contains(M) && M.focus();
    };
  });
  var q = io();
  Ln("keydown", kn, V), Ln("pointerdown", kn, J);
  var L = f(q);
  gn(L, "", {}, { inset: "40px" }), Ke(L, 23, n, (M) => M.id, (M, v, C) => {
    var U = so();
    let D;
    var $ = f(U);
    let Z;
    H(
      (ie, ee) => {
        D = gn(U, "", D, ie), se($, "src", `/d/${r(v).s ?? ""}.webp`), Z = ye($, 1, "svelte-5g1i2z", null, Z, ee);
      },
      [
        () => ({
          left: `${r(_)[r(C)].x ?? ""}px`,
          top: `${r(_)[r(C)].y ?? ""}px`,
          width: `${r(_)[r(C)].w ?? ""}px`,
          height: `${r(_)[r(C)].h ?? ""}px`,
          "--flight": G(r(_)[r(C)])
        }),
        () => ({ loaded: r(w).has(r(v).id) })
      ]
    ), Q("click", U, () => s()(r(v))), Ln("load", $, () => S(w, new Set(r(w)).add(r(v).id), !0)), P(M, U);
  }), xr(q, (M) => S(p, M), () => r(p)), H(() => se(q, "aria-label", r(c))), Jr("innerWidth", (M) => S(o, M, !0)), Jr("innerHeight", (M) => S(u, M, !0)), P(e, q), gt();
}
Dt(["click"]);
var oo = /* @__PURE__ */ N('<span class="err svelte-uzy12d"> </span>'), co = /* @__PURE__ */ N(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), uo = /* @__PURE__ */ N(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), fo = /* @__PURE__ */ N('<span class="muted svelte-uzy12d"> </span>'), ho = /* @__PURE__ */ N('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function vo(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ Y(null), a = /* @__PURE__ */ Y(!1), s = /* @__PURE__ */ Y(null);
  async function i() {
    S(a, !0), S(s, null);
    try {
      S(n, await De.probe(), !0);
    } catch (h) {
      S(s, String(h), !0);
    } finally {
      S(a, !1);
    }
  }
  var l = ho(), c = f(l), o = f(c), u = b(c, 2);
  {
    var p = (h) => {
      var m = oo(), x = f(m);
      H(() => A(x, r(s))), P(h, m);
    }, w = (h) => {
      var m = ca(), x = ct(m);
      {
        var d = (k) => {
          var R = co(), I = b(f(R), 2);
          H(
            (j) => A(I, ` above are formats the header
        reader cannot measure (${j ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), P(k, R);
        }, _ = (k) => {
          var R = uo(), I = f(R), j = f(I), G = b(I, 2), V = f(G);
          H(
            (J) => {
              A(j, J), A(V, r(n).command);
            },
            [() => Ee(r(n).worklist)]
          ), P(k, R);
        };
        K(x, (k) => {
          r(n).worklist === 0 ? k(d) : k(_, -1);
        });
      }
      P(h, m);
    }, g = (h) => {
      var m = fo(), x = f(m);
      H(() => A(x, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), P(h, m);
    };
    K(u, (h) => {
      r(s) ? h(p) : r(n) ? h(w, 1) : h(g, -1);
    });
  }
  H(() => {
    c.disabled = r(a), A(o, r(a) ? "counting…" : "Check the dimension probe's worklist");
  }), Q("click", c, i), P(e, l), gt();
}
Dt(["click"]);
var po = /* @__PURE__ */ N('<p class="bad svelte-1xjbga"> </p>'), go = /* @__PURE__ */ N('<pre class="svelte-1xjbga"> </pre>'), _o = /* @__PURE__ */ N('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), bo = /* @__PURE__ */ N(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), mo = /* @__PURE__ */ N('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), wo = /* @__PURE__ */ N('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), yo = /* @__PURE__ */ N(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), xo = /* @__PURE__ */ N('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), ko = /* @__PURE__ */ N(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function So(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ Y(null), a = /* @__PURE__ */ Y(!1), s = /* @__PURE__ */ Y(null), i = /* @__PURE__ */ Y(null);
  const l = /* @__PURE__ */ ne(() => r(n)?.state === "running"), c = /* @__PURE__ */ ne(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const k = await De.rebuildStatus();
      S(n, k, !0), S(s, null), k.state === "done" && k.started_at !== r(i) && (S(i, k.started_at, !0), t.oncomplete?.());
    } catch (k) {
      S(s, String(k), !0);
    }
  }
  Yn(() => {
    o();
  }), Ut(() => {
    if (!r(l)) return;
    const k = setInterval(o, 700);
    return () => clearInterval(k);
  });
  async function u() {
    S(a, !0), S(s, null);
    try {
      S(n, await De.rebuild(), !0);
    } catch (k) {
      S(s, String(k), !0);
    }
  }
  function p(k) {
    k.key === "Escape" && S(a, !1);
  }
  var w = ko();
  Ln("keydown", kn, p);
  var g = ct(w), h = f(g), m = f(h), x = b(h, 2), d = b(g, 2);
  {
    var _ = (k) => {
      var R = xo(), I = ct(R), j = b(I, 2), G = f(j), V = b(f(G), 4), J = f(V), q = b(V, 2), L = b(G, 2);
      {
        var M = (ee) => {
          var W = po(), O = f(W);
          H(() => A(O, r(s))), P(ee, W);
        };
        K(L, (ee) => {
          r(s) && ee(M);
        });
      }
      var v = b(L, 2);
      Ke(v, 17, () => r(n)?.steps ?? [], yt, (ee, W) => {
        var O = _o();
        let X;
        var E = f(O), y = f(E), F = f(y);
        {
          var ae = (ce) => {
            var le = In("✓");
            P(ce, le);
          }, be = (ce) => {
            var le = In("✕");
            P(ce, le);
          }, ge = (ce) => {
            var le = In("·");
            P(ce, le);
          }, he = (ce) => {
            var le = In(" ");
            P(ce, le);
          };
          K(F, (ce) => {
            r(W).state === "done" ? ce(ae) : r(W).state === "failed" ? ce(be, 1) : r(W).state === "running" ? ce(ge, 2) : ce(he, -1);
          });
        }
        var Ue = b(y, 2), me = f(Ue), ke = b(Ue, 4), $e = f(ke), ze = b(E, 2);
        {
          var Pe = (ce) => {
            var le = go(), we = f(le);
            H((Te) => A(we, Te), [() => r(W).log.join(`
`)]), P(ce, le);
          };
          K(ze, (ce) => {
            r(W).log.length && ce(Pe);
          });
        }
        H(() => {
          X = ye(O, 1, "step svelte-1xjbga", null, X, {
            on: r(W).state === "running",
            bad: r(W).state === "failed"
          }), A(me, r(W).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), A($e, r(W).seconds === null ? "" : r(W).seconds + "s");
        }), P(ee, O);
      });
      var C = b(v, 2);
      {
        var U = (ee) => {
          var W = bo(), O = ct(W), X = f(O);
          H(() => A(X, r(n).error)), P(ee, W);
        }, D = (ee) => {
          var W = mo();
          P(ee, W);
        }, $ = (ee) => {
          var W = wo();
          P(ee, W);
        };
        K(C, (ee) => {
          r(n)?.state === "failed" ? ee(U) : r(n)?.state === "done" ? ee(D, 1) : r(l) && ee($, 2);
        });
      }
      var Z = b(C, 2);
      {
        var ie = (ee) => {
          var W = yo(), O = b(f(W), 6), X = f(O);
          H(() => A(X, `python -m photolib.restore_state ${r(c) ?? ""}`)), P(ee, W);
        };
        K(Z, (ee) => {
          r(c) && ee(ie);
        });
      }
      H(() => A(J, `${r(n)?.seconds ?? 0 ?? ""}s`)), Q("click", I, () => S(a, !1)), Q("click", q, () => S(a, !1)), P(k, R);
    };
    K(d, (k) => {
      r(a) && k(_);
    });
  }
  H(() => {
    h.disabled = r(l), A(m, r(l) ? "applying…" : "Apply to grid"), x.disabled = !r(n) || r(n).state === "idle";
  }), Q("click", h, u), Q("click", x, () => S(a, !0)), P(e, w), gt();
}
Dt(["click"]);
var Eo = /* @__PURE__ */ N('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), Oa = /* @__PURE__ */ N("<option> </option>"), To = /* @__PURE__ */ N('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), Mo = /* @__PURE__ */ N('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), Ao = /* @__PURE__ */ N('<div class="none muted svelte-bqi9ky"> </div>'), Ro = /* @__PURE__ */ N('<div class="bar svelte-bqi9ky"><!></div>');
function Po(e, t) {
  pt(t, !0);
  let n = te(t, "candidate", 3, null), a = te(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), c = /* @__PURE__ */ ne(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ ne(() => !!n() && n().op !== "is null");
  function u(x, d) {
    const _ = { ...n(), [x]: d };
    if (x === "column") {
      const k = i[d] ?? ["="];
      k.includes(_.op) || (_.op = k[0]), _.value = l.has(d) ? 0 : "";
    }
    x === "op" && d === "is null" && (_.value = null), x === "value" && l.has(_.column) && (_.value = Number(d) || 0), t.onedit(_);
  }
  var p = Ro(), w = f(p);
  {
    var g = (x) => {
      var d = Eo(), _ = f(d), k = f(_), R = b(_, 2), I = f(R);
      H(() => {
        A(k, `${t.screen.title ?? ""} does not save a rule.`), A(I, t.screen.blurb);
      }), P(x, d);
    }, h = (x) => {
      var d = Mo(), _ = ct(d), k = f(_);
      Ke(k, 21, () => s, yt, (O, X) => {
        var E = Oa(), y = f(E), F = {};
        H(() => {
          A(y, r(X)), F !== (F = r(X)) && (E.value = (E.__value = r(X)) ?? "");
        }), P(O, E);
      });
      var R;
      ur(k);
      var I = b(k, 2);
      Ke(I, 21, () => r(c), yt, (O, X) => {
        var E = Oa(), y = f(E), F = {};
        H(() => {
          A(y, r(X)), F !== (F = r(X)) && (E.value = (E.__value = r(X)) ?? "");
        }), P(O, E);
      });
      var j;
      ur(I);
      var G = b(I, 2);
      {
        var V = (O) => {
          var X = To();
          H(() => hn(X, n().value ?? "")), Q("input", X, (E) => u("value", E.currentTarget.value)), P(O, X);
        };
        K(G, (O) => {
          r(o) && O(V);
        });
      }
      var J = b(G, 2), q = f(J);
      q.value = q.__value = "exclude";
      var L = b(q);
      L.value = L.__value = "include";
      var M;
      ur(J);
      var v = b(J, 2), C = f(v);
      C.value = C.__value = "end";
      var U = b(C);
      U.value = U.__value = "0";
      var D;
      ur(v);
      var $ = b(v, 2), Z = f($), ie = b($, 2), ee = b(_, 2), W = f(ee);
      H(
        (O, X) => {
          R !== (R = n().column) && (k.value = (k.__value = n().column) ?? "", er(k, n().column)), j !== (j = n().op) && (I.value = (I.__value = n().op) ?? "", er(I, n().op)), M !== (M = n().decision ?? "exclude") && (J.value = (J.__value = n().decision ?? "exclude") ?? "", er(J, n().decision ?? "exclude")), D !== (D = O) && (v.value = (v.__value = O) ?? "", er(v, O)), $.disabled = a(), A(Z, a() ? "saving…" : "Confirm"), A(W, `${X ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => pl(n())
        ]
      ), Q("change", k, (O) => u("column", O.currentTarget.value)), Q("change", I, (O) => u("op", O.currentTarget.value)), Q("change", J, (O) => u("decision", O.currentTarget.value)), Q("change", v, (O) => u("at", O.currentTarget.value)), Q("click", $, function(...O) {
        t.onconfirm?.apply(this, O);
      }), Q("click", ie, function(...O) {
        t.onclear?.apply(this, O);
      }), P(x, d);
    }, m = (x) => {
      var d = Ao(), _ = f(d);
      H(() => A(_, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), P(x, d);
    };
    K(w, (x) => {
      t.screen.rule === !1 ? x(g) : n() ? x(h, 1) : x(m, -1);
    });
  }
  P(e, p), gt();
}
Dt(["change", "input", "click"]);
var Co = /* @__PURE__ */ N('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), No = /* @__PURE__ */ N('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), Oo = /* @__PURE__ */ N('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), Io = /* @__PURE__ */ N('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function Fo(e, t) {
  pt(t, !0);
  let n = te(t, "rules", 19, () => []), a = te(t, "unmatched", 3, null), s = te(t, "busy", 3, !1);
  var i = Io(), l = f(i), c = b(f(l)), o = f(c), u = b(l, 2);
  {
    var p = (m) => {
      var x = Co();
      P(m, x);
    };
    K(u, (m) => {
      n().length === 0 && m(p);
    });
  }
  var w = b(u, 2);
  Ke(w, 19, n, (m) => m.id, (m, x, d) => {
    var _ = No();
    let k;
    var R = f(_), I = f(R), j = f(I), G = b(I, 2), V = f(G), J = b(G, 2), q = f(J), L = b(R, 2), M = f(L), v = f(M), C = b(M, 2), U = f(C), D = b(C, 4), $ = b(D, 2), Z = b($, 2);
    H(
      (ie, ee) => {
        k = ye(_, 1, "rule svelte-aof9c2", null, k, { exclude: r(x).decision === "exclude" }), A(j, r(d)), A(V, r(x).predicate), A(q, r(x).decision), A(v, `${ie ?? ""} paths`), A(U, ee), D.disabled = s() || r(d) === 0, $.disabled = s() || r(d) === n().length - 1, Z.disabled = s();
      },
      [
        () => Ee(r(x).paths),
        () => Nt(r(x).bytes)
      ]
    ), Q("click", D, () => t.onmove(r(x), r(d) - 1)), Q("click", $, () => t.onmove(r(x), r(d) + 1)), Q("click", Z, () => t.ondelete(r(x))), P(m, _);
  });
  var g = b(w, 2);
  {
    var h = (m) => {
      var x = Oo(), d = b(f(x), 2), _ = f(d), k = f(_), R = b(_, 2), I = f(R);
      H(
        (j, G) => {
          A(k, `${j ?? ""} paths`), A(I, G);
        },
        [
          () => Ee(a().paths),
          () => Nt(a().bytes)
        ]
      ), P(m, x);
    };
    K(g, (m) => {
      a() && m(h);
    });
  }
  H(() => A(o, `${n().length ?? ""} rules · top-down, first match wins`)), P(e, i), gt();
}
Dt(["click"]);
function zo(e) {
  return { key: e.id, ids: (e.m ?? [e]).map((t) => t.id) };
}
function Lo(e, t) {
  const n = e.filter((a) => a.key !== t.key);
  return n.length === e.length ? [...e, t] : n;
}
function Do(e) {
  return {
    stacks: e.length,
    photos: e.reduce((t, n) => t + n.ids.length, 0)
  };
}
function jo(e) {
  const t = e.stacking.on ? e.stacking.window + "s" : "off", n = Object.entries(e.filters).filter(([, a]) => a.length > 0).sort(([a], [s]) => a < s ? -1 : a > s ? 1 : 0).map(([a, s]) => a + ":" + s.join("|"));
  return `stack=${t} sort=${e.sort} filters=${n.length ? n.join(",") : "none"}`;
}
function Ho(e, t) {
  const n = t.map((a) => "[" + a.ids.join(",") + "]").join(",");
  return jo(e) + `
` + n;
}
const Ia = 2500, qo = 1, Bo = 2, Uo = 3e7, Hr = /* @__PURE__ */ new WeakMap();
function $o(e, t, n) {
  const a = [], s = [], i = /* @__PURE__ */ new Map(), l = [], c = [];
  let o = 0, u = 0, p = null, w = null, g = null, h = !1, m = !1, x = 0, d = 0, _ = 0, k = n.onState || (() => {
  });
  function R(E) {
    x <= 0 || (o = ro(a, o, x, E, (y, F, ae) => {
      s.push({ top: u, height: ae, from: y, to: F }), u += ae + Ct;
    }), j());
  }
  function I() {
    if (w === null || h || x <= 0 || o >= w) return 0;
    const E = s.length ? o / s.length : Math.max(1, x / kr), y = s.length ? u / s.length : kr + Ct, F = Math.round((w - o) / E * y);
    return Math.max(0, Math.min(F, Uo - u));
  }
  function j() {
    e.style.height = u + I() + "px", t.style.top = Math.max(0, u - 1) + "px";
  }
  function G() {
    return window.scrollY - e.offsetTop;
  }
  function V() {
    const E = l.pop();
    if (E) return E;
    const y = document.createElement("div");
    y.className = "tile";
    const F = document.createElement("img");
    return F.decoding = "async", F.addEventListener("load", () => y.classList.add("loaded")), F.addEventListener("error", () => y.classList.add("missing")), y.appendChild(F), Hr.set(y, F), n.extend && n.extend(y), y;
  }
  function J(E, y) {
    Hr.get(y).removeAttribute("src"), y.classList.remove("loaded", "missing", "error"), y.style.backgroundImage = "", y.remove(), i.delete(E), l.push(y);
  }
  function q(E, y, F, ae, be, ge) {
    let he = i.get(E);
    const Ue = a[E];
    if (!he) {
      he = V(), he.dataset.index = String(E);
      const me = Hr.get(he);
      me.fetchPriority = ge ? "high" : "low", me.src = "/t/" + Ue.s + ".webp", c.push(E), n.fill && n.fill(he, Ue), e.appendChild(he), i.set(E, he);
    }
    he.style.width = ae + "px", he.style.height = be + "px", he.style.transform = "translate(" + y + "px," + F + "px)";
  }
  function L(E, y) {
    y.th && (y.url === void 0 && (y.url = n.thumbHash(y.th)), y.url && (E.style.backgroundImage = "url(" + y.url + ")"));
  }
  function M() {
    _ = 0;
    for (const E of c) {
      const y = i.get(E);
      y && !y.classList.contains("loaded") && L(y, a[E]);
    }
    c.length = 0;
  }
  function v(E, y) {
    for (const F of ao(E, a, x))
      q(F.index, F.x, E.top, F.w, E.height, y);
  }
  function C() {
    const E = window.innerHeight, y = G(), F = Na(s, y - E * qo, y + E * (1 + Bo));
    if (!F) return;
    const ae = s[F[0]].from, be = s[F[1]].to;
    for (const [ge, he] of Array.from(i))
      (ge < ae || ge >= be) && J(ge, he);
    for (let ge = F[0]; ge <= F[1]; ge++) {
      const he = s[ge];
      v(he, he.top < y + E && he.top + he.height > y);
    }
    c.length && !_ && (_ = requestAnimationFrame(M));
  }
  function U() {
    return x <= 0 ? !1 : u - (G() + window.innerHeight) < Ia;
  }
  async function D() {
    if (m || h) return;
    m = !0;
    const E = d;
    k({ loading: !0, count: a.length, exhausted: h, total: w, tiles: g });
    try {
      do {
        const y = await n.fetchPage(p);
        if (E !== d) return;
        for (const F of y.photos) a.push(F);
        p = y.next, h = p === null, typeof y.stacks == "number" ? (w = y.stacks, g = typeof y.total == "number" ? y.total : null) : typeof y.total == "number" && (w = y.total), R(h), C(), k({ loading: !0, count: a.length, exhausted: h, total: w, tiles: g });
      } while (!h && U());
    } catch (y) {
      E === d && k({ error: String(y) });
    } finally {
      E === d && (m = !1, k({ loading: !1, count: a.length, exhausted: h, total: w, tiles: g }));
    }
  }
  let $ = 0;
  function Z() {
    $ || ($ = requestAnimationFrame(() => {
      $ = 0, C(), U() && D();
    }));
  }
  function ie() {
    const E = e.clientWidth;
    if (E === x) return;
    const y = Na(s, G(), G()), F = y ? s[y[0]].from : 0;
    x = E;
    for (const [be, ge] of Array.from(i)) J(be, ge);
    s.length = 0, o = 0, u = 0, R(h), C();
    const ae = s.find((be) => be.to > F);
    ae && window.scrollTo(0, ae.top + e.offsetTop), U() && D();
  }
  function ee(E) {
    const y = E.target.closest(".tile");
    if (!y || !e.contains(y)) return;
    const F = a[Number(y.dataset.index)];
    F && n.activate && n.activate(F, E, y);
  }
  e.addEventListener("click", ee), window.addEventListener("scroll", Z, { passive: !0 });
  let W = 0;
  const O = new ResizeObserver(() => {
    clearTimeout(W), W = setTimeout(ie, 100);
  });
  O.observe(e);
  const X = new IntersectionObserver(
    (E) => {
      E.some((y) => y.isIntersecting) && D();
    },
    { rootMargin: "0px 0px " + Ia + "px 0px" }
  );
  return X.observe(t), x = e.clientWidth, D(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      d++, m = !1;
      for (const [E, y] of Array.from(i)) J(E, y);
      a.length = 0, s.length = 0, c.length = 0, o = 0, u = 0, p = null, w = null, g = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), D();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(E) {
      const y = typeof E == "number" ? E : null;
      y !== w && (w = y, j(), k({ total: w }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [E, y] of i) n.fill(y, a[E]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(E) {
      for (const [y, F] of i)
        a[y] === E && n.fill && n.fill(F, E);
    },
    destroy() {
      d++, e.removeEventListener("click", ee), window.removeEventListener("scroll", Z), O.disconnect(), X.disconnect(), clearTimeout(W), cancelAnimationFrame(_);
    }
  };
}
function Go(e) {
  try {
    const t = Uint8Array.from(atob(e), (v) => v.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, a = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, c = (n >> 18 & 31) / 31, o = n >> 23, u = (a >> 3 & 63) / 63, p = (a >> 9 & 63) / 63, w = a >> 15, g = Math.max(3, w ? o ? 5 : 7 : a & 7), h = Math.max(3, w ? a & 7 : o ? 5 : 7);
    let m = o ? 6 : 5, x = 0;
    const d = (v, C, U) => {
      const D = [];
      for (let $ = 0; $ < C; $++)
        for (let Z = $ ? 0 : 1; Z * C < v * (C - $); Z++) {
          const ie = t[m + (x >> 1)] >> ((x++ & 1) << 2) & 15;
          D.push((ie / 7.5 - 1) * U);
        }
      return D;
    }, _ = d(g, h, c), k = d(3, 3, u * 1.25), R = d(3, 3, p * 1.25), I = g / h, j = Math.max(1, Math.round(I > 1 ? 32 : 32 * I)), G = Math.max(1, Math.round(I > 1 ? 32 / I : 32)), V = document.createElement("canvas");
    V.width = j, V.height = G;
    const J = V.getContext("2d"), q = J.createImageData(j, G), L = [], M = [];
    for (let v = 0, C = 0; v < G; v++)
      for (let U = 0; U < j; U++, C += 4) {
        let D = s, $ = i, Z = l;
        for (let O = 0; O < g; O++) L[O] = Math.cos(Math.PI / j * (U + 0.5) * O);
        for (let O = 0; O < h; O++) M[O] = Math.cos(Math.PI / G * (v + 0.5) * O);
        for (let O = 0, X = 0; O < h; O++)
          for (let E = O ? 0 : 1; E * h < g * (h - O); E++, X++)
            D += _[X] * L[E] * M[O] * 2;
        for (let O = 0, X = 0; O < 3; O++)
          for (let E = O ? 0 : 1; E < 3 - O; E++, X++) {
            const y = L[E] * M[O] * 2;
            $ += k[X] * y, Z += R[X] * y;
          }
        const ie = D - 2 / 3 * $, ee = (3 * D - ie + Z) / 2, W = ee - Z;
        q.data[C] = Math.max(0, Math.min(255, Math.round(255 * ee))), q.data[C + 1] = Math.max(0, Math.min(255, Math.round(255 * W))), q.data[C + 2] = Math.max(0, Math.min(255, Math.round(255 * ie))), q.data[C + 3] = 255;
      }
    return J.putImageData(q, 0, 0), V.toDataURL();
  } catch {
    return null;
  }
}
var Wo = /* @__PURE__ */ N('<main id="canvas"><div id="sentinel"></div></main>');
function Yo(e, t) {
  pt(t, !0);
  let n = te(t, "key", 3, ""), a = te(t, "total", 3, null), s = te(t, "triage", 3, !1), i = te(t, "excludedDirs", 19, () => []), l = te(t, "selecting", 3, !1), c = te(t, "marked", 19, () => []), o = te(t, "onActivate", 3, () => {
  }), u = te(t, "onOverride", 3, async () => null), p = te(t, "onExcludeFolder", 3, () => {
  }), w = te(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ Y(null), h = /* @__PURE__ */ Y(null), m = null, x = "";
  const d = /* @__PURE__ */ ne(() => new Set(c())), _ = { null: "exclude", exclude: "include", include: "clear" };
  function k(v) {
    const C = v.toLowerCase().startsWith(Un.toLowerCase()) ? v.slice(Un.length + 1) : v;
    return C.length > 64 ? "…" + C.slice(-64) : C;
  }
  function R(v) {
    const C = document.createElement("div");
    C.className = "tile-path", v.appendChild(C);
    const U = document.createElement("button");
    U.className = "chip", U.type = "button", v.appendChild(U);
    const D = document.createElement("button");
    D.className = "dirchip", D.type = "button", D.textContent = "dir", v.appendChild(D);
  }
  function I(v, C) {
    const U = v.querySelector(".tile-path");
    U && (U.textContent = C.p ? k(C.p) : "");
    const D = v.querySelector(".dirchip");
    if (D) {
      const Z = ws(C.p ?? ""), ie = Z !== "" && da(i(), Z);
      D.hidden = Z === "", D.disabled = ie, D.dataset.state = ie ? "exclude" : "none", D.title = ie ? `already excluded: ${Z}` : `exclude everything under ${Z}, subfolders included — one exclude rule at the end of the order`;
    }
    const $ = v.querySelector(".chip");
    $ && ($.dataset.state = C.o || "none", $.textContent = C.o === "exclude" ? "drop" : C.o === "include" ? "keep" : "·", $.title = C.o === "exclude" ? "overridden: excluded — click to keep" : C.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  function j(v) {
    const C = document.createElement("span");
    C.className = "tick", v.appendChild(C);
  }
  function G(v, C) {
    v.dataset.marked = r(d).has(C.id) ? "on" : "off";
  }
  Yn(() => (m = $o(r(g), r(h), {
    fetchPage: (v) => t.fetchPage(v),
    thumbHash: Go,
    extend: s() ? R : j,
    fill: s() ? I : G,
    onState: (v) => w()(v),
    activate: async (v, C, U) => {
      if (C.target.closest(".dirchip")) {
        p()(v);
        return;
      }
      if (!C.target.closest(".chip")) {
        o()(v, U);
        return;
      }
      const D = _[v.o ?? "null"];
      v.o = await u()(v, D), I(U, v);
    }
  }), x = n(), () => m?.destroy())), Ut(() => {
    const v = n(), C = a();
    m && (v !== x && (x = v, m.reset()), m.setTotal(C));
  });
  let V = "";
  Ut(() => {
    const v = i().join(`
`);
    !m || v === V || (V = v, m.refill());
  });
  let J = "";
  Ut(() => {
    const v = c().join(",");
    !m || v === J || (J = v, m.refill());
  });
  var q = Wo();
  let L;
  var M = f(q);
  xr(M, (v) => S(h, v), () => r(h)), xr(q, (v) => S(g, v), () => r(g)), H(() => L = ye(q, 1, "", null, L, { selecting: l() })), P(e, q), gt();
}
var Vo = /* @__PURE__ */ N('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Xo = /* @__PURE__ */ N('<th class="num svelte-1v3p82v"> </th>'), Ko = /* @__PURE__ */ N('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Jo = /* @__PURE__ */ N('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Zo = /* @__PURE__ */ N('<td class="num svelte-1v3p82v"> </td>'), Qo = /* @__PURE__ */ N('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), ec = /* @__PURE__ */ N('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function tc(e, t) {
  pt(t, !0);
  let n = te(t, "rows", 19, () => []), a = te(t, "rules", 19, () => []), s = te(t, "root", 3, null), i = te(t, "selected", 3, null), l = te(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const c = /* @__PURE__ */ ne(() => t.screen.rule !== !1);
  function o(x) {
    return t.screen.label ? t.screen.label(x) : x.key;
  }
  const u = /* @__PURE__ */ ne(() => new Map(n().map((x) => [
    x.key,
    t.screen.rule === !1 ? null : ys(a(), t.screen.toRule(x, s()))
  ]))), p = { exclude: "✕", include: "✓" }, w = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var g = ca(), h = ct(g);
  {
    var m = (x) => {
      var d = ec(), _ = f(d), k = f(_), R = f(k);
      {
        var I = (L) => {
          var M = Vo();
          P(L, M);
        };
        K(R, (L) => {
          r(c) && L(I);
        });
      }
      var j = b(R), G = f(j), V = b(j, 3);
      {
        var J = (L) => {
          var M = Xo(), v = f(M);
          H(() => A(v, t.screen.heading[1])), P(L, M);
        };
        K(V, (L) => {
          t.screen.heading[1] && L(J);
        });
      }
      var q = b(_);
      Ke(q, 23, n, (L) => L.key, (L, M, v) => {
        const C = /* @__PURE__ */ ne(() => r(u).get(r(M).key));
        var U = Qo();
        let D;
        var $ = f(U);
        {
          var Z = (me) => {
            const ke = /* @__PURE__ */ ne(() => l().has(r(M).key));
            var $e = Ko(), ze = f($e);
            let Pe;
            var ce = f(ze);
            H(
              (le) => {
                Pe = ye(ze, 1, "tick svelte-1v3p82v", null, Pe, { on: r(ke) }), se(ze, "aria-checked", r(ke)), se(ze, "aria-label", `select ${le ?? ""}`), A(ce, r(ke) ? "✓" : "");
              },
              [() => o(r(M))]
            ), Q("click", ze, (le) => {
              le.stopPropagation(), t.oncheck(r(M), r(v), le.shiftKey);
            }), P(me, $e);
          };
          K($, (me) => {
            r(c) && me(Z);
          });
        }
        var ie = b($), ee = f(ie);
        let W;
        var O = f(ee), X = b(ee), E = b(X);
        {
          var y = (me) => {
            var ke = Jo();
            P(me, ke);
          };
          K(E, (me) => {
            r(M).scope === "whole inventory" && me(y);
          });
        }
        var F = b(ie), ae = f(F), be = b(F), ge = f(be), he = b(be);
        {
          var Ue = (me) => {
            var ke = Zo(), $e = f(ke);
            H(() => A($e, r(M).detail ?? "")), P(me, ke);
          };
          K(he, (me) => {
            t.screen.heading[1] && me(Ue);
          });
        }
        H(
          (me, ke, $e) => {
            D = ye(U, 1, "svelte-1v3p82v", null, D, {
              picked: i() === r(M).key,
              clickable: t.screen.sheet !== !1
            }), W = ye(ee, 1, "mark svelte-1v3p82v", null, W, {
              exclude: r(C) === "exclude",
              include: r(C) === "include"
            }), se(ee, "title", w[r(C)] ?? ""), A(O, p[r(C)] ?? ""), A(X, `${me ?? ""} `), A(ae, ke), A(ge, $e);
          },
          [
            () => o(r(M)),
            () => Ee(r(M).paths),
            () => Nt(r(M).bytes)
          ]
        ), Q("click", U, () => t.onpick(r(M))), P(L, U);
      }), H(() => A(G, t.screen.heading[0] ?? "")), P(x, d);
    };
    K(h, (x) => {
      n().length && x(m);
    });
  }
  P(e, g), gt();
}
Dt(["click"]);
var nc = /* @__PURE__ */ N('<button class="twisty svelte-pucy57"> </button>'), rc = /* @__PURE__ */ N('<span class="twisty leaf svelte-pucy57">·</span>'), ac = /* @__PURE__ */ N('<span class="name root svelte-pucy57"> </span>'), sc = /* @__PURE__ */ N('<button class="name svelte-pucy57"> </button>'), ic = /* @__PURE__ */ N('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), lc = /* @__PURE__ */ N('<div class="note svelte-pucy57"> </div>'), oc = /* @__PURE__ */ N('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), cc = /* @__PURE__ */ N('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), uc = /* @__PURE__ */ N('<div class="tree svelte-pucy57"></div>');
function dc(e, t) {
  pt(t, !0);
  let n = te(t, "version", 3, 0), a = te(t, "excludedDirs", 19, () => []), s = te(t, "selected", 3, null), i = te(t, "busy", 3, !1), l = /* @__PURE__ */ Y(Ce(/* @__PURE__ */ new Map())), c = /* @__PURE__ */ Y(Ce(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ Y(Ce(/* @__PURE__ */ new Set())), u = /* @__PURE__ */ Y(Ce(/* @__PURE__ */ new Set()));
  async function p(d) {
    S(o, new Set(r(o)).add(d), !0);
    const _ = await t.onload(d), k = new Map(r(l)), R = new Set(r(u));
    _ ? (k.set(d, _), R.delete(d)) : R.add(d), S(l, k, !0), S(u, R, !0), S(o, new Set([...r(o)].filter((I) => I !== d)), !0);
  }
  function w(d) {
    if (r(c).has(d)) {
      S(c, new Set([...r(c)].filter((_) => _ !== d)), !0);
      return;
    }
    S(c, new Set(r(c)).add(d), !0), r(l).has(d) || p(d);
  }
  let g = -1;
  Ut(() => {
    const d = n();
    if (d !== g) {
      g = d, r(c).has(t.root) || S(c, new Set(r(c)).add(t.root), !0);
      for (const _ of r(c)) p(_);
    }
  });
  const h = /* @__PURE__ */ ne(() => {
    const d = [], _ = (j, G, V, J, q, L) => {
      const M = r(l).get(j), v = r(c).has(j);
      if (d.push({
        key: j,
        name: G,
        depth: V,
        paths: J,
        bytes: q,
        deeper: L,
        expanded: v,
        here: M?.here ?? null,
        truncated: !!M?.truncated,
        loading: r(o).has(j),
        failed: r(u).has(j),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: da(a(), j)
      }), !(!v || !M))
        for (const C of M.children)
          _(C.path, C.name, V + 1, C.paths, C.bytes, C.deeper);
    }, k = r(l).get(t.root), R = k ? k.children.reduce((j, G) => j + G.paths, 0) + k.here.paths : 0, I = k ? k.children.reduce((j, G) => j + G.bytes, 0) + k.here.bytes : 0;
    return _(t.root, t.root, 0, R, I, !0), d;
  }), m = 8;
  var x = uc();
  Ke(x, 21, () => r(h), (d) => d.key, (d, _) => {
    var k = cc(), R = ct(k);
    let I;
    var j = f(R);
    let G;
    var V = b(j, 2);
    {
      var J = (E) => {
        var y = nc(), F = f(y);
        H(() => {
          se(y, "aria-expanded", r(_).expanded), se(y, "aria-label", `${r(_).expanded ? "collapse" : "expand"} ${r(_).name ?? ""}`), se(y, "title", r(_).expanded ? "collapse" : "expand"), A(F, r(_).loading ? "·" : r(_).expanded ? "▾" : "▸");
        }), Q("click", y, () => w(r(_).key)), P(E, y);
      }, q = (E) => {
        var y = rc();
        P(E, y);
      };
      K(V, (E) => {
        r(_).deeper ? E(J) : E(q, -1);
      });
    }
    var L = b(V, 2);
    {
      var M = (E) => {
        var y = ac(), F = f(y);
        H(() => A(F, r(_).key)), P(E, y);
      }, v = (E) => {
        var y = sc(), F = f(y);
        H(() => {
          se(y, "title", `Show every kept file under ${r(_).key ?? ""}`), A(F, r(_).name);
        }), Q("click", y, () => t.onpick(r(_))), P(E, y);
      };
      K(L, (E) => {
        r(_).depth === 0 ? E(M) : E(v, -1);
      });
    }
    var C = b(L, 2), U = f(C), D = b(C, 2), $ = f(D), Z = b(D, 2), ie = b(R, 2);
    {
      var ee = (E) => {
        var y = ic();
        let F;
        H((ae) => F = gn(y, "", F, ae), [
          () => ({
            "padding-left": `${Math.min(r(_).depth, m) * 11 + 18}px`
          })
        ]), P(E, y);
      }, W = (E) => {
        var y = lc();
        let F;
        var ae = f(y);
        H(
          (be, ge, he) => {
            F = gn(y, "", F, be), A(ae, `${ge ?? ""} directly here · ${he ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(_).depth, m) * 11 + 18}px`
            }),
            () => Ee(r(_).here.paths),
            () => Nt(r(_).here.bytes)
          ]
        ), P(E, y);
      };
      K(ie, (E) => {
        r(_).expanded && r(_).failed ? E(ee) : r(_).expanded && r(_).here && r(_).here.paths > 0 && E(W, 1);
      });
    }
    var O = b(ie, 2);
    {
      var X = (E) => {
        var y = oc();
        let F;
        H((ae) => F = gn(y, "", F, ae), [
          () => ({
            "padding-left": `${Math.min(r(_).depth, m) * 11 + 18}px`
          })
        ]), P(E, y);
      };
      K(O, (E) => {
        r(_).truncated && E(X);
      });
    }
    H(
      (E, y, F) => {
        I = ye(R, 1, "row svelte-pucy57", null, I, {
          picked: s() === r(_).key,
          gone: r(_).excluded
        }), G = gn(j, "", G, E), A(U, y), A($, F), Z.disabled = i() || r(_).excluded || r(_).depth === 0, se(Z, "title", r(_).depth === 0 ? "The library root is not excludable from here." : r(_).excluded ? "already excluded" : `Exclude everything under ${r(_).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(_).depth, m) * 11}px` }),
        () => Ee(r(_).paths),
        () => Nt(r(_).bytes)
      ]
    ), Q("click", Z, () => t.onexclude(r(_))), P(d, k);
  }), P(e, x), gt();
}
Dt(["click"]);
var fc = /* @__PURE__ */ N('<button title="Back to its default">↺</button>'), hc = /* @__PURE__ */ N('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), vc = /* @__PURE__ */ N('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), pc = /* @__PURE__ */ N('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), gc = /* @__PURE__ */ N('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), _c = /* @__PURE__ */ N('<li><code class="svelte-1hh0fwb"> </code> </li>'), bc = /* @__PURE__ */ N(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), mc = /* @__PURE__ */ N('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function wc(e, t) {
  pt(t, !0);
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
        ["headerSide", "Sides", 0, (v) => Math.floor(v / 2), 1],
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
  let c = /* @__PURE__ */ Y(Ce(Tl())), o = /* @__PURE__ */ Y(!0), u = /* @__PURE__ */ Y(!1), p = /* @__PURE__ */ Y(Ce(Ms())), w = /* @__PURE__ */ Y(Ce(window.innerWidth));
  const g = (v) => r(p) === "light" ? v.light : v.dark, h = (v) => v in vn ? vn : on, m = (v) => `rgba(${v.r}, ${v.g}, ${v.b}, ${v.a})`, x = /* @__PURE__ */ ne(() => JSON.stringify(r(c), null, 2));
  Yn(() => {
    const v = localStorage.getItem(n);
    if (v)
      try {
        S(c, zr(JSON.parse(v)), !0);
        return;
      } catch {
      }
    fa();
  });
  function d(v) {
    S(c, zr({ ...r(c), ...v }), !0), localStorage.setItem(n, JSON.stringify(r(c))), S(u, !1);
  }
  function _(v) {
    S(c, zr(v), !0), localStorage.setItem(n, JSON.stringify(r(c))), S(u, !1);
  }
  function k(v) {
    d({ [v]: h(v)[v] });
  }
  function R() {
    S(p, As(r(p) === "dark" ? "light" : "dark"), !0);
  }
  async function I() {
    await navigator.clipboard.writeText(r(x)), S(u, !0);
  }
  var j = mc();
  let G;
  var V = f(j), J = b(f(V), 4), q = f(J), L = b(V, 2);
  {
    var M = (v) => {
      var C = bc();
      {
        const ze = (ce, le = dr, we = dr, Te = dr) => {
          var Ze = fc();
          let Qe;
          H(() => {
            Qe = ye(Ze, 1, "undo svelte-1hh0fwb", null, Qe, { idle: !we() }), se(Ze, "aria-label", `Reset ${le() ?? ""}`);
          }), Q("click", Ze, function(...Ye) {
            Te()?.apply(this, Ye);
          }), P(ce, Ze);
        };
        var U = b(f(C), 2);
        Ke(U, 17, () => a, yt, (ce, le) => {
          var we = vc(), Te = f(we), Ze = f(Te), Qe = b(Te, 2), Ye = f(Qe), Et = b(Qe, 2);
          Ke(Et, 17, () => r(le).rows, yt, (Wt, fn) => {
            var et = /* @__PURE__ */ ne(() => Cr(r(fn), 5));
            let tt = () => r(et)[0], Tt = () => r(et)[1], jt = () => r(et)[2], nt = () => r(et)[3], tn = () => r(et)[4];
            const Mt = /* @__PURE__ */ ne(() => r(c)[tt()] !== h(tt())[tt()]), At = /* @__PURE__ */ ne(() => typeof nt() == "function" ? nt()(r(w)) : nt());
            var dt = hc();
            let Ve;
            var _t = f(dt), Ht = f(_t), it = b(_t, 2), z = b(it, 2), re = b(z, 2);
            ze(re, Tt, () => r(Mt), () => () => k(tt())), H(() => {
              Ve = ye(dt, 1, "row svelte-1hh0fwb", null, Ve, { moved: r(Mt) }), A(Ht, Tt()), se(it, "min", jt()), se(it, "max", r(At)), se(it, "step", tn()), se(it, "aria-label", Tt()), hn(it, r(c)[tt()]), se(z, "min", jt()), se(z, "max", r(At)), se(z, "step", tn()), se(z, "aria-label", `${Tt() ?? ""} value`), hn(z, r(c)[tt()]);
            }), Q("input", it, (ue) => d({ [tt()]: Number(ue.currentTarget.value) })), Q("input", z, (ue) => d({ [tt()]: Number(ue.currentTarget.value) })), P(Wt, dt);
          }), H(() => {
            A(Ze, r(le).title), A(Ye, r(le).note);
          }), P(ce, we);
        });
        var D = b(U, 2), $ = f(D), Z = b(D, 2), ie = f(Z), ee = b(Z, 2);
        Ke(ee, 17, () => El, yt, (ce, le) => {
          const we = /* @__PURE__ */ ne(() => g(r(le))), Te = /* @__PURE__ */ ne(() => r(c)[r(we)]), Ze = /* @__PURE__ */ ne(() => r(le).base[r(we)]);
          var Qe = gc(), Ye = f(Qe), Et = f(Ye), Wt = b(Et), fn = f(Wt), et = b(Ye, 2), tt = f(et), Tt = b(et, 2);
          Ke(Tt, 17, () => i, yt, (Mt, At) => {
            var dt = /* @__PURE__ */ ne(() => Cr(r(At), 3));
            let Ve = () => r(dt)[0], _t = () => r(dt)[1], Ht = () => r(dt)[2];
            const it = /* @__PURE__ */ ne(() => r(Te)[Ve()] !== r(Ze)[Ve()]);
            var z = pc();
            let re;
            var ue = f(z), Ne = f(ue), pe = b(ue, 2), fe = b(pe, 2), Le = b(fe, 2);
            ze(Le, _t, () => r(it), () => () => d({
              [r(we)]: { ...r(Te), [Ve()]: r(Ze)[Ve()] }
            })), H(() => {
              re = ye(z, 1, "row svelte-1hh0fwb", null, re, { moved: r(it) }), A(Ne, _t()), se(pe, "max", Ht()), se(pe, "step", Ht() === 1 ? 0.01 : 1), se(pe, "aria-label", `${r(p) ?? ""} ${s[r(le).dark].title ?? ""} ${_t() ?? ""}`), hn(pe, r(Te)[Ve()]), se(fe, "max", Ht()), se(fe, "step", Ht() === 1 ? 0.01 : 1), se(fe, "aria-label", `${r(p) ?? ""} ${s[r(le).dark].title ?? ""} ${_t() ?? ""} value`), hn(fe, r(Te)[Ve()]);
            }), Q("input", pe, (rt) => d({
              [r(we)]: {
                ...r(Te),
                [Ve()]: Number(rt.currentTarget.value)
              }
            })), Q("input", fe, (rt) => d({
              [r(we)]: {
                ...r(Te),
                [Ve()]: Number(rt.currentTarget.value)
              }
            })), P(Mt, z);
          });
          var jt = b(Tt, 2);
          let nt;
          var tn = f(jt);
          H(
            (Mt, At) => {
              A(Et, `${s[r(le).dark].title ?? ""} `), A(fn, r(p)), A(tt, s[r(le).dark].note), nt = gn(jt, "", nt, Mt), A(tn, At);
            },
            [
              () => ({ background: m(r(Te)) }),
              () => m(r(Te))
            ]
          ), P(ce, Qe);
        });
        var W = b(ee, 2), O = b(f(W), 4);
        let Pe;
        var X = f(O), E = f(X), y = b(X, 2);
        ze(y, () => "Blur at the edge", () => r(c).blurEdge !== vn.blurEdge, () => () => k("blurEdge"));
        var F = b(W, 2), ae = b(f(F), 4);
        Ke(ae, 21, () => l, yt, (ce, le) => {
          var we = /* @__PURE__ */ ne(() => Cr(r(le), 2));
          let Te = () => r(we)[0], Ze = () => r(we)[1];
          var Qe = _c(), Ye = f(Qe), Et = f(Ye), Wt = b(Ye);
          H(() => {
            A(Et, Te()), A(Wt, ` — ${Ze() ?? ""}`);
          }), P(ce, Qe);
        });
        var be = b(F, 2), ge = b(f(be), 4), he = f(ge), Ue = b(he, 2), me = b(Ue, 2), ke = f(me), $e = b(ge, 2);
        H(() => {
          A($, `The five colours below are per theme, and you are editing the ${r(p) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), A(ie, `Edit the ${r(p) === "dark" ? "light" : "dark"} colours`), Pe = ye(O, 1, "row toggle svelte-1hh0fwb", null, Pe, { moved: r(c).blurEdge !== vn.blurEdge }), cl(E, r(c).blurEdge), A(ke, r(u) ? "Copied" : "Copy"), hn($e, r(x));
        }), Q("click", Z, R), Q("change", E, (ce) => d({ blurEdge: ce.currentTarget.checked })), Q("click", he, () => _(on)), Q("click", Ue, () => _(vn)), Q("click", me, I);
      }
      P(v, C);
    };
    K(L, (v) => {
      r(o) && v(M);
    });
  }
  H(() => {
    G = ye(j, 1, "tuner svelte-1hh0fwb", null, G, { folded: !r(o) }), se(J, "title", r(o) ? "Fold away" : "Open"), A(q, r(o) ? "–" : "+");
  }), Jr("innerWidth", (v) => S(w, v, !0)), Q("click", J, () => S(o, !r(o))), P(e, j), gt();
}
Dt(["click", "input", "change"]);
var yc = /* @__PURE__ */ N('<button><span class="n svelte-1n46o8q"> </span> </button>'), xc = /* @__PURE__ */ N('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), kc = /* @__PURE__ */ N('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), Sc = /* @__PURE__ */ N('<div class="muted pad svelte-1n46o8q">loading…</div>'), Ec = /* @__PURE__ */ N('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), Tc = /* @__PURE__ */ N('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), Mc = /* @__PURE__ */ N('<p class="blurb"> </p>'), Ac = /* @__PURE__ */ N('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), Rc = /* @__PURE__ */ N('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), Pc = /* @__PURE__ */ N('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), Cc = /* @__PURE__ */ N('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), Nc = /* @__PURE__ */ N("<div> </div>"), Oc = /* @__PURE__ */ N('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function Ic(e, t) {
  pt(t, !0);
  const n = location.pathname === "/tune";
  let a = /* @__PURE__ */ Y("grid"), s = /* @__PURE__ */ Y(0), i = /* @__PURE__ */ Y(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ Y(Ce([])), c = /* @__PURE__ */ Y(null), o = /* @__PURE__ */ Y(null), u = /* @__PURE__ */ Y(Ce(/* @__PURE__ */ new Set())), p = /* @__PURE__ */ Y(null), w = /* @__PURE__ */ Y(null), g = /* @__PURE__ */ Y(null), h = /* @__PURE__ */ Y(null), m = /* @__PURE__ */ Y(!1), x = /* @__PURE__ */ Y(!1), d = /* @__PURE__ */ Y(!1), _ = /* @__PURE__ */ Y(!1), k = /* @__PURE__ */ Y(Ce({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), R = /* @__PURE__ */ Y(null), I = /* @__PURE__ */ Y(0), j = /* @__PURE__ */ Y(null), G = /* @__PURE__ */ Y(Ce({})), V = /* @__PURE__ */ Y("newest"), J = /* @__PURE__ */ Y(Ce(Ll())), q = /* @__PURE__ */ Y(null), L = /* @__PURE__ */ Y(!1), M = /* @__PURE__ */ Y(Ce([]));
  const v = /* @__PURE__ */ ne(() => Ma[r(s)]), C = /* @__PURE__ */ ne(() => r(v).table !== !1), U = /* @__PURE__ */ ne(() => r(C) || r(v).tree === !0), D = /* @__PURE__ */ ne(() => r(v).sheet !== !1 && (r(o) !== null || !r(U))), $ = /* @__PURE__ */ ne(() => ({
    sort: r(V),
    ...r(J).on ? { stack: r(J).window } : {},
    ...Object.fromEntries(Object.entries(r(G)).filter(([, T]) => T.length > 0))
  })), Z = /* @__PURE__ */ ne(() => r(M).map((T) => T.key)), ie = /* @__PURE__ */ ne(() => Do(r(M)));
  Ut(() => {
    r($), un(() => {
      S(M, [], !0);
    });
  });
  const ee = /* @__PURE__ */ ne(() => r(a) === "grid" ? `grid:${JSON.stringify(r($))}` : `triage:${r(s)}:${JSON.stringify(r(o))}`), W = /* @__PURE__ */ ne(() => r(v).rule === !1 || r(u).size === 0 ? [] : r(l).filter((T) => r(u).has(T.key)).map((T) => r(v).toRule(T, r(i))).filter((T) => T && ys(r(w)?.rules ?? [], T) !== "exclude")), O = /* @__PURE__ */ ne(() => (r(w)?.rules ?? []).filter((T) => T.decision === "exclude" && T.term?.column === "dir_under").map((T) => String(T.term.value).replace(/[\\/]+$/, "").toLowerCase())), X = hl();
  function E(T) {
    S(R, String(T), !0);
  }
  async function y(T) {
    try {
      return S(R, null), await T();
    } catch (B) {
      return E(B), null;
    }
  }
  const F = vl(
    () => {
      S(x, !0), y(async () => {
        const T = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: B, value: _e } = await X(() => De.counts(r(o), T));
        B || S(w, _e, !0);
      }).finally(() => {
        S(x, !1);
      });
    },
    220
  );
  async function ae() {
    S(g, "loading");
    const T = await y(() => De.files());
    S(g, T, !0), S(m, !1), S(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function be(T = !1) {
    if (r(a) !== "triage" || !r(C)) {
      S(l, [], !0);
      return;
    }
    S(_, !0);
    const B = r(v).name === "source_folder" && r(i) ? { root: r(i) } : {};
    T && (B.live = "1");
    const _e = await y(() => De.screen(r(v).name, B));
    S(l, _e?.rows ?? [], !0), S(_, !1);
  }
  let ge = !1;
  Ut(() => {
    r(s), r(a), un(() => {
      S(c, null), S(o, null), S(i, null), ke(), r(a) === "triage" && (be(), F.now(), ge || (ge = !0, ae()));
    });
  }), Ut(() => {
    r(i), un(() => {
      r(a) === "triage" && (ke(), be());
    });
  }), Yn(() => {
    y(async () => {
      S(j, await De.facets(), !0);
    });
  });
  function he(T, B) {
    S(G, { ...r(G), [T]: B }, !0);
  }
  function Ue(T) {
    if (r(v).sheet !== !1) {
      if (r(v).drill && !r(i)) {
        S(c, T.key, !0), S(
          o,
          {
            ...r(v).toRule(T, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), S(i, T.key, !0);
        return;
      }
      S(c, T.key, !0), S(
        o,
        {
          ...r(v).toRule(T, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), F();
    }
  }
  function me(T, B, _e) {
    const Oe = new Set(r(u)), Ie = !Oe.has(T.key), at = _e && r(p) !== null ? r(l).findIndex((lt) => lt.key === r(p)) : -1, [qt, nn] = at < 0 ? [B, B] : at < B ? [at, B] : [B, at];
    for (let lt = qt; lt <= nn; lt++)
      Ie ? Oe.add(r(l)[lt].key) : Oe.delete(r(l)[lt].key);
    S(u, Oe, !0), S(p, T.key, !0);
  }
  function ke() {
    S(u, /* @__PURE__ */ new Set(), !0), S(p, null);
  }
  function $e(T) {
    S(o, T, !0), S(
      c,
      null
      // it no longer corresponds to a row
    ), F();
  }
  function ze(T = !1) {
    S(o, null), S(c, null), T && S(i, null), F.now();
  }
  async function Pe() {
    S(
      m,
      !0
      // the distinct-content number now says so on its face
    ), Ni(I), await be(), F.now();
  }
  async function ce() {
    if (!r(o)) return;
    S(d, !0);
    const T = r(o).at === "end" ? void 0 : 0, B = await y(() => De.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(v).id} ${r(v).title}`
      },
      T
    ));
    S(d, !1), B && (S(o, null), S(c, null), await Pe());
  }
  async function le() {
    const T = r(W);
    if (!T.length) {
      ke();
      return;
    }
    S(d, !0);
    for (const B of T)
      if (!await y(() => De.addRule({
        column: B.column,
        op: B.op,
        value: B.value,
        decision: "exclude",
        note: `screen ${r(v).id} ${r(v).title}`
      }))) break;
    S(d, !1), ke(), S(o, null), S(c, null), await Pe();
  }
  async function we(T) {
    if (!T || da(r(O), T)) return;
    S(d, !0);
    const B = await y(() => De.addRule({
      column: "dir_under",
      op: "=",
      value: T,
      decision: "exclude",
      note: `screen ${r(v).id} ${r(v).title}`
    }));
    S(d, !1), B && await Pe();
  }
  const Te = (T) => we(ws(T.p ?? "")), Ze = (T) => we(T.key);
  async function Qe(T) {
    S(d, !0), await y(() => De.deleteRule(T.id)), S(d, !1), await Pe();
  }
  async function Ye(T, B) {
    S(d, !0), await y(() => De.moveRule(T.id, B)), S(d, !1), await Pe();
  }
  async function Et() {
    await y(async () => {
      S(j, await De.facets(), !0);
    });
  }
  async function Wt(T, B) {
    const _e = await y(() => De.override(T.s, B));
    return _e ? (S(m, !0), F(), _e.decision) : T.o ?? null;
  }
  function fn(T) {
    return r(a) === "grid" ? De.photos({ limit: 500, ...r($), ...T || {} }) : De.page(r(o), T);
  }
  function et(T, B) {
    if (r(a) === "grid") {
      if (r(L)) {
        S(M, Lo(r(M), zo(T)), !0);
        return;
      }
      const _e = T.m ?? [{ id: T.id, s: T.s, w: T.w, h: T.h }];
      S(q, { frames: _e, origin: B.getBoundingClientRect() }, !0);
      return;
    }
    y(() => De.revealOrigin(T.id));
  }
  function tt(T) {
    S(q, null), y(() => De.revealPhoto(T.id));
  }
  function Tt() {
    y(() => navigator.clipboard.writeText(Ho(
      {
        stacking: r(J),
        sort: r(V),
        filters: r(G)
      },
      r(M)
    )));
  }
  var jt = Oc(), nt = ct(jt);
  {
    var tn = (T) => {
      to(T, {
        get facets() {
          return r(j);
        },
        get selected() {
          return r(G);
        },
        get sort() {
          return r(V);
        },
        get stacking() {
          return r(J);
        },
        get total() {
          return r(k).total;
        },
        get tiles() {
          return r(k).tiles;
        },
        get loading() {
          return r(k).loading;
        },
        get selecting() {
          return r(L);
        },
        get marked() {
          return r(ie);
        },
        onselect: he,
        onsort: (B) => S(V, B, !0),
        onstack: (B) => S(J, Dl(B), !0),
        onclear: () => S(G, {}, !0),
        onselecting: (B) => S(L, B, !0),
        onshare: Tt,
        onunmark: () => S(M, [], !0),
        ontriage: () => S(a, "triage")
      });
    };
    K(nt, (T) => {
      r(a) === "grid" && T(tn);
    });
  }
  var Mt = b(nt, 2);
  {
    var At = (T) => {
      wc(T, {});
    };
    K(Mt, (T) => {
      n && T(At);
    });
  }
  var dt = b(Mt, 2);
  let Ve;
  var _t = f(dt);
  {
    var Ht = (T) => {
      var B = Tc(), _e = f(B), Oe = f(_e), Ie = b(_e, 2);
      Ke(Ie, 21, () => Ma, yt, (Se, Me, ft) => {
        var Rt = yc();
        let Yt;
        var rn = f(Rt), xe = f(rn), Fe = b(rn, 1, !0);
        H(() => {
          Yt = ye(Rt, 1, "nav svelte-1n46o8q", null, Yt, { on: ft === r(s) }), A(xe, r(Me).id), A(Fe, r(Me).title);
        }), Q("click", Rt, () => S(s, ft, !0)), P(Se, Rt);
      });
      var at = b(Ie, 2);
      {
        var qt = (Se) => {
          var Me = Ec(), ft = ct(Me), Rt = f(ft);
          {
            var Yt = (Ge) => {
              var Xe = xc(), Tn = ct(Xe), Vn = /* @__PURE__ */ ne(() => ze.bind(null, !0)), Ar = b(Tn, 2), Rr = f(Ar);
              H(() => A(Rr, `inside ${r(i) ?? ""}`)), Q("click", Tn, function(...Pr) {
                r(Vn)?.apply(this, Pr);
              }), P(Ge, Xe);
            }, rn = (Ge) => {
              var Xe = kc(), Tn = f(Xe);
              H(() => A(Tn, r(v).relive)), Q("click", Xe, () => be(!0)), P(Ge, Xe);
            };
            K(Rt, (Ge) => {
              r(v).drill && r(i) ? Ge(Yt) : r(v).relive && Ge(rn, 1);
            });
          }
          var xe = b(ft, 2);
          {
            var Fe = (Ge) => {
              var Xe = Sc();
              P(Ge, Xe);
            };
            K(xe, (Ge) => {
              r(_) && Ge(Fe);
            });
          }
          var Pt = b(xe, 2);
          {
            let Ge = /* @__PURE__ */ ne(() => r(w)?.rules ?? []);
            tc(Pt, {
              get rows() {
                return r(l);
              },
              get screen() {
                return r(v);
              },
              get root() {
                return r(i);
              },
              get checked() {
                return r(u);
              },
              get rules() {
                return r(Ge);
              },
              get selected() {
                return r(c);
              },
              onpick: Ue,
              oncheck: me
            });
          }
          P(Se, Me);
        };
        K(at, (Se) => {
          r(C) && Se(qt);
        });
      }
      var nn = b(at, 2);
      {
        var lt = (Se) => {
          dc(Se, {
            get root() {
              return Un;
            },
            get version() {
              return r(I);
            },
            get excludedDirs() {
              return r(O);
            },
            get selected() {
              return r(c);
            },
            get busy() {
              return r(d);
            },
            onload: (Me) => y(() => De.tree(Me)),
            onpick: Ue,
            onexclude: Ze
          });
        };
        K(nn, (Se) => {
          r(v).tree && Se(lt);
        });
      }
      var Sn = b(nn, 2);
      {
        let Se = /* @__PURE__ */ ne(() => r(w)?.rules ?? []), Me = /* @__PURE__ */ ne(() => r(w)?.unmatched ?? null);
        Fo(Sn, {
          get rules() {
            return r(Se);
          },
          get unmatched() {
            return r(Me);
          },
          get busy() {
            return r(d);
          },
          ondelete: Qe,
          onmove: Ye
        });
      }
      var En = b(Sn, 2);
      So(En, { oncomplete: Et }), Q("click", Oe, () => S(a, "grid")), P(T, B);
    };
    K(_t, (T) => {
      r(a) === "triage" && T(Ht);
    });
  }
  var it = b(_t, 2), z = f(it);
  {
    var re = (T) => {
      var B = Cc(), _e = ct(B), Oe = f(_e), Ie = b(_e, 2), at = f(Ie), qt = b(Ie, 2);
      {
        var nn = (xe) => {
          var Fe = Mc(), Pt = f(Fe);
          H(() => A(Pt, r(v).note)), P(xe, Fe);
        };
        K(qt, (xe) => {
          r(v).note && xe(nn);
        });
      }
      var lt = b(qt, 2);
      {
        var Sn = (xe) => {
          vo(xe, {
            get screen() {
              return r(v);
            }
          });
        };
        K(lt, (xe) => {
          r(v).name === "dimensions" && xe(Sn);
        });
      }
      var En = b(lt, 2);
      Sl(En, {
        get counts() {
          return r(w);
        },
        get files() {
          return r(g);
        },
        get filesAt() {
          return r(h);
        },
        get stale() {
          return r(m);
        },
        get candidate() {
          return r(o);
        },
        get busy() {
          return r(x);
        },
        onfiles: ae
      });
      var Se = b(En, 2);
      {
        var Me = (xe) => {
          var Fe = Ac(), Pt = f(Fe), Ge = f(Pt), Xe = b(Pt, 2), Tn = f(Xe), Vn = b(Xe, 2), Ar = b(Vn, 2), Rr = f(Ar);
          {
            var Pr = (an) => {
              var Mn = In("already excluded — nothing left to write");
              P(an, Mn);
            }, Rs = (an) => {
              var Mn = In();
              H((Ps) => A(Mn, `one exclude rule each, at the end of the order${Ps ?? ""}`), [
                () => r(W).length < r(u).size ? ` · ${Ee(r(u).size - r(W).length)} already excluded, skipped` : ""
              ]), P(an, Mn);
            };
            K(Rr, (an) => {
              r(W).length ? an(Rs, -1) : an(Pr);
            });
          }
          H(
            (an, Mn) => {
              A(Ge, `${an ?? ""} ticked`), Xe.disabled = r(d) || !r(W).length, A(Tn, Mn), Vn.disabled = r(d);
            },
            [
              () => Ee(r(u).size),
              () => r(d) ? "saving…" : `Exclude ${Ee(r(W).length)}`
            ]
          ), Q("click", Xe, le), Q("click", Vn, ke), P(xe, Fe);
        };
        K(Se, (xe) => {
          r(u).size && xe(Me);
        });
      }
      var ft = b(Se, 2);
      Po(ft, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(v);
        },
        get saving() {
          return r(d);
        },
        onedit: $e,
        onconfirm: ce,
        onclear: ze
      });
      var Rt = b(ft, 2);
      {
        var Yt = (xe) => {
          var Fe = Rc(), Pt = f(Fe);
          H((Ge, Xe) => A(Pt, `${Ge ?? ""}${Xe ?? ""} loaded${r(k).exhausted ? " · all of them" : ""}${r(k).loading ? " · loading…" : ""} `), [
            () => Ee(r(k).count),
            () => r(k).total ? " of " + Ee(r(k).total) : ""
          ]), P(xe, Fe);
        }, rn = (xe) => {
          var Fe = Pc();
          P(xe, Fe);
        };
        K(Rt, (xe) => {
          r(D) ? xe(Yt) : r(v).sheet === !1 && xe(rn, 1);
        });
      }
      H(() => {
        A(Oe, `${r(v).id ?? ""} · ${r(v).title ?? ""}`), A(at, r(v).blurb);
      }), P(T, B);
    };
    K(z, (T) => {
      r(a) === "triage" && T(re);
    });
  }
  var ue = b(z, 2);
  {
    var Ne = (T) => {
      {
        let B = /* @__PURE__ */ ne(() => r(a) === "grid" ? null : r(w)?.page_paths ?? null), _e = /* @__PURE__ */ ne(() => r(a) === "triage"), Oe = /* @__PURE__ */ ne(() => r(a) === "grid" && r(L));
        Yo(T, {
          get key() {
            return r(ee);
          },
          fetchPage: fn,
          get total() {
            return r(B);
          },
          get triage() {
            return r(_e);
          },
          get excludedDirs() {
            return r(O);
          },
          get selecting() {
            return r(Oe);
          },
          get marked() {
            return r(Z);
          },
          onActivate: et,
          onOverride: Wt,
          onExcludeFolder: Te,
          onState: (Ie) => S(k, { ...r(k), ...Ie }, !0)
        });
      }
    };
    K(ue, (T) => {
      (r(D) || r(a) === "grid") && T(Ne);
    });
  }
  var pe = b(dt, 2);
  {
    var fe = (T) => {
      lo(T, {
        get frames() {
          return r(q).frames;
        },
        get origin() {
          return r(q).origin;
        },
        onreveal: tt,
        onclose: () => S(q, null)
      });
    };
    K(pe, (T) => {
      r(q) && T(fe);
    });
  }
  var Le = b(pe, 2);
  {
    var rt = (T) => {
      var B = Nc();
      let _e;
      var Oe = f(B);
      H(() => {
        _e = ye(B, 1, "status", null, _e, { bare: r(a) === "grid" }), A(Oe, r(R));
      }), P(T, B);
    };
    K(Le, (T) => {
      r(R) && T(rt);
    });
  }
  H(() => Ve = ye(dt, 1, "shell", null, Ve, { bare: r(a) === "grid" })), P(e, jt), gt();
}
Dt(["click"]);
jl();
fa();
Ji(Ic, { target: document.getElementById("app") });
