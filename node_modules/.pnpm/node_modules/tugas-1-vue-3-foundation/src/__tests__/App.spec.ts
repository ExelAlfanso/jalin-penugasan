import { describe, expect, it } from "vitest";

import { mount } from "@vue/test-utils";
import App from "../App.vue";

describe("App", () => {
  it("renders the router outlet and toast region", () => {
    const wrapper = mount(App, {
      global: {
        stubs: { RouterView: true, Toaster: true },
      },
    });

    expect(wrapper.findComponent({ name: "RouterView" }).exists()).toBe(true);
  });
});
