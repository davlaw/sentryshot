// SPDX-License-Identifier: GPL-2.0-or-later
// @ts-check

import { uidReset } from "../libs/common.js";
import {
	newForm,
	newNumberField,
	inputRules,
	fieldTemplate,
	newSelectCustomField,
	newPasswordField,
	$getInputAndError,
} from "./form.js";

/**
 * @template T
 * @typedef {import("./form.js").Field<T>} Field
 */

describe("newForm", () => {
	test("logic", () => {
		let initCalled = false;
		let validateCalled = false;
		let setValue;

		const mockField = {
			field: {
				html: "html",
				init() {
					initCalled = true;
				},
				/** @param {any} input */
				set(input) {
					setValue = input;
				},
				validate() {
					validateCalled = true;
				},
				value() {
					return setValue;
				},
			},
		};
		const fieldValue = () => {
			const tmp = {};
			form.get(tmp);
			return tmp["field"];
		};

		const form = newForm(mockField);
		document.body.innerHTML = form.html();

		expect(initCalled).toBe(false);
		form.init();
		expect(initCalled).toBe(true);

		expect(setValue).toBeUndefined();
		form.set({ field: true });
		expect(setValue).toBe(true);
		expect(fieldValue()).toBe(true);

		form.reset();
		expect(setValue).toBeUndefined();
		expect(fieldValue()).toBeUndefined();

		expect(validateCalled).toBe(false);
		form.validate();
		expect(validateCalled).toBe(true);

		form.set(undefined);
		expect(setValue).toBeUndefined();
		expect(fieldValue()).toBeUndefined();
	});

	const newTestForm = () => {
		return newForm({
			field: {
				html: "html",
			},
		});
	};
	describe("saveBtn", () => {
		test("rendering", () => {
			uidReset();
			const form = newTestForm();
			form.addButton("save", () => {});

			const expected = `
				<ul class="form" style="padding: 0 0.1rem;">
					html
					<div class="form-button-wrapper">
						<button id="uid1" class="form-button save-btn">
							<span>Save</span>
						</button>
					</div>
				</ul>`.replaceAll(/\s/g, "");

			const actual = form.html().replaceAll(/\s/g, "");
			expect(actual).toEqual(expected);
		});
		test("onClick", () => {
			const form = newTestForm();

			let clicked = false;
			const onSave = () => {
				clicked = true;
			};
			form.addButton("save", onSave);
			document.body.innerHTML = form.html();
			form.init();

			form.buttons()["save"].element().click();

			expect(clicked).toBe(true);
		});
	});
	describe("deleteBtn", () => {
		test("rendering", () => {
			uidReset();
			const form = newTestForm();
			form.addButton("delete", () => {});

			const expected = `
				<ul class="form" style="padding: 0 0.1rem;">
					html
					<div class="form-button-wrapper">
						<button id="uid1" class="form-button delete-btn">
							<span>Delete</span>
						</button>
					</div>
				</ul>`.replaceAll(/\s/g, "");

			const actual = form.html().replaceAll(/\s/g, "");
			expect(actual).toEqual(expected);
		});
		test("onClick", () => {
			const form = newTestForm();

			let clicked = false;
			const onDelete = () => {
				clicked = true;
			};
			form.addButton("delete", onDelete);
			document.body.innerHTML = form.html();
			form.init();

			// @ts-ignore
			form.buttons()["delete"].element().click();

			expect(clicked).toBe(true);
		});
	});
	test("saveAndDeleteBtn", () => {
		uidReset();
		const form = newTestForm();
		form.addButton("save", () => {});
		form.addButton("delete", () => {});

		const expected = `
			<ul class="form" style="padding: 0 0.1rem;">
				html
				<div class="form-button-wrapper">
					<button id="uid1" class="form-button save-btn">
						<span>Save</span>
					</button>
					<button id="uid2" class="form-button delete-btn">
						<span>Delete</span>
					</button>
			</div>
		</ul>`.replaceAll(/\s/g, "");

		const actual = form.html().replaceAll(/\s/g, "");
		expect(actual).toEqual(expected);
	});
});

