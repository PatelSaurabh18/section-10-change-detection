# Angular Change Detection (Default Strategy) - Summary

## What is Change Detection?

Change Detection is Angular's mechanism for keeping the UI synchronized with application data.

Whenever data changes, Angular checks whether the displayed values need to be updated and updates the DOM if necessary.

---

# Zone.js and Angular

Angular uses a library called **Zone.js**.

### Role of Zone.js

Zone.js wraps the entire Angular application inside a **Zone** and monitors asynchronous events such as:

- Button clicks
- Keyboard events
- HTTP requests
- Timers (`setTimeout`, `setInterval`)
- Promises
- Other browser events

Whenever one of these events occurs, Zone.js notifies Angular that something may have changed.

---

# Default Change Detection Process

When an event occurs (for example, a button click):

1. Zone.js detects the event.
2. Angular starts a Change Detection cycle.
3. Angular traverses the **entire component tree**.
4. Every component template is checked.
5. Every template binding is reevaluated.
6. Angular compares new values with previously rendered values.
7. If a value changed, Angular updates the real DOM.

---

# Template Bindings Checked During Change Detection

Angular reevaluates all template bindings, including:

### String Interpolation

```html
<p>{{ username }}</p>
```

### Property Binding

```html
<img [src]="imageUrl">
```

### Method Calls

```html
<p>{{ getName() }}</p>
```

### Getter Properties

```html
<p>{{ debugOutput }}</p>
```

All of these are executed again during every change detection cycle.

---

# Example from the Transcript

Suppose the user clicks an **Increment Counter** button.

Even though only the counter value changes:

- Angular still checks every component.
- Angular still reevaluates bindings in every component.
- Components unrelated to the counter are also visited.

This happens because the default strategy checks the entire application tree.

---

# Why Were So Many Logs Displayed?

A getter called `debugOutput` was used:

```typescript
get debugOutput() {
  console.log('Component checked');
  return '';
}
```

And in the template:

```html
{{ debugOutput }}
```

Since Angular reevaluates template bindings during change detection:

- Getter executes again.
- Console log appears again.

Because every component contains this getter, logs appear from all components.

---

# Important Rule About Getters

### Avoid Heavy Computation Inside Getters

Bad Example:

```typescript
get expensiveCalculation() {
  // Complex calculations
  return hugeArray.sort(...);
}
```

Why?

Because Angular may execute this getter many times during change detection.

This can cause performance problems.

---

# Performance Considerations

At first glance, checking every component sounds expensive.

However:

- Angular is highly optimized.
- Simple bindings are very cheap to evaluate.
- Most applications work perfectly fine with the default strategy.

Problems usually occur only when:

- Heavy computations are done in templates.
- Expensive getters are used.
- Large amounts of unnecessary work happen during checks.

---

# Component Tree Traversal

Default strategy behavior:

```text
AppComponent
│
├── HeaderComponent
│
├── SidebarComponent
│
├── ProductsComponent
│   ├── ProductComponent
│   └── ProductComponent
│
└── FooterComponent
```

If a button inside one ProductComponent is clicked:

```text
✔ AppComponent checked
✔ HeaderComponent checked
✔ SidebarComponent checked
✔ ProductsComponent checked
✔ ProductComponent checked
✔ ProductComponent checked
✔ FooterComponent checked
```

Entire tree is visited.

---

# DOM Update Optimization

Even though Angular checks all bindings:

Angular updates the DOM only when values actually change.

Example:

```typescript
name = "Max";
```

After change detection:

```typescript
name = "Max";
```

Since the value did not change:

```text
No DOM update
```

Only comparison happens.

---

# Why Does Angular Check Components Twice?

The transcript ends by introducing this question.

In Angular Development Mode:

- Angular runs Change Detection once.
- Then it immediately runs it again.

Purpose:

- Detect unintended side effects.
- Ensure bindings do not change during rendering.
- Help developers catch bugs early.

Therefore, you often see logs twice in development mode.

```text
Check #1
Check #2
```

In Production Mode:

```text
Only one check
```

because these extra safety checks are removed.

---

# Key Takeaways

## Zone.js

- Tracks asynchronous events.
- Notifies Angular when something may have changed.

## Default Change Detection

- Triggered after many browser events.
- Traverses the entire component tree.

## Template Bindings

Angular reevaluates:

- Interpolation
- Property bindings
- Method calls
- Getter properties

during every change detection cycle.

## DOM Updates

- Angular compares old and new values.
- Updates DOM only when values differ.

## Performance Rule

Avoid:

