import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import CafeteriaCard from "../src/components/CafeteriaCard.vue";

// Mock Ant Design Vue components
const mockAntdComponents = {
  "a-card": {
    template:
      '<div class="a-card" v-bind="$attrs" @mouseenter="$emit(\'mouseenter\')" @mouseleave="$emit(\'mouseleave\')" @click="$emit(\'click\')"><slot /></div>',
  },
  "a-tag": {
    template: '<span class="a-tag" :style="$attrs.style"><slot /></span>',
    props: ["color"],
  },
  "a-typography-title": {
    template:
      '<h4 class="a-typography-title" :style="$attrs.style"><slot /></h4>',
    props: ["level"],
  },
  "a-typography-text": {
    template:
      '<span class="a-typography-text" :class="{ secondary: type === \'secondary\' }" :style="$attrs.style"><slot /></span>',
    props: ["type"],
  },
  "a-space": {
    template: '<div class="a-space"><slot /></div>',
    props: ["size", "wrap"],
  },
  "a-rate": {
    template: '<div class="a-rate" :style="$attrs.style"></div>',
    props: ["value", "disabled"],
  },
};

// Create a mock router
const createMockRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        name: "CafeteriaDetail",
        path: "/cafeteria/:id",
        component: { template: "<div>Detail</div>" },
      },
    ],
  });
};

// Sample cafeteria data
const mockCafeteria = {
  id: "123",
  name: "Student Cafeteria",
  school: "National University of Singapore",
  isOpen: true,
  distance: "0.2 km",
  hours: "7:00 AM - 9:00 PM",
  cuisines: ["Chinese", "Western", "Malay"],
  rating: 4.2,
  reviews: 156,
  image: "https://example.com/image.jpg",
  merchants: [{ id: 1, name: "Stall 1" }],
};

