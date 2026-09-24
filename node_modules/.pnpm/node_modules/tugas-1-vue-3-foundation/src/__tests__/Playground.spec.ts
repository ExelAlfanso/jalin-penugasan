import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import RefDemoCard from "@/components/Feature/Playground/RefDemoCard.vue";
import ShallowRefDemoCard from "@/components/Feature/Playground/ShallowRefDemoCard.vue";

describe("reactivity playground", () => {
  it("updates immediately when ref nested state changes", async () => {
    const wrapper = mount(RefDemoCard);

    await wrapper.get('[data-testid="ref-mutate"]').trigger("click");

    expect(wrapper.get('[data-testid="ref-theme"]').text()).toBe("dark");
  });

  it("updates shallowRef when its root value is replaced", async () => {
    const wrapper = mount(ShallowRefDemoCard);

    await wrapper.get('[data-testid="shallow-mutate"]').trigger("click");
    expect(wrapper.get('[data-testid="shallow-theme"]').text()).toBe("light");

    await wrapper.get('[data-testid="shallow-replace"]').trigger("click");
    expect(wrapper.get('[data-testid="shallow-theme"]').text()).toBe("light");

    await wrapper.get('[data-testid="shallow-replace"]').trigger("click");
    expect(wrapper.get('[data-testid="shallow-theme"]').text()).toBe("dark");
  });
});