- Heavy getters
- Expensive method calls in templates

because they execute frequently.

## Development Mode

Angular performs two change detection passes to catch bugs.

## Production Mode

Angular performs a single optimized change detection pass.

---

# One-Line Summary

**By default, Angular uses Zone.js to detect asynchronous events, then runs change detection across the entire component tree, reevaluating all template bindings and updating the DOM only where values have changed.**


# Angular Change Detection Runs Twice in Development Mode

## Why Are Components Checked Twice?

In **Development Mode**, Angular runs Change Detection **twice** for every cycle.

Example:

```text
Change Detection #1
Change Detection #2
```

This is done only for debugging purposes.

In **Production Mode**, Angular runs it only once.

---

# Why Does Angular Do This?

Angular performs the second check to detect unexpected value changes.

It verifies that values found during the first check remain the same during the second check.

If a value changes between the two checks, Angular assumes there is a bug.

---

# Example of a Problematic Value

```typescript
get debugOutput() {
  return Math.random();
}
```

Every time this getter runs:

```text
0.45
0.78
```

A different value is returned.

So:

```text
First Check  -> 0.45
Second Check -> 0.78
```

Angular detects that the value changed unexpectedly and throws an error.

---

# ExpressionChangedAfterItHasBeenCheckedError

Error:

```text
ExpressionChangedAfterItHasBeenCheckedError
```

Meaning:

> A value changed after Angular already checked it.

Angular expected the value to stay the same during both development-mode checks, but it didn't.

---

# What Usually Causes This Error?

Common reasons:

- Using `Math.random()`
- Using `Date.now()`
- Modifying data inside getters
- Changing values during lifecycle hooks at the wrong time
- Updating UI data during rendering

Example (Bad):

```typescript
get username() {
  this.name = "Max";
  return this.name;
}
```

A getter should not change data.

---

# How to Fix It?

Make sure template bindings return stable values.

Good:

```typescript
get debugOutput() {
  return 'Checked';
}
```

Bad:

```typescript
get debugOutput() {
  return Math.random();
}
```

---

# Key Takeaways

### Development Mode

- Runs Change Detection twice.
- Helps find bugs.
- May show duplicate logs.
- Can throw `ExpressionChangedAfterItHasBeenCheckedError`.

### Production Mode

- Runs Change Detection once.
- No duplicate checks.
- Better performance.

### Error Meaning

```text
ExpressionChangedAfterItHasBeenCheckedError
```

= Angular found a value that changed between the first and second development-mode checks.

---

# One-Line Summary

**Angular runs Change Detection twice in Development Mode to catch unstable values and potential bugs before the application goes to Production.**



# Writing Efficient Angular Templates

Since Angular runs Change Detection frequently, template expressions should be simple and efficient.

---

# Best Practices

## 1. Keep Template Expressions Simple

Good:

```html
{{ username }}
{{ count }}
```

Bad:

```html
{{ expensiveCalculation() }}
```

Avoid complex calculations directly in templates.

---

## 2. Avoid Function Calls in Templates

Bad:

```html
{{ getFilteredUsers() }}
{{ calculateTotalPrice() }}
```

Reason:

- Functions are executed every time Angular checks the template.
- Can hurt performance if calculations are expensive.

### Exceptions

- Event bindings

```html
<button (click)="save()">Save</button>
```

- Signal reads

```html
{{ count() }}
```

These are designed to work this way.

---

## 3. Use Getters Carefully

Good:

```ts
get fullName() {
  return this.firstName + ' ' + this.lastName;
}
```

Bad:

```ts
get totalPrice() {
  // Heavy calculation
  return this.products.reduce(...);
}
```

Rule:

> Getters used in templates should perform only simple, fast operations.

---

## 4. Pipes Are Safer for Transformations

Example:

```html
{{ amount | currency }}
```

Angular caches results of pure pipes by default.

Benefits:

- Avoids unnecessary recalculations.
- Better performance than repeatedly executing custom functions.

---

# Recommended Pattern

### Modify Data in Methods

```ts
increment() {
  this.count++;
}
```

### Display Data in Template

```html
{{ count }}
```

### Keep Getters Simple

```ts
get counterValue() {
  return this.count;
}
```

---

# Key Takeaways

✅ Keep template expressions simple.

✅ Prefer properties over function calls.

✅ Use getters only for lightweight calculations.

✅ Use pipes for data transformations.

❌ Avoid expensive calculations in templates.

❌ Avoid methods/getters that perform heavy work during Change Detection.

---

# One-Line Summary