describe("newField", () => {
	const newTestField = () => {
		return newNumberField(
			{
				errorField: true,
				input: "number",
				min: 2,
				max: 4,
				step: 0.5,
			},
			{
				label: "a",
				placeholder: "b",
				initial: 3,
			}
		);
	};
	test("rendering", () => {
		const expected = `
		<li id="js-uid1" class="form-field-error">
			<label for="uid1" class="form-field-label">a</label>
			<input
				id="uid1"
				class="js-input settings-input-text"
				type="number"
				placeholder="b"
				min="2"
				max="4"
				step="0.5"
			/>
			<span class="settings-error js-error"></span>
		</li>`.replaceAll(/\s/g, "");

		uidReset();
		const actual = newTestField().html.replaceAll(/\s/g, "");
		expect(actual).toBe(expected);
	});
	test("validate", () => {
		const field = newTestField();
		document.body.innerHTML = field.html;
		field.init();

		field.set(1);
		expect(field.validate()).toBe(`"a": Constraints not satisfied`);
		field.set(3);
		expect(field.validate()).toBeUndefined();
		field.set(5);
		expect(field.validate()).toBe(`"a": Constraints not satisfied`);
	});
});

/** @typedef {import("./form.js").InputRule} InputRule */

describe("inputRules", () => {
	/**
	 * @param {[string, boolean][]} cases
	 * @param {InputRule} rule
	 */
	const testRule = (cases, rule) => {
		for (const tc of cases) {
			const input = tc[0];
			const expected = !tc[1];
			if (rule[0].test(input) !== expected) {
				return false;
			}
		}
		return true;
	};

	test("noSpaces", () => {
		/** @type {[string, boolean][]} */
		const cases = [
			["", true],
			[" ", false],
		];
		expect(testRule(cases, inputRules.noSpaces)).toBeTruthy();
	});
	test("notEmpty", () => {
		/** @type {[string, boolean][]} */
		const cases = [
			["", false],
			["a", true],
		];
		expect(testRule(cases, inputRules.notEmpty)).toBeTruthy();
	});
	test("englishOnly", () => {
		/** @type {[string, boolean][]} */
		const cases = [
			["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", true],
			["&", false],
		];
		expect(testRule(cases, inputRules.englishOnly)).toBeTruthy();
	});
});

