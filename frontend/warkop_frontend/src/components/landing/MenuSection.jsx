import React from "react";

// Helper untuk menerjemahkan key filter menjadi label teks
const getTabLabel = (tab) => {
  const labels = {
    all: "Semua",
    kopi: "Kopi",
    nonkopi: "Non-Kopi",
    makanan: "Makanan",
  };
  return labels[tab] || tab;
};

const checkIsFoodCategory = (cat) => {
  if (cat.isFood) return true;
  
  const categoryName = cat.category?.toLowerCase() || "";
  return categoryName.includes("makanan") || categoryName.includes("cemilan");
};

const MenuItem = ({ item }) => {
  const itemClass = `menu-item ${item.fav ? "is-fav" : ""}`.trim();

  return (
    <li className={itemClass}>
      <span className="menu-item-name">
        {item.fav && <span className="fav-dot" />}
        {item.name}
      </span>
      <span className="menu-item-price">{item.price}</span>
    </li>
  );
};

export default function MenuSection({
  menuFilter,
  setMenuFilter,
  filteredMenu,
}) {
  const filterTabs = ["all", "kopi", "nonkopi", "makanan"];

  return (
    <section id="menu" className="menu-section">
      <div className="container">
        
        {/* Header Section */}
        <div className="text-center mb-2 reveal">
          <h2 className="section-heading white mt-1">
            Menu Andalan Si Bontot
          </h2>
        </div>

        {/* Filter Tabs Navigation */}
        <div className="menu-tabs reveal">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              className={`menu-tab-btn ${menuFilter === tab ? "active" : ""}`.trim()}
              onClick={() => setMenuFilter(tab)}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>

        {/* Grid Menu Cards */}
        <div className="row g-4 justify-content-center">
          {filteredMenu.map((cat, idx) => {
            const isFood = checkIsFoodCategory(cat);
            const cardClass = `menu-card ${isFood ? "food-card" : ""}`.trim();

            return (
              <div key={idx} className="col-md-6 col-lg-4 reveal">
                <div className={cardClass}>
                  
                  <div className="menu-card-title">
                    {cat.category}
                  </div>

                  <div className="menu-col-labels">
                    <span>Menu</span>
                    <span>Harga</span>
                  </div>

                  <ul className="menu-list">
                    {cat.items?.map((item, i) => (
                      <MenuItem key={i} item={item} />
                    ))}
                  </ul>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}