import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable, Subject, map, switchMap, tap, timer } from 'rxjs';
import { JobOffer } from '../Model/JobOffer';
import { FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { Page } from '../Model/Page';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class JobService {
dancerId: number=9;
  private baseUrl = 'http://localhost:8082/api'; // Base URL of your backend
  public dataForm!:FormGroup;
  private newJobOfferSubject: Subject<JobOffer> = new Subject<JobOffer>();

  constructor(private httpClient: HttpClient, private cookieService:CookieService) { }
  addJobOffer(formData: FormData, recruiterId: number): Observable<JobOffer> {
    const url = `${this.baseUrl}/job/addOffer?recruiterId=${recruiterId}`;
    return this.httpClient.post(url, formData).pipe(
      map((response: any) => response as JobOffer), // Transform the response into a JobOffer
      tap((newJobOffer: JobOffer) => {
        this.newJobOfferSubject.next(newJobOffer); // Emit the new job offer
      })
    );
  }

  // Observable to subscribe to new job offers
  getNewJobOffers(): Observable<JobOffer> {
    return this.newJobOfferSubject.asObservable();
  }

  checkForNotifications(): Observable<boolean> {
    // Set an interval to check for notifications every 10 seconds
    return timer(0, 10000).pipe(
      switchMap(() => this.httpClient.get<any>(`${this.baseUrl}/job/checkNotifications`)),
      map(response => response.hasNotifications)
    );
  }

  getJobOffer(idr: number): Observable<JobOffer> {
    return this.httpClient.get<JobOffer>(`${this.baseUrl}/job/offer/${idr}`);
  }

  getJobOffers(keyword?: string, location?: string, page: number = 0, size: number = 3): Observable<Page<JobOffer>> {
    // Construct the URL with the provided criteria
    const url = `${this.baseUrl}/job/getoffer`;

    // Construct the parameters object with the provided criteria
    const params: any = {
      page: page.toString(),
      size: size.toString()
  };    if (keyword) {
      params.keyword = keyword;
    }
    if (location) {
      params.location = location;
    }

    // Send the HTTP GET request with the constructed URL and parameters
    return this.httpClient.get<Page<JobOffer>>(url, { params });
  }
  

  updateJobOfferWithoutFile(id: number, jobOffer: JobOffer): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/job/update/${id}`, jobOffer);
  }
    public deletjob(idr:number){
    return this.httpClient.delete(`http://localhost:8082/api/job/DeletejobOffer/${idr}`);
     }
  getJobOfferPhoto(idR: number): string {
    return `${this.baseUrl}/job/ImgJobOffer/${idR}`;
  }
  getJobOffersByUserId(userId: number, page: number, size: number): Observable<Page<JobOffer>> {
    return this.httpClient.get<Page<JobOffer>>(`${this.baseUrl}/job/Page_joboffers/${userId}?page=${page}&size=${size}`);
  }
  


  searchJobOffers(title: string = '', location: string = '', page: number = 0, size: number = 3): Observable<Page<JobOffer>> {
    const url = `${this.baseUrl}/job/search?title=${title}&location=${location}&page=${page}&size=${size}`;
  
    return this.httpClient.get<Page<JobOffer>>(url)
      .pipe(
        map(page => {
          // Store search criteria in cookies after successful search
          this.cookieService.set(`keyword_${this.dancerId}`, title);
          this.cookieService.set(`location_${this.dancerId}`, location);
          return page;
        })
      );
  }
  
}