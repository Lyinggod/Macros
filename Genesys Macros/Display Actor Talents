// Define the content of the dialog, including the dynamic box and bottom buttons
const content = `
  <div id="gmView"></div>
  <div id="player"></div>
  <div id="talentSearch"></div>
  <div id="genesysTestBox" style="width: 100%; height: 0; overflow-y: auto;">
    This is a dynamically sized box!
  </div>
  <div id="bottomButtons" style="
    position: absolute; 
    bottom: 0; 
    left: 0; 
    width: 100%; 
    height: 50px; 
    background-color: burlywood; 
    display: flex;
    align-items: center;
    padding: 0 10px;
    justify-content: space-between; /* Ensure proper spacing for right alignment */
    ">
   
    <div id="customCloseButton" style="
      width: 50px; 
      height: 30px; 
      background-color: transparent; 
      color: black; 
      text-align: center; 
      line-height: 30px; 
      cursor: pointer;
      font-weight: bold;
      border: 1px solid black;
      border-radius: 5px;
    ">
      Close
    </div>
    <div id="customUpButton" style="
      width: 20px; 
      height: 20px; 
      background-color: transparent; 
      color: black; 
      text-align: center; 
      line-height: 20px; 
      cursor: pointer;
      font-size: 16px;
      position: absolute; 
      right: 30px;
      display: flex; 
      justify-content: center; 
      align-items: center;
      border: 1px solid black;
      border-radius: 5px;
    "
    title="Scroll to top">
      <i class="fas fa-arrow-up"></i>
      <span style="
        visibility: hidden; 
        position: absolute; 
        bottom: 30px; 
        background-color: black; 
        color: white; 
        padding: 5px; 
        border-radius: 3px; 
        font-size: 12px;
        white-space: nowrap;">
        Scroll to top
      </span>
    </div>
  </div>
`;