describe("CafeteriaCard", () => {
  let wrapper;
  let mockRouter;

  beforeEach(() => {
    mockRouter = createMockRouter();
    vi.clearAllMocks();
  });

  const createWrapper = (props = {}, options = {}) => {
    return mount(CafeteriaCard, {
      props: {
        cafeteria: mockCafeteria,
        ...props,
      },
      global: {
        plugins: [mockRouter],
        components: mockAntdComponents,
        ...options.global,
      },
    });
  };

  describe("Rendering", () => {
    it("renders cafeteria information correctly", () => {
      wrapper = createWrapper();

      expect(wrapper.find(".a-typography-title").text()).toBe(
        "Student Cafeteria"
      );
      expect(wrapper.find(".a-typography-text").text()).toBe(
        "National University of Singapore"
      );
      expect(wrapper.text()).toContain("7:00 AM - 9:00 PM");
      expect(wrapper.text()).toContain("4.2");
      expect(wrapper.text()).toContain("156 reviews");
    });

    it("displays open/closed status correctly", () => {
      wrapper = createWrapper();
      const statusTags = wrapper.findAll(".a-tag");

      // First tag should be the open/closed status
      expect(statusTags[0].text()).toBe("Open");
    });

    it("displays closed status when cafeteria is closed", () => {
      wrapper = createWrapper({
        cafeteria: { ...mockCafeteria, isOpen: false },
      });
      const statusTags = wrapper.findAll(".a-tag");

      expect(statusTags[0].text()).toBe("Closed");
    });

    it("displays distance correctly", () => {
      wrapper = createWrapper();
      const distanceTag = wrapper.findAll(".a-tag")[1];

      expect(distanceTag.text()).toBe("⟂ 0.2 km");
    });

    it("renders cuisines as tags", () => {
      wrapper = createWrapper();

      expect(wrapper.text()).toContain("Chinese");
      expect(wrapper.text()).toContain("Western");
      expect(wrapper.text()).toContain("Malay");
    });

    it("displays default hours when hours prop is missing", () => {
      wrapper = createWrapper({
        cafeteria: { ...mockCafeteria, hours: null },
      });

      expect(wrapper.text()).toContain("6:00 AM - 6:00 PM");
    });

    it('shows "No stalls listed" when there are no merchants', () => {
      wrapper = createWrapper({
        cafeteria: { ...mockCafeteria, merchants: [] },
      });

      expect(wrapper.text()).toContain("No stalls listed");
    });

    it('does not show "No stalls listed" when merchants exist', () => {
      wrapper = createWrapper();

      expect(wrapper.text()).not.toContain("No stalls listed");
    });
  });

  describe("Hover Interactions", () => {
    it("emits hover event on mouse enter", async () => {
      wrapper = createWrapper();

      await wrapper.find(".a-card").trigger("mouseenter");

      expect(wrapper.emitted("hover")).toBeTruthy();
      expect(wrapper.emitted("hover")[0]).toEqual(["123"]);
    });

    it("emits leave event on mouse leave", async () => {
      wrapper = createWrapper();

      await wrapper.find(".a-card").trigger("mouseleave");

      expect(wrapper.emitted("leave")).toBeTruthy();
    });

    it("sets hover state to true on mouse enter", async () => {
      wrapper = createWrapper();

      await wrapper.find(".a-card").trigger("mouseenter");

      // Check if hover class is applied (you might need to adjust based on how the class is applied)
      expect(wrapper.vm.hover).toBe(true);
    });

    it("sets hover state to false on mouse leave", async () => {
      wrapper = createWrapper();

      // First enter to set hover to true
      await wrapper.find(".a-card").trigger("mouseenter");
      expect(wrapper.vm.hover).toBe(true);

      // Then leave to set hover to false
      await wrapper.find(".a-card").trigger("mouseleave");
      expect(wrapper.vm.hover).toBe(false);
    });
  });

  describe("Navigation", () => {
    it("navigates to cafeteria detail page on click", async () => {
      const mockPush = vi.spyOn(mockRouter, "push");
      wrapper = createWrapper();

      await wrapper.find(".a-card").trigger("click");

      expect(mockPush).toHaveBeenCalledWith({
        name: "CafeteriaDetail",
        params: { id: "123" },
      });
    });
  });

  describe("Computed Properties", () => {
    it("hasMerchants returns true when merchants array has items", () => {
      wrapper = createWrapper();

      expect(wrapper.vm.hasMerchants).toBe(true);
    });

    it("hasMerchants returns false when merchants array is empty", () => {
      wrapper = createWrapper({
        cafeteria: { ...mockCafeteria, merchants: [] },
      });

      expect(wrapper.vm.hasMerchants).toBe(false);
    });

    it("hasMerchants returns false when merchants is not an array", () => {
      wrapper = createWrapper({
        cafeteria: { ...mockCafeteria, merchants: null },
      });

      expect(wrapper.vm.hasMerchants).toBe(false);
    });
  });

  describe("Props Validation", () => {
    it("requires cafeteria prop", () => {
      // This test checks that the component properly defines cafeteria as required
      const { cafeteria } = CafeteriaCard.props;
      expect(cafeteria.required).toBe(true);
      expect(cafeteria.type).toBe(Object);
    });
  });

  describe("Edge Cases", () => {
    it("handles missing optional properties gracefully", () => {
      const minimalCafeteria = {
        id: "456",
        name: "Basic Cafe",
        school: "Test School",
        isOpen: false,
        distance: "1.0 km",
        rating: 3.5,
        reviews: 10,
        // Missing: hours, cuisines, image, merchants
      };

      wrapper = createWrapper({ cafeteria: minimalCafeteria });

      expect(wrapper.find(".a-typography-title").text()).toBe("Basic Cafe");
      expect(wrapper.text()).toContain("6:00 AM - 6:00 PM"); // Default hours
      expect(wrapper.text()).toContain("No stalls listed");
    });

    it("handles empty cuisines array", () => {
      wrapper = createWrapper({
        cafeteria: { ...mockCafeteria, cuisines: [] },
      });

      // Should not crash and should render other content
      expect(wrapper.find(".a-typography-title").text()).toBe(
        "Student Cafeteria"
      );
    });
  });
});
