let ATTR = 'x-action';
let SELECTOR = `[${ATTR}]`;

let observer = new MutationObserver((mutations) => {
	for (let mutation of mutations) {
		if (mutation.type === 'attributes') {
			let target = mutation.target;

			if (target.hasAttribute(ATTR)) {
				bindActions(target);
			}
			else if (target.$binds) {
				node.$binds = null;
			}
		}
		else if (mutation.type === 'childList') {
			for (let node of mutation.removedNodes) {
				removeBind(node);
			}

			for (let node of mutation.addedNodes) {
				addBind(node);
			}
		}
	}
});

if (document.readyState === 'complete') {
	initialize();
}
else {
	document.addEventListener('DOMContentLoaded', initialize, { once: true });
}

function initialize () {
	let root = document.body;

	observer.observe(root, {
		childList: true,
		subtree: true,
		attributeFilter: [ATTR],
	});

	addBind(root);
}

function addBind (node) {
	if (node.nodeType !== Node.ELEMENT_NODE) {
		return;
	}

	if (node.hasAttribute(ATTR)) {
		bindActions(node);
	}

	for (let child of node.querySelectorAll(SELECTOR)) {
		bindActions(child);
	}
}

function removeBind (node) {
	if (node.$binds) {
		node.$binds = null;
	}

	for (let child of node.childNodes) {
		if (child.nodeType === Node.ELEMENT_NODE) {
			removeBind(child);
		}
	}
}

function bindActions (node) {
	let actions = node.getAttribute(ATTR).split(/\s+/);
	let binds = node.$binds = {};

	for (let action of actions) {
		let eventSep = action.lastIndexOf(':');
		let methodSep = Math.max(0, action.lastIndexOf('#')) || action.length;

		let event = action.slice(0, eventSep);
		let method = action.slice(methodSep + 1) || 'handleEvent';
		let tag = action.slice(eventSep + 1, methodSep);

		let isSelf = tag === 'this';

		if (!(isSelf ? node.localName : tag).includes('-')) {
			if (DEV) {
				console.warn(`cannot bind ${event} event to ${tag} because it is not a custom element`, node);
			}

			continue;
		}

		let target = isSelf ? node : node.parentElement.closest(tag);

		if (!target) {
			if (DEV) {
				console.warn(`cannot bind ${event} event to ${tag}#${method} because ${tag} is not in the ancestor tree`, node);
			}

			continue;
		}

		// there's a possibility that the controller hasn't been defined yet, if
		// that's the case we'll store a string and resolve it later.
		let _target = customElements.get(tag) ? target : tag;

		node.addEventListener(event, handleEvent);

		let current = binds[event];

		if (!current) {
			binds[event] = createEvent(_target, method);
			continue;
		}

		while (current.next) {
			current = current.next;
		}

		current.next = createEvent(_target, method);
	}
}

function handleEvent (event) {
	let node = event.currentTarget;
	let binds = node.$binds;

	if (!binds) {
		return;
	}

	let def = binds[event.type];

	while (def) {
		let method = def.method;
		let target = def.target;

		if (typeof target === 'string') {
			if (!customElements.get(target)) {
				if (DEV) {
					console.warn(`cannot fire ${event.type} event for ${target} because the controller is still not present.`, node);
				}

				def = def.next;
				continue;
			}

			target = def.target = node.closest(target);
		}

		if (target[method]) {
			target[method](event);
		}
		else if (DEV) {
			console.warn(`cannot fire ${event.type} event for ${target.localName}#${method} because it does not exist.`, node);
		}

		def = def.next;
	}
}

function createEvent (target, method) {
	return {
		target,
		method,
		next: null,
	};
}
