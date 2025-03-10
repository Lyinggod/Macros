/*
System: FFG Star Wars for Foundry VTT
Purpose: This macro is for aiding in creating custom skills from existing skill lists while minimizing the possibility of damaging the JSON structure of the skill list.
Author: Lyinggod
Version: 1.0.1
History:
1.0.1 - 2025-02-06 - skill lists did not appear on new world
*/

(async () => {
  /**
   * Utility function to switch which tab is visible.
   */
  function switchTab(html, tabNumber) {
    html.find('.tab-buttons button').removeClass('active');
    html.find(`.tab-buttons button[data-tab="${tabNumber}"]`).addClass('active');
    html.find('.tab-content').hide();
    html.find(`#tab${tabNumber}`).show();
  }

  /**
   * Utility function to sanitize a string by removing non-alphabetical characters.
   */
  function sanitizeString(str) {
    return str.replace(/[^A-Za-z]/g, "");
  }

  /**
   * Utility function to sanitize skill list name by replacing spaces with underscores and removing non-alphabetical characters.
   */
  function sanitizeSkillListName(name) {
    return sanitizeString(name.replace(/\s+/g, "_"));
  }

  new Dialog({
    title: "Skill List Editor",
   content: `
   <style>
       .tab-buttons button{
           width:32.5%;
       }
       .tab-buttons button.active{
           background: pink;
       }
   </style>
      <div class="tab-buttons" style="margin-bottom: 10px;">
        <button data-tab="1" class="active">Select/Import Tab</button>
        <button data-tab="2">Edit Skills Tab</button>
        <button data-tab="3">Export JSON Tab</button>
      </div>

      <!-- TAB 1 -->
      <div id="tab1" class="tab-content">
        <h2>Select/Import</h2>
                <b>Instructions:</b><br>
        1) Select skill list from dropdown. These are currently installed skill lists<br>
        2) Click <i>Import JSON</i> button<br>
        3) Enter <i>Skill List Name</i> - must be spaces and letters only<br>
        4) Select Maximum Attribute value (default 6)<br>
        5) Edit, Add, or Delete skills. Some columns sortable<br>
        6) Click <i>Generate Skill List</i> to create skill list. Paste this into text file with <i>.json</i> extension and import using system skill import function.<br>
        <div>
          <label for="skill-list-dropdown"><strong>Select Skill List:</strong></label>
          <select id="skill-list-dropdown" style="margin-left: 10px;">
            <option value="">-- Select a skill list --</option>
          </select>
        </div>
        <div style="margin-top: 10px;">
          <button id="import-json">Import JSON → Go to Edit Skills tab</button>
        </div>
        
        <p style="margin-top: 10px;"><strong>JSON Preview:</strong></p>
        <textarea readonly id="tab1-json" style="user-select: text; resize: none; width: 100%; height: 454px;"></textarea>

      </div>

      <!-- TAB 2 -->
      <div id="tab2" class="tab-content" style="display:none;">
        <h2>Edit Skills</h2>
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <label style="flex: 0 0 78%;">
            <strong>Skill List Name:</strong>
            <input type="text" id="skill-list-name" style="width: 100%; margin-left: 5px;" />
          </label>
          <label style="flex: 0 0 20%; margin-left: 10px;">
            <strong>Attribute Maximum:</strong>
            <select id="attMax" style="width: 100%; margin-left: 5px;">
              ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${i + 1 === 6 ? 'selected' : ''}>${i + 1}</option>`).join('')}
            </select>
          </label>
        </div>
        <div style="margin-bottom: 10px;">
          <button id="add-new-skill" style="width:49.5%">Add New Skill</button>
        
          <button id="go-to-tab3"  style="width:49.5%">Generate JSON → Go to Export Tab</button>
        </div>
        <div style="height: 592px; overflow: scroll;" >
        <table style="width: 99.5%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border-bottom: 1px solid #999;">key</th>
              <th style="border-bottom: 1px solid #999; position: relative;">
                label
                <button class="sort-button" data-sort="label" title="Sort by Label" style="background:none; border:none; cursor:pointer; position: absolute; right: -25px; color: white; top: 50%; transform: translateY(-50%);">
                  <i class="fas fa-sort"></i>
                </button>
              </th>
              <th style="border-bottom: 1px solid #999; position: relative;">
                type
                <button class="sort-button" data-sort="type" title="Sort by Label then Type" style="background:none; border:none; cursor:pointer; position: absolute; right: -25px; color: white; top: 50%; transform: translateY(-50%);">
                  <i class="fas fa-sort"></i>
                </button>
              </th>
              <th style="border-bottom: 1px solid #999;">abrev</th>
              <th style="border-bottom: 1px solid #999;">characteristic</th>
              <th style="border-bottom: 1px solid #999;">max</th>
              <th style="border-bottom: 1px solid #999;"></th>
            </tr>
          </thead>
          <tbody id="skill-rows"></tbody>
        </table>
        </div>
  
      </div>

      <!-- TAB 3 -->
      <div id="tab3" class="tab-content" style="display:none;">
        <h2>Final JSON</h2>
        Copy the json below into a text file with a <b>.json</b> extension and import into system using standard methods. 
        <textarea readonly id="tab3-json" style="overflow: scroll; width:100%; height:684px;"></textarea>
      </div>
    `,
    buttons: {},
    render: (html) => {
      // Retrieve skill lists from the "starwarsffg.arraySkillList" world setting.
      const allSkillLists = [...game.settings.storage.get("world").entries()]
        .find(([_, value]) => value.key.includes("starwarsffg.arraySkillList"))?.[1].value || [];
      console.info("allSkillLists",allSkillLists)
      const defaultSkillLists = [...game.settings.settings.entries()]
  .find(([key, value]) => key === "starwarsffg.arraySkillList")?.[1].default;
      const skillLists = allSkillLists.length == 0 ? defaultSkillLists : allSkillLists;
console.info("defaultSkillLists",defaultSkillLists)
      
      // Populate the dropdown on Tab 1
      html.find('#skill-list-dropdown').append(
        skillLists.map(list => `<option value="${list.id}">${list.id}</option>`).join('')
      );

      // Dropdown change: fill the JSON textarea with the selected skill set
      html.find('#skill-list-dropdown').on('change', (event) => {
        const selectedId = event.currentTarget.value;
        const selectedSkillSet = skillLists.find(obj => obj.id === selectedId);
        if (selectedSkillSet) {
          html.find('#tab1-json').val(JSON.stringify(selectedSkillSet, null, 2));
        } else {
          html.find('#tab1-json').val('');
        }
      });

      // Clicking "Import JSON": parse the JSON and populate Tab 2
      html.find('#import-json').on('click', () => {
        let rawJson = html.find('#tab1-json').val() || "";
        let parsed;
        try {
          parsed = JSON.parse(rawJson);
        } catch (error) {
          ui.notifications.error("Invalid JSON in Tab 1 text area!");
          return;
        }

        // Ensure 'skills' exists and is an object
        if (!parsed.skills || typeof parsed.skills !== 'object') {
          ui.notifications.error("'skills' field is missing or invalid in the JSON!");
          return;
        }

        // Populate "Skill List Name" from the JSON's "id"
        //html.find('#skill-list-name').val(parsed.id || "");
        html.find('#skill-list-name').val("");

        // Iterate over each skill to ensure 'label' and 'abrev' exist
        for (let [skillKey, skillData] of Object.entries(parsed.skills)) {
          if (!skillData.label) {
            skillData.label = skillKey;
          }
          if (!skillData.abrev) {
            skillData.abrev = sanitizeString(skillKey);
          }
        }

        // Re-assign the modified skills back to parsed.skills
        parsed.skills = parsed.skills;

        // Build the table rows from parsed.skills
        const skillTableBody = html.find('#skill-rows');
        skillTableBody.empty();

        const skillEntries = Object.entries(parsed.skills || {});
        for (let [skillKey, skillData] of skillEntries) {
          // Localize label
          let localizedLabel = game.i18n.localize(skillData.label);
          // "label" is the localized text
          // "abrev" and "key" are the *alpha-only* version of the localized text
          let alphaOnly = sanitizeString(localizedLabel);

          let row = $(`
            <tr>
              <td><input type="text" class="key" value="${alphaOnly}" disabled/></td>
              <td><input type="text" class="label" value="${localizedLabel}"/></td>
              <td>
                <select class="type">
                  ${["General", "Knowledge", "Social", "Magic", "Combat"].map(t => {
                    let sel = (t === skillData.type) ? "selected" : "";
                    return `<option value="${t}" ${sel}>${t}</option>`;
                  }).join('')}
                </select>
              </td>
              <td><input type="text" class="abrev" value="${alphaOnly}" disabled/></td>
              <td>
                <select class="characteristic">
                  ${["Agility","Brawn","Intellect","Willpower","Cunning","Presence"].map(c => {
                    let sel = (c === skillData.characteristic) ? "selected" : "";
                    return `<option value="${c}" ${sel}>${c}</option>`;
                  }).join('')}
                </select>
              </td>
              <td>
                <select class="max">
                  ${Array.from({length:10}, (_, i) => {
                    const selectedValue = skillData.max === undefined ? 6 : skillData.max;
                    return `<option value="${i + 1}" ${i + 1 === selectedValue ? 'selected' : ''}>${i + 1}</option>`;
                  }).join('')}
                </select>
              </td>
              <td style="text-align: center;">
                <button class="delete-row" title="Delete Skill" style="background:none; border:none; cursor:pointer;">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          `);
          skillTableBody.append(row);
        }

        // Initialize event listeners for existing rows
        initializeRowEvents(html);

        // Switch to Tab 2
        switchTab(html, 2);
      });

      /**
       * Function to initialize event listeners for label inputs, delete buttons, and sort buttons.
       */
      function initializeRowEvents(html) {
        // Handle live typing in label fields
        html.find('.label').off('input').on('input', function() {
          const labelInput = $(this);
          const newLabel = labelInput.val();
          const sanitized = sanitizeString(newLabel);
          const row = labelInput.closest('tr');
          row.find('.key').val(sanitized);
          row.find('.abrev').val(sanitized);
        });

        // Handle delete row
        html.find('.delete-row').off('click').on('click', function() {
          if (confirm("Are you sure you want to delete this skill?")) {
            $(this).closest('tr').remove();
          }
        });

        // Handle sort buttons
        html.find('.sort-button').off('click').on('click', function() {
          const sortType = $(this).data('sort');
          if (sortType === 'label') {
            sortTableByLabel(html);
          } else if (sortType === 'type') {
            sortTableByLabelThenType(html);
          }
        });
      }

      /**
       * Function to sort the table by the "label" column in ascending order.
       */
      function sortTableByLabel(html) {
        const tbody = html.find('#skill-rows');
        const rows = tbody.find('tr').get();

        rows.sort((a, b) => {
          const labelA = $(a).find('.label').val().toUpperCase();
          const labelB = $(b).find('.label').val().toUpperCase();
          if (labelA < labelB) return -1;
          if (labelA > labelB) return 1;
          return 0;
        });

        $.each(rows, function(index, row) {
          tbody.append(row);
        });
      }

      /**
       * Function to sort the table first by "label" and then by "type" in ascending order.
       */
      function sortTableByLabelThenType(html) {
        const tbody = html.find('#skill-rows');
        const rows = tbody.find('tr').get();

        rows.sort((a, b) => {
            
          const typeA = $(a).find('.type').val().toUpperCase();
          const typeB = $(b).find('.type').val().toUpperCase();
          if (typeA < typeB) return -1;
          if (typeA > typeB) return 1;
            
          const labelA = $(a).find('.label').val().toUpperCase();
          const labelB = $(b).find('.label').val().toUpperCase();
          if (labelA < labelB) return -1;
          if (labelA > labelB) return 1;

          return 0;
        });

        $.each(rows, function(index, row) {
          tbody.append(row);
        });
      }

      // "Add New Skill" button functionality
      html.find('#add-new-skill').on('click', () => {
        const skillTableBody = html.find('#skill-rows');
        const currentAttMax = parseInt(html.find('#attMax').val()) || 6;
        let newRow = $(`
          <tr>
            <td><input type="text" class="key" value="" disabled/></td>
            <td><input type="text" class="label" value=""/></td>
            <td>
              <select class="type">
                ${["General", "Knowledge", "Social", "Magic", "Combat"].map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </td>
            <td><input type="text" class="abrev" value="" disabled/></td>
            <td>
              <select class="characteristic">
                ${["Agility","Brawn","Intellect","Willpower","Cunning","Presence"].map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </td>
            <td>
              <select class="max">
                ${Array.from({length:10}, (_, i) => `<option value="${i + 1}" ${i + 1 === currentAttMax ? 'selected' : ''}>${i + 1}</option>`).join('')}
              </select>
            </td>
            <td style="text-align: center;">
              <button class="delete-row" title="Delete Skill" style="background:none; border:none; cursor:pointer;">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `);
        skillTableBody.prepend(newRow);
        initializeRowEvents(html);
      });

      // "Generate JSON" button: read data from Tab 2 and display in Tab 3
      html.find('#go-to-tab3').on('click', () => {
        let skillListName = html.find('#skill-list-name').val().trim();
        if (!skillListName) {
          ui.notifications.error("Please enter a Skill List Name.");
          return;
        }

        let sanitizedSkillListName = sanitizeSkillListName(skillListName);

        let skillsObj = {};
        let hasErrors = false;

        html.find('#skill-rows tr').each((i, rowEl) => {
          let row = $(rowEl);
          let key = row.find('.key').val().trim();
          let labelVal = row.find('.label').val().trim();
          let typeVal = row.find('.type').val();
          let abrevVal = row.find('.abrev').val().trim();
          let characteristicVal = row.find('.characteristic').val();
          let maxVal = parseInt(row.find('.max').val() || "6");

          if (!key || !labelVal) {
            hasErrors = true;
            return false; // Break the loop
          }

          // Each skill includes rank, groupskill, careerskill, and custom in the final JSON
          skillsObj[key] = {
            rank: 0,
            groupskill: false,
            careerskill: false,
            custom: true,
            characteristic: characteristicVal,
            type: typeVal,
            max: maxVal,
            label: labelVal,
            abrev: abrevVal
          };
        });

        if (hasErrors) {
          ui.notifications.error("All skills must have a valid 'key' and 'label'.");
          return;
        }

        let finalJson = {
          id: sanitizedSkillListName,
          skills: skillsObj
        };

        // Put final JSON in Tab 3
        html.find('#tab3-json').val(JSON.stringify(finalJson, null, 2));
        switchTab(html, 3);
      });

      // "Att Max" dropdown functionality
      html.find('#attMax').on('change', function() {
        const newAttMax = parseInt($(this).val()) || 6;
        html.find('.max').each(function() {
          $(this).val(newAttMax);
        });
      });

      // Simple tab button click handling
      html.find('.tab-buttons button').on('click', (event) => {
        let tabNumber = event.currentTarget.dataset.tab;
        switchTab(html, tabNumber);
      });

      // Initialize sort button listeners if any existing rows
      initializeRowEvents(html);
    }
  }, { height: 800, width: 800 }).render(true);
})();