describe("fieldTemplate", () => {
	/** @param {Field<number|string>} field */
	const testNotEmpty = (field) => {
		field.set("");
		expect(field.validate()).not.toBe("");
	};
	/** @param {Field<number|string>} field */
	const testNoSpace = (field) => {
		field.set(" ");
		expect(field.validate()).not.toBe("");
	};
	/** @param {Field<number|string>} field */
	const testReset = (field) => {
		field.set(1);
		expect([1, "1"]).toContain(field.value());

		field.set(undefined);
		expect([0, ""]).toContain(field.value());
	};
	const testOnChange = () => {
		const element = document.querySelector("#js-uid1");
		const [$input, $error] = $getInputAndError(element);
		expect($error.innerHTML).toBe("");

		$input.value = "";
		const e = new Event("change");
		$input.dispatchEvent(e);

		expect($error.innerHTML).not.toBe("");
	};

	test("text", () => {
		uidReset();
		const field = fieldTemplate.text("1", "2");

		const expected = `
		<li
			id="js-uid1"
			class="form-field-error"
		>
			<label for="uid1" class="form-field-label">1</label>
			<input
				id="uid1"
				class="js-input settings-input-text"
				type="text"
				placeholder="2"
			/>
			<span class="settings-error js-error"></span>
		</li>`.replaceAll(/\s/g, "");

		const actual = field.html.replaceAll(/\s/g, "");
		expect(actual).toEqual(expected);

		document.body.innerHTML = field.html;
		field.init();

		field.set("x");
		expect(field.validate()).toBeUndefined();
		testNotEmpty(field);
		testNoSpace(field);
		testReset(field);

		testOnChange();
	});
	test("integer", () => {
		uidReset();
		const field = fieldTemplate.integer("1", "2");

		const expected = `
		<li
			id="js-uid1"
			class="form-field-error"
		>
			<label for="uid1" class="form-field-label">1</label>
			<input
				id="uid1"
				class="js-input settings-input-text"
				type="number"
				placeholder="2"
				min="0"
				step="1"
			/>
			<span class="settings-error js-error"></span>
		</li>`.replaceAll(/\s/g, "");

		const actual = field.html.replaceAll(/\s/g, "");
		expect(actual).toEqual(expected);

		document.body.innerHTML = field.html;
		field.init();

		field.set(5);
		expect(field.validate()).toBeUndefined();

		testNotEmpty(field);
		testNoSpace(field);
		testReset(field);

		//testOnChange();
	});

	test("toggle", () => {
		uidReset();
		const field = fieldTemplate.toggle("1", true);

		const expected = `
		<li id="js-uid1" class="form-field">
			<label for="uid1" class="form-field-label">1</label>
			<div class="form-field-select-container">
				<select id="uid1" class="js-input form-field-select">
					<option>true</option>
					<option>false</option>
				</select>
			</div>
		</li>`.replaceAll(/\s/g, "");

		const actual = field.html.replaceAll(/\s/g, "");
		expect(actual).toEqual(expected);

		document.body.innerHTML = field.html;
		field.init();

		expect(field.value()).toBe(true);
		field.set(false);
		expect(field.value()).toBe(false);
		field.set(undefined);
		expect(field.value()).toBe(true);
	});

	test("select", () => {
		uidReset();
		const field = fieldTemplate.select("1", ["a", "b", "c"], "a");

		const expected = `
		<li id="js-uid1" class="form-field">
			<label for="uid1" class="form-field-label">1</label>
			<div class="form-field-select-container">
				<select id="uid1" class="js-input form-field-select">
					<option>a</option>
					<option>b</option>
					<option>c</option>
				</select>
			</div>
		</li>`.replaceAll(/\s/g, "");

		const actual = field.html.replaceAll(/\s/g, "");
		expect(actual).toEqual(expected);

		document.body.innerHTML = field.html;
		field.init();

		expect(field.value()).toBe("a");
		field.set("b");
		expect(field.value()).toBe("b");
		field.set(undefined);
		expect(field.value()).toBe("a");
	});

	test("selectCustom", () => {
		uidReset();
		const field = fieldTemplate.selectCustom("y", ["a", "b", "c"], "a");

		const expected = `
		<li id="js-uid1" class="form-field-error">
			<label for="uid1" class="form-field-label">y</label>
			<div class="form-field-select-container">
				<select id="uid1" class="js-input form-field-select">
					<option>a</option>
					<option>b</option>
					<option>c</option>
				</select>
				<button class="js-edit-btn form-field-edit-btn">
					<img
						class="form-field-edit-btn-img"
						src="assets/icons/feather/edit-3.svg"
					/>
				</button>
				</div>
			<span class="settings-error js-error"></span>
		</li>`.replaceAll(/\s/g, "");

		const actual = field.html.replaceAll(/\s/g, "");
		expect(actual).toEqual(expected);

		document.body.innerHTML = field.html;
		field.init();

		testNotEmpty(field);
		field.set("x");
		expect(field.validate()).toBeUndefined();

		field.set("a");
		expect(field.value()).toBe("a");
		field.set(undefined);
		expect(field.value()).toBe("a");

		window.prompt = () => {
			return "custom";
		};
		document.querySelector("button").click();

		expect(field.value()).toBe("custom");

		const $input = document.querySelector("#uid1");
		const $error = document.querySelector(".js-error");

		const change = new Event("change");
		$input.dispatchEvent(change);

		expect($error.innerHTML).toBe("");
	});
});

