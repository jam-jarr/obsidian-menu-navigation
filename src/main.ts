import { Plugin } from "obsidian";

function isVisible(el: HTMLElement): boolean {
	if (!el.isConnected) return false;
	const style = window.getComputedStyle(el);
	if (style.display === "none") return false;
	if (style.visibility === "hidden") return false;
	if (Number(style.opacity) === 0) return false;
	const rect = el.getBoundingClientRect();
	return rect.width > 0 && rect.height > 0;
}

function getActiveSuggestionContainer(): HTMLElement | null {
	const containers = Array.from(
		document.querySelectorAll<HTMLElement>(".prompt"),
	);
	return containers.find(isVisible) ?? null;
}

function dispatchArrowKey(key: "ArrowDown" | "ArrowUp"): void {
	const code = key;
	const keyCode = key === "ArrowDown" ? 40 : 38;
	const evt = new KeyboardEvent("keydown", {
		key,
		code,
		bubbles: true,
		cancelable: true,
	});

	// Best-effort: some handlers still check keyCode/which.
	try {
		Object.defineProperty(evt, "keyCode", { get: () => keyCode });
		Object.defineProperty(evt, "which", { get: () => keyCode });
	} catch {
		// ignore
	}

	window.dispatchEvent(evt);
}

export default class EmacsNavigationPlugin extends Plugin {
	async onload() {
		// Use capture phase: built-in modals frequently stop propagation.
		this.registerDomEvent(
			window,
			"keydown",
			(evt: KeyboardEvent) => {
				if (!evt.ctrlKey) return;
				if (evt.altKey || evt.metaKey || evt.shiftKey) return;

				const downKeys = ['n', 'j'];
				const upKeys = ['p', 'k'];

				const container = getActiveSuggestionContainer();
				if (!container) return;

				const key = evt.key.toLowerCase();

				if (upKeys.contains(key)) {
					evt.preventDefault();
					evt.stopPropagation();
					if (typeof evt.stopImmediatePropagation === "function") {
						evt.stopImmediatePropagation();
					}
					dispatchArrowKey("ArrowUp");
				} else if (downKeys.contains(key)) {
					evt.preventDefault();
					evt.stopPropagation();
					if (typeof evt.stopImmediatePropagation === "function") {
						evt.stopImmediatePropagation();
					}
					dispatchArrowKey("ArrowDown");
				} else {
					return;
				}
			},
			{ capture: true },
		);
	}
}