// Create the dialog
const myDialog = new Dialog({
  title: "Resizable Dialog with Dynamic Box and Custom Buttons",
  content: content,
  buttons: {}, // No standard buttons
  render: (html) => {
    // Get the dialog element by its ID
    const dialogElement = html[0].closest('#genesysTestBoxDialog'); // ID set in .render()
    const dynamicBox = html[0].querySelector('#genesysTestBox');
    const closeButton = html[0].querySelector('#customCloseButton');
    const upButton = html[0].querySelector('#customUpButton');

    // Add an event listener to the custom close button
    closeButton.addEventListener('click', () => {
      myDialog.close();
      console.log("Custom close button clicked. Dialog closed.");
    });

    // Add an event listener to the custom up button
    upButton.addEventListener('click', () => {
      dynamicBox.scrollTo({ top: 0, behavior: 'smooth' });
      console.log("Up button clicked. Scrolled to top.");
    });

    // Adjust the div height dynamically whenever the dialog is resized
    const updateBoxHeight = () => {
      const dialogHeight = dialogElement.offsetHeight; // Actual height of the dialog
      dynamicBox.style.height = `${dialogHeight - 100}px`; // Subtract 100px for bottom buttons and any padding
    };

    // Initial update to set the box height when the dialog renders
    updateBoxHeight();

    // Add a resize observer to re-calculate the box height when the dialog is resized
    const resizeObserver = new ResizeObserver(updateBoxHeight);
    resizeObserver.observe(dialogElement);

    // === Inserted Code Starts Here ===

    // Function to create the HTML table with alternating row colors
    function createTalentTable(items, type) {
      const table = document.createElement('table');
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";

      if (type === "talent") {
        // Group items by name
        const groupedItems = items.reduce((acc, item) => {
          if (!acc[item.name]) {
            acc[item.name] = { ...item, count: 1 };
          } else {
            acc[item.name].count += 1;
          }
          return acc;
        }, {});

        // Convert grouped items to array
        const uniqueItems = Object.values(groupedItems);

        uniqueItems.forEach((item, index) => {
          const row = document.createElement('tr');

          // Set alternating background color
          if (index % 2 === 0) {
            row.style.backgroundColor = 'rgba(210, 180, 140, 0.2)'; // Light tan with 0.2 transparency
          } else {
            row.style.backgroundColor = 'transparent';
          }

          const cell = document.createElement('td');
          cell.style.padding = "8px";
          cell.style.border = "1px solid #ddd";

          // Calculate Effective Tier
          const baseTier = parseInt(item.system.tier, 10) || 0;
          const effectiveTier = baseTier + (item.count - 1);
          const eTier = item.system.ranks.ranked ? ` ranked to Tier: ${effectiveTier}` : "";
          // Populate cell content for talents
          cell.innerHTML = `
            <strong>${item.name}</strong><br>
            Ranks: ${item.system.ranks.ranked}<br>
            Tier: ${item.system.tier} ${eTier}<br>
            ${replaceSymbols(item.system.description)}
          `;

          row.appendChild(cell);
          table.appendChild(row);
        });
      } else if (type === "ability") {
        // Populate table normally for abilities
        items.forEach((item, index) => {
          const row = document.createElement('tr');

          // Set alternating background color
          if (index % 2 === 0) {
            row.style.backgroundColor = 'rgba(210, 180, 140, 0.2)'; // Light tan with 0.2 transparency
          } else {
            row.style.backgroundColor = 'transparent';
          }

          const cell = document.createElement('td');
          cell.style.padding = "8px";
          cell.style.border = "1px solid #ddd";

          // Populate cell content for abilities
          cell.innerHTML = `
            <strong>${item.name}</strong><br>
            Description: ${item.system.description}
          `;

          row.appendChild(cell);
          table.appendChild(row);
        });
      }

      return table;
    }

    // Function to create the Actor Dropdown with grouped headers
    function createActorDropdown(groups) {
      let dropdown = `<select id="actorDropdown">`;

      // Players Header
      if (groups.players.length > 0) {
        dropdown += `<optgroup label="Players">`;
        groups.players.forEach(actor => {
          dropdown += `<option value="${actor.id}">${actor.name}</option>`;
        });
        dropdown += `</optgroup>`;
      }

      // Characters Header
      if (groups.characters.length > 0) {
        dropdown += `<optgroup label="Characters">`;
        groups.characters.forEach(actor => {
          dropdown += `<option value="${actor.id}">${actor.name}</option>`;
        });
        dropdown += `</optgroup>`;
      }

      // Minions Header
      if (groups.minions.length > 0) {
        dropdown += `<optgroup label="Minions">`;
        groups.minions.forEach(actor => {
          dropdown += `<option value="${actor.id}">${actor.name}</option>`;
        });
        dropdown += `</optgroup>`;
      }

      // Rivals Header
      if (groups.rivals.length > 0) {
        dropdown += `<optgroup label="Rivals">`;
        groups.rivals.forEach(actor => {
          dropdown += `<option value="${actor.id}">${actor.name}</option>`;
        });
        dropdown += `</optgroup>`;
      }

      // Nemeses Header
      if (groups.nemeses.length > 0) {
        dropdown += `<optgroup label="Nemeses">`;
        groups.nemeses.forEach(actor => {
          dropdown += `<option value="${actor.id}">${actor.name}</option>`;
        });
        dropdown += `</optgroup>`;
      }

      dropdown += `</select>`;
      return dropdown;
    }

    // Function to create the Type Dropdown ("talent" or "ability")
    function createTypeDropdown() {
      return `
        <select id="typeDropdown" style="margin-left: 10px;">
          <option value="talent" selected>Talent</option> <!-- Set "Talent" as default -->
          <option value="ability">Ability</option>
        </select>
      `;
    }

    // Function to create the Sort Order Dropdown
    function createSortDropdown() {
      return `
        <select id="sortDropdown" style="margin-left: 10px; display: inline-block;"> <!-- Display by default -->
          <option value="default">Sort Order</option>
          <option value="name">Name</option>
          <option value="tier">Tier</option>
          <option value="tierName" selected>Tier/Name</option> <!-- Set "Tier/Name" as default -->
        </select>
      `;
    }

    // Function to create the Search Field and Button
    function createSearchField() {
      return `
        <input type="text" id="searchBox" placeholder="Search..." style="width: 200px; margin-left: 10px;">
        <button id="searchButton" style="width: 40px; margin-left: 5px;">
          <i class="fas fa-search"></i>
        </button>
      `;
    }

    // Function to create the Sort Order Dropdown Container
    function createSortDropdownContainer() {
      return `
        ${createSortDropdown()}
      `;
    }

    // Determine if the user is a GM
    const isGM = game.user.isGM;

    if (isGM) {
      // === Corrected Actor Grouping ===

      // Get all actors that have player owners (Players)
      const playersActors = game.actors.filter(actor => actor.hasPlayerOwner && actor.type === "character");

      // Get all actors of type "character" without player owners (Characters)
      const charactersActors = game.actors.filter(actor => actor.type === "character" && !actor.hasPlayerOwner);

      // Get all actors of type "minion"
      const minionsActors = game.actors.filter(actor => actor.type === "minion");

      // Get all actors of type "rival"
      const rivalsActors = game.actors.filter(actor => actor.type === "rival");

      // Get all actors of type "nemesis"
      const nemesesActors = game.actors.filter(actor => actor.type === "nemesis");

      // Group actors
      const actorsGrouped = {
        players: playersActors,
        characters: charactersActors,
        minions: minionsActors,
        rivals: rivalsActors,
        nemeses: nemesesActors
      };

      // Create actor dropdown with headers
      const actorDropdownHTML = createActorDropdown(actorsGrouped);

      // Insert dropdown, type selector, sort dropdown, and search field into gmView div
      html.find('#gmView').html(
        actorDropdownHTML +
        createTypeDropdown() +
        createSortDropdownContainer() + // Sort Dropdown is displayed by default
        createSearchField()
      );

      // Set sortDropdown to "tierName" by default
      html.find('#sortDropdown').val("tierName");

      // Add event listener to dropdown to update genesysTestBox based on selection
      html.find('#actorDropdown').on('change', async (event) => {
        await updateDisplay();
      });

      // Add event listener to type dropdown to show/hide sort dropdown
      html.find('#typeDropdown').on('change', async (event) => {
        const selectedType = event.target.value;
        if (selectedType === "talent") {
          html.find('#sortDropdown').css('display', 'inline-block');
        } else {
          html.find('#sortDropdown').css('display', 'none');
        }
        await updateDisplay();
      });

      // Add event listener to sort dropdown
      html.find('#sortDropdown').on('change', async (event) => {
        await updateDisplay();
      });

      // Add event listener to search button
      html.find('#searchButton').on('click', async (event) => {
        await updateDisplay();
      });

      // Populate genesysTestBox with the first available actor's items by default
      if (
        actorsGrouped.players.length > 0 ||
        actorsGrouped.characters.length > 0 ||
        actorsGrouped.minions.length > 0 ||
        actorsGrouped.rivals.length > 0 ||
        actorsGrouped.nemeses.length > 0
      ) {
        updateDisplay();
      }

    } else {
      // User is a player
      let actor;

      // Get the actor associated with the player's account
      actor = game.user.character;

      if (actor) {
        // Insert type dropdown, sort dropdown, search field, and sort dropdown container for players
        html.find('#genesysTestBox').before(
          createTypeDropdown() +
          createSortDropdownContainer() + // Sort Dropdown is displayed by default
          createSearchField()
        );

        // Set sortDropdown to "tierName" by default
        html.find('#sortDropdown').val("tierName");

        // Add event listener to type dropdown to show/hide sort dropdown
        html.find('#typeDropdown').on('change', async (event) => {
          const selectedType = event.target.value;
          if (selectedType === "talent") {
            html.find('#sortDropdown').css('display', 'inline-block');
          } else {
            html.find('#sortDropdown').css('display', 'none');
          }
          await updateDisplay();
        });

        // Add event listener to sort dropdown
        html.find('#sortDropdown').on('change', async (event) => {
          await updateDisplay();
        });

        // Add event listener to search button
        html.find('#searchButton').on('click', async (event) => {
          await updateDisplay();
        });

        // Populate genesysTestBox with the player's own character's items by default with "tierName" sort
        populateGenesysTestBox(actor, "talent", "tierName"); // Default to "talent" and "tierName"
      }
    }

    // Function to update the display based on current selections and search
    async function updateDisplay() {
      let actor;
      let type = "talent"; // default
      let sortOption = "tierName"; // default sort to "tierName" instead of "default"

      if (isGM) {
        const selectedActorId = html.find('#actorDropdown').val();
        actor = game.actors.get(selectedActorId);
        type = html.find('#typeDropdown').val();
        if (type === "talent") {
          sortOption = html.find('#sortDropdown').val() || "tierName"; // Fallback to "tierName"
        }
      } else {
        actor = game.user.character;
        type = html.find('#typeDropdown').val();
        if (type === "talent") {
          sortOption = html.find('#sortDropdown').val() || "tierName"; // Fallback to "tierName"
        }
      }

      if (actor) {
        populateGenesysTestBox(actor, type, sortOption);
      }
    }

    // Function to populate genesysTestBox with sorted items based on type and search
    async function populateGenesysTestBox(actor, type, sortOption = "tierName") { // Set default to "tierName"
      let items;
      if (type === "talent") {
        // Get items of type "talent"
        items = actor.items.filter(item => item.type === "talent");
      } else if (type === "ability") {
        // Get items of type "ability"
        items = actor.items.filter(item => item.type === "ability");
      }

      // Sort items
      if (type === "talent") {
        if (sortOption === "name") {
          // Sort talents by name
          items.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === "tier") {
          // Sort talents by tier
          items.sort((a, b) => {
            const tierA = parseInt(a.system.tier, 10);
            const tierB = parseInt(b.system.tier, 10);
            return tierA - tierB;
          });
        } else if (sortOption === "tierName") {
          // Sort talents by tier then name
          items.sort((a, b) => {
            const tierA = parseInt(a.system.tier, 10);
            const tierB = parseInt(b.system.tier, 10);
            if (tierA !== tierB) {
              return tierA - tierB;
            }
            return a.name.localeCompare(b.name);
          });
        }
        // "default" sort order: original order (no sorting)
      } else if (type === "ability") {
        // Sort abilities by name
        items.sort((a, b) => a.name.localeCompare(b.name));
      }

      // Get search terms
      const searchInput = html.find('#searchBox').val().trim().toLowerCase();
      const searchTerms = searchInput.split(/\s+/).filter(term => term.length > 0);

      // Filter items based on search
      if (searchTerms.length > 0) {
        items = items.filter(item => {
          const name = item.name.toLowerCase();
          const description = (item.system.description || "").toLowerCase();
          return searchTerms.every(term => name.includes(term) || description.includes(term));
        });
      }

      // Create HTML table
      const table = createTalentTable(items, type);

      // Insert table into genesysTestBox
      html.find('#genesysTestBox').html(table);
    }

    // === Inserted Code Ends Here ===
  }
});

