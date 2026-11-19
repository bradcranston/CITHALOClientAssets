let table;

window.loadTable = (json) => {
  const obj = JSON.parse(json);
  const data = obj;

  // Calculate counts
  const totalCount = data.length;
  const windowsCount = data.filter((item) =>
    item.fieldData.OperatingSystem.includes("Windows")
  ).length;
  const macCount = data.filter((item) =>
    item.fieldData.OperatingSystem.includes("macOS")
  ).length;
  const iosCount = data.filter(
    (item) =>
      item.fieldData.OperatingSystem.includes("iOS") ||
      item.fieldData.OperatingSystem.includes("iPadOS")
  ).length;
  const otherCount = totalCount - (windowsCount + macCount + iosCount);

  // Update header counts
  document.getElementById(
    "total-count"
  ).textContent = `Total Devices: ${totalCount}`;
  document.getElementById(
    "windows-count"
  ).textContent = `Windows: ${windowsCount}`;
  document.getElementById("macos-count").textContent = `macOS: ${macCount}`;
  document.getElementById("ios-count").textContent = `iOS: ${iosCount}`;
  document.getElementById("other-count").textContent = `Other: ${otherCount}`;

  // Initialize DataTable
  const columns = [
    { title: "Asset Tag", data: "fieldData.assetTag" },
  //  { title: "Assigned User", data: "fieldData.assignedUser" },
    { title: "HALO User", data: "fieldData.HALOUser" },
    { title: "HALO Status", data: "fieldData.HALOStatus" },
    { title: "Name", data: "fieldData.Name" },
    { title: "Model", data: "fieldData.ModelID" },
    { title: "Operating System", data: "fieldData.OperatingSystem" },
    { title: "Serial Number", data: "fieldData.SerialNumber" },
    {
      title: "Root Capacity",
      data: "fieldData.BootVolumeCapacity",
      render: function (data) {
        return data ? Math.floor(data * 100) / 100 : data;
      },
    },
    {
      title: "Root Usage",
      data: "fieldData.BootVolumeUsage",
      render: function (data) {
        return data ? Math.floor(data * 100) / 100 : data;
      },
    },
    {
      title: "Usage (%)",
      data: null,
      render: function (data) {
        const capacity = data.fieldData.BootVolumeCapacity;
        const usage = data.fieldData.BootVolumeUsage;
        return capacity && usage
          ? Math.floor((usage / capacity) * 10000) / 100 + "%"
          : "N/A";
      },
    },
    { title: "Processor", data: "fieldData.Processor" },
    { title: "RAM", data: "fieldData.InstalledRAM" },
    { title: "Product Description", data: "fieldData.ProductDescription" },
    { title: "User", data: "fieldData.User" },
    { title: "Client", data: "fieldData.Client" },
  ];

  
  // Initialize DataTable
  table = $("#table").DataTable({
    columns,
    data,
    paging: false,
    colReorder: true,
    dom: "Pfrtip",
    buttons: ["copy", "csv", "excel", "pdf", "print"],
    searchPanes: {
      cascadePanes: true,
      initCollapsed: true,
      columns: [14, 4], // Enable SearchPane for Product ID & Client Name
      threshold: 0.5, // Adjust if needed
    },
    fixedHeader: {
      header: true,
      footer: true,
    },
    scrollCollapse: true,
    scrollX: true,
    scrollY: "80vh",
  });

  // Custom search input event listener
  document
    .getElementById("custom-search")
    .addEventListener("input", function () {
      table.search(this.value).draw();
    });

  // Filtering and highlighting logic
  const headerItems = document.querySelectorAll(".header-item");

  function applyFilter(filterFunction) {
    table.clear();
    table.rows.add(filterFunction ? data.filter(filterFunction) : data).draw();
  }

  function setActive(item) {
    headerItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
  }

  document.getElementById("total-count").addEventListener("click", function () {
    applyFilter(null);
    setActive(this);
  });

  document
    .getElementById("windows-count")
    .addEventListener("click", function () {
      applyFilter((item) => item.fieldData.OperatingSystem.includes("Windows"));
      setActive(this);
    });

  document.getElementById("macos-count").addEventListener("click", function () {
    applyFilter((item) => item.fieldData.OperatingSystem.includes("macOS"));
    setActive(this);
  });

  document.getElementById("ios-count").addEventListener("click", function () {
    applyFilter((item) => {
      const os = item.fieldData.OperatingSystem;
      return os.includes("iOS") || os.includes("iPadOS");
    });
    setActive(this);
  });
  

  document.getElementById("other-count").addEventListener("click", function () {
    applyFilter((item) => {
      const os = item.fieldData.OperatingSystem;
      return (
        !os.includes("Windows") && !os.includes("macOS") && !os.includes("iOS") && !os.includes("iPadOS")
      );
    });
    setActive(this);
  });


  $('#table tbody').on('click', 'tr', function (e) {
    if (!$(e.target).is('button, a, input')) {
      const rowData = table.row(this).data();
      const build = {};
      build.data = rowData;
      build.mode = 'card';
      const dataExport = JSON.stringify(build);
      FileMaker.PerformScriptWithOption("Manage: Client API", dataExport, "0");
    }
  });
  




  window.updateAssignedUser = (recordId, newAssignedUser) => {
    try {
      // Normalize the input recordId to a string
      const normalizedRecordId = String(recordId).trim();
  
      // Find the row data matching the recordId
      const rowIndex = table
        .rows()
        .indexes()
        .filter((idx) => {
          const currentRecordId = String(
            table.row(idx).data().fieldData.recordId
          ).trim();
          return currentRecordId === normalizedRecordId;
        })[0];
  
      if (rowIndex !== undefined) {
        // Update the assignedUser field in the data object
        const rowData = table.row(rowIndex).data();
        rowData.fieldData.assignedUser = newAssignedUser;
  
        // Update the row in the DataTable
        table.row(rowIndex).data(rowData).draw();
      }
    } catch (error) {
      console.error("An error occurred while updating assignedUser:", error);
    }
  };
  
  


// Add function to update the assetTag on the window object
window.updateAssetTag = (recordId, newAssetTag) => {
  // Find the row data matching the recordId
  const rowIndex = table
    .rows()
    .indexes()
    .filter((idx) => table.row(idx).data().fieldData.recordId === recordId)[0];

  if (rowIndex !== undefined) {
    // Update the AssetTag field in the data object
    const rowData = table.row(rowIndex).data();
    rowData.fieldData.assetTag = newAssetTag;

    // Update the row in the DataTable
    table.row(rowIndex).data(rowData).draw();

    // Optionally log or notify the user
    console.log(`Updated assetTag for recordId ${recordId} to ${newAssetTag}`);
  } else {
    console.warn(`Row with recordId ${recordId} not found.`);
  }
};



window.updateAssetTag = (recordId, newAssetTag) => {
  try {
    // Normalize the input recordId to a string
    const normalizedRecordId = String(recordId).trim();

    // Find the row data matching the recordId
    const rowIndex = table
      .rows()
      .indexes()
      .filter((idx) => {
        const currentRecordId = String(
          table.row(idx).data().fieldData.recordId
        ).trim();
        return currentRecordId === normalizedRecordId;
      })[0];

    if (rowIndex !== undefined) {
      // Update the newAssetTag field in the data object
      const rowData = table.row(rowIndex).data();
      rowData.fieldData.assetTag = newAssetTag;

      // Update the row in the DataTable
      table.row(rowIndex).data(rowData).draw();
    }
  } catch (error) {
    console.error("An error occurred while updating AssetTag:", error);
  }
};

window.exportFM = function () {
  // Ensure buttons API is loaded
  if ($.fn.DataTable.Buttons) {
    // Get exported data
    let dataExport = table.buttons.exportData({
      columns: ":visible", // Export only visible columns
    });

    let build = {
      dataExport: dataExport,
      mode: "dataExport",
    };

    console.log(build);
    FileMaker.PerformScriptWithOption(
      "Manage: Client API",
      JSON.stringify(build),
      "0"
    );
  } else {
    console.error("Buttons API not loaded correctly.");
  }
};



};
