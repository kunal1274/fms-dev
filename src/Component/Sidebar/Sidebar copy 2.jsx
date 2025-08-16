import React, { useMemo, useState, useEffect } from "react";
import {
  FaUser,
  FaTruck,
  FaBoxOpen,
  FaShoppingCart,
  FaCartPlus,
  FaCog,
  FaWarehouse,
  FaMapMarkerAlt,
  FaBars,
} from "react-icons/fa";

const navItems = [
  {
    label: "Company",
    icon: FaTruck,
    subItems: [
      { label: "Company List", icon: FaWarehouse },
      { label: "Company Form", icon: FaCog },
    ],
  },
  {
    label: "Inventory",
    icon: FaBoxOpen,
    subItems: [
      { label: "Item List", icon: FaWarehouse },
      { label: "Item Form", icon: FaCog },
    ],
  },
  {
    label: "Sale",
    icon: FaShoppingCart,
    subItems: [
      { label: "Customer", icon: FaUser },
      { label: "Sale Orders", icon: FaShoppingCart },
    ],
  },
  {
    label: "Purchase",
    icon: FaCartPlus,
    subItems: [
      { label: "Vendor", icon: FaTruck },
      { label: "Purchase Orders", icon: FaCartPlus },
    ],
  },
  {
    label: "Bank",
    icon: FaMapMarkerAlt,
    subItems: [
      { label: "Bank List", icon: FaWarehouse },
      { label: "Bank Form", icon: FaCog },
    ],
  },
  { label: "User", icon: FaUser },
  { label: "Accounting And Tax", icon: FaUser },
];

/*************************************************
 * SIDEBAR
 *************************************************/
