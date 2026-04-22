import type { Request, Response } from 'express';
import * as adminService from './admin.service.js';

type IdParam      = { id: string };
type IdRoleParam  = { id: string; roleId: string };


export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await adminService.getAllEmployees();
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};

export const getEmployeeById = async (req: Request<IdParam>, res: Response) => {
  try {
    const employee = await adminService.getEmployeeById(parseInt(req.params.id));
    res.status(200).json(employee);
  } catch (error: any) {
    if (error.message === 'EMPLOYEE_NOT_FOUND') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Failed to fetch employee' });
  }
};

export const registerEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, structureId, roleIds } = req.body;  // no username/password
    const employee = await adminService.registerEmployee({ name, email, structureId, roleIds });
    res.status(201).json(employee);
  } catch (err: any) {
    if (err.message === 'EMPLOYEE_ALREADY_EXISTS')
      return res.status(409).json({ message: 'Email already in use' });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateEmployee = async (req: Request<IdParam>, res: Response) => {
  try {
    const employee = await adminService.updateEmployee(parseInt(req.params.id), req.body);
    res.status(200).json(employee);
  } catch (error: any) {
    if (error.message === 'EMPLOYEE_NOT_FOUND') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req: Request<IdParam>, res: Response) => {
  try {
    await adminService.deleteEmployee(parseInt(req.params.id));
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error: any) {
    if (error.message === 'EMPLOYEE_NOT_FOUND') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
};


export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await adminService.getAllRoles();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, type, permissions } = req.body;
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }
    const role = await adminService.createRole({ name, type, permissions: permissions ?? '' });
    res.status(201).json(role);
  } catch (error: any) {
    if (error.message === 'INVALID_ROLE_TYPE') {
      return res.status(400).json({ message: 'Invalid role type' });
    }
    if (error.message === 'ROLE_ALREADY_EXISTS') {
      return res.status(409).json({ message: 'A role with this name already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to create role' });
  }
};

export const updateRole = async (req: Request<IdParam>, res: Response) => {
  try {
    const { name, permissions } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const role = await adminService.updateRole(parseInt(req.params.id), { name, permissions });
    res.status(200).json(role);
  } catch (error: any) {
    if (error.message === 'ROLE_NOT_FOUND') {
      return res.status(404).json({ message: 'Role not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

export const deleteRole = async (req: Request<IdParam>, res: Response) => {
  try {
    await adminService.deleteRole(parseInt(req.params.id));
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    if (error.message === 'ROLE_NOT_FOUND') {
      return res.status(404).json({ message: 'Role not found' });
    }
    if (error.message === 'ROLE_IN_USE') {
      return res.status(409).json({ message: 'Cannot delete a role that is assigned to employees' });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to delete role' });
  }
};


export const assignRole = async (req: Request<IdParam>, res: Response) => {
  try {
    const { roleId } = req.body;
    if (!roleId) return res.status(400).json({ message: 'roleId is required' });
    const result = await adminService.assignRole(parseInt(req.params.id), parseInt(roleId));
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'EMPLOYEE_NOT_FOUND') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Failed to assign role' });
  }
};

export const revokeRole = async (req: Request<IdRoleParam>, res: Response) => {
  try {
    await adminService.revokeRole(parseInt(req.params.id), parseInt(req.params.roleId));
    res.status(200).json({ message: 'Role revoked successfully' });
  } catch (error: any) {
    if (error.message === 'LAST_ROLE') {
      return res.status(400).json({ message: 'Employee must have at least one role' });
    }
    res.status(500).json({ message: 'Failed to revoke role' });
  }
};


export const getAllStructures = async (req: Request, res: Response) => {
  try {
    const structures = await adminService.getAllStructures();
    res.status(200).json(structures);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch structures' });
  }
};

export const createStructure = async (req: Request, res: Response) => {
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const structure = await adminService.createStructure({ name, parentId });
    res.status(201).json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create structure' });
  }
};

export const updateStructure = async (req: Request<IdParam>, res: Response) => {
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const structure = await adminService.updateStructure(parseInt(req.params.id), {
      name,
      parentId: parentId ? parseInt(parentId) : null,
    });
    res.status(200).json(structure);
  } catch (error: any) {
    if (error.message === 'SELF_PARENT') {
      return res.status(400).json({ message: 'A department cannot be its own parent' });
    }
    res.status(500).json({ message: 'Failed to update structure' });
  }
};

export const deleteStructure = async (req: Request<IdParam>, res: Response) => {
  try {
    await adminService.deleteStructure(parseInt(req.params.id));
    res.status(200).json({ message: 'Structure deleted successfully' });
  } catch (error: any) {
    if (error.message === 'STRUCTURE_HAS_EMPLOYEES') {
      return res.status(400).json({ message: 'Cannot delete a department that has employees' });
    }
    res.status(500).json({ message: 'Failed to delete structure' });
  }
};

