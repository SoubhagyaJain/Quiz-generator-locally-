document.addEventListener('DOMContentLoaded', () => {
    const notebookSelect = document.getElementById('notebook-select');
    const runBtn = document.getElementById('run-btn');
    const stepsList = document.getElementById('steps-list');
    const terminalOutput = document.getElementById('terminal-output');
    const currentStepTitle = document.getElementById('current-step-title');
    const pipelineStatus = document.getElementById('pipeline-status');

    let activeEventSource = null;
    let currentLogs = {}; // Maps step_id to log text
    let activeStepId = null;

    // Load available notebooks
    fetch('/api/notebooks')
        .then(res => res.json())
        .then(data => {
            notebookSelect.innerHTML = '';
            if (data.notebooks.length === 0) {
                notebookSelect.innerHTML = '<option>No notebooks found</option>';
                return;
            }
            data.notebooks.forEach(nb => {
                const opt = document.createElement('option');
                opt.value = nb;
                opt.textContent = nb;
                notebookSelect.appendChild(opt);
            });
            runBtn.disabled = false;
        })
        .catch(err => {
            console.error(err);
            notebookSelect.innerHTML = '<option>Error loading</option>';
        });

    runBtn.addEventListener('click', () => {
        const nb = notebookSelect.value;
        if (!nb) return;

        // Reset UI
        if (activeEventSource) {
            activeEventSource.close();
        }
        stepsList.innerHTML = '<li class="empty-state">Initializing pipeline...</li>';
        terminalOutput.textContent = 'Starting execution engine...\n';
        pipelineStatus.textContent = 'Running';
        pipelineStatus.className = 'status-badge running';
        currentStepTitle.textContent = 'Execution Logs';
        currentLogs = {};
        activeStepId = null;
        runBtn.disabled = true;

        // Start SSE Stream
        activeEventSource = new EventSource(`/api/stream-notebook/${encodeURIComponent(nb)}`);

        activeEventSource.addEventListener('steps_info', (e) => {
            const data = JSON.parse(e.data);
            stepsList.innerHTML = '';
            data.steps.forEach(step => {
                const li = document.createElement('li');
                li.className = 'step-item';
                li.id = `step-${step.id}`;
                li.innerHTML = `
                    <div class="step-status-icon"></div>
                    <div class="step-title" title="${step.name}">${step.name}</div>
                `;
                li.addEventListener('click', () => {
                    document.querySelectorAll('.step-item').forEach(el => el.classList.remove('active'));
                    li.classList.add('active');
                    currentStepTitle.textContent = step.name;
                    terminalOutput.textContent = currentLogs[step.id] || 'No logs yet.';
                    activeStepId = step.id;
                });
                stepsList.appendChild(li);
                currentLogs[step.id] = '';
            });
        });

        activeEventSource.addEventListener('step_start', (e) => {
            const data = JSON.parse(e.data);
            const li = document.getElementById(`step-${data.id}`);
            if (li) {
                li.className = 'step-item status-running';
                li.click(); // Auto-select the running step
            }
        });

        activeEventSource.addEventListener('step_log', (e) => {
            const data = JSON.parse(e.data);
            if (currentLogs[data.id] !== undefined) {
                currentLogs[data.id] += data.log + "\n";
            }
            if (activeStepId === data.id) {
                terminalOutput.textContent = currentLogs[data.id];
                terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
            }
        });

        activeEventSource.addEventListener('step_end', (e) => {
            const data = JSON.parse(e.data);
            const li = document.getElementById(`step-${data.id}`);
            if (li) {
                li.className = `step-item ${data.status === 'success' ? 'status-success' : 'status-error'}`;
                if (activeStepId === data.id) li.classList.add('active');
            }
        });

        activeEventSource.addEventListener('pipeline_end', (e) => {
            const data = JSON.parse(e.data);
            pipelineStatus.textContent = data.status === 'success' ? 'Passed' : 'Failed';
            pipelineStatus.className = `status-badge ${data.status === 'success' ? 'success' : 'error'}`;
            runBtn.disabled = false;
            activeEventSource.close();
            
            terminalOutput.textContent += `\nPipeline finished with status: ${data.status.toUpperCase()}`;
        });

        activeEventSource.onerror = (err) => {
            console.error("SSE Error:", err);
            pipelineStatus.textContent = 'Error';
            pipelineStatus.className = 'status-badge error';
            runBtn.disabled = false;
            activeEventSource.close();
        };
    });
});
