
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules\svelte-simple-modal\src\Modal.svelte generated by Svelte v3.23.2 */

    const { Object: Object_1 } = globals;
    const file = "node_modules\\svelte-simple-modal\\src\\Modal.svelte";

    // (213:0) {#if Component}
    function create_if_block(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let switch_instance;
    	let div1_transition;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*state*/ ctx[0].closeButton && create_if_block_1(ctx);
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*Component*/ ctx[1];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "content svelte-fnsfcv");
    			attr_dev(div0, "style", /*cssContent*/ ctx[11]);
    			add_location(div0, file, 233, 8, 5379);
    			attr_dev(div1, "class", "window svelte-fnsfcv");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
    			add_location(div1, file, 221, 6, 5006);
    			attr_dev(div2, "class", "window-wrap svelte-fnsfcv");
    			add_location(div2, file, 220, 4, 4957);
    			attr_dev(div3, "class", "bg svelte-fnsfcv");
    			attr_dev(div3, "style", /*cssBg*/ ctx[9]);
    			add_location(div3, file, 213, 2, 4791);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			/*div2_binding*/ ctx[31](div2);
    			/*div3_binding*/ ctx[32](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div1,
    						"introstart",
    						function () {
    							if (is_function(/*onOpen*/ ctx[5])) /*onOpen*/ ctx[5].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outrostart",
    						function () {
    							if (is_function(/*onClose*/ ctx[6])) /*onClose*/ ctx[6].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"introend",
    						function () {
    							if (is_function(/*onOpened*/ ctx[7])) /*onOpened*/ ctx[7].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outroend",
    						function () {
    							if (is_function(/*onClosed*/ ctx[8])) /*onClosed*/ ctx[8].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(div3, "click", /*handleOuterClick*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*state*/ ctx[0].closeButton) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const switch_instance_changes = (dirty[0] & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*Component*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty[0] & /*cssContent*/ 2048) {
    				attr_dev(div0, "style", /*cssContent*/ ctx[11]);
    			}

    			if (!current || dirty[0] & /*cssWindow*/ 1024) {
    				attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
    			}

    			if (!current || dirty[0] & /*cssBg*/ 512) {
    				attr_dev(div3, "style", /*cssBg*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[13], /*state*/ ctx[0].transitionWindowProps, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[12], /*state*/ ctx[0].transitionBgProps, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[13], /*state*/ ctx[0].transitionWindowProps, false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[12], /*state*/ ctx[0].transitionBgProps, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			if (switch_instance) destroy_component(switch_instance);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[31](null);
    			/*div3_binding*/ ctx[32](null);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(213:0) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (231:8) {#if state.closeButton}
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "close svelte-fnsfcv");
    			add_location(button, file, 231, 10, 5308);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(231:8) {#if state.closeButton}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Component*/ ctx[1] && create_if_block(ctx);
    	const default_slot_template = /*$$slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[29], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keyup", /*handleKeyup*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Component*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*Component*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 536870912) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[29], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { key = "simple-modal" } = $$props;
    	let { closeButton = true } = $$props;
    	let { closeOnEsc = true } = $$props;
    	let { closeOnOuterClick = true } = $$props;
    	let { styleBg = { top: 0, left: 0 } } = $$props;
    	let { styleWindow = {} } = $$props;
    	let { styleContent = {} } = $$props;
    	let { setContext: setContext$1 = setContext } = $$props;
    	let { transitionBg = fade } = $$props;
    	let { transitionBgProps = { duration: 250 } } = $$props;
    	let { transitionWindow = transitionBg } = $$props;
    	let { transitionWindowProps = transitionBgProps } = $$props;

    	const defaultState = {
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps
    	};

    	let state = { ...defaultState };
    	let Component = null;
    	let props = null;
    	let background;
    	let wrap;
    	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
    	const toCssString = props => Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, "");

    	const toVoid = () => {
    		
    	};

    	let onOpen = toVoid;
    	let onClose = toVoid;
    	let onOpened = toVoid;
    	let onClosed = toVoid;

    	const open = (NewComponent, newProps = {}, options = {}, callback = {}) => {
    		$$invalidate(1, Component = NewComponent);
    		$$invalidate(2, props = newProps);
    		$$invalidate(0, state = { ...defaultState, ...options });
    		$$invalidate(5, onOpen = callback.onOpen || toVoid);
    		$$invalidate(6, onClose = callback.onClose || toVoid);
    		$$invalidate(7, onOpened = callback.onOpened || toVoid);
    		$$invalidate(8, onClosed = callback.onClosed || toVoid);
    	};

    	const close = (callback = {}) => {
    		$$invalidate(6, onClose = callback.onClose || onClose);
    		$$invalidate(8, onClosed = callback.onClosed || onClosed);
    		$$invalidate(1, Component = null);
    		$$invalidate(2, props = null);
    	};

    	const handleKeyup = event => {
    		if (state.closeOnEsc && Component && event.key === "Escape") {
    			event.preventDefault();
    			close();
    		}
    	};

    	const handleOuterClick = event => {
    		if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) {
    			event.preventDefault();
    			close();
    		}
    	};

    	setContext$1(key, { open, close });

    	const writable_props = [
    		"key",
    		"closeButton",
    		"closeOnEsc",
    		"closeOnOuterClick",
    		"styleBg",
    		"styleWindow",
    		"styleContent",
    		"setContext",
    		"transitionBg",
    		"transitionBgProps",
    		"transitionWindow",
    		"transitionWindowProps"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['default']);

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrap = $$value;
    			$$invalidate(4, wrap);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			background = $$value;
    			$$invalidate(3, background);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("key" in $$props) $$invalidate(17, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(18, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(19, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(20, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("styleBg" in $$props) $$invalidate(21, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(22, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(23, styleContent = $$props.styleContent);
    		if ("setContext" in $$props) $$invalidate(24, setContext$1 = $$props.setContext);
    		if ("transitionBg" in $$props) $$invalidate(25, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(26, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(27, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(28, transitionWindowProps = $$props.transitionWindowProps);
    		if ("$$scope" in $$props) $$invalidate(29, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		baseSetContext: setContext,
    		fade,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		setContext: setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		defaultState,
    		state,
    		Component,
    		props,
    		background,
    		wrap,
    		camelCaseToDash,
    		toCssString,
    		toVoid,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		open,
    		close,
    		handleKeyup,
    		handleOuterClick,
    		cssBg,
    		cssWindow,
    		cssContent,
    		currentTransitionBg,
    		currentTransitionWindow
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(17, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(18, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(19, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(20, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("styleBg" in $$props) $$invalidate(21, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(22, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(23, styleContent = $$props.styleContent);
    		if ("setContext" in $$props) $$invalidate(24, setContext$1 = $$props.setContext);
    		if ("transitionBg" in $$props) $$invalidate(25, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(26, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(27, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(28, transitionWindowProps = $$props.transitionWindowProps);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("Component" in $$props) $$invalidate(1, Component = $$props.Component);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("background" in $$props) $$invalidate(3, background = $$props.background);
    		if ("wrap" in $$props) $$invalidate(4, wrap = $$props.wrap);
    		if ("onOpen" in $$props) $$invalidate(5, onOpen = $$props.onOpen);
    		if ("onClose" in $$props) $$invalidate(6, onClose = $$props.onClose);
    		if ("onOpened" in $$props) $$invalidate(7, onOpened = $$props.onOpened);
    		if ("onClosed" in $$props) $$invalidate(8, onClosed = $$props.onClosed);
    		if ("cssBg" in $$props) $$invalidate(9, cssBg = $$props.cssBg);
    		if ("cssWindow" in $$props) $$invalidate(10, cssWindow = $$props.cssWindow);
    		if ("cssContent" in $$props) $$invalidate(11, cssContent = $$props.cssContent);
    		if ("currentTransitionBg" in $$props) $$invalidate(12, currentTransitionBg = $$props.currentTransitionBg);
    		if ("currentTransitionWindow" in $$props) $$invalidate(13, currentTransitionWindow = $$props.currentTransitionWindow);
    	};

    	let cssBg;
    	let cssWindow;
    	let cssContent;
    	let currentTransitionBg;
    	let currentTransitionWindow;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(9, cssBg = toCssString(state.styleBg));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(10, cssWindow = toCssString(state.styleWindow));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(11, cssContent = toCssString(state.styleContent));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(12, currentTransitionBg = state.transitionBg);
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(13, currentTransitionWindow = state.transitionWindow);
    		}
    	};

    	return [
    		state,
    		Component,
    		props,
    		background,
    		wrap,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		cssBg,
    		cssWindow,
    		cssContent,
    		currentTransitionBg,
    		currentTransitionWindow,
    		close,
    		handleKeyup,
    		handleOuterClick,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		$$scope,
    		$$slots,
    		div2_binding,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				key: 17,
    				closeButton: 18,
    				closeOnEsc: 19,
    				closeOnOuterClick: 20,
    				styleBg: 21,
    				styleWindow: 22,
    				styleContent: 23,
    				setContext: 24,
    				transitionBg: 25,
    				transitionBgProps: 26,
    				transitionWindow: 27,
    				transitionWindowProps: 28
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get key() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnEsc() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnEsc(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnOuterClick() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnOuterClick(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleContent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleContent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setContext() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setContext(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBgProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBgProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindowProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindowProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ConfirmMordal.svelte generated by Svelte v3.23.2 */

    const file$1 = "src\\components\\ConfirmMordal.svelte";

    function create_fragment$1(ctx) {
    	let p;
    	let t0;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(/*message*/ ctx[0]);
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Yes";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "No";
    			set_style(p, "white-space", "pre");
    			add_location(p, file$1, 6, 0, 91);
    			add_location(button0, file$1, 7, 0, 133);
    			add_location(button1, file$1, 8, 0, 176);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*onAccepted*/ ctx[1])) /*onAccepted*/ ctx[1].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*onRefused*/ ctx[2])) /*onRefused*/ ctx[2].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*message*/ 1) set_data_dev(t0, /*message*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { message } = $$props;
    	let { onAccepted } = $$props;
    	let { onRefused } = $$props;
    	const writable_props = ["message", "onAccepted", "onRefused"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ConfirmMordal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ConfirmMordal", $$slots, []);

    	$$self.$set = $$props => {
    		if ("message" in $$props) $$invalidate(0, message = $$props.message);
    		if ("onAccepted" in $$props) $$invalidate(1, onAccepted = $$props.onAccepted);
    		if ("onRefused" in $$props) $$invalidate(2, onRefused = $$props.onRefused);
    	};

    	$$self.$capture_state = () => ({ message, onAccepted, onRefused });

    	$$self.$inject_state = $$props => {
    		if ("message" in $$props) $$invalidate(0, message = $$props.message);
    		if ("onAccepted" in $$props) $$invalidate(1, onAccepted = $$props.onAccepted);
    		if ("onRefused" in $$props) $$invalidate(2, onRefused = $$props.onRefused);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [message, onAccepted, onRefused];
    }

    class ConfirmMordal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { message: 0, onAccepted: 1, onRefused: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConfirmMordal",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*message*/ ctx[0] === undefined && !("message" in props)) {
    			console.warn("<ConfirmMordal> was created without expected prop 'message'");
    		}

    		if (/*onAccepted*/ ctx[1] === undefined && !("onAccepted" in props)) {
    			console.warn("<ConfirmMordal> was created without expected prop 'onAccepted'");
    		}

    		if (/*onRefused*/ ctx[2] === undefined && !("onRefused" in props)) {
    			console.warn("<ConfirmMordal> was created without expected prop 'onRefused'");
    		}
    	}

    	get message() {
    		throw new Error("<ConfirmMordal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<ConfirmMordal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onAccepted() {
    		throw new Error("<ConfirmMordal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onAccepted(value) {
    		throw new Error("<ConfirmMordal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onRefused() {
    		throw new Error("<ConfirmMordal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onRefused(value) {
    		throw new Error("<ConfirmMordal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ZoneNameModal.svelte generated by Svelte v3.23.2 */

    const file$2 = "src\\components\\ZoneNameModal.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let form;
    	let p;
    	let t0;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let label1;
    	let t5;
    	let input1;
    	let t6;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			p = element("p");
    			t0 = space();
    			label0 = element("label");
    			label0.textContent = "Zone Name:";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			label1.textContent = "Category Name:";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			button = element("button");
    			button.textContent = "Save";
    			attr_dev(p, "class", "error-message svelte-7fw46a");
    			add_location(p, file$2, 19, 4, 555);
    			attr_dev(label0, "for", "name");
    			add_location(label0, file$2, 20, 4, 621);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "placeholder", "zoneName");
    			add_location(input0, file$2, 21, 4, 662);
    			attr_dev(label1, "for", "cat");
    			add_location(label1, file$2, 27, 4, 785);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "cat");
    			attr_dev(input1, "name", "cat");
    			attr_dev(input1, "placeholder", "catName");
    			add_location(input1, file$2, 28, 4, 829);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "submit");
    			add_location(button, file$2, 34, 4, 953);
    			attr_dev(form, "name", "save");
    			add_location(form, file$2, 18, 2, 532);
    			attr_dev(div, "class", "form");
    			add_location(div, file$2, 17, 0, 511);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, p);
    			/*p_binding*/ ctx[5](p);
    			append_dev(form, t0);
    			append_dev(form, label0);
    			append_dev(form, t2);
    			append_dev(form, input0);
    			set_input_value(input0, /*zoneName*/ ctx[0]);
    			append_dev(form, t3);
    			append_dev(form, label1);
    			append_dev(form, t5);
    			append_dev(form, input1);
    			set_input_value(input1, /*categoryName*/ ctx[1]);
    			append_dev(form, t6);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(button, "click", /*submitZoneName*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*zoneName*/ 1 && input0.value !== /*zoneName*/ ctx[0]) {
    				set_input_value(input0, /*zoneName*/ ctx[0]);
    			}

    			if (dirty & /*categoryName*/ 2 && input1.value !== /*categoryName*/ ctx[1]) {
    				set_input_value(input1, /*categoryName*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*p_binding*/ ctx[5](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { onSubmited } = $$props;
    	let zoneName = "";
    	let categoryName = "";
    	let errorMessageElement;

    	function submitZoneName() {
    		if (zoneName.length == 0 || categoryName.length == 0) {
    			$$invalidate(2, errorMessageElement.innerHTML = "Don't let fields empty", errorMessageElement);
    		} else if (zoneName.indexOf(" ") != -1 || categoryName.indexOf(" ") != -1) {
    			$$invalidate(2, errorMessageElement.innerHTML = "The fields cannot contains whitespace", errorMessageElement);
    		} else {
    			onSubmited({ name: zoneName, cat: categoryName });
    		}
    	}

    	const writable_props = ["onSubmited"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ZoneNameModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ZoneNameModal", $$slots, []);

    	function p_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			errorMessageElement = $$value;
    			$$invalidate(2, errorMessageElement);
    		});
    	}

    	function input0_input_handler() {
    		zoneName = this.value;
    		$$invalidate(0, zoneName);
    	}

    	function input1_input_handler() {
    		categoryName = this.value;
    		$$invalidate(1, categoryName);
    	}

    	$$self.$set = $$props => {
    		if ("onSubmited" in $$props) $$invalidate(4, onSubmited = $$props.onSubmited);
    	};

    	$$self.$capture_state = () => ({
    		onSubmited,
    		zoneName,
    		categoryName,
    		errorMessageElement,
    		submitZoneName
    	});

    	$$self.$inject_state = $$props => {
    		if ("onSubmited" in $$props) $$invalidate(4, onSubmited = $$props.onSubmited);
    		if ("zoneName" in $$props) $$invalidate(0, zoneName = $$props.zoneName);
    		if ("categoryName" in $$props) $$invalidate(1, categoryName = $$props.categoryName);
    		if ("errorMessageElement" in $$props) $$invalidate(2, errorMessageElement = $$props.errorMessageElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		zoneName,
    		categoryName,
    		errorMessageElement,
    		submitZoneName,
    		onSubmited,
    		p_binding,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class ZoneNameModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { onSubmited: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ZoneNameModal",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onSubmited*/ ctx[4] === undefined && !("onSubmited" in props)) {
    			console.warn("<ZoneNameModal> was created without expected prop 'onSubmited'");
    		}
    	}

    	get onSubmited() {
    		throw new Error("<ZoneNameModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSubmited(value) {
    		throw new Error("<ZoneNameModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Content.svelte generated by Svelte v3.23.2 */
    const file$3 = "src\\Content.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (214:0) {#if displayMenu}
    function create_if_block$1(ctx) {
    	let div3;
    	let p0;
    	let i0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let t5;
    	let hr;
    	let t6;
    	let div2;
    	let div0;
    	let p3;
    	let i1;
    	let t8;
    	let t9;
    	let t10;
    	let p4;
    	let i2;
    	let t12;
    	let t13;
    	let p5;
    	let i3;
    	let t15;
    	let t16;
    	let div1;
    	let t17;
    	let t18;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*isInUse*/ ctx[2]) return create_if_block_4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*currentDisp*/ ctx[1] == "manage" && create_if_block_3(ctx);
    	let if_block2 = /*currentDisp*/ ctx[1] == "help" && create_if_block_2(ctx);
    	let if_block3 = /*currentDisp*/ ctx[1] == "about" && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			p0 = element("p");
    			i0 = element("i");
    			i0.textContent = "close";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "iZone v1.4";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "Admin panel";
    			t5 = space();
    			hr = element("hr");
    			t6 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p3 = element("p");
    			i1 = element("i");
    			i1.textContent = "pageview";
    			t8 = text("\n          Manage Zones");
    			t9 = space();
    			if_block0.c();
    			t10 = space();
    			p4 = element("p");
    			i2 = element("i");
    			i2.textContent = "help";
    			t12 = text("\n          Help");
    			t13 = space();
    			p5 = element("p");
    			i3 = element("i");
    			i3.textContent = "info";
    			t15 = text("\n          About");
    			t16 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t17 = space();
    			if (if_block2) if_block2.c();
    			t18 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(i0, "class", "material-icons center red clickable md-48 svelte-r8vz9m");
    			add_location(i0, file$3, 216, 6, 4396);
    			attr_dev(p0, "class", "close svelte-r8vz9m");
    			add_location(p0, file$3, 215, 4, 4355);
    			attr_dev(p1, "class", "infos svelte-r8vz9m");
    			add_location(p1, file$3, 218, 4, 4472);
    			attr_dev(p2, "class", "title svelte-r8vz9m");
    			add_location(p2, file$3, 219, 4, 4508);
    			attr_dev(hr, "class", "infos-sep svelte-r8vz9m");
    			add_location(hr, file$3, 220, 4, 4545);
    			attr_dev(i1, "class", "material-icons center svelte-r8vz9m");
    			add_location(i1, file$3, 224, 10, 4696);
    			attr_dev(p3, "id", "manage");
    			attr_dev(p3, "class", "item-menu svelte-r8vz9m");
    			add_location(p3, file$3, 223, 8, 4629);
    			attr_dev(i2, "class", "material-icons center svelte-r8vz9m");
    			add_location(i2, file$3, 243, 10, 5380);
    			attr_dev(p4, "id", "help");
    			attr_dev(p4, "class", "item-menu svelte-r8vz9m");
    			add_location(p4, file$3, 242, 8, 5315);
    			attr_dev(i3, "class", "material-icons center svelte-r8vz9m");
    			add_location(i3, file$3, 247, 10, 5524);
    			attr_dev(p5, "id", "about");
    			attr_dev(p5, "class", "item-menu svelte-r8vz9m");
    			add_location(p5, file$3, 246, 8, 5458);
    			attr_dev(div0, "class", "menu svelte-r8vz9m");
    			add_location(div0, file$3, 222, 6, 4602);
    			attr_dev(div1, "class", "display svelte-r8vz9m");
    			add_location(div1, file$3, 251, 6, 5614);
    			attr_dev(div2, "class", "content svelte-r8vz9m");
    			add_location(div2, file$3, 221, 4, 4574);
    			attr_dev(div3, "class", "main-container svelte-r8vz9m");
    			add_location(div3, file$3, 214, 2, 4322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, p0);
    			append_dev(p0, i0);
    			append_dev(div3, t1);
    			append_dev(div3, p1);
    			append_dev(div3, t3);
    			append_dev(div3, p2);
    			append_dev(div3, t5);
    			append_dev(div3, hr);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p3);
    			append_dev(p3, i1);
    			append_dev(p3, t8);
    			append_dev(div0, t9);
    			if_block0.m(div0, null);
    			append_dev(div0, t10);
    			append_dev(div0, p4);
    			append_dev(p4, i2);
    			append_dev(p4, t12);
    			append_dev(div0, t13);
    			append_dev(div0, p5);
    			append_dev(p5, i3);
    			append_dev(p5, t15);
    			append_dev(div2, t16);
    			append_dev(div2, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t17);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t18);
    			if (if_block3) if_block3.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(p0, "click", /*close*/ ctx[4], false, false, false),
    					listen_dev(p3, "click", /*switchTabTo*/ ctx[6], false, false, false),
    					listen_dev(p4, "click", /*switchTabTo*/ ctx[6], false, false, false),
    					listen_dev(p5, "click", /*switchTabTo*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, t10);
    				}
    			}

    			if (/*currentDisp*/ ctx[1] == "manage") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div1, t17);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*currentDisp*/ ctx[1] == "help") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(div1, t18);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*currentDisp*/ ctx[1] == "about") {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_1$1(ctx);
    					if_block3.c();
    					if_block3.m(div1, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(214:0) {#if displayMenu}",
    		ctx
    	});

    	return block;
    }

    // (237:8) {:else}
    function create_else_block(ctx) {
    	let p;
    	let i;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			i = element("i");
    			i.textContent = "add_circle";
    			t1 = text("\n            Create Zone");
    			attr_dev(i, "class", "material-icons center svelte-r8vz9m");
    			add_location(i, file$3, 238, 12, 5206);
    			attr_dev(p, "id", "add");
    			attr_dev(p, "class", "item-menu svelte-r8vz9m");
    			add_location(p, file$3, 237, 10, 5141);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, i);
    			append_dev(p, t1);

    			if (!mounted) {
    				dispose = listen_dev(p, "click", /*createZone*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(237:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (228:8) {#if isInUse}
    function create_if_block_4(ctx) {
    	let p0;
    	let i0;
    	let t1;
    	let t2;
    	let p1;
    	let i1;
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			i0 = element("i");
    			i0.textContent = "delete";
    			t1 = text("\n            Stop Zone Creation");
    			t2 = space();
    			p1 = element("p");
    			i1 = element("i");
    			i1.textContent = "save";
    			t4 = text("\n            Save Zone");
    			attr_dev(i0, "class", "material-icons center svelte-r8vz9m");
    			add_location(i0, file$3, 229, 12, 4873);
    			attr_dev(p0, "id", "add");
    			attr_dev(p0, "class", "item-menu svelte-r8vz9m");
    			add_location(p0, file$3, 228, 10, 4810);
    			attr_dev(i1, "class", "material-icons center svelte-r8vz9m");
    			add_location(i1, file$3, 233, 12, 5036);
    			attr_dev(p1, "id", "add");
    			attr_dev(p1, "class", "item-menu svelte-r8vz9m");
    			add_location(p1, file$3, 232, 10, 4973);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, i0);
    			append_dev(p0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, i1);
    			append_dev(p1, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(p0, "click", /*stopZone*/ ctx[10], false, false, false),
    					listen_dev(p1, "click", /*saveZone*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(228:8) {#if isInUse}",
    		ctx
    	});

    	return block;
    }

    // (254:8) {#if currentDisp == 'manage'}
    function create_if_block_3(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let table;
    	let thead;
    	let tr;
    	let td0;
    	let t3;
    	let td1;
    	let t5;
    	let td2;
    	let t7;
    	let td3;
    	let t9;
    	let td4;
    	let t11;
    	let tbody;
    	let each_value = /*zones*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Manage Zones";
    			t1 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Categorie";
    			t3 = space();
    			td1 = element("td");
    			td1.textContent = "Name";
    			t5 = space();
    			td2 = element("td");
    			td2.textContent = "Center";
    			t7 = space();
    			td3 = element("td");
    			td3.textContent = "TP";
    			t9 = space();
    			td4 = element("td");
    			td4.textContent = "Delete";
    			t11 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-r8vz9m");
    			add_location(h2, file$3, 255, 12, 5777);
    			attr_dev(td0, "class", "svelte-r8vz9m");
    			add_location(td0, file$3, 259, 18, 5895);
    			attr_dev(td1, "class", "svelte-r8vz9m");
    			add_location(td1, file$3, 260, 18, 5932);
    			attr_dev(td2, "class", "svelte-r8vz9m");
    			add_location(td2, file$3, 261, 18, 5964);
    			attr_dev(td3, "class", "svelte-r8vz9m");
    			add_location(td3, file$3, 262, 18, 5998);
    			attr_dev(td4, "class", "svelte-r8vz9m");
    			add_location(td4, file$3, 263, 18, 6028);
    			add_location(tr, file$3, 258, 16, 5872);
    			attr_dev(thead, "class", "svelte-r8vz9m");
    			add_location(thead, file$3, 257, 14, 5848);
    			add_location(tbody, file$3, 266, 14, 6103);
    			attr_dev(table, "class", "center svelte-r8vz9m");
    			add_location(table, file$3, 256, 12, 5811);
    			attr_dev(div, "class", "center svelte-r8vz9m");
    			add_location(div, file$3, 254, 10, 5744);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, td0);
    			append_dev(tr, t3);
    			append_dev(tr, td1);
    			append_dev(tr, t5);
    			append_dev(tr, td2);
    			append_dev(tr, t7);
    			append_dev(tr, td3);
    			append_dev(tr, t9);
    			append_dev(tr, td4);
    			append_dev(table, t11);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*zones, deleteRequested, tpToSelected, Math*/ 392) {
    				each_value = /*zones*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(254:8) {#if currentDisp == 'manage'}",
    		ctx
    	});

    	return block;
    }

    // (268:16) {#each zones as zone, i}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*zone*/ ctx[18].cat + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*zone*/ ctx[18].name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4;
    	let t5_value = Math.ceil(/*zone*/ ctx[18].center.x) + "";
    	let t5;
    	let t6;
    	let t7_value = Math.ceil(/*zone*/ ctx[18].center.y) + "";
    	let t7;
    	let t8;
    	let t9_value = Math.ceil(/*zone*/ ctx[18].center.z) + "";
    	let t9;
    	let t10;
    	let td3;
    	let i0;
    	let i0_id_value;
    	let t12;
    	let td4;
    	let i1;
    	let t13;
    	let i1_id_value;
    	let t14;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[14](/*zone*/ ctx[18], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text("x: ");
    			t5 = text(t5_value);
    			t6 = text(" y: ");
    			t7 = text(t7_value);
    			t8 = text("\n                      z: ");
    			t9 = text(t9_value);
    			t10 = space();
    			td3 = element("td");
    			i0 = element("i");
    			i0.textContent = "play_arrow";
    			t12 = space();
    			td4 = element("td");
    			i1 = element("i");
    			t13 = text("delete_forever");
    			t14 = space();
    			attr_dev(td0, "class", "svelte-r8vz9m");
    			add_location(td0, file$3, 269, 20, 6195);
    			attr_dev(td1, "class", "svelte-r8vz9m");
    			add_location(td1, file$3, 270, 20, 6235);
    			attr_dev(td2, "class", "svelte-r8vz9m");
    			add_location(td2, file$3, 271, 20, 6276);
    			attr_dev(i0, "id", i0_id_value = /*i*/ ctx[20]);
    			attr_dev(i0, "class", "material-icons center clickable md-48 svelte-r8vz9m");
    			add_location(i0, file$3, 276, 22, 6488);
    			attr_dev(td3, "class", "svelte-r8vz9m");
    			add_location(td3, file$3, 275, 20, 6461);
    			attr_dev(i1, "id", i1_id_value = /*zone*/ ctx[18].id);
    			attr_dev(i1, "class", "material-icons center red clickable md-48 svelte-r8vz9m");
    			add_location(i1, file$3, 284, 22, 6776);
    			attr_dev(td4, "class", "svelte-r8vz9m");
    			add_location(td4, file$3, 283, 20, 6749);
    			add_location(tr, file$3, 268, 18, 6170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(td2, t5);
    			append_dev(td2, t6);
    			append_dev(td2, t7);
    			append_dev(td2, t8);
    			append_dev(td2, t9);
    			append_dev(tr, t10);
    			append_dev(tr, td3);
    			append_dev(td3, i0);
    			append_dev(tr, t12);
    			append_dev(tr, td4);
    			append_dev(td4, i1);
    			append_dev(i1, t13);
    			append_dev(tr, t14);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*tpToSelected*/ ctx[7], false, false, false),
    					listen_dev(i1, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*zones*/ 8 && t0_value !== (t0_value = /*zone*/ ctx[18].cat + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*zones*/ 8 && t2_value !== (t2_value = /*zone*/ ctx[18].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*zones*/ 8 && t5_value !== (t5_value = Math.ceil(/*zone*/ ctx[18].center.x) + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*zones*/ 8 && t7_value !== (t7_value = Math.ceil(/*zone*/ ctx[18].center.y) + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*zones*/ 8 && t9_value !== (t9_value = Math.ceil(/*zone*/ ctx[18].center.z) + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*zones*/ 8 && i1_id_value !== (i1_id_value = /*zone*/ ctx[18].id)) {
    				attr_dev(i1, "id", i1_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(268:16) {#each zones as zone, i}",
    		ctx
    	});

    	return block;
    }

    // (299:8) {#if currentDisp == 'help'}
    function create_if_block_2(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let ul;
    	let li0;
    	let t2;
    	let span0;
    	let t4;
    	let t5;
    	let li1;
    	let t6;
    	let span1;
    	let t8;
    	let t9;
    	let li2;
    	let t10;
    	let span2;
    	let t12;
    	let t13;
    	let li3;
    	let t14;
    	let span3;
    	let t16;
    	let t17;
    	let li4;
    	let t18;
    	let span4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Help";
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			t2 = text("Create a Zone: click on the\n                ");
    			span0 = element("span");
    			span0.textContent = "Create Zone";
    			t4 = text("\n                button.");
    			t5 = space();
    			li1 = element("li");
    			t6 = text("Add points: press the\n                ");
    			span1 = element("span");
    			span1.textContent = "[L]";
    			t8 = text("\n                key (the keys can be changed in configuration file).");
    			t9 = space();
    			li2 = element("li");
    			t10 = text("Remove last point: press the\n                ");
    			span2 = element("span");
    			span2.textContent = "[K]";
    			t12 = text("\n                key.");
    			t13 = space();
    			li3 = element("li");
    			t14 = text("Save the zone: click on the\n                ");
    			span3 = element("span");
    			span3.textContent = "Save Zone";
    			t16 = text("\n                button, a prompt will ask you to enter a categorie name and a\n                zone name.");
    			t17 = space();
    			li4 = element("li");
    			t18 = text("Stop the zone creation: click on the\n                ");
    			span4 = element("span");
    			span4.textContent = "Stop Zone Creation";
    			attr_dev(h2, "class", "svelte-r8vz9m");
    			add_location(h2, file$3, 300, 12, 7259);
    			attr_dev(span0, "class", "orange svelte-r8vz9m");
    			add_location(span0, file$3, 304, 16, 7387);
    			add_location(li0, file$3, 302, 14, 7322);
    			attr_dev(span1, "class", "orange svelte-r8vz9m");
    			add_location(span1, file$3, 309, 16, 7544);
    			add_location(li1, file$3, 307, 14, 7485);
    			attr_dev(span2, "class", "orange svelte-r8vz9m");
    			add_location(span2, file$3, 314, 16, 7745);
    			add_location(li2, file$3, 312, 14, 7679);
    			attr_dev(span3, "class", "orange svelte-r8vz9m");
    			add_location(span3, file$3, 319, 16, 7897);
    			add_location(li3, file$3, 317, 14, 7832);
    			attr_dev(span4, "class", "orange svelte-r8vz9m");
    			add_location(span4, file$3, 325, 16, 8148);
    			add_location(li4, file$3, 323, 14, 8074);
    			attr_dev(ul, "class", "help-list");
    			add_location(ul, file$3, 301, 12, 7285);
    			attr_dev(div, "class", "center container svelte-r8vz9m");
    			add_location(div, file$3, 299, 10, 7216);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, t2);
    			append_dev(li0, span0);
    			append_dev(li0, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, t6);
    			append_dev(li1, span1);
    			append_dev(li1, t8);
    			append_dev(ul, t9);
    			append_dev(ul, li2);
    			append_dev(li2, t10);
    			append_dev(li2, span2);
    			append_dev(li2, t12);
    			append_dev(ul, t13);
    			append_dev(ul, li3);
    			append_dev(li3, t14);
    			append_dev(li3, span3);
    			append_dev(li3, t16);
    			append_dev(ul, t17);
    			append_dev(ul, li4);
    			append_dev(li4, t18);
    			append_dev(li4, span4);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(299:8) {#if currentDisp == 'help'}",
    		ctx
    	});

    	return block;
    }

    // (332:8) {#if currentDisp == 'about'}
    function create_if_block_1$1(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p0;
    	let span0;
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let span1;
    	let t7;
    	let t8;
    	let p2;
    	let t9;
    	let span2;
    	let t11;
    	let span3;
    	let t13;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "About";
    			t1 = space();
    			p0 = element("p");
    			span0 = element("span");
    			span0.textContent = "iZone";
    			t3 = text("\n              is made by Izio to help developer and server owners to create\n              polygonal 2D zones. It also provides few utilities to interract\n              with the created zones.");
    			t4 = space();
    			p1 = element("p");
    			t5 = text("If you want to\n              ");
    			span1 = element("span");
    			span1.textContent = "contribute";
    			t7 = text("\n              to this project, go to the CitizenFx forum, and follow the GitHub\n              link.");
    			t8 = space();
    			p2 = element("p");
    			t9 = text("Feel free to\n              ");
    			span2 = element("span");
    			span2.textContent = "report the bugs";
    			t11 = text("\n              or\n              ");
    			span3 = element("span");
    			span3.textContent = "suggest new features";
    			t13 = text("\n              !");
    			attr_dev(h2, "class", "svelte-r8vz9m");
    			add_location(h2, file$3, 333, 12, 8355);
    			attr_dev(span0, "class", "orange svelte-r8vz9m");
    			add_location(span0, file$3, 335, 14, 8400);
    			add_location(p0, file$3, 334, 12, 8382);
    			attr_dev(span1, "class", "orange svelte-r8vz9m");
    			add_location(span1, file$3, 342, 14, 8702);
    			add_location(p1, file$3, 340, 12, 8655);
    			attr_dev(span2, "class", "orange svelte-r8vz9m");
    			add_location(span2, file$3, 348, 14, 8915);
    			attr_dev(span3, "class", "orange svelte-r8vz9m");
    			add_location(span3, file$3, 350, 14, 8990);
    			add_location(p2, file$3, 346, 12, 8870);
    			attr_dev(div, "class", "center container svelte-r8vz9m");
    			add_location(div, file$3, 332, 10, 8312);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, span0);
    			append_dev(p0, t3);
    			append_dev(div, t4);
    			append_dev(div, p1);
    			append_dev(p1, t5);
    			append_dev(p1, span1);
    			append_dev(p1, t7);
    			append_dev(div, t8);
    			append_dev(div, p2);
    			append_dev(p2, t9);
    			append_dev(p2, span2);
    			append_dev(p2, t11);
    			append_dev(p2, span3);
    			append_dev(p2, t13);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(332:8) {#if currentDisp == 'about'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*displayMenu*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(window, "message", /*handleMessage*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*displayMenu*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function postRequest(endpoint, args) {
    	var xhr = new XMLHttpRequest();
    	xhr.open("POST", `http://izone/${endpoint}`, true);
    	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    	xhr.send(JSON.stringify(args));
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const { open, close: closeModal } = getContext("simple-modal");
    	let { displayMenu = false } = $$props;
    	let { currentDisp = "help" } = $$props;
    	let { isInUse = false } = $$props;
    	let { points = [] } = $$props;
    	const debug = false;
    	let { zones = [] } = $$props;

    	function close(event) {
    		$$invalidate(0, displayMenu = false);
    		postRequest("close", {});
    	}

    	function handleMessage(event) {
    		if (event.data.openMenu) {
    			$$invalidate(0, displayMenu = true);
    			$$invalidate(2, isInUse = event.data.isInUse);
    			$$invalidate(12, points = event.data.points);
    			$$invalidate(3, zones = event.data.zones);
    		} else if (event.data.openPrompt) {
    			openZoneNamePrompt();
    		} else if (event.data.refreshZones) {
    			$$invalidate(3, zones = event.data.zones);
    		}
    	}

    	function switchTabTo(val) {
    		$$invalidate(1, currentDisp = val.toElement.id);
    	}

    	function openZoneNamePrompt() {
    		open(
    			ZoneNameModal,
    			{
    				onSubmited: val => {
    					postRequest("save", val);
    					closeModal();
    				}
    			},
    			{ closeOnOuterClick: false }
    		);
    	}

    	function tpToSelected(val) {
    		let id = val.toElement.id;
    		let coords = zones[id].center;
    		postRequest("tp", coords);
    		$$invalidate(0, displayMenu = false);
    	}

    	function deleteRequested(zone) {
    		open(ConfirmMordal, {
    			message: `Are you sure you want to delete ${zone.name}?\nThis action cannot be undone.`,
    			onAccepted: () => {
    				closeModal();
    				postRequest("delete", { id: zone.id });
    				$$invalidate(0, displayMenu = false);
    			},
    			onRefused: () => {
    				closeModal();
    			}
    		});
    	}

    	function createZone(val) {
    		postRequest("create", {});
    		$$invalidate(0, displayMenu = false);
    	}

    	function stopZone(val) {
    		postRequest("stop", {});
    		$$invalidate(0, displayMenu = false);
    	}

    	function saveZone(val) {

    		if (points.length <= 2) {
    			postRequest("checkSave", { error: true });
    		} else {
    			postRequest("checkSsave", { error: false });
    		}
    	}

    	const writable_props = ["displayMenu", "currentDisp", "isInUse", "points", "zones"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Content", $$slots, []);
    	const click_handler = zone => deleteRequested(zone);

    	$$self.$set = $$props => {
    		if ("displayMenu" in $$props) $$invalidate(0, displayMenu = $$props.displayMenu);
    		if ("currentDisp" in $$props) $$invalidate(1, currentDisp = $$props.currentDisp);
    		if ("isInUse" in $$props) $$invalidate(2, isInUse = $$props.isInUse);
    		if ("points" in $$props) $$invalidate(12, points = $$props.points);
    		if ("zones" in $$props) $$invalidate(3, zones = $$props.zones);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		ConfirmModal: ConfirmMordal,
    		ZoneNameModal,
    		open,
    		closeModal,
    		displayMenu,
    		currentDisp,
    		isInUse,
    		points,
    		debug,
    		zones,
    		postRequest,
    		close,
    		handleMessage,
    		switchTabTo,
    		openZoneNamePrompt,
    		tpToSelected,
    		deleteRequested,
    		createZone,
    		stopZone,
    		saveZone
    	});

    	$$self.$inject_state = $$props => {
    		if ("displayMenu" in $$props) $$invalidate(0, displayMenu = $$props.displayMenu);
    		if ("currentDisp" in $$props) $$invalidate(1, currentDisp = $$props.currentDisp);
    		if ("isInUse" in $$props) $$invalidate(2, isInUse = $$props.isInUse);
    		if ("points" in $$props) $$invalidate(12, points = $$props.points);
    		if ("zones" in $$props) $$invalidate(3, zones = $$props.zones);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		displayMenu,
    		currentDisp,
    		isInUse,
    		zones,
    		close,
    		handleMessage,
    		switchTabTo,
    		tpToSelected,
    		deleteRequested,
    		createZone,
    		stopZone,
    		saveZone,
    		points,
    		debug,
    		click_handler
    	];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			displayMenu: 0,
    			currentDisp: 1,
    			isInUse: 2,
    			points: 12,
    			debug: 13,
    			zones: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get displayMenu() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayMenu(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentDisp() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentDisp(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isInUse() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isInUse(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get points() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set points(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get debug() {
    		return this.$$.ctx[13];
    	}

    	set debug(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zones() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zones(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.23.2 */

    // (6:0) <Modal>
    function create_default_slot(ctx) {
    	let content;
    	let current;
    	content = new Content({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(content.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(content, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(6:0) <Modal>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Modal, Content });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
