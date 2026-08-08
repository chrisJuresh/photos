var Gr = Array.isArray, Ss = Array.prototype.indexOf, ir = Array.prototype.includes, _r = Array.from, Es = Object.defineProperty, Sn = Object.getOwnPropertyDescriptor, Ts = Object.getOwnPropertyDescriptors, Ms = Object.prototype, As = Array.prototype, Ma = Object.getPrototypeOf, aa = Object.isExtensible;
const rr = () => {
};
function Rs(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Aa() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
function kr(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const r of e)
    if (n.push(r), n.length === t) break;
  return n;
}
const Be = 2, Tn = 4, br = 8, Ra = 1 << 24, Ot = 16, wt = 32, Ut = 64, Or = 128, mt = 512, De = 1024, He = 2048, Ft = 4096, tt = 8192, dt = 16384, Nn = 32768, Nr = 1 << 25, Mn = 65536, lr = 1 << 17, Ps = 1 << 18, In = 1 << 19, Cs = 1 << 20, zt = 1 << 25, hn = 65536, or = 1 << 21, En = 1 << 22, tn = 1 << 23, un = Symbol("$state"), Os = Symbol("legacy props"), Ns = Symbol(""), Pa = Symbol("attributes"), Ir = Symbol("class"), Fr = Symbol("style"), Lr = Symbol("text"), Kn = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Is = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Fs(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Ls() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function zs(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Ds(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Hs() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function qs(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function js() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Bs(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function $s() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Us() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Gs() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ys() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Ws = 1, Vs = 2, Ca = 4, Xs = 8, Ks = 16, Js = 1, Zs = 4, Qs = 8, ei = 16, ti = 1, ni = 2, ze = Symbol("uninitialized"), ri = "http://www.w3.org/1999/xhtml";
function ai() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function si() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function ii() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Oa(e) {
  return e === this.v;
}
function li(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Na(e) {
  return !li(e, this.v);
}
let Je = null;
function An(e) {
  Je = e;
}
function xt(e, t = !1, n) {
  Je = {
    p: Je,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      le
    ),
    l: null
  };
}
function kt(e) {
  var t = (
    /** @type {ComponentContext} */
    Je
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Ja(r);
  }
  return t.i = !0, Je = t.p, /** @type {T} */
  {};
}
function Ia() {
  return !0;
}
let xn = [];
function oi() {
  var e = xn;
  xn = [], Rs(e);
}
function Bt(e) {
  if (xn.length === 0) {
    var t = xn;
    queueMicrotask(() => {
      t === xn && oi();
    });
  }
  xn.push(e);
}
function Fa(e) {
  var t = le;
  if (t === null)
    return ue.f |= tn, e;
  if ((t.f & Nn) === 0 && (t.f & Tn) === 0)
    throw e;
  Qt(e, t);
}
function Qt(e, t) {
  if (!(t !== null && (t.f & dt) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & Or) !== 0) {
        if ((t.f & Nn) === 0)
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
const ui = -7169;
function Re(e, t) {
  e.f = e.f & ui | t;
}
function Yr(e) {
  (e.f & mt) !== 0 || e.deps === null ? Re(e, De) : Re(e, Ft);
}
function La(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Be) === 0 || (t.f & hn) === 0 || (t.f ^= hn, La(
        /** @type {Derived} */
        t.deps
      ));
}
function za(e, t, n) {
  (e.f & He) !== 0 ? t.add(e) : (e.f & Ft) !== 0 && n.add(e), La(e.deps), Re(e, De);
}
let er = !1;
function ci(e) {
  var t = er;
  try {
    return er = !1, [e(), er];
  } finally {
    er = t;
  }
}
function di(e, t, n, r = !0) {
  r && n();
  for (var s of t)
    e.addEventListener(s, n);
  mr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function Fn(e) {
  var t = ue, n = le;
  yt(null), Ht(null);
  try {
    return e();
  } finally {
    yt(t), Ht(n);
  }
}
function fi(e) {
  let t = 0, n = vn(0), r;
  return () => {
    Kr() && (a(n), Qa(() => (t === 0 && (r = gn(() => e(() => Yn(n)))), t += 1, () => {
      Bt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Yn(n));
      });
    })));
  };
}
var hi = Mn | In;
function vi(e, t, n, r) {
  new pi(e, t, n, r);
}
class pi {
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
  #b = fi(() => (this.#d = vn(this.#p), () => {
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
        le
      );
      l.b = this, l.f |= Or, r(i);
    }, this.parent = /** @type {Effect} */
    le.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#r = Jr(() => {
      this.#h();
    }, hi);
  }
  #_() {
    try {
      this.#s = bt(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: s } = this.#m(t);
    Bt(s), n && (this.#l = bt(() => {
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
        ii();
        return;
      }
      n = !0, r && Ys(), this.#l !== null && dn(this.#l, () => {
        this.#l = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: s, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, s), r = !1;
      } catch (l) {
        Qt(l, this.#r && this.#r.parent);
      }
    } };
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = bt(() => t(this.#t)), Bt(() => {
      var n = this.#a = document.createDocumentFragment(), r = $t();
      n.append(r), this.#s = this.#v(() => bt(() => this.#o(r))), this.#u === 0 && (this.#t.before(n), this.#a = null, dn(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#p = 0, this.#s = bt(() => {
        this.#o(this.#t);
      }), this.#u > 0) {
        var t = this.#a = document.createDocumentFragment();
        Qr(this.#s, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = bt(() => n(this.#t));
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
    za(t, this.#f, this.#g);
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
    var n = le, r = ue, s = Je;
    Ht(this.#r), yt(this.#r), An(this.#r.ctx);
    try {
      return nn.ensure(), t();
    } catch (i) {
      return Fa(i), null;
    } finally {
      Ht(n), yt(r), An(s);
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
    this.#u += t, this.#u === 0 && (this.#w(n), this.#n && dn(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#c) && (this.#c = !0, Bt(() => {
      this.#c = !1, this.#d && Rn(this.#d, this.#p);
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
    this.#s && (st(this.#s), this.#s = null), this.#n && (st(this.#n), this.#n = null), this.#l && (st(this.#l), this.#l = null);
    let n = this.#e.failed;
    const r = (s) => {
      const { reset: i, invoke_onerror: l } = this.#m(s);
      l(), n && (this.#l = this.#v(() => {
        try {
          return bt(() => {
            var u = (
              /** @type {Effect} */
              le
            );
            u.b = this, u.f |= Or, n(
              this.#t,
              () => s,
              () => i
            );
          });
        } catch (u) {
          return Qt(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    Bt(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (i) {
        Qt(i, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        r,
        /** @param {unknown} e */
        (i) => Qt(i, this.#r && this.#r.parent)
      ) : r(s);
    });
  }
}
function gi(e, t, n, r) {
  const s = Vn;
  var i = e.filter((f) => !f.settled), l = t.map(s);
  if (n.length === 0 && i.length === 0) {
    r(l);
    return;
  }
  var u = (
    /** @type {Effect} */
    le
  ), o = _i(), d = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((f) => f.promise)) : null;
  function g(f) {
    if ((u.f & dt) === 0) {
      o();
      try {
        r([...l, ...f]);
      } catch (h) {
        Qt(h, u);
      }
      ur();
    }
  }
  var b = Da();
  if (n.length === 0) {
    d.then(() => g([])).finally(b);
    return;
  }
  function p() {
    Promise.all(n.map((f) => /* @__PURE__ */ bi(f))).then(g).catch((f) => Qt(f, u)).finally(b);
  }
  d ? d.then(() => {
    o(), p(), ur();
  }) : p();
}
function _i() {
  var e = (
    /** @type {Effect} */
    le
  ), t = ue, n = Je, r = (
    /** @type {Batch} */
    he
  );
  return function(i = !0) {
    Ht(e), yt(t), An(n), i && (e.f & dt) === 0 && (r?.activate(), r?.apply());
  };
}
function ur(e = !0) {
  Ht(null), yt(null), An(null), e && he?.deactivate();
}
function Da() {
  var e = (
    /** @type {Effect} */
    le
  ), t = e.b, n = (
    /** @type {Batch} */
    he
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
// @__NO_SIDE_EFFECTS__
function Vn(e) {
  var t = Be | He;
  return le !== null && (le.f |= In), {
    ctx: Je,
    deps: null,
    effects: null,
    equals: Oa,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ze
    ),
    wv: 0,
    parent: le,
    ac: null
  };
}
const jn = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function bi(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    le
  );
  r === null && Ls();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = vn(
    /** @type {V} */
    ze
  ), l = !ue, u = /* @__PURE__ */ new Set();
  return Ni(() => {
    var o = (
      /** @type {Effect} */
      le
    ), d = Aa();
    s = d.promise;
    try {
      Promise.resolve(e()).then(d.resolve, (f) => {
        f !== Kn && d.reject(f);
      }).finally(ur);
    } catch (f) {
      d.reject(f), ur();
    }
    var g = (
      /** @type {Batch} */
      he
    );
    if (l) {
      if ((o.f & Nn) !== 0)
        var b = Da();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        g.async_deriveds.get(o)?.reject(jn);
      else
        for (const f of u.values())
          f.reject(jn);
      u.add(d), g.async_deriveds.set(o, d);
    }
    const p = (f, h = void 0) => {
      b?.(), u.delete(d), h !== jn && (g.activate(), h ? (i.f |= tn, Rn(i, h)) : ((i.f & tn) !== 0 && (i.f ^= tn), Rn(i, f)), g.deactivate());
    };
    d.promise.then(p, (f) => p(null, f || "unknown"));
  }), mr(() => {
    for (const o of u)
      o.reject(jn);
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
function ne(e) {
  const t = /* @__PURE__ */ Vn(e);
  return as(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ha(e) {
  const t = /* @__PURE__ */ Vn(e);
  return t.equals = Na, t;
}
function mi(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      st(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Wr(e) {
  var t, n = le, r = e.parent;
  if (!Gt && r !== null && e.v !== ze && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (dt | tt)) !== 0)
    return ai(), e.v;
  Ht(r);
  try {
    e.f &= ~hn, mi(e), t = os(e);
  } finally {
    Ht(n);
  }
  return t;
}
function qa(e) {
  var t = Wr(e);
  if (!e.equals(t) && (e.wv = is(), (!he?.is_fork || e.deps === null) && (he !== null ? (he.capture(e, t, !0), zr?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Re(e, De);
    return;
  }
  Gt || (Nt !== null ? (Kr() || he?.is_fork) && Nt.set(e, t) : Yr(e));
}
function wi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Fn(() => {
        t.ac.abort(Kn), t.ac = null;
      }), t.fn !== null && (t.teardown = rr), Xn(t, 0), Zr(t));
}
function ja(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Cn(t);
}
let Sr = null, wn = null, he = null, zr = null, Nt = null, Dr = null, Er = !1, kn = null, ar = null;
var sa = 0;
let yi = 1;
class nn {
  id = yi++;
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
    wn === null ? Sr = wn = this : (wn.#e = this, this.#i = wn), wn = this;
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
        Re(s, He), n(s);
      for (s of r.m)
        Re(s, Ft), n(s);
    }
    this.#g.add(t);
  }
  #_() {
    this.#t = !0, sa++ > 1e3 && (this.#v(), xi());
    for (const o of this.#u)
      this.#c.delete(o), Re(o, He), this.schedule(o);
    for (const o of this.#c)
      Re(o, Ft), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = kn = [], r = [], s = ar = [];
    for (const o of t)
      try {
        this.#y(o, n, r);
      } catch (d) {
        throw Ua(o), this.#b() || this.discard(), d;
      }
    if (he = null, s.length > 0) {
      var i = nn.ensure();
      for (const o of s)
        i.schedule(o);
    }
    if (kn = null, ar = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [o, d] of this.#f)
        $a(o, d);
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
    this.#o.clear(), zr = this, ia(r), ia(n), zr = null, this.#l?.resolve();
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
    t.f ^= De;
    for (var s = t.first; s !== null; ) {
      var i = s.f, l = (i & (wt | Ut)) !== 0, u = l && (i & De) !== 0, o = u || (i & tt) !== 0 || this.#f.has(s);
      if (!o && s.fn !== null) {
        l ? s.f ^= De : (i & Tn) !== 0 ? n.push(s) : Zn(s) && ((i & Ot) !== 0 && this.#c.add(s), Cn(s));
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
      if (s !== null && !((r.f & Be) !== 0 && (r.f & (He | Ft)) === 0))
        for (const u of s) {
          var i = u.f;
          if ((i & Be) !== 0)
            n(
              /** @type {Derived} */
              u
            );
          else {
            var l = (
              /** @type {Effect} */
              u
            );
            i & (En | Ot) && !this.async_deriveds.has(l) && (this.#c.delete(l), Re(l, He), this.schedule(l));
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
      za(t[n], this.#u, this.#c);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== ze && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & tn) === 0 && (this.current.set(t, [n, r]), Nt?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    he = this;
  }
  deactivate() {
    he = null, Nt = null;
  }
  flush() {
    try {
      Er = !0, he = this, this.#_();
    } finally {
      sa = 0, Dr = null, kn = null, ar = null, Er = !1, he = null, Nt = null, cn.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(jn);
    this.#v(), this.#l?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#p.push(t);
  }
  #w() {
    for (let b = Sr; b !== null; b = b.#e) {
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
                (f.f & (Ot | En)) !== 0 ? b.schedule(f) : b.#h([f]);
              });
          b.activate();
          var l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (var o of n)
            Ba(o, i, l, u);
          u = /* @__PURE__ */ new Map();
          var d = [...b.current].filter(([p, f]) => {
            const h = this.current.get(p);
            return h ? h[0] !== f[0] || h[1] !== f[1] : !0;
          }).map(([p]) => p);
          if (d.length > 0)
            for (const p of this.#p)
              (p.f & (dt | tt | lr)) === 0 && Vr(p, d, u) && ((p.f & (En | Ot)) !== 0 ? (Re(p, He), b.schedule(p)) : b.#u.add(p));
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
    this.#d || (this.#d = !0, Bt(() => {
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
    return (this.#l ??= Aa()).promise;
  }
  static ensure() {
    if (he === null) {
      const t = he = new nn();
      Er || Bt(() => {
        t.#t || t.flush();
      });
    }
    return he;
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
    if (Dr = t, t.b?.is_pending && (t.f & (Tn | br | Ra)) !== 0 && (t.f & Nn) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (kn !== null && n === le && (ue === null || (ue.f & Be) === 0))
        return;
      if ((r & (Ut | wt)) !== 0) {
        if ((r & De) === 0)
          return;
        n.f ^= De;
      }
    }
    this.#a.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#i, n = this.#e;
      t === null ? Sr = n : t.#e = n, n === null ? wn = t : n.#i = t, this.linked = !1;
    }
  }
}
function xi() {
  try {
    js();
  } catch (e) {
    Qt(e, Dr);
  }
}
let jt = null;
function ia(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (dt | tt)) === 0 && Zn(r) && (jt = /* @__PURE__ */ new Set(), Cn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && ts(r), jt?.size > 0)) {
        cn.clear();
        for (const s of jt) {
          if ((s.f & (dt | tt)) !== 0) continue;
          const i = [s];
          let l = s.parent;
          for (; l !== null; )
            jt.has(l) && (jt.delete(l), i.push(l)), l = l.parent;
          for (let u = i.length - 1; u >= 0; u--) {
            const o = i[u];
            (o.f & (dt | tt)) === 0 && Cn(o);
          }
        }
        jt.clear();
      }
    }
    jt = null;
  }
}
function Ba(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & Be) !== 0 ? Ba(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (En | Ot)) !== 0 && (i & He) === 0 && Vr(s, t, r) && (Re(s, He), Xr(
        /** @type {Effect} */
        s
      ));
    }
}
function Vr(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (ir.call(t, s))
        return !0;
      if ((s.f & Be) !== 0 && Vr(
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
function Xr(e) {
  he.schedule(e);
}
function $a(e, t) {
  if (!((e.f & wt) !== 0 && (e.f & De) !== 0)) {
    (e.f & He) !== 0 ? t.d.push(e) : (e.f & Ft) !== 0 && t.m.push(e), Re(e, De);
    for (var n = e.first; n !== null; )
      $a(n, t), n = n.next;
  }
}
function Ua(e) {
  Re(e, De);
  for (var t = e.first; t !== null; )
    Ua(t), t = t.next;
}
let cr = /* @__PURE__ */ new Set();
const cn = /* @__PURE__ */ new Map();
let Ga = !1;
function vn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Oa,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function W(e, t) {
  const n = vn(e);
  return as(n), n;
}
// @__NO_SIDE_EFFECTS__
function ki(e, t = !1, n = !0) {
  const r = vn(e);
  return t || (r.equals = Na), r;
}
function T(e, t, n = !1) {
  ue !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!It || (ue.f & lr) !== 0) && Ia() && (ue.f & (Be | Ot | En | lr)) !== 0 && (Dt === null || !Dt.has(e)) && Gs();
  let r = n ? Ne(t) : t;
  return Rn(e, r, ar);
}
function Rn(e, t, n = null) {
  if (!e.equals(t)) {
    cn.set(e, Gt ? t : e.v);
    var r = nn.ensure();
    if (r.capture(e, t), (e.f & Be) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & He) !== 0 && Wr(s), Nt === null && Yr(s);
    }
    e.wv = is(), Ya(e, He, n), le !== null && (le.f & De) !== 0 && (le.f & (wt | Ut)) === 0 && (_t === null ? Li([e]) : _t.push(e)), !r.is_fork && cr.size > 0 && !Ga && Si();
  }
  return t;
}
function Si() {
  Ga = !1;
  for (const e of cr) {
    (e.f & De) !== 0 && Re(e, Ft);
    let t;
    try {
      t = Zn(e);
    } catch {
      t = !0;
    }
    t && Cn(e);
  }
  cr.clear();
}
function Ei(e, t = 1) {
  var n = a(e), r = t === 1 ? n++ : n--;
  return T(e, n), r;
}
function Yn(e) {
  T(e, e.v + 1);
}
function Ya(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, i = 0; i < s; i++) {
      var l = r[i], u = l.f, o = (u & He) === 0;
      if (o && Re(l, t), (u & lr) !== 0)
        cr.add(
          /** @type {Effect} */
          l
        );
      else if ((u & Be) !== 0) {
        var d = (
          /** @type {Derived} */
          l
        );
        Nt?.delete(d), (u & hn) === 0 && (u & mt && (le === null || (le.f & or) === 0) && (l.f |= hn), Ya(d, Ft, n));
      } else if (o) {
        var g = (
          /** @type {Effect} */
          l
        );
        (u & Ot) !== 0 && jt !== null && jt.add(g), n !== null ? n.push(g) : Xr(g);
      }
    }
}
function Ne(e) {
  if (typeof e != "object" || e === null || un in e)
    return e;
  const t = Ma(e);
  if (t !== Ms && t !== As)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Gr(e), s = /* @__PURE__ */ W(0), i = fn, l = (u) => {
    if (fn === i)
      return u();
    var o = ue, d = fn;
    yt(null), ua(i);
    var g = u();
    return yt(o), ua(d), g;
  };
  return r && n.set("length", /* @__PURE__ */ W(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && $s();
        var g = n.get(o);
        return g === void 0 ? l(() => {
          var b = /* @__PURE__ */ W(d.value);
          return n.set(o, b), b;
        }) : T(g, d.value, !0), !0;
      },
      deleteProperty(u, o) {
        var d = n.get(o);
        if (d === void 0) {
          if (o in u) {
            const g = l(() => /* @__PURE__ */ W(ze));
            n.set(o, g), Yn(s);
          }
        } else
          T(d, ze), Yn(s);
        return !0;
      },
      get(u, o, d) {
        if (o === un)
          return e;
        var g = n.get(o), b = o in u;
        if (g === void 0 && (!b || Sn(u, o)?.writable) && (g = l(() => {
          var f = Ne(b ? u[o] : ze), h = /* @__PURE__ */ W(f);
          return h;
        }), n.set(o, g)), g !== void 0) {
          var p = a(g);
          return p === ze ? void 0 : p;
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
          if (b !== void 0 && p !== ze)
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
        if (o === un)
          return !0;
        var d = n.get(o), g = d !== void 0 && d.v !== ze || Reflect.has(u, o);
        if (d !== void 0 || le !== null && (!g || Sn(u, o)?.writable)) {
          d === void 0 && (d = l(() => {
            var p = g ? Ne(u[o]) : ze, f = /* @__PURE__ */ W(p);
            return f;
          }), n.set(o, d));
          var b = a(d);
          if (b === ze)
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
            h !== void 0 ? T(h, ze) : f in u && (h = l(() => /* @__PURE__ */ W(ze)), n.set(f + "", h));
          }
        if (b === void 0)
          (!p || Sn(u, o)?.writable) && (b = l(() => /* @__PURE__ */ W(void 0)), T(b, Ne(d)), n.set(o, b));
        else {
          p = b.v !== ze;
          var y = l(() => Ne(d));
          T(b, y);
        }
        var c = Reflect.getOwnPropertyDescriptor(u, o);
        if (c?.set && c.set.call(g, d), !p) {
          if (r && typeof o == "string") {
            var _ = (
              /** @type {Source<number>} */
              n.get("length")
            ), S = Number(o);
            Number.isInteger(S) && S >= _.v && T(_, S + 1);
          }
          Yn(s);
        }
        return !0;
      },
      ownKeys(u) {
        a(s);
        var o = Reflect.ownKeys(u).filter((b) => {
          var p = n.get(b);
          return p === void 0 || p.v !== ze;
        });
        for (var [d, g] of n)
          g.v !== ze && !(d in u) && o.push(d);
        return o;
      },
      setPrototypeOf() {
        Us();
      }
    }
  );
}
function la(e) {
  try {
    if (e !== null && typeof e == "object" && un in e)
      return e[un];
  } catch {
  }
  return e;
}
function Ti(e, t) {
  return Object.is(la(e), la(t));
}
var Pn, Wa, Va, Xa;
function Mi() {
  if (Pn === void 0) {
    Pn = window, Wa = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Va = Sn(t, "firstChild").get, Xa = Sn(t, "nextSibling").get, aa(e) && (e[Ir] = void 0, e[Pa] = null, e[Fr] = void 0, e.__e = void 0), aa(n) && (n[Lr] = void 0);
  }
}
function $t(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function dr(e) {
  return (
    /** @type {TemplateNode | null} */
    Va.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Jn(e) {
  return (
    /** @type {TemplateNode | null} */
    Xa.call(e)
  );
}
function v(e, t) {
  return /* @__PURE__ */ dr(e);
}
function ct(e, t = !1) {
  {
    var n = /* @__PURE__ */ dr(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Jn(n) : n;
  }
}
function w(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Jn(r);
  return r;
}
function Ai(e) {
  e.textContent = "";
}
function Ka() {
  return !1;
}
function Ri(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Pi(e) {
  le === null && (ue === null && qs(), Hs()), Gt && Ds();
}
function Ci(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Yt(e, t) {
  var n = le;
  n !== null && (n.f & tt) !== 0 && (e |= tt);
  var r = {
    ctx: Je,
    deps: null,
    nodes: null,
    f: e | He | mt,
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
  if ((e & Tn) !== 0)
    kn !== null ? kn.push(r) : nn.ensure().schedule(r);
  else if (t !== null) {
    try {
      Cn(r);
    } catch (l) {
      throw st(r), l;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & In) === 0 && (s = s.first, (e & Ot) !== 0 && (e & Mn) !== 0 && s !== null && (s.f |= Mn));
  }
  if (s !== null && (s.parent = n, n !== null && Ci(s, n), ue !== null && (ue.f & Be) !== 0 && (e & Ut) === 0)) {
    var i = (
      /** @type {Derived} */
      ue
    );
    (i.effects ??= []).push(s);
  }
  return r;
}
function Kr() {
  return ue !== null && !It;
}
function mr(e) {
  const t = Yt(br, null);
  return Re(t, De), t.teardown = e, t;
}
function pn(e) {
  Pi();
  var t = (
    /** @type {Effect} */
    le.f
  ), n = !ue && (t & wt) !== 0 && Je !== null && !Je.i;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Je
    );
    (r.e ??= []).push(e);
  } else
    return Ja(e);
}
function Ja(e) {
  return Yt(Tn | Cs, e);
}
function Oi(e) {
  nn.ensure();
  const t = Yt(Ut | In, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? dn(t, () => {
      st(t), r(void 0);
    }) : (st(t), r(void 0));
  });
}
function Za(e) {
  return Yt(Tn, e);
}
function Ni(e) {
  return Yt(En | In, e);
}
function Qa(e, t = 0) {
  return Yt(br | t, e);
}
function B(e, t = [], n = [], r = []) {
  gi(r, t, n, (s) => {
    Yt(br, () => {
      e(...s.map(a));
    });
  });
}
function Jr(e, t = 0) {
  var n = Yt(Ot | t, e);
  return n;
}
function bt(e) {
  return Yt(wt | In, e);
}
function es(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Gt, r = ue;
    oa(!0), yt(null);
    try {
      t.call(null);
    } finally {
      oa(n), yt(r);
    }
  }
}
function Zr(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Fn(() => {
      s.abort(Kn);
    });
    var r = n.next;
    (n.f & Ut) !== 0 ? n.parent = null : st(n, t), n = r;
  }
}
function Ii(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & wt) === 0 && st(t), t = n;
  }
}
function st(e, t = !0) {
  var n = !1;
  (t || (e.f & Ps) !== 0) && e.nodes !== null && e.nodes.end !== null && (Fi(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= Nr, Zr(e, t && !n), Xn(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  es(e), e.f ^= Nr, e.f |= dt;
  var s = e.parent;
  s !== null && s.first !== null && ts(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Fi(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Jn(e);
    e.remove(), e = n;
  }
}
function ts(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function dn(e, t, n = !0) {
  var r = [];
  ns(e, r, !0);
  var s = () => {
    n && st(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var l = () => --i || s();
    for (var u of r)
      u.out(l);
  } else
    s();
}
function ns(e, t, n) {
  if ((e.f & tt) === 0) {
    e.f ^= tt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var s = e.first; s !== null; ) {
      var i = s.next;
      if ((s.f & Ut) === 0) {
        var l = (s.f & Mn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (s.f & wt) !== 0 && (e.f & Ot) !== 0;
        ns(s, t, l ? n : !1);
      }
      s = i;
    }
  }
}
function fr(e) {
  rs(e, !0);
}
function rs(e, t) {
  if ((e.f & tt) !== 0) {
    e.f ^= tt, (e.f & De) === 0 && (Re(e, He), nn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & Mn) !== 0 || (n.f & wt) !== 0;
      rs(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function Qr(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ Jn(n);
      t.append(n), n = s;
    }
}
let sr = !1, Gt = !1;
function oa(e) {
  Gt = e;
}
let ue = null, It = !1;
function yt(e) {
  ue = e;
}
let le = null;
function Ht(e) {
  le = e;
}
let Dt = null;
function as(e) {
  ue !== null && (Dt ??= /* @__PURE__ */ new Set()).add(e);
}
let at = null, ut = 0, _t = null;
function Li(e) {
  _t = e;
}
let ss = 1, ln = 0, fn = ln;
function ua(e) {
  fn = e;
}
function is() {
  return ++ss;
}
function Zn(e) {
  var t = e.f;
  if ((t & He) !== 0)
    return !0;
  if (t & Be && (e.f &= ~hn), (t & Ft) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (Zn(
        /** @type {Derived} */
        i
      ) && qa(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & mt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Nt === null && Re(e, De);
  }
  return !1;
}
function ls(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Dt !== null && Dt.has(e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & Be) !== 0 ? ls(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Re(i, He) : (i.f & De) !== 0 && Re(i, Ft), Xr(
        /** @type {Effect} */
        i
      ));
    }
}
function os(e) {
  var t = at, n = ut, r = _t, s = ue, i = Dt, l = Je, u = It, o = fn, d = e.f;
  at = /** @type {null | Value[]} */
  null, ut = 0, _t = null, ue = (d & (wt | Ut)) === 0 ? e : null, Dt = null, An(e.ctx), It = !1, fn = ++ln, e.ac !== null && (Fn(() => {
    e.ac.abort(Kn);
  }), e.ac = null);
  try {
    e.f |= or;
    var g = (
      /** @type {Function} */
      e.fn
    ), b = g();
    e.f |= Nn;
    var p = e.deps, f = he?.is_fork;
    if (at !== null) {
      var h;
      if (f || Xn(e, ut), p !== null && ut > 0)
        for (p.length = ut + at.length, h = 0; h < at.length; h++)
          p[ut + h] = at[h];
      else
        e.deps = p = at;
      if (Kr() && (e.f & mt) !== 0)
        for (h = ut; h < p.length; h++)
          (p[h].reactions ??= []).push(e);
    } else !f && p !== null && ut < p.length && (Xn(e, ut), p.length = ut);
    if (Ia() && _t !== null && !It && p !== null && (e.f & (Be | Ft | He)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      _t.length; h++)
        ls(
          _t[h],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (ln++, s.deps !== null)
        for (let y = 0; y < n; y += 1)
          s.deps[y].rv = ln;
      if (t !== null)
        for (const y of t)
          y.rv = ln;
      _t !== null && (r === null ? r = _t : r.push(.../** @type {Source[]} */
      _t));
    }
    return (e.f & tn) !== 0 && (e.f ^= tn), b;
  } catch (y) {
    return Fa(y);
  } finally {
    e.f ^= or, at = t, ut = n, _t = r, ue = s, Dt = i, An(l), It = u, fn = o;
  }
}
function zi(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Ss.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & Be) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (at === null || !ir.call(at, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & mt) !== 0 && (i.f ^= mt, i.f &= ~hn), i.v !== ze && Yr(i), i.ac !== null && Fn(() => {
      i.ac.abort(Kn), i.ac = null, Re(i, He);
    }), wi(i), Xn(i, 0);
  }
}
function Xn(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      zi(e, n[r]);
}
function Cn(e) {
  var t = e.f;
  if ((t & dt) === 0) {
    Re(e, De);
    var n = le, r = sr;
    le = e, sr = (t & (wt | Ut)) === 0;
    try {
      (t & (Ot | Ra)) !== 0 ? Ii(e) : Zr(e), es(e);
      var s = os(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = ss;
      var i;
    } finally {
      sr = r, le = n;
    }
  }
}
function a(e) {
  var t = e.f, n = (t & Be) !== 0;
  if (ue !== null && !It) {
    var r = le !== null && (le.f & dt) !== 0;
    if (!r && (Dt === null || !Dt.has(e))) {
      var s = ue.deps;
      if ((ue.f & or) !== 0)
        e.rv < ln && (e.rv = ln, at === null && s !== null && s[ut] === e ? ut++ : at === null ? at = [e] : at.push(e));
      else {
        ue.deps ??= [], ir.call(ue.deps, e) || ue.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [ue] : ir.call(i, ue) || i.push(ue);
      }
    }
  }
  if (Gt && cn.has(e))
    return cn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Gt) {
      var u = l.v;
      return ((l.f & De) === 0 && l.reactions !== null || cs(l)) && (u = Wr(l)), cn.set(l, u), u;
    }
    var o = (l.f & mt) === 0 && !It && ue !== null && (sr || (ue.f & mt) !== 0), d = (l.f & Nn) === 0;
    Zn(l) && (o && (l.f |= mt), qa(l)), o && !d && (ja(l), us(l));
  }
  if (Nt?.has(e))
    return Nt.get(e);
  if ((e.f & tn) !== 0)
    throw e.v;
  return e.v;
}
function us(e) {
  if (e.f |= mt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Be) !== 0 && (t.f & mt) === 0 && (ja(
        /** @type {Derived} */
        t
      ), us(
        /** @type {Derived} */
        t
      ));
}
function cs(e) {
  if (e.v === ze) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (cn.has(t) || (t.f & Be) !== 0 && cs(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function gn(e) {
  var t = It;
  try {
    return It = !0, e();
  } finally {
    It = t;
  }
}
const Di = ["touchstart", "touchmove"];
function Hi(e) {
  return Di.includes(e);
}
const Bn = Symbol("events"), ds = /* @__PURE__ */ new Set(), Hr = /* @__PURE__ */ new Set();
function qi(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || qr.call(t, i), !i.cancelBubble)
      return Fn(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Bt(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Wn(e, t, n, r, s) {
  var i = { capture: r, passive: s }, l = qi(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && mr(() => {
    t.removeEventListener(e, l, i);
  });
}
function Z(e, t, n) {
  (t[Bn] ??= {})[e] = n;
}
function qt(e) {
  for (var t = 0; t < e.length; t++)
    ds.add(e[t]);
  for (var n of Hr)
    n(e);
}
let ca = null;
function qr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  ca = e;
  var l = 0, u = ca === e && e[Bn];
  if (u) {
    var o = s.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Bn] = t;
      return;
    }
    var d = s.indexOf(t);
    if (d === -1)
      return;
    o <= d && (l = o);
  }
  if (i = /** @type {Element} */
  s[l] || e.target, i !== t) {
    Es(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var g = ue, b = le;
    yt(null), Ht(null);
    try {
      for (var p, f = []; i !== null && i !== t; ) {
        try {
          var h = i[Bn]?.[r];
          h != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && h.call(i, e);
        } catch (y) {
          p ? f.push(y) : p = y;
        }
        if (e.cancelBubble) break;
        l++, i = l < s.length ? (
          /** @type {Element} */
          s[l]
        ) : null;
      }
      if (p) {
        for (let y of f)
          queueMicrotask(() => {
            throw y;
          });
        throw p;
      }
    } finally {
      e[Bn] = t, delete e.currentTarget, yt(g), Ht(b);
    }
  }
}
const ji = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Bi(e) {
  return (
    /** @type {string} */
    ji?.createHTML(e) ?? e
  );
}
function $i(e) {
  var t = Ri("template");
  return t.innerHTML = Bi(e.replaceAll("<!>", "<!---->")), t.content;
}
function hr(e, t) {
  var n = (
    /** @type {Effect} */
    le
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var n = (t & ti) !== 0, r = (t & ni) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = $i(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ dr(s)));
    var l = (
      /** @type {TemplateNode} */
      r || Wa ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ dr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      hr(u, o);
    } else
      hr(l, l);
    return l;
  };
}
function da(e = "") {
  {
    var t = $t(e + "");
    return hr(t, t), t;
  }
}
function ea() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = $t();
  return e.append(t, n), hr(t, n), e;
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
  (e[Lr] ??= e.nodeValue) && (e[Lr] = n, e.nodeValue = `${n}`);
}
function Ui(e, t) {
  return Gi(e, t);
}
const tr = /* @__PURE__ */ new Map();
function Gi(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: l = !0, transformError: u }) {
  Mi();
  var o = void 0, d = Oi(() => {
    var g = n ?? t.appendChild($t());
    vi(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (f) => {
        xt({});
        var h = (
          /** @type {ComponentContext} */
          Je
        );
        i && (h.c = i), s && (r.$$events = s), o = e(f, r) || {}, kt();
      },
      u
    );
    var b = /* @__PURE__ */ new Set(), p = (f) => {
      for (var h = 0; h < f.length; h++) {
        var y = f[h];
        if (!b.has(y)) {
          b.add(y);
          var c = Hi(y);
          for (const O of [t, document]) {
            var _ = tr.get(O);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), tr.set(O, _));
            var S = _.get(y);
            S === void 0 ? (O.addEventListener(y, qr, { passive: c }), _.set(y, 1)) : _.set(y, S + 1);
          }
        }
      }
    };
    return p(_r(ds)), Hr.add(p), () => {
      for (var f of b)
        for (const c of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            tr.get(c)
          ), y = (
            /** @type {number} */
            h.get(f)
          );
          --y == 0 ? (c.removeEventListener(f, qr), h.delete(f), h.size === 0 && tr.delete(c)) : h.set(f, y);
        }
      Hr.delete(p), g !== n && g.parentNode?.removeChild(g);
    };
  });
  return Yi.set(o, d), o;
}
let Yi = /* @__PURE__ */ new WeakMap();
class Wi {
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
        fr(r), this.#o.delete(n);
      else {
        var s = this.#e.get(n);
        s && (fr(s.effect), this.#i.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
      }
      for (const [i, l] of this.#t) {
        if (this.#t.delete(i), i === t)
          break;
        const u = this.#e.get(l);
        u && (st(u.effect), this.#e.delete(l));
      }
      for (const [i, l] of this.#i) {
        if (i === n || this.#o.has(i)) continue;
        const u = () => {
          if (Array.from(this.#t.values()).includes(i)) {
            var d = document.createDocumentFragment();
            Qr(l, d), d.append($t()), this.#e.set(i, { effect: l, fragment: d });
          } else
            st(l);
          this.#o.delete(i), this.#i.delete(i);
        };
        this.#r || !r ? (this.#o.add(i), dn(l, u, !1)) : u();
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
      n.includes(r) || (st(s.effect), this.#e.delete(r));
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
    ), s = Ka();
    if (n && !this.#i.has(t) && !this.#e.has(t))
      if (s) {
        var i = document.createDocumentFragment(), l = $t();
        i.append(l), this.#e.set(t, {
          effect: bt(() => n(l)),
          fragment: i
        });
      } else
        this.#i.set(
          t,
          bt(() => n(this.anchor))
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
function K(e, t, n = !1) {
  var r = new Wi(e), s = n ? Mn : 0;
  function i(l, u) {
    r.ensure(l, u);
  }
  Jr(() => {
    var l = !1;
    t((u, o = 0) => {
      l = !0, i(o, u);
    }), l || i(-1, null);
  }, s);
}
function Ct(e, t) {
  return t;
}
function Vi(e, t, n) {
  for (var r = [], s = t.length, i, l = t.length, u = 0; u < s; u++) {
    let b = t[u];
    dn(
      b,
      () => {
        if (i) {
          if (i.pending.delete(b), i.done.add(b), i.pending.size === 0) {
            var p = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            jr(e, _r(i.done)), p.delete(i), p.size === 0 && (e.outrogroups = null);
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
      Ai(g), g.append(d), e.items.clear();
    }
    jr(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function jr(e, t, n = !0) {
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
      i.f |= zt;
      const l = document.createDocumentFragment();
      Qr(i, l);
    } else
      st(t[s], n);
  }
}
var fa;
function Ke(e, t, n, r, s, i = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & Ca) !== 0;
  if (o) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild($t());
  }
  var g = null, b = /* @__PURE__ */ Ha(() => {
    var O = n();
    return (
      /** @type {V[]} */
      Gr(O) ? O : O == null ? [] : _r(O)
    );
  }), p, f = /* @__PURE__ */ new Map(), h = !0;
  function y(O) {
    (S.effect.f & dt) === 0 && (S.pending.delete(O), S.fallback = g, Xi(S, p, l, t, r), g !== null && (p.length === 0 ? (g.f & zt) === 0 ? fr(g) : (g.f ^= zt, $n(g, null, l)) : dn(g, () => {
      g = null;
    })));
  }
  function c(O) {
    S.pending.delete(O);
  }
  var _ = Jr(() => {
    p = /** @type {V[]} */
    a(b);
    for (var O = p.length, N = /* @__PURE__ */ new Set(), M = (
      /** @type {Batch} */
      he
    ), L = Ka(), $ = 0; $ < O; $ += 1) {
      var j = p[$], H = r(j, $), m = h ? null : u.get(H);
      m ? (m.v && Rn(m.v, j), m.i && Rn(m.i, $), L && M.unskip_effect(m.e)) : (m = Ki(
        u,
        h ? l : fa ??= $t(),
        j,
        H,
        $,
        s,
        t,
        n
      ), h || (m.e.f |= zt), u.set(H, m)), N.add(H);
    }
    if (O === 0 && i && !g && (h ? g = bt(() => i(l)) : (g = bt(() => i(fa ??= $t())), g.f |= zt)), O > N.size && zs(), !h)
      if (f.set(M, N), L) {
        for (const [z, R] of u)
          N.has(z) || M.skip_effect(R.e);
        M.oncommit(y), M.ondiscard(c);
      } else
        y(M);
    a(b);
  }), S = { effect: _, items: u, pending: f, outrogroups: null, fallback: g };
  h = !1;
}
function zn(e) {
  for (; e !== null && (e.f & wt) === 0; )
    e = e.next;
  return e;
}
function Xi(e, t, n, r, s) {
  var i = (r & Xs) !== 0, l = t.length, u = e.items, o = zn(e.effect.first), d, g = null, b, p = [], f = [], h, y, c, _;
  if (i)
    for (_ = 0; _ < l; _ += 1)
      h = t[_], y = s(h, _), c = /** @type {EachItem} */
      u.get(y).e, (c.f & zt) === 0 && (c.nodes?.a?.measure(), (b ??= /* @__PURE__ */ new Set()).add(c));
  for (_ = 0; _ < l; _ += 1) {
    if (h = t[_], y = s(h, _), c = /** @type {EachItem} */
    u.get(y).e, e.outrogroups !== null)
      for (const m of e.outrogroups)
        m.pending.delete(c), m.done.delete(c);
    if ((c.f & tt) !== 0 && (fr(c), i && (c.nodes?.a?.unfix(), (b ??= /* @__PURE__ */ new Set()).delete(c))), (c.f & zt) !== 0)
      if (c.f ^= zt, c === o)
        $n(c, null, n);
      else {
        var S = g ? g.next : o;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), Jt(e, g, c), Jt(e, c, S), $n(c, S, n), g = c, p = [], f = [], o = zn(g.next);
        continue;
      }
    if (c !== o) {
      if (d !== void 0 && d.has(c)) {
        if (p.length < f.length) {
          var O = f[0], N;
          g = O.prev;
          var M = p[0], L = p[p.length - 1];
          for (N = 0; N < p.length; N += 1)
            $n(p[N], O, n);
          for (N = 0; N < f.length; N += 1)
            d.delete(f[N]);
          Jt(e, M.prev, L.next), Jt(e, g, M), Jt(e, L, O), o = O, g = L, _ -= 1, p = [], f = [];
        } else
          d.delete(c), $n(c, o, n), Jt(e, c.prev, c.next), Jt(e, c, g === null ? e.effect.first : g.next), Jt(e, g, c), g = c;
        continue;
      }
      for (p = [], f = []; o !== null && o !== c; )
        (d ??= /* @__PURE__ */ new Set()).add(o), f.push(o), o = zn(o.next);
      if (o === null)
        continue;
    }
    (c.f & zt) === 0 && p.push(c), g = c, o = zn(c.next);
  }
  if (e.outrogroups !== null) {
    for (const m of e.outrogroups)
      m.pending.size === 0 && (jr(e, _r(m.done)), e.outrogroups?.delete(m));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || d !== void 0) {
    var $ = [];
    if (d !== void 0)
      for (c of d)
        (c.f & tt) === 0 && $.push(c);
    for (; o !== null; )
      (o.f & tt) === 0 && o !== e.fallback && $.push(o), o = zn(o.next);
    var j = $.length;
    if (j > 0) {
      var H = (r & Ca) !== 0 && l === 0 ? n : null;
      if (i) {
        for (_ = 0; _ < j; _ += 1)
          $[_].nodes?.a?.measure();
        for (_ = 0; _ < j; _ += 1)
          $[_].nodes?.a?.fix();
      }
      Vi(e, $, H);
    }
  }
  i && Bt(() => {
    if (b !== void 0)
      for (c of b)
        c.nodes?.a?.apply();
  });
}
function Ki(e, t, n, r, s, i, l, u) {
  var o = (l & Ws) !== 0 ? (l & Ks) === 0 ? /* @__PURE__ */ ki(n, !1, !1) : vn(n) : null, d = (l & Vs) !== 0 ? vn(s) : null;
  return {
    v: o,
    i: d,
    e: bt(() => (i(t, o ?? n, d ?? s, u), () => {
      e.delete(r);
    }))
  };
}
function $n(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & zt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Jn(r)
      );
      if (i.before(r), r === s)
        return;
      r = l;
    }
}
function Jt(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Dn(e, t, n) {
  Za(() => {
    var r = gn(() => t(e, n?.()) || {});
    if (r?.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
const ha = [...` 	
\r\f \v\uFEFF`];
function Ji(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s of Object.keys(n))
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var i = s.length, l = 0; (l = r.indexOf(s, l)) >= 0; ) {
          var u = l + i;
          (l === 0 || ha.includes(r[l - 1])) && (u === r.length || ha.includes(r[u])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(u + 1) : l = u;
        }
  }
  return r === "" ? null : r;
}
function va(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var s of Object.keys(e)) {
    var i = e[s];
    i != null && i !== "" && (r += " " + s + ": " + i + n);
  }
  return r;
}
function Zi(e, t) {
  if (t) {
    var n = "", r, s;
    return Array.isArray(t) ? (r = t[0], s = t[1]) : r = t, r && (n += va(r)), s && (n += va(s, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Se(e, t, n, r, s, i) {
  var l = (
    /** @type {any} */
    e[Ir]
  );
  if (l !== n || l === void 0) {
    var u = Ji(n, r, i);
    u == null ? e.removeAttribute("class") : e.className = u, e[Ir] = n;
  } else if (i && s !== i)
    for (var o in i) {
      var d = !!i[o];
      (s == null || d !== !!s[o]) && e.classList.toggle(o, d);
    }
  return i;
}
function Tr(e, t = {}, n, r) {
  for (var s in n) {
    var i = n[s];
    t[s] !== i && (n[s] == null ? e.style.removeProperty(s) : e.style.setProperty(s, i, r));
  }
}
function on(e, t, n, r) {
  var s = (
    /** @type {any} */
    e[Fr]
  );
  if (s !== t) {
    var i = Zi(t, r);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[Fr] = t;
  } else r && (Array.isArray(r) ? (Tr(e, n?.[0], r[0]), Tr(e, n?.[1], r[1], "important")) : Tr(e, n, r));
  return r;
}
function Un(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Gr(t))
      return si();
    for (var r of e.options)
      r.selected = t.includes(pa(r));
    return;
  }
  for (r of e.options) {
    var s = pa(r);
    if (Ti(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function nr(e) {
  var t = new MutationObserver(() => {
    "__value" in e && Un(e, e.__value);
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
  }), mr(() => {
    t.disconnect();
  });
}
function pa(e) {
  return "__value" in e ? e.__value : e.value;
}
const Qi = Symbol("is custom element"), el = Symbol("is html"), tl = Is ? "progress" : "PROGRESS";
function an(e, t) {
  var n = ta(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== tl) || (e.value = t ?? "");
}
function nl(e, t) {
  var n = ta(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function se(e, t, n, r) {
  var s = ta(e);
  s[t] !== (s[t] = n) && (t === "loading" && (e[Ns] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && rl(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function ta(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[Pa] ??= {
      [Qi]: e.nodeName.includes("-"),
      [el]: e.namespaceURI === ri
    }
  );
}
var ga = /* @__PURE__ */ new Map();
function rl(e) {
  var t = e.getAttribute("is") || e.nodeName, n = ga.get(t);
  if (n) return n;
  ga.set(t, n = []);
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = Ts(s);
    for (var l in r)
      r[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    s = Ma(s);
  }
  return n;
}
function Mr(e, t) {
  return e === t || e?.[un] === t;
}
function vr(e = {}, t, n, r) {
  var s = (
    /** @type {ComponentContext} */
    Je.r
  ), i = (
    /** @type {Effect} */
    le
  );
  return Za(() => {
    var l, u;
    return Qa(() => {
      l = u, u = [], gn(() => {
        Mr(n(...u), e) || (t(e, ...u), l && Mr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== s && o.parent !== null && o.parent.f & Nr; )
        o = o.parent;
      const d = () => {
        u && Mr(n(...u), e) && t(null, ...u);
      }, g = o.teardown;
      o.teardown = () => {
        d(), g?.();
      };
    };
  }), e;
}
function Br(e, t) {
  di(window, ["resize"], () => Fn(() => t(window[e])));
}
function ee(e, t, n, r) {
  var s = !0, i = (n & Qs) !== 0, l = (n & ei) !== 0, u = (
    /** @type {V} */
    r
  ), o = !0, d = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), g = () => l && s ? (d ??= /* @__PURE__ */ Vn(
    /** @type {() => V} */
    r
  ), a(d)) : (o && (o = !1, u = l ? gn(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), u);
  let b;
  if (i) {
    var p = un in e || Os in e;
    b = Sn(e, t)?.set ?? (p && t in e ? (N) => e[t] = N : void 0);
  }
  var f, h = !1;
  i ? [f, h] = ci(() => (
    /** @type {V} */
    e[t]
  )) : f = /** @type {V} */
  e[t], f === void 0 && r !== void 0 && (f = g(), b && (Bs(), b(f)));
  var y;
  if (y = () => {
    var N = (
      /** @type {V} */
      e[t]
    );
    return N === void 0 ? g() : (o = !0, N);
  }, (n & Zs) === 0)
    return y;
  if (b) {
    var c = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(N, M) {
        return arguments.length > 0 ? ((!M || c || h) && b(M ? y() : N), N) : y();
      })
    );
  }
  var _ = !1, S = ((n & Js) !== 0 ? Vn : Ha)(() => (_ = !1, y()));
  i && a(S);
  var O = (
    /** @type {Effect} */
    le
  );
  return (
    /** @type {() => V} */
    (function(N, M) {
      if (arguments.length > 0) {
        const L = M ? a(S) : i ? Ne(N) : N;
        return T(S, L), _ = !0, u !== void 0 && (u = L), N;
      }
      return Gt && _ || (O.f & dt) !== 0 ? S.v : a(S);
    })
  );
}
function Qn(e) {
  Je === null && Fs(), pn(() => {
    const t = gn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const al = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(al);
function sl(e) {
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
async function Zt(e, t = {}) {
  const n = await fetch(e + sl(t));
  if (!n.ok) {
    const r = await n.json().catch(() => ({}));
    throw new Error(`${e} ${n.status}${r.error ? " (" + r.error + ")" : ""}`);
  }
  return n.json();
}
async function yn(e, t) {
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
function _a(e) {
  return e ? {
    column: e.column,
    op: e.op,
    value: Array.isArray(e.value) ? e.value.join(",") : e.value,
    decision: e.decision
  } : {};
}
const Ge = {
  // --- reads
  photos: (e) => Zt("/api/photos", e),
  // Every dimension the header offers, its values, and how many photographs each
  // holds. One request per session: the server builds it once, because it is
  // ~700 ms and it cannot change while a read-only process runs.
  facets: () => Zt("/api/facets"),
  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (e, t) => Zt("/api/triage/counts", { ..._a(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Zt("/api/triage/files"),
  screen: (e, t = {}) => Zt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Zt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Zt("/api/triage/page", { ..._a(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Zt("/api/triage/probe"),
  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (e, t) => yn("/api/triage/rules/add", { ...e, at: t }),
  deleteRule: (e) => yn("/api/triage/rules/delete", { id: e }),
  moveRule: (e, t) => yn("/api/triage/rules/move", { id: e, at: t }),
  override: (e, t) => yn("/api/triage/override", { sha256: e, decision: t }),
  // --- the one surface that leaves the process
  revealPhoto: (e) => yn("/api/reveal", { id: e }),
  revealOrigin: (e) => yn("/api/reveal", { origin: e })
};
function il() {
  let e = 0, t = 0;
  return async function(r) {
    const s = ++e, i = await r();
    return s <= t ? { stale: !0, value: void 0 } : (t = s, { stale: !1, value: i });
  };
}
function ll(e, t) {
  let n = 0;
  const r = (...s) => {
    clearTimeout(n), n = setTimeout(() => e(...s), t);
  };
  return r.cancel = () => clearTimeout(n), r.now = (...s) => {
    clearTimeout(n), e(...s);
  }, r;
}
const ba = ["B", "KB", "MB", "GB", "TB"];
function Rt(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < ba.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${ba[n]}`;
}
function ke(e) {
  return (Number(e) || 0).toLocaleString();
}
const On = "G:\\photos", ma = [
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
      value: t ? `${On}\\${t}\\${e.key}` : `${On}\\${e.key}`
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
function fs(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), r = On.toLowerCase();
  return n.toLowerCase().startsWith(r + "\\") ? n : "";
}
function na(e, t) {
  const n = t.toLowerCase();
  return e.some((r) => n === r || n.startsWith(r + "\\"));
}
function ol(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function ul(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function hs(e, t) {
  if (!t) return null;
  const n = e.find(
    (r) => r.term && r.term.column === t.column && r.term.op === t.op && ul(r.term.value, t.value)
  );
  return n ? n.decision : null;
}
var cl = /* @__PURE__ */ I('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), dl = /* @__PURE__ */ I('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), fl = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7">…</div>'), hl = /* @__PURE__ */ I('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), vl = /* @__PURE__ */ I('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), pl = /* @__PURE__ */ I('<div class="line muted svelte-1vgp6n7"> </div>'), gl = /* @__PURE__ */ I('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function _l(e, t) {
  xt(t, !0);
  let n = ee(t, "counts", 3, null), r = ee(t, "files", 3, null), s = ee(t, "filesAt", 3, null), i = ee(t, "stale", 3, !1), l = ee(t, "candidate", 3, null), u = ee(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ne(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var d = gl(), g = v(d);
  let b;
  var p = w(v(g), 2);
  {
    var f = (H) => {
      var m = dl(), z = ct(m), R = v(z), q = v(R), V = w(R, 2), U = v(V), G = w(V, 4), te = v(G), de = w(G, 2), oe = v(de), Q = w(z, 2);
      {
        var D = (X) => {
          var x = cl(), k = w(v(x), 2), C = v(k), re = w(k, 2), Pe = v(re), ie = w(re, 4), fe = v(ie), Ze = w(ie, 2), ge = v(Ze), Ee = w(Ze, 2), Qe = v(Ee);
          B(
            (Ye, St, $e, we, ye) => {
              A(C, `kept ${Ye ?? ""}`), A(Pe, St), A(fe, `excluded ${$e ?? ""}`), A(ge, we), A(Qe, `${a(o) >= 0 ? "+" : ""}${ye ?? ""} excluded`);
            },
            [
              () => ke(n().candidate_kept_paths),
              () => Rt(n().candidate_kept_bytes),
              () => ke(n().candidate_excluded_paths),
              () => Rt(n().candidate_excluded_bytes),
              () => ke(a(o))
            ]
          ), P(X, x);
        };
        K(Q, (X) => {
          l() && X(D);
        });
      }
      B(
        (X, x, k, C) => {
          A(q, `kept ${X ?? ""}`), A(U, x), A(te, `excluded ${k ?? ""}`), A(oe, C);
        },
        [
          () => ke(n().kept_paths),
          () => Rt(n().kept_bytes),
          () => ke(n().excluded_paths),
          () => Rt(n().excluded_bytes)
        ]
      ), P(H, m);
    }, h = (H) => {
      var m = fl();
      P(H, m);
    };
    K(p, (H) => {
      n() ? H(f) : H(h, -1);
    });
  }
  var y = w(g, 2);
  let c;
  var _ = v(y), S = w(v(_), 3), O = v(S), N = w(S, 2);
  {
    var M = (H) => {
      var m = hl();
      P(H, m);
    };
    K(N, (H) => {
      i() && r() && r() !== "loading" && H(M);
    });
  }
  var L = w(_, 2);
  {
    var $ = (H) => {
      var m = vl(), z = ct(m);
      let R;
      var q = v(z), V = v(q), U = w(q, 2), G = v(U), te = w(U, 4), de = v(te), oe = w(te, 2), Q = v(oe), D = w(z, 2), X = v(D);
      B(
        (x, k, C, re) => {
          R = Se(z, 1, "line svelte-1vgp6n7", null, R, { outdated: i() }), A(V, `kept ${x ?? ""}`), A(G, k), A(de, `excluded ${C ?? ""}`), A(Q, re), A(X, `as of ${s() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => ke(r().kept_files),
          () => Rt(r().kept_bytes),
          () => ke(r().excluded_files),
          () => Rt(r().excluded_bytes)
        ]
      ), P(H, m);
    }, j = (H) => {
      var m = pl(), z = v(m);
      B(() => A(z, r() === "loading" ? "counting…" : "not counted yet")), P(H, m);
    };
    K(L, (H) => {
      r() && r() !== "loading" ? H($) : H(j, -1);
    });
  }
  B(() => {
    b = Se(g, 1, "block svelte-1vgp6n7", null, b, { busy: u() }), c = Se(y, 1, "block svelte-1vgp6n7", null, c, { busy: r() === "loading" }), S.disabled = r() === "loading", A(O, r() === "loading" ? "counting…" : "recount");
  }), Z("click", S, function(...H) {
    t.onfiles?.apply(this, H);
  }), P(e, d), kt();
}
qt(["click"]);
const $r = "http://www.w3.org/2000/svg", sn = {
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
}, en = {
  ...sn,
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
}, bl = [
  { dark: "tint", light: "tintLight", base: sn },
  { dark: "control", light: "controlLight", base: en },
  { dark: "ink", light: "inkLight", base: en },
  { dark: "tally", light: "tallyLight", base: en },
  { dark: "tallyInk", light: "tallyInkLight", base: en }
], Ur = /* @__PURE__ */ new Set();
let Pt = { ...en };
function ml() {
  return Pt;
}
function Ar(e) {
  Pt = xl(e), ra();
  for (const t of Ur) t(Pt);
  return Pt;
}
function wl(e) {
  return Ur.add(e), () => Ur.delete(e);
}
function Gn(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function yl(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: qe(Gn(e.r, t.r), 0, 255),
    g: qe(Gn(e.g, t.g), 0, 255),
    b: qe(Gn(e.b, t.b), 0, 255),
    a: qe(Gn(e.a, t.a), 0, 1)
  };
}
function xl(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [r, s] of Object.entries(en))
    typeof s == "boolean" ? n[r] = t[r] === void 0 ? s : !!t[r] : typeof s == "object" ? n[r] = yl(t[r], s) : n[r] = Gn(t[r], s);
  return n;
}
function gt({ r: e, g: t, b: n, a: r }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Ae(r, 3)})`;
}
function Ae(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function wa({ r: e, g: t, b: n, a: r }) {
  return { r: e, g: t, b: n, a: qe(r * 1.7 + 0.22, 0, 1) };
}
function ya(e, t) {
  const n = 0.4 + qe(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - qe(t, 0, 100) / 100) };
}
function xa(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, s = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? qe(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * s * Math.max(t.glareFactor, 0) / 100;
  return qe(i ** (0.1 + qe(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const kl = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function Sl(e, t, n) {
  const r = qe(n.shapeRoundness, 2, 7), s = e / 2, i = t / 2, l = Math.min(n.shapeRadius, s, i), u = s - l, o = i - l, d = 8, g = [];
  for (let f = 0; f <= d; f++) {
    const h = f / d * (Math.PI / 2);
    g.push([l * Math.cos(h) ** (2 / r), l * Math.sin(h) ** (2 / r)]);
  }
  const b = [], p = (f, h, y, c) => {
    let _ = Math.atan2(f, -h);
    _ < 0 && (_ += Math.PI * 2);
    let S = Math.atan2(c, y);
    S < 0 && (S += Math.PI * 2);
    const O = Ae(xa(S, n), 3);
    b.push(`rgba(255, 255, 255, ${O}) ${Ae(_ / (Math.PI * 2) * 100, 2)}%`);
  };
  p(0, -i, 0, 1);
  for (const [f, h, y] of kl)
    for (let c = 0; c <= d; c++) {
      const [_, S] = g[y ? d - c : c];
      p(f * (u + _), h * (o + S), f * _ ** (r - 1), -h * S ** (r - 1));
    }
  return b.push(`rgba(255, 255, 255, ${Ae(xa(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${b.join(", ")})`;
}
function ra() {
  const e = Pt, t = document.documentElement.style, n = ya(e.refFresnelRange, e.refFresnelHardness), r = ya(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Ae(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Ae(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", gt(e.tint)), t.setProperty("--glass-tint-light", gt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", gt(wa(e.tint))), t.setProperty("--glass-tint-sheet-light", gt(wa(e.tintLight))), t.setProperty("--glass-ctl-dark", gt(e.control)), t.setProperty("--glass-ctl-light", gt(e.controlLight)), t.setProperty("--glass-text-dark", gt(e.ink)), t.setProperty("--glass-text-light", gt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", gt(e.tally)), t.setProperty("--glass-tint-tally-light", gt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", gt(e.tallyInk)), t.setProperty("--glass-text-tally-light", gt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Ae(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Ae(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Ae(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Ae(Math.max(e.pageTop, 0))}px`), t.setProperty(
    "--glass-shadow-geometry",
    `${Ae(e.shadowX)}px ${Ae(-e.shadowY)}px ${Ae(e.shadowExpand)}px`
  ), t.setProperty(
    "--glass-shadow-alpha",
    String(Ae(qe(e.shadowFactor, 0, 100) / 100, 3))
  ), t.setProperty("--glass-radius", `${Ae(e.shapeRadius, 1)}px`), t.setProperty("--glass-roundness", String(Ae(Math.log2(qe(e.shapeRoundness, 2, 7)), 3))), t.setProperty("--glass-fresnel-w", `${Ae(n.width)}px`), t.setProperty("--glass-fresnel-blur", `${Ae(n.blur)}px`), t.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${Ae(qe(e.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`
  ), t.setProperty("--glass-glare-w", `${Ae(r.width)}px`), t.setProperty("--glass-glare-blur", `${Ae(r.blur)}px`);
}
function qe(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function El(e, t, n, r, s, i) {
  const l = Math.abs(e) - n + s, u = Math.abs(t) - r + s, o = Math.max(l, 0), d = Math.max(u, 0), g = i === 2 ? Math.hypot(o, d) : (o ** i + d ** i) ** (1 / i);
  return Math.min(Math.max(l, u), 0) + g - s;
}
function Tl(e, t, n) {
  const r = e / 2, s = t / 2, i = qe(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), u = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), d = (p, f) => El(p - r, f - s, r, s, l, i), g = 256, b = new Float32Array(g + 1);
  for (let p = 0; p <= g; p++) {
    const f = 1 - p / g, h = Math.asin(qe(f * f, 0, 1)), y = Math.asin(qe(Math.sin(h) / o, 0, 1));
    b[p] = Math.tan(h - y) * u;
  }
  return (p, f) => {
    const h = -d(p, f);
    if (h < 0 || h >= u) return null;
    const y = b[Math.round(h / u * g)];
    if (y === 0) return null;
    const c = 0.75, _ = d(p + c, f) - d(p - c, f), S = d(p, f + c) - d(p, f - c), O = Math.hypot(_, S);
    if (O === 0) return null;
    const N = -y / O;
    return { dx: _ * N, dy: S * N };
  };
}
function Ml(e, t, n) {
  const r = document.createElement("canvas");
  r.width = e, r.height = t;
  const s = r.getContext("2d"), i = s.createImageData(e, t), l = i.data, u = e * t, o = new Float32Array(u), d = new Float32Array(u);
  let g = 0;
  for (let p = 0; p < t; p++)
    for (let f = 0; f < e; f++) {
      const h = n(f + 0.5, p + 0.5);
      if (!h) continue;
      const y = p * e + f;
      o[y] = h.dx, d[y] = h.dy;
      const c = Math.hypot(h.dx, h.dy);
      c > g && (g = c);
    }
  const b = g > 0 ? 127 / g : 0;
  for (let p = 0; p < u; p++) {
    const f = p * 4;
    l[f] = 128 + qe(Math.round(o[p] * b), -127, 127), l[f + 1] = 128 + qe(Math.round(d[p] * b), -127, 127), l[f + 2] = 128, l[f + 3] = 255;
  }
  return s.putImageData(i, 0, 0), { url: r.toDataURL(), scale: g * 2 };
}
const Rr = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function Pr(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Ae(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let Hn = null, Al = 0;
function Rl() {
  if (Hn) return Hn;
  const e = document.createElementNS($r, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), Hn = document.createElementNS($r, "defs"), e.appendChild(Hn), document.body.appendChild(e), Hn;
}
function qn(e) {
  const t = `glass-refract-${++Al}`, n = document.createElementNS($r, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), Rl().appendChild(n);
  let r = 0, s = 0, i = 0, l = 0;
  const u = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, d = "";
  function g() {
    e.style.setProperty("--glass-pre", Pt.blurEdge ? "" : d), e.style.setProperty("--glass-post", Pt.blurEdge ? d : "");
  }
  function b() {
    r < 2 || s < 2 || e.style.setProperty("--glass-glare", Sl(r, s, Pt));
  }
  function p() {
    if (r < 2 || s < 2) return;
    const c = Pt, _ = Ml(r, s, Tl(r, s, c)), S = c.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(r)), n.setAttribute("height", String(s)), n.innerHTML = `<feImage x="0" y="0" width="${r}" height="${s}" preserveAspectRatio="none" href="${_.url}" result="map"/>` + Pr(_.scale * (1 + S), Rr[0], "r") + Pr(_.scale, Rr[1], "g") + Pr(_.scale * (1 - S), Rr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, d = `url(#${n.id})`, g(), getComputedStyle(e).backdropFilter.includes("url(") || (d = "", g()), o = u.map((O) => Pt[O]).join(" ");
  }
  function f() {
    l || (l = requestAnimationFrame(() => {
      l = 0, p();
    }));
  }
  const h = new ResizeObserver(([c]) => {
    const _ = c.borderBoxSize?.[0], S = _ ? { w: Math.round(_.inlineSize), h: Math.round(_.blockSize) } : { w: Math.round(c.contentRect.width), h: Math.round(c.contentRect.height) };
    S.w === r && S.h === s || (r = S.w, s = S.h, b(), f());
  });
  h.observe(e);
  const y = wl(() => {
    b(), u.map((c) => Pt[c]).join(" ") !== o ? f() : g();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), y(), h.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const vs = "photos.stack", Cr = { on: !1, window: 4 }, ps = 1, gs = 10;
function Pl() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(vs) ?? "");
  } catch {
    return { ...Cr };
  }
  if (e === null || typeof e != "object") return { ...Cr };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= ps && t <= gs ? t : Cr.window
  };
}
function Cl(e) {
  return localStorage.setItem(vs, JSON.stringify({ on: e.on, window: e.window })), e;
}
const _s = "photos.theme", bs = "dark";
function ms() {
  return document.documentElement.dataset.theme === "light" ? "light" : bs;
}
function Ol() {
  const e = localStorage.getItem(_s), t = e === "dark" || e === "light" ? e : bs;
  return document.documentElement.dataset.theme = t, t;
}
function ws(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(_s, e), e;
}
var Nl = /* @__PURE__ */ I('<strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <span class="muted sep svelte-zne36e">·</span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span>', 1), Il = /* @__PURE__ */ I('<strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span>', 1), Fl = /* @__PURE__ */ I('<span class="spin svelte-zne36e" aria-label="loading"></span>'), ka = /* @__PURE__ */ I('<span class="badge svelte-zne36e"> </span>'), Ll = /* @__PURE__ */ I('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), zl = /* @__PURE__ */ I('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), Dl = /* @__PURE__ */ I("<button> </button>"), Hl = /* @__PURE__ */ I('<div class="glass sheet sorts svelte-zne36e"></div>'), ql = /* @__PURE__ */ I(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), jl = /* @__PURE__ */ I('<p class="muted svelte-zne36e">loading…</p>'), Bl = /* @__PURE__ */ I('<span class="help svelte-zne36e">?</span>'), $l = /* @__PURE__ */ I('<span class="n svelte-zne36e"> </span>'), Ul = /* @__PURE__ */ I("<button> <!></button>"), Gl = /* @__PURE__ */ I('<span class="muted svelte-zne36e">nothing here</span>'), Yl = /* @__PURE__ */ I('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), Wl = /* @__PURE__ */ I('<div class="glass sheet filters svelte-zne36e"><!></div>'), Vl = /* @__PURE__ */ I('<div class="topbar svelte-zne36e"><div class="glass tally svelte-zne36e"><!> <!></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function Xl(e, t) {
  xt(t, !0);
  let n = ee(t, "facets", 3, null), r = ee(t, "selected", 19, () => ({})), s = ee(t, "sort", 3, "newest"), i = ee(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = ee(t, "total", 3, null), u = ee(t, "tiles", 3, null), o = ee(t, "loading", 3, !1), d = ee(t, "onselect", 3, () => {
  }), g = ee(t, "onsort", 3, () => {
  }), b = ee(t, "onstack", 3, () => {
  }), p = ee(t, "onclear", 3, () => {
  }), f = ee(t, "ontriage", 3, () => {
  }), h = /* @__PURE__ */ W(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), y = /* @__PURE__ */ W(Ne(ms())), c = /* @__PURE__ */ W(null);
  const _ = /* @__PURE__ */ ne(() => n()?.dimensions ?? []), S = /* @__PURE__ */ ne(() => n()?.sorts ?? []), O = /* @__PURE__ */ ne(() => a(S).find((F) => F.value === s())?.label ?? s()), N = /* @__PURE__ */ ne(() => Object.values(r()).reduce((F, Y) => F + Y.length, 0)), M = /* @__PURE__ */ ne(() => a(_).flatMap((F) => (r()[F.name] ?? []).map((Y) => ({
    dimension: F.name,
    value: Y,
    title: F.title,
    label: F.options.find((ae) => ae.value === Y)?.label ?? String(Y)
  }))));
  function L(F, Y) {
    const ae = r()[F] ?? [], me = ae.includes(Y) ? ae.filter((ve) => ve !== Y) : [...ae, Y];
    d()(F, me);
  }
  function $(F, Y) {
    return (r()[F] ?? []).includes(Y);
  }
  function j() {
    T(y, ws(a(y) === "dark" ? "light" : "dark"), !0);
  }
  let H = /* @__PURE__ */ W(null);
  const m = /* @__PURE__ */ ne(() => a(H) ?? i().window);
  function z(F) {
    T(H, Number(F), !0);
  }
  function R(F) {
    T(H, null), b()({ ...i(), window: Number(F) });
  }
  pn(() => {
    a(h) !== "stacks" && T(H, null);
  });
  function q(F) {
    F.key === "Escape" && T(h, "");
  }
  function V(F) {
    a(h) && !F.target.closest(".topbar") && T(h, "");
  }
  Qn(() => {
    const F = new ResizeObserver(([Y]) => {
      const ae = Math.round(Y.borderBoxSize?.[0]?.blockSize ?? Y.contentRect.height);
      document.documentElement.style.setProperty("--header-h", ae + "px");
    });
    return F.observe(a(c)), () => {
      F.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var U = Vl();
  Wn("keydown", Pn, q), Wn("pointerdown", Pn, V);
  var G = v(U), te = v(G);
  {
    var de = (F) => {
      var Y = Nl(), ae = ct(Y), me = v(ae), ve = w(ae, 2), ce = v(ve), be = w(ve, 4), je = v(be), Ce = w(be, 2), _e = v(Ce);
      B(
        (Ve, Fe) => {
          A(me, Ve), A(ce, l() === 1 ? "stack" : "stacks"), A(je, Fe), A(_e, u() === 1 ? "photo" : "photos");
        },
        [() => ke(l()), () => ke(u())]
      ), P(F, Y);
    }, oe = (F) => {
      var Y = Il(), ae = ct(Y), me = v(ae), ve = w(ae, 2), ce = v(ve);
      B(
        (be) => {
          A(me, be), A(ce, l() === 1 ? "photo" : "photos");
        },
        [() => l() === null ? "…" : ke(l())]
      ), P(F, Y);
    };
    K(te, (F) => {
      u() !== null ? F(de) : F(oe, -1);
    });
  }
  var Q = w(te, 2);
  {
    var D = (F) => {
      var Y = Fl();
      P(F, Y);
    };
    K(Q, (F) => {
      o() && F(D);
    });
  }
  Dn(G, (F) => qn?.(F));
  var X = w(G, 2), x = v(X), k = v(x), C = v(k);
  let re;
  var Pe = v(C), ie = w(C, 2);
  let fe;
  var Ze = w(v(ie));
  {
    var ge = (F) => {
      var Y = ka(), ae = v(Y);
      B(() => A(ae, a(N))), P(F, Y);
    };
    K(Ze, (F) => {
      a(N) && F(ge);
    });
  }
  var Ee = w(ie, 2);
  let Qe;
  var Ye = w(v(Ee));
  {
    var St = (F) => {
      var Y = ka(), ae = v(Y);
      B((me) => A(ae, me), [() => ke(l())]), P(F, Y);
    };
    K(Ye, (F) => {
      i().on && l() !== null && F(St);
    });
  }
  var $e = w(Ee, 2);
  {
    var we = (F) => {
      var Y = zl(), ae = v(Y);
      Ke(ae, 17, () => a(M), (ve) => ve.dimension + " " + ve.value, (ve, ce) => {
        var be = Ll(), je = v(be), Ce = v(je), _e = w(je, 1, !0);
        B(() => {
          se(be, "title", `${a(ce).title ?? ""}: ${a(ce).label ?? ""} — click to remove`), A(Ce, a(ce).title), A(_e, a(ce).label);
        }), Z("click", be, () => L(a(ce).dimension, a(ce).value)), P(ve, be);
      });
      var me = w(ae, 2);
      Z("click", me, () => p()()), P(F, Y);
    };
    K($e, (F) => {
      a(M).length && F(we);
    });
  }
  var ye = w(k, 2), Ie = v(ye), et = w(ye, 2);
  Dn(x, (F) => qn?.(F));
  var We = w(x, 2);
  {
    var it = (F) => {
      var Y = Hl();
      Ke(Y, 21, () => a(S), Ct, (ae, me) => {
        var ve = Dl();
        let ce;
        var be = v(ve);
        B(() => {
          ce = Se(ve, 1, "option svelte-zne36e", null, ce, { on: a(me).value === s() }), A(be, a(me).label);
        }), Z("click", ve, () => {
          g()(a(me).value), T(h, "");
        }), P(ae, ve);
      }), Dn(Y, (ae) => qn?.(ae)), P(F, Y);
    };
    K(We, (F) => {
      a(h) === "sort" && F(it);
    });
  }
  var ft = w(We, 2);
  {
    var Lt = (F) => {
      var Y = ql(), ae = v(Y), me = w(v(ae), 2), ve = v(me);
      let ce;
      var be = v(ve), je = w(ae, 2), Ce = w(v(je), 2), _e = v(Ce), Ve = w(_e, 2), Fe = v(Ve);
      Dn(Y, (Te) => qn?.(Te)), B(() => {
        ce = Se(ve, 1, "option svelte-zne36e", null, ce, { on: i().on }), se(ve, "aria-checked", i().on), A(be, i().on ? "On" : "Off"), se(_e, "min", ps), se(_e, "max", gs), an(_e, a(m)), se(_e, "aria-valuetext", `${a(m) ?? ""} seconds`), A(Fe, `${a(m) ?? ""}s`);
      }), Z("click", ve, () => b()({ ...i(), on: !i().on })), Z("input", _e, (Te) => z(Te.currentTarget.value)), Z("change", _e, (Te) => R(Te.currentTarget.value)), P(F, Y);
    };
    K(ft, (F) => {
      a(h) === "stacks" && F(Lt);
    });
  }
  var rn = w(ft, 2);
  {
    var lt = (F) => {
      var Y = Wl(), ae = v(Y);
      {
        var me = (ce) => {
          var be = jl();
          P(ce, be);
        }, ve = (ce) => {
          var be = ea(), je = ct(be);
          Ke(je, 17, () => a(_), Ct, (Ce, _e) => {
            var Ve = Yl(), Fe = v(Ve), Te = v(Fe), Wt = w(Te);
            {
              var E = (xe) => {
                var Ue = Bl();
                B(() => se(Ue, "title", a(_e).hint)), P(xe, Ue);
              };
              K(Wt, (xe) => {
                a(_e).hint && xe(E);
              });
            }
            var J = w(Fe, 2), pe = v(J);
            Ke(pe, 17, () => a(_e).options, Ct, (xe, Ue) => {
              var Tt = Ul();
              let nt;
              var _n = v(Tt), Xe = w(_n);
              {
                var rt = (ot) => {
                  var ht = $l(), Vt = v(ht);
                  B((Xt) => A(Vt, Xt), [() => ke(a(Ue).count)]), P(ot, ht);
                };
                K(Xe, (ot) => {
                  a(Ue).count !== null && ot(rt);
                });
              }
              B(
                (ot) => {
                  nt = Se(Tt, 1, "option svelte-zne36e", null, nt, ot), A(_n, `${a(Ue).label ?? ""} `);
                },
                [
                  () => ({ on: $(a(_e).name, a(Ue).value) })
                ]
              ), Z("click", Tt, () => L(a(_e).name, a(Ue).value)), P(xe, Tt);
            });
            var Oe = w(pe, 2);
            {
              var Et = (xe) => {
                var Ue = Gl();
                P(xe, Ue);
              };
              K(Oe, (xe) => {
                a(_e).options.length || xe(Et);
              });
            }
            B(() => A(Te, `${a(_e).title ?? ""} `)), P(Ce, Ve);
          }), P(ce, be);
        };
        K(ae, (ce) => {
          n() ? ce(ve, -1) : ce(me);
        });
      }
      Dn(Y, (ce) => qn?.(ce)), P(F, Y);
    };
    K(rn, (F) => {
      a(h) === "filters" && F(lt);
    });
  }
  vr(U, (F) => T(c, F), () => a(c)), B(() => {
    re = Se(C, 1, "menu svelte-zne36e", null, re, { open: a(h) === "sort" }), se(C, "aria-expanded", a(h) === "sort"), A(Pe, a(O)), fe = Se(ie, 1, "menu svelte-zne36e", null, fe, { open: a(h) === "filters", on: a(N) > 0 }), se(ie, "aria-expanded", a(h) === "filters"), Qe = Se(Ee, 1, "menu svelte-zne36e", null, Qe, { open: a(h) === "stacks", on: i().on }), se(Ee, "aria-expanded", a(h) === "stacks"), se(ye, "title", a(y) === "dark" ? "Switch to a white background" : "Switch to a black background"), se(ye, "aria-label", a(y) === "dark" ? "Switch to a white background" : "Switch to a black background"), A(Ie, a(y) === "dark" ? "☀" : "☾");
  }), Z("click", C, () => T(h, a(h) === "sort" ? "" : "sort", !0)), Z("click", ie, () => T(h, a(h) === "filters" ? "" : "filters", !0)), Z("click", Ee, () => T(h, a(h) === "stacks" ? "" : "stacks", !0)), Z("click", ye, j), Z("click", et, () => f()()), P(e, U), kt();
}
qt(["click", "input", "change"]);
const At = 4, pr = 220, Kl = 340;
function gr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Jl(e, t, n, r, s) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, u = 0, o = 1 / 0;
    for (; l < e.length && (u += gr(e[l]), l++, o = (n - At * (l - i - 1)) / u, !(o <= pr)); )
      ;
    if (o > pr && !r) break;
    s(i, l, Math.round(Math.min(o, Kl))), i = l;
  }
  return i;
}
function Sa(e, t, n) {
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
var Zl = /* @__PURE__ */ I('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), Ql = /* @__PURE__ */ I('<div class="glass pane svelte-5g1i2z" role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div></div>');
function eo(e, t) {
  xt(t, !0);
  let n = ee(t, "frames", 19, () => []), r = ee(t, "origin", 3, null), s = ee(t, "onreveal", 3, () => {
  }), i = ee(t, "onclose", 3, () => {
  });
  const l = 40;
  let u = /* @__PURE__ */ W(0), o = /* @__PURE__ */ W(0), d = /* @__PURE__ */ W(null), g = /* @__PURE__ */ W(Ne(/* @__PURE__ */ new Set()));
  const b = 4, p = 25, f = { x: 0, y: 0, w: 0, h: 0 }, h = /* @__PURE__ */ ne(() => Math.max(0, a(u) - l * 2)), y = /* @__PURE__ */ ne(() => Math.max(0, a(o) - l * 2)), c = /* @__PURE__ */ ne(() => a(h) > 0 && a(y) > 0 ? N(n(), a(h), a(y)) : n().map(() => f));
  function _(m, z, R) {
    const q = [];
    let V = 0, U = 0;
    for (let G = 0; G < m.length; G++)
      U += gr(m[G]), U * R + At * (G - V) >= z && (q.push({ from: V, to: G + 1, sum: U }), V = G + 1, U = 0);
    return V < m.length && q.push({ from: V, to: m.length, sum: U }), q;
  }
  function S(m, z, R) {
    return m.map((q, V) => {
      const U = (z - At * (q.to - q.from - 1)) / q.sum;
      return V === m.length - 1 && U > R ? R : U;
    });
  }
  function O(m, z, R) {
    return S(m, z, R).reduce((q, V) => q + V, 0) + At * (m.length - 1);
  }
  function N(m, z, R) {
    let q = b, V = Math.max(b, R);
    for (let oe = 0; oe < p; oe++) {
      const Q = (q + V) / 2;
      O(_(m, z, Q), z, Q) <= R ? q = Q : V = Q;
    }
    const U = _(m, z, q), G = S(U, z, q), te = [];
    let de = (R - (G.reduce((oe, Q) => oe + Q, 0) + At * (U.length - 1))) / 2;
    return U.forEach((oe, Q) => {
      const D = G[Q], X = [];
      for (let C = oe.from; C < oe.to; C++) X.push(gr(m[C]) * D);
      const x = X.reduce((C, re) => C + re, 0) + At * (X.length - 1);
      let k = (z - x) / 2;
      for (const C of X)
        te.push({
          x: Math.round(k),
          y: Math.round(de),
          w: Math.round(C),
          h: Math.round(D)
        }), k += C + At;
      de += D + At;
    }), te;
  }
  function M(m) {
    if (!r() || !m || !m.w || !m.h) return "none";
    const z = r().left - (l + m.x), R = r().top - (l + m.y);
    return `translate(${z}px, ${R}px) scale(${r().width / m.w}, ${r().height / m.h})`;
  }
  function L(m) {
    m.key === "Escape" && i()();
  }
  function $(m) {
    m.target.closest(".frame") || i()();
  }
  Qn(() => {
    const m = document.activeElement;
    return a(d)?.focus(), () => {
      m instanceof HTMLElement && document.contains(m) && m.focus();
    };
  });
  var j = Ql();
  Wn("keydown", Pn, L), Wn("pointerdown", Pn, $);
  var H = v(j);
  on(H, "", {}, { inset: "40px" }), Ke(H, 23, n, (m) => m.id, (m, z, R) => {
    var q = Zl();
    let V;
    var U = v(q);
    let G;
    B(
      (te, de) => {
        V = on(q, "", V, te), se(U, "src", `/d/${a(z).s ?? ""}.webp`), G = Se(U, 1, "svelte-5g1i2z", null, G, de);
      },
      [
        () => ({
          left: `${a(c)[a(R)].x ?? ""}px`,
          top: `${a(c)[a(R)].y ?? ""}px`,
          width: `${a(c)[a(R)].w ?? ""}px`,
          height: `${a(c)[a(R)].h ?? ""}px`,
          "--flight": M(a(c)[a(R)])
        }),
        () => ({ loaded: a(g).has(a(z).id) })
      ]
    ), Z("click", q, () => s()(a(z))), Wn("load", U, () => T(g, new Set(a(g)).add(a(z).id), !0)), P(m, q);
  }), vr(j, (m) => T(d, m), () => a(d)), B(() => se(j, "aria-label", `${n().length ?? ""} frames in this stack`)), Br("innerWidth", (m) => T(u, m, !0)), Br("innerHeight", (m) => T(o, m, !0)), P(e, j), kt();
}
qt(["click"]);
var to = /* @__PURE__ */ I('<span class="err svelte-uzy12d"> </span>'), no = /* @__PURE__ */ I(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), ro = /* @__PURE__ */ I(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), ao = /* @__PURE__ */ I('<span class="muted svelte-uzy12d"> </span>'), so = /* @__PURE__ */ I('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function io(e, t) {
  xt(t, !0);
  let n = /* @__PURE__ */ W(null), r = /* @__PURE__ */ W(!1), s = /* @__PURE__ */ W(null);
  async function i() {
    T(r, !0), T(s, null);
    try {
      T(n, await Ge.probe(), !0);
    } catch (f) {
      T(s, String(f), !0);
    } finally {
      T(r, !1);
    }
  }
  var l = so(), u = v(l), o = v(u), d = w(u, 2);
  {
    var g = (f) => {
      var h = to(), y = v(h);
      B(() => A(y, a(s))), P(f, h);
    }, b = (f) => {
      var h = ea(), y = ct(h);
      {
        var c = (S) => {
          var O = no(), N = w(v(O), 2);
          B(
            (M) => A(N, ` above are formats the header
        reader cannot measure (${M ?? ""}) or files with no
        extension.`),
            [() => a(n).formats.join(" ")]
          ), P(S, O);
        }, _ = (S) => {
          var O = ro(), N = v(O), M = v(N), L = w(N, 2), $ = v(L);
          B(
            (j) => {
              A(M, j), A($, a(n).command);
            },
            [() => ke(a(n).worklist)]
          ), P(S, O);
        };
        K(y, (S) => {
          a(n).worklist === 0 ? S(c) : S(_, -1);
        });
      }
      P(f, h);
    }, p = (f) => {
      var h = ao(), y = v(h);
      B(() => A(y, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), P(f, h);
    };
    K(d, (f) => {
      a(s) ? f(g) : a(n) ? f(b, 1) : f(p, -1);
    });
  }
  B(() => {
    u.disabled = a(r), A(o, a(r) ? "counting…" : "Check the dimension probe's worklist");
  }), Z("click", u, i), P(e, l), kt();
}
qt(["click"]);
var lo = /* @__PURE__ */ I('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), Ea = /* @__PURE__ */ I("<option> </option>"), oo = /* @__PURE__ */ I('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), uo = /* @__PURE__ */ I('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), co = /* @__PURE__ */ I('<div class="none muted svelte-bqi9ky"> </div>'), fo = /* @__PURE__ */ I('<div class="bar svelte-bqi9ky"><!></div>');
function ho(e, t) {
  xt(t, !0);
  let n = ee(t, "candidate", 3, null), r = ee(t, "saving", 3, !1);
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
  }, l = /* @__PURE__ */ new Set(["width", "height", "long_edge", "camera"]), u = /* @__PURE__ */ ne(() => n() ? i[n().column] ?? ["="] : ["="]), o = /* @__PURE__ */ ne(() => !!n() && n().op !== "is null");
  function d(y, c) {
    const _ = { ...n(), [y]: c };
    if (y === "column") {
      const S = i[c] ?? ["="];
      S.includes(_.op) || (_.op = S[0]), _.value = l.has(c) ? 0 : "";
    }
    y === "op" && c === "is null" && (_.value = null), y === "value" && l.has(_.column) && (_.value = Number(c) || 0), t.onedit(_);
  }
  var g = fo(), b = v(g);
  {
    var p = (y) => {
      var c = lo(), _ = v(c), S = v(_), O = w(_, 2), N = v(O);
      B(() => {
        A(S, `${t.screen.title ?? ""} does not save a rule.`), A(N, t.screen.blurb);
      }), P(y, c);
    }, f = (y) => {
      var c = uo(), _ = ct(c), S = v(_);
      Ke(S, 21, () => s, Ct, (D, X) => {
        var x = Ea(), k = v(x), C = {};
        B(() => {
          A(k, a(X)), C !== (C = a(X)) && (x.value = (x.__value = a(X)) ?? "");
        }), P(D, x);
      });
      var O;
      nr(S);
      var N = w(S, 2);
      Ke(N, 21, () => a(u), Ct, (D, X) => {
        var x = Ea(), k = v(x), C = {};
        B(() => {
          A(k, a(X)), C !== (C = a(X)) && (x.value = (x.__value = a(X)) ?? "");
        }), P(D, x);
      });
      var M;
      nr(N);
      var L = w(N, 2);
      {
        var $ = (D) => {
          var X = oo();
          B(() => an(X, n().value ?? "")), Z("input", X, (x) => d("value", x.currentTarget.value)), P(D, X);
        };
        K(L, (D) => {
          a(o) && D($);
        });
      }
      var j = w(L, 2), H = v(j);
      H.value = H.__value = "exclude";
      var m = w(H);
      m.value = m.__value = "include";
      var z;
      nr(j);
      var R = w(j, 2), q = v(R);
      q.value = q.__value = "end";
      var V = w(q);
      V.value = V.__value = "0";
      var U;
      nr(R);
      var G = w(R, 2), te = v(G), de = w(G, 2), oe = w(_, 2), Q = v(oe);
      B(
        (D, X) => {
          O !== (O = n().column) && (S.value = (S.__value = n().column) ?? "", Un(S, n().column)), M !== (M = n().op) && (N.value = (N.__value = n().op) ?? "", Un(N, n().op)), z !== (z = n().decision ?? "exclude") && (j.value = (j.__value = n().decision ?? "exclude") ?? "", Un(j, n().decision ?? "exclude")), U !== (U = D) && (R.value = (R.__value = D) ?? "", Un(R, D)), G.disabled = r(), A(te, r() ? "saving…" : "Confirm"), A(Q, `${X ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => ol(n())
        ]
      ), Z("change", S, (D) => d("column", D.currentTarget.value)), Z("change", N, (D) => d("op", D.currentTarget.value)), Z("change", j, (D) => d("decision", D.currentTarget.value)), Z("change", R, (D) => d("at", D.currentTarget.value)), Z("click", G, function(...D) {
        t.onconfirm?.apply(this, D);
      }), Z("click", de, function(...D) {
        t.onclear?.apply(this, D);
      }), P(y, c);
    }, h = (y) => {
      var c = co(), _ = v(c);
      B(() => A(_, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), P(y, c);
    };
    K(b, (y) => {
      t.screen.rule === !1 ? y(p) : n() ? y(f, 1) : y(h, -1);
    });
  }
  P(e, g), kt();
}
qt(["change", "input", "click"]);
var vo = /* @__PURE__ */ I('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), po = /* @__PURE__ */ I('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), go = /* @__PURE__ */ I('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), _o = /* @__PURE__ */ I('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function bo(e, t) {
  xt(t, !0);
  let n = ee(t, "rules", 19, () => []), r = ee(t, "unmatched", 3, null), s = ee(t, "busy", 3, !1);
  var i = _o(), l = v(i), u = w(v(l)), o = v(u), d = w(l, 2);
  {
    var g = (h) => {
      var y = vo();
      P(h, y);
    };
    K(d, (h) => {
      n().length === 0 && h(g);
    });
  }
  var b = w(d, 2);
  Ke(b, 19, n, (h) => h.id, (h, y, c) => {
    var _ = po();
    let S;
    var O = v(_), N = v(O), M = v(N), L = w(N, 2), $ = v(L), j = w(L, 2), H = v(j), m = w(O, 2), z = v(m), R = v(z), q = w(z, 2), V = v(q), U = w(q, 4), G = w(U, 2), te = w(G, 2);
    B(
      (de, oe) => {
        S = Se(_, 1, "rule svelte-aof9c2", null, S, { exclude: a(y).decision === "exclude" }), A(M, a(c)), A($, a(y).predicate), A(H, a(y).decision), A(R, `${de ?? ""} paths`), A(V, oe), U.disabled = s() || a(c) === 0, G.disabled = s() || a(c) === n().length - 1, te.disabled = s();
      },
      [
        () => ke(a(y).paths),
        () => Rt(a(y).bytes)
      ]
    ), Z("click", U, () => t.onmove(a(y), a(c) - 1)), Z("click", G, () => t.onmove(a(y), a(c) + 1)), Z("click", te, () => t.ondelete(a(y))), P(h, _);
  });
  var p = w(b, 2);
  {
    var f = (h) => {
      var y = go(), c = w(v(y), 2), _ = v(c), S = v(_), O = w(_, 2), N = v(O);
      B(
        (M, L) => {
          A(S, `${M ?? ""} paths`), A(N, L);
        },
        [
          () => ke(r().paths),
          () => Rt(r().bytes)
        ]
      ), P(h, y);
    };
    K(p, (h) => {
      r() && h(f);
    });
  }
  B(() => A(o, `${n().length ?? ""} rules · top-down, first match wins`)), P(e, i), kt();
}
qt(["click"]);
const Ta = 2500, mo = 1, wo = 2, yo = 3e7;
function xo(e, t, n) {
  const r = [], s = [], i = /* @__PURE__ */ new Map(), l = [], u = [];
  let o = 0, d = 0, g = null, b = null, p = null, f = !1, h = !1, y = 0, c = 0, _ = 0, S = n.onState || (() => {
  });
  function O(x) {
    y <= 0 || (o = Jl(r, o, y, x, (k, C, re) => {
      s.push({ top: d, height: re, from: k, to: C }), d += re + At;
    }), M());
  }
  function N() {
    if (b === null || f || y <= 0 || o >= b) return 0;
    const x = s.length ? o / s.length : Math.max(1, y / pr), k = s.length ? d / s.length : pr + At, C = Math.round((b - o) / x * k);
    return Math.max(0, Math.min(C, yo - d));
  }
  function M() {
    e.style.height = d + N() + "px", t.style.top = Math.max(0, d - 1) + "px";
  }
  function L() {
    return window.scrollY - e.offsetTop;
  }
  function $() {
    const x = l.pop();
    if (x) return x;
    const k = document.createElement("div");
    k.className = "tile";
    const C = document.createElement("img");
    return C.decoding = "async", C.addEventListener("load", () => k.classList.add("loaded")), C.addEventListener("error", () => k.classList.add("missing")), k.appendChild(C), n.extend && n.extend(k), k;
  }
  function j(x, k) {
    k.firstChild.removeAttribute("src"), k.classList.remove("loaded", "missing", "error"), k.style.backgroundImage = "", k.remove(), i.delete(x), l.push(k);
  }
  function H(x, k, C, re, Pe, ie) {
    let fe = i.get(x);
    const Ze = r[x];
    if (!fe) {
      fe = $(), fe.dataset.index = String(x);
      const ge = fe.firstChild;
      ge.fetchPriority = ie ? "high" : "low", ge.src = "/t/" + Ze.s + ".webp", u.push(x), n.fill && n.fill(fe, Ze), e.appendChild(fe), i.set(x, fe);
    }
    fe.style.width = re + "px", fe.style.height = Pe + "px", fe.style.transform = "translate(" + k + "px," + C + "px)";
  }
  function m(x, k) {
    k.th && (k.url === void 0 && (k.url = n.thumbHash(k.th)), k.url && (x.style.backgroundImage = "url(" + k.url + ")"));
  }
  function z() {
    _ = 0;
    for (const x of u) {
      const k = i.get(x);
      k && !k.classList.contains("loaded") && m(k, r[x]);
    }
    u.length = 0;
  }
  function R(x, k) {
    let C = 0;
    for (let re = x.from; re < x.to; re++) {
      const ie = re === x.to - 1 ? y - C : Math.round(gr(r[re]) * x.height);
      H(re, C, x.top, ie, x.height, k), C += ie + At;
    }
  }
  function q() {
    const x = window.innerHeight, k = L(), C = Sa(s, k - x * mo, k + x * (1 + wo));
    if (!C) return;
    const re = s[C[0]].from, Pe = s[C[1]].to;
    for (const [ie, fe] of Array.from(i))
      (ie < re || ie >= Pe) && j(ie, fe);
    for (let ie = C[0]; ie <= C[1]; ie++) {
      const fe = s[ie];
      R(fe, fe.top < k + x && fe.top + fe.height > k);
    }
    u.length && !_ && (_ = requestAnimationFrame(z));
  }
  function V() {
    return y <= 0 ? !1 : d - (L() + window.innerHeight) < Ta;
  }
  async function U() {
    if (h || f) return;
    h = !0;
    const x = c;
    S({ loading: !0, count: r.length, exhausted: f, total: b, tiles: p });
    try {
      do {
        const k = await n.fetchPage(g);
        if (x !== c) return;
        for (const C of k.photos) r.push(C);
        g = k.next, f = g === null, typeof k.stacks == "number" ? (b = k.stacks, p = typeof k.total == "number" ? k.total : null) : typeof k.total == "number" && (b = k.total), O(f), q(), S({ loading: !0, count: r.length, exhausted: f, total: b, tiles: p });
      } while (!f && V());
    } catch (k) {
      x === c && S({ error: String(k) });
    } finally {
      x === c && (h = !1, S({ loading: !1, count: r.length, exhausted: f, total: b, tiles: p }));
    }
  }
  let G = 0;
  function te() {
    G || (G = requestAnimationFrame(() => {
      G = 0, q(), V() && U();
    }));
  }
  function de() {
    const x = e.clientWidth;
    if (x === y) return;
    const k = Sa(s, L(), L()), C = k ? s[k[0]].from : 0;
    y = x;
    for (const [Pe, ie] of Array.from(i)) j(Pe, ie);
    s.length = 0, o = 0, d = 0, O(f), q();
    const re = s.find((Pe) => Pe.to > C);
    re && window.scrollTo(0, re.top + e.offsetTop), V() && U();
  }
  function oe(x) {
    const k = x.target.closest(".tile");
    if (!k || !e.contains(k)) return;
    const C = r[Number(k.dataset.index)];
    C && n.activate && n.activate(C, x, k);
  }
  e.addEventListener("click", oe), window.addEventListener("scroll", te, { passive: !0 });
  let Q = 0;
  const D = new ResizeObserver(() => {
    clearTimeout(Q), Q = setTimeout(de, 100);
  });
  D.observe(e);
  const X = new IntersectionObserver(
    (x) => {
      x.some((k) => k.isIntersecting) && U();
    },
    { rootMargin: "0px 0px " + Ta + "px 0px" }
  );
  return X.observe(t), y = e.clientWidth, U(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      c++, h = !1;
      for (const [x, k] of Array.from(i)) j(x, k);
      r.length = 0, s.length = 0, u.length = 0, o = 0, d = 0, g = null, b = null, p = null, f = !1, e.style.height = "0px", window.scrollTo(0, 0), U();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(x) {
      const k = typeof x == "number" ? x : null;
      k !== b && (b = k, M(), S({ total: b }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [x, k] of i) n.fill(k, r[x]);
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(x) {
      for (const [k, C] of i)
        r[k] === x && n.fill && n.fill(C, x);
    },
    destroy() {
      c++, e.removeEventListener("click", oe), window.removeEventListener("scroll", te), D.disconnect(), X.disconnect(), clearTimeout(Q), cancelAnimationFrame(_);
    }
  };
}
function ko(e) {
  try {
    const t = Uint8Array.from(atob(e), (R) => R.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, r = t[3] | t[4] << 8, s = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, u = (n >> 18 & 31) / 31, o = n >> 23, d = (r >> 3 & 63) / 63, g = (r >> 9 & 63) / 63, b = r >> 15, p = Math.max(3, b ? o ? 5 : 7 : r & 7), f = Math.max(3, b ? r & 7 : o ? 5 : 7);
    let h = o ? 6 : 5, y = 0;
    const c = (R, q, V) => {
      const U = [];
      for (let G = 0; G < q; G++)
        for (let te = G ? 0 : 1; te * q < R * (q - G); te++) {
          const de = t[h + (y >> 1)] >> ((y++ & 1) << 2) & 15;
          U.push((de / 7.5 - 1) * V);
        }
      return U;
    }, _ = c(p, f, u), S = c(3, 3, d * 1.25), O = c(3, 3, g * 1.25), N = p / f, M = Math.max(1, Math.round(N > 1 ? 32 : 32 * N)), L = Math.max(1, Math.round(N > 1 ? 32 / N : 32)), $ = document.createElement("canvas");
    $.width = M, $.height = L;
    const j = $.getContext("2d"), H = j.createImageData(M, L), m = [], z = [];
    for (let R = 0, q = 0; R < L; R++)
      for (let V = 0; V < M; V++, q += 4) {
        let U = s, G = i, te = l;
        for (let D = 0; D < p; D++) m[D] = Math.cos(Math.PI / M * (V + 0.5) * D);
        for (let D = 0; D < f; D++) z[D] = Math.cos(Math.PI / L * (R + 0.5) * D);
        for (let D = 0, X = 0; D < f; D++)
          for (let x = D ? 0 : 1; x * f < p * (f - D); x++, X++)
            U += _[X] * m[x] * z[D] * 2;
        for (let D = 0, X = 0; D < 3; D++)
          for (let x = D ? 0 : 1; x < 3 - D; x++, X++) {
            const k = m[x] * z[D] * 2;
            G += S[X] * k, te += O[X] * k;
          }
        const de = U - 2 / 3 * G, oe = (3 * U - de + te) / 2, Q = oe - te;
        H.data[q] = Math.max(0, Math.min(255, Math.round(255 * oe))), H.data[q + 1] = Math.max(0, Math.min(255, Math.round(255 * Q))), H.data[q + 2] = Math.max(0, Math.min(255, Math.round(255 * de))), H.data[q + 3] = 255;
      }
    return j.putImageData(H, 0, 0), $.toDataURL();
  } catch {
    return null;
  }
}
var So = /* @__PURE__ */ I('<main id="canvas"><div id="sentinel"></div></main>');
function Eo(e, t) {
  xt(t, !0);
  let n = ee(t, "key", 3, ""), r = ee(t, "total", 3, null), s = ee(t, "triage", 3, !1), i = ee(t, "excludedDirs", 19, () => []), l = ee(t, "onActivate", 3, () => {
  }), u = ee(t, "onOverride", 3, async () => null), o = ee(t, "onExcludeFolder", 3, () => {
  }), d = ee(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ W(null), b = /* @__PURE__ */ W(null), p = null, f = "";
  const h = { null: "exclude", exclude: "include", include: "clear" };
  function y(M) {
    const L = M.toLowerCase().startsWith(On.toLowerCase()) ? M.slice(On.length + 1) : M;
    return L.length > 64 ? "…" + L.slice(-64) : L;
  }
  function c(M) {
    const L = document.createElement("div");
    L.className = "tile-path", M.appendChild(L);
    const $ = document.createElement("button");
    $.className = "chip", $.type = "button", M.appendChild($);
    const j = document.createElement("button");
    j.className = "dirchip", j.type = "button", j.textContent = "dir", M.appendChild(j);
  }
  function _(M, L) {
    const $ = M.querySelector(".tile-path");
    $ && ($.textContent = L.p ? y(L.p) : "");
    const j = M.querySelector(".dirchip");
    if (j) {
      const m = fs(L.p ?? ""), z = m !== "" && na(i(), m);
      j.hidden = m === "", j.disabled = z, j.dataset.state = z ? "exclude" : "none", j.title = z ? `already excluded: ${m}` : `exclude everything under ${m}, subfolders included — one exclude rule at the end of the order`;
    }
    const H = M.querySelector(".chip");
    H && (H.dataset.state = L.o || "none", H.textContent = L.o === "exclude" ? "drop" : L.o === "include" ? "keep" : "·", H.title = L.o === "exclude" ? "overridden: excluded — click to keep" : L.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  Qn(() => (p = xo(a(g), a(b), {
    fetchPage: (M) => t.fetchPage(M),
    thumbHash: ko,
    extend: s() ? c : void 0,
    fill: s() ? _ : void 0,
    onState: (M) => d()(M),
    activate: async (M, L, $) => {
      if (L.target.closest(".dirchip")) {
        o()(M);
        return;
      }
      if (!L.target.closest(".chip")) {
        l()(M, $);
        return;
      }
      const j = h[M.o ?? "null"];
      M.o = await u()(M, j), _($, M);
    }
  }), f = n(), () => p?.destroy())), pn(() => {
    const M = n(), L = r();
    p && (M !== f && (f = M, p.reset()), p.setTotal(L));
  });
  let S = "";
  pn(() => {
    const M = i().join(`
`);
    !p || M === S || (S = M, p.refill());
  });
  var O = So(), N = v(O);
  vr(N, (M) => T(b, M), () => a(b)), vr(O, (M) => T(g, M), () => a(g)), P(e, O), kt();
}
var To = /* @__PURE__ */ I('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), Mo = /* @__PURE__ */ I('<th class="num svelte-1v3p82v"> </th>'), Ao = /* @__PURE__ */ I('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), Ro = /* @__PURE__ */ I('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), Po = /* @__PURE__ */ I('<td class="num svelte-1v3p82v"> </td>'), Co = /* @__PURE__ */ I('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), Oo = /* @__PURE__ */ I('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function No(e, t) {
  xt(t, !0);
  let n = ee(t, "rows", 19, () => []), r = ee(t, "rules", 19, () => []), s = ee(t, "root", 3, null), i = ee(t, "selected", 3, null), l = ee(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const u = /* @__PURE__ */ ne(() => t.screen.rule !== !1);
  function o(y) {
    return t.screen.label ? t.screen.label(y) : y.key;
  }
  const d = /* @__PURE__ */ ne(() => new Map(n().map((y) => [
    y.key,
    t.screen.rule === !1 ? null : hs(r(), t.screen.toRule(y, s()))
  ]))), g = { exclude: "✕", include: "✓" }, b = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var p = ea(), f = ct(p);
  {
    var h = (y) => {
      var c = Oo(), _ = v(c), S = v(_), O = v(S);
      {
        var N = (m) => {
          var z = To();
          P(m, z);
        };
        K(O, (m) => {
          a(u) && m(N);
        });
      }
      var M = w(O), L = v(M), $ = w(M, 3);
      {
        var j = (m) => {
          var z = Mo(), R = v(z);
          B(() => A(R, t.screen.heading[1])), P(m, z);
        };
        K($, (m) => {
          t.screen.heading[1] && m(j);
        });
      }
      var H = w(_);
      Ke(H, 23, n, (m) => m.key, (m, z, R) => {
        const q = /* @__PURE__ */ ne(() => a(d).get(a(z).key));
        var V = Co();
        let U;
        var G = v(V);
        {
          var te = (ge) => {
            const Ee = /* @__PURE__ */ ne(() => l().has(a(z).key));
            var Qe = Ao(), Ye = v(Qe);
            let St;
            var $e = v(Ye);
            B(
              (we) => {
                St = Se(Ye, 1, "tick svelte-1v3p82v", null, St, { on: a(Ee) }), se(Ye, "aria-checked", a(Ee)), se(Ye, "aria-label", `select ${we ?? ""}`), A($e, a(Ee) ? "✓" : "");
              },
              [() => o(a(z))]
            ), Z("click", Ye, (we) => {
              we.stopPropagation(), t.oncheck(a(z), a(R), we.shiftKey);
            }), P(ge, Qe);
          };
          K(G, (ge) => {
            a(u) && ge(te);
          });
        }
        var de = w(G), oe = v(de);
        let Q;
        var D = v(oe), X = w(oe), x = w(X);
        {
          var k = (ge) => {
            var Ee = Ro();
            P(ge, Ee);
          };
          K(x, (ge) => {
            a(z).scope === "whole inventory" && ge(k);
          });
        }
        var C = w(de), re = v(C), Pe = w(C), ie = v(Pe), fe = w(Pe);
        {
          var Ze = (ge) => {
            var Ee = Po(), Qe = v(Ee);
            B(() => A(Qe, a(z).detail ?? "")), P(ge, Ee);
          };
          K(fe, (ge) => {
            t.screen.heading[1] && ge(Ze);
          });
        }
        B(
          (ge, Ee, Qe) => {
            U = Se(V, 1, "svelte-1v3p82v", null, U, {
              picked: i() === a(z).key,
              clickable: t.screen.sheet !== !1
            }), Q = Se(oe, 1, "mark svelte-1v3p82v", null, Q, {
              exclude: a(q) === "exclude",
              include: a(q) === "include"
            }), se(oe, "title", b[a(q)] ?? ""), A(D, g[a(q)] ?? ""), A(X, `${ge ?? ""} `), A(re, Ee), A(ie, Qe);
          },
          [
            () => o(a(z)),
            () => ke(a(z).paths),
            () => Rt(a(z).bytes)
          ]
        ), Z("click", V, () => t.onpick(a(z))), P(m, V);
      }), B(() => A(L, t.screen.heading[0] ?? "")), P(y, c);
    };
    K(f, (y) => {
      n().length && y(h);
    });
  }
  P(e, p), kt();
}
qt(["click"]);
var Io = /* @__PURE__ */ I('<button class="twisty svelte-pucy57"> </button>'), Fo = /* @__PURE__ */ I('<span class="twisty leaf svelte-pucy57">·</span>'), Lo = /* @__PURE__ */ I('<span class="name root svelte-pucy57"> </span>'), zo = /* @__PURE__ */ I('<button class="name svelte-pucy57"> </button>'), Do = /* @__PURE__ */ I('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Ho = /* @__PURE__ */ I('<div class="note svelte-pucy57"> </div>'), qo = /* @__PURE__ */ I('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), jo = /* @__PURE__ */ I('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), Bo = /* @__PURE__ */ I('<div class="tree svelte-pucy57"></div>');
function $o(e, t) {
  xt(t, !0);
  let n = ee(t, "version", 3, 0), r = ee(t, "excludedDirs", 19, () => []), s = ee(t, "selected", 3, null), i = ee(t, "busy", 3, !1), l = /* @__PURE__ */ W(Ne(/* @__PURE__ */ new Map())), u = /* @__PURE__ */ W(Ne(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ W(Ne(/* @__PURE__ */ new Set())), d = /* @__PURE__ */ W(Ne(/* @__PURE__ */ new Set()));
  async function g(c) {
    T(o, new Set(a(o)).add(c), !0);
    const _ = await t.onload(c), S = new Map(a(l)), O = new Set(a(d));
    _ ? (S.set(c, _), O.delete(c)) : O.add(c), T(l, S, !0), T(d, O, !0), T(o, new Set([...a(o)].filter((N) => N !== c)), !0);
  }
  function b(c) {
    if (a(u).has(c)) {
      T(u, new Set([...a(u)].filter((_) => _ !== c)), !0);
      return;
    }
    T(u, new Set(a(u)).add(c), !0), a(l).has(c) || g(c);
  }
  let p = -1;
  pn(() => {
    const c = n();
    if (c !== p) {
      p = c, a(u).has(t.root) || T(u, new Set(a(u)).add(t.root), !0);
      for (const _ of a(u)) g(_);
    }
  });
  const f = /* @__PURE__ */ ne(() => {
    const c = [], _ = (M, L, $, j, H, m) => {
      const z = a(l).get(M), R = a(u).has(M);
      if (c.push({
        key: M,
        name: L,
        depth: $,
        paths: j,
        bytes: H,
        deeper: m,
        expanded: R,
        here: z?.here ?? null,
        truncated: !!z?.truncated,
        loading: a(o).has(M),
        failed: a(d).has(M),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: na(r(), M)
      }), !(!R || !z))
        for (const q of z.children)
          _(q.path, q.name, $ + 1, q.paths, q.bytes, q.deeper);
    }, S = a(l).get(t.root), O = S ? S.children.reduce((M, L) => M + L.paths, 0) + S.here.paths : 0, N = S ? S.children.reduce((M, L) => M + L.bytes, 0) + S.here.bytes : 0;
    return _(t.root, t.root, 0, O, N, !0), c;
  }), h = 8;
  var y = Bo();
  Ke(y, 21, () => a(f), (c) => c.key, (c, _) => {
    var S = jo(), O = ct(S);
    let N;
    var M = v(O);
    let L;
    var $ = w(M, 2);
    {
      var j = (x) => {
        var k = Io(), C = v(k);
        B(() => {
          se(k, "aria-expanded", a(_).expanded), se(k, "aria-label", `${a(_).expanded ? "collapse" : "expand"} ${a(_).name ?? ""}`), se(k, "title", a(_).expanded ? "collapse" : "expand"), A(C, a(_).loading ? "·" : a(_).expanded ? "▾" : "▸");
        }), Z("click", k, () => b(a(_).key)), P(x, k);
      }, H = (x) => {
        var k = Fo();
        P(x, k);
      };
      K($, (x) => {
        a(_).deeper ? x(j) : x(H, -1);
      });
    }
    var m = w($, 2);
    {
      var z = (x) => {
        var k = Lo(), C = v(k);
        B(() => A(C, a(_).key)), P(x, k);
      }, R = (x) => {
        var k = zo(), C = v(k);
        B(() => {
          se(k, "title", `Show every kept file under ${a(_).key ?? ""}`), A(C, a(_).name);
        }), Z("click", k, () => t.onpick(a(_))), P(x, k);
      };
      K(m, (x) => {
        a(_).depth === 0 ? x(z) : x(R, -1);
      });
    }
    var q = w(m, 2), V = v(q), U = w(q, 2), G = v(U), te = w(U, 2), de = w(O, 2);
    {
      var oe = (x) => {
        var k = Do();
        let C;
        B((re) => C = on(k, "", C, re), [
          () => ({
            "padding-left": `${Math.min(a(_).depth, h) * 11 + 18}px`
          })
        ]), P(x, k);
      }, Q = (x) => {
        var k = Ho();
        let C;
        var re = v(k);
        B(
          (Pe, ie, fe) => {
            C = on(k, "", C, Pe), A(re, `${ie ?? ""} directly here · ${fe ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(a(_).depth, h) * 11 + 18}px`
            }),
            () => ke(a(_).here.paths),
            () => Rt(a(_).here.bytes)
          ]
        ), P(x, k);
      };
      K(de, (x) => {
        a(_).expanded && a(_).failed ? x(oe) : a(_).expanded && a(_).here && a(_).here.paths > 0 && x(Q, 1);
      });
    }
    var D = w(de, 2);
    {
      var X = (x) => {
        var k = qo();
        let C;
        B((re) => C = on(k, "", C, re), [
          () => ({
            "padding-left": `${Math.min(a(_).depth, h) * 11 + 18}px`
          })
        ]), P(x, k);
      };
      K(D, (x) => {
        a(_).truncated && x(X);
      });
    }
    B(
      (x, k, C) => {
        N = Se(O, 1, "row svelte-pucy57", null, N, {
          picked: s() === a(_).key,
          gone: a(_).excluded
        }), L = on(M, "", L, x), A(V, k), A(G, C), te.disabled = i() || a(_).excluded || a(_).depth === 0, se(te, "title", a(_).depth === 0 ? "The library root is not excludable from here." : a(_).excluded ? "already excluded" : `Exclude everything under ${a(_).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(a(_).depth, h) * 11}px` }),
        () => ke(a(_).paths),
        () => Rt(a(_).bytes)
      ]
    ), Z("click", te, () => t.onexclude(a(_))), P(c, S);
  }), P(e, y), kt();
}
qt(["click"]);
var Uo = /* @__PURE__ */ I('<button title="Back to its default">↺</button>'), Go = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), Yo = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), Wo = /* @__PURE__ */ I('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), Vo = /* @__PURE__ */ I('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), Xo = /* @__PURE__ */ I('<li><code class="svelte-1hh0fwb"> </code> </li>'), Ko = /* @__PURE__ */ I(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), Jo = /* @__PURE__ */ I('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function Zo(e, t) {
  xt(t, !0);
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
        ["headerSide", "Sides", 0, (R) => Math.floor(R / 2), 1],
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
  let u = /* @__PURE__ */ W(Ne(ml())), o = /* @__PURE__ */ W(!0), d = /* @__PURE__ */ W(!1), g = /* @__PURE__ */ W(Ne(ms())), b = /* @__PURE__ */ W(Ne(window.innerWidth));
  const p = (R) => a(g) === "light" ? R.light : R.dark, f = (R) => R in sn ? sn : en, h = (R) => `rgba(${R.r}, ${R.g}, ${R.b}, ${R.a})`, y = /* @__PURE__ */ ne(() => JSON.stringify(a(u), null, 2));
  Qn(() => {
    const R = localStorage.getItem(n);
    if (R)
      try {
        T(u, Ar(JSON.parse(R)), !0);
        return;
      } catch {
      }
    ra();
  });
  function c(R) {
    T(u, Ar({ ...a(u), ...R }), !0), localStorage.setItem(n, JSON.stringify(a(u))), T(d, !1);
  }
  function _(R) {
    T(u, Ar(R), !0), localStorage.setItem(n, JSON.stringify(a(u))), T(d, !1);
  }
  function S(R) {
    c({ [R]: f(R)[R] });
  }
  function O() {
    T(g, ws(a(g) === "dark" ? "light" : "dark"), !0);
  }
  async function N() {
    await navigator.clipboard.writeText(a(y)), T(d, !0);
  }
  var M = Jo();
  let L;
  var $ = v(M), j = w(v($), 4), H = v(j), m = w($, 2);
  {
    var z = (R) => {
      var q = Ko();
      {
        const Ye = ($e, we = rr, ye = rr, Ie = rr) => {
          var et = Uo();
          let We;
          B(() => {
            We = Se(et, 1, "undo svelte-1hh0fwb", null, We, { idle: !ye() }), se(et, "aria-label", `Reset ${we() ?? ""}`);
          }), Z("click", et, function(...it) {
            Ie()?.apply(this, it);
          }), P($e, et);
        };
        var V = w(v(q), 2);
        Ke(V, 17, () => r, Ct, ($e, we) => {
          var ye = Yo(), Ie = v(ye), et = v(Ie), We = w(Ie, 2), it = v(We), ft = w(We, 2);
          Ke(ft, 17, () => a(we).rows, Ct, (Lt, rn) => {
            var lt = /* @__PURE__ */ ne(() => kr(a(rn), 5));
            let F = () => a(lt)[0], Y = () => a(lt)[1], ae = () => a(lt)[2], me = () => a(lt)[3], ve = () => a(lt)[4];
            const ce = /* @__PURE__ */ ne(() => a(u)[F()] !== f(F())[F()]), be = /* @__PURE__ */ ne(() => typeof me() == "function" ? me()(a(b)) : me());
            var je = Go();
            let Ce;
            var _e = v(je), Ve = v(_e), Fe = w(_e, 2), Te = w(Fe, 2), Wt = w(Te, 2);
            Ye(Wt, Y, () => a(ce), () => () => S(F())), B(() => {
              Ce = Se(je, 1, "row svelte-1hh0fwb", null, Ce, { moved: a(ce) }), A(Ve, Y()), se(Fe, "min", ae()), se(Fe, "max", a(be)), se(Fe, "step", ve()), se(Fe, "aria-label", Y()), an(Fe, a(u)[F()]), se(Te, "min", ae()), se(Te, "max", a(be)), se(Te, "step", ve()), se(Te, "aria-label", `${Y() ?? ""} value`), an(Te, a(u)[F()]);
            }), Z("input", Fe, (E) => c({ [F()]: Number(E.currentTarget.value) })), Z("input", Te, (E) => c({ [F()]: Number(E.currentTarget.value) })), P(Lt, je);
          }), B(() => {
            A(et, a(we).title), A(it, a(we).note);
          }), P($e, ye);
        });
        var U = w(V, 2), G = v(U), te = w(U, 2), de = v(te), oe = w(te, 2);
        Ke(oe, 17, () => bl, Ct, ($e, we) => {
          const ye = /* @__PURE__ */ ne(() => p(a(we))), Ie = /* @__PURE__ */ ne(() => a(u)[a(ye)]), et = /* @__PURE__ */ ne(() => a(we).base[a(ye)]);
          var We = Vo(), it = v(We), ft = v(it), Lt = w(ft), rn = v(Lt), lt = w(it, 2), F = v(lt), Y = w(lt, 2);
          Ke(Y, 17, () => i, Ct, (ce, be) => {
            var je = /* @__PURE__ */ ne(() => kr(a(be), 3));
            let Ce = () => a(je)[0], _e = () => a(je)[1], Ve = () => a(je)[2];
            const Fe = /* @__PURE__ */ ne(() => a(Ie)[Ce()] !== a(et)[Ce()]);
            var Te = Wo();
            let Wt;
            var E = v(Te), J = v(E), pe = w(E, 2), Oe = w(pe, 2), Et = w(Oe, 2);
            Ye(Et, _e, () => a(Fe), () => () => c({
              [a(ye)]: { ...a(Ie), [Ce()]: a(et)[Ce()] }
            })), B(() => {
              Wt = Se(Te, 1, "row svelte-1hh0fwb", null, Wt, { moved: a(Fe) }), A(J, _e()), se(pe, "max", Ve()), se(pe, "step", Ve() === 1 ? 0.01 : 1), se(pe, "aria-label", `${a(g) ?? ""} ${s[a(we).dark].title ?? ""} ${_e() ?? ""}`), an(pe, a(Ie)[Ce()]), se(Oe, "max", Ve()), se(Oe, "step", Ve() === 1 ? 0.01 : 1), se(Oe, "aria-label", `${a(g) ?? ""} ${s[a(we).dark].title ?? ""} ${_e() ?? ""} value`), an(Oe, a(Ie)[Ce()]);
            }), Z("input", pe, (xe) => c({
              [a(ye)]: {
                ...a(Ie),
                [Ce()]: Number(xe.currentTarget.value)
              }
            })), Z("input", Oe, (xe) => c({
              [a(ye)]: {
                ...a(Ie),
                [Ce()]: Number(xe.currentTarget.value)
              }
            })), P(ce, Te);
          });
          var ae = w(Y, 2);
          let me;
          var ve = v(ae);
          B(
            (ce, be) => {
              A(ft, `${s[a(we).dark].title ?? ""} `), A(rn, a(g)), A(F, s[a(we).dark].note), me = on(ae, "", me, ce), A(ve, be);
            },
            [
              () => ({ background: h(a(Ie)) }),
              () => h(a(Ie))
            ]
          ), P($e, We);
        });
        var Q = w(oe, 2), D = w(v(Q), 4);
        let St;
        var X = v(D), x = v(X), k = w(X, 2);
        Ye(k, () => "Blur at the edge", () => a(u).blurEdge !== sn.blurEdge, () => () => S("blurEdge"));
        var C = w(Q, 2), re = w(v(C), 4);
        Ke(re, 21, () => l, Ct, ($e, we) => {
          var ye = /* @__PURE__ */ ne(() => kr(a(we), 2));
          let Ie = () => a(ye)[0], et = () => a(ye)[1];
          var We = Xo(), it = v(We), ft = v(it), Lt = w(it);
          B(() => {
            A(ft, Ie()), A(Lt, ` — ${et() ?? ""}`);
          }), P($e, We);
        });
        var Pe = w(C, 2), ie = w(v(Pe), 4), fe = v(ie), Ze = w(fe, 2), ge = w(Ze, 2), Ee = v(ge), Qe = w(ie, 2);
        B(() => {
          A(G, `The five colours below are per theme, and you are editing the ${a(g) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), A(de, `Edit the ${a(g) === "dark" ? "light" : "dark"} colours`), St = Se(D, 1, "row toggle svelte-1hh0fwb", null, St, { moved: a(u).blurEdge !== sn.blurEdge }), nl(x, a(u).blurEdge), A(Ee, a(d) ? "Copied" : "Copy"), an(Qe, a(y));
        }), Z("click", te, O), Z("change", x, ($e) => c({ blurEdge: $e.currentTarget.checked })), Z("click", fe, () => _(en)), Z("click", Ze, () => _(sn)), Z("click", ge, N);
      }
      P(R, q);
    };
    K(m, (R) => {
      a(o) && R(z);
    });
  }
  B(() => {
    L = Se(M, 1, "tuner svelte-1hh0fwb", null, L, { folded: !a(o) }), se(j, "title", a(o) ? "Fold away" : "Open"), A(H, a(o) ? "–" : "+");
  }), Br("innerWidth", (R) => T(b, R, !0)), Z("click", j, () => T(o, !a(o))), P(e, M), kt();
}
qt(["click", "input", "change"]);
var Qo = /* @__PURE__ */ I('<button><span class="n svelte-1n46o8q"> </span> </button>'), eu = /* @__PURE__ */ I('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), tu = /* @__PURE__ */ I('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), nu = /* @__PURE__ */ I('<div class="muted pad svelte-1n46o8q">loading…</div>'), ru = /* @__PURE__ */ I('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), au = /* @__PURE__ */ I('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!></aside>'), su = /* @__PURE__ */ I('<p class="blurb"> </p>'), iu = /* @__PURE__ */ I('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), lu = /* @__PURE__ */ I('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), ou = /* @__PURE__ */ I('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), uu = /* @__PURE__ */ I('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), cu = /* @__PURE__ */ I("<div> </div>"), du = /* @__PURE__ */ I('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function fu(e, t) {
  xt(t, !0);
  const n = location.pathname === "/tune";
  let r = /* @__PURE__ */ W("grid"), s = /* @__PURE__ */ W(0), i = /* @__PURE__ */ W(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ W(Ne([])), u = /* @__PURE__ */ W(null), o = /* @__PURE__ */ W(null), d = /* @__PURE__ */ W(Ne(/* @__PURE__ */ new Set())), g = /* @__PURE__ */ W(null), b = /* @__PURE__ */ W(null), p = /* @__PURE__ */ W(null), f = /* @__PURE__ */ W(null), h = /* @__PURE__ */ W(!1), y = /* @__PURE__ */ W(!1), c = /* @__PURE__ */ W(!1), _ = /* @__PURE__ */ W(!1), S = /* @__PURE__ */ W(Ne({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), O = /* @__PURE__ */ W(null), N = /* @__PURE__ */ W(0), M = /* @__PURE__ */ W(null), L = /* @__PURE__ */ W(Ne({})), $ = /* @__PURE__ */ W("newest"), j = /* @__PURE__ */ W(Ne(Pl())), H = /* @__PURE__ */ W(null);
  const m = /* @__PURE__ */ ne(() => ma[a(s)]), z = /* @__PURE__ */ ne(() => a(m).table !== !1), R = /* @__PURE__ */ ne(() => a(z) || a(m).tree === !0), q = /* @__PURE__ */ ne(() => a(m).sheet !== !1 && (a(o) !== null || !a(R))), V = /* @__PURE__ */ ne(() => ({
    sort: a($),
    ...a(j).on ? { stack: a(j).window } : {},
    ...Object.fromEntries(Object.entries(a(L)).filter(([, E]) => E.length > 0))
  })), U = /* @__PURE__ */ ne(() => a(r) === "grid" ? `grid:${JSON.stringify(a(V))}` : `triage:${a(s)}:${JSON.stringify(a(o))}`), G = /* @__PURE__ */ ne(() => a(m).rule === !1 || a(d).size === 0 ? [] : a(l).filter((E) => a(d).has(E.key)).map((E) => a(m).toRule(E, a(i))).filter((E) => E && hs(a(b)?.rules ?? [], E) !== "exclude")), te = /* @__PURE__ */ ne(() => (a(b)?.rules ?? []).filter((E) => E.decision === "exclude" && E.term?.column === "dir_under").map((E) => String(E.term.value).replace(/[\\/]+$/, "").toLowerCase())), de = il();
  function oe(E) {
    T(O, String(E), !0);
  }
  async function Q(E) {
    try {
      return T(O, null), await E();
    } catch (J) {
      return oe(J), null;
    }
  }
  const D = ll(
    () => {
      T(y, !0), Q(async () => {
        const E = a(o)?.at === "end" || a(o)?.at === void 0 ? void 0 : 0, { stale: J, value: pe } = await de(() => Ge.counts(a(o), E));
        J || T(b, pe, !0);
      }).finally(() => {
        T(y, !1);
      });
    },
    220
  );
  async function X() {
    T(p, "loading");
    const E = await Q(() => Ge.files());
    T(p, E, !0), T(h, !1), T(f, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function x(E = !1) {
    if (a(r) !== "triage" || !a(z)) {
      T(l, [], !0);
      return;
    }
    T(_, !0);
    const J = a(m).name === "source_folder" && a(i) ? { root: a(i) } : {};
    E && (J.live = "1");
    const pe = await Q(() => Ge.screen(a(m).name, J));
    T(l, pe?.rows ?? [], !0), T(_, !1);
  }
  let k = !1;
  pn(() => {
    a(s), a(r), gn(() => {
      T(u, null), T(o, null), T(i, null), ie(), a(r) === "triage" && (x(), D.now(), k || (k = !0, X()));
    });
  }), pn(() => {
    a(i), gn(() => {
      a(r) === "triage" && (ie(), x());
    });
  }), Qn(() => {
    Q(async () => {
      T(M, await Ge.facets(), !0);
    });
  });
  function C(E, J) {
    T(L, { ...a(L), [E]: J }, !0);
  }
  function re(E) {
    if (a(m).sheet !== !1) {
      if (a(m).drill && !a(i)) {
        T(u, E.key, !0), T(
          o,
          {
            ...a(m).toRule(E, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), T(i, E.key, !0);
        return;
      }
      T(u, E.key, !0), T(
        o,
        {
          ...a(m).toRule(E, a(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), D();
    }
  }
  function Pe(E, J, pe) {
    const Oe = new Set(a(d)), Et = !Oe.has(E.key), xe = pe && a(g) !== null ? a(l).findIndex((nt) => nt.key === a(g)) : -1, [Ue, Tt] = xe < 0 ? [J, J] : xe < J ? [xe, J] : [J, xe];
    for (let nt = Ue; nt <= Tt; nt++)
      Et ? Oe.add(a(l)[nt].key) : Oe.delete(a(l)[nt].key);
    T(d, Oe, !0), T(g, E.key, !0);
  }
  function ie() {
    T(d, /* @__PURE__ */ new Set(), !0), T(g, null);
  }
  function fe(E) {
    T(o, E, !0), T(
      u,
      null
      // it no longer corresponds to a row
    ), D();
  }
  function Ze(E = !1) {
    T(o, null), T(u, null), E && T(i, null), D.now();
  }
  async function ge() {
    T(
      h,
      !0
      // the distinct-content number now says so on its face
    ), Ei(N), await x(), D.now();
  }
  async function Ee() {
    if (!a(o)) return;
    T(c, !0);
    const E = a(o).at === "end" ? void 0 : 0, J = await Q(() => Ge.addRule(
      {
        column: a(o).column,
        op: a(o).op,
        value: a(o).value,
        decision: a(o).decision ?? "exclude",
        note: `screen ${a(m).id} ${a(m).title}`
      },
      E
    ));
    T(c, !1), J && (T(o, null), T(u, null), await ge());
  }
  async function Qe() {
    const E = a(G);
    if (!E.length) {
      ie();
      return;
    }
    T(c, !0);
    for (const J of E)
      if (!await Q(() => Ge.addRule({
        column: J.column,
        op: J.op,
        value: J.value,
        decision: "exclude",
        note: `screen ${a(m).id} ${a(m).title}`
      }))) break;
    T(c, !1), ie(), T(o, null), T(u, null), await ge();
  }
  async function Ye(E) {
    if (!E || na(a(te), E)) return;
    T(c, !0);
    const J = await Q(() => Ge.addRule({
      column: "dir_under",
      op: "=",
      value: E,
      decision: "exclude",
      note: `screen ${a(m).id} ${a(m).title}`
    }));
    T(c, !1), J && await ge();
  }
  const St = (E) => Ye(fs(E.p ?? "")), $e = (E) => Ye(E.key);
  async function we(E) {
    T(c, !0), await Q(() => Ge.deleteRule(E.id)), T(c, !1), await ge();
  }
  async function ye(E, J) {
    T(c, !0), await Q(() => Ge.moveRule(E.id, J)), T(c, !1), await ge();
  }
  async function Ie(E, J) {
    const pe = await Q(() => Ge.override(E.s, J));
    return pe ? (T(h, !0), D(), pe.decision) : E.o ?? null;
  }
  function et(E) {
    return a(r) === "grid" ? Ge.photos({ limit: 500, ...a(V), ...E || {} }) : Ge.page(a(o), E);
  }
  function We(E, J) {
    if (a(r) === "grid" && E.m) {
      T(H, { frames: E.m, origin: J.getBoundingClientRect() }, !0);
      return;
    }
    Q(() => a(r) === "grid" ? Ge.revealPhoto(E.id) : Ge.revealOrigin(E.id));
  }
  function it(E) {
    T(H, null), Q(() => Ge.revealPhoto(E.id));
  }
  var ft = du(), Lt = ct(ft);
  {
    var rn = (E) => {
      Xl(E, {
        get facets() {
          return a(M);
        },
        get selected() {
          return a(L);
        },
        get sort() {
          return a($);
        },
        get stacking() {
          return a(j);
        },
        get total() {
          return a(S).total;
        },
        get tiles() {
          return a(S).tiles;
        },
        get loading() {
          return a(S).loading;
        },
        onselect: C,
        onsort: (J) => T($, J, !0),
        onstack: (J) => T(j, Cl(J), !0),
        onclear: () => T(L, {}, !0),
        ontriage: () => T(r, "triage")
      });
    };
    K(Lt, (E) => {
      a(r) === "grid" && E(rn);
    });
  }
  var lt = w(Lt, 2);
  {
    var F = (E) => {
      Zo(E, {});
    };
    K(lt, (E) => {
      n && E(F);
    });
  }
  var Y = w(lt, 2);
  let ae;
  var me = v(Y);
  {
    var ve = (E) => {
      var J = au(), pe = v(J), Oe = v(pe), Et = w(pe, 2);
      Ke(Et, 21, () => ma, Ct, (Xe, rt, ot) => {
        var ht = Qo();
        let Vt;
        var Xt = v(ht), bn = v(Xt), Me = w(Xt, 1, !0);
        B(() => {
          Vt = Se(ht, 1, "nav svelte-1n46o8q", null, Vt, { on: ot === a(s) }), A(bn, a(rt).id), A(Me, a(rt).title);
        }), Z("click", ht, () => T(s, ot, !0)), P(Xe, ht);
      });
      var xe = w(Et, 2);
      {
        var Ue = (Xe) => {
          var rt = ru(), ot = ct(rt), ht = v(ot);
          {
            var Vt = (Le) => {
              var pt = eu(), Mt = ct(pt), wr = /* @__PURE__ */ ne(() => Ze.bind(null, !0)), Ln = w(Mt, 2), yr = v(Ln);
              B(() => A(yr, `inside ${a(i) ?? ""}`)), Z("click", Mt, function(...xr) {
                a(wr)?.apply(this, xr);
              }), P(Le, pt);
            }, Xt = (Le) => {
              var pt = tu(), Mt = v(pt);
              B(() => A(Mt, a(m).relive)), Z("click", pt, () => x(!0)), P(Le, pt);
            };
            K(ht, (Le) => {
              a(m).drill && a(i) ? Le(Vt) : a(m).relive && Le(Xt, 1);
            });
          }
          var bn = w(ot, 2);
          {
            var Me = (Le) => {
              var pt = nu();
              P(Le, pt);
            };
            K(bn, (Le) => {
              a(_) && Le(Me);
            });
          }
          var vt = w(bn, 2);
          {
            let Le = /* @__PURE__ */ ne(() => a(b)?.rules ?? []);
            No(vt, {
              get rows() {
                return a(l);
              },
              get screen() {
                return a(m);
              },
              get root() {
                return a(i);
              },
              get checked() {
                return a(d);
              },
              get rules() {
                return a(Le);
              },
              get selected() {
                return a(u);
              },
              onpick: re,
              oncheck: Pe
            });
          }
          P(Xe, rt);
        };
        K(xe, (Xe) => {
          a(z) && Xe(Ue);
        });
      }
      var Tt = w(xe, 2);
      {
        var nt = (Xe) => {
          $o(Xe, {
            get root() {
              return On;
            },
            get version() {
              return a(N);
            },
            get excludedDirs() {
              return a(te);
            },
            get selected() {
              return a(u);
            },
            get busy() {
              return a(c);
            },
            onload: (rt) => Q(() => Ge.tree(rt)),
            onpick: re,
            onexclude: $e
          });
        };
        K(Tt, (Xe) => {
          a(m).tree && Xe(nt);
        });
      }
      var _n = w(Tt, 2);
      {
        let Xe = /* @__PURE__ */ ne(() => a(b)?.rules ?? []), rt = /* @__PURE__ */ ne(() => a(b)?.unmatched ?? null);
        bo(_n, {
          get rules() {
            return a(Xe);
          },
          get unmatched() {
            return a(rt);
          },
          get busy() {
            return a(c);
          },
          ondelete: we,
          onmove: ye
        });
      }
      Z("click", Oe, () => T(r, "grid")), P(E, J);
    };
    K(me, (E) => {
      a(r) === "triage" && E(ve);
    });
  }
  var ce = w(me, 2), be = v(ce);
  {
    var je = (E) => {
      var J = uu(), pe = ct(J), Oe = v(pe), Et = w(pe, 2), xe = v(Et), Ue = w(Et, 2);
      {
        var Tt = (Me) => {
          var vt = su(), Le = v(vt);
          B(() => A(Le, a(m).note)), P(Me, vt);
        };
        K(Ue, (Me) => {
          a(m).note && Me(Tt);
        });
      }
      var nt = w(Ue, 2);
      {
        var _n = (Me) => {
          io(Me, {
            get screen() {
              return a(m);
            }
          });
        };
        K(nt, (Me) => {
          a(m).name === "dimensions" && Me(_n);
        });
      }
      var Xe = w(nt, 2);
      _l(Xe, {
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
          return a(y);
        },
        onfiles: X
      });
      var rt = w(Xe, 2);
      {
        var ot = (Me) => {
          var vt = iu(), Le = v(vt), pt = v(Le), Mt = w(Le, 2), wr = v(Mt), Ln = w(Mt, 2), yr = w(Ln, 2), xr = v(yr);
          {
            var ys = (Kt) => {
              var mn = da("already excluded — nothing left to write");
              P(Kt, mn);
            }, xs = (Kt) => {
              var mn = da();
              B((ks) => A(mn, `one exclude rule each, at the end of the order${ks ?? ""}`), [
                () => a(G).length < a(d).size ? ` · ${ke(a(d).size - a(G).length)} already excluded, skipped` : ""
              ]), P(Kt, mn);
            };
            K(xr, (Kt) => {
              a(G).length ? Kt(xs, -1) : Kt(ys);
            });
          }
          B(
            (Kt, mn) => {
              A(pt, `${Kt ?? ""} ticked`), Mt.disabled = a(c) || !a(G).length, A(wr, mn), Ln.disabled = a(c);
            },
            [
              () => ke(a(d).size),
              () => a(c) ? "saving…" : `Exclude ${ke(a(G).length)}`
            ]
          ), Z("click", Mt, Qe), Z("click", Ln, ie), P(Me, vt);
        };
        K(rt, (Me) => {
          a(d).size && Me(ot);
        });
      }
      var ht = w(rt, 2);
      ho(ht, {
        get candidate() {
          return a(o);
        },
        get screen() {
          return a(m);
        },
        get saving() {
          return a(c);
        },
        onedit: fe,
        onconfirm: Ee,
        onclear: Ze
      });
      var Vt = w(ht, 2);
      {
        var Xt = (Me) => {
          var vt = lu(), Le = v(vt);
          B((pt, Mt) => A(Le, `${pt ?? ""}${Mt ?? ""} loaded${a(S).exhausted ? " · all of them" : ""}${a(S).loading ? " · loading…" : ""} `), [
            () => ke(a(S).count),
            () => a(S).total ? " of " + ke(a(S).total) : ""
          ]), P(Me, vt);
        }, bn = (Me) => {
          var vt = ou();
          P(Me, vt);
        };
        K(Vt, (Me) => {
          a(q) ? Me(Xt) : a(m).sheet === !1 && Me(bn, 1);
        });
      }
      B(() => {
        A(Oe, `${a(m).id ?? ""} · ${a(m).title ?? ""}`), A(xe, a(m).blurb);
      }), P(E, J);
    };
    K(be, (E) => {
      a(r) === "triage" && E(je);
    });
  }
  var Ce = w(be, 2);
  {
    var _e = (E) => {
      {
        let J = /* @__PURE__ */ ne(() => a(r) === "grid" ? null : a(b)?.page_paths ?? null), pe = /* @__PURE__ */ ne(() => a(r) === "triage");
        Eo(E, {
          get key() {
            return a(U);
          },
          fetchPage: et,
          get total() {
            return a(J);
          },
          get triage() {
            return a(pe);
          },
          get excludedDirs() {
            return a(te);
          },
          onActivate: We,
          onOverride: Ie,
          onExcludeFolder: St,
          onState: (Oe) => T(S, { ...a(S), ...Oe }, !0)
        });
      }
    };
    K(Ce, (E) => {
      (a(q) || a(r) === "grid") && E(_e);
    });
  }
  var Ve = w(Y, 2);
  {
    var Fe = (E) => {
      eo(E, {
        get frames() {
          return a(H).frames;
        },
        get origin() {
          return a(H).origin;
        },
        onreveal: it,
        onclose: () => T(H, null)
      });
    };
    K(Ve, (E) => {
      a(H) && E(Fe);
    });
  }
  var Te = w(Ve, 2);
  {
    var Wt = (E) => {
      var J = cu();
      let pe;
      var Oe = v(J);
      B(() => {
        pe = Se(J, 1, "status", null, pe, { bare: a(r) === "grid" }), A(Oe, a(O));
      }), P(E, J);
    };
    K(Te, (E) => {
      a(O) && E(Wt);
    });
  }
  B(() => ae = Se(Y, 1, "shell", null, ae, { bare: a(r) === "grid" })), P(e, ft), kt();
}
qt(["click"]);
Ol();
ra();
Ui(fu, { target: document.getElementById("app") });