export function Sidebar({ isOpen, selectedTop, selectedSub, onSelectMenu }) {
  const [expanded, setExpanded] = useState(null);

  // Keep expanded state synced with the selected top-level item
  useEffect(() => {
    const topItem = navItems.find((n) => n.label === selectedTop);
    if (topItem?.subItems?.length) {
      setExpanded(selectedTop);
    } else {
      setExpanded(null);
    }
  }, [selectedTop]);

  const handleTopClick = (item) => {
    if (item.subItems?.length) {
      const willExpand = expanded !== item.label;
      setExpanded(willExpand ? item.label : null);
      // When opening, auto-select first sub-item if none selected
      if (willExpand) {
        onSelectMenu(item.label, item.subItems[0]?.label ?? null);
      } else {
        onSelectMenu(item.label, selectedSub);
      }
    } else {
      onSelectMenu(item.label, null);
      setExpanded(null);
    }
  };

  const handleSubClick = (top, sub) => {
    onSelectMenu(top.label, sub.label);
  };

  return (
    <aside
      className={`
        flex flex-col justify-between bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
        text-white p-3 h-full transition-all duration-300 ease-in-out 
        ${isOpen ? "w-56" : "w-16"}
      `}
      aria-label="Sidebar"
    >
      <div>
        {isOpen && (
          <div
            className="text-2xl font-extrabold mb-6 tracking-wider text-transparent
                       bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
          >
            Namami
          </div>
        )}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const activeTop = selectedTop === item.label;
            const isExpanded = expanded === item.label;
            const hasSubs = !!item.subItems?.length;

            return (
              <div key={item.label}>
                <button
                  onClick={() => handleTopClick(item)}
                  title={item.label}
                  aria-expanded={hasSubs ? isExpanded : undefined}
                  className={`
                    group flex items-center p-2 rounded-lg transition-all duration-200 w-full
                    ${activeTop ? "bg-gray-700" : "hover:bg-gray-700"}
                    ${isOpen ? "justify-between" : "justify-center"}
                  `}
                >
                  <span
                    className={`flex items-center ${
                      isOpen ? "" : "justify-center w-full"
                    }`}
                  >
                    <Icon
                      className={`
                        text-xl flex-shrink-0 transition-transform duration-200
                        ${isOpen ? "mr-[6px]" : ""}
                        ${activeTop ? "text-yellow-400" : "text-gray-400"}
                        group-hover:scale-110
                      `}
                    />
                    {isOpen && (
                      <span className="text-base font-medium text-white group-hover:text-amber-300">
                        {item.label}
                      </span>
                    )}
                  </span>

                  {isOpen && hasSubs && (
                    <span className="text-sm text-gray-300">
                      {isExpanded ? "▾" : "▸"}
                    </span>
                  )}
                </button>

                {isOpen && hasSubs && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const activeSub = activeTop && selectedSub === sub.label;
                      return (
                        <button
                          key={sub.label}
                          onClick={() => handleSubClick(item, sub)}
                          title={sub.label}
                          className={`
                            flex items-center p-2 rounded-lg transition-all duration-200 w-full
                            ${activeSub ? "bg-gray-700" : "hover:bg-gray-700"}
                          `}
                        >
                          <SubIcon
                            className={`
                              text-lg flex-shrink-0 transition-transform duration-200 mr-2
                              ${activeSub ? "text-yellow-400" : "text-gray-400"}
                              group-hover:scale-110
                            `}
                          />
                          <span className="text-sm font-normal text-white group-hover:text-amber-300">
                            {sub.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div>
        <button
          className="group w-full flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-200 shadow-inner"
          onClick={() => console.log("Toggle theme")}
          title="Theme"
          aria-label="Theme"
        >
          <FaCog className="text-xl transition-transform duration-300 group-hover:rotate-90" />
          {isOpen && (
            <span className="ml-2 text-sm font-medium text-white">Theme</span>
          )}
        </button>
      </div>
    </aside>
  );
}

/*************************************************
 * GENERIC COLLAPSIBLE SECTION
 *************************************************/
function CollapsibleSection({ id, title, children }) {
  const [hidden, setHidden] = useState(false);
  const sectionId = `section-${id}`;
  return (
    <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
      <button
        onClick={() => setHidden((v) => !v)}
        className="w-full flex items-center justify-between text-left"
        aria-controls={sectionId}
        aria-expanded={!hidden}
        title={hidden ? "Expand section" : "Collapse section"}
      >
        <span className="font-semibold text-gray-800">{title}</span>
        <span className="text-gray-600">{hidden ? "▸" : "▾"}</span>
      </button>
      {!hidden && (
        <div id={sectionId} className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
}

/*************************************************
 * STUB PAGES
 *************************************************/
function PageFrame({ title, children }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function CompanyListPage() {
  return (
    <PageFrame title="Company • List">
      <CollapsibleSection id="filters" title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="Search name…" />
          <input className="border rounded p-2" placeholder="Code…" />
          <button className="px-3 py-2 rounded bg-gray-800 text-white">
            Apply
          </button>
        </div>
      </CollapsibleSection>
      <CollapsibleSection id="table" title="Table">
        <div className="border rounded p-3 text-sm text-gray-600">
          Your company table here…
        </div>
      </CollapsibleSection>
    </PageFrame>
  );
}

function CompanyForm() {
  return (
    <PageFrame title="Company • Form">
      <CollapsibleSection id="basic" title="Basic Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Company Name" />
          <input
            className="border rounded p-2"
            placeholder="Registration No."
          />
        </div>
      </CollapsibleSection>
      <CollapsibleSection id="bank" title="Bank Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Bank Name" />
          <input className="border rounded p-2" placeholder="Account No." />
        </div>
      </CollapsibleSection>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-green-600 text-white">
          Save
        </button>
        <button className="px-4 py-2 rounded bg-gray-200">Cancel</button>
      </div>
    </PageFrame>
  );
}

function ItemList() {
  return (
    <PageFrame title="Inventory • Item List">
      <CollapsibleSection id="filters" title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="Item Code" />
          <input className="border rounded p-2" placeholder="Item Name" />
          <button className="px-3 py-2 rounded bg-gray-800 text-white">
            Apply
          </button>
        </div>
      </CollapsibleSection>
      <CollapsibleSection id="table" title="Table">
        <div className="border rounded p-3 text-sm text-gray-600">
          Your item table here…
        </div>
      </CollapsibleSection>
    </PageFrame>
  );
}

function ItemForm() {
  return (
    <PageFrame title="Inventory • Item Form">
      <CollapsibleSection id="basic" title="Item Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Item Code" />
          <input className="border rounded p-2" placeholder="Item Name" />
        </div>
      </CollapsibleSection>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-green-600 text-white">
          Save
        </button>
        <button className="px-4 py-2 rounded bg-gray-200">Cancel</button>
      </div>
    </PageFrame>
  );
}

function CustomerList() {
  return (
    <PageFrame title="Sale • Customer">
      <CollapsibleSection id="filters" title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="Customer Name" />
          <input className="border rounded p-2" placeholder="Phone" />
          <button className="px-3 py-2 rounded bg-gray-800 text-white">
            Apply
          </button>
        </div>
      </CollapsibleSection>
      <CollapsibleSection id="table" title="Table">
        <div className="border rounded p-3 text-sm text-gray-600">
          Your customers table here…
        </div>
      </CollapsibleSection>
    </PageFrame>
  );
}

function SaleOrderList() {
  return (
    <PageFrame title="Sale • Sale Orders">
      <CollapsibleSection id="filters" title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="Order No" />
          <input className="border rounded p-2" placeholder="Customer" />
          <button className="px-3 py-2 rounded bg-gray-800 text-white">
            Apply
          </button>
        </div>
      </CollapsibleSection>
      <CollapsibleSection id="table" title="Table">
        <div className="border rounded p-3 text-sm text-gray-600">
          Your sale orders table here…
        </div>
      </CollapsibleSection>
    </PageFrame>
  );
}

function VendorList() {
  return (
    <PageFrame title="Purchase • Vendor">
      <CollapsibleSection id="filters" title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="Vendor Name" />
          <input className="border rounded p-2" placeholder="GSTIN" />
          <button className="px-3 py-2 rounded bg-gray-800 text-white">
            Apply
          </button>
        </div>
      </CollapsibleSection>
      <CollapsibleSection id="table" title="Table">
        <div className="border rounded p-3 text-sm text-gray-600">
          Your vendors table here…
        </div>
      </CollapsibleSection>
    </PageFrame>
  );
}

function PurchaseOrderList() {
  return (
    <PageFrame title="Purchase • Purchase Orders">
      <CollapsibleSection id="filters" title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="PO No" />
          <input className="border rounded p-2" placeholder="Vendor" />
          <button className="px-3 py-2 rounded bg-gray-800 text-white">
            Apply
          </button>
        </div>
      </CollapsibleSection>
      <CollapsibleSection id="table" title="Table">
        <div className="border rounded p-3 text-sm text-gray-600">
          Your purchase orders table here…
        </div>
      </CollapsibleSection>
    </PageFrame>
  );
}

function BankList() {
  return (
    <PageFrame title="Bank • List">
      <CollapsibleSection id="filters" title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="Bank Name" />
          <input className="border rounded p-2" placeholder="Account No" />
          <button className="px-3 py-2 rounded bg-gray-800 text-white">
            Apply
          </button>
        </div>
      </CollapsibleSection>
      <CollapsibleSection id="table" title="Table">
        <div className="border rounded p-3 text-sm text-gray-600">
          Your bank accounts table here…
        </div>
      </CollapsibleSection>
    </PageFrame>
  );
}

function BankForm() {
  return (
    <PageFrame title="Bank • Form">
      <CollapsibleSection id="bank" title="Bank Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Bank Name" />
          <input className="border rounded p-2" placeholder="Account Number" />
          <input className="border rounded p-2" placeholder="IFSC" />
          <input className="border rounded p-2" placeholder="Branch" />
        </div>
      </CollapsibleSection>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-green-600 text-white">
          Save
        </button>
        <button className="px-4 py-2 rounded bg-gray-200">Cancel</button>
      </div>
    </PageFrame>
  );
}

/*************************************************
 * CONTENT ROUTER
 *************************************************/
function ContentRouter({ selectedTop, selectedSub }) {
  const view = useMemo(() => {
    switch (selectedTop) {
      case "Company":
        return selectedSub === "Company Form" ? (
          <CompanyForm />
        ) : (
          <CompanyListPage />
        );
      case "Inventory":
        return selectedSub === "Item Form" ? <ItemForm /> : <ItemList />;
      case "Sale":
        return selectedSub === "Customer" ? (
          <CustomerList />
        ) : (
          <SaleOrderList />
        );
      case "Purchase":
        return selectedSub === "Vendor" ? (
          <VendorList />
        ) : (
          <PurchaseOrderList />
        );
      case "Bank":
        return selectedSub === "Bank Form" ? <BankForm /> : <BankList />;
      case "User":
        return <PageFrame title="User">Coming soon…</PageFrame>;
      case "Accounting And Tax":
        return <PageFrame title="Accounting & Tax">Coming soon…</PageFrame>;
      default:
        return (
          <PageFrame title="Welcome">Select a menu from the sidebar.</PageFrame>
        );
    }
  }, [selectedTop, selectedSub]);

  return <div className="h-full overflow-auto">{view}</div>;
}

/*************************************************
 * APP SHELL
 *************************************************/
export default function AppShell() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTop, setSelectedTop] = useState("Company");
  const [selectedSub, setSelectedSub] = useState("Company List");

  const onSidebarToggle = () => setIsOpen((v) => !v); // ← FIX: define the handler

  const handleSelectMenu = (top, sub) => {
    setSelectedTop(top);
    const topItem = navItems.find((n) => n.label === top);
    if (topItem?.subItems?.length) {
      setSelectedSub(sub || topItem.subItems[0].label);
    } else {
      setSelectedSub(null);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex">
      <Sidebar
        isOpen={isOpen}
        selectedTop={selectedTop}
        selectedSub={selectedSub}
        onSelectMenu={handleSelectMenu}
      />

      <main className="flex-1 flex flex-col h-full">
        {/* Topbar */}
        <header className="bg-white border-b h-12 border-gray-200 px-3 py-2 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between h-9">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu */}
              <button
                onClick={onSidebarToggle}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
                aria-label="Toggle sidebar"
                title="Toggle sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 pr-2 py-1 text-sm rounded-md bg-gray-100 text-gray-700 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-300 focus:outline-none transition"
                  aria-label="Search"
                />
                <svg
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button
                className="relative text-gray-600 hover:text-gray-800 focus:outline-none"
                aria-label="Notifications"
                title="Notifications"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-0 right-0 block h-1.5 w-1.5 rounded-full bg-red-500"></span>
              </button>

              {/* Profile */}
              <div className="flex items-center space-x-2">
                <img
                  src="/path/to/profile-pic.png"
                  alt="Profile"
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-800">
                  John Doe
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Routed content */}
        <div className="flex-1 overflow-auto">
          <ContentRouter selectedTop={selectedTop} selectedSub={selectedSub} />
        </div>
      </main>
    </div>
  );
}
