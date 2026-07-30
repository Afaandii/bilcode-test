import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsSearch,
  BsX,
  BsFolderCheck,
  BsPerson,
  BsCheck2Square,
  BsArrowRightShort,
  BsBuilding,
  BsTag,
} from "react-icons/bs";
import { useAuth } from "../../hooks/useAuth";
import { getProjectsApi, type Project } from "../../services/projectService";
import { getClientsApi, type ClientData } from "../../services/clientService";
import { getTasksApi, type FullProjectTask } from "../../services/taskService";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [tasks, setTasks] = useState<FullProjectTask[]>([]);
  const [hasLoadedData, setHasLoadedData] = useState<boolean>(false);

  // Focus input when modal opens & fetch initial data
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      if (!hasLoadedData && token) {
        setIsLoading(true);
        Promise.all([
          getProjectsApi(token).catch(() => []),
          getClientsApi(token).catch(() => []),
          getTasksApi(token).catch(() => []),
        ]).then(([projectsRes, clientsRes, tasksRes]) => {
          setProjects(projectsRes);
          setClients(clientsRes);
          setTasks(tasksRes);
          setHasLoadedData(true);
          setIsLoading(false);
        });
      }
    } else {
      setSearchTerm("");
    }
  }, [isOpen, token, hasLoadedData]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const query = searchTerm.trim().toLowerCase();

  // Filtered results
  const filteredProjects = query
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brief?.toLowerCase().includes(query) ||
          p.client?.name?.toLowerCase().includes(query) ||
          p.client?.company?.toLowerCase().includes(query)
      )
    : projects.slice(0, 3);

  const filteredClients = query
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.company.toLowerCase().includes(query) ||
          c.contact.toLowerCase().includes(query)
      )
    : clients.slice(0, 3);

  const filteredTasks = query
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query)
      )
    : tasks.slice(0, 3);

  const totalResults =
    filteredProjects.length + filteredClients.length + filteredTasks.length;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="search-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="search-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header / Input */}
        <div className="search-modal-header">
          <BsSearch className="search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Cari proyek, klien, atau task (cth: Acme, Redesign)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-modal-clear"
              onClick={() => setSearchTerm("")}
              title="Hapus pencarian"
            >
              <BsX size={18} />
            </button>
          )}
          <span className="search-modal-kbd">ESC</span>
        </div>

        {/* Search Results Body */}
        <div className="search-modal-body">
          {isLoading ? (
            <div className="search-modal-loading">
              <div className="dash-spinner-ring" style={{ width: 28, height: 28 }} />
              <span>Memuat data pencarian...</span>
            </div>
          ) : query && totalResults === 0 ? (
            <div className="search-modal-empty">
              <p className="search-empty-title">Tidak ada hasil ditemukan</p>
              <p className="search-empty-desc">
                Tidak ada data yang cocok dengan kata kunci "<strong>{searchTerm}</strong>".
              </p>
            </div>
          ) : (
            <div className="search-results-list">
              {!query && (
                <div className="search-suggestion-label">
                  Saran Pencarian Cepat
                </div>
              )}

              {/* Category 1: Proyek */}
              {filteredProjects.length > 0 && (
                <div className="search-group">
                  <div className="search-group-header">
                    <BsFolderCheck className="text-primary" /> Proyek ({filteredProjects.length})
                  </div>
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="search-item"
                      onClick={() => handleNavigate("/projects")}
                    >
                      <div className="search-item-icon bg-primary-subtle text-primary">
                        <BsFolderCheck size={16} />
                      </div>
                      <div className="search-item-info">
                        <div className="search-item-title">{project.name}</div>
                        <div className="search-item-sub">
                          <BsBuilding size={12} />{" "}
                          {project.client?.company || project.client?.name || "Klien —"}
                        </div>
                      </div>
                      <span className={`badge-status-${project.status}`}>
                        {project.status === "active"
                          ? "Aktif"
                          : project.status === "completed"
                          ? "Selesai"
                          : project.status}
                      </span>
                      <BsArrowRightShort size={20} className="search-item-arrow" />
                    </div>
                  ))}
                </div>
              )}

              {/* Category 2: Klien */}
              {filteredClients.length > 0 && (
                <div className="search-group">
                  <div className="search-group-header">
                    <BsPerson className="text-info" /> Klien ({filteredClients.length})
                  </div>
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="search-item"
                      onClick={() => handleNavigate("/clients")}
                    >
                      <div className="search-item-icon bg-info-subtle text-info">
                        <BsPerson size={16} />
                      </div>
                      <div className="search-item-info">
                        <div className="search-item-title">{client.name}</div>
                        <div className="search-item-sub">
                          <BsBuilding size={12} /> {client.company} &bull; {client.contact}
                        </div>
                      </div>
                      <BsArrowRightShort size={20} className="search-item-arrow" />
                    </div>
                  ))}
                </div>
              )}

              {/* Category 3: Task */}
              {filteredTasks.length > 0 && (
                <div className="search-group">
                  <div className="search-group-header">
                    <BsCheck2Square className="text-success" /> Task ({filteredTasks.length})
                  </div>
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="search-item"
                      onClick={() => handleNavigate("/tasks")}
                    >
                      <div className="search-item-icon bg-success-subtle text-success">
                        <BsCheck2Square size={16} />
                      </div>
                      <div className="search-item-info">
                        <div className="search-item-title">{task.title}</div>
                        <div className="search-item-sub">
                          <BsTag size={12} /> Category: {task.category.toUpperCase()} &bull; Effort: {task.estimated_effort}
                        </div>
                      </div>
                      <span className={`badge-status-${task.status}`}>
                        {task.status}
                      </span>
                      <BsArrowRightShort size={20} className="search-item-arrow" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Hints */}
        <div className="search-modal-footer">
          <div className="search-footer-hint">
            <span><kbd>ESC</kbd> Tutup</span>
          </div>
          <span className="search-footer-brand">ProjectPulse Global Search</span>
        </div>
      </div>
    </div>
  );
};
