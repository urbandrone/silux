// silux 0.7.0 | MIT | https://github.com/urbandrone/silux
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.silux = {}));
})(this, (function (exports) { 'use strict';

    function createElement(tagName, options) {
        return document.createElement(tagName, options);
    }
    function createElementNS(namespaceURI, qualifiedName, options) {
        return document.createElementNS(namespaceURI, qualifiedName, options);
    }
    function createDocumentFragment() {
        return parseFragment(document.createDocumentFragment());
    }
    function createTextNode(text) {
        return document.createTextNode(text);
    }
    function createComment(text) {
        return document.createComment(text);
    }
    function insertBefore(parentNode, newNode, referenceNode) {
        if (isDocumentFragment$1(parentNode)) {
            var node = parentNode;
            while (node && isDocumentFragment$1(node)) {
                var fragment = parseFragment(node);
                node = fragment.parent;
            }
            parentNode = node !== null && node !== void 0 ? node : parentNode;
        }
        if (isDocumentFragment$1(newNode)) {
            newNode = parseFragment(newNode, parentNode);
        }
        if (referenceNode && isDocumentFragment$1(referenceNode)) {
            referenceNode = parseFragment(referenceNode).firstChildNode;
        }
        parentNode.insertBefore(newNode, referenceNode);
    }
    function removeChild(node, child) {
        node.removeChild(child);
    }
    function appendChild(node, child) {
        if (isDocumentFragment$1(child)) {
            child = parseFragment(child, node);
        }
        node.appendChild(child);
    }
    function parentNode(node) {
        if (isDocumentFragment$1(node)) {
            while (node && isDocumentFragment$1(node)) {
                var fragment = parseFragment(node);
                node = fragment.parent;
            }
            return node !== null && node !== void 0 ? node : null;
        }
        return node.parentNode;
    }
    function nextSibling(node) {
        var _a;
        if (isDocumentFragment$1(node)) {
            var fragment = parseFragment(node);
            var parent = parentNode(fragment);
            if (parent && fragment.lastChildNode) {
                var children = Array.from(parent.childNodes);
                var index = children.indexOf(fragment.lastChildNode);
                return (_a = children[index + 1]) !== null && _a !== void 0 ? _a : null;
            }
            return null;
        }
        return node.nextSibling;
    }
    function tagName(elm) {
        return elm.tagName;
    }
    function setTextContent(node, text) {
        node.textContent = text;
    }
    function getTextContent(node) {
        return node.textContent;
    }
    function isElement$1(node) {
        return node.nodeType === 1;
    }
    function isText(node) {
        return node.nodeType === 3;
    }
    function isComment(node) {
        return node.nodeType === 8;
    }
    function isDocumentFragment$1(node) {
        return node.nodeType === 11;
    }
    function parseFragment(fragmentNode, parentNode) {
        var _a, _b, _c;
        var fragment = fragmentNode;
        (_a = fragment.parent) !== null && _a !== void 0 ? _a : (fragment.parent = parentNode !== null && parentNode !== void 0 ? parentNode : null);
        (_b = fragment.firstChildNode) !== null && _b !== void 0 ? _b : (fragment.firstChildNode = fragmentNode.firstChild);
        (_c = fragment.lastChildNode) !== null && _c !== void 0 ? _c : (fragment.lastChildNode = fragmentNode.lastChild);
        return fragment;
    }
    var htmlDomApi = {
        createElement: createElement,
        createElementNS: createElementNS,
        createTextNode: createTextNode,
        createDocumentFragment: createDocumentFragment,
        createComment: createComment,
        insertBefore: insertBefore,
        removeChild: removeChild,
        appendChild: appendChild,
        parentNode: parentNode,
        nextSibling: nextSibling,
        tagName: tagName,
        setTextContent: setTextContent,
        getTextContent: getTextContent,
        isElement: isElement$1,
        isText: isText,
        isComment: isComment,
        isDocumentFragment: isDocumentFragment$1,
    };

    function vnode(sel, data, children, text, elm) {
        var key = data === undefined ? undefined : data.key;
        return { sel: sel, data: data, children: children, text: text, elm: elm, key: key };
    }

    var array = Array.isArray;
    function primitive(s) {
        return (typeof s === "string" ||
            typeof s === "number" ||
            s instanceof String ||
            s instanceof Number);
    }

    function isUndef(s) {
        return s === undefined;
    }
    function isDef(s) {
        return s !== undefined;
    }
    var emptyNode = vnode("", {}, [], undefined, undefined);
    function sameVnode(vnode1, vnode2) {
        var _a, _b;
        var isSameKey = vnode1.key === vnode2.key;
        var isSameIs = ((_a = vnode1.data) === null || _a === void 0 ? void 0 : _a.is) === ((_b = vnode2.data) === null || _b === void 0 ? void 0 : _b.is);
        var isSameSel = vnode1.sel === vnode2.sel;
        var isSameTextOrFragment = !vnode1.sel && vnode1.sel === vnode2.sel
            ? typeof vnode1.text === typeof vnode2.text
            : true;
        return isSameSel && isSameKey && isSameIs && isSameTextOrFragment;
    }
    /**
     * @todo Remove this function when the document fragment is considered stable.
     */
    function documentFragmentIsNotSupported() {
        throw new Error("The document fragment is not supported on this platform.");
    }
    function isElement(api, vnode) {
        return api.isElement(vnode);
    }
    function isDocumentFragment(api, vnode) {
        return api.isDocumentFragment(vnode);
    }
    function createKeyToOldIdx(children, beginIdx, endIdx) {
        var _a;
        var map = {};
        for (var i = beginIdx; i <= endIdx; ++i) {
            var key = (_a = children[i]) === null || _a === void 0 ? void 0 : _a.key;
            if (key !== undefined) {
                map[key] = i;
            }
        }
        return map;
    }
    var hooks = [
        "create",
        "update",
        "remove",
        "destroy",
        "pre",
        "post" ];
    function init(modules, domApi, options) {
        var cbs = {
            create: [],
            update: [],
            remove: [],
            destroy: [],
            pre: [],
            post: [],
        };
        var api = domApi !== undefined ? domApi : htmlDomApi;
        for (var hook of hooks) {
            for (var module of modules) {
                var currentHook = module[hook];
                if (currentHook !== undefined) {
                    cbs[hook].push(currentHook);
                }
            }
        }
        function emptyNodeAt(elm) {
            var id = elm.id ? "#" + elm.id : "";
            // elm.className doesn't return a string when elm is an SVG element inside a shadowRoot.
            // https://stackoverflow.com/questions/29454340/detecting-classname-of-svganimatedstring
            var classes = elm.getAttribute("class");
            var c = classes ? "." + classes.split(" ").join(".") : "";
            return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
        }
        function emptyDocumentFragmentAt(frag) {
            return vnode(undefined, {}, [], undefined, frag);
        }
        function createRmCb(childElm, listeners) {
            return function rmCb() {
                if (--listeners === 0) {
                    var parent = api.parentNode(childElm);
                    api.removeChild(parent, childElm);
                }
            };
        }
        function createElm(vnode, insertedVnodeQueue) {
            var _a, _b, _c, _d;
            var i;
            var data = vnode.data;
            if (data !== undefined) {
                var init = (_a = data.hook) === null || _a === void 0 ? void 0 : _a.init;
                if (isDef(init)) {
                    init(vnode);
                    data = vnode.data;
                }
            }
            var children = vnode.children;
            var sel = vnode.sel;
            if (sel === "!") {
                if (isUndef(vnode.text)) {
                    vnode.text = "";
                }
                vnode.elm = api.createComment(vnode.text);
            }
            else if (sel !== undefined) {
                // Parse selector
                var hashIdx = sel.indexOf("#");
                var dotIdx = sel.indexOf(".", hashIdx);
                var hash = hashIdx > 0 ? hashIdx : sel.length;
                var dot = dotIdx > 0 ? dotIdx : sel.length;
                var tag = hashIdx !== -1 || dotIdx !== -1
                    ? sel.slice(0, Math.min(hash, dot))
                    : sel;
                var elm = (vnode.elm =
                    isDef(data) && isDef((i = data.ns))
                        ? api.createElementNS(i, tag, data)
                        : api.createElement(tag, data));
                if (hash < dot)
                    { elm.setAttribute("id", sel.slice(hash + 1, dot)); }
                if (dotIdx > 0)
                    { elm.setAttribute("class", sel.slice(dot + 1).replace(/\./g, " ")); }
                for (i = 0; i < cbs.create.length; ++i)
                    { cbs.create[i](emptyNode, vnode); }
                if (array(children)) {
                    for (i = 0; i < children.length; ++i) {
                        var ch = children[i];
                        if (ch != null) {
                            api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                        }
                    }
                }
                else if (primitive(vnode.text)) {
                    api.appendChild(elm, api.createTextNode(vnode.text));
                }
                var hook = vnode.data.hook;
                if (isDef(hook)) {
                    (_b = hook.create) === null || _b === void 0 ? void 0 : _b.call(hook, emptyNode, vnode);
                    if (hook.insert) {
                        insertedVnodeQueue.push(vnode);
                    }
                }
            }
            else if (((_c = options === null || options === void 0 ? void 0 : options.experimental) === null || _c === void 0 ? void 0 : _c.fragments) && vnode.children) {
                vnode.elm = ((_d = api.createDocumentFragment) !== null && _d !== void 0 ? _d : documentFragmentIsNotSupported)();
                for (i = 0; i < cbs.create.length; ++i)
                    { cbs.create[i](emptyNode, vnode); }
                for (i = 0; i < vnode.children.length; ++i) {
                    var ch$1 = vnode.children[i];
                    if (ch$1 != null) {
                        api.appendChild(vnode.elm, createElm(ch$1, insertedVnodeQueue));
                    }
                }
            }
            else {
                vnode.elm = api.createTextNode(vnode.text);
            }
            return vnode.elm;
        }
        function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
            for (; startIdx <= endIdx; ++startIdx) {
                var ch = vnodes[startIdx];
                if (ch != null) {
                    api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
                }
            }
        }
        function invokeDestroyHook(vnode) {
            var _a, _b;
            var data = vnode.data;
            if (data !== undefined) {
                (_b = (_a = data === null || data === void 0 ? void 0 : data.hook) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a, vnode);
                for (var i = 0; i < cbs.destroy.length; ++i)
                    { cbs.destroy[i](vnode); }
                if (vnode.children !== undefined) {
                    for (var j = 0; j < vnode.children.length; ++j) {
                        var child = vnode.children[j];
                        if (child != null && typeof child !== "string") {
                            invokeDestroyHook(child);
                        }
                    }
                }
            }
        }
        function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
            var _a, _b;
            for (; startIdx <= endIdx; ++startIdx) {
                var listeners = (void 0);
                var rm = (void 0);
                var ch = vnodes[startIdx];
                if (ch != null) {
                    if (isDef(ch.sel)) {
                        invokeDestroyHook(ch);
                        listeners = cbs.remove.length + 1;
                        rm = createRmCb(ch.elm, listeners);
                        for (var i = 0; i < cbs.remove.length; ++i)
                            { cbs.remove[i](ch, rm); }
                        var removeHook = (_b = (_a = ch === null || ch === void 0 ? void 0 : ch.data) === null || _a === void 0 ? void 0 : _a.hook) === null || _b === void 0 ? void 0 : _b.remove;
                        if (isDef(removeHook)) {
                            removeHook(ch, rm);
                        }
                        else {
                            rm();
                        }
                    }
                    else if (ch.children) {
                        // Fragment node
                        invokeDestroyHook(ch);
                        removeVnodes(parentElm, ch.children, 0, ch.children.length - 1);
                    }
                    else {
                        // Text node
                        api.removeChild(parentElm, ch.elm);
                    }
                }
            }
        }
        function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
            var oldStartIdx = 0;
            var newStartIdx = 0;
            var oldEndIdx = oldCh.length - 1;
            var oldStartVnode = oldCh[0];
            var oldEndVnode = oldCh[oldEndIdx];
            var newEndIdx = newCh.length - 1;
            var newStartVnode = newCh[0];
            var newEndVnode = newCh[newEndIdx];
            var oldKeyToIdx;
            var idxInOld;
            var elmToMove;
            var before;
            while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                if (oldStartVnode == null) {
                    oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
                }
                else if (oldEndVnode == null) {
                    oldEndVnode = oldCh[--oldEndIdx];
                }
                else if (newStartVnode == null) {
                    newStartVnode = newCh[++newStartIdx];
                }
                else if (newEndVnode == null) {
                    newEndVnode = newCh[--newEndIdx];
                }
                else if (sameVnode(oldStartVnode, newStartVnode)) {
                    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                    oldStartVnode = oldCh[++oldStartIdx];
                    newStartVnode = newCh[++newStartIdx];
                }
                else if (sameVnode(oldEndVnode, newEndVnode)) {
                    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newEndVnode = newCh[--newEndIdx];
                }
                else if (sameVnode(oldStartVnode, newEndVnode)) {
                    // Vnode moved right
                    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                    api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                    oldStartVnode = oldCh[++oldStartIdx];
                    newEndVnode = newCh[--newEndIdx];
                }
                else if (sameVnode(oldEndVnode, newStartVnode)) {
                    // Vnode moved left
                    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                    api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    if (oldKeyToIdx === undefined) {
                        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                    }
                    idxInOld = oldKeyToIdx[newStartVnode.key];
                    if (isUndef(idxInOld)) {
                        // New element
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    }
                    else {
                        elmToMove = oldCh[idxInOld];
                        if (elmToMove.sel !== newStartVnode.sel) {
                            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                        }
                        else {
                            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                            oldCh[idxInOld] = undefined;
                            api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                        }
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
            if (newStartIdx <= newEndIdx) {
                before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
                addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            }
            if (oldStartIdx <= oldEndIdx) {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }
        function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var hook = (_a = vnode.data) === null || _a === void 0 ? void 0 : _a.hook;
            (_b = hook === null || hook === void 0 ? void 0 : hook.prepatch) === null || _b === void 0 ? void 0 : _b.call(hook, oldVnode, vnode);
            var elm = (vnode.elm = oldVnode.elm);
            if (oldVnode === vnode)
                { return; }
            if (vnode.data !== undefined ||
                (isDef(vnode.text) && vnode.text !== oldVnode.text)) {
                (_c = vnode.data) !== null && _c !== void 0 ? _c : (vnode.data = {});
                (_d = oldVnode.data) !== null && _d !== void 0 ? _d : (oldVnode.data = {});
                for (var i = 0; i < cbs.update.length; ++i)
                    { cbs.update[i](oldVnode, vnode); }
                (_g = (_f = (_e = vnode.data) === null || _e === void 0 ? void 0 : _e.hook) === null || _f === void 0 ? void 0 : _f.update) === null || _g === void 0 ? void 0 : _g.call(_f, oldVnode, vnode);
            }
            var oldCh = oldVnode.children;
            var ch = vnode.children;
            if (isUndef(vnode.text)) {
                if (isDef(oldCh) && isDef(ch)) {
                    if (oldCh !== ch)
                        { updateChildren(elm, oldCh, ch, insertedVnodeQueue); }
                }
                else if (isDef(ch)) {
                    if (isDef(oldVnode.text))
                        { api.setTextContent(elm, ""); }
                    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
                }
                else if (isDef(oldCh)) {
                    removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                }
                else if (isDef(oldVnode.text)) {
                    api.setTextContent(elm, "");
                }
            }
            else if (oldVnode.text !== vnode.text) {
                if (isDef(oldCh)) {
                    removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                }
                api.setTextContent(elm, vnode.text);
            }
            (_h = hook === null || hook === void 0 ? void 0 : hook.postpatch) === null || _h === void 0 ? void 0 : _h.call(hook, oldVnode, vnode);
        }
        return function patch(oldVnode, vnode) {
            var i, elm, parent;
            var insertedVnodeQueue = [];
            for (i = 0; i < cbs.pre.length; ++i)
                { cbs.pre[i](); }
            if (isElement(api, oldVnode)) {
                oldVnode = emptyNodeAt(oldVnode);
            }
            else if (isDocumentFragment(api, oldVnode)) {
                oldVnode = emptyDocumentFragmentAt(oldVnode);
            }
            if (sameVnode(oldVnode, vnode)) {
                patchVnode(oldVnode, vnode, insertedVnodeQueue);
            }
            else {
                elm = oldVnode.elm;
                parent = api.parentNode(elm);
                createElm(vnode, insertedVnodeQueue);
                if (parent !== null) {
                    api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                    removeVnodes(parent, [oldVnode], 0, 0);
                }
            }
            for (i = 0; i < insertedVnodeQueue.length; ++i) {
                insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
            }
            for (i = 0; i < cbs.post.length; ++i)
                { cbs.post[i](); }
            return vnode;
        };
    }

    function addNS(data, children, sel) {
        data.ns = "http://www.w3.org/2000/svg";
        if (sel !== "foreignObject" && children !== undefined) {
            for (var i = 0; i < children.length; ++i) {
                var child = children[i];
                if (typeof child === "string")
                    { continue; }
                var childData = child.data;
                if (childData !== undefined) {
                    addNS(childData, child.children, child.sel);
                }
            }
        }
    }
    function h$2(sel, b, c) {
        var data = {};
        var children;
        var text;
        var i;
        if (c !== undefined) {
            if (b !== null) {
                data = b;
            }
            if (array(c)) {
                children = c;
            }
            else if (primitive(c)) {
                text = c.toString();
            }
            else if (c && c.sel) {
                children = [c];
            }
        }
        else if (b !== undefined && b !== null) {
            if (array(b)) {
                children = b;
            }
            else if (primitive(b)) {
                text = b.toString();
            }
            else if (b && b.sel) {
                children = [b];
            }
            else {
                data = b;
            }
        }
        if (children !== undefined) {
            for (i = 0; i < children.length; ++i) {
                if (primitive(children[i]))
                    { children[i] = vnode(undefined, undefined, undefined, children[i], undefined); }
            }
        }
        if (sel[0] === "s" &&
            sel[1] === "v" &&
            sel[2] === "g" &&
            (sel.length === 3 || sel[3] === "." || sel[3] === "#")) {
            addNS(data, children, sel);
        }
        return vnode(sel, data, children, text, undefined);
    }

    var CAPS_REGEX = /[A-Z]/g;
    function updateDataset(oldVnode, vnode) {
        var elm = vnode.elm;
        var oldDataset = oldVnode.data.dataset;
        var dataset = vnode.data.dataset;
        var key;
        if (!oldDataset && !dataset)
            { return; }
        if (oldDataset === dataset)
            { return; }
        oldDataset = oldDataset || {};
        dataset = dataset || {};
        var d = elm.dataset;
        for (key in oldDataset) {
            if (!dataset[key]) {
                if (d) {
                    if (key in d) {
                        delete d[key];
                    }
                }
                else {
                    elm.removeAttribute("data-" + key.replace(CAPS_REGEX, "-$&").toLowerCase());
                }
            }
        }
        for (key in dataset) {
            if (oldDataset[key] !== dataset[key]) {
                if (d) {
                    d[key] = dataset[key];
                }
                else {
                    elm.setAttribute("data-" + key.replace(CAPS_REGEX, "-$&").toLowerCase(), dataset[key]);
                }
            }
        }
    }
    var datasetModule = {
        create: updateDataset,
        update: updateDataset,
    };

    function invokeHandler(handler, vnode, event) {
        if (typeof handler === "function") {
            // call function handler
            handler.call(vnode, event, vnode);
        }
        else if (typeof handler === "object") {
            // call multiple handlers
            for (var i = 0; i < handler.length; i++) {
                invokeHandler(handler[i], vnode, event);
            }
        }
    }
    function handleEvent(event, vnode) {
        var name = event.type;
        var on = vnode.data.on;
        // call event handler(s) if exists
        if (on && on[name]) {
            invokeHandler(on[name], vnode, event);
        }
    }
    function createListener() {
        return function handler(event) {
            handleEvent(event, handler.vnode);
        };
    }
    function updateEventListeners(oldVnode, vnode) {
        var oldOn = oldVnode.data.on;
        var oldListener = oldVnode.listener;
        var oldElm = oldVnode.elm;
        var on = vnode && vnode.data.on;
        var elm = (vnode && vnode.elm);
        var name;
        // optimization for reused immutable handlers
        if (oldOn === on) {
            return;
        }
        // remove existing listeners which no longer used
        if (oldOn && oldListener) {
            // if element changed or deleted we remove all existing listeners unconditionally
            if (!on) {
                for (name in oldOn) {
                    // remove listener if element was changed or existing listeners removed
                    oldElm.removeEventListener(name, oldListener, false);
                }
            }
            else {
                for (name in oldOn) {
                    // remove listener if existing listener removed
                    if (!on[name]) {
                        oldElm.removeEventListener(name, oldListener, false);
                    }
                }
            }
        }
        // add new listeners which has not already attached
        if (on) {
            // reuse existing listener or create new
            var listener = (vnode.listener =
                oldVnode.listener || createListener());
            // update vnode for listener
            listener.vnode = vnode;
            // if element changed or added we add all needed listeners unconditionally
            if (!oldOn) {
                for (name in on) {
                    // add listener if element was changed or new listeners added
                    elm.addEventListener(name, listener, false);
                }
            }
            else {
                for (name in on) {
                    // add listener if new listener added
                    if (!oldOn[name]) {
                        elm.addEventListener(name, listener, false);
                    }
                }
            }
        }
    }
    var eventListenersModule = {
        create: updateEventListeners,
        update: updateEventListeners,
        destroy: updateEventListeners,
    };

    function updateProps(oldVnode, vnode) {
        var key;
        var cur;
        var old;
        var elm = vnode.elm;
        var oldProps = oldVnode.data.props;
        var props = vnode.data.props;
        if (!oldProps && !props)
            { return; }
        if (oldProps === props)
            { return; }
        oldProps = oldProps || {};
        props = props || {};
        for (key in props) {
            cur = props[key];
            old = oldProps[key];
            if (old !== cur && (key !== "value" || elm[key] !== cur)) {
                elm[key] = cur;
            }
        }
    }
    var propsModule = { create: updateProps, update: updateProps };

    // Bindig `requestAnimationFrame` like this fixes a bug in IE/Edge. See #360 and #409.
    var raf = (typeof window !== "undefined" &&
        window.requestAnimationFrame.bind(window)) ||
        setTimeout;
    var nextFrame = function (fn) {
        raf(function () {
            raf(fn);
        });
    };
    var reflowForced = false;
    function setNextFrame(obj, prop, val) {
        nextFrame(function () {
            obj[prop] = val;
        });
    }
    function updateStyle(oldVnode, vnode) {
        var cur;
        var name;
        var elm = vnode.elm;
        var oldStyle = oldVnode.data.style;
        var style = vnode.data.style;
        if (!oldStyle && !style)
            { return; }
        if (oldStyle === style)
            { return; }
        oldStyle = oldStyle || {};
        style = style || {};
        var oldHasDel = "delayed" in oldStyle;
        for (name in oldStyle) {
            if (!style[name]) {
                if (name[0] === "-" && name[1] === "-") {
                    elm.style.removeProperty(name);
                }
                else {
                    elm.style[name] = "";
                }
            }
        }
        for (name in style) {
            cur = style[name];
            if (name === "delayed" && style.delayed) {
                for (var name2 in style.delayed) {
                    cur = style.delayed[name2];
                    if (!oldHasDel || cur !== oldStyle.delayed[name2]) {
                        setNextFrame(elm.style, name2, cur);
                    }
                }
            }
            else if (name !== "remove" && cur !== oldStyle[name]) {
                if (name[0] === "-" && name[1] === "-") {
                    elm.style.setProperty(name, cur);
                }
                else {
                    elm.style[name] = cur;
                }
            }
        }
    }
    function applyDestroyStyle(vnode) {
        var style;
        var name;
        var elm = vnode.elm;
        var s = vnode.data.style;
        if (!s || !(style = s.destroy))
            { return; }
        for (name in style) {
            elm.style[name] = style[name];
        }
    }
    function applyRemoveStyle(vnode, rm) {
        var s = vnode.data.style;
        if (!s || !s.remove) {
            rm();
            return;
        }
        if (!reflowForced) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            vnode.elm.offsetLeft;
            reflowForced = true;
        }
        var name;
        var elm = vnode.elm;
        var i = 0;
        var style = s.remove;
        var amount = 0;
        var applied = [];
        for (name in style) {
            applied.push(name);
            elm.style[name] = style[name];
        }
        var compStyle = getComputedStyle(elm);
        var props = compStyle["transition-property"].split(", ");
        for (; i < props.length; ++i) {
            if (applied.indexOf(props[i]) !== -1)
                { amount++; }
        }
        elm.addEventListener("transitionend", function (ev) {
            if (ev.target === elm)
                { --amount; }
            if (amount === 0)
                { rm(); }
        });
    }
    function forceReflow() {
        reflowForced = false;
    }
    var styleModule = {
        pre: forceReflow,
        create: updateStyle,
        update: updateStyle,
        destroy: applyDestroyStyle,
        remove: applyRemoveStyle,
    };

    var _patch_ = init([ propsModule, styleModule, eventListenersModule, datasetModule ]);
    var h$1 = (function(selector, props, children) {
        return h$2(selector, ((!(null == props) && props.constructor === Object)
        ? props
        : Object.create(null)), children.map((function(child) {
          
        return ((typeof child === "number" && !(Number.isNaN(child)))
          ? String(child)
          : child);
      })));
    });
    var makeRenderer = (function(el) {
        return (function($el) {
          
        return (function(view, state, emit) {
              
          return (function(nextEl) {
                  
            $el = _patch_($el, nextEl);
            return $el;
          })(view(state, emit));
        });
      })(el);
    });

    var connect = (function(store, displays) {
        var displays = Array.prototype.slice.call(arguments, 1);

      return (function(dispatch, notify) {
          
        displays.forEach((function(display) {
              
          return (function(el, view) {
                  
            return (function(render) {
                      
              return store.subscribe((function(state) {
                          
                return el = render(view, state, dispatch);
              }));
            })(makeRenderer(el));
          })(display.el, display.view);
        }));
        return (function(action) {
              
          (function() {
            if (!(action == null)) {
              return dispatch(action);
            } else {
              return notify();
            }
          }).call(this);
          return null;
        });
      })(store.dispatch, store.notify);
    });

    var _effectful = (function() {
        function type$2(state, effects) {
        var self$2 = Object.create(type$2.prototype);
        var argCount$2 = arguments.length;
        (function() {
          if (!(argCount$2 === 2)) {
            return (function() {
              throw (new Error(("_effectful" + " received invalid number of arguments.")))
            }).call(this);
          }
        }).call(this);
        self$2.state = state;
        self$2.effects = effects;
        return self$2;
      }  type$2.is = (function(x$2) {
          
        return x$2 instanceof type$2;
      });
      return type$2;
    }).call(undefined);
    _effectful.prototype.run = (function(oldState, subscribers, dispatch) {
        return (function(self) {
          
        (function() {
          if (!(self.state === oldState)) {
            subscribers.forEach((function(updateSubscriber) {
                      
              return updateSubscriber({ state: self.state });
            }));
            return (function() {
              if ((Array.isArray(self.effects) && self.effects.length > 0)) {
                return requestAnimationFrame((function() {
                              
                  return self.effects.forEach((function(effect) {
                                  
                    return effect(dispatch, self.state);
                  }));
                }));
              }
            }).call(this);
          }
        }).call(this);
        return self;
      })(this);
    });
    _effectful.prototype.extract = (function() {
        return this.state;
    });
    var wrapEffectful = (function(update) {
        return (function(state, action, dispatch) {
          
        return (function(s) {
              
          (function() {
            if (!(_effectful.is(s))) {
              return s = _effectful(s, []);
            }
          }).call(this);
          return s;
        })(update(state, action, dispatch));
      });
    });
    var withEffects$1 = (function(state, effects) {
        var effects = Array.prototype.slice.call(arguments, 1);

      return _effectful(state, effects);
    });
    var makeStore = (function(initState, updateState, plugins) {
        plugins = (typeof plugins !== "undefined") ? plugins : [];
      return (function(state, preState, idle, subs, store, update) {
          
        store.getState = (function() {
              
          (function() {
            if (!(idle)) {
              return (function() {
                throw (new Error(("(silux/store.get-state) is disallowed during a dispatch")))
              }).call(this);
            }
          }).call(this);
          return { state: state };
        });
        store.dispatch = (function(action) {
              
          (function() {
            if (!(idle)) {
              return (function() {
                throw (new Error(("(silux/store.dispatch) is disallowed during a dispatch")))
              }).call(this);
            }
          }).call(this);
          return (function(dispatch) {
                  
            idle = false;
            preState = state;
            state = update(state, action, dispatch).run(preState, subs, dispatch).extract();
            idle = true;
            return store;
          })(store.dispatch);
        });
        store.subscribe = (function(subscription) {
              
          (function() {
            if (!(idle)) {
              return (function() {
                throw (new Error(("(silux/store.subscribe) is disallowed during a dispatch")))
              }).call(this);
            }
          }).call(this);
          (function() {
            if (!(subs.has(subscription))) {
              return subs.add(subscription);
            }
          }).call(this);
          return store;
        });
        store.notify = (function() {
              
          (function() {
            if (!(idle)) {
              return (function() {
                throw (new Error(("(silux/store.notify) is disallowed during a dispatch")))
              }).call(this);
            }
          }).call(this);
          subs.forEach((function(subscription) {
                  
            return subscription({ state: state });
          }));
          return store;
        });
        return plugins.reduce((function(pstore, addPlugin) {
              
          return addPlugin(pstore);
        }), store);
      })(initState, null, true, (new Set([])), Object.create(null), wrapEffectful(updateState));
    });
    var combineUpdates = (function(callUpdates) {
        var callUpdates = Array.prototype.slice.call(arguments, 0);

      return (function(state, action, dispatch) {
          
        return callUpdates.reduce((function(nextState, callUpdate) {
              
          return callUpdate(nextState, action, dispatch);
        }), state);
      });
    });

    var parseSearchParams = (function(params) {
        return Array.from((new URLSearchParams(params)).entries()).reduce((function(acc, key_value$1) {
          
        var key = key_value$1[0],
            value = key_value$1[1];
      
        acc[key] = value;
        return acc;
      }), Object.create(null));
    });
    var getBaseUri = (function() {
        return (function(host, http) {
          
        return document.body.baseURI.replace((http + "//" + host), "");
      })(window.location.host, window.location.protocol);
    });
    var getLocation = (function() {
        return {
        url: window.location.href,
        origin: window.location.origin,
        host: window.location.hostname,
        port: window.location.port,
        protocol: location.protocol,
        path: window.location.pathname,
        hash: window.location.hash,
        search: parseSearchParams(window.location.search)
      };
    });
    var getErrorRoute = (function(route) {
        return ("silux/route-error: found no matching route definition for " + route);
    });
    var partialMatch__QUERY = (function(a, b, i) {
        return b[i] === a;
    });
    var hole__QUERY = (function(x) {
        return partialMatch__QUERY(":", x, 0);
    });
    var notFoundRoute__QUERY = (function(x) {
        return (new RegExp("^404$", "g")).test(x);
    });
    var parts = (function(x) {
        return x.split((new RegExp("\\/", "g")));
    });
    var unslash = (function(x) {
        return x.replace((new RegExp("\\/+", "g")), "/").replace((new RegExp("^\\/|\\/$", "g")), "");
    });
    var specificity = (function(slug, path) {
        return (function(_slug, _path) {
          
        return (_slug === _path
          ? Infinity
          : notFoundRoute__QUERY(_slug)
          ? 0.5
          : (function(_p, _s) {
              
          return (function() {
            if (!(_p.length === _s.length)) {
              return 0;
            } else {
              return _s.reduce((function(a, s, i) {
                          
                return (function() {
                  if (hole__QUERY(s)) {
                    return (1 + a);
                  } else if (partialMatch__QUERY(s, _p, i)) {
                    return (2 + a);
                  } else {
                    return a;
                  }
                }).call(this);
              }), 0);
            }
          }).call(this);
        })(parts(_path), parts(_slug)));
      })(unslash(slug), unslash(path));
    });
    var params = (function(slug, path) {
        return (function(_slug, _path) {
          
        return _slug.reduce((function(a, s, i) {
              
          return (function() {
            if (hole__QUERY(s)) {
              return (function(key) {
                          
                a[key] = _path[i];
                return a;
              })(s.slice(1));
            } else {
              return a;
            }
          }).call(this);
        }), Object.create(null));
      })(parts(unslash(slug)), parts(unslash(path)));
    });
    var historyPush = (function(url, data) {
        data = (typeof data !== "undefined") ? data : null;
      return window.history.pushState(data, "", url);
    });
    var routeFinder = (function(base, routes) {
        return (function(path) {
          
        return routes.reduce((function(a, slug_view$1) {
              
          var slug = slug_view$1[0],
              view = slug_view$1[1];
        
          return (function(s) {
                  
            return (function() {
              if (s > 0) {
                return a.concat({
                  r: s,
                  s: slug,
                  p: params((base + slug), path),
                  v: view
                });
              } else {
                return a;
              }
            }).call(this);
          })(specificity((base + slug), path));
        }), []).sort((function(a, b) {
              
          return (a.r > b.r
            ? -1
            : b.r > a.r
            ? 1
            : 0);
        }))[0];
      });
    });
    var router = (function(routeMap) {
        return (function(finder) {
          
        return (function(state$1, emit) {
              
          var state = state$1.state;
        
          return (function(route) {
                  
            return (function() {
              if (!(route == null)) {
                return route.v({
                  state: state,
                  route: Object.assign({  }, getLocation(), {
                    params: route.p,
                    slug: route.s
                  })
                }, emit);
              } else {
                return getErrorRoute(window.location.pathname);
              }
            }).call(this);
          })(finder(window.location.pathname));
        });
      })(routeFinder(getBaseUri(), Object.entries(routeMap)));
    });
    var routerNavigate = (function() {
        function type$1(url, action) {
        var self$1 = Object.create(type$1.prototype);
        var argCount$1 = arguments.length;
        (function() {
          if (!(argCount$1 === 2)) {
            return (function() {
              throw (new Error(("routerNavigate" + " received invalid number of arguments.")))
            }).call(this);
          }
        }).call(this);
        self$1.url = url;
        self$1.action = action;
        return self$1;
      }  type$1.is = (function(x$1) {
          
        return x$1 instanceof type$1;
      });
      return type$1;
    }).call(undefined);
    var navigateTo = (function(url, action) {
        return routerNavigate(url, action);
    });
    var routerStore = (function() {
        return (function(store) {
          
        return (function(dispatch, notify, getState, pstore) {
              
          pstore.getState = (function() {
                  
            return {
              state: getState().state,
              route: getLocation()
            };
          });
          pstore.dispatch = (function(action) {
                  
            (function() {
              if (routerNavigate.is(action)) {
                historyPush(action.url);
                return (function() {
                  if (!(action.action == null)) {
                    return dispatch(action.action);
                  } else {
                    return notify();
                  }
                }).call(this);
              } else {
                return dispatch(action);
              }
            }).call(this);
            return pstore;
          });
          pstore.subscribe = store.subscribe;
          pstore.notify = notify;
          return (function() {
                  
            var config = { passive: true };
            var onleave = (function() {
                      
              window.removeEventListener("popstate", notify, config);
              return window.removeEventListener("beforeunload", onleave, config);
            });
            return (function() {
                      
              window.addEventListener("popstate", notify, config);
              window.addEventListener("beforeunload", onleave, config);
              return pstore;
            })();
          }).call(this);
        })(store.dispatch, store.notify, store.getState, Object.create(null));
      });
    });

    var siluxConnect = connect;
    var siluxStore = makeStore;
    var siluxFoldUpdates = combineUpdates;
    var withEffects = withEffects$1;
    var h = h$1;
    var siluxRouter = router;
    var siluxRouterPlugin = routerStore;
    var goRoute = navigateTo;

    exports.goRoute = goRoute;
    exports.h = h;
    exports.siluxConnect = siluxConnect;
    exports.siluxFoldUpdates = siluxFoldUpdates;
    exports.siluxRouter = siluxRouter;
    exports.siluxRouterPlugin = siluxRouterPlugin;
    exports.siluxStore = siluxStore;
    exports.withEffects = withEffects;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
