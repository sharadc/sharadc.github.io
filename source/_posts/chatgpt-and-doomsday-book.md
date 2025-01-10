---
title: ChatGPT and Doomsday Book
date: 2025-01-10 10:11:05
tags:
---
<style>
r { color: Red }
o { color: Orange }
g { color: Green }
b { color: Blue}
y { color: Yellow}
</style>

One of my close friend asked me how well can LLM understand documents such as financial plans. I never got to experiment with this, until one day I came across HN post on [Doomsday Book](https://www.crisesnotes.com/content/files/2023/12/NYFRB-2006.--Doomsday-Book--Searchable.pdf). Even though the title suggest something ominous, it is simply a tedious procedural book on what to do in case of crisis by Federal Reserve. 

If you download that PDF, you will be bombarded with bunch of versions, memoranda and redacted lines. I was still curious on what exactly it suggested, but didn’t have a lawyers brain to process the full text. So, here comes ChatGPT-O1 handy. For me an easy way to understand this space is to create imaginary scenarios and see how Fed can try to address the challenges that might arrive from the scenarios. I asked GPT to create a table with such scenarios being rows and possible Fed actions being columns.

## Plausible Federal Reserve Interventions
| **Emergency Scenario**                                                                                                                                                                          | **Section 13(3) Lending** | **Section 10B (OC 10)** | **Repo Agreement**   | **FDIC Indemnity**     | **Emergency Payment Agreement** | **Closing Foreign Branch/Agency Docs** | **Guarantee & Collateral Agreements** | **Public Statements**<br>(Resolutions, Holidays) |
| :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------------------------:| :----------------------:| :-------------------:| :---------------------:| :---------------------------------------------------------------------:| :-------------------------------------:| :------------------------------------:| :-----------------------------------------------:|
| **1. Large Non-Bank Financial Institution Collapse**<br>*e.g., major broker-dealer or money market fund faces imminent default*                                                                 | High             | Low                | Medium      | Medium            | Medium                                                        | Low                               | High                         | Medium                                  |
| **2. Major Depository Institution Insolvency**<br>*e.g., systemically important commercial bank with sudden liquidity shortfall*                                                                | Medium           | High           | Medium      | High          | Low                                                               | Low                               | Medium                       | Medium                                  |
| **3. Systemic Market Liquidity Crisis**<br>*e.g., broad market turmoil requiring Fed backstop via discount window or repo to stabilize funding*                                                 | High             | Medium         | High        | Medium        | Low                                                               | Low                               | Medium                       | High                                    |
| **4. Foreign Bank Branch Closure in New York**<br>*e.g., forced closure of a foreign bank’s NY branch (like Daiwa); liabilities & collateral must be handled*                                   | Low              | Low            | Medium      | Low               | Medium                                                        | High                          | Medium                       | Medium                                  |
| **5. Catastrophic Operational Disruption**<br>*e.g., major cyberattack or infrastructure failure leading to payment-system outages (similar to Y2K/9-11)*                                       | Low              | Low            | Low         | Low               | High                                                          | Low                               | Low                              | High                                    |
|______________________________ |______________ |______________ |______________ |______________ |______________ |______________ |______________ |______________ |

The description of the columns is given below -
- __Section 13(3) Lending__ - Allows FRBNY to lend to non-bank entities in “unusual and exigent” circumstances.
- __Section 10B (OC 10)__ - Traditional discount window lending to depository institutions.
- __Repo Agreement__ - Enables short-term liquidity by exchanging securities for cash with an agreement to repurchase. 
- __FDIC Indemnity Agreement__ - Facilitates cooperation with the FDIC when a depository institution fails, allowing the FDIC to purchase collateral or indemnify the Federal Reserve Bank.
- __Emergency Payment Agreement__ - Includes specialized account agreements and FX DvP “escrow” arrangements.
- __Closing a Foreign Branch/Agency__ - Templates and legal frameworks for winding down a foreign bank’s branch or agency in the U.S., ensuring liabilities and collateral are properly handled.
- __Guarantee & Collateral Agreements__ - Provide legal structures for parent or affiliate guarantees and perfected security interests in pledged assets.
- __Public Statements__ - Covers Board of Governors’ emergency lending resolutions, announcements of bank holidays, or other public communication that provides market reassurance or legal notice.

I was surprised that just in one prompt, SOTA LLM could actually give me a table like this through 32 pages copy pasted text of the book. Obviously, it warned me -

> This table is for demonstration purposes only and does not constitute legal advice or an exhaustive list of possible Fed interventions.

Well, despite that, this was something I could ingest in few minutes. The table give high emphasis on public perception. And tries to separate bank vs non-bank crisis. It also shows limited availability of interventions in case of Operational Disruption. As I go through this, my brain started to doubt things - how much of this is actually learned knowledge vs how much of this was actually present in the original document. 

So, trying to be as lazy as possible, while believing the AI - I asked ChatGPT to mark which of the cells are actually indicated in the document as solution. Again, with couple of prompts, I could get to the following table -

## Interventions with Prompt Presence
| **Emergency Scenario**                                                                                                                                                                          | **Section 13(3) Lending** | **Section 10B (OC 10)** | **Repo Agreement**   | **FDIC Indemnity**     | **Emergency Payment Agreement** | **Closing Foreign Branch/Agency Docs** | **Guarantee & Collateral Agreements** | **Public Statements**<br>(Resolutions, Holidays) |
|  :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------------------------:| :----------------------:| :-------------------:| :---------------------:| :---------------------------------------------------------------------:| :-------------------------------------:| :------------------------------------:| :-----------------------------------------------:|
| **1. Large Non-Bank Financial Institution Collapse**<br>*e.g., major broker-dealer or money market fund faces imminent default*                                                                 | High <br><g>(Present)            | Low <br><r>(Not)               | Medium <br><g>(Present)     | Medium <br><r>(Not)           | Medium <br><g>(Present)                                                       | Low <br><r>(Not)                              | High <br><g>(Present)                        | Medium <br><g>(Present)                                 |
| **2. Major Depository Institution Insolvency**<br>*e.g., systemically important commercial bank with sudden liquidity shortfall*                                                                | Medium <br><g>(Present)          | High <br><g>(Present)          | Medium <br><g>(Present)     | High <br><g>(Present)         | Low <br><r>(Not)                                                              | Low <br><r>(Not)                              | Medium <br><g>(Present)                      | Medium <br><g>(Present)                                 |
| **3. Systemic Market Liquidity Crisis**<br>*e.g., broad market turmoil requiring Fed backstop via discount window or repo to stabilize funding*                                                 | High <br><g>(Present)            | Medium <br><g>(Present)        | High <br><g>(Present)       | Medium <br><g>(Present)       | Low <br><r>(Not)                                                              | Low <br><r>(Not)                              | Medium <br><g>(Present)                      | High <br><g>(Present)                                   |
| **4. Foreign Bank Branch Closure in New York**<br>*e.g., forced closure of a foreign bank’s NY branch (like Daiwa); liabilities & collateral must be handled*                                   | Low <br><g>(Present)             | Low <br><g>(Present)           | Medium <br><g>(Present)     | Low <br><r>(Not)              | Medium <br><g>(Present)                                                       | High <br><g>(Present)                         | Medium <br><g>(Present)                      | Medium <br><g>(Present)                                 |
| **5. Catastrophic Operational Disruption**<br>*e.g., major cyberattack or infrastructure failure leading to payment-system outages (similar to Y2K/9-11)*                                       | Low <br><g>(Present)             | Low <br><g>(Present)           | Low <br><g>(Present)        | Low <br><r>(Not)              | High <br><g>(Present)                                                         | Low <br><r>(Not)                              | Low <br><r>(Not)                             | High <br><g>(Present)                                   |
|______________________________ |______________ |______________ |______________ |______________ |______________ |______________ |______________ |______________ |

## Model Biases???

Observations (*according to AI) - 
1. All non-present cells have `Low` applicability, except for one `Medium` cell
2. Five cells actually are mentioned in the document, but have `Low` applicability
3. All `High` applicable cells are mentioned in the document.

It is hard for me to say much without deeper study - (any volunteers?), but there does seem to be bias when a unmentioned solution is `Medium` applicable in the table. Also, `Low` applicability is defined by AI's understanding of this domain space. I do think that this is a cute iterative way to take into account model biases when reading the cross-product-summarization.

How would you approach this?
