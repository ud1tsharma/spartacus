import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';

import {
  CostCenterService,
  RoutingService,
  CxDatePipe,
  EntitiesModel,
  B2BSearchConfig,
  θdiff as diff,
  θshallowEqualObjects as shallowEqualObjects,
  CostCenter,
} from '@spartacus/core';

@Component({
  selector: 'cx-cost-center-list',
  templateUrl: './cost-center-list.component.html',
})
export class CostCenterListComponent implements OnInit {
  constructor(
    protected routingService: RoutingService,
    protected costCentersService: CostCenterService,
    protected cxDate: CxDatePipe
  ) {}

  costCentersList$: Observable<any>;
  protected queryParams$: Observable<B2BSearchConfig>;

  protected defaultQueryParams$: B2BSearchConfig = {
    sort: 'byName',
    currentPage: 0,
    pageSize: 5,
  };

  ngOnInit(): void {
    this.queryParams$ = this.routingService
      .getRouterState()
      .pipe(map(routingData => routingData.state.queryParams));

    this.costCentersList$ = this.queryParams$.pipe(
      map(params => ({
        ...this.defaultQueryParams$,
        ...params,
      })),
      distinctUntilChanged(shallowEqualObjects),
      map(this.normalizeQueryParams),
      tap(params => this.costCentersService.loadCostCenters(params)),
      switchMap(params =>
        this.costCentersService.getList(params).pipe(
          filter(Boolean),
          map((costCentersList: EntitiesModel<CostCenter>) => ({
            sorts: costCentersList.sorts,
            pagination: costCentersList.pagination,
            costCentersList: costCentersList.values.map(costCenter => ({
              code: costCenter.code,
              name: costCenter.name,
              currency: costCenter.currency && costCenter.currency.isocode,
              parentUnit: costCenter.unit && costCenter.unit.name,
              orgUnitId: costCenter.unit && costCenter.unit.uid,
            })),
          }))
        )
      )
    );
  }

  changeSortCode(sort: string): void {
    this.updateQueryParams({ sort });
  }

  pageChange(currentPage: number): void {
    this.updateQueryParams({ currentPage });
  }

  protected updateQueryParams(newParams: Partial<B2BSearchConfig>): void {
    this.queryParams$
      .pipe(
        map(params =>
          diff(this.defaultQueryParams$, { ...params, ...newParams })
        ),
        take(1)
      )
      .subscribe((params: Partial<B2BSearchConfig>) => {
        this.routingService.go(
          {
            cxRoute: 'costCenters',
          },
          { ...params }
        );
      });
  }

  protected normalizeQueryParams({
    sort,
    currentPage,
    pageSize,
  }): B2BSearchConfig {
    return {
      sort,
      currentPage: parseInt(currentPage, 10),
      pageSize: parseInt(pageSize, 10),
    };
  }
}