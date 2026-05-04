import type { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service.js';

type IdParam     = { id: string };
type IdRoleParam = { id: string; roleId: string };
type WorkerParam = { employeeId: string };

const parseId = (val: string): number => parseInt(val, 10);

const isError = (err: unknown, message: string): boolean =>
  err instanceof Error && err.message === message;

export const getAllEmployees = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json(await adminService.getAllEmployees());
  } catch (err) {
    next(err);
  }
};

export const getEmployeeById = async (req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json(await adminService.getEmployeeById(parseId(req.params.id)));
  } catch (err) {
    if (isError(err, 'EMPLOYEE_NOT_FOUND')) { res.status(404).json({ message: 'Employee not found' }); return; }
    next(err);
  }
};

export const registerEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, structureId, roleIds } = req.body;
    res.status(201).json(await adminService.registerEmployee({ name, email, structureId, roleIds }));
  } catch (err) {
    if (isError(err, 'EMPLOYEE_ALREADY_EXISTS')) { res.status(409).json({ message: 'Email already in use' }); return; }
    if (isError(err, 'INVALID_ROLE_COMBINATION')) { res.status(400).json({ message: 'Invalid role combination' }); return; }
    next(err);
  }
};

export const updateEmployee = async (req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json(await adminService.updateEmployee(parseId(req.params.id), req.body));
  } catch (err) {
    if (isError(err, 'EMPLOYEE_NOT_FOUND')) { res.status(404).json({ message: 'Employee not found' }); return; }
    next(err);
  }
};

export const deleteEmployee = async (req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.deleteEmployee(parseId(req.params.id));
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (err) {
    if (isError(err, 'EMPLOYEE_NOT_FOUND')) { res.status(404).json({ message: 'Employee not found' }); return; }
    next(err);
  }
};

export const getAllRoles = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json(await adminService.getAllRoles());
  } catch (err) {
    next(err);
  }
};

export const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, type, permissions } = req.body;
    if (!name || !type) { res.status(400).json({ message: 'Name and type are required' }); return; }
    res.status(201).json(await adminService.createRole({ name, type, permissions: permissions ?? '' }));
  } catch (err) {
    if (isError(err, 'INVALID_ROLE_TYPE'))   { res.status(400).json({ message: 'Invalid role type' }); return; }
    if (isError(err, 'ROLE_ALREADY_EXISTS')) { res.status(409).json({ message: 'A role with this name already exists' }); return; }
    next(err);
  }
};

export const updateRole = async (req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, permissions } = req.body;
    if (!name) { res.status(400).json({ message: 'Name is required' }); return; }
    res.status(200).json(await adminService.updateRole(parseId(req.params.id), { name, permissions }));
  } catch (err) {
    if (isError(err, 'ROLE_NOT_FOUND')) { res.status(404).json({ message: 'Role not found' }); return; }
    next(err);
  }
};

export const deleteRole = async (req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.deleteRole(parseId(req.params.id));
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (err) {
    if (isError(err, 'ROLE_NOT_FOUND')) { res.status(404).json({ message: 'Role not found' }); return; }
    if (isError(err, 'ROLE_IN_USE'))    { res.status(409).json({ message: 'Cannot delete a role that is assigned to employees' }); return; }
    next(err);
  }
};

export const assignRole = async (req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roleId } = req.body;
    if (!roleId) { res.status(400).json({ message: 'roleId is required' }); return; }
    res.status(200).json(await adminService.assignRole(parseId(req.params.id), parseId(roleId)));
  } catch (err) {
    if (isError(err, 'EMPLOYEE_NOT_FOUND')) { res.status(404).json({ message: 'Employee not found' }); return; }
    next(err);
  }
};

export const revokeRole = async (req: Request<IdRoleParam>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.revokeRole(parseId(req.params.id), parseId(req.params.roleId));
    res.status(200).json({ message: 'Role revoked successfully' });
  } catch (err) {
    if (isError(err, 'LAST_ROLE')) { res.status(400).json({ message: 'Employee must have at least one role' }); return; }
    next(err);
  }
};

export const getAllStructures = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json(await adminService.getAllStructures());
  } catch (err) {
    next(err);
  }
};

export const createStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, parentId, managerId } = req.body;
    if (!name) { res.status(400).json({ message: 'Name is required' }); return; }
    res.status(201).json(await adminService.createStructure({
      name,
      parentId,
      ...(managerId ? { managerId: parseId(managerId) } : {}),
    }));
  } catch (err) {
    if (isError(err, 'EMPLOYEE_NOT_FOUND')) { res.status(404).json({ message: 'Employee not found' }); return; }
    if (isError(err, 'NOT_A_MANAGER')) { res.status(400).json({ message: 'Selected employee does not have the Manager role' }); return; }
    if (isError(err, 'MANAGER_ALREADY_ASSIGNED')) {
      res.status(400).json({ message: 'This manager is already assigned to another department' });
      return;
    }
    next(err);
  }
};

export const updateStructure = async (req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, parentId, managerId } = req.body;
    if (!name) { res.status(400).json({ message: 'Name is required' }); return; }
    res.status(200).json(
      await adminService.updateStructure(parseId(req.params.id), {
        name,
        parentId: parentId ? parseId(parentId) : null,
        ...(managerId ? { managerId: parseId(managerId) } : { managerId: null }),
      })
    );
  } catch (err) {
    if (isError(err, 'SELF_PARENT')) { res.status(400).json({ message: 'A department cannot be its own parent' }); return; }
    if (isError(err, 'EMPLOYEE_NOT_FOUND')) { res.status(404).json({ message: 'Employee not found' }); return; }
    if (isError(err, 'NOT_A_MANAGER')) { res.status(400).json({ message: 'Selected employee does not have the Manager role' }); return; }
    if (isError(err, 'MANAGER_ALREADY_ASSIGNED')) {
      res.status(400).json({ message: 'This manager is already assigned to another department' });
      return;
    }
    next(err);
  }
};

export const deleteStructure = async (req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.deleteStructure(parseId(req.params.id));
    res.status(200).json({ message: 'Structure deleted successfully' });
  } catch (err) {
    if (isError(err, 'STRUCTURE_HAS_EMPLOYEES')) { res.status(400).json({ message: 'Cannot delete a department that has employees' }); return; }
    next(err);
  }
};

export const getWorkers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json(await adminService.getWorkers());
  } catch (err) {
    next(err);
  }
};

export const getWorkerMissions = async (req: Request<WorkerParam>, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json(await adminService.getWorkerMissions(parseId(req.params.employeeId)));
  } catch (err) {
    next(err);
  }
};

export const getManagers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json(await adminService.getManagers());
  } catch (err) {
    next(err);
  }
};