// Render the dialog with specific options for size and resizable behavior
myDialog.render(true, {
  height: 600, // Set initial height
  width: 900,  // Increased width to accommodate additional dropdowns and search
  resizable: true, // Allow the dialog to be resized
  id: "genesysTestBoxDialog" // Set the dialog's ID here
});


function replaceSymbols(string){
	
    string = string.replaceAll("[th]", `<span class="dietype genesys threat">h</span>`);
    string = string.replaceAll("[tr]", `<span class="dietype genesys triumph">t</span>`);
    string = string.replaceAll("[ad]", `<span class="dietype genesys advantage">a</span>`);
    string = string.replaceAll("[fa]", `<span class="dietype genesys failure">f</span>`);
    string = string.replaceAll("[su]", `<span class="dietype genesys success">s</span>`);
    string = string.replaceAll("[de]", `<span class="dietype genesys despair">d</span>`);
    string = string.replaceAll("[se]", `<span class="dietype starwars setback">b</span>`);
    string = string.replaceAll("[bo]", `<span class="dietype starwars boost">b</span>`);
    string = string.replaceAll("[ch]", `<span class="dietype starwars challenge">c</span>`);
    string = string.replaceAll("[di]", `<span class="dietype starwars difficulty">d</span>`);
    string = string.replaceAll("[pr]", `<span class="dietype starwars proficiency">c</span>`);
    string = string.replaceAll("[threat]", `<span class="dietype genesys threat">h</span>`);
    string = string.replaceAll("[triumph]", `<span class="dietype genesys triumph">t</span>`);
    string = string.replaceAll("[advantage]", `<span class="dietype genesys advantage">a</span>`);
    string = string.replaceAll("[failure]", `<span class="dietype genesys failure">f</span>`);
    string = string.replaceAll("[success]", `<span class="dietype genesys success">s</span>`);
    string = string.replaceAll("[despair]", `<span class="dietype genesys despair">d</span>`);
    string = string.replaceAll("[setback]", `<span class="dietype starwars setback">b</span>`);
    string = string.replaceAll("[boost]", `<span class="dietype starwars boost">b</span>`);
    string = string.replaceAll("[challenge]", `<span class="dietype starwars challenge">c</span>`);
    string = string.replaceAll("[difficulty]", `<span class="dietype starwars difficulty">d</span>`);
    string = string.replaceAll("[proficiency]", `<span class="dietype starwars proficiency">c</span>`);
    return string;
}
