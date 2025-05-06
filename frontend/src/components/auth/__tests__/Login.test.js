import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Login from '../Login';
import * as authActions from '../../../redux/actions/authActions';

// Mock the auth actions
jest.mock('../../../redux/actions/authActions', () => ({
  login: jest.fn(),
  clearError: jest.fn()
}));

// Mock history.replace
const mockHistoryReplace = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    replace: mockHistoryReplace
  }),
  useLocation: () => ({
    state: { from: { pathname: '/dashboard' } }
  })
}));

// Configure mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Login Component', () => {
  let store;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Initial state with no authentication
    store = mockStore({
      auth: {
        loading: false,
        error: null,
        isAuthenticated: false
      }
    });
  });

  it('renders login form correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Check if important elements are rendered
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty form submission', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Submit the form without filling it
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });

    // Verify login action was not called
    expect(authActions.login).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Fill in invalid email
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'invalid-email' }
    });
    
    // Fill in valid password
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
    });

    // Verify login action was not called
    expect(authActions.login).not.toHaveBeenCalled();
  });

  it('calls login action with correct credentials', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Fill in valid email
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });
    
    // Fill in valid password
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Verify login action was called with correct credentials
    await waitFor(() => {
      expect(authActions.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows loading spinner when authentication is in progress', () => {
    // Set loading state to true
    store = mockStore({
      auth: {
        loading: true,
        error: null,
        isAuthenticated: false
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Check if loading spinner is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Check if submit button is disabled
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays error message when authentication fails', () => {
    // Set error state
    store = mockStore({
      auth: {
        loading: false,
        error: 'Invalid email or password',
        isAuthenticated: false
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Check if error message is displayed
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('redirects to dashboard after successful login', () => {
    // Set authenticated state
    store = mockStore({
      auth: {
        loading: false,
        error: null,
        isAuthenticated: true
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Check if redirect was called
    expect(mockHistoryReplace).toHaveBeenCalledWith({ pathname: '/dashboard' });
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Password field should be of type password initially
    expect(screen.getByLabelText(/Password/i)).toHaveAttribute('type', 'password');

    // Click the visibility toggle button
    fireEvent.click(screen.getByRole('button', { name: /toggle password visibility/i }));

    // Password field should now be of type text
    expect(screen.getByLabelText(/Password/i)).toHaveAttribute('type', 'text');

    // Click the visibility toggle button again
    fireEvent.click(screen.getByRole('button', { name: /toggle password visibility/i }));

    // Password field should be back to type password
    expect(screen.getByLabelText(/Password/i)).toHaveAttribute('type', 'password');
  });
});