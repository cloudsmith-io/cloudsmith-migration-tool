import React, { useState, useEffect, useMemo } from "react";
import ReactJson from "react-json-view";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SearchOutlined } from "@ant-design/icons";
import {
  faDatabase,
  faCloud,
  faProjectDiagram,
  faFolder,
  faFile,
  faLink,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  Modal,
  Tree,
  Input,
  Form,
  Row,
  Col,
  Tooltip,
  Spin,
  Card,
  Layout,
  Table,
  Space,
  Pagination
} from "antd";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ packageType: {}, repositoryType: {} });
  const [selectedRepoKey, setSelectedRepoKey] = useState(null);
  const [selectedRepos, setSelectedRepos] = useState({});
  const [displayData, setDisplayData] = useState("");
  const [repoCounts, setRepoCounts] = useState({});
  const [groupNames, setGroupNames] = useState([]);
  const [cloudsmithData, setCloudsmithData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [cloudsmithRepos, setCloudsmithRepos] = useState([]);
  const [cloudsmithUser, setCloudsmithUser] = useState("");
  const [setSearchText] = useState("");
  const [setSearchedColumn] = useState("");
  const { Header, Footer, Sider, Content } = Layout;
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [isThankYouModalVisible, setIsThankYouModalVisible] = useState(false);
  const [feedbackForm] = Form.useForm();

  const [cloudsmithApiKey, setCloudsmithApiKey] = useState(
    localStorage.getItem("cloudsmithApiKey") || ""
  );
  const [cloudsmithOrg, setCloudsmithOrg] = useState(
    localStorage.getItem("cloudsmithOrg") || ""
  );
  const [apiKeyJfrog, setApiKeyJfrog] = useState(
    localStorage.getItem("apiKeyJfrog") || ""
  );
  const [jfrogOrganisation, setJfrogOrganisation] = useState(
    localStorage.getItem("jfrogOrganisation") || ""
  );
  const [apiResponse, setApiResponse] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const uniquePackageTypes = [...new Set(data.map((item) => item.packageType))];
  const uniqueRepositoryTypes = [...new Set(data.map((item) => item.type))];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          (Object.keys(filter.packageType).every(
            (key) => !filter.packageType[key]
          ) ||
            filter.packageType[item.packageType]) &&
          (Object.keys(filter.repositoryType).every(
            (key) => !filter.repositoryType[key]
          ) ||
            filter.repositoryType[item.type]) &&
          item.key.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [data, filter, searchTerm]
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleCheckboxChange = (filterKey, value) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      [filterKey]: {
        ...prevFilter[filterKey],
        [value]: !prevFilter[filterKey][value],
      },
    }));
  };

  useEffect(() => {
    localStorage.setItem("cloudsmithApiKey", cloudsmithApiKey);
    localStorage.setItem("cloudsmithOrg", cloudsmithOrg);
    localStorage.setItem("apiKeyJfrog", apiKeyJfrog);
    localStorage.setItem("jfrogOrganisation", jfrogOrganisation);
  }, [cloudsmithApiKey, cloudsmithOrg, apiKeyJfrog, jfrogOrganisation]);

  const fetchCloudsmithRepos = async () => {
    const response = await fetch(
      "http://localhost:5000/api/cloudsmithRepoDetails",
      {
        method: "GET",
        headers: {
          "X-apiKey": cloudsmithApiKey,
          "X-owner-Host": cloudsmithOrg,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (response.headers.get("content-type").includes("application/json")) {
      const data = await response.json();
      return data; // Make sure to return the data
    } else {
      throw new Error("The server did not return a JSON response");
    }
  };

  const fetchCloudsmithUser = async () => {
    const response = await fetch(
      "http://localhost:5000/api/cloudsmithUserDetails",
      {
        method: "GET",
        headers: {
          "X-apiKey": cloudsmithApiKey,
          "X-owner-Host": cloudsmithOrg,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (response.headers.get("content-type").includes("application/json")) {
      const data = await response.json();
      return data; // Make sure to return the data
    } else {
      throw new Error("The server did not return a JSON response");
    }
  };
  const fetchData = async () => {
    setIsLoading(true);
    try {
      setLoadingMessage("Fetching Cloudsmith user");
      const cloudsmithUser = await fetchCloudsmithUser();
      if (cloudsmithUser.detail === "Invalid token.") {
        console.error("Fetching Cloudsmith user failed");
        setLoadingMessage("Fetching Cloudsmith user failed");
        setIsLoading(false);
        setHasFetched(false);
        return;
      }
      setCloudsmithUser(cloudsmithUser?.name);
      setLoadingMessage("Loading your Cloudsmith data");
      // Fetch Cloudsmith repo data
      const cloudsmithRepoData = await fetchCloudsmithRepos();
      console.log(cloudsmithRepoData);
      if (cloudsmithRepoData[0].error === "404") {
        console.error("Fetching Cloudsmith repos failed");
        setLoadingMessage(
          `Fetching Cloudsmith repos failed, Cloudsmith Organisation: ${cloudsmithOrg} does not exist`
        );
        setIsLoading(false);
        setHasFetched(false);
        return;
      }
      setCloudsmithRepos(cloudsmithRepoData);
      console.log(cloudsmithRepos);
      setLoadingMessage("Loading your JFrog data");
      // Fetch /api/data
      const response = await fetch("http://localhost:5000/api/data", {
        method: "GET",
        headers: {
          "X-apiKey": apiKeyJfrog,
          "X-jfrogdomain": jfrogOrganisation,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setData(data);
      setHasFetched(true);
      setIsLoading(false);
    } catch (error) {
      setHasFetched(false);
      console.error("An error occurred while fetching data:", error);
      setLoadingMessage("An error occurred while fetching data");
      setIsLoading(false);
    }
  };

  // A function to check if the provided repo name is already in Cloudsmith
  const checkIfRepoExists = (repoName) => {
    const repoExists = cloudsmithRepos.find((repo) => repo.name === repoName);
    return repoExists;
  };

  const handleCopy = () => {
    let groupName = "";
    let overwrite = false;
    let existingIndex = -1;
    let cloudsmithRepoExists = false;

    const handleOverwrite = () => {
      if (overwrite) {
        existingIndex = groupNames.indexOf(groupName);
        if (existingIndex !== -1) {
          const existingItem = JSON.parse(displayData)[existingIndex];
          existingItem["artifactory-repositories-included"].forEach((repo) => {
            setRepoCounts((prev) => ({
              ...prev,
              [repo]: prev[repo] - 1,
            }));
          });
        }
      } else {
        setGroupNames((prevGroupNames) => [...prevGroupNames, groupName]);
      }

      const cloudsmithData = convertToCloudsmithFormat(selectedRepos);
      cloudsmithData.forEach((item) => {
        item["cloudsmith-repository"] = groupName;
        item["cloudsmith-repository-exists"] = cloudsmithRepoExists;
        item["artifactory-repositories-included"].forEach((repo) => {
          setRepoCounts((prev) => ({
            ...prev,
            [repo]: (prev[repo] || 0) + 1,
          }));
        });
      });

      setDisplayData((prev) => {
        const prevData = prev ? JSON.parse(prev) : [];
        if (overwrite && existingIndex !== -1) {
          prevData[existingIndex] = cloudsmithData[0];
        } else {
          prevData.push(...cloudsmithData);
        }
        return JSON.stringify(prevData, null, 2);
      });

      setSelectedRepos({});
    };

    const showModal = () => {
      Modal.confirm({
        title: "Choose an action",
        content: (
          <div>
            Would you like to create a new repository or add to an existing one?
          </div>
        ),
        okText: "Create new",
        cancelText: "Add to existing",
        onOk() {
          showCreateNewModal();
        },
        onCancel() {
          showAddToExistingModal();
        },
      });
    };

    const showAddToExistingModal = () => {
      let selectedRepo = null;

      const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
      };

      const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
      };

      const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder={`Search ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={() =>
                handleSearch(selectedKeys, confirm, dataIndex)
              }
              style={{ width: 188, marginBottom: 8, display: "block" }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Search
              </Button>
              <Button
                onClick={() => handleReset(clearFilters)}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        onFilter: (value, record) =>
          record[dataIndex]
            ? record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            : "",
      });

      const columns = [
        {
          title: "Name",
          dataIndex: "name",
          ...getColumnSearchProps("name"),
        },
        {
          title: "View Repository",
          dataIndex: "self_html_url",
          render: (text, record) => (
            <a href={record.self_html_url} target="_blank" rel="noreferrer">
              View Repository
            </a>
          ),
        },
        {
          title: "Action",
          dataIndex: "operation",
          render: (_, record) => (
            <Button
              onClick={() => {
                selectedRepo = record;
              }}
            >
              Select
            </Button>
          ),
        },
      ];

      Modal.confirm({
        title: "Choose a repository",
        width: 600,
        content: (
          <Table columns={columns} dataSource={cloudsmithRepos} rowKey="name" />
        ),
        onOk() {
          if (selectedRepo) {
            addToExistingRepo(selectedRepo);
          }
        },
      });
    };

    const showCreateNewModal = () => {
      Modal.confirm({
        title: "Please enter the repository name",
        content: (
          <Input
            onChange={(e) => (groupName = e.target.value)}
            placeholder="Repository name"
          />
        ),
        onOk() {
          const existingGroup = groupNames.includes(groupName);
          cloudsmithRepoExists = cloudsmithRepos.some(
            (repo) => repo.name === groupName
          );

          if (cloudsmithRepoExists) {
            Modal.confirm({
              title:
                "A repository with this name already exists in Cloudsmith. Do you want to map the new repository to it?",
              onOk() {
                handleOverwrite();
              },
            });
          } else if (existingGroup) {
            Modal.confirm({
              title:
                "This repositoriy already exists. Do you want to overwrite it?",
              onOk() {
                overwrite = true;
                handleOverwrite();
              },
            });
          } else {
            handleOverwrite();
          }
        },
      });
    };

    const addToExistingRepo = (repo) => {
      const cloudsmithData = convertToCloudsmithFormat(selectedRepos);
      cloudsmithData.forEach((item) => {
        item["cloudsmith-repository"] = repo.name;
        item["cloudsmith-repository-exists"] = true;
        item["artifactory-repositories-included"].forEach((repo) => {
          setRepoCounts((prev) => ({
            ...prev,
            [repo]: (prev[repo] || 0) + 1,
          }));
        });
      });

      setDisplayData((prev) => {
        const prevData = prev ? JSON.parse(prev) : [];
        prevData.push(...cloudsmithData);
        return JSON.stringify(prevData, null, 2);
      });

      setSelectedRepos({});
    };
    showModal();
  };

  const transformDataToTree = (data) => {
    if (!data) {
      return [];
    }

    const rootNode = {
      title: "/",
      key: "/",
      children: [],
      isLeaf: false,
    };

    const getNode = (path) => {
      return path
        .split("/")
        .filter(Boolean)
        .reduce((node, key) => {
          let childNode = node.children.find((child) => child.title === key);

          if (!childNode) {
            childNode = {
              title: key,
              key: `${node.key}${node.key === "/" ? "" : "/"}${key}`,
              children: [],
              isLeaf: false,
            };
            node.children.push(childNode);
          }

          return childNode;
        }, rootNode);
    };

    data.forEach((item) => {
      const node = getNode(item.uri);
      node.isLeaf = !item.folder;
    });

    return rootNode.children;
  };

  const repositoryPackages = data.find((repo) => repo.key === selectedRepoKey)
    ?.packagesInfo.repositoryPackages;
  const treeData = transformDataToTree(repositoryPackages);

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  function getTotalRepositorySize(key, type) {
    const repo = data.find((repo) => repo.key === key && repo.type === type);
    if (repo) {
      return repo.packagesInfo.totalRepositorySizeBytes;
    }
    return 0;
  }

  function convertToCloudsmithFormat(selectedRepos) {
    // Convert the selectedRepos object to an array
    const reposArray = Object.values(selectedRepos);
    // Get unique formats
    const uniqueFormats = [
      ...new Set(reposArray.map((repo) => repo.packageType)),
    ];

    // Get included repositories and upstreams
    const includedRepos = [];
    const upstreams = [];
    const localRepos = [];
    reposArray.forEach((repo) => {
      includedRepos.push(repo.key);
      if (repo.type === "REMOTE") {
        upstreams.push({
          name: repo.key,
          url: repo.url,
          upstream_format: repo.packageType,
        });
      }
      // if repo type local, add
      if (repo.type === "LOCAL") {
        localRepos.push({
          name: repo.key,
          format: repo.packageType,
        });
      }
    });
    // Get total size for LOCAL repo type and total for REMOTE repo type
    const totalSizeLocal = [];
    const totalSizeRemote = [];
    reposArray.forEach((repo) => {
      if (repo.type === "LOCAL") {
        totalSizeLocal.push(getTotalRepositorySize(repo.key, repo.type));
      }
    });
    // Calculate the total size for LOCAL + REMOTE together
    const totalSize =
      totalSizeLocal.reduce((a, b) => a + b, 0) +
      totalSizeRemote.reduce((a, b) => a + b, 0);

    // Create the result object
    const result = [
      {
        "cloudsmith-repository": "cloudsmith-repo-name",
        "cloudsmith-repository-exists": false,
        format: uniqueFormats,
        "artifactory-repositories-included": includedRepos,
        upstreams: upstreams,
        "local-repositories-included": localRepos,
        total_size: formatBytes(totalSize),
        total_size_local: formatBytes(
          totalSizeLocal.reduce((a, b) => a + b, 0)
        ),
        total_size_remote: formatBytes(
          totalSizeRemote.reduce((a, b) => a + b, 0)
        ),
        total_size_bytes: totalSize,
        total_size_local_bytes: totalSizeLocal.reduce((a, b) => a + b, 0),
        total_size_remote_bytes: totalSizeRemote.reduce((a, b) => a + b, 0),
      },
    ];

    return result;
  }

  function handleSelectedVirtualRepo(virtualRepo) {
    // Find the repository objects that match the names in the virtual repository
    const reposToSelect = data.filter((repo) =>
      virtualRepo.repositories.includes(repo.key)
    );

    // Pass the selected repos to updateSelectedRepos
    reposToSelect.forEach((repo) => {
      updateSelectedRepos(repo);
    });
  }

  const updateSelectedRepos = (repo) => {
    setSelectedRepos((prev) => {
      let newSelectedRepos;
      if (prev[repo.key]) {
        newSelectedRepos = { ...prev };
        delete newSelectedRepos[repo.key];
      } else {
        newSelectedRepos = {
          ...prev,
          [repo.key]: { ...repo },
        };
      }

      const newCloudsmithData = convertToCloudsmithFormat(newSelectedRepos);
      setCloudsmithData(newCloudsmithData);
      return newSelectedRepos;
    });
  };

  function downloadJson() {
    let json_jfrog_api_key = "";
    let json_cludsmith_api_key = "";
    // use modal to ask the user if they want to include their API key in the json
    Modal.confirm({
      title: "Would you like to include your API keys in the JSON?",
      okText: "Yes",
      cancelText: "No",
      onOk() {
        json_jfrog_api_key = apiKeyJfrog;
        json_cludsmith_api_key = cloudsmithApiKey;
        download(json_jfrog_api_key, json_cludsmith_api_key);
      },
      onCancel() {
        // keep the api keys as empty strings
        download(json_jfrog_api_key, json_cludsmith_api_key);
      },
    });
  }

  function download(json_jfrog_api_key, json_cludsmith_api_key) {
    const finalJson = {
      cloudsmith_org: cloudsmithOrg,
      cloudsmith_api_key: json_cludsmith_api_key,
      jfrog_api_key: json_jfrog_api_key,
      jfrog_org: jfrogOrganisation,
      mapping_data: JSON.parse(displayData),
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(finalJson));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    // make filename = mapping_data_<jfrog_org>_<cloudsmith_org>_<timestamp>.json
    const fileName = `mapping_data_${jfrogOrganisation}_${cloudsmithOrg}_${Date.now()}.json`;
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const migrateDataToCloudsmith = async () => {
    if (displayData === "") return;
    const parsedData = JSON.parse(displayData);
    if (
      parsedData.some(
        (item) =>
          !("cloudsmith-repository-exists" in item) ||
          item["cloudsmith-repository-exists"]
      )
    )
      return;
    const response = await fetch("http://localhost:5000/api/create", {
      method: "POST",
      headers: {
        "X-apiKey": cloudsmithApiKey,
        "X-owner-Host": cloudsmithOrg,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonBody: parsedData }),
    });
    const apiResponse = await response.json();
    setApiResponse(apiResponse);
  };

  const createPackageLevelRepos = () => {
    let repoName = "AutoCreated";

    const handleOkOrCancel = () => {
      uniquePackageTypes.forEach((type, index) => {
        let currentRepos = {};
        let typeData = filteredData.filter((item) => item.packageType === type);
        typeData.forEach((item) => {
          currentRepos = {
            ...currentRepos,
            [item.key]: { ...item },
          };
        });
        const cloudsmithData1 = convertToCloudsmithFormat(currentRepos);

        cloudsmithData1?.forEach((item) => {
          item["cloudsmith-repository"] = `${repoName}-${type}`;
          // check if the repo exists in Cloudsmith
          const repoExists = checkIfRepoExists(item["cloudsmith-repository"]);
          if (repoExists) {
            item["cloudsmith-repository-exists"] = true;
          }
          item["artifactory-repositories-included"].forEach((repo) => {
            setRepoCounts((prev) => ({
              ...prev,
              [repo]: (prev[repo] || 0) + 1,
            }));
          });
        });
        setDisplayData((prev) => {
          const prevData = index !== 0 ? JSON.parse(prev) : [];
          console.log("trying to push here", prevData);
          prevData.push(...cloudsmithData1);
          return JSON.stringify(prevData, null, 2);
        });
      });
    };

    Modal.confirm({
      title: "How would you like to name your repos?",
      content: (
        <div>
          <p>
            This will determine how your repository is named e.g. if 'all' is
            inserted it will change the repository names to 'all-format' if left
            blank it will become 'AutoCreated-format'
          </p>
          <Input
            placeholder="Default: AutoCreated-<format>"
            onChange={(e) => (repoName = e.target.value)}
          />
        </div>
      ),
      okText: "Change name",
      cancelText: "Keep Default",
      onOk: handleOkOrCancel,
      onCancel: handleOkOrCancel,
    });
  };
  // Function to show the feedback modal
  const showFeedbackModal = () => {
    setIsFeedbackModalVisible(true);
  };

  // Function to handle feedback form submission
  const handleFeedbackSubmit = () => {
    feedbackForm
      .validateFields()
      .then((values) => {
        const emailTitle = `Data mapping tool feedback from ${values.name} at ${values.organisation}`;
        const emailBody = `Name: ${values.name}\nEmail: ${values.email}\nOrganisation: ${values.organisation}\nFeedback: ${values.feedback}`;

        // Open the user's email client
        window.location.href = `mailto:support@cloudsmith.io?subject=${encodeURIComponent(
          emailTitle
        )}&body=${encodeURIComponent(emailBody)}`;

        // Close the feedback modal and open the thank you modal
        setIsFeedbackModalVisible(false);
        setIsThankYouModalVisible(true);
      })
      .catch((errorInfo) => {
        // Handle form validation failure
        console.error("Validation failed:", errorInfo);
      });
  };

  // Function to handle modal cancellation
  const handleFeedbackCancel = () => {
    setIsFeedbackModalVisible(false);
  };

  // Function to close the thank you modal
  const closeThankYouModal = () => {
    setIsThankYouModalVisible(false);
  };

  return (
    // if no credentials are provided, show the form
    // if credentials are provided, show the app

    !hasFetched ? (
      <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
        <Col>
          {isLoading ? (
            <Card>
              <p>Welcome: {cloudsmithUser}</p>
              <Spin></Spin>
              <p>{loadingMessage}</p>
            </Card>
          ) : (
            <fieldset>
              <legend>
                <FontAwesomeIcon icon={faLink} /> Insert Cloudsmith/JFrog
                Credentials
              </legend>
              <Form className="input-fields">
                <Form.Item label="Cloudsmith Org Name">
                  <Input
                    id="cloudsmith-org"
                    value={cloudsmithOrg}
                    onChange={(event) => setCloudsmithOrg(event.target.value)}
                  />
                </Form.Item>
                <Form.Item label="Cloudsmith API Key">
                  <Input
                    id="cloudsmith-api-key"
                    value={cloudsmithApiKey}
                    onChange={(event) =>
                      setCloudsmithApiKey(event.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label="JFrog Org Name">
                  <Input
                    id="jfrog-org"
                    value={jfrogOrganisation}
                    onChange={(event) =>
                      setJfrogOrganisation(event.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label="JFrog API Key">
                  <Input
                    id="jfrog-api-key"
                    value={apiKeyJfrog}
                    onChange={(event) => setApiKeyJfrog(event.target.value)}
                  />
                </Form.Item>
                <Form.Item>
                  <Tooltip title="Click to fetch data">
                    <Button type="primary" onClick={fetchData}>
                      Fetch Data
                    </Button>
                  </Tooltip>
                </Form.Item>
                {loadingMessage && (
                  <b>
                    <p style={{ color: "red" }}>{loadingMessage}</p>
                  </b>
                )}
              </Form>
            </fieldset>
          )}
        </Col>
      </Row>
    ) : (
      <Layout>
        <Sider width="24%">
          <div className="filters">
            <h1>Welcome, {cloudsmithUser}</h1>
            <Tooltip title="Click to provide feedback">
              <button onClick={showFeedbackModal}>Tool Feedback</button>
            </Tooltip>
            <Tooltip title="Click to auto-merge to single-format repo">
              <button onClick={createPackageLevelRepos}>
                Auto-merge to single-format repo
              </button>
            </Tooltip>
            <fieldset>
              <legend>
                <FontAwesomeIcon icon={faFilter} /> Package Type
              </legend>
              {uniquePackageTypes.map((type) => {
                const count = filteredData.filter(
                  (item) => item.packageType === type
                ).length;
                return (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={!!filter.packageType[type]}
                      onChange={() => handleCheckboxChange("packageType", type)}
                    />
                    {type} ({count})
                  </label>
                );
              })}
            </fieldset>
            <fieldset>
              <legend>
                <FontAwesomeIcon icon={faFilter} /> Repository Type
              </legend>
              {uniqueRepositoryTypes.map((type) => {
                const count = filteredData.filter(
                  (item) => item.type === type
                ).length;
                return (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={!!filter.repositoryType[type]}
                      onChange={() =>
                        handleCheckboxChange("repositoryType", type)
                      }
                    />
                    {type} ({count})
                  </label>
                );
              })}
            </fieldset>
            <div className="pagination">
              <Tooltip title="Click to add selected repositories to Cloudsmith repository">
                <button onClick={handleCopy}>
                  Add selected repositories to Cloudsmith repository
                </button>
              </Tooltip>
            </div>
            <div className="repo-container">
              <fieldset>
                <div className="selected-items">
                  <h3>
                    <FontAwesomeIcon icon={faDatabase} /> Currently Selected
                    Local: (
                    {cloudsmithData && cloudsmithData[0].total_size_local})
                  </h3>
                  <ul>
                    {Object.values(selectedRepos).map((repo) => (
                      <li key={repo.key}>
                        <span className="repo-key">
                          <FontAwesomeIcon icon={faDatabase} /> <b>Repo:</b>{" "}
                          {repo.key} <b>({repo.packageType})</b>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </fieldset>
              <fieldset>
                <div className="selected-items">
                  <h3>
                    <FontAwesomeIcon icon={faCloud} /> Currently Selected
                    Upstreams: (
                    {cloudsmithData && cloudsmithData[0].total_size_remote})
                  </h3>
                  <ul>
                    {Object.values(selectedRepos)
                      .filter((repo) => repo.type === "REMOTE")
                      .map((repo) => (
                        <li key={repo.key}>
                          <span className="repo-packageType">
                            <FontAwesomeIcon icon={faLink} /> <b>Format:</b>{" "}
                            {repo.packageType} ({repo.url})
                          </span>
                          )
                        </li>
                      ))}
                  </ul>
                </div>
              </fieldset>
              <fieldset>
                <div className="selected-items">
                  <h3>
                    <FontAwesomeIcon icon={faFolder} /> Estimated Total Size:{" "}
                    {cloudsmithData && cloudsmithData[0].total_size}
                  </h3>
                </div>
              </fieldset>
            </div>
            <Tooltip title="Click to create repositories in Cloudsmith">
              <button
                onClick={() => {
                  migrateDataToCloudsmith();
                  downloadJson();
                }}
              >
                Migrate repositories
              </button>
            </Tooltip>
            <fieldset>
              <h3>JSON Output:</h3>
              <div className="json-output">
                <ReactJson src={displayData ? JSON.parse(displayData) : {}} />
              </div>
              <Tooltip title="Click to download JSON">
                <button onClick={downloadJson}>Download JSON</button>
              </Tooltip>
            </fieldset>
            <fieldset>
              <legend>
                <FontAwesomeIcon icon={faLink} /> Cloudsmith/JFrog Credentials
              </legend>
              <div>
                {isLoading ? (
                  <p>Loading...</p>
                ) : (
                  <Form className="input-fields">
                    <Form.Item label="Cloudsmith Org Name">
                      <Input
                        id="cloudsmith-org"
                        value={cloudsmithOrg}
                        onChange={(event) =>
                          setCloudsmithOrg(event.target.value)
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Cloudsmith API Key">
                      <Input
                        id="cloudsmith-api-key"
                        value={cloudsmithApiKey}
                        onChange={(event) =>
                          setCloudsmithApiKey(event.target.value)
                        }
                      />
                    </Form.Item>
                    <Form.Item label="JFrog Org Name">
                      <Input
                        id="jfrog-org"
                        value={jfrogOrganisation}
                        onChange={(event) =>
                          setJfrogOrganisation(event.target.value)
                        }
                      />
                    </Form.Item>
                    <Form.Item label="JFrog API Key">
                      <Input
                        id="jfrog-api-key"
                        value={apiKeyJfrog}
                        onChange={(event) => setApiKeyJfrog(event.target.value)}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Tooltip title="Click to update credentials">
                        <Button type="primary" onClick={fetchData}>
                          Update credentials
                        </Button>
                      </Tooltip>
                    </Form.Item>
                  </Form>
                )}
              </div>
            </fieldset>
            {apiResponse && (
              <div>
                <h2>API Response:</h2>
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </Sider>
        <Layout>
          <Header className="Header">Cloudsmith Migration Tool</Header>
          <Modal
            title="Feedback"
            open={isFeedbackModalVisible}
            onOk={handleFeedbackSubmit}
            onCancel={handleFeedbackCancel}
          >
            <Form form={feedbackForm} layout="vertical">
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input placeholder="Name" />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input placeholder="Email address" />
              </Form.Item>
              <Form.Item
                name="organisation"
                rules={[
                  {
                    required: true,
                    message: "Please input your organisation name!",
                  },
                ]}
              >
                <Input placeholder="Organisation name" />
              </Form.Item>
              <Form.Item
                name="feedback"
                rules={[
                  { required: true, message: "Please input your feedback!" },
                ]}
              >
                <Input.TextArea placeholder="Feedback details" />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="Thank You"
            open={isThankYouModalVisible}
            onOk={closeThankYouModal}
            onCancel={closeThankYouModal}
          >
            <p>
              Thank you for your feedback. Please check your email client and
              send the email. If you would like to contribute to the project
              please visit the{" "}
              <a
                href="https://github.com/cloudsmith-io/cloudsmith-migration-tool?tab=readme-ov-file#contributing"
                target="_blank"
                rel="noreferrer"
              >
                contributing
              </a>{" "}
              section of the README.
            </p>
          </Modal>
          <Content>
            <div className="pagination">
              <Input.Search
                placeholder="Search for JFrog repositories"
                onSearch={(value) => setSearchTerm(value)}
              />

              <Pagination
                current={currentPage}
                total={filteredData.length}
                pageSize={itemsPerPage}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
            <div className="grid">
              {currentItems.map((item) => {
                return (
                  <div
                    key={item.key}
                    className={`grid-item ${
                      selectedRepos[item.key] ? "selected" : ""
                    }`}
                    onClick={
                      item.type !== "VIRTUAL"
                        ? () => updateSelectedRepos(item)
                        : () => handleSelectedVirtualRepo(item)
                    }
                  >
                    <h2>
                      {item.type === "LOCAL" ? (
                        <FontAwesomeIcon icon={faDatabase} />
                      ) : item.type === "REMOTE" ? (
                        <FontAwesomeIcon icon={faCloud} />
                      ) : (
                        <FontAwesomeIcon icon={faProjectDiagram} />
                      )}
                      <strong>
                        {item.key}
                        {(item.type === "LOCAL" || item.type === "REMOTE") &&
                          ` (${repoCounts[item.key] || 0})`}
                      </strong>
                    </h2>{" "}
                    <p>{item.description}</p>
                    <div className="repo-details">
                      <p>
                        <FontAwesomeIcon icon={faCloud} /> Package Type:{" "}
                        {item.packageType}
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faProjectDiagram} /> Type:{" "}
                        {item.type}
                      </p>
                      {item.type === "REMOTE" && (
                        <p>
                          <FontAwesomeIcon icon={faLink} /> URL: {item.url}
                        </p>
                      )}
                      {item.type === "VIRTUAL" && (
                        <p>
                          <FontAwesomeIcon icon={faProjectDiagram} />{" "}
                          Repositories:{" "}
                          {item.repositories.map((repo) => (
                            <li key={repo}>{repo}</li>
                          ))}
                        </p>
                      )}
                      {item.type !== "VIRTUAL" && (
                        <>
                          <p>
                            <FontAwesomeIcon icon={faFolder} /> Total Repository
                            Size: {item.packagesInfo.totalRepositorySize}
                          </p>
                          <p>
                            <FontAwesomeIcon icon={faFile} /> Total Repository
                            Files: {item.packagesInfo.totalRepositoryFiles}
                          </p>
                          <Tooltip title="Click to show repository content">
                            <Button
                              type="primary"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedRepoKey(item.key);
                                setIsModalVisible(true);
                              }}
                            >
                              Show Content
                            </Button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                    <Modal
                      width={600}
                      title={item.key + " content"}
                      open={isModalVisible}
                      onCancel={() => setIsModalVisible(false)}
                      onOk={() => setIsModalVisible(false)}
                    >
                      <Tree treeData={treeData} />
                    </Modal>
                  </div>
                );
              })}
            </div>
          </Content>
          <Footer>
            <b>
              Selected {Object.keys(selectedRepos).length} repositories, LOCAL (
              {
                Object.values(selectedRepos).filter(
                  (repo) => repo.type === "LOCAL"
                ).length
              }
              ), REMOTE (
              {
                Object.values(selectedRepos).filter(
                  (repo) => repo.type === "REMOTE"
                ).length
              }
              ) VIRTUAL (
              {
                Object.values(selectedRepos).filter(
                  (repo) => repo.type === "VIRTUAL"
                ).length
              }
              )
            </b>
          </Footer>
        </Layout>
      </Layout>
    )
  );
}

export default App;