**Since Angular reevaluates template bindings frequently, templates, getters, and methods should remain simple, lightweight, and focused on reading data rather than performing expensive calculations.**



# Angular Performance Optimization: Avoiding Zone Pollution with NgZone

## The Problem: Unnecessary Change Detection from Background Tasks

By default, Angular wraps your entire application in a **Zone.js** wrapper. Under the hood, Zone.js automatically intercepts all asynchronous browser APIs, including timers like `setTimeout` and `setInterval`.

### Why It Happens
Zone.js acts as a blanket listener. When an asynchronous macro-task—such as a 5-second background timer—expires:
1. Zone.js detects the completion of the timer.
2. It assumes that application state *might* have changed.
3. It forces Angular to initiate a global, top-down change detection sweep across the entire component tree.

### The Inefficiency
Zone.js **cannot read your code** to inspect if a function actually updates a property or affects the UI. Even if the callback does nothing but execute a simple console log (`console.log('Timer expired')`), Angular will still waste CPU cycles visiting every component template to re-evaluate string interpolations and property bindings.

---

## What is Zone Pollution?

**Zone Pollution** occurs when an Angular application is flooded with asynchronous events that have zero impact on the user interface. 

### Common Causes of Zone Pollution:
- High-frequency background polling (e.g., fetching telemetry every few seconds).
- Third-party libraries that manage their own animation loops or intervals (e.g., charts, maps, or canvases).
- Passive logging or telemetry tracking scripts that only send analytics data to a server.

Unchecked Zone Pollution leads to degraded performance because the main browser thread is constantly blocked by redundant template evaluations.

---

## The Solution: `NgZone.runOutsideAngular()`

To optimize these background tasks, Angular provides a core built-in utility service called `NgZone`. This service lets you explicitly tell Angular to ignore specific asynchronous operations.

### Key Concept: The Escape Hatch
By wrapping code inside `NgZone.runOutsideAngular()`, you execute that specific task completely outside of the Zone.js execution context. Zone.js will not watch the event, and Angular will not run change detection when the event resolves.

---

## Code Implementation Example

Here is how you inject and implement `NgZone` using modern Angular injection patterns to bypass unnecessary rendering cycles.

### ❌ Inefficient Implementation (Causes Global Check)
```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `<p>Check the console logs...</p>`
})
export class CounterComponent implements OnInit {
  ngOnInit() {
    // This timer fires after 5 seconds and forces a full app rerender check
    setTimeout(() => {
      console.log('Timer expired.'); 
    }, 5000);
  }
}
```

###  Optimized Implementation (Avoids Zone Pollution)
```typescript
import { Component, OnInit, inject, NgZone } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `<p>Check the console logs...</p>`
})
export class CounterComponent implements OnInit {
  // Inject the NgZone service utility
  private zone = inject(NgZone);

  ngOnInit() {
    // Escape Angular's watchful eye
    this.zone.runOutsideAngular(() => {
      
      setTimeout(() => {
        // This log executes, but NO change detection cycles are triggered
        console.log('Timer expired.');
      }, 5000);

    });
  }
}
```

---

## Visual Comparison: Console Log Behavior

If your components contain a template expression or getter property that logs whenever it gets checked, you will notice a stark difference in behavior:

### Without Optimization (Default Behavior)
```text
[00:04] Counter reset to zero.
[00:04] AppComponent checked
[00:04] HeaderComponent checked
[00:04] CounterComponent checked

[00:05] Timer expired.
[00:05] AppComponent checked      <-- Unnecessary Overhead!
[00:05] HeaderComponent checked    <-- Unnecessary Overhead!
[00:05] CounterComponent checked   <-- Unnecessary Overhead!
```

### With `runOutsideAngular()` Optimization
```text
[00:04] Counter reset to zero.
[00:04] AppComponent checked
[00:04] HeaderComponent checked
[00:04] CounterComponent checked

[00:05] Timer expired.             <-- Clean execution, no component checks run.
```

---

## Key Takeaways

- **Zone.js Blanket Tracking:** By default, Zone.js automatically hooks into all browser async APIs (`setTimeout`, `Promise`, events) regardless of whether they change data.
- **Overhead of Ignored Code:** Tasks that only perform logging or data collection still cost performance by executing global change detection sweeps.
- **NgZone Service:** Use `inject(NgZone)` or constructor injection to access Angular's execution wrapper.
- **`runOutsideAngular()` Strategy:** Use this method to safely wrap non-UI code. It prevents Zone Pollution, protects your rendering thread, and optimizes applications that require background processing.
