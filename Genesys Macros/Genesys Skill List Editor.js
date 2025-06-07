/*
System: FFG Star Wars for Foundry VTT
Purpose: This macro is for aiding in creating custom skills from existing skill lists while minimizing the possibility of damaging the JSON structure of the skill list.
Author: Lyinggod
Version: 1.0.2
History:
1.0.2 - 2025-06-07 - Removed extra column. Fixed missing skill list name.
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
   * Utility function to sanitize a string by removing characters other than letters, numbers, and underscores.
   */
  function sanitizeString(str) {
    return str.replace(/[^A-Za-z0-9_]/g, "");
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
       /* Style for highlighting duplicate 'abrev' fields */
       .duplicate-error {
           background-color: #F08080 !important; /* lightcoral */
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
              <th style="border-bottom: 1px solid #999; position: relative;">
                key
                <button class="sort-button" data-sort="key" title="Sort by Key" style="background:none; border:none; cursor:pointer; position: absolute; right: -25px; color: white; top: 50%; transform: translateY(-50%);">
                  <i class="fas fa-sort"></i>
                </button>
              </th>
              <th style="border-bottom: 1px solid #999; position: relative;">
                type
                <button class="sort-button" data-sort="type" title="Sort by Type then Key" style="background:none; border:none; cursor:pointer; position: absolute; right: -25px; color: white; top: 50%; transform: translateY(-50%);">
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
      const defaultSkillLists = [...game.settings.settings.entries()]
        .find(([key, value]) => key === "starwarsffg.arraySkillList")?.[1].default;
      const skillLists = allSkillLists.length == 0 ? defaultSkillLists : allSkillLists;
      
      /**
       * Scans all 'abrev' fields, finds duplicates, and highlights them.
       * @returns {boolean} - True if duplicates were found, false otherwise.
       */
      function validateAbrevDuplicates(html) {
          const abrevInputs = html.find('#skill-rows .abrev');
          const values = {}; // To store counts of each value
          const duplicates = new Set(); // To store the values that are duplicated

          // First pass: find duplicate values
          abrevInputs.each(function() {
              const value = $(this).val();
              if (value) { // Ignore empty values
                  values[value] = (values[value] || 0) + 1;
                  if (values[value] > 1) {
                      duplicates.add(value);
                  }
              }
          });

          // Second pass: apply or remove the highlighting class
          abrevInputs.each(function() {
              const input = $(this);
              const value = input.val();
              if (value && duplicates.has(value)) {
                  input.addClass('duplicate-error');
              } else {
                  input.removeClass('duplicate-error');
              }
          });

          return duplicates.size > 0;
      }

      // Populate the dropdown on Tab 1
      html.find('#skill-list-dropdown').append(
        skillLists.map(list => `<option value="${list.id}">${list.id}</option>`).join('')
      );

      // Dropdown change: fill the JSON textarea and skill list name
      html.find('#skill-list-dropdown').on('change', (event) => {
        const selectedId = event.currentTarget.value;
        const selectedSkillSet = skillLists.find(obj => obj.id === selectedId);
        if (selectedSkillSet) {
          html.find('#tab1-json').val(JSON.stringify(selectedSkillSet, null, 2));
          if (selectedSkillSet.id) {
              html.find('#skill-list-name').val(selectedSkillSet.id);
          }
        } else {
          html.find('#tab1-json').val('');
          html.find('#skill-list-name').val('');
        }
      });

      // Clicking "Import JSON": parse the JSON and populate Tab 2
      html.find('#import-json').on('click', () => {
        let rawJson = html.find('#tab1-json').val() || "";
        let parsed;
        try {
          parsed = JSON.parse(rawJson);
        } catch (error) { ui.notifications.error("Invalid JSON in Tab 1 text area!"); return; }
        if (!parsed.skills || typeof parsed.skills !== 'object') {
          ui.notifications.error("'skills' field is missing or invalid in the JSON!"); return;
        }
        if (!html.find('#skill-list-name').val() && parsed.id) {
            html.find('#skill-list-name').val(parsed.id);
        }

        for (let [skillKey, skillData] of Object.entries(parsed.skills)) {
          if (!skillData.abrev) {
            skillData.abrev = sanitizeString(skillData.label || skillKey);
          }
        }
        parsed.skills = parsed.skills;

        const skillTableBody = html.find('#skill-rows');
        skillTableBody.empty();

        const skillEntries = Object.entries(parsed.skills || {});
        for (let [skillKey, skillData] of skillEntries) {
          let sanitizedAbrev = sanitizeString(skillData.label || skillKey);
          let row = $(`
            <tr>
              <td><input type="text" class="key" value="${game.i18n.localize(skillData.label || skillKey)}"/></td>
              <td><select class="type">${["General", "Knowledge", "Social", "Magic", "Combat"].map(t => `<option value="${t}" ${t === skillData.type ? "selected" : ""}>${t}</option>`).join('')}</select></td>
              <td><input type="text" class="abrev" value="${sanitizedAbrev}" disabled/></td>
              <td><select class="characteristic">${["Agility","Brawn","Intellect","Willpower","Cunning","Presence"].map(c => `<option value="${c}" ${c === skillData.characteristic ? "selected" : ""}>${c}</option>`).join('')}</select></td>
              <td><select class="max">${Array.from({length:10}, (_, i) => `<option value="${i + 1}" ${i + 1 === (skillData.max === undefined ? 6 : skillData.max) ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></td>
              <td style="text-align: center;"><button class="delete-row" title="Delete Skill" style="background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td>
            </tr>
          `);
          skillTableBody.append(row);
        }
        initializeRowEvents(html);
        validateAbrevDuplicates(html); // Check for duplicates after import
        switchTab(html, 2);
      });

      /**
       * Function to initialize event listeners for key inputs, delete buttons, and sort buttons.
       */
      function initializeRowEvents(html) {
        // Handle live typing in key fields to update the abrev field and validate
        html.find('.key').off('input').on('input', function() {
          const keyInput = $(this);
          const newKey = keyInput.val();
          const sanitized = sanitizeString(newKey);
          keyInput.closest('tr').find('.abrev').val(sanitized);
          validateAbrevDuplicates(html);
        });

        // Handle delete row
        html.find('.delete-row').off('click').on('click', function() {
          if (confirm("Are you sure you want to delete this skill?")) {
            $(this).closest('tr').remove();
            validateAbrevDuplicates(html);
          }
        });

        // Handle sort buttons
        html.find('.sort-button').off('click').on('click', function() {
          const sortType = $(this).data('sort');
          if (sortType === 'key') sortTableByKey(html);
          else if (sortType === 'type') sortTableByTypeThenKey(html);
        });
      }
      
      function sortTableByKey(html) {
        const tbody = html.find('#skill-rows');
        const rows = tbody.find('tr').get();
        rows.sort((a, b) => $(a).find('.key').val().toUpperCase().localeCompare($(b).find('.key').val().toUpperCase()));
        $.each(rows, (i, row) => tbody.append(row));
      }

      function sortTableByTypeThenKey(html) {
        const tbody = html.find('#skill-rows');
        const rows = tbody.find('tr').get();
        rows.sort((a, b) => {
          const typeA = $(a).find('.type').val();
          const typeB = $(b).find('.type').val();
          const keyA = $(a).find('.key').val();
          const keyB = $(b).find('.key').val();
          return typeA.localeCompare(typeB) || keyA.localeCompare(keyB);
        });
        $.each(rows, (i, row) => tbody.append(row));
      }

      // "Add New Skill" button functionality
      html.find('#add-new-skill').on('click', () => {
        const currentAttMax = parseInt(html.find('#attMax').val()) || 6;
        let newRow = $(`
          <tr>
            <td><input type="text" class="key" value=""/></td>
            <td><select class="type">${["General", "Knowledge", "Social", "Magic", "Combat"].map(t => `<option value="${t}">${t}</option>`).join('')}</select></td>
            <td><input type="text" class="abrev" value="" disabled/></td>
            <td><select class="characteristic">${["Agility","Brawn","Intellect","Willpower","Cunning","Presence"].map(c => `<option value="${c}">${c}</option>`).join('')}</select></td>
            <td><select class="max">${Array.from({length:10}, (_, i) => `<option value="${i + 1}" ${i + 1 === currentAttMax ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></td>
            <td style="text-align: center;"><button class="delete-row" title="Delete Skill" style="background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td>
          </tr>
        `);
        html.find('#skill-rows').prepend(newRow);
        initializeRowEvents(html);
      });

      // "Generate JSON" button: read data from Tab 2 and display in Tab 3
      html.find('#go-to-tab3').on('click', () => {
        let skillListName = html.find('#skill-list-name').val().trim();
        if (!skillListName) {
          ui.notifications.error("Please enter a Skill List Name.");
          return;
        }

        // Run final validation. If duplicates exist, notify user and stop.
        if (validateAbrevDuplicates(html)) {
            ui.notifications.error("Duplicate 'abrev' values detected. Please ensure all sanitized keys are unique. Duplicates are highlighted in red.");
            return;
        }
        
        let skillsObj = {};
        let hasErrors = false;

        html.find('#skill-rows tr').each((i, rowEl) => {
          let row = $(rowEl);
          let keyVal = row.find('.key').val().trim();
          let abrevVal = row.find('.abrev').val().trim();
          
          if (!keyVal || !abrevVal) {
            ui.notifications.error("All skills must have a valid 'key' (which generates an 'abrev'). One was found empty.");
            hasErrors = true;
            return false;
          }

          skillsObj[abrevVal] = {
            rank: 0,
            groupskill: false,
            careerskill: false,
            custom: true,
            characteristic: row.find('.characteristic').val(),
            type: row.find('.type').val(),
            max: parseInt(row.find('.max').val() || "6"),
            label: keyVal,
            abrev: abrevVal
          };
        });

        if (hasErrors) return;

        let finalJson = { id: skillListName, skills: skillsObj };
        html.find('#tab3-json').val(JSON.stringify(finalJson, null, 2));
        switchTab(html, 3);
      });

      html.find('#attMax').on('change', function() {
        html.find('.max').val(parseInt($(this).val()) || 6);
      });

      html.find('.tab-buttons button').on('click', (event) => {
        switchTab(html, event.currentTarget.dataset.tab);
      });

      initializeRowEvents(html);
    }
  }, { height: 800, width: 800 }).render(true);
})();
