var ds = Array.isArray, Ka = Array.prototype.indexOf, Tr = Array.prototype.includes, Fr = Array.from, Va = Object.defineProperty, Wn = Object.getOwnPropertyDescriptor, Xa = Object.getOwnPropertyDescriptors, Ja = Object.prototype, Za = Array.prototype, Js = Object.getPrototypeOf, Ts = Object.isExtensible;
const kr = () => {
};
function Qa(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Zs() {
  var e, t, n = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
function Ur(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const s of e)
    if (n.push(s), n.length === t) break;
  return n;
}
const Ue = 2, $n = 4, Lr = 8, Qs = 1 << 24, Ot = 16, St = 32, tn = 64, Qr = 128, kt = 512, He = 1024, qe = 2048, zt = 4096, rt = 8192, ft = 16384, Zn = 32768, es = 1 << 25, Yn = 65536, Mr = 1 << 17, ei = 1 << 18, Qn = 1 << 19, ti = 1 << 20, Ht = 1 << 25, In = 65536, Ar = 1 << 21, Gn = 1 << 22, mn = 1 << 23, Pn = Symbol("$state"), ni = Symbol("legacy props"), ri = Symbol(""), ea = Symbol("attributes"), ts = Symbol("class"), ns = Symbol("style"), rs = Symbol("text"), gr = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), si = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function ai(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function ii() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function li(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function oi(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ci() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ui(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function di() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function fi(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function hi() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function vi() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function pi() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function gi() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const _i = 1, bi = 2, ta = 4, mi = 8, wi = 16, yi = 1, xi = 4, ki = 8, Si = 16, Ei = 1, Ti = 2, je = Symbol("uninitialized"), Mi = "http://www.w3.org/1999/xhtml";
function Ai() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Ri() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Pi() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function na(e) {
  return e === this.v;
}
function Ci(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ra(e) {
  return !Ci(e, this.v);
}
let Je = null;
function Kn(e) {
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
      _e
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
      xa(s);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Je = t.p, e ?? /** @type {T} */
  {};
}
function sa() {
  return !0;
}
let Mn = [];
function aa() {
  var e = Mn;
  Mn = [], Qa(e);
}
function Jt(e) {
  if (Mn.length === 0 && !dr) {
    var t = Mn;
    queueMicrotask(() => {
      t === Mn && aa();
    });
  }
  Mn.push(e);
}
function Oi() {
  for (; Mn.length > 0; )
    aa();
}
function ia(e) {
  var t = _e;
  if (t === null)
    return me.f |= mn, e;
  if ((t.f & Zn) === 0 && (t.f & $n) === 0)
    throw e;
  _n(e, t);
}
function _n(e, t) {
  if (!(t !== null && (t.f & ft) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & Qr) !== 0) {
        if ((t.f & Zn) === 0)
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
const Ni = -7169;
function Ie(e, t) {
  e.f = e.f & Ni | t;
}
function fs(e) {
  (e.f & kt) !== 0 || e.deps === null ? Ie(e, He) : Ie(e, zt);
}
function la(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Ue) === 0 || (t.f & In) === 0 || (t.f ^= In, la(
        /** @type {Derived} */
        t.deps
      ));
}
function oa(e, t, n) {
  (e.f & qe) !== 0 ? t.add(e) : (e.f & zt) !== 0 && n.add(e), la(e.deps), Ie(e, He);
}
let wr = !1;
function Ii(e) {
  var t = wr;
  try {
    return wr = !1, [e(), wr];
  } finally {
    wr = t;
  }
}
function zi(e, t, n, s = !0) {
  s && n();
  for (var a of t)
    e.addEventListener(a, n);
  Dr(() => {
    for (var i of t)
      e.removeEventListener(i, n);
  });
}
function er(e) {
  var t = me, n = _e;
  Et(null), Ut(null);
  try {
    return e();
  } finally {
    Et(t), Ut(n);
  }
}
function Fi(e) {
  let t = 0, n = zn(0), s;
  return () => {
    gs() && (r(n), ka(() => (t === 0 && (s = en(() => e(() => fr(n)))), t += 1, () => {
      Jt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, fr(n));
      });
    })));
  };
}
var Li = Yn | Qn;
function Di(e, t, n, s) {
  new ji(e, t, n, s);
}
class ji {
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
  #b = Fi(() => (this.#d = zn(this.#p), () => {
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
      l.b = this, l.f |= Qr, s(i);
    }, this.parent = /** @type {Effect} */
    _e.b, this.transform_error = a ?? this.parent?.transform_error ?? ((i) => i), this.#s = bs(() => {
      this.#h();
    }, Li);
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
        Pi();
        return;
      }
      n = !0, s && gi(), this.#o !== null && On(this.#o, () => {
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
    t && (this.is_pending = !0, this.#n = yt(() => t(this.#e)), Jt(() => {
      var n = this.#a = document.createDocumentFragment(), s = Qt();
      n.append(s), this.#i = this.#v(() => yt(() => this.#l(s))), this.#c === 0 && (this.#e.before(n), this.#a = null, On(
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
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#p = 0, this.#i = yt(() => {
        this.#l(this.#e);
      }), this.#c > 0) {
        var t = this.#a = document.createDocumentFragment();
        ws(this.#i, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#n = yt(() => n(this.#e));
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
    oa(t, this.#f, this.#g);
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
    var n = _e, s = me, a = Je;
    Ut(this.#s), Et(this.#s), Kn(this.#s.ctx);
    try {
      return yn.ensure(), t();
    } catch (i) {
      return ia(i), null;
    } finally {
      Ut(n), Et(s), Kn(a);
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
    this.#c += t, this.#c === 0 && (this.#w(n), this.#n && On(this.#n, () => {
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
    this.#k(t, n), this.#p += t, !(!this.#d || this.#u) && (this.#u = !0, Jt(() => {
      this.#u = !1, this.#d && Vn(this.#d, this.#p);
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
    this.#i && (ot(this.#i), this.#i = null), this.#n && (ot(this.#n), this.#n = null), this.#o && (ot(this.#o), this.#o = null);
    let n = this.#t.failed;
    const s = (a) => {
      const { reset: i, invoke_onerror: l } = this.#m(a);
      l(), n && (this.#o = this.#v(() => {
        try {
          return yt(() => {
            var c = (
              /** @type {Effect} */
              _e
            );
            c.b = this, c.f |= Qr, n(
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
    Jt(() => {
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
function Hi(e, t, n, s) {
  const a = hr;
  var i = e.filter((h) => !h.settled), l = t.map(a);
  if (n.length === 0 && i.length === 0) {
    s(l);
    return;
  }
  var c = (
    /** @type {Effect} */
    _e
  ), o = qi(), u = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function p(h) {
    if ((c.f & ft) === 0) {
      o();
      try {
        s([...l, ...h]);
      } catch (_) {
        _n(_, c);
      }
      Rr();
    }
  }
  var m = ca();
  if (n.length === 0) {
    u.then(() => p([])).finally(m);
    return;
  }
  function g() {
    Promise.all(n.map((h) => /* @__PURE__ */ Bi(h))).then(p).catch((h) => _n(h, c)).finally(m);
  }
  u ? u.then(() => {
    o(), g(), Rr();
  }) : g();
}
function qi() {
  var e = (
    /** @type {Effect} */
    _e
  ), t = me, n = Je, s = (
    /** @type {Batch} */
    ye
  );
  return function(i = !0) {
    Ut(e), Et(t), Kn(n), i && (e.f & ft) === 0 && (s?.activate(), s?.apply());
  };
}
function Rr(e = !0) {
  Ut(null), Et(null), Kn(null), e && ye?.deactivate();
}
function ca() {
  var e = (
    /** @type {Effect} */
    _e
  ), t = e.b, n = (
    /** @type {Batch} */
    ye
  ), s = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(s, e), () => {
    t?.update_pending_count(-1, n), n.decrement(s, e);
  };
}
// @__NO_SIDE_EFFECTS__
function hr(e) {
  var t = Ue | qe;
  return _e !== null && (_e.f |= Qn), {
    ctx: Je,
    deps: null,
    effects: null,
    equals: na,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      je
    ),
    wv: 0,
    parent: _e,
    ac: null
  };
}
const ir = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function Bi(e, t, n) {
  let s = (
    /** @type {Effect | null} */
    _e
  );
  s === null && ii();
  var a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = zn(
    /** @type {V} */
    je
  ), l = !me, c = /* @__PURE__ */ new Set();
  return sl(() => {
    var o = (
      /** @type {Effect} */
      _e
    ), u = Zs();
    a = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, (h) => {
        h !== gr && u.reject(h);
      }).finally(Rr);
    } catch (h) {
      u.reject(h), Rr();
    }
    var p = (
      /** @type {Batch} */
      ye
    );
    if (l) {
      if ((o.f & Zn) !== 0)
        var m = ca();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        s.b?.is_rendered()
      )
        p.async_deriveds.get(o)?.reject(ir);
      else
        for (const h of c.values())
          h.reject(ir);
      c.add(u), p.async_deriveds.set(o, u);
    }
    const g = (h, _ = void 0) => {
      m?.(), c.delete(u), _ !== ir && (p.activate(), _ ? (i.f |= mn, Vn(i, _)) : ((i.f & mn) !== 0 && (i.f ^= mn), Vn(i, h)), p.deactivate());
    };
    u.promise.then(g, (h) => g(null, h || "unknown"));
  }), Dr(() => {
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
  return Aa(t), t;
}
// @__NO_SIDE_EFFECTS__
function ua(e) {
  const t = /* @__PURE__ */ hr(e);
  return t.equals = ra, t;
}
function Ui(e) {
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
function hs(e) {
  var t, n = _e, s = e.parent;
  if (!nn && s !== null && e.v !== je && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (s.f & (ft | rt)) !== 0)
    return Ai(), e.v;
  Ut(s);
  try {
    e.f &= ~In, Ui(e), t = Oa(e);
  } finally {
    Ut(n);
  }
  return t;
}
function da(e) {
  var t = hs(e);
  if (!e.equals(t) && (e.wv = Pa(), (!ye?.is_fork || e.deps === null) && (ye !== null ? (ye.capture(e, t, !0), ss?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    Ie(e, He);
    return;
  }
  nn || (Nt !== null ? (gs() || ye?.is_fork) && Nt.set(e, t) : fs(e));
}
function Wi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && er(() => {
        t.ac.abort(gr), t.ac = null;
      }), t.fn !== null && (t.teardown = kr), vr(t, 0), ms(t));
}
function fa(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Xn(t);
}
let Wr = null, Hn = null, ye = null, ss = null, Nt = null, as = null, dr = !1, Gr = !1, Bn = null, Sr = null;
var Ms = 0;
let Gi = 1;
class yn {
  id = Gi++;
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
    Hn === null ? Wr = Hn = this : (Hn.#t = this, this.#r = Hn), Hn = this;
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
        Ie(a, zt), n(a);
    }
    this.#g.add(t);
  }
  #_() {
    this.#e = !0, Ms++ > 1e3 && (this.#v(), Yi());
    for (const o of this.#c)
      this.#u.delete(o), Ie(o, qe), this.schedule(o);
    for (const o of this.#u)
      Ie(o, zt), this.schedule(o);
    const t = this.#a;
    this.#a = [], this.apply();
    var n = Bn = [], s = [], a = Sr = [];
    for (const o of t)
      try {
        this.#y(o, n, s);
      } catch (u) {
        throw pa(o), this.#b() || this.discard(), u;
      }
    if (ye = null, a.length > 0) {
      var i = yn.ensure();
      for (const o of a)
        i.schedule(o);
    }
    if (Bn = null, Sr = null, this.#b()) {
      this.#h(s), this.#h(n);
      for (const [o, u] of this.#f)
        va(o, u);
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
    this.#l.clear(), ss = this, As(s), As(n), ss = null, this.#o?.resolve();
    var c = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      ye
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
    t.f ^= He;
    for (var a = t.first; a !== null; ) {
      var i = a.f, l = (i & (St | tn)) !== 0, c = l && (i & He) !== 0, o = c || (i & rt) !== 0 || this.#f.has(a);
      if (!o && a.fn !== null) {
        l ? a.f ^= He : (i & $n) !== 0 ? n.push(a) : br(a) && ((i & Ot) !== 0 && this.#u.add(a), Xn(a));
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
      if (a !== null && !((s.f & Ue) !== 0 && (s.f & (qe | zt)) === 0))
        for (const c of a) {
          var i = c.f;
          if ((i & Ue) !== 0)
            n(
              /** @type {Derived} */
              c
            );
          else {
            var l = (
              /** @type {Effect} */
              c
            );
            i & (Gn | Ot) && !this.async_deriveds.has(l) && (this.#u.delete(l), Ie(l, qe), this.schedule(l));
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
      oa(t[n], this.#c, this.#u);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, s = !1) {
    t.v !== je && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & mn) === 0 && (this.current.set(t, [n, s]), Nt?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    ye = this;
  }
  deactivate() {
    ye = null, Nt = null;
  }
  flush() {
    try {
      Gr = !0, ye = this, this.#_();
    } finally {
      Ms = 0, as = null, Bn = null, Sr = null, Gr = !1, ye = null, Nt = null, Cn.clear();
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
    for (let m = Wr; m !== null; m = m.#t) {
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
                (h.f & (Ot | Gn)) !== 0 ? m.schedule(h) : m.#h([h]);
              });
          m.activate();
          var l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
          for (var o of n)
            ha(o, i, l, c);
          c = /* @__PURE__ */ new Map();
          var u = [...m.current].filter(([g, h]) => {
            const _ = this.current.get(g);
            return _ ? _[0] !== h[0] || _[1] !== h[1] : !0;
          }).map(([g]) => g);
          if (u.length > 0)
            for (const g of this.#p)
              (g.f & (ft | rt | Mr)) === 0 && vs(g, u, c) && ((g.f & (Gn | Ot)) !== 0 ? (Ie(g, qe), m.schedule(g)) : m.#c.add(g));
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
    return (this.#o ??= Zs()).promise;
  }
  static ensure() {
    if (ye === null) {
      const t = ye = new yn();
      !Gr && !dr && Jt(() => {
        t.#e || t.flush();
      });
    }
    return ye;
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
    if (as = t, t.b?.is_pending && (t.f & ($n | Lr | Qs)) !== 0 && (t.f & Zn) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var s = n.f;
      if (Bn !== null && n === _e && (me === null || (me.f & Ue) === 0))
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
      t === null ? Wr = n : t.#t = n, n === null ? Hn = t : n.#r = t, this.linked = !1;
    }
  }
}
function $i(e) {
  var t = dr;
  dr = !0;
  try {
    for (var n; ; ) {
      if (Oi(), ye === null)
        return (
          /** @type {T} */
          n
        );
      ye.flush();
    }
  } finally {
    dr = t;
  }
}
function Yi() {
  try {
    di();
  } catch (e) {
    _n(e, as);
  }
}
let Xt = null;
function As(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var s = e[n++];
      if ((s.f & (ft | rt)) === 0 && br(s) && (Xt = /* @__PURE__ */ new Set(), Xn(s), s.deps === null && s.first === null && s.nodes === null && s.teardown === null && s.ac === null && Ea(s), Xt?.size > 0)) {
        Cn.clear();
        for (const a of Xt) {
          if ((a.f & (ft | rt)) !== 0) continue;
          const i = [a];
          let l = a.parent;
          for (; l !== null; )
            Xt.has(l) && (Xt.delete(l), i.push(l)), l = l.parent;
          for (let c = i.length - 1; c >= 0; c--) {
            const o = i[c];
            (o.f & (ft | rt)) === 0 && Xn(o);
          }
        }
        Xt.clear();
      }
    }
    Xt = null;
  }
}
function ha(e, t, n, s) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const i = a.f;
      (i & Ue) !== 0 ? ha(
        /** @type {Derived} */
        a,
        t,
        n,
        s
      ) : (i & (Gn | Ot)) !== 0 && (i & qe) === 0 && vs(a, t, s) && (Ie(a, qe), ps(
        /** @type {Effect} */
        a
      ));
    }
}
function vs(e, t, n) {
  const s = n.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (Tr.call(t, a))
        return !0;
      if ((a.f & Ue) !== 0 && vs(
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
function ps(e) {
  ye.schedule(e);
}
function va(e, t) {
  if (!((e.f & St) !== 0 && (e.f & He) !== 0)) {
    (e.f & qe) !== 0 ? t.d.push(e) : (e.f & zt) !== 0 && t.m.push(e), Ie(e, He);
    for (var n = e.first; n !== null; )
      va(n, t), n = n.next;
  }
}
function pa(e) {
  Ie(e, He);
  for (var t = e.first; t !== null; )
    pa(t), t = t.next;
}
let Pr = /* @__PURE__ */ new Set();
const Cn = /* @__PURE__ */ new Map();
let ga = !1;
function zn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: na,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function K(e, t) {
  const n = zn(e);
  return Aa(n), n;
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t = !1, n = !0) {
  const s = zn(e);
  return t || (s.equals = ra), s;
}
function x(e, t, n = !1) {
  me !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!It || (me.f & Mr) !== 0) && sa() && (me.f & (Ue | Ot | Gn | Mr)) !== 0 && (Bt === null || !Bt.has(e)) && pi();
  let s = n ? Ce(t) : t;
  return Vn(e, s, Sr);
}
function Vn(e, t, n = null) {
  if (!e.equals(t)) {
    Cn.set(e, nn ? t : e.v);
    var s = yn.ensure();
    if (s.capture(e, t), (e.f & Ue) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & qe) !== 0 && hs(a), Nt === null && fs(a);
    }
    e.wv = Pa(), _a(e, qe, n), _e !== null && (_e.f & He) !== 0 && (_e.f & (St | tn)) === 0 && (wt === null ? ll([e]) : wt.push(e)), !s.is_fork && Pr.size > 0 && !ga && Vi();
  }
  return t;
}
function Vi() {
  ga = !1;
  for (const e of Pr) {
    (e.f & He) !== 0 && Ie(e, zt);
    let t;
    try {
      t = br(e);
    } catch {
      t = !0;
    }
    t && Xn(e);
  }
  Pr.clear();
}
function Xi(e, t = 1) {
  var n = r(e), s = t === 1 ? n++ : n--;
  return x(e, n), s;
}
function fr(e) {
  x(e, e.v + 1);
}
function _a(e, t, n) {
  var s = e.reactions;
  if (s !== null)
    for (var a = s.length, i = 0; i < a; i++) {
      var l = s[i], c = l.f, o = (c & qe) === 0;
      if (o && Ie(l, t), (c & Mr) !== 0)
        Pr.add(
          /** @type {Effect} */
          l
        );
      else if ((c & Ue) !== 0) {
        var u = (
          /** @type {Derived} */
          l
        );
        Nt?.delete(u), (c & In) === 0 && (c & kt && (_e === null || (_e.f & Ar) === 0) && (l.f |= In), _a(u, zt, n));
      } else if (o) {
        var p = (
          /** @type {Effect} */
          l
        );
        (c & Ot) !== 0 && Xt !== null && Xt.add(p), n !== null ? n.push(p) : ps(p);
      }
    }
}
function Ce(e) {
  if (typeof e != "object" || e === null || Pn in e)
    return e;
  const t = Js(e);
  if (t !== Ja && t !== Za)
    return e;
  var n = /* @__PURE__ */ new Map(), s = ds(e), a = /* @__PURE__ */ K(0), i = Nn, l = (c) => {
    if (Nn === i)
      return c();
    var o = me, u = Nn;
    Et(null), Cs(i);
    var p = c();
    return Et(o), Cs(u), p;
  };
  return s && n.set("length", /* @__PURE__ */ K(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, o, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && hi();
        var p = n.get(o);
        return p === void 0 ? l(() => {
          var m = /* @__PURE__ */ K(u.value);
          return n.set(o, m), m;
        }) : x(p, u.value, !0), !0;
      },
      deleteProperty(c, o) {
        var u = n.get(o);
        if (u === void 0) {
          if (o in c) {
            const p = l(() => /* @__PURE__ */ K(je));
            n.set(o, p), fr(a);
          }
        } else
          x(u, je), fr(a);
        return !0;
      },
      get(c, o, u) {
        if (o === Pn)
          return e;
        var p = n.get(o), m = o in c;
        if (p === void 0 && (!m || Wn(c, o)?.writable) && (p = l(() => {
          var h = Ce(m ? c[o] : je), _ = /* @__PURE__ */ K(h);
          return _;
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
          var m = n.get(o), g = m?.v;
          if (m !== void 0 && g !== je)
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
        if (o === Pn)
          return !0;
        var u = n.get(o), p = u !== void 0 && u.v !== je || Reflect.has(c, o);
        if (u !== void 0 || _e !== null && (!p || Wn(c, o)?.writable)) {
          u === void 0 && (u = l(() => {
            var g = p ? Ce(c[o]) : je, h = /* @__PURE__ */ K(g);
            return h;
          }), n.set(o, u));
          var m = r(u);
          if (m === je)
            return !1;
        }
        return p;
      },
      set(c, o, u, p) {
        var m = n.get(o), g = o in c;
        if (s && o === "length")
          for (var h = u; h < /** @type {Source<number>} */
          m.v; h += 1) {
            var _ = n.get(h + "");
            _ !== void 0 ? x(_, je) : h in c && (_ = l(() => /* @__PURE__ */ K(je)), n.set(h + "", _));
          }
        if (m === void 0)
          (!g || Wn(c, o)?.writable) && (m = l(() => /* @__PURE__ */ K(void 0)), x(m, Ce(u)), n.set(o, m));
        else {
          g = m.v !== je;
          var w = l(() => Ce(u));
          x(m, w);
        }
        var d = Reflect.getOwnPropertyDescriptor(c, o);
        if (d?.set && d.set.call(p, u), !g) {
          if (s && typeof o == "string") {
            var b = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= b.v && x(b, y + 1);
          }
          fr(a);
        }
        return !0;
      },
      ownKeys(c) {
        r(a);
        var o = Reflect.ownKeys(c).filter((m) => {
          var g = n.get(m);
          return g === void 0 || g.v !== je;
        });
        for (var [u, p] of n)
          p.v !== je && !(u in c) && o.push(u);
        return o;
      },
      setPrototypeOf() {
        vi();
      }
    }
  );
}
function Rs(e) {
  try {
    if (e !== null && typeof e == "object" && Pn in e)
      return e[Pn];
  } catch {
  }
  return e;
}
function Ji(e, t) {
  return Object.is(Rs(e), Rs(t));
}
var wn, ba, ma, wa;
function Zi() {
  if (wn === void 0) {
    wn = window, ba = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    ma = Wn(t, "firstChild").get, wa = Wn(t, "nextSibling").get, Ts(e) && (e[ts] = void 0, e[ea] = null, e[ns] = void 0, e.__e = void 0), Ts(n) && (n[rs] = void 0);
  }
}
function Qt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Cr(e) {
  return (
    /** @type {TemplateNode | null} */
    ma.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function _r(e) {
  return (
    /** @type {TemplateNode | null} */
    wa.call(e)
  );
}
function f(e, t) {
  return /* @__PURE__ */ Cr(e);
}
function lt(e, t = !1) {
  {
    var n = /* @__PURE__ */ Cr(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ _r(n) : n;
  }
}
function v(e, t = 1, n = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ _r(s);
  return s;
}
function Qi(e) {
  e.textContent = "";
}
function ya() {
  return !1;
}
function el(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function tl(e) {
  _e === null && (me === null && ui(), ci()), nn && oi();
}
function nl(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function rn(e, t) {
  var n = _e;
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
  ye?.register_created_effect(s);
  var a = s;
  if ((e & $n) !== 0)
    Bn !== null ? Bn.push(s) : yn.ensure().schedule(s);
  else if (t !== null) {
    try {
      Xn(s);
    } catch (l) {
      throw ot(s), l;
    }
    a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
    (a.f & Qn) === 0 && (a = a.first, (e & Ot) !== 0 && (e & Yn) !== 0 && a !== null && (a.f |= Yn));
  }
  if (a !== null && (a.parent = n, n !== null && nl(a, n), me !== null && (me.f & Ue) !== 0 && (e & tn) === 0)) {
    var i = (
      /** @type {Derived} */
      me
    );
    (i.effects ??= []).push(a);
  }
  return s;
}
function gs() {
  return me !== null && !It;
}
function Dr(e) {
  const t = rn(Lr, null);
  return Ie(t, He), t.teardown = e, t;
}
function qt(e) {
  tl();
  var t = (
    /** @type {Effect} */
    _e.f
  ), n = !me && (t & St) !== 0 && Je !== null && !Je.i;
  if (n) {
    var s = (
      /** @type {ComponentContext} */
      Je
    );
    (s.e ??= []).push(e);
  } else
    return xa(e);
}
function xa(e) {
  return rn($n | ti, e);
}
function rl(e) {
  yn.ensure();
  const t = rn(tn | Qn, e);
  return (n = {}) => new Promise((s) => {
    n.outro ? On(t, () => {
      ot(t), s(void 0);
    }) : (ot(t), s(void 0));
  });
}
function _s(e) {
  return rn($n, e);
}
function sl(e) {
  return rn(Gn | Qn, e);
}
function ka(e, t = 0) {
  return rn(Lr | t, e);
}
function U(e, t = [], n = [], s = []) {
  Hi(s, t, n, (a) => {
    rn(Lr, () => {
      e(...a.map(r));
    });
  });
}
function bs(e, t = 0) {
  var n = rn(Ot | t, e);
  return n;
}
function yt(e) {
  return rn(St | Qn, e);
}
function Sa(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = nn, s = me;
    Ps(!0), Et(null);
    try {
      t.call(null);
    } finally {
      Ps(n), Et(s);
    }
  }
}
function ms(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && er(() => {
      a.abort(gr);
    });
    var s = n.next;
    (n.f & tn) !== 0 ? n.parent = null : ot(n, t), n = s;
  }
}
function al(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & St) === 0 && ot(t), t = n;
  }
}
function ot(e, t = !0) {
  var n = !1;
  (t || (e.f & ei) !== 0) && e.nodes !== null && e.nodes.end !== null && (il(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), e.f |= es, ms(e, t && !n), vr(e, 0);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const i of s)
      i.stop();
  Sa(e), e.f ^= es, e.f |= ft;
  var a = e.parent;
  a !== null && a.first !== null && Ea(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function il(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ _r(e);
    e.remove(), e = n;
  }
}
function Ea(e) {
  var t = e.parent, n = e.prev, s = e.next;
  n !== null && (n.next = s), s !== null && (s.prev = n), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = n));
}
function On(e, t, n = !0) {
  var s = [];
  Ta(e, s, !0);
  var a = () => {
    n && ot(e), t && t();
  }, i = s.length;
  if (i > 0) {
    var l = () => --i || a();
    for (var c of s)
      c.out(l);
  } else
    a();
}
function Ta(e, t, n) {
  if ((e.f & rt) === 0) {
    e.f ^= rt;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const c of s)
        (c.is_global || n) && t.push(c);
    for (var a = e.first; a !== null; ) {
      var i = a.next;
      if ((a.f & tn) === 0) {
        var l = (a.f & Yn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (a.f & St) !== 0 && (e.f & Ot) !== 0;
        Ta(a, t, l ? n : !1);
      }
      a = i;
    }
  }
}
function Or(e) {
  Ma(e, !0);
}
function Ma(e, t) {
  if ((e.f & rt) !== 0) {
    e.f ^= rt, (e.f & He) === 0 && (Ie(e, qe), yn.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var s = n.next, a = (n.f & Yn) !== 0 || (n.f & St) !== 0;
      Ma(n, a ? t : !1), n = s;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function ws(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, s = e.nodes.end; n !== null; ) {
      var a = n === s ? null : /* @__PURE__ */ _r(n);
      t.append(n), n = a;
    }
}
let Er = !1, nn = !1;
function Ps(e) {
  nn = e;
}
let me = null, It = !1;
function Et(e) {
  me = e;
}
let _e = null;
function Ut(e) {
  _e = e;
}
let Bt = null;
function Aa(e) {
  me !== null && (Bt ??= /* @__PURE__ */ new Set()).add(e);
}
let it = null, dt = 0, wt = null;
function ll(e) {
  wt = e;
}
let Ra = 1, An = 0, Nn = An;
function Cs(e) {
  Nn = e;
}
function Pa() {
  return ++Ra;
}
function br(e) {
  var t = e.f;
  if ((t & qe) !== 0)
    return !0;
  if (t & Ue && (e.f &= ~In), (t & zt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), s = n.length, a = 0; a < s; a++) {
      var i = n[a];
      if (br(
        /** @type {Derived} */
        i
      ) && da(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & kt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Nt === null && Ie(e, He);
  }
  return !1;
}
function Ca(e, t, n = !0) {
  var s = e.reactions;
  if (s !== null && !(Bt !== null && Bt.has(e)))
    for (var a = 0; a < s.length; a++) {
      var i = s[a];
      (i.f & Ue) !== 0 ? Ca(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? Ie(i, qe) : (i.f & He) !== 0 && Ie(i, zt), ps(
        /** @type {Effect} */
        i
      ));
    }
}
function Oa(e) {
  var t = it, n = dt, s = wt, a = me, i = Bt, l = Je, c = It, o = Nn, u = e.f;
  it = /** @type {null | Value[]} */
  null, dt = 0, wt = null, me = (u & (St | tn)) === 0 ? e : null, Bt = null, Kn(e.ctx), It = !1, Nn = ++An, e.ac !== null && (er(() => {
    e.ac.abort(gr);
  }), e.ac = null);
  try {
    e.f |= Ar;
    var p = (
      /** @type {Function} */
      e.fn
    ), m = p();
    e.f |= Zn;
    var g = e.deps, h = ye?.is_fork;
    if (it !== null) {
      var _;
      if (h || vr(e, dt), g !== null && dt > 0)
        for (g.length = dt + it.length, _ = 0; _ < it.length; _++)
          g[dt + _] = it[_];
      else
        e.deps = g = it;
      if (gs() && (e.f & kt) !== 0)
        for (_ = dt; _ < g.length; _++)
          (g[_].reactions ??= []).push(e);
    } else !h && g !== null && dt < g.length && (vr(e, dt), g.length = dt);
    if (sa() && wt !== null && !It && g !== null && (e.f & (Ue | zt | qe)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      wt.length; _++)
        Ca(
          wt[_],
          /** @type {Effect} */
          e
        );
    if (a !== null && a !== e) {
      if (An++, a.deps !== null)
        for (let w = 0; w < n; w += 1)
          a.deps[w].rv = An;
      if (t !== null)
        for (const w of t)
          w.rv = An;
      wt !== null && (s === null ? s = wt : s.push(.../** @type {Source[]} */
      wt));
    }
    return (e.f & mn) !== 0 && (e.f ^= mn), m;
  } catch (w) {
    return ia(w);
  } finally {
    e.f ^= Ar, it = t, dt = n, wt = s, me = a, Bt = i, Kn(l), It = c, Nn = o;
  }
}
function ol(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var s = Ka.call(n, e);
    if (s !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[s] = n[a], n.pop());
    }
  }
  if (n === null && (t.f & Ue) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (it === null || !Tr.call(it, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & kt) !== 0 && (i.f ^= kt, i.f &= ~In), i.v !== je && fs(i), i.ac !== null && er(() => {
      i.ac.abort(gr), i.ac = null, Ie(i, qe);
    }), Wi(i), vr(i, 0);
  }
}
function vr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var s = t; s < n.length; s++)
      ol(e, n[s]);
}
function Xn(e) {
  var t = e.f;
  if ((t & ft) === 0) {
    Ie(e, He);
    var n = _e, s = Er;
    _e = e, Er = (t & (St | tn)) === 0;
    try {
      (t & (Ot | Qs)) !== 0 ? al(e) : ms(e), Sa(e);
      var a = Oa(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Ra;
      var i;
    } finally {
      Er = s, _e = n;
    }
  }
}
async function cl() {
  await Promise.resolve(), $i();
}
function r(e) {
  var t = e.f, n = (t & Ue) !== 0;
  if (me !== null && !It) {
    var s = _e !== null && (_e.f & ft) !== 0;
    if (!s && (Bt === null || !Bt.has(e))) {
      var a = me.deps;
      if ((me.f & Ar) !== 0)
        e.rv < An && (e.rv = An, it === null && a !== null && a[dt] === e ? dt++ : it === null ? it = [e] : it.push(e));
      else {
        me.deps ??= [], Tr.call(me.deps, e) || me.deps.push(e);
        var i = e.reactions;
        i === null ? e.reactions = [me] : Tr.call(i, me) || i.push(me);
      }
    }
  }
  if (nn && Cn.has(e))
    return Cn.get(e);
  if (n) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (nn) {
      var c = l.v;
      return ((l.f & He) === 0 && l.reactions !== null || Ia(l)) && (c = hs(l)), Cn.set(l, c), c;
    }
    var o = (l.f & kt) === 0 && !It && me !== null && (Er || (me.f & kt) !== 0), u = (l.f & Zn) === 0;
    br(l) && (o && (l.f |= kt), da(l)), o && !u && (fa(l), Na(l));
  }
  if (Nt?.has(e))
    return Nt.get(e);
  if ((e.f & mn) !== 0)
    throw e.v;
  return e.v;
}
function Na(e) {
  if (e.f |= kt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Ue) !== 0 && (t.f & kt) === 0 && (fa(
        /** @type {Derived} */
        t
      ), Na(
        /** @type {Derived} */
        t
      ));
}
function Ia(e) {
  if (e.v === je) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Cn.has(t) || (t.f & Ue) !== 0 && Ia(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function en(e) {
  var t = It;
  try {
    return It = !0, e();
  } finally {
    It = t;
  }
}
const ul = ["touchstart", "touchmove"];
function dl(e) {
  return ul.includes(e);
}
const lr = Symbol("events"), za = /* @__PURE__ */ new Set(), is = /* @__PURE__ */ new Set();
function fl(e, t, n, s = {}) {
  function a(i) {
    if (s.capture || ls.call(t, i), !i.cancelBubble)
      return er(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Jt(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function Rn(e, t, n, s, a) {
  var i = { capture: s, passive: a }, l = fl(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Dr(() => {
    t.removeEventListener(e, l, i);
  });
}
function te(e, t, n) {
  (t[lr] ??= {})[e] = n;
}
function Ft(e) {
  for (var t = 0; t < e.length; t++)
    za.add(e[t]);
  for (var n of is)
    n(e);
}
let Os = null;
function ls(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Os = e;
  var l = 0, c = Os === e && e[lr];
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
    Va(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var p = me, m = _e;
    Et(null), Ut(null);
    try {
      for (var g, h = []; i !== null && i !== t; ) {
        try {
          var _ = i[lr]?.[s];
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
      e[lr] = t, delete e.currentTarget, Et(p), Ut(m);
    }
  }
}
const hl = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function vl(e) {
  return (
    /** @type {string} */
    hl?.createHTML(e) ?? e
  );
}
function pl(e) {
  var t = el("template");
  return t.innerHTML = vl(e.replaceAll("<!>", "<!---->")), t.content;
}
function Nr(e, t) {
  var n = (
    /** @type {Effect} */
    _e
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function O(e, t) {
  var n = (t & Ei) !== 0, s = (t & Ti) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = pl(i ? e : "<!>" + e), n || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Cr(a)));
    var l = (
      /** @type {TemplateNode} */
      s || ba ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (n) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Cr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      Nr(c, o);
    } else
      Nr(l, l);
    return l;
  };
}
function Un(e = "") {
  {
    var t = Qt(e + "");
    return Nr(t, t), t;
  }
}
function ys() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Qt();
  return e.append(t, n), Nr(t, n), e;
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
  (e[rs] ??= e.nodeValue) && (e[rs] = n, e.nodeValue = `${n}`);
}
function gl(e, t) {
  return _l(e, t);
}
const yr = /* @__PURE__ */ new Map();
function _l(e, { target: t, anchor: n, props: s = {}, events: a, context: i, intro: l = !0, transformError: c }) {
  Zi();
  var o = void 0, u = rl(() => {
    var p = n ?? t.appendChild(Qt());
    Di(
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
      c
    );
    var m = /* @__PURE__ */ new Set(), g = (h) => {
      for (var _ = 0; _ < h.length; _++) {
        var w = h[_];
        if (!m.has(w)) {
          m.add(w);
          var d = dl(w);
          for (const M of [t, document]) {
            var b = yr.get(M);
            b === void 0 && (b = /* @__PURE__ */ new Map(), yr.set(M, b));
            var y = b.get(w);
            y === void 0 ? (M.addEventListener(w, ls, { passive: d }), b.set(w, 1)) : b.set(w, y + 1);
          }
        }
      }
    };
    return g(Fr(za)), is.add(g), () => {
      for (var h of m)
        for (const d of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            yr.get(d)
          ), w = (
            /** @type {number} */
            _.get(h)
          );
          --w == 0 ? (d.removeEventListener(h, ls), _.delete(h), _.size === 0 && yr.delete(d)) : _.set(h, w);
        }
      is.delete(g), p !== n && p.parentNode?.removeChild(p);
    };
  });
  return bl.set(o, u), o;
}
let bl = /* @__PURE__ */ new WeakMap();
class ml {
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
        Or(s), this.#l.delete(n);
      else {
        var a = this.#t.get(n);
        a && (Or(a.effect), this.#r.set(n, a.effect), this.#t.delete(n), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
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
            ws(l, u), u.append(Qt()), this.#t.set(i, { effect: l, fragment: u });
          } else
            ot(l);
          this.#l.delete(i), this.#r.delete(i);
        };
        this.#s || !s ? (this.#l.add(i), On(l, c, !1)) : c();
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
      ye
    ), a = ya();
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
      for (const [c, o] of this.#r)
        c === t ? s.unskip_effect(o) : s.skip_effect(o);
      for (const [c, o] of this.#t)
        c === t ? s.unskip_effect(o.effect) : s.skip_effect(o.effect);
      s.oncommit(this.#i), s.ondiscard(this.#n);
    } else
      this.#i(s);
  }
}
function re(e, t, n = !1) {
  var s = new ml(e), a = n ? Yn : 0;
  function i(l, c) {
    s.ensure(l, c);
  }
  bs(() => {
    var l = !1;
    t((c, o = 0) => {
      l = !0, i(o, c);
    }), l || i(-1, null);
  }, a);
}
function xt(e, t) {
  return t;
}
function wl(e, t, n) {
  for (var s = [], a = t.length, i, l = t.length, c = 0; c < a; c++) {
    let m = t[c];
    On(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var g = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            os(e, Fr(i.done)), g.delete(i), g.size === 0 && (e.outrogroups = null);
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
      ), p = (
        /** @type {Element} */
        u.parentNode
      );
      Qi(p), p.append(u), e.items.clear();
    }
    os(e, t, !o);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function os(e, t, n = !0) {
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
      i.f |= Ht;
      const l = document.createDocumentFragment();
      ws(i, l);
    } else
      ot(t[a], n);
  }
}
var Ns;
function Ye(e, t, n, s, a, i = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & ta) !== 0;
  if (o) {
    var u = (
      /** @type {Element} */
      e
    );
    l = u.appendChild(Qt());
  }
  var p = null, m = /* @__PURE__ */ ua(() => {
    var M = n();
    return (
      /** @type {V[]} */
      ds(M) ? M : M == null ? [] : Fr(M)
    );
  }), g, h = /* @__PURE__ */ new Map(), _ = !0;
  function w(M) {
    (y.effect.f & ft) === 0 && (y.pending.delete(M), y.fallback = p, yl(y, g, l, t, s), p !== null && (g.length === 0 ? (p.f & Ht) === 0 ? Or(p) : (p.f ^= Ht, or(p, null, l)) : On(p, () => {
      p = null;
    })));
  }
  function d(M) {
    y.pending.delete(M);
  }
  var b = bs(() => {
    g = /** @type {V[]} */
    r(m);
    for (var M = g.length, N = /* @__PURE__ */ new Set(), j = (
      /** @type {Batch} */
      ye
    ), $ = ya(), ne = 0; ne < M; ne += 1) {
      var ae = g[ne], q = s(ae, ne), D = _ ? null : c.get(q);
      D ? (D.v && Vn(D.v, ae), D.i && Vn(D.i, ne), $ && j.unskip_effect(D.e)) : (D = xl(
        c,
        _ ? l : Ns ??= Qt(),
        ae,
        q,
        ne,
        a,
        t,
        n
      ), _ || (D.e.f |= Ht), c.set(q, D)), N.add(q);
    }
    if (M === 0 && i && !p && (_ ? p = yt(() => i(l)) : (p = yt(() => i(Ns ??= Qt())), p.f |= Ht)), M > N.size && li(), !_)
      if (h.set(j, N), $) {
        for (const [Y, P] of c)
          N.has(Y) || j.skip_effect(P.e);
        j.oncommit(w), j.ondiscard(d);
      } else
        w(j);
    r(m);
  }), y = { effect: b, items: c, pending: h, outrogroups: null, fallback: p };
  _ = !1;
}
function sr(e) {
  for (; e !== null && (e.f & St) === 0; )
    e = e.next;
  return e;
}
function yl(e, t, n, s, a) {
  var i = (s & mi) !== 0, l = t.length, c = e.items, o = sr(e.effect.first), u, p = null, m, g = [], h = [], _, w, d, b;
  if (i)
    for (b = 0; b < l; b += 1)
      _ = t[b], w = a(_, b), d = /** @type {EachItem} */
      c.get(w).e, (d.f & Ht) === 0 && (d.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(d));
  for (b = 0; b < l; b += 1) {
    if (_ = t[b], w = a(_, b), d = /** @type {EachItem} */
    c.get(w).e, e.outrogroups !== null)
      for (const D of e.outrogroups)
        D.pending.delete(d), D.done.delete(d);
    if ((d.f & rt) !== 0 && (Or(d), i && (d.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(d))), (d.f & Ht) !== 0)
      if (d.f ^= Ht, d === o)
        or(d, null, n);
      else {
        var y = p ? p.next : o;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), hn(e, p, d), hn(e, d, y), or(d, y, n), p = d, g = [], h = [], o = sr(p.next);
        continue;
      }
    if (d !== o) {
      if (u !== void 0 && u.has(d)) {
        if (g.length < h.length) {
          var M = h[0], N;
          p = M.prev;
          var j = g[0], $ = g[g.length - 1];
          for (N = 0; N < g.length; N += 1)
            or(g[N], M, n);
          for (N = 0; N < h.length; N += 1)
            u.delete(h[N]);
          hn(e, j.prev, $.next), hn(e, p, j), hn(e, $, M), o = M, p = $, b -= 1, g = [], h = [];
        } else
          u.delete(d), or(d, o, n), hn(e, d.prev, d.next), hn(e, d, p === null ? e.effect.first : p.next), hn(e, p, d), p = d;
        continue;
      }
      for (g = [], h = []; o !== null && o !== d; )
        (u ??= /* @__PURE__ */ new Set()).add(o), h.push(o), o = sr(o.next);
      if (o === null)
        continue;
    }
    (d.f & Ht) === 0 && g.push(d), p = d, o = sr(d.next);
  }
  if (e.outrogroups !== null) {
    for (const D of e.outrogroups)
      D.pending.size === 0 && (os(e, Fr(D.done)), e.outrogroups?.delete(D));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || u !== void 0) {
    var ne = [];
    if (u !== void 0)
      for (d of u)
        (d.f & rt) === 0 && ne.push(d);
    for (; o !== null; )
      (o.f & rt) === 0 && o !== e.fallback && ne.push(o), o = sr(o.next);
    var ae = ne.length;
    if (ae > 0) {
      var q = (s & ta) !== 0 && l === 0 ? n : null;
      if (i) {
        for (b = 0; b < ae; b += 1)
          ne[b].nodes?.a?.measure();
        for (b = 0; b < ae; b += 1)
          ne[b].nodes?.a?.fix();
      }
      wl(e, ne, q);
    }
  }
  i && Jt(() => {
    if (m !== void 0)
      for (d of m)
        d.nodes?.a?.apply();
  });
}
function xl(e, t, n, s, a, i, l, c) {
  var o = (l & _i) !== 0 ? (l & wi) === 0 ? /* @__PURE__ */ Ki(n, !1, !1) : zn(n) : null, u = (l & bi) !== 0 ? zn(a) : null;
  return {
    v: o,
    i: u,
    e: yt(() => (i(t, o ?? n, u ?? a, c), () => {
      e.delete(s);
    }))
  };
}
function or(e, t, n) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, i = t && (t.f & Ht) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; s !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ _r(s)
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
  _s(() => {
    var s = en(() => t(e, n?.()) || {});
    if (s?.destroy)
      return () => (
        /** @type {Function} */
        s.destroy()
      );
  });
}
const Is = [...` 	
\r\f \v\uFEFF`];
function kl(e, t, n) {
  var s = e == null ? "" : "" + e;
  if (n) {
    for (var a of Object.keys(n))
      if (n[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var i = a.length, l = 0; (l = s.indexOf(a, l)) >= 0; ) {
          var c = l + i;
          (l === 0 || Is.includes(s[l - 1])) && (c === s.length || Is.includes(s[c])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(c + 1) : l = c;
        }
  }
  return s === "" ? null : s;
}
function zs(e, t = !1) {
  var n = t ? " !important;" : ";", s = "";
  for (var a of Object.keys(e)) {
    var i = e[a];
    i != null && i !== "" && (s += " " + a + ": " + i + n);
  }
  return s;
}
function Sl(e, t) {
  if (t) {
    var n = "", s, a;
    return Array.isArray(t) ? (s = t[0], a = t[1]) : s = t, s && (n += zs(s)), a && (n += zs(a, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function Me(e, t, n, s, a, i) {
  var l = (
    /** @type {any} */
    e[ts]
  );
  if (l !== n || l === void 0) {
    var c = kl(n, s, i);
    c == null ? e.removeAttribute("class") : e.className = c, e[ts] = n;
  } else if (i && a !== i)
    for (var o in i) {
      var u = !!i[o];
      (a == null || u !== !!a[o]) && e.classList.toggle(o, u);
    }
  return i;
}
function $r(e, t = {}, n, s) {
  for (var a in n) {
    var i = n[a];
    t[a] !== i && (n[a] == null ? e.style.removeProperty(a) : e.style.setProperty(a, i, s));
  }
}
function Zt(e, t, n, s) {
  var a = (
    /** @type {any} */
    e[ns]
  );
  if (a !== t) {
    var i = Sl(t, s);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e[ns] = t;
  } else s && (Array.isArray(s) ? ($r(e, n?.[0], s[0]), $r(e, n?.[1], s[1], "important")) : $r(e, n, s));
  return s;
}
function cr(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ds(t))
      return Ri();
    for (var s of e.options)
      s.selected = t.includes(Fs(s));
    return;
  }
  for (s of e.options) {
    var a = Fs(s);
    if (Ji(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function xr(e) {
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
  }), Dr(() => {
    t.disconnect();
  });
}
function Fs(e) {
  return "__value" in e ? e.__value : e.value;
}
const El = Symbol("is custom element"), Tl = Symbol("is html"), Ml = si ? "progress" : "PROGRESS";
function En(e, t) {
  var n = xs(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== Ml) || (e.value = t ?? "");
}
function Al(e, t) {
  var n = xs(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function pe(e, t, n, s) {
  var a = xs(e);
  a[t] !== (a[t] = n) && (t === "loading" && (e[ri] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Rl(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function xs(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    e[ea] ??= {
      [El]: e.nodeName.includes("-"),
      [Tl]: e.namespaceURI === Mi
    }
  );
}
var Ls = /* @__PURE__ */ new Map();
function Rl(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Ls.get(t);
  if (n) return n;
  Ls.set(t, n = []);
  for (var s, a = e, i = Element.prototype; i !== a; ) {
    s = Xa(a);
    for (var l in s)
      s[l].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.push(l);
    a = Js(a);
  }
  return n;
}
class ks {
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
          ks.entries.set(n.target, n);
          for (var s of this.#e.get(n.target) || [])
            s(n);
        }
      }
    ));
  }
}
var Pl = /* @__PURE__ */ new ks({
  box: "border-box"
});
function Ds(e, t, n) {
  var s = Pl.observe(e, () => n(e[t]));
  _s(() => (en(() => n(e[t])), s));
}
function Yr(e, t) {
  return e === t || e?.[Pn] === t;
}
function pr(e = {}, t, n, s) {
  var a = (
    /** @type {ComponentContext} */
    Je.r
  ), i = (
    /** @type {Effect} */
    _e
  );
  return _s(() => {
    var l, c;
    return ka(() => {
      l = c, c = [], en(() => {
        Yr(n(...c), e) || (t(e, ...c), l && Yr(n(...l), e) && t(null, ...l));
      });
    }), () => {
      let o = i;
      for (; o !== a && o.parent !== null && o.parent.f & es; )
        o = o.parent;
      const u = () => {
        c && Yr(n(...c), e) && t(null, ...c);
      }, p = o.teardown;
      o.teardown = () => {
        u(), p?.();
      };
    };
  }), e;
}
function Cl(e, t) {
  zi(window, ["resize"], () => er(() => t(window[e])));
}
function se(e, t, n, s) {
  var a = !0, i = (n & ki) !== 0, l = (n & Si) !== 0, c = (
    /** @type {V} */
    s
  ), o = !0, u = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), p = () => l && a ? (u ??= /* @__PURE__ */ hr(
    /** @type {() => V} */
    s
  ), r(u)) : (o && (o = !1, c = l ? en(
    /** @type {() => V} */
    s
  ) : (
    /** @type {V} */
    s
  )), c);
  let m;
  if (i) {
    var g = Pn in e || ni in e;
    m = Wn(e, t)?.set ?? (g && t in e ? (N) => e[t] = N : void 0);
  }
  var h, _ = !1;
  i ? [h, _] = Ii(() => (
    /** @type {V} */
    e[t]
  )) : h = /** @type {V} */
  e[t], h === void 0 && s !== void 0 && (h = p(), m && (fi(), m(h)));
  var w;
  if (w = () => {
    var N = (
      /** @type {V} */
      e[t]
    );
    return N === void 0 ? p() : (o = !0, N);
  }, (n & xi) === 0)
    return w;
  if (m) {
    var d = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(N, j) {
        return arguments.length > 0 ? ((!j || d || _) && m(j ? w() : N), N) : w();
      })
    );
  }
  var b = !1, y = ((n & yi) !== 0 ? hr : ua)(() => (b = !1, w()));
  i && r(y);
  var M = (
    /** @type {Effect} */
    _e
  );
  return (
    /** @type {() => V} */
    (function(N, j) {
      if (arguments.length > 0) {
        const $ = j ? r(y) : i ? Ce(N) : N;
        return x(y, $), b = !0, c !== void 0 && (c = $), N;
      }
      return nn && b || (M.f & ft) !== 0 ? y.v : r(y);
    })
  );
}
function tr(e) {
  Je === null && ai(), qt(() => {
    const t = en(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Ol = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Ol);
function Nl(e) {
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
async function Vt(e, t = {}) {
  const n = await fetch(e + Nl(t));
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
function js(e) {
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
  counts: (e, t) => Vt("/api/triage/counts", { ...js(e), at: t }),
  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => Vt("/api/triage/files"),
  screen: (e, t = {}) => Vt("/api/triage/screen", { name: e, ...t }),
  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (e) => Vt("/api/triage/tree", { path: e }),
  page: (e, t, n = 500) => Vt("/api/triage/page", { ...js(e), limit: n, ...t || {} }),
  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => Vt("/api/triage/probe"),
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
  rebuildStatus: () => Vt("/api/triage/rebuild")
};
function Il() {
  let e = 0, t = 0;
  return async function(s) {
    const a = ++e, i = await s();
    return a <= t ? { stale: !0, value: void 0 } : (t = a, { stale: !1, value: i });
  };
}
function zl(e, t) {
  let n = 0;
  const s = (...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  };
  return s.cancel = () => clearTimeout(n), s.now = (...a) => {
    clearTimeout(n), e(...a);
  }, s;
}
const Hs = ["B", "KB", "MB", "GB", "TB"];
function Pt(e) {
  let t = Number(e) || 0, n = 0;
  for (; t >= 1e3 && n < Hs.length - 1; )
    t /= 1e3, n++;
  return `${t < 10 && n > 0 ? t.toFixed(2) : Math.round(t).toLocaleString()} ${Hs[n]}`;
}
function Pe(e) {
  return (Number(e) || 0).toLocaleString();
}
const Jn = "G:\\photos", qs = [
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
      value: t ? `${Jn}\\${t}\\${e.key}` : `${Jn}\\${e.key}`
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
function Fa(e) {
  const t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
  if (t <= 0) return "";
  const n = e.slice(0, t), s = Jn.toLowerCase();
  return n.toLowerCase().startsWith(s + "\\") ? n : "";
}
function Ss(e, t) {
  const n = t.toLowerCase();
  return e.some((s) => n === s || n.startsWith(s + "\\"));
}
function Fl(e) {
  return e ? e.op === "is null" ? `${e.column} is null` : `${e.column} ${e.op} ${JSON.stringify(e.value)}` : "everything still kept";
}
function Ll(e, t) {
  return typeof e == "string" && typeof t == "string" ? e.toLowerCase() === t.toLowerCase() : e === t;
}
function La(e, t) {
  if (!t) return null;
  const n = e.find(
    (s) => s.term && s.term.column === t.column && s.term.op === t.op && Ll(s.term.value, t.value)
  );
  return n ? n.decision : null;
}
var Dl = /* @__PURE__ */ O('<div class="line cand svelte-1vgp6n7"><span class="muted svelte-1vgp6n7">with this rule &rarr;</span> <span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="delta svelte-1vgp6n7"> </span></div>'), jl = /* @__PURE__ */ O('<div class="line svelte-1vgp6n7"><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <!>', 1), Hl = /* @__PURE__ */ O('<div class="line muted svelte-1vgp6n7">…</div>'), ql = /* @__PURE__ */ O('<span class="stale svelte-1vgp6n7">stale — rules changed</span>'), Bl = /* @__PURE__ */ O('<div><span class="keep svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span> <span class="sep svelte-1vgp6n7">/</span> <span class="drop svelte-1vgp6n7"> </span> <span class="muted svelte-1vgp6n7"> </span></div> <div class="line muted small svelte-1vgp6n7"> </div>', 1), Ul = /* @__PURE__ */ O('<div class="line muted svelte-1vgp6n7"> </div>'), Wl = /* @__PURE__ */ O('<div class="counts svelte-1vgp6n7"><div><div class="tag svelte-1vgp6n7">PATHS <span class="muted svelte-1vgp6n7">live · ~300 ms</span></div> <!></div> <div><div class="tag svelte-1vgp6n7">FILES <span class="muted svelte-1vgp6n7">distinct content · ~25 s</span> <button> </button> <!></div> <!></div></div>');
function Gl(e, t) {
  ht(t, !0);
  let n = se(t, "counts", 3, null), s = se(t, "files", 3, null), a = se(t, "filesAt", 3, null), i = se(t, "stale", 3, !1), l = se(t, "candidate", 3, null), c = se(t, "busy", 3, !1);
  const o = /* @__PURE__ */ ie(() => n() && l() ? n().candidate_excluded_paths - n().excluded_paths : 0);
  var u = Wl(), p = f(u);
  let m;
  var g = v(f(p), 2);
  {
    var h = (q) => {
      var D = jl(), Y = lt(D), P = f(Y), z = f(P), fe = v(P, 2), I = f(fe), W = v(fe, 4), V = f(W), de = v(W, 2), X = f(de), Q = v(Y, 2);
      {
        var C = (ee) => {
          var H = Dl(), A = v(f(H), 2), L = f(A), E = v(A, 2), k = f(E), B = v(E, 4), G = f(B), oe = v(B, 2), Z = f(oe), J = v(oe, 2), he = f(J);
          U(
            (Se, Ae, ue, ve, Ee) => {
              T(L, `kept ${Se ?? ""}`), T(k, Ae), T(G, `excluded ${ue ?? ""}`), T(Z, ve), T(he, `${r(o) >= 0 ? "+" : ""}${Ee ?? ""} excluded`);
            },
            [
              () => Pe(n().candidate_kept_paths),
              () => Pt(n().candidate_kept_bytes),
              () => Pe(n().candidate_excluded_paths),
              () => Pt(n().candidate_excluded_bytes),
              () => Pe(r(o))
            ]
          ), R(ee, H);
        };
        re(Q, (ee) => {
          l() && ee(C);
        });
      }
      U(
        (ee, H, A, L) => {
          T(z, `kept ${ee ?? ""}`), T(I, H), T(V, `excluded ${A ?? ""}`), T(X, L);
        },
        [
          () => Pe(n().kept_paths),
          () => Pt(n().kept_bytes),
          () => Pe(n().excluded_paths),
          () => Pt(n().excluded_bytes)
        ]
      ), R(q, D);
    }, _ = (q) => {
      var D = Hl();
      R(q, D);
    };
    re(g, (q) => {
      n() ? q(h) : q(_, -1);
    });
  }
  var w = v(p, 2);
  let d;
  var b = f(w), y = v(f(b), 3), M = f(y), N = v(y, 2);
  {
    var j = (q) => {
      var D = ql();
      R(q, D);
    };
    re(N, (q) => {
      i() && s() && s() !== "loading" && q(j);
    });
  }
  var $ = v(b, 2);
  {
    var ne = (q) => {
      var D = Bl(), Y = lt(D);
      let P;
      var z = f(Y), fe = f(z), I = v(z, 2), W = f(I), V = v(I, 4), de = f(V), X = v(V, 2), Q = f(X), C = v(Y, 2), ee = f(C);
      U(
        (H, A, L, E) => {
          P = Me(Y, 1, "line svelte-1vgp6n7", null, P, { outdated: i() }), T(fe, `kept ${H ?? ""}`), T(W, A), T(de, `excluded ${L ?? ""}`), T(Q, E), T(ee, `as of ${a() ?? ""} · the saved rule set, not the candidate`);
        },
        [
          () => Pe(s().kept_files),
          () => Pt(s().kept_bytes),
          () => Pe(s().excluded_files),
          () => Pt(s().excluded_bytes)
        ]
      ), R(q, D);
    }, ae = (q) => {
      var D = Ul(), Y = f(D);
      U(() => T(Y, s() === "loading" ? "counting…" : "not counted yet")), R(q, D);
    };
    re($, (q) => {
      s() && s() !== "loading" ? q(ne) : q(ae, -1);
    });
  }
  U(() => {
    m = Me(p, 1, "block svelte-1vgp6n7", null, m, { busy: c() }), d = Me(w, 1, "block svelte-1vgp6n7", null, d, { busy: s() === "loading" }), y.disabled = s() === "loading", T(M, s() === "loading" ? "counting…" : "recount");
  }), te("click", y, function(...q) {
    t.onfiles?.apply(this, q);
  }), R(e, u), vt();
}
Ft(["click"]);
const cs = "http://www.w3.org/2000/svg", Tn = {
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
  ...Tn,
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
}, $l = [
  { dark: "tint", light: "tintLight", base: Tn },
  { dark: "control", light: "controlLight", base: bn },
  { dark: "ink", light: "inkLight", base: bn },
  { dark: "tally", light: "tallyLight", base: bn },
  { dark: "tallyInk", light: "tallyInkLight", base: bn }
], us = /* @__PURE__ */ new Set();
let Ct = { ...bn };
function Yl() {
  return Ct;
}
function Kr(e) {
  Ct = Xl(e), Es();
  for (const t of us) t(Ct);
  return Ct;
}
function Kl(e) {
  return us.add(e), () => us.delete(e);
}
function ur(e, t) {
  const n = typeof e == "number" ? e : Number.parseFloat(e);
  return Number.isFinite(n) ? n : t;
}
function Vl(e, t) {
  return !e || typeof e != "object" ? { ...t } : {
    r: Be(ur(e.r, t.r), 0, 255),
    g: Be(ur(e.g, t.g), 0, 255),
    b: Be(ur(e.b, t.b), 0, 255),
    a: Be(ur(e.a, t.a), 0, 1)
  };
}
function Xl(e) {
  const t = e && typeof e == "object" ? e : {}, n = {};
  for (const [s, a] of Object.entries(bn))
    typeof a == "boolean" ? n[s] = t[s] === void 0 ? a : !!t[s] : typeof a == "object" ? n[s] = Vl(t[s], a) : n[s] = ur(t[s], a);
  return n;
}
function mt({ r: e, g: t, b: n, a: s }) {
  return `rgba(${Math.round(e)}, ${Math.round(t)}, ${Math.round(n)}, ${Ne(s, 3)})`;
}
function Ne(e, t = 2) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
function Bs({ r: e, g: t, b: n, a: s }) {
  return { r: e, g: t, b: n, a: Be(s * 1.7 + 0.22, 0, 1) };
}
function Us(e, t) {
  const n = 0.4 + Be(e, 0, 100) / 100 * 5;
  return { width: n, blur: n * (1 - Be(t, 0, 100) / 100) };
}
function Ws(e, t) {
  const n = (e - Math.PI / 4 + t.glareAngle * (Math.PI / 180)) * 2, a = 1.2 * (n > Math.PI * 1.5 && n < Math.PI * 3.5 || n < Math.PI * -0.5 ? Be(t.glareOppositeFactor, 0, 100) / 100 : 1), i = (0.5 + Math.sin(n) * 0.5) * a * Math.max(t.glareFactor, 0) / 100;
  return Be(i ** (0.1 + Be(t.glareConvergence, 0, 100) / 100 * 2), 0, 1);
}
const Jl = [
  [1, -1, !0],
  [1, 1, !1],
  [-1, 1, !0],
  [-1, -1, !1]
];
function Zl(e, t, n) {
  const s = Be(n.shapeRoundness, 2, 7), a = e / 2, i = t / 2, l = Math.min(n.shapeRadius, a, i), c = a - l, o = i - l, u = 8, p = [];
  for (let h = 0; h <= u; h++) {
    const _ = h / u * (Math.PI / 2);
    p.push([l * Math.cos(_) ** (2 / s), l * Math.sin(_) ** (2 / s)]);
  }
  const m = [], g = (h, _, w, d) => {
    let b = Math.atan2(h, -_);
    b < 0 && (b += Math.PI * 2);
    let y = Math.atan2(d, w);
    y < 0 && (y += Math.PI * 2);
    const M = Ne(Ws(y, n), 3);
    m.push(`rgba(255, 255, 255, ${M}) ${Ne(b / (Math.PI * 2) * 100, 2)}%`);
  };
  g(0, -i, 0, 1);
  for (const [h, _, w] of Jl)
    for (let d = 0; d <= u; d++) {
      const [b, y] = p[w ? u - d : d];
      g(h * (c + b), _ * (o + y), h * b ** (s - 1), -_ * y ** (s - 1));
    }
  return m.push(`rgba(255, 255, 255, ${Ne(Ws(Math.PI / 2, n), 3)}) 100%`), `conic-gradient(${m.join(", ")})`;
}
function Es() {
  const e = Ct, t = document.documentElement.style, n = Us(e.refFresnelRange, e.refFresnelHardness), s = Us(e.glareRange, e.glareHardness);
  t.setProperty("--glass-blur", `${Ne(e.blurRadius)}px`), t.setProperty("--glass-saturate", `${Ne(Math.max(e.saturation, 0))}%`), t.setProperty("--glass-tint-dark", mt(e.tint)), t.setProperty("--glass-tint-light", mt(e.tintLight)), t.setProperty("--glass-tint-sheet-dark", mt(Bs(e.tint))), t.setProperty("--glass-tint-sheet-light", mt(Bs(e.tintLight))), t.setProperty("--glass-ctl-dark", mt(e.control)), t.setProperty("--glass-ctl-light", mt(e.controlLight)), t.setProperty("--glass-text-dark", mt(e.ink)), t.setProperty("--glass-text-light", mt(e.inkLight)), t.setProperty("--glass-tint-tally-dark", mt(e.tally)), t.setProperty("--glass-tint-tally-light", mt(e.tallyLight)), t.setProperty("--glass-text-tally-dark", mt(e.tallyInk)), t.setProperty("--glass-text-tally-light", mt(e.tallyInkLight)), t.setProperty("--glass-tally-h", `${Ne(Math.max(e.tallyHeight, 0))}px`), t.setProperty("--header-top", `${Ne(Math.max(e.headerTop, 0))}px`), t.setProperty("--header-side", `${Ne(Math.max(e.headerSide, 0))}px`), t.setProperty("--page-top", `${Ne(Math.max(e.pageTop, 0))}px`), t.setProperty(
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
function Ql(e, t, n, s, a, i) {
  const l = Math.abs(e) - n + a, c = Math.abs(t) - s + a, o = Math.max(l, 0), u = Math.max(c, 0), p = i === 2 ? Math.hypot(o, u) : (o ** i + u ** i) ** (1 / i);
  return Math.min(Math.max(l, c), 0) + p - a;
}
function eo(e, t, n) {
  const s = e / 2, a = t / 2, i = Be(n.shapeRoundness, 2, 7), l = Math.min(n.shapeRadius, Math.min(e, t) / 2), c = Math.max(1, Math.min(n.refThickness, Math.min(e, t) / 2.5)), o = Math.max(1.0001, n.refFactor), u = (g, h) => Ql(g - s, h - a, s, a, l, i), p = 256, m = new Float32Array(p + 1);
  for (let g = 0; g <= p; g++) {
    const h = 1 - g / p, _ = Math.asin(Be(h * h, 0, 1)), w = Math.asin(Be(Math.sin(_) / o, 0, 1));
    m[g] = Math.tan(_ - w) * c;
  }
  return (g, h) => {
    const _ = -u(g, h);
    if (_ < 0 || _ >= c) return null;
    const w = m[Math.round(_ / c * p)];
    if (w === 0) return null;
    const d = 0.75, b = u(g + d, h) - u(g - d, h), y = u(g, h + d) - u(g, h - d), M = Math.hypot(b, y);
    if (M === 0) return null;
    const N = -w / M;
    return { dx: b * N, dy: y * N };
  };
}
function to(e, t, n) {
  const s = document.createElement("canvas");
  s.width = e, s.height = t;
  const a = s.getContext("2d"), i = a.createImageData(e, t), l = i.data, c = e * t, o = new Float32Array(c), u = new Float32Array(c);
  let p = 0;
  for (let g = 0; g < t; g++)
    for (let h = 0; h < e; h++) {
      const _ = n(h + 0.5, g + 0.5);
      if (!_) continue;
      const w = g * e + h;
      o[w] = _.dx, u[w] = _.dy;
      const d = Math.hypot(_.dx, _.dy);
      d > p && (p = d);
    }
  const m = p > 0 ? 127 / p : 0;
  for (let g = 0; g < c; g++) {
    const h = g * 4;
    l[h] = 128 + Be(Math.round(o[g] * m), -127, 127), l[h + 1] = 128 + Be(Math.round(u[g] * m), -127, 127), l[h + 2] = 128, l[h + 3] = 255;
  }
  return a.putImageData(i, 0, 0), { url: s.toDataURL(), scale: p * 2 };
}
const Vr = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
];
function Xr(e, t, n) {
  return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${Ne(e, 3)}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="matrix" values="${t}" result="${n}"/>`;
}
let ar = null, no = 0;
function ro() {
  if (ar) return ar;
  const e = document.createElementNS(cs, "svg");
  return e.setAttribute("aria-hidden", "true"), e.setAttribute("width", "0"), e.setAttribute("height", "0"), e.classList.add("glass-defs"), ar = document.createElementNS(cs, "defs"), e.appendChild(ar), document.body.appendChild(e), ar;
}
function pn(e) {
  const t = `glass-refract-${++no}`, n = document.createElementNS(cs, "filter");
  n.setAttribute("color-interpolation-filters", "sRGB"), n.setAttribute("filterUnits", "userSpaceOnUse"), ro().appendChild(n);
  let s = 0, a = 0, i = 0, l = 0;
  const c = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let o = null, u = "";
  function p() {
    e.style.setProperty("--glass-pre", Ct.blurEdge ? "" : u), e.style.setProperty("--glass-post", Ct.blurEdge ? u : "");
  }
  function m() {
    s < 2 || a < 2 || e.style.setProperty("--glass-glare", Zl(s, a, Ct));
  }
  function g() {
    if (s < 2 || a < 2) return;
    const d = Ct, b = to(s, a, eo(s, a, d)), y = d.refDispersion * 2 / 100;
    n.setAttribute("x", "0"), n.setAttribute("y", "0"), n.setAttribute("width", String(s)), n.setAttribute("height", String(a)), n.innerHTML = `<feImage x="0" y="0" width="${s}" height="${a}" preserveAspectRatio="none" href="${b.url}" result="map"/>` + Xr(b.scale * (1 + y), Vr[0], "r") + Xr(b.scale, Vr[1], "g") + Xr(b.scale * (1 - y), Vr[2], "b") + '<feBlend in="r" in2="g" mode="screen"/><feBlend in2="b" mode="screen"/>', n.id = `${t}-${++i}`, u = `url(#${n.id})`, p(), getComputedStyle(e).backdropFilter.includes("url(") || (u = "", p()), o = c.map((M) => Ct[M]).join(" ");
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
  const w = Kl(() => {
    m(), c.map((d) => Ct[d]).join(" ") !== o ? h() : p();
  });
  return {
    destroy() {
      l && cancelAnimationFrame(l), w(), _.disconnect(), n.remove(), e.style.removeProperty("--glass-pre"), e.style.removeProperty("--glass-post"), e.style.removeProperty("--glass-glare");
    }
  };
}
const Da = "photos.stack", Jr = { on: !1, window: 4 }, ja = 1, Ha = 10;
function so() {
  let e = null;
  try {
    e = JSON.parse(localStorage.getItem(Da) ?? "");
  } catch {
    return { ...Jr };
  }
  if (e === null || typeof e != "object") return { ...Jr };
  const t = Number(e.window);
  return {
    on: e.on === !0,
    window: Number.isInteger(t) && t >= ja && t <= Ha ? t : Jr.window
  };
}
function ao(e) {
  return localStorage.setItem(Da, JSON.stringify({ on: e.on, window: e.window })), e;
}
const qa = "photos.theme", Ba = "dark";
function Ua() {
  return document.documentElement.dataset.theme === "light" ? "light" : Ba;
}
function io() {
  const e = localStorage.getItem(qa), t = e === "dark" || e === "light" ? e : Ba;
  return document.documentElement.dataset.theme = t, t;
}
function Wa(e) {
  return document.documentElement.dataset.theme = e, localStorage.setItem(qa, e), e;
}
var lo = /* @__PURE__ */ O('<div class="glass marks svelte-zne36e"><span class="nums svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span></span> <button class="menu small svelte-zne36e" title="Copy the conditions and the marked ids to the clipboard">Share</button> <button class="menu small svelte-zne36e">Clear</button></div>'), oo = /* @__PURE__ */ O('<span class="spin svelte-zne36e" aria-label="loading"></span>'), Gs = /* @__PURE__ */ O('<span class="badge svelte-zne36e"> </span>'), co = /* @__PURE__ */ O('<button class="fchip svelte-zne36e"><span class="muted svelte-zne36e"> </span> <span class="x svelte-zne36e">×</span></button>'), uo = /* @__PURE__ */ O('<div class="chips svelte-zne36e"><!> <button class="clear svelte-zne36e">Clear all</button></div>'), fo = /* @__PURE__ */ O("<button> </button>"), ho = /* @__PURE__ */ O('<div class="glass sheet sorts svelte-zne36e"></div>'), vo = /* @__PURE__ */ O(`<div class="glass sheet stacks svelte-zne36e"><section><h2 class="svelte-zne36e">Stacking</h2> <div class="options svelte-zne36e"><button role="switch"> </button></div> <p class="note svelte-zne36e">A run of consecutive frames from one camera is drawn as one tile.</p></section> <section><h2 id="stack-window" class="svelte-zne36e">Window</h2> <div class="slider svelte-zne36e"><input type="range" step="1" aria-labelledby="stack-window" class="svelte-zne36e"/> <span class="secs svelte-zne36e"> </span></div> <p class="note svelte-zne36e">Frames further apart than this start a new stack. Four is where the
            number of distinct sets in this library peaks.</p></section></div>`), po = /* @__PURE__ */ O('<p class="muted svelte-zne36e">loading…</p>'), go = /* @__PURE__ */ O('<span class="help svelte-zne36e">?</span>'), _o = /* @__PURE__ */ O('<span class="n svelte-zne36e"> </span>'), bo = /* @__PURE__ */ O("<button> <!></button>"), mo = /* @__PURE__ */ O('<span class="muted svelte-zne36e">nothing here</span>'), wo = /* @__PURE__ */ O('<section class="svelte-zne36e"><h2 class="svelte-zne36e"> <!></h2> <div class="options svelte-zne36e"><!> <!></div></section>'), yo = /* @__PURE__ */ O('<div class="glass sheet filters svelte-zne36e"><!></div>'), xo = /* @__PURE__ */ O('<div class="topbar svelte-zne36e"><div class="panes svelte-zne36e"><!> <div class="glass tally svelte-zne36e"><strong class="svelte-zne36e"> </strong> <span class="muted svelte-zne36e"> </span> <!></div></div> <div class="stack svelte-zne36e"><div class="glass bar svelte-zne36e" role="toolbar" aria-label="Grid controls" tabindex="-1"><div class="controls svelte-zne36e"><button> <span class="caret svelte-zne36e">▾</span></button> <button>Filters<!><span class="caret svelte-zne36e">▾</span></button> <button>Stacks<!><span class="caret svelte-zne36e">▾</span></button> <button role="switch" title="Mark tiles by clicking them, then copy their ids">Select</button> <!></div> <button class="menu theme svelte-zne36e"> </button> <button class="menu svelte-zne36e" title="Leave the grid and go to triage">Triage</button></div> <!> <!> <!></div></div>');
function ko(e, t) {
  ht(t, !0);
  let n = se(t, "facets", 3, null), s = se(t, "selected", 19, () => ({})), a = se(t, "sort", 3, "newest"), i = se(t, "stacking", 19, () => ({ on: !1, window: 4 })), l = se(t, "total", 3, null), c = se(t, "tiles", 3, null), o = se(t, "loading", 3, !1), u = se(t, "selecting", 3, !1), p = se(t, "marked", 19, () => ({ stacks: 0, photos: 0 })), m = se(t, "onselect", 3, () => {
  }), g = se(t, "onsort", 3, () => {
  }), h = se(t, "onstack", 3, () => {
  }), _ = se(t, "onclear", 3, () => {
  }), w = se(t, "onselecting", 3, () => {
  }), d = se(t, "onshare", 3, () => {
  }), b = se(t, "onunmark", 3, () => {
  }), y = se(t, "ontriage", 3, () => {
  }), M = /* @__PURE__ */ K(
    ""
    // "" | "sort" | "filters" | "stacks"
  ), N = /* @__PURE__ */ K(Ce(Ua())), j = /* @__PURE__ */ K(null);
  const $ = /* @__PURE__ */ ie(() => c() ?? l()), ne = /* @__PURE__ */ ie(() => n()?.dimensions ?? []), ae = /* @__PURE__ */ ie(() => n()?.sorts ?? []), q = /* @__PURE__ */ ie(() => r(ae).find((F) => F.value === a())?.label ?? a()), D = /* @__PURE__ */ ie(() => Object.values(s()).reduce((F, ce) => F + ce.length, 0)), Y = /* @__PURE__ */ ie(() => r(ne).flatMap((F) => (s()[F.name] ?? []).map((ce) => ({
    dimension: F.name,
    value: ce,
    title: F.title,
    label: F.options.find((ge) => ge.value === ce)?.label ?? String(ce)
  }))));
  function P(F, ce) {
    const ge = s()[F] ?? [], ze = ge.includes(ce) ? ge.filter((ke) => ke !== ce) : [...ge, ce];
    m()(F, ze);
  }
  function z(F, ce) {
    return (s()[F] ?? []).includes(ce);
  }
  function fe() {
    x(N, Wa(r(N) === "dark" ? "light" : "dark"), !0);
  }
  let I = /* @__PURE__ */ K(null);
  const W = /* @__PURE__ */ ie(() => r(I) ?? i().window);
  function V(F) {
    x(I, Number(F), !0);
  }
  function de(F) {
    x(I, null), h()({ ...i(), window: Number(F) });
  }
  qt(() => {
    r(M) !== "stacks" && x(I, null);
  });
  function X(F) {
    F.key === "Escape" && x(M, "");
  }
  function Q(F) {
    r(M) && !F.target.closest(".topbar") && x(M, "");
  }
  tr(() => {
    const F = new ResizeObserver(([ce]) => {
      const ge = Math.round(ce.borderBoxSize?.[0]?.blockSize ?? ce.contentRect.height);
      document.documentElement.style.setProperty("--header-h", ge + "px");
    });
    return F.observe(r(j)), () => {
      F.disconnect(), document.documentElement.style.removeProperty("--header-h");
    };
  });
  var C = xo();
  Rn("keydown", wn, X), Rn("pointerdown", wn, Q);
  var ee = f(C), H = f(ee);
  {
    var A = (F) => {
      var ce = lo(), ge = f(ce), ze = f(ge), ke = f(ze), we = v(ze, 2), Fe = f(we), tt = v(we, 2), $t = f(tt), Oe = v(tt, 2), an = f(Oe), Yt = v(ge, 2), _t = v(Yt, 2);
      vn(ce, (ln) => pn?.(ln)), U(
        (ln, nr) => {
          T(ke, ln), T(Fe, p().stacks === 1 ? "stack" : "stacks"), T($t, nr), T(an, p().photos === 1 ? "photo" : "photos");
        },
        [() => Pe(p().stacks), () => Pe(p().photos)]
      ), te("click", Yt, () => d()()), te("click", _t, () => b()()), R(F, ce);
    };
    re(H, (F) => {
      p().stacks && F(A);
    });
  }
  var L = v(H, 2), E = f(L), k = f(E), B = v(E, 2), G = f(B), oe = v(B, 2);
  {
    var Z = (F) => {
      var ce = oo();
      R(F, ce);
    };
    re(oe, (F) => {
      o() && F(Z);
    });
  }
  vn(L, (F) => pn?.(F));
  var J = v(ee, 2), he = f(J), Se = f(he), Ae = f(Se);
  let ue;
  var ve = f(Ae), Ee = v(Ae, 2);
  let xe;
  var We = v(f(Ee));
  {
    var Ze = (F) => {
      var ce = Gs(), ge = f(ce);
      U(() => T(ge, r(D))), R(F, ce);
    };
    re(We, (F) => {
      r(D) && F(Ze);
    });
  }
  var Ge = v(Ee, 2);
  let Tt;
  var Wt = v(f(Ge));
  {
    var xn = (F) => {
      var ce = Gs(), ge = f(ce);
      U((ze) => T(ge, ze), [() => Pe(l())]), R(F, ce);
    };
    re(Wt, (F) => {
      i().on && l() !== null && F(xn);
    });
  }
  var Qe = v(Ge, 2);
  let Ke;
  var Mt = v(Qe, 2);
  {
    var Gt = (F) => {
      var ce = uo(), ge = f(ce);
      Ye(ge, 17, () => r(Y), (ke) => ke.dimension + " " + ke.value, (ke, we) => {
        var Fe = co(), tt = f(Fe), $t = f(tt), Oe = v(tt, 1, !0);
        U(() => {
          pe(Fe, "title", `${r(we).title ?? ""}: ${r(we).label ?? ""} — click to remove`), T($t, r(we).title), T(Oe, r(we).label);
        }), te("click", Fe, () => P(r(we).dimension, r(we).value)), R(ke, Fe);
      });
      var ze = v(ge, 2);
      te("click", ze, () => _()()), R(F, ce);
    };
    re(Mt, (F) => {
      r(Y).length && F(Gt);
    });
  }
  var st = v(Se, 2), sn = f(st), pt = v(st, 2);
  vn(he, (F) => pn?.(F));
  var gt = v(he, 2);
  {
    var At = (F) => {
      var ce = ho();
      Ye(ce, 21, () => r(ae), xt, (ge, ze) => {
        var ke = fo();
        let we;
        var Fe = f(ke);
        U(() => {
          we = Me(ke, 1, "option svelte-zne36e", null, we, { on: r(ze).value === a() }), T(Fe, r(ze).label);
        }), te("click", ke, () => {
          g()(r(ze).value), x(M, "");
        }), R(ge, ke);
      }), vn(ce, (ge) => pn?.(ge)), R(F, ce);
    };
    re(gt, (F) => {
      r(M) === "sort" && F(At);
    });
  }
  var $e = v(gt, 2);
  {
    var Rt = (F) => {
      var ce = vo(), ge = f(ce), ze = v(f(ge), 2), ke = f(ze);
      let we;
      var Fe = f(ke), tt = v(ge, 2), $t = v(f(tt), 2), Oe = f($t), an = v(Oe, 2), Yt = f(an);
      vn(ce, (_t) => pn?.(_t)), U(() => {
        we = Me(ke, 1, "option svelte-zne36e", null, we, { on: i().on }), pe(ke, "aria-checked", i().on), T(Fe, i().on ? "On" : "Off"), pe(Oe, "min", ja), pe(Oe, "max", Ha), En(Oe, r(W)), pe(Oe, "aria-valuetext", `${r(W) ?? ""} seconds`), T(Yt, `${r(W) ?? ""}s`);
      }), te("click", ke, () => h()({ ...i(), on: !i().on })), te("input", Oe, (_t) => V(_t.currentTarget.value)), te("change", Oe, (_t) => de(_t.currentTarget.value)), R(F, ce);
    };
    re($e, (F) => {
      r(M) === "stacks" && F(Rt);
    });
  }
  var Lt = v($e, 2);
  {
    var et = (F) => {
      var ce = yo(), ge = f(ce);
      {
        var ze = (we) => {
          var Fe = po();
          R(we, Fe);
        }, ke = (we) => {
          var Fe = ys(), tt = lt(Fe);
          Ye(tt, 17, () => r(ne), xt, ($t, Oe) => {
            var an = wo(), Yt = f(an), _t = f(Yt), ln = v(_t);
            {
              var nr = (be) => {
                var Te = go();
                U(() => pe(Te, "title", r(Oe).hint)), R(be, Te);
              };
              re(ln, (be) => {
                r(Oe).hint && be(nr);
              });
            }
            var jr = v(Yt, 2), mr = f(jr);
            Ye(mr, 17, () => r(Oe).options, xt, (be, Te) => {
              var Le = bo();
              let bt;
              var Kt = f(Le), on = v(Kt);
              {
                var ct = (Dt) => {
                  var kn = _o(), Ve = f(kn);
                  U((ut) => T(Ve, ut), [() => Pe(r(Te).count)]), R(Dt, kn);
                };
                re(on, (Dt) => {
                  r(Te).count !== null && Dt(ct);
                });
              }
              U(
                (Dt) => {
                  bt = Me(Le, 1, "option svelte-zne36e", null, bt, Dt), T(Kt, `${r(Te).label ?? ""} `);
                },
                [
                  () => ({ on: z(r(Oe).name, r(Te).value) })
                ]
              ), te("click", Le, () => P(r(Oe).name, r(Te).value)), R(be, Le);
            });
            var S = v(mr, 2);
            {
              var le = (be) => {
                var Te = mo();
                R(be, Te);
              };
              re(S, (be) => {
                r(Oe).options.length || be(le);
              });
            }
            U(() => T(_t, `${r(Oe).title ?? ""} `)), R($t, an);
          }), R(we, Fe);
        };
        re(ge, (we) => {
          n() ? we(ke, -1) : we(ze);
        });
      }
      vn(ce, (we) => pn?.(we)), R(F, ce);
    };
    re(Lt, (F) => {
      r(M) === "filters" && F(et);
    });
  }
  pr(C, (F) => x(j, F), () => r(j)), U(
    (F) => {
      T(k, F), T(G, r($) === 1 ? "photo" : "photos"), ue = Me(Ae, 1, "menu svelte-zne36e", null, ue, { open: r(M) === "sort" }), pe(Ae, "aria-expanded", r(M) === "sort"), T(ve, r(q)), xe = Me(Ee, 1, "menu svelte-zne36e", null, xe, { open: r(M) === "filters", on: r(D) > 0 }), pe(Ee, "aria-expanded", r(M) === "filters"), Tt = Me(Ge, 1, "menu svelte-zne36e", null, Tt, { open: r(M) === "stacks", on: i().on }), pe(Ge, "aria-expanded", r(M) === "stacks"), Ke = Me(Qe, 1, "menu svelte-zne36e", null, Ke, { on: u() }), pe(Qe, "aria-checked", u()), pe(st, "title", r(N) === "dark" ? "Switch to a white background" : "Switch to a black background"), pe(st, "aria-label", r(N) === "dark" ? "Switch to a white background" : "Switch to a black background"), T(sn, r(N) === "dark" ? "☀" : "☾");
    },
    [() => r($) === null ? "…" : Pe(r($))]
  ), te("click", Ae, () => x(M, r(M) === "sort" ? "" : "sort", !0)), te("click", Ee, () => x(M, r(M) === "filters" ? "" : "filters", !0)), te("click", Ge, () => x(M, r(M) === "stacks" ? "" : "stacks", !0)), te("click", Qe, () => w()(!u())), te("click", st, fe), te("click", pt, () => y()()), R(e, C), vt();
}
Ft(["click", "input", "change"]);
const jt = 4, Ir = 220, So = 340, gn = 12, $s = jt + gn, Ga = 6, Eo = 5, To = 0.025, Mo = 9;
function zr(e) {
  return !e.w || !e.h || e.w <= 0 || e.h <= 0 ? 1 : Math.min(Math.max(e.w / e.h, 0.2), 5);
}
function Ao(e, t, n, s, a) {
  let i = t;
  for (; i < e.length; ) {
    let l = i, c = 0, o = 1 / 0;
    for (; l < e.length && (c += zr(e[l]), l++, o = (n - jt * (l - i - 1)) / c, !(o <= Ir)); )
      ;
    if (o > Ir && !s) break;
    a(i, l, Math.round(Math.min(o, So))), i = l;
  }
  return i;
}
function Ro(e, t, n) {
  const s = [];
  let a = 0;
  for (let i = e.from; i < e.to; i++) {
    const c = i === e.to - 1 ? n - a : Math.round(zr(t[i]) * e.height);
    s.push({ index: i, x: a, w: c }), a += c + jt;
  }
  return s;
}
function Po(e, t) {
  const n = Math.min((e | 0) - 1, Ga);
  if (n < 1) return [];
  const s = Math.min(Eo, t * To), a = [];
  for (let i = 1; i <= n; i++)
    a.push({
      top: Math.round(gn * (n - i) / n),
      inset: Math.round(i * s),
      // Integer percent, so the value lands on the decimal it reads as rather
      // than on whatever a chain of float multiplies leaves behind.
      opacity: (100 - (i - 1) * Mo) / 100
    });
  return a;
}
function Ys(e, t, n) {
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
var Co = /* @__PURE__ */ O('<button class="frame svelte-5g1i2z" type="button" title="Reveal this frame in Explorer"><img alt="" decoding="async"/></button>'), Oo = /* @__PURE__ */ O('<div role="dialog" tabindex="-1"><div class="frames svelte-5g1i2z"></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Previous tile" aria-label="Previous tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M14.5 5 7.5 12l7 7"></path></svg></button></div> <div class="lane svelte-5g1i2z"><button class="glass puck svelte-5g1i2z" type="button" title="Next tile" aria-label="Next tile"><svg viewBox="0 0 24 24" aria-hidden="true" class="svelte-5g1i2z"><path d="M9.5 5l7 7-7 7"></path></svg></button></div></div>');
function No(e, t) {
  ht(t, !0);
  let n = se(t, "frames", 19, () => []), s = se(t, "origin", 3, null), a = se(t, "back", 3, !1), i = se(t, "forward", 3, !1), l = se(t, "onstep", 3, () => {
  }), c = se(t, "onreveal", 3, () => {
  }), o = se(t, "onclose", 3, () => {
  });
  const u = 40, p = 72, m = /* @__PURE__ */ ie(() => n().length === 1 ? "one photograph" : `${n().length} frames in this stack`);
  let g = /* @__PURE__ */ K(Ce(document.documentElement.clientWidth)), h = /* @__PURE__ */ K(Ce(document.documentElement.clientHeight)), _ = /* @__PURE__ */ K(null), w = /* @__PURE__ */ K(Ce(/* @__PURE__ */ new Set()));
  const d = 4, b = 25, y = { x: 0, y: 0, w: 0, h: 0 }, M = /* @__PURE__ */ ie(() => Math.max(0, r(g) - p * 2)), N = /* @__PURE__ */ ie(() => Math.max(0, r(h) - u * 2)), j = /* @__PURE__ */ ie(() => r(M) > 0 && r(N) > 0 ? q(n(), r(M), r(N)) : n().map(() => y));
  function $(A, L, E) {
    const k = [];
    let B = 0, G = 0;
    for (let oe = 0; oe < A.length; oe++)
      G += zr(A[oe]), G * E + jt * (oe - B) >= L && (k.push({ from: B, to: oe + 1, sum: G }), B = oe + 1, G = 0);
    return B < A.length && k.push({ from: B, to: A.length, sum: G }), k;
  }
  function ne(A, L, E) {
    return A.map((k, B) => {
      const G = (L - jt * (k.to - k.from - 1)) / k.sum;
      return B === A.length - 1 && G > E ? E : G;
    });
  }
  function ae(A, L, E) {
    return ne(A, L, E).reduce((k, B) => k + B, 0) + jt * (A.length - 1);
  }
  function q(A, L, E) {
    let k = d, B = Math.max(d, E);
    for (let he = 0; he < b; he++) {
      const Se = (k + B) / 2;
      ae($(A, L, Se), L, Se) <= E ? k = Se : B = Se;
    }
    const G = $(A, L, k), oe = ne(G, L, k), Z = [];
    let J = (E - (oe.reduce((he, Se) => he + Se, 0) + jt * (G.length - 1))) / 2;
    return G.forEach((he, Se) => {
      const Ae = oe[Se], ue = [];
      for (let xe = he.from; xe < he.to; xe++) ue.push(zr(A[xe]) * Ae);
      const ve = ue.reduce((xe, We) => xe + We, 0) + jt * (ue.length - 1);
      let Ee = (L - ve) / 2;
      for (const xe of ue)
        Z.push({
          x: Math.round(Ee),
          y: Math.round(J),
          w: Math.round(xe),
          h: Math.round(Ae)
        }), Ee += xe + jt;
      J += Ae + jt;
    }), Z;
  }
  function D(A) {
    if (!s() || !A || !A.w || !A.h) return "none";
    const L = s().left - (p + A.x), E = s().top - (u + A.y);
    return `translate(${L}px, ${E}px) scale(${s().width / A.w}, ${s().height / A.h})`;
  }
  const Y = 1600;
  let P = /* @__PURE__ */ K(!1), z = 0;
  function fe() {
    x(P, !1), clearTimeout(z), z = setTimeout(() => x(P, !0), Y);
  }
  function I(A) {
    if (A.key === "Escape") {
      o()();
      return;
    }
    A.key !== "ArrowLeft" && A.key !== "ArrowRight" || (A.preventDefault(), l()(A.key === "ArrowLeft" ? -1 : 1, A.repeat));
  }
  function W(A) {
    A.target.closest(".frame, .lane") || o()();
  }
  tr(() => (r(_)?.focus(), fe(), () => clearTimeout(z)));
  var V = Oo();
  Rn("keydown", wn, I), Rn("pointerdown", wn, W), Rn("pointermove", wn, fe);
  let de;
  var X = f(V);
  Zt(X, "", {}, { inset: "40px 72px" }), Ye(X, 23, n, (A) => A.id, (A, L, E) => {
    var k = Co();
    let B;
    var G = f(k);
    let oe;
    U(
      (Z, J) => {
        B = Zt(k, "", B, Z), pe(G, "src", `/d/${r(L).s ?? ""}.webp`), oe = Me(G, 1, "svelte-5g1i2z", null, oe, J);
      },
      [
        () => ({
          left: `${r(j)[r(E)].x ?? ""}px`,
          top: `${r(j)[r(E)].y ?? ""}px`,
          width: `${r(j)[r(E)].w ?? ""}px`,
          height: `${r(j)[r(E)].h ?? ""}px`,
          "--flight": D(r(j)[r(E)])
        }),
        () => ({ loaded: r(w).has(r(L).id) })
      ]
    ), te("click", k, () => c()(r(L))), Rn("load", G, () => x(w, new Set(r(w)).add(r(L).id), !0)), R(A, k);
  });
  var Q = v(X, 2);
  Zt(Q, "", {}, { width: "44px", left: "14px" });
  var C = f(Q);
  vn(C, (A) => pn?.(A));
  var ee = v(Q, 2);
  Zt(ee, "", {}, { width: "44px", right: "14px" });
  var H = f(ee);
  vn(H, (A) => pn?.(A)), pr(V, (A) => x(_, A), () => r(_)), U(() => {
    de = Me(V, 1, "glass pane svelte-5g1i2z", null, de, { resting: r(P) }), pe(V, "aria-label", r(m)), C.disabled = !a(), H.disabled = !i();
  }), te("click", C, () => l()(-1)), te("click", H, () => l()(1)), Ds(V, "clientWidth", (A) => x(g, A)), Ds(V, "clientHeight", (A) => x(h, A)), R(e, V), vt();
}
Ft(["click"]);
var Io = /* @__PURE__ */ O('<span class="err svelte-uzy12d"> </span>'), zo = /* @__PURE__ */ O(`<span class="muted svelte-uzy12d">Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code class="svelte-uzy12d">unknown</code> </span>`), Fo = /* @__PURE__ */ O(`<span><strong> </strong> kept files have no dimensions and a
        readable header. Run <code class="svelte-uzy12d"> </code>, then <code class="svelte-uzy12d">python -m archive.pipeline.triage_survey</code>, then reload.</span>`), Lo = /* @__PURE__ */ O('<span class="muted svelte-uzy12d"> </span>'), Do = /* @__PURE__ */ O('<div class="probe svelte-uzy12d"><button> </button> <!></div>');
function jo(e, t) {
  ht(t, !0);
  let n = /* @__PURE__ */ K(null), s = /* @__PURE__ */ K(!1), a = /* @__PURE__ */ K(null);
  async function i() {
    x(s, !0), x(a, null);
    try {
      x(n, await De.probe(), !0);
    } catch (h) {
      x(a, String(h), !0);
    } finally {
      x(s, !1);
    }
  }
  var l = Do(), c = f(l), o = f(c), u = v(c, 2);
  {
    var p = (h) => {
      var _ = Io(), w = f(_);
      U(() => T(w, r(a))), R(h, _);
    }, m = (h) => {
      var _ = ys(), w = lt(_);
      {
        var d = (y) => {
          var M = zo(), N = v(f(M), 2);
          U(
            (j) => T(N, ` above are formats the header
        reader cannot measure (${j ?? ""}) or files with no
        extension.`),
            [() => r(n).formats.join(" ")]
          ), R(y, M);
        }, b = (y) => {
          var M = Fo(), N = f(M), j = f(N), $ = v(N, 2), ne = f($);
          U(
            (ae) => {
              T(j, ae), T(ne, r(n).command);
            },
            [() => Pe(r(n).worklist)]
          ), R(y, M);
        };
        re(w, (y) => {
          r(n).worklist === 0 ? y(d) : y(b, -1);
        });
      }
      R(h, _);
    }, g = (h) => {
      var _ = Lo(), w = f(_);
      U(() => T(w, `Screen ${t.screen.id ?? ""} bands on the long edge; this reports how many kept files
      still have none.`)), R(h, _);
    };
    re(u, (h) => {
      r(a) ? h(p) : r(n) ? h(m, 1) : h(g, -1);
    });
  }
  U(() => {
    c.disabled = r(s), T(o, r(s) ? "counting…" : "Check the dimension probe's worklist");
  }), te("click", c, i), R(e, l), vt();
}
Ft(["click"]);
var Ho = /* @__PURE__ */ O('<p class="bad svelte-1xjbga"> </p>'), qo = /* @__PURE__ */ O('<pre class="svelte-1xjbga"> </pre>'), Bo = /* @__PURE__ */ O('<div><div class="row svelte-1xjbga"><span class="mark svelte-1xjbga"><!></span> <span class="name svelte-1xjbga"> </span> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span></div> <!></div>'), Uo = /* @__PURE__ */ O(
  `<p class="bad svelte-1xjbga"> </p> <p class="muted svelte-1xjbga">Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.</p>`,
  1
), Wo = /* @__PURE__ */ O('<p class="svelte-1xjbga">Done. The grid is showing the tile set your rules and overrides describe.</p>'), Go = /* @__PURE__ */ O('<p class="muted svelte-1xjbga">Safe to close — this runs in the server, not in this tab.</p>'), $o = /* @__PURE__ */ O(`<div class="rollback svelte-1xjbga"><div class="head svelte-1xjbga">roll back to before this run</div> <p class="muted svelte-1xjbga">That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.</p> <pre class="svelte-1xjbga">python -m photolib.restore_state --list</pre> <pre class="svelte-1xjbga"> </pre></div>`), Yo = /* @__PURE__ */ O('<div class="scrim svelte-1xjbga"></div> <div class="popup svelte-1xjbga" role="dialog" aria-label="Apply triage to the grid"><div class="top svelte-1xjbga"><strong>Apply triage to the grid</strong> <span class="spacer svelte-1xjbga"></span> <span class="muted svelte-1xjbga"> </span> <button class="link svelte-1xjbga">close</button></div> <!> <!> <!> <!></div>', 1), Ko = /* @__PURE__ */ O(
  `<div class="apply svelte-1xjbga"><button class="go svelte-1xjbga"> </button> <button class="link svelte-1xjbga">last run</button> <p class="muted note svelte-1xjbga">Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.</p></div> <!>`,
  1
);
function Vo(e, t) {
  ht(t, !0);
  let n = /* @__PURE__ */ K(null), s = /* @__PURE__ */ K(!1), a = /* @__PURE__ */ K(null), i = /* @__PURE__ */ K(null);
  const l = /* @__PURE__ */ ie(() => r(n)?.state === "running"), c = /* @__PURE__ */ ie(() => r(n)?.snapshot ? r(n).snapshot.split(/[\\/]/).pop() : null);
  async function o() {
    try {
      const y = await De.rebuildStatus();
      x(n, y, !0), x(a, null), y.state === "done" && y.started_at !== r(i) && (x(i, y.started_at, !0), t.oncomplete?.());
    } catch (y) {
      x(a, String(y), !0);
    }
  }
  tr(() => {
    o();
  }), qt(() => {
    if (!r(l)) return;
    const y = setInterval(o, 700);
    return () => clearInterval(y);
  });
  async function u() {
    x(s, !0), x(a, null);
    try {
      x(n, await De.rebuild(), !0);
    } catch (y) {
      x(a, String(y), !0);
    }
  }
  function p(y) {
    y.key === "Escape" && x(s, !1);
  }
  var m = Ko();
  Rn("keydown", wn, p);
  var g = lt(m), h = f(g), _ = f(h), w = v(h, 2), d = v(g, 2);
  {
    var b = (y) => {
      var M = Yo(), N = lt(M), j = v(N, 2), $ = f(j), ne = v(f($), 4), ae = f(ne), q = v(ne, 2), D = v($, 2);
      {
        var Y = (X) => {
          var Q = Ho(), C = f(Q);
          U(() => T(C, r(a))), R(X, Q);
        };
        re(D, (X) => {
          r(a) && X(Y);
        });
      }
      var P = v(D, 2);
      Ye(P, 17, () => r(n)?.steps ?? [], xt, (X, Q) => {
        var C = Bo();
        let ee;
        var H = f(C), A = f(H), L = f(A);
        {
          var E = (ue) => {
            var ve = Un("✓");
            R(ue, ve);
          }, k = (ue) => {
            var ve = Un("✕");
            R(ue, ve);
          }, B = (ue) => {
            var ve = Un("·");
            R(ue, ve);
          }, G = (ue) => {
            var ve = Un(" ");
            R(ue, ve);
          };
          re(L, (ue) => {
            r(Q).state === "done" ? ue(E) : r(Q).state === "failed" ? ue(k, 1) : r(Q).state === "running" ? ue(B, 2) : ue(G, -1);
          });
        }
        var oe = v(A, 2), Z = f(oe), J = v(oe, 4), he = f(J), Se = v(H, 2);
        {
          var Ae = (ue) => {
            var ve = qo(), Ee = f(ve);
            U((xe) => T(Ee, xe), [() => r(Q).log.join(`
`)]), R(ue, ve);
          };
          re(Se, (ue) => {
            r(Q).log.length && ue(Ae);
          });
        }
        U(() => {
          ee = Me(C, 1, "step svelte-1xjbga", null, ee, {
            on: r(Q).state === "running",
            bad: r(Q).state === "failed"
          }), T(Z, r(Q).name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"), T(he, r(Q).seconds === null ? "" : r(Q).seconds + "s");
        }), R(X, C);
      });
      var z = v(P, 2);
      {
        var fe = (X) => {
          var Q = Uo(), C = lt(Q), ee = f(C);
          U(() => T(ee, r(n).error)), R(X, Q);
        }, I = (X) => {
          var Q = Wo();
          R(X, Q);
        }, W = (X) => {
          var Q = Go();
          R(X, Q);
        };
        re(z, (X) => {
          r(n)?.state === "failed" ? X(fe) : r(n)?.state === "done" ? X(I, 1) : r(l) && X(W, 2);
        });
      }
      var V = v(z, 2);
      {
        var de = (X) => {
          var Q = $o(), C = v(f(Q), 6), ee = f(C);
          U(() => T(ee, `python -m photolib.restore_state ${r(c) ?? ""}`)), R(X, Q);
        };
        re(V, (X) => {
          r(c) && X(de);
        });
      }
      U(() => T(ae, `${r(n)?.seconds ?? 0 ?? ""}s`)), te("click", N, () => x(s, !1)), te("click", q, () => x(s, !1)), R(y, M);
    };
    re(d, (y) => {
      r(s) && y(b);
    });
  }
  U(() => {
    h.disabled = r(l), T(_, r(l) ? "applying…" : "Apply to grid"), w.disabled = !r(n) || r(n).state === "idle";
  }), te("click", h, u), te("click", w, () => x(s, !0)), R(e, m), vt();
}
Ft(["click"]);
var Xo = /* @__PURE__ */ O('<div class="none svelte-bqi9ky"><strong> </strong> <span class="muted svelte-bqi9ky"> </span></div>'), Ks = /* @__PURE__ */ O("<option> </option>"), Jo = /* @__PURE__ */ O('<input class="value svelte-bqi9ky" aria-label="predicate value" spellcheck="false"/>'), Zo = /* @__PURE__ */ O('<div class="fields svelte-bqi9ky"><select aria-label="predicate column"></select> <select aria-label="predicate operator"></select> <!> <select aria-label="decision"><option>exclude</option><option>include</option></select> <select aria-label="position in the rule order" title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."><option>at end</option><option>at top</option></select> <button> </button> <button>Clear</button></div> <div class="echo muted svelte-bqi9ky"> </div>', 1), Qo = /* @__PURE__ */ O('<div class="none muted svelte-bqi9ky"> </div>'), ec = /* @__PURE__ */ O('<div class="bar svelte-bqi9ky"><!></div>');
function tc(e, t) {
  ht(t, !0);
  let n = se(t, "candidate", 3, null), s = se(t, "saving", 3, !1);
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
    const b = { ...n(), [w]: d };
    if (w === "column") {
      const y = i[d] ?? ["="];
      y.includes(b.op) || (b.op = y[0]), b.value = l.has(d) ? 0 : "";
    }
    w === "op" && d === "is null" && (b.value = null), w === "value" && l.has(b.column) && (b.value = Number(d) || 0), t.onedit(b);
  }
  var p = ec(), m = f(p);
  {
    var g = (w) => {
      var d = Xo(), b = f(d), y = f(b), M = v(b, 2), N = f(M);
      U(() => {
        T(y, `${t.screen.title ?? ""} does not save a rule.`), T(N, t.screen.blurb);
      }), R(w, d);
    }, h = (w) => {
      var d = Zo(), b = lt(d), y = f(b);
      Ye(y, 21, () => a, xt, (C, ee) => {
        var H = Ks(), A = f(H), L = {};
        U(() => {
          T(A, r(ee)), L !== (L = r(ee)) && (H.value = (H.__value = r(ee)) ?? "");
        }), R(C, H);
      });
      var M;
      xr(y);
      var N = v(y, 2);
      Ye(N, 21, () => r(c), xt, (C, ee) => {
        var H = Ks(), A = f(H), L = {};
        U(() => {
          T(A, r(ee)), L !== (L = r(ee)) && (H.value = (H.__value = r(ee)) ?? "");
        }), R(C, H);
      });
      var j;
      xr(N);
      var $ = v(N, 2);
      {
        var ne = (C) => {
          var ee = Jo();
          U(() => En(ee, n().value ?? "")), te("input", ee, (H) => u("value", H.currentTarget.value)), R(C, ee);
        };
        re($, (C) => {
          r(o) && C(ne);
        });
      }
      var ae = v($, 2), q = f(ae);
      q.value = q.__value = "exclude";
      var D = v(q);
      D.value = D.__value = "include";
      var Y;
      xr(ae);
      var P = v(ae, 2), z = f(P);
      z.value = z.__value = "end";
      var fe = v(z);
      fe.value = fe.__value = "0";
      var I;
      xr(P);
      var W = v(P, 2), V = f(W), de = v(W, 2), X = v(b, 2), Q = f(X);
      U(
        (C, ee) => {
          M !== (M = n().column) && (y.value = (y.__value = n().column) ?? "", cr(y, n().column)), j !== (j = n().op) && (N.value = (N.__value = n().op) ?? "", cr(N, n().op)), Y !== (Y = n().decision ?? "exclude") && (ae.value = (ae.__value = n().decision ?? "exclude") ?? "", cr(ae, n().decision ?? "exclude")), I !== (I = C) && (P.value = (P.__value = C) ?? "", cr(P, C)), W.disabled = s(), T(V, s() ? "saving…" : "Confirm"), T(Q, `${ee ?? ""} → ${n().decision ?? "exclude" ?? ""}`);
        },
        [
          () => String(n().at ?? "end"),
          () => Fl(n())
        ]
      ), te("change", y, (C) => u("column", C.currentTarget.value)), te("change", N, (C) => u("op", C.currentTarget.value)), te("change", ae, (C) => u("decision", C.currentTarget.value)), te("change", P, (C) => u("at", C.currentTarget.value)), te("click", W, function(...C) {
        t.onconfirm?.apply(this, C);
      }), te("click", de, function(...C) {
        t.onclear?.apply(this, C);
      }), R(w, d);
    }, _ = (w) => {
      var d = Qo(), b = f(d);
      U(() => T(b, `Pick a ${t.screen.tree ? "folder" : "row"} to build a rule${t.screen.table === !1 && !t.screen.tree ? ", or scroll — this is the remainder" : ""}.`)), R(w, d);
    };
    re(m, (w) => {
      t.screen.rule === !1 ? w(g) : n() ? w(h, 1) : w(_, -1);
    });
  }
  R(e, p), vt();
}
Ft(["change", "input", "click"]);
var nc = /* @__PURE__ */ O('<div class="muted empty svelte-aof9c2">No rules saved.</div>'), rc = /* @__PURE__ */ O('<div><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2"> </span> <span class="pred svelte-aof9c2"> </span> <span class="dec svelte-aof9c2"> </span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span> <span class="spacer svelte-aof9c2"></span> <button title="move up" class="svelte-aof9c2">↑</button> <button title="move down" class="svelte-aof9c2">↓</button> <button title="delete this rule" class="svelte-aof9c2">×</button></div></div>'), sc = /* @__PURE__ */ O('<div class="rule fallthrough svelte-aof9c2"><div class="row svelte-aof9c2"><span class="pos svelte-aof9c2">–</span> <span class="pred svelte-aof9c2">no rule matched</span> <span class="dec svelte-aof9c2">kept</span></div> <div class="row sub muted svelte-aof9c2"><span> </span> <span> </span></div></div>'), ac = /* @__PURE__ */ O('<div class="rules svelte-aof9c2"><div class="head svelte-aof9c2">rule set <span class="muted svelte-aof9c2"> </span></div> <!> <!> <!></div>');
function ic(e, t) {
  ht(t, !0);
  let n = se(t, "rules", 19, () => []), s = se(t, "unmatched", 3, null), a = se(t, "busy", 3, !1);
  var i = ac(), l = f(i), c = v(f(l)), o = f(c), u = v(l, 2);
  {
    var p = (_) => {
      var w = nc();
      R(_, w);
    };
    re(u, (_) => {
      n().length === 0 && _(p);
    });
  }
  var m = v(u, 2);
  Ye(m, 19, n, (_) => _.id, (_, w, d) => {
    var b = rc();
    let y;
    var M = f(b), N = f(M), j = f(N), $ = v(N, 2), ne = f($), ae = v($, 2), q = f(ae), D = v(M, 2), Y = f(D), P = f(Y), z = v(Y, 2), fe = f(z), I = v(z, 4), W = v(I, 2), V = v(W, 2);
    U(
      (de, X) => {
        y = Me(b, 1, "rule svelte-aof9c2", null, y, { exclude: r(w).decision === "exclude" }), T(j, r(d)), T(ne, r(w).predicate), T(q, r(w).decision), T(P, `${de ?? ""} paths`), T(fe, X), I.disabled = a() || r(d) === 0, W.disabled = a() || r(d) === n().length - 1, V.disabled = a();
      },
      [
        () => Pe(r(w).paths),
        () => Pt(r(w).bytes)
      ]
    ), te("click", I, () => t.onmove(r(w), r(d) - 1)), te("click", W, () => t.onmove(r(w), r(d) + 1)), te("click", V, () => t.ondelete(r(w))), R(_, b);
  });
  var g = v(m, 2);
  {
    var h = (_) => {
      var w = sc(), d = v(f(w), 2), b = f(d), y = f(b), M = v(b, 2), N = f(M);
      U(
        (j, $) => {
          T(y, `${j ?? ""} paths`), T(N, $);
        },
        [
          () => Pe(s().paths),
          () => Pt(s().bytes)
        ]
      ), R(_, w);
    };
    re(g, (_) => {
      s() && _(h);
    });
  }
  U(() => T(o, `${n().length ?? ""} rules · top-down, first match wins`)), R(e, i), vt();
}
Ft(["click"]);
function lc(e) {
  return { key: e.id, ids: (e.m ?? [e]).map((t) => t.id) };
}
function oc(e, t) {
  const n = e.filter((s) => s.key !== t.key);
  return n.length === e.length ? [...e, t] : n;
}
function cc(e) {
  return {
    stacks: e.length,
    photos: e.reduce((t, n) => t + n.ids.length, 0)
  };
}
function uc(e) {
  const t = e.stacking.on ? e.stacking.window + "s" : "off", n = Object.entries(e.filters).filter(([, s]) => s.length > 0).sort(([s], [a]) => s < a ? -1 : s > a ? 1 : 0).map(([s, a]) => s + ":" + a.join("|"));
  return `stack=${t} sort=${e.sort} filters=${n.length ? n.join(",") : "none"}`;
}
function dc(e, t) {
  const n = t.map((s) => "[" + s.ids.join(",") + "]").join(",");
  return uc(e) + `
` + n;
}
const Vs = 2500, fc = 1, hc = 2, vc = 3e7, Sn = /* @__PURE__ */ new WeakMap();
function Xs(e) {
  return Sn.get(e).photo.getBoundingClientRect();
}
function pc(e, t, n) {
  const s = [], a = [], i = /* @__PURE__ */ new Map(), l = [], c = [];
  let o = 0, u = gn, p = null, m = null, g = null, h = !1, _ = !1, w = 0, d = 0, b = 0, y = n.onState || (() => {
  });
  function M(E) {
    w <= 0 || (o = Ao(s, o, w, E, (k, B, G) => {
      a.push({ top: u, height: G, from: k, to: B }), u += G + $s;
    }), j());
  }
  function N() {
    if (m === null || h || w <= 0 || o >= m) return 0;
    const E = a.length ? o / a.length : Math.max(1, w / Ir), k = a.length ? (u - gn) / a.length : Ir + $s, B = Math.round((m - o) / E * k);
    return Math.max(0, Math.min(B, vc - u));
  }
  function j() {
    e.style.height = u + N() + "px", t.style.top = Math.max(0, u - 1) + "px";
  }
  function $() {
    return window.scrollY - e.offsetTop;
  }
  function ne() {
    const E = l.pop();
    if (E) return E;
    const k = document.createElement("div");
    k.className = "tile", k.tabIndex = -1;
    const B = document.createElement("div");
    B.className = "deck", B.style.height = gn + "px";
    const G = [];
    for (let J = 0; J < Ga; J++) {
      const he = document.createElement("div");
      he.className = "card", he.hidden = !0, G.push(he);
    }
    for (let J = G.length - 1; J >= 0; J--) B.appendChild(G[J]);
    k.appendChild(B);
    const oe = document.createElement("div");
    oe.className = "tile-photo";
    const Z = document.createElement("img");
    return Z.decoding = "async", Z.addEventListener("load", () => k.classList.add("loaded")), Z.addEventListener("error", () => k.classList.add("missing")), oe.appendChild(Z), k.appendChild(oe), Sn.set(k, { img: Z, photo: oe, strip: B, cards: G, above: 0 }), n.extend && n.extend(k), k;
  }
  function ae(E, k) {
    const { img: B, photo: G } = Sn.get(k);
    B.removeAttribute("src"), k.classList.remove("loaded", "missing", "error"), G.style.backgroundImage = "", k.remove(), i.delete(E), l.push(k);
  }
  function q(E, k, B) {
    const G = Sn.get(E), oe = Po(k.n, B);
    G.above = oe.length ? gn : 0, G.strip.hidden = oe.length === 0;
    for (let Z = 0; Z < G.cards.length; Z++) {
      const J = oe[Z];
      G.cards[Z].hidden = J === void 0, J !== void 0 && (G.cards[Z].style.top = J.top + "px", G.cards[Z].style.left = J.inset + "px", G.cards[Z].style.right = J.inset + "px", G.cards[Z].style.opacity = String(J.opacity));
    }
  }
  function D(E, k, B, G, oe, Z) {
    let J = i.get(E);
    const he = s[E];
    if (!J) {
      J = ne(), J.dataset.index = String(E);
      const ue = Sn.get(J).img;
      q(J, he, G), ue.fetchPriority = Z ? "high" : "low", ue.src = "/t/" + he.s + ".webp", c.push(E), n.fill && n.fill(J, he), e.appendChild(J), i.set(E, J);
    }
    const { above: Se, photo: Ae } = Sn.get(J);
    J.style.width = G + "px", J.style.height = oe + Se + "px", J.style.transform = "translate(" + k + "px," + (B - Se) + "px)", Ae.style.height = oe + "px";
  }
  function Y(E, k) {
    k.th && (k.url === void 0 && (k.url = n.thumbHash(k.th)), k.url && (Sn.get(E).photo.style.backgroundImage = "url(" + k.url + ")"));
  }
  function P() {
    b = 0;
    for (const E of c) {
      const k = i.get(E);
      k && !k.classList.contains("loaded") && Y(k, s[E]);
    }
    c.length = 0;
  }
  function z(E, k) {
    for (const B of Ro(E, s, w))
      D(B.index, B.x, E.top, B.w, E.height, k);
  }
  function fe() {
    const E = window.innerHeight, k = $(), B = Ys(a, k - E * fc, k + E * (1 + hc));
    if (!B) return;
    const G = a[B[0]].from, oe = a[B[1]].to;
    for (const [Z, J] of Array.from(i))
      (Z < G || Z >= oe) && ae(Z, J);
    for (let Z = B[0]; Z <= B[1]; Z++) {
      const J = a[Z];
      z(J, J.top < k + E && J.top + J.height > k);
    }
    c.length && !b && (b = requestAnimationFrame(P));
  }
  function I() {
    return w <= 0 ? !1 : u - ($() + window.innerHeight) < Vs;
  }
  let W = Promise.resolve();
  function V() {
    return _ || h || (_ = !0, W = de()), W;
  }
  async function de() {
    const E = d;
    y({ loading: !0, count: s.length, exhausted: h, total: m, tiles: g });
    try {
      do {
        const k = await n.fetchPage(p);
        if (E !== d) return;
        for (const B of k.photos) s.push(B);
        p = k.next, h = p === null, typeof k.stacks == "number" ? (m = k.stacks, g = typeof k.total == "number" ? k.total : null) : typeof k.total == "number" && (m = k.total), M(h), fe(), y({ loading: !0, count: s.length, exhausted: h, total: m, tiles: g });
      } while (!h && I());
    } catch (k) {
      E === d && y({ error: String(k) });
    } finally {
      E === d && (_ = !1, y({ loading: !1, count: s.length, exhausted: h, total: m, tiles: g }));
    }
  }
  let X = 0;
  function Q() {
    X || (X = requestAnimationFrame(() => {
      X = 0, fe(), I() && V();
    }));
  }
  function C() {
    const E = e.clientWidth;
    if (E === w) return;
    const k = Ys(a, $(), $()), B = k ? a[k[0]].from : 0;
    w = E;
    for (const [oe, Z] of Array.from(i)) ae(oe, Z);
    a.length = 0, o = 0, u = gn, M(h), fe();
    const G = a.find((oe) => oe.to > B);
    G && window.scrollTo(0, G.top + e.offsetTop), I() && V();
  }
  function ee(E) {
    const k = E.target.closest(".tile");
    if (!k || !e.contains(k)) return;
    const B = Number(k.dataset.index), G = s[B];
    G && n.activate && n.activate(G, E, k, B);
  }
  e.addEventListener("click", ee), window.addEventListener("scroll", Q, { passive: !0 });
  let H = 0;
  const A = new ResizeObserver(() => {
    clearTimeout(H), H = setTimeout(C, 100);
  });
  A.observe(e);
  const L = new IntersectionObserver(
    (E) => {
      E.some((k) => k.isIntersecting) && V();
    },
    { rootMargin: "0px 0px " + Vs + "px 0px" }
  );
  return L.observe(t), w = e.clientWidth, V(), {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      d++, _ = !1;
      for (const [E, k] of Array.from(i)) ae(E, k);
      s.length = 0, a.length = 0, c.length = 0, o = 0, u = gn, p = null, m = null, g = null, h = !1, e.style.height = "0px", window.scrollTo(0, 0), V();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(E) {
      const k = typeof E == "number" ? E : null;
      k !== m && (m = k, j(), y({ total: m }));
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (n.fill)
        for (const [E, k] of i) n.fill(k, s[E]);
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
    async walkTo(E) {
      for (; E >= o && !h; ) {
        const oe = o;
        if (await V(), o === oe) break;
      }
      const k = a.find((oe) => oe.to > E);
      if (!k) return null;
      const B = Math.max(0, (window.innerHeight - k.height) / 2);
      window.scrollTo(0, Math.max(0, e.offsetTop + k.top - B)), fe();
      const G = i.get(E);
      return G ? { item: s[E], tile: G } : null;
    },
    // Put the keyboard back on a tile. The overlay hands focus back on the way
    // out, and after a walk that is a different tile from the one it opened on.
    focus(E) {
      i.get(E)?.focus();
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(E) {
      for (const [k, B] of i)
        s[k] === E && n.fill && n.fill(B, E);
    },
    destroy() {
      d++, e.removeEventListener("click", ee), window.removeEventListener("scroll", Q), A.disconnect(), L.disconnect(), clearTimeout(H), cancelAnimationFrame(b);
    }
  };
}
function gc(e) {
  try {
    const t = Uint8Array.from(atob(e), (P) => P.charCodeAt(0)), n = t[0] | t[1] << 8 | t[2] << 16, s = t[3] | t[4] << 8, a = (n & 63) / 63, i = (n >> 6 & 63) / 31.5 - 1, l = (n >> 12 & 63) / 31.5 - 1, c = (n >> 18 & 31) / 31, o = n >> 23, u = (s >> 3 & 63) / 63, p = (s >> 9 & 63) / 63, m = s >> 15, g = Math.max(3, m ? o ? 5 : 7 : s & 7), h = Math.max(3, m ? s & 7 : o ? 5 : 7);
    let _ = o ? 6 : 5, w = 0;
    const d = (P, z, fe) => {
      const I = [];
      for (let W = 0; W < z; W++)
        for (let V = W ? 0 : 1; V * z < P * (z - W); V++) {
          const de = t[_ + (w >> 1)] >> ((w++ & 1) << 2) & 15;
          I.push((de / 7.5 - 1) * fe);
        }
      return I;
    }, b = d(g, h, c), y = d(3, 3, u * 1.25), M = d(3, 3, p * 1.25), N = g / h, j = Math.max(1, Math.round(N > 1 ? 32 : 32 * N)), $ = Math.max(1, Math.round(N > 1 ? 32 / N : 32)), ne = document.createElement("canvas");
    ne.width = j, ne.height = $;
    const ae = ne.getContext("2d"), q = ae.createImageData(j, $), D = [], Y = [];
    for (let P = 0, z = 0; P < $; P++)
      for (let fe = 0; fe < j; fe++, z += 4) {
        let I = a, W = i, V = l;
        for (let C = 0; C < g; C++) D[C] = Math.cos(Math.PI / j * (fe + 0.5) * C);
        for (let C = 0; C < h; C++) Y[C] = Math.cos(Math.PI / $ * (P + 0.5) * C);
        for (let C = 0, ee = 0; C < h; C++)
          for (let H = C ? 0 : 1; H * h < g * (h - C); H++, ee++)
            I += b[ee] * D[H] * Y[C] * 2;
        for (let C = 0, ee = 0; C < 3; C++)
          for (let H = C ? 0 : 1; H < 3 - C; H++, ee++) {
            const A = D[H] * Y[C] * 2;
            W += y[ee] * A, V += M[ee] * A;
          }
        const de = I - 2 / 3 * W, X = (3 * I - de + V) / 2, Q = X - V;
        q.data[z] = Math.max(0, Math.min(255, Math.round(255 * X))), q.data[z + 1] = Math.max(0, Math.min(255, Math.round(255 * Q))), q.data[z + 2] = Math.max(0, Math.min(255, Math.round(255 * de))), q.data[z + 3] = 255;
      }
    return ae.putImageData(q, 0, 0), ne.toDataURL();
  } catch {
    return null;
  }
}
var _c = /* @__PURE__ */ O('<main id="canvas"><div id="sentinel"></div></main>');
function bc(e, t) {
  ht(t, !0);
  let n = se(t, "key", 3, ""), s = se(t, "total", 3, null), a = se(t, "triage", 3, !1), i = se(t, "excludedDirs", 19, () => []), l = se(t, "selecting", 3, !1), c = se(t, "markedKeys", 19, () => []), o = se(t, "onActivate", 3, () => {
  }), u = se(t, "onOverride", 3, async () => null), p = se(t, "onExcludeFolder", 3, () => {
  }), m = se(t, "onState", 3, () => {
  }), g = /* @__PURE__ */ K(null), h = /* @__PURE__ */ K(null), _ = null, w = "";
  const d = /* @__PURE__ */ ie(() => new Set(c())), b = { null: "exclude", exclude: "include", include: "clear" };
  function y(I) {
    const W = I.toLowerCase().startsWith(Jn.toLowerCase()) ? I.slice(Jn.length + 1) : I;
    return W.length > 64 ? "…" + W.slice(-64) : W;
  }
  function M(I) {
    const W = document.createElement("div");
    W.className = "tile-path", I.appendChild(W);
    const V = document.createElement("button");
    V.className = "chip", V.type = "button", I.appendChild(V);
    const de = document.createElement("button");
    de.className = "dirchip", de.type = "button", de.textContent = "dir", I.appendChild(de);
  }
  function N(I, W) {
    const V = I.querySelector(".tile-path");
    V && (V.textContent = W.p ? y(W.p) : "");
    const de = I.querySelector(".dirchip");
    if (de) {
      const Q = Fa(W.p ?? ""), C = Q !== "" && Ss(i(), Q);
      de.hidden = Q === "", de.disabled = C, de.dataset.state = C ? "exclude" : "none", de.title = C ? `already excluded: ${Q}` : `exclude everything under ${Q}, subfolders included — one exclude rule at the end of the order`;
    }
    const X = I.querySelector(".chip");
    X && (X.dataset.state = W.o || "none", X.textContent = W.o === "exclude" ? "drop" : W.o === "include" ? "keep" : "·", X.title = W.o === "exclude" ? "overridden: excluded — click to keep" : W.o === "include" ? "overridden: kept — click to clear" : "no override; the rules decide this one — click to drop");
  }
  function j(I) {
    const W = document.createElement("span");
    W.className = "tick", I.appendChild(W);
  }
  function $(I, W) {
    I.dataset.marked = r(d).has(W.id) ? "on" : "off";
  }
  tr(() => (_ = pc(r(g), r(h), {
    fetchPage: (I) => t.fetchPage(I),
    thumbHash: gc,
    extend: a() ? M : j,
    fill: a() ? N : $,
    onState: (I) => m()(I),
    activate: async (I, W, V, de) => {
      if (W.target.closest(".dirchip")) {
        p()(I);
        return;
      }
      if (!W.target.closest(".chip")) {
        o()(I, V, de);
        return;
      }
      const X = b[I.o ?? "null"];
      I.o = await u()(I, X), N(V, I);
    }
  }), w = n(), () => _?.destroy())), qt(() => {
    const I = n(), W = s();
    _ && (I !== w && (w = I, _.reset()), _.setTotal(W));
  });
  function ne(I) {
    return _?.walkTo(I);
  }
  function ae(I) {
    _?.focus(I);
  }
  let q = "";
  qt(() => {
    const I = i().join(`
`);
    !_ || I === q || (q = I, _.refill());
  });
  let D = "";
  qt(() => {
    const I = c().join(",");
    !_ || I === D || (D = I, _.refill());
  });
  var Y = { walkTo: ne, focusTile: ae }, P = _c();
  let z;
  var fe = f(P);
  return pr(fe, (I) => x(h, I), () => r(h)), pr(P, (I) => x(g, I), () => r(g)), U(() => z = Me(P, 1, "", null, z, { selecting: l() })), R(e, P), vt(Y);
}
var mc = /* @__PURE__ */ O('<th class="box svelte-1v3p82v"><span class="hide svelte-1v3p82v">select</span></th>'), wc = /* @__PURE__ */ O('<th class="num svelte-1v3p82v"> </th>'), yc = /* @__PURE__ */ O('<td class="box svelte-1v3p82v"><button type="button" role="checkbox" title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."> </button></td>'), xc = /* @__PURE__ */ O('<span class="scope svelte-1v3p82v" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>'), kc = /* @__PURE__ */ O('<td class="num svelte-1v3p82v"> </td>'), Sc = /* @__PURE__ */ O('<tr><!><td class="key svelte-1v3p82v"><span> </span> <!></td><td class="num svelte-1v3p82v"> </td><td class="num svelte-1v3p82v"> </td><!></tr>'), Ec = /* @__PURE__ */ O('<table class="agg svelte-1v3p82v"><thead><tr><!><th class="svelte-1v3p82v"> </th><th class="num svelte-1v3p82v">paths</th><th class="num svelte-1v3p82v">bytes</th><!></tr></thead><tbody></tbody></table>');
function Tc(e, t) {
  ht(t, !0);
  let n = se(t, "rows", 19, () => []), s = se(t, "rules", 19, () => []), a = se(t, "root", 3, null), i = se(t, "selected", 3, null), l = se(t, "checked", 19, () => /* @__PURE__ */ new Set());
  const c = /* @__PURE__ */ ie(() => t.screen.rule !== !1);
  function o(w) {
    return t.screen.label ? t.screen.label(w) : w.key;
  }
  const u = /* @__PURE__ */ ie(() => new Map(n().map((w) => [
    w.key,
    t.screen.rule === !1 ? null : La(s(), t.screen.toRule(w, a()))
  ]))), p = { exclude: "✕", include: "✓" }, m = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item"
  };
  var g = ys(), h = lt(g);
  {
    var _ = (w) => {
      var d = Ec(), b = f(d), y = f(b), M = f(y);
      {
        var N = (D) => {
          var Y = mc();
          R(D, Y);
        };
        re(M, (D) => {
          r(c) && D(N);
        });
      }
      var j = v(M), $ = f(j), ne = v(j, 3);
      {
        var ae = (D) => {
          var Y = wc(), P = f(Y);
          U(() => T(P, t.screen.heading[1])), R(D, Y);
        };
        re(ne, (D) => {
          t.screen.heading[1] && D(ae);
        });
      }
      var q = v(b);
      Ye(q, 23, n, (D) => D.key, (D, Y, P) => {
        const z = /* @__PURE__ */ ie(() => r(u).get(r(Y).key));
        var fe = Sc();
        let I;
        var W = f(fe);
        {
          var V = (Z) => {
            const J = /* @__PURE__ */ ie(() => l().has(r(Y).key));
            var he = yc(), Se = f(he);
            let Ae;
            var ue = f(Se);
            U(
              (ve) => {
                Ae = Me(Se, 1, "tick svelte-1v3p82v", null, Ae, { on: r(J) }), pe(Se, "aria-checked", r(J)), pe(Se, "aria-label", `select ${ve ?? ""}`), T(ue, r(J) ? "✓" : "");
              },
              [() => o(r(Y))]
            ), te("click", Se, (ve) => {
              ve.stopPropagation(), t.oncheck(r(Y), r(P), ve.shiftKey);
            }), R(Z, he);
          };
          re(W, (Z) => {
            r(c) && Z(V);
          });
        }
        var de = v(W), X = f(de);
        let Q;
        var C = f(X), ee = v(X), H = v(ee);
        {
          var A = (Z) => {
            var J = xc();
            R(Z, J);
          };
          re(H, (Z) => {
            r(Y).scope === "whole inventory" && Z(A);
          });
        }
        var L = v(de), E = f(L), k = v(L), B = f(k), G = v(k);
        {
          var oe = (Z) => {
            var J = kc(), he = f(J);
            U(() => T(he, r(Y).detail ?? "")), R(Z, J);
          };
          re(G, (Z) => {
            t.screen.heading[1] && Z(oe);
          });
        }
        U(
          (Z, J, he) => {
            I = Me(fe, 1, "svelte-1v3p82v", null, I, {
              picked: i() === r(Y).key,
              clickable: t.screen.sheet !== !1
            }), Q = Me(X, 1, "mark svelte-1v3p82v", null, Q, {
              exclude: r(z) === "exclude",
              include: r(z) === "include"
            }), pe(X, "title", m[r(z)] ?? ""), T(C, p[r(z)] ?? ""), T(ee, `${Z ?? ""} `), T(E, J), T(B, he);
          },
          [
            () => o(r(Y)),
            () => Pe(r(Y).paths),
            () => Pt(r(Y).bytes)
          ]
        ), te("click", fe, () => t.onpick(r(Y))), R(D, fe);
      }), U(() => T($, t.screen.heading[0] ?? "")), R(w, d);
    };
    re(h, (w) => {
      n().length && w(_);
    });
  }
  R(e, g), vt();
}
Ft(["click"]);
var Mc = /* @__PURE__ */ O('<button class="twisty svelte-pucy57"> </button>'), Ac = /* @__PURE__ */ O('<span class="twisty leaf svelte-pucy57">·</span>'), Rc = /* @__PURE__ */ O('<span class="name root svelte-pucy57"> </span>'), Pc = /* @__PURE__ */ O('<button class="name svelte-pucy57"> </button>'), Cc = /* @__PURE__ */ O('<div class="note err svelte-pucy57">could not load — click the arrow to retry</div>'), Oc = /* @__PURE__ */ O('<div class="note svelte-pucy57"> </div>'), Nc = /* @__PURE__ */ O('<div class="note err svelte-pucy57">showing the largest 200 subfolders — there are more</div>'), Ic = /* @__PURE__ */ O('<div><span class="indent svelte-pucy57"></span> <!> <!> <span class="num svelte-pucy57"> </span> <span class="num size svelte-pucy57"> </span> <button class="drop svelte-pucy57">✕</button></div> <!> <!>', 1), zc = /* @__PURE__ */ O('<div class="tree svelte-pucy57"></div>');
function Fc(e, t) {
  ht(t, !0);
  let n = se(t, "version", 3, 0), s = se(t, "excludedDirs", 19, () => []), a = se(t, "selected", 3, null), i = se(t, "busy", 3, !1), l = /* @__PURE__ */ K(Ce(/* @__PURE__ */ new Map())), c = /* @__PURE__ */ K(Ce(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ K(Ce(/* @__PURE__ */ new Set())), u = /* @__PURE__ */ K(Ce(/* @__PURE__ */ new Set()));
  async function p(d) {
    x(o, new Set(r(o)).add(d), !0);
    const b = await t.onload(d), y = new Map(r(l)), M = new Set(r(u));
    b ? (y.set(d, b), M.delete(d)) : M.add(d), x(l, y, !0), x(u, M, !0), x(o, new Set([...r(o)].filter((N) => N !== d)), !0);
  }
  function m(d) {
    if (r(c).has(d)) {
      x(c, new Set([...r(c)].filter((b) => b !== d)), !0);
      return;
    }
    x(c, new Set(r(c)).add(d), !0), r(l).has(d) || p(d);
  }
  let g = -1;
  qt(() => {
    const d = n();
    if (d !== g) {
      g = d, r(c).has(t.root) || x(c, new Set(r(c)).add(t.root), !0);
      for (const b of r(c)) p(b);
    }
  });
  const h = /* @__PURE__ */ ie(() => {
    const d = [], b = (j, $, ne, ae, q, D) => {
      const Y = r(l).get(j), P = r(c).has(j);
      if (d.push({
        key: j,
        name: $,
        depth: ne,
        paths: ae,
        bytes: q,
        deeper: D,
        expanded: P,
        here: Y?.here ?? null,
        truncated: !!Y?.truncated,
        loading: r(o).has(j),
        failed: r(u).has(j),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: Ss(s(), j)
      }), !(!P || !Y))
        for (const z of Y.children)
          b(z.path, z.name, ne + 1, z.paths, z.bytes, z.deeper);
    }, y = r(l).get(t.root), M = y ? y.children.reduce((j, $) => j + $.paths, 0) + y.here.paths : 0, N = y ? y.children.reduce((j, $) => j + $.bytes, 0) + y.here.bytes : 0;
    return b(t.root, t.root, 0, M, N, !0), d;
  }), _ = 8;
  var w = zc();
  Ye(w, 21, () => r(h), (d) => d.key, (d, b) => {
    var y = Ic(), M = lt(y);
    let N;
    var j = f(M);
    let $;
    var ne = v(j, 2);
    {
      var ae = (H) => {
        var A = Mc(), L = f(A);
        U(() => {
          pe(A, "aria-expanded", r(b).expanded), pe(A, "aria-label", `${r(b).expanded ? "collapse" : "expand"} ${r(b).name ?? ""}`), pe(A, "title", r(b).expanded ? "collapse" : "expand"), T(L, r(b).loading ? "·" : r(b).expanded ? "▾" : "▸");
        }), te("click", A, () => m(r(b).key)), R(H, A);
      }, q = (H) => {
        var A = Ac();
        R(H, A);
      };
      re(ne, (H) => {
        r(b).deeper ? H(ae) : H(q, -1);
      });
    }
    var D = v(ne, 2);
    {
      var Y = (H) => {
        var A = Rc(), L = f(A);
        U(() => T(L, r(b).key)), R(H, A);
      }, P = (H) => {
        var A = Pc(), L = f(A);
        U(() => {
          pe(A, "title", `Show every kept file under ${r(b).key ?? ""}`), T(L, r(b).name);
        }), te("click", A, () => t.onpick(r(b))), R(H, A);
      };
      re(D, (H) => {
        r(b).depth === 0 ? H(Y) : H(P, -1);
      });
    }
    var z = v(D, 2), fe = f(z), I = v(z, 2), W = f(I), V = v(I, 2), de = v(M, 2);
    {
      var X = (H) => {
        var A = Cc();
        let L;
        U((E) => L = Zt(A, "", L, E), [
          () => ({
            "padding-left": `${Math.min(r(b).depth, _) * 11 + 18}px`
          })
        ]), R(H, A);
      }, Q = (H) => {
        var A = Oc();
        let L;
        var E = f(A);
        U(
          (k, B, G) => {
            L = Zt(A, "", L, k), T(E, `${B ?? ""} directly here · ${G ?? ""}`);
          },
          [
            () => ({
              "padding-left": `${Math.min(r(b).depth, _) * 11 + 18}px`
            }),
            () => Pe(r(b).here.paths),
            () => Pt(r(b).here.bytes)
          ]
        ), R(H, A);
      };
      re(de, (H) => {
        r(b).expanded && r(b).failed ? H(X) : r(b).expanded && r(b).here && r(b).here.paths > 0 && H(Q, 1);
      });
    }
    var C = v(de, 2);
    {
      var ee = (H) => {
        var A = Nc();
        let L;
        U((E) => L = Zt(A, "", L, E), [
          () => ({
            "padding-left": `${Math.min(r(b).depth, _) * 11 + 18}px`
          })
        ]), R(H, A);
      };
      re(C, (H) => {
        r(b).truncated && H(ee);
      });
    }
    U(
      (H, A, L) => {
        N = Me(M, 1, "row svelte-pucy57", null, N, {
          picked: a() === r(b).key,
          gone: r(b).excluded
        }), $ = Zt(j, "", $, H), T(fe, A), T(W, L), V.disabled = i() || r(b).excluded || r(b).depth === 0, pe(V, "title", r(b).depth === 0 ? "The library root is not excludable from here." : r(b).excluded ? "already excluded" : `Exclude everything under ${r(b).key}, subfolders included — one exclude rule at the end of the order`);
      },
      [
        () => ({ width: `${Math.min(r(b).depth, _) * 11}px` }),
        () => Pe(r(b).paths),
        () => Pt(r(b).bytes)
      ]
    ), te("click", V, () => t.onexclude(r(b))), R(d, y);
  }), R(e, w), vt();
}
Ft(["click"]);
var Lc = /* @__PURE__ */ O('<button title="Back to its default">↺</button>'), Dc = /* @__PURE__ */ O('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number"/> <!></div>'), jc = /* @__PURE__ */ O('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> </h2> <p class="note svelte-1hh0fwb"> </p> <!></section>'), Hc = /* @__PURE__ */ O('<div><span class="name svelte-1hh0fwb"> </span> <input type="range" min="0" class="svelte-1hh0fwb"/> <input class="num svelte-1hh0fwb" type="number" min="0"/> <!></div>'), qc = /* @__PURE__ */ O('<section class="svelte-1hh0fwb"><h2 class="svelte-1hh0fwb"> <span class="which svelte-1hh0fwb"> </span></h2> <p class="note svelte-1hh0fwb"> </p> <!> <div class="swatch svelte-1hh0fwb"> </div></section>'), Bc = /* @__PURE__ */ O('<li><code class="svelte-1hh0fwb"> </code> </li>'), Uc = /* @__PURE__ */ O(`<div class="body svelte-1hh0fwb"><p class="note lead svelte-1hh0fwb">A name goes amber when its value is no longer its default, and ↺ beside it puts that one
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
          back to.</p> <div class="buttons svelte-1hh0fwb"><button class="ghost svelte-1hh0fwb">Shipped</button> <button class="ghost svelte-1hh0fwb">Studio defaults</button> <button class="ghost svelte-1hh0fwb"> </button></div> <textarea readonly="" rows="16" class="svelte-1hh0fwb"></textarea></section></div>`), Wc = /* @__PURE__ */ O('<div><div class="head svelte-1hh0fwb"><strong>Glass</strong> <span class="src svelte-1hh0fwb">liquid-glass-studio</span> <button class="fold svelte-1hh0fwb"> </button></div> <!></div>');
function Gc(e, t) {
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
  let c = /* @__PURE__ */ K(Ce(Yl())), o = /* @__PURE__ */ K(!0), u = /* @__PURE__ */ K(!1), p = /* @__PURE__ */ K(Ce(Ua())), m = /* @__PURE__ */ K(Ce(window.innerWidth));
  const g = (P) => r(p) === "light" ? P.light : P.dark, h = (P) => P in Tn ? Tn : bn, _ = (P) => `rgba(${P.r}, ${P.g}, ${P.b}, ${P.a})`, w = /* @__PURE__ */ ie(() => JSON.stringify(r(c), null, 2));
  tr(() => {
    const P = localStorage.getItem(n);
    if (P)
      try {
        x(c, Kr(JSON.parse(P)), !0);
        return;
      } catch {
      }
    Es();
  });
  function d(P) {
    x(c, Kr({ ...r(c), ...P }), !0), localStorage.setItem(n, JSON.stringify(r(c))), x(u, !1);
  }
  function b(P) {
    x(c, Kr(P), !0), localStorage.setItem(n, JSON.stringify(r(c))), x(u, !1);
  }
  function y(P) {
    d({ [P]: h(P)[P] });
  }
  function M() {
    x(p, Wa(r(p) === "dark" ? "light" : "dark"), !0);
  }
  async function N() {
    await navigator.clipboard.writeText(r(w)), x(u, !0);
  }
  var j = Wc();
  let $;
  var ne = f(j), ae = v(f(ne), 4), q = f(ae), D = v(ne, 2);
  {
    var Y = (P) => {
      var z = Uc();
      {
        const Se = (ue, ve = kr, Ee = kr, xe = kr) => {
          var We = Lc();
          let Ze;
          U(() => {
            Ze = Me(We, 1, "undo svelte-1hh0fwb", null, Ze, { idle: !Ee() }), pe(We, "aria-label", `Reset ${ve() ?? ""}`);
          }), te("click", We, function(...Ge) {
            xe()?.apply(this, Ge);
          }), R(ue, We);
        };
        var fe = v(f(z), 2);
        Ye(fe, 17, () => s, xt, (ue, ve) => {
          var Ee = jc(), xe = f(Ee), We = f(xe), Ze = v(xe, 2), Ge = f(Ze), Tt = v(Ze, 2);
          Ye(Tt, 17, () => r(ve).rows, xt, (Wt, xn) => {
            var Qe = /* @__PURE__ */ ie(() => Ur(r(xn), 5));
            let Ke = () => r(Qe)[0], Mt = () => r(Qe)[1], Gt = () => r(Qe)[2], st = () => r(Qe)[3], sn = () => r(Qe)[4];
            const pt = /* @__PURE__ */ ie(() => r(c)[Ke()] !== h(Ke())[Ke()]), gt = /* @__PURE__ */ ie(() => typeof st() == "function" ? st()(r(m)) : st());
            var At = Dc();
            let $e;
            var Rt = f(At), Lt = f(Rt), et = v(Rt, 2), F = v(et, 2), ce = v(F, 2);
            Se(ce, Mt, () => r(pt), () => () => y(Ke())), U(() => {
              $e = Me(At, 1, "row svelte-1hh0fwb", null, $e, { moved: r(pt) }), T(Lt, Mt()), pe(et, "min", Gt()), pe(et, "max", r(gt)), pe(et, "step", sn()), pe(et, "aria-label", Mt()), En(et, r(c)[Ke()]), pe(F, "min", Gt()), pe(F, "max", r(gt)), pe(F, "step", sn()), pe(F, "aria-label", `${Mt() ?? ""} value`), En(F, r(c)[Ke()]);
            }), te("input", et, (ge) => d({ [Ke()]: Number(ge.currentTarget.value) })), te("input", F, (ge) => d({ [Ke()]: Number(ge.currentTarget.value) })), R(Wt, At);
          }), U(() => {
            T(We, r(ve).title), T(Ge, r(ve).note);
          }), R(ue, Ee);
        });
        var I = v(fe, 2), W = f(I), V = v(I, 2), de = f(V), X = v(V, 2);
        Ye(X, 17, () => $l, xt, (ue, ve) => {
          const Ee = /* @__PURE__ */ ie(() => g(r(ve))), xe = /* @__PURE__ */ ie(() => r(c)[r(Ee)]), We = /* @__PURE__ */ ie(() => r(ve).base[r(Ee)]);
          var Ze = qc(), Ge = f(Ze), Tt = f(Ge), Wt = v(Tt), xn = f(Wt), Qe = v(Ge, 2), Ke = f(Qe), Mt = v(Qe, 2);
          Ye(Mt, 17, () => i, xt, (pt, gt) => {
            var At = /* @__PURE__ */ ie(() => Ur(r(gt), 3));
            let $e = () => r(At)[0], Rt = () => r(At)[1], Lt = () => r(At)[2];
            const et = /* @__PURE__ */ ie(() => r(xe)[$e()] !== r(We)[$e()]);
            var F = Hc();
            let ce;
            var ge = f(F), ze = f(ge), ke = v(ge, 2), we = v(ke, 2), Fe = v(we, 2);
            Se(Fe, Rt, () => r(et), () => () => d({
              [r(Ee)]: { ...r(xe), [$e()]: r(We)[$e()] }
            })), U(() => {
              ce = Me(F, 1, "row svelte-1hh0fwb", null, ce, { moved: r(et) }), T(ze, Rt()), pe(ke, "max", Lt()), pe(ke, "step", Lt() === 1 ? 0.01 : 1), pe(ke, "aria-label", `${r(p) ?? ""} ${a[r(ve).dark].title ?? ""} ${Rt() ?? ""}`), En(ke, r(xe)[$e()]), pe(we, "max", Lt()), pe(we, "step", Lt() === 1 ? 0.01 : 1), pe(we, "aria-label", `${r(p) ?? ""} ${a[r(ve).dark].title ?? ""} ${Rt() ?? ""} value`), En(we, r(xe)[$e()]);
            }), te("input", ke, (tt) => d({
              [r(Ee)]: {
                ...r(xe),
                [$e()]: Number(tt.currentTarget.value)
              }
            })), te("input", we, (tt) => d({
              [r(Ee)]: {
                ...r(xe),
                [$e()]: Number(tt.currentTarget.value)
              }
            })), R(pt, F);
          });
          var Gt = v(Mt, 2);
          let st;
          var sn = f(Gt);
          U(
            (pt, gt) => {
              T(Tt, `${a[r(ve).dark].title ?? ""} `), T(xn, r(p)), T(Ke, a[r(ve).dark].note), st = Zt(Gt, "", st, pt), T(sn, gt);
            },
            [
              () => ({ background: _(r(xe)) }),
              () => _(r(xe))
            ]
          ), R(ue, Ze);
        });
        var Q = v(X, 2), C = v(f(Q), 4);
        let Ae;
        var ee = f(C), H = f(ee), A = v(ee, 2);
        Se(A, () => "Blur at the edge", () => r(c).blurEdge !== Tn.blurEdge, () => () => y("blurEdge"));
        var L = v(Q, 2), E = v(f(L), 4);
        Ye(E, 21, () => l, xt, (ue, ve) => {
          var Ee = /* @__PURE__ */ ie(() => Ur(r(ve), 2));
          let xe = () => r(Ee)[0], We = () => r(Ee)[1];
          var Ze = Bc(), Ge = f(Ze), Tt = f(Ge), Wt = v(Ge);
          U(() => {
            T(Tt, xe()), T(Wt, ` — ${We() ?? ""}`);
          }), R(ue, Ze);
        });
        var k = v(L, 2), B = v(f(k), 4), G = f(B), oe = v(G, 2), Z = v(oe, 2), J = f(Z), he = v(B, 2);
        U(() => {
          T(W, `The five colours below are per theme, and you are editing the ${r(p) ?? ""} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.`), T(de, `Edit the ${r(p) === "dark" ? "light" : "dark"} colours`), Ae = Me(C, 1, "row toggle svelte-1hh0fwb", null, Ae, { moved: r(c).blurEdge !== Tn.blurEdge }), Al(H, r(c).blurEdge), T(J, r(u) ? "Copied" : "Copy"), En(he, r(w));
        }), te("click", V, M), te("change", H, (ue) => d({ blurEdge: ue.currentTarget.checked })), te("click", G, () => b(bn)), te("click", oe, () => b(Tn)), te("click", Z, N);
      }
      R(P, z);
    };
    re(D, (P) => {
      r(o) && P(Y);
    });
  }
  U(() => {
    $ = Me(j, 1, "tuner svelte-1hh0fwb", null, $, { folded: !r(o) }), pe(ae, "title", r(o) ? "Fold away" : "Open"), T(q, r(o) ? "–" : "+");
  }), Cl("innerWidth", (P) => x(m, P, !0)), te("click", ae, () => x(o, !r(o))), R(e, j), vt();
}
Ft(["click", "input", "change"]);
function Zr(e, t, n, s) {
  const a = e + t;
  return a < 0 || a >= n && s ? null : a;
}
var $c = /* @__PURE__ */ O('<button><span class="n svelte-1n46o8q"> </span> </button>'), Yc = /* @__PURE__ */ O('<button>← all roots</button> <span class="muted svelte-1n46o8q"> </span>', 1), Kc = /* @__PURE__ */ O('<button title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index."> </button>'), Vc = /* @__PURE__ */ O('<div class="muted pad svelte-1n46o8q">loading…</div>'), Xc = /* @__PURE__ */ O('<div class="tablehead svelte-1n46o8q"><!></div> <!> <!>', 1), Jc = /* @__PURE__ */ O('<aside class="side"><div class="modes svelte-1n46o8q"><button>← grid</button></div> <nav class="svelte-1n46o8q"></nav> <!> <!> <!> <!></aside>'), Zc = /* @__PURE__ */ O('<p class="blurb"> </p>'), Qc = /* @__PURE__ */ O('<div class="bulkbar svelte-1n46o8q"><strong> </strong> <button> </button> <button>Clear selection</button> <span class="muted svelte-1n46o8q"><!></span></div>'), eu = /* @__PURE__ */ O('<div class="sheetbar muted svelte-1n46o8q"> <span class="hint svelte-1n46o8q">click a tile to reveal it · click the corner chip to override</span></div>'), tu = /* @__PURE__ */ O('<p class="muted svelte-1n46o8q">No contact sheet here — you cannot look at a .d.ts. This screen is the table.</p>'), nu = /* @__PURE__ */ O('<h1> </h1> <p class="blurb"> </p> <!> <!> <!> <!> <!> <!>', 1), ru = /* @__PURE__ */ O("<div> </div>"), su = /* @__PURE__ */ O('<!> <!> <div><!> <div class="main"><!> <!></div></div> <!> <!>', 1);
function au(e, t) {
  ht(t, !0);
  const n = location.pathname === "/tune";
  let s = /* @__PURE__ */ K("grid"), a = /* @__PURE__ */ K(0), i = /* @__PURE__ */ K(
    null
    // screen 6's drill-down
  ), l = /* @__PURE__ */ K(Ce([])), c = /* @__PURE__ */ K(null), o = /* @__PURE__ */ K(null), u = /* @__PURE__ */ K(Ce(/* @__PURE__ */ new Set())), p = /* @__PURE__ */ K(null), m = /* @__PURE__ */ K(null), g = /* @__PURE__ */ K(null), h = /* @__PURE__ */ K(null), _ = /* @__PURE__ */ K(!1), w = /* @__PURE__ */ K(!1), d = /* @__PURE__ */ K(!1), b = /* @__PURE__ */ K(!1), y = /* @__PURE__ */ K(Ce({
    loading: !1,
    count: 0,
    exhausted: !1,
    total: null,
    tiles: null
  })), M = /* @__PURE__ */ K(null), N = /* @__PURE__ */ K(0), j = /* @__PURE__ */ K(null), $ = /* @__PURE__ */ K(Ce({})), ne = /* @__PURE__ */ K("newest"), ae = /* @__PURE__ */ K(Ce(so())), q = /* @__PURE__ */ K(null), D = /* @__PURE__ */ K(null), Y = /* @__PURE__ */ K(!1), P = /* @__PURE__ */ K(Ce([]));
  const z = /* @__PURE__ */ ie(() => qs[r(a)]), fe = /* @__PURE__ */ ie(() => r(z).table !== !1), I = /* @__PURE__ */ ie(() => r(fe) || r(z).tree === !0), W = /* @__PURE__ */ ie(() => r(z).sheet !== !1 && (r(o) !== null || !r(I))), V = /* @__PURE__ */ ie(() => ({
    sort: r(ne),
    ...r(ae).on ? { stack: r(ae).window } : {},
    ...Object.fromEntries(Object.entries(r($)).filter(([, S]) => S.length > 0))
  })), de = /* @__PURE__ */ ie(() => r(P).map((S) => S.key)), X = /* @__PURE__ */ ie(() => cc(r(P)));
  qt(() => {
    r(V), en(() => {
      x(P, [], !0);
    });
  });
  const Q = /* @__PURE__ */ ie(() => r(s) === "grid" ? `grid:${JSON.stringify(r(V))}` : `triage:${r(a)}:${JSON.stringify(r(o))}`), C = /* @__PURE__ */ ie(() => r(z).rule === !1 || r(u).size === 0 ? [] : r(l).filter((S) => r(u).has(S.key)).map((S) => r(z).toRule(S, r(i))).filter((S) => S && La(r(m)?.rules ?? [], S) !== "exclude")), ee = /* @__PURE__ */ ie(() => (r(m)?.rules ?? []).filter((S) => S.decision === "exclude" && S.term?.column === "dir_under").map((S) => String(S.term.value).replace(/[\\/]+$/, "").toLowerCase())), H = Il();
  function A(S) {
    x(M, String(S), !0);
  }
  async function L(S) {
    try {
      return x(M, null), await S();
    } catch (le) {
      return A(le), null;
    }
  }
  const E = zl(
    () => {
      x(w, !0), L(async () => {
        const S = r(o)?.at === "end" || r(o)?.at === void 0 ? void 0 : 0, { stale: le, value: be } = await H(() => De.counts(r(o), S));
        le || x(m, be, !0);
      }).finally(() => {
        x(w, !1);
      });
    },
    220
  );
  async function k() {
    x(g, "loading");
    const S = await L(() => De.files());
    x(g, S, !0), x(_, !1), x(h, (/* @__PURE__ */ new Date()).toLocaleTimeString(), !0);
  }
  async function B(S = !1) {
    if (r(s) !== "triage" || !r(fe)) {
      x(l, [], !0);
      return;
    }
    x(b, !0);
    const le = r(z).name === "source_folder" && r(i) ? { root: r(i) } : {};
    S && (le.live = "1");
    const be = await L(() => De.screen(r(z).name, le));
    x(l, be?.rows ?? [], !0), x(b, !1);
  }
  let G = !1;
  qt(() => {
    r(a), r(s), en(() => {
      x(c, null), x(o, null), x(i, null), he(), r(s) === "triage" && (B(), E.now(), G || (G = !0, k()));
    });
  }), qt(() => {
    r(i), en(() => {
      r(s) === "triage" && (he(), B());
    });
  }), tr(() => {
    L(async () => {
      x(j, await De.facets(), !0);
    });
  });
  function oe(S, le) {
    x($, { ...r($), [S]: le }, !0);
  }
  function Z(S) {
    if (r(z).sheet !== !1) {
      if (r(z).drill && !r(i)) {
        x(c, S.key, !0), x(
          o,
          {
            ...r(z).toRule(S, null),
            decision: "exclude",
            at: "end"
          },
          !0
        ), x(i, S.key, !0);
        return;
      }
      x(c, S.key, !0), x(
        o,
        {
          ...r(z).toRule(S, r(i)),
          decision: "exclude",
          at: "end"
        },
        !0
      ), E();
    }
  }
  function J(S, le, be) {
    const Te = new Set(r(u)), Le = !Te.has(S.key), bt = be && r(p) !== null ? r(l).findIndex((ct) => ct.key === r(p)) : -1, [Kt, on] = bt < 0 ? [le, le] : bt < le ? [bt, le] : [le, bt];
    for (let ct = Kt; ct <= on; ct++)
      Le ? Te.add(r(l)[ct].key) : Te.delete(r(l)[ct].key);
    x(u, Te, !0), x(p, S.key, !0);
  }
  function he() {
    x(u, /* @__PURE__ */ new Set(), !0), x(p, null);
  }
  function Se(S) {
    x(o, S, !0), x(
      c,
      null
      // it no longer corresponds to a row
    ), E();
  }
  function Ae(S = !1) {
    x(o, null), x(c, null), S && x(i, null), E.now();
  }
  async function ue() {
    x(
      _,
      !0
      // the distinct-content number now says so on its face
    ), Xi(N), await B(), E.now();
  }
  async function ve() {
    if (!r(o)) return;
    x(d, !0);
    const S = r(o).at === "end" ? void 0 : 0, le = await L(() => De.addRule(
      {
        column: r(o).column,
        op: r(o).op,
        value: r(o).value,
        decision: r(o).decision ?? "exclude",
        note: `screen ${r(z).id} ${r(z).title}`
      },
      S
    ));
    x(d, !1), le && (x(o, null), x(c, null), await ue());
  }
  async function Ee() {
    const S = r(C);
    if (!S.length) {
      he();
      return;
    }
    x(d, !0);
    for (const le of S)
      if (!await L(() => De.addRule({
        column: le.column,
        op: le.op,
        value: le.value,
        decision: "exclude",
        note: `screen ${r(z).id} ${r(z).title}`
      }))) break;
    x(d, !1), he(), x(o, null), x(c, null), await ue();
  }
  async function xe(S) {
    if (!S || Ss(r(ee), S)) return;
    x(d, !0);
    const le = await L(() => De.addRule({
      column: "dir_under",
      op: "=",
      value: S,
      decision: "exclude",
      note: `screen ${r(z).id} ${r(z).title}`
    }));
    x(d, !1), le && await ue();
  }
  const We = (S) => xe(Fa(S.p ?? "")), Ze = (S) => xe(S.key);
  async function Ge(S) {
    x(d, !0), await L(() => De.deleteRule(S.id)), x(d, !1), await ue();
  }
  async function Tt(S, le) {
    x(d, !0), await L(() => De.moveRule(S.id, le)), x(d, !1), await ue();
  }
  async function Wt() {
    await L(async () => {
      x(j, await De.facets(), !0);
    });
  }
  async function xn(S, le) {
    const be = await L(() => De.override(S.s, le));
    return be ? (x(_, !0), E(), be.decision) : S.o ?? null;
  }
  function Qe(S) {
    return r(s) === "grid" ? De.photos({ limit: 500, ...r(V), ...S || {} }) : De.page(r(o), S);
  }
  const Ke = (S) => S.m ?? [{ id: S.id, s: S.s, w: S.w, h: S.h }];
  function Mt(S, le, be) {
    if (r(s) === "grid") {
      if (r(Y)) {
        x(P, oc(r(P), lc(S)), !0);
        return;
      }
      x(q, { frames: Ke(S), origin: Xs(le), at: be }, !0);
      return;
    }
    L(() => De.revealOrigin(S.id));
  }
  const Gt = /* @__PURE__ */ ie(() => r(q) !== null && Zr(r(q).at, -1, r(y).count, r(y).exhausted) !== null), st = /* @__PURE__ */ ie(() => r(q) !== null && Zr(r(q).at, 1, r(y).count, r(y).exhausted) !== null), sn = 120;
  let pt = !1, gt = 0;
  async function At(S, le = !1) {
    const be = performance.now();
    if (!r(q) || pt || le && be - gt < sn) return;
    const Te = Zr(r(q).at, S, r(y).count, r(y).exhausted);
    if (Te !== null) {
      gt = be, pt = !0;
      try {
        const Le = await r(D)?.walkTo(Te);
        if (!Le || !r(q)) return;
        x(
          q,
          {
            frames: Ke(Le.item),
            origin: Xs(Le.tile),
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
    const S = r(q)?.at ?? null;
    x(q, null), await cl(), S !== null && r(D)?.focusTile(S);
  }
  function Rt(S) {
    $e(), L(() => De.revealPhoto(S.id));
  }
  function Lt() {
    L(() => navigator.clipboard.writeText(dc(
      {
        stacking: r(ae),
        sort: r(ne),
        filters: r($)
      },
      r(P)
    )));
  }
  var et = su(), F = lt(et);
  {
    var ce = (S) => {
      ko(S, {
        get facets() {
          return r(j);
        },
        get selected() {
          return r($);
        },
        get sort() {
          return r(ne);
        },
        get stacking() {
          return r(ae);
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
          return r(Y);
        },
        get marked() {
          return r(X);
        },
        onselect: oe,
        onsort: (le) => x(ne, le, !0),
        onstack: (le) => x(ae, ao(le), !0),
        onclear: () => x($, {}, !0),
        onselecting: (le) => x(Y, le, !0),
        onshare: Lt,
        onunmark: () => x(P, [], !0),
        ontriage: () => x(s, "triage")
      });
    };
    re(F, (S) => {
      r(s) === "grid" && S(ce);
    });
  }
  var ge = v(F, 2);
  {
    var ze = (S) => {
      Gc(S, {});
    };
    re(ge, (S) => {
      n && S(ze);
    });
  }
  var ke = v(ge, 2);
  let we;
  var Fe = f(ke);
  {
    var tt = (S) => {
      var le = Jc(), be = f(le), Te = f(be), Le = v(be, 2);
      Ye(Le, 21, () => qs, xt, (Ve, ut, cn) => {
        var un = $c();
        let Fn;
        var Ln = f(un), Re = f(Ln), at = v(Ln, 1, !0);
        U(() => {
          Fn = Me(un, 1, "nav svelte-1n46o8q", null, Fn, { on: cn === r(a) }), T(Re, r(ut).id), T(at, r(ut).title);
        }), te("click", un, () => x(a, cn, !0)), R(Ve, un);
      });
      var bt = v(Le, 2);
      {
        var Kt = (Ve) => {
          var ut = Xc(), cn = lt(ut), un = f(cn);
          {
            var Fn = (Xe) => {
              var nt = Yc(), Dn = lt(nt), rr = /* @__PURE__ */ ie(() => Ae.bind(null, !0)), Hr = v(Dn, 2), qr = f(Hr);
              U(() => T(qr, `inside ${r(i) ?? ""}`)), te("click", Dn, function(...Br) {
                r(rr)?.apply(this, Br);
              }), R(Xe, nt);
            }, Ln = (Xe) => {
              var nt = Kc(), Dn = f(nt);
              U(() => T(Dn, r(z).relive)), te("click", nt, () => B(!0)), R(Xe, nt);
            };
            re(un, (Xe) => {
              r(z).drill && r(i) ? Xe(Fn) : r(z).relive && Xe(Ln, 1);
            });
          }
          var Re = v(cn, 2);
          {
            var at = (Xe) => {
              var nt = Vc();
              R(Xe, nt);
            };
            re(Re, (Xe) => {
              r(b) && Xe(at);
            });
          }
          var dn = v(Re, 2);
          {
            let Xe = /* @__PURE__ */ ie(() => r(m)?.rules ?? []);
            Tc(dn, {
              get rows() {
                return r(l);
              },
              get screen() {
                return r(z);
              },
              get root() {
                return r(i);
              },
              get checked() {
                return r(u);
              },
              get rules() {
                return r(Xe);
              },
              get selected() {
                return r(c);
              },
              onpick: Z,
              oncheck: J
            });
          }
          R(Ve, ut);
        };
        re(bt, (Ve) => {
          r(fe) && Ve(Kt);
        });
      }
      var on = v(bt, 2);
      {
        var ct = (Ve) => {
          Fc(Ve, {
            get root() {
              return Jn;
            },
            get version() {
              return r(N);
            },
            get excludedDirs() {
              return r(ee);
            },
            get selected() {
              return r(c);
            },
            get busy() {
              return r(d);
            },
            onload: (ut) => L(() => De.tree(ut)),
            onpick: Z,
            onexclude: Ze
          });
        };
        re(on, (Ve) => {
          r(z).tree && Ve(ct);
        });
      }
      var Dt = v(on, 2);
      {
        let Ve = /* @__PURE__ */ ie(() => r(m)?.rules ?? []), ut = /* @__PURE__ */ ie(() => r(m)?.unmatched ?? null);
        ic(Dt, {
          get rules() {
            return r(Ve);
          },
          get unmatched() {
            return r(ut);
          },
          get busy() {
            return r(d);
          },
          ondelete: Ge,
          onmove: Tt
        });
      }
      var kn = v(Dt, 2);
      Vo(kn, { oncomplete: Wt }), te("click", Te, () => x(s, "grid")), R(S, le);
    };
    re(Fe, (S) => {
      r(s) === "triage" && S(tt);
    });
  }
  var $t = v(Fe, 2), Oe = f($t);
  {
    var an = (S) => {
      var le = nu(), be = lt(le), Te = f(be), Le = v(be, 2), bt = f(Le), Kt = v(Le, 2);
      {
        var on = (Re) => {
          var at = Zc(), dn = f(at);
          U(() => T(dn, r(z).note)), R(Re, at);
        };
        re(Kt, (Re) => {
          r(z).note && Re(on);
        });
      }
      var ct = v(Kt, 2);
      {
        var Dt = (Re) => {
          jo(Re, {
            get screen() {
              return r(z);
            }
          });
        };
        re(ct, (Re) => {
          r(z).name === "dimensions" && Re(Dt);
        });
      }
      var kn = v(ct, 2);
      Gl(kn, {
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
        onfiles: k
      });
      var Ve = v(kn, 2);
      {
        var ut = (Re) => {
          var at = Qc(), dn = f(at), Xe = f(dn), nt = v(dn, 2), Dn = f(nt), rr = v(nt, 2), Hr = v(rr, 2), qr = f(Hr);
          {
            var Br = (fn) => {
              var jn = Un("already excluded — nothing left to write");
              R(fn, jn);
            }, $a = (fn) => {
              var jn = Un();
              U((Ya) => T(jn, `one exclude rule each, at the end of the order${Ya ?? ""}`), [
                () => r(C).length < r(u).size ? ` · ${Pe(r(u).size - r(C).length)} already excluded, skipped` : ""
              ]), R(fn, jn);
            };
            re(qr, (fn) => {
              r(C).length ? fn($a, -1) : fn(Br);
            });
          }
          U(
            (fn, jn) => {
              T(Xe, `${fn ?? ""} ticked`), nt.disabled = r(d) || !r(C).length, T(Dn, jn), rr.disabled = r(d);
            },
            [
              () => Pe(r(u).size),
              () => r(d) ? "saving…" : `Exclude ${Pe(r(C).length)}`
            ]
          ), te("click", nt, Ee), te("click", rr, he), R(Re, at);
        };
        re(Ve, (Re) => {
          r(u).size && Re(ut);
        });
      }
      var cn = v(Ve, 2);
      tc(cn, {
        get candidate() {
          return r(o);
        },
        get screen() {
          return r(z);
        },
        get saving() {
          return r(d);
        },
        onedit: Se,
        onconfirm: ve,
        onclear: Ae
      });
      var un = v(cn, 2);
      {
        var Fn = (Re) => {
          var at = eu(), dn = f(at);
          U((Xe, nt) => T(dn, `${Xe ?? ""}${nt ?? ""} loaded${r(y).exhausted ? " · all of them" : ""}${r(y).loading ? " · loading…" : ""} `), [
            () => Pe(r(y).count),
            () => r(y).total ? " of " + Pe(r(y).total) : ""
          ]), R(Re, at);
        }, Ln = (Re) => {
          var at = tu();
          R(Re, at);
        };
        re(un, (Re) => {
          r(W) ? Re(Fn) : r(z).sheet === !1 && Re(Ln, 1);
        });
      }
      U(() => {
        T(Te, `${r(z).id ?? ""} · ${r(z).title ?? ""}`), T(bt, r(z).blurb);
      }), R(S, le);
    };
    re(Oe, (S) => {
      r(s) === "triage" && S(an);
    });
  }
  var Yt = v(Oe, 2);
  {
    var _t = (S) => {
      {
        let le = /* @__PURE__ */ ie(() => r(s) === "grid" ? null : r(m)?.page_paths ?? null), be = /* @__PURE__ */ ie(() => r(s) === "triage"), Te = /* @__PURE__ */ ie(() => r(s) === "grid" && r(Y));
        pr(
          bc(S, {
            get key() {
              return r(Q);
            },
            fetchPage: Qe,
            get total() {
              return r(le);
            },
            get triage() {
              return r(be);
            },
            get excludedDirs() {
              return r(ee);
            },
            get selecting() {
              return r(Te);
            },
            get markedKeys() {
              return r(de);
            },
            onActivate: Mt,
            onOverride: xn,
            onExcludeFolder: We,
            onState: (Le) => x(y, { ...r(y), ...Le }, !0)
          }),
          (Le) => x(D, Le, !0),
          () => r(D)
        );
      }
    };
    re(Yt, (S) => {
      (r(W) || r(s) === "grid") && S(_t);
    });
  }
  var ln = v(ke, 2);
  {
    var nr = (S) => {
      No(S, {
        get frames() {
          return r(q).frames;
        },
        get origin() {
          return r(q).origin;
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
    re(ln, (S) => {
      r(q) && S(nr);
    });
  }
  var jr = v(ln, 2);
  {
    var mr = (S) => {
      var le = ru();
      let be;
      var Te = f(le);
      U(() => {
        be = Me(le, 1, "status", null, be, { bare: r(s) === "grid" }), T(Te, r(M));
      }), R(S, le);
    };
    re(jr, (S) => {
      r(M) && S(mr);
    });
  }
  U(() => we = Me(ke, 1, "shell", null, we, { bare: r(s) === "grid" })), R(e, et), vt();
}
Ft(["click"]);
io();
Es();
gl(au, { target: document.getElementById("app") });
