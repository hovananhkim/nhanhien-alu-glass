'use client'

import type { ReactNode } from 'react'
import type { Employee } from '@/lib/employees'
import { t } from '@/lib/translations'

interface Props {
  feedback?: ReactNode
  employees: Employee[]
  onAdd: () => void
  onEdit: (employee: Employee) => void
}

export default function EmployeesTable({ employees, onAdd, onEdit, feedback }: Props) {
  return <>
    <div className="admin-page-header">
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">{t('admin.employees.table.title')}</h1>
        <p className="text-stone-400 text-sm mt-1">{t('admin.employees.table.count').replace('{count}', String(employees.length))}</p>
      </div>
      <button onClick={onAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <svg aria-hidden="true" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        {t('admin.employees.table.add')}
      </button>
    </div>
    {feedback}
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th scope="col" className="text-left px-6 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider">{t('admin.employees.table.name')}</th>
              <th scope="col" className="text-left px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden md:table-cell">{t('admin.employees.table.position')}</th>
              <th scope="col" className="text-left px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden lg:table-cell">{t('admin.employees.table.phone')}</th>
              <th scope="col" className="text-left px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell">{t('admin.employees.table.dailyRate')}</th>
              <th scope="col" className="text-left px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider">{t('admin.employees.table.status')}</th>
              <th scope="col" className="text-right px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider">{t('admin.employees.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {employees.map(employee => <tr key={employee.id} className="hover:bg-stone-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div aria-hidden="true" className="w-12 h-12 rounded-lg bg-stone-100 shrink-0 flex items-center justify-center text-sm font-medium text-stone-500">
                    {employee.name.trim().split(/\s+/).slice(-2).map(part => part[0]).join('').toLocaleUpperCase('vi')}
                  </div>
                  <div>
                    <button onClick={() => onEdit(employee)} className="font-medium text-sm text-charcoal-800 text-left hover:underline">{employee.name}</button>
                    <div className="text-xs text-stone-400 mt-0.5">{employee.position || t('admin.employees.table.noPosition')}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 hidden md:table-cell">
                {employee.position ? <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-medium">{employee.position}</span> : <span className="text-stone-300">{t('admin.employees.table.notProvided')}</span>}
              </td>
              <td className="px-4 py-4 text-sm text-charcoal-700 hidden lg:table-cell">{employee.phone || <span className="text-stone-300">{t('admin.employees.table.notProvided')}</span>}</td>
              <td className="px-4 py-4 text-sm text-charcoal-700 whitespace-nowrap hidden sm:table-cell">{employee.dailyRate.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
              <td className="px-4 py-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${employee.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{employee.isActive ? t('admin.employees.table.active') : t('admin.employees.table.inactive')}</span>
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onEdit(employee)} title={t('admin.employees.table.editProfile').replace('{name}', () => employee.name)} aria-label={t('admin.employees.table.editProfile').replace('{name}', () => employee.name)} className="p-1.5 text-stone-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50">
                    <svg aria-hidden="true" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {employees.length === 0 && <div className="py-20 text-center text-stone-400">
        <p className="font-medium text-charcoal-600">{t('admin.employees.table.emptyTitle')}</p>
        <p className="text-sm mt-1">{t('admin.employees.table.emptyDescription')}</p>
      </div>}
    </div>
  </>
}
