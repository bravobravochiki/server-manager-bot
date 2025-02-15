import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { GroupActionButton } from '../GroupActionButton';
import { RdpApiClient } from '../../api/client';
import { useAuditStore } from '../../store/audit';

vi.mock('../../api/client');
vi.mock('../../store/audit');

describe('GroupActionButton', () => {
  const mockProps = {
    groupId: 'group-1',
    groupName: 'Test Group',
    action: 'start' as const,
    serverIds: ['server-1', 'server-2'],
    apiKey: 'test-api-key',
    onComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
  });

  it('renders correctly with start action', () => {
    render(<GroupActionButton {...mockProps} />);
    )
    expect(screen.getByTitle('Start all servers in this group')).toBeInTheDocument();
  });

  it('shows loading state during operation', async () => {
    vi.spyOn(RdpApiClient.prototype, 'powerAction').mockResolvedValue({ status: true });
    
    render(<GroupActionButton {...mockProps} />);
    )
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTitle('Start all servers in this group')).toBeDisabled();
  });

  it('handles successful batch operation', async () => {
    const mockPowerAction = vi.spyOn(RdpApiClient.prototype, 'powerAction')
      .mockResolvedValue({ status: true });
    const mockAddLog = vi.fn();
    vi.mocked(useAuditStore.getState).mockReturnValue({ addLog: mockAddLog });

    render(<GroupActionButton {...mockProps} />);
    )
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockPowerAction).toHaveBeenCalledTimes(mockProps.serverIds.length);
    expect(mockAddLog).toHaveBeenCalledWith(expect.objectContaining({
      action: 'GROUP_START_SERVERS',
      status: 'success',
    }));
    expect(mockProps.onComplete).toHaveBeenCalled();
  });

  it('handles failed operations gracefully', async () => {
    vi.spyOn(RdpApiClient.prototype, 'powerAction').mockRejectedValue(new Error('API Error'));
    const mockAddLog = vi.fn();
    vi.mocked(useAuditStore.getState).mockReturnValue({ addLog: mockAddLog });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.alert = vi.fn();

    render(<GroupActionButton {...mockProps} />);
    )
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockAddLog).toHaveBeenCalledWith(expect.objectContaining({
      action: 'GROUP_START_SERVERS',
      status: 'failure',
    }));
    expect(consoleSpy).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('respects confirmation dialog', async () => {
    window.confirm = vi.fn(() => false);
    const mockPowerAction = vi.spyOn(RdpApiClient.prototype, 'powerAction');

    render(<GroupActionButton {...mockProps} />);
    )
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockPowerAction).not.toHaveBeenCalled();
  });
});