describe("selectCustomField", () => {
	test("noRules", () => {
		uidReset();
		const field = newSelectCustomField([], ["a", "b", "c"], {
			label: "d",
			initial: "e",
		});

		const expected = `
		<li id="js-uid1" class="form-field">
			<label for="uid1" class="form-field-label">d</label>
			<div class="form-field-select-container">
				<select id="uid1" class="js-input form-field-select">
					<option>a</option>
					<option>b</option>
					<option>c</option>
				</select>
				<button class="js-edit-btn form-field-edit-btn">
					<img
						class="form-field-edit-btn-img"
						src="assets/icons/feather/edit-3.svg"
					/>
				</button>
				</div>
		</li>`.replaceAll(/\s/g, "");

		const actual = field.html.replaceAll(/\s/g, "");
		expect(actual).toEqual(expected);

		document.body.innerHTML = field.html;
		field.init();

		field.set("x");
		expect(field.validate()).toBeUndefined();

		field.set("a");
		expect(field.value()).toBe("a");
		field.set("");
		expect(field.value()).toBe("");

		window.prompt = () => {
			return "custom";
		};
		document.querySelector("button").click();

		expect(field.value()).toBe("custom");
	});
});

describe("passwordField", () => {
	test("rendering", () => {
		uidReset();
		const expected = `
			<li id="js-uid1" class="form-field-error">
				<label for="uid1" class="form-field-label">New password</label>
				<input
					id="uid1"
					class="js-input settings-input-text"
					type="password"
				/>
				<span class="settings-error js-error"></span>
			</li>
			<li id="js-uid2" class="form-field-error">
				<label for="uid2" class="form-field-label">Repeat password</label>
				<input
					id="uid2"
					class="js-input settings-input-text"
					type="password"
				/>
				<span class="settings-error js-error"></span>
			</li>

		`.replaceAll(/\s/g, "");

		const actual = newPasswordField().html.replaceAll(/\s/g, "");

		expect(actual).toEqual(expected);
	});
	describe("logic", () => {
		let field, $newInput, $newError, $repeatInput, $repeatError;

		beforeEach(() => {
			uidReset();
			document.body.innerHTML = "<div></div>";
			field = newPasswordField();
			const $div = document.querySelector("div");
			$div.innerHTML = field.html;
			field.init($div);

			[$newInput, $newError] = $getInputAndError(
				document.querySelector("#js-uid1")
			);
			[$repeatInput, $repeatError] = $getInputAndError(
				document.querySelector("#js-uid2")
			);
		});
		const change = new Event("change");

		test("initial", () => {
			$newInput.dispatchEvent(change);
			$repeatInput.dispatchEvent(change);

			expect($newError.textContent).toBe("");
			expect($repeatError.textContent).toBe("");
		});
		test("repeatPassword", () => {
			$newInput.value = "A";
			$newInput.dispatchEvent(change);
			expect($newError.textContent).toBe("warning: weak password");
			expect($repeatError.textContent).toBe("repeat password");
			expect(field.validate()).toBe("repeat password");
		});
		test("reset", () => {
			field.set("");
			expect($newError.textContent).toBe("");
			expect($repeatError.textContent).toBe("");
		});
		test("strength", () => {
			$newInput.value = "AAAAA1";
			$newInput.dispatchEvent(change);
			expect($newError.textContent).toBe("strength: medium");
		});
		test("mismatch", () => {
			$repeatInput.value = "x";
			$repeatInput.dispatchEvent(change);
			expect($repeatError.textContent).toBe("Passwords do not match");
			expect(field.validate()).toBe("Passwords do not match");
			expect(field.value()).toBe("x");
		});
		test("validate", () => {
			field.set("AAAAAa1@");
			expect(field.validate()).toBeUndefined();
		});
	});
});
